import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { TPlayer } from "../../types/types";
import { RootState } from "../store";
import { emptyPlayers, zones } from "../../utilities/functions";

type TIndexOfGuestTeamZones = {
  indexOfGuestTeamZones: TPlayer[];
};
const initialState: TIndexOfGuestTeamZones = {
  indexOfGuestTeamZones: emptyPlayers,
};

export const indexOfGuestTeamZonesSlice = createSlice({
  name: "indexOfGuestTeamZones",
  initialState,
  reducers: {
    setGuestTeamIndexOfZones: (state, action: PayloadAction<{ player: TPlayer; zone: number }>) => {
      state.indexOfGuestTeamZones = state.indexOfGuestTeamZones.map((player) =>
        player.boardPosition === action.payload.zone ? action.payload.player : player
      );
    },
    resetGuestTeamIndexOfZones: (
      state,
      action: PayloadAction<{ startingSix: TPlayer[]; player: TPlayer }>
    ) => {
      state.indexOfGuestTeamZones = state.indexOfGuestTeamZones.map((player, index) =>
        index === action.payload.startingSix.indexOf(action.payload.player)
          ? { ...emptyPlayers[0], boardPosition: zones[index] }
          : player
      );
    },
    setBackGuestTeamSelects: (state, action: PayloadAction<TPlayer[]>) => {
      state.indexOfGuestTeamZones = action.payload;
    },
    showGuestTeamStartingSix: (
      state,
      action: PayloadAction<{ guestPlayers: TPlayer[]; guestTeamStartingSix: string[] }>
    ) => {
      const startingSix = action.payload.guestTeamStartingSix;
      const allPlayers = action.payload.guestPlayers;
      const correctStartingSix = [];
      for (let i = 0; i < startingSix.length; i++) {
        for (let j = 0; j < allPlayers.length; j++) {
          if (startingSix[i] === allPlayers[j].name) {
            correctStartingSix.push(allPlayers[j]);
          }
        }
      }
      state.indexOfGuestTeamZones = correctStartingSix;
    },
  },
});
export const {
  setGuestTeamIndexOfZones,
  resetGuestTeamIndexOfZones,
  setBackGuestTeamSelects,
  showGuestTeamStartingSix,
} = indexOfGuestTeamZonesSlice.actions;
export default indexOfGuestTeamZonesSlice.reducer;
export const selectIndexOfGuestTeamZones = (state: RootState) =>
  state.indexOfGuestTeamZones.indexOfGuestTeamZones;
