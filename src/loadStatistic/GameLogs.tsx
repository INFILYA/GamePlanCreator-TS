import { useEffect, useState } from "react";
import { RegularButton } from "../css/Button.styled";
import { TGameStats, TObjectStats } from "../types/types";
import { formatStatColumnHeader } from "../utilities/functions";
import { computeRotationReport, isOpponentServeErrorRally, pct } from "../notation/parser";
import { RallyStringDisplay } from "../home page/components/RallyStringDisplay";

type TGameLogs = {
  games: TObjectStats[];
  listOfGames: TGameStats[];
};

type TRotationCountRow = { position: string; count: number };
type TRotationPctRow = {
  position: string;
  made: number;
  attempts: number;
};

const EMPTY_PLUS_MINUS = (): TRotationCountRow[] =>
  ["1", "2", "3", "4", "5", "6"].map((position) => ({ position, count: 0 }));

const EMPTY_PCT_ROWS = (): TRotationPctRow[] =>
  ["1", "2", "3", "4", "5", "6"].map((position) => ({
    position,
    made: 0,
    attempts: 0,
  }));

function sumPctRows(rows: TRotationPctRow[]) {
  return rows.reduce(
    (acc, row) => ({
      made: acc.made + row.made,
      attempts: acc.attempts + row.attempts,
    }),
    { made: 0, attempts: 0 }
  );
}

type TMetricDropdownProps = {
  label: string;
  rows: TRotationPctRow[];
  isOpen: boolean;
  onToggle: () => void;
};

function MetricDropdown({
  label,
  rows,
  isOpen,
  onToggle,
}: TMetricDropdownProps) {
  const total = sumPctRows(rows);

  return (
    <div className="game-rotation-metrics-row game-rotation-metrics-row--aggregate">
      <button
        type="button"
        className="game-rotation-metric-toggle"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <span className="game-rotation-metrics-label">{label}</span>
        <span className="game-rotation-metrics-total">{pct(total.made, total.attempts)}</span>
        <span className="game-rotation-metrics-chevron">{isOpen ? "▲" : "▼"}</span>
      </button>
      {isOpen && (
        <div className="game-rotation-metrics-breakdown">
          {rows.map((zone) => (
            <div key={zone.position} className="game-rotation-metrics-breakdown-item">
              <div>P{zone.position}</div>
              <div>{pct(zone.made, zone.attempts)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function GameLogs(arg: TGameLogs) {
  const { games, listOfGames } = arg;
  const [showLogs, setShowLogs] = useState(false);
  const [expandedMetric, setExpandedMetric] = useState<"fb" | "trans" | null>(
    null
  );
  const [selectedRally, setSelectedRally] = useState<{
    rally: any;
    gameIndex: number;
    setIndex: number;
    rallyIndex: number;
  } | null>(null);
  const [plusMinusPositions, setPlusMinusPositions] = useState(
    EMPTY_PLUS_MINUS()
  );
  const [fbSideOut, setFbSideOut] = useState(EMPTY_PCT_ROWS());
  const [transition, setTransition] = useState(EMPTY_PCT_ROWS());

  useEffect(() => {
    const allRallies = games
      .map((game) => Object.values(game))
      .flat()
      .flat();

    const report = computeRotationReport(allRallies);

    setPlusMinusPositions(
      ["1", "2", "3", "4", "5", "6"].map((pos) => ({
        position: pos,
        count: report[pos]?.plusMinus ?? 0,
      }))
    );
    setFbSideOut(
      ["1", "2", "3", "4", "5", "6"].map((pos) => ({
        position: pos,
        made: report[pos]?.firstBallSideOut.made ?? 0,
        attempts: report[pos]?.firstBallSideOut.attempts ?? 0,
      }))
    );
    setTransition(
      ["1", "2", "3", "4", "5", "6"].map((pos) => ({
        position: pos,
        made: report[pos]?.transition.made ?? 0,
        attempts: report[pos]?.transition.attempts ?? 0,
      }))
    );
  }, [games]);

  return (
    <div className="game-logs-root">
      <RegularButton
        onClick={() => setShowLogs(!showLogs)}
        type="button"
        $color="black"
        $background="orangered"
      >
        {!showLogs ? "Show Game Logs" : "Hide Game Logs"}
      </RegularButton>
      {showLogs && (
        <div className="game-logs-panel">
          <div className="game-rotation-metrics">
            <div className="game-rotation-metrics-row game-rotation-metrics-row--plus-minus">
              <span className="game-rotation-metrics-label">+ / −</span>
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
            </div>
            <MetricDropdown
              label="FB SO%"
              rows={fbSideOut}
              isOpen={expandedMetric === "fb"}
              onToggle={() =>
                setExpandedMetric((prev) => (prev === "fb" ? null : "fb"))
              }
            />
            <MetricDropdown
              label="Transition%"
              rows={transition}
              isOpen={expandedMetric === "trans"}
              onToggle={() =>
                setExpandedMetric((prev) => (prev === "trans" ? null : "trans"))
              }
            />
          </div>
          <div className="gameLog-table-wrapper">
            {games.map((game, index) => (
              <span key={index}>
                <h2>{Object.keys(listOfGames[index])}</h2>
                <table>
                  {Object.values(game).map((sets, setIndex) => {
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
                          let weWon: boolean;
                          if (set.weWon !== undefined) {
                            weWon = set.weWon;
                          } else {
                            const [myScore] = set.score
                              .split(" - ")
                              .map(Number);
                            const [prevMyScore] = previousScore
                              .split(" - ")
                              .map(Number);
                            weWon = myScore > prevMyScore;
                          }

                          previousScore = set.score;

                          const ourSetterPosition =
                            set.setterBoardPosition !== undefined
                              ? set.setterBoardPosition
                              : set.stats &&
                                set.stats.length > 0 &&
                                set.stats[0]?.setterBoardPosition
                              ? set.stats[0].setterBoardPosition
                              : undefined;

                          const isInitialScore = set.score === "0 - 0";
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
        </div>
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
            {selectedRally.rally.notation && (
              <div
                style={{
                  background: "#f8fafc",
                  padding: "10px",
                  borderRadius: "6px",
                  marginBottom: "12px",
                }}
              >
                <RallyStringDisplay notation={selectedRally.rally.notation} />
                <div
                  style={{
                    marginTop: "8px",
                    fontSize: "0.75rem",
                    color: "#64748b",
                    fontFamily: "monospace",
                    wordBreak: "break-all",
                  }}
                >
                  {selectedRally.rally.notation}
                </div>
              </div>
            )}
            {selectedRally.rally.stats &&
            selectedRally.rally.stats.length > 0 ? (
              <div>
                <h4>Players Actions:</h4>
                {(() => {
                  const columns = [
                    { key: "R=", label: "R=" },
                    { key: "R/", label: "R/" },
                    { key: "R-", label: "R-" },
                    { key: "R!", label: "R!" },
                    { key: "R+", label: "R+" },
                    { key: "R++", label: formatStatColumnHeader("R++") },
                    { key: "A++", label: formatStatColumnHeader("A++") },
                    { key: "A+", label: "A+" },
                    { key: "A=", label: "A=" },
                    { key: "A!", label: "A!" },
                    { key: "A-", label: formatStatColumnHeader("A-") },
                    { key: "S++", label: formatStatColumnHeader("S++") },
                    { key: "S+", label: "S+" },
                    { key: "S=", label: "S=" },
                    { key: "S!", label: "S!" },
                    { key: "S-", label: "S-" },
                    { key: "blocks", label: "Blocks" },
                  ];

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
                                    {value !== 0 ? value : 0}
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
            ) : isOpponentServeErrorRally(selectedRally.rally) ? (
              <p className="rally-flow-item-serve-error">Their serve error</p>
            ) : (
              <p style={{ fontStyle: "italic", color: "#666" }}>
                No player actions in this rally (quick point)
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
