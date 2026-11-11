import { useState } from "react";

const TestsRevenueCard = () => {
  const [selectedMonth, setSelectedMonth] = useState('Dec 2025');

  return (
    <div className="dashboard-card">
      <div className="header-row">
        <h5 className="card-title">Tests & Revenue</h5>
        <select 
          className="form-select" 
          value={selectedMonth} 
          onChange={(e) => setSelectedMonth(e.target.value)}
        >
          <option>Dec 2025</option>
          <option>Nov 2025</option>
          <option>Oct 2025</option>
        </select>
      </div>
      
      <div style={{ textAlign: 'right', marginBottom: '10px' }}>
        <small className="text-muted">Sort by Revenue ∨</small>
      </div>
      
      <div className="test-item">
        <div>
          <div className="fw-bold">NMO with MOG Antibody Profile, Serum</div>
          <small className="text-muted">Count: 1</small>
        </div>
        <div className="fw-bold">₹3250</div>
      </div>
    </div>
  );
};

export default TestsRevenueCard;