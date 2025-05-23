import { useSelector } from "react-redux";
import { selectFilteredGameStats, setgameFilterByTeam } from "../states/slices/gamesStatsSlice";
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
import { Categorys } from "../ratings/components/Categorys";
import { Rows } from "../ratings/components/Rows";
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
  function rankByValue<T extends TMix>(criteria: keyof TMix, arr: T[]) {
    const properArr = criteria === "name" ? choosenGameStats.flat() : arr;
    !isBiggest
      ? properArr.sort((a, b) =>
          compare(isFieldExist(b[criteria] as number), isFieldExist(a[criteria] as number))
        )
      : properArr.sort((a, b) =>
          compare(isFieldExist(a[criteria] as number), isFieldExist(b[criteria] as number))
        );
    setIsBiggest(!isBiggest);
  }

  function setAllGames() {
    setChoosenGameStats([]);
    filteredGames === sortedGames ? setFilteredGames([]) : setFilteredGames(sortedGames);
  }

  function setFilterForGames(game: TGameStats) {
    setChoosenGameStats([]);
    filteredGames.some((match) => match === game)
      ? setFilteredGames(filteredGames.filter((match) => match !== game))
      : filteredGames.push(game);
  }

  function setChoosenGames() {
    dispatch(setDetailedStatsOfPlayer(""));
    setChoosenSet("full");
    const choosenDetailedStats = filteredGames.map((set) => Object.values(set).flat()).flat();
    setGameLogs(choosenDetailedStats);
    const flatFullSizeGameStat = choosenDetailedStats
      .map((rally) => Object.values(rally).flat())
      .flat();
    const finalResult = flatFullSizeGameStat.map((rally) => rally.stats);
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
    const choosenSet = soloGame[value].map((rally) => rally.stats);
    setChoosenGameStats(choosenSet);
    setDetailedStats(choosenSet);
    setChoosenSet(value);
    setGameLogs([{ value: soloGame[value] }]);
  }

  const fullGameStats = calculateForTeamData(
    calculateTotalofActions(choosenGameStats.flat()) as TMix
  );
  const sortedGames = filteredGamesStats.sort((a, b) =>
    compare(
      new Date(Object.keys(b)[0].split(";")[0]).getTime(),
      new Date(Object.keys(a)[0].split(";")[0]).getTime()
    )
  );
  const playersNames = choosenGameStats.flat().map((player) => jusName(player));
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
                {sortedGames.map((game, index) => (
                  <div style={{ display: "flex" }} key={index}>
                    <input
                      onChange={() => setFilterForGames(game)}
                      value={Object.keys(game)}
                      type="checkbox"
                      checked={filteredGames.some((match) => match === game)}
                    />
                    <div>{Object.keys(game)}</div>
                  </div>
                ))}
                <div style={{ display: "flex" }}>
                  <input
                    type="checkbox"
                    value={"Check all"}
                    onChange={setAllGames}
                    checked={filteredGames.length === sortedGames.length}
                  />
                  <div>
                    {filteredGames.length === sortedGames.length ? "Remove All" : "Check All"}
                  </div>
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
                <div style={{ display: "flex" }}>
                  <table>
                    <tbody className="rating-table-wrapper">
                      <Categorys
                        filteredPlayers={playersNames}
                        rankByValue={rankByValue}
                        categorys={["name"]}
                      />
                    </tbody>
                  </table>
                  <div>
                    <table style={{ width: "100%" }}>
                      <tbody className="rating-table-wrapper">
                        <Categorys
                          filteredPlayers={choosenGameStats.flat()}
                          rankByValue={rankByValue}
                          categorys={categorys}
                        />
                        <Rows filteredPlayers={[fullGameStats]} lastRow={true} />
                      </tbody>
                    </table>
                    <div className="type-of-actions-wrapper">
                      <div className="reception-content">Reception</div>
                      <div className="attack-content">Attack</div>
                      <div className="service-content">Service</div>
                    </div>
                  </div>
                </div>
                <nav>
                  <GameLogs games={gameLogs} listOfGames={sortedGames} />
                  {!detailedStatsOfPlayer && (
                    <RegularButton
                      onClick={() => setIsShowDistribution(!isShowDistribution)}
                      type="button"
                      $color="black"
                      $background="orangered"
                    >
                      {!isShowDistribution ? "Show Distribution" : "Hide Distribution"}
                    </RegularButton>
                  )}
                </nav>
                {isShowDistribution && !detailedStatsOfPlayer && (
                  <DetailedStats detailedStats={detailedStats} distribution={true} />
                )}
                {detailedStatsOfPlayer && (
                  <DetailedStats detailedStats={detailedStats} distribution={false} />
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
