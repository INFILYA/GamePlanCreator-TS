import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { TPlayer } from "../../types/types";
import { RootState } from "../store";

type TSoloRallyStats = {
  soloRallyStats: TPlayer[];
};
const initialState: TSoloRallyStats = { soloRallyStats: [] };

export const soloRallyStatsSlice = createSlice({
  name: "soloRallyStats",
  initialState,
  reducers: {
    setSoloRallyStats: (state, action: PayloadAction<TPlayer>) => {
      if (state.soloRallyStats.find((player) => player.name === action.payload.name)) {
        state.soloRallyStats = state.soloRallyStats.map((player) =>
          player.name === action.payload.name ? action.payload : player
        );
      } else state.soloRallyStats = [...state.soloRallyStats, action.payload];
    },
    setSoloRallySubPlaeyrsStats: (state, action: PayloadAction<TPlayer>) => {
      if (state.soloRallyStats.find((player) => player.name === action.payload.name)) {
        state.soloRallyStats = state.soloRallyStats.map((player) =>
          player.name === action.payload.name ? player : player
        );
      } else state.soloRallyStats = [...state.soloRallyStats, action.payload];
    },
    // setSoloGameStartingSix: (
    //   state,
    //   action: PayloadAction<{ guestPlayers: TPlayer[]; guestTeamStartingSix: string[] }>
    // ) => {
    //   const startingSix = action.payload.guestTeamStartingSix;
    //   const allPlayers = action.payload.guestPlayers;
    //   const correctStartingSix = [];
    //   for (let i = 0; i < startingSix.length; i++) {
    //     for (let j = 0; j < allPlayers.length; j++) {
    //       if (startingSix[i] === allPlayers[j].name) {
    //         const soloGamePlayerStats = { ...allPlayers[j] };
    //         soloGamePlayerStats["A++"] = 0;
    //         soloGamePlayerStats["A+"] = 0;
    //         soloGamePlayerStats["A="] = 0;
    //         soloGamePlayerStats["A!"] = 0;
    //         soloGamePlayerStats["A-"] = 0;
    //         soloGamePlayerStats["S++"] = 0;
    //         soloGamePlayerStats["S="] = 0;
    //         soloGamePlayerStats["S="] = 0;
    //         soloGamePlayerStats["S-"] = 0;
    //         soloGamePlayerStats["S+"] = 0;
    //         correctStartingSix.push(soloGamePlayerStats);
    //       }
    //     }
    //   }
    //   state.soloGameStats = correctStartingSix;
    // },
    resetGameStats: (state) => {
      state.soloRallyStats = [];
    },
    rotateForwardPositions: (state) => {
      const Zone = [...state.soloRallyStats];
      const newRot = [Zone[3], Zone[0], Zone[1], Zone[4], Zone[5], Zone[2]];
      const subPlayers = state.soloRallyStats.slice(6);
      state.soloRallyStats = [...newRot, ...subPlayers];
    },
    rotateBackPositions: (state) => {
      const zone = [...state.soloRallyStats];
      const newRot = [zone[1], zone[2], zone[5], zone[0], zone[3], zone[4]];
      const subPlayers = state.soloRallyStats.slice(6);
      state.soloRallyStats = [...newRot, ...subPlayers];
    },
  },
});
export const {
  setSoloRallyStats,
  setSoloRallySubPlaeyrsStats,
  // setSoloGameStartingSix,
  resetGameStats,
  rotateForwardPositions,
  rotateBackPositions,
} = soloRallyStatsSlice.actions;
export default soloRallyStatsSlice.reducer;
export const selectSoloRallyStats = (state: RootState) => state.soloRallyStats.soloRallyStats;
