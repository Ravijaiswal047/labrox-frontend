import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { axiosInstance } from "../../utils/axiosInstance";
import { useTranslation } from "react-i18next";
import Loading from "../../components/loader/Loading";
import Modal from "../../components/formComponent/Modal";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { CancelButton, SaveButton } from "../../components/UI/CustomButton";

const InHouseDoctorCopyModal = ({ show, handleClose, DoctorList, FromDoctorID }) => {
  const [load, setLoad] = useState(false);
  const [payload, setPayload] = useState({
    FromEmployeeID: FromDoctorID ? String(FromDoctorID) : "",
    ToEmployeeID: "",
  });
  const { t } = useTranslation();

  useEffect(() => {
    setPayload((prev) => ({
      ...prev,
      FromEmployeeID: FromDoctorID ? String(FromDoctorID) : "",
    }));
  }, [FromDoctorID]);

  const handleSelect = (name, value) => {
    setPayload({ ...payload, [name]: value?.value ? String(value.value) : "" });
  };

  const Save = () => {
    if (!payload.FromEmployeeID || !payload.ToEmployeeID) {
      toast.error("Please select both From and To Doctor.");
      return;
    }
    if (String(payload.FromEmployeeID) === String(payload.ToEmployeeID)) {
      toast.error("From Doctor and To Doctor cannot be the same.");
      return;
    }
    setLoad(true);
    axiosInstance
      .post("InHouseDoctor/CopyDoctorShare", {
        FromEmployeeID: Number(payload.FromEmployeeID),
        ToEmployeeID: Number(payload.ToEmployeeID),
      })
      .then((res) => {
        if (res?.data?.success) {
          toast.success(res.data.message || "Transferred successfully");
          handleClose();
        } else {
          toast.error(res?.data?.message || "Something went wrong");
        }
        setLoad(false);
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Something went wrong");
        setLoad(false);
      });
  };

  return (
    <Modal
      visible={show}
      setVisible={handleClose}
      Header={t("Transfer Doctor Share")}
      modalWidth={"40%"}
    >
      <div className="row p-2">
        <div className="col-sm-12">
          <ReactSelect
            dynamicOptions={DoctorList}
            name="FromEmployeeID"
            lable={t("From Doctor")}
            id="FromEmployeeID"
            removeIsClearable={true}
            placeholderName={t("From Doctor")}
            value={payload.FromEmployeeID}
            onChange={handleSelect}
          />
        </div>
        <div className="col-sm-12">
          <ReactSelect
            dynamicOptions={DoctorList}
            name="ToEmployeeID"
            lable={t("To Doctor")}
            id="ToEmployeeID"
            removeIsClearable={true}
            placeholderName={t("To Doctor")}
            value={payload.ToEmployeeID}
            onChange={handleSelect}
          />
        </div>
      </div>
      <div className="row p-2">
        <div className="col-sm-6">
          <CancelButton
            text={t("Close")}
            onClick={handleClose}
            className="btn-block"
          />
        </div>
        <div className="col-sm-6">
          {load ? (
            <Loading />
          ) : (
            <SaveButton
              text={t("Save")}
              onClick={Save}
              className="btn-block"
            />
          )}
        </div>
      </div>
    </Modal>
  );
};

export default InHouseDoctorCopyModal;
