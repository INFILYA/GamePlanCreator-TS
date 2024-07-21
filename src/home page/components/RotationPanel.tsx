import { useSelector } from "react-redux";
import SectionWrapper from "../../wrappers/SectionWrapper";
import { selectGuestTeam } from "../../states/slices/guestTeamSlice";
import { useEffect, useState } from "react";
import {
  rotateForwardGuestTeam,
  selectIndexOfGuestTeamZones,
} from "../../states/slices/indexOfGuestTeamZonesSlice";
import { correctZones } from "../../utilities/functions";
import {
  resetRallyStats,
  rotateForwardPositions,
  selectSoloRallyStats,
} from "../../states/slices/soloRallyStatsSlice";
import { useAppDispatch } from "../../states/store";
import { TGameLogStats, TPlayer } from "../../types/types";
import { rotateForwardHomeTeam } from "../../states/slices/indexOfHomeTeamZonesSlice";

type TRotationPanel = {
  rivalTeam: boolean;
  score: number;
  weServe: boolean;
  setWeServe(arg: boolean): void;
  rivalScore: number;
  currentScore: string;
  setScore(arg: number): void;
  setNextRotation(arg: boolean): void;
  opponentTeamName?: string;
  gameLog: TGameLogStats;
  setGameLog(arg: TGameLogStats): void;
  setstatsForTeam(arg: TPlayer[][]): void;
  statsForTeam: TPlayer[][];
  endOfTheSet: boolean;
};

export default function RotationPanel(arg: TRotationPanel) {
  const {
    opponentTeamName,
    rivalTeam,
    weServe,
    setWeServe,
    score,
    rivalScore,
    currentScore,
    setScore,
    setNextRotation,
    gameLog,
    setGameLog,
    setstatsForTeam,
    statsForTeam,
    endOfTheSet,
  } = arg;
  const dispatch = useAppDispatch();
  const guestTeam = useSelector(selectGuestTeam);
  const SoloRallyStats = useSelector(selectSoloRallyStats);
  const [number, setNumber] = useState(1);
  const [previousRivalScore, setPreviousRivalScore] = useState(0);

  const guestTeamOptions = useSelector(selectIndexOfGuestTeamZones);

  function addScore() {
    if ((zeroZero && !weServe && !rivalTeam) || (previousRivalScore !== rivalScore && !rivalTeam)) {
      dispatch(rotateForwardGuestTeam());
      dispatch(rotateForwardHomeTeam());
      dispatch(rotateForwardPositions());
      setPreviousRivalScore(rivalScore);
    }
    setScore(score + 1);
    if (SoloRallyStats.length > 0) {
      setGameLog([...gameLog, { score: currentScore, stats: SoloRallyStats }]);
      setstatsForTeam([...statsForTeam, SoloRallyStats]);
    }
    dispatch(resetRallyStats());
    setNextRotation(true);
    setWeServe(!rivalTeam);
  }

  useEffect(() => {
    function MyTeamRigthRotation() {
      const seTTer = guestTeamOptions.find((plaer) => plaer.position === "SET");
      if (!seTTer) return;
      const indexOfSetter = guestTeamOptions.indexOf(seTTer);
      setNumber(correctZones(indexOfSetter));
    }
    if (!rivalTeam) {
      MyTeamRigthRotation();
    }
  });

  const zones = [4, 3, 2, 5, 6, 1];
  const nameOfTheTeam = rivalTeam ? opponentTeamName : guestTeam[0]?.name;
  const zeroZero = score === 0 && rivalScore === 0;
  return (
    <SectionWrapper className="rotation-panel-wrapper">
      <div className="service-ball-wrapper">
        {weServe && <div>🏐</div>}
        {zeroZero && (
          <input type="checkbox" onChange={() => setWeServe(!weServe)} checked={weServe} />
        )}
      </div>
      <div className="rotation-buttons-wrapper">
        <button
          style={{ borderRadius: "50%" }}
          onClick={() => addScore()}
          disabled={endOfTheSet}
        >
          +
        </button>
      </div>
      <div style={{ fontSize: "8vw" }}>{score}</div>
      <div className="rivalTeam-name-wrapper">
        <h1 className="rivalTeam-name">{nameOfTheTeam}</h1>
      </div>
      <div className="rotation-panel-content">
        {zones.map((zone) => (
          <button
            key={zone}
            value={zone}
            style={{ backgroundColor: number === zone ? "orangered" : "" }}
            onClick={() => setNumber(zone)}
          >
            {zone}
          </button>
        ))}
      </div>
    </SectionWrapper>
  );
}
