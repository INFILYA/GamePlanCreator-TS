import { CSSProperties } from "react";
import { TMix, TPlayer } from "../types/types";

export const later = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

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
  attackPipeFastBall: [],
  attackPipeHighBall: [],
  attackZone2FastBall: [],
  attackZone2HighBall: [],
  attackZone4FastBall: [],
  attackZone4HighBall: [],
  attackZone1FastBall: [],
  attackZone1HighBall: [],
  attackZoneK1FastBall: [],
  attackZoneK1HighBall: [],
  attackZoneKCFastBall: [],
  attackZoneKCHighBall: [],
  attackZoneK7FastBall: [],
  attackZoneK7HighBall: [],
  winPoints: 0,
  loosePoints: 0,
  leftInGame: 0,
  attacksInBlock: 0,
  plusMinusOnAttack: 0,
  percentOfAttack: 0,
  serviceZone1Float: [],
  serviceZone1Jump: [],
  serviceZone5Float: [],
  serviceZone5Jump: [],
  serviceZone6Float: [],
  serviceZone6Jump: [],
  aces: 0,
  servicePlus: 0,
  serviceMinus: 0,
  serviceFailed: 0,
  plusMinusOnService: 0,
  boardPosition: 0,
  efficencyAttack: 0,
  efficencyService: 0,
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

export function setStyleForEfficency(params: number): CSSProperties {
  return { color: params >= 30 ? "green" : params <= 30 && params >= 25 ? "black" : "red" };
}

export function setStyleForPercent(params: number): CSSProperties {
  return { color: params >= 50 ? "green" : params <= 50 && params >= 45 ? "black" : "red" };
}

export function setStyle(params: number): CSSProperties {
  if (params === 0) return {};
  return { color: params >= 0 ? "green" : "orangered" };
}

export function getAttackEfficency(obj: TMix) {
  if (!("winPoints" in obj)) return 0;
  const totalAtt = [obj.winPoints, obj.leftInGame, obj.attacksInBlock, obj.loosePoints];
  const sumOfTotalAtt = totalAtt.reduce((a, b) => a + b, 0);
  if (sumOfTotalAtt === 0) return 0;
  const efficencyAttack = +((getPlusMinusAttack(obj) / sumOfTotalAtt) * 100).toFixed(1);
  return efficencyAttack;
}
export function getServiceEfficency(obj: TMix) {
  const totalService = [obj.aces, obj.servicePlus, obj.serviceMinus, obj.serviceFailed];
  const sumOfTotalService = totalService.reduce((a, b) => a + b, 0);
  if (sumOfTotalService === 0) return 0;
  const efficencyService = +((getPlusMinusService(obj) / sumOfTotalService) * 100).toFixed(1);
  return efficencyService;
}

export function getPlusMinusService(obj: TMix) {
  return obj.aces - obj.serviceFailed;
}
export function getPlusMinusAttack(obj: TMix) {
  return obj.winPoints - (obj.attacksInBlock + obj.loosePoints);
}
export function gerPercentOfAttack(obj: TMix) {
  if (!("winPoints" in obj)) return 0;
  const totalAtt = [obj.winPoints, obj.leftInGame, obj.attacksInBlock, obj.loosePoints];
  const sumOfTotalAtt = totalAtt.reduce((a, b) => a + b, 0);
  if (sumOfTotalAtt === 0) return 0;
  const percents = +((obj.winPoints / sumOfTotalAtt) * 100).toFixed(1);
  return percents;
}

export function calculateTotalofActions(obj: TMix[]) {
  const loosePoints = obj.reduce((acc, val) => (acc += val.loosePoints), 0);
  const winPoints = obj.reduce((acc, val) => (acc += val.winPoints), 0);
  const leftInTheGame = obj.reduce((acc, val) => (acc += val.leftInGame), 0);
  const attacksInBlock = obj.reduce((acc, val) => (acc += val.attacksInBlock), 0);
  const sumOfAllPlayersSoloGamesStats = {
    loosePoints: loosePoints,
    winPoints: winPoints,
    leftInGame: leftInTheGame,
    attacksInBlock: attacksInBlock,
  };
  return sumOfAllPlayersSoloGamesStats;
}

export const listOfOpponents = [
  "Choose Opponent",
  "Maverick Longhorns",
  "Pakmen Gold Jessy",
  "Pakmen Gold Omar",
  "Durham Attack Power",
  "Maverick Rangers",
  "Toronto Thunderbolts Smash",
  "FCVC Hyperion",
  "KW Preds Invictus",
  "MAC Iron",
  "Kingston Rock Black",
  "Niagara Rapids Alliance",
  "Titans Black",
  "Storm Voltage",
  "Phoenix Skybirds",
  "Scorpions Menace",
  "Unity Valour",
  "Pakmen Black Lam",
  "Leaside Lobsters",
  "Reach Rampage",
  "Barie Elites Phoenix",
  "Ottawa fusion Purple",
  "Durham Attack Blast",
  "KW Preds Wolwerines",
  "41SIX Bounce",
  "Ancaster Lions Fury",
  "Halton Hurricanes Category 8BB",
  "Niagara Rapids Crush",
  "FCVC Baobab",
  "REACH Nitro",
  "MAC Titanium",
];
