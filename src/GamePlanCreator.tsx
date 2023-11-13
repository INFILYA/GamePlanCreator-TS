import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getFromLocalStorage, later } from "./utilities/functions";
import { Route, Routes } from "react-router-dom";
import { selectChangeLanguage } from "./states/slices/changeLanguageSlice";
import { useAppDispatch } from "./states/store";
import { selectIsShowedTutorial, setisShowedTutorial } from "./states/slices/isShowedTutorialSlice";
import { Header } from "./header/Header";
import { Tutorial } from "./Tutorial";
import { Auth } from "./header/components/Auth";
import { collection, getDocs } from "firebase/firestore";
import { dataBase } from "./config/firebase";
import { setUserVersion } from "./states/slices/userVersionSlice";
import { TPlayer, TTeam } from "./types/types";
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

export default function GamePlanCreator() {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const changeLanguage = useSelector(selectChangeLanguage);
  const isShowedTutorial = useSelector(selectIsShowedTutorial);
  const userVersion: number = getFromLocalStorage("currentUserVersion") || 0;

  useEffect(() => {
    async function checkVersionOfData() {
      try {
        setIsLoading(true);
        await later(250000);
        const data = await getDocs(collection(dataBase, "dataVersion"));
        const adminVersion = data.docs[0].data().currentVersion;
        dispatch(setUserVersion(adminVersion));
        if (adminVersion === userVersion) {
          dispatch(setAllPlayers(getFromLocalStorage("players")));
          dispatch(setAllTeams(getFromLocalStorage("teams")));
          console.log(`Versions of DATA are equal ${userVersion} = ${adminVersion}`);
          return;
        }
        if (adminVersion !== userVersion) {
          dispatch(setisShowedTutorial(false));
          localStorage.setItem("isShowedTutorial", JSON.stringify(false));
          localStorage.setItem("currentUserVersion", JSON.stringify(adminVersion));
          getTeams();
          getPlayers();
          console.log(`Versions of DATA are not equal ${userVersion} != ${adminVersion}`);
          return;
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
    async function getPlayers() {
      try {
        const data = await getDocs(collection(dataBase, "players"));
        const players = data.docs.map((doc) => ({ ...doc.data() })) as unknown as TPlayer[];
        dispatch(setAllPlayers(players));
      } catch (error) {
        console.error(error);
      }
    }
    async function getTeams() {
      try {
        const data = await getDocs(collection(dataBase, "teams"));
        const teams = data.docs.map((doc) => ({ ...doc.data() })) as unknown as TTeam[];
        dispatch(setAllTeams(teams));
      } catch (error) {
        console.error(error);
      }
    }
    checkVersionOfData();
  }, [dispatch, userVersion]);

  const TUTORIAL = !changeLanguage ? UKRTUTORIAL : ENGTUTORIAL;
  return (
    <>
      <Header />
      <main>
        {isLoading ? (
          <>
            <div className="loading-logo-wrapper">
              {/* <div className="backGround-wrapper">
                <div className="backGround"></div>
              </div> */}
              <div className="logo-wrapper">
                {/* <img src="/photos/ball.png" alt="" className="back-photo" /> */}
                <MyLogo />
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
            </Routes>
          </>
        )}
      </main>
    </>
  );
}
