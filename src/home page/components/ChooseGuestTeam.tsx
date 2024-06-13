import { useSelector } from "react-redux";
import { selectListOfTeams } from "../../states/slices/listOfTeamsSlice";
import { useAppDispatch } from "../../states/store";
import { TTeam } from "../../types/types";
import { setGuestTeam } from "../../states/slices/guestTeamSlice";
import { setGuestPlayers } from "../../states/slices/guestPlayersSlice";
import { selectListOfPlayers } from "../../states/slices/listOfPlayersSlice";
import { setBackGuestTeamSelects } from "../../states/slices/indexOfGuestTeamZonesSlice";
import { emptyPlayers } from "../../utilities/functions";

export function ChooseGuestTeam() {
  const dispatch = useAppDispatch();
  const listOfTeams = useSelector(selectListOfTeams);
  const listOfPlayers = useSelector(selectListOfPlayers);

  function handleSetOpponentTeam(club: TTeam) {
    const guestTeamPlayers = listOfPlayers.filter((player) => player.team === club.name);
    dispatch(setGuestPlayers(guestTeamPlayers));
    dispatch(setGuestTeam(club.name));
    dispatch(setBackGuestTeamSelects(emptyPlayers));
  }
  return (
    <nav className="opponentTeamList">
      {listOfTeams.length === 0 ? (
        <>
          <div>Sign up </div>
          <div>to get acces </div>
          <div>to Data </div>
        </>
      ) : (
        listOfTeams.map((team) => (
          <div className="nav-image-wrapper" key={team.id}>
            <img
              alt=""
              onClick={() => handleSetOpponentTeam(team)}
              className="Logo"
              src={team.logo}
            ></img>
          </div>
        ))
      )}
    </nav>
  );
}
