import { useSelector } from "react-redux";
import { auth, gamesRef, playersRef, teamsRef } from "../config/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { NavLink } from "react-router-dom";
import SectionWrapper from "../wrappers/SectionWrapper";
import { useAppDispatch } from "../states/store";
import { selectListOfTeams } from "../states/slices/listOfTeamsSlice";
import {
  checkNumbers,
  correctPositions,
  correctZones,
  emptyPlayers,
  firstLetterCapital,
  gerPercentOfAttack,
  getAttackEfficency,
  getPlusMinusAttack,
  isBoardFull,
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
import { selectGamesStats } from "../states/slices/gamesStatsSlice";
import { set, update } from "firebase/database";
import RotationPanel from "./components/RotationPanel";

export function HomePage() {
  const dispatch = useAppDispatch();
  const [isRegistratedUser] = useAuthState(auth);
  const listOfTeams = useSelector(selectListOfTeams);
  const listOfPlayers = useSelector(selectListOfPlayers);
  const homeTeam = useSelector(selectHomeTeam);
  const guestTeam = useSelector(selectGuestTeam);
  const playerInfo = useSelector(selectPlayerInfo);
  const guestTeamOptions = useSelector(selectIndexOfGuestTeamZones);
  const homeTeamOptions = useSelector(selectIndexOfHomeTeamZones);
  const soloGameStats = useSelector(selectSoloGameStats);
  const [showSquads, setShowSquads] = useState(true);
  const [opponentTeamName, setOpponentTeamName] = useState("");
  const [setNumber, setSetNumber] = useState("");
  const gamesStats = useSelector(selectGamesStats);

  const showGuestTeam = guestTeam.length !== 0;
  const showHomeTeam = homeTeam.length !== 0;
  // прибрати після / !!!!!
  // прибрати після / !!!!!

  function resetTheBoardForGuestTeam() {
    dispatch(setGuestPlayers([]));
    dispatch(setGuestTeam(""));
    dispatch(setBackGuestTeamSelects(emptyPlayers));
    dispatch(setInfoOfPlayer(null));
    dispatch(resetGameStats());
    setOpponentTeamName("");
    setSetNumber("");
    setShowSquads(true);
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

  function calculateForTeamData<T extends TTeam | TPlayer>(obj: T) {
    const team = { ...guestTeam[0] };
    for (const key in team) {
      if (
        key === "id" ||
        key === "startingSquad" ||
        key === "name" ||
        key === "logo" ||
        key === "age" ||
        key === "height"
      ) {
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
    // download solo game statisic
    const matchInfo = `${guestTeam[0].id} - ${opponentTeamName}; ${currentDate()}`;
    const setStat = { [setNumber]: soloGameStats };
    const choosenGame = gamesStats.find((game) => game[matchInfo]);
    if (!choosenGame) {
      // console.log({ [matchInfo]: [setStat] });
      await set(gamesRef(matchInfo), { [matchInfo]: [setStat] });
    } else {
      const isSetExist = choosenGame[matchInfo].some((sets) => Object.keys(sets)[0] === setNumber);
      if (isSetExist) {
        alert("Set already exist");
        return;
      } else {
        await update(gamesRef(matchInfo), {
          [matchInfo]: [...choosenGame[matchInfo], setStat],
        });
      }
    }
    // Refresh StartingSix players
    async function setPlayersToData(player: TPlayer) {
      // console.log(player);
      await set(playersRef(player.name), player);
    }
    const names = guestTeamOptions.map((player) => player.name);
    const updatedStartingSix = listOfPlayers.filter(
      (player) => player.name === names[names.indexOf(player.name)]
    );
    updatedStartingSix.forEach((player) => {
      setPlayersToData(player);
    });
    // // Refresh SubstitutionPlayers players
    const benchNames = homeTeamOptions.map((player) => player.name);
    const updatedSubstitutionPlayers = listOfPlayers.filter(
      (player) => player.name === benchNames[benchNames.indexOf(player.name)]
    );
    updatedSubstitutionPlayers.forEach((player) => {
      setPlayersToData(player);
    });
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
    // console.log(guestTeam[0]);
    await set(teamsRef(guestTeam[0].name), guestTeam[0]);
    resetTheBoardForGuestTeam();
    setShowSquads(true);
    dispatch(setInfoOfPlayer(null));
  }

  const hideSquads = () => {
    setShowSquads(!showSquads);
    if (playerInfo !== null) {
      dispatch(setInfoOfPlayer(null));
    }
  };

  const playerInfoWindow = playerInfo && showSquads;
  const saveDataIcon = !opponentTeamName || !setNumber;
  return (
    <article className="main-content-wrapper">
      {showGuestTeam && showSquads && <Squads team="rival" />}
      {!showSquads && <RotationPanel team={false} />}
      <SectionWrapper
        className="playground-section"
        backGround={!playerInfoWindow && <img src="/photos/playarea.jpg" alt="" />}
      >
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
                  {isBoardFull(guestTeamOptions) && (
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
                          <input
                            onChange={(e) =>
                              setOpponentTeamName(firstLetterCapital(e.target.value))
                            }
                            value={opponentTeamName}
                            placeholder="Choose team name"
                          />
                          <select onChange={(e) => setSetNumber(e.target.value)} value={setNumber}>
                            <option value="">Choose set</option>
                            <option value="Set 1">Set 1</option>
                            <option value="Set 2">Set 2</option>
                            <option value="Set 3">Set 3</option>
                          </select>
                        </>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div></div>
              )}
              {showHomeTeam ? (
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
              ) : (
                <div></div>
              )}
            </div>
            <div className="row-zones-wrapper">
              {guestTeamOptions.slice(0, 3).map((option, index) =>
                checkNumbers(option.boardPosition) ? (
                  <IconOfPlayer
                    setShowSquads={setShowSquads}
                    showSquads={showSquads}
                    player={option}
                    soloGameStats={soloGameStats}
                    startingSix={guestTeamOptions}
                    type="rival"
                    key={index}
                  />
                ) : (
                  <div className="zone-names-wrapper" key={"_" + index}>
                    P{correctZones(index)}
                  </div>
                )
              )}
              {homeTeamOptions
                .slice(0, 3)
                .map((option, index) =>
                  checkNumbers(option.boardPosition) ? (
                    <IconOfPlayer
                      showSquads={showSquads}
                      player={option}
                      soloGameStats={soloGameStats}
                      startingSix={homeTeamOptions}
                      type="my"
                      key={index}
                      setShowSquads={setShowSquads}
                    />
                  ) : (
                    <div className="nameOfZone-field-wrapper" key={"x" + index}></div>
                  )
                )}
              {guestTeamOptions.slice(3, 6).map((option, index) =>
                checkNumbers(option.boardPosition) ? (
                  <IconOfPlayer
                    setShowSquads={setShowSquads}
                    showSquads={showSquads}
                    player={option}
                    soloGameStats={soloGameStats}
                    startingSix={guestTeamOptions}
                    type="rival"
                    key={index}
                  />
                ) : (
                  <div className="zone-names-wrapper" key={"_" + index}>
                    P{correctZones(index + 3)}
                  </div>
                )
              )}
              {homeTeamOptions
                .slice(3, 6)
                .map((option, index) =>
                  checkNumbers(option.boardPosition) ? (
                    <IconOfPlayer
                      showSquads={showSquads}
                      player={option}
                      soloGameStats={soloGameStats}
                      startingSix={homeTeamOptions}
                      type="my"
                      key={index}
                      setShowSquads={setShowSquads}
                    />
                  ) : (
                    <div className="nameOfZone-field-wrapper" key={"x" + index}></div>
                  )
                )}
            </div>
            <div className="button-save-wrapper">
              {isBoardFull(guestTeamOptions) && (
                <>
                  {!showSquads && !saveDataIcon && (
                    <RegularButton type="submit" $color="black" $background="#ffd700">
                      Save Data
                    </RegularButton>
                  )}
                </>
              )}
            </div>
            {isBoardFull(homeTeamOptions) && isRegistratedUser && (
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
      </SectionWrapper>
      {showGuestTeam &&
        showSquads &&
        (showHomeTeam ? (
          <Squads team="my" />
        ) : (
          <SectionWrapper className="teamsquad-section">
            {guestTeam.length !== 0 && (
              <select className="chooseHomeTeam" onChange={handleSetMyTeam}>
                <option value="Choose home team">Choose team</option>
                {listOfTeams.map((team) => (
                  <option key={team.id} value={team.name}>
                    {team.name}
                  </option>
                ))}
              </select>
            )}
          </SectionWrapper>
        ))}
      {!showSquads && <RotationPanel opponentTeamName={opponentTeamName} team={true} />}
    </article>
  );
}
