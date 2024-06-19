import { TMix } from "../../types/types";
import { useSetWidth } from "../../utilities/useSetWidth";
import { Rows } from "./Rows";

type TCategorys = {
  filteredPlayers: TMix[];
  rankByValue<T extends TMix>(criteria: keyof T, arr: T[]): void;
};

export function Categorys(props: TCategorys) {
  const { filteredPlayers, rankByValue } = props;
  const properWidth = useSetWidth() > 767;
  const categorys = ["Name", "Club", "S=", "S-", "S+", "S#", "A=", "AB", "A!", "A+", "Effic", "%"];
  const criterias = [
    "name",
    "team",
    "serviceFailed",
    "serviceMinus",
    "servicePlus",
    "ace",
    "loosePoints",
    "attacksInBlock",
    "leftInGame",
    "winPoints",
    "efficencyAttack",
    "percentOfAttack",
  ];
  return (
    <>
      <tr>
        {categorys.map((category, index) => (
          <th
            key={index}
            onClick={() => rankByValue(criterias[index] as keyof TMix, filteredPlayers)}
            title={`Click to sort by ${category}`}
          >
            <button style={{ transform: properWidth ? "rotate(0deg)" : "rotate(90deg)" }}>
              {category}
            </button>
          </th>
        ))}
      </tr>
      <Rows filteredPlayers={filteredPlayers} />
    </>
  );
}
