import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { TPlayer } from "../../types/types";
import { RootState } from "../store";
import { emptyPlayers, zones } from "../../utilities/functions";

type TIndexOfGuestTeamZones = {
  indexOfGuestTeamZones: TPlayer[];
};
const initialState: TIndexOfGuestTeamZones = {
  indexOfGuestTeamZones: emptyPlayers,
};

export const indexOfGuestTeamZonesSlice = createSlice({
  name: "indexOfGuestTeamZones",
  initialState,
  reducers: {
    setGuestTeamIndexOfZones: (
      state,
      action: PayloadAction<{ player: TPlayer; zone: number }>
    ) => {
      // Обработка либеро (zone === -1)
      if (action.payload.zone === -1) {
        const existingLiberoIndex = state.indexOfGuestTeamZones.findIndex(
          (p) => p.boardPosition === -1
        );
        if (existingLiberoIndex !== -1) {
          // Заменяем существующего либеро
          state.indexOfGuestTeamZones[existingLiberoIndex] = {
            ...action.payload.player,
            boardPosition: -1,
          };
        } else {
          // Добавляем нового либеро в массив
          state.indexOfGuestTeamZones.push({
            ...action.payload.player,
            boardPosition: -1,
          });
        }
        return;
      }
      // Обычная обработка для основных зон (1-6)
      // action.payload.zone уже содержит правильный boardPosition из zones[zoneIndex]
      const targetBoardPosition = action.payload.zone;

      // Сначала удаляем игрока из старой позиции (если он уже на доске)
      state.indexOfGuestTeamZones = state.indexOfGuestTeamZones.map(
        (player) => {
          // Если это тот же игрок, но в другой зоне - очищаем старую позицию
          if (
            player.name === action.payload.player.name &&
            player.boardPosition !== targetBoardPosition
          ) {
            // Находим индекс зоны для создания правильного emptyPlayer
            const oldZoneIndex = zones.indexOf(player.boardPosition);
            if (oldZoneIndex !== -1) {
              return { ...emptyPlayers[oldZoneIndex] };
            }
            // Если не нашли в zones, создаем пустого игрока с тем же boardPosition
            return { ...emptyPlayers[0], boardPosition: player.boardPosition };
          }
          return player;
        }
      );

      // Теперь ищем слот для новой зоны
      const targetSlotIndex = state.indexOfGuestTeamZones.findIndex(
        (p) => p.boardPosition === targetBoardPosition
      );

      if (targetSlotIndex !== -1) {
        // Зона найдена - заменяем игрока (устанавливаем boardPosition явно)
        state.indexOfGuestTeamZones[targetSlotIndex] = {
          ...action.payload.player,
          boardPosition: targetBoardPosition,
        };
      } else {
        // Зона не найдена - добавляем нового игрока с правильным boardPosition
        state.indexOfGuestTeamZones.push({
          ...action.payload.player,
          boardPosition: targetBoardPosition,
        });
      }
    },
    resetGuestTeamIndexOfZones: (
      state,
      action: PayloadAction<{ startingSix: TPlayer[]; player: TPlayer }>
    ) => {
      // Если это либеро, удаляем его из массива полностью
      if (action.payload.player.position === "LIB") {
        state.indexOfGuestTeamZones = state.indexOfGuestTeamZones.filter(
          (p) => p.name !== action.payload.player.name
        );
        return;
      }

      const targetBoardPosition = action.payload.player.boardPosition;
      if (typeof targetBoardPosition !== "number") {
        return;
      }

      // Для обычных игроков очищаем именно его текущую зону по boardPosition
      state.indexOfGuestTeamZones = state.indexOfGuestTeamZones.map(
        (player) => {
          if (player.name !== action.payload.player.name) {
            return player;
          }
          const zoneIndex = zones.indexOf(targetBoardPosition);
          if (zoneIndex !== -1) {
            return { ...emptyPlayers[zoneIndex] };
          }
          return { ...emptyPlayers[0], boardPosition: targetBoardPosition };
        }
      );
    },
    setBackGuestTeamSelects: (state, action: PayloadAction<TPlayer[]>) => {
      state.indexOfGuestTeamZones = action.payload;
    },
    updateInfoOfStartingSix: (state, action: PayloadAction<TPlayer>) => {
      state.indexOfGuestTeamZones = state.indexOfGuestTeamZones.map((player) =>
        player.name === action.payload.name ? action.payload : player
      );
    },
    showGuestTeamStartingSix: (
      state,
      action: PayloadAction<{
        guestPlayers: TPlayer[];
        guestTeamStartingSix: string[];
      }>
    ) => {
      const startingSix = action.payload.guestTeamStartingSix;
      const allPlayers = action.payload.guestPlayers;
      const correctStartingSix = [];
      for (let i = 0; i < startingSix.length; i++) {
        for (let j = 0; j < allPlayers.length; j++) {
          if (startingSix[i] === allPlayers[j].name) {
            // Устанавливаем boardPosition для каждого игрока согласно его позиции в массиве
            correctStartingSix.push({
              ...allPlayers[j],
              boardPosition: zones[i],
            });
          }
        }
      }
      state.indexOfGuestTeamZones = correctStartingSix;
    },
    rotateForwardGuestTeam: (state) => {
      // Фильтруем либеро из расстановки перед ротацией
      const playersWithoutLibero = state.indexOfGuestTeamZones.filter(
        (p) => p.boardPosition !== -1
      );
      const orderedByZones = zones.map((boardPosition, index) => {
        const playerAtZone = playersWithoutLibero.find(
          (p) => p.boardPosition === boardPosition
        );
        return playerAtZone ? playerAtZone : { ...emptyPlayers[index] };
      });
      const libero = state.indexOfGuestTeamZones.find(
        (p) => p.boardPosition === -1
      );
      const Zone = [...orderedByZones];
      const newRot = [Zone[3], Zone[0], Zone[1], Zone[4], Zone[5], Zone[2]];
      // Обновляем boardPosition для каждого игрока согласно его новой позиции в массиве
      const rotatedWithUpdatedPositions = newRot.map((player, index) => ({
        ...player,
        boardPosition: zones[index],
      }));
      // Добавляем либеро обратно, если он был
      state.indexOfGuestTeamZones = libero
        ? [...rotatedWithUpdatedPositions, libero]
        : rotatedWithUpdatedPositions;
    },
    rotateBackGuestTeam: (state) => {
      // Фильтруем либеро из расстановки перед ротацией
      const playersWithoutLibero = state.indexOfGuestTeamZones.filter(
        (p) => p.boardPosition !== -1
      );
      const orderedByZones = zones.map((boardPosition, index) => {
        const playerAtZone = playersWithoutLibero.find(
          (p) => p.boardPosition === boardPosition
        );
        return playerAtZone ? playerAtZone : { ...emptyPlayers[index] };
      });
      const libero = state.indexOfGuestTeamZones.find(
        (p) => p.boardPosition === -1
      );
      const zone = [...orderedByZones];
      const newRot2 = [zone[1], zone[2], zone[5], zone[0], zone[3], zone[4]];
      // Обновляем boardPosition для каждого игрока согласно его новой позиции в массиве
      const rotatedWithUpdatedPositions = newRot2.map((player, index) => ({
        ...player,
        boardPosition: zones[index],
      }));
      // Добавляем либеро обратно, если он был
      state.indexOfGuestTeamZones = libero
        ? [...rotatedWithUpdatedPositions, libero]
        : rotatedWithUpdatedPositions;
    },
  },
});
export const {
  setGuestTeamIndexOfZones,
  resetGuestTeamIndexOfZones,
  setBackGuestTeamSelects,
  showGuestTeamStartingSix,
  updateInfoOfStartingSix,
  rotateForwardGuestTeam,
  rotateBackGuestTeam,
} = indexOfGuestTeamZonesSlice.actions;
export default indexOfGuestTeamZonesSlice.reducer;
export const selectIndexOfGuestTeamZones = (state: RootState) =>
  state.indexOfGuestTeamZones.indexOfGuestTeamZones;
