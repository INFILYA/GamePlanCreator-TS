import { TAttackDiagramm, TMix, TPlayer } from "../../types/types";
import { useAppDispatch } from "../../states/store";
import { setInfoOfPlayer } from "../../states/slices/playerInfoSlice";
import { pushFromHomeTeamBoard } from "../../states/slices/homePlayersSlice";
import { pushFromGuestTeamBoard } from "../../states/slices/guestPlayersSlice";
import {
  resetHomeTeamIndexOfZones,
  updateInfoOfSubPlayers,
} from "../../states/slices/indexOfHomeTeamZonesSlice";
import {
  resetGuestTeamIndexOfZones,
  selectIndexOfGuestTeamZones,
  updateInfoOfStartingSix,
} from "../../states/slices/indexOfGuestTeamZonesSlice";
import { ChangeEvent, useEffect, useState } from "react";
import { setUpdatedPlayers } from "../../states/slices/listOfPlayersSlice";
import { emptyPlayer } from "../../utilities/functions";
import { setSoloGameStats } from "../../states/slices/soloGameStatsSlice";
import { useSelector } from "react-redux";

type TIconOfPlayer = {
  type: string;
  startingSix: TPlayer[];
  player: TPlayer;
  soloGameStats: TPlayer[];
  showSquads: boolean;
  setShowSquads(arg: boolean): void;
};

export function IconOfPlayer(props: TIconOfPlayer) {
  const { player, soloGameStats, startingSix, type, showSquads, setShowSquads } = props;
  const dispatch = useAppDispatch();
  const guestTeamOptions = useSelector(selectIndexOfGuestTeamZones);
  const [gradations, setGradations] = useState<string[][]>([]);
  const [diagrammValue, setDiagrammValue] = useState<TPlayer>(emptyPlayer);

  useEffect(() => {
    const choosenPlayer = soloGameStats.filter((athlete) => athlete.name === player.name);
    setDiagrammValue(choosenPlayer[0]);
  }, [player, soloGameStats]);
  const my = type === "my";

  function checkNumbers(element: number): boolean {
    return typeof element !== "number";
  }

  const isBoardFull = (arr: TPlayer[]) => {
    return arr.every((option) => checkNumbers(option.boardPosition));
  };

  function calculateForPlayerData<T extends TMix>(
    obj: T,
    diagram: TAttackDiagramm,
    soloGame?: boolean
  ): T {
    for (const key in diagram) {
      if (!soloGame) {
        if (
          key === "AB" ||
          key === "A=" ||
          key === "A+" ||
          key === "A!" ||
          key === "S++" ||
          key === "S=" ||
          key === "S+" ||
          key === "S-"
        ) {
          (obj[key as keyof T] as number) += diagram[key as keyof TAttackDiagramm];
        } else continue;
      }
      if (soloGame) {
        (obj[key as keyof T] as number) = diagram[key as keyof TAttackDiagramm];
      }
    }
    // obj.percentOfAttack = gerPercentOfAttack(obj); //встановлюємо процент зйому
    // obj.plusMinusOnAttack = getPlusMinusAttack(obj); //встановлюємо + - в атаці
    // obj.efficencyAttack = getAttackEfficency(obj); // встановлюємо ефективність подачі
    return obj;
  }

  function cancelGuestTeamChoice(player: TPlayer) {
    if (isBoardFull(guestTeamOptions)) {
      setShowSquads(true);
    }
    dispatch(pushFromGuestTeamBoard(player));
    dispatch(resetGuestTeamIndexOfZones({ startingSix, player }));
  }
  function cancelHomeTeamChoice(player: TPlayer) {
    dispatch(pushFromHomeTeamBoard(player));
    dispatch(resetHomeTeamIndexOfZones({ startingSix, player }));
  }

  function showPlayerInfo() {
    if (showSquads) {
      dispatch(setInfoOfPlayer(player));
    }
  }

  function addAmount(type: keyof TPlayer, number: number) {
    if (diagrammValue[type] === 0 && number === -1) return;
    setDiagrammValue({
      ...diagrammValue,
      [type]: +diagrammValue[type] + number,
    });
    const obj = { [type]: number } as TAttackDiagramm;
    const updatedPlayer = calculateForPlayerData({ ...player }, obj);
    const soloGameUpdatedPlayer = calculateForPlayerData(
      { ...player },
      {
        ...diagrammValue,
        [type]: diagrammValue[type as keyof TAttackDiagramm] + number,
      },
      true
    );
    dispatch(setSoloGameStats(soloGameUpdatedPlayer));
    dispatch(setUpdatedPlayers(updatedPlayer));
    dispatch(setInfoOfPlayer(updatedPlayer));
    dispatch(updateInfoOfStartingSix(updatedPlayer));
    dispatch(updateInfoOfSubPlayers(updatedPlayer));
  }

  const handleGradationSet = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === "attack") {
      setGradations(attackGradations);
    } else setGradations(serviceGradations);
  };

  if (typeof player === "number" || player === null) return;
  const condition = player.number !== 0;
  const attackGradations = [
    ["A+", "lightgreen", "Win"],
    ["A!", "yellow", "Game"],
    ["AB", "orange", "Block"],
    ["A=", "orangered", "Error"],
  ];
  const serviceGradations = [
    ["S++", "lightgreen", "Ace"],
    ["S+", "yellow", "(! - /)"],
    ["S-", "orange", "(# +)"],
    ["S=", "orangered", "Error"],
  ];
  const choosenGradations = gradations.length ? gradations : attackGradations;
  return (
    <>
      {condition && (
        <div className="card-content">
          {!my && (
            <div className="player-image-wrapper" onClick={showPlayerInfo}>
              <img src={`/photos/${player?.photo}`} alt=""></img>
            </div>
          )}
          <div className="player-field-wrapper">
            <div className="playerNumber-wrapper">
              <button
                type="button"
                style={my ? { backgroundColor: "#f0f" } : {}}
                onClick={
                  !my ? () => cancelGuestTeamChoice(player) : () => cancelHomeTeamChoice(player)
                }
              >
                {player.number}
              </button>
            </div>
            <div className="player-surname-wrapper">
              <button
                type="button"
                className="player-surname"
                style={my ? { backgroundColor: "#a9a9a9" } : {}}
                onClick={showPlayerInfo}
              >
                {player.name}
              </button>
            </div>
          </div>
          {!showSquads && (
            <div className="errors-field-wrapper">
              <select
                onChange={handleGradationSet}
                style={{ textAlign: "center", fontWeight: "bold" }}
              >
                <option value="attack">Attack</option>
                <option value="service">Service</option>
              </select>
              <table>
                <tbody>
                  <tr>
                    <th>+</th>
                    <th>Amount</th>
                    <th>-</th>
                  </tr>
                  {choosenGradations.map((grade) => (
                    <tr key={grade[0]}>
                      <td
                        style={{ backgroundColor: grade[1] }}
                        onClick={() => addAmount(grade[0] as keyof TPlayer, 1)}
                      >
                        {grade[2]}
                      </td>
                      <td>
                        <input
                          type="text"
                          min={0}
                          value={diagrammValue[grade[0] as keyof TAttackDiagramm]}
                          name={grade[0]}
                          readOnly
                        />
                      </td>
                      <td
                        style={{ backgroundColor: grade[1] }}
                        onClick={() => addAmount(grade[0] as keyof TPlayer, -1)}
                      >
                        -
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </>
  );
}
