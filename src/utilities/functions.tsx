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
export function compare<T>(a: T, b: T): number {
  if (a < b) {
    return -1;
  }
  if (a > b) {
    return 1;
  }
  return 0;
}

export const zones = [3, 2, 1, 4, 5, 0];

const emptyPlayer = {
  age: 0,
  hand: "",
  height: 0,
  id: "",
  firstName: "",
  name: "",
  number: 0,
  photo: "",
  position: "Setter",
  reach: 0,
  teamid: "",
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
  boardPosition: 3,
};

export const backGroundYellow = { backgroundColor: "#FFD700", color: "#0057B8" };
export const backGroundBlue = { backgroundColor: "#0057B8", color: "#FFD700" };

export function correctPositions(number: number): number {
  return zones[number];
}
export const emptyPlayers: TPlayer[] = Array(6)
  .fill(emptyPlayer)
  .map((user, index) => ({ ...user, boardPosition: correctPositions(index) }));

export function setStyle(params: number): CSSProperties {
  if (params === 0) return {};
  return { color: params >= 0 ? "green" : "red" };
}


export function getAttackEfficency(obj:TMix) {
  if (!("winPoints" in obj)) return 0;
  const totalAtt = [obj.winPoints, obj.leftInGame, obj.attacksInBlock, obj.loosePoints];
  const sumOfTotalAtt = totalAtt.reduce((a, b) => a + b, 0);
  if (sumOfTotalAtt === 0) return 0;
  const efficencyAttack = +((getPlusMinusAttack(obj) / sumOfTotalAtt) * 100).toFixed(1);
  return efficencyAttack;
}
export function getServiceEfficency(obj:TMix) {
  const totalService = [obj.aces, obj.servicePlus, obj.serviceMinus, obj.serviceFailed];
  const sumOfTotalService = totalService.reduce((a, b) => a + b, 0);
  if (sumOfTotalService === 0) return 0;
  const efficencyService = +((getPlusMinusService(obj) / sumOfTotalService) * 100).toFixed(1);
  return efficencyService;
}

export function getPlusMinusService(obj:TMix) {
  return obj.aces - obj.serviceFailed;
}
export function getPlusMinusAttack(obj:TMix) {
  return obj.winPoints - (obj.attacksInBlock + obj.loosePoints);
}
export function gerPercentOfAttack(obj:TMix) {
  if (!("winPoints" in obj)) return 0;
  const totalAtt = [obj.winPoints, obj.leftInGame, obj.attacksInBlock, obj.loosePoints];
  const sumOfTotalAtt = totalAtt.reduce((a, b) => a + b, 0);
  if (sumOfTotalAtt === 0) return 0;
  const percents = +((obj.winPoints / sumOfTotalAtt) * 100).toFixed(1);
  return percents;
}