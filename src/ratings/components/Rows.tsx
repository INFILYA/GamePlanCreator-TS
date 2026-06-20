import { setDetailedStatsOfPlayer } from "../../states/slices/detailedStatsOfPlayerSlice";
import { useAppDispatch } from "../../states/store";
import { TMix } from "../../types/types";
import {
  calculateTotalofActionsV2,
  gerPercentOfAttack,
  gerPercentOfPerfectReception,
  gerPercentOfPositiveReception,
  getAttackEfficency,
  getEarnedPoints,
  getPlusMinusAttack,
  getPlusMinusService,
  isFieldExist,
  preparePlayerToSoloGameV3,
  receptionStatRows,
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
      isFieldExist(obj["R="]) -
      isFieldExist(obj.unforcedError);
    return result;
  }

  function getCorrectPlayersInfo(obj: TMix[]) {
    const result = obj
      .map((player) => calculateTotalofActionsV2(filteredPlayers, player.name))
      .map((player) => preparePlayerToSoloGameV3(player))
      .filter(
        (player) => lastRow || (player.name && player.name.trim() !== "")
      );
    const sorted = [] as TMix[];
    for (let i = 0; i < result.length; i++) {
      const plaer = result[i];
      if (sorted.some((athlete) => athlete.name === plaer.name)) {
        continue;
      } else sorted.push(plaer);
    }
    return sorted;
  }

  function receptionStat(
    player: TMix,
    grade: (typeof receptionStatRows)[number][0]
  ): number {
    const key = grade === "/" ? "R/" : `R${grade}`;
    return isFieldExist((player as unknown as Record<string, number>)[key]);
  }

  function skillStat(player: TMix, prefix: "A" | "S", grade: string): number {
    return isFieldExist(
      (player as unknown as Record<string, number>)[`${prefix}${grade}`]
    );
  }

  const dataCellStyle = (lastRow: boolean | undefined, totalColor?: string) =>
    lastRow && totalColor
      ? { backgroundColor: totalColor }
      : { backgroundColor: "#fff" };

  function getPlayersNames(obj: TMix[]) {
    const result = obj
      .map((player) => preparePlayerToSoloGameV3(player))
      .filter(
        (player) => lastRow || (player.name && player.name.trim() !== "")
      );
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
              {receptionStatRows.map((row) => (
                <td
                  key={`R${row[0]}`}
                  style={dataCellStyle(lastRow, row[1])}
                >
                  {receptionStat(player, row[0])}
                </td>
              ))}

              <td
                style={setStyleForEfficency(
                  gerPercentOfPerfectReception(player)
                )}
              >
                {gerPercentOfPerfectReception(player)}%
              </td>
              <td
                style={setStyleForPercent(
                  gerPercentOfPositiveReception(player)
                )}
              >
                {gerPercentOfPositiveReception(player)}%
              </td>
              {rows.map((row) => (
                <td
                  key={row[0]}
                  style={dataCellStyle(lastRow, row[1])}
                >
                  {skillStat(player, "A", row[0])}
                </td>
              ))}
              <td style={setStyleForEfficency(getAttackEfficency(player))}>
                {getAttackEfficency(player)}%
              </td>
              <td style={setStyleForPercent(gerPercentOfAttack(player))}>
                {gerPercentOfAttack(player)}%
              </td>
              {rows.map((row) => (
                <td
                  key={row[0]}
                  style={dataCellStyle(lastRow, row[1])}
                >
                  {skillStat(player, "S", row[0])}
                </td>
              ))}
              <td style={dataCellStyle(lastRow, "gainsboro")}>
                {isFieldExist(player.blocks)}
              </td>
              <td style={dataCellStyle(lastRow, "orangered")}>
                {isFieldExist(player.unforcedError)}
              </td>
              <td style={dataCellStyle(lastRow, "gainsboro")}>
                {getEarnedPoints(player)}
              </td>
            </tr>
          ))
        : getPlayersNames(filteredPlayers).map((player, index) => (
            <tr
              key={index}
              className="rating-row"
              style={lastRow ? { backgroundColor: "gainsboro" } : {}}
            >
              <td
                onClick={() => showInfoOfPlayer(player)}
                className="rating-player-name"
              >
                {player.name}
              </td>
            </tr>
          ))}
    </>
  );
}
