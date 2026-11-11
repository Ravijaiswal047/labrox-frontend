import React, { useEffect, useRef, useState } from "react";
import Tables from "../../../components/UI/customTable";
import { useTranslation } from "react-i18next";
import { useLocalStorage } from "../../../utils/hooks/useLocalStorage";
import { toast } from "react-toastify";

import "../index.css"

const GRNFromPoTble = ({ bindorderdetail, sendData }) => {
  const { t } = useTranslation();

  const userData = useLocalStorage("userData", "get");
  const DefaultCurrencyName = userData?.DefaultCurrencyName;

  const defaultRow = {
    itemgroup: "",
    apolloitemcode: "",
    typename: "",
    itemid: "",
    CatalogNo: "",
    HsnCode: "",
    MajorUnitName: "",
    IsExpirable: "",
    MinorUnitName: "",
    Barcode: "",
    BatchNumber: "",
    ExpiryDate: "",
    POQty: 0,
    GRNQty: 0,
    Rate: 0,
    PaidQty: 0,
    FreeQty: 0,
    DiscountPer: 0,
    IGSTPer: 0,
    CGSTPer: 0,
    SGSTPer: 0,
    DiscountAmt: 0,
    TotalGSTAmt: 0,
    BuyPrice: 0,
    NetAmt: 0,
  };

  const calculateValues = (input) => {
    const paidQty = parseFloat(input.PaidQty) || 0;
    const rate = parseFloat(input.Rate) || 0;
    const discountPer = parseFloat(input.DiscountPer) || 0;
    const igst = parseFloat(input.IGSTPer) || 0;
    const cgst = parseFloat(input.CGSTPer) || 0;
    const sgst = parseFloat(input.SGSTPer) || 0;

    const grossAmount = paidQty * rate;
    const discountAmt = (grossAmount * discountPer) / 100;
    const taxableAmount = grossAmount - discountAmt;

    const igstAmt = (taxableAmount * igst) / 100;
    const cgstAmt = (taxableAmount * cgst) / 100;
    const sgstAmt = (taxableAmount * sgst) / 100;

    const totalGST = igstAmt + cgstAmt + sgstAmt;
    const netAmount = taxableAmount + totalGST;

    return {
      ...input,
      DiscountAmt: discountAmt.toFixed(2),
      TotalGSTAmt: totalGST.toFixed(2),
      BuyPrice: rate.toFixed(2),
      NetAmt: netAmount.toFixed(2),
    };
  };

  const getRowsFromDetails = (details) =>
    Array.isArray(details) && details.length > 0
      ? details.map((item) => calculateValues({ ...defaultRow, ...item }))
      : [calculateValues({ ...defaultRow })];

  const [rows, setRows] = useState(getRowsFromDetails(bindorderdetail));
  const [inputStates, setInputStates] = useState(getRowsFromDetails(bindorderdetail));
  const paidQtyLimit = useRef(inputStates.map((item) => Number(item.PaidQty) || 0));
  const freeQtyLimit = useRef(inputStates.map((item) => Number(item.FreeQty) || 0));

  useEffect(() => {
    const updatedRows = getRowsFromDetails(bindorderdetail);
    paidQtyLimit.current = updatedRows.map((item) => Number(item.PaidQty) || 0);
    freeQtyLimit.current = updatedRows.map((item) => Number(item.FreeQty) || 0);
    setRows(updatedRows);
    setInputStates(updatedRows);
  }, [bindorderdetail]);

  const handleInputChange = (index, field, value) => {
    const updatedInputs = [...inputStates];

    // update field value
    updatedInputs[index] = {
      ...updatedInputs[index],
      [field]: value
    };

    // If IGSTPer is entered (and has value), clear CGSTPer and SGSTPer
    if (field === "IGSTPer" && value > 0) {
      updatedInputs[index].CGSTPer = 0;
      updatedInputs[index].SGSTPer = 0;
    }

    // If CGSTPer or SGSTPer is entered (and has value), clear IGSTPer
    if ((field === "CGSTPer" || field === "SGSTPer") && value > 0) {
      updatedInputs[index].IGSTPer = 0;
    }

    // calculate updated row
    const updatedRow = calculateValues(updatedInputs[index]);

    const updatedRows = [...rows];
    updatedRows[index] = {
      ...updatedInputs[index],
      ...updatedRow
    };

    setInputStates(updatedInputs);
    setRows(updatedRows);
  };

  const handleInputBlur = (index) => {
    const updatedRow = calculateValues(inputStates[index]);
    const newRows = [...rows];
    newRows[index] = updatedRow;
    setRows(newRows);
  };

  const handleCopyRow = (index) => {
    const copiedRow = { ...rows[index] };
    console.log(copiedRow)
    // Optionally clear user fields (example)
    copiedRow.BatchNumber = "";
    copiedRow.Barcode = "";
    copiedRow.PaidQty = "";

    const newRows = [...rows.slice(0, index + 1), copiedRow, ...rows.slice(index + 1)];
    const newInputs = [...inputStates.slice(0, index + 1), copiedRow, ...inputStates.slice(index + 1)];
    paidQtyLimit.current = [
      ...paidQtyLimit.current.slice(0, index + 1),
      paidQtyLimit.current[index],
      ...paidQtyLimit.current.slice(index + 1),
    ];

    setRows(newRows);
    setInputStates(newInputs);
  };

  const handleRemoveRow = (index) => {
    const newRows = rows.filter((_, i) => i !== index);
    const newInputs = inputStates.filter((_, i) => i !== index);
    paidQtyLimit.current = paidQtyLimit.current.filter((_, i) => i !== index);
    setRows(newRows);
    setInputStates(newInputs);
  };

  useEffect(() => {
    sendData(rows);
  }, [rows]);

  return (
    <Tables className="table table-bordered">
      <thead>
        <tr>
          {/* <th>{t("New Batch")}</th> */}
          <th>{t("Sr No")}</th>
          <th>{t("Item Type")}</th>
          <th>{t("Item Code")}</th>
          <th>{t("Item Name")}</th>
          <th>{t("ItemID")}</th>
          <th>{t("Catalog No")}</th>
          <th>{t("Hsn Code")}</th>
          <th>{t("Purchased Unit")}</th>
          <th>{t("Converter")}</th>
          <th>{t("Consume Unit")}</th>
          <th>{t("Barcode")}</th>
          <th>{t("Batch Number")}</th>
          <th>{t("Expiry Date")}</th>
          <th>{t("PO Qty")}</th>
          <th>{t("Trade Currency")}</th>
          <th>{t("Currency Converter")}</th>
          <th>{t("Trade Currency Amt")}</th>
          <th>{t("GRN Qty")}</th>
          <th>{t("Rate")}</th>
          <th>{t("Receive Qty")}</th>
          <th>{t("Free Qty")}</th>
          <th>{t("Discount %")}</th>
          <th>{t(DefaultCurrencyName == "INR" ? "IGST %" : "Tax")}</th>
          {DefaultCurrencyName == "INR" &&
            <>
              <th>{t(DefaultCurrencyName == "INR" ? "CGST %" : "Tax")}</th>
              <th>{t(DefaultCurrencyName == "INR" ? "SGST %" : "Tax")}</th>
            </>
          }
          <th>{t("Discount Amount")}</th>
          <th>{t(DefaultCurrencyName == "INR" ? "Total GST Amount" : "Total Tax Amount")}</th>
          <th>{t("BuyPrice")}</th>
          <th>{t("Net Amt")}</th>
          <th>{t("Action")}</th>
        </tr>
      </thead>
      <tbody>
        {inputStates.map((item, index) => (
          <tr key={index}>
            {/* <td>
              <i
                className="fa fa-plus-circle big-icon-CopyRow  "
                onClick={() => handleCopyRow(index)}
              />
            </td> */}
            <td>{index + 1}</td>
            <td>{item.itemgroup}</td>
            <td>{item.apolloitemcode}</td>
            <td>{item.typename}</td>
            <td>{item.itemid}</td>
            <td>{item.CatalogNo}</td>
            <td>{item.HsnCode}</td>
            <td>{item.MajorUnitName}</td>
            <td>{item.Converter}</td>
            <td>{item.MinorUnitName}</td>
            <td>
              <input
                className="form-control"
                value={item.Barcode}
                onChange={(e) => handleInputChange(index, "Barcode", e.target.value)}
                onBlur={() => handleInputBlur(index)}
              />
            </td>
            <td>
              <input
                className="form-control required-fields"
                value={item.BatchNumber}
                onChange={(e) => handleInputChange(index, "BatchNumber", e.target.value)}
                onBlur={() => handleInputBlur(index)}

              />
            </td>
            <td>
              <input
                type="date"
                min={new Date().toISOString().split("T")[0]}
                className={`form-control ${item.IsExpirable == 1 ? "required-fields" : ""}`}
                value={item.ExpiryDate}
                onChange={(e) =>
                  handleInputChange(index, "ExpiryDate", e.target.value)
                }
                onBlur={() => handleInputBlur(index)}
              />
            </td>
            <td>{item.poqty}</td>
            <td data-title={t("Currency")}>{item.Currency}</td>
            <td data-title={t("Currency Converter")}>{DefaultCurrencyName == item.Currency ? 1 : item.Selling_Specific}</td>
            {console.log(item.NetAmount, "NetAmount")}
            <td data-title={t("Currency Amt")}>{(rows[index].NetAmt / (DefaultCurrencyName == item.Currency ? 1 : item.Selling_Specific)).toFixed(3)}
            </td>
            <td>{item.grnqty}</td>
            <td>{item.Rate}</td>
            <td data-title={t("Receive Qty")}>
              <input
                type="text"
                className="form-control"
                value={item.PaidQty}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  const paidQty = Number(value);
                  const maxPaidQty = paidQtyLimit.current[index] || 0;

                  if (value !== "" && (Number.isNaN(paidQty) || paidQty < 0 || paidQty > maxPaidQty)) {
                    toast.error("Receive Qty can't increase");
                    e.target.value = item.PaidQty;
                    return;
                  }

                  handleInputChange(index, "PaidQty", value);
                }}
                onBlur={() => handleInputBlur(index)}
              />
            </td>
            <td>
              <input
                type="text"
                className="form-control"
                value={item.FreeQty}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  const freeQty = Number(value);
                  const maxFreeQty = freeQtyLimit.current[index] || 0;

                  if (value !== "" && (Number.isNaN(freeQty) || freeQty < 0 || freeQty > maxFreeQty)) {
                    toast.error("Free Qty can't increase");
                    e.target.value = item.FreeQty;
                    return;
                  }

                  handleInputChange(index, "FreeQty", value);
                }}
                onBlur={() => handleInputBlur(index)}
              />
            </td>
            <td>
              <input
                className="form-control"
                value={item.DiscountPer}
                onChange={(e) => handleInputChange(index, "DiscountPer", e.target.value)}
                onBlur={() => handleInputBlur(index)}
              />
            </td>
            <td>
              <input
                className="form-control"
                name="IGSTPer"
                value={item.IGSTPer ?? ""}
                onChange={(e) => handleInputChange(index, "IGSTPer", e.target.value)}
                onBlur={() => handleInputBlur(index)}
                style={{ width: "65px" }}
                onFocus={(e) => e.target.select()}
              />
            </td>
            {DefaultCurrencyName == "INR" &&
              <>
                <td>
                  <input
                    className="form-control"
                    name="CGSTPer"
                    value={item.CGSTPer ?? ""}
                    onChange={(e) => handleInputChange(index, "CGSTPer", e.target.value)}
                    onBlur={() => handleInputBlur(index)}
                    style={{ width: "65px" }}
                  />
                </td>
                <td>
                  <input
                    className="form-control"
                    name="SGSTPer"
                    value={item.SGSTPer ?? ""}
                    onChange={(e) => handleInputChange(index, "SGSTPer", e.target.value)}
                    onBlur={() => handleInputBlur(index)}
                    style={{ width: "65px" }}
                  />
                </td>
              </>}
            <td>
              <input className="form-control" value={rows[index].DiscountAmt} disabled />
            </td>
            <td>
              <input className="form-control" value={rows[index].TotalGSTAmt} disabled />
            </td>
            <td>
              <input className="form-control" value={rows[index].BuyPrice} disabled style={{ width: "65px" }} />
            </td>
            <td>
              <input className="form-control" value={rows[index].NetAmt} disabled style={{ width: "65px" }} />
            </td>
            <td>
              <i
                className="fa fa-times big-icon-Remove "
                onClick={() => handleRemoveRow(index)}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </Tables>
  );
};


export default GRNFromPoTble;