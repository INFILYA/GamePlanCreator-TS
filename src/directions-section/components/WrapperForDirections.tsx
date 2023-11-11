import { useState, ChangeEvent, FormEvent, CSSProperties } from "react";
import { useDispatch, useSelector } from "react-redux";
import { doc, setDoc } from "firebase/firestore";
import { dataBase } from "../../config/firebase";
import { selectUserVersion, setUserVersion } from "../../states/slices/userVersionSlice";
import { selectListOfPlayers, setAllPlayers } from "../../states/slices/listOfPlayersSlice";
import { setInfoOfPlayer } from "../../states/slices/playerInfoSlice";
import { selectListOfTeams, setAllTeams } from "../../states/slices/listOfTeamsSlice";
import { Balls } from "./innerComponents/Balls";
import { CheckEquality } from "./innerComponents/CheckEquality";
import { Reaction } from "./innerComponents/Reaction";
import { InputForCount } from "./innerComponents/inputForCount";
import SectionWrapper from "../../wrappers/SectionWrapper";
import { reduce, upgradeAge } from "../../utilities/functions";
import { Explain } from "./innerComponents/Explain";
import { selectGuestPlayers, setGuestPlayers } from "../../states/slices/guestPlayersSlice";
import { selectHomePlayers, setHomePlayers } from "../../states/slices/homePlayersSlice";
import {
  TAttackDiagramm,
  TDiagramm,
  TPlayer,
  TServiceDiagramm,
  TTeam,
  TZoneStates,
  TZoneValue,
} from "../../types/types";

type TWrapperForDirections = {
  diagrammValue: TDiagramm;
  setDiagrammValue(value: TDiagramm): void;
  calculateForData<T extends TTeam | TPlayer>(obj: T): T;
  zonesStates: TZoneStates[];
  setZonesStates(arg: TZoneStates[]): void;
  playerInfo: TPlayer;
  type: "Attack" | "Service";
};

export default function WrapperForDirections(props: TWrapperForDirections) {
  const {
    diagrammValue,
    setDiagrammValue,
    calculateForData,
    zonesStates,
    setZonesStates,
    playerInfo,
    type,
  } = props;
  const dispatch = useDispatch();
  const allTeams = useSelector(selectListOfTeams);
  const allPlayers = useSelector(selectListOfPlayers);
  const userVersion = useSelector(selectUserVersion);
  const guestPlayers = useSelector(selectGuestPlayers);
  const homePlayers = useSelector(selectHomePlayers);
  const [isShowDataOfActions, setIsShowDataOfActions] = useState<boolean>(false);
  const [isSaveDataOfActions, setIsSaveDataOfActions] = useState<boolean>(false);
  const [previousPlayerData, setPreviousPlayerData] = useState<TPlayer | null>(null);
  const [previousTeamData, setPreviousTeamData] = useState<TTeam | null>(null);
  const [isShowInputs, setIsShowInputs] = useState<boolean>(false);
  const [isShowBalls, setIsShowBalls] = useState<boolean>(false);
  const [isDisableSwitch, setIsDisableSwitch] = useState<boolean>(false);
  const [isConfirmReturn, setIsConfirmReturn] = useState<boolean>(false);
  const [actionType, setActionType] = useState<string>("choose");
  const [zoneValue, setZoneValue] = useState<TZoneValue | number[]>({
    "4A": 0,
    "4B": 0,
    "3A": 0,
    "3B": 0,
    "2A": 0,
    "2B": 0,
    "4C": 0,
    "4D": 0,
    "3C": 0,
    "3D": 0,
    "2C": 0,
    "2D": 0,
    "9A": 0,
    "9B": 0,
    "8A": 0,
    "8B": 0,
    "7A": 0,
    "7B": 0,
    "9C": 0,
    "9D": 0,
    "8C": 0,
    "8D": 0,
    "7C": 0,
    "7D": 0,
    "5A": 0,
    "5B": 0,
    "6A": 0,
    "6B": 0,
    "1A": 0,
    "1B": 0,
    "5C": 0,
    "5D": 0,
    "6C": 0,
    "6D": 0,
    "1C": 0,
    "1D": 0,
  });
  const loadByZone = Object.values(zoneValue);
  const DiagrammValue = Object.values(diagrammValue).slice(0, 9);
  const checkEquality = reduce(DiagrammValue) === reduce(loadByZone);

  const chooseTypeOfAttack = (event: ChangeEvent<HTMLSelectElement>) => {
    setActionType(event.target.value);
  };
  const handleDiagrammValue = (event: ChangeEvent<HTMLInputElement>) => {
    setDiagrammValue({
      ...diagrammValue,
      [event.target.name]: +event.target.value.replace(/\D+/g, ""),
    } as TServiceDiagramm & TAttackDiagramm);
  };
  const onHandleCountClick = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    while (actionType === "choose") {
      // якщо не вибарно тип атаки то return
      alert("Type of Action was not selected");
      return;
    }
    if (isSaveDataOfActions) {
      // якщо додаємо данні і кількість атак не співпадає з описаними атаками то return
      while (!checkEquality) {
        alert("DATA Value not equal to ZONE value");
        return;
      }
      setIsConfirmReturn(!isConfirmReturn);
      setPreviousPlayerData({ ...playerInfo }); // зберігаємо попередні дані гравця і команд
      setPreviousTeamData({
        ...(allTeams.find((team) => team.name === playerInfo.team) as TTeam),
      });
      calculateForData(playerInfo); // додаємо полі діаграмм до значень обраного гравця
      const zoneOfAction = zonesStates.find((ball) => ball.active); // визначаємо з якої зона атака
      const actionHistory = playerInfo[
        (zoneOfAction!.zone + actionType) as keyof TPlayer
      ] as number[]; // дістаємо данні гравця з конкретної зони
      const nameOfZone = zoneOfAction!.zone + actionType; // назва зони атаки
      const players = allPlayers.filter((player) => player.team === playerInfo.team); // знаходимо одноклубників обраного гравця
      const team = allTeams.find((team) => team.name === playerInfo.team); // знаходимо команду обраного гравця
      const upgradedPlayers = players.map((player) => upgradeAge(player)); // оновлюємо точний вік гравців команди обраного гравця
      const teamAge = upgradedPlayers.reduce((a, b) => a + +b.age, 0) / players.length; // середній вік гравців обраної команди
      const teamHeight = upgradedPlayers.reduce((a, b) => a + b.height, 0) / players.length; // середній зріст гравців обраної команди
      const newTeam = { ...team };
      calculateForData(newTeam as TTeam); // додаємо полі діаграмм до значень команди обраного гравця
      newTeam.age = +teamAge.toFixed(1); // встановлюємо правильний вік
      newTeam.height = +teamHeight.toFixed(1); // встановлюємо правильний зріст
      (playerInfo[nameOfZone as keyof TPlayer] as number[]) = loadByZone.map(
        (att, index) => att + (!actionHistory[index] ? 0 : actionHistory[index])
      ); // оновлюємо поля атаки у обраного гравця
      refreshVersionOFAdmin(1); //перезаписываю версию
      await savePlayer(playerInfo); //сохраняю одного игрока
      await saveTeam(newTeam as TTeam); // сохраняю команду
      setIsSaveDataOfActions(!isSaveDataOfActions);
    }
    const totalAttacks = reduce(loadByZone, 0.0001);
    const result = loadByZone.map((attacks) => Math.round((attacks / totalAttacks) * 100));
    setZoneValue(result);
    setIsShowInputs(!isShowInputs);
    setIsDisableSwitch(!isDisableSwitch);
  };
  const returnOldData = async () => {
    refreshVersionOFAdmin(-1); //откатываю версию
    await savePlayer(previousPlayerData!); //откатываю данные одного игрока
    await saveTeam(previousTeamData!); // откатываю данные команды
    setIsConfirmReturn(!isConfirmReturn);
    alert("Last Data Returned");
  };

  const showData = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (actionType === "choose") {
      alert("Type of Action was not selected");
      return;
    }
    const zoneOfAtt = zonesStates.find((ball) => ball.active);
    const attHistory = playerInfo[(zoneOfAtt!.zone + actionType) as keyof TPlayer] as number[];
    const totalAttacks = reduce(attHistory, 0.0001);
    const result = attHistory.map((attacks) => Math.round((attacks / totalAttacks) * 100));
    setZoneValue(result);
    setIsShowInputs(!isShowInputs);
    setIsDisableSwitch(!isDisableSwitch);
    setIsShowDataOfActions(!isShowDataOfActions);
  };

  const refreshVersionOFAdmin = async (count: number) => {
    try {
      const version = doc(dataBase, "dataVersion", "currentVersion");
      const adminVersion = userVersion + count;
      await setDoc(version, { currentVersion: adminVersion });
      dispatch(setUserVersion(adminVersion));
    } catch (error) {
      console.error(error);
    }
  };

  const savePlayer = async (player: TPlayer) => {
    try {
      const Player = doc(dataBase, "players", player.name);
      await setDoc(Player, player);
      const players = allPlayers.map((athlete) =>
        athlete.name === player.name ? player : athlete
      );
      dispatch(setAllPlayers(players));
      dispatch(setInfoOfPlayer(player));
      if (guestPlayers.length !== 0 && guestPlayers?.[0].team === player.team) {
        dispatch(
          setGuestPlayers(
            guestPlayers.map((athlete) => (athlete.name === player.name ? player : athlete))
          )
        );
      }
      if (homePlayers.length !== 0 && homePlayers?.[0].team === player.team) {
        dispatch(
          setHomePlayers(
            homePlayers.map((athlete) => (athlete.name === player.name ? player : athlete))
          )
        );
      }
    } catch (error) {
      console.error(error);
    }
  };
  const saveTeam = async (team: TTeam) => {
    try {
      const Team = doc(dataBase, "teams", team.id);
      await setDoc(Team, team);
      const teams = allTeams.map((squad) => (squad.id === team.id ? team : squad));
      dispatch(setAllTeams(teams));
    } catch (error) {
      console.error(error);
    }
  };
  const choosenActionOne = type === "Attack" ? "FastBall" : "Jump";
  const choosenActionTwo = type === "Attack" ? "HighBall" : "Float";
  function totalPercentOfzone(number1: number, number2: number): number | null {
    if (!Array.isArray(zoneValue)) return null;
    const value = reduce(
      zoneValue.filter(
        (value: number, index: number) =>
          (index % 6 === number1 && value) || (index % 6 === number2 && value)
      )
    );
    return value;
  }
  function setStyle(zone: number): CSSProperties {
    return zone >= 50 ? { backgroundColor: "orangered", color: "white" } : {};
  }
  const zone5 = totalPercentOfzone(0, 1);
  const zone6 = totalPercentOfzone(2, 3);
  const zone1 = totalPercentOfzone(4, 5);
  return (
    <SectionWrapper
      className="playArea-section"
      backGround={
        <div className="playground-area-background">
          <div className="threeMRivalCort">
            {Array.isArray(zoneValue) && (
              <>
                <div style={setStyle(zone5!)}>{zone5}%</div>
                <div style={setStyle(zone6!)}>{zone6}%</div>
                <div style={setStyle(zone1!)}>{zone1}%</div>
              </>
            )}
          </div>
          <div className="threeMMyCort"></div>
        </div>
      }
      content={
        <>
          <form
            className="playArea"
            onSubmit={!isShowDataOfActions ? onHandleCountClick : showData}
          >
            <div className="explain">
              <Explain
                isConfirmReturn={isConfirmReturn}
                setIsConfirmReturn={setIsConfirmReturn}
                isDisableSwitch={isDisableSwitch}
                isSaveDataOfActions={isSaveDataOfActions}
                setIsSaveDataOfActions={setIsSaveDataOfActions}
                diagrammValue={diagrammValue}
                handleDiagrammValue={handleDiagrammValue}
                returnOldData={returnOldData}
                isShowDataOfActions={isShowDataOfActions}
                setIsShowDataOfActions={setIsShowDataOfActions}
                type={type}
              />
            </div>
            <div className="select-wrapper">
              <select
                className="typeOfAction"
                onChange={chooseTypeOfAttack}
                disabled={!isShowInputs || isDisableSwitch}
              >
                <option value="choose">{!isShowInputs ? `Choose zone` : `Choose type`}</option>
                <option value={choosenActionOne}>{choosenActionOne}</option>
                {(type === "Service" || playerInfo.position !== "MBlocker") && (
                  <option value={choosenActionTwo}>{choosenActionTwo}</option>
                )}
              </select>
            </div>
            <div className="count-button-wrapper">
              <button
                type="submit"
                className="countButton"
                disabled={!isShowInputs || isDisableSwitch}
              >
                Count
              </button>
            </div>
            <div className="zones-wrapper">
              {type === "Service"
                ? zonesStates.map((ball, index) =>
                    !ball.active ? (
                      <Balls
                        key={index}
                        value={ball.zone.replace(/[a-z]/g, "")}
                        className={!isShowBalls ? ball.zone : "none"}
                        index={index}
                        zonesStates={zonesStates}
                        setZonesStates={setZonesStates}
                        setIsShowInputs={setIsShowInputs}
                        setIsShowBalls={setIsShowBalls}
                      />
                    ) : (
                      <Balls
                        key={index}
                        value="🏐"
                        className={ball.zone + " showTheBall"}
                        index={index}
                        zonesStates={zonesStates}
                        setZonesStates={setZonesStates}
                        setIsShowInputs={setIsShowInputs}
                        setIsShowBalls={setIsShowBalls}
                      />
                    )
                  )
                : playerInfo.position === "Opposite"
                ? zonesStates
                    .slice(0, 3)
                    .map((ball, index) =>
                      ball.active === false ? (
                        <Balls
                          key={index}
                          value={ball.zone.replace(/[a-z]/g, "")}
                          className={!isShowBalls ? ball.zone : "none"}
                          index={index}
                          zonesStates={zonesStates}
                          setZonesStates={setZonesStates}
                          setIsShowInputs={setIsShowInputs}
                          setIsShowBalls={setIsShowBalls}
                        />
                      ) : (
                        <Balls
                          key={index}
                          value="🏐"
                          className={ball.zone + " showTheBall"}
                          index={index}
                          zonesStates={zonesStates}
                          setZonesStates={setZonesStates}
                          setIsShowInputs={setIsShowInputs}
                          setIsShowBalls={setIsShowBalls}
                        />
                      )
                    )
                : playerInfo.position === "Reciever"
                ? zonesStates
                    .slice(1, 4)
                    .map((ball, index) =>
                      ball.active === false ? (
                        <Balls
                          key={index + 1}
                          value={ball.zone.replace(/[a-z]/g, "")}
                          className={!isShowBalls ? ball.zone : "none"}
                          index={index + 1}
                          zonesStates={zonesStates}
                          setZonesStates={setZonesStates}
                          setIsShowInputs={setIsShowInputs}
                          setIsShowBalls={setIsShowBalls}
                        />
                      ) : (
                        <Balls
                          key={index + 1}
                          value="🏐"
                          className={ball.zone + " showTheBall"}
                          index={index + 1}
                          zonesStates={zonesStates}
                          setZonesStates={setZonesStates}
                          setIsShowInputs={setIsShowInputs}
                          setIsShowBalls={setIsShowBalls}
                        />
                      )
                    )
                : playerInfo.position === "MBlocker"
                ? zonesStates
                    .slice(4, 7)
                    .map((ball, index) =>
                      ball.active === false ? (
                        <Balls
                          key={index + 4}
                          value={ball.zone.replace(/[a-z]/g, "")}
                          className={!isShowBalls ? ball.zone : "none"}
                          index={index + 4}
                          zonesStates={zonesStates}
                          setZonesStates={setZonesStates}
                          setIsShowInputs={setIsShowInputs}
                          setIsShowBalls={setIsShowBalls}
                        />
                      ) : (
                        <Balls
                          key={index + 4}
                          value="🏐"
                          className={ball.zone + " showTheBall"}
                          index={index + 4}
                          zonesStates={zonesStates}
                          setZonesStates={setZonesStates}
                          setIsShowInputs={setIsShowInputs}
                          setIsShowBalls={setIsShowBalls}
                        />
                      )
                    )
                : null}
            </div>
          </form>
          {isDisableSwitch && !isShowDataOfActions && (
            <div className="cones-wrapper">
              {Object.values(zoneValue).map((value, index) => (
                <Reaction key={index} value={value} />
              ))}
            </div>
          )}
          {isShowBalls && (
            <>
              {!isDisableSwitch && !isShowDataOfActions && (
                <div className="cones-wrapper">
                  {Object.entries(zoneValue).map(([key, value]) => (
                    <InputForCount
                      key={key}
                      name={key}
                      setZoneValue={setZoneValue}
                      zoneValue={zoneValue}
                      value={value}
                    />
                  ))}
                </div>
              )}
              {isSaveDataOfActions && (
                <CheckEquality
                  zoneValue={zoneValue}
                  diagrammValue={diagrammValue}
                  checkEquality={checkEquality}
                />
              )}
            </>
          )}
        </>
      }
    />
  );
}
