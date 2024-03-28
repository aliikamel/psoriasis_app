import React from "react";
import Plot from "react-plotly.js";
import { useTheme } from "../../context/ThemeContext";
// import { LineChart } from "@tremor/react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { X } from "lucide-react";

function MyPlotComponent({ plotData }) {
  const { theme } = useTheme();
  // Extract necessary data from plotData
  const { x, y, curr_week, end_week_pasis, pasi_pre_treatment, weeks, uv_eff } =
    plotData;

  // Prepare data for the plot
  const scaledY = y.map((value) => value * Number(pasi_pre_treatment));
  // Assuming plotData contains your simulation data including the time points
  let fullTime = x[x.length - 1];
  const maxTime = fullTime / 2;

  // Scale the time points to a 0-12 week range
  const scaledTime = x.map((timePoint) => (timePoint / maxTime) * weeks);

  const simulatedPASI = {
    x: scaledTime, // Already adjusted to represent weeks
    y: scaledY,
    type: "scatter",
    mode: "lines+markers",
    name: "Simulated PASI",
    line: { color: theme === "dark" ? "white" : "black" },
    marker: { color: theme === "dark" ? "white" : "black" },
  };

  const actualPASI = {
    x: Object.keys(end_week_pasis), // Assuming this is an array or object of week numbers
    y: Object.values(end_week_pasis), // Assuming this is an array or object of actual PASI values for end weeks
    type: "scatter",
    mode: "markers",
    name: "Actual End-Week PASI",
    marker: { color: "red", size: 10, symbol: "x" },
  };

  const preTreatment = {
    x: [0], // Assuming this is an array or object of week numbers
    y: [Number(pasi_pre_treatment)], // Assuming this is an array or object of actual PASI values for end weeks
    type: "scatter",
    mode: "markers",
    name: "PASI Pre-Treatment",
    marker: { color: "blue", size: 16, symbol: "x" },
  };

  let data = [];

  x.forEach((val, index) => {
    let entry = { Time: scaledTime[index], Pasis: scaledY[index] };
    data.push(entry);
  });

  console.log(data);

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

  return (
    <div className="mx-auto w-2/3 h-full">
      <Plot
        className="flex items-center mx-auto w-full h-full dark:bg-gray-700 rounded-2xl p-2"
        // style={{ position: "relative", display: "flex"}}
        data={[simulatedPASI, actualPASI, preTreatment]}
        layout={{
          width: 960,
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
          },
          yaxis: {
            title: "PASI",
            range: [0, pasi_pre_treatment + 1], // Dynamically adjust based on PASI values
          },
          legend: {
            orientation: "h",
            yanchor: "bottom",
            y: 1.02,
            xanchor: "right",
            x: 1,
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

// <h3 className="text-lg font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
//   {`Week ${curr_week}: Model Simulation and Actual End-Week PASI | UVB Eff: ${uv_eff}`}
// </h3>

// <LineChart
//   className="mt-4 dark:bg-gray-700 w-1/2 h-72"
//   data={data}
//   index="Time"
//   categories={["Pasis"]}
//   colors={["blue"]}
//   yAxisWidth={30}
//   showXAxis={true}
//   showYAxis={true}
// />

//

//       <div className="h-96 rounded-lg bg-white dark:bg-gray-700 py-6 text-white">
//   <ResponsiveContainer width="100%" height="100%">
//     <LineChart
//       width={730}
//       height={250}
//       data={data}
//       margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
//     >
//       <CartesianGrid
//         // strokeDasharray="3 3"
//         fill={theme === "dark" ? "#1f2937" : "#fff"}
//         fillOpacity={0.6}
//       />
//       <XAxis
//         label={"Time"}
//         dataKey="Time"
//         stroke={theme === "dark" ? "#fff" : "#1f2937"}
//       />
//       <YAxis
//         label={"PASI"}
//         dataKey="Pasis"
//         stroke={theme === "dark" ? "#fff" : "#1f2937"}
//         padding={{ top: 20 }}
//       />
//       <Tooltip />
//       <Legend verticalAlign="top" height={36} />
//       <Line
//         type="monotone"
//         dataKey="Pasis"
//         strokeWidth={3}
//         stroke="#3b82f6"
//       />
//       <Line
//         type="monotone"
//         dataKey="ActualPasi"
//         stroke="#8884d8"
//         dot={<X />}
//       />
//     </LineChart>
//   </ResponsiveContainer>
// </div>
