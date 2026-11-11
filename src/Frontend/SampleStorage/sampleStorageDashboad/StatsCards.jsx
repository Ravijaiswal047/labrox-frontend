import React from "react";
import "./SampleStorageDashboard.css";
import { useTranslation } from "react-i18next";

const colorArr = [
  {
    titleKey: "Total Sample Storage",
    value: 410,
    bgColor: "rgba(37, 76, 123, 0.2)",
    iconClass: "fa fa-cube",
    iconColor: "red",
  },
  {
    titleKey: "Total Sample Discarded",
    value: 59,
    bgColor: "rgba(53, 234, 132, 0.2)",
    iconClass: "fa fa-trash",
    iconColor: "red",
  },
  {
    titleKey: "Total Sample Issued",
    value: 63,
    bgColor: "rgba(11, 9, 110, 0.2)",
    iconClass: "fa fa-share-alt",
    iconColor: "red",
  },
  {
    titleKey: "Expired Not Discarded",
    value: 20,
    bgColor: "#193cad33",
    iconClass: "fa fa-exclamation-triangle",
    iconColor: "red",
    valueColor: "#d81010ff",
  },
];


const StatsCards = ({cardsData=[]}) => {
  const { t } = useTranslation();

  return (
    <div className="dashboard-wrapper mt-3">
      <div className="dashboard-section">

        <div className="dashboard-cards">
          {cardsData?.map((card, index) => (
            <div
              key={index}
              className="dashboard-card"
              style={{ backgroundColor: colorArr[index]?.bgColor }}
            >
              <h4 className="dashboard-card-title">{t(card?.keyname)}</h4>
              <div className="dashboard-card-content">
                <i
                  className={colorArr[index]?.iconClass}
                  style={{ color: card.iconColor }}
                ></i>
                <h4
                  className="dashboard-card-value"
                  style={{ color: colorArr[index]?.valueColor || "#000" }}
                >
                  {card?.keyvalue}
                </h4>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatsCards;
