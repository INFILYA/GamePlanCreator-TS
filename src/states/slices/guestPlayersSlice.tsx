import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { TPlayer } from "../../types/types";

type TGuestPlayers = {
  guestPlayers: TPlayer[];
};
const initialState: TGuestPlayers = {
  guestPlayers: [],
};

export const guestPlayersSlice = createSlice({
  name: "guestPlayers",
  initialState,
  reducers: {
    setGuestPlayers: (state, action: PayloadAction<TPlayer[]>) => {
      state.guestPlayers = action.payload;
    },
    filterGuestPlayers: (state, action: PayloadAction<string>) => {
      state.guestPlayers = state.guestPlayers.filter((player) => player.name !== action.payload);
    },
    pushFromGuestTeamBoard: (state, action: PayloadAction<TPlayer>) => {
      state.guestPlayers = [...state.guestPlayers, action.payload];
    },
    setGuestBenchPlayers: (
      state,
      action: PayloadAction<{ guestPlayers: TPlayer[]; guestTeamStartingSix: string[] }>
    ) => {
      state.guestPlayers = action.payload.guestPlayers.filter(
        (player) =>
          !action.payload.guestTeamStartingSix.some((startPlayer) => startPlayer === player.name)
      );
    },
  },
});
export const { setGuestPlayers, filterGuestPlayers, pushFromGuestTeamBoard, setGuestBenchPlayers } =
  guestPlayersSlice.actions;
export default guestPlayersSlice.reducer;
export const selectGuestPlayers = (state: RootState) => state.guestPlayers.guestPlayers;
