import axios from "axios";
import React, { useEffect } from "react";
import { toast } from "react-toastify";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import Clients from "../../Config/Clients";
import { useNavigate } from "react-router-dom";

const RazorPay = ({
  AnotherPageCommonFunction,
  IsOpen,
  payload,
  setIsRazorPayOpen,
  requestComingFrom="privatePage"
}) => {
  const hostWithPort = window.location.host;
  const client = Clients[hostWithPort] ||  [import.meta.env.VITE_DEFAULT_CLIENT|| "uat-v9.itdoseinfo.com:8088"];
  const navigate = useNavigate()
  const key = "12345678123456781234567812345678";
  const CompanyID = useLocalStorage("userData", "get")?.CompanyID;
  const CompanyName = useLocalStorage("userData", "get")?.CompanyName;

  function otpDecrypt(ciphertext, key) {
    let plaintext = "";
    for (let i = 0; i < ciphertext.length; i++) {
      let keyChar = key.charCodeAt(i % key.length);
      let decryptedChar = String.fromCharCode(
        ciphertext.charCodeAt(i) ^ keyChar,
      );
      plaintext += decryptedChar;
    }
    return plaintext;
  }

  const getRazorPayDetails = () => {
    axios
      .get("/api/v1/RazorPay/payment")
      .then((res) => {
        if (res?.data?.success) {
          const current = new Date();
          const due = new Date(res?.data?.message?.dueDate);
          const timeDifference = due - current;
          const daysDifference = Math.ceil(
            timeDifference / (1000 * 60 * 60 * 24),
          );
          daysDifference <= 15 &&
            res?.data?.message?.superAdmin == 1 &&
            res?.data?.message?.amount > 0 &&
            checkoutHandler(res?.data?.message);
        }
      })
      .catch((err) =>
        toast.error(
          err?.data?.response?.message
            ? err?.data?.response?.message
            : "Error Occur",
        ),
      );
  };

  console.log('IsOpen>>', IsOpen);

  useEffect(() => {
    !IsOpen && getRazorPayDetails();
    IsOpen && checkoutHandler(payload);
  }, [IsOpen]);

  const checkoutHandler = async (payload) => {
    let orderApiUrl = requestComingFrom === "publicPage" ? `/api/v1/RazorPay/WithoutLoginorder` : `/api/v1/RazorPay/order`
    const { data } = await axios.post(orderApiUrl, {
      amount: payload?.amount,
      tnx_type: !IsOpen ? "Company" : payload?.tnx_type,
      receipt: payload?.key_secret,
      rateTypeID: payload?.RateTypeID || 0
    });
    // console.log(data);
    const options = {
      key: otpDecrypt(payload?.key_id, key),
      amount: data.message.amount,
      currency: "INR",
      name: client.name || "ElabPro",
      description: CompanyID + "-" + CompanyName,
      image: client.logo || "https://s3.ap-south-1.amazonaws.com/frontend.elabpro.in/logo.jpg",
      order_id: data.message.id,
      notes: {
        payload: data.message,
      },
      prefill: {
        name: "Elab",
        email: "elab@itdoseinfo.com",
        contact: "9999999999",
      },
      theme: {
        color: "#7470ba",
      },
      handler: async function (response) {
        const datas = {
          ...payload,
          receipt: payload?.receipt,
          key_secret: payload?.key_secret,
          KeyID: data.message.id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature,
        };
        const paymentVerificationUrl = (requestComingFrom ==="publicPage" ? `/api/v1/RazorPay/WithoutpaymentVerification` : `/api/v1/RazorPay/paymentVerification`)
        axios
          .post(paymentVerificationUrl, datas)
          .then((res) => {
            // console.log(res);
            IsOpen &&
              AnotherPageCommonFunction({
                ...datas,
                ...res,
              });
            toast.success("Payment Successful!");
            if(requestComingFrom === "publicPage"){
              navigate(`/paymentStatus/${res?.data?.message?.transactionID}`, {
                state: res?.data.message
              }) 
            }
            !IsOpen && window.location.reload();
          })
          .catch((err) => {
            IsOpen && setIsRazorPayOpen(false);
            toast.error("Payment Verification Failed!");
          });
      },
      modal: {
        ondismiss: function () {
          IsOpen && setIsRazorPayOpen(false);
        },
      },
    };
    const razor = new window.Razorpay(options);
    razor.open();
  };
  return (
    <>
      {/* {razorPayData?.payment_capture == 1 && (
        <button
          type="button"
          className="btn btn-success btn-sm"
          onClick={displayRazorpay}
        >
          Pay
        </button>
      )} */}
    </>
  );
};

export default RazorPay;
