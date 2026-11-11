import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Dialog } from "primereact/dialog";
import Tables from "../../components/UI/customTable";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import Loading from "../../components/loader/Loading";
import { axiosInstance } from "../../utils/axiosInstance";

function TestNameModal({ show, onHandleShow, id, LTData, dataType }) {
  const [tableData, setTableData] = useState([]);
  const [invDetails, setInvDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  const isMobile = window.innerWidth <= 768;
  const { t } = useTranslation();
  const theme = useLocalStorage("theme", "get");

  const fetch = () => {
    setLoading(true);

    if (dataType === "Package") {
      axiosInstance
        .get(`Investigations/EditInvestigation?id=${id}&DataType=Package`)
        .then((res) => {
          if (res?.data?.success) {
            setTableData(res?.data?.observationData || []);
            setInvDetails(res?.data?.invDetails || null);
          } else {
            setTableData([]);
            setInvDetails(null);
          }
        })
        .catch((err) => {
          console.log(err);
          setTableData([]);
          setInvDetails(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      axiosInstance
        .post("PatientRegistration/GetTestInfo", {
          InvestigationId: id,
        })
        .then((res) => {
          if (res?.data?.success) {
            setTableData(res?.data?.message || []);
          } else {
            setTableData([]);
          }
          setInvDetails(null);
        })
        .catch((err) => {
          console.log(err);
          setTableData([]);
          setInvDetails(null);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  useEffect(() => {
    if (show && id) {
      fetch();
    }
  }, [id, dataType, show]);

  return (
    <Dialog
      header={`${t("Investigation Information")}${invDetails?.TestName ? ` - ${invDetails?.TestName}` : ""
        }`}
      style={{ width: isMobile ? "80vw" : "50vw" }}
      className={theme}
      visible={show}
      top={"10%"}
      onHide={onHandleShow}
    >
      {loading ? (
        <Loading />
      ) : tableData?.length > 0 ? (
        <>
          <Tables>
            <thead className="cf">
              <tr>
                <th>{t("Department")}</th>
                <th>{t("Test/Profile")}</th>
                <th>{t("Test Name")}</th>
                <th>{t("Sample Type")}</th>
                <th>{t("Sample Quanity")}</th>
                <th>{t("Sample Remark")}</th>
              </tr>
            </thead>
            <tbody>
              {tableData?.map((data, index) => (
                <tr key={index}>
                  {index === 0 && (
                    <td
                      data-title={t("Department")}
                      rowSpan={tableData.length}
                    >
                      {data?.Department ||
                        invDetails?.DepartmentName ||
                        ""}
                      &nbsp;
                    </td>
                  )}

                  <td data-title={t("Test/Profile")}>
                    {data?.DataType || data?.TestCode || "Test"}&nbsp;
                  </td>

                  <td data-title={t("Test Name")}>
                    {data?.TestName}&nbsp;
                  </td>

                  <td data-title={t("Sample Type")}>
                    {data?.SampleType ||
                      data?.SampleTypeName ||
                      ""}
                    &nbsp;
                  </td>

                  <td data-title={t("Sample Quanity")}>
                    {data?.SampleQty || ""}&nbsp;
                  </td>

                  <td data-title={t("Sample Remark")}>
                    {data?.SampleRemarks || ""}&nbsp;
                  </td>
                </tr>
              ))}
            </tbody>
          </Tables>

          <div className="row mt-2">
            <div className="col-sm-3">
              <button
                type="button"
                className="btn btn-block btn-danger btn-sm"
                onClick={onHandleShow}
              >
                {t("Close")}
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="text-center p-3">
            <h6>{t("No Data Found")}</h6>
          </div>
        </>
      )}
    </Dialog>
  );
}

export default TestNameModal;