import { PayloadAction, createSelector, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { selectListOfTeams } from "./listOfTeamsSlice";

type TGuestTeam = {
  guestTeam: string;
};
const initialState: TGuestTeam = { guestTeam: "" };

export const guestTeamSlice = createSlice({
  name: "guestTeam",
  initialState,
  reducers: {
    setGuestTeam: (state, action: PayloadAction<string>) => {
      state.guestTeam = action.payload;
    },
  },
});
export const { setGuestTeam } = guestTeamSlice.actions;
export default guestTeamSlice.reducer;
export const selectGuestTeamFilter = (state: RootState) => state.guestTeam.guestTeam;

export const selectGuestTeam = createSelector(
  selectListOfTeams,
  selectGuestTeamFilter,
  (teams, filters) => teams.filter((team) => team.name === filters)
);
