import React from "react";
import Tables from "../../../components/UI/customTable";
import NoRecordFound from "../../../components/formComponent/NoRecordFound";
import { useTranslation } from "react-i18next";

const DoctorAssignSummaryTable = ({ tableData = [] }) => {
  const { t } = useTranslation();
  return (
    <>
      <div className="col-12">
        <Tables>
          <thead>
            <tr>
              <th>{t("Sr.No.")}</th>
              <th>{t("Department")}</th>
              <th>{t("Total")}</th>
              <th>{t("Pending")}</th>
              <th>{t("Assigned")}</th>
            </tr>
          </thead>
          {tableData.length > 0 ? (
            tableData.map((ele, index) => (
              <tbody key={index}>
                <tr>
                  <td data-title={t("S.No")}>{index + 1}&nbsp;</td>
                  <td data-title={t("Department")}>{ele?.Department}</td>
                  <td data-title={t("Total")}>{ele?.TotalTest}</td>
                  <td data-title={t("Pending")}>{ele?.PendingCase}</td>
                  <td data-title={t("Assigned")}>{ele?.AssingedCase}</td>
                </tr>
              </tbody>
            ))
          ) : (
            <tbody>
              <tr>
                <td colSpan={13} className="text-center">
                  <NoRecordFound />
                </td>
              </tr>
            </tbody>
          )}
        </Tables>
      </div>
    </>
  );
};

export default DoctorAssignSummaryTable;
