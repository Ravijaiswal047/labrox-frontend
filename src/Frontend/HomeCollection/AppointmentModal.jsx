import React, { useEffect } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import Input from "../../components/formComponent/Input";
import { SelectBox } from "../../components/formComponent/SelectBox";
import moment from "moment";
import DatePicker from "../../components/formComponent/DatePicker";
import { useState } from "react";
import AppointmentNotBookedModal from "./AppointmentNotBookedModal";
import { AllowCharactersNumbersAndSpecialChars } from "../../utils/helpers";
import DoAppointmentModal from "./DoAppointmentModal";
import PhelebotomistDetailModal from "./PhelebotomistDetailModal";
import {
  AppointmentModalValidationSchema,
  AppointmentModalValidationSchema2,
} from "../../utils/Schema";
import Loading from "../../components/loader/Loading";
import { Dialog } from "primereact/dialog";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import Tables from "../../components/UI/customTable";
import ResultEntryTableCustom from "../Laboratory/ResultEntryTableCustom";
import { getDoctorSuggestion } from "../../utils/NetworkApi/commonApi";
import { HCPaymentMode } from "../../utils/Constants";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { FaRegTimesCircle } from "react-icons/fa";
import { CustomButton, SearchButton } from "../../components/UI/CustomButton"
import { axiosInstance } from "../../utils/axiosInstance";
const AppointmentModal = ({
  showPatientData,
  appointShow,
  handleCloseAppoint,
}) => {
  const [errors, setError] = useState({});
  const [mouseHover, setMouseHover] = useState({
    index: -1,
    data: [],
  });

  const [notBookedShow, setNotBookedShow] = useState(false);
  const [appointment, setAppointment] = useState(false);
  const [updateAddressDisable, setUpdateAddressDisable] = useState(true);
  const [phelebotomistData, setPhelebotomistData] = useState([]);
  const [load, setLoad] = useState(false);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [localities, setLocalities] = useState([]);
  const [dropLocation, setDropLocation] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [showPhelebo, setShowPhelebo] = useState([]);
  const [pheleboProfile, setPheleboProfile] = useState(false);
  const [selectedPhelebo, setSelectedPhelebo] = useState([]);
  const [getPatientDetailOnSlot, setGetPatientDetailOnSlot] = useState([]);
  const [routeValueData, setRouteValueData] = useState([]);
  const [doctorSuggestion, setDoctorSuggestion] = useState([]);
  const [indexMatch, setIndexMatch] = useState(0);
  const [suggestion, setSuggestion] = useState([]);
  const [showSearchSlotBtn, setShowSearchSlotBtn] = useState(true);
  const [dropFalse, setDropFalse] = useState(true);
  const [bindSourceCall, setBindSourceCall] = useState([]);
  const [DocData, setDocData] = useState({
    DoctorName: "",
  });
  const [appointData, setAppointData] = useState({
    AppDateTime: `${moment(selectedPhelebo?.AppointmentDate).format(
      "DD-MMM-YYYY",
    )} ${selectedPhelebo?.SelectedTime || ""}`,
    // Address: selectedPhelebo?.Address ? selectedPhelebo?.Address : "",
    SelectedTime: selectedPhelebo?.SelectedTime,
    updatepatient: "",
    HardCopyRequired: "",
    PheleboNumber: selectedPhelebo?.PheleboNumber,
    PhlebotomistID: selectedPhelebo?.SelectedPheleboId,
    atitude: "",
    Longitude: "",
    ispermanetaddress: 1,
    ReceiptRequired: 1,
    Alternatemobileno: "",
    Client: "",
    Paymentmode: "",
    SourceofCollection: "",
    Phelebotomistname: selectedPhelebo?.PheleboName,
    emailidpcc: selectedPhelebo?.Email,
    centrename: selectedPhelebo?.DropLocationLabel,
    RouteName: selectedPhelebo?.SelectedBindRoute,
    RouteID: selectedPhelebo?.RouteId,
    deliverych: "",
    endtime: "",
    oldprebookingid: "",
    hcrequestid: "",
    followupcallid: "",
    // phelboshare: pheleboCharge?.value,
  });
  console.log(selectedPhelebo);
  const [testData, setTestData] = useState({
    Title: selectedPhelebo?.Title,
    Patient_ID: selectedPhelebo?.Patient_ID,
    PName: selectedPhelebo?.NAME,
    Mobile: selectedPhelebo?.Mobile,
    Email: selectedPhelebo?.Email,
    DOB: selectedPhelebo?.DOB,
    Age: selectedPhelebo?.Age,
    AgeYear: selectedPhelebo?.AgeYear,
    AgeMonth: selectedPhelebo?.AgeMonth,
    AgeDays: selectedPhelebo?.AgeDays,
    TotalAgeInDays: selectedPhelebo?.TotalAgeInDays,
    Gender: selectedPhelebo?.Gender,
    VIP: "",
    House_No: selectedPhelebo?.Address ? selectedPhelebo?.Address : "",
    LocalityID: selectedPhelebo?.LocalityID,
    Locality: selectedPhelebo?.Locality,
    CityID: selectedPhelebo?.CityID,
    City: selectedPhelebo?.City,
    StateID: selectedPhelebo?.StateID,
    State: selectedPhelebo?.State,
    Pincode: selectedPhelebo?.Pincode,
    Landmark: selectedPhelebo?.Landmark,
    PreBookingCentreID: selectedPhelebo?.centreid,
    Panel_ID: selectedPhelebo?.centreid,
    GrossAmt: "",
    DiscAmt: "",
    DisReason: "",
    NetAmt: "",
    DiscountTypeID: "",
    AdrenalinEmpID: 0,
    MRP: 0,
    TestCode: "",
    SubCategoryID: "",
    DoctorID: "",
    DoctorName: "",
    RefDoctor: "",
    OtherDoctor: "",
    Remarks: "",
    isUrgent: false,
    // isPediatric: "",
  });

  const { t } = useTranslation();
  const [rateType, setRateType] = useState({
    data: [],
    value: "",
  });
  // console.log(showPatientData);
  const [searchData, setSearchData] = useState({
    Address: showPatientData?.HouseNo ? showPatientData?.HouseNo : "",
    StateID: showPatientData?.StateID ? showPatientData?.StateID : "",
    CityID: showPatientData?.CityID ? showPatientData?.CityID : "",
    LocalityID: showPatientData?.LocalityID ? showPatientData?.LocalityID : "",
    Pincode: showPatientData?.Pincode ? showPatientData?.Pincode : "",
    SelectedBindRoute: "",
    Landmark: showPatientData?.Landmark ? showPatientData?.Landmark : "",
    Email: showPatientData?.Email ? showPatientData?.Email : "",
    AppointmentDate: new Date(new Date().getTime() + 86400000),

    DropLocationId: "",
    RouteId: "",
    // CentreID: "",
  });

  // console.log(searchData);
  const handleNotBookedClose = () => {
    setNotBookedShow(false);
    // handleAppointment();
  };

  const handlePheleboDetailClose = () => {
    setPheleboProfile(false);
  };
  const handleAppointment = () => {
    setAppointment(false);
    setShowSearchSlotBtn(true);
    handleCloseAppoint();
  };

  // const handleSuggestedClose = () => {
  //   setSuggestedTestShow(false);
  // };
  const dateSelect = (date, name) => {
    setSearchData({
      ...searchData,
      [name]: date,
    });
    setAppointment(false);
    handleSearch(
      routeValueData.length > 0 || Object.keys(routeValueData).length > 0
        ? routeValueData
        : false,
      date,
    );
    setGetPatientDetailOnSlot([]);
    setMouseHover({
      index: -1,
      data: [],
    });

    // console.log(routeValueData, searchData, moment(date).format("DD-MMM-YYYY"));
  };
  // console.log(routeValueData, searchData);
  // useEffect(() => {
  //   const generatedError = AppointmentModalValidationSchema(searchData);
  //   setError({
  //     ...errors,
  //     Emailvalid: generatedError.Emailvalid,
  //   });
  // }, [searchData?.Email]);

  // useEffect(() => {
  //   console.log(searchData?.LocalityID);
  //   console.log(searchData);
  // }, [searchData?.LocalityID]);
  // console.log(states, cities, localities);
  const GetPatientDetailonSlot = (SetPhelebo, date) => {
    const phleboIds = SetPhelebo.map((phelebo) => phelebo.SelectedPheleboId);

    axiosInstance
      .post("CustomerCare/GetPatientDetailonSlot", {
        PhlebotomistID: phleboIds,
        AppDateTime: moment(date).format("YYYY-MM-DD"),
      })
      .then((res) => {
        const data = res?.data?.message;
        // console.log(data);
        const PatientSlot = data?.map((ele) => {
          const apptimeTime = moment(ele?.apptime, "HH:mm:ss");

          return {
            pname: ele?.patientname,
            City: ele?.locality,
            PreBookingID: ele?.PreBookingID,
            Address: ele?.Address,
            Mobile: ele?.Mobileno,
            isVip: ele?.VIP,
            HardCopyRequired: ele?.HardCopyRequired,
            netAmount: ele?.NetAmt,
            apptime: apptimeTime.format("HH:mm"),
            phlebotomistid: ele?.phlebotomistid,
          };
        });
        // console.log(PatientSlot);
        setGetPatientDetailOnSlot(PatientSlot);
      })
      .catch((err) => {
        console.log(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Error Occured",
        )
        // toast.error(
        //   err?.response?.data?.message
        //     ? err?.response?.data?.message
        //     : "Error Occured",
        // );
      });
  };

  const getBindSourceCall = () => {
    axios
      .get("/api/v1/CustomerCare/bindcollsource")
      .then((res) => {
        const data = res?.data?.message;
        const SourceCall = data?.map((ele) => {
          return {
            value: ele?.ID,
            label: ele?.Source,
          };
        });
        // console.log(SourceCall);
        setBindSourceCall(SourceCall);
      })
      .catch((err) =>
        toast.error(err?.res?.data ? err?.res?.data : "Something Went Wrong"),
      );
  };

  const handleListSearch = (data, name) => {
    switch (name) {
      case "TestName":
        setBookingData({
          ...bookingData,
          TestName: "",
          InvestigationID: data.InvestigationID,
        });
        setIndexMatch(0);
        setSuggestion([]);
        // console.log(data);
        getTableData(data, "Test");
        break;
      case "DoctorName":
        setDocData({ ...DocData, [name]: data.Name });
        setTestData({
          ...testData,
          [name]: data.Name,
          RefDoctor: data.Name,
          // DoctorID: data.DoctorReferalID,
          // ReferLabId: data.DoctorReferalID,
          // ReferLabName: data.Name,
        });
        setIndexMatch(0);
        setDoctorSuggestion([]);
        setDropFalse(false);
        break;
      default:
        break;
    }
  };
  // console.log(searchData);
  const handleSearch = (payload, date) => {
    // console.log(payload);
    // console.log(searchData);

    const generatedError = AppointmentModalValidationSchema(searchData);
    // console.log(searchData);
    // console.log(generatedError);
    let obj = {
      areaid: "",
      pincode: "",
      fromdate: "",
      freeslot: "",
      phelboid: "",
    };

    if (payload) {
      obj = {
        areaid: payload.areaid,
        pincode: payload.pincode,

        fromdate: moment(date).format("DD-MMM-YYYY"),
        freeslot: searchData?.freeslot,
        phelboid: searchData?.phelboid,
      };
      setLoad(true);
      axios
        .post("/api/v1/CustomerCare/BindSlot", obj)
        .then((res) => {
          setLoad(false);
          console.log(res);
          if (res?.data?.success) {
            const data = res.data.message.data;
            const slot = res.data.message.slot;
            const TimeslotData = res.data.message.timeslotData;


            const slotTime = TimeslotData.map((e) => {
              return {
                NoofSlotForApp: e.NoofSlotForApp,
              };
            });

            const SlotArray = [];
            for (
              let i = 0;
              i < slot.length;
              i += parseInt(slotTime[0].NoofSlotForApp, 10)
            ) {
              SlotArray.push(
                slot.slice(i, i + parseInt(slotTime[0].NoofSlotForApp, 10)),
              );
            }

            const SetPhelebo = data?.map((ele) => {
              return {
                SelectedPheleboId: ele?.ID,
                // value: handleSplit(handleSplit(ele?.centreid, "^")[0], "#")[1],
                // label: handleSplit(ele?.centreid, "^")[1],
                // centreid: handleSplit(handleSplit(ele?.centreid, "^")[0], "#")[0],
                SelectedRouteName: handleSplit(ele?.route, "@")[0],
                LoginTime: ele?.LoginTime,
                LogoutTime: ele?.LogoutTime,
                SelectedRouteId: handleSplit(ele?.route, "@")[1],
                PheleboNumber: ele?.mobile,
                PheleboName: ele?.Name,
                istemp: ele?.istemp,
                Slotdata: slot,
                WeakOff: ele?.WeakOff,
                SlotArray: SlotArray,
                TimeslotData: slotTime[0].NoofSlotForApp,
                // FromDate: ele?.FromDate,
                // ToDate: ele?.ToDate,
              };
            });
            // console.log(SetPhelebo);
            setShowPhelebo(SetPhelebo);
            GetPatientDetailonSlot(SetPhelebo, date);
          } else {
            setShowPhelebo([]);
            toast.error(res?.data?.message);
          }
          // setAppointment(true);  
        })
        .catch((err) => {
          console.log(err, "there");
          setLoad(false);
          setShowPhelebo([]);
          toast.error(
            err?.response?.data?.message
              ? "Either Slot Is Not Defined Or Mapping Not Done For Given Location"
              : "Error Occured",
          );
        });
    } else {
      const generatedError = AppointmentModalValidationSchema(searchData);
      if (generatedError == "") {
        setSearchData({
          ...searchData,
          AppointmentDate: date,
          RouteId: "",
          SelectedBindRoute: searchData.onLoadRoute,
        });
        obj = {
          areaid: searchData?.LocalityID,
          pincode: searchData?.Pincode,
          fromdate: moment(date).format("DD-MMM-YYYY"),
          freeslot: searchData?.freeslot,
          phelboid: searchData?.phelboid,
        };
        setLoad(true);
        axios
          .post("/api/v1/CustomerCare/BindSlot", obj)
          .then((res) => {
            setLoad(false);
            console.log(res);
            if (res?.data?.success) {
              const data = res.data.message.data;
              const slot = res.data.message.slot;
              const TimeslotData = res.data.message.timeslotData;

              const slotTime = TimeslotData.map((e) => {
                return {
                  NoofSlotForApp: e.NoofSlotForApp,
                };
              });

              const SlotArray = [];
              for (
                let i = 0;
                i < slot.length;
                i += parseInt(slotTime[0].NoofSlotForApp, 10)
              ) {
                SlotArray.push(
                  slot.slice(i, i + parseInt(slotTime[0].NoofSlotForApp, 10)),
                );
              }

              const SetPhelebo = data?.map((ele) => {
                return {
                  SelectedPheleboId: ele?.ID,
                  // value: handleSplit(handleSplit(ele?.centreid, "^")[0], "#")[1],
                  // label: handleSplit(ele?.centreid, "^")[1],
                  // centreid: handleSplit(handleSplit(ele?.centreid, "^")[0], "#")[0],
                  SelectedRouteName: handleSplit(ele?.route, "@")[0],
                  LoginTime: ele?.LoginTime,
                  LogoutTime: ele?.LogoutTime,
                  SelectedRouteId: handleSplit(ele?.route, "@")[1],
                  WeakOff: ele?.WeakOff,
                  PheleboNumber: ele?.mobile,
                  PheleboName: ele?.Name,
                  istemp: ele?.istemp,
                  Slotdata: slot,
                  SlotArray: SlotArray,
                  TimeslotData: slotTime[0].NoofSlotForApp,
                  // FromDate: ele?.FromDate,
                  // ToDate: ele?.ToDate,
                };
              });
              // console.log(SetPhelebo);
              setShowPhelebo(SetPhelebo);
              GetPatientDetailonSlot(SetPhelebo, date);
            } else {
              setShowPhelebo([]);
              toast.error(res?.data?.message);
            }
            // setAppointment(true);
          })
          .catch((err) => {

            setLoad(false);
            setShowPhelebo([]);
            toast.error(
              err?.response?.data?.message
                ? "Either Slot Is Not Defined Or Mapping Not Done For Given Location"
                : "Error Occured",
            );
          });
      } else {
        setLoad(false);
        setError(generatedError);
        setShowPhelebo([]);
      }
    }
  };
  function getDayCode(dayName) {
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const dayCode = daysOfWeek.indexOf(dayName);

    return dayCode;
  }
  // console.log(searchData);
  const DoAppointment = (match, data, selectedPhelebo) => {

    const generatedError = AppointmentModalValidationSchema2(searchData);
    if (generatedError == "") {
      console.log("match, data, selectedPhelebo, searchData", match, data, selectedPhelebo, searchData);

      // const FromHolidayDateDay =
      //   selectedPhelebo?.FromDate != null
      //     ? selectedPhelebo?.FromDate.split("-").map(Number)[0]
      //     : "";
      // const FromHolidayDateMonth =
      //   selectedPhelebo?.FromDate != null
      //     ? selectedPhelebo?.FromDate.split("-").map(Number)[1]
      //     : "";
      // const FromHolidayDateYear =
      //   selectedPhelebo?.FromDate != null
      //     ? selectedPhelebo?.FromDate.split("-").map(Number)[2]
      //     : "";

      // const ToHolidayDateDay =
      //   selectedPhelebo?.ToDate != null
      //     ? selectedPhelebo?.ToDate.split("-").map(Number)[0]
      //     : "";
      // const ToHolidayDateMonth =
      //   selectedPhelebo?.ToDate != null
      //     ? selectedPhelebo?.ToDate.split("-").map(Number)[1]
      //     : "";
      // const ToHolidayDateYear =
      //   selectedPhelebo?.ToDate != null
      //     ? selectedPhelebo?.ToDate.split("-").map(Number)[2]
      //     : "";
      // console.log(
      //   FromHolidayDateDay,
      //   FromHolidayDateMonth,
      //   FromHolidayDateYear,
      //   ToHolidayDateDay,
      //   ToHolidayDateMonth,
      //   ToHolidayDateYear
      // );

      // const appointmentDate = new Date(appointmentYear, appointmentMonth - 1, appointmentDay);
      // const fromHolidayDate =
      //   selectedPhelebo?.FromDate != null
      //     ? new Date(
      //         FromHolidayDateYear,
      //         FromHolidayDateMonth - 1,
      //         FromHolidayDateDay
      //       )
      //     : "";
      // const toHolidayDate =
      //   selectedPhelebo?.ToDate != null
      //     ? new Date(
      //         ToHolidayDateYear,
      //         ToHolidayDateMonth - 1,
      //         ToHolidayDateDay
      //       )
      //     : "";
      // console.log(moment(fromHolidayDate).format("YYYY-MM-DD"));
      // console.log(fromHolidayDate, toHolidayDate);
      const currentTime = new Date();
      const currentHours = currentTime.getHours();
      const currentMinutes = currentTime.getMinutes();
      const [dataHours, dataMinutes] = data.split(":").map(Number);
      const [loginHour, loginMinute] =
        selectedPhelebo?.LoginTime?.split(":").map(Number);
      const [logoutHour, logoutMinute] =
        selectedPhelebo?.LogoutTime?.split(":").map(Number);
      const appointmentDate = new Date(searchData.AppointmentDate);
      console.log(appointmentDate);
      const AppointmentWeekDay = appointmentDate.getDay();
      const SelectedPheleboWeekOff = getDayCode(selectedPhelebo?.WeakOff);
      const currentDate = new Date();

      const appointmentDay = appointmentDate.getDate();
      const appointmentMonth = Number(appointmentDate.getMonth()) + 1;
      const appointmentYear = appointmentDate.getFullYear();
      const currentDay = currentDate.getDate();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();

      console.log(
        appointmentDay,
        appointmentMonth,
        appointmentYear,
        currentDay,
        currentMonth,
        currentYear,
        AppointmentWeekDay,
        SelectedPheleboWeekOff,
      );
      console.log(
        dataHours,
        currentHours,
        dataMinutes,
        currentMinutes,
        dataHours < currentHours ||
        (dataHours === currentHours && dataMinutes < currentMinutes),
      );
      if (
        appointmentDay == currentDay &&
        appointmentMonth == currentMonth &&
        appointmentYear == currentYear
      ) {
        // if (
        //   moment(appointmentDate).format("YYYY-MM-DD") >=
        //     moment(fromHolidayDate).format("YYYY-MM-DD") &&
        //   moment(appointmentDate).format("YYYY-MM-DD") <=
        //     moment(toHolidayDate).format("YYYY-MM-DD")
        // ) {
        //   toast.error(selectedPhelebo?.PheleboName + " Phelebo On a Holiday");
        // } else
        if (AppointmentWeekDay == SelectedPheleboWeekOff) {
          toast.error(
            selectedPhelebo?.PheleboName + " Phelebo on a off on this day",
          );
        } else if (
          dataHours < currentHours ||
          (dataHours === currentHours && dataMinutes < currentMinutes)
        ) {
          toast.error("You can't book an appointment for this time");
        } else if (
          !(
            (dataHours > loginHour ||
              (dataHours === loginHour && dataMinutes >= loginMinute)) &&
            (dataHours < logoutHour ||
              (dataHours === logoutHour && dataMinutes < logoutMinute))
          )
        ) {
          toast.error(
            selectedPhelebo?.PheleboName +
            " Phelebo Not Available for this time",
          );
        } else if (match >= selectedPhelebo?.TimeslotData) {
          toast.error("Booking is Filled for given Slot");
        } else {
          setSelectedPhelebo({
            ...selectedPhelebo,
            centreid: searchData.DropLocationId,
            SelectedTime: data,
            Address: searchData.Address.trim(),
            AppointmentDate: searchData.AppointmentDate,
            CityID: searchData.CityID,
            DropLocationId: searchData.DropLocationId,
            // DropLocationLabel: searchData?.DropLocationLabel,
            Email: searchData.Email.trim(),
            Landmark: searchData.Landmark.trim(),
            LocalityID: searchData.LocalityID,
            Pincode: searchData.Pincode,
            RouteId: searchData.RouteId
              ? searchData?.RouteId
              : dropLocation[0]?.SelectedRouteId,
            SelectedBindRoute: searchData.SelectedBindRoute,
            StateID: searchData.StateID,
            uhid: showPatientData.Patientid,
            Title: showPatientData.title,
            Patient_ID: showPatientData.Patientid,
            PatientCode: showPatientData.PatientCode,
            Mobile: showPatientData.Mobile,
            DOB: moment(showPatientData.DOB).format("YYYY-MMM-DD"),
            Age: showPatientData.Age,
            NAME: showPatientData?.FirstName,
            Gender: showPatientData.Gender,
            House_No: searchData.Address.trim(),
            Locality: FindLabel(localities, searchData?.LocalityID),
            State: FindLabel(states, searchData?.StateID),
            City: FindLabel(cities, searchData?.CityID),
            AgeYear: showPatientData?.AgeYear,
            AgeMonth: showPatientData?.AgeMonth,
            AgeDays: showPatientData?.AgeDays,
            TotalAgeInDays: showPatientData?.TotalAgeInDays,
          });
          if (searchData.Address === "") {
            toast.error("Please Enter Proper Address");
          } else if (searchData?.DropLocationId === "") {
            toast.error("Please Pick Any DropLocation");
          }
          else {

            setAppointment(true);
            toast.info("Your Slot is Selected, Please Confirm Appointment !");
          }
        }
      } else {
        console.log("match, data, selectedPhelebo, searchData", match, data, selectedPhelebo, searchData);
        // console.log(
        //   moment(appointmentDate).format("YYYY-MM-DD") >=
        //     moment(fromHolidayDate).format("YYYY-MM-DD") &&
        //     moment(appointmentDate).format("YYYY-MM-DD") <=
        //       moment(toHolidayDate).format("YYYY-MM-DD")
        // );
        // if (
        //   moment(appointmentDate).format("YYYY-MM-DD") >=
        //     moment(fromHolidayDate).format("YYYY-MM-DD") &&
        //   moment(appointmentDate).format("YYYY-MM-DD") <=
        //     moment(toHolidayDate).format("YYYY-MM-DD")
        // ) {
        //   toast.error(selectedPhelebo?.PheleboName + " Phelebo On a Holiday");
        // } else
        if (AppointmentWeekDay == SelectedPheleboWeekOff) {
          toast.error(
            selectedPhelebo?.PheleboName + " Phelebo on a off on this day",
          );
        } else if (
          !(
            (dataHours > loginHour ||
              (dataHours === loginHour && dataMinutes >= loginMinute)) &&
            (dataHours < logoutHour ||
              (dataHours === logoutHour && dataMinutes < logoutMinute))
          )
        ) {
          toast.error(
            selectedPhelebo?.PheleboName +
            " Phelebo Not Available for this time",
          );
        } else if (match >= selectedPhelebo?.TimeslotData) {
          toast.error("Booking is Filled for given Slot");
        } else {
          setSelectedPhelebo({
            ...selectedPhelebo,
            centreid: searchData.DropLocationId,
            SelectedTime: data,
            Address: searchData.Address.trim(),
            AppointmentDate: searchData.AppointmentDate,
            CityID: searchData.CityID,
            DropLocationId: searchData.DropLocationId,
            // DropLocationLabel: searchData?.DropLocationLabel,
            Email: searchData.Email.trim(),
            Landmark: searchData.Landmark.trim(),
            LocalityID: searchData.LocalityID,
            Pincode: searchData.Pincode,
            RouteId: searchData.RouteId
              ? searchData?.RouteId
              : dropLocation[0]?.SelectedRouteId,
            SelectedBindRoute: searchData.SelectedBindRoute,
            StateID: searchData.StateID,
            uhid: showPatientData.Patientid,
            Title: showPatientData.title,
            Patient_ID: showPatientData.Patientid,
            PatientCode: showPatientData.PatientCode,
            Mobile: showPatientData.Mobile,
            DOB: moment(showPatientData.DOB).format("YYYY-MMM-DD"),
            Age: showPatientData.Age,
            NAME: showPatientData?.FirstName,
            Gender: showPatientData.Gender,
            House_No: searchData.Address.trim(),
            Locality: FindLabel(localities, searchData?.LocalityID),
            State: FindLabel(states, searchData?.StateID),
            City: FindLabel(cities, searchData?.CityID),
            AgeYear: showPatientData?.AgeYear,
            AgeMonth: showPatientData?.AgeMonth,
            AgeDays: showPatientData?.AgeDays,
            TotalAgeInDays: showPatientData?.TotalAgeInDays,
          });
          if (searchData.Address === "") {
            toast.error("Please Enter Proper Address");
          } else if (searchData?.DropLocationId === "") {
            toast.error("Please Pick Any DropLocation");
          }
          else {
            toast.info("Your Slot is Selected, Please Confirm Appointment !");
            setAppointment(true);
          }
        }
      }
    } else {
      console.log("match, data, selectedPhelebo, searchData", match, data, selectedPhelebo, searchData);
      setError(generatedError);
    }
  };

  const handleChange = (name, event) => {
    const { value, label } = event;
    console.log("value,label", value, label);

    if (name === "StateID") {
      getCityDropDown(value);
      setSearchData({
        ...searchData,
        [name]: value,
        CityID: "",
        LocalityID: "",
        Pincode: "",
        DropLocationId: "",
        SelectedBindRoute: "",
        onLoadRouteId: "",
        onLoadRoute: "",
        RouteId: "",
      });
      setShowPhelebo([]);
      setCities([]);
      setRouteValueData([]);
      setLocalities([]);
      setDropLocation([]);
    }
    if (name === "CityID") {
      getLocalityDropDown(value);
      getBindRoute(value);
      setSearchData({
        ...searchData,
        [name]: value,
        LocalityID: "",
        Pincode: "",
        DropLocationId: "",
        onLoadRouteId: "",
        onLoadRoute: "",
        SelectedBindRoute: "",
        RouteId: "",
      });
      setShowPhelebo([]);
      setLocalities([]);
      setRouteValueData([]);
      setDropLocation([]);
    }

    if (name === "LocalityID") {
      if (value) {
        getPincode(value, name);
        setSearchData({
          ...searchData,
          [name]: value,
          // Pincode: "",
          // DropLocationId: "",
          SelectedBindRoute: "",
          RouteId: "",
          onLoadRouteId: "",
          onLoadRoute: "",
        });
      } else {
        setSearchData({
          ...searchData,
          LocalityID: "",
          Pincode: "",
          DropLocationId: "",
          SelectedBindRoute: "",
          onLoadRouteId: "",
          onLoadRoute: "",
          RouteId: "",
        });
        setShowPhelebo([]);
        setRouteValueData([]);
        setDropLocation([]);
      }

      // setShowPhelebo([]);
      //
    }

    if (name === "RouteId") {
      // console.log(value);
      if (value !== "") {
        const data = routes.find((ele) => value == ele?.value);
        // searchData.RouteId = data?.value;
        // searchData.SelectedBindRoute = data?.label;

        setSearchData({
          ...searchData,
          RouteId: data?.value,
          SelectedBindRoute: data?.label,
        });
        const val = routes.filter((ele) => {
          return ele?.value == value;
        });

        const datas = val.map((ele) => {
          return {
            areaid: ele?.localityid,
            pincode: ele?.pincode,
          };
        });
        // console.log();
        handleSearch(datas[0], searchData?.AppointmentDate);
        setRouteValueData(datas[0]);
        // callhandleOnRouteValue(datas[0])
      } else {
        setSearchData({
          ...searchData,
          [name]: value,
          RouteId: "",
          SelectedBindRoute: searchData.onLoadRoute,
        });
        setRouteValueData([]);
        handleSearch(false, searchData?.AppointmentDate);
      }
    }

    if (name === "DropLocationId") {
      setSearchData({
        ...searchData,
        [name]: value,
      });
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event?.target;

    if (name === "Pincode") {
      return;
    }
    if (name === "Landmark") {
      setSearchData({
        ...searchData,
        [name]: AllowCharactersNumbersAndSpecialChars(value)
          ? value
          : searchData[name],
      });
    }
    if (name === "Address") {
      setSearchData({
        ...searchData,
        [name]: AllowCharactersNumbersAndSpecialChars(value)
          ? value
          : searchData[name],
      });
    }
    if (name === "Email") {
      setSearchData({
        ...searchData,
        [name]: value,
      });
    }
  };

  const callhandleOnRouteValue = (data) => {
    // console.log(data);

    if (Object.keys(data).length > 0 && searchData?.RouteId)
      handleSearch(data, searchData?.AppointmentDate);
    else {
      setRouteValueData([]);
      handleSearch(false, searchData?.AppointmentDate);
    }
  };

  const FindLabel = (state, id) => {
    const labels = state.filter((ele, _) => {
      return ele.value == id;
    });
    return labels[0].label;
  };
  const getBindRoute = (value) => {
    axios
      .post("/api/v1/CustomerCare/BindRoute", {
        cityid: value,
      })
      .then((res) => {
        const data = res?.data?.message;
        if (res?.data?.success) {
          const Routes = data?.map((ele) => {
            return {
              value: ele?.routeid,
              label: ele?.Route,
              localityid: ele?.localityid,
              pincode: ele?.pincode,
            };
          });
          // console.log(Routes);
          setRoutes(Routes);
        } else {
          setRoutes([]);
          toast.error(res?.data?.message);
        }
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Error Occured",
        );
      });
  };

  const handleSplit = (id, symbol) => {
    const data = id?.split(symbol);
    return data;
  };

  const getDropLocationDropDown = (name, value, pincode) => {
    axios
      .post("/api/v1/CustomerCare/BindDropLocationOnPageLoad", {
        localityid: value,
      })
      .then((res) => {
        if (res?.data?.success) {
          const data = res?.data?.message;
          const DropLocation = data?.map((ele) => {
            return {
              // SelectedPheleboId: ele?.ID,
              value: ele?.centreid,
              label: ele?.centre,
              // Phelebo: ele?.NAME,
              SelectedRouteName: handleSplit(ele?.route, "@")[0],
              SelectedRouteId: handleSplit(ele?.route, "@")[1],
              // SelectedPheleboName: handleSplit(ele?.NAME, " ")[0],
              // SelectedPheleboNumber: handleSplit(ele?.NAME, " ")[1],
              // HolidayDate: ele?.HolidayDate,
              // istemp: ele?.istemp,
              // CentreID: handleSplit(handleSplit(ele?.centreid, "^")[0], "#")[0],
            };
          });
          // console.log(name, value);
          // console.log(DropLocation);
          setSearchData((searchData) => ({
            ...searchData,
            Pincode: pincode,
            [name]: value,
            DropLocationId: DropLocation[0].value,
            // DropLocationLabel: DropLocation[0].label,
            RouteId: DropLocation[0].SelectedRouteId,
            onLoadRouteId: DropLocation[0].SelectedRouteId,
            onLoadRoute: DropLocation[0].SelectedRouteName,
            SelectedBindRoute: DropLocation[0].SelectedRouteName,
          }));
          setDropLocation(DropLocation);
        } else {
          setDropLocation([]);
          setSearchData({
            ...searchData,
            Pincode: pincode,
            [name]: value,
            DropLocationId: "",
            RouteId: "",
            SelectedBindRoute: "",
          });
        }
      })
      .catch((err) => {
        setDropLocation([]);
        setSearchData({
          ...searchData,
          Pincode: pincode,
          [name]: value,
          DropLocationId: "",
          RouteId: "",
          SelectedBindRoute: "",
        });

        console.log(
          err?.response?.data?.message
            ? "Error! Mapping Is Not Done For Given Location"
            : "Error Occured",
        );
      });
  };

  const getPincode = (value, name) => {
    axios
      .post("/api/v1/CustomerCare/BindPinCode", {
        LocalityID: value?.toString(),
      })
      .then((res) => {
        const data = res?.data?.message;
        const obj = {
          areaid: value,
          pincode: data[0].pincode,
        };

        getDropLocationDropDown(name, value, data[0].pincode);
        handleSearch(obj, searchData?.AppointmentDate);
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
        const data = res?.data?.message;
        if (res?.data?.success) {
          const Localities = data?.map((ele) => {
            return {
              value: ele?.id,
              label: ele?.NAME,
            };
          });

          setLocalities(Localities);
        } else {
          setLocalities([]);
          toast.error(res?.data?.message);
        }

      })
      .catch((err) => {
        console.log(err, "tets");
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

            value: handleSplit(ele?.ID, "#")[0],
            label: ele?.City,
          };
        });
        // console.log(cities);
        setCities(cities);
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
        if (res?.data?.message.length > 0) {
          const States = data?.map((ele) => {
            return {
              // ID: ele?.ID,
              value: ele?.ID,
              label: ele?.State,
            };
          });

          setStates(States);
        } else {
          setStates([]);
          toast.error(res?.data?.message);
        }

      })
      .catch((err) => {
        toast.error(err?.res?.data ? err?.res?.data : "Something Went Wrong");
      });
  };
  const pheleboData = (ele) => {
    // console.log(ele);
    axios
      .post("/api/v1/CustomerCare/GetPheleboDetail", {
        PhlebotomistID: ele?.SelectedPheleboId,
      })
      .then((res) => {
        const data = res?.data?.message;

        setPhelebotomistData(data);
        setPheleboProfile(true);
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Error Occured",
        );
      });
  };

  const handleIndex = (e) => {
    const { name } = e.target;
    switch (name) {
      case "TestName":
        switch (e.which) {
          case 38:
            if (indexMatch !== 0) {
              setIndexMatch(indexMatch - 1);
            } else {
              setIndexMatch(suggestion.length - 1);
            }
            break;
          case 40:
            if (suggestion.length - 1 === indexMatch) {
              setIndexMatch(0);
            } else {
              setIndexMatch(indexMatch + 1);
            }
            break;
          case 13:
            if (suggestion.length > 0) {
              handleListSearch(suggestion[indexMatch], name);
            }
            setIndexMatch(0);
            break;
          default:
            break;
        }
        break;
      case "DoctorName":
        switch (e.which) {
          case 38:
            if (indexMatch !== 0) {
              setIndexMatch(indexMatch - 1);
            } else {
              setIndexMatch(doctorSuggestion.length - 1);
            }
            break;
          case 40:
            if (doctorSuggestion.length - 1 === indexMatch) {
              setIndexMatch(0);
            } else {
              setIndexMatch(indexMatch + 1);
            }
            break;
          case 13:
            handleListSearch(doctorSuggestion[indexMatch], name);
            setIndexMatch(0);
            break;
          default:
            break;
        }
        break;
      default:
        break;
    }
  };

  const handleTestChange = (e) => {
    const { name, value, type, checked } = e.target;
    console.log(name);

    if (name === "Remarks" || name === "DisReason") {
      const Value = PreventSpecialCharacterandNumber(value)
        ? value
        : testData[name];

      setTestData({
        ...testData,
        [name]: Value,
      });
    } else if (name == "House_No") {
      setTestData({
        ...testData,
        [name]: AllowCharactersNumbersAndSpecialChars(value)
          ? value
          : testData[name],
      });
    } else {
      setTestData({
        ...testData,
        [name]: type === "checkbox" ? checked : value,
      });
    }
  };

  const handleSearchSelectChange = (label, value) => {
    setRateType({
      ...rateType,
      ["value"]: value?.value,
    });
    setTableData([]);
  };


  function disableDiv(timearray, ele) {
    // console.log(timearray, ele);
    const LoginTime = ele?.LoginTime;
    const LogoutTime = ele?.LogoutTime;

    if (
      LoginTime <= timearray[0] &&
      LogoutTime > timearray[timearray.length - 1]
    ) {
      return true;
    } else {
      return false;
    }
  }

  useEffect(() => {
    getBindSourceCall();
    getStateDropDown();
    getCityDropDown(showPatientData?.StateID);
    getLocalityDropDown(showPatientData?.CityID);
    getDropLocationDropDown(
      "LocalityID",
      showPatientData?.LocalityID,
      showPatientData?.Pincode,
    );
    getBindRoute(showPatientData?.CityID);
    // Auto-trigger slot search on modal open using patient's locality & pincode
    if (showPatientData?.LocalityID && showPatientData?.Pincode) {
      const obj = {
        areaid: showPatientData?.LocalityID,
        pincode: showPatientData?.Pincode,
      };
      handleSearch(obj, searchData?.AppointmentDate);
      setShowSearchSlotBtn(false);
    }
  }, []);
  useEffect(() => {
    getDoctorSuggestion(DocData, setDoctorSuggestion, setDocData);
  }, [DocData?.DoctorName]);
  const isMobile = window.innerWidth <= 768;
  console.log(isMobile);
  const theme = useLocalStorage("theme", "get");
  return (
    <>
      {notBookedShow && (
        <AppointmentNotBookedModal
          showPatientData={showPatientData}
          notBookedShow={notBookedShow}
          handleNotBookedClose={handleNotBookedClose}
          handleCloseAppoint={handleCloseAppoint}
        />
      )}

      {pheleboProfile && (
        <PhelebotomistDetailModal
          phelebotomistData={phelebotomistData}
          pheleboProfile={pheleboProfile}
          handlePheleboDetailClose={handlePheleboDetailClose}
        />
      )}

      {/* <Dialog
        visible={appointShow}
        id="ModalSizeHC"
        header={t("Appointment")}
        className={theme}
        onHide={handleCloseAppoint}
        style={{
          width: isMobile ? "80vw" : "80vw",
        }}
      > */}
      <div
        style={{
          maxHeight: "550px",
          overflowY: "auto",
          backgroundColor: "white",
        }}
      >
        <>
          <>
            {/* <ResultEntryTableCustom>
                <thead className="cf text-center">
                  {" "}
                  <tr>
                    <th className="text-center">{t("UHID")}</th>
                    <th className="text-center">{t("Patient Name")}</th>
                    <th className="text-center">{t("Age")}</th>
                    <th className="text-center">{t("DOB")}</th>
                    <th className="text-center">{t("Gender")}</th>
                    <th className="text-center">{t("Mobile")}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {" "}
                    <td data-title="UHID" className="text-center">
                      {showPatientData.Patientid}&nbsp;
                    </td>{" "}
                    <td data-title="Patient Name" className="text-center">
                      {showPatientData.NAME}&nbsp;
                    </td>{" "}
                    <td data-title="Age" className="text-center">
                      {showPatientData.Age}&nbsp;
                    </td>{" "}
                    <td data-title="DOB" className="text-center">
                      {moment(showPatientData.DOB).format("DD-MMM-YYYY")}&nbsp;
                    </td>{" "}
                    <td data-title="Gender" className="text-center">
                      {showPatientData.Gender}&nbsp;
                    </td>{" "}
                    <td data-title="Mobile" className="text-center">
                      {showPatientData.Mobile}&nbsp;
                    </td>
                  </tr>
                </tbody>
              </ResultEntryTableCustom> */}
            <hr></hr>
            <div className="row mt-2">
              <div className="col-sm-12 col-md-2">
                <Input
                  placeholder=" "
                  autoComplete="off"
                  type="text"
                  lable="Address"
                  id="Address"
                  name="Address"
                  className="required-fields"
                  max={30}
                  value={searchData.Address}
                  onChange={handleInputChange}
                  disabled={updateAddressDisable ? false : true}
                />
                {searchData?.Address.trim().length > 0 &&
                  searchData?.Address.trim().length < 3 && (
                    <span className="error-message">{errors?.Address}</span>
                  )}
              </div>

              <div className="col-sm-12 col-md-2">
                {/* <SelectBox
                    name="StateID"
                    lable="State"
                    id="State"
                    className="required-fields"
                    options={[{ label: "Select State", value: "" }, ...states]}
                    onChange={handleChange}
                    selectedValue={searchData.StateID}
                    isDisabled={updateAddressDisable ? false : true}
                  /> */}

                <ReactSelect
                  dynamicOptions={[{ label: "Select State", value: "" }, ...states]}
                  name="StateID"
                  lable="State"
                  id="State"
                  removeIsClearable={true}
                  placeholderName={t("State")}
                  value={searchData.StateID}
                  onChange={handleChange}
                />

                {searchData.StateID === "" && (
                  <span className="error-message">{errors?.StateID}</span>
                )}
              </div>

              <div className="col-sm-12 col-md-2">
                {/* <SelectBox
                    name="CityID"
                    lable="City"
                    id="City"
                    className="required-fields"
                    options={[{ label: "Select City", value: "" }, ...cities]}
                    onChange={handleChange}
                    selectedValue={searchData.CityID}
                    isDisabled={updateAddressDisable ? false : true}
                  /> */}

                <ReactSelect
                  dynamicOptions={[{ label: "Select City", value: "" }, ...cities]}
                  name="CityID"
                  lable="City"
                  id="City"
                  className="required-fields"
                  removeIsClearable={true}
                  placeholderName={t("City")}
                  value={searchData.CityID}
                  onChange={handleChange}
                />

                {searchData.CityID === "" && (
                  <span className="error-message">{errors?.CityID}</span>
                )}
              </div>

              <div className="col-sm-12 col-md-2">
                {/* <SelectBox
                    name="LocalityID"
                    options={[
                      { label: "Select Locality", value: "" },
                      ...localities,
                    ]}
                    className="required-fields"
                    selectedValue={searchData.LocalityID}
                    onChange={handleChange}
                    lable="Locality"
                    id="Locality"
                    isDisabled={updateAddressDisable ? false : true}
                  /> */}

                <ReactSelect
                  dynamicOptions={[
                    { label: "Select Locality", value: "" },
                    ...localities,
                  ]}
                  name="LocalityID"
                  lable="Locality"
                  id="Locality"
                  className="required-fields"
                  removeIsClearable={true}
                  placeholderName={t("Locality")}
                  value={searchData.LocalityID}
                  onChange={handleChange}
                />
                {searchData.LocalityID === "" && (
                  <span className="error-message">{errors?.LocalityID}</span>
                )}
              </div>
              <div className="col-sm-12 col-md-2">
                <Input
                  placeholder=" "
                  type="text"
                  lable="Pincode"
                  id="Pincode"
                  className="required-fields"
                  name="Pincode"
                  value={searchData.Pincode}
                  onChange={handleInputChange}
                  disabled={updateAddressDisable ? false : true}
                />
              </div>
              <div className="col-sm-12 col-md-2">
                <Input
                  placeholder=" "
                  lable="Landmark"
                  id="Landmark"
                  type="text"
                  name="Landmark"
                  className="required-fields"
                  max={30}
                  onChange={handleInputChange}
                  value={searchData.Landmark}
                  disabled={updateAddressDisable ? false : true}
                />
                {searchData?.Landmark.trim().length > 0 &&
                  searchData?.Landmark.trim().length < 3 && (
                    <span className="error-message">{errors?.Landmark}</span>
                  )}
              </div>
            </div>

            <div className="row">
              <div className="col-sm-12 col-md-2">
                <Input
                  placeholder=" "
                  lable="Email"
                  id="Email"
                  type="email"
                  name="Email"
                  max={30}
                  onChange={handleInputChange}
                  value={searchData.Email}
                  disabled={updateAddressDisable ? false : true}
                />

                {searchData?.Email.trim().length > 0 &&
                  !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(
                    searchData?.Email,
                  ) && (
                    <span className="error-message">
                      {errors?.Emailvalid}
                    </span>
                  )}
              </div>
              <div className="col-sm-12 col-md-2">
                <DatePicker
                  name="AppointmentDate"
                  className="custom-calendar required-fields"
                  value={searchData.AppointmentDate}
                  lable={t("Appointment Date")}
                  minDate={new Date()}
                  maxDate={
                    new Date(new Date().getTime() + 6 * 24 * 60 * 60 * 1000)
                  }
                  onChange={dateSelect}
                ></DatePicker>
              </div>
              <div className="col-sm-12 col-md-2">
                {/* <SelectBox
                    name="DropLocationId"
                    id="DropLocationId"
                    lable="DropLocation"
                    options={dropLocation}
                    onChange={handleChange}
                    className="required-fields"
                    selectedValue={searchData.DropLocationId}
                  /> */}

                <ReactSelect
                  dynamicOptions={dropLocation}
                  name="DropLocationId"
                  id="DropLocationId"
                  lable="DropLocation"
                  removeIsClearable={true}
                  placeholderName={t("DropLocation")}
                  value={searchData.DropLocationId}
                  onChange={handleChange}
                />
              </div>
              <div className="col-sm-12 col-md-2">
                {/* <SelectBox
                    name="RouteId"
                    options={[{ label: "Change Route", value: "" }, ...routes]}
                    onChange={handleChange}
                    id="Change Route"
                    lable="Change Route"
                    selectedValue={searchData.RouteId}
                  /> */}

                <ReactSelect
                  dynamicOptions={[{ label: "Change Route", value: "" }, ...routes]}
                  name="RouteId"
                  id="Change Route"
                  lable="Change Route"
                  removeIsClearable={true}
                  placeholderName={t("Change Route")}
                  value={searchData.RouteId}
                  onChange={handleChange}
                />
              </div>
              <div className="col-sm-12 col-md-2">
                <Input
                  type="text"
                  placeholder=" "
                  id="Route"
                  disabled={true}
                  lable="Route"
                  value={searchData?.SelectedBindRoute}
                />
              </div>

              {showSearchSlotBtn && (
                <>
                  <div className="col-sm-2" style={{ display: "flex" }}>
                    {/* <button
                    type="button"
                    className="btn  btn-success btn-sm mr-2"
                    onClick={() => {
                      setRouteValueData([]);
                      setShowSearchSlotBtn(false)
                      handleSearch(false, searchData?.AppointmentDate);
                    }}
                  >
                    &nbsp;{t("Search Slot")}
                  </button> */}
                    <SearchButton
                      text={t("Search Slot")}
                      className="mr-2"
                      onClick={() => {
                        setRouteValueData([]);
                        setShowSearchSlotBtn(false)
                        handleSearch(false, searchData?.AppointmentDate);
                      }}
                    />
                    {/* <button
                    type="button"
                    title="Appointment Not Booked"
                    style={{ fontSize: "13px", color: "white" }}
                    className="btn btn-primary btn-sm"
                    onClick={() => setNotBookedShow(true)}
                  >
                    <FaRegTimesCircle />
                  </button> */}
                    <CustomButton
                      icon={"cancel"}
                      onClick={() => setNotBookedShow(true)}
                    />
                  </div>

                </>


              )}
              {!showSearchSlotBtn && (
                <>
                  <div className="col-sm-12 col-md-2">
                    <button
                      type="button"
                      title="Appointment Not Booked"
                      style={{ fontSize: "13px", color: "white" }}
                      className="btn btn-primary btn-block btn-sm"
                      onClick={() => setNotBookedShow(true)}
                    >
                      {"Appointment Not Booked"}
                    </button>
                  </div>
                </>)}

            </div>

            {appointment && (
              <DoAppointmentModal
                selectedPhelebo={selectedPhelebo}
                routeValueData={routeValueData}
                callhandleOnRouteValue={callhandleOnRouteValue}
                appointment={appointment}
                handleAppointment={handleAppointment}
              />
            )}

          </>

          {/* <div className="row mb-1">
                <div className="col-sm-1" style={{ textAlign: "center" }}>
                <button
                  type="button"
                  className="btn  btn-success btn-sm"
                  onClick={() => {
                    setRouteValueData([]);
                    handleSearch(false, searchData?.AppointmentDate);
                  }}
                >
                  &nbsp;{t("Search Slot")}
                </button>
              </div>
            </div> */}
          <div className="row mb-2">
            <div className="col-sm-12">
              {load ? (
                <Loading />
              ) : showPhelebo.length > 0 ? (
                <>
                  <div style={{ overflowX: "auto" }}>
                    <Tables>
                      <thead>
                        <tr>
                          <th className="text-center">{t("Phlebo. Name")}</th>

                          {showPhelebo[0]?.SlotArray?.map((ele, index) => (
                            <th key={index}>
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-around",
                                }}
                              >
                                {ele.map((time) => (
                                  <>
                                    <th
                                      className="text-center"
                                      style={{
                                        textAlign: "center",
                                      }}
                                    >
                                      {time}
                                    </th>
                                  </>
                                ))}
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>

                      <tbody>
                        {showPhelebo.map((ele, index) => (
                          <tr key={index}>
                            <td
                              onClick={() => pheleboData(ele)}
                              style={{ cursor: "pointer", fontWeight: "bold" }}
                              className="text-center"
                              data-title="Phlebo. Name"
                            >
                              <span style={{ cursor: "pointer" }}>
                                {ele.PheleboName}
                              </span>
                              <br />
                              <h5 style={{ cursor: "pointer" }}>
                                {ele.PheleboNumber}
                              </h5>
                              {/* <br /> */}
                              <h5 style={{ cursor: "pointer" }}>
                                {ele?.LoginTime}-{ele?.LogoutTime}
                              </h5>
                            </td>
                            {ele?.SlotArray?.map((slotArray, slotIndex) => (
                              <td
                                className={`PheloMapTable text-center ${disableDiv(slotArray, ele)
                                  ? "slot"
                                  : "disableslot"
                                  }`}
                                key={slotIndex}
                                onClick={() => {
                                  const matches = getPatientDetailOnSlot.filter(
                                    (patient) =>
                                      patient.phlebotomistid ===
                                      ele.SelectedPheleboId &&
                                      slotArray.includes(patient.apptime),
                                  );
                                  // setAppointment(false);

                                  // if(appointment){
                                  //   console.log("inside if");
                                  //   setAppointment(false);
                                  // }

                                  DoAppointment(
                                    matches.length,
                                    slotArray[0],
                                    ele,
                                  );
                                }}
                                data-title={slotArray.join("")}
                              >
                                <div
                                  className="phelebo_Drop p-2 w-100"
                                  style={isMobile ? { border: "1px solid" } : {}}
                                >
                                  {getPatientDetailOnSlot.map(
                                    (patient, patientIndex) => (
                                      <>
                                        {patient.phlebotomistid ===
                                          ele.SelectedPheleboId &&
                                          slotArray.includes(patient.apptime) ? (
                                          <>
                                            <div key={patientIndex}>
                                              <div
                                                style={{
                                                  backgroundColor: "white",
                                                  fontWeight: "bolder",

                                                  padding: "3px",
                                                  border: "1px solid grey",
                                                  margin: "2px",
                                                  borderRadius: "6px",
                                                  fontSize: "12px",
                                                }}
                                                onMouseEnter={() => {
                                                  setMouseHover({
                                                    index: patientIndex,
                                                    data: [],
                                                  });
                                                }}
                                                onMouseLeave={() => {
                                                  setMouseHover({
                                                    index: -1,
                                                    data: [],
                                                  });
                                                }}
                                              >
                                                <span>{patient.pname}</span>
                                                <br></br>
                                                <span>{patient.City}</span>
                                                <br></br>
                                                <span>
                                                  Rs. {patient.netAmount}
                                                </span>
                                              </div>
                                              {mouseHover?.index ===
                                                patientIndex &&
                                                getPatientDetailOnSlot.length >
                                                0 && (
                                                  <span
                                                    style={{
                                                      position: "absolute",
                                                      display: "none",
                                                      width: "120px",
                                                      // fontWeight: "bold",
                                                      left: "500px",
                                                      // right:"350px",
                                                      fontFamily: "arial",
                                                      height: "auto",
                                                      fontSize: "10px",
                                                      padding: "4px",
                                                      border: "1px solid",
                                                      backgroundColor: "white",
                                                    }}
                                                  >
                                                    <span>
                                                      Prebooking Id:
                                                      {patient?.PreBookingID}
                                                    </span>
                                                    <br></br>
                                                    <span>
                                                      Address:
                                                      {patient?.Address}
                                                    </span>
                                                    <br></br>
                                                    <span>
                                                      Mobile: {patient?.Mobile}
                                                    </span>
                                                    <br></br>
                                                    <span>
                                                      IsVIP: {patient?.isVip}
                                                    </span>
                                                    <br></br>
                                                    <span>
                                                      HardCopyRequired:
                                                      {patient?.HardCopyRequired}
                                                    </span>
                                                    <br></br>
                                                    <span>
                                                      NetAmount:
                                                      {patient?.netAmount}
                                                    </span>
                                                  </span>
                                                )}
                                            </div>
                                          </>
                                        ) : (
                                          <></>
                                        )}
                                      </>
                                    ),
                                  )}
                                </div>
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </Tables>
                  </div>
                </>
              ) : (
                <div className="boxbody">
                  <div style={{ height: "150px" }}></div>
                </div>
              )}
            </div>
          </div>

        </>
      </div>
      {/* </Dialog> */}
    </>
  );
};

export default AppointmentModal;
