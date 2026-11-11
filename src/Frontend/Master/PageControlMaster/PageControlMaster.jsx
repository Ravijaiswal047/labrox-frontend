// import React, { useEffect, useRef, useState } from "react";
// import SetOrderModal from "./SetOrderModal";
// import SetTabbingModal from "./SetTabbingModal";
// import Heading from "../../../components/UI/Heading";
// import ReactSelect from "../../../components/formComponent/ReactSelect";
// import { useTranslation } from "react-i18next";
// import { Button, Form } from "react-bootstrap";
// import CustomTable from "../../../components/Table/CustomTable";
// import { useLocalStorage } from "../../../utils/hooks/useLocalStorage";
// import { Dialog } from "primereact/dialog";
// import Input from "../../../components/formComponent/Input";
// import { CustomButton, SaveButton } from "../../../components/UI/CustomButton";
// import { axiosInstance } from "../../../utils/axiosInstance";
// import "./PageControlMaster.css";
// import {
//   finalUpdatePageControlData,
//   SavePageControlData,
//   UpdatePageControlData,
// } from "./PageControlMasterService";
// import { notify } from "../../../utils/utils";
// import FlagMappingTable from "./FlagMappingTable";
// import { toast } from "react-toastify";
// import TextAreaInput from "../../../components/formComponent/TextAreaInput";
// import { SiTextpattern } from "react-icons/si";
// import { useSearchParams } from "react-router-dom";

// // embeddedPageId — jab SMSData ke dialog se render ho toh yeh prop milega
// // agar direct route se aaya toh URL se padha jaega
// const PageControlMaster = ({ embeddedPageId = null }) => {
//   const [t] = useTranslation();
//   const isMobile = window.innerWidth <= 768;
//   const theme = useLocalStorage("theme", "get");
//   const [loading, setLoading] = useState(false);
//   const [exportLoading, setExportLoading] = useState(false);

//   // ── embeddedPageId prop ko priority do, phir URL se lo ──
//   const [searchParams] = useSearchParams();
//   const gearPageId = embeddedPageId ?? searchParams.get("pageId");

//   const [show, setShow] = useState(false);
//   const [showPattern, setShowPattern] = useState({
//     data: null,
//     visible: false,
//   });

//   const [isEdit, setIsEdit] = useState(false);
//   const [showOrderModal, setShowOrderModal] = useState(false);
//   const [showTabbingModal, setShowTabbingModal] = useState(false);
//   const [tableData, setTableData] = useState([]);
//   const [pattern, setPattern] = useState({
//     pageName: "",
//     controllerName: "",
//     controllerId: "",
//   });

//   const [dropdownList, setDropdownList] = useState({
//     pagesList: [],
//   });

//   const [payload, setPayload] = useState({
//     pageName: "",
//   });
//   const [controllerType, setControllerType] = useState(1);
//   const [formControls, setFormControls] = useState([]);
//   const [tabbingOrder, setTabbingOrder] = useState([]);
//   const [newController, setNewController] = useState({
//     pageName: "",
//     controllerName: "",
//     controllerId: "",
//   });
//   const [flagTableData, setFlagTableData] = useState([]);

//   useEffect(() => {
//     getPageData();
//     fetchFlagControlData();
//   }, []);

//   // ── gearPageId se payload auto-set karo ───────────────────────────────────
//   useEffect(() => {
//     if (gearPageId) {
//       setPayload((prev) => ({ ...prev, pageName: Number(gearPageId) }));
//     }
//   }, [gearPageId]);

//   // ── pagesList ready hone ke baad auto search karo ─────────────────────────
//   useEffect(() => {
//     if (gearPageId && dropdownList?.pagesList?.length > 0) {
//       getSearchController(Number(gearPageId));
//     }
//   }, [gearPageId, dropdownList?.pagesList]);

//   const getPageData = async () => {
//     try {
//       const res = await axiosInstance.get(`CompanyMaster/GetPageMasterData`);
//       const resList = res?.data?.message?.map((item) => ({
//         label: item?.PageName,
//         value: item?.PageID,
//       }));
//       setDropdownList((prev) => ({ ...prev, pagesList: resList }));
//     } catch (error) {
//       console.error("error", error);
//     }
//   };

//   const fetchFlagControlData = async (pageId) => {
//     try {
//       const res = await axiosInstance.post("CompanyMaster/GetCompanyConfig", {
//         pageID: 0,
//       });
//       const data = res?.data;
//       if (data.success) {
//         setFlagTableData(data?.message || []);
//       } else {
//         setFlagTableData([]);
//       }
//     } catch (error) {
//       console.log("Error while fetching flag data", error);
//     }
//   };

//   // ── overridePageId support — embedded ya URL dono se kaam kare ────────────
//   const getSearchController = async (overridePageId = null) => {
//     const pageId = overridePageId ?? payload?.pageName;

//     if (!pageId) {
//       notify("Kindly select Page Name", "warn");
//       return;
//     }

//     try {
//       const res = await axiosInstance.post(`CompanyMaster/GetPageDataDetails`, {
//         pageID: pageId,
//         TypeId: controllerType,
//       });

//       if (!Array.isArray(res?.data?.message)) {
//         notify(res?.data?.message, "error");
//         setFormControls([]);
//         setTabbingOrder([]);
//         return;
//       }

//       setTableData(res?.data?.message);

//       let sortedData = res?.data?.message?.sort(
//         (a, b) => a?.TabOrder - b?.TabOrder,
//       );
//       setFormControls(sortedData);

//       let tabbingOrderFilter = sortedData
//         ?.filter((item) => item?.TabOrder != 0)
//         ?.map((ele) => ({
//           ...ele,
//           id: ele?.ControlDisplayID,
//           name: ele?.ControlDisplayName,
//           index: ele?.TabOrder,
//         }));
//       setTabbingOrder(tabbingOrderFilter);
//     } catch (error) {
//       console.error("error", error);
//       setFormControls([]);
//       setTabbingOrder([]);
//     }
//   };

//   const jsonInputRef = useRef(null);

//   const ImportTableData = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     if (file.type !== "application/json") {
//       toast.error("Please select a valid JSON file");
//       e.target.value = "";
//       return;
//     }

//     setLoading(true);

//     const reader = new FileReader();

//     reader.onload = async () => {
//       try {
//         const jsonData = JSON.parse(reader.result);

//         if (!Array.isArray(jsonData) || jsonData.length === 0) {
//           toast.error("Invalid or empty JSON file");
//           return;
//         }

//         const finalTableData = jsonData.map((data) => ({
//           pageID: data.PageID,
//           typeId: data.TypeId,
//           pageName: data.PageName,
//           typeName: data.TypeName,
//           controlDisplayName: data.ControlDisplayName,
//           controlDisplayID: data.ControlDisplayID,
//           isShow: data.IsShow,
//           isMandatory: data.IsMandatory,
//           tabOrder: data.TabOrder,
//           displayOrder: data.DisplayOrder,
//         }));

//         const res = await axiosInstance.post(
//           "CompanyMaster/ImportJsonData",
//           finalTableData,
//         );

//         if (res?.data?.success) {
//           toast.success("Data Import Success");
//         } else {
//           toast.error(res?.data?.message || "Something went wrong");
//         }
//       } catch (error) {
//         toast.error("Invalid JSON format");
//         console.error(error);
//       } finally {
//         setLoading(false);
//         e.target.value = "";
//       }
//     };

//     reader.readAsText(file);
//   };

//   const ExportData = () => {
//     if (!tableData || tableData.length === 0) {
//       toast.error("No data available to export");
//       return;
//     }

//     setExportLoading(true);
//     const jsonData = JSON.stringify(tableData, null, 2);
//     const blob = new Blob([jsonData], { type: "application/json" });
//     const url = URL.createObjectURL(blob);

//     const link = document.createElement("a");
//     link.href = url;
//     link.download = `${payload.pageName}PageControlData.json`;
//     document.body.appendChild(link);
//     link.click();

//     document.body.removeChild(link);
//     URL.revokeObjectURL(url);
//     setExportLoading(false);
//   };

//   const handleTypeChange = (type) => {
//     setControllerType(type);
//     setFormControls([]);
//     setTabbingOrder([]);
//   };

//   const handleReactSelectChange = (name, e) => {
//     setPayload((prev) => ({ ...prev, [name]: e?.value }));
//   };

//   const handleModalReactSelectChange = (name, e) => {
//     setNewController((prev) => ({ ...prev, [name]: e?.value }));
//   };

//   const handleOpenModal = () => {
//     setIsEdit(false);
//     handleResetController();
//     setShow(true);
//   };

//   const handleResetController = () => {
//     setNewController({
//       pageName: payload?.pageName,
//       controllerName: "",
//       controllerId: "",
//     });
//   };

//   const handleEditController = (row) => {
//     setShow(true);
//     setNewController({
//       ID: row?.ID,
//       pageName: row?.PageID,
//       controllerName: row?.ControlDisplayName,
//       controllerId: row?.ControlDisplayID,
//     });
//     setIsEdit(true);
//   };

//   const selectedPageID = dropdownList?.pagesList?.find(
//     (item) => item?.value == newController?.pageName,
//   );

//   const handleSaveController = async () => {
//     if (!newController?.pageName || !newController?.controllerName?.trim()) {
//       notify("Please fill all required fields", "warn");
//       return;
//     }

//     const payload = {
//       pageName: selectedPageID?.label,
//       pageID: selectedPageID?.value,
//       controlDisplayName: newController?.controllerName,
//       ControlDisplayID: newController?.controllerId,
//       isActive: true,
//       TypeId: controllerType,
//       TypeName: controllerType === 1 ? "Form" : "Table",
//     };

//     let response = null;
//     if (isEdit) {
//       payload["ID"] = newController?.ID || 0;
//       response = await UpdatePageControlData([payload]);
//       setIsEdit(false);
//     } else {
//       response = await SavePageControlData(payload);
//     }

//     if (response?.success) {
//       getSearchController();
//       handleResetController();
//       setShow(false);
//     }
//     notify(response?.message, response?.success === true ? "success" : "error");
//   };

//   const handlePatternSave = async () => {
//     const payload = {
//       ID: showPattern?.data?.ID || 0,
//       pageID: showPattern?.data?.PageID,
//       pageName: showPattern?.data?.PageName,
//       ControlDisplayID: showPattern?.data?.ControlDisplayID,
//       DropDownPattern: showPattern?.data?.DropDownPattern,
//       TypeId: showPattern?.data?.TypeId,
//       TypeName: showPattern?.data?.TypeName,
//       controlDisplayName: showPattern?.data?.ControlDisplayName,
//       isActive: true,
//     };

//     const response = await UpdatePageControlData([payload]);

//     if (response?.success) {
//       getSearchController();
//       setShowPattern({ data: null, visible: false });
//     }
//     notify(response?.message, response?.success === true ? "success" : "error");
//   };

//   const handleSwitchChange = (index, field) => {
//     setFormControls((prev) =>
//       prev.map((item, idx) => {
//         if (idx === index) {
//           const updated = { ...item, [field]: !item[field] };
//           if (field === "IsShow" && !updated.IsShow)
//             updated.IsMandatory = false;
//           if (field === "IsMandatory" && updated.IsMandatory)
//             updated.IsShow = true;
//           return updated;
//         }
//         return item;
//       }),
//     );
//   };

//   const handleOrderSave = (orderArr) => {
//     setFormControls((prev) => {
//       const newArr = Array(prev.length);
//       orderArr.forEach(({ id, DisplayOrder }) => {
//         const found = prev.find((x) => x.ID === id);
//         if (found) newArr[DisplayOrder - 1] = found;
//       });
//       prev.forEach((x) => {
//         if (!newArr.includes(x)) {
//           const emptyIdx = newArr.findIndex((y) => !y);
//           if (emptyIdx !== -1) newArr[emptyIdx] = x;
//         }
//       });
//       return newArr.map((item, idx) => ({ ...item, DisplayOrder: idx + 1 }));
//     });
//   };

//   const handleTabbingSave = (tabArr) => {
//     setTabbingOrder(tabArr);
//   };

//   const updatedPage = async () => {
//     if (controllerType === 3) {
//       const changedFlags = flagTableData.filter((item) => item.isChanged);
//       if (changedFlags.length === 0) {
//         notify("No flags modified", "warn");
//         return;
//       }
//       try {
//         const flagPayload = changedFlags.map((f) => ({
//           FlagID: f.FlagID,
//           FlagValue: f.FlagValue,
//         }));
//         const res = await axiosInstance.post(
//           "CompanyMaster/UpdateCompanyConfig",
//           { PageId: payload.pageName, flagDetails: flagPayload },
//         );
//         if (res.data.success) {
//           toast.success("Flags updated successfully");
//           fetchFlagControlData();
//         }
//       } catch (error) {
//         notify("Failed to update flags", "error");
//       }
//       return;
//     }

//     if (formControls.length === 0) {
//       notify("No data to update", "warn");
//       return;
//     }

//     const updatePayload = formControls?.map((ele) => {
//       const tabIndex = tabbingOrder.findIndex(
//         (item) => item?.id === ele?.ControlDisplayID,
//       );
//       const tabOrder = tabIndex !== -1 ? tabIndex + 1 : 0;
//       return {
//         ...ele,
//         TabOrder: tabOrder,
//         isActive: ele?.IsShow ? true : false,
//         IsShow: ele?.IsShow ? true : false,
//         IsMandatory: ele?.IsMandatory ? true : false,
//       };
//     });

//     const response = await finalUpdatePageControlData(updatePayload);
//     if (response?.success) {
//       notify(response?.message, "success");
//       getSearchController();
//     }
//   };

//   const handlePatternOpen = (row) => {
//     setShowPattern({ data: row, visible: true });
//   };

//   const handlePatternClose = () => {
//     setShowPattern({ data: null, visible: false });
//   };

//   const columns = [
//     { header: "Sr. No", field: "SrNo", width: "5%" },
//     {
//       header: controllerType === 1 ? "Controlar Name" : "Column Name",
//       field: "ControlDisplayName",
//       width: "25%",
//     },
//     {
//       header: controllerType === 1 ? "Controlar ID" : "column Header",
//       field: "ControlDisplayID",
//       width: "20%",
//     },
//     { header: "Show", field: "IsShow", width: "20%" },
//     { header: "Pattern", field: "Pattern", width: "20%" },
//     { header: "Mandatory", field: "IsMandatory", width: "15%" },
//     { header: "Edit", field: "isEdit", width: "4%" },
//   ];

//   return (
//     <>
//       <div className="card">
//         <Heading title={"Page Control Master"} />
//         <div className="card-body p-0 px-2">
//           <div className="row g-2 align-items-center mt-3 mb-2">
//             {/* Page Name Dropdown — embedded ho toh disabled */}
//             <div className="col-12 col-md-3">
//               <ReactSelect
//                 placeholderName={t("Page Name")}
//                 name="pageName"
//                 id="pageName"
//                 respclass="w-100"
//                 dynamicOptions={[...dropdownList?.pagesList]}
//                 onChange={handleReactSelectChange}
//                 value={payload?.pageName}
//                 isDisabled={!!gearPageId} // lock karo agar prop/URL se aaya
//               />
//             </div>

//             {/* Search / Order / Tabbing */}
//             <div className="col-12 col-md-4">
//               <div
//                 className="d-flex align-items-center gap-2 flex-wrap"
//                 style={{ gap: "4px" }}
//               >
//                 <Button
//                   onClick={() => getSearchController()}
//                   className="btn btn-primary rounded"
//                 >
//                   Search
//                 </Button>
//                 {[1, 2].includes(Number(controllerType)) && (
//                   <Button
//                     className="btn rounded"
//                     onClick={() => setShowOrderModal(true)}
//                   >
//                     Set Order
//                   </Button>
//                 )}
//                 {[1, 2].includes(Number(controllerType)) && (
//                   <Button
//                     className="btn rounded"
//                     onClick={() => setShowTabbingModal(true)}
//                   >
//                     Set Tabbing
//                   </Button>
//                 )}
//                 <SetOrderModal
//                   show={showOrderModal}
//                   onHide={() => setShowOrderModal(false)}
//                   controllers={formControls?.filter(
//                     (item) => item?.IsShow == 1,
//                   )}
//                   onSave={handleOrderSave}
//                 />
//                 <SetTabbingModal
//                   show={showTabbingModal}
//                   onHide={() => setShowTabbingModal(false)}
//                   controllers={formControls}
//                   onSave={handleTabbingSave}
//                 />
//               </div>
//             </div>

//             {/* Actions */}
//             <div className="col-12 col-md-5">
//               <div
//                 className="d-flex align-items-center gap-2 flex-nowrap justify-content-md-end"
//                 style={{ gap: "4px" }}
//               >
//                 <Button
//                   onClick={handleOpenModal}
//                   className="btn rounded"
//                   title="Add New Controller"
//                 >
//                   <i className="bi bi-plus me-1 mb-0" /> {t("Add")}
//                 </Button>
//                 <SaveButton
//                   onClick={updatedPage}
//                   className="btn rounded"
//                   text="Update"
//                 />
//                 <CustomButton
//                   icon={"download"}
//                   className="btn rounded"
//                   text="Json Export"
//                   disabled={exportLoading}
//                   onClick={ExportData}
//                 />
//                 <CustomButton
//                   icon="upload"
//                   text="Import JSON"
//                   onClick={() => jsonInputRef.current.click()}
//                   disabled={loading}
//                   className="btn rounded"
//                 />
//                 <input
//                   type="file"
//                   ref={jsonInputRef}
//                   accept=".json"
//                   style={{ display: "none" }}
//                   onChange={ImportTableData}
//                 />
//               </div>
//             </div>
//           </div>

//           <div
//             className="col-12 col-md-4 text-md-end mb-1 d-flex mb-2"
//             style={{ gap: "8px" }}
//           >
//             <CustomButton
//               text="Page Controller"
//               icon="page"
//               onClick={() => handleTypeChange(1)}
//               className={controllerType === 1 ? "" : "bg-gray"}
//             />
//             <CustomButton
//               text="Table Controller"
//               icon="table"
//               onClick={() => handleTypeChange(2)}
//               className={controllerType === 2 ? "" : "bg-gray"}
//             />
//             <CustomButton
//               text="Flag Mapping"
//               icon="flag"
//               onClick={() => handleTypeChange(3)}
//               className={controllerType === 3 ? "" : "bg-gray"}
//             />
//           </div>

//           {tabbingOrder.length > 0 && (
//             <div
//               style={{ gap: "3px" }}
//               className="alert_master alert-info d-flex flex-wrap gap-2"
//             >
//               <strong className="me-2">Tabbing Order:</strong>
//               {tabbingOrder.map((x, i) => (
//                 <span key={x.id} className="mes-1">
//                   {
//                     formControls.find((c) => c.ControlDisplayID === x.id)
//                       ?.ControlDisplayName
//                   }
//                   {i < tabbingOrder.length - 1 && <span> → </span>}
//                 </span>
//               ))}
//             </div>
//           )}

//           {[1, 2].includes(controllerType) && (
//             <div className="table-responsive" style={{ minHeight: 220 }}>
//               <CustomTable
//                 columns={columns}
//                 data={formControls.map((row, idx) => ({
//                   ...row,
//                   SrNo: idx + 1,
//                   IsShow: (
//                     <Form.Check
//                       type="switch"
//                       name="IsShow"
//                       id={`IsShow-${idx}`}
//                       checked={row.IsShow}
//                       onChange={() => handleSwitchChange(idx, "IsShow")}
//                       disabled={
//                         row?.Type == 1 &&
//                         row?.ControlDisplayID?.toLowerCase()?.includes(
//                           "barcode",
//                         ) &&
//                         row?.ControlDisplayID !== "BarcodeLogic"
//                       }
//                     />
//                   ),
//                   IsMandatory: (
//                     <Form.Check
//                       type="switch"
//                       name="IsMandatory"
//                       id={`IsMandatory-${idx}`}
//                       checked={row.IsMandatory}
//                       disabled={
//                         row?.ControlDisplayID?.toLowerCase()?.includes(
//                           "barcode",
//                         ) || !row.IsShow
//                       }
//                       onChange={() => handleSwitchChange(idx, "IsMandatory")}
//                     />
//                   ),
//                   isEdit: (
//                     <Button
//                       onClick={() => handleEditController(row)}
//                       className="rounded"
//                     >
//                       <i className="bi bi-pencil-fill mb-0"></i>
//                     </Button>
//                   ),
//                   Pattern: (
//                     <Button
//                       onClick={() => handlePatternOpen(row)}
//                       className="rounded"
//                     >
//                       <SiTextpattern />
//                     </Button>
//                   ),
//                 }))}
//               />
//             </div>
//           )}

//           {[3].includes(controllerType) && (
//             <FlagMappingTable
//               data={flagTableData}
//               setFlagTableData={setFlagTableData}
//             />
//           )}
//         </div>
//       </div>

//       {/* Add/Edit Controller Dialog */}
//       <Dialog
//         header={
//           controllerType === 1
//             ? t("Add New controller Page ")
//             : "Add New controller table "
//         }
//         visible={show}
//         className={theme}
//         onHide={() => setShow(false)}
//         style={{ width: isMobile ? "80vw" : "50vw" }}
//       >
//         <div className="row py-2 px-1">
//           <ReactSelect
//             placeholderName={t("Page Name")}
//             name={"pageName"}
//             id={"pageName"}
//             respclass={"col-sm-4 mb-2"}
//             value={newController?.pageName}
//             dynamicOptions={[...dropdownList?.pagesList]}
//             onChange={handleModalReactSelectChange}
//           />
//           <Input
//             lable={controllerType === 1 ? t("controllerName") : t("columnName")}
//             value={newController?.controllerName}
//             name={"controllerName"}
//             id={"controllerName"}
//             respclass={"col-sm-4"}
//             onChange={(e) =>
//               setNewController((prev) => ({
//                 ...prev,
//                 controllerName: e?.target?.value,
//               }))
//             }
//           />
//           <Input
//             lable={
//               controllerType === 1
//                 ? t("controllerId")
//                 : t("column Header With /")
//             }
//             value={newController?.controllerId}
//             name={"controllerId"}
//             id={"controllerId"}
//             respclass={"col-sm-4"}
//             onChange={(e) =>
//               setNewController((prev) => ({
//                 ...prev,
//                 controllerId: e?.target?.value,
//               }))
//             }
//           />
//           <div className="text-center d-flex align-items-center justify-content-center w-100">
//             <SaveButton
//               onClick={handleSaveController}
//               text={t(isEdit ? "Update" : "Save")}
//               className="px-4 mx-2 rounded"
//             />
//           </div>
//         </div>
//       </Dialog>

//       {/* Pattern Dialog */}
//       <Dialog
//         header={"Add Pattern"}
//         visible={showPattern.visible}
//         className={theme}
//         onHide={() => setShowPattern({ data: null, visible: false })}
//         style={{ width: isMobile ? "80vw" : "50vw" }}
//       >
//         <div className="pt-1 pl-2 pr-2 mt-1">
//           <TextAreaInput
//             value={showPattern?.data?.DropDownPattern}
//             style={{ height: "80px", padding: "6px" }}
//             name={"DropDownPattern"}
//             lable="Pattern Value"
//             className={"col-sm-12"}
//             id={"DropDownPattern"}
//             placeholder={showPattern?.data?.DropDownPattern}
//             onChange={(e) =>
//               setShowPattern((prev) => ({
//                 ...prev,
//                 data: { ...prev.data, DropDownPattern: e?.target?.value },
//               }))
//             }
//           />
//           <div>
//             <p className="bg-danger text-white px-2 py-1 text-sm">
//               Field should match the database value.
//             </p>
//           </div>
//           <div className="text-center d-flex align-items-center justify-content-center w-100">
//             <SaveButton
//               onClick={handlePatternSave}
//               text={t(isEdit ? "Update" : "Save")}
//               className="px-4 mx-2 rounded"
//             />
//           </div>
//         </div>
//       </Dialog>
//     </>
//   );
// };

// export default PageControlMaster;
import React, { useEffect, useRef, useState } from "react";
import SetOrderModal from "./SetOrderModal";
import SetTabbingModal from "./SetTabbingModal";
import Heading from "../../../components/UI/Heading";
import ReactSelect from "../../../components/formComponent/ReactSelect";
import { useTranslation } from "react-i18next";
import { Button, Form } from "react-bootstrap";
import CustomTable from "../../../components/Table/CustomTable";
import { useLocalStorage } from "../../../utils/hooks/useLocalStorage";
import { Dialog } from "primereact/dialog";
import Input from "../../../components/formComponent/Input";
import { CustomButton, SaveButton } from "../../../components/UI/CustomButton";
import { axiosInstance } from "../../../utils/axiosInstance";
import "./PageControlMaster.css";
import {
  finalUpdatePageControlData,
  SavePageControlData,
  UpdatePageControlData,
} from "./PageControlMasterService";
import { notify } from "../../../utils/utils";
import FlagMappingTable from "./FlagMappingTable";
import { toast } from "react-toastify";
import TextAreaInput from "../../../components/formComponent/TextAreaInput";
import { SiTextpattern } from "react-icons/si";
import { useSearchParams } from "react-router-dom";

const PageControlMaster = ({ embeddedPageId = null , closeButton = null }) => {
  const [t] = useTranslation();
  const isMobile = window.innerWidth <= 768;
  const theme = useLocalStorage("theme", "get");
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  const [searchParams] = useSearchParams();
  const gearPageId = embeddedPageId ?? searchParams.get("pageId");

  const [show, setShow] = useState(false);
  const [showPattern, setShowPattern] = useState({
    data: null,
    visible: false,
  });

  const [isEdit, setIsEdit] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showTabbingModal, setShowTabbingModal] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [pattern, setPattern] = useState({
    pageName: "",
    controllerName: "",
    controllerId: "",
  });

  const [dropdownList, setDropdownList] = useState({
    pagesList: [],
  });

  const [payload, setPayload] = useState({
    pageName: "",
  });
  const [controllerType, setControllerType] = useState(1);
  const [formControls, setFormControls] = useState([]);
  const [tabbingOrder, setTabbingOrder] = useState([]);
  const [newController, setNewController] = useState({
    pageName: "",
    controllerName: "",
    controllerId: "",
  });
  const [flagTableData, setFlagTableData] = useState([]);

  useEffect(() => {
    getPageData();
  }, []);

  // gearPageId se payload auto-set
  useEffect(() => {
    if (gearPageId) {
      setPayload((prev) => ({ ...prev, pageName: Number(gearPageId) }));
    }
  }, [gearPageId]);

  // pagesList ready hone ke baad auto search
  useEffect(() => {
    if (gearPageId && dropdownList?.pagesList?.length > 0) {
      getSearchController(Number(gearPageId));
    }
  }, [gearPageId, dropdownList?.pagesList]);

  const getPageData = async () => {
    try {
      const res = await axiosInstance.get(`CompanyMaster/GetPageMasterData`);
      const resList = res?.data?.message?.map((item) => ({
        label: item?.PageName,
        value: item?.PageID,
      }));
      setDropdownList((prev) => ({ ...prev, pagesList: resList }));
    } catch (error) {
      console.error("error", error);
    }
  };

  // ── GET flag data from GetCompanyFlagMaster API ──────────────────────────
  const getMappingController = async (overridePageId = null) => {
    const pageId = overridePageId ?? payload?.pageName;

    if (!pageId) {
      notify("Kindly select Page Name", "warn");
      return;
    }

    try {
      const res = await axiosInstance.get(
        `CompanyMaster/GetCompanyFlagMaster?PageID=${pageId}`,
      );

      if (!Array.isArray(res?.data?.message)) {
        notify(res?.data?.message, "error");
        setFlagTableData([]);
        setTableData([]);
        return;
      }

      // FlagMappingTable ke liye flagTableData set karo
      setFlagTableData(res?.data?.message);
      // export ke liye tableData bhi set karo
      setTableData(res?.data?.message);
    } catch (error) {
      console.error("error", error);
      setFlagTableData([]);
      setTableData([]);
    }
  };

  const getSearchController = async (overridePageId = null) => {
    const pageId = overridePageId ?? payload?.pageName;

    if (!pageId) {
      notify("Kindly select Page Name", "warn");
      return;
    }

    try {
      const res = await axiosInstance.post(`CompanyMaster/GetPageDataDetails`, {
        pageID: pageId,
        TypeId: controllerType,
      });

      if (!Array.isArray(res?.data?.message)) {
        notify(res?.data?.message, "error");
        setFormControls([]);
        setTabbingOrder([]);
        return;
      }

      setTableData(res?.data?.message);

      let sortedData = res?.data?.message
        ?.sort((a, b) => a?.TabOrder - b?.TabOrder)
        ?.map((item) => ({
          ...item,
          Bold: item?.Bold == 1,
          IsMobile: item?.IsMobile == 1,
        }));
      setFormControls(sortedData);

      let tabbingOrderFilter = sortedData
        ?.filter((item) => item?.TabOrder != 0)
        ?.map((ele) => ({
          ...ele,
          id: ele?.ControlDisplayID,
          name: ele?.ControlDisplayName,
          index: ele?.TabOrder,
        }));
      setTabbingOrder(tabbingOrderFilter);
    } catch (error) {
      console.error("error", error);
      setFormControls([]);
      setTabbingOrder([]);
    }
  };

  const jsonInputRef = useRef(null);

  const ImportTableData = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/json") {
      toast.error("Please select a valid JSON file");
      e.target.value = "";
      return;
    }

    setLoading(true);

    const reader = new FileReader();

    reader.onload = async () => {
      try {
        const jsonData = JSON.parse(reader.result);

        if (!Array.isArray(jsonData) || jsonData.length === 0) {
          toast.error("Invalid or empty JSON file");
          return;
        }

        const finalTableData = jsonData.map((data) => ({
          pageID: data.PageID,
          typeId: data.TypeId,
          pageName: data.PageName,
          typeName: data.TypeName,
          controlDisplayName: data.ControlDisplayName,
          controlDisplayID: data.ControlDisplayID,
          isShow: data.IsShow,
          isMandatory: data.IsMandatory,
          tabOrder: data.TabOrder,
          displayOrder: data.DisplayOrder,
        }));

        const res = await axiosInstance.post(
          "CompanyMaster/ImportJsonData",
          finalTableData,
        );

        if (res?.data?.success) {
          toast.success("Data Import Success");
        } else {
          toast.error(res?.data?.message || "Something went wrong");
        }
      } catch (error) {
        toast.error("Invalid JSON format");
        console.error(error);
      } finally {
        setLoading(false);
        e.target.value = "";
      }
    };

    reader.readAsText(file);
  };

  const ExportData = () => {
    if (!tableData || tableData.length === 0) {
      toast.error("No data available to export");
      return;
    }

    setExportLoading(true);
    const jsonData = JSON.stringify(tableData, null, 2);
    const blob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${payload.pageName}PageControlData.json`;
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setExportLoading(false);
  };

  const handleTypeChange = (type) => {
    setControllerType(type);
    setFormControls([]);
    setTabbingOrder([]);
    setFlagTableData([]);
    setTableData([]);
  };

  const handleReactSelectChange = (name, e) => {
    setPayload((prev) => ({ ...prev, [name]: e?.value }));
  };

  const handleModalReactSelectChange = (name, e) => {
    setNewController((prev) => ({ ...prev, [name]: e?.value }));
  };

  const handleOpenModal = () => {
    setIsEdit(false);
    handleResetController();
    setShow(true);
  };

  const handleResetController = () => {
    setNewController({
      pageName: payload?.pageName,
      controllerName: "",
      controllerId: "",
    });
  };

  const handleEditController = (row) => {
    setShow(true);
    setNewController({
      ID: row?.ID,
      pageName: row?.PageID,
      controllerName: row?.ControlDisplayName,
      controllerId: row?.ControlDisplayID,
    });
    setIsEdit(true);
  };

  const selectedPageID = dropdownList?.pagesList?.find(
    (item) => item?.value == newController?.pageName,
  );

  const handleSaveController = async () => {
    if (!newController?.pageName || !newController?.controllerName?.trim()) {
      notify("Please fill all required fields", "warn");
      return;
    }

    const payload = {
      pageName: selectedPageID?.label,
      pageID: selectedPageID?.value,
      controlDisplayName: newController?.controllerName,
      ControlDisplayID: newController?.controllerId,
      isActive: true,
      TypeId: controllerType,
      TypeName: controllerType === 1 ? "Form" : "Table",
      IsBold: false,
      Fontsize: "1",
      Width: "0",
      IsMobile: false,
    };

    let response = null;
    if (isEdit) {
      payload["ID"] = newController?.ID || 0;
      response = await UpdatePageControlData([payload]);
      setIsEdit(false);
    } else {
      response = await SavePageControlData(payload);
    }

    if (response?.success) {
      getSearchController();
      handleResetController();
      setShow(false);
    }
    notify(response?.message, response?.success === true ? "success" : "error");
  };

  const handlePatternSave = async () => {
    const payload = {
      ID: showPattern?.data?.ID || 0,
      pageID: showPattern?.data?.PageID,
      pageName: showPattern?.data?.PageName,
      ControlDisplayID: showPattern?.data?.ControlDisplayID,
      DropDownPattern: showPattern?.data?.DropDownPattern,
      TypeId: showPattern?.data?.TypeId,
      TypeName: showPattern?.data?.TypeName,
      controlDisplayName: showPattern?.data?.ControlDisplayName,
      isActive: true,
      IsBold: false,
      Fontsize: "1",
      Width: "0",
      IsMobile: false,
    };

    const response = await UpdatePageControlData([payload]);

    if (response?.success) {
      getSearchController();
      setShowPattern({ data: null, visible: false });
    }
    notify(response?.message, response?.success === true ? "success" : "error");
  };

  const handleSwitchChange = (index, field) => {
    setFormControls((prev) =>
      prev.map((item, idx) => {
        if (idx === index) {
          const updated = { ...item, [field]: !item[field] };
          if (field === "IsShow" && !updated.IsShow)
            updated.IsMandatory = false;
          if (field === "IsMandatory" && updated.IsMandatory)
            updated.IsShow = true;
          return updated;
        }
        return item;
      }),
    );
  };

  const handleFontSizeChange = (index, value) => {
    setFormControls((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, FontSize: value } : item,
      ),
    );
  };

  const handleWidthChange = (index, value) => {
    setFormControls((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, Width: value } : item,
      ),
    );
  };

  const handleOrderSave = (orderArr) => {
    setFormControls((prev) => {
      const newArr = Array(prev.length);
      orderArr.forEach(({ id, DisplayOrder }) => {
        const found = prev.find((x) => x.ID === id);
        if (found) newArr[DisplayOrder - 1] = found;
      });
      prev.forEach((x) => {
        if (!newArr.includes(x)) {
          const emptyIdx = newArr.findIndex((y) => !y);
          if (emptyIdx !== -1) newArr[emptyIdx] = x;
        }
      });
      return newArr.map((item, idx) => ({ ...item, DisplayOrder: idx + 1 }));
    });
  };

  const handleTabbingSave = (tabArr) => {
    setTabbingOrder(tabArr);
  };

  // ── Update handler ────────────────────────────────────────────────────────
  const updatedPage = async () => {
    // ── Type 3 : Flag Mapping update ─────────────────────────────────────
    if (controllerType === 3) {
      const changedFlags = flagTableData.filter((item) => item.isChanged);
      if (changedFlags.length === 0) {
        notify("No flags modified", "warn");
        return;
      }

      try {
        // Har flag ke liye alag POST call
        const results = await Promise.all(
          changedFlags.map((f) =>
            axiosInstance.post(
              "CompanyMaster/InsertAndUpdateCompanyFlagMaster",
              {
                flagID: f.FlagID,
                flagName: f.FlagName,
                flagValue: String(f.FlagValue),
              },
            ),
          ),
        );

        const allSuccess = results.every((r) => r?.data?.success);
        if (allSuccess) {
          toast.success("Flags updated successfully");
          // Refresh flag data
          getMappingController();
        } else {
          notify("Some flags failed to update", "error");
        }
      } catch (error) {
        notify("Failed to update flags", "error");
      }
      return;
    }

    // ── Type 1 / 2 : Form / Table controller update ───────────────────────
    if (formControls.length === 0) {
      notify("No data to update", "warn");
      return;
    }

    const updatePayload = formControls?.map((ele) => {
      const tabIndex = tabbingOrder.findIndex(
        (item) => item?.id === ele?.ControlDisplayID,
      );
      const tabOrder = tabIndex !== -1 ? tabIndex + 1 : 0;
      return {
        ...ele,
        TabOrder: tabOrder,
        isActive: ele?.IsShow ? true : false,
        IsShow: ele?.IsShow ? true : false,
        IsMandatory: ele?.IsMandatory ? true : false,
        Bold: ele?.Bold ? true : false,
        Width: ele?.Width || "0",
        IsMobile: ele?.IsMobile ? true : false,
      };
    });

    const response = await finalUpdatePageControlData(updatePayload);
    if (response?.success) {
      notify(response?.message, "success");
      getSearchController();
    }
  };

  const handlePatternOpen = (row) => {
    setShowPattern({ data: row, visible: true });
  };

  const handlePatternClose = () => {
    setShowPattern({ data: null, visible: false });
  };

  const columns = [
    { header: "Sr. No", field: "SrNo", width: "5%" },
    {
      header: controllerType === 1 ? "Controlar Name" : "Column Name",
      field: "ControlDisplayName",
      width: "25%",
    },
    {
      header: controllerType === 1 ? "Controlar ID" : "column Header",
      field: "ControlDisplayID",
      width: "20%",
    },
    { header: "Show", field: "IsShow", width: "20%" },
    { header: "Pattern", field: "Pattern", width: "20%" },
    { header: "Mandatory", field: "IsMandatory", width: "15%" },
    { header: "HideFromMobile", field: "MobileView", width: "10%" },
    { header: "Bold", field: "Bold", width: "10%" },
    { header: "FontSize", field: "FontSize", width: "10%" },
    { header: "Width", field: "Width", width: "10%" },
    { header: "Edit", field: "isEdit", width: "4%" },
  ];

  return (
    <>
      <div className="card">
        <Heading title={"Page Control Master"} secondTitle={closeButton} />
        <div className="card-body p-0 px-2">
          <div className="row g-2 align-items-center mt-3 mb-2">
            {/* Page Name Dropdown */}
            <div className="col-12 col-md-3">
              <ReactSelect
                placeholderName={t("Page Name")}
                name="pageName"
                id="pageName"
                respclass="w-100"
                dynamicOptions={[...dropdownList?.pagesList]}
                onChange={handleReactSelectChange}
                value={payload?.pageName}
                isDisabled={!!gearPageId}
              />
            </div>

            {/* Search / Order / Tabbing */}
            <div className="col-12 col-md-4">
              <div
                className="d-flex align-items-center gap-2 flex-wrap"
                style={{ gap: "4px" }}
              >
                <Button
                  onClick={() =>
                    controllerType === 3
                      ? getMappingController()
                      : getSearchController()
                  }
                  className="btn btn-primary rounded"
                >
                  Search
                </Button>
                {[1, 2].includes(Number(controllerType)) && (
                  <Button
                    className="btn rounded"
                    onClick={() => setShowOrderModal(true)}
                  >
                    Set Order
                  </Button>
                )}
                {[1, 2].includes(Number(controllerType)) && (
                  <Button
                    className="btn rounded"
                    onClick={() => setShowTabbingModal(true)}
                  >
                    Set Tabbing
                  </Button>
                )}
                <SetOrderModal
                  show={showOrderModal}
                  onHide={() => setShowOrderModal(false)}
                  controllers={formControls?.filter(
                    (item) => item?.IsShow == 1,
                  )}
                  onSave={handleOrderSave}
                />
                <SetTabbingModal
                  show={showTabbingModal}
                  onHide={() => setShowTabbingModal(false)}
                  controllers={formControls}
                  onSave={handleTabbingSave}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="col-12 col-md-5">
              <div
                className="d-flex align-items-center gap-2 flex-nowrap justify-content-md-end"
                style={{ gap: "4px" }}
              >
                {/* Add button — type 3 pe hide karo */}
                {controllerType !== 3 && (
                  <Button
                    onClick={handleOpenModal}
                    className="btn rounded"
                    title="Add New Controller"
                  >
                    <i className="bi bi-plus me-1 mb-0" /> {t("Add")}
                  </Button>
                )}
                <SaveButton
                  onClick={updatedPage}
                  className="btn rounded"
                  text="Update"
                />
                {controllerType !== 3 && (
                  <>
                    <CustomButton
                      icon={"download"}
                      className="btn rounded"
                      text="Json Export"
                      disabled={exportLoading}
                      onClick={ExportData}
                    />
                    <CustomButton
                      icon="upload"
                      text="Import JSON"
                      onClick={() => jsonInputRef.current.click()}
                      disabled={loading}
                      className="btn rounded"
                    />
                    <input
                      type="file"
                      ref={jsonInputRef}
                      accept=".json"
                      style={{ display: "none" }}
                      onChange={ImportTableData}
                    />
                  </>
                )}
              </div>
            </div>
          </div>

          <div
            className="col-12 col-md-4 text-md-end mb-1 d-flex mb-2"
            style={{ gap: "8px" }}
          >
            <CustomButton
              text="Page Controller"
              icon="page"
              onClick={() => handleTypeChange(1)}
              className={controllerType === 1 ? "" : "bg-gray"}
            />
            <CustomButton
              text="Table Controller"
              icon="table"
              onClick={() => handleTypeChange(2)}
              className={controllerType === 2 ? "" : "bg-gray"}
            />
            <CustomButton
              text="Flag Mapping"
              icon="flag"
              onClick={() => handleTypeChange(3)}
              className={controllerType === 3 ? "" : "bg-gray"}
            />
          </div>

          {tabbingOrder.length > 0 && (
            <div
              style={{ gap: "3px" }}
              className="alert_master alert-info d-flex flex-wrap gap-2"
            >
              <strong className="me-2">Tabbing Order:</strong>
              {tabbingOrder.map((x, i) => (
                <span key={x.id} className="mes-1">
                  {
                    formControls.find((c) => c.ControlDisplayID === x.id)
                      ?.ControlDisplayName
                  }
                  {i < tabbingOrder.length - 1 && <span> → </span>}
                </span>
              ))}
            </div>
          )}

          {[1, 2].includes(controllerType) && (
            <div className="table-responsive" style={{ minHeight: 220 }}>
              <CustomTable
                columns={columns}
                data={formControls.map((row, idx) => ({
                  ...row,
                  SrNo: idx + 1,
                  IsShow: (
                    <Form.Check
                      type="switch"
                      name="IsShow"
                      id={`IsShow-${idx}`}
                      checked={row.IsShow}
                      onChange={() => handleSwitchChange(idx, "IsShow")}
                      disabled={
                        row?.Type == 1 &&
                        row?.ControlDisplayID?.toLowerCase()?.includes(
                          "barcode",
                        ) &&
                        row?.ControlDisplayID !== "BarcodeLogic"
                      }
                    />
                  ),
                  IsMandatory: (
                    <Form.Check
                      type="switch"
                      name="IsMandatory"
                      id={`IsMandatory-${idx}`}
                      checked={row.IsMandatory}
                      disabled={
                        row?.ControlDisplayID?.toLowerCase()?.includes(
                          "barcode",
                        ) || !row.IsShow
                      }
                      onChange={() => handleSwitchChange(idx, "IsMandatory")}
                    />
                  ),
                  isEdit: (
                    <Button
                      onClick={() => handleEditController(row)}
                      className="rounded"
                    >
                      <i className="bi bi-pencil-fill mb-0"></i>
                    </Button>
                  ),
                  MobileView: (
                    <Form.Check
                      type="switch"
                      name="MobileView"
                      id={`MobileView-${idx}`}
                      checked={row.IsMobile == 1}
                      onChange={() => handleSwitchChange(idx, "IsMobile")}
                    />
                  ),
                  Bold: (
                    <Form.Check
                      type="switch"
                      name="Bold"
                      id={`Bold-${idx}`}
                      checked={row.Bold == 1}
                      onChange={() => handleSwitchChange(idx, "Bold")}
                    />
                  ),
                  FontSize: (
                    <Form.Control
                      type="number"
                      name="FontSize"
                      id={`FontSize-${idx}`}
                      value={row.FontSize || ""}
                      min={0}
                      style={{ width: "70px" }}
                      onChange={(e) =>
                        handleFontSizeChange(idx, e.target.value)
                      }
                    />
                  ),
                  Width: (
                    <Form.Control
                      type="number"
                      name="Width"
                      id={`Width-${idx}`}
                      value={row.Width || ""}
                      min={0}
                      style={{ width: "70px" }}
                      onChange={(e) => handleWidthChange(idx, e.target.value)}
                    />
                  ),
                  Pattern: (
                    <Button
                      onClick={() => handlePatternOpen(row)}
                      className="rounded"
                    >
                      <SiTextpattern />
                    </Button>
                  ),
                }))}
              />
            </div>
          )}

          {controllerType === 3 && (
            <FlagMappingTable
              data={flagTableData}
              setFlagTableData={setFlagTableData}
            />
          )}
        </div>
      </div>

      <Dialog
        header={
          controllerType === 1
            ? t("Add New controller Page ")
            : "Add New controller table "
        }
        visible={show}
        className={theme}
        onHide={() => setShow(false)}
        style={{ width: isMobile ? "80vw" : "50vw" }}
      >
        <div className="row py-2 px-1">
          <ReactSelect
            placeholderName={t("Page Name")}
            name={"pageName"}
            id={"pageName"}
            respclass={"col-sm-4 mb-2"}
            value={newController?.pageName}
            dynamicOptions={[...dropdownList?.pagesList]}
            onChange={handleModalReactSelectChange}
          />
          <Input
            lable={controllerType === 1 ? t("controllerName") : t("columnName")}
            value={newController?.controllerName}
            name={"controllerName"}
            id={"controllerName"}
            respclass={"col-sm-4"}
            onChange={(e) =>
              setNewController((prev) => ({
                ...prev,
                controllerName: e?.target?.value,
              }))
            }
          />
          <Input
            lable={
              controllerType === 1
                ? t("controllerId")
                : t("column Header With /")
            }
            value={newController?.controllerId}
            name={"controllerId"}
            id={"controllerId"}
            respclass={"col-sm-4"}
            onChange={(e) =>
              setNewController((prev) => ({
                ...prev,
                controllerId: e?.target?.value,
              }))
            }
          />
          <div className="text-center d-flex align-items-center justify-content-center w-100">
            <SaveButton
              onClick={handleSaveController}
              text={t(isEdit ? "Update" : "Save")}
              className="px-4 mx-2 rounded"
            />
          </div>
        </div>
      </Dialog>

      {/* Pattern Dialog */}
      <Dialog
        header={"Add Pattern"}
        visible={showPattern.visible}
        className={theme}
        onHide={() => setShowPattern({ data: null, visible: false })}
        style={{ width: isMobile ? "80vw" : "50vw" }}
      >
        <div className="pt-1 pl-2 pr-2 mt-1">
          <TextAreaInput
            value={showPattern?.data?.DropDownPattern}
            style={{ height: "80px", padding: "6px" }}
            name={"DropDownPattern"}
            lable="Pattern Value"
            className={"col-sm-12"}
            id={"DropDownPattern"}
            placeholder={showPattern?.data?.DropDownPattern}
            onChange={(e) =>
              setShowPattern((prev) => ({
                ...prev,
                data: { ...prev.data, DropDownPattern: e?.target?.value },
              }))
            }
          />
          <div>
            <p className="bg-danger text-white px-2 py-1 text-sm">
              Field should match the database value.
            </p>
          </div>
          <div className="text-center d-flex align-items-center justify-content-center w-100">
            <SaveButton
              onClick={handlePatternSave}
              text={t(isEdit ? "Update" : "Save")}
              className="px-4 mx-2 rounded"
            />
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default PageControlMaster;
