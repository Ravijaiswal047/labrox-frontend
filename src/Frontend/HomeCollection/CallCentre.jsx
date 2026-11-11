import React, { useEffect } from "react";
import { useState } from "react";
import { toast } from "react-toastify";
import Input from "../../components/formComponent/Input";
import { useTranslation } from "react-i18next";
import NewPatientDetailModal from "./NewPatientDetailModal";
import RegisteredPatientDetailModal from "./RegisteredPatientDetailModal";
import moment from "moment";
import { number } from "../../utils/helpers";
import AppointmentModal from "./AppointmentModal";
import HCHistoryModal from "./HCHistoryModal";
import { axiosInstance } from "../../utils/axiosInstance";

import Accordion from "@app/components/UI/Accordion";
import Tables from "../../components/UI/customTable";
import { Link } from "react-router-dom";
import { HCNewPatientForm } from "../../utils/Constants";
import { FaSearch } from "react-icons/fa";
import { CancelButton, CustomButton, SearchButton } from "../../components/UI/CustomButton";
import "./CallCentre.css";
import { Tooltip } from "primereact/tooltip";
const CallCentre = () => {
  const { t } = useTranslation();
  const [mobile, setMobile] = useState("");
  const [mobileData, setMobileData] = useState([]);
  const [show, setShow] = useState(false);
  const [detailShow, setDetailShow] = useState(false);
  const [appointShow, setAppointShow] = useState(false);
  const [hcHistoryShow, sethcHistoryShow] = useState(false);
  const [showPatientData, setShowPatientData] = useState({});
  const [hcStatusShow, setHcStatusShow] = useState([]);
  const [showHomeButton, setShowHomeButton] = useState(true);
  const [isDisabled, setIsDisabled] = useState(false);
  const [patientID, setPatientID] = useState("");

  const handleClose = () => {
    setShow(false);
    setShowPatientData({});
    // setPatientID("");
    // setMobile("");
  };

  const showDetail = () => {
    setDetailShow(true);
    BindNumber();
  }

  const handleCloseDetailShow = () => {
    setDetailShow(false);
    setMobileData([]);
    // setPatientID("");
    // setMobile("");
  };

  const handleCloseAppoint = () => {
    setAppointShow(false);
    getHcHistory(patientID);
    setShowHomeButton(true);
  }
  const handleClosehcHistory = () => sethcHistoryShow(false);
  const handleOpenhcHistory = () => sethcHistoryShow(true);

  const handleClear = () => {
    setMobile("");
    setMobileData("");
    setShow(false);
    setDetailShow(false);
    setIsDisabled(false);
    setShowPatientData({});
    setAppointShow(false);
    setShowHomeButton(true);
    setPatientID("");
  };

  const handleMobile = (e) => {
    setMobile(e.target.value);
  };

  const handlePatientData = (e) => {
    const keypress = [13];
    if (keypress.includes(e.which)) {
      e.preventDefault();

      getDataByMobileNo();
    }
  };
  const BindNumber = () => {
    axiosInstance
      .post("CustomerCare/BindOldPatient", {
        mobile: mobile,
      })
      .then((res) => {
        if (res?.data?.success === false) {
          setShowPatientData({});
          toast.info("No Patient Found. Register New");
          setShow(true);
          setDetailShow(false);
          setMobileData("");
        } else {
          setShow(false);
          setMobileData(res?.data?.message);
          setDetailShow(true);
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
  const getDataByMobileNo = () => {
    if (mobile.length === 10) {
      axiosInstance
        .post("CommonController/CheckInvalidMobileNo", {
          MobileNo: mobile,
        })
        .then((res) => {
          setShowPatientData({});
          BindNumber();
        })
        .catch((err) => {
          toast.error(
            err?.response?.data?.message == 1
              ? "Invalid Mobile Number"
              : BindNumber(),
          );
        });
    } else {
      toast.error("Mobile length must be equal to 10");
    }
  };

  const handleCustomerCare = (data) => {
    const payload = {
      ...HCNewPatientForm,
      Title: data?.title || "",
      PName: data?.NAME || "",
      HouseNo: data?.HouseNo,
      StreetName: data?.Street || "",
      LocalityID: data?.LocalityID != null ? data.LocalityID.toString() : "0",
      CityID: data?.CityID != null ? data.CityID.toString() : "0",
      Pincode: data?.Pincode || "0",
      StateID: data?.StateID != null ? data.StateID.toString() : "0",
      CountryID: data?.CountryID != null ? data.CountryID.toString() : "10",
      Phone: data?.Phone || "",
      Mobile: data?.Mobile || "",
      Email: data?.Email || "",
      DOB: data?.DOB ? new Date(data.DOB).toISOString() : "",
      Age: data?.Age || "",
      AgeYear: data?.AgeYear != null ? data.AgeYear.toString() : "",
      AgeMonth: Number(data?.AgeMonth) || 0,
      AgeDays: Number(data?.AgeDays) || 0,
      TotalAgeInDays: Number(data?.TotalAgeInDays) || 0,
      Gender: data?.Gender || "",
      Landmark: data?.Landmark || "",
      PatientCode: data?.PatientCode || "",
      Patientid: data?.Patientid || "",
    };

    axiosInstance
      .post("CustomerCare/SaveNewPatientFromHIS", {
        NewPatientData: payload,
      })
      .then((res) => {
        console.log(res?.data, "new patiendt data---");
        if (res?.data?.success) {
          toast.success(res?.data?.message);
          handleCloseDetailShow();
          setMobileData([]);
          setShowPatientData(data);
          setAppointShow(true);
        } else {
          toast.error(res?.data?.message);
        }
        // setShowPatientData(res?.data?.message);
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Error Occured"
        );
      });
  };

  const handleSelectData = (ele) => {
    setIsDisabled(true);
    ele?.FromHis && handleCustomerCare(ele);
    getHcHistory(ele?.Patientid || "");
    setPatientID(ele?.Patientid);
    setShowHomeButton(false);
  };

  const getHcHistory = (patientid) => {
    axiosInstance
      .post("CustomerCare/BindOldPatientHomeCollectionData", {
        patient_id: String(patientid),
      })
      .then((res) => {
        console.log(res?.data?.message);
        if(res?.data?.success && Array.isArray(res?.data?.message)){
          setHcStatusShow(res?.data?.message);
        }
        else{
          setHcStatusShow([]);
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

  // useEffect(() => {
  //   if(showPatientData?.length > 0){
  //       setAppointShow(true);
  //   } 
  //   else{
  //       setAppointShow(false);
  //   }   
  // },[showPatientData])

  console.log("mobileData main page", mobileData);
  console.log("PatientID", patientID);
  return (
    <>
      {hcHistoryShow && (
        <HCHistoryModal
          showPatientData={showPatientData}
          hcHistoryShow={hcHistoryShow}
          handleClosehcHistory={handleClosehcHistory}
        />
      )}
      <Accordion
        name={t("Customer Care Management")}
        defaultValue={true}
        isBreadcrumb={true}
        linkTo="/HomeCollectionSearcH"
        linkTitle={
          <>
            <Link to="/PhlebotomistMapping">
              <button type="button" className="btn btn-sm btn-primary mr-3">
                <i className="fa fa-arrow-left  text-black "></i>
              </button>
            </Link>
            <button type="button" className="btn btn-sm btn-primary">
              <i className="fa fa-arrow-right  text-black "></i>
            </button>
          </>
        }
      >
        <div className="row pt-2 pl-2 pr-2 mb-1">
          {/* <div className="col-md-1">
            <input
              type="radio"
              checked={true}
              name="Patient"
              className="mt-1"
            ></input>
            &nbsp;
            <label htmlFor="Patient" className="control-label">
              {t("Patient")}
            </label>
          </div> */}
          <div className=" col-md-2">
            {/* <div className="d-flex"> */}
            {/* <div style={{ width: "86%" }}> */}
            <Input
              type="number"
              lable="Mobile No."
              id="Mobile No"
              className="required-fields"
              placeholder=" "
              name="Mobile"
              value={mobile}
              max={10}
              onInput={(e) => number(e, 10)}
              onKeyDown={handlePatientData}
              onChange={handleMobile}
              autoComplete="off"
              disabled={isDisabled}
            />
          </div>
          {/* </div> */}
          {/* <div style={{ width: "10%" }} className="ml-1"> */}
          {/* <div className="col-md-1 "> */}
          <SearchButton
            text="Search"
            onClick={getDataByMobileNo}
            disabled={isDisabled}
            className="mr-2"
          />
          {/* <button
                  className="btn btn-sm btn-primary"
                  type="button"
                  onClick={getDataByMobileNo}
                  disabled={isDisabled}
                >
                  <FaSearch /> &nbsp; {"Search"}
                </button>  */}
          {/* </div> */}
          {/* </div>{" "} */}
          {/* </div> */}

          {/* <div className="col-md-1"> */}
          {/* <button
              className=" btn btn-danger btn-sm"
              onClick={() => {
                handleClear();
              }}
            >
              {t("Clear")}
            </button> */}
          <CancelButton text="Clear" onClick={() => {
            handleClear();
          }} />
          {/* </div> */}
        </div>{" "}

      </Accordion>

      {show && (
        <Accordion
          title={t("Register New Patient")}
          defaultValue={true}
        // isBreadcrumb={true}

        >
          <NewPatientDetailModal
            show={show}
            handleClose={handleClose}
            mobile={mobile}
            showDetail={showDetail}
          />
        </Accordion>
      )}
      {(detailShow && (mobileData?.length > 0)) && (
        <Accordion
          title={t("Old Patient")}
          defaultValue={true}
        // isBreadcrumb={true}   
        >
          <RegisteredPatientDetailModal
            setShow={setShow}
            mobileData={mobileData}
            detailShow={detailShow}
            handleCloseDetailShow={handleCloseDetailShow}
            handleSelectData={handleSelectData}
            handleCustomerCare={handleCustomerCare}
          />
        </Accordion>
      )}

      {Object.keys(showPatientData).length > 0 && (
        <>
          {" "}
          <Accordion title={t("Selected Patient Details")} defaultValue={true}>
            <Tables>
              <thead>
                <tr>
                  <th>{t("UHID")}</th>
                  <th>{t("Patient Name")}</th>
                  <th>{t("Age")}</th>
                  <th>{t("Gender")}</th>
                  <th>{t("Mobile")}</th>
                  <th>{t("State")}</th>
                  <th>{t("City")}</th>
                  <th>{t("Area")}</th>
                  <th>{t("Email")}</th>
                  <th>{t("DOB")}</th>
                  <th>{t("Pincode")}</th>
                  <th>{t("Last Call")}</th>
                  <th>{t("Reason of Call")}</th>
                  <th>{t("LastHC History")}</th> <th>{t("PrebookingID")}</th>{" "}
                  <th>{t("LastHCApp.Date")}</th> <th>{t("LastHCStatus")}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  {/* The column is headed UHID, so show the UHID. This printed the
                      internal Patientid, which is a different number from the one
                      the Old Patient grid above shows for the same person. */}
                  <td data-title="UHID">
                    {showPatientData?.PatientCode || showPatientData?.UHID || ""}
                  </td>
                  <td data-title="NAME">{showPatientData?.NAME}</td>
                  <td data-title="Age">{showPatientData?.Age}</td>
                  <td data-title="Gender">{showPatientData?.Gender}</td>
                  <td data-title="Mobile">{showPatientData?.Mobile}</td>
                  <td data-title="StateName">{showPatientData?.StateName}</td>
                  <td data-title="City">{showPatientData?.City}</td>
                  <td data-title="LocalityName">
                    {showPatientData?.LocalityName}&nbsp;
                  </td>
                  <td data-title="Email">{showPatientData?.Email}&nbsp;</td>
                  <td data-title="DOB">
                    {moment(showPatientData?.DOB).format("DD-MMM-YYYY")}&nbsp;
                  </td>
                  <td data-title="Pincode">{showPatientData?.Pincode}&nbsp;</td>
                  <td data-title="LastCall">
                    {showPatientData?.LastCall}&nbsp;
                  </td>
                  <td data-title="ReasonofCall">
                    {showPatientData?.ReasonofCall}&nbsp;
                  </td>
                  <td data-title="HC History">
                    {hcStatusShow?.length > 0 && (
                      // <button
                      //   type="button"
                      //   name="HC History"
                      //   className="btn btn-success btn-sm "
                      //   onClick={handleOpenhcHistory}
                      // >
                      //   {t("HC History")}
                      // </button>
                      <>
                        <Tooltip target={`#hchistory`} position="top" content={t("HC History")} />
                        <CustomButton
                          id={"hchistory"}
                          onClick={handleOpenhcHistory}
                          icon={"history"}
                        />
                      </>
                    )}
                    &nbsp;
                  </td>
                  <td data-title="PrebookingID">
                    {hcStatusShow[0]?.prebookingid}&nbsp;
                  </td>
                  <td data-title="LastHCApp.Date">
                    {hcStatusShow[0]?.appdate}&nbsp;
                  </td>
                  <td data-title="LastHCStatus">
                    {hcStatusShow[0]?.currentstatus}&nbsp;
                  </td>
                </tr>
              </tbody>
            </Tables>
            <div className="row mb-2 mt-2 px-1">
              <div className="col-sm-3">
                {showHomeButton && (
                  // <button
                  //   className="btn btn-primary btn-sm"
                  //   style={{ height: "30px", fontSize: "15px" }}
                  //   onClick={() => {
                  //     setAppointShow(true);
                  //     setShowHomeButton(false);
                  //     setIsDisabled(true);
                  //   }}
                  // >
                  //   {t("Home Collection")}
                  // </button>

                  <CustomButton
                      text={"Home Collection"}
                      icon={"home"}
                      onClick={() => {
                      setAppointShow(true);
                      setShowHomeButton(false);
                      setIsDisabled(true);
                    }}
                  />
                )}
              </div>
            </div>
          </Accordion>{" "}
        </>
      )}{" "}
      {appointShow && (
        <Accordion
          title={t("Book Appointment")}
          defaultValue={true}
        // isBreadcrumb={true}   
        >
          <AppointmentModal
            showPatientData={showPatientData}
            appointShow={appointShow}
            handleCloseAppoint={handleCloseAppoint}
          />
        </Accordion>
      )}
    </>
  );
};

export default CallCentre;
