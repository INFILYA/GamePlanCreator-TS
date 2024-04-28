import { useSelector } from "react-redux";
import { selectGamesStats } from "../states/slices/gamesStatsSlice";
import { ChangeEvent, useState } from "react";
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

export default function GamesStatistic() {
  const gamesStats = useSelector(selectGamesStats);
  const listOfTeams = useSelector(selectListOfTeams);
  const playerInfo = useSelector(selectPlayerInfo);

  const [filter, setFilter] = useState("");
  const [filteredGames, setFilteredGames] = useState<TMix[]>([]);
  const [isBiggest, setIsBiggest] = useState<boolean>(false);

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
    console.log(filter);
  }
  const fullGameStats = calculateForTeamData(sumOfAllPlayersSoloGamesStats as TMix);
  const sortedGameStats = [...gamesStats].sort((a, b) => compare(b, a));
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
                    <select onChange={setGameFilter}>
                      <option value="">Choose Game</option>
                      {sortedGameStats.map((game, index) => (
                        <option value={Object.keys(game)} key={index}>
                          {Object.keys(game)}
                        </option>
                      ))}
                    </select>
                  </nav>
                </caption>
                <tbody className="rating-table-wrapper">
                  <Categorys filteredPlayers={filteredGames} rankByValue={rankByValue} />
                  {filter && <Rows filteredPlayers={[fullGameStats]} />}
                </tbody>
              </table>
            )}
          </>
        }
      />
    </article>
  );
}
