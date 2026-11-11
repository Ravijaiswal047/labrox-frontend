import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Accordion from "../../../components/UI/Accordion";
import ReactSelect from "../../../components/formComponent/ReactSelect";
import Tables from "../../../components/UI/customTable";
import Heading from "../../../components/UI/Heading";

const StockExpiryChange = () => {
  const { t } = useTranslation();
  const initialState = {
    CurrentLocation: "",
  };
  const [payload, setPayload] = useState(initialState);
  const [tableData, setTableData] = useState([]);
  const handleSelectChange = (name, value) => {
    setPayload((prev) => ({ ...prev, [name]: value?.value }));
  };
  return (
    <>
      <Accordion
        name={t("GRN Invoice Detail Update")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row px-2 pt-2">
          <ReactSelect
            name="CurrentLocation"
            id="CurrentLocation"
            removeIsClearable={true}
            // dynamicOptions={GRNTypeOption}
            placeholderName="CurrentLocation"
            value={payload?.CurrentLocation}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <div className="col-sm-1">
            <button className="btn btn-sm btn block btn-success">Search</button>
          </div>
        </div>
      </Accordion>
      <div className="card mt-2">
        <Heading title={t("Location Detail")} />
        <div className="row">
          <div className="col-sm-12">
            <Tables>
              <thead className="cf">
                <tr>
                  <th>{t("S.No")}</th>
                  <th>{t("StockID")}</th>
                  <th>{t("Barcodeno")}</th>
                  <th>{t("ItemName")}</th>
                  <th>{t("Manufacture")}</th>
                  <th>{t("Machine")}</th>
                  <th>{t("PackSize")}</th>
                  <th>{t("HsnCode")}</th>
                  <th>{t("CatalogNo")}</th>
                  <th>{t("InHand Qty")}</th>
                  <th>{t("Batch Number")}</th>
                  <th>{t("Expiry Date")}</th>
                  <th>{t("Select")}</th>
                </tr>
              </thead>
              <tbody>
                {tableData?.map((item, index) => (
                  <tr key={index}>
                    <td data-title={t("S.No")}>{index + 1}</td>
                    <td data-title={t("StockID")}>{item?.StockID}</td>
                    <td data-title={t("Barcodeno")}>{item?.Barcodeno}</td>
                    <td data-title={t("ItemName")}>{item?.ItemName}</td>
                    <td data-title={t("Manufacture")}>{item?.Manufacture}</td>
                    <td data-title={t("Machine")}>{item?.Machine}</td>
                    <td data-title={t("PackSize")}>{item?.PackSize}</td>
                    <td data-title={t("HsnCode")}>{item?.HsnCode}</td>
                    <td data-title={t("CatalogNo")}>{item?.CatalogNo}</td>
                    <td data-title={t("InHand Qty")}>{item?.InHandQty}</td>
                    <td data-title={t("Batch Number")}>{item?.BatchNumber}</td>
                    <td data-title={t("Expiry Date")}>{item?.ExpiryDate}</td>
                    <td data-title={t("Select")}>
                      <button onClick={() => handleSelect(item)}>Select</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Tables>
          </div>
        </div>
        <div className="row p-2">
            <div className="col-sm-12 d-flex justify-content-end">
                <button className="btn btn-sm btn block btn-success">Save</button>
            </div>
        </div>
      </div>
    </>
  );
};

export default StockExpiryChange;
