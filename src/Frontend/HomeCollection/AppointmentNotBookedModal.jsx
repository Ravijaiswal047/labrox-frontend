import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { PreventSpecialCharacter } from "../../utils/helpers";
import Loading from "../../components/loader/Loading";
import { axiosInstance } from "../../utils/axiosInstance";
import { Dialog } from "primereact/dialog";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import Input from "../../components/formComponent/Input";
import { SaveButton } from "../../components/UI/CustomButton";
const AppointmentNotBookedModal = ({
  showPatientData,
  notBookedShow,
  handleNotBookedClose,
  handleCloseAppoint,
}) => {
  const [reason, setReason] = useState("");
  const [load, setLoad] = useState(false);
  const handleChange = (e) => {
    if (PreventSpecialCharacter(e.target.value)) {
      setReason(e.target.value);
    } else {
      return;
    }
  };

  const handleReason = () => {
    if (reason.trim().length < 3) {
      toast.error("Remarks length must be 3");
    } else {
      setLoad(true);
      axiosInstance
        .post("CustomerCare/savenotbookedreason", {
          savenotbookedreasonData: {
            uhid: showPatientData?.Patientid,
            Mobile: showPatientData?.Mobile,
            HouseNo: showPatientData?.HouseNo,
            LocalityID: showPatientData?.LocalityID,
            CityID: showPatientData?.CityID,
            StateID: showPatientData?.StateID,
            Pincode: showPatientData?.Pincode,
            Reason: reason.trim(),
          },
        })
        .then((res) => {
          setLoad(false);
          toast.success(res?.data?.message);
          handleNotBookedClose();
          handleCloseAppoint();
        })
        .catch((err) => {
          setLoad(false);
          toast.error(err);
        });
    }
  };
  const theme = useLocalStorage("theme", "get");
  const { t } = useTranslation();
  return (
    <>
      <Dialog
        visible={notBookedShow}
        header={"Home Collection Not Booked Reason"}
        onHide={handleNotBookedClose}
        className={theme}
      >
        <div className="row">
          <div className="col-sm-12">
            <Input
              placeholder=" "
              type="text"
              lable="Reason"
              id="Reason"
              name="Reason"
              value={reason}
              max={40}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="row mt-2">
          <div className="col-md-12 d-flex justify-content-center">
            {load ? (
              <Loading />
            ) : (
              // <button
              //   type="button"
              //   className="btn btn-primary btn-block btn-sm"
              //   onClick={() => {
              //     handleReason();
              //   }}
              // >
              //   {t("Save Reason")}
              // </button>
              <SaveButton
                text={"Save Reason"}
                  onClick={() => {
                  handleReason();
                }}
              />
            )}
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default AppointmentNotBookedModal;
