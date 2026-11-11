import React, { useEffect, useMemo, useState } from "react";
import "./PatientReport.css";
import "../../Frontend/Table/CustomeColor.css";
import { Button } from "react-bootstrap";
import Header from "./Header";
import Footer from "../../layouts/footer/Footer";
import { axiosInstance, axiosReport } from "../../utils/axiosInstance";
import parse from "html-react-parser";
import { dateConfig } from "../../utils/helpers";
import { FaDownload, FaPlus, FaFemale, FaUser, FaCalendarAlt, FaIdCard, FaBarcode } from "react-icons/fa";
import { notify } from "../../utils/utils";
import { toast } from "react-toastify";
import AddRemark from "../../Frontend/utils/AddRemark";
import TableFilterDot from "../../components/TableFilter/TableFilterDot";
import { getStatusColor } from "../../utils/Constants";
import Tables from "../../components/UI/customTable";
import NoRecordFound from "../../components/formComponent/NoRecordFound";

const PatientReport = () => {
    const [dispatchData, setDispatchData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState(""); // "" for All
    const [showAddRemark, setShowAddRemark] = useState({ modal: false, rowData: null });
    const [selectedRows, setSelectedRows] = useState([]);
    const [bulkLoading, setBulkLoading] = useState(false);

    const patientData = useMemo(() => {
        try {
            return JSON.parse(sessionStorage.getItem("data")) || JSON.parse(localStorage.getItem("data")) || {};
        } catch (e) {
            return {};
        }
    }, []);
    console.log("patientData", patientData)
    const fetchPatientData = async () => {
        setLoading(true);
        try {
            const token = JSON.parse(sessionStorage.getItem("token")) || JSON.parse(localStorage.getItem("token"));
            const res = await axiosInstance.get("PatientPortal/GetPatientPortalDashboard", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (res?.data?.success) {
                setDispatchData(res?.data?.message || []);
            } else {
                setDispatchData([]);
            }
        } catch (error) {
            console.error("Error while fetching dashboard data", error);
            setDispatchData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPatientData();
    }, []);

    const searchableKeys = ["VisitNo", "PatientName", "Test"];

    // statusFilter can hold multiple comma-separated status values (e.g. the
    // combined "Result Not Done" filter covers both Rejected(4) and Result Done(10))
    const matchesStatusFilter = (val, filter) => filter.split(",").includes(String(val));

    const filteredData = useMemo(() => {
        let data = dispatchData;

        if (statusFilter !== "") {
            data = data.filter(item => {
                try {
                    const pli = JSON.parse(item.PliDataList || "[]");
                    return pli.some(p => matchesStatusFilter(p.Status, statusFilter) || matchesStatusFilter(p.PrintOrderStatus, statusFilter));
                } catch (e) {
                    return false;
                }
            });
        }

        if (searchTerm?.trim()) {
            const search = searchTerm.toLowerCase();
            data = data.filter((row) =>
                searchableKeys.some((key) =>
                    String(row[key] || " ").toLowerCase().includes(search)
                )
            );
        }

        return data;
    }, [dispatchData, searchTerm, statusFilter]);

    const getRowKey = (data) => {
        return `${data.VisitNo}-${data.TestID || data._pli?.TestID || data._testIndex}`;
    };

    const handleCheck = (row) => {
        const pli = row?._pli || {};
        // Result Done (10) is not yet approved/printed, so it should not be selectable/downloadable
        if (Number(pli.Status) === 10) return false;

        // Check standard approved/printed statuses
        if ([5, 6].includes(Number(pli.Status))) return true;

        // Fallback: Check the parsed test element for the backend's "data-approved" flag
        const testEl = row?._testEl;
        const elements = Array.isArray(testEl) ? testEl : (testEl ? [testEl] : []);
        return elements.some(ele => ele?.props?.["data-approved"] == "1");
    };

    // Flattening Logic (Unified source of truth)
    const flattenedData = useMemo(() => {
        const flattened = [];
        filteredData.forEach((data, patientIndex) => {
            let pliList = [];
            try {
                pliList = JSON.parse(data?.PliDataList || "[]");
            } catch (e) {
                pliList = [];
            }

            const parsedContent = parse(data?.Test || "");
            const rawElements = Array.isArray(parsedContent) ? parsedContent : [parsedContent];

            const countInputs = (n) => {
                if (!n) return 0;
                if (n.type === "input") return 1;
                if (n.props?.children) {
                    return React.Children.toArray(n.props.children).reduce((acc, c) => acc + countInputs(c), 0);
                }
                return 0;
            };

            const units = [];
            const splitRecursive = (nodes) => {
                nodes.forEach(node => {
                    if (!node) return;
                    const c = countInputs(node);
                    if (c > 1) {
                        if (node.props?.children) {
                            splitRecursive(React.Children.toArray(node.props.children));
                        } else {
                            units.push(node);
                        }
                    } else {
                        units.push(node);
                    }
                });
            };

            splitRecursive(rawElements);

            let visitHeader = [];
            let testUnits = [];
            let firstInputFound = false;

            units.forEach(u => {
                if (!firstInputFound && countInputs(u) === 0) {
                    visitHeader.push(u);
                } else {
                    firstInputFound = true;
                    testUnits.push(u);
                }
            });

            const rowCount = Math.max(pliList.length, 1);
            for (let i = 0; i < rowCount; i++) {
                const pli = pliList[i] || {};
                let unitForThisRow = testUnits[i] || null;

                if (statusFilter !== "" && !matchesStatusFilter(pli.Status, statusFilter) && !matchesStatusFilter(pli.PrintOrderStatus, statusFilter)) {
                   continue;
                }

                flattened.push({
                    ...data,
                    TestID: pli?.TestID || data?.TestID,
                    _pli: pli,
                    _testEl: unitForThisRow,
                    _visitHeader: i === 0 ? visitHeader : null,
                    _isFirstOfPatient: i === 0,
                    _patientIndex: patientIndex,
                    _testIndex: i,
                    _totalInPatient: rowCount,
                });
            }
        });
        return flattened;
    }, [filteredData, statusFilter]);

    const handleSelectRow = (key) => {
        setSelectedRows(prev => {
            if (prev.includes(key)) {
                return prev.filter(k => k !== key);
            } else {
                return [...prev, key];
            }
        });
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedRows(flattenedData.map(getRowKey));
        } else {
            setSelectedRows([]);
        }
    };

    const handleBulkDownload = async () => {
        if (bulkLoading || selectedRows.length === 0) return;

        const selectedData = flattenedData.filter((data) => selectedRows.includes(getRowKey(data)));
        const TestIDHash = [...new Set(selectedData.map((data) => data._pli?.TestIdHash).filter(Boolean))];

        if (TestIDHash.length === 0) {
            toast.error("No valid tests selected");
            return;
        }

        setBulkLoading(true);
        const token = JSON.parse(sessionStorage.getItem("token")) || JSON.parse(localStorage.getItem("token"));
        await axiosReport
            .post(
                `commonReports/GetLabReport`,
                {
                    TestIDHash,
                    PHead: 1,
                    PrintColour: "1",
                    IsDownload: 1,
                },
                {
                    responseType: "blob",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            )
            .then(async (res) => {
                const blob = res.data;
                if (blob.type.includes("json")) {
                    const text = await blob.text();
                    notify(JSON.parse(text)?.message || "Something went wrong", "error");
                } else {
                    const pdfUrl = window.URL.createObjectURL(blob);
                    window.open(pdfUrl, "_blank");
                }
            })
            .catch(() => toast.error("Something went wrong"))
            .finally(() => setBulkLoading(false));
    };

    const statusLegend = [
        // { label: "Pending", value: "1" },
        { label: "Sample Collected", value: "3" },
        { label: "Result Not Approved", value: "1,4,10" },
        { label: "Approved", value: "5" },
        { label: "Printed", value: "6" },
        { label: "Due Amount", value: "11" },
    ];

    // Due Amount is shown pink here (patient portal only); other pills keep
    // the shared Result Entry status colors from getStatusColor.
    const getLegendDotColor = (value) => {
        if (value === "11") return "#ff69b4";
        if (value === "1,4,10") return getStatusColor("10");
        return getStatusColor(value);
    };

    return (
        <>
            <Header />
            {showAddRemark?.modal && (
                <AddRemark
                    show={showAddRemark.modal}
                    handleShow={() => {
                        setShowAddRemark({ modal: false, rowData: null });
                        fetchPatientData();
                    }}
                    rowData={showAddRemark.rowData}
                    defaultTestFromRow={true}
                    visitKey="VisitNo"
                    testIDsKey="TestID"
                    ledgerTransactionIDKey="LedgerTransactionID"
                />
            )}

            <div className="report-container">
                <div className="welcome-section shadow-lg border-0">
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                        <div className="animate__animated animate__fadeInLeft">
                            <h1 className="title" style={{ fontSize: '32px', fontWeight: '800' }}>
                                Welcome back, {patientData?.patientName || "Patient"}!
                            </h1>
                            <p className="description" style={{ opacity: 0.9 }}>
                                View and download your laboratory reports securely in one place.
                            </p>
                        </div>
                        <button 
                            type="button"
                            className="btn btn-light px-4 py-2 shadow-sm d-none d-md-flex align-items-center gap-2 animate__animated animate__fadeInRight refresh-btn-premium" 
                            onClick={(e) => {
                                e.stopPropagation();
                                fetchPatientData();
                            }} 
                            style={{
                                borderRadius: '12px', 
                                fontWeight: '700', 
                                color: '#6366f1', 
                                border: 'none',
                                position: 'relative',
                                zIndex: 100, /* Ensure it's above any invisible overlaps */
                                cursor: 'pointer'
                            }}
                        >
                            <i className={`fa fa-refresh ${loading ? 'fa-spin' : ''}`} style={{ pointerEvents: 'none' }}></i> 
                            <span style={{ pointerEvents: 'none' }}>
                                {loading ? 'Refreshing...' : 'Refresh Dashboard'}
                            </span>
                        </button>
                    </div>
                </div>

                <div className="filter-card shadow-sm border-0 mb-4 animate__animated animate__fadeIn">
                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                        <div className="d-flex align-items-center gap-3 flex-wrap">
                            <div className="filter-title d-none d-md-flex mb-0 mr-2">Filter Reports:</div>
                            {statusLegend.map((s, idx) => {
                                const isActive = statusFilter === s.value;
                                return (
                                    <div 
                                        key={idx} 
                                        className={`status-pill pointer shadow-sm ${isActive ? 'active-pill' : ''}`}
                                        onClick={() => setStatusFilter(isActive ? "" : s.value)}
                                    >
                                        <span
                                            className="status-dot"
                                            style={{ backgroundColor: getLegendDotColor(s.value) }}
                                        ></span>
                                        {s.label}
                                    </div>
                                );
                            })}
                        </div>
                        {statusFilter && (
                            <button 
                                className="btn btn-link text-danger p-0 ml-auto font-weight-bold d-flex align-items-center gap-1" 
                                onClick={() => setStatusFilter("")}
                                style={{textDecoration: 'none', fontSize: '13px'}}
                            >
                                <i className="fa fa-times-circle"></i> Clear Filters
                            </button>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-grow text-primary mb-3" role="status" style={{ width: '3.5rem', height: '3.5rem' }}></div>
                        <h5 className="text-muted font-weight-bold">Fetching your reports...</h5>
                    </div>
                ) : flattenedData.length > 0 ? (
                    <div className="dispatch-report-new-table mb-5 animate__animated animate__fadeInUp">
                        <table className="premium-table w-100">
                            <thead>
                                <tr>
                                    <th className="text-center" style={{ width: "60px" }}>S.No</th>
                                    <th style={{ width: "160px" }}>Reg Date</th>
                                    <th style={{ width: "160px" }}>Visit No</th>
                                    <th style={{ width: "140px" }}>Barcode</th>
                                    <th style={{ width: "240px" }}>Patient Name</th>
                                    <th style={{ width: "130px" }} className="text-center">Age / Gender</th>
                                    <th style={{ width: "300px" }}>Test Details</th>
                                    <th className="text-center" style={{ width: "120px" }}>Status</th>
                                    <th className="text-center" style={{ width: "90px" }}>Select</th>
                                </tr>
                            </thead>
                            <tbody>
                                {flattenedData.map((data, index) => {
                                    const rowKey = getRowKey(data);
                                    const isSelected = selectedRows.includes(rowKey);

                                    const getRowStatusClass = (val) => {
                                        return `Status-${val || "transparent"}`;
                                    };

                                    return (
                                        <tr key={index} className={`premium-row ${getRowStatusClass(data._pli?.Status)}`}>
                                            <td className="text-center" data-title="S.No">
                                                <span className="font-weight-bold opacity-50">{data._isFirstOfPatient ? index + 1 : ""}</span>
                                            </td>
                                            <td data-title="Reg Date">
                                                <div className="d-flex align-items-center">
                                                    {data._isFirstOfPatient && (
                                                        <>
                                                            <FaCalendarAlt className="table-icon" />
                                                            <span className="font-weight-medium">{dateConfig(data?.RegistrationDate)}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                            <td data-title="Visit No">
                                                <div className="d-flex align-items-center">
                                                    {data._isFirstOfPatient && (
                                                        <div className="visit-badge shadow-sm">
                                                            <FaIdCard className="mr-1" style={{opacity: 0.5}} />
                                                            {data?.VisitNo}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td data-title="Barcode">
                                                <div className="d-flex align-items-center">
                                                    <FaBarcode className="table-icon" />
                                                    <span className="text-muted font-weight-bold" style={{fontSize: '12px'}}>{data._pli?.BarcodeNo || data._pli?.SinNo || "-"}</span>
                                                </div>
                                            </td>
                                            <td data-title="Patient Name">
                                                {data._isFirstOfPatient && (
                                                    <div className="d-flex align-items-center gap-3">
                                                        <div className="avatar shadow-sm" style={{
                                                            background: data?.Gender === "Female" ? 'linear-gradient(135deg, #fca5a5 0%, #ef4444 100%)' : 'linear-gradient(135deg, #93c5fd 0%, #3b82f6 100%)', 
                                                        }}>
                                                            {data?.Gender === "Female" ? <FaFemale size={10} /> : <FaUser size={10} />}
                                                        </div>
                                                        <span className="font-weight-bold" style={{ color: '#111827', fontSize: '14px' }}>{data?.PatientName}</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="text-center" data-title="Age / Gender">
                                                {data._isFirstOfPatient && (
                                                    <span className="badge px-3 py-2 bg-white text-dark shadow-sm border" style={{ fontSize: '11px', fontWeight: '800', borderRadius: '6px' }}>
                                                        {data?.Age} / {data?.Gender === "Female" ? "F" : "M"}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="dispatch-test-col" data-title="Test Details">
                                                <div className="dispatchTestCell py-1">
                                                    {data._visitHeader}
                                                    <div className="d-flex align-items-center gap-3">
                                                        <div className="d-flex flex-column">
                                                            <label htmlFor={`check-${rowKey}`} className={`m-0 pointer font-weight-bold ${handleCheck(data) ? 'text-dark' : 'text-muted'}`} style={{ fontSize: '13px', lineHeight: '1.4' }}>
                                                                {data._pli?.TestName || data._pli?.Test}
                                                            </label>
                                                            {/* Render the dynamic test details/inputs from _testEl */}
                                                            {data._testEl}
                                                            <small className="text-muted font-weight-bold d-block mt-1" style={{fontSize: '10px', textTransform: 'uppercase'}}>
                                                                {data._pli?.Status == 5 ? "Approved" : 
                                                                 data._pli?.Status == 6 ? "Printed" :
                                                                 data._pli?.Status == 10 ? "Result" :
                                                                 data._pli?.Status == 11 ? "Due" :
                                                                 data._pli?.Status == 3 ? "Received" :
                                                                 data._pli?.Status == 1 ? "Pending" : ""}
                                                            </small>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="text-center" data-title="Status">
                                                <span className={`status-text-badge ${Number(data._pli?.Status) === 11 ? "due-patient-badge" : "clear-amount-badge"}`}>
                                                    {Number(data._pli?.Status) === 11 ? "Due Patient" : "Clear Amount"}
                                                </span>
                                            </td>
                                            <td className="text-center" data-title="Select">
                                                {handleCheck(data) ? (
                                                    <input
                                                        type="checkbox"
                                                        className="premium-checkbox"
                                                        id={`check-${rowKey}`}
                                                        checked={isSelected}
                                                        onChange={() => handleSelectRow(rowKey)}
                                                        title="Select"
                                                    />
                                                ) : (
                                                    <span className="text-muted opacity-50" title="Awaiting Approval">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : null}

                {selectedRows.length > 0 && (
                    <div className="bulk-download-bar">
                        <span className="font-weight-bold text-muted" style={{ fontSize: "13px" }}>
                            {selectedRows.length} report{selectedRows.length > 1 ? "s" : ""} selected
                        </span>
                        <button
                            type="button"
                            className="download-btn-premium px-4"
                            style={{ width: "auto", borderRadius: "10px", gap: "8px" }}
                            disabled={bulkLoading}
                            onClick={handleBulkDownload}
                        >
                            {bulkLoading ? (
                                <div className="spinner-border spinner-border-sm" role="status"></div>
                            ) : (
                                <FaDownload size={12} />
                            )}
                            Download Selected
                        </button>
                    </div>
                )}

                {!loading && flattenedData.length === 0 && (
                    <div className="py-5 shadow-sm rounded-lg bg-white border animate__animated animate__fadeIn">
                        <NoRecordFound />
                    </div>
                )}
            </div>
            <Footer />
        </>
    );
};

export default PatientReport;