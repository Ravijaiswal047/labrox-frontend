import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import Input from "../../../components/formComponent/Input"
import { CustomButton, SaveButton } from "../../../components/UI/CustomButton"
import { toast } from "react-toastify"
import DatePicker from "../../../components/formComponent/DatePicker"
import ReactSelect from "../../../components/formComponent/ReactSelect"
import { axiosInstance } from "../../../utils/axiosInstance"
import UploadFile from "../../utils/UploadFileModal/UploadFile"
import { guidNumber } from "../../../utils/generateGuid"
import { getAccessCentresReports, GetGlobalData } from "../../../utils/NetworkApi/commonApi"
import TimePicker from "../../../components/formComponent/TimePicker"
import moment from "moment"

const Incidents = ({ editData, setEditData }) => {
    const [t] = useTranslation()
    const [centre, setCentre] = useState([])
    const [employees, setEmployees] = useState([])
    const [incidentTypes, setIncidentTypes] = useState([])
    const [loading, setLoading] = useState(false)
    const [showFileModal, setShowFileModal] = useState({
        modal: false,
        data: "",
        index: -1,
    });

    console.log("Incident types", incidentTypes)

    const incidentTypeOptions = [
        { label: "Injurious",               value: "Injurious"              },
        { label: "Near-miss",               value: "Near-miss"              },
        { label: "Fire",                    value: "Fire"                   },
        { label: "Occupational Exposure",   value: "OccupationalExposure"   },
        { label: "Environmental Incident",  value: "EnvironmentalIncident"  },
        { label: "Social",                  value: "Social"                 },
        { label: "Others",                  value: "Others"                 },
    ];

    const [payload, setPayload] = useState({
        centreId: "",
        employeeId: "",
        incidentType: "",
        description: "",
        rcaLog: "",
        capaLog: "",
        incidentDate: new Date(),
        filePath: "",
        isActive: 1,
        otherIncidentType: "",
        incidentTime: new Date(),
    })

    const handleTimeChange = (value, name) => {
    setPayload((prev) => ({
        ...prev,
        [name]: value
    }));
};

//     useEffect(() => {
//     if (editData) {
//         setPayload({
//             id: editData?.Id,
//             centreId: editData?.CentreId || "",
//             employeeId: editData?.EmployeeId || "",
//             incidentType: editData?.IncidentType || "",
//             description: editData?.DESCRIPTION || "",
//             incidentDate: editData?.IncidentDate ? new Date(editData.IncidentDate) : new Date(),
//             filePath: editData?.FilePath || "",
//             isActive: editData?.IsActive ?? 1,
//         });
//     }
// }, [editData]);

    useEffect(() => {
        if (editData) {

            const incidentOptions = [
                ...incidentTypeOptions,
               
            ];

            const isOtherIncident =
                !incidentOptions?.some(
                    (item) =>
                        item?.value === editData?.IncidentType &&
                        item?.value !== "Others"
                );

            setPayload({
                id: editData?.Id,
                centreId: editData?.CentreId || "",
                employeeId: editData?.EmployeeId || "",
                incidentType: isOtherIncident
                    ? "Others"
                    : editData?.IncidentType,
                otherIncidentType: isOtherIncident
                    ? editData?.OtherIncidentType
                    : "",
                description: editData?.DESCRIPTION || "",
                rcaLog: editData?.RCA || "",
                capaLog: editData?.CAPA || "",
                incidentDate: editData?.IncidentDate
                    ? new Date(editData.IncidentDate)
                    : new Date(),

                incidentTime: editData?.IncidentDate
                    ? moment(editData.IncidentDate).format("HH:mm:ss")
                    : moment().format("HH:mm:ss"),
                filePath: editData?.FilePath || "",
                isActive: editData?.IsActive ?? 1,
            });
        }
    }, [editData, incidentTypes]);

    const getEmployees = async () => {
        try {
            const res = await axiosInstance.post("Employee/getEmployee", {
                employeeID: 0,
                employeeName: ""
            });
            const data = res.data.message;
            const employeesDataValue = data.map((ele) => {
                return {
                    value: ele.EmployeeID,
                    label: ele.EmployeeName,
                };
            });
            setEmployees(employeesDataValue);
        } catch (error) {
            console.log("Error while fetching employees");
        }
    };

    useEffect(() => {
         getAccessCentresReports(setCentre)
        getEmployees();
        GetGlobalData(setIncidentTypes, "ESGIncident")
    }, [])

    const handleDateChange = (value, name) => {
        setPayload((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    // const handleReactSelectChange = (name, value) => {
    //     setPayload((prev) => ({
    //         ...prev,
    //         [name]: value?.value
    //     }))
    // }

    const handleReactSelectChange = (name, value) => {
        setPayload((prev) => ({
            ...prev,
            [name]: value?.value,
            ...(name === "incidentType" &&
                value?.value !== "Others"
                ? { otherIncidentType: "" }
                : {})
        }))
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        console.log(name, value)
        setPayload({ ...payload, [name]: value });
    };

    const handleToggle = (field) => {
        setPayload((prev) => ({
            ...prev,
            [field]: prev[field] === 1 ? 0 : 1,
        }));
    };

    const handleOpenUploadModal = () => {
        const currentGuid = payload.FilePath || guidNumber();
        setPayload(prev => ({ ...prev, FilePath: currentGuid }));
        setShowFileModal({
            modal: true,
            data: currentGuid,
            index: -1,
        });
    };

    const handleCaptureUploadedFile = (name, count, isUploaded) => {
        if (count > 0) {
            toast.success(`${count} file(s) linked successfully.`);
        }
    };

    const handleSave = async () => {
        const {
            centreId,
            employeeId,
            incidentType,
            description,
            incidentDate,
            isActive,
            filePath
        } = payload;

        const now = moment();
        const timeStr = typeof payload.incidentTime === "string" && payload.incidentTime ? payload.incidentTime : "";
        const [tHour, tMinute, tSecond] = timeStr
            ? timeStr.split(":")
            : [String(now.hours()), String(now.minutes()), String(now.seconds())];
        const incidentDateTime = moment(payload.incidentDate)
            .set({
                hour: Number(tHour),
                minute: Number(tMinute),
                second: Number(tSecond || 0),
                millisecond: 0,
            })
            .format("YYYY-MM-DDTHH:mm:ss");

        if (!centreId) {
            toast.error(t("Please select a Centre"));
            return;
        }
        if (!employeeId) {
            toast.error(t("Please select Employee"));
            return;
        }
        if (!incidentType) {
            toast.error(t("Please enter Incident type"));
            return;
        }

        setLoading(true);

        const finalPayload = {
            id: payload?.id,
            centreId: centreId,
            employeeId: String(employeeId),
            description: description,
            RCA: payload?.rcaLog,
            CAPA: payload?.capaLog,
            incidentDate: incidentDateTime,
            filePath: filePath,
            isActive: isActive,
            incidentType: payload?.incidentType,
            OtherIncidentType: payload?.otherIncidentType,
        };

        try {
            const res = await axiosInstance.post("ESG/AddOrUpdateIncident", finalPayload);
            if (res?.data?.success) {
                toast.success(t(`Incident record ${editData ? "updated" : "saved"} successfully`));

                setPayload({
                    centreId: "",
                    employeeId: "",
                    incidentType: "",
                    description: "",
                    rcaLog: "",
                    capaLog: "",
                    incidentDate: new Date(),
                    filePath: "",
                    isActive: 1,
                    otherIncidentType: "",
                    incidentTime: new Date(),
                })
            } else {
                toast.error(res?.data?.message || t(`Error while ${editData ? "updating" : "saving"} data`));
            }
        } catch (error) {
            console.error("Error:", error);
            toast.error(t("Something went wrong"));
        } finally {
            setLoading(false);
        }
    };

    console.log("Payload", payload)

    return (
        <>
            <div className="row px-2 py-2">
                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <ReactSelect
                        dynamicOptions={centre}
                        name="centreId"
                        lable={t("Centre")}
                        id="centreId"
                        removeIsClearable={true}
                        placeholderName={t("Select Centre")}
                        value={payload.centreId}
                        onChange={handleReactSelectChange}
                    />
                </div>
                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <ReactSelect
                        dynamicOptions={employees}
                        name="employeeId"
                        lable={t("Employee")}
                        id="employeeId"
                        removeIsClearable={true}
                        placeholderName={t("Select Employee")}
                        value={payload.employeeId}
                        onChange={handleReactSelectChange}
                    />
                </div>
                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <ReactSelect
                        dynamicOptions={incidentTypeOptions}
                        name="incidentType"
                        lable={t("Incident Type")}
                        id="incidentType"
                        removeIsClearable={true}
                        placeholderName={t("Incident Type")}
                        value={payload.incidentType}
                        onChange={handleReactSelectChange}
                    />
                </div>
                {
                    payload?.incidentType === "Others" && (
                        <div className="col-12 col-sm-6 col-md-2 my-1">
                            <Input
                                className="select-input-box form-control input-sm"
                                type="text"
                                name="otherIncidentType"
                                id="otherIncidentType"
                                lable={"Other Incident Type"}
                                value={payload?.otherIncidentType}
                                onChange={handleChange}
                            />
                        </div>
                    )
                }
                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <Input
                        className="select-input-box form-control input-sm"
                        type="text"
                        name="description"
                        id="description"
                        lable={"Description"}
                        value={payload?.description}
                        onChange={handleChange}
                    />
                </div>
                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <Input
                        type="text"
                        name="rcaLog"
                        id="rcaLog"
                        lable={"RCA Log"}
                        value={payload?.rcaLog}
                        onChange={handleChange}
                    />
                </div>
                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <Input
                        type="text"
                        name="capaLog"
                        id="capaLog"
                        lable={"CAPA Log"}
                        value={payload?.capaLog}
                        onChange={handleChange}
                    />
                </div>
                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <DatePicker
                        name="incidentDate"
                        id="incidentDate"
                        lable={t("Incident Date")}
                        className="custom-calendar"
                        value={payload?.incidentDate}
                        onChange={handleDateChange}
                        maxDate={new Date()}
                    />
                </div>
                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <TimePicker
                        name="incidentTime"
                        id="incidentTime"
                        lable={t("Incident Time")}
                        value={payload?.incidentTime}
                        onChange={handleTimeChange}
                    />
                </div>
                <div className="col-12 col-md-auto my-1 d-flex flex-wrap align-items-center" style={{ gap: "8px" }}>
                    <CustomButton
                        text={payload.filePath ? t("File Linked") : t("Upload file")}
                        onClick={handleOpenUploadModal}
                    />
                    <div className="d-flex align-items-center" style={{ gap: "5px" }}>
                        <label className="switch mb-0">
                            <input
                                type="checkbox"
                                checked={payload.isActive === 1}
                                onChange={() => handleToggle("isActive")}
                            />
                            <span className="slider"></span>
                        </label>
                        <strong>
                            <span>{t("IsActive")}</span>
                        </strong>
                    </div>
                    <CustomButton
                        text={editData ? "Update" : "Save"}
                        icon={editData ? "edit" : "save"}
                        onClick={handleSave}
                        disabled={loading}
                    />
                </div>
            </div>

            {showFileModal?.modal && (
                <UploadFile
                    show={showFileModal?.modal}
                    handleClose={() => {
                        setShowFileModal({ modal: false, data: "", index: -1 });
                    }}
                    // options={Identity}
                    documentId={showFileModal?.data}
                    pageName="Chemical"
                    handleUploadCount={handleCaptureUploadedFile}
                />
            )}
        </>
    )
}

export default Incidents