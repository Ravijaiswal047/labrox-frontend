import React, { useEffect, useState, useImperativeHandle, forwardRef } from 'react'
import Accordion from '../../../components/UI/Accordion'
import { useTranslation } from 'react-i18next';
import ReactSelect from '../../../components/formComponent/ReactSelect';
import DatePicker from '../../../components/formComponent/DatePicker';
import Input from '../../../components/formComponent/Input';
import { axiosInstance } from '../../../utils/axiosInstance';
import { notify } from '../../../utils/utils';
import { apiUrls } from '../../../utils/apiUrls';
import moment from 'moment'
import { setRefreshLoad } from '../../../store/reducers/loadingSlice/loadingSlice';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { CustomButton } from '../../../components/UI/CustomButton';
import { ExportToExcel } from '../../../utils/helpers';


const CentreToCentre = forwardRef(({ settransferdata, setExcelFunction, onEditClick }, ref) => {
    const { refreshLoad } = useSelector((state) => state.loadingSlice);
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const [equipmentdata, setequipmentdata] = useState([]);
    console.log("equipmentdata", equipmentdata);
    const [centredata, setcentredata] = useState([]);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingId, setEditingId] = useState(null);
      const [errors, setErrors] = useState({});
    
    useImperativeHandle(ref, () => ({
        handleEditClick
    }));
    
    const [payload, setPayload] = useState({
        equipmentId: "",
        fromCenterId: "",
        toCenterId: "",
        transferDate: new Date(),
        equipmentCondition: "",
        remarks: "",
        // otherequipmentCondition: "",
        transferReason: "",
        machine: "",
        FromDate: new Date(),
        ToDate: new Date()
    });

    const handlesubmit = async (e) => {
        e.preventDefault();
        const transferDate = moment(payload?.transferDate)?.format('YYYY-MM-DD') //20-09-2025
        let requestdata = {
            transactionType: "Insert",
            TransferType: "Centre to Centre",
            equipmentId: payload?.equipmentId,
            FromDepartmentId: payload?.fromCenterId,
            ToDepartmentId: payload?.toCenterId,
            transferDate: `${transferDate?.split('T')[0]}T00:00:00`,
            equipmentCondition: payload?.equipmentCondition,
            remarks: payload?.remarks,
            // otherequipmentCondition: "",
            transferReason: payload?.transferReason
        };

        try {
            const resp = await axiosInstance.post(apiUrls?.EquipmentTransfer, requestdata); // <-- assign to 'resp'
            console.log(resp.data.data);

            if (resp?.data?.success === true) {
                dispatch(setRefreshLoad(!refreshLoad))
                notify(resp?.data?.message, "success");
                setPayload({
                    equipmentId: "",
                    fromCenterId: "",
                    toCenterId: "",
                    transferDate: "",
                    equipmentCondition: "",
                    remarks: "",
                    reasonOfTransfer: ""
                });
                // fetchequipmentdata();
            } else {

                notify(resp?.data?.message || "Insert failed", "error");
            }

        } catch (error) {
            console.log('errorxx', error);
            notify(error?.response?.data?.message || "Insert failed", "error");
        }
    };
    const handleChange = (e) => {
        const { name, value } = e.target;
        setPayload((prev) => ({ ...prev, [name]: value }));
    };

    const handleReactChange = (name, e) => {
        console.log("selectedOption", e, "name", name);
        setPayload((prev) => ({ ...prev, [name]: e.value }));
        if (name === 'equipmentId') {
            const selectCentre = equipmentdata?.filter(item => item?.value == e.value)?.[0]
            console.log('selectCentre::', selectCentre)
            setPayload((prev) => ({ ...prev, fromCenterId: selectCentre?.CentreID }));
        }
        if (name === "fromCenterId") {
            getMachineList(e?.value)
        }
    };


    const dateSelect = (value, name) => {
        setPayload({ ...payload, [name]: value });
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
                const options = rawData?.map(item => ({
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
   const getMachineList = async (centreId, machineNameOrId = null) => {
    // setDropDownApis((prev) => ({ ...prev, machinelist: [] }));
    // dispatch(setLoading(true));

    axiosInstance
        .get("CommonController/GetMachineGroup", {
            params: { centreId: centreId.toString() }
        })
        .then((res) => {
            if (res?.data?.success) {

                const resList =
                    res?.data?.message?.machines?.map((item) => ({
                        ...item,
                        label: item?.MachineName,
                        value: item?.MachineID,
                    })) || [];

                setequipmentdata(resList);

                // If machineNameOrId is provided, find the matching option and set it
                if (machineNameOrId) {
                    const match = resList.find(m => 
                        String(m.label).trim().toLowerCase() === String(machineNameOrId).trim().toLowerCase() ||
                        String(m.value).trim().toLowerCase() === String(machineNameOrId).trim().toLowerCase()
                    );
                    if (match) {
                        setPayload(prev => ({ ...prev, machine: match.value }));
                    }
                }
            }
        })
        .catch((err) => {
            notify(err?.response?.data?.message, "error");
        });

    // dispatch(setLoading(false));
};
    // const fetchAllCenter = () => {
    //     axiosInstance.get("Employee/GetAllCentres")
    //         .then(res => {
    //             const data = res?.data?.message || [];
    //             const val = data.map(ele => ({
    //                 value: ele.CentreID,
    //                 label: ele.Centre,
    //                 CentreCode: ele?.CentreCode
    //             }));
    //             setcentredata(val);

    //         })
    //         .catch(err => {
    //             console.error(err);
    //         });
    // };
  const getCentreDetails = (state) => {
    axiosInstance
      .get("Centre/getGlobalCentres")
      .then((res) => {
        let data = res.data.message;
        let value = data.map((ele) => ({
          value: ele.CentreID,
          label: ele.Centre,
          DefaultCentreId: ele.DefaultCentreId,
        }));
        state(value);
      })
      .catch(console.error);
  };

  useEffect(() => {
    getCentreDetails(setcentredata);
  }, []);
  
    useEffect(() => {
        fetchequipmentdata();
        // fetchAllCenter();
    }, [])

    const dialogSave = async () => {
       //basic validation
       if(!payload?.fromCenterId){
        setErrors(prev => ({...prev, fromCenterId: true}));
        notify("Please select Source Centre", "error");
        return;
       }
         if(!payload?.toCenterId){
            setErrors(prev => ({...prev, toCenterId: true}));
            notify("Please select Destination Centre", "error");
            return;
         }
            if(!payload?.machine){
                setErrors(prev => ({...prev, machine: true}));
                notify("Please select Equipment", "error");
                return;
            }
                if(!payload?.equipmentCondition){
                    setErrors(prev => ({...prev, equipmentCondition: true}));
                    notify("Please select Equipment Condition", "error");
                    return;
                }
                    if(!payload?.transferReason){
                        setErrors(prev => ({...prev, transferReason: true}));
                        notify("Please enter Reason Of Transfer", "error");
                        return;
                    }
                    
       

        try {
            const selectedMachineLabel = equipmentdata?.find(item => item.value == payload?.machine)?.label || "";
            const finalPayload = {
                machineid: String(selectedMachineLabel),
                newMachineName: String(payload?.equipmentId || ""),
                fromCentre: String(payload?.fromCenterId || ""),
                toCentre: String(payload?.toCenterId || ""),
                equipmentCondition: String(payload?.equipmentCondition || ""),
                reasonOfTransfer: String(payload?.transferReason || ""),
                transferDate: moment(payload?.transferDate).format("YYYY-MM-DD"),
            };

            console.log("finalPayload", finalPayload);

            const res = await axiosInstance.post(
                "Equipment/TransferMachine",
                finalPayload,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (res?.data?.success) {
                notify(res?.data?.message || "Saved Successfully", "success");
                // Clear all form fields after successful save
                setPayload({
                    equipmentId: "",
                    fromCenterId: "",
                    toCenterId: "",
                    transferDate: new Date(),
                    equipmentCondition: "",
                    remarks: "",
                    transferReason: "",
                    machine: "",
                    FromDate: new Date(),
                    ToDate: new Date()
                });
                setequipmentdata([]);
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

    //edit handler
    const handleEditClick = (row) => {
        setIsEditMode(true);
        setEditingId(row?.ID || row?.id || row?.TransferID || null);

        const safeLower = (val) => String(val || "").trim().toLowerCase();
        
        const findCentreMatch = (centreName) => {
            if (!centreName) return null;
            const term = safeLower(centreName);
            // 1. Try exact match
            let match = centredata?.find(c => safeLower(c.label) === term);
            if (match) return match;
            // 2. Try partial match
            match = centredata?.find(c => safeLower(c.label).includes(term) || term.includes(safeLower(c.label)));
            return match || null;
        };

        // Find matching Source Center ID from centredata
        const fromCentreMatch = findCentreMatch(row?.FromCentreName) || findCentreMatch(row?.FromCentre);
        const fromCenterIdVal = fromCentreMatch?.value || row?.FromCentreID || row?.FromCentreId || row?.FromCentre || row?.FromCenterID || row?.FromCenterId || row?.FromCenter || "";

        // Find matching Destination Center ID from centredata
        const toCentreMatch = findCentreMatch(row?.ToCentreName) || findCentreMatch(row?.ToCentre);
        const toCenterIdVal = toCentreMatch?.value || row?.ToCentreID || row?.ToCentreId || row?.ToCentre || row?.ToCenterID || row?.ToCenterId || row?.ToCenter || "";

        // Fetch machine list for the source center and match the machine name
        if (fromCenterIdVal) {
            getMachineList(fromCenterIdVal, row?.MachineID || row?.MachineId || row?.machine || row?.Machine);
        }

        // Parse Equipment Condition and capitalize appropriately, fallback to "Working" if empty
        let cond = row?.EquipmentCondition || row?.equipmentCondition || row?.Condition || row?.condition || "Working";
        if (cond) {
            cond = cond.charAt(0).toUpperCase() + cond.slice(1).toLowerCase();
        }

        setPayload({
            equipmentId: row?.NewMachineName || row?.NewMachineID || row?.NewMachineId || "",
            fromCenterId: fromCenterIdVal,
            toCenterId: toCenterIdVal,
            transferDate: row?.TransferDate ? moment(row?.TransferDate, "DD-MMM-YYYY").toDate() : new Date(),
            equipmentCondition: cond,
            remarks: row?.Remarks || row?.remarks || "",
            transferReason: row?.Reason || row?.ReasonOfTransfer || row?.transferReason || "",
            machine: row?.MachineID || row?.MachineId || row?.machine || row?.Machine || "",
            FromDate: new Date(),
            ToDate: new Date()
        });

        // Call parent callback if provided
        if (onEditClick) {
            onEditClick(row);
        }
    };

    //update 
    const handleUpdate = async ()=>{
        try {
            const selectedMachineLabel = equipmentdata?.find(item => item.value == payload?.machine)?.label || payload?.machine || "";
            const finalPayload = {
                id: editingId,
                machineid: String(selectedMachineLabel),
                newMachineName: String(payload?.equipmentId || ""),
                fromCentre: String(payload?.fromCenterId || ""),
                toCentre: String(payload?.toCenterId || ""),
                equipmentCondition: String(payload?.equipmentCondition || ""),
                reasonOfTransfer: String(payload?.transferReason || ""),
                transferDate: moment(payload?.transferDate).format("YYYY-MM-DD"),
            };
            const res = await axiosInstance.post(
                "Equipment/UpdateTransferMachine",
                finalPayload,
                {
                   
                }
            );
            if (res?.data?.success) {
                notify(res?.data?.message || "Updated Successfully", "success");
                setIsEditMode(false);
                setEditingId(null);
                setPayload({
                    equipmentId: "",
                    fromCenterId: "",
                    toCenterId: "",
                    transferDate: new Date(),
                    equipmentCondition: "",
                    remarks: "",
                    transferReason: "",
                    machine: "",
                    FromDate: new Date(),
                    ToDate: new Date()
                });
            } else {
                notify(res?.data?.message || "Update Failed", "error");
            }
        } catch (error) {
            console.log("handleUpdate error", error);
            notify(
                error?.response?.data?.message ||
                "Something went wrong",
                "error"
            );
        }
    }
    //search
    const handleSearch = async () => {
        try {
            const finalPayload = {
                dtFrom: moment(payload.FromDate).format("YYYY-MM-DD"),
                dtTo: moment(payload.ToDate).format("YYYY-MM-DD")
            };

            const res = await axiosInstance.post(
                "Equipment/GetMachineData",
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
    //excel
    const saveExcel = async () => {
        try {
            const finalPayload = {
                dtFrom: moment(payload.FromDate).format("YYYY-MM-DD"),
                dtTo: moment(payload.ToDate).format("YYYY-MM-DD"),
            };

            const res = await axiosInstance.post(
                "Equipment/GetExcelData",
                finalPayload
            );

            const response = Array.isArray(res?.data?.message)
                ? res?.data?.message
                : Array.isArray(res?.data?.data)
                    ? res?.data?.data
                    : [];

            if (response.length > 0) {
                ExportToExcel(response, "EquipmentTransfer.xls");
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
            setExcelFunction(() => saveExcel);
        }
    }, [payload.FromDate, payload.ToDate]);
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
    return (
        <>
            <div className="card">
                <Accordion
                    name={t("Centre to Other Centre Transfer")}
                    defaultValue={true}
                    isBreadcrumb={true}

                >
                    <form onSubmit={handlesubmit}>
                        <div className="row p-2 d-flex align-items-center">

                            <ReactSelect
                                name="fromCenterId"
                                id="fromCenterId"
                                removeIsClearable={true}
                                className={`required-fields ${errors?.fromCenterId ? "required-fields-active" : ""}`}
                                isShowBorder={true}
                                dynamicOptions={centredata}
                                value={payload.fromCenterId}
                                onChange={handleReactChange}
                                placeholderName="Source Centre"
                                respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
                            />
                            <ReactSelect
                                name="machine"
                                id="machine"
                                removeIsClearable={true}
                                isShowBorder={true}
                                dynamicOptions={equipmentdata}
                                value={payload.machine}
                                onChange={handleReactChange}
                                className={`required-fields ${errors?.machine ? "required-fields-active" : ""}`}
                                placeholderName="EquipmentMaster"
                                respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
                            />

                            <ReactSelect
                                name="toCenterId"
                                id="toCenterId"
                                removeIsClearable={true}
                                className={`required-fields ${errors?.toCenterId ? "required-fields-active" : ""}`}
                                isShowBorder={true}
                                dynamicOptions={centredata}
                                value={payload.toCenterId}
                                onChange={handleReactChange}
                                placeholderName="Destination Centre"
                                respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
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

                            <DatePicker
                                className="custom-calendar"
                                name="transferDate"
                                placeholder=" "
                                id="transferDate"
                                lable="DateOfTransfer"
                                respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
                                value={payload?.transferDate}
                                onChange={dateSelect}

                            />
                            <ReactSelect
                                name="equipmentCondition"
                                id="equipmentCondition"
                                removeIsClearable={true}
                                className={`required-fields ${errors?.equipmentCondition ? "required-fields-active" : ""}`}
                                isShowBorder={true}
                                dynamicOptions={EquipmentCondition}
                                value={payload.equipmentCondition}
                                onChange={handleReactChange}
                                placeholderName="Equipment Condition"
                                respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
                            />
                            {["Other"]?.includes(payload?.equipmentCondition) && (
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

                            <Input
                                type="text"
                                // placeholder="NewMachineName"
                                lable={t("New Machine Name")}
                                    className={`required-fields ${errors?.equipmentId ? "required-fields-active" : ""}`}
                                id="equipmentId"
                                name="equipmentId"
                                value={payload?.equipmentId}
                                onChange={handleChange}
                                respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
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
                            {isEditMode ? (
                                <>
                                    <CustomButton
                                        text={"Update"}
                                         icon={"edit"}
                                        className="ml-2"
                                        onClick={handleUpdate}
                                    />
                                    <CustomButton
                                        text={"Cancel"}
                                        icon={"times"}
                                        className="ml-2"
                                        onClick={() => {
                                            setIsEditMode(false);
                                            setEditingId(null);
                                            setPayload({
                                                equipmentId: "",
                                                fromCenterId: "",
                                                toCenterId: "",
                                                transferDate: new Date(),
                                                equipmentCondition: "",
                                                remarks: "",
                                                transferReason: "",
                                                machine: "",
                                                FromDate: new Date(),
                                                ToDate: new Date()
                                            });
                                        }}
                                    />
                                </>
                            ) : (
                                <CustomButton
                                    text={"Save"}
                                    icon={"save"}
                                    className="ml-2"
                                    onClick={dialogSave}
                                />
                            )}
                            <CustomButton
                                text={"Search"}
                                icon={"search"}
                                className="ml-2"
                                onClick={handleSearch}
                            />
                        </div>
                    </form>

                </Accordion>
            </div>
        </>
    )
});

CentreToCentre.displayName = 'CentreToCentre';

export default CentreToCentre
