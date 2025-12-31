import { useSelector } from "react-redux";
import { useAppDispatch } from "../../states/store";
import SectionWrapper from "../../wrappers/SectionWrapper";
import { selectGuestTeam } from "../../states/slices/guestTeamSlice";
import { selectHomeTeam } from "../../states/slices/homeTeamSlice";
import {
  pushFromGuestTeamBoard,
  selectGuestPlayers,
  setGuestBenchPlayers,
} from "../../states/slices/guestPlayersSlice";
import {
  pushFromHomeTeamBoard,
  selectHomePlayers,
} from "../../states/slices/homePlayersSlice";
import { useState, useRef, useEffect } from "react";
import { teamsRef } from "../../config/firebase";
import {
  resetHomeTeamIndexOfZones,
  selectIndexOfHomeTeamZones,
} from "../../states/slices/indexOfHomeTeamZonesSlice";
import {
  resetGuestTeamIndexOfZones,
  selectIndexOfGuestTeamZones,
  showGuestTeamStartingSix,
} from "../../states/slices/indexOfGuestTeamZonesSlice";
import { setInfoOfPlayer } from "../../states/slices/playerInfoSlice";
// import { useAuthState } from "react-firebase-hooks/auth";
import { RegularButton } from "../../css/Button.styled";
import { compare, isBoardFull } from "../../utilities/functions";
import { set } from "firebase/database";
import { TTeam, TPlayer } from "../../types/types";

type TSquadsProps = {
  team: string;
};

type PlayerNameButtonProps = {
  player: TPlayer;
  myTeam: boolean;
  onPlayerClick: () => void;
};

function PlayerNameButton({
  player,
  myTeam,
  onPlayerClick,
}: PlayerNameButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [displayName, setDisplayName] = useState(player.name);

  useEffect(() => {
    if (!buttonRef.current) return;

    const checkOverflow = () => {
      const button = buttonRef.current;
      if (!button) return;

      // Получаем стили кнопки для точного измерения
      const buttonStyles = window.getComputedStyle(button);
      const paddingLeft = parseFloat(buttonStyles.paddingLeft) || 0;
      const paddingRight = parseFloat(buttonStyles.paddingRight) || 0;
      const availableWidth = button.clientWidth - paddingLeft - paddingRight;

      // Создаем временный элемент для измерения ширины полного имени
      const tempSpan = document.createElement("span");
      tempSpan.style.visibility = "hidden";
      tempSpan.style.position = "absolute";
      tempSpan.style.whiteSpace = "nowrap";
      tempSpan.style.fontSize = buttonStyles.fontSize;
      tempSpan.style.fontWeight = buttonStyles.fontWeight;
      tempSpan.style.fontFamily = buttonStyles.fontFamily;
      tempSpan.style.fontStyle = buttonStyles.fontStyle;
      tempSpan.style.letterSpacing = buttonStyles.letterSpacing;
      tempSpan.textContent = player.name;
      document.body.appendChild(tempSpan);

      const fullNameWidth = tempSpan.offsetWidth;
      document.body.removeChild(tempSpan);

      // Проверяем, помещается ли полное имя
      if (fullNameWidth > availableWidth) {
        // Если не помещается, показываем только имя (первое слово)
        const firstName = player.name.split(" ")[0];
        setDisplayName(firstName);
      } else {
        // Если помещается, показываем полное имя
        setDisplayName(player.name);
      }
    };

    // Проверяем после небольшой задержки, чтобы DOM обновился
    const timeoutId = setTimeout(checkOverflow, 50);

    // Проверяем при изменении размера окна
    const resizeObserver = new ResizeObserver(() => {
      setTimeout(checkOverflow, 50);
    });
    if (buttonRef.current) {
      resizeObserver.observe(buttonRef.current);
    }

    // Также проверяем при изменении размера окна браузера
    window.addEventListener("resize", checkOverflow);

    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
      window.removeEventListener("resize", checkOverflow);
    };
  }, [player.name]);

  return (
    <div className="player-surname-wrapper">
      <button
        ref={buttonRef}
        type="button"
        className={myTeam ? "player-surname" : ""}
        onClick={onPlayerClick}
        style={
          player.position === "LIB" ? { backgroundColor: "turquoise" } : {}
        }
        title={player.name}
      >
        {displayName}
      </button>
    </div>
  );
}

export function Squads(props: TSquadsProps) {
  const { team } = props;
  const dispatch = useAppDispatch();
  const guestTeam = useSelector(selectGuestTeam);
  const homeTeam = useSelector(selectHomeTeam);
  const guestPlayers = useSelector(selectGuestPlayers);
  const homePlayers = useSelector(selectHomePlayers);
  const guestTeamOptions = useSelector(selectIndexOfGuestTeamZones);
  const homeTeamOptions = useSelector(selectIndexOfHomeTeamZones);
  // const [isRegistratedUser] = useAuthState(auth);
  // const admin =
  //   isRegistratedUser?.uid === "wilxducX3TUUNOuv56GfqWpjMJD2" ||
  //   isRegistratedUser?.uid === "wFlNnrG4piWkebseNPzDW1qejC22" ||
  //   isRegistratedUser?.uid === "ehKOX9XhJpgfCRR2iRquHlGWO2n2";
  const myTeam = team === "my";
  const club = myTeam ? homeTeam[0] : guestTeam[0];
  const players = myTeam ? [...homePlayers] : [...guestPlayers];
  const showButtonStartingSix =
    !myTeam &&
    guestTeamOptions.every((zone) => typeof zone.boardPosition === "number") &&
    guestPlayers.length > 1;

  // Drag and Drop handlers для переноса игрока на playground
  function handleDragStart(e: React.DragEvent, player: TPlayer) {
    e.dataTransfer.setData("player", JSON.stringify(player));
    e.dataTransfer.setData("team", myTeam ? "my" : "rival");
    e.dataTransfer.effectAllowed = "move";
  }

  // Drop handler для возврата игрока в squads
  function handleDropOnSquad(e: React.DragEvent) {
    e.preventDefault();
    const playerData = e.dataTransfer.getData("player");
    if (!playerData) return;

    const player = JSON.parse(playerData) as TPlayer;
    const team = e.dataTransfer.getData("team");
    const currentZone = e.dataTransfer.getData("currentZone");

    // Проверяем, что это возврат игрока (есть currentZone)
    if (currentZone) {
      if (team === "my") {
        dispatch(pushFromHomeTeamBoard(player));
        // Находим startingSix для resetHomeTeamIndexOfZones
        const startingSix = homeTeamOptions.filter(
          (p) => typeof p.boardPosition === "number"
        );
        dispatch(resetHomeTeamIndexOfZones({ startingSix, player }));
      } else {
        dispatch(pushFromGuestTeamBoard(player));
        const startingSix = guestTeamOptions.filter(
          (p) => typeof p.boardPosition === "number"
        );
        dispatch(resetGuestTeamIndexOfZones({ startingSix, player }));
      }
    }
  }

  function handleDragOverOnSquad(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
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

  // function addteam() {
  //   const creeNew = (Team: TTeam) => {
  //     const guestTeamNew = {} as TTeam;
  //     guestTeamNew["A++"] = 0;
  //     guestTeamNew["A+"] = 0;
  //     guestTeamNew["A="] = 0;
  //     guestTeamNew["A!"] = 0;
  //     guestTeamNew["A-"] = 0;
  //     guestTeamNew["S++"] = 0;
  //     guestTeamNew["S!"] = 0;
  //     guestTeamNew["S="] = 0;
  //     guestTeamNew["S-"] = 0;
  //     guestTeamNew["S+"] = 0;
  //     guestTeamNew["R++"] = 0;
  //     guestTeamNew["R!"] = 0;
  //     guestTeamNew["R="] = 0;
  //     guestTeamNew["R-"] = 0;
  //     guestTeamNew["R+"] = 0;
  //     guestTeamNew.blocks = 0;
  //     guestTeamNew.name = "Warriors-17U";
  //     guestTeamNew.logo = Team.logo;
  //     guestTeamNew.id = "Warriors-17U";
  //     guestTeamNew.startingSquad = Team.startingSquad;
  //     return guestTeamNew;
  //   };
  //   async function setTeamToData(team: TTeam) {
  //     try {
  //       await set(teamsRef("Warriors-17U"), team);
  //     } catch (error) {
  //       console.error(error);
  //     }
  //   }
  //   setTeamToData(creeNew(guestTeam[0]));
  // }
  // add TEAM

  return (
    <SectionWrapper
      className={`teamsquad-section ${myTeam ? "my-team" : "rival-team"}`}
    >
      <div
        className="team-title-wrapper"
        style={myTeam ? { direction: "rtl" } : {}}
      >
        <div className="team-label-wrapper">
          <input className="team-label" readOnly value={club.name} />
        </div>
        <div className="team-logo-wrapper">
          <img className="team-logo" src={club.logo} alt="" />
        </div>
      </div>
      <div
        className="squad-wrapper"
        onDrop={handleDropOnSquad}
        onDragOver={(e) => {
          handleDragOverOnSquad(e);
        }}
      >
        {players
          .sort((a, b) => compare(a.number, b.number))
          .map((player) => (
            <div
              key={player.name}
              className="player-field-wrapper"
              draggable={true}
              onDragStart={(e) => handleDragStart(e, player)}
              style={{
                ...(myTeam ? { direction: "rtl" } : {}),
                cursor: "grab",
              }}
            >
              <div className="playerNumber-wrapper">
                <button
                  type="button"
                  disabled
                  className={myTeam ? "playerNumber" : ""}
                >
                  {player.number}
                </button>
              </div>
              <PlayerNameButton
                player={player}
                myTeam={myTeam}
                onPlayerClick={() => dispatch(setInfoOfPlayer(player))}
              />
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
        {isBoardFull(guestTeamOptions) && !myTeam && (
          <RegularButton
            onClick={saveStartingSix}
            type="button"
            $color="black"
            $background="#ffd700"
          >
            Save starting six
          </RegularButton>
        )}
        {/* <RegularButton
          onClick={addteam}
          type="button"
          $color="black"
          $background="#ffd700"
        >
          add team
        </RegularButton> */}
      </div>
    </SectionWrapper>
  );
}
