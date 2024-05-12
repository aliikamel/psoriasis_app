import React from "react";
import Plot from "react-plotly.js";
import { useTheme } from "../../context/ThemeContext";

function MyPlotComponent({ plotData }) {
  const { theme } = useTheme();
  // Extract necessary data from plotData
  const {
    x,
    y,
    curr_week,
    pasis,
    time_pasis,
    pasi_pre_treatment,
    weeks,
    uv_eff,
    abnormal_time_pasis,
    abnormal_pasis,
  } = plotData;

  // Prepare data for the plot
  let fullTime = x[x.length - 1];
  const maxTime = fullTime / 2;

  // Scale the time points to a week format
  const scaledTime = x.map((timePoint) => (timePoint / maxTime) * weeks);
  const scaledTimePasis = time_pasis.map(
    (timePoint) => (timePoint / maxTime) * weeks
  );
  const scaledTimeAbnormalPasis = abnormal_time_pasis.map(
    (timePoint) => (timePoint / maxTime) * weeks
  );

  // find the maximum pasi value
  const max_pasi = Math.max(pasi_pre_treatment, ...pasis);

  const simulatedPASI = {
    x: scaledTime,
    y: y,
    type: "line",
    mode: "lines+markers",
    name: "Simulated PASI",
    line: { color: theme === "dark" ? "white" : "black", width: 1 },
    marker: { color: theme === "dark" ? "white" : "black"},
  };

  const actualPASI = {
    x: scaledTimePasis,
    y: pasis,
    type: "scatter",
    mode: "markers",
    name: "Actual End-Week PASI",
    marker: { color: "#22c55e", size: 16, symbol: "x" },
  };

  const abnormalPasi = {
    x: scaledTimeAbnormalPasis,
    y: abnormal_pasis,
    type: "scatter",
    mode: "markers",
    name: "Abnormal End-Week PASI",
    marker: { color: "red", size: 16, symbol: "x" },
  };

  const preTreatment = {
    x: [0],
    y: [Number(pasi_pre_treatment)],
    type: "scatter",
    mode: "markers",
    name: "PASI Pre-Treatment",
    marker: { color: "blue", size: 16, symbol: "x" },
  };

  // let data = [];

  // x.forEach((val, index) => {
  //   let entry = { Time: scaledTime[index], Pasis: scaledY[index] };
  //   data.push(entry);
  // });

  // console.log(data);

  // let data = [
  //   { Time: 1, Pasis: 8 },
  //   { Time: 2, Pasis: 7 },
  //   { Time: 3, Pasis: 6 },
  //   { Time: 4, Pasis: 4 },
  //   { Time: 5, Pasis: 4 },
  //   { Time: 6, Pasis: 2 },
  //   { Time: 7, Pasis: 1 },
  // ];

  // let actual_pasi = [
  //   { Time: 1, Pasis: 7 },
  //   { Time: 2, Pasis: 5 },
  //   { Time: 3, Pasis: 6 },
  //   { Time: 4, Pasis: 4 },
  //   { Time: 5, Pasis: 3 },
  //   { Time: 6, Pasis: 1 },
  //   { Time: 7, Pasis: 2 },
  // ];

  //  { gridcolor: theme === "dark" ? "#4b5563" : "#f3f4f6" }

  return (
    <div className="mx-auto w-auto h-full">
      <Plot
        className="flex items-center mx-auto w-full h-full dark:bg-gray-700 rounded-2xl p-2"
        // style={{ position: "relative", display: "flex"}}
        data={[simulatedPASI, actualPASI, preTreatment, abnormalPasi]}
        layout={{
          width: 1200,
          height: 500,
          autosize: true,
          margin: {
            // t: 70,
            // l: 70,
            // r: 70,
            // b: 60,
          },
          title: `Week ${curr_week}: Model Simulation and Actual End-Week PASI | UVB Eff: ${uv_eff}`,
          xaxis: {
            title: "Time (weeks)",
            range: [-1, 12], // Ensure this matches the range of your simulation
            gridcolor: theme === "dark" ? "#4b5563" : "#f3f4f6",
          },
          yaxis: {
            title: "PASI",
            range: [0, max_pasi + 1], // Dynamically adjust based on PASI values
            gridcolor: theme === "dark" ? "#4b5563" : "#f3f4f6",
          },
          legend: {
            orientation: "h",
            yanchor: "bottom",
            y: 1.02,
            xanchor: "right",
            x: 1,
            // itemsizing: "trace"
          },
          paper_bgcolor: theme === "dark" ? "#374151" : "white",
          plot_bgcolor: theme === "dark" ? "#374151" : "white",
          font: {
            color: theme === "dark" ? "white" : "black",
          },
        }}
      />
    </div>
  );
}

export default MyPlotComponent;
