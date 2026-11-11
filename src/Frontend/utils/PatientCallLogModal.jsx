import { Dialog } from "primereact/dialog";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { axiosInstance } from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import moment from "moment";
import Loading from "../../components/loader/Loading";
import Tables from "../../components/UI/customTable";
import TextAreaInput from "../../components/formComponent/TextAreaInput";
import TimePicker from "../../components/formComponent/TimePicker";
import Input from "../../components/formComponent/Input";
import { SelectBox } from "../../components/formComponent/SelectBox";
import DatePicker from "../../components/formComponent/DatePicker";
import ReactSelect from "../../components/formComponent/ReactSelect";
import Accordion from "../../components/UI/Accordion";

const PatientCallLogModal = ({ show, onHide, rowData }) => {
  const { t } = useTranslation();
  const theme = useLocalStorage("theme", "get");
  const userData = useLocalStorage("userData", "get");
  const isMobile = window.innerWidth <= 768;

  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [observationOptions, setObservationOptions] = useState([]);

  const [formData, setFormData] = useState({
    ObservationID: "",
    ObservationName: "",
    InformTo: "",
    InformBy: userData?.Name || "",
    InformDate: new Date(),
    InformTime: moment().format("HH:mm:ss"),
    CallDuration: "",
    CallType: "Critical Call",
    About: "",
  });

  const callTypeOptions = [
    { label: "Critical Call", value: "Critical Call" },
    { label: "Delay", value: "Delay" },
    { label: "Repeat", value: "Repeat" },
    { label: "other", value: "other" },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, e) => {
    const value = e?.value ?? null;
    if (name === "ObservationID") {
      const selectedObs = observationOptions.find((opt) => opt.value === value);
      setFormData((prev) => ({
        ...prev,
        ObservationID: value,
        ObservationName: selectedObs?.label || "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleDateChange = (date, name) => {
    setFormData((prev) => ({ ...prev, [name]: date }));
  };

  const handleTimeChange = (time, name) => {
    setFormData((prev) => ({ ...prev, [name]: time }));
  };

  const fetchCallLogs = () => {
    if (!rowData?.VisitNo) return;
    setLoading(true);
    axiosInstance
      .post("RE/GetCallLogs", (rowData?.TestID !== null && rowData?.TestID !== undefined) ? String(rowData.TestID).split(",").filter(Boolean).map(Number) : [])
      .then((res) => {
        setTableData(Array.isArray(res?.data?.message) ? res?.data?.message : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  const fetchObservations = () => {
    console.log("Call Log RowData:", rowData);
    if (!rowData?.TestID) return;
    axiosInstance
      .post("RE/GetCriticalObservation", {
        TestID: (rowData?.TestID !== null && rowData?.TestID !== undefined) ? String(rowData.TestID).split(",").filter(Boolean).map(Number) : [],
        labObservationId: rowData?.labObservationID
      })
      .then((res) => {
        const data = res?.data?.message || [];
        const options = data.map((item) => ({
          label: item.DATA,
          value: item.DATA,
        }));
        setObservationOptions(options);
        if (options.length > 0) {
          setFormData(prev => ({
            ...prev,
            ObservationID: options[0].value,
            ObservationName: options[0].label,
          }));
        }
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    if (show && rowData) {
      fetchCallLogs();
      fetchObservations();
    }
  }, [show, rowData]);

  const handleSave = () => {
    if (!formData.ObservationID) {
      toast.error("Please select an observation");
      return;
    }
    setLoading(true);
    const payload = {
      LabNo: rowData?.VisitNo,
      TestID: Number(String(rowData?.TestID).split(",")[0]) || 0,
      InvestigationID: rowData?.InvestigationID || 0,
      LabObservationID: 0,
      LabObservationName: "null",
      CallDate: moment(formData.InformDate).format("YYYY-MM-DD"),
      CallTime: formData.InformTime,
      CallDuration: String(formData.CallDuration),
      CallType: formData.CallType,
      InformedBy: formData.InformBy,
      InformedTo: formData.InformTo,
      About: formData.About,
    };

    axiosInstance
      .post("RE/SaveCallLog", payload)
      .then((res) => {
        if (res?.data?.success) {
          toast.success(res?.data?.message || "Call Log Saved Successfully");
          fetchCallLogs();
          // Reset form except InformBy
          setFormData({
            ObservationID: observationOptions[0]?.value || "",
            ObservationName: observationOptions[0]?.label || "",
            InformTo: "",
            InformBy: userData?.Name || "",
            InformDate: new Date(),
            InformTime: moment().format("HH:mm:ss"),
            CallDuration: "",
            CallType: "Critical Call",
            About: "",
          });
        } else {
          toast.error(res?.data?.message || "Failed to save call log");
        }
        setLoading(false);
      })
      .catch((err) => {
        toast.error("Something went wrong");
        setLoading(false);
      });
  };

  return (
    <Dialog
      header={t("Patient Call Log")}
      visible={show}
      onHide={onHide}
      className={theme}
      style={{ width: isMobile ? "95vw" : "70vw" }}
      modal
    >
      <Accordion
        title={t("Result Entry Call Log Details")}
        defaultValue={true}
      >
        <div className="row px-2">
          <div className="col-md-3 col-sm-6">
            <ReactSelect
              label={t("Observation")}
              name="ObservationID"
              dynamicOptions={observationOptions}
              value={formData.ObservationID}
              onChange={handleSelectChange}
              placeholder="Observation Data"
            />
          </div>
          <div className="col-md-3 col-sm-6">
            <Input
              lable={t("Inform To")}
              name="InformTo"
              value={formData.InformTo}
              onChange={handleInputChange}
              placeholder=" "
            />
          </div>
          <div className="col-md-3 col-sm-6">
            <Input
              lable={t("Inform By")}
              name="InformBy"
              value={formData.InformBy}
              onChange={handleInputChange}
              placeholder=" "
            />
          </div>
          <div className="col-md-3 col-sm-6">
            <DatePicker
              lable={t("Inform Date")}
              name="InformDate"
              value={formData.InformDate}
              onChange={handleDateChange}
              placeholder=" "
            />
          </div>
          <div className="col-md-3 col-sm-6">
            <TimePicker
              lable={t("Inform Time")}
              name="InformTime"
              value={formData.InformTime}
              onChange={handleTimeChange}
              placeholder=" "
            />
          </div>
          <div className="col-md-3 col-sm-6">
            <ReactSelect
              label={t("Call Type")}
              id="CallType"
              name="CallType"
              dynamicOptions={callTypeOptions}
              value={formData.CallType}
              onChange={handleSelectChange}
            />
          </div>
          <div className="col-md-3 col-sm-6">
            <Input
              lable={t("Call Duration in Min")}
              name="CallDuration"
              value={formData.CallDuration}
              onChange={handleInputChange}
              type="number"
              placeholder=" "
            />
          </div>
          <div className="col-md-6 col-sm-auto">
            <TextAreaInput
              lable={t("About")}
              name="About"
              value={formData.About}
              onChange={handleInputChange}
              rows="1"
              placeholder=" "
            />
          </div>


          <div className="col-12">
            {loading ? (
              <Loading />
            ) : (
              <>
                <button className="btn btn-primary btn-sm px-2 shadow-sm" onClick={handleSave}>
                  <i className="fa fa-save mr-1"></i> {t("Save Call Log")}
                </button>
              </>
            )}
          </div>
        </div>
      </Accordion>

      <div className="mt-4">
        <div style={{ maxHeight: "300px", overflowY: "auto" }}>
          <Tables>
            <thead>
              <tr>
                <th>{t("S.No")}</th>
                <th>{t("LabNo")}</th>
                <th>{t("CallDate")}</th>
                <th>{t("CallTime")}</th>
                <th>{t("CallDuration")}</th>
                <th>{t("CallType")}</th>
                <th>{t("Informed To")}</th>
                <th>{t("Informed By")}</th>
                <th>{t("About")}</th>
                <th>{t("CreatedBy")}</th>
              </tr>
            </thead>
            <tbody>
              {tableData.length > 0 ? (
                tableData?.map((item, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{item.LabNo}</td>
                    <td>{item.CallDate}</td>
                    <td>{item.CallTime}</td>
                    <td>{item.CallDuration}</td>
                    <td>{item.CallType}</td>
                    <td>{item.InformedTo}</td>
                    <td>{item.InformedBy}</td>
                    <td>
                      {item.About?.length > 30 ? (
                        <span title={item.About} style={{ cursor: "pointer" }}>
                          {item.About.substring(0, 30)}........
                        </span>
                      ) : (
                        item.About
                      )}
                    </td>
                    <td>{item.CreatedBy}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="13" className="text-center">
                    {t("No Records Found")}
                  </td>
                </tr>
              )}
            </tbody>
          </Tables>
        </div>
      </div>
    </Dialog>
  );
};

export default PatientCallLogModal;
