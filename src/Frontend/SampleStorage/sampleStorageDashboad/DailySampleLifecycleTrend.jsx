import React, { useState } from "react";
import Chart from "react-apexcharts";

const DailySampleLifecycleTrend = ({graphData=[]}) => {
  const [chartData] = useState({
    series: [
      {
        name: "stored",
        data: graphData?.map((item) => item.Samplestoredcount || 0),
      },
      {
        name: "discarded",
        data: graphData?.map((item) => item.SampleDiscardcount || 0),
      },
      {
        name: "issued",
        data: graphData?.map((item) => item.SampleIssuecount || 0),
      },
      {
        name: "expiredNotDiscarded",
        data: graphData?.map((item) => item.SampleExpiredbutnotdiscard || 0),
      },
    ],
    options: {
      chart: {
        type: "line",
        height: 350,
        zoom: {
          enabled: false,
        },
      },
      stroke: {
        curve: "smooth",
        width: 2,
      },
      markers: {
        size: 4,
      },
      xaxis: {
        // categories: ["10/08", "11/08", "12/08", "13/08"], // dates on x-axis
      },
      yaxis: {
        title: {
          text: "Sample Count",
        },
      },
      colors: ["#4bb6ac", "#e74c3c", "#2c3e50", "#f39c12"],
      legend: {
        position: "bottom",
        horizontalAlign: "center",
      },
      tooltip: {
        shared: true,
        intersect: false,
      },
    },
  });

  return (
    <div className="card p-3 mt-3">
      <h5>Sample Lifecycle Trend</h5>
      <Chart
        options={chartData.options}
        series={chartData.series}
        type="line"
        height={240}
      />
    </div>
  );
};

export default DailySampleLifecycleTrend;
