import { useSelector } from "react-redux";
import SectionWrapper from "../../wrappers/SectionWrapper";
import { selectGuestTeam } from "../../states/slices/guestTeamSlice";
import { useEffect, useState } from "react";
import {
  rotateForwardGuestTeam,
  selectIndexOfGuestTeamZones,
} from "../../states/slices/indexOfGuestTeamZonesSlice";
import { correctZones, forSoloGameStat } from "../../utilities/functions";
import {
  resetRallyStats,
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
    // ВАЖНО: Всегда получаем расстановку нашей команды (myZone)
    // Это нужно для расчета plusMinusPositions, чтобы понять где мы стартуем
    // Используем guestTeamOptions (наша команда на поле)
    function myTeamRigthRotation() {
      const seTTer = guestTeamOptions.find(
        (player) => player.position === "SET"
      );
      if (!seTTer) return;
      const indexOfSetter = guestTeamOptions.indexOf(seTTer);
      setMyZone(correctZones(indexOfSetter));
    }
    // Всегда обновляем myZone, независимо от rivalTeam
    // Это расстановка нашей команды, которая нужна для расчета
    myTeamRigthRotation();
  }, [guestTeamOptions]);

  function confirmPoint() {
    setOpenConfirmWindow(!openConfirmWindow);
  }

  function addScore() {
    // ВАЖНО: Сохраняем значение weServe на начало розыгрыша (до изменения счета)
    // Если это панель соперника (rivalTeam = true), то weServe инвертирован
    // Поэтому нужно инвертировать обратно, чтобы получить правильное значение
    const whoServedInThisRally = rivalTeam ? !weServe : weServe;

    const newScore = score + 1;

    if (
      (zeroZero && !weServe && !rivalTeam) ||
      (previousScore !== rivalScore && !rivalTeam)
    ) {
      dispatch(rotateForwardGuestTeam());
      dispatch(rotateForwardHomeTeam());
      setPreviousScore(rivalScore);
    }
    if (
      (zeroZero && !weServe && rivalTeam) ||
      (previousScore !== rivalScore && rivalTeam)
    ) {
      setPreviousScore(rivalScore);
      const properRivalZone =
        rivalRotation === 1
          ? 6
          : rivalRotation <= 6
          ? rivalRotation - 1
          : rivalRotation;
      setRivalRotation(properRivalZone);
    }
    setScore(newScore);

    // ============================================
    // ЗАПИСЬ ОЧКА В ИСТОРИЮ ИГРЫ
    // ============================================
    // ВАЖНО: Записываем ралли ВСЕГДА в gameLog, даже если нет действий игроков
    // Используем forSoloGameStat для очистки нулевых значений из объектов статистики игроков
    const cleanedStats =
      SoloRallyStats.length > 0
        ? SoloRallyStats.map((player) => forSoloGameStat(player))
        : [];

    // Определяем расстановки на момент ралли
    const seTTer = guestTeamOptions.find((player) => player.position === "SET");
    const ourSetterPosition = seTTer
      ? correctZones(guestTeamOptions.indexOf(seTTer))
      : myZone;
    const rivalSetterPosition = rivalRotation;

    const rallyData = {
      score: currentScore,
      weServe: whoServedInThisRally, // Кто подавал в этом ралли (значение на начало розыгрыша)
      weWon: !rivalTeam, // Кто выиграл очко: true - мы выиграли, false - соперник выиграл
      stats: cleanedStats,
      setterBoardPosition: ourSetterPosition,
      rivalSetterBoardPosition: rivalSetterPosition,
    };

    // Используем функциональное обновление для правильного накопления
    setGameLog((prevGameLog) => {
      const newGameLog = [...prevGameLog, rallyData];

      // Логируем только нужную информацию
      console.log("Who served:", whoServedInThisRally ? "We" : "Rival");
      console.log(
        "Actions in this rally:",
        SoloRallyStats.length > 0
          ? SoloRallyStats.map((p) => ({
              name: p.name,
              "R++": p["R++"] || 0,
              "R+": p["R+"] || 0,
              "A++": p["A++"] || 0,
              "A+": p["A+"] || 0,
              "S++": p["S++"] || 0,
              "S+": p["S+"] || 0,
              blocks: p.blocks || 0,
            }))
          : "No actions"
      );
      console.log("Full gameLog:", newGameLog);

      return newGameLog;
    });

    // Записываем в statsForTeam только если есть действия
    if (SoloRallyStats.length > 0) {
      setstatsForTeam((prevStats: TPlayer[][]) => [
        ...prevStats,
        SoloRallyStats,
      ]);
    }

    dispatch(resetRallyStats());
    setNextRotation(true);
    // Обновляем weServe для следующего ралли
    // Если мы выиграли (!rivalTeam), то мы будем подавать в следующем ралли (weServe = true)
    // Если соперник выиграл (rivalTeam), то соперник будет подавать в следующем ралли (weServe = false)
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
