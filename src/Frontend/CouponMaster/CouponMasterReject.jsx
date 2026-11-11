import React, { useState } from "react";
import { toast } from "react-toastify";
import { axiosInstance } from "../../utils/axiosInstance";
import { PreventSpecialCharacter } from "../../utils/helpers";
import { useTranslation } from "react-i18next";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import Input from "../../components/formComponent/Input";
import { Dialog } from "primereact/dialog";
import Loading from "../../components/loader/Loading";

const CouponMasterReject = ({ show, setShow, details }) => {
  const [reason, setReason] = useState("");
  console.log(details);
  const [load, setLoad] = useState(false);
  const handleChange = (e) => {
    if (PreventSpecialCharacter(e?.target?.value)) {
      setReason(e.target.value);
    }
  };
  const handleSaveRejectReason = () => {
    setLoad(true);
    console.log(reason);
    if (reason?.length < 3) {
      setLoad(false);
      toast.error("Reason must have atleast 3 characters");
    } else {
      axiosInstance
        .post("CouponMasterApproval/RejectCoupon", {
          CoupanID: details?.CoupanId,
          Remark: reason,
        })
        .then((res) => {
          setLoad(false);
          setShow(details);
          toast.success("Coupon Rejected Successfully");
        })
        .catch((err) => {
          setLoad(false);
          toast.error(
            err?.response?.data?.message
              ? err?.response?.data?.message
              : "Something Went Wrong",
          );
        });
    }
  };

  const { t } = useTranslation();

  const isMobile = window.innerWidth <= 768;

  const theme = useLocalStorage("theme", "get");

  return (
    <>
      <Dialog
        visible={show}
        className={theme}
        // header={t("Appointment")}
        onHide={() => {
          setShow();
        }}
        style={{
          width: isMobile ? "80vw" : "70vw",
        }}
      >
        <div className="row pt-2 pl-2 pr-2">
          <div className="col-sm-8">
            <Input
              lable={t("Remark")}
              placeholder=""
              type="text"
              name="Reason"
              value={reason}
              onChange={handleChange}
              max={30}
            />
          </div>
          <div className="col-sm-2">
            {load ? (
              <Loading />
            ) : (
              <button
                type="button"
                className="btn btn-primary btn-block btn-sm"
                onClick={handleSaveRejectReason}
              >
                {t("Save")}
              </button>
            )}
          </div>
          <div className="col-sm-2">
            <button
              type="button"
              className="btn btn-danger btn-block btn-sm"
              onClick={() => {
                setShow({ show: false });
              }}
            >
              {t("Cancel")}
            </button>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default CouponMasterReject;
