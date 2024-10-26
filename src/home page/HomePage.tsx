import { useSelector } from "react-redux";
import { gamesRef, playersRef, teamsRef } from "../config/firebase";
import { NavLink } from "react-router-dom";
import SectionWrapper from "../wrappers/SectionWrapper";
import { useAppDispatch } from "../states/store";
import { selectListOfTeams } from "../states/slices/listOfTeamsSlice";
import {
  calculateTotalofActions,
  checkNumbers,
  correctZones,
  emptyPlayers,
  firstLetterCapital,
  isBoardFull,
  listOfOpponents16U,
  listOfOpponents18U,
} from "../utilities/functions";
import { TGameLogStats, TPlayer, TTeam } from "../types/types";
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
  rotateBackGuestTeam,
  rotateForwardGuestTeam,
  selectIndexOfGuestTeamZones,
  setBackGuestTeamSelects,
} from "../states/slices/indexOfGuestTeamZonesSlice";
import { selectListOfPlayers } from "../states/slices/listOfPlayersSlice";
import { RegularButton } from "../css/Button.styled";
import {
  resetRallyStats,
  rotateBackPositions,
  rotateForwardPositions,
} from "../states/slices/soloRallyStatsSlice";
import { currentDate } from "../utilities/currentDate";
import { selectGamesStats } from "../states/slices/gamesStatsSlice";
import { set, update } from "firebase/database";
import RotationPanel from "./components/RotationPanel";

export function HomePage() {
  const dispatch = useAppDispatch();
  const listOfTeams = useSelector(selectListOfTeams);
  const listOfPlayers = useSelector(selectListOfPlayers);
  const homeTeam = useSelector(selectHomeTeam);
  const guestTeam = useSelector(selectGuestTeam);
  const playerInfo = useSelector(selectPlayerInfo);
  const guestTeamOptions = useSelector(selectIndexOfGuestTeamZones);
  const homeTeamOptions = useSelector(selectIndexOfHomeTeamZones);
  const [showSquads, setShowSquads] = useState(true);
  const [nextRotation, setNextRotation] = useState(true);
  const [weServe, setWeServe] = useState(false);
  const [gameLog, setGameLog] = useState<TGameLogStats>([]);
  const [statsForTeam, setstatsForTeam] = useState<TPlayer[][]>([]);
  const [opponentTeamName, setOpponentTeamName] = useState("");
  const [setNumber, setSetNumber] = useState("");
  const [myScore, setMyScore] = useState(0);
  const [rivalScore, setRivalScore] = useState(0);
  const [previousMyScore, setPreviousMyScore] = useState(0);
  const [previousRivalScore, setPreviousRivalScore] = useState(0);
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
    dispatch(resetRallyStats());
    setOpponentTeamName("");
    setSetNumber("");
    setShowSquads(true);
    resetTheBoardForHomeTeam();
    setGameLog([]);
    setstatsForTeam([]);
    setMyScore(0);
    setRivalScore(0);
    setWeServe(false);
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
        key === "boardPosition" ||
        key === "name" ||
        key === "logo" ||
        key === "age" ||
        key === "height" ||
        key === "startingSquad"
      ) {
        continue;
      }
      const realDa = obj[key as keyof T] as number;
      (team[key as keyof TTeam] as number) += realDa ? realDa : 0;
    }
    return team;
  }

  async function saveSpikeData(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // download solo game statisic
    const matchInfo = `${currentDate()}; ${guestTeam[0].id} - ${opponentTeamName}`;
    if (!gameLog) return;
    const setStat = { [setNumber]: gameLog };
    const choosenGame = gamesStats.find((game) => game[matchInfo]);
    if (!choosenGame) {
      await set(gamesRef(matchInfo), { [matchInfo]: setStat });
    } else {
      if (setNumber in choosenGame[matchInfo]) {
        alert("Set already exist");
        return;
      } else {
        await update(gamesRef(matchInfo), {
          [matchInfo]: { ...choosenGame[matchInfo], ...setStat },
        });
      }
    }
    // Here IS PROBLEM!!!
    // Refresh StartingSix players
    async function setPlayersToData(player: TPlayer) {
      await set(playersRef(player.name), player);
    }
    const updatedPlayers = listOfPlayers.filter((player) => player.team === guestTeam[0].name);
    updatedPlayers.forEach((player) => {
      setPlayersToData(player);
    });
    // //add solo game stats
    const newTeam = calculateForTeamData(calculateTotalofActions(statsForTeam.flat()) as TPlayer);
    await set(teamsRef(newTeam.name), newTeam);
    setstatsForTeam([]);
    resetTheBoardForGuestTeam();
    setShowSquads(true);
    dispatch(setInfoOfPlayer(null));
  }

  const hideSquads = () => {
    setShowSquads(!showSquads);
    dispatch(resetRallyStats());
    setNextRotation(true);
    if (playerInfo !== null) {
      dispatch(setInfoOfPlayer(null));
    }
  };

  function rotateFront() {
    dispatch(rotateForwardGuestTeam());
    dispatch(rotateForwardHomeTeam());
    dispatch(rotateForwardPositions());
    setNextRotation(true);
    dispatch(resetRallyStats());
  }
  function rotateBack() {
    dispatch(rotateBackGuestTeam());
    dispatch(rotateBackHomeTeam());
    dispatch(rotateBackPositions());
    dispatch(resetRallyStats());
    setNextRotation(true);
  }
  const currentScore = `${myScore} - ${rivalScore}`;
  const playerInfoWindow = playerInfo && showSquads;
  const saveDataIcon = !opponentTeamName || !setNumber;
  const tieBreak = setNumber === "Set 3 (short)" || setNumber === "Set 5 (short)";
  const tieBreakScore = myScore >= 15 || rivalScore >= 15;
  const normalSetScore = myScore >= 25 || rivalScore >= 25;
  const endOfTheSet = tieBreak
    ? (tieBreakScore && myScore - rivalScore === (+2 || -2)) ||
      (tieBreakScore && (myScore - rivalScore > 1 || rivalScore - myScore > 1))
    : (normalSetScore && myScore - rivalScore === (+2 || -2)) ||
      (normalSetScore && (myScore - rivalScore > 1 || rivalScore - myScore > 1));
  const saveButton = isBoardFull(guestTeamOptions) && !showSquads && !saveDataIcon && endOfTheSet;
  const zeroZero = myScore === 0 && rivalScore === 0;

  function getSetterPosition() {
    const seTTer = guestTeamOptions?.find((plaer) => plaer.position === "SET");
    if (!seTTer) return 0;
    return correctZones(guestTeamOptions.indexOf(seTTer));
  }

  /* Reset Stats  */

  // const resetplaers = () => {
  //   async function setPlayersToData(player: TPlayer) {
  //     await set(playersRef(player.name), player);
  //   }
  //   const updatedPlayers = listOfPlayers.filter((player) => player.team === guestTeam[0].name);
  //   function creeNew(player: TPlayer) {
  //     const newObj = {} as TPlayer;
  //     const soloGamePlayerStats = { ...player };
  //     for (const key in soloGamePlayerStats) {
  //       if (
  //         key === "blocks" ||
  //         key === "A-" ||
  //         key === "A=" ||
  //         key === "A+" ||
  //         key === "A++" ||
  //         key === "A!" ||
  //         key === "S++" ||
  //         key === "S=" ||
  //         key === "S!" ||
  //         key === "S+" ||
  //         key === "S-" ||
  //         key === "R++" ||
  //         key === "R=" ||
  //         key === "R!" ||
  //         key === "R+" ||
  //         key === "R-"
  //       ) {
  //         newObj[key] = 0;
  //       } else newObj[key] = soloGamePlayerStats[key as keyof TPlayer];
  //     }
  //     return newObj;
  //   }

  //   updatedPlayers.forEach((player) => {
  //     setPlayersToData(creeNew(player));
  //   });
  // };

  // const resetteam = () => {
  //   async function setTeamToData(Team: TTeam) {
  //     await set(teamsRef(Team.name), Team);
  //   }
  //   function creeNew(Team: TTeam) {
  //     const guestTeamNew = {} as TTeam;
  //     guestTeamNew["A++"] = 0;
  //     guestTeamNew["A+"] = 0;
  //     guestTeamNew["A="] = 0;
  //     guestTeamNew["A!"] = 0;
  //     guestTeamNew["A-"] = 0;
  //     guestTeamNew["S++"] = 0;
  //     guestTeamNew["S!"] = 0;
  //     guestTeamNew["S="] = 0;
  //     guestTeamNew["S-"] = 0;
  //     guestTeamNew["S+"] = 0;
  //     guestTeamNew["R++"] = 0;
  //     guestTeamNew["R!"] = 0;
  //     guestTeamNew["R="] = 0;
  //     guestTeamNew["R-"] = 0;
  //     guestTeamNew["R+"] = 0;
  //     guestTeamNew.blocks = 0;
  //     guestTeamNew.name = Team.name;
  //     guestTeamNew.logo = Team.logo;
  //     guestTeamNew.id = Team.id;
  //     guestTeamNew.startingSquad = Team.startingSquad;
  //     return guestTeamNew;
  //   }
  //   setTeamToData(creeNew(guestTeam[0]));
  // };
  // END HERE

  const listOfOpponents =
    guestTeam[0]?.name === "Warriors-18U" ? listOfOpponents18U : listOfOpponents16U;

  return (
    <article className="main-content-wrapper">
      {showGuestTeam && showSquads && <Squads team="rival" />}
      {!showSquads && (
        <RotationPanel
          rivalTeam={false}
          weServe={weServe}
          setWeServe={setWeServe}
          score={myScore}
          rivalScore={rivalScore}
          currentScore={currentScore}
          setScore={setMyScore}
          setNextRotation={setNextRotation}
          gameLog={gameLog}
          setGameLog={setGameLog}
          setstatsForTeam={setstatsForTeam}
          statsForTeam={statsForTeam}
          endOfTheSet={endOfTheSet}
          setPreviousScore={setPreviousMyScore}
          previousScore={previousMyScore}
        />
      )}
      <SectionWrapper
        className="playground-section"
        backGround={!playerInfoWindow && <img src="/photos/playarea.jpg" alt="" />}
      >
        {!showGuestTeam && <ChooseGuestTeam />}
        {playerInfoWindow && <PersonalInformationOfPlayer link="page1" />}
        {!playerInfoWindow && showGuestTeam && (
          <>
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
                            <select
                              onChange={(e) =>
                                setOpponentTeamName(firstLetterCapital(e.target.value))
                              }
                              value={opponentTeamName}
                            >
                              <option value="">Choose Opponent</option>
                              {listOfOpponents.map((opponent) => (
                                <option value={opponent} key={opponent}>
                                  {opponent}
                                </option>
                              ))}
                            </select>
                            <select
                              onChange={(e) => setSetNumber(e.target.value)}
                              value={setNumber}
                            >
                              <option value="">Choose set</option>
                              <option value="Set 1">Set 1</option>
                              <option value="Set 2">Set 2</option>
                              <option value="Set 3">Set 3</option>
                              <option value="Set 4">Set 4</option>
                              <option value="Set 5 (short)">Set 5 (short)</option>
                              <option value="Set 3 (short)">Set 3 (short)</option>
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
                    <div key={index}>
                      <IconOfPlayer
                        showSquads={showSquads}
                        player={option}
                        startingSix={guestTeamOptions}
                        nextRotation={nextRotation}
                        setNextRotation={setNextRotation}
                        type="rival"
                      />
                    </div>
                  ) : (
                    <div className="zone-names-wrapper" key={"_" + index}>
                      P{correctZones(index)}
                    </div>
                  )
                )}
                {homeTeamOptions.slice(0, 3).map((option, index) =>
                  checkNumbers(option.boardPosition) ? (
                    <div key={index}>
                      <IconOfPlayer
                        showSquads={showSquads}
                        player={option}
                        startingSix={homeTeamOptions}
                        nextRotation={nextRotation}
                        setNextRotation={setNextRotation}
                        type="my"
                      />
                    </div>
                  ) : (
                    <div className="nameOfZone-field-wrapper" key={"x" + index}></div>
                  )
                )}
                {guestTeamOptions.slice(3, 6).map((option, index) =>
                  checkNumbers(option.boardPosition) ? (
                    <div key={index}>
                      <IconOfPlayer
                        showSquads={showSquads}
                        player={option}
                        startingSix={guestTeamOptions}
                        nextRotation={nextRotation}
                        setNextRotation={setNextRotation}
                        type="rival"
                      />
                    </div>
                  ) : (
                    <div className="zone-names-wrapper" key={"_" + index}>
                      P{correctZones(index + 3)}
                    </div>
                  )
                )}
                {homeTeamOptions.slice(3, 6).map((option, index) =>
                  checkNumbers(option.boardPosition) ? (
                    <div key={index}>
                      <IconOfPlayer
                        showSquads={showSquads}
                        player={option}
                        startingSix={homeTeamOptions}
                        nextRotation={nextRotation}
                        setNextRotation={setNextRotation}
                        type="my"
                      />
                    </div>
                  ) : (
                    <div className="nameOfZone-field-wrapper" key={"x" + index}></div>
                  )
                )}
              </div>
              {/* Reset Stats  */}
              {/* <div>
                <button onClick={() => resetteam()}>team</button>
                <button onClick={() => resetplaers()}>plaers</button>
              </div> */}
              {/* HERE */}
              <div className="button-save-wrapper">
                {saveButton && (
                  <RegularButton type="submit" $color="black" $background="#ffd700">
                    Save Data
                  </RegularButton>
                )}
              </div>
              {showSquads &&
                zeroZero &&
                !opponentTeamName &&
                !setNumber &&
                isBoardFull(guestTeamOptions) && (
                  <div className="rotation-buttons-wrapper">
                    <button onClick={() => rotateFront()} disabled={endOfTheSet}>
                      +
                    </button>
                    <h1>P{getSetterPosition()}</h1>
                    <button
                      onClick={() => rotateBack()}
                      style={{ borderRadius: "0px 20px 20px 0px" }}
                    >
                      -
                    </button>
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
          </>
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
      {!showSquads && (
        <RotationPanel
          opponentTeamName={opponentTeamName}
          rivalTeam={true}
          weServe={!weServe}
          setWeServe={setWeServe}
          score={rivalScore}
          rivalScore={myScore}
          currentScore={currentScore}
          setScore={setRivalScore}
          setNextRotation={setNextRotation}
          gameLog={gameLog}
          setGameLog={setGameLog}
          setstatsForTeam={setstatsForTeam}
          statsForTeam={statsForTeam}
          endOfTheSet={endOfTheSet}
          setPreviousScore={setPreviousRivalScore}
          previousScore={previousRivalScore}
        />
      )}
    </article>
  );
}
