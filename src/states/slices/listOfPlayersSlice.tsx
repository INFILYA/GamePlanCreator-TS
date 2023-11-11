import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { TPlayer } from "../../types/types";
import { RootState } from "../store";

type TListOfPlayers = {
  listOfPlayers: TPlayer[];
};
const initialState: TListOfPlayers = { listOfPlayers: [] };

export const listOfPlayersSlice = createSlice({
  name: "listOfPlayers",
  initialState,
  reducers: {
    setAllPlayers: (state, action: PayloadAction<TPlayer[]>) => {
      state.listOfPlayers = action.payload;
      localStorage.setItem("players", JSON.stringify(action.payload));
    },
  },
});
export const { setAllPlayers } = listOfPlayersSlice.actions;
export default listOfPlayersSlice.reducer;
export const selectListOfPlayers = (state: RootState) => state.listOfPlayers.listOfPlayers;
