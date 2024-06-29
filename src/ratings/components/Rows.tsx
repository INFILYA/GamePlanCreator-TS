import { useSelector } from "react-redux";
import { setInfoOfPlayer } from "../../states/slices/playerInfoSlice";
import { useAppDispatch } from "../../states/store";
import { TMix } from "../../types/types";
import {
  gerPercentOfAttack,
  gerPercentOfPerfectReception,
  gerPercentOfPositiveReception,
  getAttackEfficency,
  getPlusMinusAttack,
  getPlusMinusService,
  isFieldExist,
  rows,
  setStyleForEfficency,
  setStyleForPercent,
} from "../../utilities/functions";
import { selectListOfPlayers } from "../../states/slices/listOfPlayersSlice";

type TRows = {
  filteredPlayers: TMix[];
  lastRow?: boolean;
};

export function Rows(props: TRows) {
  const { filteredPlayers, lastRow } = props;
  const dispatch = useAppDispatch();
  const listOfPlayers = useSelector(selectListOfPlayers);

  function showInfoOfPlayer(name: string) {
    const pickedPlayer = listOfPlayers.find((player) => player.name === name);
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
          <td>
            {getPlusMinusAttack(player) +
              getPlusMinusService(player) +
              isFieldExist(player.blocks) -
              isFieldExist(player["R="])}
          </td>
          <td>{player.blocks}</td>
          {rows.map((row) => (
            <td
              key={row[0]}
              style={lastRow ? { backgroundColor: row[1] } : { backgroundColor: "khaki" }}
            >
              {player[`S${row[0]}`]}
            </td>
          ))}
          {rows.map((row) => (
            <td
              key={row[0]}
              style={lastRow ? { backgroundColor: row[1] } : { backgroundColor: "gainsboro" }}
            >
              {player[`A${row[0]}`]}
            </td>
          ))}
          {rows.map((row) => (
            <td
              key={row[0]}
              style={lastRow ? { backgroundColor: row[1] } : { backgroundColor: "darkseagreen" }}
            >
              {player[`R${row[0]}`]}
            </td>
          ))}
          <td style={setStyleForEfficency(gerPercentOfPerfectReception(player))}>
            {gerPercentOfPerfectReception(player)}%
          </td>
          <td style={setStyleForEfficency(gerPercentOfPositiveReception(player))}>
            {gerPercentOfPositiveReception(player)}%
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
