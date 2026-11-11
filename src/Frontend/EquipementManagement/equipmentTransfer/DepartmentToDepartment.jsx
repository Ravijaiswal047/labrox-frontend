import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react'
import ReactSelect from '../../../components/formComponent/ReactSelect'
import Accordion from '../../../components/UI/Accordion'
import { useTranslation } from 'react-i18next';
import DatePicker from '../../../components/formComponent/DatePicker';
import { axiosInstance } from '../../../utils/axiosInstance';
import moment from 'moment';
import { notify } from '../../../utils/utils';
import { apiUrls } from '../../../utils/apiUrls';
import { setRefreshLoad } from '../../../store/reducers/loadingSlice/loadingSlice';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import Input from '../../../components/formComponent/Input';
import { CustomButton } from '../../../components/UI/CustomButton';
import { ExportToExcel } from '../../../utils/helpers';


const DepartmentToDepartment = forwardRef(({ setExcelFunction, settransferdata }, ref) => {
    const { refreshLoad } = useSelector((state) => state.loadingSlice);
    const dispatch = useDispatch()
    const { t } = useTranslation();
    const [departmentdata, setdepartmentdata] = useState([]);
    const [equipmentdata, setequipmentdata] = useState([]);
    const [equipmentTypeList, setEquipmentTypeList] = useState([]);
    const [FetchDepartment, setFetchDepartment] = useState([]);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editTransferID, setEditTransferID] = useState(null);
      const [errors, setErrors] = useState({});

    const [payload, setPayload] = useState({
        equipmentId: "",
        equipmentName: "",
        fromDepartmentId: "",
        toDepartmentId: "",
        transferDate: new Date(),
        description: "",
        isActive: true,
        FromDate: new Date(),
        ToDate: new Date()
    });

    // Expose handleEditClick to parent (EquipmentTransfer)
    useImperativeHandle(ref, () => ({
        handleEditClick(item) {
            // Match fromDepartment & toDepartment by label or value from FetchDepartment list
            const fromDept = FetchDepartment?.find(d => String(d.value) === String(item?.VirtualDeptID) || String(d.label).trim().toLowerCase() === String(item?.VirtualDeptName || item?.FromDepartment).trim().toLowerCase());
            const toDept = FetchDepartment?.find(d => String(d.value) === String(item?.NewVirtualDeptID) || String(d.label).trim().toLowerCase() === String(item?.NewVirtualDeptName || item?.ToDepartment).trim().toLowerCase());
            const equipmentMatch = equipmentTypeList?.find(e => String(e.label).trim().toLowerCase() === String(item?.MachineID || item?.Equipment).trim().toLowerCase());

            setPayload(prev => ({
                ...prev,
                equipmentId: equipmentMatch?.value || "",
                equipmentName: item?.MachineID || item?.Equipment || "",
                fromDepartmentId: fromDept?.value || "",
                toDepartmentId: toDept?.value || "",
                description: item?.Description || "",
                isActive: (item?.IsActive === "Active" || item?.isActive === true || item?.IsActive === true),
                FromDate: item?.FromDate ? new Date(moment(item.FromDate).toDate()) : new Date(),
                ToDate: item?.ToDate ? new Date(moment(item.ToDate).toDate()) : new Date(),
            }));

            setEditTransferID(item?.VirtualDeptID || null);
            setIsEditMode(true);

            // Scroll to top of accordion
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }));

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPayload((prev) => ({ ...prev, [name]: value }));
    };

    const fetchequipmentdata = () => {
        axiosInstance.get("Equipment/GetAllMaster", {
            params: {
                p_type: "Equipment",
                p_id: 0
            }
        })
            .then((resp) => {
                console.log(resp);
                const rawData = resp?.data?.message || [];
                const options = rawData.map(item => ({
                    ...item,
                    value: item.EquipmentID,
                    label: item.EquipmentName
                }));
                setequipmentdata(options);
            })
            .catch((error) => {
                console.error(error);
            });
    };

    const fetchDepartment = () => {
        axiosInstance
            .get("TestCentreMappingController/BindDepartment")
            .then((res) => {
                const data = res?.data?.message;
                const val = data?.map((ele) => ({
                    label: ele?.department,
                    value: ele?.departmentid,
                }));
                val.unshift({ label: "Department", value: "" });
                setFetchDepartment(val);
            })
            .catch((err) => {
                notify(
                    err?.response?.data?.message
                        ? err.response?.data?.message
                        : "Something Went Wrong",
                    "error"
                );
            });
    };

    const equipmentAPi = () => {
        axiosInstance
            .get("Equipment/get-all-equipment-type")
            .then((res) => {
                const data = res?.data?.message || [];
                const val = data.map((ele) => ({ value: ele.ID, label: ele.NAME }));
                setEquipmentTypeList(val);
            })
            .catch(console.error);
    };

    const fetchdepartmentdata = () => {
        axiosInstance.get("Equipment/GetAllMaster", {
            params: {
                p_type: "VirtualDepartment",
                p_id: 0
            }
        })
            .then((resp) => {
                console.log(resp);
                const rawData = resp?.data?.message || [];
                const options = rawData.map(item => ({
                    value: item.VirtualDeptID,
                    label: item.VirtualDeptName
                }));
                setdepartmentdata(options);
            })
            .catch((error) => {
                console.error(error);
            });
    };

    useEffect(() => {
        fetchDepartment();
        fetchequipmentdata();
        fetchdepartmentdata();
        equipmentAPi();
    }, []);

    useEffect(() => {
        if (setExcelFunction) {
            setExcelFunction(() => departmentExcel);
        }
    }, [payload]);

    const handleReactChange = (name, e) => {
        console.log("selectedOption", e, "name", name);
        setPayload((prev) => ({
            ...prev,
            [name]: e?.value,
            ...(name === "equipmentId" && { equipmentName: e?.label })
        }));
        if (name === 'equipmentId') {
            const selectdepartment = equipmentdata?.find(item => item?.value == e.value);
            console.log('selectdepartment::', selectdepartment);
            setPayload((prev) => ({ ...prev, fromDepartmentId: selectdepartment?.DepartmentID }));
        }
    };

    const dateSelect = (value, name) => {
        setPayload({ ...payload, [name]: value });
    };

    const resetForm = () => {
        setPayload({
            equipmentId: "",
            equipmentName: "",
            fromDepartmentId: "",
            toDepartmentId: "",
            transferDate: new Date(),
            description: "",
            isActive: true,
            FromDate: new Date(),
            ToDate: new Date()
        });
        setIsEditMode(false);
        setEditTransferID(null);
    };

    const handleSave = async () => {
            // Basic validation
        if (!payload?.equipmentId) {
            setErrors((prev) => ({ ...prev, equipmentId: true }));
             notify("Equipment is required", "error");
             return;
         }
            if (!payload?.fromDepartmentId) {
            setErrors((prev) => ({ ...prev, fromDepartmentId: true }));
             notify("Source Department is required", "error");
             return;
         }
            if (!payload?.toDepartmentId) {
            setErrors((prev) => ({ ...prev, toDepartmentId: true }));
             notify("Destination Department is required", "error");
             return;
         }
            if (!payload?.description) {
            setErrors((prev) => ({ ...prev, description: true }));
             notify("Description is required", "error");
             return;
         }
        try {
            const fromDeptName = FetchDepartment?.find(d => d.value === payload?.fromDepartmentId)?.label || "";
            const toDeptName = FetchDepartment?.find(d => d.value === payload?.toDepartmentId)?.label || "";

            const finalPayload = {
                machineID: payload?.equipmentName || "",
                fromCentre: payload?.fromDepartmentId || 0,
                toCentre: payload?.toDepartmentId || 0,
                transferType: "DepartmentTransfer",
                transactionType: "Insert",
                virtualDeptID: 0,
                virtualDeptName: fromDeptName,
                newVirtualDeptID: payload?.toDepartmentId || 0,
                newVirtualDeptName: toDeptName,
                description: payload?.description || "",
                isActive: payload?.isActive ? true : false,
                fromDate: moment(payload.FromDate).format("YYYY-MM-DD"),
                toDate: moment(payload.ToDate).format("YYYY-MM-DD"),
            };

            console.log("finalPayload", finalPayload);

            const res = await axiosInstance.post(
                "Equipment/SaveUpdateVirtualDepartment",
                finalPayload,
            );

            if (res?.data?.success) {
                notify(res?.data?.message || "Saved Successfully", "success");
                resetForm();
                // refresh parent list so color-coding and data update immediately
                dispatch(setRefreshLoad(!refreshLoad));
            } else {
                notify(res?.data?.message || "Save Failed", "error");
            }

        } catch (error) {
            console.log("Save error", error);
            notify(
                error?.response?.data?.message || "Something went wrong",
                "error"
            );
        }
    };

    const handleUpdate = async () => {
        try {
            const fromDeptName = FetchDepartment?.find(d => d.value === payload?.fromDepartmentId)?.label || "";
            const toDeptName = FetchDepartment?.find(d => d.value === payload?.toDepartmentId)?.label || "";

            const finalPayload = {
                machineID: payload?.equipmentName || "",
                fromCentre: payload?.fromDepartmentId || 0,
                toCentre: payload?.toDepartmentId || 0,
                transferType: "DepartmentTransfer",
                transactionType: "Update",
                virtualDeptID: editTransferID || 0,
                virtualDeptName: fromDeptName,
                newVirtualDeptID: payload?.toDepartmentId || 0,
                newVirtualDeptName: toDeptName,
                description: payload?.description || "",
                isActive: payload?.isActive ? true : false,
                fromDate: moment(payload.FromDate).format("YYYY-MM-DD"),
                toDate: moment(payload.ToDate).format("YYYY-MM-DD"),
            };

            const res = await axiosInstance.post(
                "Equipment/SaveUpdateVirtualDepartment",
                finalPayload,
            );

            if (res?.data?.success) {
                notify(res?.data?.message || "Updated Successfully", "success");
                resetForm();
                dispatch(setRefreshLoad(!refreshLoad));
            } else {
                notify(res?.data?.message || "Update Failed", "error");
            }
        } catch (error) {
            console.log("Update error", error);
            notify(
                error?.response?.data?.message || "Something went wrong",
                "error"
            );
        }
    };

    const departmentExcel = async () => {
        try {
            const finalPayload = {
                equipmentName: payload?.equipmentId,
                sourceDept: payload?.fromDepartmentId ? (FetchDepartment?.find(d => d.value === payload?.fromDepartmentId)?.label || "") : "",
                destDept: payload?.toDepartmentId ? (FetchDepartment?.find(d => d.value === payload?.toDepartmentId)?.label || "") : "",
                fromDate: moment(payload.FromDate).format("YYYY-MM-DD"),
                toDate: moment(payload.ToDate).format("YYYY-MM-DD"),
            };

            const res = await axiosInstance.post(
                "Equipment/DepartmentTransferExcelReport",
                finalPayload
            );

            const response = Array.isArray(res?.data?.message)
                ? res?.data?.message
                : Array.isArray(res?.data?.data)
                    ? res?.data?.data
                    : [];

            if (response.length > 0) {
                ExportToExcel(response, "DepartmentTransfer.xls");
            } else {
                notify("Data not Found", "error");
            }

        } catch (err) {
            console.error(err);
            notify("Error Occurred", "error");
        }
    };

    const handleSearch = async () => {
        try {
            const finalPayload = {
                equipmentName: payload?.equipmentName || "",
                destDept: payload?.toDepartmentId ? (FetchDepartment?.find(d => d.value === payload?.toDepartmentId)?.label || "") : "",
                sourceDept: payload?.fromDepartmentId ? (FetchDepartment?.find(d => d.value === payload?.fromDepartmentId)?.label || "") : "",
                fromDate: moment(payload.FromDate).format("YYYY-MM-DD"),
                toDate: moment(payload.ToDate).format("YYYY-MM-DD")
            };

            const res = await axiosInstance.post(
                "Equipment/DepartmentTransferSearchReport",
                finalPayload
            );

            const data = Array.isArray(res?.data?.data)
                ? res?.data?.data
                : Array.isArray(res?.data?.message)
                    ? res?.data?.message
                    : [];

            if (data.length > 0) {
                settransferdata(data);
            } else {
                settransferdata([]);
                notify("No Data Found", "error");
            }

        } catch (err) {
            console.log(err);
            settransferdata([]);
            notify("No Data Found", "error");
        }
    };

    return (
        <>
            <div className="card">
                <Accordion
                    name={t("Department to Other Department Transfer")}
                    defaultValue={true}
                    isBreadcrumb={true}
                >
                    <div className="row p-2 d-flex align-items-center">
                        <ReactSelect
                            name="equipmentId"
                            id="equipmentId"
                            removeIsClearable={true}
                            className={`required-fields ${errors?.equipmentId ? "required-fields-active" : ""}`}
                            isShowBorder={true}
                            dynamicOptions={equipmentTypeList}
                            value={payload.equipmentId}
                            onChange={handleReactChange}
                            placeholderName="Equipment"
                            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
                        />
                        <ReactSelect
                            name="fromDepartmentId"
                            id="fromDepartmentId"
                            removeIsClearable={true}
                            className={`required-fields ${errors?.fromDepartmentId ? "required-fields-active" : ""}`}
                            isShowBorder={true}
                            dynamicOptions={FetchDepartment}
                            value={payload.fromDepartmentId}
                            onChange={handleReactChange}
                            placeholderName="Source Department"
                            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
                        />
                        <ReactSelect
                            name="toDepartmentId"
                            id="toDepartmentId"
                            removeIsClearable={true}
                            className={`required-fields ${errors?.toDepartmentId ? "required-fields-active" : ""}`}
                            isShowBorder={true}
                            dynamicOptions={FetchDepartment}
                            value={payload.toDepartmentId}
                            onChange={handleReactChange}
                            placeholderName="Destination Department"
                            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
                        />
                        <Input
                            type="text"
                            lable={t("Description")}
                            id="description"
                            name="description"
                            className={`required-fields ${errors?.description ? "required-fields-active" : ""}`}
                            value={payload?.description}
                            onChange={handleChange}
                            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
                        />
                        <DatePicker
                            name="FromDate"
                            id="FromDate"
                            value={payload?.FromDate}
                            onChange={dateSelect}
                            maxDate={new Date()}
                            placeholder=""
                            lable={t("From Date")}
                            className="custom-calendar"
                            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
                        />
                        <DatePicker
                            name="ToDate"
                            id="ToDate"
                            value={payload?.ToDate}
                            onChange={dateSelect}
                            maxDate={new Date()}
                            placeholder=""
                            lable={t("TO Date")}
                            className="custom-calendar"
                            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
                        />
                        <div className="col-sm-1 d-flex align-items-center">
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={payload?.isActive}
                                    onChange={(e) =>
                                        setPayload((prev) => ({
                                            ...prev,
                                            isActive: e.target.checked
                                        }))
                                    }
                                />
                                <span className="slider"></span>
                            </label>
                            <strong className="ml-2 mb-2">{t("IsActive")}</strong>
                        </div>

                        {/* Show Save only when NOT in edit mode */}
                        {!isEditMode && (
                            <CustomButton
                                text={"Save"}
                                icon={"save"}
                                className="mr-2 mb-2"
                                onClick={handleSave}
                            />
                        )}

                        {/* Show Update only when in edit mode */}
                        {isEditMode && (
                            <>
                                <CustomButton
                                    text={"Update"}
                                    icon={"edit"}
                                    className="mr-2 mb-2"
                                    onClick={handleUpdate}
                                />
                                <CustomButton
                                    text={"Cancel"}
                                    icon={"times"}
                                    className="mr-2 mb-2"
                                    onClick={resetForm}
                                />
                            </>
                        )}

                        <CustomButton
                            text={"Search"}
                            icon={"search"}
                            className="ml-2  mb-2"
                            onClick={handleSearch}
                        />
                    </div>
                </Accordion>
            </div>
        </>
    );
});

export default DepartmentToDepartment;