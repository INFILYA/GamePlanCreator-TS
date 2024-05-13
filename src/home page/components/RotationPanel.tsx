import { useSelector } from "react-redux";
import SectionWrapper from "../../wrappers/SectionWrapper";
import { selectGuestTeam } from "../../states/slices/guestTeamSlice";
import { useState } from "react";

type TRotationPanel = {
  opponentTeamName?: string;
};

export default function RotationPanel(arg: TRotationPanel) {
  const { opponentTeamName } = arg;
  const guestTeam = useSelector(selectGuestTeam);
  const [number, setNumber] = useState(1);

  const zones = [4, 3, 2, 5, 6, 1];
  const nameOfTheTeam = opponentTeamName || guestTeam[0].name;
  return (
    <SectionWrapper className="rotation-panel-wrapper">
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
