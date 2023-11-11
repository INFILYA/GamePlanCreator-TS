import { useSelector } from "react-redux";
import { useState } from "react";
import { selectPlayerInfo } from "../../states/slices/playerInfoSlice";
import WrapperForDirections from "./WrapperForDirections";
import { TDiagramm, TPlayer, TServiceDiagramm, TTeam, TZoneStates } from "../../types/types";

export function Service() {
  const playerInfos = useSelector(selectPlayerInfo);
  const playerInfo = { ...playerInfos };
  const [zonesStates, setZonesStates] = useState<TZoneStates[]>([
    { zone: "serviceZone1", active: false },
    { zone: "serviceZone6", active: false },
    { zone: "serviceZone5", active: false },
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
      diagrammValue.plusMinusOnService =
        diagrammValue.aces * 2 +
        diagrammValue.servicePlus * 0.5 -
        diagrammValue.serviceFailed -
        diagrammValue.serviceMinus * 0.5;
    }
    for (const key in diagrammValue) {
      (obj[key as keyof T] as number) += diagrammValue[key as keyof TServiceDiagramm];
    }
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
      type="Service"
    />
  );
}
