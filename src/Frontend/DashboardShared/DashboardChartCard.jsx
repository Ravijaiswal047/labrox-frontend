import React from "react";
import {
  cardStyle,
  headerRowStyle,
  iconBadgeStyle,
  titleStyle,
  subtitleStyle,
  legendRowStyle,
  legendItemStyle,
  legendDot,
  ACCENT,
} from "./dashboardTheme";

// Common shell for every chart tile across the dashboard tabs: icon + title +
// subtitle header, an optional color legend, then the chart/content itself.
const DashboardChartCard = ({
  icon,
  iconColor = ACCENT,
  title,
  subtitle,
  legend = [],
  children,
  style,
}) => (
  <div style={{ ...cardStyle, ...style }}>
    <div style={headerRowStyle}>
      {icon && (
        <span style={iconBadgeStyle(iconColor)}>
          <i className={icon}></i>
        </span>
      )}
      <div>
        <div style={titleStyle}>{title}</div>
        {subtitle && <div style={subtitleStyle}>{subtitle}</div>}
      </div>
    </div>
    {legend.length > 0 && (
      <div style={legendRowStyle}>
        {legend.map((item) => (
          <span key={item.label} style={legendItemStyle}>
            <span style={legendDot(item.color)}></span>
            {item.label}
          </span>
        ))}
      </div>
    )}
    {children}
  </div>
);

export default DashboardChartCard;
