import React from "react";
import Tables from "../../../components/UI/customTable";
import { useTranslation } from "react-i18next";

const DoctorAssignDeparmentTable = ({ tableData = [] }) => {
  const { t } = useTranslation();

  const totalAmount = tableData.reduce(
    (sum, row) => sum + Number(row?.DoctorShare),
    0,
  );

  return (
    <div className="col-12">
      <Tables>
        <thead>
          <tr>
            <th>S.No.</th>
            <th>Department</th>
            <th>Doctor Name</th>
            <th>Assigned</th>
            <th>Share Amount</th>
          </tr>
        </thead>

        <tbody>
          {tableData.map((row, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{row?.Department}</td>
              <td>{row?.DoctorName}</td>
              <td>{row?.AssignedCase}</td>
              <td>{row?.DoctorShare}</td>
            </tr>
          ))}
          <tr style={{ fontWeight: "bold" }}>
            <td></td>
            <td></td>
            <td></td>
            <td>Total Amount</td>
            <td style={{ fontWeight: "bold" }}>{totalAmount}</td>
          </tr>
        </tbody>
      </Tables>
    </div>
  );
};

export default DoctorAssignDeparmentTable;
