import { useEffect } from "react";
import { useSelector } from "react-redux";
import { RegularButton } from "../../css/Button.styled";
import {
  GRADES_BY_SKILL,
  SKILL_LABELS,
  getSkillsForPlayer,
  getRallyOutcomeHints,
  isSkillVisible,
} from "../../notation/grades";
import type { TScoutSkill } from "../../notation/types";
import { useAppDispatch } from "../../states/store";
import {
  appendRallyToken,
  selectRallyActionLocked,
  selectRallyOver,
  selectRallySelectedSkill,
  selectRallyTokens,
  selectPassRecorded,
  selectServeRecorded,
  selectRallySkill,
  markRallyOver,
  backFromRallyOver,
  undoLastRallyToken,
} from "../../states/slices/rallyNotationSlice";
import { selectIndexOfGuestTeamZones } from "../../states/slices/indexOfGuestTeamZonesSlice";

type TRallyScoutControlsProps = {
  weServe: boolean;
  selectedPlayerNumber: string | null;
  onRallyEnd: (weWon: boolean) => void;
  endOfTheSet: boolean;
};

export function RallyScoutControls({
  weServe,
  selectedPlayerNumber,
  onRallyEnd,
  endOfTheSet,
}: TRallyScoutControlsProps) {
  const dispatch = useAppDispatch();
  const selectedSkill = useSelector(selectRallySelectedSkill);
  const serveRecorded = useSelector(selectServeRecorded);
  const rallyOver = useSelector(selectRallyOver);
  const rallyLocked = useSelector(selectRallyActionLocked);
  const rallyTokens = useSelector(selectRallyTokens);
  const passRecorded = useSelector(selectPassRecorded);
  const guestTeamOptions = useSelector(selectIndexOfGuestTeamZones);

  const selectedPlayer = selectedPlayerNumber
    ? guestTeamOptions.find(
        (p) => String(p.number) === String(selectedPlayerNumber)
      )
    : null;

  const isLibero = selectedPlayer?.position === "LIB";
  const boardPosition = selectedPlayer?.boardPosition ?? 0;
  const inServePhase = weServe && !serveRecorded;
  const inReceivePhase = !weServe && !passRecorded;
  const skills = selectedPlayer
    ? getSkillsForPlayer(
        !!isLibero,
        weServe,
        serveRecorded,
        boardPosition,
        passRecorded
      )
    : [];
  const visibleSkills = skills.filter((skill) =>
    isSkillVisible(skill, weServe, serveRecorded, passRecorded)
  );

  useEffect(() => {
    if (inServePhase && selectedPlayerNumber) {
      dispatch(selectRallySkill("S"));
    }
  }, [inServePhase, selectedPlayerNumber, dispatch]);

  useEffect(() => {
    if (inReceivePhase && selectedPlayerNumber) {
      dispatch(selectRallySkill("R"));
    }
  }, [inReceivePhase, selectedPlayerNumber, dispatch]);

  useEffect(() => {
    if (selectedSkill && !visibleSkills.includes(selectedSkill)) {
      dispatch(selectRallySkill(null));
    }
  }, [selectedSkill, visibleSkills, dispatch]);

  function onSkillClick(skill: TScoutSkill) {
    dispatch(selectRallySkill(skill));
  }

  function onGradeClick(grade: string) {
    if (!selectedPlayerNumber || !selectedSkill) return;
    dispatch(
      appendRallyToken({
        playerNumber: selectedPlayerNumber,
        skill: selectedSkill,
        grade,
      })
    );
  }

  const gradeOptions = selectedSkill
    ? GRADES_BY_SKILL[selectedSkill as TScoutSkill]
    : [];

  const showRallyOverButton =
    !rallyOver && (rallyLocked || !weServe || rallyTokens.length > 0);

  const { hideWeWon, hideWeLost } = getRallyOutcomeHints(rallyTokens);

  if (endOfTheSet) {
    return (
      <div className="rally-scout-controls">
        <p className="rally-scout-prompt rally-scout-prompt--terminal">
          Set complete — save the set to finish
        </p>
      </div>
    );
  }

  return (
    <div className="rally-scout-controls">
      {inServePhase && (
        <p className="rally-scout-prompt rally-scout-prompt--serve">
          Tap the server and grade the serve
        </p>
      )}

      {inReceivePhase && (
        <p className="rally-scout-prompt rally-scout-prompt--serve">
          Tap a player and grade the pass
        </p>
      )}

      {rallyLocked && !rallyOver && (
        <p className="rally-scout-prompt rally-scout-prompt--terminal">
          Point-ending play recorded — tap Rally is over
        </p>
      )}

      {!rallyOver && !rallyLocked && !inServePhase && !inReceivePhase && !selectedPlayerNumber && (
        <p className="rally-scout-prompt">Tap a player on the court first</p>
      )}

      {!rallyOver && !rallyLocked && selectedPlayerNumber && visibleSkills.length > 0 && (
        <>
          <div className="rally-scout-row">
            <span className="rally-scout-row-label">Skill</span>
            <div className="rally-scout-buttons">
              {visibleSkills.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  className={`rally-scout-skill-btn${
                    selectedSkill === skill ? " rally-scout-skill-btn--active" : ""
                  }${skill === "S" ? " rally-scout-skill-btn--serve" : ""}${
                    skill === "R" ? " rally-scout-skill-btn--pass" : ""
                  }`}
                  onClick={() => onSkillClick(skill)}
                >
                  {SKILL_LABELS[skill]}
                </button>
              ))}
            </div>
          </div>

          {selectedSkill && (
            <div className="rally-scout-row">
              <span className="rally-scout-row-label">Grade</span>
              <div className="rally-scout-buttons">
                {gradeOptions.map((opt) => (
                    <button
                      key={opt.grade}
                      type="button"
                      className="rally-scout-grade-btn"
                      style={{
                        backgroundColor: opt.color,
                      }}
                      onClick={() => onGradeClick(opt.grade)}
                    >
                      {opt.label}
                    </button>
                  ))}
              </div>
            </div>
          )}
        </>
      )}

      {showRallyOverButton && (
        <div className="rally-scout-outcome-row">
          <RegularButton
            type="button"
            onClick={() => dispatch(markRallyOver())}
            disabled={endOfTheSet}
            $color="#0057b8"
            $background="#ffd700"
          >
            Rally is over
          </RegularButton>
        </div>
      )}

      {rallyOver && (
        <div className="rally-scout-outcome-row">
          <RegularButton
            type="button"
            onClick={() => dispatch(backFromRallyOver())}
            $color="white"
            $background="#64748b"
          >
            ← Back
          </RegularButton>
          {!hideWeWon && (
            <RegularButton
              type="button"
              onClick={() => onRallyEnd(true)}
              disabled={endOfTheSet}
              $color="white"
              $background="#16a34a"
            >
              We won
            </RegularButton>
          )}
          {!hideWeLost && (
            <RegularButton
              type="button"
              onClick={() => onRallyEnd(false)}
              disabled={endOfTheSet}
              $color="white"
              $background="#dc2626"
            >
              We lost
            </RegularButton>
          )}
        </div>
      )}

      {rallyTokens.length > 0 && (
        <div className="rally-scout-undo-row">
          <RegularButton
            type="button"
            onClick={() => dispatch(undoLastRallyToken())}
            disabled={endOfTheSet}
            $color="white"
            $background="#64748b"
          >
            ⟲ Undo last
          </RegularButton>
        </div>
      )}
    </div>
  );
}
