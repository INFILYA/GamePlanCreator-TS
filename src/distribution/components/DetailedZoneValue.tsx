import tinycolor from "tinycolor2";
import { TDiagramm } from "../../types/types";
import { getSumofAttacks, getSumofReceptions } from "../../utilities/functions";
import { useState } from "react";

type TInputDistribution = {
  zoneValue: TDiagramm;
  action: string;
  sumOfZones: number;
};

export function DetailedZoneValue(props: TInputDistribution) {
  const { zoneValue, action, sumOfZones } = props;
  const [isNumber, setIsNumber] = useState<boolean>(true);
  const noData = sumOfZones === 0;

  function getPercentage(zone: number, sum: number) {
    if (noData) return 0;
    return +((zone / sum) * 100).toFixed(0);
  }
  const typeOfAction = action === "A" ? getSumofAttacks(zoneValue) : getSumofReceptions(zoneValue);
  const color = tinycolor({
    h: 60 - ((getPercentage(typeOfAction, sumOfZones) * 1.5) / 100) * 60,
    s: 100,
    l: 50,
  }).toHexString();
  const opacity = typeOfAction === 0 ? 0 : 1;
  const backgroundColor = { background: color, opacity: opacity };
  function getDetailedInfo() {
    return isNumber ? (
      <div
        className="zone-wrapper"
        onClick={() => setIsNumber(!isNumber)}
        style={noData ? {} : backgroundColor}
      >
        {!noData && <div>{getPercentage(typeOfAction, sumOfZones)}%</div>}
      </div>
    ) : (
      <div className="zone-wrapper" onClick={() => setIsNumber(!isNumber)}>
        {!noData && (
          <div className="detailed-info-box-wrapper">
            <div>{typeOfAction}</div>
            <div style={{ color: "lightgreen" }}>{zoneValue[`${action}++` as keyof TDiagramm]}</div>
            <div style={{ color: "orange" }}>{zoneValue[`${action}-` as keyof TDiagramm]}</div>
            <div style={{ color: "orangered" }}>{zoneValue[`${action}=` as keyof TDiagramm]}</div>
          </div>
        )}
      </div>
    );
  }
  return getDetailedInfo();
}
