import { RallyStringDisplay } from "./RallyStringDisplay";
import { isOpponentServeErrorRally } from "../../notation/parser";
import type { TGameLogStats } from "../../types/types";

type TRallyFlowListProps = {
  gameLog: TGameLogStats;
  currentNotation?: string;
  liveScore?: string;
  weServe?: boolean;
};

export function RallyFlowList({
  gameLog,
  currentNotation = "",
  liveScore = "0 - 0",
  weServe = false,
}: TRallyFlowListProps) {
  const hasCurrentRally = Boolean(currentNotation?.trim());
  const totalCount = gameLog.length + (hasCurrentRally ? 1 : 0);

  if (totalCount === 0) {
    return (
      <p className="rally-flow-empty">No rallies recorded yet. Start scouting on the court.</p>
    );
  }

  return (
    <ol className="rally-flow-list">
      {gameLog.map((rally, index) => (
        <li key={`${rally.score}-${index}`} className="rally-flow-item">
          <div className="rally-flow-item-header">
            <span className="rally-flow-item-index">#{index + 1}</span>
            <span className="rally-flow-item-score">{rally.score}</span>
            {rally.setterBoardPosition !== undefined && (
              <span className="rally-flow-item-rotation">
                P{rally.setterBoardPosition}
              </span>
            )}
            <span
              className={`rally-flow-item-result${
                rally.weWon
                  ? " rally-flow-item-result--won"
                  : " rally-flow-item-result--lost"
              }`}
            >
              {rally.weWon ? "We won" : "We lost"}
            </span>
            <span className="rally-flow-item-serve" title="Who served">
              {rally.weServe ? "🏐 us" : "🏐 them"}
            </span>
          </div>
          {rally.notation ? (
            <RallyStringDisplay
              notation={rally.notation}
              className="rally-flow-item-actions"
            />
          ) : isOpponentServeErrorRally(rally) ? (
            <p className="rally-flow-item-serve-error">Their serve error</p>
          ) : (
            <p className="rally-flow-item-empty">No notation recorded</p>
          )}
        </li>
      ))}

      {hasCurrentRally && (
        <li className="rally-flow-item rally-flow-item--live">
          <div className="rally-flow-item-header">
            <span className="rally-flow-item-index">●</span>
            <span className="rally-flow-item-score">{liveScore}</span>
            <span className="rally-flow-item-live-label">In progress</span>
            <span className="rally-flow-item-serve" title="Who serves">
              {weServe ? "🏐 us" : "🏐 them"}
            </span>
          </div>
          <RallyStringDisplay
            notation={currentNotation}
            className="rally-flow-item-actions"
          />
        </li>
      )}
    </ol>
  );
}
