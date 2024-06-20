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
  AB: 0,
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
  if (params === 0) {
    return { color: "black" };
  }
  return { color: params >= 30 ? "green" : params <= 30 && params >= 25 ? "black" : "red" };
}

export function setStyleForPercent(params: number): CSSProperties {
  if (params === 0) {
    return { color: "black" };
  }
  return { color: params >= 50 ? "green" : params <= 50 && params >= 45 ? "black" : "red" };
}

export function setStyle(params: number): CSSProperties {
  if (params === 0) return {};
  return { color: params >= 0 ? "green" : "orangered" };
}

export function getSumofAttacks(obj: TMix) {
  const totalAtt = [obj["A++"],obj["A+"], obj["A!"], obj["AB"], obj["A="]];
  const sumOfTotalAtt = totalAtt.reduce((a, b) => a + b, 0);
  return +sumOfTotalAtt;
}

export function gerPercentOfAttack(obj: TMix) {
  const percents = +((obj["A++"] / getSumofAttacks(obj)) * 100);
  return Math.round(percents);
}

export function getAttackEfficency(obj: TMix) {
  const efficencyAttack = +((getPlusMinusAttack(obj) / getSumofAttacks(obj)) * 100);
  return Math.round(efficencyAttack);
}

export function getServiceEfficency(obj: TMix) {
  const totalService = [obj["S++"], obj["S+"], obj["S-"], obj["S="], obj["S!"]];
  const sumOfTotalService = totalService.reduce((a, b) => a + b, 0);
  if (sumOfTotalService === 0) return 0;
  const efficencyService = +((getPlusMinusService(obj) / sumOfTotalService) * 100);
  return Math.round(efficencyService);
}

export function getPlusMinusService(obj: TMix) {
  return obj["S++"] - obj["S="];
}
export function getPlusMinusAttack(obj: TMix) {
  return obj["A++"] - (obj["AB"] + obj["A="]);
}

export function calculateTotalofActions(obj: TMix[]) {
  const loosePoints = obj.reduce((acc, val) => (acc += val["A="]), 0);
  const winPoints = obj.reduce((acc, val) => (acc += val["A++"]), 0);
  const leftInTheGamePlus = obj.reduce((acc, val) => (acc += val["A+"]), 0);
  const leftInTheGameMinus = obj.reduce((acc, val) => (acc += val["A!"]), 0);
  const attacksInBlock = obj.reduce((acc, val) => (acc += val["AB"]), 0);
  const ace = obj.reduce((acc, val) => (acc += val["S++"]), 0);
  const serviceFailed = obj.reduce((acc, val) => (acc += val["S="]), 0);
  const serviceExclamation = obj.reduce((acc, val) => (acc += val["S!"]), 0);
  const servicePlus = obj.reduce((acc, val) => (acc += val["S+"]), 0);
  const serviceMinus = obj.reduce((acc, val) => (acc += val["S-"]), 0);
  const rPerfect = obj.reduce((acc, val) => (acc += val["R++"]), 0);
  const rPlus = obj.reduce((acc, val) => (acc += val["R+"]), 0);
  const rExclamation = obj.reduce((acc, val) => (acc += val["R!"]), 0);
  const rAce = obj.reduce((acc, val) => (acc += val["R="]), 0);
  const rMinus = obj.reduce((acc, val) => (acc += val["R-"]), 0);
  const blocks = obj.reduce((acc, val) => (acc += val.blocks), 0);
  const sumOfAllPlayersSoloGamesStats = {
    "A=": loosePoints,
    "A++": winPoints,
    "A+": leftInTheGamePlus,
    "A!": leftInTheGameMinus,
    AB: attacksInBlock,
    "S++": ace,
    "S!": serviceExclamation,
    "S=": serviceFailed,
    "S+": servicePlus,
    "S-": serviceMinus,
    "R++": rPerfect,
    "R+": rPlus,
    "R!": rExclamation,
    "R-": rMinus,
    "R=": rAce,
    blocks: blocks,
  };
  return sumOfAllPlayersSoloGamesStats;
}

export function preparePlayerToSoloGame(obj: TPlayer) {
  const soloGamePlayerStats = { ...obj };
  soloGamePlayerStats["A++"] = 0;
  soloGamePlayerStats["A+"] = 0;
  soloGamePlayerStats["A="] = 0;
  soloGamePlayerStats["A!"] = 0;
  soloGamePlayerStats["AB"] = 0;
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
