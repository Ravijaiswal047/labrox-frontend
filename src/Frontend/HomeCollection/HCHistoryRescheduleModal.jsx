import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { axiosInstance } from "../../utils/axiosInstance";
import moment from "moment";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { Dialog } from "primereact/dialog";
import { SelectBox } from "../../components/formComponent/SelectBox";
import DatePicker from "../../components/formComponent/DatePicker";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { CustomButton } from "../../components/UI/CustomButton";

const HCHistoryRescheduleModal = ({
  handleClose,
  showReschedule,
  handleCloseReschedule,
  details,
}) => {
  const { t } = useTranslation();
  console.log(details);
  const [load, setLoad] = useState(false);
  const [Phelbos, setPhelbos] = useState([]);
  const [Booked, setBooked] = useState([]);
  const [TimeSlots, setTimeSlots] = useState([]);

  const [newData, setnewData] = useState({
    AppDate: new Date(details?.AppDate),
    AppTime: "",
    PhlebotomistId: details?.PhlebotomistId,
  });
  console.log(newData?.AppDate);
  const bindPhelbo = () => {
    axiosInstance
      .get("HomeCollectionSearch/BindPhelebo")
      .then((res) => {
        const data = res.data.message;
        console.log(data);
        const Phelbos = data.map((ele) => {
          return {
            value: ele?.PhlebotomistID,
            label: ele?.name,
            LoginTime: ele?.LoginTime,
            LogoutTime: ele?.LogoutTime,
            WeakOff: ele?.WeakOff,
            // FromDate: ele?.FromDate,
            // ToDate: ele?.ToDate,
          };
        });

        setPhelbos(Phelbos);
      })
      .catch((err) => {
        toast.error("Something Went wrong");
      });
  };
  console.log(Booked);
  const bindTimeSlots = (value, type) => {
    if (type === "phelboId") {
      axiosInstance
        .post("HomeCollectionSearch/BindSlot", {
          PreBookingId: details?.PreBookingId,
          AppDate: moment(newData?.AppDate).format("DD/MMM/YYYY"),
          PhlebotomistId: value,
        })
        .then((res) => {
          const data = res?.data?.message;
          console.log(data);
          const TimeSlots = data?.map((ele) => {
            return {
              value: ele[0],
              label: ele[0].replace(":", "-"),
            };
          });
          const Booked = data?.map((ele) => {
            return {
              Booked: ele[1],
              value: ele[0],
            };
          });
          setBooked(Booked);
          setTimeSlots(TimeSlots);
        })
        .catch((err) => {
          toast.error(err?.response?.data?.message);
        });
    } else if (type === "date") {
      axiosInstance
        .post("HomeCollectionSearch/BindSlot", {
          PreBookingId: details?.PreBookingId,
          AppDate: moment(value).format("DD/MMM/YYYY"),
          PhlebotomistId: newData?.PhlebotomistId,
        })
        .then((res) => {
          const data = res?.data?.message;
          console.log(data);
          const TimeSlots = data.map((ele) => {
            return {
              value: ele[0],
              label: ele[0].replace(":", "-"),
            };
          });
          const Booked = data?.map((ele) => {
            return {
              Booked: ele[1],
              value: ele[0],
            };
          });
          setBooked(Booked);
          setTimeSlots(TimeSlots);
        })
        .catch((err) => {
          toast.error(err?.response?.data?.message);
        });
    } else if (type === "initial") {
      axiosInstance
        .post("HomeCollectionSearch/BindSlot", {
          PreBookingId: details?.PreBookingId,
          AppDate: moment(details?.AppDate).format("DD/MMM/YYYY"),
          PhlebotomistId: details?.PhlebotomistId,
        })
        .then((res) => {
          const data = res?.data?.message;
          console.log(data);
          const TimeSlots = data?.map((ele) => {
            return {
              value: ele[0],
              label: ele[0].replace(":", "-"),
            };
          });
          const Booked = data?.map((ele) => {
            return {
              Booked: ele[1],
              value: ele[0],
            };
          });
          setBooked(Booked);
          setTimeSlots(TimeSlots);
        })
        .catch((err) => {
          toast.error(err?.response?.data?.message);
        });
    }
  };
  const getPhlebotomistDetailsById = (phlebotomistID) => {
    const phlebotomist = Phelbos?.find(
      (phlebotomist) => phlebotomist.value == phlebotomistID,
    );
    console.log(phlebotomist);
    if (phlebotomist) {
      return {
        LoginTime: phlebotomist?.LoginTime,
        LogoutTime: phlebotomist?.LogoutTime,
        WeakOff: phlebotomist?.WeakOff,
        // FromDate: phlebotomist?.FromDate,
        // ToDate: phlebotomist?.ToDate,
      };
    } else {
      return null; // Return null if no matching phlebotomist is found
    }
  };

  function isDateInRange(checkDate, startDate, endDate) {
    const checkDateTime = new Date(checkDate).getTime();
    const startDateTime = new Date(startDate).getTime();
    const endDateTime = new Date(endDate).getTime();

    return checkDateTime >= startDateTime && checkDateTime <= endDateTime;
  }

  function isCurrentTimeBeforeGivenTime(givenTime) {
    const currentTime = new Date();
    const hours = currentTime.getHours().toString().padStart(2, "0");
    const minutes = currentTime.getMinutes().toString().padStart(2, "0");
    const currentFormattedTime = `${hours}:${minutes}`;

    return currentFormattedTime < givenTime;
  }

  function convertToMinutes(time) {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  }

  function isApptimeBetweenLoginLogout(apptime, loginTime, logoutTime) {
    const apptimeInMinutes = convertToMinutes(apptime);
    const loginTimeInMinutes = convertToMinutes(loginTime);
    const logoutTimeInMinutes = convertToMinutes(logoutTime);

    return (
      apptimeInMinutes >= loginTimeInMinutes &&
      apptimeInMinutes < logoutTimeInMinutes
    );
  }

  const todaychecker = (dategetting) => {
    const date = new Date(dategetting);
    const today = new Date();

    if (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    ) {
      return true;
    } else {
      return false;
    }
  };
  console.log(newData);
  const handleReschedule = () => {
    if (newData?.AppTime != "") {
      const payload = {
        PreBookingId: details?.PreBookingId,
        AppDate: moment(newData?.AppDate).format("DD/MMM/YYYY"),
        AppTime: newData?.AppTime,
        PhlebotomistId: newData?.PhlebotomistId,
      };

      const { LoginTime, LogoutTime, WeakOff } = getPhlebotomistDetailsById(
        payload?.PhlebotomistId,
      );
      const isBefore = isCurrentTimeBeforeGivenTime(payload?.AppTime);
      const isBetween = isApptimeBetweenLoginLogout(
        payload?.AppTime,
        LoginTime,
        LogoutTime,
      );
      console.log(newData?.AppDate);
      console.log(isBefore, isBetween);
      const todaydate = todaychecker(newData?.AppDate);
      console.log(todaydate);
      // if (!isDateInRange(payload?.AppDate, FromDate, ToDate)) {
      const dateObj = new Date(payload?.AppDate);
      const options = { weekday: "long" };
      const dayOfWeek = new Intl.DateTimeFormat("en-US", options).format(
        dateObj,
      );
      if (dayOfWeek != WeakOff) {
        if (isBetween) {
          if (todaydate) {
            if (isBefore) {
              axiosInstance
                .post("HomeCollectionSearch/RescheduleNow", payload)
                .then((res) => {
                  setLoad(false);
                  toast.success(res.data.message);
                  handleCloseReschedule();
                  handleClose();
                })
                .catch((err) => {
                  setLoad(false);
                  console.log(err);
                  toast.error(err?.response?.data?.message);
                });
            } else {
              toast.error("Select valid time Slot");
            }
          } else {
            axiosInstance
              .post("HomeCollectionSearch/RescheduleNow", payload)
              .then((res) => {
                setLoad(false);
                toast.success(res.data.message);
                handleCloseReschedule();
                handleClose();
              })
              .catch((err) => {
                setLoad(false);
                console.log(err);
                toast.error(err?.response?.data?.message);
              });
          }
        } else {
          toast.error("Phlebo Not available on this time");
        }
      } else {
        toast.error("Phlebo is on holiday on that day");
      }
    } else {
      setLoad(false);
      toast.error("Select Appointment Time");
    }
  };
  const dateSelect = (date, name, value) => {
    console.log(name, date);

    bindTimeSlots(date, "date");

    setnewData({
      ...newData,
      [name]: date,
    });
  };

  const BookingChecker = (value) => {
    const Booked2 = Booked.filter((i) => {
      return i.value == value;
    });
    if (Booked2[0].Booked == 1) {
      return false;
    } else {
      return true;
    }
  };
  const handleChange = (name,e) => {
    const {value } = e;
    if (name === "PhlebotomistId" && newData?.AppDate) {
      setnewData({ ...newData, [name]: value });
      bindTimeSlots(value, "phelboId");
    } else if (name == "AppTime") {
      if (value != "") {
        if (!BookingChecker(value)) {
          toast.error("Slot is Booked For Given Time, Select Another Slot");
        }
        setnewData({
          ...newData,
          [name]: BookingChecker(value) ? value : newData[name],
        });
      }
    } else {
      setnewData({ ...newData, [name]: value });
    }
  };
  console.log(newData);
  useEffect(() => {
    bindPhelbo();
  }, []);
  useEffect(() => {
    bindTimeSlots(null, "initial");
  }, [details]);

  const theme = useLocalStorage("theme", "get");

  return (
    <>
      <Dialog
        header={t("Reschedule Appointment")}
        visible={showReschedule}
        onHide={() => {
          handleCloseReschedule();
        }}
        draggable={false}
        className={theme}
        style={{ width: "500px" }}
      >
        <div className="row">
          <label
            className="col-sm-6 col-md-5"
            htmlFor="PreBooking ID"
            style={{ textAlign: "end" }}
          >
            {t("PreBooking ID")}:
          </label>

          <div className="col-sm-6 col-md-4">
            <span>{details.PreBookingId}</span>
          </div>
        </div>
        <div className="row">
          <label
            className="col-sm-12  col-md-5"
            htmlFor="Appointment Date and Time"
            style={{ textAlign: "end" }}
          >
            {t("Appointment Date and Time")} :
          </label>
          <div className="col-sm-12 col-md-4">
            <span>{details.AppDate}</span>
          </div>
        </div>
        <div className="row">
          <label
            className="col-sm-12  col-md-5"
            htmlFor="Requested Date"
            style={{ textAlign: "end" }}
          >
            {t("Requested Date")} :
          </label>
          <div className="col-sm-12 col-md-4">
            <span>{details.RequestDate}</span>
          </div>
        </div>
        <div className="row">
          <label
            className="col-sm-12  col-md-5"
            htmlFor="Remarks"
            style={{ textAlign: "end" }}
          >
            {t("Remarks")} :
          </label>
          <div className="col-sm-12 col-md-4">
            <span>{details.Remarks}</span>
          </div>
        </div>
        <div className="row">
          <label
            className="col-sm-12  col-md-5"
            htmlFor="Route"
            style={{ textAlign: "end" }}
          >
            {t("Route")} &nbsp;&nbsp;&nbsp;:
          </label>
          <div className="col-sm-12 col-md-4">
            <span>{details.RouteName}</span>
          </div>
        </div>
        <div className="row">
          <label
            className="col-sm-12  col-md-5"
            htmlFor="DropLocation"
            style={{ textAlign: "end" }}
          >
            {t("DropLocation")} :
          </label>
          <div className="col-sm-12 col-md-4">
            <span>{details.Centre}</span>
          </div>
        </div>
        <div className="row">
          <label
            className="col-sm-12  col-md-5"
            htmlFor="Phlebotomist Name"
            style={{ textAlign: "end" }}
          >
            {t("Phlebotomist Name")}:
          </label>

          <div className="col-sm-12 col-md-4">
            {/* <SelectBox
              name="PhlebotomistId"
              className="input-sm"
              options={Phelbos}
              selectedValue={newData?.PhlebotomistId}
              onChange={handleChange}
            /> */}

            <ReactSelect
                dynamicOptions={Phelbos}
                name="PhlebotomistId"
                className="input-sm"
                removeIsClearable={true}
                value={newData?.PhlebotomistId}
                onChange={handleChange}
              />
          </div>
        </div>
        <div className="row">
          <label
            className="col-sm-12  col-md-5"
            htmlFor="New Appointment Date"
            style={{ textAlign: "end" }}
          >
            {t("New Appointment Date")}:
          </label>
          <div className="col-sm-12 col-md-4">
            <DatePicker
              name="AppDate"
              className="custom-calendar"
              onChange={dateSelect}
              value={newData?.AppDate}
              maxDate={new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000)}
              minDate={new Date()}
            ></DatePicker>
          </div>
        </div>
        <div className="row">
          <label
            className="col-sm-12  col-md-5"
            htmlFor="Time"
            style={{ textAlign: "end" }}
          >
            {t("Time")}:
          </label>
          <div className="col-sm-12 col-md-3">
            {/* <SelectBox
              className="input-sm"
              name="AppTime"
              options={[
                { label: "Select Slot", value: "", Booked: 0 },
                ...TimeSlots,
              ]}
              selectedValue={newData?.AppTime}
              onChange={handleChange}
            /> */}

            <ReactSelect
                dynamicOptions={[
                { label: "Select Slot", value: "", Booked: 0 },
                ...TimeSlots,
              ]}
                className="input-sm"
                name="AppTime"
                placeholderName={"Select Slot"}
                removeIsClearable={true}
                value={newData?.AppTime}
                onChange={handleChange}
              />
          </div>
        </div>
        <div
          className="row mt-2"
          style={{ display: "flex", justifyContent: "center" }}
        >
          <div className="col-md-3">
            {load ? (
              <Loading />
            ) : (
              // <button
              //   type="button"
              //   className="btn btn-primary btn-block btn-sm"
              //   onClick={handleReschedule}
              // >
              //   Reschedule
              // </button>
              <CustomButton
                  text={"Reschedule"}
                  icon={"refresh"}
                  onClick={handleReschedule}
              />
            )}
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default HCHistoryRescheduleModal;
