import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import Accordion from "@components/UI/Accordion";
import CustomTabs from "@components/UI/CustomTabs";
import { axiosInstance } from "@app/utils/axiosInstance";
import CompanyMasterTab from "./CompanyMasterTab";
import ItemMappingTab from "./ItemMappingTab";
import RateTypeMappingTab from "./RateTypeMappingTab";

const InterfaceCompanyMaster = () => {
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState("companyMaster");
  const [companyList, setCompanyList] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);

  useEffect(() => {
    fetchCompanies();
    fetchDepartments();
  }, []);

  const fetchCompanies = () => {
    axiosInstance
      .get("ItemMasterInterface/GetInterfacemasterById")
      .then((res) => setCompanyList(res?.data?.message ?? []))
      .catch((err) => toast.error(err?.response?.data?.message));
  };

  const fetchDepartments = () => {
    axiosInstance
      .get("Department/getDepartment")
      .then((res) =>
        setDepartmentOptions(
          (res?.data?.message ?? []).map((ele) => ({
            value: ele.DepartmentID,
            label: ele.Department,
          }))
        )
      )
      .catch((err) => toast.error(err?.response?.data?.message));
  };

  const tabs = [
    {
      id: "companyMaster",
      label: t("Interface Company Master"),
      content: (
        <CompanyMasterTab
          companyList={companyList}
          fetchCompanies={fetchCompanies}
        />
      ),
    },
    {
      id: "itemMapping",
      label: t("Interface Item Mapping"),
      content: (
        <ItemMappingTab
          companyList={companyList}
          departmentOptions={departmentOptions}
        />
      ),
    },
    {
      id: "rateTypeMapping",
      label: t("Rate Type Mapping"),
      content: (
        <RateTypeMappingTab
          companyList={companyList}
        />
      ),
    },
  ];

  return (
    <div className="container-fluid">
      <Accordion title="Interface Company Master" defaultValue={true} isBreadcrumb={true}>
        <div className="card-body p-2">
          <CustomTabs tabs={tabs} activeTab={activeTab} onSelect={setActiveTab} />
        </div>
      </Accordion>
    </div>
  );
};

export default InterfaceCompanyMaster;
