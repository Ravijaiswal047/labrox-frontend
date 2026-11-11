import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Tooltip } from "primereact/tooltip";
import moment from "moment";
import { Dialog } from "primereact/dialog";
import Tables from "../../components/UI/customTable";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { CancelButton, CustomButton, SaveButton } from "../../components/UI/CustomButton";
const RegisteredPatientDetailModal = ({
  setShow,
  mobileData,
  detailShow,
  handleCloseDetailShow,
  handleSelectData,
}) => {
  const isMobile = window.innerWidth <= 768;
  const { t } = useTranslation();
  const theme = useLocalStorage("theme", "get");
  
  return (
    <>
      {/* <Dialog
        style={{
          width: isMobile ? "80vw" : "80vw",
        }}
        visible={detailShow}
        header={t("Old Patient")}
        className={theme}
        onHide={handleCloseDetailShow}
      > */}
      <div className="mt-2">
        
        <Tables>
          <thead className="cf text-center">
            <tr>
              <th className="text-center">{t("Select")}</th>
              <th className="text-center">{t("Patient UHID")}</th>
              {/* <th className="text-center">{t("UHID")}</th> */}
              <th className="text-center">{t("Patient Name")}</th>
              <th className="text-center">{t("DOB")}</th>
              <th className="text-center">{t("Age")}</th>
              <th className="text-center">{t("Gender")}</th>
              <th className="text-center">{t("Mobile")}</th>
              <th className="text-center">{t("Area")}</th>
              <th className="text-center">{t("City")}</th>
              <th className="text-center">{t("State")}</th>
              <th className="text-center">{t("Pincode")}</th>
              <th className="text-center">{t("Reg. Date")}</th>
              <th className="text-center">{t("Last HC")}</th>
            </tr>
          </thead>
          <tbody>
            {mobileData?.map((ele, index) => (
              <>
                <tr key={index}>
                  <td data-title="Select" className="text-center">
                    {/* <button
                      type="button"
                      className="btn btn-info btn-sm"
                      onClick={() => {
                        handleSelectData(ele);
                      }}
                    >
                      {t("HomeCollection")}
                    </button> */}
                    <Tooltip target={`#homeCollection`} position="top" content={t("HomeCollection")} />
                    <CustomButton
                      id={"homeCollection"}
                      onClick={() => {
                        handleSelectData(ele);
                      }}
                      icon={"home"}
                    />
                  </td>
                  <td data-title="PatientCode" className="text-center">
                    {ele.PatientCode}&nbsp;
                  </td>
                  {/* <td data-title="UHID" className="text-center">
                    {ele.Patientid}&nbsp;
                  </td> */}
                  <td data-title="Patient Name" className="text-center">
                    {ele.NAME}&nbsp;
                  </td>
                  <td data-title="DOB" className="text-center">
                    {moment(ele.DOB).format("DD-MMM-YYYY")}&nbsp;
                  </td>
                  <td data-title="Age" className="text-center">
                    {ele.Age}&nbsp;
                  </td>
                  <td data-title="Gender" className="text-center">
                    {ele.Gender}&nbsp;
                  </td>
                  <td data-title="Mobile" className="text-center">
                    {ele.Mobile}&nbsp;
                  </td>

                  <td data-title="Area" className="text-center">
                    {ele.LocalityName}&nbsp;
                  </td>
                  <td data-title="City" className="text-center">
                    {ele.City}&nbsp;
                  </td>
                  <td data-title="State" className="text-center">
                    {ele.StateName}&nbsp;
                  </td>
                  <td data-title="PinCode" className="text-center">
                    {ele.Pincode}&nbsp;
                  </td>
                  <td data-title="Reg. Code" className="text-center">
                    {ele.visitdate}&nbsp;
                  </td>
                  <td data-title="Last HC" className="text-center">
                    {ele.lasthcstatus}&nbsp;
                  </td>
                </tr>
              </>
            ))}
          </tbody>
        </Tables>
            </div>
        <div
          className="row mt-1 mb-1 px-2"
          style={{ display: "flex", justifyContent: "center" }}
        >
          <div className="col-md-auto">
            {/* <button
              type="button"
              className="btn btn-primary btn-block btn-sm"
              onClick={() => {
                setShow(true);
                handleCloseDetailShow();
              }}
            >
              {t("Register New Patient With Same Mobile")}
            </button> */}
            <SaveButton
              id="homeCollection"
              text={t("Register New Patient With Same Mobile")}
              onClick={() => {
                setShow(true);
                handleCloseDetailShow();
              }}
            />
          </div>
          <div className="col-md-1">
            {/* <button
              type="button"
              className="btn btn-primary btn-block btn-sm"
              onClick={() => {
                handleCloseDetailShow();
              }}
            >
              {t("Close")}
            </button> */}
            <CancelButton
              text={t("Close")}
              onClick={() => {
                handleCloseDetailShow();
              }}
            />
          </div>
        </div>
      {/* </Dialog> */}
    </>
  );
};

export default RegisteredPatientDetailModal;
