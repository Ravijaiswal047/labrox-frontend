import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { axiosInstance } from "../../utils/axiosInstance";
import { useTranslation } from "react-i18next";
import Loading from "../../components/loader/Loading";
import Modal from "../../components/formComponent/Modal";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { CancelButton, SaveButton } from "../../components/UI/CustomButton";

const CentreShareCopyModal = ({ show, handleClose, CentreData, FromCentreID }) => {
  const [load, setLoad] = useState(false);
  const [payload, setPayload] = useState({
    FromCentreID: FromCentreID ? String(FromCentreID) : "",
    ToCentreID: "",
  });
  const { t } = useTranslation();

  useEffect(() => {
    setPayload((prev) => ({
      ...prev,
      FromCentreID: FromCentreID ? String(FromCentreID) : "",
    }));
  }, [FromCentreID]);

  const handleSelect = (name, value) => {
    setPayload({ ...payload, [name]: value?.value ? String(value.value) : "" });
  };

  const Save = () => {
    if (!payload.FromCentreID || !payload.ToCentreID) {
      toast.error("Please select both From and To Centres.");
      return;
    }
    if (String(payload.FromCentreID) === String(payload.ToCentreID)) {
      toast.error("From Centre and To Centre can't be the same.");
      return;
    }
    setLoad(true);
    axiosInstance
      .post("CentreShare/SaveCentreShareCopy", {
        FromCentreID: String(payload.FromCentreID),
        ToCentreID: String(payload.ToCentreID),
      })
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
  };

  return (
    <Modal
      visible={show}
      setVisible={handleClose}
      Header={t("Transfer Centre Share")}
      modalWidth="40%"
    >
      <div className="row p-2">
        <div className="col-sm-12">
          <ReactSelect
            dynamicOptions={CentreData}
            name="FromCentreID"
            lable={t("From Centre")}
            id="FromCentreID"
            removeIsClearable={true}
            placeholderName={t("From Centre")}
            value={payload.FromCentreID}
            onChange={handleSelect}
          />
        </div>
        <div className="col-sm-12">
          <ReactSelect
            dynamicOptions={CentreData}
            name="ToCentreID"
            lable={t("To Centre")}
            id="ToCentreID"
            removeIsClearable={true}
            placeholderName={t("To Centre")}
            value={payload.ToCentreID}
            onChange={handleSelect}
          />
        </div>
      </div>
      <div className="row p-2">
        <div className="col-sm-6">
          <CancelButton text={t("Close")} onClick={handleClose} className="btn-block" />
        </div>
        <div className="col-sm-6">
          {load ? (
            <Loading />
          ) : (
            <SaveButton text={t("Save")} onClick={Save} className="btn-block" />
          )}
        </div>
      </div>
    </Modal>
  );
};

export default CentreShareCopyModal;
