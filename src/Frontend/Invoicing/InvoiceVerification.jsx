import React, { useEffect, useMemo, useState } from "react";
import DatePicker from "../../components/formComponent/DatePicker";
import { axiosInstance, axiosReport } from "../../utils/axiosInstance";
import Loading from "../../components/loader/Loading";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import moment from "moment";
import Accordion from "@app/components/UI/Accordion";
import Tables from "../../components/UI/customTable";
import Input from "../../components/formComponent/Input";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { apiUrls } from "../../utils/apiUrls";
import { SelectBox } from "../../components/formComponent/SelectBox";
import { notify } from "../../utils/utils";
import { ExportToExcel } from "../../utils/helpers";
import "./Invoice.css";
import MultiSelectComp from "../../components/formComponent/MultiSelectComp";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { CustomButton, SearchButton } from "../../components/UI/CustomButton";
import { getSearchController } from "../../utils/NetworkApi/commonApi";
import Pagination from "../../Pagination/Pagination";
import PageControlGear from "../../components/PageGearModel/PageControlGear";
import { Status } from "../../utils/Constants";
import axios from "axios";
import TableFilterDot from "../../components/TableFilter/TableFilterDot";
import { guidNumber } from "../../utils/generateGuid";
import UploadFile from "../utils/UploadFileModal/UploadFile";

const InvoiceVerification = () => {
    const { t } = useTranslation();
    const { HideInvoiceBillingCycle, HideInvoiceReprintExcel } = useLocalStorage(
        "userData",
        "get",
    );
    // console.log("HideInvoiceReprintExcel",HideInvoiceReprintExcel);
    const userData = useLocalStorage("userData", "get");
    // console.log("userData",userData);
    const [center, setCentre] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [load, setLoad] = useState(false);
    const [loads, setLoads] = useState({ name: "", loading: -1 });
    const [invoiceReprintData, setinvoiceReprintData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(50);
    const PAGE_ID = "1026";
    const [selectedRows, setSelectedRows] = useState([]);
    // console.log("documentID", documentID);

    // ── Dynamic Controller State 
    const [controllerDynamicList, setControllerDynamicList] = useState([]);
    const [FilterData, setFilterData] = useState([]);
    const [headWithApiFields, setHeadWithApiFields] = useState({
        "S.No": "srNo",
        "Business Unit": "BusinessUnit",
        "Invoice No": "InvoiceNo",
        "RateType Name": "RateType",
        "Invoice Date": "InvoiceDate",
        "Net Amount": "NetAmount",
        "Invoice Amount": "InvoiceAmount",
        "Created By": "InvoiceCreatedBy",
        "Created On": "InvoiceCreatedOn",
        "RateType Code": "RateTypeCode",
        "RateType ID": "RateTypeID",
        Status: "Status",
    });

    const data = useLocalStorage("accessRight", "get");
    const has35 = data?.includes(35);
    console.log(data, "AccessRight");


    const statusList = [
        { label: t("Verification Requested"), value: "0", status: true },
        { label: t("Verified"), value: "1", status: true },
        { label: t("For Re-Verified"), value: "5", status: true },
        { label: t("Review Requested"), value: "2", status: true },
        { label: t("Need To Dispatch"), value: "3", status: true },
        { label: t("Dispatched"), value: "4", status: true },
    ];

    const [dropDownList, setDropdownList] = useState({
        centreList: [],
        invoiceBillingCycleList: [],
    });
    const [Dispatchdocument, setDispatchdocument] = useState([])
    const [remarks, setRemarks] = useState("");
    const [payload, setPayload] = useState({
        InvoiceNo: "",
        invoiceBillingCycle: "",
        Status: "0",
        InvoiceFromDate: new Date(),
        InvoiceToDate: new Date(),
        businessUnitCode: "",
        rateType: [],
    });

    const [showFileModal, setShowFileModal] = useState({
        modal: false,
        data: "",
        index: -1,
        ledgerTransactionId: null,
    });
    console.log("showFileModal", showFileModal);
    const currentTableData = useMemo(() => {
        const firstPageIndex = (currentPage - 1) * pageSize;
        const lastPageIndex = firstPageIndex + pageSize;
        return filteredData.slice(firstPageIndex, lastPageIndex);
    }, [currentPage, pageSize, filteredData]);



    const controllerDynamic = async () => {
        try {
            const { controllersData, controllerTabbingOrder } =
                await getSearchController(PAGE_ID);
            setControllerDynamicList(controllersData);

            if (Array.isArray(controllersData)) {
                setFilterData(controllersData);
                const dynamicMappings = { ...headWithApiFields };
                controllersData.forEach((column) => {
                    if (!dynamicMappings[column.ControlDisplayID]) {
                        dynamicMappings[column.ControlDisplayID] =
                            column.ApiFieldName || column.ControlDisplayID;
                    }
                });
                setHeadWithApiFields(dynamicMappings);
            }
        } catch (error) {
            console.error("error in controllerDynamic:", error);
        }
    };

    const isHideController = (cntrId = "") => {
        if (!controllerDynamicList?.length) return true;
        const isPresent = controllerDynamicList?.find(
            (x) => x?.ControlDisplayID === cntrId,
        );
        if (isPresent?.ControlDisplayID) {
            return !!controllerDynamicList?.find(
                (x) => x?.ControlDisplayID === cntrId,
            )?.IsShow;
        }
        return true;
    };


    // const getAccessCentres = async (id) => {
    //     try {
    //         const res = await axiosInstance.post("Centre/GetRateType", {
    //             CentreId: [id || 0],
    //         });
    //         const list = res?.data?.message.map((item) => ({
    //             label: item?.RateTypeName,
    //             value: item?.RateTypeID,
    //         }));
    //         setCentre(list);
    //     } catch (err) {
    //         console.log(err);
    //     }
    // };

    const getAccessCentres = (value, invoiceCycle) => {
        axiosInstance
            .get(apiUrls?.getGlobalBusinessUnit, {
                params: {
                    Datatype: "rateType",
                    InvoiceBillingCycle: invoiceCycle || payload?.invoiceBillingCycle,
                    PaymentMode: "Credit",
                    IsActive: 1,
                },
                headers: { accept: "*/*" },
            })
            .then((res) => {
                const data = Array.isArray(res.data.message) ? res.data.message : [];
                setCentre(
                    data.map((ele) => ({
                        value: ele.CentreId,
                        label: ele.Centre,
                        rateType: ele.InvoiceRateType,
                    })),
                );
            })
            .catch((err) => {
                setCentreData([]);
                console.log(err);
            });
    };



    const getPatientType = () => {
        axiosInstance
            .get(apiUrls?.getGlobalBusinessUnit, {
                params: {
                    Datatype: "BusinessUnit",
                    InvoiceBillingCycle: "",
                    PaymentMode: "",
                    IsActive: 1,
                },
                headers: { accept: "*/*" },
            })
            .then((res) => {
                const centreList = res?.data?.message?.map((ele) => ({
                    value: String(ele?.CentreId),
                    label: ele?.Centre,
                }));
                setDropdownList((prev) => ({ ...prev, centreList }));
            })
            .catch(console.log);
    };

    const getInvoiceBillingCentre = () => {
        axiosInstance
            .post(apiUrls?.getGlobalData, { type: "InvoiceBillingCycle" })
            .then((res) => {
                let invoiceBillingCycleList = res?.data?.message?.map((ele) => ({
                    ...ele,
                    value: String(ele?.FieldDisplay),
                    label: ele?.FieldDisplay,
                }));
                setDropdownList((prev) => ({ ...prev, invoiceBillingCycleList }));
            })
            .catch(console.log);
    };

    // const getInvoiceReprintExcel = (invoiceId) => {
    //     axiosInstance
    //         .post("Accounts/InvoiceExcelData", {
    //             invoiceNo: invoiceId,
    //             documentType: 0,
    //         })
    //         .then((res) => ExportToExcel(res.data.message))
    //         .catch(console.log);
    // };

    const handleSearch = (flag) => {
        if (!payload?.businessUnitCode) { notify("Please select Business Unit", "error"); return; }
        if (!payload?.rateType) { notify("Please select Rate Type", "error"); return; }
        setLoad(true);
        const apiUrl =
            flag == 4
                ? "InvoiceVerifications/GetDispatchData"
                : "InvoiceVerifications/InvoiceDetailsPatientWise";
        axiosInstance
            .post(apiUrl, {
                centreID: Number(payload?.businessUnitCode),
                ClientID: (payload?.rateType),
                FromDate: moment(payload?.InvoiceFromDate).format("DD-MMM-YYYY"),
                ToDate: moment(payload?.InvoiceToDate).format("DD-MMM-YYYY"),
                InvoiceDate: "",
                PatientTypes: "",
                status: Number(flag) || 0,
            })
            .then((res) => {
                setLoad(false);
                if (!Array.isArray(res?.data?.message)) {
                    setinvoiceReprintData([]);
                    setFilteredData([]);
                    notify(res?.data?.message, "error");
                    return;
                }

                setinvoiceReprintData(res?.data?.message);
                setFilteredData(res?.data?.message);
                setRemarks("");
                setCurrentPage(1);
                setSearchText("");
                setSelectedRows([]);
                setShowFileModal({ modal: false, data: "", index: -1 });
            })
            .catch((err) => {
                setLoad(false);
                toast.error(err?.data?.message || "Something Went Wrong");
            });
    };
    const handleSelectAll = (checked) => {
        const pageIndexes = currentTableData.map(
            (_, index) => (currentPage - 1) * pageSize + index,
        );

        if (checked) {
            setSelectedRows((prev) => [...new Set([...prev, ...pageIndexes])]);
        } else {
            setSelectedRows((prev) => prev.filter((i) => !pageIndexes.includes(i)));
        }
    };
    const handleCheckboxChange = (index) => {
        setSelectedRows((prev) => {
            if (prev.includes(index)) {
                return prev.filter((i) => i !== index);
            } else {
                return [...prev, index];
            }
        });
    };

    const handleApprove = (flag) => {
        const approvalValue = flag;
        const approvedData = selectedRows.map((index) => ({
            ledgerTransactionID: Number(filteredData[index]?.LedgerTransactionID),
            status: Number(approvalValue),
            InvoiceNo: String(filteredData[index]?.invoiceno),
        }));

        if (!approvedData.length) {
            toast.warning("Please select at least one record");
            return;
        }

        // if (flag == 4) {
        //     const missingDocument = selectedRows.some((index) => {
        //         const row = filteredData[index];
        //         return !row?.IsDocumentUploaded && (!row?.DocumentGuid || row?.IsNewDocumentGuid);
        //     });

        //     // if (missingDocument) {
        //     //     toast.warning("Please upload document before dispatch");
        //     //     return;
        //     // }
        // }

        if (!remarks.trim()) { toast.error("Please Enter remarks"); return; }

        const updatepayload = {
            requests: approvedData,
            clientID: (payload?.rateType),
            centreID: Number(payload?.businessUnitCode),
            Remark: remarks,
            FileName: showFileModal?.data || ""
        };
        const apiUrl =
            flag == 4
                ? "InvoiceVerifications/DispatchInvoice"
                : "InvoiceVerifications/UpdateInvoiceStatus";
        axiosInstance
            .post(apiUrl, updatepayload)
            .then((res) => {
                if (res?.data?.success == false) {
                    toast.error(res?.data?.message);
                    return;
                } else {
                    toast.success(res?.data?.message);
                    handleSearch(payload?.Status);
                    setRemarks("");
                    setShowFileModal({ modal: false, data: "", index: -1 });
                }

            })

            .catch((err) => {
                console.error(err);
                toast.error("Something went wrong");
            });
    };

    const handleGetReport = (id, index) => {
        setLoads({ loading: index });
        axios
            .post(
                "/reports/v1/getReceipt",
                { LedgerTransactionIDHash: String(id), PHead: 1 },
                { responseType: "blob" },
            )
            .then((res) => {
                const blob = new Blob([res.data], { type: "application/pdf" });
                const url = window.URL.createObjectURL(blob);
                window.open(url, "_blank");
            })
            .catch((err) => {
                console.log(err);
            });
    };
    const handleGetReportForDisptach = (id, index) => {
        setLoads({ name: "print", loading: index });
        axiosReport
            .post(`commonReports/DispatchReport?DispatchNo=${id}`,
                {},
                { responseType: "blob" },)
            .then((res) => {
                const blob = new Blob([res.data], { type: "application/pdf" });
                const url = window.URL.createObjectURL(blob);
                window.open(url, "_blank");
            })
            .catch((err) => {
                console.log(err);
            })
            .finally(() => {
                setLoads({ name: "", loading: null });
            });
    };

    const handleReactSelectChange = (name, e) => {
        setPayload((prev) => ({ ...prev, [name]: e?.value }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPayload({ ...payload, [name]: value });
    };

    const dateSelect = (value, name) => {
        setPayload({ ...payload, [name]: value });
    };



    const handleSelectchangeCheck = (name, value) => {
        setPayload((prev) => {
            let updated = { ...prev, [name]: value };

            if (name === "businessUnitCode") {
                updated.rateType = [];
            }
            return updated;
        });

        if (name === "businessUnitCode") {
            getAccessCentres(value);
        }
    };

    const handleSearchSelectChange = (label, value) => {
        setPayload((prev) => {
            let updated = { ...prev, [label]: String(value?.value) };
            if (label === "businessUnitCode") {
                updated.rateType = "";
            }
            return updated;
        });

        if (label === "businessUnitCode") {
            getAccessCentres(value?.value);
        }
    };

    const GetGlobalData = (state,) => {
        axiosInstance
            .post("Global/getGlobaldata", {
                Type: "identity",
            })
            .then((res) => {
                const data = res.data?.message;
                console.log("Global Data for", data);
                const val = data.map((ele) => {
                    return {
                        label: ele?.FieldDisplay,
                        value: ele?.FieldDisplay,
                    };
                });
                return setDispatchdocument(val);
            })
            .catch((err) => {
                console.log(err);
            });
    };

    useEffect(() => {
        getPatientType();
        getAccessCentres();
        getInvoiceBillingCentre();
        controllerDynamic();
        GetGlobalData()
    }, []);

    const getStatusColor = (val) => {
        switch (String(val)) {
            case "0":
                return "#F3D70D";
            case "1":
                return "#FFE2B6";
            case "2":
                return "#F4BEA4";
            case "3":
                return "#B7DBBA";
            case "4":
                return "#7BD4E8";
            case "5":
                return "#F7ACF5";
            default:
                return "#7CD5E9";
        }
    };

    const handleOpenUploadModal = (item, index) => {
        let currentGuid = item?.DocumentGuid;
        if (!currentGuid) {
            currentGuid = guidNumber();
            setFilteredData((prev) =>
                prev.map((row, i) =>
                    i === index
                        ? { ...row, DocumentGuid: currentGuid, IsDocumentUploaded: false, IsNewDocumentGuid: true }
                        : row
                )
            );
        }
        setShowFileModal({ modal: true, data: currentGuid, index, ledgerTransactionId: item?.LedgerTransactionID, dispatchNo: item?.DispatchNo });
    };

    const handleUploadCount = (_countKey, count) => {
        const isUploaded = Number(count) > 0;

        setFilteredData((prev) =>
            prev.map((row, i) =>
                i === showFileModal?.index
                    ? { ...row, IsDocumentUploaded: isUploaded, IsNewDocumentGuid: isUploaded ? false : row?.IsNewDocumentGuid }
                    : row
            )
        );
    };

    const handleUploadDispatchDocument = async () => {
        const dispatchPayload = {
            fileName: showFileModal?.data,
            dispatchNo: String(showFileModal?.dispatchNo || ""),
        };
        try {
            const res = await axiosInstance.post(
                "InvoiceVerifications/UploadDispatchDocument",
                dispatchPayload
            );
            if (res?.data?.success) {
                toast.success("Document Saved Successfully");
            }
        } catch (error) {
            toast.error("Error saving document");
        }
    };

    const handleCaptureUploadedFile = async () => {
        const payloads = {
            LedgerTransactionId: String(showFileModal?.ledgerTransactionId),
            FileName: showFileModal?.data,
            status: Number(payload?.Status),
            CentreID: Number(payload?.businessUnitCode),
            DocumentID: 0,

        };
        try {
            const res = await axiosInstance.post(
                "InvoiceVerifications/saveDispatchdocument",
                payloads
            );

            if (res?.data?.success) {
                toast.success("Document Saved Successfully");

            }
        } catch (error) {
            toast.error("Error saving document");
        }
    };

    useEffect(() => { handleSearch(payload?.Status) }, [payload?.Status])

    return (
        <>
            {showFileModal?.modal && (
                <UploadFile
                    options={payload?.Status == 3 ? Dispatchdocument : []}
                    show={showFileModal?.modal}
                    handleClose={() => {
                        if (Number(payload?.Status) === 4) {
                            handleUploadDispatchDocument();
                        } else {
                            handleCaptureUploadedFile();
                        }
                        setShowFileModal(prev => ({ ...prev, modal: false }));
                    }}
                    documentId={showFileModal?.data}
                    pageName="InvoiceVerification"
                    handleUploadCount={handleUploadCount}

                />
            )}
            <Accordion
                name={t("Invoice Reprint")}
                isBreadcrumb={true}
                defaultValue={true}
                seconTitle={
                    <div style={{ marginLeft: "auto" }}>
                        <PageControlGear pageId={PAGE_ID} />
                    </div>
                }
            >
                <div className="row px-2 mt-2 mb-1">
                    {controllerDynamicList
                        ?.filter((item) => item?.TypeId === 1 && item?.IsShow === 1)
                        ?.map((item, index) => {
                            if (
                                item?.ControlDisplayID === "businessUnitCode" &&
                                isHideController("businessUnitCode")
                            ) {
                                return (
                                    <div className="col-sm-2" key={index}>
                                        <ReactSelect
                                            dynamicOptions={[
                                                { label: "Select", value: "" },
                                                ...dropDownList?.centreList,
                                            ]}
                                            name="businessUnitCode"
                                            lable={t("Business Unit")}
                                            id="businessUnitCode"
                                            removeIsClearable={true}
                                            placeholderName={t("Business Unit")}
                                            value={payload?.businessUnitCode}
                                            onChange={handleSearchSelectChange}
                                            className="required-fields"
                                        />

                                    </div>
                                );
                            }


                            if (
                                item?.ControlDisplayID === "rateType" &&
                                isHideController("rateType")
                            ) {
                                return (
                                    <div className="col-sm-2" key={index}>
                                        <MultiSelectComp
                                            options={center}
                                            name="rateType"
                                            label={t("Rate Type")}
                                            id="rateType"
                                            value={payload?.rateType}
                                            onChange={handleSelectchangeCheck}
                                        />
                                    </div>
                                );
                            }



                            if (
                                item?.ControlDisplayID === "InvoiceFromDate" &&
                                isHideController("InvoiceFromDate")
                            ) {
                                return (
                                    <div className="col-sm-2" key={index}>
                                        <DatePicker
                                            name="InvoiceFromDate"
                                            value={payload?.InvoiceFromDate}
                                            className="custom-calendar"
                                            placeholder=" "
                                            id="From Date"
                                            lable="From Date"
                                            onChange={dateSelect}
                                            maxDate={new Date()}
                                        />
                                    </div>
                                );
                            }

                            if (
                                item?.ControlDisplayID === "InvoiceToDate" &&
                                isHideController("InvoiceToDate")
                            ) {
                                return (
                                    <div className="col-sm-2" key={index}>
                                        <DatePicker
                                            name="InvoiceToDate"
                                            value={payload?.InvoiceToDate}
                                            className="custom-calendar"
                                            placeholder=" "
                                            id="To Date"
                                            lable="To Date"
                                            onChange={dateSelect}
                                            maxDate={new Date()}
                                            minDate={new Date(payload?.InvoiceFromDate)}
                                        />
                                    </div>
                                );
                            }

                            if (
                                item?.ControlDisplayID === "InvoiceNo" &&
                                isHideController("InvoiceNo")
                            ) {
                                return (
                                    <div className="col-sm-2" key={index}>
                                        <Input
                                            value={payload?.InvoiceNo}
                                            onChange={handleChange}
                                            id="InvoiceNo"
                                            name="InvoiceNo"
                                            lable="Invoice Number"
                                            placeholder=" "
                                        />
                                    </div>
                                );
                            }

                            if (
                                item?.ControlDisplayID === "Status" &&
                                isHideController("Status")
                            ) {
                                return (
                                    <div className="col-sm-2" key={index}>
                                        <ReactSelect
                                            dynamicOptions={statusList}
                                            name="Status"
                                            lable={t("Status")}
                                            id="Status"
                                            isShowBorder={true}
                                            removeIsClearable={true}
                                            placeholderName={t("Status")}
                                            value={payload?.Status}
                                            onChange={handleReactSelectChange}
                                            className="required-fields"
                                        />
                                    </div>
                                );
                            }

                            return null;
                        })}

                    {load ? (
                        <Loading />
                    ) : (
                        <SearchButton
                            text={"Search"}
                            onClick={() => handleSearch(payload?.Status)}
                            className="mx-2"
                        />
                    )}

                </div>
            </Accordion>
            <div className="mt-2 mb-3 px-2 py-1 bg-white d-flex sampleStatusClass" style={{ gap: "10px" }}>
                <strong style={{ minWidth: "100px" }}>Status : </strong>
                {statusList?.map((sItem, idx) => (
                    <TableFilterDot
                        color={`${getStatusColor(sItem?.value)}`}
                        title={`${sItem?.label}`}
                        // onClick={() => handleSearch(sItem?.value)}
                        onClick={() => {
                            setPayload((prev) => ({ ...prev, Status: sItem?.value }));
                        }}
                        bgColor={`#e9e2e1`}
                    />
                ))}
            </div>

            <Accordion
                title={t("Search Detail")}
                defaultValue={true}
                notOpen={true}
                linkTo="#"

            >
                {load ? (
                    <Loading />
                ) : filteredData?.length > 0 ? (
                    <>
                        <div className="col-12">
                            <Tables style={{
                                maxHeight: "400px",
                                overflowY: "auto",
                            }}>
                                <thead className="text-center" style={{ position: "sticky", top: 0, zIndex: 99 }}>
                                    {payload?.Status != 4 ? <tr>
                                        <th >{t("S.No")}</th>
                                        <th >{t("Panel Invoice")}</th>
                                        <th >{t("Invoice Date")}</th>
                                        <th >{t("Verification Request Date")}</th>
                                        <th >{t("Re-Verification Request Date")}</th>
                                        <th >{t("Verified Date")}</th>
                                        <th >{t("UHID.")}</th>
                                        <th >{t("Patient Name.")}</th>
                                        <th >{t("Panel Group")}</th>
                                        <th >{t("Panel")}</th>
                                        <th >{t("Panel Amount")}</th>
                                        <th >{t("Panel Paid Amt.")}</th>
                                        {/* {payload?.Status != 3 && <th>{t("Documents")}</th>} */}
                                        <th>{t("Documents")}</th>
                                        <th >{t("Print")}</th>
                                        <th >
                                            <input
                                                type="checkbox"
                                                checked={
                                                    currentTableData.length > 0 &&
                                                    currentTableData.every((_, index) => {
                                                        const actualIndex =
                                                            (currentPage - 1) * pageSize + index;
                                                        return selectedRows.includes(actualIndex);
                                                    })
                                                }
                                                onChange={(e) => handleSelectAll(e.target.checked)}
                                            />
                                        </th>
                                        {/* })} */}
                                    </tr> : <tr>
                                        <th >{t("S.No")}</th>
                                        <th >{t("Rate Type")}</th>
                                        <th >{t("Dispatched Date")}</th>
                                        <th >{t("Panel Group")}</th>
                                        <th >{t("Dispatch No.")}</th>
                                        <th >{t("Documents")}</th>
                                        <th >{t("Print")}</th>
                                        {/* <th >
                                            <input
                                                type="checkbox"
                                                checked={
                                                    currentTableData.length > 0 &&
                                                    currentTableData.every((_, index) => {
                                                        const actualIndex =
                                                            (currentPage - 1) * pageSize + index;
                                                        return selectedRows.includes(actualIndex);
                                                    })
                                                }
                                                onChange={(e) => handleSelectAll(e.target.checked)}
                                            />
                                        </th> */}
                                        {/* })} */}
                                    </tr>}
                                </thead>

                                <tbody>
                                    {currentTableData?.map((ele, index) => {
                                        const actualIndex = (currentPage - 1) * pageSize + index;
                                        return (
                                            <tr
                                                key={actualIndex}
                                                style={{ backgroundColor: ele?.StatusColor || "#fff" }}
                                            >
                                                <td key={index}>{actualIndex + 1}</td>
                                                {payload?.Status != 4 ?
                                                    <>
                                                        <td >{ele?.invoiceno}&nbsp;</td>
                                                        <td >{ele?.invoicedate}&nbsp;</td>
                                                        <td >{ele?.invoicedate}&nbsp;</td>
                                                        <td >{ele?.ReVerifiedDate}&nbsp;</td>
                                                        <td >{ele?.VerifiedDate}&nbsp;</td>
                                                        <td >{ele?.LedgerTransactionNo}&nbsp;</td>
                                                        <td >{ele?.PName}&nbsp;</td>
                                                        <td >{ele?.InvoiceAmount}&nbsp;</td>
                                                        <td >{ele?.ClientName}&nbsp;</td>
                                                        <td >{ele?.PCCInvoiceAmt}&nbsp;</td>
                                                        <td >{ele?.InvoiceAmount}&nbsp;</td>
                                                        {/* {payload?.Status != 3 &&
                                                            <td className="text-center">
                                                                <i
                                                                    className="fa fa-file-pdf ShowGRNStatusPost-big-icon-print"
                                                                    style={{ cursor: "pointer" }}
                                                                    onClick={() => handleOpenUploadModal(ele, actualIndex)}
                                                                />
                                                            </td>
                                                        } */}
                                                        <td className="text-center">
                                                            <i
                                                                className="fa fa-file-pdf ShowGRNStatusPost-big-icon-print"
                                                                style={{ cursor: "pointer" }}
                                                                onClick={() => handleOpenUploadModal(ele, actualIndex)}
                                                            />
                                                        </td>
                                                        <td

                                                            className=""
                                                            style={{ gap: "5px" }}
                                                        >
                                                            {loads?.name === "print" &&
                                                                loads?.loading === actualIndex ? (
                                                                <Loading />
                                                            ) : (
                                                                <i>
                                                                    <span
                                                                        className="pi pi-file-pdf"
                                                                        style={{
                                                                            width: "15px",
                                                                            height: "15px",
                                                                            color: "red",
                                                                            cursor: "pointer",
                                                                        }}
                                                                        title={t("Print PDF")}
                                                                        onClick={() =>
                                                                            handleGetReport(
                                                                                ele?.LedgertransactionIDHash,
                                                                                actualIndex,
                                                                            )
                                                                        }
                                                                    />
                                                                </i>
                                                            )}
                                                        </td>
                                                        <td >
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedRows.includes(actualIndex)}
                                                                onChange={() =>
                                                                    handleCheckboxChange(actualIndex)
                                                                }
                                                            />
                                                        </td>
                                                    </>
                                                    :
                                                    <>
                                                        <td >{ele?.ClientName}&nbsp;</td>
                                                        <td >{ele?.DispatchDate}&nbsp;</td>
                                                        <td >{ele?.panelgroup}&nbsp;</td>
                                                        <td >{ele?.DispatchNo}&nbsp;</td>

                                                        <td className="text-center">
                                                            <i
                                                                className="fa fa-upload"
                                                                style={{ cursor: "pointer" }}
                                                                onClick={() => handleOpenUploadModal(ele, actualIndex)}
                                                            />
                                                        </td>
                                                        <td

                                                            className=""
                                                            style={{ gap: "5px" }}
                                                        >
                                                            {loads?.name === "print" &&
                                                                loads?.loading === actualIndex ? (
                                                                <Loading />
                                                            ) : (
                                                                <i>
                                                                    <span
                                                                        className="pi pi-file-pdf"
                                                                        style={{
                                                                            width: "15px",
                                                                            height: "15px",
                                                                            color: "red",
                                                                            cursor: "pointer",
                                                                        }}
                                                                        title={t("Print PDF")}
                                                                        onClick={() =>
                                                                            handleGetReportForDisptach(
                                                                                ele?.DispatchNo,
                                                                                actualIndex,
                                                                            )
                                                                        }
                                                                    />
                                                                </i>
                                                            )}
                                                        </td>
                                                        {/* <td >
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedRows.includes(actualIndex)}
                                                                onChange={() =>
                                                                    handleCheckboxChange(actualIndex)
                                                                }
                                                            />
                                                        </td> */}
                                                    </>}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </Tables>
                        </div>
                        {payload?.Status != 4 && (
                            <div className="col-sm-3 mt-3" >
                                <Input
                                    value={remarks}
                                    onChange={(e) => {
                                        setRemarks(e.target.value.slice(0, 200));
                                    }}
                                    id="remarks"
                                    name="remarks"
                                    lable="Enter Remarks"
                                    placeholder=" "
                                />
                            </div>
                        )}
                        {has35 && currentTableData?.length > 0 && (
                            <div className="pl-2 mt-2">
                                {payload?.Status == 0 && (
                                    <button
                                        className="btn btn-primary mt-3 mr-2"
                                        onClick={() => handleApprove("1")}
                                    >
                                        {t("Verify")}
                                    </button>
                                )}

                                {(payload?.Status == 1 || payload?.Status == 5) && (
                                    <>
                                        <button
                                            className="btn btn-primary mt-3"
                                            onClick={() => handleApprove("2")}
                                        >
                                            {t("Send For Review")}
                                        </button>
                                        <button
                                            className="btn btn-primary mt-3 ml-2"
                                            onClick={() => handleApprove("3")}
                                        >
                                            {t("Send For Dispatch")}
                                        </button>
                                    </>
                                )}

                                {payload?.Status == 2 && (
                                    <>
                                        <button
                                            className="btn btn-primary mt-3"
                                            onClick={() => handleApprove("5")}
                                        >
                                            {t("Re-Verify")}
                                        </button>
                                        <button
                                            className="btn btn-primary mt-3 ml-2"
                                            onClick={() => handleApprove("3")}
                                        >
                                            {t("Send For Dispatch")}
                                        </button>
                                    </>
                                )}
                                {payload?.Status == 3 && (
                                    <>
                                        <CustomButton text={t("Dispatched")}
                                            className="btn btn-primary mt-3"
                                            onClick={() => handleApprove("4")}
                                        />

                                        {/* <CustomButton text={t("Upload Document")} icon={"upload"}
                                            className="mt-3 ml-3"
                                            onClick={() => {
                                                if (!selectedRows.length) {
                                                    toast.warning("Please select at least one record");
                                                    return;
                                                }
                                                // use first selected row's data to open modal, guid will be shared
                                                const firstSelected = filteredData[selectedRows[0]];
                                                handleOpenUploadModal(firstSelected, selectedRows[0]);
                                            }}
                                        /> */}


                                    </>)}
                            </div>
                        )}


                        {filteredData.length > 0 && (
                            <div className="d-flex flex-wrap justify-content-end align-items-end gap-2 mt-3">
                                <div style={{ minWidth: "150px" }}>
                                    <ReactSelect
                                        value={pageSize}
                                        dynamicOptions={[
                                            { label: "25", value: 25 },
                                            { label: "50", value: 50 },
                                            { label: "75", value: 75 },
                                            { label: "100", value: 100 },
                                        ]}
                                        name={"pageSize"}
                                        removeIsClearable={true}
                                        onChange={(name, value) => {
                                            setPageSize(value?.value);
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
                    <NoRecordFound />
                )}
            </Accordion>
        </>
    );
};

export default InvoiceVerification;
