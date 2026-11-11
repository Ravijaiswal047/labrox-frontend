import { Dialog } from "primereact/dialog";
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocalStorage } from "../../../utils/hooks/useLocalStorage";
import { setLogToggleModal } from "../../../store/reducers/CombinedRateTypeSlice/CombinedRateTypeSlice";
import Tables from "../../../components/UI/customTable";

const CombindRateTypeLogsModal = ({ title = "" }) => {
  const dispatch = useDispatch();
  const theme = useLocalStorage("theme", "get");
  const isMobile = window.innerWidth > 768;
  const { logsData, logsToggleModal } = useSelector(
    (state) => state.CombinedRateTypeSlice
  );

  const handleToggle = () => {
    dispatch(setLogToggleModal(false));
  };

  const LogsDataxx = [
    {
      SrNo: 1,
      InvestigationName: "CBC",
      field: "Rate",
      oldValue: "250",
      newValue: "300",
      time: "2025-12-06 10:15 AM",
    },
    {
      SrNo: 2,
      InvestigationName: "LFT",
      field: "Status",
      oldValue: "Inactive",
      newValue: "Active",
      time: "2025-12-06 10:28 AM",
    },
    {
      SrNo: 3,
      InvestigationName: "KFT",
      field: "Centre",
      oldValue: "Main Lab",
      newValue: "City Lab",
      time: "2025-12-06 10:34 AM",
    },
    {
      SrNo: 4,
      InvestigationName: "RFT",
      field: "Turn Around Time",
      oldValue: "24 hr",
      newValue: "12 hr",
      time: "2025-12-06 11:00 AM",
    },
    {
      SrNo: 5,
      InvestigationName: "Thyroid",
      field: "Test Included",
      oldValue: "TSH only",
      newValue: "TSH + T3 + T4",
      time: "2025-12-06 11:12 AM",
    },
  ];

  return (
    <Dialog
      header={title}
      visible={logsToggleModal}
      style={{ width: isMobile ? "60vw" : "90vw" }}
      onHide={handleToggle}
      className={theme}
    >
      <div className="table-responsive pb-2 px-0">
        <Tables className="table table-bordered">
          <thead>
            <tr>
              <th>Sr.No</th>
              <th>Investigation</th>
              <th>Field</th>
              <th>Old Value</th>
              <th>New Value</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {LogsDataxx.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center">
                  No logs found
                </td>
              </tr>
            ) : (
              LogsDataxx.map((log, i) => (
                <tr key={i}>
                  <td>{log.SrNo}</td>
                  <td>{log.InvestigationName}</td>
                  <td>{log.field}</td>
                  <td>{log.oldValue}</td>
                  <td>{log.newValue}</td>
                  <td>{log.time}</td>
                </tr>
              ))
            )}
          </tbody>
        </Tables>
      </div>
    </Dialog>
  );
};

export default CombindRateTypeLogsModal;
