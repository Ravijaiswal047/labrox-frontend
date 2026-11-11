import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { axiosInstance } from "../../utils/axiosInstance";
import { useTranslation } from "react-i18next";
import Modal from "@app/components/formComponent/Modal";
import ReactSelect from "@app/components/formComponent/ReactSelect";
import MultiSelectComp from "@app/components/formComponent/MultiSelectComp";
import { CustomButton, CancelButton } from "@app/components/UI/CustomButton";

const DoctorShareTransferModal = ({ show, handleClose }) => {
  const { t } = useTranslation();
  const [DoctorData, setDoctorData] = useState([]);
  const [RateTypeData, setRateTypeData] = useState([]);
  const [DepartmentData, setDepartmentData] = useState([]);
  const [state, setState] = useState({
    FromDoctorID: "",
    ToDoctorID: [],
    RateTypeID: [],
    DepartmentID: [],
  });

  const handleFromDoctorChange = (name, selectedOption) => {
    setState((prev) => ({
      ...prev,
      FromDoctorID: selectedOption?.value ?? "",
      ToDoctorID: prev.ToDoctorID.filter((id) => id !== selectedOption?.value),
    }));
  };

  const handleMultiChange = (name, valuesArray) => {
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
    // if (!state?.DepartmentID?.length) {
    //   toast.warning(t("Please select Department"));
    //   return;
    // }
    axiosInstance
      .post("DocShareMaster/transferDocShare", {
        FromDoctorID: String(state.FromDoctorID),
        ToDoctorID: (state.ToDoctorID ?? []).map(Number),
        RateTypeIDs: (state.RateTypeID ?? []).map(Number),
        DepartmentID: state.DepartmentID,
      })
      .then((res) => {
        toast.success(res?.data?.message);
        setState({ FromDoctorID: "", ToDoctorID: [], RateTypeID: [], DepartmentID: [] });
        handleClose();
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Something went wrong");
      });
  };

  const BindDoctorData = () => {
    axiosInstance
      .post("DoctorReferal/getDoctorDataBind")
      .then((res) => {
        const val = res?.data?.message?.map((ele) => ({
          label: ele?.DoctorName,
          value: ele?.DoctorID,
        }));
        setDoctorData(val ?? []);
      })
      .catch((err) => {
        toast.error(err?.data?.message || "Something went wrong");
      });
  };

  const getRateTypes = () => {
    axiosInstance
      .post("Centre/getRateTypeWithGlobalCentre", { centreId: [] })
      .then((res) => {
        const val = res?.data?.message?.map((ele) => ({
          label: ele?.Rate,
          value: ele?.RateTypeID,
        }));
        setRateTypeData(val ?? []);
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Something went wrong");
      });
  };

  const getDepartment = () => {
    axiosInstance
      .get("Department/getDepartmentData")
      .then((res) => {
        const DeptDataValue = res.data.message.map((ele) => ({
          value: ele.DepartmentID,
          label: ele.Department,
        }));
        setDepartmentData(DeptDataValue);
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Something went wrong");
      });
  };

  useEffect(() => {
    BindDoctorData();
    getRateTypes();
    getDepartment();
  }, []);

  const toDoctorOptions = state?.FromDoctorID
    ? DoctorData.filter((ele) => String(ele.value) !== String(state.FromDoctorID))
    : DoctorData;

  return (
    <Modal
      visible={show}
      setVisible={handleClose}
      Header={t("Doctor Share Transfer")}
      modalWidth="600px"
      buttons={
         <div className="d-flex justify-content-between" style={{gap: "10px"}}>
          <CancelButton text={t("Close")} onClick={handleClose} />
          <CustomButton icon="share" text={t("Transfer")} onClick={postApi} />
        </div>
      }
    >
      <div className="row mt-2 mb-2">
        <MultiSelectComp
          id="RateTypeID"
          name="RateTypeID"
          label={t("Rate Type")}
          value={state.RateTypeID}
          options={RateTypeData}
          onChange={handleMultiChange}
          className="col-md-6 col-12 mt-2 mb-2"
        />
        <MultiSelectComp
          id="DepartmentID"
          name="DepartmentID"
          label={t("Department")}
          value={state.DepartmentID}
          options={DepartmentData}
          onChange={handleMultiChange}
          className="col-md-6 col-12 mt-2 mb-2"
        />
        <ReactSelect
          id="FromDoctorID"
          name="FromDoctorID"
          placeholderName={t("From Doctor")}
          value={state.FromDoctorID}
          dynamicOptions={DoctorData}
          onChange={handleFromDoctorChange}
          respclass="col-md-6 col-12"
        />
        <MultiSelectComp
          id="ToDoctorID"
          name="ToDoctorID"
          label={t("To Doctor")}
          value={state.ToDoctorID}
          options={toDoctorOptions}
          onChange={handleMultiChange}
          className="col-md-6 col-12"
        />
      </div>
     
    </Modal>
  );
};

export default DoctorShareTransferModal;
