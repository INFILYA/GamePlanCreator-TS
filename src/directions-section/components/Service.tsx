import { useSelector } from "react-redux";
import { useState, ChangeEvent } from "react";
import { selectPlayerInfo } from "../../states/slices/playerInfoSlice";
import WrapperForDirections from "./WrapperForDirections";
import { TPlayer, TServiceDiagramm, TTeam, TZoneStates } from "../../types/types";
// import { getPlusMinusService, getServiceEfficency } from "../../utilities/functions";

export function Service() {
  const playerInfos = useSelector(selectPlayerInfo);
  const playerInfo = { ...playerInfos };
  const [zonesStates, setZonesStates] = useState<TZoneStates[]>([
    { zone: "S1", active: false },
    { zone: "S6", active: false },
    { zone: "S5", active: false },
  ]);

  const handleDiagrammValue = (event: ChangeEvent<HTMLInputElement>) => {
    setDiagrammValue({
      ...diagrammValue,
      [event.target.name]: +event.target.value.replace(/\D+/g, ""),
    });
  };
  const [diagrammValue, setDiagrammValue] = useState<TServiceDiagramm>({
    "S++": 0,
    "S+": 0,
    "S!": 0,
    "S-": 0,
    "S=": 0,
  });

  function calculateForData<T extends TTeam | TPlayer>(obj: T): T {
    for (const key in diagrammValue) {
      (obj[key as keyof T] as number) += diagrammValue[key as keyof TServiceDiagramm];
    }
    // obj.plusMinusOnService = getPlusMinusService(obj); //встановлюємо + - на подачі
    // obj.efficencyService = getServiceEfficency(obj); // встановлюємо ефективність подачі
    return obj;
  }
  return (
    <WrapperForDirections
      handleDiagrammValue={handleDiagrammValue}
      diagrammValue={diagrammValue}
      calculateForData={calculateForData}
      zonesStates={zonesStates}
      setZonesStates={setZonesStates}
      playerInfo={playerInfo as TPlayer}
      type="Service"
    />
  );
}
