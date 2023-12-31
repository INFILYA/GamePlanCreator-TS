import tinycolor from "tinycolor2";
import { ChangeEvent } from "react";

type TInputDistribution = {
  zoneValue: number;
  handleZoneValue(event: ChangeEvent<HTMLInputElement>): void;
  name: string;
  readOnly: boolean;
};

export function InputDistribution(props: TInputDistribution) {
  const { zoneValue, handleZoneValue, name, readOnly } = props;
  const color = tinycolor({ h: 60 - ((zoneValue * 1.5) / 100) * 60, s: 100, l: 50 });
  const opacity = zoneValue === 0 ? 0 : 1;
  const backgroundColor = { background: color.toHexString(), opacity: opacity };
  return (
    <div className="input-wrapper">
      <input
        style={readOnly ? backgroundColor : {}}
        type="text"
        name={name}
        value={readOnly ? `${zoneValue}%` : zoneValue}
        onChange={handleZoneValue}
        required
        readOnly={readOnly}
      ></input>
    </div>
  );
}
