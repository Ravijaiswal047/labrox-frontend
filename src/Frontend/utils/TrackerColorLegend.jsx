import React from "react";
import { useTranslation } from "react-i18next";
import { TrackerStatusLegend, getStatusColor } from "../../utils/Constants";

const TrackerColorLegend = () => {
  const { t } = useTranslation();
  return (
    <div className="tracker-color-legend mb-1" title={t("Status color meaning")}>
      {TrackerStatusLegend.map((item) => (
        <span className="tracker-color-legend-item" key={item.value}>
          <span
            className="tracker-color-legend-dot"
            style={{ backgroundColor: getStatusColor(item.value) }}
          />
          {t(item.label)}
        </span>
      ))}
    </div>
  );
};

export default TrackerColorLegend;
