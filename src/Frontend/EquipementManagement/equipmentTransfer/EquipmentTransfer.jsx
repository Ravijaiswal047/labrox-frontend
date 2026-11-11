import React, { useEffect, useState, useRef } from 'react'
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import CentreToCentre from './CentreToCentre';
import DepartmentToDepartment from './DepartmentToDepartment';
import Supplier from './Supplier';
import CustomTable from '../../../components/Table/CustomTable';
import '../Equipmentmaster.css';
import excelicon from '../../Images/excelicon.png'
import FilterInput from '../../../components/Filter/FilterInput';
import { Tooltip } from "primereact/tooltip";
import Heading from '../../../components/UI/Heading';
import { ExportToExcel } from '../../../utils/helpers';
import Modal from '../../../components/ModalComponent/Modal';
import MarkReceivedPopup from './MarkReceivedPopup';
import { PiSealCheckDuotone } from "react-icons/pi";
import { MdCancel } from 'react-icons/md';
import { FiBell } from 'react-icons/fi';
import { MdEdit } from 'react-icons/md';
import EquipmentDashboard from '../equipmentDashboard/EquipmentDashboard';
import EquipmentMaster from '../equipmentMaster/EquipmentMaster';
import SeeMore from '../../SampleStorage/frameMenu/SeeMore';
import { ViewMenu } from '../../../components/SvgIcons';
import EquipementMaintenance from '../equipmentMaintenanace/EquipementMaintenance';
import VirtualDepartment from '../virtualDepartment/VirtualDepartment';
import BreakdownSummary from '../equipmentMaintenanace/BreakdownSummary';
import { axiosInstance } from '../../../utils/axiosInstance';
import { apiUrls } from '../../../utils/apiUrls';
import { useSelector } from 'react-redux';
import TableFilterDot from '../../Components/TableFilterDot';
import ColorCodingSearch from '../../../components/ModalComponent/ColorCodingSearch';



const EquipmentTransfer = () => {
    const [t] = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const centreComponentRef = useRef(null);
    const departmentComponentRef = useRef(null); // <-- ref for DepartmentToDepartment
    const supplierComponentRef = useRef(null); // <-- ref for Supplier
    const [showMore, setShowMore] = useState(false);
    const [showpopup, setShowPopup] = useState(false);
    const [filterInputValue, setFilterInputValue] = useState("");
    const [filterTableData, setFilterTableData] = useState([]);
    const [activeTab, setActiveTab] = useState("Centre");
    const [transferdata, settransferdata] = useState([]);
    const [resetKey, setResetKey] = useState(0);
    const [excelFunction, setExcelFunction] = useState(null);
    const [departmentExcelFunction, setDepartmentExcelFunction] = useState(null);
    const [supplierExcelFunction, setSupplierExcelFunction] = useState(null);
    const { refreshLoad } = useSelector((state) => state.loadingSlice);

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
        {
            name: "Equipment Management Hub",
            component: null,
            url: "/equipmentmanager/equipment-hub",
        },
    ];

    const navList = [
        { label: t("Centre to Other Centre"), key: "Centre" },
        { label: t("Department to Other Department"), key: "Department" },
        { label: t("To Supplier for Repair"), key: "Supplier" },
    ];

    useEffect(() => {
        const hashTab = location.hash.replace("#", "") || "Centre";
        setActiveTab(hashTab);
    }, [location.hash]);

    const handleThemeClass = (key) => {
        setActiveTab(key);
        settransferdata([]);
        setFilterInputValue("");
        setResetKey((prev) => prev + 1);
        navigate(`#${key}`, { replace: true });
    };

    const tableHeaders = [
        { header: "SR No", field: "srNo" },
        { header: "EquipmentMachine", field: "MachineID" },
        { header: "FromCenter", field: "FromCentreName" },
        { header: "ToCenter", field: "ToCentreName" },
        { header: "Transfer Date", field: "transferdate" },
        { header: "Status", field: "Reason" },
        { header: "Created By", field: "CreatedBy" },
        { header: "Created Date", field: "CreatedDate" },
        { header: "Last Update By", field: "LastUpdateBy" },
        { header: "Last Update Date", field: "LastUpdateDate" },
        { header: "Edit", field: "editIcon" },
    ];

    const supplierTableHeaders = [
        { header: "SR No", field: "srNo" },
        { header: "Equipment", field: "Equipment" },
        { header: "Equipment Condition", field: "EquipmentCondition" },
        { header: "Reason of Transfer", field: "ReasonOfTransfer" },
        { header: "Transfer Date", field: "TransferDate" },
        { header: "Expected Return Date", field: "ExpectedReturnDate" },
        { header: "Handover Name", field: "HandoverName" },
        { header: "Handover Designation", field: "HandoverDesignation" },
        { header: "Handover Mobile", field: "HandoverMobile" },
        { header: "Handover Email", field: "HandoverEmail" },
        { header: "Created By", field: "CreatedBy" },
        { header: "Created Date", field: "CreatedDate" },
        { header: "Last Update By", field: "LastUpdateBy" },
        { header: "Last Update Date", field: "LastUpdateDate" },
        { header: "Edit", field: "editIcon" },
    ];

    const departmentTableHeaders = [
        { header: "SR No", field: "srNo" },
        { header: "Equipment", field: "MachineID" },
        { header: "From Department", field: "VirtualDeptName" },
        { header: "To Department", field: "NewVirtualDeptName" },
        { header: "Description", field: "Description" },
        // { header: "Transfer Date", field: "TransferDate" },
        // { header: "Status", field: "Status" },
        { header: "Created By", field: "CreatedByName" },
        { header: "Created Date", field: "CreatedDate" },
        { header: "Last Update By", field: "UpdatedByName" },
        { header: "Last Update Date", field: "UpdatedDate" },
        { header: "Edit", field: "editIcon" },
    ];

    const handleFilterInputChange = (e) => {
        const value = e.target.value.toLowerCase();
        setFilterInputValue(value);
        const filtered = transferdata.filter((row) =>
            Object.keys(row).some((key) =>
                String(row[key]).toLowerCase().includes(value)
            )
        );
        settransferdata(filtered);
    };

    const fetchtransferdata = () => {
        axiosInstance.get("Equipment/GetAllMaster", {
            params: {
                p_type: "Transfer",
                p_id: 0
            }
        })
            .then((resp) => {
                const data = resp?.data?.message || resp?.data?.data || [];
                settransferdata(Array.isArray(data) ? data : []);
            })
            .catch((error) => {
                console.error(error);
            });
    };

    const [updatestatus, setupdarestatus] = useState({
        transactionType: '',
        id: '',
        remarks: ''
    });

    const handleupdate = async (type, id) => {
        const requestdata = {
            transactionType: type,
            TransferID: id,
        };
        console.log("Payload being sent:", requestdata);
        await axiosInstance
            .post(apiUrls.EquipmentTransfer, requestdata)
            .then((res) => {
                console.log(res);
                if (Array.isArray(res?.data?.message)) {
                    setupdarestatus(res?.data?.message);
                    fetchtransferdata();
                } else {
                    notify(res?.data?.message, "error");
                }
            })
            .catch((err) => {
                console.log(err);
                notify(err?.data?.message, "error");
            });
        fetchtransferdata();
    };

    useEffect(() => {
        fetchtransferdata();
    }, [refreshLoad]);

    const statusCount = (sType) => {
        return transferdata?.filter(itm => itm?.STATUS === sType)?.length;
    };

    const _normalize = (v) => String(v ?? "").toLowerCase();
    const activeCount = transferdata?.filter(itm => {
        const s = _normalize(itm?.IsActive ?? itm?.isActive);
        return s === "active" || s === "1" || s === "true" || s === "yes";
    }).length;
    const inactiveCount = transferdata?.filter(itm => {
        const s = _normalize(itm?.IsActive ?? itm?.isActive);
        return s === "inactive" || s === "in-active" || s === "0" || s === "false" || s === "no";
    }).length;

    const colorsCodingData = [
        { color: "#FFFFFF", id: "8", labelKey: "Active", count: activeCount },
        { color: "#ffaeae", id: "7", labelKey: "InActive", count: inactiveCount },
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
            {showpopup &&
                <Modal
                    Header={"Mark as Received"}
                    visible={showpopup}
                    setVisible={setShowPopup}
                    children={<MarkReceivedPopup />}
                    modalWidth={"80%"}
                />
            }
            <Heading
                name={"Equipment Transfer"}
                isBreadcrumb={true}
                secondTitle={
                    <>
                        <label onClick={() => setShowMore((prev) => !prev)}>
                            <ViewMenu />
                        </label>

                    </>
                }
            />
            <div className="card-header">
                <div className="Card_title">
                    <ul className="nav d-flex">
                        {navList.map((menuItem) => (
                            <li
                                className={`nav-item mx-1 ${activeTab === menuItem.key ? "active-tab-menu" : "text_black"}`}
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

            {activeTab === "Centre" &&
                <CentreToCentre
                    ref={centreComponentRef}
                    key={`Centre-${resetKey}`}
                    settransferdata={settransferdata}
                    setExcelFunction={setExcelFunction}
                />
            }
            {activeTab === "Department" &&
                <DepartmentToDepartment
                    ref={departmentComponentRef}
                    key={`Department-${resetKey}`}
                    settransferdata={settransferdata}
                    setExcelFunction={setDepartmentExcelFunction}
                />
            }
            {activeTab === "Supplier" &&
                <Supplier
                    ref={supplierComponentRef}
                    key={`Supplier-${resetKey}`}
                    settransferdata={settransferdata}
                    setExcelFunction={setSupplierExcelFunction}
                />
            }

            <div
                style={{ gap: "4px" }}
                className="d-flex align-items-end flex-grow-1 justify-content-end my-2 px-2"
            >
            </div>

            <Heading
                title={t("Transfer Log")}
                secondTitle={
                    <div className="d-flex align-items-center" style={{ gap: "8px" }}>
                        <Tooltip position="top" target=".excel-icon" />
                        <img
                            onClick={() => {
                                if (activeTab === "Centre" && excelFunction) {
                                    excelFunction();
                                } else if (activeTab === "Department" && departmentExcelFunction) {
                                    departmentExcelFunction();
                                } else if (activeTab === "Supplier" && supplierExcelFunction) {
                                    supplierExcelFunction();
                                } else {
                                    ExportToExcel(transferdata);
                                }
                            }}
                            src={excelicon}
                            alt="Export to Excel"
                            className="excel-icon"
                            data-pr-tooltip="Export Active Data"
                            style={{ width: "26px", height: "26px", cursor: "pointer" }}
                        />
                        {activeTab === "Department" && colorsCodingData.map(({ color, labelKey, id, count }) => (
                            <ColorCodingSearch
                              key={id}
                              color={color}
                              label={`${t(labelKey)} (${count})`}
                            />
                          ))}
                        <FilterInput
                            value={filterInputValue}
                            onChange={handleFilterInputChange}
                            placeholder="Filter Table"
                        />
                    </div>
                }
            />

            <CustomTable
                columns={
                    activeTab === "Supplier"
                        ? supplierTableHeaders
                        : activeTab === "Department"
                        ? departmentTableHeaders
                        : tableHeaders
                }
                data={transferdata?.map((item, index) => {
                    let rowColor = "";
                    if (activeTab === "Department") {
                        const rawStatus = String(item?.IsActive ?? item?.isActive ?? "").toLowerCase();
                        const isActive = rawStatus === "active" || rawStatus === "1" || rawStatus === "true" || rawStatus === "yes";
                        const isInactive = rawStatus === "inactive" || rawStatus === "in-active" || rawStatus === "0" || rawStatus === "false" || rawStatus === "no";
                        if (isActive) {
                            rowColor = "#FFFFFF";
                        } else if (isInactive) {
                            rowColor = "#ffaeae";
                        }
                    }

                    return {
                        ...item,
                        srNo: index + 1,
                        rowColor: rowColor,
                        ...((activeTab === "Supplier" || activeTab === "Department") ? {
                            // For Department and Supplier tabs: wire up the edit icon to respective refs
                            editIcon: activeTab === "Department" ? (
                                <i
                                    className="fa fa-edit"
                                    style={{ fontSize: '18px', color: '#0056b3', cursor: 'pointer' }}
                                    onClick={() => departmentComponentRef.current?.handleEditClick(item)}
                                    title="Edit"
                                ></i>
                            ) : activeTab === "Supplier" ? (
                                <i
                                    className="fa fa-edit"
                                    style={{ fontSize: '18px', color: '#0056b3', cursor: 'pointer' }}
                                    onClick={() => supplierComponentRef.current?.handleEditClick(item)}
                                    title="Edit"
                                ></i>
                            ) : null,
                        } : {
                            equipment: item?.EquipmentName,
                            transferType: item?.TransferType,
                            from: item?.FromData,
                            to: item?.ToData,
                            transferdate: item?.TransferDate,
                            createdBy: item?.CreatedByName,
                            createdDate: item?.CreatedDate,
                            lastUpdatedBy: item?.UpdatedByName,
                            lastUpdatedDate: item?.LastUpdateDate,
                            editIcon: activeTab === "Centre" && (
                                <i
                                    className="fa fa-edit"
                                    style={{ fontSize: '18px', color: '#0056b3', cursor: 'pointer' }}
                                    onClick={() => centreComponentRef.current?.handleEditClick(item)}
                                    title="Edit"
                                ></i>
                            ),
                        }),
                        ...((activeTab !== "Supplier" && activeTab !== "Department") ? {
                            action: (() => {
                                if (item.STATUS === "Pending to Accept") {
                                    return (
                                        <div className="action-buttons">
                                            <button className='transferbtn accept d-flex gap-3 align-items-center'
                                                onClick={() => handleupdate('Accept', item?.TransferID)}
                                            >
                                                <div className="text">Accept</div>
                                            </button>
                                            <button className='transferbtn reject d-flex gap-3 align-items-center'
                                                onClick={() => handleupdate('Reject', item?.TransferID)}
                                            >
                                                <div className="text">Reject</div>
                                            </button>
                                        </div>
                                    );
                                } else if (item.STATUS === "Pending to Receive") {
                                    return (
                                        <div className="action-buttons">
                                            <button className='transferbtn received d-flex gap-3 align-items-center'
                                                onClick={() => handleupdate('Received', item?.TransferID)}
                                            >
                                                <div className="text">Received</div>
                                            </button>
                                            <button className='transferbtn reject d-flex gap-3 align-items-center'
                                                onClick={() => handleupdate('Reject', item?.TransferID)}
                                            >
                                                <div className="text">Reject</div>
                                            </button>
                                        </div>
                                    );
                                } else if (item.STATUS === "Received") {
                                    return (
                                        <p>
                                            Received By: {item?.ReceivedByName},<br />
                                            Received Date: {item?.dtReceived}
                                        </p>
                                    );
                                } else if (item.STATUS === "Rejected") {
                                    return (
                                        <p>
                                            Rejected By: {item?.RejectedByName},<br />
                                            Rejected Date: {item?.dtReject}
                                        </p>
                                    );
                                } else if (item.STATUS === "Accepted") {
                                    return (
                                        <p>
                                            Accept By: {item?.AcceptedByName},<br />
                                            Accept Date: {item?.dtAccept}
                                        </p>
                                    );
                                } else {
                                    return null;
                                }
                            })()
                        } : {})
                    };
                })}
            />
        </>
    );
};

export default EquipmentTransfer;