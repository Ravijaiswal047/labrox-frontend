

import React, { useRef } from "react";
import { useState } from "react";
// import "./BulkSettlementPayment.css";
import { useEffect } from "react";
import { getPaymentModes } from "../../utils/NetworkApi/commonApi";
import Heading from "../../components/UI/Heading";
import Accordion from "@app/components/UI/Accordion";
import { PayBy } from "../../utils/Constants";
import { dateConfig, number, Time, toNumber } from "../../utils/helpers";
import DatePicker from "../../components/formComponent/DatePicker";
import CustomTimePicker from "../../components/formComponent/TimePicker";
import { SelectBox } from "../../components/formComponent/SelectBox";
import Loading from "../../components/loader/Loading";
import { toast } from "react-toastify";
import moment from "moment";
import { axiosInstance } from "../../utils/axiosInstance";
import { useTranslation } from "react-i18next";
import Tables from "../../components/UI/customTable";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { apiUrls } from "../../utils/apiUrls";
import { notify } from "../../utils/utils";
import Input from "../../components/formComponent/Input";
import { SearchButton } from "../../components/UI/CustomButton";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { AutoComplete } from "primereact/autocomplete";
import "./AdvancePayment.css";

const AdvanceSettlement = () => {
    const { t } = useTranslation();
    const [paymentMode, setPaymentMode] = useState([]);
    const [BankName, setBankName] = useState([]);
    const [load, setLoad] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingSecond, setLoadingSecond] = useState(false);
    const [CentreData, setCentreData] = useState([]);
    const [formTable, setFormTable] = useState([]);
    const [originalTableData, setOriginalTableData] = useState([]);
    const [rateTypeList, setRateTypeList] = useState([]);
    const [balanceAmount, setBalanceAmount] = useState(0);
    const [selectAllChecked, setSelectAllChecked] = useState(false);
    // Settled invoice (cancel settlement) view state
    const [settledTable, setSettledTable] = useState([]);
    const [isSettledView, setIsSettledView] = useState(false);
    const [settledSelectAll, setSettledSelectAll] = useState(false);
    const [globalRemark, setGlobalRemark] = useState("");
    const [loadingCancel, setLoadingCancel] = useState(false);
    const localData = useLocalStorage("userData", "get");
    const [selectRateType, setSelectRateType] = useState({});
    const [items, setItems] = useState([]);
    const [NumberAccount, setNumberAccount] = useState([]);
    const [labelSlide, setLabelSlide] = useState(false);
    const selectedRateTypeIDRef = useRef("");
    const userdata = useLocalStorage("userData", "get");
    const DefaultCurrencyName = userdata?.DefaultCurrencyName;
    const pathcareValidation = DefaultCurrencyName === "KES"

    const [parentControls, setParentControls] = useState({
        PayBy: "1",
        PaymentModeID: "134",
        PaymentMode: "",
        BankName: "",
        CardNo: "",
        TransactionNo: "",
        UpdateRemarks: "",
        applyToAll: false,
        Payment: "",
        Tds: "",
        WriteOff: "",
        NumberAccountID: "",
        AdvancePaymentId: "",
        AdvancePaymentNo: "",
    });
    console.log("parentControls", parentControls);

    const today = new Date();
    const [payload, setPayload] = useState({
        FromDate: new Date(),
        ToDate: new Date(),
        FromTime: "00:00:00",
        ToTime: "23:59:59",
        DueAmount: "1",
        // CentreID: "",
        rateType: "",
        invoiveNo: "",
        issettled: "0"
    });

    // const getAccessCentres = () => {
    //     axiosInstance
    //         .get("Centre/getAccessCentres")
    //         .then((res) => {
    //             let data = res.data.message;
    //             let CentreDataValue = data.map((ele) => {
    //                 return {
    //                     value: ele.CentreID,
    //                     label: ele.Centre,
    //                 };
    //             });
    //             CentreDataValue.unshift({ label: "All Centre", value: "" });
    //             setCentreData(CentreDataValue);
    //         })
    //         .catch((err) => console.log(err));
    // };

    // useEffect(() => {
    //     getAccessCentres();
    // }, []);

    const dateSelect = (value, name) => {
        setPayload({
            ...payload,
            [name]: value,
        });
    };

    const handleSelectChange = (event) => {
        const { name, value } = event.target;
        // if (name === "CentreID") {
        //     getRateTypes(value);
        // }
        if (name === "PaymentModeID") {
            const data = paymentMode?.find((ele) => ele.value == value);
            setParentControls((prev) => ({
                ...prev,
                PaymentModeID: value,
                PaymentMode: data?.label || "",
                BankName: data?.label || "",
                CardNo: "",
                TransactionNo: "",
            }));
        } else {
            setPayload({ ...payload, [name]: value });
        }
    };

    const handleParentSelectChange = (name, option) => {
        setParentControls((prev) => ({
            ...prev,
            [name]: option?.value,
        }));

        if (name === "PaymentModeID") {
            const data = paymentMode?.find((ele) => ele.value == option?.value);
            setParentControls((prev) => ({
                ...prev,
                PaymentModeID: option?.value,
                PaymentMode: data?.label || "",
                BankName: data?.label || "",
                CardNo: "",
                TransactionNo: data?.TransactionId || "",
            }));
        } else {
            setParentControls({ ...parentControls, [name]: option?.value });
        }
    };

    const handleParentControlChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (type === "checkbox") {
            setParentControls({
                ...parentControls,
                [name]: checked,
            });
        } else {
            setParentControls({
                ...parentControls,
                [name]: value,
            });

            if (name === "PaymentModeID") {
                const selectedPaymentMode = paymentMode.find(
                    (ele) => ele.value == value,
                );
                setParentControls((prev) => ({
                    ...prev,
                    PaymentMode: selectedPaymentMode?.label || "",
                    BankName: selectedPaymentMode?.label || "",
                    CardNo: "",
                    TransactionNo: "",
                }));
            }

            if (name === "Payment") {
                const parentAmount = parseFloat(value) || 0;
                setBalanceAmount(parentAmount); // Set initial balance

                const data = [...formTable];
                if (parentAmount > 0) {
                    recalculateSequentialDistribution(data, parentAmount);
                    setFormTable(data);
                    setOriginalTableData(data);
                } else {

                    const resetData = data.map((row) =>
                        row.isManualAmount
                            ? row
                            : {
                                ...row,
                                NewAmount: "0",
                                Tds: "0",
                                WriteOff: "0",
                            },
                    );
                    setFormTable(resetData);
                    setOriginalTableData(resetData);
                    setBalanceAmount(0);
                }
            }

            if (name === "Tds" || name === "WriteOff") {
                const parentAmount = parseFloat(parentControls.Payment) || 0;
                if (parentAmount > 0) {
                    const data = [...formTable];
                    recalculateSequentialDistribution(data, parentAmount);
                    setFormTable(data);
                    setOriginalTableData(data);
                }
            }
        }
    };

    // Apply parent controls to all selected rows
    const applyParentToSelected = () => {
        const updatedTable = formTable.map((row) => {
            if (row.isChecked) {
                return {
                    ...row,
                    PayBy: parentControls.PayBy,
                    PaymentModeID: parentControls.PaymentModeID,
                    PaymentMode: parentControls.PaymentMode,
                    BankName: parentControls.BankName,
                    CardNo: parentControls.CardNo,
                    TransactionNo: parentControls.TransactionNo,
                    UpdateRemarks: parentControls.UpdateRemarks,
                    Tds: parentControls.Tds,
                    WriteOff: parentControls.WriteOff,
                };
            }
            return row;
        });
        setFormTable(updatedTable);
        setOriginalTableData(updatedTable);
        toast.success("Parent settings applied to all selected rows");
    };

    const applyParentToAll = () => {
        const updatedTable = formTable.map((row) => ({
            ...row,
            PayBy: parentControls.PayBy,
            PaymentModeID: parentControls.PaymentModeID,
            PaymentMode: parentControls.PaymentMode,
            BankName: parentControls.BankName,
            CardNo: parentControls.CardNo,
            TransactionNo: parentControls.TransactionNo,
            UpdateRemarks: parentControls.UpdateRemarks,
            Tds: parentControls.Tds,
            WriteOff: parentControls.WriteOff,
        }));
        setFormTable(updatedTable);
        setOriginalTableData(updatedTable);
        toast.success("Parent settings applied to all rows");
    };

    // Calculate distribution for selected rows
    const calculateDistribution = (
        selectedRows,
        totalAmount,
        tdsAmount,
        writeOffAmount,
    ) => {

        const manualUsed = selectedRows.reduce(
            (sum, row) =>
                row.isManualAmount ? sum + (parseFloat(row.NewAmount) || 0) : sum,
            0,
        );

        const totalUnpaid = selectedRows.reduce(
            (sum, row) =>
                row.isManualAmount ? sum : sum + parseFloat(row.DueAmount || 0),
            0,
        );

        let remainingAmount = parseFloat(totalAmount) - manualUsed;
        let remainingTDS = parseFloat(tdsAmount);
        let remainingWriteOff = parseFloat(writeOffAmount);

        return selectedRows.map((row) => {

            if (row.isManualAmount) {
                const newAmount = parseFloat(row.NewAmount || 0);
                return {
                    ...row,
                    NewAmount: precise_round(newAmount, 2),
                    Tds: precise_round(parseFloat(row.Tds || 0), 2),
                    WriteOff: precise_round(parseFloat(row.WriteOff || 0), 2),
                    PaidAmount: precise_round(
                        parseFloat(row.PaidAmount) + newAmount,
                        2,
                    ),
                };
            }

            if (totalUnpaid === 0) return row;

            const dueAmount = parseFloat(row.DueAmount || 0);
            const percentage = dueAmount / totalUnpaid;

            const distributedTDS = precise_round(remainingTDS * percentage, 2);
            const distributedWriteOff = precise_round(
                remainingWriteOff * percentage,
                2,
            );

            let newAmount = 0;
            if (remainingAmount >= dueAmount - distributedTDS - distributedWriteOff) {
                newAmount = dueAmount - distributedTDS - distributedWriteOff;
                remainingAmount -= newAmount;
            } else if (remainingAmount > 0) {
                newAmount = remainingAmount;
                remainingAmount = 0;
            }

            remainingTDS -= distributedTDS;
            remainingWriteOff -= distributedWriteOff;

            return {
                ...row,
                NewAmount: precise_round(newAmount, 2),
                Tds: precise_round(distributedTDS, 2),
                WriteOff: precise_round(distributedWriteOff, 2),
                PaidAmount: precise_round(parseFloat(row.PaidAmount) + newAmount, 2),
                DueAmount: precise_round(
                    dueAmount - newAmount - distributedTDS - distributedWriteOff,
                    2,
                ),
            };
        });
    };

    // Sequential distribution function
    const recalculateSequentialDistribution = (data, totalAmount) => {
        const tdsAmount = parseFloat(parentControls.Tds) || 0;
        const writeOffAmount = parseFloat(parentControls.WriteOff) || 0;


        const manualUsed = data.reduce((sum, row) => {
            if (row.isChecked && row.isManualAmount) {
                return (
                    sum +
                    (parseFloat(row.NewAmount) || 0) +
                    (parseFloat(row.Tds) || 0) +
                    (parseFloat(row.WriteOff) || 0)
                );
            }
            return sum;
        }, 0);

        let remainingAmount = totalAmount - manualUsed;

        // Only auto-distributed checked rows are reset and refilled.
        const checkedRows = data.filter(
            (row) => row.isChecked && !row.isManualAmount,
        );

        data.forEach((row) => {
            if (row.isChecked && !row.isManualAmount) {
                row.NewAmount = "0";
                row.Tds = "0";
                row.WriteOff = "0";
            }
        });

        // Calculate total due for percentage distribution of TDS and WriteOff
        const totalDue = checkedRows.reduce(
            (sum, row) => sum + parseFloat(row.DueAmount || 0),
            0,
        );

        // Distribute sequentially to checked rows
        for (let row of checkedRows) {
            if (remainingAmount <= 0) break;

            const dueAmount = parseFloat(row.DueAmount) || 0;
            const percentage = totalDue > 0 ? dueAmount / totalDue : 0;

            // Calculate TDS and WriteOff for this row
            const distributedTDS = precise_round(tdsAmount * percentage, 2);
            const distributedWriteOff = precise_round(writeOffAmount * percentage, 2);

            // Calculate available amount for payment (after TDS and WriteOff)
            const availableForPayment =
                dueAmount - distributedTDS - distributedWriteOff;

            let newAmount = 0;
            if (remainingAmount >= availableForPayment) {
                newAmount = availableForPayment;
                remainingAmount -= newAmount;
            } else if (remainingAmount > 0) {
                newAmount = remainingAmount;
                remainingAmount = 0;
            }

            if (newAmount > 0) {
                row.NewAmount = precise_round(newAmount, 2).toString();
                row.Tds = distributedTDS.toString();
                row.WriteOff = distributedWriteOff.toString();
            }
        }

        // Update balance amount
        setBalanceAmount(remainingAmount);

        return remainingAmount;
    };

    // Redistribution function
    const redistributeRemainingAmount = (data, availableAmount) => {
        if (availableAmount <= 0) return;

        const checkedRows = data.filter(
            (row) =>
                row.isChecked &&
                !row.isManualAmount &&
                parseFloat(row.NewAmount || 0) < parseFloat(row.DueAmount || 0),
        );

        const tdsAmount = parseFloat(parentControls.Tds) || 0;
        const writeOffAmount = parseFloat(parentControls.WriteOff) || 0;
        const totalDue = checkedRows.reduce(
            (sum, row) => sum + parseFloat(row.DueAmount || 0),
            0,
        );

        let remainingAmount = availableAmount;

        // Distribute the available amount to rows that can take more
        for (let row of checkedRows) {
            if (remainingAmount <= 0) break;

            const currentAmount = parseFloat(row.NewAmount) || 0;
            const dueAmount = parseFloat(row.DueAmount) || 0;
            const percentage = totalDue > 0 ? dueAmount / totalDue : 0;

            // Recalculate TDS and WriteOff for this row
            const distributedTDS = precise_round(tdsAmount * percentage, 2);
            const distributedWriteOff = precise_round(writeOffAmount * percentage, 2);

            const remainingCapacity =
                dueAmount - currentAmount - distributedTDS - distributedWriteOff;

            if (remainingCapacity > 0) {
                const additionalAmount = Math.min(remainingAmount, remainingCapacity);
                row.NewAmount = precise_round(
                    currentAmount + additionalAmount,
                    2,
                ).toString();
                row.Tds = distributedTDS.toString();
                row.WriteOff = distributedWriteOff.toString();
                remainingAmount = precise_round(remainingAmount - additionalAmount, 2);
            }
        }

        // Update balance amount
        setBalanceAmount(remainingAmount);
    };

    // Balance calculation function
    const recalculateBalanceAmount = (data) => {
        const parentAmount = parseFloat(parentControls.Payment) || 0;
        const totalAllocated = data.reduce(
            (sum, row) => sum + parseFloat(row.NewAmount || 0),
            0,
        );
        const totalTDS = data.reduce(
            (sum, row) => sum + parseFloat(row.Tds || 0),
            0,
        );
        const totalWriteOff = data.reduce(
            (sum, row) => sum + parseFloat(row.WriteOff || 0),
            0,
        );

        const totalUsed = totalAllocated + totalTDS + totalWriteOff;
        const remainingBalance = precise_round(parentAmount - totalUsed, 2);

        setBalanceAmount(remainingBalance > 0 ? remainingBalance : 0);
    };

    // for only selected Row
    const updateSettlementToSelectedRow = () => {
        let settlement = parseFloat(parentControls?.Payment) || 0;
        let tdsAmount = parseFloat(parentControls?.Tds) || 0;
        let writeOffAmount = parseFloat(parentControls?.WriteOff) || 0;

        let selectedRows = formTable?.filter((item) => item?.isChecked);


        const hasAutoRow = selectedRows?.some((row) => !row.isManualAmount);

        if (hasAutoRow && (!settlement || settlement <= 0)) {
            notify("Kindly enter amount", "warn");
            return;
        }
        if (selectedRows?.length === 0) {
            notify("Kindly select row", "warn");
            return;
        }

        // Calculate total payment including TDS and WriteOff
        const totalPayment = settlement + tdsAmount + writeOffAmount;
        const totalDue = selectedRows.reduce(
            (sum, row) => sum + parseFloat(row.DueAmount || 0),
            0,
        );

        // if (totalPayment > totalDue) {
        //   notify("Total payment cannot exceed total due amount", "warn");
        //   return;
        // }

        const updatedSelectedRows = calculateDistribution(
            selectedRows,
            settlement,
            tdsAmount,
            writeOffAmount,
        );

        const updatedTable = formTable.map((row) => {
            const updatedRow = updatedSelectedRows.find(
                (updated) => updated.LedgerTransactionNo === row.LedgerTransactionNo,
            );
            if (updatedRow) {
                return {
                    ...row,
                    ...updatedRow,
                    PaymentModeID: parentControls.PaymentModeID,
                    PaymentMode: parentControls.PaymentMode,
                    BankName: parentControls.BankName,
                    CardNo: parentControls.CardNo,
                    TransactionNo: parentControls.TransactionNo,
                    UpdateRemarks: parentControls.UpdateRemarks,

                };
            }
            return row;
        });

        setFormTable(updatedTable);
        setOriginalTableData(updatedTable);

        // Recalculate balance after distribution
        recalculateBalanceAmount(updatedTable);

        // Reset parent controls
        setParentControls((prev) => ({
            ...prev,
            Payment: "",
            CardNo: "",
            Tds: "",
            WriteOff: "",
        }));

        const selectedForSubmit = updatedTable.filter(
            (row) => row.isChecked && row.NewAmount > 0,
        );
        if (selectedForSubmit.length > 0) {
            submit(selectedForSubmit);
        }
    };

    // Applied to all table row
    const updateSettlementAllRow = () => {
        let settlement = parseFloat(parentControls?.Payment) || 0;
        let tdsAmount = parseFloat(parentControls?.Tds) || 0;
        let writeOffAmount = parseFloat(parentControls?.WriteOff) || 0;

        if (!settlement || settlement <= 0) {
            notify("Kindly enter amount", "warn");
            return;
        }

        const allRows = [...originalTableData];
        const totalDue = allRows.reduce(
            (sum, row) => sum + parseFloat(row.DueAmount || 0),
            0,
        );
        const totalPayment = settlement + tdsAmount + writeOffAmount;

        if (totalPayment > totalDue) {
            notify("Total payment cannot exceed total due amount", "warn");
            return;
        }

        const updatedAllRows = calculateDistribution(
            allRows,
            settlement,
            tdsAmount,
            writeOffAmount,
        );

        const finalTable = updatedAllRows.map((row) => ({
            ...row,
            PaymentModeID: parentControls.PaymentModeID,
            PaymentMode: parentControls.PaymentMode,
            BankName: parentControls.BankName,
            CardNo: parentControls.CardNo,
            TransactionNo: parentControls.TransactionNo,
            UpdateRemarks: parentControls.UpdateRemarks,

        }));

        setFormTable(finalTable);
        setOriginalTableData(finalTable);

        // Recalculate balance after distribution
        recalculateBalanceAmount(finalTable);

        setParentControls((prev) => ({
            ...prev,
            Payment: "",
            Tds: "",
            WriteOff: "",
        }));

        submit(finalTable.filter((row) => row.NewAmount > 0));
    };

    const handleTime = (time, name) => {
        setPayload({ ...payload, [name]: time });
    };

    const handleChanges = (e) => {
        const { name, value, checked, type } = e.target;
        setPayload({
            ...payload,
            [name]: type === "checkbox" ? (checked ? "1" : "0") : value,
        });
    };

    const search = (event) => {
        const query = event.query?.toLowerCase() || "";
        const filtered = CentreData?.filter((item) =>
            item.label?.toLowerCase().includes(query),
        );
        setItems(filtered || []);
    };

    const handleAutoCompleteChange = (e) => {
        const val = e.target?.value;
        setSelectRateType(val);
        if (!val || !val?.value) {
            setPayload((prev) => ({ ...prev, rateType: "" }));
            selectedRateTypeIDRef.current = "";
            setNumberAccount([]);
        }
    };

    const handleAutoCompleteSelect = (e) => {
        const selected = e.value;
        if (!selected?.value) return;
        if (selectedRateTypeIDRef.current === String(selected.value)) return;
        selectedRateTypeIDRef.current = String(selected.value);
        setSelectRateType(selected);
        setPayload((prev) => ({ ...prev, rateType: String(selected.value) }));
        getNumberAccount(selected.value);

    };

    const handleToggle = (field) => {
        setPayload((prev) => ({
            ...prev,
            [field]: prev[field] == "1" ? "0" : "1",
        }));
    };

    const handleChangeIndex = (e, index) => {
        const { name, value, type, checked } = e.target;
        const data = [...formTable];

        if (type === "checkbox") {

            const typedAmount = parseFloat(data[index]["NewAmount"]) || 0;
            const hasManualAmount =
                checked && data[index]["isManualAmount"] && typedAmount > 0;

            if (checked && !hasManualAmount) {
                const parentAmount = parseFloat(parentControls.Payment) || 0;

                if (parentAmount <= 0) {
                    notify("Please enter payment amount first", "warn");
                    return;
                }

                // Calculate already allocated amount from other checked rows
                const alreadyAllocated = data.reduce((sum, row, i) => {
                    if (i !== index && row.isChecked) {
                        return sum + (parseFloat(row.NewAmount) || 0);
                    }
                    return sum;
                }, 0);

                const tds = parseFloat(parentControls.Tds) || 0;
                const writeOff = parseFloat(parentControls.WriteOff) || 0;
                const totalUsed = alreadyAllocated + tds + writeOff;
                const remainingBalance = parentAmount - totalUsed;

                // ✅ Use calculated remaining balance, not stale balanceAmount state
                if (remainingBalance <= 0) {
                    notify("Balance amount is zero, cannot select more rows", "warn");
                    return;
                }
            }

            data[index][name] = checked;

            if (checked) {
                if (hasManualAmount) {

                } else {
                    const parentAmount = parseFloat(parentControls.Payment) || 0;
                    if (parentAmount > 0) {
                        recalculateSequentialDistribution(data, parentAmount);
                    } else {
                        const dueAmount = parseFloat(data[index]["DueAmount"]) || 0;
                        data[index]["NewAmount"] = dueAmount.toString();
                        data[index]["Tds"] = "0";
                        data[index]["WriteOff"] = "0";
                    }
                }
            } else {
                const wasManual = data[index]["isManualAmount"];
                const removedAmount = parseFloat(data[index]["NewAmount"]) || 0;
                const removedTDS = parseFloat(data[index]["Tds"]) || 0;
                const removedWriteOff = parseFloat(data[index]["WriteOff"]) || 0;

                data[index]["NewAmount"] = "0";
                data[index]["Tds"] = "0";
                data[index]["WriteOff"] = "0";
                data[index]["isManualAmount"] = false;


                if (!wasManual && removedAmount > 0) {
                    redistributeRemainingAmount(
                        data,
                        removedAmount + removedTDS + removedWriteOff,
                    );
                }
            }

            recalculateBalanceAmount(data);
        } else {
            data[index][name] = value;
        }

        setFormTable(data);
        setOriginalTableData(data);
    };

    const handleParentCheckbox = (e) => {
        const checked = e.target.checked;
        const data = [...formTable];
        const parentAmount = parseFloat(parentControls.Payment) || 0;

        // Update the selectAllChecked state immediately for visual feedback
        setSelectAllChecked(checked);

        if (checked) {
            if (parentAmount <= 0) {
                notify("Please enter payment amount first", "warn");
                setSelectAllChecked(false); // Reset if payment not entered
                return;
            }

            let remainingPayment = parentAmount;
            let anyRowSelected = false;

            for (let i = 0; i < data.length; i++) {
                const rowDue = parseFloat(data[i].DueAmount) || 0;

                if (remainingPayment <= 0) {
                    data[i].isChecked = false;
                    data[i].NewAmount = "0";
                    data[i].Tds = "0";
                    data[i].WriteOff = "0";
                    continue;
                }

                // Determine how much can be settled in this row
                const settleAmount = Math.min(remainingPayment, rowDue);
                data[i].isChecked = true;
                data[i].NewAmount = settleAmount.toString();
                data[i].Tds = "0";
                data[i].WriteOff = "0";

                remainingPayment -= settleAmount;
                anyRowSelected = true;
            }

            if (anyRowSelected) {
                if (remainingPayment > 0) {
                    notify(
                        `Payment partially distributed. Balance: ${remainingPayment.toFixed(2)}`,
                        "info",
                    );
                } else {
                    notify("Payment fully distributed.", "success");
                }
            } else {
                notify(
                    "No rows could be selected with the current payment amount.",
                    "warn",
                );
                setSelectAllChecked(false); // Reset if no rows were selected
            }
        } else {
            data.forEach((row) => {
                row.isChecked = false;
                row.NewAmount = "0";
                row.Tds = "0";
                row.WriteOff = "0";
            });
        }

        setFormTable(data);
        setOriginalTableData(data);
        recalculateBalanceAmount(data);
    };

    const submit = (updatedList = []) => {
        if (updatedList.length === 0) {
            notify("No data to submit", "warn");
            return;
        }

        setLoadingSecond(true);

        const invalidRows = updatedList.filter(
            (row) => !row.PaymentModeID || !row.PaymentMode,
        );

        if (invalidRows.length > 0) {
            notify("Please set payment mode for all selected rows", "warn");
            setLoadingSecond(false);
            return;
        }

        const submissionData = updatedList.map((row) => ({
            ...row,
            NewAmount: parseFloat(row.NewAmount) || 0,
            PaymentModeID: String(row.PaymentModeID),
            Tds: parseFloat(row.Tds) || 0,
            WriteOff: parseFloat(row.WriteOff) || 0,
            AdvancePaymentId: parentControls.AdvancePaymentId,
            AdvancePaymentNo: parentControls.AdvancePaymentNo,
        }));

        axiosInstance
            .post("Settlement/SaveAdvanceBulkSettlementData", {
                SettlementData: submissionData,
                ReceiptNo: String(parentControls.AdvancePaymentNo),
            })
            .then((res) => {
                toast.success(res?.data?.message);
                fetch();
                setLoadingSecond(false);
                getNumberAccount(payload.rateType);
                setParentControls((prev) => ({
                    ...prev,
                    NumberAccountID: "",
                    Payment: "",
                    PaymentModeID: "",
                }));

            })
            .catch((err) => {
                toast.error(
                    err?.response?.data?.message
                        ? err?.response?.data?.message
                        : err?.data?.message,
                );
                setLoadingSecond(false);
            });
    };

    const fetch = () => {
        setLoading(true);
        setBalanceAmount(0);
        if (!payload.rateType) {
            toast.error("Please select Rate type");
            setLoading(false);
            return;
        }
        axiosInstance
            .post("Settlement/GetBulkDataToSettlement", {
                DueAmount: payload?.issettled == 0 ? payload?.DueAmount : "0",
                IsAdvance: 1,
                rateType: Number(payload?.rateType || 0),
                FromDate: moment(payload?.FromDate).format("DD/MMM/YYYY"),
                ToDate: moment(payload?.ToDate).format("DD/MMM/YYYY"),
                FromTime: payload?.FromTime,
                ToTime: payload?.ToTime,
                InvoiceNo: payload?.invoiveNo,
                issettled: Number(payload?.issettled)

            })
            .then((res) => {
                let data = res?.data?.message || [];

                // Settled Invoice view -> render the cancel-settlement table
                if (Number(payload?.issettled) === 1) {
                    const settledVal = data.map((ele) => ({
                        ...ele,
                        isChecked: false,
                        Remarks: "",
                    }));
                    setSettledTable(settledVal);
                    setIsSettledView(true);
                    setSettledSelectAll(false);
                    setGlobalRemark("");
                    setFormTable([]);
                    setOriginalTableData([]);
                    setLoading(false);
                    setLoad(true);
                    return;
                }

                setIsSettledView(false);
                setSettledTable([]);
                let val = data.map((ele) => {
                    return {
                        ...ele,
                        isChecked: false,
                        PayBy: "0",
                        PaymentMode: "",
                        TransactionNo: "",
                        BankName: "",
                        CardNo: "",
                        UpdateRemarks: "",
                        NewAmount: "",
                        S_Currency: "1",
                        S_Notation: "INR",
                        C_Factor: "",
                        S_CountryID: "",
                        S_Amount: "",
                        settmentAmount: "",
                        paymentModeID: "",
                        Tds: "",
                        WriteOff: "",
                        OriginalDueAmount: ele.DueAmount || 0,
                    };
                });
                setFormTable(val);
                setOriginalTableData(val);
                setLoading(false);
                setLoad(true);
            })
            .catch((err) => {
                toast.error(
                    err?.response?.data?.message
                        ? err?.response?.data?.message
                        : err?.data?.message,
                );
                setLoading(false);
            });
    };

    const handleChangeMap = (e, i) => {
        const data = [...formTable];
        console.log("xxdata", data);
        const { name, value } = e.target;
        const inputValue = toNumber(value);

        if (name === "NewAmount") {
            // const dueAmount = parseFloat(data[i]["DueAmount"]) || 0;
            const originalDue = parseFloat(data[i]["OriginalDueAmount"]) || 0;
            const tds = parseFloat(data[i]["Tds"] || 0);
            const writeOff = parseFloat(data[i]["WriteOff"] || 0);
            // console.log("due",dueAmount);
            console.log("parseFloat(value)", parseFloat(value));

            if (inputValue > originalDue - tds - writeOff) {
                toast.error("Please enter valid amount");
                return;
            } else {
                data[i][name] = value;

                data[i]["isManualAmount"] = inputValue > 0;
                // Recalculate DueAmount when NewAmount changes
                data[i]["DueAmount"] = precise_round(
                    originalDue - inputValue - tds - writeOff,
                    2,
                );

                // Recalculate balance
                recalculateBalanceAmount(data);
            }
        } else if (name === "Tds" || name === "WriteOff") {
            data[i][name] = value;
            // Recalculate DueAmount when TDS or WriteOff changes
            const dueAmount = parseFloat(data[i]["DueAmount"]) || 0;
            const newAmount = parseFloat(data[i]["NewAmount"] || 0);
            const tds = parseFloat(data[i]["Tds"] || 0);
            const writeOff = parseFloat(data[i]["WriteOff"] || 0);
            data[i]["DueAmount"] = precise_round(
                dueAmount - newAmount - tds - writeOff,
                2,
            );

            // Recalculate balance
            recalculateBalanceAmount(data);
        } else if (name === "PaymentModeID") {
            const findOne = paymentMode.find((ele) => ele.value == value);
            data[i]["PaymentMode"] = findOne?.label || "";
            data[i]["BankName"] = findOne?.label || "";
            data[i]["CardNo"] = "";
            data[i]["TransactionNo"] = "";
            data[i]["paymentModeID"] = value;
        } else {
            data[i][name] = value;
        }

        setFormTable(data);
        setOriginalTableData(data);
    };

    const HideSave = () => {
        return formTable.some((row) => row.isChecked);
    };

    const validate = (condition, index) => {
        let disable = false;
        let message = "";
        if (condition === "") {
            disable = true;
            message = "Please Choose Payment Mode";
        } else if (["Paytm", "Online Payment"].includes(condition)) {
            if (formTable[index]["TransactionNo"]?.length < (pathcareValidation ? 5 : 10)) {
                disable = true;
                message = "Please Fill Correct Transaction Number";
            }
        } else if (["Debit Card", "Credit Card", "Cheque"].includes(condition)) {
            if (formTable[index]["BankName"] === "") {
                disable = true;
                message = "Please Choose BankName";
            } else if (!pathcareValidation && formTable[index]["CardNo"]?.length < 16) {
                disable = true;
                message = `Please Enter Valid ${condition} Number`;
            }
        }

        return {
            disable: disable,
            message: message,
        };
    };

    const handleReactSelectChange = (name, option) => {
        setPayload((prev) => ({ ...prev, [name]: option?.value }));
    };

    // const getRateTypes = async (id) => {
    //     try {
    //         const res = await axiosInstance.post(apiUrls?.GetRateType, {
    //             CentreId: id ? [id] : [],
    //         });
    //         const list = res?.data?.message.map((item) => ({
    //             label: item?.RateTypeName,
    //             value: item?.RateTypeID,
    //         }));
    //         setRateTypeList(list);
    //     } catch (err) {
    //         console.log(err);
    //     }
    // };

    const getRateType = (value) => {
        axiosInstance
            .post("Centre/BindRateTypeWorkOrderSearch", {
                centreID: 0
            })
            .then((res) => {
                let data = res.data.message;
                let CentreDataValue = data.map((ele) => {
                    const cleanLabel = ele.RateTypeName
                        ?.replace(/\r?\n/g, " ")
                        ?.trim();

                    return {
                        value: String(ele.RateTypeID),
                        label: cleanLabel,
                        name: cleanLabel,
                    };
                });

                setCentreData(CentreDataValue);
            })
            .catch((err) => {
                setCentreData([]);
                console.log(err);
            });
    };

    const getNumberAccount = (rateTypeID) => {
        axiosInstance
            .post("Accounts/GetNumberAccount", {
                clientID: rateTypeID || 0
            })
            .then((res) => {
                let data = res.data.data;
                console.log(data, "NumberAccount data");
                const mapped = data.map((ele) => ({
                    label: ele.ReceiptNo,
                    value: ele.ID,
                    amount: ele.ReceivedAmt,
                    paymentMode: ele.PaymentMode,
                    TransactionId: ele.TransactionId,
                    Remarks: ele.Remarks,
                }));
                setNumberAccount(mapped);
            })
            .catch((err) => {
                console.log(err);
            });
    };
    const handleNumberAccountChange = (name, option) => {
        const selected = NumberAccount.find(
            (item) => item.value === option?.value
        );
        const amount = parseFloat(selected?.amount) || 0;
        const selectedPaymentMode = paymentMode.find(
            (item) =>
                item.label?.toLowerCase() ===
                selected?.paymentMode?.toLowerCase()
        );
        const resetTable = formTable.map((row) => ({
            ...row,
            isChecked: false,
            NewAmount: "",
            Tds: "",
            WriteOff: "",
        }));
        setFormTable(resetTable);
        setOriginalTableData(resetTable);
        setSelectAllChecked(false);
        setBalanceAmount(amount);
        setParentControls((prev) => ({
            ...prev,
            [name]: option?.value,
            Payment: selected?.amount || 0,
            AdvancePaymentId: selected?.value || "",
            AdvancePaymentNo: selected?.label || "",
            PaymentModeID: selectedPaymentMode?.value || "",
            PaymentMode: selectedPaymentMode?.label || "",
            CardNo: selected?.TransactionId || "",
            UpdateRemarks: selected?.Remarks || "",
        }));
        setBalanceAmount(amount);
    };

    const precise_round = (num, decimals) => {
        return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
    };

    // ---- Settled invoice (cancel settlement) handlers ----
    const handleSettledCheck = (e, index) => {
        const checked = e.target.checked;
        const data = [...settledTable];
        data[index].isChecked = checked;
        setSettledTable(data);
        setSettledSelectAll(data.length > 0 && data.every((r) => r.isChecked));
    };

    const handleSettledSelectAll = (e) => {
        const checked = e.target.checked;
        setSettledSelectAll(checked);
        setSettledTable((prev) => prev.map((r) => ({ ...r, isChecked: checked })));
    };

    const cancelSettleBill = () => {
        const selectedRows = settledTable.filter((r) => r.isChecked);
        if (selectedRows.length === 0) {
            notify("Kindly select at least one row", "warn");
            return;
        }

        const cancelReason = globalRemark?.trim() || "";

        if (!cancelReason) {
            toast.error("Kindly enter remarks");
            return;
        }

        setLoadingCancel(true);

        const CancelData = selectedRows.map((r) => ({
            ReceiptNo: r.ReceiptNo,
            LedgerTransactionIDs: r.LedgerTransactionID,
            Amount: parseFloat(r.ReceiptAmount) || 0,
        }));

        axiosInstance
            .post("Settlement/CancelBulkSettlementData", {
                CancelData,
                CancelReason: cancelReason,
            })
            .then((res) => {
                toast.success(res?.data?.message);
                setLoadingCancel(false);
                fetch();
            })
            .catch((err) => {
                toast.error(
                    err?.response?.data?.message
                        ? err?.response?.data?.message
                        : err?.data?.message,
                );
                setLoadingCancel(false);
            });
    };

    useEffect(() => {
        getPaymentModes("PaymentMode", setPaymentMode);
        getPaymentModes("BankName", setBankName);
        getRateType("")
    }, []);

    const searchType = [
        {
            label: t("UnSettled Invoice"),
            value: "0",
        },
        {
            label: t("Settled Invoice"),
            value: "1",
        },
    ]
    const handleReactSelectChange2 = (name, e) => {
        setPayload((prev) => ({ ...prev, [name]: e?.value }));

        if (name === "issettled") {
            // Clear both tables and reset view when search type changes
            setFormTable([]);
            setOriginalTableData([]);
            setSettledTable([]);
            setIsSettledView(false);
            setSettledSelectAll(false);
            setGlobalRemark("");
            setSelectAllChecked(false);
            setBalanceAmount(0);
            setLoad(false);
        }
    };

    return (
        <>
            <Accordion
                name={t("Advance Settlement")}
                defaultValue={true}
                isBreadcrumb={true}
            >
                <div className="row px-2 mt-2 mb-1">
                    {/* <div className="col-sm-2">
                        <SelectBox
                            options={CentreData}
                            id="CentreID"
                            lable="Centre"
                            selectedValue={payload?.CentreID}
                            name="CentreID"
                            onChange={handleSelectChange}
                        />
                    </div> */}

                    <div className="col-sm-2">
                        <span className="p-float-label custom-float-label">
                            <AutoComplete
                                id="rateType"
                                value={selectRateType}
                                suggestions={items}
                                completeMethod={search}
                                field="label"
                                onChange={handleAutoCompleteChange}
                                onSelect={handleAutoCompleteSelect}
                                placeholder=""
                                forceSelection
                                className="w-100 p-inputtext-sm"
                                onFocus={() => setLabelSlide(true)}
                                onBlur={() => {
                                    setLabelSlide(false);
                                    // if (!selectRateType || !selectRateType.value) {
                                    //     setSelectRateType(null);
                                    //     setPayload((prev) => ({ ...prev, rateType: "" }));
                                    //     selectedRateTypeIDRef.current = "";
                                    // }
                                }}
                            />
                            <label
                                className={`rateTypeFloatlabel ${!selectRateType?.value && !labelSlide ? "floatEmpty" : ""
                                    }`}
                                htmlFor="rateType"
                            >
                                {t("Rate Type")}
                            </label>
                        </span>
                    </div>
                    <div className="col-sm-2">
                        <Input
                            type="text"
                            id="invoiveNo"
                            lable="Invoive No."
                            placeholder=" "
                            value={payload?.invoiveNo}
                            onChange={(e) => setPayload((prev) => ({ ...prev, invoiveNo: e.target.value }))}
                        />
                    </div>
                    <div className="col-sm-2">
                        <ReactSelect
                            dynamicOptions={searchType}
                            name="issettled"
                            lable={t("Invoice Type")}
                            id="issettled"
                            removeIsClearable={true}
                            placeholderName={t("Invoice Type")}
                            value={payload?.issettled}
                            onChange={handleReactSelectChange2}

                        />
                    </div>
                    <div className="col-sm-2">
                        <DatePicker
                            name="FromDate"
                            id="FromDate"
                            lable="FromDate"
                            value={payload?.FromDate}
                            onChange={dateSelect}
                            maxDate={new Date(payload?.ToDate)}
                        />
                    </div>
                    <div className="col-sm-1">
                        <CustomTimePicker
                            name="FromTime"
                            placeholder="FromTime"
                            value={payload?.FromTime}
                            id="FromTime"
                            lable="FromTime"
                            onChange={handleTime}
                        />
                    </div>

                    <div className="col-sm-2 ">
                        <div>
                            <DatePicker
                                className="custom-calendar"
                                name="ToDate"
                                value={payload?.ToDate}
                                onChange={dateSelect}
                                placeholder=" "
                                id="ToDate"
                                lable="ToDate"
                                maxDate={new Date()}
                                minDate={new Date(payload?.FromDate)}
                            />
                        </div>
                    </div>
                    <div className="col-sm-1">
                        <CustomTimePicker
                            name="ToTime"
                            placeholder="ToTime"
                            value={payload?.ToTime}
                            id="ToTime"
                            lable="ToTime"
                            onChange={handleTime}
                        />
                    </div>

                    {payload.issettled == 0 && <div className="col-auto d-flex align-items-center justify-content-center p-2" style={{
                        gap: "5px"
                    }}>
                        <label class="switch mb-0">
                            <input
                                type="checkbox"
                                checked={payload.DueAmount == 1 ? true : false}
                                onChange={() => handleToggle("DueAmount")}
                            />
                            <span class="slider"></span>
                        </label>
                        <strong>
                            <span>{t("Only Due Amount")}</span>
                        </strong>
                    </div>}

                    <div className="col-sm-1">
                        <SearchButton
                            text={"Search"}
                            onClick={fetch}
                        />
                    </div>
                </div>
            </Accordion>

            {/* Parent Controls Section */}
            {!isSettledView && formTable.length > 0 && (
                <Accordion
                    title={t("Parent Controls - Apply to All Rows")}
                    defaultValue={true}
                >
                    <div className="row px-2 mt-2 mb-2">
                        <div className="col-sm-2">

                            <ReactSelect
                                className="required-fields"
                                dynamicOptions={PayBy}
                                value={parentControls?.PayBy}
                                name="PayBy"
                                onChange={handleParentSelectChange}
                                label={t("Pay By")}
                                removeIsClearable={true}
                                placeholderName={t("Pay By")}
                                isDisabled={true}
                            />
                        </div>

                        <div className="col-sm-2">
                            <ReactSelect
                                dynamicOptions={NumberAccount}
                                value={parentControls?.NumberAccountID}
                                name="NumberAccountID"
                                onChange={handleNumberAccountChange}
                                label="Receipt No"
                                removeIsClearable={true}
                                placeholderName="Select Receipt"
                            />
                        </div>
                        <div className="col-sm-2">
                            <Input
                                name="Payment"
                                type="number"
                                value={parentControls.Payment}
                                onChange={handleParentControlChange}
                                className="form-control input-sm"
                                disabled={parentControls.NumberAccountID}
                                lable={t("Payment Amount")}
                            />
                        </div>

                        <div className="col-sm-2">

                            <ReactSelect
                                className="required-fields"
                                dynamicOptions={paymentMode}
                                value={parentControls?.PaymentModeID}
                                name="PaymentModeID"
                                onChange={handleParentSelectChange}
                                label={t("Payment Mode")}
                                removeIsClearable={true}
                                placeholderName={t("Payment Mode")}
                                isDisabled={pathcareValidation && parentControls?.NumberAccountID}
                            />
                        </div>

                        {["Cheque", "Credit Card", "Debit Card"].includes(
                            parentControls.PaymentMode,
                        ) && (
                                <div className="col-sm-2">

                                    <ReactSelect
                                        className="required-fields"
                                        dynamicOptions={BankName}
                                        value={parentControls?.BankName}
                                        name="BankName"
                                        onChange={handleParentSelectChange}
                                        label={t("Bank Name")}
                                        removeIsClearable={true}
                                        placeholderName={t("Bank Name")}
                                    />
                                </div>
                            )}

                        {["Cheque"].includes(parentControls.PaymentMode) && (
                            <div className="col-sm-2">
                                <Input
                                    name="CardNo"
                                    type="text"
                                    placeholder={t("Cheque No")}
                                    value={parentControls.CardNo}
                                    onChange={handleParentControlChange}
                                    maxLength={16}
                                    className="form-control input-sm"
                                />
                            </div>
                        )}

                        {["Credit Card", "Debit Card", "M-Pesa"].includes(
                            parentControls.PaymentMode,
                        ) && (
                                <div className="col-sm-2">
                                    <Input
                                        name="CardNo"
                                        placeholder={parentControls.PaymentMode == "M-Pesa" ? t("Reference No") : t("Card No")}
                                        type="text"
                                        value={parentControls.CardNo}
                                        maxLength={16}
                                        onChange={handleParentControlChange}
                                        className="form-control input-sm"
                                        disabled={pathcareValidation && parentControls?.CardNo}
                                    />
                                </div>
                            )}

                        {["Online Payment", "Paytm"].includes(
                            parentControls.PaymentMode,
                        ) && (
                                <div className="col-sm-2">
                                    <Input
                                        name="TransactionNo"
                                        type="text"
                                        placeholder={t("")}
                                        lable="Transaction No"
                                        value={parentControls.TransactionNo}
                                        onChange={handleParentControlChange}
                                        maxLength={16}
                                        className="form-control input-sm"
                                    />
                                </div>
                            )}

                        <div className="col-sm-2">
                            <Input
                                name="UpdateRemarks"
                                placeholder={t("")}
                                type="text"
                                lable="Remark"
                                value={parentControls.UpdateRemarks}
                                onChange={handleParentControlChange}
                                className="form-control input-sm"
                                disabled={pathcareValidation && parentControls?.UpdateRemarks}
                            />
                        </div>

                        {/* <div className="col-sm-2">
                            <Input
                                name="WriteOff"
                                placeholder={t("")}
                                type="number"
                                lable="WriteOff"
                                value={parentControls.WriteOff}
                                onChange={handleParentControlChange}
                                className="form-control input-sm"
                            />
                        </div> */}
                        {localData.CompanyCode !== "PKL" && (
                            <div className="col-sm-2">
                                <Input
                                    name="Tds"
                                    placeholder={t("")}
                                    type="number"
                                    lable="TDS"
                                    value={parentControls.Tds}
                                    onChange={handleParentControlChange}
                                    className="form-control input-sm"
                                />
                            </div>
                        )}
                        {/* <div className="col-sm-2">
                            <Input
                                name="WriteOff"
                                placeholder={t("")}
                                type="number"
                                lable="WriteOff"
                                value={parentControls.WriteOff}
                                onChange={handleParentControlChange}
                                className="form-control input-sm"
                            />
                        </div> */}

                        <div className="col-sm-12 mt-2">
                            <div>
                                <strong>Balance Amount: </strong>
                                <span
                                    style={{
                                        fontSize: "16px",
                                        fontWeight: "bold",
                                        color: balanceAmount > 0 ? "#d9534f" : "#5cb85c",
                                    }}
                                >
                                    {balanceAmount.toFixed(2)}
                                </span>
                                {balanceAmount > 0 && (
                                    <span style={{ color: "#d9534f", marginLeft: "10px" }}>
                                        (Amount remaining to distribute)
                                    </span>
                                )}
                                {balanceAmount === 0 && parentControls.Payment > 0 && (
                                    <span style={{ color: "#5cb85c", marginLeft: "10px" }}>
                                        (All amount distributed)
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="col-sm-12 mt-2">

                            <button
                                className="btn btn-info btn-sm mr-2"
                                onClick={updateSettlementToSelectedRow}
                                disabled={!HideSave()}
                            >
                                {t("Apply Payment")}
                            </button>

                        </div>

                        {loadingSecond && (
                            <div className="col-sm-12 mt-2">
                                <Loading />
                            </div>
                        )}
                    </div>
                </Accordion>
            )}

            <Accordion title={t("Search Data")} defaultValue={true}>
                {loading ? (
                    <Loading />
                ) : (
                    load && (isSettledView ? (
                        <div className="p-2">
                            <div
                                className="d-flex justify-content-start align-items-center mb-2"
                                style={{ gap: "8px" }}
                            >
                                <input
                                    type="text"
                                    value={globalRemark}
                                    onChange={(e) => setGlobalRemark(e.target.value)}
                                    placeholder={t("Remarks")}
                                    className="form-control input-sm"
                                    style={{ maxWidth: "240px" }}
                                />
                                <button
                                    className="btn btn-danger btn-sm"
                                    onClick={cancelSettleBill}
                                    disabled={
                                        loadingCancel ||
                                        !settledTable.some((r) => r.isChecked)
                                    }
                                >
                                    {t("Cancel Settle Bill")}
                                </button>
                            </div>
                            {loadingCancel && <Loading />}
                            <Tables>
                                <thead
                                    className="cf text-center"
                                    style={{ position: "sticky", top: 0, zIndex: 10 }}
                                >
                                    <tr>
                                        <th>{t("S.No")}</th>
                                        <th>{t("Receipt No")}</th>
                                        <th>{t("RegDate")}</th>
                                        <th>{t("Lab No")}</th>
                                        <th>{t("UHID")}</th>
                                        <th>{t("Invoice No")}</th>
                                        <th>{t("Patient Name")}</th>
                                        <th>{t("Centre")}</th>
                                        <th>{t("RateType")}</th>
                                        <th>{t("Gross Amount")}</th>
                                        <th>{t("Discount Amount")}</th>
                                        <th>{t("Net Amount")}</th>
                                        <th>{t("Receipt Amount")}</th>
                                        <th>
                                            <input
                                                type="checkbox"
                                                checked={settledSelectAll}
                                                onChange={handleSettledSelectAll}
                                            />
                                        </th>
                                    </tr>
                                </thead>
                                {settledTable.length > 0 && (
                                    <tbody>
                                        {settledTable.map((ele, index) => (
                                            <tr key={index}>
                                                <td data-title={t("S.No")}>{index + 1}</td>
                                                <td data-title={t("Receipt No")}>
                                                    {ele.ReceiptNo}
                                                </td>
                                                <td data-title={t("RegDate")}>
                                                    {dateConfig(ele?.RegDate)}
                                                </td>
                                                <td data-title={t("Lab No")}>
                                                    {ele.LedgerTransactionNo}
                                                </td>
                                                <td data-title={t("UHID")}>
                                                    {ele.PatientCode}
                                                </td>
                                                <td data-title={t("Invoice No")}>
                                                    {ele.InvoiceNo}
                                                </td>
                                                <td data-title={t("Patient Name")}>
                                                    {ele?.PName}
                                                </td>
                                                <td data-title={t("Centre")}>{ele.Centre}</td>
                                                <td
                                                    data-title={t("RateType")}
                                                    style={{
                                                        width: "110px",
                                                        maxWidth: "160px",
                                                        overflow: "hidden",
                                                    }}
                                                >
                                                    {ele.RateType}
                                                </td>
                                                <td data-title={t("Gross Amount")}>
                                                    {ele?.Rate || 0}
                                                </td>
                                                <td data-title={t("Discount Amount")}>
                                                    {ele.DiscAmt}
                                                </td>
                                                <td data-title={t("Net Amount")}>
                                                    {ele?.Amount || 0}
                                                </td>

                                                <td data-title={t("Receipt Amount")}>
                                                    {ele?.ReceiptAmount || 0}
                                                </td>
                                                <td data-title={t("#")}>
                                                    <input
                                                        type="checkbox"
                                                        checked={ele?.isChecked || false}
                                                        onChange={(e) =>
                                                            handleSettledCheck(e, index)
                                                        }
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                )}
                            </Tables>
                        </div>
                    ) : (
                        <div className="p-2">
                            <div
                            >
                                <Tables>
                                    <thead className="cf text-center"
                                        style={{
                                            position: "sticky",
                                            top: 0,
                                            zIndex: 10,
                                        }}
                                    >
                                        <tr>
                                            <th>{t("S.No")}</th>
                                            <th>{t("RegDate")}</th>
                                            <th>{t("Lab No")}</th>
                                            <th>{t("UHID")}</th>
                                            <th>{t("Invoice No")}</th>
                                            <th>{t("Patient Name")}</th>
                                            <th>{t("Centre")}</th>
                                            <th>{t("RateType")}</th>
                                            <th>{t("Gross Amount")}</th>
                                            <th>{t("Discount Amount")}</th>
                                            <th>{t("Net Amount")}</th>
                                            <th>{t("Paid Amount")}</th>
                                            <th>{t("Due Amount")}</th>
                                            {localData.CompanyCode !== "PKL" && (
                                                <th>{t("TDS")}</th>
                                            )}
                                            {/* <th>{t("Write Off")}</th> */}
                                            <th>{t("Amount")}</th>
                                            <th>
                                                <input
                                                    type="checkbox"
                                                    onChange={handleParentCheckbox}
                                                    checked={selectAllChecked}
                                                />
                                            </th>
                                        </tr>
                                    </thead>
                                    {formTable.length > 0 && (
                                        <tbody>
                                            {formTable.map((ele, index) => (
                                                <React.Fragment key={index}>
                                                    <tr>
                                                        <td data-title={t("S.No")}>{index + 1}</td>
                                                        <td data-title={t("RegDate")}>
                                                            {dateConfig(ele?.RegDate)}
                                                        </td>
                                                        <td data-title={t("Lab Number")}>
                                                            {ele.LedgerTransactionNo}
                                                        </td>
                                                        <td data-title={t("UHID")}>
                                                            {ele.PatientCode}
                                                        </td>
                                                        <td data-title={t("Invoice No")}>
                                                            {ele.InvoiceNo}
                                                        </td>
                                                        <td data-title={t("Patient Name")}>{ele?.PName}</td>
                                                        <td data-title={t("Centre")}>{ele.Centre}</td>
                                                        <td
                                                            data-title={t("RateType")}
                                                            style={{
                                                                width: "110px",
                                                                maxWidth: "160px",
                                                                overflow: "hidden",
                                                            }}
                                                        >
                                                            {ele.RateType}
                                                        </td>
                                                        <td data-title={t("Gross Amount")}>{ele?.Rate || 0}</td>
                                                        <td data-title={t("Discount Amount")}>
                                                            {ele.DiscAmt}
                                                        </td>
                                                        <td data-title={t("Net Amount")}>{ele?.Amount || 0}</td>
                                                        <td data-title={t("Paid Amount")}>
                                                            {ele?.PaidAmount || 0}
                                                        </td>
                                                        <td data-title={t("Due Amount")}>
                                                            {ele?.DueAmount || 0}
                                                        </td>
                                                        {localData.CompanyCode !== "PKL" && (
                                                            <td data-title={t("TDS")}>{ele?.Tds || 0}</td>
                                                        )}
                                                        {/* <td data-title={t("Write Off")}>{ele?.WriteOff || 0}</td> */}
                                                        <td data-title={t("New Amount")}>
                                                            <input
                                                                type="number"
                                                                name="NewAmount"
                                                                value={ele.NewAmount}
                                                                onChange={(e) => handleChangeMap(e, index)}
                                                                className="form-control input-sm"
                                                                style={{ width: "80px" }}
                                                            //disabled={pathcareValidation ? true : false}
                                                            />
                                                        </td>
                                                        <td data-title={t("#")}>
                                                            <input
                                                                type="checkbox"
                                                                name="isChecked"
                                                                checked={ele?.isChecked || false}
                                                                onChange={(e) => handleChangeIndex(e, index)}
                                                            />
                                                        </td>
                                                    </tr>
                                                </React.Fragment>
                                            ))}
                                        </tbody>
                                    )}
                                </Tables>
                            </div>
                        </div>
                    ))
                )}
            </Accordion>
        </>
    );
};

export default AdvanceSettlement