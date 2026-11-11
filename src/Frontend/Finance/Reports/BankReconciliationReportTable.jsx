import Table from "react-bootstrap/Table";
import Heading from "../../../components/UI/Heading";
import { useTranslation } from "react-i18next";
import AlignTableText from "../../../components/commonComponents/AlignTableText";
import { handleTotalTable, notify } from "../../../utils/ustil2";
import { FinanceVoucherPrint } from "../../../NetworkServices/finance.js";
import { RedirectURL } from "../../../NetworkServices/PDFURL";
import {
  exportHtmlToExcel,
  exportHtmlToPDFNoPrintFinance,
} from "../../../utils/exportLibrary";
import { ExcelIconSVG, PDFIconSVG } from "../../../components/SvgIcons";

const BankReconciliationReportTable = ({ bodyData, values }) => {
  const [t] = useTranslation();

  /**
   * Group by FilterType
   * Header-only rows
   */
  const groupByFilterType = (data = []) => {
    return data
      ?.filter((item) => item?.FilterType !== 0)
      ?.reduce((acc, item) => {
        const key = item.FilterType;

        if (!acc[key]) {
          acc[key] = {
            FilterType: key,
            rows: [],
          };
        }

        acc[key].rows.push(item);

        return acc;
      }, {});
  };

  const groupedData = groupByFilterType(bodyData);

  const VoucherPrint = async (val) => {
    const payload = {
      voucherNo: val?.VoucherNo,
    };
    const response = await FinanceVoucherPrint(payload);
    if (response?.success) {
      RedirectURL(response?.data?.pdfUrl);
    } else {
      notify(response?.message, "error");
    }
  };

  const handleExportPDF = () => {
    exportHtmlToPDFNoPrintFinance(
      "printSectionpdf",
      values?.reportType?.label,
      "landscape"
    );
  };

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
              onClick={() =>
                exportHtmlToExcel(
                  "printSectionpdf",
                  t(values?.reportType?.label)
                )
              }
              className="no-print"
            >
              <ExcelIconSVG />{" "}
            </span>
          </>
        }
      />

      <div className="table-scroll-finace-report">
        <Table bordered hover size="sm" className="ledger-table">
          <thead className="card-header text-center align-middle">
            <tr>
              <th style={{ width: "8%" }}>
                <AlignTableText value={"Date"} isbold={true} side={"left"} />
              </th>
              <th style={{ width: "12%" }}>
                <AlignTableText
                  value={"Voucher No."}
                  isbold={true}
                  side={"left"}
                />
              </th>
              <th>
                <AlignTableText
                  value={"Description"}
                  isbold={true}
                  side={"left"}
                />
              </th>
              <th style={{ width: "15%" }}>
                <AlignTableText
                  value={"Reference Number"}
                  isbold={true}
                  side={"left"}
                />
              </th>
              <th style={{ width: "7%" }}>
                <AlignTableText
                  value={bodyData[0]?.CurrencyCode}
                  isbold={true}
                  side={"right"}
                />
              </th>
            </tr>
          </thead>

          <tbody>
            <tr className="group-row">
              <td style={{ color: "blue" }}>
                <AlignTableText
                  value={bodyData[0]?.VoucherDate}
                  isbold={true}
                  side={"left"}
                />
              </td>
              <td colSpan={3}>
                <AlignTableText
                  value={bodyData[0]?.Remarks}
                  isbold={true}
                  side={"right"}
                  color={"blue"}
                />
              </td>
              <td colSpan={1}>
                <AlignTableText
                  value={bodyData[0]?.AmountDisplay}
                  isbold={true}
                  side={"right"}
                  color={"blue"}
                />
              </td>
            </tr>
            {Object.values(groupedData).map((group, gIndex) => (
              <>
                <tr>
                  <td colSpan={5}>
                    <AlignTableText
                      value={group?.rows[0]?.HeaderName}
                      isbold={true}
                      side={"left"}
                      color={group?.rows[0]?.FilterType === 1 ? "green" : "red"}
                    />
                  </td>
                </tr>
                {/* GROUP HEADER (like COG) */}

                {/* DATA ROWS */}
                {group?.rows?.map((row, index) => (
                  <tr key={`${gIndex}-${index}`}>
                    <td>{row?.VoucherDate}</td>

                    <td
                      style={{
                        color: "red",
                        fontWeight: "bold",
                        cursor: "pointer",
                      }}
                    >
                      <span
                        onDoubleClick={() => {
                          VoucherPrint(row);
                        }}
                      >
                        {row.VoucherNo || "-"}
                      </span>
                    </td>

                    <td>{row.Remarks}</td>
                    <td>{row.RefNo}</td>

                    <td>
                      <AlignTableText
                        value={row.AmountDisplay}
                        side={"right"}
                      />
                    </td>
                  </tr>
                ))}
                <tr>
                  {/* <td colSpan={3}></td> */}
                  <td colSpan={4}>
                    <AlignTableText
                      value={`${group?.rows[0]?.HeaderName} Total: `}
                      isbold={true}
                      side={"right"}
                      color={group?.rows[0]?.FilterType === 1 ? "green" : "red"}
                    />
                  </td>
                  <td className="d-flex justify-content-end">
                    <AlignTableText
                      value={Math.abs(handleTotalTable(group?.rows, "Amount"))}
                      isbold={true}
                      isAmount={true}
                      side={"right"}
                      color={group?.rows[0]?.FilterType === 1 ? "green" : "red"}
                    />
                    <div
                      className="ml-1"
                      style={{
                        color:
                          group?.rows[0]?.FilterType === 1 ? "green" : "red",
                        fontWeight: "bold",
                      }}
                    >
                      {handleTotalTable(group?.rows, "Amount") >= 0
                        ? "Dr"
                        : "Cr"}
                    </div>
                  </td>
                </tr>
              </>
            ))}
            <tr className="group-row">
              <td style={{ color: "blue" }}>
                <AlignTableText
                  value={bodyData[0]?.VoucherDate}
                  isbold={true}
                  side={"left"}
                />
              </td>
              <td colSpan={3}>
                <AlignTableText
                  value={t("Balance As Per Cash Book :")}
                  isbold={true}
                  side={"right"}
                  color={"blue"}
                />
              </td>
              <td colSpan={1} className="d-flex justify-content-end">
                <AlignTableText
                  value={Math.abs(handleTotalTable(bodyData, "Amount"))}
                  isbold={true}
                  isAmount={true}
                  side={"right"}
                  color={"blue"}
                />
                <div
                  className="ml-1"
                  style={{ color: "blue", fontWeight: "bold" }}
                >
                  {handleTotalTable(bodyData, "Amount") >= 0 ? "Dr" : "Cr"}
                </div>
              </td>
            </tr>
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default BankReconciliationReportTable;
