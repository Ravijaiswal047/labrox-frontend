import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { axiosInstance } from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { Dialog } from "primereact/dialog";
import Input from "../../components/formComponent/Input";
import Tables from "../../components/UI/customTable";
import ViewLogModal from "./ViewLogModal";
import HCHistoryCancelModal from "./HCHistoryCancelModal";
import HCHistoryRescheduleModal from "./HCHistoryRescheduleModal";
import HCEditModal from "./HCEditModal";
import { CancelButton, CustomButton, EditButton } from "../../components/UI/CustomButton";

const HomeCollectionDetailModal = ({
  show,
  handleClose,
  ele,
  statusDetails,
}) => {
  const [showViewLog, setShowViewLog] = useState(false);
  const [showCancel, setShowcancel] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [formData, setFormData] = useState({});
  const [LogData, setLogData] = useState([]);
  const [showReschedule, setShowReschedule] = useState(false);
  const [showHappyCode, setShowHappyCode] = useState(false);
  const [testDetails, setTestDetails] = useState([]);
  const [bindSourceCall, setBindSourceCall] = useState([]);
  const [PatientDetails, setPatientDetails] = useState({});
  const [photoFileName, setPhotoFileName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [showImagePreview, setShowImagePreview] = useState(false);
  const userdata = useLocalStorage("userData", "get");
  const DefaultCurrencyName = userdata?.DefaultCurrencyName;
  console.log("DefaultCurrencyName",DefaultCurrencyName);

  console.log(ele);

  const { t } = useTranslation();
  const handleCloseReschedule = () => {
    setShowReschedule(false);
  };
  const handleCloseViewLog = () => {
    setShowViewLog(false);
  };
  const handleCloseCancel = () => {
    setShowcancel(false);
  };
  const handleCloseEdit = () => {
    setShowEdit(false);
  };
  const fillFormdata = () => {
    setFormData(ele);
  };
  const getHappCode = (id) => {
    axiosInstance
      .post("HomeCollectionSearch/ShowHappyCode", { PreBookingId: 5 })
      .then((res) => {
        console.log(res.data.message);
        setShowHappyCode(true);
      })
      .catch((err) => {
        toast.error("Happy code not found");
      });
  };
  const bindTest = () => {
    axiosInstance
      .post("HomeCollectionSearch/BindItemDetail", {
        PreBookingId: ele?.PreBookingId,
      })
      .then((res) => {
        setTestDetails(res.data.message);
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "No Test Found",
        );
      });
  };
  const getTotalAmount = () => {
    return testDetails
      .reduce((total, item) => total + item.NetAmt, 0)
      .toFixed(2);
  };

  const getLogData = () => {
    axiosInstance
      .post("HomeCollectionSearch/ViewLog ", {
        PreBookingId: ele?.PreBookingId,
      })
      .then((res) => {
        setLogData(res.data.message);
      })
      .catch((err) => {
        toast.error(
          err?.data?.message ? err?.data?.message : "Could not find log",
        );
      });
  };

  const getPatientDetails = () => {
    axiosInstance
      .post("HomeCollectionSearch/EditAppointment", {
        PatientId: ele?.Patient_ID,
      })
      .then((res) => {
        const details = res?.data?.message;
        setPatientDetails(details);
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message);
      });
  };

  const getBindSourceCall = () => {
    axiosInstance
      .get("/CustomerCare/bindcollsource")
      .then((res) => {
        const data = res?.data?.message;
        const SourceCall = data?.map((ele) => {
          return {
            value: ele?.ID,
            label: ele?.Source,
          };
        });
        setBindSourceCall(SourceCall);
      })
      .catch((err) =>
        toast.error(err?.res?.data ? err?.res?.data : "Something Went Wrong"),
      );
  };
  const getBookingDetails = () => {
    axiosInstance
      .post("HomeCollectionSearch/GetDataOnUpdate", {
        prebookingid: ele?.PreBookingId,
      })
      .then((res) => {
        const data = Array.isArray(res?.data?.message)
          ? res?.data?.message?.[0]
          : res?.data?.message;
        setPhotoFileName(data?.PhotoFileName || "");
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Data not found..",
        );
      });
  };
  const handlePreviewFile = (awskey) => {
  if (awskey?.startsWith("http")) {
    setImageUrl(awskey);
    setShowImagePreview(true);
    return;
  }

  axiosInstance
    .post("CommonController/GetFileUrl", { Key: awskey })
    .then((res) => {
      const message = res?.data?.message;
      setImageUrl(
        typeof message === "string"
          ? message
          : message?.downloadUrl || message?.imgUrl || "",
      );
      setShowImagePreview(true);
    })
    .catch(() => {
      toast.error("Unable to preview file");
    });
};
  useEffect(() => {
    getBookingDetails();
  }, []);
  useEffect(() => {
    fillFormdata();
    bindTest();
    getLogData();
    getBindSourceCall();
    getPatientDetails();
  }, []);

  const getCollection = () => {
    for (let i of bindSourceCall) {
      if (i.value == formData?.SourceofCollection) {
        return i.label;
      }
    }
    return;
  };

  const changeFlow = (a) => {
    console.log(a);
    setFormData({
      ...formData,
      AlternateMobileNo: a?.AlternateMobileNo,
      SourceofCollection: a?.SourceofCollection,
      Vip: a?.VIP ? 1 : 0,
      HardCopyRequired: a?.HardCopyRequired ? 1 : 0,
      Remarks: a?.Remarks,
    });
    bindTest();
    getLogData();
    getBindSourceCall();
    getPatientDetails();
  };
  console.log(ele);

  const theme = useLocalStorage("theme", "get");

  return (
    <>
      {showViewLog && (
        <ViewLogModal
          data={ele}
          viewLog={LogData}
          showViewLog={showViewLog}
          handleCloseViewLog={handleCloseViewLog}
        />
      )}
      {showCancel && (
        <HCHistoryCancelModal
          showCancel={showCancel}
          handleClose={handleClose}
          handleCloseCancel={handleCloseCancel}
          details={ele}
        />
      )}
      {showReschedule && (
        <HCHistoryRescheduleModal
          handleClose={handleClose}
          showReschedule={showReschedule}
          handleCloseReschedule={handleCloseReschedule}
          details={ele}
        />
      )}
      {showEdit && (
        <HCEditModal
          showEdit={showEdit}
          handleCloseEdit={handleCloseEdit}
          handleClose={handleClose}
          changeFlow={changeFlow}
          details={ele}
          testDetails={testDetails}
          Discamount={testDetails.reduce(
            (current, init) => current + init.Discamt,
            0,
          )}
          PatientDetails={PatientDetails}
        />
      )}
      {showImagePreview && (
        <Dialog
          header={t("Image Preview")}
          visible={showImagePreview}
          onHide={() => setShowImagePreview(false)}
          draggable={false}
          className={theme}
          style={{ width: "700px" }}
        >
          <div className="text-center">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Home Collection Preview"
                style={{
                  maxWidth: "100%",
                  maxHeight: "70vh",
                  objectFit: "contain",
                }}
              />
            ) : (
              <div>{t("No Image")}</div>
            )}
          </div>
        </Dialog>
      )}
      <Dialog
        header={t("Home Collection Detail")}
        visible={show}
        onHide={() => {
          handleClose();
        }}
        draggable={false}
        className={theme}
        style={{ width: "1000px" }}
      >
        <div className="row my-2">
          <div className="col-sm-2">
            <Input
              type="text"
              lable={t("Current Status")}
              placeholder=""
              name="CurrentStatus"
              id="CurrentStatus"
              value={formData?.CStatus}
              disabled={true}
            />
          </div>
          <div className="col-sm-2">
            <Input
              type="text"
              lable={t("Last Update At")}
              placeholder=""
              name="LastUpdateAt"
              id="LastUpdateAt"
              value={formData?.CurrentStatusDate}
              disabled={true}
            />
          </div>
          <div className="col-sm-2">
            <Input
              type="text"
              lable={t("PreBooking ID")}
              placeholder=""
              name="PreBookingID"
              id="PreBookingID"
              value={formData?.PreBookingId}
              disabled={true}
            />
          </div>
          <div className="col-sm-2">
            <Input
              type="text"
              lable={t("Patient Name")}
              placeholder=""
              name="PatientName"
              id="PatientName"
              value={formData?.PatientName}
              disabled={true}
            />
          </div>
          <div className="col-sm-2">
            <Input
              type="text"
              lable={t("Mobile")}
              placeholder=""
              name="Mobile"
              id="Mobile"
              value={formData?.Mobile}
              disabled={true}
            />
          </div>
          <div className="col-sm-2">
            {/* <button
              type="button"
              className="btn btn-primary btn-sm w-100"
              onClick={() => {
                setShowViewLog(true);
              }}
            >
              {t("View Log")}
            </button> */}
            <CustomButton
              text={t("View Log")}
              icon={"eye"}
              onClick={() => {
                setShowViewLog(true);
              }}
            />
          </div>
        </div>
        <div className="row mt-1">
          <div className="col-sm-2">
            <Input
              type="text"
              lable={t("State")}
              placeholder=""
              name="State"
              id="State"
              value={formData?.State}
              disabled={true}
            />
          </div>
          <div className="col-sm-2">
            <Input
              type="text"
              lable={t("City")}
              placeholder=""
              name="City"
              id="City"
              value={formData?.City}
              disabled={true}
            />
          </div>
          <div className="col-sm-2">
            <Input
              type="text"
              lable={t("Area")}
              placeholder=""
              name="Area"
              id="Area"
              value={formData?.Locality}
              disabled={true}
            />
          </div>
          <div className="col-sm-2">
            <Input
              type="text"
              lable={t("Pincode")}
              placeholder=""
              name="Pincode"
              id="Pincode"
              value={formData?.PinCode}
              disabled={true}
            />
          </div>
          <div className="col-sm-2">
            <Input
              type="text"
              lable={t("Landmark")}
              placeholder=""
              name="Landmark"
              id="Landmark"
              value={formData?.Landmark}
              disabled={true}
            />
          </div>
          <div className="col-sm-2">
            <Input
              type="text"
              lable={t("Route")}
              placeholder=""
              name="Route"
              id="Route"
              value={formData?.RouteName}
              disabled={true}
            />
          </div>
        </div>
        <div className="row mt-1">
          <div className="col-sm-4">
            <Input
              type="text"
              lable={t("Address")}
              placeholder=""
              name="Address"
              id="Address"
              value={formData?.House_No}
              disabled={true}
            />
          </div>
          <div className="col-sm-2">
            <Input
              type="text"
              lable={t("Remarks")}
              placeholder=""
              name="Remarks"
              id="Remarks"
              value={formData?.Remarks}
              disabled={true}
            />
          </div>
          {ele?.CStatus == "Canceled" && (
            <>
              <div className="col-sm-2">
                <Input
                  type="text"
                  lable={t("Cancel Date")}
                  placeholder=""
                  name="CancelDate"
                  id="CancelDate"
                  value={formData?.CancelDateTime}
                  disabled={true}
                />
              </div>
              <div className="col-sm-2">
                <Input
                  type="text"
                  lable={t("Cancel Reason")}
                  placeholder=""
                  name="CancelReason"
                  id="CancelReason"
                  value={formData?.CancelReason}
                  disabled={true}
                />
              </div>
              <div className="col-sm-2">
                <Input
                  type="text"
                  lable={t("Cancel By")}
                  placeholder=""
                  name="CancelBy"
                  id="CancelBy"
                  value={formData?.CancelByName}
                  disabled={true}
                />
              </div>
            </>
          )}
          <div className="col-sm-2">
            {/* <button
              type="button"
              className="btn btn-primary btn-sm w-100"
              onClick={() => {
                if (!showHappyCode) {
                  getHappCode(ele.PreBookingId);
                  setShowHappyCode(true);
                } else {
                  setShowHappyCode(false);
                }
              }}
            >
              {showHappyCode ? formData?.VerificationCode : "Show Happy Code"}
            </button> */}
           {DefaultCurrencyName!=="KES" &&
           (
             <CustomButton
              text={showHappyCode ? formData?.VerificationCode : "Show Happy Code"}
              icon={"eye"}
              onClick={() => {
                if (!showHappyCode) {
                  getHappCode(ele.PreBookingId);
                  setShowHappyCode(true);
                } else {
                  setShowHappyCode(false);
                }
              }}
            />
           )}
          </div>
        </div>
        <div className="row mt-2">
          <div className="col-12">
            <Tables>
              <thead>
                <tr>
                  <th>{t("Entry Date")}</th>
                  <th>{t("Entry By")}</th>
                  <th>{t("Appointment Date")}</th>
                  <th>{t("UHID")}</th>
                  <th>{t("Age/Gender")}</th>
                  <th>{t("Alternate Mobile")}</th>
                  <th>{t("Refer Doctor")}</th>
                  <th>{t("SourceofCollection")}</th>
                  <th>{t("VIP")}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td data-title="Entry Date">
                    {formData?.EntryDateTime} &nbsp;
                  </td>
                  <td data-title="Entry By">{formData?.EntryByName}&nbsp;</td>
                  <td data-title="Appointment Date">
                    {formData?.AppDate}&nbsp;
                  </td>
                  <td data-title="UHID">{formData?.Patient_ID}&nbsp;</td>
                  <td data-title="Age/Gender">
                    {formData?.Age}/{formData?.Gender}&nbsp;
                  </td>
                  <td data-title="Alternate Mobile">
                    {formData?.AlternateMobileNo}&nbsp;
                  </td>
                  <td data-title="Refer Doctor">{formData?.Doctor}&nbsp;</td>

                  <td data-title="SourceofCollection">
                    {getCollection()}&nbsp;
                  </td>
                  <td data-title="VIP">
                    {formData?.Vip == 0 ? "No" : "Yes"}&nbsp;
                  </td>
                </tr>
              </tbody>
            </Tables>
          </div>
        </div>
        <div className="row mt-2">
          <div className="col-12">
            <Tables>
              <thead>
                <tr>
                  <th>{t("Phelbotomist")}</th>
                  <th>{t("PhelboMobile")}</th>
                  <th>{t("Centre")}</th>
                  <th>{t("CheckInDate")}</th>
                  <th>{t("CompletedDate")}</th>
                  <th>{t("BookingDate")}</th>
                  <th>{t("VisitID")}</th>
                  <th>{t("Hard Copy")}</th>
                  <th>{t("PhelboRating")}</th>
                  <th>{t("PatientRating")}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td data-title="Phelbotomist">
                    {formData?.PhleboName}&nbsp;
                  </td>
                  <td data-title="PhelboMobile">{formData?.PMobile}&nbsp;</td>
                  <td data-title="center">{formData?.Centre}&nbsp;</td>
                  <td data-title="CheckInDate">
                    {formData?.CheckInDateTime}&nbsp;
                  </td>
                  <td data-title="CompletedDate">
                    {formData?.FinalDoneDate} &nbsp;
                  </td>
                  <td data-title="BookingDate">
                    {formData?.EntryDateTime} &nbsp;
                  </td>
                  <td data-title="VisitID">{formData?.VisitId} &nbsp;</td>
                  <td data-title="Hard Copy">
                    {formData?.HardCopyRequired === 1 ? "Yes" : "No"}
                    &nbsp;
                  </td>
                  <td data-title="PhelboRating">
                    {formData?.phelborating}&nbsp;
                  </td>
                  <td data-title="PatientRating">
                    {formData?.PatientRating}&nbsp;
                  </td>
                </tr>
              </tbody>
            </Tables>
          </div>
        </div>
        <div className="row mt-2">
          <div className="col-12">
            <Tables>
              <thead>
                <tr>
                  <th>{t("Phelbo Feedback")}</th>
                  <th>{t("Patient Feedback")}</th>
                  <th>{t("Images")}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td data-title="Phelbo Feedback">
                    {formData?.phelbofeedback} &nbsp;
                  </td>
                  <td data-title="Patient Feedback">
                    {formData?.PatientFeedback} &nbsp;
                  </td>
                  <td data-title="Images" className="text-center">
                    {photoFileName ? (
                      <i
                        className="fa fa-paperclip text-primary cursor-pointer"
                        style={{ fontSize: "14px" }}
                        title={t("View Attachments")}
                        onClick={() => handlePreviewFile(photoFileName)}
                      />
                    ) : (
                      t("No Image")
                    )}
                  </td>
                </tr>
              </tbody>
            </Tables>
          </div>
        </div>
        <div className="row mt-2">
          <label className="col-md-6 col-sm-12">{t("Test Details")}</label>
          <label className="col-md-3 col-sm-12" style={{ textAlign: "end" }}>
            {t("Payment Mode")} : {testDetails[0]?.PaymentMode}
          </label>
          <label className="col-md-3 col-sm-12" style={{ textAlign: "end" }}>
            {t("Total Amount")} : {getTotalAmount()}
          </label>
        </div>
        <div className="row mt-2">
          <div className="col-12">
            <Tables>
              <thead className="cf text-center" style={{ zIndex: 99 }}>
                <tr>
                  <th>{t("#")}</th>
                  <th>{t("ItemID")}</th>
                  <th>{t("Item Name")}</th>
                  <th>{t("Item Type")}</th>
                  <th>{t("Rate")}</th>
                  <th>{t("Disc Amt")}</th>
                  <th>{t("Net Amt")}</th>
                </tr>
              </thead>
              <tbody>
                {testDetails.map((ele, index) => (
                  <>
                    <tr key={index}>
                      <td data-title="#">{index + 1}</td>
                      <td data-title="ItemID">{ele?.ItemId} &nbsp;</td>
                      <td data-title="Item Name">{ele?.ItemName} &nbsp; </td>
                      <td data-title="Item Type">{ele?.ItemType} &nbsp; </td>
                      <td data-title="Rate">
                        {ele?.Discamt + ele?.NetAmt} &nbsp;
                      </td>
                      <td data-title="Disc Amt">{ele?.Discamt} &nbsp;</td>
                      <td data-title="Net Amt">{ele?.NetAmt} &nbsp;</td>
                    </tr>
                  </>
                ))}
              </tbody>
            </Tables>
          </div>
        </div>
        <div
          className="row mt-2"
          style={{ display: "flex", justifyContent: "center", gap: "10px" }}
        >
          {statusDetails?.cancel && (
            <CancelButton
              text={"Cancel"}
              onClick={() => {
                setShowcancel(true);
              }}
              disabled={testDetails?.length == 0}
            />
          )}
          {statusDetails?.edit && (
            <EditButton
              text={"edit"}
              onClick={() => {
                setShowEdit(true);
              }}
              disabled={testDetails?.length == 0}
            />
          )}
          {statusDetails?.reschedule && (
            <CustomButton
            icon={"refresh"}
              text={"Reschedule"}
                onClick={() => {
                setShowReschedule(true);
              }}
              disabled={testDetails?.length == 0}
            />
          )}
        </div>
      </Dialog>
    </>
  );
};

export default HomeCollectionDetailModal;
