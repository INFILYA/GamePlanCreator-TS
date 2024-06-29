import { TMix } from "../../types/types";
import { Rows } from "./Rows";

type TCategorys = {
  filteredPlayers: TMix[];
  rankByValue<T extends TMix>(criteria: keyof T, arr: T[]): void;
};

export function Categorys(props: TCategorys) {
  const { filteredPlayers, rankByValue } = props;
  const categorys = [
    "name",
    "+/-",
    "blocks",
    "S=",
    "S-",
    "S!",
    "S+",
    "S++",
    "A=",
    "A-",
    "A!",
    "A+",
    "A++",
    "R=",
    "R-",
    "R!",
    "R+",
    "R++",
    "R#%",
    "R+%",
    "Effic",
    "A%",
  ];
  return (
    <>
      <tr>
        {categorys.map((category, index) => (
          <th
            key={index}
            onClick={() => rankByValue(category as keyof TMix, filteredPlayers)}
            title={`Click to sort by ${category}`}
          >
            <button style={{ transform: "rotate(90deg)" }}>{category}</button>
          </th>
        ))}
      </tr>
      <Rows filteredPlayers={filteredPlayers} />
    </>
  );
}
