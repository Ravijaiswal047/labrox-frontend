import React, { useEffect, useState } from "react";
import { RouteMasterValidationSchema } from "../../utils/Schema";
import { toast } from "react-toastify";
import Input from "../../components/formComponent/Input";
import { SelectBox } from "../../components/formComponent/SelectBox";
import { useTranslation } from "react-i18next";
import Loading from "../../components/loader/Loading";

import Accordion from "@app/components/UI/Accordion";
import {
  AllowCharactersNumbersAndSpecialChars,
  getTrimmedData,
} from "../../utils/helpers";
import { NoofRecord } from "../../utils/Constants";
import ExportFile from "../../components/formComponent/ExportFile";
import Tables from "../../components/UI/customTable";
import { axiosInstance } from "../../utils/axiosInstance";
import { Link } from "react-router-dom";
import ReactSelect from "../../components/formComponent/ReactSelect";
import ColorCodingSearch from "../../components/ModalComponent/ColorCodingSearch";
import { CancelButton, CustomButton, SearchButton } from "../../components/UI/CustomButton";
const RouteMaster = () => {
  const [errors, setErros] = useState({}); //check
  const [load, setLoad] = useState(false); //check
  const [searchLoad, setSearchLoad] = useState(false); //check
  const [businessZones, setBusinessZones] = useState([]); // dropdown
  const [states, setStates] = useState([]); // dropdown
  const [city, setCity] = useState([]); //dropdown
  const [statesSearch, setStatesSearch] = useState([]);
  const [citySearch, setCitySearch] = useState([]);
  const [routeTable, setRouteTable] = useState([]);
  const [searchData, setSearchData] = useState({
    StateId: "",
    CityId: "",
    Route: "",
    NoofRecord: "10",
  });
  const [isEdit, setIsEdit] = useState(false);

  const [formData, setFormData] = useState({
    BusinessZoneId: "",
    StateId: "",
    CityId: "",
    Route: "",
    IsActive: true,
  });

  const { t } = useTranslation();

  const colorsCodingData = [
    { color: "#FFFFFF", id: "8", labelKey: "Active" },
    { color: "#ffbebeff", id: "7", labelKey: "Inactive" },
  ];

  // check
  const getStates = (value) => {
    if (value === "") {
      setStates([]);
    } else {
      axiosInstance
        .post("CommonHC/GetStateData", {
          BusinessZoneID: value,
        })
        .then((res) => {
          const data = res?.data?.message;
          const States = data?.map((ele) => {
            return {
              value: ele?.ID,
              label: ele?.State,
            };
          });
          // States?.unshift({ label: t("Select State"), value: "" });
          setStates(States);
        })
        .catch((err) => {
          toast.error(err?.res?.data ? err?.res?.data : "Something Went Wrong");
        });
    }
  };

  // check

  const getCity = (value) => {
    axiosInstance
      .post("CommonHC/GetCityData", {
        StateId: [value],
      })
      .then((res) => {
        const data = res?.data?.message;
        const cities = data?.map((ele) => {
          return {
            value: handleSplitData(ele?.ID),
            label: ele?.City,
          };
        });
        // cities?.unshift({ label: t("Select City"), value: "" });
        setCity(cities);
      })
      .catch((err) => {
        toast.error(err?.res?.data ? err?.res?.data : "Something Went Wrong");
      });
  };

  const handleSplitData = (id) => {
    const data = id?.split("#")[0];
    return data;
  };

  // check
  const getSearchCity = (value) => {
    axiosInstance
      .post("CommonHC/GetCityData", {
        StateId: [value],
      })
      .then((res) => {
        const data = res?.data?.message;
        const cities = data?.map((ele) => {
          return {
            value: handleSplitData(ele?.ID),
            label: ele?.City,
          };
        });

        setCitySearch(cities);
      })
      .catch((err) => {
        toast.error(err?.res?.data ? err?.res?.data : "Something Went Wrong");
      });
  };

  // check

  const handleCheckBoxChange = (e) => {
    const { name, value, checked, type } = e?.target;

    if (type === "checkbox") {
      setFormData({
        ...formData,
        [name]: type === "checkbox" ? checked : value,
      });
    }
    else if (name === "Route") {
      setFormData({
        ...formData,
        [name]: AllowCharactersNumbersAndSpecialChars(value)
          ? value
          : formData[name],
      });
    }

  }

  const handleChange = (name, e) => {

    const { value } = e;
    if (name === "BusinessZoneId") {
      getStates(value);
      setFormData({
        ...formData,
        [name]: value?.toString(),
        CityId: "",
        StateId: "",
      });
      setStates([]);
      setCity([]);
    }

    if (name === "StateId") {
      getCity(value);
      setFormData({
        ...formData,
        [name]: value?.toString(),
        CityId: "",
      });
      setCity([]);
    }

    if (name === "CityId") {
      setFormData({
        ...formData,
        [name]: value?.toString(),
      });
    }

    // setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  // check

  const handleInputSearchChange = (e) => {
    const { name, value } = e.target;
    if (name === "Route") {
      setSearchData({ ...searchData, [name]: value });
    }
  };
  const handleSearchChange = (name, e) => {
    const { value } = e;

    if (name === "StateId") {
      getSearchCity(value);
      setSearchData({ ...searchData, [name]: value?.toString(), CityId: "" });
      setCitySearch([]);
    }
    if (name === "CityId") {
      setSearchData({ ...searchData, [name]: value });
    }
    if (name === "NoofRecord") {
      setSearchData({ ...searchData, [name]: value });
      handleSearch(value);
    }

  };

  const handleUpdate = () => {
    const generatedError = RouteMasterValidationSchema(formData);
    if (generatedError === "") {
      setLoad(true);
      axiosInstance
        .post(
          "RouteMaster/UpdateRouteData",
          getTrimmedData({
            ...formData,
            IsActive: formData?.IsActive ? 1 : 0,
          }),
        )
        .then((res) => {
          setLoad(false);
          setIsEdit(false);
          toast.success(res?.data?.message);
          handleCancel();
          handleSearch(searchData?.NoofRecord);
        })
        .catch((err) => {
          setLoad(false);

          toast.error(
            err?.response?.data?.message
              ? err?.response?.data?.message
              : "Error Occured",
          );
        });
    } else {
      setErros(generatedError);
      setLoad(false);
    }
  };

  const editRouteMaster = (ele) => {
    getStates(ele?.BusinessZoneID);
    getCity(ele?.StateId);
    setFormData({
      BusinessZoneId: ele?.BusinessZoneID,
      Route: ele?.Route,
      StateId: ele?.StateId,
      CityId: ele?.CityId,
      RouteId: ele?.RouteId,
      IsActive: ele?.IsActive === 0 ? false : true,
    });
  };

  const handleSearch = (NoofRecord) => {
    handleCancel();
    setSearchLoad(true);
    axiosInstance
      .post(
        "RouteMaster/GetRouteData",

        getTrimmedData({
          ...searchData,
          NoofRecord: NoofRecord,
        }),
      )
      .then((res) => {
        setRouteTable(res?.data?.message);
        setSearchLoad(false);
      })
      .catch((err) => {
        toast.error("Data Not Found");
        setRouteTable([]);
        setSearchLoad(false);
      });
  };

  const handleCancel = () => {
    setFormData({
      BusinessZoneId: "",
      StateId: "",
      CityId: "",
      Route: "",
      IsActive: true,
    });
    setStates([]);
    setCity([]);
    setErros({});
  };

  const statusCounts = routeTable?.reduce(
    (acc, curr) => {
      if (String(curr.IsActive) === "1") {
        acc.active += 1;
      } else {
        acc.deactive += 1;
      }
      return acc;
    },
    { active: 0, deactive: 0 }
  );

  const handleSubmit = () => {
    const generatedError = RouteMasterValidationSchema(formData);
    console.log(generatedError);
    if (generatedError === "") {
      setLoad(true);
      axiosInstance
        .post(
          "RouteMaster/SaveRouteData",
          getTrimmedData({
            ...formData,

            IsActive: formData?.IsActive ? 1 : 0,
          }),
        )
        .then((res) => {
          if (res?.data?.message) {
            setLoad(false);
            handleCancel();
            toast.success("Saved Successfully");
            handleSearch(searchData?.NoofRecord);
          }
        })
        .catch((err) => {
          setLoad(false);
          toast.error(
            err?.response?.data?.message
              ? err?.response?.data?.message
              : "Error Occured",
          );
        });
    } else {
      setErros(generatedError);
      setLoad(false);
    }
  };

  // check
  const getBusinessZones = () => {
    axiosInstance
      .get("CommonHC/GetZoneData")
      .then((res) => {
        let data = res?.data?.message;
        let BusinessZones = data?.map((ele) => {
          return {
            value: ele?.BusinessZoneID,
            label: ele?.BusinessZoneName,
          };
        });
        // BusinessZones.unshift({ label: t("Select Business Zone"), value: "" });
        setBusinessZones(BusinessZones);
      })
      .catch((err) =>
        toast.error(err?.res?.data ? err?.res?.data : "Something Went Wrong"),
      );
  };

  const getSearchState = () => {
    axiosInstance
      .post("CommonHC/GetStateData", {
        BusinessZoneID: 0,
      })
      .then((res) => {
        const data = res?.data?.message;
        const States = data?.map((ele) => {
          return {
            value: ele?.ID,

            label: ele?.State,
          };
        });
        // States.unshift({ label: t("Select State"), value: "" });
        setStatesSearch(States);
      })
      .catch((err) => {
        toast.error(err?.res?.data ? err?.res?.data : "Something Went Wrong");
      });
  };
  useEffect(() => {
    getBusinessZones();
    getSearchState();
    handleSearch(searchData?.NoofRecord);
  }, []);

  return (
    <>
      <Accordion
        name={t("Route Master")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row pt-2 pl-2 pr-2">
          <div className="col-md-2">
            {/* <SelectBox
              options={[
                { label: "Select BusinessZone", value: "" },
                ...businessZones,
              ]}
              lable="Business Zone"
              id="Business Zone"
              name="BusinessZoneId"
              className="required-fields"
              selectedValue={formData?.BusinessZoneId}
              onChange={handleChange}
            /> */}
            <ReactSelect
              dynamicOptions={[
                { label: "Select BusinessZone", value: "" },
                ...businessZones,
              ]}
              lable="Business Zone"
              id="Business Zone"
              name="BusinessZoneId"
              className="required-fields"
              removeIsClearable={true}
              placeholderName={t("Business Zone")}
              value={formData?.BusinessZoneId}
              onChange={handleChange}
            />

            {formData?.BusinessZoneId === "" && (
              <span className="error-message">{errors?.BusinessZoneId}</span>
            )}
          </div>

          <div className="col-md-2">
            {/* <SelectBox
              options={[{ label: "Select State", value: "" }, ...states]}
              name="StateId"
              lable="State"
              id="State"
              className="required-fields"
              selectedValue={formData?.StateId}
              onChange={handleChange}
            /> */}
            <ReactSelect
              dynamicOptions={[{ label: "Select State", value: "" }, ...states]}
              name="StateId"
              lable="State"
              id="State"
              className="required-fields"
              removeIsClearable={true}
              placeholderName={t("State")}
              value={formData?.StateId}
              onChange={handleChange}
            />
            {formData?.StateId === "" && (
              <span className="error-message">{errors?.StateId}</span>
            )}
          </div>
          <div className="col-md-2">
            {/* <SelectBox
              options={[{ label: "Select City", value: "" }, ...city]}
              name="CityId"
              lable="City"
              id="City"
              className="required-fields"
              selectedValue={formData.CityId}
              onChange={handleChange}
            /> */}
            <ReactSelect
              dynamicOptions={[{ label: "Select City", value: "" }, ...city]}
              name="CityId"
              lable="City"
              id="City"
              className="required-fields"
              removeIsClearable={true}
              placeholderName={t("City")}
              value={formData.CityId}
              onChange={handleChange}
            />
            {formData?.CityId === "" && (
              <span className="error-message">{errors?.CityId}</span>
            )}
          </div>
          <div className="col-md-2">
            <Input
              type="text"
              autoComplete="off"
              lable="Route"
              id="Route"
              className="required-fields"
              placeholder=" "
              max={20}
              name="Route"
              value={formData?.Route}
              onChange={handleCheckBoxChange}
            />
            {formData?.Route.trim() === "" && (
              <span className="error-message">{errors?.Route}</span>
            )}
            {formData?.Route.trim().length > 0 &&
              formData?.Route.trim().length && (
                <span className="error-message">{errors?.Routes}</span>
              )}
          </div>
          {/* <div className="col-md-1">
            <input
              name="IsActive"
              className="mt-1"
              type="checkbox"
              onChange={handleCheckBoxChange}
              checked={formData?.IsActive}
            />
            &nbsp;
            <label htmlFor="IsActive" className="control-label">
              {t("IsActive")}
            </label>
          </div> */}
          <div className="col-auto d-flex align-items-center justify-content-center p-2" style={{
            gap: "5px"
          }}>
            <label class="switch mb-0">
              <input
                type="checkbox"
                name="IsActive"
                checked={formData?.IsActive === true}
                onChange={handleCheckBoxChange}
              />
              <span class="slider"></span>
            </label>
            <strong>
              <span>{t("IsActive")}</span>
            </strong>
          </div>
          <div className="col-md-auto">
            {load ? (
              <Loading />
            ) : (
              // <button
              //   type="button"
              //   className={`btn btn-block ${
              //     formData?.Route ? "btn-success" : "btn-success"
              //   } btn-sm`}
              //   onClick={formData?.Route ? handleUpdate : handleSubmit}
              // >
              //   {formData?.Route ? t("Update") : t("Save")}
              // </button>
              <CustomButton
                text={isEdit ? t("Update") : t("Save")}
                icon={isEdit ? t("edit") : t("save")}
                onClick={isEdit ? handleUpdate : handleSubmit}
              />
            )}
          </div>
          <div className="col-md-auto">
            <CancelButton
              text={t("Cancel")}
              onClick={handleCancel}
            />
          </div>
        </div>
      </Accordion>

      <Accordion title={t("Search Details")} defaultValue={true}
        seconTitle={
          <>
            {colorsCodingData.map(({ color, labelKey, id }) => {
              const count =
                labelKey === "Active"
                  ? statusCounts?.active
                  : statusCounts?.deactive;

              return (
                <ColorCodingSearch
                  key={id}
                  color={color}
                  label={`${t(labelKey)}: ${count}`}
                />
              );
            })}

          </>
        }
      >
        <div className="row pt-2 pl-2 pr-2">
          <div className=" col-md-2">
            {/* <SelectBox
              options={NoofRecord}
              name="NoofRecord"
              lable="No.Of Records"
              id="Records"
              selectedValue={searchData?.NoofRecord}
              onChange={handleSearchChange}
            /> */}
            <ReactSelect
              dynamicOptions={NoofRecord}
              name="NoofRecord"
              lable="No.Of Records"
              id="Records"
              removeIsClearable={true}
              placeholderName={t("No.Of Records")}
              value={searchData?.NoofRecord}
              onChange={handleSearchChange}
            />
          </div>

          <div className="col-md-2">
            {/* <SelectBox
              options={[{ label: "Select State", value: "" }, ...statesSearch]}
              name="StateId"
              lable="Select State"
              id="Select State"
              selectedValue={searchData?.StateId}
              onChange={handleSearchChange}
            /> */}
            <ReactSelect
              dynamicOptions={[{ label: "Select State", value: "" }, ...statesSearch]}
              name="StateId"
              lable="Select State"
              id="Select State"
              removeIsClearable={true}
              placeholderName={t("Select State")}
              value={searchData?.StateId}
              onChange={handleSearchChange}
            />
          </div>

          <div className="col-md-2">
            {/* <SelectBox
              options={[{ label: "Select City", value: "" }, ...citySearch]}
              name="CityId"
              lable="Select City"
              id="Select City"
              selectedValue={searchData?.CityId}
              onChange={handleSearchChange}
            /> */}
            <ReactSelect
              dynamicOptions={[{ label: "Select City", value: "" }, ...citySearch]}
              name="CityId"
              lable="Select City"
              id="Select City"
              removeIsClearable={true}
              placeholderName={t("Select City")}
              value={searchData?.CityId}
              onChange={handleSearchChange}
            />
          </div>

          <div className="col-md-2">
            <Input
              lable="Route"
              id="Route"
              placeholder=" "
              type="text"
              name="Route"
              max={20}
              autoComplete="off"
              value={searchData?.Route}
              onChange={handleInputSearchChange}
            />
          </div>
          <div className="col-md-auto">
            {searchLoad ? (
              <Loading />
            ) : (
              <SearchButton
                text={t("Search")}
                onClick={() => handleSearch(searchData?.NoofRecord)}
              />
            )}
          </div>
          <div className="col-md-1">
            <ExportFile dataExcel={routeTable} />
          </div>
        </div>
        <Tables>
          <thead className="cf text-center" style={{ zIndex: 99 }}>
            <tr>
              <th className="text-center">{t("#")}</th>
              <th className="text-center">{t("Edit")}</th>
              <th className="text-center">{t("Route Name")}</th>
              <th className="text-center">{t("Business Zone")}</th>
              <th className="text-center">{t("State")}</th>
              <th className="text-center">{t("City")}</th>
              {/* <th className="text-center">{t("Status")}</th> */}
            </tr>
          </thead>
          {routeTable?.length > 0 && (
            <tbody>
              {routeTable.map((ele, index) => {
                const statusColor = colorsCodingData.find(
                  ({ labelKey }) => labelKey === (ele.IsActive === 1 ? "Active" : "Inactive")
                )?.color;
                return (
                  <>
                    <tr key={ele?.RouteId}
                      style={{
                        backgroundColor: statusColor || "transparent", backgroundImage: 'none',
                      }}>
                      <td data-title="#" className="text-center">
                        {index + 1}
                      </td>
                      <td data-title="Edit" className="text-center">
                        <Link
                          type="button"
                          // className="btn btn-primary btn-sm"
                          onClick={() => {
                            window.scroll(0, 0);
                            editRouteMaster(ele);
                            setIsEdit(true);
                          }}
                        >
                          {t("Edit")}
                        </Link>
                      </td>
                      <td data-title="Route Name" className="text-center">
                        {ele?.Route}
                      </td>
                      <td data-title="Business Zone" className="text-center">
                        {ele?.BusinessZoneName}
                      </td>
                      <td data-title="State" className="text-center">
                        {ele?.State}
                      </td>
                      <td data-title="City" className="text-center">
                        {ele?.City}
                      </td>
                      {/* <td data-title="Status" className="text-center">
                      {ele?.IsActive === 1 ? "Active" : "Inactive"}
                    </td> */}
                    </tr>
                  </>
                )

              })}
            </tbody>
          )}
        </Tables>
      </Accordion>
    </>
  );
};

export default RouteMaster;
