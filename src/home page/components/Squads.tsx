import { useSelector } from "react-redux";
import { useAppDispatch } from "../../states/store";
import SectionWrapper from "../../wrappers/SectionWrapper";
import { selectGuestTeam } from "../../states/slices/guestTeamSlice";
import { selectHomeTeam } from "../../states/slices/homeTeamSlice";
import {
  filterGuestPlayers,
  selectGuestPlayers,
  setGuestBenchPlayers,
} from "../../states/slices/guestPlayersSlice";
import { filterHomePlayers, selectHomePlayers } from "../../states/slices/homePlayersSlice";
import { ChangeEvent } from "react";
import { auth, teamsRef } from "../../config/firebase";
import {
  selectIndexOfHomeTeamZones,
  setHomeTeamIndexOfZones,
} from "../../states/slices/indexOfHomeTeamZonesSlice";
import {
  selectIndexOfGuestTeamZones,
  setGuestTeamIndexOfZones,
  showGuestTeamStartingSix,
} from "../../states/slices/indexOfGuestTeamZonesSlice";
import { setInfoOfPlayer } from "../../states/slices/playerInfoSlice";
import { useAuthState } from "react-firebase-hooks/auth";
import { RegularButton } from "../../css/Button.styled";
import { compare, isBoardFull } from "../../utilities/functions";
import { set } from "firebase/database";
import { TTeam } from "../../types/types";

type TSquadsProps = {
  team: string;
};

export function Squads(props: TSquadsProps) {
  const { team } = props;
  const dispatch = useAppDispatch();
  const guestTeam = useSelector(selectGuestTeam);
  const homeTeam = useSelector(selectHomeTeam);
  const guestPlayers = useSelector(selectGuestPlayers);
  const homePlayers = useSelector(selectHomePlayers);
  const guestTeamOptions = useSelector(selectIndexOfGuestTeamZones);
  const homeTeamOptions = useSelector(selectIndexOfHomeTeamZones);
  const [isRegistratedUser] = useAuthState(auth);
  const admin = isRegistratedUser?.uid === "wilxducX3TUUNOuv56GfqWpjMJD2";
  const myTeam = team === "my";
  const club = myTeam ? homeTeam[0] : guestTeam[0];
  const players = myTeam ? [...homePlayers] : [...guestPlayers];
  const teamOptions = myTeam ? [...homeTeamOptions] : [...guestTeamOptions];
  const showButtonStartingSix =
    !myTeam &&
    guestTeamOptions.every((zone) => typeof zone.boardPosition === "number") &&
    isRegistratedUser &&
    guestPlayers.length > 1;

  function homeTeamActions(event: ChangeEvent<HTMLSelectElement>) {
    setPlayerToHomeTeamBoard(event);
  }
  function setPlayerToHomeTeamBoard(event: ChangeEvent<HTMLSelectElement>) {
    const player = players.find((player) => player.name === event.target.value.split(",")[0]);
    if (player === undefined) return;
    dispatch(filterHomePlayers(event.target.value.split(",")[0]));
    const zone = +event.target.value.split(",")[1];
    dispatch(setHomeTeamIndexOfZones({ player, zone }));
  }
  function guestTeamActions(event: ChangeEvent<HTMLSelectElement>) {
    setPlayerToGuestTeamBoard(event);
  }
  function setPlayerToGuestTeamBoard(event: ChangeEvent<HTMLSelectElement>) {
    const player = players.find((player) => player.name === event.target.value.split(",")[0]);
    if (player === undefined) return;
    dispatch(filterGuestPlayers(event.target.value.split(",")[0]));
    const zone = +event.target.value.split(",")[1];
    dispatch(setGuestTeamIndexOfZones({ player, zone }));
  }
  function showStartingSix() {
    const guestTeamStartingSix = guestTeam[0].startingSquad;
    dispatch(showGuestTeamStartingSix({ guestPlayers, guestTeamStartingSix }));
    dispatch(setGuestBenchPlayers({ guestPlayers, guestTeamStartingSix }));
  }

  async function saveStartingSix() {
    await saveTeam({
      ...guestTeam[0],
      startingSquad: guestTeamOptions.map((player) => player.name),
    });
  }

  const saveTeam = async (team: TTeam) => {
    try {
      await set(teamsRef(team.id), team);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <SectionWrapper className="teamsquad-section">
      <div className="team-title-wrapper" style={myTeam ? { direction: "rtl" } : {}}>
        <div className="team-label-wrapper">
          <input className="team-label" readOnly value={club.name} />
        </div>
        <div className="team-logo-wrapper">
          <img className="team-logo" src={club.logo} alt="" />
        </div>
      </div>
      <div className="squad-wrapper">
        {players
          .sort((a, b) => compare(a.number, b.number))
          .map((player) => (
            <div
              key={player.name}
              className="player-field-wrapper"
              style={myTeam ? { direction: "rtl" } : {}}
            >
              <div className="playerNumber-wrapper">
                <button type="button" disabled className={myTeam ? "playerNumber" : ""}>
                  {player.number}
                </button>
              </div>
              <div className="player-surname-wrapper">
                <button
                  type="button"
                  className={myTeam ? "player-surname" : ""}
                  onClick={() => dispatch(setInfoOfPlayer(player))}
                >
                  {player.name}
                </button>
              </div>
              <div className="moveToBoard-wrapper">
                {teamOptions && (
                  <select
                    className="moveToBoard"
                    onChange={myTeam ? homeTeamActions : guestTeamActions}
                  >
                    {myTeam ? (
                      <option defaultValue="◀">◀</option>
                    ) : (
                      <option defaultValue="▶">▶</option>
                    )}
                    {teamOptions
                      .filter((option) => typeof option.boardPosition === "number")
                      .sort((a, b) => compare(a.boardPosition as number, b.boardPosition as number))
                      .map((option, index) => (
                        <option
                          key={index}
                          value={[player.name, JSON.stringify(option.boardPosition)]}
                        >
                          P{(option.boardPosition as number) + 1}
                        </option>
                      ))}
                  </select>
                )}
              </div>
            </div>
          ))}
        {showButtonStartingSix && (
          <RegularButton
            onClick={showStartingSix}
            type="button"
            $color="black"
            $background="#ffd700"
          >
            Starting six
          </RegularButton>
        )}
        {admin && isBoardFull(guestTeamOptions) && !myTeam && (
          <RegularButton
            onClick={saveStartingSix}
            type="button"
            $color="black"
            $background="#ffd700"
          >
            Save starting six
          </RegularButton>
        )}
      </div>
    </SectionWrapper>
  );
}
