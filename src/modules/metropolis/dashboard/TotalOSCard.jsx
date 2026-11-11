import { Link } from "react-router-dom";
import InvoiceItem from "./InvoiceItem";

const TotalOSCard = () => {
  const invoices = [
    { invNo: '140841578', invDate: '30/11/2025', invAmt: '48505.00', dueDate: '30/12/2025', osAmt: '48505.00', isOverdue: false },
    { invNo: '139130578', invDate: '31/10/2025', invAmt: '53225.00', dueDate: '30/11/2025', osAmt: '53225.00', isOverdue: true },
    { invNo: '137025069', invDate: '30/09/2025', invAmt: '42903.01', dueDate: '30/10/2025', osAmt: '42903.01', isOverdue: true }
  ];

  return (
    <div className="dashboard-card">
      <div className="header-row">
      <h5 className="card-title">Total O/S: ₹109633.01</h5>
      <div className="fw-bold"  >Last 3 months invoices</div>

      </div>
      
      
      <div className="invoice-list">
        {invoices.map((invoice, idx) => (
          <InvoiceItem key={idx} {...invoice} />
        ))}
      </div>
      
      <Link to="#" className="link-success">
        View All Invoices <span style={{ marginLeft: '8px' }}>→</span>
      </Link>
    </div>
  );
};

export default TotalOSCard;