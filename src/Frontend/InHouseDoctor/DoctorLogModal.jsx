import React, { useState } from "react";
import { Button } from "react-bootstrap";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import FileUpload from "../../Frontend/utils/UploadFileModal/FileUpload";
import TextAreaInput from "../../components/formComponent/TextAreaInput";
import "./InHouseDoctor.css";

const DoctorLogModal = ({ sharedData }) => {
  console.log(sharedData, "sharedData in log modal");

  return (
    <>
      <div className="row _client_log border-bottom mb-2 pb-2">
        <p className="col-md-6 mb-0">
          <span>Employee Name : </span>
          <span>{sharedData[0]?.EmployeeName}</span>
        </p>
        <p className="col-md-6 mb-0">
          <span>Item Name: </span>
          <span>{sharedData[0]?.ItemName}</span>
        </p>
      </div>
      <div className="table-container">
        <div className="table-wrapper">
          <table className="responsive-table">
            <thead>
              <tr>
                <th rowSpan="2">Sr.No.</th>
                <th colSpan="6">OLD Value</th>
                <th colSpan="6">New Value</th>
              </tr>
              <tr>
                <th>Share Type</th>
                <th>Value</th>
                <th>Dicount On</th>
                <th>Calculation</th>
                <th>Created By</th>
                <th>Created Date</th>
                <th>Share Type</th>
                <th>Value</th>
                <th>Dicount On</th>
                <th>Calculation</th>
                <th>Change By</th>
                <th>Change Date</th>
              </tr>
            </thead>
            <tbody>
              {sharedData.length > 0 ? (
                sharedData.map((row, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{row.OldShareType || "-"}</td>
                    <td>{row.OldShareValue ?? "-"}</td>
                    <td>{row.OldDiscountOn ?? "-"}</td>
                    <td>{row.OldCalculationBasis ?? "-"}</td>
                    <td>{row.OLDCreatedByName ?? "-"}</td>
                    <td>{row.OLDdtEntry ?? "-"}</td>
                    <td>{row.NewShareType || "-"}</td>
                    <td>{row.NewShareValue ?? "-"}</td>
                    <td>{row.NewDiscountOn ?? "-"}</td>
                    <td>{row.NewCalculationBasis ?? "-"}</td>
                    <td>{row.NewCreatedByName ?? "-"}</td>
                    <td>{row.NewdtEntry ?? "-"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="12" className="text-center">
                    No Records Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default DoctorLogModal;
