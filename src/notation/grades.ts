import type { TScoutSkill, TRallyToken } from "./types";

export type TGradeOption = {
  grade: string;
  label: string;
  statKey: string;
  color: string;
};

const gradeColors: Record<string, string> = {
  "#": "lightgreen",
  "+": "aquamarine",
  "!": "yellow",
  "-": "orange",
  "=": "orangered",
  "/": "#f9a8d4",
};

function opts(
  entries: [string, string, string][]
): TGradeOption[] {
  return entries.map(([grade, label, statKey]) => ({
    grade,
    label,
    statKey,
    color: gradeColors[grade] ?? "#e2e8f0",
  }));
}

export const SKILL_LABELS: Record<TScoutSkill, string> = {
  S: "Serve",
  R: "Pass",
  A: "Attack",
  B: "Block",
  E: "Error",
};

/** Accent color per skill (chip border / jersey badge). */
export const SKILL_DISPLAY_COLORS: Record<TScoutSkill, string> = {
  S: "#0057b8",
  R: "#7c3aed",
  A: "#dc2626",
  B: "#b45309",
  E: "#475569",
};

export function gradeColorFor(skill: TScoutSkill, grade: string): string {
  return (
    GRADES_BY_SKILL[skill].find((g) => g.grade === grade)?.color ?? "#e2e8f0"
  );
}

export function gradeLabelFor(skill: TScoutSkill, grade: string): string {
  return (
    GRADES_BY_SKILL[skill].find((g) => g.grade === grade)?.label ?? grade
  );
}

export const GRADES_BY_SKILL: Record<TScoutSkill, TGradeOption[]> = {
  S: opts([
    ["#", "Ace", "S++"],
    ["+", "They passed −", "S+"],
    ["!", "They passed !", "S!"],
    ["-", "They passed #/+", "S-"],
    ["=", "Error", "S="],
  ]),
  R: opts([
    ["#", "Perfect", "R++"],
    ["+", "Positive", "R+"],
    ["!", "Semi (3m)", "R!"],
    ["-", "Negative", "R-"],
    ["/", "Overpass", "R/"],
    ["=", "Aced", "R="],
  ]),
  A: opts([
    ["#", "Kill", "A++"],
    ["+", "Good recycle", "A+"],
    ["!", "Bad recycle", "A!"],
    ["-", "Got blocked", "A-"],
    ["=", "Error", "A="],
  ]),
  B: opts([["#", "Kill block", "blocks"]]),
  E: opts([["=", "EU", "unforcedError"]]),
};

/** Back-right court position — the server always starts in zone 1. */
export const SERVE_BOARD_POSITION = 1;

/** Front-row rotation positions (block eligible). */
export const FRONT_ROW_BOARD_POSITIONS = [2, 3, 4];

export function isFrontRow(boardPosition: number): boolean {
  return FRONT_ROW_BOARD_POSITIONS.includes(boardPosition);
}

/** Ace, kill, kill block — we won the point. */
export function isOurPointWinToken(token: TRallyToken): boolean {
  return (
    token.grade === "#" &&
    (token.skill === "S" || token.skill === "A" || token.skill === "B")
  );
}

/** Serve/attack/pass error, blocked, aced, EU — we lost the point. */
export function isOurPointLossToken(token: TRallyToken): boolean {
  if (token.skill === "E" && token.grade === "=") return true;
  if (token.skill === "R" && token.grade === "=") return true;
  if (token.skill === "S" && token.grade === "=") return true;
  if (token.skill === "A" && (token.grade === "=" || token.grade === "-")) {
    return true;
  }
  return false;
}

/** Any action that ends the rally — locks scouting UI. */
export function isTerminalRallyToken(token: TRallyToken): boolean {
  return isOurPointWinToken(token) || isOurPointLossToken(token);
}

export function hasTerminalRallyAction(tokens: TRallyToken[]): boolean {
  return tokens.some(isTerminalRallyToken);
}

export type TRallyOutcomeHints = {
  hideWeWon: boolean;
  hideWeLost: boolean;
};

export function getRallyOutcomeHints(
  tokens: TRallyToken[]
): TRallyOutcomeHints {
  const last = tokens[tokens.length - 1];
  if (!last) return { hideWeWon: false, hideWeLost: false };
  if (isOurPointWinToken(last)) return { hideWeWon: false, hideWeLost: true };
  if (isOurPointLossToken(last)) return { hideWeWon: true, hideWeLost: false };
  return { hideWeWon: false, hideWeLost: false };
}

export function getSkillsForPlayer(
  isLibero: boolean,
  weServe: boolean,
  serveRecorded: boolean,
  boardPosition: number,
  passRecorded: boolean
): TScoutSkill[] {
  if (weServe && !serveRecorded) {
    return ["S"];
  }

  if (!weServe && !passRecorded) {
    return ["R"];
  }

  if (isLibero) {
    return ["E"];
  }

  const skills: TScoutSkill[] = ["A", "E"];

  if (isFrontRow(boardPosition)) {
    skills.push("B");
  }

  return skills;
}

export function isSkillVisible(
  skill: TScoutSkill,
  weServe: boolean,
  serveRecorded: boolean,
  passRecorded: boolean
): boolean {
  if (weServe && !serveRecorded) return skill === "S";
  if (!weServe && !passRecorded) return skill === "R";
  if (weServe && serveRecorded) return skill !== "S";
  return skill !== "S";
}
