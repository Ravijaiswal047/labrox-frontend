import { useEffect, useState } from "react";
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

const LogisticPickupSummary = () => {
  const [loading, setLoading] = useState(false);
  const [allCentre, setAllCentre] = useState([]);
  const [fieldBoyOptions, setFieldBoyOptions] = useState([]);
  const [businessZoneOptions, setBusinessZoneOptions] = useState([]);
  const [State, setState] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);
  const [payload, setPayload] = useState({
    FromCentre: "",
    Zone: "",
    State: "",
    City: "",
    FromDate: new Date(),
    ToDate: new Date(),
  });
  const [pickupSummaryData, setPickupSummaryData] = useState([]);

  const [t] = useTranslation();

  const fetchCentre = async (cityID) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`LogisticWeb/GetRateTypeByCity?CityId=${cityID}`);
      
      const data = res?.data?.message || [];
      const mapped = data.map((r) => ({
          label: r.Centre,
          value: String(r.CentreID),
        }));

        setAllCentre(mapped);
      } catch (err) {
        console.error("Failed to load centers", err);
        setAllCentre([]);
      } finally {
        setLoading(false);
      }
    };


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

  const DropLocation = (headerCentreId) => {
    axiosInstance.post(`LogisticWeb/BindRouteLogistic?CentreID=${headerCentreId}`)
      .then((res) => {
        const data = res?.data?.data || [];
        const options = data.map((item) => ({
          value: item.ID,
          label: item.City
        }));
        setDropLocation(options);
      })
  }

  const GetStateWiseData = (businessZoneId) => {
    axiosInstance
      .post(`CommonController/GetStateWiseData?BusinessZoneID=${businessZoneId}`)
      .then((res) => {
        const data = res?.data?.data || [];
        const options = data.map((item) => ({
          value: item.ID,
          label: item.State
        }));
        setState(options);
      })
      .catch((err) => {
        console.error("API Error:", err);
      });
  };

  const GetCityData = (stateId) => {
    axiosInstance
      .post(`CommonController/GetStateWiseCityData?StateID=${stateId}`)
      .then((res) => {
        const data = res?.data?.data || [];
        const options = data.map((item) => ({
          value: item.ID,
          label: item.City
        }));
        setCityOptions(options);
      })
      .catch((err) => {
        console.log("City API Error:", err);
      });
  };

  useEffect(() => {
    GetBusinessZone();
  }, []);
  const handleSelectChange = (name, value) => {
    setPayload({ ...payload, [name]: value.value });
    if (name === "BusinessZoneID") {
      GetStateWiseData(String(value?.value))
    }
    if (name === "State") {
      GetCityData(value?.value)
    }
    if (name === "City") {
      fetchCentre(value?.value)
    }
  };




  const handleDateSelect = (...args) => {
    const date = args[0];
    const fieldName = args[1];

    const val = date ? new Date(date).toISOString() : null;
    setPayload((prev) => ({ ...prev, [fieldName]: val }));
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    if (id === "BatchNo") setPayload((prev) => ({ ...prev, BatchNo: value }));
    if (id === "RouteNo") setPayload((prev) => ({ ...prev, RouteNo: value }));
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.post(
        "LogisticWeb/LogisticPickupSearchRecords",
        payload,
      );
      const message = res.data?.message ?? [];

      if (Array.isArray(message)) {
        setPickupSummaryData(message);
      } else {
        toast.error(res.data?.message);
        setPickupSummaryData([]);
      }
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      <Accordion
        name={t("Logistic Pickup Summary")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row pt-2 px-2 py-2">
          <div className="col-12">
            <div className="row gap-3 justify-content-start d-flex align-items-center">
              <div className="col-12 col-sm-6 col-md-2 my-1">
                <ReactSelect
                  dynamicOptions={businessZoneOptions}
                  name="BusinessZoneID"
                  lable="Business Zone"
                  placeholderName="Select Business Zone"
                  removeIsClearable={true}
                  value={payload?.BusinessZoneID}
                  onChange={handleSelectChange}
                />
              </div>
              <div className="col-12 col-sm-6 col-md-2 my-1">
                <ReactSelect
                  dynamicOptions={State}
                  name="State"
                  lable="State"
                  placeholderName="Select State"
                  removeIsClearable={true}
                  value={payload?.State}
                  onChange={handleSelectChange}
                  isDisabled={!State || State.length === 0}
                />
              </div>
              <div className="col-12 col-sm-6 col-md-2 my-1">
                <ReactSelect
                  dynamicOptions={cityOptions}
                  name="City"
                  lable="City"
                  placeholderName="Select City"
                  removeIsClearable={true}
                  value={payload?.City}
                  onChange={handleSelectChange}
                  isDisabled={!cityOptions || cityOptions.length === 0}
                />
              </div>
              
              <div className="col-12 col-sm-6 col-md-2 my-1">
                <ReactSelect
                  dynamicOptions={allCentre}
                  name="FromCentre"
                  lable={t("Centre")}
                  id="FromCentre"
                  removeIsClearable={true}
                  placeholderName={t("Centre")}
                  value={payload.FromCentre}
                  onChange={handleSelectChange}
                  isDisabled={loading || allCentre.length === 0}
                />
              </div>
              <div className="col-12 col-sm-6 col-md-2 my-1">
                <DatePicker
                  className="custom-calendar"
                  name="FromDate"
                  placeholder=" "
                  id="FromDate"
                  lable="From Date"
                  value={payload.FromDate ? new Date(payload.FromDate) : null}
                  onChange={handleDateSelect}
                />
              </div>
              <div className="col-12 col-sm-6 col-md-2 my-1">
                <DatePicker
                  className="custom-calendar"
                  name="ToDate"
                  placeholder=" "
                  id="ToDate"
                  lable="To Date"
                  value={payload.ToDate ? new Date(payload.ToDate) : null}
                  onChange={handleDateSelect}
                />
              </div>
              <div className="col-sm-1">
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
            </div>
          </div>
        </div>
      </Accordion>

      <Accordion defaultValue={true} title={t("Search Details")}>
        <div className="row gx-3 gy-3">
          <div className="card w-100">
            <div className="card-body p-2">
              <div className="table-responsive" style={{ width: "100%" }}>
                {pickupSummaryData.length > 0 ? (
                  <Tables
                    style={{
                      maxHeight: "400px",
                      overflowY: "auto",
                    }}
                  >
                    <thead>
                      <tr>
                        <th scope="col">{t("S.No")}</th>
                        <th scope="col">{t("Centre")}</th>
                        <th scope="col">{t("RouteName")}</th>
                        <th scope="col">{t("fieldboy")}</th>
                        <th scope="col">{t("No of Vails")}</th>
                        <th scope="col">{t("Sample Picked")}</th>
                        <th scope="col">{t("Revenue")}</th>
                      </tr>
                    </thead>

                    <tbody>
                      {pickupSummaryData.map((row, idx) => {
                        return (
                          <tr key={idx}>
                            <td data-title={t("S.No")}>{idx + 1}</td>
                            <td data-title={t("Centre")}>
                              {row.Centre}
                            </td>
                            <td data-title={t("RouteName")}>
                              {row.RouteName.split(",").map((item, idx) => (
                                <div key={idx}>{item}</div>
                              ))}
                            </td>
                            <td data-title={t("RouteName")}>
                              {row.fieldboy.split(",").map((item, idx) => (
                                <div key={idx}>{item}</div>
                              ))}
                            </td>
                            <td data-title={t("No of Vails")}>
                              {row.NoofVails}
                            </td>
                            <td data-title={t("Sample Picked")}>
                              {row.samplepicked}
                            </td>
                            <td data-title={t("Revenue")}>
                              {row.revenue}
                            </td>
                          </tr>
                        );
                      })}
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

export default LogisticPickupSummary;
