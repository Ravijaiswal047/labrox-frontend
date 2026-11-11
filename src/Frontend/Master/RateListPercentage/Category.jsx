import React, { useEffect, useState } from "react";
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

const initialCategories = [
  { CategoryID: 1, CategoryName: "Category 1", Rate: "", Percentage: "" },
  { CategoryID: 2, CategoryName: "Category 2", Rate: "", Percentage: "" },
  { CategoryID: 3, CategoryName: "Category 3", Rate: "", Percentage: "" },
  { CategoryID: 4, CategoryName: "Category 4", Rate: "", Percentage: "" },
];

const Category = ({ rateTypeID }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [categories, setCategories] = useState(initialCategories);

  const getCategoryRates = () => {
    axiosInstance
      .post("RateList/GetCategoryWiseRate", { RateTypeID: rateTypeID })
      .then((res) => {
        const data = res?.data?.message || [];
        setCategories((prev) =>
          prev.map((cat) => {
            const found = data.find((d) => d?.CategoryID === cat.CategoryID);
            return found ? { ...cat, Rate: found?.Rate ?? "" } : cat;
          })
        );
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    if (rateTypeID) {
      getCategoryRates();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rateTypeID]);

  const handlePercentageChange = (categoryID, value) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.CategoryID === categoryID ? { ...cat, Percentage: value } : cat
      )
    );
  };

  const handleSave = () => {
    const payload = categories.map((cat) => ({
      RateTypeID: rateTypeID,
      Category: cat.CategoryID,
      Department: 0,
      InvestigationID: 0,
      Rate: cat.Rate,
      Percentage: cat.Percentage,
    }));
    axiosInstance
      .post("RateList/SaveCategoryWiseRatePercentage", payload)
      .then(() => {
        toast.success(t("Saved Successfully"));
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || t("Failed to save"));
      });
  };

  const handleLogsModal = (cat) => {
    dispatch(setLogsData({ RateTypeID: rateTypeID, ...cat }));
    dispatch(setLogToggleModal(true));
  };

  return (
    <div className="p-2">
      {categories.map((cat) => (
        <div className="row align-items-center mb-2" key={cat.CategoryID}>
          <div className="col-sm-3">{t(cat.CategoryName)}</div>
          <div className="col-sm-3">
            <input
              type="text"
              className="form-control"
              value={cat.Rate}
              readOnly
            />
          </div>
          <div className="col-sm-3">
            <input
              type="number"
              className="form-control"
              value={cat.Percentage}
              onChange={(e) =>
                handlePercentageChange(cat.CategoryID, e.target.value)
              }
            />
          </div>
          <div className="col-sm-auto">
            <Button
              onClick={() => handleLogsModal(cat)}
              className="logs_btn text-white rounded px-2"
            >
              <LuLogs />
            </Button>
          </div>
        </div>
      ))}
      <div className="row mt-2">
        <div className="col-sm-auto">
          <SaveButton text={t("Save")} onClick={handleSave} />
        </div>
      </div>
      <CombindRateTypeLogsModal title={t("Category wise RateList Log")} />
    </div>
  );
};

export default Category;
