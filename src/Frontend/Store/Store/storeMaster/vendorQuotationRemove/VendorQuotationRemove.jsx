import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Accordion from "../../../../components/UI/Accordion";
import MultiSelctItems from "../../../../components/formComponent/MultiSelctItems";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import DatePicker from "../../../../components/formComponent/DatePicker";
import Tables from "../../../../components/UI/customTable";

const VendorQuotationRemove = () => {
  const { t } = useTranslation();
  const initialState = {
    CentreType: "",
    CountryId: "",
    StateId: "",
    CityId: "",
    CentreId: "",
    LocationId: "",
    SupplierId: "",
    MachineId: "",
    ItemsId: "",
    FromDate: new Date(),
    ToDate: new Date(),
  };
  const [payload, setPayload] = useState(initialState);
  const [tableData, setTableData] = useState([]);
  const handleSelectChange = (name, value) => {
    setPayload((prev) => ({ ...prev, [name]: value?.value }));
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPayload((prev) => ({ ...prev, [name]: value }));
  };
  const dateSelect = (date, name) => {
    setPayload({
      ...payload,
      [name]: date,
    });
  };
  return (
    <>
      <Accordion
        name={t("Store Location Master")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row px-2 pt-2">
          <MultiSelctItems
            placeholderName="Centre Type"
            name="CentreType"
            values={payload}
            setValues={setPayload}
            // dynamicOptions={dropDownList?.department}
            labelKey="NAME"
            valueKey="SubCategoryID"
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />
          <ReactSelect
            name="CountryId"
            id="CountryId"
            removeIsClearable={true}
            // dynamicOptions={GRNTypeOption}
            placeholderName="Country"
            value={payload?.CountryId}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <MultiSelctItems
            placeholderName="State"
            name="StateId"
            values={payload}
            setValues={setPayload}
            // dynamicOptions={dropDownList?.department}
            labelKey="NAME"
            valueKey="SubCategoryID"
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />
          <MultiSelctItems
            placeholderName="City"
            name="CityId"
            values={payload}
            setValues={setPayload}
            // dynamicOptions={dropDownList?.department}
            labelKey="NAME"
            valueKey="SubCategoryID"
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />
          <MultiSelctItems
            placeholderName="Centre"
            name="CentreId"
            values={payload}
            setValues={setPayload}
            // dynamicOptions={dropDownList?.department}
            labelKey="NAME"
            valueKey="SubCategoryID"
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />
          <MultiSelctItems
            placeholderName="Location"
            name="LocationId"
            values={payload}
            setValues={setPayload}
            // dynamicOptions={dropDownList?.department}
            labelKey="NAME"
            valueKey="SubCategoryID"
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />
          <MultiSelctItems
            placeholderName="Supplier"
            name="SupplierId"
            values={payload}
            setValues={setPayload}
            // dynamicOptions={dropDownList?.department}
            labelKey="NAME"
            valueKey="SubCategoryID"
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />
          <MultiSelctItems
            placeholderName="Machine"
            name="MachineId"
            values={payload}
            setValues={setPayload}
            // dynamicOptions={dropDownList?.department}
            labelKey="NAME"
            valueKey="SubCategoryID"
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />
          <MultiSelctItems
            placeholderName="Items"
            name="ItemsId"
            values={payload}
            setValues={setPayload}
            // dynamicOptions={dropDownList?.department}
            labelKey="NAME"
            valueKey="SubCategoryID"
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
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
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
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <div className="col-sm-2 d-flex justify-content-between">
            <button className="btn btn-sm btn-success">Search</button>
            <button className="btn btn-sm btn-success ml-2">Active</button>
            <button className="btn btn-sm btn-success ml-2">InActive</button>
          </div>
        </div>
      </Accordion>
      <Accordion
        name={t("Search Items")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row">
          <div className="col-sm-12">
            <Tables>
              <thead>
                <tr>
                  <th>{t("Quotation No.")}</th>
                  <th>{t("From Date")}</th>
                  <th>{t("To Date")}</th>
                  <th>{t("Item ID")}</th>
                  <th>{t("Item Name")}</th>
                  <th>{t("Vendor Name")}</th>
                  <th>{t("Vendor Address")}</th>
                  <th>{t("GSTN No.")}</th>
                  <th>{t("Delivery Location")}</th>
                  <th>
                    <input type="checkbox" name="selectAll" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {tableData?.map((row, index) => (
                  <tr key={index}>
                    <td data-title="Quotation No.">{row?.quotationNo}</td>
                    <td data-title="From Date">{row?.fromDate}</td>
                    <td data-title="To Date">{row?.toDate}</td>
                    <td data-title="Item ID">{row?.itemId}</td>
                    <td data-title="Item Name">{row?.itemName}</td>
                    <td data-title="Vendor Name">{row?.vendorName}</td>
                    <td data-title="Vendor Address">{row?.vendorAddress}</td>
                    <td data-title="GSTN No.">{row?.gstnNo}</td>
                    <td data-title="Delivery Location">
                      {row?.deliveryLocation}
                    </td>
                    <td>
                      <input type="checkbox" name={`select-${index}`} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Tables>
          </div>
        </div>
      </Accordion>
    </>
  );
};

export default VendorQuotationRemove;
