import { Switch } from "antd";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../../config/firebase";
import { TAttackDiagramm, TDiagramm, TServiceDiagramm } from "../../../types/types";
import { ChangeEvent } from "react";
import { rows } from "../../../utilities/functions";

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
  const attack = type === "Attack" && "A++" in diagrammValue;
  const service = type === "Service" && "S++" in diagrammValue;
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
          {rows.map((row) => (
            <input
              style={{ backgroundColor: row[1] }}
              name={attack ? `A${row[0]}` : `S${row[0]}`}
              onChange={handleDiagrammValue}
              value={
                attack
                  ? diagrammValue[`A${row[0]}` as keyof TAttackDiagramm]
                  : service
                  ? diagrammValue[`S${row[0]}` as keyof TServiceDiagramm]
                  : ""
              }
              required
            ></input>
          ))}
        </div>
      )}
    </>
  );
}
