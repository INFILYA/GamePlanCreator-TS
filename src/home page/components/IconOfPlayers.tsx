import { TAttackDiagramm, TDiagramm, TMix, TPlayer } from "../../types/types";
import { useAppDispatch } from "../../states/store";
import { setInfoOfPlayer } from "../../states/slices/playerInfoSlice";
import { pushFromHomeTeamBoard } from "../../states/slices/homePlayersSlice";
import { pushFromGuestTeamBoard } from "../../states/slices/guestPlayersSlice";
import {
  resetHomeTeamIndexOfZones,
  updateInfoOfSubPlayers,
} from "../../states/slices/indexOfHomeTeamZonesSlice";
import {
  resetGuestTeamIndexOfZones,
  selectIndexOfGuestTeamZones,
  updateInfoOfStartingSix,
} from "../../states/slices/indexOfGuestTeamZonesSlice";
import { useEffect, useState } from "react";
import { setUpdatedPlayers } from "../../states/slices/listOfPlayersSlice";
import {
  correctZones,
  emptyPlayer,
  forSoloGameStat,
  preparePlayerToSoloGame,
  zones,
} from "../../utilities/functions";
import { setSoloRallyStats } from "../../states/slices/soloRallyStatsSlice";
import { useSelector } from "react-redux";

type TIconOfPlayer = {
  type: string;
  startingSix: TPlayer[];
  player: TPlayer;
  SoloRallyStats: TPlayer[];
  showSquads: boolean;
  nextRotation: boolean;
  setNextRotation(arg: boolean): void;
};

export function IconOfPlayer(props: TIconOfPlayer) {
  const { player, nextRotation, setNextRotation, startingSix, type, showSquads } = props;
  const dispatch = useAppDispatch();
  const guestTeamOptions = useSelector(selectIndexOfGuestTeamZones);
  const [category, setCategory] = useState<string>("AS");
  const [diagrammValue, setDiagrammValue] = useState<TMix>(emptyPlayer);
  const my = type === "my";

  useEffect(() => {
    const choosenPlayer = startingSix.filter((athlete) => athlete.name === player.name);
    const soloGamePlayerStats = preparePlayerToSoloGame(choosenPlayer[0]);
    if (nextRotation) {
      setDiagrammValue(soloGamePlayerStats);
      setNextRotation(false);
    }
  }, [player, startingSix, nextRotation, setNextRotation]);

  function calculateForPlayerData<T extends TMix>(
    obj: T,
    diagram: TDiagramm,
    soloGame?: boolean
  ): T {
    for (const key in diagram) {
      if (!soloGame) {
        if (
          key === "blocks" ||
          key === "A-" ||
          key === "A=" ||
          key === "A+" ||
          key === "A++" ||
          key === "A!" ||
          key === "S++" ||
          key === "S=" ||
          key === "S!" ||
          key === "S+" ||
          key === "S-" ||
          key === "R++" ||
          key === "R=" ||
          key === "R!" ||
          key === "R+" ||
          key === "R-"
        ) {
          (obj[key as keyof T] as number) += diagram[key as keyof TAttackDiagramm];
        } else continue;
      }
      if (soloGame) {
        (obj[key as keyof T] as number) = diagram[key as keyof TAttackDiagramm];
      }
    }
    return obj;
  }

  function cancelGuestTeamChoice(player: TPlayer) {
    if (showSquads) {
      dispatch(pushFromGuestTeamBoard(player));
      dispatch(resetGuestTeamIndexOfZones({ startingSix, player }));
    }
  }
  function cancelHomeTeamChoice(player: TPlayer) {
    if (showSquads) {
      dispatch(pushFromHomeTeamBoard(player));
      dispatch(resetHomeTeamIndexOfZones({ startingSix, player }));
    }
  }

  function showPlayerInfo() {
    if (showSquads) {
      dispatch(setInfoOfPlayer(player));
    }
  }

  function addAmount(type: keyof TMix, number: number) {
    if (diagrammValue[type] === 0 && number === -1) return;
    if (
      !(type === "A-" || type === "A+" || type === "A!") &&
      diagrammValue[type] === 1 &&
      number === 1
    )
      return;
    setDiagrammValue({
      ...diagrammValue,
      [type]: +diagrammValue[type] + number,
    });
    const obj = { [type]: number } as TDiagramm;
    const updatedPlayer = calculateForPlayerData({ ...player }, obj);
    const soloGameUpdatedPlayer = calculateForPlayerData(
      { ...player },
      {
        ...diagrammValue,
        [type]: diagrammValue[type as keyof TDiagramm] + number,
      },
      true
    );
    const seTTer = guestTeamOptions.find((plaer) => plaer.position === "SET");
    if (!seTTer) return;
    const indexOfSetter = guestTeamOptions.indexOf(seTTer);
    startingSix.forEach(
      (player, index) =>
        player.name === soloGameUpdatedPlayer.name &&
        dispatch(
          setSoloRallyStats(
            forSoloGameStat({
              ...soloGameUpdatedPlayer,
              boardPosition: zones[index],
              setterBoardPosition: correctZones(indexOfSetter),
            })
          )
        )
    );
    dispatch(setUpdatedPlayers(updatedPlayer));
    dispatch(setInfoOfPlayer(updatedPlayer));
    dispatch(updateInfoOfStartingSix(updatedPlayer));
    dispatch(updateInfoOfSubPlayers(updatedPlayer));
  }

  if (typeof player === "number" || player === null) return;
  const condition = player.number !== 0;
  const attackGradations = properArr("A");

  const AttackService = category === "AS";
  const ReceptionBlock = category === "RB";
  const serviceGradations = ReceptionBlock ? properArr("R") : properArr("S");
  function properArr(letter: string) {
    const arr = [
      [`${letter}++`, "lightgreen", "#"],
      [`${letter}+`, "aquamarine", "+"],
      [`${letter}!`, "yellow", "!"],
      [`${letter}-`, "orange", "-"],
      [`${letter}=`, "orangered", "="],
    ];
    return arr;
  }

  return (
    <>
      {condition && (
        <div className="card-content">
          {!my && (
            <div className="player-image-wrapper" onClick={showPlayerInfo}>
              <img src={`/photos/${player?.photo}`} alt=""></img>
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
                {player.number}
              </button>
            </div>
            <div className="player-surname-wrapper">
              <button
                type="button"
                className="player-surname"
                style={my ? { backgroundColor: "#a9a9a9" } : {}}
                onClick={showPlayerInfo}
              >
                {player.name}
              </button>
            </div>
          </div>
          {!showSquads && (
            <div className="errors-field-wrapper">
              <div className="category-switcher-wrapper">
                <select onChange={(e) => setCategory(e.target.value)}>
                  <option value={"AS"}>Attack & Service</option>
                  <option value={"RB"}>Recep & block</option>
                </select>
              </div>
              <div style={{ display: "flex" }}>
                <table>
                  <tbody>
                    <tr>
                      <th>+</th>
                      <th>{AttackService ? "A" : "Bl"}</th>
                      <th>-</th>
                    </tr>
                    {AttackService ? (
                      attackGradations.map((grade) => (
                        <tr key={grade[0]}>
                          <td
                            style={{ backgroundColor: grade[1] }}
                            onClick={() => addAmount(grade[0] as keyof TMix, 1)}
                          >
                            {grade[2]}
                          </td>
                          <td>
                            <input
                              type="text"
                              min={0}
                              value={diagrammValue[grade[0] as keyof TMix]}
                              name={grade[0]}
                              readOnly
                            />
                          </td>
                          <td
                            style={{ backgroundColor: grade[1] }}
                            onClick={() => addAmount(grade[0] as keyof TMix, -1)}
                          >
                            -
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          style={{ backgroundColor: "llightgreen" }}
                          onClick={() => addAmount("blocks", 1)}
                        >
                          B
                        </td>
                        <td>
                          <input
                            type="text"
                            min={0}
                            value={diagrammValue.blocks}
                            name="blocks"
                            readOnly
                          />
                        </td>
                        <td
                          style={{ backgroundColor: "llightgreen" }}
                          onClick={() => addAmount("blocks", -1)}
                        >
                          -
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                <div className="border-wrapper"></div>
                <table>
                  <tbody>
                    <tr>
                      <th>+</th>
                      <th>{AttackService ? "S" : "R"}</th>
                      <th>-</th>
                    </tr>
                    {serviceGradations.map((grade) => (
                      <tr key={grade[0]}>
                        <td
                          style={{ backgroundColor: grade[1] }}
                          onClick={() => addAmount(grade[0] as keyof TMix, 1)}
                        >
                          {grade[2]}
                        </td>
                        <td>
                          <input
                            type="text"
                            min={0}
                            value={diagrammValue[grade[0] as keyof TAttackDiagramm]}
                            name={grade[0]}
                            readOnly
                          />
                        </td>
                        <td
                          style={{ backgroundColor: grade[1] }}
                          onClick={() => addAmount(grade[0] as keyof TMix, -1)}
                        >
                          -
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
