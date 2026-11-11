import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Heading from "@app/components/UI/Heading";
import CustomTabs from "@app/components/UI/CustomTabs";
import DashboardTab from "./tabs/DashboardTab";
import EquipmentMasterTab from "./tabs/EquipmentMasterTab";
import AmcCmcTab from "./tabs/AmcCmcTab";
import CalibrationTab from "./tabs/CalibrationTab";
import MaintenanceTab from "./tabs/MaintenanceTab";
import SupplierReturnTab from "./tabs/SupplierReturnTab";
import TransferTab from "./tabs/TransferTab";
import QrCodesTab from "./tabs/QrCodesTab";
import ComplianceTab from "./tabs/ComplianceTab";
import PlaceholderTab from "./tabs/PlaceholderTab";
import "./EquipmentManagement.css";

const EquipmentManagement = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("EquipmentMaster");

  const tabs = [
    { id: "Dashboard",       label: t("Dashboard"),        content: <DashboardTab /> },
    { id: "EquipmentMaster", label: t("Equipment Master"), content: <EquipmentMasterTab /> },
    { id: "AmcCmc",          label: t("AMC / CMC"),        content: <AmcCmcTab /> },
    { id: "Calibration",     label: t("Calibration"),      content: <CalibrationTab /> },
    { id: "Maintenance",     label: t("Maintenance"),      content: <MaintenanceTab /> },
    { id: "SupplierReturn",  label: t("Supplier Return"),  content: <SupplierReturnTab /> },
    { id: "Transfer",        label: t("Transfer"),         content: <TransferTab /> },
    { id: "QRCodes",         label: t("QR Codes"),         content: <QrCodesTab /> },
    // { id: "LiveIntegration", label: t("Live Integration"), content: <PlaceholderTab name="Live Integration" /> },
    { id: "Compliance",      label: t("Compliance"),       content: <ComplianceTab /> },
  ];


  return (
    <div className="container-fluid">
      <Heading name={t("Equipment Management")} isBreadcrumb={true} />

      <CustomTabs
        tabs={tabs}
        activeTab={activeTab}
        onSelect={(key) => setActiveTab(key)}
      />
    </div>
  );
};

export default EquipmentManagement;
