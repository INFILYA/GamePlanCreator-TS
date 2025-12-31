import listOfTeamsReducer from "./slices/listOfTeamsSlice";
import listOfPlayersReducer from "./slices/listOfPlayersSlice";
import { configureStore } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import changeLanguageReducer from "./slices/changeLanguageSlice";
import guestTeamReducer from "./slices/guestTeamSlice";
import guestPlayersReducer from "./slices/guestPlayersSlice";
import isShowedTutorialReducer from "./slices/isShowedTutorialSlice";
import playerInfoReducer from "./slices/playerInfoSlice";
import indexOfGuestTeamZonesReducer from "./slices/indexOfGuestTeamZonesSlice";
import soloRallyStatsReducer from "./slices/soloRallyStatsSlice";
import gamesStatsReducer from "./slices/gamesStatsSlice";
import detailedStatsOfPlayerReducer from "./slices/detailedStatsOfPlayerSlice";

export const store = configureStore({
  reducer: {
    listOfTeams: listOfTeamsReducer, //+
    listOfPlayers: listOfPlayersReducer, //+
    guestTeam: guestTeamReducer, //+
    guestPlayers: guestPlayersReducer, //+
    indexOfGuestTeamZones: indexOfGuestTeamZonesReducer, //+
    playerInfo: playerInfoReducer, //+
    changeLanguage: changeLanguageReducer, //+
    isShowedTutorial: isShowedTutorialReducer, //+
    soloRallyStats: soloRallyStatsReducer,
    gamesStats: gamesStatsReducer,
    detailedStatsOfPlayer: detailedStatsOfPlayerReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch: () => AppDispatch = useDispatch;
