import { CSSProperties } from "react";
import { setInfoOfPlayer } from "../../states/slices/playerInfoSlice";
import { useAppDispatch } from "../../states/store";
import { TMix, TTeam } from "../../types/types";
import { upgradeAge } from "../../utilities/functions";
import { useSelector } from "react-redux";
import { selectListOfPlayers } from "../../states/slices/listOfPlayersSlice";

type TRows = {
  filteredPlayers: TMix[];
};

export function Rows(props: TRows) {
  const { filteredPlayers } = props;
  const dispatch = useAppDispatch();
  const listOfPlayers = useSelector(selectListOfPlayers);

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

  function getAveragePlusMinus(team: TTeam, key: keyof TTeam): number {
    const teamPlusMinus: number =
      +team[key] / listOfPlayers.filter((player) => player.team === team.name).length;
    return +teamPlusMinus.toFixed(1);
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
              ? getAveragePlusMinus(player, "plusMinusOnService")
              : player.plusMinusOnService}
          </td>
          <td style={setStyle(player.plusMinusOnAttack)}>
            {"logo" in player
              ? getAveragePlusMinus(player, "plusMinusOnAttack")
              : player.plusMinusOnAttack}
          </td>
          <td>{player.percentOfAttack} %</td>
        </tr>
      ))}
    </>
  );
}
