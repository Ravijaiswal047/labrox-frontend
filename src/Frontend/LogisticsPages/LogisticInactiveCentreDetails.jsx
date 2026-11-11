import { useEffect, useState } from "react";
import Accordion from "@app/components/UI/Accordion";
import Loading from "../../components/loader/Loading";
import { useTranslation } from "react-i18next";
import moment from "moment";
import ReactSelect from "../../components/formComponent/ReactSelect";
import Input from "../../components/formComponent/Input";
import { axiosInstance } from "../../utils/axiosInstance";
import DatePicker from "../../components/formComponent/DatePicker";
import Tables from "../../components/UI/customTable";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import { ExportToExcel } from "../../utils/helpers";
import excelIcon from "../../assets/image/excelIcon.png";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { SRAFormatDate } from "../../utils/helpers";
import LogisticSampleViewModal from "../utils/LogisticSampleViewModal";
import { toast } from "react-toastify";
import { CustomButton, SearchButton } from "../../components/UI/CustomButton";

const LogisticInactiveCentreDetails = () => {
  const [t] = useTranslation();
  const [loading, setLoading] = useState(false);
  const [logisticData, setLogisticData] = useState([]);
  const [payload, setPayload] = useState({
    FromDate: SRAFormatDate(new Date()),
    ToDate: SRAFormatDate(new Date()),
    FromTime: "00:00",
    ToTime: "23:59",
  });

  const handleDateSelect = (...args) => {
    const date = args[0];
    const fieldName = args[1];
    const val = date ? new Date(date).toISOString() : null;

    setPayload((prev) => ({ ...prev, [fieldName]: val }));
  };

  const handleSearch = () => {
    setLoading(true);

    const searchPayload = {
      fromDate: moment(payload?.FromDate).format("DD-MMM-YYYY"),
      fromTime: payload?.FromTime,
      toDate: moment(payload?.ToDate).format("DD-MMM-YYYY"),
      toTime: payload?.ToTime,
    };

    axiosInstance
      .post("LogisticWeb/GetSearchLogisticInactiveDataAsync", searchPayload)
      .then((res) => {
        setLoading(false);

        const data = res?.data?.data || [];

        if (data.length > 0) {
          setLogisticData(data);
        } else {
          toast.info("No Data Found");
          setLogisticData([]);
        }
      })
      .catch((err) => {
        setLoading(false);
        toast.error("Something went wrong");
      });
  };

  return (
    <>

      <Accordion
        name={t("Logistic Inactive Centre Details")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row pt-2 px-2 py-2">
              <div className="col-12 col-sm-6 col-md-2 my-1">
                <DatePicker
                  className="custom-calendar"
                  name="FromDate"
                  lable="From Date"
                  value={payload.FromDate ? new Date(payload.FromDate) : null}
                  onChange={handleDateSelect}
                  // minDate={payload.ToDate ? adjustDate(payload.ToDate, -6) : null}
                  // maxDate={payload.ToDate ? new Date(payload.ToDate) : new Date()}
                />
              </div>

              <div className="col-12 col-sm-6 col-md-2 my-1">
                <DatePicker
                  className="custom-calendar"
                  name="ToDate"
                  lable="To Date"
                  value={payload.ToDate ? new Date(payload.ToDate) : null}
                  onChange={handleDateSelect}
                  // minDate={payload.FromDate ? new Date(payload.FromDate) : null}
                  // maxDate={payload.FromDate ? adjustDate(payload.FromDate, 6) : new Date()}
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
              <div className="mt-1" aria-disabled={logisticData.length === 0}>
                <CustomButton
                  onClick={() => logisticData.length > 0 && ExportToExcel(logisticData, "Inactive_Centre.xlsx")}
                  icon={"excel"}
                  text={"Excel"}
                  style={{
                    cursor: logisticData.length > 0 ? "pointer" : "not-allowed",
                  }}
                />
              </div>
            </div>
      </Accordion>
      <Accordion defaultValue={true} title={t("Inactive Centre Details")}>
        <div className="row gx-3 gy-3">
          <div className="card w-100">
            <div className="card-body p-2">
              <div className="table-responsive">

                {logisticData?.length > 0 ? (
                  <Tables
                    style={{
                      maxHeight: "400px",
                      overflowY: "auto",
                    }}
                  >
                    <thead>
                      <tr>
                        <th>{t("S.No")}</th>
                        <th>{t("State")}</th>
                        <th>{t("City")}</th>
                        <th>{t("Field Boy Name")}</th>
                        <th>{t("Field Boy Mobile")}</th>
                        <th>{t("Client Code")}</th>
                        <th>{t("Client Name")}</th>
                        <th>{t("Status")}</th>
                        <th>{t("Send Date")}</th>
                      </tr>
                    </thead>

                    <tbody>
                      {logisticData?.map((row, idx) => (
                        <tr key={idx}>
                          <td data-title="S.No">{idx + 1}</td>
                          <td data-title="State">{row?.State || "-"}</td>
                          <td data-title="City">{row?.City || "-"}</td>
                          <td data-title="Field Boy Name">{row?.FieldBoyName || "-"}</td>
                          <td data-title="Field Boy Mobile">{row?.FieldBoyMobile || "-"}</td>
                          <td data-title="Client Code">{row?.Panelcode || "-"}</td>
                          <td data-title="Client Name">{row?.PanelName || "-"}</td>
                          <td data-title="Status">{row?.StatusFlag}</td>
                          <td data-title="Send Date">{row?.CheckingDateTime}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Tables>
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

export default LogisticInactiveCentreDetails;
