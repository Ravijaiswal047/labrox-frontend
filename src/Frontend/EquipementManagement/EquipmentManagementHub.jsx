import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Heading from '../../components/UI/Heading';
import { ViewMenu } from '../../components/SvgIcons';
import SeeMore from '../SampleStorage/frameMenu/SeeMore';
import EquipmentMaster from './equipmentMaster/EquipmentMaster';
import EquipmentTransfer from './equipmentTransfer/EquipmentTransfer';
import BreakdownSummary from './equipmentMaintenanace/BreakdownSummary';
import EquipmentDashboard from './equipmentDashboard/EquipmentDashboard';
import VirtualDepartment from './virtualDepartment/VirtualDepartment';
import EquipementMaintenance from './equipmentMaintenanace/EquipementMaintenance';
import './Equipmentmaster.css';

const EquipmentManagementHub = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [showMore, setShowMore] = useState(false);
    const [activeTab, setActiveTab] = useState("Master");

    const seeMoreData = [
        {
            name: "Equipment Dashboard",
            component: <EquipmentDashboard setShowMore={setShowMore} />,
            url: "/equipmentmanager/equipment-dashboard",
        },
        {
            name: "Virtual Department Master",
            component: <VirtualDepartment setShowMore={setShowMore} />,
            url: "/equipmentmanager/virtual-department",
        },
        {
            name: "Equipment Master",
            component: <EquipmentMaster setShowMore={setShowMore} />,
            url: "/equipmentmanager/equipment-master",
        },
        // {
        //     name: "Equipment Maintenance",
        //     component: <EquipementMaintenance setShowMore={setShowMore} />,
        //     url: "/equipmentmanager/equipment-maintanance",
        // },
        {
            name: "Equipment Transfer",
            component: <EquipmentTransfer setShowMore={setShowMore} />,
            url: "/equipmentmanager/equipment-transfer",
        },
        {
            name: "Breakdown Summary",
            component: <BreakdownSummary setShowMore={setShowMore} />,
            url: "/equipmentmanager/breakdown-summary",
        },
        {
            name: "Equipment Management Hub",
            component: <EquipmentManagementHub setShowMore={setShowMore} />,
            url: "/equipmentmanager/equipment-hub",
        }
    ];

    const navList = [
        { label: t("Equipment Master"), key: "Master" },
        { label: t("Equipment Transfer"), key: "Transfer" },
        { label: t("Breakdown Summary"), key: "Breakdown" },
    ];

    return (
        <div className="eq-hub-wrapper">
            {showMore && (
                <SeeMore
                    seeMore={seeMoreData}
                    handleChangeComponent={(item) => {
                        setShowMore(false);
                        navigate(item?.url);
                    }}
                    setShowMore={setShowMore}
                />
            )}
            
            <Heading
                name={t("Equipment Management Hub")}
                isBreadcrumb={true}
                secondTitle={
                    <>
                        <label onClick={() => setShowMore((prev) => !prev)} style={{ cursor: 'pointer' }}>
                            <ViewMenu />
                        </label>
                    </>
                }
            />

            {/* Glassmorphism Tab Bar */}
            <div className="eq-hub-tabs-container mt-3">
                {navList.map((menuItem) => (
                    <button
                        key={menuItem.key}
                        className={`eq-hub-tab-btn ${activeTab === menuItem.key ? 'active' : ''}`}
                        onClick={() => setActiveTab(menuItem.key)}
                    >
                        <span>{menuItem.label}</span>
                    </button>
                ))}
            </div>

            {/* Tab Panels */}
            <div className="eq-tab-content-active" key={activeTab}>
                {activeTab === "Master" && <EquipmentMaster />}
                {activeTab === "Transfer" && <EquipmentTransfer />}
                {activeTab === "Breakdown" && <BreakdownSummary />}
            </div>
        </div>
    );
};

export default EquipmentManagementHub;
