import { TDiagramm, TZoneValue } from "../../../types/types";
import { reduce } from "../../../utilities/functions";

type TCheckEquality = {
  checkEquality: boolean;
  diagrammValue: TDiagramm;
  zoneValue: number[] | TZoneValue;
};

export function CheckEquality(props: TCheckEquality) {
  const { checkEquality, diagrammValue, zoneValue } = props;
  return (
    <div className="compareFields">
      <div className="input-equality-wrapper">
        <label>Data value</label>
        <input
          style={
            checkEquality ? { backgroundColor: `yellowgreen` } : { backgroundColor: `orangered` }
          }
          type="text"
          value={reduce(Object.values(diagrammValue).slice(0, 9))}
          readOnly
        ></input>
      </div>
      {!checkEquality ? (
        <div className="label-equality-wrapper">
          <label className="equal">Not</label>
          <label className="equal">equal</label>
        </div>
      ) : (
        <div className="label-equality-wrapper">
          <label className="equal">All</label>
          <label className="equal">OK</label>
        </div>
      )}
      <div className="input-equality-wrapper">
        <label>Zone value</label>
        <input
          style={
            checkEquality ? { backgroundColor: `yellowgreen` } : { backgroundColor: `orangered` }
          }
          type="text"
          value={reduce(Object.values(zoneValue))}
          readOnly
        ></input>
      </div>
    </div>
  );
}
