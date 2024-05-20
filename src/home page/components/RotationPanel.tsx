import { useSelector } from "react-redux";
import SectionWrapper from "../../wrappers/SectionWrapper";
import { selectGuestTeam } from "../../states/slices/guestTeamSlice";
import { useEffect, useState } from "react";
import {
  rotateBackGuestTeam,
  rotateForwardGuestTeam,
  selectIndexOfGuestTeamZones,
} from "../../states/slices/indexOfGuestTeamZonesSlice";
import { correctZones } from "../../utilities/functions";
import { useAppDispatch } from "../../states/store";
import {
  rotateBackPositions,
  rotateForwardPositions,
} from "../../states/slices/soloGameStatsSlice";

type TRotationPanel = {
  team: boolean;
  opponentTeamName?: string;
};

export default function RotationPanel(arg: TRotationPanel) {
  const { opponentTeamName, team } = arg;
  const dispatch = useAppDispatch();
  const guestTeam = useSelector(selectGuestTeam);
  const [number, setNumber] = useState(1);
  const guestTeamOptions = useSelector(selectIndexOfGuestTeamZones);
  function rotateFront() {
    dispatch(rotateForwardGuestTeam());
    dispatch(rotateForwardPositions());
  }
  function rotateBack() {
    dispatch(rotateBackGuestTeam());
    dispatch(rotateBackPositions());
  }

  useEffect(() => {
    function rigthRotation() {
      const seTTer = guestTeamOptions.find((plaer) => plaer.position === "Setter");
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
      {!team ? (
        <div className="rotation-buttons-wrapper">
          <button onClick={() => rotateFront()}>+</button>
          <button onClick={() => rotateBack()} style={{ borderRadius: "0px 20px 20px 0px" }}>
            -
          </button>
        </div>
      ) : (
        <div className="rotation-buttons-wrapper"></div>
      )}
    </SectionWrapper>
  );
}