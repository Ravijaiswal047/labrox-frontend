// import React, { useMemo, useState } from "react";
// import { useTranslation } from "react-i18next";
// import { dateConfig, CheckDevice, downloadPdf, IndexHandle } from "../../utils/helpers";
// import { axiosReport } from "../../utils/axiosInstance";
// import { toast } from "react-toastify";
// import SpinnerLoad from "../../components/loader/SpinnerLoad";
// import Tables from "../../components/UI/customTable";
// import NoRecordFound from "../../components/formComponent/NoRecordFound";
// import { FaPlus, FaSearch, FaEye } from "react-icons/fa";
// import Medical from "../Images/Medical.png";
// import file from "../Images/file.png";
// import { Tooltip as ReactTooltip } from "react-tooltip";
// import { RemarkTooltip } from "../utils/RemarkTooltip";
// import AddRemark from "../utils/AddRemark";
// import CustomModal from "../utils/CustomModal";
// import DispatchPatientDetailModal from "../utils/DispatchPatientDetailModal";
// import { SampleStatus, getStatusColor } from "../../utils/Constants";
// import TableFilterDot from "../../components/TableFilter/TableFilterDot";
// import "./CustomeColor.css";

// const DynamicLabSearchTableNew = ({ dispatchData, show, show2, TableData, labNo }) => {
//   const { t } = useTranslation();
//   const [modal, setModal] = useState(false);
//   const [visitID, setVisitID] = useState();
//   const [TestId, setTestId] = useState();
//   const [searchTerm, setSearchTerm] = useState("");
//   const [statusFilter, setStatusFilter] = useState("");
  
//   const [showPatientModal, setShowPatientModal] = useState(false);
//   const [selectedLedgerTransactionNo, setSelectedLedgerTransactionNo] = useState(null);
//   const [selectedTestID, setSelectedTestID] = useState(null);

//   const [isAllSelected, setIsAllSelected] = useState(false);
//   const [selectedRows, setSelectedRows] = useState({}); // key: flattenedIndex, value: boolean

//   const [printLoading, setPrintLoading] = useState({
//     With: false,
//     Without: false,
//     index: -1,
//   });
//   const [showAddRemark, setShowAddRemark] = useState({
//     modal: false,
//     rowData: null,
//   });

//   const flattenedData = useMemo(() => {
//     const flattened = [];
//     let lastVisitNo = null;
//     let patientCounter = 0;

//     dispatchData.forEach((data, patientIndex) => {
//       const pliList = data?.PliDataList || [];
//       const rowCount = Math.max(pliList.length, 1);
      
//       const isNewVisit = data.VisitNo !== lastVisitNo;
//       if (isNewVisit) {
//         patientCounter++;
//         lastVisitNo = data.VisitNo;
//       }

//       for (let i = 0; i < rowCount; i++) {
//         const pli = pliList[i] || {};
//         flattened.push({
//           ...data,
//           _pli: pli,
//           _isFirstOfPatient: isNewVisit && i === 0,
//           _patientSerialNumber: patientCounter,
//           _patientIndex: patientIndex,
//           _testIndex: i,
//           _totalInPatient: rowCount,
//           _flattenedIndex: flattened.length,
//         });
//       }
//     });
//     return flattened;
//   }, [dispatchData]);

//   const filteredData = useMemo(() => {
//     let data = flattenedData;
    
//     if (statusFilter) {
//         data = data.filter(item => String(item._pli?.status || item._pli?.Status) === String(statusFilter));
//     }

//     if (!searchTerm) return data;
//     const lowerSearch = searchTerm.toLowerCase();
//     return data.filter((item) => {
//       return (
//         item.VisitNo?.toLowerCase().includes(lowerSearch) ||
//         item.PatientName?.toLowerCase().includes(lowerSearch) ||
//         item.Mobile?.toString().includes(lowerSearch) ||
//         item._pli?.BarcodeNo?.toLowerCase().includes(lowerSearch) ||
//         item._pli?.SinNo?.toLowerCase().includes(lowerSearch) ||
//         item.BarcodeNo?.toLowerCase().includes(lowerSearch)
//       );
//     });
//   }, [flattenedData, searchTerm, statusFilter]);

//   const handleSelectAll = (e) => {
//     const checked = e.target.checked;
//     setIsAllSelected(checked);
//     const newSelected = {};
//     if (checked) {
//       filteredData.forEach((row) => {
//           newSelected[row._flattenedIndex] = true;
//       });
//     }
//     setSelectedRows(newSelected);
//   };

//   const handleSelectRow = (e, index) => {
//     const checked = e.target.checked;
//     setSelectedRows(prev => {
//         const next = { ...prev, [index]: checked };
//         if (!checked) setIsAllSelected(false);
//         return next;
//     });
//   };

//   const columnConfig = [
//     { header: "S.No", visible: 1 },
//     { header: "Reg Date", visible: 1 },
//     { header: "Visit No", visible: 1 },
//     { header: "Barcode No", visible: 1 },
//     { header: "UHID", visible: 1 },
//     { header: "Name", visible: 1 },
//     { header: "Age/Gender", visible: 1 },
//     { header: "Test", visible: 1 },
//     { header: "Select", visible: 1, hasSelectAll: true },
//     { header: "Print", visible: 1 },
//     { header: "Remarks", visible: 1 },
//     { header: "Doctor", visible: 1 },
//     { header: "Centre", visible: 1 },
//     { header: "View", visible: 1 },
//     { header: "Audit Trail", visible: 1 },
//     { header: "U.D", visible: 1, icon: "fa-file", tooltip: "Uploaded Document" },
//     { header: "M.H", visible: 1, icon: "fa-h-square", tooltip: "Medical History" },
//   ];

//   const patientLevelColumns = [
//     "S.No", "Reg Date", "Visit No", "UHID", "Name", "Age/Gender", 
//     "Doctor", "Centre", "U.D", "M.H"
//   ];

//   const shouldShow = (colHeader, data, rowIndex) => {
//     if (data._isFirstOfPatient) return true;
    
//     const prev = filteredData[rowIndex - 1];
//     if (!prev || prev.VisitNo !== data.VisitNo) return true;

//     if (colHeader === "Barcode No") {
//       const currentBC = data._pli?.BarcodeNo || data._pli?.SinNo;
//       const prevBC = prev._pli?.BarcodeNo || prev._pli?.SinNo;
//       return currentBC !== prevBC;
//     }

//     if (patientLevelColumns.includes(colHeader)) return false;

//     return true;
//   };

//   const handleReport = (data, loader, index, PHead) => {
//     let TestIDHash = [];
//     const visitID = data.LedgerTransactionID;
    
//     const selectedIndices = Object.keys(selectedRows).filter(key => selectedRows[key]);
    
//     if (selectedIndices.length > 0) {
//         flattenedData.forEach((row, idx) => {
//             if (selectedRows[row._flattenedIndex] && row.LedgerTransactionID === visitID) {
//                 if (row._pli?.TestIDHash || row._pli?.TestIdHash) {
//                     TestIDHash.push(row._pli.TestIDHash || row._pli.TestIdHash);
//                 }
//             }
//         });
//     }

//     if (TestIDHash.length === 0) {
//         if (data._pli?.TestIDHash || data._pli?.TestIdHash) {
//             TestIDHash.push(data._pli.TestIDHash || data._pli.TestIdHash);
//         } else {
//             const pliList = data.PliDataList || [];
//             pliList.forEach(item => {
//                 if (item.TestIdHash || item.TestIDHash) {
//                     TestIDHash.push(item.TestIdHash || item.TestIDHash);
//                 }
//             });
//         }
//     }

//     APiReport(TestIDHash, loader, index, PHead);
//   };

//   const APiReport = (TestIDHash, loader, index, PHead) => {
//     if (printLoading.index === -1) {
//       setPrintLoading({
//         ...printLoading,
//         [loader]: true,
//         index: index,
//       });
//       const requestOptions = {
//         ...(CheckDevice() == 1 && { responseType: "blob" }),
//       };
//       axiosReport
//         .post(
//           `commonReports/GetLabReport`,
//           {
//             TestIDHash: [...new Set(TestIDHash)],
//             PHead: PHead,
//             PrintColour: "1",
//             IsDownload: CheckDevice(),
//           },
//           requestOptions,
//         )
//         .then((res) => {
//           if (CheckDevice() == 1) {
//             downloadPdf(res.data);
//           } else {
//             if (res?.data?.success) {
//               window.open(res?.data?.url, "_blank");
//             } else {
//               toast.error(res?.data?.message);
//             }
//           }
//           setPrintLoading({ With: false, Without: false, index: -1 });
//         })
//         .catch((err) => {
//           toast.error(err?.response?.data?.message || err?.data?.message || "Something went wrong");
//           setPrintLoading({ With: false, Without: false, index: -1 });
//         });
//     } else {
//       toast.warn("Please wait Generating Report");
//     }
//   };

//   const handleCheck = (row) => {
//       const status = row._pli?.status || row._pli?.Status;
//       if (status == 5 || status == 6 || status == 15) return true;
      
//       if (row._isFirstOfPatient && !status) {
//           return (row.PliDataList || []).some(item => {
//               const s = item.status || item.Status;
//               return s == 5 || s == 6 || s == 15;
//           });
//       }
//       return false;
//   };

//   return (
//     <>
//       {showAddRemark?.modal && (
//         <AddRemark
//           show={showAddRemark.modal}
//           handleShow={() => {
//             setShowAddRemark({ modal: false, rowData: null });
//             TableData("", labNo);
//           }}
//           rowData={showAddRemark.rowData}
//           bindTestFromRow={false}
//           visitKey="VisitNo"
//           ledgerTransactionIDKey="LedgerTransactionID"
//           patientNameKey="PatientName"
//           ageGenderKey={["Age", "Gender"]}
//         />
//       )}
      
//       {flattenedData?.length > 0 ? (
//         <>
//           <div style={{ maxWidth: "400px" }}>
             
//           </div>

//           <div
//             style={{ gap: "6px" }}
//             className="mt-2 mb-3 px-2 py-1 bg-white d-flex sampleStatusClass flex-wrap"
//           >
//             <strong style={{ minWidth: "100px" }}>{t("Sample Status")} : </strong>
//             <TableFilterDot
//                color="transparent"
//                title={t("All")}
//                onClick={() => setStatusFilter("")}
//                bgColor={statusFilter === "" ? "#cecece" : "#e9e2e1"}
//             />
//             {SampleStatus.filter(item => item.value !== "").map((sItem, idx) => (
//               <TableFilterDot
//                 key={idx}
//                 color={`${getStatusColor(sItem?.value)}`}
//                 title={`${t(sItem?.label)}`}
//                 onClick={() => setStatusFilter(sItem?.value)}
//                 bgColor={statusFilter === sItem.value ? "#cecece" : "#e9e2e1"}
//               />
//             ))}
//           </div>

//           <div className="dispatch-report-new-table">
//             <Tables>
//               <thead className="bg-primary text-white">
//                 <tr>
//                   {columnConfig.map((col, idx) => (
//                     <th
//                       key={idx}
//                       style={{
//                         padding: "8px 4px",
//                         textAlign: "center",
//                         fontSize: "13px",
//                         whiteSpace: "nowrap",
//                         fontWeight: "600",
//                       }}
//                     >
//                       {col.hasSelectAll ? (
//                         <div className="d-flex align-items-center justify-content-center">
//                           <input
//                             type="checkbox"
//                             checked={isAllSelected}
//                             onChange={handleSelectAll}
//                             style={{ cursor: "pointer", width: "15px", height: "15px" }}
//                           />
//                         </div>
//                       ) : col.icon ? (
//                         <i className={`fa ${col.icon}`} title={col.tooltip || col.header} />
//                       ) : (
//                         t(col.header)
//                       )}
//                     </th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredData.map((data, rowIndex) => {
//                   const statusClass = data._pli?.status || data._pli?.Status || "transparent";
//                   const isChecked = !!selectedRows[data._flattenedIndex];
//                   return (
//                     <tr key={rowIndex} className={`Status-${statusClass} ${data._isFirstOfPatient ? "patient-group-row" : ""}`}>
//                       {columnConfig.map((col, colIdx) => {
//                           const isVisible = shouldShow(col.header, data, rowIndex);
//                           return (
//                             <td
//                               key={colIdx}
//                               data-title={t(col.header)}
//                               className={!isVisible ? "mobile-hide-column" : ""}
//                               style={{ textAlign: "center" }}
//                             >
//                                {isVisible && (
//                                   <>
//                                      {col.header === "S.No" && (
//                                         <span>{data._patientSerialNumber + IndexHandle(1, 0)}</span>
//                                      )}
//                                      {col.header === "Reg Date" && dateConfig(data?.RegistrationDate)}
//                                      {col.header === "Visit No" && data?.VisitNo}
//                                      {col.header === "Barcode No" && (data._pli?.BarcodeNo || data._pli?.SinNo || "")}
//                                      {col.header === "UHID" && data?.PatientCode}
//                                      {col.header === "Name" && data?.PatientName}
//                                      {col.header === "Age/Gender" && `${data?.Age}/${data?.Gender}`}
//                                      {col.header === "Test" && (
//                                        <div className="dispatch-test-col">
//                                            <div className="d-flex justify-content-start">
//                                               <div className="printTest dispatchTestCell w-100">
//                                                 <div className="px-1 rounded d-flex align-items-center gap-1">
//                                                    <span style={{fontWeight: "500"}}>
//                                                        {data._pli?.TestName || data._pli?.Test || ""}
//                                                    </span>
//                                                 </div>
//                                               </div>
//                                            </div>
//                                        </div>
//                                      )}
//                                      {col.header === "Select" && (
//                                          <input
//                                              type="checkbox"
//                                              checked={isChecked}
//                                              onChange={(e) => handleSelectRow(e, data._flattenedIndex)}
//                                              style={{ cursor: "pointer", width: "13px", height: "13px" }}
//                                          />
//                                      )}
//                                      {col.header === "Print" && handleCheck(data) && (
//                                          <div className="d-flex align-items-center justify-content-center" style={{ gap: "8px" }}>
//                                              {printLoading.Without && printLoading.index === rowIndex ? (
//                                                  <SpinnerLoad />
//                                              ) : (
//                                                  <i
//                                                      className="fa fa-print iconStyle ahddh_black"
//                                                      style={{ cursor: "pointer" }}
//                                                      onClick={() => handleReport(data, "Without", rowIndex, 0)}
//                                                      title="Print without header"
//                                                  />
//                                              )}
//                                              {printLoading.With && printLoading.index === rowIndex ? (
//                                                  <SpinnerLoad />
//                                              ) : (
//                                                  <i
//                                                      className="fa fa-print iconStyle sjhiweo_red"
//                                                      style={{ color: "red", cursor: "pointer" }}
//                                                      onClick={() => handleReport(data, "With", rowIndex, 1)}
//                                                      title="Print with header"
//                                                  />
//                                              )}
//                                          </div>
//                                      )}
//                                      {col.header === "Remarks" && (
//                                          <>
//                                            <div
//                                              data-tooltip-id={`remark-tooltip-${rowIndex}`}
//                                              onClick={() => {
//                                                setShowAddRemark({
//                                                  modal: true,
//                                                  rowData: { ...data },
//                                                });
//                                              }}
//                                              style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "3px", justifyContent: "center" }}
//                                            >
//                                              <div
//                                                style={{
//                                                  backgroundColor: "green",
//                                                  borderRadius: "50%",
//                                                  width: "18px",
//                                                  height: "18px",
//                                                  display: "flex",
//                                                  alignItems: "center",
//                                                  justifyContent: "center",
//                                                  boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
//                                                }}
//                                              >
//                                                <FaPlus color="white" size={8} />
//                                              </div>
//                                              {data.LabRemarkCount > 0 && (
//                                                <span style={{ fontSize: "12px", fontWeight: "bold" }}>
//                                                  ({data.LabRemarkCount})
//                                                </span>
//                                              )}
//                                            </div>
//                                            {data?.RemarksList?.length > 0 && (
//                                              <ReactTooltip
//                                                id={`remark-tooltip-${rowIndex}`}
//                                                place="top"
//                                                style={{ zIndex: 9999 }}
//                                                clickable
//                                                content={<RemarkTooltip remarks={data?.RemarksList} />}
//                                              />
//                                            )}
//                                          </>
//                                      )}
//                                      {col.header === "Doctor" && data?.DoctorName}
//                                      {col.header === "Centre" && data?.Centre}
//                                      {col.header === "View" && (
//                                          <i className="fa fa-search pointer text-primary" onClick={() => {
//                                             setModal(true);
//                                             setVisitID(data?.VisitNo);
//                                             setTestId(data?.TestId);
//                                         }}/>
//                                      )}
//                                      {col.header === "Audit Trail" && (
//                                          <FaEye
//                                              style={{ fontSize: "18px", cursor: "pointer", color: "#007bff" }}
//                                              onClick={() => {
//                                                  setShowPatientModal(true);
//                                                  setSelectedLedgerTransactionNo(data?.VisitNo);
//                                                  setSelectedTestID(data._pli?.TestId || data?._pli?.TestID || 0);
//                                              }}
//                                          />
//                                      )}
//                                      {col.header === "U.D" && (
//                                           <div className="text-info" style={{ cursor: "pointer" }} onClick={() => show2({ modal: true, data: data?.PatientGuid, index: data._patientIndex })}>
//                                             <img src={file} className="sizeicon" /> &nbsp; ({data?.UploadDocumentCount || 0})
//                                           </div>
//                                      )}
//                                      {col.header === "M.H" && (
//                                          <div className="text-info" style={{ cursor: "pointer" }} onClick={() => show({ modal: true, data: data?.PatientGuid, index: data._patientIndex })}>
//                                            <img src={Medical} className="sizeicon" /> &nbsp; ({data?.MedicalHistoryCount || 0})
//                                          </div>
//                                      )}
//                                   </>
//                                )}
//                             </td>
//                           );
//                       })}
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </Tables>
//           </div>
//         </>
//       ) : (
//         <NoRecordFound />
//       )}

//       {modal && <CustomModal show={modal} visitID={visitID} TestId={TestId} onHide={() => setModal(false)} />}

//       <DispatchPatientDetailModal
//         showPH={showPatientModal}
//         setShowPH={setShowPatientModal}
//         ResultData={[{ LedgerTransactionNo: selectedLedgerTransactionNo, TestID: selectedTestID }]}
//         Index={0}
//       />
//     </>
//   );
// };

// export default DynamicLabSearchTableNew;