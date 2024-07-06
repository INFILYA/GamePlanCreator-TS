import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";

type TPlayerInfo = {
  detailedStatsOfPlayer: string;
};
const initialState: TPlayerInfo = { detailedStatsOfPlayer: "" };

export const detailedStatsOfPlayerSlice = createSlice({
  name: "detailedStatsOfPlayer",
  initialState,
  reducers: {
    setDetailedStatsOfPlayer: (state, action: PayloadAction<string>) => {
      state.detailedStatsOfPlayer = action.payload;
      localStorage.setItem("detailedStatsOfPlayer", JSON.stringify(action.payload));
    },
  },
});
export const { setDetailedStatsOfPlayer } = detailedStatsOfPlayerSlice.actions;
export default detailedStatsOfPlayerSlice.reducer;
export const selectDetailedStatsOfPlayer = (state: RootState) =>
  state.detailedStatsOfPlayer.detailedStatsOfPlayer;
