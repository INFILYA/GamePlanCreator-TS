import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { TTeam } from "../../types/types";
import { RootState } from "../store";

type TListOfTeams = {
  listOfTeams: TTeam[];
};
const initialState: TListOfTeams = { listOfTeams: [] };

export const listOfTeamsSlice = createSlice({
  name: "listOfTeams",
  initialState,
  reducers: {
    setAllTeams: (state, action: PayloadAction<TTeam[]>) => {
      state.listOfTeams = action.payload;
      localStorage.setItem("teams", JSON.stringify(action.payload));
    },
    setUpdatedTeams: (state, action: PayloadAction<TTeam[]>) => {
      state.listOfTeams = action.payload;
    },
  },
});
export const { setAllTeams, setUpdatedTeams } = listOfTeamsSlice.actions;
export default listOfTeamsSlice.reducer;
export const selectListOfTeams = (state: RootState) => state.listOfTeams.listOfTeams;
