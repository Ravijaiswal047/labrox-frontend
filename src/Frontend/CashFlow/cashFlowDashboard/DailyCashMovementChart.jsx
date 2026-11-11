import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function DailyCashMovementChart({ data }) {
  console.log(data);
  const dataItem = data?.map((ele, ind) => ({
    date: ele?.date,
    amount: ele?.amount,
  }));

  return (
    // <div style={{ width: "100%", height: 100 }}>
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={dataItem}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="amount"
          stroke="#00A499"
          strokeWidth={2}
          dot={{ r: 5, fill: "#fff", stroke: "#00A499", strokeWidth: 2 }}
          activeDot={{ r: 7 }}
        />
      </LineChart>
    </ResponsiveContainer>
    // </div>
  );
}
