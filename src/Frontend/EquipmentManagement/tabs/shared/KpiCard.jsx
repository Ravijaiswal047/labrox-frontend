import React from "react";

/** Summary tile. `tone` colours the left rule: neutral | good | warning | critical | info */
const KpiCard = ({ tone = "neutral", value, label }) => (
  <div className={`em-kpi em-kpi-${tone}`}>
    <div className="em-kpi-value">{value}</div>
    <div className="em-kpi-label">{label}</div>
  </div>
);

export default KpiCard;
