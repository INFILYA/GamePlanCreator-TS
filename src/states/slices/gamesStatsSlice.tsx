import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { TPlayer } from "../../types/types";
import { RootState } from "../store";

type TListOfTeams = {
  gamesStats: TPlayer[][];
};
const initialState: TListOfTeams = { gamesStats: [] };

export const gamesStatsSlice = createSlice({
  name: "gamesStats",
  initialState,
  reducers: {
    setAllGameStats: (state, action: PayloadAction<TPlayer[][]>) => {
      state.gamesStats = action.payload;
      localStorage.setItem("gamesStats", JSON.stringify(action.payload));
    },
    setAddSoloGameStat: (state, action: PayloadAction<TPlayer[]>) => {
      state.gamesStats = [...state.gamesStats, action.payload];
    },
  },
});
export const { setAllGameStats, setAddSoloGameStat } = gamesStatsSlice.actions;
export default gamesStatsSlice.reducer;
export const selectGamesStats = (state: RootState) => state.gamesStats.gamesStats;
