import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { TPlayer } from "../../types/types";
import { RootState } from "../store";

type TPlayerInfo = {
  playerInfo: TPlayer | null;
};
const initialState: TPlayerInfo = { playerInfo: null };

export const playerInfoSlice = createSlice({
  name: "playerInfo",
  initialState,
  reducers: {
    setInfoOfPlayer: (state, action: PayloadAction<TPlayer | null>) => {
      state.playerInfo = action.payload;
      localStorage.setItem("playerInfo", JSON.stringify(action.payload));
    },
  },
});
export const { setInfoOfPlayer } = playerInfoSlice.actions;
export default playerInfoSlice.reducer;
export const selectPlayerInfo = (state: RootState) => state.playerInfo.playerInfo;
