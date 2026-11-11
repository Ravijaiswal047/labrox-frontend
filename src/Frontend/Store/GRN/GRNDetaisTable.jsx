import React from "react";
import Tables from "../../../components/UI/customTable";
import { useTranslation } from "react-i18next";

const GRNDetaisTable = ({tableData}) => {
      const { t } = useTranslation();
  return (
    <>
      <Tables>
        <thead className="cf">
          <tr>
            <th>{t("#")}</th>
            <th>{t("View Item")}</th>
            <th>{t("GRN No")}</th>
            <th>{t("PO Number")}</th>
            <th>{t("Invoice No")}</th>
            <th>{t("Challan No")}</th>
            <th>{t("Supplier")}</th>
            <th>{t("GRN Date")}</th>
            <th>{t("Gross Amt")}</th>
            <th>{t("Disc Amt")}</th>
            <th>{t("Tax Amt")}</th>
            <th>{t("GRN/Net Amt")}</th>
            <th>{t("Post")}</th>
            <th>{t("UnPost")}</th>
            <th>{t("Cancel")}</th>
            <th>{t("Print")}</th>
            <th>{t("Doc")}</th>
            <th>{t("Edit")}</th>
            <th>{t("Bar Code")}</th>
          </tr>
        </thead>
        <tbody>
          {tableData?.map((item, index) => (
            <tr key={index}>
              <td data-title={t("#")}>{index + 1}</td>
              <td data-title={t("View Item")}>{/* button/icon here */}</td>
              <td data-title={t("GRN No")}>{item?.GRNNo}</td>
              <td data-title={t("PO Number")}>{item?.PONumber}</td>
              <td data-title={t("Invoice No")}>{item?.InvoiceNo}</td>
              <td data-title={t("Challan No")}>{item?.ChallanNo}</td>
              <td data-title={t("Supplier")}>{item?.Supplier}</td>
              <td data-title={t("GRN Date")}>{item?.GRNDate}</td>
              <td data-title={t("Gross Amt")}>{item?.GrossAmt}</td>
              <td data-title={t("Disc Amt")}>{item?.DiscAmt}</td>
              <td data-title={t("Tax Amt")}>{item?.TaxAmt}</td>
              <td data-title={t("GRN/Net Amt")}>{item?.GRNNetAmt}</td>
              <td data-title={t("Post")}>{/* Post button */}</td>
              <td data-title={t("UnPost")}>{/* UnPost button */}</td>
              <td data-title={t("Cancel")}>{/* Cancel button */}</td>
              <td data-title={t("Print")}>{/* Print icon */}</td>
              <td data-title={t("Doc")}>{/* Document icon */}</td>
              <td data-title={t("Edit")}>{/* Edit icon */}</td>
              <td data-title={t("Bar Code")}>{item?.BarCode}</td>
            </tr>
          ))}
        </tbody>
      </Tables>
    </>
  );
};

export default GRNDetaisTable;
