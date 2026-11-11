import Table from "react-bootstrap/Table";
import { ExcelIconSVG, PDFIconSVG } from "../../../components/SvgIcons";
import exportLedgerToExcel from "./exportLedgerToExcel";
import Heading from "../../../components/UI/Heading";
import { useTranslation } from "react-i18next";
import { FinanceVoucherPrint } from "../../../NetworkServices/finance.js";
import { RedirectURL } from "../../../NetworkServices/PDFURL";
import { formatAmount, notify } from "../../../utils/ustil2";
import {
  exportHtmlToExcel,
  exportHtmlToPDFNoPrint,
  exportHtmlToPDFNoPrintFinance,
} from "../../../utils/exportLibrary";
import CustomTooltip from "../../../components/formComponent/CustomTooltip";
import CustomTooltipHis from "../../../components/formComponent/CustomTooltipHis.jsx";

const LedgerReportTable = ({ bodyData, values, payloadData }) => {
  const [t] = useTranslation();
  const groupLedgerData = (data) => {
    return data.reduce((acc, item) => {
      const cogKey = `${item.COGCode}${item.COGName}`;
      const coaKey = `${item.COAID}${item.COAName}`;

      if (!acc[cogKey]) {
        acc[cogKey] = {
          COGCode: item.COGCode,
          COGName: item.COGName,
          coas: {},
        };
      }

      if (!acc[cogKey].coas[coaKey]) {
        acc[cogKey].coas[coaKey] = {
          COAID: item.COAID,
          COAName: item.COAName,
          rows: [],
        };
      }

      acc[cogKey].coas[coaKey].rows.push(item);

      return acc;
    }, {});
  };

  const groupedData = groupLedgerData(bodyData);

  let rowCounter = 1;
  let gCFTotal = 0;
  let gDebitTotal = 0;
  let gCreditTotal = 0;

  const handleDoubleClickReport = async (val) => {
    const payload = {
      filterType: 1,
      voucherNo: val?.VoucherNo,
    };

    const response = await FinanceVoucherPrint(payload);
    if (response?.success) {
      RedirectURL(response?.data?.pdfUrl);
    } else {
      notify(response?.message, "error");
    }
  };
console.log("payloadDatapayloadData",payloadData)
  const handleExportPDF = () => {
    exportHtmlToPDFNoPrintFinance(
      "printSectionpdf",
      "Ledger Report",
      "landscape"
    );
  };
  console.log("bodyDatabodyData", bodyData);
  return (
    <div id="printSectionpdf" className="w-100">
      <Heading
        title={t(values?.reportType?.label)}
        secondTitle={
          <>
            <span onClick={handleExportPDF} className="no-print">
              <PDFIconSVG />
            </span>

            <span
              onClick={() => exportHtmlToExcel(
                  "printSectionpdf",
                  t(values?.reportType?.label)
                )}
              className="no-print"
            >
              <ExcelIconSVG />{" "}
            </span>
          </>
        }
      />

      {bodyData?.length > 0 && <Heading title={bodyData[0]?.Period}/> }
<div className="table-scroll-finace-report">
      <Table bordered hover size="sm" className="ledger-table">
        <thead className="card-header text-center align-middle">
          <tr>
            <th>S.No.</th>
            <th>Centre</th>
            <th>Branch Centre</th>
            <th>Vch.Date</th>
            <th>Vch.Type</th>
            <th>Vch.No.</th>
            <th>Bill No.</th>
            <th>Bill Date</th>
            <th>Department</th>
            <th>Narration</th>
            <th>Ref No.</th>
            <th>Ref Date</th>
            <th>Currency</th>
            <th>C.F.</th>
            <th>Debit</th>
            <th>Credit</th>
            <th>Running Bal.</th>
            <th>Type</th>
            {payloadData?.DisplayOpposite?.value === "1" && (
              <th>Opposite A/C</th>
            )}

            {console.log("payloadData", payloadData?.DisplayOpposite?.value)}
          </tr>
        </thead>

        <tbody>
          {Object.values(groupedData).map((cog,cogIndex) => (
            <>
              {/* COG ROW */}
              <tr className="group-row">
                <td style={{ color: "red" }}>
                  <strong>COG</strong>
                </td>
                <td colSpan={18}>
                  <strong style={{ color: "red" }}>{cog?.COGName}</strong>
                </td>
              </tr>

              {Object.values(cog?.coas)?.map((coa) => {
                let totalDebit = 0;
                let totalCredit = 0;

                return (
                  <>
                    {/* COA ROW */}
                    <tr className="sub-group-row">
                      <td>
                        <strong className="ladg-report-blue">COA</strong>
                      </td>
                      <td colSpan={18}>
                        <strong className="ladg-report-blue">
                          {coa?.COAName}
                        </strong>
                      </td>
                    </tr>

                    {/* DATA ROWS */}
                    {coa?.rows?.map((row, index) => {
                      totalDebit += Number(row?.Debit || 0);
                      totalCredit += Number(row?.Credit || 0);
                      // for Grand Total

                      gCFTotal += row?.OpeningActual;
                      gDebitTotal += Number(row?.Debit || 0);
                      gCreditTotal += Number(row?.Credit || 0);
                      // grunningBal += Number(row?.RunningBal?.split(" ")[0] || 0);

                      return (
                        <tr key={`${row.VoucherNo}-${rowCounter}`}>
                          <td>{rowCounter++}</td>
                          <td>{row?.CentreName}</td>
                          <td>{row?.BranchCentre}</td>
                          <td>{row?.VoucherDate}</td>
                          <td>{row?.VoucherName}</td>
                          <td
                            onDoubleClick={() => {
                              handleDoubleClickReport(row);
                            }}
                            style={{
                              cursor: "pointer",
                              color: "red",
                              fontWeight: "bold",
                              whiteSpace: "wrap",
                            }}
                          >
                            {row?.VoucherNo}
                          </td>
                          <td>{row?.BillNo}</td>
                          <td>{row?.BillDate}</td>
                          <td>{row?.DepartmentName}</td>
                          <td>{row?.Narations}</td>
                          <td>{row?.RefNo}</td>
                          <td>{row?.RefDate}</td>
                          <td>{row?.CurrencyCode}</td>
                          <td>{row?.CurrencyFactor}</td>
                          <td style={{textAlign:"end"}}>{formatAmount(row?.Debit.toFixed(2))} &nbsp;</td>
                          <td style={{textAlign:"end"}}>{formatAmount(row?.Credit.toFixed(2))}&nbsp;</td>
                          <td style={{textAlign:"end"}}>
                            {row?.RunningBal?.split(" ")[0]} &nbsp;
                          </td>
                          <td>{row?.RunningBal?.split(" ")[1]}</td>
                          {payloadData?.DisplayOpposite?.value === "1" && (
                            <td>
                              {" "}
                              <CustomTooltipHis
                                id={row?.UniqueID}
                                content={row?.OppositeACDetails}
                                icon={
                                  <i id={row?.UniqueID} style={{fontSize:"1rem"}}>
                                    {row?.OppositeACDetails?.length > 30
                                      ? row?.OppositeACDetails?.substring(0, 30) + "..."
                                      : row?.OppositeACDetails}{" "}
                                  </i>
                                }
                              />
                            </td>

                            // <td>
                            //   {" "}

                            //   <CustomTooltip
                            //     id={`${index}`}
                            //     content={row?.OppositeACDetails}
                            //     icon={
                            //       <i id={`${index}`}>
                            //         {row?.OppositeACDetails}
                            //       </i>
                            //     }
                            //   />
                            // </td>
                          )}
                        </tr>
                      );
                    })}

                    {/* TOTAL ROW */}
                    <tr
                      className="total-row"
                      style={{ borderBottom: "0.125rem solid #e9ecef" }}
                    >
                      {/* <td colSpan={13}></td> */}
                      <td
                        className="text-end fw-bold text-right ladg-report-blue"
                        colSpan={13}
                      >
                        Total : <>&nbsp;</>
                      </td>

                      <td className="text-end fw-bold ladg-report-blue">
                        {coa?.rows[0]?.OpeningActual || "0.00"}
                      </td>
                      <td className="text-end fw-bold ladg-report-blue">
                        {totalDebit.toFixed(2) || "0.00"}
                      </td>
                      <td className="text-end fw-bold ladg-report-blue">
                        {totalCredit.toFixed(2) || "0.00"}
                      </td>
                      <td className="text-end fw-bold ladg-report-blue">
                        {coa?.rows[coa?.rows?.length - 1]?.RunningBal?.split(
                          " "
                        )[0] || "0.00"}
                      </td>
                      <td className="text-end fw-bold ladg-report-blue">
                        {coa?.rows[coa?.rows?.length - 1]?.RunningBal?.split(
                          " "
                        )[1] || ""}
                      </td>
                    </tr>
                  </>
                );
              })}
              <tr
                className="total-row "
                style={{ borderBottom: "0.125rem" }}
              >
                <td colSpan={12} className="text-end "></td>
                <td
                  className="text-end fw-bold"
                  style={{ color: "red", fontWeight: "bold" }}
                >
                  COG Total : <>&nbsp;</>
                </td>
                <td
                  className="text-end fw-bold"
                  style={{ color: "red", fontWeight: "bold" }}
                >
                  {gCFTotal.toFixed(2) + " " || "0.00"} <>&nbsp;</>
                </td>
                <td
                  className="text-end fw-bold"
                  style={{ color: "red", fontWeight: "bold" }}
                >
                  {gDebitTotal.toFixed(2) || "0.00"} <>&nbsp;</>
                </td>
                <td
                  className="text-end fw-bold"
                  style={{ color: "red", fontWeight: "bold" }}
                >
                  {gCreditTotal.toFixed(2) + " " || "0.00"} <>&nbsp;</>
                </td>
                <td
                  className="text-end fw-bold"
                  style={{ color: "red", fontWeight: "bold" }}
                  colSpan={2}
                >
                  {(gCFTotal + gDebitTotal - gCreditTotal).toFixed(2) || "0.00"}
                </td>
                {/* <td style={{color:"red", fontWeight:"bold"}}>Dr</td> */}
              </tr>
            </>
          ))}
        </tbody>
      </Table>
    </div>
    </div>
  );
};

export default LedgerReportTable;
