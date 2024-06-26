import { PayloadAction, createAsyncThunk, createSelector, createSlice } from "@reduxjs/toolkit";
import { TGameStats } from "../../types/types";
import { RootState } from "../store";
import { collection, getDocs } from "firebase/firestore";
import { dataBase } from "../../config/firebase";
import { getFromLocalStorage } from "../../utilities/functions";

export const fetchGamesStats = createAsyncThunk("", async () => {
  const userVersion: number = getFromLocalStorage("currentUserVersion") || 0;
  const versionOfData = await getDocs(collection(dataBase, "dataVersion"));
  const adminVersion = versionOfData.docs[0].data().currentVersion;
  if (adminVersion === userVersion) {
    return getFromLocalStorage("gamesStats");
  }
  const data = await getDocs(collection(dataBase, "gameStats"));
  const dataOfGameStats = data.docs.map((doc) => ({
    ...doc.data(),
  }));
  localStorage.setItem("gamesStats", JSON.stringify(dataOfGameStats));
  return dataOfGameStats;
});

type TListOfTeams = {
  gamesStats: TGameStats[];
  gameFilters: { team: string };
  loading: boolean;
  failed: boolean;
};
const initialState: TListOfTeams = {
  gamesStats: [],
  gameFilters: { team: "" },
  loading: true,
  failed: false,
};

export const gamesStatsSlice = createSlice({
  name: "gamesStats",
  initialState,
  reducers: {
    setAllGameStats: (state, action: PayloadAction<TGameStats[]>) => {
      state.gamesStats = action.payload;
      localStorage.setItem("gamesStats", JSON.stringify(action.payload));
    },
    setAddSoloGameStat: (state, action: PayloadAction<TGameStats>) => {
      state.gamesStats = [...state.gamesStats, action.payload];
      localStorage.setItem("gamesStats", JSON.stringify([...state.gamesStats, action.payload]));
    },
    setgameFilterByTeam: (state, action: PayloadAction<string>) => {
      state.gameFilters.team = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGamesStats.fulfilled, (state, action) => {
        state.gamesStats = action.payload;
        state.loading = false;
        state.failed = false;
      })
      .addCase(fetchGamesStats.pending, (state) => {
        state.loading = true;
        state.failed = false;
      })
      .addCase(fetchGamesStats.rejected, (state) => {
        state.loading = false;
        state.failed = true;
        state.gamesStats = [];
      });
  },
});
export const { setAllGameStats, setAddSoloGameStat, setgameFilterByTeam } = gamesStatsSlice.actions;
export default gamesStatsSlice.reducer;
export const selectGamesStats = (state: RootState) => state.gamesStats.gamesStats;
export const selectorFilter = (state: RootState) => state.gamesStats.gameFilters;

export const selectFilteredGameStats = createSelector(
  selectGamesStats,
  selectorFilter,
  (games, filters) =>
    games.filter((game) => (!filters.team ? game : Object.keys(game)[0].includes(filters.team)))
);
