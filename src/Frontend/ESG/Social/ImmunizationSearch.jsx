
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import Input from "../../../components/formComponent/Input"
import { CustomButton, SaveButton, SearchButton } from "../../../components/UI/CustomButton"
import { toast } from "react-toastify"
import DatePicker from "../../../components/formComponent/DatePicker"
import ReactSelect from "../../../components/formComponent/ReactSelect"
import { axiosInstance } from "../../../utils/axiosInstance"
import UploadFile from "../../utils/UploadFileModal/UploadFile"
import { guidNumber } from "../../../utils/generateGuid"
import MultiSelectComp from "../../../components/formComponent/MultiSelectComp"
import NoRecordFound from "../../../components/formComponent/NoRecordFound"
import Tables from "../../../components/UI/customTable"
import Accordion from "../../../components/UI/Accordion"
import { getAccessCentresReports } from "../../../utils/NetworkApi/commonApi"

const ImmunizationSearch = ({onEdit}) => {
    const [t] = useTranslation()
    const [centre, setCentre] = useState([])
    const [employees, setEmployees] = useState([])
    const [loading, setLoading] = useState(false)
    const [tableData, setTableData] = useState([])
    const [payload, setPayload] = useState({
        centreId: [],
        employeeId: "",
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
            fromDate: payload.fromDate,
            toDate: payload.toDate
        };
        try {
            const res = await axiosInstance.post("ESG/GetImmunizationList", finalPayload);
            if (res?.data?.success) {
                setTableData(res?.data?.message || [])
            } else {
                toast.error(res?.data?.message || t("Error while saving data"));
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
                    <DatePicker
                        name="fromDate"
                        id="fromDate"
                        lable={t("FromDate")}
                        className="custom-calendar"
                        value={payload?.fromDate}
                        onChange={handleDateChange}
                    />
                </div>
                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <DatePicker
                        name="toDate"
                        id="toDate"
                        lable={t("ToDate")}
                        className="custom-calendar"
                        value={payload?.toDate}
                        onChange={handleDateChange}
                        minDate={payload?.fromDate}
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

            <Accordion title={t("Vaccination Records")} defaultValue={true}>
                {tableData.length > 0 ? (
                    <div className="row px-1">
                        <div className="col-12">
                            <Tables>
                                <thead className="cf">
                                    <tr>
                                        <th>{t("S.No")}</th>
                                        <th>{t("Employee")}</th>
                                        <th>{t("Centre")}</th>
                                        <th>{t("Hep-B Dose 1")}</th>
                                        <th>{t("Hep-B Dose 2")}</th>
                                        <th>{t("Hep-B Dose 3")}</th>
                                        <th>{t("Tetanus")}</th>
                                        <th>{t("Created On")}</th>
                                        <th>{t("Action")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tableData && tableData.map((data, index) => (
                                        <tr key={index}>
                                            <td data-title={t("S.No")}>{index + 1}</td>
                                            <td data-title={t("Employee")}>
                                                <div>{data?.EmployeeName}</div>
                                                <small className="text-muted">{data?.EmployeeId}</small>
                                            </td>
                                            <td data-title={t("Centre")}>{data?.Centre}</td>

                                            <td data-title={t("Hep-B Dose 1")}>
                                                
                                                {data?.HepB_Dose1_Date?.split(" ")[0]}
                                            </td>
                                            <td data-title={t("Hep-B Dose 2")}>
                                                {data?.HepB_Dose2_Date?.split(" ")[0]}
                                            </td>
                                            <td data-title={t("Hep-B Dose 3")}>
                                                {data?.HepB_Dose3_Date?.split(" ")[0]}
                                            </td>
                                            <td data-title={t("Tetanus")}>
                                                {data?.Tetanus_Date?.split(" ")[0]}
                                            </td>
                                            <td data-title={t("Created On")}>
                                                {data?.dtEntry}
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

export default ImmunizationSearch