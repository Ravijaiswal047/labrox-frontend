import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import moment from "moment";
import DatePicker from "../../components/formComponent/DatePicker";
import Accordion from "@app/components/UI/Accordion";
import Input from "../../components/formComponent/Input";
import { SelectBox } from "../../components/formComponent/SelectBox";
import Tables from "../../components/UI/customTable";
import Loading from "../../components/loader/Loading";
import { number } from "../../utils/helpers";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { CustomButton, EditButton, SearchButton } from "../../components/UI/CustomButton";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
const HomeCollectionChangePhlebotomist = () => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErros] = useState({});
  const [searchData, setSearchData] = useState({
    FromDate: new Date(),
    ToDate: new Date(),
    mobile: "",
    PrebookingID: "",
    BusinessZoneId: "",
    StateId: "",
    CityId: "",
    Phlebotomist: "",
  });
  const [phleboTable, setPhleboTable] = useState(null); // This state is used for setting phelbos after fetching api
  const [droplocation, setDropLocation] = useState([]); // this state is used for saving drop
  const [newlist, setNewlist] = useState([]); // payload for updating phelbo details

  console.log("Search data", searchData)
  // for trnslation
  const { t } = useTranslation();

  //for fetching buisness zones
  const fetchBuisnessZone = () => {
    axios
      .get("api/v1/CommonHC/GetZoneData")
      .then((res) => {
        let data = res.data.message;
        let value = data.map((ele) => {
          return {
            value: ele.BusinessZoneID,
            label: ele.BusinessZoneName,
            id: ele.BusinessZoneID,
          };
        });
        setLocation({ ...location, BuisnessZone: value });
      })
      .catch((err) => {
        toast.error("Something went wrong");
      });
  };

  // fetching state based on zone
  const fetchStates = (value) => {
    axios
      .post("api/v1/CommonHC/GetStateData", {
        BusinessZoneID: value,
      })
      .then((res) => {
        let data = res.data.message;
        let value = data.map((ele) => {
          return {
            value: ele.ID,
            label: ele.State,
            id: ele.ID,
          };
        });
        setLocation({ ...location, States: value });
      })
      .catch((err) => {
        toast.error("Something went wrong");
      });
  };

  // fetching cities based on state
  const fetchCities = (id) => {
    const postdata = {
      StateId: [Number(id ?? 0)],
    };
    axios
      .post("api/v1/CommonHC/GetCityData", postdata)
      .then((res) => {
        let data = res.data.message;
        let value = data.map((ele) => {
          return {
            value: handleSplitData(ele.ID),
            label: ele.City,
          };
        });
        setLocation({ ...location, City: value });
      })
      .catch((err) => {});
  };
  // fetching phelbo based on city
  const fetchphelbo = (value) => {
    axios
      .post("api/v1/PhelebotomistMaster/BindPhelebo", {
        CityId: value,
      })
      .then((res) => {
        let data = res.data.message;
        let value = data.map((ele) => {
          return {
            value: ele.PhlebotomistId,
            label: ele.NAME,
          };
        });
        setLocation({ ...location, phelbo: value });
      })
      .catch((err) => {});
  };

  //used for spliting cityid because cityid comes in diffrent formate
  const handleSplitData = (id) => {
    const data = id.split("#")[0];
    return data;
  };

  // fething buisnesszone on first render
  useEffect(() => {
    fetchBuisnessZone();
    fetchDroplocation();
  }, []);

  // dynamically managing selected option in state
  const handleSelectChange = async (name,event) => {
    const { value } = event;

    console.log({name,value})
    // if (
    //   name === "StateId" ||
    //   name === "CityId" ||
    //   name === "BuisnessZoneId" ||
    //   name === "Phlebotomist"
    // ) {
      if (name === "BusinessZoneId") {
        if (value?.toString().trim() == "") {
          setLocation({ ...location, States: [], City: [], phelbo: [] });
          setSearchData({
            ...searchData,
            [name]: value,
            StateId: "",
            CityId: "",
            Phlebotomist: "",
          });
        } else {
          setSearchData({
            ...searchData,
            [name]: value,
            StateId: "",
            CityId: "",
            Phlebotomist: "",
          });
          fetchStates(value);
        }
      }
      if (name === "StateId") {
        if (value?.toString().trim() == "") {
          setLocation({ ...location, City: [], phelbo: [] });
          setSearchData({
            ...searchData,
            [name]: value,
            CityId: "",
            Phlebotomist: "",
          });
        } else {
          setSearchData({
            ...searchData,
            [name]: value,
            CityId: "",
            Phlebotomist: "",
          });
          fetchCities(value);
        }
      }
      if (name === "CityId") {
        if (value?.toString().trim() == "") {
          setLocation({ ...location, phelbo: [] });
          setSearchData({ ...searchData, [name]: value, Phlebotomist: "" });
        } else {
          setSearchData({ ...searchData, [name]: value, Phlebotomist: "" });
          fetchphelbo(value);
        }
      }
      if (name === "Phlebotomist") {
        setSearchData({ ...searchData, [name]: value });
      }
    // }
  };

  //fetch droplocation
  const fetchDroplocation = async (id, data) => {
    const timeAppDate = data && data.split(" ").slice(1, 3).join(" ");
    const time24 = moment(timeAppDate, "hh:mm A").format("HH:mm");
    try {
      const response = await axios.post("api/v1/HCLocation/ChangePhelebo", {
        RouteId: id,
        AppDate: data,
      });

      if (response.data.message) {
        const update = response.data.message.filter((item) => {
          const timeAppDate = data.split(" ").slice(1, 3).join(" ");
          const time24 = moment(timeAppDate, "hh:mm A").format("HH:mm");
          const format = "HH:mm";
          const startTime = moment(item?.LoginTime, format);
          const endTime = moment(item?.LogoutTime, format);
          const inputTime = moment(time24, format);
          console.log(item);

          return inputTime.isBetween(startTime, endTime, null, "[]");
        });

        const finalOutput = update.map((item) => ({
          value: item.id,
          label: item.Name,
        }));
        console.log(update);
        console.log(response.data.message);
        console.log(finalOutput);
        return finalOutput;
      } else {
        return []; // Return an empty array or handle the absence of data.
      }
    } catch (error) {
      return []; // Handle errors gracefully by returning an empty array.
    }
  };

  const updatedPhelbo = async (id, value, appdate) => {
    try {
      const newDropArray = await fetchDroplocation(value, appdate);
      if (newDropArray.length > 0) {
        const find = phleboTable.find((item) => item.PreBookingID === id);
        const filtered = find?.routeArray.filter((x) => x.value == value);
        const newData = newlist.map((item) => {
          if (item.id === id) {
            return { ...item, RouteId: value, RouteName: filtered[0].label };
          }
          return item;
        });
        setNewlist(newData);
        const updatedArray = phleboTable.map((item) => {
          if (item.PreBookingID == id) {
            return { ...item, phelboArray: newDropArray, RouteId: value };
          }
          return item;
        });
        setPhleboTable(updatedArray);
      } else {
        toast.error("No Phelbo Available for this route");
      }
    } catch (error) {}
  };

  // handling drop selection in table for route and drop location
  const handleDropChange = (event, id, appdate, time, login, logout) => {
    const { name, value, checked, type, label } = event?.target;

    if (name === "route") {
      updatedPhelbo(id, value, appdate);
    }
    if (name === "dropLocation") {
      const updatedData = phleboTable.map((item) => {
        if (item.PreBookingID === id) {
          return { ...item, PhlebotomistID: value };
        }
        return item;
      });
      setPhleboTable(updatedData);
      const filterdId = updatedData.filter((x) => x.PreBookingID == id);
      const checkedArray = filterdId[0]?.phelboArray;
      const filtered = checkedArray.filter((x) => x.value == value);
      const newData = newlist.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            PhlebotomistId: value,
            PheleboName: filtered[0].label,
          };
        }
        return item;
      });
      setNewlist(newData);
    }
  };

  // dynamically setting data value in state
  const dateSelect = (date, name, value) => {
    if (name === "FromDate") {
      const updateDate =
        new Date(searchData?.ToDate) - date < 0 ? date : searchData.ToDate;
      setSearchData({ ...searchData, [name]: date, ToDate: updateDate });
    } else {
      setSearchData({ ...searchData, [name]: date });
    }
  };

  // dynamically setting search data
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchData((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  // handling checkboxes in phelbo table to show routes and phelbo
  const handleCheckboxChange = (
    id,
    route,
    dropLocation,
    centerID,
    Routename,
    RouteID,
    Phelboname,
    PhelbotomistID,
  ) => {
    const updatedData = [...phleboTable];
    const index = updatedData.findIndex((item) => item.PreBookingID === id);
    if (index !== -1) {
      updatedData[index].checked = !updatedData[index].checked;
      setPhleboTable(updatedData);
      // Add or remove the item from the selectedItems state based on checkbox status
      if (updatedData[index].checked) {
        setNewlist((prevSelectedItems) => [
          ...prevSelectedItems,
          {
            id: id,
            CentreId: centerID,
            RouteName: Routename,
            RouteId: RouteID,
            PreBookingId: id,
            PhlebotomistId: PhelbotomistID,
            PheleboName: Phelboname,
          },
        ]);
      } else {
        setNewlist((prevSelectedItems) =>
          prevSelectedItems.filter((item) => item.id !== id),
        );
      }
    }
  };
  console.log(newlist);
  const handleSave = () => {
    const UpdatePhelebo = newlist;
    if (Object.keys(UpdatePhelebo).length === 0) {
      toast.warn("Select a row to update");
    } else {
      axios
        .post("api/v1/PhelebotomistMapping/UpdateHCChangePheleboData", {
          UpdatePhelebo,
        })
        .then((res) => {
          setPhleboTable(null);
          handleSearch();
          toast.success("Saved Successfully");
        })
        .catch((err) => {
          toast.error(err?.res?.data ? err?.res?.data : "Something went wrong");
        });
    }
    setNewlist([]);
  };

  const handleSearch = async () => {
    const generatedError = searchValidation(searchData);
    setLoading(true);
    if (generatedError === "") {
      await axios
        .post("api/v1/PhelebotomistMapping/GetHCChangePheleboData", {
          FromDate: moment(searchData?.FromDate).format("DD/MMM/YYYY"),
          ToDate: moment(searchData?.ToDate).format("DD/MMM/YYYY"),
          CityId: searchData?.CityId || "",
          StateId: searchData?.StateId?.toString() || "",
          MobileNo: searchData?.mobile || "",
          PreBookingId: searchData?.PrebookingID || "",
          PhlebotomistId: searchData?.Phlebotomist?.toString() || "",
          RouteId: "",
        })
        .then(async (res) => {
          if (res.data?.success && Array.isArray(res.data.message)) {
            setLoading(false);
            const updatedArray = await Promise.all(
              res?.data?.message.map(async (item) => ({
                ...item,
                checked: false,
                routeArray: handleSplitDataRoute(item.routelist),
                phelboArray: await fetchDroplocation(
                  item?.RouteId,
                  item?.AppDate,
                ),
              })),
            );
            setPhleboTable(updatedArray);
            //toast.success('Found Details');
          } else {
            setPhleboTable([])
            toast.error(res.data?.message || "No Record Found")
          }
        })
        .catch((err) => {
          setLoading(false);
          setPhleboTable(null);
          toast.error(err?.res?.data ? err?.res?.data : "No record found");
        });
    }
    setErros(generatedError);
    setLoading(false);
  };

  //splitting data for route
  const handleSplitDataRoute = (data) => {
    const splitData = data.split(",");

    const formattedDataArray = splitData.map((item) => {
      const [value, label] = item.split("#");
      return { value: parseInt(value), label };
    });

    return formattedDataArray;
  };

  const handleClear = () => {
    setPhleboTable(null);
    setSearchData({
      FromDate: new Date(),
      ToDate: new Date(),
      mobile: "",
      PrebookingID: "",
      BuisnessZoneId: "0",
      StateId: "",
      CityId: "",
      Phlebotomist: "",
    });
    setNewlist([]);
  };

  return (
    <>
      <Accordion
        name={t("Home Collection Change Phlebotomist")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row pt-2 pl-2 pr-2 mb-1 ">
          <div className="col-sm-2">
            <DatePicker
              className="custom-calendar required-fields"
              id="FromDate"
              lable="FromDate"
              placeholder=" "
              name="FromDate"
              value={
                searchData?.FromDate
                  ? new Date(searchData?.FromDate)
                  : new Date()
              }
              onChange={dateSelect}
            />
            {searchData?.FromDate === "" && (
              <span className="error-message">{errors?.FromDate}</span>
            )}
          </div>

          <div className="col-sm-2">
            <DatePicker
              className="custom-calendar required-fields"
              id="ToDate"
              lable="ToDate"
              placeholder=" "
              name="ToDate"
              value={
                searchData?.ToDate ? new Date(searchData?.ToDate) : new Date()
              }
              minDate={searchData?.FromDate}
              onChange={dateSelect}
            />
            {searchData?.ToDate === "" && (
              <span className="error-message">{errors?.ToDate}</span>
            )}
          </div>

          <div className="col-sm-2">
            <Input
              type="number"
              name="mobile"
              onInput={(e) => number(e, 10)}
              value={searchData?.mobile}
              lable="Mobile"
              id="Mobile"
              placeholder=" "
              onChange={handleChange}
            />
            {searchData?.mobile != "" && searchData?.mobile.length != 10 && (
              <span className="error-message">{errors?.mobile}</span>
            )}
          </div>

          <div className="col-sm-2">
            <Input
              type="number"
              name="PrebookingID"
              onInput={(e) => number(e, 20)}
              value={searchData?.PrebookingID}
              lable="PrebookingID"
              id="PrebookingID"
              placeholder=" "
              onChange={handleChange}
            />
          </div>
          <div className="col-sm-2">
            {/* <SelectBox
              id="Zone"
              lable="Zone"
              name="BuisnessZoneId"
              onChange={handleSelectChange}
              selectedValue={searchData?.BusinessZoneId}
              options={[
                { label: "Select Zone", value: "" },
                ...(location?.BuisnessZone ?? []),
              ]}
            /> */}
            <ReactSelect
                dynamicOptions={[
                { label: "Select Zone", value: "" },
                ...(location?.BuisnessZone ?? []),
              ]}
                id="Zone"
              lable="Zone"
              name="BusinessZoneId"
              onChange={handleSelectChange}
                removeIsClearable={true}
                placeholderName={t("Zone")}
                value={searchData?.BusinessZoneId}
                
              />
            {searchData?.StateId === "" && (
              <span className="error-message">{errors?.StateId}</span>
            )}
          </div>

          <div className="col-sm-2">
            {/* <SelectBox
              id="State"
              lable="State"
              name="StateId"
              onChange={handleSelectChange}
              selectedValue={searchData?.StateId}
              options={[
                { label: "Select State", value: "" },
                ...(location?.States ?? []),
              ]}
            /> */}
             <ReactSelect
                dynamicOptions={[
                { label: "Select State", value: "" },
                ...(location?.States ?? []),
              ]}
                id="State"
              lable="State"
              name="StateId"
              onChange={handleSelectChange}
                removeIsClearable={true}
                placeholderName={t("State")}
                value={searchData?.StateId}
                
              />
            {searchData?.StateId === "" && (
              <span className="error-message">{errors?.StateId}</span>
            )}
          </div>
        </div>
        <div className="row pl-2 pr-2 mb-1">
          <div className="col-sm-2">
            {/* <SelectBox
              name="CityId"
              id="City"
              lable="City"
              onChange={handleSelectChange}
              selectedValue={searchData?.CityId}
              options={[
                { label: "Select City", value: "" },
                ...(location?.City ?? []),
              ]}
            /> */}
            <ReactSelect
                dynamicOptions={[
                { label: "Select City", value: "" },
                ...(location?.City ?? []),
              ]}
                name="CityId"
              id="City"
              lable="City"
              onChange={handleSelectChange}
                removeIsClearable={true}
                placeholderName={t("City")}
                value={searchData?.CityId}
                
              />
            {searchData?.CityId === "" && (
              <span className="error-message">{errors?.CityId}</span>
            )}
          </div>
          <div className="col-sm-2">
            {/* <SelectBox
              id="Phlebotomist"
              lable="Phlebotomist"
              name="Phlebotomist"
              onChange={handleSelectChange}
              selectedValue={searchData?.Phlebotomist}
              options={[
                { label: "Select ", value: "" },
                ...(location?.phelbo ?? []),
              ]}
            /> */}
            <ReactSelect
                dynamicOptions={[
                { label: "Select ", value: "" },
                ...(location?.phelbo ?? []),
              ]}
                id="Phlebotomist"
              lable="Phlebotomist"
              name="Phlebotomist"
              onChange={handleSelectChange}
                removeIsClearable={true}
                placeholderName={t("Phlebotomist")}
                value={searchData?.Phlebotomist}
                
              />
            {searchData?.Phlebotomist === "" && (
              <span className="error-message">{errors?.Phlebotomist}</span>
            )}
          </div>
          <div className="col-sm-1">
            {/* <button
              type="button"
              className="btn btn-block btn-success btn-sm"
              onClick={handleSearch}
            >
              {t("Search")}
            </button> */}
            <SearchButton
                text={"Search"}
                onClick={handleSearch}
            />
          </div>
        </div>
      </Accordion>
      {loading && !phleboTable && <Loading />}
      {phleboTable && (
        <Accordion title={t("Search Details")} defaultValue={true}>
          {loading ? (
            <Loading />
          ) : (
            <>
              <Tables>
                <thead className="cf text-center" style={{ zIndex: 99 }}>
                  <tr>
                    <th className="text-center">{t("#")}</th>
                    <th className="text-center">{t("Drop Location")}</th>
                    <th className="text-center">{t("App Data")}</th>
                    <th className="text-center">{t("Status")}</th>
                    <th className="text-center">{t("PreBooking ID")}</th>
                    <th className="text-center">{t("Mobile No")}</th>
                    <th className="text-center">{t("Patient Name")}</th>
                    <th className="text-center">{t("City")}</th>
                    <th className="text-center">{t("Locality")}</th>
                    <th className="text-center">{t("Pincode")}</th>
                    <th className="text-center">{t("Route")}</th>
                    <th className="text-center">{t("Phelbo")}</th>
                  </tr>
                </thead>
                <tbody>
                  {phleboTable.map((ele, index) => (
                      <tr key={index}>
                        <td data-title="#" className="text-center">
                          {index + 1} &nbsp;{" "}
                          <input
                            type="checkbox"
                            onClick={() =>
                              handleCheckboxChange(
                                ele.PreBookingID,
                                ele.route,
                                ele.dropLocation,
                                ele.cpid,
                                ele.RouteName,
                                ele?.RouteId,
                                ele.Phleboname,
                                ele.PhlebotomistID,
                              )
                            }
                          />
                        </td>
                        <td data-title="Drop Location" className="text-center">
                          {ele.centre}&nbsp;
                        </td>
                        <td data-title="App Date" className="text-center">
                          {ele.AppDate}&nbsp;
                        </td>
                        <td data-title="Status" className="text-center">
                          {ele.currentstatus}&nbsp;
                        </td>
                        <td data-title="PreBookingId" className="text-center">
                          {ele.PreBookingID}&nbsp;
                        </td>
                        <td data-title="mobile no" className="text-center">
                          {ele.MobileNo}&nbsp;
                        </td>
                        <td data-title="PatientName" className="text-center">
                          {ele.PatientName}&nbsp;
                        </td>
                        <td data-title="city" className="text-center">
                          {ele.city}&nbsp;
                        </td>
                        <td data-title="Area" className="text-center">
                          {ele.locality}&nbsp;
                        </td>
                        <td data-title="pincode" className="text-center">
                          {ele.pincode}&nbsp;
                        </td>
                        <td data-title="route" className="text-center">
                          <SelectBox
                            className="form-control input-sm"
                            name="route"
                            onChange={(e) =>
                              handleDropChange(e, ele.PreBookingID, ele.AppDate)
                            }
                            isDisabled={!ele.checked}
                            selectedValue={ele?.RouteId}
                            options={[...ele?.routeArray]}
                          />
                        </td>
                        <td data-title="Phelbo" className="text-center">
                          <SelectBox
                            className="form-control input-sm"
                            name="dropLocation"
                            onChange={(e) =>
                              handleDropChange(
                                e,
                                ele.PreBookingID,
                                ele,
                                ele?.AppDate,
                              )
                            }
                            isDisabled={!ele.checked}
                            selectedValue={ele?.PhlebotomistID}
                            options={ele?.phelboArray}
                          />
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </Tables>
            </>
          )}
          {phleboTable?.length>0 && (
          <div className="row mt-2 mb-1">
            <div className="col-sm-5 col-xs-12"></div>
            <div className="col-sm-2 col-xs-12">
              <EditButton
                  text={"Update"}
                  onClick={handleSave}
                  className="col-12"
              />
            </div>
          </div>
          )}
        </Accordion>
      )}
    </>
  );
};

export default HomeCollectionChangePhlebotomist;

//{ label: 'Select Route', value: '' },
//{ label: 'Select phelbo', value: '' },

const searchValidation = (formData) => {
  let err = "";

  if (formData?.mobile != "" && formData?.mobile.length != 10) {
    err = { ...err, mobile: "Please enter Valid Mobile no." };
  }
  return err;
};
