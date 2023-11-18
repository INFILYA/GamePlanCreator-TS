import { useSelector } from "react-redux";
import { useState, ChangeEvent } from "react";
import { selectPlayerInfo } from "../../states/slices/playerInfoSlice";
import WrapperForDirections from "./WrapperForDirections";
import { TAttackDiagramm, TPlayer, TTeam, TZoneStates } from "../../types/types";
import {
  gerPercentOfAttack,
  getAttackEfficency,
  getPlusMinusAttack,
} from "../../utilities/functions";

export function Attack() {
  const playerInfos = useSelector(selectPlayerInfo);
  const playerInfo = { ...playerInfos };

  const [zonesStates, setZonesStates] = useState<TZoneStates[]>([
    { zone: "attackZone1", active: false },
    { zone: "attackZone2", active: false },
    { zone: "attackZone4", active: false },
    { zone: "attackPipe", active: false },
    { zone: "attackK1", active: false },
    { zone: "attackKC", active: false },
    { zone: "attackK7", active: false },
  ]);
  const [diagrammValue, setDiagrammValue] = useState<TAttackDiagramm>({
    winPoints: 0,
    leftInGame: 0,
    attacksInBlock: 0,
    loosePoints: 0,
  });
  const handleDiagrammValue = (event: ChangeEvent<HTMLInputElement>) => {
    setDiagrammValue({
      ...diagrammValue,
      [event.target.name]: +event.target.value.replace(/\D+/g, ""),
    });
  };
  function calculateForData<T extends TTeam | TPlayer>(obj: T): T {
    for (const key in diagrammValue) {
      (obj[key as keyof T] as number) += diagrammValue[key as keyof TAttackDiagramm];
    }
    obj.percentOfAttack = gerPercentOfAttack(obj); //встановлюємо процент зйому
    obj.plusMinusOnAttack = getPlusMinusAttack(obj); //встановлюємо + - в атаці
    obj.efficencyAttack = getAttackEfficency(obj); // встановлюємо ефективність подачі
    return obj;
  }
  return (
    <WrapperForDirections
      diagrammValue={diagrammValue}
      handleDiagrammValue={handleDiagrammValue}
      calculateForData={calculateForData}
      zonesStates={zonesStates}
      setZonesStates={setZonesStates}
      playerInfo={playerInfo as TPlayer}
      type="Attack"
    />
  );
}
