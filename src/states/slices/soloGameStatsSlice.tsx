import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { TPlayer } from "../../types/types";
import { RootState } from "../store";

type TSoloGameStats = {
  soloGameStats: TPlayer[];
};
const initialState: TSoloGameStats = { soloGameStats: [] };

export const soloGameStatsSlice = createSlice({
  name: "soloGameStats",
  initialState,
  reducers: {
    setSoloGameStats: (state, action: PayloadAction<TPlayer>) => {
      if (state.soloGameStats.find((player) => player.name === action.payload.name)) {
        state.soloGameStats = state.soloGameStats.map((player) =>
          player.name === action.payload.name ? action.payload : player
        );
      } else state.soloGameStats = [...state.soloGameStats, action.payload];
    },
  },
});
export const { setSoloGameStats } = soloGameStatsSlice.actions;
export default soloGameStatsSlice.reducer;
export const selectSoloGameStats = (state: RootState) => state.soloGameStats.soloGameStats;
