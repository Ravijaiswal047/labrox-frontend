import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import Modal from "@components/formComponent/Modal";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { SaveButton, CancelButton } from "../../components/UI/CustomButton";
import { axiosInstance } from "../../utils/axiosInstance";

const OutSourceTransferModal = ({ visible, setVisible, outSourceLabOptions, centreOptions }) => {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    fromOutSourceLabID: "",
    fromCentreID: "",
    toOutSourceLabID: "",
    toCentreID: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSelect = (name, opt) => {
    setForm((prev) => ({ ...prev, [name]: opt?.value || "" }));
  };

  const handleSave = () => {
    if (!form.fromOutSourceLabID) { toast.warning(t("Select From OutSource Lab")); return; }
    if (!form.fromCentreID) { toast.warning(t("Select From Centre")); return; }
    if (!form.toOutSourceLabID) { toast.warning(t("Select To OutSource Lab")); return; }
    if (!form.toCentreID) { toast.warning(t("Select To Centre")); return; }

    setLoading(true);
    axiosInstance
      .post("OutSourceLabRateListMaster/CopyOutSourceLabRate", {
        fromOutSourceLabID: Number(form.fromOutSourceLabID),
        fromCentreID: Number(form.fromCentreID),
        toOutSourceLabID: Number(form.toOutSourceLabID),
        toCentreID: Number(form.toCentreID),
      })
      .then((res) => {
        if (res?.data?.success) {
          toast.success(res?.data?.message || t("Transferred successfully"));
          setForm({ fromOutSourceLabID: "", fromCentreID: "", toOutSourceLabID: "", toCentreID: "" });
          setVisible(false);
        } else {
          toast.error(res?.data?.message || t("Transfer failed"));
        }
      })
      .catch((err) => toast.error(err?.response?.data?.message || t("Something went wrong")))
      .finally(() => setLoading(false));
  };

  const handleClose = () => {
    setForm({ fromOutSourceLabID: "", fromCentreID: "", toOutSourceLabID: "", toCentreID: "" });
    setVisible(false);
  };

  return (
    <Modal
      visible={visible}
      setVisible={setVisible}
      Header={t("Transfer OutSource Rate List")}
      modalWidth="520px"
    >
      <div className="row g-2 mt-1">
        <div className="col-12 col-md-6">
          <ReactSelect
            name="fromOutSourceLabID"
            placeholderName="From OutSource Lab"
            value={form.fromOutSourceLabID}
            dynamicOptions={outSourceLabOptions}
            onChange={handleSelect}
          />
        </div>
        <div className="col-12 col-md-6">
          <ReactSelect
            name="fromCentreID"
            placeholderName="From Centre"
            value={form.fromCentreID}
            dynamicOptions={centreOptions}
            onChange={handleSelect}
          />
        </div>
        <div className="col-12 col-md-6">
          <ReactSelect
            name="toOutSourceLabID"
            placeholderName="To OutSource Lab"
            value={form.toOutSourceLabID}
            dynamicOptions={outSourceLabOptions}
            onChange={handleSelect}
          />
        </div>
        <div className="col-12 col-md-6">
          <ReactSelect
            name="toCentreID"
            placeholderName="To Centre"
            value={form.toCentreID}
            dynamicOptions={centreOptions}
            onChange={handleSelect}
          />
        </div>
      </div>
      <div className="mt-3 d-flex justify-content-between">
        <CancelButton text="Cancel" onClick={handleClose} />
        <SaveButton text="Transfer" onClick={handleSave} disabled={loading} />
      </div>
    </Modal>
  );
};

export default OutSourceTransferModal;
