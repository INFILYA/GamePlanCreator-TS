import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { useSelector } from "react-redux";
import { selectPlayerInfo } from "../../states/slices/playerInfoSlice";
import { TMix } from "../../types/types";
import { getSumofAttacks } from "../../utilities/functions";

type TDiagrammProps = {
  link: string;
  data?: TMix;
};

export default function Diagramm(props: TDiagrammProps) {
  const { link, data } = props;
  const playerInformation = useSelector(selectPlayerInfo);
  const playerInfo = data || playerInformation;
  const colors = ["lightgreen", "aquamarine", "yellow", "orange", "orangered"];
  const options = {
    chart: {
      type: "pie",
      backgroundColor: null,
      height: "100%",
    },
    title: {
      verticalAlign: "middle",
      enabled: false,
      text:
        link === "Attack"
          ? `<b style="font-size:calc((var(--normal-text-size-value) - 1) * 5vmax + 0.2rem)">Attack</b>`
          : link === "Service"
          ? `<b style="font-size:calc((var(--normal-text-size-value) - 1) * 5vmax + 0.2rem)">Service</b>`
          : `<b style="font-size:calc((var(--normal-text-size-value) - 1) * 5vmax + 0.2rem)">Reception</b>`,
    },
    tooltip: {
      headerFormat: '<span style="font-size:1.5vw">{series.name}</span><br>',
      pointFormat: '<span style="font-size:1.5vw"><b>{point.name}</b></span>',
    },
    plotOptions: {
      series: {
        borderWidth: 0,
        colorByPoint: true,
        colors,
        type: "pie",
        size: "100%",
        innerSize: "50%",
        dataLabels: {
          enabled: true,
          crop: false,
          format: `<b>{point.percentage:.0f}%</b>`,
          distance: "-25%",
          style: {
            fontWeight: "bold",
            fontSize: "calc((var(--normal-text-size-value) - 1) * 5vmax + 0.1rem)",
            color: "black",
          },
        },
        showInLegend: false,
      },
    },
    series: [
      {
        name: link === "Attack" ? "Attack" : link === "Service" ? "Service" : "Reception",
        type: "pie",
        allowPointSelect: false,
        data: [
          [
            link === "Attack" ? "Win" : link === "Service" ? "Ace" : "Perfect Reception",
            rightPercentageForDiagramm(0),
            true,
          ],
          [
            link === "Attack"
              ? "Game +"
              : link === "Service"
              ? "Reception on (-)"
              : "Reception on (+)",
            rightPercentageForDiagramm(1),
            false,
          ],
          [link === "Attack" ? "Game -" : "Reception on (!)", rightPercentageForDiagramm(2), false],
          [
            link === "Attack"
              ? "Block"
              : link === "Service"
              ? "Reception on (+ , #)"
              : "Reception on (-)",
            rightPercentageForDiagramm(3),
            false,
          ],
          ["Error", rightPercentageForDiagramm(4), false],
        ],
      },
    ],
    credits: {
      enabled: false,
    },
  };

  function rightPercentageForDiagramm(index: number) {
    if (playerInfo === null) return;
    if (link === "Attack") {
      const totalAtt = [
        playerInfo["A++"],
        playerInfo["A+"],
        playerInfo["A!"],
        playerInfo["A-"],
        playerInfo["A="],
      ];
      const percentOfActions = totalAtt.map(
        (att) => +((att / getSumofAttacks(playerInfo)) * 100).toFixed(1)
      );
      return percentOfActions[index];
    } else if (link === "Service") {
      const totalService = [
        playerInfo["S++"],
        playerInfo["S+"],
        playerInfo["S!"],
        playerInfo["S-"],
        playerInfo["S="],
      ];
      const sumOfTotalService = totalService.reduce((a, b) => a + b, 0);
      const percentOfActions = totalService.map(
        (service) => +((service / sumOfTotalService) * 100).toFixed(1)
      );
      return percentOfActions[index];
    } else if (link === "Reception") {
      const totalReception = [
        playerInfo["R++"],
        playerInfo["R+"],
        playerInfo["R!"],
        playerInfo["R-"],
        playerInfo["R="],
      ];
      const sumOfTotalReception = totalReception.reduce((a, b) => a + b, 0);
      const percentOfActions = totalReception.map(
        (reception) => +((reception / sumOfTotalReception) * 100).toFixed(1)
      );
      return percentOfActions[index];
    }
  }
  return (
    <div className="diagram-content">
      <HighchartsReact highcharts={Highcharts} options={options} />{" "}
      <div className="split-arrow-wrapper">
        <div className="arrow-content">
          <img src="/photos/arrow.png" />
        </div>
        <div className="percentage-content">50%</div>
      </div>
    </div>
  );
}
