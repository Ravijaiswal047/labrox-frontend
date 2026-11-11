import React from "react";
import { useTranslation } from "react-i18next";
import { useLocalStorage } from "../../../utils/hooks/useLocalStorage";
import { Dialog } from "primereact/dialog";

const FunnelDetailsModal = ({
  show,
  onHide,
  data = [],
  Dcrdata = [],
  Dcr = false,
}) => {
  const { t } = useTranslation();
  const isMobile = window.innerWidth <= 768;
  const theme = useLocalStorage("theme", "get");

  const renderData = Dcr ? Dcrdata : data;


  const handleModalClose = () => {
    onHide(false);
  };

  return (
    <Dialog
      header={t("Funnel Details")}
      visible={show}
      onHide={handleModalClose}
      className={theme}
      style={{ width: isMobile ? "95vw" : "70vw" }}
      modal
    >
      {renderData?.map((item, index) => (
        <React.Fragment key={index}>
          {/* ================= Basic Demographic Details ================= */}
          <h6 className="text-primary fw-bold mb-3">
            {t("Basic Demographic Details")}
          </h6>

          <div className="row mb-4">
            <div className="col-md-4">
              <p>
                <b>{t("Tagged With")}:</b> {item?.Type1}
              </p>
              <p>
                <b>{t("Prospect Type")}:</b> {item?.ProspectTypeName}
              </p>
              <p>
                <b>{t("Contact Person Name")}:</b> {item?.ContactPersonName}
              </p>
              <p>
                <b>{t("Email Id")}:</b> {item?.EmailId}
              </p>
              <p>
                <b>{t("Locality")}:</b> {item?.Locality}
              </p>
              <p>
                <b>{t("Country")}:</b> {item?.CountryName}
              </p>
            </div>

            <div className="col-md-4">
              <p>
                <b>{t("Business Profession")}:</b>{" "}
                {item?.BusinessProfessionName}
              </p>
              <p>
                <b>{t("Name of Organization")}:</b> {item?.OrganizationName}
              </p>
              <p>
                <b>{t("Designation")}:</b> {item?.Designation}
              </p>
              <p>
                <b>{t("Website")}:</b> {item?.Website}
              </p>
              <p>
                <b>{t("State")}:</b> {item?.StateName}
              </p>
            </div>

            <div className="col-md-4">
              <p>
                <b>{t("Business Ownership")}:</b> {item?.BusinessOwnershipName}
              </p>
              <p>
                <b>{t("Landline No.")}:</b> {item?.LandlineNo}
              </p>
              <p>
                <b>{t("Mobile Number")}:</b> {item?.MobileNumber}
              </p>
              <p>
                <b>{t("Address")}:</b> {item?.Address}
              </p>
              <p>
                <b>{t("City")}:</b> {item?.Cityname}
              </p>
            </div>
          </div>

          {/* ================= Business Details ================= */}
          <h6 className="text-primary fw-bold mb-3">{t("Business Details")}</h6>

          <div className="row mb-4">
            <div className="col-md-4">
              <p>
                <b>{t("Doctor Name")}:</b> {item?.OPD_DoctorName}
              </p>
              <p>
                <b>{t("OPD Days")}:</b> {item?.OPD_OPDDays}
              </p>
              <p>
                <b>{t("End Time")}:</b> {item?.OPD_EndTime}
              </p>
              <p>
                <b>{t("Meeting Start Time")}:</b> {item?.MeetingStartTime}
              </p>
            </div>

            <div className="col-md-4">
              <p>
                <b>{t("Specialization")}:</b> {item?.OPD_Specialization}
              </p>
              <p>
                <b>{t("Shift")}:</b> {item?.OPD_Shift}
              </p>
              <p>
                <b>{t("Avg Patient")}:</b> {item?.OPD_AvgPatient}
              </p>
              <p>
                <b>{t("Meeting End Time")}:</b> {item?.MeetingEndTime}
              </p>
            </div>

            <div className="col-md-4">
              <p>
                <b>{t("Clinic Name")}:</b> {item?.OPD_ClinicName}
              </p>
              <p>
                <b>{t("Start Time")}:</b> {item?.OPD_StartTime}
              </p>
              <p>
                <b>{t("Fees")}:</b> {item?.OPD_Fees}
              </p>
              <p>
                <b>{t("Meeting Days")}:</b> {item?.MeetingDays}
              </p>
            </div>
          </div>

          {/* ================= Sales Executive Observation ================= */}
          <h6 className="text-primary fw-bold mb-3">
            {t("Sales Executive Observation")}
          </h6>

          <div className="row">
            <div className="col-md-4">
              <p>
                <b>{t("Pro. type of ass. with AHLL")}:</b>{" "}
                {item?.ProposedAssociationName}
              </p>
              <p>
                <b>{t("Expected Business Forecast")}:</b>{" "}
                {item?.ExpectedBusinessForecast}
              </p>
            </div>

            <div className="col-md-4">
              <p>
                <b>{t("Expected Interest Level")}:</b> {item?.InterestLevelName}
              </p>
              <p>
                <b>{t("Expected category")}:</b> {item?.ExpectedCategoryName}
              </p>
            </div>

            <div className="col-md-4">
              <p>
                <b>{t("No of expected calls/Mon")}:</b>{" "}
                {item?.NoOfExpectedCalls}
              </p>
            </div>
          </div>
        </React.Fragment>
      ))}
    </Dialog>
  );
};

export default FunnelDetailsModal;
