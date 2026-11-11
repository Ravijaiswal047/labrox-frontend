import React, { useEffect, useState } from 'react'
import Accordion from '../../../components/UI/Accordion'
import { useTranslation } from 'react-i18next'
import Input from '../../../components/formComponent/Input';
import { CustomButton, EditButton, SaveButton } from '../../../components/UI/CustomButton';
import { axiosInstance } from '../../../utils/axiosInstance';
import { toast } from 'react-toastify';
import ColorCodingSearch from '../../../components/ModalComponent/ColorCodingSearch';
import Tables from '../../../components/UI/customTable';
import NoRecordFound from "../../../components/formComponent/NoRecordFound";

const PolicyMaster = () => {
    const { t } = useTranslation();
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        policyID: 0,
        policyName: "",
        monthlyCappingSelf: 0,
        annualPrescriptionDiscount: 0,
        annualWithoutPrescriptionDiscount: 0,
        isActive: 1,
    })
    const [tableData, setTableData] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isEdit, setIsEdit] = useState(false);
    const [activeFilter, setActiveFilter] = useState(null);

    const activeCount = tableData.filter((item) => item?.IsActive == 1).length;
    const inactiveCount = tableData.filter((item) => item?.IsActive == 0).length;

    const colorCodingData = [
        { color: "#FFFFFF", id: "1", labelKey: "Active", count: activeCount },
        { color: "#f5c6cb", id: "0", labelKey: "In Active", count: inactiveCount },
    ];

    const handleFilterClick = (id) => {
        setActiveFilter((prev) => (prev === id ? null : id));
    };

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

    const validateForm = () => {
        const newErrors = {};
        if (!formData?.policyName?.trim()) {
            newErrors.policyName = t("Policy Name is required");
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }
        try {
            const res = await axiosInstance.post("Employee/AddOrUpdateFamilyDiscountPolicy", formData);
            if (res.data?.success) {
                toast.success(res?.data?.message);
                setFormData({
                    policyID: 0,
                    policyName: "",
                    monthlyCappingSelf: 0,
                    annualPrescriptionDiscount: 0,
                    annualWithoutPrescriptionDiscount: 0,
                    isActive: 1,
                })
                setIsEdit(false);
                HandleSearch();
            } else {
                toast.error(res?.data?.message);
            }
        } catch (error) {
            console.log("Error while saving policy", error)
        }
    }
    const HandleSearch = async () => {
        try {
            const res = await axiosInstance.post("Employee/GetFamilyPolicies", {
                policyId: 0,
                isActive: 2,
            });
            if (res.data?.success && Array.isArray(res.data?.message)) {
                setTableData(res.data?.message);
            } else {
                toast.error(res?.data?.message);
            }
        } catch (error) {
            console.log("Error while saving policy", error)
        }
    }

    useEffect(() => {
        HandleSearch()
    }, [])

    const filteredData = tableData.filter((item) => {
        const matchesSearch = item?.PolicyName?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = activeFilter === null || String(item?.IsActive) === activeFilter;
        return matchesSearch && matchesFilter;
    });

    const handleEdit = (item) => {
        setFormData({
            policyID: item?.PolicyID,
            policyName: item?.PolicyName,
            monthlyCappingSelf: Number(item?.MonthlyCappingSelf) ?? 0,
            annualPrescriptionDiscount: Number(item?.AnnualPrescriptionDiscount) ?? 0,
            annualWithoutPrescriptionDiscount: Number(item?.AnnualWithoutPrescriptionDiscount) ?? 0,
            isActive: item?.IsActive,
        })
        setIsEdit(true);
    }

    return (
        <>
            <Accordion
                name={t("Policy Master")}
                defaultValue={true}
                isBreadcrumb={true}
            >
                <div className="row col-10 pt-2 pl-2 pr-2">
                    <div className="col-sm-2">
                        <Input
                            type="text"
                            name="policyName"
                            lable={t("Policy Name")}
                            className="required-fields"
                            placeholder=" "
                            onChange={handleChange}
                            value={formData?.policyName}
                        />
                        <span className="error-message">{errors?.policyName}</span>
                    </div>
                    <div className="col-sm-2">
                        <Input
                            type="text"
                            name="monthlyCappingSelf"
                            lable={t("Monthly Capping Self (Amount)")}
                            placeholder=" "
                            onChange={handleChange}
                            value={formData?.monthlyCappingSelf}
                            maxLength={8}
                            onInput={(e) => {
                                e.target.value = e.target.value.replace(/[^0-9.]/g, "");
                            }}
                            onFocus={(e) => e.target.select()}
                        />
                    </div>
                    <div className="col-sm-2">
                        <Input
                            type="text"
                            name="annualPrescriptionDiscount"
                            lable={t("Self With Prescription FOC")}
                            placeholder=" "
                            onChange={handleChange}
                            value={formData?.annualPrescriptionDiscount}
                            maxLength={8}
                            onInput={(e) => {
                                e.target.value = e.target.value.replace(/[^0-9.]/g, "");
                            }}
                            onFocus={(e) => e.target.select()}
                        />
                    </div>
                    <div className="col-sm-2">
                        <Input
                            type="text"
                            name="annualWithoutPrescriptionDiscount"
                            lable={t("Self Without Prescription FOC")}
                            placeholder=" "
                            onChange={handleChange}
                            value={formData?.annualWithoutPrescriptionDiscount}
                            maxLength={8}
                            onInput={(e) => {
                                e.target.value = e.target.value.replace(/[^0-9.]/g, "");
                            }}
                            onFocus={(e) => e.target.select()}
                        />
                    </div>
                    <div className="col-auto d-flex align-items-center justify-content-start" style={{
                        gap: "5px"
                    }}>
                        <label class="switch mb-0">
                            <input
                                type="checkbox"
                                checked={formData.isActive == "1"}
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
                            icon={isEdit ? "edit" : "save"}
                            onClick={handleSubmit}
                            text={isEdit ? t("Update") : t("Save")}
                        />
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
                        {colorCodingData.map(({ color, labelKey, id, count }) => (
                            <div
                                key={id}
                                onClick={() => handleFilterClick(id)}
                                style={{
                                    cursor: "pointer",
                                }}
                            >
                                <ColorCodingSearch
                                    color={color}
                                    label={t(labelKey) + " (" + count + ")"}
                                />
                            </div>
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
                                onFocus={(e) => e.target.select()}
                            />
                        </div>
                    </div>
                }
            >
                <div className="row px-2 mt-2 mb-2">
                    <div className="col-12">
                        {filteredData.length > 0 ? (
                            <Tables>
                                <thead className="cf">
                                    <tr>
                                        <th>{t("S.No")}</th>
                                        <th>{t("Policy Name")}</th>
                                        <th>{t("Monthly Capping Self")}</th>
                                        <th>{t("Self With Prescription FOC")}</th>
                                        <th>{t("Self Without Prescription FOC")}</th>
                                        <th>{t("Created By")}</th>
                                        <th>{t("Created Date")}</th>
                                        <th>{t("Updated By")}</th>
                                        <th>{t("Updated Date")}</th>
                                        <th>{t("Action")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData?.map((ele, index) => {
                                        const rowColor = ele?.IsActive == 1 ? "" : "#f5c6cb";
                                        return (
                                            <tr key={index} style={{ backgroundColor: rowColor }}>
                                                <td data-title={t("S.No")}>{index + 1}</td>
                                                <td data-title={t("Policy Name")}>{ele?.PolicyName || "-"}</td>
                                                <td data-title={t("Monthly Capping Self")}>{ele?.MonthlyCappingSelf || "-"}</td>
                                                <td data-title={t("Self With Prescription FOC")}>{ele?.AnnualPrescriptionDiscount || "-"}</td>
                                                <td data-title={t("Self Without Prescription FOC")}>{ele?.AnnualWithoutPrescriptionDiscount || "-"}</td>
                                                <td data-title={t("Created By")}>{ele?.CreatedByName || "-"}</td>
                                                <td data-title={t("Created Date")}>{ele?.dtEntry || "-"}</td>
                                                <td data-title={t("Updated By")}>{ele?.UpdatedByName || "-"}</td>
                                                <td data-title={t("Updated Date")}>{ele?.dtUpdate || "-"}</td>
                                                <td data-title={t("Action")}>
                                                    <CustomButton
                                                        icon={"edit"}
                                                        onClick={() => handleEdit(ele)}
                                                    />
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </Tables>
                        ) : (
                            <NoRecordFound />
                        )}
                    </div>
                </div>
            </Accordion>
        </>
    )
}

export default PolicyMaster