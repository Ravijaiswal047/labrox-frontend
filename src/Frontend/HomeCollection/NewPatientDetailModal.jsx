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

import Accordion from "@app/components/UI/Accordion";
import { NewPatientModalValidationSchema } from "../../utils/Schema";
import { PreventSpecialCharacterandNumber } from "../util/Commonservices";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { axiosInstance } from "../../utils/axiosInstance";
import { CancelButton, SaveButton } from "../../components/UI/CustomButton";

const NewPatientDetailModal = ({ show, handleClose, mobile, showDetail }) => {
  const [RadioDefaultSelect, setRadioDefaultSelect] = useState("Age");
  const [formData, setFormData] = useState(HCNewPatientForm);
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
  const [locality, setLocality] = useState([]);
  const [country, setCountry] = useState([]);
  const { t } = useTranslation();
  const initialRender = useRef(true);

  console.log(formData);
  const handleSave = () => {
    console.log("formData",formData);
    const generatedError = NewPatientModalValidationSchema(formData);
    console.log(formData);
    const updatedFormData = {
      ...formData,
      LocalityID: formData?.LocalityID?.toString(),
      StateID: formData?.StateID?.toString(),
      CountryID: formData?.CountryID?.toString(),
      AgeDays: ageCount(
        formData?.AgeYear,
        formData?.AgeMonth,
        formData?.AgeDays,
      ),
      Age: `${formData?.AgeYear == "" ? 0 : formData?.AgeYear} Y ${
        formData?.AgeMonth == "" ? 0 : formData?.AgeMonth
      } M ${ageCount(
        formData?.AgeYear,
        formData?.AgeMonth,
        formData?.AgeDays,
      )} D `,

      AgeMonth: formData?.AgeMonth == "" ? 0 : formData?.AgeMonth,
      AgeYear: formData?.AgeYear == "" ? "" : formData?.AgeYear?.toString(),
      TotalAgeInDays:
        formData?.AgeDays == 0 &&
        formData?.AgeMonth == 0 &&
        formData?.AgeYear == 0
          ? 1
          : formData?.TotalAgeInDays,
    };
    console.log(generatedError);
    if (generatedError === "") {
      setLoad(true);
      axiosInstance
        .post(
          "CustomerCare/SaveNewPatient",
          getTrimmedData({
            NewPatientData: updatedFormData,
          }),
        )
        .then((res) => {
          if (res?.data?.success) {
            console.log(formData);
            toast.success(res?.data?.message);
            setFormData(HCNewPatientForm);
            setCity([]);
            setLocality([]);
            setErros({});
            handleClose();
            showDetail();
          } else {
            toast.error(res?.data?.message);
          }
          setLoad(false);
        })
        .catch((err) => {
          setLoad(false);
          toast.error(
            err?.response?.data?.message
              ? err?.response?.data?.message
              : "Error Occured",
          );
        });
    } else {
      setLoad(false);
      setErros(generatedError);
    }
  };
  const ageCount = (y, m, d) => {
    if (y == 0 && m == 0 && d == 0) {
      return 1;
    } else {
      return d == "" ? 0 : d;
    }
  };
  // console.log(formData);

  // const getId = (names, value) => {
  //   const data = names.find((ele) => value === ele?.value);
  //   return data.ID;
  // };

  const handleSelectChange = (name, event) => {
    const {value } = event;

    if (name === "StateID") {
      getCityDropDown(value);
      setFormData({
        ...formData,
        [name]: value,
        CityID: "",
        LocalityID: "",
        Pincode: "",
      });
    }

    if (name === "CityID") {
      getLocalityDropDown(value);
      setFormData({ ...formData, [name]: value, LocalityID: "", Pincode: "" });
    }

    if (name === "LocalityID") {
      console.log("name,value", name, value);
      getPinCode(value, name);
      setFormData({ ...formData, [name]: value?.toString() , Pincode: "" });
      console.log("formData",formData);
    }

    if (
      name === "Mobile" ||
      name === "Title" ||
      name === "Gender" ||
      name === "CountryID"
    )
      {
        setFormData({ ...formData, [name]: value });
      }
    
  };

  const handleSelectInputChange = (event) => {
    const { name, value } = event?.target;

    if (name === "Pincode") {
      return;
    }

    if (     
      name === "AgeWise" ||
      name === "Pincode" ||
      name === "Email"
    )
      {setFormData({ ...formData, [name]: value });}
    if (name === "Landmark") {
      setFormData({
        ...formData,
        [name]: AllowCharactersNumbersAndSpecialChars(value)
          ? value
          : formData[name],
      });
    }
    if (name === "PName") {
      setFormData({
        ...formData,
        [name]: PreventSpecialCharacterandNumber(value)
          ? value
          : formData[name],
      });
    }
    if (name === "HouseNo") {
      setFormData({
        ...formData,
        [name]: AllowCharactersNumbersAndSpecialChars(value)
          ? value
          : formData[name],
      });
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
    axios
      .post("/api/v1/CustomerCare/BindPinCode", {
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
    axios
      .post("/api/v1/CustomerCare/BindLocality", {
        cityid: value,
      })
      .then((res) => {
        if(res?.data?.success && Array.isArray(res?.data?.message)) {
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
    axios
      .post("/api/v1/CommonHC/GetCityData", {
        StateId: [value],
      })
      .then((res) => {
        const data = res?.data?.message;
        const cities = data?.map((ele) => {
          return {
            // ID: handleSplitData(ele?.ID),

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

  const getStateDropDown = () => {
    axios
      .post("/api/v1/CommonHC/GetStateData", {
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

  const setMobile = () => {
    setFormData({ ...formData, Mobile: mobile });
  };

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

        setFormData((prev)=>{
          return{
            ...prev,
            CountryID:Country[0]?.value
          }
        })
      })
      .catch((err) => {
        toast.error(err?.res?.data ? err?.res?.data : "Something Went Wrong");
      });
  };
  useEffect(() => {
    setMobile();
    getCountryDropDown();
    getStateDropDown();
    getDropDownData("Gender");
    getDropDownData("Title");
  }, []);

  const getDropDownData = (name) => {
    const match = ["Title", "Gender"];
    axios
      .post("/api/v1/Global/getGlobalData", { Type: name })
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
  const theme = useLocalStorage("theme", "get");
  const isMobile = window.innerWidth <= 768;
  return (
    <>
      {/* <Dialog
        visible={show}
        header={t("New Patient Details")}
        className={theme}
        style={{
          width: isMobile ? "80vw" : "80vw",
        }}
        onHide={handleClose}
      > */}
      <div className="mt-3 px-1">
          <div className="row">
          <div className="col-sm-2">
            <Input
              id="Mobile No"
              lable="Mobile No"
              placeholder=" "
              type="text"
              disabled={true}
              name="Mobile"
              value={mobile}
            />
          </div>
          <div className="col-sm-2 ">
            <div className="d-flex">
              <div style={{ width: "40%", height: "10px" }}>
                {/* <SelectBox
                  name="Title"
                  id="Title"
                  lable="Title"
                  options={title}
                  selectedValue={formData?.Title}
                  onChange={handleSelectChange}
                /> */}
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
                  lable="PatientName"
                  placeholder=" "
                  name="PName"
                  type="text"
                  className="required-fields"
                  max={30}
                  value={formData?.PName}
                  autoComplete="off"
                  onChange={handleSelectInputChange}
                />
                {formData?.PName?.trim() === "" && (
                  <span className="error-message">{errors?.PName}</span>
                )}
                {formData?.PName.trim().length > 0 &&
                  formData?.PName.trim().length && (
                    <span className="error-message">{errors?.PNames}</span>
                  )}
              </div>
            </div>
          </div>

          <div className=" col-sm-2">
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
            {/* <SelectBox
              name="Gender"
              options={gender}
              id="Gender"
              lable="Gender"
              className="required-fields"
              selectedValue={formData?.Gender}
              isDisabled={
                ["Baby"].includes(formData?.Title)
                  ? false
                  : formData?.Title
                    ? true
                    : false
              }
              onChange={handleSelectChange}
            /> */}
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
          <div className="col-sm-2 ">
            {/* <SelectBox
              name="CountryID"
              options={[{ label: "Select Country", value: "" }, ...country]}
              id="Country"
              lable="Country"
              className="required-fields"
              selectedValue={formData?.CountryID}
              onChange={handleSelectChange}
            /> */}
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
        </div>
        <div className="row">
          <div className="col-sm-2 ">
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
            {formData?.HouseNo.trim().length > 0 &&
              formData?.HouseNo.trim().length < 2 && (
                <span className="error-message">{errors?.HouseNo}</span>
              )}
          </div>

          <div className="col-sm-2 ">
            {/* <SelectBox
              options={[{ label: "Select State", value: "" }, ...states]}
              name="StateID"
              id="State"
              lable="State"
              className="required-fields"
              selectedValue={formData?.StateID}
              onChange={handleSelectChange}
            /> */}
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
            {/* <SelectBox
              options={[{ label: "Select City", value: "" }, ...cities]}
              name="CityID"
              id="City"
              lable="City"
              className="required-fields"
              selectedValue={formData?.CityID}
              onChange={handleSelectChange}
            /> */}
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
            {/* <SelectBox
              name="LocalityID"
              options={[{ label: "Select Area", value: "" }, ...locality]}
              id="Area"
              lable="Area"
              className="required-fields"
              selectedValue={formData?.LocalityID}
              onChange={handleSelectChange}
            /> */}
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

            {formData?.Email.trim().length > 0 &&
              !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(
                formData?.Email,
              ) && <span className="error-message">{errors?.Emailvalid}</span>}
          </div>
        </div>
        <div className="row">
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

            {formData?.Landmark.trim().length > 0 &&
              formData?.Landmark.trim().length < 3 && (
                <span className="error-message">{errors?.Landmark}</span>
              )}
          </div>
          <div className="col-sm-2">
            {load ? (
              <Loading />
            ) : (
              // <button
              //   type="button"
              //   className="btn btn-primary btn-block btn-sm"
              //   onClick={handleSave}
              // >
              //   {t("Register New Patient")}
              // </button>
              <SaveButton
                text={t("Register New Patient")}
                onClick={handleSave}
                loading={load}
              />
            )}
          </div>
          <div className="col-sm-1">
            {/* <button
              type="button"
              className="btn btn-primary btn-block btn-sm"
              onClick={() => {
                handleClose();
                setFormData([]);
              }}
            >
              {t("Close")}
            </button> */}
            <CancelButton
              text={t("Close")}
              onClick={() => {
                handleClose();
                setFormData([]);
              }}
            />
          </div>
        </div>
      </div>
        
      {/* </Dialog> */}
    </>
  );
};

export default NewPatientDetailModal;
