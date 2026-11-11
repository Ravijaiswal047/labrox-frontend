import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import moment from "moment";
import { axiosInstance } from "../../utils/axiosInstance";
import { OnlinePaymentValidationSchema } from "../../utils/Schema";
import ReactSelect from "../../components/formComponent/ReactSelect";
import Input from "../../components/formComponent/Input";
import Loading from "../../components/loader/Loading";
import Accordion from "@app/components/UI/Accordion";
import RazorPay from "../Payment/RazorPay";
const OnlinePaymentPage = () => {
  const [payload, setPayload] = useState({
    RateTypeName: "",
    RateTypeId: "",
    Amount: "",
    Remarks: "",
    save: false,
    currency: "INR",
  });
  const [rateType, setRateType] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErros] = useState({});
  const [isRazorPayOpen, setIsRazorPayOpen] = useState(false);
  const [paymenyId, setPaymentId] = useState({
    receipt: "",
    key_id: "",
    key_secret: "",
  });
  const getAccessRateType = () => {
    axiosInstance
      .get("RateType/getAccessRateType")
      .then((res) => {
        let data = res.data.message;
        let RateType = data.map((ele) => {
          return {
            value: ele.RateTypeID,
            label: ele.Rate,
          };
        });
        RateType.unshift({ label: "Select RateType", value: "" });
        setRateType(RateType);
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    getAccessRateType();
  }, []);
  const saveData = (data) => {
    setIsRazorPayOpen(false);
    setLoading(false);
    setPayload({
      RateTypeName: "",
      RateTypeId: "",
      Amount: "",
      Remarks: "",
      save: false,
      currency: "INR",
    });
    setPaymentId({
      receipt: "",
      key_id: "",
      key_secret: "",
    });
    setErros({});
  };
  const IsOnlinePayment = () => {
    axiosInstance
      .get("RazorPay/Otherpayment")
      .then((res) => {
        console.log(res);
        if (res?.data?.message?.payment_capture == 1) {
          setIsRazorPayOpen(true);

          setPaymentId({
            receipt: res?.data?.message?.receipt,
            key_id: res?.data?.message?.key_id,
            key_secret: res?.data?.message?.key_secret,
          });
        } else {
          toast.error("You have not right to do Online Payment");
        }
      })
      .catch((err) => {
        setIsRazorPayOpen(false);
        toast.error(
          err?.data?.response?.message
            ? err?.data?.response?.message
            : "Error Occur",
        );
      });
  };
  const HandleSubmit = () => {
    const generatedError = OnlinePaymentValidationSchema(payload);
    if (generatedError === "") {
      if (payload?.Amount < 100) {
        toast.error("Minimum Amount Must be greator than 100");
      } else IsOnlinePayment();
    } else {
      setErros(generatedError);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPayload({
      ...payload,
      [name]: value?.trim(),
    });
  };

  const handleReset = () => {
    setPayload({
      RateTypeName: "",
      RateTypeId: "",
      Amount: "",
      Remarks: "",
      save: false,
      currency: "INR",
    });
    setErros({});
    setLoading(false);
    setIsRazorPayOpen(false);
  };
  console.log(isRazorPayOpen, payload);
  const { t } = useTranslation();
  return (
    <>
      {isRazorPayOpen && (
        <RazorPay
          AnotherPageCommonFunction={saveData}
          IsOpen={isRazorPayOpen}
          payload={{
            ...payload,
            amount: payload?.Amount,
            currency: "INR",
            tnx_type: "Client",
            receipt: paymenyId?.receipt,
            key_id: paymenyId?.key_id,
            key_secret: paymenyId?.key_secret,
            AdvanceAmtDate: moment(new Date()).format("DD-MMM-YYYY"),
            BankName: "",
            ChequeDate: "",
            ChequeNo: "",
            CreditCardNo: "",
            CreditDebit: "",
            CreditNote: "1",
            DraftNo: "",
            InvoiceNo: "",
            PaymentMode: "Online Payment",
            paymentModeID: "124",
            RateTypeID: payload.RateTypeId,
            ReceivedAmt: payload?.Amount,
            ReceiveDate: moment(new Date()).format("DD-MMM-YYYY"),
            Remarks: "Online",
            TransactionId: "",
            Type: "",
            InvoiceAmount: payload?.Amount,
          }}
          setIsRazorPayOpen={setIsRazorPayOpen}
        />
      )}
      <Accordion
        name={t("Online Payment Page")}
        isBreadcrumb={true}
        defaultValue={true}
      >
        <div className="row  px-2 mt-2 mb-1">
          <div className="col-md-2">
            <ReactSelect
              dynamicOptions={rateType}
              value={payload?.RateTypeId}
              placeholderName={t("Rate Type")}
              className="required-fields"
              onChange={(_, e) => {
                setPayload({
                  ...payload,
                  RateTypeName: e?.label,
                  RateTypeId: e?.value,
                });
              }}
            />
            {payload?.RateTypeId === "" && (
              <span className="error-message">{errors?.RateTypeId}</span>
            )}
          </div>

          <div className="col-md-2 col-md-2">
            <Input
              lable="Amount"
              placeholder=" "
              id="Amount"
              name="Amount"
              type="number"
              className="required-fields"
              value={payload?.Amount}
              onChange={handleChange}
            />
            {payload?.Amount === "" && (
              <span className="error-message">{errors?.Amount}</span>
            )}
          </div>

          <div className="col-md-2">
            <Input
              lable="Enter Remarks"
              placeholder=" "
              id="Enter Remarks"
              name="Remarks"
              value={payload?.Remarks}
              onChange={handleChange}
            />{" "}
          </div>
          <div className="col-md-1">
            {loading || isRazorPayOpen ? (
              <Loading />
            ) : (
              <button
                className="btn btn-block btn-success btn-sm"
                onClick={HandleSubmit}
              >
                {t("Save")}
              </button>
            )}
          </div>

          <div className="col-md-1">
            <button
              type="button"
              className="btn btn-block btn-danger btn-sm"
              onClick={handleReset}
            >
              {t("Reset")}
            </button>
          </div>
        </div>
      </Accordion>
    </>
  );
};

export default OnlinePaymentPage;
