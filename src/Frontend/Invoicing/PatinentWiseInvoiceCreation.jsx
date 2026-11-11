import React, { useEffect, useState, useMemo } from "react";
import { toast } from "react-toastify";
import moment from "moment";
import DatePicker from "../../components/formComponent/DatePicker";
import { SelectBox } from "../../components/formComponent/SelectBox";
import { ExportToExcel } from "../../utils/helpers";
import Tables from "../../components/UI/customTable";
import Accordion from "@app/components/UI/Accordion";
import Loading from "../../components/loader/Loading";
import { axiosInstance, axiosReport } from "../../utils/axiosInstance";
import { isChecked } from "../util/Commonservices";
import InvoiceCreationModal from "./InvoiceCreationModal";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import { useTranslation } from "react-i18next";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { apiUrls } from "../../utils/apiUrls";
import "./Invoice.css";
import { formatIndianNumber } from "../../utils/utils";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { SaveButton, SearchButton } from "../../components/UI/CustomButton";
import Input from "../../components/formComponent/Input";
import { getSearchController } from "../../utils/NetworkApi/commonApi";
import Pagination from "../../Pagination/Pagination";
import UploadFile from "../utils/UploadFileModal/UploadFile";

const PatinentWiseInvoiceCreation = () => {
    const [tableData, setTableData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const { HideInvoiceBillingCycle } = useLocalStorage("userData", "get");
    const { t } = useTranslation();
    const [show, setShow] = useState({ modal: false, id: "" });
    const [uploadModal, setUploadModal] = useState({
        show: false, documentId: "", rowData: null, currentLedgerID: null, requiredDocName: "",
    });
    console.log("uploadModal", uploadModal)
    const [load, setLoad] = useState({ name: "", loading: false });
    const [CentreData, setCentreData] = useState([]);
    const [dropDownList, setDropdownList] = useState({
        centreList: [],
        invoiceBillingCycleList: [],
    });
    const [controllerDynamicList, setControllerDynamicList] = useState([]);
    const [tabbingOrder, setTabbingOrder] = useState([]);
    const [FilterData, setFilterData] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(500);
    const [excelLoad, setExcelLoad] = useState({ index: -1, load: false });
    const [requiredAttachment, setRequiredAttachment] = useState([]);
    const [uploadedDocs, setUploadedDocs] = useState({});
    // key: LedgerTransactionID, value: true
    const [payload, setPayload] = useState({
        FromDate: new Date(),
        ToDate: new Date(),
        invoiceBillingCycle: "",
        BusinessUnitID: "",
        InvoiceDate: new Date(),
        UHID: "",
    });

    const [headWithApiFields, setHeadWithApiFields] = useState({
        "Sr.No.": "srNo",
        "Reg Date": "RegDate",
        "LAb No": "LedgerTransactionNo",
        "Test Description": "ItemName",
        "Patient Name": "PName",
        "Age/Gender": "Age",
        "Mrp": "Amount",
        "Gross Amount": "GrossAmount",
        "Net Amount": "NetAmount",
        "PCC InvoiceAmt": "PCCInvoiceAmt",
        "UHID": "UHID",
        "BillNo": "BillNo",
    });

    const currentTableData = useMemo(() => {
        const firstPageIndex = (currentPage - 1) * pageSize;
        const lastPageIndex = firstPageIndex + pageSize;
        return filteredData.slice(firstPageIndex, lastPageIndex);
    }, [currentPage, pageSize, filteredData]);

    const handleChangeSearch = (e) => {
        const value = e.target.value.toLowerCase();
        setSearchText(e.target.value);

        if (!value.trim()) {
            setFilteredData(tableData);
            setCurrentPage(1);
            return;
        }

        const filtered = tableData.filter((row) =>
            [
                "Centre",
                "ClientCode",
                "ClientName",
                "Amount",
                "ShareAmt",
                "InvoiceDate",
                "BusinessUnitID",
                "ClientID",
            ].some((key) =>
                String(row[key] || "")
                    .toLowerCase()
                    .includes(value),
            ),
        );

        setFilteredData(filtered);
        setCurrentPage(1);
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
                    rateType: ele?.InvoiceRateType,
                }));
                setDropdownList((prev) => ({ ...prev, centreList }));
            })
            .catch(console.log);
    };

    const getUploadFileIdentity = () => {
        axiosInstance
            .post("Global/GetGlobalData", {
                Type: "RequiredAttachment",
            })
            .then((res) => {
                let data = res.data.message;
                let UploadFileIdentity = data.map((ele) => {
                    return {
                        value: ele.FieldDisplay,
                        label: ele.FieldDisplay,
                    };
                });
                return setRequiredAttachment(UploadFileIdentity);
            })
            .catch((err) => console.log(err));
    };

    const getInvoiceBillingCentre = () => {
        axiosInstance
            .post(apiUrls?.getGlobalData, { type: "InvoiceBillingCycle" })
            .then((res) => {
                const invoiceBillingCycleList = res?.data?.message?.map((ele) => ({
                    ...ele,
                    value: String(ele?.FieldDisplay),
                    label: ele?.FieldDisplay,
                }));
                setDropdownList((prev) => ({ ...prev, invoiceBillingCycleList }));
            })
            .catch(console.log);
    };

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
                setCentreData(
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

    const controllerDynamic = async () => {
        try {
            const pageID = 1022;
            const { controllersData, controllerTabbingOrder } =
                await getSearchController(pageID);
            setTabbingOrder(controllerTabbingOrder);
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

    // const handleCheck = (e, index) => {
    //     const { checked, name } = e.target;

    //     if (index >= 0) {
    //         const data = [...tableData];
    //         data[index][name] = checked;
    //         setTableData(data);

    //         const fData = filteredData.map((r) =>
    //             r.LedgerTransactionID === data[index].LedgerTransactionID
    //                 ? { ...r, [name]: checked }
    //                 : r
    //         );
    //         setFilteredData(fData);
    //     } else {

    //         const updatedData = tableData.map((ele) => ({ ...ele, [name]: checked }));
    //         setTableData(updatedData);
    //         setFilteredData(updatedData);
    //     }
    // };

    // const saveInvoice = () => {
    //     const selectedRows = tableData.filter((ele) => ele.IsChecked);

    //     if (selectedRows.length === 0) {
    //         toast.error("Please select atleast one.");
    //         return;
    //     }

    //     setLoad({ name: "SaveLoading", loading: true });

    //     const LedgerTransactionID = selectedRows.map(
    //         (ele) => ele.LedgerTransactionID
    //     );
    //     const clientArray = selectedRows.map(
    //         (ele) =>
    //             `${payload?.ClientID}#${ele.BusinessUnitID}#${ele.ClientName}`
    //     );

    //     axiosInstance
    //         .post("Accounts/InvoiceCreation", {
    //             fromDate: moment(payload?.FromDate).format("YYYY-MM-DD"),
    //             toDate: moment(payload?.ToDate).format("YYYY-MM-DD"),
    //             invoiceDate: moment(payload?.InvoiceDate).format("YYYY-MM-DD"),
    //             clientID: selectedRows[0]?.RateTypeID || 0,
    //             patientTypes: "",
    //             LedgerTransactionID,
    //             InvoiceTo: clientArray,
    //         })
    //         .then((res) => {
    //             setLoad({ name: "", loading: false });
    //             InvoiceCreationSearch();
    //             toast.success(res?.data?.message);
    //         })
    //         .catch(() => {
    //             setLoad({ name: "", loading: false });
    //         });
    // };

    const isInsurance = useMemo(() => {
        const selected = dropDownList?.centreList?.find(
            (c) => String(c.value) === String(payload?.BusinessUnitID)
        );

        return selected?.rateType?.toUpperCase() === "INSURANCE";
    }, [dropDownList?.centreList, payload?.BusinessUnitID]);

    const selectedBusinessType = useMemo(() => {
        const selected = dropDownList?.centreList?.find(
            (c) => String(c.value) === String(payload?.BusinessUnitID)
        );

        return selected?.rateType || "";
    }, [dropDownList?.centreList, payload?.BusinessUnitID]);

    const isRateTypeSelected = useMemo(() => {
        const clientID = String(payload?.ClientID ?? "").trim().toLowerCase();
        return !!clientID && clientID !== "0" && clientID !== "undefined" && clientID !== "null";
    }, [payload?.ClientID]);

    const handleCheck = (e, index) => {
        const { checked, name } = e.target;

        if (index >= 0) {
            const clickedRow = tableData[index];

            if (isInsurance && checked) {
                const currentlySelected = tableData.filter((ele) => ele.IsChecked);

                if (currentlySelected.length > 0) {
                    const selectedUHID = currentlySelected[0]?.UHID;
                    if (clickedRow.UHID !== selectedUHID) {
                        toast.error(
                            `For Insurance type, you can only select rows of same or one UHID at a time.`
                        );
                        return;
                    }
                }
            }

            const data = [...tableData];
            data[index][name] = checked;
            setTableData(data);

            const fData = filteredData.map((r) =>
                r.LedgerTransactionID === data[index].LedgerTransactionID
                    ? { ...r, [name]: checked }
                    : r
            );
            setFilteredData(fData);

        } else {
            // Select All
            if (isInsurance && checked) {
                const firstUHID = tableData[0]?.UHID;

                const updatedData = tableData.map((ele) => ({
                    ...ele,
                    [name]: ele.UHID === firstUHID,
                }));

                toast.info(`For Insurance type, only rows with UHID: ${firstUHID} have been selected.`);
                setTableData(updatedData);
                setFilteredData(updatedData);
                return;
            }

            const updatedData = tableData.map((ele) => ({ ...ele, [name]: checked }));
            setTableData(updatedData);
            setFilteredData(updatedData);
        }
    };



    const saveInvoice = async () => {
        const selectedRows = tableData.filter((ele) => ele.IsChecked);
        if (selectedRows.length === 0) {
            toast.error("Please select atleast one.");
            return;
        }

        // const missingDocs = selectedRows.filter(
        //     (row) => row?.Guid && !uploadedDocs[row?.LedgerTransactionID]
        // );
        // const missingDocs = selectedRows.filter((row) => {
        //     if (!row?.Guid) return false; // no doc required

        //     const uploadedDocName = uploadedDocs[row?.LedgerTransactionID];
        //     if (!uploadedDocName) return true; // nothing uploaded at all

        //     // Check if the uploaded document matches the required DocumentName
        //     return uploadedDocName.toLowerCase() !== (row?.DocumentName || "").toLowerCase();
        // });
        // const missingDocs = selectedRows.filter((row) => {
        //     if (!isInsurance) return false;
        //     if (!row?.Guid) return false;

        //     const uploadedDocName = uploadedDocs[row?.LedgerTransactionID];
        //     if (!uploadedDocName) return true;

        //     return uploadedDocName.toLowerCase() !== (row?.DocumentName || "").toLowerCase();
        // });
        // if (missingDocs.length > 0) {
        //     const names = [...new Set(missingDocs.map(r => r?.DocumentName || "Required document"))];
        //     toast.warning(`Required documents not uploaded: ${names.join(", ")}`);
        // }
        try {
            setLoad({ name: "SaveLoading", loading: true });

            const LedgerTransactionID = selectedRows.map(
                (ele) => ele.LedgerTransactionID
            );
            const clientArray = selectedRows.map(
                (ele) =>
                    `${payload?.ClientID}#${ele.BusinessUnitID}#${ele.ClientName}`
            );
            const res = await axiosInstance.post("Accounts/PatientInvoiceCreation", {
                fromDate: moment(payload?.FromDate).format("YYYY-MM-DD"),
                toDate: moment(payload?.ToDate).format("YYYY-MM-DD"),
                invoiceDate: moment(payload?.InvoiceDate).format("YYYY-MM-DD"),
                clientID: selectedRows[0]?.RateTypeID || 0,
                patientTypes: "",
                LedgerTransactionID,
                InvoiceTo: clientArray,
            });
            toast.success(res?.data?.message);
            const invoices = res?.data?.data || [];
            setLoad({ name: "PdfLoading", loading: true });
            for (let i = 0; i < invoices.length; i++) {
                const item = invoices[i];
                const pdfRes = await axiosReport.post(
                    "commonReports/ExportFullInvoice",
                    {
                        DocumentType: "2",
                        InvoiceNo: item.InvoiceNo,
                        InvoiceType: "Both",
                    },
                    {
                        responseType: "blob",
                    }
                );
                const file = new Blob([pdfRes.data], { type: "application/pdf" });
                const fileURL = URL.createObjectURL(file);
                window.open(fileURL, "_blank");
            }
            InvoiceCreationSearch();

        } catch (err) {
            console.log(err);
            toast.error("Something went wrong");
        } finally {
            setLoad({ name: "", loading: false });
        }
    };

    const handleSearchSelectChange = (label, value) => {
        setPayload((prev) => ({
            ...prev,
            [label]: String(value?.value),
            ...(label === "BusinessUnitID" ? { ClientID: "" } : {}),
        }));
        if (label === "BusinessUnitID") getAccessCentres(value?.value, "");
        if (label === "invoiceBillingCycle")
            getAccessCentres(payload.BusinessUnitID, value?.value);
    };

    const handleSelectChange = (event) => {
        const { name, value } = event.target;
        if (name === "BusinessUnitID") getAccessCentres(value, "");
        if (name === "invoiceBillingCycle")
            getAccessCentres(payload.BusinessUnitID, value);
        setPayload((prev) => ({
            ...prev,
            [name]: value,
            ...(name === "BusinessUnitID" ? { ClientID: "" } : {}),
        }));
    };

    const dateSelect = (value, name) => {
        setPayload({ ...payload, [name]: value });
        setTableData([]);
        setFilteredData([]);
    };

    const InvoiceCreationSearch = () => {
        if (!payload?.BusinessUnitID) {
            toast.error("Please select Business Unit");
            return;
        }
        if (!isInsurance && !isRateTypeSelected) {
            toast.error("Please select RateType");
            return;
        }
        setLoad({ name: "searchLoading", loading: true });
        axiosInstance
            .post("Accounts/InvoiceDetailsPatientWise", {
                ...payload,
                FromDate: moment(payload?.FromDate).format("DD-MMM-YYYY"),
                ToDate: moment(payload?.ToDate).format("DD-MMM-YYYY"),
                SearchType: "Details",
                BusinessUnitID: Number(payload?.BusinessUnitID),
                ClientID: Number(payload?.ClientID || 0),
                BusinessType: selectedBusinessType
            })
            .then((res) => {
                setLoad({ name: "", loading: false });
                if (res?.data.success && res?.data?.message.length > 0) {
                    setTableData(res?.data?.message);
                    setFilteredData(res?.data?.message);
                    setCurrentPage(1);
                    setSearchText("");
                    getUploadFileIdentity()
                } else {
                    toast.error("No Record Found");
                    setTableData([]);
                    setFilteredData([]);
                }
            })
            .catch(() => {
                setLoad({ name: "", loading: false });
                toast.error("Something went wrong");
            });
    };

    const downloadExcel = (ele, index) => {
        setExcelLoad({ index, load: true });
        axiosInstance
            .post("Accounts/InvoiceCreationSearch", {
                ...payload,
                FromDate: moment(payload?.FromDate).format("DD-MMM-YYYY"),
                ToDate: moment(payload?.ToDate).format("DD-MMM-YYYY"),
                SearchType: "Summary",
                BusinessUnitID: Number(payload?.BusinessUnitID || 0),
            })
            .then((res) => {
                setExcelLoad({ index, load: false });
                toast.success("Successfully Download");
                const rawData = res.data.message;
                const enabledColumns =
                    FilterData?.filter((item) => item.IsShow == 1 && item.TypeId == 2) ||
                    [];

                const excelData = rawData.map((row, i) => {
                    const rowData = {};
                    enabledColumns.forEach((col) => {
                        if (col.ControlDisplayID === "Sr.No.") {
                            rowData[col.ControlDisplayName || col.ControlDisplayID] = i + 1;
                            return;
                        }
                        const apiField =
                            headWithApiFields[col.ControlDisplayID] ||
                            col.ApiFieldName ||
                            col.ControlDisplayID;
                        rowData[col.ControlDisplayName || col.ControlDisplayID] =
                            row[apiField] ?? "";
                    });
                    return rowData;
                });

                ExportToExcel(excelData);
            })
            .catch((err) => {
                setExcelLoad({ index, load: false });
                console.log(err);
            });
    };

    const handleModalState = (ele) => {
        setShow({
            modal: true,
            id: {
                ...payload,
                FromDate: moment(payload?.FromDate).format("DD-MMM-YYYY"),
                ToDate: moment(payload?.ToDate).format("DD-MMM-YYYY"),
                SearchType: "Details",
                BusinessUnitID: Number(ele?.BusinessUnitID || 0),
                ClientID: Number(ele?.ClientID),
            },
        });
    };

    const handleUploadModalClose = async () => {
        try {
            const res = await axiosInstance.post("CommonController/GetDocument", {
                Page: "PatinentWise Invoice Creation",
                Guid: uploadModal.documentId,
            });
            const docs = res?.data?.message || [];

            const hasRequiredDoc = docs.some(
                (doc) => doc?.DocumentName?.toLowerCase() === uploadModal.requiredDocName?.toLowerCase()
            );

            if (hasRequiredDoc) {
                setUploadedDocs(prev => ({
                    ...prev,
                    [uploadModal.currentLedgerID]: uploadModal.requiredDocName
                }));
            }
        } catch (e) {
            console.log(e);
        }
        setUploadModal({ show: false, documentId: "", rowData: null, currentLedgerID: null, requiredDocName: "" });
    };

    // const totalNetAmout = tableData?.reduce(
    //     (sum, row) => sum + (row?.NetAmount || 0),
    //     0,
    // );
    // const totalGrossAmout = tableData?.reduce(
    //     (sum, row) => sum + (row?.GrossAmount || 0),
    //     0,
    // );

    const selectedRows = tableData?.filter((ele) => ele?.IsChecked);

    const totalInvoiceCount = selectedRows?.length;

    const totalNetAmout = selectedRows?.reduce(
        (sum, row) => sum + Number(row?.NetAmount || 0),
        0,
    );

    const totalGrossAmout = selectedRows?.reduce(
        (sum, row) => sum + Number(row?.GrossAmount || 0),
        0,
    );
    const CheckedBox = () =>
        tableData?.filter((ele) => ele?.IsChecked === true).length > 0 &&
        (isInsurance || isRateTypeSelected);

    useEffect(() => {
        getPatientType();
        getInvoiceBillingCentre();
        controllerDynamic();
    }, []);

    const formatItemName = (itemName) => {
        if (!itemName) return "";

        const items = itemName.split(",").map((i) => i.trim());

        const grouped = [];
        for (let i = 0; i < items.length; i += 3) {
            grouped.push(items.slice(i, i + 3).join(", "));
        }

        return grouped.join("\n");
    };

    useEffect(() => {
        if (payload?.BusinessUnitID && (isInsurance || isRateTypeSelected)) {
            InvoiceCreationSearch();
        }
    }, [payload?.ClientID]);

    return (
        <>
            <Accordion
                name={t("PatinentWise Invoice Creation")}
                isBreadcrumb={true}
                defaultValue={true}
            >
                <div className="row px-2 mt-2 mb-1">
                    {controllerDynamicList
                        ?.filter((item) => item?.TypeId === 1 && item?.IsShow === 1)
                        ?.map((item, index) => {
                            if (
                                item?.ControlDisplayID === "BusinessUnitID" &&
                                isHideController("BusinessUnitID")
                            ) {
                                return (
                                    <div className="col-sm-2" key={index}>

                                        <ReactSelect
                                            dynamicOptions={[
                                                { label: "Select", value: "" },
                                                ...dropDownList?.centreList,
                                            ]}
                                            name="BusinessUnitID"
                                            lable={t("Business Unit")}
                                            id="BusinessUnitID"
                                            removeIsClearable={true}
                                            placeholderName={t("Business Unit")}
                                            value={payload?.BusinessUnitID}
                                            onChange={handleSearchSelectChange}
                                            className="required-fields"
                                        />
                                    </div>
                                );
                            }
                            if (
                                item?.ControlDisplayID === "invoiceBillingCycle" &&
                                isHideController("invoiceBillingCycle")
                            ) {
                                return (
                                    <div className="col-sm-2" key={index}>
                                        <ReactSelect
                                            dynamicOptions={[
                                                { label: "Select", value: "" },
                                                ...dropDownList?.invoiceBillingCycleList,
                                            ]}
                                            name="invoiceBillingCycle"
                                            lable={t("Invoice Billing Cycle")}
                                            id="invoiceBillingCycle"
                                            removeIsClearable={true}
                                            placeholderName={t("Invoice Billing Cycle")}
                                            value={payload?.invoiceBillingCycle}
                                            onChange={handleSearchSelectChange}
                                            className="required-fields"
                                        />
                                    </div>
                                );
                            }
                            if (
                                item?.ControlDisplayID === "ClientID" &&
                                isHideController("ClientID")
                            ) {
                                return (
                                    <div className="col-sm-2" key={index}>
                                        <ReactSelect
                                            dynamicOptions={[{ label: "Select", value: 0 }, ...CentreData]}
                                            name="ClientID"
                                            lable={t("Rate Type")}
                                            id="ClientID"
                                            removeIsClearable={true}
                                            placeholderName={t("Rate Type")}
                                            value={payload?.ClientID}
                                            onChange={handleSearchSelectChange}
                                            className={isInsurance ? "" : "required-fields"}
                                        />
                                    </div>
                                );
                            }


                            if (
                                item?.ControlDisplayID === "UHID" &&
                                isHideController("UHID")
                            ) {
                                return (
                                    <div className="col-sm-2" key={index}>
                                        <Input
                                            type="text"
                                            placeholder=""
                                            lable={t("UHID No.")}
                                            id="UHID"
                                            name="UHID"
                                            value={payload?.UHID}
                                            onChange={handleSelectChange}
                                            maxLength={20}
                                        />
                                    </div>
                                );
                            }
                            if (
                                item?.ControlDisplayID === "FromDate" &&
                                isHideController("FromDate")
                            ) {
                                return (
                                    <div className="col-sm-2" key={index}>
                                        <DatePicker
                                            className="custom-calendar"
                                            placeholder=" "
                                            id="FromDate"
                                            lable="FromDate"
                                            name="FromDate"
                                            value={payload?.FromDate}
                                            onChange={dateSelect}
                                            maxDate={new Date()}
                                        />
                                    </div>
                                );
                            }
                            if (
                                item?.ControlDisplayID === "ToDate" &&
                                isHideController("ToDate")
                            ) {
                                return (
                                    <div className="col-sm-2" key={index}>
                                        <DatePicker
                                            className="custom-calendar"
                                            placeholder=" "
                                            id="ToDate"
                                            lable="ToDate"
                                            name="ToDate"
                                            value={payload?.ToDate}
                                            onChange={dateSelect}
                                            minDate={new Date(payload.FromDate)}
                                        />
                                    </div>
                                );
                            }
                            if (
                                item?.ControlDisplayID === "InvoiceDate" &&
                                isHideController("InvoiceDate")
                            ) {
                                return (
                                    <div className="col-sm-2" key={index}>
                                        <DatePicker
                                            className="custom-calendar"
                                            placeholder=" "
                                            id="InvoiceDate"
                                            lable="InvoiceDate"
                                            name="InvoiceDate"
                                            value={payload?.InvoiceDate}
                                            onChange={dateSelect}
                                            maxDate={new Date()}
                                        />
                                    </div>
                                );
                            }
                        })}
                    <div className="d-flex align-items-center justify-content-center mb-2">
                        <SearchButton
                            text={"Search"}
                            onClick={InvoiceCreationSearch}
                            style={{ gap: "3px" }}
                            className="mx-2"
                        />
                        {CheckedBox() && (
                            // <div className="px-1">
                            //     {load?.loading &&
                            //         (load?.name === "SaveLoading" || load?.name === "PdfLoading") ? (
                            //         <Loading />
                            //     ) : (
                            //         <div className="d-flex align-items-center justify-content-end">
                            //             <SaveButton
                            //                 text={"Save"}
                            //                 style={{ width: "fit-content" }}
                            //                 onClick={saveInvoice}
                            //             />
                            //         </div>
                            //     )}
                            // </div>
                            <div className="px-1">
                                {load?.loading ? (
                                    <Loading />
                                ) : (
                                    <div className="d-flex align-items-center justify-content-end">
                                        <SaveButton
                                            text={"Save"}
                                            style={{ width: "fit-content" }}
                                            onClick={saveInvoice}
                                            disabled={load?.loading}   // extra safety
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </Accordion>
            <Accordion
                title={t("Search Detail")}
                linkTo="#"
                linkTitle={
                    <div
                        className="link-title-container mt-2 d-none d-md-flex"
                        id="pr_id_11"
                    >
                        <label>
                            {t("Total Invoice Count")} :
                            <span className="text-danger" style={{ marginLeft: "10px" }}>
                                {/* {filteredData.length} */}
                                {totalInvoiceCount}
                            </span>
                        </label>
                        |
                        <label>
                            {t("Total Gross Amount")} :
                            <span className="text-danger" style={{ marginLeft: "10px" }}>
                                {formatIndianNumber(totalGrossAmout)}
                            </span>
                        </label>
                        |
                        <label>
                            {t("Total NetAmount")} :
                            <span className="text-danger" style={{ marginLeft: "10px" }}>
                                {formatIndianNumber(totalNetAmout)}
                            </span>
                        </label>
                        <Input
                            type="text"
                            placeholder="Search Invoice Creation Details..."
                            value={searchText}
                            onClick={(e) => e.stopPropagation()}
                            onChange={handleChangeSearch}
                            className=""
                        />
                    </div>
                }
                defaultValue={true}
            >
                {load?.name === "searchLoading" && load?.loading ? (
                    <Loading />
                ) : filteredData?.length > 0 ? (
                    <>
                        <Tables>
                            <thead className="text-center cf" style={{ zIndex: 99 }}>
                                <tr>
                                    {FilterData?.filter(
                                        (item) => item.IsShow == 1 && item.TypeId == 2,
                                    )?.map((header, idx) => {
                                        if (header.ControlDisplayID === "Sr.No.")
                                            return <th key={idx}>{t("Sr.No.")}</th>;
                                        if (header.ControlDisplayID === "Reg Date")
                                            return <th key={idx}>{t("Reg Date")}</th>;
                                        if (header.ControlDisplayID === "LAb No")
                                            return <th key={idx}>{t("LAb No")}</th>;
                                        if (header.ControlDisplayID === "UHID")
                                            return <th key={idx}>{t("UHID")}</th>;
                                        if (header.ControlDisplayID === "BillNo")
                                            return <th key={idx}>{t("BillNo")}</th>;
                                        if (header.ControlDisplayID === "RateTypeName")
                                            return <th key={idx}>{t("RateTypeName")}</th>;
                                        if (header.ControlDisplayID === "Test Description")
                                            return <th key={idx}>{t("Test Description")}</th>;
                                        if (header.ControlDisplayID === "Patient Name")
                                            return <th key={idx}>{t("Patient Name")}</th>;
                                        if (header.ControlDisplayID === "Age/Gender")
                                            return <th key={idx}>{t("Age/Gender")}</th>;
                                        if (header.ControlDisplayID === "Mrp")
                                            return <th key={idx}>{t("Mrp")}</th>;
                                        if (header.ControlDisplayID === "Gross Amount")
                                            return <th key={idx}>{t("Gross Amount")}</th>;
                                        if (header.ControlDisplayID === "Net Amount")
                                            return <th key={idx}>{t("Net Amount")}</th>;
                                        if (header.ControlDisplayID === "PCC InvoiceAmt")
                                            return <th key={idx}>{t("PCC InvoiceAmt")}</th>;
                                        return (
                                            <th key={idx}>
                                                {t(
                                                    header.ControlDisplayName || header.ControlDisplayID,
                                                )}
                                            </th>
                                        );
                                    })}

                                    <th>{t("Upload File")}</th>
                                    {isInsurance && payload?.ClientID ? (
                                        <th>Action</th>
                                    ) : (
                                        payload?.ClientID && (
                                            <th>
                                                <input
                                                    type="checkbox"
                                                    name="IsChecked"
                                                    onChange={(e) => handleCheck(e)}
                                                    checked={
                                                        tableData.length > 0 &&
                                                        tableData.every((item) => item.IsChecked)
                                                    }
                                                    disabled={!isInsurance && !isRateTypeSelected}
                                                />
                                            </th>
                                        )
                                    )}
                                </tr>
                            </thead>

                            <tbody className="jsh">
                                {currentTableData?.map((ele, index) => {
                                    const actualIndex = (currentPage - 1) * pageSize + index;
                                    const originalIndex = tableData.findIndex(
                                        (row) => row.LedgerTransactionID === ele.LedgerTransactionID
                                    );
                                    return (
                                        <tr key={index}>
                                            {FilterData?.filter(
                                                (item) => item.IsShow == 1 && item.TypeId == 2,
                                            )?.map((column, colIndex) => {
                                                if (column.ControlDisplayID === "srNo")
                                                    return <td key={colIndex}>{actualIndex + 1}</td>;
                                                if (column.ControlDisplayID === "RegDate")
                                                    return <td key={colIndex}>{ele.RegDate}</td>;
                                                if (column.ControlDisplayID === "LedgerTransactionNo")
                                                    return <td key={colIndex}>{ele.LedgerTransactionNo}</td>;
                                                if (column.ControlDisplayID === "ItemName")
                                                    return (
                                                        <td key={colIndex} style={{ whiteSpace: "pre-line" }}>
                                                            {formatItemName(ele.ItemName)}
                                                        </td>
                                                    );
                                                if (column.ControlDisplayID === "PName")
                                                    return <td key={colIndex}>{ele.PName}</td>;
                                                if (column.ControlDisplayID === "UHID")
                                                    return <td key={colIndex}>{ele.UHID}</td>;
                                                if (column.ControlDisplayID === "BillNo")
                                                    return <td key={colIndex}>{ele.BillNo}</td>;
                                                if (column.ControlDisplayID === "RateTypeName")
                                                    return <td key={colIndex}>{ele.RateTypeName}</td>;
                                                if (column.ControlDisplayID === "Age")
                                                    return <td key={colIndex}>{ele.Age}</td>;
                                                if (column.ControlDisplayID === "Amount")
                                                    return <td key={colIndex}>{ele.Amount}</td>;
                                                if (column.ControlDisplayID === "GrossAmount")
                                                    return (
                                                        <td key={colIndex} className="amount">
                                                            {formatIndianNumber(ele.GrossAmount)}
                                                        </td>
                                                    );
                                                if (column.ControlDisplayID === "NetAmount")
                                                    return (
                                                        <td key={colIndex} className="amount">
                                                            {formatIndianNumber(ele.NetAmount)}
                                                        </td>
                                                    );
                                                if (column.ControlDisplayID === "PCCInvoiceAmt")
                                                    return <td key={colIndex}>{ele.PCCInvoiceAmt}</td>;

                                                return <td key={colIndex}></td>;
                                            })}

                                            <td data-title={t("Upload File")} className="text-center align-middle">
                                                {ele?.Guid ?
                                                    <i
                                                        className="fa fa-upload text-primary"
                                                        style={{ cursor: "pointer", fontSize: "16px" }}
                                                        title={t("Upload File")}
                                                        onClick={() => {
                                                            setUploadModal({
                                                                show: true,
                                                                documentId: ele?.Guid,
                                                                rowData: ele?.LedgerTransactionIDHash,
                                                                currentLedgerID: ele?.LedgerTransactionID,
                                                                requiredDocName: ele?.DocumentName,
                                                            });
                                                        }}
                                                    /> : "-"}

                                            </td>

                                            {payload?.ClientID && <td data-title="Action">
                                                <input
                                                    type="checkbox"
                                                    name="IsChecked"
                                                    onChange={(e) => handleCheck(e, originalIndex)}
                                                    checked={ele?.IsChecked || false}
                                                    disabled={!isInsurance && !isRateTypeSelected}
                                                />
                                            </td>}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </Tables>
                        {filteredData.length > 0 && (
                            <div className="d-flex flex-wrap justify-content-end align-items-end gap-2 mt-3">
                                <div style={{ minWidth: "150px" }}>
                                    <ReactSelect
                                        value={pageSize}
                                        dynamicOptions={[
                                            { label: "100", value: 100 },
                                            { label: "250", value: 250 },
                                            { label: "500", value: 500 },
                                            { label: "1000", value: 1000 },
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
                    <div className="card">
                        <NoRecordFound />
                    </div>
                )}
            </Accordion>

            {uploadModal.show && (
                <UploadFile
                    options={requiredAttachment}
                    show={uploadModal.show}
                    handleClose={handleUploadModalClose}
                    documentId={uploadModal.documentId}
                    pageName="PatinentWise Invoice Creation"
                    LedgerTransactionIDHash={uploadModal.rowData}
                />
            )}
        </>
    );
};

export default PatinentWiseInvoiceCreation; 
