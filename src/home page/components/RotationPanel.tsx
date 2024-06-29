import { useSelector } from "react-redux";
import SectionWrapper from "../../wrappers/SectionWrapper";
import { selectGuestTeam } from "../../states/slices/guestTeamSlice";
import { useEffect, useState } from "react";
import { selectIndexOfGuestTeamZones } from "../../states/slices/indexOfGuestTeamZonesSlice";
import { correctZones } from "../../utilities/functions";
import { resetGameStats, selectSoloRallyStats } from "../../states/slices/soloRallyStatsSlice";
import { useAppDispatch } from "../../states/store";
import { TGameLogStats } from "../../types/types";

type TRotationPanel = {
  team: boolean;
  score: number;
  currentScore: string;
  setScore(arg: number): void;
  setNextRotation(arg: boolean): void;
  opponentTeamName?: string;
  gameLog: TGameLogStats;
  setGameLog(arg: TGameLogStats): void;
};

export default function RotationPanel(arg: TRotationPanel) {
  const {
    opponentTeamName,
    team,
    score,
    currentScore,
    setScore,
    setNextRotation,
    gameLog,
    setGameLog,
  } = arg;
  const dispatch = useAppDispatch();
  const guestTeam = useSelector(selectGuestTeam);
  const SoloRallyStats = useSelector(selectSoloRallyStats);

  const [number, setNumber] = useState(1);
  const guestTeamOptions = useSelector(selectIndexOfGuestTeamZones);
  function addScore() {
    setScore(score + 1);
    if (SoloRallyStats.length > 0) {
      setGameLog([...gameLog, { score: currentScore, stats: SoloRallyStats }]);
    }
    dispatch(resetGameStats());
    setNextRotation(true);
  }

  useEffect(() => {
    function rigthRotation() {
      const seTTer = guestTeamOptions.find((plaer) => plaer.position === "SET");
      if (!seTTer) return;
      const indexOfSetter = guestTeamOptions.indexOf(seTTer);
      setNumber(correctZones(indexOfSetter));
      return;
    }
    if (!team) {
      rigthRotation();
    }
  });
  const zones = [4, 3, 2, 5, 6, 1];
  const nameOfTheTeam = team ? opponentTeamName : guestTeam[0]?.name;

  return (
    <SectionWrapper className="rotation-panel-wrapper">
      <div className="rotation-buttons-wrapper">
        <button style={{ borderRadius: "50%" }} onClick={() => addScore()}>
          +
        </button>
      </div>
      <div style={{ fontSize: "8vw" }}>{score}</div>
      <div className="team-name-wrapper">
        <h1 className="team-name">{nameOfTheTeam}</h1>
      </div>
      <div className="rotation-panel-content">
        {zones.map((zone) => (
          <button
            key={zone}
            value={zone}
            style={{ backgroundColor: number === zone ? "orangered" : "" }}
            onClick={() => setNumber(zone)}
          >
            {zone}
          </button>
        ))}
      </div>
    </SectionWrapper>
  );
}
