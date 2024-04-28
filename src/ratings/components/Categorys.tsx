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
    "Left in Game",
    "Attacks in Block",
    "Loose Points",
    "Win points",
    "Attack Efficency",
    "+  - on Attack",
    "Attack %",
  ];
  const criterias = [
    "name",
    "team",
    "leftInGame",
    "attacksInBlock",
    "loosePoints",
    "winPoints",
    "efficencyAttack",
    "plusMinusOnAttack",
    "percentOfAttack",
  ];
  return (
    <>
      <tr>
        {categorys.map((category, index) => (
          <th key={index}>
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
