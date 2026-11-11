import React, { useEffect, useRef, useState } from "react";
import Accordion from "../../components/UI/Accordion";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { apiUrls } from "../../utils/apiUrls";
import { axiosInstance } from "../../utils/axiosInstance";
import { useDispatch } from "react-redux";
import { setLoading } from "../../store/reducers/loadingSlice/loadingSlice";
import Tables from "../../components/UI/customTable";
import './ManageSOP.css';
import { getBase64, getimgurl } from "../../utils/NetworkApi/commonApi";
import { FaSearch } from "react-icons/fa";
import PdfPreviewModal from "../utils/PdfPreviewModal";
import DesignationsModal from "../utils/DesignationsModal";
import FilterInput from "../../components/Filter/FilterInput";
import ViewPrintLogsModal from "../utils/ViewPrintLogsModal";

const ViewSOP = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const [tableData, setTableData] = useState([]);
    const [masterTable, setMasterTable] = useState([]);
    const [previewConfig, setPreviewConfig] = useState({
        visible: false,
        url: null,
    });

    const [searchTerm, setSearchTerm] = useState("");
    const [showPrintModal, setShowPrintModal] = useState(false);
    const [printListGet, setPrintListGet] = useState([]);

    const handleShowPrint = (data) => {
        const parsedPrintList = data?.PrintOutList
                ? JSON.parse(data.PrintOutList)
                : [];
        setPrintListGet(parsedPrintList);
        setShowPrintModal(true);
    };

    // Print Function

    const handlePrint = async (data) => {
        try {
            dispatch(setLoading(true));

            const file = await getBase64(data);

            if (!file) {
                toast.error("Unable to fetch file");
                return;
            }

            showDocument(file);
            getSOPViewData();

        } catch (err) {
            toast.error("Error opening file");
        } finally {
            dispatch(setLoading(false));
        }
    };


    const showDocument = (file) => {
        const byteCharacters = atob(file.base64);
        const byteNumbers = new Array(byteCharacters.length);

        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);

        const blob = new Blob([byteArray], { type: file.mime_type });

        const blobUrl = URL.createObjectURL(blob);

        window.open(blobUrl, "_blank");
    };

    // Filter Function

    const handleChangeSearch = (e) => {
        const value = e.target.value.toLowerCase();
        setSearchTerm(e.target.value);

        if (!value) {
            setTableData(masterTable);
            return;
        }

        const searchableKeys = [
            "SOPName",
        ];

        const filtered = masterTable?.filter((row) =>
            searchableKeys.some((key) =>
                String(row[key] || "")
                    .toLowerCase()
                    .includes(value),
            ),
        );

        setTableData(filtered);
    };

    // View Modal Open functions

    const handleOpenPreview = (keys) => {
        setPreviewConfig({
            visible: true,
            url: keys,
        });
    };
    const handleClosePreview = () => {
        setPreviewConfig({ visible: false, url: null });
    };

    // Onload API

    const getSOPViewData = async () => {

        dispatch(setLoading(true));
        axiosInstance
            .post(apiUrls.GetSOPViewData)
            .then((res) => {
                console.log("get res", res);
                if (res?.data?.success && res?.data?.data?.length > 0) {
                    // toast.success(res?.data?.message);
                    setTableData(res?.data?.data);
                    setMasterTable(res?.data?.data);
                }
                else {
                    // toast.success("No Record Found");
                    setTableData([]);
                    setMasterTable([]);
                }

            })
            .catch((err) => {
                toast.error(
                    err?.data?.data?.message
                        ? err?.data?.data?.message
                        : "Error Occured",
                );
            })
            .finally(() => {
                dispatch(setLoading(false));
            });
    }

    useEffect(() => {
        getSOPViewData();
    }, []);

    console.log("TableData",tableData);
    console.log("printListGet", printListGet)

    return (
        <>
            <Accordion
                name={t("View SOP")}
                defaultValue={true}
                isBreadcrumb={true}
                seconTitle={
                    <FilterInput
                        value={searchTerm}
                        onChange={handleChangeSearch}
                        placeholder="Filter Table"
                    />
                }
            >
                {/* <div className="row p-1">
                    <CustomButton text="Search" icon="Search" className="mx-2" onClick={getSOPViewData} />
                </div> */}

            </Accordion>

            <div className="row">
                <div className="col-12">
                    <Tables>
                        <thead className="cf">
                            <tr>
                                <th>{t("Sr. No")}</th>
                                <th>{t("SOP Name")}</th>
                                {/* <th>{t("Designation")}</th> */}
                                <th>{t("Upload By")}</th>
                                <th>{t("Uploaded Date")}</th>
                                <th>{t("Last Updated By")}</th>
                                <th>{t("Last Updated Date")}</th>
                                <th>{t("View")}</th>
                                <th>{t("Print")}</th>
                                {/* <th>{t("Print Logs")}</th> */}
                            </tr>
                        </thead>

                        <tbody>
                            {tableData?.length > 0 ? (
                                tableData.map((item, i) => {
                                    // const rowColor = item?.IsActive === 1 ? "#75f975" : "#ffe58f";

                                    return (
                                        <tr
                                            key={i}
                                            style={{
                                                // backgroundColor: rowColor,
                                                backgroundImage: "none",
                                                color: "white",
                                            }}
                                        >
                                            <td data-title={t("S. No")} style={{ width: "50px" }}>
                                                {i + 1}

                                            </td>

                                            <td data-title={t("Name")}>{item?.SOPName}</td>

                                            {/* <td data-title={t("Designation")}>
                                                {(() => {
                                                    const designationArray = item?.Designations?.split(",").map((d) => d.trim()) || [];

                                                    return (
                                                        <>
                                                            {designationArray.slice(0, 2).join(", ")}

                                                            {designationArray.length > 2 && (
                                                                <span
                                                                    style={{ cursor: "pointer", color: "blue", marginLeft: "5px" }}
                                                                    onClick={() => handleShowDesignations(item?.Designations)}
                                                                >
                                                                    +{designationArray.length - 2}more
                                                                </span>
                                                            )}
                                                        </>
                                                    );
                                                })()}
                                            </td> */}

                                            <td data-title={t("Upload By")}>{item?.CreatedByName}</td>

                                            <td data-title={t("Uploaded Date")}>{item?.dtEntry}</td>

                                            <td data-title={t("Last Updated By")}>
                                                {item?.LastUpdatedByName || "-"}
                                            </td>

                                            <td data-title={t("Last Updated Date")}>
                                                {item?.LastUpdatedDate || "-"}
                                            </td>

                                            <td data-title={t("View")}>
                                                 <FaSearch
                                                    style={{ marginLeft: "6px", cursor: "pointer", color: "#0087ff" }}
                                                    title="View"
                                                    // onClick={() => handleSearch(item)}
                                                    onClick={() => handleOpenPreview(item?.awsKey)}
                                                    className="mx-2"
                                                />
                                            </td>

                                            <td data-title={t("Print")}>
                                                <i
                                                    className="fa fa-print mx-2"
                                                    style={{ cursor: "pointer", textAlign: "center", color: "black", }}
                                                    onClick={() => handlePrint(item)}
                                                    title="Print"
                                                ></i>
                                                <i
                                                    className="fa fa-file-text"
                                                    style={{ cursor: "pointer", textAlign: "center", color: "#0087ff", }}
                                                    onClick={() => handleShowPrint(item)}
                                                    title="View Print Logs"
                                                ></i>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="8" style={{ textAlign: "center", padding: "10px" }}>
                                        {t("No Records Found")}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Tables>
                </div>
            </div>
            <PdfPreviewModal
                visible={previewConfig.visible}
                url={previewConfig.url}
                onClose={handleClosePreview}
            />
            <ViewPrintLogsModal
                show={showPrintModal}
                onHide={() => setShowPrintModal(false)}
                printList={printListGet}
            />
        </>
    );
};

export default ViewSOP;
