import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { axiosInstance } from "../../utils/axiosInstance";
import ViewLogModal from "./ViewLogModal";
import { toast } from "react-toastify";
import Loading from "../../components/loader/Loading";
import { Dialog } from "primereact/dialog";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { CustomButton } from "../../components/UI/CustomButton";
const HCHistoryModal = ({
  showPatientData,
  hcHistoryShow,
  handleClosehcHistory,
}) => {
  const { t } = useTranslation();

  const [showViewLog, setShowViewLog] = useState(false);
  const [showHappyCode, setShowHappyCode] = useState([]);
  const [hcHistory, setHcHistory] = useState([]);
  const [data, setData] = useState([]);
  const [viewLog, setViewLog] = useState([]);
  const [load, setLoad] = useState(false);
  const handleCloseViewLog = () => setShowViewLog(false);
  // const handleOpenViewLog = () => setShowViewLog(true);
  const statusClasses = {
    Pending: "status-pending",
    // DoorLock: "status-doorlock",
    // "Reschedule Request": "status-reschedule",
    // "Cancel Request": "status-cancel",
    Rescheduled: "status-rescheduled",
    CheckIn: "status-checkin",
    Completed: "status-completed",
    "Booking Completed": "status-booking-completed",
    Canceled: "status-canceled",
  };

  // console.log(showPatientData);

  const getViewLog = (ele) => {
    console.log(ele);
    axiosInstance
      .post("HomeCollectionSearch/ViewLog", {
        PreBookingId: ele?.prebookingid,
        // PreBookingId: 12,
      })
      .then((res) => {
        const data = res?.data?.message;
        setViewLog(data);
        setData(ele);
        setShowViewLog(true);
      })
      .catch((err) =>
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Error Occured",
        ),
      );
  };
  console.log(showHappyCode);
  const showHcHistoryData = () => {
    setLoad(true);
    axiosInstance
      .post("CustomerCare/getHChistory", {
        Patientid: showPatientData.Patientid,
      })
      .then((res) => {
        setLoad(false);
        const data = res?.data?.message;
        const happyCode = data.map(() => {
          return false;
        });

        setShowHappyCode(happyCode);
        setHcHistory(data);
      })
      .catch((err) => {
        setLoad(false);
        console.log(err);
      });
  };
  const handleClose = (index) => {
    const arr = [...showHappyCode];
    arr[index] = false;
    setShowHappyCode(arr);
  };
  const getHappyCode = (ele, index) => {
    axiosInstance
      .post("HomeCollectionSearch/ShowHappyCode", {
        PreBookingId: ele?.prebookingid,
      })
      .then((res) => {
        const arr = [...showHappyCode];
        arr[index] = true;
        setShowHappyCode(arr);
        // toast.success(res?.data?.message);
      })
      .catch((err) => {
        toast.error("Happy Code Not Found");
      });
  };

  useEffect(() => {
    showHcHistoryData();
  }, []);
  const isMobile = window.innerWidth <= 768;
  const theme = useLocalStorage("theme", "get");
  return (
    <>
      {showViewLog && (
        <ViewLogModal
          data={data}
          viewLog={viewLog}
          showViewLog={showViewLog}
          handleCloseViewLog={handleCloseViewLog}
        />
      )}

      <Dialog
        visible={hcHistoryShow}
        style={{
          width: isMobile ? "80vw" : "70vw",
        }}
        header={`Home Collection History of ${showPatientData?.NAME} (${showPatientData?.Mobile} ) `}
        className={theme}
        onHide={handleClosehcHistory}
      >
        <div style={{ maxHeight: "500px", overflowY: "auto" }}>
          <div className="box">
            <div className="box-body  hcStatus">
              <div
                className=""
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <button
                    style={{
                      marginTop: "2px",
                      height: "14px",
                      border: "1px solid",
                      backgroundColor: "white",
                    }}
                  ></button>
                  &nbsp;&nbsp;
                  <label className="control-label">
                    {t("Pending")}&nbsp;&nbsp;&nbsp;
                  </label>
                </div>
                <div>
                  <button
                    style={{
                      marginTop: "2px",
                      height: "14px",
                      border: "1px solid",
                      backgroundColor: "lightblue",
                    }}
                  ></button>
                  &nbsp;&nbsp;
                  <label className="control-label">{t("Rescheduled")}</label>
                </div>
                <div>
                  <button
                    style={{
                      marginTop: "2px",
                      height: "14px",
                      border: "1px solid",
                      backgroundColor: "#FFFF00",
                    }}
                  ></button>
                  &nbsp;&nbsp;
                  <label className="control-label">{t("Check In")}</label>
                </div>
                <div>
                  <button
                    style={{
                      marginTop: "2px",
                      height: "14px",
                      border: "1px solid",
                      backgroundColor: "#9ACD32",
                    }}
                  ></button>
                  &nbsp;&nbsp;
                  <label className="control-label">{t("Completed")}</label>
                </div>
                <div>
                  <button
                    style={{
                      marginTop: "2px",
                      height: "14px",
                      border: "1px solid",
                      backgroundColor: "#00FFFF",
                    }}
                  ></button>
                  &nbsp;&nbsp;
                  <label className="control-label">
                    {t("Booking Completed")}
                  </label>
                </div>
                <div>
                  <button
                    style={{
                      marginTop: "2px",
                      height: "14px",
                      border: "1px solid",
                      backgroundColor: "#E75480",
                    }}
                  ></button>
                  &nbsp;&nbsp;
                  <label className="control-label">{t("Cancelled")}</label>
                </div>
              </div>
            </div>
          </div>

          <div className="">
            {load ? (
              <Loading />
            ) : hcHistory.length > 0 ? (
              hcHistory.map((ele, index) => (
                <>
                  <div
                    className={`box ${statusClasses[ele.cstatus]} `}
                    style={{ border: "1px solid grey" }}
                    key={index}
                  >
                    <div className="box-body" style={{ fontSize: "14px" }}>
                      <div className="row">
                        <div className="col-md-3">
                          <label>{t("Create Date ")}</label>&nbsp;:&nbsp;
                          {ele?.EntryDateTime}
                        </div>
                        <div className="col-md-3">
                          <label>{t("Create By ")}</label>&nbsp;:&nbsp;
                          {ele?.EntryByName}
                        </div>
                        <div className="col-md-3">
                          <label>{t("App Date ")}</label>&nbsp;:&nbsp;
                          {ele?.appdate}
                        </div>
                        <div className="col-md-3">
                          <label>{t("Prebooking ID")}&nbsp;:&nbsp;</label>
                          {ele?.prebookingid}
                          &nbsp;&nbsp;
                          {!showHappyCode[index] && (
                            <span
                              style={{
                                // backgroundColor: "#605ca8",
                                backgroundColor: "blue",
                                color: "white",
                                padding: "2px",
                                borderRadius: "2px",
                                cursor: "pointer",
                              }}
                              onClick={() => getHappyCode(ele, index)}
                            >
                              {t("Show Happy Code")}
                            </span>
                          )}
                          {showHappyCode[index] && (
                            <span
                              style={{
                                backgroundColor: "black",
                                color: "white",
                                padding: "2px",
                                borderRadius: "2px",
                                cursor: "pointer",
                              }}
                              onClick={() => handleClose(index)}
                            >
                              {ele?.VerificationCode}
                            </span>
                          )}
                          &nbsp;
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-md-3">
                          <label>{t("UHID ")}</label>&nbsp;:&nbsp;
                          {ele?.Patient_ID}
                        </div>
                        <div className="col-md-3">
                          <label>{t("Phelbo ")}</label>&nbsp;:&nbsp;
                          {ele?.phleboname}
                        </div>
                        <div className="col-md-3">
                          <label>{t("Phlebo Mobile ")}</label>&nbsp;:&nbsp;
                          {ele?.PMobile}
                        </div>
                        <div className="col-md-3">
                          <label>{t("Centre ")}</label>&nbsp;:&nbsp;
                          {ele?.centre}
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-md-3">
                          <label>{t("Status ")}</label>&nbsp;:&nbsp;
                          {ele?.cstatus}
                        </div>
                        <div className="col-md-3">
                          <label>{t("Visit ID ")}</label>&nbsp;:&nbsp;
                          {ele?.visitid}
                        </div>
                        <div className="col-md-3">
                          <label>{t("Patient Rating ")}</label>&nbsp;:&nbsp;
                          {ele?.patientrating}
                        </div>
                        <div className="col-md-3">
                          <label>{t("Phelbo Rating ")}</label>&nbsp;:&nbsp;
                          {ele?.phelborating}
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-md-6">
                          <label>{t("Patient Feedback ")}</label>
                          &nbsp;:&nbsp;
                          {ele?.PatientFeedback}
                        </div>
                        <div className="col-md-6">
                          <label>{t("Phelbo Feedback ")}</label>
                          &nbsp;:&nbsp;
                          {ele?.phelbofeedback}
                        </div>
                      </div>

                      {/* <div className="row">
                        
                      </div> */}

                      <div className="row">
                        <div className="col-md-3">
                          <label>{t("Gross Amount ")}</label>&nbsp;:&nbsp;
                          {ele?.Rate}
                        </div>
                        <div className="col-md-3">
                          <label>{t("Discount Amount ")}</label>
                          &nbsp;:&nbsp;
                          {ele?.discamt}
                        </div>
                        <div className="col-md-3">
                          <label>{t("Net Amount ")}</label>&nbsp;:&nbsp;
                          {ele?.netamt}
                        </div>
                        <div className="col-md-3">
                          <label>{t("Payment Mode ")}</label>&nbsp;:&nbsp;
                          {ele?.PaymentMode}
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-md-3">
                          <label>{t("CheckIn Date ")}</label>&nbsp;:&nbsp;
                          {ele?.checkindatetime}
                        </div>
                        <div className="col-md-3">
                          <label>{t("Comp. Date ")}</label>&nbsp;:&nbsp;
                          {ele?.compdate}
                        </div>

                        <div className="col-md-3">
                          <label>{t("Booking Date ")}</label>&nbsp;:&nbsp;
                          {ele?.currentstatusdate}
                        </div>
                        <div className="col-md-3">
                          <label>{t("Log ")}</label>&nbsp;:&nbsp;
                          {/* <button
                            name="View log"
                            className="btn btn-primary btn-sm "
                            onClick={() => getViewLog(ele)}
                          >
                            {t("View Log")}
                          </button> */}
                          <CustomButton
                              text={"View"}
                              icon={"eye"}
                              onClick={() => getViewLog(ele)}
                          />
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-md-12">
                          <label>{t("Test ")}</label>&nbsp;:&nbsp;
                          {ele?.testname}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ))
            ) : (
              <>
                <div style={{ textAlign: "center", fontSize: "15px" }}>
                  {" "}
                  <label>There are no active booking</label>
                </div>
              </>
            )}
          </div>
          <hr></hr>
        </div>
      </Dialog>
    </>
  );
};

export default HCHistoryModal;
