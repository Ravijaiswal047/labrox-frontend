import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { axiosReport, axiosInstance } from "../../utils/axiosInstance";
import Accordion from "../../components/UI/Accordion";
import MultiSelectComp from "../../components/formComponent/MultiSelectComp";
import DatePicker from "../../components/formComponent/DatePicker";
import { CustomButton } from "../../components/UI/CustomButton";
import { downloadExcelBlob, formatStandardDate } from "../../utils/helpers";

const NumericChangeLogReport = () => {
  const { t } = useTranslation();
  const [processingLabData, setProcessingLabData] = useState([]);
  const [testCentreData, setTestCentreData] = useState([]);
  const [DepartmentData, setDepartmentData] = useState([]);
  const [InvestigationData, setInvestigationData] = useState([]);
  const [loadingFormat, setLoadingFormat] = useState(null);

  const [formData, setFormData] = useState({
    Centre: [],
    TestCentre: [],
    Department: [],
    Investigation: [],
    FromDate: new Date(),
    ToDate: new Date(),
  });

  const mapProcessingLabOptions = (res) => {
    if (!Array.isArray(res?.data?.message)) return [];
    return res.data.message.map((ele) => ({
      value: ele.ProcessingLabID,
      label: ele.ProcessingLab,
    }));
  };

  const getProcessingLabOptions = () => {
    axiosInstance
      .get("Centre/CentreProcessingLab")
      .then((res) => {
        const options = mapProcessingLabOptions(res);
        setProcessingLabData(options);
        setTestCentreData(options);
      })
      .catch((err) => console.log(err));
  };

  const getDepartmentReports = () => {
    axiosInstance
      .get("Department/getDepartment")
      .then((res) => {
        const data = res.data.message || [];
        setDepartmentData(
          data.map((ele) => ({
            value: ele.DepartmentID,
            label: ele.Department,
          })),
        );
      })
      .catch((err) => console.log(err));
  };

  const getInvestigationList = () => {
    axiosInstance
      .get("Investigations/BindInvestigationList")
      .then((res) => {
        const data = res.data.message || [];
        setInvestigationData(
          data.map((ele) => ({
            value: ele.InvestigationID,
            label: ele.TestName,
          })),
        );
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    getProcessingLabOptions();
    getDepartmentReports();
    getInvestigationList();
  }, []);

  const handleSelectMultiChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const dateSelect = (date, name) => {
    setFormData((prev) => ({ ...prev, [name]: date }));
  };

  const normalizeIds = (list) =>
    (list || [])
      .map((item) => (typeof item === "object" ? item.value : item))
      .filter((id) => id !== "" && id !== null && id !== undefined)
      .map((id) => Number(id));

  const handleReport = async (format) => {
    const centreIds = normalizeIds(formData.Centre);
    const testCentreIds = normalizeIds(formData.TestCentre);

    if (centreIds.length === 0 && testCentreIds.length === 0) {
      toast.error(t("Please select Processing Lab or Test Centre"));
      return;
    }

    setLoadingFormat(format);
    const payload = {
      fromDate: formatStandardDate(formData.FromDate, "YYYY-MM-DD"),
      toDate: formatStandardDate(formData.ToDate, "YYYY-MM-DD"),
      fromTime: "00:00:00",
      toTime: "23:59:59",
      centre: centreIds,
      testCentre: testCentreIds,
      departmentId: normalizeIds(formData.Department),
      investigationIds: normalizeIds(formData.Investigation),
      reportFormat: format,
    };

    try {
      const res = await axiosReport.post(
        "CombineLabReport/GetNumericChangeLogReport",
        payload,
        { responseType: "blob" },
      );

      const blob = res.data;
      const contentType = res.headers?.["content-type"] || "";
      const isJsonOrText =
        contentType.includes("application/json") ||
        contentType.includes("text/");

      if (isJsonOrText || blob.size === 0 || blob.size < 100) {
        try {
          const text = await blob.text();
          const json = JSON.parse(text);
          toast.error(
            json?.message ||
              json?.Message ||
              t("No records found for selected filters"),
          );
        } catch {
          toast.error(t("No records found for selected filters"));
        }
        return;
      }

      if (format === "Pdf") {
        const pdfBlob = new Blob([blob], { type: "application/pdf" });
        const url = window.URL.createObjectURL(pdfBlob);
        const newTab = window.open(url, "_blank");
        if (!newTab) {
          toast.warning(t("Popup blocked! Please allow popups and try again."));
        } else {
          toast.success(t("PDF opened successfully"));
        }
        setTimeout(() => window.URL.revokeObjectURL(url), 5000);
      } else {
        const disposition = res.headers?.["content-disposition"] || "";
        const serverName = disposition
          .match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)?.[1]
          ?.replace(/['"]/g, "")
          ?.replace(/\.xlsx$/i, "")
          ?.trim();
        downloadExcelBlob(
          blob,
          serverName ||
            `NumericChangeLogReport_${new Date()
              .toISOString()
              .replace(/[-:TZ.]/g, "")
              .slice(0, 14)}`,
        );
        toast.success(t("Excel downloaded successfully"));
      }
    } catch (err) {
      if (err?.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          const json = JSON.parse(text);
          toast.error(json?.message || t(`Error generating ${format} report`));
        } catch {
          toast.error(t(`Error generating ${format} report`));
        }
      } else {
        toast.error(
          err?.response?.data?.message ||
            err?.message ||
            t(`Error generating ${format} report`),
        );
      }
    } finally {
      setLoadingFormat(null);
    }
  };

  return (
    <>
      <Accordion title={t("Result Amendment")} defaultValue={true}>
        <div className="row px-2 mt-2 p-1">
          <div className="col-12 col-sm-6 col-md-2 my-1">
            <MultiSelectComp
              options={processingLabData}
              value={formData.Centre}
              name="Centre"
              onChange={handleSelectMultiChange}
              label={t("Processing Lab")}
            />
          </div>

          <div className="col-12 col-sm-6 col-md-2 my-1">
            <MultiSelectComp
              options={testCentreData}
              value={formData.TestCentre}
              name="TestCentre"
              onChange={handleSelectMultiChange}
              label={t("Test Centre")}
            />
          </div>

          <div className="col-12 col-sm-6 col-md-2 my-1">
            <MultiSelectComp
              options={DepartmentData}
              value={formData.Department}
              name="Department"
              onChange={handleSelectMultiChange}
              label={t("Department")}
            />
          </div>

          <div className="col-12 col-sm-6 col-md-2 my-1">
            <MultiSelectComp
              options={InvestigationData}
              value={formData.Investigation}
              name="Investigation"
              onChange={handleSelectMultiChange}
              label={t("Investigation")}
            />
          </div>

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
            <CustomButton
              className="mr-2"
              text={t("Pdf")}
              onClick={() => handleReport("Pdf")}
              loading={loadingFormat === "Pdf"}
              icon={"pdf"}
            />
            <CustomButton
              text={t("Excel")}
              onClick={() => handleReport("Excel")}
              loading={loadingFormat === "Excel"}
              icon={"excel"}
            />
          </div>
        </div>
      </Accordion>
    </>
  );
};

export default NumericChangeLogReport;
