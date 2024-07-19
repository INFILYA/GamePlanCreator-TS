import { TMix, TMixKeys } from "../../types/types";
import { calculateTotalofActionsV2 } from "../../utilities/functions";
import { Rows } from "./Rows";

type TCategorys = {
  filteredPlayers: TMix[];
  rankByValue<const T extends TMix>(criteria: keyof T, arr: T[]): void;
  categorys: TMixKeys[];
};

export function Categorys(props: TCategorys) {
  const { filteredPlayers, categorys, rankByValue } = props;
  if (!filteredPlayers) return;
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
  return (
    <>
      <tr>
        {categorys.map((category, index) => (
          <th
            key={index}
            onClick={() => rankByValue(category, filteredPlayers)}
            title={`Click to sort by ${category}`}
            style={
              !isFull
                ? {}
                : {
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }
            }
          >
            <button
              style={
                isFull
                  ? {}
                  : {
                      transform: "rotate(90deg)",
                    }
              }
            >
              {category}
            </button>
          </th>
        ))}
      </tr>
      <Rows filteredPlayers={filteredPlayers} />
    </>
  );
}
