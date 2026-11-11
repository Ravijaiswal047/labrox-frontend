import { useState } from "react";
import { Link } from "react-router-dom";
import { CustomButton } from "../../../components/UI/CustomButton";

const VisitSummaryCard = () => {
  const [activeTab, setActiveTab] = useState('today');

  const tableData = [
    {
      Date: "24-Feb-2026 03:18 PM",
      RegistrationDate: "24-Feb-2026 03:18 PM",
      PatientName: "Mr. FARAZ",
      Age: "21 Y 0 M 0 D",
      Gender: "Male",
      Department: "BIOCHEMISTRY",
      DoctorName: "Dr. SELF",
      Centre: "UAT-V9 Delhi",
      Mobile: "9829839482",
    },
    {
      Date: "24-Feb-2026 03:18 PM",
      RegistrationDate: "24-Feb-2026 03:18 PM",
      PatientName: "Mr. ASHISH",
      Age: "21 Y 0 M 0 D",
      Gender: "Male",
      Department: "BIOCHEMISTRY",
      DoctorName: "Dr. SELF",
      Centre: "UAT-V9 Delhi",
      Mobile: "9829839482",
    },
    {
      Date: "24-Feb-2026 03:18 PM",
      RegistrationDate: "24-Feb-2026 03:18 PM",
      PatientName: "Mr. PIYUSH",
      Age: "21 Y 0 M 0 D",
      Gender: "Male",
      Department: "BIOCHEMISTRY",
      DoctorName: "Dr. SELF",
      Centre: "UAT-V9 Delhi",
      Mobile: "9829839482",
    },
    {
      Date: "24-Feb-2026 03:18 PM",
      RegistrationDate: "24-Feb-2026 03:18 PM",
      PatientName: "Mr. CHANDAN",
      Age: "21 Y 0 M 0 D",
      Gender: "Male",
      Department: "BIOCHEMISTRY",
      DoctorName: "Dr. SELF",
      Centre: "UAT-V9 Delhi",
      Mobile: "9829839482",
    },
    {
      Date: "24-Feb-2026 03:18 PM",
      RegistrationDate: "24-Feb-2026 03:18 PM",
      PatientName: "Mr. HIMANSHU",
      Age: "21 Y 0 M 0 D",
      Gender: "Male",
      Department: "BIOCHEMISTRY",
      DoctorName: "Dr. SELF",
      Centre: "UAT-V9 Delhi",
      Mobile: "9829839482",
    },
  ]

  return (
    <div className="dashboard-card">
      <div className="header-row">
        <h5 className="card-title">Visit Summary</h5>
        <div className="btn-group">
          <CustomButton
            text={"Today"}
            className={activeTab === 'today' ? 'btn btn-success btn-sm' : 'btn btn-sm'}
            onClick={() => setActiveTab('today')}
          />
          <CustomButton
            text={"2d"}
            className={activeTab === '2d' ? 'btn btn-success btn-sm' : 'btn btn-sm'}
            onClick={() => setActiveTab('2d')}
          />
          <CustomButton
            text={"7d"}
            className={activeTab === '7d' ? 'btn btn-success btn-sm' : 'btn btn-sm'}
            onClick={() => setActiveTab('7d')}
          />
        </div>
      </div>

      <div className="stat-row">
        <div className="stat-box">
          <div style={{ display: 'flex', gap: "5px" }}>
            <i class="bi bi-people-fill stat-icon"></i>
            <div className="stat-value">0</div>
          </div>
          <div className="stat-label">Patient Visits</div>
        </div>
        <div className="stat-box">
          <div style={{ display: 'flex', gap: "5px" }}>
            <i class="bi bi-newspaper stat-icon"></i>
            <div className="stat-value">0</div>
          </div>
          <div className="stat-label">Reports Available</div>
        </div>
      </div>

      {tableData.length > 0 ? (
        <div style={{ height: '100px', overflowY: 'auto' }}>
          {tableData.map((row, idx) => (
            <div className="visit-item" key={idx}>
              <div>
                <div className="fw-bold">{row.PatientName}</div>
                <small className="text-muted">{row.Age} · {row.Gender} · {row.Department}</small>
              </div>
              <div style={{ textAlign: 'right' }}>
                <small className="text-muted">{row.Date}</small><br />
                <small className="text-muted">{row.Mobile}</small>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="alert alert-light">
          No delayed records found
        </div>
      )}

      <Link to="#" className="link-success">
        View All Visits <span style={{ marginLeft: '8px' }}>→</span>
      </Link>
    </div>
  );
};

export default VisitSummaryCard;