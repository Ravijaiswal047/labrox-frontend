import { useEffect, useState, useRef } from "react";
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
import LogisticLiveTrackingMap from "./LogisticLiveTrackingMap";

const FieldBoyTracking = () => {
  const [t] = useTranslation();
  const [loading, setLoading] = useState(false);
  const [fieldBoyOptions, setFieldBoyOptions] = useState([]);
  const [payload, setPayload] = useState({
    FromDate: new Date(),
    ToDate: new Date(),
    fieldBoyId: "",
    fieldBoyName: "",
    BusinessZoneID: "",
    State: "",
    City: "", 
  });
  const [businessZoneOptions, setBusinessZoneOptions] = useState([]);
  const [state, setState] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);
  const [tableData, setTableData] = useState([]);
  const intervalRef = useRef(null);
  const isAutoRefreshActive = useRef(false);
  const handleSearchRef = useRef(null);

  const fetchFieldBoys = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("FieldBoyMaster/BindFieldBoy");

      const data = res?.data?.message || [];

      const mapped = data.map((r) => ({
        label: r.NAME,
        value: String(r.FieldBoyID),
      }));

      setFieldBoyOptions(mapped);
    } catch (err) {
      console.error("Failed to load centers", err);
      setFieldBoyOptions([]);
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

  useEffect(() => {
    fetchFieldBoys();
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


  const handleDateSelect = (...args) => {
    const date = args[0];
    const fieldName = args[1];

    const val = date ? new Date(date).toISOString() : null;
    setPayload((prev) => ({ ...prev, [fieldName]: val }));
  };

  const handleSelectChange = (name, value) => {
    setPayload({ ...payload, [name]: value.value });
    if (name === "BusinessZoneID") {
      GetStateWiseData(String(value?.value))
    }
    if (name === "State") {
      GetCityData(value?.value)
    }
  };

  const handleSearch = () => {
    const finalPaylaod = {
      From: payload?.FromDate,
      To: payload?.ToDate,
      fieldBoyId: String(payload?.fieldBoyId),
      fieldBoyName: payload?.fieldBoyName,
      BusinessZoneID: String(payload?.BusinessZoneID),
      StateId: String(payload?.State),
      CityId: String(payload?.City),
    }
    setLoading(true);
    axiosInstance
      .post("LogisticWeb/TrackFieldBoyMaster", finalPaylaod)
      .then((res) => {
        const data = res?.data?.message || [];
        if(res?.data?.success && Array.isArray(data)){
          setTableData(data);
        } else {
          setTableData([]);
          toast.error(res?.data?.message || "No Data Found")
        }
      })
      .catch((err) => {
        console.error("Failed to fetch data!", err);
      })
      .finally(() => {
        setLoading(false);
      });

    // Start auto-refresh on first search
    if (!isAutoRefreshActive.current) {
      isAutoRefreshActive.current = true;
      intervalRef.current = setInterval(() => {
        handleSearchRef.current?.();
      }, 30000); // 30 seconds
    }
  };

  // Always keep the ref pointing to the latest handleSearch
  handleSearchRef.current = handleSearch;

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <>
    <Accordion
      name={t("Fieldboy Tracking")}
      defaultValue={true}
      isBreadcrumb={true}
    >
      <div className="row pt-2 px-2 py-2">
        <div className="col-12">
          <div className="row gap-3 justify-content-start d-flex align-items-center">
            <div className="col-12 col-sm-6 col-md-2">
              <ReactSelect
                dynamicOptions={businessZoneOptions}
                removeIsClearable={true}
                name="BusinessZoneID"
                lable="Business Zone"
                placeholderName="Select Business Zone"
                value={payload?.BusinessZoneID}
                onChange={handleSelectChange}
              />
            </div>
            <div className="col-12 col-sm-6 col-md-2">
              <ReactSelect
                dynamicOptions={state}
                removeIsClearable={true}
                name="State"
                lable="State"
                placeholderName="Select State"
                value={payload?.State}
                onChange={handleSelectChange}
                isDisabled={!state || state.length === 0}
              />
            </div>
            <div className="col-12 col-sm-6 col-md-2">
              <ReactSelect
                dynamicOptions={cityOptions}
                removeIsClearable={true}
                name="City"
                lable="City"
                placeholderName="Select City"
                value={payload?.City}
                onChange={handleSelectChange}
                isDisabled={!cityOptions || cityOptions.length === 0}
              />
            </div>
            {/* <div className="col-12 col-sm-2">
              <ReactSelect
                dynamicOptions={fieldBoyOptions}
                name="fieldBoyId"
                lable={t("Field Boy")}
                id="fieldBoyId"
                removeIsClearable={true}
                placeholderName={t("Field Boy")}
                value={payload.fieldBoyId}
                onChange={handleSelectChange}
                isDisabled={loading || fieldBoyOptions.length === 0}
              />
            </div> */}
            <div className="col-12 col-sm-6 col-md-2 my-1">
              <DatePicker
                className="custom-calendar"
                name="FromDate"
                placeholder=" "
                id="FromDate"
                lable="Travelled Date From"
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
                lable="Travelled Date To"
                value={payload.ToDate ? new Date(payload.ToDate) : null}
                onChange={handleDateSelect}
              />
            </div>

            <div className="col-sm-1 mb-2">
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
    <Accordion defaultValue={true} title={t("")}>
        <div className="row gx-3 gy-3">
          <div className="card w-100">
            <div className="card-body p-2">
             <LogisticLiveTrackingMap tableData={tableData} />
            </div>
          </div>
        </div>
      </Accordion>
    </>
    

  )

}

export default FieldBoyTracking;


