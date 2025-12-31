import { TMix, TMixKeys } from "../../types/types";
import { calculateTotalofActionsV2 } from "../../utilities/functions";
import { Rows } from "./Rows";

type TCategorys = {
  filteredPlayers: TMix[];
  rankByValue<const T extends TMix>(criteria: keyof T | "earnedPoints", arr: T[]): void;
  categorys: (TMixKeys | "earnedPoints")[];
  sortState?: Record<string, "asc" | "desc" | null>;
  lastRow?: boolean;
};

export function Categorys(props: TCategorys) {
  const { filteredPlayers, categorys, rankByValue } = props;
  if (!filteredPlayers || filteredPlayers.length === 0) return;
  const isFull = Object.values(filteredPlayers[0]).length === 1;

  const correctPlayersInfo = filteredPlayers
    .map((player) => calculateTotalofActionsV2(filteredPlayers, player.name))
    .filter((player) => !player.name);

  const properPlayersInfo = [] as TMix[];
  for (let i = 0; i < correctPlayersInfo.length; i++) {
    const player = correctPlayersInfo[i];
    if (properPlayersInfo.some((athlete) => athlete === player)) {
      continue;
    } else properPlayersInfo.push(player);
  }

  // Функция для определения цвета заголовка по категории
  const getHeaderColor = (category: string): string | undefined => {
    if (category.startsWith("R")) {
      return "#8fbc8f"; // Reception
    } else if (category.startsWith("A") || category === "Effic") {
      return "gainsboro"; // Attack
    } else if (category.startsWith("S")) {
      return "khaki"; // Service
    }
    return undefined; // "+/-", "name", "blocks" и "earnedPoints" без цвета (используют дефолтный синий градиент)
  };

  return (
    <>
      <tr>
        {categorys.map((category, index) => {
          const backgroundColor = getHeaderColor(category);
          return (
            <th
              key={index}
              onClick={() => rankByValue(category, filteredPlayers)}
              data-colored-header={backgroundColor ? "true" : undefined}
              style={
                backgroundColor
                  ? {
                      background: backgroundColor,
                      backgroundColor: backgroundColor,
                      color: "black",
                    }
                  : {}
              }
            >
              <button
                style={
                  isFull
                    ? backgroundColor
                      ? { color: "black" }
                      : {}
                    : {
                        transform: "rotate(90deg)",
                        ...(backgroundColor ? { color: "black" } : {}),
                      }
                }
              >
                {category === "earnedPoints" ? "Points" : category}
              </button>
            </th>
          );
        })}
      </tr>
      <Rows filteredPlayers={filteredPlayers} />
    </>
  );
}
