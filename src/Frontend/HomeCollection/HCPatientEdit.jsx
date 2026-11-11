import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import moment from "moment";
import { UpdatePatientValidation } from "../../utils/Schema";

import Input from "../../components/formComponent/Input";
import { SelectBox } from "../../components/formComponent/SelectBox";
import DatePicker from "../../components/formComponent/DatePicker";
import Accordion from "@app/components/UI/Accordion";
import Tables from "../../components/UI/customTable";
import Loading from "../../components/loader/Loading";
import { AllowedSpecialChar, number, PreventSpecialCharacterandNumber } from "../../utils/helpers";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { CancelButton, CustomButton, EditButton, SearchButton } from "../../components/UI/CustomButton";
const HomeCollectionPatientEdit = () => {
  const [loading, setLoading] = useState(false); // for loading screen
  const [errors, setErros] = useState({}); // for setting errors
  const [RadioDefaultSelect, setRadioDefaultSelect] = useState("Age"); // toggling between age and dob
  const [states, setStates] = useState([]); // storing states
  const [cities, setCities] = useState([]); // storing cities
  const [Locality, setLocality] = useState(null); // storing locality
  const [mobile, setMobile] = useState(""); // storing monile number to search details
  const [Gender, setGender] = useState([]); // storing genders
  const [Title, setTitle] = useState([]); // storing titles
  const [detailPage, setDetailpage] = useState(true); // used for toggling between main page and update page
  const [patientDetails, setpatientDetails] = useState(null); // used for storing all patient details
  const [phleboTable, setPhleboTable] = useState(null); // used for storing list of phelbo data fetched from api
  const [DateData, setDateData] = useState({
    AgeYear: "",
    AgeMonth: "",
    AgeDays: "",
  }); //this state is used for mapping date and for better convirsion with in dob and number of years,months and days

  //used for translation
  const { t } = useTranslation();

  //fetching State
  const fetchStates = () => {
    axios
      .post("api/v1/CommonHC/GetStateData", {
        BusinessZoneID: 0,
      })
      .then((res) => {
        let data = res.data.message;
        let value = data.map((ele) => {
          return {
            value: ele.ID,
            label: ele.State,
            id: ele.ID,
          };
        });
        setStates(value);
      })
      .catch((err) => {
        console.log(err);
        toast.error("Something went wrong");
      });
  };
  const fetchPincode = (val) => {
    if (val !== "") {
      axios
        .post("api/v1/CustomerCare/BindPinCode", {
          LocalityID: val?.toString(),
        })
        .then((res) => {
          let data = res.data.message;
          setpatientDetails((patientDetails) => ({
            ...patientDetails,
            Pincode: data[0].pincode,
          }));
        })
        .catch((err) => {
          console.log(err);
          toast.error("Something went wrong");
        });
    } else {
      setpatientDetails((patientDetails) => ({
        ...patientDetails,
        Pincode: "",
      }));
    }
  };

  // fetching states
  const fetchCities = (id) => {
    const postdata = {
      StateId: [id],
    };
    axios
      .post("api/v1/CommonHC/GetCityData", postdata)
      .then((res) => {
        let data = res.data.message;
        let value = data.map((ele) => {
          return {
            value: handleSplitData(ele.ID),
            label: ele.City,
          };
        });
        setCities(value);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  //fetching locality
  const fetchLocality = (id) => {
    const postdata = {
      cityid: id,
    };
    axios
      .post("api/v1/CustomerCare/BindLocality", postdata)
      .then((res) => {
        let data = res.data.message;
        let value = data.map((ele) => {
          return {
            value: ele.id,
            label: ele.NAME,
          };
        });
        setLocality(value);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  //used for spliting cityid because cityid comes in diffrent formate
  const handleSplitData = (id) => {
    const data = id.split("#")[0];
    return data;
  };

  // used for fetching state , gender and title
  useEffect(() => {
    fetchStates();
    getDropDownData("Gender");
    getDropDownData("Title");
  }, []);

  //fetching options for gender and title
  const getDropDownData = (name) => {
    const match = ["Title", "Gender"];
    axios
      .post("/api/v1/Global/getGlobalData", { Type: name })
      .then((res) => {
        let data = res.data.message;
        let value = data.map((ele) => {
          return {
            value: match.includes(name) ? ele.FieldDisplay : ele.FieldID,
            label: ele.FieldDisplay,
          };
        });
        !["Title"].includes(name) &&
          value.unshift({ label: `Select ${name} `, value: "" });

        switch (name) {
          case "Gender":
            setGender(value);
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

  // finding gender according to title
  const findGender = () => {
    const male = ["Mr.", "Baba", "Dr."];

    const female = ["Miss.", "Mrs.", "Dr.(Miss)", "Dr.(Mrs)", "Ms."];

    if (male.includes(patientDetails?.title)) {
      setpatientDetails({ ...patientDetails, Gender: "Male" });
    }
    if (female.includes(patientDetails?.title)) {
      setpatientDetails({ ...patientDetails, Gender: "Female" });
    }
  };

  // if title chnages sets gender accordingly
  useEffect(() => {
    findGender();
  }, [patientDetails?.title]);

  // searching patient details with mobile no
  const handleSearch = async () => {
    setLoading(true);
    setPhleboTable(null);
    if (mobile.length === 10) {
      await axios
        .post("api/v1/updatehc/BindOldPatientHC", {
          mobile: mobile,
        })
        .then((res) => {
          if(res.data?.success && Array.isArray(res.data?.message)){
             setLoading(false);
            const data = res.data.message;
            toast.success("Found Details");
            setDetailpage(true);
            setPhleboTable(data);
          } else  {
            toast.error("No Details Found ");
          }
        })
        .catch((err) => {
          setLoading(false);
          console.log(err);
          toast.error(
            err?.res?.data ? err?.res?.data : "No Patient registerd ",
          );
        });
      setLoading(false);
    } else {
      toast.error("Enter Correct mobile no ");
    }
    setLoading(false);
  };
  // search by pressing enter
  const handleSearchbyenter = (e) => {
    //e.preventDefault();
    if (e.which === 13) {
      handleSearch();
    }
  };

  // setting names of state/city/locality accoeding to their id in patient details
  const getName = (name, id) => {
    if (name == "StateId") {
      for (let i of states) {
        if (i.value == id) {
          return i.label;
        }
      }
    }
    if (name == "CityId") {
      for (let i of cities) {
        if (i.value == id) {
          return i.label;
        }
      }
    }
    if (name == "LocalityId") {
      for (let i of Locality) {
        if (i.value == id) {
          return i.label;
        }
      }
    }
  };

  const handleInputSelectChange = async (event) => {
    const { name, value, checked, type } = event?.target;
      setpatientDetails((patientDetails) => ({
        ...patientDetails,
        [name]: type === "checkbox" ? checked : value,
      }));
    // if (name === "Name") {
    //   setpatientDetails((patientDetails) => ({
    //     ...patientDetails,
    //     [name]: value,
    //   }));
    // }
  };

  //dynamic option selection
  const handleSelectChange = async (name, event) => {
    const {value} = event;
    if (name === "StateId" || name === "CityId" || name === "LocalityId") {
      if (name === "StateId") {
        fetchCities(value);
        setpatientDetails((patientDetails) => ({
          ...patientDetails,
          [name]: value,
          CityId: "",
          LocalityId: "",
          Pincode: "",
        }));
      }
      if (name === "CityId") {
        setpatientDetails((patientDetails) => ({
          ...patientDetails,
          [name]: value,
          LocalityId: "",
          Pincode: "",
        }));
      }
      if (name === "LocalityId") {
        setpatientDetails((patientDetails) => ({
          ...patientDetails,
          [name]: value,
        }));
        fetchPincode(value);
      }
      if (name === "title") {
        if (value === "Baby") {
          setpatientDetails({ ...patientDetails, Gender: "" });
        } else {
          setpatientDetails((patientDetails) => ({
            ...patientDetails,
            [name]: value,
          }));
        }
      }
    } else {
      setpatientDetails((patientDetails) => ({
        ...patientDetails,
        [name]: value,
      }));
    }
    if (name === "Name") {
      setpatientDetails((patientDetails) => ({
        ...patientDetails,
        [name]: value,
      }));
    }
  };

  // handling cancel button on page
  const handleCancel = () => {
    if (!detailPage) {
      setDetailpage(true);
      setpatientDetails(null);
    } else {
      setMobile("");
      setPhleboTable(null);
    }
  };

  //filtering patient for updation from phelbo table
  const selectPatient = (id) => {
    const filtered = phleboTable.filter((item) => item.Patientid === id);
    const details = filtered[0];
    setpatientDetails((prevState) => ({
      ...prevState,
      Age: details.Age || "",
      Gender: details.Gender || "",
      Patientid: details.Patientid || "",
      houseno: details.houseno || "",
      Locality: details.LocationName || "",
      City: details.City || "",
      Pincode: details.Pincode || "",
      State: details.State || "",
      Mobile: details.Mobile || "",
      Email: details.Email || "",
      title: details.title || "",
      FirstName: details.FirstName || "",
      NAME: details.Name || "",
      DOB: details.DOB || "",
      AgeYear: details.AgeYear || 0,
      AgeMonth: details.AgeMonth || 0,
      AgeDays: details.AgeDays || 0,
      StreetName: details.StreetName || "",
      visitdate: details.visitdate || "",
      TotalAgeInDays: details?.TotalAgeInDays || "",
      StateId: details.StateID || "",
      CityId: details.CityID || "",
      LocalityId: details.LocalityID || "",
      CompanyId: details.CompanyId || "",
      StreetName: details.Age || "",
      iseditd: details.iseditd || "",
      isreg: details.isreg || "",
      lasthcstatus: details.lasthcstatus || "",
      visitdate: details.visitdate || "",
      LandMark: details.LandMark || "",
    }));
    setDetailpage(false);

    const data = new Date(details?.DOB);
    //dateSelect(data, "DOB");
  };

  const ageCount = (y = "0", m = "0", d = "0") => {
    if (y == 0 && m == 0 && d == 0) {
      return 1;
    } else {
      return d == "" ? 0 : d;
    }
  };

  // update patient details
  const updateDetails = () => {
    const generatedError = UpdatePatientValidation(patientDetails);
    console.log(generatedError);
    const Age = `${patientDetails.AgeYear} Y ${patientDetails.AgeMonth} M ${patientDetails.AgeDays} D`;
    const DOB = moment(patientDetails?.DOB).format("DD-MMM-YYYY");
    const state = getName("StateId", patientDetails.StateId);
    const city = getName("CityId", patientDetails.CityId);
    const locality = getName("LocalityId", patientDetails.LocalityId);

    if (generatedError === "") {
      setLoading(true);
      axios
        .post("api/v1/updatehc/UpdateHCData", {
          Age: `${
            patientDetails.AgeYear == "" ? 0 : patientDetails.AgeYear
          } Y ${
            patientDetails.AgeMonth == "" ? 0 : patientDetails.AgeMonth
          } M ${ageCount(
            patientDetails.AgeYear,
            patientDetails.AgeMonth,
            patientDetails.AgeDays,
          )} D `,
          Gender: patientDetails.Gender,
          Patientid: patientDetails.Patientid, //not updating
          houseno: patientDetails.houseno.trim(),
          Locality: locality,
          City: city,
          Pincode: patientDetails.Pincode,
          State: state,
          Mobile: patientDetails.Mobile,
          Email: patientDetails.Email.trim(),
          title: patientDetails.title,
          FirstName: patientDetails.FirstName.trim(),
          DOB: DOB,
          AgeYear: patientDetails.AgeYear == "" ? 0 : patientDetails.AgeYear,
          AgeMonth: patientDetails.AgeMonth == "" ? 0 : patientDetails.AgeMonth,
          AgeDays: ageCount(
            patientDetails.AgeYear,
            patientDetails.AgeMonth,
            patientDetails.AgeDays,
          ),
          StreetName: patientDetails.StreetName.trim(),
          visitdate: patientDetails.visitdate,
          TotalAgeInDays:
            patientDetails?.AgeDays == 0 &&
            patientDetails?.AgeMonth == 0 &&
            patientDetails?.AgeYear == 0
              ? 1
              : patientDetails?.TotalAgeInDays.toString(),
          StateID: Number(patientDetails.StateId),
          CityID: Number(patientDetails.CityId),
          LocalityID: Number(patientDetails.LocalityId),
          LandMark: patientDetails.LandMark.trim(),
        })
        .then((res) => {
          if (res.data.message) {
            setLoading(false);
            toast.success("Saved successfully");
            setDetailpage(true);
            handleSearch();
            setpatientDetails(null);
          }
        })
        .catch((err) => {
          setLoading(false);
          console.log(err);
          toast.error(err?.res?.data ? err?.res?.data : "Something Went wrong");
        });

      setLoading(false);
    }
    setLoading(false);
    setErros(generatedError);
  };

  // calculating dob to days/month/year and vice-versa dynamicaly
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

  const handleDOBCalculation = (e) => {
    const { name, value } = e.target;
    let diff = {};
    let subtractType =
      name === "AgeYear" ? "years" : name === "AgeMonth" ? "months" : "days";

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

    const y = `${duration?._data?.years}`;
    const m = `${duration._data?.months}`;
    const d = `${duration?._data?.days}`;
    const days = ageCount(y, m, d);
    setpatientDetails((patientDetails) => ({
      ...patientDetails,
      [name]: value,
      DOB: diff?._d,
      TotalAgeInDays: moment(moment().format("YYYY-MM-DD")).diff(
        diff?._d,
        "days",
      ),
      Age: `${duration?._data?.years} Y ${duration._data?.months} M ${days} D`,
    }));
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
    const dateToday = moment(new Date()).format("DD-MMM-YYYY");
    const dateValue = moment(value).format("DD-MMM-YYYY");
    if (dateToday == dateValue) {
      days = 1;
      return { years, months, days };
    } else {
      return { years, months, days };
    }
  };

  const calculateTotalNumberOfDays = (value) => {
    const dateToday = moment(new Date()).format("DD-MMM-YYYY");
    const dateValue = moment(value).format("DD-MMM-YYYY");
    if (dateToday === dateValue) {
      return 1;
    } else {
      return moment(moment().format("YYYY-MM-DD")).diff(value, "days");
    }
  };

  const dateSelect = (value, name) => {
    const { years, months, days } = calculateDOB(value);
    setpatientDetails((prevState) => ({
      ...prevState,
      [name]: value,
      AgeYear: years,
      AgeMonth: months,
      AgeDays: days,
      TotalAgeInDays: calculateTotalNumberOfDays(value),
      Age: `${years} Y ${months} M ${days} D`,
    }));
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
  };

  // dynamicaly updating input state
  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    const trimmedValue = value.endsWith("  ") ? value.trimEnd() + " " : value;
    if (name === "FirstName") {
      const Value = PreventSpecialCharacterandNumber(trimmedValue)
        ? trimmedValue.trimStart()
        : patientDetails[name];

      setpatientDetails({
        ...patientDetails,
        [name]: Value.trimStart(),
      });
    } else if (name === "Pincode") {
      return;
    } else if (name === "Email") {
      setpatientDetails({
        ...patientDetails,
        [name]: trimmedValue.trim(),
      });
    } else if (["LandMark", "houseno"].includes(name)) {
      const val = AllowedSpecialChar(value, ["-", "/", " "]);
      setpatientDetails({
        ...patientDetails,
        [name]: val ? val : val === "" ? "" : patientDetails[name],
      });
    } else {
      setpatientDetails({
        ...patientDetails,
        [name]: trimmedValue.trimStart(),
      });
    }
  };

  // // on patient age year change update month also for rendering
  // useEffect(() => {
  //   const e = {
  //     target: {
  //       name: "AgeMonth",
  //       value: patientDetails?.AgeMonth,
  //     },
  //   };
  //   handleDOBCalculation(e);
  // }, [patientDetails?.AgeYear]);

  // on selecting patient for update fetch city and locality accordig to state
  useEffect(() => {
    fetchCities(patientDetails?.StateId);
    fetchLocality(patientDetails?.CityId);
  }, [patientDetails?.StateId, patientDetails?.CityId]);

  return (
    <>
      <Accordion
        name={t("Home Collection Patient Edit")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row pt-2 pl-2 pr-2 mb-1 ">
          <div className="col-sm-3">
            <Input
              type="number"
              name="phoneno"
              value={mobile}
              lable="Mobile No"
              id="Mobile No"
              className="required-fields"
              onInput={(e) => number(e, 10)}
              placeholder=" "
              onChange={(e) => setMobile(e.target.value)}
              onKeyDown={handleSearchbyenter}
            />
          </div>
          <div className="col-sm-2 ">
            <div className="d-flex">
              <SearchButton
                text={t("Search")}
                onClick={handleSearch}
                loading={loading}
                className="mr-2"
              />
              <CancelButton
                text={t("Cancel")}
                onClick={handleCancel}
              />
            </div>
          </div>
        </div>
      </Accordion>
      <Accordion title={t("Search Details")} defaultValue={true}>
        {detailPage ? (
          <>
            {loading && !phleboTable && <Loading />}
            {phleboTable && (
              <>
                <div
                  className="row mt-2 mb-1"
                  style={{ backgroundColor: "skyblue", fontSize: "1.3rem" }}
                >
                  <label
                    className="col-sm-4 col-md-4 text-center" // Add text-center class for centering text
                    htmlFor="Pending"
                    style={{ margin: "6px auto" }}
                  >
                    &nbsp; Patient List
                  </label>
                  <label
                    className="col-sm-4 col-md-4 text-center" // Add text-center class for centering text
                    htmlFor="Not Registered"
                    style={{ margin: "6px auto" }}
                  >
                    <span
                      style={{
                        backgroundColor: "papayawhip",
                        border: "1px solid",
                      }}
                    >
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    </span>
                    &nbsp; Not Registered
                  </label>
                  <label
                    className="col-sm-4 col-md-4 text-center" // Add text-center class for centering text
                    htmlFor="Registered"
                    style={{ margin: "6px auto" }}
                  >
                    <span
                      style={{
                        backgroundColor: "lightgreen",
                        border: "1px solid",
                      }}
                    >
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    </span>
                    &nbsp; Registered
                  </label>
                </div>

                <div>
                  {loading ? (
                    <Loading />
                  ) : (
                    <>
                      {phleboTable && (
                        <Tables>
                          <thead>
                            <tr>
                              <th className="text-center">{t("Log")}</th>
                              <th className="text-center">{t("#")}</th>
                              <th className="text-center">{t("UHID")}</th>
                              <th className="text-center">
                                {t("Patient Name")}
                              </th>
                              <th className="text-center">{t("Age")}</th>
                              <th className="text-center">{t("Gender")}</th>
                              <th className="text-center">{t("Mobile No")}</th>
                              <th className="text-center">{t("Locality")}</th>
                              <th className="text-center">{t("City")}</th>
                              <th className="text-center">{t("State")}</th>
                              <th className="text-center">{t("Pincode")}</th>
                              <th className="text-center">{t("Reg Date")}</th>
                              <th className="text-center">
                                {t("Last HC Status")}
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {phleboTable &&
                              phleboTable.map((ele, index) => (
                                <>
                                  <tr
                                    key={index}
                                    style={{
                                      backgroundColor: ele?.isreg
                                        ? "papayawhip"
                                        : "lightgreen",
                                    }}
                                  >
                                    <td data-title="#" className="text-center">
                                      {index + 1} &nbsp;
                                    </td>
                                    <td
                                      data-title="Select"
                                      className="text-center"
                                    >
                                      <CustomButton
                                      icon={"edit"}
                                        onClick={() =>
                                          selectPatient(ele?.Patientid)
                                        }
                                      />
                                    </td>
                                    <td
                                      data-title="UHID"
                                      className="text-center"
                                    >
                                      {/* The column is headed UHID, so show the
                                          UHID. This printed the internal Patientid,
                                          which is a different number from the one
                                          Call Centre shows for the same patient. */}
                                      {ele?.PatientCode || ele?.UHID || ""}&nbsp;
                                    </td>
                                    <td
                                      data-title="Name"
                                      className="text-center"
                                    >
                                      {ele?.title}&nbsp;{ele.FirstName}&nbsp;
                                    </td>
                                    <td
                                      data-title="dob"
                                      className="text-center"
                                    >
                                      {ele?.DOB}&nbsp;
                                    </td>
                                    <td
                                      data-title="gender"
                                      className="text-center"
                                    >
                                      {ele.Gender}&nbsp;
                                    </td>
                                    <td
                                      data-title="mobile"
                                      className="text-center"
                                    >
                                      {ele?.Mobile}&nbsp;
                                    </td>
                                    <td
                                      data-title="Locality"
                                      className="text-center"
                                    >
                                      {ele?.LocationName}&nbsp;
                                    </td>
                                    <td
                                      data-title="city"
                                      className="text-center"
                                    >
                                      {ele?.City}&nbsp;
                                    </td>
                                    <td
                                      data-title="state"
                                      className="text-center"
                                    >
                                      {ele?.state}&nbsp;
                                    </td>
                                    <td
                                      data-title="pincode"
                                      className="text-center"
                                    >
                                      {ele?.Pincode}&nbsp;
                                    </td>
                                    <td
                                      data-title="status"
                                      className="text-center"
                                    >
                                      {ele?.visitdate}&nbsp;
                                    </td>
                                    <td
                                      data-title="Cancel"
                                      className="text-center"
                                    >
                                      {ele?.lasthcstatus}&nbsp;
                                    </td>
                                  </tr>
                                </>
                              ))}
                          </tbody>
                        </Tables>
                      )}
                    </>
                  )}
                </div>
              </>
            )}
          </>
        ) : (
          <>
            <div className="row pt-2 pl-2 pr-2 mb-1">
              <div className="col-sm-2">
                <Input
                  type="number"
                  name="mobileno"
                  disabled={true}
                  placeholder=" "
                  value={patientDetails?.Mobile}
                  lable="Mobile No"
                  /* Distinct from the always-mounted search box above, which also
                     had id="Mobile No". Once a row was opened both existed at once.
                     Input feeds this id straight into the label's htmlFor, so a
                     duplicate does not just break selectors - it leaves the label
                     pointing at whichever field the browser resolves first, which
                     for a screen reader is the wrong one. */
                  id="PatientMobileNo"
                  onChange={handleInputSelectChange}
                />
              </div>

              <div className="col-sm-2">
                <Input
                  type="text"
                  // name="FirstName"
                  disabled={true}
                  placeholder=" "
                  value={patientDetails?.Patientid}
                  lable="UHID"
                  id="UHID"
                  onChange={handleChange}
                />
              </div>
              <div className="col-sm-2">
                {/* <SelectBox
                  options={Title}
                  name="title"
                  lable="Title"
                  id="Title"
                  className="required-fields"
                  selectedValue={patientDetails?.title}
                  onChange={handleSelectChange}
                /> */}
                <ReactSelect
                dynamicOptions={Title}
                name="title"
                lable="Title"
                id="Title"
                removeIsClearable={true}
                placeholderName={t("Title")}
                value={patientDetails?.title}
                onChange={handleSelectChange}
              />
                {patientDetails?.title === "" && (
                  <span className="error-message">{errors?.title}</span>
                )}
              </div>
              <div className="col-sm-2">
                <Input
                  lable="FirstName"
                  id="FirstName"
                  className="required-fields"
                  placeholder=" "
                  name="FirstName"
                  type="text"
                  max={35}
                  required
                  value={patientDetails?.FirstName}
                  onChange={handleChange}
                />
                {patientDetails?.FirstName.trim() != "" &&
                  patientDetails?.FirstName.trim().length < 3 && (
                    <span className="error-message">
                      {errors?.FirstNameLength}
                    </span>
                  )}
                {patientDetails?.FirstName.trim() === "" && (
                  <span className="error-message">
                    {errors?.FirstNameNumber}
                  </span>
                )}
              </div>
              <div className="col-sm-2">
                <div className="row">
                  <div className="col-sm-4">
                    <Input
                      className="required-fields"
                      id="AgeY"
                      name="AgeYear"
                      type="number"
                      onInput={(e) => number(e, 3, 120)}
                      value={patientDetails?.AgeYear ?? 0}
                      onChange={handleDOBCalculation}
                    />
                  </div>{" "}
                  <div className="col-sm-4">
                    <Input
                      className="required-fields"
                      id="AgeM"
                      name="AgeMonth"
                      type="number"
                      onInput={(e) => number(e, 2, 12)}
                      value={patientDetails?.AgeMonth}
                      onChange={handleDOBCalculation}
                    />
                  </div>{" "}
                  <div className="col-sm-4">
                    <Input
                      className="required-fields"
                      id="AgeD"
                      name="AgeDays"
                      type="number"
                      onInput={(e) => number(e, 2, 31)}
                      value={patientDetails?.AgeDays}
                      onChange={handleDOBCalculation}
                    />
                  </div>
                  {patientDetails?.AgeYear === "" && (
                    <span className="error-message">{errors?.AgeYear}</span>
                  )}
                </div>
              </div>
              <div className="col-sm-2">
                <DatePicker
                  name="DOB"
                  value={new Date(patientDetails?.DOB)}
                  placeholder=" "
                  id="DOB"
                  lable="DOB"
                  className="custom-calendar required-fields"
                  onChange={dateSelect}
                  maxDate={new Date()}
                />
                {patientDetails?.DOB === "" && (
                  <span className="error-message">{errors?.DOB}</span>
                )}
              </div>
            </div>
            <div className="row pt-1 pl-2 pr-2 mb-1">
              <div className="col-sm-2">
                {/* <SelectBox
                  options={Gender}
                  id="Gender"
                  lable="Gender"
                  className="required-fields"
                  selectedValue={patientDetails?.Gender}
                  isDisabled={
                    patientDetails?.title
                      ? patientDetails?.title == "Baby"
                        ? false
                        : true
                      : false
                  }
                  name="Gender"
                  onChange={handleSelectChange}
                /> */}
                <ReactSelect
                dynamicOptions={Gender}
                name="Gender"
                  id="Gender"
                  lable="Gender"
                  className="required-fields"
                removeIsClearable={true}
                placeholderName={t("Gender")}
                value={patientDetails?.Gender}
                onChange={handleSelectChange}
              />
                {patientDetails?.Gender === "" && (
                  <span className="error-message">{errors?.Gender}</span>
                )}
              </div>

              <div className="col-sm-2">
                <Input
                  type="text"
                  name="houseno"
                  max={10}
                  lable="House No"
                  value={patientDetails?.houseno}
                  placeholder=" "
                  id="House No"
                  onChange={handleChange}
                />
              </div>

              <div className="col-sm-2">
                {/* <SelectBox
                  className="required-fields"
                  name="StateId"
                  lable="State"
                  id="State"
                  onChange={handleSelectChange}
                  selectedValue={patientDetails?.StateId}
                  options={[
                    { label: "Select State", value: "" },
                    ...(states ?? []),
                  ]}
                /> */}
                <ReactSelect
                dynamicOptions={[
                    { label: "Select State", value: "" },
                    ...(states ?? []),
                  ]}
                name="StateId"
                  lable="State"
                  id="State"
                removeIsClearable={true}
                placeholderName={t("State")}
                value={patientDetails?.StateId}
                onChange={handleSelectChange}
              />
                {patientDetails?.StateId === "" && (
                  <span className="error-message">{errors?.StateId}</span>
                )}
              </div>

              <div className="col-sm-2">
                {/* <SelectBox
                  name="CityId"
                  className="required-fields"
                  lable="City"
                  id="City"
                  onChange={handleSelectChange}
                  selectedValue={patientDetails?.CityId}
                  options={[
                    { label: "Select City", value: "" },
                    ...(cities ?? []),
                  ]}
                /> */}
                <ReactSelect
                dynamicOptions={[
                    { label: "Select City", value: "" },
                    ...(cities ?? []),
                  ]}
                name="CityId"
                  className="required-fields"
                  lable="City"
                  id="City"
                removeIsClearable={true}
                placeholderName={t("City")}
                value={patientDetails?.CityId}
                onChange={handleSelectChange}
              />
                {patientDetails?.CityId === "" && (
                  <span className="error-message">{errors?.CityId}</span>
                )}
              </div>

              <div className="col-sm-2">
                {/* <SelectBox
                  name="LocalityId"
                  className="required-fields"
                  lable="Locality"
                  id="Locality"
                  onChange={handleSelectChange}
                  selectedValue={patientDetails?.LocalityId}
                  options={[
                    { label: "Select Locality", value: "" },
                    ...(Locality ?? []),
                  ]}
                /> */}
                <ReactSelect
                dynamicOptions={[
                    { label: "Select Locality", value: "" },
                    ...(Locality ?? []),
                  ]}
                name="LocalityId"
                  className="required-fields"
                  lable="Locality"
                  id="Locality"
                removeIsClearable={true}
                placeholderName={t("Locality")}
                value={patientDetails?.LocalityId}
                onChange={handleSelectChange}
              />
                {patientDetails?.LocalityId === "" && (
                  <span className="error-message">{errors?.LocalityId}</span>
                )}
              </div>
            </div>
            <div className="row pt-1 pl-2 pr-2 mb-1">
              <div className="col-sm-2">
                <Input
                  type="number"
                  name="Pincode"
                  onInput={(e) => number(e, 6)}
                  value={patientDetails?.Pincode}
                  className="required-fields"
                  placeholder=" "
                  id="Pin Code"
                  lable="Pin Code"
                  onChange={handleChange}
                />
                {patientDetails?.Pincode === "" && (
                  <span className="error-message">{errors?.Pincode}</span>
                )}
              </div>

              <div className="col-sm-2">
                <Input
                  name="Email"
                  max={30}
                  value={patientDetails?.Email}
                  placeholder=" "
                  id="Country"
                  lable="Email"
                  onChange={handleChange}
                />
                {patientDetails?.Email.trim().length > 0 &&
                  !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(
                    patientDetails?.Email,
                  ) && <span className="error-message">{errors?.Email}</span>}
              </div>

              <div className="col-sm-2">
                <Input
                  type="text"
                  name="LandMark"
                  max={30}
                  value={patientDetails?.LandMark}
                  placeholder=" "
                  id="Landmark"
                  lable="Landmark"
                  onChange={handleChange}
                />
                {patientDetails?.LandMark.trim() != "" &&
                  patientDetails?.LandMark.trim().length < 3 && (
                    <span className="error-message">{errors?.LandMark}</span>
                  )}
              </div>
              <div className="col-sm-2">
                {loading ? (
                  <Loading />
                ) : (
                  <EditButton
                  text={"Update Details"}
                    onClick={updateDetails}
                  />
                )}
              </div>
            </div>
          </>
        )}{" "}
      </Accordion>
    </>
  );
};

export default HomeCollectionPatientEdit;
