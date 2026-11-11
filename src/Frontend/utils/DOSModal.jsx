import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Dialog } from "primereact/dialog";
import Tables from "../../components/UI/customTable";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import Loading from "../../components/loader/Loading";
import { axiosInstance } from "../../utils/axiosInstance";

function DOSModal({ show, onHandleShow, id, LTData }) {
  const [tableData, setTableData] = useState([]);
  const { t } = useTranslation();
  const theme = useLocalStorage("theme", "get");
  const isMobile = window.innerWidth <= 768;

  const fetch = () => {
    axiosInstance
      .post("Booking/GetDosDetails", {
        InvestigationId: id,
        CentreID: LTData?.CentreID,
      })
      .then((res) => {
        setTableData(res?.data?.message);
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    fetch();
  }, [id]);

  return tableData?.length > 0 ? (
    <>
      <Dialog
        header={t("DOS Information")}
        onHide={onHandleShow}
        style={{ width: isMobile ? "80vw" : "95vw" }}
        className={theme}
        visible={show}
      >
        <div style={{ overflowX: "auto" }}>
          <Tables>
            <thead>
              <tr>
                <th>{t("S.no")}</th>
                <th>{t("Location Name")}</th>
                <th>{t("TestCode")}</th>
                <th>{t("Department Name")}</th>
                <th>{t("Investigation Name")}</th>
                <th>{t("Required Attachment")}</th>
                <th>{t("Fasting Required")}</th>
                <th>{t("Sample Type")}</th>
                <th>{t("SampleQty")}</th>
                <th>{t("SampleRemarks")}</th>
                <th>{t("Machine Name")}</th>
                <th>{t("Method")}</th>
                <th>{t("In Out House")}</th>
                <th>{t("Delivery")}</th>
                <th>{t("Process Lab")}</th>
                <th>{t("DayType")}</th>
                <th>{t("Technician Procesing")}</th>
                <th>{t("Booking cutoff")}</th>
                <th>{t("SRA cutoff")}</th>
                <th>{t("Reporting cutoff")}</th>
              </tr>
            </thead>
            <tbody>
              {tableData?.map((data, index) => (
                <tr key={index}>
                  <td data-title={t("S.no")}>{index + 1}</td>
                  <td data-title={t("Location Name")}>
                    {data?.LocationName}&nbsp;
                  </td>
                  <td data-title={t("TestCode")}>{data?.TestCode}&nbsp;</td>
                  <td data-title={t("Department Name")}>
                    {data?.Department}&nbsp;
                  </td>
                  <td data-title={t("Investigation Name")}>
                    {data?.Testname}&nbsp;
                  </td>
                  <td data-title={t("Required Attachment")}>
                    {(() => {
                      let attachments = data?.RequiredAttachment;
                      if (!attachments) return null;
                      try {
                        const parsed = JSON.parse(attachments);
                        if (Array.isArray(parsed)) {
                          return parsed.map((item, id) => (
                            <div key={id}>{item}</div>
                          ));
                        }
                      } catch (e) {
                        // Keep original string if parsing fails
                      }
                      return attachments;
                    })()}
                    &nbsp;
                  </td>
                  <td data-title={t("Fasting Required")}>{data?.IsFasting==1 ? "Yes":"No"}&nbsp;</td>
                  <td data-title={t("Sample Type")}>{data?.SampleType}&nbsp;</td>
                  <td data-title={t("SampleQty")}>{data?.SampleQty}&nbsp;</td>
                  <td data-title={t("SampleRemarks")}>{data?.SampleRemarks}&nbsp;</td>
                  <td data-title={t("Machine Name")}>{data?.Machine}&nbsp;</td>
                  <td data-title={t("Method")}>{data?.Method}&nbsp;</td>
                  <td data-title={t("In_Out_House")}>
                    {data?.In_Out_House}&nbsp;
                  </td>
                  <td data-title={t("Delievery")}>
                    {data?.DeleveryDate}&nbsp;
                  </td>
                  <td data-title={t("Process Lab")}>
                    {data?.ProcessLab}&nbsp;
                  </td>
                  <td data-title={t("DayType")}>{data?.DayType}&nbsp;</td>
                  <td data-title={t("Technician Procesing")}>
                    {data?.TechnicianProcesing}&nbsp;
                  </td>

                  <td data-title={t("Booking cutoff")}>
                    {data?.Bookingcutoff}&nbsp;
                  </td>
                  <td data-title={t("SRA cutoff")}>{data?.SRAcutoff}&nbsp;</td>
                  <td data-title={t("Reporting cutoff")}>
                    {data?.Reportingcutoff}&nbsp;
                  </td>
                </tr>
              ))}
            </tbody>
          </Tables>
        </div>
        <div className="row mt-2">
          <div className="col-sm-1">
            <button
              type="button"
              className="btn btn-block btn-danger btn-sm"
              onClick={onHandleShow}
            >
              {t("Close")}
            </button>
          </div>
        </div>
      </Dialog>
    </>
  ) : (
    <Loading />
  );
}

export default DOSModal;
