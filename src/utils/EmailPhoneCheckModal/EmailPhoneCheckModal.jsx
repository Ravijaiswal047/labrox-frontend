import React, { useState } from "react";
import { Dialog } from "primereact/dialog";
import { useLocalStorage } from "../hooks/useLocalStorage";

const EmailPhoneCheckModal = ({ show, handleClose, data, type, onConfirm }) => {
  const theme = useLocalStorage("theme", "get");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);

  const handleContinueClick = () => {
    setShowConfirmation(true);
  };

  const handleStatusChange = (value) => {
    setSelectedStatus(value);
  };

  const handleConfirmSubmit = () => {
    if (!selectedStatus) return;

    const isYes = selectedStatus === 1;

    if (onConfirm) {
      onConfirm(isYes); 
    }

    setShowConfirmation(false);
    setSelectedStatus(null);
    handleClose();
  };

  const handleConfirmCancel = () => {
    setShowConfirmation(false);
    setSelectedStatus(null);
  };

  const footer = (
    <div>
      <button className="btn btn-primary" onClick={handleContinueClick}>
        Do you want to continue?
      </button>
      <button className="btn btn-secondary ml-2" onClick={handleClose}>
        Close
      </button>
    </div>
  );

  const confirmationFooter = (
    <div>
      <button className="btn btn-secondary" onClick={handleConfirmCancel}>
        Cancel
      </button>
      <button
        className="btn btn-primary ml-2"
        onClick={handleConfirmSubmit}
        disabled={!selectedStatus}
      >
        Save
      </button>
    </div>
  );

  return (
    <>
      <Dialog
        header={
          <div>{type === "Email" ? "Email" : "Phone"} Registration Details</div>
        }
        visible={show}
        className={theme}
        style={{ width: "70vw" }}
        onHide={handleClose}
        footer={footer}
        maximizable
        modal
      >
        <div>
          {data && data.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Centre Name</th>
                    <th>Centre Code</th>
                    <th>RateType Code</th>
                    <th>Email</th>
                    <th>Phone / Mobile</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{item.Centre || "-"}</td>
                      <td>{item.CentreID || "-"}</td>
                      <td>{item.CentreCode || "-"}</td>
                      <td>
                        {item.EMail ? (
                          item.EMail
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td>
                        {item.Phone || item.Mobile ? (
                          item.Phone || item.Mobile
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td>{item.IsActive ? "Active" : "Inactive"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center p-4">
              <div className="mb-3">
                <span style={{ fontSize: "3rem" }}>ℹ️</span>
              </div>
              <h5>No Records Found</h5>
              <p>No records found for this {type?.toLowerCase()}</p>
            </div>
          )}
        </div>

        {/* Nested Confirmation Dialog */}
        {showConfirmation && (
          <Dialog
            header="Confirmation"
            visible={showConfirmation}
            style={{ width: "30vw" }}
            className={theme}
            onHide={handleConfirmCancel}
            footer={confirmationFooter}
            modal
          >
            <div className="p-3">
              <p className="mb-3">
                This {type === "Email" ? "email" : "phone number"} is already
                registered.Do You Want To Continue ?
              </p>  
              <div className="form-group">
                <label>Select Option</label>
                <select
                  className="form-control"
                  value={selectedStatus || ""}
                  onChange={(e) =>
                    handleStatusChange(parseInt(e.target.value) || null)
                  }
                >
                  <option value="">-- Select --</option>
                  <option value={1}>Yes - Continue with same {type}</option>
                  <option value={2}>No - Clear {type} field</option>
                </select>
              </div>
            </div>
          </Dialog>
        )}
      </Dialog>
    </>
  );
};

export default EmailPhoneCheckModal;
