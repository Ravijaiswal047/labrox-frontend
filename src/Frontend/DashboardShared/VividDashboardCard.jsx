import React from "react";

// Colorful pastel KPI tiles matching the app's main dashboard look (rgba
// tint background + solid-color round icon) instead of the muted off-white
// card style -- the muted version read as flat/hard to scan at a glance.
export const vividTileStyle = (hue) => ({
  background: `${hue}20`,
  borderRadius: 10,
  padding: "9px 12px",
  border: `1px solid ${hue}33`,
  display: "flex",
  alignItems: "center",
  gap: 10,
  height: "100%",
});

export const vividIconStyle = (hue) => ({
  width: 30,
  height: 30,
  minWidth: 30,
  borderRadius: "50%",
  background: hue,
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 13,
});

// Same card shell the rest of the app uses (ESG dashboard, Sample Collection
// Status, etc.) -- .card-dashboard for the rounded/shadowed frame,
// .header-dashboard for the bold title -- instead of a one-off card design,
// so every dashboard tab reads as part of the same system.
const VividChartCard = ({ icon, iconColor = "#05004e", title, subtitle, legend = [], children }) => (
  <div className="card-dashboard shadow-lg h-100">
    <div className="d-flex align-items-start gap-2 px-1 pt-1">
      {icon && (
        <span
          style={{
            width: 26,
            height: 26,
            minWidth: 26,
            borderRadius: 7,
            background: `${iconColor}1a`,
            color: iconColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            marginTop: 2,
          }}
        >
          <i className={icon}></i>
        </span>
      )}
      <div>
        <h4 className="header-dashboard m-0" style={{ fontSize: 14.5, color: "#05004e" }}>
          {title}
        </h4>
        {subtitle && (
          <div style={{ fontSize: 11, color: "#737791", fontWeight: 500, marginTop: 1 }}>
            {subtitle}
          </div>
        )}
      </div>
    </div>
    {legend.length > 0 && (
      <div className="d-flex align-items-center flex-wrap gap-3 px-1" style={{ marginTop: 4 }}>
        {legend.map((item) => (
          <span
            key={item.label}
            style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#737791" }}
          >
            <span style={{ width: 9, height: 9, borderRadius: 3, background: item.color }}></span>
            {item.label}
          </span>
        ))}
      </div>
    )}
    <div className="px-1 pb-1">{children}</div>
  </div>
);

export default VividChartCard;
