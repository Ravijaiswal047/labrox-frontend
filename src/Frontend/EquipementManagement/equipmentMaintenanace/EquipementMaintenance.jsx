import React, { useEffect, useState } from 'react'
import Heading from '../../../components/UI/Heading'
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import RoutineMaintenance from './RoutineMaintenance';
import PmOtherActivities from './PmOtherActivities';
import { ViewMenu } from '../../../components/SvgIcons';
import EquipmentDashboard from '../equipmentDashboard/EquipmentDashboard';
import EquipmentMaster from '../equipmentMaster/EquipmentMaster';
import EquipmentTransfer from '../equipmentTransfer/EquipmentTransfer';
import SeeMore from '../../SampleStorage/frameMenu/SeeMore';
import VirtualDepartment from '../virtualDepartment/VirtualDepartment';
import BreakdownSummary from './BreakdownSummary';

const EquipementMaintenance = () => {
    const navigate = useNavigate();
    const [t] = useTranslation();
    const [activeTab, setActiveTab] = useState("RoutineMaintenanace");
    const [showMore, setShowMore] = useState(false);
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
        {
            name: "Equipment Maintenance",
            component: <EquipementMaintenance setShowMore={setShowMore} />,
            url: "/equipmentmanager/equipment-maintanance",
        },
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



    ];
    const navList = [
        { label: t("Routine Maintenanace Logging"), key: "RoutineMaintenanace" },
        { label: t("PM & Other Activities"), key: "PMActivities" },


    ];
    useEffect(() => {
        const hashTab = location.hash.replace("#", "") || "RoutineMaintenanace";
        setActiveTab(hashTab);
    }, [location.hash]);

    const handleThemeClass = (key) => {
        setActiveTab(key);
        navigate(`#${key}`, { replace: true });
    };
    return (
        <>
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
            <div className="card">
                <Heading
                    name={"Equipment Maintenance"}
                    isBreadcrumb={true}
                    secondTitle={
                        <>
                            <label onClick={() => setShowMore((prev) => !prev)}>
                                <ViewMenu />
                            </label>
                        </>
                    }

                />
            </div>
            <div className="card-header">
                <div className="Card_title">
                    <ul className="nav d-flex">
                        {navList.map((menuItem) => (
                            <li
                                className={`nav-item mx-1 ${activeTab === menuItem.key ? "active-tab-menu" : "text_black"
                                    }`}
                                key={menuItem.key}
                                style={{ padding: "3px 15px", cursor: "pointer" }}
                                onClick={() => handleThemeClass(menuItem.key)}
                            >
                                <a href={`#${menuItem.key}`}>{menuItem.label}</a>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            {activeTab === "RoutineMaintenanace" &&
                <RoutineMaintenance />
            }
            {activeTab === "PMActivities" &&
                <PmOtherActivities />
            }

        </>
    )
}

export default EquipementMaintenance
