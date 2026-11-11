import React from "react";
import { useTranslation } from "react-i18next";
import { Dialog } from "primereact/dialog";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { SelectBox } from "../../components/formComponent/SelectBox";
import { toast } from "react-toastify";
import axios from "axios";
import { useState, useEffect } from "react";
import moment from "moment";
import DatePicker from "../../components/formComponent/DatePicker";
import { HCNewPatientForm } from "../../utils/Constants";
import {
    AllowCharactersNumbersAndSpecialChars,
    getTrimmedData,
    number,
} from "../../utils/helpers";
import Input from "../../components/formComponent/Input";
import { useRef } from "react";
import Loading from "../../components/loader/Loading";
import { useLocation } from "react-router-dom";

import Accordion from "@app/components/UI/Accordion";
import { NewPatientModalValidationSchema } from "../../utils/Schema";
import { PreventSpecialCharacterandNumber } from "../util/Commonservices";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { axiosInstance } from "../../utils/axiosInstance";
import { CancelButton, CustomButton, SaveButton } from "../../components/UI/CustomButton";

const TemporaryPhlebotomist = () => {
    const location = useLocation();
    const phleboId = location?.state?.PhleboId || null;
    const [RadioDefaultSelect, setRadioDefaultSelect] = useState("Age");
    const TemporaryPhlebotomistForm = {
        Title: "Mr.",
        PName: "",
        HouseNo: "",
        StreetName: "",
        LocalityID: "",
        CityID: "",
        Pincode: "",
        StateID: "",
        CountryID: "",
        Phone: "",
        Mobile: "",
        Email: "",
        DOB: "",
        Age: "",
        AgeYear: "",
        AgeMonth: "",
        AgeDays: "",
        TotalAgeInDays: "",
        Gender: "Male",
        VehicleNum: "",
        drivingLicence: "",
        DocumentNo: "",
        DocumentType: "",
        Landmark: "",
        WorkAreaState: "",
        WorkAreaCity: "",
        OTP: "",
    };
    const [formData, setFormData] = useState(TemporaryPhlebotomistForm);
    const [DateData, setDateData] = useState({
        AgeYear: "",
        AgeMonth: "",
        AgeDays: "",
    });
    const [load, setLoad] = useState(false);
    const [errors, setErros] = useState({});
    const [gender, setGender] = useState([]);
    const [title, setTitle] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCity] = useState([]);
    const [workAreaCities, setWorkAreaCities] = useState([]);
    const [locality, setLocality] = useState([]);
    const [country, setCountry] = useState([]);
    const [DocumentType, setDocumentType] = useState([]);
    const [otpLoading, setOtpLoading] = useState(false);
    const { t } = useTranslation();
    const initialRender = useRef(true);

    console.log(formData);

    const generatedTemporaryPhlebotomistError = () => {
        let err = "";
        if (!formData.PName || formData.PName.trim() === "") {
            err = { ...err, PName: "This Field is Required" };
        }
        if (formData?.PName.trim().length < 3) {
            err = { ...err, PNames: "Must Have 3 length" };
        }
        if (!formData.DOB || formData.DOB === "") {
            err = { ...err, DOB: "This Field is Required" };
        }
        if (!formData.StateID.toString() || formData.StateID.toString().trim() === "") {
            err = { ...err, StateID: "This Field is Required" };
        }
        if (!formData.Pincode || formData.Pincode.trim() === "") {
            err = { ...err, Pincode: "This Field is Required" };
        }

        if (!formData.CityID.toString() || formData.CityID.toString().trim() === "") {
            err = { ...err, CityID: "This Field is Required" };
        }
        if (!formData.CountryID.toString() || formData.CountryID.toString().trim() === "") {
            err = { ...err, CountryID: "This Field is Required" };
        }
        if (!formData.Gender || formData.Gender.trim() === "") {
            err = { ...err, Gender: "This Field is Required" };
        }
        if (!formData.LocalityID?.toString() || formData.LocalityID?.toString().trim() === "") {
            err = { ...err, LocalityID: "This Field is Required" };
        }
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (formData?.Email.trim().length > 0 && !emailRegex.test(formData?.Email)) {
            err = { ...err, Emailvalid: "Please enter a valid email address" };
        }
        return err;
    }
    const handleSave = async () => {

        const generateError = generatedTemporaryPhlebotomistError()
        setErros(generateError)
        if (Object.keys(generateError).length > 0) {
            return;
        }

        const payload = {
            name: formData?.PName || "",
            age: Number(formData?.AgeYear) || 0,
            gender: formData?.Gender || "",
            mobile: formData?.Mobile || "",
            email: formData?.Email || "",
            fatherName: formData?.FatherName || "",

            p_Address: [formData?.HouseNo, formData?.StreetName, formData?.Landmark]
                .filter(Boolean)
                .join(", "),

            p_City: formData?.CityID || "",
            p_Pincode: formData?.Pincode || "",
            vehicle_Num: formData?.VehicleNum || "",
            drivingLicence: formData?.drivingLicence || "",
            documentType: formData?.DocumentType?.toString() || "",
            documentNo: formData?.DocumentNo || "",
            otp: formData?.OTP || "",

            cityStateId:
                formData?.WorkAreaCity && formData?.WorkAreaState
                    ? [`${formData.WorkAreaCity}#${formData.WorkAreaState}`]
                    : []
        };

        try {
            const res = await axiosInstance.post("TemporaryPheleboApproval/SaveTemporaryPhelebotomist", payload)
            if (res?.data?.success) {
                toast.success(res?.data?.message)
                setFormData(TemporaryPhlebotomistForm)
            } else {
                toast.error(res?.data?.message || "Failed to save data.")
            }
        } catch (error) {
            console.log("Error while saving", error)
        }
    };

    const ageCount = (y, m, d) => {
        if (y == 0 && m == 0 && d == 0) {
            return 1;
        } else {
            return d == "" ? 0 : d;
        }
    };
    const getRequiredAttachment = () => {
        axiosInstance
            .post("Global/GetGlobalData", {
                Type: "RequiredAttachment",
            })
            .then((res) => {
                let data = res.data.message;

                let RequiredAttachment = data.map((ele) => {
                    return {
                        value: ele.FieldID,
                        label: ele.FieldDisplay,
                    };
                });
                setDocumentType(RequiredAttachment);
            })
            .catch((err) => console.log(err));
    };

    useEffect(() => {
        getRequiredAttachment();
    }, []);

    const handleSelectChange = (name, event) => {
        const { value } = event;

        if (name === "StateID") {
            getCityDropDown(value);
            setFormData({
                ...formData,
                [name]: value,
                CityID: "",
                LocalityID: "",
                Pincode: "",
            });
        } else if (name === "CityID") {
            getLocalityDropDown(value);
            setFormData({ ...formData, [name]: value, LocalityID: "", Pincode: "" });
        } else if (name === "LocalityID") {
            console.log("name,value", name, value);
            getPinCode(value, name);
            setFormData({ ...formData, [name]: value?.toString(), Pincode: "" });
            console.log("formData", formData);
        } else if (name === "WorkAreaState") {
            getWorkAreaCityDropDown(value);
            setFormData({
                ...formData,
                [name]: value,
                WorkAreaCity: "",
            });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSelectInputChange = (event) => {
        const { name, value } = event?.target;

        if (name === "Pincode") {
            return;
        }

        if (name === "Landmark" || name === "HouseNo" || name === "StreetName" || name === "DocumentNo") {
            setFormData({
                ...formData,
                [name]: AllowCharactersNumbersAndSpecialChars(value)
                    ? value
                    : formData[name],
            });
        } else if (name === "PName") {
            setFormData({
                ...formData,
                [name]: PreventSpecialCharacterandNumber(value)
                    ? value
                    : formData[name],
            });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const getSubtractType = (name) => {
        return name === "AgeYear"
            ? "years"
            : name === "AgeMonth"
                ? "months"
                : "days";
    };
    // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // useEffect(() => {
    //   if (!initialRender.current) {
    //     console.log(formData?.DOB,new Date())
    //     if (

    //       moment(formData?.DOB).format('DD-MMM-YYYY') == moment(new Date()).format('DD-MMM-YYYY')
    //     ){

    //       setFormData({
    //         ...formData,
    //         AgeDays:1,
    //         AgeYear:0,
    //         AgeMonth:0,
    //       });
    //     }
    //   } else {
    //     initialRender.current = false;
    //   }
    // }, [formData?.DOB]);

    const handleDOBCalculation = (e) => {
        const { name, value } = e.target;

        let diff = {};
        let subtractType = getSubtractType(name);

        if (name === "AgeYear") {
            diff = moment().subtract(value, subtractType);
            setDateData({
                ...DateData,
                AgeYear: diff?._d,
            });
        }

        if (name === "AgeMonth") {
            diff = moment(DateData?.AgeYear || new Date().now).subtract(
                value,
                subtractType,
            );
            setDateData({
                ...DateData,
                AgeMonth: diff?._d,
            });
        }

        if (name === "AgeDays") {
            diff = moment(DateData?.AgeMonth || new Date().now).subtract(
                value,
                subtractType,
            );
            setDateData({
                ...DateData,
                AgeDays: diff?._d,
            });
        }
        var Newdiff = moment(moment(), "milliseconds").diff(
            moment(diff?._d).format("YYYY-MM-DD"),
        );

        var duration = moment.duration(Newdiff);
        var startDate = moment(diff._d);
        var endDate = moment();

        var yearsDiff = endDate.diff(startDate, "years");
        startDate.add(yearsDiff, "years");

        var monthsDiff = endDate.diff(startDate, "months");
        startDate.add(monthsDiff, "months");

        var daysDiff = endDate.diff(startDate, "days");
        setFormData({
            ...formData,
            [name]: value,
            DOB: diff?._d,
            TotalAgeInDays: moment(moment().format("YYYY-MM-DD")).diff(
                diff?._d,
                "days",
            ),
            Age: `${yearsDiff} Y ${monthsDiff} M ${daysDiff} D`,
        });
    };
    const handleDateFunction = (value) => {
        const { year, month, days } = value;
        const yearDiff = moment().subtract(year, "years")?._d;
        const monthDiff = moment(yearDiff).subtract(month, "months")?._d;
        const daysDiff = moment(monthDiff).subtract(days, days)?._d;

        return {
            AgeYear: yearDiff,
            AgeMonth: monthDiff,
            AgeDays: daysDiff,
        };
    };
    const calculateDOB = (value) => {
        var TodayDate = moment(new Date().now).format("YYYY,MM,DD");
        var DOBDate = moment(value).format("YYYY,MM,DD");
        var a = moment(TodayDate);
        var b = moment(DOBDate);
        var years = a.diff(b, "year");
        b.add(years, "years");
        var months = a.diff(b, "months");
        b.add(months, "months");
        var days = a.diff(b, "days");
        return { years, months, days };
    };

    const calculateTotalNumberOfDays = (value) => {
        return moment(moment().format("YYYY-MM-DD")).diff(value, "days");
    };

    const dateSelect = (value, name) => {
        console.log(value);
        if (
            moment(value).format("DD-MMM-YYYY") ==
            moment(new Date()).format("DD-MMM-YYYY")
        ) {
            setFormData({
                ...formData,
                [name]: value,
                AgeYear: 0,
                AgeMonth: 0,
                AgeDays: 1,
                TotalAgeInDays: 1,
            });
        } else {
            const { years, months, days } = calculateDOB(value);
            setFormData({
                ...formData,
                [name]: value,
                AgeYear: years,
                AgeMonth: months,
                AgeDays: days,
                TotalAgeInDays: calculateTotalNumberOfDays(value),
                Age: `${years} Y ${months} M ${days} D`,
            });
            const dateForFields = handleDateFunction({
                year: years,
                month: months,
                days: days,
            });
            setDateData({
                AgeYear: dateForFields?.AgeYear,
                AgeMonth: dateForFields?.AgeMonth,
                AgeDays: dateForFields?.AgeDays,
            });
        }
    };
    const findGender = () => {
        const male = ["Mr.", "Baba", "Dr.(Mr)", "Master"];
        const female = [
            "Miss.",
            "Mrs.",
            "Baby",
            "Dr.(Miss)",
            "Dr.(Mrs)",
            "Ms.",
            "SMT.",
        ];

        if (male.includes(formData?.Title)) {
            setFormData({ ...formData, Gender: "Male" });
        }

        if (female.includes(formData?.Title)) {
            setFormData({ ...formData, Gender: "Female" });
        }
    };

    const handleSplitData = (id) => {
        const data = id?.split("#")[0];
        return data;
    };

    const getPinCode = (value, name) => {
        axiosInstance
            .post("CustomerCare/BindPinCode", {
                LocalityID: value?.toString(),
            })
            .then((res) => {
                const data = res?.data?.message;
                setFormData({
                    ...formData,
                    Pincode: data[0]?.pincode,
                    [name]: value,
                });
            })
            .catch((err) => {
                toast.error(err?.res?.data ? err?.res?.data : "Something Went Wrong");
            });
    };

    const getLocalityDropDown = (value) => {
        axiosInstance
            .post("CustomerCare/BindLocality", {
                cityid: value,
            })
            .then((res) => {
                if (res?.data?.success && Array.isArray(res?.data?.message)) {
                    const data = res?.data?.message;
                    const localities = data?.map((ele) => {
                        return {
                            // ID: ele?.id,
                            value: ele?.id,
                            label: ele?.NAME,
                        };
                    });

                    setLocality(localities);
                } else {
                    setLocality([]);
                }
            })
            .catch((err) => {
                toast.error(err?.res?.data ? err?.res?.data : "Something Went Wrong");
            });
    };

    const getCityDropDown = (value) => {
        axiosInstance
            .post("CommonHC/GetCityData", {
                StateId: [value],
            })
            .then((res) => {
                const data = res?.data?.message;
                const cities = data?.map((ele) => {
                    return {
                        value: handleSplitData(ele?.ID),
                        label: ele?.City,
                    };
                });

                setCity(cities);
            })
            .catch((err) => {
                toast.error(err?.res?.data ? err?.res?.data : "Something Went Wrong");
            });
    };

    const getWorkAreaCityDropDown = (value) => {
        axiosInstance
            .post("CommonHC/GetCityData", {
                StateId: [value],
            })
            .then((res) => {
                const data = res?.data?.message;
                const cities = data?.map((ele) => {
                    return {
                        value: handleSplitData(ele?.ID),
                        label: ele?.City,
                    };
                });

                setWorkAreaCities(cities);
            })
            .catch((err) => {
                toast.error(err?.res?.data ? err?.res?.data : "Something Went Wrong");
            });
    };

    const getStateDropDown = () => {
        axiosInstance
            .post("CommonHC/GetStateData", {
                BusinessZoneID: 0,
            })
            .then((res) => {
                const data = res?.data?.message;
                const States = data?.map((ele) => {
                    return {
                        // ID: ele?.ID,
                        value: ele?.ID,
                        label: ele?.State,
                    };
                });
                // States?.unshift({ label: t("Select State"), value: "" });
                setStates(States);
            })
            .catch((err) => {
                toast.error(err?.res?.data ? err?.res?.data : "Something Went Wrong");
            });
    };

    useEffect(() => {
        findGender();
    }, [formData?.Title]);



    const getCountryDropDown = () => {
        axiosInstance
            .get("CommonHC/GetCountryData")
            .then((res) => {
                const data = res?.data?.message;
                const Country = data.map((ele) => {
                    return {
                        value: ele?.CountryID,
                        IsBaseCurrency: ele?.IsBaseCurrency,
                        label: ele?.CountryName,
                    };
                });
                // Country?.unshift({ label: t("India"), value: 1 });
                setCountry(Country);

                setFormData((prev) => {
                    return {
                        ...prev,
                        CountryID: Country[0]?.value
                    }
                })
            })
            .catch((err) => {
                toast.error(err?.res?.data ? err?.res?.data : "Something Went Wrong");
            });
    };
    useEffect(() => {
        getCountryDropDown();
        getStateDropDown();
        getDropDownData("Gender");
        getDropDownData("Title");
    }, []);

    // Pre-fill form when navigated from approval screen with a PhleboId
    useEffect(() => {
        if (!phleboId) return;

        const fetchAndFill = async () => {
            try {
                const res = await axiosInstance.post(
                    "TemporaryPheleboApproval/GetTempPhelebotomist",
                    { pheleboid: phleboId }
                );
                if (res.data?.success && res.data?.message?.length > 0) {
                    const d = res.data.message[0];

                    // --- Parse Age (e.g. "24" plain number) ---
                    let ageYear = "";
                    let ageMonth = "";
                    let ageDays = "";
                    let dob = "";
                    const ageStr = d?.Age;
                    if (ageStr) {
                        const matched = String(ageStr).match(/(\d+)\s*Y\s*(\d+)\s*M\s*(\d+)\s*D/i);
                        if (matched) {
                            ageYear  = matched[1];
                            ageMonth = matched[2];
                            ageDays  = matched[3];
                        } else if (!isNaN(Number(ageStr))) {
                            ageYear = String(ageStr);
                        }
                        if (ageYear) {
                            dob = moment()
                                .subtract(Number(ageYear), "years")
                                .subtract(Number(ageMonth || 0), "months")
                                .subtract(Number(ageDays  || 0), "days")
                                .toDate();
                        }
                    }

                    // --- Work area: first ID from comma-separated StateIds / CityIds ---
                    const firstWorkState = d?.StateIds
                        ? d.StateIds.split(",")[0].trim()
                        : "";
                    const firstWorkCity = d?.CityIds
                        ? d.CityIds.split(",")[0].trim()
                        : "";

                    // Load the work-area city dropdown for that state, then set city
                    if (firstWorkState) {
                        // Inline fetch so we can set WorkAreaCity right after cities load
                        axiosInstance
                            .post("CommonHC/GetCityData", { StateId: [firstWorkState] })
                            .then((cityRes) => {
                                const cityData = cityRes?.data?.message || [];
                                const mappedCities = cityData.map((ele) => ({
                                    value: ele?.ID?.split("#")[0],
                                    label: ele?.City,
                                }));
                                setWorkAreaCities(mappedCities);
                                // Now safe to set WorkAreaCity — dropdown options exist
                                setFormData((prev) => ({
                                    ...prev,
                                    WorkAreaCity: firstWorkCity,
                                }));
                            })
                            .catch(() => {});
                    }

                    setFormData((prev) => ({
                        ...prev,
                        Temp_PhlebotomistID: d?.Temp_PhlebotomistID || 0,
                        PName:         d?.Name?.trim()    || "",
                        Gender:        d?.Gender          || "Male",
                        Mobile:        d?.Mobile          || "",
                        Email:         d?.Email           || "",
                        FatherName:    d?.FatherName      || "",
                        HouseNo:       d?.P_Address       || "",
                        Pincode:       d?.P_Pincode       || "",
                        CityID:        d?.P_City ? String(d.P_City) : "",
                        VehicleNum:    d?.Vehicle_Num     || "",
                        drivingLicence: d?.DrivingLicence || "",
                        DocumentType:  d?.DucumentType    || "",
                        DocumentNo:    d?.DucumentNo      || "",
                        WorkAreaState: firstWorkState,
                        // WorkAreaCity set in the async city-fetch callback above
                        AgeYear:  ageYear,
                        AgeMonth: ageMonth,
                        AgeDays:  ageDays,
                        DOB:      dob || "",
                        Age:      ageStr || "",
                    }));
                }
            } catch (err) {
                console.error("Error fetching phlebo for edit", err);
            }
        };

        fetchAndFill();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [phleboId]);

    const getDropDownData = (name) => {
        const match = ["Title", "Gender"];
        axiosInstance
            .post("Global/getGlobalData", { Type: name })
            .then((res) => {
                let data = res?.data?.message;
                let value = data?.map((ele) => {
                    return {
                        value: match.includes(name) ? ele?.FieldDisplay : ele?.FieldID,
                        label: ele?.FieldDisplay,
                    };
                });
                !["Title"].includes(name) &&
                    value.unshift({ label: `Select ${name} `, value: "" });

                switch (name) {
                    case "Gender":
                        const extractedGenders = value
                            ?.filter((option) => option?.value != "Both")
                            .map((option) => {
                                return {
                                    value: option?.value,
                                    label: option?.label,
                                };
                            });

                        setGender(extractedGenders);
                        break;
                    case "Title":
                        setTitle(value);
                        break;

                    default:
                        break;
                }
            })
            .catch((err) => console.log(err));
    };

    const generateOtp = async () => {
        if (!formData.Mobile) {
            toast.error("Please enter mobile number")
            return
        }
        if (formData.Mobile.length !== 10) {
            toast.error("Please enter valid mobile number")
            return
        }
        setOtpLoading(true)
        try {
            const res = await axiosInstance.post("TemporaryPheleboApproval/GenerateOTP", { mobileNo: formData?.Mobile })
            if (res?.data.success) {
                toast.success(res?.data?.message)
            } else {
                toast.error(res?.data?.message)
            }
        } catch (error) {
            console.log("Failed to generate otp", error)
        } finally {
            setOtpLoading(false)
        }
    }
    
    return (
        <>
            <Accordion
                name={t("Temporary Phlebotomist")}
                defaultValue={true}
                isBreadcrumb={true}
            >
                {/* <div className="mt-3 px-1"> */}
                <div className="row col-sm-12 mt-2">
                    <div className="col-sm-2 ">
                        <div className="d-flex">
                            <div style={{ width: "40%", height: "10px" }}>
                                <ReactSelect
                                    dynamicOptions={title}
                                    name="Title"
                                    id="Title"
                                    lable="Title"
                                    removeIsClearable={true}
                                    placeholderName={t("Title")}
                                    value={formData?.Title}
                                    onChange={handleSelectChange}
                                />
                            </div>

                            <div style={{ width: "60%" }}>
                                <Input
                                    id="PName"
                                    lable="Name"
                                    placeholder=" "
                                    name="PName"
                                    type="text"
                                    className="required-fields"
                                    max={30}
                                    value={formData?.PName}
                                    autoComplete="off"
                                    onChange={handleSelectInputChange}
                                />
                                {formData?.PName && (
                                    <span className="error-message">{errors?.PName}</span>
                                )}
                                {/* {formData?.PName.trim().length > 0 &&
                                        formData?.PName.trim().length && (
                                            <span className="error-message">{errors?.PNames}</span>
                                        )} */}
                            </div>
                        </div>
                    </div>

                    <div className="col-sm-2">
                        <div className="d-flex">
                            <Input
                                placeholder="Y"
                                name="AgeYear"
                                type="number"
                                className="required-fields"
                                style={{ width: "10%" }}
                                value={formData?.AgeYear}
                                onInput={(e) => number(e, 3, 120)}
                                onChange={handleDOBCalculation}
                            />
                            <Input
                                placeholder="M"
                                name="AgeMonth"
                                type="number"
                                className="required-fields"
                                // placeholder="M"
                                onInput={(e) => number(e, 2, 12)}
                                disabled={
                                    RadioDefaultSelect === "DOB"
                                        ? true
                                        : formData?.AgeYear
                                            ? false
                                            : true
                                }
                                value={formData?.AgeMonth}
                                onChange={handleDOBCalculation}
                            />

                            <Input
                                placeholder="D"
                                name="AgeDays"
                                type="number"
                                className="required-fields"
                                // placeholder="D"
                                onInput={(e) => number(e, 2, 31)}
                                disabled={
                                    RadioDefaultSelect === "DOB"
                                        ? true
                                        : formData?.AgeMonth
                                            ? false
                                            : true
                                }
                                value={formData?.AgeDays}
                                onChange={handleDOBCalculation}
                            />
                        </div>
                    </div>

                    <div className="col-sm-2 ">
                        <DatePicker
                            name="DOB"
                            value={formData?.DOB}
                            className="required-fields custom-calendar"
                            placeholder=" "
                            id="DOB"
                            lable="DOB"
                            onChange={dateSelect}
                            maxDate={new Date()}
                        ></DatePicker>

                        {formData?.DOB === "" && (
                            <span className="error-message">{errors?.DOB}</span>
                        )}
                    </div>

                    <div className="col-sm-2 ">
                        <ReactSelect
                            dynamicOptions={gender}
                            name="Gender"
                            id="Gender"
                            lable="Gender"
                            className="required-fields"
                            removeIsClearable={true}
                            placeholderName={t("Gender")}
                            value={formData?.Gender}
                            onChange={handleSelectChange}
                            isDisabled={
                                ["Baby"].includes(formData?.Title)
                                    ? false
                                    : formData?.Title
                                        ? true
                                        : false
                            }
                        />
                        {formData?.Gender === "" && (
                            <span className="error-message">{errors?.Gender}</span>
                        )}
                    </div>
                    <div className="col-sm-2">
                        <Input
                            id="Mobile No"
                            lable="Mobile No"
                            placeholder=" "
                            type="text"
                            onInput={(e) => number(e, 10)}
                            name="Mobile"
                            value={formData?.Mobile}
                            onChange={handleSelectInputChange}
                            maxLength={10}
                        />
                        {formData?.Mobile === "" && (
                            <span className="error-message">{errors?.Mobile}</span>
                        )}
                    </div>
                    <div className="col-sm-2 ">
                        <Input
                            id="Email"
                            lable="Email"
                            name="Email"
                            maxLength={30}
                            value={formData?.Email}
                            type="text"
                            autoComplete="off"
                            placeholder=" "
                            onChange={handleSelectInputChange}
                        />

                        {formData?.Email &&
                            !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(
                                formData?.Email,
                            ) && <span className="error-message">{errors?.Emailvalid}</span>}
                    </div>
                    <div className="col-sm-2 ">
                        <ReactSelect
                            dynamicOptions={[{ label: "Select Country", value: "" }, ...country]}
                            name="CountryID"
                            id="Country"
                            lable="Country"
                            removeIsClearable={true}
                            placeholderName={t("Country")}
                            value={formData?.CountryID}
                            onChange={handleSelectChange}
                        />
                        {formData?.CountryID === "" && (
                            <span className="error-message">{errors?.CountryID}</span>
                        )}
                    </div>
                    <div className="col-sm-2">
                        <Input
                            name="HouseNo"
                            type="text"
                            max={20}
                            autoComplete="off"
                            placeholder=" "
                            id="HouseNo"
                            lable="HouseNo"
                            className="required-fields"
                            value={formData?.HouseNo}
                            onChange={handleSelectInputChange}
                        />
                        {formData?.HouseNo?.trim().length > 0 &&
                            formData?.HouseNo?.trim().length < 2 && (
                                <span className="error-message">{errors?.HouseNo}</span>
                            )}
                    </div>

                    <div className="col-sm-2 ">
                        <ReactSelect
                            dynamicOptions={[{ label: "Select State", value: "" }, ...states]}
                            name="StateID"
                            id="State"
                            lable="State"
                            className="required-fields"
                            removeIsClearable={true}
                            placeholderName={t("State")}
                            value={formData?.StateID}
                            onChange={handleSelectChange}
                        />
                        {formData?.StateID === "" && (
                            <span className="error-message">{errors?.StateID}</span>
                        )}
                    </div>

                    <div className="col-sm-2 ">
                        <ReactSelect
                            dynamicOptions={[{ label: "Select City", value: "" }, ...cities]}
                            name="CityID"
                            id="City"
                            lable="City"
                            className="required-fields"
                            removeIsClearable={true}
                            placeholderName={t("City")}
                            value={formData?.CityID}
                            onChange={handleSelectChange}
                        />
                        {formData?.CityID === "" && (
                            <span className="error-message">{errors?.CityID}</span>
                        )}
                    </div>
                    <div className="col-sm-2 ">
                        <ReactSelect
                            dynamicOptions={[{ label: "Select Area", value: "" }, ...locality]}
                            name="LocalityID"
                            id="Area"
                            lable="Area"
                            className="required-fields"
                            removeIsClearable={true}
                            placeholderName={t("Area")}
                            value={formData?.LocalityID}
                            onChange={handleSelectChange}
                        />
                        {formData?.LocalityID === "" && (
                            <span className="error-message">{errors?.LocalityID}</span>
                        )}
                    </div>
                    <div className="col-sm-2 ">
                        <Input
                            placeholder=" "
                            id="Pincode"
                            lable="Pincode"
                            name="Pincode"
                            value={formData.Pincode}
                            maxLength={6}
                            className="required-fields"
                            autoComplete="off"
                            type="number"
                            onInput={(e) => number(e, 6)}
                            onChange={handleSelectInputChange}
                        />

                        {formData?.Pincode === "" && (
                            <span className="error-message">{errors?.LocalityID}</span>
                        )}
                    </div>
                    <div className="col-sm-2 ">
                        <Input
                            id="Landmark"
                            lable="Landmark"
                            name="Landmark"
                            type="text"
                            max={30}
                            autoComplete="off"
                            value={formData?.Landmark}
                            placeholder=" "
                            onChange={handleSelectInputChange}
                        />

                        {formData?.Landmark?.trim().length > 0 &&
                            formData?.Landmark?.trim().length < 3 && (
                                <span className="error-message">{errors?.Landmark}</span>
                            )}
                    </div>
                    <div className="col-sm-2 ">
                        <ReactSelect
                            dynamicOptions={[{ label: "Select State", value: "" }, ...states]}
                            name="WorkAreaState"
                            id="WorkAreaState"
                            lable="Work Area State"
                            className="required-fields"
                            removeIsClearable={true}
                            placeholderName={t("Work Area State")}
                            value={formData?.WorkAreaState}
                            onChange={handleSelectChange}
                        />
                        {formData?.WorkAreaState === "" && (
                            <span className="error-message">{errors?.WorkAreaState}</span>
                        )}
                    </div>

                    <div className="col-sm-2 ">
                        <ReactSelect
                            dynamicOptions={[{ label: "Select City", value: "" }, ...workAreaCities]}
                            name="WorkAreaCity"
                            id="WorkAreaCity"
                            lable="Work Area City"
                            className="required-fields"
                            removeIsClearable={true}
                            placeholderName={t("Work Area City")}
                            value={formData?.WorkAreaCity}
                            onChange={handleSelectChange}
                        />
                        {formData?.WorkAreaCity === "" && (
                            <span className="error-message">{errors?.WorkAreaCity}</span>
                        )}
                    </div>
                    <div className="col-sm-2">
                        <Input
                            id="VehicleNum"
                            lable="Vehicle Number"
                            placeholder=" "
                            type="text"
                            onInput={(e) => number(e, 10)}
                            name="VehicleNum"
                            value={formData?.VehicleNum}
                            onChange={handleSelectInputChange}
                            maxLength={10}
                        />
                        {formData?.VehicleNum === "" && (
                            <span className="error-message">{errors?.VehicleNum}</span>
                        )}
                    </div>
                    <div className="col-sm-2">
                        <Input
                            id="drivingLicence"
                            lable="Driving Licence"
                            placeholder=" "
                            type="text"
                            onInput={(e) => number(e, 10)}
                            name="drivingLicence"
                            value={formData?.drivingLicence}
                            onChange={handleSelectInputChange}
                            maxLength={20}
                        />
                        {formData?.drivingLicence === "" && (
                            <span className="error-message">{errors?.drivingLicence}</span>
                        )}
                    </div>
                    <div className="col-sm-2">
                        <ReactSelect
                            dynamicOptions={[{ label: "Choose ID", value: "" }, ...DocumentType]}
                            id="DocumentType"
                            className="required-fields"
                            lable="DocumentType"
                            name="DocumentType"
                            removeIsClearable={true}
                            placeholderName={t("DocumentType")}
                            value={formData?.DocumentType}
                            onChange={handleSelectChange}
                        />
                        {formData?.DocumentType === "" && (
                            <span className="error-message">{errors?.DocumentType}</span>
                        )}
                    </div>
                    <div className="col-sm-2">
                        <Input
                            type="text"
                            name="DocumentNo"
                            placeholder=" "
                            id="DocumentNo"
                            lable="DocumentNo"
                            className="required-fields"
                            onChange={handleSelectInputChange}
                            value={formData?.DocumentNo}
                            max={20}
                        />
                        {formData?.DocumentNo?.trim() === "" && (
                            <span className="error-message">{errors?.DocumentNo}</span>
                        )}
                    </div>


                </div>
                <div className="row mx-2 my-2 d-flex justify-content-center align-items-center">
                    <div className="col-sm-auto">
                        <CustomButton
                            text={t("Generate OTP")}
                            onClick={generateOtp}
                            disabled={otpLoading}
                        />
                    </div>
                    <div className="col-sm-2">
                        <Input
                            type="text"
                            name="OTP"
                            placeholder=" "
                            id="OTP"
                            lable="OTP"
                            className="required-fields"
                            onChange={handleSelectInputChange}
                            value={formData?.OTP}
                            max={8}
                        />
                    </div>
                    <div className="col-sm-auto">
                        {load ? (
                            <Loading />
                        ) : (
                            <SaveButton
                                text={t("Save")}
                                onClick={handleSave}
                                loading={load}
                            />
                        )}
                    </div>
                    <div className="col-sm-auto">
                        <CancelButton
                            text={t("Reset")}
                            onClick={() => {
                                setFormData([]);
                            }}
                        />
                    </div>
                </div>

            </Accordion>
        </>
    );
};

export default TemporaryPhlebotomist;
