import { useState } from "react";
import { RegularButton } from "../css/Button.styled";
import { TGameStats } from "../types/types";

type TGameLogs = {
  games: TGameStats[];
};

export default function GameLogs(arg: TGameLogs) {
  const { games } = arg;
  const [showLogs, setShowLogs] = useState(false);
//   const [filteredPlayers, setFilteredPlayers] = useState<TMix[]>([]);

  console.log(games);
  return (
    <>
      <RegularButton
        onClick={() => setShowLogs(!showLogs)}
        type="button"
        $color="black"
        $background="orangered"
      >
        {!showLogs ? "Show Game Logs" : "Hide Game Logs"}
      </RegularButton>
      {showLogs && (
        <div>
          {games.map((game, index) => (
            <>
              <div key={index}>{Object.keys(game)}</div>
              <table>
                <tbody className="rating-table-wrapper"></tbody>
              </table>
            </>
          ))}
        </div>
      )}
    </>
  );
}
