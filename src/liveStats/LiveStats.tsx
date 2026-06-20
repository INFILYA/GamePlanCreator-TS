import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import SectionWrapper from "../wrappers/SectionWrapper";
import { RegularButton } from "../css/Button.styled";
import { RallyFlowList } from "../home page/components/RallyFlowList";
import { selectLiveGame, selectLiveScore } from "../states/slices/liveGameSlice";
import { selectRallyNotation } from "../states/slices/rallyNotationSlice";

export default function LiveStats() {
  const liveGame = useSelector(selectLiveGame);
  const liveScore = useSelector(selectLiveScore);
  const currentNotation = useSelector(selectRallyNotation);

  const {
    gameLog,
    weServe,
    opponentTeamName,
    setNumber,
    exhibitionGame,
    teamName,
    inStatMode,
  } = liveGame;

  return (
    <article className="main-content-wrapper live-stats-page">
      <SectionWrapper className="live-stats-section">
        <div className="live-stats-header">
          <NavLink to="/">
            <RegularButton type="button" $color="white" $background="#64748b">
              ← Back to court
            </RegularButton>
          </NavLink>
          <div className="live-stats-title-block">
            <h1 className="live-stats-title">Game flow</h1>
            <p className="live-stats-subtitle">Rally-by-rally actions</p>
          </div>
        </div>

        <div className="live-stats-scoreboard">
          <div className="live-stats-team">
            <span className="live-stats-team-label">Us</span>
            <span className="live-stats-team-name">{teamName || "Our team"}</span>
          </div>
          <div className="live-stats-score">{liveScore}</div>
          <div className="live-stats-team live-stats-team--rival">
            <span className="live-stats-team-label">Them</span>
            <span className="live-stats-team-name">
              {opponentTeamName || "Opponent"}
            </span>
          </div>
        </div>

        <div className="live-stats-meta">
          {setNumber && <span>{setNumber}</span>}
          {exhibitionGame && (
            <span className="live-stats-exhibition">Exhibition game</span>
          )}
          <span>{weServe ? "🏐 We serve" : "🏐 They serve"}</span>
          <span>{gameLog.length} rallies completed</span>
        </div>

        {!inStatMode && gameLog.length === 0 && !currentNotation && (
          <p className="rally-flow-empty">
            Enter statistic mode on the court page to start recording.
          </p>
        )}

        <div className="live-stats-flow-panel">
          <RallyFlowList
            gameLog={gameLog}
            currentNotation={currentNotation}
            liveScore={liveScore}
            weServe={weServe}
          />
        </div>
      </SectionWrapper>
    </article>
  );
}
