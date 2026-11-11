
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { SearchButton } from "../../../components/UI/CustomButton"
import { toast } from "react-toastify"
import DatePicker from "../../../components/formComponent/DatePicker"
import { axiosInstance } from "../../../utils/axiosInstance"
import MultiSelectComp from "../../../components/formComponent/MultiSelectComp"
import Accordion from "../../../components/UI/Accordion"
import Tables from "../../../components/UI/customTable"
import NoRecordFound from "../../../components/formComponent/NoRecordFound"
import { getAccessCentresReports } from "../../../utils/NetworkApi/commonApi"

const DiversityInclusionSearch = ({ onEdit }) => {
    const [t] = useTranslation()
    const [centre, setCentre] = useState([])
    const [employees, setEmployees] = useState([])
    const [loading, setLoading] = useState(false)
    const [tableData, setTableData] = useState([])
    const [payload, setPayload] = useState({
        centreId: [],
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
            fromDate: payload.fromDate,
            toDate: payload.toDate
        };
        try {
            const res = await axiosInstance.post("ESG/GetAllDiversity", finalPayload);
            if (res?.data?.success) {
                setTableData(res?.data?.message || [])
            } else {
                toast.error(res?.data?.message || t("Error while fetching data"));
            }
        } catch (error) {
            console.error("search Error:", error);
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

            <Accordion title={t("Gender Diversity Records")} defaultValue={true}>
                {tableData.length > 0 ? (
                    <div className="row px-1">
                        <div className="col-12">
                            <Tables>
                                <thead className="cf">
                                    <tr>
                                        <th>{t("S.No")}</th>
                                        <th>{t("Centre")}</th>
                                        <th>{t("Male Count")}</th>
                                        <th>{t("Female Count")}</th>
                                        <th>{t("Total Employees")}</th>
                                        <th>{t("Diversity Ratio (M/F)")}</th>
                                        <th>{t("Created On")}</th>
                                        <th>{t("Action")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tableData && tableData.map((data, index) => {
                                        const total = (data?.MaleCount || 0) + (data?.FemaleCount || 0);
                                        return (
                                            <tr key={index}>
                                                <td data-title={t("S.No")}>{index + 1}</td>
                                                <td data-title={t("Centre")}>{data?.CentreName}</td>
                                                <td data-title={t("Male Count")}>{data?.MaleCount}</td>
                                                <td data-title={t("Female Count")}>{data?.FemaleCount}</td>
                                                <td data-title={t("Total Employees")}><strong>{total}</strong></td>
                                                <td data-title={t("Diversity Ratio")}>
                                                    <div className="progress" style={{ height: "10px", width: "100px" }}>
                                                        <div
                                                            className="progress-bar bg-primary"
                                                            style={{ width: `${data?.MalePercent}%` }}
                                                            title={`Male: ${data?.MalePercent}%`}
                                                        ></div>
                                                        <div
                                                            className="progress-bar bg-gray"
                                                            style={{ width: `${data?.FemalePercent}%` }}
                                                            title={`Female: ${data?.FemalePercent}%`}
                                                        ></div>
                                                    </div>
                                                    <small className="text-muted">
                                                        {data?.MalePercent}% / {data?.FemalePercent}%
                                                    </small>
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
                                        );
                                    })}
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

export default DiversityInclusionSearch;