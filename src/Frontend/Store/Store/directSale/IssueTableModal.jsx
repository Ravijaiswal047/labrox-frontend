import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Dialog } from "primereact/dialog";
import { toast } from "react-toastify";
import Tables from "../../../components/UI/customTable";
import { useLocalStorage } from "../../../utils/hooks/useLocalStorage";
import Loading from "../../../components/loader/Loading";
import { axiosInstance } from "../../../utils/axiosInstance";
import { CustomButton } from "../../../components/UI/CustomButton";
import Input from "../../../components/formComponent/Input";

function IssueTableModal({ show, onHandleShow, data, onAddItems }) {
  const [rows, setRows] = useState([]);
  const { t } = useTranslation();
  const theme = useLocalStorage("theme", "get");
  const isMobile = window.innerWidth <= 768;

  useEffect(() => {
    setRows(
      (data || []).map((row) => ({
        ...row,
        IssueQty: row?.IssueQty ?? "",
        isChecked: false,
      }))
    );
  }, [data]);

  const mapRowToParent = (row) => ({
    ...row,
    itemId: row?.itemid,
    itemName: row?.ItemName,
    batchNumber: row?.batchnumber,
    expiryDate: row?.ExpiryDate,
    barcodeno: row?.barcodeno,
    availableQty: row?.AvilableQty,
    consumeUnit: row?.MinorUnit,
    unitPrice: row?.UnitPrice,
    issueQty: row?.IssueQty,
    monthlyAverageConsumption: row?.MonthAvg ?? "",
  });

  const handleQtyChange = (e, index) => {
    const value = e.target.value;
    const available = Number(rows[index]?.AvilableQty) || 0;

    if (value === "") {
      setRows((prev) =>
        prev.map((row, i) => (i === index ? { ...row, IssueQty: "" } : row))
      );
      return;
    }

    const num = Number(value);
    if (Number.isNaN(num) || num < 0) return;

    if (num > available) {
      toast.warn(
        `${t("Issue Qty cannot be more than Available Qty")} (${available})`
      );
      setRows((prev) =>
        prev.map((row, i) =>
          i === index ? { ...row, IssueQty: String(available) } : row
        )
      );
      return;
    }

    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, IssueQty: value } : row))
    );
  };

  const handleCheck = (e, index) => {
    const checked = e.target.checked;
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, isChecked: checked } : row))
    );
  };

  const hasIssueQty = (row) =>
    row?.IssueQty !== "" &&
    row?.IssueQty !== null &&
    row?.IssueQty !== undefined &&
    Number(row?.IssueQty) > 0;

  const handleSelect = (row) => {
    if (!hasIssueQty(row)) {
      toast.warn(t("Please enter Issue Qty"));
      return;
    }
    onAddItems?.([mapRowToParent(row)], "append");
    toast.success(t("Item added"));
    onHandleShow?.();
  };

  const handleAddAll = () => {
    const selectedRows = rows.filter((row) => row?.isChecked);
    if (selectedRows.length === 0) {
      toast.warn(t("Please select at least one item"));
      return;
    }
    // every selected row must have an issue qty
    if (selectedRows.some((row) => !hasIssueQty(row))) {
      toast.warn(t("Please enter Issue Qty for all selected items"));
      return;
    }
    onAddItems?.(selectedRows.map(mapRowToParent), "replace");
    toast.success(t("Items added"));
    onHandleShow?.();
  };

  return (
    <>
      <Dialog
        header={t("Stock Detail")}
        onHide={onHandleShow}
        style={{ width: isMobile ? "80vw" : "95vw" }}
        className={theme}
        visible={show}
      >
        <div style={{ overflowX: "auto" }}>
          <Tables>
            <thead>
              <tr>
                <th>{t("S.no")}</th>
                <th>{t("ItemId")}</th>
                <th>{t("Item Name")}</th>
                <th>{t("StockID")}</th>
                <th>{t("Batch Number")}</th>
                <th>{t("Expiry Date")}</th>
                <th>{t("BarcodeNo")}</th>
                <th>{t("Avilable Qty")}</th>
                <th>{t("Consume Unit")}</th>
                <th>{t("Unit Price")}</th>
                <th>{t("Issue Qty")}</th>
                <th>{t("Select")}</th>
                <th>{t("Action")}</th>
              </tr>
            </thead>
            <tbody>
              {rows?.map((row, index) => (
                <tr key={index}>
                  <td data-title={t("S.no")}>{index + 1}</td>
                  <td data-title={t("ItemId")}>{row?.itemid}&nbsp;</td>
                  <td data-title={t("Item Name")}>{row?.ItemName}&nbsp;</td>
                  <td data-title={t("StockID")}>{row?.stockid}&nbsp;</td>
                  <td data-title={t("Batch Number")}>{row?.batchnumber}&nbsp;</td>
                  <td data-title={t("Expiry Date")}>{row?.ExpiryDate}&nbsp;</td>
                  <td data-title={t("BarcodeNo")}>{row?.barcodeno}&nbsp;</td>
                  <td data-title={t("Avilable Qty")}>{row?.AvilableQty}&nbsp;</td>
                  <td data-title={t("Consume Unit")}>{row?.MinorUnit}&nbsp;</td>
                  <td data-title={t("Unit Price")}>{row?.UnitPrice}&nbsp;</td>
                  <td data-title={t("Issue Qty")}>
                    <Input
                      type="number"
                      min="0"
                      max={row?.AvilableQty}
                       className="required-fields"
                      value={row?.IssueQty}
                      onChange={(e) => handleQtyChange(e, index)}
                    />
                  </td>
                  <td data-title={t("Select")}>
                    {
                      <span
                      onClick={() => {
                        handleSelect(row);
                        }}>
                      <i className="bi bi-check-circle-fill"
                      style={{ color: "#0d6efd", fontSize: "18px" }}
                      ></i>
                     </span>
                    }
                    &nbsp;
                  </td>
                  <td data-title={t("Action")}>
                    <input
                      type="checkbox"
                      checked={row?.isChecked || false}
                      onChange={(e) => handleCheck(e, index)}
                    />
                    &nbsp;
                  </td>
                </tr>
              ))}
            </tbody>
          </Tables>
        </div>
        <div className="row mt-2">
          <div className="col-sm-1">
            <button
              type="button"
              className="btn btn-block btn-danger btn-sm"
              onClick={handleAddAll}
            >
              {t("Add All")}
            </button>
          </div>
          <div className="col-sm-1">
            <button
              type="button"
              className="btn btn-block btn-danger btn-sm"
              onClick={onHandleShow}
            >
              {t("Close")}
            </button>
          </div>
        </div>
      </Dialog>
    </>
  );
}

export default IssueTableModal;
