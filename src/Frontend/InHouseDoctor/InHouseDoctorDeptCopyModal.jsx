import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { axiosInstance } from "../../utils/axiosInstance";
import { useTranslation } from "react-i18next";
import Loading from "../../components/loader/Loading";
import Modal from "../../components/formComponent/Modal";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { CancelButton, SaveButton } from "../../components/UI/CustomButton";

const InHouseDoctorDeptCopyModal = ({ show, handleClose, DepartmentList, FromDepartmentID }) => {
  const [load, setLoad] = useState(false);
  const [payload, setPayload] = useState({
    FromDepartmentID: FromDepartmentID ? String(FromDepartmentID) : "",
    ToDepartmentID: "",
  });
  const { t } = useTranslation();

  useEffect(() => {
    setPayload((prev) => ({
      ...prev,
      FromDepartmentID: FromDepartmentID ? String(FromDepartmentID) : "",
    }));
  }, [FromDepartmentID]);

  const handleSelect = (name, value) => {
    setPayload({ ...payload, [name]: value?.value ? String(value.value) : "" });
  };

  const Save = () => {
    if (!payload.FromDepartmentID || !payload.ToDepartmentID) {
      toast.error("Please select both From and To Department.");
      return;
    }
    if (String(payload.FromDepartmentID) === String(payload.ToDepartmentID)) {
      toast.error("From Department and To Department cannot be the same.");
      return;
    }
    setLoad(true);
    axiosInstance
      .post("InHouseDoctor/CopyDepartmentShare", {
        FromDepartmentID: Number(payload.FromDepartmentID),
        ToDepartmentID: Number(payload.ToDepartmentID),
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
      Header={t("Transfer Department Share")}
      modalWidth={"40%"}
    >
      <div className="row p-2">
        <div className="col-sm-12">
          <ReactSelect
            dynamicOptions={DepartmentList}
            name="FromDepartmentID"
            lable={t("From Department")}
            id="FromDepartmentID"
            removeIsClearable={true}
            placeholderName={t("From Department")}
            value={payload.FromDepartmentID}
            onChange={handleSelect}
          />
        </div>
        <div className="col-sm-12">
          <ReactSelect
            dynamicOptions={DepartmentList}
            name="ToDepartmentID"
            lable={t("To Department")}
            id="ToDepartmentID"
            removeIsClearable={true}
            placeholderName={t("To Department")}
            value={payload.ToDepartmentID}
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

export default InHouseDoctorDeptCopyModal;
