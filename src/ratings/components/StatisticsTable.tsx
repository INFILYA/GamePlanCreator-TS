import { useRef, useEffect } from "react";
import { TMix } from "../../types/types";
import { Categorys } from "./Categorys";
import { Rows } from "./Rows";
import { categorys, jusName } from "../../utilities/functions";

type TStatisticsTable = {
  playersStats: TMix[][];
  fullGameStats: TMix;
  rankByValue: (criteria: keyof TMix | "earnedPoints", arr: TMix[]) => void;
  showLegend?: boolean;
  containerStyle?: React.CSSProperties;
};

export function StatisticsTable({
  playersStats,
  fullGameStats,
  rankByValue,
  showLegend = true,
  containerStyle,
}: TStatisticsTable) {
  const namesTableRef = useRef<HTMLTableElement>(null);
  const statsTableRef = useRef<HTMLTableElement>(null);

  const playersNames = playersStats
    .flat()
    .map((player) => jusName(player))
    .filter((player) => player.name && player.name.trim() !== "");

  // Синхронизация высоты строк между таблицами
  useEffect(() => {
    if (
      !namesTableRef.current ||
      !statsTableRef.current ||
      playersStats.length === 0
    )
      return;

    const syncRowHeights = () => {
      const namesRows = namesTableRef.current?.querySelectorAll("tbody tr");
      const statsRows = statsTableRef.current?.querySelectorAll("tbody tr");

      if (!namesRows || !statsRows) return;

      const maxLength = Math.max(namesRows.length, statsRows.length);

      for (let i = 0; i < maxLength; i++) {
        const namesRow = namesRows[i] as HTMLTableRowElement;
        const statsRow = statsRows[i] as HTMLTableRowElement;

        if (namesRow && statsRow) {
          const maxHeight = Math.max(
            namesRow.offsetHeight,
            statsRow.offsetHeight
          );
          namesRow.style.height = `${maxHeight}px`;
          statsRow.style.height = `${maxHeight}px`;
        }
      }
    };

    // Небольшая задержка для того, чтобы DOM обновился
    const timeoutId = setTimeout(syncRowHeights, 0);

    // Синхронизация при изменении размера окна
    const resizeObserver = new ResizeObserver(() => {
      setTimeout(syncRowHeights, 0);
    });
    if (namesTableRef.current) resizeObserver.observe(namesTableRef.current);
    if (statsTableRef.current) resizeObserver.observe(statsTableRef.current);

    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
    };
  }, [playersStats, playersNames]);

  return (
    <>
      {showLegend && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "24px",
            marginBottom: "12px",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <div
              style={{
                width: "20px",
                height: "20px",
                backgroundColor: "#8fbc8f",
                borderRadius: "4px",
              }}
            ></div>
            <span>Reception</span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <div
              style={{
                width: "20px",
                height: "20px",
                backgroundColor: "gainsboro",
                borderRadius: "4px",
              }}
            ></div>
            <span>Attack</span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <div
              style={{
                width: "20px",
                height: "20px",
                backgroundColor: "khaki",
                borderRadius: "4px",
              }}
            ></div>
            <span>Service</span>
          </div>
        </div>
      )}
      <div
        className="ratings-table-container"
        style={{ display: "flex", ...containerStyle }}
      >
        <table ref={namesTableRef}>
          <tbody className="rating-table-wrapper">
            <Categorys
              filteredPlayers={playersNames}
              rankByValue={rankByValue}
              categorys={["name"]}
            />
          </tbody>
        </table>
        <div>
          <table ref={statsTableRef} style={{ width: "100%" }}>
            <tbody className="rating-table-wrapper">
              <Categorys
                filteredPlayers={playersStats
                  .flat()
                  .filter((player) => player.name && player.name.trim() !== "")}
                rankByValue={rankByValue}
                categorys={categorys}
              />
              <Rows filteredPlayers={[fullGameStats]} lastRow={true} />
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
