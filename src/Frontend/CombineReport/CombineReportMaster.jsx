import React, { useEffect, useState } from 'react'
import CodeMirror from "@uiw/react-codemirror";
import { sql } from "@codemirror/lang-sql";
import { useTranslation } from 'react-i18next'
import Accordion from '../../components/UI/Accordion'
import Input from '../../components/formComponent/Input';
import TextAreaInput from '../../components/formComponent/TextAreaInput';
import { CustomButton, SaveButton, SearchButton } from '../../components/UI/CustomButton';
import { useLocalStorage } from '../../utils/hooks/useLocalStorage';
import { toast } from 'react-toastify';
import { axiosInstance } from '../../utils/axiosInstance';
import Tables from '../../components/UI/customTable';
import MultiSelectComp from '../../components/formComponent/MultiSelectComp';
import { Dialog } from 'primereact/dialog';
import { Tooltip } from 'primereact/tooltip';
import ColorCodingSearch from '../../components/ModalComponent/ColorCodingSearch';

const CombineReportMaster = () => {
    const { t } = useTranslation();
    const SuperAdmin = useLocalStorage("userData", "get")?.SuperAdmin;
    const isMobile = window.innerWidth <= 768;
    const theme = useLocalStorage("theme", "get");
    const [formData, setFormData] = useState({
        Id: 0,
        Name: "",
        IsActive: 1,
        Disclaimer: "",
        SqlQuery: "",
    })
    const [errors, setErrors] = useState({})
    const [tableData, setTableData] = useState([]);
    const [sqlDialog, setSqlDialog] = useState({ show: false, query: "" });
    const [changedRows, setChangedRows] = useState({});
    const [searchTerm, setSearchTerm] = useState("");
    const [isEdit, setIsEdit] = useState(false)

    const colorCodingData = [
        { color: "#FFFFFF", id: "1", labelKey: "Active" },
        { color: "#f5c6cb", id: "2", labelKey: "In Active" },
    ];

    const validate = () => {
        let err = {};
        if (!formData.Name.trim()) err.Name = "Name is required";
        if (!formData.Disclaimer.trim()) err.Disclaimer = "Disclaimer is required";
        setErrors(err);
        return Object.keys(err).length === 0;
    }

    const handleSave = async () => {
        if (!validate()) {
            return;
        }

        try {
            const res = await axiosInstance.post("CombineReportMaster/SaveOrUpdateCombineReportMaster", formData);
            if (res.data.success) {
                toast.success(res.data.message);
                setFormData({
                    Id: 0,
                    Name: "",
                    IsActive: "",
                    Disclaimer: "",
                    SqlQuery: "",
                })
                setIsEdit(false)
                handleSearch();
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            toast.error("Something went wrong");
        }
    }

    const handleEdit = (row) => {
        setIsEdit(true)
        setFormData({
            Id: row.id,
            Name: row.name,
            IsActive: row.isActive,
            Disclaimer: row.disclaimer,
            SqlQuery: row.sqlQuery,
        })
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        })
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: ""
            })
        }
    }
    const handleToggle = (field) => {
        setFormData((prev) => ({
            ...prev,
            [field]: prev[field] == 1 ? 0 : 1,
        }));
    };


    const handleSearch = async () => {
        try {
            const res = await axiosInstance.post("CombineReportMaster/GetCombineReportMaster", {
                id: 0,
                isActive: 2
            });
            if (res.data.success && Array.isArray(res.data.message)) {
                setTableData(res.data.message);
                // Initialize changedRows with current selections
                const initialChanges = {};
                res.data.message.forEach(row => {
                    initialChanges[row.id] = row.columns || [];
                });
                setChangedRows(initialChanges);
            } else {
                setTableData([]);
                toast.error(res.data.message);
            }
        } catch (error) {
            toast.error("Something went wrong");
        }
    }

    const filteredData = tableData.filter(row => {
        return (
            row.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            row.disclaimer.toLowerCase().includes(searchTerm.toLowerCase())
        )
    });

    const handleColumnChange = (rowId, selectedOptions) => {
        setChangedRows(prev => ({
            ...prev,
            [rowId]: selectedOptions
        }));
    };

    const handleUpdateColumns = async () => {
        const payload = Object.keys(changedRows)
            .filter(id => {
                const original = tableData.find(r => r.id == id)?.columns || [];
                const current = changedRows[id] || [];
                return JSON.stringify(original.sort()) !== JSON.stringify(current.sort());
            })
            .reduce((acc, id) => {
                const cols = changedRows[id] || [];
                const items = cols.map(colName => ({
                    id: 0,
                    combineReportId: Number(id),
                    columnName: colName
                }));
                return [...acc, ...items];
            }, []);

        if (payload.length === 0) {
            toast.info("No changes to update");
            return;
        }

        try {
            const res = await axiosInstance.post("CombineReportMaster/SaveCombineReportColumns", payload);
            if (res.data.success) {
                toast.success(res.data.message);
                handleSearch();
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            toast.error("Failed to update columns");
        }
    };

    useEffect(() => {
        handleSearch();
    }, [])

    return (
        <>
            <Accordion
                name={t("Combine Report Master")}
                defaultValue={true}
                isBreadcrumb={true}
            >
                <div className="row col-12 pt-2 pl-2 pr-2 mb-2">
                    <div className="col-sm-2">
                        <Input
                            type="text"
                            name="Name"
                            className="required-fields"
                            lable={t("Name")}
                            placeholder=" "
                            maxLength={50}
                            onChange={handleChange}
                            value={formData?.Name}
                        />
                        <span className="error-message">{errors?.Name}</span>
                    </div>
                    <div className="col-auto d-flex align-items-start justify-content-center p-2" style={{
                        gap: "5px"
                    }}>
                        <label class="switch mb-0">
                            <input
                                type="checkbox"
                                checked={formData.IsActive == "1"}
                                onChange={() => handleToggle("IsActive")}
                            />
                            <span class="slider"></span>
                        </label>
                        <strong>
                            <span>{t("IsActive")}</span>
                        </strong>
                    </div>
                    <div className="col-sm-4">
                        <TextAreaInput
                            id="Disclaimer"
                            lable="Disclaimer"
                            onChange={handleChange}
                            value={formData?.Disclaimer}
                            name="Disclaimer"
                        />
                        <span className="error-message">{errors?.Disclaimer}</span>
                    </div>
                    <div className="col-sm-auto">
                        <CustomButton
                            text={isEdit ? t("Update") : t("Save")}
                            icon={isEdit ? t("edit") : t("save")}
                            onClick={handleSave}
                        />
                    </div>
                    {SuperAdmin == 1 && (
                        <div className="col-sm-12">
                            <label className="form-label">{t("SQL Query")}</label>

                            <div style={{
                                border: "1px solid #ced4da",
                                borderRadius: "4px",
                                overflow: "hidden"
                            }}>
                                <CodeMirror
                                    value={formData.SqlQuery}
                                    minHeight="100px"
                                    maxHeight="200px"
                                    extensions={[sql()]}
                                    onChange={(value) =>
                                        setFormData({ ...formData, SqlQuery: value })
                                    }
                                    theme="dark"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </Accordion>
            <Accordion
                name={t("Search Data")}
                defaultValue={true}
                isBreadcrumb={true}
                notOpen={true}
                linkTo="#"
                linkTitle={
                    <div
                        className="d-none d-md-flex align-items-center justify-content-between"
                        id="pr_id_11"
                        style={{
                            gap: "5px"
                        }}
                    >
                        {colorCodingData.map(({ color, labelKey, id }) => (
                            <ColorCodingSearch
                                key={id}
                                color={color}
                                label={t(labelKey)}
                            />
                        ))}
                        <div className="mt-2">
                            <Input
                                className=""
                                type="text"
                                name="search"
                                id="search"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                }}
                            />
                        </div>
                    </div>
                }
            >
                <div className="row col-12 pt-2 pl-2 pr-2">
                    {filteredData.length > 0 && (
                        <>
                            <Tables>
                                <thead>
                                    <tr>
                                        <th>{t("S.No")}</th>
                                        <th>{t("Name")}</th>
                                        <th>{t("Disclaimer")}</th>
                                        <th>{t("SQL Query")}</th>
                                        <th>{t("Date")}</th>
                                        <th>{t("Created By")}</th>
                                        <th style={{ width: "300px" }}>{t("Columns")}</th>
                                        <th>{t("Action")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData.map((row, index) => (
                                        <tr key={row.id}>
                                            <td>{index + 1}</td>
                                            <td>{row.name}</td>
                                            <td
                                                style={{
                                                    width: "400px",
                                                    textOverflow: "ellipsis",
                                                    whiteSpace: "wrap"
                                                }}
                                            >{row.disclaimer}</td>
                                            <td className="">
                                                <i
                                                    className="fa fa-eye text-primary cursor-pointer"
                                                    onClick={() => setSqlDialog({ show: true, query: row.sqlQuery })}
                                                    title="View SQL Query"
                                                ></i>
                                                {/* {row.error && (
                                                    <i
                                                        className="fa fa-exclamation-triangle text-warning ml-2 cursor-pointer sql-error-icon"
                                                        data-pr-tooltip={row?.error}
                                                    ></i>
                                                )} */}
                                            </td>
                                            <td>{row.dtEntry}</td>
                                            <td>{row.createdByName}</td>
                                            <td>
                                                <MultiSelectComp
                                                    options={(row.columns || []).map(col => ({ label: col, value: col }))}
                                                    value={changedRows[row.id] || []}
                                                    onChange={(name, selected) => handleColumnChange(row.id, selected)}
                                                    placeholder={t("Select Columns")}
                                                />
                                            </td>
                                            <td>
                                                <button
                                                    onClick={() => handleEdit(row)}
                                                    className="btn btn-primary btn-sm"
                                                >
                                                    <i
                                                        className="fa fa-edit cursor-pointer"
                                                        title="Edit"
                                                    ></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Tables>
                            <div className="col-12 text-right mb-2">
                                <SaveButton text={t("Update Columns")} onClick={handleUpdateColumns} />
                            </div>
                        </>
                    )}
                </div>
            </Accordion>

            <Dialog
                header={t("SQL Query")}
                visible={sqlDialog.show}
                style={{
                    width: isMobile ? "90vw" : "50vw",
                }}
                className={theme}
                onHide={() => setSqlDialog({ show: false, query: "" })}
            >
                {/* <div className="p-2 bg-light border rounded">
                    <code>{sqlDialog.query}</code>
                </div> */}
                <div style={{
                    border: "1px solid #ced4da",
                    borderRadius: "4px",
                    overflow: "hidden"
                }}>
                    <CodeMirror
                        value={sqlDialog.query}
                        minHeight="100px"
                        maxHeight="200px"
                        extensions={[sql()]}
                        // onChange={(value) =>
                        //     setSqlDialog({ ...sqlDialog, query: value })
                        // }
                        theme="dark"
                    />
                </div>
            </Dialog>
            <Tooltip target=".sql-error-icon" position="top" />
        </>
    )
}

export default CombineReportMaster