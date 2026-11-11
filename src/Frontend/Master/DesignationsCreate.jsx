// import React, { useEffect, useState } from "react";
// import { Link, useLocation, useNavigate } from "react-router-dom";
// import { validationForDesignations } from "../../utils/Schema";
// import { toast } from "react-toastify";
// import {
//   getChangedFlagRecords,
//   getTrimmedData,
//   handleFlagToggle,
//   normalizeFlagValues,
//   number,
// } from "../../utils/helpers";
// import { axiosInstance } from "../../utils/axiosInstance";
// import { useTranslation } from "react-i18next";
// import Accordion from "@app/components/UI/Accordion";
// import Input from "../../components/formComponent/Input";
// import Loading from "../../components/loader/Loading";
// import CustomTable from "../../components/Table/CustomTable";
// import DatePicker from "../../components/formComponent/DatePicker";
// import AutoComplete from "../../components/formComponent/AutoComplete";
// import UploadFile from "../utils/UploadFileModal/UploadFile";
// import { guidNumber } from "../../utils/generateGuid";
// import { CustomButton } from "../../components/UI/CustomButton";
// import Heading from "../../components/UI/Heading";

// const DesignationsCreate = () => {
//   const [err, setErr] = useState({});
//   const [load, setLoad] = useState(false);
//   const navigate = useNavigate();
//   const location = useLocation();
//   const navigation = useNavigate();
//   const { state } = location;
//   const [tableData, setTableData] = useState([]);
//   const [designationList, setDesignationList] = useState([]);
//   const [searchDesignationSuggestions, setSearchDesignationSuggestions] =
//     useState([]); // filtered list
//   const [selectSearchDesignation, setSelectSearchDesignation] = useState(false);
//   const [searchDesignationIndex, setSearchDesignationIndex] = useState(0);
//   const [searchDesignationPayload, setSearchDesignationPayload] = useState({
//     label: "",
//     value: null,
//     DefaultDesignationId: null,
//   });
//   console.log("State", state)

//   const [showFileModal, setShowFileModal] = useState({
//     modal: false,
//     data: "",
//     index: -1,
//   });

//   const [formData, setFormData] = useState({
//     Name: state?.data?.DesignationName ? state?.data?.DesignationName : "",
//     SequenceNo: state?.data?.SequenceNo ? state?.data?.SequenceNo : "",
//     IsDirectApprove: state?.data?.DirectApprove
//       ? state?.data?.DirectApprove === "True"
//         ? "1"
//         : "0"
//       : "",
//     IsNewTestApprove: state?.data?.NewTestApproves
//       ? state?.data?.NewTestApproves === "True"
//         ? "1"
//         : "0"
//       : "",
//     IsSales: state?.data?.IsSales
//       ? state?.data?.IsSalesStatus === "True"
//         ? "1"
//         : "0"
//       : "",
//     IsShowSpecialRate: state?.data?.ShowSpecialRate
//       ? state?.data?.ShowSpecialRate === "True"
//         ? "1"
//         : "0"
//       : "",
//     isActive: state?.data?.ActiveStatus
//       ? state?.data?.ActiveStatus === "True"
//         ? "1"
//         : "0"
//       : "1",
//     DesignationID: state?.data?.DesignationID ? state?.data?.DesignationID : "",
//     RecEdit: state?.data?.RecEdit ? state?.data?.RecEdit : 0,
//     EditInfo: state?.data?.EditInfo ? state?.data?.EditInfo : 0,
//     ImagePath: state?.data?.ImagePath ? state?.data?.ImagePath : ""
//   });

//   console.log("From Data", formData)

//   const { t } = useTranslation();

//   const handleCaptureUploadedFile = (name, count, isUploaded) => {
//     if (count > 0 || isUploaded) {
//       setFormData(prev => ({
//         ...prev,
//         ImagePath: showFileModal.data
//       }));
//     }
//   };

//   const handleSearchDesignationChange = (e) => {
//     const value = e.target.value;
//     setSearchDesignationPayload({
//       label: value,
//       value: null,
//       DefaultDesignationId: null,
//     });


//     if (!value.trim()) {
//       // Empty input → reset to full list
//       setSelectSearchDesignation(false);
//       setSearchDesignationSuggestions(designationList);
//     } else {
//       // Filter list
//       const filtered = designationList.filter((d) =>
//         d.label.toLowerCase().includes(value.toLowerCase()),
//       );
//       setSearchDesignationSuggestions(filtered);
//       setSelectSearchDesignation(true);
//       setSearchDesignationIndex(0);
//     }
//   };

//   const handleSearchDesignationKeyDown = (e) => {
//     if (!selectSearchDesignation || searchDesignationSuggestions.length === 0)
//       return;

//     if (e.key === "ArrowUp") {
//       setSearchDesignationIndex((prev) =>
//         prev > 0 ? prev - 1 : searchDesignationSuggestions.length - 1,
//       );
//     } else if (e.key === "ArrowDown") {
//       setSearchDesignationIndex((prev) =>
//         prev === searchDesignationSuggestions.length - 1 ? 0 : prev + 1,
//       );
//     } else if (e.key === "Enter") {
//       handleSearchDesignationSelect(
//         searchDesignationSuggestions[searchDesignationIndex],
//       );
//       setSearchDesignationIndex(0);
//     }
//   };

//   const handleSearchDesignationSelect = (selected) => {
//     if (!selected) return;

//     setSearchDesignationPayload(selected);
//     setSelectSearchDesignation(false);

//     axiosInstance
//       .post("Designation/GetDesignationSearch", {
//         designationsId: selected?.value || "",
//       })
//       .then((res) => {
//         if (res.data.success && res.data.data) {
//           const designationDetails = res.data.data.designationDetails[0] || [];
//           const flagDetails = res.data.data.flagDetails || [];

//           // setFormData((prev) => ({
//           //   ...prev,
//           //   Name: designationDetails.DesignationName || "",
//           //   SequenceNo: designationDetails.SequenceNo || "",
//           //   IsDirectApprove:
//           //     designationDetails.DirectApprove === "True" ||
//           //     designationDetails.IsDirectApprove === 1
//           //       ? "1"
//           //       : "0",
//           //   IsNewTestApprove:
//           //     designationDetails.NewTestApproves === "True" ||
//           //     designationDetails.IsNewTestApprove === 1
//           //       ? "1"
//           //       : "0",
//           //   IsSales:
//           //     designationDetails.IsSalesStatus === "True" ||
//           //     designationDetails.IsSales === 1
//           //       ? "1"
//           //       : "0",
//           //   IsShowSpecialRate:
//           //     designationDetails.ShowSpecialRate === "True" ||
//           //     designationDetails.IsShowSpecialRate === 1
//           //       ? "1"
//           //       : "0",
//           //   isActive:
//           //     designationDetails.ActiveStatus === "True" ||
//           //     designationDetails.isActive === 1
//           //       ? "1"
//           //       : "0",
//           //   DesignationID: designationDetails.DesignationID || "",
//           //   RecEdit: designationDetails.RecEdit || 0,
//           //   EditInfo: designationDetails.EditInfo || 0,
//           // }));
//           setFormData((prev) => ({
//             ...prev,
//             Name: designationDetails.DesignationName || "",
//             SequenceNo: Number(designationDetails.SequenceNo || 0),
//             IsDirectApprove:
//               designationDetails.DirectApprove === "True" ||
//                 designationDetails.IsDirectApprove === 1
//                 ? "1"
//                 : "0",
//             IsNewTestApprove:
//               designationDetails.NewTestApproves === "True" ||
//                 designationDetails.IsNewTestApprove === 1
//                 ? "1"
//                 : "0",
//             IsSales:
//               designationDetails.IsSalesStatus === "True" ||
//                 designationDetails.IsSales === 1
//                 ? "1"
//                 : "0",
//             IsShowSpecialRate:
//               designationDetails.ShowSpecialRate === "True" ||
//                 designationDetails.IsShowSpecialRate === 1
//                 ? "1"
//                 : "0",
//             isActive:
//               designationDetails.ActiveStatus === "True" ||
//                 designationDetails.isActive === 1
//                 ? "1"
//                 : "0",
//             DesignationID: Number(designationDetails.DesignationID),
//             RecEdit: designationDetails.RecEdit || 0,
//             EditInfo: designationDetails.EditInfo || 0,
//           }));

//           navigate("/DesignationsCreate", {
//             state: {
//               data: designationDetails,
//               other: { button: "Update" },
//               url: "Designation/UpdateDesignationData",
//             },
//           });

//           if (Array.isArray(flagDetails) && flagDetails.length > 0) {
//             setTableData(normalizeFlagValues(flagDetails));
//           } else {
//             setTableData([]);
//             toast.info("No flag data found for this company");
//           }

//           // Update your formData or payload
//           // setFormData((prev) => ({
//           //   ...prev,
//           //   ...designationDetails,
//           // }));

//           // setButtonLabel("Update");

//           // navigate("/DesignationMaster/designation", {
//           //   state: {
//           //     url: "Designation/UpdateDesignation",
//           //     hideCredentials: true,
//           //   },
//           // });
//         } else {
//           toast.info("No details found for this designation");
//         }
//       })
//       .catch((err) => {
//         console.error(err);
//         toast.error("Failed to fetch designation details");
//       });
//   };

//   const columns = [
//     { header: "Sr. No", field: "SrNo", width: "4%" },
//     { header: "FlagName", field: "FlagName", width: "16%" },
//     { header: "Value", field: "Value", width: "16%" },
//     // { header: "Created By", field: "CreatedBy", width: "16%" },
//     // { header: "Created On", field: "CreatedOn", width: "16%" },
//     { header: "Last Updated By", field: "LastUpdatedBy", width: "16%" },
//     { header: "Last Updated On", field: "LastUpdatedOn", width: "16%" },
//   ];

//   const handleOpenUploadModal = () => {
//     const currentGuid = formData.ImagePath ? formData.ImagePath : guidNumber();
//     // setFormData(prev => ({ ...prev, ImagePath: currentGuid }));
//     setShowFileModal({
//       modal: true,
//       data: currentGuid,
//       index: -1,
//     });
//   };

//   console.log('state?.url:::',state?.url)
//   const postData = () => {
//     let generatedError = validationForDesignations(formData);
//     if (generatedError === "") {
//       setLoad(true);

//       const payload = {
//         name: formData.Name,
//         sequenceNo: String(formData.SequenceNo),
//         isDirectApprove: formData.IsDirectApprove,
//         isNewTestApprove: formData.IsNewTestApprove,
//         isSales: formData.IsSales,
//         isShowSpecialRate: formData.IsShowSpecialRate,
//         isActive: formData.isActive.toString(),
//         designationID: String(formData.DesignationID),
//         reportopen: 0, // if needed
//         flagRecords: getChangedFlagRecords(tableData),
//         ImagePath: formData.ImagePath,
//       };
//       axiosInstance
//         .post(state?.url ? state?.url : '/Designation/InsertDesignationData', getTrimmedData(payload))
//         .then((res) => {
//           if (res.data.message) {
//             navigate("/Designations");
//             setLoad(false);
//             toast.success(res.data.message);
//           } else {
//             toast.error("Something went wrong");
//             setLoad(false);
//           }
//         })
//         .catch((err) => {
//           toast.error(
//             err?.response?.data?.message
//               ? err?.response?.data?.message
//               : "Error Occured",
//           );
//           setLoad(false);
//         });
//     } else {
//       setErr(generatedError);
//     }
//   };

//   const getDesignationData = async () => {
//     console.log("formData.DesignationID", formData?.DesignationID);
//     setLoad(true);
//     axiosInstance
//       .post("Designation/getDesignationDataConfig", {
//         designationID: formData?.DesignationID || -0,
//       })
//       .then((res) => {
//         if (Array.isArray(res?.data?.message) && res.data.message.length > 0) {
//           setTableData(normalizeFlagValues(res.data.message));
//         } else {
//           setTableData([]); // clear table if no data
//           toast.info("No data found");
//         }
//         setLoad(false);
//       })
//       .catch((err) => {
//         console.log("Designation err", err);
//         toast.error(
//           err?.response?.data?.message
//             ? err?.response?.data?.message
//             : "Error Occured",
//         );
//         setLoad(false);
//       });
//   };

//   const renderControl = (row) => {
//     switch (row.ControlType) {
//       case "Checkbox":
//         const isChecked = row.FlagValue === "1" || row.FlagValue === 1;
//         return (
//           <label
//             className="switch"
//             style={{ display: "flex", alignItems: "center", marginBottom: "0" }}
//           >
//             <input
//               type="checkbox"
//               checked={isChecked}
//               onChange={(e) => handleFlagToggle(setTableData, row, e)}
//             />
//             <span className="slider round2"></span>
//           </label>
//         );

//       case "TextBox":
//         return (
//           <Input
//             onChange={(e) => {
//               const value = e.target.value;
//               setTableData((prev) =>
//                 prev.map((r) =>
//                   r.FlagName === row.FlagName
//                     ? {
//                       ...r,
//                       FlagValue: value,
//                       isChanged: value !== r.originalFlagValue,
//                     }
//                     : r,
//                 ),
//               );
//             }}
//             value={row.FlagValue || ""}
//             name="FlagValue"
//             // className="required-fields"
//             type="text"
//             placeholder=""
//             lable={t("Flag Value")}
//             id="Visit No"
//           />
//         );

//       case "Calendar":
//         return (
//           <DatePicker
//             className="custom-calendar"
//             name="Date"
//             value={row.FlagValue || ""}
//             onChange={(e) => {
//               const value = e.target.value;
//               setTableData((prev) =>
//                 prev.map((r) =>
//                   r.FlagName === row.FlagName
//                     ? {
//                       ...r,
//                       FlagValue: value,
//                       isChanged: value !== r.originalFlagValue,
//                     }
//                     : r,
//                 ),
//               );
//             }}
//             placeholder=" "
//             lable="Date"
//             maxDate={new Date(row.FlagValue)}
//           />
//         );

//       case "Dropdown":
//         return (
//           // <ReactSelect
//           //   dynamicOptions={row?.Options}
//           //   name="Dropdown"
//           //   lable={t("Select Flag")}
//           //   removeIsClearable={true}
//           //   placeholderName={t("Select Flag")}
//           //   value={row.FlagValue || ""}
//           //   onChange={(e) => {
//           //     const value = e.target.value;
//           //     setTableData((prev) =>
//           //       prev.map((r) =>
//           //         r.FlagName === row.FlagName ? { ...r, FlagValue: value } : r
//           //       )
//           //     );
//           //   }}
//           // />
//           <ReactSelect
//             dynamicOptions={row?.Options}
//             name="Dropdown"
//             lable={t("Select Flag")}
//             removeIsClearable={true}
//             placeholderName={t("Select Flag")}
//             value={row.FlagValue || ""}
//             onChange={(name, selectedOption) => {
//               const value = selectedOption?.value || "";

//               setTableData((prev) =>
//                 prev.map((r) =>
//                   r.FlagName === row.FlagName
//                     ? {
//                       ...r,
//                       FlagValue: value,
//                       isChanged: value !== r.originalFlagValue,
//                     }
//                     : r,
//                 ),
//               );
//             }}
//           />
//         );

//       default:
//         return row.FlagValue || "";
//     }
//   };

//   const renderData = tableData.map((row, index) => ({
//     ...row,
//     Value: renderControl(row),
//   }));

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData({
//       ...formData,
//       [name]: type === "checkbox" ? (checked ? "1" : "0") : value,
//     });
//   };

//   // const handleToggle = (field) => {
//   //   setFormData((prev) => ({
//   //     ...prev,
//   //     [field]: prev[field] === 1 ? 0 : 1,
//   //   }));
//   // };

//   const handleToggle = (e) => {
//     const { checked } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       isActive: checked ? 1 : 0,
//     }));
//   };

//   const getDesignationDetails = () => {
//     const apiPayload = {
//       designationsId: searchDesignationPayload.value || 0,
//       designationName: searchDesignationPayload.label || "",
//     };
//     axiosInstance
//       .post("Designation/getDesignation", apiPayload)
//       .then((res) => {
//         const data = res?.data?.message || [];
//         let designationList = data.map((ele) => {
//           return {
//             value: ele.DesignationID,
//             label: ele.DesignationName,
//           };
//         });
//         setDesignationList(designationList);
//         setSearchDesignationSuggestions(designationList);
//       })
//       .catch((err) => console.log(err));
//   };

//   useEffect(() => {
//     getDesignationData();
//     getDesignationDetails();
//   }, []);

//   return (
//     <>
//       <Heading
//         name={t("Designations Create")}
//         defaultValue={true}
//         isBreadcrumb={true}

//         secondTitle={
//           state?.data ? (
//             <div className="d-flex" style={{ gap: "15px" }}>
//               <span>
//                 <strong>Designation Name:</strong> {state.data.DesignationName}
//               </span>
//               |
//               <span>
//                 <strong>ID:</strong> {state.data.DesignationID}
//               </span>
//               |
//               <span>
//                 <strong>CreatedBy:</strong> {state.data.CreatedByName}
//               </span>
//               |
//               <span>
//                 <strong>CreatedDate:</strong> {state.data.dtEntry}
//               </span>
//             </div>
//           ) : null
//         }

//       />
//       <div className="row px-2 pt-2">
//         {/* <div className="col-sm-4">
//             <Input
//               type="text"
//               name="SearchDesignation"
//               lable="Search Any Designation For Update"
//               value={searchDesignationPayload.label || ""}
//               // placeholder=" "
//               onChange={handleSearchDesignationChange}
//               onKeyDown={handleSearchDesignationKeyDown}
//               onBlur={() =>
//                 setTimeout(() => setSelectSearchDesignation(false), 200)
//               }
//             />

//             {selectSearchDesignation &&
//               searchDesignationSuggestions.length > 0 && (
//                 <AutoComplete
//                   selects={selectSearchDesignation}
//                   test={searchDesignationSuggestions.map((item) => ({
//                     TestName: item.label,
//                   }))}
//                   handleListSearch={(selected) =>
//                     handleSearchDesignationSelect(
//                       searchDesignationSuggestions.find(
//                         (item) => item.label === selected.TestName,
//                       ),
//                     )
//                   }
//                   indexMatch={searchDesignationIndex}
//                 />
//               )}
//           </div> */}
//       </div>
//       <div className="row pt-2 pl-2 pr-2 align-items-center ">
//         <div className="col-sm-2">
//           <Input
//             type="text"
//             name="Name"
//             lable="Designation Name"
//             id="Name"
//             placeholder=" "
//             max={50}
//             className="required-fields"
//             onChange={handleChange}
//             value={formData?.Name}
//           />
//           <span
//             className="error-message"
//             data-valmsg-for="DepartmentCode"
//             data-valmsg-replace="true"
//           >
//             {err?.Name}
//           </span>
//         </div>
//         <div className="col-sm-2">
//           <Input
//             type="number"
//             name="SequenceNo"
//             className="required-fields"
//             lable="Sequence Number"
//             id="SequenceNo"
//             placeholder=" "
//             max={11}
//             onChange={handleChange}
//             value={formData?.SequenceNo}
//             onInput={(e) => number(e, 11)}
//           />
//           <span
//             className="error-message"
//             data-valmsg-for="DepartmentCode"
//             data-valmsg-replace="true"
//           >
//             {err?.SequenceNo}
//           </span>
//         </div>
//         {/* <div className="col-sm-1 mt-1 d-flex">
//             <div className="mt-1">
//               <input
//                 type="checkbox"
//                 name="IsSales"
//                 onChange={handleChange}
//                 checked={formData?.IsSales == "1" ? true : false}
//               />
//             </div>
//             <label className="col-sm-10">{t("Sales")}</label>
//           </div>
//           <div className="col-sm-2 mt-1 d-flex">
//             <div className="mt-1">
//               <input
//                 type="checkbox"
//                 onChange={handleChange}
//                 name="IsNewTestApprove"
//                 checked={formData?.IsNewTestApprove == "1" ? true : false}
//               />
//             </div>
//             <label className="col-sm-10">{t("New Test Approve")}</label>
//           </div>
//           <div className="col-sm-2 mt-1 d-flex">
//             <div className="mt-1">
//               <input
//                 type="checkbox"
//                 name="IsDirectApprove"
//                 onChange={handleChange}
//                 checked={formData?.IsDirectApprove == "1" ? true : false}
//               />
//             </div>
//             <label className="col-sm-10">{t("Direct Approve")}</label>
//           </div>
//           <div className="col-sm-2 mt-1 d-flex">
//             <div className="mt-1">
//               <input
//                 type="checkbox"
//                 name="IsShowSpecialRate"
//                 onChange={handleChange}
//                 checked={formData?.IsShowSpecialRate == "1" ? true : false}
//               />
//             </div>
//             <label className="col-sm-10">{t("Show Special Rate")}</label>
//           </div> */}
//         <div
//           className="col-auto d-flex align-items-center p-2 "
//           style={{ gap: "5px" }}
//         >
//           <label className="switch ">
//             <input
//               type="checkbox"
//               name="isActive"
//               checked={formData?.isActive === "1"}
//               onChange={handleToggle}
//             />
//             <span className="slider"></span>
//           </label>
//           <strong className="mb-2">{t("IsActive")}</strong>
//         </div>
//         <div className="col-sm-1">
//           <CustomButton
//             text={formData.ImagePath ? t("File Linked") : t("Upload file")}
//             onClick={handleOpenUploadModal}
//           />
//         </div>
//       </div>

//       <div className="row pt-2 pl-2 pr-2">
//         {load ? (
//           <Loading />
//         ) : tableData && tableData.length > 0 ? (
//           <CustomTable
//             columns={columns}
//             data={renderData}
//             scrollView="scroll"
//             tableHeight="table-responsive"
//           />
//         ) : null}
//       </div>
//       <div className="row pt-2 pl-2 pr-2">
//         <div className="col-sm-1 mb-2 d-flex align-items-center">
//           {load ? (
//             <Loading />
//           ) : (
//             <button
//               type="submit"
//               className="btn btn-block btn-success btn-sm"
//               title="Create"
//               onClick={postData}
//             >
//               {state?.other?.button ? t(state?.other?.button) : t("Save")}
//             </button>
//           )}
//         </div>
//         <div className="col-sm-2">
//           <Link to="/Designations" style={{ fontSize: "13px" }}>
//             {t("Back to List")}
//           </Link>
//         </div>
//       </div>


//       {showFileModal?.modal && (
//         <UploadFile
//           show={showFileModal?.modal}
//           handleClose={() => {
//             setShowFileModal({ modal: false, data: "", index: -1 });
//           }}
//           // options={Identity}
//           documentId={showFileModal?.data}
//           pageName="DesignationsCreate"
//           handleUploadCount={handleCaptureUploadedFile}
//         />
//       )}
//     </>
//   );
// };

// export default DesignationsCreate;
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { validationForDesignations } from "../../utils/Schema";
import { toast } from "react-toastify";
import {
  getChangedFlagRecords,
  getTrimmedData,
  handleFlagToggle,
  normalizeFlagValues,
  number,
} from "../../utils/helpers";
import { axiosInstance } from "../../utils/axiosInstance";
import { useTranslation } from "react-i18next";
import Accordion from "@app/components/UI/Accordion";
import Input from "../../components/formComponent/Input";
import Loading from "../../components/loader/Loading";
import CustomTable from "../../components/Table/CustomTable";
import DatePicker from "../../components/formComponent/DatePicker";
import AutoComplete from "../../components/formComponent/AutoComplete";
import UploadFile from "../utils/UploadFileModal/UploadFile";
import { guidNumber } from "../../utils/generateGuid";
import { CustomButton } from "../../components/UI/CustomButton";
import Heading from "../../components/UI/Heading";
import { DynamicIcon } from "../../utils/DynamicIcon";

const DesignationsCreate = () => {
  const [err, setErr] = useState({});
  const [load, setLoad] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const navigation = useNavigate();
  const { state } = location;
  const [tableData, setTableData] = useState([]);
  const [designationList, setDesignationList] = useState([]);
  const [searchDesignationSuggestions, setSearchDesignationSuggestions] =
    useState([]);
  const [selectSearchDesignation, setSelectSearchDesignation] = useState(false);
  const [searchDesignationIndex, setSearchDesignationIndex] = useState(0);
  const [searchDesignationPayload, setSearchDesignationPayload] = useState({
    label: "",
    value: null,
    DefaultDesignationId: null,
  });

  console.log("State", state);

  const [showFileModal, setShowFileModal] = useState({
    modal: false,
    data: "",
    index: -1,
  });

  const [formData, setFormData] = useState({
    Name: state?.data?.DesignationName ? state?.data?.DesignationName : "",
    SequenceNo: state?.data?.SequenceNo ? state?.data?.SequenceNo : "",
    IsDirectApprove: state?.data?.DirectApprove
      ? state?.data?.DirectApprove === "True"
        ? "1"
        : "0"
      : "",
    IsNewTestApprove: state?.data?.NewTestApproves
      ? state?.data?.NewTestApproves === "True"
        ? "1"
        : "0"
      : "",
    IsSales: state?.data?.IsSales
      ? state?.data?.IsSalesStatus === "True"
        ? "1"
        : "0"
      : "",
    IsShowSpecialRate: state?.data?.ShowSpecialRate
      ? state?.data?.ShowSpecialRate === "True"
        ? "1"
        : "0"
      : "",
    isActive: state?.data?.ActiveStatus
      ? state?.data?.ActiveStatus === "True" ||
        state?.data?.isActive == 1 ||
        state?.data?.isActive === "1"
        ? "1"
        : "0"
      : "1",
    DesignationID: state?.data?.DesignationID ? state?.data?.DesignationID : "",
    RecEdit: state?.data?.RecEdit ? state?.data?.RecEdit : 0,
    EditInfo: state?.data?.EditInfo ? state?.data?.EditInfo : 0,
    ImagePath: state?.data?.ImagePath ? state?.data?.ImagePath : "",
    IconName: state?.data?.IconName || state?.data?.iconName || state?.data?.DesignationIcon || "",
  });
  const { t } = useTranslation();

  const handleCaptureUploadedFile = (name, count, isUploaded) => {
    if (count > 0 || isUploaded) {
      setFormData((prev) => ({
        ...prev,
        ImagePath: showFileModal.data,
      }));
    }
  };

  const handleSearchDesignationChange = (e) => {
    const value = e.target.value;
    setSearchDesignationPayload({
      label: value,
      value: null,
      DefaultDesignationId: null,
    });

    if (!value.trim()) {
      setSelectSearchDesignation(false);
      setSearchDesignationSuggestions(designationList);
    } else {
      const filtered = designationList.filter((d) =>
        d.label.toLowerCase().includes(value.toLowerCase())
      );
      setSearchDesignationSuggestions(filtered);
      setSelectSearchDesignation(true);
      setSearchDesignationIndex(0);
    }
  };

  const handleSearchDesignationKeyDown = (e) => {
    if (!selectSearchDesignation || searchDesignationSuggestions.length === 0)
      return;

    if (e.key === "ArrowUp") {
      setSearchDesignationIndex((prev) =>
        prev > 0 ? prev - 1 : searchDesignationSuggestions.length - 1
      );
    } else if (e.key === "ArrowDown") {
      setSearchDesignationIndex((prev) =>
        prev === searchDesignationSuggestions.length - 1 ? 0 : prev + 1
      );
    } else if (e.key === "Enter") {
      handleSearchDesignationSelect(
        searchDesignationSuggestions[searchDesignationIndex]
      );
      setSearchDesignationIndex(0);
    }
  };

  const handleSearchDesignationSelect = (selected) => {
    if (!selected) return;

    setSearchDesignationPayload(selected);
    setSelectSearchDesignation(false);

    axiosInstance
      .post("Designation/GetDesignationSearch", {
        designationsId: selected?.value || "",
      })
      .then((res) => {
        if (res.data.success && res.data.data) {
          const designationDetails = res.data.data.designationDetails[0] || [];
          const flagDetails = res.data.data.flagDetails || [];

          setFormData((prev) => ({
            ...prev,
            Name: designationDetails.DesignationName || "",
            SequenceNo: Number(designationDetails.SequenceNo || 0),
            IsDirectApprove:
              designationDetails.DirectApprove === "True" ||
                designationDetails.IsDirectApprove === 1
                ? "1"
                : "0",
            IsNewTestApprove:
              designationDetails.NewTestApproves === "True" ||
                designationDetails.IsNewTestApprove === 1
                ? "1"
                : "0",
            IsSales:
              designationDetails.IsSalesStatus === "True" ||
                designationDetails.IsSales === 1
                ? "1"
                : "0",
            IsShowSpecialRate:
              designationDetails.ShowSpecialRate === "True" ||
                designationDetails.IsShowSpecialRate === 1
                ? "1"
                : "0",
            isActive:
              designationDetails.ActiveStatus === "True" ||
                designationDetails.isActive === 1
                ? "1"
                : "0",
            DesignationID: Number(designationDetails.DesignationID),
            RecEdit: designationDetails.RecEdit || 0,
            EditInfo: designationDetails.EditInfo || 0,
            IconName: designationDetails.IconName || designationDetails.iconName || designationDetails.DesignationIcon || "",
          }));

          navigate("/DesignationsCreate", {
            state: {
              data: designationDetails,
              other: { button: "Update" },
              url: "Designation/UpdateDesignationData",
            },
          });

          if (Array.isArray(flagDetails) && flagDetails.length > 0) {
            setTableData(normalizeFlagValues(flagDetails));
          } else {
            setTableData([]);
            toast.info("No flag data found for this company");
          }
        } else {
          toast.info("No details found for this designation");
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to fetch designation details");
      });
  };

  const columns = [
    { header: "Sr. No", field: "SrNo", width: "4%" },
    { header: "FlagName", field: "FlagName", width: "16%" },
    { header: "Value", field: "Value", width: "16%" },
    { header: "Last Updated By", field: "LastUpdatedBy", width: "16%" },
    { header: "Last Updated On", field: "LastUpdatedOn", width: "16%" },
  ];

  const handleOpenUploadModal = () => {
    const currentGuid = formData.ImagePath ? formData.ImagePath : guidNumber();
    setShowFileModal({
      modal: true,
      data: currentGuid,
      index: -1,
    });
  };

  console.log("state?.url:::", state?.url);

  const postData = () => {
    let generatedError = validationForDesignations(formData);
    if (generatedError === "") {
      setLoad(true);

      const payload = {
        name: formData.Name,
        sequenceNo: String(formData.SequenceNo),
        isDirectApprove: formData.IsDirectApprove,
        isNewTestApprove: formData.IsNewTestApprove,
        isSales: formData.IsSales,
        isShowSpecialRate: formData.IsShowSpecialRate,
        isActive: formData.isActive.toString(),
        designationID: String(formData.DesignationID),
        reportopen: 0,
        flagRecords: getChangedFlagRecords(tableData),
        ImagePath: formData.ImagePath,
        iconName: formData.IconName,
      };

      axiosInstance
        .post(
          state?.url ? state?.url : "/Designation/InsertDesignationData",
          getTrimmedData(payload)
        )
        .then((res) => {
          if (res.data.message) {
            navigate("/Designations");
            setLoad(false);
            toast.success(res.data.message);
          } else {
            toast.error("Something went wrong");
            setLoad(false);
          }
        })
        .catch((err) => {
          toast.error(
            err?.response?.data?.message
              ? err?.response?.data?.message
              : "Error Occured"
          );
          setLoad(false);
        });
    } else {
      setErr(generatedError);
    }
  };

  const getDesignationData = async () => {
    console.log("formData.DesignationID", formData?.DesignationID);
    setLoad(true);
    axiosInstance
      .post("Designation/getDesignationDataConfig", {
        designationID: formData?.DesignationID || -0,
      })
      .then((res) => {
        if (Array.isArray(res?.data?.message) && res.data.message.length > 0) {
          setTableData(normalizeFlagValues(res.data.message));
        } else {
          setTableData([]);
          toast.info("No data found");
        }
        setLoad(false);
      })
      .catch((err) => {
        console.log("Designation err", err);
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Error Occured"
        );
        setLoad(false);
      });
  };

  const renderControl = (row) => {
    switch (row.ControlType) {
      case "Checkbox":
        const isChecked = row.FlagValue === "1" || row.FlagValue === 1;
        return (
          <label
            className="switch"
            style={{ display: "flex", alignItems: "center", marginBottom: "0" }}
          >
            <input
              type="checkbox"
              checked={isChecked}
              onChange={(e) => handleFlagToggle(setTableData, row, e)}
            />
            <span className="slider round2"></span>
          </label>
        );

      case "TextBox":
        return (
          <Input
            onChange={(e) => {
              const value = e.target.value;
              setTableData((prev) =>
                prev.map((r) =>
                  r.FlagName === row.FlagName
                    ? {
                      ...r,
                      FlagValue: value,
                      isChanged: value !== r.originalFlagValue,
                    }
                    : r
                )
              );
            }}
            value={row.FlagValue || ""}
            name="FlagValue"
            type="text"
            placeholder=""
            lable={t("Flag Value")}
            id="Visit No"
          />
        );

      case "Calendar":
        return (
          <DatePicker
            className="custom-calendar"
            name="Date"
            value={row.FlagValue || ""}
            onChange={(e) => {
              const value = e.target.value;
              setTableData((prev) =>
                prev.map((r) =>
                  r.FlagName === row.FlagName
                    ? {
                      ...r,
                      FlagValue: value,
                      isChanged: value !== r.originalFlagValue,
                    }
                    : r
                )
              );
            }}
            placeholder=" "
            lable="Date"
            maxDate={new Date(row.FlagValue)}
          />
        );

      case "Dropdown":
        return (
          <ReactSelect
            dynamicOptions={row?.Options}
            name="Dropdown"
            lable={t("Select Flag")}
            removeIsClearable={true}
            placeholderName={t("Select Flag")}
            value={row.FlagValue || ""}
            onChange={(name, selectedOption) => {
              const value = selectedOption?.value || "";
              setTableData((prev) =>
                prev.map((r) =>
                  r.FlagName === row.FlagName
                    ? {
                      ...r,
                      FlagValue: value,
                      isChanged: value !== r.originalFlagValue,
                    }
                    : r
                )
              );
            }}
          />
        );

      default:
        return row.FlagValue || "";
    }
  };

  const renderData = tableData.map((row) => ({
    ...row,
    Value: renderControl(row),
  }));

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? (checked ? "1" : "0") : value,
    });
  };

  const handleToggle = (e) => {
    const { checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      isActive: checked ? "1" : "0",
    }));
  };

  const getDesignationDetails = () => {
    const apiPayload = {
      designationsId: searchDesignationPayload.value || 0,
      designationName: searchDesignationPayload.label || "",
    };
    axiosInstance
      .post("Designation/getDesignation", apiPayload)
      .then((res) => {
        const data = res?.data?.message || [];
        let designationList = data.map((ele) => ({
          value: ele.DesignationID,
          label: ele.DesignationName,
        }));
        setDesignationList(designationList);
        setSearchDesignationSuggestions(designationList);
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    if (state?.data) {
      setFormData((prev) => ({
        ...prev,
        Name: state.data.DesignationName || "",
        SequenceNo: state.data.SequenceNo || "",
        IsDirectApprove:
          state.data.DirectApprove === "True" ||
          state.data.IsDirectApprove == 1 ||
          state.data.IsDirectApprove === "1"
            ? "1"
            : "0",
        IsNewTestApprove:
          state.data.NewTestApproves === "True" ||
          state.data.IsNewTestApprove == 1 ||
          state.data.IsNewTestApprove === "1"
            ? "1"
            : "0",
        IsSales:
          state.data.IsSalesStatus === "True" ||
          state.data.IsSales == 1 ||
          state.data.IsSales === "1"
            ? "1"
            : "0",
        IsShowSpecialRate:
          state.data.ShowSpecialRate === "True" ||
          state.data.IsShowSpecialRate == 1 ||
          state.data.IsShowSpecialRate === "1"
            ? "1"
            : "0",
        isActive:
          state.data.ActiveStatus === "True" ||
          state.data.isActive == 1 ||
          state.data.isActive === "1"
            ? "1"
            : "0",
        DesignationID: state.data.DesignationID || "",
        ImagePath: state.data.ImagePath || "",
        IconName: state.data.IconName || state.data.iconName || state.data.DesignationIcon || "",
      }));
    }
  }, [state]);

  useEffect(() => {
    getDesignationData();
    getDesignationDetails();
  }, []);

  return (
    <>
      <Heading
        name={t("Designations Create")}
        defaultValue={true}
        isBreadcrumb={true}
        secondTitle={
          state?.data ? (
            <div className="d-flex" style={{ gap: "15px" }}>
              <span>
                <strong>Designation Name:</strong> {state.data.DesignationName}
              </span>
              |
              <span>
                <strong>ID:</strong> {state.data.DesignationID}
              </span>
              |
              <span>
                <strong>CreatedBy:</strong> {state.data.CreatedByName}
              </span>
              |
              <span>
                <strong>CreatedDate:</strong> {state.data.dtEntry}
              </span>
            </div>
          ) : null
        }
      />

      <div className="row px-2 pt-2"></div>

      <div className="row pt-2 pl-2 pr-2 align-items-center">
        <div className="col-sm-2">
          <Input
            type="text"
            name="Name"
            lable="Designation Name"
            id="Name"
            placeholder=" "
            max={50}
            className="required-fields"
            onChange={handleChange}
            value={formData?.Name}
          />
          <span
            className="error-message"
            data-valmsg-for="DepartmentCode"
            data-valmsg-replace="true"
          >
            {err?.Name}
          </span>
        </div>

        <div className="col-sm-2">
          <Input
            type="number"
            name="SequenceNo"
            className="required-fields"
            lable="Sequence Number"
            id="SequenceNo"
            placeholder=" "
            max={11}
            onChange={handleChange}
            value={formData?.SequenceNo}
            onInput={(e) => number(e, 11)}
          />
          <span
            className="error-message"
            data-valmsg-for="DepartmentCode"
            data-valmsg-replace="true"
          >
            {err?.SequenceNo}
          </span>
        </div>

        <div className="col-sm-3 d-flex align-items-center">
          <Input
            type="text"
            name="IconName"
            lable="Icon Name (e.g:FaUser)"
            value={formData?.IconName || ""}
            onChange={handleChange}
          />
        </div>

        <div
          className="col-auto d-flex align-items-center p-2"
          style={{ gap: "5px" }}
        >
          <label className="switch">
            <input
              type="checkbox"
              name="isActive"
              checked={formData?.isActive === "1"}
              onChange={handleToggle}
            />
            <span className="slider"></span>
          </label>
          <strong className="mb-2">{t("IsActive")}</strong>
        </div>

        <div className="col-sm-1">
          <CustomButton
            text={formData.ImagePath ? t("File Linked") : t("Upload file")}
            onClick={handleOpenUploadModal}
          />
        </div>
      </div>

      <div className="row pt-2 pl-2 pr-2">
        {load ? (
          <Loading />
        ) : tableData && tableData.length > 0 ? (
          <CustomTable
            columns={columns}
            data={renderData}
            scrollView="scroll"
            tableHeight="table-responsive"
          />
        ) : null}
      </div>

      <div className="row pt-2 pl-2 pr-2">
        <div className="col-sm-1 mb-2 d-flex align-items-center">
          {load ? (
            <Loading />
          ) : (
            <button
              type="submit"
              className="btn btn-block btn-success btn-sm"
              title="Create"
              onClick={postData}
            >
              {state?.other?.button ? t(state?.other?.button) : t("Save")}
            </button>
          )}
        </div>
        <div className="col-sm-2">
          <Link to="/Designations" style={{ fontSize: "13px" }}>
            {t("Back to List")}
          </Link>
        </div>
      </div>

      {showFileModal?.modal && (
        <UploadFile
          show={showFileModal?.modal}
          handleClose={() => {
            setShowFileModal({ modal: false, data: "", index: -1 });
          }}
          documentId={showFileModal?.data}
          pageName="DesignationsCreate"
          handleUploadCount={handleCaptureUploadedFile}
        />
      )}
    </>
  );
};

export default DesignationsCreate;