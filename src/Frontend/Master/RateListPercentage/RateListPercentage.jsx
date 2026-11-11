import React, { useEffect, useState } from 'react'
import { useTranslation } from "react-i18next";
import { axiosInstance } from "../../../utils/axiosInstance";
import Heading from "../../../components/UI/Heading";
import CustomTabs from "../../../components/UI/CustomTabs";
import ReactSelect from "../../../components/formComponent/ReactSelect";
import Default from "./Default";
import Category from "./Category";
import Department from "./Department";
import Item from "./Item";

const RateListPercentage = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("Default");
  const [rateTypeID, setRateTypeID] = useState("");
  const [rateTypeOptions, setRateTypeOptions] = useState([]);

  useEffect(() => {
    axiosInstance
      .post("Centre/GetRateType", { centreId: [] })
      .then((res) => {
        const list =
          res?.data?.message?.map((item) => ({
            label: item?.RateTypeName,
            value: item?.RateTypeID,
          })) || [];
        setRateTypeOptions(list);
      })
      .catch((err) => console.log(err));
  }, []);

  const handleRateTypeChange = (name, option) => {
    setRateTypeID(option?.value || "");
  };

  const tabs = [
    { id: "Default", label: t("Default"), content: <Default rateTypeID={rateTypeID} /> },
    { id: "Category", label: t("Category"), content: <Category rateTypeID={rateTypeID} /> },
    { id: "Department", label: t("Department"), content: <Department /> },
    { id: "Item", label: t("Item"), content: <Item /> },
  ];

  return (
    <div className="card shadow mb-4 p-2 clr-wrapper">
      <Heading isBreadcrumb={true} name={t("Rate List Percentage")} />
      <div className="row p-2">
        <div className="col-sm-3">
          <ReactSelect
            dynamicOptions={rateTypeOptions}
            name="RateTypeID"
            id="RateTypeID"
            placeholderName={t("RateType")}
            value={rateTypeID}
            onChange={handleRateTypeChange}
            removeIsClearable={true}
          />
        </div>
      </div>
      {rateTypeID ? (
        <CustomTabs tabs={tabs} activeTab={activeTab} onSelect={(k) => setActiveTab(k)} />
      ) : (
        // <div className="text-center text-muted py-4">
        //   {t("Please select a RateType to continue")}
        // </div>
        ""
      )}
    </div>
  )
}

export default RateListPercentage
