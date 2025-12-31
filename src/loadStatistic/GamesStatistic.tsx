import { useSelector } from "react-redux";
import {
  selectFilteredGameStats,
  setgameFilterByTeam,
} from "../states/slices/gamesStatsSlice";
import { ChangeEvent, useEffect, useState } from "react";
import { TGameStats, TMix, TObjectStats, TPlayer } from "../types/types";
import SectionWrapper from "../wrappers/SectionWrapper";
import {
  calculateTotalofActions,
  categorys,
  compare,
  isFieldExist,
  jusName,
} from "../utilities/functions";
import { StatisticsTable } from "../ratings/components/StatisticsTable";
import { selectListOfTeams } from "../states/slices/listOfTeamsSlice";
import { selectPlayerInfo } from "../states/slices/playerInfoSlice";
import { PersonalInformationOfPlayer } from "../personalInfo/PersonalInformationOfPlayer";
import { useAppDispatch } from "../states/store";
import { RegularButton } from "../css/Button.styled";
import Diagramm from "../personalInfo/components/Diagramm";
import { useSetWidth } from "../utilities/useSetWidth";
import DetailedStats from "./DetailedStats";
import {
  selectDetailedStatsOfPlayer,
  setDetailedStatsOfPlayer,
} from "../states/slices/detailedStatsOfPlayerSlice";
import GameLogs from "./GameLogs";
import { selectGuestTeam } from "../states/slices/guestTeamSlice";

export default function GamesStatistic() {
  const dispatch = useAppDispatch();
  const isBurger = useSetWidth() > 767;
  const listOfTeams = useSelector(selectListOfTeams);
  const playerInfo = useSelector(selectPlayerInfo);
  const filteredGamesStats = useSelector(selectFilteredGameStats);
  const detailedStatsOfPlayer = useSelector(selectDetailedStatsOfPlayer);
  const guestTeam = useSelector(selectGuestTeam);
  const [filter] = useState("");
  const [filteredGames, setFilteredGames] = useState<TGameStats[]>([]);
  const [gameLogs, setGameLogs] = useState<TObjectStats[]>([]);
  const [detailedStats, setDetailedStats] = useState<TPlayer[][]>([]);
  const [choosenGameStats, setChoosenGameStats] = useState<TPlayer[][]>([]);
  const [choosenSet, setChoosenSet] = useState<string>("full");
  const [saveFullGameStats, setSaveFullGameStats] = useState<TPlayer[][]>([]);
  const [isBiggest, setIsBiggest] = useState<boolean>(false);
  const [isShowDistribution, setIsShowDistribution] = useState<boolean>(false);
  const [showOnlyExhibition, setShowOnlyExhibition] = useState<boolean>(false);
  const [showOnlyOfficial, setShowOnlyOfficial] = useState<boolean>(false);
  const [collapsedDates, setCollapsedDates] = useState<Set<string>>(new Set());
  const [datesInitialized, setDatesInitialized] = useState<boolean>(false);

  useEffect(() => {
    dispatch(setgameFilterByTeam(guestTeam[0]?.name));
  }, [dispatch, guestTeam]);

  function calculateForTeamData<T extends TMix>(obj: T): TMix {
    if (filter.length === 0) return obj;
    const teamName = filter.split(" ")[0];
    const filtered = listOfTeams.filter((team) => team.name === teamName);
    const team = { ...filtered[0] };
    const newObj = { ...obj };
    for (const key in team) {
      (team[key as keyof TMix] as number) = newObj[key as keyof T] as number;
    }
    return team;
  }
  function rankByValue<T extends TMix>(criteria: keyof TMix | "earnedPoints", arr: T[]) {
    const properArr = criteria === "name" ? choosenGameStats.flat() : arr;
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

  function setAllGames() {
    setChoosenGameStats([]);
    // Проверяем, все ли игры из filteredByExhibition выбраны
    const allSelected =
      filteredByExhibition.length > 0 &&
      filteredByExhibition.every((game) =>
        filteredGames.some(
          (selectedGame) =>
            Object.keys(selectedGame)[0] === Object.keys(game)[0]
        )
      );

    if (allSelected) {
      // Если все выбраны, снимаем выбор со всех и сворачиваем все даты
      setFilteredGames([]);
      setCollapsedDates(new Set(dates));
    } else {
      // Если не все выбраны, выбираем все из filteredByExhibition и раскрываем все даты
      setFilteredGames([...filteredByExhibition]);
      setCollapsedDates(new Set());
    }
  }

  function setAllOfficialGames() {
    setChoosenGameStats([]);
    // Проверяем, все ли игры из filteredByOfficial выбраны
    const allSelected =
      filteredByOfficial.length > 0 &&
      filteredByOfficial.every((game) =>
        filteredGames.some(
          (selectedGame) =>
            Object.keys(selectedGame)[0] === Object.keys(game)[0]
        )
      );

    if (allSelected) {
      // Если все выбраны, снимаем выбор со всех и сворачиваем все даты
      setFilteredGames([]);
      setCollapsedDates(new Set(dates));
    } else {
      // Если не все выбраны, выбираем все из filteredByOfficial и раскрываем все даты
      setFilteredGames([...filteredByOfficial]);
      setCollapsedDates(new Set());
    }
  }

  function setFilterForGames(game: TGameStats) {
    setChoosenGameStats([]);
    filteredGames.some((match) => match === game)
      ? setFilteredGames(filteredGames.filter((match) => match !== game))
      : filteredGames.push(game);
  }

  function setAllGamesForDate(date: string) {
    setChoosenGameStats([]);
    const gamesForDate = gamesByDate[date];
    if (!gamesForDate || gamesForDate.length === 0) return;

    // Проверяем, все ли игры этой даты выбраны
    const allSelected = gamesForDate.every((game) =>
      filteredGames.some(
        (selectedGame) => Object.keys(selectedGame)[0] === Object.keys(game)[0]
      )
    );

    if (allSelected) {
      // Если все выбраны, снимаем выбор со всех игр этой даты и сворачиваем
      const gameKeys = gamesForDate.map((game) => Object.keys(game)[0]);
      setFilteredGames(
        filteredGames.filter((game) => {
          const gameKey = Object.keys(game)[0];
          return !gameKeys.includes(gameKey);
        })
      );
      setCollapsedDates((prev) => {
        const newSet = new Set(prev);
        newSet.add(date);
        return newSet;
      });
    } else {
      // Если не все выбраны, выбираем все игры этой даты и раскрываем
      const gamesToAdd = gamesForDate.filter((game) => {
        const gameKey = Object.keys(game)[0];
        return !filteredGames.some(
          (selectedGame) => Object.keys(selectedGame)[0] === gameKey
        );
      });
      setFilteredGames([...filteredGames, ...gamesToAdd]);
      setCollapsedDates((prev) => {
        const newSet = new Set(prev);
        newSet.delete(date);
        return newSet;
      });
    }
  }

  function setChoosenGames() {
    dispatch(setDetailedStatsOfPlayer(""));
    setChoosenSet("full");
    const choosenDetailedStats = filteredGames
      .map((set) => Object.values(set).flat())
      .flat();
    setGameLogs(choosenDetailedStats);
    const flatFullSizeGameStat = choosenDetailedStats
      .map((rally) => Object.values(rally).flat())
      .flat();
    // Фильтруем пустые stats массивы (быстрые очки без действий)
    // Это нужно для поддержки новых ралли с пустым stats: []
    const finalResult = flatFullSizeGameStat
      .map((rally) => rally.stats)
      .filter((stats) => stats && stats.length > 0); // Убираем пустые массивы
    setChoosenGameStats(finalResult);
    setDetailedStats(finalResult);
    if (filteredGames.length === 1) {
      setSaveFullGameStats(finalResult);
    }
  }

  //Обираємо потрібний сет
  function handleChoosenSet(e: ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    if (value === "full") {
      setChoosenSet(value);
      setChoosenGameStats(saveFullGameStats);
      setDetailedStats(saveFullGameStats);
      setGameLogs([soloGame]);
      return;
    }
    // Фильтруем пустые stats массивы (быстрые очки без действий)
    // Это нужно для поддержки новых ралли с пустым stats: []
    const choosenSet = soloGame[value]
      .map((rally) => rally.stats)
      .filter((stats) => stats && stats.length > 0); // Убираем пустые массивы
    setChoosenGameStats(choosenSet);
    setDetailedStats(choosenSet);
    setChoosenSet(value);
    setGameLogs([{ value: soloGame[value] }]);
  }

  const sortedGames = filteredGamesStats.sort((a, b) =>
    compare(
      new Date(Object.keys(b)[0].split(";")[0]).getTime(),
      new Date(Object.keys(a)[0].split(";")[0]).getTime()
    )
  );

  // Фильтрация по exhibition games
  const filteredByExhibition = showOnlyExhibition
    ? sortedGames.filter((game) => {
        const gameKey = Object.keys(game)[0];
        return gameKey.includes("Exhibition game");
      })
    : sortedGames;

  // Фильтрация по official games (не exhibition)
  const filteredByOfficial = showOnlyOfficial
    ? sortedGames.filter((game) => {
        const gameKey = Object.keys(game)[0];
        return !gameKey.includes("Exhibition game");
      })
    : sortedGames;

  // Определяем какой фильтр активен и используем соответствующий список
  const activeFilteredGames = showOnlyExhibition
    ? filteredByExhibition
    : showOnlyOfficial
    ? filteredByOfficial
    : sortedGames;

  // Группировка игр по дате
  const gamesByDate = activeFilteredGames.reduce((acc, game) => {
    const gameKey = Object.keys(game)[0];
    const date = gameKey.split(";")[0].trim();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(game);
    return acc;
  }, {} as Record<string, TGameStats[]>);

  const dates = Object.keys(gamesByDate).sort((a, b) =>
    compare(new Date(b).getTime(), new Date(a).getTime())
  );

  // Инициализация свернутых дат - все даты свернуты по умолчанию
  useEffect(() => {
    if (dates.length > 0 && !datesInitialized) {
      setCollapsedDates(new Set(dates));
      setDatesInitialized(true);
    } else if (dates.length > 0 && datesInitialized) {
      // При изменении фильтра сохраняем состояние существующих дат, новые даты добавляем как свернутые
      setCollapsedDates((prev) => {
        const newSet = new Set<string>();
        dates.forEach((date) => {
          if (prev.has(date)) {
            newSet.add(date);
          } else {
            newSet.add(date);
          }
        });
        return newSet;
      });
    }
  }, [dates.length, datesInitialized]);

  function toggleDateCollapse(date: string) {
    setCollapsedDates((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(date)) {
        newSet.delete(date);
      } else {
        newSet.add(date);
      }
      return newSet;
    });
  }

  const fullGameStats = calculateForTeamData(
    calculateTotalofActions(choosenGameStats.flat()) as TMix
  );

  const soloGame = filteredGames.map((game) => Object.values(game)).flat()[0];
  const oneGame = filteredGames.length === 1 && choosenGameStats.length > 0;

  return (
    <article className="main-content-wrapper">
      <SectionWrapper className="ratings-section">
        {playerInfo ? (
          <PersonalInformationOfPlayer link="page1" />
        ) : (
          <>
            <nav>
              <div className="choosen-game-filter-wrapper">
                <div className="filters-column">
                  <div className="filters-row">
                    <label
                      htmlFor="exhibition-filter"
                      className={`filter-button ${showOnlyExhibition ? "active" : ""}`}
                    >
                      <input
                        type="checkbox"
                        id="exhibition-filter"
                        checked={showOnlyExhibition}
                        onChange={(e) => {
                          setShowOnlyExhibition(e.target.checked);
                          if (e.target.checked) setShowOnlyOfficial(false);
                        }}
                      />
                      <span>Show only Exhibition games</span>
                    </label>
                    <label
                      htmlFor="official-filter"
                      className={`filter-button ${showOnlyOfficial ? "active" : ""}`}
                    >
                      <input
                        type="checkbox"
                        id="official-filter"
                        checked={showOnlyOfficial}
                        onChange={(e) => {
                          setShowOnlyOfficial(e.target.checked);
                          if (e.target.checked) setShowOnlyExhibition(false);
                        }}
                      />
                      <span>Show official games</span>
                    </label>
                    {showOnlyExhibition && (
                      <label
                        className={`filter-button ${filteredGames.length === filteredByExhibition.length && filteredByExhibition.length > 0 ? "active" : ""}`}
                      >
                        <input
                          type="checkbox"
                          value={"Check all"}
                          onChange={setAllGames}
                          checked={
                            filteredGames.length ===
                              filteredByExhibition.length &&
                            filteredByExhibition.length > 0
                          }
                        />
                        <span>
                          {filteredGames.length ===
                            filteredByExhibition.length &&
                          filteredByExhibition.length > 0
                            ? "Remove all exhibition games"
                            : "Check all exhibition games"}
                        </span>
                      </label>
                    )}
                    {showOnlyOfficial && (
                      <label
                        className={`filter-button ${filteredGames.length === filteredByOfficial.length && filteredByOfficial.length > 0 ? "active" : ""}`}
                      >
                        <input
                          type="checkbox"
                          value={"Check all official"}
                          onChange={setAllOfficialGames}
                          checked={
                            filteredGames.length ===
                              filteredByOfficial.length &&
                            filteredByOfficial.length > 0
                          }
                        />
                        <span>
                          {filteredGames.length === filteredByOfficial.length &&
                          filteredByOfficial.length > 0
                            ? "Remove all official games"
                            : "Check all official games"}
                        </span>
                      </label>
                    )}
                    {!showOnlyExhibition && !showOnlyOfficial && (
                      <label
                        className={`filter-button ${filteredGames.length === sortedGames.length && sortedGames.length > 0 ? "active" : ""}`}
                      >
                        <input
                          type="checkbox"
                          value={"Check all"}
                          onChange={() => {
                            setChoosenGameStats([]);
                            const allSelected =
                              sortedGames.length > 0 &&
                              sortedGames.every((game) =>
                                filteredGames.some(
                                  (selectedGame) =>
                                    Object.keys(selectedGame)[0] ===
                                    Object.keys(game)[0]
                                )
                              );

                            if (allSelected) {
                              setFilteredGames([]);
                              setCollapsedDates(new Set(dates));
                            } else {
                              setFilteredGames([...sortedGames]);
                              setCollapsedDates(new Set());
                            }
                          }}
                          checked={
                            filteredGames.length === sortedGames.length &&
                            sortedGames.length > 0
                          }
                        />
                        <span>
                          {filteredGames.length === sortedGames.length &&
                          sortedGames.length > 0
                            ? "Remove All"
                            : "Check All"}
                        </span>
                      </label>
                    )}
                  </div>
                </div>
                <div className="dates-column">
                    {dates.map((date) => {
                      const isCollapsed = collapsedDates.has(date);
                      const gamesForDate = gamesByDate[date];
                      const allGamesForDateSelected =
                        gamesForDate.length > 0 &&
                        gamesForDate.every((game) =>
                          filteredGames.some(
                            (selectedGame) =>
                              Object.keys(selectedGame)[0] ===
                              Object.keys(game)[0]
                          )
                        );
                      return (
                        <div key={date} className="date-group-wrapper">
                          <div className="date-header">
                            <span
                              onClick={() => toggleDateCollapse(date)}
                              style={{
                                cursor: "pointer",
                                fontSize: "1.2em",
                                display: "flex",
                                alignItems: "center",
                                padding: "0 4px",
                              }}
                            >
                              {isCollapsed ? "▶" : "▼"}
                            </span>
                            <input
                              type="checkbox"
                              checked={allGamesForDateSelected}
                              onChange={(e) => {
                                e.stopPropagation();
                                setAllGamesForDate(date);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                cursor: "pointer",
                                width: "18px",
                                height: "18px",
                                margin: "0 8px",
                              }}
                            />
                            <span
                              onClick={() => toggleDateCollapse(date)}
                              style={{
                                cursor: "pointer",
                                flex: 1,
                              }}
                            >
                              {date}
                            </span>
                            <span
                              style={{
                                background: "rgba(255, 255, 255, 0.2)",
                                padding: "4px 10px",
                                borderRadius: "12px",
                                fontSize: "0.9em",
                                fontWeight: "500",
                              }}
                            >
                              ({gamesForDate.length})
                            </span>
                          </div>
                          {!isCollapsed && (
                            <div className="games-for-date">
                              {gamesForDate.map((game, index) => {
                                const gameKey = Object.keys(game)[0];
                                // Извлекаем только название команды соперника для более компактного отображения
                                const gameParts = gameKey.split(";");
                                const gameInfo = gameParts[1]?.trim() || "";
                                // Убираем дату из отображения, так как она уже в заголовке
                                const displayText = gameInfo || gameKey;
                                return (
                                  <div key={index}>
                                    <input
                                      onChange={() => setFilterForGames(game)}
                                      value={gameKey}
                                      type="checkbox"
                                      checked={filteredGames.some(
                                        (match) => match === game
                                      )}
                                    />
                                    <div title={gameKey}>{displayText}</div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
              <RegularButton onClick={setChoosenGames} type="button">
                Submit
              </RegularButton>
              {oneGame && (
                <div className="set-selection-wrapper">
                  {Object.keys(soloGame).map((set) => (
                    <div key={set}>
                      <div>{set}</div>
                      <input
                        type="checkbox"
                        value={set}
                        onChange={handleChoosenSet}
                        checked={set === choosenSet}
                      />
                    </div>
                  ))}
                  <div>
                    <div>Full game</div>
                    <input
                      type="checkbox"
                      value="full"
                      onChange={handleChoosenSet}
                      checked={"full" === choosenSet}
                    />
                  </div>
                </div>
              )}
            </nav>
            {choosenGameStats.length > 0 && (
              <>
                <StatisticsTable
                  playersStats={choosenGameStats}
                  fullGameStats={fullGameStats}
                  rankByValue={rankByValue}
                  showLegend={true}
                />
                <nav>
                  <GameLogs games={gameLogs} listOfGames={filteredGames} />
                  {!detailedStatsOfPlayer && (
                    <RegularButton
                      onClick={() => setIsShowDistribution(!isShowDistribution)}
                      type="button"
                      $color="black"
                      $background="orangered"
                    >
                      {!isShowDistribution
                        ? "Show Distribution"
                        : "Hide Distribution"}
                    </RegularButton>
                  )}
                </nav>
                {isShowDistribution && !detailedStatsOfPlayer && (
                  <DetailedStats
                    detailedStats={detailedStats}
                    distribution={true}
                  />
                )}
                {detailedStatsOfPlayer && (
                  <DetailedStats
                    detailedStats={detailedStats}
                    distribution={false}
                  />
                )}
                {!isShowDistribution && !detailedStatsOfPlayer && (
                  <div
                    className="diagram-wrapper"
                    style={!isBurger ? { flexDirection: "column" } : {}}
                  >
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
                )}
              </>
            )}
          </>
        )}
      </SectionWrapper>
    </article>
  );
}
