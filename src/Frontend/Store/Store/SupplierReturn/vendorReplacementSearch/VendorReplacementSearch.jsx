import React, { useState } from "react";
import Tables from "../../../../components/UI/customTable";
import Heading from "../../../../components/UI/Heading";
import DatePicker from "../../../../components/formComponent/DatePicker";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import { useTranslation } from "react-i18next";

const VendorReplacementSearch = () => {
  const { t } = useTranslation();
  const initialState = {
    VendorId: "",
    LocationId: "",
    FromDate: new Date(),
    ToDate: new Date(),
  };
  const [tableData, setTableData] = useState([
    {
        replaceInvoiceNo: "REPLACE001",
        replaceDate: "2023-10-01",
        returnInvoiceNo: "RETURN001",
        returnDate: "2023-10-02",
        supplierName: "Supplier A",
        locationName: "Location 1",
        itemName: "Item X",
        batchNumber: "BATCH123",
        expiryDate: "2024-01-01",
        returnQty: 10,
        replaceQty: 5,
        unit: "pcs",
        rate: 100,
        discAmt: 5,
        taxAmt: 2,
        unitPrice: 97,
        },
        {
        replaceInvoiceNo: "REPLACE002",
        replaceDate: "2023-10-03",
        returnInvoiceNo: "RETURN002",
        returnDate: "2023-10-04",
        supplierName: "Supplier B",
        locationName: "Location 2",
        itemName: "Item Y",
        batchNumber: "BATCH456",
        expiryDate: "2024-02-01",
        returnQty: 15,
        replaceQty: 10,
        unit: "pcs",
        rate: 200,
        discAmt: 10,
        taxAmt: 4,
        unitPrice: 186,
    }
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
                  <th style={{width:"2%",textAlign:"center"}}>{t("Sr.No.")}</th>
                  <th>{t("Replace InvoiceNo")}</th>
                  <th>{t("Replace Date")}</th>
                  <th>{t("Return InvoiceNo")}</th>
                  <th>{t("Return Date")}</th>
                  <th>{t("SupplierName")}</th>
                  <th>{t("LocationName")}</th>
                  <th>{t("ItemName")}</th>
                  <th>{t("BatchNumber")}</th>
                  <th>{t("ExpiryDate")}</th>
                  <th>{t("ReturnQty")}</th>
                  <th>{t("ReplaceQty")}</th>
                  <th>{t("Unit")}</th>
                  <th>{t("Rate")}</th>
                  <th>{t("DiscAmt")}</th>
                  <th>{t("TaxAmt")}</th>
                  <th>{t("UnitPrice")}</th>
                </tr>
              </thead>
              <tbody>
                {tableData?.map((row, index) => (
                  <tr key={index}>
                    <td><span className="text-center ml-2">{index + 1}</span></td>
                    <td>{row.replaceInvoiceNo}</td>
                    <td>{row.replaceDate}</td>
                    <td>{row.returnInvoiceNo}</td>
                    <td>{row.returnDate}</td>
                    <td>{row.supplierName}</td>
                    <td>{row.locationName}</td>
                    <td>{row.itemName}</td>
                    <td>{row.batchNumber}</td>
                    <td>{row.expiryDate}</td>
                    <td>{row.returnQty}</td>
                    <td>{row.replaceQty}</td>
                    <td>{row.unit}</td>
                    <td>{row.rate}</td>
                    <td>{row.discAmt}</td>
                    <td>{row.taxAmt}</td>
                    <td>{row.unitPrice}</td>
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

export default VendorReplacementSearch;
