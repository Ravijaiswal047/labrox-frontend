import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import Accordion from "../../components/UI/Accordion";
import ReactSelect from "../../components/formComponent/ReactSelect";
import MultiSelectComp from "../../components/formComponent/MultiSelectComp";
import { CustomButton } from "../../components/UI/CustomButton";
import { axiosInstance, axiosReport } from "../../utils/axiosInstance";
import { getAccessCentresReports } from "../../utils/NetworkApi/commonApi";
import { Gender } from "../../utils/Constants";

const ReportTypeOptions = [
  { label: "Interpretation", value: "Interpretation" },
  { label: "Item Master", value: "ItemMaster" },
  { label: "Comment", value: "Comment" },
];

const REPORT_TYPE_URL = {
  Interpretation: "CompleteMappingReport/GetCompleteMappingReportInterpretation",
  ItemMaster: "CompleteMappingReport/GetCompleteMappingReportItemMaster",
  Comment: "CompleteMappingReport/GetCompleteMappingReportComment",
};

const CombineCompleteMappingReport = () => {
  const { t } = useTranslation();
  const [centreData, setCentreData] = useState([]);
  const [departmentData, setDepartmentData] = useState([]);
  const [machineGroupData, setMachineGroupData] = useState([]);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [loadingExcel, setLoadingExcel] = useState(false);

  const [formData, setFormData] = useState({
    CentreId: [],
    MachineId: [],
    DepartmentId: [],
    Gender: "",
    ReportType: "Interpretation",
  });

  const getDepartment = () => {
    axiosInstance
      .get("Department/getDepartment")
      .then((res) => {
        const data = res?.data?.message || [];
        setDepartmentData(
          data.map((ele) => ({ value: ele?.DepartmentID, label: ele?.Department }))
        );
      })
      .catch((err) => console.log(err));
  };

  const getMachineGroup = () => {
    axiosInstance
      .get("MachineGroup/BindMachineName")
      .then((res) => {
        const data = res?.data?.message || [];
        setMachineGroupData(
          data.map((ele) => ({ value: ele?.MachineId, label: ele?.MachineName }))
        );
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    getAccessCentresReports(setCentreData);
    getDepartment();
    getMachineGroup();
  }, []);

  const handleSelectChange = (name, option) => {
    setFormData((prev) => ({ ...prev, [name]: option?.value ?? "" }));
  };

  const handleMultiSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const showExcel = formData.ReportType === "ItemMaster";

  const handleDownload = async (format) => {
    const isExcel = format === "excel";
    isExcel ? setLoadingExcel(true) : setLoadingPdf(true);

    const url = REPORT_TYPE_URL[formData.ReportType];
    const apiPayload = {
      CentreId: formData.CentreId,
      MachineId: formData.MachineId,
      DepartmentId: formData.DepartmentId,
      Gender: formData.Gender,
      reportFormat: isExcel ? "Excel" : "pdf",
    };

    try {
      const res = await axiosReport.post(url, apiPayload, { responseType: "blob" });

      const contentType = res?.headers?.["content-type"] || "";
      if (contentType.includes("application/json")) {
        const text = await res.data.text();
        const json = JSON.parse(text);
        toast.warning(json?.message || "No records found.");
        return;
      }

      if (!res.data || res.data.size === 0) {
        toast.warning("No data available for the selected criteria.");
        return;
      }

      if (isExcel) {
        const fileUrl = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement("a");
        link.href = fileUrl;
        link.setAttribute("download", "CompleteMappingReport.xlsx");
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
      } else {
        const pdfUrl = window.URL.createObjectURL(
          new Blob([res.data], { type: "application/pdf" })
        );
        window.open(pdfUrl, "_blank");
      }
    } catch (err) {
      if (err?.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          const json = JSON.parse(text);
          toast.error(json?.message || "Something went wrong.");
        } catch {
          toast.error("Something went wrong while fetching the report.");
        }
      } else {
        toast.error(err?.response?.data?.message || "Something went wrong.");
      }
    } finally {
      isExcel ? setLoadingExcel(false) : setLoadingPdf(false);
    }
  };

  return (
    <Accordion name={t("Complete Mapping Report")} defaultValue={true} isBreadcrumb={true}>
      <div className="row px-2 mt-2 p-1 align-items-end">
        <div className="col-sm-2">
          <ReactSelect
            name="ReportType"
            id="ReportType"
            lable="Report Type"
            placeholderName={t("Report Type")}
            value={formData.ReportType}
            dynamicOptions={ReportTypeOptions}
            removeIsClearable={true}
            onChange={handleSelectChange}
          />
        </div>

        <div className="col-sm-2">
          <MultiSelectComp
            label="All Centre"
            options={centreData}
            value={formData.CentreId}
            name="CentreId"
            id="CentreId"
            onChange={handleMultiSelectChange}
            lable={t("Select Centre")}
          />
        </div>

        <div className="col-sm-2">
          <MultiSelectComp
            label="All Machine Group"
            options={machineGroupData}
            value={formData.MachineId}
            name="MachineId"
            id="MachineId"
            onChange={handleMultiSelectChange}
            lable={t("Select Machine Group")}
          />
        </div>

        <div className="col-sm-2">
          <MultiSelectComp
            label="All Department"
            options={departmentData}
            value={formData.DepartmentId}
            name="DepartmentId"
            id="DepartmentId"
            onChange={handleMultiSelectChange}
            lable={t("Select Department")}
          />
        </div>

        <div className="col-sm-2">
          <ReactSelect
            name="Gender"
            id="Gender"
            lable="Gender"
            placeholderName={t("Gender")}
            value={formData.Gender}
            dynamicOptions={Gender}
            onChange={handleSelectChange}
          />
        </div>

        <div className="col-sm-2 d-flex" style={{ gap: "8px" }}>
          <CustomButton
            text={loadingPdf ? t("Downloading...") : "PDF"}
            icon="pdf"
            onClick={() => handleDownload("pdf")}
            disabled={loadingPdf || loadingExcel}
          />
          {showExcel && (
            <CustomButton
              text={loadingExcel ? t("Downloading...") : "Excel"}
              icon="excel"
              onClick={() => handleDownload("excel")}
              disabled={loadingPdf || loadingExcel}
            />
          )}
        </div>
      </div>
    </Accordion>
  );
};

export default CombineCompleteMappingReport;
