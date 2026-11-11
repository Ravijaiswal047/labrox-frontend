import React, { useState } from "react";
import Chart from "react-apexcharts";

const BarChart = ({ graphData = [] }) => {
  
  const categories = graphData.map((item) => item.centreName);
  const series = [
    {
      name: "Stored",
      data: graphData.map((item) => item.Samplestoredcount || 0),
    },
    {
      name: "Discarded",
      data: graphData.map((item) => item.SampleDiscardcount || 0),
    },
    {
      name: "Issued",
      data: graphData.map((item) => item.SampleIssuecount || 0),
    },
    {
      name: "Expired",
      data: graphData.map((item) => item.SampleExpiredbutnotdiscard || 0),
    },
  ];

  const [chartData] = useState({
    // series: [
    //   {
    //     name: "Stored",
    //     data: [135, 180, 90],
    //   },
    //   {
    //     name: "Discarded",
    //     data: [30, 20, 5],
    //   },
    //   {
    //     name: "Issued",
    //     data: [25, 28, 7],
    //   },
    //   {
    //     name: "Expired",
    //     data: [5, 12, 1],
    //   },
    // ],
    series: series,
    options: {
      chart: {
        type: "bar",
        stacked: false,
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "55%",
          endingShape: "rounded",
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: true,
        width: 2,
        colors: ["transparent"],
      },
      xaxis: {
        categories: categories
        // ["Branch A", "Branch B", "Branch C"],
      },
      yaxis: {
        title: {
          text: "Count",
        },
      },
      fill: {
        opacity: 1,
      },
      colors: ["#2ca69a", "#f46d5f", "#1f3d4c", "#e3c46b"],
      legend: {
        position: "bottom",
      },
    },
  });

  return (
    <div className="card mt-3">
      <div className="row p-2">
        <div className="col-sm-12">
          <label>Sample Lifecycle by Branch</label>
          <Chart
            options={chartData.options}
            series={chartData.series}
            type="bar"
            height={250}
          />
        </div>
      </div>
    </div>
  );
};

export default BarChart;
