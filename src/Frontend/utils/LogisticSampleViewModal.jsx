import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useTranslation } from "react-i18next";

import Tables from "../../components/UI/customTable";
import { CancelButton } from "../../components/UI/CustomButton";

const LogisticSampleViewModal = ({
  show,
  handleClose,
  rows,
  removedRows = [],
  batchNo = "",
}) => {
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(new Set());

  const [t] = useTranslation();

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton>
        <h5 style={{ width: "100%", textAlign: "center", margin: 0 }}>
          {t ? t("Pending Barcode List") : "Pending Barcode List"}
        </h5>
      </Modal.Header>
      <Modal.Body>
        <div className="row gx-3 gy-3">
          <div className="card w-100">
            <div className="card-body p-2">
              <div
                className="table-responsive"
                style={{
                  minHeight: "200px",
                  maxHeight: "250px",
                  overflowY: "auto",
                }}
              >
                <Tables className="table table-sm mb-0 p-2">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>SIN No</th>
                      <th>Patient Name</th>
                      <th>Age</th>
                      <th>Gender</th>
                      <th>Sample Type</th>
                      <th>Test</th>
                      {/* <th>Action</th>
                                            <th>Remove</th> */}
                    </tr>
                  </thead>
                  <tbody>
                    {removedRows?.length > 0 && (
                      <tr>
                        <td colSpan="7" className="text-danger fw-bold">
                          {t("Removed Samples")}
                          {batchNo ? ` — ${batchNo}` : ""}
                        </td>
                      </tr>
                    )}
                    {removedRows?.length > 0 &&
                      removedRows.map((batch, idx) => (
                        <tr key={`rm-${idx}`} className="table-danger">
                          <td data-title={t("#")}>{idx + 1}</td>
                          <td data-title={t("SIN No")}>{batch.BarcodeNo}</td>
                          <td data-title={t("Patient Name")}>{batch.PName}</td>
                          <td data-title={t("Age")}>{batch.Age}</td>
                          <td data-title={t("Gender")}>{batch.Gender}</td>
                          <td data-title={t("Sample Type")}>
                            {batch.SampleTypeName}
                          </td>
                          <td data-title={t("Test")}>
                            {batch.InvestigationName || batch.Test}
                          </td>
                        </tr>
                      ))}
                    {rows.length > 0 ? (
                      rows.map((batch, idx) => (
                        <tr key={idx}>
                          <td data-title={t("#")}>{idx + 1}</td>
                          <td data-title={t("SIN No")}>{batch.BarcodeNo}</td>
                          <td data-title={t("Patient Name")}>{batch.PName}</td>
                          <td data-title={t("Age")}>{batch.Age}</td>
                          <td data-title={t("Gender")}>{batch.Gender}</td>
                          <td data-title={t("Sample Type")}>
                            {batch.SampleTypeName}
                          </td>
                          <td data-title={t("Test")}>
                            {batch.InvestigationName}
                          </td>
                          {/* <td data-title={t("Action")}>
                                  <button className="btn btn-sm btn-danger text-white">Reject</button>
                              </td>
                              <td data-title={t("Remove")}>
                                  <button className="btn btn-sm btn-danger text-white">
                                      <FontAwesomeIcon icon={faTrash} />
                                  </button>
                              </td> */}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="9" className="text-center text-muted py-3">
                          {t("No data found")}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Tables>
              </div>
            </div>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <CancelButton
          text={"Close"}
          onClick={handleClose}
          disabled={loading}
        />
      </Modal.Footer>
    </Modal>
  );
};

export default LogisticSampleViewModal;
