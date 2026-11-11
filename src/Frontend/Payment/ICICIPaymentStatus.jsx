import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate, useLocation, useParams } from "react-router-dom";
import { axiosInstance } from "../../utils/axiosInstance";
import { CheckCircle, XCircle, Loader } from "lucide-react";
import "./PaymentStatus.css";

const ICICIPaymentStatus = ({ publicPaymentPage = {} }) => {
  const [params] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(false);
  const { id: orderId } = useParams();

    // <h2 className="w-100 text-center decorate">{payment?.merchant}</h2>
    //       <div className="pb-1"><span>Amount</span><b className="font_custome">₹{payment?.amount}</b></div>
    //       <div><span>Client</span><b>{payment?.clientName}</b></div>
    //       <div><span>Order ID</span><b>{payment?.orderID}</b></div>
    //       <div><span>Transaction ID</span><b>{payment?.transactionID}</b></div>
    //       <div><span>Date</span><b>{payment?.transactionDate}</b></div>

  useEffect(() => {
    if (location?.state?.transactionID) {
      setPayment(prev => ({
        ...prev,
        amount: location?.state?.amount,
        clientName: location?.state?.clientName,
        transactionID: location?.state?.transactionID,
        orderID: location?.state?.orderid,
        transactionDate: location?.state?.date,
        // merchant: location?.state?.clientName,
        message:'Payment Verified Successfully',
        status: "SUCCESS",
      }))
      return
    }
    if (orderId) {
      setLoading(true)
      axiosInstance
        .get(`PaymentGateway/FetchOrderReponse?OrderID=${ orderId }`, {
          params: { orderId }
        })
        .then(res => {
          setPayment(res.data.message);
        })
        .catch(() => {
          setPayment({ status: "FAILED" });
        })
        .finally(() => setLoading(false));
    }
  }, [orderId, publicPaymentPage?.clientName]);

  if (loading) {
    return (
      <div className="payment-status-loader">
        <Loader className="spin" size={48} />
        <p>Verifying payment status…</p>
      </div>
    );
  }

  const isSuccess = payment?.status?.toLowerCase() === "success";

  const handlePrint = () => {
    const content = document.querySelector(".payment-status-container");
    if (!content) return;

    const styles = Array.from(document.styleSheets)
      .map(sheet => {
        try {
          return Array.from(sheet.cssRules)
            .map(rule => rule.cssText)
            .join("");
        } catch {
          return "";
        }
      })
      .join("");

    const printWindow = window.open("", "_blank");

    printWindow.document.write(`
    <html>
      <head>
        <title>Payment Receipt</title>
        <style>
          ${ styles }

          @page {
            size: A4;
            margin: 20mm;
          }

          body {
            background: #f5f7fb;
          }

          .actions {
            display: none !important;
          }

          .payment-status-container {
            min-height: auto !important;
          }
        </style>
      </head>
      <body>
        ${ content.outerHTML }
      </body>
    </html>
  `);

    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  return (
    <div style={{height:'100vh'}} className="payment-status-container">
      <div className={`status-card ${ isSuccess ? "success" : "failed" }`}>
        {isSuccess ? (
          <CheckCircle size={80} className="icon success-icon" />
        ) : (
          <XCircle size={80} className="icon failed-icon" />
        )}

        <h2>{isSuccess ? "Payment Successful" : "Payment Failed"}</h2>
        <p className="status-message">
          {payment?.message || "Unable to verify payment"}
        </p>

        <div className="summary">
          {!location?.state?.date && <h2 className="w-100 text-center decorate">{payment?.merchant}</h2>}
          <div className="pb-1"><span>Amount</span><b className="font_custome">₹{payment?.amount}</b></div>
          <div><span>Client</span><b>{payment?.clientName}</b></div>
          <div><span>Order ID</span><b>{payment?.orderID}</b></div>
          <div><span>Transaction ID</span><b>{payment?.transactionID}</b></div>
          <div><span>Date</span><b>{payment?.transactionDate}</b></div>
        </div>

        <div className="actions">
          <button onClick={() =>{
            if(publicPaymentPage?.clientName) navigate('/paymanet-gatway/verifyGateway'); 
            else navigate('/')
          }}>
           {publicPaymentPage?.clientName ? `Pay Again`: `Go to Dashboard`}
          </button>

          {isSuccess && (
            <button onClick={handlePrint} className="outline">
              Download Receipt
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ICICIPaymentStatus;
