import { useSelector } from "react-redux";
import SectionWrapper from "../../wrappers/SectionWrapper";
import { selectGuestTeam } from "../../states/slices/guestTeamSlice";
import { useEffect, useState } from "react";
import {
  rotateForwardGuestTeam,
  selectIndexOfGuestTeamZones,
} from "../../states/slices/indexOfGuestTeamZonesSlice";
import { correctZones, forSoloGameStat } from "../../utilities/functions";
import { resetRallyStats } from "../../states/slices/soloRallyStatsSlice";
import { useAppDispatch } from "../../states/store";
import { TGameLogStats, TPlayer } from "../../types/types";
import ConfirmField from "../../utilities/ConfimField.";
import {
  selectRallyNotation,
  resetRallyNotation,
  startNewRally,
} from "../../states/slices/rallyNotationSlice";
import {
  playerStatsToRallyPlayers,
  parseNotationToPlayerStats,
} from "../../notation/parser";
import { setUpdatedPlayers } from "../../states/slices/listOfPlayersSlice";

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
  setGameLog(
    arg: TGameLogStats | ((prev: TGameLogStats) => TGameLogStats)
  ): void;
  statsForTeam: TPlayer[][];
  setstatsForTeam(
    arg: TPlayer[][] | ((prev: TPlayer[][]) => TPlayer[][])
  ): void;
  endOfTheSet: boolean;
  setPreviousScore(arg: number): void;
  previousScore: number;
  rivalRotation: number;
  setRivalRotation(arg: number): void;
  guestPlayers: TPlayer[];
  exhibitionGame?: boolean;
  statMode?: boolean;
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
    setGameLog,
    setstatsForTeam,
    endOfTheSet,
    previousScore,
    rivalRotation,
    setRivalRotation,
    guestPlayers,
    exhibitionGame = false,
    statMode = false,
  } = arg;
  const dispatch = useAppDispatch();
  const guestTeam = useSelector(selectGuestTeam);
  const rallyNotation = useSelector(selectRallyNotation);
  const [myZone, setMyZone] = useState(1);
  const [openConfirmWindow, setOpenConfirmWindow] = useState(false);
  const guestTeamOptions = useSelector(selectIndexOfGuestTeamZones);

  useEffect(() => {
    function myTeamRigthRotation() {
      if (guestTeamOptions.length === 0) return;
      const seTTer = guestTeamOptions.find(
        (player) => player.position === "SET"
      );
      if (!seTTer) return;
      const indexOfSetter = guestTeamOptions.indexOf(seTTer);
      setMyZone(correctZones(indexOfSetter));
    }
    myTeamRigthRotation();
  }, [guestTeamOptions]);

  function confirmPoint() {
    setOpenConfirmWindow(!openConfirmWindow);
  }

  function addScore() {
    const whoServedInThisRally = rivalTeam ? !weServe : weServe;
    const newScore = score + 1;

    const teamRotationBefore = guestTeamOptions.map((player) => ({
      ...player,
      unforcedError: Number.isFinite(player.unforcedError)
        ? player.unforcedError
        : 0,
    }));
    const guestPlayersBefore = guestPlayers.map((player) => ({
      ...player,
      unforcedError: Number.isFinite(player.unforcedError)
        ? player.unforcedError
        : 0,
    }));
    const previousRivalScoreBefore = previousScore;
    const rivalRotationBefore = rivalRotation;

    if (!rivalTeam && !weServe) {
      dispatch(rotateForwardGuestTeam());
    }
    if (rivalTeam && weServe) {
      const properRivalZone =
        rivalRotation === 1
          ? 6
          : rivalRotation <= 6
          ? rivalRotation - 1
          : rivalRotation;
      setRivalRotation(properRivalZone);
    }
    setScore(newScore);

    const roster = [...guestTeamOptions, ...guestPlayers];
    const parsedByNumber = parseNotationToPlayerStats(rallyNotation);
    const rallyPlayers = playerStatsToRallyPlayers(parsedByNumber, roster);
    const cleanedStats =
      rallyPlayers.length > 0
        ? rallyPlayers.map((player) => forSoloGameStat(player))
        : [];

    const seTTer =
      guestTeamOptions.length > 0
        ? guestTeamOptions.find((player) => player.position === "SET")
        : null;
    const ourSetterPosition =
      seTTer && guestTeamOptions
        ? correctZones(guestTeamOptions.indexOf(seTTer))
        : myZone;

    const rallyData = {
      score: currentScore,
      weServe: whoServedInThisRally,
      weWon: !rivalTeam,
      rivalTeam: rivalTeam,
      stats: cleanedStats,
      ...(rallyNotation.trim() ? { notation: rallyNotation } : {}),
      setterBoardPosition: ourSetterPosition,
      previousRivalScore: previousRivalScoreBefore,
      rivalRotation: rivalRotationBefore,
      teamRotationBefore: teamRotationBefore,
      guestPlayersBefore: guestPlayersBefore,
    };

    setGameLog((prevGameLog) => [...prevGameLog, rallyData]);

    if (rallyPlayers.length > 0) {
      setstatsForTeam((prevStats: TPlayer[][]) => [
        ...prevStats,
        rallyPlayers,
      ]);
      if (!exhibitionGame) {
        for (const rallyPlayer of rallyPlayers) {
          dispatch(setUpdatedPlayers(rallyPlayer));
        }
      }
    }

    dispatch(resetRallyStats());
    dispatch(resetRallyNotation());
    dispatch(startNewRally({ weServe: !rivalTeam }));
    setNextRotation(true);
    setWeServe(!rivalTeam);
    setOpenConfirmWindow(!openConfirmWindow);
  }

  const myZones = [4, 3, 2, 5, 6, 1];
  const zones = rivalTeam ? setRivalRotation : setMyZone;
  const nameOfTheTeam = rivalTeam
    ? opponentTeamName
    : guestTeam.length > 0
    ? guestTeam[0]?.name
    : "";
  const zeroZero = score === 0 && rivalScore === 0;

  return (
    <>
      {openConfirmWindow && (
        <ConfirmField
          onClick={addScore}
          setOpenConfirmWindow={setOpenConfirmWindow}
        />
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
                onClick={
                  !rivalTeam ? () => setWeServe(true) : () => setWeServe(false)
                }
                value={rivalTeam ? ">" : "<"}
              />
            ) : (
              <div>🏐</div>
            )
          ) : (
            weServe && <div>🏐</div>
          )}
        </div>
        {!statMode && (
          <div className="rotation-buttons-wrapper">
            <button
              style={{ borderRadius: "50%" }}
              onClick={() => confirmPoint()}
              disabled={endOfTheSet}
            >
              +
            </button>
          </div>
        )}
        <div style={{ fontSize: "8vw" }}>{score}</div>
        <div className="rotation-panel-content">
          {myZones.map((zone) => (
            <button
              key={zone}
              value={zone}
              style={{
                backgroundColor:
                  (rivalTeam ? rivalRotation : myZone) === zone
                    ? "orangered"
                    : "",
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
