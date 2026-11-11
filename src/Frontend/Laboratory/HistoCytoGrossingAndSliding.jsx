import React, { useEffect, useMemo, useState } from "react";
import Accordion from "@app/components/UI/Accordion";
import { SelectBox } from "../../components/formComponent/SelectBox";
import DatePicker from "../../components/formComponent/DatePicker";
import Input from "../../components/formComponent/Input";
import { AddBlankData } from "../../utils/helpers";
import { axiosInstance } from "../../utils/axiosInstance";
import { useTranslation } from "react-i18next";
import Tables from "../../components/UI/customTable";
import Loading from "../../components/loader/Loading";
import FullTextEditor from "../../components/formComponent/TextEditor";
import ReactSelect from "../../components/formComponent/ReactSelect";
import ViewRemarkModal from "../utils/ViewRemarkModal";
import { toast } from "react-toastify";
import moment from "moment";
import { SelectBoxWithCheckbox } from "../../components/formComponent/MultiSelectBox";
// import { elements } from "chart.js";
import UploadFile from "../utils/UploadFileModal/UploadFile";
// import { FaYCombinator } from "react-icons/fa";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
// import { blockDelta } from "quill/blots/block";
import { CustomButton, SearchButton } from "../../components/UI/CustomButton";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import HistoSecondOpinionModal from "./histoSecondOpinionModal";
import { Dialog } from "primereact/dialog";


const romanToNum = (roman) => {
  const map = {
    I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6, VII: 7, VIII: 8, IX: 9, X: 10,
    XI: 11, XII: 12, XIII: 13, XIV: 14, XV: 15, XVI: 16, XVII: 17, XVIII: 18, XIX: 19, XX: 20,
    XXI: 21, XXII: 22, XXIII: 23, XXIV: 24, XXV: 25, XXVI: 26
  };
  return map[roman] || Number(roman) || 0;
};

const toRoman = (num) => {
  const lookup = {
    M: 1000,
    CM: 900,
    D: 500,
    CD: 400,
    C: 100,
    XC: 90,
    L: 50,
    XL: 40,
    X: 10,
    IX: 9,
    V: 5,
    IV: 4,
    I: 1,
  };
  let roman = "";
  for (let i in lookup) {
    while (num >= lookup[i]) {
      roman += i;
      num -= lookup[i];
    }
  }
  return roman;
};

const STATUS_BASE = [
  {
    label: "All",
    value: "",
  },
  {
    label: "Assigned",
    value: "Assigned",
  },
  {
    label: "Grossed",
    value: "Grossed",
  },
  {
    label: "Second Opinion",
    value: "SecondOpinion",
  },
  {
    label: "Slided",
    value: "Slided",
  },
  {
    label: "Completed",
    value: "SlideComplete",
  },
  {
    label: "Regrossing",
    value: "Regrossing",
  },
];

const STATUS_BUTTON_BASE = [
  {
    label: "Assigned",
    type: "Assigned",
    color: "#ffffe0",
  },
  {
    label: "Grossed",
    type: "Grossed",
    color: "#ffc0cb",
  },
  {
    label: "Slided",
    type: "Slided",
    color: "#90ee90",
  },
  {
    label: "Second Opinion",
    type: "SecondOpinion",
    color: "#D3D3D3",
  },
  {
    label: "Completed",
    type: "SlideComplete",
    color: "#ff89ffff",
  },
  {
    label: "Regrossing",
    type: "Regrossing",
    color: "#ff96a6ff",
  },
];

// const NO_OF_CASSET = [
//   { label: "Select", value: "" },
//   ...Array.from({ length: 200 }, (_, i) => ({
//     label: (i + 1).toString(),
//     value: (i + 1).toString(),
//   })),
//   { label: "BRT", value: "BRT" },
//   { label: "BRN", value: "BRN" },
// ];



const ALPHABETS = Array.from({ length: 26 }, (_, i) => ({
  label: String.fromCharCode(65 + i), // ASCII value of 'A' is 65
  value: String.fromCharCode(65 + i),
}));

const CASSET_RANGE = [
  { label: "Select", value: "" },
  ...ALPHABETS,
  { label: "BRT", value: "BRT" },
  { label: "BRN", value: "BRN" },
];

const NO_OF_SLIDES = [
  { label: "Select", value: "" },
  ...Array.from({ length: 200 }, (_, i) => ({
    label: (i + 1).toString(),
    value: (i + 1).toString(),
  })),
];

const HistoCytoGrossingAndSliding = () => {
  const { t } = useTranslation();

  const [payload, setPayload] = useState({
    TestCentreId: "",
    FromDate: new Date(),
    ToDate: new Date(),
    LedgerTransactionNo: "",
    BarcodeNo: "",
    Hno: "",
    DepartmentId: 0,
    HistoCytoStatus: "",
    TestId: "",
    Doc: "",
  });

  const [AssignedData, setAssignedData] = useState({
    AssignedDoctor: "",
  });
  const userData = useLocalStorage("userData", "get");
  console.log({ userData })

  const isCompanyBaseBlockId = useMemo(() => {
    const cid = userData?.CompanyId || userData?.CompanyID || userData?.companyid;
    if (cid === 1004) return "npl";
    if(cid===1006) return "npl";
    if (cid === 999) return "pkl";
    return "pkl"; // Default
  }, [userData]);

  const STATUS = useMemo(() => {
    return STATUS_BASE.filter((item) =>
      isCompanyBaseBlockId === "npl" ? item.value !== "SecondOpinion" : true
    );
  }, [isCompanyBaseBlockId]);

  const STATUS_BUTTON = useMemo(() => {
    return STATUS_BUTTON_BASE.filter((item) =>
      isCompanyBaseBlockId === "npl" ? item.type !== "SecondOpinion" : true
    );
  }, [isCompanyBaseBlockId]);

  const [DepartmentData, setDepartmentData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [singleData, setSingleData] = useState({});
  const [loading, setLoading] = useState(false);
  const [load, setLoad] = useState(false);
  const [show, setShow] = useState(false);
  const [show2, setShow2] = useState(false);
  const [show3, setShow3] = useState({
    modal: false,
    data: "",
    index: -1,
    ledgerTransactionId: null,
    blockUpload: false,

  });
  //const [show4, setShow4] = useState(false);
  const [DoctorData, setDoctorData] = useState([]);
  const [TemplateData, setTemplateData] = useState([]);
  const handleClose = () => setShow(false);
  const [doctorAdmin, setDoctorAdmin] = useState([]);


  const getDepartment = () => {
    axiosInstance
      .get("Department/getDepartment")
      .then((res) => {
        let data = res.data.message;
        let DeptDataValue = Array.isArray(data) ? data.map((ele) => {
          return {
            value: ele.DepartmentID,
            label: ele.Department,
          };
        }) : [];

        setDepartmentData(DeptDataValue);
      })
      .catch((err) => console.log(err));
  };

  // const handleSubmit = () => {
  //   setLoading(true);
  //   axiosInstance
  //     .post("HistoCyto/SecondOpinionHisto", {
  //       LabOpinion: String(singleData?.TestID),
  //       HistoRemarks: String(payload.Remark),
  //     })
  //     .then((res) => {
  //       setLoading(false);
  //       toast.success(res?.data?.message);
  //       setPayload({ Remark: "" });
  //       handleClose();
  //     })
  //     .catch((err) => {
  //       setLoading(false);
  //       console.log(err);
  //     });
  // };




  const handleChange = (e) => {
    const { name, value } = e.target;
    setPayload({ ...payload, [name]: value });
  };



  const dateSelect = (value, name) => {
    setPayload({
      ...payload,
      [name]: value,
    });
  };

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    console.log("Selected:", name, value);
    setPayload((prevPayload) => ({
      ...prevPayload,
      [name]: value,
    }));
  };

  const handleSearch = (type) => {
    setLoad(true);
    setTableData([]);
    setSingleData({});

    axiosInstance
      .post("HistoCyto/HistoSearchData", {
        FromDate: moment(payload.FromDate).format("DD/MMM/YYYY 00:00:00"),
        ToDate: moment(payload.ToDate).format("DD/MMM/YYYY 23:59:59"),
        LedgerTransactionNo: payload?.LedgerTransactionNo,
        BarcodeNo: payload?.BarcodeNo,
        DepartmentId:
          payload?.DepartmentId == "" ? 0 : Number(payload?.DepartmentId),
        HistoCytoStatus: type,
      })
      .then((response) => {
        setLoad(false);
        const data = response?.data?.message;
        if (response?.data?.success) {
          if (data.length === 0) {
            toast.error("No Record Found");
            setTableData([]);
          }
          else {
            setTableData(data);
          }
        } else {
          toast.error(response?.data?.error);
          setTableData([]);
        }
      })
      .catch((error) => {
        setLoad(false);
        const errorMessage = error?.response?.data?.message;
        console.error("Error:", error);
        toast.error(errorMessage);
      });
    console.log(tableData);
  };




  const getDoctorSuggestion = () => {
    axiosInstance
      .post("DoctorReferal/getDoctorWithTitle")
      .then((res) => {
        const data = res?.data?.message;

        const val = Array.isArray(data)
          ? data.map((ele) => {
            return {
              label: ele?.DoctorName,
              value: ele?.DoctorID,
            };
          })
          : [];
        setDoctorData([{ label: "Select", value: "" }, ...val]);
      })
      .catch((err) => console.log(err));
  };

  const getBindTemplate = () => {
    axiosInstance
      .post("HistoCyto/UseTemplateHisto")
      .then((response) => {
        const data = response?.data?.message;

        const val = Array.isArray(data)
          ? data.map((element) => ({
            label: element?.Template_Name,
            value: element?.Template_ID,
            gross: element?.Gross || "",
            micro: element?.MicroScopic || "",
            impression: element?.Impression || "",
          }))
          : [];

        setTemplateData([{ label: "Select", value: "" }, ...val]);
      })
      .catch((err) => console.log(err));
  };

  const [NoOfCassete, setNoOfCassete] = useState([]);

  const getNoOfCassete = () => {
    axiosInstance
      .post("CommonController/GetNumberOfCassetteMaster", {
        ID: 0,

      })
      .then((response) => {
        const data = response?.data?.message;
        const val = Array.isArray(data)
          ? data.map((element) => {
            return {
              label: element?.Display,
              value: element?.Value,
            };
          })
          : [];
        setNoOfCassete([{ label: "Select", value: "" }, ...val]);
      })
      .catch((err) => console.log(err));
  };



  useEffect(() => {
    getDepartment();
    getDoctorSuggestion();
    getNoOfCassete();
  }, []);

  useEffect(() => {
    getBindTemplate();
  }, [singleData?.TestID, singleData?.TestId]);

  const handleRegrossing = () => {
    axiosInstance.post("Histocyto/Regrossing", {
      TestId: String(singleData?.TestID || "").trim(),
    })
      .then((response) => {
        toast.success(response?.data?.message);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // const GrossingDetailComponent = ({ data, show }) => {
  //   const [tableData, setTableData] = useState([]);
  //   const [histoNo, setHistoNo] = useState("");
  //   const [payload2, setPayload2] = useState({
  //     TestId: "",
  //     Hno: "",
  //     LabNo: "",
  //     BlockId: "",
  //     NoOfCasset: "",
  //     RangeFrom: "",
  //     BlockComment: "",
  //     GrossComment: "",
  //     InvestigationTemplate: "",
  //     HistoNo: "",
  //   });
  //   const [editorText, setEditorText] = useState("");
  //   // const [secondEditorText, setSecondEditorText] = useState("");
  //   console.log(payload2);
  //   const [Editable, setEditable] = useState(false);
  //   const handleChange2 = (e) => {
  //     console.log("FULL EVENT:", e);
  //     console.log(e.target.value);
  //     const { name, value } = e.target;
  //     // if (name == "InvestigationTemplate") {
  //     //   const filteredData = TemplateData?.filter((ele) => ele?.value == value);
  //     //   console.log(filteredData);
  //     //   setEditable(true);
  //     //   setEditorText(filteredData[0]?.text ?? "");
  //     //   setPayload2({
  //     //     ...payload2,
  //     //     [name]: value,
  //     //   });
  //     // } else
  //     setPayload2({ ...payload2, [name]: value });
  //   };

  //   const handleUseTemplate = () => {
  //     const filteredData = TemplateData?.filter(
  //       (ele) => ele?.value == payload2?.InvestigationTemplate
  //     );
  //     console.log(filteredData);
  //     setEditable(true);
  //     setEditorText(filteredData[0]?.text ?? "");
  //   };

  //   const handleHistoChange = (e) => {
  //     const { name, value } = e.target;

  //     if (name === "histoNo") {
  //       setHistoNo(value);
  //       // return ;
  //     }
  //   };

  //   useEffect(() => {
  //     if (data?.Hno) {
  //       setHistoNo(data.Hno);
  //     }
  //   }, [data]);

  //   const handleCreate = () => {
  //     const noOfCasset = romanToNum(payload2?.NoOfCasset);
  //     const rangeStart = payload2?.RangeFrom || "";

  //     if (!noOfCasset || !rangeStart) {
  //       toast.error("Please select both Alphabet Blocks and Slides");
  //       return;
  //     }

  //     const desiredBlockIds = [];
  //     if (isCompanyBaseBlockId === "pkl") {
  //       const startNum = romanToNum(rangeStart);
  //       if (startNum > 0) {
  //         for (let i = 0; i < noOfCasset; i++) {
  //           desiredBlockIds.push(toRoman(startNum + i));
  //         }
  //       }
  //     } else if (rangeStart.length === 1) {
  //       let startCharCode = rangeStart.charCodeAt(0);
  //       const endCharCode = 90;

  //       if (isCompanyBaseBlockId === "npl" && !histoNo.trim()) {
  //         toast.error("Please enter Histo No.");
  //         return;
  //       }

  //       for (let i = 0; i < noOfCasset; i++) {
  //         let charCode = startCharCode + i;
  //         if (charCode <= endCharCode) {
  //           const blockId =
  //             isCompanyBaseBlockId === "npl"
  //               ? histoNo + String.fromCharCode(charCode)
  //               : String.fromCharCode(charCode);
  //           desiredBlockIds.push(blockId);
  //         }
  //       }
  //     }


  //     // 2. Filtering and adding rows
  //     const newRows = desiredBlockIds
  //       .filter((blockId) => !tableData.some((row) => row.blockId === blockId))
  //       .map((blockId, index) => ({
  //         serialNo: tableData.length + index + 1,
  //         secNo: "",
  //         blockId: blockId,
  //         comment: "",
  //       }));

  //     if (newRows.length > 0) {
  //       setTableData([...tableData, ...newRows]);
  //       toast.success(`${newRows.length} new IDs added.`);
  //     } else {
  //       toast.info("No new rows added (IDs might already exist).");
  //     }
  //   };

  //   const handleCommentChange = (e, index) => {
  //     const updatedTableData = [...tableData];
  //     updatedTableData[index].comment = e.target.value;
  //     setTableData(updatedTableData);
  //   };

  //   const handleDelete = (index) => {
  //     const updatedData = tableData.filter((_, i) => i !== index);
  //     setTableData(updatedData);
  //   };

  //   const handleSaveGrossing = (e) => {
  //     const noOfCasset = Number(payload2?.NoOfCasset);
  //     const rangeStart = payload2?.RangeFrom;
  //     const isGrossDataValid = tableData.every((row) => row.blockId);
  //     const isPayloadValid = editorText?.trim() !== "";
  //     console.log(isGrossDataValid);
  //     console.log(isPayloadValid);

  //     if (tableData.length === 0) {
  //       if (!noOfCasset) {
  //         toast.error("Please select Number of Casset");
  //         return;
  //       }

  //       if (!rangeStart) {
  //         toast.error("Please select Start From");
  //         return;
  //       }

  //       toast.error("Please create Blocks");
  //       return;
  //     }

  //     if (!isPayloadValid) {
  //       toast.error(
  //         "Please add text to editor or Select Investigation Template"
  //       );
  //       return;
  //     }

  //     const GrossDataList = tableData.map((row) => ({
  //       TestId: String(data?.TestID || "").trim(),
  //       Hno: isCompanyBaseBlockId === "npl" ? histoNo.trim() : data?.Hno?.trim(),
  //       LabNo: data?.LedgerTransactionNo?.trim(),
  //       BlockId: row?.blockId,
  //       BlockComment: row?.comment?.trim(),
  //       GrossComment: editorText,
  //     }));

  //     setLoading(true);
  //     axiosInstance
  //       .post("HistoCyto/SaveGrossData", { GrossDataList })
  //       .then((response) => {
  //         setLoading(false);
  //         setSingleData({});
  //         toast.success(response?.data?.message);
  //         setTableData([]);
  //         getBindTemplate(data?.TestID);
  //       })
  //       .catch((err) => {
  //         setLoading(false);
  //         console.log(err);
  //       });

  //     handleSearch(payload?.HistoCytoStatus)
  //   };

  //   const handleChangeEditor = (data) => {
  //     setEditorText(data);
  //   };

  //   // Inside your component


  //   // handleRegrossing moved to the main component
  //   console.log(TemplateData);
  //   useEffect(() => {
  //     show;
  //   }, []);



  //   return (
  //     <>
  //       {/* {show && (
  //         <ViewRemarkModal 
  //         show={show}
  //         handleClose={handleClose}
  //         />
  //       )} */}
  //       <Accordion title="Grossing Detail" defaultValue={true}>
  //         {show && (
  //           <>
  //             <div className="row px-2 mt-2 mb-1">
  //               {isCompanyBaseBlockId === "npl" ? (
  //                 <>
  //                   <div className="col-sm-3">
  //                     <SelectBox
  //                       className="required-fields"
  //                       options={NO_OF_SLIDES}
  //                       lable="Number of Casset"
  //                       id="NoOfCasset"
  //                       name="NoOfCasset"
  //                       value={payload2?.NoOfCasset}
  //                       onChange={handleChange2}
  //                     />
  //                   </div>
  //                   <div className="col-sm-3">
  //                     <SelectBox
  //                       className="required-fields"
  //                       options={isCompanyBaseBlockId === "npl" ? CASSET_RANGE : NoOfCassete}
  //                       lable="Start From"
  //                       id="RangeFrom"
  //                       name="RangeFrom"
  //                       value={payload2?.RangeFrom}
  //                       onChange={handleChange2}
  //                     />
  //                   </div>
  //                 </>
  //               ) : (
  //                 <>
  //                   <div className="col-sm-3">
  //                     <SelectBox
  //                       className="required-fields"
  //                       options={isCompanyBaseBlockId === "npl" ? CASSET_RANGE : NoOfCassete}
  //                       lable="Start From"
  //                       id="RangeFrom"
  //                       name="RangeFrom"
  //                       value={payload2?.RangeFrom}
  //                       onChange={handleChange2}
  //                     />
  //                   </div>
  //                   <div className="col-sm-3">
  //                     <SelectBox
  //                       className="required-fields"
  //                       options={NO_OF_SLIDES}
  //                       lable="Number of Casset"
  //                       id="NoOfCasset"
  //                       name="NoOfCasset"
  //                       value={payload2?.NoOfCasset}
  //                       onChange={handleChange2}
  //                     />
  //                   </div>
  //                 </>
  //               )}
  //               <div className="col-sm-3">
  //                 <Input
  //                   type="text"
  //                   name="histoNo"
  //                   id="histoNo"
  //                   lable="Histo No."
  //                   placeholder=""
  //                   value={histoNo}
  //                   disabled={data?.Hno ? true : false}
  //                   onChange={handleHistoChange}
  //                 />
  //               </div>
  //               <div className="col-sm-auto mb-1">
  //                 {/* <button
  //                   className="btn btn-sm btn-block btn-success w-50"
  //                   onClick={() => handleCreate()}
  //                 >
  //                   {t("Make")}
  //                 </button> */}
  //                 <CustomButton
  //                   text={t("Make")}
  //                   icon={"add"}
  //                   onClick={() => handleCreate()}
  //                 />
  //               </div>
  //             </div>
  //             <div className="row p-2">
  //               <div className="col-sm-12">
  //                 <Tables>
  //                   <thead>
  //                     <tr>
  //                       <th>S No.</th>
  //                       <th>Sec No.</th>
  //                       <th>Block ID</th>
  //                       <th>Comment</th>
  //                       <th>Action</th>
  //                     </tr>
  //                   </thead>
  //                   <tbody>
  //                     {tableData?.map((row, index) => (
  //                       <tr key={index}>
  //                         <td>{index + 1}</td>
  //                         <td>
  //                           {/* <input
  //                             type="text"
  //                             value={row.secNo}
  //                             onChange={(e) => handleSecNoChange(e, index)} // Handling changes for Sec No.
  //                             placeholder="Enter Sec No"
  //                           /> */}
  //                         </td>
  //                         <td>{row.blockId}</td>
  //                         <td>
  //                           <input
  //                             type="text"
  //                             className="select-input-box form-control input-sm"
  //                             value={row.comment}
  //                             onChange={(e) => handleCommentChange(e, index)}
  //                             placeholder="Enter Comment"
  //                           />
  //                         </td>
  //                         <td>
  //                           {/* <button
  //                             className="btn btn-sm btn-block btn-danger w-25"
  //                             onClick={() => handleDelete(index)}
  //                           >
  //                             <i className="pi pi-times" />
  //                           </button> */}
  //                           <CustomButton
  //                             icon={"cancel"}
  //                             onClick={() => handleDelete(index)}
  //                           />
  //                         </td>
  //                       </tr>
  //                     ))}
  //                   </tbody>
  //                 </Tables>
  //               </div>
  //             </div>
  //             <div className="row px-2 mt-2 mb-1">
  //               <div className="col-sm-4">
  //                 <SelectBox
  //                   name="InvestigationTemplate"
  //                   lable="Template"
  //                   className="required-fields"
  //                   placeholderName=""
  //                   value={payload2?.InvestigationTemplate}
  //                   options={TemplateData}
  //                   onChange={handleChange2}
  //                 />
  //               </div>
  //               <div className="col-sm-auto">
  //                 {/* <button
  //                   className="btn btn-sm btn-block btn-success w-50"
  //                   onClick={(e) => handleUseTemplate(e)}
  //                 >
  //                   {t("Use Template")}
  //                 </button> */}
  //                 <CustomButton
  //                   text={t("Use Template")}
  //                   icon={"save"}
  //                   onClick={(e) => handleUseTemplate(e)}
  //                 />
  //               </div>
  //             </div>
  //             {/* <div className="row px-2 mt-2 mb-1"> */}
  //             <div id="TemplateText">
  //               <FullTextEditor
  //                 value={editorText}
  //                 setValue={handleChangeEditor}
  //                 EditTable={Editable}
  //                 setEditTable={setEditable}
  //               />
  //             </div>
  //             {/* </div> */}
  //             <div className="row px-2 mt-2 mb-1">
  //               <div className="col-sm-auto">
  //                 {/* <button
  //                   className="btn btn-sm btn-block btn-success w-100"
  //                   onClick={() => handleSaveGrossing()}
  //                 >
  //                   {t("Save Grossing")}
  //                 </button> */}
  //                 <CustomButton
  //                   text={t("Save Grossing")}
  //                   icon={"save"}
  //                   onClick={() => handleSaveGrossing()}
  //                 />
  //               </div>
  //             </div>
  //           </>
  //         )}

  //         {/* {show && (
  //           <div>
  //             {loading.pend && <Loading />}
  //             {!loading.pend && (
  //               <div className="col-sm-2 mb-1">
  //                 <button
  //                   className="btn btn-sm btn-block btn-success"
  //                   onClick={() => handleSave(data)}
  //                 >
  //                   Save
  //                 </button>
  //               </div>
  //             )}
  //           </div>
  //         )} */}
  //       </Accordion>
  //     </>
  //   );
  // };

  //  this is assigned component 
  const GrossingDetailComponent = ({ data, show }) => {
    const [tableData, setTableData] = useState([]);
    const [histoNo, setHistoNo] = useState("");
    const [payload2, setPayload2] = useState({
      TestId: "",
      Hno: "",
      LabNo: "",
      BlockId: "",
      NoOfCasset: "",
      RangeFrom: "",
      BlockComment: "",
      GrossComment: "",
      InvestigationTemplate: "",
      HistoNo: "",
    });
    const [editorText, setEditorText] = useState("");
    const [Editable, setEditable] = useState(false);

    const handleChange2 = (e) => {
      const { name, value } = e.target;
      setPayload2({ ...payload2, [name]: value });
    };

    const handleUseTemplate = () => {
      const selected = TemplateData.find(
        (ele) => ele?.value == payload2?.InvestigationTemplate
      );
      setEditable(true);
      const grossText = selected?.gross?.replace(/\r\n/g, "\n") || "";

      setEditorText(grossText);
    };

    const handleHistoChange = (e) => {
      const { name, value } = e.target;
      if (name === "histoNo") {
        setHistoNo(value);
      }
    };

    useEffect(() => {
      if (data?.Hno) {
        setHistoNo(data.Hno);
      }
    }, [data]);

    const handleCreate = () => {
      const noOfCasset = romanToNum(payload2?.NoOfCasset);
      const rangeStart = payload2?.RangeFrom || "";

      if (!noOfCasset || !rangeStart) {
        toast.error("Please select both Alphabet Blocks and Slides");
        return;
      }

      const desiredBlockIds = [];
      if (isCompanyBaseBlockId === "pkl") {
        const startNum = romanToNum(rangeStart);
        if (startNum > 0) {
          for (let i = 0; i < noOfCasset; i++) {
            desiredBlockIds.push(toRoman(startNum + i));
          }
        }
      } else if (rangeStart.length === 1) {
        let startCharCode = rangeStart.charCodeAt(0);
        const endCharCode = 90;

        if (isCompanyBaseBlockId === "npl" && !histoNo.trim()) {
          toast.error("Please enter Histo No.");
          return;
        }

        for (let i = 0; i < noOfCasset; i++) {
          let charCode = startCharCode + i;
          if (charCode <= endCharCode) {
            const blockId =
              isCompanyBaseBlockId === "npl"
                ? histoNo + String.fromCharCode(charCode)
                : String.fromCharCode(charCode);
            desiredBlockIds.push(blockId);
          }
        }
      }

      const newRows = desiredBlockIds
        .filter((blockId) => !tableData.some((row) => row.blockId === blockId))
        .map((blockId, index) => ({
          serialNo: tableData.length + index + 1,
          secNo: "",
          blockId: blockId,
          comment: "",
        }));

      if (newRows.length > 0) {
        setTableData([...tableData, ...newRows]);
        toast.success(`${newRows.length} new IDs added.`);
      } else {
        toast.info("No new rows added (IDs might already exist).");
      }
    };

    const handleCommentChange = (e, index) => {
      const updatedTableData = [...tableData];
      updatedTableData[index].comment = e.target.value;
      setTableData(updatedTableData);
    };

    const handleDelete = (index) => {
      const updatedData = tableData.filter((_, i) => i !== index);
      setTableData(updatedData);
    };

    const handleSaveGrossing = () => {
      const noOfCasset = Number(payload2?.NoOfCasset);
      const rangeStart = payload2?.RangeFrom;
      const isPayloadValid = editorText?.trim() !== "";

      if (tableData.length === 0) {
        if (!noOfCasset) {
          toast.error("Please select Number of Casset");
          return;
        }
        if (!rangeStart) {
          toast.error("Please select Start From");
          return;
        }
        toast.error("Please create Blocks");
        return;
      }

      if (!isPayloadValid) {
        toast.error("Please add text to editor or Select Investigation Template");
        return;
      }

      const GrossDataList = tableData.map((row) => ({
        TestId: String(data?.TestID || "").trim(),
        Hno: isCompanyBaseBlockId === "npl" ? histoNo.trim() : data?.Hno?.trim(),
        LabNo: data?.LedgerTransactionNo?.trim(),
        BlockId: row?.blockId,
        BlockComment: row?.comment?.trim(),
        GrossComment: editorText,
      }));

      setLoading(true);
      axiosInstance
        .post("HistoCyto/SaveGrossData", { GrossDataList })
        .then((response) => {
          if (response?.data?.success) {
            setLoading(false);
            setSingleData({});
            toast.success(response?.data?.message);
            setTableData([]);
            getBindTemplate(data?.TestID);
            handleSearch(payload?.HistoCytoStatus);
          } else {
            toast.error(response.data?.message)
            setLoading(false);
          }
        })
        .catch((err) => {
          setLoading(false);
          console.log(err);
        });

    };

    const handleMarkComplete = () => {
      setLoading(true);
      axiosInstance
        .post("HistoCyto/MarkComplete", {
          testid: String(data?.TestID),
        })
        .then((res) => {
          setLoading(false);
          toast.success(res?.data?.message);
          setTableData([]);
          handleSearch(payload?.HistoCytoStatus);
        })
        .catch((err) => {
          setLoading(false);
          console.log(err);
        });
    };

    const handleChangeEditor = (data) => {
      setEditorText(data);
    };



    return (
      <>
        <Accordion title="Grossing Detail" defaultValue={true}>
          {show && (
            <>
              <div className="row px-2 mt-2 mb-1">
                {isCompanyBaseBlockId === "npl" ? (
                  <>
                    <div className="col-sm-3">
                      <SelectBox
                        className="required-fields"
                        options={NO_OF_SLIDES}
                        lable="Number of Casset"
                        id="NoOfCasset"
                        name="NoOfCasset"
                        value={payload2?.NoOfCasset}
                        onChange={handleChange2}
                      />
                    </div>
                    <div className="col-sm-3">
                      <SelectBox
                        className="required-fields"
                        options={CASSET_RANGE}
                        lable="Start From"
                        id="RangeFrom"
                        name="RangeFrom"
                        value={payload2?.RangeFrom}
                        onChange={handleChange2}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="col-sm-3">
                      <SelectBox
                        className="required-fields"
                        options={NoOfCassete}
                        lable="Start From"
                        id="RangeFrom"
                        name="RangeFrom"
                        value={payload2?.RangeFrom}
                        onChange={handleChange2}
                      />
                    </div>
                    <div className="col-sm-3">
                      <SelectBox
                        className="required-fields"
                        options={NO_OF_SLIDES}
                        lable="Number of Casset"
                        id="NoOfCasset"
                        name="NoOfCasset"
                        value={payload2?.NoOfCasset}
                        onChange={handleChange2}
                      />
                    </div>
                  </>
                )}
                <div className="col-sm-3">
                  <Input
                    type="text"
                    name="histoNo"
                    id="histoNo"
                    lable="Histo No."
                    placeholder=""
                    value={histoNo}
                    disabled={data?.Hno ? true : false}
                    onChange={handleHistoChange}
                  />
                </div>
                <div className="col-sm-auto mb-1">
                  <CustomButton
                    text={t("Make")}
                    icon={"add"}
                    onClick={() => handleCreate()}
                  />
                </div>
              </div>
              <div className="row p-2">
                <div className="col-sm-12">
                  <Tables>
                    <thead>
                      <tr>
                        <th>S No.</th>
                        <th>Sec No.</th>
                        <th>Block ID</th>
                        <th>Comment</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableData?.map((row, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td></td>
                          <td>{row.blockId}</td>
                          <td>
                            <input
                              type="text"
                              className="select-input-box form-control input-sm"
                              value={row.comment}
                              onChange={(e) => handleCommentChange(e, index)}
                              placeholder="Enter Comment"
                            />
                          </td>
                          <td>
                            <CustomButton
                              icon={"cancel"}
                              onClick={() => handleDelete(index)}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Tables>
                </div>
              </div>
              <div className="row px-2 mt-2 mb-1">
                <div className="col-sm-4">
                  <SelectBox
                    name="InvestigationTemplate"
                    lable="Template"
                    className="required-fields"
                    placeholderName=""
                    value={payload2?.InvestigationTemplate}
                    options={TemplateData.filter((ele) => !ele.value || !!ele.gross)}
                    onChange={handleChange2}
                  />
                </div>
                <div className="col-sm-auto">
                  <CustomButton
                    text={t("Use Template")}
                    icon={"save"}
                    onClick={(e) => handleUseTemplate(e)}
                  />
                </div>
              </div>
              <div id="TemplateText">
                <FullTextEditor
                  value={editorText}
                  setValue={handleChangeEditor}
                  EditTable={Editable}
                  setEditTable={setEditable}
                  editorHeight={150}
                />
              </div>
              <div className="row px-2 mt-2 mb-1">
                <div className="col-sm-auto">
                  <CustomButton
                    text={t("Save Grossing")}
                    icon={"save"}
                    onClick={() => handleSaveGrossing()}
                  />
                </div>
                {isCompanyBaseBlockId !== "npl" && (
                <div className="col-sm-auto">
                  <CustomButton
                    text={t("Mark Complete")}
                    icon={"check"}
                    onClick={() => handleMarkComplete()}
                  />
                </div>
                )}
              </div>
            </>
          )}
        </Accordion>
      </>
    );
  };

  //  this is grossed component

  const SlidingDetailComponent = ({ data, show }) => {
    const [tableData, setTableData] = useState([]);
    const [DetailBlock, setDetailBlock] = useState([]);
    const [StainData, setStainData] = useState([]);
    const [payload2, setPayload2] = useState({
      TestId: "",
      LabNo: "",
      BlockId: "",
      SlideNo: "",
      SlideComment: "",
      Hno: "",
      Stain: "",
      InitialJunior: "",
      InitialSenior: "",
      JuniorEmpId: 0,
      SeniorEmpId: 0,
      InvestigationTemplate: "",
    });
    const [TemplateData, setTemplateData] = useState([]);
    const [editorText, setEditorText] = useState("");
    const [Editable, setEditable] = useState(false);

    const handleChangeEditor = (data) => {
      setEditorText(data);
    };

    const handleChange2 = (e) => {
      const { name, value } = e.target;
      if (name == "JuniorEmpId") {
        const selectedDoctor = DoctorData?.find((doc) => doc.value == value);
        setPayload2((prev) => ({
          ...prev,
          JuniorEmpId: value,
          InitialJunior: selectedDoctor?.label,
        }));
      }
      if (name == "SeniorEmpId") {
        const selectedDoctor = DoctorData?.find((doc) => doc.value == value);
        setPayload2((prev) => ({
          ...prev,
          SeniorEmpId: value,
          InitialSenior: selectedDoctor?.label,
        }));
      }
      if (name === "NoOfCasset") {
        setPayload2({
          ...payload2,
          [name]: value,
          RangeFrom: "",
        });
      } else {
        setPayload2((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
    };

    const handleStainSelect = (index) => (e) => {
      const selectedStainId = e.target.value;
      const selectedStain = StainData.find(
        (stain) => stain.value == selectedStainId
      );
      setTableData((prev) =>
        prev.map((item, idx) =>
          idx === index ? { ...item, stain: selectedStain?.label || "" } : item
        )
      );
      setPayload2((prev) => ({
        ...prev,
        Stain: selectedStain?.label || "",
      }));
    };

    const getStainValue = (stainLabel) => {
      const stain = StainData.find((stain) => stain.label === stainLabel);
      return stain ? stain.value : "";
    };

    const handleSelectChange = (select, name) => {
      let val = "";
      for (let i = 0; i < select.length; i++) {
        val = val === "" ? `${select[i].value}` : `${val},${select[i].value}`;
      }
      setPayload({ ...payload, [name]: val });
    };

    const handleCreate = () => {
      const selectedBlockOption = DetailBlock.find(
        (option) => option.value === payload2?.SelectBlock
      );
      const selectBlock = selectedBlockOption?.label;

      const noOfSlides = parseInt(payload2?.NoOfSlides, 10) || 0;

      if (!selectBlock && !noOfSlides) {
        toast.error("Please select both Block and Slides");
        return;
      }
      if (!selectBlock || selectBlock === "Select") {
        toast.error("Please select Block");
        return;
      }
      if (!noOfSlides) {
        toast.error("Please select No of Slides");
        return;
      }

      const newRows = [];
      for (let i = 1; i <= noOfSlides; i++) {
        const slideNo = `${selectBlock}${String(i).padStart(2, "0")}`;
        newRows.push({
          serialNo: i,
          blockId: selectBlock,
          slideNo: slideNo,
          secNo: "",
          comment: "",
          stain: "",
        });
      }

      setTableData((prevData) => {
        const filteredData = prevData.filter(
          (row) => row.blockId !== selectBlock
        );

        return [...filteredData, ...newRows];
      });

      // toast.success(`${newRows.length} slides created successfully for block ${selectBlock}.`);
    };
    console.log({ DetailBlock })

    const handleSaveSliding = (e) => {
      const selectedBlockOption = DetailBlock.find(
        (option) => option.value === payload2?.SelectBlock
      );

      const selectBlock = selectedBlockOption?.label;
      const noOfSlides = parseInt(payload2?.NoOfSlides, 10) || 0;
      const isValidStain = tableData?.every((row) => row?.stain !== "");
      const juniorConsultant = payload2?.InitialJunior && payload2?.JuniorEmpId;
      const seniorConsultant = payload2?.InitialSenior && payload2?.SeniorEmpId;

      const selectedBlocks = DetailBlock.map((block) => block.label).filter(
        (label) => label !== "Select"
      );
      const addedBlocks = new Set(tableData.map((row) => row.blockId));
      console.log({ selectedBlocks, addedBlocks, tableData })
      const allBlocksAdded = selectedBlocks.every((block) => addedBlocks.has(block));


      if (tableData.length === 0) {
        if (!selectBlock || selectBlock === "Select") {
          toast.error("Please select Block");
          return;
        }
        if (!noOfSlides) {
          toast.error("Please select No of Slides");
          return;
        }
        toast.error("Please create Slides");
        return;
      }

      // if (!allBlocksAdded) {
      //   toast.error("Please add all blocks before saving.");
      //   return;
      // }


      if (!isValidStain) {
        toast.error("Please select Stain for all slides.");
        return;
      }

      setLoading(true);
      const SlideDataList = tableData.map((row) => ({
        TestId: String(data?.TestID),
        Hno: data?.Hno,
        LabNo: data?.LedgerTransactionNo,
        BlockId: row?.blockId,
        SlideNo: row?.slideNo,
        SlideComment: row?.comment,
        Stain: row?.stain,
      }));

      axiosInstance
        .post("HistoCyto/SaveDataSlide", {
          SlideDataList,
          InitialJunior: payload2?.InitialJunior,
          InitialSenior: payload2?.InitialSenior,
          JuniorEmpId: payload2?.JuniorEmpId,
          SeniorEmpId: payload2?.SeniorEmpId,
          grosscomment: editorText,
        })
        .then((res) => {
          setLoading(false);
          toast.success(res?.data?.message);
          setTableData([]);
          handleSearch(payload?.HistoCytoStatus)
        })
        .catch((err) => {
          setLoading(false);
          console.log(err);
        });

    };


    const getDetailBlock = () => {
      axiosInstance
        .post("HistoCyto/Getdetailblock", {
          TestId: String(data?.TestID),
        })
        .then((res) => {
          const data = res?.data?.message;
          const val = Array.isArray(data)
            ? data.map((ele) => {
              return {
                label: ele?.blockid,
                value: ele?.VALUE,
              };
            })
            : [];
          setDetailBlock([{ label: "Select", value: "" }, ...val]);
        })
        .catch((err) => console.log(err));
    };

    const handleMarkComplete = () => {
      setLoading(true);
      axiosInstance
        .post("HistoCyto/MarkComplete", {
          testid: String(data?.TestID),
        })
        .then((res) => {
          setLoading(false);
          toast.success(res?.data?.message);
          setTableData([]);
          handleSearch(payload?.HistoCytoStatus);
        })
        .catch((err) => {
          setLoading(false);
          console.log(err);
        });
    };

    const getBindStain = () => {
      axiosInstance
        .get("HistoCyto/BindStain")
        .then((res) => {
          const data = res?.data?.message;
          const val = Array.isArray(data)
            ? data.map((ele) => {
              return {
                label: ele?.OrganName,
                value: ele?.ID,
              };
            })
            : [];
          setStainData([{ label: "Select", value: "" }, ...val]);
        })
        .catch((err) => console.log(err));
    };

    const getBindTemplate = (isGrossing) => {
      axiosInstance
        .post(`HistoCyto/UseTemplateHisto?isGrossing=${isGrossing}`)
        .then((response) => {
          const data = response?.data?.message;

          const val = Array.isArray(data)
            ? data.map((element) => ({
              label: element?.Template_Name,
              value: element?.Template_ID,
              gross: element?.Gross || "",
              micro: element?.MicroScopic || "",
              impression: element?.Impression || "",
            }))
            : [];

          setTemplateData([{ label: "Select", value: "" }, ...val]);
        })
        .catch((err) => console.log(err));
    };

    const handleUseTemplate = () => {
      const selected = TemplateData.find(
        (ele) => ele?.value == payload2?.InvestigationTemplate
      );
      setEditable(true);
      const grossText = selected?.gross?.replace(/\r\n/g, "\n") || "";

      setEditorText(grossText);
    };

    useEffect(() => {
      show && getDetailBlock();
      getBindStain();
      getBindTemplate(true);
    }, []);

    useEffect(() => {

      if (!editorText || editorText.trim() === "") {
        if (data?.grosscomment) {
          const formattedText = data.grosscomment.replace(/\r\n/g, "\n");

          setEditorText(formattedText);
          setEditable(true);
        }
      }
    }, [data]);

    return (
      <>
        <Accordion
          title={t("Sliding Detail")}
          seconTitle={
            data?.grosscomment && (
              <CustomButton
                icon="eye"
                text={"Gross Comment"}
                // style={{ color: "white", border: "none", background: "transparent" }}
                onClick={(e) => {
                  e.stopPropagation();
                  setShow3({
                    modal: true,
                    data: data?.grosscomment,
                    index: -1,
                    isComment: true,
                  });
                }}
              />
            )
          }
          defaultValue={true}
        >
          <div className="row px-2 mt-2 mb-1">
            {isCompanyBaseBlockId === "npl" ? (
              <>
                <div className="col-sm-3">
                  <SelectBox
                    className="required-fields"
                    options={NO_OF_SLIDES}
                    name="NoOfSlides"
                    id="NoOfSlides"
                    lable="Number Of Slides"
                    value={payload2.NoOfSlides}
                    onChange={handleChange2}
                  />
                </div>
                <div className="col-sm-3">
                  <SelectBox
                    className="required-fields"
                    options={DetailBlock}
                    name="SelectBlock"
                    id="SelectBlock"
                    lable="Select Block"
                    value={payload2.SelectBlock}
                    onChange={handleChange2}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="col-sm-3">
                  <SelectBox
                    className="required-fields"
                    options={DetailBlock}
                    name="SelectBlock"
                    id="SelectBlock"
                    lable="Select Block"
                    value={payload2.SelectBlock}
                    onChange={handleChange2}
                  />
                </div>
                <div className="col-sm-3">
                  <SelectBox
                    className="required-fields"
                    options={NO_OF_SLIDES}
                    name="NoOfSlides"
                    id="NoOfSlides"
                    lable="Number Of Slides"
                    value={payload2.NoOfSlides}
                    onChange={handleChange2}
                  />
                </div>
              </>
            )}
            <div className="col-sm-2">
              <CustomButton
                text={t("Make")}
                icon={"add"}
                onClick={() => handleCreate()}
              />
            </div>
          </div>
          <div className="row p-2">
            <div className="col-sm-12">
              <Tables>
                <thead>
                  <tr>
                    <th>S No.</th>
                    {/* <th>HNo/CYNo</th> */}
                    <th>Sec No.</th>
                    <th>Block ID</th>
                    <th>Slide No</th>
                    <th>Comment</th>
                    <th>Stain</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row, index) => (
                    <tr key={index}>
                      <td>{row.serialNo}</td>
                      {/* <td>Future HNo/CYNo</td> */}
                      <td>
                        {/* <input
                          type="text"
                          className="form-control"
                          value={row.secNo}
                          onChange={(e) =>
                            setTableData((prev) =>
                              prev.map((item, idx) =>
                                idx === index
                                  ? { ...item, secNo: e.target.value }
                                  : item
                              )
                            )
                          }
                          placeholder="Enter Sec No"
                        /> */}
                      </td>
                      <td>{row.blockId}</td>
                      <td>{row.slideNo}</td>
                      <td>
                        <input
                          type="text"
                          className="form-control"
                          value={row.comment}
                          onChange={(e) =>
                            setTableData((prev) =>
                              prev.map((item, idx) =>
                                idx === index
                                  ? { ...item, comment: e.target.value }
                                  : item
                              )
                            )
                          }
                          placeholder="Enter Comment"
                        />
                      </td>
                      <td>
                        {/* <input
                          type="text"
                          className="form-control"
                          value={row.stain}
                          onChange={(e) =>
                            setTableData((prev) =>
                              prev.map((item, idx) =>
                                idx === index
                                  ? { ...item, stain: e.target.value }
                                  : item
                              )
                            )
                          }
                          placeholder="Enter Stain"
                        /> */}
                        <SelectBox
                          name="Stain"
                          className="required-fields"
                          id={`stain-${index}`}
                          options={StainData}
                          value={getStainValue(row.stain)}
                          onChange={handleStainSelect(index)}
                        />
                      </td>
                      <td>
                        {/* <button
                          className="btn btn-sm btn-danger"
                          onClick={() =>
                            setTableData((prev) =>
                              prev.filter((_, idx) => idx !== index)
                            )
                          }
                        >
                          <i className="pi pi-times" />
                        </button> */}
                        <CustomButton
                          icon={"cancel"}
                          onClick={() =>
                            setTableData((prev) =>
                              prev.filter((_, idx) => idx !== index)
                            )
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Tables>
            </div>
          </div>
          <div className="row px-2 mt-2 mb-1">
            <div className="col-sm-4">
              <SelectBox
                className="required-fields"
                options={DoctorData}
                value={payload2.JuniorEmpId}
                name="JuniorEmpId"
                id="JuniorEmpId"
                lable="Consultant Pathologist"
                onChange={handleChange2}
                placeholder=""
              />
            </div>
            <div className="col-sm-4">
              <SelectBox
                className="required-fields"
                options={DoctorData}
                value={payload2.SeniorEmpId}
                name="SeniorEmpId"
                id="SeniorEmpId"
                lable="Secondary Pathologist"
                onChange={handleChange2}
                placeholder=""
              />
            </div>
          </div>
          <div className="row px-2 mt-2 mb-1">
            <div className="col-sm-4">
              <SelectBox
                name="InvestigationTemplate"
                lable="Template"
                className="required-fields"
                placeholderName=""
                value={payload2?.InvestigationTemplate}
                options={TemplateData}
                onChange={handleChange2}
              />
            </div>
            <div className="col-sm-auto">
              <CustomButton
                text={t("Use Template")}
                icon={"save"}
                onClick={(e) => handleUseTemplate(e)}
              />
            </div>

          </div>
          <div id="TemplateText">
            <FullTextEditor
              value={editorText}
              setValue={handleChangeEditor}
              EditTable={Editable}
              setEditTable={setEditable}
              editorHeight={150}
            />
          </div>
          <div className="row px-2 mt-2 mb-1">
            <div className="col-sm-auto ">
              <CustomButton
                text={t("Save Sliding")}
                icon={"save"}
                onClick={() => handleSaveSliding()}
              />
            </div>
            <div className="col-sm-auto">
              <CustomButton
                text={t("Mark Complete")}
                icon={"check"}
                onClick={() => handleMarkComplete()}
              />
            </div>
          </div>

        </Accordion>
      </>
    );
  };


  const GrossingAndSlidingComponent1 = ({ data, show }) => {
    const [BlockData, setBlockData] = useState([]);
    const [StainData, setStainData] = useState([]);
    const [payload2, setPayload2] = useState({
      NoOfBlock: "",
      StartFrom: "",
      SelectBlock: "",
      NoOfSlides: "",
      DoctorID1: "",
      DoctorID2: "",
      InvestigationTemplate: "",
    });
    const [Editable, setEditable] = useState(false);
    const [editorText, setEditorText] = useState("");

    const handleChangeEditor = (data) => {
      setEditorText(data);
    };

    const handleUseTemplate = () => {
      const selected = TemplateData.find(
        (ele) => ele?.value == payload2?.InvestigationTemplate
      );
      setEditable(true);
      const grossText = selected?.gross?.replace(/\r\n/g, "\n") || "";

      setEditorText(grossText);
    };

    const handleSubmit = () => {
      if (!editorText || editorText.trim() === "") {
        toast.error("Please enter opinion");
        return;
      }
      axiosInstance.post("HistoCyto/SecondOpinionHisto", {
        TestId: String(singleData?.TestID),
        LabOpinion: String(editorText),
      })
        .then((res) => {
          toast.success(res?.data?.message);
          setEditorText("");
          handleSearch(payload?.HistoCytoStatus);
        })
        .catch((err) => {
          console.log("Error", err);
        });
    };

    const handleChange2 = (e, index) => {
      const { name, value } = e.target;

      if (name === "InvestigationTemplate") {
        setPayload2((prev) => ({
          ...prev,
          [name]: value,
        }));
        return;
      }

      // ✅ Otherwise update BlockData
      setBlockData((prev) =>
        prev.map((block, i) =>
          i === index ? { ...block, [name]: value } : block
        )
      );
    };



    const handleSelectChange = (e, index) => {
      const { name, value } = e.target;
      setBlockData((prev) =>
        prev.map((block, i) =>
          i === index ? { ...block, [name]: value } : block
        )
      );
    };

    const handleCreate = () => {
      alert("handleCreate()");
    };

    const handleMarkComplete = () => {
      setLoading(true);
      axiosInstance
        .post("HistoCyto/MarkComplete", {
          testid: String(data?.TestID),
        })
        .then((res) => {
          setLoading(false);
          toast.success(res?.data?.message);
          setBlockData([]);
          handleSearch(payload?.HistoCytoStatus);
        })
        .catch((err) => {
          setLoading(false);
          console.log(err);
        });
    };

    const handlePrintGross = () => {
      alert("handlePrintGross()");
    };

    const handlePrintLabel = () => {
      alert("handlePrintLabel()");
    };

    const testSelectBlockOptions = [
      { label: "Select", value: "" },
      { label: "A1_", value: "A1_" },
      { label: "A2_", value: "A2_" },
      { label: "A3_", value: "A3_" },
    ];

    const getBindStain = () => {
      axiosInstance
        .get("HistoCyto/BindStain")
        .then((res) => {
          const data = res?.data?.message;
          const val = Array.isArray(data) ? data.map((ele) => ({
            label: ele?.OrganName,
            value: ele?.ID,
          })) : [];
          setStainData([{ label: "Select", value: "" }, ...val]);
        })
        .catch((err) => console.log(err));
    };

    const getDetailBackDataBlock = () => {
      axiosInstance
        .post("HistoCyto/getdetailBackDataBlock", {
          TestId: String(data?.TestID),
        })
        .then((res) => {
          const responseData = res?.data?.message;
          setBlockData(Array.isArray(responseData) ? responseData : []);
        })
        .catch((err) => {
          toast.error(err?.response?.data?.message);
        });
    };

    useEffect(() => {
      if (show) {
        getDetailBackDataBlock();
        getBindStain();
      }
    }, []);

    useEffect(() => {

      if (!editorText || editorText.trim() === "") {
        if (data?.grosscomment) {
          const formattedText = data.grosscomment.replace(/\r\n/g, "\n");

          setEditorText(formattedText);
          setEditable(true);
        }
      }
    }, [data]);

    return (
      <>
        <Accordion title="Grossing and Second Opinion Detail" defaultValue={true}>
          <div className="row px-2 mt-2 mb-1">
            <div className="col-sm-4">
              <SelectBox
                options={testSelectBlockOptions}
                id="NoOfBlock"
                lable="No. of Block"
                name="NoOfBlock"
                selectedValue={payload2?.NoOfBlock}
                onChange={handleChange2}
                isDisabled={true}
              />
            </div>
            <div className="col-sm-4">
              <SelectBox
                options={CASSET_RANGE}
                name="StartFrom"
                id="StartFrom"
                lable="Start From"
                selectedValue={payload2?.StartFrom}
                onChange={handleChange2}
                isDisabled={true}
              />
            </div>
            <div className="col-sm-auto">
              <CustomButton
                text={t("Make")}
                icon={"add"}
                onClick={() => handleCreate()}
                isDisabled={true}
              />
            </div>
          </div>
          <div className="row px-2 mt-2 mb-1">
            <div className="col-sm-4">
              <SelectBox
                options={testSelectBlockOptions}
                name="SelectBlock"
                id="SelectBlock"
                lable="Select Block"
                selectedValue={payload2?.SelectBlock}
                onChange={handleChange2}
                isDisabled={true}
              />
            </div>
            <div className="col-sm-4">
              <SelectBox
                options={NO_OF_SLIDES}
                name="NoOfSlides"
                id="NoOfSlides"
                lable="No of Slides"
                selectedValue={payload2?.NoOfSlides}
                onChange={handleChange2}
                isDisabled={true}
              />
            </div>
            <div className="col-sm-2">
              <CustomButton
                text={t("Make")}
                icon={"add"}
                onClick={() => handleCreate()}
                isDisabled={true}
              />
            </div>
          </div>
          <div className="row p-2">
            <div className="col-sm-12">
              <Tables>
                <thead>
                  <tr>
                    <th>S No.</th>
                    <th>Sec No.</th>
                    <th>Block ID</th>
                    <th>Slide No</th>
                    <th>Comment</th>
                    <th>Stain</th>
                  </tr>
                </thead>
                <tbody>
                  {BlockData.map((block, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td></td>
                      <td>{block?.blockid}</td>
                      <td>{block?.slideno}</td>
                      <td>
                        <Input
                          type="text"
                          className=""
                          value={block?.slidecomment || ""}
                          name="slidecomment"
                          id="slidecomment"
                          onChange={(e) => handleChange2(e, index)}
                          placeholder=""
                          lable={t("Enter Comment")}
                        />
                      </td>
                      <td>
                        <SelectBox
                          name="Stain"
                          id="Stain"
                          options={StainData}
                          selectedValue={block?.StainId}
                          className="required-fields"
                          onChange={(e) => handleSelectChange(e, index)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Tables>
            </div>
          </div>
          <div className="row px-2 mt-2 mb-1">
            <div className="col-sm-4">
              <SelectBox
                name="InvestigationTemplate"
                lable="Template"
                className="required-fields"
                placeholderName=""
                value={payload2?.InvestigationTemplate}
                options={TemplateData}
                onChange={handleChange2}
              />
            </div>
            <div className="col-sm-auto">
              <CustomButton
                text={t("Use Template")}
                icon={"save"}
                onClick={(e) => handleUseTemplate(e)}
              />
            </div>
          </div>
          <div id="TemplateText">
            <FullTextEditor
              value={editorText}
              setValue={handleChangeEditor}
              EditTable={Editable}
              setEditTable={setEditable}
              editorHeight={150}
            />
          </div>
          <div className="row px-2 mt-2 mb-1">
            {/* ✅ Mark Complete button - FIXED (uncommented) */}
            <div className="col-sm-auto">
              <CustomButton
                text={t("Mark Complete")}
                icon={"check"}
                onClick={() => handleMarkComplete()}
              />
            </div>
            <div className="col-sm-auto">
              <CustomButton
                text={t("Second Opinion")}
                icon={"check"}
                onClick={handleSubmit}
              />
            </div>
            {/* <div className="col-sm-auto">
              <CustomButton
                text={t("Print Gross Label")}
                icon={"print"}
                onClick={() => handlePrintGross()}
              />
            </div> */}
            {/* <div className="col-sm-auto">
              <CustomButton
                text={t("Print Slide Label")}
                icon={"print"}
                onClick={() => handlePrintLabel()}
              />
            </div> */}
          </div>
        </Accordion>
      </>
    );
  };

  const GrossingAndSlidingComponent4 = ({ data, show }) => {
    const [BlockData, setBlockData] = useState([]);
    const [StainData, setStainData] = useState([]);
    const [payload2, setPayload2] = useState({
      NoOfBlock: "",
      StartFrom: "",
      SelectBlock: "",
      NoOfSlides: "",
      DoctorID1: "",
      DoctorID2: "",
    });

    // const handleChange2 = (e) => {
    //   const { name, value } = e.target;
    //   setPayload2((prev) => ({
    //     ...prev,
    //     [name]: value,
    //   }));
    // };

    console.log({ BlockData })

    const handleChange2 = (e, index) => {
      const { name, value } = e.target;

      setBlockData((prev) =>
        prev.map((block, i) =>
          i === index ? { ...block, [name]: value } : block
        )
      );
    };

    const handleSelectChange = (e, index) => {
      const { name, value } = e.target;
      setBlockData((prev) =>
        prev.map((block, i) =>
          i === index ? { ...block, [name]: value } : block
        )
      );
    };

    const handleCreate = () => {
      alert("handleCreate()");
    };

    const handleMarkComplete = () => {
      setLoading(true);
      axiosInstance
        .post("HistoCyto/MarkComplete", {
          testid: String(data?.TestID),
        })
        .then((res) => {
          setLoading(false);
          toast.success(res?.data?.message);
          setBlockData([]);
          handleSearch(payload?.HistoCytoStatus)
        })
        .catch((err) => {
          setLoading(false);
          console.log(err);
        });
    };

    console.log({ BlockData })
    const handlePrintGross = () => {
      alert("handlePrintGross()");
    };

    const handlePrintLabel = () => {
      alert("handlePrintLabel()");
    };

    const testSelectBlockOptions = [
      {
        label: "Select",
        value: "",
      },
      {
        label: "A1_",
        value: "A1_",
      },
      {
        label: "A2_",
        value: "A2_",
      },
      {
        label: "A3_",
        value: "A3_",
      },
    ];

    const getBindStain = () => {
      axiosInstance
        .get("HistoCyto/BindStain")
        .then((res) => {
          const data = res?.data?.message;
          const val = Array.isArray(data)
            ? data.map((ele) => {
              return {
                label: ele?.OrganName,
                value: ele?.ID,
              };
            })
            : [];
          setStainData([{ label: "Select", value: "" }, ...val]);
        })
        .catch((err) => console.log(err));
    };

    const getDetailBackDataBlock = () => {
      axiosInstance
        .post("HistoCyto/getdetailBackDataBlock", {
          TestId: String(data?.TestID),
        })
        .then((res) => {
          const data = res?.data?.message;
          setBlockData(Array.isArray(data) ? data : []);
        })
        .catch((err) => {
          toast.error(err?.response?.data?.message);
        });
    };

    useEffect(() => {
      if (show) {
        getDetailBackDataBlock();
        getBindStain();
      }
    }, []);

    return (
      <>
        <Accordion title="Second Opinion and Sliding Detail" defaultValue={true}>
          <div className="row px-2 mt-2 mb-1">
            <div className="col-sm-4">
              <SelectBox
                options={testSelectBlockOptions}
                id="NoOfBlock"
                lable="No. of Block"
                name="NoOfBlock"
                selectedValue={payload2?.NoOfBlock}
                onChange={handleChange2}
                isDisabled={true}
              />
            </div>
            <div className="col-sm-4">
              <SelectBox
                options={CASSET_RANGE}
                name="StartFrom"
                id="StartFrom"
                lable="Start From"
                selectedValue={payload2?.StartFrom}
                onChange={handleChange2}
                isDisabled={true}
              />
            </div>
            <div className="col-sm-4">
              <SelectBox
                options={testSelectBlockOptions}
                id="NoOfBlock"
                lable="No. of Block"
                name="NoOfBlock"
                selectedValue={payload2?.NoOfBlock}
                onChange={handleChange2}
                isDisabled={true}
              />
            </div>
            <div className="col-sm-auto">
              {/* <button
                className="btn btn-sm btn-block btn-success"
                onClick={() => handleCreate()}
                disabled={true}
              >
                {t("Make")}
              </button> */}
              <CustomButton
                text={t("Make")}
                icon={"add"}
                onClick={() => handleCreate()}
                isDisabled={true}
              />
            </div>
          </div>
          <div className="row px-2 mt-2 mb-1">
            <div className="col-sm-4">
              <SelectBox
                options={testSelectBlockOptions}
                name="SelectBlock"
                id="SelectBlock"
                lable="Select Block"
                selectedValue={payload2?.SelectBlock}
                onChange={handleChange2}
                isDisabled={true}
              />
            </div>
            <div className="col-sm-4">
              <SelectBox
                options={NO_OF_SLIDES}
                name="NoOfSlides"
                id="NoOfSlides"
                lable="No of Slides"
                selectedValue={payload2?.NoOfSlides}
                onChange={handleChange2}
                isDisabled={true}
              />
            </div>
            <div className="col-sm-2">
              <CustomButton
                text={t("Make")}
                icon={"add"}
                onClick={() => handleCreate()}
                isDisabled={true}
              />
            </div>
          </div>
          <div className="row p-2">
            <div className="col-sm-12">
              <Tables>
                <thead>
                  <tr>
                    <th>S No.</th>
                    {/* <th>HNo/CYNo</th> */}
                    <th>Sec No.</th>
                    <th>Block ID</th>
                    <th>Slide No</th>
                    <th>Comment</th>
                    <th>Stain</th>
                  </tr>
                </thead>
                <tbody>
                  {BlockData.map((block, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      {/* <td>{block?.HNo}</td> */}
                      <td></td>
                      <td>{block?.blockid}</td>
                      <td>{block?.slideno}</td>
                      <td>
                        <Input
                          type="text"
                          className=""
                          value={block?.slidecomment || ""}
                          name="slidecomment"
                          id="slidecomment"
                          onChange={(e) => handleChange2(e, index)}
                          placeholder=""
                          lable={t("Enter Comment")}
                        />
                      </td>
                      <td>
                        <SelectBox
                          name="Stain"
                          id="Stain"
                          options={StainData}
                          selectedValue={block?.StainId}
                          className="required-fields"
                          onChange={(e) => handleSelectChange(e, index)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Tables>
            </div>
          </div>
          <div className="row px-2 mt-2 mb-1">
            <div className="col-sm-auto">
              <CustomButton
                text={t("Mark Complete")}
                icon={"check"}
                onClick={() => handleMarkComplete()}
              />
            </div>
            {/* <div className="col-sm-auto">
              <CustomButton
                text={t("Second Opinion")}
                icon={"check"}
                onClick={() => {
                  setShow4(true);
                }}
              />
            </div> */}
            <div className="col-sm-auto">
              {/* <button
                className="btn btn-block btn-sm btn-success"
                onClick={() => handlePrintGross()}
              >
                {t("Print Gross Label")}
              </button> */}
              <CustomButton
                text={t("Print Gross Label")}
                icon={"print"}
                onClick={() => handlePrintGross()}
              />
            </div>
            <div className="col-sm-auto">
              {/* <button
                className="btn btn-block btn-sm btn-success"
                onClick={() => handlePrintLabel()}
              >
                {t("Print Slide Label")}
              </button> */}
              <CustomButton
                text={t("Print Slide Label")}
                icon={"print"}
                onClick={() => handlePrintLabel()}
              />
            </div>
          </div>
        </Accordion>
      </>
    );
  };

  // const GrossingAndSlidingComponent2 = ({ data, show }) => {
  //   // const [tableData, setTableData] = useState([]);
  //   const [BlockData, setBlockData] = useState([]);
  //   const [StainData, setStainData] = useState([]);
  //   const [payload2, setPayload2] = useState({
  //     NoOfBlock: "",
  //     StartFrom: "",
  //     SelectBlock: "",
  //     NoOfSlides: "",
  //     Stain: "",
  //   });

  //   const handleChange2 = (e, index) => {
  //     const { name, value } = e.target;
  //     setPayload2((prev) => ({
  //       ...prev,
  //       [name]: value,
  //     }));

  //     setBlockData((prev) =>
  //       prev.map((block, i) =>
  //         i === index ? { ...block, [name]: value } : block
  //       )
  //     );
  //   };

  //   const handleSelectChange = (e, index) => {
  //     const { name, value } = e.target;
  //     setBlockData((prev) =>
  //       prev.map((block, i) =>
  //         i === index ? { ...block, [name]: value } : block
  //       )
  //     );
  //   };

  //   const getBindStain = () => {
  //     axiosInstance
  //       .get("HistoCyto/BindStain")
  //       .then((res) => {
  //         const data = res?.data?.message;
  //         const val = Array.isArray(data)
  //           ? data.map((ele) => {
  //             return {
  //               label: ele?.OrganName,
  //               value: ele?.ID,
  //             };
  //           })
  //           : [];
  //         setStainData([{ label: "Select", value: "" }, ...val]);
  //       })
  //       .catch((err) => console.log(err));
  //   };


  //   const getDetailBackDataBlock = () => {
  //     axiosInstance
  //       .post("HistoCyto/getdetailBackDataBlock", {
  //         TestId: String(data?.TestID),
  //       })
  //       .then((res) => {
  //         const data = res?.data?.message;
  //         setBlockData(Array.isArray(data) ? data : []);
  //       })
  //       .catch((err) => {
  //         toast.error(err?.response?.data?.message);
  //       });
  //   };

  //   useEffect(() => {
  //     if (show) {
  //       getDetailBackDataBlock();
  //       getBindStain();
  //     }
  //   }, []);

  //   const handleCreate = () => {
  //     alert("handleCreate()");
  //   };

  //   // const handleMarkComplete = () => {
  //   //   alert("handleMarkComplete()");
  //   // };

  //   const handlePrintGross = () => {
  //     alert("handlePrintGross()");
  //   };

  //   const handlePrintLabel = () => {
  //     alert("handlePrintLabel()");
  //   };

  //   const testSelectBlockOptions = [
  //     {
  //       label: "Select Block",
  //       value: "",
  //     },
  //     {
  //       label: "A1_",
  //       value: "A1_",
  //     },
  //     {
  //       label: "A2_",
  //       value: "A2_",
  //     },
  //     {
  //       label: "A3_",
  //       value: "A3_",
  //     },
  //   ];

  //   return (
  //     <>
  //       <Accordion title="Grossing and Sliding Detail" defaultValue={true}>
  //         <div className="row px-2 mt-2 mb-1">
  //           <div className="col-sm-4">
  //             <SelectBox
  //               options={testSelectBlockOptions}
  //               id="NoOfBlock"
  //               lable="No. of Block"
  //               name="NoOfBlock"
  //               selectedValue={payload2?.NoOfBlock}
  //               onChange={handleChange2}
  //               isDisabled={true}
  //             />
  //           </div>
  //           <div className="col-sm-4">
  //             <SelectBox
  //               options={CASSET_RANGE}
  //               name="StartFrom"
  //               id="StartFrom"
  //               lable="Start From"
  //               selectedValue={payload2?.StartFrom}
  //               onChange={handleChange2}
  //               isDisabled={true}
  //             />
  //           </div>
  //           <div className="col-sm-auto">
  //             {/* <button
  //               className="btn btn-sm btn-block btn-success"
  //               onClick={() => handleCreate()}
  //               disabled={true}
  //             >
  //               {t("Make")}
  //             </button> */}
  //             <CustomButton
  //               text={t("Make")}
  //               icon={"add"}
  //               onClick={() => handleCreate()}
  //               isDisabled={true}
  //             />
  //           </div>
  //         </div>
  //         <div className="row px-2 mt-2 mb-1">
  //           <div className="col-sm-4">
  //             <SelectBox
  //               options={testSelectBlockOptions}
  //               name="SelectBlock"
  //               id="SelectBlock"
  //               lable="Select Block"
  //               selectedValue={payload2?.SelectBlock}
  //               onChange={handleChange2}
  //               isDisabled={true}
  //             />
  //           </div>
  //           <div className="col-sm-4">
  //             <SelectBox
  //               options={NO_OF_SLIDES}
  //               name="NoOfSlides"
  //               id="NoOfSlides"
  //               lable="No of Slides"
  //               selectedValue={payload2?.NoOfSlides}
  //               onChange={handleChange2}
  //               isDisabled={true}
  //             />
  //           </div>
  //           <div className="col-sm-auto">
  //             {/* <button
  //               className="btn btn-sm btn-block btn-success"
  //               onClick={() => handleCreate()}
  //               disabled={true}
  //             >
  //               {t("Make")}
  //             </button> */}
  //             <CustomButton
  //               text={t("Make")}
  //               icon={"add"}
  //               onClick={() => handleCreate()}
  //               isDisabled={true}
  //             />
  //           </div>
  //         </div>
  //         <div className="row p-2">
  //           <div className="col-sm-12">
  //             <Tables>
  //               <thead>
  //                 <tr>
  //                   <th>S No.</th>
  //                   {/* <th>HNo/CYNo</th> */}
  //                   <th>Sec No.</th>
  //                   <th>Block ID</th>
  //                   <th>Slide No</th>
  //                   <th>Comment</th>
  //                   <th>Stain</th>
  //                 </tr>
  //               </thead>
  //               <tbody>
  //                 {BlockData.map((block, index) => (
  //                   <tr key={index} >
  //                     <td>{index + 1}</td>
  //                     {/* <td>{block?.HNo}</td> */}
  //                     <td></td>
  //                     <td>{block?.blockid}</td>
  //                     <td>{block?.slideno}</td>
  //                     <td>
  //                       <Input
  //                         type="text"
  //                         className=""
  //                         value={block?.slidecomment || ""}
  //                         name="slidecomment"
  //                         id="slidecomment"
  //                         onChange={(e) => handleChange2(e, index)}
  //                         placeholder=""
  //                         lable={t("Enter Comment")}
  //                         disabled={true}
  //                       />
  //                     </td>
  //                     <td>
  //                       <SelectBox
  //                         name="Stain"
  //                         id="Stain"
  //                         options={StainData}
  //                         selectedValue={block?.StainId}
  //                         className="required-fields"
  //                         onChange={(e) => handleSelectChange(e, index)}
  //                         isDisabled={true}
  //                       />
  //                     </td>
  //                   </tr>
  //                 ))}
  //               </tbody>
  //             </Tables>
  //           </div>
  //         </div>
  //         <div className="row px-2 mt-2 mb-1">
  //           <div className="col-sm-auto">
  //             {/* <button
  //               className="btn btn-block btn-sm btn-success"
  //               onClick={() => handlePrintGross()}
  //             >
  //               {t("Print Gross Label")}
  //             </button> */}
  //             <CustomButton
  //               text={t("Print Gross Label")}
  //               icon={"print"}
  //               onClick={() => handlePrintGross()}
  //             />
  //           </div>
  //           <div className="col-sm-4">
  //             <CustomButton
  //               text={t("Print Slide Label")}
  //               icon={"print"}
  //               onClick={() => handlePrintLabel()}
  //             />
  //           </div>
  //         </div>
  //       </Accordion>
  //     </>
  //   );
  // };


  const GrossingAndSlidingComponent2 = ({ data, show, showMarkComplete = false }) => {
    const [BlockData, setBlockData] = useState([]);
    const [StainData, setStainData] = useState([]);
    const [payload2, setPayload2] = useState({
      NoOfBlock: "",
      StartFrom: "",
      SelectBlock: "",
      NoOfSlides: "",
      Stain: "",
    });

    const handleChange2 = (e, index) => {
      const { name, value } = e.target;
      setPayload2((prev) => ({ ...prev, [name]: value }));
      setBlockData((prev) =>
        prev.map((block, i) =>
          i === index ? { ...block, [name]: value } : block
        )
      );
    };

    const handleSelectChange = (e, index) => {
      const { name, value } = e.target;
      setBlockData((prev) =>
        prev.map((block, i) =>
          i === index ? { ...block, [name]: value } : block
        )
      );
    };

    const getBindStain = () => {
      axiosInstance
        .get("HistoCyto/BindStain")
        .then((res) => {
          const data = res?.data?.message;
          const val = Array.isArray(data) ? data.map((ele) => ({
            label: ele?.OrganName,
            value: ele?.ID,
          })) : [];
          setStainData([{ label: "Select", value: "" }, ...val]);
        })
        .catch((err) => console.log(err));
    };

    const getDetailBackDataBlock = () => {
      axiosInstance
        .post("HistoCyto/getdetailBackDataBlock", {
          TestId: String(data?.TestID),
        })
        .then((res) => {
          const responseData = res?.data?.message;
          setBlockData(Array.isArray(responseData) ? responseData : []);
        })
        .catch((err) => {
          toast.error(err?.response?.data?.message);
        });
    };

    useEffect(() => {
      if (show) {
        getDetailBackDataBlock();
        getBindStain();
      }
    }, []);

    const handleCreate = () => {
      alert("handleCreate()");
    };

    const handleMarkComplete = () => {
      setLoading(true);
      axiosInstance
        .post("HistoCyto/MarkComplete", {
          testid: String(data?.TestID),
        })
        .then((res) => {
          setLoading(false);
          toast.success(res?.data?.message);
          setBlockData([]);
          handleSearch(payload?.HistoCytoStatus);
        })
        .catch((err) => {
          setLoading(false);
          console.log(err);
        });
    };

    const handlePrintGross = () => {
      alert("handlePrintGross()");
    };

    const handlePrintLabel = () => {
      alert("handlePrintLabel()");
    };

    const testSelectBlockOptions = [
      { label: "Select Block", value: "" },
      { label: "A1_", value: "A1_" },
      { label: "A2_", value: "A2_" },
      { label: "A3_", value: "A3_" },
    ];

    return (
      <>
        <Accordion
          title={t("Grossing and Sliding Detail")}
          seconTitle={
            data?.grosscomment && (
              <CustomButton
                icon="eye"
                className="btn-link p-0"
                style={{ color: "white", border: "none", background: "transparent" }}
                onClick={(e) => {
                  e.stopPropagation();
                  setShow3({
                    modal: true,
                    data: data?.grosscomment,
                    index: -1,
                    isComment: true,
                  });
                }}
              />
            )
          }
          defaultValue={true}
        >
          <div className="row px-2 mt-2 mb-1">
            <div className="col-sm-4">
              <SelectBox
                options={testSelectBlockOptions}
                id="NoOfBlock"
                lable="No. of Block"
                name="NoOfBlock"
                selectedValue={payload2?.NoOfBlock}
                // onChange={handleChange2}
                isDisabled={true}
              />
            </div>
            <div className="col-sm-4">
              <SelectBox
                options={CASSET_RANGE}
                name="StartFrom"
                id="StartFrom"
                lable="Start From"
                selectedValue={payload2?.StartFrom}
                // onChange={handleChange2}
                isDisabled={true}
              />
            </div>
            <div className="col-sm-auto">
              <CustomButton
                text={t("Make")}
                icon={"add"}
                // onClick={() => handleCreate()}
                isDisabled={true}
              />
            </div>
          </div>
          <div className="row px-2 mt-2 mb-1">
            <div className="col-sm-4">
              <SelectBox
                options={testSelectBlockOptions}
                name="SelectBlock"
                id="SelectBlock"
                lable="Select Block"
                selectedValue={payload2?.SelectBlock}
                onChange={handleChange2}
                isDisabled={true}
              />
            </div>
            <div className="col-sm-4">
              <SelectBox
                options={NO_OF_SLIDES}
                name="NoOfSlides"
                id="NoOfSlides"
                lable="No of Slides"
                selectedValue={payload2?.NoOfSlides}
                onChange={handleChange2}
                isDisabled={true}
              />
            </div>
            <div className="col-sm-auto">
              <CustomButton
                text={t("Make")}
                icon={"add"}
                onClick={() => handleCreate()}
                isDisabled={true}
              />
            </div>
          </div>
          <div className="row p-2">
            <div className="col-sm-12">
              <Tables>
                <thead>
                  <tr>
                    <th>S No.</th>
                    <th>Sec No.</th>
                    <th>Block ID</th>
                    <th>Slide No</th>
                    <th>Comment</th>
                    <th>Stain</th>
                  </tr>
                </thead>
                <tbody>
                  {BlockData.map((block, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td></td>
                      <td>{block?.blockid}</td>
                      <td>{block?.slideno}</td>
                      <td>
                        <Input
                          type="text"
                          className=""
                          value={block?.slidecomment || ""}
                          name="slidecomment"
                          id="slidecomment"
                          onChange={(e) => handleChange2(e, index)}
                          placeholder=""
                          lable={t("Enter Comment")}
                          disabled={true}
                        />
                      </td>
                      <td>
                        <SelectBox
                          name="Stain"
                          id="Stain"
                          options={StainData}
                          selectedValue={block?.StainId}
                          className="required-fields"
                          onChange={(e) => handleSelectChange(e, index)}
                          isDisabled={true}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Tables>
            </div>
          </div>
          <div className="row px-2 mt-2 mb-1 ml-2 font-weight-bold">
            Comments :  <span dangerouslySetInnerHTML={{ __html: data?.grosscomment }} />
          </div>
          <div className="row px-2 mt-2 mb-1">
            {showMarkComplete && (
              <div className="col-sm-auto">
                <CustomButton
                  text={t("Mark Complete")}
                  icon={"check"}
                  onClick={() => handleMarkComplete()}
                />
              </div>
            )}
            <div className="col-sm-auto">
              <CustomButton
                text={t("Print Gross Label")}
                icon={"print"}
                onClick={() => handlePrintGross()}
              />
            </div>
            <div className="col-sm-auto">
              <CustomButton
                text={t("Print Slide Label")}
                icon={"print"}
                onClick={() => handlePrintLabel()}
              />
            </div>
          </div>
        </Accordion>
      </>
    );
  };

  const handleSearchWiseDetails = (type, data) => {
    console.log({ type, data });

    switch (type) {
      case "Assigned":
        return <GrossingDetailComponent data={data} show={true} />;
      case "Grossed":
        return <SlidingDetailComponent data={data} show={true} />;
      case "Slided":
        if (isCompanyBaseBlockId === "npl") {
          return <GrossingAndSlidingComponent2 data={data} show={true} />;
        }
        return <GrossingAndSlidingComponent1 data={data} show={true} />;
      case "SecondOpinion":
        if (isCompanyBaseBlockId === "npl") {
          return <GrossingAndSlidingComponent2 data={data} show={true} />;
        }
        return <GrossingAndSlidingComponent4 data={data} show={true} />;
      case "SlideComplete":
      case "Completed":
        return <GrossingAndSlidingComponent2 data={data} show={true} />;
      case "Regrossing":
        return <GrossingDetailComponent data={data} show={true} />;
      default:
        return null;
    }
  };

  const BindApprovalDoctor = () => {
    setLoading(true);
    axiosInstance
      .post("DoctorReferal/getDoctorWithTitle")
      .then((res) => {
        setLoading(false);
        let data = res.data.message;
        let doctorData = Array.isArray(data) ? data.map((ele) => {
          return {
            value: ele?.DoctorID,
            label: ele?.DoctorName,
          };
        }) : [];
        setDoctorAdmin(doctorData);
      })
      .catch((err) => {
        setLoading(false);
        console.log(err);
      });
  };

  // const detailComponent = useMemo(() => {
  //   if (!singleData || Object.keys(singleData).length === 0) return null;

  //   const type = singleData?.HistoCytoStatus;
  //   const data = singleData;

  //   switch (type) {
  //     case "Assigned":
  //     case "Regrossing":
  //       return <GrossingDetailComponent data={data} show={true} />;
  //     case "Grossed":
  //       return <SlidingDetailComponent data={data} show={true} />;
  //     case "Slided":
  //       return isCompanyBaseBlockId === "npl"
  //         ? <GrossingAndSlidingComponent2 data={data} show={true} />
  //         : <GrossingAndSlidingComponent1 data={data} show={true} />;
  //     case "SecondOpinion":
  //       return isCompanyBaseBlockId === "npl"
  //         ? <GrossingAndSlidingComponent2 data={data} show={true} />
  //         : <GrossingAndSlidingComponent4 data={data} show={true} />;
  //     case "SlideComplete":
  //     case "Completed":
  //       return <GrossingAndSlidingComponent2 data={data} show={true} />;
  //     default:
  //       return null;
  //   }
  // }, [singleData?.TestID, singleData?.HistoCytoStatus, isCompanyBaseBlockId]);


  const detailComponent = useMemo(() => {
    if (!singleData || Object.keys(singleData).length === 0) return null;

    const type = singleData?.HistoCytoStatus;
    const data = singleData;

    switch (type) {
      case "Assigned":
      case "Regrossing":
        return <GrossingDetailComponent data={data} show={true} />;
      case "Grossed":
        return <SlidingDetailComponent data={data} show={true} />;
      case "Slided":
        return isCompanyBaseBlockId === "npl"
          ? <GrossingAndSlidingComponent2 data={data} show={true} showMarkComplete={true} />
          : <GrossingAndSlidingComponent1 data={data} show={true} />;
      case "SecondOpinion":
        return isCompanyBaseBlockId === "npl"
          ? <GrossingAndSlidingComponent2 data={data} show={true} showMarkComplete={true} />
          : <GrossingAndSlidingComponent4 data={data} show={true} />;
      case "SlideComplete":
      case "Completed":
        return <GrossingAndSlidingComponent2 data={data} show={true} showMarkComplete={false} />;
      default:
        return null;
    }
  }, [singleData?.TestID, singleData?.HistoCytoStatus, isCompanyBaseBlockId]);
  const handleChange3 = (e) => {
    const { name, value } = e.target;

    setAssignedData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveApproveDoctor = async (ledId, testId) => {
    if (
      isCompanyBaseBlockId !== "npl" &&
      (!AssignedData.AssignedDoctor ||
        AssignedData.AssignedDoctor === "" ||
        AssignedData.AssignedDoctor == 0)
    ) {
      toast.error("Please Select Doctor");
      return;
    }

    const requestBody = {
      HistoCytoPerformingDoctor: String(AssignedData.AssignedDoctor),
      HistoCytoStatus: "Assigned",
      TestID: String(testId),
      LedgerTransactionNo: String(ledId),
    };

    try {
      const res = await axiosInstance.post(
        "HistoCyto/UpdatehistoDoctorAndStatus",
        requestBody
      );

      if (res?.data?.message) {
        toast.success(res?.data?.message);
        setTableData([]);
        setSingleData({});
        setAssignedData({});
        handleSearch(payload?.HistoCytoStatus)
      } else {
        toast.error(res?.data?.message);
      }
    } catch (error) {
      // toast.error("API Error");
      console.log(error);
    }
  };
  useEffect(() => {
    BindApprovalDoctor();
  }, [])

  const handleCaptureUploadedFile = async () => {
    const payloads = {
      LedgerTransactionId: String(show3?.ledgerTransactionId),
      FileName: show3?.data,
      status: 0,
      DocumentID: 0,
    };
    try {
      const res = await axiosInstance.post(
        "/HistoTemplateMaster/SaveHistodocument",
        payloads
      );

      if (res?.data?.success) {
        toast.success("Document Saved Successfully");
        setShow3({ modal: false, data: "", index: -1, blockUpload: "", ledgerTransactionId: null });

      }
    } catch (error) {
      toast.error("Error saving document");
      setShow3({ modal: false, data: "", index: -1, blockUpload: "", ledgerTransactionId: null });
    }
  };


  const theme = useLocalStorage("theme", "get");

  return (
    <>
      {" "}
      {load ? (
        <Loading />
      ) : (
        <>
          {show2 && (
            <UploadFile
              show={show2}
              handleClose={() => setShow2(false)}
              pageName="ViewDoc"
              documentId={payload?.Doc}
            />
          )}
          {/* {show4 && (
            <HistoSecondOpinionModal
              show={show4}
              handleClose={() => setShow4(false)}
              data={singleData?.TestID}
              pageName="HistoImage"
            />
          )} */}
          {show3?.modal && (
            show3.isComment ? (
              <Dialog
                header="Gross Comment"
                visible={show3?.modal}
                style={{ width: "50vw" }}
                className={theme}
                onHide={() => setShow3({ modal: false })}
              >
                <div dangerouslySetInnerHTML={{ __html: show3.data }} />
              </Dialog>
            ) : (
              <UploadFile
                show={show3?.modal}
                handleClose={() => {
                  handleCaptureUploadedFile();
                  setShow3((prev) => ({ ...prev, modal: false }));
                }}
                documentId={show3?.data}
                pageName="HistoImage"
                blockUpload={show3.blockUpload}
              />
            )
          )}
          <Accordion
            name="Histo Cyto Grossing And Sliding"
            defaultValue={true}
            isBreadcrumb={true}
          >
            <div className="row px-2 mt-2 mb-1">
              <div className="col-sm-2">
                <SelectBox
                  name="HistoCytoStatus"
                  id="Status"
                  lable="Status"
                  options={STATUS}
                  selectedValue={payload?.HistoCytoStatus}
                  onChange={handleSelectChange}
                />
              </div>
              <div className="col-sm-2">
                <DatePicker
                  name="FromDate"
                  id="FromDate"
                  lable="From Date"
                  className="custom-calendar"
                  value={payload?.FromDate}
                  onChange={dateSelect}
                  maxDate={new Date(payload?.ToDate)}
                />
              </div>
              <div className="col-sm-2">
                <DatePicker
                  name="ToDate"
                  id="ToDate"
                  lable="To Date"
                  className="custom-calendar"
                  value={payload?.ToDate}
                  onChange={dateSelect}
                  maxDate={new Date()}
                  minDate={new Date(payload?.FromDate)}
                />
              </div>
              <div className="col-sm-2">
                <Input
                  type="text"
                  name="LedgerTransactionNo"
                  id="VisitNo"
                  lable="Visit Number"
                  placeholder=""
                  value={payload?.LedgerTransactionNo}
                  onChange={handleChange}
                />
              </div>
              <div className="col-sm-2">
                <Input
                  type="text"
                  name="BarcodeNo"
                  id="BarcodeNo"
                  lable="Barcode"
                  placeholder=""
                  value={payload?.BarcodeNo}
                  onChange={handleChange}
                />
              </div>
              <div className="col-sm-2">
                <SelectBox
                  options={AddBlankData(DepartmentData, "All Department")}
                  lable="Department"
                  id="Department"
                  selectedValue={payload.DepartmentId}
                  name="DepartmentId"
                  onChange={handleSelectChange}
                />
              </div>
            </div>
            <div className="row px-2 mb-1">
              <div className="col-sm-auto">
                {/* <button
                  className="btn btn-sm btn-success w-100"
                  onClick={() => handleSearch(payload?.HistoCytoStatus)}
                >
                  {t("Search")}
                </button> */}
                <SearchButton
                  onClick={() => handleSearch(payload?.HistoCytoStatus)}
                  text={t("Search")}
                />
              </div>
              <>
                <style>
                  {`
                    .status-filter-wrapper {
                      display: flex;
                      flex-wrap: wrap;
                      gap: 8px;
                    }

                    .status-item {
                      display: flex;
                      align-items: center;
                      padding: 4px 12px;
                      background: #ffffff;
                      border: 1px solid #e2e8f0;
                      border-radius: 20px;
                      cursor: pointer;
                      transition: all 0.2s ease;
                      box-shadow: 0 1px 2px rgba(0,0,0,0.05);
                    }

                    .status-item:hover {
                      border-color: #cbd5e1;
                      background: #f8fafc;
                      transform: translateY(-1px);
                      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                    }

                    .status-circle {
                      width: 10px;
                      height: 10px;
                      border-radius: 50%;
                      margin-right: 8px;
                      border: 1px solid rgba(0,0,0,0.05);
                    }

                    .status-text {
                      font-size: 13px;
                      font-weight: 500;
                      color: #334155;
                      margin-bottom: 0;
                      cursor: pointer;
                    }
                  `}
                </style>

                <div className="status-filter-wrapper">
                  {STATUS_BUTTON.map((ele, index) => (
                    <div
                      key={index}
                      className="status-item"
                      onClick={() => handleSearch(ele?.type)}
                    >
                      <div
                        className="status-circle"
                        style={{
                          backgroundColor: ele?.color || "#cbd5e1",
                        }}
                      />
                      <label className="status-text">
                        {t(ele?.label)}
                      </label>
                    </div>
                  ))}
                </div>
              </>
            </div>
            {console.log(tableData)}
          </Accordion>
          {
            <>
              <div className="row">
                <div className="col-sm-6">
                  {tableData.length > 0 && (
                    <>
                      <Accordion
                        title={`Total Patient : ${tableData?.length}`}
                        defaultValue={true}
                      >
                        {tableData.length > 0 ? (
                          <>
                            <Tables>
                              <thead>
                                <tr>
                                  <th>S.No</th>
                                  <th>VisitNo./LRN</th>
                                  <th>Barcode No</th>
                                  <th>Patient Name</th>
                                  <th>Test Name</th>
                                  <th>Sample Receiving Date and Time</th>
                                </tr>
                              </thead>
                              <tbody>
                                {Array.isArray(tableData) &&
                                  tableData.map((ele, index) => {
                                    const colorMapping = {
                                      "#ff00ff": "#ff89ffff", // Light Lavender for 'Completed' logic
                                      "red": "#ff96a6ff",    // Light Red for 'Regrossing/Urgent' logic
                                    };

                                    const rawColor = ele?.rowcolor?.toLowerCase();
                                    const backgroundColor = !ele?.HistoCytoStatus
                                      ? "#ffffff"
                                      : colorMapping[rawColor] || ele?.rowcolor;

                                    return (
                                      <tr
                                        key={index}
                                        style={{
                                          cursor: "pointer",
                                          background: backgroundColor,
                                          transition: "background 0.2s ease"
                                        }}
                                        onClick={() => setSingleData(ele)}
                                      >
                                        <td>{index + 1}</td>
                                        <td>{ele?.LedgerTransactionNo}</td>
                                        <td>{ele?.BarcodeNo}</td>
                                        <td>{ele?.PName}</td>
                                        <td>{ele?.TestName}</td>
                                        <td>{ele?.SampleReceiveDate}</td>
                                      </tr>
                                    );
                                  })}
                              </tbody>
                            </Tables>
                          </>
                        ) : (
                          <>
                            <NoRecordFound />
                          </>
                        )}
                      </Accordion>
                    </>
                  )}
                </div>
                {singleData && Object?.keys(singleData)?.length > 0 && (
                  <div className="col-sm-6">
                    {!loading && (
                      <Accordion title="Details" defaultValue={true}>
                        <Tables>
                          <tbody>
                            <tr className="line-height-table">
                              <td className="" style={{ fontWeight: "bold" }}>Patient Name:</td>
                              <td colSpan={3}>{singleData?.PName}</td>
                            </tr>
                            <tr className="line-height-table">
                              <td className="" style={{ fontWeight: "bold" }}>Age:</td>
                              <td>{singleData?.Age}</td>
                              <td className="" style={{ fontWeight: "bold" }}>Gender:</td>
                              <td>{singleData?.Gender}</td>
                            </tr>

                            <tr className="line-height-table">
                              <td className="" style={{ fontWeight: "bold" }}>Visit No:</td>
                              <td>{singleData?.LedgerTransactionNo}</td>
                              <td className="" style={{ fontWeight: "bold" }}>Barcode No:</td>
                              <td>{singleData?.BarcodeNo}</td>
                            </tr>

                            <tr className="line-height-table">
                              <td className="" style={{ fontWeight: "bold" }}>Test Name:</td>
                              <td colSpan={3}>{singleData?.TestName}</td>
                            </tr>

                            <tr className="line-height-table">
                              <td className="" style={{ fontWeight: "bold" }}>Sample Type:</td>
                              <td>{singleData?.SampleTypeName}</td>
                              <td className="" style={{ fontWeight: "bold" }}>Sample Info</td>
                              <td>{singleData?.SampleInfo}</td>
                            </tr>

                            <tr className="line-height-table">
                              <td className="" style={{ fontWeight: "bold" }}>
                                Sample Col. Date:
                              </td>
                              <td>{singleData?.SampleCollectionDate}</td>
                              <td className="" style={{ fontWeight: "bold" }}>
                                Sample Rec. Date:
                              </td>
                              <td>{singleData?.SampleReceiveDate}</td>
                            </tr>

                            <tr className="line-height-table">
                              <td className="" style={{ fontWeight: "bold" }}>Status:</td>
                              <td>{singleData?.HistoCytoStatus}</td>
                              <td className="" style={{ fontWeight: "bold" }}>Slide Number:</td>
                              <td>{singleData?.SlideNumber}</td>
                            </tr>

                            <tr className="line-height-table">
                              <td className="" style={{ fontWeight: "bold" }}>HNo:</td>
                              <td>{singleData?.Hno}</td>
                              <td className="" style={{ fontWeight: "bold" }}>Speciment Type:</td>
                              <td>{ }</td>
                            </tr>
                          </tbody>
                        </Tables>
                        <div className="row px-2 mt-2 mb-1">
                          <div className="col-sm-auto">
                            <CustomButton
                              text={t("View Remarks")}
                              icon={"eye"}
                              onClick={() => {
                                setShow(true);
                              }}
                            />
                          </div>
                          <div className="col-sm-auto">
                            <CustomButton
                              text={t("View Doc")}
                              icon={"eye"}
                              onClick={() => {
                                setShow2(true);
                              }}
                            />
                          </div>
                          <div className="col-sm-auto">

                            <CustomButton
                              text={t("Upload Image")}
                              icon={"upload"}
                              onClick={() => {
                                setShow3({
                                  ledgerTransactionId: singleData?.LedgerTransactionNo,
                                  modal: true,
                                  data: singleData?.HistoIDHash,
                                  index: -1,
                                  blockUpload:
                                    singleData?.Approved == 1
                                      ? true
                                      : false,
                                })
                              }}
                            />
                          </div>
                          {(singleData?.HistoCytoStatus === "SlideComplete" && singleData?.Approved === 0) && <div className="col-sm-2">
                            {/* <button
                              className="btn btn-sm btn-success w-100"
                              onClick={() => {
                                handleRegrossing()
                              }}
                            >
                              {t("Regrossing")}
                            </button> */}
                            <CustomButton
                              text={t("Regrossing")}
                              icon={"edit"}
                              onClick={() => {
                                handleRegrossing()
                              }}
                            />
                          </div>}
                        </div>
                        <div className="row px-2 mt-2 mb-1">
                          {/* {doctors added} */}
                          {singleData?.HistoCytoStatus === "" && <>  <div className="col-sm-4">
                            <SelectBox
                              options={[
                                { label: "Select Doctor", value: "0" },
                                ...doctorAdmin,
                              ]}
                              selectedValue={AssignedData?.AssignedDoctor}
                              id="AssignedDoctor"
                              lable="Doctor"
                              name="AssignedDoctor"
                              onChange={handleChange3}
                            />
                          </div>
                            <div className="col-sm-auto">
                              {/* <button
                              className="btn btn-sm btn-success w-100"
                              onClick={()=>handleSaveApproveDoctor(singleData?.LedgerTransactionNo,singleData?.TestID)}
                            >
                              {t("Save Doctor")}
                            </button> */}
                              <CustomButton
                                text={t("Save Doctor")}
                                icon={"save"}
                                onClick={() => handleSaveApproveDoctor(singleData?.LedgerTransactionNo, singleData?.TestID)}
                              />
                            </div></>}
                        </div>
                        {/* <div className="mt-3">
                          {handleSearchWiseDetails(
                            singleData?.HistoCytoStatus,
                            singleData
                          )}
                        </div> */}
                        <div className="mt-3">
                          {detailComponent}
                        </div>
                        {loading && <Loading />}
                      </Accordion>
                    )}
                    {loading && <Loading />}
                  </div>
                )}
              </div>
            </>
          }
        </>
      )}
    </>
  );
};

export default HistoCytoGrossingAndSliding;
