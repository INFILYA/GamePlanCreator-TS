import { useState } from "react";
import { RegularButton } from "../css/Button.styled";
import { TObjectStats } from "../types/types";

type TGameLogs = {
  games: TObjectStats[];
};

export default function GameLogs(arg: TGameLogs) {
  const { games } = arg;
  const [showLogs, setShowLogs] = useState(false);
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
        <div className="gameLog-table-wrapper">
          {games.map((game, index) => (
            <table key={index}>
              <tbody className="rating-table-wrapper">
                {Object.values(game).map((sets, index) => (
                  <tr className="gameLog-column-wrapper" key={index}>
                    <td className="gameLog-set-wrapper">{Object.keys(game)[index]}</td>
                    <tr className="gameLog-row-wrapper">
                      <tr>
                        <td>Setter</td>
                      </tr>
                      <tr>
                        <td>Score</td>
                      </tr>
                      <tr>
                        <td>Setter</td>
                      </tr>
                    </tr>
                    {Object.entries(sets).map(([name, set]) => (
                      <tr className="gameLog-column-wrapper" key={name}>
                        <tr className="gameLog-row-wrapper" key={index}>
                          <tr style={{ color: "green" }}>
                            <td>{set.weServe ? `P${set.stats[0].setterBoardPosition}` : ""}</td>
                          </tr>
                          <tr style={{ justifyContent: set.weServe ? "left" : "right" }}>
                            <td>{set.weServe ? "🏐" : ""}</td>
                            <td>{set.score}</td>
                            <td>{set.weServe ? "" : "🏐"}</td>
                          </tr>
                          <tr style={{ color: "orangered" }}>
                            <td>{set.weServe ? "" : `P${set.stats[0].setterBoardPosition}`}</td>
                          </tr>
                        </tr>
                      </tr>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ))}
        </div>
      )}
    </>
  );
}
