import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { SelectBox } from "../../components/formComponent/SelectBox";
import DatePicker from "../../components/formComponent/DatePicker";
import Loading from "../../components/loader/Loading";
import { Image } from "react-bootstrap";
import transfericon from "./../HomeCollection/TRY6_27.gif";
import { useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import moment from "moment";
import Accordion from "@app/components/UI/Accordion";
import { Link } from "react-router-dom";
import Tables from "../../components/UI/customTable";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { CustomButton } from "../../components/UI/CustomButton";
const PhlebotomistCallTransfer = () => {
  const { t } = useTranslation();
  const [states, setStates] = useState({
    from: [],
    to: [],
  });
  const [cities, setCity] = useState({
    from: [],
    to: [],
  });
  const [targetDetails, settargetDetails] = useState({
    timeslot: {},
    limit: "",
  });
  const [formData, setFormData] = useState({
    From: {
      State: "",
      City: "",
      areaid: "",
      fromdate: new Date(),
      phlebotomistid: "",
    },
    To: {
      State: "",
      City: "",
      areaid: "",
      fromdate: new Date(),
      phlebotomistid: "",
    },
  });
  const [pheleboProfile, setPheleboProfile] = useState(false);
  const [showPhelebo, setShowPhelebo] = useState([]);
  const [localities, setLocalities] = useState({
    from: [],
    to: [],
  });
  const [phelbos, setPhelbos] = useState({
    from: [],
    to: [],
  });
  const [phelebotomistData, setPhelebotomistData] = useState([]);
  const [getPatientDetailOnSlot, setGetPatientDetailOnSlot] = useState([]);
  const [ShowPhelebotarget, setShowPhelebotarget] = useState([]);
  const [getPatientDetailOnSlottarget, setGetPatientDetailOnSlottarget] =
    useState([]);
  const [clickedBooking, setClickedBooking] = useState([]);

  const [load, setLoad] = useState(false);
  // const [load2, setLoad2] = useState(false);
  // const [mouseHover, setMouseHover] = useState({
  //   index: -1,
  //   data: [],
  // });

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
          };
        });
        setStates((prevStates) => ({
          ...prevStates,
          from: value,
          to: value,
        }));
      })
      .catch((err) => {
        toast.error("Something went wrong");
      });
  };

  const handleSplitData = (id) => {
    const data = id.split("#")[0];
    return data;
  };

  const getCity = (value, type) => {
    axios
      .post("/api/v1/CommonHC/GetCityData", {
        StateId: [value],
      })
      .then((res) => {
        const data = res.data.message;
        const cities = data.map((ele) => {
          return {
            value: handleSplitData(ele.ID),
            label: ele.City,
          };
        });
        if (type === "from") {
          setCity((prevStates) => ({
            ...prevStates,
            from: cities,
          }));
        } else if (type === "to") {
          setCity((prevStates) => ({
            ...prevStates,
            to: cities,
          }));
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const getLocality = (value, type) => {
    axios
      .post("/api/v1/CustomerCare/BindLocality", {
        cityid: value,
      })
      .then((res) => {
        const data = res.data.message;
        const localities = data.map((ele) => {
          return {
            value: ele.id,
            label: ele.NAME,
          };
        });
        if (type === "from") {
          setLocalities((prevStates) => ({
            ...prevStates,
            from: localities,
          }));
        } else if (type === "to") {
          setLocalities((prevStates) => ({
            ...prevStates,
            to: localities,
          }));
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const getPhelbo = (value, type) => {
    axios
      .post("/api/v1/PhelebotomistMapping/BindPhelbo", {
        CityId: value,
      })
      .then((res) => {
        const data = res.data.message;
        const phelbos = data.map((ele) => {
          return {
            value: ele.PheleboId,
            label: ele.Name,
          };
        });
        if (type === "from") {
          setPhelbos((prevStates) => ({
            ...prevStates,
            from: phelbos,
          }));
        } else if (type === "to") {
          setPhelbos((prevStates) => ({
            ...prevStates,
            to: phelbos,
          }));
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const handleChange = (name,e) => {
    const {value} = e;

    // console.log(formData);

    if (name == "State") {
      getCity(value, "from");

      setFormData((prevFormData) => ({
        ...prevFormData,
        From: {
          ...prevFormData.From,
          [name]: value,
          City: "",
          areaid: "",
          phlebotomistid: "",
          // fromdate: new Date(),
        },
      }));
      setLocalities((prevFormData) => ({
        ...prevFormData,
        from: [],
      }));

      setPhelbos((prev) => ({
        ...prev,
        from: [],
      }));
      setShowPhelebo([]);
    } else if (name == "City") {
      getLocality(value, "from");
      getPhelbo(value, "from");

      setFormData((prevFormData) => ({
        ...prevFormData,
        From: {
          ...prevFormData.From,
          [name]: value,
          areaid: "",
          phlebotomistid: "",
        },
      }));
      setLocalities((prevFormData) => ({
        ...prevFormData,
        from: [],
      }));
      setPhelbos((prev) => ({
        ...prev,
        from: [],
      }));
      setShowPhelebo([]);
    } else if (name == "areaid") {
      if (value != "") {
        if (
          formData?.From.fromdate != "" &&
          formData?.From?.phlebotomistid != ""
        ) {
          setFormData((prevFormData) => ({
            ...prevFormData,
            From: {
              ...prevFormData.From,
              [name]: value,
            },
          }));
          BinslotforTransfer(value, name);
        } else {
          setFormData((prevFormData) => ({
            ...prevFormData,
            From: {
              ...prevFormData.From,
              [name]: value,
            },
          }));
        }
      } else {
        setFormData((prevFormData) => ({
          ...prevFormData,
          From: {
            ...prevFormData.From,
            [name]: value,
          },
        }));
        setShowPhelebo([]);
      }
    } else if (name == "phlebotomistid") {
      if (value != "") {
        if (formData?.From.fromdate != "" && formData?.From?.areaid != "") {
          setFormData((prevFormData) => ({
            ...prevFormData,
            From: {
              ...prevFormData.From,
              [name]: value,
            },
          }));
          BinslotforTransfer(value, name);
        } else {
          setFormData((prevFormData) => ({
            ...prevFormData,
            From: {
              ...prevFormData.From,
              [name]: value,
            },
          }));
        }
      } else {
        setFormData((prevFormData) => ({
          ...prevFormData,
          From: {
            ...prevFormData.From,
            [name]: value,
          },
        }));
        setShowPhelebo([]);
      }
    } else {
      setFormData((prevFormData) => ({
        ...prevFormData,
        From: {
          ...prevFormData.From,
          [name]: value,
        },
      }));
    }
  };
  function findEmptyKeys(obj) {
    let emptyKeys = [];

    for (let key in obj) {
      if (obj.hasOwnProperty(key) && obj[key] === "") {
        emptyKeys.push(key);
      }
    }

    return emptyKeys;
  }
  const BindSlotTarget = (value, name) => {
    let obj = {
      TagetArea: "",
      fromdate: "",
      phlebotomistid: "",
    };
    switch (name) {
      case "areaid":
        obj.TagetArea = value?.toString();
        obj.fromdate = moment(formData?.From?.fromdate).format("DD-MMM-YYYY");
        obj.phlebotomistid = formData?.To?.phlebotomistid?.toString();
        break;
      case "phlebotomistid":
        obj.TagetArea = formData?.To?.areaid?.toString();
        obj.fromdate = moment(formData?.From?.fromdate).format("DD-MMM-YYYY");
        obj.phlebotomistid = value?.toString();
        break;
    }
    if (obj?.phlebotomistid != "" && obj?.TagetArea != "") {
      ApicallforTarget(obj);
    } else {
      toast.error("Select Target Area and Target Phlebotomist");
    }
  };
  const handleChange2 = (name,e) => {
    const { value } = e;
    if (name == "State") {
      getCity(value, "to");
      setFormData((prevFormData) => ({
        ...prevFormData,
        To: {
          ...prevFormData.To,
          [name]: value,
          City: "",
          areaid: "",
          phlebotomistid: "",
          // fromdate: new Date(),
        },
      }));
      setLocalities((prevFormData) => ({
        ...prevFormData,
        to: [],
      }));
      setPhelbos((prev) => ({
        ...prev,
        to: [],
      }));
      setShowPhelebotarget([]);
    } else if (name == "City") {
      getLocality(value, "to");
      getPhelbo(value, "to");

      setFormData((prevFormData) => ({
        ...prevFormData,
        To: {
          ...prevFormData.To,
          [name]: value,
          areaid: "",
          phlebotomistid: "",
        },
      }));
      setLocalities((prevFormData) => ({
        ...prevFormData,
        to: [],
      }));
      setPhelbos((prev) => ({
        ...prev,
        to: [],
      }));
      setShowPhelebotarget([]);
    } else if (name == "areaid") {
      if (value != "") {
        if (
          formData?.From.fromdate != "" &&
          formData?.From?.phlebotomistid != ""
        ) {
          setFormData((prevFormData) => ({
            ...prevFormData,
            To: {
              ...prevFormData.To,
              [name]: value,
            },
          }));
          BindSlotTarget(value, name);
        } else {
          setFormData((prevFormData) => ({
            ...prevFormData,
            To: {
              ...prevFormData.To,
              [name]: value,
            },
          }));
        }
      } else {
        setFormData((prevFormData) => ({
          ...prevFormData,
          To: {
            ...prevFormData.To,
            [name]: value,
          },
        }));
        setShowPhelebotarget([]);
      }
    } else if (name == "phlebotomistid") {
      if (value != "") {
        if (formData?.To.fromdate != "" && formData?.To?.areaid != "") {
          setFormData((prevFormData) => ({
            ...prevFormData,
            To: {
              ...prevFormData.To,
              [name]: value,
            },
          }));
          BindSlotTarget(value, name);
        } else {
          setFormData((prevFormData) => ({
            ...prevFormData,
            To: {
              ...prevFormData.To,
              [name]: value,
            },
          }));
        }
      } else {
        setFormData((prevFormData) => ({
          ...prevFormData,
          To: {
            ...prevFormData.To,
            [name]: value,
          },
        }));
        setShowPhelebotarget([]);
      }
    } else {
      setFormData((prevFormData) => ({
        ...prevFormData,
        To: {
          ...prevFormData.To,
          [name]: value,
        },
      }));
    }
  };
  const dateSelect = (date, name, value) => {
    if (name == "fromdate") {
      setFormData((prevFormData) => ({
        ...prevFormData,
        From: {
          ...prevFormData.From,
          [name]: date,
        },
      }));
      if (
        formData?.From?.areaid != "" &&
        formData?.From?.phlebotomistid != ""
      ) {
        BinslotforTransfer(date, name);
      } else {
        if (formData?.From?.areaid == "") {
          toast.error("Please Select Area");
        } else if (formData?.From?.phlebotomistid == "") {
          toast.error("Please Select Phelebo");
        }
      }
      setFormData((prevFormData) => ({
        ...prevFormData,
        To: {
          ...prevFormData.To,
          State: "",
          City: "",
          areaid: "",
          phlebotomistid: "",
          fromdate: date,
        },
      }));
      setLocalities((prevFormData) => ({
        ...prevFormData,
        to: [],
      }));
      setPhelbos((prev) => ({
        ...prev,
        to: [],
      }));
      setShowPhelebotarget([]);
    } else if (name == "targetfromdate") {
      setFormData((prevFormData) => ({
        ...prevFormData,
        To: {
          ...prevFormData.To,
          fromdate: date,
        },
      }));
      if (formData?.To?.areaid != "" && formData?.To?.phlebotomistid != "") {
        BindSlotTarget(date, name);
      }
    }
  };

  const pheleboData = (ele) => {
    console.log(ele);
    axios
      .post("/api/v1/CustomerCare/GetPheleboDetail", {
        PhlebotomistID: ele?.SelectedPheleboId,
      })
      .then((res) => {
        console.log("phlebo data",res);
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

  const BinslotforTransfer = (value, name) => {
    let obj = {
      areaid: "",
      fromdate: "",
      phlebotomistid: "",
    };
    switch (name) {
      case "areaid":
        obj.areaid = value?.toString();
        obj.fromdate = moment(formData?.From?.fromdate).format("DD-MMM-YYYY");
        obj.phlebotomistid = formData?.From?.phlebotomistid?.toString();
        break;
      case "phlebotomistid":
        obj.areaid = formData?.From?.areaid?.toString();
        obj.fromdate = moment(formData?.From?.fromdate).format("DD-MMM-YYYY");
        obj.phlebotomistid = value?.toString();
        break;
      case "fromdate":
        obj.areaid = formData?.From?.areaid?.toString();
        obj.fromdate = moment(value).format("DD-MMM-YYYY");
        obj.phlebotomistid = formData?.From?.phlebotomistid?.toString();
        break;
    }

    ApicallforTransfer(obj);
  };
  const ApicallforTransfer = (obj) => {
    axios
      .post("api/v1/PhelbomistCallTransfer/BindSlotforcalltransfer", obj)
      .then((res) => {
        console.log("BindSlotforcalltransferres",res)
        // const data = res.data.Data;
        // const slot = res?.data?.Slot;
        // const TimeslotData = res?.data?.TimeslotData;

        // const slotTime = TimeslotData.map((e) => {
        //   return {
        //     NoofSlotForApp: e.NoofSlotForApp,
        //   };
        // });

        // const SlotArray = [];
        // for (
        //   let i = 0;
        //   i < slot.length;
        //   i += parseInt(slotTime[0].NoofSlotForApp, 10)
        // ) {
        //   SlotArray.push(
        //     slot.slice(i, i + parseInt(slotTime[0].NoofSlotForApp, 10)),
        //   );
        // }
        // const SetPhelebo = data?.map((ele) => {
        //   return {
        //     SelectedPheleboId: ele?.PhlebotomistID,

        //     PheleboNumber: ele?.Mobile,
        //     PheleboName: ele?.Name,

        //     SlotArray: SlotArray,
        //     TimeslotData: slotTime[0].NoofSlotForApp,
        //   };
        // });
        // console.log(data);
        // const PatientSlot = data?.map((ele) => {
        //   const apptime = moment(ele?.apptime, "HH:mm:ss");
        //   return {
        //     pname: ele?.patientname,
        //     City: ele?.locality,
        //     PreBookingID: ele?.PreBookingID,
        //     Address: ele?.Address,
        //     Mobile: ele?.Mobile,
        //     isVip: ele?.vip,
        //     HardCopyRequired: ele?.HardCopyRequired,
        //     apptime: apptime.format("HH:mm"),
        //     phlebotomistid: ele?.PhlebotomistID,
        //   };
        // });
        // const clickedArray = [];
        // for (let i of PatientSlot) {
        //   clickedArray.push(false);
        // }

        const data = res?.data?.message
        const slotInfo = data?.slotInfo?.[0];
        const timeSlots = data?.timeSlots || [];

        const slotTime = slotInfo ? parseInt(slotInfo.NoofSlotForApp, 10) : 1;

        // Build slot groups
        const SlotArray = [];
        for (let i = 0; i < timeSlots.length; i += slotTime) {
          SlotArray.push(timeSlots.slice(i, i + slotTime));
        }

        // Build phelebo data correctly
        const SetPhelebo = data?.phlebotomistData?.map((ele) => {
          return {
            SelectedPheleboId: ele?.PhlebotomistID,
            PheleboNumber: ele?.Mobile,
            PheleboName: ele?.Name,
            SlotArray: SlotArray,          // corrected
            TimeslotData: slotTime,        // now number
          };
        });
        ;
        const PatientSlot = data?.phlebotomistData?.map((ele) => {
          const apptime = moment(ele?.apptime, "HH:mm:ss");
          return {
            pname: ele?.patientname,
            City: ele?.locality,
            PreBookingID: ele?.PreBookingID,
            Address: ele?.Address,
            Mobile: ele?.Mobileno,
            isVip: ele?.vip,
            HardCopyRequired: ele?.HardCopyRequired,
            apptime: apptime.format("HH:mm"),
            phlebotomistid: ele?.PhlebotomistID,
          };
        });
        const clickedArray = [];
        for (let i of PatientSlot) {
          clickedArray.push(false);
        }
        console.log("PatientSlot",PatientSlot);
        console.log("clickedArray",clickedArray);
        setGetPatientDetailOnSlot(PatientSlot);
        setShowPhelebo(SetPhelebo);
        setClickedBooking(clickedArray);
      })
      .catch((err) => {
        console.log("err",err);
        toast.error(
          err?.response?.data?.message
            ? "Booking Not Found"
            : "Could not get slots",
        );
        setGetPatientDetailOnSlot([]);
        setShowPhelebo([]);
      });
  };
  const BindslotforTransferaftercall = () => {
    let obj = {
      areaid: formData?.From?.areaid,
      fromdate: formData?.From?.fromdate,
      phlebotomistid: formData?.From?.phlebotomistid,
    };
    ApicallforTransfer(obj);
  };
  const BindslotTargetaftercall = () => {
    let obj = {
      TagetArea: formData?.To?.areaid,
      fromdate: formData?.From?.fromdate,
      phlebotomistid: formData?.To?.phlebotomistid,
    };
    ApicallforTarget(obj);
  };
  const ApicallforTarget = (obj) => {
    axios
      .post("api/v1/PhelbomistCallTransfer/bindslot_Target", obj)
      .then((res) => {
        console.log("target res",res);
        const data = res?.data?.data;
        const slot = res?.data?.slot;
        const TimeslotData = res?.data?.timeslotData;
        console.log("res Data",TimeslotData, data, slot);
        const countBySlot = {};
        slot.forEach((slot) => {
          const matchingAppointments = data.filter(
            (appointment) => appointment.apptime.substring(0, 5) === slot,
          );
          countBySlot[slot] = matchingAppointments.length;
        });
        console.log("countBySlot",countBySlot);
        const targetdetails = {
          timeslot: countBySlot,
          limit: Number(TimeslotData[0]?.noofSlotForApp),
        };
        console.log("targetdetails",targetdetails);
        settargetDetails(targetdetails);

        const slotTime = TimeslotData.map((e) => {
          return {
            NoofSlotForApp: e.noofSlotForApp,
          };
        });
        console.log("slotTime",slotTime);
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
        console.log("SlotArray",SlotArray);
        const SetPhelebo = data?.map((ele) => {
          return {
            SelectedPheleboId: ele?.PhlebotomistID,

            PheleboNumber: ele?.Mobile,
            PheleboName: ele?.Name,
            LoginTime: ele?.LoginTime,
            LogoutTime: ele?.LogoutTime,
            WeakOff: ele?.WeakOff,
            SlotArray: SlotArray,
            TimeslotData: slotTime[0].NoofSlotForApp,
            FromDate: ele?.FromDate,
            ToDate: ele?.ToDate,
          };
        });
        console.log("SetPhelebo",SetPhelebo);
        const PatientSlot = data?.map((ele) => {
          const appTime = moment(ele?.apptime, "HH:mm:ss");
          return {
            pname: ele?.patientname,
            City: ele?.locality,
            PreBookingID: ele?.PreBookingID,
            Address: ele?.Address,
            Mobile: ele?.Mobile,
            isVip: ele?.vip,
            HardCopyRequired: ele?.HardCopyRequired,
            apptime: appTime.format("HH:mm"),
            phlebotomistid: ele?.PhlebotomistID,
          };
        });
        console.log("PatientSlot",PatientSlot);
        setGetPatientDetailOnSlottarget(PatientSlot);
        setShowPhelebotarget(SetPhelebo);
        
      })
      .catch((err) => {
        console.log(err?.response);
        toast.error(
          err?.response?.data?.message ? "Booking Not Found" : "No data found",
        );
        setGetPatientDetailOnSlottarget([]);
        setShowPhelebotarget([]);
      });
  };

  const bookingClickHandler = (index, data) => {
    console.log("index",index);
    console.log("clicked data",data);
    setClickedBooking((prevState) => {
      const updatedBookingClicked = [...prevState];
      updatedBookingClicked[index] = !updatedBookingClicked[index];
      return updatedBookingClicked;
    });
  };

  const Getbooking = () => {
    console.log(clickedBooking);
    console.log(getPatientDetailOnSlot);
    const selectedPreBookingIDs = getPatientDetailOnSlot
      .filter((_, index) => clickedBooking[index])
      .map((item) => item.PreBookingID);
    const selectedapptime = getPatientDetailOnSlot
      .filter((_, index) => clickedBooking[index])
      .map((item) => item.apptime)
      .join(",");

    return { selectedPreBookingIDs, selectedapptime };
  };

  function convertTimeFormat(inputTime) {
    const inputDate = new Date(`1970-01-01T${inputTime}Z`);
    const hours = inputDate.getHours().toString().padStart(2, "0");
    const minutes = inputDate.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  }

  // function isDateInRange(checkDate, startDate, endDate) {
  //   const checkDateTime = new Date(checkDate).getTime();
  //   const startDateTime = new Date(startDate).getTime();
  //   const endDateTime = new Date(endDate).getTime();

  //   return checkDateTime >= startDateTime && checkDateTime <= endDateTime;
  // }

  const getSelectslots = (slotString) => {
    const slotArray = slotString.split(",");
    const countBySlot = {};
    slotArray.forEach((slot) => {
      countBySlot[slot] = (countBySlot[slot] || 0) + 1;
    });

    return countBySlot;
  };
  const checkSlots = (selectedslots, targetslot) => {
    const isBelowLimit = Object.keys(selectedslots).every((key) => {
      const total = selectedslots[key] + (targetslot.timeslot[key] || 0);
      return total <= targetslot.limit;
    });
    const exceedingTimeSlots = Object.keys(selectedslots).filter((key) => {
      const total = selectedslots[key] + (targetslot.timeslot[key] || 0);
      return total > targetslot.limit;
    });

    return {
      isBelowLimit,
      exceedingTimeSlots,
    };
  };

  const handleTransferCalls = () => {
    if (ShowPhelebotarget.length > 0) {
      const { selectedPreBookingIDs, selectedapptime } = Getbooking();
      console.log(selectedPreBookingIDs, selectedapptime);

      const selectslots = getSelectslots(selectedapptime);
      console.log(selectslots);
      console.log(targetDetails);
      const { isBelowLimit, exceedingTimeSlots } = checkSlots(
        selectslots,
        targetDetails,
      );
      console.log(isBelowLimit, exceedingTimeSlots);

      let payload = {
        All_PrebookingId: selectedPreBookingIDs,
        phelbotomist_SourceId: formData?.From?.phlebotomistid?.toString(),
        phelbotomist_TargetId: formData?.To?.phlebotomistid?.toString(),
        All_TimeSlot: selectedapptime,
        AppDate: moment(formData?.From?.fromdate).format("DD-MMM-YYYY"),
      };
      console.log(payload);
      const TimeSlot = payload?.All_TimeSlot;
      console.log(formData?.From?.fromdate);
      const date = new Date(formData?.From?.fromdate);
      const dayOfWeek = date.getDay();
      const daysOfWeek = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      const dayName = daysOfWeek[dayOfWeek];
      console.log(ShowPhelebotarget);
      // console.log(
      //   isDateInRange(
      //     payload?.AppDate,
      //     ShowPhelebotarget[0].FromDate,
      //     ShowPhelebotarget[0].ToDate
      //   )
      // );

      console.log(
        TimeSlot,
        ShowPhelebotarget[0]?.LoginTime,
        TimeSlot,
        ShowPhelebotarget[0]?.LogoutTime,
        ShowPhelebotarget[0].WeakOff,
        dayName,
      );
      if (payload?.phelbotomist_SourceId != payload?.phelbotomist_TargetId) {
        if (isBelowLimit) {
          if (ShowPhelebotarget[0].WeakOff != dayName) {
            if (payload.All_PrebookingId.length != 0) {
              if (
                TimeSlot >= ShowPhelebotarget[0]?.LoginTime &&
                TimeSlot < ShowPhelebotarget[0]?.LogoutTime
              ) {
                if (
                  payload?.phelbotomist_SourceId != "" &&
                  payload?.phelbotomist_TargetId != ""
                ) {
                  setLoad(true);
                  axios
                    .post("api/v1/PhelbomistCallTransfer/Transfer", payload)
                    .then((res) => {
                      console.log(res?.data);
                      setLoad(false);
                      toast.success("Call Transfered Successfully");
                      BindslotforTransferaftercall();
                      BindslotTargetaftercall();
                    })
                    .catch((err) => {
                      setLoad(false);
                      err?.response?.data?.message
                        ? toast.error(err?.response?.data?.message)
                        : toast.error("Could not transfer calls");
                    });
                } else if (payload?.phelbotomist_TargetId == "") {
                  toast.error("Select Target Phelbo");
                }
              } else {
                toast.error("Phlebo not available at this time");
              }
            } else {
              toast.error("Select Any Booking");
              setLoad(false);
            }
          } else {
            toast.error("Phlebo not available on this day");
          }
        } else {
          const getString = (timeSlots) => {
            return timeSlots.join(",");
          };
          const msg = getString(exceedingTimeSlots);
          toast.error(`Slot not available at ${msg}`);
        }
      } else {
        toast.error("Can not transfer to same Phlebotomist");
      }
    } else {
      toast.error("Select Target Phelebo");
    }
  };

  function disableDiv(timearray) {
    console.log("ShowPhelebotarget",ShowPhelebotarget);
    const LoginTime = ShowPhelebotarget[0]?.LoginTime;
    const LogoutTime = ShowPhelebotarget[0]?.LogoutTime;
    console.log(timearray, LoginTime, LogoutTime);
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
    fetchStates();
  }, []);

  console.log("showPhelebo",showPhelebo);
  console.log("getPatientDetailOnSlottarget",getPatientDetailOnSlottarget);
  console.log("ShowPhelebotarget",ShowPhelebotarget);
  console.log("phelebotomistData",phelebotomistData);
  console.log("getPatientDetailOnSlot",getPatientDetailOnSlot);

  return (
    <div>
      <Accordion
        name={t("Phlebotomist Call Transfer")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="box-body">
          <div className="row px-2 mt-2 mb-1">
            <div className="col-sm-1"></div>
            <div className="col-sm-2">
              {/* <SelectBox
                name="State"
                placeholder=" "
                lable="Select State"
                className="required-fields"
                id="StateId"
                options={[{ label: "Select State", value: "" }, ...states.from]}
                selectedValue={formData?.From?.State}
                onChange={handleChange}
              /> */}
              <ReactSelect
                dynamicOptions={[{ label: "Select State", value: "" }, ...states.from]}
                name="State"
                lable="Select State"
                className="required-fields"
                id="StateId"
                removeIsClearable={true}
                placeholderName={t("Select State")}
                value={formData?.From?.State}
                onChange={handleChange}
              />
            </div>
            <div className="col-sm-2">
              {/* <SelectBox
                name="City"
                placeholder=" "
                lable="Select City"
                id="City"
                className="required-fields"
                options={[{ label: "Select City", value: "" }, ...cities.from]}
                selectedValue={formData?.From?.City}
                onChange={handleChange}
              /> */}
              <ReactSelect
                dynamicOptions={[{ label: "Select City", value: "" }, ...cities.from]}
                name="City"
                lable="Select City"
                id="City"
                className="required-fields"
                removeIsClearable={true}
                placeholderName={t("Select City")}
                value={formData?.From?.City}
                onChange={handleChange}
              />
            </div>

            <div className="col-sm-2">
              {/* <SelectBox
                name="areaid"
                options={[
                  { label: "Select Area", value: "" },
                  ...localities.from,
                ]}
                placeholder=" "
                lable="Select Area"
                className="required-fields"
                id="Area"
                selectedValue={formData?.From?.areaid}
                onChange={handleChange}
              /> */}
               <ReactSelect
                dynamicOptions={[
                  { label: "Select Area", value: "" },
                  ...localities.from,
                ]}
                name="areaid"
                lable="Select Area"
                className="required-fields"
                id="Area"
                removeIsClearable={true}
                placeholderName={t("Select Area")}
                value={formData?.From?.areaid}
                onChange={handleChange}
              />
            </div>

            <div className="col-sm-2">
              {/* <SelectBox
                name="phlebotomistid"
                placeholder=" "
                lable="Phlebotomist"
                className="required-fields"
                id="Phlebotomist"
                options={[
                  { label: "Select Phelbo", value: "" },
                  ...phelbos.from,
                ]}
                selectedValue={formData?.From?.phlebotomistid}
                onChange={handleChange}
              /> */}
              <ReactSelect
                dynamicOptions={[
                  { label: "Select Phelbo", value: "" },
                  ...phelbos.from,
                ]}
                name="phlebotomistid"
                lable="Phlebotomist"
                className="required-fields"
                id="Phlebotomist"
                removeIsClearable={true}
                placeholderName={t("Phlebotomist")}
                value={formData?.From?.phlebotomistid}
                onChange={handleChange}
              />
            </div>
            <div className="col-sm-2">
              <DatePicker
                name="fromdate"
                value={formData?.From?.fromdate}
                id="Date"
                lable="Date"
                className="custom-calendar required-fields"
                placeholder=" "
                onChange={dateSelect}
                minDate={new Date()}
              />
            </div>
          </div>

          {showPhelebo.length > 0 ? (
            <Tables>
              <thead
                className="cf text-center"
                style={{ height: "25px", fontSize: "12px" }}
              >
                <tr>
                  <th className="text-center">{t("Phelebotomist Name")}</th>

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

                                // width:"100%",
                                // border: "1px  solid white",
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

              <tbody style={{ height: "25px", fontSize: "13px" }}>
                {showPhelebo.slice(0, 1).map((ele, index) => (
                  <tr key={index}>
                    <td
                      onClick={() => pheleboData(ele)}
                      style={{ cursor: "pointer" }}
                      className="text-center "
                    >
                      <label style={{ cursor: "pointer" }}>
                        {ele.PheleboName}
                      </label>
                      <br />
                      <label style={{ cursor: "pointer" }}>
                        {ele.PheleboNumber}
                      </label>
                    </td>
                    {ele?.SlotArray?.map((slotArray, slotIndex) => (
                      <td
                        className="PheloMapTable text-center "
                        key={slotIndex}
                        style={{ maxHeight: "5px" }}
                        data-title={slotArray?.join("")}
                      >
                        <div className="phelebo_Drop">
                          {getPatientDetailOnSlot.map(
                            (patient, patientIndex) => (
                              <>
                                {slotArray.includes(patient.apptime) ? (
                                  <>
                                    <div key={patientIndex}>
                                      <div
                                        style={{
                                          backgroundColor: !clickedBooking[
                                            patientIndex
                                          ]
                                            ? "white"
                                            : "#99FF66",
                                          fontWeight: "bolder",
                                          padding: "3px",
                                          border: "1px solid grey",
                                          margin: "2px",
                                          borderRadius: "6px",
                                          fontSize: "12px",
                                        }}
                                        onClick={() => {
                                          bookingClickHandler(
                                            patientIndex,
                                            patient,
                                          );
                                        }}
                                      >
                                        <span>{patient.pname}</span>
                                        <br></br>
                                        <span>
                                          ID : {patient?.PreBookingID}
                                        </span>
                                        <br></br>
                                        <span>{patient.City}</span>
                                      </div>
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
          ) : (
            <div className="boxbody"></div>
          )}
          <div
            className="row"
            style={{ display: "flex", justifyContent: "center" }}
          >
            <Image src={transfericon} style={{ height: "40px" }} />
          </div>
          <div className="row px-2 mt-2 mb-1">
            <div className="col-sm-2"></div>
            <div className="col-sm-2">
              {/* <SelectBox
                name="State"
                selectedValue={formData?.To?.State}
                placeholder=" "
                lable="Select State"
                className="required-fields"
                id="StateId"
                options={[{ label: "Select State", value: "" }, ...states.from]}
                onChange={handleChange2}
              /> */}
              <ReactSelect
                dynamicOptions={[{ label: "Select State", value: "" }, ...states.from]}
                name="State"
                lable="Select State"
                id="StateId"
                removeIsClearable={true}
                placeholderName={t("Select State")}
                value={formData?.To?.State}
                onChange={handleChange2}
              />
            </div>
            <div className="col-sm-2">
              {/* <SelectBox
                name="City"
                selectedValue={formData?.To?.City}
                placeholder=" "
                lable="Select City"
                id="City"
                className="required-fields"
                options={[{ label: "Select City", value: "" }, ...cities.to]}
                onChange={handleChange2}
              /> */}
              <ReactSelect
                dynamicOptions={[{ label: "Select City", value: "" }, ...cities.to]}
                name="City"
                
                lable="Select City"
                id="City"
                removeIsClearable={true}
                placeholderName={t("Select City")}
                value={formData?.To?.City}
                onChange={handleChange2}
              />
            </div>

            <div className="col-sm-2">
              {/* <SelectBox
                name="areaid"
                selectedValue={formData?.To?.areaid}
                placeholder=" "
                lable="Select Area"
                className="required-fields"
                id="Area"
                options={[
                  { label: "Select Area", value: "" },
                  ...localities.to,
                ]}
                onChange={handleChange2}
              /> */}
              <ReactSelect
                dynamicOptions={[
                  { label: "Select Area", value: "" },
                  ...localities.to,
                ]}
                name="areaid"
                lable="Select Area"
                id="Area"
                removeIsClearable={true}
                placeholderName={t("Select Area")}
                value={formData?.To?.areaid}
                onChange={handleChange2}
              />
            </div>
            <div className="col-sm-2">
              {/* <SelectBox
                name="phlebotomistid"
                placeholder=" "
                lable="Phlebotomist"
                className="required-fields"
                id="Phlebotomist"
                selectedValue={formData?.To?.phlebotomistid}
                options={[{ label: "Select Phelbo", value: "" }, ...phelbos.to]}
                onChange={handleChange2}
              /> */}
              <ReactSelect
                dynamicOptions={[{ label: "Select Phelbo", value: "" }, ...phelbos.to]}
                name="phlebotomistid"

                lable="Phlebotomist"

                id="Phlebotomist"
                removeIsClearable={true}
                placeholderName={t("Phlebotomist")}
                value={formData?.To?.phlebotomistid}
                onChange={handleChange2}
              />
            </div>
          </div>

          {ShowPhelebotarget.length > 0 ? (
            <Tables>
              <thead>
                <tr>
                  <th className="text-center">{t("Phelebotomist Name")}</th>

                  {ShowPhelebotarget[0]?.SlotArray?.map((ele, index) => (
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

              <tbody style={{ height: "25px", fontSize: "13px" }}>
                {ShowPhelebotarget.slice(0, 1).map((ele, index) => (
                  <tr key={index}>
                    <td
                      onClick={() => pheleboData(ele)}
                      style={{ cursor: "pointer" }}
                      className="text-center"
                    >
                      <label style={{ cursor: "pointer" }}>
                        {ele.PheleboName}
                      </label>
                      <br />
                      <label style={{ cursor: "pointer" }}>
                        {ele.PheleboNumber}
                      </label>
                    </td>
                    {ele?.SlotArray?.map((slotArray, slotIndex) => (
                      <td
                        className={`PheloMapTable text-center ${
                          disableDiv(slotArray) ? "slot" : "disableslot"
                        }`}
                        style={{
                          pointerEvents: disableDiv(slotArray)
                            ? "auto"
                            : "none",
                        }}
                        key={slotIndex}
                        data-title={slotArray?.join("")}
                      >
                        <div className="phelebo_Drop">
                          {getPatientDetailOnSlottarget.map(
                            (patient, patientIndex) => (
                              <>
                                <div>
                                  {slotArray.includes(patient.apptime) ? (
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
                                        >
                                          <span>{patient.pname}</span>
                                          <br></br>
                                          <span>
                                            ID : {patient?.PreBookingID}
                                          </span>
                                          <br></br>
                                          <span>{patient.City}</span>
                                        </div>
                                      </div>
                                    </>
                                  ) : (
                                    <></>
                                  )}
                                </div>
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
          ) : (
            <div className="boxbody"></div>
          )}
          <div
            className="row mt-2 mb-1"
            style={{ display: "flex", justifyContent: "center" }}
          >
            {!load && (
              <CustomButton
                text={"Transfer Calls"}
                onClick={handleTransferCalls}
                disabled={clickedBooking.length == 0}
                className="col-sm-2" 
              />
            )}
            {load && <Loading />}
          </div>
        </div>
      </Accordion>
    </div>
  );
};

export default PhlebotomistCallTransfer;
