import { TAttackDiagramm, TPlayer, TTeam } from "../../types/types";
import { useAppDispatch } from "../../states/store";
import { setInfoOfPlayer } from "../../states/slices/playerInfoSlice";
import { pushFromHomeTeamBoard } from "../../states/slices/homePlayersSlice";
import { pushFromGuestTeamBoard } from "../../states/slices/guestPlayersSlice";
import { resetHomeTeamIndexOfZones } from "../../states/slices/indexOfHomeTeamZonesSlice";
import {
  resetGuestTeamIndexOfZones,
  selectIndexOfGuestTeamZones,
} from "../../states/slices/indexOfGuestTeamZonesSlice";
import { ChangeEvent, useState } from "react";
import { setUpdatedPlayers } from "../../states/slices/listOfPlayersSlice";
import {
  gerPercentOfAttack,
  getAttackEfficency,
  getPlusMinusAttack,
} from "../../utilities/functions";
import { setSoloGameStats } from "../../states/slices/soloGameStatsSlice";
import { useSelector } from "react-redux";

type TIconOfPlayer = {
  type: string;
  key: number;
  startingSix: TPlayer[];
  player: TPlayer;
  showSquads: boolean;
  setShowSquads(arg: boolean): void;
};

export function IconOfPlayer(props: TIconOfPlayer) {
  const { player, startingSix, type, showSquads, setShowSquads } = props;
  const dispatch = useAppDispatch();
  const guestTeamOptions = useSelector(selectIndexOfGuestTeamZones);

  const [diagrammValue, setDiagrammValue] = useState<TAttackDiagramm>({
    winPoints: 0,
    leftInGame: 0,
    attacksInBlock: 0,
    loosePoints: 0,
  });
  const my = type === "my";

  function checkNumbers(element: number): boolean {
    return typeof element !== "number";
  }

  const isBoardFull = (arr: TPlayer[]) => {
    return arr.every((option) => checkNumbers(option.boardPosition));
  };

  const handleDiagrammValue = (event: ChangeEvent<HTMLInputElement>) => {
    setDiagrammValue({
      ...diagrammValue,
      [event.target.name]: +event.target.value.replace(/\D+/g, ""),
    });
    const updatedPlayer = calculateForPlayerData(
      { ...player },
      {
        ...diagrammValue,
        [event.target.name]: +event.target.value.replace(/\D+/g, ""),
      }
    );
    const soloGameUpdatedPlayer = calculateForPlayerData(
      { ...player },
      {
        ...diagrammValue,
        [event.target.name]: +event.target.value.replace(/\D+/g, ""),
      },
      true
    );
    dispatch(setSoloGameStats(soloGameUpdatedPlayer));
    dispatch(setUpdatedPlayers(updatedPlayer));
    dispatch(setInfoOfPlayer(updatedPlayer));
  };

  function calculateForPlayerData<T extends TTeam | TPlayer>(
    obj: T,
    diagram: TAttackDiagramm,
    soloGame?: boolean
  ): T {
    for (const key in diagram) {
      if (!soloGame) {
        (obj[key as keyof T] as number) += diagram[key as keyof TAttackDiagramm];
      }
      if (soloGame) {
        (obj[key as keyof T] as number) = diagram[key as keyof TAttackDiagramm];
      }
    }
    obj.percentOfAttack = gerPercentOfAttack(obj); //встановлюємо процент зйому
    obj.plusMinusOnAttack = getPlusMinusAttack(obj); //встановлюємо + - в атаці
    obj.efficencyAttack = getAttackEfficency(obj); // встановлюємо ефективність подачі
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

  function addAmount(type: string) {
    setDiagrammValue({
      ...diagrammValue,
      [type]: +diagrammValue[type as keyof TAttackDiagramm] + 1,
    });
    const updatedPlayer = calculateForPlayerData(
      { ...player },
      {
        ...diagrammValue,
        [type]: +diagrammValue[type as keyof TAttackDiagramm] + 1,
      }
    );
    const soloGameUpdatedPlayer = calculateForPlayerData(
      { ...player },
      {
        ...diagrammValue,
        [type]: +diagrammValue[type as keyof TAttackDiagramm] + 1,
      },
      true
    );
    dispatch(setSoloGameStats(soloGameUpdatedPlayer));
    dispatch(setUpdatedPlayers(updatedPlayer));
    dispatch(setInfoOfPlayer(updatedPlayer));
  }

  if (typeof player === "number" || player === null) return;
  const condition = player.number !== 0;

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
                {/* {player.number > 9 ? player.number : `0${player.number}`} */}
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
              <table>
                <tbody>
                  <tr>
                    <th>Type</th>
                    <th>Amount</th>
                  </tr>
                  <tr>
                    <td
                      style={{ backgroundColor: "lightgreen" }}
                      onClick={() => addAmount("winPoints")}
                    >
                      Win
                    </td>
                    <td>
                      <input
                        type="number"
                        min={0}
                        value={diagrammValue.winPoints}
                        onChange={handleDiagrammValue}
                        name="winPoints"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{ backgroundColor: "yellow" }}
                      onClick={() => addAmount("leftInGame")}
                    >
                      Game
                    </td>
                    <td>
                      <input
                        type="number"
                        min={0}
                        value={diagrammValue.leftInGame}
                        onChange={handleDiagrammValue}
                        name="leftInGame"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{ backgroundColor: "orange" }}
                      onClick={() => addAmount("attacksInBlock")}
                    >
                      Block
                    </td>
                    <td>
                      <input
                        type="number"
                        min={0}
                        value={diagrammValue.attacksInBlock}
                        onChange={handleDiagrammValue}
                        name="attacksInBlock"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{ backgroundColor: "orangered" }}
                      onClick={() => addAmount("loosePoints")}
                    >
                      Error
                    </td>
                    <td>
                      <input
                        type="number"
                        min={0}
                        value={diagrammValue.loosePoints}
                        onChange={handleDiagrammValue}
                        name="loosePoints"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </>
  );
}
