import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { TPlayer } from "../../types/types";

type THomePlayers = {
  homePlayers: TPlayer[];
};
const initialState: THomePlayers = {
  homePlayers: [],
};

export const homePlayersSlice = createSlice({
  name: "homePlayers",
  initialState,
  reducers: {
    setHomePlayers: (state, action: PayloadAction<TPlayer[]>) => {
      state.homePlayers = action.payload;
    },
    filterHomePlayers: (state, action: PayloadAction<string>) => {
      state.homePlayers = state.homePlayers.filter((player) => player.name !== action.payload);
    },
    pushFromHomeTeamBoard: (state, action: PayloadAction<TPlayer>) => {
      state.homePlayers = [...state.homePlayers, action.payload];
    },
  },
});
export const { setHomePlayers, filterHomePlayers, pushFromHomeTeamBoard } =
  homePlayersSlice.actions;
export default homePlayersSlice.reducer;
export const selectHomePlayers = (state: RootState) => state.homePlayers.homePlayers;
