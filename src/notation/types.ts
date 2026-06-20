export type TScoutSkill = "S" | "R" | "A" | "B" | "E";

export type TRallyToken = {
  raw: string;
  playerNumber: string;
  skill: TScoutSkill;
  grade: string;
};

export type TRotationMetrics = {
  plusMinus: number;
  firstBallSideOut: { made: number; attempts: number };
  transition: { made: number; attempts: number };
};

export type TRotationReport = Record<string, TRotationMetrics>;

export type TAttackMetricCount = { made: number; attempts: number };

export type TParsedRally = {
  playerStats: Record<string, Record<string, number>>;
  firstAttackGrade: string | null;
  attackCount: number;
  isReceiveRally: boolean;
  /** First attack after receive was a kill (#). */
  fbSideOutMade: boolean;
  /** Per-attack transition: A# = made, all other A grades = fail. */
  transitionAttacks: TAttackMetricCount;
};
