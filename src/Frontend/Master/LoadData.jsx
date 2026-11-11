import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { axiosInstance } from "../../utils/axiosInstance";
import moment from "moment";
import { Time } from "../../utils/helpers";
import { toast } from "react-toastify";
import Accordion from "@app/components/UI/Accordion";
import DatePicker from "../../components/formComponent/DatePicker";
import TimePicker from "../../components/formComponent/TimePicker";

const LoadData = () => {
  const today = new Date();
  const [state, setState] = useState({
    FromDate: new Date(),
    ToDate: new Date(),
    FromTime: new Date(today.setHours(0, 0, 0, 0)),
    ToTime: new Date(today.setHours(23, 59, 59, 999)),
  });
  const { t } = useTranslation();

  const dateSelect = (value, name) => {
    setState({
      ...state,
      [name]: value,
    });
  };
  const handleTime = (time, name) => {
    setState({ ...state, [name]: time });
  };

  const fetchData = () => {
    axiosInstance
      .post("DocShareMaster/utilityAccountShareData", {
        ...state,
        FromDate: moment(state?.FromDate).format("DD-MMM-YYYY"),
        ToDate: moment(state?.ToDate).format("DD-MMM-YYYY"),
        FromTime: Time(state.FromTime),
        ToTime: Time(state.ToTime),
      })
      .then((res) => {
        toast.success(res?.data?.message);
        setState({
          FromDate: new Date(),
          ToDate: new Date(),
          FromTime: new Date(today.setHours(0, 0, 0, 0)),
          ToTime: new Date(today.setHours(23, 59, 59, 999)),
        });
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || err?.data?.message);
      });
  };
  return (
    <>
      <Accordion name={t("Bulk Import Utility")} defaultValue={true} isBreadcrumb={true}>
        <div className="row pt-2 pl-2 pr-2">
          <div className="col-sm-2">
            <DatePicker
              placeholder=" "
              id="FromDate"
              lable="FromDate"
              name="FromDate"
              className="custom-calendar"
              value={state?.FromDate}
              onChange={dateSelect}
              maxDate={new Date()}
            />
          </div>
          <div className="col-md-1">
            <TimePicker
              name="FromTime"
              placeholder="FromTime"
              value={state?.FromTime}
              id="FromTime"
              lable="FromTime"
              onChange={handleTime}
            />
          </div>
          <div className="col-sm-2">
            <div>
              <DatePicker
                name="ToDate"
                placeholder=" "
                id="ToDate"
                lable="ToDate"
                className="custom-calendar"
                value={state?.ToDate}
                onChange={dateSelect}
                maxDate={new Date()}
                minDate={new Date(state.FromDate)}
              />
            </div>
          </div>
          <div className="col-md-1">
            <TimePicker
              name="ToTime"
              placeholder="ToTime"
              value={state?.ToTime}
              id="ToTime"
              lable="ToTime"
              onChange={handleTime}
            />
          </div>
          <div className="col-sm-1">
            <button
              className="btn btn-block btn-success btn-sm"
              onClick={fetchData}
            >
              {t("Import Data")}
            </button>
          </div>
        </div>
      </Accordion>
    </>
  );
};

export default LoadData;
