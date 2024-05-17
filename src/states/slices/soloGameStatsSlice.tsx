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
    setSoloGameSubPlaeyrsStats: (state, action: PayloadAction<TPlayer>) => {
      if (state.soloGameStats.find((player) => player.name === action.payload.name)) {
        state.soloGameStats = state.soloGameStats.map((player) =>
          player.name === action.payload.name ? player : player
        );
      } else state.soloGameStats = [...state.soloGameStats, action.payload];
    },
    setSoloGameStartingSix: (
      state,
      action: PayloadAction<{ guestPlayers: TPlayer[]; guestTeamStartingSix: string[] }>
    ) => {
      const startingSix = action.payload.guestTeamStartingSix;
      const allPlayers = action.payload.guestPlayers;
      const correctStartingSix = [];
      for (let i = 0; i < startingSix.length; i++) {
        for (let j = 0; j < allPlayers.length; j++) {
          if (startingSix[i] === allPlayers[j].name) {
            const soloGamePlayer = { ...allPlayers[j] };
            soloGamePlayer.winPoints = 0;
            soloGamePlayer.loosePoints = 0;
            soloGamePlayer.leftInGame = 0;
            soloGamePlayer.attacksInBlock = 0;
            soloGamePlayer.efficencyAttack = 0;
            soloGamePlayer.plusMinusOnAttack = 0;
            soloGamePlayer.percentOfAttack = 0;
            correctStartingSix.push(soloGamePlayer);
          }
        }
      }
      state.soloGameStats = correctStartingSix;
    },
    resetGameStats: (state) => {
      state.soloGameStats = [];
    },
    rotateForwardPositions: (state) => {
      const Zone = [...state.soloGameStats];
      const newRot = [Zone[3], Zone[0], Zone[1], Zone[4], Zone[5], Zone[2]];
      const subPlayers = state.soloGameStats.slice(6);
      state.soloGameStats = [...newRot, ...subPlayers];
    },
    rotateBackPositions: (state) => {
      const zone = [...state.soloGameStats];
      const newRot = [zone[1], zone[2], zone[5], zone[0], zone[3], zone[4]];
      const subPlayers = state.soloGameStats.slice(6);
      state.soloGameStats = [...newRot, ...subPlayers];
    },
  },
});
export const {
  setSoloGameStats,
  setSoloGameSubPlaeyrsStats,
  setSoloGameStartingSix,
  resetGameStats,
  rotateForwardPositions,
  rotateBackPositions,
} = soloGameStatsSlice.actions;
export default soloGameStatsSlice.reducer;
export const selectSoloGameStats = (state: RootState) => state.soloGameStats.soloGameStats;
