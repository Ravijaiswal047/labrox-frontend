import React, { useState } from "react";
import ReactSelect from "../../../components/formComponent/ReactSelect";
import { useTranslation } from "react-i18next";
import DatePicker from "../../../components/formComponent/DatePicker";
import { Button } from "react-bootstrap";

const DiscardReport = () => {
  const { t } = useTranslation();
  const initialState = {
    Centre: "",
    DiscardFromDate: new Date(),
    DiscardToDate: new Date(),
  };
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
        <div className="row p-2">
          <ReactSelect
            name="Centre"
            id="Centre"
            removeIsClearable={true}
            // dynamicOptions={CentreOption}
            placeholderName="Centre"
            value={payload?.Centre}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <DatePicker
            name="DiscardFromDate"
            id="DiscardFromDate"
            value={payload?.DiscardFromDate}
            onChange={dateSelect}
            maxDate={new Date()}
            placeholder=""
            lable={t("Discard Date From")}
            className="custom-calendar"
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <DatePicker
            name="DiscardToDate"
            id="DiscardToDate"
            value={payload?.DiscardToDate}
            onChange={dateSelect}
            maxDate={new Date()}
            placeholder=""
            lable={t("Discard Date To")}
            className="custom-calendar"
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />{" "}
          <div className="col-sm-1">
            <Button className="rounded py-0 ">Search</Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default DiscardReport;
