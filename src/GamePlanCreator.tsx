import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Route, Routes } from "react-router-dom";
import { selectChangeLanguage } from "./states/slices/changeLanguageSlice";
import { useAppDispatch } from "./states/store";
import { selectIsShowedTutorial } from "./states/slices/isShowedTutorialSlice";
import { Header } from "./header/Header";
import { Tutorial } from "./Tutorial";
import { Auth } from "./header/components/Auth";
import { auth, gamesRef, playersRef, teamsRef } from "./config/firebase";
import { TGameStats, TPlayer, TTeam } from "./types/types";
import { setAllPlayers } from "./states/slices/listOfPlayersSlice";
import { setAllTeams } from "./states/slices/listOfTeamsSlice";
import { HomePage } from "./home page/HomePage";
import { Ratings } from "./ratings/Ratings";
import { UKRTUTORIAL } from "./utilities/ukrTutorial";
import { ENGTUTORIAL } from "./utilities/engTutorial";
import Directions from "./directions-section/Directions";
import MyLogo from "./myLogo/MyLogo";
import GamesStatistic from "./loadStatistic/GamesStatistic";
import { setAllGameStats } from "./states/slices/gamesStatsSlice";
import { useAuthState } from "react-firebase-hooks/auth";
import { onValue } from "firebase/database";
import { later } from "./utilities/functions";

export default function GamePlanCreator() {
  const dispatch = useAppDispatch();
  const [isRegistratedUser] = useAuthState(auth);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const changeLanguage = useSelector(selectChangeLanguage);
  const isShowedTutorial = useSelector(selectIsShowedTutorial);

  useEffect(() => {
    async function appIsReady() {
      try {
        setIsLoading(true);
        getTeams();
        getPlayers();
        getGames();
        await later(2500);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
    async function getTeams() {
      try {
        if (isRegistratedUser) {
          onValue(teamsRef(""), (snapshot) => {
            const data = snapshot.val();
            const teams = Object.values(data) as TTeam[];
            dispatch(setAllTeams(teams));
            console.log("teams");
          });
        }
      } catch (error) {
        console.error(error);
      }
    }
    async function getPlayers() {
      try {
        if (isRegistratedUser) {
          onValue(playersRef(""), (snapshot) => {
            const data = snapshot.val();
            const players = Object.values(data) as TPlayer[];
            dispatch(setAllPlayers(players));
            console.log("players");
          });
        }
      } catch (error) {
        console.error(error);
      }
    }
    async function getGames() {
      try {
        if (isRegistratedUser) {
          onValue(gamesRef(""), (snapshot) => {
            const data = snapshot.val();
            if (!data) return;
            const games = Object.values(data) as TGameStats[];
            dispatch(setAllGameStats(games));
            console.log("games");
          });
        }
      } catch (error) {
        console.error(error);
      }
    }
    appIsReady();
  }, [dispatch, isRegistratedUser]);
  const TUTORIAL = !changeLanguage ? UKRTUTORIAL : ENGTUTORIAL;
  return (
    <>
      <Header />
      <main>
        {isLoading ? (
          <>
            <div className="loading-logo-wrapper">
              <div className="logo-wrapper">
                <img src="/photos/gameball.png" alt="" className="back-photo" />
                <MyLogo />
                <div className="backGround"></div>
              </div>
            </div>
          </>
        ) : (
          <>
            {!isShowedTutorial && (
              <div className="textForTutorial">
                {TUTORIAL.map((card, index) => (
                  <Tutorial text={card} key={index} />
                ))}
              </div>
            )}
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/Auth" element={<Auth />} />
              <Route path="/Ratings" element={<Ratings />} />
              <Route path="/Directions" element={<Directions />} />
              <Route path="/GamesStatistic" element={<GamesStatistic />} />
            </Routes>
          </>
        )}
      </main>
    </>
  );
}
