import { TMix, TMixInterSectionKeys } from "../../types/types";
import { Rows } from "./Rows";

type TCategorys = {
  filteredPlayers: TMix[];
  rankByValue<T extends TMix>(criteria: keyof T, arr: T[]): void;
};

export function Categorys(props: TCategorys) {
  const { filteredPlayers, rankByValue } = props;
  const categorys = [
    "Name",
    "Club",
    "Age",
    "Height",
    "Aces",
    "Win points",
    "Attack Efficency",
    "Service Efficency",
    "Attack %",
  ];
  const criterias = [
    "name",
    "teamid",
    "age",
    "height",
    "aces",
    "winPoints",
    "efficencyAttack",
    "efficencyService",
    "percentOfAttack",
  ];
  return (
    <>
      <tr>
        {categorys.map((category, index) => (
          <th key={category}>
            <button
              onClick={() => rankByValue(criterias[index] as TMixInterSectionKeys, filteredPlayers)}
              title={`Click to sort by ${category}`}
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
