import { useSelector } from "react-redux";
import SectionWrapper from "../wrappers/SectionWrapper";
import { selectPlayerInfo } from "../states/slices/playerInfoSlice";
import { PersonalInformationOfPlayer } from "../personalInfo/PersonalInformationOfPlayer";
import { selectListOfPlayers } from "../states/slices/listOfPlayersSlice";
import { useState, useEffect, useRef } from "react";
import {
  categorys,
  compare,
  isFieldExist,
  jusName,
} from "../utilities/functions";
import { TMix } from "../types/types";
import { Categorys } from "./components/Categorys";
import { selectListOfTeams } from "../states/slices/listOfTeamsSlice";
import { RegularButton } from "../css/Button.styled";
import { selectGuestTeam } from "../states/slices/guestTeamSlice";

export function Ratings() {
  const playerInfo = useSelector(selectPlayerInfo);
  const listOfPlayers = useSelector(selectListOfPlayers);
  const listOfTeams = useSelector(selectListOfTeams);
  const guestTeam = useSelector(selectGuestTeam);
  const [filteredPlayers, setFilteredPlayers] = useState<TMix[]>([]);
  const [chosenPosition, setChosenPosition] = useState<string>("");
  const [isBiggest, setIsBiggest] = useState<boolean>(false);
  const [isChoosenFilter, setChoosenFilter] = useState<boolean>(false);
  const positions = [
    "OHitter",
    "OPPosite",
    "MBlocker",
    "SETter",
    "LIBero",
    "Team",
  ];

  function setPositionFilter(position: string) {
    setChosenPosition(position);
    setFilteredPlayers([]);
    setChoosenFilter(true);
    if (position === "T") {
      setFilteredPlayers([...listOfTeams]);
      return;
    }
    const choosenAmplua = listOfPlayers.filter(
      (player) => player.position === position
    );
    if (guestTeam[0]?.name) {
      setFilteredPlayers(
        choosenAmplua.filter((player) => player.team === guestTeam[0]?.name)
      );
    } else
      setFilteredPlayers(
        choosenAmplua.length === 0 ? listOfPlayers : choosenAmplua
      );
  }

  function rankByValue<T extends TMix>(
    criteria: keyof TMix | "earnedPoints",
    arr: T[]
  ) {
    const properArr = criteria === "name" ? filteredPlayers : arr;
    const getValue = (obj: TMix, crit: keyof TMix | "earnedPoints"): number => {
      if (crit === "earnedPoints") {
        return (
          isFieldExist(obj["A++"]) +
          isFieldExist(obj.blocks) +
          isFieldExist(obj["S++"])
        );
      }
      return isFieldExist(obj[crit as keyof TMix] as number);
    };
    !isBiggest
      ? properArr.sort((a, b) =>
          compare(getValue(b, criteria), getValue(a, criteria))
        )
      : properArr.sort((a, b) =>
          compare(getValue(a, criteria), getValue(b, criteria))
        );
    setIsBiggest(!isBiggest);
  }

  const playersNames = filteredPlayers.map((player) => jusName(player));

  // Refs для синхронизации высоты строк
  const namesTableRef = useRef<HTMLTableElement>(null);
  const statsTableRef = useRef<HTMLTableElement>(null);

  // Синхронизация высоты строк между таблицами
  useEffect(() => {
    if (!namesTableRef.current || !statsTableRef.current || !isChoosenFilter)
      return;

    const syncRowHeights = () => {
      const namesRows = namesTableRef.current?.querySelectorAll("tbody tr");
      const statsRows = statsTableRef.current?.querySelectorAll("tbody tr");

      if (!namesRows || !statsRows) return;

      const maxLength = Math.max(namesRows.length, statsRows.length);

      for (let i = 0; i < maxLength; i++) {
        const namesRow = namesRows[i] as HTMLTableRowElement;
        const statsRow = statsRows[i] as HTMLTableRowElement;

        if (namesRow && statsRow) {
          const maxHeight = Math.max(
            namesRow.offsetHeight,
            statsRow.offsetHeight
          );
          namesRow.style.height = `${maxHeight}px`;
          statsRow.style.height = `${maxHeight}px`;
        }
      }
    };

    // Небольшая задержка для того, чтобы DOM обновился
    const timeoutId = setTimeout(syncRowHeights, 0);

    // Синхронизация при изменении размера окна
    const resizeObserver = new ResizeObserver(() => {
      setTimeout(syncRowHeights, 0);
    });
    if (namesTableRef.current) resizeObserver.observe(namesTableRef.current);
    if (statsTableRef.current) resizeObserver.observe(statsTableRef.current);

    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
    };
  }, [filteredPlayers, playersNames, isChoosenFilter]);

  return (
    <article className="main-content-wrapper">
      <SectionWrapper className="ratings-section">
        <h1>Ratings</h1>
        {playerInfo ? (
          <PersonalInformationOfPlayer link="page1" />
        ) : (
          <>
            <nav>
              <div className="team-filter-wrapper">
                {positions.map((position, index) => (
                  <div key={index}>
                    <RegularButton
                      onClick={() =>
                        setPositionFilter(position.replace(/[a-z]/g, ""))
                      }
                      type="button"
                      $color={
                        chosenPosition === position.replace(/[a-z]/g, "")
                          ? "#ffd700"
                          : "#0057b8"
                      }
                      $background={
                        chosenPosition === position.replace(/[a-z]/g, "")
                          ? "#0057b8"
                          : "#ffd700"
                      }
                    >{`${position}s`}</RegularButton>
                  </div>
                ))}
              </div>
            </nav>
            {isChoosenFilter && (
              <>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "24px",
                    marginBottom: "12px",
                    flexWrap: "wrap",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <div
                      style={{
                        width: "20px",
                        height: "20px",
                        backgroundColor: "#8fbc8f",
                        borderRadius: "4px",
                      }}
                    ></div>
                    <span>Reception</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <div
                      style={{
                        width: "20px",
                        height: "20px",
                        backgroundColor: "gainsboro",
                        borderRadius: "4px",
                      }}
                    ></div>
                    <span>Attack</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <div
                      style={{
                        width: "20px",
                        height: "20px",
                        backgroundColor: "khaki",
                        borderRadius: "4px",
                      }}
                    ></div>
                    <span>Service</span>
                  </div>
                </div>
                <div
                  className="ratings-table-container"
                  style={{ display: "flex" }}
                >
                  <table ref={namesTableRef}>
                    <tbody className="rating-table-wrapper">
                      <Categorys
                        filteredPlayers={playersNames}
                        rankByValue={rankByValue}
                        categorys={["name"]}
                      />
                    </tbody>
                  </table>
                  <div>
                    <table ref={statsTableRef} style={{ width: "100%" }}>
                      <tbody className="rating-table-wrapper">
                        <Categorys
                          filteredPlayers={filteredPlayers}
                          rankByValue={rankByValue}
                          categorys={categorys}
                        />
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </SectionWrapper>
    </article>
  );
}
