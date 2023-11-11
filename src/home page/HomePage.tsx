import { useSelector } from "react-redux";
import { doc, setDoc } from "firebase/firestore";
import { auth, dataBase } from "../config/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { selectUserVersion, setUserVersion } from "../states/slices/userVersionSlice";
import { NavLink } from "react-router-dom";
import SectionWrapper from "../wrappers/SectionWrapper";
import { useAppDispatch } from "../states/store";
import { selectListOfTeams } from "../states/slices/listOfTeamsSlice";
import { correctPositions, emptyPlayers } from "../utilities/functions";
import { TTeam } from "../types/types";
import { ChangeEvent } from "react";
import { selectHomeTeam, setHomeTeam } from "../states/slices/homeTeamSlice";
import { setHomePlayers } from "../states/slices/homePlayersSlice";
import { selectGuestTeam, setGuestTeam } from "../states/slices/guestTeamSlice";
import { IconOfPlayer } from "./components/IconOfPlayers";
import { Squads } from "./components/Squads";
import { ChooseGuestTeam } from "./components/ChooseGuestTeam";
import { setGuestPlayers } from "../states/slices/guestPlayersSlice";
import { selectPlayerInfo, setInfoOfPlayer } from "../states/slices/playerInfoSlice";
import { PersonalInformationOfPlayer } from "../personalInfo/PersonalInformationOfPlayer";
import {
  rotateBackHomeTeam,
  rotateForwardHomeTeam,
  selectIndexOfHomeTeamZones,
  setBackHomeTeamSelects,
} from "../states/slices/indexOfHomeTeamZonesSlice";
import {
  selectIndexOfGuestTeamZones,
  setBackGuestTeamSelects,
} from "../states/slices/indexOfGuestTeamZonesSlice";
import { selectListOfPlayers } from "../states/slices/listOfPlayersSlice";
import { RegularButton } from "../css/Button.styled";

export function HomePage() {
  const dispatch = useAppDispatch();
  const [isRegistratedUser] = useAuthState(auth);
  const listOfTeams = useSelector(selectListOfTeams);
  const listOfPlayers = useSelector(selectListOfPlayers);
  const userVersion = useSelector(selectUserVersion);
  const homeTeam = useSelector(selectHomeTeam);
  const guestTeam = useSelector(selectGuestTeam);
  const playerInfo = useSelector(selectPlayerInfo);
  const guestTeamOptions = useSelector(selectIndexOfGuestTeamZones);
  const homeTeamOptions = useSelector(selectIndexOfHomeTeamZones);
  const showGuestTeam = guestTeam.length !== 0;
  const showHomeTeam = homeTeam.length !== 0;
  const admin = isRegistratedUser?.uid === "wilxducX3TUUNOuv56GfqWpjMJD2";

  function checkNumbers(element: number): boolean {
    return typeof element !== "number";
  }
  function resetTheBoardForGuestTeam() {
    dispatch(setGuestPlayers([]));
    dispatch(setGuestTeam(""));
    dispatch(setBackGuestTeamSelects(emptyPlayers));
    dispatch(setInfoOfPlayer(null));
    resetTheBoardForHomeTeam();
  }
  function resetTheBoardForHomeTeam() {
    dispatch(setHomePlayers([]));
    dispatch(setHomeTeam(""));
    dispatch(setBackHomeTeamSelects(emptyPlayers));
    dispatch(setInfoOfPlayer(null));
  }

  function handleSetMyTeam(event: ChangeEvent<HTMLSelectElement>) {
    const name = event.target.value;
    const homeTeamPlayers = listOfPlayers.filter((player) => player.team === name);
    dispatch(setHomePlayers(homeTeamPlayers));
    dispatch(setHomeTeam(name));
  }
  async function saveStartingSix() {
    await saveTeam({
      ...guestTeam[0],
      startingSquad: guestTeamOptions.map((player) => player.name),
    });
    try {
      const docVersionRef = doc(dataBase, "versionChecker", "currentVersion");
      await setDoc(docVersionRef, { currentVersion: userVersion + 1 });
      const adminVersion = userVersion + 1;
      dispatch(setUserVersion(adminVersion));
    } catch (error) {
      console.error(error);
    }
  }
  const saveTeam = async (team: TTeam) => {
    try {
      const docRef = doc(dataBase, "teams", team.id);
      await setDoc(docRef, team);
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <article className="main-content-wrapper">
      {showGuestTeam && <Squads team="rival" />}
      <SectionWrapper
        className="playground-section"
        backGround={!playerInfo && <img src="/photos/playarea.jpg" alt="" />}
        content={
          <>
            {!showGuestTeam && <ChooseGuestTeam />}
            {playerInfo && <PersonalInformationOfPlayer link="page1" />}
            {!playerInfo && showGuestTeam && (
              <div className="rotation-field-wrapper">
                <div className="reset-button-wrapper">
                  {showGuestTeam ? (
                    <RegularButton
                      onClick={resetTheBoardForGuestTeam}
                      type="button"
                      $color="orangered"
                      $background="white"
                    >
                      Reset
                    </RegularButton>
                  ) : (
                    <div></div>
                  )}
                  {showHomeTeam && (
                    <RegularButton
                      onClick={resetTheBoardForHomeTeam}
                      type="button"
                      $color="orangered"
                      $background="white"
                    >
                      Reset
                    </RegularButton>
                  )}
                </div>
                <div className="row-zones-wrapper">
                  {guestTeamOptions
                    .slice(0, 3)
                    .map((option, index) =>
                      checkNumbers(option.boardPosition) ? (
                        <IconOfPlayer
                          player={option}
                          startingSix={guestTeamOptions}
                          type="rival"
                          key={index}
                        />
                      ) : (
                        <div className="zone-names-wrapper" key={"_" + index}></div>
                      )
                    )}
                </div>
                <div className="empty-guest-front-row-zones-wrapper">
                  <div className="zone-names-wrapper">P4</div>
                  <div className="zone-names-wrapper">P3</div>
                  <div className="zone-names-wrapper">P2</div>
                </div>
                <div className="my-row-zones-wrapper">
                  {homeTeamOptions
                    .slice(0, 3)
                    .map((option, index) =>
                      checkNumbers(option.boardPosition) ? (
                        <IconOfPlayer
                          player={option}
                          startingSix={homeTeamOptions}
                          type="my"
                          key={index}
                        />
                      ) : (
                        <div className="nameOfZone-field-wrapper" key={"x" + index}></div>
                      )
                    )}
                </div>
                <div className="row-zones-wrapper">
                  {guestTeamOptions
                    .slice(3, 6)
                    .map((option, index) =>
                      checkNumbers(option.boardPosition) ? (
                        <IconOfPlayer
                          player={option}
                          startingSix={guestTeamOptions}
                          type="rival"
                          key={index}
                        />
                      ) : (
                        <div className="zone-names-wrapper" key={"_" + index}></div>
                      )
                    )}
                </div>
                <div className="empty-guest-back-row-zones-wrapper">
                  <div className="zone-names-wrapper">P5</div>
                  <div className="zone-names-wrapper">P6</div>
                  <div className="zone-names-wrapper">P1</div>
                </div>
                <div className="my-row-zones-wrapper">
                  {homeTeamOptions
                    .slice(3, 6)
                    .map((option, index) =>
                      checkNumbers(option.boardPosition) ? (
                        <IconOfPlayer
                          player={option}
                          startingSix={homeTeamOptions}
                          type="my"
                          key={index}
                        />
                      ) : (
                        <div className="nameOfZone-field-wrapper" key={"x" + index}></div>
                      )
                    )}
                </div>
                <div className="button-save-wrapper">
                  {guestTeamOptions.every((option) => checkNumbers(option.boardPosition)) &&
                    admin && (
                      <RegularButton
                        onClick={saveStartingSix}
                        type="button"
                        $color="black"
                        $background="#ffd700"
                      >
                        Save starting six
                      </RegularButton>
                    )}
                </div>
                <div className="plusMinus">
                  {homeTeamOptions.every((option) => checkNumbers(option.boardPosition)) &&
                    isRegistratedUser && (
                      <>
                        <RegularButton
                          onClick={() => dispatch(rotateForwardHomeTeam())}
                          $color="black"
                          $background="#ffd700"
                        >
                          -
                        </RegularButton>
                        {homeTeamOptions.map((player, index) =>
                          typeof player !== "number" && player && player.position === "Setter" ? (
                            <span key={player.name}>P{correctPositions(index) + 1}</span>
                          ) : null
                        )}
                        <RegularButton
                          onClick={() => dispatch(rotateBackHomeTeam())}
                          $color="black"
                          $background="#ffd700"
                        >
                          +
                        </RegularButton>
                      </>
                    )}
                </div>

                {showGuestTeam && (
                  <div className="showRatings">
                    <NavLink to={"/Ratings"}>
                      <RegularButton onClick={() => dispatch(setInfoOfPlayer(null))} type="button">
                        Ratings
                      </RegularButton>
                    </NavLink>
                    <NavLink to={"/Distribution"}>
                      <RegularButton onClick={() => dispatch(setInfoOfPlayer(null))} type="button">
                        Distribution
                      </RegularButton>
                    </NavLink>
                    <NavLink to={"/SendStatistic"}>
                      <RegularButton onClick={() => dispatch(setInfoOfPlayer(null))} type="button">
                        Send Statistic
                      </RegularButton>
                    </NavLink>
                  </div>
                )}
              </div>
            )}
          </>
        }
      />
      {showGuestTeam &&
        (showHomeTeam ? (
          <Squads team="my" />
        ) : (
          <SectionWrapper
            className="teamsquad-section"
            content={
              guestTeam.length !== 0 && (
                <select className="chooseHomeTeam" onChange={handleSetMyTeam}>
                  <option value="Choose home team">Choose team</option>
                  {listOfTeams.map((team) => (
                    <option key={team.id} value={team.name}>
                      {team.name}
                    </option>
                  ))}
                </select>
              )
            }
          />
        ))}
    </article>
  );
}
