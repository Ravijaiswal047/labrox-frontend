import React, { useEffect, useState, useTransition } from "react";
import Heading from "../../components/UI/Heading";
import ReactSelect from "../../components/formComponent/ReactSelect";
import EqasMenuList from "./EqasMenuList";
import CustomTable from "../../components/Table/CustomTable";
import { ViewMenu } from "../../components/SvgIcons";
import { useDispatch } from "react-redux";
import { setLoading } from "../../store/reducers/loadingSlice/loadingSlice.js";
import { axiosInstance } from "../../utils/axiosInstance.jsx";
import { apiUrls } from "../../utils/apiUrls.js";
import { notify } from "../../utils/utils.js";
import { months, years } from "../../utils/Constants.jsx";
import { CustomButton } from "../../components/UI/CustomButton.jsx";
import { useTranslation } from "react-i18next";
import { ExportToExcel, validateRequiredFields } from "../../utils/helpers.js";
import './Eqas.css'

const EqasComparisonReport = () => {
    const [t] = useTranslation();
    const dispatch = useDispatch();
    const date = new Date();
    const [showMenu, setShowMenu] = useState(false);
    const [errors, setErrors] = useState({});
    const [payload, setPayload] = useState({
        EqasProvider: "",
        EqasProgram: "",
        month: date.getMonth() + 1,
        year: date.getFullYear().toString(),
    });

    const [tableHeaders, setTableHeaders] = useState([]);
    const [tableData, setTableData] = useState([]);

    const [dropdownlist, setDropdownlist] = useState({
        providers: [],
        eqasPrograms: [],
    });

    // Update handler for search filters
    const handleSearchChange = (name, e) => {
        let value = e?.value;
        setPayload((prev) => ({ ...prev, [name]: value }));
        if (name === "EqasProvider") {
            getEqasPrograms(value);EqasProgram
            setPayload((prev) => ({ ...prev, EqasProgram: "" }));
        }
    };

    const handleSearch = async () => {
        const requiredFields = [
                    "EqasProvider",
                    "EqasProgram",
        
                ];
                const errors = validateRequiredFields(payload, requiredFields);
                if (Object.keys(errors).length > 0) {
                    setErrors(errors);
                    return;
                }
        dispatch(setLoading(true));
        await axiosInstance
            .post(apiUrls.GetEQASData, {
                programId : payload?.EqasProgram?.toString() || "",
                entryMonth: payload?.month?.toString() || "",
                entryYear: payload?.year || "",
            })
            .then((res) => {
                console.log("res", res);      
                if (res?.data?.success && res?.data?.data?.length > 0) {
                    const apiData = res.data.data;
                    const keys = Object.keys(apiData[0]);

                    const headers = keys.map((key) => ({
                        header: key,        // Display name
                        field: key,         // Data mapping
                    }));

                    // 🔹 Add Sr No column at start
                    headers.unshift({
                        header: "Sr No",
                        field: "srNo",
                        width: "60px",
                    });

                    // 🔹 Build table rows
                    const rows = apiData?.map((item, index) => ({
                        srNo: index + 1,
                        ...item,
                    }));

                    setTableHeaders(headers);
                    setTableData(rows);
                    setErrors({});
                } else {
                    notify(res?.data?.message || "No Data Found", "success")
                    setTableHeaders([]);
                    setTableData([]);
                    setErrors({});
                }       
            })
            .catch((err) => {
                notify(err?.data?.message, "error");
            })
            .finally(() => {
                dispatch(setLoading(false));
            });
    };

    const handleExport = async () => {
        const requiredFields = [
                    "EqasProvider",
                    "EqasProgram",
        
                ];
                const errors = validateRequiredFields(payload, requiredFields);
                if (Object.keys(errors).length > 0) {
                    setErrors(errors);
                    return;
                }
        dispatch(setLoading(true));
        await axiosInstance
            .post(apiUrls.GetEQASExcelData, {
                programId : payload?.EqasProgram || 0,
                entryMonth: payload?.month || 0,
                entryYear: Number(payload?.year) || 0,
            })
            .then((res) => {
                console.log("resxx", res);   
                if (res?.data?.success && res?.data?.data?.length>0) {
                    const rawData = res?.data?.data;

                    const excelData = rawData?.map((row, index) => ({
                        "Sr No": index + 1,     // 👈 add serial number
                        ...row,                // keep rest of dynamic columns
                    }));

                    ExportToExcel(excelData, "EQAS_Data.xlsx");
                } 
                else{
                    notify(res?.data?.message || "No Data Found", "success")
                }  
               
            })
            .catch((err) => {
                notify(err?.data?.message, "error");
            })
            .finally(() => {
                dispatch(setLoading(false));
            });
    };

    const getEqasPrograms = async (providerId = "") => {
        dispatch(setLoading(true));
        await axiosInstance
            .post(apiUrls.BindProgram, {
                eqasProviderId: providerId?.toString() || "",
            })
            .then((res) => {
                console.log("eqas res", res?.data);
                const resList = res?.data?.data?.map((item) => ({
                    ...item,
                    label: item?.ProgramName,
                    value: item?.ProgramId,
                }));
                setDropdownlist((prev) => ({ ...prev, eqasPrograms: resList }));
            })
            .catch((err) => {
                notify(err?.data?.message, "error");
            })
            .finally(() => {
                dispatch(setLoading(false));
            });
    };


    const getEqasProviders = async () => {
        dispatch(setLoading(true));
        await axiosInstance
            .get(apiUrls.GetEQASProviderMapping)
            .then((res) => {
                console.log("eqas res", res?.data);
                const resList = res?.data?.data?.map((item) => ({
                    ...item,
                    label: item?.EqasProviderName,
                    value: item?.EQASProviderID,
                }));
                setDropdownlist((prev) => ({ ...prev, providers: resList }));

            })
            .catch((err) => {
                notify(err?.data?.message, "error");
            })
            .finally(() => {
                dispatch(setLoading(false));
            });
    };

    const handleReset = () => {
        setPayload({
            EqasProvider: "",
            EqasProgram: "",
            month: date.getMonth() + 1,
            year: date.getFullYear().toString(),
        });
        setErrors({});
        setTableData([]);
        setTableHeaders([]);
    }

    useEffect(() => {
        getEqasProviders();
    }, []);

    console.log("payload", payload);

    return (
        <>
            {showMenu && <EqasMenuList />}

            <Heading
                title={"EQAS Comparison Report"}
                secondTitle={
                    <label onClick={() => setShowMenu((prev) => !prev)}>
                        <ViewMenu />
                    </label>
                }
            />

            <div className="main_resurlt_entry card py-2 px-2">
               
                <div className="row">
                    <div className="col-sm-3 col-md-2 col-12">
                        <ReactSelect
                            dynamicOptions={dropdownlist?.providers}
                            name="EqasProvider"
                            id="EqasProvider"
                            removeIsClearable={false}
                            placeholderName={t("EQAS Provider")}
                            value={payload?.EqasProvider}
                            onChange={handleSearchChange}
                            className="required-fields"
                        />
                        {payload?.EqasProvider === "" && (
                            <span className="error-message">{errors?.EqasProvider}</span>
                        )}
                    </div>
                    <div className="col-sm-3 col-md-2 col-12">
                        <ReactSelect
                            dynamicOptions={dropdownlist?.eqasPrograms}
                            name="EqasProgram"
                            id="EqasProgram"
                            removeIsClearable={false}
                            placeholderName={t("EQAS Program")}
                            value={payload?.EqasProgram}
                            onChange={handleSearchChange}
                            className="required-fields"
                        />
                        {payload?.EqasProgram === "" && (
                            <span className="error-message">{errors?.EqasProgram}</span>
                        )}
                    </div>

                    <div className="col-sm-2 col-md-1 col-12 ">


                        <ReactSelect
                            dynamicOptions={months}
                            name="month"
                            id="month"
                            removeIsClearable={false}
                            placeholderName={t("Month")}
                            value={payload?.month}
                            onChange={handleSearchChange}
                            className="required-fields"
                        />
                    </div>

                    <div className="col-sm-2 col-md-1 col-12 ">
                        <ReactSelect
                            dynamicOptions={years}
                            name="year"
                            id="year"
                            removeIsClearable={false}
                            placeholderName={t("Year")}
                            value={payload?.year}
                            onChange={handleSearchChange}
                            className="required-fields"
                        />
                    </div>


                    <CustomButton text="Search" icon="search" onClick={handleSearch}/>

                    <CustomButton text="Export to Excel" icon="excel" className="mx-2" onClick={handleExport}/>
                    <CustomButton text="Reset" icon="refresh" onClick={handleReset} />

                </div>

            </div>
            <Heading
                title={"EQAS Search Details"}
            />
            <div className="">
                <CustomTable
                    columns={tableHeaders}
                    data={tableData}
                />
            </div>
        </>
    );
};

export default EqasComparisonReport;


