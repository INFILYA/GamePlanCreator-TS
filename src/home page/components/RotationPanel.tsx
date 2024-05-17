import { useSelector } from "react-redux";
import SectionWrapper from "../../wrappers/SectionWrapper";
import { selectGuestTeam } from "../../states/slices/guestTeamSlice";
import { useEffect, useState } from "react";
import {
  selectIndexOfGuestTeamZones,
  setBackGuestTeamSelects,
} from "../../states/slices/indexOfGuestTeamZonesSlice";
import { correctZones } from "../../utilities/functions";
import { useAppDispatch } from "../../states/store";
import { rotateBackPositions, rotateForwardPositions, selectSoloGameStats } from "../../states/slices/soloGameStatsSlice";

type TRotationPanel = {
  team: boolean;
  opponentTeamName?: string;
};

export default function RotationPanel(arg: TRotationPanel) {
  const { opponentTeamName, team } = arg;
  const dispatch = useAppDispatch();
  const guestTeam = useSelector(selectGuestTeam);
  const [number, setNumber] = useState(1);
  const soloGame = useSelector(selectSoloGameStats);
  const guestTeamOptions = useSelector(selectIndexOfGuestTeamZones);
  function rotateFront() {
    const newOptions = [
      guestTeamOptions[3],
      guestTeamOptions[0],
      guestTeamOptions[1],
      guestTeamOptions[4],
      guestTeamOptions[5],
      guestTeamOptions[2],
    ];
    dispatch(setBackGuestTeamSelects(newOptions));
    dispatch(rotateForwardPositions())
    // guestTeamOptions[number];
  }
  function rotateBack() {
    const newOptions = [
      guestTeamOptions[1],
      guestTeamOptions[2],
      guestTeamOptions[5],
      guestTeamOptions[0],
      guestTeamOptions[3],
      guestTeamOptions[4],
    ];
    dispatch(setBackGuestTeamSelects(newOptions));
    dispatch(rotateBackPositions())
    // guestTeamOptions[number];
  }

  useEffect(() => {
    function rigthRotation() {
      const seTTer = guestTeamOptions.find((plaer) => plaer.position === "Setter");
      if (!seTTer) return;
      const indexOfSetter = guestTeamOptions.indexOf(seTTer);
      setNumber(correctZones(indexOfSetter));
      return;
    }
    rigthRotation();
  });

  // setBackGuestTeamSelects
  const zones = [4, 3, 2, 5, 6, 1];
  const nameOfTheTeam = team ? opponentTeamName : guestTeam[0]?.name;

  console.log(soloGame);
  // console.log(emptyPlayers);
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
      <button onClick={() => rotateFront()}>+</button>
      <button onClick={() => rotateBack()}>-</button>
    </SectionWrapper>
  );
}
