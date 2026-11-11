import React, { useEffect, useMemo, useState } from "react";
import Accordion from "../../components/UI/Accordion";
import Input from "../../components/formComponent/Input";
import { axiosInstance } from "../../utils/axiosInstance";
import { getDepartment } from "../../utils/NetworkApi/commonApi";
import { useTranslation } from "react-i18next";
import { SaveButton } from "../../components/UI/CustomButton";
import ReactSelect from "../../components/formComponent/ReactSelect";
import Tables from "../../components/UI/customTable";
import ColorCodingSearch from "../../components/ModalComponent/ColorCodingSearch";

const SubDepartment = () => {
    const { t } = useTranslation();
    const colorCodingData = [
        { color: "#FFFFFF", id: "1", labelKey: "Active", status: 1 },
        { color: "#f5c6cb", id: "2", labelKey: "In Active", status: 0 },
    ];

    const [formData, setFormData] = useState({
        DepartmentName: "",
        DepartmentID: "",
        SubDepartmentName: "",
        isActive: 1,
    });
    const [isEdit, setIsEdit] = useState(false);
    const [err, setErr] = useState({});
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [tableData, setTableData] = useState([]);
    const [options, setOptions] = useState([]);
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }))
    };
    const handleReactSelect = (name, e) => {
        setFormData(prev => ({ ...prev, [name]: e?.value }))
    }

    const handleToggle = () => {
        setFormData((prev) => ({
            ...prev,
            isActive: prev.isActive === 1 ? 0 : 1,
        }));
    }

    const getTableData = () => {
        axiosInstance
            .get("Investigations/GetAllSubDepartment")
            .then((res) => {
                setTableData(res.data.message);
                setLoading(false);
            })
            .catch((err) => console.log(err));
    };

    const handleSave = () => {
        const departmentName = options.find((item) => item.value === formData.DepartmentID)?.label;
        const finalPayload = {
            ...formData,
            DepartmentName: departmentName
        }
        setLoading(true);
        axiosInstance
            .post(isEdit ? "Investigations/UpdateSubDepartments"
                : "Investigations/SaveSubDepartments",
                finalPayload)
            .then((res) => {
                setLoading(false);
                getTableData();
                setFormData({
                    DepartmentID: "",
                    SubDepartmentName: "",
                    DepartmentName: "",
                    isActive: 1,
                });
                setIsEdit(false);
                toast.success("Sub Department " + (isEdit ? "updated" : "saved") + " successfully");
            })
            .catch((err) => console.log(err));
    };

    const handleEdit = (item) => {
        setFormData({
            id: item.Id,
            DepartmentID: item.DepartmentId,
            SubDepartmentName: item.SubDepartmentName,
            DepartmentName: item.DepartmentName,
            isActive: item.IsActive,
        });
        setIsEdit(true);
    };

    const filteredData = useMemo(() => {
        if (!searchText) return tableData;

        const search = searchText.toLowerCase();

        return tableData.filter(
            (item) =>
                // item?.DepartmentName?.toLowerCase().includes(search) ||
                item?.SubDepartmentName?.toLowerCase().includes(search)
        );
    }, [tableData, searchText]);

    useEffect(() => {
        getTableData();
        getDepartment(setOptions,
            "getDepartmentEmployeeMaster",)
    }, []);
    return (
        <div>
            <Accordion name="Sub Department" defaultValue={true} isBreadcrumb={true}>
                <div className="row pt-2 pl-2 pr-2">
                    <div className="col-sm-2">
                        <ReactSelect
                            dynamicOptions={options}
                            name="DepartmentID"
                            lable="Select Department"
                            id="DepartmentID"
                            placeholderName="Select Department"
                            value={formData?.DepartmentID}
                            onChange={handleReactSelect}
                        />
                    </div>
                    <div className="col-sm-2">
                        <Input
                            name="SubDepartmentName"
                            lable="Sub Department"
                            id="Sub Department"
                            placeholder=" "
                            value={formData?.SubDepartmentName}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="col-sm-1 d-flex align-items-center">
                        <label className="switch">
                            <input
                                type="checkbox"
                                checked={formData.isActive === 1}
                                onChange={handleToggle}
                            />
                            <span className="slider"></span>
                        </label>
                        <strong className="ml-2 mb-2">{t("IsActive")}</strong>
                    </div>
                    <SaveButton
                        onClick={handleSave}
                        disabled={loading}
                        loading={loading}
                        text={t(isEdit ? "Update" : "Save")}
                    />

                </div>
            </Accordion>
            <Accordion name="Sub Department List" defaultValue={true} isBreadcrumb={true}

                notOpen={true}
                linkTo="#"
                linkTitle={

                    <div className=" d-flex" style={{ gap: "5px" }}>
                        {colorCodingData.map(({ color, labelKey, id, status }) => (
                            <ColorCodingSearch
                                key={id}
                                color={color}
                                label={`${t(labelKey)} (${filteredData?.filter(
                                    (item) => item?.IsActive === status
                                ).length
                                    })`}
                            />
                        ))}

                        <div>

                            <Input
                                type="text"
                                placeholder="Search Sub Department..."
                                value={searchText}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => setSearchText(e.target.value)}
                                className="mt-2"
                            />

                        </div>
                    </div>
                }>
                <Tables>
                    <thead>
                        <tr>
                            <th>S.No</th>
                            <th>Department</th>
                            <th>Sub Department</th>
                            <th>Created By</th>
                            <th>Created Date</th>
                            <th>Updated By</th>
                            <th>Updated Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            filteredData?.map((item, index) => (
                                <tr key={index} style={{
                                    backgroundColor: item?.IsActive === 0 ?
                                        colorCodingData.find(i => i.status === 0)?.color : ""
                                }}>
                                    <td>{index + 1}</td>
                                    <td>{item?.DepartmentName}</td>
                                    <td>{item?.SubDepartmentName}</td>
                                    <td>{item?.CreatedByName}</td>
                                    <td>{item?.dtEntry}</td>
                                    <td>{item?.UpdatedByName}</td>
                                    <td>{item?.dtUpdate}</td>
                                    <td>
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => handleEdit(item)}
                                        >
                                            <i className="fa fa-edit"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        }
                    </tbody>
                </Tables>

            </Accordion>
        </div>
    );
};

export default SubDepartment;