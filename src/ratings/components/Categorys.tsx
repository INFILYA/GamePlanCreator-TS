import { TMix, TMixKeys } from "../../types/types";
import { Rows } from "./Rows";

type TCategorys = {
  filteredPlayers: TMix[];
  rankByValue<const T extends TMix>(criteria: keyof T, arr: T[]): void;
  categorys: TMixKeys[];
};

export function Categorys(props: TCategorys) {
  const { filteredPlayers, categorys, rankByValue } = props;
  const isFull = Object.values(filteredPlayers[0]).length === 1;
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
