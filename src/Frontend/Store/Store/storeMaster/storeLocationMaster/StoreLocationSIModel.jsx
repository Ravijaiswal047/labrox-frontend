import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import Heading from "../../../../components/UI/Heading";
import { Tooltip as ReactTooltip } from "react-tooltip";
import MultiSelctItems from "../../../../components/formComponent/MultiSelctItems";
import {
  getBindCentreNew,
  getBindCentreType,
  getBindCity,
  getBindCountry,
  getBindLocation,
  getBindstate,
  GetZoneData
} from "../../../../utils/NetworkApi/commonApi";
import Tables from "../../../../components/UI/customTable";
import { axiosInstance } from "../../../../utils/axiosInstance";
import { toast } from "react-toastify";
import { exportToExcel } from "../../../../utils/helpers";
import { CustomButton, SaveButton, SearchButton } from "../../../../components/UI/CustomButton";
import { RiFileExcel2Fill } from "react-icons/ri";
import Input from "../../../../components/formComponent/Input";

const StoreLocationSIModel = ({ items }) => {
  const [dropDownApis, setDropDownApis] = useState({
    centretypebind: [],
    countrybind: [],
    statebind: [],
    citybind: [],
    centrebind: [],
    locationlist: [],
    locationbind: [],
    zonebind: [],
  });
  console.log(dropDownApis.centretypebind);
  const { t } = useTranslation();
  const [tableData, setTableData] = useState([]);
  const [payload, setPayload] = useState({
    CurrentLocation: items?.locationID,
    CentreType: [],
    CountryId: "",
    StateId: [],
    CityId: [],
    CentreId: [],
    LocationID: [],
  });

  const [citySearch, setCitySearch] = useState("");
  const [filteredCities, setFilteredCities] = useState([]);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [cityIndex, setCityIndex] = useState(0);
  const [selectedCities, setSelectedCities] = useState([]);
  const handlePayloadMultiSelectNumbers = (data) => {
    if (!Array.isArray(data)) return [];
    return data.map((item) => Number(item?.code));
  };
  const handlePayloadMultiSelectString = (data) => {
    if (!Array.isArray(data)) return "";
    return data.map((item) => String(item?.code)).join(",");
  };

  const handleSelectChange = (name, value) => {
    if (name === "CentreType") return;
    const selectedValue = value?.value || "";
    setPayload((prev) => ({ ...prev, [name]: value?.value }));
    if (name === "CountryId") {

      GetZoneData(selectedValue, (data) => {
        setDropDownApis((prev) => ({
          ...prev,
          zonebind: data,
        }));
      });

      setPayload((prev) => ({
        ...prev,
        CountryId: selectedValue,
        BusinessZoneId: [],
        StateId: [],
        CityId: [],
        CentreId: [],
        LocationID: [],
      }));
    }
  };
  const handleSelectMultiChange = (name, select) => {
    setPayload((prev) => ({ ...prev, [name]: select }));
    switch (name) {
      case "CentreType":
        setPayload((prev) => ({ ...prev, [name]: select }));
        getBindCentreNew(
          [],
          handlePayloadMultiSelectNumbers(select),
          payload?.StoreNotCreated,
          (data) => {
            setDropDownApis((prev) => ({ ...prev, centrebind: data }));
          }
        );

        break;

      case "BusinessZoneId":

        getBindstate(
          payload?.CountryId,
          handlePayloadMultiSelectNumbers(select),
          (data) => {
            setDropDownApis((prev) => ({
              ...prev,
              statebind: data,
            }));
          }
        );

        break;

      case "StateId":
        getBindCity(handlePayloadMultiSelectNumbers(select), (data) => {
          setDropDownApis((prev) => ({ ...prev, citybind: data }));
        });
        break;

      case "CityId":
        getBindCentreNew(
          handlePayloadMultiSelectNumbers(select),
          handlePayloadMultiSelectNumbers(payload?.CentreType),
          payload?.StoreNotCreated ?? "0",
          (data) => {
            setDropDownApis((prev) => ({ ...prev, centrebind: data }));
          }
        );
        break;

      case "CentreId":
        getBindLocation(
          handlePayloadMultiSelectNumbers(select),
          handlePayloadMultiSelectNumbers(payload?.StateId),
          handlePayloadMultiSelectNumbers(payload?.CentreType),
          payload?.CountryId,
          handlePayloadMultiSelectNumbers(payload?.CityId),
          (data) => {
            setDropDownApis((prev) => ({ ...prev, locationbind: data }));
          }
        );
        break;
      default:
        break;
    }
  };


  console.log({ dropDownApis })
  useEffect(() => {
    getBindCentreType((data) => {
      setDropDownApis((prev) => ({ ...prev, centretypebind: data }));
    });
    getBindCountry((data) => {
      setDropDownApis((prev) => ({ ...prev, countrybind: data }));
    });
  }, []);

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

      // dependency → load centres
      getBindCentreNew(
        updated.map((c) => c.id),
        handlePayloadMultiSelectNumbers(payload?.CentreType),
        payload?.StoreNotCreated ?? "0",
        (data) => {
          setDropDownApis((prev) => ({ ...prev, centrebind: data }));
        }
      );
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

  const MapLoction = () => {
    axiosInstance
      .post("MappingStoreItemWithCentre/bindlocation", {
        centreId: "",
        stateId: "",
        typeId: "",
        countryid: "",
        cityId: "",
      })
      .then((res) => {
        let data = res.data.message;
        const result = data
          ?.map((item) => ({
            label: item?.Location,
            value: item?.LocationID,
          }))
        setDropDownApis((prev) => ({ ...prev, locationlist: result }));
      })
      .catch((err) => {
        console.log(err);
        toast.error("Something went wrong");
      });
  };
  useEffect(() => {
    MapLoction();
  }, []);
  const ErrorHandling = () => {
    const errors = {};

    if (
      !payload?.CentreType ||
      !Array.isArray(payload.CentreType) ||
      payload.CentreType.length === 0
    ) {
      errors.CentreType = "Centre Type is required";
    }
    if (!payload?.CountryId || payload.CountryId === "") {
      errors.CountryId = "Country is required";
    }
    if (
      !payload?.CentreId ||
      !Array.isArray(payload.CentreId) ||
      payload.CentreId.length === 0
    ) {
      errors.CentreId = "At least one Centre must be selected";
    }
    if (
      !payload?.LocationID ||
      !Array.isArray(payload.LocationID) ||
      payload.LocationID.length === 0
    ) {
      errors.LocationID = "At least one Location must be selected";
    }

    return errors;
  };

  useEffect(() => {
    handleSearch();
  }, []);

  const handleSearch = () => {
    axiosInstance
      .post("CenterIndentRight/SearchData", {
        fCenterID: [Number(items?.locationID)],
        tCenterID: handlePayloadMultiSelectNumbers(payload?.LocationID) || [],
        indentType: "SI",
      })
      .then((res) => {
        setTableData(res?.data?.message || []);
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message || "Something went wrong"
        );
        setTableData([]);
      });
  };

  const handleSave = () => {
    const customerrors = ErrorHandling();
    if (Object.keys(customerrors)?.length > 0) {
      toast.error(Object.values(customerrors)[0]);
      return false;
    }
    axiosInstance
      .post("CenterIndentRight/SubmitData", {
        fCenterIDs: [Number(items?.locationID)] || [0],
        tCenterIDs: handlePayloadMultiSelectNumbers(payload?.LocationID) || [0],
        indentType: "SI",
      })
      .then((res) => {
        let data = res.data.message;
        toast.success(data);
        handleSearch();
        setPayload({
          CurrentLocation: items?.locationID,
          CentreType: [],
          CountryId: "",
          StateId: [],
          CityId: [],
          CentreId: [],
          LocationID: [],
        });
      })
      .catch((err) => {
        console.log(err);
        toast.error("Something went wrong");
      });
  };
  const handleRemove = () => {
    const selectedRows = tableData?.filter((ele) => ele.isActive === true);
    const selectedIds = selectedRows?.map((ele) => String(ele?.id));
    axiosInstance
      .post("CenterIndentRight/RemoveData", {
        id: selectedIds,
      })
      .then((res) => {
        let data = res.data.message;
        toast.success(data);
        handleSearch();
      })
      .catch((err) => {
        console.log(err);
        toast.error("Something went wrong");
      });
  };
  const handleCheckboxChange = (index, field, checked) => {
    setTableData((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: checked } : row))
    );
  };

  const handleAllCheckboxChange = (e) => {
    const isFirst = e.target.parentElement.innerText.includes("Delete");
    const field = isFirst ? "isActive" : "secondCheck";
    const checked = e.target.checked;

    setTableData((prev) =>
      prev.map((row) => ({
        ...row,
        [field]: checked,
      }))
    );
  };
  const handleReset = () => {
    setPayload({
      CurrentLocation: items?.locationID,
      CentreType: [],
      CountryId: "",
      StateId: [],
      CityId: [],
      CentreId: [],
      LocationID: [],
    });
    // setTableData([]);
  };
  const handleExcelDownload = (tableData) => {
    exportToExcel(tableData, "StoreLocationSIModel");
  };
  return (
    <>
      <div className="card">
        <Heading name={"Item Detail"} isBreadcrumb={true} />
        <div className="row px-2 pt-2">
          <ReactSelect
            name="CurrentLocation"
            id="CurrentLocation"
            removeIsClearable={true}
            dynamicOptions={dropDownApis?.locationlist}
            placeholderName="Current Location"
            value={payload?.CurrentLocation}
            onChange={handleSelectChange}
            respclass={"col-xl-3 col-sm-4 col-md-6 co-12"}
          />
          <MultiSelctItems
            placeholderName="Centre Type"
            values={payload}
            setValues={setPayload}
            name="CentreType"
            dynamicOptions={dropDownApis?.centretypebind}
            labelKey="type"
            valueKey="id"
            requiredClassName={"required-fields"}
            handleChange={handleSelectMultiChange}
            respclass={"col-xl-3 col-sm-4 col-md-6 co-12"}
          />
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
            className={"required-fields"}
            respclass={"col-xl-3 col-sm-4 col-md-6 co-12"}
          />
          <MultiSelctItems
            placeholderName="Zone"
            name="BusinessZoneId"
            values={payload}
            setValues={setPayload}
            dynamicOptions={dropDownApis?.zonebind}
            labelKey="BusinessZoneName"
            valueKey="BusinessZoneID"
            handleChange={handleSelectMultiChange}
            respclass={"col-xl-3 col-sm-4 col-md-6 co-12"}
          />
          <MultiSelctItems
            placeholderName="State"
            name="StateId"
            values={payload}
            setValues={setPayload}
            dynamicOptions={dropDownApis?.statebind}
            labelKey="stateName"
            valueKey="id"
            handleChange={handleSelectMultiChange}
            respclass={"col-xl-3 col-sm-4 col-md-6 co-12"}
          />
          {/* <MultiSelctItems
            placeholderName="City"
            name="CityId"
            values={payload}
            setValues={setPayload}
            dynamicOptions={dropDownApis?.citybind}
            labelKey="city"
            valueKey="id"
            handleChange={handleSelectMultiChange}
            respclass={"col-xl-3 col-sm-4 col-md-6 co-12"}
          /> */}
          <div className="col-xl-3 col-sm-4 col-md-6 col-12 position-relative">

            <Input
              autoComplete="off"
              placeholder=" "
              lable="City"
              id="CitySearch"
              name="CitySearch"
              type="text"
              value={citySearch}
              respclass={"w-100"}
              onChange={handleCitySearch}
              onKeyDown={handleCityKeyDown}
              onBlur={() => setTimeout(() => setShowCityDropdown(false), 200)}
            />

            {showCityDropdown && filteredCities.length > 0 && (
              <ul className="suggestion-data" style={{ zIndex: 99 }}>
                {filteredCities.map((city, index) => (
                  <li
                    key={city.id}
                    className={index === cityIndex ? "matchIndex" : ""}
                    onClick={() => handleCitySelect(city)}
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
                  key={selectedCities.length}
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
                              style={{ cursor: "pointer", color: "red" }}
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
          <MultiSelctItems
            placeholderName="Centre"
            name="CentreId"
            values={payload}
            setValues={setPayload}
            dynamicOptions={dropDownApis?.centrebind}
            labelKey="centre"
            valueKey="centreID"
            handleChange={handleSelectMultiChange}
            requiredClassName={"required-fields"}
            respclass={"col-xl-3 col-sm-4 col-md-6 co-12"}
          />
          <MultiSelctItems
            placeholderName="Location"
            name="LocationID"
            values={payload}
            setValues={setPayload}
            dynamicOptions={dropDownApis?.locationbind}
            labelKey="Location"
            valueKey="LocationID"
            handleChange={handleSelectMultiChange}
            requiredClassName={"required-fields"}
            respclass={"col-xl-3 col-sm-4 col-md-6 co-12"}
          />


          <div className="col-sm-4 d-flex p-2" style={{ gap: "20px" }}>

            <SearchButton text={t("Search")} onClick={handleSearch} />
            <SaveButton text={t("Save")} onClick={handleSave} />
            <CustomButton icon={"refresh"} text={t("Reset")} onClick={handleReset} />
            {/* {tableData?.length > 0 && (<CustomButton icon={"excel"} text={t("Export To Excel")} onClick={() => handleExcelDownload(tableData)} />)} */}

          </div>
        </div>
      </div>
      <div className="card mt-2">
        <Heading name={"Issue Detail"} isBreadcrumb={true} secondTitle={
          tableData?.length > 0 && (
            <RiFileExcel2Fill
              size={24}
              className="text-success mr-3"
              style={{ cursor: "pointer" }}
              title="Export to Excel"
              onClick={() => handleExcelDownload(tableData)}
            />
          )
        } />
        <div className="row">
          <div className="col-sm-12">
            <Tables style={{
              maxHeight: "200px",
              overflowY: "auto",
            }}>
              <thead style={{ position: "sticky", top: 0, zIndex: 1 }}>
                <tr>
                  <th>{t("Sr. No.")}</th>
                  <th>{t("From Location")}</th>
                  <th>{t("To Location")}</th>
                  <th>{t("Indent Type")}</th>
                  <th>
                    <>
                      <input
                        type="checkbox"
                        onChange={handleAllCheckboxChange}
                      />

                      <button
                        className="btn btn-sm btn-success ml-2"
                        onClick={handleRemove}
                      >
                        {t("Delete")}
                      </button>
                    </>
                  </th>
                </tr>
              </thead>
              <tbody>
                {tableData?.map((row, index) => (
                  <tr key={index}>
                    <td data-title="Sr. No.">{index + 1}</td>
                    <td data-title="From Location">{row?.fromCenter}</td>
                    <td data-title="To Location">{row?.toCenter}</td>
                    <td data-title="Indent Type">{row?.indentType}</td>
                    <td data-title="Delete">
                      <>
                        <input
                          type="checkbox"
                          checked={row.isActive}
                          name="isActive"
                          onChange={(e) =>
                            handleCheckboxChange(
                              index,
                              "isActive",
                              e.target.checked
                            )
                          }
                        />
                      </>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Tables>
          </div>
        </div>
      </div>
    </>
  );
};

export default StoreLocationSIModel;
