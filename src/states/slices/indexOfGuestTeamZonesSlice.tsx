import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { TPlayer } from "../../types/types";
import { RootState } from "../store";
import { emptyPlayers, positions } from "../../utilities/functions";

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
    setGuestTeamIndexOfZones: (
      state,
      action: PayloadAction<{ player: TPlayer; zone: number }>
    ) => {
      state.indexOfGuestTeamZones = state.indexOfGuestTeamZones.map((player) =>
        player.boardPosition === action.payload.zone
          ? action.payload.player
          : player
      );
    },
    resetGuestTeamIndexOfZones: (
      state,
      action: PayloadAction<{ startingSix: TPlayer[]; player: TPlayer }>
    ) => {
      state.indexOfGuestTeamZones = state.indexOfGuestTeamZones.map(
        (player, index) =>
          index === action.payload.startingSix.indexOf(action.payload.player)
            ? { ...emptyPlayers[0], boardPosition: positions[index] }
            : player
      );
    },
    setBackGuestTeamSelects: (state, action: PayloadAction<TPlayer[]>) => {
      state.indexOfGuestTeamZones = action.payload;
    },
    updateInfoOfStartingSix: (state, action: PayloadAction<TPlayer>) => {
      state.indexOfGuestTeamZones = state.indexOfGuestTeamZones.map((player) =>
        player.name === action.payload.name ? action.payload : player
      );
    },
    showGuestTeamStartingSix: (
      state,
      action: PayloadAction<{
        guestPlayers: TPlayer[];
        guestTeamStartingSix: string[];
      }>
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
    rotateForwardGuestTeam: (state) => {
      const Zone = [...state.indexOfGuestTeamZones];
      const newRot = [Zone[3], Zone[0], Zone[1], Zone[4], Zone[5], Zone[2]];
      state.indexOfGuestTeamZones = newRot;
    },
    rotateBackGuestTeam: (state) => {
      const zone = [...state.indexOfGuestTeamZones];
      const newRot2 = [zone[1], zone[2], zone[5], zone[0], zone[3], zone[4]];
      state.indexOfGuestTeamZones = newRot2;
    },
  },
});
export const {
  setGuestTeamIndexOfZones,
  resetGuestTeamIndexOfZones,
  setBackGuestTeamSelects,
  showGuestTeamStartingSix,
  updateInfoOfStartingSix,
  rotateForwardGuestTeam,
  rotateBackGuestTeam,
} = indexOfGuestTeamZonesSlice.actions;
export default indexOfGuestTeamZonesSlice.reducer;
export const selectIndexOfGuestTeamZones = (state: RootState) =>
  state.indexOfGuestTeamZones.indexOfGuestTeamZones;
