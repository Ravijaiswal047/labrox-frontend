import { Dialog } from "primereact/dialog";
import React, { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import moment from "moment";
import Input from "../formComponent/Input";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import Loading from "../loader/Loading";
import { number } from "../../utils/helpers";
import { axiosInstance } from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import { useEffect } from "react";

const MpesaModal = ({ show, onHide, amount, Id, centerId, centername, mobile, onPaymentSuccess, countryMobLength, Name }) => {

    const theme = useLocalStorage("theme", "get");
    const { t } = useTranslation();
    const isMobile = window.innerWidth <= 768;
    const [load, setLoad] = useState(false);
    const stopPollingRef = useRef(false);
    const [resultMsg, setResultMsg] = useState(null);
    useEffect(() => {
        setPayment({
            mobile: mobile || "",
            amt: amount,
        });
    }, [mobile, amount]);

    const [payment, setPayment] = useState({
        mobile: "",
        amt: amount,
    });

    const [timer, setTimer] = useState(120);
    const [intervalId, setIntervalId] = useState(null);

    const handleModalClose = () => {
        stopPollingRef.current = true;
        if (intervalId) {
            clearInterval(intervalId.timerInterval);
            clearInterval(intervalId.apiInterval);
        }

        setTimer(120);
        setLoad(false);
        setResultMsg(null);
        onHide(false);

        setPayment({
            mobile: "",
            amt: "",
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPayment({
            ...payment,
            [name]: value,
        });
    };

    // const handlePayment = async () => {
    //     let timerInterval;
    //     stopPollingRef.current = false;
    //     let timeLeft = 120;

    //     try {
    //         if (!payment.mobile) {
    //             toast.error("Please Enter Mobile Number");
    //             return;
    //         }

    //         if (load) return;

    //         setLoad(true);
    //         setTimer(120);

    //         const payload = {
    //             paymentAmt: Number(payment.amt),
    //             ledgertransactionIDHash: Id,
    //             billNo: "",
    //             mobileNo: payment.mobile,
    //             centerID: String(centerId),
    //             centreName: centername,
    //         };

    //         // TIMER
    //         timerInterval = setInterval(() => {
    //             timeLeft -= 1;
    //             setTimer(timeLeft);

    //             if (timeLeft <= 0) {
    //                 clearInterval(timerInterval);
    //                 stopPollingRef.current = true;
    //                 toast.error("Payment Timeout (2 min) ⏳");
    //                 setLoad(false);
    //             }
    //         }, 1000);

    //         const pollPayment = async () => {
    //             if (stopPollingRef.current) return;

    //             try {
    //                 const res = await axiosInstance.post(
    //                     "BankAPI/InserAndInitiatePayment",
    //                     payload
    //                 );

    //                 if (res?.data?.success) {
    //                     const checkoutId = res?.data?.data?.checkoutRequestID;
    //                     const merchantRequestID = res?.data?.data?.merchantRequestID;

    //                     if (checkoutId && checkoutId !== "0") {
    //                         onPaymentSuccess(checkoutId);
    //                     }

    //                     clearInterval(timerInterval);
    //                     stopPollingRef.current = true;
    //                     toast.success(res?.data?.message);
    //                     setLoad(false);
    //                 } else {
    //                     console.log("Still waiting...");

    //                     if (!stopPollingRef.current) {
    //                         setTimeout(() => {
    //                             pollPayment();
    //                         }, 20000);
    //                     }
    //                 }
    //             } catch (err) {
    //                 console.log(err);

    //                 if (!stopPollingRef.current) {
    //                     setTimeout(() => {
    //                         pollPayment();
    //                     }, 20000);
    //                 }
    //             }
    //         };

    //         pollPayment();

    //         setIntervalId({ timerInterval });

    //     } catch (error) {
    //         clearInterval(timerInterval);
    //         stopPollingRef.current = true;
    //         toast.error("Something went wrong");
    //         setLoad(false);
    //     }
    // };
    const handlePayment = async () => {
        stopPollingRef.current = false;
        let timeLeft = 300;

        try {
            if (!payment.mobile) {
                toast.error("Please Enter Mobile Number");
                return;
            }

            if (load) return;

            setLoad(true);
            setTimer(300);

            const payload = {
                paymentAmt: Number(payment.amt),
                ledgertransactionIDHash: Id,
                billNo: "",
                mobileNo: payment.mobile,
                centerID: String(centerId),
                centreName: centername + " ( " + Name + " ) ",
            };

            // Step 1: Call InserAndInitiatePayment directly (no polling)
            const res = await axiosInstance.post("BankAPI/InserAndInitiatePayment", payload);

            if (!res?.data?.success) {
                toast.error(res?.data?.message || "Payment initiation failed");
                setLoad(false);
                return;
            }

            const checkoutId = res?.data?.data?.checkoutRequestID;
            const merchantRequestID = res?.data?.data?.merchantRequestID;

            if (!checkoutId || checkoutId === "0") {
                toast.error("Invalid Checkout ID received");
                setLoad(false);
                return;
            }

            // Step 2: Start 5 min timer
            const timerInterval = setInterval(() => {
                timeLeft -= 1;
                setTimer(timeLeft);

                if (timeLeft <= 0) {
                    clearInterval(timerInterval);
                    stopPollingRef.current = true;
                    toast.error("Payment Timeout (5 min) ⏳");
                    setLoad(false);
                }
            }, 1000);

            setIntervalId({ timerInterval });

            // Step 3: Poll BankAPI/GetResponse every 20s for 5 mins
            const pollGetResponse = async () => {
                if (stopPollingRef.current) return;

                try {
                    const pollRes = await axiosInstance.post(`BankAPI/GetResponse?PaymentReqID=${merchantRequestID}&CheckoutRequestID=${checkoutId}`
                    );

                    console.log("GetResponse poll result:", pollRes?.data);



                    const data = pollRes?.data?.data;

                    if (data && data.length > 0) {
                        const record = data[0];

                        if (record.Status === 3) {
                            // Payment Failed
                            clearInterval(timerInterval);
                            stopPollingRef.current = true;
                            toast.error("Payment Request Failed");
                            setLoad(false);
                            setResultMsg({ text: "Payment Request Failed", type: "error" });
                            setTimeout(() => {
                                handleModalClose();
                            }, 5000);
                        } else if (record.Status === 4) {
                            // Payment Success
                            clearInterval(timerInterval);
                            stopPollingRef.current = true;
                            toast.success(`Payment Successful! ${record.MpesaReceiptNumber}`);
                            setLoad(false);
                            setResultMsg({ text: `Payment Successful! ${record.MpesaReceiptNumber}`, type: "success" });
                            setTimeout(() => {
                                onPaymentSuccess(record.MpesaReceiptNumber);
                                handleModalClose();
                            }, 5000);

                        } else {
                            // Other status, keep polling
                            if (!stopPollingRef.current) {
                                setTimeout(pollGetResponse,5000);
                            }
                        }

                    } else {
                        // No data yet, keep polling
                        if (!stopPollingRef.current) {
                            setTimeout(pollGetResponse, 5000);
                        }
                    }

                } catch (err) {
                    console.log("GetResponse poll error:", err);

                    if (!stopPollingRef.current) {
                        setTimeout(pollGetResponse, 5000);
                    }
                }
            };

            pollGetResponse();

        } catch (error) {
            console.log(error);
            stopPollingRef.current = true;
            toast.error("Something went wrong");
            setLoad(false);
        }
    };
    return (
        <>
            <Dialog
                header={t("M-PESA PAYMENT")}
                visible={show}
                onHide={handleModalClose}
                className={theme}
                style={{ width: isMobile ? "95vw" : "40vw" }}
                modal
            >
                <div className="row">
                    <div className="col-sm-4">
                        <Input
                            className="required-fields"
                            type="number"
                            onInput={(e) =>
                                number(e, countryMobLength == "KES" ? 14 : 10)
                            }
                            name="mobile"
                            id="mobile"
                            lable={t("Mobile")}
                            placeholder=""
                            onChange={handleChange}
                            value={payment.mobile}
                        />
                    </div>
                    <div className="col-sm-4">
                        <Input
                            className="required-fields"
                            type="text"
                            name="amt"
                            id="amt"
                            lable={t("Amt")}
                            placeholder=""
                            disabled={true}
                            value={payment.amt}
                        />
                    </div>
                    <div className="col-sm-12 mt-2 text-center">
                        {load && (
                            <span style={{ color: "red", fontWeight: "bold" }}>
                                Time Left: {Math.floor(timer / 60)}:
                                {timer % 60 < 10 ? `0${timer % 60}` : timer % 60}
                            </span>
                        )}
                        {resultMsg && (
                            <div className="col-sm-12 mt-3 text-center">
                                <h1 style={{ color: resultMsg.type === "success" ? "green" : "red", fontWeight: "bold" }}>
                                    {resultMsg.text}
                                </h1>
                            </div>
                        )}
                    </div>
                    <div className="col-sm-3">
                        <button
                            onClick={handlePayment}
                            className="btn btn-block btn-success btn-sm"
                            disabled={load}
                        >
                            Process Payment
                        </button>


                    </div>
                </div>

            </Dialog>
        </>
    );
};

export default MpesaModal;