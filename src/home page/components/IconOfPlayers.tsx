import { TAttackDiagramm, TPlayer, TTeam } from "../../types/types";
import { useAppDispatch } from "../../states/store";
import { setInfoOfPlayer } from "../../states/slices/playerInfoSlice";
import { pushFromHomeTeamBoard } from "../../states/slices/homePlayersSlice";
import { pushFromGuestTeamBoard } from "../../states/slices/guestPlayersSlice";
import { resetHomeTeamIndexOfZones } from "../../states/slices/indexOfHomeTeamZonesSlice";
import { resetGuestTeamIndexOfZones } from "../../states/slices/indexOfGuestTeamZonesSlice";
import { ChangeEvent, useState } from "react";
import { setUpdatedPlayers } from "../../states/slices/listOfPlayersSlice";
import {
  gerPercentOfAttack,
  getAttackEfficency,
  getPlusMinusAttack,
} from "../../utilities/functions";

type TIconOfPlayer = {
  type: string;
  key: number;
  startingSix: TPlayer[];
  player: TPlayer;
  showSquads: boolean;
};

export function IconOfPlayer(props: TIconOfPlayer) {
  const { player, startingSix, type, showSquads } = props;
  const dispatch = useAppDispatch();

  const [diagrammValue, setDiagrammValue] = useState<TAttackDiagramm>({
    winPoints: 0,
    leftInGame: 0,
    attacksInBlock: 0,
    loosePoints: 0,
  });
  const my = type === "my";

  const handleDiagrammValue = (event: ChangeEvent<HTMLInputElement>) => {
    setDiagrammValue({
      ...diagrammValue,
      [event.target.name]: +event.target.value.replace(/\D+/g, ""),
    });
    const updatedPlayer = calculateForData(
      { ...player },
      {
        ...diagrammValue,
        [event.target.name]: +event.target.value.replace(/\D+/g, ""),
      }
    );
    dispatch(setUpdatedPlayers(updatedPlayer));
    dispatch(setInfoOfPlayer(updatedPlayer));
  };

  function calculateForData<T extends TTeam | TPlayer>(obj: T, diagram: TAttackDiagramm): T {
    for (const key in diagram) {
      (obj[key as keyof T] as number) += diagram[key as keyof TAttackDiagramm];
    }
    obj.percentOfAttack = gerPercentOfAttack(obj); //встановлюємо процент зйому
    obj.plusMinusOnAttack = getPlusMinusAttack(obj); //встановлюємо + - в атаці
    obj.efficencyAttack = getAttackEfficency(obj); // встановлюємо ефективність подачі
    return obj;
  }

  function cancelGuestTeamChoice(player: TPlayer) {
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
          {!my && !showSquads && (
            <div className="errors-field-wrapper">
              <table>
                {/* <tbody>
                  <tr>
                    <th>Score</th>
                    <th>Type</th>
                  </tr>
                  <tr>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td></td>
                    <td></td>
                  </tr>
                </tbody> */}

                <tbody>
                  <tr>
                    <th>Type</th>
                    <th>Amount</th>
                  </tr>
                  <tr>
                    <td style={{ backgroundColor: "lightgreen" }}>Win</td>
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
                    <td style={{ backgroundColor: "yellow" }}>Game</td>
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
                    <td style={{ backgroundColor: "orange" }}>Block</td>
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
                    <td style={{ backgroundColor: "orangered" }}>Error</td>
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
