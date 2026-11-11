import React, { useEffect, useState } from "react";
import axios from "axios";
import Loading from "../../components/loader/Loading";
import { Image } from "react-bootstrap";
import transfericon from "./../HomeCollection/TRY6_28.gif";
import Accordion from "@app/components/UI/Accordion";
import { useTranslation } from "react-i18next";
import UploadFile from "../utils/UploadFileModal/UploadFile";
import ResultEditAddModal from "../utils/ResultEditAddModal";
import Input from "../../components/formComponent/Input";
import { dateConfig } from "../../utils/helpers";
import PatientDetailModal from "../utils/PatientDetailModal";
import { getPaymentModes } from "../../utils/NetworkApi/commonApi";
import SampleRemark from "../utils/SampleRemark";
import SlidingDetailModal from "../utils/SlidingDetailModal";
import ImmunoHistoryModal from "../utils/ImmunoHistoryModal";
import ReactSelectHead from "../../components/formComponent/ReactSelectHead";
import { axiosInstance, axiosReport } from "../../utils/axiosInstance";
import ImageUpload from "../utils/UploadFileModal/ImageUpload";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { Dialog } from "primereact/dialog";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { toast } from "react-toastify";
import { Roles, Status } from "../../utils/Constants";
import { SelectBox } from "../../components/formComponent/SelectBox";
import ShowTextEditors from "../Laboratory/ShowTextEditors";
import ImmunoTemplateSaveModal from "./ImmunoTemplateSaveModal";
import { FaEye, FaSave } from "react-icons/fa";
import ImmunoAntibody from "./ImmunoAntibody";
import ShowTemplateModal from "./ShowTemplateModal";
import { CancelButton, SaveButton } from "../../components/UI/CustomButton";


function ImmunoResultEntrySecondPage({
  innerData,
  setinnerData,
  statusValue,
  setStatusValue,
}) {
  const { t } = useTranslation();
  const [showComment, setShowComment] = useState({
    modal: false,
    data: "",
    index: -1,
  });
  const [antibodyRows, setAntibodyRows] = useState([]);
  const [templateData, setTemplateData] = useState([]);
  const [printReportLoading, setPrintReportLoading] = useState(false);
  const [malignantData, setMalignantData] = useState([]);
  const [payload, setPayload] = useState({
    ClinicalHistory: "",
    Specimen: "",
    MacroScopicFinding: "",
    GrossComment: "",
    MicroScopicDescription: "",
    MicroScopicComment: "",
    ImpressionComment: "",
    Impression: "",
    COMMENT: "",
    BlockKey: "",
    RADIOLOGY_IMAGING_Findings: "",
    SlidingDetail: [],
    Image: null,
    IsProvisional: "",
    MalignantID: "",
    Control: "",
  });

  const [remarkErr, setRemarkErr] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [remark, setRemark] = useState("");
  const theme = useLocalStorage("theme", "get");

  const [showRemark, setShowRemark] = useState(false);
  const [show, setShow] = useState({
    modal: false,
    data: "",
    pageName: "Add Images",
  });
  const [show5, setShow5] = useState({
    modal: false,
    data: "",

    pageName: "Add Report",
  });
  const [showIH, setShowIH] = useState(false);
  const [showPH, setShowPH] = useState(false);
  const [load, setLoad] = useState(false);
  const [show6, setShow6] = useState({
    modal: false,
    data: "",
    index: -1,
  });
  const [showSlide, setShowSlide] = useState(false);
  const [Identity, setIdentity] = useState([]);
  const [temp, setTemp] = useState({
    MicroScropic: [],
    Gross: [],
    Impression: [],
  });
  const [tempSave, setTempSave] = useState({
    TempType: "",
    TempText: "",
    flag: false,
  });
  // console.log({temp})
  const TEMPLATEDROPDOWN = [
    {
      label: "MacroScopicFinding",
      type: "Gross",
      options: temp?.Gross,
      value: payload?.MacroScopicFinding,
    },
    {
      label: "MicroScopicDescription",
      type: "MicroScopic",
      options: temp?.MicroScropic,
      value: payload?.MicroScopicDescription,
    },
    {
      label: "Impression",
      type: "Impression",
      options: temp?.Impression,
      value: payload?.Impression,
    },
  ];

  const fetchData = () => {
    setLoad(true);
    let data = {
      LedgertransactionNo: innerData.LedgerTransactionNo,
      TestID: innerData.TestID.toString(),
      MarkerId:
        antibodyRows?.length > 0 ? antibodyRows[0]?.MarkerID.toString() : "",
    };
    axiosInstance
      .post("IHCResultentry/GetimmunoPatientData", data)
      .then((res) => {
        if (res?.data?.message) {
          const antibodyRowData = res?.data?.message?.immunoMarkers || [];
          const antibodyRowsMarker =
            antibodyRowData?.length > 0 &&
            antibodyRowData?.map((row) => {
              return {
                Antibody: row.antiname,
                MapID: row.antiid,
                clone: row?.Clone,
                type: row.TYPE,
                stainingResult: row.Result,
                intensity: row.Intensity,
                pattern: row.Pattern,
                percentage: row.Percentage,
                MarkerID: row.MarkerID,
                MarkerName: row.MarkerName ,
                cloneisBold: row?.CloneIsBold,
                typeisBold: row?.TypeIsBold,
                stainingResultisBold: row?.ResultIsBold,
                intensityisBold: row?.IntensityIsBold,
                patternisBold: row?.PatternIsBold,
                percentageisBold: row?.PercentageIsBold,
              };
            });
          const {
            specimen_Title,
            impression,
            gross,
            microscopic,
            radiologyMessage,
            clinicalHistory,
            blockKey,
            malignantID,
            externalControl,
          } = res?.data?.message;
          setPayload({
            ClinicalHistory: clinicalHistory,
            Specimen: specimen_Title,
            MacroScopicFinding: "",
            GrossComment: gross,
            MicroScopicDescription: "",
            MicroScopicComment: microscopic,
            ImpressionComment: impression,
            Impression: "",
            COMMENT: "",
            BlockKey: blockKey,
            RADIOLOGY_IMAGING_Findings: radiologyMessage,
            SlidingDetail: [],
            Image: null,
            IsProvisional: "",
            MalignantID: malignantID,
            Control: externalControl,
          });
          setAntibodyRows(antibodyRowsMarker || []);
        } else {
          toast.error(res?.data?.message);
        }
        setLoad(false);
      })
      .catch((err) => {
        setLoad(false);
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Error Occured"
        );
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTempChange = (label, value, ele) => {
    // console.log(label,value)
    // console.log({label,value})
    let updatedPayload = {
      ...payload,
      [label]: value?.value ?? "",
    };
    // console.log({updatedPayload})
    // if (label === "MacroScopicFinding" && !value?.value) {
    //   updatedPayload.GrossComment = "";
    // } else if (label === "Impression" && !value?.value) {
    //   updatedPayload.ImpressionComment = "";
    // } else if (label === "MicroScopicDescription" && !value?.value) {
    //   updatedPayload.MicroScopicComment = "";
    // }
    const newItem = { ...ele, value: value?.value };
    setPayload(updatedPayload);

    handleTemplateData(newItem, updatedPayload);
  };

  const [show2, setShow2] = useState({
    modal: false,
    data: {},
    pageName: "Add Comments",
  });

  const handleShowRemark = () => {
    setShowRemark(false);
  };
  const heading = (head, isShow) => {
    return (
      <div className="bg-primary " style={{ marginTop: "10px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0px 1px",
          }}
        >
          <div className="text-white">{head}</div>
          {isShow && (
            <div>
              <input
                type={"checkbox"}
                id={"FavouriteTemplateOnly"}
                onChange={(e) => fetch(e.target.checked ? 1 : 0)}
              />
              <label htmlFor="FavouriteTemplateOnly">
                Favourite Template Only
              </label>
            </div>
          )}
        </div>
      </div>
    );
  };

  const getMalignant = () => {
    axiosInstance
      .get("HistoCyto/bindMalignant")
      .then((res) => {
        const data = res?.data?.message;
        const val = data?.map((ele) => {
          return {
            label: ele.malignant,
            value: ele?.id,
          };
        });
        setMalignantData([{ label: "Select", value: "" }, ...val]);
      })
      .catch((err) => console.log(err));
  };

  const handleSelectChange = (e) => {
    setPayload({
      ...payload,
      [e.target.name]: e.target.value,
    });
  };

  const getTemplateHisto = (flag) => {
    axios
      .get("api/v1/HistoCyto/BindTemplate?favOnly=0")
      .then((res) => {
        const data = res?.data?.message;
        const finalValuedData = data?.map((ele, index) => {
          return {
            label: ele?.Template_Name,
            value: ele?.Template_ID,
            templateText: ele[ele?.fieldtype],
            fieldtype: ele?.fieldtype,
          };
        });
        const gross = finalValuedData?.filter(
          (ele) => ele?.fieldtype == "Gross"
        );
        const MicroScropic = finalValuedData?.filter(
          (ele) => ele?.fieldtype == "MicroScopic"
        );
        const Impression = finalValuedData?.filter(
          (ele) => ele?.fieldtype == "Impression"
        );
        setTemp({
          MicroScropic: MicroScropic,
          Gross: gross,
          Impression: Impression,
        });
      })
      .catch((err) => {});
  };
  useEffect(() => {
    getTemplateHisto();
    getMalignant();
  }, []);

  const fetch = (type) => {
    setTemplateData([]);
    axios
      .post("/api/v1/HistoCytoResultEntry/LoadSpecimenTemplate", {
        favonly: type,
      })
      .then((res) => {
        const data = res?.data?.message;
        const finalData = data?.map((ele) => {
          return {
            ...ele,
            value: ele?.Template_Name,
            label: ele?.Template_Name,
          };
        });
        setTemplateData(finalData);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleTextEditorChanges = (name, value) => {
    if (!value) return;
    setPayload({ ...payload, [name]: value });
  };
  const handleChange = (e) => {
    const { name, value } = e.target;

    setPayload({ ...payload, [name]: value });
  };

  const handleSaveTemplate = (item) => {
    setTempSave({
      TempType: item?.type,
      TempText: item?.value,
      flag: true,
    });
  };

  const handleTemplateData = (item, updatedPayload) => {
    axiosInstance
      .post("HistoCyto/getTemplateHisto", {
        Type: String(item?.type),
        Template_ID: updatedPayload?.[item?.label]?.toString(),
      })
      .then((res) => {
        // debugger
        switch (item?.type) {
          case "Gross":
            setPayload((prev) => ({
              ...prev,
              GrossComment: res?.data?.message[0]?.Gross,
            }));
            break;
          case "MicroScopic":
            setPayload((prev) => ({
              ...prev,
              MicroScopicComment: res?.data?.message[0]?.MicroScopic,
            }));
            break;
          case "Impression":
            setPayload((prev) => ({
              ...prev,
              ImpressionComment: res?.data?.message[0]?.Impression,
            }));
            break;
          default:
            break;
        }
      })
      .catch((err) => {
        console.log(err);
      });

    // console.log(document.getElementById(id)?.value);
  };

  useEffect(() => {
    fetch("0");
    getPaymentModes("Identity", setIdentity);
  }, []);
  const handleSave = (data, _) => {
    setPayload({
      ...payload,
      COMMENT: data?.COMMENT,
    });
    setShow2({ moadal: false, data: {}, COMMENT: "" });
  };
  const handleUploadCount = () => {};
  const handleSlideSave = (data) => {};
  const handleImmunoSave = (data) => {};

  const handleReport = () => {
    setPrintReportLoading(true);
    axiosReport
      .post(`commonReports/GetLabReport`, {
        TestIDHash: [innerData?.TestIdHash],
        PrintColour: "1",
        PHead: 0,
      })
      .then((res) => {
        window.open(res?.data?.url, "_blank");
        setPrintReportLoading(false);
      })
      .catch((err) => {
        setPrintReportLoading(false);
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : err?.data?.message
        );
      });
  };

  const handleSaveReport = () => {
    if (innerData?.Status === "Approved") {
    }

    const antibodyRowData =
      antibodyRows?.length > 0
        ? antibodyRows.map((row) => ({
            testId: innerData?.TestID.toString(),
            labNo: innerData?.LedgerTransactionNo,
            ihcAntibody: row?.Antibody,
            ihcAntibodyID: row?.MapID?.toString(),
            clone: row?.clone?.toString() || "",
            type: row?.type?.toString() || "",
            stainingResult: row?.stainingResult?.toString() || "",
            intensity: row?.intensity?.toString() || "",
            pattern: row?.pattern?.toString() || "",
            percentage: row?.percentage?.toString() || "",
            finalImpression: "",
            comments: "",
            MarkerId: row?.MarkerID?.toString(),
          }))
        : [];
    axiosInstance
      .post("IHCResultentry/SaveImmunoObservation", {
        TestId: innerData?.TestID?.toString(),
        LedgerTransactionNo: innerData?.LedgerTransactionNo,
        PatientId: innerData?.PatientID?.toString(),
        SpecimenID: "0",
        SpecimenTitle: payload?.Specimen,
        Detail: "",
        Gross: payload.GrossComment,
        Microscopic: payload?.MicroScopicComment,
        Impression: payload?.ImpressionComment,
        Advice: "GOOD CONDITION",
        blockKey: payload?.BlockKey,
        radioMessage: payload?.RADIOLOGY_IMAGING_Findings,
        clinicalhistory: payload?.ClinicalHistory,
        type: "0",
        typeofreport: "0",
        pendingreason: "",
        DiagnosisID: "0",
        Diagnosis: "Select Dignosis",
        MalignantID: payload?.MalignantID,
        ExternalControl: payload?.Control,
        immunoData: antibodyRowData,
      })
      .then((res) => {
        if (res?.data?.success) {
          toast.success(res?.data?.message);
          setinnerData({ ...innerData, Status: "Result Done" });
        } else toast.error(res?.data?.message);
      })
      .catch((err) => {
        // toast.error(
        //   err?.response?.data?.message
        //     ? err?.response?.data?.message
        //     : err?.data?.message
        // );
        console.log(err.message);
      });
  };

  const handleProvisionalStatus = (status) => {
    const antibodyRowData =
      antibodyRows?.length > 0
        ? antibodyRows.map((row) => ({
            testId: innerData?.TestID.toString(),
            labNo: innerData?.LedgerTransactionNo,
            ihcAntibody: row?.Antibody,
            ihcAntibodyID: row?.MapID?.toString(),
            clone: row?.clone?.toString() || "",
            type: row?.type?.toString() || "",
            stainingResult: row?.stainingResult?.toString() || "",
            intensity: row?.intensity?.toString() || "",
            pattern: row?.pattern?.toString() || "",
            percentage: row?.percentage?.toString() || "",
            finalImpression: "",
            comments: "",
            MarkerId: row?.MarkerID?.toString(),
          }))
        : [];
    axiosInstance
      .post("IHCResultentry/SaveProvisionalReport", {
        TestId: innerData?.TestID?.toString(),
        LedgerTransactionNo: innerData?.LedgerTransactionNo,
        PatientId: innerData?.PatientID?.toString(),
        SpecimenID: "0",
        SpecimenTitle: payload?.Specimen,
        Detail: "",
        Gross: payload.GrossComment,
        Microscopic: payload?.MicroScopicComment,
        Impression: payload?.ImpressionComment,
        Advice: "BR11",
        blockKey: payload?.BlockKey,
        radioMessage: payload?.RADIOLOGY_IMAGING_Findings,
        clinicalhistory: payload?.ClinicalHistory,
        type: "0",
        typeofreport: "0",
        pendingreason: "",
        DiagnosisID: "0",
        Diagnosis: "Select Dignosis",
        Status: status,
        ExternalControl: payload?.Control,
        immunoData: antibodyRowData,
      })
      .then((res) => {
        if (res?.data?.success) {
          toast.success(res?.data?.message);
          setPayload({
            ...payload,
            IsProvisional: status === "Not Provisional" ? "0" : "1",
          });
        } else toast.error(res?.data?.message);
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : err?.data?.message
        );
      });
  };

  // const handleNotProvisional = () => {
  //   axiosInstance
  //     .post("HistoCyto/SaveProvisionalReport", {
  //       TestId: innerData?.TestID?.toString(),
  //       LedgerTransactionNo: innerData?.LedgerTransactionNo,
  //       PatientId: innerData?.PatientID?.toString(),
  //       SpecimenID: "0",
  //       SpecimenTitle: "",
  //       Detail: "",
  //       Gross: payload.GrossComment,
  //       Microscopic: payload?.MicroScopicComment,
  //       Impression: payload?.ImpressionComment,
  //       Advice: "BR11",
  //       blockKey: payload?.BlockKey,
  //       radioMessage: payload?.RADIOLOGY_IMAGING_Findings,
  //       clinicalhistory: payload?.ClinicalHistory,
  //       type: "0",
  //       typeofreport: "0",
  //       pendingreason: "",
  //       DiagnosisID: "0",
  //       Diagnosis: "Select Dignosis",
  //       Status: "Not Provisional"

  //     })

  //     .then((res) => {
  //       if (res?.data?.success){
  //         toast.success(res?.data?.message)
  //         setPayload({...payload, IsProvisional : "1"})
  //       }

  //       else
  //         toast.error(res?.data?.message)
  //     })
  //     .catch((err) => {
  //       toast.error(
  //         err?.response?.data?.message
  //           ? err?.response?.data?.message
  //           : err?.data?.message
  //       );
  //     });

  // }

  const handleApproved = () => {
    const antibodyRowData =
      antibodyRows?.length > 0
        ? antibodyRows.map((row) => ({
            testId: innerData?.TestID.toString(),
            labNo: innerData?.LedgerTransactionNo,
            ihcAntibody: row?.Antibody,
            ihcAntibodyID: row?.MapID?.toString(),
            clone: row?.clone?.toString() || "",
            type: row?.type?.toString() || "",
            stainingResult: row?.stainingResult?.toString() || "",
            intensity: row?.intensity?.toString() || "",
            pattern: row?.pattern?.toString() || "",
            percentage: row?.percentage?.toString() || "",
            finalImpression: "",
            comments: "",
            MarkerId: row?.MarkerID?.toString(),
          }))
        : [];
    axiosInstance
      .post("IHCResultentry/ApproveImmunoObservation", {
        TestId: innerData?.TestID?.toString(),
        LedgerTransactionNo: innerData?.LedgerTransactionNo,
        PatientId: innerData?.PatientID?.toString(),
        SpecimenID: "0",
        SpecimenTitle: payload?.Specimen,
        Detail: "",
        Gross: payload.GrossComment,
        Microscopic: payload?.MicroScopicComment,
        Impression: payload?.ImpressionComment,
        Advice: "BR11",
        blockKey: payload?.BlockKey,
        radioMessage: payload?.RADIOLOGY_IMAGING_Findings,
        clinicalhistory: payload?.ClinicalHistory,
        type: "0",
        typeofreport: "0",
        pendingreason: "",
        Approved: "1",
        notapprovalcomment: "",
        DiagnosisID: "0",
        Diagnosis: "Select Diagnosis",
        MalignantID: payload?.MalignantID,
        ExternalControl: payload?.Control,
        immunoData: antibodyRowData,
      })
      .then((res) => {
        if (res?.data?.success) {
          toast.success(res?.data?.message);
          setinnerData({
            ...innerData,
            Status: "Approved",
          });
          setShowDialog(false);
        } else toast.error(res?.data?.message);
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : err?.data?.message
        );
      });
  };

  const handleNotApproved = () => {
    if (innerData.Status === "Approved") {
      setShowDialog(true);
    }
  };

  const handleSaveRemark = () => {
    if (!remark) {
      setRemarkErr("This field is required");
      return;
    }
    setRemarkErr("");
    const antibodyRowData =
      antibodyRows?.length > 0
        ? antibodyRows.map((row) => ({
            testId: innerData?.TestID.toString(),
            labNo: innerData?.LedgerTransactionNo,
            ihcAntibody: row?.Antibody,
            ihcAntibodyID: row?.MapID?.toString(),
            clone: row?.clone?.value?.toString() || "",
            type: row?.type?.value?.toString() || "",
            stainingResult: row?.stainingResult?.value?.toString() || "",
            intensity:
              row?.intensity && typeof row?.intensity === "object"
                ? row?.intensity?.value?.toString()
                : row.intensity || "",
            pattern: row?.pattern?.value?.toString() || "",
            percentage: row?.percentage?.value?.toString() || "",
            finalImpression: "",
            comments: "",
          }))
        : [];
    axiosInstance
      .post("IHCResultentry/ApproveImmunoObservation", {
        TestId: innerData?.TestID?.toString(),
        LedgerTransactionNo: innerData?.LedgerTransactionNo,
        PatientId: innerData?.PatientID?.toString(),
        SpecimenID: "0",
        SpecimenTitle: payload?.Specimen,
        Detail: "",
        Gross: payload.GrossComment,
        Microscopic: payload?.MicroScopicComment,
        Impression: payload?.ImpressionComment,
        Advice: "BR11",
        blockKey: payload?.BlockKey,
        radioMessage: payload?.RADIOLOGY_IMAGING_Findings,
        clinicalhistory: payload?.ClinicalHistory,
        type: "0",
        typeofreport: "0",
        pendingreason: "",
        Approved: "0", // Set to "Not Approved"
        notapprovalcomment: remark, // Send remark here
        DiagnosisID: "0",
        Diagnosis: "Select Diagnosis",
        MalignantID: payload?.MalignantID,
        ExternalControl: payload?.Control,
        immunoData: antibodyRowData,
      })
      .then((res) => {
        if (res?.data?.success) {
          toast.success(res?.data?.message);
          setinnerData({ ...innerData, Status: "Not Approved" });
        } else toast.error(res?.data?.message);
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : err?.data?.message
        );
      });
  };

  const handleClose = () => {
    setShowDialog(false);
    setRemark("");
  };

  const [age, gender] = innerData?.Age_Gender?.split("/") || [];

  return (
    <>
      {" "}
      {show?.modal && (
        <UploadFile
          show={show?.modal}
          handleClose={() => {
            setShow({
              modal: false,
              data: "",
              pageName: "",
            });
          }}
          formData={innerData}
          documentId={show.data}
          pageName={show?.pageName}
        />
      )}
      {tempSave?.flag && (
        <ImmunoTemplateSaveModal
          tempSave={tempSave}
          setTempSave={setTempSave}
          getTemplateHisto={getTemplateHisto}
        />
      )}
      {show5?.modal && (
        <UploadFile
          show={show5?.modal}
          handleClose={() => {
            setShow5({
              modal: false,
              data: "",
              pageName: "",
            });
          }}
          documentId={show5.data}
          pageName={show5?.pageName}
          formData={innerData}
        />
      )}
      {show2.modal && (
        <ResultEditAddModal
          show={{ ...show2, COMMENT: payload?.COMMENT }}
          handleClose={() => {
            setShow2({ moadal: false, data: {}, COMMENT: "" });
          }}
          handleSave={handleSave}
        />
      )}
      {showSlide && (
        <SlidingDetailModal
          show={showSlide}
          handleClose={() => {
            setShowSlide(false);
          }}
          handleSave={handleSlideSave}
        />
      )}
      {showIH && (
        <ImmunoHistoryModal
          show={showIH}
          handleClose={() => {
            setShowIH(false);
          }}
          handleSave={handleImmunoSave}
        />
      )}
      {showPH && (
        <PatientDetailModal
          showPH={showPH}
          setShowPH={() => setShowPH(false)}
          ResultData={[
            {
              LedgerTransactionNo: innerData?.VisitNo,
              TestID: innerData?.TestID?.split(",")?.[0],
            },
          ]}
        />
      )}
      {show6?.modal && (
        <UploadFile
          show={show6?.modal}
          handleClose={() => {
            setShow6({ modal: false, data: "", index: -1 });
          }}
          options={Identity}
          documentId={show6?.data}
          pageName="Patient Registration"
          handleUploadCount={handleUploadCount}
          formData={innerData}
        />
      )}
      {showComment?.modal && (
        <ShowTemplateModal
          show={showComment?.modal}
          handleClose={() => {
            setShowComment({ modal: false, data: "", index: -1 });
          }}
          item={showComment.data}
          payload={payload}
          TEMPLATEDROPDOWN={TEMPLATEDROPDOWN}
          handleTempChange={handleTempChange}
          handleSaveTemplate={handleSaveTemplate}
          handleTextEditorChanges={handleTextEditorChanges}
          showEye={false}
          // handleSave={handle}
        />
      )}
      {showRemark && (
        <SampleRemark
          show={showRemark}
          handleShow={handleShowRemark}
          state={handleShowRemark}
          PageName={innerData?.Remarks}
          handleSave={handleShowRemark}
          title={"Remarks"}
        />
      )}{" "}
      <div className="p-2">
        <div>
          <div className="box-header with-border">
            <div
              className="p-dialog-header custom-box-body mb-1"
              style={{
                display: "flex",
                flexDirection: "column",
                alignContent: "flex-start",
                justifyContent: "flex-start",
              }}
            >
              <div className="custom-row">
                <div className="custom-col custom-col-visit">
                  <span className="fa fa-folder custom-text">
                    &nbsp; <span>{innerData?.LedgerTransactionNo}</span>
                  </span>
                </div>

                <div className="custom-col">
                  <span className="fa fa-user custom-text">
                    &nbsp; <span>{innerData?.PName}</span>
                  </span>
                </div>

                <div className="custom-col">
                  <span className="fa fa-book custom-text">
                    &nbsp;<span>{innerData?.PatientID}</span>
                  </span>
                </div>

                <div className="custom-col custom-col-age-gender">
                  <span className="fa fa-calendar custom-text">
                    &nbsp;<span> {age}</span>
                  </span>
                  <span className="fa fa-street-view custom-text">
                    &nbsp; <span> {gender}</span>
                  </span>
                </div>

                <div className="custom-col">
                  <span className="fa fa-h-square custom-text">
                    &nbsp; <span>{innerData?.Centre}</span>
                  </span>
                </div>

                <div className="custom-col">
                  <span className="fa fa-user-md custom-text">
                    &nbsp; <span> {innerData?.Doctor}</span>
                  </span>
                </div>

                <div className="custom-col">
                  <span className="fa fa-plus-square custom-text">
                    &nbsp;<span> {innerData?.BarcodeNo} </span>
                  </span>
                </div>

                <div className="custom-col custom-col-regdate">
                  <span className="fa fa-calendar custom-text">
                    &nbsp; <span> {dateConfig(innerData?.DATE)}</span>
                  </span>
                </div>

                <br></br>
              </div>
              <div className="custom-row">
                <div
                  className={` round font-weight-bold mx-2 mt-1 Status-${innerData.Status}`}
                >
                  {" "}
                  {innerData?.TestName}
                </div>
              </div>
            </div>

            <div>
              <div className="px-2 pt-1">
                {" "}
                <div className="row">
                  <div className="col-sm-4">
                    <Input
                      id="Specimen"
                      lable="Specimen"
                      placeholder=" "
                      type="text"
                      name="Specimen"
                      value={payload?.Specimen}
                      onChange={handleChange}
                      disabled={innerData.Status === "Approved"}
                    />
                  </div>
                  <div className="col-sm-4">
                    <Input
                      id="Control"
                      lable="ExternalControl"
                      placeholder=" "
                      type="text"
                      name="Control"
                      value={payload?.Control}
                      onChange={handleChange}
                      disabled={innerData.Status === "Approved"}
                    />
                  </div>
                </div>
                <div className="row mt-1">
                  {[
                    // {
                    //   title: t("Specimen"),
                    //   name: "Specimen",
                    //   value: payload?.Specimen,
                    // },
                    {
                      title: t("Gross"),
                      name: "GrossComment",
                      value: payload?.GrossComment,
                      type: "Gross",
                    },
                    {
                      title: t("MicroScopic"),
                      name: "MicroScopicComment",
                      value: payload?.MicroScopicComment,
                      type: "MicroScopic",
                    },
                    {
                      title: t("Impression"),
                      name: "ImpressionComment",
                      value: payload?.ImpressionComment,
                      type: "Impression",
                    },
                  ].map((item, index) => (
                    <div key={index} className="col-sm-4 col-md-6 col-lg-4">
                      <Accordion
                        title={item.title}
                        defaultValue={true}
                        notOpen={true}
                        linkTo="/immunoresultEntry"
                        linkTitle={
                          <div className="row d-flex align-items-center">
                            {TEMPLATEDROPDOWN?.filter(
                              (ele) => ele?.type === item?.type
                            )?.map((ele, index) => (
                              <div className="row p-2 d-flex" key={index}>
                                <div
                                  style={{ width: "160px" }}
                                  className="pt-2"
                                >
                                  <ReactSelect
                                    dynamicOptions={ele?.options}
                                    searchable
                                    removeIsClearable
                                    placeholderName={ele?.type}
                                    respclass="roll-off"
                                    id={`SelectedValueOfTemplate_${ele?.type}`}
                                    name={ele?.label}
                                    value={ele?.value}
                                    onChange={(label, value) =>
                                      handleTempChange(label, value, ele)
                                    }
                                    isDisabled={innerData.Status === "Approved"}
                                  />
                                </div>
                              </div>
                            ))}
                            <FaSave
                              title="SaveAsTemplate"
                              className="mx-2"
                              style={{ color: "green" }}
                              onClick={() => handleSaveTemplate(item)}
                              disabled={
                                item?.name === "GrossComment"
                                  ? !payload.GrossComment
                                  : item?.name === "MicroScopicComment"
                                    ? !payload.MicroScopicComment
                                    : item?.name === "ImpressionComment"
                                      ? !payload.ImpressionComment
                                      : true || innerData.Status === "Approved"
                              }
                            />
                            <FaEye
                              className="mr-2"
                              style={{ color: "black" }}
                              title="Maximize"
                              onClick={(e) => {
                                e.preventDefault();
                                setShowComment({
                                  modal: true,
                                  data: item,
                                  index: -1,
                                });
                              }}
                            />
                          </div>
                        }
                      >
                        <div
                          id="ClinicalHistory"
                          className="clinical-history-compact"
                        >
                          <ShowTextEditors
                            id={item.name}
                            value={item.value}
                            onChange={handleTextEditorChanges}
                            name={item.name}
                          />
                        </div>
                      </Accordion>
                    </div>
                  ))}
                </div>
                <div className="row mt-1">
                  <div className="col-sm-3">
                    <Accordion
                      title={t("Clinical History")}
                      defaultValue={true}
                    >
                      <div
                        id="ClinicalHistory"
                        className="clinical-history-compact"
                      >
                        <ShowTextEditors
                          value={payload?.ClinicalHistory}
                          onChange={handleTextEditorChanges}
                          id={"ClinicalHistory"}
                          name="ClinicalHistory"
                        />
                      </div>
                    </Accordion>
                  </div>
                  <div className="col-sm-9">
                    <ImmunoAntibody
                      setAntibodyRows={setAntibodyRows}
                      antibodyRows={antibodyRows}
                      REStatus={innerData.Status}
                    />
                  </div>
                </div>
                <div className="row mt-2 mx-1">
                  <button
                    className="btn btn-sm btn-primary  mx-2 d-none"
                    onClick={() => {
                      setShow({
                        modal: true,
                        data: innerData?.PatientGuid,
                        pageName: "Add Images",
                      });
                    }}
                  >
                    Add Images
                  </button>
                  <button
                    className="btn btn-sm btn-primary mx-1 d-none"
                    onClick={() => {
                      setShow2({
                        modal: true,
                        data: {
                          ...payload,
                          labObservationID: innerData?.LedgerTransactionID,
                          COMMENT: payload?.COMMENT ?? "",
                          pageName: "All",
                        },
                      });
                    }}
                  >
                    Add Comment
                  </button>
                  <button
                    className="btn btn-sm btn-primary d-none"
                    onClick={() => {
                      setShowPH(true);
                    }}
                  >
                    Patient Info
                  </button>
                  <button
                    className="btn btn-sm btn-primary mx-2 d-none"
                    onClick={() => {
                      setShowIH(true);
                    }}
                  >
                    Immuno History
                  </button>
                  <button
                    className="btn btn-sm btn-primary mx-2 d-none"
                    onClick={() => {
                      setShow6({
                        modal: true,
                        data: innerData?.PatientGuid,
                        index: 0,
                      });
                    }}
                  >
                    View Doc
                  </button>
                  <button
                    className="btn btn-sm btn-primary mx-2 d-none"
                    onClick={() => setShowRemark(true)}
                  >
                    View Remarks
                  </button>

                  <button
                    className="btn btn-primary btn-sm mx-2"
                    onClick={() => setinnerData({})}
                  >
                    Main List
                  </button>
                  <SaveButton
                    text={"Save Report"}
                    id="btnSave"
                    onClick={handleSaveReport}
                  />
                  <SaveButton
                    text={"Approved"}
                    id="btnSave"
                    onClick={handleApproved}
                    disabled={innerData.Status === "Approved"}
                    className="mx-2"
                  />

                  {/* <button
                    className="btn btn-sm btn-primary   mx-2"
                    onClick={handleNotApproved}
                    disabled={innerData.Status !== "Approved"}
                  >
                    Not Approved
                  </button> */}
                  <CancelButton
                    text={t("Not Approved")}
                    id="btnSave"
                    onClick={handleNotApproved}
                    disabled={innerData.Status !== "Approved"}
                  />
                  <button
                    className="btn btn-sm btn-primary   mx-2"
                    onClick={() => handleProvisionalStatus("Provisional")}
                    disabled= {innerData?.Status==="Approved"}
                  >
                    Provisional{" "}
                  </button>
                  <button
                    className="btn btn-sm btn-primary   mx-2"
                    onClick={() => handleProvisionalStatus("Not Provisional")}
                    disabled={payload?.IsProvisional !== "1" || innerData?.Status=== "Approved"}
                  >
                    Not Provisional{" "}
                  </button>
                  <button className="btn btn-sm btn-primary  mx-2 d-none">
                    Forward
                  </button>
                  <button
                    className="btn btn-sm btn-primary  mx-2 d-none"
                    onClick={() => setShowSlide(true)}
                  >
                    ReSlide
                  </button>
                  <button
                    className="btn btn-sm btn-primary mx-2 d-none"
                    onClick={() => {
                      setShow5({
                        modal: true,
                        data: innerData?.LedgertransactionIDHash,
                        pageName: "Add Report",
                      });
                    }}
                  >
                    Add Report
                  </button>
                  {printReportLoading ? (
                    <Loading />
                  ) : (
                    <button
                      className="btn btn-sm btn-primary  mx-2 "
                      onClick={handleReport}
                    >
                      Report
                    </button>
                  )}
                  {showDialog && (
                    <Dialog
                      visible={innerData?.Status === "Approved"}
                      header="Not Approved"
                      onHide={handleClose}
                      top={"25%"}
                      className={theme}
                    >
                      <>
                        <div className="mx-4 my-3">
                          <div className="row">
                            <label className="mr-3">Remark </label>
                            <Input
                              type="text"
                              name="Remark"
                              // id="VisitNo"
                              // lable="Template Name"
                              placeholder=""
                              className="required-fields"
                              onChange={(e) => setRemark(e.target.value)}
                            />
                          </div>
                          {remarkErr && (
                            <div
                              className="error-message"
                              style={{ color: "red" }}
                            >
                              {remarkErr}
                            </div>
                          )}
                        </div>
                        <div className="row w-100">
                          <div className="col-sm-6">
                            <button
                              type="submit"
                              className="btn btn-success btn-block btn-sm"
                              onClick={handleSaveRemark}
                            >
                              {t("Save")}
                            </button>
                          </div>
                          <div className="col-sm-6">
                            <button
                              className="btn btn-danger btn-block btn-sm"
                              onClick={handleClose}
                            >
                              {t("Close")}
                            </button>
                          </div>
                        </div>
                      </>
                    </Dialog>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ImmunoResultEntrySecondPage;
