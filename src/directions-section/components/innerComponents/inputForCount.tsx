import { TZoneValue } from "../../../types/types";

type TInputForCount = {
  name: string;
  zoneValue: TZoneValue | number[];
  setZoneValue(arg: TZoneValue | number[]): void;
  value: number;
};

export function InputForCount(props: TInputForCount) {
  const { name, setZoneValue, zoneValue, value } = props;
  function handleIncreaseZoneValue() {
    setZoneValue({
      ...zoneValue,
      [name]: +value + 1,
    });
  }
  return (
    <>
      <button
        type="button"
        className="result"
        onDoubleClick={handleIncreaseZoneValue}
        value={value}
      >
        {value}
      </button>
    </>
  );
}
