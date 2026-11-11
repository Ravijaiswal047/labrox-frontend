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
import MultiSelectComp from "../../components/formComponent/MultiSelectComp";
import Heading from "../../components/UI/Heading";

const LogisticRouteMaster = () => {
  const [loading, setLoading] = useState(false);
  const headerCentreId = useLocalStorage("DefaultCentre", "get");
  const [cityOptions, setCityOptions] = useState([]);
  const [dropLocation, setDropLocation] = useState([]);
  const [routeOptions, setRouteOptions] = useState([]);
  const [businessZoneOptions, setBusinessZoneOptions] = useState([]);
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
    existingRoute: ""
  });

  const [rateType, setRateType] = useState({
    data: [],
    value: "",
    label: ""
  });
  const [isSearch, setisSearch] = useState(false);

  const [tableData, setTableData] = useState([]);
  const [searchData, setSearchData] = useState([]); // Store search results
  const [selectedDaysByRound, setSelectedDaysByRound] = useState({
    round1: [],
    round2: [],
    round3: [],
    round4: [],
    round5: [],
    round6: [],
    round7: []
  });
  const [t] = useTranslation();

  console.log("Payload hello", payload)

  // Days configuration
  const days = [
    { key: 'sunday', label: 'S', fullName: 'Sunday', order: 0 },
    { key: 'monday', label: 'M', fullName: 'Monday', order: 1 },
    { key: 'tuesday', label: 'T', fullName: 'Tuesday', order: 2 },
    { key: 'wednesday', label: 'W', fullName: 'Wednesday', order: 3 },
    { key: 'thursday', label: 'T', fullName: 'Thursday', order: 4 },
    { key: 'friday', label: 'F', fullName: 'Friday', order: 5 },
    { key: 'saturday', label: 'S', fullName: 'Saturday', order: 6 }
  ];

  // Round configuration (7 rounds)
  const rounds = ['round1', 'round2', 'round3', 'round4', 'round5', 'round6', 'round7'];
  const roundLabels = {
    round1: 'Round 1',
    round2: 'Round 2',
    round3: 'Round 3',
    round4: 'Round 4',
    round5: 'Round 5',
    round6: 'Round 6',
    round7: 'Round 7'
  };

  const generateTimeOptions = () => {
    const times = [];
    for (let h = 8; h <= 20; h++) {   // you can change end time
      const hour = String(h).padStart(2, '0');
      times.push(
        { value: `${hour}:00`, label: `${hour}:00` },
        { value: `${hour}:30`, label: `${hour}:30` }
      );
    }
    times.push({ value: "OnCall", label: "On Call" });
    return times;
  };
  const timeSlotsOptions = generateTimeOptions();


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
  }, []);

  const getRateType = (cityID) => {
    axiosInstance
      .get(`LogisticWeb/GetRateTypeByCity?CityId=${cityID}`)
      .then((res) => {
        const data = res?.data?.message;
        const val = data.map((ele) => ({
          value: ele?.CentreID,
          label: ele?.Centre,
        }));
        setRateType({
          data: val,
          value: "",
          label: ""
        });
      })
      .catch((err) => {
        setRateType({
          data: [],
          value: "",
          label: ""
        });
        console.log(err);
      });
  };

  const handleSearchSelectChange = (label, value) => {
    setPayload({
      ...payload,
      [label]: value?.value
    })
  };

   const handleMultiSelectChange = (name, value) => {
    
    setPayload((prev) => ({
      ...prev,
      [name]: value
    }));

    if (name === "rateType") {
      const selectedIds = Array.isArray(value) ? value.map(item => item) : [];
      setRateType(prev => ({
        ...prev,
        value: selectedIds
      }));
    }
  }

  const handleChange = (name, value) => {
    setPayload({
      ...payload,
      [name]: value?.value
    });

    if (name === "BusinessZoneID") {
      setCityOptions([]);
      GetStateWiseData(value?.value);
    }
    if (name === "State") {
      GetCityData(value?.value);
    }
  };

  const handleAddRow = () => {
    if (!rateType.value || rateType.value.length === 0) {
      toast.error("Please select at least one Rate Type first");
      return;
    }

    console.log("Rate Type Value", rateType.value)

    const newRows = [];
    let alreadyExistsCount = 0;
    let isDropConflict = false;

    // Filter out potential Drop Location Row to re-append at the end
    const existingNormalRows = tableData.filter(row => !row.isDropLocation);
    const dropLocationRow = tableData.find(row => row.isDropLocation);

    rateType.value.forEach((selectedId) => {
      const exists = existingNormalRows.find(item => item.rateTypeId === selectedId);
      const isCurrentlyDrop = dropLocationRow && dropLocationRow.rateTypeId === selectedId;

      if (exists) {
        alreadyExistsCount++;
      } else if(isCurrentlyDrop){
        isDropConflict = true;
      } else {
        const optionDetails = rateType.data.find(opt => opt.value === selectedId);
        const label = optionDetails ? optionDetails.label : selectedId;

        const timeSlots = {};
        rounds.forEach(round => {
          timeSlots[round] = "";
        });

        const newRow = {
          id: `${Date.now()}_${Math.floor(Math.random() * 10000)}`,
          rateTypeId: selectedId,
          rateTypeName: label,
          // Priority and Panel Code will be recalculated
          panel: label,
          timeSlots: timeSlots,
          isDropLocation: false
        };
      
        newRows.push(newRow);
      }
    })

    if (isDropConflict) {
      toast.error("One or more selected items are already set as the Drop Location!");
    }

    if (newRows.length > 0) {
      let combinedData = [...existingNormalRows, ...newRows];
      if (dropLocationRow) {
        combinedData.push(dropLocationRow);
      }

      const reorderedData = combinedData.map((item, index) => ({
        ...item,
        priority: index + 1,
        panelCode: `PAN${String(index + 1).padStart(3, '0')}`
      }));

      setTableData(reorderedData);
      toast.success(`${newRows.length} Rate Type(s) added successfully`);
    }

    if (alreadyExistsCount > 0) {
      toast.warning(`${alreadyExistsCount} item(s) skipped as they already exist`);
    }

    setRateType({ ...rateType, value: [] });
    setPayload(prev => ({ ...prev, rateType: [] }));
  };

  const handleDeleteRow = (id) => {
    const rowToDelete = tableData.find(item => item.id === id);
    if (rowToDelete?.isDropLocation) {
      setPayload(prev => ({ ...prev, DropLocation: "" }));
    }

    const updatedData = tableData.filter(item => item.id !== id);
    const reorderedData = updatedData.map((item, index) => ({
      ...item,
      priority: index + 1,
      panelCode: `PAN${String(index + 1).padStart(3, '0')}`
    }));
    setTableData(reorderedData);
    toast.success("Row deleted successfully");
  };

  const toggleDaySelection = (round, dayKey) => {
    console.log(`Day toggled: Round ${round}, Day: ${dayKey}`);
    setSelectedDaysByRound(prev => {
      const currentSelection = [...prev[round]];
      const dayIndex = currentSelection.indexOf(dayKey);

      if (dayIndex === -1) {
        return {
          ...prev,
          [round]: [...currentSelection, dayKey]
        };
      } else {
        return {
          ...prev,
          [round]: currentSelection.filter(d => d !== dayKey)
        };
      }
    });
  };

const handleTimeSlotChange = (rowId, round, value) => {
  console.log(`Time slot changed: Round ${round}, Value: ${value?.value}`);
  const selectedTime = value?.value || "";

  // Find the current row's index in tableData
  const currentRowIndex = tableData.findIndex(item => item.id === rowId);
  if (currentRowIndex === -1) return;

  // Validate within the SAME round column (vertically across rows)
  // The selected time must be >= the previous row's time in this same round
  if (selectedTime && selectedTime !== "OnCall" && currentRowIndex > 0) {
    // Look at the previous row's time in this same round
    for (let i = currentRowIndex - 1; i >= 0; i--) {
      const prevRowTime = tableData[i].timeSlots[round];
      if (prevRowTime && prevRowTime !== "OnCall") {
        if (selectedTime <= prevRowTime) {
          toast.error(`Time must be later than the previous row's time (${prevRowTime}) in ${roundLabels[round]}`);
          return;
        }
        break; // only check the nearest previous row that has a time in this round
      }
    }
  }

  // Also validate that this time is not greater than the next row's time in the same round
  if (selectedTime && selectedTime !== "OnCall" && currentRowIndex < tableData.length - 1) {
    for (let i = currentRowIndex + 1; i < tableData.length; i++) {
      const nextRowTime = tableData[i].timeSlots[round];
      if (nextRowTime && nextRowTime !== "OnCall") {
        if (selectedTime >= nextRowTime) {
          toast.error(`Time must be earlier than the next row's time (${nextRowTime}) in ${roundLabels[round]}`);
          return;
        }
        break; // only check the nearest next row that has a time in this round
      }
    }
  }

  setTableData(prev =>
    prev.map(item =>
      item.id === rowId
        ? {
            ...item,
            timeSlots: {
              ...item.timeSlots,
              [round]: selectedTime
            }
          }
        : item
    )
  );
};

// Get filtered time options for a specific row and round
// Within a single round column, each row's time must be >= previous row's time
// Each round column is completely independent
const getFilteredTimeOptions = (rowData, round) => {
  const currentRowIndex = tableData.findIndex(item => item.id === rowData.id);
  let minTime = null;
  let maxTime = null;

  // Find the nearest previous ROW with a set time in this same round (excluding "OnCall")
  if (currentRowIndex > 0) {
    for (let i = currentRowIndex - 1; i >= 0; i--) {
      const prevRowTime = tableData[i].timeSlots[round];
      if (prevRowTime && prevRowTime !== "OnCall") {
        minTime = prevRowTime;
        break;
      }
    }
  }

  // Find the nearest next ROW with a set time in this same round (excluding "OnCall")
  if (currentRowIndex < tableData.length - 1) {
    for (let i = currentRowIndex + 1; i < tableData.length; i++) {
      const nextRowTime = tableData[i].timeSlots[round];
      if (nextRowTime && nextRowTime !== "OnCall") {
        maxTime = nextRowTime;
        break;
      }
    }
  }

  return timeSlotsOptions.filter(option => {
    // "OnCall" is always allowed
    if (option.value === "OnCall") return true;
    // Always keep the current row's own selected time so it stays visible in the dropdown
    const currentTime = rowData.timeSlots[round];
    if (currentTime && option.value === currentTime) return true;
    // Filter: must be strictly greater than previous row's time in this round
    if (minTime && option.value <= minTime) return false;
    // Filter: must be strictly less than next row's time in this round
    if (maxTime && option.value >= maxTime) return false;
    return true;
  });
};


  const handleSelectChange = (name, value) => {
    setPayload({ ...payload, [name]: value?.value });
    if (name === "BusinessZoneID") {
      GetStateWiseData(String(value?.value))
    }
    if (name === "StateID") {
      GetCityData(value?.value)
    }
    if (name === "City") {
      getRateType(value?.value)
    } 

    if (name === "DropLocation") {
      if (!value) {
        // Remove Drop Location Row
        const updatedData = tableData.filter(row => !row.isDropLocation);
        const reorderedData = updatedData.map((item, index) => ({
          ...item,
          priority: index + 1,
          panelCode: `PAN${String(index + 1).padStart(3, '0')}`
        }));
        setTableData(reorderedData);
      } else {
        // Add or Update Drop Location Row
        const existInTable = tableData.find(row => row.rateTypeId === value.value && !row.isDropLocation);
        if(existInTable){
          toast.warning("This Rate Type already exists");
          return;
        }
        const dropDetails = { value: value.value, label: value.label };

        setTableData(prev => {
          const existingIndex = prev.findIndex(row => row.isDropLocation);
          let newList = [...prev];

          if (existingIndex !== -1) {
            // Update existing
            newList[existingIndex] = {
              ...newList[existingIndex],
              rateTypeId: dropDetails.value,
              rateTypeName: dropDetails.label,
              panel: dropDetails.label
            };
          } else {
            // Add new
            const timeSlots = {};
            rounds.forEach(round => {
              timeSlots[round] = "";
            });

            const newRow = {
              id: `${Date.now()}_${Math.floor(Math.random() * 10000)}`,
              rateTypeId: dropDetails.value,
              rateTypeName: dropDetails.label,
              priority: prev.length + 1, // temporary, re-calc below
              panelCode: "", // temporary
              panel: dropDetails.label,
              timeSlots: timeSlots,
              isDropLocation: true
            };
            newList.push(newRow);
          }

          return newList.map((item, index) => ({
            ...item,
            priority: index + 1,
            panelCode: `PAN${String(index + 1).padStart(3, '0')}`
          }));
        });
      }
      getExistingRoute(value?.value)
    }
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setPayload(prev => ({ ...prev, [id]: value }));
  };

  const getSelectedDaysCount = (round) => {
    return selectedDaysByRound[round].length;
  };

  const getSelectedDaysSummary = (round) => {
    const selected = selectedDaysByRound[round];
    if (selected.length === 0) return "No days";
    if (selected.length === 7) return "All days";
    if (selected.length === 1) {
      const day = days.find(d => d.key === selected[0]);
      return day?.label || "";
    }
    return `${selected.length} days`;
  };

const handleSave = async () => {
  if (tableData.length === 0) {
    toast.error("Please add at least one Rate Type");
    return;
  }

  if (!payload.EnterRoute?.trim()) {
    toast.error("Please enter Route Name");
    return;
  }

  const daysOrder = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday"
  ];

  const dataPayload = tableData.map((row) => {
    const roundsArray = rounds
      .filter(roundKey => {
        const hasTime = !!row.timeSlots[roundKey]?.trim();
        const hasSelectedDays = (selectedDaysByRound[roundKey] || []).length > 0;

        console.log(`ROUND CHECK [${roundKey}]`, {
          time: row.timeSlots[roundKey],
          selectedDays: selectedDaysByRound[roundKey],
          hasTime,
          hasSelectedDays
        });

        return hasTime && hasSelectedDays;
      })
      .map(roundKey => {
        const time = row.timeSlots[roundKey];
        const selectedDays = selectedDaysByRound[roundKey] || [];

        const daysPattern = daysOrder
          .map(day => (selectedDays.includes(day) ? "1" : "0"))
          .join(",");

        return `${time}~${daysPattern}`;
      });

    return {
      routeId: payload.existingRoute ? String(payload.existingRoute) : "",
      routeName: payload.EnterRoute.trim(),
      centreId: String(row.rateTypeId),
      dropType: row.isDropLocation ? String(1) : String(0),
      priority: row.priority,
      round: roundsArray
    };
  });

  const hasAtLeastOneRound = dataPayload.some(d => d.round.length > 0);
  if (!hasAtLeastOneRound) {
    toast.error("Please select time and days for at least one round");
    return;
  }

  const savePayload = {
    type: payload.existingRoute ? "1" : "0",
    data: dataPayload
  };

  try {
    setLoading(true);
    const res = await axiosInstance.post(
      "LogisticWeb/SaveLogisticData",
      savePayload
    );

    if (res.data?.success) {
      toast.success("Saved Successfully");
      setTableData([]);
      setPayload({
        rateType: "",
        FromCentre: "",
        BusinessZoneID: "",
        StateID: "",
        City: "",
        DropLocation: "",
        EnterRoute: "",
        selectedBusinessZone: "",
        existingRoute: ""
      });
      setSelectedDaysByRound({
        round1: [],
        round2: [],
        round3: [],
        round4: [],
        round5: [],
        round6: [],
        round7: []
      });
    } else {
      toast.error(res.data?.message || "Save failed");
    }
  } catch (err) {
    toast.error(
      "API Error: " + (err.response?.data?.message || err.message)
    );
    console.error("Save error:", err);
  } finally {
    setLoading(false);
  }
};

const handleEditRoute = async (routeId) => {
  if (!routeId) {
    toast.error("Please select a route to edit");
    return;
  }

  try {
    setLoading(true);
    const res = await axiosInstance.get(
      `LogisticWeb/GetRoutesMaster?RouteId=${routeId}`
    );

    if (res.data?.success && Array.isArray(res.data.message)) {
      const routeData = res.data.message;

      console.log("Route Data", routeData);

      if (Array.isArray(routeData) && routeData.length > 0) {
        // Reset states
        setTableData([]);
        setSelectedDaysByRound({
          round1: [], round2: [], round3: [], round4: [],
          round5: [], round6: [], round7: []
        });

        // Set Route Name and ID
        setPayload(prev => ({
          ...prev,
          EnterRoute: routeData[0].RouteName,
          existingRoute: routeData[0].RouteId
        }));

        const newRows = [];
        const newSelectedDays = {
          round1: [], round2: [], round3: [], round4: [],
          round5: [], round6: [], round7: []
        };

        const dayMap = {
          'Sun': 'sunday', 'Mon': 'monday', 'Tue': 'tuesday', 'Wed': 'wednesday',
          'Thu': 'thursday', 'Fri': 'friday', 'Sat': 'saturday'
        };

        routeData.forEach(item => {
          const timeSlots = {};

          rounds.forEach(roundKey => {
            // key in API response is like "Round_1", "Round_2" etc.
            const roundNum = roundKey.replace('round', '');
            const apiKey = `Round_${roundNum}`;
            const roundValue = item[apiKey]; // e.g., "Wed#08:00:00"

            if (roundValue && roundValue.includes('#')) {
              // The string can be "Thu#08:30:00,Fri#08:30:00,Sat#08:30:00"
              const dayTimePairs = roundValue.split(','); 
              
              dayTimePairs.forEach(pair => {
                const [dayShort, timeWithSeconds] = pair.split('#');
                if (dayShort && timeWithSeconds) {
                  // Set time (assuming same time for all days in this round, so just overwriting is fine)
                  // Remove seconds if present to match "HH:mm" format in options
                  const time = timeWithSeconds.split(':').slice(0, 2).join(':'); 
                  timeSlots[roundKey] = time; 

                  // Add day to selectedDaysByRound if not already present
                  const internalDay = dayMap[dayShort];
                  if (internalDay && !newSelectedDays[roundKey].includes(internalDay)) {
                    newSelectedDays[roundKey].push(internalDay);
                  }
                }
              });
            } else {
              timeSlots[roundKey] = "";
            }
          });

          newRows.push({
            id: `${Date.now()}_${Math.floor(Math.random() * 10000)}_${item.CentreID}`,

            rateTypeId: item.CentreID,
            rateTypeName: item.Centre,
            priority: item.Priority,
            panel: item.Centre,
            panelCode: item.CentreCode,
            timeSlots: timeSlots,
            isDropLocation: item.DropType === 1
          });
        });

        setTableData(newRows);
        setSelectedDaysByRound(newSelectedDays);
      } else {
         toast.info("No details found for this route.");
         setTableData([]);
      }
    } else {
      toast.error(res.data?.message || "Failed to load route");
    }
  } catch (err) {
    toast.error(
      "API Error: " + (err.response?.data?.message || err.message)
    );
    console.error("Edit route error:", err);
  } finally {
    setLoading(false);
  }
};
  const handleSearch = () => {
    setLoading(true);
    const searchPayload = {
        BusinessZoneID: payload.BusinessZoneID,
        StateID: payload.StateID,
        City: payload.City,
        pickupLocation: payload.rateType ? payload.rateType : [],
        dropLocation: payload.DropLocation,
    };

    axiosInstance
      .post("LogisticWeb/SearchRouteAsync", searchPayload)
      .then((res) => {
        if (res.data?.success && Array.isArray(res.data.data)) {
           const data = res.data.data;
           setSearchData(data);
        } else {
           toast.error(res.data?.message || "Error searching data");
           setSearchData([]);
        }
      })
      .catch((err) => {
        console.error("Search Error", err);
        setSearchData([]);
      })
      .finally(() => setLoading(false));
  };

  const handleEditSearchRow = (routeId) => {
      setisSearch(false);
      handleEditRoute(routeId);
  };

  return (
    <>
      <Heading
        title={t("Logistic Route Master")}
        secondTitle={
          <div className="col-auto d-flex align-items-center justify-content-center p-2" style={{
          gap: "5px"
        }}>
          <strong>
            <span>{t("Entry")}</span>
          </strong>
          <label class="switch mb-0">
            <input
              type="checkbox"
              checked={isSearch}
              onChange={() => setisSearch(!isSearch)}
            />
            <span class="slider"></span>
          </label>
          <strong>
            <span>{t("Search")}</span>
          </strong>
        </div>
        }
        
      />
        <div className="row pt-2 px-2 py-2">
          <div className="col-12">
            <div className="row">
              <div className="col-12 col-sm-6 col-md-2 my-1">
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
              <div className="col-12 col-sm-6 col-md-2 my-1">
                <ReactSelect
                  dynamicOptions={State}
                  removeIsClearable={true}
                  name="StateID"
                  lable="State"
                  placeholderName="Select State"
                  value={payload?.StateID}
                  onChange={handleSelectChange}
                  isDisabled={!State || State.length === 0}
                />
              </div>
              <div className="col-12 col-sm-6 col-md-2 my-1">
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
                <div className="col-12 col-sm-4 col-md-2 my-1">
                <MultiSelectComp
                  label="Pickup Location"
                  options={rateType.data}
                  value={payload?.rateType}
                  name="rateType"
                  id="rateType"
                  onChange={handleMultiSelectChange}
                  lable={t("Pickup Location")}
                />
              </div>
              {!isSearch && (
              <div className="col-12 col-sm-auto">
                <CustomButton
                  icon={"add"}
                  text="Add"
                  onClick={handleAddRow}
                  disabled={rateType.value?.length === 0}
                />
              </div>
              )}
              <div className="col-12 col-sm-6 col-md-2 my-1">
                <ReactSelect
                  dynamicOptions={dropLocation}
                  removeIsClearable={true}
                  name="DropLocation"
                  label="Drop Location"
                  placeholderName="Drop Location"
                  value={payload?.DropLocation}
                  onChange={handleSelectChange}
                />
              </div>
                {!isSearch && (
              <div className="col-12 col-sm-6 col-md-2 my-1">
                <Input
                  id="EnterRoute"
                  className="select-input-box form-control form-control-sm"
                  type="text"
                  name="EnterRoute"
                  maxLength={120}
                  placeholder="Enter Route Name"
                  value={payload.EnterRoute}
                  onChange={handleInputChange}
                />
              </div>
                )}
              {!isSearch && (
              <div className="col-12 col-sm-6 col-md-2 my-1"> 
                <SaveButton
                  text={loading ? (payload.existingRoute ? "Updating..." : "Saving...") : (payload.existingRoute ? "Update" : "Save")}
                  onClick={handleSave}
                  disabled={loading || !payload.EnterRoute}
                />
              </div>
              )}
              <div className="col-12 col-sm-6 col-md-2 my-1"> 
                 {isSearch && (
                <SearchButton
                  text={loading ? "Searching..." : "Search"}
                  onClick={handleSearch}
                />
                 )}
              </div>
              {/* <div className="col-12 col-sm-6 col-md-2">
                <ReactSelect
                  dynamicOptions={routeOptions}
                  name="existingRoute"
                  id="existingRoute"
                  label="Select Route"
                  placeholderName="Select Existing Route"
                  value={payload?.existingRoute}
                  removeIsClearable={true}
                  onChange={handleSelectChange}
                />
              </div> */}
              {/* <div className="col-12 col-sm-6 col-md-auto"> 
                <CustomButton
                  text={loading ? "Loading..." : "Edit Route"}
                  onClick={handleEditRoute}
                  disabled={loading || !payload.existingRoute}
                />
              </div> */}
            </div>
          </div>
        </div>
      

      {!isSearch && tableData.length > 0 && (
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
                      <th style={{ minWidth: '60px' }}>{t("S.No")}</th>
                      <th style={{ minWidth: '80px' }}>{t("Priority")}</th>
                      <th style={{ minWidth: '120px' }}>{t("Rate Type")}</th>
                      <th style={{ minWidth: '200px' }}>{t("Centre")}</th>

                      {rounds.map((round, index) => (
                        <th key={round} style={{ minWidth: '150px', textAlign: 'center' }}>
                          <div className="d-flex flex-column align-items-center">

                            <div className="mb-2">
                              <span style={{ fontSize: '14px' }}>
                                {roundLabels[round]}
                              </span>
                            </div>


                            <div className="d-flex justify-content-center gap-1 flex-wrap mb-2">
                              {days.map(day => {
                                const isSelected = selectedDaysByRound[round].includes(day.key);
                                return (
                                  <button
                                    key={day.key}
                                    type="button"
                                    className={`btn btn-sm text-white ${isSelected ? 'btn-primary' : 'btn-outline-secondary'}`}
                                    onClick={() => toggleDaySelection(round, day.key)}
                                    title={day.fullName}
                                    style={{
                                      minWidth: '30px',
                                      padding: '2px 5px',
                                      fontSize: '12px',
                                      position: 'relative'
                                    }}
                                  >
                                    {day.label}
                                    {isSelected && (
                                      <span
                                        style={{
                                          position: 'absolute',
                                          top: '-2px',
                                          right: '-2px',
                                          fontSize: '8px',
                                          color: 'white',
                                          backgroundColor: '#28a745',
                                          borderRadius: '50%',
                                          width: '12px',
                                          height: '12px',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center'
                                        }}
                                      >
                                        ✓
                                      </span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>

                            <div className="mt-1">
                              <span className={`badge ${getSelectedDaysCount(round) > 0 ? 'bg-info' : 'bg-secondary'}`}>
                                {getSelectedDaysSummary(round)}
                              </span>
                            </div>
                          </div>
                        </th>
                      ))}

                      <th style={{ minWidth: '80px' }}>{t("Action")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((data, index) => (
                      <tr key={data.id} style={{ backgroundColor: data.isDropLocation ? '#dedede' : 'white' }}>
                        <td data-title={t("S.No")} style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                          {index + 1}
                        </td>
                        <td data-title={t("Priority")} style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                          <span className={`d-flex justify-content-center align-items-center badge ${data.isDropLocation ? 'bg-green' : 'bg-red'}`} style={{ fontSize: '14px', padding: '6px 12px', gap: '5px' }}>
                            {data.priority}
                          {data.isDropLocation ? <i class="bi bi-truck-flatbed mb-0"></i> : <i class="bi bi-truck mb-0"></i>}
                          </span>
                        </td>
                        <td data-title={t("Panel Code")} style={{ verticalAlign: 'middle' }}>
                          <div className="fw-bold" style={{ color: '#2c3e50' }}>
                            {data?.rateTypeName}
                          </div>
                        </td>
                        <td data-title={t("Panel")} style={{ verticalAlign: 'middle' }}>
                          <div className="fw-bold" style={{ color: '#2980b9' }}>
                            {data.rateTypeName}
                          </div>
                        </td>

                        {rounds.map(round => (
                          <td key={round} >
                            {getSelectedDaysCount(round) > 0 ? (
                             <div className=" my-1">
                                <ReactSelect
                                  dynamicOptions={getFilteredTimeOptions(data, round)}
                                  name="timeSlot"
                                  lable="Select Time"
                                  placeholderName=""
                                  removeIsClearable={true}
                                  id={`timeSlot-${data.id}-${round}`}
                                  value={data.timeSlots[round]}
                                  onChange={(name, value) =>
                                    handleTimeSlotChange(data.id, round, value || "")
                                  }
                                />
                              </div>
                            ) : (
                              <div className="text-center py-2">
                                <span className="text-muted small">
                                  Select days above
                                </span>
                              </div>
                            )}
                          </td>
                        ))}

                        <td data-title={t("Action")} style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteRow(data.id)}
                            title="Delete Row"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Tables>
              </div>
            </div>
          </div>
        </Accordion>
      )}

      {!isSearch && tableData.length === 0 && (
        <div className="card mt-3">
          <div className="card-body text-center">
            <NoRecordFound />
            <p className="text-muted mt-2">No rate types added yet. Select a rate type and click "Add" to get started.</p>
          </div>
        </div>
      )}

      {/* Search Results Table */}
      {isSearch && (
        <Accordion title={t("Search Results")} defaultValue={true}>
            <div className="row p-2">
                <div className="table-responsive" style={{ maxHeight: "500px", overflowY: "auto" }}>
                {searchData.length > 0 ? (
                    <Tables>
                      <thead>
                        <tr>
                            <th>{t("S.No")}</th>
                            <th>{t("Route Name")}</th>
                            <th>{t("Pickup Location")}</th>
                            <th>{t("Drop Location")}</th>
                            <th>{t("Day")}</th>
                            <th>{t("Priority")}</th>
                            <th>{t("Created By")}</th>
                            <th>{t("Created On")}</th>
                            <th>{t("Updated By")}</th>
                            <th>{t("Updated On")}</th>
                            <th>{t("Action")}</th>
                        </tr>
                      </thead>
                      <tbody>
                            {searchData.map((row, index) => (
                                <tr key={index}>
                                    <td data-title={t("S.No")}>{index + 1}</td>
                                    <td data-title={t("Route Name")}>{row.RouteName}</td>
                                    <td data-title={t("Pickup Location")}>{row.PickupLocation}</td>
                                    <td data-title={t("Drop Location")}>{row.DropLocation}</td>
                                    <td data-title={t("Day")}>{row.Day}</td>
                                    <td data-title={t("Priority")}>{row.Priority}</td>
                                    <td data-title={t("Created By")}>{row.CreatedByName}</td>
                                    <td data-title={t("Created On")}>{row.dtEntry}</td>
                                    <td data-title={t("Updated By")}>{row.UpdatedByName || "-"}</td>
                                    <td data-title={t("Updated On")}>{row.dtUpdate || "-"}</td>
                                    <td data-title={t("Action")}>
                                        <button
                                            className="btn btn-sm btn-primary"
                                            onClick={() => handleEditSearchRow(row.RouteId)}
                                        >
                                            <i className="fa fa-edit"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Tables>
                ) : (
                    <NoRecordFound />
                )}
                </div>
            </div>
        </Accordion>
      )}
    </>
  );
};

export default LogisticRouteMaster;