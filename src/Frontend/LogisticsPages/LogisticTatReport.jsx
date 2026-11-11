import { useState, useEffect } from "react";
import Accordion from "@app/components/UI/Accordion";
import Loading from "../../components/loader/Loading";
import { useTranslation } from "react-i18next";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { axiosInstance } from "../../utils/axiosInstance";
import DatePicker from "../../components/formComponent/DatePicker";
import Tables from "../../components/UI/customTable";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import { toast } from "react-toastify";
import { SearchButton } from "../../components/UI/CustomButton";
import moment from "moment";

const LogisticTatReport = () => {
  const [t] = useTranslation();
  const [businessZoneOptions, setBusinessZoneOptions] = useState([]);
  const [stateOptions, setStateOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tatData, setTatData] = useState([]);
  const [payload, setPayload] = useState({
    BusinessZoneId: "",
    StateID: "",
    SearchType: 1,
    FromDate: new Date(),
    ToDate: new Date(),
  });

  const GetBusinessZone = () => {
    axiosInstance
      .get("CommonController/GetBusinessZone")
      .then((res) => {
        const data = res?.data?.data || [];
        const options = data.map((item) => ({
          value: item.BusinessZoneID,
          label: item.BusinessZoneName,
        }));
        setBusinessZoneOptions(options);
      })
      .catch((err) => {
        console.error("API Error:", err);
      });
  };

  useEffect(() => {
    GetBusinessZone();
  }, []);

  const GetStateWiseData = (businessZoneId) => {
    axiosInstance
      .post(`CommonController/GetStateWiseData?BusinessZoneID=${businessZoneId}`)
      .then((res) => {
        const data = res?.data?.data || [];
        const options = data.map((item) => ({
          value: item.ID,
          label: item.State
        }));
        setStateOptions(options);
      })
      .catch((err) => {
        console.error("API Error:", err);
      });
  };

  const handleDateSelect = (date, fieldName) => {
    setPayload((prev) => ({ ...prev, [fieldName]: date }));
  };

  const handleSelectChange = (name, value) => {
    setPayload((prev) => ({ ...prev, [name]: value.value }));
    if (name === "BusinessZoneId") {
      GetStateWiseData(value.value);
    }
  };

  const handleSearch = () => {
    setLoading(true);
    const searchPayload = {
      searchType: String(payload?.SearchType),
      fromDate: moment(payload?.FromDate).format("YYYY-MM-DD"),
      toDate: moment(payload?.ToDate).format("YYYY-MM-DD"),
      stateId: String(payload?.StateID),
      businessZoneId: String(payload?.BusinessZoneId),
    };

    axiosInstance
      .post("LogisticWeb/GetLogisticsTATReportAsync", searchPayload)
      .then((res) => {
        setLoading(false);
        if (res?.data?.success) {
          setTatData(res?.data?.data || []);
        } else {
          toast.error(res?.data?.message || "No Data Found");
          setTatData([]);
        }
      })
      .catch((err) => {
        setLoading(false);
        setTatData([]);
      });
  };

  // Helper to get keys from data
  const getKeys = (data) => (data.length > 0 ? Object.keys(data[0]) : []);

  return (
    <>
      <Accordion name={t("Logistic Tat Report")} defaultValue={true} isBreadcrumb={true}>
        <div className="row p-2">
          <div className="col-12 col-sm-6 col-md-2 my-1">
            <ReactSelect
              dynamicOptions={businessZoneOptions}
              removeIsClearable={true}
              name="BusinessZoneId"
              lable="Business Zone"
              placeholderName="Select Business Zone"
              value={payload?.BusinessZoneId}
              onChange={handleSelectChange}
            />
          </div>
          <div className="col-12 col-sm-6 col-md-2 my-1">
            <ReactSelect
              dynamicOptions={stateOptions}
              removeIsClearable={true}
              name="StateID"
              lable="State"
              placeholderName="Select State"
              value={payload?.StateID}
              onChange={handleSelectChange}
              isDisabled={!stateOptions || stateOptions.length === 0}
            />
          </div>
          <div className="col-12 col-sm-6 col-md-2 my-1">
            <DatePicker
              lable="From Date"
              name="FromDate"
              className="custom-calendar"
              value={payload.FromDate}
              onChange={handleDateSelect}
            />
          </div>
          <div className="col-12 col-sm-6 col-md-2 my-1">
            <DatePicker
              lable="To Date"
              name="ToDate"
              className="custom-calendar"
              value={payload.ToDate}
              onChange={handleDateSelect}
            />
          </div>
          <div className="col-12 col-sm-6 col-md-2 my-1">
            <ReactSelect
              lable={t("Search by")}
              dynamicOptions={[
                { label: "State Wise Tat Report", value: 1 },
                { label: "Client TaT Report", value: 2 },
                { label: "FieldBoy TaT Report", value: 3 },
                { label: "Lab TaT Report", value: 4 },
              ]}
              name="SearchType"
              id="SearchType"
              value={payload.SearchType}
              onChange={handleSelectChange}
              removeIsClearable={true}
            />
          </div>
          <div className="col-auto mt-1">
            {loading ? <Loading /> : <SearchButton text="Search" onClick={handleSearch} />}
          </div>
        </div>
      </Accordion>

      <Accordion defaultValue={true} title={t("Report View")}>
        <div className="card-body p-2">
          <div className="table-responsive" style={{ maxHeight: "500px" }}>
            {loading ? (
              <Loading />
            ) : tatData.length > 0 ? (
              <>
                {/* TYPE 1: State Wise */}
                {Number(payload.SearchType) === 1 && (
                  <Tables className="table-striped">
                    <thead>
                      <tr>
                        <th>{t("S.No")}</th>
                        {getKeys(tatData).map((key) => <th key={key}>{key}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {tatData.map((row, idx) => (
                        <tr key={idx}>
                          <td data-title={t("S.No")}>{idx + 1}</td>
                          {getKeys(tatData).map((key) => <td key={key} data-title={key}>{row[key] || "-"}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </Tables>
                )}

                {/* TYPE 2: Client TAT */}
                {Number(payload.SearchType) === 2 && (
                  <Tables className="table-striped text-nowrap">
                    <thead>
                      <tr>
                        <th>#</th>
                        {getKeys(tatData).map((key) => <th key={key}>{key}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {tatData.map((row, idx) => (
                        <tr key={idx}>
                          <td data-title={"#"}>{idx + 1}</td>
                          {getKeys(tatData).map((key) => <td key={key} data-title={key}>{row[key] || "-"}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </Tables>
                )}

                {/* TYPE 3: FieldBoy TAT */}
                {Number(payload.SearchType) === 3 && (
                  <Tables className="table-striped">
                    <thead>
                      <tr>
                        <th>#</th>
                        {getKeys(tatData).map((key) => <th key={key}>{key}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {tatData.map((row, idx) => (
                        <tr key={idx}>
                          <td data-title={"#"}>{idx + 1}</td>
                          {getKeys(tatData).map((key) => <td key={key} data-title={key}>{row[key] || "-"}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </Tables>
                )}

                {/* TYPE 4: Lab TAT */}
                {Number(payload.SearchType) === 4 && (
                  <Tables className="table-striped">
                    <thead>
                      <tr>
                        <th>#</th>
                        {getKeys(tatData).map((key) => <th key={key}>{key}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {tatData.map((row, idx) => (
                        <tr key={idx}>
                          <td data-title={"#"}>{idx + 1}</td>
                          {getKeys(tatData).map((key) => <td key={key} data-title={key}>{row[key] || "-"}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </Tables>
                )}
              </>
            ) : (
              <NoRecordFound />
            )}
          </div>
        </div>
      </Accordion>
    </>
  );
};

export default LogisticTatReport;