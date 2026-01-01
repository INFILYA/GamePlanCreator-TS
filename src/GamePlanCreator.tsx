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

        // Очищаем localStorage если данные пустые или некорректные
        if (
          cachedTeams &&
          (!Array.isArray(cachedTeams) || cachedTeams.length === 0)
        ) {
          localStorage.removeItem("teams");
        }
        if (
          cachedPlayers &&
          (!Array.isArray(cachedPlayers) || cachedPlayers.length === 0)
        ) {
          localStorage.removeItem("players");
        }
        if (
          cachedGames &&
          (!Array.isArray(cachedGames) || cachedGames.length === 0)
        ) {
          localStorage.removeItem("gamesStats");
        }

        // Загружаем из Firebase (это имеет приоритет)
        getTeams();
        getPlayers();
        getGames();
        await later(2500);
      } catch (_error) {
        // Обработка ошибок
      } finally {
        setIsLoading(false);
      }
    }

    function getTeams() {
      try {
        const teamsReference = teamsRef("");
        onValue(
          teamsReference,
          (snapshot) => {
            const data = snapshot.val();

            if (data && typeof data === "object") {
              const teams = Object.values(data) as TTeam[];
              if (teams.length > 0) {
                dispatch(setAllTeams(teams));
              } else {
                // Если Firebase вернул пустой массив, пробуем кэш
                const cachedTeams = getFromLocalStorage("teams");
                if (
                  cachedTeams &&
                  Array.isArray(cachedTeams) &&
                  cachedTeams.length > 0
                ) {
                  dispatch(setAllTeams(cachedTeams));
                }
              }
            } else {
              // Если данных нет в Firebase, пробуем кэш
              const cachedTeams = getFromLocalStorage("teams");
              if (
                cachedTeams &&
                Array.isArray(cachedTeams) &&
                cachedTeams.length > 0
              ) {
                dispatch(setAllTeams(cachedTeams));
              }
            }
          },
          (_error: any) => {
            // Если ошибка доступа, используем кэш
            const cachedTeams = getFromLocalStorage("teams");
            if (
              cachedTeams &&
              Array.isArray(cachedTeams) &&
              cachedTeams.length > 0
            ) {
              dispatch(setAllTeams(cachedTeams));
            } else {
              // Очищаем состояние если нет данных нигде
              dispatch(setAllTeams([]));
            }
          }
        );
      } catch (_error: any) {
        // Обработка ошибок
      }
    }

    function getPlayers() {
      try {
        onValue(
          playersRef(""),
          (snapshot) => {
            const data = snapshot.val();
            if (data) {
              const players = Object.values(data) as TPlayer[];
              dispatch(setAllPlayers(players));
            }
          },
          (_error) => {
            // Если ошибка доступа, используем кэш
            const cachedPlayers = getFromLocalStorage("players");
            if (
              cachedPlayers &&
              Array.isArray(cachedPlayers) &&
              cachedPlayers.length > 0
            ) {
              dispatch(setAllPlayers(cachedPlayers));
            }
          }
        );
      } catch (_error: any) {
        // Обработка ошибок
      }
    }

    function getGames() {
      try {
        onValue(
          gamesRef(""),
          (snapshot) => {
            const data = snapshot.val();
            if (data) {
              const games = Object.values(data) as TGameStats[];
              dispatch(setAllGameStats(games));
            }
          },
          (_error) => {
            // Если ошибка доступа, используем кэш
            const cachedGames = getFromLocalStorage("gamesStats");
            if (
              cachedGames &&
              Array.isArray(cachedGames) &&
              cachedGames.length > 0
            ) {
              dispatch(setAllGameStats(cachedGames));
            }
          }
        );
      } catch (_error: any) {
        // Обработка ошибок
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
