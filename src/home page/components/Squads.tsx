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
import { auth } from "../../config/firebase";
import {
  selectIndexOfHomeTeamZones,
  setHomeTeamIndexOfZones,
} from "../../states/slices/indexOfHomeTeamZonesSlice";
import {
  selectIndexOfGuestTeamZones,
  setGuestTeamIndexOfZones,
  showGuestTeamStartingSix,
} from "../../states/slices/indexOfGuestTeamZonesSlice";
import { selectPlayerInfo, setInfoOfPlayer } from "../../states/slices/playerInfoSlice";
import { useAuthState } from "react-firebase-hooks/auth";
import { RegularButton } from "../../css/Button.styled";
import { compare } from "../../utilities/functions";

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
  const playerInfo = useSelector(selectPlayerInfo);
  const [isRegistratedUser] = useAuthState(auth);
  const myTeam = team === "my";
  const club = myTeam ? homeTeam[0] : guestTeam[0];
  const players = myTeam ? [...homePlayers] : [...guestPlayers];
  const teamOptions = myTeam ? [...homeTeamOptions] : [...guestTeamOptions];
  const showButtonStartingSix =
    !myTeam &&
    guestTeamOptions.every((zone) => typeof zone.boardPosition === "number") &&
    isRegistratedUser &&
    guestPlayers.length > 1 &&
    playerInfo;
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
  console.log(guestPlayers);
  return (
    <SectionWrapper
      className="teamsquad-section"
      content={
        <>
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
                      {/* {player.number > 9 ? player.number : `0${player.number}`} */}
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
                          .sort((a, b) =>
                            compare(a.boardPosition as number, b.boardPosition as number)
                          )
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
          </div>
        </>
      }
    />
  );
}
