import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Dialog } from "primereact/dialog";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import Tables from "../../components/UI/customTable";
import Input from "../../components/formComponent/Input";
import { isCheckedNew } from "../../utils/helpers";
import Loading from "../../components/loader/Loading";
import { useTranslation } from "react-i18next";
import { axiosInstance } from "../../utils/axiosInstance";

const AccessReportsModal = ({ show, onHandleClose }) => {
    const [HeaderData, setHeaderData] = useState([]);
    const [TableData, setTableData] = useState([]);
    const [globalSearch, setGlobalSearch] = useState("");
    const [menuSearch, setMenuSearch] = useState("");
    const [activeSection, setActiveSection] = useState(null);
    const [load, setLoad] = useState(false);
    const { t } = useTranslation();
    const theme = useLocalStorage("theme", "get");
    const isMobile = window.innerWidth <= 768;

    useEffect(() => {
        if (show?.id) {
            fetchPageAccessRightsData(show.id);
            resetFilters();
        }
    }, [show]);

    const resetFilters = () => {
        setGlobalSearch("");
        setMenuSearch("");
        setActiveSection(null);
    };

    const fetchPageAccessRightsData = (designationId) => {
        axiosInstance
            .get(`Menu/GetReportAccessByDesignation?designationId=${designationId}`)
            .then((res) => {
                if (res?.data?.success === false) {
                    toast.error(res?.data?.message || "Failed to load data");
                    setTableData([]);
                    setHeaderData([]);
                    return;
                }

                const data = res?.data?.message || [];
                setTableData(data);

                // group by combineReportID for the section headers
                const uniqueHeaderData = data.filter(
                    (item, index, self) =>
                        self.findIndex(
                            (obj) => obj.combineReportID === item.combineReportID
                        ) === index
                );
                setHeaderData(uniqueHeaderData);
            })
            .catch((err) => {
                toast.error(err?.response?.data?.message || "Failed to load data");
            });
    };

    // rows belonging to a section, after applying global + per-section search
    const getRowsForSection = (section) => {
        let rows = TableData.filter(
            (item) => item.combineReportID === section.combineReportID
        );

        const g = globalSearch.trim().toLowerCase();
        if (g) {
            rows = rows.filter(
                (item) =>
                    item.reportName?.toLowerCase().includes(g) ||
                    item.combineReportName?.toLowerCase().includes(g)
            );
        } else if (activeSection === section.combineReportName && menuSearch.trim()) {
            const m = menuSearch.trim().toLowerCase();
            rows = rows.filter((item) => item.reportName?.toLowerCase().includes(m));
        }

        return rows;
    };

    // when global search is on, only show sections that have matching rows
    const sectionsToShow = globalSearch.trim()
        ? HeaderData.filter((section) => getRowsForSection(section).length > 0)
        : HeaderData;

    const handleToggleRow = (reportID, checked) => {
        setTableData((prev) =>
            prev.map((row) =>
                row.reportID === reportID
                    ? { ...row, isMapped: checked ? 1 : 0 }
                    : row
            )
        );
    };

    const handleToggleSection = (combineReportName, checked) => {
        setTableData((prev) =>
            prev.map((row) =>
                row.combineReportName === combineReportName
                    ? { ...row, isMapped: checked ? 1 : 0 }
                    : row
            )
        );
    };

    const handleSubmit = () => {
        const selected = TableData.filter((ele) => ele.isMapped === 1);

        if (selected.length === 0) {
            toast.error("Please Select Atleast One");
            return;
        }

        const payload = {
            DesignationId: show.id,
            ReportIds: selected.map((ele) => ele.reportID),
        };

        setLoad(true);

        axiosInstance
            .post("Menu/SaveReportAccess", payload)
            .then((res) => {
                toast.success(res?.data?.message || "Data saved successfully");
                setLoad(false);
                onHandleClose();
            })
            .catch((err) => {
                toast.error(err?.response?.data?.message || "Failed to save data");
                setLoad(false);
            });
    };

    return (
        <>
            <Dialog
                onHide={onHandleClose}
                className={theme}
                visible={show}
                style={{
                    width: isMobile ? "80vw" : "30vw",
                    height: "100vw",
                }}
                header={
                    <div className="d-flex justify-content-between align-items-center w-100">
                        <div>
                            <strong>{t("Page Rights")}</strong>
                            {show?.name && <span className="ms-2"> – {t(show.name)}</span>}
                        </div>
                        <input
                            type="text"
                            className="form-control form-control-sm"
                            style={{ width: "200px" }}
                            placeholder={t("Search...")}
                            value={globalSearch}
                            onChange={(e) => setGlobalSearch(e.target.value)}
                        />
                    </div>
                }
            >
                <div className="row mb-2">
                    {sectionsToShow.map((ele, index) => {
                        const isOpen =
                            globalSearch.trim() !== "" ||
                            activeSection === ele.combineReportName;
                        const rows = getRowsForSection(ele);

                        // total + selected count for this report group (full data)
                        const groupItems = TableData.filter(
                            (item) => item.combineReportID === ele.combineReportID
                        );
                        const selectedCount = groupItems.filter(
                            (item) => item.isMapped === 1
                        ).length;

                        return (
                            <div key={index} className="col-12 mb-2">
                                <button
                                    className="btn btn-primary w-100"
                                    onClick={() => {
                                        setActiveSection(
                                            activeSection === ele.combineReportName
                                                ? null
                                                : ele.combineReportName
                                        );
                                        setMenuSearch("");
                                    }}
                                >
                                    {t(ele.combineReportName)}{" "}
                                    ({selectedCount}/{groupItems.length})
                                </button>

                                {isOpen && (
                                    <div className="mt-2">
                                        <Tables>
                                            <thead>
                                                <tr>
                                                    <th style={{ width: "45%" }}>
                                                        {t(ele.combineReportName)}
                                                    </th>
                                                    <th style={{ width: "45%" }}>
                                                        {!globalSearch.trim() && (
                                                            <Input
                                                                className="mt-1"
                                                                value={menuSearch}
                                                                onChange={(e) =>
                                                                    setMenuSearch(e.target.value)
                                                                }
                                                            />
                                                        )}
                                                    </th>
                                                    <th
                                                        style={{
                                                            width: "10%",
                                                            textAlign: "center",
                                                        }}
                                                    >
                                                        {show?.name !== "Sales Person" && (
                                                            <input
                                                                type="checkbox"
                                                                name="isMapped"
                                                                onChange={(e) =>
                                                                    handleToggleSection(
                                                                        ele.combineReportName,
                                                                        e.target.checked
                                                                    )
                                                                }
                                                                checked={
                                                                    TableData.length > 0
                                                                        ? !isCheckedNew(
                                                                              "isMapped",
                                                                              TableData,
                                                                              1,
                                                                              ele.combineReportName,
                                                                              "combineReportName"
                                                                          ).includes(false)
                                                                        : false
                                                                }
                                                            />
                                                        )}
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {rows.map((row) => (
                                                    <tr key={row.reportID}>
                                                        <td colSpan={2}>{t(row.reportName)}</td>
                                                        <td style={{ textAlign: "center" }}>
                                                            <input
                                                                type="checkbox"
                                                                name="isMapped"
                                                                checked={row.isMapped === 1}
                                                                onChange={(e) =>
                                                                    handleToggleRow(
                                                                        row.reportID,
                                                                        e.target.checked
                                                                    )
                                                                }
                                                            />
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Tables>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {globalSearch.trim() && sectionsToShow.length === 0 && (
                        <div className="col-12 text-center text-muted py-3">
                            {t("No records found")}
                        </div>
                    )}
                </div>

                <div className="box-footer">
                    <div className="row">
                        <div className="col-sm-2">
                            {load ? (
                                <Loading />
                            ) : (
                                <button
                                    className="btn btn-block btn-success btn-sm"
                                    onClick={handleSubmit}
                                >
                                    {t("Save")}
                                </button>
                            )}
                        </div>
                        <div className="col-sm-2">
                            <button
                                className="btn btn-block btn-danger btn-sm"
                                onClick={onHandleClose}
                            >
                                {t("Close")}
                            </button>
                        </div>
                    </div>
                </div>
            </Dialog>
        </>
    );
};

export default AccessReportsModal;