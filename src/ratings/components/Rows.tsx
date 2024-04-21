import { setInfoOfPlayer } from "../../states/slices/playerInfoSlice";
import { useAppDispatch } from "../../states/store";
import { TMix } from "../../types/types";
import {
  gerPercentOfAttack,
  getAttackEfficency,
  getPlusMinusAttack,
  setStyle,
} from "../../utilities/functions";

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
  return (
    <>
      {filteredPlayers.map((player, index) => (
        <tr
          onClick={() => showInfoOfPlayer(player.name)}
          key={index}
          className="rating-row"
          style={changeBgColors(index)}
        >
          <td className="rating-player-name">
            {index + 1}. {player.name}
          </td>
          <td style={{ display: "flex", justifyContent: "center" }}>
            <img src={`/photos/${"team" in player ? player.team : player.name}.png`} alt="" />
          </td>
          <td>{player.leftInGame}</td>
          <td>{player.attacksInBlock}</td>
          <td>{player.loosePoints}</td>
          <td>{player.winPoints}</td>
          <td style={setStyle(getAttackEfficency(player))}>{getAttackEfficency(player)} %</td>
          <td style={setStyle(getPlusMinusAttack(player))}>{getPlusMinusAttack(player)}</td>
          <td>{gerPercentOfAttack(player)} %</td>
        </tr>
      ))}
    </>
  );
}
