import { setInfoOfPlayer } from "../../states/slices/playerInfoSlice";
import { useAppDispatch } from "../../states/store";
import { TMix } from "../../types/types";
import {
  gerPercentOfAttack,
  getAttackEfficency,
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
        <>
          <tr
            onClick={() => showInfoOfPlayer(player.name)}
            key={index}
            className="rating-row"
            style={lastRow ? { backgroundColor: "gainsboro" } : {}}
          >
            <td className="rating-player-name">{player.name}</td>
            <td>
              <img src={`/photos/${"team" in player ? player.team : player.name}.png`} alt="" />
            </td>
            <td style={lastRow ? { backgroundColor: "orangered" } : { backgroundColor: "khaki" }}>
              {player.serviceFailed}
            </td>
            <td style={lastRow ? { backgroundColor: "orange" } : { backgroundColor: "khaki" }}>
              {player.serviceMinus}
            </td>
            <td style={lastRow ? { backgroundColor: "yellow" } : { backgroundColor: "khaki" }}>
              {player.servicePlus}
            </td>
            <td style={lastRow ? { backgroundColor: "lightgreen" } : { backgroundColor: "khaki" }}>
              {player.ace}
            </td>
            <td
              style={lastRow ? { backgroundColor: "orangered" } : { backgroundColor: "gainsboro" }}
            >
              {player.loosePoints}
            </td>
            <td style={lastRow ? { backgroundColor: "orange" } : { backgroundColor: "gainsboro" }}>
              {player.attacksInBlock}
            </td>
            <td style={lastRow ? { backgroundColor: "yellow" } : { backgroundColor: "gainsboro" }}>
              {player.leftInGame}
            </td>
            <td
              style={lastRow ? { backgroundColor: "lightgreen" } : { backgroundColor: "gainsboro" }}
            >
              {player.winPoints}
            </td>
            <td style={setStyleForEfficency(getAttackEfficency(player))}>
              {getAttackEfficency(player)} %
            </td>
            <td style={setStyleForPercent(gerPercentOfAttack(player))}>
              {gerPercentOfAttack(player)} %
            </td>
          </tr>
        </>
      ))}
    </>
  );
}
