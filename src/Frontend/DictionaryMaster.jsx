// import { useRef, useState } from "react";
// import { axiosInstance } from "../utils/axiosInstance";
// import { CustomButton } from "../components/UI/CustomButton";
// import UploadFile from "./utils/UploadFileModal/UploadFile";
// import Accordion from "../components/UI/Accordion";
// import { useTranslation } from "react-i18next";
// import { toast } from "react-toastify";
// // import Loading from "../components/loader/Loading"; // optional

// export default function DictionaryMaster() {
//     const [t] = useTranslation();

//     const [excelLoading, setExcelLoading] = useState(false);
//     const [showFileModal, setShowFileModal] = useState({
//         modal: false,
//         data: "",
//         index: -1,
//     });

//     const excelInputRef = useRef(null);

//     const handleExcelButtonClick = () => {
//         if (!excelLoading) {
//             excelInputRef.current.click();
//         }
//     };

//     const handleCaptureUploadedFile = (name, count) => {
//         if (count > 0) {
//             toast.success(`${count} file(s) linked successfully`);
//         }
//     };

//     const handleExcelFileChange = (e) => {
//         const file = e.target.files[0];
//         if (!file) return;

//         const validTypes = [
//             "application/vnd.ms-excel",
//             "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//         ];

//         if (!validTypes.includes(file.type)) {
//             toast.error("Please select a valid Excel file (.xls or .xlsx)");
//             e.target.value = "";
//             return;
//         }

//         setExcelLoading(true);

//         const reader = new FileReader();

//         reader.onload = async () => {
//             try {
//                 const base64 = reader.result.split(",")[1];

//                 const payload = {
//                     FileName: file.name,
//                     file: base64,
//                 };

//                 const res = await axiosInstance.post(
//                     "/LanguageMaster/ImportExcelData",
//                     payload
//                 );

//                 if (res?.data?.success) {
//                     toast.success(res.data.message || "Excel uploaded successfully");
//                     // getLanguage(); // call if you have listing API
//                 } else {
//                     toast.error(res?.data?.message || "Upload failed");
//                 }
//             } catch (error) {
//                 toast.error("Something went wrong while uploading Excel");
//             } finally {
//                 setExcelLoading(false);
//                 e.target.value = "";
//             }
//         };

//         reader.readAsDataURL(file);
//     };

//     return (
//         <>
//             <Accordion name={t("Dictionary Master")} defaultValue isBreadcrumb>
//                 <div className="row px-2 mt-2 mb-2 ml-2 align-items-center">
//                     <CustomButton
//                         icon={excelLoading ? "spinner fa-spin" : "upload"}
//                         text={excelLoading ? "Uploading..." : "Upload Excel"}
//                         className="mr-4"
//                         onClick={handleExcelButtonClick}
//                         disabled={excelLoading}
//                     />

//                     <input
//                         type="file"
//                         ref={excelInputRef}
//                         accept=".xls,.xlsx"
//                         style={{ display: "none" }}
//                         onChange={handleExcelFileChange}
//                     />
//                 </div>

//                 {/* Optional Full Loader */}
//                 {/* {excelLoading && <Loading />} */}

//                 {showFileModal.modal && (
//                     <UploadFile
//                         show={showFileModal.modal}
//                         handleClose={() =>
//                             setShowFileModal({ modal: false, data: "", index: -1 })
//                         }
//                         documentId={showFileModal.data}
//                         pageName="LanguageMaster"
//                         handleUploadCount={handleCaptureUploadedFile}
//                     />
//                 )}
//             </Accordion>
//         </>
//     );
// }
//second translte dictonary
// import React, { useEffect, useRef, useState } from "react";
// import Input from "../components/formComponent/Input";
// import { CustomButton, SaveButton } from "../components/UI/CustomButton";
// // import UploadFile from "./utils/UploadFileModal/UploadFile";
// import UploadFile from "./utils/UploadFileModal/UploadFile";
// import Loading from "../components/loader/Loading"; // optional
// import { useTranslation } from "react-i18next";
// import { guidNumber } from "../utils/generateGuid";
// import { toast } from "react-toastify";
// import Accordion from "../components/UI/Accordion";
// import { axiosInstance } from "../utils/axiosInstance";
// import Tables from "../components/UI/customTable";
// import Heading from "../components/UI/Heading";
// import ColorCodingSearch from "../components/ModalComponent/ColorCodingSearch";
// import FilterInput from "../components/Filter/FilterInput";

// const DictionaryMaster = () => {
//   const [t] = useTranslation();
//   const [payload, setPayload] = useState({
//     Keyword: "",
//     isActive: 1, // Default ON
//     FlagBase64: "",
//     KeywordName: "",
//   });

//   const [languageList, setLanguageList] = useState([]);
//   const [masterTableData, setMasterTableData] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [translateTable, setTranslateTable] = useState([]);
//   const [showTranslateTable, setShowTranslateTable] = useState(false);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setPayload((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleChangeSearch = (e) => {
//     const value = e.target.value.toLowerCase();
//     setSearchTerm(e.target.value);

//     if (!value) {
//       setLanguageList(masterTableData);
//       return;
//     }

//     // const searchableKeys = ["remarkType", "remark"];
//     const searchableKeys = ["KeywordName", "CreatedByName", "RequestedDate"];

//     const filtered = masterTableData?.filter((row) =>
//       searchableKeys.some((key) =>
//         String(row[key] || "")
//           .toLowerCase()
//           .includes(value),
//       ),
//     );

//     setLanguageList(filtered);
//   };

//   const colorsCodingData = [
//     { color: "#ffe58f", id: "7", labelKey: "InActive" },
//     { color: "#90EE90", id: "8", labelKey: "Active" },
//   ];

//   // Function to get row background color based on IsActive status
//   const getRowColor = (isActive) => {
//     if (isActive === 1) {
//       return "#90EE90"; // Active - Green
//     } else if (isActive === 0) {
//       return "#ffe58f"; // InActive - Yellow
//     }
//     return "transparent";
//   };

//   /* ---------------- TRANSLATE INPUT CHANGE ---------------- */

//   const handleTranslateChange = (index, value) => {
//     const updated = [...translateTable];
//     updated[index].Translate = value;
//     setTranslateTable(updated);
//   };

//   const handleSave = async () => {
//     const finalPayload = {
//       Id: 0,
//       KeywordName: payload.Keyword,
//       // Id:payload.id,
//       // Id: payload.id.toString(),
//       // FlagBase64: payload.FlagBase64,
//       IsActive: payload.isActive,
//     };

//     try {
//       const res = await axiosInstance.post(
//         "LanguageMaster/SaveCompanyDictionaryMaster",
//         finalPayload,
//       );

//       console.log("res", res);

//       if (res?.data?.success) {
//         toast.success(res.data.message);
//         setPayload({ Keyword: "", isActive: 1, KeywordName: "" }); // Reset with isActive = 1
//         getLanguage();
//       } else {
//         toast.error(res?.data?.message || "Save failed");
//       }
//     } catch (error) {
//       toast.error("Something went wrong");
//     }
//   };

//   const getLanguage = async () => {
//     try {
//       const res = await axiosInstance.get(
//         "LanguageMaster/GetCompanyDictionaryMaster",
//       );

//       if (res?.data?.success && Array.isArray(res?.data?.message)) {
//         setLanguageList(res.data.message);
//         setMasterTableData(res.data.message);
//       } else {
//         setLanguageList([]);
//       }
//     } catch (error) {
//       console.log("Error", error);
//     }
//   };

//   const getTranslate = async () => {
//     try {
//       const res = await axiosInstance.get("LanguageMaster/GetLanguages");

//       if (res?.data?.success && Array.isArray(res?.data?.message)) {
//         setTranslateTable(res.data.message);
//         // setMasterTableData(res.data.message);
//       } else {
//         setLanguageList([]);
//       }
//     } catch (error) {
//       console.log("Error", error);
//     }
//   };

//   useEffect(() => {
//     getLanguage();
//     getTranslate();
//   }, []);

//   const handleToggle = (field) => {
//     setPayload((prev) => ({
//       ...prev,
//       [field]: prev[field] === 1 ? 0 : 1,
//     }));
//   };

//   // SAFE DATE FORMAT FUNCTION (only added)
//   const safeDate = (dateObj) => {
//     if (!dateObj) return "";
//     if (typeof dateObj === "string") return dateObj;
//     if (typeof dateObj === "object" && dateObj.value) return dateObj.value;
//     return "";
//   };

//   return (
//     <>
//       <Accordion name={t("Dictionary Master")} defaultValue isBreadcrumb>
//         <div className="row justify-content-between align-items-center">
//           <div className="row px-2 mt-2 mb-2 flex-nowrap">
//             <div className="col-sm-5 ml-2">
//               <Input
//                 value={payload.Keyword}
//                 onChange={handleChange}
//                 name="Keyword"
//                 lable="Keyword"
//                 required
//               />
//             </div>

//             <div className="col-auto d-flex align-items-center justify-content-center p-2">
//               <label className="switch mb-0">
//                 <input
//                   type="checkbox"
//                   checked={payload.isActive === 1}
//                   onChange={() => handleToggle("isActive")}
//                 />
//                 <span className="slider"></span>
//               </label>
//               <strong>
//                 <span>{t("IsActive")}</span>
//               </strong>
//             </div>

//             <div className="col-auto d-flex gap-2">
//               <SaveButton text="Save" onClick={handleSave} />
//             </div>

//             <div className="col-auto d-flex gap-2">
//               <CustomButton
//                 text="Add"
//                 onClick={() => setShowTranslateTable(true)}
//               />
//             </div>
//           </div>
//         </div>
//       </Accordion>
//       {/* FIRST TABLE - SHOW ONLY AFTER ADD CLICK */}
//       {showTranslateTable && (
//         <div>
//           <Heading title={t("Dictionary Mapping")}></Heading>
//           <Tables className="table table-bordered table-hover">
//             <thead>
//               <tr>
//                 <th>S.No</th>
//                 <th>Dictornary</th>
//                 <th>Translate</th>
//               </tr>
//             </thead>

//             <tbody>
//               {translateTable?.map((item, index) => (
//                 <tr key={index}>
//                   <td>{index + 1}</td>
//                   <td>{item?.LanguageName}</td>
//                   {/* <td>{item?.Translate}</td> */}
//                   <td>
//                     <input
//                       type="text"
//                       className="custom-select-search form-control"
//                       placeholder="Translate..."
//                       id="translate"
//                       value={item?.Translate}
//                       // onChange={handleSearchChange}
//                     />
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </Tables>
//         </div>
//       )}

//       <div>
//         <Heading
//           title={t("Dictionary Master")}
//           defaultValue={true}
//           secondTitle={
//             <>
//               {colorsCodingData.map(({ color, labelKey, id }) => (
//                 <ColorCodingSearch key={id} color={color} label={t(labelKey)} />
//               ))}

//               <FilterInput
//                 value={searchTerm}
//                 onChange={handleChangeSearch}
//                 placeholder="Filter Table"
//                 className="ml-2"
//               />
//             </>
//           }
//         />

//         <Tables className="table table-bordered table-hover">
//           <thead>
//             <tr>
//               <th>S.No</th>
//               <th>Keyword</th>
//               {/* <th>Flag</th> */}
//               <th>Created By</th>
//               <th>Created Date</th>
//               <th>Last Updated By</th>
//               <th>Last Updated Date</th>
//             </tr>
//           </thead>

//           <tbody>
//             {languageList?.map((item, index) => (
//               <tr
//                 key={index}
//                 style={{ backgroundColor: getRowColor(item.IsActive) }}
//               >
//                 <td>{index + 1}</td>

//                 <td>{item?.KeywordName}</td>
//                 {/* <td>{item.flagBase64}</td> */}

//                 <td>{item?.CreatedByName}</td>

//                 {/* SAFE RENDER */}
//                 <td>{item?.RequestedDate}</td>

//                 <td>{item?.UpdatedByName || "-"}</td>

//                 {/* SAFE RENDER */}
//                 <td>{item?.dtUpdate}</td>
//               </tr>
//             ))}
//           </tbody>
//         </Tables>
//       </div>
//     </>
//   );
// };

// export default DictionaryMaster;

// import React, { useEffect, useRef, useState } from "react";
// import Input from "../components/formComponent/Input";
// import { CustomButton, SaveButton } from "../components/UI/CustomButton";
// import UploadFile from "./utils/UploadFileModal/UploadFile";
// import Loading from "../components/loader/Loading";
// import { useTranslation } from "react-i18next";
// import { guidNumber } from "../utils/generateGuid";
// import { toast } from "react-toastify";
// import Accordion from "../components/UI/Accordion";
// import { axiosInstance } from "../utils/axiosInstance";
// import Tables from "../components/UI/customTable";
// import Heading from "../components/UI/Heading";
// import ColorCodingSearch from "../components/ModalComponent/ColorCodingSearch";
// import FilterInput from "../components/Filter/FilterInput";
// import { exportToExcel, ExportToExcel } from "../utils/helpers"
// import { Dialog } from "primereact/dialog";
// import { useLocalStorage } from "../utils/hooks/useLocalStorage";
// import MultiSelectComp from '../components/formComponent/MultiSelectComp'
// import NoRecordFound from "../components/formComponent/NoRecordFound";
// import Pagination from "../Pagination/Pagination";
// import * as XLSX from "xlsx";

// const DictionaryMaster = () => {
//   const [t] = useTranslation();
//   const [dropDown, setDropDown] = useState({
//     Language: [],
//   });
//   const [payload, setPayload] = useState({
//     Keyword: "",
//     isActive: 1,
//     FlagBase64: "",
//     KeywordName: "",
//     Language: [],
//   });

//   const [languageList, setLanguageList] = useState([]);
//   const [masterTableData, setMasterTableData] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [translateTable, setTranslateTable] = useState([]);
//   // const [showTranslateTable, setShowTranslateTable] = useState(false);
//   const [dialogList, setDialoglist] = useState([])
//   const [showFlagModal, setShowFlagModal] = useState(false);
//   const [showImportModal, setShowImportModal] = useState(false);
//   const [tableData, setTableData] = useState([])
//   const [download, setDownload] = useState([])
//   const [allKeys, setAllKeys] = useState([])
//   const [pageSize, setPageSize] = useState(50);
//   const theme = useLocalStorage("theme", "get");
//   const isMobile = window.innerWidth > 768;

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setPayload((prev) => ({ ...prev, [name]: value }));
//   };

//   console.log("dropdown", dropDown)
//   //pagination
//   const [currentPage, setCurrentPage] = useState(1);
//   const rowsPerPage = 50;

//   const indexOfLastRow = currentPage * rowsPerPage;
//   const indexOfFirstRow = indexOfLastRow - rowsPerPage;

//   const currentData = download.slice(indexOfFirstRow, indexOfLastRow);

//   const totalPages = Math.ceil(download.length / rowsPerPage);

//   // reset page when new data comes
//   useEffect(() => {
//     setCurrentPage(1);
//   }, [download]);

//   //excel download 
//   const fileInputRef = useRef(null);
//   const handleFileUpload = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     const reader = new FileReader();

//     reader.onload = (evt) => {
//       const data = new Uint8Array(evt.target.result);
//       const workbook = XLSX.read(data, { type: "array" });

//       const sheetName = workbook.SheetNames[0];
//       const worksheet = workbook.Sheets[sheetName];

//       const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" }); // fill empty cells with ""

//       // Get all unique keys across all rows
//       const allKeys = Array.from(
//         new Set(
//           jsonData.flatMap((row) => Object.keys(row))
//         )
//       );

//       setDownload(jsonData);       // Bind the table to the Excel data
//       setAllKeys(allKeys);

//       toast.success("Excel imported successfully");
//     };

//     reader.readAsArrayBuffer(file);
//   };

//   console.log("Download", download)



//   const handleChangeSearch = (e) => {
//     const value = e.target.value.toLowerCase();
//     setSearchTerm(e.target.value);

//     if (!value) {
//       setLanguageList(masterTableData);
//       return;
//     }

//     const searchableKeys = ["KeywordName", "CreatedByName", "RequestedDate"];

//     const filtered = masterTableData?.filter((row) =>
//       searchableKeys.some((key) =>
//         String(row[key] || "")
//           .toLowerCase()
//           .includes(value)
//       )
//     );

//     setLanguageList(filtered);
//   };
//   const activeCount = languageList?.filter((item) => item.IsActive === 1).length || 0;
//   const inactiveCount = languageList?.filter((item) => item.IsActive === 0).length || 0;

//   const colorsCodingData = [
//     { color: "#ffe58f", id: "7", labelKey: "InActive", count: inactiveCount },
//     { color: "#90EE90", id: "8", labelKey: "Active", count: activeCount },
//   ];

//   const getRowColor = (isActive) => {
//     if (isActive === 1) return "#90EE90";
//     if (isActive === 0) return "#ffe58f";
//     return "transparent";
//   };

//   /* ---------------- TRANSLATE INPUT CHANGE ---------------- */

//   const handleTranslateChange = (index, value) => {
//     const updated = [...translateTable];
//     updated[index].Translate = value;
//     setTranslateTable(updated);
//   };

//   /* ---------------- SAVE ---------------- */

//   const handleSave = async () => {
//     const translations = translateTable.map((item) => ({
//       DictionaryId: payload.Keyword,
//       LanguageId: item.Id,
//       LanguageName: item.LanguageName,
//       TranslateText: item.Translate || "",
//     }));

//     const finalPayload = {
//       id: 0,
//       keywordName: payload.Keyword,
//       isActive: payload.isActive,
//       translations: translations,
//     };

//     try {
//       const res = await axiosInstance.post(
//         "LanguageMaster/SaveCompanyDictionaryMaster",
//         finalPayload
//       );

//       if (res?.data?.success) {
//         toast.success(res.data.message);
//         setPayload({ Keyword: "", isActive: 1, KeywordName: "" });
//         getLanguage();
//       } else {
//         toast.error(res?.data?.message || "Save failed");
//       }
//     } catch (error) {
//       toast.error("Something went wrong");
//     }
//   };

//   //dialogsave
//   const dialogSave = async () => {
//     debugger
//     try {
//       const finalPayload = download.map((item) => {
//         // extract languages dynamically
//         const languages = Object.keys(item)
//           .filter(
//             (key) =>
//               key !== "DictionaryMasterId" &&
//               key !== "DictionaryKeyword"
//           )
//           .map((langKey) => ({
//             languageName: langKey,
//             languageTranslation: item[langKey] || "",
//           }));

//         return {
//           dictionaryKeyWord: item.DictionaryKeyword,
//           languages: languages,
//         };
//       });

//       console.log("FINALsss", finalPayload);

//       const res = await axiosInstance.post(
//         "LanguageMaster/SaveCompanyLanguageDictionary",
//         finalPayload
//       );

//       if (res?.data?.success) {
//         toast.success(res.data.message);
//         setDownload([]); // optional reset
//         getLanguage();
//       } else {
//         toast.error(res?.data?.message || "Save failed");
//       }
//     } catch (error) {
//       console.log(error);
//       toast.error("Something went wrong");
//     }
//   };
//   /* ---------------- GET DICTIONARY LIST ---------------- */

//   const getLanguage = async () => {
//     try {
//       const res = await axiosInstance.get(
//         "LanguageMaster/GetCompanyDictionaryMaster"
//       );

//       if (res?.data?.success && Array.isArray(res?.data?.message)) {
//         setLanguageList(res.data.message);
//         setMasterTableData(res.data.message);
//       } else {
//         setLanguageList([]);
//       }
//     } catch (error) {
//       console.log("Error", error);
//     }
//   };

//   //mutliselct
//   // const handleMultiSelectChange = (e) => {
//   //   setPayload((prev) => ({
//   //     ...prev,
//   //     Language: e.value || [],
//   //   }));
//   // };
//   const handleImportSelectChange = (name, value) => {
//     setPayload((prev) => ({
//       ...prev,
//       [name]: value || [],
//     }));
//   };

//   console.log("payload", payload)

//   /* ---------------- GET LANGUAGES ---------------- */

//   const getTranslate = async () => {
//     try {
//       const res = await axiosInstance.get("LanguageMaster/GetLanguages");

//       if (res?.data?.success && Array.isArray(res?.data?.message)) {

//         const formatted = res.data.message.map((item) => ({
//           ...item,
//           Translate: ""
//         }));
//         setDropDown((prev) => ({
//           ...prev,
//           Language: formatted,
//         }));
//         setTranslateTable(formatted);
//       }
//     } catch (error) {
//       console.log("Error", error);
//     }
//   };

//   //dialog
//   const handleViewFlag = async (item) => {
//     try {
//       const keywordId = item.Id;

//       const res = await axiosInstance.get(
//         `LanguageMaster/GetCompanyLanguageDictionaryByDictionryId/${keywordId}`
//       );

//       if (res?.data?.success) {
//         setDialoglist(res.data.message);
//         setShowFlagModal(true);
//       }
//     } catch (error) {
//       console.log(error);
//     }
//   };
//   //download 
//   // const downloadExcel=async()=>{
//   //   try{
//   //     const LanguageIds = payload.Language;
//   //     const res = await axiosInstance.post(
//   //   `LanguageMaster/GetCompanyLanguageDictionaryByDictionryId`, {
//   //     LanguageIds
//   //   }
//   //     )
//   //     if(res?.data?.success){
//   //       setDownload(res.data.message)
//   //     }
//   //   }
//   //   catch(err){
//   //     console.log(err)
//   //   }
//   // }
//   const downloadExcel = async () => {
//     try {
//       const LanguageIds = payload.Language.map(item => item.value || item);

//       const res = await axiosInstance.post(
//         `/LanguageMaster/GetCompanyLanguageDictionaryByLanguageId`,
//         LanguageIds
//       );

//       if (res?.data?.success && Array.isArray(res.data.message)) {
//         setDownload(res.data.message);
//         toast.success("Data fetched successfully")
//       }
//     } catch (err) {
//       console.log(err);
//     }
//   };
//   useEffect(() => {
//     getLanguage();
//     getTranslate();
//   }, []);

//   const handleToggle = (field) => {
//     setPayload((prev) => ({
//       ...prev,
//       [field]: prev[field] === 1 ? 0 : 1,
//     }));
//   };

//   return (
//     <>
//       <Accordion name={t("Dictionary Master")} defaultValue isBreadcrumb>
//         <div className="row justify-content-between align-items-center">
//           <div className="row px-2 mt-2 mb-2 flex-nowrap">

//             <div className="col-sm-5 ml-2">
//               <Input
//                 value={payload.Keyword}
//                 onChange={handleChange}
//                 name="Keyword"
//                 lable="Keyword"
//                 required
//               />
//             </div>

//             <div className="col-auto d-flex align-items-center justify-content-center p-2">
//               <label className="switch mb-0">
//                 <input
//                   type="checkbox"
//                   checked={payload.isActive === 1}
//                   onChange={() => handleToggle("isActive")}
//                 />
//                 <span className="slider"></span>
//               </label>
//               <strong>
//                 <span>{t("IsActive")}</span>
//               </strong>
//             </div>

//             <div className="col-auto d-flex gap-2">
//               <SaveButton text="Save" onClick={handleSave} />
//             </div>

//             {/* <div className="col-auto d-flex gap-2">
//               <CustomButton
//                 text="Add"
//                 onClick={() => setShowTranslateTable(true)}
//               />
//             </div> */}
//             <div className="col-sm-1">
//               <CustomButton
//                 text={"Import"}
//                 icon={"excel"}
//                 type="submit"
//                 onClick={() => setShowImportModal(true)}
//               />
//             </div>

//           </div>
//         </div>
//       </Accordion>

//       {/* TABLE 1 */}


//       <div>
//         <Heading title={t("Dictionary Mapping")} />

//         <Tables className="table table-bordered table-hover"
//           tableHeight={"tableHeight"}
//           scrollView={"scrollView"}
//         >
//           <thead>
//             <tr>
//               <th>S.No</th>
//               <th>Dictornary</th>
//               <th>Translate</th>
//             </tr>
//           </thead>

//           <tbody>
//             {translateTable?.map((item, index) => (
//               <tr key={index}>
//                 <td>{index + 1}</td>

//                 <td>{item?.LanguageName}</td>

//                 <td>
//                   <input
//                     type="text"
//                     className="custom-select-search form-control mb-0"
//                     placeholder="Translate..."
//                     value={item?.Translate || ""}
//                     onChange={(e) =>
//                       handleTranslateChange(index, e.target.value)
//                     }
//                   />
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </Tables>
//       </div>


//       {/* TABLE 2 */}

//       <div
//         className="mt-2"
//       >
//         <Heading
//           title={t("Dictionary Master")}
//           defaultValue={true}
//           secondTitle={
//             <>
//               {colorsCodingData.map(({ color, labelKey, id, count }) => (
//                 <ColorCodingSearch key={id} color={color}
//                   label={`${t(labelKey)} (${count})`}
//                 />
//               ))}

//               <FilterInput
//                 value={searchTerm}
//                 onChange={handleChangeSearch}
//                 placeholder="Filter Table"
//                 className="ml-2 "
//               />
//             </>
//           }
//         />

//         <Tables className="table table-bordered table-hover"
//           tableHeight={"tableHeight"}
//           scrollView={"scrollView"}
//         >
//           <thead>
//             <tr>
//               <th>S.No</th>
//               <th>Keyword</th>
//               <th>Name</th>
//               <th>Created By</th>
//               <th>Created Date</th>
//               <th>Last Updated By</th>
//               <th>Last Updated Date</th>
//             </tr>
//           </thead>

//           <tbody>
//             {languageList?.map((item, index) => (
//               <tr
//                 key={index}
//                 style={{ backgroundColor: getRowColor(item.IsActive) }}
//               >
//                 <td>{index + 1}</td>
//                 <td>{item?.KeywordName}</td>
//                 <td>
//                   <i
//                     className="bi bi-eye-fill mb-0"
//                     style={{ cursor: "pointer", color: "#080b0e" }}
//                     onClick={() => handleViewFlag(item)}
//                   ></i>
//                 </td>
//                 <td>{item?.CreatedByName}</td>
//                 <td>{item?.RequestedDate}</td>
//                 <td>{item?.UpdatedByName || "-"}</td>
//                 <td>{item?.dtUpdate}</td>
//               </tr>
//             ))}
//           </tbody>
//         </Tables>
//       </div>

//       {/* DIALOG 1*/}

//       <Dialog
//         header="Dictionary"
//         className={theme}
//         visible={showFlagModal}
//         style={{ width: "90vw" }}
//         onHide={() => setShowFlagModal(false)}
//         modal
//       >
//         <div>
//           <Heading title={`Keyword : ${dialogList?.[0]?.DictionaryKeyword || ""}`} />
//           <Tables className="table table-bordered table-hover">
//             <thead>
//               <tr>
//                 <th>S.No</th>
//                 <th>Language</th>
//                 <th>Translate</th>
//                 <th>Created By</th>
//                 <th>Created Date</th>
//                 <th>Last Updated By</th>
//                 <th>Last Updated Date</th>
//               </tr>
//             </thead>

//             <tbody>
//               {dialogList?.map((item, index) => (
//                 <tr key={index}>
//                   <td>{index + 1}</td>
//                   <td>{item?.LanguageName}</td>
//                   <td>{item?.KeywordName}</td>
//                   <td>{item?.CreatedByName}</td>
//                   <td>{item?.RequestedDate}</td>
//                   <td>{item?.UpdatedByName || "-"}</td>
//                   <td>{item?.dtUpdate}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </Tables>
//         </div>

//       </Dialog>

//       {/* {dialog 2} */}
//       {/* <Dialog
//         header="Dictionary"
//         className={theme}
//         visible={showImportModal}
//         style={{ width: "40vw" }}
//         onHide={() => setShowImportModal(false)}
//         modal
//       >
//         <div style={{ width: "46%" }}>
//           <MultiSelectComp
//             label="Language"
//             options={dropDown.Language.map((item) => ({
//               label: item.LanguageName,
//               value: item.Id,
//             }))}

//             value={payload?.Language}
//             name="Language"
//             id="Language"
//             onChange={handleImportSelectChange}
//             lable={t("Language")}
//           />
//         </div>
//         <div className="col-sm-1 d-flex">

//           <CustomButton
//             text={"Download"}
//             icon={"Download"}
//           onClick={downloadExcel}
//           // disabled={tabledata?.length === 0 || !access}
//           />
//            <CustomButton
//                 text={"Export"}
//                 icon={"excel"}
//                 className="ml-2"
//                 onClick={() => exportToExcel(download, "dictionaryMaster")}

//               />
//         </div>
//          <div className="mt-2">
//            <Accordion title={t("Dictionary master")} defaultValue={true}>
//         {download.length > 0 ? (
//           <div className="row px-1">
//             <div className="col-12">
//               <Tables>
//                 <thead className="cf">
//                   <tr>
//                     <th>{t("S.No")}</th>
//                     <th>{t("Keyword")}</th>
//                     {download?.[0] &&
//                       Object.keys(download[0])
//                         .filter((key) => key !== "DictionaryMasterId" && key !== "DictionaryKeyword")
//                         .map((langKey) => (
//                           <th key={langKey}>{langKey}</th>
//                         ))}
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {download?.map((data, index) => (
//                     <tr key={index}>
//                       <td data-title={t("S.No")}>{index + 1}</td>
//                       <td data-title={t("Keyword")}>{data?.DictionaryKeyword}</td>
//                       {Object.keys(data)
//                         .filter((key) => key !== "DictionaryMasterId" && key !== "DictionaryKeyword")
//                         .map((langKey) => (
//                           <td key={langKey} data-title={langKey}>
//                             {data[langKey] || "-"}
//                           </td>
//                         ))}
//                     </tr>
//                   ))}
//                 </tbody>
//               </Tables>
//             </div>
//           </div>
//         ) : (
//           <NoRecordFound />
//         )}
//       </Accordion>

//             </div>

//       </Dialog> */}
//       <Dialog
//         header="Dictionary"
//         className={theme}
//         visible={showImportModal}
//         style={{ width: "75vw" }}
//         onHide={() => setShowImportModal(false)}
//         modal
//       >
//         {/* MULTISELECT */}
//         <div style={{ width: "26%" }}>
//           <MultiSelectComp
//             label="Language"
//             options={dropDown.Language.map((item) => ({
//               label: item.LanguageName,
//               value: item.Id,
//             }))}
//             value={payload?.Language || []}
//             name="Language"
//             id="Language"
//             onChange={handleImportSelectChange}
//             lable={t("Language")}
//           />
//         </div>

//         {/* BUTTONS */}
//         <div className="col-sm-1 d-flex mt-2">
//           <CustomButton
//             text={"Download"}
//             icon={"Download"}
//             onClick={downloadExcel}
//           />

//           <CustomButton
//             text={"Export"}
//             icon={"excel"}
//             className="ml-2"
//             onClick={() => exportToExcel(download, "dictionaryMaster")}
//           />
//           <>
//             <input
//               type="file"
//               accept=".xlsx, .xls"
//               ref={fileInputRef}
//               style={{ display: "none" }}
//               onChange={handleFileUpload}
//             />

//             <CustomButton
//               text={"Import"}
//               icon={"excel"}
//               className="ml-2 btn rounded"
//               onClick={() => fileInputRef.current.click()}
//             />
//           </>

//           <CustomButton
//             text={"Save"}
//             icon={"save"}
//             className="ml-2"
//             onClick={dialogSave}

//           />
//         </div>

//         {/* TABLE */}
//         <div className="mt-2">
//           <Accordion title={t("Dictionary master")} defaultValue={true}>
//             {download.length > 0 ? (
//               <div className="row px-1">
//                 <div className="col-12">
//                   <Tables style={{
//                     height: "300px",
//                     minHeight: "300px",
//                     overflowY: "scroll"
//                   }}
//                   >
//                     <thead className="cf">
//                       <tr>
//                         <th>{t("S.No")}</th>
//                         <th>{t("Keyword")}</th>

//                         {/* {download?.[0] &&
//                           Object.keys(download[0])
//                             .filter(
//                               (key) =>
//                                 key !== "DictionaryMasterId" &&
//                                 key !== "DictionaryKeyword"
//                             )
//                             .map((langKey) => (
//                               <th key={langKey}>{langKey}</th>
//                             ))} */}
//                              {allKeys
//         .filter((key) => key !== "DictionaryMasterId" && key !== "DictionaryKeyword")
//         .map((langKey) => (
//           <th key={langKey}>{langKey}</th>
//         ))}
//                       </tr>
//                     </thead>

//                     <tbody>
//                       {currentData.map((data, index) => (
//                         <tr key={index}>
//                           <td>{indexOfFirstRow + index + 1}</td>

//                           <td>{data?.DictionaryKeyword}</td>

//                           {/* {Object.keys(data)
//                             .filter(
//                               (key) =>
//                                 key !== "DictionaryMasterId" &&
//                                 key !== "DictionaryKeyword"
//                             )
//                             .map((langKey) => (
//                               <td key={langKey}>
//                                 {data[langKey] || "-"}
//                               </td>
//                             ))} */}
//                             {allKeys
//           .filter((key) => key !== "DictionaryMasterId" && key !== "DictionaryKeyword")
//           .map((langKey) => (
//             <td key={langKey}>{data[langKey] || "-"}</td>
//           ))}
//                         </tr>
//                       ))}
//                     </tbody>
//                   </Tables>

//                   {/* PAGINATION */}
//                   <div className="d-flex justify-content-end align-items-center mt-2">
//                     <Pagination
//                       className="pagination-bar"
//                       currentPage={currentPage}
//                       totalCount={download.length}
//                       pageSize={rowsPerPage}
//                       onPageChange={(page) => setCurrentPage(page)}
//                     />
//                   </div>
//                 </div>
//               </div>
//             ) : (
//               <NoRecordFound />
//             )}
//           </Accordion>
//         </div>
//       </Dialog>
//     </>
//   );
// };

// export default DictionaryMaster;


// import React, { useEffect, useRef, useState } from "react";
// import Input from "../components/formComponent/Input";
// import { CustomButton, SaveButton } from "../components/UI/CustomButton";
// import UploadFile from "./utils/UploadFileModal/UploadFile";
// import Loading from "../components/loader/Loading";
// import { useTranslation } from "react-i18next";
// import { guidNumber } from "../utils/generateGuid";
// import { toast } from "react-toastify";
// import Accordion from "../components/UI/Accordion";
// import { axiosInstance } from "../utils/axiosInstance";
// import Tables from "../components/UI/customTable";
// import Heading from "../components/UI/Heading";
// import ColorCodingSearch from "../components/ModalComponent/ColorCodingSearch";
// import FilterInput from "../components/Filter/FilterInput";
// import { exportToExcel, ExportToExcel } from "../utils/helpers"
// import { Dialog } from "primereact/dialog";
// import { useLocalStorage } from "../utils/hooks/useLocalStorage";
// import MultiSelectComp from '../components/formComponent/MultiSelectComp'
// import NoRecordFound from "../components/formComponent/NoRecordFound";
// import Pagination from "../Pagination/Pagination";
// import * as XLSX from "xlsx";

// const DictionaryMaster = () => {
//   const [t] = useTranslation();
//   const [dropDown, setDropDown] = useState({
//     Language: [],
//   });
//   const [payload, setPayload] = useState({
//     Keyword: "",
//     isActive: 1,
//     FlagBase64: "",
//     KeywordName: "",
//     Language: [],
//   });

//   const [languageList, setLanguageList] = useState([]);
//   const [masterTableData, setMasterTableData] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [translateTable, setTranslateTable] = useState([]);
//   const [dialogList, setDialoglist] = useState([])
//   const [showFlagModal, setShowFlagModal] = useState(false);
//   const [showImportModal, setShowImportModal] = useState(false);
  
//   // SEPARATE STATES FOR DOWNLOAD AND IMPORT
//   const [downloadData, setDownloadData] = useState([]);  // For API downloaded data
//   const [excelData, setExcelData] = useState([]);        // For Excel imported data
  
//   const [allKeys, setAllKeys] = useState([])
//   const [pageSize, setPageSize] = useState(50);
//   const theme = useLocalStorage("theme", "get");
//   const isMobile = window.innerWidth > 768;

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setPayload((prev) => ({ ...prev, [name]: value }));
//   };

//   console.log("dropdown", dropDown)
  
//   //pagination
//   const [currentPage, setCurrentPage] = useState(1);
//   const rowsPerPage = 50;

//   // Use excelData if available, otherwise use downloadData
//   const activeData = excelData.length > 0 ? excelData : downloadData;

//   const indexOfLastRow = currentPage * rowsPerPage;
//   const indexOfFirstRow = indexOfLastRow - rowsPerPage;

//   const currentData = activeData.slice(indexOfFirstRow, indexOfLastRow);

//   const totalPages = Math.ceil(activeData.length / rowsPerPage);

//   // reset page when new data comes
//   useEffect(() => {
//     setCurrentPage(1);
//   }, [activeData]);

//   //excel import (file upload)
//   const fileInputRef = useRef(null);
//   const handleFileUpload = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     const reader = new FileReader();

//     reader.onload = (evt) => {
//       const data = new Uint8Array(evt.target.result);
//       const workbook = XLSX.read(data, { type: "array" });

//       const sheetName = workbook.SheetNames[0];
//       const worksheet = workbook.Sheets[sheetName];

//       const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" }); // fill empty cells with ""

//       // Get all unique keys across all rows
//       const allKeys = Array.from(
//         new Set(
//           jsonData.flatMap((row) => Object.keys(row))
//         )
//       );

//       setExcelData(jsonData);       // Store in Excel state
//       setAllKeys(allKeys);

//       toast.success("Excel imported successfully");
//     };

//     reader.readAsArrayBuffer(file);
    
//     // Reset file input
//     e.target.value = null;
//   };

//   console.log("Download Data (API)", downloadData);
//   console.log("Excel Data (Imported)", excelData);

//   const handleChangeSearch = (e) => {
//     const value = e.target.value.toLowerCase();
//     setSearchTerm(e.target.value);

//     if (!value) {
//       setLanguageList(masterTableData);
//       return;
//     }

//     const searchableKeys = ["KeywordName", "CreatedByName", "RequestedDate"];

//     const filtered = masterTableData?.filter((row) =>
//       searchableKeys.some((key) =>
//         String(row[key] || "")
//           .toLowerCase()
//           .includes(value)
//       )
//     );

//     setLanguageList(filtered);
//   };
  
//   const activeCount = languageList?.filter((item) => item.IsActive === 1).length || 0;
//   const inactiveCount = languageList?.filter((item) => item.IsActive === 0).length || 0;

//   const colorsCodingData = [
//     { color: "#ffe58f", id: "7", labelKey: "InActive", count: inactiveCount },
//     { color: "#90EE90", id: "8", labelKey: "Active", count: activeCount },
//   ];

//   const getRowColor = (isActive) => {
//     if (isActive === 1) return "#90EE90";
//     if (isActive === 0) return "#ffe58f";
//     return "transparent";
//   };

//   /* ---------------- TRANSLATE INPUT CHANGE ---------------- */

//   const handleTranslateChange = (index, value) => {
//     const updated = [...translateTable];
//     updated[index].Translate = value;
//     setTranslateTable(updated);
//   };

//   /* ---------------- SAVE ---------------- */

//   const handleSave = async () => {
//     const translations = translateTable.map((item) => ({
//       DictionaryId: payload.Keyword,
//       LanguageId: item.Id,
//       LanguageName: item.LanguageName,
//       TranslateText: item.Translate || "",
//     }));

//     const finalPayload = {
//       id: 0,
//       keywordName: payload.Keyword,
//       isActive: payload.isActive,
//       translations: translations,
//     };

//     try {
//       const res = await axiosInstance.post(
//         "LanguageMaster/SaveCompanyDictionaryMaster",
//         finalPayload
//       );

//       if (res?.data?.success) {
//         toast.success(res.data.message);
//         setPayload({ Keyword: "", isActive: 1, KeywordName: "", Language: [] });
//         getLanguage();
//       } else {
//         toast.error(res?.data?.message || "Save failed");
//       }
//     } catch (error) {
//       toast.error("Something went wrong");
//     }
//   };

//   //dialogsave - Save Excel imported data
//   const dialogSave = async () => {
//     debugger
//     try {
//       // Use excelData (imported data) for saving
//       const dataToSave = excelData.length > 0 ? excelData : downloadData;
      
//       if (dataToSave.length === 0) {
//         toast.warning("No data to save");
//         return;
//       }

//       const finalPayload = dataToSave.map((item) => {
//         // extract languages dynamically
//         const languages = Object.keys(item)
//           .filter(
//             (key) =>
//               key !== "DictionaryMasterId" &&
//               key !== "DictionaryKeyword"
//           )
//           .map((langKey) => ({
//             languageName: langKey,
//             languageTranslation: item[langKey] || "",
//           }));

//         return {
//           dictionaryKeyWord: item.DictionaryKeyword,
//           languages: languages,
//         };
//       });

//       console.log("FINALsss", finalPayload);

//       const res = await axiosInstance.post(
//         "LanguageMaster/SaveCompanyLanguageDictionary",
//         finalPayload
//       );

//       if (res?.data?.success) {
//         toast.success(res.data.message);
//         // Clear both states after successful save
//         setDownloadData([]);
//         setExcelData([]);
//         setAllKeys([]);
//         setShowImportModal(false);
//         getLanguage();
//       } else {
//         toast.error(res?.data?.message || "Save failed");
//       }
//     } catch (error) {
//       console.log(error);
//       toast.error("Something went wrong");
//     }
//   };
  
//   /* ---------------- GET DICTIONARY LIST ---------------- */

//   const getLanguage = async () => {
//     try {
//       const res = await axiosInstance.get(
//         "LanguageMaster/GetCompanyDictionaryMaster"
//       );

//       if (res?.data?.success && Array.isArray(res?.data?.message)) {
//         setLanguageList(res.data.message);
//         setMasterTableData(res.data.message);
//       } else {
//         setLanguageList([]);
//       }
//     } catch (error) {
//       console.log("Error", error);
//     }
//   };

//   const handleImportSelectChange = (name, value) => {
//     setPayload((prev) => ({
//       ...prev,
//       [name]: value || [],
//     }));
//   };

//   console.log("payload", payload)

//   /* ---------------- GET LANGUAGES ---------------- */

//   const getTranslate = async () => {
//     try {
//       const res = await axiosInstance.get("LanguageMaster/GetLanguages");

//       if (res?.data?.success && Array.isArray(res?.data?.message)) {

//         const formatted = res.data.message.map((item) => ({
//           ...item,
//           Translate: ""
//         }));
//         setDropDown((prev) => ({
//           ...prev,
//           Language: formatted,
//         }));
//         setTranslateTable(formatted);
//       }
//     } catch (error) {
//       console.log("Error", error);
//     }
//   };

//   //dialog - view flag
//   const handleViewFlag = async (item) => {
//     try {
//       const keywordId = item.Id;

//       const res = await axiosInstance.get(
//         `LanguageMaster/GetCompanyLanguageDictionaryByDictionryId/${keywordId}`
//       );

//       if (res?.data?.success) {
//         setDialoglist(res.data.message);
//         setShowFlagModal(true);
//       }
//     } catch (error) {
//       console.log(error);
//     }
//   };
  
//   //download - API call to get data
//   const downloadExcel = async () => {
//     try {
//       const LanguageIds = payload.Language.map(item => item.value || item);

//       if (LanguageIds.length === 0) {
//         toast.warning("Please select at least one language");
//         return;
//       }

//       const res = await axiosInstance.post(
//         `/LanguageMaster/GetCompanyLanguageDictionaryByLanguageId`,
//         LanguageIds
//       );

//       if (res?.data?.success && Array.isArray(res.data.message)) {
//         setDownloadData(res.data.message);  // Store in download state
        
//         // Extract all unique keys from the downloaded data
//         if (res.data.message.length > 0) {
//           const keys = Array.from(
//             new Set(
//               res.data.message.flatMap((row) => Object.keys(row))
//             )
//           );
//           setAllKeys(keys);
//         }
        
//         // Clear excel data when new download happens
//         setExcelData([]);
        
//         toast.success("Data fetched successfully");
//       }
//     } catch (err) {
//       console.log(err);
//       toast.error("Failed to fetch data");
//     }
//   };
  
//   useEffect(() => {
//     getLanguage();
//     getTranslate();
//   }, []);

//   const handleToggle = (field) => {
//     setPayload((prev) => ({
//       ...prev,
//       [field]: prev[field] === 1 ? 0 : 1,
//     }));
//   };

//   return (
//     <>
//       <Accordion name={t("Dictionary Master")} defaultValue isBreadcrumb>
//         <div className="row justify-content-between align-items-center">
//           <div className="row px-2 mt-2 mb-2 flex-nowrap">

//             <div className="col-sm-5 ml-2">
//               <Input
//                 value={payload.Keyword}
//                 onChange={handleChange}
//                 name="Keyword"
//                 lable="Keyword"
//                 required
//               />
//             </div>

//             <div className="col-auto d-flex align-items-center justify-content-center p-2">
//               <label className="switch mb-0">
//                 <input
//                   type="checkbox"
//                   checked={payload.isActive === 1}
//                   onChange={() => handleToggle("isActive")}
//                 />
//                 <span className="slider"></span>
//               </label>
//               <strong>
//                 <span>{t("IsActive")}</span>
//               </strong>
//             </div>

//             <div className="col-auto d-flex gap-2">
//               <SaveButton text="Save" onClick={handleSave} />
//             </div>

//             <div className="col-sm-1">
//               <CustomButton
//                 text={"Import"}
//                 icon={"excel"}
//                 type="submit"
//                 onClick={() => setShowImportModal(true)}
//               />
//             </div>

//           </div>
//         </div>
//       </Accordion>

//       {/* TABLE 1 */}
//       <div>
//         <Heading title={t("Dictionary Mapping")} />

//         <Tables className="table table-bordered table-hover"
//           tableHeight={"tableHeight"}
//           scrollView={"scrollView"}
//         >
//           <thead>
//             <tr>
//               <th>S.No</th>
//               <th>Dictornary</th>
//               <th>Translate</th>
//             </tr>
//           </thead>

//           <tbody>
//             {translateTable?.map((item, index) => (
//               <tr key={index}>
//                 <td>{index + 1}</td>

//                 <td>{item?.LanguageName}</td>

//                 <td>
//                   <input
//                     type="text"
//                     className="custom-select-search form-control mb-0"
//                     placeholder="Translate..."
//                     value={item?.Translate || ""}
//                     onChange={(e) =>
//                       handleTranslateChange(index, e.target.value)
//                     }
//                   />
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </Tables>
//       </div>


//       {/* TABLE 2 */}
//       <div className="mt-2">
//         <Heading
//           title={t("Dictionary Master")}
//           defaultValue={true}
//           secondTitle={
//             <>
//               {colorsCodingData.map(({ color, labelKey, id, count }) => (
//                 <ColorCodingSearch key={id} color={color}
//                   label={`${t(labelKey)} (${count})`}
//                 />
//               ))}

//               <FilterInput
//                 value={searchTerm}
//                 onChange={handleChangeSearch}
//                 placeholder="Filter Table"
//                 className="ml-2 "
//               />
//             </>
//           }
//         />

//         <Tables className="table table-bordered table-hover"
//           tableHeight={"tableHeight"}
//           scrollView={"scrollView"}
//         >
//           <thead>
//             <tr>
//               <th>S.No</th>
//               <th>Keyword</th>
//               <th>Name</th>
//               <th>Created By</th>
//               <th>Created Date</th>
//               <th>Last Updated By</th>
//               <th>Last Updated Date</th>
//             </tr>
//           </thead>

//           <tbody>
//             {languageList?.map((item, index) => (
//               <tr
//                 key={index}
//                 style={{ backgroundColor: getRowColor(item.IsActive) }}
//               >
//                 <td>{index + 1}</td>
//                 <td>{item?.KeywordName}</td>
//                 <td>
//                   <i
//                     className="bi bi-eye-fill mb-0"
//                     style={{ cursor: "pointer", color: "#080b0e" }}
//                     onClick={() => handleViewFlag(item)}
//                   ></i>
//                 </td>
//                 <td>{item?.CreatedByName}</td>
//                 <td>{item?.RequestedDate}</td>
//                 <td>{item?.UpdatedByName || "-"}</td>
//                 <td>{item?.dtUpdate}</td>
//               </tr>
//             ))}
//           </tbody>
//         </Tables>
//       </div>

//       {/* DIALOG 1 - View Translations */}
//       <Dialog
//         header="Dictionary"
//         className={theme}
//         visible={showFlagModal}
//         style={{ width: "90vw" }}
//         onHide={() => setShowFlagModal(false)}
//         modal
//       >
//         <div>
//           <Heading title={`Keyword : ${dialogList?.[0]?.DictionaryKeyword || ""}`} />
//           <Tables className="table table-bordered table-hover">
//             <thead>
//               <tr>
//                 <th>S.No</th>
//                 <th>Language</th>
//                 <th>Translate</th>
//                 <th>Created By</th>
//                 <th>Created Date</th>
//                 <th>Last Updated By</th>
//                 <th>Last Updated Date</th>
//               </tr>
//             </thead>

//             <tbody>
//               {dialogList?.map((item, index) => (
//                 <tr key={index}>
//                   <td>{index + 1}</td>
//                   <td>{item?.LanguageName}</td>
//                   <td>{item?.KeywordName}</td>
//                   <td>{item?.CreatedByName}</td>
//                   <td>{item?.RequestedDate}</td>
//                   <td>{item?.UpdatedByName || "-"}</td>
//                   <td>{item?.dtUpdate}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </Tables>
//         </div>

//       </Dialog>

//       {/* DIALOG 2 - Import/Export Modal */}
//       <Dialog
//         header="Dictionary"
//         className={theme}
//         visible={showImportModal}
//         style={{ width: "75vw" }}
//         // onHide={() => {
//         //   setShowImportModal(false);
//         //   // Optional: Clear data when closing modal
//         //   setDownloadData([]);
//         //   setExcelData([]);
//         //   setAllKeys([]);
//         // }}
//         onHide={() => {
//           setShowImportModal(false);
//           // Clear all data when closing modal
//           setDownloadData([]);
//           setExcelData([]);
//           setAllKeys([]);
//           setPayload((prev) => ({ ...prev, Language: [] }));
//           setCurrentPage(1);
//         }}
//         modal
//       >
//         {/* MULTISELECT */}
//         <div style={{ width: "26%" }}>
//           <MultiSelectComp
//             label="Language"
//             options={dropDown.Language.map((item) => ({
//               label: item.LanguageName,
//               value: item.Id,
//             }))}
//             value={payload?.Language || []}
//             name="Language"
//             id="Language"
//             onChange={handleImportSelectChange}
//             lable={t("Language")}
//           />
//         </div>

//         {/* BUTTONS */}
//         <div className="col-sm-1 d-flex mt-2">
//           <CustomButton
//             text={"Download"}
//             icon={"Download"}
//             onClick={downloadExcel}
//           />

//           <CustomButton
//             text={"Export"}
//             icon={"excel"}
//             className="ml-2"
//             onClick={() => {
//               const dataToExport = excelData.length > 0 ? excelData : downloadData;
//               if (dataToExport.length === 0) {
//                 toast.warning("No data to export");
//                 return;
//               }
//               exportToExcel(dataToExport, "dictionaryMaster");
//             }}
//           />
          
//           <>
//             <input
//               type="file"
//               accept=".xlsx, .xls"
//               ref={fileInputRef}
//               style={{ display: "none" }}
//               onChange={handleFileUpload}
//             />

//             <CustomButton
//               text={"Import"}
//               icon={"excel"}
//               className="ml-2 btn rounded"
//               onClick={() => fileInputRef.current.click()}
//             />
//           </>

//           <CustomButton
//             text={"Save"}
//             icon={"save"}
//             className="ml-2"
//             onClick={dialogSave}
//           />
//         </div>

//         {/* TABLE */}
//         <div className="mt-2">
//           <Accordion title={t("Dictionary master")} defaultValue={true}>
//             {activeData.length > 0 ? (
//               <div className="row px-1">
//                 <div className="col-12">
//                   <Tables style={{
//                     height: "300px",
//                     minHeight: "300px",
//                     overflowY: "scroll"
//                   }}
//                   >
//                     <thead className="cf">
//                       <tr>
//                         <th>{t("S.No")}</th>
//                         <th>{t("Keyword")}</th>

//                         {allKeys
//                           .filter((key) => key !== "DictionaryMasterId" && key !== "DictionaryKeyword")
//                           .map((langKey) => (
//                             <th key={langKey}>{langKey}</th>
//                           ))}
//                       </tr>
//                     </thead>

//                     <tbody>
//                       {currentData.map((data, index) => (
//                         <tr key={index}>
//                           <td>{indexOfFirstRow + index + 1}</td>

//                           <td>{data?.DictionaryKeyword}</td>

//                           {allKeys
//                             .filter((key) => key !== "DictionaryMasterId" && key !== "DictionaryKeyword")
//                             .map((langKey) => (
//                               <td key={langKey}>{data[langKey] || "-"}</td>
//                             ))}
//                         </tr>
//                       ))}
//                     </tbody>
//                   </Tables>

//                   {/* PAGINATION */}
//                   <div className="d-flex justify-content-end align-items-center mt-2">
//                     <Pagination
//                       className="pagination-bar"
//                       currentPage={currentPage}
//                       totalCount={activeData.length}
//                       pageSize={rowsPerPage}
//                       onPageChange={(page) => setCurrentPage(page)}
//                     />
//                   </div>
//                 </div>
//               </div>
//             ) : (
//               <NoRecordFound />
//             )}
//           </Accordion>
//         </div>
//       </Dialog>
//     </>
//   );
// };

// export default DictionaryMaster;


import React, { useEffect, useRef, useState } from "react";
import Input from "../components/formComponent/Input";
import { CustomButton, SaveButton } from "../components/UI/CustomButton";
import UploadFile from "./utils/UploadFileModal/UploadFile";
import Loading from "../components/loader/Loading";
import { useTranslation } from "react-i18next";
import { guidNumber } from "../utils/generateGuid";
import { toast } from "react-toastify";
import Accordion from "../components/UI/Accordion";
import { axiosInstance } from "../utils/axiosInstance";
import Tables from "../components/UI/customTable";
import Heading from "../components/UI/Heading";
import ColorCodingSearch from "../components/ModalComponent/ColorCodingSearch";
import FilterInput from "../components/Filter/FilterInput";
import { exportToExcel, ExportToExcel } from "../utils/helpers"
import { Dialog } from "primereact/dialog";
import { useLocalStorage } from "../utils/hooks/useLocalStorage";
import MultiSelectComp from '../components/formComponent/MultiSelectComp'
import NoRecordFound from "../components/formComponent/NoRecordFound";
import Pagination from "../Pagination/Pagination";
import * as XLSX from "xlsx";

const DictionaryMaster = () => {
  const [t] = useTranslation();
  const [dropDown, setDropDown] = useState({
    Language: [],
  });
  const [payload, setPayload] = useState({
    Keyword: "",
    isActive: 1,
    FlagBase64: "",
    KeywordName: "",
    Language: [],
  });

  const [languageList, setLanguageList] = useState([]);
  const [masterTableData, setMasterTableData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [translateTable, setTranslateTable] = useState([]);
  const [dialogList, setDialoglist] = useState([])
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  
  // State for Excel imported data only
  const [excelData, setExcelData] = useState([]);        // For Excel imported data
  
  const [allKeys, setAllKeys] = useState([])
  const [pageSize, setPageSize] = useState(50);
  const theme = useLocalStorage("theme", "get");
  const isMobile = window.innerWidth > 768;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPayload((prev) => ({ ...prev, [name]: value }));
  };

  console.log("dropdown", dropDown)
  
  //pagination
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 50;

  // Use excelData for table display
  const activeData = excelData;

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;

  const currentData = activeData.slice(indexOfFirstRow, indexOfLastRow);

  const totalPages = Math.ceil(activeData.length / rowsPerPage);

  // reset page when new data comes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeData]);

  //excel import (file upload)
  const fileInputRef = useRef(null);
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" }); // fill empty cells with ""

      // Get all unique keys across all rows
      const allKeys = Array.from(
        new Set(
          jsonData.flatMap((row) => Object.keys(row))
        )
      );

      setExcelData(jsonData);       // Store in Excel state
      setAllKeys(allKeys);

      toast.success("Excel imported successfully");
    };

    reader.readAsArrayBuffer(file);
    
    // Reset file input
    e.target.value = null;
  };

  console.log("Excel Data (Imported)", excelData);

  const handleChangeSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(e.target.value);

    if (!value) {
      setLanguageList(masterTableData);
      return;
    }

    const searchableKeys = ["KeywordName", "CreatedByName", "RequestedDate"];

    const filtered = masterTableData?.filter((row) =>
      searchableKeys.some((key) =>
        String(row[key] || "")
          .toLowerCase()
          .includes(value)
      )
    );

    setLanguageList(filtered);
  };
  
  const activeCount = languageList?.filter((item) => item.IsActive === 1).length || 0;
  const inactiveCount = languageList?.filter((item) => item.IsActive === 0).length || 0;

  const colorsCodingData = [
    { color: "#ffe58f", id: "7", labelKey: "InActive", count: inactiveCount },
    { color: "#90EE90", id: "8", labelKey: "Active", count: activeCount },
  ];

  const getRowColor = (isActive) => {
    if (isActive === 1) return "#90EE90";
    if (isActive === 0) return "#ffe58f";
    return "transparent";
  };

  /* ---------------- TRANSLATE INPUT CHANGE ---------------- */

  const handleTranslateChange = (index, value) => {
    const updated = [...translateTable];
    updated[index].Translate = value;
    setTranslateTable(updated);
  };

  /* ---------------- SAVE ---------------- */

  const handleSave = async () => {
    const translations = translateTable.map((item) => ({
      DictionaryId: payload.Keyword,
      LanguageId: item.Id,
      LanguageName: item.LanguageName,
      TranslateText: item.Translate || "",
    }));

    const finalPayload = {
      id: 0,
      keywordName: payload.Keyword,
      isActive: payload.isActive,
      translations: translations,
    };

    try {
      const res = await axiosInstance.post(
        "LanguageMaster/SaveCompanyDictionaryMaster",
        finalPayload
      );

      if (res?.data?.success) {
        toast.success(res.data.message);
        setPayload({ Keyword: "", isActive: 1, KeywordName: "", Language: [] });
        getLanguage();
        getTranslate();
       
      } else {
        toast.error(res?.data?.message || "Save failed");
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  //dialogsave - Save Excel imported data
  const dialogSave = async () => {
    debugger
    try {
      // Use excelData (imported data) for saving
      if (excelData.length === 0) {
        toast.warning("No data to save");
        return;
      }

      const finalPayload = excelData.map((item) => {
        // extract languages dynamically
        const languages = Object.keys(item)
          .filter(
            (key) =>
              key !== "DictionaryMasterId" &&
              key !== "DictionaryKeyword"
          )
          .map((langKey) => ({
            languageName: langKey,
            languageTranslation: item[langKey] || "",
          }));

        return {
          dictionaryKeyWord: item.DictionaryKeyword,
          languages: languages,
        };
      });

      console.log("FINALsss", finalPayload);

      const res = await axiosInstance.post(
        "LanguageMaster/SaveCompanyLanguageDictionaryNew",
        finalPayload
      );

      if (res?.data?.success) {
        toast.success(res.data.message);
        // Clear excelData after successful save
        setExcelData([]);
        setAllKeys([]);
        setShowImportModal(false);
        getLanguage();
      } else {
        toast.error(res?.data?.message || "Save failed");
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };
  
  /* ---------------- GET DICTIONARY LIST ---------------- */

  const getLanguage = async () => {
    try {
      const res = await axiosInstance.get(
        "LanguageMaster/GetCompanyDictionaryMaster"
      );

      if (res?.data?.success && Array.isArray(res?.data?.message)) {
        setLanguageList(res.data.message);
        setMasterTableData(res.data.message);
      } else {
        setLanguageList([]);
      }
    } catch (error) {
      console.log("Error", error);
    }
  };

  const handleImportSelectChange = (name, value) => {
    setPayload((prev) => ({
      ...prev,
      [name]: value || [],
    }));
  };

  console.log("payload", payload)

  /* ---------------- GET LANGUAGES ---------------- */

  const getTranslate = async () => {
    try {
      const res = await axiosInstance.get("LanguageMaster/GetLanguages");

      if (res?.data?.success && Array.isArray(res?.data?.message)) {

        const formatted = res.data.message.map((item) => ({
          ...item,
          Translate: ""
        }));
        setDropDown((prev) => ({
          ...prev,
          Language: formatted,
        }));
        setTranslateTable(formatted);
      }
    } catch (error) {
      console.log("Error", error);
    }
  };

  //dialog - view flag
  const handleViewFlag = async (item) => {
    try {
      const keywordId = item.Id;

      const res = await axiosInstance.get(
        `LanguageMaster/GetCompanyLanguageDictionaryByDictionryId/${keywordId}`
      );

      if (res?.data?.success) {
        setDialoglist(res.data.message);
        setShowFlagModal(true);
      }
    } catch (error) {
      console.log(error);
    }
  };
  
  //Excel button - API call to download data directly as Excel file
  const downloadExcel = async () => {
    try {
      const LanguageIds = payload.Language.map(item => item.value || item);

      if (LanguageIds.length === 0) {
        toast.warning("Please select at least one language");
        return;
      }

      const res = await axiosInstance.post(
        `/LanguageMaster/GetCompanyLanguageDictionaryByLanguageId`,
        LanguageIds
      );

      if (res?.data?.success && Array.isArray(res.data.message)) {
        // Directly download as Excel file without showing in table
        exportToExcel(res.data.message, "dictionaryMaster");
        toast.success("Excel downloaded successfully");
      }
    } catch (err) {
      console.log(err);
      toast.error("Failed to download Excel");
    }
  };
  
  useEffect(() => {
    getLanguage();
    getTranslate();
  }, []);

  const handleToggle = (field) => {
    setPayload((prev) => ({
      ...prev,
      [field]: prev[field] === 1 ? 0 : 1,
    }));
  };

  return (
    <>
      <Accordion name={t("Dictionary Master")} defaultValue isBreadcrumb>
        <div className="row justify-content-between align-items-center">
          <div className="row px-2 mt-2 mb-2 flex-nowrap">

            <div className="col-sm-5 ml-2">
              <Input
                value={payload.Keyword}
                onChange={handleChange}
                name="Keyword"
                lable="Keyword"
                required
              />
            </div>

            <div className="col-auto d-flex align-items-center justify-content-center p-2">
              <label className="switch mb-0">
                <input
                  type="checkbox"
                  checked={payload.isActive === 1}
                  onChange={() => handleToggle("isActive")}
                />
                <span className="slider"></span>
              </label>
              <strong>
                <span>{t("IsActive")}</span>
              </strong>
            </div>

            <div className="col-auto d-flex gap-2">
              <SaveButton text="Save" onClick={handleSave} />
            </div>

            <div className="col-sm-1">
              <CustomButton
                text={"Import"}
                icon={"excel"}
                type="submit"
                onClick={() => setShowImportModal(true)}
              />
            </div>

          </div>
        </div>
      </Accordion>

      {/* TABLE 1 */}
      <div>
        <Heading title={t("Dictionary Mapping")} />

        <Tables className="table table-bordered table-hover"
          tableHeight={"tableHeight"}
          scrollView={"scrollView"}
        >
          <thead>
            <tr>
              <th>S.No</th>
              <th>Dictornary</th>
              <th>Translate</th>
            </tr>
          </thead>

          <tbody>
            {translateTable?.map((item, index) => (
              <tr key={index}>
                <td>{index + 1}</td>

                <td>{item?.LanguageName}</td>

                <td>
                  <input
                    type="text"
                    className="custom-select-search form-control mb-0"
                    placeholder="Translate..."
                    value={item?.Translate || ""}
                    onChange={(e) =>
                      handleTranslateChange(index, e.target.value)
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </Tables>
      </div>


      {/* TABLE 2 */}
      <div className="mt-2">
        <Heading
          title={t("Dictionary Master")}
          defaultValue={true}
          secondTitle={
            <>
              {colorsCodingData.map(({ color, labelKey, id, count }) => (
                <ColorCodingSearch key={id} color={color}
                  label={`${t(labelKey)} (${count})`}
                />
              ))}

              <FilterInput
                value={searchTerm}
                onChange={handleChangeSearch}
                placeholder="Filter Table"
                className="ml-2 "
              />
            </>
          }
        />

        <Tables className="table table-bordered table-hover"
          tableHeight={"tableHeight"}
          scrollView={"scrollView"}
        >
          <thead>
            <tr>
              <th>S.No</th>
              <th>Keyword</th>
              <th>Name</th>
              <th>Created By</th>
              <th>Created Date</th>
              <th>Last Updated By</th>
              <th>Last Updated Date</th>
            </tr>
          </thead>

          <tbody>
            {languageList?.map((item, index) => (
              <tr
                key={index}
                style={{ backgroundColor: getRowColor(item.IsActive) }}
              >
                <td>{index + 1}</td>
                <td>{item?.KeywordName}</td>
                <td>
                  <i
                    className="bi bi-eye-fill mb-0"
                    style={{ cursor: "pointer", color: "#080b0e" }}
                    onClick={() => handleViewFlag(item)}
                  ></i>
                </td>
                <td>{item?.CreatedByName}</td>
                <td>{item?.RequestedDate}</td>
                <td>{item?.UpdatedByName || "-"}</td>
                <td>{item?.dtUpdate}</td>
              </tr>
            ))}
          </tbody>
        </Tables>
      </div>

      {/* DIALOG 1 - View Translations */}
      <Dialog
        header="Dictionary"
        className={theme}
        visible={showFlagModal}
        style={{ width: "90vw" }}
        onHide={() => setShowFlagModal(false)}
        modal
      >
        <div>
          <Heading title={`Keyword : ${dialogList?.[0]?.DictionaryKeyword || ""}`} />
          <Tables className="table table-bordered table-hover">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Language</th>
                <th>Translate</th>
                <th>Created By</th>
                <th>Created Date</th>
                <th>Last Updated By</th>
                <th>Last Updated Date</th>
              </tr>
            </thead>

            <tbody>
              {dialogList?.map((item, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{item?.LanguageName}</td>
                  <td>{item?.KeywordName}</td>
                  <td>{item?.CreatedByName}</td>
                  <td>{item?.RequestedDate}</td>
                  <td>{item?.UpdatedByName || "-"}</td>
                  <td>{item?.dtUpdate}</td>
                </tr>
              ))}
            </tbody>
          </Tables>
        </div>

      </Dialog>

      {/* DIALOG 2 - Import/Export Modal */}
      <Dialog
        header="Dictionary"
        className={theme}
        visible={showImportModal}
        style={{ width: "75vw" }}
        onHide={() => {
          setShowImportModal(false);
          // Clear all data when closing modal
          setExcelData([]);
          setAllKeys([]);
          setPayload((prev) => ({ ...prev, Language: [] }));
          setCurrentPage(1);
        }}
        modal
      >
        {/* MULTISELECT */}
        <div style={{ width: "26%" }}>
          <MultiSelectComp
            label="Language"
            options={dropDown.Language.map((item) => ({
              label: item.LanguageName,
              value: item.Id,
            }))}
            value={payload?.Language || []}
            name="Language"
            id="Language"
            onChange={handleImportSelectChange}
            lable={t("Language")}
          />
        </div>

        {/* BUTTONS */}
        <div className="col-sm-1 d-flex mt-2">
          <CustomButton
            text={"Excel"}
            icon={"excel"}
            onClick={downloadExcel}
          />
          
          <>
            <input
              type="file"
              accept=".xlsx, .xls"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleFileUpload}
            />

            <CustomButton
              text={"Import"}
              icon={"excel"}
              className="ml-2 btn rounded"
              onClick={() => fileInputRef.current.click()}
            />
          </>

          <CustomButton
            text={"Save"}
            icon={"save"}
            className="ml-2"
            onClick={dialogSave}
          />
        </div>

        {/* TABLE */}
        <div className="mt-2">
          <Accordion title={t("Dictionary master")} defaultValue={true}>
            {activeData.length > 0 ? (
              <div className="row px-1">
                <div className="col-12">
                  <Tables style={{
                    height: "300px",
                    minHeight: "300px",
                    overflowY: "scroll"
                  }}
                  >
                    <thead className="cf">
                      <tr>
                        <th>{t("S.No")}</th>
                        <th>{t("Keyword")}</th>

                        {allKeys
                          .filter((key) => key !== "DictionaryMasterId" && key !== "DictionaryKeyword")
                          .map((langKey) => (
                            <th key={langKey}>{langKey}</th>
                          ))}
                      </tr>
                    </thead>

                    <tbody>
                      {currentData.map((data, index) => (
                        <tr key={index}>
                          <td>{indexOfFirstRow + index + 1}</td>

                          <td>{data?.DictionaryKeyword}</td>

                          {allKeys
                            .filter((key) => key !== "DictionaryMasterId" && key !== "DictionaryKeyword")
                            .map((langKey) => (
                              <td key={langKey}>{data[langKey] || "-"}</td>
                            ))}
                        </tr>
                      ))}
                    </tbody>
                  </Tables>

                  {/* PAGINATION */}
                  <div className="d-flex justify-content-end align-items-center mt-2">
                    <Pagination
                      className="pagination-bar"
                      currentPage={currentPage}
                      totalCount={activeData.length}
                      pageSize={rowsPerPage}
                      onPageChange={(page) => setCurrentPage(page)}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <NoRecordFound />
            )}
          </Accordion>
        </div>
      </Dialog>
    </>
  );
};

export default DictionaryMaster;