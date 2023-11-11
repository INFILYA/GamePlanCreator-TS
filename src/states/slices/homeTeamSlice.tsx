import { PayloadAction, createSelector, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { selectListOfTeams } from "./listOfTeamsSlice";

type THomeTeam = {
  homeTeam: string;
};
const initialState: THomeTeam = { homeTeam: "" };

export const homeTeamSlice = createSlice({
  name: "homeTeam",
  initialState,
  reducers: {
    setHomeTeam: (state, action: PayloadAction<string>) => {
      state.homeTeam = action.payload;
    },
  },
});
export const { setHomeTeam } = homeTeamSlice.actions;
export default homeTeamSlice.reducer;
export const selectHomeTeamFilter = (state: RootState) => state.homeTeam.homeTeam;

export const selectHomeTeam = createSelector(
  selectListOfTeams,
  selectHomeTeamFilter,
  (teams, filters) => teams.filter((team) => team.name === filters)
);
