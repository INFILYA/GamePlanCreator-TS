import type { TDiagramm, TPlayer } from "../types/types";
import { emptyDiagramm } from "../utilities/functions";
import type {
  TParsedRally,
  TRallyToken,
  TAttackMetricCount,
  TRotationMetrics,
  TRotationReport,
  TScoutSkill,
} from "./types";
import { GRADES_BY_SKILL } from "./grades";

const TOKEN_REGEX = /\*(\d+)([SRABE])([#+!\/=\-]?)/g;

function statKeyFor(skill: TScoutSkill, grade: string): string | null {
  const match = GRADES_BY_SKILL[skill].find((g) => g.grade === grade);
  return match?.statKey ?? null;
}

export function parseTokensFromNotation(notation: string): TRallyToken[] {
  const tokens: TRallyToken[] = [];
  let match: RegExpExecArray | null;
  const re = new RegExp(TOKEN_REGEX.source, "g");
  while ((match = re.exec(notation)) !== null) {
    tokens.push({
      raw: match[0],
      playerNumber: match[1],
      skill: match[2] as TScoutSkill,
      grade: match[3] || "#",
    });
  }
  return tokens;
}

export function tokensToNotation(tokens: TRallyToken[]): string {
  return tokens.map((t) => t.raw).join(" ");
}

export function buildToken(
  playerNumber: string | number,
  skill: TScoutSkill,
  grade: string
): TRallyToken {
  const displayNum = String(playerNumber);
  const raw = `*${displayNum}${skill}${grade}`;
  return { raw, playerNumber: displayNum, skill, grade };
}

function emptyPlayerStatsRecord(): Record<string, number> {
  return { ...emptyDiagramm(), "R/": 0, unforcedError: 0 } as Record<
    string,
    number
  >;
}

export function applyTokenToStats(
  stats: Record<string, Record<string, number>>,
  token: TRallyToken
): void {
  const key = statKeyFor(token.skill, token.grade);
  if (!key) return;
  if (!stats[token.playerNumber]) {
    stats[token.playerNumber] = emptyPlayerStatsRecord();
  }
  stats[token.playerNumber][key] =
    (stats[token.playerNumber][key] || 0) + 1;
}

export function parseNotationToPlayerStats(
  notation: string
): Record<string, Record<string, number>> {
  const stats: Record<string, Record<string, number>> = {};
  for (const token of parseTokensFromNotation(notation)) {
    applyTokenToStats(stats, token);
  }
  return stats;
}

export function playerStatsToRallyPlayers(
  statsByNumber: Record<string, Record<string, number>>,
  roster: TPlayer[]
): TPlayer[] {
  return Object.entries(statsByNumber).map(([num, statMap]) => {
    const player = roster.find((p) => String(p.number) === String(num));
    const base = player ? { ...player } : ({ number: Number(num) } as TPlayer);
    for (const [key, val] of Object.entries(statMap)) {
      if (val) (base as Record<string, unknown>)[key] = val;
    }
    return base;
  });
}

function countTransitionAttacks(
  attackTokens: TRallyToken[],
  weServe: boolean
): TAttackMetricCount {
  let transitionTokens: TRallyToken[];
  if (weServe) {
    transitionTokens = attackTokens;
  } else if (
    attackTokens.length > 0 &&
    attackTokens[0].grade !== "#"
  ) {
    transitionTokens = attackTokens.slice(1);
  } else {
    transitionTokens = [];
  }
  return {
    attempts: transitionTokens.length,
    made: transitionTokens.filter((t) => t.grade === "#").length,
  };
}

export function analyzeRally(
  notation: string,
  weServe: boolean,
  _weWon: boolean
): TParsedRally {
  const tokens = parseTokensFromNotation(notation);
  const playerStats = parseNotationToPlayerStats(notation);
  const attackTokens = tokens.filter((t) => t.skill === "A");
  const firstAttack = attackTokens[0] ?? null;
  const firstGrade = firstAttack?.grade ?? null;
  const isReceiveRally = !weServe;
  const fbSideOutMade = isReceiveRally && firstGrade === "#";
  const transitionAttacks = countTransitionAttacks(attackTokens, weServe);

  return {
    playerStats,
    firstAttackGrade: firstGrade,
    attackCount: attackTokens.length,
    isReceiveRally,
    fbSideOutMade,
    transitionAttacks,
  };
}

/** Display-only: they served, we won, no scout actions recorded → their serve error. */
export function isOpponentServeErrorRally(rally: {
  weServe: boolean;
  weWon: boolean;
  notation?: string;
}): boolean {
  return !rally.weServe && rally.weWon && !rally.notation?.trim();
}

function emptyRotationBucket(): TRotationMetrics {
  return {
    plusMinus: 0,
    firstBallSideOut: { made: 0, attempts: 0 },
    transition: { made: 0, attempts: 0 },
  };
}

type TRallyForMetrics = {
  score: string;
  weServe: boolean;
  weWon?: boolean;
  notation?: string;
  stats?: TPlayer[];
  setterBoardPosition?: number;
};

export function computeRotationReport(
  rallies: TRallyForMetrics[]
): TRotationReport {
  const report: TRotationReport = {};
  for (let pos = 1; pos <= 6; pos++) {
    report[String(pos)] = emptyRotationBucket();
  }

  let previousScore = "0 - 0";

  for (const rally of rallies) {
    if (rally.score === "0 - 0") continue;

    const rot = rally.setterBoardPosition;
    if (!rot || rot < 1 || rot > 6) {
      previousScore = rally.score;
      continue;
    }
    const key = String(rot);
    const weWon =
      rally.weWon !== undefined
        ? rally.weWon
        : (() => {
            const [my] = rally.score.split(" - ").map(Number);
            const [prevMy] = previousScore.split(" - ").map(Number);
            return my > prevMy;
          })();

    report[key].plusMinus += weWon ? 1 : -1;

    const notation =
      rally.notation ??
      (rally.stats?.length ? notationFromLegacyStats(rally.stats) : "");
    const analysis = analyzeRally(notation, rally.weServe, weWon);
    const skipSideOutMetrics = isOpponentServeErrorRally({
      weServe: rally.weServe,
      weWon,
      notation: rally.notation,
    });

    if (analysis.isReceiveRally && !skipSideOutMetrics && analysis.attackCount > 0) {
      report[key].firstBallSideOut.attempts += 1;
      if (analysis.fbSideOutMade) {
        report[key].firstBallSideOut.made += 1;
      }
    }
    const trans = analysis.transitionAttacks;
    report[key].transition.attempts += trans.attempts;
    report[key].transition.made += trans.made;

    previousScore = rally.score;
  }

  return report;
}

export function pct(made: number, attempts: number): string {
  if (attempts === 0) return "—";
  return `${Math.round((made / attempts) * 100)}%`;
}

/** Legacy rallies: build pseudo-notation from stats array for metrics. */
export function notationFromLegacyStats(players: TPlayer[]): string {
  const parts: string[] = [];
  const skillMap: [TScoutSkill, string, string[]][] = [
    ["S", "S", ["S++", "S+", "S!", "S-", "S="]],
    ["R", "R", ["R++", "R+", "R!", "R-", "R=", "R/"]],
    ["A", "A", ["A++", "A+", "A!", "A-", "A="]],
  ];
  for (const player of players) {
    const num = String(player.number);
    for (const [, , keys] of skillMap) {
      for (const statKey of keys) {
        const count = Number((player as Record<string, unknown>)[statKey] || 0);
        const gradeMap: Record<string, string> = {
          "S++": "#",
          "S+": "+",
          "S!": "!",
          "S-": "-",
          "S=": "=",
          "R++": "#",
          "R+": "+",
          "R!": "!",
          "R-": "-",
          "R=": "=",
          "R/": "/",
          "A++": "#",
          "A+": "+",
          "A!": "!",
          "A-": "-",
          "A=": "=",
        };
        const grade = gradeMap[statKey];
        const skill = statKey[0] as TScoutSkill;
        for (let i = 0; i < count; i++) {
          parts.push(`*${num}${skill}${grade}`);
        }
      }
    }
    const blocks = Number(player.blocks || 0);
    for (let i = 0; i < blocks; i++) parts.push(`*${num}B#`);
    const eu = Number(player.unforcedError || 0);
    for (let i = 0; i < eu; i++) parts.push(`*${num}E=`);
  }
  return parts.join(" ");
}

export function mergeParsedIntoDiagramm(
  target: TDiagramm,
  parsed: Record<string, number>
): TDiagramm {
  const result = { ...target, "R/": 0 } as TDiagramm & { "R/"?: number };
  for (const [key, val] of Object.entries(parsed)) {
    if (key === "R/") {
      (result as Record<string, number>)["R/"] =
        ((result as Record<string, number>)["R/"] || 0) + val;
    } else if (key in result) {
      (result as Record<string, number>)[key] =
        ((result as Record<string, number>)[key] || 0) + val;
    }
  }
  return result;
}
