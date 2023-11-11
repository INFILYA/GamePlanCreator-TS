import { useState } from "react";
import { TZoneStates } from "../../../types/types";

type TBalls = {
  className: string;
  index: number;
  zonesStates: TZoneStates[];
  setZonesStates(arg: TZoneStates[]): void;
  setIsShowInputs(arg: boolean): void;
  setIsShowBalls(arg: boolean): void;
  value: string;
};

export function Balls(props: TBalls) {
  const { className, index, zonesStates, setZonesStates, setIsShowInputs, value, setIsShowBalls } =
    props;
  const [showTheBall, setShowTheBall] = useState(true);
  function onClickSetCorrectBall(index: number) {
    const newBalls = [...zonesStates];
    if (showTheBall) {
      newBalls[index] = { ...newBalls[index], active: true };
      setIsShowInputs(true);
      setIsShowBalls(true);
      setShowTheBall(!showTheBall);
    } else {
      newBalls[index] = { ...newBalls[index], active: false };
      setIsShowInputs(false);
      setIsShowBalls(false);
      setShowTheBall(!showTheBall);
    }
    setZonesStates(newBalls);
  }
  return (
    <>
      <button type="button" className={className} onClick={() => onClickSetCorrectBall(index)}>
        {value}
      </button>
    </>
  );
}
