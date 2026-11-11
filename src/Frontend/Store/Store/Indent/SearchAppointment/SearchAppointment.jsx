import React, { useState, useEffect } from "react";
import moment from "moment";
import Heading from "../../../../components/UI/Heading";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import { useTranslation } from "react-i18next";
import {
    getBindCentreType,
    getBindLocation,
    GetZoneData,
} from "../../../../utils/NetworkApi/commonApi";
import MultiSelectComp from "../../../../components/formComponent/MultiSelectComp";
import { toast } from "react-toastify";
import DatePicker from "../../../../components/formComponent/DatePicker";
import { axiosInstance, axiosReport } from "../../../../utils/axiosInstance";
import TableFilterDot from "../../../Components/TableFilterDot";
import { Accordion, Modal } from "react-bootstrap";
import Tables from "../../../../components/UI/customTable";
import NoRecordFound from "../../../../components/formComponent/NoRecordFound";
import { PhelbosearchDefault, statusList } from "../../../../utils/Constants";
import { CustomButton } from "../../../../components/UI/CustomButton";
import SearchAppointmentModal from "./SearchAppointmentModal";
import SearchPhleboModal from "./SearchPhleboModal";
import SearchAppointmentTestNameModal from "./SearchAppointmentTestNameModal";
import AppointmentReason from "./AppointmentReason";
import { SelectBox } from "../../../../components/formComponent/SelectBox";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";


const SearchAppointment = () => {
    const { t } = useTranslation();
    const [activeData, setActiveData] = useState([]);
    const [searchData, setSearchData] = useState(PhelbosearchDefault);
    const [tableData, setTableData] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showModalData, setShowModalData] = useState(false);
    const [getPro, setGetPro] = useState({});
    const [Reason, setReason] = useState("");
    const [selectedRow, setSelectedRow] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [filterData, setFilterData] = useState([]);
    const [dropDownApis, setDropDownApis] = useState({
        PhleboName: [],
        DateOption: [
            { label: "EntryDate", value: "EntryDate" },
            { label: "AppointmentDate", value: "AppDate" },
        ],
    });
    const [payload, setPayload] = useState({
        DateOption: "EntryDate",
        PhleboName: "",
        FromDate: new Date(),
        ToDate: new Date(),
        //STATUS: "",
        RowColor: "",
    });
    const [editTestRowId, setEditTestRowId] = useState(null);
    const [editTestSearch, setEditTestSearch] = useState("");
    const [selectedEditTests, setSelectedEditTests] = useState([]);
    const [oldEditTests, setOldEditTests] = useState([]);
    const [testSuggestion, setTestSuggestion] = useState([]);
    const [indexMatch, setIndexMatch] = useState(0);
    const [previewConfig, setPreviewConfig] = useState({
        visible: false,
        images: [],
        currentIndex: 0,
        loading: false,
    });

    const isApprovalLocked = (row) => Number(row?.STATUS) !== 0;

    const getEditTestCentreId = () => 2;

    const splitEditTestValue = (value) => {
        if (Array.isArray(value)) return value;
        if (value === null || value === undefined) return [];

        return String(value)
            .split(/<br\s*\/?>|,|\|/i)
            .map((item) => item.trim())
            .filter(Boolean);
    };

    const getEditTestId = (test) => test?.InvestigationID || test?.id;

    const getEditTestName = (test) => test?.TestName || "";

    const getExistingEditTests = (row) => {
        if (!row?.TestName) return [];

        const testNames = splitEditTestValue(row?.TestName);
        if (testNames.some((name) => String(name).includes("#"))) {
            return testNames
                .map((item) => {
                    if (String(item).includes("#")) {
                        const parts = String(item).split("#");
                        return {
                            InvestigationID: parts[0],
                            TestName: parts.slice(1).join("#"),
                        };
                    }
                    return null;
                })
                .filter(Boolean);
        }

        return [];
    };

    const handleEditClick = (row) => {
        if (isApprovalLocked(row)) {
            toast.error("Only open appointment test is editable");
            return;
        }
        const existingTests = getExistingEditTests(row);
        setEditTestRowId(row?.id);
        setEditTestSearch("");
        setOldEditTests(existingTests);
        setSelectedEditTests([]);
        setTestSuggestion([]);
        setIndexMatch(0);
    };

    const handleEditTestClose = () => {
        setEditTestRowId(null);
        setEditTestSearch("");
        setOldEditTests([]);
        setSelectedEditTests([]);
        setTestSuggestion([]);
        setIndexMatch(0);
    };

    const handleEditTestChange = (e, row) => {
        const value = e.target.value;
        setEditTestSearch(value);

        if (value.length < 3) {
            setTestSuggestion([]);
            return;
        }

        axiosInstance
            .post("TestData/BindBillingTestData", {
                TestName: value,
                CentreID: getEditTestCentreId(row),
                SearchBy: "TestName",
                ActualRateTypeID: getEditTestCentreId(row),
                AllowZeroRateBooking: 0,
            })
            .then((res) => {
                if (res?.data?.success) {
                    setTestSuggestion(res?.data?.message || []);
                    setIndexMatch(0);
                } else {
                    setTestSuggestion([]);
                    toast.error(res?.data?.message || "Please check rate/Share and sample type");
                }
            })
            .catch((err) => {
                setTestSuggestion([]);
                toast.error(err?.response?.data?.message || "Something Went Wrong");
            });
    };

    const handleSelectEditTest = (test) => {
        const investigationID = getEditTestId(test);
        setSelectedEditTests((prev) => {
            const alreadySelected =
                prev.some((item) => String(item?.InvestigationID) === String(investigationID)) ||
                oldEditTests.some((item) => String(item?.InvestigationID) === String(investigationID));
            if (alreadySelected) {
                toast.error("This test already booked");
                return prev;
            }
            return [
                ...prev,
                {
                    ...test,
                    InvestigationID: investigationID,
                    TestName: getEditTestName(test),
                },
            ];
        });
        setEditTestSearch("");
        setTestSuggestion([]);
        setIndexMatch(0);
    };

    const handleRemoveEditTest = (investigationID) => {
        setSelectedEditTests((prev) =>
            prev.filter((item) => String(item?.InvestigationID) !== String(investigationID))
        );
    };

    const handleCancelOldTest = async (item) => {
        try {
            const res = await axiosInstance.post(
                `HomeCollectionSearch/DeleteOldAppointmentTest?ID=${Number(editTestRowId)}&InvestigationId=${Number(item?.InvestigationID)}`
            );
            if (res?.data?.success) {
                toast.success(res?.data?.message || "Test cancelled successfully");
                setOldEditTests((prev) =>
                    prev.filter((t) => String(t?.InvestigationID) !== String(item?.InvestigationID))
                );
                handleSearch();
            } else {
                toast.error(res?.data?.message || "Could not cancel test");
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || "Something Went Wrong");
        }
    };

    const getFileUrl = async (key) => {
        if (!key) return null;
        try {
            const res = await axiosInstance.post("CommonController/GetFileUrl", { Key: key });
            const message = res?.data?.message;

            if (typeof message === "string") return message;

            // API returns the signed URL in downloadUrl
            return message?.downloadUrl || message?.imgUrl || null;
        } catch (err) {
            return null;
        }
    };

    const getDocumentByGuid = async (documentGuid) => {
        const res = await axiosInstance.post("CommonController/GetDocument", {
            CompanyId: "",
            Guid: documentGuid,
            Page: "Add Attachment",
        });
        if (res?.data?.success) {
            const documents = res?.data?.message || [];
            const documentData = await Promise.all(
                documents.map(async (data) => ({
                    ...data,
                    imgUrl: await getFileUrl(data?.awsKey),
                    fileKey: data?.awsKey,
                }))
            );
            return documentData.filter((item) => item?.imgUrl);
        }
        return [];
    };

    const getDocumentByFileName = async (fileName) => {
        const imgUrl = await getFileUrl(fileName);
        if (!imgUrl) return [];
        return [{ imgUrl, fileKey: fileName, awsKey: fileName }];
    };

    const handleOpenPreview = async (row) => {
        if (!row?.DocumentGuid && !row?.FileName && !row?.awskey) {
            toast.error("Document not found");
            return;
        }

        setPreviewConfig({ visible: true, images: [], currentIndex: 0, loading: true });

        try {
            let documentData = [];

            if (row?.DocumentGuid) {
                documentData = await getDocumentByGuid(row.DocumentGuid);
            }

            if ((!documentData || documentData.length === 0) && (row?.awskey || row?.FileName)) {
                documentData = await getDocumentByFileName(row?.awskey || row?.FileName);
            }

            if (documentData?.length > 0) {
                setPreviewConfig({ visible: true, images: documentData, currentIndex: 0, loading: false });
            } else {
                setPreviewConfig({ visible: false, images: [], currentIndex: 0, loading: false });
                toast.error("No Document Found");
            }
        } catch (error) {
            setPreviewConfig({ visible: false, images: [], currentIndex: 0, loading: false });
            toast.error("Error fetching documents");
        }
    };

    const handleClosePreview = () => {
        setPreviewConfig({ visible: false, images: [], currentIndex: 0, loading: false });
    };

    const handleNextImage = () => {
        setPreviewConfig((prev) =>
            prev.currentIndex < prev.images.length - 1
                ? { ...prev, currentIndex: prev.currentIndex + 1 }
                : prev
        );
    };

    const handlePrevImage = () => {
        setPreviewConfig((prev) =>
            prev.currentIndex > 0 ? { ...prev, currentIndex: prev.currentIndex - 1 } : prev
        );
    };

    const isPdf = (value) =>
        typeof value === "string" && value.toLowerCase().includes(".pdf");

    const handleEditTestSave = async () => {
        if (!selectedEditTests.length) {
            toast.error("Please select at least one new test to add");
            return;
        }

        const investigationIds = selectedEditTests.map((item) =>
            String(item?.InvestigationID)
        );

        const uniqueInvestigationIds = [...new Set(investigationIds)];

        if (investigationIds.length !== uniqueInvestigationIds.length) {
            toast.error("Duplicate test not allowed");
            return;
        }

        const hasDuplicate = selectedEditTests.some((item) =>
            oldEditTests.some((old) => String(old.InvestigationID) === String(item.InvestigationID))
        );
        if (hasDuplicate) {
            toast.error("One or more selected tests already exist in current tests");
            return;
        }

        try {
            const res = await axiosInstance.post("HomeCollectionSearch/SaveAppointmentTest", {
                appointmentID: Number(editTestRowId),
                investigation: selectedEditTests.map((item) => Number(item?.InvestigationID)),
            });

            if (res?.data?.success) {
                toast.success("Test details updated successfully");
                handleSearch();
                handleEditTestClose();
            } else {
                toast.error(res?.data?.message || "Test detail not found");
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || "Something Went Wrong");
        }
    };

    const handleEditTestIndex = (e, row) => {
        if (!testSuggestion.length) return;

        switch (e.which) {
            case 38:
                setIndexMatch(indexMatch === 0 ? testSuggestion.length - 1 : indexMatch - 1);
                break;
            case 40:
                setIndexMatch(indexMatch === testSuggestion.length - 1 ? 0 : indexMatch + 1);
                break;
            case 13:
                handleSelectEditTest(testSuggestion[indexMatch]);
                break;
            default:
                break;
        }
    };

    const handleOpenModal = async (id) => {
        await getPopupData(id);
        setShowModal(true);
    };
    const handlePhlebo = (data) => {
        // setSelectedRow(rowData);
        setGetPro(data);
        setShowModalData(true);
    }

    const handleSelectChange = (name, value) => {
        setPayload((prev) => ({
            ...prev,
            [name]: value?.value
        }))
    }
    const dateSelect = (date, name) => {
        setPayload({
            ...payload,
            [name]: date,
        });
    };

    const getStatus = [
        { label: "Open", value: 0 },
        { label: "App Confirm", value: 1 },
        { label: "Phlebo Assign", value: 2 },
        { label: "Sample Collected Home", value: 3 },
        { label: "Booking Done", value: 4 },
        { label: "Cancel", value: 5 },
    ];

    const getPhelbo = async () => {
        try {
            const res = await axiosInstance.post(
                "PhelebotomistMaster/SearchPhlebotomist", { ...searchData }
            );
            if (res?.data?.success && Array.isArray(res?.data?.message)) {
                setDropDownApis((prev) => ({ ...prev, PhleboName: res.data.message }));
            } else {
                setDropDownApis((prev) => ({ ...prev, PhleboName: [] }));
            }
        } catch (error) {
            console.log("Error", error);
        }
    };
    useEffect(() => {
        if (payload?.RowColor) {
            handleSearch(payload.RowColor);
        }
    }, [payload.RowColor]);

    // const handleSearch = async () => {
    //     try {
    //         const finalPayload = {
    //             fromDate: moment(payload?.FromDate).format("YYYY-MM-DD") || "",
    //             toDate: moment(payload?.ToDate).format("YYYY-MM-DD") || "",
    //             status: payload?.RowColor || "",
    //             dateOption: payload?.DateOption || "",
    //             proAssign: String(payload?.PhleboName) || ""
    //         };
    //         const res = await axiosInstance.post(
    //             "HomeCollectionSearch/SearchAppointmentData",
    //             finalPayload
    //         );
    //         if (res?.data?.success && Array.isArray(res?.data?.data)) {
    //             setTableData(res.data.data);
    //             setActiveData(res.data.data);
    //             toast.success(res?.data?.message);
    //         } else {
    //             setTableData([]);
    //             setActiveData([]);
    //             toast.error("No Record Found");
    //         }
    //     } catch (error) {
    //         console.log("Error", error);
    //     }
    // };

    const handleSearch = async () => {
        try {
            const finalPayload = {
                fromDate: moment(payload?.FromDate).format("YYYY-MM-DD") || "",
                toDate: moment(payload?.ToDate).format("YYYY-MM-DD") || "",
                status: payload?.RowColor || "",
                dateOption: payload?.DateOption || "",
                proAssign: String(payload?.PhleboName) || ""
            };
            const res = await axiosInstance.post(
                "HomeCollectionSearch/SearchAppointmentData",
                finalPayload
            );
            const responseData = res?.data?.data;
            if (res?.data?.success && Array.isArray(responseData) && responseData.length > 0) {
                setTableData(responseData);
                setActiveData(responseData);
                toast.success(res?.data?.message);
            } else {
                setTableData([]);
                setActiveData([]);
                toast.error("No Record Found");
            }
        } catch (error) {
            console.log("Error", error);
            toast.error("Something went wrong");
        }
    };

    useEffect(() => {
        getPhelbo();
        // getPopupData();
    }, []);
    const getPopupData = async (id) => {
        try {
            const res = await axiosInstance.get(
                `HomeCollectionSearch/popupData?id=${id}`
            );
            const response = res?.data?.data;
            setFilterData(response);
            // toast.success("Data fetched successfully");
        } catch (err) {
            console.log("Something went wrong", err);
            toast.error(err?.response?.data?.message || "Error fetching data");
        }
    };

    const handleSelectChangeData = (e, id, rowData) => {
        const { name, value } = e.target;
        const status = value;
        if (name === "STATUS") {
            if (status == 5) {
                setSelectedRow(rowData);
                setSelectedStatus(status);
                setReason(true);
                return;
            }
            callStatusApi(status, rowData, "");
            setActiveData((prev) =>
                prev.map((item) =>
                    item.id === id
                        ? { ...item, STATUS: value }
                        : item
                )
            );
        } else {
            setActiveData((prev) =>
                prev.map((item) =>
                    item.id === id
                        ? { ...item, [name]: value }
                        : item
                )
            );
        }
    };

    const callStatusApi = async (status, rowData, reason) => {
        const appId = rowData?.id;
        try {
            if (status == 0) {
                await axiosInstance.post("HomeCollectionSearch/ReopenApp", {
                    appId,
                    reopenReason: reason?.Reason
                })
                    .then((res) => {
                        const data = res?.data?.message;
                        const success = res?.data?.success;
                        if (success) {
                            toast.success(data);
                        }
                        handleSearch();
                    })
                    .catch((err) => {
                        toast.error(err?.response?.data?.message || "Something went wrong");
                    });

            } else if (status == 1) {
                await axiosInstance.get(`HomeCollectionSearch/ConfirmApp?AppId=${appId}`)
                    .then((res) => {
                        const data = res?.data?.message;
                        const success = res?.data?.success;
                        if (success) {
                            toast.success(data);
                        }
                        handleSearch();
                        payload.RowColor = "";
                    })
                    .catch((err) => {
                        toast.error(err?.response?.data?.message || "Something went wrong");
                    });

            } else if (status == 2) {
                setSelectedRow(rowData);
                setGetPro(rowData);
                setShowModalData(true);
                return;

            } else if (status == 3) {
                await axiosInstance.get(`HomeCollectionSearch/SampleCollectedApp?AppId=${appId}`)
                    .then((res) => {
                        const data = res?.data?.message;
                        const success = res?.data?.success;
                        if (success) {
                            toast.success(data);
                        }
                        handleSearch();
                        payload.RowColor = "";
                    })
                    .catch((err) => {
                        toast.error(err?.response?.data?.message || "Something went wrong");
                    });

            } else if (status == 4) {
                await axiosInstance.get(`HomeCollectionSearch/BookingDone?AppId=${appId}`)
                    .then((res) => {
                        const data = res?.data?.message;
                        const success = res?.data?.success;
                        if (success) {
                            toast.success(data);
                        } else {
                            toast.error(data);
                        }
                        handleSearch();
                        payload.RowColor = "";
                    })
                    .catch((err) => {
                        toast.error(err?.response?.data?.message || "Something went wrong");
                    });
            } else if (status == 5) {
                await axiosInstance.post("HomeCollectionSearch/CancelApp", {
                    appId,
                    cancelReason: reason?.Reason,
                    otherReason: reason?.OtherReason
                })
                    .then((res) => {
                        const data = res?.data?.message;
                        const success = res?.data?.success;
                        if (success) {
                            toast.success(data);
                        }
                        handleSearch();
                        payload.RowColor = "";
                    })
                    .catch((err) => {
                        toast.error(err?.response?.data?.message || "Something went wrong");
                    });
            }
            setActiveData((prev) =>
                prev.map((item) =>
                    item.id === appId
                        ? { ...item, STATUS: status }
                        : item
                )
            );
            setReason(false);
        } catch (error) {
            console.log("Error", error);
        }
    };

    const handleReasonSubmit = (reasonText) => {
        callStatusApi(selectedStatus, selectedRow, reasonText);
    };

    const handlePhleboSubmit = async (data) => {
        try {
            const res = await axiosInstance.post("HomeCollectionSearch/SavePro", data);
            const message = res?.data?.message;
            const success = res?.data?.success;
            if (success) {
                toast.success(message);
            } else {
                toast.error(message);
                return;
            }
            const updatedData = activeData.map(item =>
                item.id === data.appId
                    ? { ...item, STATUS: 2 }
                    : item
            );

            setActiveData(updatedData);
            setShowModalData(false);
            handleSearch();

        } catch (err) {
            toast.error(err?.response?.data?.message || "API Error");
            console.log(err);
        }
    };

    const handleExcel = async () => {
        try {
            const finalPayload = {
                fromDate: moment(payload?.FromDate).format("YYYY-MM-DD") || "",
                toDate: moment(payload?.ToDate).format("YYYY-MM-DD") || "",
                status: payload?.RowColor || "",
                dateOption: payload?.DateOption || "",
                proAssign: String(payload?.PhleboName) || ""
            };
            const res = await axiosInstance.post(
                "HomeCollectionSearch/SearchAppointmentData",
                finalPayload
            );
            const apiData = res?.data?.data || [];
            if (!apiData.length) {
                toast.error("No data found");
                return;
            }
            const worksheet = XLSX.utils.json_to_sheet(apiData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Appointments");
            const excelBuffer = XLSX.write(workbook, {
                bookType: "xlsx",
                type: "array"
            });
            const blob = new Blob([excelBuffer], {
                type:
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            });
            saveAs(blob, "AppointmentData.xlsx");
        } catch (error) {
            console.error(error);
        }
    };


    const editTestRow = activeData.find((item) => item?.id === editTestRowId);
    const currentDoc = previewConfig.images[previewConfig.currentIndex];

    return (
        <>
            {showModal && (
                <SearchAppointmentModal
                    show={showModal}
                    setShowModal={setShowModal}
                    filteredTable={filterData}
                    handleClose={() => setShowModal(false)}
                />
            )}
            {showModalData && (
                <SearchPhleboModal
                    show={showModalData}
                    getPro={getPro}
                    setSelectedRow={setSelectedRow}
                    phleboData={dropDownApis?.PhleboName}
                    setShowModal={setShowModalData}
                    handleClose={() => setShowModalData(false)}
                    handleSubmit={handlePhleboSubmit}
                />
            )}
            {Reason && (
                <AppointmentReason
                    show={Reason}
                    setShowModal={setReason}
                    Status={selectedStatus}
                    handleClose={() => setReason(false)}
                    onSubmit={handleReasonSubmit}
                />
            )}
            {previewConfig.visible && (
                <Modal show={previewConfig.visible} onHide={handleClosePreview} size="lg" centered>
                    <Modal.Header closeButton>
                        <Modal.Title className="d-flex align-items-center">
                            {t("Document Preview")}
                            {previewConfig.images.length > 1 && (
                                <span className="badge badge-info ml-3">
                                    {previewConfig.currentIndex + 1} / {previewConfig.images.length}
                                </span>
                            )}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div
                            className="position-relative"
                            style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}
                        >
                            {previewConfig.images.length > 1 && (
                                <button
                                    className="btn btn-dark position-absolute"
                                    style={{ left: "10px", zIndex: 10, borderRadius: "50%", opacity: previewConfig.currentIndex === 0 ? 0.3 : 0.8 }}
                                    onClick={handlePrevImage}
                                    disabled={previewConfig.currentIndex === 0}
                                >
                                    <i className="fa fa-chevron-left"></i>
                                </button>
                            )}

                            <div className="w-100 text-center">
                                {previewConfig.loading ? (
                                    <i className="fa fa-spinner fa-spin fa-3x"></i>
                                ) : currentDoc?.imgUrl ? (
                                    isPdf(currentDoc.awsKey || currentDoc.fileKey) ? (
                                        <iframe
                                            src={`${currentDoc.imgUrl}#toolbar=0`}
                                            width="100%"
                                            height="500px"
                                            style={{ border: "none" }}
                                            title="Viewer"
                                        />
                                    ) : (
                                        <img
                                            src={currentDoc.imgUrl}
                                            alt="Document"
                                            style={{ maxWidth: "100%", maxHeight: "70vh", objectFit: "contain" }}
                                        />
                                    )
                                ) : (
                                    <div className="text-center mt-5">{t("No Document Found")}</div>
                                )}
                            </div>

                            {previewConfig.images.length > 1 && (
                                <button
                                    className="btn btn-dark position-absolute"
                                    style={{ right: "10px", zIndex: 10, borderRadius: "50%", opacity: previewConfig.currentIndex === previewConfig.images.length - 1 ? 0.3 : 0.8 }}
                                    onClick={handleNextImage}
                                    disabled={previewConfig.currentIndex === previewConfig.images.length - 1}
                                >
                                    <i className="fa fa-chevron-right"></i>
                                </button>
                            )}
                        </div>
                    </Modal.Body>
                </Modal>
            )}
            <SearchAppointmentTestNameModal
                visible={editTestRowId !== null}
                editTestRow={editTestRow}
                editTestSearch={editTestSearch}
                oldEditTests={oldEditTests}
                selectedEditTests={selectedEditTests}
                testSuggestion={testSuggestion}
                indexMatch={indexMatch}
                onClose={handleEditTestClose}
                onChange={handleEditTestChange}
                onKeyDown={handleEditTestIndex}
                onSuggestionBlur={() => setTestSuggestion([])}
                onSelectTest={handleSelectEditTest}
                onRemoveTest={handleRemoveEditTest}
                onCancelOldTest={handleCancelOldTest}
                onSave={handleEditTestSave}
            />

            <div>
                <div className="card">
                    <Heading name={"Search Appointment Booking"} isBreadcrumb={true} />
                    <div className="row px-2 py-2">
                        <div className="col-xl-2 col-sm-4 col-md-6 co-12">
                            <ReactSelect
                                name="DateOption"
                                id="DateOption"
                                removeIsClearable={true}
                                placeholderName="Date Option"
                                value={payload?.DateOption}
                                dynamicOptions={dropDownApis.DateOption}
                                onChange={handleSelectChange}
                            />
                        </div>
                        <DatePicker
                            name="FromDate"
                            id="FromDate"
                            value={payload?.FromDate}
                            onChange={dateSelect}
                            //maxDate={new Date()}
                            placeholder=""
                            lable={t("From Date")}
                            className="custom-calendar"
                            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
                        />
                        <DatePicker
                            name="ToDate"
                            id="ToDate"
                            value={payload?.ToDate}
                            onChange={dateSelect}
                            //maxDate={new Date()}
                            placeholder=""
                            lable={t("TO Date")}
                            className="custom-calendar"
                            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
                        />

                        <div className="col-xl-2 col-sm-4 col-md-6 co-12">
                            <ReactSelect
                                name="PhleboName"
                                id="PhleboName"
                                removeIsClearable={true}
                                placeholderName="Phlebo Name"
                                value={payload?.PhleboName}
                                dynamicOptions={dropDownApis.PhleboName?.map((item) => ({
                                    label: item?.NAME,
                                    value: item?.PhlebotomistID,
                                }))}
                                onChange={handleSelectChange}
                            />
                        </div>

                        <div className="col-sm-2 d-flex align-items-end pb-2">
                            <CustomButton
                                text="Search"
                                icon="search"
                                className="btn btn-sm btn-success"
                                onClick={() => handleSearch()}
                            />
                            <CustomButton
                                text="Excel Report"
                                icon="excel"
                                className="btn btn-sm btn-success ml-2"
                                onClick={() => handleExcel()}
                            />
                        </div>
                        <div></div>
                    </div>
                </div>

                <div>
                    <div className="row pt-1 pl-3 pr-2">
                        {statusList.map((ele, i) => {
                            return (

                                <div
                                    className="d-flex mr-2 mb-2 pt-1 shadow-sm rounded border hover-shadow"
                                    style={{
                                        cursor: "pointer",
                                        transition: "all 0.2s ease-in-out",
                                        backgroundColor:
                                            payload.RowColor === ele.labelKey ? "#e9e2e1" : "#fff"
                                    }}
                                    // onClick={() => {
                                    //     setPayload((prev) => ({
                                    //         ...prev,
                                    //         RowColor: null,
                                    //     }));
                                    // }}

                                    onClick={() => {
                                        setPayload((prev) => ({
                                            ...prev,
                                            RowColor: ele.labelKey,
                                        }));

                                        setTimeout(() => {
                                            setPayload((prev) => ({
                                                ...prev,
                                                RowColor: null,
                                            }));
                                        }, 200);
                                    }}
                                >
                                    <button
                                        className={`mb-3 mt-2 ml-2 p-2 border-0 SAStatus-${ele.value}`}
                                        key={ele.value}
                                    ></button>

                                    <label className="ml-2 pt-1 pr-2 d-flex">
                                        {ele.label}
                                    </label>
                                </div>
                            )

                        })}
                    </div>
                    <div className="mt-2">
                        <Accordion title={t("Patient Data")} defaultValue={true}>
                            <Heading title={t("Patient Data")} />
                            {activeData.length > 0 ? (
                                <div className="row px-1">
                                    <div className="col-12">
                                        <Tables style={{
                                            height: "300px",
                                            minHeight: "300px",
                                            overflowY: "scroll"
                                        }}>
                                            <thead className="cf">
                                                <tr>
                                                    <th>{t("S.No")}</th>
                                                    <th>{t("Name")}</th>
                                                    <th>{t("Mobile")}</th>
                                                    <th>{t("Gender")}</th>
                                                    <th>{t("Entry Date")}</th>
                                                    <th>{t("App Date")}</th>
                                                    <th>{t("Phelbo Name")}</th>
                                                    <th>{t("Test Name")}</th>
                                                    <th>{t("Prescription")}</th>
                                                    <th>{t("Edit test")}</th>
                                                    <th>{t("Select Phelbo")}</th>
                                                    <th>{t("Phelbo Assign Date")}</th>
                                                    <th>{t("ChangeStatus")}</th>
                                                    <th>{t("Rmks")}</th>
                                                    {/* <th>{t("Img")}</th> */}
                                                    {/* <th>{t("Edit")}</th> */}
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {activeData.map((data, index) => (
                                                    <tr key={index} style={{ backgroundColor: data.rowColor }}>
                                                        <td>
                                                            {index + 1}
                                                            <CustomButton
                                                                icon="eye"
                                                                className="btn btn-sm btn-success ml-2"
                                                                onClick={() => handleOpenModal(data.id)}
                                                            />
                                                        </td>
                                                        <td>{data?.NAME}</td>
                                                        <td>{data?.Mobile}</td>
                                                        <td>{data?.Gender}</td>
                                                        <td>{data?.CreatedDate}</td>
                                                        <td>{data?.AppDate}</td>
                                                        <td>{data?.proname}</td>
                                                        <td>
                                                            {data?.TestName?.split(/<br\s*\/?>/gi)
                                                                .map((item) => {
                                                                    const hashIndex = String(item).indexOf("#");
                                                                    return hashIndex > -1 ? String(item).slice(hashIndex + 1) : item;
                                                                })
                                                                .join(" - ")}
                                                        </td>
                                                        <td className="text-center">
                                                            {data?.DocumentGuid || data?.FileName || data?.awskey ? (
                                                                <i
                                                                    className="fa fa-paperclip text-primary cursor-pointer"
                                                                    style={{ fontSize: "14px" }}
                                                                    title={t("View Attachments")}
                                                                    onClick={() => handleOpenPreview(data)}
                                                                />
                                                            ) : (
                                                                ""
                                                            )}
                                                        </td>
                                                        <td>
                                                            <CustomButton
                                                                icon="Add"
                                                                text={""}
                                                                className="btn btn-sm btn-success"
                                                                disabled={isApprovalLocked(data)}
                                                                onClick={() => handleEditClick(data)}
                                                            />
                                                        </td>
                                                        <td>
                                                            <CustomButton
                                                                icon="Add"
                                                                text={""}
                                                                className="btn btn-sm btn-success ml-2"
                                                                onClick={() => handlePhlebo(data)}
                                                            />

                                                            {data?.proname}</td>
                                                        <td>{data?.AssignDate}</td>
                                                        <td style={{ width: "15%" }}>
                                                            {data?.STATUS !== 5 ? (
                                                                <SelectBox
                                                                    options={getStatus}
                                                                    id="STATUS"
                                                                    selectedValue={data?.STATUS ?? 0}
                                                                    name="STATUS"
                                                                    isDisabled={data?.STATUS === 4}
                                                                    onChange={(e) =>
                                                                        handleSelectChangeData(e, data?.id, data)
                                                                    }
                                                                />
                                                            ) : (
                                                                <span>{data?.CancelByName}</span>
                                                            )}
                                                        </td>
                                                        <td>{data?.Remarks}</td>
                                                        {/* <td>{data?.Img}</td> */}
                                                        {/* <td>{data?.Edit}</td> */}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Tables>
                                    </div>
                                </div>
                            ) : (
                                <NoRecordFound />
                            )}
                        </Accordion>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SearchAppointment;