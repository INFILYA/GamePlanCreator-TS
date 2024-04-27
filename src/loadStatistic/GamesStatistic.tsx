import { useSelector } from "react-redux";
import { selectGamesStats } from "../states/slices/gamesStatsSlice";
import { ChangeEvent, useState } from "react";
import { TMix, TPlayer } from "../types/types";
import SectionWrapper from "../wrappers/SectionWrapper";
import { compare } from "../utilities/functions";
import { Categorys } from "../ratings/components/Categorys";

export default function GamesStatistic() {
  const gamesStats = useSelector(selectGamesStats);
  const [filter, setFilter] = useState("");
  const [filteredGames, setFilteredPlayers] = useState<TPlayer[]>([]);
  const [isBiggest, setIsBiggest] = useState<boolean>(false);

  function rankByValue<T extends TMix>(criteria: keyof T, arr: T[]) {
    !isBiggest
      ? arr.sort((a, b) => compare(b[criteria], a[criteria]))
      : arr.sort((a, b) => compare(a[criteria], b[criteria]));
    setIsBiggest(!isBiggest);
  }

  function setGameFilter(e: ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    setFilter(value);
    setFilteredPlayers([]);
    const choosenGame = gamesStats.find((game) => Object.keys(game).find((name) => name === value));
    if (!choosenGame) return;
    setFilteredPlayers(Object.values(choosenGame)[0]);
    console.log(filter);
  }

  return (
    <article className="main-content-wrapper">
      <SectionWrapper
        className="ratings-section"
        content={
          <table>
            <caption className="showRatings-wrapper">
              <nav>
                <select onChange={setGameFilter}>
                  {gamesStats.map((game, index) => (
                    <option value={Object.keys(game)} key={index}>
                      {Object.keys(game)}
                    </option>
                  ))}
                </select>
              </nav>
            </caption>
            <tbody className="rating-table-wrapper">
              <Categorys filteredPlayers={[...filteredGames]} rankByValue={rankByValue} />
            </tbody>
          </table>
        }
      />
    </article>
  );
}
