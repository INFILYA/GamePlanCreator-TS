import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

type TChangeLanguage = {
  changeLanguage: boolean;
};
const initialState: TChangeLanguage = { changeLanguage: false };

export const changeLanguageSlice = createSlice({
  name: "changeLanguage",
  initialState,
  reducers: {
    setChangeLanguage: (state, action: PayloadAction<boolean>) => {
      state.changeLanguage = action.payload;
    },
  },
});
export const { setChangeLanguage } = changeLanguageSlice.actions;
export default changeLanguageSlice.reducer;
export const selectChangeLanguage = (state: RootState) => state.changeLanguage.changeLanguage;
