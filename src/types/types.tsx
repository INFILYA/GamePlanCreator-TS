export type TAttackDiagramm = {
  "A++": number;
  "A+": number;
  "A=": number;
  "A!": number;
  "A-": number;
};
export type TServiceDiagramm = {
  "S++": number;
  "S+": number;
  "S!": number;
  "S-": number;
  "S=": number;
};

export type TReceptionDiagramm = {
  "R++": number;
  "R+": number;
  "R!": number;
  "R-": number;
  "R=": number;
};

export type TDiagramm = TDiagrammWithoutBlock & { blocks: number };

export type TDiagrammWithoutBlock = TAttackDiagramm & TServiceDiagramm & TReceptionDiagramm;

export type TTeam = TPartTeam & TDiagramm;

export type TPartTeam = {
  age: number;
  height: number;
  id: string;
  logo: string;
  name: string;
  startingSquad: string[];
};

export type TPlayer = TPartPlayer & TDiagramm;

export type TPartPlayer = {
  age: string | number;
  hand: string;
  height: number;
  id: string;
  name: string;
  number: number;
  photo: string;
  position: "SET" | "OH" | "MB" | "OPP" | "LIB" | "none";
  reach: number;
  team: string;
  APQ: number[];
  APH: number[];
  A2Q: number[];
  A2H: number[];
  A4Q: number[];
  A4H: number[];
  A1Q: number[];
  A1H: number[];
  AK1Q: number[];
  AKCQ: number[];
  AK7Q: number[];
  S1F: number[];
  S1J: number[];
  S5F: number[];
  S5J: number[];
  S6F: number[];
  S6J: number[];
  boardPosition: number;
};

export type TMix = TPlayer | TTeam;
type TPlayerKeys = keyof TPlayer;
type TTeamKeys = keyof TTeam;
export type TMixInterSectionKeys = TPlayerKeys & TTeamKeys;

export type TSectionWrapper = {
  className?: string;
  backGround?: React.ReactNode;
  children: React.ReactNode;
};

export type TDistributionZones = {
  0: number;
  1: number;
  2: number;
  3: number;
  4: number;
};

export type TZoneStates = {
  zone: "S1" | "S6" | "S5" | "A1" | "A2" | "A4" | "AP" | "AK1" | "AKC" | "AK7";
  active: boolean;
};

export type TZoneValue = {
  [key: string]: number;
};

export type TGameStats = {
  [key: string]: TObjectStats[];
};

export type TObjectStats = {
  [key: string]: TGameLogStats;
};
export type TSoloRallyStats = { score: string; stats: TPlayer[] };
export type TGameLogStats = TSoloRallyStats[];
