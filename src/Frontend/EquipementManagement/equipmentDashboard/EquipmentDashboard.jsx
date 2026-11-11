import React, { useState } from 'react'
import '../Equipmentmaster.css';
import { useTranslation } from 'react-i18next';
import UniversalChart from '../../../components/GraphCharts/UniversalChart';
import Heading from '../../../components/UI/Heading';
import CustomTable from '../../../components/Table/CustomTable';
import DonutGraph from './DonutGraph';
import { ViewMenu } from '../../../components/SvgIcons';
import SeeMore from '../../SampleStorage/frameMenu/SeeMore';
import { useNavigate } from 'react-router-dom';
import EquipmentTransfer from '../equipmentTransfer/EquipmentTransfer';
import EquipmentMaster from '../equipmentMaster/EquipmentMaster';
import EquipementMaintenance from '../equipmentMaintenanace/EquipementMaintenance';
import VirtualDepartment from '../virtualDepartment/VirtualDepartment';
import BreakdownSummary from '../equipmentMaintenanace/BreakdownSummary';


const EquipmentDashboard = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
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
    const tableHeader = [
        { header: "Machine", field: "machine" },
        { header: "Type", field: "type" },
        { header: "Transfer", field: "transfer" },
        { header: "Date", field: "date" },
    ]
    const tableData = [
        { machine: "CNC Mill A ", type: "Center", transfer: "centre 1 to centre 2", date: "2023-10-01" },
        { machine: "Lathe X  ", type: "Department ", transfer: "Floor 2, Bay A to Floor 2, Bay D ", date: "2023-10-01" },
        { machine: "Grinder Z ", type: "Department", transfer: "Floor 2, Bay C to Floor 2, Bay A", date: "2023-10-01" },

    ];
    const tableHeader2 = [
        { header: "Machine", field: "machine" },
        { header: "Type", field: "type" },
        { header: "Transfer", field: "transfer" },
        { header: "Date", field: "date" },
    ]
    const tableData2 = [
        { machine: "Drill Press C ", type: "Floor 1, Bay C ", transfer: "August 17th, 2025 ", date: "Scheduled" },
        { machine: "Painting Robot 2", type: "Assembly Line 2", transfer: "August 24th, 2025", date: "Scheduled" },
        { machine: "CNC Mill B", type: "Floor 1, Bay B", transfer: "September 6th, 2025", date: "Scheduled" },


    ];
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
            <Heading
                name={"Equipment Management DashBoard"}
                isBreadcrumb={true}
                secondTitle={
                    <>
                        <label onClick={() => setShowMore((prev) => !prev)}>
                            <ViewMenu />
                        </label>
                    </>
                }
            />
            <div className="row mt-3">
                <div className="col-md-4">
                    <div className="card w-100 h-100">
                        <DonutGraph />
                    </div>

                </div>
                <div className="col-md-4">
                    <div className="h-100  w-100 ">
                        <UniversalChart
                            title="Breakdown History"
                            description="Last 6 months"
                            stacked={true}
                            categories={["Jan", "Feb", "Mar", "Apr", "May", "Jun"]}
                            series={[
                                { name: "CNC Mill A", data: [0, 1, 0, 1, 0, 0] },
                                { name: "Lathe X", data: [0, 0, 0, 0, 0, 0] },
                                { name: "Drill Press C", data: [0, 0, 0, 0, 0, 0] },
                                { name: "CNC Mill B", data: [0, 1, 0, 0, 0, 0] },
                                { name: "Grinder Y", data: [0, 0, 0, 0, 0, 2] },
                                { name: "Welding Robot 1", data: [0, 0, 4, 0, 0, 0] },
                                { name: "Painting Robot 2", data: [4, 0, 0, 3, 3, 2] },
                                { name: "Grinder Z", data: [0, 0, 0, 0, 3, 2] },
                            ]}
                            colors={[
                                "#A78BFA",
                                "#FCD34D",
                                "#60A5FA",
                                "#F97316",
                                "#3B82F6",
                                "#34D399",
                                "#FBBF24",
                                "#F87171",
                            ]}
                        />
                    </div>


                </div>
                <div className="col-md-4">
                    <div className="w-100 h-100">
                        <UniversalChart
                            title="Centre Wise Machine Wise Monthly Target vs. Achievement"
                            description="Production units per machine for the selected month and center"
                            categories={[
                                "CNC Mill A",
                                "CNC Mill B",
                                "Lathe X",
                                "Drill Press C",
                                "Grinder Y",
                                "Grinder Z",
                                "Welding Robot 1",
                                "Painting Robot 2",
                            ]}
                            series={[
                                {
                                    name: "target",
                                    data: [900, 1000, 1100, 1150, 1300, 1400, 1500, 1600],
                                },
                                {
                                    name: "achievement",
                                    data: [950, 1020, 1120, 1180, 1330, 1450, 1520, 1650],
                                },
                            ]}
                            colors={["#10B981", "#3B82F6"]}
                        />
                    </div>
                </div>
            </div>
            <div className="row mt-3">
                <div className="col-md-4">
                    <UniversalChart
                        title="Failed Maintenance Report"
                        description="Daily, weekly, and monthly breakdown of failed tasks."
                        distributed={true}
                        categories={[
                            "CNC Mill A",
                            "Grinder Y",
                            "Lathe X",
                            "CNC Mill B ",
                            "Drill Press C",
                            "Grinder Z",
                            "Welding Robot 1",
                            "Painting Robot 2",
                        ]}
                        series={[
                            {
                                name: "Drill Press C",
                                data: [900, 950, 750, 720, 1000, 680, 500, 450],
                            }
                        ]}
                        colors={["#088cfc", "#ff7404", "#fc8444", "#9084dc", "#ffbc2c", "#84cc9c", "#08c49c", "#ffc45c"]}
                    />


                </div>
                <div className="col-md-4">
                    <UniversalChart
                        title="Total Tests Performed by Machine"
                        description="Total Tests Performed by each Machine"
                        stacked={true}
                        categories={[
                            "CNC Mill A",
                            "CNC Mill B",
                            "Lathe X",
                            "Drill Press C",
                            "Grinder Y",
                            "Grinder Z",
                            "Welding Robot 1",
                            "Painting Robot 2",
                        ]}
                        series={[
                            {
                                name: "tests",
                                data: [900, 950, 750, 720, 1000, 680, 500, 450],
                            },
                        ]}
                        colors={["#22C55E"]}
                    />
                </div>
                <div className="col-md-4">
                    <UniversalChart
                        title="Machine Wise Sale Report"
                        description="Total sales generated by each machine"
                        stacked={true}

                        categories={[
                            "CNC Mill A",
                            "CNC Mill B",
                            "Lathe X",
                            "Drill Press C",
                            "Grinder Y",
                            "Grinder Z",
                            "Welding Robot 1",
                            "Painting Robot 2",
                        ]}
                        series={[
                            {
                                name: "tests",
                                data: [0, 15000, 30000, 45000, 60000, 35000, 10000, 5000],
                            },
                        ]}
                        colors={["#284454"]}
                    />
                </div>


            </div>
            <div className="row mt-3">

                <div className="col-md-6">
                    <div className="card p-2 mt-3 ">
                        <h3 style={{ margin: "0 0 4px 0" }}>Upcoming & Recent Maintenance</h3>
                        <p className='' style={{ margin: "0 0 12px 0", color: "#6b7280", fontSize: "14px" }}>
                            Scheduled and completed maintenance tasks.
                        </p>
                        <CustomTable columns={tableHeader2} data={tableData2} />
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="card p-2 mt-3 ">
                        <h3 style={{ margin: "0 0 4px 0" }}>Machine Transfer Log</h3>
                        <p className='' style={{ margin: "0 0 12px 0", color: "#6b7280", fontSize: "14px" }}>
                            Detailed history of all machine transfers
                        </p>
                        <CustomTable columns={tableHeader} data={tableData} />
                    </div>
                </div>
            </div>
        </>
    )
}

export default EquipmentDashboard
