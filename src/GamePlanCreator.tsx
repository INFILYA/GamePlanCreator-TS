import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Route, Routes, useNavigate, useLocation } from "react-router-dom";
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
import { later, getFromLocalStorage } from "./utilities/functions";

export default function GamePlanCreator() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isRegistratedUser] = useAuthState(auth);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const changeLanguage = useSelector(selectChangeLanguage);
  const isShowedTutorial = useSelector(selectIsShowedTutorial);

  // Перенаправляем на главную, если пользователь залогинен и находится на /Auth
  useEffect(() => {
    if (isRegistratedUser && location.pathname === "/Auth") {
      console.log("User logged in on Auth page, redirecting to home");
      navigate("/", { replace: true });
    }
  }, [isRegistratedUser, location.pathname, navigate]);

  useEffect(() => {
    async function appIsReady() {
      try {
        setIsLoading(true);
        
        // Проверяем localStorage и очищаем если данные некорректные
        const cachedTeams = getFromLocalStorage("teams");
        const cachedPlayers = getFromLocalStorage("players");
        const cachedGames = getFromLocalStorage("gamesStats");
        
        console.log("🔍 Checking localStorage...");
        console.log("Cached teams:", cachedTeams);
        console.log("Cached players:", cachedPlayers);
        console.log("Cached games:", cachedGames);
        
        // Очищаем localStorage если данные пустые или некорректные
        if (cachedTeams && (!Array.isArray(cachedTeams) || cachedTeams.length === 0)) {
          console.log("🧹 Clearing invalid teams cache");
          localStorage.removeItem("teams");
        }
        if (cachedPlayers && (!Array.isArray(cachedPlayers) || cachedPlayers.length === 0)) {
          console.log("🧹 Clearing invalid players cache");
          localStorage.removeItem("players");
        }
        if (cachedGames && (!Array.isArray(cachedGames) || cachedGames.length === 0)) {
          console.log("🧹 Clearing invalid games cache");
          localStorage.removeItem("gamesStats");
        }
        
        // Загружаем из localStorage только если данные валидные (но Firebase имеет приоритет)
        const validCachedTeams = cachedTeams && Array.isArray(cachedTeams) && cachedTeams.length > 0;
        const validCachedPlayers = cachedPlayers && Array.isArray(cachedPlayers) && cachedPlayers.length > 0;
        const validCachedGames = cachedGames && Array.isArray(cachedGames) && cachedGames.length > 0;
        
        if (validCachedTeams) {
          console.log("📦 Valid teams in cache:", cachedTeams.length, "- will be used as fallback");
        }
        if (validCachedPlayers) {
          console.log("📦 Valid players in cache:", cachedPlayers.length, "- will be used as fallback");
        }
        if (validCachedGames) {
          console.log("📦 Valid games in cache:", cachedGames.length, "- will be used as fallback");
        }
        
        // Загружаем из Firebase (это имеет приоритет)
        console.log("🔥 Starting Firebase load...");
        getTeams();
        getPlayers();
        getGames();
        await later(2500);
      } catch (error) {
        console.error("Error in appIsReady:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    function getTeams() {
      try {
        const teamsReference = teamsRef("");
        console.log("🔄 Setting up teams listener...");
        console.log("Teams ref path:", teamsReference.toString());
        
        onValue(teamsReference, (snapshot) => {
          console.log("📥 Teams snapshot received");
          const data = snapshot.val();
          console.log("Teams data type:", typeof data, "is null:", data === null, "is undefined:", data === undefined);
          
          if (data && typeof data === 'object') {
            const teams = Object.values(data) as TTeam[];
            console.log("✅ teams loaded from Firebase:", teams.length);
            if (teams.length > 0) {
              console.log("✅ First team example:", teams[0]);
              dispatch(setAllTeams(teams));
            } else {
              console.warn("⚠️ Teams array is empty");
              // Если Firebase вернул пустой массив, пробуем кэш
              const cachedTeams = getFromLocalStorage("teams");
              if (cachedTeams && Array.isArray(cachedTeams) && cachedTeams.length > 0) {
                console.log("📦 Using cached teams (Firebase returned empty)");
                dispatch(setAllTeams(cachedTeams));
              }
            }
          } else {
            console.warn("⚠️ No teams data in Firebase (data is null/undefined/not object)");
            // Если данных нет в Firebase, пробуем кэш
            const cachedTeams = getFromLocalStorage("teams");
            if (cachedTeams && Array.isArray(cachedTeams) && cachedTeams.length > 0) {
              console.log("📦 Using cached teams (no Firebase data)");
              dispatch(setAllTeams(cachedTeams));
            } else {
              console.warn("⚠️ No teams available in cache either");
            }
          }
        }, (error: any) => {
          console.error("❌ Error loading teams:", error);
          console.error("Error code:", error?.code);
          console.error("Error message:", error?.message);
          // Если ошибка доступа, используем кэш
          const cachedTeams = getFromLocalStorage("teams");
          console.log("Cached teams:", cachedTeams);
          if (cachedTeams && Array.isArray(cachedTeams) && cachedTeams.length > 0) {
            console.log("📦 Using cached teams due to Firebase error");
            dispatch(setAllTeams(cachedTeams));
          } else {
            console.warn("⚠️ No cached teams available");
            // Очищаем состояние если нет данных нигде
            dispatch(setAllTeams([]));
          }
        });
      } catch (error: any) {
        console.error("❌ Error setting up teams listener:", error);
        console.error("Error details:", error);
      }
    }
    
    function getPlayers() {
      try {
        console.log("🔄 Setting up players listener...");
        onValue(playersRef(""), (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const players = Object.values(data) as TPlayer[];
            dispatch(setAllPlayers(players));
            console.log("✅ players loaded:", players.length);
          } else {
            console.warn("⚠️ No players data in Firebase");
          }
        }, (error) => {
          console.error("❌ Error loading players:", error);
          // Если ошибка доступа, используем кэш
          const cachedPlayers = getFromLocalStorage("players");
          if (cachedPlayers && Array.isArray(cachedPlayers) && cachedPlayers.length > 0) {
            console.log("📦 Using cached players due to error");
            dispatch(setAllPlayers(cachedPlayers));
          }
        });
      } catch (error: any) {
        console.error("❌ Error setting up players listener:", error);
      }
    }
    
    function getGames() {
      try {
        console.log("🔄 Setting up games listener...");
        onValue(gamesRef(""), (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const games = Object.values(data) as TGameStats[];
            dispatch(setAllGameStats(games));
            console.log("✅ games loaded:", games.length);
          } else {
            console.warn("⚠️ No games data in Firebase");
          }
        }, (error) => {
          console.error("❌ Error loading games:", error);
          // Если ошибка доступа, используем кэш
          const cachedGames = getFromLocalStorage("gamesStats");
          if (cachedGames && Array.isArray(cachedGames) && cachedGames.length > 0) {
            console.log("📦 Using cached games due to error");
            dispatch(setAllGameStats(cachedGames));
          }
        });
      } catch (error: any) {
        console.error("❌ Error setting up games listener:", error);
      }
    }
    
    appIsReady();
  }, [dispatch]);

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
