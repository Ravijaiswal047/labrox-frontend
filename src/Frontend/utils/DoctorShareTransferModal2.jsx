import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import Modal from "@app/components/formComponent/Modal";
import ReactSelect from "@app/components/formComponent/ReactSelect";
import MultiSelectComp from "@app/components/formComponent/MultiSelectComp";
import { CustomButton, CancelButton } from "@app/components/UI/CustomButton";
import { axiosInstance } from "../../utils/axiosInstance";
import { getDepartment } from "../../utils/NetworkApi/commonApi";

const DoctorShareTransferModal2 = ({
  show,
  handleClose,
  rateTypeID,
  doctorData = [],
}) => {
  const { t } = useTranslation();
  const [DepartmentData, setDepartmentData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState({
    FromDoctorID: "",
    ToDoctorID: [],
    DepartmentID: [],
  });

  const handleFromDoctorChange = (name, selectedOption) => {
    setState((prev) => ({
      ...prev,
      FromDoctorID: selectedOption?.value ?? "",
      ToDoctorID: prev.ToDoctorID.filter(
        (id) => String(id) !== String(selectedOption?.value),
      ),
    }));
  };

  const handleMultiChange = (name, valuesArray) => {
    if (name === "ToDoctorID" && (valuesArray ?? []).length > 25) {
      toast.error(t("You can only select up to 25 doctors at one time"));
      return;
    }
    setState((prev) => ({ ...prev, [name]: valuesArray ?? [] }));
  };

  const postApi = () => {
    if (!state?.FromDoctorID) {
      toast.warning(t("Please select From Doctor"));
      return;
    }
    if (!state?.ToDoctorID?.length) {
      toast.warning(t("Please select To Doctor"));
      return;
    }
    setLoading(true);
    axiosInstance
      .post("DoctorShareMaster2/TransferShare", {
        FromDoctorID: String(state.FromDoctorID),
        ToDoctorID: (state.ToDoctorID ?? []).map(Number).filter((id) => id > 0),
        RateTypeID: String(rateTypeID || "0"),
        DepartmentID: (state.DepartmentID ?? [])
          .map(Number)
          .filter((id) => id > 0),
      })
      .then((res) => {
        toast.success(
          res?.data?.message || t("Doctor Share successfully transferred."),
        );
        setState({ FromDoctorID: "", ToDoctorID: [], DepartmentID: [] });
        handleClose();
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message ||
            err?.response?.data?.errors ||
            t("Unable to transfer doctor share"),
        );
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (show) getDepartment(setDepartmentData);
  }, [show]);

  const toDoctorOptions = state?.FromDoctorID
    ? doctorData.filter(
        (ele) => String(ele.value) !== String(state.FromDoctorID),
      )
    : doctorData;

  return (
    <Modal
      visible={show}
      setVisible={handleClose}
      Header={t("Doctor Share Transfer")}
      modalWidth="620px"
      buttons={
        <div className="d-flex justify-content-between" style={{ gap: "10px" }}>
          <CancelButton
            text={t("Close")}
            onClick={handleClose}
            disabled={loading}
          />
          <CustomButton
            icon="share"
            text={t("Transfer")}
            onClick={postApi}
            loading={loading}
          />
        </div>
      }
    >
      <div className="row mt-2 mb-2">
        <ReactSelect
          id="FromDoctorID"
          name="FromDoctorID"
          placeholderName={t("From Doctor")}
          value={state.FromDoctorID}
          dynamicOptions={doctorData}
          onChange={handleFromDoctorChange}
          respclass="col-md-12 col-12"
        />
        <MultiSelectComp
          id="DepartmentID"
          name="DepartmentID"
          label={t("Department (optional - all if empty)")}
          value={state.DepartmentID}
          options={DepartmentData}
          onChange={handleMultiChange}
          className="col-md-12 col-12 mt-2 mb-2"
        />
        <div className="col-12 text-center my-1" style={{ color: "#1E9FF2" }}>
          ▼
        </div>
        <MultiSelectComp
          id="ToDoctorID"
          name="ToDoctorID"
          label={t("To Doctor")}
          value={state.ToDoctorID}
          options={toDoctorOptions}
          onChange={handleMultiChange}
          className="col-md-12 col-12"
        />
      </div>
    </Modal>
  );
};

export default DoctorShareTransferModal2;
