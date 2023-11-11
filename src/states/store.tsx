import listOfTeamsReducer from "./slices/listOfTeamsSlice";
import listOfPlayersReducer from "./slices/listOfPlayersSlice";
import { configureStore } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import changeLanguageReducer from "./slices/changeLanguageSlice";
import homeTeamReducer from "./slices/homeTeamSlice";
import guestTeamReducer from "./slices/guestTeamSlice";
import guestPlayersReducer from "./slices/guestPlayersSlice";
import homePlayersReducer from "./slices/homePlayersSlice";
import isShowedTutorialReducer from "./slices/isShowedTutorialSlice";
import userVersionReducer from "./slices/userVersionSlice";
import playerInfoReducer from "./slices/playerInfoSlice";
import indexOfHomeTeamZonesReducer from "./slices/indexOfHomeTeamZonesSlice";
import indexOfGuestTeamZonesReducer from "./slices/indexOfGuestTeamZonesSlice";

export const store = configureStore({
  reducer: {
    listOfTeams: listOfTeamsReducer, //+
    listOfPlayers: listOfPlayersReducer, //+
    homeTeam: homeTeamReducer, //+
    guestTeam: guestTeamReducer, //+
    guestPlayers: guestPlayersReducer, //+
    homePlayers: homePlayersReducer, //+
    indexOfHomeTeamZones: indexOfHomeTeamZonesReducer, //+
    indexOfGuestTeamZones: indexOfGuestTeamZonesReducer, //+
    playerInfo: playerInfoReducer, //+
    changeLanguage: changeLanguageReducer, //+
    isShowedTutorial: isShowedTutorialReducer, //+
    userVersion: userVersionReducer, //+
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch: () => AppDispatch = useDispatch;
