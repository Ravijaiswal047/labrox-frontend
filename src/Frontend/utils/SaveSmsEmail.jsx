import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { SmsEmail } from "../../utils/Schema";
import { toast } from "react-toastify";
import Tables from "../../components/UI/customTable";
import { Dialog } from "primereact/dialog";
import Input from "../../components/formComponent/Input";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { number } from "../../utils/helpers";

const SaveSmsEmail = ({
  show6,
  state,
  LTData,
  setShow6,
  saveSmsEmail,
  setSaveSmsEmail,
  autoEmail,
  handleSaveSmsEmailSave,
}) => {
  const { t } = useTranslation();
  const [err, setErr] = useState({});
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const [newSaveSmsEmail, setNewSaveSmsEmail] = useState({
    ...saveSmsEmail,
    SmsToPatient:
      saveSmsEmail?.SmsToPatient != "" && LTData?.BTB != 1
        ? saveSmsEmail?.SmsToPatient
        : state?.Mobile != "" && LTData?.BTB != 1
          ? state?.Mobile
          : "",
    EmailToPatient:
      saveSmsEmail?.EmailToPatient != "" && LTData?.BTB != 1
        ? saveSmsEmail?.EmailToPatient
        : state?.Email != "" && LTData?.BTB != 1
          ? state?.Email
          : "",
    SmsToDoctor:
      saveSmsEmail?.SmsToDoctor != ""
        ? saveSmsEmail?.SmsToDoctor
        : LTData?.DoctorMobile != ""
          ? LTData?.DoctorMobile
          : "",
    EmailToDoctor:
      saveSmsEmail?.EmailToDoctor != ""
        ? saveSmsEmail?.EmailToDoctor
        : LTData?.DoctorEmail != ""
          ? LTData?.DoctorEmail
          : "",
    SmsToClient:
      saveSmsEmail?.SmsToClient != ""
        ? saveSmsEmail?.SmsToClient
        : state?.RateTypePhone != "" && state?.RateTypePhone
          ? state?.RateTypePhone
          : "",
    EmailToClient:
      saveSmsEmail?.EmailToClient != ""
        ? saveSmsEmail?.EmailToClient
        : state?.RateTypeEmail != "" && state?.RateTypeEmail
          ? state?.RateTypeEmail
          : "",
    IsCourier:
      saveSmsEmail?.IsCourier != ""
        ? saveSmsEmail?.IsCourier
        : LTData?.IsCourier != ""
          ? LTData?.IsCourier
          : "",
    IsActiveSmsToPatient:
      LTData?.BTB != 1 ? saveSmsEmail?.IsActiveSmsToPatient : 0,
    IsActiveSmsToDoctor: saveSmsEmail?.IsActiveSmsToDoctor,
    IsActiveEmailToPatient:
      LTData?.BTB != 1 ? saveSmsEmail?.IsActiveEmailToPatient : 0,
    IsActiveEmailToDoctor: saveSmsEmail?.IsActiveEmailToDoctor,
    IsActiveSmsToClient: saveSmsEmail?.IsActiveSmsToClient,
    IsActiveEmailToClient: saveSmsEmail?.IsActiveEmailToClient,
    IsWhatsappRequired:
      saveSmsEmail?.IsWhatsappRequired !== ""
        ? saveSmsEmail?.IsWhatsappRequired
        : LTData?.IsWhatsappRequired !== ""
          ? LTData?.IsWhatsappRequired
          : "",
  });
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setNewSaveSmsEmail({
      ...newSaveSmsEmail,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    });
  };

  const handleSave = () => {
    const generatedError = SmsEmail(newSaveSmsEmail);

    if (generatedError == "") {
      setSaveSmsEmail(newSaveSmsEmail);
      Object.values({
        IsPatientSMS: newSaveSmsEmail?.SmsToPatient,
        IsPatientEmail: newSaveSmsEmail?.EmailToPatient,
        IsDoctorSMS: newSaveSmsEmail?.SmsToDoctor,
        IsDoctorEmail: newSaveSmsEmail?.EmailToDoctor,
        IsClientSMS: newSaveSmsEmail?.SmsToClient,
        IsClientEmail: newSaveSmsEmail?.EmailToClient,
        IsCourier: newSaveSmsEmail?.IsCourier,
        IsWhatsappRequired: newSaveSmsEmail?.IsWhatsappRequired,
      }).some((value) => value != "") &&
        toast.success("Details Saved Successfully");

      handleClose(newSaveSmsEmail);
    } else {
      setErr(generatedError);
    }
  };

  function handleClose(data) {
    autoEmail?.flag &&
      handleSaveSmsEmailSave(autoEmail?.order_id, data ? data : saveSmsEmail);
    setShow6(false);
  }
  const theme = useLocalStorage("theme", "get");
  return (
    <Dialog
      header={t("Sms & Email Details")}
      onHide={() => handleClose({})}
      top={"25%"}
      visible={show6}
      className={theme}
      style={{ width: "85vw", maxWidth: "650px" }}
    >
      <Tables>
        <thead>
          <tr>
            <th className="text-center">{t("To")}</th>
            <th className="text-center"> {t("SMS")}</th>
            <th className="text-center">{t("EMAIL")}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <label>{t("Patient")}</label>
            </td>

            <td data-title="Patient Checkbox">
              <div
                className="row"
                style={{ display: "flex", alignItems: "center" }}
              >
                <div className="col-sm-1">
                  <input
                    type="checkbox"
                    name="IsActiveSmsToPatient"
                    checked={newSaveSmsEmail?.IsActiveSmsToPatient}
                    onChange={handleChange}
                    disabled={LTData?.BTB == 1 ? true : false}
                  />
                </div>
                <div className="col-sm-10">
                  <Input
                    className="select-input-box form-control input-sm"
                    name="SmsToPatient"
                    type="number"
                    onInput={(e) => number(e, 10)}
                    value={newSaveSmsEmail?.SmsToPatient}
                    onChange={handleChange}
                    disabled={LTData?.BTB == 1 ? true : false}
                  />

                  {newSaveSmsEmail?.SmsToPatient.length > 0 &&
                    newSaveSmsEmail?.SmsToPatient.length < 10 && (
                      <span className="error-message">{err?.SmsToPatient}</span>
                    )}
                </div>
              </div>
            </td>
            <td>
              <div
                className="row"
                style={{ display: "flex", alignItems: "center" }}
              >
                <div className="col-sm-1">
                  <input
                    type="checkbox"
                    name="IsActiveEmailToPatient"
                    checked={newSaveSmsEmail?.IsActiveEmailToPatient}
                    onChange={handleChange}
                    disabled={LTData?.BTB == 1 ? true : false}
                  />
                </div>
                <div className="col-sm-10">
                  <Input
                    className="select-input-box form-control input-sm"
                    name="EmailToPatient"
                    type="email"
                    disabled={LTData?.BTB == 1 ? true : false}
                    value={newSaveSmsEmail?.EmailToPatient}
                    onChange={handleChange}
                  />
                  {newSaveSmsEmail?.EmailToPatient?.trim().length > 0 &&
                    !emailRegex.test(newSaveSmsEmail?.EmailToPatient) && (
                      <span className="error-message">
                        {err?.EmailToPatient}
                      </span>
                    )}
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td>
              <label>{t("Doctor")}</label>
            </td>

            <td data-title="Doctor Checkbox">
              <div
                className="row"
                style={{ display: "flex", alignItems: "center" }}
              >
                <div className="col-sm-1">
                  <input
                    type="checkbox"
                    name="IsActiveSmsToDoctor"
                    checked={newSaveSmsEmail?.IsActiveSmsToDoctor}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-sm-10">
                  <Input
                    className="select-input-box form-control input-sm"
                    name="SmsToDoctor"
                    type="number"
                    onInput={(e) => number(e, 10)}
                    value={newSaveSmsEmail?.SmsToDoctor}
                    onChange={handleChange}
                  />
                  {newSaveSmsEmail?.SmsToDoctor.length > 0 &&
                    newSaveSmsEmail?.SmsToDoctor.length < 10 && (
                      <span className="error-message">{err?.SmsToDoctor}</span>
                    )}
                </div>
              </div>
            </td>
            <td>
              <div
                className="row"
                style={{ display: "flex", alignItems: "center" }}
              >
                <div className="col-sm-1">
                  <input
                    type="checkbox"
                    checked={newSaveSmsEmail?.IsActiveEmailToDoctor}
                    name="IsActiveEmailToDoctor"
                    onChange={handleChange}
                  />
                </div>
                <div className="col-sm-10">
                  <Input
                    className="select-input-box form-control input-sm"
                    name="EmailToDoctor"
                    type="email"
                    value={newSaveSmsEmail?.EmailToDoctor}
                    onChange={handleChange}
                  />
                  {newSaveSmsEmail?.EmailToDoctor.trim().length > 0 &&
                    !emailRegex.test(newSaveSmsEmail?.EmailToDoctor) && (
                      <span className="error-message">
                        {err?.EmailToDoctor}
                      </span>
                    )}
                </div>
              </div>
            </td>
          </tr>

          <tr>
            <td>
              <label>{t("Client")}</label>
            </td>

            <td data-title="Client Checkbox">
              <div
                className="row"
                style={{ display: "flex", alignItems: "center" }}
              >
                <div className="col-sm-1">
                  <input
                    type="checkbox"
                    name="IsActiveSmsToClient"
                    checked={newSaveSmsEmail?.IsActiveSmsToClient}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-sm-10">
                  <Input
                    className="select-input-box form-control input-sm"
                    name="SmsToClient"
                    type="number"
                    onInput={(e) => number(e, 10)}
                    value={newSaveSmsEmail?.SmsToClient}
                    onChange={handleChange}
                  />
                  {newSaveSmsEmail?.SmsToClient.length > 0 &&
                    newSaveSmsEmail?.SmsToClient.length < 10 && (
                      <span className="error-message">{err?.SmsToClient}</span>
                    )}
                </div>
              </div>
            </td>
            <td>
              <div
                className="row"
                style={{ display: "flex", alignItems: "center" }}
              >
                <div className="col-sm-1">
                  <input
                    type="checkbox"
                    checked={newSaveSmsEmail?.IsActiveEmailToClient}
                    name="IsActiveEmailToClient"
                    onChange={handleChange}
                  />
                </div>
                <div className="col-sm-10">
                  <Input
                    className="select-input-box form-control input-sm"
                    name="EmailToClient"
                    type="email"
                    value={newSaveSmsEmail?.EmailToClient}
                    onChange={handleChange}
                  />
                  {newSaveSmsEmail?.EmailToClient.trim().length > 0 &&
                    !emailRegex.test(newSaveSmsEmail?.EmailToClient) && (
                      <span className="error-message">
                        {err?.EmailToClient}
                      </span>
                    )}
                </div>
              </div>
            </td>
          </tr>
          <div className="row"></div>
          <tr>
            <td>
              <label>{t("Courier")}</label>
            </td>
            <td data-title="Courier Checkbox">
              <div className="row">
                <div className="col-sm-1">
                  <input
                    type="checkbox"
                    checked={newSaveSmsEmail?.IsCourier}
                    name="IsCourier"
                    onChange={handleChange}
                  />
                </div>
              </div>
            </td>
            <td></td>
          </tr>
          <tr>
            <td>
              <label>{t("Whatsapp Not Required")}</label>
            </td>
            <td data-title="Whatsapp Checkbox">
              <div className="row">
                <div className="col-sm-1">
                  <input
                    type="checkbox"
                    checked={newSaveSmsEmail?.IsWhatsappRequired}
                    name="IsWhatsappRequired"
                    onChange={handleChange}
                  />
                </div>
              </div>
            </td>
            <td></td>
          </tr>
        </tbody>
      </Tables>

      <div className="row mt-2">
        <div className="col-sm-2">
          <button className="btn  btn-success" onClick={handleSave}>
            {t("Save")}
          </button>
        </div>
      </div>
    </Dialog>
  );
};

export default SaveSmsEmail;
