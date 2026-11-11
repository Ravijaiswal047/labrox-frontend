import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Accordion from "../../../../components/UI/Accordion";
import DatePicker from "../../../../components/formComponent/DatePicker";
import MultiSelctItems from "../../../../components/formComponent/MultiSelctItems";
import Input from "../../../../components/formComponent/Input";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import Heading from "../../../../components/UI/Heading";
import ColorCodingSearch from "../../../../components/ModalComponent/ColorCodingSearch";
import Tables from "../../../../components/UI/customTable";

const PurchaseOrderAutoClose = () => {
  const { t } = useTranslation();
  const initialState = {
    FromDate: new Date(),
    ToDate: new Date(),
    VendorId: "",
    PONo: "",
    OrderType: "",
    Validate: "",
    MakerName: "",
    IndentNo: "",
    CentreType: "",
    CountryId: "",
    StateId: "",
    LocationId: "",
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
  const colorCodingData = [
    { color: "#FFC0CB", id: "7", labelKey: "Open" },
    { color: "#90EE90", id: "8", labelKey: "Approved" },
    { color: "#E2680A", id: "15", labelKey: "Partial GRN" },
  ];
  return (
    <>
      <Accordion
        name={t("PO Auto Close")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row px-2 pt-2">
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
          <MultiSelctItems
            placeholderName="Vendor"
            name="VendorId"
            values={payload}
            setValues={setPayload}
            // dynamicOptions={dropDownList?.department}
            labelKey="NAME"
            valueKey="SubCategoryID"
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />
          <Input
            type="text"
            placeholder=" "
            lable="PO No"
            id="PONo"
            name="PONo"
            value={payload?.PONo}
            onChange={handleChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <ReactSelect
            name="OrderType"
            id="OrderType"
            removeIsClearable={true}
            // dynamicOptions={GRNTypeOption}
            placeholderName="Order Type"
            value={payload?.OrderType}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <ReactSelect
            name="Validate"
            id="Validate"
            removeIsClearable={true}
            // dynamicOptions={GRNTypeOption}
            placeholderName="Validate"
            value={payload?.Validate}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <ReactSelect
            name="MakerName"
            id="MakerName"
            removeIsClearable={true}
            // dynamicOptions={GRNTypeOption}
            placeholderName="MakerName"
            value={payload?.MakerName}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
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
        </div>

        {/* <div className="row px-2 pb-2">
          <div className="col-sm-2 d-flex">
            <button className="btn btn-sm btn-success">Save</button>
            <button className="btn btn-sm btn-success ml-2">Search</button>
          </div>
        </div> */}
      </Accordion>
      <Accordion
        name={t("Location Filter")}
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
            placeholderName="Location"
            name="LocationId"
            values={payload}
            setValues={setPayload}
            // dynamicOptions={dropDownList?.department}
            labelKey="NAME"
            valueKey="SubCategoryID"
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />
          <div className="col-sm-2">
            <button className="btn btn-sm btn-success">Search</button>
          </div>
        </div>
      </Accordion>
      <Heading
        title={"Search Details"}
        secondTitle={
          <>
            {colorCodingData.map(({ color, labelKey, id }) => (
              <ColorCodingSearch
                key={id}
                color={color}
                label={t(labelKey)}
                //   onClick={() => handleCallViewMedReq(id)}
              />
            ))}
          </>
        }
      />
      <div className="row">
        <div className="col-sm-12">
          <Tables>
            <thead>
              <tr>
                <th>{t("Sr No.")}</th>
                <th>{t("Item Name")}</th>
                <th>{t("Type")}</th>
                <th>{t("Delete")}</th>
              </tr>
            </thead>
            <tbody>
              {tableData?.map((row, index) => (
                <tr key={index}>
                  <td data-title="Sr No.">{index + 1}</td>
                  <td data-title="Item Name">{row?.Location}</td>
                  <td data-title="Type">{row?.Items}</td>
                  <td data-title="Delete">{row?.Items}</td>
                </tr>
              ))}
            </tbody>
          </Tables>
        </div>
      </div>
    </>
  );
};

export default PurchaseOrderAutoClose;
