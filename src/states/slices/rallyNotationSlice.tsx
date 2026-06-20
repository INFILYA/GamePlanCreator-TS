import { PayloadAction, createSlice } from "@reduxjs/toolkit";

import { buildToken, tokensToNotation } from "../../notation/parser";
import { hasTerminalRallyAction, isTerminalRallyToken } from "../../notation/grades";
import type { TRallyToken, TScoutSkill } from "../../notation/types";

import { RootState } from "../store";



type TRallyNotationState = {

  tokens: TRallyToken[];

  selectedPlayerNumber: string | null;

  selectedSkill: TScoutSkill | null;

  rallyOver: boolean;

};



const initialState: TRallyNotationState = {

  tokens: [],

  selectedPlayerNumber: null,

  selectedSkill: null,

  rallyOver: false,

};



export const rallyNotationSlice = createSlice({

  name: "rallyNotation",

  initialState,

  reducers: {

    selectRallyPlayer: (state, action: PayloadAction<string | null>) => {

      state.selectedPlayerNumber = action.payload;

    },

    selectRallySkill: (state, action: PayloadAction<TScoutSkill | null>) => {

      state.selectedSkill = action.payload;

    },

    appendRallyToken: (

      state,

      action: PayloadAction<{

        playerNumber: string | number;

        skill: TScoutSkill;

        grade: string;

      }>

    ) => {

      const token = buildToken(

        action.payload.playerNumber,

        action.payload.skill,

        action.payload.grade

      );

      state.tokens.push(token);
      state.selectedSkill = null;
      if (isTerminalRallyToken(token)) {
        state.selectedPlayerNumber = null;
      }
    },

    undoLastRallyToken: (state) => {

      const removed = state.tokens.pop();

      state.rallyOver = false;

      if (removed?.skill === "S") {

        const stillHasServe = state.tokens.some((t) => t.skill === "S");

        if (!stillHasServe) {

          state.selectedSkill = "S";

        }

      }

      if (removed?.skill === "R") {

        const stillHasPass = state.tokens.some((t) => t.skill === "R");

        if (!stillHasPass) {

          state.selectedSkill = "R";

        }

      }

    },

    markRallyOver: (state) => {
      state.rallyOver = true;
      state.selectedPlayerNumber = null;
      state.selectedSkill = null;
    },
    backFromRallyOver: (state) => {
      state.rallyOver = false;
    },

    resetRallyNotation: (state) => {

      state.tokens = [];

      state.selectedPlayerNumber = null;

      state.selectedSkill = null;

      state.rallyOver = false;

    },

    startNewRally: (state, _action: PayloadAction<{ weServe: boolean }>) => {
      state.tokens = [];
      state.selectedPlayerNumber = null;
      state.selectedSkill = null;
      state.rallyOver = false;
    },

  },

});



export const {

  selectRallyPlayer,

  selectRallySkill,

  appendRallyToken,

  undoLastRallyToken,

  markRallyOver,
  backFromRallyOver,
  resetRallyNotation,

  startNewRally,

} = rallyNotationSlice.actions;



export const selectRallyTokens = (state: RootState) =>

  state.rallyNotation.tokens;

export const selectRallyNotation = (state: RootState) =>

  tokensToNotation(state.rallyNotation.tokens);

export const selectRallySelectedPlayer = (state: RootState) =>

  state.rallyNotation.selectedPlayerNumber;

export const selectRallySelectedSkill = (state: RootState) =>

  state.rallyNotation.selectedSkill;

export const selectServeRecorded = (state: RootState) =>
  state.rallyNotation.tokens.some((t) => t.skill === "S");
export const selectPassRecorded = (state: RootState) =>
  state.rallyNotation.tokens.some((t) => t.skill === "R");
export const selectRallyOver = (state: RootState) =>
  state.rallyNotation.rallyOver;
export const selectRallyActionLocked = (state: RootState) =>
  hasTerminalRallyAction(state.rallyNotation.tokens);



export default rallyNotationSlice.reducer;

