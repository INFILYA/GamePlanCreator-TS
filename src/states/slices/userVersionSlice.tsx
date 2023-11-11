import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";

type TUserVersion = {
  userVersion: number;
};
const initialState: TUserVersion = { userVersion: 0 };

export const userVersionSlice = createSlice({
  name: "userVersion",
  initialState,
  reducers: {
    setUserVersion: (state, action: PayloadAction<number>) => {
      state.userVersion = action.payload;
    },
  },
});
export const { setUserVersion } = userVersionSlice.actions;
export default userVersionSlice.reducer;
export const selectUserVersion = (state: RootState) => state.userVersion.userVersion;
