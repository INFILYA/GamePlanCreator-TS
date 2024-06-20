export type TAttackDiagramm = {
  "A++": number;
  "A+": number;
  "A=": number;
  "A!": number;
  AB: number;
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

export type TTeam = {
  age: number;
  height: number;
  id: string;
  logo: string;
  name: string;
  startingSquad: string[];
  "S++": number;
  "S+": number;
  "S!": number;
  "S-": number;
  "S=": number;
  "A++": number;
  "A+": number;
  "A=": number;
  "A!": number;
  AB: number;
  "R++": number;
  "R+": number;
  "R!": number;
  "R-": number;
  "R=": number;
  blocks: number;
};

export type TPlayer = {
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
  "A++": number;
  "A+": number;
  "A=": number;
  "A!": number;
  AB: number;
  S1F: number[];
  S1J: number[];
  S5F: number[];
  S5J: number[];
  S6F: number[];
  S6J: number[];
  "S++": number;
  "S+": number;
  "S!": number;
  "S-": number;
  "S=": number;
  "R++": number;
  "R+": number;
  "R!": number;
  "R-": number;
  "R=": number;
  blocks: number;
  boardPosition: number;
};

// export type TPlayerV2 = {
//   age: string | number;
//   hand: string;
//   height: number;
//   id: string;
//   name: string;
//   number: number;
//   photo: string;
//   position: "Setter" | "Reciever" | "MBlocker" | "Opposite" | "Libero" | "none";
//   reach: number;
//   team: string;
//   attackPipeFastBall: number[];
//   attackPipeHighBall: number[];
//   attackZone2FastBall: number[];
//   attackZone2HighBall: number[];
//   attackZone4FastBall: number[];
//   attackZone4HighBall: number[];
//   attackZone1FastBall: number[];
//   attackZone1HighBall: number[];
//   attackZoneK1FastBall: number[];
//   attackZoneK1HighBall: number[];
//   attackZoneKCFastBall: number[];
//   attackZoneKCHighBall: number[];
//   attackZoneK7FastBall: number[];
//   attackZoneK7HighBall: number[];
//   winPoints: number;
//   loosePoints: number;
//   leftInGame: number;
//   attacksInBlock: number;
//   serviceZone1Float: number[];
//   serviceZone1Jump: number[];
//   serviceZone5Float: number[];
//   serviceZone5Jump: number[];
//   serviceZone6Float: number[];
//   serviceZone6Jump: number[];
//   ace: number;
//   servicePlus: number;
//   serviceMinus: number;
//   serviceFailed: number;
//   boardPosition: number;
// };
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

export type TDiagramm = TAttackDiagramm | TServiceDiagramm;

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
  [key: string]: TPlayer[];
};
