import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { TGameLogStats } from "../../types/types";
import { RootState } from "../store";

export type TLiveGameState = {
  gameLog: TGameLogStats;
  myScore: number;
  rivalScore: number;
  weServe: boolean;
  opponentTeamName: string;
  setNumber: string;
  exhibitionGame: boolean;
  teamName: string;
  inStatMode: boolean;
};

const initialState: TLiveGameState = {
  gameLog: [],
  myScore: 0,
  rivalScore: 0,
  weServe: false,
  opponentTeamName: "",
  setNumber: "",
  exhibitionGame: false,
  teamName: "",
  inStatMode: false,
};

export const liveGameSlice = createSlice({
  name: "liveGame",
  initialState,
  reducers: {
    syncLiveGame: (state, action: PayloadAction<Partial<TLiveGameState>>) => {
      Object.assign(state, action.payload);
    },
    clearLiveGame: () => initialState,
  },
});

export const { syncLiveGame, clearLiveGame } = liveGameSlice.actions;

export const selectLiveGame = (state: RootState) => state.liveGame;
export const selectLiveGameLog = (state: RootState) => state.liveGame.gameLog;
export const selectLiveScore = (state: RootState) =>
  `${state.liveGame.myScore} - ${state.liveGame.rivalScore}`;

export default liveGameSlice.reducer;
