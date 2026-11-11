
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import Input from "../../../components/formComponent/Input"
import {SearchButton } from "../../../components/UI/CustomButton"
import { toast } from "react-toastify"
import DatePicker from "../../../components/formComponent/DatePicker"
import ReactSelect from "../../../components/formComponent/ReactSelect"
import { axiosInstance } from "../../../utils/axiosInstance"
import MultiSelectComp from "../../../components/formComponent/MultiSelectComp"
import Accordion from "../../../components/UI/Accordion"
import Tables from "../../../components/UI/customTable"
import NoRecordFound from "../../../components/formComponent/NoRecordFound"
import { getAccessCentresReports, GetGlobalData } from "../../../utils/NetworkApi/commonApi"

const IncidentSearch = ({onEdit}) => {
    const [t] = useTranslation()
    const [centre, setCentre] = useState([])
    const [employees, setEmployees] = useState([])
    const [loading, setLoading] = useState(false)
    const [incidentTypes, setIncidentTypes] = useState([])
     const incidentTypeOptions = [
        { label: "Injurious",               value: "Injurious"              },
        { label: "Near-miss",               value: "Near-miss"              },
        { label: "Fire",                    value: "Fire"                   },
        { label: "Occupational Exposure",   value: "OccupationalExposure"   },
        { label: "Environmental Incident",  value: "EnvironmentalIncident"  },
        { label: "Social",                  value: "Social"                 },
        { label: "Others",                  value: "Others"                 },
    ];
    const [tableData, setTableData] = useState([])
    const [payload, setPayload] = useState({
        centreId: [],
        employeeId: "",
        incidentType: "",
        fromDate: new Date(),
        toDate: new Date(),
    })

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

    const handleReactSelectChange = (name, value) => {
        setPayload((prev) => ({
            ...prev,
            [name]: value?.value
        }))
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPayload({ ...payload, [name]: value });
    };

    const handleMultiSelectChange = (name, value) => {
        setPayload((prev) => ({
            ...prev,
            [name]: value
        }))
    }



    const handleSearch = async () => {
        setLoading(true);
        const finalPayload = {
            centreId: payload?.centreId,
            employeeId: Number(payload.employeeId),
            incidentType: payload?.incidentType,
            fromDate: payload.fromDate,
            toDate: payload.toDate
        };
        try {
            const res = await axiosInstance.post("ESG/GetIncidentList", finalPayload);
            if (res?.data?.success) {
                setTableData(res?.data?.message || [])
            } else {
                toast.error(res?.data?.message || t("Error while fetching data"));
            }
        } catch (error) {
            console.error("Save Error:", error);
            toast.error(t("Something went wrong"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="row px-2 py-2">
                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <MultiSelectComp
                        label="All Centre"
                        options={centre}
                        value={payload?.centreId}
                        name="centreId"
                        id="centreId"
                        onChange={handleMultiSelectChange}
                        lable={t("Select Centre")}
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
                        // dynamicOptions={incidentTypes}
                        dynamicOptions={[
                            ...incidentTypeOptions,
                        ]}
                        name="incidentType"
                        lable={t("incidentType")}
                        id="incidentType"
                        removeIsClearable={true}
                        placeholderName={t("Incident Type")}
                        value={payload.incidentType}
                        onChange={handleReactSelectChange}
                    />
                </div>
                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <DatePicker
                        name="fromDate"
                        id="fromDate"
                        lable={t("FromDate")}
                        className="custom-calendar"
                        value={payload?.fromDate}
                        onChange={handleDateChange}
                        maxDate={payload?.toDate}
                    />
                </div>
                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <DatePicker
                        name="toDate"
                        id="toDate"
                        className="custom-calendar"
                        lable={t("ToDate")}
                        value={payload?.toDate}
                        onChange={handleDateChange}
                        minDate={payload?.fromDate}
                        maxDate={new Date()}
                    />
                </div>
                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <SearchButton
                        text={"Search"}
                        onClick={handleSearch}
                        disabled={loading}
                    />
                </div>
            </div>
            <Accordion title={t("Incident Records")} defaultValue={true}>
                {tableData.length > 0 ? (
                    <div className="row px-1">
                        <div className="col-12">
                            <Tables>
                                <thead className="cf">
                                    <tr>
                                        <th>{t("S.No")}</th>
                                        <th>{t("Centre")}</th>
                                        <th>{t("Employee")}</th>
                                        
                                        <th>{t("Incident Type")}</th>
                                        <th>{t("Incident Date")}</th>   
                                        <th>{t("Description")}</th>
                                        <th>{t("RCA")}</th>
                                        <th>{t("CAPA")}</th>
                                        <th>{t("Created On")}</th>
                                        {/* <th>{t("Created By")}</th> */}
                                        <th>{t("Updated On")}</th>
                                        <th>{t("Updated By")}</th>
                                        <th>{t("Action")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tableData && tableData.map((data, index) => (
                                        <tr key={index}>
                                            <td data-title={t("S.No")}>{index + 1}</td>
                                            <td data-title={t("Centre")}>{data?.CentreName}</td>
                                            <td data-title={t("Employee")}>
                                                {data?.EmployeeName}
                                            </td>
                                            
                                            <td data-title={t("Incident Type")}>
                                                {data?.IncidentType === "Others" ? data?.OtherIncidentType : data?.IncidentType}
                                            </td>
                                            <td data-title={t("Incident Date")}>
                                                {data?.IncidentDate}
                                            </td>
                                            <td data-title={t("Description")}>
                                                
                                                    {data?.DESCRIPTION}
                                                
                                            </td>
                                            <td data-title={t("RCA")}>
                                               
                                                    {data?.RCA}
                                               
                                            </td>
                                            <td data-title={t("CAPA")}>
                                               
                                                    {data?.CAPA}
                                               
                                            </td>
                                            <td data-title={t("Created On")}>
                                                {data?.dtEntry}
                                            </td>
                                            {/* <td data-title={t("Created By")}>
                                                {data?.CreatedBy}
                                            </td> */}
                                            <td data-title={t("Updated On")}>
                                                {data?.dtUpdate}
                                            </td>
                                            <td data-title={t("Updated By")}>
                                                {data?.UpdatedByName}
                                            </td>
                                            
                                            <td data-title={t("Action")}>
                                                <button
                                                    className="btn btn-xs btn-primary"
                                                    onClick={() => onEdit(data)}
                                                >
                                                    <i className="fa fa-edit"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Tables>
                        </div>
                    </div>
                ) : (
                    <NoRecordFound />
                )}
            </Accordion>
        </>
    )
}

export default IncidentSearch;