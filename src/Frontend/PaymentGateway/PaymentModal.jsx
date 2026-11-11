import React, { useEffect, useState } from "react";
import "./PaymentModal.css";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import HDFCLOGO from "../../assets/image/HDFCLOGO_new.png";
import ldpl_logo from "../../assets/image/ldpl_logo.png";
import logo_Razorpay from "../../assets/image/logo_Razorpay.png";
import { Button, Modal, Col, Form, Row } from "react-bootstrap";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { axiosInstance } from "../../utils/axiosInstance";
import { useTranslation } from "react-i18next";
import RazorPay from "../Payment/RazorPay";
import { logoList, notify } from "../../utils/utils";
import { useDispatch } from "react-redux";
import { setOpenRazorPayPaymentModal } from "../../store/reducers/PaymentSlice/PaymentSlice";
import { useSelector } from "react-redux";

const PaymentModal = () => {
  const [t] = useTranslation();
  const dispatch = useDispatch();
  const {openRazorPayPaymentModal} = useSelector(state=>state.PaymentSlice)
  const theme = useLocalStorage("theme", "get");
  const userLocalData = useLocalStorage("userData", "get");
  const [show, setShow] = useState(false);
  const [isRazorPayOpen, setIsRazorPayOpen] = useState(false);
  const initFormValue = {
    amount: "",
    remarks: "",
    rateType: "",
  };
  console.log('openRazorPayPaymentModal', openRazorPayPaymentModal)
  const [form, setForm] = useState(initFormValue);
  const initFormData_value = {
    paymentModeID: "",
    TransactionId: "",
    InvoiceNo: "",
    InvoiceAmount: "",
    ReceivedAmt: "0",
    PaymentMode: "Online Payment" || "",
    BankName: "",
    CreditCardNo: "",
    DraftNo: "",
    ChequeNo: "",
    ChequeDate: new Date(),
    ReceiveDate: new Date(),
    RateTypeID: form?.rateType || "",
    AdvanceAmtDate: new Date(),
    CreditNote: "1",
    Remarks: "",
    Type: "",
    CreditDebit: "",
  };

  const [formData, setFormData] = useState(initFormData_value);
  const [paymenyId, setPaymentId] = useState({
    receipt: "",
    key_id: "",
    key_secret: "",
  });

  const handleClose = () => dispatch(setOpenRazorPayPaymentModal(false));
  const handleShow = () => dispatch(setOpenRazorPayPaymentModal(true));
  const [rateTypeList, setRateTypeList] = useState([]);
  const quickAmounts = [200, 500, 1000, 1500];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === "amount") {
      setFormData((prev) => ({
        ...prev,
        InvoiceAmount: value,
        ReceivedAmt: value,
      }));
    }
    if (name === "remarks") {
      setFormData((prev) => ({ ...prev, Remarks: value }));
    }
  };

  const handleQuickSelect = (val) => {
    setForm((prev) => ({ ...prev, amount: val.toString() }));
  };

  console.log("formData", formData);

  const fetchRateTypes = async (id) => {
    try {
      const res = await axiosInstance.post("Centre/GetRateType", {
        CentreId: [userLocalData?.DefaultCentre],
      });
      const listRes = res?.data?.message.map((item) => ({
        label: item?.RateTypeName,
        value: item?.RateTypeID,
      }));
      setRateTypeList(listRes);
      setForm((prev) => ({ ...prev, rateType: listRes?.[0]?.value }));
      setFormData((prev) => ({ ...prev, RateTypeID: listRes?.[0]?.value }));
    } catch (err) {
      console.log(err);
    }
  };

  const handleReactSelectChange = (name, e) => {
    setForm((prev) => ({ ...prev, [name]: e?.value }));
    setFormData((prev) => ({ ...prev, RateTypeID: e?.value }));
  };

  const OnlinePayment = async () => {
    await axiosInstance
      .get("RazorPay/Otherpayment")
      .then((res) => {
        if (res?.data?.message?.payment_capture == 1) {
          setIsRazorPayOpen(true);
          setPaymentId({
            receipt: res?.data?.message?.receipt,
            key_id: res?.data?.message?.key_id,
            key_secret: res?.data?.message?.key_secret,
          });
        } else {
          saveData();
        }
      })
      .catch((err) =>
        toast.error(
          err?.data?.response?.message
            ? err?.data?.response?.message
            : "Error Occur"
        )
      );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form?.rateType) {
      notify("Kindly select RateType", "warn");
      return;
    }
    if (!form?.amount) {
      notify("Kindly enter amount", "warn");
      return;
    }
    if (!form?.remarks) {
      notify("Kindly enter Remarks", "warn");
      return;
    }
    OnlinePayment();

    console.log("Form submitted:", form);
    // alert(`Submitted: ${JSON.stringify(form)}`);
  };

  const saveData = (data = "") => {
    setForm(initFormValue);
    setFormData(initFormData_value);
    setIsRazorPayOpen(false);
    setShow(false);
  };

  useEffect(() => {
    fetchRateTypes();
  }, []);

  return (
    <>
      {/* <Button onClick={handleShow} className="payment_icon">
        <i class="bi bi-wallet2 mb-0"></i>
      </Button> */}

      <Modal show={openRazorPayPaymentModal} centered onHide={handleClose}>
        <div className="p-0 ieoi d-flex align-items-center justify-content-center">
          <div className="payment_container p-3">
            {/* Close Button */}
            <button className="modal-close-btn" onClick={handleClose}>
              ×
            </button>
            {/* Bank Logo */}
            <img
              className="mx-auto"
              src={logoList[userLocalData?.CompanyID] || 
                `https://elabassets.s3.ap-south-1.amazonaws.com/${userLocalData?.ImageLogo}`}
              alt="company logo"
            />
            <hr className="my-2" />

            <h1 className="health_title text-red d-flex flex-column align-items-center justify-content-center">
              {/* <span>Paying To Olivhealth Path Lab</span> */}
              <span>Payment Gateway</span>
            </h1>

            {rateTypeList?.length > 1 && (
              <div className="">
                <ReactSelect
                  dynamicOptions={[...rateTypeList]}
                  name="rateType"
                  lable={t("RateType")}
                  id="rateType"
                  removeIsClearable={true}
                  placeholderName={t("RateType")}
                  value={form?.rateType}
                  onChange={handleReactSelectChange}
                />
              </div>
            )}

            <Form onSubmit={handleSubmit}>
              {/* Enter Amount */}
              <Form.Group
                as={Row}
                className="mb-2 d-flex flex-column align-items-center justify-content-center"
              >
                <Form.Label className="pb-0" column sm="12">
                  Enter Amount:
                </Form.Label>
                <Col sm="12">
                  <Form.Control
                    type="number"
                    name="amount"
                    value={form.amount}
                    onChange={handleChange}
                    placeholder="Enter amount"
                    min={0}
                  />
                </Col>
              </Form.Group>

              {/* Quick Select Buttons */}
              <div className="d-flex flex-wrap justify-content-start">
                {quickAmounts.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    className={`amount-btn ${
                      Number(form.amount) === amt ? "active" : ""
                    }`}
                    onClick={() => handleQuickSelect(amt)}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>

              {/* Remarks */}
              <Form.Group
                as={Row}
                className="mb-3 d-flex flex-column align-items-center justify-content-center"
              >
                <Form.Label className="pb-0" column sm="12">
                  Remarks:
                </Form.Label>
                <Col sm="12">
                  <Form.Control
                    as="textarea"
                    name="remarks"
                    value={form.remarks}
                    onChange={handleChange}
                    placeholder="Enter remarks"
                  />
                </Col>
              </Form.Group>

              {/* Submit Button */}
              <Button type="submit" className="btn-submit rounded py-3 fw-bold">
                Proceed to Pay
              </Button>

              {/* Razorpay Logo */}
              <Col sm="12" className="d-flex justify-content-center mt-3">
                <img className="mx-auto" src={logo_Razorpay} alt="Razorpay" />
              </Col>
            </Form>
          </div>
        </div>
      </Modal>

      {isRazorPayOpen && (
        <RazorPay
          AnotherPageCommonFunction={saveData}
          IsOpen={true}
          payload={{
            ...formData,
            amount: form?.amount,
            currency: "INR",
            tnx_type: "Client",
            receipt: paymenyId?.receipt,
            key_id: paymenyId?.key_id,
            key_secret: paymenyId?.key_secret,
          }}
          setIsRazorPayOpen={setIsRazorPayOpen}
        />
      )}
    </>
  );
};

export default PaymentModal;
