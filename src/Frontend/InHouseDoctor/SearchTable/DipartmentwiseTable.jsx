import React, { useMemo } from "react";
import CustomTable from "../../../components/UI/Table/CustomTable";
import Heading from "../../../components/UI/Heading";

const DipartmentwiseTable = ({ doctorShareData = [] }) => {
  const tableHeaders = [
    { header: "Sr. No.", field: "SrNo", width: "5%" },
    { header: "Doctor Name", field: "doctorName", width: "15%" },
    {
      header: "Department Name",
      field: "departmentName",
      width: "25%",
      cellClassName: "multi-line-cell",
      allowMultiline: true,
    },
    { header: "Test Count", field: "testCount", width: "8%" },
    { header: "Gross Amt.", field: "grossAmount", width: "10%" },
    { header: "Net Amt.", field: "netAmount", width: "10%" },
    { header: "Discount Amt.", field: "discountAmount", width: "10%" },
    { header: "Doctor Share", field: "doctorShare", width: "10%" },
    { header: "Client Share", field: "clientShare", width: "10%" },
    { header: "Final Share", field: "finalShare", width: "10%" },
  ];

  const tableData = useMemo(() => {
    const grouped = {};

    doctorShareData.forEach((item) => {
      const key = item.doctorName;

      if (!grouped[key]) {
        grouped[key] = {
          doctorName: item.doctorName,
          departmentSet: new Set(),
          testCount: 0,
          grossAmount: 0,
          netAmount: 0,
          discountAmount: 0,
          doctorShare: 0,
          clientShare: 0,
          finalShare: 0,
        };
      }

      grouped[key].departmentSet.add(item.departmentName);
      grouped[key].testCount += Number(item.testCount) || 0;
      grouped[key].grossAmount += Number(item.grossAmount) || 0;
      grouped[key].netAmount += Number(item.netAmount) || 0;
      grouped[key].discountAmount += Number(item.discountAmount) || 0;
      grouped[key].doctorShare += Number(item.doctorShare) || 0;
      grouped[key].clientShare += Number(item.clientShare) || 0;
      grouped[key].finalShare += Number(item.finalShare) || 0;
    });

    return Object.values(grouped).map((row, index) => ({
      SrNo: index + 1,
      doctorName: row.doctorName,
      departmentName: Array.from(row.departmentSet)
        .map((dept) => `- ${dept}`)
        .join("\n"),
      testCount: row.testCount,
      grossAmount: row.grossAmount,
      netAmount: row.netAmount,
      discountAmount: row.discountAmount,
      doctorShare: row.doctorShare,
      clientShare: row.clientShare,
      finalShare: row.finalShare,
    }));
  }, [doctorShareData]);

  const totalRow = useMemo(
    () => ({
      SrNo: "",
      doctorName: "",
      departmentName: "TOTAL",
      testCount: tableData.reduce((s, r) => s + r.testCount, 0),
      grossAmount: tableData.reduce((s, r) => s + r.grossAmount, 0),
      netAmount: tableData.reduce((s, r) => s + r.netAmount, 0),
      discountAmount: tableData.reduce((s, r) => s + r.discountAmount, 0),
      doctorShare: tableData.reduce((s, r) => s + r.doctorShare, 0),
      clientShare: tableData.reduce((s, r) => s + r.clientShare, 0),
      finalShare: tableData.reduce((s, r) => s + r.finalShare, 0),
    }),
    [tableData]
  );

  const finalTableData = tableData.length > 0 ? [...tableData, totalRow] : [];

  return (
    <>
      <Heading title={"Departmentwise Summary Table"} />

      <div className="">
        <CustomTable
          allowMultilineFields={["departmentName"]}
          columns={tableHeaders}
          data={finalTableData}
          rowClassName={(row, index) =>
            index === finalTableData.length - 1 ? "total-row" : ""
          }
        />
      </div>
    </>
  );
};

export default DipartmentwiseTable;
