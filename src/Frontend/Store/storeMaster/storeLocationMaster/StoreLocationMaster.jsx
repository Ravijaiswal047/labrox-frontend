import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Accordion from "../../../../components/UI/Accordion";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import MultiSelctItems from "../../../../components/formComponent/MultiSelctItems";
import Input from "../../../../components/formComponent/Input";
import { Tooltip as ReactTooltip } from "react-tooltip";
import Tables from "../../../../components/UI/customTable";
import {
  getBindCentreNew,
  getBindCentreType,
  getBindCity,
  getBindCountry,
  getBindstate,
  GetZoneData
} from "../../../../utils/NetworkApi/commonApi";
import { toast } from "react-toastify";
import { axiosInstance } from "../../../../utils/axiosInstance";
import { exportToExcel } from "../../../../utils/helpers";
import Modal from "../../../../components/ModalComponent/Modal";
import MapItemModel from "./MapItemModel";
import StoreLocationSIModel from "./StoreLocationSIModel";
import DirectIssueModal from "./DirectIssueModal";
import DirectStockTransferModal from "./DirectStockTransferModal";
import { Form } from "react-bootstrap";
import { CustomButton, SearchButton } from "../../../../components/UI/CustomButton";
import { useLocalStorage } from "../../../../utils/hooks/useLocalStorage";
import { RiFileExcel2Fill } from "react-icons/ri";

const StoreLocationMaster = () => {
  const isMobile = window.innerWidth <= 768;
  const { t } = useTranslation();
  const userdata = useLocalStorage("userData", "get");
  const DefaultCurrencyName = userdata?.DefaultCurrencyName;

  const initialState = {
    CentreType: [],
    BusinessZoneId: [],
    CountryId: "",
    StateId: [],
    CityId: [],
    CentreId: "",
    StoreNotCreated: "0",
    LocationId: "",
    LocationWithCentre: "",
    Location: "",
    IsActive: 1,
    ContactPerson: "",
    ContactPersonNo: "",
    Address: "",
    Email: "",
    AutoSIReceived: "",
    AutoConsumeOn: "",
    CenterName: ""
  };
  const [payload, setPayload] = useState(initialState);
  console.log(payload);
  const [dropDownApis, setDropDownApis] = useState({
    centretypebind: [],
    countrybind: [],
    statebind: [],
    citybind: [],
    centrebind: [],
    BusinessZoneId: [],
  });
  const [tableData, setTableData] = useState([]);
  const [errors, setErrors] = useState({});

  const [citySearch, setCitySearch] = useState("");
  const [filteredCities, setFilteredCities] = useState([]);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [cityIndex, setCityIndex] = useState(0);
  const [selectedCities, setSelectedCities] = useState([]);

  const handlePayloadMultiSelectNumbers = (data) => {
    console.log("Data received:", data);
    if (!Array.isArray(data)) return [];
    return data.map((item) => Number(item?.code));
  };

  const handleSelectChange = (name, value) => {
    const selectedValue = value?.value || "";

    if (name === "CountryId") {

      setPayload((prev) => ({
        ...prev,
        CountryId: selectedValue,
        BusinessZoneId: [],
        StateId: [],
        CityId: [],
        CentreId: ""
      }));

      // Load zones
      GetZoneData(selectedValue, (data) => {
        setDropDownApis((prev) => ({
          ...prev,
          BusinessZoneId: data,
          statebind: [],
          citybind: []
        }));
      });

    } else {

      setPayload((prev) => ({
        ...prev,
        [name]: selectedValue
      }));

    }

    setErrors((prev) => ({
      ...prev,
      [name]: ""
    }));
  };

  const handleSelectMultiChange = (name, select) => {

    if (name === "BusinessZoneId") {

      setPayload((prev) => ({
        ...prev,
        BusinessZoneId: select,
        StateId: [],
        CityId: []
      }));

      getBindstate(
        payload?.CountryId,
        handlePayloadMultiSelectNumbers(select),
        (data) => {
          setDropDownApis((prev) => ({
            ...prev,
            statebind: data,
            citybind: []
          }));
        }
      );
      setSelectedCities([]);
      setCitySearch("");
      setFilteredCities([]);
    }
    if (name === "CentreType") {
      setPayload((prev) => ({ ...prev, [name]: select }));
      getBindCentreNew(
        [],
        handlePayloadMultiSelectNumbers(select),
        payload?.StoreNotCreated,
        (data) => {
          setDropDownApis((prev) => ({ ...prev, centrebind: data }));
        }
      );
    }
    if (name === "StateId") {
      setPayload((prev) => ({
        ...prev,
        StateId: select,
        CityId: []
      }));
      setSelectedCities([]);
      setCitySearch("");
      setFilteredCities([]);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? (checked ? "1" : "0") : value;
    setPayload((prev) => {
      const updatedPayload = { ...prev, [name]: newValue };
      if (name === "StoreNotCreated") {
        if (newValue === "1") {
          getBindCentreNew([], [], newValue, (data) => {
            setDropDownApis((prev) => ({ ...prev, centrebind: data }));
          });
        } else {
          setDropDownApis((prev) => ({ ...prev, centrebind: [] }));
        }
      }
      return updatedPayload;
    });
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleCitySearch = (e) => {
    const value = e.target.value;
    setCitySearch(value);

    const filtered = dropDownApis?.citybind?.filter((item) =>
      item?.city?.toLowerCase().includes(value.toLowerCase())
    );

    setFilteredCities(filtered);
    setShowCityDropdown(true);
  };

  const handleCitySelect = (city) => {
    if (!selectedCities.find((c) => c.id === city.id)) {
      const updated = [...selectedCities, city];

      setSelectedCities(updated);

      setPayload((prev) => ({
        ...prev,
        CityId: updated.map((c) => ({
          code: c.id,
          label: c.city
        }))
      }));
    }

    setCitySearch("");
    setFilteredCities([]);
    setShowCityDropdown(false);
  };



  const handleRemoveCity = (id) => {
    const updated = selectedCities.filter((c) => c.id !== id);

    setSelectedCities(updated);

    setPayload((prev) => ({
      ...prev,
      CityId: updated.map((c) => ({
        code: c.id,
        label: c.city
      }))
    }));
  };

  const handleCityKeyDown = (e) => {
    switch (e.which) {
      case 38:
        setCityIndex(cityIndex === 0 ? filteredCities.length - 1 : cityIndex - 1);
        break;

      case 40:
        setCityIndex(cityIndex === filteredCities.length - 1 ? 0 : cityIndex + 1);
        break;

      case 13:
        if (filteredCities[cityIndex]) {
          handleCitySelect(filteredCities[cityIndex]);
          setCityIndex(0);
        }
        break;

      default:
        break;
    }
  };

  useEffect(() => {
    getBindCentreType((data) => {
      setDropDownApis((prev) => ({ ...prev, centretypebind: data }));
    });

    getBindCountry((data) => {
      setDropDownApis((prev) => ({ ...prev, countrybind: data }));
    });

    // GetZoneData((data) => {
    //   setDropDownApis((prev) => ({ ...prev, BusinessZoneId: data }));
    // });
  }, []);

  useEffect(() => {

    if (Array.isArray(payload?.StateId) && payload.StateId.length > 0) {

      getBindCity(
        handlePayloadMultiSelectNumbers(payload.StateId),
        (data) => {

          setDropDownApis((prev) => ({
            ...prev,
            citybind: data
          }));

        }
      );

    } else {

      setDropDownApis((prev) => ({
        ...prev,
        citybind: []
      }));

    }

  }, [payload?.StateId]);

  useEffect(() => {
    if (payload?.CityId) {
      getBindCentreNew(
        handlePayloadMultiSelectNumbers(payload?.CityId),
        handlePayloadMultiSelectNumbers(payload?.CentreType),
        payload?.StoreNotCreated ?? "0",
        (data) => {

          setDropDownApis((prev) => ({ ...prev, centrebind: data }));
        }
      );
    }
  }, [payload?.CityId]);


  const handleSearch = () => {
    axiosInstance
      .post("InventryManageApprovalStore/searchRecords", {
        centreId: payload?.CentreId ? String(payload?.CentreId) : "",
        stateID: handlePayloadMultiSelectNumbers(payload?.StateId) || [0],
        typeId: handlePayloadMultiSelectNumbers(payload?.CentreType) || [0],
        countryID: String(payload?.CountryId) || "",
        cityId: handlePayloadMultiSelectNumbers(payload?.CityId) || [0],
        BusinessZoneId: handlePayloadMultiSelectNumbers(payload?.BusinessZoneId).join(",")
      })
      .then((res) => {
        if (res?.data?.message) {
          toast.error(res?.data?.message);
          setTableData(res?.data?.message);
        }
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message);
        setTableData([]);
      });
  };
  const ErrorHandling = () => {
    let errors = {};

    const requiredFields = [
      "CentreId",
      "ContactPerson",
      "ContactPersonNo",
      "Address",
      // "Email",
      "AutoSIReceived",
      "Location",
      "ContactPerson",
      "ContactPersonNo",
      "Address",
      "AutoSIReceived"
    ];

    requiredFields.forEach((field) => {
      if (!payload?.[field] || payload[field].toString().trim() === "") {
        errors[field] = "This Field Is Required";
      }
    });

    // // Email Format Validation
    // if (payload?.Email) {
    //   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    //   if (!emailRegex.test(payload.Email)) {
    //     errors.Email = "Invalid Email Format";
    //   }
    // }

    return errors;
  };

  const [isupdate, setIsUpdate] = useState(false);
  const handleSave = () => {
    const customErrors = ErrorHandling();
    setErrors(customErrors);
    if (Object.keys(customErrors).length > 0) {
      toast.error("Please Fill All Required Fields");
      return;
    }
    if (!isupdate) {
      axiosInstance
        .post("InventryManageApprovalStore/saveLocation", {
          centreId: Number(payload?.CentreId) || 0,
          location: `${selectedVisitType} ${String(payload?.Location)}`,
          cpName: String(payload?.ContactPerson) || "",
          cpNo: String(payload?.ContactPersonNo) || "",
          cpNoEmail: String(payload?.Email) || "",
          address: String(payload?.Address) || "",
          autoReceive: String(payload?.AutoSIReceived) || "",
          autoConsume: String(payload?.AutoConsumeOn) || "0",
          allowAutoConsume: 0,
          allowAutoConsumable: 0,
          isActive: payload?.IsActive == 1 ? true : false,
          CenterName: payload?.CenterName
        })
        .then((res) => {
          toast.success(res?.data?.message);
          handleReset();
          handleSearch();
          setIsUpdate(false);
        })
        .catch((err) => {
          toast.error(err?.response?.data?.message);
        });
    } else {
      const requestBody = {
        centreId: String(payload?.CentreId) || 0,
        location: `${selectedVisitType}${String(payload?.Location)}`,
        contactPersonName: String(payload?.ContactPerson) || "",
        contactPersonNo: String(payload?.ContactPersonNo) || "",
        locationId: String(payload?.LocationId) || "",
        isActive: String(payload?.IsActive) || "0",
        contactPersonEmail: String(payload?.Email) || "",
        address: String(payload?.Address) || "",
        autoReceiveDay: String(payload?.AutoSIReceived) || "",
        autoConsumeType: String(payload?.AutoConsumeOn) || "0",
        allowAutoConsume: 0,
        allowAutoConsumeConsumable: 0,
      };
      axiosInstance
        .post("InventryManageApprovalStore/update", requestBody)
        .then((res) => {
          const { success, message } = res?.data || {};
          toast.success(message);
          handleReset();
          handleSearch();
          setIsUpdate(false);
        })
        .catch((err) => {
          console.log(err);
          toast.error(
            err?.response?.data?.message
          );
        });
    }
  };

  const handleReset = () => {
    // setDropDownApis({
    //   citybind: [],
    //   centrebind: [],
    // });

    setPayload({
      ...payload,
      CentreId: "",
      StoreNotCreated: "0",
      LocationId: "",
      Location: "",
      IsActive: "1",
      ContactPerson: "",
      ContactPersonNo: "",
      Address: "",
      Email: "",
      AutoSIReceived: "",
      AutoConsumeOn: "",
      CenterName: ""
    });
    setErrors({});
  };

  console.log(dropDownApis);
  const handleExcelDownload = () => {
    exportToExcel(tableData, "StoreLocationMaster");
  };

  const handleEdit = (row) => {
    setIsUpdate(true);
    setPayload((prev) => ({
      ...prev,
      CentreType: [],
      CountryId: "",
      StateId: [],
      CityId: [],
      CentreId: row?.panel_ID,
      // StoreNotCreated: row?.StoreNotCreated,
      LocationId: row?.locationID,
      CenterName: row?.centre,
      Location: row?.location,
      IsActive: row?.isActive == true ? "1" : "0",
      ContactPerson: row?.contactPerson,
      ContactPersonNo: row?.contactPersonNo,
      Address: row?.storeLocationAddress,
      Email: row?.contactPersonEmail,
      AutoSIReceived: row?.autoIndentReceivedDay,
      AutoConsumeOn: row?.consumeType == true ? "1" : "0",
    }));
    setErrors({});
  };
  const [modalData, setModalData] = useState({});
  const [handleModelData, setHandleModelData] = useState({});
  const handleModel = (
    label,
    width,
    type,
    isOpen,
    Component,
    handleInsertAPI,
    extrabutton,
  ) => {
    setHandleModelData({
      label: label,
      width: width,
      type: type,
      isOpen: isOpen,
      Component: Component,
      handleInsertAPI: handleInsertAPI,
      extrabutton: extrabutton ? extrabutton : <></>,
    });
  };
  useEffect(() => {
    setHandleModelData((val) => ({ ...val, modalData: modalData }));
  }, [modalData]);

  const setIsOpen = () => {
    setHandleModelData((val) => ({ ...val, isOpen: false }));
  };
  const handleChangeModel = (data) => {
    setModalData(data);
  };

  const selectedVisitType = dropDownApis?.centrebind?.find(
    (data) => data?.centreID === payload?.CentreId
  )?.centre || "";

  console.log({ dropDownApis })
  return (
    <>
      <Accordion
        name={t("Store Location Master")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row px-2 pt-2">
          <div className="col-xl-2 col-sm-4 col-md-6 col-12">
            <MultiSelctItems
              placeholderName="Centre Type"
              values={payload}
              setValues={setPayload}
              name="CentreType"
              dynamicOptions={dropDownApis?.centretypebind}
              labelKey="type"
              valueKey="id"
              handleChange={handleSelectMultiChange}
              respclass={""}
            />
          </div>
          <div className="col-xl-2 col-sm-4 col-md-6 col-12">
            <ReactSelect
              name="CountryId"
              id="CountryId"
              removeIsClearable={true}
              dynamicOptions={dropDownApis?.countrybind?.map((ele) => ({
                value: ele?.CountryID,
                label: ele?.CountryName,
              }))}
              placeholderName="Country"
              value={payload?.CountryId}
              onChange={handleSelectChange}
              respclass={""}
            />

          </div>
          <div className="col-xl-2 col-sm-4 col-md-6 col-12">
            <MultiSelctItems
              placeholderName="BusinessZone"
              name="BusinessZoneId"
              values={payload}
              setValues={setPayload}
              dynamicOptions={dropDownApis?.BusinessZoneId}
              labelKey="BusinessZoneName"
              valueKey="BusinessZoneID"
              handleChange={handleSelectMultiChange}
              respclass={""}
            />

          </div>
          <div className="col-xl-2 col-sm-4 col-md-6 col-12">
            <MultiSelctItems
              placeholderName="State"
              name="StateId"
              values={payload}
              setValues={setPayload}
              dynamicOptions={dropDownApis?.statebind}
              labelKey="stateName"
              valueKey="id"
              handleChange={handleSelectMultiChange}
              respclass={""}
            />

          </div>
          {/* <div className="col-xl-2 col-sm-4 col-md-6 col-12">
            <MultiSelctItems
              placeholderName="City"
              name="CityId"
              values={payload}
              setValues={setPayload}
              dynamicOptions={dropDownApis?.citybind}
              labelKey="city"
              valueKey="id"
              respclass={""}
            />

          </div> */}
          <div className="col-xl-2 col-sm-4 col-md-6 col-12">
            <div className="flex-grow-1 mb-2 d-flex position-relative">

              <Input
                autoComplete="off"
                placeholder=" "
                lable="City"
                id="CitySearch"
                name="CitySearch"
                type="text"
                value={citySearch}
                maxLength={50}
                respclass={"flex-grow-1"}
                onChange={handleCitySearch}
                onKeyDown={handleCityKeyDown}
                onBlur={() => setTimeout(() => setShowCityDropdown(false), 200)}
              />

              {showCityDropdown && filteredCities.length > 0 && (
                <ul className="suggestion-data" style={{ zIndex: 99 }}>
                  {filteredCities.map((city, index) => (
                    <li
                      // key={city.id}
                      // onClick={() => handleCitySelect(city)}
                      key={city.id}
                      onClick={() => handleCitySelect(city)}
                      className={`${index === cityIndex && "matchIndex"}`}
                    >
                      {city.city}
                    </li>
                  ))}
                </ul>
              )}

              {selectedCities?.length > 0 && (
                <span className="d-flex align-items-center counticon">
                  {selectedCities.length}

                  <i
                    className="bi bi-info-circle-fill infoIcon_cls"
                    data-tooltip-id="city-tooltip"
                  ></i>

                  <ReactTooltip
                    id="city-tooltip"
                    place="bottom"
                    clickable={true}
                    content={
                      <div>
                        <h2 className="mb-1 border-bottom">
                          Selected Cities ({selectedCities.length})
                        </h2>

                        <ul className="mb-0 pl-3">
                          {selectedCities.map((city, idx) => (
                            <li
                              key={city.id}
                              className="mb-2 d-flex justify-content-between align-items-center"
                            >
                              <span>
                                {idx + 1}. {city.city}
                              </span>

                              <i
                                className="fa fa-times ml-2"
                                style={{
                                  cursor: "pointer",
                                  color: "red",
                                }}
                                onClick={() => handleRemoveCity(city.id)}
                              />
                            </li>
                          ))}
                        </ul>
                      </div>
                    }
                    style={{ zIndex: 9999 }}
                  />
                </span>
              )}
            </div>
          </div>
          <div className="col-xl-2 col-sm-4 col-md-6 col-12">
            <ReactSelect
              name="CentreId"
              id="CentreId"
              removeIsClearable={true}
              dynamicOptions={dropDownApis?.centrebind?.map((ele) => ({
                label: ele?.centre,
                value: ele?.centreID,
              }))}
              placeholderName="Centre"
              value={payload?.CentreId}
              onChange={handleSelectChange}
              // isDisabled={payload.StoreNotCreated !== "1"}
              className={"required-fields"}
              respclass={""}
            />
            {errors?.CentreId && (
              <div className="text-danger mt-1" style={{ fontSize: "10px" }}>
                {errors.CentreId}
              </div>
            )}
          </div>
          <Form.Check
            type="switch"
            className="ml-2 pb-2"
            id="StoreNotCreated"
            name="StoreNotCreated"
            label={t("Store Not Created")}
            checked={payload.StoreNotCreated == "1"}
            onChange={(e) => {
              const isChecked = e.target.checked;
              const value = isChecked ? "1" : "0";

              setPayload((prev) => ({
                ...prev,
                StoreNotCreated: value,
                CentreId: isChecked ? prev.CentreId : "",
                LocationId: isChecked ? prev.LocationId : "",
              }));

              // ✅ API call
              if (value === "1") {
                getBindCentreNew([], [], value, (data) => {
                  setDropDownApis((prev) => ({
                    ...prev,
                    centrebind: data,
                  }));
                });
              } else {
                setDropDownApis((prev) => ({
                  ...prev,
                  centrebind: [],
                }));
              }

              if (!isChecked) {
                setErrors((prev) => ({
                  ...prev,
                  CentreId: "",
                }));
              }
            }}
          />
          <SearchButton text="Search" className="ml-3" onClick={handleSearch} />
        </div>
      </Accordion>
      <Accordion
        name={t("Location Details")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row px-2 py-2">
          <Input
            type="text"
            placeholder=" "
            lable="Location"
            id="CenterName"
            name="CenterName"
            maxLength={50}
            value={selectedVisitType || payload?.CenterName || ""}
            readOnly
            onChange={handleChange}
            className={"required-fields"}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />

          <div className="col-xl-3 col-sm-4 col-md-6 col-12">
            <div className="d-flex align-items-start">
              {/* Input Section */}
              <div className="flex-grow-1">
                <Input
                  type="text"
                  placeholder=" "
                  lable="Location"
                  id="Location"
                  name="Location"
                  value={payload?.Location}
                  maxLength={50}
                  onChange={handleChange}
                  respclass={"w-100"}
                />

                {errors?.Location && (
                  <div className="text-danger mt-1" style={{ fontSize: "10px" }}>
                    {errors.Location}
                  </div>
                )}
              </div>

              {/* Switch Section */}
              <div className="ms-2 mt-1 ml-2">
                <Form.Check
                  type="switch"
                  id="IsActive"
                  name="IsActive"
                  label={t("Active")}
                  checked={payload?.IsActive == "1"}
                  onChange={handleChange}
                />
              </div>

            </div>
          </div>
          <span className="mx-2 text-danger" style={{ fontWeight: "bold" }}>(Example: BIO,IMUNO,HEMA,STORE etc)</span>
        </div>
        <div className="row px-2 py-2">
          <div className="col-xl-2 col-sm-4 col-md-6 co-12">
            <Input
              type="text"
              placeholder=" "
              lable="ContactPersonName"
              id="ContactPerson"
              name="ContactPerson"
              maxLength={50}
              value={payload?.ContactPerson}
              onChange={handleChange}
              className={"required-fields"}

            />
            {errors?.ContactPerson && (
              <div className="text-danger mt-1" style={{ fontSize: "10px" }}>
                {errors.ContactPerson}
              </div>
            )}
          </div>
          <div className="col-xl-2 col-sm-4 col-md-6 co-12">
            <Input
              type="number"
              placeholder=" "
              lable="Contact Person No"
              id="ContactPersonNo"
              maxLength={50}
              name="ContactPersonNo"
              onChange={(e) => {
                const value = e.target.value;
                const maxLength = DefaultCurrencyName === "KES" ? 16 : 10;
                if (value.length <= maxLength) {
                  handleChange(e);
                }
              }}
              value={payload?.ContactPersonNo}
              className={"required-fields"}
            />
            {errors?.ContactPersonNo && (
              <div className="text-danger mt-1" style={{ fontSize: "10px" }}>
                {errors.ContactPersonNo}
              </div>
            )}
          </div>
          <div className="col-xl-2 col-sm-4 col-md-6 co-12">
            <Input
              type="text"
              placeholder=" "
              lable="Address"
              id="Address"
              name="Address"
              maxLength={50}
              value={payload?.Address}
              onChange={handleChange}
              className={"required-fields"}

            />
            {errors?.Address && (
              <div className="text-danger mt-1" style={{ fontSize: "10px" }}>
                {errors.Address}
              </div>
            )}
          </div>
          <div className="col-xl-2 col-sm-4 col-md-6 co-12">
            <Input
              type="email"
              placeholder=" "
              lable="Email"
              id="Email"
              name="Email"
              value={payload?.Email}
              maxLength={50}
              onChange={handleChange}
            // className={"required-fields"}
            // respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
            />
            {/* {errors?.Email && (
              <div className="text-danger mt-1" style={{ fontSize: "10px" }}>
                {errors.Email}
              </div>
            )} */}
          </div>
        </div>
        <div className="row px-2 py-2">
          <div className="col-xl-2 col-sm-4 col-md-6 co-12">
            <Input
              type="number"
              placeholder=" "
              lable="Auto SI Received"
              id="AutoSIReceived"
              name="AutoSIReceived"
              value={payload?.AutoSIReceived}
              maxLength={50}
              onChange={handleChange}
              className={"required-fields"}

            />    {errors?.AutoSIReceived && (
              <div className="text-danger mt-1" style={{ fontSize: "10px" }}>
                {errors.AutoSIReceived}
              </div>
            )}</div><span className="mx-2 text-danger" style={{ fontWeight: "bold" }}>(In Days * Enter 0 For For Not Apply)</span>
          {/* </div>
          <div className="row pb-2 px-2"> */}
          <Form.Check
            type="switch"
            id="AutoConsumeOn"
            name="AutoConsumeOn"
            label={t("Auto Consume On")}
            checked={payload.AutoConsumeOn == "1"}
            onChange={(e) => handleChange(e)}
            className="m-0"
          />

        </div>

        <div className="col-sm-2 d-flex ml-2 p-2" style={{ gap: "10px" }}>
          {/* <button
                className="btn btn-sm btn-success"
                type="button"
                onClick={handleSave}
              >
                {isupdate ? "Update" : "Save"}
              </button> */}

          <CustomButton
            icon={isupdate ? "edit" : "save"}
            text={isupdate ? "Update" : "Save"}
            onClick={handleSave} />
          {/* <button
                className="btn btn-sm btn-success ml-2"
                onClick={handleReset}
              >
                Reset
              </button> */}

          <CustomButton
            icon={"refresh"}
            text={"Reset"}
            onClick={handleReset}

          />

          {/* <button
                className="btn btn-sm btn-success ml-2"
                onClick={handleSearch}
              >
                Search
              </button> */}


          {/* <button
                className="btn btn-sm btn-success ml-2"
              // onClick={() => handleExcelDownload(tableData)}
              >
                Excel
              </button> */}
          {/* {tableData?.length > 0 && (<CustomButton
            icon={"excel"}
            text={"Excel"}
            onClick={() => handleExcelDownload(tableData)}

          />)} */}

          {/* <RiFileExcel2Fill
                size={24}
                className="text-success"
                style={{ cursor: "pointer" }}
                title="Excel"
                onClick={() => alert("Excel  feature coming soon!")}
              /> */}
        </div>
      </Accordion >
      {tableData?.length > 0 && (
        <Accordion
          name={t("Search Detail")}
          defaultValue={true}
          isBreadcrumb={true}
          notOpen={true}

          linkTo="/StoreLocationMaster"
          linkTitle={
            tableData?.length > 0 && (
              <RiFileExcel2Fill
                size={24}
                className="text-success mr-3"
                style={{ cursor: "pointer" }}
                title="Export to Excel"
                onClick={() => handleExcelDownload(tableData)}
              />
            )
          }
        >
          <div className="row">
            <div className="col-sm-12">
              <Tables style={{ maxHeight: "400px", overflowY: "auto" }}>
                <thead style={{ position: "sticky", zIndex: 0, top: 0 }}>
                  <tr>
                    <th>
                      <span className="px-2">{t("#")}</span>
                    </th>
                    <th>{t("State")}</th>
                    <th>{t("Centre")}</th>
                    <th>{t("Location")}</th>
                    <th>{t("Auto SI")}</th>
                    <th>{t("Contact Person")}</th>
                    <th>{t("Contact Person No")}</th>
                    <th>{t("Status")}</th>
                    <th>{t("Created Date")}</th>
                    <th>{t("Created By")}</th>
                    <th>{t("Edit")}</th>
                    <th style={{ width: "40% !important" }}>
                      {t("Map Items")}
                    </th>
                    <th>{t("Store Location(SI)")}</th>
                    <th>{t("Direct Issue")}</th>
                    <th>{t("Direct Stock Transfer")}</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData?.map((row, index) => (
                    <tr key={index}>
                      <td data-title="#">
                        <span className="px-2">{index + 1}</span>
                      </td>
                      <td data-title="State">{row?.state}</td>
                      <td data-title="Centre">{row?.centre}</td>
                      <td data-title="Location">{row?.location}</td>
                      <td data-title="Auto SI">{row?.autoIndentReceivedDay}</td>
                      <td data-title="Contact Person">{row?.contactPerson}</td>
                      <td data-title="Contact Person No">
                        {row?.contactPersonNo}
                      </td>
                      <td data-title="Status">{row?.aStatus}</td>
                      <td data-title="Created Date">{row?.createdDate}</td>
                      <td data-title="Created By">{row?.createdBy}</td>{" "}
                      {/* Not present in your response */}
                      <td data-title="Edit">
                        <i
                          onClick={() => handleEdit(row)}
                          className="fa fa-edit"
                          aria-hidden="true"
                        ></i>
                      </td>
                      <td data-title="Map Items">
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() =>
                            handleModel(
                              "Map Item With Location",
                              "70vw",
                              "Map Items",

                              true,
                              <MapItemModel
                                handleChangeModel={handleChangeModel}
                                items={row}
                              />
                            )
                          }
                        >
                          Map Items
                        </button>
                      </td>
                      <td data-title="Store Location(SI)">
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() =>
                            handleModel(
                              "Map Location With Location For SI",
                              "80vw",
                              "Store Location (SI)",
                              true,
                              <StoreLocationSIModel
                                handleChangeModel={handleChangeModel}
                                items={row}
                              />
                            )
                          }
                        >
                          Store Location(SI)
                        </button>
                      </td>
                      <td data-title="Direct Issue">
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() =>
                            handleModel(
                              "Map Location With Location For Direct Issue",
                              "80vw",
                              "Direct Issue",
                              true,
                              <DirectIssueModal
                                handleChangeModel={handleChangeModel}
                                items={row}
                              />
                            )
                          }
                        >
                          Direct Issue
                        </button>
                      </td>
                      <td data-title="Direct Stock Transfer">
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() =>
                            handleModel(
                              "Map Location With Location For Direct Stock Transfer",
                              "80vw",
                              "Direct Stock Transfer",
                              true,
                              <DirectStockTransferModal
                                handleChangeModel={handleChangeModel}
                                items={row}
                              />
                            )
                          }
                        >
                          Direct Stock Transfer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Tables>
            </div>
          </div>
        </Accordion>
      )
      }

      {
        handleModelData?.isOpen && (
          <Modal
            visible={handleModelData?.isOpen}
            setVisible={setIsOpen}
            modalWidth={handleModelData?.width}
            Header={t(handleModelData?.label)}
            buttonType={"submit"}
            buttons={handleModelData?.extrabutton}
            modalData={handleModelData?.modalData}
            setModalData={setModalData}
          >
            {handleModelData?.Component}
          </Modal>
        )
      }
    </>
  );
};

export default StoreLocationMaster;
