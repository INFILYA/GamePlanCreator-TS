import { useEffect, useState } from "react";
import { RegularButton } from "../css/Button.styled";
import { TGameStats, TObjectStats } from "../types/types";

type TGameLogs = {
  games: TObjectStats[];
  listOfGames: TGameStats[];
};

export default function GameLogs(arg: TGameLogs) {
  const { games, listOfGames } = arg;
  const [showLogs, setShowLogs] = useState(false);
  const [selectedRally, setSelectedRally] = useState<{
    rally: any;
    gameIndex: number;
    setIndex: number;
    rallyIndex: number;
  } | null>(null);
  const [plusMinusPositions, setPlusMinusPositions] = useState([
    { count: 0, position: "1" },
    { count: 0, position: "2" },
    { count: 0, position: "3" },
    { count: 0, position: "4" },
    { count: 0, position: "5" },
    { count: 0, position: "6" },
  ]);

  useEffect(() => {
    const newGame = [
      { count: 0, position: "1" },
      { count: 0, position: "2" },
      { count: 0, position: "3" },
      { count: 0, position: "4" },
      { count: 0, position: "5" },
      { count: 0, position: "6" },
    ];
    // Получаем все ралли, включая "0 - 0"
    const allRallies = games
      .map((game) => Object.values(game))
      .flat()
      .flat();

    // Находим первое ралли "0 - 0" для получения начальной позиции связующего
    const initialRally = allRallies.find((ball) => ball.score === "0 - 0");
    let initialSetterPosition: number | undefined = undefined;

    if (initialRally) {
      if (initialRally.setterBoardPosition !== undefined) {
        initialSetterPosition = initialRally.setterBoardPosition;
      } else if (
        initialRally.stats &&
        initialRally.stats.length > 0 &&
        initialRally.stats[0]?.setterBoardPosition
      ) {
        initialSetterPosition = initialRally.stats[0].setterBoardPosition;
      }
    }

    // Фильтруем ралли без "0 - 0" для расчета плюс/минус
    const game = allRallies.filter((ball) => ball.score !== "0 - 0");

    // Для определения кто выиграл очко, нужно сравнивать счет
    let previousScore = "0 - 0";

    // Если есть начальное ралли "0 - 0" с позицией, учитываем её для первого ралли
    // Это нужно, чтобы позиция из "0 - 0" была учтена в подсчете, даже если первый ралли имеет свою позицию
    if (initialSetterPosition !== undefined && game.length > 0) {
      const firstRally = game[0];
      // Определяем позицию первого ралли
      const firstRallyPosition =
        firstRally.setterBoardPosition !== undefined
          ? firstRally.setterBoardPosition
          : firstRally.stats &&
            firstRally.stats.length > 0 &&
            firstRally.stats[0]?.setterBoardPosition
          ? firstRally.stats[0].setterBoardPosition
          : undefined;

      // Если позиция первого ралли отличается от позиции "0 - 0", учитываем позицию из "0 - 0"
      // Это означает, что в первом ралли произошла смена позиции, и нужно учесть начальную позицию
      if (firstRallyPosition !== initialSetterPosition) {
        // Используем weWon из первого ралли для определения, как учитывать начальную позицию
        const firstRallyWeWon =
          firstRally.weWon !== undefined
            ? firstRally.weWon
            : (() => {
                const [myScore] = firstRally.score.split(" - ").map(Number);
                const [prevMyScore] = "0 - 0".split(" - ").map(Number);
                return myScore > prevMyScore;
              })();

        // Учитываем позицию из "0 - 0" для первого ралли
        if (firstRallyWeWon) {
          newGame[initialSetterPosition - 1].count += 1;
        } else {
          newGame[initialSetterPosition - 1].count -= 1;
        }
      }
    }

    game.forEach((rall, index) => {
      // Определяем расстановку связующего нашей команды
      // Сначала проверяем setterBoardPosition на уровне ралли (для ралли без действий)
      // Если нет, проверяем в stats[0] (для ралли с действиями, старые данные)
      // Если и там нет, для первого ралли используем позицию из "0 - 0"
      let setterPosition: number | undefined = undefined;

      if (rall.setterBoardPosition !== undefined) {
        // Расстановка сохранена на уровне ралли (для ралли без действий или с действиями)
        setterPosition = rall.setterBoardPosition;
      } else if (
        rall.stats &&
        rall.stats.length > 0 &&
        rall.stats[0]?.setterBoardPosition
      ) {
        // Расстановка в stats (для ралли с действиями, старые данные)
        setterPosition = rall.stats[0].setterBoardPosition;
      } else if (index === 0 && initialSetterPosition !== undefined) {
        // Для первого розыгрыша (после "0 - 0") используем начальную позицию из "0 - 0"
        // Это нужно, так как первый розыгрыш может не иметь сохраненной позиции
        setterPosition = initialSetterPosition;
      }

      // Используем weWon из данных ралли (если есть), иначе вычисляем по изменению счета
      let weWon: boolean;
      if (rall.weWon !== undefined) {
        // Используем сохраненное значение weWon
        weWon = rall.weWon;
      } else {
        // Fallback: вычисляем по изменению счета (для старых данных)
        const [myScore] = rall.score.split(" - ").map(Number);
        const [prevMyScore] = previousScore.split(" - ").map(Number);
        weWon = myScore > prevMyScore; // Наш счет увеличился
      }

      // Логика как в Data Volley:
      // 1. Берем каждое ралли
      // 2. Смотрим в какой зоне наш связующий (setterPosition)
      // 3. Проверяем выиграли очко или проиграли (используем weWon из данных)
      // 4. Записываем +1 или -1 в эту расстановку
      // Не имеет значения: кто подает, из какой зоны атака, какой элемент принес очко

      if (setterPosition !== undefined) {
        if (weWon) {
          // Мы выиграли очко - увеличиваем счет для позиции связующего
          newGame[setterPosition - 1].count += 1;
        } else {
          // Мы проиграли очко - уменьшаем счет для позиции связующего
          newGame[setterPosition - 1].count -= 1;
        }
      }

      // Обновляем предыдущий счет для следующей итерации
      previousScore = rall.score;
    });
    setPlusMinusPositions(newGame);
  }, [games]);

  return (
    <>
      <RegularButton
        onClick={() => setShowLogs(!showLogs)}
        type="button"
        $color="black"
        $background="orangered"
      >
        {!showLogs ? "Show Game Logs" : "Hide Game Logs"}
      </RegularButton>
      {showLogs && (
        <>
          <div className="game-plusMinus-position-wrapper">
            {plusMinusPositions.map((zone) => (
              <div key={zone.position}>
                <div>P{zone.position}</div>
                <div
                  style={
                    zone.count >= 0
                      ? { color: "green" }
                      : { color: "orangered" }
                  }
                >
                  {zone.count}
                </div>
              </div>
            ))}
          </div>
          <div className="gameLog-table-wrapper">
            {games.map((game, index) => (
              <span key={index}>
                <h2>{Object.keys(listOfGames[index])}</h2>
                <table>
                  {Object.values(game).map((sets, setIndex) => {
                    // Для определения кто выиграл очко, нужно сравнивать счет
                    let previousScore = "0 - 0";

                    return (
                      <tbody key={setIndex} className="rating-table-wrapper">
                        <tr className="gameLog-set-wrapper">
                          <td>{Object.keys(game)[setIndex]}</td>
                        </tr>
                        <tr className="gameLog-column-wrapper">
                          <td>Setter</td>
                          <td>Service</td>
                          <td>Score</td>
                          <td>Service</td>
                          <td>Setter</td>
                        </tr>
                        {Object.values(sets).map((set, rallyIndex) => {
                          // Используем weWon из данных ралли (если есть), иначе вычисляем по изменению счета
                          let weWon: boolean;
                          if (set.weWon !== undefined) {
                            // Используем сохраненное значение weWon
                            weWon = set.weWon;
                          } else {
                            // Fallback: вычисляем по изменению счета (для старых данных)
                            const [myScore] = set.score
                              .split(" - ")
                              .map(Number);
                            const [prevMyScore] = previousScore
                              .split(" - ")
                              .map(Number);
                            weWon = myScore > prevMyScore; // Наш счет увеличился
                          }

                          // Обновляем предыдущий счет для следующей итерации
                          previousScore = set.score;

                          // Определяем расстановку связующего нашей команды
                          // Сначала проверяем setterBoardPosition на уровне ралли (для ралли без действий)
                          // Если нет, проверяем в stats[0] (для ралли с действиями, старые данные)
                          const ourSetterPosition =
                            set.setterBoardPosition !== undefined
                              ? set.setterBoardPosition
                              : set.stats &&
                                set.stats.length > 0 &&
                                set.stats[0]?.setterBoardPosition
                              ? set.stats[0].setterBoardPosition
                              : undefined;

                          // Отображаем расстановку связующего:
                          // - Слева (зеленый) - если мы выиграли очко в этой расстановке
                          // - Справа (красный) - если мы проиграли очко в этой расстановке
                          // ВАЖНО: Всегда отображаем позицию, если она есть, даже если нет действий игроков
                          const isInitialScore = set.score === "0 - 0";

                          // Определяем, где показывать позицию:
                          // - Слева (зеленый) - если мы выиграли очко
                          // - Справа (красный) - если мы проиграли очко
                          // - Слева (серый) - для начального счета (0-0)
                          const showLeft =
                            ourSetterPosition !== undefined &&
                            (weWon || isInitialScore);
                          const showRight =
                            ourSetterPosition !== undefined &&
                            !weWon &&
                            !isInitialScore;

                          return (
                            <tr
                              className="gameLog-column-wrapper"
                              key={rallyIndex}
                            >
                              <td
                                style={{
                                  color: showLeft
                                    ? weWon && !isInitialScore
                                      ? "green"
                                      : "gray"
                                    : "",
                                  fontWeight:
                                    ourSetterPosition !== undefined
                                      ? "bold"
                                      : "normal",
                                }}
                              >
                                {showLeft ? `P${ourSetterPosition}` : ""}
                              </td>
                              <td>{set.weServe ? "🏐" : ""}</td>
                              <td
                                style={{
                                  cursor: "pointer",
                                  textDecoration: "underline",
                                }}
                                onClick={() =>
                                  setSelectedRally({
                                    rally: set,
                                    gameIndex: index,
                                    setIndex: setIndex,
                                    rallyIndex,
                                  })
                                }
                              >
                                {set.score}
                              </td>
                              <td>{!set.weServe ? "🏐" : ""}</td>
                              <td
                                style={{
                                  color: showRight ? "orangered" : "",
                                  fontWeight:
                                    ourSetterPosition !== undefined
                                      ? "bold"
                                      : "normal",
                                }}
                              >
                                {showRight ? `P${ourSetterPosition}` : ""}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    );
                  })}
                </table>
              </span>
            ))}
          </div>
        </>
      )}
      {selectedRally && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
          onClick={() => setSelectedRally(null)}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "10px",
              maxWidth: "600px",
              maxHeight: "80vh",
              overflow: "auto",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedRally(null)}
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                background: "orangered",
                color: "white",
                border: "none",
                borderRadius: "5px",
                padding: "5px 10px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              ✕
            </button>
            <h3 style={{ marginTop: 0 }}>
              Rally Details - Score: {selectedRally.rally.score}
            </h3>
            {selectedRally.rally.stats &&
            selectedRally.rally.stats.length > 0 ? (
              <div>
                <h4>Players Actions:</h4>
                {(() => {
                  // Определяем какие колонки имеют ненулевые значения
                  const columns = [
                    { key: "R++", label: "R++" },
                    { key: "R+", label: "R+" },
                    { key: "R!", label: "R!" },
                    { key: "R-", label: "R-" },
                    { key: "R=", label: "R=" },
                    { key: "A++", label: "A++" },
                    { key: "A+", label: "A+" },
                    { key: "A=", label: "A=" },
                    { key: "A!", label: "A!" },
                    { key: "A-", label: "A-" },
                    { key: "S++", label: "S++" },
                    { key: "S+", label: "S+" },
                    { key: "S=", label: "S=" },
                    { key: "S!", label: "S!" },
                    { key: "S-", label: "S-" },
                    { key: "blocks", label: "Blocks" },
                  ];

                  // Фильтруем колонки, оставляя только те, где есть хотя бы одно ненулевое значение
                  const visibleColumns = columns.filter((col) => {
                    return selectedRally.rally.stats.some((player: any) => {
                      const value = player[col.key];
                      return (
                        value !== undefined && value !== null && value !== 0
                      );
                    });
                  });

                  return (
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        marginTop: "10px",
                      }}
                    >
                      <thead>
                        <tr style={{ backgroundColor: "#f0f0f0" }}>
                          <th
                            style={{
                              padding: "8px",
                              border: "1px solid #ddd",
                              textAlign: "left",
                            }}
                          >
                            Player
                          </th>
                          {visibleColumns.map((col) => (
                            <th
                              key={col.key}
                              style={{
                                padding: "8px",
                                border: "1px solid #ddd",
                                textAlign: "center",
                              }}
                            >
                              {col.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {selectedRally.rally.stats.map(
                          (player: any, playerIndex: number) => (
                            <tr key={playerIndex}>
                              <td
                                style={{
                                  padding: "8px",
                                  border: "1px solid #ddd",
                                  fontWeight: "bold",
                                }}
                              >
                                {player.name || "Unknown"}
                              </td>
                              {visibleColumns.map((col) => {
                                const value = player[col.key] || 0;
                                return (
                                  <td
                                    key={col.key}
                                    style={{
                                      padding: "8px",
                                      border: "1px solid #ddd",
                                      textAlign: "center",
                                    }}
                                  >
                                    {value !== 0 ? value : ""}
                                  </td>
                                );
                              })}
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  );
                })()}
              </div>
            ) : (
              <p style={{ fontStyle: "italic", color: "#666" }}>
                No player actions in this rally (quick point, e.g., service
                error)
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
