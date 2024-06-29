import { useSelector } from "react-redux";
import { useState, ChangeEvent } from "react";
import { selectPlayerInfo } from "../../states/slices/playerInfoSlice";
import WrapperForDirections from "./WrapperForDirections";
import { TAttackDiagramm, TDiagramm, TPlayer, TTeam, TZoneStates } from "../../types/types";

export function Attack() {
  const playerInfos = useSelector(selectPlayerInfo);
  const playerInfo = { ...playerInfos };

  const [zonesStates, setZonesStates] = useState<TZoneStates[]>([
    { zone: "A1", active: false },
    { zone: "A2", active: false },
    { zone: "A4", active: false },
    { zone: "AP", active: false },
    { zone: "AK1", active: false },
    { zone: "AKC", active: false },
    { zone: "AK7", active: false },
  ]);
  const [diagrammValue, setDiagrammValue] = useState<TAttackDiagramm>({
    "A++": 0,
    "A+": 0,
    "A!": 0,
    "A-": 0,
    "A=": 0,
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
    return obj;
  }
  return (
    <WrapperForDirections
      diagrammValue={diagrammValue as TDiagramm}
      handleDiagrammValue={handleDiagrammValue}
      calculateForData={calculateForData}
      zonesStates={zonesStates}
      setZonesStates={setZonesStates}
      playerInfo={playerInfo as TPlayer}
      type="Attack"
    />
  );
}
