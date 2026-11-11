import React, { useEffect, useState } from 'react';
import Accordion from '../../../components/UI/Accordion';
import Input from '../../../components/formComponent/Input';
import { useTranslation } from 'react-i18next';
import Form from 'react-bootstrap/Form';
import SeeMore from '../../SampleStorage/frameMenu/SeeMore';
import EquipmentDashboard from '../equipmentDashboard/EquipmentDashboard';
import EquipmentMaster from '../equipmentMaster/EquipmentMaster';
import EquipmentTransfer from '../equipmentTransfer/EquipmentTransfer';
import EquipementMaintenance from '../equipmentMaintenanace/EquipementMaintenance';
import Heading from '../../../components/UI/Heading';
import { ViewMenu } from '../../../components/SvgIcons';
import { useNavigate } from 'react-router-dom';
import { ExportToExcel } from '../../../utils/helpers';
import Tooltip from '../../../components/formComponent/Tooltip';
import excelicon from '../../Images/excelicon.png'
import FilterInput from '../../../components/Filter/FilterInput';

import CustomTable from '../../../components/Table/CustomTable';
import BreakdownSummary from '../equipmentMaintenanace/BreakdownSummary';
import { axiosInstance } from '../../../utils/axiosInstance';
import { apiUrls } from '../../../utils/apiUrls';
import { notify } from '../../../utils/utils';
import TableFilterDot from '../../Components/TableFilterDot';
// import VirtualDepartment from '../virtualDepartment/VirtualDepartment';

const VirtualDepartment = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [showMore, setShowMore] = useState(false);
    const [filterInputValue, setFilterInputValue] = useState("");
    const [filterTableData, setFilterTableData] = useState([]);
    const [payload, setPayload] = useState({
        VirtualDeptName: '',
        IsActive: ''
    })
    const [tableData, setTableData] = useState([]);
    const [editId, seteditId] = useState("");
    const handleFilterInputChange = (e) => {
        const value = e.target.value.toLowerCase();
        setFilterInputValue(value);

        // Filter rows based on search term matching any field
        const filtered = tableData.filter((row) =>
            Object.keys(row).some((key) =>
                String(row[key]).toLowerCase().includes(value)
            )
        );

        setTableData(filtered);
    };
    useEffect(() => {
        setFilterTableData(tableData);
    }, []);
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
    const tableHeaders = [
        { header: "Sr No", field: "srno" },
        { header: "Name", field: "name" },
        { header: "Status", field: "status" },
        { header: "Created Date", field: "createdDate" },
        { header: "Created By", field: "createdBy" },
        { header: "LastUpdated Date", field: "lastUpdatedDate" },
        { header: "LastUpdated By", field: "lastUpdatedBy" },
        { header: "Edit", field: "edits" }
    ];

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setPayload((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handlesubmit = async (e) => {
        e.preventDefault();
        let requestdata = {
            transactionType: editId ? "Update" : "INSERT",
            VirtualDeptID: editId || 0,
            VirtualDeptName: payload?.VirtualDeptName,
            Description: "",
            IsActive: payload?.IsActive === true ? true : false
            // IsActive: payload?.IsActive ? 1 : 0
        }
        try {
            const resp = await axiosInstance.post(apiUrls?.VirtualDepartment, requestdata);
            console.log(resp?.data?.data);
            if (resp?.data?.success === true) {
                notify(resp?.data?.message, "success")
                setPayload({
                    VirtualDeptName: '',
                    IsActive: ''
                })
            } else {
                notify(resp?.data?.message, "error")
            }
        } catch (error) {
            console.log(error);
            notify(error?.response?.data?.message || "Insert failed", "error");
        }
        fetchevirtualdepartment();


    }
    const handleEdit = (id, itm) => {
        console.log(id)
        const found = tableData.find((itm) => itm.VirtualDeptID === id);
        if (found) {
            setPayload({
                VirtualDeptName: found.VirtualDeptName || '',
                IsActive: found.IsActive === 1 ? true : false,
            });
            seteditId(id);
        }
    };
    const fetchevirtualdepartment = () => {
        axiosInstance
            .get("Equipment/GetAllMaster", {
                params: {
                    p_type: "VirtualDepartment",
                    p_id: 0
                }
            })
            .then((res) => {
                const data = res?.data?.message || [];
                // const val = data.map((ele) => ({
                //     value: ele.EquipmentID,
                //     label: ele.EquipmentName,
                // }));
                setTableData(data);
            })
            .catch((err) => {
                console.error(err);
            });
    };
    useEffect(() => {
        fetchevirtualdepartment(tableData);
    }, []);
    const statusCount = (isInactive) => {
        return tableData?.filter(item => item.IsActive === (isInactive ? 0 : 1))?.length;
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
                    name={"Virtual Department Master"}
                    isBreadcrumb={true}
                    secondTitle={
                        <>
                            <label onClick={() => setShowMore((prev) => !prev)}>
                                <ViewMenu />
                            </label>
                        </>
                    }
                />
                <form onSubmit={handlesubmit}>
                    <div className="row p-2 d-flex align-items-center">
                        <Input
                            type="text"
                            placeholder=" "
                            lable={t("Name")}
                            id="VirtualDeptName"
                            name="VirtualDeptName"
                            value={payload?.VirtualDeptName}
                            onChange={handleChange}
                            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
                        />


                        <div className="col-xl-2 col-sm-4 col-md-6 col-12 d-flex align-items-center">
                            <Form>
                                <Form.Check
                                    type="switch"
                                    name="IsActive"
                                    id="IsActive"
                                    label="Status"
                                    checked={payload?.IsActive}
                                    onChange={handleChange}
                                />
                            </Form>
                        </div>
                        <button
                            className="btn btn-sm btn block btn-success  px-5"
                        // onSubmit={handlesubmit}
                        >
                            {editId ? "Update" : "Save"}
                        </button>
                    </div>
                </form>
                <div className="row">
                    <div
                        style={{ gap: "4px" }}
                        className="d-flex align-items-end  flex-grow-1 justify-content-end my-2 px-2"
                    >
                        <div style={{ gap: "4px" }} className="excel_exp d-flex">

                            <div>
                                <Tooltip position="top" target=".excel-icon" />
                                <img
                                    onClick={() => ExportToExcel(tableData)}
                                    src={excelicon}
                                    alt="Export to Excel"
                                    className="excel-icon"
                                    data-pr-tooltip="Export Active Data"
                                    style={{ width: "26px", height: "26px", cursor: "pointer" }}
                                />
                            </div>
                        </div>
                        <FilterInput
                            value={filterInputValue}
                            onChange={handleFilterInputChange}
                            placeholder="Filter Table"
                        />
                    </div>
                </div>


                <Heading
                    title={t("Virtual Department Detail")}
                    secondTitle={
                        <>
                            <div
                                style={{ gap: "4px" }}
                                className="d-flex justify-content-end pt-1 px-2"
                            >
                                <TableFilterDot
                                    // onClick={() => handleFilterInputChange(false)}
                                    color={"#90EE90"}
                                    title={`IsActive ${statusCount(false)}`}
                                    bgColor={"#ebebebbf"}
                                />
                                <TableFilterDot
                                    // onClick={() => handleFilterInputChange(true)}
                                    color={"#FFFFFF"}
                                    title={`InActive ${statusCount(true)}`}
                                    bgColor={"#ebebebbf"}
                                />

                            </div>
                        </>
                    }

                />

                <div className="mt-1 table_ticket">
                    <CustomTable
                        columns={tableHeaders}
                        data={tableData.map((itm, index) => ({
                            ...itm,
                            rowColor: itm?.IsActive === 1 ? "#90EE90" : "#FFFFFF",
                            srno: index + 1,
                            name: itm?.VirtualDeptName,
                            status: itm?.IsActive === 1 ? "Yes" : "No",
                            createdDate: itm?.DtEntry,
                            createdBy: itm?.CreatedByName,
                            lastUpdatedDate: itm?.DtUpdate,
                            lastUpdatedBy: itm?.UpdatedByName,
                            edits: (
                                <div onClick={() => handleEdit(itm.VirtualDeptID)}>
                                    <i
                                        className="fa fa-edit"
                                        style={{ cursor: "pointer", color: "rgb(33, 33, 139)" }}
                                        aria-hidden="true"
                                    ></i>
                                </div>
                            )
                        }))}

                    />
                </div>

            </div>
        </>

    );
};

export default VirtualDepartment;
