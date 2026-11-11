import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Accordion from '../../components/UI/Accordion'
import ReactSelect from '../../components/formComponent/ReactSelect';
import Input from '../../components/formComponent/Input';
import { CustomButton, SaveButton } from '../../components/UI/CustomButton';
import TextAreaInput from '../../components/formComponent/TextAreaInput';
import { axiosInstance } from '../../utils/axiosInstance';
import { useLocalStorage } from '../../utils/hooks/useLocalStorage';
import { Dialog } from 'primereact/dialog';
import { toast } from 'react-toastify';
import ColorCodingSearch from '../../components/ModalComponent/ColorCodingSearch';
import Tables from '../../components/UI/customTable';

const SubReportMaster = () => {
    const { t } = useTranslation();
    const isMobile = window.innerWidth <= 768;
    const theme = useLocalStorage("theme", "get");
    const [combinedReportOptions, setCombinedReportOptions] = useState([]);
    const [formData, setFormData] = useState({
        Id: 0,
        combineReportId: 0,
        subReportName: "",
        disclaimer: "",
        reportType: "",
        isActive: 1,
    })
    const [errors, setErrors] = useState({});
    const [reportTypeModal, setReportTypeModal] = useState(false);
    const [reportTypePayload, setReportTypePayload] = useState({
        id: 0,
        reportType: "",
        isPDF: 0,
        isExcel: 0,
        isOnScreen: 0,
        isActive: 1,
    })
    const [reportTypeOptions, setReportTypeOptions] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isEdit, setIsEdit] = useState(false);

    const colorCodingData = [
        { color: "#FFFFFF", id: "1", labelKey: "Active" },
        { color: "#f5c6cb", id: "2", labelKey: "In Active" },
    ];

    const handleSearch = async () => {
        try {
            const res = await axiosInstance.post("CombineReportMaster/GetCombineReportMaster", {
                id: 0,
                isActive: 2
            });
            const data = res.data?.message;
            if (res.data?.success && Array.isArray(res.data?.message)) {
                const options = data.map((item) => ({
                    value: item.id,
                    label: item.name
                }));
                setCombinedReportOptions(options);
            } else {
                setCombinedReportOptions([]);
            }
        } catch (error) {
            console.log("Something went wrong", error);
        }
    }

    const handleReportTypeSearch = async () => {
        try {
            const res = await axiosInstance.post("CombineReportMaster/GetCombineReportType", {
                id: 0,
                isActive: 2
            });
            const data = res.data?.message;
            if (res.data?.success && Array.isArray(res.data?.message)) {
                const options = data.map((item) => ({
                    value: item.ID,
                    label: item.ReportType
                }));
                setReportTypeOptions(options);
            } else {
                setReportTypeOptions([]);
            }
        } catch (error) {
            console.log("Something went wrong", error);
        }
    }

    const handleSubReportSearch = async () => {
        try {
            const res = await axiosInstance.post("CombineReportMaster/GetSubCombineReportMaster", {
                id: 0,
                isActive: 2
            });
            const data = res.data?.message;
            if (res.data?.success && Array.isArray(res.data?.message)) {
                setTableData(data);
            } else {
                setTableData([]);
            }
        } catch (error) {
            console.log("Something went wrong", error);
        }
    }

    useEffect(() => {
        handleSearch();
        handleReportTypeSearch();
        handleSubReportSearch();
    }, [])

    const filteredData = tableData.filter(row => {
        return (
            row.SubReportName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            row.Disclaimer.toLowerCase().includes(searchTerm.toLowerCase()) ||
            row.CreatedByName.toLowerCase().includes(searchTerm.toLowerCase())
        )
    });

    const handleReactSelect = (name, value) => {
        setFormData({
            ...formData,
            [name]: value?.value
        })
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        })
    }

    const handleToggle = (field) => {
        setFormData((prev) => ({
            ...prev,
            [field]: prev[field] == 1 ? 0 : 1,
        }));
    };

    const handleReportTypeChange = (e) => {
        const { name, value } = e.target;
        setReportTypePayload({
            ...reportTypePayload,
            [name]: value
        })
    }

    const handleReportTypeToggle = (field) => {
        setReportTypePayload((prev) => ({
            ...prev,
            [field]: prev[field] == 1 ? 0 : 1,
        }));
    };

    const validate = () => {
        let err = {};
        if (!formData.combineReportId) err.combineReportId = "Combine Report is required";
        if (!formData.subReportName.trim()) err.subReportName = "Sub Report Name is required";
        if (!formData.disclaimer.trim()) err.disclaimer = "Disclaimer is required";
        if (!formData.reportType) err.reportType = "Report Type is required";
        setErrors(err);
        return Object.keys(err).length === 0;
    }

    const handleSave = async () => {
        if (!validate()) {
            return;
        }
        const finalPayload = {
            ...formData,
            reportType: formData.reportType.toString()
        }
        try {
            const res = await axiosInstance.post("CombineReportMaster/SaveSubCombineReportMaster", finalPayload);
            if (res.data.success) {
                toast.success(res.data.message);
                setFormData({
                    Id: 0,
                    combineReportId: 0,
                    subReportName: "",
                    disclaimer: "",
                    reportType: "",
                    isActive: 1,
                })
                setIsEdit(false)
                handleSubReportSearch();
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
            Id: row.ID,
            combineReportId: row.CombineReportId,
            subReportName: row.SubReportName,
            disclaimer: row.Disclaimer,
            reportType: row.ReportType,
            isActive: row.IsActive,
        })
    }

    const handleReportTypeSave = async () => {
        try {
            const res = await axiosInstance.post("CombineReportMaster/SaveCombineReportType", reportTypePayload);
            if (res.data.success) {
                toast.success(res.data.message);
                setReportTypePayload({
                    Id: 0,
                    reportType: "",
                    isPDF: 0,
                    isExcel: 0,
                    isOnScreen: 0,
                    isActive: 1,
                })
                setReportTypeModal(false);
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            toast.error("Something went wrong");
        }
    }

    return (
        <>
            <Accordion
                name={t("Sub Report Master")}
                defaultValue={true}
                isBreadcrumb={true}
            >
                <div className="row col-12 pt-2 pl-2 pr-2">
                    <div className='col-sm-2'>
                        <ReactSelect
                            name="combineReportId"
                            id="combineReportId"
                            label={t("Combine Report")}
                            placeholderName="Select Combine Report"
                            dynamicOptions={combinedReportOptions}
                            removeIsClearable={true}
                            value={formData.combineReportId}
                            onChange={handleReactSelect}
                        />
                        <span className="error-message">{errors?.combineReportId}</span>
                    </div>
                    <div className='col-sm-2'>
                        <Input
                            type="text"
                            name="subReportName"
                            id="subReportName"
                            lable={t("Sub Report Name")}
                            value={formData.subReportName}
                            onChange={handleChange}
                        />
                        <span className="error-message">{errors?.subReportName}</span>
                    </div>
                    <div className='col-sm-2'>
                        <ReactSelect
                            name="reportType"
                            id="reportType"
                            label={t("Report Type")}
                            placeholderName="Select Report Type"
                            dynamicOptions={reportTypeOptions}
                            removeIsClearable={true}
                            value={formData.reportType}
                            onChange={handleReactSelect}
                        />
                        <span className="error-message">{errors?.reportType}</span>
                    </div>
                    <div className='col-sm-auto'>
                        <CustomButton
                            text={t("Add")}
                            icon={t("add")}
                            onClick={() => setReportTypeModal(true)}
                        />
                    </div>
                    <div className="col-auto d-flex align-items-start justify-content-center p-2" style={{
                        gap: "5px"
                    }}>
                        <label class="switch mb-0">
                            <input
                                type="checkbox"
                                checked={formData.isActive == 1}
                                onChange={() => handleToggle("isActive")}
                            />
                            <span class="slider"></span>
                        </label>
                        <strong>
                            <span>{t("IsActive")}</span>
                        </strong>
                    </div>
                    <div className="col-sm-auto">
                        <CustomButton
                            text={t(isEdit ? "Update" : "Save")}
                            icon={t(isEdit ? "edit" : "save")}
                            onClick={handleSave} />
                    </div>
                    <div className="col-sm-4">
                        <TextAreaInput
                            id="disclaimer"
                            lable="Disclaimer"
                            onChange={handleChange}
                            value={formData?.disclaimer}
                            name="disclaimer"
                        />
                        <span className="error-message">{errors?.disclaimer}</span>
                    </div>
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
                                        <th>{t("Sub Report Name")}</th>
                                        <th>{t("Disclaimer")}</th>
                                        <th>{t("CreatedAt")}</th>
                                        <th>{t("CreatedByName")}</th>
                                        <th>{t("UpdateAt")}</th>
                                        <th>{t("UpdateByName")}</th>
                                        <th>{t("Action")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData.map((row, index) => {
                                       const rowColor = row.IsActive == 1 ? "#FFFFFF" : "#f5c6cb";
                                        return (
                                            <tr key={row.ID} style={{ backgroundColor: rowColor }}>
                                            <td>{index + 1}</td>
                                            <td>{row.SubReportName}</td>
                                            <td
                                                style={{
                                                    width: "400px",
                                                    textOverflow: "ellipsis",
                                                    whiteSpace: "wrap"
                                                }}
                                            >{row.Disclaimer}</td>
                                            <td>{row.dtEntry}</td>
                                            <td>{row.CreatedByName}</td>
                                            <td>{row.dtUpdate}</td>
                                            <td>{row.UpdatedByName}</td>
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
                                        )
                                    })}
                                </tbody>
                            </Tables>
                        </>
                    )}
                </div>
            </Accordion>

            <Dialog
                visible={reportTypeModal}
                onHide={() => {
                    setReportTypeModal(false);
                    setReportTypePayload({
                        Id: 0,
                        reportType: "",
                        isPDF: 0,
                        isExcel: 0,
                        isOnScreen: 0,
                        isActive: 1,
                    })
                }}
                header={t("Report Type")}
                className={theme}
                style={{
                    width: isMobile ? "90vw" : "50vw",
                }}
            >
                <div className='pt-2 pl-2 pr-2'>
                    <div className="row pt-2 pl-2 pr-2">
                        <div className='col-sm-4'>
                            <Input
                                type="text"
                                name="reportType"
                                id="reportType"
                                lable={t("Report Type")}
                                value={reportTypePayload.reportType}
                                onChange={handleReportTypeChange}
                            />
                        </div>
                        <div className="col-auto d-flex align-items-center justify-content-center p-2" style={{
                            gap: "5px"
                        }}>
                            <label class="switch mb-0">
                                <input
                                    type="checkbox"
                                    checked={reportTypePayload.isPDF == "1"}
                                    onChange={() => handleReportTypeToggle("isPDF")}
                                />
                                <span class="slider"></span>
                            </label>
                            <strong>
                                <span>{t("IsPDF")}</span>
                            </strong>
                        </div>
                        <div className="col-auto d-flex align-items-center justify-content-center p-2" style={{
                            gap: "5px"
                        }}>
                            <label class="switch mb-0">
                                <input
                                    type="checkbox"
                                    checked={reportTypePayload.isExcel == "1"}
                                    onChange={() => handleReportTypeToggle("isExcel")}
                                />
                                <span class="slider"></span>
                            </label>
                            <strong>
                                <span>{t("IsExcel")}</span>
                            </strong>
                        </div>
                        <div className="col-auto d-flex align-items-center justify-content-center p-2" style={{
                            gap: "5px"
                        }}>
                            <label class="switch mb-0">
                                <input
                                    type="checkbox"
                                    checked={reportTypePayload.isOnScreen == "1"}
                                    onChange={() => handleReportTypeToggle("isOnScreen")}
                                />
                                <span class="slider"></span>
                            </label>
                            <strong>
                                <span>{t("IsOnScreen")}</span>
                            </strong>
                        </div>
                        <div className="col-auto d-flex align-items-center justify-content-center p-2" style={{
                            gap: "5px"
                        }}>
                            <label class="switch mb-0">
                                <input
                                    type="checkbox"
                                    checked={reportTypePayload.isActive == "1"}
                                    onChange={() => handleReportTypeToggle("isActive")}
                                />
                                <span class="slider"></span>
                            </label>
                            <strong>
                                <span>{t("IsActive")}</span>
                            </strong>
                        </div>
                        <div className='col-sm-auto'>
                            <SaveButton
                                text={t("Save")}
                                onClick={handleReportTypeSave}
                            />
                        </div>
                    </div>
                </div>
            </Dialog>
        </>
    )
}

export default SubReportMaster