import React, { useState } from "react";
import { toast } from "react-toastify";
import { axiosInstance } from "../../utils/axiosInstance";
import Loading from "../../components/loader/Loading";
import Input from "../../components/formComponent/Input";
import { Dialog } from "primereact/dialog";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { useTranslation } from "react-i18next";
import { SaveButton } from "../../components/UI/CustomButton";
const AdvancePaymentCreditModal = ({
  onhandleClose,
  CreditModalShow,
  setCreditModalShow,
}) => {
  const [loading, setLoading] = useState(false);
  const [payload, setPayload] = useState({
    CreditDebitNoteType: "",
  });

  const { t } = useTranslation();
  const handleChange = (e) => {
    const { name, value } = e?.target;
    setPayload({ ...payload, [name]: value });
  };

  const handleSave = () => {
    if (payload?.CreditDebitNoteType == "") {
      toast.error("Please Enter CreditDebitCardType.");
    } else {
      setLoading(true);
      axiosInstance
        .post("Accounts/SaveCreditDebitNote", {
          CreditDebitNote: payload?.CreditDebitNoteType,
        })
        .then((res) => {
          toast.success(res?.data?.message);
          setCreditModalShow(false);
          onhandleClose();
          setLoading(false);
        })
        .catch((err) => {
          toast.error(
            err?.response?.data?.message
              ? err?.response?.data?.message
              : "Something went wrong",
          );
        });
      setLoading(false);
    }
  };
  const theme = useLocalStorage("theme", "get");
  return (
    <>
      <Dialog
        style={{ width: "300px" }}
        header={t("New Credit/Debit Note Type")}
        onHide={() => setCreditModalShow(false)}
        className={theme}
        visible={CreditModalShow}
      >
        <>
          <div className="row">
            <div className="col-sm-12">
              <Input
                id="CreditDebitNoteType"
                lable="Credit Debit Note Type"
                placeholder=" "
                name="CreditDebitNoteType"
                max={30}
                value={payload?.CreditDebitNoteType}
                onChange={handleChange}
              />
            </div>{" "}
          </div>
          <div className="row">
            {loading ? (
              <Loading />
            ) : (
              <div className="col-sm-4">
                <SaveButton
                  text={"Save"}
                   onClick={handleSave}
                />
              </div>
            )}
          </div>
        </>
      </Dialog>
    </>
  );
};
export default AdvancePaymentCreditModal;
