import React, { useState, useMemo } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { axiosReport, axiosInstance } from "../../utils/axiosInstance";

import Tables from "../../components/UI/customTable";
import Medical from ".././Images/Medical.png";
import file from ".././Images/file.png";
import parse from "html-react-parser";
import { dateConfig } from "../../utils/helpers";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import CustomModal from "../utils/CustomModal";
import Loading from "../../components/loader/Loading";
import SpinnerLoad from "../../components/loader/SpinnerLoad";
import { Link } from "react-router-dom";
import { getStatusColor } from "../../utils/Constants";
import { Modal, Form } from "react-bootstrap";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";

function HistoCytoTable({ 
    dispatchData, 
    innerDataUpdate, 
    selectedRowIndex, 
    filterData = [],
    showColumnModal,
    setShowColumnModal,
    columnConfig,
    getFilterResultOption,
}) {
    // Column visibility is database-backed via columnConfig
    const EmployeeID = useLocalStorage("userData", "get")?.EmployeeID;

    const [modal, setModal] = useState(false);
    const [visitID, setVisitID] = useState();
    const [TestId, setTestId] = useState();
    const [printLoading, setPrintLoading] = useState({
        With: false,
        Without: false,
        index: -1,
    });
    const [Index, setIndex] = useState(-1);
    const [loading, setLoading] = useState(false);

    const { t } = useTranslation();

    const rawColumnsToRender = useMemo(() => {
        return filterData
            .filter((item) => item.TypeId == 2 && item.IsShow == 1)
            .sort((a, b) => a.DisplayOrder - b.DisplayOrder)
            .map((item) => {
                const headerName = item.ControlDisplayID;
                return {
                    header: headerName,
                    tooltip: item.TooltipText || headerName,
                    style: { whiteSpace: "nowrap" }
                };
            });
    }, [filterData]);

    const columnsToRender = useMemo(() => {
        if (!columnConfig || columnConfig.length === 0) {
            return rawColumnsToRender;
        }
        return rawColumnsToRender.filter((col) => {
            const configItem = columnConfig.find(
                (c) => c.header?.toLowerCase() === col.header?.toLowerCase()
            );
            if (configItem) {
                return configItem.visible == 1 || configItem.visible === true;
            }
            return true;
        });
    }, [rawColumnsToRender, columnConfig]);

    const allTableFields = useMemo(() => {
        return rawColumnsToRender.map((c) => c.header);
    }, [rawColumnsToRender]);

    const configList = useMemo(() => {
        return allTableFields.map((field) => {
            const configItem = columnConfig?.find(
                (c) => c.header?.toLowerCase() === field?.toLowerCase()
            );
            return {
                header: field,
                visible: configItem ? (configItem.visible == 1 || configItem.visible === true) : true,
            };
        });
    }, [allTableFields, columnConfig]);

    const handleColumnToggle = (columnName, index) => {
        const updatedColumn = configList.map((ele, i) =>
            i === index ? { ...ele, visible: !ele.visible } : ele
        );

        axiosInstance
            .post("Lab/SaveFilterTableReprintData", {
                SaveData: updatedColumn,
                saveData: updatedColumn,
                PageName: "ResultEntry",
                pageName: "ResultEntry",
                EmployeeId: EmployeeID?.toString() || "",
                employeeId: EmployeeID?.toString() || "",
                EmployeeID: EmployeeID?.toString() || "",
            })
            .then(() => {
                if (typeof getFilterResultOption === "function") {
                    getFilterResultOption();
                }
            })
            .catch((err) => {
                console.error(err);
                toast.error("Failed to update column configuration");
            });
    };

    const extractValuesFromHtml = (htmlString) => {
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = htmlString;

        const inputElements = tempDiv.querySelectorAll('input[type="checkbox"]');
        const extractedValues = Array.from(inputElements).map(
            (input) => input.value
        );

        return extractedValues;
    };

    const handleReport = (data, loader, index, PHead) => {
        if (printLoading.index === -1) {
            setPrintLoading({ ...printLoading, index: index, [loader]: true });
            let TestIDHash = [];
            let documentlength = document.getElementsByClassName(
                data?.LedgerTransactionID
            );

            const extractedValues = extractValuesFromHtml(data?.Test);
            for (let i = 0; documentlength.length > i; i++) {
                const checkboxValue = documentlength[i].value;
                if (
                    documentlength[i].checked &&
                    documentlength[i].id == data?.LedgerTransactionID
                ) {
                    TestIDHash.push(checkboxValue);
                }
            }

            if (TestIDHash.length === 0) {
                TestIDHash.push(...extractedValues);
            }

            const requestOptions = {
                // responseType: "blob",
            };

            axiosReport
                .post(
                    `commonReports/GetLabReport`,
                    {
                        TestIDHash: [...new Set(TestIDHash)],
                        PHead: PHead,
                        PrintColour: "1",
                        IsDownload: 0,
                    },
                    requestOptions
                )
                .then((res) => {
                    if (res?.data?.success) {
                        window.open(res?.data?.url, "_blank");
                    } else {
                        toast.error(res?.data?.message || "Error generating report");
                    }
                })
                .catch((err) => {
                    toast.error(err?.response?.data?.message || "Error Occured");
                })
                .finally(() => {
                    setPrintLoading({ With: false, Without: false, index: -1 });
                });
        } else {
            toast.warn("Please wait Generating Report");
        }
    };

    const handleCheck = (data) => {
        let check = true;
        const datas = parse(data?.Test || "");
        if (Array.isArray(datas) && datas.length > 0) {
            const val = datas?.map((ele) => {
                return ele?.props?.className;
            });
            if (val.includes("round Status-5") || val.includes("round Status-6")) {
                return (check = true);
            } else {
                return (check = false);
            }
        } else if (datas?.props?.className) {
            return (check =
                datas?.props?.className.includes("round Status-5") ||
                datas?.props?.className.includes("round Status-6"));
        }
        return false;
    };

    const handleClickResultEntry = (data, index) => {
        innerDataUpdate(data, index);
    };

    const parseTestItems = (testHtml) => {
        if (!testHtml) return [];
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = testHtml;
        const pTags = tempDiv.querySelectorAll("p");
        return Array.from(pTags).map((p) => ({
            testName: p.textContent?.trim() || "",
            className: p.className || "",
        }));
    };

    const handleTestClick = (data, rowIndex, singleTestID) => {
        const overriddenData = {
            ...data,
            TestID: singleTestID,
        };
        innerDataUpdate(overriddenData, rowIndex);
    };

    const renderCell = (col, data, index) => {
        switch (col.header) {
            case "S.No":
                return index + 1;
            case "Reg Date":
                return <div>{dateConfig(data.DATE)}&nbsp;</div>;
            case "Visit No":
                return (
                    <div onClick={() => handleClickResultEntry(data, index)} style={{ cursor: "pointer" }}>
                        <Link>{data?.LedgerTransactionNo}&nbsp;</Link>
                    </div>
                );
            case "Histo No":
                return data?.HistoNo || "";
            case "Barcode No":
                return data?.BarcodeNo || "";
            case "UHID":
                return data?.PatientCode || "";
            case "Name":
                return data?.PName || "";
            case "Age/Gender":
                return (
                    <div className="d-flex align-items-center" style={{gap: "5px"}}>
                        {data?.Gender === "Female" 
                            ? <i class="bi bi-person-standing-dress mb-0 mt-1" style={{color: "#cf68e1", fontSize: "16px"}}></i>
                            : <i class="bi bi-person-standing mb-0 mt-1" style={{color: "blue", fontSize: "16px"}}></i>
                        }
                        {`${data?.Age} / ${data?.Gender === "Female" ? "F" : "M"}`}
                    </div>
                );
            case "Test":
                const testIds = data?.TestID
                    ? String(data.TestID).split(",").map(id => id.trim()).filter(Boolean)
                    : [];
                const testItems = parseTestItems(data?.Test);
                return (
                    <div className="result-entry-test">
                        {testItems.map((item, tIdx) => {
                            const singleTestID = testIds[tIdx] || testIds[0];
                            let mappedClass = item.className;
                            if(data?.Status) {
                                switch(data.Status) {
                                    case "Not Collected": mappedClass = "round Status-1"; break;
                                    case "Collected": mappedClass = "round Status-2"; break;
                                    case "Receive": mappedClass = "round Status-3"; break;
                                    case "Rejected": mappedClass = "round Status-4"; break;
                                    case "Approved": mappedClass = "round Status-5"; break;
                                    case "Printed": mappedClass = "round Status-6"; break;
                                    case "In Transit": mappedClass = "round Status-7"; break;
                                    case "Tested": mappedClass = "round Status-10"; break;
                                    case "Result Done": mappedClass = "round Status-10"; break;
                                    case "Hold": mappedClass = "round Status-11"; break;
                                    case "MacData": mappedClass = "round Status-13"; break;
                                    case "Re-Run": mappedClass = "round Status-14"; break;
                                    case "Dispatched": mappedClass = "round Status-15"; break;
                                    case "Forwarded": mappedClass = "round Status-18"; break;
                                    case "Dual Authenticated": mappedClass = "round Status-20"; break;
                                    case "OutSource": mappedClass = "round Status-25"; break;
                                }
                            }
                            return (
                                <p
                                    key={tIdx}
                                    className={mappedClass}
                                    style={{ cursor: "pointer", marginBottom: "2px" }}
                                    title="Click to open this test"
                                    onClick={() => handleTestClick(data, index, singleTestID)}
                                >
                                    {item.testName}
                                </p>
                            );
                        })}
                    </div>
                );
            case "Print":
                return handleCheck(data) ? (
                    <div className="d-flex justify-content-center align-items-center" style={{ gap: "10px" }}>
                        {printLoading.Without && printLoading.index === index ? (
                            <SpinnerLoad />
                        ) : (
                            <i
                                className="fa fa-print iconStyle cursor-pointer"
                                onClick={() => handleReport(data, "Without", index, 0)}
                                title="Print without header"
                            ></i>
                        )}
                        {printLoading.With && printLoading.index === index ? (
                            <SpinnerLoad />
                        ) : (
                            <i
                                className="fa fa-print iconStyle cursor-pointer text-danger"
                                onClick={() => handleReport(data, "With", index, 1)}
                                title="Print with header"
                            ></i>
                        )}
                    </div>
                ) : "";
            case "Doctor":
                return data?.Doctor || "";
            case "Centre":
                return data?.Centre || "";
            case "View":
                return (
                    <div
                        onClick={() => {
                            setModal(true);
                            setVisitID(data?.LedgerTransactionNo);
                            setTestId(data?.TestID);
                        }}
                        className="cursor-pointer"
                    >
                        <i className="fa fa-search" />
                    </div>
                );
            default:
                return data[col.header] || "";
        }
    };

    return (
        <div>
            {dispatchData?.length > 0 ? (
                <div className="row">
                    <div className="col-12">
                        <Tables>
                            <thead className="cf" style={{ position: "sticky", top: 0, zIndex: 1 }}>
                                <tr>
                                    {columnsToRender.length > 0 ? (
                                        columnsToRender.map((col, idx) => (
                                            <th key={idx} title={col.tooltip}>
                                                {t(col.header)}
                                            </th>
                                        ))
                                    ) : (
                                        <>
                                            <th>{t("S.No")}</th>
                                            <th>{t("Reg Date")}</th>
                                            <th>{t("Visit No")}</th>
                                            <th>{t("Histo No")}</th>
                                            <th>{t("Barcode No")}</th>
                                            <th>{t("UHID")}</th>
                                            <th>{t("Name")}</th>
                                            <th>{t("Age/Gender")}</th>
                                            <th>{t("Test")}</th>
                                            <th>{t("Print")}</th>
                                            <th>{t("Doctor")}</th>
                                            <th>{t("Centre")}</th>
                                            <th>{t("View")}</th>
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {dispatchData.map((data, index) => (
                                    <tr key={index}>
                                        {columnsToRender.length > 0 ? (
                                            columnsToRender.map((col, idx) => (
                                                <td key={idx} data-title={t(col.header)}>
                                                    {renderCell(col, data, index)}
                                                </td>
                                            ))
                                        ) : (
                                            <>
                                                <td data-title={t("S.No")}>{index + 1}</td>
                                                <td data-title={t("Reg Date")}>{dateConfig(data.DATE)}</td>
                                                <td data-title={t("Visit No")} onClick={() => handleClickResultEntry(data, index)} style={{ cursor: "pointer" }}>
                                                    <Link>{data?.LedgerTransactionNo}</Link>
                                                </td>
                                                <td data-title={t("Histo No")}>{data?.HistoNo}</td>
                                                <td data-title={t("Barcode No")}>{data?.BarcodeNo}</td>
                                                <td data-title={t("UHID")}>{data?.PatientCode}</td>
                                                <td data-title={t("Name")}>{data?.PName}</td>
                                                <td data-title={t("Age/Gender")}>{data?.Age_Gender}</td>
                                                <td data-title={t("Test")}>{renderCell({ header: "Test" }, data, index)}</td>
                                                <td data-title={t("Print")}>{renderCell({ header: "Print" }, data, index)}</td>
                                                <td data-title={t("Doctor")}>{data?.Doctor}</td>
                                                <td data-title={t("Centre")}>{data?.Centre}</td>
                                                <td data-title={t("View")}>{renderCell({ header: "View" }, data, index)}</td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </Tables>
                    </div>
                </div>
            ) : (
                <NoRecordFound />
            )}
            {modal && (
                <CustomModal
                    show={modal}
                    visitID={visitID}
                    TestId={TestId}
                    onHide={() => setModal(false)}
                />
            )}

            {/* Column Settings Modal */}
            <Modal
                show={showColumnModal}
                onHide={() => setShowColumnModal(false)}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>{t("Show/Hide Table Columns")}</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ maxHeight: "60vh", overflowY: "auto" }}>
                    <div className="row">
                        {configList.map((item, idx) => (
                            <div className="col-sm-6 mb-2" key={idx}>
                                <Form.Check
                                    type="switch"
                                    id={`col-toggle-${idx}`}
                                    label={t(item.header)}
                                    checked={!!item.visible}
                                    onChange={() => handleColumnToggle(item.header, idx)}
                                    className="m-0"
                                />
                            </div>
                        ))}
                    </div>
                </Modal.Body>
            </Modal>
        </div>
    );
}

export default HistoCytoTable;
