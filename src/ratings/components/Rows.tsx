import { setInfoOfPlayer } from "../../states/slices/playerInfoSlice";
import { useAppDispatch } from "../../states/store";
import { TMix } from "../../types/types";
import {
  gerPercentOfAttack,
  getAttackEfficency,
  getPlusMinusAttack,
  getPlusMinusService,
  setStyleForEfficency,
  setStyleForPercent,
} from "../../utilities/functions";

type TRows = {
  filteredPlayers: TMix[];
  lastRow?: boolean;
};

export function Rows(props: TRows) {
  const { filteredPlayers, lastRow } = props;
  const dispatch = useAppDispatch();

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
          style={lastRow ? { backgroundColor: "gainsboro" } : {}}
        >
          <td className="rating-player-name">{player.name}</td>
          <td>{getPlusMinusAttack(player) + getPlusMinusService(player)}</td>
          <td style={lastRow ? { backgroundColor: "orangered" } : { backgroundColor: "khaki" }}>
            {player["S="]}
          </td>
          <td style={lastRow ? { backgroundColor: "orange" } : { backgroundColor: "khaki" }}>
            {player["S-"]}
          </td>
          <td style={lastRow ? { backgroundColor: "yellow" } : { backgroundColor: "khaki" }}>
            {player["S+"]}
          </td>
          <td style={lastRow ? { backgroundColor: "lightgreen" } : { backgroundColor: "khaki" }}>
            {player["S++"]}
          </td>
          <td style={lastRow ? { backgroundColor: "orangered" } : { backgroundColor: "gainsboro" }}>
            {player["A="]}
          </td>
          <td style={lastRow ? { backgroundColor: "orange" } : { backgroundColor: "gainsboro" }}>
            {player["AB"]}
          </td>
          <td style={lastRow ? { backgroundColor: "yellow" } : { backgroundColor: "gainsboro" }}>
            {player["A!"]}
          </td>
          <td
            style={lastRow ? { backgroundColor: "lightgreen" } : { backgroundColor: "gainsboro" }}
          >
            {player["A+"]}
          </td>
          <td style={setStyleForEfficency(getAttackEfficency(player))}>
            {getAttackEfficency(player)}%
          </td>
          <td style={setStyleForPercent(gerPercentOfAttack(player))}>
            {gerPercentOfAttack(player)}%
          </td>
        </tr>
      ))}
    </>
  );
}
