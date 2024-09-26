// import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import GamePlanCreator from "./GamePlanCreator";
import "./css/newTutorial.css";
import "./css/newHeader.css";
import "./css/newMain.css";
import "./css/newDistribution.css";
import "./css/newAttack.css";
import "./css/newRatings.css";
import { store } from "./states/store";
// import React from "react";

ReactDOM.createRoot(document.getElementById("root")!).render(
  // <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <GamePlanCreator />
      </BrowserRouter>
    </Provider>
  // </React.StrictMode>
);
