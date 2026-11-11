import React, { useState } from 'react'
import { axiosInstance } from "../../utils/axiosInstance";

import { toast } from "react-toastify";
import Input from "../../components/formComponent/Input";
import { SelectBox } from "../../components/formComponent/SelectBox";
import Loading from "../../components/loader/Loading";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import { useTranslation } from "react-i18next";

import Accordion from "@app/components/UI/Accordion";
import Tables from "../../components/UI/customTable";
import { useSelector } from "react-redux";
import { SaveButton, SearchButton } from "../../components/UI/CustomButton";
import ReactSelect from '../../components/formComponent/ReactSelect';
const ChangeCopaymentPercentage = () => {
    const [LabNo, setLabNo] = useState([]);
    const [CoPay, setCoPay] = useState(0);
    console.log(CoPay, "CoPay");
    const { t } = useTranslation();
    const [tableData, setTableData] = useState([]);
    const [payload, setPayload] = useState({
        BankName: "",
        LedgerTransactionNo: null
    });

    console.log(payload, "payload");
    const [load, setLoad] = useState({
        saveLoad: false,
    });
    const [BankName, setBankName] = useState([]);
    const fetch = (lab_No = "") => {
        setLoad(prev => ({ ...prev, saveLoad: true }));

        axiosInstance
            .get("CopaymentEdit/GetCopaymentData", {
                params: {
                    LedgerTransactionNo: String(lab_No)?.trim() || LabNo.trim(),
                },
            })
            .then((res) => {
                const { success, message } = res?.data || {};
                if (success && message) {
                    const ledgerNo = message?.LedgerTransactionID;
                    setTableData([{
                        LedgerTransactionNo: ledgerNo,
                        PatientCode: message?.PatientCode,
                        ItemName: message?.Test,
                        Quantity: 1,
                        Rate: message?.Rate,
                        Amount: message?.Amount,

                        discountAmt: message?.discountAmt,
                        paybypatient: message?.paybypatient,
                        paybypanel: message?.paybypanel,
                        PName: message?.PName,
                        CopaymentPercentage: message?.CopaymentPercentage,


                    }]);
                    setPayload((prev) => ({
                        ...prev,
                        LedgerTransactionNo: ledgerNo,
                    }));


                    setCoPay(message?.CopaymentPercentage);


                    fetchBank();

                } else {
                    setTableData([]);
                    toast.error("No record found");
                }
            })
            .catch((err) => {
                toast.error(
                    err?.response?.data?.message || "Something went wrong."
                );
            })
            .finally(() => {
                setLoad(prev => ({ ...prev, saveLoad: false }));
            });
    };

    const fetchBank = () => {
        setLoad(prev => ({ ...prev, saveLoad: true }));

        axiosInstance
            .post("Global/getGlobalData", { Type: "PaymentMode" })
            .then((res) => {
                const { success, message } = res?.data || {};

                if (success && Array.isArray(message)) {
                    const formattedData = message.map((item) => ({
                        label: item?.FieldDisplay,
                        value: item?.FieldID.toString(),

                    }));

                    setBankName(formattedData);
                }
            })
            .catch((err) => {
                toast.error(
                    err?.response?.data?.message || "Something went wrong."
                );
            })
            .finally(() => {
                setLoad(prev => ({ ...prev, saveLoad: false }));
            });
    };

    const handleReactSelectChange = (name, e) => {
        console.log("Selected option:", e);
        setPayload((prev) => ({ ...prev, [name]: e?.value }));
    };

    const handleCoPayChange = (e) => {
        setCoPay(e?.target?.value);
    }

    const handleSave = () => {
        if (CoPay === "" || CoPay < 0 || CoPay > 100) {
            toast.error("Please enter a valid Co-Payment Percentage");
            return;
        }

        setLoad({ ...load, saveLoad: true });

        axiosInstance
            .post("CopaymentEdit/UpdateCopaymentData", {
                LedgerTransactionID: payload?.LedgerTransactionNo,
                CopaymentPercentage: CoPay,
                PaymentModeName: payload?.BankName ?? "",
            })
            .then((res) => {
                const { success, message } = res?.data || {};
                if (success) {
                    toast.success(message || "Saved successfully.");
                    setTableData([]);
                    setCoPay(0);
                    setPayload({
                        BankName: "",
                        LedgerTransactionNo: null
                    });
                } else {
                    toast.error(message || "Failed to save.");
                }
            })
            .catch((err) => {
                toast.error(err?.response?.data?.message || "Something went wrong.");
            })
            .finally(() => {
                setLoad(prev => ({ ...prev, saveLoad: false }));
            });
    };

    const handleKeyDown = (e) => {
        if (e?.key === "Enter") {
            fetch(e);
        }
    };

    return (
        <>
            <Accordion
                name={t("Patient CopaymentPercentage")}
                isBreadcrumb={true}
                defaultValue={true}
            >
                <div className="row px-2 mt-2 mb-1">
                    <div className="col-sm-2">
                        <Input
                            type="text"
                            id="LabNo"
                            lable="Lab Number"
                            placeholder=" "
                            onKeyDown={handleKeyDown}
                            value={LabNo}
                            onChange={(e) => {
                                setLabNo(e?.target?.value);
                            }}
                        />
                    </div>

                    <div className="col-sm-1">
                        <SearchButton
                            text={"Search"}
                            onClick={() => fetch("")}
                            disabled={LabNo.length == 0}
                        />
                    </div>
                </div>

                <div className="row px-2 mt-2 mb-1">

                    {tableData.length > 0 && (
                        <>
                            {/* <div className="col-sm-2">
                                <ReactSelect
                                    dynamicOptions={[{ label: "Select", value: "" }, ...BankName]}
                                    name="BankName"
                                    lable={t("Payment Mode")}
                                    id="BankName"
                                    isShowBorder={true}
                                    removeIsClearable={true}
                                    placeholderName={t("Payment Mode")}
                                    value={payload?.BankName}
                                    onChange={handleReactSelectChange}
                                />
                            </div> */}

                            <div className="col-sm-2">
                                <Input
                                    type="number"
                                    id="CoPay"
                                    lable="Co-Payment Percentage"
                                    placeholder=" "
                                    value={CoPay}
                                    onChange={handleCoPayChange}
                                />
                            </div>

                            <div className="col-sm-1">
                                {load?.saveLoad ? (
                                    <Loading />
                                ) : (
                                    <SaveButton
                                        text="Save"
                                        onClick={handleSave}
                                    />
                                )}
                            </div>
                        </>
                    )}

                </div>
            </Accordion>

            {tableData.length > 0 ? (
                <Accordion title={t("Search Detail")} defaultValue={true}>
                    {load?.saveLoad ? (
                        <Loading />
                    ) : (
                        <Tables>
                            <thead>
                                <tr>
                                    {[
                                        t("S.No."),
                                        t("LedgerTransaction ID"),
                                        t("PName"),
                                        t("UHID"),
                                        t("Test Name"),
                                        t("Quantity"),
                                        t("Rate"),
                                        t("Amount"),
                                        t("discountAmt"),
                                        t("paybypatient"),
                                        t("paybypanel"),
                                        t("CopaymentPercentage"),
                                    ].map((ele, index) => (
                                        <th key={index}>{ele}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {tableData.map((data, index) => (
                                    <tr key={index}>
                                        <td data-title={t("S.No.")}>{index + 1}&nbsp;</td>
                                        <td data-title={t("Lab No")}>
                                            {data?.LedgerTransactionNo}&nbsp;
                                        </td>
                                        <td data-title={t("PName")} >
                                            {(data?.PName)}&nbsp;
                                        </td>
                                        <td data-title={t("UHID")}>{data?.PatientCode}&nbsp;</td>
                                        <td data-title={t("Test Name")}>{data?.ItemName}&nbsp;</td>
                                        <td data-title={t("Quantity")} >
                                            {data?.Quantity}&nbsp;
                                        </td>
                                        <td data-title={t("Rate")} >
                                            {(data?.Rate).toFixed(2)}&nbsp;
                                        </td>
                                        <td data-title={t("Amount")} >
                                            {(data?.Amount).toFixed(2)}&nbsp;
                                        </td>
                                        <td data-title={t("discountAmt")} >
                                            {(data?.discountAmt).toFixed(2)}&nbsp;
                                        </td>
                                        <td data-title={t("paybypatient")} >
                                            {(data?.paybypatient).toFixed(2)}&nbsp;
                                        </td>
                                        <td data-title={t("paybypanel")} >
                                            {(data?.paybypanel).toFixed(2)}&nbsp;
                                        </td>

                                        <td data-title={t("CopaymentPercentage")} >
                                            {(data?.CopaymentPercentage)}&nbsp;
                                        </td>

                                    </tr>
                                ))}
                            </tbody>
                        </Tables>
                    )}

                    {/* {handleShowSubmit() && (
                        <>
                            <div className="row mt-4 px-2">
                                <div className="col-sm-2">
                                    <Input
                                        type="text"
                                        lable={t("Copayment Percentage")}
                                        name="CoPay"
                                        placeholder=" "
                                        id="CoPay"
                                        value={CoPay}
                                        onChange={(e) => setCoPay(e?.target?.value)}
                                    />

                                </div>

                                <div className="col-sm-1">
                                    {load?.saveLoad ? (
                                        <Loading />
                                    ) : (
                                        <SaveButton
                                            text={"Save"}
                                            onClick={handleSave}
                                        />
                                    )}
                                </div>
                            </div>
                        </>
                    )} */}
                </Accordion>
            ) : (
                <></>
            )}
        </>
    );
}

export default ChangeCopaymentPercentage