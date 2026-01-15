import { useSelector } from "react-redux";
import { auth, gamesRef, playersRef, teamsRef } from "../config/firebase";
import { NavLink } from "react-router-dom";
import SectionWrapper from "../wrappers/SectionWrapper";
import { useAppDispatch } from "../states/store";
import {
  calculateTotalofActions,
  calculateTotalofActionsV2,
  compare,
  correctZones,
  emptyPlayers,
  firstLetterCapital,
  getFromLocalStorage,
  isFieldExist,
  zones,
} from "../utilities/functions";
import { TGameLogStats, TMix, TPlayer, TTeam } from "../types/types";
import { FormEvent, useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { selectGuestTeam, setGuestTeam } from "../states/slices/guestTeamSlice";
import { IconOfPlayer } from "./components/IconOfPlayers";
import { Squads } from "./components/Squads";
import { ChooseGuestTeam } from "./components/ChooseGuestTeam";
import { setGuestPlayers } from "../states/slices/guestPlayersSlice";
import {
  selectPlayerInfo,
  setInfoOfPlayer,
} from "../states/slices/playerInfoSlice";
import { PersonalInformationOfPlayer } from "../personalInfo/PersonalInformationOfPlayer";
import {
  rotateBackGuestTeam,
  rotateForwardGuestTeam,
  selectIndexOfGuestTeamZones,
  setBackGuestTeamSelects,
  setGuestTeamIndexOfZones,
} from "../states/slices/indexOfGuestTeamZonesSlice";
import { filterGuestPlayers } from "../states/slices/guestPlayersSlice";
import { selectListOfPlayers, setAllPlayers } from "../states/slices/listOfPlayersSlice";
import { RegularButton } from "../css/Button.styled";
import {
  resetRallyStats,
  rotateBackPositions,
  rotateForwardPositions,
} from "../states/slices/soloRallyStatsSlice";
import { currentDate } from "../utilities/currentDate";
import { selectGamesStats } from "../states/slices/gamesStatsSlice";
import { set, update } from "firebase/database";
import RotationPanel from "./components/RotationPanel";
import { StatisticsTable } from "../ratings/components/StatisticsTable";
import { useSetWidth } from "../utilities/useSetWidth";
import Diagramm from "../personalInfo/components/Diagramm";
import ConfirmField from "../utilities/ConfimField.";

export function HomePage() {
  const dispatch = useAppDispatch();
  const isMobile = useSetWidth() <= 767;
  const [user] = useAuthState(auth);
  const listOfPlayers = useSelector(selectListOfPlayers);
  const guestTeam = useSelector(selectGuestTeam);
  const playerInfo = useSelector(selectPlayerInfo);
  const guestTeamOptions = useSelector(selectIndexOfGuestTeamZones);
  const [showSquads, setShowSquads] = useState(true);
  const [hoverStatisticButton, setHoverStatisticButton] = useState(false);
  const [showCurrentGameStats, setShowCurrentGameStats] = useState(false);
  const [isBiggest, setIsBiggest] = useState<boolean>(false);
  const [nextRotation, setNextRotation] = useState(true);
  const [weServe, setWeServe] = useState(false);
  const [exhibitionGame, setExhibitionGame] = useState(false);
  const [gameLog, setGameLog] = useState<TGameLogStats>([]);
  const [statsForTeam, setstatsForTeam] = useState<TPlayer[][]>([]);
  const [opponentTeamName, setOpponentTeamName] = useState("");
  const [setNumber, setSetNumber] = useState("");
  const [myScore, setMyScore] = useState(0);
  const [rivalScore, setRivalScore] = useState(0);
  const [previousMyScore, setPreviousMyScore] = useState(0);
  const [previousRivalScore, setPreviousRivalScore] = useState(0);
  const [rivalRotation, setRivalRotation] = useState(1);
  const [openResetConfirmWindow, setOpenResetConfirmWindow] = useState(false);
  const [openUndoConfirmWindow, setOpenUndoConfirmWindow] = useState(false);
  const gamesStats = useSelector(selectGamesStats);

  const showGuestTeam = guestTeam.length !== 0;

  function undoLastRally() {
    if (gameLog.length === 0) {
      alert("No rallies to undo");
      return;
    }

    const lastRally = gameLog[gameLog.length - 1];

    // Откатываем gameLog
    setGameLog((prevGameLog) => prevGameLog.slice(0, -1));

    // Откатываем statsForTeam
    if (statsForTeam.length > 0) {
      setstatsForTeam((prevStats) => prevStats.slice(0, -1));
    }

    // Откатываем счет
    if (lastRally.weWon) {
      // Мы выиграли последний розыгрыш, откатываем наш счет
      setMyScore((prev) => Math.max(0, prev - 1));
      // Восстанавливаем weServe - если мы выиграли, значит мы подавали
      setWeServe(lastRally.weServe);
    } else {
      // Соперник выиграл последний розыгрыш, откатываем счет соперника
      setRivalScore((prev) => Math.max(0, prev - 1));
      // Если соперник выиграл, значит он подавал (weServe = false)
      setWeServe(!lastRally.weServe);
    }

    // Откатываем SoloRallyStats из Redux
    dispatch(resetRallyStats());

    // Откатываем ротацию если нужно
    if (lastRally.weWon) {
      // Мы выиграли последний розыгрыш - откатываем ротацию нашей команды
      if (lastRally.teamRotationBefore) {
        // Восстанавливаем расстановку из сохраненного состояния
        dispatch(setBackGuestTeamSelects(lastRally.teamRotationBefore));
      } else {
        // Если нет сохраненного состояния, откатываем ротацию назад
        dispatch(rotateBackGuestTeam());
      }
    }

    // Восстанавливаем previousScore и rivalRotation
    if (lastRally.previousRivalScore !== undefined) {
      setPreviousRivalScore(lastRally.previousRivalScore);
    }
    if (lastRally.rivalRotation !== undefined) {
      setRivalRotation(lastRally.rivalRotation);
    }
  }

  function resetTheBoardForGuestTeam() {
    dispatch(setGuestPlayers([]));
    dispatch(setGuestTeam(""));
    dispatch(setBackGuestTeamSelects(emptyPlayers));
    dispatch(setInfoOfPlayer(null));
    dispatch(resetRallyStats());
    const cachedPlayers = getFromLocalStorage("players");
    if (cachedPlayers && Array.isArray(cachedPlayers)) {
      dispatch(setAllPlayers(cachedPlayers));
    }
    setOpponentTeamName("");
    setSetNumber("");
    setShowSquads(true);
    setShowCurrentGameStats(false);
    setGameLog([]);
    setstatsForTeam([]);
    setMyScore(0);
    setRivalScore(0);
    setWeServe(false);
  }

  function calculateForTeamData<T extends TTeam | TPlayer>(obj: T) {
    if (guestTeam.length === 0) {
      return obj as TTeam;
    }
    const team = { ...guestTeam[0] };
    for (const key in team) {
      if (
        key === "id" ||
        key === "boardPosition" ||
        key === "name" ||
        key === "logo" ||
        key === "age" ||
        key === "height" ||
        key === "startingSquad"
      ) {
        continue;
      }
      const realDa = obj[key as keyof T] as number;
      (team[key as keyof TTeam] as number) += realDa ? realDa : 0;
    }
    return team;
  }

  async function saveSpikeData(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // download solo game statisic
    if (guestTeam.length === 0) return;
    if (!user) {
      alert("Permission denied: please sign in to save games.");
      return;
    }
    const matchInfo = `${currentDate()}; ${
      guestTeam[0].id
    } - ${opponentTeamName} ${exhibitionGame ? "|| Exhibition game" : ""}`;

    try {
      if (!gameLog) return;
      const setStat = { [setNumber]: gameLog };
      const choosenGame = gamesStats.find((game) => game[matchInfo]);
      if (!choosenGame) {
        await set(gamesRef(matchInfo), { [matchInfo]: setStat });
      } else {
        if (setNumber in choosenGame[matchInfo]) {
          alert("Set already exist");
          return;
        } else {
          await update(gamesRef(matchInfo), {
            [matchInfo]: { ...choosenGame[matchInfo], ...setStat },
          });
        }
      }
      // Refresh StartingSix players
      if (!exhibitionGame) {
        async function setPlayersToData(player: TPlayer) {
          await set(playersRef(player.name), player);
        }
        if (guestTeam.length === 0) return;
        const updatedPlayers = listOfPlayers.filter(
          (player) => player.team === guestTeam[0].name
        );
        updatedPlayers.forEach((player) => {
          setPlayersToData(player);
        });
        // //add solo game stats
        const newTeam = calculateForTeamData(
          calculateTotalofActions(statsForTeam.flat()) as TPlayer
        );
        await set(teamsRef(newTeam.name), newTeam);
      }
      setstatsForTeam([]);
      resetTheBoardForGuestTeam();
      setShowSquads(true);
      dispatch(setInfoOfPlayer(null));
    } catch (error: any) {
      const message =
        error?.message ||
        "Permission denied: unable to save game to Firebase.";
      alert(message);
    }
  }

  const hideSquads = () => {
    setShowSquads(!showSquads);
    setShowCurrentGameStats(false);
    dispatch(resetRallyStats());
    setNextRotation(true);
    if (playerInfo !== null) {
      dispatch(setInfoOfPlayer(null));
    }
  };

  function rotateFront() {
    dispatch(rotateForwardGuestTeam());
    dispatch(rotateForwardPositions());
    setNextRotation(true);
    dispatch(resetRallyStats());
  }
  function rotateBack() {
    dispatch(rotateBackGuestTeam());
    dispatch(rotateBackPositions());
    dispatch(resetRallyStats());
    setNextRotation(true);
  }
  const zeroZero = myScore === 0 && rivalScore === 0;
  const allowPersonalInfo = zeroZero;
  const currentScore = `${myScore} - ${rivalScore}`;
  const playerInfoWindow = playerInfo && showSquads && zeroZero;
  useEffect(() => {
    if (!allowPersonalInfo && playerInfo) {
      dispatch(setInfoOfPlayer(null));
    }
  }, [allowPersonalInfo, playerInfo, dispatch]);
  const saveDataIcon = !opponentTeamName || !setNumber;

  const [draggedOverZone, setDraggedOverZone] = useState<{
    zoneIndex: number;
    teamType: "rival";
  } | null>(null);

  // Drag and Drop handlers для playground
  function createDropHandler(zoneIndex: number, teamType: "rival") {
    return (e: React.DragEvent) => {
      e.preventDefault();
      setDraggedOverZone(null);
      const playerData = e.dataTransfer.getData("player");
      const team = e.dataTransfer.getData("team");

      if (!playerData) return;

      // Проверяем, что это перенос из squads (нет currentZone)
      const currentZone = e.dataTransfer.getData("currentZone");
      if (currentZone) return; // Это возврат игрока, не обрабатываем здесь

      const player = JSON.parse(playerData) as TPlayer;
      // Используем zones[zoneIndex] для получения boardPosition, так как в slice ищется по boardPosition
      const boardPosition = zones[zoneIndex];

      // Проверяем, что команда совпадает (только для rival, так как homeTeam больше не используется)
      if (team === "rival" && teamType === "rival") {
        dispatch(filterGuestPlayers(player.name));
        dispatch(setGuestTeamIndexOfZones({ player, zone: boardPosition }));
      }
    };
  }

  function createDragOverHandler(zoneIndex: number, teamType: "rival") {
    return (e: React.DragEvent) => {
      e.preventDefault();
      const team = e.dataTransfer.getData("team");
      const currentZone = e.dataTransfer.getData("currentZone");

      // Показываем визуальную индикацию только если это перенос из squads (нет currentZone) и команда совпадает
      if (
        !currentZone &&
        team === "rival" &&
        teamType === "rival" &&
        guestTeamOptions.length > 0
      ) {
        // Проверяем, занята ли зона другим игроком
        const boardPosition = zones[zoneIndex];
        const existingPlayer = guestTeamOptions.find(
          (p) => p.boardPosition === boardPosition
        );

        // Получаем данные о перетаскиваемом игроке
        const playerData = e.dataTransfer.getData("player");

        // Если зона занята другим игроком (не пустая и не тот же игрок)
        if (existingPlayer) {
          const isOccupied =
            existingPlayer.name && existingPlayer.name.trim() !== "";
          if (isOccupied && playerData) {
            const player = JSON.parse(playerData) as TPlayer;
            // Если это другой игрок, запрещаем дроп
            if (existingPlayer.name !== player.name) {
              e.dataTransfer.dropEffect = "none";
              setDraggedOverZone(null);
              return;
            }
          } else if (isOccupied && !playerData) {
            e.dataTransfer.dropEffect = "none";
            setDraggedOverZone(null);
            return;
          }
        }

        e.dataTransfer.dropEffect = "move";
        setDraggedOverZone({ zoneIndex, teamType: "rival" });
      }
    };
  }

  function handleDragLeaveZone() {
    setDraggedOverZone(null);
  }

  // Обработчики для ячейки либеро
  function createLiberoDropHandler() {
    return (e: React.DragEvent) => {
      e.preventDefault();
      setDraggedOverZone(null);
      const playerData = e.dataTransfer.getData("player");
      const team = e.dataTransfer.getData("team");

      if (!playerData) return;

      // Проверяем, что это перенос из squads (нет currentZone)
      const currentZone = e.dataTransfer.getData("currentZone");
      if (currentZone) return; // Это возврат игрока, не обрабатываем здесь

      const player = JSON.parse(playerData) as TPlayer;

      // Разрешаем дроп любого игрока в ячейку либеро
      if (team === "rival") {
        dispatch(filterGuestPlayers(player.name));
        dispatch(setGuestTeamIndexOfZones({ player, zone: -1 }));
      }
    };
  }

  function createLiberoDragOverHandler() {
    return (e: React.DragEvent) => {
      e.preventDefault();
      const team = e.dataTransfer.getData("team");
      const currentZone = e.dataTransfer.getData("currentZone");

      // Показываем визуальную индикацию только если это перенос из squads (нет currentZone) и команда совпадает
      if (!currentZone && team === "rival" && guestTeamOptions.length > 0) {
        // Получаем данные о перетаскиваемом игроке
        const playerData = e.dataTransfer.getData("player");

        if (!playerData) {
          e.dataTransfer.dropEffect = "none";
          setDraggedOverZone(null);
          return;
        }

        const player = JSON.parse(playerData) as TPlayer;

        // Проверяем, занята ли ячейка либеро
        const existingLibero = guestTeamOptions.find(
          (p) => p.boardPosition === -1
        );

        // Если ячейка занята другим игроком
        if (
          existingLibero &&
          existingLibero.name &&
          existingLibero.name.trim() !== ""
        ) {
          // Если это другой игрок, запрещаем дроп
          if (existingLibero.name !== player.name) {
            e.dataTransfer.dropEffect = "none";
            setDraggedOverZone(null);
            return;
          }
        }

        // Разрешаем дроп любого игрока в ячейку либеро
        e.dataTransfer.dropEffect = "move";
        setDraggedOverZone({ zoneIndex: -1, teamType: "rival" });
      }
    };
  }

  // Пустые обработчики для блокировки дропа в занятые зоны
  function blockDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  function blockDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "none";
  }

  const tieBreak =
    setNumber === "Set 3 (short)" || setNumber === "Set 5 (short)";
  const tieBreakScore = myScore >= 15 || rivalScore >= 15;
  const normalSetScore = myScore >= 25 || rivalScore >= 25;
  const endOfTheSet = tieBreak
    ? (tieBreakScore && myScore - rivalScore === (+2 || -2)) ||
      (tieBreakScore && (myScore - rivalScore > 1 || rivalScore - myScore > 1))
    : (normalSetScore && myScore - rivalScore === (+2 || -2)) ||
      (normalSetScore &&
        (myScore - rivalScore > 1 || rivalScore - myScore > 1));
  const saveButton =
    [0, 1, 2, 3, 4, 5].every((zoneIndex) => {
      const boardPosition = zones[zoneIndex];
      return guestTeamOptions.some(
        (p) =>
          p &&
          typeof p.boardPosition === "number" &&
          p.boardPosition === boardPosition &&
          p.number !== 0
      );
    }) &&
    !showSquads &&
    !saveDataIcon &&
    endOfTheSet;
  useEffect(() => {
    if (!allowPersonalInfo && playerInfo) {
      dispatch(setInfoOfPlayer(null));
    }
  }, [allowPersonalInfo, playerInfo, dispatch]);

  function getSetterPosition() {
    const seTTer = guestTeamOptions?.find((plaer) => plaer.position === "SET");
    if (!seTTer) return 0;
    return correctZones(guestTeamOptions.indexOf(seTTer));
  }

  function rankByValue<T extends TMix>(
    criteria: keyof TMix | "earnedPoints",
    arr: T[]
  ) {
    const properArr = criteria === "name" ? currentGameStats : arr;
    const getValue = (obj: TMix, crit: keyof TMix | "earnedPoints"): number => {
      if (crit === "earnedPoints") {
        return (
          isFieldExist(obj["A++"]) +
          isFieldExist(obj.blocks) +
          isFieldExist(obj["S++"])
        );
      }
      return isFieldExist(obj[crit as keyof TMix] as number);
    };
    !isBiggest
      ? properArr.sort((a, b) =>
          compare(getValue(b, criteria), getValue(a, criteria))
        )
      : properArr.sort((a, b) =>
          compare(getValue(a, criteria), getValue(b, criteria))
        );
    setIsBiggest(!isBiggest);
  }
  function calculateForTeamDataV2<T extends TMix>(obj: T): TMix {
    return obj;
  }
  // ============================================
  // ЛОГИКА НАКОПЛЕНИЯ СТАТИСТИКИ:
  // ============================================
  // МЕТОД: Каждое очко = объект в gameLog
  // Структура: gameLog = [
  //   { score: "1-0", weServe: true, stats: [player1, player2, ...] },
  //   { score: "2-0", weServe: false, stats: [player1, player3, ...] },
  //   ...
  // ]
  //
  // ПРОЦЕСС СУММИРОВАНИЯ:
  // 1. Извлекаем все статы из всех ралли (очков)
  // 2. Группируем по именам игроков
  // 3. Для каждого игрока суммируем все его действия из всех очков
  // 4. Результат - массив игроков с суммированными статами за весь сет
  // ============================================

  // ============================================
  // ПОДСЧЕТ ТЕКУЩЕЙ СТАТИСТИКИ ИЗ GAMELOG
  // ============================================
  // Источник данных: gameLog (массив всех сыгранных ралли)
  // Каждое ралли содержит: { score, weServe, stats: [player1, player2, ...] }
  //
  // ПРОЦЕСС:
  // 1. Извлекаем все статы игроков из всех ралли в gameLog
  // 2. Группируем по именам игроков
  // 3. Для каждого игрока суммируем все его действия из всех ралли
  // 4. Результат - массив игроков с суммированными статами за весь сет
  // ============================================

  // Шаг 1: Извлекаем все статы игроков из всех очков (ралли)
  // gameLog.map((rally) => rally.stats) - получаем массив массивов: [[player1, player2], [player3], ...]
  // .flat() - "разворачиваем" в один плоский массив: [player1, player2, player3, ...]
  // Если ралли имеет stats: [] (быстрое очко без действий), оно просто не добавит элементов
  const allRallyStats = gameLog.map((rally) => rally.stats).flat();

  // Шаг 2: Получаем уникальные имена игроков из всех ралли
  // Это нужно, чтобы суммировать действия каждого игрока отдельно
  // filter(Boolean) убирает пустые/undefined имена
  const uniquePlayerNames = [
    ...new Set(allRallyStats.map((player) => player.name).filter(Boolean)),
  ];

  // Шаг 3: Для каждого игрока суммируем все его действия из всех ралли
  // calculateTotalofActionsV2:
  //   - Фильтрует все записи с именем игрока из allRallyStats
  //   - Для каждого типа действия (R++, R+, A++, A+, A=, A!, A-, S++, S+, S=, S!, S-, R++, R+, R=, R!, R-, blocks)
  //     суммирует значения через reduce
  //   - Использует isFieldExist для обработки undefined/null (возвращает 0, если поле отсутствует)
  //   - Возвращает объект с суммированными статами и именем игрока
  //
  // ВАЖНО: Если в объекте игрока отсутствует поле (потому что было 0 и удалено через forSoloGameStat),
  //         isFieldExist вернет 0, что правильно для суммирования
  const currentGameStats = uniquePlayerNames.map((playerName) => {
    const summed = calculateTotalofActionsV2(allRallyStats, playerName);
    return summed;
  });

  const playersStats = [currentGameStats]; // Обертываем в массив для StatisticsTable

  const fullGameStats = calculateForTeamDataV2(
    calculateTotalofActions(allRallyStats) as TMix
  );
  console.log(gameLog);
  return (
    <>
      {openUndoConfirmWindow && (
        <ConfirmField
          onClick={() => {
            undoLastRally();
            setOpenUndoConfirmWindow(false);
          }}
          setOpenConfirmWindow={setOpenUndoConfirmWindow}
        />
      )}
      {openResetConfirmWindow && (
        <ConfirmField
          onClick={() => {
            resetTheBoardForGuestTeam();
            setOpenResetConfirmWindow(false);
          }}
          setOpenConfirmWindow={setOpenResetConfirmWindow}
        />
      )}
      <article className="main-content-wrapper">
        {/* На мобильных (меньше 768px) squad выше playground */}
          {isMobile && showGuestTeam && showSquads && (
          <>
              <Squads allowPersonalInfo={allowPersonalInfo} />
            {/* Squad для my-team скрыт в обычном режиме, показывается только в statistic mode */}
          </>
        )}
        {/* Squad для my-team показывается только в statistic mode (!showSquads) */}
        {/* На десктопе порядок как раньше */}
        {/* Скрываем squad для rival в statistic mode (!showSquads) - показываем только когда showSquads === true */}
      {!showCurrentGameStats && !isMobile && showGuestTeam && showSquads && (
        <Squads allowPersonalInfo={allowPersonalInfo} />
        )}
        {!showCurrentGameStats && !showSquads && (
          <RotationPanel
            rivalTeam={false}
            weServe={weServe}
            setWeServe={setWeServe}
            score={myScore}
            rivalScore={rivalScore}
            currentScore={currentScore}
            setScore={setMyScore}
            setNextRotation={setNextRotation}
            gameLog={gameLog}
            setGameLog={setGameLog}
            setstatsForTeam={setstatsForTeam}
            statsForTeam={statsForTeam}
            endOfTheSet={endOfTheSet}
            setPreviousScore={setPreviousMyScore}
            previousScore={previousMyScore}
            rivalRotation={rivalRotation}
            setRivalRotation={setRivalRotation}
          />
        )}
        <SectionWrapper className="playground-section" backGround={null}>
          {!showGuestTeam && <ChooseGuestTeam />}
          {playerInfoWindow && <PersonalInformationOfPlayer link="page1" />}
          {!playerInfoWindow && showGuestTeam && !showCurrentGameStats && (
            <>
              <form
                className={`rotation-field-wrapper ${
                  !showSquads ? "statistic-mode" : ""
                }`}
                onSubmit={saveSpikeData}
              >
                {showGuestTeam ? (
                  <>
                    {[0, 1, 2, 3, 4, 5].every((zoneIndex) => {
                      const boardPosition = zones[zoneIndex];
                      return guestTeamOptions.some(
                        (p) =>
                          p &&
                          typeof p.boardPosition === "number" &&
                          p.boardPosition === boardPosition &&
                          p.number !== 0
                      );
                    }) &&
                      guestTeamOptions.some((p) => p.boardPosition === -1) && (
                        <div
                          className="match-number-wrapper"
                          style={{ width: "100%", flexDirection: "column" }}
                        >
                          <div>
                            {!showSquads && gameLog.length > 0 && (
                              <div style={{ position: "absolute", left: "0" }}>
                                <RegularButton
                                  onClick={() => setOpenUndoConfirmWindow(true)}
                                  type="button"
                                  $color="white"
                                  $background="#dc2626"
                                  title="Undo last rally"
                                >
                                  Undo
                                </RegularButton>
                              </div>
                            )}
                            <RegularButton
                              onClick={hideSquads}
                              type="button"
                              $color={!showSquads ? "orangered" : "#0272be"}
                              $background={
                                !showSquads ? "orangered" : "#0272be"
                              }
                              $active={!showSquads}
                              onMouseEnter={() => setHoverStatisticButton(true)}
                              onMouseLeave={() =>
                                setHoverStatisticButton(false)
                              }
                            >
                              {hoverStatisticButton
                                ? showSquads
                                  ? "Switch on"
                                  : "Switch off"
                                : "Statistic mode"}
                            </RegularButton>
                          </div>
                          {!showSquads && !showCurrentGameStats && (
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "30px",
                                padding: "10px 0 10px 0",
                              }}
                            >
                              <input
                                onChange={(e) =>
                                  setOpponentTeamName(
                                    firstLetterCapital(e.target.value)
                                  )
                                }
                                value={opponentTeamName}
                              ></input>
                              <h2
                                className={
                                  exhibitionGame ? "exhibition-game-active" : ""
                                }
                                style={{
                                  whiteSpace: "nowrap",
                                  cursor: "pointer",
                                  userSelect: "none",
                                  transition: "color 0.3s ease",
                                }}
                                onClick={() =>
                                  setExhibitionGame(!exhibitionGame)
                                }
                              >
                                Exhibition game
                              </h2>
                              <select
                                onChange={(e) => setSetNumber(e.target.value)}
                                value={setNumber}
                              >
                                <option value="">Choose set</option>
                                <option value="Set 1">Set 1</option>
                                <option value="Set 2">Set 2</option>
                                <option value="Set 3">Set 3</option>
                                <option value="Set 4">Set 4</option>
                                <option value="Set 5 (short)">
                                  Set 5 (short)
                                </option>
                                <option value="Set 3 (short)">
                                  Set 3 (short)
                                </option>
                              </select>
                            </div>
                          )}
                        </div>
                      )}
                    {showSquads && (
                      <div style={{ marginLeft: "auto" }}>
                        <RegularButton
                          onClick={() => setOpenResetConfirmWindow(true)}
                          type="button"
                          $color="orangered"
                          $background="white"
                        >
                          Reset
                        </RegularButton>
                      </div>
                    )}
                  </>
                ) : (
                  <div></div>
                )}
                {!showCurrentGameStats && (
                  <>
                    <div className="row-zones-wrapper">
                      {[0, 1, 2, 3, 4, 5].map((zoneIndex) => {
                        const boardPosition = zones[zoneIndex];
                        const player = Array.isArray(guestTeamOptions)
                          ? guestTeamOptions.find(
                              (p) =>
                                p &&
                                typeof p.boardPosition === "number" &&
                                p.boardPosition === boardPosition &&
                                p.number !== 0
                            )
                          : null;
                        // Всегда показываем зону - либо с игроком, либо пустую для перетаскивания
                        return player ? (
                          <div
                            key={zoneIndex}
                            onDrop={blockDrop}
                            onDragOver={blockDragOver}
                            onDragLeave={handleDragLeaveZone}
                            style={{
                              backgroundColor:
                                draggedOverZone?.zoneIndex === zoneIndex &&
                                draggedOverZone?.teamType === "rival"
                                  ? "rgba(2, 114, 190, 0.3)"
                                  : "transparent",
                              border:
                                draggedOverZone?.zoneIndex === zoneIndex &&
                                draggedOverZone?.teamType === "rival"
                                  ? "2px dashed #0272be"
                                  : "none",
                              borderRadius: "8px",
                              transition: "all 0.2s ease",
                            }}
                          >
                          <IconOfPlayer
                            showSquads={showSquads}
                            player={player}
                            startingSix={guestTeamOptions}
                            nextRotation={nextRotation}
                            setNextRotation={setNextRotation}
                            exhibitionGame={exhibitionGame}
                            allowPersonalInfo={allowPersonalInfo}
                          />
                          </div>
                        ) : (
                          <div
                            className="zone-names-wrapper"
                            key={"_" + zoneIndex}
                            onDrop={createDropHandler(zoneIndex, "rival")}
                            onDragOver={createDragOverHandler(
                              zoneIndex,
                              "rival"
                            )}
                            onDragLeave={handleDragLeaveZone}
                            style={{
                              backgroundColor:
                                draggedOverZone?.zoneIndex === zoneIndex &&
                                draggedOverZone?.teamType === "rival"
                                  ? "rgba(2, 114, 190, 0.5)"
                                  : "rgba(2, 114, 190, 0.1)",
                              border:
                                draggedOverZone?.zoneIndex === zoneIndex &&
                                draggedOverZone?.teamType === "rival"
                                  ? "3px solid #0272be"
                                  : "3px solid rgba(2, 114, 190, 0.8)",
                              borderRadius: "8px",
                              transition: "all 0.2s ease",
                              minHeight: "96px",
                            }}
                          >
                            P{correctZones(zoneIndex)}
                          </div>
                        );
                      })}
                      {/* Ячейка для либеро - размещена под зоной P6 */}
                      {/* Показываем ячейку либеро только когда все 6 основных зон заполнены */}
                      {guestTeamOptions.length > 0 &&
                        [0, 1, 2, 3, 4, 5].every((zoneIndex) => {
                          const boardPosition = zones[zoneIndex];
                          return guestTeamOptions.some(
                            (p) =>
                              p &&
                              typeof p.boardPosition === "number" &&
                              p.boardPosition === boardPosition &&
                              p.number !== 0
                          );
                        }) &&
                        (() => {
                          // Ищем игрока, который находится в ячейке либеро (boardPosition === -1)
                          const libero = guestTeamOptions.find(
                            (p) => p.boardPosition === -1
                          );
                          return libero ? (
                            <div
                              key="libero-filled"
                              onDrop={blockDrop}
                              onDragOver={blockDragOver}
                              onDragLeave={handleDragLeaveZone}
                              style={{
                                backgroundColor: "transparent",
                                border: "none",
                                borderRadius: "8px",
                                transition: "all 0.2s ease",
                                gridColumn: "2",
                                maxHeight: "250px",
                                overflow: "visible",
                                marginTop: "10px",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "flex-start",
                              }}
                            >
                            <IconOfPlayer
                              showSquads={showSquads}
                              player={libero}
                              startingSix={guestTeamOptions}
                              nextRotation={nextRotation}
                              setNextRotation={setNextRotation}
                              exhibitionGame={exhibitionGame}
                              allowPersonalInfo={allowPersonalInfo}
                            />
                            </div>
                          ) : (
                            <div
                              className="zone-names-wrapper"
                              key="libero-empty"
                              onDrop={createLiberoDropHandler()}
                              onDragOver={createLiberoDragOverHandler()}
                              onDragLeave={handleDragLeaveZone}
                              style={{
                                backgroundColor:
                                  draggedOverZone?.zoneIndex === -1 &&
                                  draggedOverZone?.teamType === "rival"
                                    ? "rgba(64, 224, 208, 0.5)"
                                    : "rgba(64, 224, 208, 0.1)",
                                border:
                                  draggedOverZone?.zoneIndex === -1 &&
                                  draggedOverZone?.teamType === "rival"
                                    ? "3px solid turquoise"
                                    : "3px solid rgba(64, 224, 208, 0.8)",
                                borderRadius: "8px",
                                transition: "all 0.2s ease",
                                height: "50px",
                                minHeight: "50px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gridColumn: "2",
                                marginTop: "10px",
                              }}
                            >
                              <div
                                style={{
                                  color: "turquoise",
                                  fontWeight: "bold",
                                }}
                              >
                                LIBERO
                              </div>
                            </div>
                          );
                        })()}
                    </div>
                  </>
                )}
                {currentGameStats.length > 0 &&
                  !showSquads &&
                  !showCurrentGameStats && (
                    <RegularButton
                      onClick={() => setShowCurrentGameStats(true)}
                      type="button"
                      $color="#0057b8"
                      $background="#ffd700"
                    >
                      Live Stats
                    </RegularButton>
                  )}
                <div className="button-save-wrapper">
                  {saveButton && (
                    <RegularButton
                      type="submit"
                      $color="black"
                      $background="#ffd700"
                    >
                      Save Data
                    </RegularButton>
                  )}
                </div>
                {showSquads &&
                  zeroZero &&
                  !opponentTeamName &&
                  !setNumber &&
                  [0, 1, 2, 3, 4, 5].every((zoneIndex) => {
                    const boardPosition = zones[zoneIndex];
                    return guestTeamOptions.some(
                      (p) =>
                        p &&
                        typeof p.boardPosition === "number" &&
                        p.boardPosition === boardPosition &&
                        p.number !== 0 &&
                        p.position !== "LIB"
                    );
                  }) && (
                    <div className="rotation-buttons-wrapper">
                      <button
                        onClick={() => rotateFront()}
                        disabled={endOfTheSet}
                        style={{ borderRadius: "20px 0px 0px 20px" }}
                      >
                        +
                      </button>
                      <h1>P{getSetterPosition()}</h1>
                      <button
                        onClick={() => rotateBack()}
                        style={{ borderRadius: "0px 20px 20px 0px" }}
                      >
                        -
                      </button>
                    </div>
                  )}
                {showGuestTeam && showSquads && zeroZero && (
                  <div className="showRatings">
                    <NavLink to={"/Ratings"}>
                      <RegularButton
                        onClick={() => dispatch(setInfoOfPlayer(null))}
                        type="button"
                        $color="#0057b8"
                        $background="#ffd700"
                      >
                        Ratings
                      </RegularButton>
                    </NavLink>
                    <NavLink to={"/GamesStatistic"}>
                      <RegularButton
                        onClick={() => dispatch(setInfoOfPlayer(null))}
                        type="button"
                        $color="#0057b8"
                        $background="#ffd700"
                      >
                        Games Statistic
                      </RegularButton>
                    </NavLink>
                  </div>
                )}
              </form>
            </>
          )}
        </SectionWrapper>
        {showCurrentGameStats && (
          <SectionWrapper className="ratings-section full-width">
            <div
              style={{
                marginBottom: "12px",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <RegularButton
                onClick={() => setShowCurrentGameStats(false)}
                type="button"
                $color="#0057b8"
                $background="#ffd700"
              >
                Back to Recording
              </RegularButton>
            </div>
            <StatisticsTable
              playersStats={playersStats}
              fullGameStats={fullGameStats}
              rankByValue={rankByValue}
              showLegend={true}
            />
            <div className="diagram-wrapper">
              <pre>
                <Diagramm link="Reception" data={fullGameStats} />
              </pre>
              <pre>
                <Diagramm link="Attack" data={fullGameStats} />
              </pre>
              <pre>
                <Diagramm link="Service" data={fullGameStats} />
              </pre>
            </div>
          </SectionWrapper>
        )}
        {/* На десктопе вторая панель squad идет после playground */}
        {/* Squad для my-team скрыт в обычном режиме, показывается только в statistic mode */}
        {/* Squad для my-team показывается только в statistic mode (!showSquads) */}
        {!showCurrentGameStats && !showSquads && (
          <RotationPanel
            opponentTeamName={opponentTeamName}
            rivalTeam={true}
            weServe={!weServe}
            setWeServe={setWeServe}
            score={rivalScore}
            rivalScore={myScore}
            currentScore={currentScore}
            setScore={setRivalScore}
            setNextRotation={setNextRotation}
            gameLog={gameLog}
            setGameLog={setGameLog}
            setstatsForTeam={setstatsForTeam}
            statsForTeam={statsForTeam}
            endOfTheSet={endOfTheSet}
            setPreviousScore={setPreviousRivalScore}
            previousScore={previousRivalScore}
            rivalRotation={rivalRotation}
            setRivalRotation={setRivalRotation}
          />
        )}
      </article>
    </>
  );
}
