import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { axiosInstance } from "../../utils/axiosInstance";
import { useTranslation } from "react-i18next";
import Loading from "../../components/loader/Loading";
import Modal from "../../components/formComponent/Modal";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { CancelButton, CustomButton, SaveButton } from "../../components/UI/CustomButton";
import MultiSelectComp from "../../components/formComponent/MultiSelectComp";

const TransferTestCentreMappingModal = ({ show, handleClose, CentreData,DepartmentData, FromCentreId }) => {
  const [load, setLoad] = useState(false);
  const [payload, setPayload] = useState({
    SourceCentreId: 0,
    TargetCentreId: 0,
    DepartmentID: [],
  });
  const { t } = useTranslation();

  useEffect(() => {
    if (show) {
      setPayload({
        SourceCentreId: 0,
        TargetCentreId: 0,
        DepartmentID: [],
      });
    }
  }, [show]);

  const handleSelect = (name, value) => {
    setPayload({ ...payload, [name]: value?.value });
  };

  const handleMultiSelectChange = (name, value) => {
    setPayload((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const Save = () => {
    if (!payload?.SourceCentreId || !payload?.TargetCentreId || payload?.DepartmentID?.length === 0) {
        toast.error("Please select Source Centre, Target Centre and at least one Department.");
        return;
    }
    if (payload?.SourceCentreId === payload?.TargetCentreId) {
      toast.error("Source Centre and Target Centre can't be the same.");
    } else {
      setLoad(true);

      const responsePayload = {
        sourceCentreID: Number(payload?.SourceCentreId),
        targetCentreID: Number(payload?.TargetCentreId),
        departmentIDs: payload?.DepartmentID?.map((ele) => Number(ele))
      }
      axiosInstance
        .post("TestCentreMappingController/TestCentreMappingTransfer", responsePayload)
        .then((res) => {
          if (res.data.success) {
            toast.success(res.data.message);
            handleClose();
          } else {
            toast.error(res.data.message || "Something went wrong");
          }
          setLoad(false);
        })
        .catch((err) => {
          toast.error(err.response.data.message || "Something went wrong");
          setLoad(false);
        });
    }
  };

  return (
    <Modal
      visible={show}
      setVisible={handleClose}
      Header={t("Transfer Test Centre Mapping")}
      modalWidth={"40%"}
    >
      <div className="row p-2" 
      >
        <div className="col-sm-12">
          <ReactSelect
            dynamicOptions={CentreData}
            name="SourceCentreId"
            label={t("Source Centre")}
            placeholderName={t("Source Centre")}
            id="SourceCentreId"
            removeIsClearable={true}
            value={payload?.SourceCentreId}
            onChange={handleSelect}
          />
        </div>
        <div className="col-sm-12">
          <ReactSelect
            dynamicOptions={CentreData}
            name="TargetCentreId"
            label={t("Target Centre")}
            placeholderName={t("Target Centre")}
            id="TargetCentreId"
            removeIsClearable={true}
            value={payload?.TargetCentreId}
            onChange={handleSelect}
          />
        </div>
        <div className="col-sm-12">
          <MultiSelectComp
            label="Department"
            options={DepartmentData}
            value={payload?.DepartmentID}
            name="DepartmentID"
            id="DepartmentID"
            onChange={handleMultiSelectChange}
            lable={t("Department")}
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
            <CustomButton
              text={t("Transfer")}
              icon={"send"}
              onClick={Save}
              className="btn-block"
            />
          )}
        </div>
      </div>
    </Modal>
  );
};

export default TransferTestCentreMappingModal;
