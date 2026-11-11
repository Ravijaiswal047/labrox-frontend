import React, { useEffect, useMemo, useState } from "react";
import moment from "moment";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import Accordion from "@app/components/UI/Accordion";
import DatePicker from "../../components/formComponent/DatePicker";
import MultiSelectComp from "../../components/formComponent/MultiSelectComp";
import Tables from "../../components/UI/customTable";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import { CustomButton, SearchButton } from "../../components/UI/CustomButton";
import { axiosInstance, axiosReport } from "../../utils/axiosInstance";
import { formatStandardDate, downloadExcelBlob, openPdfBlob } from "../../utils/helpers";
import { getAccessDataRateReport } from "../../utils/NetworkApi/commonApi";

const formatAmount = (value) =>
  Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const getDefaultFromDate = () =>
  moment().subtract(2, "months").startOf("month").toDate();

const getMaxToDate = (fromDate) => {
  const rangeEnd = moment(fromDate).add(11, "months").endOf("month");
  const today = moment().endOf("day");
  return (rangeEnd.isAfter(today) ? today : rangeEnd).toDate();
};

const MonthlyInvoiceReport = () => {
  const { t } = useTranslation();

  const [searchData, setSearchData] = useState({
    CentreId: [],
    RateTypeId: [],
    FromDate: getDefaultFromDate(),
    ToDate: new Date(),
  });
  const [centres, setCentres] = useState([]);
  const [rateTypes, setRateTypes] = useState([]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState({ search: false, pdf: false, excel: false });

  const maxToDate = useMemo(
    () => getMaxToDate(searchData.FromDate),
    [searchData.FromDate]
  );

  useEffect(() => {
    axiosInstance
      .get("Centre/getAccessCentres")
      .then((res) => {
        const data = res?.data?.message || [];
        setCentres(
          data.map((ele) => ({
            value: ele.CentreID,
            label: ele.Centre,
          }))
        );
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || t("Failed to load centres"));
      });
  }, [t]);

  useEffect(() => {
    getAccessDataRateReport(setRateTypes, searchData.CentreId).catch(() => {
      setRateTypes([]);
    });
  }, [searchData.CentreId]);

  const dateSelect = (value, name) => {
    if (name === "FromDate") {
      const maxTo = getMaxToDate(value);
      const nextTo =
        moment(searchData.ToDate).isBefore(value) ||
        moment(searchData.ToDate).isAfter(maxTo)
          ? maxTo
          : searchData.ToDate;
      setSearchData((prev) => ({
        ...prev,
        FromDate: value,
        ToDate: nextTo,
      }));
      return;
    }
    setSearchData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectMultiChange = (name, value) => {
    setSearchData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "CentreId" ? { RateTypeId: [] } : {}),
    }));
  };

  const validateDates = () => {
    if (!searchData.FromDate || !searchData.ToDate) {
      toast.error(t("Please select From Date and To Date"));
      return false;
    }
    if (moment(searchData.ToDate).isBefore(searchData.FromDate, "day")) {
      toast.error(t("To Date cannot be earlier than From Date"));
      return false;
    }
    const months =
      moment(searchData.ToDate).startOf("month").diff(
        moment(searchData.FromDate).startOf("month"),
        "months"
      ) + 1;
    if (months > 12) {
      toast.error(t("Maximum date range is 1 year"));
      return false;
    }
    return true;
  };

  const buildPayload = (reportFormat) => ({
    fromDate: formatStandardDate(searchData.FromDate, "YYYY-MM-DD"),
    toDate: formatStandardDate(searchData.ToDate, "YYYY-MM-DD"),
    centreIds: searchData.CentreId?.length ? searchData.CentreId.join(",") : "",
    rateTypeIds: searchData.RateTypeId?.length ? searchData.RateTypeId.join(",") : "",
    reportFormat,
  });

  const parseBlobError = async (blob) => {
    try {
      const text = await blob.text();
      const json = JSON.parse(text);
      return json?.message || json?.Message || t("No data found");
    } catch {
      return t("Error generating report");
    }
  };

  const handleSearch = async () => {
    if (!validateDates()) return;
    setLoading((prev) => ({ ...prev, search: true }));
    try {
      const res = await axiosReport.post(
        "CombineInvoiceReport/MonthlyInvoiceReport",
        buildPayload("Json")
      );
      if (!res?.data?.success) {
        setReport(null);
        toast.error(res?.data?.message || t("No data found"));
        return;
      }
      setReport(res.data.message);
    } catch (err) {
      setReport(null);
      toast.error(err?.response?.data?.message || t("Error fetching report"));
    } finally {
      setLoading((prev) => ({ ...prev, search: false }));
    }
  };

  const handleExport = async (format) => {
    if (!validateDates()) return;
    const isExcel = format === "Excel";
    setLoading((prev) => ({ ...prev, [isExcel ? "excel" : "pdf"]: true }));
    try {
      const res = await axiosReport.post(
        "CombineInvoiceReport/MonthlyInvoiceReport",
        buildPayload(format),
        { responseType: "blob" }
      );

      const contentType = res?.headers?.["content-type"] || "";
      if (contentType.includes("application/json")) {
        toast.warning(await parseBlobError(res.data));
        return;
      }

      if (isExcel) {
        downloadExcelBlob(res.data, `MonthlyInvoiceReport_${moment().format("YYYYMMDDHHmmss")}`);
        toast.success(t("Excel File Downloaded"));
      } else {
        openPdfBlob(res.data, true);
      }
    } catch (err) {
      if (err?.response?.data instanceof Blob) {
        toast.error(await parseBlobError(err.response.data));
      } else {
        toast.error(err?.response?.data?.message || t("Error generating report"));
      }
    } finally {
      setLoading((prev) => ({ ...prev, [isExcel ? "excel" : "pdf"]: false }));
    }
  };

  const months = report?.months || [];
  const rows = report?.rows || [];
  const totals = report?.totals || [];

  return (
    <>
      <Accordion
        name={t("Monthly Invoice Report")}
        isBreadcrumb={true}
        defaultValue={true}
      >
        <div className="row px-2 mt-2 mb-1 align-items-end">
          <div className="col-sm-2">
            <MultiSelectComp
              options={centres}
              name="CentreId"
              placeholder=" "
              label={t("Centre")}
              id="CentreId"
              value={searchData.CentreId}
              onChange={handleSelectMultiChange}
            />
          </div>
          <div className="col-sm-2">
            <MultiSelectComp
              options={rateTypes}
              name="RateTypeId"
              placeholder=" "
              label={t("Rate Type")}
              id="RateTypeId"
              value={searchData.RateTypeId}
              onChange={handleSelectMultiChange}
            />
          </div>
          <div className="col-sm-2">
            <DatePicker
              className="custom-calendar"
              placeholder=" "
              id="FromDate"
              lable={t("From Date")}
              name="FromDate"
              value={searchData.FromDate ? new Date(searchData.FromDate) : null}
              maxDate={new Date()}
              onChange={dateSelect}
            />
          </div>
          <div className="col-sm-2">
            <DatePicker
              className="custom-calendar"
              placeholder=" "
              id="ToDate"
              lable={t("To Date")}
              name="ToDate"
              value={searchData.ToDate ? new Date(searchData.ToDate) : null}
              minDate={searchData.FromDate ? new Date(searchData.FromDate) : null}
              maxDate={maxToDate}
              onChange={dateSelect}
            />
          </div>
          <div className="col-sm-auto d-flex gap-2 mb-1">
            <SearchButton
              text={t("Search")}
              onClick={handleSearch}
              loading={loading.search}
              disabled={loading.search || loading.pdf || loading.excel}
            />
            <CustomButton
              text={t("PDF")}
              icon="pdf"
              onClick={() => handleExport("Pdf")}
              loading={loading.pdf}
              disabled={loading.search || loading.pdf || loading.excel}
            />
            <CustomButton
              text={t("Excel")}
              icon="excel"
              onClick={() => handleExport("Excel")}
              loading={loading.excel}
              disabled={loading.search || loading.pdf || loading.excel}
            />
          </div>
        </div>
      </Accordion>

      {rows.length > 0 ? (
        <Accordion title={t("Search Result")} defaultValue={true}>
          <div className="p-2 table-responsive">
            <Tables>
              <thead>
                <tr>
                  <th rowSpan={2}>{t("RateType Code")}</th>
                  <th rowSpan={2}>{t("RateType")}</th>
                  {months.map((month) => (
                    <th key={month.key || month.label} colSpan={3} className="text-center">
                      {month.label}
                    </th>
                  ))}
                </tr>
                <tr>
                  {months.map((month) => (
                    <React.Fragment key={`${month.key || month.label}-sub`}>
                      <th className="text-center">{t("Net Amount")}</th>
                      <th className="text-center" title={t("Includes TDS, Deposit and Adjustment")}>
                        {t("Deposit")}
                      </th>
                      <th className="text-center">{t("CN")}</th>
                    </React.Fragment>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr key={`${row.rateTypeID || row.rateTypeCode}-${idx}`}>
                    <td>{row.rateTypeCode}</td>
                    <td>{row.rateType}</td>
                    {(row.values || []).map((val, i) => (
                      <React.Fragment key={`${row.rateTypeCode}-${i}`}>
                        <td className="text-end">{formatAmount(val.netAmount)}</td>
                        <td className="text-end">{formatAmount(val.deposit)}</td>
                        <td className="text-end">{formatAmount(val.cn)}</td>
                      </React.Fragment>
                    ))}
                  </tr>
                ))}
                <tr className="fw-bold">
                  <td colSpan={2}>{t("Total")}</td>
                  {totals.map((val, i) => (
                    <React.Fragment key={`total-${i}`}>
                      <td className="text-end">{formatAmount(val.netAmount)}</td>
                      <td className="text-end">{formatAmount(val.deposit)}</td>
                      <td className="text-end">{formatAmount(val.cn)}</td>
                    </React.Fragment>
                  ))}
                </tr>
              </tbody>
            </Tables>
          </div>
        </Accordion>
      ) : (
        report !== null && <NoRecordFound />
      )}
    </>
  );
};

export default MonthlyInvoiceReport;
