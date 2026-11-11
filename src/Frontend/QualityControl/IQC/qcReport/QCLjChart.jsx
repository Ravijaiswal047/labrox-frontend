import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceArea,
  ReferenceLine
} from "recharts";

 

export default function QCLjChart({ data, mean, sd }) {
    const renderOutsideLabel = (text, color) => ({ viewBox }) => {
        const { x, y, width } = viewBox;

        return (
            <text
                x={x + width + 20}   // ✅ truly outside plot area
                y={y}
                fill={color}
                fontSize={12}
                dominantBaseline="middle"
            >
                {text}
            </text>
        );
    };

    const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  // ✅ QC value line
  const qc = payload.find(p => p.dataKey === "value");

  if (!qc) return null;

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #ccc",
        padding: "8px 12px",
        // minWidth: 130,
      }}
    >
      {/* <div><b>Run:</b> {label}</div> */}
      <div><b>QC Value:</b> &nbsp; {qc.value}</div>
    </div>
  );
};
    
  return (
    
    <ResponsiveContainer width="90%" height={400} className="white-background">
      <LineChart data={data} margin={{ top: 20, right: 90, bottom: 20, left: 20 }}>
        <CartesianGrid 
        // strokeDasharray="3 3" 
        stroke="none"
        />
        <XAxis dataKey="run" />
        {/* <YAxis domain={[mean - 3 * sd, mean + 3 * sd]} /> */}
        {/* <YAxis domain={[mean - 3 * sd, mean + 3 * sd]} /> */}
        <YAxis domain={[mean - 3 * sd, mean + 3 * sd]} tickFormatter={(v) => v.toFixed(1)}/>
              <ReferenceLine
                  y={mean}
                  stroke="green"
                  strokeWidth={2}
                  label={{
                      value: `Mean: ${mean.toFixed(2)}`,
                      position: "right",
                      fill: "green",
                      fontSize: 12
                  }}
                  ifOverflow="extendDomain"
              />

              {/* <ReferenceLine
                  y={mean}
                  stroke="green"
                  strokeWidth={2}
                  label={renderOutsideLabel(`Mean (${mean.toFixed(2)})`, "green")}
              /> */}

              
              <ReferenceLine
                  y={mean + sd}
                  stroke="#8BC34A"
                  strokeDasharray="3 3"
                  label={renderOutsideLabel(`+1SD (${(mean + sd).toFixed(1)})`, "#8BC34A")}
              />

             
              <ReferenceLine
                  y={mean + 2 * sd}
                  stroke="orange"
                  strokeDasharray="3 3"
                  label={renderOutsideLabel(`+2SD (${(mean + (2*sd)).toFixed(1)})`, "orange")}
              />

              
              <ReferenceLine
                  y={mean + 3 * sd}
                  stroke="red"
                  strokeDasharray="3 3"
                  label={renderOutsideLabel(`+3SD (${(mean + (3*sd)).toFixed(1)})`, "red")}
              />

             
              <ReferenceLine
                  y={mean - sd}
                  stroke="#8BC34A"
                  strokeDasharray="3 3"
                  label={renderOutsideLabel(`-1SD (${(mean - sd).toFixed(1)})`, "#8BC34A")}
              />

             
              <ReferenceLine
                  y={mean - 2 * sd}
                  stroke="orange"
                  strokeDasharray="3 3"
                  label={renderOutsideLabel(`-2SD (${(mean - (2*sd)).toFixed(1)})`, "orange")}
              />

             
              <ReferenceLine
                  y={mean - 3 * sd}
                  stroke="red"
                  strokeDasharray="3 3"
                  label={renderOutsideLabel(`-3SD (${(mean - (3*sd)).toFixed(1)})`, "red")}
              /> 

              {/* Optional SD lines */}
              {/* <ReferenceLine y={mean + sd} stroke="#8BC34A" strokeDasharray="3 3" />
              <ReferenceLine y={mean - sd} stroke="#8BC34A" strokeDasharray="3 3" />

              <ReferenceLine y={mean + 2 * sd} stroke="orange" strokeDasharray="3 3" />
              <ReferenceLine y={mean - 2 * sd} stroke="orange" strokeDasharray="3 3" />

              <ReferenceLine y={mean + 3 * sd} stroke="red" strokeDasharray="3 3" />
              <ReferenceLine y={mean - 3 * sd} stroke="red" strokeDasharray="3 3" /> */}
        <Tooltip content={<CustomTooltip />} />
        {/* <Legend display="none"/> */}
        {/* <Legend
  verticalAlign="bottom"
  align="center"
  formatter={(value) => {
    const map = {
      mean: "Mean",
      minus1SD: "-1SD",
      minus2SD: "-2SD",
      minus3SD: "-3SD",
      plus1SD: "+1SD",
      plus2SD: "+2SD",
      plus3SD: "+3SD",
      reading: "QC Value",
    };

    return map[value] || value;
  }}
/> */}
              <ReferenceArea y1={mean - sd} y2={mean + sd} fill="#FFDB58" stroke="none"/>
              <ReferenceArea y1={mean - 2 * sd} y2={mean + 2 * sd} fill="#FFDB58" stroke="none"/>
              <ReferenceArea y1={mean - 3 * sd} y2={mean + 3 * sd} fill="#f369b3" stroke="none"/>

        {/* QC Values */}
        <Line
          type="monotone"
          dataKey="value"
          stroke="#000"
          strokeWidth={2}
          dot={{ r: 4, fill: "#fff", stroke: "#000" }}
          name="QC Value"
        />

        {/* Mean */}
        <Line dataKey="mean" stroke="green" strokeDasharray="4 4" dot={false}/>

        {/* SD Lines */}
        <Line dataKey="plus1SD" stroke="#8BC34A" strokeDasharray="3 3" dot={false}/>
        <Line dataKey="minus1SD" stroke="#8BC34A" strokeDasharray="3 3" dot={false}/>

        <Line dataKey="plus2SD" stroke="orange" strokeDasharray="3 3" dot={false}/>
        <Line dataKey="minus2SD" stroke="orange" strokeDasharray="3 3" dot={false}/>

        <Line dataKey="plus3SD" stroke="red" strokeDasharray="3 3" dot={false}/>
        <Line dataKey="minus3SD" stroke="red" strokeDasharray="3 3" dot={false}/> 
      </LineChart>
    </ResponsiveContainer>
  );
}