import { useEffect, useState } from "react";
import { RegularButton } from "../css/Button.styled";
import { TGameStats, TObjectStats } from "../types/types";

type TGameLogs = {
  games: TObjectStats[];
  listOfGames: TGameStats[];
};

export default function GameLogs(arg: TGameLogs) {
  const { games, listOfGames } = arg;
  const [showLogs, setShowLogs] = useState(false);
  const [plusMinusPositions, setPlusMinusPositions] = useState([
    { count: 0, position: "1" },
    { count: 0, position: "2" },
    { count: 0, position: "3" },
    { count: 0, position: "4" },
    { count: 0, position: "5" },
    { count: 0, position: "6" },
  ]);

  useEffect(() => {
    const newGame = [
      { count: 0, position: "1" },
      { count: 0, position: "2" },
      { count: 0, position: "3" },
      { count: 0, position: "4" },
      { count: 0, position: "5" },
      { count: 0, position: "6" },
    ];
    const game = games
      .map((game) => Object.values(game))
      .flat()
      .flat()
      .filter((ball) => ball.score !== "0 - 0");
    game.forEach((rall) =>
      rall.weServe
        ? (newGame[rall.stats[0].setterBoardPosition - 1].count += 1)
        : (newGame[rall.stats[0].setterBoardPosition - 1].count -= 1)
    );
    setPlusMinusPositions(newGame);
  }, [games]);

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
        <>
          <div className="game-plusMinus-position-wrapper">
            {plusMinusPositions.map((zone) => (
              <div>
                <div>P{zone.position}</div>
                <div style={zone.count >= 0 ? { color: "green" } : { color: "orangered" }}>
                  {zone.count}
                </div>
              </div>
            ))}
          </div>
          <div className="gameLog-table-wrapper">
            {games.map((game, index) => (
              <span key={index}>
                <h2>{Object.keys(listOfGames[index])}</h2>
                <table>
                  {Object.values(game).map((sets, index) => (
                    <tbody className="rating-table-wrapper">
                      <tr className="gameLog-set-wrapper">
                        <td>{Object.keys(game)[index]}</td>
                      </tr>
                      <tr className="gameLog-column-wrapper">
                        <td>Setter</td>
                        <td>Service</td>
                        <td>Score</td>
                        <td>Service</td>
                        <td>Setter</td>
                      </tr>
                      {Object.values(sets).map((set, index) => (
                        <tr className="gameLog-column-wrapper" key={index}>
                          <td style={{ color: "green" }}>
                            {set.weServe ? `P${set.stats[0].setterBoardPosition}` : ""}
                          </td>
                          <td>{set.weServe ? "🏐" : ""}</td>
                          <td>{set.score}</td>
                          <td>{set.weServe ? "" : "🏐"}</td>
                          <td style={{ color: "orangered" }}>
                            {set.weServe ? "" : `P${set.stats[0].setterBoardPosition}`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  ))}
                </table>
              </span>
            ))}
          </div>
        </>
      )}
    </>
  );
}
