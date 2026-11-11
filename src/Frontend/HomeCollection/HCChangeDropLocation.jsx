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
import { axiosInstance } from "../../utils/axiosInstance";
import { EditButton, SearchButton } from "../../components/UI/CustomButton";
const HomeCollectionChangeDropLocation = () => {
  const [location, setLocation] = useState([]); // this state is used for setting
  const [loading, setLoading] = useState(false); // This state is used for setting loading screen
  const [errors, setErros] = useState({}); // This state is used for setting errors
  const [searchData, setSearchData] = useState({
    FromDate: new Date(),
    ToDate: new Date(),
    mobile: "",
  }); // this state is used for handling search data
  const [phleboTable, setPhleboTable] = useState(null); // This state is used for setting phelbos after fetching api
  const [newlist, setNewlist] = useState([]); // payload for updating phelbo details

  // for trnslation
  const { t } = useTranslation();

  //for fetching buisness zones
  const fetchBuisnessZone = () => {
    axiosInstance
      .get("CommonHC/GetZoneData")
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
        console.log(err);
        toast.error("Something went wrong");
      });
  };

  // fetching state based on zone
  const fetchStates = (value) => {
    console.log("xone value", value);
    axiosInstance
      .post("CommonHC/GetStateData", {
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
        console.log(err);
        toast.error("Something went wrong");
      });
  };

  // fetching cities based on state
  const fetchCities = (id) => {
    const postdata = {
      StateId: [Number(id ?? 0)],
    };
    axiosInstance
      .post("CommonHC/GetCityData", postdata)
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
      .catch((err) => {
        console.log(err);
      });
  };
  // fetching phelbo based on city
  const fetchphelbo = (value) => {
    axiosInstance
      .post("PhelebotomistMaster/BindPhelebo", {
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
      .catch((err) => {
        console.log(err);
      });
  };

  //used for spliting cityid because cityid comes in diffrent formate
  const handleSplitData = (id) => {
    const data = id.split("#")[0];
    return data;
  };

  // fething buisnesszone on first render
  useEffect(() => {
    fetchBuisnessZone();
  }, []);

  // dynamically managing selected option in state
  const handleSelectChange = async (name,event) => {
    const {value } = event;
    console.log("value",value);
    if (
      name === "StateId" ||
      name === "CityId" ||
      name === "BusinessZoneID" ||
      name === "Phlebotomist"
    ) {
      if (name === "BusinessZoneID") {
        if (value?.toString().trim() == "") {
          setLocation({ ...location, States: [], City: [], phelbo: [] }); //To remove dropdown list options
          setSearchData({
            ...searchData,
            [name]: value,
            StateId: "",
            CityId: "",
            Phlebotomist: "",
          }); //To remove value from state
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
    }
  };

  //fetch droplocation
  const fetchDroplocation = async (id) => {
    try {
      const response = await axiosInstance.post(
        "HCLocation/GetDropLocationList",
        {
          RouteId: id,
        },
      );

      if (response.data.message) {
        const updatedArray = response.data.message.map((item) => ({
          value: item.CentreId,
          label: item.Centre,
        }));

        return updatedArray;
      } else {
        return []; // Return an empty array or handle the absence of data.
      }
    } catch (error) {
      console.error("Error in fetchDroplocation:", error);
      return []; // Handle errors gracefully by returning an empty array.
    }
  };

  const updatedDropLocation = async (id, value) => {
    try {
      const newDropArray = await fetchDroplocation(value);
      if (newDropArray.length > 0) {
        const find = phleboTable.find((item) => item.PreBookingId === id);
        const filtered = find?.routeArray.filter((x) => x.value == value);
        const newData = newlist.map((item) => {
          if (item.PreBookingId === id) {
            return { ...item, RouteId: value, RouteName: filtered[0]?.label };
          }
          return item;
        });
        setNewlist(newData);
        const updatedArray = phleboTable.map((item) => {
          if (item.PreBookingId == id) {
            return { ...item, dropArray: newDropArray, RouteId: value };
          }
          return item; // Return the unchanged item for other elements
        });
        setPhleboTable(updatedArray);
      } else {
        toast.error("No Drop Location Available for this route");
      }
    } catch (error) {}
  };

  // handling drop selection in table for route and drop location
  const handleDropChange = (event, id) => {
    const { name, value, checked, type, label } = event?.target;

    if (name === "route") {
      updatedDropLocation(id, value);
    }
    if (name === "dropLocation") {
      const updatedData = phleboTable.map((item) => {
        if (item.PreBookingId === id) {
          return { ...item, CentreId: value, DropLocation: value };
        }
        return item;
      });
      setPhleboTable(updatedData);

      const newData = newlist.map((item) => {
        if (item.PreBookingId === id) {
          return {
            ...item,
            CentreId: value,
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
  // dynamically setting search data ToDate: updateDate
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchData((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  // handling checkboxes in phelbo table to show routes and phelbo
  const handleCheckboxChange = (id, DropLocation, RouteName, RouteId) => {
    console.log("id, DropLocation, RouteName, RouteId",id, DropLocation, RouteName, RouteId);
    const updatedData = [...phleboTable];
    const index = updatedData.findIndex((item) => item.PreBookingId === id);
    if (index !== -1) {
      updatedData[index].checked = !updatedData[index].checked;
      setPhleboTable(updatedData);

      // Add or remove the item from the selectedItems state based on checkbox status
      if (updatedData[index].checked) {
        setNewlist((prevSelectedItems) => [
          ...prevSelectedItems,
          {
            CentreId: DropLocation,
            RouteName: RouteName,
            RouteId: RouteId,
            PreBookingId: id,
          },
        ]);
      } else {
        setNewlist((prevSelectedItems) =>
          prevSelectedItems.filter((item) => item.PreBookingId !== id),
        );
      }
    }
  };

  const handleSave = () => {
    const UpdateDropLocation = newlist;
    if (Object.keys(UpdateDropLocation).length === 0) {
      toast.warn("Select a row to update");
    } else {
      axios
        .post("api/v1/HCLocation/UpdateDropLocation", { UpdateDropLocation })
        .then((res) => {
          setPhleboTable(null);
          handleSearch();
          toast.success("Saved Successfully");
        })
        .catch((err) => {
          toast.error(err?.res?.data ? err?.res?.data : "Something went wrong");
          console.log(err);
        });
    }

    setNewlist([]);
  };

  const handleSearch = async () => {
    const generatedError = searchValidation(searchData);
    setLoading(true);
    if (generatedError === "") {
      await axios
        .post("api/v1/HCLocation/GetHCChangeDropLocation", {
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
          if (res.data.message) {
            setLoading(false);
            const updatedArray = await Promise.all(
              res?.data?.message.map(async (item) => ({
                ...item,
                checked: false,
                routeArray: handleSplitDataRoute(item.RouteList),
                dropArray: await fetchDroplocation(item.RouteId),
                DropLocationNew: handleSplitData(item.DropLocation),
                DropLocation: await handleDropAvailability(
                  item.DropLocation,
                  item.RouteId,
                ),
              })),
            );
            setPhleboTable(updatedArray);
            //toast.success('Found Details');
          }
        })
        .catch((err) => {
          setLoading(false);
          console.log(err);
          setPhleboTable(null);
          toast.error(err?.res?.data ? err?.res?.data : "No record found");
        });
    }
    setErros(generatedError);
    setLoading(false);
  };

  //pending for saving empty routes
  const handleDropAvailability = async (id, rid) => {
    const array = await fetchDroplocation(rid);
    const newDrop = await array.filter((ele) => ele.value == id);
    console.log(array, id, newDrop);

    return id;
  };

  //splitting data for route
  const handleSplitDataRoute = (data) => {
    if (data === null) {
      const formattedDataArray = [];
      return formattedDataArray;
    } else {
      const splitData = data.split(",");
      const formattedDataArray = splitData.map((item) => {
        const [value, label] = item.split("#");
        return { value: parseInt(value), label };
      });
      return formattedDataArray;
    }
  };

  console.log("searchData",searchData);

  // const handleClear = () => {
  //     setPhleboTable(null)
  //     setSearchData({
  //         FromDate: new Date(),
  //         ToDate: new Date(),
  //         mobile: "",
  //         PrebookingID: "",
  //         BuisnessZoneId: "0",
  //         StateId: "",
  //         CityId: "",
  //         Phlebotomist: "",
  //     })
  //     setNewlist([])
  // }

  return (
    <>
      <Accordion
        name={t("Home Collection Change DropLocation")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row  pt-2 pl-2 pr-2 mb-1">
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
              name="BusinessZoneID"
                removeIsClearable={true}
                placeholderName={t("Zone")}
                value={searchData?.BusinessZoneID}
                onChange={handleSelectChange}
              />
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
                    <th className="text-center">{t("Pelbo")}</th>
                    <th className="text-center">{t("App. Date")}</th>
                    <th className="text-center">{t("Status")}</th>
                    <th className="text-center">{t("PreBooking ID")}</th>
                    <th className="text-center">{t("Mobile No")}</th>
                    <th className="text-center">{t("Patient Name")}</th>
                    <th className="text-center">{t("City")}</th>
                    <th className="text-center">{t("Locality")}</th>
                    <th className="text-center">{t("Pincode")}</th>
                    <th className="text-center">{t("Route")}</th>
                    <th className="text-center">{t("Drop Location")}</th>
                  </tr>
                </thead>
                <tbody>
                  {phleboTable &&
                    phleboTable.map((ele, index) => (
                      <>
                        <tr key={ele.PreBookingId}>
                          <td data-title="#" className="text-center">
                            {index + 1} &nbsp;{" "}
                            <input
                              type="checkbox"
                              onClick={() =>
                                handleCheckboxChange(
                                  ele.PreBookingId,
                                  ele.DropLocation,
                                  ele.RouteName,
                                  ele.RouteId,
                                  ele.RouteName,
                                  ele?.RouteID,
                                  ele.Phleboname,
                                  ele.PhlebotomistID,
                                )
                              }
                            />
                          </td>
                          <td data-title="Phelbo" className="text-center">
                            {ele.PhleboName}&nbsp;
                          </td>
                          <td data-title="App. Date" className="text-center">
                            {ele.AppDate}&nbsp;
                          </td>
                          <td data-title="Status" className="text-center">
                            {ele.CurrentStatus}&nbsp;
                          </td>
                          <td data-title="PreBookingId" className="text-center">
                            {ele.PreBookingId}&nbsp;
                          </td>
                          <td data-title="Mobile no" className="text-center">
                            {ele.MobileNo}&nbsp;
                          </td>
                          <td data-title="Patient Name" className="text-center">
                            {ele.PatientName}&nbsp;
                          </td>
                          <td data-title="City" className="text-center">
                            {ele.City}&nbsp;
                          </td>
                          <td data-title="Area" className="text-center">
                            {ele.Locality}&nbsp;
                          </td>
                          <td data-title="Pincode" className="text-center">
                            {ele.PinCode}&nbsp;
                          </td>
                          <td data-title="Routes" className="text-center">
                            <SelectBox
                              className="form-control input-sm"
                              name="route"
                              onChange={(e) =>
                                handleDropChange(e, ele.PreBookingId)
                              }
                              isDisabled={!ele.checked}
                              selectedValue={ele.RouteId}
                              options={ele?.routeArray}
                              //options={[{ label: 'Select Route', value: '' }, ...ele?.routeArray]}
                            />
                          </td>
                          <td
                            data-title="Drop Location"
                            className="text-center"
                          >
                            <SelectBox
                              className="form-control input-sm"
                              name="dropLocation"
                              onChange={(e) =>
                                handleDropChange(e, ele.PreBookingId)
                              }
                              isDisabled={!ele.checked}
                              selectedValue={ele.DropLocation}
                              options={ele?.dropArray}
                              //options={[{ label: 'Select DropLocation', value: '' }, ...ele?.dropArray]}
                            />
                          </td>
                        </tr>
                      </>
                    ))}
                </tbody>
              </Tables>
            </>
          )}

          <div className="row mt-2 mb-1">
            <div className="col-sm-5 col-xs-12"></div>
            <div className="col-sm-2 col-xs-12">
              <EditButton
                text={"Update"}
                onClick={handleSave}
                className="col-sm-12"
              />
            </div>
          </div>
        </Accordion>
      )}
    </>
  );
};

export default HomeCollectionChangeDropLocation;

const searchValidation = (formData) => {
  let err = "";

  if (formData?.mobile != "" && formData?.mobile.length != 10) {
    err = { ...err, mobile: "Please enter Valid Mobile no." };
  }
  return err;
};
