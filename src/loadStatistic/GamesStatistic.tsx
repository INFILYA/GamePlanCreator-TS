import { useSelector } from "react-redux";
import { selectGamesStats } from "../states/slices/gamesStatsSlice";

export default function GamesStatistic() {
  const gamesStats = useSelector(selectGamesStats);

  return (
    <table>
      <tbody>
        {gamesStats.map((games) => (
          <div>
            {games.map((game) => (
              <>
                <div>{game.name}</div>
                <div>{game.winPoints}</div>
              </>
            ))}
          </div>
        ))}
      </tbody>
    </table>
  );
}
