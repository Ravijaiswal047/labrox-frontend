import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { axiosInstance } from "../../utils/axiosInstance";
import Loading from "../../components/loader/Loading";
import Tables from "../../components/UI/customTable";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { Dialog } from "primereact/dialog";
import { FaEye } from "react-icons/fa";
import { RateTypeModal } from "./PatientDetailsRateTypeModal";

const PatientDetailModal = ({ showPH, setShowPH, ResultData, Index }) => {
  const { t } = useTranslation();
  const [patientData, setPatientData] = useState([]);
  const [load, setLoad] = useState(false);
  const [showRateModal, setShowRateModal] = useState(false);
  const [rateModalData, setRateModalData] = useState(null);
   const isMobile = window.innerWidth <= 768;
  
    const theme = useLocalStorage("theme", "get");

  const getPatientDetailData = () => {
    setLoad(true);

    const currentData =
      Index !== undefined && Index !== -1 ? ResultData[Index] : ResultData[0];

    if (!currentData?.LedgerTransactionNo) {
      toast.error("No valid data found");
      setLoad(false);
      return;
    }

    // Handle TestID - it could be string, number, or array
    let testIds = [0]; // Default value

    if (currentData?.TestID) {
      if (Array.isArray(currentData.TestID)) {
        testIds = currentData.TestID.map((item) => Number(item));
      } else if (typeof currentData.TestID === "string") {
        testIds = currentData.TestID.split(",").map((item) =>
          Number(item.trim()),
        );
      } else {
        testIds = [Number(currentData.TestID)];
      }
    }

    console.log("Sending request with:", {
      LedgerTransactionNo: currentData.LedgerTransactionNo,
      TestId: testIds,
    });

    axiosInstance
      .post("RECulture/GetPatientDetail", {
        LedgerTransactionNo: currentData.LedgerTransactionNo,
        TestId: testIds,
      })
      .then((res) => {
        setLoad(false);
        if (res.data?.success && Array.isArray(res?.data?.message)) {
          setPatientData(res?.data?.message);
        } else {
          toast.error(res.data?.message || "No Data Found");
          handleClose();
        }
      })
      .catch((err) => {
        setLoad(false);
        handleClose();
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Something Went Wrong",
        );
      });
  };

  const handleClose = () => {
    setShowPH(false);
    setPatientData([]);
  };

  const onHide = () => {
    handleClose();
  };

  useEffect(() => {
    if (showPH && ResultData && ResultData.length > 0) {
      getPatientDetailData();
    }
  }, [showPH]);

  return (
    <>
      <Dialog
        header={t("Sample Information")}
        onHide={onHide}
        visible={showPH}
        style={{
          width: isMobile ? "80vw" : "90vw",
        }}
        className={theme}
        closable={true}
        dismissableMask={true}
        closeOnEscape={true}
      >

        <>
          {load ? (
            <Loading />
          ) : (
            <div className="">
              <div className="">
                <div className="row">
                  <div className="col-md-4">
                    <label>{t("Visit No")} : &nbsp;</label>
                    {patientData[0]?.LedgerTransactionNo}
                  </div>
                  <div className="col-md-4">
                    <label>{t("UHID")} : &nbsp;</label>
                    {patientData[0]?.PatientCode}
                  </div>
                  <div className="col-md-4">
                    <label>{t("Mobile No")} : &nbsp;</label>
                    {patientData[0]?.Mobile}
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-4">
                    <label>{t("Patient Name")} : &nbsp;</label>
                    {patientData[0]?.PName}
                  </div>
                  <div className="col-md-4">
                    <label>{t("Age / DOB")} : &nbsp;</label>
                    {patientData[0]?.Age} / {patientData[0]?.DOB}
                  </div>
                  <div className="col-md-4">
                    <label>{t("Gender")} : &nbsp;</label>
                    {patientData[0]?.Gender}
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-4">
                    <label>{t("Centre")} : &nbsp;</label>
                    {patientData[0]?.CentreName}
                  </div>
                  <div className="col-md-4">
                    <label>{t("Rate Type")} : &nbsp;</label>
                    {patientData[0]?.RateType}
                    <FaEye
                      style={{
                        marginLeft: "10px",
                        fontSize: "18px",
                        cursor: "pointer",
                        color: "#007bff",
                      }}
                      onClick={() => {
                        setRateModalData(patientData[0]);
                        setShowRateModal(true);
                      }}
                    />
                  </div>
                  <div className="col-md-4">
                    <label>{t("Doctor")} : &nbsp;</label>
                    {patientData[0]?.ReferDoctor}
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-4">
                    <label>{t("Refer Lab")} : &nbsp;</label>
                    {patientData[0]?.ReferLabName}
                  </div>
                  <div className="col-md-4">
                    <label>{t("Collection Boy")} : &nbsp;</label>
                    {patientData[0]?.CollectionBoyName}
                  </div>
                  <div className="col-md-4">
                    <label>{t("Result Entered By")} : &nbsp;</label>
                    {patientData[0]?.ResultEnteredName}
                  </div>
                  <div className="col-md-4">
                    <label>{t("Reg Info")} : &nbsp;</label>
                    {patientData[0]?.RegisteredBy} / {patientData[0]?.RegDate} /{" "}
                    {patientData[0]?.RegTime}
                  </div>
                  <div className="col-md-4">
                    <label>{t("Due Amount collected By")} : &nbsp;</label>
                    {patientData[0]?.DueCollectedBy}
                  </div>
                </div>
              </div>

              <div className="">
                <Tables overflow={true}>
                  <thead className="cf text-center">
                    <tr>
                      <th className="text-center">{t("Department Name")}</th>
                      <th className="text-center">{t("Investigation Name")}</th>
                      <th className="text-center">{t("Barcode No")}</th>
                      {/* <th className="text-center">{t("Work Order By")}</th> */}

                      <th className="text-center">{t("Collection info")}</th>
                      <th className="text-center">{t("Received")}</th>
                      <th className="text-center">{t("Tested")}</th>
                      <th className="text-center">{t("Approved")}</th>
                      <th className="text-center">{t("Rejected")}</th>
                      <th className="text-center">{t("Test centre")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patientData?.map((ele, index) => (
                      <tr key={index}>
                        <td className="text-center">
                          {ele?.DepartmentName}&nbsp;
                        </td>
                        <td className="text-center">
                          {ele?.InvestigationName}&nbsp;
                        </td>
                        <td className="text-center">{ele?.BarcodeNo}&nbsp;</td>
                        {/* <td className="text-center">
                        {ele?.RegisteredBy}&nbsp;
                      </td> */}
                        {/* <td className="px-2">
                        <p className="mb-0">RegisteredBy: {ele?.RegisteredBy}</p>
                        <p className="mb-0">RegisteredDate: {ele?.RegDate}</p>
                        <p className="mb-0">RegisteredTime: {ele?.Time || 'N/A'}</p>
                      </td> */}
                        <td className="px-2">
                          {ele?.SampleCollectionByName && (
                            <p className="mb-0">
                              CollectedBy: {ele?.SampleCollectionByName}
                            </p>
                          )}
                          {ele?.SampleCollectionDate && (
                            <p className="mb-0">
                              CollectedDate: {ele?.SampleCollectionDate}
                            </p>
                          )}
                          {ele?.SampleCollectionTime && (
                            <p className="mb-0">
                              CollectedTime: {ele?.SampleCollectionTime}
                            </p>
                          )}
                        </td>

                        <td className="px-2">
                          {ele?.SampleReceivedBy && (
                            <p className="mb-0">
                              ReceivedBy: {ele?.SampleReceivedBy}
                            </p>
                          )}
                          {ele?.SampleReceiveDate && (
                            <p className="mb-0">
                              ReceivedDate: {ele?.SampleReceiveDate}
                            </p>
                          )}
                          {ele?.SampleReceiveTime && (
                            <p className="mb-0">
                              ReceivedTime: {ele?.SampleReceiveTime}
                            </p>
                          )}
                        </td>
                        <td className="px-2">
                          {ele?.ApprovedName && (
                            <p className="mb-0">
                              TestedBy : {ele?.ResultEnteredName}
                            </p>
                          )}

                          {(ele?.ResultEnteredDate || ele?.ResultEnteredTime) && (
                            <p className="mb-0">
                              TestedDate :{" "}
                              {ele?.ResultEnteredDate ? ele?.ResultEnteredDate : ""}
                            </p>
                          )}
                          {(ele?.ResultEnteredDate || ele?.ResultEnteredTime) && (
                            <p className="mb-0">
                              TestedTime :{" "}
                              {ele?.ResultEnteredTime ? ele?.ResultEnteredTime : ""}
                            </p>
                          )}
                        </td>
                        <td className="px-2">
                          {ele?.ApprovedName && (
                            <p className="mb-0">
                              ApprovedName: {ele?.ApprovedName}
                            </p>
                          )}

                          {/* {ele?.ApprovedDoneBy && (
                            <p className="mb-0">
                              ApprovedDoneBy: {ele?.ApprovedDoneBy}
                            </p>
                          )} */}

                          {ele?.ApprovedDate && (
                            <p className="mb-0">
                              ApprovedDate: {ele?.ApprovedDate}
                            </p>
                          )}

                          {ele?.ApprovedTime && (
                            <p className="mb-0">
                              ApprovedTime: {ele?.ApprovedTime}
                            </p>
                          )}
                        </td>
                        <td className="px-2">
                          {ele?.RejectUser && (
                            <p className="mb-0">RejectedBy: {ele?.RejectUser}</p>
                          )}
                          {ele?.RejectDate && (
                            <p className="mb-0">RejectDate: {ele?.RejectDate}</p>
                          )}
                          {ele?.RejectionReason && (
                            <p className="mb-0">
                              RejectionReason: {ele?.RejectionReason}
                            </p>
                          )}
                        </td>
                        <td>
                          <p className="mb-0">{ele?.TestCentreName}</p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Tables>
              </div>
            </div>
          )}
        </>
      </Dialog>

      <Dialog
        header={t("Rate Type Details")}
        visible={showRateModal}
        className={theme}
        style={{
          width: isMobile ? "50vw" : "60vw",
        }}
        dismissableMask
        closable
        closeOnEscape
        onHide={() => {
          setShowRateModal(false);
          setRateModalData(null);
        }}
      >
        {rateModalData && (
          <RateTypeModal
            data={rateModalData}
            onClose={() => setShowRateModal(false)}
          />
        )}
      </Dialog>

    </>
  );
};

export default PatientDetailModal;
