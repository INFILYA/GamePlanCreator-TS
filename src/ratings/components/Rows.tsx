import { CSSProperties } from "react";
import { setInfoOfPlayer } from "../../states/slices/playerInfoSlice";
import { useAppDispatch } from "../../states/store";
import { TMix, TTeam } from "../../types/types";
import { upgradeAge } from "../../utilities/functions";

type TRows = {
  filteredPlayers: TMix[];
};

export function Rows(props: TRows) {
  const { filteredPlayers } = props;
  const dispatch = useAppDispatch();

  function changeBgColors(index: number) {
    const backgrounds = [
      { backgroundColor: "gold" },
      { backgroundColor: "silver" },
      { backgroundColor: "burlywood" },
    ];
    return backgrounds[index];
  }

  function showInfoOfPlayer(name: string) {
    const pickedPlayer = filteredPlayers.find((player) => player.name === name);
    if (pickedPlayer === undefined || pickedPlayer === null) return;
    if ("startingSquad" in pickedPlayer) return;
    dispatch(setInfoOfPlayer(pickedPlayer));
  }
  function setStyle(params: number): CSSProperties {
    if (params === 0) return {};
    return { color: params >= 0 ? "green" : "red" };
  }

  function getAveragePlusMinus(team: TMix[], key: keyof TTeam): number {
    const teamPlusMinus: number = team
      .map((player) => ("logo" in player ? +player[key] : 0))
      .reduce((a, b) => a + b, 0);
    return +(teamPlusMinus / team.length).toFixed(1);
  }
  return (
    <>
      {filteredPlayers.map((player, index) => (
        <tr
          onClick={() => showInfoOfPlayer(player.name)}
          key={player.name}
          className="rating-row"
          style={changeBgColors(index)}
        >
          <td className="rating-player-name">
            {index + 1}. {player.name}
          </td>
          <td style={{ display: "flex", justifyContent: "center" }}>
            <img src={`/photos/${"team" in player ? player.team : player.name}.jpg`} alt="" />
          </td>
          <td>{upgradeAge(player).age}</td>
          <td>{player.height}</td>
          <td>{player.aces}</td>
          <td>{player.winPoints}</td>
          <td style={setStyle(player.plusMinusOnService)}>
            {"logo" in player
              ? getAveragePlusMinus(filteredPlayers, "plusMinusOnService")
              : player.plusMinusOnService}
          </td>
          <td style={setStyle(player.plusMinusOnAttack)}>
            {"logo" in player
              ? getAveragePlusMinus(filteredPlayers, "plusMinusOnAttack")
              : player.plusMinusOnAttack}
          </td>
          <td>{player.percentOfAttack} %</td>
        </tr>
      ))}
    </>
  );
}
