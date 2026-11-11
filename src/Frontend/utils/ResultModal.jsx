import React, { useState } from "react";
import Loading from "../../components/loader/Loading";
import { Dialog } from "primereact/dialog";
import Tables from "../../components/UI/customTable";
import { useTranslation } from "react-i18next";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";

function ResultModal({ show, setshow, observationData }) {
  const isMobile = window.innerWidth <= 768;
  const theme = useLocalStorage("theme", "get");
  const { t } = useTranslation();

  return (
    <>
      {observationData?.length > 0 && (
        <Dialog
          header={t("Investigation Information")}
          style={{ width: isMobile ? "80vw" : "30vw" }}
          className={theme}
          visible={show}
          top={"10%"}
          onHide={() => setshow(false)}
        >
          <Tables>
            <thead className="cf">
              <tr>
                <th>{t("LabObservationName")}</th>
                <th className="text-center">{t("Value")}</th>
                {/* <th>{t("testid")}</th>
              <th>{t("Priorty")}</th> */}
              </tr>
            </thead>
            <tbody>
              {observationData?.map((data, index) => (
                <tr key={index}>
                  <td data-title={t("LabObservationName")}>
                    {data?.LabObservationName}
                  </td>
                  <td className="text-center" data-title={t("Value")}>
                    {data?.Value}&nbsp;
                  </td>
                  {/* <td data-title={t("testid")}>{data?.testid || t("N/A")}</td>
                <td data-title={t("Priorty")}>{data?.Priorty || t("N/A")}</td> */}
                </tr>
              ))}
            </tbody>
          </Tables>

          <div className="row mt-2">
            <div className="col-sm-3">
              <button
                type="button"
                className="btn btn-block btn-danger btn-sm"
                onClick={() => setshow(false)}
              >
                {t("Close")}
              </button>
            </div>
          </div>
        </Dialog>
      )}
    </>
  );
}

export default ResultModal;
