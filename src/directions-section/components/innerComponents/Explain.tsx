import { Switch } from "antd";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../../config/firebase";
import { TDiagramm } from "../../../types/types";
import { ChangeEvent } from "react";

type TExplain = {
  isConfirmReturn: boolean;
  setIsConfirmReturn(arg: boolean): void;
  isDisableSwitch: boolean;
  isSaveDataOfActions: boolean;
  setIsSaveDataOfActions(arg: boolean): void;
  diagrammValue: TDiagramm;
  handleDiagrammValue(event: ChangeEvent<HTMLInputElement>): void;
  returnOldData(): void;
  isShowDataOfActions: boolean;
  setIsShowDataOfActions(arg: boolean): void;
  type: "Attack" | "Service";
};

export function Explain(props: TExplain) {
  const {
    isConfirmReturn,
    setIsConfirmReturn,
    isDisableSwitch,
    isSaveDataOfActions,
    setIsSaveDataOfActions,
    diagrammValue,
    handleDiagrammValue,
    returnOldData,
    type,
    setIsShowDataOfActions,
    isShowDataOfActions,
  } = props;
  const [isRegistratedUser] = useAuthState(auth);
  const admin = isRegistratedUser?.uid === "wilxducX3TUUNOuv56GfqWpjMJD2";
  const attack = type === "Attack";
  const bgOrangeRed = { backgroundColor: "orangered" };
  return (
    <>
      {isConfirmReturn ? (
        <div className="saveBox" style={!isSaveDataOfActions ? bgOrangeRed : {}}>
          <div>
            <button type="button" className="returnButton" onClick={() => returnOldData()}>
              Return
            </button>
            <button
              type="button"
              className="returnButton"
              onClick={() => setIsConfirmReturn(false)}
            >
              Close
            </button>
          </div>
        </div>
      ) : (
        admin &&
        !isShowDataOfActions && (
          <div className="saveBox" style={isSaveDataOfActions ? bgOrangeRed : {}}>
            <label>Add Data</label>
            <Switch
              onChange={() => setIsSaveDataOfActions(!isSaveDataOfActions)}
              disabled={isDisableSwitch}
              className="switch-size"
            />
          </div>
        )
      )}
      {isRegistratedUser && !isSaveDataOfActions && (
        <div
          className="saveBox"
          style={
            (isShowDataOfActions && !isSaveDataOfActions) || isShowDataOfActions ? bgOrangeRed : {}
          }
        >
          <label>Show Data</label>
          <Switch
            onChange={() => setIsShowDataOfActions(!isShowDataOfActions)}
            disabled={isDisableSwitch}
            className="switch-size"
          />
        </div>
      )}
      {isSaveDataOfActions && (
        <div className="input-wrapper">
          <input
            style={{ backgroundColor: "lightgreen" }}
            name={attack ? "winPoints" : "aces"}
            onChange={handleDiagrammValue}
            value={attack ? diagrammValue.winPoints : diagrammValue.aces}
            required
          ></input>
          <input
            style={{ backgroundColor: "yellow" }}
            name={attack ? "leftInGame" : "servicePlus"}
            onChange={handleDiagrammValue}
            value={attack ? diagrammValue.leftInGame : diagrammValue.servicePlus}
            required
          ></input>
          <input
            style={{ backgroundColor: "orange" }}
            name={attack ? "attacksInBlock" : "serviceMinus"}
            onChange={handleDiagrammValue}
            value={attack ? diagrammValue.attacksInBlock : diagrammValue.serviceMinus}
            required
          ></input>
          <input
            style={bgOrangeRed}
            name={attack ? "loosePoints" : "serviceFailed"}
            onChange={handleDiagrammValue}
            value={attack ? diagrammValue.loosePoints : diagrammValue.serviceFailed}
            required
          ></input>
        </div>
      )}
    </>
  );
}
