import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import Diagramm from "./components/Diagramm";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../config/firebase";
import { selectPlayerInfo, setInfoOfPlayer } from "../states/slices/playerInfoSlice";
import { useState } from "react";
import { useAppDispatch } from "../states/store";
import {
  getAttackEfficency,
  getPlusMinusAttack,
  getPlusMinusService,
  getServiceEfficency,
  setStyle,
  upgradeAge,
} from "../utilities/functions";
import { RegularButton } from "../css/Button.styled";
// import { set } from "firebase/database";

type TPersonalInfoProps = {
  link: string;
};

export function PersonalInformationOfPlayer(props: TPersonalInfoProps) {
  const { link } = props;
  const dispatch = useAppDispatch();
  const [isRegistratedUser] = useAuthState(auth);
  const [showDetails, setShowDetails] = useState(true);
  const playerInfos = useSelector(selectPlayerInfo);
  if (playerInfos === null) return;
  const playerInfo = upgradeAge(playerInfos);
  const page1 = link === "page1";
  const service = link === "Service";
  const attack = link === "Attack";
  const libero = playerInfo.position === "LIB";
  const servicePM = getPlusMinusService(playerInfo);
  const attackPM = getPlusMinusAttack(playerInfo);

  // ADD NEW PLAER
  // async function setNewPlayersToData() {
  //   const newPlaer = {
  //     ...playerInfo,
  //     name: "Sam Etemadi",
  //     id: "Sam Etemadi",
  //     number: "22",
  //     age: "2007-05-31",
  //     team: "Warriors-18U",
  //   };
  //   await set(playersRef("Sam Etemadi"), newPlaer);
  // }
  // ADD NEW PLAER

  return (
    <div className="hidden-player-information-wrapper">
      <div className="player-surname-wrapper">
        <h2 onClick={() => setShowDetails(!showDetails)}>
          {playerInfo.name} №{playerInfo.number}
        </h2>
      </div>
      {showDetails && (
        <div className="player-full-info-wrapper">
          <div className="player-info-data-wrapper">
            <div className="player-info-row-wrapper">
              <div>Age: {playerInfo.age}</div>
            </div>
            <div className="player-info-row-wrapper">
              <div>Dominant hand: {playerInfo.hand}</div>
            </div>
            <div className="player-info-row-wrapper">
              <div>Height: {playerInfo.height}</div>
            </div>
            <div className="player-info-row-wrapper">
              <div>Reach: {playerInfo.reach}</div>
            </div>
            <div className="player-info-row-wrapper">
              <div>Position: {playerInfo.position}</div>
            </div>
            {page1 && (
              <div className="player-info-row-wrapper">
                <div>Team : {playerInfo.team}</div>
              </div>
            )}
            {service && (
              <div className="player-info-row-wrapper">
                <div>
                  Plus/Minus: <div style={setStyle(servicePM)}>&nbsp;{servicePM}</div>
                </div>
              </div>
            )}
            {attack && (
              <div className="player-info-row-wrapper">
                <div>
                  Plus/Minus: <div style={setStyle(attackPM)}>&nbsp;{attackPM}</div>
                </div>
              </div>
            )}
            <nav>
              {!libero && isRegistratedUser && (
                <>
                  <NavLink to={`/Directions?${playerInfo.name}=Attack`}>
                    <RegularButton
                      type="button"
                      $color={attack ? "orangered" : "#0057b8"}
                      $background={attack ? "black" : "#ffd700"}
                    >
                      Attack
                    </RegularButton>
                  </NavLink>

                  <NavLink to={`/Directions?${playerInfo.name}=Service`}>
                    <RegularButton
                      type="button"
                      $color={service ? "orangered" : "#0057b8"}
                      $background={service ? "black" : "#ffd700"}
                    >
                      Service
                    </RegularButton>
                  </NavLink>
                  {/* <RegularButton onClick={setNewPlayersToData}>add plaer</RegularButton> */}
                </>
              )}
              {page1 && (
                <RegularButton
                  type="button"
                  onClick={() => dispatch(setInfoOfPlayer(null))}
                  $color="orangered"
                  $background="black"
                >
                  Cancel
                </RegularButton>
              )}
            </nav>
          </div>
          <div className="photo-player-wrapper">
            <img src={`/photos/${playerInfo.photo}`} alt="" />
          </div>
          {!page1 && (
            <div className="player-diagramm-wrapper">
              {service && (
                <>
                  <div className="row">
                    <Diagramm link="Service" />
                  </div>
                  <div className="efficency-wrapper">
                    Efficency :<div>&nbsp;{getServiceEfficency(playerInfo)}%</div>
                  </div>
                </>
              )}
              {attack && (
                <>
                  <div className="row">
                    <Diagramm link="Attack" />
                  </div>
                  <div className="efficency-wrapper">
                    Efficency :<div>&nbsp;{getAttackEfficency(playerInfo)}%</div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
