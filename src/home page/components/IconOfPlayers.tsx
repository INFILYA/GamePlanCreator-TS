import { TAttackDiagramm, TDiagramm, TMix, TPlayer } from "../../types/types";
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
import { useEffect, useState } from "react";
import { setUpdatedPlayers } from "../../states/slices/listOfPlayersSlice";
import {
  correctZones,
  emptyPlayer,
  preparePlayerToSoloGame,
  spikersPositions,
  zones,
} from "../../utilities/functions";
import { setSoloRallyStats } from "../../states/slices/soloRallyStatsSlice";
import { useSelector } from "react-redux";

type TIconOfPlayer = {
  type: string;
  startingSix: TPlayer[];
  player: TPlayer;
  showSquads: boolean;
  nextRotation: boolean;
  setNextRotation(arg: boolean): void;
};

export function IconOfPlayer(props: TIconOfPlayer) {
  const {
    player,
    nextRotation,
    setNextRotation,
    startingSix,
    type,
    showSquads,
  } = props;
  const dispatch = useAppDispatch();
  const guestTeamOptions = useSelector(selectIndexOfGuestTeamZones);
  const [category, setCategory] = useState<string>("SR");
  const [diagrammValue, setDiagrammValue] = useState<TMix>(emptyPlayer);
  const my = type === "my";

  useEffect(() => {
    const choosenPlayer = startingSix.filter(
      (athlete) => athlete.name === player.name
    );
    const soloGamePlayerStats = preparePlayerToSoloGame(choosenPlayer[0]);
    if (nextRotation) {
      setDiagrammValue(soloGamePlayerStats);
      setNextRotation(false);
    }
    if (player.position === "LIB") {
      setCategory("SR");
    }
  }, [player, startingSix, nextRotation, setNextRotation]);

  function calculateForPlayerData<T extends TMix>(
    obj: T,
    diagram: TDiagramm,
    soloGame?: boolean
  ): T {
    for (const key in diagram) {
      if (!soloGame) {
        if (
          key === "blocks" ||
          key === "A-" ||
          key === "A=" ||
          key === "A+" ||
          key === "A++" ||
          key === "A!" ||
          key === "S++" ||
          key === "S=" ||
          key === "S!" ||
          key === "S+" ||
          key === "S-" ||
          key === "R++" ||
          key === "R=" ||
          key === "R!" ||
          key === "R+" ||
          key === "R-"
        ) {
          (obj[key as keyof T] as number) +=
            diagram[key as keyof TAttackDiagramm];
        } else continue;
      }
      if (soloGame) {
        (obj[key as keyof T] as number) = diagram[key as keyof TAttackDiagramm];
      }
    }
    return obj;
  }

  function cancelGuestTeamChoice(player: TPlayer) {
    if (showSquads) {
      dispatch(pushFromGuestTeamBoard(player));
      dispatch(resetGuestTeamIndexOfZones({ startingSix, player }));
    }
  }
  function cancelHomeTeamChoice(player: TPlayer) {
    if (showSquads) {
      dispatch(pushFromHomeTeamBoard(player));
      dispatch(resetHomeTeamIndexOfZones({ startingSix, player }));
    }
  }

  function showPlayerInfo() {
    if (showSquads) {
      dispatch(setInfoOfPlayer(player));
    }
  }

  function addAmount(type: keyof TMix, number: number) {
    if (diagrammValue[type] === 0 && number === -1) return;
    if (
      !(type === "A-" || type === "A+" || type === "A!") &&
      diagrammValue[type] === 1 &&
      number === 1
    )
      return;
    setDiagrammValue({
      ...diagrammValue,
      [type]: +diagrammValue[type] + number,
    });
    const obj = { [type]: number } as TDiagramm;
    const updatedPlayer = calculateForPlayerData({ ...player }, obj);
    const soloGameUpdatedPlayer = calculateForPlayerData(
      { ...player },
      {
        ...diagrammValue,
        [type]: diagrammValue[type as keyof TDiagramm] + number,
      },
      true
    );
    const seTTer = guestTeamOptions.find((plaer) => plaer.position === "SET");
    if (!seTTer) return;
    const indexOfSetter = guestTeamOptions.indexOf(seTTer);
    
    // ============================================
    // ОТПРАВКА ДЕЙСТВИЙ ИГРОКА В REDUX
    // ============================================
    // Когда игрок делает действие (атака, прием, подача):
    //   1. soloGameUpdatedPlayer содержит накопленные статы из diagrammValue для текущего ралли
    //   2. Создаем playerStats с полными данными игрока (включая позиции на поле)
    //   3. Отправляем в Redux через setSoloRallyStats
    //   4. Redux либо заменяет существующую запись игрока, либо добавляет новую
    // 
    // При записи очка (в RotationPanel.tsx) весь массив SoloRallyStats копируется в gameLog
    // ============================================
    startingSix.forEach(
      (player, index) => {
        if (player.name === soloGameUpdatedPlayer.name) {
          const usedBoardPosition = typeof player.boardPosition === "number" ? player.boardPosition : zones[index];
          
          // Создаем объект со всеми полями статистики (включая нулевые) для правильного суммирования
          // soloGameUpdatedPlayer уже содержит накопленные статы из diagrammValue для текущего ралли
          const playerStats = {
            ...soloGameUpdatedPlayer,
            boardPosition: usedBoardPosition,
            setterBoardPosition: correctZones(indexOfSetter),
            zoneOfAttack: getZoneOfAttack(index, player),
            // Убеждаемся, что все поля статистики присутствуют (даже если 0)
            // Это важно для правильного суммирования в calculateTotalofActionsV2
            "R++": soloGameUpdatedPlayer["R++"] || 0,
            "R+": soloGameUpdatedPlayer["R+"] || 0,
            "R!": soloGameUpdatedPlayer["R!"] || 0,
            "R-": soloGameUpdatedPlayer["R-"] || 0,
            "R=": soloGameUpdatedPlayer["R="] || 0,
            "A++": soloGameUpdatedPlayer["A++"] || 0,
            "A+": soloGameUpdatedPlayer["A+"] || 0,
            "A=": soloGameUpdatedPlayer["A="] || 0,
            "A!": soloGameUpdatedPlayer["A!"] || 0,
            "A-": soloGameUpdatedPlayer["A-"] || 0,
            "S++": soloGameUpdatedPlayer["S++"] || 0,
            "S+": soloGameUpdatedPlayer["S+"] || 0,
            "S!": soloGameUpdatedPlayer["S!"] || 0,
            "S-": soloGameUpdatedPlayer["S-"] || 0,
            "S=": soloGameUpdatedPlayer["S="] || 0,
            blocks: soloGameUpdatedPlayer.blocks || 0,
          };
          
          // Отправляем в Redux для накопления в SoloRallyStats (статы текущего ралли)
          dispatch(setSoloRallyStats(playerStats));
        }
      }
    );
    dispatch(setUpdatedPlayers(updatedPlayer));
    dispatch(setInfoOfPlayer(updatedPlayer));
    dispatch(updateInfoOfStartingSix(updatedPlayer));
    dispatch(updateInfoOfSubPlayers(updatedPlayer));
  }

  function getZoneOfAttack(index: number, playerInSix: TPlayer): number {
    const seTTer = guestTeamOptions.find((player) => player.position === "SET");
    if (!seTTer) return 0;
    const indexOfSetter = guestTeamOptions.indexOf(seTTer);
    // Используем boardPosition из player, если он есть, иначе вычисляем из индекса
    const playerBoardPosition = typeof playerInSix.boardPosition === "number" 
      ? playerInSix.boardPosition 
      : zones[index];
    const playerProperZonesOfSpike = spikersPositions(
      correctZones(indexOfSetter)
    );
    return playerProperZonesOfSpike[playerBoardPosition];
  }

  if (typeof player === "number" || player === null) return;
  const condition = player.number !== 0;
  const serviceGradations = properArr("S");

  const ServiceReception = category === "SR";
  const BlockAttack = category === "BA";
  const attackGradations = BlockAttack ? properArr("A") : properArr("R");
  function properArr(letter: string) {
    const arr = [
      [`${letter}++`, "lightgreen", "#"],
      [`${letter}+`, "aquamarine", "+"],
      [`${letter}!`, "yellow", "!"],
      [`${letter}-`, "orange", "-"],
      [`${letter}=`, "orangered", "="],
    ];
    return arr;
  }
  // player.name === "Cameron Gibson" && console.log(player);
  const playerIndex = startingSix.findIndex((p) => p.name === player.name);
  const zoneNumber = playerIndex !== -1 ? correctZones(playerIndex) : 0;

  return (
    <>
      {condition && (
        <div className="card-content">
          {!showSquads && (
            <div className="zone-names-wrapper">P{zoneNumber}</div>
          )}
          {!my && (
            <div className="player-image-wrapper" onClick={showPlayerInfo}>
              <img src={`/photos/${player?.photo}`} alt=""></img>
            </div>
          )}
          <div className="player-field-wrapper">
            <div className="playerNumber-wrapper">
              <button
                type="button"
                style={
                  my ? { backgroundColor: "#f0f" } : { backgroundColor: "#f0f" }
                }
                onClick={
                  !my
                    ? () => cancelGuestTeamChoice(player)
                    : () => cancelHomeTeamChoice(player)
                }
                draggable={showSquads}
                onDragStart={(e) => {
                  if (showSquads) {
                    e.dataTransfer.setData("player", JSON.stringify(player));
                    e.dataTransfer.setData("team", my ? "my" : "rival");
                    // Сохраняем текущую позицию для возврата
                    const playerIndex = startingSix.findIndex((p) => p.name === player.name);
                    if (playerIndex !== -1) {
                      const currentZone = correctZones(playerIndex);
                      e.dataTransfer.setData("currentZone", currentZone.toString());
                    }
                    e.dataTransfer.effectAllowed = "move";
                  }
                }}
              >
                {player.number}
              </button>
            </div>
            <div className="player-surname-wrapper">
              <button
                type="button"
                className={player.position === "LIB" ? "" : "player-surname"}
                style={
                  my
                    ? player.position === "LIB"
                      ? { backgroundColor: "turquoise" }
                      : { backgroundColor: "#a9a9a9" }
                    : {}
                }
                onClick={showPlayerInfo}
              >
                {player.name}
              </button>
            </div>
          </div>
          {!showSquads && (
            <div className="errors-field-wrapper">
              <div className="category-switcher-wrapper">
                <select onChange={(e) => setCategory(e.target.value)}>
                  <option value={"SR"}>Service/Reception</option>
                  {player.position !== "LIB" && (
                    <option value={"BA"}>Block/Attack</option>
                  )}
                </select>
              </div>
              <div style={{ display: "flex" }}>
                <table>
                  <tbody>
                    <tr>
                      <th>+</th>
                      <th>{ServiceReception ? "S" : "BL"}</th>
                      <th>-</th>
                    </tr>
                    {ServiceReception ? (
                      serviceGradations.map((grade) => (
                        <tr key={grade[0]}>
                          <td
                            style={{ backgroundColor: grade[1] }}
                            onClick={() => addAmount(grade[0] as keyof TMix, 1)}
                          >
                            {grade[2]}
                          </td>
                          <td>
                            <input
                              type="text"
                              min={0}
                              value={diagrammValue[grade[0] as keyof TMix]}
                              name={grade[0]}
                              readOnly
                            />
                          </td>
                          <td
                            style={{ backgroundColor: grade[1] }}
                            onClick={() =>
                              addAmount(grade[0] as keyof TMix, -1)
                            }
                          >
                            -
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          style={{ backgroundColor: "llightgreen" }}
                          onClick={() => addAmount("blocks", 1)}
                        >
                          B
                        </td>
                        <td>
                          <input
                            type="text"
                            min={0}
                            value={diagrammValue.blocks}
                            name="blocks"
                            readOnly
                          />
                        </td>
                        <td
                          style={{ backgroundColor: "llightgreen" }}
                          onClick={() => addAmount("blocks", -1)}
                        >
                          -
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                <div className="border-wrapper"></div>
                <table>
                  <tbody>
                    <tr>
                      <th>+</th>
                      <th>{ServiceReception ? "R" : "A"}</th>
                      <th>-</th>
                    </tr>
                    {attackGradations.map((grade) => (
                      <tr key={grade[0]}>
                        <td
                          style={{ backgroundColor: grade[1] }}
                          onClick={() => addAmount(grade[0] as keyof TMix, 1)}
                        >
                          {grade[2]}
                        </td>
                        <td>
                          <input
                            type="text"
                            min={0}
                            value={
                              diagrammValue[grade[0] as keyof TAttackDiagramm]
                            }
                            name={grade[0]}
                            readOnly
                          />
                        </td>
                        <td
                          style={{ backgroundColor: grade[1] }}
                          onClick={() => addAmount(grade[0] as keyof TMix, -1)}
                        >
                          -
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
