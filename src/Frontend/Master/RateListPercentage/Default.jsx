import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { Button } from "react-bootstrap";
import { LuLogs } from "react-icons/lu";
import { axiosInstance } from "../../../utils/axiosInstance";
import { SaveButton } from "../../../components/UI/CustomButton";
import CombindRateTypeLogsModal from "../RateListAllPage/CombindRateTypeLogsModal";
import {
  setLogsData,
  setLogToggleModal,
} from "../../../store/reducers/CombinedRateTypeSlice/CombinedRateTypeSlice";

const Default = ({ rateTypeID }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [rateListPercentage, setRateListPercentage] = useState("");

  const handleSave = () => {
    const payload = {
      RateTypeID: rateTypeID,
      Category: 0,
      Department: 0,
      InvestigationID: 0,
      RateListPercentage: rateListPercentage,
    };
    axiosInstance
      .post("RateList/SaveRateListPercentage", payload)
      .then(() => {
        toast.success(t("Saved Successfully"));
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || t("Failed to save"));
      });
  };

  const handleLogsModal = () => {
    dispatch(setLogsData({ RateTypeID: rateTypeID }));
    dispatch(setLogToggleModal(true));
  };

  return (
    <div className="row p-2 align-items-end">
      <div className="col-sm-3">
        <label className="mb-1">{t("RateList%")}</label>
        <input
          type="number"
          className="form-control"
          value={rateListPercentage}
          onChange={(e) => setRateListPercentage(e.target.value)}
        />
      </div>
      <div className="col-sm-auto">
        <SaveButton text={t("Save")} onClick={handleSave} />
      </div>
      <div className="col-sm-auto">
        <Button
          onClick={handleLogsModal}
          className="logs_btn text-white rounded px-2"
        >
          <LuLogs />
        </Button>
      </div>
      <CombindRateTypeLogsModal title={t("RateList% Log")} />
    </div>
  );
};

export default Default;
