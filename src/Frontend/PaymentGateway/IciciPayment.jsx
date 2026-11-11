import React, { useEffect, useState } from "react";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { Button, Modal, Col, Form, Row } from "react-bootstrap";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { axiosInstance } from "../../utils/axiosInstance";
import { useTranslation } from "react-i18next";
import { logoList, notify } from "../../utils/utils";
import ICICIlogo from "../../assets/image/icici-logo.png";
import "./PaymentModal.css";
import { useSelector, useDispatch } from "react-redux";
import { setOpenIciciPaymentModal } from "../../store/reducers/PaymentSlice/PaymentSlice";
import { setLoading } from "../../store/reducers/loadingSlice/loadingSlice";

const IciciPayment = () => {
  const [t] = useTranslation();
  const dispatch = useDispatch();
  const { openIciciPaymentModal } = useSelector((state) => state.PaymentSlice);
  const userLocalData = useLocalStorage("userData", "get");

  const initFormValue = { amount: "", remarks: "", rateType: "" };
  const [form, setForm] = useState(initFormValue);
  const [rateTypeList, setRateTypeList] = useState([]);
  const quickAmounts = [200, 500, 1000, 1500];

  const handleClose = () => {
    setForm(initFormValue);
    dispatch(setOpenIciciPaymentModal(false));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleQuickSelect = (val) => {
    setForm((prev) => ({ ...prev, amount: val.toString() }));
  };

  const handleReactSelectChange = (name, e) => {
    setForm((prev) => ({ ...prev, [name]: e?.value }));
  };

  const fetchRateTypes = async () => {
    try {
      const res = await axiosInstance.post("Centre/GetRateType", {
        CentreId: [userLocalData?.DefaultCentre || userLocalData?.DefaultCentreID],
      });
      const list = res?.data?.message.map((item) => ({
        label: item?.RateTypeName,
        value: item?.RateTypeID,
      }));
      setRateTypeList(list);
      setForm((prev) => ({ ...prev, rateType: list?.[0]?.value }));
    } catch (err) {
      // silent — rate types not critical to render
    }
  };

  const iciciPaymentGateway = async () => {
    const selectedRateType = rateTypeList?.find((item) => item.value == form.rateType);
    dispatch(setLoading(true));
    await axiosInstance
      .post("ICICIPaymentGateway/CreateOrder", {
        amount: form.amount,
        rateTypeID: form.rateType,
        remarks: form.remarks,
        rateTypeName: selectedRateType?.label,
      })
      .then((res) => {
        const redirectURI = res?.data?.message?.redirectURI;
        dispatch(setOpenIciciPaymentModal(false));
        if (redirectURI) {
          window.open(redirectURI, "_self");
        } else {
          notify("Redirect URL not received", "error");
        }
      })
      .catch((err) => notify(err?.response?.data?.message || "Payment failed", "error"))
      .finally(() => dispatch(setLoading(false)));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.rateType) { notify("Kindly select RateType", "warn"); return; }
    if (!form.amount) { notify("Kindly enter amount", "warn"); return; }
    if (Number(form.amount) < 1) { notify("Amount should be greater than 0", "error"); return; }
    if (!form.remarks) { notify("Kindly enter Remarks", "warn"); return; }
    iciciPaymentGateway();
  };

  useEffect(() => {
    fetchRateTypes();
  }, []);

  console.log("uatlogo", userLocalData?.CompanyID)

  return (
    <Modal show={openIciciPaymentModal} centered onHide={handleClose}>
      <div className="p-0 ieoi d-flex align-items-center justify-content-center">
        <div className="payment_container p-3">
          <button className="modal-close-btn" onClick={handleClose}>×</button>

          <img
            className="mx-auto"
            src={
              logoList[userLocalData?.CompanyID] ||
              `https://elabassets.s3.ap-south-1.amazonaws.com/${userLocalData?.ImageLogo}`
            }
            alt="company logo"
          />
          <hr className="my-2" />

          <h1 className="health_title text-red d-flex flex-column align-items-center justify-content-center">
            <span>ICICI Payment Gateway</span>
          </h1>

          {rateTypeList?.length > 1 && (
            <div className="">
              <ReactSelect
                dynamicOptions={[...rateTypeList]}
                name="rateType"
                id="iciciRateType"
                removeIsClearable={true}
                placeholderName={t("RateType")}
                value={form.rateType}
                onChange={handleReactSelectChange}
              />
            </div>
          )}

          <Form onSubmit={handleSubmit}>
            <Form.Group as={Row} className="mb-2 d-flex flex-column align-items-center justify-content-center">
              <Form.Label className="pb-0" column sm="12">Enter Amount:</Form.Label>
              <Col sm="12">
                <Form.Control
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  placeholder="Enter amount"
                  min={1}
                />
              </Col>
            </Form.Group>

            <div className="d-flex flex-wrap justify-content-start">
              {quickAmounts.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  className={`amount-btn ${Number(form.amount) === amt ? "active" : ""}`}
                  onClick={() => handleQuickSelect(amt)}
                >
                  ₹{amt}
                </button>
              ))}
            </div>

            <Form.Group as={Row} className="mb-3 d-flex flex-column align-items-center justify-content-center">
              <Form.Label className="pb-0" column sm="12">Remarks:</Form.Label>
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

            <Button type="submit" className="btn-submit rounded py-3 fw-bold">
              Proceed to Pay via ICICI
            </Button>

            <Col sm="12" className="d-flex justify-content-center mt-3">
                <img className="mx-auto" src={ICICIlogo} alt="Razorpay" />
            </Col>
          </Form>
        </div>
      </div>
    </Modal>
  );
};

export default IciciPayment;
