import React, { useState, useEffect, useMemo } from "react";
import Accordion from "../../components/UI/Accordion";
import DatePicker from "../../components/formComponent/DatePicker";
import ReactSelect from "../../components/formComponent/ReactSelect";
import MultiSelectComp from "../../components/formComponent/MultiSelectComp";
import { CustomButton } from "../../components/UI/CustomButton";
import { useTranslation } from "react-i18next";
import { axiosInstance, axiosReport } from "../../utils/axiosInstance";
import { formatStandardDate } from "../../utils/helpers";
import { toast } from "react-toastify";
import moment from "moment"
import { getReportDownloadName, downloadReportBlob, saveAndPreviewPdf } from "./reportDownload";

const ModeWiseReport = () => {
  const { t } = useTranslation();

  // ─── Dropdown Data ───────────────────────────────────────────────
  const [Dropdown, setDropdown] = useState({
    testCentre: [],
    centreData: [],
  });
  console.log("Dropdown", Dropdown);
  const [centreData, setCentreData] = useState([]);
  const [machineData, setMachineData] = useState([]);
  const [parameterData, setParameterData] = useState([]);
  const [parameterSearch, setParameterSearch] = useState("");

  // ─── Loading States ───────────────────────────────────────────────
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingExcel, setLoadingExcel] = useState(false);
  

  // ─── Form ─────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    FromDate: new Date(),
    ToDate: new Date(),
    ReportType: null,
    CentreId: [],
  });

  // ─── Filtered Parameters (max 50 by default, 100 on search) ──────
  const filteredParameters = useMemo(() => {
    if (!parameterSearch.trim()) return parameterData.slice(0, 50);
    return parameterData
      .filter((p) =>
        p.label.toLowerCase().includes(parameterSearch.toLowerCase()),
      )
      .slice(0, 100);
  }, [parameterData, parameterSearch]);

  // ─── Fetch Centres ────────────────────────────────────────────────
  const getAccessCentres = async () => {
    try {
      const res = await axiosInstance.get(
        "Centre/GetAllAccessCentres?IsActive=1",
      );
      if (res.data?.success && Array.isArray(res.data.message)) {
        const option = res.data.message.map((c) => ({
          value: c.CentreID,
          label: c.Centre,
        }));

        setDropdown((prev) => ({
          ...prev,
          centreData: option,
        }));
      }
    } catch (err) {
      console.error("Error fetching centres", err);
    }
  };

  // ─── Fetch Test Centres ───────────────────────────────────────────
  const getTestCentres = async () => {
    try {
      const res = await axiosInstance.get("centre/getCentreType");
      if (res.data?.message) {
        const option = res.data.message.map((d) => ({
          value: d.id,
          label: d.Centretype,
        }));

        setDropdown((prev) => ({
          ...prev,
          testCentreData: option,
        }));
      }
    } catch (err) {
      console.error("Error fetching test centres", err);
    }
  };


  // ─── Fetch Parameters (Investigations) ───────────────────────────
  const getParameters = async () => {
    try {
      const res = await axiosInstance.get(
        "Investigations/BindInvestigationList",
      );
      if (res.data?.message) {
        setParameterData(
          res.data.message.map((e) => ({
            value: e.InvestigationID,
            label: e.TestName,
          })),
        );
      }
    } catch (err) {
      console.error("Error fetching parameters", err);
    }
  };

  useEffect(() => {
    getAccessCentres();
    getTestCentres();
  }, []);

  // ─── Handlers ─────────────────────────────────────────────────────
  const dateSelect = (date, name) => {
    setFormData((prev) => ({ ...prev, [name]: date }));
  };

  const handleReactSelectChange = (name, e) => {
    setFormData((prev) => ({ ...prev, [name]: e?.value ?? null }));
  };

  const handleMultiChange = (name, selected) => {
    setFormData((prev) => ({ ...prev, [name]: selected || [] }));
  };
  
const handleDownLoadPDF = async () => {
   if(formData.CentreId.length === 0){
              toast.warning("Please select at least one centre");
              return;
          }
  setLoadingSearch(true);
  const Payload = {
    fromDate: moment(formData.FromDate).format("YYYY-MM-DD"),
    toDate: moment(formData.ToDate).format("YYYY-MM-DD"),
    reportFormat: "Pdf",
    centerID: formData.CentreId.map((c) => c.value ?? c),
  };

  try {
    const res = await axiosReport.post(
      "ModeWiseCollectionReport/GetModeWiseCollection",
      Payload,
      { responseType: "blob" }
    );

    const blob = res.data;
    const contentType = res.headers["content-type"];
    //  Check JSON response (No Data)
    if (contentType.includes("application/json")) {
      const text = await blob.text();

      const json = JSON.parse(text);

      if (!json.success) {
        toast.warning(json.message || "No records found");
        return;
      }
    }

    if (blob.size === 0) {
      toast.warning("No records found");
      return;
    }

    const fileName = getReportDownloadName(res, "ModeWiseCollectionReport.pdf");
    saveAndPreviewPdf(blob, fileName);

    toast.success("PDF opened successfully");

  } catch (err) {
    if (err?.response?.data instanceof Blob) {
      const text = await err.response.data.text();
      try {
        const json = JSON.parse(text);
        toast.error(json?.message || "Something went wrong");
      } catch {
        toast.error("Something went wrong");
      }
    } else {
      toast.error(err?.response?.data?.message || "Something went wrong");
    }
  } finally {
    setLoadingSearch(false);
  }
};
  
const downloadExcel = async () => {
   if(formData.CentreId.length === 0){
              toast.warning("Please select at least one centre");
              return;
          }
  setLoadingExcel(true);

  const Payload = {
    fromDate: moment(formData.FromDate).format("YYYY-MM-DD"),
    toDate: moment(formData.ToDate).format("YYYY-MM-DD"),
    reportFormat: "Excel",
    centerID: formData.CentreId.map((c) => c.value ?? c),
  };

  try {
    const res = await axiosReport.post(
      "ModeWiseCollectionReport/GetModeWiseCollection",
      Payload,
      { responseType: "blob" }
    );

    const blob = new Blob([res.data]);
    const contentType = res.headers["content-type"];

    //  Check if API returned JSON (No data case)
    if (
      contentType?.includes("application/json") ||
      contentType?.includes("text/plain")
    ) {
      const text = await blob.text();

      try {
        const json = JSON.parse(text);
        if (!json?.success) {
          toast.warning(json?.message || "No records found");
          return;
        }
      } catch {
        toast.warning("No records found");
        return;
      }
    }

    // Check empty file
    if (blob.size === 0) {
      toast.warning("No records found");
      return;
    }

    const fileName = getReportDownloadName(res, "ModeWiseCollectionReport.xlsx");
    downloadReportBlob(blob, fileName);

    toast.success("Excel downloaded successfully");
  } catch (err) {
    if (err?.response?.data instanceof Blob) {
      const text = await err.response.data.text();
      try {
        const json = JSON.parse(text);
        toast.error(json?.message || "Something went wrong");
      } catch {
        toast.error("Something went wrong");
      }
    } else {
      toast.error(err?.response?.data?.message || "Something went wrong");
    }
  } finally {
    setLoadingExcel(false);
  }
};

  // ─── Render ───────────────────────────────────────────────────────
  return (
    <>
      <Accordion title={t("Mode Wise Collection Report")} defaultValue={true}>
        <div className="row px-2 mt-2 p-1">
          {/* From Date */}
          <div className="col-12 col-sm-6 col-md-2 my-1">
            <DatePicker
              name="FromDate"
              value={formData.FromDate}
              onChange={dateSelect}
              maxDate={new Date()}
              lable={t("From Date")}
              className="custom-calendar"
            />
          </div>

          {/* To Date */}
          <div className="col-12 col-sm-6 col-md-2 my-1">
            <DatePicker
              name="ToDate"
              value={formData.ToDate}
              onChange={dateSelect}
              maxDate={new Date()}
              minDate={formData.FromDate}
              lable={t("To Date")}
               className="custom-calendar"
              
            />
          </div>

          {/* Centre */}
          <div className="col-12 col-sm-6 col-md-2 my-1">
            <MultiSelectComp
              options={Dropdown?.centreData}
              value={formData.CentreId}
              name="CentreId"
              onChange={handleMultiChange}
              label={t("Centre")}
            />
          </div>

          {/* Buttons */}
          <div className="col-12 col-sm-6 col-md-2 my-1 d-flex">
            <CustomButton
              className="mr-4"
              text={t("Pdf")}
              onClick={() => handleDownLoadPDF("Pdf")}
              loading={loadingSearch}
              icon={"pdf"}
            />
            <CustomButton
              text={t("Excel")}
              onClick={() => downloadExcel("Excel")}
              loading={loadingExcel}
              icon={"excel"}
            />
          </div>
        </div>
      </Accordion>
    </>
  );
};

export default ModeWiseReport;