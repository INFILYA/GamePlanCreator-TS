import { useSelector } from "react-redux";
import {
  fetchGamesStats,
  selectFilteredGameStats,
  selectGamesStats,
  selectorFilter,
  setgameFilterByDate,
  setgameFilterByTeam,
} from "../states/slices/gamesStatsSlice";
import { ChangeEvent, useEffect, useState } from "react";
import { TMix } from "../types/types";
import SectionWrapper from "../wrappers/SectionWrapper";
import {
  compare,
  gerPercentOfAttack,
  getAttackEfficency,
  getPlusMinusAttack,
} from "../utilities/functions";
import { Categorys } from "../ratings/components/Categorys";
import { Rows } from "../ratings/components/Rows";
import { selectListOfTeams } from "../states/slices/listOfTeamsSlice";
import { selectPlayerInfo } from "../states/slices/playerInfoSlice";
import { PersonalInformationOfPlayer } from "../personalInfo/PersonalInformationOfPlayer";
import { useAppDispatch } from "../states/store";
import { RegularButton } from "../css/Button.styled";

export default function GamesStatistic() {
  const dispatch = useAppDispatch();
  const gamesStats = useSelector(selectGamesStats);
  const listOfTeams = useSelector(selectListOfTeams);
  const playerInfo = useSelector(selectPlayerInfo);
  const filteredGamesStats = useSelector(selectFilteredGameStats);
  const teamFilter = useSelector(selectorFilter);
  const [dateFilter, setDateFilter] = useState("");
  const [filter, setFilter] = useState("");
  const [filteredGames, setFilteredGames] = useState<TMix[]>([]);
  const [isBiggest, setIsBiggest] = useState<boolean>(false);

  useEffect(() => {
    async function loadGames() {
      try {
        dispatch(fetchGamesStats());
      } catch (e) {
        console.error(e);
        alert("something go wrong");
      }
    }
    loadGames();
  }, [dispatch]);

  function calculateForTeamData<T extends TMix>(obj: T): TMix {
    if (filter.length === 0) return obj;
    const teamName = filter.split(" ")[0];
    const filtered = listOfTeams.filter((team) => team.name === teamName);
    const team = { ...filtered[0] };
    const newObj = { ...obj };
    for (const key in team) {
      if (key === "id" || key === "startingSquad" || key === "name" || key === "logo") {
        continue;
      }
      (team[key as keyof TMix] as number) = newObj[key as keyof T] as number;
    }
    team.percentOfAttack = gerPercentOfAttack(team); //встановлюємо процент зйому
    team.plusMinusOnAttack = getPlusMinusAttack(team); //встановлюємо + - в атаці
    team.efficencyAttack = getAttackEfficency(team); // встановлюємо ефективність подачі
    return team;
  }

  function rankByValue<T extends TMix>(criteria: keyof T, arr: T[]) {
    !isBiggest
      ? arr.sort((a, b) => compare(b[criteria], a[criteria]))
      : arr.sort((a, b) => compare(a[criteria], b[criteria]));
    setIsBiggest(!isBiggest);
  }

  const loosePoints = filteredGames.reduce((acc, val) => (acc += val.loosePoints), 0);
  const winPoints = filteredGames.reduce((acc, val) => (acc += val.winPoints), 0);
  const leftInTheGame = filteredGames.reduce((acc, val) => (acc += val.leftInGame), 0);
  const attacksInBlock = filteredGames.reduce((acc, val) => (acc += val.attacksInBlock), 0);
  const sumOfAllPlayersSoloGamesStats = {
    loosePoints: loosePoints,
    winPoints: winPoints,
    leftInGame: leftInTheGame,
    attacksInBlock: attacksInBlock,
  };

  function setGameFilter(e: ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    setFilter(value);
    setFilteredGames([]);
    const choosenGame = gamesStats.find((game) => Object.keys(game).find((name) => name === value));
    if (!choosenGame) return;
    setFilteredGames([...Object.values(choosenGame)[0]]);
  }
  function setGameFilterByTeam(name: string) {
    dispatch(setgameFilterByTeam(name));
    setFilteredGames([]);
    setFilter("");
    setDateFilter("");
    dispatch(setgameFilterByDate(""));
  }

  function setGameFilterByDate(e: ChangeEvent<HTMLInputElement>) {
    const value = e.target.value.toUpperCase();
    setDateFilter(value);
    dispatch(setgameFilterByDate(value));
  }

  const fullGameStats = calculateForTeamData(sumOfAllPlayersSoloGamesStats as TMix);
  const sortedGameStats = [...filteredGamesStats].sort((a, b) => compare(b, a));
  const namesOfTeams = listOfTeams.map((team) => team.name);
  return (
    <article className="main-content-wrapper">
      <SectionWrapper
        className="ratings-section"
        content={
          <>
            {playerInfo ? (
              <PersonalInformationOfPlayer link="page1" />
            ) : (
              <table>
                <caption className="showRatings-wrapper">
                  <nav>
                    <div className="team-filter-wrapper">
                      {namesOfTeams.map((name) => (
                        <div key={name}>
                          <RegularButton
                            onClick={() => setGameFilterByTeam(name)}
                            type="button"
                            $color={teamFilter.team === name ? "#ffd700" : "#0057b8"}
                            $background={teamFilter.team === name ? "#0057b8" : "#ffd700"}
                          >
                            {name}
                          </RegularButton>
                        </div>
                      ))}
                    </div>
                    <div className="choosen-game-filter-wrapper">
                      <div>Add filter</div>
                      <input type="text" onChange={setGameFilterByDate} value={dateFilter} />
                    </div>
                    <div className="choosen-game-filter-wrapper">
                      <select onChange={setGameFilter} value={filter}>
                        <option value="">Choose Game ({sortedGameStats.length})</option>
                        {sortedGameStats.map((game, index) => (
                          <option value={Object.keys(game)} key={index}>
                            {Object.keys(game)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </nav>
                </caption>
                <tbody className="rating-table-wrapper">
                  <Categorys filteredPlayers={filteredGames} rankByValue={rankByValue} />
                  {filter && <Rows filteredPlayers={[fullGameStats]} lastRow={true} />}
                </tbody>
              </table>
            )}
          </>
        }
      />
    </article>
  );
}
