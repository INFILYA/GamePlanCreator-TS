import { useState } from "react";
import { RegularButton } from "../css/Button.styled";
import { DistributionField } from "./components/DistributionField";

export default function Distribution() {
  const [history, sethistory] = useState([0]);

  function reset() {
    const newHistory = [...history];
    newHistory.splice(history.length - 1, 1);
    sethistory(newHistory);
  }
  function addField() {
    sethistory([...history, history.length]);
  }
  return (
    <article className="main-content-wrapper">
      <section className="attack-section">
        <div className="section-border">
          <div className="section-background"></div>
        </div>
        <div className="section-content-wrapper">
          <div className="section-content">
            <h1>Distribution</h1>
            <div className="reset-button-wrapper">
              {history.length > 1 && (
                <RegularButton onClick={reset} $color="black" $background="orangered" type="button">
                  -
                </RegularButton>
              )}
              {history.length <= 8 && (
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
            <div className="playArea-sections-wrapper">
              {history.map((field) => (field ? <DistributionField key={field} /> : null))}
            </div>
          </div>
        </div>
      </section>
    </article>
  );
}
