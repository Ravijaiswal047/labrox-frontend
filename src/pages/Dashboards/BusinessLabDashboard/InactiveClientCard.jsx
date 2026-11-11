import React from 'react';
import './InactiveClientCard.css';

const InactiveClientCard = ({ clientName, branch, lastDate, lastBill, daysInactive, borderColor }) => {
  return (
    <div className="inactive-client-card" style={{ borderLeftColor: borderColor }}>
      <div className="inactive-card-content">
        <div className="inactive-card-left">
          <div className="inactive-client-name">{clientName}</div>
          <div className="inactive-branch">
            <span className="location-icon">📍</span>
            {branch}
          </div>
          <div className="inactive-meta">
            <span className="meta-badge date-badge">
              <span className="badge-icon">📅</span>
              Last: {lastDate}
            </span>
            <span className="meta-badge bill-badge">
              <span className="badge-icon">₹</span>
              {lastBill} last bill
            </span>
          </div>
        </div>
        <div className="inactive-card-right">
          <div className="days-count">{daysInactive}</div>
          <div className="days-label">DAYS</div>
        </div>
      </div>
    </div>
  );
};

export default InactiveClientCard;