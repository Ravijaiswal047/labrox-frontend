import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { dateConfig } from "../../utils/helpers";
import { Dialog } from "primereact/dialog";
import Tables from "../../components/UI/customTable";
import { Record } from "../../utils/Constants";
import Pagination from "../../Pagination/Pagination";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { SelectBox } from "../../components/formComponent/SelectBox";

const AdvanceMobileDataModal = ({
  show,
  mobleData,
  handleSelctDataAdvance,
  handleClose4,
  handleCreateNewPatient,
  state
}) => {
  const [PageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const currentTableData = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * PageSize;
    const lastPageIndex = firstPageIndex + PageSize;
    return mobleData.slice(firstPageIndex, lastPageIndex);
  }, [currentPage, mobleData, PageSize]);

  const isMobile = window.innerWidth <= 768;
  const { t } = useTranslation();
  const theme = useLocalStorage("theme", "get");
  return (
    <Dialog
      style={{
        width: isMobile ? "80vw" : "60vw",
      }}
      visible={show}
      onHide={handleClose4}
      width="50vw"
      header={t("Registered Patient Detailss")}
      className={theme}
    >
      <Tables>
        <thead className="cf">
          <tr>
            <th>{t("Select")}</th>
            <th>{t("UHID")}</th>
            <th>{t("Patient Name")}</th>
            <th>{t("Age")}</th>
            <th>{t("DOB")}</th>
            <th>{t("Gender")}</th>
            <th>{t("Mobile")}</th>
            <th>{t("City")}</th>
            <th>{t("State")}</th>
          </tr>
        </thead>
        <tbody>
          {currentTableData.map((data, index) => (
            <tr key={index}>
              <td data-title={t("Select")}>
                <button
                  className="btn btn-info  btn-sm d-flex"
                  onClick={() => handleSelctDataAdvance(data)}
                >
                  {t("Select")}&nbsp;
                </button>
              </td>
              <td data-title={t("UHID")}>{data?.PatientCode}&nbsp;</td>
              <td data-title={t("Patient Name")}>
                {data?.Title +
                  " " +
                  data?.FirstName +
                  " " +
                  data?.MiddleName +
                  " " +
                  data?.LastName}
                &nbsp;
              </td>
              <td data-title={t("Age")}>{data?.Age}&nbsp;</td>
              <td data-title={t("DOB")}>{dateConfig(data?.DOB)}&nbsp;</td>
              <td data-title={t("Gender")}>{data?.Gender}&nbsp;</td>
              <td data-title={t("Mobile")}>{data?.Mobile}&nbsp;</td>
              <td data-title={t("City")}>{data?.City}&nbsp;</td>
              <td data-title={t("State")}>{data?.State}&nbsp;</td>
            </tr>
          ))}
        </tbody>
      </Tables>
      {currentTableData?.length > 0 && (
        <div className="d-flex justify-content-end">
          <label className="mt-4 mx-2">{t("No Of Record/Page")}</label>
          <SelectBox
            className="mt-3 p-1 RecordSize mr-2"
            options={Record}
            selectedValue={PageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
          />{" "}
          <Pagination
            className="pagination-bar mb-2"
            currentPage={currentPage}
            totalCount={mobleData?.length}
            pageSize={PageSize}
            onPageChange={(page) => setCurrentPage(page)}
          />{" "}
        </div>
      )}
    </Dialog>
  );
};

export default AdvanceMobileDataModal;
