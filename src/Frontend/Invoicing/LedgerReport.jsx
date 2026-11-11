import React from "react";
import { useState, useEffect } from "react";
import DatePicker from "../../components/formComponent/DatePicker";
import { useTranslation } from "react-i18next";
import { SelectBox } from "../../components/formComponent/SelectBox";
import { ExportToExcel } from "../../utils/helpers";
import Accordion from "@app/components/UI/Accordion";
import { GetRateTypeByGlobalCentre } from "../../utils/NetworkApi/commonApi";
import { toast } from "react-toastify";
import { axiosInstance } from "../../utils/axiosInstance";
import moment from "moment";
import { CustomButton } from "../../components/UI/CustomButton";

const LedgerReport = () => {
  const InitialData = {
    CentreId: "",
    FromDate: new Date(),
    ToDate: new Date(),
  };
  const [searchData, setSearchData] = useState(InitialData);
  const [reportType, setReportType] = useState("Summary");
  const [client, setClient] = useState([]);
  const { t } = useTranslation();
  const dateSelect = (value, name) => {
    if (name === "FromDate") {
      const updateDate =
        new Date(searchData?.ToDate) - value < 0 ? value : searchData.ToDate;
      setSearchData((searchData) => ({
        ...searchData,
        [name]: value,
        ToDate: updateDate,
      }));
    } else if (name === "ToDate") {
      setSearchData((searchData) => ({
        ...searchData,
        [name]: value,
      }));
    } else {
      setSearchData((searchData) => ({
        ...searchData,
        [name]: value,
      }));
    }
  };
  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchData({
      ...searchData,
      [name]: value,
    });
  };
  useEffect(() => {
    GetRateTypeByGlobalCentre(setClient);
  }, []);
  const handleRadioChange = (e) => {
    setReportType(e.target.value);
  };

  const handleReport = () => {
    if (searchData?.CentreId != "") {
      axiosInstance
        .post("Accounts/getReportdata", {
          ...searchData,
          FromDate: moment(searchData.FromDate).format("YYYY-MM-DD"),
          ToDate: moment(searchData.ToDate).format("YYYY-MM-DD"),
          ReportType: reportType,
        })
        .then((res) => {
          const data = res?.data?.message;
          toast.success("Report Found");

          ExportToExcel(data);
        })
        .catch((err) => {
          toast.error(
            err?.response?.data?.message
              ? err?.response?.data?.message
              : "Something Went Wrong",
          );
        });
    } else {
      toast.error("Please Select Any Rate Type");
    }
  };
  return (
    <>
      <Accordion
        name={t("Ledger Report")}
        isBreadcrumb={true}
        defaultValue={true}
      >
        <div className="row px-2 mt-2 mb-1">
          <div className="col-sm-2">
            <SelectBox
              options={[{ label: "Select RateType", value: "" }, ...client]}
              name="CentreId"
              lable={t("Rate Type")}
              className="required-fields"
              id="Rate Type"
              selectedValue={searchData?.CentreId}
              onChange={handleSearchChange}
            />
          </div>

          <div className="col-sm-2">
            <DatePicker
              className="custom-calendar"
              placeholder=" "
              id="FromDate"
              lable={t("FromDate")}
              name="FromDate"
              value={
                searchData?.FromDate
                  ? new Date(searchData?.FromDate)
                  : new Date()
              }
              onChange={dateSelect}
            />
          </div>

          <div className="col-sm-2">
            <DatePicker
              className="custom-calendar"
              placeholder=" "
              id="ToDate"
              lable={t("ToDate")}
              name="ToDate"
              value={
                searchData?.ToDate ? new Date(searchData?.ToDate) : new Date()
              }
              minDate={searchData?.FromDate}
              onChange={dateSelect}
            />
          </div>
          <div className="col-sm-2">
            <input
              type="radio"
              className="mt-2"
              name="Summary"
              value="Summary"
              checked={reportType == "Summary" ? true : false}
              onChange={handleRadioChange}
            />
            &nbsp;
            <label>{t("Summary (Not More Than 6 Month)")}</label>
          </div>

          <div className="col-sm-2">
            <input
              type="radio"
              name="Detail"
              className="mt-2"
              value="Detail"
              checked={reportType == "Detail" ? true : false}
              onChange={handleRadioChange}
            />
            &nbsp;
            <label>{t("Detail (Not More Than 31 Days)")}</label>
          </div>

          <div className="col-sm-1">
            <CustomButton
              text={"Get Report"}
              icon={"excel"}
              onClick={handleReport}
            />
          </div>
        </div>
      </Accordion>
    </>
  );
};

export default LedgerReport;
