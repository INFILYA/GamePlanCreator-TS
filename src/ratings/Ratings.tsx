import { useSelector } from "react-redux";
import SectionWrapper from "../wrappers/SectionWrapper";
import { selectPlayerInfo } from "../states/slices/playerInfoSlice";
import { PersonalInformationOfPlayer } from "../personalInfo/PersonalInformationOfPlayer";
import { selectListOfPlayers } from "../states/slices/listOfPlayersSlice";
import { useState } from "react";
import { compare } from "../utilities/functions";
import { TMix } from "../types/types";
import { Categorys } from "./components/Categorys";
import { selectListOfTeams } from "../states/slices/listOfTeamsSlice";
import { RegularButton } from "../css/Button.styled";

export function Ratings() {
  const playerInfo = useSelector(selectPlayerInfo);
  const listOfPlayers = useSelector(selectListOfPlayers);
  const listOfTeams = useSelector(selectListOfTeams);
  const [filteredPlayers, setFilteredPlayers] = useState<TMix[]>([]);
  const [chosenPosition, setChosenPosition] = useState<string>("");
  const [isBiggest, setIsBiggest] = useState<boolean>(false);
  const [isChoosenFilter, setChoosenFilter] = useState<boolean>(false);
  const positions = ["Reciever", "Opposite", "MBlocker", "Setter", "Team"];

  function setPositionFilter(position: string) {
    setChosenPosition(position);
    setFilteredPlayers([]);
    setChoosenFilter(true);
    if (position === "Team") {
      setFilteredPlayers([...listOfTeams]);
      return;
    }
    const choosenAmplua = listOfPlayers.filter((player) => player.position === position);
    setFilteredPlayers(choosenAmplua);
  }
  function rankByValue<T extends TMix>(criteria: keyof T, arr: T[]) {
    !isBiggest
      ? arr.sort((a, b) => compare(b[criteria], a[criteria]))
      : arr.sort((a, b) => compare(a[criteria], b[criteria]));
    setIsBiggest(!isBiggest);
  }
  return (
    <article className="main-content-wrapper">
      <SectionWrapper
        className="ratings-section"
        content={
          <>
            <h1>Ratings</h1>
            {playerInfo ? (
              <PersonalInformationOfPlayer link="page1" />
            ) : (
              <table>
                <caption className="showRatings-wrapper">
                  <nav>
                    <div className="team-filter-wrapper">
                      {positions.map((position, index) => (
                        <div key={index}>
                          <RegularButton
                            onClick={() => setPositionFilter(position)}
                            type="button"
                            $color={chosenPosition === position ? "#ffd700" : "#0057b8"}
                            $background={chosenPosition === position ? "#0057b8" : "#ffd700"}
                          >{`${position}s`}</RegularButton>
                        </div>
                      ))}
                    </div>
                  </nav>
                </caption>
                {isChoosenFilter && (
                  <tbody className="rating-table-wrapper">
                    <Categorys filteredPlayers={filteredPlayers} rankByValue={rankByValue} />
                  </tbody>
                )}
              </table>
            )}
          </>
        }
      />
    </article>
  );
}
