import { CustomButton } from "../../../components/UI/CustomButton";

const InvoiceItem = ({ invNo, invDate, invAmt, dueDate, osAmt, isOverdue }) => {
  return (
    <div className="invoice-item">
      <div className="invoice-header">
        <div className="invoice-details">
          <div className="fw-bold">Inv No: {invNo}</div>
        </div>
        <CustomButton text={"Pay Now"}  />
      </div>
      <div className="invoice-row">
        <span>Inv Date: <span className={isOverdue ? 'text-danger' : ''}>{invDate}</span></span>
        <span>Inv Amt: ₹{invAmt}</span>
      </div>
      <div className="invoice-row">
        <span>Due Date: <span className={isOverdue ? 'text-danger' : ''}>{dueDate}</span></span>
        <span>O/S Amt: ₹{osAmt}</span>
      </div>
    </div>
  );
};

export default InvoiceItem;