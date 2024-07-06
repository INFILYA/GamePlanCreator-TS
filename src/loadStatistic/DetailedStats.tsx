import { useSelector } from "react-redux";
import { useAppDispatch } from "../states/store";
import SectionWrapper from "../wrappers/SectionWrapper";
import {
  selectDetailedStatsOfPlayer,
  setDetailedStatsOfPlayer,
} from "../states/slices/detailedStatsOfPlayerSlice";
import { RegularButton } from "../css/Button.styled";
import { TDistributionZones, TGameLogStats } from "../types/types";
import { Block } from "../distribution/components/Block";
import { FormEvent, useState } from "react";
import { InputDistribution } from "../distribution/components/InputDistribution";
import {
  calculateTotalofActions,
  getSumofAttacks,
  getSumofReceptions,
  reduce,
} from "../utilities/functions";
type TDetailedStats = {
  detailedStats: TGameLogStats;
};

export default function DetailedStats(arg: TDetailedStats) {
  const { detailedStats } = arg;
  const dispatch = useAppDispatch();
  const detailedStatsOfPlayer = useSelector(selectDetailedStatsOfPlayer);
  const [action, setAction] = useState("");
  const [isShowButtonCount, setIsShowButtonCount] = useState<boolean>(false);
  const [zoneValue, setZoneValue] = useState<TDistributionZones>({
    4: 0,
    3: 0,
    2: 0,
    5: 0,
    6: 0,
    1: 0,
  });
  const fullGame = detailedStats.map((rally) => rally.stats).flat();
  const choosenActionsOfPlayer = fullGame.filter((player) => player.name === detailedStatsOfPlayer);
  const disabled = Array.isArray([zoneValue]);

  function getSumOfActionsPerZone(zone: number, action: string) {
    const properFunc = action === "A" ? getSumofAttacks : getSumofReceptions;
    const result = properFunc(
      calculateTotalofActions(
        choosenActionsOfPlayer.filter((player) => player.boardPosition === zone)
      )
    );
    return result;
  }

  function getPercentage(zone: number, sum: number) {
    return +((zone / sum) * 100).toFixed(0);
  }

  function onHandleCountClick(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const zone1 = getSumOfActionsPerZone(1, action);
    const zone2 = getSumOfActionsPerZone(2, action);
    const zone3 = getSumOfActionsPerZone(3, action);
    const zone4 = getSumOfActionsPerZone(4, action);
    const zone5 = getSumOfActionsPerZone(5, action);
    const zone6 = getSumOfActionsPerZone(6, action);
    const sumOfZones = reduce([zone1, zone2, zone3, zone4, zone5, zone6]);

    setZoneValue({
      ...zoneValue,
      [6]: getPercentage(zone1, sumOfZones),
      [3]: getPercentage(zone2, sumOfZones),
      [2]: getPercentage(zone3, sumOfZones),
      [1]: getPercentage(zone4, sumOfZones),
      [4]: getPercentage(zone5, sumOfZones),
      [5]: getPercentage(zone6, sumOfZones),
    });
    setIsShowButtonCount(!isShowButtonCount);
  }
  return (
    <SectionWrapper>
      <RegularButton
        onClick={() => dispatch(setDetailedStatsOfPlayer(""))}
        type="button"
        $color="black"
        $background="orangered"
      >
        Back
      </RegularButton>
      <div>{detailedStatsOfPlayer}</div>
      <div className="playArea-sections-wrapper">
        <SectionWrapper
          className={"distribution-section"}
          backGround={<div className="playground-area-background"></div>}
        >
          <div className="distribution-wrapper">
            <div>
              <div>Attack</div>
              <input
                type="checkbox"
                value="A"
                onChange={(e) => setAction(e.target.value)}
                checked={"A" === action}
              />
            </div>
            <div>
              <div>Reception</div>
              <input
                type="checkbox"
                value="R"
                onChange={(e) => setAction(e.target.value)}
                checked={"R" === action}
              />
            </div>
            <form className="distrfield-wrapper" onSubmit={onHandleCountClick}>
              <div className="block-wrapper">
                {Object.keys(zoneValue).map((input) => (
                  <Block key={input} />
                ))}
              </div>
              <div className="playarea-wrapper">
                <div className="line-wrapper">
                  {Object.keys(zoneValue)
                    .slice(0, 3)
                    .map((input) => (
                      <InputDistribution
                        key={input}
                        zoneValue={zoneValue[+input as keyof TDistributionZones]}
                        name={input}
                        readOnly={isShowButtonCount}
                      />
                    ))}
                </div>
                <div className="line-wrapper">
                  {Object.keys(zoneValue)
                    .slice(3, 6)
                    .map((input) => (
                      <InputDistribution
                        key={input}
                        zoneValue={zoneValue[+input as keyof TDistributionZones]}
                        name={input}
                        readOnly={isShowButtonCount}
                      />
                    ))}
                </div>
                <div className="count-wrapper">
                  {disabled && (
                    <button className="count" type="submit">
                      Count
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </SectionWrapper>
      </div>
    </SectionWrapper>
  );
}
