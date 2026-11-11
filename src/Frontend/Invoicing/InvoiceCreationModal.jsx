import React, { useEffect, useState } from "react";

import { toast } from "react-toastify";
import { axiosInstance } from "../../utils/axiosInstance";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import { Dialog } from "primereact/dialog";
import Tables from "../../components/UI/customTable";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";

import Loading from "../../components/loader/Loading";
import { useTranslation } from "react-i18next";
import { CancelButton } from "../../components/UI/CustomButton";

function InvoiceCreationModal({ show, data, onClose }) {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();
  const theme = useLocalStorage("theme", "get");

  console.log("datadatadata::", data);

  const fetch = () => {
    setLoading(true);
    axiosInstance
      .post("Accounts/InvoiceDetails", data)
      .then((res) => {
        if (res?.data?.success) setTableData(res?.data?.message);
        else toast.error(res?.data?.message);
        setLoading(false);
      })
      .catch((err) => {
        toast.error(
          err?.data?.message ? err?.data?.message : "Something Went Wrong",
        );
        setLoading(false);
      });
  };
  const isMobile = window.innerWidth <= 768;
  useEffect(() => {
    fetch();
  }, []);

  return (
    <Dialog
      onHide={onClose}
      size="lg"
      visible={show}
      className={theme}
      style={{
        width: isMobile ? "80vw" : "80vw",
      }}
    >
      <div className="row px-2">
        {loading ? (
          <Loading />
        ) : tableData?.length > 0 ? (
          <>
            <Tables>
              <thead className="cf">
                <tr>
                  <th>{t("S.no")}</th>
                  {tableData.length > 0 &&
                    Object?.keys(tableData[0]).map((ele, index) => (
                      <th key={index}>{t(ele)}</th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {tableData?.map((ele, index) => (
                  <tr key={index}>
                    <td data-title={"S.No"}>{index + 1} &nbsp;</td>
                    {tableData.length > 0 &&
                      Object?.keys(ele).map((innerData, indexNew) => (
                        <td data-title={innerData} key={indexNew}>
                          {ele[innerData]} &nbsp;
                        </td>
                      ))}
                  </tr>
                ))}
              </tbody>
            </Tables>
          </>
        ) : (
          <NoRecordFound />
        )}
      </div>

      <div className="row mt-2 mb-1">
        <div className="col-sm-2">
          <CancelButton
            text={"Close"}
            onClick={onClose}
          />
        </div>
      </div>
    </Dialog>
  );
}

export default InvoiceCreationModal;
