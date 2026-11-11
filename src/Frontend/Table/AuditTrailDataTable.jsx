import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { dateConfig } from "../../utils/helpers";
import Tables from "../../components/UI/customTable";
import Loading from "../../components/loader/Loading";
import RejectReasonModal from "../utils/RejectReasonModal";
import { axiosInstance } from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import HoldReasonModal from "../utils/HoldReasonModal";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import TrackerColorLegend from "../utils/TrackerColorLegend";
import { getTrackerStatusClass } from "../../utils/Constants";
function AuditTrailDataTable({ tableData, optionData, loading }) {
  // i18n start
  const { t } = useTranslation();
  const [showRejectReason, setShowRejectReason] = useState({
    modal: false,
    data: "",
    index: -1,
  });
  const {HideMacStatusFromDispatch, HideResultDoneStatusFromDispatch} = useLocalStorage('userData', 'get');
    

  const [showHoldReason, setShowHoldReason] = useState({
    modalHold: false,
    dataHold: "",
    index: -1,
  });

  const [tableDataReject, setTableDataReject] = useState([]);
  const [tableDataHold, setTableDataHold] = useState([]);

  const getStatusClass = (status) =>
    getTrackerStatusClass(
      status,
      HideMacStatusFromDispatch,
      HideResultDoneStatusFromDispatch,
    );

  const getRejectAndHoldReason = (data, index) => {
    axiosInstance
      .post("SC/GetRejectReason", { TestId: Number(data?.TestId) })
      .then((res) => {
        if (Number(data?.ColorStatus) === 4) {
          if (
            Array.isArray(res?.data?.message) &&
            res?.data?.message.length > 0
          ) {
            setTableDataReject(res?.data?.message);
            setShowRejectReason({
              modal: true,
              data: data,
              index: index,
            });
          } else {
            setTableDataReject([]);
            setShowRejectReason({
              modal: false,
              data: "",
              index: -1,
            });
            toast.error(
              res?.data?.message ? res?.data?.message : "No Data Available",
            );
          }
        } else if (Number(data?.ColorStatus) === 16 || Number(data?.ColorStatus) === 11) {
          if (Array.isArray(res?.data?.data) && res?.data?.data?.length > 0) {
            setTableDataHold(res?.data?.data);
            setShowHoldReason({
              modalHold: true,
              dataHold: data,
              index: index,
            });
          } else {
            setTableDataHold([]);
            setShowHoldReason({
              modalHold: false,
              dataHold: "",
              index: -1,
            });
            setTableDataReject([]);

            toast.error(
              res?.data?.data ? res?.data?.data : "No Data Available",
            );
          }
        }
      })
      .catch((err) => console.log(err));
  };

  return (
    <>
      {showRejectReason?.modal && (
        <RejectReasonModal
          show={showRejectReason?.modal}
          handleShow={() =>
            setShowRejectReason({ modal: false, data: "", index: -1 })
          }
          title={"RejectReason"}
          tableDataReject={tableDataReject}
        />
      )}
      {showHoldReason?.modalHold && (
        <HoldReasonModal
          show={showHoldReason?.modalHold}
          handleShow={() =>
            setShowHoldReason({ modalHold: false, dataHold: "", index: -1 })
          }
          title={"HoldReason"}
          tableDataReject={tableDataHold}
        />
      )}
      {loading ? (
        <Loading />
      ) : tableData.length > 0 ? (
        <div className="row px-2">
          <div className="col-12">
            <TrackerColorLegend />
            <Tables>
              <thead style={{ width: "auto" }}>
                <tr>
                  <th>{t("S.No")}</th>
                  <th>{t("Date")}</th>
                  <th>{t("Entry By")}</th>
                  {/* <th>{t("Receive By")}</th> */}
                  <th>{t("Status")}</th>
                  <th>{t("Centre")}</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((data, index) => {
                  const statusClass = getStatusClass(data?.ColorStatus);
                  return (
                  <tr key={index} className={statusClass}>
                    <td data-title={t("S.No")} className={statusClass}>
                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          margin: "0",
                        }}
                      >
                        {index + 1}&nbsp;
                        <div key={index}>
                          {(Number(data?.ColorStatus) === 4 ||
                            Number(data?.ColorStatus) === 16 ||
                            Number(data?.ColorStatus) === 11) && (
                            <i
                              className="fa fa-search mt-1"
                              onClick={() => {
                                getRejectAndHoldReason(data, index);
                              }}
                            ></i>
                          )}
                        </div>
                      </div>
                    </td>
                    <td data-title={t("Date")} className={statusClass}>
                      {data.dtEntry?.split(" ")[0]}
                      <br />
                      {data.dtEntry?.split(" ").slice(1).join(" ")}
                    </td>
                    <td data-title={t("Entry By")} className={statusClass}>
                      {data?.CreatedByName}&nbsp;
                    </td>
                    <td
                      data-title={t("Status")}
                      className={statusClass}
                      style={{
                        wordWrap: "break-word",
                        whiteSpace: "normal",
                        width: "30%"
                      }}
                    >
                      {data?.ItemName}&nbsp;
                    </td>
                    <td data-title={t("Center")} className={statusClass}>{data?.Centre}&nbsp;</td>
                  </tr>
                  );
                })}
              </tbody>
            </Tables>
          </div>
        </div>
      ) : (
        <NoRecordFound />
      )}
    </>
  );
}

export default AuditTrailDataTable;
