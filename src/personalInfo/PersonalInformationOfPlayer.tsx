import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import Diagramm from "./components/Diagramm";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../config/firebase";
import { selectPlayerInfo, setInfoOfPlayer } from "../states/slices/playerInfoSlice";
import { useState } from "react";
import { useAppDispatch } from "../states/store";
import { upgradeAge } from "../utilities/functions";
import { RegularButton } from "../css/Button.styled";

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
  const libero = playerInfo.position === "Libero";
  const setter = playerInfo.position === "Setter";
  const servicePM = playerInfo?.plusMinusOnService;
  const attackPM = playerInfo?.plusMinusOnAttack;
  const styleService = {
    color: servicePM >= 0 ? "green" : "red",
  };
  const styleAttack = {
    color: attackPM >= 0 ? "green" : "red",
  };
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
                  Plus/Minus: <div style={styleService}>&nbsp;{servicePM}</div>
                </div>
              </div>
            )}
            {attack && (
              <div className="player-info-row-wrapper">
                <div>
                  Plus/Minus: <div style={styleAttack}>&nbsp;{attackPM}</div>
                </div>
              </div>
            )}
            <nav>
              {!libero && isRegistratedUser && (
                <>
                  {!setter && (
                    <NavLink to={`/Directions?${playerInfo.name}=Attack`}>
                      <RegularButton
                        type="button"
                        $color={attack ? "orangered" : ""}
                        $background={attack ? "black" : ""}
                      >
                        Attack
                      </RegularButton>
                    </NavLink>
                  )}
                  <NavLink to={`/Directions?${playerInfo.name}=Service`}>
                    <RegularButton
                      type="button"
                      $color={service ? "orangered" : ""}
                      $background={service ? "black" : ""}
                    >
                      Service
                    </RegularButton>
                  </NavLink>
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
            <img src={playerInfo.photo} alt="" />
          </div>
          {!page1 && (
            <div className="player-diagramm-wrapper">
              {service && (
                <div className="row">
                  <Diagramm link="Service" />
                </div>
              )}
              {!setter && attack && (
                <div className="row">
                  <Diagramm link="Attack" />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
