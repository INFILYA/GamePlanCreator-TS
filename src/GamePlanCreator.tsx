import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Route, Routes } from "react-router-dom";
import { selectChangeLanguage } from "./states/slices/changeLanguageSlice";
import { useAppDispatch } from "./states/store";
import { selectIsShowedTutorial } from "./states/slices/isShowedTutorialSlice";
import { Header } from "./header/Header";
import { Tutorial } from "./Tutorial";
import { Auth } from "./header/components/Auth";
// import { collection, getDocs } from "firebase/firestore";
import { auth, gamesRef, playersRef, teamsRef } from "./config/firebase";
import { TGameStats, TPlayer, TTeam } from "./types/types";
import { setAllPlayers } from "./states/slices/listOfPlayersSlice";
import { setAllTeams } from "./states/slices/listOfTeamsSlice";
import { HomePage } from "./home page/HomePage";
import { Ratings } from "./ratings/Ratings";
import { UKRTUTORIAL } from "./utilities/ukrTutorial";
import { ENGTUTORIAL } from "./utilities/engTutorial";
import Distribution from "./distribution/Distribution";
import Directions from "./directions-section/Directions";
import SendStatistic from "./loadStatistic/SendStatistic";
import MyLogo from "./myLogo/MyLogo";
import GamesStatistic from "./loadStatistic/GamesStatistic";
import { setAllGameStats } from "./states/slices/gamesStatsSlice";
import { useAuthState } from "react-firebase-hooks/auth";
import { onValue } from "firebase/database";

export default function GamePlanCreator() {
  const dispatch = useAppDispatch();
  const [isRegistratedUser] = useAuthState(auth);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const changeLanguage = useSelector(selectChangeLanguage);
  const isShowedTutorial = useSelector(selectIsShowedTutorial);

  useEffect(() => {
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
            const games = Object.values(data) as TGameStats[];
            dispatch(setAllGameStats(games));
            console.log("games");
          });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(!isLoading);
      }
    }
    getTeams();
    getPlayers();
    getGames();
    // async function checkVersionOfData() {
    //   try {
    //     setIsLoading(true);
    //     await later(2500);
    //     const data = await getDocs(collection(dataBase, "dataVersion"));
    //     const adminVersion = data.docs[0].data().currentVersion;
    //     dispatch(setUserVersion(adminVersion));
    //     if (adminVersion === userVersion) {
    //       dispatch(setAllPlayers(getFromLocalStorage("players")));
    //       dispatch(setAllTeams(getFromLocalStorage("teams")));
    //       console.log(`Versions of DATA are equal ${userVersion} = ${adminVersion}`);
    //       return;
    //     }
    //     if (adminVersion !== userVersion) {
    //       dispatch(setisShowedTutorial(false));
    //       localStorage.setItem("isShowedTutorial", JSON.stringify(false));
    //       localStorage.setItem("currentUserVersion", JSON.stringify(adminVersion));
    //       getTeams();
    //       getPlayers();
    //       console.log(`Versions of DATA are not equal ${userVersion} != ${adminVersion}`);
    //       return;
    //     }
    //   } catch (error) {
    //     console.error(error);
    //   } finally {
    //     setIsLoading(false);
    //   }
    // }
    // async function getPlayers() {
    //   try {
    //     const data = await getDocs(collection(dataBase, "players"));
    //     const players = data.docs.map((doc) => ({ ...doc.data() })) as unknown as TPlayer[];
    //     dispatch(setAllPlayers(players));
    //   } catch (error) {
    //     console.error(error);
    //   }
    // }
    // async function getTeams() {
    //   try {
    //     const data = await getDocs(collection(dataBase, "teams"));
    //     const teams = data.docs.map((doc) => ({ ...doc.data() })) as unknown as TTeam[];
    //     dispatch(setAllTeams(teams));
    //   } catch (error) {
    //     console.error(error);
    //   }
    // }
    // async function loadGames() {
    //   try {
    //     dispatch(fetchGamesStats());
    //   } catch (e) {
    //     console.error(e);
    //     alert("something go wrong");
    //   }
    // }
    // loadGames();
    // checkVersionOfData();
  }, [dispatch, isRegistratedUser, isLoading]);

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
              <Route path="/Distribution" element={<Distribution />} />
              <Route path="/Directions" element={<Directions />} />
              <Route path="/SendStatistic" element={<SendStatistic />} />
              <Route path="/GamesStatistic" element={<GamesStatistic />} />
            </Routes>
          </>
        )}
      </main>
    </>
  );
}
