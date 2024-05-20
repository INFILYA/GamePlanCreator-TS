export type TPlayer = {
  age: string | number;
  hand: string;
  height: number;
  id: string;
  name: string;
  number: number;
  photo: string;
  position: "Setter" | "Reciever" | "MBlocker" | "Opposite" | "Libero" | "none";
  reach: number;
  team: string;
  attackPipeFastBall: number[];
  attackPipeHighBall: number[];
  attackZone2FastBall: number[];
  attackZone2HighBall: number[];
  attackZone4FastBall: number[];
  attackZone4HighBall: number[];
  attackZone1FastBall: number[];
  attackZone1HighBall: number[];
  attackZoneK1FastBall: number[];
  attackZoneK1HighBall: number[];
  attackZoneKCFastBall: number[];
  attackZoneKCHighBall: number[];
  attackZoneK7FastBall: number[];
  attackZoneK7HighBall: number[];
  winPoints: number;
  loosePoints: number;
  leftInGame: number;
  attacksInBlock: number;
  plusMinusOnAttack: number;
  percentOfAttack: number;
  serviceZone1Float: number[];
  serviceZone1Jump: number[];
  serviceZone5Float: number[];
  serviceZone5Jump: number[];
  serviceZone6Float: number[];
  serviceZone6Jump: number[];
  ace: number;
  servicePlus: number;
  serviceMinus: number;
  serviceFailed: number;
  plusMinusOnService: number;
  boardPosition: number;
  efficencyAttack: number;
  efficencyService: number;
};
export type TMix = TPlayer | TTeam;
type TPlayerKeys = keyof TPlayer;
type TTeamKeys = keyof TTeam;
export type TMixInterSectionKeys = TPlayerKeys & TTeamKeys;

export type TTeam = {
  age: number;
  ace: number;
  attacksInBlock: number;
  height: number;
  id: string;
  leftInGame: number;
  logo: string;
  loosePoints: number;
  name: string;
  percentOfAttack: number;
  plusMinusOnAttack: number;
  plusMinusOnService: number;
  servicePlus: number;
  serviceMinus: number;
  serviceFailed: number;
  winPoints: number;
  startingSquad: string[];
  efficencyAttack: number;
  efficencyService: number;
};

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

export type TAttackDiagramm = {
  winPoints: number;
  leftInGame: number;
  attacksInBlock: number;
  loosePoints: number;
};
export type TServiceDiagramm = {
  ace: number;
  servicePlus: number;
  serviceMinus: number;
  serviceFailed: number;
};

export type TDiagramm = TAttackDiagramm | TServiceDiagramm;

export type TZoneStates = {
  zone: string;
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
