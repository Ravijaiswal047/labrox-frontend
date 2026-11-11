import { useEffect, useState } from "react";
import Accordion from "@app/components/UI/Accordion";
import Loading from "../../components/loader/Loading";
import { useTranslation } from "react-i18next";
import ReactSelect from "../../components/formComponent/ReactSelect";
import Input from "../../components/formComponent/Input";
import { axiosInstance } from "../../utils/axiosInstance";
import { apiUrls } from "../../utils/apiUrls";
import DatePicker from "../../components/formComponent/DatePicker";
import Tables from "../../components/UI/customTable";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faTrash, faPlus, faCheck } from "@fortawesome/free-solid-svg-icons";
import { SRAFormatDate } from "../../utils/helpers";
import { toast } from "react-toastify";
import { CustomButton, SaveButton, SearchButton } from "../../components/UI/CustomButton";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";

const LogisticFieldBoyMapping = () => {
  const [loading, setLoading] = useState(false);
  const headerCentreId = useLocalStorage("DefaultCentre", "get");
  const [cityOptions, setCityOptions] = useState([]);
  const [dropLocation, setDropLocation] = useState([]);
  const [routeOptions, setRouteOptions] = useState([]);
  const [fieldBoyOptions, setFieldBoyOptions] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [businessZoneOptions, setBusinessZoneOptions] = useState([]);
  const [resetKey, setResetKey] = useState(0);

  const [State, setState] = useState([]);
  const [payload, setPayload] = useState({
    rateType: "",
    FromCentre: "",
    BusinessZoneID: "",
    StateID: "",
    City: "",
    DropLocation: "",
    EnterRoute: "",
    selectedBusinessZone: "",
    RouteName: ""
  });

  const [rateType, setRateType] = useState({
    data: [],
    value: "",
    label: ""
  });

  const [tableData, setTableData] = useState([]);
  const [t] = useTranslation();

  const days = [
    { key: 'Sun', label: 'Sunday', order: 0 },
    { key: 'Mon', label: 'Monday', order: 1 },
    { key: 'Tue', label: 'Tuesday', order: 2 },
    { key: 'Wed', label: 'Wednesday', order: 3 },
    { key: 'Thu', label: 'Thursday', order: 4 },
    { key: 'Fri', label: 'Friday', order: 5 },
    { key: 'Sat', label: 'Saturday', order: 6 }
  ];

  const rounds = ['round1', 'round2', 'round3', 'round4', 'round5', 'round6', 'round7', 'round8', 'round9', 'round10'];
  const roundLabels = {
    round1: 'Round 1',
    round2: 'Round 2',
    round3: 'Round 3',
    round4: 'Round 4',
    round5: 'Round 5',
    round6: 'Round 6',
    round7: 'Round 7',
    round8: "Round 8",
    round9: "Round 9",
    round10: "Round 10"
  };

  useEffect(() => {
    const initialTableData = days.map(day => ({
      day: day.key,
      dayName: day.label,
      round1: "",
      round2: "",
      round3: "",
      round4: "",
      round5: "",
      round6: "",
      round7: "",
      round8: "",
      round9: "",
      round10: "",
      isActive: true
    }));
    setTableData(initialTableData);
  }, []);

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

  const getExistingRoute = (headerCentreId) => {
    axiosInstance.get(`LogisticWeb/BindRouteLogistic?CentreID=${headerCentreId}`)
      .then((res) => {
        const data = res?.data?.data || [];
        const options = data.map((item) => ({
          value: item.RouteId,
          label: item.RouteName
        }));
        setRouteOptions(options);
      })
  }
  
  const getDropLocation = async () => {
    try {
      const res = await axiosInstance.get("LogisticWeb/GetDropLocation");
      const data = res.data.message;
      const CentreDataValue = data.map((ele) => {
        return {
          value: ele.CentreID,
          label: ele.Centre,
        };
      });
      setDropLocation(CentreDataValue);
    } catch (error) {
      console.log("Error while fetching drop location");
    }
  };

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
    getDropLocation();
    // getExistingRoute(headerCentreId);
    getRouteNames();
  }, []);

  const getRouteNames = () => {
    axiosInstance
      .get("LogisticWeb/FeildBoyProfileData")
      .then((res) => {
        const data = res?.data?.data?.data || [];

        const options = data.map((item) => ({
          value: item.FieldBoyID,
          label: item.NameMobile
        }));

        setFieldBoyOptions(options);
      })
      .catch((err) => {
        console.error("Error fetching route names:", err);
        toast.error("Failed to load route names");
      });
  };


  const handleMainRouteSelect = (name, value) => {
    setSelectedRoute(value || null);

    if (value?.label) {
      setPayload(prev => ({
        ...prev,
        RouteName: value?.value,
        EnterRoute: value.label.split("~")[0].trim()
      }));
      getRouteData(value?.value);
    } else {
        setPayload(prev => ({
            ...prev,
            RouteName: "",
            EnterRoute: ""
        }));
        setTableData(
            days.map((day) => ({
                day: day.key,
                dayName: day.label,
                round1: "",
                round2: "",
                round3: "",
                round4: "",
                round5: "",
                round6: "",
                round7: "",
                round8: "",
                round9: "",
                round10: "",
                isActive: true,
            }))
        );
    }
  };

  const getRouteData = (id) => {
    setLoading(true);
    axiosInstance
        .post(`LogisticWeb/EditRouteLogistic?RouteId=${id}`)
        .then((res) => {
            // Check if we actually have data to work with
            const incomingData = res?.data?.success ? res?.data?.data : [];

            // We ALWAYS map through the 'days' array to ensure the table structure 
            // (Monday-Sunday) is preserved, even if the values are empty.
            const mapData = days.map((day) => {
                const myDay = incomingData.filter((ele) => ele?.DAY === day.key);
                
                // This is your "Empty Row" template
                const obj = {
                    day: day.key,
                    dayName: day.label,
                    round1: "", round2: "", round3: "", round4: "", round5: "",
                    round6: "", round7: "", round8: "", round9: "", round10: "",
                    isActive: true,
                };

                // Fill the template only if data exists for this day
                if (myDay.length > 0) {
                    myDay.forEach((item) => {
                        const roundKey = item?.ROUND?.toLowerCase().replace(" ", "");
                        if (obj.hasOwnProperty(roundKey)) {
                            obj[roundKey] = item?.fieldboyid;
                        }
                    });
                }
                return obj;
            });

            // Update the table with either the new data or the empty template
            setTableData(mapData);
            setResetKey((prev) => prev + 1);

            if (!res?.data?.success && res?.data?.message) {
                // toast.error(res?.data?.message);
            }
            
            setLoading(false);
        })
        .catch((err) => {
            setLoading(false);
            console.error(err);
            toast.error("An error occurred while fetching route data.");
            
            // On hard error, clear the table to prevent showing "ghost" data from previous routes
            setTableData([]); 
        });
};

  const handleSelectChange = (name, value) => {
    setPayload({ ...payload, [name]: value.value });
    if (name === "BusinessZoneID") {
      GetStateWiseData(String(value?.value))
    }
    if (name === "StateID") {
      GetCityData(value?.value)
    }
    if(name === "DropLocation"){
      getExistingRoute(value?.value)
    }
  };

  const handleTableDropdownChange = (day, round, selected) => {
    setTableData(prevData =>
      prevData.map(item =>
        item.day === day
          ? { ...item, [round]: selected?.value || "" }
          : item
      )
    );
  };


  const hasValue = (val) => {
    if (Array.isArray(val)) return val.length > 0;
    if (typeof val === "string") return val.trim() !== "";
    return !!val;
  };


  const handleSave = async () => {
    if (!selectedRoute) {
      toast.error("Please select a route ");
      return;
    }

    const hasAnySelection = tableData.some(day =>
      rounds.some(round => hasValue(day[round]))
    );

    if (!hasAnySelection) {
      toast.error("Please select at least one round");
      return;
    }

    const dataPayload = tableData
      .filter(day => rounds.some(round => hasValue(day[round])))
      .map(day => {
        const obj = {
          routeId: String(selectedRoute.value),
          day: day.day
        };

        rounds.forEach(round => {
          if (hasValue(day[round])) {
            obj[round] = [String(day[round])];
          }
        });

        return obj;
      });

    const finalPayload = {
      isUpdate: "1",
      data: dataPayload
    };

    try {
      setLoading(true);
      const res = await axiosInstance.post(
        "LogisticWeb/SaveLogisticMapping",
        finalPayload
      );

      if (res.data?.success) {
        toast.success(res.data?.message);
        setSelectedRoute(null);
        setTableData(
          days.map(day => ({
            day: day.key,
            dayName: day.label,
            round1: "",
            round2: "",
            round3: "",
            round4: "",
            round5: "",
            round6: "",
            round7: "",
            round8: "",
            round9: "",
            round10: "",
            isActive: true
          }))
        );
        setPayload({
          BusinessZoneID: "",
          StateID: "",
          City: "",
          DropLocation: "",
          RouteName: "",
          EnterRoute: ""
        }); 
        setResetKey(prev => prev + 1);
      }
      else {
        toast.error(res.data?.message || "Save failed");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "API Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Accordion
        name={t("Logistic Field Boy Mapping")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row pt-2 px-2">
          <div className="col-12">
            <div className="row gap-3 d-flex">
              <div className="col-12 col-sm-6 col-md-2 my-1">
                <ReactSelect
                  dynamicOptions={businessZoneOptions}
                  name="BusinessZoneID"
                  lable="Business Zone"
                  placeholderName="Select Business Zone"
                  value={payload?.BusinessZoneID}
                  removeIsClearable={true}
                  onChange={handleSelectChange}
                />
              </div>
              <div className="col-12 col-sm-6 col-md-2 my-1">
                <ReactSelect
                  dynamicOptions={State}
                  name="StateID"
                  lable="State"
                  placeholderName="Select State"
                  value={payload?.StateID}
                  removeIsClearable={true}
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
                  value={payload?.City}
                  removeIsClearable={true}
                  onChange={handleSelectChange}
                  isDisabled={!cityOptions || cityOptions.length === 0}
                />
              </div>
              <div className="col-12 col-sm-6 col-md-2 my-1">
                <ReactSelect
                  dynamicOptions={dropLocation}
                  name="DropLocation"
                  lable="DropLocation"
                  placeholderName="DropLocation"
                  value={payload?.DropLocation}
                  removeIsClearable={true}
                  onChange={handleSelectChange}
                />
              </div>

              <div className="col-12 col-sm-6 col-md-2 my-1">
                <ReactSelect
                  //  key={`main-route-${resetKey}`}
                  dynamicOptions={routeOptions}
                  name="RouteName"
                  id="RouteName"
                  lable="Select Route"
                  placeholderName="Select Existing Route"
                  value={payload?.RouteName}
                  removeIsClearable={true}
                  onChange={handleMainRouteSelect}
                />
              </div>

              <div className="col-12 col-sm-6 col-md-2 my-1">
                <CustomButton
                icon={"save"}
                  text={loading ? "Saving..." : "Save"}
                    onClick={handleSave}
                    disabled={loading || !selectedRoute}
                  />
              </div>
              {/* <div className="col-12 col-sm-6 col-md-1 mb-2 d-flex align-items-end"> 
                <CustomButton
                  text={loading ? "Loading..." : "Edit Route"}
                  onClick={() => getRouteData(payload.RouteName)}
                  disabled={loading || !payload.RouteName}
                />
              </div> */}
            </div>
          </div>
        </div>
      </Accordion>

      <Accordion
        title={t("Route Configuration")}
        defaultValue={true}
      >
        <div className="row p-2">
          <div className="col-12">
            <div className="table-responsive" style={{ maxHeight: "500px", overflowY: "auto" }}>
              <Tables className="table-striped">
                <thead className="cf" style={{ position: "sticky", top: 0, backgroundColor: "#f8f9fa", zIndex: 1 }}>
                  <tr>
                    <th style={{ minWidth: '120px', textAlign: 'center' }}>{t("Day")}</th>
                    {rounds.map((round) => (
                      <th key={round} style={{ minWidth: '150px', textAlign: 'center' }}>
                        <div className="d-flex flex-column align-items-center">
                          <div className="mb-2">
                            <span style={{ fontSize: '14px', fontWeight: 'bold' }}>
                              {roundLabels[round]}
                            </span>
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((dayData, index) => (
                    <tr key={dayData.day} style={{ backgroundColor: index % 2 === 0 ? '#f9f9f9' : 'white' }}>
                      <td data-title={t("Day")} style={{ textAlign: 'center', verticalAlign: 'middle', fontWeight: 'bold' }}>
                        {dayData.dayName}
                      </td>
                      {rounds.map((round) => (
                        <td data-title={roundLabels[round]} key={round} style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                          <div className="my-1" style={{ minWidth: '160px' }}>
                            <ReactSelect
                              key={`${resetKey}-${dayData.day}-${round}`}
                              dynamicOptions={[{ label: "Select...", value: "" }, ...fieldBoyOptions]}
                              name={`${dayData.day}-${round}`}
                              lable=""
                              placeholderName=""
                              removeIsClearable={true}
                              value={dayData[round]}
                              onChange={(name, value) =>
                                handleTableDropdownChange(dayData.day, round, value || "")
                              }
                            />
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </Tables>
            </div>
            <div className="mt-3 text-center">
              <small className="text-muted">
                Select routes for each day and round combination. The main route selection above will be saved as the primary route ID.
              </small>
            </div>
          </div>
        </div>
      </Accordion>
    </>
  );
}

export default LogisticFieldBoyMapping;