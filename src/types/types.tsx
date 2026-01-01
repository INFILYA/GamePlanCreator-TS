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

export type TDiagrammWithoutBlock = TAttackDiagramm &
  TServiceDiagramm &
  TReceptionDiagramm;

export type TTeam = TPartTeam & TDiagramm;
export type TMixKeys = keyof TMix;

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
  setterBoardPosition: number;
  zoneOfAttack: number;
};

export type TMix = TPlayer | TTeam;
type TPlayerKeys = keyof TPlayer;
type TTeamKeys = keyof TTeam;
export type TMixInterSectionKeys = TPlayerKeys & TTeamKeys;
export type TSetterPosition = { setterBoardPosition: number };
export type TPlayerAndSetterPosition = TPlayer & TSetterPosition;

export type TSectionWrapper = {
  className?: string;
  backGround?: React.ReactNode;
  children: React.ReactNode;
};

export type TDistributionZones = {
  1: TDiagramm;
  2: TDiagramm;
  3: TDiagramm;
  4: TDiagramm;
  5: TDiagramm;
  6: TDiagramm;
};

export type TZoneStates = {
  zone: "S1" | "S6" | "S5" | "A1" | "A2" | "A4" | "AP" | "AK1" | "AKC" | "AK7";
  active: boolean;
};

export type TZoneValue = {
  [key: string]: number;
};

export type TGameStats = {
  [key: string]: TObjectStats;
};

// const sets = "Set 1" || "Set 2" || "Set 3" || "Set 4" || "Set 5 (short)" || "Set 3 (short)";
export type TObjectStats = {
  [key: string]: TGameLogStats;
};
export type TGameLogStats = TSoloRallyStats[];
export type TSoloRallyStats = {
  score: string;
  weServe: boolean;
  weWon: boolean; // Кто выиграл очко: true - мы выиграли, false - соперник выиграл
  stats: TPlayer[];
  setterBoardPosition?: number; // Позиция связующего нашей команды (для расчета plusMinusPositions)
  rivalSetterBoardPosition?: number; // Позиция связующего соперника (для отображения в таблице)
  previousRivalScore?: number; // Счет соперника до этого ралли (для отката ротации)
  rivalRotation?: number; // Ротация соперника до этого ралли (для отката)
  teamRotationBefore?: TPlayer[]; // Состояние расстановки до ротации (для отката)
};

export type TSettersPosition = { [key: number]: number };
export type TSettersPositions = { [key: number]: TSettersPosition };
