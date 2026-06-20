import {
  SKILL_DISPLAY_COLORS,
  SKILL_LABELS,
  gradeColorFor,
  gradeLabelFor,
  isTerminalRallyToken,
} from "../../notation/grades";
import { parseTokensFromNotation } from "../../notation/parser";
import type { TRallyToken } from "../../notation/types";

type TRallyStringDisplayProps = {
  notation: string;
  emptyLabel?: string;
  className?: string;
};

function RallyTokenChip({ token }: { token: TRallyToken }) {
  const gradeColor = gradeColorFor(token.skill, token.grade);
  const gradeLabel = gradeLabelFor(token.skill, token.grade);
  const skillColor = SKILL_DISPLAY_COLORS[token.skill];
  const terminal = isTerminalRallyToken(token);

  return (
    <span
      className={`rally-string-token${terminal ? " rally-string-token--terminal" : ""}`}
      style={{
        backgroundColor: gradeColor,
        borderColor: skillColor,
      }}
      title={`${token.raw} — ${SKILL_LABELS[token.skill]}: ${gradeLabel}`}
    >
      <span className="rally-string-token-jersey" style={{ color: skillColor }}>
        #{token.playerNumber}
      </span>
      <span className="rally-string-token-skill">{SKILL_LABELS[token.skill]}</span>
      <span className="rally-string-token-grade">{gradeLabel}</span>
      <span className="rally-string-token-raw" aria-hidden="true">
        {token.raw}
      </span>
    </span>
  );
}

export function RallyStringDisplay({
  notation,
  emptyLabel = "— add actions below —",
  className = "",
}: TRallyStringDisplayProps) {
  const tokens = notation ? parseTokensFromNotation(notation) : [];

  if (!notation || tokens.length === 0) {
    return (
      <div className={`rally-string-bar-display rally-string-bar-display--empty ${className}`.trim()}>
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className={`rally-string-bar-display ${className}`.trim()}>
      {tokens.map((token, index) => (
        <RallyTokenChip key={`${token.raw}-${index}`} token={token} />
      ))}
    </div>
  );
}
