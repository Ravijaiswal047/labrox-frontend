import React, { useEffect, useState } from "react";
import Accordion from "../../../components/UI/Accordion";
import { useTranslation } from "react-i18next";
import Input from "../../../components/formComponent/Input";
import DatePicker from "../../../components/formComponent/DatePicker";
import ReactSelect from "../../../components/formComponent/ReactSelect";
import { PlusIcon, ViewMenu } from "../../../components/SvgIcons";
import Heading from "../../../components/UI/Heading";
import { Button } from "react-bootstrap";
// import QCFrameMenu from "../QCFrameMenu";
import { apiUrls } from "../../../utils/apiUrls";
import { axiosInstance } from "../../../utils/axiosInstance";
import { notify } from "../../../utils/utils";
import { useDispatch } from "react-redux";
import { setLoading } from "../../../store/reducers/loadingSlice/loadingSlice";
import { formatStandardDate, PreventSpecialCharacter, validateRequiredFields } from "../../../utils/helpers";
import { Form } from "react-bootstrap";
import Tables from "../../../components/UI/customTable";
import { Link } from "react-router-dom";
import { FaEdit } from "react-icons/fa";
import ColorCodingSearch from "../../../components/ModalComponent/ColorCodingSearch";
import FilterInput from "../../../components/Filter/FilterInput";
import { SaveButton } from "../../../components/UI/CustomButton";

const PatientRequisition = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [errors, setErrors] = useState({});
  const initialPayload = {
    PatientName: "", 
    AgeGender: "", 
    ContactNo: "", 
    Address: "", 
    BookingDate: new Date(), 
  };

  const [payload, setPayload] = useState(initialPayload);
  const [searchTerm, setSearchTerm] = useState("");
  const [tableData, setTableData] = useState([]);
  const [masterTable, setMasterTable] = useState([]);

  const dateSelect = (date, name) => {
    setPayload((prev) => ({
      ...prev,
      [name]: date,
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e?.target;
    if (name === "ContactNo") {
      // Only allow digits for contact number
      const onlyDigits = value.replace(/\D/g, "");
      setPayload((prev) => ({ ...prev, [name]: onlyDigits }));
    } else {
      setPayload((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };


  const handleReset = () => {
    setPayload(initialPayload);
    setErrors({});
  };

  const handleSave = async () => {
    const requiredFields = [
      "PatientName", // Add validation for PatientName
      "AgeGender", // Add validation for AgeGender
      "ContactNo", // Add validation for ContactNo
      "Address", // Add validation for Address
      "BookingDate", // Add validation for BookingDate
    ];
    const errors = validateRequiredFields(payload, requiredFields);
    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      return;
    }
    notify("Data Saved Successfully", "success");
  }
 
  console.log("Payload", payload);
  return (
    <>
      <Accordion
        name={t("Patient Request")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row p-2">
         
          <div className="col-xl-2 col-sm-4 col-md-6 col-12">
            <Input
              type="text"
              placeholder=""
              lable={t("Patient Name")}
              id="PatientName"
              name="PatientName"
              value={payload?.PatientName}
              onChange={handleChange}
            />
            {payload?.PatientName === "" && (
              <span className="error-message">{errors?.PatientName}</span>
            )}
          </div>

          <div className="col-xl-2 col-sm-4 col-md-6 col-12">
            <Input
              type="text"
              placeholder=""
              lable={t("Age/Gender")}
              id="AgeGender"
              name="AgeGender"
              value={payload?.AgeGender}
              onChange={handleChange}
            />
            {payload?.AgeGender === "" && (
              <span className="error-message">{errors?.AgeGender}</span>
            )}
          </div>

          <div className="col-xl-2 col-sm-4 col-md-6 col-12">
            <Input
              type="text"
              placeholder=""
              lable={t("Contact No")}
              id="ContactNo"
              name="ContactNo"
              value={payload?.ContactNo}
              onChange={handleChange}
              maxLength={15}
            />
            {payload?.ContactNo === "" && (
              <span className="error-message">{errors?.ContactNo}</span>
            )}
          </div>

          <div className="col-xl-2 col-sm-4 col-md-6 col-12">
            <Input
              type="text"
              placeholder=""
              lable={t("Address")}
              id="Address"
              name="Address"
              value={payload?.Address}
              onChange={handleChange}
            />
            {payload?.Address === "" && (
              <span className="error-message">{errors?.Address}</span>
            )}
          </div>

          <div className="col-xl-2 col-sm-4 col-md-6 col-12">
            <DatePicker
              name="BookingDate"
              id="BookingDate"
              value={payload?.BookingDate}
              onChange={dateSelect}
              placeholder=""
              lable={t("Booking Date")}
              className="custom-calendar"
            />
            {payload?.BookingDate === "" && (
              <span className="error-message">{errors?.BookingDate}</span>
            )}
          </div>
          <SaveButton text="Save" />
        </div>

        {/* <div className="row mb-2 mr-2">
          <div className="col-sm-12 d-flex justify-content-end">
            <Button
              className="rounded py-0 ml-2 mt-2"
              onClick={handleSave}
            >
              Save
            </Button>
          </div>
        </div> */}

      </Accordion>
    </>
  );
};

export default PatientRequisition;
