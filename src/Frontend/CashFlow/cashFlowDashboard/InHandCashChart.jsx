import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Manager", cash: 50000 },
  { name: "Admin User", cash: 28000 },
  { name: "Field Boy 1", cash: 5000 },
  { name: "Field Boy 2", cash: 3000 },
];

export default function InHandCashChart({ data }) {
  console.log(data);
  const dataItem = data?.map((ele, ind) => ({
    name: ele?.userName,
    cash: ele?.inHandCash,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={dataItem}
        layout="vertical"
        // margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis dataKey="name" type="category" />
        <Tooltip />
        <Bar dataKey="cash" fill="#e26b4d" barSize={40} radius={[5, 5, 5, 5]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
