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
    // ============================================
    // НАКОПЛЕНИЕ СТАТОВ ИГРОКОВ В ТЕКУЩЕМ РАЛЛИ (ОЧКЕ)
    // ============================================
    // SoloRallyStats - это массив игроков с их действиями в текущем ралли (очке)
    // Когда игрок делает действие (например, атаку, прием, подачу):
    //   1. В IconOfPlayers.tsx создается объект playerStats с накопленными статами из diagrammValue
    //   2. Этот объект отправляется в Redux через setSoloRallyStats
    //   3. Если игрок уже есть в SoloRallyStats - он полностью заменяется новым объектом
    //      (так как action.payload уже содержит все накопленные статы для текущего ралли)
    //   4. Если игрока нет - он добавляется в массив
    //
    // При записи очка (в RotationPanel.tsx) весь массив SoloRallyStats копируется в gameLog
    // ============================================
    setSoloRallyStats: (state, action: PayloadAction<TPlayer>) => {
      const existingPlayer = state.soloRallyStats.find(
        (player) => player.name === action.payload.name
      );
      if (existingPlayer) {
        // Игрок уже есть в ралли - заменяем его полностью новым объектом
        // action.payload уже содержит все накопленные статы из diagrammValue для текущего ралли
        state.soloRallyStats = state.soloRallyStats.map((player) =>
          player.name === action.payload.name ? action.payload : player
        );
      } else {
        // Игрок новый в этом ралли - добавляем его в массив
        state.soloRallyStats = [...state.soloRallyStats, action.payload];
      }
    },
    setSoloRallySubPlaeyrsStats: (state, action: PayloadAction<TPlayer>) => {
      if (
        state.soloRallyStats.find(
          (player) => player.name === action.payload.name
        )
      ) {
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
    resetRallyStats: (state) => {
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
  resetRallyStats,
  rotateForwardPositions,
  rotateBackPositions,
} = soloRallyStatsSlice.actions;
export default soloRallyStatsSlice.reducer;
export const selectSoloRallyStats = (state: RootState) =>
  state.soloRallyStats.soloRallyStats;
