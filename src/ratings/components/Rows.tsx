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
  setStyle,
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
  const isFull = Object.values(filteredPlayers[0]).length === 1;

  function plusMinus(obj: TMix) {
    const result =
      getPlusMinusAttack(obj) +
      getPlusMinusService(obj) +
      isFieldExist(obj.blocks) -
      isFieldExist(obj["R="]);
    return result;
  }
  return (
    <>
      {!isFull
        ? filteredPlayers.map((player, index) => (
            <tr
              key={index}
              className="rating-row"
              style={lastRow ? { backgroundColor: "gainsboro" } : {}}
            >
              <td style={setStyle(plusMinus(player))}>{plusMinus(player)}</td>
              {rows.map((row) => (
                <td key={row[0]} style={lastRow ? { backgroundColor: row[1] } : {}}>
                  {player[`R${row[0]}`]}
                </td>
              ))}

              <td style={setStyleForEfficency(gerPercentOfPerfectReception(player))}>
                {gerPercentOfPerfectReception(player)}%
              </td>
              <td style={setStyleForEfficency(gerPercentOfPositiveReception(player))}>
                {gerPercentOfPositiveReception(player)}%
              </td>
              {rows.map((row) => (
                <td key={row[0]} style={lastRow ? { backgroundColor: row[1] } : {}}>
                  {player[`A${row[0]}`]}
                </td>
              ))}
              <td style={setStyleForEfficency(getAttackEfficency(player))}>
                {getAttackEfficency(player)}%
              </td>
              <td style={setStyleForPercent(gerPercentOfAttack(player))}>
                {gerPercentOfAttack(player)}%
              </td>
              {rows.map((row) => (
                <td key={row[0]} style={lastRow ? { backgroundColor: row[1] } : {}}>
                  {player[`S${row[0]}`]}
                </td>
              ))}
              <td>{player.blocks}</td>
            </tr>
          ))
        : filteredPlayers.map((player, index) => (
            <tr
              key={index}
              className="rating-row"
              style={lastRow ? { backgroundColor: "gainsboro" } : {}}
            >
              <td onClick={() => showInfoOfPlayer(player.name)} className="rating-player-name">
                {player.name}
              </td>
            </tr>
          ))}
    </>
  );
}
