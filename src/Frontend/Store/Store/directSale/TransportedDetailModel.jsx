import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import ReactSelect from "../../../components/formComponent/ReactSelect";
import Input from "../../../components/formComponent/Input";
import Accordion from "../../../components/UI/Accordion";
import DatePicker from "../../../components/formComponent/DatePicker";

const TransportedDetailModel = () => {
  const { t } = useTranslation();
  const initialState = {
    TransportMode: "",
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
      <div className="row px-2">
        <Input
          type="text"
          placeholder=" "
          lable="Transporter ID"
          id="TransporterID"
          name="TransporterID"
          value={payload?.TransporterID}
          onChange={handleChange}
          respclass={"col-xl-3 col-sm-4 col-md-6 co-12"}
        />
        <ReactSelect
          name="TransportMode"
          id="TransportMode"
          removeIsClearable={true}
          // dynamicOptions={}
          placeholderName="Transport Mode"
          value={payload?.TransportMode}
          onChange={handleSelectChange}
          respclass={"col-xl-3 col-sm-4 col-md-6 co-12"}
        />
        <Input
          type="text"
          placeholder=" "
          lable="Distance"
          id="Distance"
          name="Distance"
          value={payload?.Distance}
          onChange={handleChange}
          respclass={"col-xl-3 col-sm-4 col-md-6 co-12"}
        />
        <Input
          type="text"
          placeholder=" "
          lable="Document Number"
          id="DocumentNumber"
          name="DocumentNumber"
          value={payload?.DocumentNumber}
          onChange={handleChange}
          respclass={"col-xl-3 col-sm-4 col-md-6 co-12"}
        />
        <DatePicker
          name="DocumentDate"
          id="DocumentDate"
          value={payload?.DocumentDate}
          onChange={dateSelect}
          maxDate={new Date()}
          placeholder=""
          lable={t("Document Date")}
          className="custom-calendar"
          respclass={"col-xl-3 col-sm-4 col-md-6 co-12"}
        />
        <Input
          type="text"
          placeholder=" "
          lable="Vehicle Number"
          id="VehicleNumber"
          name="VehicleNumber"
          value={payload?.VehicleNumber}
          onChange={handleChange}
          respclass={"col-xl-3 col-sm-4 col-md-6 co-12"}
        />
        <ReactSelect
          name="VehicleType"
          id="VehicleType"
          removeIsClearable={true}
          // dynamicOptions={}
          placeholderName="Vehicle Type"
          value={payload?.VehicleType}
          onChange={handleSelectChange}
          respclass={"col-xl-3 col-sm-4 col-md-6 co-12"}
        />
        <div className="col-sm-2">
          <button className="btn btn-sm btn-success">Add Details</button>
        </div>
      </div>
    </>
  );
};

export default TransportedDetailModel;
