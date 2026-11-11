import React, { useEffect, useState } from 'react'
import Input from '../../../components/formComponent/Input'
import { useTranslation } from 'react-i18next';
import ReactSelect from '../../../components/formComponent/ReactSelect';
import CustomTable from '../../../components/Table/CustomTable';
import { axiosInstance } from '../../../utils/axiosInstance';
import { apiUrls } from '../../../utils/apiUrls';
import { notify } from '../../../utils/utils';
import Form from 'react-bootstrap/Form';
import TableFilterDot from '../../Components/TableFilterDot';
import FilterInput from '../../../components/Filter/FilterInput';
import excelicon from '../../Images/excelicon.png';
import Tooltip from '../../../components/formComponent/Tooltip';

const EquipmentMasterModal = ({ onSave }) => {
    const { t } = useTranslation();
    const [filterInputValue, setFilterInputValue] = useState("");
    const [filterTableData, setFilterTableData] = useState([]);
    const [equipmentdata, setequipmentdata] = useState([]);
    const [editId, seteditId] = useState()
    const [formdata, setformdata] = useState({
        equipmentTypeName: '',
        IsActive: ''
    });
    const handleFilterInputChange = (e) => {
        const value = e.target.value.toLowerCase();
        setFilterInputValue(value);

        // Filter rows based on search term matching any field
        const filtered = equipmentdata.filter((row) =>
            Object.keys(row).some((key) =>
                String(row[key]).toLowerCase().includes(value)
            )
        );

        setFilterTableData(filtered);
    };
    const tableApi = (companyId) => {
        axiosInstance.get("Equipment/getdata", {
            params: {
                p_type: "EquipmentType",
                p_id: companyId || 0
            }
        })
            .then((resp) => {
                console.log("API RESPONSE:", resp.data);

                const list = resp?.data?.message;
                console.log("list1", list);

                if (Array.isArray(list)) {
                    setequipmentdata(list);
                    setFilterTableData(list);
                } else {
                    setequipmentdata([]);
                    setFilterTableData([]);
                }
            })
            .catch(console.error);
    }

    useEffect(() => {
        setFilterTableData(equipmentdata);
    }, [equipmentdata]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setformdata((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSelectChange = (name, value) => {
        setformdata((prev) => ({ ...prev, [name]: value?.value }));
    };
    const handlesubmit = async (e) => {
        e.preventDefault();

        let requestdata = {
            TransactionType: editId ? "Update" : "Insert",
            equipmentTypeId: editId || 0,
            equipmentTypeName: formdata?.equipmentTypeName,
            IsActive: formdata?.IsActive ? true : false
        };

        try {
            const resp = await axiosInstance.post(apiUrls?.saveequipmenttype, requestdata);
            console.log(resp.data.data);

            if (resp?.data?.success === true) {
                notify(resp?.data?.message, "success");
                setformdata({
                    equipmentTypeName: '',
                    IsActive: '',
                });
                fetchequipmentdata();
                onSave?.();
            } else {
                // Handle API failure response gracefully
                notify(resp?.data?.message || "Insert failed", "error");
            }

        } catch (error) {
            console.log(error);
            notify(error?.response?.data?.message || "Insert failed", "error");
        }
        fetchequipmentdata();
    };
    const handleEdit = (id) => {
        console.log("clicked id:", id);

        const found = equipmentdata.find(
            (item) => item.EquipmentID === id   // ✅ correct key
        );

        console.log("found:", found);

        if (found) {
            setformdata({
                equipmentTypeName: found.EquipmentName || '', // ⚠️ also fix this
                IsActive: found.IsActive === 1,
            });
            seteditId(id);
        }
    };

    const fetchequipmentdata = () => {
        axiosInstance.get("Equipment/GetAllMaster", {
            params: {
                p_type: "EquipmentType",
                p_id: 0
            }
        })
            .then((resp) => {
                console.log("API RESPONSE:", resp.data);

                const list = resp?.data?.message; // ✅ correct key
                if (Array.isArray(list)) {
                    setequipmentdata(list);
                    setFilterTableData(list);
                } else {
                    setequipmentdata([]);
                    setFilterTableData([]);
                }
            })
            .catch(console.error);
    };
    useEffect(() => {
        fetchequipmentdata();
    }, [])
    const equipmentSave =()=>{
    const finalPayload = {
        equipmentType:payload?.EquipmentName
      };
    
      axiosInstance
        .post("Equipment/save-equipment-type", finalPayload)
        .then((res) => {
          if (res?.data?.success) {
            toast.success(res?.data?.message || "Transfer updated successfully");
    
           
          } else {
            toast.error(res?.data?.message || "Update failed");
          }
        })
        .catch((err) => {
          toast.error(err?.response?.data?.message || "Failed to Save ");
        });
   }

    const tableHeaders = [
        { header: "Sr No", field: "SrNo" },
        { header: "Name", field: "Name" },
        { header: "Status", field: "Status" },
        { header: "CreatedBy", field: "createdby" },
        { header: "CreatedOn", field: "createdOn" },
        { header: "UpatedBy", field: "updatedby" },
        { header: "UpatedOn", field: "updatedOn" },
        { header: "Edit", field: "edits" },
    ]

    const statusdata = [
        { value: true, label: "Active" },
        { value: false, label: "InActive" },
    ]
    const statusCount = (isInactive) => {
        return (Array.isArray(equipmentdata) ? equipmentdata : [])?.filter(item => item.IsActive === (isInactive ? 0 : 1))?.length;
    };
    return (
        <>
            <div className="card">
                <form onSubmit={handlesubmit}>
                    <div className="row p-2 d-flex align-items-center">
                        <Input
                            type="text"
                            placeholder=" "
                            lable={t("Name")}
                            id="equipmentTypeName"
                            name="equipmentTypeName"
                            value={formdata?.equipmentTypeName}
                            onChange={handleChange}
                            respclass={"col-md-4 col-12"}
                        />
                        <div className="col-md-4 col-12">
                            <Form>
                                <Form.Check
                                    type="switch"
                                    id="custom-switch"
                                    name="IsActive"
                                    checked={formdata?.IsActive}
                                    onChange={handleChange}
                                    label="Status"
                                />
                            </Form>
                        </div>
                        <div className="col-md-4 col-12 d-flex gap-3" style={{ gap: "4px" }}>
                            <button
                                className="btn btn-sm btn block btn-success  px-5"
                            // onClick={handleSave}
                            >
                                {editId ? "Update" : "Save"}
                            </button>
                            {/* <div style={{ gap: "4px" }} className="excel_exp d-flex">

                                <div>
                                    <Tooltip position="top" target=".excel-icon" />
                                    <img
                                        onClick={() => ExportToExcel(equipmentdata)}
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
                            /> */}
                        </div>

                    </div>
                </form>

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
                <div className="mt-1 table_ticket">
                    <CustomTable
                        columns={tableHeaders}
                        data={filterTableData.map((itm, index) => ({

                            ...itm,
                            rowColor: itm?.IsActive === 1 ? "#90EE90" : "#FFFFFF",
                            SrNo: index + 1,
                            Name: itm?.EquipmentName,
                            Status: itm?.IsActive === 1 ? "Yes" : "No",
                            createdby: itm?.CreatedByName,
                            createdOn: itm?.dtEntry,
                            updatedby: itm?.UpdatedByName,
                            updatedOn: itm?.dtUpdate,
                            edits: (
                                <div onClick={() => handleEdit(itm.EquipmentID)}>

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
    )
}

export default EquipmentMasterModal