import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react'
import Accordion from '../../../components/UI/Accordion'
import { useTranslation } from 'react-i18next';
import ReactSelect from '../../../components/formComponent/ReactSelect';
import DatePicker from '../../../components/formComponent/DatePicker';
import Input from '../../../components/formComponent/Input';
import Form from 'react-bootstrap/Form';
import { axiosInstance } from '../../../utils/axiosInstance';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { setRefreshLoad } from '../../../store/reducers/loadingSlice/loadingSlice';
import moment from 'moment';
import { notify } from '../../../utils/utils';
import { apiUrls } from '../../../utils/apiUrls';
import { CustomButton } from '../../../components/UI/CustomButton';
import { autocompleteOnBlur, ExportToExcel } from '../../../utils/helpers';
import AutoComplete from "../../../components/formComponent/AutoComplete";


const Supplier = forwardRef(({ setExcelFunction, settransferdata }, ref) => {

    const dispatch = useDispatch()
    const { t } = useTranslation();
    const [namedata, setnamedata] = useState([]);
    const [equipmentdata, setequipmentdata] = useState([]);
    const [equipmentTypeList, setEquipmentTypeList] = useState([]);
      const [errors, setErrors] = useState({});
    const { refreshLoad } = useSelector((state) => state.loadingSlice);
    const [searchEmployeePayload, setSearchEmployeePayload] = useState({
        label: "",
        value: null,
    });
    const [selectSearchEmployee, setSelectSearchEmployee] = useState(false);
    const [employeeList, setEmployeeList] = useState([]);
    const [searchEmployeeSuggestions, setSearchEmployeeSuggestions] = useState(
        [],
    );

    const [searchEmployeeIndex, setSearchEmployeeIndex] = useState(0);
    const [payload, setPayload] = useState({
        equipmentId: "",
        equipmentName: "",
        expectedReturnDate: new Date(),
        transferDate: new Date(),
        equipmentCondition: "",
        transferReason: "",
        remarks: "",
        handoverToName: "",
        designationName: "",
        mobile: "",
        email: ''


    })
    const [isEditMode, setIsEditMode] = useState(false);
    const [editTransferID, setEditTransferID] = useState(null);
    const handlesubmit = async (e) => {
        e.preventDefault();
        const selectedhandovername = namedata.filter(item => item.value == payload?.handoverToName)?.[0]
        const transferDate = moment(payload?.transferDate)?.format('YYYY-MM-DD') //20-09-2025
        const expectedReturnDate = moment(payload?.expectedReturnDate)?.format('YYYY-MM-DD') //20-09-2025
        let requestdata = {
            transactionType: "Insert",
            TransferType: "To Vendor",
            equipmentId: payload?.equipmentId,
            expectedReturnDate: `${expectedReturnDate?.split('T')[0]}T00:00:00`,
            transferDate: `${transferDate?.split('T')[0]}T00:00:00`,
            equipmentCondition: payload?.equipmentCondition,
            remarks: payload?.remarks,
            transferReason: payload?.transferReason,
            HandoverTo: selectedhandovername?.value,
            handoverToName: selectedhandovername?.label,
            designationName: payload?.designationName,
            mobile: payload?.mobile,
            email: payload?.email
        };

        try {
            const resp = await axiosInstance.post(apiUrls?.EquipmentTransfer, requestdata);
            console.log(resp.data.data);

            if (resp?.data?.success === true) {
                dispatch(setRefreshLoad(!refreshLoad))
                notify(resp?.data?.message, "success");
                setPayload({
                    equipmentId: "",
                    equipmentName: "",
                    expectedReturnDate: "",
                    transferDate: "",
                    equipmentCondition: "",
                    transferReason: "",
                    remarks: "",
                    handoverToName: "",
                    designationName: "",
                    mobile: "",
                    email: ''
                });
                // fetchequipmentdata();
            } else {

                notify(resp?.data?.message || "Insert failed", "error");
            }

        } catch (error) {
            console.log(error);
            notify(error?.response?.data?.message || "Insert failed", "error");
        }
    };
    const handleChange = (e) => {
        const { name, value } = e.target;
         // Mobile validation
        if (name === "mobile") {
            const numericValue = value.replace(/[^0-9]/g, "").slice(0, 10);
            setPayload((prev) => ({
                ...prev,
                mobile: numericValue,
            }));

            if (errors[name]) {
                setErrors((prev) => ({ ...prev, [name]: false }));
            }
            return;
        }
     
        setPayload((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: false }));
        }
    };

    const handleReactChange = (name, e) => {
        console.log("selectedOption", e, "name", name);
        setPayload((prev) => ({
            ...prev,
            [name]: e?.value,
            ...(name === "equipmentId" && { equipmentName: e?.label })
        }));
        if (name === "handoverToName") {
            const selectname = namedata.filter(item => item.value === e.value)?.[0]
            console.log("slelectttt", selectname)
            setPayload((prev) => ({
                ...prev,
                designationName: selectname?.Designation,
                mobile: selectname?.Mobile,
                email: selectname?.Email
            }));
        }
        if (errors[name] || errors?.equipmentId || errors?.equipmentCondition || errors?.handoverToName || errors?.email) {
            setErrors((prev) => ({ ...prev, [name]: false }));
        }
    };


    const dateSelect = (value, name) => {
        setPayload({ ...payload, [name]: value });
    };
    const fetchname = () => {
        axiosInstance.get("Equipment/GetAllMaster", {
            params: {
                p_type: "Contact",
                p_id: 0
            }
        })
            .then((resp) => {
                console.log(resp);
                const rawData = resp?.data?.message || [];
                const options = rawData.map(item => ({
                    ...item,
                    value: String(item.ContactID),
                    label: item.ContactPerson,

                }));
                setnamedata(options);
            })
            .catch((error) => {
                console.error(error);
            });
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
    //name APi
    const handleSearchEmployeeChange = (e) => {
        const value = e.target.value;
        setSearchEmployeePayload({ label: value, value: null });

        if (!value.trim()) {
            // empty — reset list
            setSelectSearchEmployee(false);
            setSearchEmployeeSuggestions([]);
        } else {
            // Call API to fetch employees based on search term
            const apiPayload = {
                employeeID: 0,
                employeeName: value || "",
            };
            axiosInstance
                .post("Employee/getEmployee", apiPayload)
                .then((res) => {
                    const data = res?.data?.message || [];
                    let employeeListData = data.map((ele) => {
                        const fullName = `${ele?.EmployeeName}, EmployeeId :${ele?.EmployeeID}${ele?.EmployeeCode ? `, EmployeeCode :${ele?.EmployeeCode}` : ""}${ele?.Mobile ? `, Mobile :${ele?.Mobile}` : ""}${ele?.Username ? `, Username :${ele?.Username}` : ""}`;

                        return {
                            value: ele.EmployeeID,
                            label: ele.EmployeeName || "",
                            fullName: fullName,
                            Mobile: ele?.Mobile || "",
                            Username: ele?.Username || "",
                        };
                    });
                    setEmployeeList(employeeListData);
                    setSearchEmployeeSuggestions(employeeListData);
                    setSelectSearchEmployee(employeeListData.length > 0);
                    setSearchEmployeeIndex(0);
                })
                .catch((err) => {
                    console.log(err);
                    setSearchEmployeeSuggestions([]);
                    setSelectSearchEmployee(false);
                });
        }
    };

    const handleSearchEmployeeKeyDown = (e) => {
        if (!selectSearchEmployee || searchEmployeeSuggestions.length === 0) return;

        if (e.key === "ArrowUp") {
            setSearchEmployeeIndex((prev) =>
                prev > 0 ? prev - 1 : searchEmployeeSuggestions.length - 1,
            );
        } else if (e.key === "ArrowDown") {
            setSearchEmployeeIndex((prev) =>
                prev === searchEmployeeSuggestions.length - 1 ? 0 : prev + 1,
            );
        } else if (e.key === "Enter") {
            handleSearchEmployeeSelect(
                searchEmployeeSuggestions[searchEmployeeIndex],
            );
            setSearchEmployeeIndex(0);
        }
        // switch (e.which) {
        //   case 38:
        //     if (searchEmployeeIndex !== 0) {
        //       setSearchEmployeeIndex(searchEmployeeIndex - 1);
        //     } else {
        //       setSearchEmployeeIndex(searchEmployeeSuggestions.length - 1);
        //     }
        //     break;
        //   case 40:
        //     if (searchEmployeeSuggestions.length - 1 === searchEmployeeIndex) {
        //       setSearchEmployeeIndex(0);
        //     } else {
        //       setSearchEmployeeIndex(searchEmployeeIndex + 1);
        //     }
        //     break;
        //   case 13:
        //     handleSearchEmployeeSelect(searchEmployeeSuggestions[searchEmployeeIndex]);
        //     setSearchEmployeeIndex(0);
        //     break;
        //   default:
        //     break;
        // }
    };

    const getEmployeeDetails = () => {
        const apiPayload = {
            employeeID: 0,
            employeeName: searchEmployeePayload.label || "",
        };
        axiosInstance
            .post("Employee/getEmployee", apiPayload)
            .then((res) => {
                const data = res?.data?.message || [];
                let employeeList = data.map((ele) => {
                    const fullName = `${ele?.EmployeeName}, EmployeeId :${ele?.EmployeeID}${ele?.EmployeeCode ? `, EmployeeCode :${ele?.EmployeeCode}` : ""}${ele?.Mobile ? `, Mobile :${ele?.Mobile}` : ""}${ele?.Username ? `, Username :${ele?.Username}` : ""}`;

                    return {
                        value: ele.EmployeeID,
                        label: ele.EmployeeName || "",
                        fullName: fullName,
                        Mobile: ele?.Mobile || "",
                        Username: ele?.Username || "",
                    };
                });
                setEmployeeList(employeeList);
                setSearchEmployeeSuggestions(employeeList);
            })
            .catch((err) => console.log(err));
    };
    const handleSearchEmployeeSelect = (selected) => {
        if (!selected) return;

        // Set selected employee data in the form
        setSearchEmployeePayload({
            label: selected.label,
            value: selected.value,
        });

        // Update payload with selected employee data
        setPayload((prev) => ({
            ...prev,
            handoverToName: selected.label,
            designationName: selected.Designation || "",
            mobile: selected.Mobile || "",
            email: selected.Email || ""
        }));

        setErrors((prev) => ({ ...prev, handoverToName: false, email: false }));

        // Close the autocomplete dropdown
        setSelectSearchEmployee(false);
        setSearchEmployeeSuggestions([]);
    };
    //equipment type API
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

    useEffect(() => {
        equipmentAPi();
        fetchname();
        fetchequipmentdata();
    }, [])

    // Expose edit handler to parent
    useImperativeHandle(ref, () => ({
        handleEditClick(item) {
            const safe = (v) => (v === null || v === undefined ? "" : String(v).trim().toLowerCase());

            // Match equipment against equipmentTypeList (what the dropdown actually uses)
            const equipmentLabel = safe(item?.Equipment || item?.MachineID || item?.machineid || item?.equipmentName);
            const equipmentMatch = equipmentTypeList?.find(e => safe(e.label) === equipmentLabel)
                || equipmentTypeList?.find(e => String(e.value) === String(item?.EquipmentID || item?.equipmentId || item?.machineid))
                || null;

            // Match handover/contact
            const handoverLabel = safe(item?.HandoverName || item?.handoverName || item?.handoverToName || item?.HandoverTo || item?.handoverTo);
            const handoverMatch = namedata?.find(n => safe(n.label) === handoverLabel) || null;
            const nameToSet = handoverMatch?.label || item?.HandoverName || item?.handoverName || item?.handoverToName || "";

            setSearchEmployeePayload({
                label: nameToSet,
                value: handoverMatch?.value || null
            });

            setPayload(prev => ({
                ...prev,
                equipmentId: equipmentMatch?.value || "",
                equipmentName: equipmentMatch?.label || item?.Equipment || item?.MachineID || "",
                equipmentCondition: item?.EquipmentCondition || item?.equipmentCondition || "",
                transferDate: item?.TransferDate ? new Date(moment(item.TransferDate, "DD-MMM-YYYY").toDate()) : new Date(),
                expectedReturnDate: item?.ExpectedReturnDate ? new Date(moment(item.ExpectedReturnDate, "DD-MMM-YYYY").toDate()) : new Date(),
                transferReason: item?.ReasonOfTransfer || item?.reasonOfTransfer || "",
                remarks: item?.Remarks || item?.remarks || "",
                handoverToName: nameToSet,
                designationName: handoverMatch?.Designation || item?.HandoverDesignation || item?.handoverDesignation || "",
                mobile: handoverMatch?.Mobile || item?.HandoverMobile || item?.handoverMobile || "",
                email: handoverMatch?.Email || item?.HandoverEmail || item?.handoverEmail || "",
            }));

            setEditTransferID(item?.TransferID || item?.id || 0);
            setIsEditMode(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }));
    const EquipmentCondition = [
        {
            value: "Working",
            label: "Working"
        },
        {
            value: "Malfunction",
            label: "Malfunction"
        },
        {
            value: "Other",
            label: "Other"
        },
    ]
    //excel 
    // excel 
    const supplierExcel = async () => {
        try {
            const finalPayload = {
                equipmentName: payload?.equipmentName || "",
                equipmentCondition: payload?.equipmentCondition || "",
                expectedFromDate: payload?.expectedReturnDate
                    ? moment(payload.expectedReturnDate).format("YYYY-MM-DD")
                    : "",
                expectedToDate: payload?.expectedReturnDate
                    ? moment(payload.expectedReturnDate).format("YYYY-MM-DD")
                    : "",
            };

            const res = await axiosInstance.post(
                "Equipment/SupplierRepairExcelReport",
                finalPayload
            );

            const response = Array.isArray(res?.data?.message)
                ? res?.data?.message
                : Array.isArray(res?.data?.data)
                    ? res?.data?.data
                    : [];

            if (response.length > 0) {
                ExportToExcel(response, "SupplierRepair.xls");
            } else {
                notify("Data not Found", "error");
            }
        } catch (err) {
            console.error(err);
            notify("Error Occurred", "error");
        }
    };
    useEffect(() => {
        if (setExcelFunction) {
            setExcelFunction(() => supplierExcel);
        }
    }, [payload]);

    const handleUpdate = async () => {
        if (!payload?.equipmentId) {
            setErrors((prev) => ({ ...prev, equipmentId: true }));
            notify("Equipment is required", "error");
            return;
        }

        if (!payload?.equipmentCondition) {
            setErrors((prev) => ({ ...prev, equipmentCondition: true }));
            notify("Equipment Condition is required", "error");
            return;
        }

        if (!payload?.handoverToName) {
            setErrors((prev) => ({ ...prev, handoverToName: true }));
            notify("Name is required", "error");
            return;
        }

        if (!payload?.email) {
            setErrors((prev) => ({ ...prev, email: true }));
            notify("Email is required", "error");
            return;
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
        if (!emailRegex.test(payload?.email)) {
            setErrors((prev) => ({ ...prev, email: true }));
            notify("Please enter valid gmail address", "error");
            return;
        }

        try {
            const finalPayload = {
                id: editTransferID || 0,
                machineid: String(payload?.equipmentName) || "",
                equipmentCondition: String(payload?.equipmentCondition) || "",
                transferDate: payload?.transferDate
                    ? `${moment(payload.transferDate).format('YYYY-MM-DD')}T00:00:00`
                    : "",
                expectedReturnDate: payload?.expectedReturnDate
                    ? `${moment(payload.expectedReturnDate).format('YYYY-MM-DD')}T00:00:00`
                    : "",
                reasonOfTransfer: String(payload?.transferReason) || "",
                handoverName: String(payload?.handoverToName) || String(payload?.handoverToName) || "",
                handoverDesignation: String(payload?.designationName) || "",
                handoverMobile: String(payload?.mobile) || "",
                handoverEmail: String(payload?.email) || "",
            };

            const res = await axiosInstance.post(
                "Equipment/UpdateTransferEquipmentToSupplier",
                finalPayload
            );

            if (res?.data?.success) {
                notify(res?.data?.message || "Updated Successfully", "success");
                setIsEditMode(false);
                setEditTransferID(null);
                dispatch(setRefreshLoad(!refreshLoad));
            } else {
                notify(res?.data?.message || "Update Failed", "error");
            }

        } catch (error) {
            console.log("Update error", error);
            notify(error?.response?.data?.message || "Something went wrong", "error");
        }
    };
    //save 
    const dialogSave = async () => {
        if (!payload?.equipmentId) {
            setErrors((prev) => ({ ...prev, equipmentId: true }));
            notify("Equipment is required", "error");
            return;
        }

        if (!payload?.equipmentCondition) {
            setErrors((prev) => ({ ...prev, equipmentCondition: true }));
            notify("Equipment Condition is required", "error");
            return;
        }

        if (!payload?.handoverToName) {
            setErrors((prev) => ({ ...prev, handoverToName: true }));
            notify("Name is required", "error");
            return;
        }
        if(!payload?.transferReason) {
            setErrors((prev) => ({ ...prev, transferReason: true }));
            notify("Transfer Reason is required", "error");
            return;
        }
        if(!payload?.mobile) {
            setErrors((prev) => ({ ...prev, mobile: true }));
            notify("Mobile number is required", "error");
            return;
        }

        if (!payload?.email) {
            setErrors((prev) => ({ ...prev, email: true }));
            notify("Email is required", "error");
            return;
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
        if (!emailRegex.test(payload?.email)) {
            setErrors((prev) => ({ ...prev, email: true }));
            notify("Please enter valid gmail address", "error");
            return;
        }

        try {

            const finalPayload = {
                machineid: String(payload?.equipmentName) || "",
                equipmentCondition: String(payload?.equipmentCondition) || "",

                transferDate: payload?.transferDate
                    ? moment(payload.transferDate).format("YYYY-MM-DD")
                    : "",

                expectedReturnDate: payload?.expectedReturnDate
                    ? moment(payload.expectedReturnDate).format("YYYY-MM-DD")
                    : "",

                reasonOfTransfer: String(payload?.transferReason) || "",

                handoverName: String(payload?.handoverToName) || "",

                handoverDesignation: String(payload?.designationName) || "",

                handoverMobile: String(payload?.mobile) || "",

                handoverEmail: String(payload?.email) || "",
            };

            console.log("finalPayload", finalPayload);

            const res = await axiosInstance.post(
                "Equipment/TransferEquipmentToSupplier",
                finalPayload,

            );

            if (res?.data?.success) {
                notify(res?.data?.message || "Saved Successfully", "success");
                setPayload({
                    equipmentId: "",
                    equipmentName: "",
                    expectedReturnDate: "",
                    transferDate: "",
                    equipmentCondition: "",
                    transferReason: "",
                    remarks: "",
                    handoverToName: "",
                    designationName: "",
                    mobile: "",
                    email: ''   
                });
                setErrors({});
            } else {
                notify(res?.data?.message || "Save Failed", "error");
            }

        } catch (error) {
            console.log("dialogSave error", error);

            notify(
                error?.response?.data?.message ||
                "Something went wrong",
                "error"
            );
        }
    };
    //search
     const handleSearch = async () => {
            try {
                const finalPayload = {
            equipmentName: payload?.equipmentName || "",
            equipmentCondition: payload?.equipmentCondition || "",

            expectedFromDate: payload?.expectedReturnDate
                ? moment(payload.expectedReturnDate).format("DD-MMM-YYYY")
                : "",

            expectedToDate: payload?.expectedReturnDate
                ? moment(payload.expectedReturnDate).format("DD-MMM-YYYY")
                : "",
        };

    
                const res = await axiosInstance.post(
                    "Equipment/SupplierRepairSearchReport",
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
                    name={t("Transfer to Supplier for Repair")}
                    defaultValue={true}
                    isBreadcrumb={true}

                >

                    <div className="row p-2 d-flex align-items-center">
                        <ReactSelect
                            name="equipmentId"
                            id="equipmentId"
                         className={`required-fields ${errors?.equipmentId ? "required-fields-active" : ""}`}
                            removeIsClearable={true}
                            isShowBorder={true}
                            dynamicOptions={equipmentTypeList}
                            value={payload.equipmentId}
                            onChange={handleReactChange}
                            placeholderName="Equipment"
                            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
                        />
                        <ReactSelect
                            name="equipmentCondition"
                            id="equipmentConditionn"
                          className={`required-fields ${errors?.equipmentCondition ? "required-fields-active" : ""}`}

                            removeIsClearable={true}
                            isShowBorder={true}
                            dynamicOptions={EquipmentCondition}
                            value={payload.equipmentCondition}
                            onChange={handleReactChange}
                            placeholderName="Equipment Condition"
                            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
                        />
                        {["Other"]?.includes(payload.equipmentCondition) && (
                            <Input
                                type="text"
                                placeholder=" "
                                lable={t("Specify Equipment Condition")}
                                id="remarks"
                                name="remarks"
                                value={payload.remarks || ""}
                                onChange={handleChange}
                                respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
                            />
                        )}
                        <DatePicker
                            className="custom-calendar"
                            name="transferDate"
                            placeholder=" "
                            id="transferDate"
                            lable="DateOfTransfer"
                            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
                            value={payload.transferDate}
                            onChange={dateSelect}
                        />

                        <DatePicker
                            className="custom-calendar"
                            name="expectedReturnDate"
                            placeholder=" "
                            id="expectedReturnDate"
                            lable="ExpectedReturnDate"
                            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
                            value={payload.expectedReturnDate}
                            onChange={dateSelect}
                        />
                        <Input
                            type="text"
                            placeholder=" "
                            lable={t("Reason Of Transfer")}
                           className={`required-fields ${errors?.transferReason ? "required-fields-active" : ""}`}
                            id="transferReason"
                            name="transferReason"
                            value={payload?.transferReason}
                            onChange={handleChange}
                            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
                        />

                    </div>
                    <Accordion defaultValue={true} title={t("Handover To")} />
                    <div className="row p-2 d-flex align-items-center">
                        {/* <ReactSelect
                            name="handoverToName"
                            id="handoverToName"
                            removeIsClearable={true}
                            isShowBorder={true}
                            dynamicOptions={namedata}
                            onChange={handleReactChange}
                            value={payload?.handoverToName}
                            placeholderName="Name"
                            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
                        /> */}
                           <div className="col-sm-4">
                          <Input
                            type="text"
                            name="SearchEmployee"
                            lable="Name"
                            id="SearchEmployee"
                             className={`required-fields ${errors?.handoverToName ? "required-fields-active" : ""}`}
                            value={searchEmployeePayload.label || ""}
                            placeholder=" "
                            onChange={handleSearchEmployeeChange}
                            onKeyDown={handleSearchEmployeeKeyDown}
                            onBlur={() => {
                              autocompleteOnBlur(setSearchEmployeeSuggestions);
                              // setTimeout(() => setSelectSearchEmployee(false), 200)
                            }}
                          />
            
                          {selectSearchEmployee && searchEmployeeSuggestions.length > 0 && (
                            <AutoComplete
                              selects={selectSearchEmployee}
                              test={searchEmployeeSuggestions.map((item) => ({
                                TestName: item.fullName,
                              }))}
                              handleListSearch={(selected) =>
                                handleSearchEmployeeSelect(
                                  searchEmployeeSuggestions.find(
                                    (item) => item.fullName === selected.TestName,
                                  ),
                                )
                              }
                              indexMatch={searchEmployeeIndex}
                            />
                          )}
                        </div>
                        <Input
                            type="text"
                            placeholder=" "
                            lable={t("Designation")}
                            id="designationName"
                            name="designationName"
                            value={payload?.designationName}
                            onChange={handleChange}
                            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
                        />
                        <Input
                            type="text"
                            placeholder=" "
                            lable={t("Mobile")}
                            className={`required-fields ${errors?.mobile ? "required-fields-active" : ""}`}
                            id="mobile"
                            name="mobile"
                            maxLength={10}
                            value={payload?.mobile}
                            onChange={handleChange}
                            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
                        />
                        <Input
                            type="email"
                            placeholder=" "
                            className={`required-fields ${errors?.email ? "required-fields-active" : ""}`}
                            lable={t("Email")}
                            id="email"
                            name="email"
                            value={payload?.email}
                            onChange={handleChange}
                            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
                        />
                        {!isEditMode && (
                            <CustomButton
                                text={"Save"}
                                icon={"save"}
                                className="ml-2"
                                onClick={dialogSave}
                            />
                        )}

                        {isEditMode && (
                            <>
                                <CustomButton
                                    text={"Update"}
                                    icon={"edit"}
                                    className="ml-2"
                                    onClick={() => handleUpdate()}
                                />
                                <CustomButton
                                    text={"Cancel"}
                                    icon={"times"}
                                    className="ml-2"
                                    onClick={() => {
                                        setIsEditMode(false);
                                        setEditTransferID(null);
                                        setSearchEmployeePayload({
                                            label: "",
                                            value: null,
                                        });
                                        setPayload({
                                            equipmentId: "",
                                            equipmentName: "",
                                            expectedReturnDate: new Date(),
                                            transferDate: new Date(),
                                            equipmentCondition: "",
                                            transferReason: "",
                                            remarks: "",
                                            handoverToName: "",
                                            designationName: "",
                                            mobile: "",
                                            email: ''
                                        });
                                    }}
                                />
                            </>
                        )}
                        <CustomButton
                            text={"Search"}
                            icon={"search"}
                            className="ml-2"
                        onClick={handleSearch}
                        />
                    </div>

                </Accordion>
            </div>
        </>
    )
});

export default Supplier;
