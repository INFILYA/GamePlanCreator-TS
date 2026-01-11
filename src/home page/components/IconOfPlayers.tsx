import { TAttackDiagramm, TDiagramm, TMix, TPlayer } from "../../types/types";
import { useAppDispatch } from "../../states/store";
import { setInfoOfPlayer } from "../../states/slices/playerInfoSlice";
import { pushFromGuestTeamBoard } from "../../states/slices/guestPlayersSlice";
import {
  resetGuestTeamIndexOfZones,
  selectIndexOfGuestTeamZones,
  updateInfoOfStartingSix,
} from "../../states/slices/indexOfGuestTeamZonesSlice";
import { useEffect, useState, useRef } from "react";
import { setUpdatedPlayers } from "../../states/slices/listOfPlayersSlice";
import {
  correctZones,
  emptyPlayer,
  preparePlayerToSoloGame,
} from "../../utilities/functions";
import { setSoloRallyStats } from "../../states/slices/soloRallyStatsSlice";
import { useSelector } from "react-redux";

type TIconOfPlayer = {
  startingSix: TPlayer[];
  player: TPlayer;
  showSquads: boolean;
  nextRotation: boolean;
  setNextRotation(arg: boolean): void;
};

export function IconOfPlayer(props: TIconOfPlayer) {
  const { player, nextRotation, setNextRotation, startingSix, showSquads } =
    props;
  const dispatch = useAppDispatch();
  const guestTeamOptions = useSelector(selectIndexOfGuestTeamZones);
  const [category, setCategory] = useState<string>("SR");
  const [diagrammValue, setDiagrammValue] = useState<TMix>(emptyPlayer);
  const playerNameButtonRef = useRef<HTMLButtonElement>(null);
  const [displayName, setDisplayName] = useState<string>(player.name);

  useEffect(() => {
    const choosenPlayer = startingSix.filter(
      (athlete) => athlete.name === player.name
    );
    if (choosenPlayer.length === 0) return;
    const soloGamePlayerStats = preparePlayerToSoloGame(choosenPlayer[0]);
    if (nextRotation) {
      setDiagrammValue(soloGamePlayerStats);
      setNextRotation(false);
    }
    if (player.position === "LIB") {
      setCategory("SR");
    }
  }, [player, startingSix, nextRotation, setNextRotation]);

  // Логика для обрезки имени, если оно не помещается
  useEffect(() => {
    if (!playerNameButtonRef.current) return;

    const checkOverflow = () => {
      const button = playerNameButtonRef.current;
      if (!button) return;

      // Получаем стили кнопки для точного измерения
      const buttonStyles = window.getComputedStyle(button);
      const paddingLeft = parseFloat(buttonStyles.paddingLeft) || 0;
      const paddingRight = parseFloat(buttonStyles.paddingRight) || 0;
      const availableWidth = button.clientWidth - paddingLeft - paddingRight;

      // Создаем временный элемент для измерения ширины полного имени
      const tempSpan = document.createElement("span");
      tempSpan.style.visibility = "hidden";
      tempSpan.style.position = "absolute";
      tempSpan.style.whiteSpace = "nowrap";
      tempSpan.style.fontSize = buttonStyles.fontSize;
      tempSpan.style.fontWeight = buttonStyles.fontWeight;
      tempSpan.style.fontFamily = buttonStyles.fontFamily;
      tempSpan.style.fontStyle = buttonStyles.fontStyle;
      tempSpan.style.letterSpacing = buttonStyles.letterSpacing;
      tempSpan.textContent = player.name;
      document.body.appendChild(tempSpan);

      const fullNameWidth = tempSpan.offsetWidth;
      document.body.removeChild(tempSpan);

      // Проверяем, помещается ли полное имя
      if (fullNameWidth > availableWidth) {
        // Если не помещается, показываем только имя (первое слово)
        const firstName = player.name.split(" ")[0];
        setDisplayName(firstName);
      } else {
        // Если помещается, показываем полное имя
        setDisplayName(player.name);
      }
    };

    // Проверяем после небольшой задержки, чтобы DOM обновился
    const timeoutId = setTimeout(checkOverflow, 50);

    // Проверяем при изменении размера окна
    const resizeObserver = new ResizeObserver(() => {
      setTimeout(checkOverflow, 50);
    });
    if (playerNameButtonRef.current) {
      resizeObserver.observe(playerNameButtonRef.current);
    }

    // Также проверяем при изменении размера окна браузера
    window.addEventListener("resize", checkOverflow);

    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
      window.removeEventListener("resize", checkOverflow);
    };
  }, [player.name]);

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

    if (guestTeamOptions.length === 0) return;
    const setter = guestTeamOptions.find((p) => p.position === "SET");
    if (!setter) return;
    const indexOfSetter = guestTeamOptions.indexOf(setter);

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
    // Функция для поиска middle blocker на задней линии (позиции P1, P6, P5)
    // Ищем в guestTeamOptions - актуальное состояние доски, даже если MB не делал действий
    function getMiddleBlockerBackRowPosition(): number | null {
      // Задняя линия: P1 (boardPosition=1), P6 (boardPosition=6), P5 (boardPosition=5)
      const backRowPositions = [1, 6, 5];
      for (const pos of backRowPositions) {
        const mbPlayer = guestTeamOptions.find(
          (p) => p.position === "MB" && p.boardPosition === pos
        );
        if (mbPlayer) {
          return pos;
        }
      }
      return null;
    }

    // Находим игрока в guestTeamOptions для получения правильного boardPosition с доски
    const playerOnBoard = guestTeamOptions.find((p) => p.name === player.name);
    if (!playerOnBoard) {
      return;
    }

    // Получаем boardPosition из guestTeamOptions (актуальное состояние доски)
    let usedBoardPosition =
      typeof playerOnBoard.boardPosition === "number"
        ? playerOnBoard.boardPosition
        : -1;

    // Для либеро boardPosition уже должен быть установлен при добавлении на доску
    // Но на всякий случай проверяем и исправляем, если нужно
    if (playerOnBoard.position === "LIB" && usedBoardPosition === -1) {
      const mbBackRowPos = getMiddleBlockerBackRowPosition();
      if (mbBackRowPos !== null) {
        usedBoardPosition = mbBackRowPos;
      }
    }

    // Создаем playerWithBoardPosition с правильным boardPosition из доски
    const playerWithBoardPosition = {
      ...player,
      boardPosition: usedBoardPosition,
    };

    const soloGameUpdatedPlayer = calculateForPlayerData(
      { ...playerWithBoardPosition },
      {
        ...diagrammValue,
        [type]: diagrammValue[type as keyof TDiagramm] + number,
      },
      true
    );

    // Создаем объект со всеми полями статистики (включая нулевые) для правильного суммирования
    // soloGameUpdatedPlayer уже содержит накопленные статы из diagrammValue для текущего ралли
    const playerStats = {
      ...soloGameUpdatedPlayer,
      boardPosition: usedBoardPosition,
      setterBoardPosition: correctZones(indexOfSetter),
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
    dispatch(setUpdatedPlayers(updatedPlayer));
    dispatch(setInfoOfPlayer(updatedPlayer));
    dispatch(updateInfoOfStartingSix(updatedPlayer));
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
  const playerIndex = startingSix.findIndex((p) => p.name === player.name);
  const zoneNumber = playerIndex !== -1 ? correctZones(playerIndex) : 0;

  return (
    <>
      {condition && (
        <div
          className="card-content"
          style={
            player.boardPosition === -1
              ? {
                  border: "none",
                  backgroundColor: "transparent",
                  ...(!showSquads ? { minWidth: "220px", width: "auto" } : {}),
                }
              : undefined
          }
        >
          {!showSquads && player.boardPosition !== -1 && (
            <div className="zone-names-wrapper">P{zoneNumber}</div>
          )}
          {player.boardPosition !== -1 && (
            <div className="player-image-wrapper" onClick={showPlayerInfo}>
              <img src={`/photos/${player?.photo}`} alt=""></img>
            </div>
          )}
          <div className="player-field-wrapper">
            <div className="playerNumber-wrapper">
              <button
                type="button"
                style={{ backgroundColor: "#f0f" }}
                onClick={() => cancelGuestTeamChoice(player)}
                draggable={showSquads}
                onDragStart={(e) => {
                  if (showSquads) {
                    e.dataTransfer.setData("player", JSON.stringify(player));
                    e.dataTransfer.setData("team", "rival");
                    // Сохраняем текущую позицию для возврата
                    const draggedPlayerIndex = startingSix.findIndex(
                      (p) => p.name === player.name
                    );
                    if (draggedPlayerIndex !== -1) {
                      const currentZone = correctZones(draggedPlayerIndex);
                      e.dataTransfer.setData(
                        "currentZone",
                        currentZone.toString()
                      );
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
                ref={playerNameButtonRef}
                type="button"
                className={player.position === "LIB" ? "" : "player-surname"}
                style={
                  player.boardPosition === -1
                    ? {
                        backgroundColor: "turquoise",
                      }
                    : undefined
                }
                onClick={showPlayerInfo}
                title={player.name}
              >
                {displayName}
              </button>
            </div>
          </div>
          {!showSquads && (
            <div
              className="errors-field-wrapper"
              style={
                player.position === "LIB"
                  ? { maxHeight: "200px", overflowY: "auto" }
                  : undefined
              }
            >
              {player.position === "LIB" ? (
                // Горизонтальная версия для либеро - только прием (3 строки x 5 столбцов)
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                    minWidth: "100%",
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(5, 1fr)",
                      gap: "12px",
                    }}
                  >
                    {attackGradations.map((grade) => (
                      <div
                        key={grade[0]}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <div
                          style={{
                            backgroundColor: grade[1],
                            width: "100%",
                            textAlign: "center",
                            padding: "4px",
                            cursor: "pointer",
                            borderRadius: "4px",
                            fontWeight: "bold",
                          }}
                          onClick={() => addAmount(grade[0] as keyof TMix, 1)}
                        >
                          {grade[2]}
                        </div>
                        <input
                          type="text"
                          value={
                            diagrammValue[grade[0] as keyof TAttackDiagramm] ||
                            0
                          }
                          name={grade[0]}
                          readOnly
                          style={{
                            width: "100%",
                            textAlign: "center",
                            border: "1px solid #ccc",
                            borderRadius: "0",
                            padding: "4px",
                            boxSizing: "border-box",
                            background: "transparent",
                          }}
                        />
                        <div
                          style={{
                            backgroundColor: grade[1],
                            width: "100%",
                            textAlign: "center",
                            padding: "4px",
                            cursor: "pointer",
                            borderRadius: "0 0 4px 4px",
                            fontWeight: "bold",
                          }}
                          onClick={() => addAmount(grade[0] as keyof TMix, -1)}
                        >
                          -
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                // Вертикальная версия для обычных игроков
                <>
                  <div className="category-switcher-wrapper" style={{
                    display: "flex",
                    gap: "4px",
                    justifyContent: "space-around",
                    marginBottom: "4px",
                  }}>
                    <label style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "3px",
                      cursor: "pointer",
                      fontSize: "11px",
                      fontWeight: category === "SR" ? "bold" : "normal",
                      color: category === "SR" ? "#2563eb" : "#64748b",
                      padding: "2px 4px",
                    }}>
                      <input
                        type="radio"
                        name={`category-${player.name}`}
                        value="SR"
                        checked={category === "SR"}
                        onChange={(e) => setCategory(e.target.value)}
                        style={{
                          cursor: "pointer",
                          width: "12px",
                          height: "12px",
                          accentColor: "#2563eb",
                          margin: "0",
                        }}
                      />
                      S/R
                    </label>
                    <label style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "3px",
                      cursor: "pointer",
                      fontSize: "11px",
                      fontWeight: category === "BA" ? "bold" : "normal",
                      color: category === "BA" ? "#2563eb" : "#64748b",
                      padding: "2px 4px",
                    }}>
                      <input
                        type="radio"
                        name={`category-${player.name}`}
                        value="BA"
                        checked={category === "BA"}
                        onChange={(e) => setCategory(e.target.value)}
                        style={{
                          cursor: "pointer",
                          width: "12px",
                          height: "12px",
                          accentColor: "#2563eb",
                          margin: "0",
                        }}
                      />
                      B/A
                    </label>
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
                                onClick={() =>
                                  addAmount(grade[0] as keyof TMix, 1)
                                }
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
                                  style={{
                                    border: "1px solid #ccc",
                                  }}
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
                              style={{ backgroundColor: "lightgreen" }}
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
                                style={{
                                  border: "1px solid #ccc",
                                }}
                              />
                            </td>
                            <td
                              style={{ backgroundColor: "lightgreen" }}
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
                              onClick={() =>
                                addAmount(grade[0] as keyof TMix, 1)
                              }
                            >
                              {grade[2]}
                            </td>
                            <td>
                              <input
                                type="text"
                                min={0}
                                value={
                                  diagrammValue[
                                    grade[0] as keyof TAttackDiagramm
                                  ]
                                }
                                name={grade[0]}
                                readOnly
                                style={{
                                  border: "1px solid #ccc",
                                }}
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
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
