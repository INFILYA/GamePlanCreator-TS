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
  // rotateForwardPositions,
  selectSoloRallyStats,
} from "../../states/slices/soloRallyStatsSlice";
import { useAppDispatch } from "../../states/store";
import { TGameLogStats, TPlayer } from "../../types/types";
import { rotateForwardHomeTeam } from "../../states/slices/indexOfHomeTeamZonesSlice";
import ConfirmField from "../../utilities/ConfimField.";

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
  setPreviousScore(arg: number): void;
  previousScore: number;
  rivalRotation: number;
  setRivalRotation(arg: number): void;
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
    setPreviousScore,
    previousScore,
    rivalRotation,
    setRivalRotation,
  } = arg;
  const dispatch = useAppDispatch();
  const guestTeam = useSelector(selectGuestTeam);
  const SoloRallyStats = useSelector(selectSoloRallyStats);
  const [myZone, setMyZone] = useState(1);
  const [openConfirmWindow, setOpenConfirmWindow] = useState(false);
  const guestTeamOptions = useSelector(selectIndexOfGuestTeamZones);

  useEffect(() => {
    function myTeamRigthRotation() {
      const seTTer = guestTeamOptions.find((player) => player.position === "SET");
      if (!seTTer) return;
      const indexOfSetter = guestTeamOptions.indexOf(seTTer);
      setMyZone(correctZones(indexOfSetter));
    }
    if (!rivalTeam) {
      myTeamRigthRotation();
    }
  }, [guestTeamOptions, rivalTeam]);

  function confirmPoint() {
    setOpenConfirmWindow(!openConfirmWindow);
  }

  function addScore() {
    if ((zeroZero && !weServe && !rivalTeam) || (previousScore !== rivalScore && !rivalTeam)) {
      dispatch(rotateForwardGuestTeam());
      dispatch(rotateForwardHomeTeam());
      setPreviousScore(rivalScore);
    }
    if ((zeroZero && !weServe && rivalTeam) || (previousScore !== rivalScore && rivalTeam)) {
      setPreviousScore(rivalScore);
      const properRivalZone =
        rivalRotation === 1 ? 6 : rivalRotation <= 6 ? rivalRotation - 1 : rivalRotation;
      setRivalRotation(properRivalZone);
    }
    setScore(score + 1);
    if (SoloRallyStats.length > 0) {
      setGameLog([
        ...gameLog,
        {
          score: currentScore,
          weServe: zeroZero ? weServe : previousScore !== rivalScore ? rivalTeam : !rivalTeam,
          stats: SoloRallyStats,
        },
      ]);
      setstatsForTeam([...statsForTeam, SoloRallyStats]);
    }
    dispatch(resetRallyStats());
    setNextRotation(true);
    setWeServe(!rivalTeam);
    setOpenConfirmWindow(!openConfirmWindow);
  }

  const myZones = [4, 3, 2, 5, 6, 1];
  const zones = rivalTeam ? setRivalRotation : setMyZone;
  const nameOfTheTeam = rivalTeam ? opponentTeamName : guestTeam[0]?.name;
  const zeroZero = score === 0 && rivalScore === 0;

  return (
    <>
      {openConfirmWindow && (
        <ConfirmField onClick={addScore} setOpenConfirmWindow={setOpenConfirmWindow} />
      )}
      <SectionWrapper className="rotation-panel-wrapper">
        <div className="rivalTeam-name-wrapper">
          <h2 className="rivalTeam-name">{nameOfTheTeam}</h2>
        </div>
        <div className="service-ball-wrapper">
          {zeroZero ? (
            !weServe ? (
              <input
                type="button"
                onClick={!rivalTeam ? () => setWeServe(true) : () => setWeServe(false)}
                value={rivalTeam ? ">" : "<"}
              />
            ) : (
              <div>🏐</div>
            )
          ) : (
            weServe && <div>🏐</div>
          )}
        </div>
        <div className="rotation-buttons-wrapper">
          <button
            style={{ borderRadius: "50%" }}
            onClick={() => confirmPoint()}
            disabled={endOfTheSet}
          >
            +
          </button>
        </div>
        <div style={{ fontSize: "8vw" }}>{score}</div>
        <div className="rotation-panel-content">
          {myZones.map((zone) => (
            <button
              key={zone}
              value={zone}
              style={{
                backgroundColor: (rivalTeam ? rivalRotation : myZone) === zone ? "orangered" : "",
              }}
              onClick={zeroZero ? () => zones(zone) : () => null}
            >
              {zone}
            </button>
          ))}
        </div>
      </SectionWrapper>
    </>
  );
}
