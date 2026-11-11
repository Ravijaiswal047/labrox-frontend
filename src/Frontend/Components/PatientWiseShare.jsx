import React from "react";
import Tables from "../../components/UI/customTable";
import { useTranslation } from "react-i18next";

const PatientWiseShare = ({ patientList, handleClickItemwises }) => {
  const { t } = useTranslation();
  console.log(patientList);
  return (
    <>
      <div className="row">
        <div className="col-sm-12">
          <Tables>
            <thead className="cf">
              <tr>
                <th style={{ width: "3%", textAlign: "center" }}>
                  {t("S.No.")}
                </th>
                <th style={{ width: "8%", textAlign: "center" }}>
                  {t("LabNo.")}
                </th>
                <th style={{ width: "10%", textAlign: "center" }}>
                  {t("VisitDate")}
                </th>
                <th style={{ width: "20%" }}>{t("Patient")}</th>
                <th style={{ width: "10%", textAlign: "right" }}>
                  {t("GrossAmount")}
                </th>
                <th style={{ width: "10%", textAlign: "right" }}>
                  {t("Discount")}
                </th>
                <th style={{ width: "10%", textAlign: "right" }}>
                  {t("NetAmount")}
                </th>
                <th style={{ width: "10%", textAlign: "right" }}>
                  {t("PaidAmount")}
                </th>
                <th style={{ width: "10%", textAlign: "right" }}>
                  {t("Balance")}
                </th>
                <th style={{ width: "5%", textAlign: "center" }}>
                  {t("Show")}
                </th>
              </tr>
            </thead>
            <tbody>
              {patientList.map((item, index) => (
                <tr key={index}>
                  <td
                    data-title={t("S.No.")}
                    style={{ width: "3%", textAlign: "center" }}
                  >
                    {index + 1}
                  </td>
                  <td
                    data-title={t("LabNo.")}
                    style={{ width: "8%", textAlign: "center" }}
                  >
                    {item.LedgerTransactionNo}
                  </td>
                  <td
                    data-title={t("VisitDate")}
                    style={{ width: "10%", textAlign: "center" }}
                  >
                    {item.VisitDate}
                  </td>
                  <td data-title={t("Patient")}>{item.pname}</td>
                  <td
                    data-title={t("GrossAmount")}
                    style={{ width: "10%", textAlign: "right" }}
                  >
                    {item.GrossAmount}
                  </td>
                  <td
                    data-title={t("Discount")}
                    style={{ width: "10%", textAlign: "right" }}
                  >
                    {item.Discount}
                  </td>
                  <td
                    data-title={t("NetAmount")}
                    style={{ width: "10%", textAlign: "right" }}
                  >
                    {item.NetAmount}
                  </td>
                  <td
                    data-title={t("PaidAmount")}
                    style={{ width: "10%", textAlign: "right" }}
                  >
                    {item.Paid}
                  </td>
                  <td
                    data-title={t("Balance")}
                    style={{ width: "10%", textAlign: "right" }}
                  >
                    {item.Balance}
                  </td>
                  <td
                    data-title={t("Show")}
                    onClick={() => handleClickItemwises(item)}
                    style={{ width: "5%", textAlign: "center" }}
                  >
                    <i className="fa fa-search" />
                  </td>
                </tr>
              ))}
              {patientList.length === 0 && (
                <tr>
                  <td colSpan="10" className="text-center">
                    {t("No data found.")}
                  </td>
                </tr>
              )}
            </tbody>
          </Tables>
        </div>
      </div>
    </>
  );
};

export default PatientWiseShare;
