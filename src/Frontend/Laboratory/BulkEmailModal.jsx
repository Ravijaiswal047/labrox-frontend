import React, { useState } from "react";
import { Dialog } from "primereact/dialog";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { toast } from "react-toastify";
import Input from "../../components/formComponent/Input";
import { axiosInstance } from "../../utils/axiosInstance";

import { useTranslation } from "react-i18next";
import Loading from "../../components/loader/Loading";
function BulkEmailModal({ data, onHide, componentName = "" }) {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const [emailData, setEmailData] = useState({
    emailId: "",
    cc: "",
    bcc: "",
  });

  const [errors, setErrors] = useState({
    emailId: false,
    cc: false,
    bcc: false,
  });
  const [load, setLoad] = useState(false);
  const { t } = useTranslation();
  console.log(data);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setEmailData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: !validateEmail(value),
    }));
  };

  const validateEmail = (email) => emailRegex.test(email) || email === "";

  const handleSendEmail = () => {
    let finalData = data?.data?.filter((ele) => ele?.isChecked);
    if (componentName === "DispatchReport") {
      finalData = data?.data;
    }
    const dataList = Array.isArray(finalData) ? finalData : [finalData].filter(Boolean);
    const hasApproved = dataList.some(
      (item) =>
        item?.Approved == 1 ||
        item?.IsApproved == 1 ||
        item?.isApprove == 1 ||
        item?._pli?.Approved == 1 ||
        item?._pli?.IsApproved == 1 ||
        item?.Status == 5 ||
        item?.Status == 6 ||
        item?._pli?.Status == 5 ||
        item?._pli?.Status == 6
    );

    if (!hasApproved) {
      toast.error(t("Cannot send unapproved report. Test result is not approved yet."));
      return;
    }

    const testidhash = finalData.map(
      (obj) => obj?.TestIDHash || obj?.TestIdHash,
    );
    // const finalData = data?.data?.reduce((acc, current) => {
    //   const findIndex = acc.findIndex(
    //     (ele) => ele?.LedgerTransactionNo === current?.LedgerTransactionNo
    //   );

    //   if (findIndex >= 0) {
    //     acc[findIndex].TestIDHash =
    //       acc[findIndex].TestIDHash + "," + current?.TestIDHash;
    //   } else {
    //     acc.push({
    //       PatientName: current?.PatientName,
    //       AgeGender: current?.AgeGender,
    //       LedgerTransactionNo: current?.LedgerTransactionNo,
    //       PatientEmail: current?.PatientEmail ?? "",
    //       DoctorEmail: current?.DoctorEmail ?? "",
    //       ClientEmail: current?.ClientEmail ?? "",
    //       ledgertransactionid: current?.ledgertransactionid,
    //       TestIDHash: current?.TestIDHash,
    //     });
    //   }
    //   return acc;
    // }, []);

    // console.log(finalData);

    // Validate all emails before sending
    const emailErrors = {
      emailId: !validateEmail(emailData.emailId),
      cc: !validateEmail(emailData.cc),
      bcc: !validateEmail(emailData.bcc),
    };

    setErrors(emailErrors);

    // If there are errors, prevent sending the email
    if (Object.values(emailErrors).includes(true)) {
      //   toast.error("Please enter valid email addresses.");
      return;
    }
    setLoad(true);
    axiosInstance
      .post("PatientRegistration/BulkEmail", {
        Cc: emailData?.cc,
        Bcc: emailData?.bcc,
        Emailto: emailData?.emailId,
        Testidhash: testidhash.join(","),
      })
      .then((res) => {
        setLoad(false);
        toast.success(res?.data?.message);
      })
      .catch((err) => {
        setLoad(false);
        toast.error(res?.data?.message);
      });
  };

  const isMobile = window.innerWidth <= 768;
  const theme = useLocalStorage("theme", "get");

  return (
    <Dialog
      header=""
      onHide={onHide}
      top={"100px"}
      visible={data?.modal}
      className={theme}
      style={{
        width: isMobile ? "80vw" : "40vw",
      }}
    >
      <div className="row">
        <label className="col-sm-2">{t("EmailID")} :</label>
        <div className="col-sm-10">
          <Input
            placeholder="Email"
            name="emailId"
            value={emailData.emailId}
            type="email"
            onChange={handleInputChange}
          />
          {errors.emailId && emailData.emailId && (
            <span className="error-message">{t("Enter a valid Email ID")}</span>
          )}
        </div>
      </div>

      <div className="row">
        <label className="col-sm-2">{t("CC")} :</label>
        <div className="col-sm-10">
          <Input
            placeholder="CC"
            name="cc"
            value={emailData.cc}
            type="email"
            onChange={handleInputChange}
          />
          {errors.cc && emailData.cc && (
            <span className="error-message">
              {t("Enter a valid CC Email ID")}
            </span>
          )}
        </div>
      </div>

      <div className="row">
        <label className="col-sm-2">{t("BCC")} :</label>
        <div className="col-sm-10">
          <Input
            placeholder="BCC"
            name="bcc"
            value={emailData.bcc}
            type="email"
            onChange={handleInputChange}
          />
          {errors.bcc && emailData.bcc && (
            <span className="error-message">
              {t("Enter a valid BCC Email ID")}
            </span>
          )}
        </div>
      </div>

      <div className="box-footer">
        <div className="row">
          <div className="col-sm-2">
            {load ? (
              <Loading />
            ) : (
              <button
                className="btn btn-block btn-success btn-sm"
                onClick={handleSendEmail}
              >
                {t("Send Email")}
              </button>
            )}
          </div>

          <div className="col-sm-2">
            <button
              className="btn btn-block btn-danger btn-sm"
              onClick={onHide}
            >
              {t("Close")}
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}

export default BulkEmailModal;
