import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Divider } from "primereact/divider";
import { useTranslation } from "react-i18next";
import { GetMedicalHistoryData } from "../../utils/NetworkApi/commonApi";
import { dateConfig } from "../../utils/helpers";
import { axiosInstance } from "../../utils/axiosInstance";
import { useLocalStorage } from "@app/utils/hooks/useLocalStorage";
import { toast } from "react-toastify";
import moment from "moment";
import Loading from "../../components/loader/Loading";
import ReactSelect from "../../components/formComponent/ReactSelect";

const MedicialModal = ({
  MedicalId,
  ID,
  handleUploadCount,
  handleClose,
  show,
  gwtConditions,
}) => {
  const { t } = useTranslation();
  const [payload, setPayload] = useState({
    MedicalHistory: "",
  });


  console.log("Ledger transition id", ID, MedicalId)

  const [history, setHistory] = useState("");
  const [load, setLoad] = useState(false);
  const [medicalData, setMedicalData] = useState([]);
  const [data, setData] = useState({
    PatientGuid: MedicalId,
    LedgerTransactionID: ID ? ID : 0,
    patientmedicalhistoryiesVM: [],
    ShowOnReport: 0
  });

  const theme = useLocalStorage("theme", "get");
  const isMobile = window.innerWidth <= 768;

  useEffect(() => {
    setData({ ...data, PatientGuid: MedicalId });
  }, [MedicalId]);

  useEffect(() => {
    GetMedicalHistoryData(MedicalId, setData, data, ID, handleUploadCount);
  }, []);

  useEffect(() => {
    if (show && gwtConditions && gwtConditions.length > 0) {
      setPayload({ MedicalHistory: 1 });
      setHistory(gwtConditions.join("\n"));
    }
  }, [show]);

  const handleChange = (e, index) => {
    const { name, value } = e.target;
    const val = [...data.patientmedicalhistoryiesVM];
    val[index][name] = value;
    setData({ ...data, patientmedicalhistoryiesVM: val });
  };

  const handleDelete = (index) => {
    const val = data.patientmedicalhistoryiesVM.filter(
      (ele, idx) => idx !== index,
    );
    setLoad(true);
    axiosInstance
      .post("PatientRegistration/Deletemedicalhistorydata", {
        PatientMedicalHistoryID:
          data.patientmedicalhistoryiesVM[index]?.PatientMedicalHistoryID,
      })
      .then((res) => {
        setLoad(false);
        GetMedicalHistoryData(MedicalId, setData, data, ID, handleUploadCount);
        toast.success(t("Successfully Deleted"));
      })
      .catch((err) => {
        setLoad(false);
        toast.error(err?.response?.data?.message);
      });
  };
  console.log("Data medical ",data);
  const handleUpload = (updatedData) => {
    if (history !== "") {
      axiosInstance
        .post("PatientRegistration/UploadMedicalHistory", updatedData)
        .then(() => {
          setHistory("");
          GetMedicalHistoryData(
            MedicalId,
            setData,
            updatedData,
            ID ? ID : 1,
            handleUploadCount,
          
          );
        })
        .catch((err) => {
          toast.error(err?.response?.data?.message || t("Error Occurred"));
        });
    } else {
      toast.error(t("Please Enter Value"));
    }
  };

  const handleAdd = () => {
    if (history !== "") {
      const updateDetails = {
        MedicalHistory: history,
        LedgerTransactionID: ID,
        PatientMedicalHistoryID: "",
        ShowOnReport: data?.ShowOnReport,
        date: moment(new Date())
          .utcOffset("+05:30")
          .format("YYYY-MM-DDTHH:mm:ss"),
      };
      const updatedData = { ...data, LedgerTransactionID: ID || 0 };
      updatedData.patientmedicalhistoryiesVM.push(updateDetails);
      setData(updatedData);
      handleUpload(updatedData);
    } else {
      toast.error(t("Please Select Any Value"));
    }
  };

  const handleSearch = () => {
    setLoad(true);
    const data = [{ Type: "MedicalHistory" }];
    if (data.length > 0) {
      axiosInstance
        .post("Global/getGlobalDataByFieldType", data)
        .then((res) => {
          if (res?.data?.success && Array.isArray(res?.data?.message)) {
            const selectedData = res?.data?.message
              ?.filter((item) => item?.IsActive === 1)
              ?.map((item) => ({
                label: item?.FieldDisplay,
                value: item?.FieldId,
              }));
            console.log({ selectedData });
            const updatedData = [
              ...selectedData,
              { label: "Others", value: 1 },
            ];
            setMedicalData(updatedData);
          } else {
            const updatedData = [{ label: "Others", value: 1 }];
            setMedicalData(updatedData);
            console?.log(res?.data?.message);
          }
          setLoad(false);
        })
        .catch((err) => {
          toast.error(
            err?.response?.data?.message
              ? err?.response?.data?.message
              : "Error Occured",
          );
          setLoad(false);
        });
    }
  };

  useEffect(() => {
    handleSearch();
  }, []);

  const handleSearchSelectChange = (label, value) => {
    console.log({ label, value });
    setPayload({ ...payload, [label]: value?.value });
    setHistory(value?.value != 1 ? value?.label : "");
  };

  const handleMainChange = (e) => {
    const { name, checked } = e.target;

    setData((prev) => ({
      ...prev,
      [name]: checked ? 1 : 0
    }));
  };
  return (
    <Dialog
      header={t("Medical History")}
      visible={show}
      onHide={handleClose}
      draggable={false}
      className={theme}
      //   footer={footerContent}
    >
      <Divider className={`custom-divider-header ${theme}`} />
      <div className="medical-modal">
        <div
          className="col-md-6 d-flex"
          style={{ flexDirection: "column", width: "40%" }}
        >
          <label htmlFor="medicalHistory">{t("New Medical History")}</label>
          <ReactSelect
            dynamicOptions={medicalData}
            name="MedicalHistory"
            lable={t("MedicalHistory")}
            id="MedicalHistory"
            removeIsClearable={true}
            placeholderName={t("MedicalHistory")}
            value={payload?.MedicalHistory}
            onChange={handleSearchSelectChange}
          />
          {payload?.MedicalHistory == 1 && (
            <textarea
              className="p-1"
              id="medicalHistory"
              rows="4"
              cols="50"
              placeholder={t("Enter medical history...")}
              style={{ height: "150px" }}
              value={history}
              name="MedicalHistory"
              max={200}
              onChange={(e) => setHistory(e.target.value)}
            ></textarea>
          )}
          <div className="row align-items-center">
            <div className="col-sm-6 d-flex align-items-center mt-2">
              <input
                type="checkbox"
                name="ShowOnReport"
                id="ShowOnReport"
                checked={data?.ShowOnReport}
                onChange={handleMainChange}
                value={data?.ShowOnReport === 1 ? true : false}
              />
              <label htmlFor="ShowOnReport" className="ml-2 mb-0">
                {t("ShowOnReport")}
              </label>
            </div>

            <div className="col-sm-6 mt-2 text-end">
              {load ? (
                <Loading />
              ) : (
                <button className="btn btn-success" onClick={handleAdd}>
                  {t("Create New")}
                </button>
              )}
            </div>
          </div>
        </div>
        <div
          className="d-flex"
          style={{ flexDirection: "column", width: "48%" }}
        >
          <label htmlFor="allergies">{t("Previous Medical History")}</label>
          {data.patientmedicalhistoryiesVM.length > 0 ? (
            <div
              className="d-flex"
              style={{
                flexDirection: "column",
                width: "100%",
                height: "240px",
                overflowX: "auto",
                padding: "5px",
              }}
            >
              {data.patientmedicalhistoryiesVM.map((ele, index) => (
                <MedicalHistorySpan
                  key={index}
                  data={ele}
                  index={index}
                  handleDelete={handleDelete}
                />
              ))}
            </div>
          ) : (
            <label>{t("No Medical History")}</label>
          )}
        </div>
      </div>
    </Dialog>
  );
};

export default MedicialModal;

function MedicalHistorySpan({ data, index, handleDelete }) {
  console.log("medical data",data);
  const { t } = useTranslation();
  return (
    <div
      className="d-flex w-100 simple-box-container mt-2"
      style={{ flexDirection: "column" }}
    >
      <div className="d-flex justify-content-between">
        <div>
            
              <span className="col-sm-7 small pr-0">Uploaded By {data?.CreatedByName}</span>
              <span className="col-sm-7 small p-0">&nbsp;on {dateConfig(data?.date)}</span>
        </div>
        
        <i
          className="fa fa-trash pointer pr-1 pt-1"
          title={t("Remove this medical History")}
          style={{ fontSize: "0.9rem", color: "inherit" }}
          onClick={() => handleDelete(index)}
        ></i>
      </div>
      <span className="col-sm-12">{data?.MedicalHistory}</span>
    </div>
  );
}
