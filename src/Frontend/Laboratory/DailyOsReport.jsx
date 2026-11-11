import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import DatePicker from "../../components/formComponent/DatePicker";
import Loading from "../../components/loader/Loading";
import Accordion from "@app/components/UI/Accordion";
import { useTranslation } from "react-i18next";
import { axiosReport } from "../../utils/axiosInstance";
import {
  getAccessCentresReports,
  getAccessDataRateReport,
} from "../../utils/NetworkApi/commonApi";
import MultiSelectComp from "../../components/formComponent/MultiSelectComp";
import { CustomButton } from "../../components/UI/CustomButton";
import Tables from "../../components/UI/customTable";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import { downloadExcelBlob, formatStandardDate, openPdfBlob } from "../../utils/helpers";

const REPORT_TYPE = {
  SEARCH: 0,
  PDF: 1,
  EXCEL: 2,
};

const defaultFormData = {
  Centre: [],
  MultipleRateType: [],
  FromDate: new Date(),
  ToDate: new Date(),
};

const DailyOsReport = () => {
  const { t } = useTranslation();
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [loadingExcel, setLoadingExcel] = useState(false);
  const [CentreData, setCentreData] = useState([]);
  const [rateType, setRateType] = useState([]);
  const [formData, setFormData] = useState(defaultFormData);
  const [tableData, setTableData] = useState([]);
  const [searched, setSearched] = useState(false);

  const dateSelect = (date, name) => {
    setFormData((prev) => ({ ...prev, [name]: date }));
  };

  const handleSelectMultiChange = (name, value) => {
    if (name === "Centre") {
      setFormData((prev) => ({
        ...prev,
        Centre: value || [],
        MultipleRateType: [],
      }));
      const centres = Array.isArray(value) ? value : [];
      if (centres.length > 0) {
        getAccessDataRateReport(setRateType, centres);
      } else {
        setRateType([]);
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value || [] }));
    }
  };

  const buildPayload = (reportType) => ({
    fromDate: formatStandardDate(formData?.FromDate, "YYYY-MM-DD"),
    toDate: formatStandardDate(formData?.ToDate, "YYYY-MM-DD"),
    centreIds: formData.Centre?.length > 0 ? formData.Centre : [],
    rateTypeIds: formData.MultipleRateType?.length > 0 ? formData.MultipleRateType : [],
    reportType,
  });

  const handleBlobError = async (err) => {
    if (err?.response?.data instanceof Blob) {
      try {
        const text = await err.response.data.text();
        const json = JSON.parse(text);
        toast.error(json?.message || "Error while fetching report.");
      } catch {
        toast.error("Error while fetching report.");
      }
      return;
    }
    toast.error(err?.response?.data?.message || "Error while fetching report.");
  };

  const handleSearch = async () => {
    setLoadingSearch(true);
    setSearched(true);
    try {
      const res = await axiosReport.post("NPLReport/DailyOSReport", buildPayload(REPORT_TYPE.SEARCH));
      const data = Array.isArray(res?.data?.message) ? res.data.message : [];
      setTableData(data);
      if (data.length === 0) {
        toast.error(typeof res?.data?.message === "string" ? res.data.message : "No data found.");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Search failed! Please try again.");
      setTableData([]);
    } finally {
      setLoadingSearch(false);
    }
  };

  const handlePdfReport = async () => {
    setLoadingPdf(true);
    try {
      const res = await axiosReport.post(
        "NPLReport/DailyOSReport",
        buildPayload(REPORT_TYPE.PDF),
        { responseType: "blob" }
      );

      const contentType = res.headers?.["content-type"] || "";
      if (contentType.includes("application/json")) {
        const text = await res.data.text();
        const json = JSON.parse(text);
        if (json?.success && json?.url) {
          window.open(json.url, "_blank");
        } else {
          toast.error(json?.message || "No records found.");
        }
        return;
      }

      if (!res.data || res.data.size === 0) {
        toast.error("No data available to export.");
        return;
      }

      openPdfBlob(res.data);
    } catch (err) {
      await handleBlobError(err);
    } finally {
      setLoadingPdf(false);
    }
  };

  const getExcelFileName = (res) => {
    const disposition = res.headers?.["content-disposition"] || "";
    const serverName = disposition
      .match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)?.[1]
      ?.replace(/['"]/g, "")
      ?.replace(/\.xlsx$/i, "")
      ?.trim();
    if (serverName) return serverName;

    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return `DailyOSReport_${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
  };

  const handleExcelReport = async () => {
    setLoadingExcel(true);
    try {
      const res = await axiosReport.post(
        "NPLReport/DailyOSReport",
        buildPayload(REPORT_TYPE.EXCEL),
        { responseType: "blob" }
      );

      const contentType = res.headers?.["content-type"] || "";
      if (contentType.includes("application/json")) {
        const text = await res.data.text();
        const json = JSON.parse(text);
        toast.error(json?.message || "No records found.");
        return;
      }

      if (!res.data || res.data.size === 0) {
        toast.error("No data available to export.");
        return;
      }

      downloadExcelBlob(res.data, getExcelFileName(res));
      toast.success("Excel File Downloaded");
    } catch (err) {
      await handleBlobError(err);
    } finally {
      setLoadingExcel(false);
    }
  };

  useEffect(() => {
    if (CentreData?.length === 1) {
      const singleCentre = [CentreData[0].value];
      setFormData((prev) => ({ ...prev, Centre: singleCentre }));
      getAccessDataRateReport(setRateType, singleCentre);
    }
  }, [CentreData]);

  useEffect(() => {
    getAccessCentresReports(setCentreData);
  }, []);

  return (
    <>
      <Accordion
        name={t("Daily Os Report")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row px-2 mt-2 p-1">
          <div className="col-12 col-sm-6 col-md-2 my-1">
            <DatePicker
              className="custom-calendar"
              name="FromDate"
              value={formData?.FromDate}
              onChange={dateSelect}
              maxDate={new Date()}
              lable={t("FromDate")}
            />
          </div>
          <div className="col-12 col-sm-6 col-md-2 my-1">
            <DatePicker
              className="custom-calendar"
              name="ToDate"
              value={formData?.ToDate}
              onChange={dateSelect}
              maxDate={new Date()}
              minDate={new Date(formData.FromDate)}
              lable={t("ToDate")}
            />
          </div>
          <div className="col-12 col-sm-6 col-md-2 my-1">
            <MultiSelectComp
              label="All Centre"
              options={CentreData}
              value={formData?.Centre}
              name="Centre"
              onChange={handleSelectMultiChange}
              lable={t("Select Centre")}
            />
          </div>
          <div className="col-12 col-sm-6 col-md-2 my-1">
            <MultiSelectComp
              label="All RateType"
              options={rateType}
              value={formData?.MultipleRateType}
              name="MultipleRateType"
              onChange={handleSelectMultiChange}
              lable={t("Select RateType")}
            />
          </div>
          <div className="col-12 col-sm-6 col-md-4 my-1 d-flex align-items-center" style={{ gap: "10px" }}>
            {loadingSearch ? (
              <Loading />
            ) : (
              <CustomButton
                text={"Search"}
                icon={"search"}
                onClick={handleSearch}
                className="mr-2"
              />
            )}
            {loadingPdf ? (
              <Loading />
            ) : (
              <CustomButton
                text={"PDF"}
                icon={"pdf"}
                onClick={handlePdfReport}
                className="mr-2"
              />
            )}
            {loadingExcel ? (
              <Loading />
            ) : (
              <CustomButton
                text={"Excel"}
                icon={"excel"}
                onClick={handleExcelReport}
              />
            )}
          </div>
        </div>
      </Accordion>
      <Accordion
        title={t("Search Data")}
        defaultValue={true}
        linkTitle={
          <div className="link-title-container mt-2" style={{ marginRight: "10px" }}>
            <label>
              Days Sales OS = ((opening + closing) / 2 / current Sale) * Tenure In Days
            </label>
          </div>
        }
      >
        <div className="row gx-3 gy-3">
          <div className="card w-100">
            <div className="card-body p-2">
              <div
                className="table-responsive"
                style={{ minHeight: "130px", maxHeight: "70vh", overflowY: "auto" }}
              >
                {loadingSearch ? (
                  <Loading />
                ) : searched && tableData.length > 0 ? (
                  <Tables className="table table-sm mb-0 p-2">
                    <thead>
                      <tr>
                        <th>{t("#")}</th>
                        <th>{t("Business Unit")}</th>
                        <th>{t("Sales Manager")}</th>
                        <th>{t("Rate Type Code")}</th>
                        <th>{t("Rate Type Name")}</th>
                        <th>{t("Days Sales OS")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableData.map((row, idx) => (
                        <tr key={`${row.businessUnitID || row.BusinessUnitID || idx}-${row.rateTypeCode || row.RateTypeCode || idx}`}>
                          <td data-title={t("#")}>{idx + 1}</td>
                          <td data-title={t("Business Unit")}>{row.businessUnit || row.BusinessUnit}</td>
                          <td data-title={t("Sales Manager")}>{row.salesManager || row.SalesManager}</td>
                          <td data-title={t("Rate Type Code")}>{row.rateTypeCode || row.RateTypeCode}</td>
                          <td data-title={t("Rate Type Name")}>{row.rateTypeName || row.RateTypeName}</td>
                          <td data-title={t("Days Sales OS")}>
                            {Math.floor(row.daysSalesOutstanding ?? row.DaysSalesOutstanding ?? 0)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Tables>
                ) : (
                  <NoRecordFound />
                )}
              </div>
            </div>
          </div>
        </div>
      </Accordion>
    </>
  );
};

export default DailyOsReport;
