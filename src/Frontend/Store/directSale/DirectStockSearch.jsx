import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Accordion from "../../../components/UI/Accordion";
import ReactSelect from "../../../components/formComponent/ReactSelect";
import MultiSelctItems from "../../../components/formComponent/MultiSelctItems";
import Input from "../../../components/formComponent/Input";
import DatePicker from "../../../components/formComponent/DatePicker";
import Tables from "../../../components/UI/customTable";

const DirectStockSearch = () => {
  const { t } = useTranslation();
  const initialState = {
    IndentNo: "",
    FromDate: new Date(),
    ToDate: new Date(),
    CurrentLocation: "",
    FromCountryId: "",
    FromStateId: "",
    IssueFrom: "",
    ToCountryId: "",
    ToStateId: "",
    IssueTo: "",
  };
  const [payload, setPayload] = useState(initialState);
  const [tableData, setTableData] = useState([]);
  const handleSelectChange = (name, value) => {
    setPayload((prev) => ({ ...prev, [name]: value?.value }));
  };
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPayload((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked === true ? "1" : "0") : value,
    }));
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
        name={t("Direct Issue")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row px-2 pt-2">
          <Input
            type="text"
            placeholder=" "
            lable="Indent No"
            id="IndentNo"
            name="IndentNo"
            value={payload?.IndentNo}
            onChange={handleChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
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
          <ReactSelect
            name="CurrentLocation"
            id="CurrentLocation"
            removeIsClearable={true}
            dynamicOptions={[
              { value: "0", label: "All" },
              { value: "1", label: "Direct Issue" },
              { value: "2", label: "Direct Stock Transfer" },
              { value: "3", label: "SI" },
            ]}
            placeholderName="Current Location"
            value={payload?.CurrentLocation}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
        </div>
        <div className="row px-2">
          <ReactSelect
            name="FromCountryId"
            id="FromCountryId"
            removeIsClearable={true}
            // dynamicOptions={dropDownApis?.countrybind?.map((ele) => ({
            //   value: ele?.CountryID,
            //   label: ele?.CountryName,
            // }))}
            placeholderName="Country"
            value={payload?.FromCountryId}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <MultiSelctItems
            placeholderName="State"
            name="FromStateId"
            values={payload}
            setValues={setPayload}
            // dynamicOptions={dropDownApis?.statebind}
            labelKey="stateName"
            valueKey="id"
            // handleChange={handleSelectMultiChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />

          <ReactSelect
            name="IssueFrom"
            id="IssueFrom"
            removeIsClearable={true}
            // dynamicOptions={}
            placeholderName=" Issue From"
            value={payload?.IssueFrom}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
        </div>
        <div className="row px-2">
          <ReactSelect
            name="ToCountryId"
            id="ToCountryId"
            removeIsClearable={true}
            // dynamicOptions={dropDownApis?.countrybind?.map((ele) => ({
            //   value: ele?.CountryID,
            //   label: ele?.CountryName,
            // }))}
            placeholderName="Country"
            value={payload?.FromCountryId}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <MultiSelctItems
            placeholderName="State"
            name="ToStateId"
            values={payload}
            setValues={setPayload}
            // dynamicOptions={dropDownApis?.statebind}
            labelKey="stateName"
            valueKey="id"
            // handleChange={handleSelectMultiChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />
          <ReactSelect
            name="IssueTo"
            id="IssueTo"
            removeIsClearable={true}
            // dynamicOptions={}
            placeholderName="Issue To"
            value={payload?.IssueTo}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />

          <div className="col-sm-2">
            <button className="btn btn-sm btn-success">Search</button>
          </div>
        </div>
      </Accordion>
      <Accordion
        name={t("Direct Issue")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row">
          <div className="col-sm-12">
            <Tables>
              <thead>
                <tr>
                  <th>{t("#")}</th>
                  <th>{t("Indent No")}</th>
                  <th>{t("Invoice No")}</th>
                  <th>{t("Indent Type")}</th>
                  <th>{t("Date")}</th>
                  <th>{t("Issue From Location")}</th>
                  <th>{t("Issue To Location")}</th>
                  <th>{t("Created User")}</th>
                  <th>{t("Status")}</th>
                  <th>{t("TRN")}</th>
                  <th>{t("Invoice")}</th>
                </tr>
              </thead>
              <tbody>
                {tableData?.map((row, index) => (
                  <tr key={index}>
                    <td data-title="#">{index + 1}</td>
                    <td data-title="Indent No">{row?.indentNo}</td>
                    <td data-title="Invoice No">{row?.invoiceNo}</td>
                    <td data-title="Indent Type">{row?.indentType}</td>
                    <td data-title="Date">{row?.date}</td>
                    <td data-title="Issue From Location">
                      {row?.issueFromLocation}
                    </td>
                    <td data-title="Issue To Location">
                      {row?.issueToLocation}
                    </td>
                    <td data-title="Created User">{row?.createdUser}</td>
                    <td data-title="Status">{row?.status}</td>
                    <td data-title="TRN">{row?.trn}</td>
                    <td data-title="Invoice">
                      {/* <button onClick={() => handleInvoice(row)}>View</button> */}
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

export default DirectStockSearch;
