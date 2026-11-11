import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import ShowTextEditors from "./ShowTextEditors";
import Loading from "../../components/loader/Loading";
import { Image } from "react-bootstrap";
import transfericon from "./../HomeCollection/TRY6_28.gif";
import Accordion from "@app/components/UI/Accordion";
import { useTranslation } from "react-i18next";
import { CheckDevice, dateConfig } from "../../utils/helpers";
import { logoList } from "../../utils/utils";
import UploadFile from "../utils/UploadFileModal/UploadFile";
import ResultEditAddModal from "../utils/ResultEditAddModal";
import Input from "../../components/formComponent/Input";
import {getTrimmedData } from "../../utils/helpers";
import PatientDetailModal from "../utils/PatientDetailModal";
import { getPaymentModes } from "../../utils/NetworkApi/commonApi";
import SampleRemark from "../utils/SampleRemark";
import SlidingDetailModal from "../utils/SlidingDetailModal";
import ImmunoHistoryModal from "../utils/ImmunoHistoryModal";
import ReactSelectHead from "../../components/formComponent/ReactSelectHead";
import { axiosInstance, axiosReport } from "../../utils/axiosInstance";
import {
  parseMappedSignature,
  resolveApprovalDoctor,
  withMappedDoctorOption,
} from "../../utils/dutyRosterApprovalDoctor";
import ImageUpload from "../utils/UploadFileModal/ImageUpload";
import ReactSelect from "../../components/formComponent/ReactSelect";
import HistoTemplateSave from "./HistoTemplateSave";
import { Dialog } from "primereact/dialog";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { toast } from "react-toastify";
import { Status } from "../../utils/Constants";
import { SelectBox } from "../../components/formComponent/SelectBox";
import { CustomButton } from "../../components/UI/CustomButton";
import { useNavigate } from "react-router-dom";

function HistoCytoResultEntrySecondPage({ innerData, setinnerData, statusValue ,setStatusValue }) {
  const navigate = useNavigate();

  console.log({innerData})
  const { t } = useTranslation();
  const [templateData, setTemplateData] = useState([]);
  const [printReportLoading, setPrintReportLoading] = useState(false);
  const [malignantData, setMalignantData ] = useState([])
  const [payload, setPayload] = useState({
    ClinicalHistory: "",
    Specimen: "",
    HistoNo: "",
    Advice: "",
    MacroScopicFinding: "",
    GrossComment: "",
    MicroScopicDescription: "",
    MicroScopicComment: "",
    ImpressionComment: "",
    Impression: "",
    COMMENT: "",
    FixativeUsed: "",
    BlockKey: "",
    StainPerformed: "",
    RADIOLOGY_IMAGING_Findings: "",
    SlidingDetail: [],
    Image: null,
    IsProvisional: "",
    MalignantID: "",
    Approved: "",
    Detail: "",
    DoctorName: "",
    DefaultSignatureID: "",
    IsDutyRosterLocked: false,
    MicroScopicImpression: "",
    MicroScopicImpressionTemplate: "",
  });

  const [remarkErr, setRemarkErr] = useState("")
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
    Impression: []
  })
  const [tempSave, setTempSave] = useState({
    TempType: "",
    TempText: "",
    flag: false
  })
    const [previewConfig, setPreviewConfig] = useState({
      visible: false,
      url: null,
    });
    const [showReportModal, setShowReportModal] = useState({
      show: false,
      url: "",
    });
    const localData = useLocalStorage("userData", "get");
    const isMobile = window.innerWidth <= 768;
    const [isEditingHistoNo, setIsEditingHistoNo] = useState(false);
    const [originalHistoNo, setOriginalHistoNo] = useState("");
    const [doctorAdmin, setDoctorAdmin] = useState([]);
    
  const TEMPLATEDROPDOWN = [
    {
      placeholder: "Gross",
      label: "MacroScopicFinding",
      type: "Gross",
      options: temp?.Gross,
      value: payload?.MacroScopicFinding
    },
    {
      placeholder: "MicroScopic",
      label: "MicroScopicDescription",
      type: "MicroScopic",
      options: temp?.MicroScropic,
      value: payload?.MicroScopicDescription
    },
    {
      placeholder: "Impression",
      label: "Impression",
      type: "Impression",
      options: temp?.Impression,
      value: payload?.Impression
    },
    {
      placeholder: "MicroScopic&Impression",
      label: "MicroScopicImpressionTemplate",
      type: "MicroScopic_Impression",
      options: temp?.MicroScopic_Impression,
      value: payload?.MicroScopicImpressionTemplate
    },
  ];

  const fetchData = () => {
    const testId = innerData?.TestID || innerData?.TestId;
    const ltNo = innerData?.LedgerTransactionNo || innerData?.LedgertransactionNo || innerData?.LedgerTransactionno;

    if (!testId || !ltNo) {
      return;
    }

    setLoad(true);
    let data = {
      LedgerTransactionNo: ltNo,
      LedgertransactionNo: ltNo,
      TestID: testId?.toString()
    }

    axiosInstance
      .post("HistoCyto/GetHistoData", data)
      .then((res) => {
        const message = res?.data?.message?.[0];
        if (message) {
          setPayload((prev) => ({
            ...prev,
            ClinicalHistory: message?.ClinicalHistory ?? message?.clinicalhistory ?? "",
            Specimen: message?.Specimen_Title ?? message?.SpecimenTitle ?? "",
            HistoNo: message?.HistoNo ?? message?.hno ?? "",
            Advice: message?.Advice ?? message?.advice ?? "",
            MacroScopicFinding: "",
            GrossComment: message?.Gross ?? message?.GrossComment ?? "",
            MicroScopicDescription: "",
            MicroScopicComment: message?.Microscopic ?? message?.MicroScopicComment ?? "",
            ImpressionComment: message?.Impression ?? message?.ImpressionComment ?? "",
            Impression: "",
            MicroScopicImpression: message?.MicroScopic_Impression ?? message?.MicroScopicImpression ?? message?.MicroscopicImpression ?? "",
            COMMENT: message?.Comments ?? message?.COMMENT ?? message?.comments ?? "",
            BlockKey: message?.BlockKey ?? message?.blockKey ?? "",
            RADIOLOGY_IMAGING_Findings: message?.RadiologyMessage ?? message?.radioMessage ?? "",
            MalignantID: message?.MalignantID?.toString() ?? message?.MalignantId?.toString() ?? "",
            FixativeUsed: message?.FixativeUsed ?? message?.fixativeUsed ?? "",
            StainPerformed: message?.StainPerformed ?? message?.stainPerformed ?? "",
            Approved: message?.Approved?.toString() ?? message?.ApprovedStatus?.toString() ?? "",
            Detail: message?.detail ?? message?.Detail ?? "",
            SlidingDetail: [],
            Image: null,
            IsProvisional: "",
            DoctorName: message?.ApprovedBy || "",
            DefaultSignatureID:
              String(message?.Approved) === "1"
                ? ""
                : message?.DefaultSignatureID || "",
            IsDutyRosterLocked: false,
          }));
          setOriginalHistoNo(message?.HistoNo ?? "");
        }
        setLoad(false);
      })
      .catch((err) => {
        setLoad(false);
        console.error(err);
      });
  };

  const BindApprovalDoctor = () => {
      
      axiosInstance
        .get("CommonController/BindApprovalDoctor")
        .then((res) => {
          let data = res?.data?.message;
          let doctorData = data?.map((ele) => {
            return {
              value: ele?.employeeid,
              label: ele?.name,
              IsDefault: ele?.IsDefault,
            };
          });
          setDoctorAdmin(doctorData || []);
        })
        .catch((err) => {
          
          console.log(err);
        });
    };

  useEffect(() => {
    fetchData();
  }, [innerData?.TestID, innerData?.TestId, innerData?.LedgerTransactionNo, innerData?.LedgertransactionNo]);

  useEffect(() => {
    setPayload((prev) => {
      const resolved = resolveApprovalDoctor({
        defaultSignatureID: prev.DefaultSignatureID,
        currentApprovedBy: prev.DoctorName,
        doctorAdmin,
      });
      if (
        resolved.approvedBy === prev.DoctorName &&
        resolved.locked === !!prev.IsDutyRosterLocked
      ) {
        return prev;
      }
      return {
        ...prev,
        DoctorName: resolved.approvedBy,
        IsDutyRosterLocked: resolved.locked,
      };
    });
  }, [doctorAdmin, payload.DefaultSignatureID]);




  const handleTempChange = useCallback((label, value) => {
    setPayload((prev) => ({
      ...prev,
      [label]: value?.value ?? "",
    }));
  }, []);

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

  const getMalignant = ()=>{
    axiosInstance
    .get("HistoCyto/bindMalignant")
    .then((res)=>{
      const data = res?.data?.message
      const val = data?.map((ele)=>{
        return {
          label :ele.malignant,
          value : ele?.id
        }
      })
      setMalignantData([{label:"Select", value:""}, ...val])
    })
    .catch((err)=>console.log(err))
  }



  const handleSelectChange = (e) => {
    if (payload?.IsDutyRosterLocked && e.target.name === "DoctorName") return;
    setPayload((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };


  const getTemplateHisto = (flag) => {
    const testId = innerData?.TestID || innerData?.TestId;
    axiosInstance
      .post("HistoTemplateMaster/GetHistoTemplate", {
        // testId: testId?.toString(),
        IsActive: 1
      })
      .then((res) => {
        const data = res?.data?.message
        const stripHtml = (html) => {
          const tmp = document.createElement("div");
          tmp.innerHTML = html || "";
          return tmp.textContent || tmp.innerText || "";
        };
        const finalValuedData = data?.map((ele, index) => {
          return {
            label: stripHtml(ele?.Template_Name),
            value: ele?.Template_ID,
            templateText: ele[ele?.fieldtype],
            fieldtype: ele?.fieldtype
          }
        })
        const gross = finalValuedData?.filter((ele) => ele?.fieldtype == "Gross")
        const MicroScropic = finalValuedData?.filter((ele) => ele?.fieldtype == "MicroScopic")
        const Impression = finalValuedData?.filter((ele) => ele?.fieldtype == "Impression")
        const MicroScopic_Impression = finalValuedData?.filter((ele) => ele?.fieldtype == "MicroScopic_Impression")
        setTemp({
          MicroScropic: MicroScropic,
          Gross: gross,
          Impression: Impression,
          MicroScopic_Impression: MicroScopic_Impression
        })
      }).catch((err) => {
        console.log(err)
      })
  }
  useEffect(() => {
    getTemplateHisto()
    getMalignant()
    BindApprovalDoctor();
  }, [])

  const fetch = (type) => {
    const testId = innerData?.TestID || innerData?.TestId;
    setTemplateData([]);
    axiosInstance
      .post("HistoCyto/LoadSpecimenTemplate", {
        testId: testId?.toString(),
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


  const handleTextEditorChanges = useCallback((name, value) => {
    setPayload((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setPayload((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSaveTemplate = (item) => {

    setTempSave({
      TempType: item?.type,
      TempText: item?.value,
      flag: true
    })
  }

  const handleTemplateData = (item) => {
    // console.log(item)
    axiosInstance
      .post("HistoCyto/getTemplateHisto", {
        Type: String(item?.type),
        Template_ID: payload?.[item?.label]?.toString(),
      })
      .then((res) => {
        switch (item?.type) {
          case "Gross":
            setPayload((prev) => ({ ...prev, GrossComment: res?.data?.message[0]?.Gross }))
            break;
          case "MicroScopic":
            setPayload((prev) => ({ ...prev, MicroScopicComment: res?.data?.message[0]?.MicroScopic }))
            break;
          case "Impression":
            setPayload((prev) => ({ ...prev, ImpressionComment: res?.data?.message[0]?.Impression }))
            break;
          case "MicroScopic_Impression":
            setPayload((prev) => ({ ...prev, MicroScopicImpression: res?.data?.message[0]?.MicroScopic_Impression }))
            break;
          default:
            break;
        }

      })
      .catch((err) => {
        console.log(err)
      })


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
  const handleUploadCount = () => { };
  const handleSlideSave = (data) => {
    console.log(data);
  };
  const handleImmunoSave = (data) => {
    console.log(data);
  };


  const handleUpdateHistoNo = () => {
    if (!payload?.HistoNo) {
      toast.error("Please enter Biopsy No");
      return;
    }

    const testId = innerData?.TestID || innerData?.TestId;

    axiosInstance
      .post("HistoCyto/UpdateHNO", {
        testId: testId?.toString(),
        hno: payload?.HistoNo,
        oldhno: originalHistoNo,
      })
      .then((res) => {
        if (res?.data?.success) {
          toast.success(res?.data?.message);
          setOriginalHistoNo(payload?.HistoNo);
          setIsEditingHistoNo(false);
        } else {
          toast.error(res?.data?.message);
        }
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Something went wrong"
        );
      });
  };

  const handleReport = (key) => {
    setPrintReportLoading(true);
    axiosReport
      .post(`commonReports/GetLabReport`, {
        TestIDHash: [innerData?.TestIDHash],
        PrintColour: "1",
        PHead: 0,
        IsDownload: CheckDevice(),
        isPreview: key === "no" ? 1 : 0,
      })
      .then((res) => {
        if (res?.data?.success) {
          if (key === "no") {
            setShowReportModal({ show: true, url: res?.data?.url });
          } else {
            window.open(res?.data?.url, "_blank");
          }
        } else {
          toast.error(res?.data?.message);
        }
        setPrintReportLoading(false);
      })
      .catch((err) => {
        setPrintReportLoading(false);
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : err?.data?.message,
        );
      });
  };

  const handleSaveReport = () => {
    if(payload?.Approved =="1"){
      toast.error("Report is already approved");
      return;
    }
    axiosInstance
      .post("HistoCyto/SaveHistoReport", getTrimmedData({
        TestId: innerData?.TestID?.toString(),
        LedgerTransactionNo: innerData?.LedgerTransactionNo,
        PatientCode: innerData?.PatientCode?.toString(),
        SpecimenID: "0",
        HistoNo: payload?.HistoNo,
        SpecimenTitle: payload?.Specimen,
        Detail: payload?.Detail,
        Gross: payload.GrossComment,
        Microscopic: payload?.MicroScopicComment,
        Impression: payload?.ImpressionComment,
        MicroScopicImpression: payload?.MicroScopicImpression,
        Advice: payload?.Advice,
        blockKey: payload?.BlockKey,
        fixativeUsed: payload?.FixativeUsed,
        stainPerformed: payload?.StainPerformed,
        radioMessage: payload?.RADIOLOGY_IMAGING_Findings,
        clinicalhistory: payload?.ClinicalHistory,
        type: "0",
        typeofreport: "0",
        pendingreason: "",
        DiagnosisID: "0",
        Diagnosis: "Select Dignosis",
        MalignantID: payload?.MalignantID,
        Comments: payload?.COMMENT,
        approvedBy: String(payload?.DoctorName || ""),
      }))
      .then((res) => {
        if (res?.data?.success){
          toast.success(res?.data?.message)
          setinnerData?.({...innerData,
            Status : "Result Done"
          })
        }
         
        else
          toast.error(res?.data?.message)
      })
      .catch((err) => {
        // toast.error(
        //   err?.response?.data?.message
        //     ? err?.response?.data?.message
        //     : err?.data?.message
        // );
        console.log(err.message)
      });

  }


  const handleProvisionalStatus = (status) => {
    axiosInstance
      .post("HistoCyto/SaveProvisionalReport", getTrimmedData({
        TestId: innerData?.TestID?.toString(),
        LedgerTransactionNo: innerData?.LedgerTransactionNo,
        PatientCode: innerData?.PatientCode?.toString(),
        SpecimenID: "0",
        SpecimenTitle: payload?.Specimen,
        HistoNo: payload?.HistoNo,
        Detail: payload?.Detail,
        Gross: payload.GrossComment,
        Microscopic: payload?.MicroScopicComment,
        Impression: payload?.ImpressionComment,
        MicroScopicImpression: payload?.MicroScopicImpression,
        Advice: payload?.Advice,
        blockKey: payload?.BlockKey,
        fixativeUsed: payload?.FixativeUsed,
        stainPerformed: payload?.StainPerformed,
        radioMessage: payload?.RADIOLOGY_IMAGING_Findings,
        clinicalhistory: payload?.ClinicalHistory,
        type: "0",
        typeofreport: "0",
        pendingreason: "",
        DiagnosisID: "0",
        Diagnosis: "Select Dignosis",
        Status: status,
        MalignantID: payload?.MalignantID,
        Comments: payload?.COMMENT

      }))
      .then((res) => {
        if (res?.data?.success){
          toast.success(res?.data?.message)
          setPayload({ ...payload, IsProvisional: status === "Not Provisional" ? "0" : "1" });
        }
         
        else
          toast.error(res?.data?.message)
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : err?.data?.message
        );
      });

  }

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

    if(payload?.DoctorName == "0" || !payload?.DoctorName){
      toast.warn("Please Select Approving Doctor");
      return;
    }

      axiosInstance
        .post("HistoCyto/FinalDone", getTrimmedData({
          TestId: innerData?.TestID?.toString(),
          LedgerTransactionNo: innerData?.LedgerTransactionNo,
          PatientCode: innerData?.PatientCode?.toString(),
          SpecimenID: "0",
          SpecimenTitle: payload?.Specimen,
          HistoNo: payload?.HistoNo,
          Detail: payload?.Detail,
          Gross: payload.GrossComment,
          Microscopic: payload?.MicroScopicComment,
          Impression: payload?.ImpressionComment,
          MicroScopicImpression: payload?.MicroScopicImpression,
          Advice: payload?.Advice,
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
          fixativeUsed: payload?.FixativeUsed,
          stainPerformed: payload?.StainPerformed,
          Comments: payload?.COMMENT,
          approvedBy: String(payload?.DoctorName || ""),
        }))
        .then((res) => {
          if (res?.data?.success){
            toast.success(res?.data?.message)
            setinnerData?.({
              ...innerData,
              Status: "Approved",
            })
            setPayload({...payload, Approved: "1"})
            setShowDialog(false); 
          }
           
          else
            toast.error(res?.data?.message)
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
    if (payload.Approved == "1") {
      setShowDialog(true); 
    }
  };

  const handleSaveRemark = () => {
    if(!remark){
      setRemarkErr("This field is required");
      return;
  }
  setRemarkErr("")    
    axiosInstance
      .post("HistoCyto/FinalDone", getTrimmedData({
        TestId: innerData?.TestID?.toString(),
        LedgerTransactionNo: innerData?.LedgerTransactionNo,
        PatientId: innerData?.PatientID?.toString(),
        SpecimenID: "0",
        SpecimenTitle: payload?.Specimen,
        HistoNo: payload?.HistoNo,
        Detail: payload?.Detail,
        Gross: payload.GrossComment,
        Microscopic: payload?.MicroScopicComment,
        Impression: payload?.ImpressionComment,
        MicroScopicImpression: payload?.MicroScopicImpression,
        Advice: payload?.Advice,
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
        fixativeUsed: payload?.FixativeUsed,
        stainPerformed: payload?.StainPerformed,
        Comments: payload?.COMMENT
      }))
      .then((res) => {
        if (res?.data?.success){
          toast.success(res?.data?.message)
          setinnerData?.({...innerData,
            Status: "Not Approved",
          })
          setPayload({...payload, Approved: "0"})
          setShowDialog(false);
        }
        else
          toast.error(res?.data?.message)
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


  const [age, gender] = innerData?.Age_Gender?.split('/') || [];
  console.log("payload",payload);
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

      {tempSave?.flag && <HistoTemplateSave tempSave={tempSave} setTempSave={setTempSave} getTemplateHisto={getTemplateHisto} />}
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
            setShow2({ modal: false, data: {}, COMMENT: "" });
          }}
          handleSave={handleSave}
          resultData={[innerData]}
          DepartmentData={[]}
          DignosticMaster={[]}
          getDignosticMasterData={() => {}}
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
              LedgerTransactionNo: innerData?.LedgerTransactionNo,
              TestID: typeof innerData?.TestID === "string" ? innerData?.TestID?.split(",")?.[0] : innerData?.TestID,
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
              <div className="custom-row gap-2">
                <div className="col-auto">
                  <i className="fa fa-folder"></i>
                  <span className="custom-text">
                    {innerData?.LedgerTransactionNo}
                  </span>
                </div>

                <div className="col-auto">
                  <i className="fa fa-user"></i>
                  <span className="custom-text">
                    {innerData?.PName}
                  </span>
                </div>

                <div className="col-auto">
                  <i className="fa fa-book"></i>
                  <span className="custom-text">
                    {innerData?.PatientID}
                  </span>
                </div>

                <div className="col-auto">
                  <i className="fa fa-calendar"></i>
                  <span className="custom-text"> {age}</span>
                  <i className="fa fa-street-view custom-text"></i>
                  <span className="custom-text"> {gender}</span>
                </div>

                <div className="col-auto">
                  <i className="fa fa-h-square"></i>
                  <span className="custom-text">
                    {innerData?.Centre}
                  </span>
                </div>

                <div className="col-auto">
                  <i className="fa fa-user-md"></i>
                  <span className="custom-text">
                    {innerData?.Doctor}
                  </span>
                </div>

                <div className="col-auto">
                  <i className="fa fa-plus-square"></i>
                  <span className="custom-text">
                    {innerData?.SinNo}
                  </span>
                </div>

                <div className="col-auto">
                  <i className="fa fa-calendar"></i>
                  <span className="custom-text">
                    {dateConfig(innerData?.DATE)}
                  </span>
                </div>
                <div className="col-sm-2 mb-2 d-flex align-items-center">
                    <input
                      type="text"
                      className="form-control"
                      value={payload?.HistoNo}
                      onChange={(e) => handleTextEditorChanges("HistoNo", e.target.value)}
                      name="HistoNo"
                      placeholder={t("Biopsy No")}
                      disabled={!isEditingHistoNo}
                      style={{
                        padding: "5px 10px",
                        borderRadius: "5px",
                        border: "1px solid #ccc",
                        flex: 1
                      }}
                    />
                    <div className="ml-2">
                       {isEditingHistoNo ? (
                          <i 
                            className="fa fa-check text-success cursor-pointer" 
                            style={{ fontSize: "18px", backgroundColor: "white", padding: "5px", borderRadius: "5px", cursor: "pointer" }}
                            onClick={handleUpdateHistoNo}
                          ></i>
                       ) : (
                          <i 
                            className="fa fa-edit text-primary cursor-pointer" 
                            
                            style={{ fontSize: "18px", backgroundColor: "white", padding: "5px", borderRadius: "5px", cursor: "pointer" }}
                            onClick={() => setIsEditingHistoNo(true)}
                          ></i>
                       )}
                    </div>
                  </div>

                <br></br>
                {innerData?.Test && (
                  <div dangerouslySetInnerHTML={{ __html: innerData.Test.replace(/<input[^>]*\/?>/gi, "") }} />
                )}
              </div>
              <div className="">
                <div
                  // className={` round font-weight-bold mx-2 mt-1 Status-${innerData.Status}`}
                >
                  {innerData?.TestName}
                </div>
              </div>
            </div>

            <div>
              <div className="p-2">
                {" "}
                <div className="row mt-1">
                  {/* <div className="col-sm-12">
                    <Accordion
                      title={t("Clinical History")}
                      defaultValue={true}
                    >
                      <div id="ClinicalHistory">
                        <ShowTextEditors
                          value={payload?.ClinicalHistory}
                          onChange={handleTextEditorChanges}
                          name={"ClinicalHistory"}
                        />{" "}
                      </div>{" "}
                    </Accordion>
                  </div> */}

                  {/* <div className="col-sm-4">
                    <Accordion title="Add Image" defaultValue={true}>
                      <ImageUpload payload={payload} setPayload={setPayload} />
                    </Accordion>
                  </div> */}
                </div>
                <div className="row mt-2">
                  <div className="col-sm-4 mb-2">
                    <Input
                      type="text"
                      value={payload?.Specimen}
                      onChange={(e) => handleTextEditorChanges("Specimen", e.target.value)}
                      name="Specimen"
                      lable={t("Specimen")}
                    />
                  </div>
                  <div className="col-sm-8 mb-2">
                    <Input
                      type="text"
                      value={payload?.Advice}
                      onChange={(e) => handleTextEditorChanges("Advice", e.target.value)}
                      name="Advice"
                      lable={t("Advice")}
                    />
                  </div>
                </div>
                
                <div className="row mt-2">
                  {[
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
                  ].map((item, index) => {
                    const template = TEMPLATEDROPDOWN.find(
                      (t) => t.type === item.type
                    );
                    return (
                      <div key={index} className="col-sm-12 mb-3">
                        <Accordion
                          title={item.title}
                          defaultValue={true}
                          notOpen={true}
                          seconTitle={
                            template && (
                              <div
                                className="d-flex align-items-center"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div
                                  style={{ minWidth: "150px", maxWidth: "220px", width: "220px" }}
                                  className="mr-2 mt-2"
                                >
                                  <ReactSelect
                                    dynamicOptions={template.options}
                                    removeIsClearable={true}
                                    placeholderName={template.placeholder}
                                    respclass="roll-off"
                                    id={`SelectedValueOfTemplate_${template.type}`}
                                    name={template.label}
                                    label={template.placeholder}
                                    value={template.value}
                                    onChange={handleTempChange}
                                  />
                                </div>
                                <span
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleTemplateData(template);
                                  }}
                                  className="mr-2"
                                >
                                  <Image
                                    src={transfericon}
                                    style={{ height: "20px", marginTop: "2px" }}
                                  />
                                </span>
                                <CustomButton
                                  className="btn btn-sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSaveTemplate(item);
                                  }}
                                  disabled={
                                    item?.name === "GrossComment"
                                      ? !payload.GrossComment
                                      : item?.name === "MicroScopicComment"
                                      ? !payload.MicroScopicComment
                                      : item?.name === "ImpressionComment"
                                      ? !payload.ImpressionComment
                                      : true
                                  }
                                  icon={"save"}
                                />
                              </div>
                            )
                          }
                        >
                          <ShowTextEditors
                            id={item.name}
                            value={item.value}
                            onChange={handleTextEditorChanges}
                            name={item.name}
                          />
                        </Accordion>
                      </div>
                    );
                  })}
                </div>

                {localData?.CompanyID === 1006 && (
                  <div className="row mt-2">
                    <div className="col-sm-12 mb-3">
                      <Accordion
                        title={t("MicroScopic & Impression")}
                        defaultValue={true}
                        notOpen={true}
                        seconTitle={
                          <div
                            className="d-flex align-items-center"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div
                              style={{ minWidth: "150px", maxWidth: "220px", width: "220px" }}
                              className="mr-2 mt-2"
                            >
                              <ReactSelect
                                dynamicOptions={temp?.MicroScopic_Impression}
                                removeIsClearable={true}
                                placeholderName={"MicroScopic & Impression"}
                                respclass="roll-off"
                                id={"SelectedValueOfTemplate_MicroScopicImpression"}
                                name={"MicroScopicImpressionTemplate"}
                                label={"MicroScopic&Impression"}
                                value={payload?.MicroScopicImpressionTemplate}
                                onChange={handleTempChange}
                              />
                            </div>
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTemplateData({
                                  type: "MicroScopic_Impression",
                                  label: "MicroScopicImpressionTemplate",
                                });
                              }}
                              className="mr-2"
                            >
                              <Image
                                src={transfericon}
                                style={{ height: "20px", marginTop: "2px" }}
                              />
                            </span>
                            <CustomButton
                              className="btn btn-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSaveTemplate({
                                  type: "MicroScopic_Impression",
                                  value: payload?.MicroScopicImpression,
                                });
                              }}
                              disabled={!payload?.MicroScopicImpression}
                              icon={"save"}
                            />
                          </div>
                        }
                      >
                        <ShowTextEditors
                          id="MicroScopicImpression"
                          value={payload?.MicroScopicImpression}
                          onChange={handleTextEditorChanges}
                          name="MicroScopicImpression"
                        />
                      </Accordion>
                    </div>
                  </div>
                )}

                <div className="row mt-2">
                  <div className="col-sm-4 mb-2">
                    <Input
                      type="text"
                      value={payload?.FixativeUsed}
                      onChange={(e) => handleTextEditorChanges("FixativeUsed", e.target.value)}
                      name="FixativeUsed"
                      lable={t("Fixative Used")}
                    />
                  </div>
                  <div className="col-sm-4 mb-2">
                    <Input
                      type="text"
                      value={payload?.BlockKey}
                      onChange={(e) => handleTextEditorChanges("BlockKey", e.target.value)}
                      name="BlockKey"
                      lable={t("Block Key")}
                    />
                  </div>
                  <div className="col-sm-4 mb-2">
                    <Input
                      type="text"
                      value={payload?.StainPerformed}
                      onChange={(e) => handleTextEditorChanges("StainPerformed", e.target.value)}
                      name="StainPerformed"
                      lable={t("Stain Performed")}
                    />
                  </div>
                </div>

                <div className="row mt-2">
                  <div className="col-sm-8" key="Comment">
                    <Accordion
                      title={localData?.CompanyID === 1006 ? t("Notes") : t("Comment")}
                      defaultValue={true}
                    >
                      <div id="CommentSection">
                        <ShowTextEditors
                          value={payload?.COMMENT}
                          onChange={handleTextEditorChanges}
                          name={"COMMENT"}
                          height={80}
                        />{" "}
                      </div>{" "}
                    </Accordion>
                  </div>
                  <div className="col-sm-4" key="ClinicalHistory">
                    <Accordion
                      title={t("Clinical History")}
                      defaultValue={true}
                    >
                      <div>
                        <ShowTextEditors
                          value={payload?.ClinicalHistory}
                          onChange={handleTextEditorChanges}
                          name={"ClinicalHistory"}
                          height={80}
                        />{" "}
                      </div>{" "}
                    </Accordion>
                  </div>
                </div>
                
                <div className="row mt-2 mx-1" style={{ display: "flex", gap: "10px" }}>
                  {/* <button
                    className="btn btn-sm btn-primary  mx-2"
                    onClick={() => {
                      setShow({
                        modal: true,
                        data: innerData?.PatientGuid,
                        pageName: "Add Images",
                      });
                    }}
                  >
                    Add Images
                  </button> */}
                  {/* <CustomButton
                    text={"Add Comment"}
                    icon={"add"}
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
                  /> */}
                  <CustomButton
                    text={"Patient Info"}
                    icon={"user"}
                    onClick={() => {
                      setShowPH(true);
                    }}
                  />
                  <CustomButton
                    text={"Immuno History"}
                    onClick={() => {
                      setShowIH(true);
                    }}
                  />
                  <CustomButton
                    text={"View Doc"}
                    onClick={() => {
                      setShow6({
                        modal: true,
                        data: innerData?.PatientGuid,
                        index: 0,
                      });
                    }}
                  />
                  <CustomButton
                    text={"View Remarks"}
                    onClick={() => setShowRemark(true)}
                  />
                  <CustomButton
                    text={"Main List"}
                    onClick={() => {
                      if (typeof setinnerData === "function") {
                        setinnerData({});
                      } else {
                        navigate(-1);
                      }
                    }}
                  />
                  <div className="col-sm-2">
                    <SelectBox
                      options={[
                        { label: "Select Doctor", value: "0" },
                        ...withMappedDoctorOption(
                          doctorAdmin,
                          parseMappedSignature(payload?.DefaultSignatureID)
                        ),
                      ]}
                      selectedValue={payload?.DoctorName}
                      id="DoctorName"
                      lable="Doctor"
                      name="DoctorName"
                      onChange={handleSelectChange}
                      isDisabled={!!payload?.IsDutyRosterLocked}
                    />
                  </div> 
                  <CustomButton
                    text={"Save Report"}
                    onClick={handleSaveReport}
                    // disabled= {payload?.Approved!=="1"}
                  />
                  <CustomButton
                    text={"Provisional"}
                    onClick={()=> handleProvisionalStatus("Provisional")}
                  />
                  <CustomButton
                    text={"Not Provisional"}
                    onClick={()=> handleProvisionalStatus("NotProvisional")}
                    disabled={payload?.IsProvisional!=="1"}
                  />
                  <CustomButton
                    text={"Forward"}
                    className="d-none"
                  />
                  <CustomButton
                    text={"ReSlide"}
                    className="d-none"
                    onClick={() => setShowSlide(true)}
                  />
                  <CustomButton
                    text={"Add Report"}
                    className="d-none"
                    onClick={() => {
                      setShow5({
                        modal: true,
                        data: innerData?.LedgertransactionIDHash,
                        pageName: "Add Report",
                      });
                    }}
                  />
                  {printReportLoading ? (
                    <Loading />
                  ) : (
                    <>
                      <CustomButton
                        text={"Preview"}
                        onClick={() => handleReport("no")}
                      />
                      <CustomButton
                        text={"Print Report"}
                        onClick={() => handleReport("Yes")}
                      />
                    </>
                  )}
                  <CustomButton
                    text={"Approved"}
                    onClick={handleApproved}
                    disabled={payload?.Approved == 1}
                    // disabled={innerData.Status==="Approved"}
                  />

                  <CustomButton
                    text={"Not Approved"}
                    onClick={handleNotApproved}
                    disabled={payload?.Approved != 1}
                  />

                  {showDialog && (
                    <Dialog
                      visible={showDialog}
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
                        <div className="error-message" style={{ color: "red" }}>
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
      {showReportModal.show && (
        <Dialog
          header={t("Report Preview")}
          visible={showReportModal.show}
          style={{ height: "100vh", width: "50vw" }}
          onHide={() => setShowReportModal({ show: false, url: "" })}
          className={theme}
        >
          <div
            style={{ position: "relative", width: "100%", height: "85vh" }}
            onKeyDown={(e) => {
              if (
                (e.ctrlKey || e.metaKey) &&
                (e.key === "p" || e.key === "P")
              ) {
                e.preventDefault();
              }
            }}
            onContextMenu={(e) => e.preventDefault()}
            tabIndex="0"
          >
            {/* Disable pointer events on the iframe so focus cannot enter inside it */}
            <iframe
              src={`${showReportModal.url}#toolbar=0`}
              title="Report Preview"
              style={{ width: "100%", height: "100%", border: "none" }}
            ></iframe>
            {/* Watermark Overlay */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 1,
              }}
            >
              {/* For now add text to check, as user requested, later we can use img */}
              {localData.CompanyCode !== "PKL" && (
                <div
                  style={{
                    fontSize: "100px",
                    fontWeight: "bold",
                    color: "gray",
                    opacity: 0.5,
                    transform: "rotate(-45deg)",
                    userSelect: "none",
                  }}
                >
                  <img
                    src={
                      logoList[localData.CompanyID] ||
                      `https://elabassets.s3.ap-south-1.amazonaws.com/${localData.ImageLogo}`
                    }
                    alt={localData.CompanyCode}
                    className="img-fluid"
                    style={{
                      height: "100px",
                      width: "200px",
                      transition: "transform 0.3s ease",
                      borderBottomRightRadius: "15px !important",
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </Dialog>
      )}
    </>
  );
}

export default HistoCytoResultEntrySecondPage;
