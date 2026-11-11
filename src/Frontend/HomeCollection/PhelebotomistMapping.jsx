import React, { useEffect, useState } from "react";
import { PhelebotomistMappingValdationSchema } from "../../utils/Schema";
import { toast } from "react-toastify";
import { SelectBox } from "../../components/formComponent/SelectBox";
import { useTranslation } from "react-i18next";
import Loading from "../../components/loader/Loading";

import Accordion from "@app/components/UI/Accordion";
import PhelebotomistMappingModal from "./PhelebotomistMappingModal";
import ExportFile from "../../components/formComponent/ExportFile";
import { Link } from "react-router-dom";
import { axiosInstance } from "../../utils/axiosInstance";
import Tables from "../../components/UI/customTable";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { CustomButton, SearchButton } from "../../components/UI/CustomButton";
const PhelebotomistMapping = () => {
  const [errors, setErros] = useState({});
  const [load, setLoad] = useState(false);
  const [businessZones, setBusinessZones] = useState([]);
  const [states, setStates] = useState([]);
  const [city, setCity] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [phelebo, setPhelebo] = useState([]);
  const [dropLocation, setDropLocation] = useState([]);
  const [formData, setFormData] = useState({
    BusinessZoneId: "",
    StateId: "",
    CityId: "",
  });
  const [searchdata, setSearchData] = useState([]);
  const [show, setShow] = useState({
    modal: false,
    index: -1,
    name: "",
  });

  const { t } = useTranslation();

  const handleSplitData = (id, symbol) => {
    const data = id?.split(symbol);
    return data;
  };

  const handleShow = (name, data, index) => {
    const { CityId, Pincode } = data;
    var dataObj = {};
    switch (name) {
      case "Route":
        getRoutes(CityId);
        dataObj = {
          apiUrl: "PhelebotomistMapping/BindAreaMultiple",
          payload: {
            CityId: CityId,
            PinCode: Pincode,
          },
        };
        break;
      case "Phelebo":
        getPhelebo(CityId, Pincode);
        dataObj = {
          apiUrl: "PhelebotomistMapping/BindAreaMultiplePhelbo",
          payload: {
            CityId: CityId,
            PinCode: Pincode,
          },
        };
        break;
      case "DropLocation":
        getDropLocation(CityId, Pincode);
        dataObj = {
          apiUrl: "PhelebotomistMapping/BindAreaMultipleDropLocation",
          payload: {
            CityId: CityId,
            PinCode: Pincode,
          },
        };
        break;
      default:
        break;
    }

    setShow({ index: index, modal: true, name: name, dataObj: dataObj });
  };

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

  const getCity = (value) => {
    axiosInstance
      .post("CommonHC/GetCityData", {
        StateId: [value],
      })
      .then((res) => {
        const data = res?.data?.message;
        const cities = data?.map((ele) => {
          return {
            value: handleSplitData(ele?.ID, "#")[0],
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

  const handleChange = (name, e) => {
    const value = e?.value ?? "";
    if (name === "BusinessZoneId") {
      getStates(value);
      setFormData({
        ...formData,
        [name]: value,
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
        [name]: value,
        CityId: "",
      });
      setCity([]);
    }

    if (name === "CityId") {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };
  console.log(searchdata);
  const handleSearch = () => {
    setLoad(true);

    const generatedError = PhelebotomistMappingValdationSchema(formData);

    if (generatedError === "") {
      axiosInstance
        .post("PhelebotomistMapping/GetPhelebotomistData", {
          CityId: formData?.CityId,
        })
        .then((res) => {
          const data = res?.data?.message;
          console.log(data);
          const finalData = data?.map((ele) => {
            return {
              ...ele,
              Phelbo: ele?.Phelbo ? handleSplitData(ele?.Phelbo, "^") : "",
              PhelboIdNew: !["", "0"].includes(ele?.PhelboId)
                ? handleSplitData(ele?.PhelboId, "^")
                : "",
              DropLocation: !["", "0"].includes(ele?.DropLocation)
                ? handleSplitData(ele?.DropLocation, "^")
                : "",
              DropLocationIdNew: !["", "0"].includes(ele?.DropLocationId)
                ? handleSplitData(
                  handleSplitData(ele?.DropLocationId, "^")[0],
                  "#",
                )
                : "",
            };
          });
          console.log(finalData);
          setSearchData(finalData);
          setLoad(false);
        })
        .catch((err) => {
          setLoad(false);
          setSearchData([]);
          toast.error(
            err?.response?.data?.message
              ? err?.response?.data?.message
              : "Error Occured",
          );
        });
    } else {
      setErros(generatedError);
      setSearchData([]);
      setLoad(false);
    }
  };

  const getRoutes = (value) => {
    axiosInstance
      .post("PhelebotomistMapping/BindRoute", {
        CityId: value,
      })
      .then((res) => {
        const data = res?.data?.message;
        const routes = data?.map((ele) => {
          return {
            value: ele?.RouteId,
            label: ele?.Route,
          };
        });
        // routes?.unshift({ label: t("Select Routes"), value: "" });
        setRoutes(routes);
      })
      .catch((err) => {
        console.log(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Error Occured",
        );
      });
  };

  const getPhelebo = (value) => {
    axiosInstance
      .post("PhelebotomistMapping/BindPhelbo", {
        CityId: value,
      })
      .then((res) => {
        const data = res?.data?.message;
        const phelebo = data?.map((ele) => {
          return {
            value: ele?.PheleboId,
            label: ele?.Name,
          };
        });
        // phelebo?.unshift({ label: t("Select Phelebo"), value: "" });
        setPhelebo(phelebo);
      })
      .catch((err) => {
        console.log(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Error Occured",
        );
      });
  };

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

  const handleClose = () => {
    setShow({ index: -1, modal: false, name: "" });
    handleSearch();
  };

  const getDropLocation = () => {
    axiosInstance
      .get("Centre/getAccessCentres")
      .then((res) => {
        const data = res?.data?.message;
        const dropLocation = data.map((ele) => {
          return {
            value: ele?.CentreID,
            label: ele?.Centre,
          };
        });
        // dropLocation.unshift({ label: t("Select Drop Location"), value: "" });

        setDropLocation(dropLocation);
      })
      .catch((err) => {
        toast.error(err?.res?.data ? err?.res?.data : "Something Went Wrong");
      });
  };

  useEffect(() => {
    getBusinessZones();
    getDropLocation();
  }, []);

  return (
    <>
      <Accordion
        name={t("Phlebotomist Mapping")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row pt-2 pl-2 pr-2">
          <div className="col-sm-12 col-md-2">
            {/* <SelectBox
              options={[
                { label: "Select Business Zone", value: "" },
                ...businessZones,
              ]}
              className="required-fields"
              name="BusinessZoneId"
              lable="Business Zone"
              id="Business Zone"
              selectedValue={formData?.BusinessZoneId}
              onChange={handleChange}
            /> */}

            <ReactSelect
              dynamicOptions={[
                { label: "Select Business Zone", value: "" },
                ...businessZones,
              ]}
              name="BusinessZoneId"
              lable="Business Zone"
              id="Business Zone"
              removeIsClearable={true}
              placeholderName={t("Centre")}
              value={formData?.BusinessZoneId}
              onChange={handleChange}
            />

            {formData?.BusinessZoneId === "" && (
              <span className="error-message">{errors?.BusinessZoneId}</span>
            )}
          </div>

          <div className="col-sm-12 col-md-2">
            {/* <SelectBox
              options={[{ label: "Select State", value: "" }, ...states]}
              className="required-fields"
              name="StateId"
              lable="State"
              id="State"
              selectedValue={formData?.StateId}
              onChange={handleChange}
            /> */}
            <ReactSelect
              dynamicOptions={[{ label: "Select State", value: "" }, ...states]}
              className="required-fields"
              name="StateId"
              lable="State"
              id="State"
              removeIsClearable={true}
              placeholderName={t("State")}
              value={formData?.StateId}
              onChange={handleChange}
              isDisabled={!states || states.length === 0}
            />
            {formData?.StateId === "" && (
              <span className="error-message">{errors?.StateId}</span>
            )}
          </div>

          <div className="col-sm-12 col-md-2">
            {/* <SelectBox
              options={[{ label: "Select City", value: "" }, ...city]}
              name="CityId"
              className="required-fields"
              lable="City"
              id="City"
              selectedValue={formData.CityId}
              onChange={handleChange}
            /> */}
            <ReactSelect
              dynamicOptions={[{ label: "Select City", value: "" }, ...city]}
              name="CityId"
              className="required-fields"
              lable="City"
              id="City"
              removeIsClearable={true}
              placeholderName={t("City")}
              value={formData.CityId}
              onChange={handleChange}
              isDisabled={!city || city.length === 0}
            />
            {formData?.CityId === "" && (
              <span className="error-message">{errors?.CityId}</span>
            )}
          </div>
          <div className="col-md-auto">
            {load ? (
              <Loading />
            ) : (
              // <button
              //   type="Search"
              //   className="btn btn-block btn-success btn-sm"
              //   onClick={handleSearch}
              // >
              //   {t("Search")}
              // </button>
              <SearchButton
                text={t("Search")}
                onClick={handleSearch}
                loading={load}
              />
            )}
          </div>
          <div className="col-md-1 col-sm-6 col-xs-12">
            <ExportFile dataExcel={searchdata} />
          </div>
        </div>
      </Accordion>
      {searchdata?.length > 0 && (
        <Accordion title={t("Search Details")} defaultValue={true}>
          <Tables>
            <thead
              className="cf text-center "
              style={{ zIndex: 99, maxWidth: "100%", maxHeight: "100%" }}
            >
              <tr>
                <th className="text-center">{t("S.No")}</th>
                <th className="text-center">{t("City")}</th>
                <th className="text-center">{t("Area")}</th>
                <th className="text-center">{t("PinCode")}</th>
                <th className="text-center">{t("Route")}</th>
                <th className="text-center">{t("Phelebo")}</th>
                <th className="text-center">{t("Drop Location")}</th>
              </tr>
            </thead>

            {searchdata?.length > 0 && (
              <tbody style={{ position: "relative" }}>
                {searchdata?.map((ele, index) => (
                  <>
                    {show?.modal && index === show?.index && (
                      <PhelebotomistMappingModal
                        show={show?.modal}
                        handleClose={handleClose}
                        name={show?.name}
                        dataObj={show?.dataObj}
                        Innerdata={ele}
                        routes={routes}
                        phelebo={phelebo}
                        dropLocation={dropLocation}
                      />
                    )}
                    <tr key={index}>
                      <td data-title="S.no" className="text-center">
                        {index + 1}&nbsp;
                      </td>

                      <td data-title="City" className="text-center">
                        {ele?.City}&nbsp;
                      </td>
                      <td data-title="Area" className="text-center">
                        {ele?.location}&nbsp;
                      </td>
                      <td data-title="PinCode" className="text-center">
                        {ele?.Pincode}&nbsp;
                      </td>
                      <td
                        data-title="Route"
                        className="text-center PheloMapTable"
                        onClick={() => handleShow("Route", ele, index)}
                      >
                        <div name="Route" className="routes ">
                          {ele?.Route?.length > 0 && (
                            <div className="routesChild" key={index}>
                              {ele?.Route}&nbsp;
                            </div>
                          )}
                        </div>
                      </td>
                      <td
                        data-title="Phelebo"
                        className="text-center PheloMapTable"
                        onClick={() => handleShow("Phelebo", ele, index)}
                      >
                        <div name="Phelebo" className="phelebo_Drop">
                          &nbsp;
                          {ele?.Phelbo?.length > 0 &&
                            ele?.Phelbo?.map(
                              (ele, index) =>
                                [0, 1, 2].includes(index) && (
                                  <div
                                    className="phelebo_Drop_Child"
                                    key={index}
                                  >
                                    {[0, 1].includes(index) ? ele : "More..."}
                                  </div>
                                ),
                            )}
                        </div>
                      </td>
                      <td
                        data-title="DropLocation"
                        className="text-center PheloMapTable"
                        onClick={() => handleShow("DropLocation", ele, index)}
                      >
                        <div name="Phelebo" className="phelebo_Drop">
                          &nbsp;
                          {ele?.DropLocation?.length > 0 &&
                            ele?.DropLocation?.map(
                              (ele, index) =>
                                [0, 1, 2].includes(index) && (
                                  <div
                                    className="phelebo_Drop_Child"
                                    key={index}
                                  >
                                    &nbsp;
                                    {[0, 1].includes(index) ? ele : "More..."}
                                  </div>
                                ),
                            )}
                        </div>
                      </td>
                    </tr>
                  </>
                ))}
              </tbody>
            )}
          </Tables>
        </Accordion>
      )}
    </>
  );
};

export default PhelebotomistMapping;
