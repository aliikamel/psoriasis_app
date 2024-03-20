import React from "react";
import Plot from "react-plotly.js";

function MyPlotComponent({ plotData }) {
  // Extract necessary data from plotData
  const { x, y, curr_week, end_week_pasis, pasi_pre_treatment, weeks, uv_eff } =
    plotData;

  // Prepare data for the plot
  const scaledY = y.map((value) => value * Number(pasi_pre_treatment));
  // Assuming plotData contains your simulation data including the time points
  const maxTime = 85;

  // Scale the time points to a 0-12 week range
  const scaledTime = x.map((timePoint) => (timePoint / maxTime) * weeks);

  const simulatedPASI = {
    x: scaledTime, // Already adjusted to represent weeks
    y: scaledY,
    type: "scatter",
    mode: "lines+markers",
    name: "Simulated PASI",
    line: { color: "black" },
    marker: { color: "black" },
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

  return (
    <Plot
      data={[simulatedPASI, actualPASI, preTreatment]}
      layout={{
        width: 720,
        height: 440,
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
      }}
    />
  );
}

export default MyPlotComponent;
