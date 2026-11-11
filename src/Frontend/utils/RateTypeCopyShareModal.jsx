import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { axiosInstance } from "../../utils/axiosInstance";
import { useTranslation } from "react-i18next";
import Loading from "../../components/loader/Loading";
import Modal from "../../components/formComponent/Modal";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { CancelButton, CustomButton, SaveButton } from "../../components/UI/CustomButton";

const RateTypeCopyShareModal = ({ show, handleClose, RateTypeData, FromRateTypeID }) => {
  const [load, setLoad] = useState(false);
  const [payload, setPayload] = useState({
    FromRateTypeID: FromRateTypeID ? String(FromRateTypeID) : "",
    ToRateTypeID: "",
  });
  const { t } = useTranslation();

  useEffect(() => {
    setPayload((prev) => ({ ...prev, FromRateTypeID: FromRateTypeID ? String(FromRateTypeID) : "" }));
  }, [FromRateTypeID]);

  const handleSelect = (name, value) => {
    setPayload({ ...payload, [name]: value?.value ? String(value.value) : "" });
  };

  const Save = () => {
    if (!payload?.FromRateTypeID || !payload?.ToRateTypeID) {
        toast.error("Please select both From and To RateTypes.");
        return;
    }
    if (String(payload?.FromRateTypeID) === String(payload?.ToRateTypeID)) {
      toast.error("From RateType and To RateType can't be the same.");
    } else {
      setLoad(true);
      const postData = {
        FromRateTypeID: String(payload.FromRateTypeID),
        ToRateTypeID: String(payload.ToRateTypeID),
      };
      axiosInstance
        .post("RateTypeShare/SaveRateTypeCopy", postData)
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
          toast.error(err?.response?.data?.message || "Something went wrong");
          setLoad(false);
        });
    }
  };

  return (
    <Modal
      visible={show}
      setVisible={handleClose}
      Header={t("Transfer Rate Type")}
      modalWidth={"40%"}
    >
      <div className="row p-2" 
      >
        <div className="col-sm-12">
          <ReactSelect
            dynamicOptions={RateTypeData}
            name="FromRateTypeID"
            lable={t("From RateType")}
            id="FromRateTypeID"
            removeIsClearable={true}
            placeholderName={t("From RateType")}
            value={payload?.FromRateTypeID}
            onChange={handleSelect}
          />
        </div>
        <div className="col-sm-12">
          <ReactSelect
            dynamicOptions={RateTypeData}
            name="ToRateTypeID"
            lable={t("To RateType")}
            id="ToRateTypeID"
            removeIsClearable={true}
            placeholderName={t("To RateType")}
            value={payload?.ToRateTypeID}
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

export default RateTypeCopyShareModal;
