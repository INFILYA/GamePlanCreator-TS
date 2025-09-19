import { useSelector } from "react-redux";
import SectionWrapper from "../wrappers/SectionWrapper";
import { selectPlayerInfo } from "../states/slices/playerInfoSlice";
import { PersonalInformationOfPlayer } from "../personalInfo/PersonalInformationOfPlayer";
import { selectListOfPlayers } from "../states/slices/listOfPlayersSlice";
import { useState } from "react";
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

  function rankByValue<T extends TMix>(criteria: keyof TMix, arr: T[]) {
    const properArr = criteria === "name" ? filteredPlayers : arr;
    !isBiggest
      ? properArr.sort((a, b) =>
          compare(
            isFieldExist(b[criteria] as number),
            isFieldExist(a[criteria] as number)
          )
        )
      : properArr.sort((a, b) =>
          compare(
            isFieldExist(a[criteria] as number),
            isFieldExist(b[criteria] as number)
          )
        );
    setIsBiggest(!isBiggest);
  }

  const playersNames = filteredPlayers.map((player) => jusName(player));
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
              <div style={{ display: "flex" }}>
                <table>
                  <tbody className="rating-table-wrapper">
                    <Categorys
                      filteredPlayers={playersNames}
                      rankByValue={rankByValue}
                      categorys={["name"]}
                    />
                  </tbody>
                </table>
                <div>
                  <table style={{ width: "100%" }}>
                    <tbody className="rating-table-wrapper">
                      <Categorys
                        filteredPlayers={filteredPlayers}
                        rankByValue={rankByValue}
                        categorys={categorys}
                      />
                    </tbody>
                  </table>
                  <div className="type-of-actions-wrapper">
                    <div className="reception-content">Reception</div>
                    <div className="attack-content">Attack</div>
                    <div className="service-content">Service</div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </SectionWrapper>
    </article>
  );
}
