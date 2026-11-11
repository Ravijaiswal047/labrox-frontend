import { useState } from "react";
import "./LogisticPanelDataSearch.css";
import Accordion from "@app/components/UI/Accordion";
import Loading from "../../components/loader/Loading";
import { useTranslation } from "react-i18next";
import { axiosInstance } from "../../utils/axiosInstance";
import DatePicker from "../../components/formComponent/DatePicker";
import Tables from "../../components/UI/customTable";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import { ExportToExcel, SRAFormatDate } from "../../utils/helpers";
import { toast } from "react-toastify";
import { CustomButton, SearchButton } from "../../components/UI/CustomButton";
import excelIcon from "../../assets/image/excelIcon.png";

const LogisticPanelDataSearch = () => {
  const [t] = useTranslation();
  const [loading, setLoading] = useState(false);
  const [logisticData, setLogisticData] = useState([]);

  const [payload, setPayload] = useState({
    fromDate: SRAFormatDate(new Date()),
    FromTime: "00:00",
    ToTime: "23:59",
    toDate: SRAFormatDate(new Date()),

  });

  const handleDateSelect = (...args) => {
    const date = args[0];
    const fieldName = args[1];
    const formattedDate = date ? SRAFormatDate(new Date(date)) : "";
    setPayload((prev) => ({ ...prev, [fieldName]: formattedDate }));
  };


  const handleSearch = async () => {
    // Validation
    if (!payload.fromDate || !payload.toDate) {
      toast.error("Please select both From Date and To Date");
      return;
    }

    if (payload.FromTime && !payload.ToTime) {
      toast.error("Please select To Time if From Time is selected");
      return;
    }

    if (!payload.FromTime && payload.ToTime) {
      toast.error("Please select From Time if To Time is selected");
      return;
    }

    const searchPayload = {
      fromDate: payload.fromDate,
      fromTime: payload?.FromTime,
      toDate: payload.toDate,
      toTime: payload?.ToTime,
      isold: 0
    };

    console.log("Search Payload:", searchPayload);

    try {
      setLoading(true);
      const response = await axiosInstance.post("LogisticWeb/LogisticPannelDataSeacrh", searchPayload);

      if (response.data?.success) {
        const data = response.data?.data || [];
        setLogisticData(data);
        if (data.length === 0) {
          toast.info("No records found for the selected criteria");
        } else {
          toast.success(`Found ${data.length} records`);
        }
      } else {
        toast.error(response.data?.message || "Search failed");
        setLogisticData([]);
      }
    } catch (error) {
      toast.error("API Error: " + (error.response?.data?.message || error.message));
      console.error("Search error:", error);
      setLogisticData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (loading || logisticData.length === 0) {
      return;
    }
    ExportToExcel(logisticData, "LogisticPanelDataSearch.xlsx");
  };


  return (
    <>
      <Accordion
        name={t("Logistic Panel Data Search")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row pt-2 px-2 py-2">
          <div className="col-12">
            <div className="row gap-3 justify-content-start d-flex">
              <div className="col-12 col-sm-6 col-md-2 my-1">
                <DatePicker
                  className="custom-calendar"
                  name="fromDate"
                  placeholder=" "
                  id="fromDate"
                  lable="From Date"
                  value={payload.fromDate ? new Date(payload.fromDate) : null}
                  onChange={handleDateSelect}
                />
              </div>
              <div className="col-12 col-sm-6 col-md-2 my-1">
                <DatePicker
                  className="custom-calendar"
                  name="toDate"
                  placeholder=" "
                  id="toDate"
                  lable="To Date"
                  value={payload.toDate ? new Date(payload.toDate) : null}
                  onChange={handleDateSelect}
                />
              </div>
              <div className="col-auto mt-1">
                {loading ? (
                  <Loading />
                ) : (
                  <SearchButton
                    text={"Search"}
                    className="text-white"
                    onClick={handleSearch}
                  />
                )}
              </div>
              <div className=" col-auto mt-1">
                <CustomButton
                  onClick={handleExport}
                  text={t("Excel")}
                  icon={"excel"}
                  className={loading || logisticData.length === 0 ? "opacity-50" : ""}
                  style={{ 
                    cursor: logisticData.length === 0 ? "not-allowed" : "pointer", 
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </Accordion>

      <Accordion
        defaultValue={true}
        title={t("Logistic Panel Data")}
        className="lpds-data-accordion"
        seconTitle={
          <span className="badge bg-info">
            Total Records: {logisticData.length}
          </span>
        }
      >
        <div className="row gx-3 gy-3">
          <div className="card w-100">
            <div className="card-body p-2">
              <div className="table-responsive">
                {logisticData.length > 0 ? (
                  <>

                    <Tables className="">
                      <thead className="cf" style={{ position: "sticky", top: 0, backgroundColor: "#f8f9fa", zIndex: 1 }}>
                        <tr>
                        <th>{t("S.No")}</th>
                          <th>{t("Field Boy / Route")}</th>
                          <th>{t("Client (Code)")}</th>
                          <th>{t("Status & Type")}</th>
                          <th>{t("Counts / Cash")}</th>
                          <th>{t("Schedule vs Actual")}</th>
                          <th>{t("TAT (Difference)")}</th>
                          <th>{t("Remarks")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {logisticData.map((row, idx) => (
                          <tr key={idx}>
                            <td data-title={t("S.No")}>
                              {idx + 1}
                            </td>

                            {/* Field Boy & Round Info */}
                            <td data-title={t("Field Boy / Route")}>
                              <div className="d-flex flex-column">
                                <span style={{ fontWeight: "600" }}>{row.FieldBoyName || "-"}</span>
                                <small className="text-muted">{row.FieldBoyMobile}</small>
                                <small className="badge bg-light text-dark border" style={{ width: 'fit-content' }}>
                                  {row.ROUND} ({row.RoundTime})
                                </small>
                              </div>
                            </td>

                            {/* Client details */}
                            <td data-title={t("Client (Code)")}>
                              <div className="d-flex flex-column">
                                <span style={{ fontWeight: "500" }}>{row.PanelName || "-"}</span>
                                <small className="text-primary">{row.PanelCode}</small>
                                <small className="text-muted">{row.CentreType}</small>
                              </div>
                            </td>

                            {/* Status & Visit Type */}
                            <td data-title={t("Status & Type")}>
                              <div className="d-flex flex-column gap-1">
                                <span className={`badge ${row.StatusFlag === "Completed" ? "bg-success" : "bg-warning"}`}>
                                  {row.CurrentStatus}
                                </span>
                                <small className="text-uppercase fw-bold text-secondary" style={{ fontSize: '10px' }}>
                                  {row.Type}
                                </small>
                              </div>
                            </td>

                            {/* Operational Data: Samples & Cash */}
                            <td data-title={t("Operational Data")}>
                              <div className="d-flex flex-column" style={{ fontSize: '13px' }}>
                                <span>📦 Samples: <b>{row.SampleCountPUP + row.SampleCountPCC}</b></span>
                                <span className="text-success">💰 Cash: <b>₹{row.CashAmount || 0}</b></span>
                              </div>
                            </td>

                            {/* Timing Details */}
                            <td data-title={t("Timing Details")} style={{ fontSize: '12px' }}>
                              <div className="d-flex flex-column">
                                <span className="text-muted">Sch: {row.ScheduleDeliveryDateTime?.split(' ')[1] || "-"}</span>
                                <span className="text-dark">Act: {row.DeliveredDateTime?.split(' ')[1] || "-"}</span>
                              </div>
                            </td>

                            {/* TAT Logic */}
                            <td data-title={t("TAT (Difference)")}>
                              <div className="d-flex flex-column align-items-center">
                                <span className={`fw-bold ${row.InOut_TAT_Delivery === "Out TAT" ? "text-danger" : "text-success"}`}>
                                  {row.Checkin_Difference}
                                </span>
                                <small style={{ fontSize: '10px' }}>{row.InOut_TAT_Delivery}</small>
                              </div>
                            </td>

                            {/* Remarks */}
                            <td data-title={t("Remarks")} style={{ maxWidth: '150px', fontSize: '12px' }}>
                              {row.Remarks || <span className="text-muted">No remarks</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Tables>
                  </>
                ) : (
                  <NoRecordFound />
                )}
              </div>
            </div>
          </div>
        </div>
      </Accordion>
    </>
  );
};

export default LogisticPanelDataSearch;