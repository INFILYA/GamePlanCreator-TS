import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
type TIsShowedTutorial = {
  isShowedTutorial: boolean;
};
const initialState: TIsShowedTutorial = { isShowedTutorial: false };

export const isShowedTutorialSlice = createSlice({
  name: "isShowedTutorial",
  initialState,
  reducers: {
    setisShowedTutorial: (state, action: PayloadAction<boolean>) => {
      state.isShowedTutorial = action.payload;
      localStorage.setItem("isShowedTutorial", JSON.stringify(action.payload));
    },
  },
});
export const { setisShowedTutorial } = isShowedTutorialSlice.actions;
export default isShowedTutorialSlice.reducer;
export const selectIsShowedTutorial = (state: RootState) => state.isShowedTutorial.isShowedTutorial;
