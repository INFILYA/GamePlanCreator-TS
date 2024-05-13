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
import {
  calculateTotalofActions,
  compare,
  gerPercentOfAttack,
  getAttackEfficency,
  getPlusMinusAttack,
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
// import { set } from "firebase/database";
// import { auth } from "../config/firebase";
// import { useAuthState } from "react-firebase-hooks/auth";

export default function GamesStatistic() {
  const dispatch = useAppDispatch();
  // const [isRegistratedUser] = useAuthState(auth);
  const isBurger = useSetWidth() > 568;
  const gamesStats = useSelector(selectGamesStats);
  const listOfTeams = useSelector(selectListOfTeams);
  const playerInfo = useSelector(selectPlayerInfo);
  const filteredGamesStats = useSelector(selectFilteredGameStats);
  const teamFilter = useSelector(selectorFilter);
  const [filter, setFilter] = useState("");
  const [filteredGames, setFilteredGames] = useState<TObjectStats[]>([]);
  const [choosenGameStats, setChoosenGameStats] = useState<TMix[]>([]);
  const [saveFullGameStats, setSaveFullGameStats] = useState<TMix[]>([]);
  const [isBiggest, setIsBiggest] = useState<boolean>(false);
  // const admin = isRegistratedUser?.uid === "wilxducX3TUUNOuv56GfqWpjMJD2";

  // useEffect(() => {
  //   async function loadGames() {
  //     try {
  //       dispatch(fetchGamesStats());
  //     } catch (e) {
  //       console.error(e);
  //       alert("something go wrong");
  //     }
  //   }
  //   loadGames();
  // }, [dispatch]);

  function calculateForTeamData<T extends TMix>(obj: T): TMix {
    if (filter.length === 0) return obj;
    const teamName = filter.split(" ")[0];
    const filtered = listOfTeams.filter((team) => team.name === teamName);
    const team = { ...filtered[0] };
    const newObj = { ...obj };
    for (const key in team) {
      if (key === "id" || key === "startingSquad" || key === "name" || key === "logo") {
        continue;
      }
      (team[key as keyof TMix] as number) = newObj[key as keyof T] as number;
    }
    team.percentOfAttack = gerPercentOfAttack(team); //встановлюємо процент зйому
    team.plusMinusOnAttack = getPlusMinusAttack(team); //встановлюємо + - в атаці
    team.efficencyAttack = getAttackEfficency(team); // встановлюємо ефективність подачі
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
    setFilteredGames([...game]);
    const fullSizeGameStat: TPlayer[] = [];
    game.forEach((sets) =>
      Object.values(sets).forEach((set) => set.forEach((player) => fullSizeGameStat.push(player)))
    );
    let properGameStat: TPlayer[] = [];
    for (let i = 0; i < fullSizeGameStat.length; i++) {
      const player = fullSizeGameStat[i];
      if (properGameStat.some((athlete) => athlete.name === player.name)) {
        const properPlayer = properGameStat.find((athlete) => athlete.name === player.name);
        if (!properPlayer) return;
        const updatedPlayer = calculateForUnion(player, properPlayer);
        properGameStat = properGameStat.map((athlete) =>
          athlete.name === updatedPlayer.name ? updatedPlayer : athlete
        );
      } else properGameStat = [...properGameStat, player];
    }
    setChoosenGameStats(properGameStat);
    setSaveFullGameStats(properGameStat);
    console.log(game);
  }
  // Обраховуємо повторних гравців
  function calculateForUnion<T extends TMix>(obj: T, fullObj: T) {
    const newObj = { ...obj };
    const newFullObj = { ...fullObj };
    for (const key in newFullObj) {
      if (
        key === "attacksInBlock" ||
        key === "loosePoints" ||
        key === "winPoints" ||
        key === "leftInGame"
      ) {
        (newFullObj[key as keyof TMix] as number) += newObj[key as keyof T] as number;
      } else continue;
    }
    newFullObj.percentOfAttack = gerPercentOfAttack(newFullObj); //встановлюємо процент зйому
    newFullObj.plusMinusOnAttack = getPlusMinusAttack(newFullObj); //встановлюємо + - в атаці
    newFullObj.efficencyAttack = getAttackEfficency(newFullObj); // встановлюємо ефективність подачі
    return newFullObj;
  }

  //Обираємо потрібний сет
  function handleChoosenSet(e: ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    if (value === "full") {
      setChoosenGameStats(saveFullGameStats);
      return;
    }
    const isFullGame = filteredGames.map((game) => Object.keys(game)[0]);
    const index = isFullGame.indexOf(value);
    setChoosenGameStats(filteredGames[index][value as keyof TObjectStats]);
  }

  function setGameFilterByTeam(name: string) {
    dispatch(setgameFilterByTeam(name));
    setFilteredGames([]);
    setChoosenGameStats([]);
    setFilter("");
  }

  // async function saveGame() {
  //   const choosen = gamesStats.find((game) => Object.keys(game).find((name) => name === filter));
  //   if (!choosen) return;
  //   await set(gamesRef(filter), choosen);
  // }

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
                            checked={Object.values(set)[0] === choosenGameStats}
                          />
                        </div>
                      ))}
                      <div>
                        <div>Full game</div>
                        <input
                          type="checkbox"
                          value="full"
                          onChange={handleChoosenSet}
                          checked={saveFullGameStats === choosenGameStats}
                        />
                      </div>
                    </div>
                  )}
                </nav>
              </caption>
              <tbody className="rating-table-wrapper">
                <Categorys filteredPlayers={choosenGameStats} rankByValue={rankByValue} />
                {filter && <Rows filteredPlayers={[fullGameStats]} lastRow={true} />}
              </tbody>
            </table>
            {filter && (
              <div className="diagram-wrapper">
                <div className="diagram-content" style={!isBurger ? { width: "80%" } : {}}>
                  <Diagramm link="Attack" data={fullGameStats} />
                </div>
              </div>
            )}
            {/* {admin && (
                  <RegularButton onClick={() => saveGame()} type="button">
                    save game
                  </RegularButton>
                )} */}
          </>
        )}
      </SectionWrapper>
    </article>
  );
}
