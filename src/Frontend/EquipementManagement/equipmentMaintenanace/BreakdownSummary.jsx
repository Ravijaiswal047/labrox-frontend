import React, { useEffect, useState } from 'react'
import Heading from '../../../components/UI/Heading'
import ReactSelect from '../../../components/formComponent/ReactSelect'
import Input from '../../../components/formComponent/Input'
import { useTranslation } from 'react-i18next'
import DatePicker from '../../../components/formComponent/DatePicker'
import TimePicker from '../../../components/formComponent/TimePicker'
import Tooltip from '../../../components/formComponent/Tooltip'
import FilterInput from '../../../components/Filter/FilterInput'
import excelicon from '../../Images/excelicon.png'
import CustomTable from '../../../components/Table/CustomTable'
import ColorCodingSearch from "../../../components/ModalComponent/ColorCodingSearch";
import EquipmentDashboard from '../equipmentDashboard/EquipmentDashboard'
import VirtualDepartment from '../virtualDepartment/VirtualDepartment'
import EquipmentMaster from '../equipmentMaster/EquipmentMaster'
import EquipementMaintenance from './EquipementMaintenance'
import EquipmentTransfer from '../equipmentTransfer/EquipmentTransfer'
import SeeMore from '../../SampleStorage/frameMenu/SeeMore'
import { useNavigate } from 'react-router-dom'
import { ViewMenu } from '../../../components/SvgIcons'
import { axiosInstance, axiosReport } from '../../../utils/axiosInstance'
import { apiUrls } from '../../../utils/apiUrls'
import moment from 'moment'
import { toast } from 'react-toastify'
import { ExportToExcel } from '../../../utils/helpers'
import { notify } from '../../../utils/utils'

const BreakdownSummary = () => {
    const { t } = useTranslation();
    const today = new Date();
    const [filterInputValue, setFilterInputValue] = useState("");
    const [filterTableData, setFilterTableData] = useState([]);
    const [equipmentdata, setequipmentdata] = useState([]);
    const [centredata, setcentredata] = useState([]);
    const [tabledata, settabledata] = useState([]);
    const navigate = useNavigate();
    const [showMore, setShowMore] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
      const [errors, setErrors] = useState({});
    const [payload, setPayload] = useState({
        EquipmentID: '',
        CentreID: '',
        LabID: '',
        EquipmentSerialNo: '',
        EquipmentModel: '',
        MaintananceFrequency: '',
        MaintananceMake: '',
        ServiceCompContact: '',
        EquipmentInstallDate: new Date(),
        Email: '',
        BreakdownDate: new Date(),
        BreakdownTime: '',
        BreakdownDetail: '',
        CommunicationDate: new Date(),
        CommunicationTime: '',
        CommunicationTo: '',
        ComplaintRefNo: '',
        ComplaintDate: new Date(),
        ComplaintTime: '',
        EngAttendDate: new Date(),
        EngAttendMode: '',
        EquipmentUptimeDate: new Date(),
        EquipmentUptime: '',
        ImpactSampleProLab: '',
        ImpactSampleSentOther: '',
        DiscribedByEngg: '',
        PathcareObservation: '',
        CorrectActTaken: '',
        Remarks: '',
        EQPName: '',
        CentreName: ''
    })
    console.log("centredata", centredata);
    const colorCodingData = [
        { color: "#f6faf6", id: "2", labelKey: "Up-Equipment", status: "Up" },
        { color: "#fa09b2", id: "3", labelKey: "Down-Equipment", status: "Down" },
        { color: "#f30909", id: "4", labelKey: "To be Installed", status: "ToBeInstalled", border: "1px solid #333" },
    ];

    // Function to get color based on equipment status
    const getStatusColor = (equipmentStatus) => {
        const status = String(equipmentStatus).toLowerCase().trim();
        
        if (status.includes("up") || status === "1") {
            return "#fbfcf8"; // Green
        } else if (status.includes("down") || status === "0") {
            return "#fa09b2"; // Pink
        } else if (status.includes("install") || status === "2") {
            return "#FFFFFF"; // White
        }
        return "transparent";
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
                let value = data.map((ele) => {
                    return {
                        value: ele.CentreID,
                        label: ele.Centre,
                        DefaultCentreId: ele.DefaultCentreId,
                    };
                });
                state(value);
            })
            .catch((err) => {
                console.error(err);
            });
    };
    useEffect(() => {
        getCentreDetails(setcentredata);
    }, [])
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
    useEffect(() => {
        fetchequipmentdata();
        // fetchAllCenter();

    }, [])
   const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "ServiceCompContact") {
        const numericValue = value.replace(/\D/g, "").slice(0, 10);

        setPayload((prev) => ({
            ...prev,
            [name]: numericValue,
        }));

        setErrors((prev) => ({
            ...prev,
            [name]: "",
        }));

        return;
    }

    setPayload((prev) => ({
        ...prev,
        [name]: value,
    }));

    setErrors((prev) => ({
        ...prev,
        [name]: "",
    }));
};

    const resetForm = () => {
        setPayload({
            id: '',
            EquipmentID: '',
            CentreID: '',
            LabID: '',
            EquipmentSerialNo: '',
            EquipmentModel: '',
            MaintananceFrequency: '',
            MaintananceMake: '',
            ServiceCompContact: '',
            EquipmentInstallDate: new Date(),
            Email: '',
            BreakdownDate: new Date(),
            BreakdownTime: '',
            BreakdownDetail: '',
            CommunicationDate: new Date(),
            CommunicationTime: '',
            CommunicationTo: '',
            ComplaintRefNo: '',
            ComplaintDate: new Date(),
            ComplaintTime: '',
            EngAttendDate: new Date(),
            EngAttendMode: '',
            EquipmentUptimeDate: new Date(),
            EquipmentUptime: '',
            ImpactSampleProLab: '',
            ImpactSampleSentOther: '',
            DiscribedByEngg: '',
            PathcareObservation: '',
            CorrectActTaken: '',
            Remarks: '',
            EQPName: '',
            CentreName: ''
        });
        setIsEditMode(false);
    };

    // const handleEditClick = (rowData) => {
    //     // Parse dates from the row data
    //     const parsedPayload = {
    //         id: rowData?.id || '',
    //         EquipmentID: rowData?.itemid || '',
    //         CentreID: rowData?.centerId || '',
    //         LabID: rowData?.lab || '',
    //         EquipmentSerialNo: rowData?.eqSerialNo || '',
    //         EquipmentModel: rowData?.eqModel || '',
    //         MaintananceFrequency: rowData?.preventiveFrequency || '',
    //         MaintananceMake: rowData?.eqMake || '',
    //         ServiceCompContact: rowData?.contactSrvComp || '',
    //         EquipmentInstallDate: rowData?.eqInstallDate ? new Date(rowData?.eqInstallDate) : new Date(),
    //         Email: rowData?.email || '',
    //         BreakdownDate: rowData?.brDate ? new Date(rowData?.brDate) : new Date(),
    //         BreakdownTime: rowData?.brTime || '',
    //         BreakdownDetail: rowData?.breakDownDetail || '',
    //         CommunicationDate: rowData?.commSentdate ? new Date(rowData?.commSentdate) : new Date(),
    //         CommunicationTime: rowData?.commtime || '',
    //         CommunicationTo: rowData?.commSentto || '',
    //         ComplaintRefNo: rowData?.refno || '',
    //         ComplaintDate: rowData?.complaintDate ? new Date(rowData?.complaintDate) : new Date(),
    //         ComplaintTime: rowData?.comptime || '',
    //         EngAttendDate: rowData?.engAttDate ? new Date(rowData?.engAttDate) : new Date(),
    //         EngAttendMode: rowData?.engAttMode || '',
    //         EquipmentUptimeDate: rowData?.eqUpDate ? new Date(rowData?.eqUpDate) : new Date(),
    //         EquipmentUptime: rowData?.upTime || '',
    //         ImpactSampleProLab: rowData?.sampNotLab || '',
    //         ImpactSampleSentOther: rowData?.sampSentOther || '',
    //         DiscribedByEngg: rowData?.describeEng || '',
    //         PathcareObservation: rowData?.observePathcare || '',
    //         CorrectActTaken: rowData?.correctAction || '',
    //         Remarks: rowData?.remarks || '',
    //         EQPName: rowData?.eq_name || '',
    //         CentreName: rowData?.centre || ''
    //     };
    //     setPayload(parsedPayload);
    //     setIsEditMode(true);
    //     window.scrollTo(0, 0);
    // };
    
    const handleEditClick = async (rowData) => {

    console.log("EDIT DATA", rowData);

    const normalizeName = (str) => String(str || "").replace(/[~-]/g, "").trim().toLowerCase();

    // centre dropdown selected object
    const matchingCentre = centredata?.find(
        (item) =>
            normalizeName(item?.label) ===
            normalizeName(rowData?.Centre)
    );

    // machine list load
    let currentEquipmentData = equipmentdata;
    if (matchingCentre?.value) {
        currentEquipmentData = await getMachineList(matchingCentre?.value);
    }

    // equipment dropdown selected object
    const matchingEquipment = currentEquipmentData?.find(
        (item) =>
            normalizeName(item?.label) ===
            normalizeName(rowData?.eq_name)
    );

    const parsedPayload = {

        id: rowData?.id || "",

        EquipmentID:
            matchingEquipment?.value || "",

        CentreID:
            matchingCentre?.value || "",

        LabID:
            rowData?.lab || "",

        EquipmentSerialNo:
            rowData?.eq_serialno || "",

        EquipmentModel:
            rowData?.eq_model || "",

        MaintananceFrequency:
            rowData?.Preventive_frequency || "",

        MaintananceMake:
            rowData?.eq_make || "",

        ServiceCompContact:
            rowData?.Contact_srv_comp || "",

        EquipmentInstallDate:
            rowData?.eq_instlldate
                ? moment(
                      rowData?.eq_instlldate,
                      "DD-MMM-YYYY"
                  ).toDate()
                : new Date(),

        Email:
            rowData?.EmailId || "",
            

        BreakdownDate:
            rowData?.br_date
                ? moment(
                      rowData?.br_date,
                      "DD-MMM-YYYY"
                  ).toDate()
                : new Date(),

        BreakdownTime:
            rowData?.br_time || "",

        BreakdownDetail:
            rowData?.br_detail || "",

        CommunicationDate:
            rowData?.comm_date
                ? moment(
                      rowData?.comm_date,
                      "DD-MMM-YYYY"
                  ).toDate()
                : new Date(),

        CommunicationTime:
            rowData?.comm_time || "",

        CommunicationTo:
            rowData?.comm_to || "",

        ComplaintRefNo:
            rowData?.comp_refno || "",

        ComplaintDate:
            rowData?.comp_date
                ? moment(
                      rowData?.comp_date,
                      "DD-MMM-YYYY"
                  ).toDate()
                : new Date(),

        ComplaintTime:
            rowData?.comp_time || "",

        EngAttendDate:
            rowData?.eng_att_date
                ? moment(
                      rowData?.eng_att_date,
                      "DD-MMM-YYYY"
                  ).toDate()
                : new Date(),

        EngAttendMode:
            rowData?.eng_att_mode || "",

        EquipmentUptimeDate:
            rowData?.eq_up_date
                ? moment(
                      rowData?.eq_up_date,
                      "DD-MMM-YYYY"
                  ).toDate()
                : new Date(),

        EquipmentUptime:
            rowData?.eq_up_time || "",

        ImpactSampleProLab:
            rowData?.imp_samp_not || "",

        ImpactSampleSentOther:
            rowData?.imp_sent_oth || "",

        DiscribedByEngg:
            rowData?.rt_discribe_eng || "",

        PathcareObservation:
            rowData?.rt_obs_path || "",

        CorrectActTaken:
            rowData?.corr_act_taken || "",

        Remarks:
            rowData?.remarks || "",

        EQPName:
            rowData?.eq_name || "",

        CentreName:
            rowData?.Centre || "",
    };

    console.log("parsedPayload", parsedPayload);

    setPayload(parsedPayload);

    setIsEditMode(true);

    window.scrollTo({
        top: 0,
        behavior: "smooth",
    });
};
  const printReport = (id) => {
    if (!id) {
        toast.error("Record ID not found");
        return;
    }
    axiosReport
        .post(`NPLReport/GetHistoryCard`, { id: String(id) })  // Remove responseType: "blob"
        .then((res) => {
            const url = res?.data?.url;
            if (url) {
                window.open(url, "_blank");
            } else {
                toast.error("PDF URL not found in response");
            }
        })
        .catch((err) => {
            toast.error(err?.response?.data?.message || "Failed to open PDF");
        });
};
  //email 
  const handleEmail = (rowData) => {
    if (!rowData?.EmailId) {
        toast.error("Email ID not found");
        return;
    }

    const emailPayload = {
        equipmentName: rowData?.eq_name || "",
        installDate: rowData?.eq_instlldate || "",
        centre: rowData?.centre || "",
        lab: rowData?.lab || "",
        refNo: rowData?.comp_refno || "",
        eng_Att_Date: rowData?.eng_att_date || "",
        conct_Srv_Comp: rowData?.Contact_srv_comp || "",
        rt_Discribe_Eng: rowData?.rt_discribe_eng || "",
        rt_Obs_Path: rowData?.rt_obs_path || "",
        corr_Action_Taken: rowData?.corr_act_taken || "",
        emailId: rowData?.EmailId || ""
    };

    axiosInstance
        .post("Equipment/BreakDownSendMail", emailPayload)
        .then((res) => {
            if (res?.data?.success) {
                toast.success(res?.data?.message || "Email sent successfully");
            } else {
                toast.error(res?.data?.message || "Failed to send email");
            }
        })
        .catch((err) => {
            toast.error(err?.response?.data?.message || "Failed to send email");
        });
  }
    const handlereactchange = (name, e) => {
        if(name === "CentreID"){
             getMachineList(e.value);
             setPayload((prev) => ({ 
                 ...prev, 
                 EquipmentID: "", 
                 EQPName: "",
                 CentreID: e?.value,
                 CentreName: e?.label
             }));
             setErrors((prev) => ({ ...prev, CentreID: "", EquipmentID: "" }));
        } else {
            console.log("selectedOption", e, "name", name);
            setPayload((prev) => ({
                ...prev,
                [name]: e?.value,
                ...(name === "EquipmentID" ? { EQPName: e?.label } : {})
            }));
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }

    };

    // Validate form sequentially and show only the first error
    const validateForm = () => {
        // gmail email regex
        const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

        // Sequence of validations
        if (!payload?.CentreID) {
            setErrors({ CentreID: true });
            notify("Please select Centre", "error");
            return false;
        }
        if (!payload?.EquipmentID) {
            setErrors({ EquipmentID: true });
            notify("Please select Equipment", "error");
            return false;
        }
        if (!payload?.BreakdownDetail || String(payload?.BreakdownDetail).trim() === "") {
            setErrors({ BreakdownDetail: true });
            notify("Breakdown Detail is required", "error");
            return false;
        }
        if (!payload?.Email || String(payload?.Email).trim() === "") {
            setErrors({ Email: true });
            notify("Email is required", "error");
            return false;
        }
        if (!emailRegex.test(String(payload?.Email))) {
            setErrors({ Email: true });
            notify("Please enter valid gmail address", "error");
            return false;
        }

        // all good
        setErrors({});
        return true;
    };
    const getPayloadTimeFormate = (payLoadTime) => {
        // Handle empty or null values
        if (!payLoadTime || payLoadTime === '') {
            return "00:00:00";
        }
        
        // Check if it's already in HH:mm:ss format
        if (typeof payLoadTime === 'string' && /^\d{2}:\d{2}:\d{2}$/.test(payLoadTime)) {
            return payLoadTime;
        }
        
        // Convert Date/moment object to HH:mm:ss format
        try {
            const result = moment(payLoadTime).toISOString()?.split("T")?.[1]?.split('.')?.[0];
            return result || "00:00:00";
        } catch (error) {
            return "00:00:00";
        }
    }
    const dateselect = (value, name) => {
        setPayload({ ...payload, [name]: value });
    };
    const timeselect = (value, name) => {
        setPayload((prev) => ({ ...prev, [name]: value }));
    };
    // const handlesubmit = async (e) => {
    //     e.preventDefault();

    //     let requestdata = {
    //         transactionType: "Insert",
    //         breakdownID: 0,
    //         equipmentID: payload?.EquipmentID,
    //         centreID: payload?.CentreID,
    //         labID: payload?.LabID,
    //         equipmentSerialNo: payload?.EquipmentSerialNo,
    //         equipmentModel: payload?.EquipmentModel,
    //         maintananceFrequency: payload?.MaintananceFrequency,
    //         maintananceMake: payload?.MaintananceMake,
    //         serviceCompContact: payload?.ServiceCompContact,
    //         equipmentInstallDate: payload?.EquipmentInstallDate,
    //         email: payload?.Email,
    //         attachment: "",
    //         breakdownDetail: payload?.BreakdownDetail,
    //         breakdownDate: payload?.BreakdownDate,
    //         // breakdownTime: payload?.BreakdownTime,
    //         breakdownTime: getPayloadTimeFormate(payload?.BreakdownTime),
    //         communicationDate: payload?.CommunicationDate,
    //         // 2025-09-03T11:14:28.690Z"
    //         communicationTime: getPayloadTimeFormate(payload?.CommunicationTime),
    //         communicationTo: payload?.CommunicationTo,
    //         complaintRefNo: payload?.ComplaintRefNo,
    //         complaintDate: payload?.ComplaintDate,
    //         complaintTime: getPayloadTimeFormate(payload?.ComplaintTime),
    //         engAttendDate: payload?.EngAttendDate,
    //         equipmentUptimeDate: payload?.EquipmentUptimeDate,
    //         equipmentUptime: getPayloadTimeFormate(payload?.EquipmentUptime),
    //         engAttendMode: payload?.EngAttendMode,
    //         impactSampleProLab: payload?.ImpactSampleProLab,
    //         impactSampleSentOther: payload?.ImpactSampleSentOther,
    //         discribedByEngg: payload?.DiscribedByEngg,
    //         pathcareObservation: payload?.PathcareObservation,
    //         remarks: payload?.Remarks,
    //         correctActTaken: payload?.CorrectActTaken
    //     };


    //     try {
    //         const resp = await axiosInstance.post(apiUrls?.savebreakdown, requestdata);
    //         console.log(resp.data.data);

    //         if (resp?.data?.success === true) {
    //             // dispatch(setRefreshLoad(!refreshLoad))
    //             notify(resp?.data?.message, "success");
    //             // setPayload({
    //             //     equipmentId: "",
    //             //     expectedReturnDate: "",
    //             //     transferDate: "",
    //             //     equipmentCondition: "",
    //             //     transferReason: "",
    //             //     remarks: "",
    //             //     handoverToName: "",
    //             //     designationName: "",
    //             //     mobile: "",
    //             //     email: ''
    //             // });
    //             // fetchequipmentdata();
    //         } else {

    //             notify(resp?.data?.message || "Insert failed", "error");
    //         }

    //     } catch (error) {
    //         console.log(error);
    //         notify(error?.response?.data?.message || "Insert failed", "error");
    //     }
    // };
const handleSave = () => {
    // run client-side sequential validation first
    if (!validateForm()) return;

    const finalPayload = {
        id: payload?.id || 0,

        equipmentName: String(payload?.EQPName || ""),
        itemId: String(payload?.EquipmentID || ""),

        centre: String(payload?.CentreName || ""),
        centreId: String(payload?.CentreID || ""),

        equipmentSerialNo: String(payload?.EquipmentSerialNo || ""),
        equipmentModel: String(payload?.EquipmentModel || ""),
        equipmentMake: String(payload?.MaintananceMake || ""),

        equipmentInstallDate: payload?.EquipmentInstallDate
            ? moment(payload?.EquipmentInstallDate).format("YYYY-MM-DD")
            : "",

        lab: String(payload?.LabID || ""),

        maintenanceFrequency: String(payload?.MaintananceFrequency || ""),

        serviceCompContact: String(payload?.ServiceCompContact || ""),

        email: String(payload?.Email || ""),

        // ── Breakdown Details ──
        breakdownDate: payload?.BreakdownDate
            ? moment(payload?.BreakdownDate).format("YYYY-MM-DD")
            : "",
        breakdownTime: getPayloadTimeFormate(payload?.BreakdownTime),
        breakdownDetail: String(payload?.BreakdownDetail || ""),

        // ── Communication Details ──
        communicationDate: payload?.CommunicationDate
            ? moment(payload?.CommunicationDate).format("YYYY-MM-DD")
            : "",
        communicationTime: getPayloadTimeFormate(payload?.CommunicationTime),
        toWhom: String(payload?.CommunicationTo || ""),

        // ── Complain Log Details ──
        complaintRefNo: String(payload?.ComplaintRefNo || ""),
        complaintDate: payload?.ComplaintDate
            ? moment(payload?.ComplaintDate).format("YYYY-MM-DD")
            : "",
        complaintTime: getPayloadTimeFormate(payload?.ComplaintTime),
        engAttDate: payload?.EngAttendDate
            ? moment(payload?.EngAttendDate).format("YYYY-MM-DD")
            : "",
        engAttMode: String(payload?.EngAttendMode || ""),

        // ── Equipment Uptime Details ──
        equipmentUptimeDate: payload?.EquipmentUptimeDate
            ? moment(payload?.EquipmentUptimeDate).format("YYYY-MM-DD")
            : "",
        equipmentUptimeTime: getPayloadTimeFormate(payload?.EquipmentUptime),

        // ── Impact ──
        sampleNotProLab: String(payload?.ImpactSampleProLab || ""),
        sampleSentOtherLab: String(payload?.ImpactSampleSentOther || ""),

        // ── Root Cause Analysis ──
        describedByEng: String(payload?.DiscribedByEngg || ""),
        pathcareObservation: String(payload?.PathcareObservation || ""),
        correctActTaken: String(payload?.CorrectActTaken || ""),
        remarks: String(payload?.Remarks || ""),

        // ── Status ──
        isEquipmentUp: "1",
    };
    console.log("finalPayload", finalPayload);

    axiosInstance
        .post("Equipment/BrSmrySaveData", finalPayload)
        .then((res) => {
            if (res?.data?.success) {
                toast.success(
                    res?.data?.message ||
                    "Equipment Saved Successfully"
                );

                fetchbreakdowndata();

            } else {
                toast.error(
                    res?.data?.message || "Save Failed"
                );
            }
        })
        .catch((err) => {
            toast.error(
                err?.response?.data?.message ||
                "Failed To Save"
            );
        });
};

const handleUpdate = () => {
    // run client-side sequential validation first
    if (!validateForm()) return;

    const finalPayload = {
        id: payload?.id || 0,

        equipmentName: String(payload?.EQPName || ""),
        itemId: String(payload?.EquipmentID || ""),

        centre: String(payload?.CentreName || ""),
        centreId: String(payload?.CentreID || ""),

        equipmentSerialNo: String(payload?.EquipmentSerialNo || ""),
        equipmentModel: String(payload?.EquipmentModel || ""),
        equipmentMake: String(payload?.MaintananceMake || ""),

        equipmentInstallDate: payload?.EquipmentInstallDate
            ? moment(payload?.EquipmentInstallDate).format("YYYY-MM-DD")
            : "",

        lab: String(payload?.LabID || ""),

        maintenanceFrequency: String(payload?.MaintananceFrequency || ""),

        serviceCompContact: String(payload?.ServiceCompContact || ""),

        email: String(payload?.Email || ""),

        // ── Breakdown Details ──
        breakdownDate: payload?.BreakdownDate
            ? moment(payload?.BreakdownDate).format("YYYY-MM-DD")
            : "",
        breakdownTime: getPayloadTimeFormate(payload?.BreakdownTime),
        breakdownDetail: String(payload?.BreakdownDetail || ""),

        // ── Communication Details ──
        communicationDate: payload?.CommunicationDate
            ? moment(payload?.CommunicationDate).format("YYYY-MM-DD")
            : "",
        communicationTime: getPayloadTimeFormate(payload?.CommunicationTime),
        toWhom: String(payload?.CommunicationTo || ""),

        // ── Complain Log Details ──
        complaintRefNo: String(payload?.ComplaintRefNo || ""),
        complaintDate: payload?.ComplaintDate
            ? moment(payload?.ComplaintDate).format("YYYY-MM-DD")
            : "",
        complaintTime: getPayloadTimeFormate(payload?.ComplaintTime),
        engAttDate: payload?.EngAttendDate
            ? moment(payload?.EngAttendDate).format("YYYY-MM-DD")
            : "",
        engAttMode: String(payload?.EngAttendMode || ""),

        // ── Equipment Uptime Details ──
        equipmentUptimeDate: payload?.EquipmentUptimeDate
            ? moment(payload?.EquipmentUptimeDate).format("YYYY-MM-DD")
            : "",
        equipmentUptimeTime: getPayloadTimeFormate(payload?.EquipmentUptime),

        // ── Impact ──
        sampleNotProLab: String(payload?.ImpactSampleProLab || ""),
        sampleSentOtherLab: String(payload?.ImpactSampleSentOther || ""),

        // ── Root Cause Analysis ──
        describedByEng: String(payload?.DiscribedByEngg || ""),
        pathcareObservation: String(payload?.PathcareObservation || ""),
        correctActTaken: String(payload?.CorrectActTaken || ""),
        remarks: String(payload?.Remarks || ""),

        // ── Status ──
        isEquipmentUp: "1",
    };

    console.log("Update Payload", finalPayload);

    axiosInstance
        .post("Equipment/BrSmryUpdateData", finalPayload)
        .then((res) => {
            if (res?.data?.success) {
                toast.success(
                    res?.data?.message ||
                    "Data Updated Successfully"
                );

                fetchbreakdowndata();
                resetForm();
            } else {
                toast.error(
                    res?.data?.message || "Update Failed"
                );
            }
        })
        .catch((err) => {
            toast.error(
                err?.response?.data?.message ||
                "Failed To Update"
            );
        });
};
const saveExcel = (EQPName) => {
    if (!EQPName) {
        toast.error("Please select Equipment first");
        return;
    }
    axiosInstance
      .post("Equipment/ExcelReport", {}, { params: { EQPName: EQPName } })
      .then((res) => {
        if (res?.data?.message?.length > 0) {
          ExportToExcel(res?.data?.message, `${EQPName}.xls`);
        } else {
          toast?.error("Data not Found");
        }
      })
      .catch((err) => {
        console.error(err?.response?.data?.message || "Error Occurred");
      });
  };
 
   const getMachineList = async (centreId) => {
       return await axiosInstance
         .post("Equipment/BindMachinId", {}, { params: { centerID: centreId } })
         .then((res) => {
           if (res?.data?.success) {
             const rawData = Array.isArray(res?.data?.message) ? res?.data?.message : [];
             const resList = rawData.map((item) => ({
               ...item,
               label: item?.eq_name,
               value: item?.itemid,
             }));
             setequipmentdata(resList);
             return resList;
           }
           return [];
         })
         .catch((err) => {
             console.error(err);
             return [];
         });
     };
  
  const tableApi=()=>{
    const finalPayload={
        isEquipmentup: "1",
        eqp_Name: String(payload?.EQPName) || "",
    }
    axiosInstance
          .post("Equipment/EqBrkSearchData",finalPayload )
          .then((resp) => {
            const list = resp?.data?.message;
            if (Array.isArray(list)) {
             settabledata(list);
             setFilterTableData(list);
            } else {
              settabledata([]);
                setFilterTableData([]);
            }
          })
          .catch(console.error);
  }
//   useEffect(() => {
//     tableApi();
//   }, [])

    const fetchbreakdowndata = () => {
        axiosInstance.get("Equipment/GetEquipmentBreakdownLogData", {
            params: {
                p_type: "BreakdownSummary",
                p_id: 0
            }
        })
            .then((resp) => {
                console.log(resp);
                const msg = resp?.data?.message;
                settabledata(Array.isArray(msg) ? msg : []);
            })
            .catch((error) => {
                console.error(error);
                settabledata([]);
                setFilterTableData([]);
            });
    };
    useEffect(() => {
        fetchbreakdowndata();
    }, [])
    const seeMoreData = [
        {
            name: "Equipment Dashboard",
            component: <EquipmentDashboard setShowMore={setShowMore} />,
            url: "/equipmentmanager/equipment-dashboard",
        },
        {
            name: "Virtual Department Master",
            component: <VirtualDepartment setShowMore={setShowMore} />,
            url: "/equipmentmanager/virtual-department",
        },
        {
            name: "Equipment Master",
            component: <EquipmentMaster setShowMore={setShowMore} />,
            url: "/equipmentmanager/equipment-master",
        },
        {
            name: "Equipment Maintenance",
            component: <EquipementMaintenance setShowMore={setShowMore} />,
            url: "/equipmentmanager/equipment-maintanance",
        },
        {
            name: "Equipment Transfer",
            component: <EquipmentTransfer setShowMore={setShowMore} />,
            url: "/equipmentmanager/equipment-transfer",
        },
        {
            name: "Breakdown Summary",
            component: <BreakdownSummary setShowMore={setShowMore} />,
            url: "/equipmentmanager/breakdown-summary",
        },
        {
            name: "Equipment Management Hub",
            component: null,
            url: "/equipmentmanager/equipment-hub",
        },
    ];
    const tableHeaders = [
        { header: "Equipment Name", field: "eq_name" },
        { header: "EquipmentInstallation Date", field: "eq_instlldate" },
        { header: "Centre", field: "centre" },
        { header: "Lab", field: "lab" },
        { header: "Complaint Ref no", field: "comp_refno" },
        { header: "Engineering Attentded Date", field: "eng_att_date" },
        { header: "Contact of Service Company", field: "Contact_srv_comp" },
        { header: "Corrective Action Taken", field: "corr_act_taken" },
        { header: "Equipment Status", field: "EquipmentStatus" },

        { header: "Created Date", field: "createdDate" },
        { header: "Created By", field: "CreatedByName" },
        { header: "LastUpdated Date", field: "lastUpdatedDate" },
        { header: "LastUpdated By", field: "lastUpdatedBy" },
        { header: "View", field: "view" },
        { header: "Action", field: "action" },
        { header: "SendEmail", field: "sendEmail" },
    ]

    const handleFilterInputChange = (e) => {
        const value = e.target.value.toLowerCase();
        setFilterInputValue(value);

        // Filter rows based on search term matching any field
        const filtered = tabledata.filter((row) =>
            Object.keys(row).some((key) =>
                String(row[key] || "").toLowerCase().includes(value)
            )
        );

        setFilterTableData(filtered);
    };
    // useEffect(() => {
    //     setFilterTableData(tableData);
    // }, []);
    return (
        <>
            {showMore && (
                <SeeMore
                    seeMore={seeMoreData}
                    handleChangeComponent={(item) => {
                        setShowMore(false);
                        navigate(item?.url);
                    }}
                    setShowMore={setShowMore}
                />
            )}
            <div className="card">
                <Heading name="Breakdown Summary" isBreadcrumb={true}
                    secondTitle={
                        <>
                            <label onClick={() => setShowMore((prev) => !prev)}>
                                <ViewMenu />
                            </label>
                        </>
                    }

                />
                <div className="row p-2 d-flex align-items-center">
                    <ReactSelect
                        name="CentreID"
                        id="CentreID"
                        removeIsClearable={true}
                        className={`required-fields ${errors?.CentreID ? "required-fields-active" : ""}`}
                        isShowBorder={true}
                        dynamicOptions={centredata}
                        value={payload?.CentreID}
                        onChange={handlereactchange}
                        placeholderName="Centre"
                        respclass="col-xl-2 col-sm-4 col-md-6 col-12"
                    />
                    <ReactSelect
                        name="EquipmentID"
                        id="EquipmentID"
                        removeIsClearable={true}
                        className={`required-fields ${errors?.EquipmentID ? "required-fields-active" : ""}`}
                        isShowBorder={true}
                        dynamicOptions={equipmentdata}
                        value={payload?.EquipmentID}
                        onChange={handlereactchange}
                        placeholderName="Equipment Name"
                        respclass="col-xl-2 col-sm-4 col-md-6 col-12"
                    />
                    <Input
                        type="text"
                        placeholder=" "
                        lable={t("Equipment Serial No")}
                        className={`required-fields ${errors?.EquipmentSerialNo ? "required-fields-active" : ""}`}
                        id="EquipmentSerialNo"
                        name="EquipmentSerialNo"
                        value={payload?.EquipmentSerialNo}
                        onChange={handleChange}
                        respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
                    />
                    <Input
                        type="text"
                        placeholder=" "
                        lable={t("Lab")}
                        id="LabID"
                        name="LabID"
                        value={payload?.LabID}
                        onChange={handleChange}
                        respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
                    />
                    <Input
                        type="text"
                        placeholder=" "
                        lable={t("Equipment Model")}
                        id="EquipmentModel"
                        name="EquipmentModel"
                        value={payload?.EquipmentModel}
                        onChange={handleChange}
                        respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
                    />
                    <Input
                        type="text"
                        placeholder=" "
                        lable={t("Maintenance Frequency")}
                        id="MaintananceFrequency"
                        name="MaintananceFrequency"
                        value={payload?.MaintananceFrequency}
                        onChange={handleChange}
                        respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
                    />
                    <Input
                        type="text"
                        placeholder=" "
                        lable={t("Equipment Make")}
                        id="MaintananceMake"
                        name="MaintananceMake"
                        value={payload?.MaintananceMake}
                        onChange={handleChange}
                        respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
                    />
                    <Input
                        type="text"
                        placeholder=" "
                        lable={t("Service Comp Contact")}
                        maxLength={10}
                        id="ServiceCompContact"
                        name="ServiceCompContact"
                        value={payload?.ServiceCompContact}
                        onChange={handleChange}
                        respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
                    />
                    <DatePicker
                        className="custom-calendar"
                        name="equipmentInstallDate"
                        placeholder="Equipment Install Date"
                        id="equipmentInstallDate"
                        lable="Equipment Install Date"
                        value={payload?.EquipmentInstallDate}
                        onChange={dateselect}
                        respclass="col-xl-2 col-sm-4 col-md-6 col-12"
                    />
                    <Input
                        type="text"
                        placeholder=" "
                        lable={t("Email")}
                         className={`required-fields ${errors?.Email ? "required-fields-active" : ""}`}
                        id="Email"
                        name="Email"
                        value={payload?.Email}
                        onChange={handleChange}
                        respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
                    />
                </div>
                <Heading name="Breakdown Details" isBreadcrumb={true} />
                <div className="row p-2 d-flex align-items-center">
                    <DatePicker
                        className="custom-calendar"
                        name="BreakdownDate"
                        placeholder="Breakdown Date"
                        id="BreakdownDate"
                        lable="Breakdown Date"
                        value={payload?.BreakdownDate}
                        onChange={dateselect}
                        respclass="col-xl-2 col-sm-4 col-md-6 col-12"
                    />
                    <TimePicker
                        name="BreakdownTime"
                        placeholder="BreakdownTime"
                        value={payload?.BreakdownTime}
                        onChange={timeselect}
                        id="BreakdownTime"
                        lable="BreakdownTime"


                    />
                    <Input
                        type="text"
                        placeholder=" "
                        lable={t("Breakdown Detail")}
                        className={`required-fields ${errors?.BreakdownDetail ? "required-fields-active" : ""}`}
                        id="BreakdownDetail"
                        name="BreakdownDetail"
                        value={payload?.BreakdownDetail}
                        onChange={handleChange}
                        respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
                    />
                </div>
                <Heading name="Communication Details" isBreadcrumb={true} />
                <div className="row p-2 d-flex align-items-center">
                    <DatePicker
                        className="custom-calendar"
                        name="CommunicationDate"
                        placeholder="Communication Date"
                        value={payload?.CommunicationDate}
                        onChange={dateselect}
                        id="CommunicationDate"
                        lable="Communication Date"
                        respclass="col-xl-2 col-sm-4 col-md-6 col-12"
                    />
                    <TimePicker
                        name="CommunicationTime"
                        placeholder="CommunicationTime"
                        value={payload?.CommunicationTime}
                        id="Communication Time"
                        onChange={timeselect}
                    />
                    <Input
                        type="text"
                        placeholder=" "
                        lable={t("To Whom")}
                        id="CommunicationTo"
                        name="CommunicationTo"
                        value={payload?.CommunicationTo}
                        onChange={handleChange}
                        respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
                    />
                </div>
                <Heading name="Complain Log Details" isBreadcrumb={true} />
                <div className="row p-2 d-flex align-items-center">
                    <Input
                        type="text"
                        // placeholder="Complaint Ref No"
                        lable={t("Complaint Ref No")}
                        id="ComplaintRefNo"
                        name="ComplaintRefNo"
                        value={payload?.ComplaintRefNo}
                        onChange={handleChange}
                        respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
                    />
                    <DatePicker
                        className="custom-calendar"
                        name="ComplaintDate"
                        placeholder="Complaint Date"
                        id="ComplaintDate"
                        lable="Complaint Date"
                        value={payload?.ComplaintDate}
                        onChange={dateselect}
                        respclass="col-xl-2 col-sm-4 col-md-6 col-12"
                    />
                    <TimePicker
                        name="ComplaintTime"
                        placeholder="ComplaintTime"
                        value={payload?.ComplaintTime}
                        id="ComplaintTime"
                        lable="Complaint Time"
                        onChange={timeselect}
                    />
                    <DatePicker
                        className="custom-calendar"
                        name="EngAttendDate"
                        placeholder="Eng Att Date"
                        id="EngAttendDate"
                        lable="Eng Att Date"
                        value={payload?.EngAttendDate}
                        onChange={dateselect}
                        respclass="col-xl-2 col-sm-4 col-md-6 col-12"
                    />
                    <Input
                        type="text"
                        // placeholder="Eng Att Mode"
                        lable={t("Eng Att Mode")}
                        id="EngAttendMode"
                        name="EngAttendMode"
                        value={payload?.EngAttendMode}
                        onChange={handleChange}
                        respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
                    />
                </div>
                <Heading name="Equipment Uptime Details" isBreadcrumb={true} />
                <div className="row p-2 d-flex align-items-center">
                    <DatePicker
                        className="custom-calendar"
                        name="EquipmentUptimeDate"
                        placeholder="EqpUp Date"
                        id="EquipmentUptimeDate"
                        value={payload?.EquipmentUptimeDate}
                        onChange={dateselect}
                        respclass="col-xl-2 col-sm-4 col-md-6 col-12"
                    />
                    <TimePicker
                        name="EquipmentUptime"
                        placeholder="EquipmentUptime"
                        value={payload?.EquipmentUptime}
                        id="EquipmentUptime"
                        lable="EquipmentUptime"
                        onChange={timeselect}
                    />
                </div>
                <Heading name="Impact" isBreadcrumb={true} />
                <div className="row p-2 d-flex align-items-center">
                    <Input
                        type="text"
                        // placeholder="Sample Not Pro Lab"
                        lable={t("Sample Not Pro Lab")}
                        id="ImpactSampleProLab"
                        name="ImpactSampleProLab"
                        value={payload?.ImpactSampleProLab}
                        onChange={handleChange}
                        respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
                    />
                    <Input
                        type="text"
                        // placeholder="Sample sent other lab"
                        lable={t("Sample sent other lab")}
                        id="ImpactSampleSentOther"
                        name="ImpactSampleSentOther"
                        value={payload?.ImpactSampleSentOther}
                        onChange={handleChange}
                        respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
                    />
                </div>
                <Heading name="Root Cause Analysis" isBreadcrumb={true} />
                <div className="row p-2 d-flex align-items-center">
                    <Input
                        type="text"

                        lable={t("Described by Eng")}
                        id="DiscribedByEngg"
                        name="DiscribedByEngg"
                        value={payload?.DiscribedByEngg}
                        onChange={handleChange}
                        respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
                    />
                    <Input
                        type="text"

                        lable={t("Pathcare Observation")}
                        id="PathcareObservation"
                        name="PathcareObservation"
                        value={payload?.PathcareObservation}
                        onChange={handleChange}
                        respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
                    />
                    <Input
                        type="text"
                        lable={t("Correct act Taken")}
                        id="CorrectActTaken"
                        name="CorrectActTaken"
                        value={payload?.CorrectActTaken}
                        onChange={handleChange}
                        respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
                    />
                    <Input
                        type="text"

                        lable={t("Remarks")}
                        id="Remarks"
                        name="Remarks"
                        value={payload?.Remarks}
                        onChange={handleChange}
                        respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
                    />
                    <div className="col-sm-2 d-flex align-items-center gap-5">
                        <div className='w-100'>
                            <button
                                className="btn btn-sm btn block btn-success px-3"
                                // onClick={handleSave}
                                 onClick={isEditMode ? handleUpdate : handleSave}
                                
                            >
                                {isEditMode ? 'Update' : 'Save'}
                            </button>
                            {isEditMode && (
                                <button
                                    className="btn btn-sm btn block btn-secondary px-3 ml-2"
                                    onClick={resetForm}
                                >
                                    Clear
                                </button>
                            )}
                               <button
                                className="btn btn-sm btn block btn-success px-4 ml-2"
                                onClick={tableApi}
                            >
                                Search
                            </button>
                        </div>



                    </div>
                </div>
                <div className="row">
                    <div
                        style={{ gap: "4px" }}
                        className="d-flex align-items-end  flex-grow-1 justify-content-end my-2 px-2"
                    >
                        <div style={{ gap: "4px" }} className="excel_exp d-flex">

                            {/* <div>
                                <Tooltip position="top" target=".excel-icon" />
                                <img
                                    onClick={() => ExportToExcel(filterTableData)}
                                    src={excelicon}
                                    alt="Export to Excel"
                                    className="excel-icon"
                                    data-pr-tooltip="Export Active Data"
                                    style={{ width: "26px", height: "26px", cursor: "pointer" }}
                                />
                            </div> */}
                        </div>
                        {/* <FilterInput
                            value={filterInputValue}
                            onChange={handleFilterInputChange}
                            placeholder="Filter Table"
                        /> */}
                    </div>
                </div>
                <Heading
                    title={t("View Breakdown Summary")}
                    secondTitle={
                        <>
                            <div>
                                <Tooltip position="top" target=".excel-icon" />
                                <img
                                    onClick={() => saveExcel(payload?.EQPName)}
                                    src={excelicon}
                                    alt="Export to Excel"
                                    className="excel-icon"
                                    data-pr-tooltip="Export Active Data"
                                    style={{ width: "26px", height: "26px", cursor: "pointer" }}
                                />
                            </div>

                            {colorCodingData?.map(({ color, labelKey, id }) => (
                                <ColorCodingSearch
                                    key={id}
                                    color={color}
                                    label={t(labelKey)}
                                    respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
                                //   onClick={() => handleCallViewMedReq(id)}
                                />
                            ))}
                            <FilterInput
                                value={filterInputValue}
                                onChange={handleFilterInputChange}
                                placeholder="Filter Table"
                            />

                        </>
                    }
                />
                <div className="mt-1 table_ticket">
                    <CustomTable
                        columns={tableHeaders}
                        data={(Array.isArray(tabledata) ? tabledata : []).map((itm) => ({
                            ...itm,
                            equipmentName: itm?.EquipmentName,
                            equipmentInstallationDate: itm?.EquipmentInstallDate,
                            centre: itm?.Centre,
                            lab: itm?.lab,
                            ComplaintRefno: itm?.ComplaintRefNo,
                            AttentdedDate: itm?.EngAttendDate,
                            createdDate: itm?.CreatedDate,
                            createdBy: itm?.CreatedByName,
                            lastUpdatedDate: itm?.UpdatedDate,
                            lastUpdatedBy: itm?.UpdatedByName,
                            rowColor: getStatusColor(itm?.EquipmentStatus),
                            sendEmail: (
                                
                                    <i 
                                        className='fa fa-envelope' 
                                        style={{ fontSize: '18px', cursor: 'pointer' }}
                                        onClick={() => handleEmail(itm)}
                                        title="Send Email"
                                    ></i>
                               
                            ),
                            view: (
                                
                                    <i className='fa fa-search' style={{ fontSize: '18px', color: '#0056b3' }}
                                     onClick={() => printReport(itm?.id)}
                                    ></i>
                               
                            ),
                            action: (
                               
                                    <i 
                                        className='fa fa-edit' 
                                        style={{ fontSize: '18px', color: '#0056b3', cursor: 'pointer' }}
                                        onClick={() => handleEditClick(itm)}
                                    ></i>
                                
                            ),  
                        }))}  

                    />
                </div>
            </div>
        </>
    )
}

export default BreakdownSummary
