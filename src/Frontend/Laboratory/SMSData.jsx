// import React, { useEffect, useState, useMemo } from "react";
// import Accordion from "@app/components/UI/Accordion";
// import { useTranslation } from "react-i18next";
// import Input from "../../components/formComponent/Input";
// import Tables from "../../components/UI/customTable";
// import Loading from "../../components/loader/Loading";
// import { axiosInstance } from "../../utils/axiosInstance";
// import { toast } from "react-toastify";
// import { SearchButton, CustomButton } from "../../components/UI/CustomButton";
// import MultiSelectComp from "../../components/formComponent/MultiSelectComp";
// import {
//   GetGlobalData,
//   getSearchController,
// } from "../../utils/NetworkApi/commonApi";
// import DatePicker from "../../components/formComponent/DatePicker";
// import * as XLSX from "xlsx";
// import Pagination from "../../Pagination/Pagination";
// import ReactSelect from "../../components/formComponent/ReactSelect";
// import moment from "moment";
// import { Home, House, Settings } from "lucide-react";
// import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
// import { Dialog } from "primereact/dialog";
// import PageControlMaster from "../Master/PageControlMaster/PageControlMaster";

// const PAGE_ID = "762";

// const HeaderHome = ({ size = 15, color = "#e43030", style }) => (
//   <i
//     className="bi bi-house-heart-fill"
//     style={{ fontSize: size, color, ...style }}
//   />
// );
// const HourglassIcon = ({ size = 15, color = "#b45309", style }) => (
//   <i
//     className="bi bi-hourglass-split"
//     style={{ fontSize: size, color, ...style }}
//   />
// );
// const checkSquare = ({ size = 15, color = "#15803d", style }) => (
//   <i
//     className="bi bi-check2-circle"
//     style={{ fontSize: size, color, ...style }}
//   />
// );
// const TriangleFill = ({ size = 15, color = "#b91c1c", style }) => (
//   <i
//     className="bi bi-exclamation-triangle-fill"
//     style={{ fontSize: size, color, ...style }}
//   />
// );

// const colorCodingData = [
//   {
//     ColorCode: "-1",
//     id: "1",
//     labelKey: "Failed",
//     Icon: TriangleFill,
//     iconColor: "#b91c1c",
//   },
//   {
//     ColorCode: "1",
//     id: "2",
//     labelKey: "Sent",
//     Icon: checkSquare,
//     iconColor: "#15803d",
//   },
//   {
//     ColorCode: "0",
//     id: "3",
//     labelKey: "Pending",
//     Icon: HourglassIcon,
//     iconColor: "#b45309",
//   },
//   {
//     ColorCode: "2",
//     id: "4",
//     labelKey: "Header",
//     Icon: HeaderHome,
//     iconColor: "#e43030",
//   },
// ];

// const PageControlGearButton = ({ onOpen }) => (
//   <button
//     title="Dynamic Page Control Master (Ctrl+Shift+F2)"
//     onClick={(e) => {
//       e.stopPropagation();
//       onOpen();
//     }}
//     style={{
//       background: "none",
//       border: "none",
//       cursor: "pointer",
//       padding: "2px 6px",
//       borderRadius: "4px",
//       display: "inline-flex",
//       alignItems: "center",
//       color: "#6b7280",
//       transition: "color 0.2s",
//     }}
//     onMouseEnter={(e) => {
//       e.currentTarget.style.color = "#2563eb";
//       e.currentTarget.querySelector("svg").style.transform = "rotate(60deg)";
//       e.currentTarget.querySelector("svg").style.transition = "transform 0.3s";
//     }}
//     onMouseLeave={(e) => {
//       e.currentTarget.style.color = "#6b7280";
//       e.currentTarget.querySelector("svg").style.transform = "rotate(0deg)";
//     }}
//   >
//     <Settings size={16} />
//   </button>
// );

// const SMSData = () => {
//   const { t } = useTranslation();
//   const userData = useLocalStorage("userData", "get");

//   const isSuperAdmin = userData?.SuperAdmin == 1;
//   const theme = useLocalStorage("theme", "get");

//   const [showGear, setShowGear] = useState(false);
//   const [showPageControlDialog, setShowPageControlDialog] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [tableData, setTableData] = useState([]);
//   const [formData, setFormData] = useState({
//     ToDate: new Date(),
//     FromDate: new Date(),
//   });
//   const [controllerDynamicList, setControllerDynamicList] = useState([]);
//   const [transactionTypes, setTransactionTypes] = useState([]);
//   const [tabbingOrder, setTabbingOrder] = useState([]);
//   const [FilterData, setFilterData] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [pageSize, setPageSize] = useState(25);
//   const [headWithApiFields, setHeadWithApiFields] = useState({});
//   const [activeColorFilter, setActiveColorFilter] = useState(null);

//   // ── Ctrl + Shift + F2 → gear toggle ───────────────────────────────────────
//   useEffect(() => {
//     if (!isSuperAdmin) return;

//     const onKeyDown = (e) => {
//       if (e.ctrlKey && e.shiftKey && e.key === "F2") {
//         e.preventDefault();
//         e.stopPropagation();
//         setShowGear((prev) => !prev);
//       }
//     };

//     window.addEventListener("keydown", onKeyDown, true);
//     return () => window.removeEventListener("keydown", onKeyDown, true);
//   }, [isSuperAdmin]);

//   const selectedServices =
//     formData?.ServiceType?.map((x) => x?.value || x?.Id || x) || [];
//   const showMobile =
//     selectedServices.includes("sms") || selectedServices.includes("whatsapp");
//   const showEmail = selectedServices.includes("email");

//   const serviceType = [
//     { label: "SMS", value: "sms" },
//     { label: "WhatsApp", value: "whatsapp" },
//     { label: "Email", value: "email" },
//   ];

//   const filteredData = useMemo(() => {
//     let data = tableData;
//     if (activeColorFilter !== null)
//       data = data.filter(
//         (row) => String(row.ColorCode) === String(activeColorFilter),
//       );
//     if (searchTerm.trim()) {
//       const lower = searchTerm.toLowerCase();
//       data = data.filter((row) =>
//         Object.values(row).some((val) =>
//           String(val ?? "")
//             .toLowerCase()
//             .includes(lower),
//         ),
//       );
//     }
//     return data;
//   }, [tableData, searchTerm, activeColorFilter]);

//   const currentTableData = useMemo(() => {
//     const start = (currentPage - 1) * pageSize;
//     return filteredData.slice(start, start + pageSize);
//   }, [currentPage, pageSize, filteredData]);

//   const visibleTableColumns = useMemo(
//     () => FilterData.filter((item) => item.TypeId === 2 && item.IsShow === 1),
//     [FilterData],
//   );

//   const handleChangeSearch = (e) => {
//     setSearchTerm(e.target.value);
//     setCurrentPage(1);
//   };
//   const handleSelectMultiChange = (name, value) =>
//     setFormData((p) => ({ ...p, [name]: value }));
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((p) => ({ ...p, [name]: value }));
//   };
//   const dateSelect = (value, name) =>
//     setFormData((p) => ({ ...p, [name]: value }));
//   const handleColorFilterClick = (ColorCode) => {
//     setCurrentPage(1);
//     setActiveColorFilter((p) => (p === ColorCode ? null : ColorCode));
//   };

//   const isHideController = (cntrId = "") => {
//     if (!controllerDynamicList?.length) return true;
//     const found = controllerDynamicList.find(
//       (x) => x?.ControlDisplayID === cntrId,
//     );
//     if (found?.ControlDisplayID) return !!found.IsShow;
//     return true;
//   };

//   const getSearchData = async () => {
//     setLoading(true);
//     setActiveColorFilter(null);
//     const payload = {
//       ServiceType:
//         formData?.ServiceType?.map((x) => x?.value || x?.Id || x) || [],
//       TransactionType:
//         formData?.TransactionType?.map((x) => x?.value || x?.Id || x) || [],
//       ToEmail: formData?.emailTo || "",
//       CcEmail: formData?.emailCc || "",
//       BccEmail: formData?.emailBcc || "",
//       FromDate: moment(formData.FromDate).format("DD/MMM/YYYY"),
//       ToDate: moment(formData.ToDate).format("DD/MMM/YYYY"),
//       MobileNo: formData?.mobile || "",
//     };
//     try {
//       const res = await axiosInstance.post(
//         "/CompanyMaster/GetTransactionTypeReport",
//         payload,
//       );
//       const data = Array.isArray(res?.data?.message) ? res.data.message : [];
//       setTableData(data);
//       setCurrentPage(1);

//       if (data.length > 0) {
//         toast.success("Data fetched successfully");
//       } else {
//         toast.info("No Record Found");
//       }
//     } catch (err) {
//       toast.error(
//         err?.response?.data?.message || "Error occurred while fetching data",
//       );
//       setTableData([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ── Excel export — table ke saath exactly match karta hai ─────────────────
//   const exportToExcel = () => {
//     if (!tableData.length) {
//       toast.info("No Data Found");
//       return;
//     }
//     if (!visibleTableColumns.length) {
//       toast.info("No columns enabled for export");
//       return;
//     }

//     const excelData = tableData.map((ele, index) => {
//       const row = {};

//       visibleTableColumns.forEach((col) => {
//         const colHeader = col.ControlDisplayName || col.ControlDisplayID;

//         switch (col.ControlDisplayID) {
//           // ── S No. — serial number + status (text me) ──────────────────────
//           case "S No.": {
//             const statusEntry = colorCodingData.find(
//               (c) => String(c.ColorCode) === String(ele.ColorCode),
//             );
//             const statusLabel = statusEntry?.labelKey || "";
//             row["S No."] = index + 1;
//             row["Status"] = statusLabel;
//             break;
//           }

//           // ── ServiceType — ServiceType + TransactionType dono ──────────────
//           case "ServiceType":
//             row[colHeader] =
//               [ele.ServiceType, ele.TransactionType]
//                 .filter(Boolean)
//                 .join(" / ") || "";
//             break;

//           // ── TransactionType — alag column hai toh sirf woh ────────────────
//           case "TransactionType":
//             row[colHeader] = ele.TransactionType || "";
//             break;

//           // ── LedgerTransactionNo — sirf visit no ───────────────────────────
//           case "LedgerTransactionNo":
//             row[colHeader] = ele.LedgerTransactionNo || "";
//             break;

//           // ── PName — Name + Age/Gender dono eka saath ──────────────────────
//           case "PName": {
//             const ageGender =
//               ele.Age && ele.Gender
//                 ? `${ele.Age} / ${ele.Gender}`
//                 : ele.Age || ele.Gender || "";
//             row[colHeader] = ele.PName || "";
//             if (ageGender) row["Age / Gender"] = ageGender;
//             break;
//           }

//           // ── Age — sirf age/gender (agar alag column ho) ───────────────────
//           case "Age":
//             row[colHeader] =
//               ele.Age && ele.Gender
//                 ? `${ele.Age} / ${ele.Gender}`
//                 : ele.Age || ele.Gender || "";
//             break;

//           // ── MobileNo ──────────────────────────────────────────────────────
//           case "MobileNo":
//             row[colHeader] = ele.MobileNo || "";
//             break;

//           // ── RequestedBy ───────────────────────────────────────────────────
//           case "RequestedBy":
//             row[colHeader] = ele.RequestedBy || "";
//             break;

//           // ── RequestedDate — date aur time alag columns me ─────────────────
//           case "RequestedDate": {
//             const parts = (ele.RequestedDate || "").split(" ");
//             row["Requested Date"] = parts[0] || "";
//             row["Requested Time"] = parts.slice(1).join(" ") || "";
//             break;
//           }

//           // ── ErrorCount ────────────────────────────────────────────────────
//           case "ErrorCount":
//             row[colHeader] = ele.ErrorCount ?? "";
//             break;

//           // ── MessageTo ─────────────────────────────────────────────────────
//           case "MessageTo":
//             row[colHeader] = ele.MessageTo || "";
//             break;

//           // ── Email — To / CC / Bcc + Mobile alag lines ─────────────────────
//           case "Email":
//             if (ele.ServiceType?.toLowerCase() === "email") {
//               const emailParts = [
//                 ele.ToEmail ? `To: ${ele.ToEmail}` : "",
//                 ele.CCEmail ? `CC: ${ele.CCEmail}` : "",
//                 ele.BCCEmail ? `Bcc: ${ele.BCCEmail}` : "",
//               ]
//                 .filter(Boolean)
//                 .join("\n");
//               row[colHeader] = emailParts || "";
//               row["Mobile (Email)"] = ele.MobileNo || "";
//             } else {
//               row[colHeader] = "";
//               row["Mobile (Email)"] = "";
//             }
//             break;

//           // ── Default — baaki sab dynamic columns ───────────────────────────
//           default:
//             row[colHeader] =
//               ele[col.ApiFieldName || col.ControlDisplayID] ?? "";
//         }
//       });

//       return row;
//     });

//     const worksheet = XLSX.utils.json_to_sheet(excelData);

//     // ── Column width auto-fit ──────────────────────────────────────────────
//     const colKeys = Object.keys(excelData[0] || {});
//     worksheet["!cols"] = colKeys.map((key) => ({
//       wch:
//         Math.max(
//           key.length,
//           ...excelData.map((row) => String(row[key] ?? "").length),
//         ) + 2,
//     }));

//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, "Communication Log");
//     XLSX.writeFile(workbook, "CommunicationLog.xlsx");
//   };

//   const controllerDynamic = async () => {
//     try {
//       const { controllersData, controllerTabbingOrder } =
//         await getSearchController(PAGE_ID);
//       setTabbingOrder(controllerTabbingOrder);
//       setControllerDynamicList(controllersData);
//       if (Array.isArray(controllersData)) {
//         setFilterData(controllersData);
//         const dynamicMappings = { ...headWithApiFields };
//         controllersData.forEach((col) => {
//           if (!dynamicMappings[col.ControlDisplayID])
//             dynamicMappings[col.ControlDisplayID] =
//               col.ApiFieldName || col.ControlDisplayID;
//         });
//         setHeadWithApiFields(dynamicMappings);
//       }
//     } catch (error) {
//       console.error("error in controllerDynamic:", error);
//     }
//   };

//   useEffect(() => {
//     controllerDynamic();
//     GetGlobalData(setTransactionTypes, "SMS_Log_Report_Transaction_Typ");
//   }, []);

//   const renderCell = (col, ele, globalIndex) => {
//     switch (col.ControlDisplayID) {
//       case "S No.": {
//         const statusEntry = colorCodingData.find(
//           (c) => String(c.ColorCode) === String(ele.ColorCode),
//         );
//         const StatusIcon = statusEntry?.Icon;
//         const statusIconColor = statusEntry?.iconColor;
//         const srTooltip =
//           ele.ErrorCount != null ? `Error Count: ${ele.ErrorCount}` : "";
//         return (
//           <div
//             title={srTooltip}
//             style={{ display: "flex", alignItems: "center", gap: "6px" }}
//           >
//             {globalIndex + 1}
//             {ele.IsHeader === 1 && (
//               <HeaderHome
//                 size={15}
//                 style={{ flexShrink: 0, marginBottom: 0 }}
//               />
//             )}
//             {StatusIcon && (
//               <StatusIcon
//                 size={15}
//                 color={statusIconColor}
//                 style={{ flexShrink: 0, marginBottom: 0 }}
//               />
//             )}
//           </div>
//         );
//       }
//       case "ServiceType":
//         return (
//           <>
//             <div>{ele.ServiceType || ""}</div>
//             <div>{ele.TransactionType || ""}</div>
//           </>
//         );
//       case "PName":
//         return (
//           <>
//             <div>{ele.PName || ""}</div>
//             <div style={{ color: "#333", fontSize: "1em" }}>
//               {ele.Age && ele.Gender
//                 ? `${ele.Age} / ${ele.Gender}`
//                 : ele.Age || ele.Gender || ""}
//             </div>
//           </>
//         );
//       case "LedgerTransactionNo":
//         return (
//           <div>
//             <div>{ele.LedgerTransactionNo || ""}</div>
//           </div>
//         );
//       case "Age":
//         return ele.Age && ele.Gender
//           ? `${ele.Age} / ${ele.Gender}`
//           : ele.Age || ele.Gender;
//       case "MobileNo":
//         return ele.MobileNo;
//       case "RequestedBy":
//         return ele.RequestedBy;
//       case "RequestedDate": {
//         const parts = (ele.RequestedDate || "").split(" ");
//         return (
//           <>
//             <div>{parts[0]}</div>
//             <div>{parts.slice(1).join(" ")}</div>
//           </>
//         );
//       }
//       case "ErrorCount":
//         return ele.ErrorCount;
//       case "MessageTo":
//         return ele.MessageTo;
//       case "Email":
//         if (ele.ServiceType?.toLowerCase() === "email") {
//           return (
//             <div>
//               {ele.ToEmail || ele.CCEmail || ele.BCCEmail ? (
//                 <>
//                   {ele.ToEmail && (
//                     <div>
//                       <strong>To:</strong> {ele.ToEmail}
//                     </div>
//                   )}
//                   {ele.CCEmail && (
//                     <div>
//                       <strong>CC:</strong> {ele.CCEmail}
//                     </div>
//                   )}
//                   {ele.BCCEmail && (
//                     <div>
//                       <strong>Bcc:</strong> {ele.BCCEmail}
//                     </div>
//                   )}
//                 </>
//               ) : (
//                 ""
//               )}
//               {ele.MobileNo && (
//                 <div style={{ marginTop: "4px", color: "#444" }}>
//                   <strong>Mob:</strong> {ele.MobileNo}
//                 </div>
//               )}
//             </div>
//           );
//         }
//         return null;
//       default:
//         return ele[col.ApiFieldName || col.ControlDisplayID] ?? "";
//     }
//   };

//   const accordionHeading = (
//     <span
//       style={{ display: "inline-flex", alignItems: "center", width: "100%" }}
//     >
//       {t("Digital Communication Log")}
//     </span>
//   );

//   return (
//     <>
//       <Accordion
//         name={accordionHeading}
//         isBreadcrumb={true}
//         defaultValue={true}
//         seconTitle={
//           <div style={{ marginLeft: "auto" }}>
//             {isSuperAdmin && showGear && (
//               <PageControlGearButton
//                 pageId={PAGE_ID}
//                 onOpen={() => setShowPageControlDialog(true)}
//               />
//             )}
//           </div>
//         }
//       >
//         <div className="row pt-2 pl-2 pr-2 mt-1">
//           {controllerDynamicList
//             ?.filter((item) => item?.TypeId === 1 && item?.IsShow === 1)
//             ?.map((item, index) => {
//               if (
//                 item?.ControlDisplayID === "ServiceType" &&
//                 isHideController("ServiceType")
//               )
//                 return (
//                   <div className="col-sm-2" key={index}>
//                     <MultiSelectComp
//                       className="required-fields"
//                       options={serviceType}
//                       onChange={handleSelectMultiChange}
//                       name="ServiceType"
//                       label="Service Type"
//                       value={formData?.ServiceType}
//                     />
//                   </div>
//                 );
//               if (
//                 item?.ControlDisplayID === "TransactionType" &&
//                 isHideController("TransactionType")
//               )
//                 return (
//                   <div className="col-sm-2" key={index}>
//                     <MultiSelectComp
//                       className="required-fields"
//                       options={transactionTypes}
//                       onChange={handleSelectMultiChange}
//                       name="TransactionType"
//                       label="TransactionType"
//                       value={formData?.TransactionType}
//                     />
//                   </div>
//                 );
//               if (
//                 item?.ControlDisplayID === "FromDate" &&
//                 isHideController("FromDate")
//               )
//                 return (
//                   <div className="col-sm-2" key={index}>
//                     <DatePicker
//                       className="custom-calendar"
//                       name="FromDate"
//                       value={formData?.FromDate}
//                       onChange={dateSelect}
//                       placeholder=" "
//                       id="FromDate"
//                       lable="FromDate"
//                       maxDate={new Date()}
//                     />
//                   </div>
//                 );
//               if (
//                 item?.ControlDisplayID === "ToDate" &&
//                 isHideController("ToDate")
//               )
//                 return (
//                   <div className="col-sm-2" key={index}>
//                     <DatePicker
//                       className="custom-calendar"
//                       name="ToDate"
//                       value={formData?.ToDate}
//                       onChange={dateSelect}
//                       placeholder=" "
//                       id="ToDate"
//                       lable="ToDate"
//                       maxDate={new Date()}
//                       minDate={
//                         formData?.FromDate ? new Date(formData?.FromDate) : null
//                       }
//                     />
//                   </div>
//                 );
//               if (
//                 item?.ControlDisplayID === "mobile" &&
//                 isHideController("mobile") &&
//                 showMobile
//               )
//                 return (
//                   <div className="col-sm-2" key={index}>
//                     <Input
//                       lable="Mobile"
//                       id="mobile"
//                       placeholder=" "
//                       onChange={handleChange}
//                       value={formData?.mobile}
//                       name="mobile"
//                       type="number"
//                     />
//                   </div>
//                 );
//               if (
//                 item?.ControlDisplayID === "emailTo" &&
//                 isHideController("emailTo") &&
//                 showEmail
//               )
//                 return (
//                   <div className="col-sm-2" key={index}>
//                     <Input
//                       lable="EmailID To"
//                       id="emailTo"
//                       placeholder=" "
//                       onChange={handleChange}
//                       value={formData?.emailTo}
//                       name="emailTo"
//                       type="email"
//                     />
//                   </div>
//                 );
//               if (
//                 item?.ControlDisplayID === "emailCc" &&
//                 isHideController("emailCc") &&
//                 showEmail
//               )
//                 return (
//                   <div className="col-sm-2" key={index}>
//                     <Input
//                       lable="EmailID CC"
//                       id="emailCc"
//                       placeholder=" "
//                       onChange={handleChange}
//                       value={formData?.emailCc}
//                       name="emailCc"
//                       type="email"
//                     />
//                   </div>
//                 );
//               if (
//                 item?.ControlDisplayID === "emailBcc" &&
//                 isHideController("emailBcc") &&
//                 showEmail
//               )
//                 return (
//                   <div className="col-sm-2" key={index}>
//                     <Input
//                       lable="EmailID Bcc"
//                       id="emailBcc"
//                       placeholder=" "
//                       onChange={handleChange}
//                       value={formData?.emailBcc}
//                       name="emailBcc"
//                       type="email"
//                     />
//                   </div>
//                 );
//               return null;
//             })}
//           <div className="col-md-1 mb-2">
//             <SearchButton text={"Search"} onClick={getSearchData} />
//           </div>
//           <div className="col-md-1 mb-2">
//             <CustomButton
//               text="Excel"
//               icon="excel"
//               value="Excel"
//               onClick={exportToExcel}
//             />
//           </div>
//         </div>
//       </Accordion>

//       <Accordion
//         title={t("Search Data")}
//         defaultValue={true}
//         seconTitle={
//           <div
//             className="ml-auto d-flex align-items-center px-2 mt-1"
//             style={{ gap: "12px" }}
//           >
//             <div
//               className="d-flex align-items-center"
//               style={{ gap: "10px", fontSize: "12px" }}
//             >
//               {colorCodingData.map(
//                 ({ labelKey, ColorCode, Icon, iconColor }, index) => (
//                   <div
//                     key={index}
//                     className="d-flex align-items-center"
//                     style={{ gap: "4px", cursor: "pointer" }}
//                     onClick={() => handleColorFilterClick(ColorCode)}
//                     title={
//                       activeColorFilter === ColorCode
//                         ? `Remove ${t(labelKey)} filter`
//                         : `Apply ${t(labelKey)} filter`
//                     }
//                   >
//                     <Icon
//                       size={14}
//                       color={iconColor}
//                       strokeWidth={2.2}
//                       style={{
//                         opacity:
//                           activeColorFilter === null ||
//                           activeColorFilter === ColorCode
//                             ? 1
//                             : 0.4,
//                         marginBottom: "0px",
//                       }}
//                     />
//                     <span>{t(labelKey)}</span>
//                   </div>
//                 ),
//               )}
//             </div>
//             <Input
//               type="text"
//               name="search"
//               id="search"
//               placeholder="Search Communication Log..."
//               value={searchTerm}
//               onChange={handleChangeSearch}
//             />
//           </div>
//         }
//       >
//         {loading ? (
//           <Loading />
//         ) : (
//           <div className="row p-2">
//             <div className="col-12">
//               {filteredData.length > 0 ? (
//                 <>
//                   <Tables>
//                     <thead>
//                       <tr>
//                         {visibleTableColumns.map((col, idx) => (
//                           <th key={idx}>
//                             {t(col.ControlDisplayName || col.ControlDisplayID)}
//                           </th>
//                         ))}
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {currentTableData.map((ele, rowIndex) => {
//                         const globalIndex =
//                           (currentPage - 1) * pageSize + rowIndex;
//                         return (
//                           <tr key={ele.ID ?? rowIndex}>
//                             {visibleTableColumns.map((col, colIndex) => (
//                               <td key={colIndex}>
//                                 {renderCell(col, ele, globalIndex)}
//                               </td>
//                             ))}
//                           </tr>
//                         );
//                       })}
//                     </tbody>
//                   </Tables>

//                   {filteredData.length > pageSize && (
//                     <div className="d-flex flex-wrap justify-content-end align-items-center gap-2 mt-3">
//                       <div style={{ minWidth: "130px" }}>
//                         <ReactSelect
//                           value={pageSize}
//                           dynamicOptions={[
//                             { label: "25", value: 25 },
//                             { label: "50", value: 50 },
//                             { label: "100", value: 100 },
//                             { label: "150", value: 150 },
//                           ]}
//                           name="pageSize"
//                           label={t("Page Size")}
//                           removeIsClearable={true}
//                           onChange={(name, value) => {
//                             setPageSize(value?.value ?? 50);
//                             setCurrentPage(1);
//                           }}
//                         />
//                       </div>
//                       <Pagination
//                         className="pagination-bar"
//                         currentPage={currentPage}
//                         totalCount={filteredData.length}
//                         pageSize={pageSize}
//                         onPageChange={(page) => setCurrentPage(page)}
//                       />
//                     </div>
//                   )}
//                 </>
//               ) : (
//                 <div className="text-center py-3">
//                   <span>
//                     {activeColorFilter !== null
//                       ? t("No Data Found for selected filter")
//                       : t("No Data Found")}
//                   </span>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}
//       </Accordion>

//       {/* Page Control Master Dialog */}
//       <Dialog
//         header="Page Control Master"
//         visible={showPageControlDialog}
//         onHide={() => setShowPageControlDialog(false)}
//         className={theme}
//         style={{ width: "100vw", maxWidth: "100vw", height: "100vh" }}
//         contentStyle={{
//           height: "calc(100vh - 60px)",
//           overflowY: "auto",
//           padding: "0",
//         }}
//         maximized={true}
//         maximizable
//       >
//         <PageControlMaster embeddedPageId={PAGE_ID} />
//       </Dialog>
//     </>
//   );
// };

// export default SMSData;
import React, { useEffect, useState, useMemo } from "react";
import Accordion from "@app/components/UI/Accordion";
import { useTranslation } from "react-i18next";
import Input from "../../components/formComponent/Input";
import Tables from "../../components/UI/customTable";
import Loading from "../../components/loader/Loading";
import { axiosInstance } from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import { SearchButton, CustomButton } from "../../components/UI/CustomButton";
import MultiSelectComp from "../../components/formComponent/MultiSelectComp";
import {
  GetGlobalData,
  getSearchController,
} from "../../utils/NetworkApi/commonApi";
import DatePicker from "../../components/formComponent/DatePicker";
import * as XLSX from "xlsx";
import Pagination from "../../Pagination/Pagination";
import ReactSelect from "../../components/formComponent/ReactSelect";
import moment from "moment";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import PageControlGear from "../../components/PageGearModel/PageControlGear";
import ColorCodingSearch from "../../components/ModalComponent/ColorCodingSearch";

const PAGE_ID = "762";

const HeaderHome = ({ size = 15, color = "#e43030", style }) => (
  <i
    className="bi bi-house-heart-fill"
    style={{ fontSize: size, color, ...style }}
  />
);
const HourglassIcon = ({ size = 15, color = "#b45309", style }) => (
  <i
    className="bi bi-hourglass-split"
    style={{ fontSize: size, color, ...style }}
  />
);
const checkSquare = ({ size = 15, color = "#15803d", style }) => (
  <i
    className="bi bi-check2-circle"
    style={{ fontSize: size, color, ...style }}
  />
);
const TriangleFill = ({ size = 15, color = "#b91c1c", style }) => (
  <i
    className="bi bi-exclamation-triangle-fill"
    style={{ fontSize: size, color, ...style }}
  />
);

const colorCodingData = [
  {
    ColorCode: "-1",
    id: "1",
    labelKey: "Failed",
    Icon: TriangleFill,
    iconColor: "#b91c1c",
    rowColor: "#FFB6C1"
  },
  {
    ColorCode: "1",
    id: "2",
    labelKey: "Sent",
    Icon: checkSquare,
    iconColor: "#15803d",
    rowColor: "#8ef58e66"
  },
  {
    ColorCode: "0",
    id: "3",
    labelKey: "Pending",
    Icon: HourglassIcon,
    iconColor: "#b45309",
    rowColor: "#FFFFFF"
  },
  {
    ColorCode: "2",
    id: "4",
    labelKey: "Header",
    Icon: HeaderHome,
    iconColor: "#e43030",
    rowColor: "#FFB6C1"
  },
];

const SMSData = () => {
  const { t } = useTranslation();
  const userData = useLocalStorage("userData", "get");
  const isSuperAdmin = userData?.SuperAdmin == 1;

  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [formData, setFormData] = useState({
    ToDate: new Date(),
    FromDate: new Date(),
  });
  const [controllerDynamicList, setControllerDynamicList] = useState([]);
  const [transactionTypes, setTransactionTypes] = useState([]);
  const [tabbingOrder, setTabbingOrder] = useState([]);
  const [FilterData, setFilterData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [headWithApiFields, setHeadWithApiFields] = useState({});
  const [activeColorFilter, setActiveColorFilter] = useState(null);

  const selectedServices =
    formData?.ServiceType?.map((x) => x?.value || x?.Id || x) || [];
  const showMobile =
    selectedServices.includes("sms") || selectedServices.includes("whatsapp");
  const showEmail = selectedServices.includes("email");

  const serviceType = [
    { label: "SMS", value: "sms" },
    { label: "WhatsApp", value: "whatsapp" },
    { label: "Email", value: "email" },
  ];

  const filteredData = useMemo(() => {
    let data = tableData;
    if (activeColorFilter !== null)
      data = data.filter(
        (row) => String(row.ColorCode) === String(activeColorFilter),
      );
    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      data = data.filter((row) =>
        Object.values(row).some((val) =>
          String(val ?? "")
            .toLowerCase()
            .includes(lower),
        ),
      );
    }
    return data;
  }, [tableData, searchTerm, activeColorFilter]);

  const currentTableData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [currentPage, pageSize, filteredData]);

  const colorCounts = useMemo(() => {
    const counts = {};
    tableData.forEach((row) => {
      const key = String(row.ColorCode);
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }, [tableData]);

  const visibleTableColumns = useMemo(() => {
    if (isSuperAdmin) {
      return FilterData.filter((item) => item.TypeId === 2);
    }
    return FilterData.filter((item) => item.TypeId === 2 && item.IsShow === 1);
  }, [FilterData, isSuperAdmin]);

  const handleChangeSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };
  const handleSelectMultiChange = (name, value) =>
    setFormData((p) => ({ ...p, [name]: value }));
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };
  const dateSelect = (value, name) =>
    setFormData((p) => ({ ...p, [name]: value }));
  const handleColorFilterClick = (ColorCode) => {
    setCurrentPage(1);
    setActiveColorFilter((p) => (p === ColorCode ? null : ColorCode));
  };

  const isHideController = (cntrId = "") => {
    if (isSuperAdmin) return true;
    if (!controllerDynamicList?.length) return true;
    const found = controllerDynamicList.find(
      (x) => x?.ControlDisplayID === cntrId,
    );
    if (found?.ControlDisplayID) return !!found.IsShow;
    return true;
  };

  const getSearchData = async () => {
    setLoading(true);
    setActiveColorFilter(null);
    const payload = {
      ServiceType:
        formData?.ServiceType?.map((x) => x?.value || x?.Id || x) || [],
      TransactionType:
        formData?.TransactionType?.map((x) => x?.value || x?.Id || x) || [],
      ToEmail: formData?.emailTo || "",
      CcEmail: formData?.emailCc || "",
      BccEmail: formData?.emailBcc || "",
      FromDate: moment(formData.FromDate).format("DD/MMM/YYYY"),
      ToDate: moment(formData.ToDate).format("DD/MMM/YYYY"),
      MobileNo: formData?.mobile || "",
    };
    try {
      const res = await axiosInstance.post(
        "/CompanyMaster/GetTransactionTypeReport",
        payload,
      );
      const data = Array.isArray(res?.data?.message) ? res.data.message : [];
      setTableData(data);
      setCurrentPage(1);
      if (data.length > 0) {
        toast.success("Data fetched successfully");
      } else {
        toast.info("No Record Found");
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Error occurred while fetching data",
      );
      setTableData([]);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    if (!tableData.length) {
      toast.info("No Data Found");
      return;
    }
    if (!visibleTableColumns.length) {
      toast.info("No columns enabled for export");
      return;
    }

    const excelData = tableData.map((ele, index) => {
      const row = {};
      visibleTableColumns.forEach((col) => {
        const colHeader = col.ControlDisplayName || col.ControlDisplayID;
        switch (col.ControlDisplayID) {
          case "S No.": {
            const statusEntry = colorCodingData.find(
              (c) => String(c.ColorCode) === String(ele.ColorCode),
            );
            row["S No."] = index + 1;
            row["Status"] = statusEntry?.labelKey || "";
            break;
          }
          case "ServiceType":
            row[colHeader] =
              [ele.ServiceType, ele.TransactionType]
                .filter(Boolean)
                .join(" / ") || "";
            break;
          case "TransactionType":
            row[colHeader] = ele.TransactionType || "";
            break;
          case "LedgerTransactionNo":
            row[colHeader] = ele.LedgerTransactionNo || "";
            break;
          case "PName": {
            const ageGender =
              ele.Age && ele.Gender
                ? `${ele.Age} / ${ele.Gender}`
                : ele.Age || ele.Gender || "";
            row[colHeader] = ele.PName || "";
            if (ageGender) row["Age / Gender"] = ageGender;
            break;
          }
          case "Age":
            row[colHeader] =
              ele.Age && ele.Gender
                ? `${ele.Age} / ${ele.Gender}`
                : ele.Age || ele.Gender || "";
            break;
          case "MobileNo":
            row[colHeader] = ele.MobileNo || "";
            break;
          case "RequestedBy":
            row[colHeader] = ele.RequestedBy || "";
            break;
          case "RequestedDate": {
            const parts = (ele.RequestedDate || "").split(" ");
            row["Requested Date"] = parts[0] || "";
            row["Requested Time"] = parts.slice(1).join(" ") || "";
            break;
          }
          case "ErrorCount":
            row[colHeader] = ele.ErrorCount ?? "";
            break;
          case "MessageTo":
            row[colHeader] = ele.MessageTo || "";
            break;
          case "Email":
            if (ele.ServiceType?.toLowerCase() === "email") {
              const emailParts = [
                ele.ToEmail ? `To: ${ele.ToEmail}` : "",
                ele.CCEmail ? `CC: ${ele.CCEmail}` : "",
                ele.BCCEmail ? `Bcc: ${ele.BCCEmail}` : "",
              ]
                .filter(Boolean)
                .join("\n");
              row[colHeader] = emailParts || "";
              row["Mobile (Email)"] = ele.MobileNo || "";
            } else {
              row[colHeader] = "";
              row["Mobile (Email)"] = "";
            }
            break;
          default:
            row[colHeader] =
              ele[col.ApiFieldName || col.ControlDisplayID] ?? "";
        }
      });
      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const colKeys = Object.keys(excelData[0] || {});
    worksheet["!cols"] = colKeys.map((key) => ({
      wch:
        Math.max(
          key.length,
          ...excelData.map((row) => String(row[key] ?? "").length),
        ) + 2,
    }));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Communication Log");
    XLSX.writeFile(workbook, "CommunicationLog.xlsx");
  };

  const controllerDynamic = async () => {
    try {
      const { controllersData, controllerTabbingOrder } =
        await getSearchController(PAGE_ID);
      setTabbingOrder(controllerTabbingOrder);
      setControllerDynamicList(controllersData);
      if (Array.isArray(controllersData)) {
        setFilterData(controllersData);
        const dynamicMappings = { ...headWithApiFields };
        controllersData.forEach((col) => {
          if (!dynamicMappings[col.ControlDisplayID])
            dynamicMappings[col.ControlDisplayID] =
              col.ApiFieldName || col.ControlDisplayID;
        });
        setHeadWithApiFields(dynamicMappings);
      }
    } catch (error) {
      console.error("error in controllerDynamic:", error);
    }
  };

  useEffect(() => {
    controllerDynamic();
    GetGlobalData(setTransactionTypes, "SMS_Log_Report_Transaction_Typ");
  }, []);

  const renderCell = (col, ele, globalIndex) => {
    switch (col.ControlDisplayID) {
      case "S No.": {
        const statusEntry = colorCodingData.find(
          (c) => String(c.ColorCode) === String(ele.ColorCode),
        );
        const StatusIcon = statusEntry?.Icon;
        const statusIconColor = statusEntry?.iconColor;
        const srTooltip = `Error Count: ${ele.ErrorCount}`;
        return (
          <div
            title={ele.IsHeader !== 1 && ele.ErrorCount > 0 ? srTooltip : ""}
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            {globalIndex + 1}
            {ele.IsHeader === 1 && (
              <HeaderHome size={15} style={{ flexShrink: 0, marginBottom: 0 }} />
            )}
            {ele.ErrorCount > 0 && StatusIcon && (
              <>
                <StatusIcon
                  size={15}
                  color={statusIconColor}
                  style={{ flexShrink: 0, marginBottom: 0 }}
                />
                <span style={{ fontSize: 10, color: statusIconColor, fontWeight: 600 }}>
                  ({ele.ErrorCount})
                </span>
              </>
            )}
          </div>
        );
      }
      case "ServiceType":
        return (
          <>
            <div>{ele.ServiceType || ""}</div>
            <div>{ele.TransactionType || ""}</div>
          </>
        );
      case "PName":
        return (
          <>
            <div>{ele.PName || ""}</div>
            <div style={{ color: "#333", fontSize: "1em" }}>
              {ele.Age && ele.Gender
                ? `${ele.Age} / ${ele.Gender}`
                : ele.Age || ele.Gender || ""}
            </div>
          </>
        );
      case "LedgerTransactionNo":
        return (
          <div>
            <div>{ele.LedgerTransactionNo || ""}</div>
          </div>
        );
      case "Age":
        return ele.Age && ele.Gender
          ? `${ele.Age} / ${ele.Gender}`
          : ele.Age || ele.Gender;
      case "MobileNo":
        return ele.MobileNo;
      case "RequestedBy":
        return ele.RequestedBy;
      case "RequestedDate": {
        const parts = (ele.RequestedDate || "").split(" ");
        return (
          <>
            <div>{parts[0]}</div>
            <div>{parts.slice(1).join(" ")}</div>
          </>
        );
      }
      case "ErrorCount":
        return ele.ErrorCount;
      case "MessageTo":
        return ele.MessageTo;
      case "Email":
        if (ele.ServiceType?.toLowerCase() === "email") {
          return (
            <div>
              {ele.ToEmail || ele.CCEmail || ele.BCCEmail ? (
                <>
                  {ele.ToEmail && (
                    <div>
                      <strong>To:</strong> {ele.ToEmail}
                    </div>
                  )}
                  {ele.CCEmail && (
                    <div>
                      <strong>CC:</strong> {ele.CCEmail}
                    </div>
                  )}
                  {ele.BCCEmail && (
                    <div>
                      <strong>Bcc:</strong> {ele.BCCEmail}
                    </div>
                  )}
                </>
              ) : (
                ""
              )}
              {ele.MobileNo && (
                <div style={{ marginTop: "4px", color: "#444" }}>
                  <strong>Mob:</strong> {ele.MobileNo}
                </div>
              )}
            </div>
          );
        }
        return null;
      default:
        return ele[col.ApiFieldName || col.ControlDisplayID] ?? "";
    }
  };

  const accordionHeading = (
    <span
      style={{ display: "inline-flex", alignItems: "center", width: "100%" }}
    >
      {t("Digital Communication Log")}
    </span>
  );

  return (
    <>
      <Accordion
        name={accordionHeading}
        isBreadcrumb={true}
        defaultValue={true}
        seconTitle={
          <div style={{ marginLeft: "auto" }}>
            <PageControlGear pageId={PAGE_ID} />
          </div>
        }
      >
        <div className="row pt-2 pl-2 pr-2 mt-1">
          {controllerDynamicList
            ?.filter((item) =>
              isSuperAdmin ? item?.TypeId === 1 : item.TypeId === 1 && item.IsShow === 1
            )
            ?.map((item, index) => {
              if (
                item?.ControlDisplayID === "Service Type" &&
                isHideController("Service Type")
              )
                return (
                  <div className="col-sm-2" key={index}>
                    <MultiSelectComp
                      className="required-fields"
                      options={serviceType}
                      onChange={handleSelectMultiChange}
                      name="ServiceType"
                      label="Service Type"
                      value={formData?.ServiceType}
                    />
                  </div>
                );
              if (
                item?.ControlDisplayID === "TransactionType" &&
                isHideController("TransactionType")
              )
                return (
                  <div className="col-sm-2" key={index}>
                    <MultiSelectComp
                      className="required-fields"
                      options={transactionTypes}
                      onChange={handleSelectMultiChange}
                      name="TransactionType"
                      label="TransactionType"
                      value={formData?.TransactionType}
                    />
                  </div>
                );
              if (
                item?.ControlDisplayID === "FromDate" &&
                isHideController("FromDate")
              )
                return (
                  <div className="col-sm-2" key={index}>
                    <DatePicker
                      className="custom-calendar"
                      name="FromDate"
                      value={formData?.FromDate}
                      onChange={dateSelect}
                      placeholder=" "
                      id="FromDate"
                      lable="FromDate"
                      maxDate={new Date()}
                    />
                  </div>
                );
              if (
                item?.ControlDisplayID === "ToDate" &&
                isHideController("ToDate")
              )
                return (
                  <div className="col-sm-2" key={index}>
                    <DatePicker
                      className="custom-calendar"
                      name="ToDate"
                      value={formData?.ToDate}
                      onChange={dateSelect}
                      placeholder=" "
                      id="ToDate"
                      lable="ToDate"
                      maxDate={new Date()}
                      minDate={
                        formData?.FromDate ? new Date(formData?.FromDate) : null
                      }
                    />
                  </div>
                );
              if (
                item?.ControlDisplayID === "mobile" &&
                isHideController("mobile") &&
                showMobile
              )
                return (
                  <div className="col-sm-2" key={index}>
                    <Input
                      lable="Mobile"
                      id="mobile"
                      placeholder=" "
                      onChange={handleChange}
                      value={formData?.mobile}
                      name="mobile"
                      type="number"
                    />
                  </div>
                );
              if (
                item?.ControlDisplayID === "emailTo" &&
                isHideController("emailTo") &&
                showEmail
              )
                return (
                  <div className="col-sm-2" key={index}>
                    <Input
                      lable="EmailID To"
                      id="emailTo"
                      placeholder=" "
                      onChange={handleChange}
                      value={formData?.emailTo}
                      name="emailTo"
                      type="email"
                    />
                  </div>
                );
              if (
                item?.ControlDisplayID === "emailCc" &&
                isHideController("emailCc") &&
                showEmail
              )
                return (
                  <div className="col-sm-2" key={index}>
                    <Input
                      lable="EmailID CC"
                      id="emailCc"
                      placeholder=" "
                      onChange={handleChange}
                      value={formData?.emailCc}
                      name="emailCc"
                      type="email"
                    />
                  </div>
                );
              if (
                item?.ControlDisplayID === "emailBcc" &&
                isHideController("emailBcc") &&
                showEmail
              )
                return (
                  <div className="col-sm-2" key={index}>
                    <Input
                      lable="EmailID Bcc"
                      id="emailBcc"
                      placeholder=" "
                      onChange={handleChange}
                      value={formData?.emailBcc}
                      name="emailBcc"
                      type="email"
                    />
                  </div>
                );
              return null;
            })}
          <div className="col-md-1 mb-2">
            <SearchButton text={"Search"} onClick={getSearchData} />
          </div>
          <div className="col-md-1 mb-2">
            <CustomButton
              text="Excel"
              icon="excel"
              value="Excel"
              onClick={exportToExcel}
            />
          </div>
        </div>
      </Accordion>

      <Accordion
        title={t("Search Data")}
        defaultValue={true}
        seconTitle={
          <div
            className="ml-auto d-flex align-items-center px-2 mt-1"
            style={{ gap: "12px" }}
          >
            <div
              className="d-flex align-items-center"
              style={{ gap: "10px", fontSize: "12px" }}
            >
              {colorCodingData.map(
                ({ labelKey, ColorCode, Icon, iconColor, rowColor }, index) => {
                  const count = colorCounts[String(ColorCode)] || 0;
                  return (
                    <div
                      key={index}
                      className="d-flex align-items-center"
                      style={{ gap: "4px", cursor: "pointer" }}
                      onClick={() => handleColorFilterClick(ColorCode)}
                      title={
                        activeColorFilter === ColorCode
                          ? `Remove ${t(labelKey)} filter`
                          : `Apply ${t(labelKey)} filter`
                      }
                    >
                      {labelKey !== "Header" ? (
                        <ColorCodingSearch
                          color={rowColor}
                          label={`${t(labelKey)} (${count})`}
                        />
                      ) : (
                        <>
                          <Icon
                            size={14}
                            color={iconColor}
                            strokeWidth={2.2}
                            style={{
                              opacity:
                                activeColorFilter === null ||
                                activeColorFilter === ColorCode
                                  ? 1
                                  : 0.4,
                              marginBottom: "0px",
                            }}
                          />
                          <span>{t(labelKey)} ({count})</span>
                        </>
                      )}
                    </div>
                  );
                },
              )}
            </div>
            <Input
              type="text"
              name="search"
              id="search"
              placeholder="Search Communication Log..."
              value={searchTerm}
              onChange={handleChangeSearch}
            />
          </div>
        }
      >
        {loading ? (
          <Loading />
        ) : (
          <div className="row p-2">
            <div className="col-12">
              {filteredData.length > 0 ? (
                <>
                  <Tables>
                    <thead>
                      <tr>
                        {visibleTableColumns.map((col, idx) => (
                          <th key={idx}>
                            {t(col.ControlDisplayName || col.ControlDisplayID)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {currentTableData.map((ele, rowIndex) => {
                        const globalIndex =
                          (currentPage - 1) * pageSize + rowIndex;
                        return (
                          <tr key={ele.ID ?? rowIndex}>
                            {visibleTableColumns.map((col, colIndex) => (
                              <td key={colIndex}
                                style={{
                                  backgroundColor: colorCodingData.find(
                                    (c) => String(c.ColorCode) === String(ele.ColorCode)
                                  )?.rowColor || "transparent",
                                }}
                              >
                                {renderCell(col, ele, globalIndex)}
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </Tables>

                  {filteredData.length > pageSize && (
                    <div className="d-flex flex-wrap justify-content-end align-items-center gap-2 mt-3">
                      <div style={{ minWidth: "130px" }}>
                        <ReactSelect
                          value={pageSize}
                          dynamicOptions={[
                            { label: "25", value: 25 },
                            { label: "50", value: 50 },
                            { label: "100", value: 100 },
                            { label: "150", value: 150 },
                          ]}
                          name="pageSize"
                          label={t("Page Size")}
                          removeIsClearable={true}
                          onChange={(name, value) => {
                            setPageSize(value?.value ?? 50);
                            setCurrentPage(1);
                          }}
                        />
                      </div>
                      <Pagination
                        className="pagination-bar"
                        currentPage={currentPage}
                        totalCount={filteredData.length}
                        pageSize={pageSize}
                        onPageChange={(page) => setCurrentPage(page)}
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-3">
                  <span>
                    {activeColorFilter !== null
                      ? t("No Data Found for selected filter")
                      : t("No Data Found")}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </Accordion>
    </>
  );
};

export default SMSData;
