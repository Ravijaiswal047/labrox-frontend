import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { axiosInstance } from "../../utils/axiosInstance";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { Dialog } from "primereact/dialog";
import Input from "../../components/formComponent/Input";
import Loading from "../../components/loader/Loading";

const HCHistoryCancelModal = ({
  showCancel,
  handleClose,
  handleCloseCancel,
  details,
}) => {
  const { t } = useTranslation();
  const [load, setLoad] = useState(false);
  const [cancelreason, setReason] = useState("");
  const handleCancel = () => {
    console.log(cancelreason);
    if (cancelreason.trim().length < 3) {
      toast.error("Cancel Reason length must be 3");
    } else {
      const payload = {
        PreBookingId: details.PreBookingId,
        CancelReason: cancelreason.trim(),
      };
      setLoad(true);
      axiosInstance
        .post("HomeCollectionSearch/CancelAppointment", payload)
        .then((res) => {
          setLoad(false);
          if (res.data) {
            toast.success(res?.data?.message);
            handleCloseCancel();
            handleClose();
          }
        })
        .catch((err) => {
          setLoad(false);
          toast.error("Could not Cancel");
        });
    }
  };

  const theme = useLocalStorage("theme", "get");

  return (
    <>
      <Dialog
        header={t("Cancel Appointment")}
        visible={showCancel}
        onHide={() => {
          handleCloseCancel();
        }}
        draggable={false}
        className={theme}
        style={{ width: "500px" }}
      >
        <div className="row">
          <label className="col-md-12">
            {t("PreBooking ID")} : &nbsp;
            <span>{details.PreBookingId}</span>
          </label>
        </div>
        <div className="row">
          <label className="col-md-12" htmlFor="AppointmentDate">
            {t("Appointment Date")} :&nbsp;
            <span>{details.AppDate}</span>
          </label>
        </div>
        <div className="row">
          <label className="col-sm-12  col-md-3" htmlFor="Cancel Reason">
            {t("Cancel Reason")}{" "}
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:
          </label>
          <div className="col-sm-12 col-md-9">
            <Input
              className="select-input-box form-control input-sm"
              type="text"
              name="Cancel Reason"
              value={cancelreason}
              onChange={(e) => {
                setReason(e.target.value);
              }}
            />
          </div>
        </div>
        <div
          className="row"
          style={{ display: "flex", justifyContent: "center" }}
        >
          <div className="col-md-2">
            {load ? (
              <Loading />
            ) : (
              <button
                type="button"
                className="btn btn-primary btn-block btn-sm"
                onClick={() => {
                  handleCancel();
                }}
              >
                {t("Cancel")}
              </button>
            )}
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default HCHistoryCancelModal;
