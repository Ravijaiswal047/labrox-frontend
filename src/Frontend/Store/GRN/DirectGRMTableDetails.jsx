import React from "react";
import Tables from "../../../components/UI/customTable";
import { useTranslation } from "react-i18next";

const DirectGRMTableDetails = ({ tableData }) => {
  const { t } = useTranslation();
  return (
    <>
      <Tables>
        <thead className="cf">
          <tr>
            <th>{t("New Batch")}</th>
            <th>{t("Item Type")}</th>
            <th>{t("ItemId")}</th>
            <th>{t("Item Name")}</th>
            <th>{t("Item Code")}</th>
            <th>{t("Hsn Code")}</th>
            <th>{t("Purchased Unit")}</th>
            <th>{t("Converter")}</th>
            <th>{t("Consume Unit")}</th>
            <th>{t("Barcode")}</th>
            <th>{t("Batch Number")}</th>
            <th>{t("Expiry Date")}</th>
            <th>{t("Rate")}</th>
            <th>{t("Paid Qty")}</th>
            <th>{t("Extra Free Qty")}</th>
            <th>{t("Discount %")}</th>
            <th>{t("IGST %")}</th>
            <th>{t("CGST %")}</th>
            <th>{t("SGST %")}</th>
            <th>{t("Discount Amount")}</th>
            <th>{t("Total GST Amount")}</th>
            <th>{t("BuyPrice")}</th>
            <th>{t("Net Amt")}</th>
            <th>{t("#")}</th>
          </tr>
        </thead>
        <tbody>
          {tableData?.map((item, index) => (
            <tr key={index}>
              <td data-title={t("New Batch")}>{item?.NewBatch}</td>
              <td data-title={t("Item Type")}>{item?.ItemType}</td>
              <td data-title={t("ItemId")}>{item?.ItemId}</td>
              <td data-title={t("Item Name")}>{item?.ItemName}</td>
              <td data-title={t("Item Code")}>{item?.ItemCode}</td>
              <td data-title={t("Hsn Code")}>{item?.HsnCode}</td>
              <td data-title={t("Purchased Unit")}>{item?.PurchasedUnit}</td>
              <td data-title={t("Converter")}>{item?.Converter}</td>
              <td data-title={t("Consume Unit")}>{item?.ConsumeUnit}</td>
              <td data-title={t("Barcode")}>{item?.Barcode}</td>
              <td data-title={t("Batch Number")}>{item?.BatchNumber}</td>
              <td data-title={t("Expiry Date")}>{item?.ExpiryDate}</td>
              <td data-title={t("Rate")}>{item?.Rate}</td>
              <td data-title={t("Paid Qty")}>{item?.PaidQty}</td>
              <td data-title={t("Extra Free Qty")}>{item?.ExtraFreeQty}</td>
              <td data-title={t("Discount %")}>{item?.DiscountPercent}</td>
              <td data-title={t("IGST %")}>{item?.IGSTPercent}</td>
              <td data-title={t("CGST %")}>{item?.CGSTPercent}</td>
              <td data-title={t("SGST %")}>{item?.SGSTPercent}</td>
              <td data-title={t("Discount Amount")}>{item?.DiscountAmount}</td>
              <td data-title={t("Total GST Amount")}>{item?.TotalGSTAmount}</td>
              <td data-title={t("BuyPrice")}>{item?.BuyPrice}</td>
              <td data-title={t("Net Amt")}>{item?.NetAmount}</td>
              <td data-title={t("#")}>{index + 1}</td>
            </tr>
          ))}
        </tbody>
      </Tables>
    </>
  );
};

export default DirectGRMTableDetails;
