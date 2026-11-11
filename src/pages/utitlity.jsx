import moment from "moment";
import BarChart from "./modules/BarChart";
import Chat2 from "./modules/Chat2";
import Linechart from "./modules/Linechart";
import PolarAreaChart from "./modules/PolarAreaChart";
import RadarChart from "./modules/RadarChart";
import { toast } from "react-toastify";
import { axiosInstance } from "../utils/axiosInstance";

export const getColor1 = () => {
  const theme = localStorage?.getItem("Theme");
  switch (theme) {
    case "Default":
      return "#231d8c";
    case "light Green":
      return "#036e21";
    case "Peach":
      return "#a65308";
    case "Pale Pink":
      return "#b50e8b";
    case "Red":
      return "#b50502";
    case "SkyBlue":
      return "#03515e";
    case "Grey":
      return "#4f5152";
    default:
      return "#231d8c";
  }
};

export const getChart = (s, maindashboard, chartLabels) => {
  switch (s) {
    case "Pie Chart":
      return <Chat2 state={maindashboard} chartLabels={chartLabels} />;
      break;
    case "PolarArea Chart":
      return <PolarAreaChart state={maindashboard} chartLabels={chartLabels} />;
      break;
    case "Radar Chart":
      return <RadarChart state={maindashboard} chartLabels={chartLabels} />;
      break;
    case "Line Chart":
      return <Linechart state={maindashboard} chartLabels={chartLabels} />;
      break;
    case "Bar Chart":
      return <BarChart state={maindashboard} chartLabels={chartLabels} />;
      break;
  }
};

export const ChartData = [
  {
    label: "Bar Chart",
    value: "Bar Chart",
  },
  {
    label: "Pie Chart",
    value: "Pie Chart",
  },

  {
    label: "Radar Chart",
    value: "Radar Chart",
  },
  {
    label: "PolarArea Chart",
    value: "PolarArea Chart",
  },
  {
    label: "Line Chart",
    value: "Line Chart",
  },
];

export const fetchuserdata = (data, state) => {
  axiosInstance
    .post("CommonController/UserwiseDashboard", {
      FromDate: moment(data?.FromDate).format("YYYY-MM-DD"),
      ToDate: moment(data?.ToDate).format("YYYY-MM-DD"),
      CentreID: Array.isArray(data?.CentreID)
        ? data?.CentreID
        : [data?.CentreID],
      FromTime: data?.FromTime,
      ToTime: data?.ToTime,
    })
    .then((res) => {
      state(res?.data?.message);
    })
    .catch((err) => {
      toast.error(
        err?.response?.data?.message
          ? err?.response?.data?.message
          : "Something Wents Wrong",
      );
    });
};

export const getDashBoardData = (type, value, payload, state) => {
  axiosInstance
    .post("CommonController/GetDashBoardData", {
      CentreID:
        type === "CentreID"
          ? Array.isArray(value)
            ? value
            : [value]
          : Array.isArray(payload?.CentreID)
            ? payload?.CentreID
            : [payload?.CentreID],
      FromDate:
        type === "FromDate"
          ? moment(value).format("YYYY-MM-DD")
          : moment(payload?.FromDate).format("YYYY-MM-DD"),
      ToDate:
        type === "ToDate"
          ? moment(value).format("YYYY-MM-DD")
          : moment(payload?.ToDate).format("YYYY-MM-DD"),
      FromTime: type === "FromTime" ? value : payload?.FromTime,
      ToTime: type === "ToTime" ? value : payload?.ToTime,
    })
    .then((res) => {
      state(res?.data?.message);
    })
    .catch((err) => {
      toast.error(
        err?.response?.data?.message
          ? err?.response?.data?.message
          : err?.data?.message,
      );
    });
};
