import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import Input from "../../../components/formComponent/Input"
import { toast } from "react-toastify"
import ReactSelect from "../../../components/formComponent/ReactSelect"
import { axiosInstance } from "../../../utils/axiosInstance"
import { CustomButton } from "../../../components/UI/CustomButton"
import DatePicker from "../../../components/formComponent/DatePicker"
import moment from "moment"
import { getAccessCentresReports, GetGlobalData } from "../../../utils/NetworkApi/commonApi"

const Grievance = ({ editData, setEditData }) => {
    const [t] = useTranslation()
    const [centre, setCentre] = useState([])
    const [employees, setEmployees] = useState([])
    const [identificationTypes, setIdentificationTypes] = useState([])
    const [methods, setMethods] = useState([])
    const [status, setStatus] = useState([])
    const [loading, setLoading] = useState(false)

    const [payload, setPayload] = useState({
        centreId: "",
        employeeId: "",
        identificationType: "",
        method: "",
        details: "",
        status: "",
        resolutionRemarks: "",
        registrationDate: new Date(),
        isActive: 1,
        otherMethod: "",
    })

    useEffect(() => {
    if (editData) {
        setPayload({
            id: editData?.Id, 
            centreId: editData?.CentreId || "",
            employeeId: editData?.EmployeeId || "",
            identificationType: editData?.IdentificationType || "",
            method: editData?.Method || "",
            details: editData?.Details || "",
            status: editData?.Status || "",
            resolutionRemarks: editData?.ResolutionRemarks || "",
            registrationDate: editData?.RegistrationDate
                ? moment(editData.RegistrationDate, "DD-MMM-YY hh:mm A").toDate()
                : new Date(),
            isActive: editData?.IsActive ?? 1,
            otherMethod: editData?.OtherType || "",
        });
    }
}, [editData]);


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
        GetGlobalData(setIdentificationTypes, "GrievanceIdentificationType")
        GetGlobalData(setMethods, "GrievanceMethod")
        GetGlobalData(setStatus, "GrievanceStatus")
        
    }, [])

    // const handleReactSelectChange = (name, value) => {
    //     setPayload((prev) => ({
    //         ...prev,
    //         [name]: value?.value
    //     }))
    // }

    const handleReactSelectChange = (name, value) => {
        setPayload((prev) => {
            const updatedPayload = {
                ...prev,
                [name]: value?.value
            };

            // Clear otherMethod when method is not "Other"
            if (name === "method" && value?.value !== "Other") {
                updatedPayload.otherMethod = "";
            }

            return updatedPayload;
        });
    };

    const handleDateChange = (value, name) => {
        setPayload((prev) => ({ ...prev, [name]: value }));
    };

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


    const handleSave = async () => {
        const {
            centreId,
            employeeId,
            identificationType,
            method,
            details,
            status,
            resolutionRemarks,
            isActive
        } = payload;

        if (!centreId) {
            toast.error(t("Please select a Centre"));
            return;
        }
        if (!employeeId) {
            toast.error(t("Please select Employee"));
            return;
        }
        if (!identificationType) {
            toast.error(t("Please enter identification type"));
            return;
        }
        if (method === "Other" && !payload?.otherMethod?.trim()) {
            toast.error(t("Please enter Other Method"));
            return;
        }

        setLoading(true);

        const finalPayload = {
            id: payload?.id,
            centreId: centreId,
            employeeId: Number(employeeId),
            identificationType: identificationType,
            method: method,
            details: details,
            status: status,
            resolutionRemarks: resolutionRemarks,
            isActive: isActive,
            OtherType: payload?.otherMethod,
            RegistrationDate: payload?.registrationDate
                ? moment(payload.registrationDate).format("YYYY-MM-DDTHH:mm:ss")
                : null,
        };

        try {
            const res = await axiosInstance.post("ESG/AddOrUpdateGrievance", finalPayload);
            if (res?.data?.success) {
                toast.success(t(`Grievance record ${editData ? "updated" : "saved"} successfully`));
                setEditData(null)

                setPayload({
                    centreId: "",
                    employeeId: "",
                    identificationType: "",
                    method: "",
                    details: "",
                    status: "",
                    resolutionRemarks: "",
                    registrationDate: new Date(),
                    isActive: 1
                })
            } else {
                toast.error(res?.data?.message || t("Error while saving data"));
            }
        } catch (error) {
            console.error("Grievance Error:", error);
            toast.error(t("Something went wrong"));
        } finally {
            setLoading(false);
        }
    };

    console.log("methods", methods)

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
                        dynamicOptions={identificationTypes}
                        name="identificationType"
                        lable={t("Identification Type")}
                        id="identificationType"
                        removeIsClearable={true}
                        placeholderName={t("Identification Type")}
                        value={payload.identificationType}
                        onChange={handleReactSelectChange}
                    />
                </div>
                <div className="col-12 col-sm-6 col-md-2 my-1">
                     <ReactSelect
                        dynamicOptions={methods}
                        name="method"
                        id="method"
                        lable={t("Method")}
                        removeIsClearable={true}
                        placeholderName={t("Method")}
                        value={payload.method}
                        onChange={handleReactSelectChange}
                    />
                </div>
                {payload?.method === "Other" && (
                    <div className="col-12 col-sm-6 col-md-2 my-1">
                        <Input
                            className="select-input-box form-control input-sm"
                            type="text"
                            name="otherMethod"
                            id="otherMethod"
                            lable={"Other Method"}
                            value={payload?.otherMethod}
                            onChange={handleChange}
                        />
                    </div>
                )}
                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <Input
                        className="select-input-box form-control input-sm"
                        type="text"
                        name="details"
                        id="details"
                        lable={"Details"}
                        value={payload?.details}
                        onChange={handleChange}
                    />
                </div>
                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <ReactSelect
                        dynamicOptions={status}
                        name="status"
                        lable={t("Status")}
                        id="status"
                        removeIsClearable={true}
                        placeholderName={t("Select Status")}
                        value={payload.status}
                        onChange={handleReactSelectChange}
                    />
                </div>
                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <Input
                        className="select-input-box form-control input-sm"
                        type="text"
                        name="resolutionRemarks"
                        id="resolutionRemarks"
                        lable={"Remark"}
                        value={payload?.resolutionRemarks}
                        onChange={handleChange}
                    />
                </div>
                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <DatePicker
                        name="registrationDate"
                        id="registrationDate"
                        lable={t("Date of Registration")}
                        value={payload?.registrationDate}
                        onChange={handleDateChange}
                        className="custom-calendar"
                    />
                </div>
                <div className="col-auto mb-3 d-flex align-items-center" style={{ gap: "5px" }}>
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
                <div className="col-auto mb-3 d-flex align-items-end">
                    <CustomButton
                        text={editData ? "Update" : "Save"}
                        icon={editData ? "edit" : "save"}
                        onClick={handleSave}
                        disabled={loading}
                    />
                </div>
            </div>
        </>
    )
}

export default Grievance