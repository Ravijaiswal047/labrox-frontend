import React, { useState } from "react";
import Chart from "react-apexcharts";

const PieChartExample = ({pieType='pie'}) => {
const [chartData] = useState({
  series: [410, 59, 63, 20],
  options: {
    chart: {
      type: pieType, // Use pieType prop to set chart type
    },
    labels: [
      "Total Sample Storage",
      "Total Sample Discarded",
      "Total Sample Issued",
      "Expired Not Discarded",
    ],
    colors: ["#cdd7e6", "#d6f5e1", "#c7c4df", "#d2d7f4"],
    legend: {
      position: "bottom",
      horizontalAlign: "center",
      markers: {
        radius: 12,
      },
      fontSize: "14px",
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => `${val.toFixed(1)}%`,
      style: {
        fontSize: "14px",
        colors: ["#000"],
      },
    },
    stroke: {
      colors: ["#fff"],
    },
  },
});

  return (
    <div className="card mt-3">
      <div className="row p-2">
        <div className="col-sm-12">
          <label>Overall Splits</label>
          <Chart
            options={chartData.options}
            series={chartData.series}
            type="pie"
            height="265"
            width="380"
          />
        </div>
      </div>
    </div>
  );
};

export default PieChartExample;
