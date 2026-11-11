import React, { useEffect, useState } from 'react'
import Accordion from '../../../components/UI/Accordion'
import { useTranslation } from 'react-i18next'
import Input from '../../../components/formComponent/Input';
import { CustomButton, SaveButton, SearchButton } from '../../../components/UI/CustomButton';
import { axiosInstance } from '../../../utils/axiosInstance';
import { toast } from 'react-toastify';
import ColorCodingSearch from '../../../components/ModalComponent/ColorCodingSearch';
import Tables from '../../../components/UI/customTable';
import NoRecordFound from "../../../components/formComponent/NoRecordFound";
import ReactSelect from '../../../components/formComponent/ReactSelect';
import { number } from "../../../utils/helpers";
import FamilyDiscountImportExportModal from '../../utils/FamilyDiscountImportExportModal';
import FamilyDiscountTransferModal from '../../utils/FamilyDiscountTransferModal';
import { Dialog } from 'primereact/dialog';
import { useLocalStorage } from '../../../utils/hooks/useLocalStorage';
import Loading from '../../../components/loader/Loading';
import DateTimeCell from '../../../utils/DateTimeCell';

const FamilyDiscountMaster = () => {
    const { t } = useTranslation();
    const [policyOptions, setPolicyOptions] = useState([]);
    const [departmentOptions, setDepartmentOptions] = useState([]);
    const [formData, setFormData] = useState({
        policyId: "",
        departmentId: "",
    })
    const [tableData, setTableData] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);
    const [headerSelect, setHeaderSelect] = useState({
        selfPer: "",
        selfPer2: "",
        memberPer: "",
        relativePer: ""
    });
    const [openImportExport, setOpenImportExport] = useState(false);
    const [openTransfer, setOpenTransfer] = useState(false);
    const [logModal, setLogModal] = useState({ open: false, data: [], loading: false });
    const theme = useLocalStorage("theme", "get");
    const isMobile = window.innerWidth <= 768;


    const getPolicyOptions = async () => {
        try {
            const res = await axiosInstance.post("Employee/GetFamilyPolicies", {
                policyId: 0,
                isActive: 1,
            });
            if (res.data?.success && Array.isArray(res.data?.message)) {
                setPolicyOptions(res.data?.message?.map((item) => ({
                    value: item?.PolicyID,
                    label: item?.PolicyName
                })));
            } else {
                toast.error(res?.data?.message);
            }
        } catch (error) {
            console.log("Error while saving policy", error)
        }
    }


    const getDepartment = () => {
        axiosInstance
            .get("Department/getDepartment")
            .then((res) => {
                let data = res.data.message;
                let Department = data.map((ele) => {
                    return {
                        value: ele.DepartmentID,
                        label: ele.Department,
                    };
                });
                setDepartmentOptions(Department);
            })
            .catch((err) => console.log(err));
    };


    useEffect(() => {
        getPolicyOptions();
        getDepartment()
    }, [])

    const handleReactSelectChange = (name, value) => {
        setFormData((prev) => ({
            ...prev,
            [name]: value?.value
        }))
    }

    const handleSearch = async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.post("Employee/GetInvestigationWithPolicy", {
                policyID: Number(formData.policyId) || 0,
                departmentID: Number(formData.departmentId) || 0,
            });
            if (res.data?.success && Array.isArray(res.data?.message)) {
                setTableData(res.data?.message.map((item) => ({ ...item, isSelected: false })));
                setHeaderSelect({
                    selfPer: "",
                    selfPer2: "",
                    memberPer: "",
                    relativePer: ""
                })
            } else {
                toast.error(res?.data?.message);
                setTableData([]);
            }
        } catch (error) {
            console.log("Error while saving policy", error)
        } finally {
            setLoading(false);
        }
    }

    const filteredTableData = tableData
        .map((item, index) => ({ ...item, originalIndex: index }))
        .filter((item) =>
            (item.PolicyName?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
            item.TestName?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
            item.TestCode?.toLowerCase()?.includes(searchTerm.toLowerCase()))
        );

    const selectAll =
        filteredTableData.length > 0 && filteredTableData.every((item) => item.isSelected);

    const handleSelectAll = (e) => {
        const checked = e.target.checked;
        const updated = [...tableData];
        filteredTableData.forEach((item) => {
            updated[item.originalIndex] = { ...updated[item.originalIndex], isSelected: checked };
        });
        setTableData(updated);
    };

    const handleRowSelect = (originalIndex) => {
        const updated = [...tableData];
        updated[originalIndex] = {
            ...updated[originalIndex],
            isSelected: !updated[originalIndex].isSelected,
        };
        setTableData(updated);
    };

    const handleHeaderChange = (e) => {
        const { name, value } = e.target;
        if (value !== "" && parseFloat(value) > 100) {
            return;
        }
        setHeaderSelect(prev => ({ ...prev, [name]: value }));

        const key = name === "selfPer" ? "Self_Per" : name === "selfPer2" ? "Self_Per2" : name === "memberPer" ? "Member_Per" : "Relative_Per";
        setTableData(prev => prev.map(item => ({
            ...item,
            [key]: value === "" ? "" : parseFloat(value)
        })));
    };

    const handleRowChange = (investigationID, e) => {
        const { name, value } = e.target;
        if (value !== "" && parseFloat(value) > 100) {
            return;
        }
        const val = value === "" ? "" : parseFloat(value);
        setTableData(prev => prev.map(item =>
            item.InvestigationID === investigationID ? { ...item, [name]: val } : item
        ));
    };

    const handleOpenLog = (row) => {
        setLogModal({ open: true, data: [], loading: true });
        axiosInstance
            .post("Employee/GetFamilyDiscountPolicyItemLog", {
                policyID: row.PolicyID,
                investigationID: row.InvestigationID,
            })
            .then((res) => {
                if (res.data?.success && Array.isArray(res.data?.message)) {
                    setLogModal(prev => ({ ...prev, data: res.data.message, loading: false }));
                } else {
                    toast.error(res.data?.message || t("No log found"));
                    setLogModal(prev => ({ ...prev, data: [], loading: false }));
                }
            })
            .catch(() => {
                toast.error(t("Error loading log"));
                setLogModal(prev => ({ ...prev, loading: false }));
            });
    };

    const handleSave = async () => {
        const selectedData = tableData.filter(item => item.isSelected);
        if (selectedData.length === 0) {
            toast.error(t("Please select at least one record to save"));
            return;
        }

        const payload = selectedData.map(item => ({
            policyID: item.PolicyID,
            policyName: item.PolicyName,
            investigationID: item.InvestigationID,
            self_Per: item.Self_Per || 0,
            self_Per2: item.Self_Per2 || 0,
            member_Per: item.Member_Per || 0,
            relative_Per: item.Relative_Per || 0
        }));

        try {
            setLoading(true);
            const res = await axiosInstance.post("Employee/InsertFamilyDiscountPolicyItems", payload);
            if (res.data?.success) {
                toast.success(res.data.message);
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            console.error("Save Error:", error);
            toast.error(t("Error while saving data"));
        } finally {
            setLoading(false);
        }
    };
    return (
        <>
            <Accordion
                name={t("Family Discount Master")}
                defaultValue={true}
                isBreadcrumb={true}
            >
                <div className="row p-2 align-items-center">
                    <div className="col-12 col-sm-6 col-md-2 my-1">
                        <ReactSelect
                            dynamicOptions={policyOptions}
                            name="policyId"
                            lable={t("Policy")}
                            id="policyId"
                            removeIsClearable={true}
                            placeholderName={t("Policy")}
                            value={formData.policyId}
                            onChange={handleReactSelectChange}
                        />
                    </div>
                    <div className="col-12 col-sm-6 col-md-2 my-1">
                        <ReactSelect
                            dynamicOptions={departmentOptions}
                            name="departmentId"
                            lable={t("Department")}
                            id="departmentId"
                            removeIsClearable={true}
                            placeholderName={t("Department")}
                            value={formData.departmentId}
                            onChange={handleReactSelectChange}
                        />
                    </div>
                    <div className="col-md-6 col-sm-12 col-12 d-flex flex-wrap align-items-center mb-2" style={{ gap: "8px" }}>
                        <SearchButton
                            onClick={handleSearch}
                            text={t("Search")}
                            loading={loading}
                        />
                        <CustomButton
                            onClick={() => setOpenImportExport(true)}
                            text={t("Export / Import")}
                            icon={'excel'}
                        />
                        <CustomButton
                            onClick={() => setOpenTransfer(true)}
                            text={t("Transfer Policy")}
                            icon={'send'}
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
                        className="d-flex align-items-center justify-content-between"
                        id="pr_id_11"
                        style={{
                            gap: "5px"
                        }}
                    >
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
                <div className="row px-2 mt-2 mb-2">
                    <div className="col-12">
                        {tableData.length > 0 && (
                            <div className="row p-2 mb-2 border rounded bg-light mx-0 d-md-none" style={{ gap: "10px 0" }}>
                                <div className="col-12 font-weight-bold p-0 mb-1">{t("Set All Percentages")}</div>
                                <div className="col-6 pl-0 pr-1">
                                    <Input
                                        type="number"
                                        name="selfPer"
                                        value={headerSelect.selfPer}
                                        onChange={handleHeaderChange}
                                        placeholder="Self Level 1 %"
                                        lable={t("Self Level 1 %")}
                                        onInput={(e) => number(e, 3)}
                                    />
                                </div>
                                <div className="col-6 pl-1 pr-0">
                                    <Input
                                        type="number"
                                        name="selfPer2"
                                        value={headerSelect.selfPer2}
                                        onChange={handleHeaderChange}
                                        placeholder="Self Level 2 %"
                                        lable={t("Self Level 2 %")}
                                        onInput={(e) => number(e, 3)}
                                    />
                                </div>
                                <div className="col-6 pl-0 pr-1">
                                    <Input
                                        type="number"
                                        name="memberPer"
                                        value={headerSelect.memberPer}
                                        onChange={handleHeaderChange}
                                        placeholder="Dependent Disc %"
                                        lable={t("Dependent Disc %")}
                                        onInput={(e) => number(e, 3)}
                                    />
                                </div>
                                <div className="col-6 pl-1 pr-0">
                                    <Input
                                        type="number"
                                        name="relativePer"
                                        value={headerSelect.relativePer}
                                        onChange={handleHeaderChange}
                                        placeholder="Relative Disc %"
                                        lable={t("Relative Disc %")}
                                        onInput={(e) => number(e, 3)}
                                    />
                                </div>
                            </div>
                        )}
                        {tableData.length > 0 ? (
                            <Tables
                                style={{
                                    maxHeight: "370px",
                                    height: "370px",
                                    overflowY: "auto",
                                }}
                            >
                                <thead className="cf">
                                    <tr>
                                        <th rowSpan={2}>{t("S.No")}</th>
                                        <th rowSpan={2}>{t("Policy Name")}</th>
                                        <th rowSpan={2}>{t("TestCode")}</th>
                                        <th rowSpan={2}>{t("TestName")}</th>
                                        <th colSpan={2} className="text-center">{t("Self Discount %")}</th>
                                        <th rowSpan={2} style={{ minWidth: '120px' }}>
                                            <div style={{display: "flex", justifyContent: "center"}}>{t("Dependent Disc %")}</div>

                                            <Input
                                                type="number"
                                                name="memberPer"
                                                value={headerSelect.memberPer}
                                                onChange={handleHeaderChange}
                                                placeholder="All % (Dependent)"
                                                onInput={(e) => number(e, 3)}
                                            />
                                        </th>
                                        <th rowSpan={2} style={{ minWidth: '120px' }}>
                                            <div style={{display: "flex", justifyContent: "center"}}>{t("Relative Disc %")}</div>
                                            <Input
                                                type="number"
                                                name="relativePer"
                                                value={headerSelect.relativePer}
                                                onChange={handleHeaderChange}
                                                placeholder="All % (Relative)"
                                                onInput={(e) => number(e, 3)}
                                            />
                                        </th>
                                        <th rowSpan={2}>
                                            <input
                                                type="checkbox"
                                                checked={selectAll}
                                                onChange={handleSelectAll}
                                            />
                                        </th>
                                        <th rowSpan={2}>{t("Log")}</th>
                                    </tr>
                                    <tr>
                                        <th style={{ minWidth: '120px' }}>
                                            <Input
                                                type="number"
                                                name="selfPer"
                                                value={headerSelect.selfPer}
                                                onChange={handleHeaderChange}
                                                placeholder="Self Level 1 %"
                                                onInput={(e) => number(e, 3)}
                                            />
                                        </th>
                                        <th style={{ minWidth: '120px' }}>
                                            <Input
                                                type="number"
                                                name="selfPer2"
                                                value={headerSelect.selfPer2}
                                                onChange={handleHeaderChange}
                                                placeholder="Self Level 2 %"
                                                onInput={(e) => number(e, 3)}
                                            />
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTableData.map((ele, index) => (
                                        <tr key={index}>
                                           
                                            <td data-title="Sr.No">{index + 1}</td>
                                            <td data-title="Policy Name">{ele?.PolicyName}</td>
                                            <td data-title="Test Code">{ele?.TestCode}</td>
                                            <td data-title="Test Name">{ele?.TestName}</td>
                                            <td data-title="Self Per">
                                                <Input
                                                    type="number"
                                                    name="Self_Per"
                                                    value={ele?.Self_Per}
                                                    onChange={(e) => handleRowChange(ele.InvestigationID, e)}
                                                    onInput={(e) => number(e, 3)}
                                                />
                                            </td>
                                            <td data-title="Self Per 2">
                                                <Input
                                                    type="number"
                                                    name="Self_Per2"
                                                    value={ele?.Self_Per2}
                                                    onChange={(e) => handleRowChange(ele.InvestigationID, e)}
                                                    onInput={(e) => number(e, 3)}
                                                />
                                            </td>
                                            <td data-title="Member Per">
                                                <Input
                                                    type="number"
                                                    name="Member_Per"
                                                    value={ele?.Member_Per}
                                                    onChange={(e) => handleRowChange(ele.InvestigationID, e)}
                                                    onInput={(e) => number(e, 3)}
                                                />
                                            </td>
                                            <td data-title="Relative Per">
                                                <Input
                                                    type="number"
                                                    name="Relative_Per"
                                                    value={ele?.Relative_Per}
                                                    onChange={(e) => handleRowChange(ele.InvestigationID, e)}
                                                    onInput={(e) => number(e, 3)}
                                                />
                                            </td>
                                             <td data-title="Select">
                                                <input
                                                    type="checkbox"
                                                    checked={ele.isSelected ?? false}
                                                    onChange={() => handleRowSelect(ele.originalIndex)}
                                                />
                                            </td>
                                            <td data-title="Log">
                                                <i
                                                    className="fa fa-search coloricon"
                                                    style={{ cursor: "pointer" }}
                                                    onClick={() => handleOpenLog(ele)}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Tables>
                        ) : (
                            <NoRecordFound />
                        )}
                    </div>
                    {tableData.length > 0 && (
                        <div className="mt-2 ml-2">
                            <SaveButton
                                onClick={handleSave}
                                text={t("Save")}
                                loading={loading}
                                disabled={!tableData.some(item => item.isSelected) || loading}
                            />
                        </div>
                    )}
                </div>
            </Accordion>
        <FamilyDiscountImportExportModal
            open={openImportExport}
            onClose={() => setOpenImportExport(false)}
            policyOptions={policyOptions}
            policyId={formData.policyId}
        />
        <Dialog
            header={t("Policy Item Log")}
            visible={logModal.open}
            onHide={() => setLogModal({ open: false, data: [], loading: false })}
            className={theme}
            style={{ width: isMobile ? "95vw" : "90vw" }}
            maximizable
        >
            {logModal.loading ? (
                <Loading />
            ) : logModal.data.length > 0 ? (
                <Tables style={{ maxHeight: "400px", overflowY: "auto" }}>
                    <thead>
                        <tr>
                            <th>{t("S.No")}</th>
                            <th>{t("Test Code")}</th>
                            <th>{t("Test Name")}</th>
                            <th>{t("Old Self %")}</th>
                            <th>{t("New Self %")}</th>
                            <th>{t("Old Self 2 %")}</th>
                            <th>{t("New Self 2 %")}</th>
                            <th>{t("Old Member %")}</th>
                            <th>{t("New Member %")}</th>
                            <th>{t("Old Relative %")}</th>
                            <th>{t("New Relative %")}</th>
                            <th>{t("Old Entry Date")}</th>
                            <th>{t("New Entry Date")}</th>
                            <th>{t("Old Created By")}</th>
                            <th>{t("New Created By")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logModal.data.map((row, i) => (
                            <tr key={i}>
                                <td data-title={t("S.No")}>{i + 1}</td>
                                <td data-title={t("Test Code")}>{row.TestCode || "-"}</td>
                                <td data-title={t("Test Name")} style={{ minWidth: "200px", whiteSpace: "normal", wordBreak: "break-word" }}>{row.TestName || "-"}</td>
                                <td data-title={t("Old Self %")}>{row.OldSelf_Per ?? "-"}</td>
                                <td data-title={t("New Self %")}>{row.NewSelf_Per ?? "-"}</td>
                                <td data-title={t("Old Self 2 %")}>{row.OldSelf_Per2 ?? "-"}</td>
                                <td data-title={t("New Self 2 %")}>{row.NewSelf_Per2 ?? "-"}</td>
                                <td data-title={t("Old Member %")}>{row.OldMember_Per ?? "-"}</td>
                                <td data-title={t("New Member %")}>{row.NewMember_Per ?? "-"}</td>
                                <td data-title={t("Old Relative %")}>{row.OldRelative_Per ?? "-"}</td>
                                <td data-title={t("New Relative %")}>{row.NewRelative_Per ?? "-"}</td>
                                <td data-title={t("Old Entry Date")} style={{ whiteSpace: "nowrap" }}>
                                    <DateTimeCell dateString={row?.OlddtEntry} />
                                </td>
                                <td data-title={t("New Entry Date")} style={{ whiteSpace: "nowrap" }}>
                                    <DateTimeCell dateString={row?.dtEntry} />
                                </td>
                                <td data-title={t("Old Created By")}>{row.OldCreatedByName || "-"}</td>
                                <td data-title={t("New Created By")}>{row.CreatedByName || "-"}</td>
                            </tr>
                        ))}
                    </tbody>
                </Tables>
            ) : (
                <NoRecordFound />
            )}
        </Dialog>
        <FamilyDiscountTransferModal
            show={openTransfer}
            handleClose={() => setOpenTransfer(false)}
            policyOptions={policyOptions}
            departmentOptions={departmentOptions}
            fromPolicyId={formData.policyId}
        />
        </>
    )
}

export default FamilyDiscountMaster