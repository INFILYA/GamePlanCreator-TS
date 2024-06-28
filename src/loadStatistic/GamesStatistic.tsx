import { useSelector } from "react-redux";
import {
  selectFilteredGameStats,
  selectGamesStats,
  selectorFilter,
  setgameFilterByTeam,
} from "../states/slices/gamesStatsSlice";
import { ChangeEvent, useState } from "react";
import { TMix, TObjectStats, TPlayer } from "../types/types";
import SectionWrapper from "../wrappers/SectionWrapper";
import { calculateTotalofActions, compare } from "../utilities/functions";
import { Categorys } from "../ratings/components/Categorys";
import { Rows } from "../ratings/components/Rows";
import { selectListOfTeams } from "../states/slices/listOfTeamsSlice";
import { selectPlayerInfo } from "../states/slices/playerInfoSlice";
import { PersonalInformationOfPlayer } from "../personalInfo/PersonalInformationOfPlayer";
import { useAppDispatch } from "../states/store";
import { RegularButton } from "../css/Button.styled";
import Diagramm from "../personalInfo/components/Diagramm";
import { useSetWidth } from "../utilities/useSetWidth";

export default function GamesStatistic() {
  const dispatch = useAppDispatch();
  const isBurger = useSetWidth() > 767;
  const gamesStats = useSelector(selectGamesStats);
  const listOfTeams = useSelector(selectListOfTeams);
  const playerInfo = useSelector(selectPlayerInfo);
  const filteredGamesStats = useSelector(selectFilteredGameStats);
  const teamFilter = useSelector(selectorFilter);
  const [filter, setFilter] = useState("");
  const [filteredGames, setFilteredGames] = useState<TObjectStats[]>([]);
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

  function rankByValue<T extends TMix>(criteria: keyof T, arr: T[]) {
    !isBiggest
      ? arr.sort((a, b) => compare(b[criteria], a[criteria]))
      : arr.sort((a, b) => compare(a[criteria], b[criteria]));
    setIsBiggest(!isBiggest);
  }

  function handleGameFilter(e: ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    setFilter(value);
    setFilteredGames([]);
    setChoosenGameStats([]);
    const choosenGame = gamesStats.find((game) => Object.keys(game).find((name) => name === value));
    if (!choosenGame) return;
    const game = Object.values(choosenGame)[0];
    console.log(game);
    setFilteredGames([...game]);
    const fullSizeGameStat: TPlayer[][] = [];
    game.forEach((sets) =>
      Object.values(sets).forEach((set) =>
        Object.values(set).forEach((player) => fullSizeGameStat.push(player.stats))
      )
    );
    const flatFullSizeGameStat = fullSizeGameStat.flat();
    setChoosenGameStats(properStats(flatFullSizeGameStat));
    setSaveFullGameStats(properStats(flatFullSizeGameStat));
  }
  // Обраховуємо повторних гравців
  function calculateForUnion<T extends TPlayer>(obj: T, fullObj: T) {
    const newObj = { ...obj };
    const newFullObj = { ...fullObj };
    for (const key in newObj) {
      if (key === "boardPosition" || key === "name") {
        continue;
      }
      if (!(key in newFullObj)) {
        (newFullObj[key] as number) = +newObj[key];
      } else if (key in newFullObj) {
        (newFullObj[key] as number) += +newObj[key];
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
    const isFullGame = filteredGames.map((game) => Object.keys(game)[0]);
    const index = isFullGame.indexOf(value);
    const choosenSet = filteredGames[index][value].map((rally) => rally.stats);
    setChoosenGameStats(properStats(choosenSet.flat()));
    setChoosenSet(value);
  }

  function properStats(arr: TPlayer[]): TPlayer[] {
    let properGameStat: TPlayer[] = [];
    for (let i = 0; i < arr.length; i++) {
      const player = arr[i];
      if (properGameStat.some((athlete) => athlete.name === player.name)) {
        const properPlayer = properGameStat.find((athlete) => athlete.name === player.name);
        const updatedPlayer = calculateForUnion(player, properPlayer!);
        properGameStat = properGameStat.map((athlete) =>
          athlete.name === updatedPlayer.name ? updatedPlayer : athlete
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

  return (
    <article className="main-content-wrapper">
      <SectionWrapper className="ratings-section">
        {playerInfo ? (
          <PersonalInformationOfPlayer link="page1" />
        ) : (
          <>
            <table>
              <caption className="showRatings-wrapper">
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
                    <select onChange={handleGameFilter} value={filter}>
                      <option value="">Choose Game ({sortedGameStats.length})</option>
                      {sortedGameStats.map((game, index) => (
                        <option value={Object.keys(game)} key={index}>
                          {Object.keys(game)}
                        </option>
                      ))}
                    </select>
                  </div>
                  {filteredGames.length !== 0 && (
                    <div className="set-selection-wrapper">
                      {filteredGames.map((set) => (
                        <div key={Object.keys(set)[0]}>
                          <div>{Object.keys(set)}</div>
                          <input
                            type="checkbox"
                            value={Object.keys(set)}
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
              </caption>
              {filter && (
                <tbody className="rating-table-wrapper">
                  <Categorys filteredPlayers={choosenGameStats} rankByValue={rankByValue} />
                  <Rows filteredPlayers={[fullGameStats]} lastRow={true} />
                </tbody>
              )}
            </table>
            {filter && (
              <>
                <div className="type-of-actions-wrapper">
                  <div className="service-content">Service</div>
                  <div className="attack-content">Attack</div>
                  <div className="reception-content">Reception</div>
                </div>
                <div
                  className="diagram-wrapper"
                  style={!isBurger ? { flexDirection: "column" } : {}}
                >
                  <div style={{ width: "80%" }}>
                    <Diagramm link="Service" data={fullGameStats} />
                  </div>
                  <div style={{ width: "80%" }}>
                    <Diagramm link="Attack" data={fullGameStats} />
                  </div>
                  <div style={{ width: "80%" }}>
                    <Diagramm link="Reception" data={fullGameStats} />
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
