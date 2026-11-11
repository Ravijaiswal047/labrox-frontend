// import React, { useState } from "react";
// import HDFCLOGO from "../../assets/image/HDFCLOGO_new.png";
// import "./Gateway.css";
// import { Button, Col, Form, Row } from "react-bootstrap";
// import logo_Razorpay from "../../assets/image/logo_Razorpay.png";
// import { axiosInstance } from "../../utils/axiosInstance";
// import { notify } from "../../utils/utils";
// import Clients from "../../Config/Clients";
// import RazorPay from "../Payment/RazorPay";


// const VerifyPanelCode = () => {
//   const hostWithPort = window.location.host;
//   const client = Clients[hostWithPort] || Clients["uat-v9.itdoseinfo.com:8088"];
//   const [isRazorPayOpen, setIsRazorPayOpen] = useState(false);
//   const [payload, setPayload] = useState({
//     panelCode: "",
//     panelName: "",
//     amount: "",
//     remarks: "",
//   });

//   const initFormData_value = {
//     paymentModeID: "",
//     TransactionId: "",
//     InvoiceNo: "",
//     InvoiceAmount: "",
//     ReceivedAmt: "0",
//     PaymentMode: "Online Payment" || "",
//     BankName: "",
//     CreditCardNo: "",
//     DraftNo: "",
//     ChequeNo: "",
//     ChequeDate: new Date(),
//     ReceiveDate: new Date(),
//     RateTypeID: payload?.panelCode || "",
//     AdvanceAmtDate: new Date(),
//     CreditNote: "1",
//     Remarks: "",
//     Type: "",
//     CreditDebit: "",
//   };
//   const [formData, setFormData] = useState(initFormData_value);
//   const [paymenyId, setPaymentId] = useState({
//     receipt: "",
//     key_id: "",
//     key_secret: "",
//   });
//   const [verified, setVerified] = useState(false);

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setPayload((prev) => ({ ...prev, [name]: value }));
//     if (name == 'panelCode') {
//       setFormData((prev) => ({ ...prev, RateTypeID: value }))
//     }
//     if (name == 'amount') {
//       setFormData((prev) => ({ ...prev, ReceivedAmt: value, InvoiceAmount: value }))
//     }
//   };

//   const handleVerifyPanel = async () => {
//     if (!payload.panelCode || payload.panelCode.length < 4) {
//       alert("Enter a valid Panel Code");
//       return;
//     }
//     // simulate API call to verify
//     console.log("Verifying Panel Code:", payload.panelCode);
//     await axiosInstance.post('/Accounts/Panelverify', { centreCode: payload.panelCode })
//       .then(res => {
//         console.log('rsxxx', res);
//         if (!res?.data?.success) {
//           notify(res?.data?.message, 'error')
//           return;
//         }
//         notify(res?.data?.message)
//         setPayload((prev) => ({ ...prev, panelCode: res?.data?.centreID, panelName: res?.data?.centre || res?.data?.centreID }));
//         // example: set panel name dynamically after API
//         setVerified(true);
//       })
//       .catch(err => {
//         notify(err?.response?.data?.message || 'Something went wrong!', 'error')
//       })
//   };

//   const handleReset = () => {
//     setPayload({
//       panelCode: "",
//       panelName: "",
//       amount: "",
//       remarks: "",
//     });
//     setVerified(false);
//   };

//   const OnlinePayment = async () => {
//     await axiosInstance
//       .get("RazorPay/Otherpayment")
//       .then((res) => {
//         console.log("resxxx", res);
//         if (res?.data?.message?.payment_capture == 1) {
//           setIsRazorPayOpen(true);
//           setPaymentId({
//             receipt: res?.data?.message?.receipt,
//             key_id: res?.data?.message?.key_id,
//             key_secret: res?.data?.message?.key_secret,
//           });
//         } else {
//           saveData();
//         }
//       })
//       .catch((err) =>
//         toast.error(
//           err?.data?.response?.message
//             ? err?.data?.response?.message
//             : "Error Occur"
//         )
//       );
//   };

//   const saveData = (data = "") => {
//     setForm(initFormValue);
//     setFormData(initFormData_value);
//     setIsRazorPayOpen(false);
//     setShow(false);
//   };

//   const handleSubmitPayment = () => {
//     if (!payload.amount || payload.amount <= 0) {
//       alert("Please enter amount");
//       return;
//     }
//     console.log("Submitting payment:", payload);
//     alert("Payment initiated");
//     OnlinePayment()
//   };

//   return (
//     <>
//       <div className="p-2 ieoi d-flex align-items-center h-100vh justify-content-center">
//         <div className="card payment_container p-3">
//           <img className="mx-auto" src={client.logo} alt="HDFCLOGO" />
//           <hr className="my-2" />
//           <h2 className="text-center center_title type_font">
//             Make Online Payment
//           </h2>

//           <Form>
//             {/* Step 1: Panel Code */}
//             <Form.Group
//               as={Row}
//               className="mb-3 d-flex align-items-center justify-content-center"
//             >
//               <Form.Label className="pb-0" column sm="12">
//                 Verify Panel Code:
//               </Form.Label>
//               <Col>
//                 <Form.Control
//                   type="text"
//                   name="panelCode"
//                   value={payload.panelCode}
//                   onChange={handleInputChange}
//                   placeholder="Enter Panel Code to Verify"
//                   disabled={verified}
//                 />
//               </Col>
//               <Button
//                 variant="primary"
//                 className="rounded px-3 py-2 ms-2"
//                 onClick={handleVerifyPanel}
//                 disabled={verified}
//               >
//                 Verify
//               </Button>
//             </Form.Group>

//             {/* Step 2: Only show if verified */}
//             {verified && (
//               <>
//                 <Form.Group
//                   as={Row}
//                   className="mb-2 d-flex align-items-center justify-content-center"
//                 >
//                   <Form.Label className="pb-0" column sm="12">
//                     Panel Name:
//                   </Form.Label>
//                   <Col>
//                     <Form.Control
//                       type="text"
//                       name="panelName"
//                       value={payload.panelName}
//                       readOnly
//                     />
//                   </Col>
//                 </Form.Group>

//                 <Form.Group
//                   as={Row}
//                   className="mb-2 d-flex align-items-center justify-content-center"
//                 >
//                   <Form.Label className="pb-0" column sm="12">
//                     Amount:
//                   </Form.Label>
//                   <Col>
//                     <Form.Control
//                       type="number"
//                       name="amount"
//                       value={payload.amount}
//                       onChange={handleInputChange}
//                       min={0}
//                       placeholder="Enter Amount in rupees"
//                     />
//                   </Col>
//                 </Form.Group>

//                 <Form.Group
//                   as={Row}
//                   className="mb-2 d-flex align-items-center justify-content-center"
//                 >
//                   <Form.Label className="pb-0" column sm="12">
//                     Payment Remarks:
//                   </Form.Label>
//                   <Col>
//                     <Form.Control
//                       type="text"
//                       name="remarks"
//                       value={payload.remarks}
//                       onChange={handleInputChange}
//                       placeholder="Enter payment remarks"
//                     />
//                   </Col>
//                 </Form.Group>

//                 <div className="d-flex justify-content-between mt-3">
//                   <Button
//                     variant="success"
//                     className="rounded px-4 py-2"
//                     onClick={handleSubmitPayment}
//                   >
//                     Pay Now
//                   </Button>

//                   <Button
//                     variant="danger"
//                     className="rounded px-4 py-2"
//                     onClick={handleReset}
//                   >
//                     Reset
//                   </Button>
//                 </div>
//               </>
//             )}

//             <Col sm="12" className="d-flex justify-content-center mt-3">
//               <img className="mx-auto" src={logo_Razorpay} alt="Razorpay" />
//             </Col>
//           </Form>
//         </div>
//       </div>
//       {isRazorPayOpen && (
//         <RazorPay
//           AnotherPageCommonFunction={saveData}
//           IsOpen={true}
//           payload={{
//             ...formData,
//             amount: form?.amount,
//             currency: "INR",
//             tnx_type: "Client",
//             receipt: paymenyId?.receipt,
//             key_id: paymenyId?.key_id,
//             key_secret: paymenyId?.key_secret,
//           }}
//           setIsRazorPayOpen={setIsRazorPayOpen}
//         />
//       )}
//     </>
//   );
// };

// export default VerifyPanelCode;

import React, { useState } from "react";
// import HDFCLOGO from "../../assets/image/HDFCLOGO_new.png";
import "./Gateway.css";
import { Button, Col, Form, Row } from "react-bootstrap";
import logo_Razorpay from "../../assets/image/logo_Razorpay.png";
import HDFCLOGO from "../../assets/image/HDFClogo.png";
import { axiosInstance } from "../../utils/axiosInstance";
import { notify } from "../../utils/utils";
import { toast } from "react-toastify"; // Missing import
import Clients from "../../Config/Clients";
import RazorPay from "../Payment/RazorPay";

  const VerifyPanelCode = () => {
  const hostWithPort = window.location.host;
  const client = Clients[hostWithPort] || Clients[process.env.REACT_APP_DEFAULT_CLIENT || "uat-v9.itdoseinfo.com:8088"];



  const [isRazorPayOpen, setIsRazorPayOpen] = useState(false);
  const [payload, setPayload] = useState({
    panelName: "",
    amount: "",
    remarks: "",
    companyId: "",
  });

  const [formData, setFormData] = useState({
    paymentModeID: "",
    TransactionId: "",
    InvoiceNo: "",
    InvoiceAmount: "",
    ReceivedAmt: "0",
    PaymentMode: "Online Payment", // Removed redundant || ""
    BankName: "",
    CreditCardNo: "",
    DraftNo: "",
    ChequeNo: "",
    ChequeDate: new Date(),
    ReceiveDate: new Date(),
    RateTypeID: "",
    AdvanceAmtDate: new Date(),
    CreditNote: "1",
    Remarks: "",
    Type: "",
    CreditDebit: "",
  });

  const [paymentId, setPaymentId] = useState({ // Fixed typo
    receipt: "",
    key_id: "",
    key_secret: "",
  });

  const [verified, setVerified] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPayload((prev) => ({ ...prev, [name]: value }));

    if (name === 'panelCode') { // Use strict equality
      setFormData((prev) => ({ ...prev, RateTypeID: value }));
    }
    if (name === 'amount') { // Use strict equality
      setFormData((prev) => ({ ...prev, ReceivedAmt: value, InvoiceAmount: value }));
    }
  };

  const handleVerifyPanel = async () => {
    if (!payload.panelCode || payload.panelCode.length < 4) {
      notify("Enter a valid Panel Code", "error");
      return;
    }

    try {
      const res = await axiosInstance.post('PaymentGateway/GetPanelCode', {
        rateTypeCode: payload.panelCode,
      });

      if (!res?.data?.success) {
        notify(res?.data?.message, 'error');
        return;
      }

      const data = res?.data?.data?.[0];
      console.log("panel-data", data);

      notify(res?.data?.message || "Panel code verified successfully.");

      setPayload((prev) => ({
        ...prev,
        panelName: data?.PanelName || "",
        rateTypeId: data?.RateTypeId || "",
        companyId: data?.CompanyId || ""
      }));



      setFormData(prev => ({
        ...prev,
        RateTypeID: payload.panelCode
      }));

      setVerified(true);
    } catch (err) {
      notify(err?.response?.data?.message || 'Something went wrong!', 'error');
    }
  };

  const handleReset = () => {
    setPayload({
      panelCode: "",
      panelName: "",
      amount: "",
      remarks: "",
    });
    setFormData(prev => ({ ...prev, RateTypeID: "", ReceivedAmt: "0", InvoiceAmount: "" }));
    setVerified(false);
  };

  const OnlinePayment = async () => {
    if (!payload?.companyId) {
      notify("Something went wrong while payment proceed.", 'error');
      return;
    }

    try {
      const res = await axiosInstance.post("PaymentGateway/CreateOrderExcludeLogin", {
        amount: Number(payload.amount),
        rateTypeID: payload.rateTypeId,
        remarks: payload.remarks,
        rateTypeName: payload.panelName
      });

      const message = res?.data?.message;

      if (message?.payment_links?.web) {
        window.open(message?.payment_links?.web, "_self");
      } else if (message?.payment_capture === 1) {
        if (!message?.key_id) {
          toast.error("Payment configuration is missing. Please contact support.");
          return;
        }

        setPaymentId({
          receipt: message.receipt,
          key_id: message.key_id,
          key_secret: message.key_secret,
        });
        setIsRazorPayOpen(true);
      } else {
        handlePaymentSuccess();
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Error occurred while processing payment"
      );
    }
  };

  const handlePaymentSuccess = (transactionData = null) => {
    if (transactionData) {
      notify("Payment completed successfully!", "success");
    }
    setIsRazorPayOpen(false);
    // Optionally reset form or redirect
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!verified) {
      handleVerifyPanel();
    } else {
      handleSubmitPayment();
    }
  };

  const handleSubmitPayment = () => {
    if (!payload.amount || Number(payload.amount) <= 0) {
      notify("Please enter a valid amount", "error");
      return;
    }

    OnlinePayment();
  };

  return (
    <>
      <div className="p-2 ieoi d-flex align-items-center h-100vh justify-content-center">
        <div className="card payment_container p-3">
          <img className="mx-auto" src={client.logo} alt="Client Logo" />
          <hr className="my-2" />
          <h2 className="text-center center_title type_font">
            Make Online Payment
          </h2>

          <Form onSubmit={handleSubmit}>
            <Form.Group as={Row} className="mb-3 d-flex align-items-center justify-content-center">
              <Form.Label className="pb-0" column sm="12">
                Verify Panel Code:
              </Form.Label>
              <Col>
                <Form.Control
                  type="text"
                  name="panelCode"
                  value={payload.panelCode}
                  onChange={handleInputChange}
                  placeholder="Enter Panel Code to Verify"
                  disabled={verified}
                />
              </Col>
              <Button
                variant="primary"
                type="submit"
                className="rounded px-3 py-2 ms-2"
                disabled={verified}
              >
                Verify
              </Button>
            </Form.Group>

            {verified && (
              <>
                <Form.Group as={Row} className="mb-2 d-flex align-items-center justify-content-center">
                  <Form.Label className="pb-0" column sm="12">
                    Panel Name:
                  </Form.Label>
                  <Col>
                    <Form.Control
                      type="text"
                      name="panelName"
                      value={payload.panelName}
                      readOnly
                    />
                  </Col>
                </Form.Group>

                <Form.Group as={Row} className="mb-2 d-flex align-items-center justify-content-center">
                  <Form.Label className="pb-0" column sm="12">
                    Amount:
                  </Form.Label>
                  <Col>
                    <Form.Control
                      type="number"
                      name="amount"
                      value={payload.amount}
                      onChange={handleInputChange}
                      min={1}
                      placeholder="Enter Amount in rupees"
                    />
                  </Col>
                </Form.Group>

                <Form.Group as={Row} className="remarks mb-2 d-flex align-items-center justify-content-center">
                  <Form.Label className="pb-0" column sm="12">
                    Payment Remarks:
                  </Form.Label>
                  <Col>
                    <Form.Control
                      as="textarea"
                      // type="text"
                      name="remarks"
                      value={payload.remarks}
                      onChange={handleInputChange}
                      placeholder="Enter payment remarks"
                    />
                  </Col>
                </Form.Group>

                <div className="d-flex justify-content-between mt-3">
                  <Button
                    variant="success"
                    type="submit"
                    className="rounded px-4 py-2"
                  >
                    Pay Now
                  </Button>

                  <Button
                    variant="danger"
                    className="rounded px-4 py-2"
                    onClick={handleReset}
                  >
                    Reset
                  </Button>
                </div>
              </>
            )}

            <Col sm="12" className="d-flex justify-content-center mt-3">
              <img className="mx-auto" src={HDFCLOGO} alt="HDFC" />
            </Col>
          </Form>
        </div>
      </div>

      {isRazorPayOpen && (
        <RazorPay
          AnotherPageCommonFunction={handlePaymentSuccess}
          IsOpen={true}
          payload={{
            ...formData,
            amount: payload.amount,
            currency: "INR",
            tnx_type: "Client",
            receipt: paymentId.receipt,
            key_id: paymentId.key_id,
            key_secret: paymentId.key_secret,
          }}
          setIsRazorPayOpen={setIsRazorPayOpen}
          requestComingFrom={'publicPage'}
        />
      )}
    </>
  );
};

export default VerifyPanelCode;
