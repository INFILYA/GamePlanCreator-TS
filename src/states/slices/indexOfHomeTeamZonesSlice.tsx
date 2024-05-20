import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { TPlayer } from "../../types/types";
import { RootState } from "../store";
import { emptyPlayers, positions } from "../../utilities/functions";

type TIndexOfHomeTeamZones = {
  indexOfHomeTeamZones: TPlayer[];
};
const initialState: TIndexOfHomeTeamZones = {
  indexOfHomeTeamZones: emptyPlayers,
};

export const indexOfHomeTeamZonesSlice = createSlice({
  name: "indexOfHomeTeamZones",
  initialState,
  reducers: {
    setHomeTeamIndexOfZones: (state, action: PayloadAction<{ player: TPlayer; zone: number }>) => {
      state.indexOfHomeTeamZones = state.indexOfHomeTeamZones.map((player) =>
        player.boardPosition === action.payload.zone ? action.payload.player : player
      );
    },
    resetHomeTeamIndexOfZones: (
      state,
      action: PayloadAction<{ startingSix: TPlayer[]; player: TPlayer }>
    ) => {
      state.indexOfHomeTeamZones = state.indexOfHomeTeamZones.map((player, index) =>
        index === action.payload.startingSix.indexOf(action.payload.player)
          ? { ...emptyPlayers[0], boardPosition: positions[index] }
          : player
      );
    },
    updateInfoOfSubPlayers: (state, action: PayloadAction<TPlayer>) => {
      state.indexOfHomeTeamZones = state.indexOfHomeTeamZones.map((player) =>
        player.name === action.payload.name ? action.payload : player
      );
    },
    setBackHomeTeamSelects: (state, action: PayloadAction<TPlayer[]>) => {
      state.indexOfHomeTeamZones = action.payload;
    },
    rotateForwardHomeTeam: (state) => {
      const Zone = [...state.indexOfHomeTeamZones];
      const newRot = [Zone[3], Zone[0], Zone[1], Zone[4], Zone[5], Zone[2]];
      state.indexOfHomeTeamZones = newRot;
    },
    rotateBackHomeTeam: (state) => {
      const zone = [...state.indexOfHomeTeamZones];
      const newRot2 = [zone[1], zone[2], zone[5], zone[0], zone[3], zone[4]];
      state.indexOfHomeTeamZones = newRot2;
    },
  },
});
export const {
  setHomeTeamIndexOfZones,
  resetHomeTeamIndexOfZones,
  updateInfoOfSubPlayers,
  setBackHomeTeamSelects,
  rotateForwardHomeTeam,
  rotateBackHomeTeam,
} = indexOfHomeTeamZonesSlice.actions;
export default indexOfHomeTeamZonesSlice.reducer;
export const selectIndexOfHomeTeamZones = (state: RootState) =>
  state.indexOfHomeTeamZones.indexOfHomeTeamZones;
