import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Tables from "../../../../components/UI/customTable";
import Heading from "../../../../components/UI/Heading";
import DatePicker from "../../../../components/formComponent/DatePicker";
import ReactSelect from "../../../../components/formComponent/ReactSelect";

const VendorReplacement = () => {
  const { t } = useTranslation();
  const initialState = {
    VendorId: "",
    LocationId: "",
    FromDate: new Date(),
    ToDate: new Date(),
  };
  const [tableData, setTableData] = useState([
    {
      newBatch: "BATCH001",
      returnDate: "2023-10-01",
      itemType: "Medicine",
      stockId: "STK001",
      itemId: "ITEM001",

      itemName: "Paracetamol",
      returnQty: 10,
      oldReplaceQty: 5,
      remainQty: 5,
      batchNumber: "BATCH001",
      expiryDate: "2024-01-01",
      replaceQty: 5,
      rate: 10,
      discAmt: 1,
      taxAmt: 0.5,
      unitPrice: 9.5,
    },
    {
      newBatch: "BATCH002",
      returnDate: "2023-10-02",
      itemType: "Medicine",
      stockId: "STK002",
      itemId: "ITEM002",

      itemName: "Amoxicillin",
      returnQty: 20,
      oldReplaceQty: 10,
      remainQty: 10,
      batchNumber: "BATCH002",
      expiryDate: "2024-02-01",
      replaceQty: 10,
      rate: 20,
      discAmt: 2,
      taxAmt: 1,
      unitPrice: 18,
    },
  ]);
  const [payload, setPayload] = useState(initialState);
  const handleSelectChange = (name, value) => {
    setPayload((prev) => ({ ...prev, [name]: value?.value }));
  };
  const dateSelect = (date, name) => {
    setPayload({
      ...payload,
      [name]: date,
    });
  };
  return (
    <>
      <div className="card">
        <Heading name={"Return Item To Supplier"} isBreadcrumb={true} />
        <div className="row p-2">
          <DatePicker
            name="FromDate"
            id="FromDate"
            value={payload?.FromDate}
            onChange={dateSelect}
            maxDate={new Date()}
            placeholder=""
            lable={t("From Date")}
            className="custom-calendar"
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />
          <DatePicker
            name="ToDate"
            id="ToDate"
            value={payload?.ToDate}
            onChange={dateSelect}
            maxDate={new Date()}
            placeholder=""
            lable={t("TO Date")}
            className="custom-calendar"
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />
          <ReactSelect
            name="LocationId"
            id="LocationId"
            removeIsClearable={true}
            // dynamicOptions={GRNTypeOption}
            placeholderName="Location"
            value={payload?.LocationId}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />
          <ReactSelect
            name="VendorId"
            id="VendorId"
            removeIsClearable={true}
            // dynamicOptions={GRNTypeOption}
            placeholderName="Supplier"
            value={payload?.VendorId}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />

          <div className="col-sm-2 d-flex">
            <button className="btn btn-primary w-100">Search</button>
            <button className="btn btn-primary w-100 ml-2">
              Export To Excel
            </button>
          </div>
        </div>
      </div>
      <div className="card mt-2">
        <Heading name={"Vendor Return List"} isBreadcrumb={true} />
        <div className="row">
          <div className="col-sm-12">
            <Tables>
              <thead>
                <tr>
                  <th>{t("Sr.No.")}</th>
                  <th>{t("NewBatch")}</th>
                  <th>{t("Return Date")}</th>
                  <th>{t("Item Type")}</th>
                  <th>{t("Stock ID")}</th>
                  <th>{t("Item ID")}</th>
                  <th>{t("Item Name")}</th>
                  <th>{t("Return Qty")}</th>
                  <th>{t("OLDReplace Qty")}</th>
                  <th>{t("Remain Qty")}</th>
                  <th>{t("BatchNumber")}</th>
                  <th>{t("ExpiryDate")}</th>
                  <th>{t("ReplaceQty")}</th>
                  <th>{t("Rate")}</th>
                  <th>{t("DiscAmt")}</th>
                  <th>{t("TaxAmt")}</th>
                  <th>{t("Unit Price")}</th>
                  <th>{t("#")}</th>
                </tr>
              </thead>
              <tbody>
                {tableData?.map((row, index) => (
                  <tr key={index}>
                    <td data-title={t("Sr.No.")}>{index + 1}</td>
                    <td data-title={t("NewBatch")}>{row.newBatch}</td>
                    <td data-title={t("Return Date")}>{row.returnDate}</td>
                    <td data-title={t("Item Type")}>{row.itemType}</td>
                    <td data-title={t("Stock ID")}>{row.stockId}</td>
                    <td data-title={t("Item ID")}>{row.itemId}</td>
                    <td data-title={t("Item Name")}>{row.itemName}</td>
                    <td data-title={t("Return Qty")}>{row.returnQty}</td>
                    <td data-title={t("OLDReplace Qty")}>
                      {row.oldReplaceQty}
                    </td>
                    <td data-title={t("Remain Qty")}>{row.remainQty}</td>
                    <td data-title={t("BatchNumber")}>{row.batchNumber}</td>
                    <td data-title={t("ExpiryDate")}>{row.expiryDate}</td>
                    <td data-title={t("ReplaceQty")}>{row.replaceQty}</td>
                    <td data-title={t("Rate")}>{row.rate}</td>
                    <td data-title={t("DiscAmt")}>{row.discAmt}</td>
                    <td data-title={t("TaxAmt")}>{row.taxAmt}</td>
                    <td data-title={t("Unit Price")}>{row.unitPrice}</td>
                    <td data-title={t("#")}>
                      <button
                        className="btn btn-sm btn-danger"
                        // onClick={() => handleDelete(index)}
                      >
                        ❌
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Tables>
          </div>
        </div>
      </div>
    </>
  );
};

export default VendorReplacement;
