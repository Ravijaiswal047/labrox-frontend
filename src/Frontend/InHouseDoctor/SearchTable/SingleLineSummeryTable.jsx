import React, { useMemo } from "react";
import CustomTable from "../../../components/UI/Table/CustomTable";
import Heading from "../../../components/UI/Heading";

const SingleLineSummeryTable = ({ doctorShareData }) => {
  const tableHeaders = [
    { header: "S.No", field: "SrNo", width: "4%" },
    { header: "Doctor Name", field: "doctorName", width: "12%" },
    { header: "Test Count", field: "testCount" },
    { header: "Gross Amount", field: "grossAmount" },
    { header: "Discount Amount", field: "discountAmount" },
    { header: "Net Amount", field: "netAmount" },
    { header: "Doctor Share", field: "doctorShare" },
    { header: "Credit Share", field: "clientShare" },
    { header: "Final Share", field: "finalShare" },
  ];

  const tableData = useMemo(() => {
    return doctorShareData.map((item, index) => ({
      SrNo: index + 1,
      doctorName: item.doctorName,
      testCount: Number(item.testCount) || 0,
      grossAmount: Number(item.grossAmount) || 0,
      discountAmount: Number(item.discountAmount) || 0,
      netAmount: Number(item.netAmount) || 0,
      doctorShare: Number(item.doctorShare) || 0,
      clientShare: Number(item.clientShare) || 0,
      finalShare: Number(item.finalShare) || 0,
    }));
  }, [doctorShareData]);

  const totalRow = useMemo(
    () => ({
      SrNo: "",
      doctorName: "Total",
      testCount: tableData.reduce((s, r) => s + r.testCount, 0),
      grossAmount: tableData.reduce((s, r) => s + r.grossAmount, 0),
      discountAmount: tableData.reduce((s, r) => s + r.discountAmount, 0),
      netAmount: tableData.reduce((s, r) => s + r.netAmount, 0),
      doctorShare: tableData.reduce((s, r) => s + r.doctorShare, 0),
      clientShare: tableData.reduce((s, r) => s + r.clientShare, 0),
      finalShare: tableData.reduce((s, r) => s + r.finalShare, 0),
    }),
    [tableData]
  );

  const finalTableData = tableData.length > 0 ? [...tableData, totalRow] : [];

  return (
    <>
      <Heading title={"Single Line Summary Table"} />

      <div className="single_summery_main">
        <CustomTable
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

export default SingleLineSummeryTable;
