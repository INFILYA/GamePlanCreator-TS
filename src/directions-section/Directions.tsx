import { useEffect, useState } from "react";
import { selectPlayerInfo, setInfoOfPlayer } from "../states/slices/playerInfoSlice";
import { useDispatch, useSelector } from "react-redux";
import { getFromLocalStorage } from "../utilities/functions";
import { PersonalInformationOfPlayer } from "../personalInfo/PersonalInformationOfPlayer";
import { useSearchParams } from "react-router-dom";
import { Attack } from "./components/Attack";
import { Service } from "./components/Service";
import { TPlayer } from "../types/types";
import { RegularButton } from "../css/Button.styled";

export default function Directions() {
  const dispatch = useDispatch();
  const [history, sethistory] = useState([0]);
  const playerInfo = useSelector(selectPlayerInfo);
  const [searchParams] = useSearchParams();
  useEffect(() => {
    const playerInfo: TPlayer = getFromLocalStorage("playerInfo");
    dispatch(setInfoOfPlayer(playerInfo));
  }, [dispatch]);
  if (playerInfo === null) {
    return;
  }
  const type = searchParams.get(playerInfo!.name);
  function reset() {
    const newHistory = [...history];
    newHistory.splice(history.length - 1, 1);
    sethistory(newHistory);
  }
  function addField() {
    sethistory([...history, history.length]);
  }
  const actionType = type! === "Attack" ? <Attack /> : <Service />;
  return (
    <article className="main-content-wrapper" style={{ flexDirection: "column" }}>
      <section className="attack-section">
        <div className="section-border">
          <div className="section-background"></div>
        </div>
        <div className="section-content-wrapper">
          <div className="section-content">
            <div className="reset-button-wrapper">
              {history.length > 1 && (
                <RegularButton onClick={reset} type="button" $color="black" $background="orangered">
                  -
                </RegularButton>
              )}
              {history.length <= 6 && (
                <RegularButton
                  onClick={addField}
                  type="button"
                  $color="black"
                  $background="orangered"
                >
                  {history.length === 1 ? `Push to start` : `+`}
                </RegularButton>
              )}
            </div>
            <PersonalInformationOfPlayer link={type!} />
          </div>
        </div>
      </section>
      <div className="playArea-sections-wrapper">
        {history.map((field) => (field ? <div key={field}>{actionType}</div> : null))}
      </div>
    </article>
  );
}
