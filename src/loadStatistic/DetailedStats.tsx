import { useSelector } from "react-redux";
import { useAppDispatch } from "../states/store";
import SectionWrapper from "../wrappers/SectionWrapper";
import {
  selectDetailedStatsOfPlayer,
  setDetailedStatsOfPlayer,
} from "../states/slices/detailedStatsOfPlayerSlice";
import { RegularButton } from "../css/Button.styled";
import { TDistributionZones, TPlayer } from "../types/types";
import { Block } from "../distribution/components/Block";
import { ChangeEvent, FormEvent, useState } from "react";
import { DetailedZoneValue } from "../distribution/components/DetailedZoneValue";
import {
  calculateTotalofActions,
  emptyDiagramm,
  gerPercentOfAttack,
  getSumofAttacks,
  getSumofReceptions,
  reduce,
} from "../utilities/functions";

type TDetailedStats = {
  detailedStats: TPlayer[][];
  distribution: boolean;
};
type TKeyOfPlayers = keyof TPlayer;

export default function DetailedStats(arg: TDetailedStats) {
  const { detailedStats, distribution } = arg;
  const dispatch = useAppDispatch();
  const detailedStatsOfPlayer = useSelector(selectDetailedStatsOfPlayer);
  const [action, setAction] = useState("A");
  const [position, setPosition] = useState<number>(0);
  const [receptionType, setReceptionType] = useState<TKeyOfPlayers | "All">("All");
  const [isShowButtonCount, setIsShowButtonCount] = useState<boolean>(false);
  const [zoneValue, setZoneValue] = useState<TDistributionZones>({
    4: emptyDiagramm(),
    3: emptyDiagramm(),
    2: emptyDiagramm(),
    5: emptyDiagramm(),
    6: emptyDiagramm(),
    1: emptyDiagramm(),
  });
  const choosenActionsOfPlayer = distribution
    ? detailedStats
        .filter((elem) => (receptionType !== "All" ? elem.some((el) => el[receptionType]) : elem))
        .flat()
        .filter((player) => player.setterBoardPosition === position)
    : detailedStats
        .filter((elem) => (receptionType !== "All" ? elem.some((el) => el[receptionType]) : elem))
        .flat()
        .filter((player) => player.name === detailedStatsOfPlayer);

  function getSumOfActionsPerZone(zone: number) {
    const result = calculateTotalofActions(
      choosenActionsOfPlayer.filter((player) => player.zoneOfAttack === zone)
    );
    return result;
  }

  function onHandleCountClick(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const zone1 = getSumOfActionsPerZone(1);
    const zone2 = getSumOfActionsPerZone(2);
    const zone3 = getSumOfActionsPerZone(3);
    const zone4 = getSumOfActionsPerZone(4);
    const zone5 = getSumOfActionsPerZone(5);
    const zone6 = getSumOfActionsPerZone(6);

    setZoneValue({
      ...zoneValue,
      [6]: zone1,
      [3]: zone2,
      [2]: zone3,
      [1]: zone4,
      [4]: zone5,
      [5]: zone6,
    });
    setIsShowButtonCount(true);
  }
  function setChoosenAspect(e: ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setIsShowButtonCount(false);
    if (distribution) {
      setPosition(+value);
    } else setAction(value);
    setZoneValue({
      ...zoneValue,
      4: emptyDiagramm(),
      3: emptyDiagramm(),
      2: emptyDiagramm(),
      5: emptyDiagramm(),
      6: emptyDiagramm(),
      1: emptyDiagramm(),
    });
  }

  function setChoosenReception(e: ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setReceptionType(value as keyof TPlayer);
    setIsShowButtonCount(false);
  }

  const properFunc = action === "A" ? getSumofAttacks : getSumofReceptions;

  const sumOfZones = reduce([
    properFunc(zoneValue[6]),
    properFunc(zoneValue[3]),
    properFunc(zoneValue[2]),
    properFunc(zoneValue[1]),
    properFunc(zoneValue[4]),
    properFunc(zoneValue[5]),
  ]);
  const myZones = [1, 2, 3, 4, 5, 6];
  const receptionTypes = ["R++", "R+", "R!", "R-", "All"];
  const attackErrors = calculateTotalofActions(choosenActionsOfPlayer)["A="];
  const amountOfSets = properFunc(calculateTotalofActions(choosenActionsOfPlayer));
  const executePercentage = gerPercentOfAttack(calculateTotalofActions(choosenActionsOfPlayer));

  return (
    <SectionWrapper>
      {!distribution ? (
        <div className="detailed-stats-name-wrapper">
          <RegularButton
            onClick={() => dispatch(setDetailedStatsOfPlayer(""))}
            type="button"
            $color="black"
            $background="orangered"
          >
            Back
          </RegularButton>
          <div className="choosen-player-name-content">{detailedStatsOfPlayer}</div>
        </div>
      ) : (
        <h1>Distribution</h1>
      )}
      <div className="aspect-selection-wrapper">
        {!distribution ? (
          <>
            <div>
              <div>Attack</div>
              <input
                type="checkbox"
                value="A"
                onChange={setChoosenAspect}
                checked={"A" === action}
              />
            </div>
            <div className="checkbox-row-wrapper">
              {receptionTypes.map((Type) => (
                <div key={Type}>
                  <div>{Type}</div>
                  <input
                    type="checkbox"
                    value={Type}
                    onChange={setChoosenReception}
                    checked={Type === receptionType}
                  />
                </div>
              ))}
            </div>
            {/* <div>
              <div>Reception</div>
              <input
                type="checkbox"
                value="R"
                onChange={setChoosenAspect}
                checked={"R" === action}
              />
            </div> */}
          </>
        ) : (
          <div>
            <div className="checkbox-row-wrapper">
              {myZones.map((zone) => (
                <div key={zone}>
                  <div>Zone {zone}</div>
                  <input
                    type="checkbox"
                    value={zone}
                    onChange={setChoosenAspect}
                    checked={zone === position}
                  />
                </div>
              ))}
            </div>
            <div className="checkbox-row-wrapper">
              {position !== 0 &&
                receptionTypes.map((Type) => (
                  <div key={Type}>
                    <div>{Type}</div>
                    <input
                      type="checkbox"
                      value={Type}
                      onChange={setChoosenReception}
                      checked={Type === receptionType}
                    />
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
      <div className="playArea-sections-wrapper">
        <SectionWrapper
          className={"distribution-section"}
          backGround={<div className="playground-area-background"></div>}
        >
          <div className="distribution-wrapper">
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
                      <DetailedZoneValue
                        key={input}
                        zoneValue={zoneValue[+input as keyof TDistributionZones]}
                        action={action}
                        sumOfZones={sumOfZones}
                      />
                    ))}
                </div>
                <div className="line-wrapper">
                  {Object.keys(zoneValue)
                    .slice(3, 6)
                    .map((input) => (
                      <DetailedZoneValue
                        key={input}
                        zoneValue={zoneValue[+input as keyof TDistributionZones]}
                        action={action}
                        sumOfZones={sumOfZones}
                      />
                    ))}
                </div>
                <div className="count-wrapper">
                  {!isShowButtonCount && action ? (
                    <button className="count" type="submit">
                      Show
                    </button>
                  ) : (
                    <div>
                      <h2>Amount: {amountOfSets}</h2>
                      <h2>
                        Errors: <strong style={{ color: "orangered" }}>{attackErrors}</strong>
                      </h2>
                      <h2>
                        Percentage:{" "}
                        <strong style={{ color: "lightgreen" }}>{executePercentage}%</strong>
                      </h2>
                    </div>
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
