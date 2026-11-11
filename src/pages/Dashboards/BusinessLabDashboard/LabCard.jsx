import React from 'react';
import './LabCard.css';

const LabCard = ({ title, registrations, netAmount, icon, bgColor }) => {
  return (
    <div className="lab-card">
      <div className="card-top-bar" style={{ background: `linear-gradient(90deg, ${bgColor}, ${bgColor}dd)` }}></div>
      <div className="card-content">
        <div className="card-icon-wrapper" style={{ backgroundColor: `${bgColor}15` }}>
          <span className="card-icon-emoji">{icon}</span>
        </div>
        <div className="card-label">{title}</div>
        <div className="card-main-value">{registrations}</div>
        <div className="card-subtext">Total Patients Today</div>
        <div className="card-divider"></div>
        <div className="card-amount-label">NET AMOUNT</div>
        <div className="card-amount-value" style={{ color: bgColor }}>{netAmount}</div>
      </div>
    </div>
  );
};

export default LabCard;