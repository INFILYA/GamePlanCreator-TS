import { useSelector } from "react-redux";
import {
  selectFilteredGameStats,
  selectorFilter,
  setgameFilterByTeam,
} from "../states/slices/gamesStatsSlice";
import { ChangeEvent, useState } from "react";
import { TGameStats, TMix, TPlayer } from "../types/types";
import SectionWrapper from "../wrappers/SectionWrapper";
import {
  calculateTotalofActions,
  categorys,
  compare,
  isFieldExist,
  jusName,
} from "../utilities/functions";
import { Categorys } from "../ratings/components/Categorys";
import { Rows } from "../ratings/components/Rows";
import { selectListOfTeams } from "../states/slices/listOfTeamsSlice";
import { selectPlayerInfo } from "../states/slices/playerInfoSlice";
import { PersonalInformationOfPlayer } from "../personalInfo/PersonalInformationOfPlayer";
import { useAppDispatch } from "../states/store";
import { RegularButton } from "../css/Button.styled";
import Diagramm from "../personalInfo/components/Diagramm";
import { useSetWidth } from "../utilities/useSetWidth";
import DetailedStats from "./DetailedStats";
import {
  selectDetailedStatsOfPlayer,
  setDetailedStatsOfPlayer,
} from "../states/slices/detailedStatsOfPlayerSlice";

export default function GamesStatistic() {
  const dispatch = useAppDispatch();
  const isBurger = useSetWidth() > 767;
  const listOfTeams = useSelector(selectListOfTeams);
  const playerInfo = useSelector(selectPlayerInfo);
  const filteredGamesStats = useSelector(selectFilteredGameStats);
  const detailedStatsOfPlayer = useSelector(selectDetailedStatsOfPlayer);
  const teamFilter = useSelector(selectorFilter);
  const [filter, setFilter] = useState("");
  const [filteredGames, setFilteredGames] = useState<TGameStats[]>([]);
  const [detailedStats, setDetailedStats] = useState<TPlayer[]>([]);
  const [choosenGameStats, setChoosenGameStats] = useState<TPlayer[]>([]);
  const [choosenSet, setChoosenSet] = useState<string>("full");
  const [saveFullGameStats, setSaveFullGameStats] = useState<TPlayer[]>([]);
  const [isBiggest, setIsBiggest] = useState<boolean>(false);

  function calculateForTeamData<T extends TMix>(obj: T): TMix {
    if (filter.length === 0) return obj;
    const teamName = filter.split(" ")[0];
    const filtered = listOfTeams.filter((team) => team.name === teamName);
    const team = { ...filtered[0] };
    const newObj = { ...obj };
    for (const key in team) {
      (team[key as keyof TMix] as number) = newObj[key as keyof T] as number;
    }
    return team;
  }
  function rankByValue<T extends TMix>(criteria: keyof TMix, arr: T[]) {
    const properArr = criteria === "name" ? choosenGameStats : arr;
    !isBiggest
      ? properArr.sort((a, b) =>
          compare(isFieldExist(b[criteria] as number), isFieldExist(a[criteria] as number))
        )
      : properArr.sort((a, b) =>
          compare(isFieldExist(a[criteria] as number), isFieldExist(b[criteria] as number))
        );
    setIsBiggest(!isBiggest);
  }

  function setFilterForGames(game: TGameStats) {
    setChoosenGameStats([]);
    if (filteredGames.some((match) => match === game)) {
      setFilteredGames(filteredGames.filter((match) => match !== game));
    } else {
      filteredGames.push(game);
      setFilteredGames(filteredGames);
    }
  }

  function setChoosenGames() {
    dispatch(setDetailedStatsOfPlayer(""));
    setChoosenSet("full");
    const choosenDetailedStats = filteredGames.map((set) => Object.values(set).flat()).flat();
    const flatFullSizeGameStat = choosenDetailedStats
      .map((rally) => Object.values(rally).flat())
      .flat();
    const finalResult = properStats(flatFullSizeGameStat.map((rall) => rall.stats).flat(), "+");
    setChoosenGameStats(finalResult);
    setDetailedStats(finalResult);
    if (filteredGames.length === 1) {
      setSaveFullGameStats(finalResult);
    }
  }

  // Обраховуємо повторних гравців
  function calculateForUnion<T extends TPlayer>(obj: T, fullObj: T, mark: "+" | "-") {
    const newObj = { ...obj };
    const newFullObj = { ...fullObj };
    for (const key in newObj) {
      if (key === "boardPosition" || key === "name") {
        continue;
      }
      if (!(key in newFullObj)) {
        (newFullObj[key] as number) = +newObj[key];
      } else if (key in newFullObj) {
        if (mark === "+") {
          (newFullObj[key] as number) += +newObj[key];
        }
        if (mark === "-") {
          (newFullObj[key] as number) -= +newObj[key];
        }
      }
    }
    return newFullObj;
  }

  //Обираємо потрібний сет
  function handleChoosenSet(e: ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    if (value === "full") {
      setChoosenSet(value);
      setChoosenGameStats(saveFullGameStats);
      return;
    }
    const soloGame = filteredGames.map((game) => Object.values(game).map((set) => set)).flat()[0];
    const properGame = soloGame.map((set) => Object.keys(set)[0]);
    const index = properGame.indexOf(value);
    const choosenSet = soloGame[index][value].map((rally) => rally.stats).flat();
    setChoosenGameStats(properStats(choosenSet, "+"));
    setChoosenSet(value);
  }

  function properStats(arr: TPlayer[], mark: "+" | "-"): TPlayer[] {
    let properGameStat: TPlayer[] = [];
    for (let i = 0; i < arr.length; i++) {
      const player = arr[i];
      if (
        properGameStat.some(
          (athlete) =>
            athlete.name === player.name && athlete.boardPosition === player.boardPosition
        )
      ) {
        const properPlayer = properGameStat.find(
          (athlete) =>
            athlete.name === player.name && athlete.boardPosition === player.boardPosition
        );
        const updatedPlayer = calculateForUnion(player, properPlayer!, mark);
        if (
          Object.entries(updatedPlayer)
            .filter(([key]) => key !== "boardPosition" && key !== "name")
            .every(([key, stat]) => stat === 0 && key)
        ) {
          properGameStat = properGameStat.filter((athlete) => athlete.name !== updatedPlayer.name);
        } else
          properGameStat = properGameStat.map((athlete) =>
            athlete.name === updatedPlayer.name &&
            athlete.boardPosition === updatedPlayer.boardPosition
              ? updatedPlayer
              : athlete
          );
      } else properGameStat = [...properGameStat, player];
    }
    return properGameStat;
  }

  function setGameFilterByTeam(name: string) {
    dispatch(setgameFilterByTeam(name));
    setFilteredGames([]);
    setChoosenGameStats([]);
    setFilter("");
  }

  const fullGameStats = calculateForTeamData(calculateTotalofActions(choosenGameStats) as TMix);
  const sortedGameStats = [...filteredGamesStats].sort((a, b) => compare(b, a));
  const namesOfTeams = listOfTeams.map((team) => team.name);
  const playersNames = choosenGameStats.map((player) => jusName(player));
  const soloGame = filteredGames.map((game) => Object.values(game).map((set) => set)).flat()[0];
  return (
    <article className="main-content-wrapper">
      <SectionWrapper className="ratings-section">
        {playerInfo ? (
          <PersonalInformationOfPlayer link="page1" />
        ) : (
          <>
            <nav>
              <div className="team-filter-wrapper">
                {namesOfTeams.map((name) => (
                  <div key={name}>
                    <RegularButton
                      onClick={() => setGameFilterByTeam(name)}
                      type="button"
                      $color={teamFilter.team === name ? "#ffd700" : "#0057b8"}
                      $background={teamFilter.team === name ? "#0057b8" : "#ffd700"}
                    >
                      {name}
                    </RegularButton>
                  </div>
                ))}
              </div>
              <div className="choosen-game-filter-wrapper">
                {sortedGameStats.map((game, index) => (
                  <div style={{ display: "flex" }} key={index}>
                    <input
                      onChange={() => setFilterForGames(game)}
                      value={Object.keys(game)}
                      type="checkbox"
                    />
                    <div>{Object.keys(game)}</div>
                  </div>
                ))}
                <RegularButton onClick={setChoosenGames} type="button">
                  Submit
                </RegularButton>
              </div>
              {filteredGames.length === 1 && choosenGameStats.length > 0 && (
                <div className="set-selection-wrapper">
                  {soloGame.map((set) => (
                    <div key={Object.keys(set)[0]}>
                      <div>{Object.keys(set)[0]}</div>
                      <input
                        type="checkbox"
                        value={Object.keys(set)[0]}
                        onChange={handleChoosenSet}
                        checked={Object.keys(set)[0] === choosenSet}
                      />
                    </div>
                  ))}
                  <div>
                    <div>Full game</div>
                    <input
                      type="checkbox"
                      value="full"
                      onChange={handleChoosenSet}
                      checked={"full" === choosenSet}
                    />
                  </div>
                </div>
              )}
            </nav>
            {choosenGameStats.length > 0 && (
              <>
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
                          filteredPlayers={choosenGameStats}
                          rankByValue={rankByValue}
                          categorys={categorys}
                        />
                        <Rows filteredPlayers={[fullGameStats]} lastRow={true} />
                      </tbody>
                    </table>
                    <div className="type-of-actions-wrapper">
                      <div className="reception-content">Reception</div>
                      <div className="attack-content">Attack</div>
                      <div className="service-content">Service</div>
                    </div>
                  </div>
                </div>
                {detailedStatsOfPlayer ? (
                  <DetailedStats detailedStats={detailedStats} />
                ) : (
                  <div
                    className="diagram-wrapper"
                    style={!isBurger ? { flexDirection: "column" } : {}}
                  >
                    <div style={{ width: "80%" }}>
                      <Diagramm link="Reception" data={fullGameStats} />
                    </div>
                    <div style={{ width: "80%" }}>
                      <Diagramm link="Attack" data={fullGameStats} />
                    </div>
                    <div style={{ width: "80%" }}>
                      <Diagramm link="Service" data={fullGameStats} />
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </SectionWrapper>
    </article>
  );
}
