import { useSelector } from "react-redux";
import { useState } from "react";
import { selectPlayerInfo } from "../../states/slices/playerInfoSlice";
import WrapperForDirections from "./WrapperForDirections";
import { TAttackDiagramm, TDiagramm, TPlayer, TTeam, TZoneStates } from "../../types/types";

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
  const [diagrammValue, setDiagrammValue] = useState<TDiagramm>({
    aces: 0,
    servicePlus: 0,
    serviceMinus: 0,
    serviceFailed: 0,
    plusMinusOnService: 0,
    winPoints: 0,
    leftInGame: 0,
    attacksInBlock: 0,
    loosePoints: 0,
    plusMinusOnAttack: 0,
    percentOfAttack: 0,
  });
  function calculateForData<T extends TTeam | TPlayer>(obj: T): T {
    if (obj === playerInfo) {
      diagrammValue.plusMinusOnAttack =
        diagrammValue.winPoints - (diagrammValue.attacksInBlock + diagrammValue.loosePoints);
    }
    for (const key in diagrammValue) {
      if (key === "percentOfAttack") {
        continue;
      }
      (obj[key as keyof T] as number) += diagrammValue[key as keyof TAttackDiagramm];
    }
    obj.percentOfAttack = +(
      (obj.winPoints /
        (obj.winPoints + obj.attacksInBlock + obj.loosePoints + obj.leftInGame + 0.0001)) *
      100
    ).toFixed(1);
    return obj;
  }

  return (
    <WrapperForDirections
      diagrammValue={diagrammValue}
      setDiagrammValue={setDiagrammValue}
      calculateForData={calculateForData}
      zonesStates={zonesStates}
      setZonesStates={setZonesStates}
      playerInfo={playerInfo as TPlayer}
      type="Attack"
    />
  );
}
