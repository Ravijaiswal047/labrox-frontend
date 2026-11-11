// import React, { useState } from "react";
// import Chart from "react-apexcharts";

// const BarChart = ({chartDatas=[]}) => {
//   const [chartData] = useState({
//     series: chartDatas,
//     options: {
//       chart: {
//         type: "bar",
//         stacked: false,
//         toolbar: { show: false },
//       },
//       plotOptions: {
//         bar: {
//           horizontal: false,
//           columnWidth: "50%",
//           endingShape: "rounded",
//         },
//       },
//       dataLabels: {
//         enabled: false,
//       },
//       stroke: {
//         show: true,
//         width: 1,
//         colors: ["transparent"],
//       },
//       xaxis: {
//         categories: ["Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata"],
//       },
//       yaxis: {
//         title: {
//           text: "₹",
//         },
//         labels: {
//           formatter: function (val) {
//             return "₹" + (val / 1000).toFixed(0) + "k";
//           },
//         },
//       },
//       fill: {
//         opacity: 1,
//       },
//       colors: ["#f46d5f", "#2ca69a"], // Issue = Red, Consumption = Teal
//       legend: {
//         position: "bottom",
//       },
//       title: {
//         text: "Branch Vs Expense Location",
//         align: "left",
//         style: {
//           fontSize: "18px",
//           fontWeight: "bold",
//           color: "#051c68",
//         },
//       },
//       subtitle: {
//         text: "Expense Issue Vs Consumption",
//         align: "left",
//         style: {
//           fontSize: "14px",
//           color:"rgb(102, 102, 102)"
//         },
//       },
//     },
//   });

//   return (
//     <div className="card mt-3">
//       <div className="row p-2">
//         <div className="col-sm-12">
//           <Chart
//             options={chartData.options}
//             series={chartData.series}
//             type="bar"
//             height={300}
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BarChart;

import React from "react";
import Chart from "react-apexcharts";

const BarChart = ({ series = [], categories = [] }) => {
  const chartData = {
    series: series,
    options: {
      chart: {
        type: "bar",
        stacked: false,
        toolbar: { show: false },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "50%",
          endingShape: "rounded",
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: true,
        width: 1,
        colors: ["transparent"],
      },
      xaxis: {
        categories: categories?.map((item, idx)=>{
          if(item?.length > 10){
            return `${item}...`?.slice(0,10)
          }
          return item
        }),
      },
      yaxis: {
        title: {
          text: "₹",
        },
        labels: {
          formatter: function (val) {
            return "₹" + (val / 1000).toFixed(0) + "k";
          },
        },
      },
      fill: {
        opacity: 1,
      },
      colors: ["#f46d5f", "#2ca69a"], // Customize if needed
      legend: {
        position: "bottom",
      },
      title: {
        text: "Branch Vs Expense Location",
        align: "left",
        style: {
          fontSize: "18px",
          fontWeight: "bold",
          color: "#051c68",
        },
      },
      subtitle: {
        text: "Expense Issue Vs Consumption",
        align: "left",
        style: {
          fontSize: "14px",
          color: "rgb(102, 102, 102)",
        },
      },
    },
  };

  return (
    <div className="card mt-3">
      <div className="row p-2">
        <div className="col-sm-12">
          <Chart
            options={chartData.options}
            series={chartData.series}
            type="bar"
            height={300}
          />
        </div>
      </div>
    </div>
  );
};

export default BarChart;

