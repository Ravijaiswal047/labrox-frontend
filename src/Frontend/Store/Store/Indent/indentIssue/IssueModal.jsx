import React, { useEffect, useState } from "react";
import Heading from "../../../../components/UI/Heading";
import Input from "../../../../components/formComponent/Input";
import { useTranslation } from "react-i18next";
import { Dialog } from "primereact/dialog";
import { useLocalStorage } from "../../../../utils/hooks/useLocalStorage";
import { useLocation } from "react-router-dom";
import Accordion from "../../../../components/UI/Accordion";
import Tables from "../../../../components/UI/customTable";
import ColorCodingSearch from "../../../../components/ModalComponent/ColorCodingSearch";
import { axiosInstance, axiosReport } from "../../../../utils/axiosInstance";
import { toast } from "react-toastify";
import { CustomButton } from "../../../../components/UI/CustomButton";
import { GoIssueClosed } from "react-icons/go";


function IssueModal({
    show,
    onHandleShow,
    id,
    CurrentLocation,
    ToLocation,
    tolocationid,
    CurrentLocationId
}) {
    const { t } = useTranslation();
    console.log(id,
        CurrentLocation,
        ToLocation,
        tolocationid,
        CurrentLocationId, "here us the data ");
    const theme = useLocalStorage("theme", "get");
    const { pathname } = useLocation();

    const [tableData, setTableData] = useState([]);
    const [subtableData, setSubTableData] = useState([]);
    const [selectedRow, setSelectedRow] = useState(null);
    const [issueItems, setIssueItems] = useState([]);
    const [rowPayloads, setRowPayloads] = useState({});
    const [rejectPayloads, setRejectPayloads] = useState({});
    const [payload, setPayload] = useState({
        QuickIssue: "",
    });
    const [maxIssueQty, setMaxIssueQty] = useState(0);

    const isMobile = window.innerWidth < 768;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setPayload((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? (checked ? "1" : "0") : value,
        }));
    };

    const handleIssueQtyChange = (e, index, availQty) => {
        const value = e.target.value;
        const entered = Number(value);

        // if (entered > maxIssueQty) {
        //         toast.warning(`Can Not Issue More Than Requested Qty`);
        //        return;
        //     }

        if (entered > Number(availQty || 0)) {
            toast.warning(`Can Not Issue More Than Available Qty`);
            return;
        }
        setRowPayloads((prev) => ({
            ...prev,
            [index]: {
                ...prev[index],
                issueQty: value,
            },
        }));
    };
    const handleRejectChange = (e, index, row) => {
        const { name, value } = e.target;

        if (name === "rejectQty") {
            const maxReject = Math.max(
                Number(row?.approvedQty || 0) - Number(row?.pendingQty || 0),
                0
            );
            if (Number(value) > maxReject) {
                toast.error(`Reject Qty cannot exceed ${maxReject}`);
                return;
            }
        }

        setRejectPayloads((prev) => ({
            ...prev,
            [index]: {
                ...prev[index],
                [name]: value,
            },
        }));
    };

    const handleReset = () => {
        setPayload({ QuickIssue: "" });
        setRowPayloads({});
        setRejectPayloads({});
        setSelectedRow(null);
        setSubTableData([]);
        setIssueItems([]);
        setMaxIssueQty(0);
    };

    const handleItemDetail = (id) => {
        axiosInstance
            .get("StoreIndentRePrint/BindItemDetail", {
                params: {
                    locationId: String(tolocationid) || "0",
                    indentNo: String(id) || "",
                },
            })
            .then((res) => {
                setTableData(res?.data?.message);
            })
            .catch(() => console.log("Something went wrong"));
    };

    useEffect(() => {
        handleItemDetail(id);
    }, [id]);

    const handleItemClick = (row, index) => {
        setSelectedRow(index);
        setRowPayloads({});

        const remainingQty = Math.max(
            Number(row.approvedQty || 0) - Number(row.pendingQty || 0),
            0
        );
        setMaxIssueQty(remainingQty);

        axiosInstance
            .post("StoreIndentIssue/GetStockIndent", {
                ItemId: String(row.itemId),
                LocationId: String(tolocationid) || "0",
                StockId: "",
            })
            .then((res) => {
                const data = res?.data?.message;
                const stockList = Array.isArray(data) ? data : data ? [data] : [];
                // const prefilled = {};
                // stockList.forEach((_, i) => {
                //     prefilled[i] = { issueQty: remainingQty };
                // });
                //setRowPayloads(prefilled);
                setSubTableData(stockList);
            })
            .catch(console.error);
    };

    const handleIssue = (row, subIndex) => {
        const enteredQty = rowPayloads[subIndex]?.issueQty;
        const issueQty = Number(
            enteredQty ??
            (
                Number(row?.AvailQty || 0) >= Number(maxIssueQty || 0)
                    ? maxIssueQty
                    : 0
            )
        );
        if (!issueQty) {
            toast.error("Please enter Issue Qty");
            return;
        }
        const selectedItem = tableData[selectedRow];
        const newItem = {
            indentNo: id,
            itemid: selectedItem?.itemId,
            stockid: row?.stockID,
            issueqty: issueQty,
            BarcodeNo: row?.barcodeno,
            BatchNumber: row?.BatchNumber,
            ExpiryDate: row?.ExpiryDate,
            UnitPrice: row?.UnitPrice || 0,
            StockID: row?.StockID || 0,
        };
        setIssueItems((prev) => [...prev, newItem]);
        setSubTableData([]);
        setTableData((prev) =>
            prev.map((item, i) =>
                i === selectedRow
                    ? {
                        ...item,
                        pendingQty:
                            Number(item.pendingQty || 0) + issueQty,
                    }
                    : item
            )
        );
    };
    const handleRemoveIssue = (index) => {
        setIssueItems((prev) => prev.filter((_, i) => i !== index));
    };

    const openPdfInNewTab = (data) => {
        const url = URL.createObjectURL(
            new Blob([data], { type: "application/pdf" })
        );
        window.open(url, "_blank");
        setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 1000);
    };

    const handleRecept = async (batchNumber, indentNo) => {
        try {
            const batchRes = await axiosReport.post(
                "StoreReports/IndentIssueReciept",
                { Type: "1", BatchNumber: batchNumber },
                { responseType: "blob" }
            );
            openPdfInNewTab(batchRes.data);
            const indentRes = await axiosReport.post(
                "StoreReports/IndentIssueReciept",
                { Type: "2", IndentNo: indentNo },
                { responseType: "blob" }
            );

            openPdfInNewTab(indentRes.data);

        } catch (err) {
            console.error("Receipt error:", err);
            toast.error(err?.response?.data?.message);
        }
    };

    const handleIssueAll = () => {
        if (!issueItems.length) {
            toast.error("Please select item to issue");
            return;
        }
        const issuePayload = issueItems.map((item) => ({
            ...item,
            itemid: String(item.itemid),
            issueqty: String(item.issueqty),
            StockID: String(item.StockID),
        }));
        axiosInstance
            .post("StoreIndentIssue/IssueItem", issuePayload)
            .then((res) => {
                if (res?.data?.success) {
                    toast.success(res.data.message);
                    const parts = res.data.message.split("#");
                    const batchNumber = parts[2];
                    const indentNo = parts[1];
                    if (indentNo && batchNumber) {
                        handleRecept(indentNo, batchNumber);
                    }
                    setIssueItems([]);
                    onHandleShow();
                    setPayload({ QuickIssue: "" });
                    setRowPayloads({});
                    setRejectPayloads({});
                    setSelectedRow(null);
                    setSubTableData([]);
                    setMaxIssueQty(0);

                } else {
                    toast.error(res.data.message);
                }
            })
            .catch((err) => {
                toast.error(err?.response?.data?.message);
            }
            );
    };


    const handleDltRow = (row, index) => {
        const maxReject = Math.max(
            Number(row?.approvedQty || 0) - Number(row?.pendingQty || 0),
            0
        );

        const rejectQty = rejectPayloads[index]?.rejectQty ?? maxReject;
        const rejectReason = rejectPayloads[index]?.rejectReason;

        if (!String(rejectQty).trim()) {
            toast.error("Please enter Reject Qty");
            return;
        }
        if (Number(rejectQty) > maxReject) {
            toast.error(`Reject Qty cannot exceed ${maxReject}`);
            return;
        }
        if (!rejectReason || !String(rejectReason).trim()) {
            toast.error("Please enter Reject Reason");
            return;
        }

        axiosInstance
            .post("StoreIndentIssue/RejectIndent", {
                IndentNo: id,
                rejectqty: Number(rejectQty),
                Reason: rejectReason,
            })
            .then((res) => {
                if (res?.data?.success) {
                    toast.success(res?.data?.message);
                    onHandleShow();
                } else {
                    toast.error(res?.data?.message);
                }
            })
            .catch((err) => {
                toast.error(err?.response?.data?.message);
                console.log(err);
            });
    };

    const handleBarcodeSearch = (barcode) => {
        axiosInstance
            .post("StoreIndentIssue/GetItemIdFromBarcode", {
                BarcodeNo: barcode,
                LocationId: String(CurrentLocationId),
            })
            .then((res) => {
                const itemStock = res?.data?.message?.[0]?.ItemStock;

                if (!itemStock) {
                    toast.error("Barcode not found");
                    return;
                }

                const [itemId, stockId] = itemStock.split("#");

                const index = tableData.findIndex(
                    (item) => Number(item.itemId) === Number(itemId)
                );

                if (index === -1) {
                    toast.error("Item not found in indent");
                    return;
                }

                const selectedItem = tableData[index];

                axiosInstance
                    .post("StoreIndentIssue/GetStockIndent", {
                        ItemId: String(itemId),
                        LocationId: String(CurrentLocationId),
                        StockId: stockId,
                    })
                    .then((res) => {
                        const data = res?.data?.message;
                        const stockList = Array.isArray(data) ? data : data ? [data] : [];

                        if (!stockList.length) {
                            toast.error("Stock not found");
                            return;
                        }

                        const stockRow = stockList.find(
                            (s) => String(s.StockID).trim() === String(stockId).trim()
                        );

                        if (!stockRow) {
                            toast.error("Stock not matched");
                            return;
                        }

                        const newItem = {
                            indentNo: id,
                            itemid: selectedItem.itemId,
                            stockId: stockRow.StockID,
                            issueqty: Number(selectedItem?.approvedQty || 0),
                            BarcodeNo: stockRow.barcodeno,
                            BatchNumber: stockRow.BatchNumber,
                            ExpiryDate: stockRow.ExpiryDate,
                            UnitPrice: stockRow.UnitPrice || 0,
                        };
                        setIssueItems((prev) => [...prev, newItem]);
                        setTableData((prev) =>
                            prev.map((item, i) =>
                                i === index
                                    ? {
                                        ...item,
                                        pendingQty:
                                            Number(item.pendingQty || 0) +
                                            Number(item.approvedQty || 0),
                                    }
                                    : item
                            )
                        );
                        // optional reset
                        setPayload((prev) => ({ ...prev, QuickIssue: "" }));

                        toast.success("Item issued via barcode");
                    });
            })
            .catch(console.error);
    };
    const totalAmount = issueItems.reduce(
        (sum, item) => sum + Number(item.UnitPrice || 0) * Number(item.issueqty || 0),
        0
    );

    const colorCodingData = [
        { color: "#FFE4C4", id: "1", labelKey: "New" },
        { color: "#ffffff", id: "2", labelKey: "Issued" },
        { color: "#90EE90", id: "3", labelKey: "Close" },
        { color: "#FFC0CB", id: "4", labelKey: "Reject" },
        { color: "#FFFF00", id: "5", labelKey: "Partial Issue" },
        { color: "#D3D3D3", id: "6", labelKey: "Partial Receive" },
    ];

    return (
        <>
            <Dialog
                header={t("ISSUE DETAILS")}
                visible={show}
                className={theme}
                onHide={onHandleShow}
                style={{ width: isMobile ? "30vw" : "100vw" }}
            >
                <div className="p-3">
                    <div className="row px-2 py-2">
                        <Input
                            type="text"
                            placeholder=" "
                            label="Indent No"
                            id="indentNo"
                            name="indentNo"
                            disabled
                            value={id}
                            onChange={handleChange}
                            respclass="col-xl-2 col-sm-4 col-md-6 col-12"
                        />
                        <div className="col-sm-5">
                            <b>Current Location :</b> {CurrentLocation}
                        </div>
                        <div className="col-sm-4">
                            <b>Indent From :</b> {ToLocation}
                        </div>
                        <div className="col-sm-0">
                            {/* <button className="btn btn-danger btn-sm" onClick={handleReset}>
                                    {t("Reset")}
                                </button> */}
                            <CustomButton icon={"refresh"} text={"Reset"} onClick={handleReset} />
                        </div>
                    </div>

                    <Heading
                        name={"Indent Detail"}
                        isBreadcrumb={true}
                        secondTitle={
                            <>
                                {colorCodingData?.map(({ color, labelKey, id }) => (
                                    <ColorCodingSearch key={id} color={color} label={t(labelKey)} />
                                ))}
                            </>
                        }
                    />

                    <div className="row">
                        <div className="col-md-6 col-12">
                            <div className="table-scroll">
                                <Tables>
                                    <thead>
                                        <tr>
                                            <th style={{ width: "5%" }}>{t("Sr.No.")}</th>
                                            <th style={{ width: "10%" }}>{t("Item Id")}</th>
                                            <th>{t("Item Name")}</th>
                                            <th>{t("Unit")}</th>
                                            <th style={{ width: "8%" }}>{t("Approved Qty")}</th>
                                            <th style={{ width: "8%" }}>{t("Reject Qty")}</th>
                                            <th style={{ width: "8%" }}>{t("Receive Qty")}</th>
                                            <th style={{ width: "8%" }}>{t("Issue Qty")}</th>
                                            <th style={{ width: "8%" }}>{t("Available Qty")}</th>
                                            <th>{t("Reject")}</th>
                                        </tr>
                                    </thead>
                                    {/* <tbody>
                                        {tableData?.map((row, index) => (
                                            <tr
                                                key={index}
                                                style={{
                                                    backgroundColor: issueItems.some(
                                                        (item) => item.itemid === row.itemId
                                                    )
                                                        ? "#b1ff88"
                                                        : selectedRow === index
                                                            ? "skyblue"
                                                            : row?.rowColor,
                                                }}
                                            >
                                                <td data-title="#">{index + 1}</td>
                                                <td data-title="Item Id">{row?.itemId}</td>
                                                <td data-title="Item Name">
                                                    {row?.approvedQty !== row?.pendingQty ? (
                                                        <span style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
                                                            <a
                                                                href="/#"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    handleItemClick(row, index);
                                                                }}
                                                            >
                                                                {row?.itemName}
                                                            </a>
                                                        </span>
                                                    ) : (
                                                        row?.itemName
                                                    )}
                                                </td>
                                                <td data-title="Unit">
                                                    <span style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
                                                        {row?.minorUnitName}
                                                    </span>
                                                </td>
                                                <td data-title="Approved Qty">{row?.approvedQty}</td>
                                                <td data-title="Approved Qty">{row?.rejectQty}</td>

                                                <td data-title="Receive Qty">{row?.receiveQty}</td>
                                                <td data-title="Issue Qty">{row?.pendingQty}</td>
                                                <td data-title="Available Qty">
                                                    {row?.ablQty <= 0 ? (
                                                        <>
                                                            {row?.ablQty}{" "}
                                                            <span style={{ color: "red" }}>Not in Stock</span>
                                                        </>
                                                    ) : (
                                                        row?.ablQty
                                                    )}
                                                </td>

                                                {row?.approvedQty !== row?.pendingQty ? (
                                                    <td data-title="Reject">
                                                        <Input
                                                            type="number"
                                                            placeholder=" "
                                                            lable="Reject Qty"
                                                            id={`rejectQty-${index}`}
                                                            name="rejectQty"
                                                            value={
                                                                rejectPayloads[index]?.rejectQty ??
                                                                Math.max(
                                                                    Number(row?.approvedQty || 0) - Number(row?.pendingQty || 0) - Number(row?.rejectQty || 0),
                                                                    0
                                                                )
                                                            }
                                                            onChange={(e) => handleRejectChange(e, index, row)}
                                                            respclass="col-12"
                                                        />
                                                        <Input
                                                            type="text"
                                                            placeholder=" "
                                                            lable="Reject Reason"
                                                            id={`rejectReason-${index}`}
                                                            name="rejectReason"
                                                            value={rejectPayloads[index]?.rejectReason || ""}
                                                            onChange={(e) => handleRejectChange(e, index)}
                                                            respclass="col-12"
                                                        />
                                                        <i
                                                            onClick={() => handleDltRow(row, index)}
                                                            aria-label="Reject row"
                                                        >
                                                            ❌
                                                        </i>
                                                    </td>
                                                ) : (
                                                    <td />
                                                )}
                                            </tr>
                                        ))}
                                    </tbody> */}
                                    <tbody>
                                        {tableData?.map((row, index) => {
                                            const remaining = Math.max(
                                                Number(row?.approvedQty || 0) -
                                                Number(row?.pendingQty || 0) -
                                                Number(row?.rejectQty || 0),
                                                0
                                            );

                                            return (
                                                <tr
                                                    key={index}
                                                    style={{
                                                        backgroundColor: issueItems.some(
                                                            (item) => item.itemid === row.itemId
                                                        )
                                                            ? "#b1ff88"
                                                            : selectedRow === index
                                                                ? "skyblue"
                                                                : row?.rowColor,
                                                    }}
                                                >
                                                    <td data-title="#"> {index + 1} </td>

                                                    <td data-title="Item Id">{row?.itemId}</td>

                                                    <td data-title="Item Name">
                                                        {remaining > 0 ? (
                                                            <span
                                                                style={{
                                                                    wordWrap: "break-word",
                                                                    whiteSpace: "normal",
                                                                }}
                                                            >
                                                                <a
                                                                    href="/#"
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        handleItemClick(row, index);
                                                                    }}
                                                                >
                                                                    {row?.itemName}
                                                                </a>
                                                            </span>
                                                        ) : (
                                                            row?.itemName
                                                        )}
                                                    </td>

                                                    <td data-title="Unit">
                                                        <span
                                                            style={{
                                                                wordWrap: "break-word",
                                                                whiteSpace: "normal",
                                                            }}
                                                        >
                                                            {row?.minorUnitName}
                                                        </span>
                                                    </td>

                                                    <td data-title="Approved Qty">{row?.approvedQty}</td>

                                                    <td data-title="Reject Qty">{row?.rejectQty}</td>

                                                    <td data-title="Receive Qty">{row?.receiveQty}</td>

                                                    <td data-title="Issue Qty">{row?.pendingQty}</td>

                                                    <td data-title="Available Qty">
                                                        {row?.ablQty <= 0 ? (
                                                            <>
                                                                {row?.ablQty}{" "}
                                                                <span style={{ color: "red" }}>
                                                                    Not in Stock
                                                                </span>
                                                            </>
                                                        ) : (
                                                            row?.ablQty
                                                        )}
                                                    </td>

                                                    {remaining > 0 ? (
                                                        <td data-title="Reject">
                                                            <Input
                                                                type="number"
                                                                placeholder=" "
                                                                lable="Reject Qty"
                                                                id={`rejectQty-${index}`}
                                                                name="rejectQty"
                                                                value={
                                                                    rejectPayloads[index]?.rejectQty ?? remaining
                                                                }
                                                                onChange={(e) =>
                                                                    handleRejectChange(e, index, row)
                                                                }
                                                                respclass="col-12"
                                                            />

                                                            <Input
                                                                type="text"
                                                                placeholder=" "
                                                                lable="Reject Reason"
                                                                id={`rejectReason-${index}`}
                                                                name="rejectReason"
                                                                value={
                                                                    rejectPayloads[index]?.rejectReason || ""
                                                                }
                                                                onChange={(e) =>
                                                                    handleRejectChange(e, index)
                                                                }
                                                                respclass="col-12"
                                                            />

                                                            <i
                                                                onClick={() => handleDltRow(row, index)}
                                                                aria-label="Reject row"
                                                                style={{ cursor: "pointer" }}
                                                            >
                                                                ❌
                                                            </i>
                                                        </td>
                                                    ) : (
                                                        <td />
                                                    )}
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </Tables>
                            </div>
                        </div>
                        <div className="col-md-6 col-12">
                            <div className="row px-2 py-2">
                                <Input
                                    type="text"
                                    lable="Scan Barcode For Quick Issue"
                                    id="QuickIssue"
                                    name="QuickIssue"
                                    value={payload?.QuickIssue}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === "Tab") {
                                            handleBarcodeSearch(e.target.value);
                                        }
                                    }}
                                    onChange={handleChange}
                                    respclass={"col-xl-4 col-sm-4 col-md-6 co-10"}
                                />
                            </div>

                            <div className="table-scroll">
                                <Tables>
                                    <thead>
                                        <tr>
                                            <th>{t("Sr.No.")}</th>
                                            <th>{t("Batch Number")}</th>
                                            <th>{t("Barcode No")}</th>
                                            {/* <th>{t("Remark")}</th> */}
                                            <th>{t("Expiry Date")}</th>
                                            <th>{t("Available Qty")}</th>
                                            <th>{t("Unit")}</th>
                                            <th>{t("Issue Qty")}</th>
                                            <th>{t("Issue")}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {console.log(subtableData, "subtableData")}
                                        {subtableData?.map((row, index) => (
                                            <tr key={index}>
                                                <td data-title="#">{index + 1}</td>
                                                <td data-title="Batch Number">{row?.BatchNumber}</td>
                                                <td data-title="Barcode No">{row?.barcodeno}</td>
                                                <td data-title="Expiry Date">{row?.ExpiryDate}</td>
                                                <td data-title="Available Qty">{row?.AvailQty}</td>
                                                <td data-title="Unit">{row?.MinorUnit}</td>
                                                <td data-title="Issue Qty">
                                                    <Input
                                                        type="number"
                                                        placeholder=" "
                                                        lable="Issue Qty"
                                                        id={`issueQty-${index}`}
                                                        name="issueQty"
                                                        value={
                                                            rowPayloads[index]?.issueQty ??
                                                            (
                                                                Number(row?.AvailQty || 0) >= Number(maxIssueQty || 0)
                                                                    ? maxIssueQty
                                                                    : ""
                                                            )
                                                        }
                                                        // onChange={(e) =>
                                                        //     handleIssueQtyChange(
                                                        //         e,
                                                        //         index,
                                                        //         Math.min(
                                                        //             Number(row?.AvailQty || 0),
                                                        //             Number(maxIssueQty || 0)
                                                        //         )
                                                        //     )
                                                        // }
                                                        onChange={(e) => {
                                                            const value = e.target.value.replace(/\D/g, "");
                                                            handleIssueQtyChange(
                                                                {
                                                                    ...e,
                                                                    target: {
                                                                        ...e.target,
                                                                        value,
                                                                    },
                                                                },
                                                                index,
                                                                Math.min(
                                                                    Number(row?.AvailQty || 0),
                                                                    Number(maxIssueQty || 0)
                                                                )
                                                            );
                                                        }}
                                                        respclass="col-12"
                                                    />
                                                </td>
                                                <td data-title="Issue">
                                                    <button
                                                        onClick={() => handleIssue(row, index)}
                                                        aria-label="Issue item"
                                                    >
                                                        <GoIssueClosed />
                                                    </button>


                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Tables>
                            </div>
                        </div>
                    </div>

                    <Accordion title={t(" ")} defaultValue={true} notOpen={true}>
                        <div className="row">
                            <div className="col-sm-12">
                                <Tables>
                                    <thead>
                                        <tr>
                                            <th>{t("Sr.No.")}</th>
                                            <th>{t("Indent No")}</th>
                                            <th>{t("Item Name")}</th>
                                            <th>{t("Barcode No")}</th>
                                            <th>{t("Batch No")}</th>
                                            <th>{t("Expiry Date")}</th>
                                            <th>{t("Unit Price")}</th>
                                            <th>{t("Issue Qty")}</th>
                                            <th>{t("Total Amount")}</th>
                                            <th>{t("Remove")}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {issueItems?.map((row, index) => (
                                            <tr key={index}>
                                                <td data-title="Sr.No.">{index + 1}</td>
                                                <td data-title="Indent No">{row?.indentNo}</td>
                                                <td data-title="Item Name">{row?.itemid}</td>
                                                <td data-title="Barcode No">{row?.BarcodeNo}</td>
                                                <td data-title="Batch No">{row?.BatchNumber}</td>
                                                <td data-title="Expiry Date">{row?.ExpiryDate}</td>
                                                <td data-title="Unit Price">{row?.UnitPrice}</td>
                                                <td data-title="Issue Qty">{row?.issueqty}</td>
                                                <td data-title="Total Amount">
                                                    {row?.UnitPrice * row?.issueqty}
                                                </td>
                                                <td data-title="Remove">
                                                    <button
                                                        onClick={() => handleRemoveIssue(index)}
                                                        aria-label="Remove item"
                                                    >
                                                        ❌
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Tables>
                            </div>
                        </div>

                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "10px", marginTop: "10px" }}>
                            <Input
                                type="text"
                                placeholder=" "
                                label="Total Amount"
                                id="totalAmount"
                                name="totalAmount"
                                value={totalAmount}
                                respclass="col-xl-2 col-sm-4 col-md-6 col-12"
                            />
                            {/* <button className="btn btn-danger btn-sm" onClick={handleIssueAll}>
                                    {t("Issue All")}
                                </button> */}
                            <CustomButton icon={"save"} text={"Issue All"} onClick={handleIssueAll} />
                        </div>
                    </Accordion>

                </div>
            </Dialog >
        </>
    );
}

export default IssueModal;