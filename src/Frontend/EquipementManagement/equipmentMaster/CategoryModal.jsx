import React, { useEffect, useState } from 'react'
import ReactSelect from '../../../components/formComponent/ReactSelect';
import Input from '../../../components/formComponent/Input';
import { useTranslation } from 'react-i18next';
import { axiosInstance } from '../../../utils/axiosInstance';
import { apiUrls } from '../../../utils/apiUrls';
import { notify } from '../../../utils/utils';
import CustomTable from '../../../components/Table/CustomTable';
import Form from 'react-bootstrap/Form';
import TableFilterDot from '../../Components/TableFilterDot';
import Heading from '../../../components/UI/Heading';
import FilterInput from '../../../components/Filter/FilterInput';
import Tooltip from '../../../components/formComponent/Tooltip';
import excelicon from '../../Images/excelicon.png';

const CategoryModal = () => {
    const { t } = useTranslation();
    const [filterInputValue, setFilterInputValue] = useState("");
    const [filterTableData, setFilterTableData] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [editId, seteditId] = useState("");
    const [formdata, setformdata] = useState({
        categoryName: '',
        IsActive: ''
    });
    const handleFilterInputChange = (e) => {
        const value = e.target.value.toLowerCase();
        setFilterInputValue(value);

        // Filter rows based on search term matching any field
        const filtered = tableData.filter((row) =>
            Object.keys(row).some((key) =>
                String(row[key]).toLowerCase().includes(value)
            )
        );

        setFilterTableData(filtered);
    };
    useEffect(() => {
        setFilterTableData(tableData);
    }, [tableData]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setformdata((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };


    const handlesubmit = async (e) => {
        e.preventDefault();

        let requestdata = {
            transactionType: editId ? "Update" : "Insert",
            categoryID: editId || 0,
            categoryName: formdata?.categoryName,
            IsActive: formdata?.IsActive ? true : false
        };

        try {
            const resp = await axiosInstance.post(apiUrls?.categorysave, requestdata); // <-- assign to 'resp'
            console.log(resp.data.data);

            if (resp?.data?.success === true) {
                notify(resp?.data?.message, "success");
                setformdata({
                    categoryName: '',
                    IsActive: '',

                });
                fetchcategorydata();
            } else {
                // Handle API failure response gracefully
                notify(resp?.data?.message || "Insert failed", "error");
            }

        } catch (error) {
            console.log(error);
            notify(error?.response?.data?.message || "Insert failed", "error");
        }
    };

    const fetchcategorydata = () => {
        axiosInstance.get("Equipment/GetAllMaster", {
            params: {
                p_type: "MaintenanceCategory",
                p_id: 0
            }
        })
            .then((resp) => {
                const list = resp?.data?.message;
                if (Array.isArray(list)) {
                    setTableData(list);
                    setFilterTableData(list);
                } else {
                    setTableData([]);
                    setFilterTableData([]);
                }
            })
            .catch((error) => {
                console.error(error);
            });
    };
    useEffect(() => {
        fetchcategorydata();
    }, [])
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
    const handleEdit = (id, itm) => {
        console.log(id)
        const found = tableData.find((itm) => itm.CategoryID === id);
        if (found) {
            setformdata({
                categoryName: found.CategoryName || '',
                IsActive: found.IsActive === 1 ? true : false,
            });
            seteditId(id);
        }
    };
    const statusCount = (isInactive) => {
        return (Array.isArray(tableData) ? tableData : [])?.filter(item => item.IsActive === (isInactive ? 0 : 1))?.length;
    };


    return (
        <>
            <div className="card">
                <form onSubmit={handlesubmit}>
                    <div className="row p-2 d-flex align-items-center">

                        <Input
                            type="text"
                            placeholder=" "
                            lable={t("Category")}
                            id="categoryName"
                            name="categoryName"
                            value={formdata?.categoryName}
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


                        <div className="col-md-4 col-12 d-flex" style={{ gap: "4px" }}>
                            <button
                                className="btn btn-sm btn block btn-success  px-5"

                            >
                                {editId ? "Update" : "Save"}
                            </button>
                            <div style={{ gap: "4px" }} className="excel_exp d-flex">

                                <div>
                                    <Tooltip position="top" target=".excel-icon" />
                                    <img
                                        onClick={() => ExportToExcel(filterTableData)}
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
                </form>

                <div
                    style={{ gap: "4px" }}
                    className="d-flex justify-content-end pt-1 px-2"
                >
                    <TableFilterDot
                        // onClick={() => handleFilterInputChange(false)}
                        color={"#FFFFFF"}
                        title={`IsActive ${statusCount(false)}`}
                        bgColor={"#ebebebbf"}
                    />
                    <TableFilterDot
                        // onClick={() => handleFilterInputChange(true)}
                        color={"#90EE90"}
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
                            Name: itm?.CategoryName,
                            Status: itm?.IsActive === 1 ? "Yes" : "No",
                            createdby: itm?.CreatedByName,
                            createdOn: itm?.DtEntry,
                            updatedby: itm?.UpdatedByName,
                            updatedOn: itm?.DtUpdate,
                            edits:
                                <div onClick={() => handleEdit(itm.CategoryID)}>
                                    <i

                                        className="fa fa-edit"
                                        style={{ cursor: "pointer", color: "rgb(33, 33, 139)" }}
                                        aria-hidden="true"
                                    ></i>
                                </div>


                        }))}
                    />

                </div>
            </div>
        </>
    )
}

export default CategoryModal
