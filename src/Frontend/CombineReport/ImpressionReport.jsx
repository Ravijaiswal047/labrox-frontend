import React, { useState, useEffect } from "react";
import Accordion from "../../components/UI/Accordion";
import DatePicker from "../../components/formComponent/DatePicker";
import MultiSelectComp from "../../components/formComponent/MultiSelectComp";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { CustomButton } from "../../components/UI/CustomButton";
import { useTranslation } from "react-i18next";
import Tooltip from "../../components/formComponent/Tooltip";
import { axiosInstance, axiosReport } from "../../utils/axiosInstance";
import { formatStandardDate } from "../../utils/helpers";
import { toast } from "react-toastify";

const RadioInput = ({ label, name, id, checked, onChange }) => (
  <div className="form-check">
    <input
      className="form-check-input"
      type="radio"
      name={name}
      id={id}
      checked={checked}
      onChange={onChange}
    />
    <label className="form-check-label" htmlFor={id}>
      {label}
    </label>
  </div>
);

const ImpressionReport = () => {
  const { t } = useTranslation();
  const [centre, setCentre] = useState([]);
  const [impressionData, setImpressionData] = useState([]);
  const [showCentreDropdown, setShowCentreDropdown] = useState(false);
  const [loadingExcel, setLoadingExcel] = useState(false);

  const [formData, setFormData] = useState({
    FromDate: new Date(),
    ToDate: new Date(),
    CentreId: [],
    ImpressionID: null,
    IsActiveCentre: 1,
  });

  // ─── Fetch Centres ────────────────────────────────────────────────
  const getAccessCentres = async () => {
    try {
      const res = await axiosInstance.get(
        `Centre/GetAllAccessCentres?IsActive=${formData.IsActiveCentre}`,
      );
      const data = res.data.message;
      if (res.data?.success && Array.isArray(data)) {
        setCentre(data.map((ele) => ({ value: ele.CentreID, label: ele.Centre })));
        setFormData((prev) => ({ ...prev, CentreId: [] }));
      } else {
        toast.error(res.data?.message || "Failed to fetch centres");
        setCentre([]);
      }
    } catch (error) {
      console.log("Error while fetching centres", error);
    }
  };

  // ─── Fetch Impressions ────────────────────────────────────────────
  const getImpressionList = async () => {
    try {
      const res = await axiosInstance.get("commonReports/GetImpression");
      console.log("Impression API response:", res.data);
      const data = res.data?.message ?? res.data;
      if (Array.isArray(data)) {
        setImpressionData(
          data.map((ele) => ({
            value: ele.ImpressionID ?? ele.impressionID,
            label: ele.Impression ?? ele.impression ?? ele.Name ?? ele.name,
          })),
        );
      }
    } catch (err) {
      console.log("Error while fetching impressions", err);
    }
  };

  useEffect(() => { getAccessCentres(); }, [formData.IsActiveCentre]);
  useEffect(() => { getImpressionList(); }, []);

  // ─── Handlers ─────────────────────────────────────────────────────
  const handleMultiSelectChange = (name, value) =>
    setFormData((prev) => ({ ...prev, [name]: value }));

  const handleReactSelectChange = (name, e) =>
    setFormData((prev) => ({ ...prev, [name]: e?.value ?? null }));

  const dateSelect = (date, name) =>
    setFormData((prev) => ({ ...prev, [name]: date }));

  const handleRadioChange = (name, value) =>
    setFormData((prev) => ({ ...prev, [name]: value }));

  // ─── Handle Excel ─────────────────────────────────────────────────
  const handleExcel = () => {
    setLoadingExcel(true);

    const payload = {
      fromDate: formatStandardDate(formData.FromDate, "YYYY-MM-DD"),
      toDate: formatStandardDate(formData.ToDate, "YYYY-MM-DD"),
      centreID: formData.CentreId,
      impressionID: Number(formData.ImpressionID) || 0,
    };

    axiosReport
      .post("commonReports/ImpressionReport", payload, { responseType: "blob" })
      .then(async (res) => {
        const blob = new Blob([res.data]);

        if (blob.size < 500) {
          const text = await blob.text();
          try {
            const json = JSON.parse(text);
            toast.error(json?.message || t("No data found"));
          } catch {
            toast.warning(t("No records found for selected filters"));
          }
          return;
        }

        const typedBlob = new Blob([res.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = window.URL.createObjectURL(typedBlob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `ImpressionReport_${new Date().toISOString().slice(0, 10)}.xlsx`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => window.URL.revokeObjectURL(url), 5000);
        toast.success(t("Excel downloaded successfully"));
      })
      .catch(async (err) => {
        console.error(err);
        if (err?.response?.data instanceof Blob) {
          try {
            const text = await err.response.data.text();
            const json = JSON.parse(text);
            toast.error(json?.message || t("Error generating report"));
          } catch {
            toast.error(t("Error generating report"));
          }
        } else {
          toast.error(t("Error generating report"));
        }
      })
      .finally(() => setLoadingExcel(false));
  };

  // ─── UI ───────────────────────────────────────────────────────────
  return (
    <>
      <Accordion title={t("Impression Report")} defaultValue={true}>
        <div className="row px-2 mt-2">
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

          <div className="col-12 col-sm-6 col-md-2 my-1">
            <div className="d-flex" style={{ gap: "5px" }}>
              <div style={{ width: "90%" }}>
                <MultiSelectComp
                  label="All Centre"
                  options={centre}
                  value={formData.CentreId}
                  name="CentreId"
                  id="CentreId"
                  onChange={handleMultiSelectChange}
                  lable={t("Select Centre")}
                />
              </div>
              <div style={{ width: "10%", position: "relative" }}>
                <Tooltip label={t("Status")} position="top">
                  <button
                    type="button"
                    className="btn btn-sm btn-primary"
                    onClick={() => setShowCentreDropdown((prev) => !prev)}
                  >
                    <i className="fa fa-plus-circle fa-sm"></i>
                  </button>
                </Tooltip>
                {showCentreDropdown && (
                  <div
                    className="dropdown-menu show p-2"
                    style={{ position: "absolute", top: "100%", left: "0", zIndex: 1000, minWidth: "120px", boxShadow: "0 2px 5px rgba(0,0,0,0.2)", borderRadius: "5px" }}
                  >
                    <RadioInput label={t("Both")} name="IsActiveCentre" id="IsActiveCentreBoth" checked={formData.IsActiveCentre === 2} onChange={() => handleRadioChange("IsActiveCentre", 2)} />
                    <RadioInput label={t("Active")} name="IsActiveCentre" id="IsActiveCentreActive" checked={formData.IsActiveCentre === 1} onChange={() => handleRadioChange("IsActiveCentre", 1)} />
                    <RadioInput label={t("Inactive")} name="IsActiveCentre" id="IsActiveCentreInactive" checked={formData.IsActiveCentre === 0} onChange={() => handleRadioChange("IsActiveCentre", 0)} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Impression Dropdown ── */}
          <div className="col-12 col-sm-6 col-md-2 my-1">
            <ReactSelect
              dynamicOptions={impressionData}
              value={formData.ImpressionID}
              name="ImpressionID"
              onChange={handleReactSelectChange}
              id="ImpressionID"
              placeholderName={"Select Impression"}
              label={t("Impression")}
            />
          </div>

          <div className="col-12 col-sm-6 col-md-2 my-1">
            <CustomButton
              text={t("Excel")}
              onClick={handleExcel}
              loading={loadingExcel}
              icon={"excel"}
            />
          </div>
        </div>
      </Accordion>
    </>
  );
};

export default ImpressionReport;