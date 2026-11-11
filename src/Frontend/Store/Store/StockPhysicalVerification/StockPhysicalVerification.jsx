import React, { useState, useEffect } from "react";
import Heading from "../../../components/UI/Heading";
import ReactSelect from "../../../components/formComponent/ReactSelect";
import { useTranslation } from "react-i18next";
import DatePicker from "../../../components/formComponent/DatePicker";
import MultiSelectComp from "../../../components/formComponent/MultiSelectComp";
import { axiosInstance, axiosReport } from "../../../utils/axiosInstance";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import Input from "../../../components/formComponent/Input";
import { CustomButton } from "../../../components/UI/CustomButton";
import MultiSelctItems from "../../../components/formComponent/MultiSelctItems";
import {
    GetBindcattype,
    GetBinditem,
    GetBindSubcattype,
    GetItemCategory,
    GetMachine,
} from "../../../utils/NetworkApi/commonApi";
import Accordion from "../../../components/UI/Accordion";
import { add } from "@dnd-kit/utilities";
import ItemModal from "./ItemModal";
import Tables from "../../../components/UI/customTable";
import ColorCodingSearch from "../../../components/ModalComponent/ColorCodingSearch";
import BarcodeModal from "./BarcodeModal";
import { ScanBarcode } from "lucide-react";
import moment from "moment";
import ItemDetailsModal from "./ItemDetailsModal";
import Loading from "../../../components/loader/Loading";

const StockPhysicalVerification = () => {
    const [pageSize] = useState(100);
    const [visibleCount, setVisibleCount] = useState(100); // rows currently rendered; grows on scroll
    const { t } = useTranslation();
    const [tableData, setTableData] = useState([]);
    console.log("TableData =>", tableData);
    const [show, setShow] = useState(false);
    const [showItemModal, setShowItemModal] = useState(false);
    const [showBarcodeModal, setShowBarcodeModal] = useState(false);
    const [errors, setErrors] = useState({});
    const [itemDetails, setItemDetails] = useState(false);
    const [BarcodeNo, setBarcodeNo] = useState("");
    const [loading, setLoading] = useState(false);
    const [payload, setPayload] = useState({
        Location: "",
        ItemCode: "",
        SacanBarcode: "",
        CategoryType: [],
        SubCategoryType: [],
        ItemCategory: [],
        Items: [],
    });
    const [IsFree, setIsFree] = useState(0);
    console.log("IsFree =>", IsFree);
    const [dropDownList, setDropDownList] = useState({
        curentlocation: [],
        categorylist: [],
        subcategorylist: [],
        itemcategorylist: [],
        items: [],
        machinelist: [],
    });
    const handleSelectChange = (name, value) => {
        setPayload((prev) => ({ ...prev, [name]: value?.value }));
        setIsFree(value?.isFreezed);
    };
    const handleChange = (e) => {
        const { name, value } = e.target;
        setPayload((prev) => ({ ...prev, [name]: value }));
    };
    const dateSelect = (date, name) => {
        setPayload({
            ...payload,
            [name]: date,
        });
    };


    const handleAllRamarks = (e) => {
        const value = e.target.value;

        setPayload((prev) => ({
            ...prev,
            verificationRemarks: value
        }));
        setTableData((prev) =>
            prev.map((row) => ({
                ...row,
                verificationRemarks: value
            }))
        );
    };
    const handlePayloadMultiSelectNumbers = (data) => {
        if (!Array.isArray(data)) return [];
        const result = data.map((item) => Number(item?.code));
        console.log(result);
        return result;
    };
    const handleSelectMultiChange = (name, select) => {
        setPayload((prev) => {
            let updatedPayload = { ...prev, [name]: select };
            const categoryIds = handlePayloadMultiSelectNumbers(updatedPayload?.CategoryType);
            const subCategoryIds = handlePayloadMultiSelectNumbers(updatedPayload?.SubCategoryType);
            const itemCategoryIds = handlePayloadMultiSelectNumbers(updatedPayload?.ItemCategory);

            if (name === "CategoryType") {
                updatedPayload.SubCategoryType = [];
                updatedPayload.ItemCategory = [];
                updatedPayload.Items = [];

                GetBindSubcattype(categoryIds, (data) => {
                    setDropDownList((prev) => ({ ...prev, subcategorylist: data }));
                });
            }

            if (name === "SubCategoryType") {
                updatedPayload.ItemCategory = [];
                updatedPayload.Items = [];

                GetItemCategory(subCategoryIds, (data) => {
                    setDropDownList((prev) => ({ ...prev, itemcategorylist: data }));
                });
            }

            if (name === "ItemCategory") {
                updatedPayload.Items = [];
            }

            // 🔥 ITEMS API (independent)
            if (
                categoryIds.length ||
                subCategoryIds.length ||
                itemCategoryIds.length
            ) {
                GetBinditem(categoryIds, subCategoryIds, itemCategoryIds, (data) => {
                    setDropDownList((prev) => ({ ...prev, items: data }));
                });
            }

            return updatedPayload;
        });
    };


    const dateSelecttable = (index, name, date) => {
        setTableData((prev) =>
            prev.map((row, i) =>
                i === index ? { ...row, [name]: date } : row
            )
        );
    };
    useEffect(() => {
        GetBindcattype((data) => {
            setDropDownList((prev) => ({ ...prev, categorylist: data }));
        });
        GetMachine((data) => {
            setDropDownList((prev) => ({ ...prev, machinelist: data }));
        });
    }, []);
    const handleShow = () => {
        setShow((prev) => !prev);
    };
    const handleItemsFromModal = (itemIds) => {
        console.log(itemIds);

        handleSearch("", itemIds);
    };
    useEffect(() => {
        GetBindCurrentLocaton();
    }, []);

    const handleSearch = (barcode = "", rowColorId = "", selectedItems = []) => {
        const requestData = {
            LocationId: (payload?.Location).toString(),
            ItemCode: (payload?.ItemCode).toString(),
            CategoryTypeId: handlePayloadMultiSelectNumbers(payload?.CategoryType).toString(),
            SubCategoryTypeId: handlePayloadMultiSelectNumbers(payload?.SubCategoryType).toString(),
            SubCategoryId: handlePayloadMultiSelectNumbers(payload?.ItemCategory).toString(),
            ItemId: handlePayloadMultiSelectNumbers(payload?.Items).toString(),
            Barcode: barcode || "",
            RowColor: rowColorId.toString(),
            ItemIdFinal: selectedItems.toString() || "",
            AutoOnly: "",
            Type: "",
        };
        if (!requestData?.LocationId) {
            toast.error("Please select Current Location");
            return;
        }
        axiosInstance.post("StockPhysicalVerification/SearchData", requestData)
            .then((res) => {
                const response = res?.data?.message;
                if (response === "-1") {
                    setBarcodeNo(barcode);
                    setShowBarcodeModal(true);
                    return;
                }
                setTableData(response);
            })
            .catch(() => console.log("Something went wrong"));
    };

    const GetBindCurrentLocaton = (onSuccess) => {
        axiosInstance
            .post("StoreCreateSalesIndent/bindalldata")
            .then((res) => {
                const response = res?.data?.message;
                const newRes = response?.map((ele) => ({
                    label: ele?.location,
                    value: ele?.locationId,
                    isFreezed: ele?.isFreez
                }));
                setDropDownList((prev) => ({ ...prev, curentlocation: newRes }));
                if (onSuccess) onSuccess(newRes); // ✅ callback to use fresh data
            })
            .catch(() => console.log("Something went wrong"));
    };
    const handleItemModal = () => {
        if (!payload?.Location) {
            toast.error("Please select Current Location");
            return
        }
        setShowItemModal(true);
    };

    const handleRowChange = (e, index) => {
        const { name, value, type, checked } = e.target;

        setTableData((prevData) => {
            const updatedData = [...prevData];

            updatedData[index] = {
                ...updatedData[index],
                [name]: type === "checkbox" ? checked : value,
                isUpdated: true
            };

            return updatedData;
        });
    };
    const handlelAllCheckbox = (e) => {
        const checked = e.target.checked;

        setTableData((prev) =>
            prev.map((row) => ({
                ...row,
                checkbox: checked,
                isUpdated: true
            }))
        );
    };
    const handleAddRow = (row, index) => {
        const newRow = {
            ...row,
            barcodeno: "",
            StockQty: "",
            batchnumber: "",
            rowcolor: "yellow", // 👈 yaha color set karo
        };

        setTableData((prev) => {
            const updated = [...prev];
            updated.splice(index + 1, 0, newRow);
            return updated;
        });
    };

    const createPayload = () => {
        return tableData
            .filter(row => row?.checkbox)
            .map((row) => ({
                ItemID: row?.itemid,
                StockID: row?.stockID,
                FromStockID: row?.FromStockID || 0,
                OldQty: row?.balance || 0,
                NewQty: row?.newqty || 0,
                NewBatch: row?.batchnumber || "",
                NewBatchExpiryDate: moment(row?.expiryDate).format("YYYY-MM-DD"),
                LocationID: Number(row?.locationId) || 0,
                StockPhysicalVerificationRemarks: row?.AllRemarks || "",
                QutationID: String(row?.qutationid || 0),
                Rate: row?.rate || 0,
                DiscountPer: row?.discountPer || 0,
                DiscountAmount: row?.discountAmount || 0,
                TaxPer: row?.TaxPer || 0,
                TaxAmount: row?.taxAmount || 0,
                UnitPrice: row?.unitPrice || 0,
                MRP: row?.MRP || 0
            }));
    };
    const handleSave = async () => {
        try {
            const payload = createPayload();
            if (!payload.length) {
                toast.error("Please select at least one row");;
                return;
            }
            const res = await axiosInstance.post(
                "StockPhysicalVerification/savestock",
                payload
            );
            console.log("Response =>", res.data);
            setTableData(prev =>
                prev.map(row => ({ ...row, isUpdated: false }))
            );
            toast.success("Saved Successfully");

        } catch (error) {
            console.error("Error =>", error);
            toast.error(
                error?.response?.data?.message || "Something went wrong"
            );
        }
    };

    const handlePrint = () => {
        setLoading(true);

        const data = {
            LocationId: (payload?.Location).toString(),
            CategoryTypeId: handlePayloadMultiSelectNumbers(payload?.CategoryType).toString(),
            SubCategoryTypeId: handlePayloadMultiSelectNumbers(payload?.SubCategoryType).toString(),
            SubCategoryId: handlePayloadMultiSelectNumbers(payload?.ItemCategory).toString(),
            ItemId: handlePayloadMultiSelectNumbers(payload?.Items).toString(),
        };
        if (!data?.LocationId) {
            toast.warning("Please select Current Location");
            setLoading(false);
            return;
        }
        axiosReport
            .post("StoreReports/searchstockprint", data, {
                responseType: "blob",
            })
            .then((res) => {
                const file = new Blob([res.data], { type: "application/pdf" });
                const fileURL = URL.createObjectURL(file);
                window.open(fileURL);
            })
            .catch((err) => {
                toast.error(err?.response?.data?.message || "Something went wrong");
            })
            .finally(() => {
                setLoading(false);
            });
    };
    const handleallPrint = () => {
        const selectedRows = tableData.filter(item => item?.PhysicalQty);
        if (selectedRows.length === 0) {
            toast.warning("Please select at least one row");
            return;
        }
        const payload = selectedRows.map(item => ({
            stockid: item?.stockID,
            qty: item?.balance,
        }));

        axiosInstance
            .post("StoreCommonServices/GetBarcodeData", payload)
            .then((res) => {
                if (res?.data?.status) {
                    toast.success(res?.data?.message);
                }
            })
            .catch(() => {
                toast.error("Something went wrong");
            });
    };
    const handleBarcode = (row) => {
        const payload = [{
            stockid: row?.stockID,
            qty: row?.balance,
        }];

        axiosInstance
            .post("StoreCommonServices/GetBarcodeData", payload)
            .then((res) => {
                if (res?.data?.status) {
                    toast.success(res?.data?.message);
                }
            })
            .catch(() => {
                toast.error("Something went wrong");
            });
    };

    const handleQtyChange = (index, value) => {
        const updated = [...tableData];
        updated[index].StockQty = value;
        updated[index].isUpdated = true;
        setTableData(updated);
    };

    const handleRemarksChange = (index, value) => {
        const updated = [...tableData];
        updated[index].AllRemarks = value;
        updated[index].isUpdated = true;
        setTableData(updated);
    };

    const updatedRows = tableData.filter(item => item?.isUpdated);

    const handleApprove = () => {
        const updatedRows = tableData.filter((item) => item?.checkbox);

        console.log("Updated Rows =>", updatedRows);

        if (updatedRows.length === 0) {
            toast.error("Please select at least one row");
            return;
        }

        const MyDataAdj = updatedRows.flatMap((item) =>
            Number(item?.newqty || 0) >= Number(item?.balance || 0)
                ? [{
                    StockID: item?.stockID || 0,
                    ItemID: item?.itemid,
                    ItemName: item?.typename,
                    BatchNumber: item?.batchnumber,
                    Rate: Number(item?.rate) || 0,
                    DiscountPer: Number(item?.discountPer) || 0,
                    DiscountAmount: Number(item?.discountAmount) || 0,
                    TaxPer: Number(item?.taxPer) || 0,
                    TaxAmount: Number(item?.taxAmount) || 0,
                    UnitPrice: Number(item?.unitPrice) || 0,
                    MRP: Number(item?.mrp) || 0,
                    InitialCount: Number(item?.newqty - item?.balance || 0),
                    ExpiryDate: item?.expiryDate || null,
                    LocationID: item?.locationId || 0,
                    MajorUnitID: item?.majorUnitID || 0,
                    MinorUnitID: item?.minorUnitID || 0,
                    Converter: item?.converter || 0,
                    Remarks: item?.verificationRemarks || "",
                    BarcodeNo: item?.barcodeno || "",
                    IsExpirable: item?.isExpirable || 0,
                    InitialCount_old: String(Number(item?.balance || 0)),
                    InitialCount_New: String(Number(item?.newqty || 0)),
                    qutationid: String(item?.qutationid || 0),
                }]
                : []
        );

        const MyDataPro = updatedRows.map((item) => ({
            StockID: item?.stockID,
            ItemID: item?.itemid,
            ItemName: item?.typename,
            InitialCount: Number(item?.balance - item?.newqty || 0),
            LocationID: item?.locationId || 0,
            StockPhysicalVerificationID: "0",
            Naration: item?.verificationRemarks || "",
            qutationid: String(item?.qutationid || 0),
        }));

        const DeletedItemId =
            tableData
                .filter((item) => item?.isDeleted)
                .map((item) => item?.itemid)
                .join(",") || "";

        const payload = {
            MyDataAdj,
            MyDataPro,
            DeletedItemId,
        };

        axiosInstance
            .post("StockPhysicalVerification/approvestock", payload)
            .then((res) => {
                if (res?.data?.message?.success) {
                    toast.success(res?.data?.message?.message);
                } else {
                    toast.error(res?.data?.message?.message);
                }
            })
            .catch((err) => {
                toast.error(err?.response?.data?.message || "Error");
            });
    };

    const handleColorClick = (id, color) => {
        if (id === "5") {
            setTableData((prev) =>
                prev.filter((row) => row?.rowcolor === "yellow")
            );
        } else {
            handleSearch("", color);
        }
    };

    const colorCodingData = [
        { color: "#FFA07A", id: "1", labelKey: "Saved Earlier " },
        { color: "#FFE4C4", id: "2", labelKey: "Stock Not Avilable" },
        { color: "#FFFFFF", id: "3", labelKey: "Barcode Not Printed" },
        { color: "#90EE90", id: "4", labelKey: "Barcode Printed" },
        { color: "#FFFF00", id: "5", labelKey: "New Batch Added " },
    ];

    const getFreeze = async () => {
        if (!payload?.Location) {
            toast.error("Please select a location");
            return;
        }
        try {
            const res = await axiosInstance.get(
                "StockPhysicalVerification/LocationFreez",
                {
                    params: {
                        locationId: payload?.Location?.split("#")[0],
                    },
                }
            );

            if (res?.data?.message?.success) {
                toast.success(res?.data?.message?.message);
                axiosInstance
                    .post("StoreCreateSalesIndent/bindalldata")
                    .then((res) => {
                        const response = res?.data?.message;
                        const newRes = response?.map((ele) => ({
                            label: ele?.location,
                            value: ele?.locationId,
                            isFreezed: ele?.isFreez
                        }));
                        setDropDownList((prev) => ({ ...prev, curentlocation: newRes }));
                        setTableData([]);

                        const updatedLocation = newRes.find(
                            (loc) => String(loc.value) === String(payload?.Location)
                        );
                        if (updatedLocation) {
                            setIsFree(updatedLocation.isFreezed);
                        }
                    });

            } else {
                toast.error(res?.data?.message?.message);
            }
        } catch (err) {
            console.log(err);
            toast.error(err?.response?.data?.message || "Something went wrong");
        }
    };
    useEffect(() => setTableData([]), [payload.Location])

    // Infinite scroll over the already-loaded tableData: render only the first
    // `visibleCount` rows and reveal `pageSize` more as the user scrolls near
    // the bottom of the table container.
    const currentTableData = tableData.slice(0, visibleCount);

    const handleTableScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        // Within 100px of the bottom -> reveal the next chunk.
        if (scrollHeight - scrollTop - clientHeight < 100) {
            setVisibleCount((prev) => Math.min(prev + pageSize, tableData.length));
        }
    };

    // Reset the visible window to the top whenever the dataset size changes
    // (new search, add/delete row).
    useEffect(() => { setVisibleCount(pageSize); }, [tableData.length, pageSize]);


    return (
        <>
            {showItemModal && (
                <ItemModal
                    show={showItemModal}
                    onHandleShow={() => setShowItemModal(false)}
                    payload={payload}
                    setPayload={setPayload}
                    locationid={(payload?.Location || "").toString()}
                    onAddItems={handleItemsFromModal}
                />
            )}
            {showBarcodeModal && (
                <BarcodeModal
                    show={showBarcodeModal}
                    onHandleShow={() => setShowBarcodeModal(false)}
                    onMapClick={() => setItemDetails(true)}
                    BarcodeNO={BarcodeNo}
                />
            )}
            {itemDetails && (
                <ItemDetailsModal
                    show={itemDetails}
                    onHandleShow={() => setItemDetails(false)}
                    locationid={(payload?.Location || "").toString()}
                    BarcodeNo={BarcodeNo}
                />
            )}
            <div>
                <div className="card">
                    <Heading name={"Stock Physical Verification"} isBreadcrumb={true} />
                    <div className="row px-2 py-2">
                        <div className="col-sm-2">
                            <ReactSelect
                                // autoSelectFirst={true}
                                label="Current Location"
                                dynamicOptions={dropDownList?.curentlocation}
                                value={payload?.Location}
                                name="Location"
                                id="Location"
                                onChange={handleSelectChange}
                                placeholderName={t("Current Location")}
                            />
                        </div>
                        <Input
                            type="text"
                            placeholder=" "
                            lable="Item Code"
                            id="ItemCode"
                            name="ItemCode"
                            value={payload?.ItemCode}
                            onChange={handleChange}
                            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
                        />
                        <Input
                            type="text"
                            lable="Scan Barcode For Stock Verification"
                            id="SacanBarcode"
                            name="SacanBarcode"
                            value={payload?.SacanBarcode}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === "Tab") {
                                    handleSearch(e.target.value);
                                }
                            }}
                            onChange={handleChange}
                            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
                        />
                        {/* <Input
                            type="text"
                            placeholder=" "
                            lable="Item Name"
                            id="ItemName"
                            name="ItemName"
                            value={payload?.ItemName}
                            onChange={handleChange}
                            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
                        /> */}
                        <div className="col-sm-2 d-flex">
                            <CustomButton
                                text={IsFree == 1 ? "UnFreeze" : "Freeze"}
                                icon="Filter"
                                className="btn btn-sm btn-success"
                                onClick={getFreeze}
                            />
                            <CustomButton
                                text="More Filters"
                                icon="Filter"
                                className="btn btn-sm btn-success ml-2"
                                onClick={() => handleShow()}
                            >
                                {t("More Filters")}
                            </CustomButton>
                        </div>
                    </div>

                    {show && (
                        <div className="row px-2 py-2">
                            <MultiSelctItems
                                placeholderName="Category Type"
                                name="CategoryType"
                                values={payload}
                                setValues={setPayload}
                                labelKey="categoryTypeName"
                                valueKey="categoryTypeID"
                                dynamicOptions={dropDownList?.categorylist}
                                handleChange={handleSelectMultiChange}
                                requiredClassName={"required-fields"}
                                respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
                            />
                            <MultiSelctItems
                                placeholderName="Sub Category Type"
                                name="SubCategoryType"
                                values={payload}
                                setValues={setPayload}
                                labelKey="subCategoryTypeName"
                                valueKey="subCategoryTypeID"
                                dynamicOptions={dropDownList?.subcategorylist}
                                handleChange={handleSelectMultiChange}
                                respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
                            />
                            <MultiSelctItems
                                placeholderName="Item Category"
                                name="ItemCategory"
                                values={payload}
                                setValues={setPayload}
                                labelKey="name"
                                valueKey="subCategoryID"
                                dynamicOptions={dropDownList?.itemcategorylist}
                                handleChange={handleSelectMultiChange}
                                respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
                            />
                            <MultiSelctItems
                                placeholderName="Items"
                                name="Items"
                                values={payload}
                                setValues={setPayload}
                                labelKey="itemName"
                                valueKey="itemId"
                                dynamicOptions={dropDownList?.items}
                                handleChange={handleSelectMultiChange}
                                requiredClassName={"required-fields"}
                                respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
                            />
                        </div>
                    )}
                </div>

                {IsFree == 1 && <>
                    <div className="card mt-2">
                        <Accordion title={t("")} />
                        <div className="row px-2 py-2">
                            <div className="col-sm-12 d-flex justify-content-end">
                                <CustomButton
                                    text="Search"
                                    icon="Search"
                                    className="btn btn-sm btn-success mr-2"
                                    onClick={() => handleSearch()}
                                >
                                    {t("Search")}
                                </CustomButton>

                                <CustomButton
                                    text="Add Item From Quotation"
                                    icon="Add"
                                    className="btn btn-sm btn-success mr-2"
                                    onClick={() => handleItemModal()}
                                />


                                {tableData.length > 0 && (
                                    <>
                                        <CustomButton
                                            text="Save"
                                            icon="Save"
                                            className="btn btn-sm btn-success mr-2"
                                            onClick={handleSave}
                                        />
                                        <CustomButton
                                            text="Approve"
                                            icon="add"
                                            className="btn btn-sm btn-success mr-2"
                                            onClick={handleApprove}
                                        />
                                        <CustomButton
                                            text="Print All"
                                            icon="print"
                                            className="btn btn-sm btn-success mr-2"
                                            onClick={handleallPrint}
                                        />
                                        <CustomButton
                                            text="Print"
                                            icon="Print"
                                            className="btn btn-sm btn-success mr-2"
                                            onClick={handlePrint}
                                        />
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="card mt-2">
                        <Heading title={t("Item Details")}
                            secondTitle={
                                <>
                                    {colorCodingData?.map(({ color, labelKey, id }) => (
                                        <ColorCodingSearch
                                            key={id}
                                            color={color}
                                            label={t(labelKey)}
                                            onClick={() => handleColorClick(id, color)}
                                        />
                                    ))} |
                                    <div style={{ color: "red", fontWeight: "bold" }}> * Saved Data Went for Approval</div>
                                </>
                            }

                        />
                        <div className="row">
                            <div className="col-sm-12">
                                {tableData.length > 0 && (
                                    <Tables
                                        onScroll={handleTableScroll}
                                        style={{
                                            maxHeight: "400px",
                                            overflowY: "auto",
                                        }}
                                    >
                                        <thead style={{
                                            position: "sticky",
                                            top: 0, zIndex: 100
                                        }}>
                                            <tr>
                                                <th>{t("#")}</th>
                                                <th>{t("Stock Id")}</th>
                                                <th> {t("Item Type")}</th>
                                                <th>{t("Item Id")}</th>
                                                <th>{t("Item Name")}</th>
                                                <th>{t("Item Code")}</th>
                                                <th>{t("PurchaseUnit")}</th>
                                                <th>{t("Converter")}</th>
                                                <th>{t("Barcode")}</th>
                                                <th>{t("InHand Qty")}</th>
                                                <th >{t("Stock Qty")}</th>
                                                <th>{t("Batch No")}</th>
                                                <th>{t("Expiry Date")}</th>
                                                {/* <th>{t("Received Date")}</th> */}
                                                <th>{t("Add")}</th>
                                                <th>
                                                    <Input
                                                        type="text"
                                                        placeholder=" "
                                                        lable="All Remarks"
                                                        id="AllRemarks"
                                                        name="AllRemarks"
                                                        value={payload?.AllRemarks}
                                                        onChange={handleAllRamarks}
                                                    />
                                                </th>
                                                <th>{t("Rate")}</th>
                                                <th >{t("Disc Amt")}</th>
                                                <th>{t("Tax Amt")}</th>
                                                <th>{t("Unit Price")}</th>
                                                <th>
                                                    {/* <input
                                                        type="checkbox"
                                                        onChange={handlelAllCheckbox}
                                                        checked={tableData.length > 0 && tableData.every(row => row.checkbox)}
                                                    /> */}
                                                   {t("Check")}
                                                </th>
                                                <th>{t("Action")}</th>
                                                <th>{t("Barcode Print")}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentTableData?.map((row, index) => (
                                                <tr key={index} style={{ backgroundColor: row?.rowcolor }}>
                                                    <td data-title="#">{index + 1}</td>
                                                    <td data-title="Stock Id">{row?.stockID}</td>
                                                    <td data-title="Item Type">{row?.itemgroup}</td>
                                                    <td data-title="Item Id">{row?.itemid}</td>
                                                    <td data-title="Item Name">
                                                        <span style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
                                                            {row?.typename}
                                                        </span>
                                                    </td>

                                                    <td data-title="Item Code">{row?.apolloitemcode}</td>
                                                    <td data-title="PurchaseUnit">{row?.majorUnitName}</td>
                                                    <td data-title="Converter">{row?.converter}</td>
                                                    <td data-title="Barcode">
                                                        <Input
                                                            type="text"
                                                            name="barcodeno"
                                                            value={row?.barcodeno}
                                                            onChange={(e) => handleRowChange(e, index)}
                                                        />
                                                    </td>

                                                    <td data-title="InHand Qty">
                                                        <span style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
                                                            {row?.balance} <span style={{ color: "red" }}>{row?.minorUnitName}</span>
                                                        </span>
                                                    </td>

                                                    <td data-title="Stock Qty">
                                                        {/* <span style={{ wordWrap: "break-word", whiteSpace: "normal" }}> */}
                                                        <span style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
                                                            <Input
                                                                type="number"
                                                                name="newqty"
                                                                value={row?.newqty || ""}
                                                                onChange={(e) => handleRowChange(e, index)}
                                                            />
                                                            <span style={{ color: "red" }}>{row?.minorUnitName}</span>
                                                        </span>
                                                        {/* </span> */}
                                                    </td>
                                                    <td data-title="Batch No">
                                                        <Input
                                                            type="text"
                                                            name="batchnumber"
                                                            value={row?.batchnumber}
                                                            onChange={(e) => handleRowChange(e, index)}

                                                        />
                                                    </td>
                                                    <td data-title="Expiry Date" style={{ width: "50%" }}>
                                                        <DatePicker
                                                            name=""
                                                            id="expiryDate"
                                                            value={new Date(row.expiryDate)}
                                                            onChange={(date) =>
                                                                dateSelecttable(index, "expiryDate", date)
                                                            }
                                                            // maxDate={new Date()}
                                                            className="custom-calendar w-100"
                                                            respclass={"required-fields"}
                                                        />
                                                    </td>
                                                    {/* <td data-title="Received Date">{row?.ReceivedDate}</td> */}
                                                    <td data-title="Add">
                                                        {row?.rate !== "0" && row?.savedid === "0" && (
                                                            <CustomButton
                                                                text=""
                                                                icon="Add"
                                                                className="btn btn-sm btn-success mr-2"
                                                                onClick={() => handleAddRow(row, index)}
                                                            />
                                                        )}
                                                    </td>

                                                    <td data-title="All Remarks" style={{ width: "100%" }}>
                                                        <Input
                                                            type="text"
                                                            id="verificationRemarks"
                                                            name="verificationRemarks"
                                                            value={row?.verificationRemarks}
                                                            onChange={(e) => handleRowChange(e, index)}
                                                        />
                                                    </td>
                                                    <td data-title="Rate">{row?.rate}</td>
                                                    <td data-title="Disc Amt">{row?.discountAmount}</td>
                                                    <td data-title="Tax Amt">{row?.taxAmount}</td>
                                                    <td data-title="Unit Price">{row?.unitPrice}</td>
                                                    <td data-title="">
                                                        {row?.balance !== 0 ?  <input
                                                            type="checkbox"
                                                            name="checkbox"
                                                            checked={row?.checkbox || false}
                                                            onChange={(e) => handleRowChange(e, index)}
                                                        /> : "-"}
                                                    </td>
                                                    <td data-title="Action" className="text-center">
                                                        <i
                                                            className="bi bi-x-lg text-danger"
                                                            style={{ cursor: "pointer" }}
                                                            onClick={() =>
                                                                setTableData((prev) => prev.filter((_, i) => i !== index))
                                                            }
                                                        />
                                                    </td>
                                                    <td data-title="Barcode">
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={row?.balance}
                                                            onChange={(e) => handleRowChange(e, index)}
                                                        />

                                                        <i
                                                            className="bi bi-printer text-primary mt-1"
                                                            style={{ cursor: "pointer" }}
                                                            onClick={() => handleBarcode(row)}
                                                        ></i>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Tables>

                                )}
                                {tableData.length > pageSize && (
                                    <div className="d-flex justify-content-end align-items-center px-2 py-2">
                                        <span className="text-muted">
                                            {`Showing ${currentTableData.length} of ${tableData.length}`}
                                            {currentTableData.length < tableData.length && " — scroll for more"}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div></>
                }
            </div >
        </>
    )
}

export default StockPhysicalVerification;