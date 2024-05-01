import { useSelector } from "react-redux";
import { doc, setDoc } from "firebase/firestore";
import { auth, dataBase } from "../config/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { selectUserVersion, setUserVersion } from "../states/slices/userVersionSlice";
import { NavLink } from "react-router-dom";
import SectionWrapper from "../wrappers/SectionWrapper";
import { useAppDispatch } from "../states/store";
import { selectListOfTeams, setAllTeams } from "../states/slices/listOfTeamsSlice";
import {
  correctPositions,
  emptyPlayers,
  gerPercentOfAttack,
  getAttackEfficency,
  getPlusMinusAttack,
  listOfOpponents,
} from "../utilities/functions";
import { TPlayer, TTeam } from "../types/types";
import { ChangeEvent, FormEvent, useState } from "react";
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
import { resetGameStats, selectSoloGameStats } from "../states/slices/soloGameStatsSlice";
import { currentDate } from "../utilities/currentDate";
import { setAddSoloGameStat } from "../states/slices/gamesStatsSlice";

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
  const soloGameStats = useSelector(selectSoloGameStats);
  const [showSquads, setShowSquads] = useState(true);
  const [opponentTeamName, setOpponentTeamName] = useState("");
  const [set, setSet] = useState("");

  const showGuestTeam = guestTeam.length !== 0;
  const showHomeTeam = homeTeam.length !== 0;
  // прибрати після / !!!!!
  const admin = isRegistratedUser?.uid === "wilxducX3TUUNOuv56GfqWpjMJD2";
  // прибрати після / !!!!!
  function checkNumbers(element: number): boolean {
    return typeof element !== "number";
  }
  function resetTheBoardForGuestTeam() {
    dispatch(setGuestPlayers([]));
    dispatch(setGuestTeam(""));
    dispatch(setBackGuestTeamSelects(emptyPlayers));
    dispatch(setInfoOfPlayer(null));
    dispatch(resetGameStats());
    setOpponentTeamName("");
    setSet("");
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

  async function updateVersion() {
    try {
      const docVersionRef = doc(dataBase, "dataVersion", "currentVersion");
      await setDoc(docVersionRef, { currentVersion: userVersion + 1 });
      const adminVersion = userVersion + 1;
      dispatch(setUserVersion(adminVersion));
    } catch (error) {
      console.error(error);
    }
  }

  function calculateForTeamData<T extends TTeam | TPlayer>(obj: T) {
    const team = { ...guestTeam[0] };
    for (const key in team) {
      if (key === "id" || key === "startingSquad" || key === "name" || key === "logo") {
        continue;
      }
      (team[key as keyof TTeam] as number) += obj[key as keyof T] as number;
    }
    team.percentOfAttack = gerPercentOfAttack(team); //встановлюємо процент зйому
    team.plusMinusOnAttack = getPlusMinusAttack(team); //встановлюємо + - в атаці
    team.efficencyAttack = getAttackEfficency(team); // встановлюємо ефективність подачі
    guestTeam[0] = team;
  }

  async function saveSpikeData(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Refresh StartingSix players
    const names = guestTeamOptions.map((player) => player.name);
    const updatedStartingSix = listOfPlayers.filter(
      (player) => player.name === names[names.indexOf(player.name)]
    );
    updatedStartingSix.forEach((player) => {
      setDoc(doc(dataBase, "players", player.name), player);
    });
    // Refresh SubstitutionPlayers players
    const benchNames = homeTeamOptions.map((player) => player.name);
    const updatedSubstitutionPlayers = listOfPlayers.filter(
      (player) => player.name === benchNames[benchNames.indexOf(player.name)]
    );
    updatedSubstitutionPlayers.forEach((player) => {
      setDoc(doc(dataBase, "players", player.name), player);
    });
    // download solo game statisic
    const matchInfo = `${guestTeam[0].id} - ${opponentTeamName}; ${set}; ${currentDate()}`;
    const gameStats = doc(dataBase, "gameStats", matchInfo);
    await setDoc(gameStats, { [matchInfo]: [...soloGameStats] });
    dispatch(setAddSoloGameStat({ [matchInfo]: [...soloGameStats] }));
    //add solo game stats
    const loosePoints = soloGameStats.reduce((acc, val) => (acc += val.loosePoints), 0);
    const winPoints = soloGameStats.reduce((acc, val) => (acc += val.winPoints), 0);
    const leftInTheGame = soloGameStats.reduce((acc, val) => (acc += val.leftInGame), 0);
    const attacksInBlock = soloGameStats.reduce((acc, val) => (acc += val.attacksInBlock), 0);
    const sumOfAllPlayersSoloGamesStats = {
      loosePoints: loosePoints,
      winPoints: winPoints,
      leftInGame: leftInTheGame,
      attacksInBlock: attacksInBlock,
    };
    calculateForTeamData(sumOfAllPlayersSoloGamesStats as TPlayer);
    const updatedListOfTeams = listOfTeams.map((team) =>
      team.id === guestTeam[0].id ? guestTeam[0] : team
    );
    dispatch(setAllTeams(updatedListOfTeams));
    // download team data
    const Team = doc(dataBase, "teams", guestTeam[0].id);
    await setDoc(Team, guestTeam[0]);
    await updateVersion();
    resetTheBoardForGuestTeam();
    setShowSquads(true);
    dispatch(setInfoOfPlayer(null));
  }

  async function saveStartingSix() {
    await saveTeam({
      ...guestTeam[0],
      startingSquad: guestTeamOptions.map((player) => player.name),
    });
    updateVersion();
  }
  const saveTeam = async (team: TTeam) => {
    try {
      const docRef = doc(dataBase, "teams", team.id);
      await setDoc(docRef, team);
    } catch (error) {
      console.error(error);
    }
  };

  const hideSquads = () => {
    setShowSquads(!showSquads);
    if (playerInfo !== null) {
      dispatch(setInfoOfPlayer(null));
    }
  };
  const playerInfoWindow = playerInfo && showSquads;
  console.log(set);
  return (
    <article className="main-content-wrapper">
      {showGuestTeam && showSquads && <Squads team="rival" />}
      {!showSquads && <div>xxx</div>}
      <SectionWrapper
        className="playground-section"
        backGround={!playerInfoWindow && <img src="/photos/playarea.jpg" alt="" />}
        content={
          <>
            {!showGuestTeam && <ChooseGuestTeam />}
            {playerInfoWindow && <PersonalInformationOfPlayer link="page1" />}
            {!playerInfoWindow && showGuestTeam && (
              <form className="rotation-field-wrapper" onSubmit={saveSpikeData}>
                <div className="reset-button-wrapper">
                  {showGuestTeam ? (
                    <>
                      <div>
                        <RegularButton
                          onClick={resetTheBoardForGuestTeam}
                          type="button"
                          $color="orangered"
                          $background="white"
                        >
                          Reset
                        </RegularButton>
                      </div>
                      <div className="match-number-wrapper">
                        <div>
                          <RegularButton
                            onClick={hideSquads}
                            type="button"
                            $color="orangered"
                            $background="white"
                          >
                            Statistic mode
                          </RegularButton>
                        </div>
                        {!showSquads && (
                          <>
                            <select
                              onChange={(e) => setOpponentTeamName(e.target.value)}
                              value={opponentTeamName}
                            >
                              {listOfOpponents.map((team) => (
                                <option key={team} value={team}>
                                  {team}
                                </option>
                              ))}
                            </select>
                            <select onChange={(e) => setSet(e.target.value)} value={set}>
                              <option value="">Choose set</option>
                              <option value="Set 1">Set 1</option>
                              <option value="Set 2">Set 2</option>
                              <option value="Set 3">Set 3</option>
                            </select>
                          </>
                        )}
                      </div>
                    </>
                  ) : (
                    <div></div>
                  )}
                  {showHomeTeam && (
                    <div>
                      <RegularButton
                        onClick={resetTheBoardForHomeTeam}
                        type="button"
                        $color="orangered"
                        $background="white"
                      >
                        Reset
                      </RegularButton>
                    </div>
                  )}
                </div>
                <div className="row-zones-wrapper">
                  {guestTeamOptions
                    .slice(0, 3)
                    .map((option, index) =>
                      checkNumbers(option.boardPosition) ? (
                        <IconOfPlayer
                          showSquads={showSquads}
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
                          showSquads={showSquads}
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
                          showSquads={showSquads}
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
                          showSquads={showSquads}
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
                  {guestTeamOptions.every((option) => checkNumbers(option.boardPosition)) && (
                    <>
                      {!showSquads && (
                        <RegularButton type="submit" $color="black" $background="#ffd700">
                          Save Data
                        </RegularButton>
                      )}
                      {admin && (
                        <RegularButton
                          onClick={saveStartingSix}
                          type="button"
                          $color="black"
                          $background="#ffd700"
                        >
                          Save starting six
                        </RegularButton>
                      )}
                    </>
                  )}
                </div>
                {homeTeamOptions.every((option) => checkNumbers(option.boardPosition)) &&
                  isRegistratedUser && (
                    <div className="plusMinus">
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
                    </div>
                  )}
                {showGuestTeam && showSquads && (
                  <div className="showRatings">
                    <NavLink to={"/Ratings"}>
                      <RegularButton
                        onClick={() => dispatch(setInfoOfPlayer(null))}
                        type="button"
                        $color="#0057b8"
                        $background="#ffd700"
                      >
                        Ratings
                      </RegularButton>
                    </NavLink>
                    <NavLink to={"/Distribution"}>
                      <RegularButton
                        onClick={() => dispatch(setInfoOfPlayer(null))}
                        type="button"
                        $color="#0057b8"
                        $background="#ffd700"
                      >
                        Distribution
                      </RegularButton>
                    </NavLink>
                    {/* <NavLink to={"/SendStatistic"}>
                      <RegularButton
                        onClick={() => dispatch(setInfoOfPlayer(null))}
                        type="button"
                        $color="#0057b8"
                        $background="#ffd700"
                      >
                        Send Data
                      </RegularButton>
                    </NavLink> */}
                    <NavLink to={"/GamesStatistic"}>
                      <RegularButton
                        onClick={() => dispatch(setInfoOfPlayer(null))}
                        type="button"
                        $color="#0057b8"
                        $background="#ffd700"
                      >
                        Games Statistic
                      </RegularButton>
                    </NavLink>
                  </div>
                )}
              </form>
            )}
          </>
        }
      />
      {showGuestTeam &&
        showSquads &&
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
      {!showSquads && <div>xxx</div>}
    </article>
  );
}
