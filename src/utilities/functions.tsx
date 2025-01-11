import { CSSProperties } from "react";
import {
  TDiagramm,
  TMix,
  TMixKeys,
  TPlayer,
  TSettersPosition,
  TSettersPositions,
} from "../types/types";

export const later = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export function jusName(arg: TMix) {
  const newObj = {} as TMix;
  for (const key in arg) {
    if (key === "name") {
      newObj[key] = arg[key];
    } else continue;
  }
  return newObj;
}

export function getFromLocalStorage(name: string) {
  const value = localStorage.getItem(name);
  if (!value) return null;
  return JSON.parse(value);
}
export function upgradeAge<T extends TMix>(player: T): T {
  if (typeof player.age === "number") return player;
  const age1 = new Date().getTime();
  const age2 = Date.parse(player.age);
  const newAge = Math.floor((age1 - age2) / (1000 * 60 * 60 * 24 * 365));
  const newPlayer = { ...player, age: newAge };
  return newPlayer;
}
export function reduce(arr: number[], sum = 0): number {
  const result = arr.reduce((a, b) => a + b, sum);
  return result;
}

export function firstLetterCapital(string: string): string {
  if (string.length === 0) return string;
  const firstLetter = string.charAt(0);
  const wordWithoutFirstLetter = string.slice(1);
  const newWord = firstLetter.toUpperCase() + wordWithoutFirstLetter;
  return newWord;
}

export const isBoardFull = (arr: TPlayer[]) => {
  return arr.every((option) => checkNumbers(option.boardPosition));
};

export function checkNumbers(element: number): boolean {
  return typeof element !== "number";
}

export function compare<T>(a: T, b: T): number {
  if (a < b) {
    return -1;
  }
  if (a > b) {
    return 1;
  }
  return 0;
}

export const positions = [3, 2, 1, 4, 5, 0];
export const zones = [4, 3, 2, 5, 6, 1];

export const emtyTeam = {
  winPoints: 0,
  loosePoints: 0,
  leftInGame: 0,
  attacksInBlock: 0,
};

export const emptyPlayer: TPlayer = {
  age: 0,
  hand: "",
  height: 0,
  id: "",
  name: "",
  number: 0,
  photo: "",
  position: "none",
  reach: 0,
  team: "",
  APQ: [],
  APH: [],
  A2Q: [],
  A2H: [],
  A4Q: [],
  A4H: [],
  A1Q: [],
  A1H: [],
  AK1Q: [],
  AKCQ: [],
  AK7Q: [],
  "A++": 0,
  "A+": 0,
  "A=": 0,
  "A!": 0,
  "A-": 0,
  S1F: [],
  S1J: [],
  S5F: [],
  S5J: [],
  S6F: [],
  S6J: [],
  "S++": 0,
  "S+": 0,
  "S!": 0,
  "S-": 0,
  "S=": 0,
  "R++": 0,
  "R+": 0,
  "R!": 0,
  "R-": 0,
  "R=": 0,
  blocks: 0,
  boardPosition: 0,
  setterBoardPosition: 0,
  zoneOfAttack: 0,
};

export const backGroundYellow = { backgroundColor: "#FFD700", color: "#0057B8" };
export const backGroundBlue = { backgroundColor: "#0057B8", color: "#FFD700" };

export function correctPositions(number: number): number {
  return positions[number];
}
export function correctZones(number: number): number {
  return zones[number];
}

export const emptyPlayers: TPlayer[] = Array(6)
  .fill(emptyPlayer)
  .map((user, index) => ({ ...user, boardPosition: correctPositions(index) }));

export const myEmptyPlayers: TPlayer[] = Array(6)
  .fill(emptyPlayer)
  .map((user, index) => ({ ...user, boardPosition: correctPositions(index) }));

export function setStyleForEfficency(params: number): CSSProperties {
  if (params === 0) {
    return { color: "black" };
  }
  return {
    color: params >= 30 ? "green" : params <= 30 && params >= 25 ? "black" : "red",
    backgroundColor: params >= 30 ? "palegreen" : params <= 30 && params >= 25 ? "" : "pink",
    fontWeight: params >= 30 ? "600" : params <= 30 && params >= 25 ? "" : 600,
  };
}

export function setStyleForPercent(params: number): CSSProperties {
  if (params === 0) {
    return { color: "black" };
  }
  return {
    color: params >= 50 ? "green" : params <= 50 && params >= 40 ? "black" : "red",
    backgroundColor: params >= 50 ? "palegreen" : params <= 50 && params >= 40 ? "" : "pink",
    fontWeight: params >= 50 ? "600" : params <= 50 && params >= 40 ? "" : 600,
  };
}

export function setStyle(params: number): CSSProperties {
  if (params === 0) return {};
  return {
    color: params >= 0 ? "" : "orangered",
    backgroundColor: params >= 0 ? "" : "pink",
    fontWeight: params >= 0 ? "" : 600,
  };
}

export function isFieldExist(arg: number): number {
  return arg ? arg : 0;
}
export function getSumofAttacks(obj: TDiagramm) {
  const totalAtt = [
    isFieldExist(obj["A++"]),
    isFieldExist(obj["A+"]),
    isFieldExist(obj["A!"]),
    isFieldExist(obj["A-"]),
    isFieldExist(obj["A="]),
  ];
  const sumOfTotalAtt = totalAtt.reduce((a, b) => a + b, 0);
  return +sumOfTotalAtt;
}

export function getSumofReceptions(obj: TDiagramm) {
  const totalRec = [
    isFieldExist(obj["R++"]),
    isFieldExist(obj["R+"]),
    isFieldExist(obj["R!"]),
    isFieldExist(obj["R-"]),
    isFieldExist(obj["R="]),
  ];
  const sumOfTotalRec = totalRec.reduce((a, b) => a + b, 0);
  return +sumOfTotalRec;
}

export function getServiceEfficency(obj: TDiagramm) {
  const totalService = [obj["S++"], obj["S+"], obj["S-"], obj["S="], obj["S!"]];
  const sumOfTotalService = totalService.reduce((a, b) => a + b, 0);
  if (sumOfTotalService === 0) return 0;
  const efficencyService = +((getPlusMinusService(obj) / sumOfTotalService) * 100);
  return Math.round(efficencyService);
}

export function gerPercentOfPerfectReception(obj: TDiagramm) {
  if (getSumofReceptions(obj) === 0) return 0;
  const percents = +((isFieldExist(obj["R++"]) / getSumofReceptions(obj)) * 100);
  return Math.round(percents);
}
export function gerPercentOfPositiveReception(obj: TDiagramm) {
  if (getSumofReceptions(obj) === 0) return 0;
  const percents = +(
    ((isFieldExist(obj["R++"]) + isFieldExist(obj["R+"])) / getSumofReceptions(obj)) *
    100
  );
  return Math.round(percents);
}

export function gerPercentOfAttack(obj: TDiagramm) {
  if (getSumofAttacks(obj) === 0) return 0;
  const percents = +((isFieldExist(obj["A++"]) / getSumofAttacks(obj)) * 100);
  return Math.round(percents);
}

export function getAttackEfficency(obj: TDiagramm) {
  if (getSumofAttacks(obj) === 0) return 0;
  const efficencyAttack = +((getPlusMinusAttack(obj) / getSumofAttacks(obj)) * 100);
  return Math.round(efficencyAttack);
}

export function getPlusMinusService(obj: TDiagramm) {
  return isFieldExist(obj["S++"]) - isFieldExist(obj["S="]);
}
export function getPlusMinusAttack(obj: TDiagramm) {
  return isFieldExist(obj["A++"]) - (isFieldExist(obj["A-"]) + isFieldExist(obj["A="]));
}

export function calculateTotalofActions(obj: TMix[]): TDiagramm {
  function getCalculation( type: keyof TMix ):number {
    return obj.reduce((acc, val) => (acc += isFieldExist(val[type]  as number)), 0);  
 } 
  const sumOfAllPlayersSoloGamesStats = {
    "A=": getCalculation("A="),
    "A++": getCalculation("A++"),
    "A+": getCalculation("A+"),
    "A!": getCalculation("A!"),
    "A-": getCalculation("A-"),
    "S++": getCalculation("S++"),
    "S!": getCalculation("S!"),
    "S=": getCalculation("S="),
    "S+": getCalculation("S+"),
    "S-": getCalculation("S-"),
    "R++": getCalculation("R++"),
    "R+": getCalculation("R+"),
    "R!": getCalculation("R!"),
    "R-": getCalculation("R-"),
    "R=": getCalculation("R="),
    blocks: getCalculation("blocks"),
  };
  return sumOfAllPlayersSoloGamesStats;
}

export function calculateTotalofActionsV2(obj: TMix[], name: string): TMix {
  function getCalculation( type: keyof TMix ):number {
     return obj.filter((a) => a.name === name).reduce((acc, val) => (acc += isFieldExist(val[type]  as number)), 0);  
  }  
  const sumOfAllPlayersSoloGamesStats = {
    "A=": getCalculation("A="),
    "A++": getCalculation("A++"),
    "A+": getCalculation("A+"),
    "A!": getCalculation("A!"),
    "A-": getCalculation("A-"),
    "S++": getCalculation("S++"),
    "S!": getCalculation("S!"),
    "S=": getCalculation("S="),
    "S+": getCalculation("S+"),
    "S-": getCalculation("S-"),
    "R++": getCalculation("R++"),
    "R+": getCalculation("R+"),
    "R!": getCalculation("R!"),
    "R-": getCalculation("R-"),
    "R=": getCalculation("R="),
    blocks: getCalculation("blocks"),
    name: name,
  };
  return sumOfAllPlayersSoloGamesStats as TMix;
}

export function preparePlayerToSoloGameV3(obj: TMix): TMix {
  const sumOfAllPlayersSoloGamesStats = {
    "A=": isFieldExist(obj["A="]),
    "A++": isFieldExist(obj["A++"]),
    "A+": isFieldExist(obj["A+"]),
    "A!": isFieldExist(obj["A!"]),
    "A-": isFieldExist(obj["A-"]),
    "S++": isFieldExist(obj["S++"]),
    "S!": isFieldExist(obj["S!"]),
    "S=": isFieldExist(obj["S="]),
    "S+": isFieldExist(obj["S+"]),
    "S-": isFieldExist(obj["S-"]),
    "R++": isFieldExist(obj["R++"]),
    "R+": isFieldExist(obj["R+"]),
    "R!": isFieldExist(obj["R!"]),
    "R-": isFieldExist(obj["R-"]),
    "R=": isFieldExist(obj["R="]),
    blocks: isFieldExist(obj.blocks),
    name: obj.name,
  };
  return sumOfAllPlayersSoloGamesStats as TMix;
}

export function preparePlayerToSoloGame(obj: TMix): TMix {
  const soloGamePlayerStats = { ...obj };
  soloGamePlayerStats["A++"] = 0;
  soloGamePlayerStats["A+"] = 0;
  soloGamePlayerStats["A="] = 0;
  soloGamePlayerStats["A!"] = 0;
  soloGamePlayerStats["A-"] = 0;
  soloGamePlayerStats["S++"] = 0;
  soloGamePlayerStats["S!"] = 0;
  soloGamePlayerStats["S="] = 0;
  soloGamePlayerStats["S-"] = 0;
  soloGamePlayerStats["S+"] = 0;
  soloGamePlayerStats["R++"] = 0;
  soloGamePlayerStats["R!"] = 0;
  soloGamePlayerStats["R="] = 0;
  soloGamePlayerStats["R-"] = 0;
  soloGamePlayerStats["R+"] = 0;
  soloGamePlayerStats.blocks = 0;
  return soloGamePlayerStats;
}

export function emptyDiagramm(): TDiagramm {
  const soloGamePlayerStats = {} as TDiagramm;
  soloGamePlayerStats["A++"] = 0;
  soloGamePlayerStats["A+"] = 0;
  soloGamePlayerStats["A="] = 0;
  soloGamePlayerStats["A!"] = 0;
  soloGamePlayerStats["A-"] = 0;
  soloGamePlayerStats["S++"] = 0;
  soloGamePlayerStats["S!"] = 0;
  soloGamePlayerStats["S="] = 0;
  soloGamePlayerStats["S-"] = 0;
  soloGamePlayerStats["S+"] = 0;
  soloGamePlayerStats["R++"] = 0;
  soloGamePlayerStats["R!"] = 0;
  soloGamePlayerStats["R="] = 0;
  soloGamePlayerStats["R-"] = 0;
  soloGamePlayerStats["R+"] = 0;
  soloGamePlayerStats.blocks = 0;
  return soloGamePlayerStats;
}

export function forSoloGameStat(obj: TPlayer): TPlayer {
  const newObj = {} as TPlayer;
  const soloGamePlayerStats = { ...obj };
  newObj.name = soloGamePlayerStats.name;
  for (const key in soloGamePlayerStats) {
    if (
      (key === "blocks" ||
        key === "setterBoardPosition" ||
        key === "boardPosition" ||
        key === "zoneOfAttack" ||
        key === "A-" ||
        key === "A=" ||
        key === "A+" ||
        key === "A++" ||
        key === "A!" ||
        key === "S++" ||
        key === "S=" ||
        key === "S!" ||
        key === "S+" ||
        key === "S-" ||
        key === "R++" ||
        key === "R=" ||
        key === "R!" ||
        key === "R+" ||
        key === "R-") &&
      soloGamePlayerStats[key] !== 0
    ) {
      newObj[key] = soloGamePlayerStats[key];
    } else continue;
  }
  return { ...newObj, position: obj.position };
}

export const rows = [
  ["=", "orangered"],
  ["-", "orange"],
  ["!", "yellow"],
  ["+", "aquamarine"],
  ["++", "lightgreen"],
] as const;

export const categorys = [
  "+/-",
  "R=",
  "R-",
  "R!",
  "R+",
  "R++",
  "R#%",
  "R+%",
  "A=",
  "A-",
  "A!",
  "A+",
  "A++",
  "Effic",
  "A%",
  "S=",
  "S-",
  "S!",
  "S+",
  "S++",
  "blocks",
] as TMixKeys[];

export const listOfOpponents18U = [
  "MAC Titanium", //
  "Maverick Mustangs", //
  "Toronto Thunderbolts Smash Shihua", //
  "Ottawa Fusion Purple Matt", //
  "Kingston Rock Obsidian", //
  "FCVC Baobab", //
  "Scorpions Legion", //
  "Pakmen Gold Jessy", //
  "Pakmen Gold Omar", //
  "Durham Attack Power", //
  "KW Preds Invictus", //
  "Niagara Rapids Alliance", //
  "Storm Voltage", //
  "Phoenix Skybirds", //
  "Durham Attack Blast", //
  "REACH Rampage", //
  "Pakmen Black Lam", //
  "Thundercats Bushido 17U", //
  "Maverick Rangers",
  "Thundercats Ronin",
  "Ancaster Lions",
  "Barrie Elites - Phoenix", //
  "Barrie Elites - Frost",
  "Bluewater Ballistix", //
];

export const listOfOpponents16U = [
  "Pakmen Black", //
  "Reach Flow", //
  "Storm Bolts", //
  "Venom Mambas", //
  "Scorpions Apex", //
  "Reach Impact", //
  "Reach Elevate", //
  "Mac Platinum", //
  "Forest City", //
  "Venom Vipers", //
  "KW Preds Reign", //
  "Pakmen Gold Saad", //
  "Niagara Rapids Shockwave", //
  "Reach Flow", //
  "FCVC Icarus", //
  "Halton Hurricane Category 6", // 
  "Hurricanes Category 7 Stef",
  "KW Preds Summit",
  "Durham Attack Impact",
  "Leaside Knights",
  "Flames Inferno"
];

export const P1 = {
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 6,
  6: 5,
};
export const P2 = {
  1: 5,
  2: 2,
  3: 4,
  4: 3,
  5: 1,
  6: 6,
};
export const P3 = {
  1: 6,
  2: 3,
  3: 2,
  4: 4,
  5: 5,
  6: 1,
};
export const P4 = {
  1: 1,
  2: 4,
  3: 3,
  4: 2,
  5: 6,
  6: 5,
};

export const P5 = {
  1: 5,
  2: 2,
  3: 4,
  4: 3,
  5: 1,
  6: 6,
};

export const P6 = {
  1: 6,
  2: 3,
  3: 2,
  4: 4,
  5: 5,
  6: 1,
};

const setterPositions: TSettersPositions = {
  1: P1,
  2: P2,
  3: P3,
  4: P4,
  5: P5,
  6: P6,
};

export function spikersPositions(position: number): TSettersPosition {
  return setterPositions[position];
}
