import React, { useEffect, useState } from "react";
import Accordion from "../../../components/UI/Accordion";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import './DashboardContent.css';
import Tables from "../../../components/UI/customTable";
import { useLocalStorage } from "../../../utils/hooks/useLocalStorage";

const DashboardContent = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const theme = useLocalStorage("theme","get");
    console.log("theme",theme);

    const ambulanceData = [
        { vehicleNo: "DL01AB1234", driver: "Rajesh Kumar", status: "Active" },
        { vehicleNo: "DL02CD5678", driver: "Amit Singh", status: "On Duty" },
        { vehicleNo: "DL03EF9012", driver: "Sunil Mehta", status: "Offline" },
        { vehicleNo: "DL04GH3456", driver: "Vikas Sharma", status: "Active" },
        { vehicleNo: "DL05IJ7890", driver: "Mohit Verma", status: "On Duty" },
        { vehicleNo: "DL06KL2345", driver: "Suresh Yadav", status: "Active" },
        { vehicleNo: "DL07MN6789", driver: "Harish Chauhan", status: "Offline" },
        { vehicleNo: "DL08OP1122", driver: "Rohit Kapoor", status: "On Duty" }
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case "Active":
                return "#1aaf1a";
            case "On Duty":
                return "#f5ae2c";
            case "Offline":
                return "#fb3c3a";
            default:
                return "black";
        }
    };

    return (
        <>  <Accordion
            name={t("Ambulance Tracking")}
            defaultValue={true}
            isBreadcrumb={true}
        ></Accordion>
            <div className="sidebar-layout">
                {/* <h2 className="dashboard-heading">Dashboard</h2> */}
                
                <div className="row dashboard-row main-container">
                    <div className="col-xs-12 col-sm-12 col-md-6 col-lg-7 dashboard-col">
                        
                        <div className="p-3">
                            <h3 className="dashboard-sub-heading mb-2">Ambulance Live Tracking</h3>
                            <div className="map-container">
                                <iframe
                                    title="google-map"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    loading="lazy"
                                    allowFullScreen
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d448122.03683938345!2d76.7635661602217!3d28.644287351944807!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfd50f2ef9177%3A0xbcd7f0ddd0427931!2sDelhi!5e0!3m2!1sen!2sin!4v1709807000000"
                                ></iframe>
                            </div>
                        </div>
                    </div>
                    <div className="col-xs-12 col-sm-12 col-md-6 col-lg-5 dashboard-col">
                        {/* Right column content */}
                        <div className="p-3">
                            <h3 className="dashboard-sub-heading">Ambulance Status</h3>
                            <p style={{ color: "#585757" }}>Live Status of all vehicles in the fleet.</p>
                        </div>
                        <div className="p-3">
                            <Tables>
                                <thead>
                                    <tr>
                                        <th>Vehicle No</th>
                                        <th>Driver</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {ambulanceData.map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.vehicleNo}</td>
                                            <td>{item.driver}</td>
                                            <td>
                                                <span
                                                    style={{
                                                        backgroundColor: getStatusColor(item.status),
                                                        color: "white",
                                                        padding: "1px 10px",
                                                        borderRadius: "12px",
                                                        display: "inline-block",
                                                        fontWeight: "400",
                                                        fontSize: "12px !important",
                                                        textTransform: "none"
                                                    }}
                                                >
                                                    {item.status}
                                                </span>

                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Tables>
                        </div>

                    </div>
                </div>
            </div>

        </>
    );
};

export default DashboardContent;
