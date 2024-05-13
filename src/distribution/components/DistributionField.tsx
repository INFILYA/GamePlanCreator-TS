import { useState, ChangeEvent, FormEvent } from "react";
import { Block } from "./Block";
import SectionWrapper from "../../wrappers/SectionWrapper";
import { InputDistribution } from "./InputDistribution";
import { reduce } from "../../utilities/functions";
import { TDistributionZones } from "../../types/types";

export function DistributionField() {
  const [zoneValue, setZoneValue] = useState<TDistributionZones | number[]>([]);
  const [isShowButtonCount, setIsShowButtonCount] = useState<boolean>(false);
  const typesOfSituations = [
    "K1",
    "K2",
    "KC",
    "K7",
    "KE",
    "KP",
    "KM",
    "P1",
    "P2",
    "P3",
    "P4",
    "P5",
    "P6",
    "Service in 1",
    "Service in 5",
    "Reception #",
    "Reception +",
    "Free balls",
    "Setter front row",
    "Setter back row",
  ];

  function handleZoneValue(event: ChangeEvent<HTMLInputElement>) {
    setZoneValue({
      ...zoneValue,
      [event.target.name]: +event.target.value.replace(/\D+/g, ""),
    });
  }
  function handleSelectOption() {
    setZoneValue({ 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 });
  }
  function onHandleCountClick(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const final = Object.values(zoneValue);
    const total = reduce(final, 0.0001);
    const result = final.map((obj) => Math.round((obj / total) * 100));
    setZoneValue(result);
    setIsShowButtonCount(true);
  }
  const disabled = Array.isArray(zoneValue);
  return (
    <SectionWrapper
      className={"distribution-section"}
      backGround={<div className="playground-area-background"></div>}
    >
      <div className="distribution-wrapper">
        <form className="distrfield-wrapper" onSubmit={onHandleCountClick}>
          <div className="select-wrapper">
            <select
              className="typeOfCall"
              defaultValue="Choose type of call"
              onChange={handleSelectOption}
              disabled={isShowButtonCount}
            >
              <option disabled={true}>Choose type of call</option>
              {typesOfSituations.map((type) =>
                !disabled ? (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ) : (
                  <option key={type}>{type}</option>
                )
              )}
            </select>
          </div>
          <div className="block-wrapper">
            {Object.keys(zoneValue).map((input) => (
              <Block key={input} />
            ))}
          </div>
          {(!disabled || isShowButtonCount) && (
            <div className="playarea-wrapper">
              <div className="line-wrapper">
                {Object.keys(zoneValue)
                  .slice(0, 3)
                  .map((input) => (
                    <InputDistribution
                      key={input}
                      zoneValue={zoneValue[+input as keyof TDistributionZones]}
                      handleZoneValue={handleZoneValue}
                      name={input}
                      readOnly={disabled}
                    />
                  ))}
              </div>
              <div className="line-wrapper">
                <div className="input-wrapper">
                  <input value="Zone 5" readOnly />
                </div>
                {Object.keys(zoneValue)
                  .slice(3, 5)
                  .map((input) => (
                    <InputDistribution
                      key={input}
                      zoneValue={zoneValue[+input as keyof TDistributionZones]}
                      handleZoneValue={handleZoneValue}
                      name={input}
                      readOnly={disabled}
                    />
                  ))}
              </div>
              <div className="count-wrapper">
                {!disabled && (
                  <button className="count" type="submit">
                    Count
                  </button>
                )}
              </div>
            </div>
          )}
        </form>
      </div>
    </SectionWrapper>
  );
}
