import React, { useState } from "react";
import ReactSelect from "../../../components/formComponent/ReactSelect";
import CustomTable from "../../../components/UI/Table/CustomTable";
import Heading from "../../../components/UI/Heading";

const DetailedTable = () => {
  const doctorOptions = [
    { label: "Dr. John Smith", value: "John Smith" },
    { label: "Dr. Priya Mehta", value: "Priya Mehta" },
    { label: "Dr. Ahmed Khan", value: "Ahmed Khan" },
    { label: "Dr. Emily Davis", value: "Emily Davis" },
  ];

  const departmentOptions = [
    { label: "Cardiology", value: "Cardiology" },
    { label: "Neurology", value: "Neurology" },
    { label: "Orthopedics", value: "Orthopedics" },
    { label: "Radiology", value: "Radiology" },
    { label: "Pathology", value: "Pathology" },
  ];
  const tableHeader = [
    { header: "S.No", field: "SrNo", width: "4%" },
    { header: "Visit Date", field: "visitDate", width: "8%" },
    { header: "Visit No", field: "visitNo", width: "10%" },
    { header: "Patient Info", field: "patientInfo", width: "15%" },
    { header: "Test Name", field: "testName", width: "20%" },
    { header: "Net Amount", field: "netAmount", width: "8%" },
    { header: "Net Share", field: "netShare", width: "8%" },
  ];

  const [payload, setPayload] = useState({
    DoctorName: "",
    department: "",
  });

  const handleReactChange = (name, e) => {
    setPayload((prev) => ({ ...prev, [name]: e }));
  };

  const tableData = [
    {
      visitDate: "2025-08-10",
      visitNo: "V001",
      patientInfo: "John Doe / M / 45",
      testName: "Blood Test",
      netAmount: 1500,
      netShare: 800,
    },
    {
      visitDate: "2025-08-11",
      visitNo: "V002",
      patientInfo: "Jane Smith / F / 38",
      testName: "MRI Scan",
      netAmount: 5000,
      netShare: 3000,
    },
    {
      visitDate: "2025-08-12",
      visitNo: "V003",
      patientInfo: "Raj Kumar / M / 52",
      testName: "ECG",
      netAmount: 800,
      netShare: 400,
    },
  ];

  return (
    <>
      <Heading title={"Detailed Summery"} />
      <div className="DetailedTable_main row mt-2 mb-3">
        <div className="col-sm-3 col-md-3">
          <ReactSelect
            dynamicOptions={doctorOptions}
            isShowBorder={true}
            name="DoctorName"
            lable={"Doctor Name"}
            id="DoctorName"
            removeIsClearable={false}
            placeholderName={"Doctor Name"}
            value={payload?.DoctorName}
            onChange={(e) => handleReactChange("DoctorName", e)}
            className="required-fields"
          />
        </div>
        <div className="col-sm-3 col-md-3">
          <ReactSelect
            dynamicOptions={departmentOptions}
            isShowBorder={true}
            name="department"
            lable={"Department"}
            id="department"
            removeIsClearable={false}
            placeholderName={"Department"}
            value={payload?.department}
            onChange={(e) => handleReactChange("department", e)}
            className="required-fields"
          />
        </div>
      </div>
      <div>
        <CustomTable
          columns={tableHeader}
          data={tableData?.map((data, idx) => ({ SrNo: idx + 1, ...data }))}
        />
      </div>
    </>
  );
};

export default DetailedTable;
