import { useSelector } from "react-redux";
import { selectGamesStats } from "../states/slices/gamesStatsSlice";

export default function GamesStatistic() {
  const gamesStats = useSelector(selectGamesStats);
  // console.log(Object.values(gamesStats));
  // if (!gamesStats[0]) return
  return (
    <table>
      <caption className="showRatings-wrapper">
        <nav>
          <select>
            {Object.keys(gamesStats).map((game) => (
              <>
                <option>{game}</option>
              </>
            ))}
          </select>
        </nav>
      </caption>
      <tbody></tbody>
    </table>
  );
}
