import React, { useEffect, useState } from 'react'
import ReactSelect from '../../../components/formComponent/ReactSelect';
import Input from '../../../components/formComponent/Input';
import { useTranslation } from 'react-i18next';
import { axiosInstance } from '../../../utils/axiosInstance';
import { notify } from '../../../utils/utils';
import { apiUrls } from '../../../utils/apiUrls';
import CustomTable from '../../../components/Table/CustomTable';
import { Form } from 'react-bootstrap';
import { IsActive } from '../../../utils/Constants';
import TableFilterDot from '../../Components/TableFilterDot';
import excelicon from '../../Images/excelicon.png';
import Tooltip from '../../../components/formComponent/Tooltip';
import FilterInput from '../../../components/Filter/FilterInput';

const SubCategoryModal = () => {
    const { t } = useTranslation();
    const [filterInputValue, setFilterInputValue] = useState("");
    const [filterTableData, setFilterTableData] = useState([]);
    const [categorydata, setcategorydata] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [editId, seteditId] = useState("");
    const [formdata, setformdata] = useState({
        subcategoryName: '',
        categoryID: '',
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

    const handleSelectChange = (name, value) => {
        setformdata((prev) => ({ ...prev, [name]: value?.value }));
    };
    const fetchcategory = () => {
        axiosInstance
            .get("Equipment/GetAllMaster", {
                params: {
                    p_type: "MaintenanceCategory",
                    p_id: 0
                }
            })
            .then((res) => {
                const data = res?.data?.message || [];
                const val = data.map((ele) => ({
                    value: ele.CategoryID,
                    label: ele.CategoryName,
                }));
                setcategorydata(val);
            })
            .catch((err) => {
                console.error(err);
            });
    };
    const fetchsubcategory = () => {
        axiosInstance
            .get("Equipment/GetAllMaster", {
                params: {
                    p_type: "MaintenanceSubcategory",
                    p_id: 0
                }
            })
            .then((res) => {
                const data = res?.data?.message;
                if (Array.isArray(data)) {
                    setTableData(data);
                    setFilterTableData(data);
                } else {
                    setTableData([]);
                    setFilterTableData([]);
                }
            })
            .catch((err) => {
                console.error(err);
            });
    };
    useEffect(() => {
        fetchcategory();
        fetchsubcategory();
    }, [])
    const handlesubmit = async (e) => {
        e.preventDefault();
        let requestdata = {
            transactionType: editId ? "Update" : "Insert",
            subcategoryID: editId || 0,
            categoryID: formdata?.categoryID,
            subcategoryName: formdata?.subcategoryName,
            IsActive: formdata?.IsActive ? true : false
        };

        try {
            const resp = await axiosInstance.post(apiUrls?.subcategorysave, requestdata); // <-- assign to 'resp'
            console.log(resp.data.data);

            if (resp?.data?.success === true) {
                notify(resp?.data?.message, "success");
                setformdata({
                    subcategoryName: '',
                    categoryID: '',
                    IsActive: ''

                });
                fetchsubcategory();
            } else {
                // Handle API failure response gracefully
                notify(resp?.data?.message || "Insert failed", "error");
            }

        } catch (error) {
            console.log(error);
            notify(error?.response?.data?.message || "Insert failed", "error");
        }
    };
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
        const found = tableData.find((itm) => itm.SubcategoryID === id);
        if (found) {
            setformdata({
                subcategoryName: found.SubcategoryName || '',
                categoryID: found.CategoryID,
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
                        <ReactSelect
                            name="categoryID"
                            id="categoryID"
                            removeIsClearable={true}
                            dynamicOptions={categorydata}
                            isShowBorder={true}
                            placeholderName="category"
                            value={formdata?.categoryID}
                            onChange={handleSelectChange}
                            respclass={" col-md-3 col-12"}
                        />
                        <Input
                            type="text"
                            placeholder=" "
                            lable={t("Sub Category")}
                            id="subcategoryName"
                            name="subcategoryName"
                            value={formdata?.subcategoryName}
                            onChange={handleChange}
                            respclass={"col-md-3 col-12"}
                        />
                        <div className="col-md-2 col-12">
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
                            // onClick={handleSave}
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
                            Name: itm?.SubcategoryName,
                            Status: itm?.IsActive === 1 ? "Yes" : "No",
                            createdby: itm?.CreatedByName,
                            createdOn: itm?.DtEntry,
                            updatedby: itm?.UpdatedByName,
                            updatedOn: itm?.DtUpdate,
                            edits: <div onClick={() => handleEdit(itm.SubcategoryID)}>
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

export default SubCategoryModal
