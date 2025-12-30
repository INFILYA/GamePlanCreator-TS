import { setDetailedStatsOfPlayer } from "../../states/slices/detailedStatsOfPlayerSlice";
import { useAppDispatch } from "../../states/store";
import { TMix } from "../../types/types";
import {
  calculateTotalofActionsV2,
  gerPercentOfAttack,
  gerPercentOfPerfectReception,
  gerPercentOfPositiveReception,
  getAttackEfficency,
  getPlusMinusAttack,
  getPlusMinusService,
  isFieldExist,
  preparePlayerToSoloGameV3,
  rows,
  setStyle,
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

  function showInfoOfPlayer(player: TMix) {
    if (player === undefined || player === null) return;
    if ("startingSquad" in player) return;
    dispatch(setDetailedStatsOfPlayer(player.name));
  }
  if (!filteredPlayers || filteredPlayers.length === 0) return null;
  const isFull = Object.values(filteredPlayers[0]).length === 1;

  function plusMinus(obj: TMix) {
    const result =
      getPlusMinusAttack(obj) +
      getPlusMinusService(obj) +
      isFieldExist(obj.blocks) -
      isFieldExist(obj["R="]);
    return result;
  }

  function getCorrectPlayersInfo(obj: TMix[]) {
    const result = obj
      .map((player) => calculateTotalofActionsV2(filteredPlayers, player.name))
      .map((player) => preparePlayerToSoloGameV3(player));
    const sorted = [] as TMix[];
    for (let i = 0; i < result.length; i++) {
      const plaer = result[i];
      if (sorted.some((athlete) => athlete.name === plaer.name)) {
        continue;
      } else sorted.push(plaer);
    }
    return sorted;
  }

  function getPlayersNames(obj: TMix[]) {
    const result = obj.map((player) => preparePlayerToSoloGameV3(player));
    const sorted = [] as TMix[];
    for (let i = 0; i < result.length; i++) {
      const player = result[i];
      if (sorted.some((athlete) => athlete.name === player.name)) {
        continue;
      } else sorted.push(player);
    }
    return sorted;
  }

  return (
    <>
      {!isFull
        ? getCorrectPlayersInfo(filteredPlayers).map((player, index) => (
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
              <td style={setStyleForPercent(gerPercentOfPositiveReception(player))}>
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
        : getPlayersNames(filteredPlayers).map((player, index) => (
            <tr
              key={index}
              className="rating-row"
              style={lastRow ? { backgroundColor: "gainsboro" } : {}}
            >
              <td onClick={() => showInfoOfPlayer(player)} className="rating-player-name">
                {player.name}
              </td>
            </tr>
          ))}
    </>
  );
}
