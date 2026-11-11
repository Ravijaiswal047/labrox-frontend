import { useEffect, useState } from "react";
import { axiosInstance } from "../../utils/axiosInstance";
import Accordion from "@app/components/UI/Accordion";
import { useTranslation } from "react-i18next";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { CustomButton } from "../../components/UI/CustomButton";
import { toast } from "react-toastify";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import Tables from "../../components/UI/customTable";

const LogisticReceive = () => {
    const [t] = useTranslation();
    const [loading, setLoading] = useState(false);
    const [fieldBoyOptions, setFieldBoyOptions] = useState([]);
    const [sampleData, SetSampleData] = useState([]);
    const [batchData, setBatchData] = useState([]);
    const [cashData, setCashData] = useState([]);
    const [isOtpValidated, setIsOtpValidated] = useState(false);

    const [payload, setPayload] = useState({
        fieldBoy: "",
        otp: "",
    });

    const fetchFieldBoys = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get("FieldBoyMaster/BindFieldBoy");
            const data = res?.data?.message || [];
            if (res?.data?.success && Array.isArray(data)) {
                const mapped = data.map((r) => ({
                    label: r.NAME,
                    value: String(r.FieldBoyID),
                }));
                setFieldBoyOptions(mapped);
            }
        } catch (err) {
            console.error("Failed to load centers", err);
            setFieldBoyOptions([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFieldBoys();
    }, []);

    const fetchSampleData = async (fieldBoyID) => {
        setLoading(true);
        try {
            const res = await axiosInstance.get(`LogisticWeb/RetrieveSampleData?FieldBoyId=${fieldBoyID}`);
            const data = res?.data?.data || [];
            if (res?.data?.success && Array.isArray(data)) {
                SetSampleData(data);
            } else {
                toast.error(`Sample ${res?.data?.message || "Failed to load sample data"}`);
                SetSampleData([])
            }
        } catch (err) {
            console.error("Failed to load sample data", err);
            SetSampleData([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchBatchData = async (fieldBoyID) => {
        setLoading(true);
        try {
            const res = await axiosInstance.get(`LogisticWeb/RetriveBatchData?FieldBoyId=${fieldBoyID}`);
            const data = res?.data?.data || [];
            if (res?.data?.success && Array.isArray(data)) {
                setBatchData(data);
            } else {
                toast.error(`Batch ${res?.data?.message} ` || "Failed to load batch data");
                setBatchData([]);
            }
        } catch (err) {
            console.error("Failed to load batch data", err);
            setBatchData([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchCashData = async (fieldBoyID) => {
        setLoading(true);
        try {
            const res = await axiosInstance.get(`LogisticWeb/RetriveCashData?FieldBoyId=${fieldBoyID}`);
            const data = res?.data?.data || [];
            if (res?.data?.success && Array.isArray(data)) {
                setCashData(data);
            } else {
                toast.error(`Cash ${res?.data?.message} ` || "Failed to load cash data");
                setCashData([]);
            }
        } catch (err) {
            console.error("Failed to load cash data", err);
            setCashData([]);
        } finally {
            setLoading(false);
        }
    };
    const SendReceivedData = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get(`LogisticWeb/ReceiveLogisticDataAsync?FieldBoyId=${payload.fieldBoy}`);
            if (res?.data?.success) {
                toast.success(res?.data?.message);
            } else {
                toast.error(res?.data?.message);
            }
        } catch (err) {
            console.error("Failed to load cash data", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectChange = (name, value) => {
        setPayload({ ...payload, [name]: value.value });
        if (name === "fieldBoy") {
            fetchSampleData(value.value);
            fetchBatchData(value.value);
            fetchCashData(value.value);
            setIsOtpValidated(false)
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPayload({ ...payload, [name]: value });
    };

    const validateOTP = async () => {
        if (!payload.fieldBoy) {
            toast.error("Please select field boy");
            return;
        }
        if (!payload.otp) {
            toast.error("Please enter OTP");
            return;
        }
        const finalPayload = {
            fieldboyId: payload.fieldBoy,
            otp: payload.otp,
        };
        setLoading(true);
        try {
            const res = await axiosInstance.post(`LogisticWeb/ValidateOtpForTransferBatchAsync`, finalPayload);
            if (res?.data?.success) {
                toast.success(res?.data?.message);
                setPayload({ ...payload, otp: "" });
                setIsOtpValidated(true)
            } else {
                toast.error(`OTP ${res?.data?.message} ` || "Failed to validate OTP");
                setIsOtpValidated(false)
            }
        } catch (err) {
            console.error("Failed to validate OTP", err);
            toast.error("Failed to validate OTP");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Accordion
                name={t("Logistic Receive")}
                defaultValue={true}
                isBreadcrumb={true}
            >
                <div className="row pt-2 px-2 py-2">
                    <div className="col-12">
                        <div className="row gap-3">
                            <div className="col-12 col-sm-6 col-md-2 my-1">
                                <ReactSelect
                                    name="fieldBoy"
                                    id="fieldBoy"
                                    dynamicOptions={fieldBoyOptions}
                                    onChange={handleSelectChange}
                                    label={"Select Field Boy"}
                                    removeIsClearable={true}
                                    placeholderName={"Select Field Boy"}
                                    value={payload.fieldBoy}
                                    isDisabled={loading}
                                />
                            </div>
                            <div className="col-12 col-sm-6 col-md-2 my-1">
                                <input
                                    type="text"
                                    name="otp"
                                    id="otp"
                                    value={payload.otp}
                                    onChange={handleChange}
                                    placeholder="Enter OTP"
                                    className="form-control"
                                />
                            </div>
                            <div className="col-12 col-sm-6 col-md-auto my-1">
                                <CustomButton
                                    text={"Validate OTP"}
                                    onClick={validateOTP}
                                />
                            </div>
                            {isOtpValidated && (
                            <div className="col-12 col-sm-6 col-md-auto my-1">
                                <CustomButton
                                    text={"Receive Data"}
                                    onClick={SendReceivedData}
                                />
                            </div>
                            )}
                            {/* <div className="col-12 col-sm-6 col-md-auto my-1">
                                <CustomButton
                                    text={"View Upcoming Samples"}
                                    onClick={() => { }}
                                />
                            </div> */}
                        </div>
                    </div>
                </div>
            </Accordion>
            <Accordion defaultValue={true} title={t("Sample Details")}>
                <div className="row gx-3 gy-3">
                    <div className="card w-100">
                        <div className="card-body p-2">
                            <div className="table-responsive">

                                {sampleData?.length > 0 ? (
                                    <Tables
                                        style={{
                                            maxHeight: "400px",
                                            overflowY: "auto",
                                        }}
                                    >
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>{t("Centre")}</th>
                                                <th>{t("Field boy")}</th>
                                                <th>{t("SampleName")}</th>
                                                <th>{t("Quantity")}</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {sampleData?.map((row, idx) => (
                                                <tr key={idx}>
                                                    <td data-title={t("S.No")}>{idx + 1}</td>
                                                    <td data-title={t("Centre")}>{row?.OrginCentreName || "-"}</td>
                                                    <td data-title={t("Field boy")}>{row?.FieldBoyName || "-"}</td>
                                                    <td data-title={t("SampleName")}>{row?.SampleName || "-"}</td>
                                                    <td data-title={t("Quantity")}>{row?.Quantity || "-"}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Tables>
                                ) : (
                                    <NoRecordFound />
                                )}

                            </div>
                        </div>
                    </div>
                </div>
            </Accordion>
            <Accordion defaultValue={true} title={t("Batch Details")}>
                <div className="row gx-3 gy-3">
                    <div className="card w-100">
                        <div className="card-body p-2">
                            <div className="table-responsive">

                                {batchData?.length > 0 ? (
                                    <Tables
                                        style={{
                                            maxHeight: "400px",
                                            overflowY: "auto",
                                        }}
                                    >
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>{t("Centre")}</th>
                                                <th>{t("Field boy")}</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {batchData?.map((row, idx) => (
                                                <tr key={idx}>
                                                    <td data-title={t("S.No")}>{idx + 1}</td>
                                                    <td data-title={t("Centre")}>{row?.OrginCentreName || "-"}</td>
                                                    <td data-title={t("Field boy")}>{row?.FieldBoyName || "-"}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Tables>
                                ) : (
                                    <NoRecordFound />
                                )}

                            </div>
                        </div>
                    </div>
                </div>
            </Accordion>
            <Accordion defaultValue={true} title={t("Cash Details")}>
                <div className="row gx-3 gy-3">
                    <div className="card w-100">
                        <div className="card-body p-2">
                            <div className="table-responsive">

                                {cashData?.length > 0 ? (
                                    <Tables
                                        style={{
                                            maxHeight: "300px",
                                            overflowY: "auto",
                                        }}
                                    >
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>{t("Centre")}</th>
                                                <th>{t("Field boy")}</th>
                                                <th>{t("Type")}</th>
                                                <th>{t("Amount")}</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {cashData?.map((row, idx) => (
                                                <tr key={idx}>
                                                    <td data-title={t("S.No")}>{idx + 1}</td>
                                                    <td data-title={t("Centre")}>{row?.OrginCentreName || "-"}</td>
                                                    <td data-title={t("Field boy")}>{row?.FieldBoyName || "-"}</td>
                                                    <td data-title={t("Type")}>{row?.TYPE || "-"}</td>
                                                    <td data-title={t("Amount")}>{row?.CashAmount || "-"}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Tables>
                                ) : (
                                    <NoRecordFound />
                                )}

                            </div>
                        </div>
                    </div>
                </div>
            </Accordion>
        </>
    );
}

export default LogisticReceive;