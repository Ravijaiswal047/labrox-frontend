import React, { useState } from "react";
import Chart from "react-apexcharts";

const PieChartExample = () => {
  const [chartData] = useState({
    series: [56, 16, 13, 11, 3], // Matching percentages from image
    options: {
      chart: {
        type: "pie",
      },
      labels: ["Bangalore", "Chennai", "Mumbai", "Delhi", "Kolkata"], // Branch-wise labels
      colors: ["#1f3d4c", "#f4a261", "#f46d5f", "#2ca69a", "#e3c46b"], // Exact colors from image
      legend: {
        position: "bottom",
        horizontalAlign: "center",
        fontSize: "14px",
        markers: {
          radius: 12,
        },
      },
      dataLabels: {
        enabled: true,
        formatter: (val) => `${val.toFixed(0)}%`, // Show whole number percentages
        style: {
          fontSize: "14px",
          colors: ["#fff"],
        },
      },
      stroke: {
        colors: ["#fff"],
      },
      title: {
        text: "Branch Wise Expense Allocation",
        align: "left",
        style: {
          fontSize: "18px",
          fontWeight: "bold",
          color: "#051c68",
        },
      },
      subtitle: {
        text: "A pie chart showing the distribution of expenses by branch.",
        align: "left",
        style: {
          fontSize: "14px",
          color: "rgb(102, 102, 102)"
        },
      },
    },
  });

  return (
    <div className="card mt-3">
      <div className="row p-2">
        <div className="col-sm-12">
          <Chart
            options={chartData.options}
            series={chartData.series}
            type="pie"
            height="300"
            width="380"
          />
        </div>
      </div>
    </div>
  );
};

export default PieChartExample;
