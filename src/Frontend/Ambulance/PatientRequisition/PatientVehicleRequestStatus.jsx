import React, { useEffect, useState } from "react";
import Accordion from "../../../components/UI/Accordion";
import { useTranslation } from "react-i18next";
import Input from "../../../components/formComponent/Input";
import DatePicker from "../../../components/formComponent/DatePicker";
import { Button } from "react-bootstrap";
import { apiUrls } from "../../../utils/apiUrls";
import { axiosInstance } from "../../../utils/axiosInstance";
import { notify } from "../../../utils/utils";
import { useDispatch } from "react-redux";
import { setLoading } from "../../../store/reducers/loadingSlice/loadingSlice";
import Tables from "../../../components/UI/customTable";
import ColorCodingSearch from "../../../components/ModalComponent/ColorCodingSearch";
import Heading from "../../../components/UI/Heading";
import RadioInput from "../../../components/formComponent/RadioInput";
import { SearchButton } from "../../../components/UI/CustomButton";
// import './PatientRequest.css';

const PatientVehicleRequestStatus = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [errors, setErrors] = useState({});
  const initialPayload = {
    UHID: "",
    toWHom: "Patient",
    FirstName: "",
    LastName: "",
    FromDate: new Date(),
    ToDate: new Date(),
  };

  const [payload, setPayload] = useState(initialPayload);

  const colorCodingData = [
    { color: "#ffcc00", id: "1", labelKey: "Pending Request" },
    { color: "#007bff", id: "2", labelKey: "Patient Out" },
    { color: "#90EE90", id: "3", labelKey: "Complete Request" },
  ];

  const tableData = [
    {
      requestNo: "REQ001",
      toWhom: "Patient",
      patientInfo: "John Doe, 35, Male", // Example patient info
      requestDate: "2025-12-01",
      bookingDate: "2025-12-01", // Assuming this is the booking date
      vehicleType: "Sedan",
      vehicleNo: "KA-01-AB-1234",
      driverName: "Jane Smith",
      departureDateTime: "2025-12-05 09:00 AM",
      arrivalDateTime: "2025-12-05 11:00 AM",
      bookingBy: "Admin", // Assuming this is who made the booking
    },
    {
      requestNo: "REQ002",
      toWhom: "Doctor",
      patientInfo: "Alice Johnson, 28, Female", // Example patient info
      requestDate: "2025-12-02",
      bookingDate: "2025-12-02",
      vehicleType: "SUV",
      vehicleNo: "KA-02-CD-5678",
      driverName: "Mark Taylor",
      departureDateTime: "2025-12-06 12:00 PM",
      arrivalDateTime: "2025-12-06 02:30 PM",
      bookingBy: "Reception", // Example of booking made by someone else
    },
    {
      requestNo: "REQ003",
      toWhom: "RateType",
      patientInfo: "Bob Williams, 40, Male", // Example patient info
      requestDate: "2025-12-03",
      bookingDate: "2025-12-03",
      vehicleType: "Hatchback",
      vehicleNo: "KA-03-EF-9101",
      driverName: "Tom Davis",
      departureDateTime: "2025-12-07 07:30 AM",
      arrivalDateTime: "2025-12-07 09:00 AM",
      bookingBy: "Admin", // Another booking example
    },
  ];

  // const getStatusColor = (statusId) => {
  //   const status = colorCodingData.find((item) => item.id === statusId);
  //   console.log("status.color", status.color);
  //   return status ? status.color : "#ffffff";
  // };

  const dateSelect = (date, name) => {
    setPayload((prev) => ({
      ...prev,
      [name]: date,
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e?.target;
    setPayload((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  const handleReset = () => {
    setPayload(initialPayload);
    setErrors({});
  };

  const handleSearch = async () => {
    // Validate if the 'Patient' option is selected and the UHID is empty
    if (payload.toWHom === "Patient" && !payload.UHID) {
      setErrors({ UHID: t("This Field is required") });
      return; // Prevent further action
    }

    notify("Data Search Successfully", "success");
  };

  useEffect(() => {
    setErrors({});
  }, [payload?.toWHom]);
  console.log("Payload", payload);
  console.log("errors", errors);
  return (
    <>
      <Accordion
        name={t("Patient Vehicle Request Status")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row p-2">

          <div className="col-xl-3 col-sm-6 col-md-4 col-12">

            <div className="d-flex flex-wrap gap-3">
              <label className="mr-3">{t("To Whom: ")}</label>
              {/* Patient Option */}
              <RadioInput
                type="radio"
                label={t("Patient")}
                name="toWhom"
                value="Patient"
                checked={payload.toWHom === "Patient"}
                onChange={() => handleChange({ target: { name: "toWHom", value: "Patient" } })}
              />

              {/* RateType Option */}
              <RadioInput
                type="radio"
                label={t("RateType")}
                name="toWhom"
                value="RateType"
                checked={payload.toWHom === "RateType"}
                onChange={() => handleChange({ target: { name: "toWHom", value: "RateType" } })}
              />

              {/* Doctor Option */}
              <RadioInput
                type="radio"
                label={t("Doctor")}
                name="toWhom"
                value="Doctor"
                checked={payload.toWHom === "Doctor"}
                onChange={() => handleChange({ target: { name: "toWHom", value: "Doctor" } })}
              />
            </div>
          </div>

          <div className="col-xl-2 col-sm-6 col-md-2 col-12">
            <Input
              type="text"
              placeholder=""
              lable={t("Visit No")}
              id="UHID"
              name="UHID"
              value={payload?.UHID}
              onChange={handleChange}
            />
            {payload?.UHID === "" && (
              <span className="error-message">{errors?.UHID}</span>
            )}
          </div>

          <div className="col-xl-2 col-sm-6 col-md-2 col-12">
            <DatePicker
              name="FromDate"
              id="FromDate"
              value={payload?.FromDate}
              onChange={dateSelect}
              placeholder=""
              lable={t("From Date")}
              className="custom-calendar"
              maxDate={new Date()}
            />
            {/* {payload?.FromDate === "" && (
              <span className="error-message">{errors?.FromDate}</span>
            )} */}
          </div>

          <div className="col-xl-2 col-sm-6 col-md-2 col-12">
            <DatePicker
              name="ToDate"
              id="ToDate"
              value={payload?.ToDate}
              onChange={dateSelect}
              placeholder=""
              lable={t("To Date")}
              className="custom-calendar"
              minDate={payload.FromDate}
            />
            {/* {payload?.ToDate === "" && (
              <span className="error-message">{errors?.ToDate}</span>
            )} */}
          </div>


          <div className="col-xl-2 col-sm-2 col-md-2 col-12">
            {/* <Button
              className="rounded py-0"
              onClick={handleSearch}
            >
              {t("Search")}
            </Button> */}
            <SearchButton text="Search" onClick={handleSearch} />
          </div>
        </div>

      </Accordion>
      <Heading
        title={t("Search Details")}
        secondTitle={
          <>
            {colorCodingData.map(({ color, labelKey, id }) => (
              <ColorCodingSearch key={id} color={color} label={t(labelKey)} />
            ))}
          </>
        }
      />
      <div className="row p-2">
        <div className="col-12">
          <Tables>
            <thead className="cf">
              <tr>
                <th>{t("Sr. No")}</th>
                <th>{t("Request No")}</th>
                <th>{t("To Whom")}</th>
                <th>{t("Patient Info")}</th> {/* This column can hold patient info, assuming you're storing it */}
                <th>{t("Request Date")}</th>
                <th>{t("Booking Date")}</th> {/* This column might refer to travel date or similar */}
                <th>{t("Vehicle Type")}</th>
                <th>{t("Vehicle No")}</th>
                <th>{t("Driver Name")}</th>
                <th>{t("Departure Date/Time")}</th>
                <th>{t("Arrival Date/Time")}</th>
                <th>{t("Booking By")}</th> {/* Assuming this is available in your data */}
              </tr>
            </thead>

            <tbody>
              {tableData?.map((item, i) => {
                // const rowColor = getStatusColor(item.statusId);
                return (
                  <tr key={i} 
                  // style={{ backgroundColor: rowColor }}
                  >
                    <td data-title={t("Sr. No")}>{i + 1}</td>
                    <td data-title={t("Request No")}>{item.requestNo}</td>
                    <td data-title={t("To Whom")}>{item.toWhom}</td> {/* Assuming you have this field */}
                    <td data-title={t("Patient Info")}>{item.patientInfo}</td> {/* Assuming you have patient info */}
                    <td data-title={t("Request Date")}>{item.requestDate}</td>
                    <td data-title={t("Booking Date")}>{item.bookingDate}</td> {/* Assuming you have booking date */}
                    <td data-title={t("Vehicle Type")}>{item.vehicleType}</td>
                    <td data-title={t("Vehicle No")}>{item.vehicleNo}</td>
                    <td data-title={t("Driver Name")}>{item.driverName}</td>
                    <td data-title={t("Departure Date/Time")}>{item.departureDateTime}</td>
                    <td data-title={t("Arrival Date/Time")}>{item.arrivalDateTime}</td>
                    <td data-title={t("Booking By")}>{item.bookingBy}</td> {/* Assuming you have this field */}
                  </tr>
                );
              })}
            </tbody>
          </Tables>
        </div>
      </div>
    </>
  );
};

export default PatientVehicleRequestStatus;
