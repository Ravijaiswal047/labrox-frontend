import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { axiosInstance } from "../../utils/axiosInstance";
import { PreventSpecialCharacterandNumber } from "../util/Commonservices";
import { AllowCharactersNumbersAndSpecialChars } from "../../utils/helpers";
import Accordion from "@app/components/UI/Accordion";
import Input from "../../components/formComponent/Input";
import { SelectBox } from "../../components/formComponent/SelectBox";
import Loading from "../../components/loader/Loading";
import Tables from "../../components/UI/customTable";
import moment from "moment";
import { Dialog } from "primereact/dialog";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { CustomButton, EditButton, SaveButton, SearchButton } from "../../components/UI/CustomButton"

const LocationMaster = () => {
  const [formData, setFormdata] = useState({
    LocalityID: "",
    update: false,
    BusinessZoneName: "",
    IsActive: [true, true, true, true, true],
    loading: [false, false, false, false, false],
    regions: [],
    states: [],
    zonelist: [],
    regionforstate: "",
    regionforcity: "",
    newState: "",
    zoneid: "",
    cityregion: "",
    stateforcity: "",
    newcity: "",
    regionforlocality: "",
    stateforlocality: "",
    cityforlocality: "",
    statesforlocality: [],
    citiesforlocality: [],
    cities: [],
    locality: "",
    stateZone: "",
  });
  const [searchData, setSearchData] = useState({
    searchZone: "",
    searchState: "",
    searchCity: "",
    states: [],
    cities: [],
  });
  const [show, setShow] = useState({
    zone: false,
    state: false,
    city: false,
    location: false,
  });
  const [create, setCreate] = useState("zone");

  const [updateLoading, setUpdateLoading] = useState([false, false]);
  const [showState, setShowState] = useState(false);
  const [showCity, setShowCity] = useState(false);
  const [showzone, setShowZone] = useState(false);
  const [locationTable, setLocationTable] = useState([]);
  const [ModifyState, setModifyState] = useState({
    initialZone: "",
    finalZone: "",
    State: "",
    IsActive: true,
    StateID: "",
    states: [],
    cities: [],
  });
  const [ModifyCity, setModifyCity] = useState({
    regionmodifycity: "",
    statemodifycity: "",
    cityTomodify: "",
    newcity: "",
    IsActive: true,
    states: [],
    cities: [],
  });
  const { t } = useTranslation();
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e?.target;

    if (name == "newState" || name == "newcity") {
      setFormdata({ ...formData, [name]: value });
    } else if (name === "BusinessZoneName") {
      setFormdata({ ...formData, [name]: value });
    } else if (name == "locality") {
      setFormdata({ ...formData, [name]: value });
    } else {
      setFormdata({
        ...formData,
        [name]: type === "checkbox" ? checked : value,
      });
    }
  };
  const handleChange = (name, e) => {
    const value = e?.value ?? "";

    if (name == "stateforlocality") {
      if (value != "") {
        bindCities(value);
      }
      setFormdata({
        ...formData,
        [name]: value,
        citiesforlocality: [],
        cityforlocality: "",
      });
    } else if (name == "cityregion") {
      if (value != "") {
        bindStates(value, "states");
      }
      setFormdata({
        ...formData,
        [name]: value,
        states: [],
        stateforcity: "",
      });
    } else if (name == "regionforlocality") {
      if (value != "") {
        bindStates(value, "statesforlocality");
      }
      setFormdata({
        ...formData,
        [name]: value,
        citiesforlocality: [],
        cityforlocality: "",
        stateforlocality: "",
        statesforlocality: [],
      });
    } else if (name == "newState" || name == "newcity") {
      setFormdata({ ...formData, [name]: value });
    } else if (name === "BusinessZoneName") {
      setFormdata({ ...formData, [name]: value });
    } else if (name == "locality") {
      setFormdata({ ...formData, [name]: value });
    } else {
      setFormdata({
        ...formData,
        [name]: value,
      });
    }
  };
  const handleSaveZone = () => {
    console.log(formData);
    setFormdata((prevFormData) => ({
      ...prevFormData,
      loading: prevFormData.loading.map((value, index) =>
        index === 0 ? true : value,
      ),
    }));

    if (formData?.BusinessZoneName.trim().length > 2) {
      axiosInstance
        .post("LocationMaster/SaveZone", {
          BusinessZoneName: formData?.BusinessZoneName.trim(),
          IsActive: formData?.IsActive[0] == true ? "1" : "0",
        })
        .then((res) => {
          toast.success(
            res?.data?.message
              ? res?.data?.message
              : "Zone created successfully",
          );
          setFormdata({
            ...formData,
            BusinessZoneName: "",
            IsActive: [true, ...formData.IsActive.slice(1)],
            loading: formData.loading.map((value, index) =>
              index === 0 ? false : value,
            ),
          });
          getRegions();
          // window.location.reload();
        })
        .catch((err) => {
          toast.error(
            err?.response?.data?.message
              ? err?.response?.data?.message
              : "Could not Save",
          );
          setFormdata((prevFormData) => ({
            ...prevFormData,
            loading: prevFormData.loading.map((value, index) =>
              index === 0 ? false : value,
            ),
          }));
        });
    } else {
      toast.error("Zone Name must have 3 characters");
      setFormdata((prevFormData) => ({
        ...prevFormData,
        loading: prevFormData.loading.map((value, index) =>
          index === 0 ? false : value,
        ),
      }));
    }
  };
  const handleSearch = () => {
    setFormdata((prevFormData) => ({
      ...prevFormData,
      loading: prevFormData.loading.map((value, index) =>
        index === 4 ? true : value,
      ),
    }));

    // console.log("searchData",searchData);
    let payload = {
      StateID: searchData?.searchState || 0,
      BusinessZoneID: String(searchData?.searchZone) || 0,
      CityID: searchData?.searchCity || 0,
    };
    axiosInstance
      .post("LocationMaster/GetLocality", payload)
      .then((res) => {
        console.log(res?.data?.message);
        if (res?.data?.success) {
          setLocationTable(
            Array.isArray(res?.data?.message) ? res.data.message : []
          );
        } else {
          setLocationTable([]);
          toast.error(res?.data?.message);
        }
        setFormdata((prevFormData) => ({
          ...prevFormData,
          loading: prevFormData.loading.map((value, index) =>
            index === 4 ? false : value,
          ),
        }));
      })
      .catch((err) => {
        toast.error(err?.response?.data.message);

        setFormdata((prevFormData) => ({
          ...prevFormData,
          loading: prevFormData.loading.map((value, index) =>
            index === 4 ? false : value,
          ),
        }));
      });
  };

  const editLocation = (ele) => {
    console.log(ele);
  };
  const handleModal = (type) => {
    switch (type) {
      case "state":
        setShowState(true);
        break;
      case "city":
        setShowCity(true);
        break;
      case "zone":
        setShowZone(true);
        break;
    }
  };

  const getRegions = () => {
    axiosInstance
      .get("LocationMaster/GetZone")
      .then((res) => {
        const regions = res.data.message.map((region) => ({
          label: region.BusinessZoneName,
          value: region.BusinessZoneID,
        }));

        setFormdata((prevFormData) => ({
          ...prevFormData,
          regions: regions,
        }));
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message);
      });
  };
  const bindStates = (value, name) => {
    console.log(name);
    axiosInstance
      .post("LocationMaster/GetState", {
        BusinessZoneID: value?.toString(),
      })
      .then((res) => {
        const states = res.data.message.map((region) => ({
          label: region.State,
          value: region.StateId,
        }));

        setFormdata((prevFormData) => ({
          ...prevFormData,
          [name]: states,
        }));
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Something went wrong",
        );
      });
  };

  const handleCityUpdate = () => {
    console.log(ModifyCity);
    setUpdateLoading([false, true]);
    let payload = {
      City: ModifyCity?.newcity.trim(),
      CityID: ModifyCity?.cityTomodify?.toString(),
      IsActive: ModifyCity?.IsActive ? "1" : "0",
    };
    if (payload?.City.length > 2) {
      axiosInstance
        .post("LocationMaster/UpdateCity", payload)
        .then((res) => {
          toast.success("City updated successfully");
          setModifyCity({
            regionmodifycity: "",
            statemodifycity: "",
            cityTomodify: "",
            newcity: "",
            IsActive: true,
            states: [],
            cities: [],
          });
          // window.location.reload();
          setUpdateLoading([false, false]);
          setShowCity(false);
        })
        .catch((err) => {
          toast.error(err?.response?.data?.message);
          setUpdateLoading([false, false]);
        });
    } else {
      setUpdateLoading([false, false]);
      toast.error("City Name should have atleast 3 character");
    }
  };

  const handleSavestate = () => {
    console.log(formData);
    setFormdata((prevFormData) => ({
      ...prevFormData,
      loading: prevFormData.loading.map((value, index) =>
        index === 1 ? true : value,
      ),
    }));

    const payload = {
      State: formData?.newState.trim(),
      IsActive: formData?.IsActive[1] == true ? "1" : "0",
      BusinessZoneID: formData?.stateZone?.toString() || "0",
    };
    if (payload?.State.length > 3) {
      axiosInstance
        .post("LocationMaster/SaveState", payload)
        .then((res) => {
          toast.success(
            res?.data?.message
              ? res?.data?.message
              : "State created successfully",
          );
          setFormdata({
            ...formData,
            newState: "",
            stateZone: "",
            IsActive: [
              formData.IsActive[0],
              true,
              ...formData.IsActive.slice(2),
            ],
            loading: formData?.loading.map((value, index) =>
              index === 1 ? false : value,
            ),
          });
          // window.location.reload();
        })
        .catch((err) => {
          toast.error(
            err?.response?.data?.message
              ? err?.response?.data?.message
              : "Could not Save",
          );
          setFormdata((prevFormData) => ({
            ...prevFormData,
            loading: prevFormData.loading.map((value, index) =>
              index === 1 ? false : value,
            ),
          }));
        });
    } else {
      setFormdata((prevFormData) => ({
        ...prevFormData,
        loading: prevFormData.loading.map((value, index) =>
          index === 1 ? false : value,
        ),
      }));
      toast.error("State Name Must have 3 characters");
    }
  };

  const handleCheckboxChange = (event, index) => {
    const { name, checked } = event.target;

    setFormdata((prevFormData) => {
      let updatedIsActive = [...prevFormData.IsActive];
      updatedIsActive[index] = checked;

      return {
        ...prevFormData,
        IsActive: updatedIsActive,
      };
    });
  };
  const handleSaveCity = () => {
    setFormdata((prevFormData) => ({
      ...prevFormData,
      loading: prevFormData.loading.map((value, index) =>
        index === 2 ? true : value,
      ),
    }));

    const payload = {
      City: formData?.newcity,
      StateID: (formData?.stateforcity).toString(),
      IsActive: formData?.IsActive[2] == true ? "1" : "0",
    };
    if (payload?.City.trim().length > 2) {
      axiosInstance
        .post("LocationMaster/SaveCity", payload)
        .then((res) => {
          toast.success(
            res?.data?.message
              ? res?.data?.message
              : "City Created Successfully",
          );
          setFormdata({
            ...formData,
            cityregion: "",
            stateforcity: "",
            newcity: "",
            loading: formData.loading.map((value, index) =>
              index === 2 ? false : value,
            ),
            IsActive: [
              formData.IsActive[0],
              formData.IsActive[1],
              true,
              ...formData.IsActive.slice(3),
            ],
          });
          // window.location.reload();
        })
        .catch((err) => {
          toast.error(
            err?.response?.data?.message
              ? err?.response?.data?.message
              : "Could not save",
          );
          setFormdata((prevFormData) => ({
            ...prevFormData,
            loading: prevFormData.loading.map((value, index) =>
              index === 2 ? false : value,
            ),
          }));
        });
    } else {
      setFormdata((prevFormData) => ({
        ...prevFormData,
        loading: prevFormData.loading.map((value, index) =>
          index === 2 ? false : value,
        ),
      }));
      toast.error("City Name must have 3 characters");
    }
  };
  const getIsActive = (value, Type) => {
    console.log(value, Type);
    const getSelected = Type.filter((ele) => {
      return ele.value == value;
    });
    console.log(getSelected);
    return getSelected[0].IsActive;
  };
  const handleEditLocality = (ele) => {
    console.log(ele);
    setCreate("location");
    bindStates(ele?.BusinessZoneID, "statesforlocality");
    bindCities(ele?.StateID);
    const isActive = ele?.Active == "Yes";
    setFormdata({
      ...formData,
      regionforlocality: ele?.BusinessZoneID,
      stateforlocality: ele?.StateID,
      cityforlocality: ele?.CityID,
      locality: ele?.LocalityName,
      update: true,
      LocalityID: ele?.ID,
      IsActive: [
        formData.IsActive[0],
        formData.IsActive[1],
        formData.IsActive[2],
        isActive,
        ...formData.IsActive.slice(4),
      ],
    });
    window.scroll(0, 0);
  };

  console.log(formData);

  const bindCities = (value) => {
    axiosInstance
      .post("LocationMaster/bindCity", {
        StateID: value,
      })
      .then((res) => {
        const data = res?.data?.message;

        const cities = data.map((item) => {
          return {
            label: item?.City,
            value: item?.ID,
          };
        });

        setFormdata((prevFormData) => ({
          ...prevFormData,
          citiesforlocality: cities,
        }));
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Something Went Wrong",
        );
      });
  };

  const handleSaveLocality = () => {
    setFormdata((prevFormData) => ({
      ...prevFormData,
      loading: prevFormData.loading.map((value, index) =>
        index === 3 ? true : value,
      ),
    }));

    const payload = {
      Locality: formData?.locality.trim(),
      ZoneID: formData?.regionforlocality?.toString(),
      StateID: formData?.stateforlocality?.toString(),
      CityID: formData?.cityforlocality?.toString(),
      IsActive: formData?.IsActive[3] == true ? "1" : "0",
    };

    if (payload?.Locality.length > 2) {
      axiosInstance
        .post("LocationMaster/SaveLocality", payload)
        .then((res) => {
          toast.success(
            res?.data?.message
              ? res?.data?.message
              : "Locality Created Successfully",
          );
          setFormdata({
            ...formData,
            locality: "",
            regionforlocality: "",
            stateforlocality: "",
            cityforlocality: "",
            citiesforlocality: [],
            statesforlocality: [],
            loading: formData.loading.map((value, index) =>
              index === 3 ? false : value,
            ),
            IsActive: [
              formData.IsActive[0],
              formData.IsActive[1],
              formData.IsActive[2],
              true,
              ...formData.IsActive.slice(4),
            ],
          });
        })
        .catch((err) => {
          toast.error(
            err?.response?.data?.message
              ? err?.response?.data?.message
              : "Could not save",
          );
          setFormdata({
            ...formData,
            loading: formData.loading.map((value, index) =>
              index === 3 ? false : value,
            ),
          });
        });
    } else {
      toast.error("Locality length must have 3 characters");
      setFormdata((prevFormData) => ({
        ...prevFormData,
        loading: prevFormData.loading.map((value, index) =>
          index === 3 ? false : value,
        ),
      }));
    }
  };
  const handleSearchChange = (name, e) => {
    const value = e?.value ?? "";
    if (name == "searchZone") {
      if (value != "") {
        bindsearchstates(value?.toString());
      }
      setSearchData({
        ...searchData,
        [name]: value,
        states: [],
        cities: [],
        searchCity: "",
        searchState: "",
      });
    } else if (name == "searchState") {
      if (value != "") {
        bindsearchCities(value?.toString());
      }
      setSearchData({
        ...searchData,
        [name]: value,
        cities: [],
        searchCity: "",
      });
    } else if (name == "searchCity") {
      setSearchData({ ...searchData, [name]: value });
    }
  };
  const bindsearchstates = (value) => {
    axiosInstance
      .post("LocationMaster/GetState", {
        BusinessZoneID: value,
      })
      .then((res) => {
        const states = res.data.message.map((region) => ({
          label: region.State,
          value: region.StateId,
        }));

        setSearchData((prevFormData) => ({
          ...prevFormData,
          states: states,
        }));
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Something went wrong",
        );
      });
  };
  const bindsearchCities = (value) => {
    axiosInstance
      .post("LocationMaster/bindCity", {
        StateID: value,
      })
      .then((res) => {
        const data = res?.data?.message;

        const cities = data.map((item) => {
          return {
            label: item?.City,
            value: item?.ID,
          };
        });

        setSearchData((prevFormData) => ({
          ...prevFormData,
          cities: cities,
        }));
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Something Went Wrong",
        );
      });
  };
  const handleInputModifyState = (e) => {
    const { name, value, type, checked } = e?.target;

    if (name == "State") {
      setModifyState({
        ...ModifyState,
        [name]: type === "checkbox" ? checked : value,
      });
    }
    else {
      setModifyState({
        ...ModifyState,
        [name]: type === "checkbox" ? checked : value,
      });
    }
  };
  const handleModifyState = (name, e) => {
    const { value } = e;
    if (name == "initialZone") {
      axiosInstance
        .post("LocationMaster/GetAllState", {
          BusinessZoneID: value?.toString(),
        })
        .then((res) => {
          const states = res.data.message.map((region) => ({
            label: region.State,
            value: region.StateId,
            IsActive: region.IsActive == 1 ? true : false,
          }));

          setModifyState({
            ...ModifyState,
            states: states,
            [name]: value,
            StateID: "",
            State: "",
          });
        })
        .catch((err) => {
          toast.error(
            err?.response?.data?.message
              ? err?.response?.data?.message
              : "Something went wrong",
          );
          setModifyState({
            ...ModifyState,
            [name]: value,
            states: [],
            StateID: "",
            State: "",
          });
        });
    }
    // else if (name == "State") {
    //   setModifyState({
    //     ...ModifyState,
    //     [name]: type === "checkbox" ? checked : value,
    //   });
    // } 
    else if (name == "StateID") {
      if (value != "") {
        setModifyState({
          ...ModifyState,
          [name]: value,
          State: "",
          IsActive: getIsActive(value, ModifyState?.states),
        });
      }
    }
    else {
      setModifyState({
        ...ModifyState,
        [name]: value,
      });
    }
  };
  const handleInputModifyCity = (e) => {
    const { name, value, type, checked } = e?.target;

    if (name == "newcity") {
      setModifyCity({
        ...ModifyCity,
        [name]: type === "checkbox" ? checked : value,
      });
    } else {
      setModifyCity({
        ...ModifyCity,
        [name]: type === "checkbox" ? checked : value,
      });
    }
  };
  const handleModifyCity = (name, e) => {
    const { value } = e;
    if (name == "regionmodifycity") {
      axiosInstance
        .post("LocationMaster/GetAllState", {
          BusinessZoneID: value?.toString(),
        })
        .then((res) => {
          const states = res.data.message.map((region) => ({
            label: region.State,
            value: region.StateId,
          }));
          console.log(res.data.message, states);

          setModifyCity({
            ...ModifyCity,
            states: states,
            [name]: value,
            cities: [],
            statemodifycity: "",
            cityTomodify: "",
          });
        })
        .catch((err) => {
          toast.error(
            err?.response?.data?.message
              ? err?.response?.data?.message
              : "Something went wrong",
          );
          setModifyCity({
            ...ModifyCity,
            [name]: value,
            states: [],
            cities: [],
            statemodifycity: "",
            cityTomodify: "",
          });
        });
    } else if (name == "statemodifycity") {
      axiosInstance
        .post("LocationMaster/bindAllCity", {
          StateID: value?.toString(),
        })
        .then((res) => {
          const cities = res.data.message.map((region) => ({
            label: region.City,
            value: region.ID,
            IsActive: region?.IsActive,
          }));

          setModifyCity({
            ...ModifyCity,
            cities: cities,
            [name]: value,
            cityTomodify: "",
          });
        })
        .catch((err) => {
          toast.error(
            err?.response?.data?.message
              ? err?.response?.data?.message
              : "Something went wrong",
          );
          setModifyCity({
            ...ModifyCity,
            cities: [],
            [name]: value,
            cityTomodify: "",
          });
        });
    } else if (name == "cityTomodify") {
      if (value != "") {
        setModifyCity({
          ...ModifyCity,
          [name]: value,
          IsActive: getIsActive(value, ModifyCity?.cities),
        });
      }
    }
    // else if (name == "newcity") {
    //   setModifyCity({
    //     ...ModifyCity,
    //     [name]: type === "checkbox" ? checked : value,
    //   });
    // } 
    else {
      setModifyCity({
        ...ModifyCity,
        [name]: value,
      });
    }
  };
  console.log(ModifyState);
  const handleUpdateLocality = () => {
    setFormdata((prevFormData) => ({
      ...prevFormData,
      loading: prevFormData.loading.map((value, index) =>
        index === 3 ? true : value,
      ),
    }));
    const payload = {
      Locality: formData?.locality.trim(),
      BusinessZoneID: `${formData?.regionforlocality}`,
      StateID: `${formData?.stateforlocality}`,
      CityID: `${formData?.cityforlocality}`,
      IsActive: formData?.IsActive[3] == true ? "1" : "0",
      LocalityID: `${formData?.LocalityID}`,
    };

    if (payload?.Locality.trim().length > 2) {
      axiosInstance
        .post("LocationMaster/UpdateLocality", payload)
        .then((res) => {
          toast.success(
            res?.data?.message
              ? res?.data?.message
              : "Locality Updated Successfully",
          );
          setFormdata({
            ...formData,
            locality: "",
            regionforlocality: "",
            stateforlocality: "",
            cityforlocality: "",
            citiesforlocality: [],
            statesforlocality: [],
            loading: formData.loading.map((value, index) =>
              index === 3 ? false : value,
            ),
            IsActive: [
              formData.IsActive[0],
              formData.IsActive[1],
              formData.IsActive[2],
              true,
              ...formData.IsActive.slice(4),
            ],
          });
          handleSearch();
          //   window.location.reload();
        })
        .catch((err) => {
          toast.error(
            err?.response?.data?.message
              ? err?.response?.data?.message
              : "Could Not Update",
          );
          setFormdata((prevFormData) => ({
            ...prevFormData,
            loading: prevFormData.loading.map((value, index) =>
              index === 3 ? false : value,
            ),
          }));
        });
    } else {
      toast.error(" Locality Name Must have 3 characters");
      setFormdata((prevFormData) => ({
        ...prevFormData,
        loading: prevFormData.loading.map((value, index) =>
          index === 3 ? false : value,
        ),
      }));
    }
  };

  const handleStateUpdate = () => {
    console.log(ModifyState);
    setUpdateLoading([true, false]);
    const payload = {
      BusinessZoneID:
        ModifyState?.finalZone != ""
          ? ModifyState?.finalZone
          : ModifyState?.initialZone,
      State: ModifyState?.State.trim(),
      IsActive: ModifyState?.IsActive == true ? "1" : "0",
      StateID: ModifyState?.StateID,
    };
    if (payload?.State.length > 2) {
      axiosInstance
        .post("LocationMaster/UpdateState", payload)
        .then((res) => {
          toast.success("Updated succesfully");
          setShowState(false);
          setModifyState({
            initialZone: "",
            finalZone: "",
            State: "",
            IsActive: true,
            StateID: "",
            states: [],
          });
          // window.location.reload();
          setUpdateLoading([false, false]);
        })
        .catch((err) => {
          setUpdateLoading([false, false]);
          toast.error(
            err?.response?.data?.message
              ? err?.response?.data?.message
              : "Could not update",
          );
        });
    } else {
      toast.error("State Name must have 3 characters");
      setUpdateLoading([false, false]);
    }
  };
  useEffect(() => {
    getRegions();
  }, []);
  const handleRadioChange = (event) => {
    setCreate(event?.target?.value);
  };

  const theme = useLocalStorage("theme", "get");

  return (
    <>
      <Accordion
        name={t("Location Master")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row pt-2 pl-2 pr-2">
          <label className="col-sm-1 pt-1">Select To Create</label>
          <div className="col-sm-1 mt-1 d-flex">
            <div className="mt-1">
              <input
                type="radio"
                name="create"
                value="zone"
                checked={create == "zone"}
                onChange={handleRadioChange}
              />
            </div>
            <label className="ml-2">{t("Zone")}</label>
          </div>
          <div className="col-sm-1 mt-1 d-flex">
            <div className="mt-1">
              <input
                type="radio"
                name="create"
                value="state"
                checked={create == "state"}
                onChange={handleRadioChange}
              />
            </div>
            <label className="ml-2">{t("State")}</label>
          </div>
          <div className="col-sm-1 mt-1 d-flex">
            <div className="mt-1">
              <input
                type="radio"
                name="create"
                value="city"
                checked={create == "city"}
                onChange={handleRadioChange}
              />
            </div>
            <label className="ml-2">{t("City")}</label>
          </div>
          <div className="col-sm-1 mt-1 d-flex">
            <div className="mt-1">
              <input
                type="radio"
                name="create"
                value="location"
                checked={create == "location"}
                onChange={handleRadioChange}
              />
            </div>
            <label className="ml-2">{t("Location")}</label>
          </div>
        </div>
      </Accordion>
      {create == "zone" && (
        <Accordion title={t("Region")} defaultValue={true}>
          <div className="row pt-2 pl-2 pr-2">
            {/* <label className="col-sm-1" htmlFor="inputEmail3">
              {t("Region:")}
            </label> */}
            <div className="col-sm-2">
              <Input
                className="required-fields"
                name="BusinessZoneName"
                lable={"Enter Zone"}
                id="BusinessZoneName"
                onChange={handleInputChange}
                max={10}
                value={formData?.BusinessZoneName}
                placeholder=""
              />
            </div>
            {/* <div className="col-sm-1 mt-1 d-flex">
              <div className="mt-1">
                <input
                  name="regionActive"
                  type="checkbox"
                  onChange={(e) => handleCheckboxChange(e, 0)}
                  checked={formData.IsActive[0]}
                />
              </div>
              <label className="col-sm-10"> {t("IsActive")}</label>
            </div> */}
            <div className="col-auto d-flex align-items-center justify-content-center p-2" style={{
              gap: "5px"
            }}>
              <label class="switch mb-0">
                <input
                  type="checkbox"
                  checked={formData.IsActive[0] === true}
                  onChange={(e) => handleCheckboxChange(e, 0)}
                />
                <span class="slider"></span>
              </label>
              <strong>
                <span>{t("IsActive")}</span>
              </strong>
            </div>
            <div className="col-sm-1">
              {!formData?.loading[0] && (
                <SaveButton
                  text="Save"
                  onClick={handleSaveZone}
                  disabled={formData?.BusinessZoneName.length == 0}
                />
              )}
              {formData?.loading[0] && <Loading />}
            </div>
          </div>
        </Accordion>
      )}
      {create == "state" && (
        <Accordion title={t("State")} defaultValue={true}>
          <div className="row pt-2 pl-2 pr-2">
            <div className="col-sm-2">
              {/* <SelectBox
                name="stateZone"
                lable={t("Zone")}
                className="required-fields"
                options={[
                  { label: "Select Zone", value: "" },
                  ...formData?.regions,
                ]}
                onChange={handleChange}
                selectedValue={formData?.stateZone}
              /> */}
              <ReactSelect
                dynamicOptions={[
                  { label: "Select Zone", value: "" },
                  ...formData?.regions,
                ]}
                name="stateZone"
                lable={t("Zone")}
                className="required-fields"
                removeIsClearable={true}
                placeholderName={t("Zone")}
                value={formData?.stateZone}
                onChange={handleChange}
              />
            </div>
            <div className="col-sm-2">
              <Input
                name="newState"
                className="required-fields"
                lable={"Enter State"}
                onChange={handleInputChange}
                max={20}
                value={formData?.newState}
                placeholder=""
              />
            </div>
            <div className="col-auto d-flex align-items-center justify-content-center p-2" style={{
              gap: "5px"
            }}>
              <label class="switch mb-0">
                <input
                  type="checkbox"
                  checked={formData.IsActive[1] === true}
                  onChange={(e) => handleCheckboxChange(e, 1)}
                />
                <span class="slider"></span>
              </label>
              <strong>
                <span>{t("IsActive")}</span>
              </strong>
            </div>
            <div className="col-sm-1">
              {!formData?.loading[1] && (
                <SaveButton
                  text={t("Save")}
                  onClick={handleSavestate}
                  disabled={formData?.stateZone == ""}
                />
              )}
              {formData?.loading[1] && <Loading />}
            </div>
            <div className="col-sm-1">
              <EditButton
                text={t("Modify")}
                onClick={() => {
                  handleModal("state");
                }}
              />
            </div>
          </div>
        </Accordion>
      )}
      {create == "city" && (
        <Accordion title={t("City")} defaultValue={true}>
          <div className="row pt-2 pl-2 pr-2">
            <div className="col-sm-2">
              {/* <SelectBox
                name="cityregion"
                lable="Zone"
                className="required-fields"
                options={[
                  { label: "Select Zone", value: "" },
                  ...formData?.regions,
                ]}
                onChange={handleChange}
                selectedValue={formData?.cityregion}
              /> */}
              <ReactSelect
                dynamicOptions={[
                  { label: "Select Zone", value: "" },
                  ...formData?.regions,
                ]}
                name="cityregion"
                lable="Zone"
                className="required-fields"
                removeIsClearable={true}
                placeholderName={t("Zone")}
                value={formData?.cityregion}
                onChange={handleChange}
              />
            </div>
            <div className="col-sm-2">
              {/* <SelectBox
                name="stateforcity"
                className="required-fields"
                lable="State"
                options={[
                  { label: "Select State", value: "" },
                  ...formData?.states,
                ]}
                onChange={handleChange}
                selectedValue={formData?.stateforcity}
              /> */}
              <ReactSelect
                dynamicOptions={[
                  { label: "Select State", value: "" },
                  ...formData?.states,
                ]}
                name="stateforcity"
                className="required-fields"
                lable="State"
                removeIsClearable={true}
                placeholderName={t("State")}
                value={formData?.stateforcity}
                onChange={handleChange}
              />
            </div>
            <div className="col-sm-2">
              <Input
                name="newcity"
                lable="Enter City"
                className="required-fields"
                onChange={handleInputChange}
                max={20}
                value={formData?.newcity}
                placeholder=""
              />
            </div>
            {/* <div className="col-sm-1 mt-1 d-flex">
              <div className="mt-1">
                <input
                  name="cityActive"
                  type="checkbox"
                  onChange={(e) => handleCheckboxChange(e, 2)}
                  checked={formData.IsActive[2]}
                />
              </div>
              <label className="col-sm-10"> {t("IsActive")}</label>
            </div> */}
            <div className="col-auto d-flex align-items-center justify-content-center p-2" style={{
              gap: "5px"
            }}>
              <label class="switch mb-0">
                <input
                  type="checkbox"
                  checked={formData.IsActive[2] === true}
                  onChange={(e) => handleCheckboxChange(e, 2)}
                />
                <span class="slider"></span>
              </label>
              <strong>
                <span>{t("IsActive")}</span>
              </strong>
            </div>
            <div className="col-sm-1">
              {!formData?.loading[2] && (
                <SaveButton
                  text={t("Save")}
                  onClick={handleSaveCity}
                  disabled={
                    formData?.stateforcity == "" || formData?.cityregion == ""
                  }
                />
              )}
              {formData?.loading[2] && <Loading />}
            </div>
            <div className="col-sm-1">
              <EditButton
                text={t("Modify")}
                onClick={() => {
                  handleModal("city");
                }}
              />
            </div>
          </div>
        </Accordion>
      )}
      {create == "location" && (
        <Accordion title={t("Locality")} defaultValue={true}>
          <div className="row pt-2 pl-2 pr-2">
            <div className="col-sm-2">
              {/* <SelectBox
                name="regionforlocality"
                lable="Zone"
                className="required-fields"
                options={[
                  { label: "Select Zone", value: "" },
                  ...formData?.regions,
                ]}
                onChange={handleChange}
                selectedValue={formData?.regionforlocality}
              /> */}
              <ReactSelect
                dynamicOptions={[
                  { label: "Select Zone", value: "" },
                  ...formData?.regions,
                ]}
                name="regionforlocality"
                lable="Zone"
                className="required-fields"
                removeIsClearable={true}
                placeholderName={t("Zone")}
                value={formData?.regionforlocality}
                onChange={handleChange}
              />
            </div>
            <div className="col-sm-2">
              {/* <SelectBox
                name="stateforlocality"
                lable="State"
                className="required-fields"
                options={[
                  { label: "Select State", value: "" },
                  ...formData?.statesforlocality,
                ]}
                onChange={handleChange}
                selectedValue={formData?.stateforlocality}
              /> */}
              <ReactSelect
                dynamicOptions={[
                  { label: "Select State", value: "" },
                  ...formData?.statesforlocality,
                ]}
                name="stateforlocality"
                lable="State"
                className="required-fields"
                removeIsClearable={true}
                placeholderName={t("State")}
                value={formData?.stateforlocality}
                onChange={handleChange}
              />
            </div>
            <div className="col-sm-2">
              {/* <SelectBox
                name="cityforlocality"
                lable="City"
                className="required-fields"
                onChange={handleChange}
                options={[
                  { label: "Select City", value: "" },
                  ...formData?.citiesforlocality,
                ]}
                selectedValue={formData?.cityforlocality}
              /> */}
              <ReactSelect
                dynamicOptions={[
                  { label: "Select City", value: "" },
                  ...formData?.citiesforlocality,
                ]}
                name="cityforlocality"
                lable="City"
                className="required-fields"
                removeIsClearable={true}
                placeholderName={t("City")}
                value={formData?.cityforlocality}
                onChange={handleChange}
              />
            </div>
            <div className="col-sm-2">
              <Input
                name="locality"
                className="required-fields"
                lable="Enter Locality"
                onChange={handleInputChange}
                max={20}
                value={formData?.locality}
                placeholder=""
              />
            </div>
            <div className="col-auto d-flex align-items-center justify-content-center p-2" style={{
              gap: "5px"
            }}>
              <label class="switch mb-0">
                <input
                  type="checkbox"
                  checked={formData.IsActive[3] === true}
                  onChange={(e) => handleCheckboxChange(e, 3)}
                />
                <span class="slider"></span>
              </label>
              <strong>
                <span>{t("IsActive")}</span>
              </strong>
            </div>
            <div className="col-sm-1">
              {!formData?.loading[3] && (
                <>
                  {!formData?.update && (
                    // <button
                    //   type="button"
                    //   className="btn btn-block btn-success btn-sm"
                    //   onClick={handleSaveLocality}
                    //   disabled={
                    //     formData?.regionforlocality == "" ||
                    //     formData?.cityforlocality == "" ||
                    //     formData?.stateforlocality == ""
                    //   }
                    // >
                    //   Save
                    // </button>
                    <SaveButton
                      text={t("Save")}
                      onClick={handleSaveLocality}
                      disabled={
                        formData?.regionforlocality == "" ||
                        formData?.cityforlocality == "" ||
                        formData?.stateforlocality == ""
                      }
                    />
                  )}
                  {formData?.update && (
                    // <button
                    //   type="button"
                    //   className="btn btn-block btn-warning btn-sm"
                    //   style={{color:'white'}}
                    //   onClick={handleUpdateLocality}
                    //   disabled={
                    //     formData?.regionforlocality == "" ||
                    //     formData?.cityforlocality == "" ||
                    //     formData?.stateforlocality == ""
                    //   }
                    // >
                    //   Update
                    // </button>

                    <EditButton
                      text={t("Update")}
                      onClick={handleUpdateLocality}
                      disabled={
                        formData?.regionforlocality == "" ||
                        formData?.cityforlocality == "" ||
                        formData?.stateforlocality == ""
                      }
                    />
                  )}{" "}
                </>
              )}
              {formData?.loading[3] && <Loading />}
            </div>
          </div>
        </Accordion>
      )}
      <Accordion title={t("Search Criteria")} defaultValue={true}>
        <div className="row pt-2 pl-2 pr-2">
          <div className="col-sm-2">
            {/* <SelectBox
              name="searchZone"
              lable="Zone"
              className="required-fields"
              options={[
                { label: "Select Zone", value: "" },
                ...formData?.regions,
              ]}
              selectedValue={searchData?.searchZone}
              onChange={handleSearchChange}
            /> */}
            <ReactSelect
              dynamicOptions={[
                { label: "Select Zone", value: "" },
                ...formData?.regions,
              ]}
              name="searchZone"
              lable="Zone"
              className="required-fields"
              removeIsClearable={true}
              placeholderName={t("Zone")}
              value={searchData?.searchZone}
              onChange={handleSearchChange}
            />
          </div>
          <div className="col-sm-2">
            {/* <SelectBox
              name="searchState"
              lable="State"
              className="required-fields"
              options={[
                { label: "Select State", value: "" },
                ...searchData?.states,
              ]}
              selectedValue={searchData?.searchState}
              onChange={handleSearchChange}
            /> */}
            <ReactSelect
              dynamicOptions={[
                { label: "Select State", value: "" },
                ...searchData?.states,
              ]}
              name="searchState"
              lable="State"
              className="required-fields"
              removeIsClearable={true}
              placeholderName={t("State")}
              value={searchData?.searchState}
              onChange={handleSearchChange}
            />
          </div>
          <div className="col-sm-2">
            {/* <SelectBox
              name="searchCity"
              className="required-fields"
              lable="City"
              options={[
                { label: "Select City", value: "" },
                ...searchData?.cities,
              ]}
              selectedValue={searchData?.searchCity}
              onChange={handleSearchChange}
            /> */}
            <ReactSelect
              dynamicOptions={[
                { label: "Select City", value: "" },
                ...searchData?.cities,
              ]}
              name="searchCity"
              className="required-fields"
              lable="City"
              removeIsClearable={true}
              placeholderName={t("City")}
              value={searchData?.searchCity}
              onChange={handleSearchChange}
            />
          </div>
          <div className="col-sm-1">
            {!formData?.loading[4] && (
              <SearchButton
                text={"Search"}
                onClick={handleSearch}
              />
            )}
            {formData?.loading[4] && <Loading />}
          </div>
        </div>
      </Accordion>
      {locationTable.length > 0 && (
        <Accordion title={t("Search Data")} defaultValue={true}>
          {locationTable.length > 0 && (
            <Tables>
              <thead className="cf text-center" style={{ zIndex: 99 }}>
                <tr>
                  <th>{t("S.No")}</th>
                  <th>{t("Locality Name")}</th>
                  <th>{t("State ")}</th>
                  <th>{t("City")}</th>
                  <th>{t("Active")}</th>
                  <th>{t("Created By")}</th>
                  <th>{t("Created On")}</th>
                  <th>{t("Update By")}</th>
                  <th>{t("Select")}</th>
                </tr>
              </thead>
              <tbody>
                {locationTable.length > 0 ? (
                  locationTable.map((ele, index) => (
                    <tr key={ele.ID}>
                      <td data-title="#">{index + 1}</td>
                      <td data-title="Location Name">{ele.LocalityName}&nbsp;</td>
                      <td data-title="State">{ele.state}&nbsp;</td>
                      <td data-title="City">{ele.City}&nbsp;</td>
                      <td data-title="Active">
                        {ele.Active == "Yes" ? "Active" : "Inactive"}
                      </td>
                      <td data-title="Created By">{ele.CreatedBy}&nbsp;</td>
                      <td data-title="Created On">
                        {moment(ele.CreatedOn, "YYYY-MM-DD HH-mm-ss").format(
                          "YYYY-MM-DD hh:mm:ss A",
                        )}
                        &nbsp;
                      </td>
                      <td data-title="Updated By">{ele.UpdatedBy}&nbsp;</td>
                      <td data-title="Select">
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => {
                            handleEditLocality(ele);
                          }}
                        >
                          Select
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} style={{ textAlign: "center" }}>
                      No records found
                    </td>
                  </tr>
                )}
              </tbody>
            </Tables>
          )}
        </Accordion>
      )}
      {showState && (
        <Dialog
          header={t("Modify State")}
          visible={showState}
          onHide={() => {
            setModifyState((prevState) => ({
              ...prevState,
              initialZone: "",
              finalZone: "",
              State: "",
              IsActive: true,
              StateID: "",
              states: [],
              cities: [],
            }));
            setShowState(false);
          }}
          draggable={false}
          className={theme}
          style={{ width: "1000px" }}
        >
          <div className="row">
            <div className="col-sm-2">
              {/* <SelectBox
                name="initialZone"
                lable="Zone"
                selectedValue={ModifyState?.initialZone}
                options={[
                  { label: "Select Zone", value: "" },
                  ...formData?.regions,
                ]}
                onChange={handleModifyState}
              /> */}
              <ReactSelect
                dynamicOptions={[
                  { label: "Select Zone", value: "" },
                  ...formData?.regions,
                ]}
                name="initialZone"
                lable="Zone"
                removeIsClearable={true}
                placeholderName={t("Zone")}
                value={ModifyState?.initialZone}
                onChange={handleModifyState}
              />
            </div>
            <div className="col-sm-2">
              {/* <SelectBox
                name="StateID"
                lable="State"
                selectedValue={ModifyState?.StateID}
                options={[
                  { label: "Select State", value: "" },
                  ...ModifyState?.states,
                ]}
                onChange={handleModifyState}
              /> */}
              <ReactSelect
                dynamicOptions={[
                  { label: "Select State", value: "" },
                  ...ModifyState?.states,
                ]}
                name="StateID"
                lable="State"
                removeIsClearable={true}
                placeholderName={t("State")}
                value={ModifyState?.StateID}
                onChange={handleModifyState}
              />
            </div>
            <div className="com-sm-2">
              <Input
                lable="Modify State"
                name="State"
                placeholder=" "
                value={ModifyState?.State}
                onChange={handleInputModifyState}
                max={20}
              />
            </div>
            <div className="col-sm-2">
              {/* <SelectBox
                name="finalZone"
                lable="Modify Zone"
                selectedValue={ModifyState?.finalZone}
                options={[
                  { label: "Select Zone", value: "" },
                  ...formData?.regions,
                ]}
                onChange={handleModifyState}
              /> */}
              <ReactSelect
                dynamicOptions={[
                  { label: "Select Zone", value: "" },
                  ...formData?.regions,
                ]}
                name="finalZone"
                lable="Modify Zone"
                removeIsClearable={true}
                placeholderName={t("State")}
                value={ModifyState?.finalZone}
                onChange={handleModifyState}
              />
            </div>
            <div className="col-sm-1 mt-1 d-flex">
              <div className="mt-1">
                <input
                  name="IsActive"
                  type="checkbox"
                  onChange={handleInputModifyState}
                  checked={ModifyState?.IsActive}
                />
              </div>
              <label className="col-sm-10"> {t("IsActive")}</label>
            </div>
            <div className="col-sm-1">
              {!updateLoading[0] && (
                <button
                  className="btn btn-block btn-primary btn-sm "
                  onClick={handleStateUpdate}
                >
                  Update
                </button>
              )}
              {updateLoading[0] && <Loading />}
            </div>
            <div className="col-sm-1">
              <button
                className="btn btn-block btn-primary  btn-sm"
                onClick={() => {
                  setModifyState({
                    initialZone: "",
                    finalZone: "",
                    State: "",
                    IsActive: true,
                    StateID: "",
                    states: [],
                  });
                  setShowState(false);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
          <div className="row mt-2 d-flex justify-content-center"></div>
        </Dialog>
      )}
      {showCity && (
        <Dialog
          header={t("Modify City")}
          visible={showCity}
          onHide={() => {

            setModifyCity((prevState) => ({
              ...prevState,
              regionmodifycity: "",
              statemodifycity: "",
              cityTomodify: "",
              newcity: "",
              IsActive: true,
              states: [],
              cities: [],
            }));
            setShowCity(false);
          }}
          draggable={false}
          className={theme}
          style={{ width: "1000px" }}
        >
          <div className="row">
            <div className="col-sm-2">
              {/* <SelectBox
                name="regionmodifycity"
                lable="Region"
                options={[
                  { label: "Select Zone", value: "" },
                  ...formData?.regions,
                ]}
                selectedValue={ModifyCity?.regionmodifycity}
                onChange={handleModifyCity}
              /> */}
              <ReactSelect
                dynamicOptions={[
                  { label: "Select Zone", value: "" },
                  ...formData?.regions,
                ]}
                name="regionmodifycity"
                lable="Region"
                removeIsClearable={true}
                placeholderName={t("Region")}
                value={ModifyCity?.regionmodifycity}
                onChange={handleModifyCity}
              />
            </div>
            <div className="col-sm-2">
              {/* <SelectBox
                name="statemodifycity"
                lable="State"
                options={[
                  { label: "Select State", value: "" },
                  ...ModifyCity?.states,
                ]}
                onChange={handleModifyCity}
                selectedValue={ModifyCity?.statemodifycity}
              /> */}
              <ReactSelect
                dynamicOptions={[
                  { label: "Select State", value: "" },
                  ...ModifyCity?.states,
                ]}
                name="statemodifycity"
                lable="State"
                removeIsClearable={true}
                placeholderName={t("State")}
                value={ModifyCity?.statemodifycity}
                onChange={handleModifyCity}
              />
            </div>
            <div className="col-sm-2">
              {/* <SelectBox
                name="cityTomodify"
                lable="City"
                options={[
                  { label: "Select City", value: "" },
                  ...ModifyCity?.cities,
                ]}
                onChange={handleModifyCity}
                selectedValue={ModifyCity?.cityTomodify}
              /> */}
              <ReactSelect
                dynamicOptions={[
                  { label: "Select City", value: "" },
                  ...ModifyCity?.cities,
                ]}
                name="cityTomodify"
                lable="City"
                removeIsClearable={true}
                placeholderName={t("City")}
                value={ModifyCity?.cityTomodify}
                onChange={handleModifyCity}
              />
            </div>
            <div className="col-sm-2">
              <Input
                name="newcity"
                placeholder=" "
                lable="Modify City"
                onChange={handleInputModifyCity}
                max={20}
                value={ModifyCity?.newcity}
              />
            </div>
            <div className="col-sm-1 mt-1 d-flex">
              <div className="mt-1">
                <input
                  name="IsActive"
                  type="checkbox"
                  onChange={handleInputModifyCity}
                  checked={ModifyCity?.IsActive}
                />
              </div>
              <label className="col-sm-10"> {t("IsActive")}</label>
            </div>
            <div className="col-sm-1">
              {!updateLoading[1] && (
                <button
                  className="btn btn-block btn-primary  btn-sm"
                  onClick={handleCityUpdate}
                >
                  Update
                </button>
              )}
              {updateLoading[1] && <Loading />}
            </div>
            <div className="col-sm-1">
              <button
                className="btn btn-block btn-primary btn-sm"
                onClick={() => {
                  setModifyCity({
                    regionmodifycity: "",
                    statemodifycity: "",
                    cityTomodify: "",
                    newcity: "",
                    IsActive: true,
                    states: [],
                    cities: [],
                  });
                  setShowCity(false);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </Dialog>
      )}
    </>
  );
};

export default LocationMaster;
