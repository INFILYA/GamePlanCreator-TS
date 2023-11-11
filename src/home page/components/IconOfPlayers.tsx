import { TPlayer } from "../../types/types";
import { useAppDispatch } from "../../states/store";
import { setInfoOfPlayer } from "../../states/slices/playerInfoSlice";
import { pushFromHomeTeamBoard } from "../../states/slices/homePlayersSlice";
import { pushFromGuestTeamBoard } from "../../states/slices/guestPlayersSlice";
import { resetHomeTeamIndexOfZones } from "../../states/slices/indexOfHomeTeamZonesSlice";
import { resetGuestTeamIndexOfZones } from "../../states/slices/indexOfGuestTeamZonesSlice";

type TIconOfPlayer = {
  type: string;
  key: number;
  startingSix: TPlayer[];
  player: TPlayer;
};

export function IconOfPlayer(props: TIconOfPlayer) {
  const { player, startingSix, type } = props;
  const dispatch = useAppDispatch();
  const my = type === "my";

  function cancelGuestTeamChoice(player: TPlayer) {
    dispatch(pushFromGuestTeamBoard(player));
    dispatch(resetGuestTeamIndexOfZones({ startingSix, player }));
  }
  function cancelHomeTeamChoice(player: TPlayer) {
    dispatch(pushFromHomeTeamBoard(player));
    dispatch(resetHomeTeamIndexOfZones({ startingSix, player }));
  }
  if (typeof player === "number" || player === null) return;
  const condition = player.number !== 0;
  return (
    <>
      {condition && (
        <div className="card-content">
          {!my && (
            <div className="player-image-wrapper" onClick={() => dispatch(setInfoOfPlayer(player))}>
              <img src={player?.photo} alt=""></img>
            </div>
          )}
          <div className="player-field-wrapper">
            <div className="playerNumber-wrapper">
              <button
                type="button"
                style={my ? { backgroundColor: "#f0f" } : {}}
                onClick={
                  !my ? () => cancelGuestTeamChoice(player) : () => cancelHomeTeamChoice(player)
                }
              >
                {player.number > 9 ? player.number : `0${player.number}`}
              </button>
            </div>
            <div className="player-surname-wrapper">
              <button
                type="button"
                className="player-surname"
                style={my ? { backgroundColor: "#a9a9a9" } : {}}
                onClick={() => dispatch(setInfoOfPlayer(player))}
              >
                {player.name}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
