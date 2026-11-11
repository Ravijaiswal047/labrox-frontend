import React, { useEffect, useState } from "react";
import {
  LocationMasterValidationSchema,
  LocationUpdateSchema,
} from "../../utils/Schema";
import { toast } from "react-toastify";
import Input from "../../components/formComponent/Input";
import { SelectBox } from "../../components/formComponent/SelectBox";
import { useTranslation } from "react-i18next";

import Accordion from "@app/components/UI/Accordion";
import Loading from "../../components/loader/Loading";
import { NoofRecord, TimeSlots, AvgTimes } from "../../utils/Constants";
import { Link } from "react-router-dom";
import { changeLanguage } from "i18next";
import {
  AllowCharactersNumbersAndSpecialChars,
  PreventSpecialCharacter,
  number,
  getTrimmedData,
} from "../../utils/helpers";
import Tables from "../../components/UI/customTable";
import { axiosInstance } from "../../utils/axiosInstance";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { CancelButton, CustomButton, SearchButton } from "../../components/UI/CustomButton";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";

const HomeCollectionLocationMaster = () => {
  const userdata = useLocalStorage("userData", "get");
  const DefaultCurrencyName = userdata?.DefaultCurrencyName;
  const pinLength = DefaultCurrencyName == "KES" ? 5 : 6;
  console.log(userdata, "nae");
  const [errors, setErros] = useState({});
  const [load, setLoad] = useState(false);
  const [searchLoad, setSearchLoad] = useState(false);
  const [businessZones, setBusinessZones] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCity] = useState([]);
  const [searchStates, setSearchStates] = useState([]);
  const [searchCities, setSearchCities] = useState([]);

  const [locationTable, setLocationTable] = useState([]);
  const [searchData, setSearchData] = useState({
    StateId: "",
    CityId: "",
    NoofRecord: "40",
    searchvalue: "",
  });
  const [formData, setFormData] = useState({
    BusinessZoneID: "",
    StateID: "",
    CityID: "",
    IsActive: true,
    edit: false,
  });
  const [localities, setLocalities] = useState([
    {
      isHomeColection: "1",
      HeadquarterID: "",
      CityZoneId: "",
      NoofSlotForApp: "1",
      OpenTime: "00:00",
      CloseTime: "23:30",
      AvgTime: "15",
      AreaName: "",
      Pincode: "",
    },
  ]);
  const [currentLocality, setCurrentLocality] = useState({
    isHomeCollection: true,
    HeadquarterID: "",
    CityZoneId: "",
  });

  const TimeSlot = [
    { label: "00-00", value: "00:00" },
    { label: "00-30", value: "00:30" },
    { label: "01-00", value: "01:00" },
    { label: "01-30", value: "01:30" },
    { label: "02-00", value: "02:00" },
    { label: "02-30", value: "02:30" },
    { label: "03-00", value: "03:00" },
    { label: "03-30", value: "03:30" },
    { label: "04-00", value: "04:00" },
    { label: "04-30", value: "04:30" },
    { label: "05-00", value: "05:00" },
    { label: "05-30", value: "05:30" },
    { label: "06-00", value: "06:00" },
    { label: "06-30", value: "06:30" },
    { label: "07-00", value: "07:00" },
    { label: "07-30", value: "07:30" },
    { label: "08-00", value: "08:00" },
    { label: "08-30", value: "08:30" },
    { label: "09-00", value: "09:00" },
    { label: "09-30", value: "09:30" },
    { label: "10-00", value: "10:00" },
    { label: "10-30", value: "10:30" },
    { label: "11-00", value: "11:00" },
    { label: "11-30", value: "11:30" },
    { label: "12-00", value: "12:00" },
    { label: "12-30", value: "12:30" },
    { label: "13-00", value: "13:00" },
    { label: "13-30", value: "13:30" },
    { label: "14-00", value: "14:00" },
    { label: "14-30", value: "14:30" },
    { label: "15-00", value: "15:00" },
    { label: "15-30", value: "15:30" },
    { label: "16-00", value: "16:00" },
    { label: "16-30", value: "16:30" },
    { label: "17-00", value: "17:00" },
    { label: "17-30", value: "17:30" },
    { label: "18-00", value: "18:00" },
    { label: "18-30", value: "18:30" },
    { label: "19-00", value: "19:00" },
    { label: "19-30", value: "19:30" },
    { label: "20-00", value: "20:00" },
    { label: "20-30", value: "20:30" },
    { label: "21-00", value: "21:00" },
    { label: "21-30", value: "21:30" },
    { label: "22-00", value: "22:00" },
    { label: "22-30", value: "22:30" },
    { label: "23-00", value: "23:00" },
    { label: "23-30", value: "23:30" },
  ];

  const { t } = useTranslation();
  const getStates = (value) => {
    if (value === "") {
      return;
    } else {
      axiosInstance
        .post("CommonHC/GetStateData", {
          BusinessZoneID: value,
        })
        .then((res) => {
          const data = res.data.message;
          const States = data.map((ele) => {
            return {
              value: ele.ID,
              label: ele.State,
            };
          });
          setStates(States);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  const getCity = (value) => {
    axiosInstance
      .post("CommonHC/GetCityData", {
        StateId: [value],
      })
      .then((res) => {
        const data = res.data.message;
        const cities = data.map((ele) => {
          return {
            value: handleSplitData(ele.ID),
            label: ele.City,
          };
        });
        setCity(cities);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleSplitData = (id) => {
    const data = id.split("#")[0];
    return data;
  };

  const handleChange = (name, e) => {
    const { value } = e;
    if (name === "BusinessZoneID") {
      getStates(value);
      setFormData({
        ...formData,
        [name]: value?.toString(),
        StateID: "",
        CityID: "",
      });
      setStates([]);
      setCity([]);
      setLocalities([
        {
          isHomeColection: "1",
          HeadquarterID: "",
          CityZoneId: "",
          NoofSlotForApp: "1",
          OpenTime: "00:00",
          CloseTime: "23:30",
          AvgTime: "15",
          AreaName: "",
          Pincode: "",
        },
      ]);
    }

    if (name === "StateID") {
      getCity(value);
      setFormData({
        ...formData,
        [name]: value?.toString(),
        CityID: "",
      });
      setCity([]);
      setLocalities([
        {
          isHomeColection: "1",
          HeadquarterID: "",
          CityZoneId: "",
          NoofSlotForApp: "1",
          OpenTime: "00:00",
          CloseTime: "23:30",
          AvgTime: "15",
          AreaName: "",
          Pincode: "",
        },
      ]);
    }

    if (name === "CityID") {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };
  const handleCheckboxChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData({
        ...formData,
        [name]: type === "checkbox" ? checked : value,
      });
    }
  };

  const getSearchCities = (id) => {
    axiosInstance
      .post("CommonHC/GetCityData", {
        StateId: [id],
      })
      .then((res) => {
        const data = res.data.message;
        const cities = data.map((ele) => {
          return {
            value: handleSplitData(ele.ID),
            label: ele.City,
          };
        });

        setSearchCities(cities);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleInputSearchChange = (e) => {
    const { name, value } = e.target;


    if (name === "searchvalue") {
      if (PreventSpecialCharacter(value)) {
        setSearchData({ ...searchData, [name]: value });
      }
    }
    else {
      setSearchData({ ...searchData, [name]: value });
    }
  };

  const handleSearchChange = (name, e) => {
    const { value } = e;

    if (name === "StateId") {
      console.log(value);
      getSearchCities(value);
      console.log(searchData);
      setSearchData({
        ...searchData,
        StateId: value?.toString(),
        CityId: "",
        searchvalue: "",
      });
    }
    else if (name === "NoofRecord") {
      handleSearchbyvalue(value);
      setSearchData({ ...searchData, [name]: value });
    } else {
      setSearchData({ ...searchData, [name]: value });
    }
  };

  const handleUpdate = () => {
    let obj = { ...formData, ...currentLocality };

    const generatedError = LocationUpdateSchema(obj);
    const obj2 = getTrimmedData(obj);
    console.log(generatedError);
    if (generatedError == "") {
      setLoad(true);
      axiosInstance
        .post("HCLocation/UpdateLocality", {
          ...obj2,
          IsHomeCollection:
            currentLocality.isHomeCollection === true ? '1' : '0',
          isHomeCollection:
            currentLocality.isHomeCollection === true ? "1" : "0",
          IsActive: formData?.IsActive === true ? "1" : "0",
        })
        .then((res) => {
          delete formData.edit;
          toast.success("Updated Successfully");
          handleCancel();
          handleSearch();
          setLoad(false);
        })
        .catch((err) => {
          console.log(err);
          setLoad(false);
          toast.error(
            err?.response?.data?.message
              ? err?.response?.data?.message
              : "Error occured",
          );
        });
    } else {
      console.log(generatedError);
      setErros(generatedError);
      setLoad(false);
    }
  };

  const editLocation = (ele) => {
    getStates(ele?.BusinessZoneID);
    getCity(ele?.StateID);

    setFormData({
      BusinessZoneID: `${ele?.BusinessZoneID}`,
      StateID: `${ele?.StateID}`,
      CityID: `${ele?.CityID}`,
      IsActive: ele?.active === 0 ? false : true,
      edit: true,
    });

    setCurrentLocality({
      ...currentLocality,
      Locality: ele?.NAME,
      Pincode: ele?.PinCode,
      startTime: ele?.StartTime ? ele?.StartTime : "00:00",
      endTime: ele?.EndTime ? ele?.EndTime : "23:30",
      AvgTime: ele?.AvgTime || "15",
      TimeSlot: ele?.NoofSlotForApp,
      isHomeCollection: ele?.isHomeCollection === "1" ? true : false,
      TimeSlot: ele?.NoofSlotForApp || "1",
      HeadquarterID: ele?.HeadquarterID,
      LocalityId: `${ele?.ID}`,
    });
    window.scroll(0, 0);
  };

  const handleSearch = () => {
    setSearchLoad(true);
    console.log(searchData);
    axiosInstance
      .post("HCLocation/GetData", {
        ...searchData,
        NoofRecord: Number(searchData?.NoofRecord),
      })
      .then((res) => {
        if (res?.data?.success) {
          setLocationTable(res?.data?.message);
          setSearchLoad(false);
        } else {
          setLocationTable([]);
          toast.error("No Record Found...");
          setSearchLoad(false);
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error("Data Not Found");
        setSearchLoad(false);
      });
  };
  const handleSearchbyvalue = (value) => {
    setSearchLoad(true);
    console.log(searchData);
    axiosInstance
      .post("HCLocation/GetData", {
        ...searchData,
        NoofRecord: value,
      })
      .then((res) => {
        if (res?.data?.message.length > 0) {
          setLocationTable(res?.data?.message);
          setSearchLoad(false);
        } else {
          setLocationTable([]);
          toast.error("No Record Found...");
          setSearchLoad(false);
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error("Data Not Found");
        setSearchLoad(false);
      });
  };

  const formatTimeTo24Hour = (time12Hour) => {
    const [time, period] = time12Hour.split(" ");
    let [hours, minutes] = time.split(":");

    if (period === "PM") {
      hours = parseInt(hours, 10) + 12;
    }

    return `${hours.toString().padStart(2, "0")}:${minutes}`;
  };

  const handleCancel = () => {
    setFormData({
      BusinessZoneID: "",
      StateID: "",
      CityID: "",
      IsActive: true,
    });
    setCurrentLocality({
      IsActive: false,
      Locality: "",
      Pincode: "",
      endTime: "23:30",
      startTime: "00:00",
      AvgTime: "",
      isHomeCollection: "",
      TimeSlot: "",
      HeadquarterID: "",
      LocalityId: "",
      CityZoneId: "",
    });
    setLocalities([
      {
        isHomeColection: "1",
        HeadquarterID: "",
        CityZoneId: "",
        NoofSlotForApp: "1",
        OpenTime: "00:00",
        CloseTime: "23:30",
        AvgTime: "15",
        AreaName: "",
        Pincode: "",
      },
    ]);
    setStates([]);
    setCity([]);
    setErros({});
  };

  const checkLocalitydata = () => {
    const msg = "";
    // let i=0;
    // let flag=true;
    // console.log(localities)
    // while(i<localities.length)
    // {
    //  if(localities[i].AreaName=="" || localities[i].Pincode==""||localities[i].OpenTime==""||
    //  localities[i].CloseTime==""||localities[i].AvgTime=="" || localities[i].NoofSlotForApp=="")
    //  {
    //   flag=false;
    //   return flag;
    //  }
    //  i++
    // }
    // return flag;
  };
  function checkAreaname(data) {
    for (let i = 0; i < data.length; i++) {
      if (data[i].AreaName.trim() == "") {
        return false;
      }
    }
    return true;
  }
  function checkAreaLength(data) {
    console.log(data);
    for (let i of data) {
      if (i.AreaName.trim().length < 3) {
        return i.AreaName;
      }
    }
    return "*";
  }
  // Enforced here rather than per keystroke. The typing filter never stopped a
  // pasted or autofilled value, so anything could reach the database - including
  // markup. Returns the first offending area name, or "*" when all are clean.
  function checkAreaCharacters(data) {
    for (let i of data) {
      if (
        i.AreaName.trim() !== "" &&
        !AllowCharactersNumbersAndSpecialChars(i.AreaName.trim())
      ) {
        return i.AreaName;
      }
    }
    return "*";
  }

  const handleSubmit = () => {
    const generatedError = LocationMasterValidationSchema(formData);
    if (generatedError === "") {
      const checkLocalities = localities;
      console.log(checkLocalities);
      checkLocalities.forEach((object) => {
        delete object["HeadquarterID"];
        delete object["CityZoneId"];
      });

      const badCharacters = checkAreaCharacters(checkLocalities);
      if (badCharacters !== "*") {
        toast.error(
          `Area Name "${badCharacters}" may only contain letters, numbers, spaces, - and /`,
        );
        return;
      }

      if (checkAreaname(checkLocalities)) {
        const checkLength = checkAreaLength(checkLocalities);
        console.log(checkLength);
        if (checkLength == "*") {
          const emptyKeys = checkLocalities.flatMap((obj) =>
            Object.keys(obj).filter((key) => !obj[key]),
          );

          const Pincodelist = checkLocalities.filter((item) => {
            return item.Pincode.length != pinLength;
          });

          const wrongPincodes = Pincodelist.flatMap((item) => {
            if (item.Pincode.length != pinLength) {
              return item.AreaName;
            }
          });

          const DuplicateLocality = checkDuplicateLocality();
          const concatenatedAreaName = wrongPincodes.join(",");
          const concatenatedKeys = emptyKeys.join(",");
          let DuplicateLocalityError;
          if (typeof DuplicateLocality == "object") {
            DuplicateLocalityError = DuplicateLocality.join(",");
          }

          if (
            concatenatedKeys === "" &&
            concatenatedAreaName === "" &&
            DuplicateLocality === ""
          ) {
            if (generatedError === "") {
              setLoad(true);
              delete formData.edit;

              const trimmedData = localities.map((item) => {
                return getTrimmedData(item);
              });

              const AriaDetailsData = trimmedData.map((item) => {
                return {
                  ...item,

                  ...formData,

                  IsActive: formData?.IsActive ? "1" : "0",
                  IsHomeColection: item?.isHomeColection ? "1" : "0",
                };
              });

              axiosInstance
                .post("HCLocation/SaveLocality", {
                  AriaDetailsData,
                })
                .then((res) => {
                  if (res.data.message) {
                    console.log(res.data.message);
                    setLoad(false);
                    handleCancel();
                    setLocalities([
                      {
                        isHomeColection: "1",
                        HeadquarterID: "",
                        CityZoneId: "",
                        NoofSlotForApp: "1",
                        OpenTime: "00:00",
                        CloseTime: "23:30",
                        AvgTime: "15",
                        AreaName: "",
                        Pincode: "",
                      },
                    ]);
                    handleSearch();
                    toast.success(
                      res.data.message
                        ? res.data.message
                        : "Saved Successfully",
                    );
                  }
                })
                .catch((err) => {
                  console.log(err);
                  setLoad(false);
                  toast.error(err?.response?.data?.message);
                });
            } else {
              setErros(generatedError);
              setLoad(false);
            }
          } else {
            if (concatenatedKeys.length > 0) {
              toast.error(`${concatenatedKeys} not filled`);
            } else if (concatenatedAreaName.length > 0) {
              toast.error(
                `Pincode at ${concatenatedAreaName} must have length of ${pinLength}`,
              );
            } else if (DuplicateLocality.length > 0) {
              toast.error(DuplicateLocalityError);
            }
          }
        } else {
          toast.error(
            `Entered location "${checkLength}" must have 3 characters`,
          );
        }
      } else {
        toast.error("Enter Area Name");
      }
    } else {
      setErros(generatedError);
      setLoad(false);
    }
  };

  const getBusinessZones = () => {
    axiosInstance
      .get("CommonHC/GetZoneData")
      .then((res) => {
        let data = res.data.message;
        let BusinessZones = data.map((ele) => {
          return {
            value: ele.BusinessZoneID,
            label: ele.BusinessZoneName,
          };
        });

        setBusinessZones(BusinessZones);
      })
      .catch((err) =>
        toast.error(err?.res?.data ? err?.res?.data : "Something Went Wrong"),
      );
  };
  const checkDuplicateLocality = () => {
    const seenCombinations = {};
    const duplicateEntries = [];

    for (let item of localities) {
      const areaName = item["AreaName"].trim().toLowerCase();
      const pincode = item["Pincode"];
      const combination = `${areaName}-${pincode}`;

      if (seenCombinations[combination]) {
        duplicateEntries.push(`Duplicate Entry of ${areaName}`);
      } else {
        seenCombinations[combination] = true;
      }
    }
    if (duplicateEntries.length > 0) {
      return duplicateEntries;
    } else {
      return "";
    }
  };

  const getSearchStates = () => {
    axiosInstance
      .post("CommonHC/GetStateData", {
        BusinessZoneID: 0,
      })
      .then((res) => {
        const data = res.data.message;
        const States = data.map((ele) => {
          return {
            value: ele.ID,
            label: ele.State,
          };
        });
        States.unshift({ label: t("Select State"), value: "" });
        setSearchStates(States);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  console.log(formData);

  const localityChangeHander = (index, e) => {
    const { name, value, type, checked } = e?.target;
    console.log(name, value, type, checked, index);
    console.log(localities);
    const newData = [...localities];
    if (formData?.edit) {
      if (name === "Pincode") {
        if (value.length <= pinLength) {
          setCurrentLocality({ ...currentLocality, [name]: value });
        }
      } else if (name === "startTime") {
        if (value < currentLocality?.endTime) {
          setCurrentLocality({
            ...currentLocality,
            [name]: value,
          });
        }
      } else if (name === "endTime") {
        if (value > currentLocality?.startTime) {
          setCurrentLocality({
            ...currentLocality,
            [name]: value,
          });
        }
      } else if (name === "Locality") {
        if (AllowCharactersNumbersAndSpecialChars(value)) {
          setCurrentLocality({
            ...currentLocality,
            [name]: value,
          });
        }
      } else {
        setCurrentLocality({
          ...currentLocality,
          [name]: type === "checkbox" ? checked : value,
        });
      }
    } else {
      if (name == "Pincode") {
        if (value.length <= 6) {
          newData[index] = {
            ...newData[index],
            [name]: `${value}`,
          };
        }
      } else if (name === "AreaName") {
        // Always take what was typed. This used to drop the keystroke whenever
        // AllowCharactersNumbersAndSpecialChars said no, and because the input is
        // controlled, React then reset the box to the last accepted value - so the
        // text just vanished with nothing said. That hit ordinary area names too:
        // the rule permits only letters, digits, hyphen, slash and space, so a
        // comma, a full stop or an apostrophe silently killed the entry mid-word.
        //
        // The character rule has not gone away, it has moved to where it can
        // actually be enforced - checkAreaCharacters at save. A keystroke filter
        // was never a real defence anyway, since a paste or an autofill sets the
        // value without it, which is how markup reached the database in the first
        // place.
        newData[index] = {
          ...newData[index],
          [name]: value,
        };
      } else if (name === "OpenTime") {
        console.log(value, localities[index]["CloseTime"]);
        if (value < localities[index]["CloseTime"]) {
          newData[index] = {
            ...newData[index],
            [name]: value,
          };
        }
      } else if (name === "CloseTime") {
        if (value > localities[index]["OpenTime"]) {
          newData[index] = {
            ...newData[index],
            [name]: value,
          };
        }
      } else {
        newData[index] = {
          ...newData[index],
          [name]: value,
        };
      }

      setLocalities(newData);
    }
  };

  const reactLocalityChangeHander = (index, name, e) => {
    const { value } = e;
    const newData = [...localities];
    if (formData?.edit) {
      setCurrentLocality({
        ...currentLocality,
        [name]: value,
      });
    } else {
      newData[index] = {
        ...newData[index],
        [name]: value,
      };
      setLocalities(newData);
    }
  };

  const addLocalityHandler = (index) => {
    const checkLocalities = localities;

    checkLocalities.forEach((object) => {
      delete object["HeadquarterID"];
      delete object["CityZoneId"];
    });
    if (
      checkLocalities[index]?.Pincode.trim() != "" ||
      checkLocalities[index]?.AreaName.trim() != ""
    ) {
      if (checkLocalities[index].Pincode?.length == pinLength) {
        if (checkLocalities[index].AreaName.length > 2) {
          const checkLocalities2 = checkLocalities.map(
            ({ isHomeColection, ...rest }) => rest,
          );
          const emptyKeys = checkLocalities2.flatMap((obj) =>
            Object.keys(obj).filter((key) => !obj[key]?.trim()),
          );

          const concatenatedKeys = emptyKeys.join(",");

          if (
            concatenatedKeys == "" ||
            containsOnlyOneCharacter(concatenatedKeys)
          ) {
            const nextLocality = {
              isHomeColection: "1",
              HeadquarterID: "",
              CityZoneId: "",
              NoofSlotForApp: "1",
              OpenTime: "00:00",
              CloseTime: "23:30",
              AvgTime: "15",
              AreaName: "",
              Pincode: "",
            };
            setLocalities([...localities, nextLocality]);
          } else {
            toast.error(`${concatenatedKeys} not filled`);
          }
        } else {
          toast.error("Location name must have atleast 3 characters");
        }
      } else {
        toast.error(`Pincode length must be ${pinLength}`);
      }
    } else {
      toast.error("Enter Pincode and Locality");
    }
  };

  const removeLocality = (i) => {
    if (localities.length > 1) {
      const newLocalities = localities.filter((ele, index) => {
        return index !== i;
      });
      console.log(newLocalities);
      setLocalities(newLocalities);
    } else if (localities.length == 1) {
      setLocalities([
        {
          isHomeColection: "1",
          HeadquarterID: "",
          CityZoneId: "",
          NoofSlotForApp: "1",
          OpenTime: "00:00",
          CloseTime: "23:30",
          AvgTime: "15",
          AreaName: "",
          Pincode: "",
        },
      ]);
    }
  };

  function containsOnlyOneCharacter(str) {
    for (let i = 1; i < str.length; i++) {
      if (str[i] !== str[0]) {
        return false;
      }
    }
    return true;
  }

  useEffect(() => {
    getBusinessZones();
    getSearchStates();
  }, []);

  console.log("formData", formData);

  return (
    <>
      <Accordion
        name={t("Home Collection Location Master")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row pt-2 pl-2 pr-2">
          <div className="col-sm-2">
            {/* <SelectBox
              options={[
                { label: "Select Business Zone", value: "" },
                ...businessZones,
              ]}
              name="BusinessZoneID"
              className="required-fields"
              lable="Business Zone"
              id="Business Zone"
              selectedValue={formData?.BusinessZoneID}
              onChange={handleChange}
            /> */}
            <ReactSelect
              dynamicOptions={[
                { label: "Select Business Zone", value: "" },
                ...businessZones,
              ]}
              name="BusinessZoneID"
              className="required-fields"
              lable="Business Zone"
              id="Business Zone"
              removeIsClearable={true}
              /* Was t("Centre"), which is a different concept in this product.
                 ReactSelect uses placeholderName for both the visible placeholder
                 and the field's tooltip, so this is the text the user actually
                 reads - it disagreed with the field's own lable, its id, and the
                 "Select Business Zone" option inside it. */
              placeholderName={t("Business Zone")}
              value={formData?.BusinessZoneID}
              onChange={handleChange}
            />

            {formData?.BusinessZoneID === "" && (
              <span className="error-message">{errors?.BusinessZoneID}</span>
            )}
          </div>

          <div className="col-sm-2">
            {/* <SelectBox
              options={[{ label: "Select State", value: "" }, ...states]}
              name="StateID"
              lable="State"
              className="required-fields"
              id="State"
              selectedValue={formData?.StateID}
              onChange={handleChange}
            /> */}

            <ReactSelect
              dynamicOptions={[{ label: "Select State", value: "" }, ...states]}
              name="StateID"
              lable="State"
              className="required-fields"
              id="State"
              removeIsClearable={true}
              placeholderName={t("State")}
              value={formData?.StateID}
              onChange={handleChange}
            />
            {formData?.StateID === "" && (
              <span className="error-message">{errors?.StateID}</span>
            )}
          </div>

          <div className="col-sm-2 ">
            {/* <SelectBox
              options={[{ label: "Select City", value: "" }, ...cities]}
              name="CityID"
              lable="City"
              className="required-fields"
              id="City"
              selectedValue={formData.CityID}
              onChange={handleChange}
            /> */}
            <ReactSelect
              dynamicOptions={[{ label: "Select City", value: "" }, ...cities]}
              name="CityID"
              lable="City"
              className="required-fields"
              id="City"
              removeIsClearable={true}
              placeholderName={t("City")}
              value={formData.CityID}
              onChange={handleChange}
            />
            {formData?.CityID === "" && (
              <span className="error-message">{errors?.CityID}</span>
            )}
          </div>
          {/* <div className="col-sm-1">
            <input
              className="mt-1"
              name="IsActive"
              type="checkbox"
              onChange={handleCheckboxChange}
              checked={formData.IsActive}
            />
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
                checked={formData.IsActive === true}
                onChange={handleCheckboxChange}
              />
              <span class="slider"></span>
            </label>
            <strong>
              <span>{t("IsActive")}</span>
            </strong>
          </div>
          {formData.edit && (
            <>
              <div className="col-sm-2">
                <Input
                  name="Locality"
                  lable="Locality"
                  className="required-fields"
                  id="Locality"
                  placeholder=" "
                  max={20}
                  value={currentLocality?.Locality}
                  onChange={(e) => {
                    localityChangeHander(0, e);
                  }}
                />
                {currentLocality?.Locality.trim() == "" && (
                  <span className="error-message">{errors?.Locality}</span>
                )}

                {currentLocality?.Locality.trim().length > 0 &&
                  currentLocality?.Locality.trim().length < 3 && (
                    <span className="error-message">{errors?.Localitys}</span>
                  )}
              </div>
              <div className="col-sm-1">
                <Input
                  name="Pincode"
                  type="number"
                  lable="Pincode"
                  className="required-fields"
                  id="Pincode"
                  placeholder=" "
                  value={currentLocality?.Pincode}
                  onInput={(e) =>
                    number(
                      e,
                      DefaultCurrencyName == "KES"
                        ? 5
                        : 6,
                    )
                  }
                  onChange={(e) => {
                    localityChangeHander(0, e);
                  }}
                />

                {currentLocality?.Pincode == "" && (
                  <span className="error-message">{errors?.Pincode}</span>
                )}

                {currentLocality?.Pincode != "" &&
                  currentLocality?.Pincode.trim().length != pinLength && (
                    <span className="error-message">
                      {errors?.PincodeLength}
                    </span>
                  )}
              </div>
              {/* <div className="col-sm-2">
                <input
                  name="isHomeCollection"
                  type="checkbox"
                  className="mt-1"
                  checked={currentLocality.isHomeCollection}
                  onChange={(e) => {
                    localityChangeHander(0, e);
                  }}
                />
                &nbsp;&nbsp;
                <label htmlFor="IsHomeCollection" className="control-label">
                  {t("IsHomeCollection")}
                </label>
              </div> */}
              <div className="col-auto d-flex align-items-center justify-content-center p-2" style={{
                gap: "5px"
              }}>
                <label class="switch mb-0">
                  <input
                    type="checkbox"
                    name="isHomeCollection"
                    checked={currentLocality.isHomeCollection}
                    onChange={(e) => {
                      localityChangeHander(0, e);
                    }}
                  />
                  <span class="slider"></span>
                </label>
                <strong>
                  <span>{t("IsHomeCollection")}</span>
                </strong>
              </div>
            </>
          )}
        </div>
        {formData.edit && (
          <div className="row pt-1 pl-2 pr-2">
            <div className="col-sm-2">
              <SelectBox
                name="startTime"
                lable="Opening Time"
                id="Opening Time"
                className="required-fields"
                selectedValue={currentLocality?.startTime}
                onChange={(e) => {
                  localityChangeHander(0, e);
                }}
                options={TimeSlot}
              />
            </div>

            <div className="col-sm-2">
              <SelectBox
                name="endTime"
                lable="Closing Time"
                className="required-fields"
                id="Closing Time"
                selectedValue={currentLocality?.endTime}
                onChange={(e) => {
                  localityChangeHander(0, e);
                }}
                options={TimeSlot}
              />
            </div>

            <div className="col-sm-2">
              {/* <SelectBox
                name="AvgTime"
                lable="Avg Time"
                className="required-fields"
                id="Avg Time"
                selectedValue={currentLocality?.AvgTime}
                options={AvgTimes}
                onChange={(e) => {
                  localityChangeHander(0, e);
                }}
              /> */}

              <ReactSelect
                dynamicOptions={AvgTimes}
                name="AvgTime"
                lable="Avg Time"
                className="required-fields"
                id="Avg Time"
                removeIsClearable={true}
                placeholderName={t("Avg Time")}
                value={currentLocality?.AvgTime}
                onChange={(name, e) => {
                  reactLocalityChangeHander(0, name, e);
                }}
              // onChange={localityChangeHander}
              />
            </div>

            <div className="col-sm-1">
              {/* <SelectBox
                name="TimeSlot"
                lable="Time Slot"
                className="required-fields"
                id="Time Slot"
                selectedValue={currentLocality?.TimeSlot}
                options={TimeSlots}
                onChange={(e) => {
                  localityChangeHander(0, e);
                }}
              /> */}
              <ReactSelect
                dynamicOptions={TimeSlots}
                name="TimeSlot"
                lable="Time Slot"
                className="required-fields"
                id="Time Slot"
                removeIsClearable={true}
                placeholderName={t("Time Slot")}
                value={currentLocality?.TimeSlot}
                onChange={(name, e) => {
                  reactLocalityChangeHander(0, name, e);
                }}
              />
            </div>
          </div>
        )}
        {!formData.edit && (
          <>
            <>
              <div>
                <Tables>
                  <thead className="cf text-center" style={{ zIndex: 99 }}>
                    <tr>
                      <th className="text-center">{t("Add")}</th>
                      <th className="text-center">{t("Location")}</th>
                      <th className="text-center">{t("Pincode")}</th>
                      <th className="text-center">
                        &nbsp;&nbsp;{t("Start Time")}&nbsp;
                      </th>
                      <th className="text-center">{t("Closing Time")}</th>
                      <th className="text-center">{t("Avg Time")}</th>
                      <th className="text-center">{t("Time Slot")}</th>
                      <th className="text-center">{t("Remove")}</th>
                    </tr>{" "}
                  </thead>
                  <>
                    {/* {formData?.StateID != "" &&
                      formData?.CityID != "" &&
                      formData?.BusinessZoneID != "" && ( */}
                    <tbody>
                      {localities.map((locality, index) => (
                        <tr key={index}>
                          {console.log(localities)}
                          <td data-title="Add" style={{ textAlign: "center" }}>
                            <button
                              disabled={localities.length !== index + 1}
                              style={{ fontSize: "15px" }}
                              onClick={() => {
                                addLocalityHandler(index);
                              }}
                            >
                              +
                            </button>
                          </td>
                          <td data-title="AreaName">
                            <Input
                              className="required-fields"
                              name="AreaName"
                              max={20}
                              value={localities[index]?.AreaName}
                              onChange={(e) => localityChangeHander(index, e)}
                            />
                          </td>
                          <td data-title="Pincode">
                            <Input
                              className="required-fields"
                              name="Pincode"
                              type="number"
                              value={locality?.Pincode}
                              onInput={(e) =>
                                number(
                                  e,
                                  DefaultCurrencyName == "KES"
                                    ? 5
                                    : 6,
                                )
                              }
                              onChange={(e) => localityChangeHander(index, e)}
                            />
                          </td>
                          <td data-title="OpenTime">
                            <SelectBox
                              className="required-fields"
                              name="OpenTime"
                              options={TimeSlot}
                              onChange={(e) => localityChangeHander(index, e)}
                              selectedValue={locality?.OpenTime}
                            />
                          </td>
                          <td data-title="CloseTime">
                            <SelectBox
                              className="required-fields"
                              name="CloseTime"
                              options={TimeSlot}
                              onChange={(e) => localityChangeHander(index, e)}
                              selectedValue={locality?.CloseTime}
                            />
                          </td>
                          <td data-title="AvgTime">
                            {/* <SelectBox
                              className="required-fields"
                              name="AvgTime"
                              selectedValue={locality.AvgTime}
                              onChange={(e) => localityChangeHander(index, e)}
                              options={[...AvgTimes]}
                            /> */}
                            <ReactSelect
                              dynamicOptions={[...AvgTimes]}
                              className="required-fields"
                              name="AvgTime"
                              removeIsClearable={true}
                              value={locality.AvgTime}
                              onChange={(name, e) => reactLocalityChangeHander(index, name, e)}
                            />
                          </td>
                          <td data-title="NoofSlotForApp">
                            {/* <SelectBox
                              className="required-fields"
                              name="NoofSlotForApp"
                              selectedValue={locality.NoofSlotForApp}
                              onChange={(e) => localityChangeHander(index, e)}
                              options={[...TimeSlots]}
                            /> */}
                            <ReactSelect
                              dynamicOptions={[...TimeSlots]}
                              className="required-fields"
                              name="NoofSlotForApp"
                              removeIsClearable={true}
                              value={locality.NoofSlotForApp}
                              onChange={(name, e) => reactLocalityChangeHander(index, name, e)}
                            />
                          </td>
                          <td
                            data-title="Remove"
                            style={{ textAlign: "center" }}
                          >
                            <button onClick={() => removeLocality(index)}>
                              X
                            </button>
                          </td>
                        </tr>
                      ))}{" "}
                    </tbody>
                    {/* )} */}
                  </>
                </Tables>
              </div>
            </>
          </>
        )}
        <div
          className="row  pt-1 pl-2 pr-2 mb-2"
          style={{ display: "flex", justifyContent: "center" }}
        >
          <div className="col-auto">
            {load ? (
              <Loading />
            ) : (
              // <button
              //   type="button"
              //   className={`btn btn-block ${
              //     formData?.edit ? "btn-success" : "btn-success"
              //   } btn-sm`}
              //   onClick={formData?.edit ? handleUpdate : handleSubmit}
              // >
              //   {formData?.edit ? t("Update") : t("Save")}
              // </button>
              <CustomButton
                text={formData?.edit ? t("Update") : t("Save")}
                icon={formData?.edit ? t("edit") : t("Save")}
                onClick={formData?.edit ? handleUpdate : handleSubmit}
              />
            )}
          </div>
          <div className="col-auto">
            <CancelButton
              text={t("Cancel")}
              onClick={handleCancel}
            />
          </div>
        </div>
      </Accordion>

      <Accordion title={t("Search Details")} defaultValue={true}>
        <div className="row pt-2 pl-2 pr-2">
          <div className="col-sm-12 col-md-2">
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

          <div className="col-sm-12 col-md-2">
            {/* <SelectBox
              options={searchStates}
              name="StateId"
              lable="Select State"
              id="Select State"
              selectedValue={searchData?.StateId}
              onChange={handleSearchChange}
            /> */}
            <ReactSelect
              dynamicOptions={searchStates}
              name="StateId"
              lable="Select State"
              id="Select State"
              removeIsClearable={true}
              placeholderName={t("Select State")}
              value={searchData?.StateId}
              onChange={handleSearchChange}
            />
          </div>

          <div className="col-sm-12 col-md-2">
            {/* <SelectBox
              options={[{ label: "Select City", value: "" }, ...searchCities]}
              name="CityId"
              lable="Select City"
              id="Select City"
              selectedValue={searchData?.CityId}
              onChange={handleSearchChange}
            /> */}
            <ReactSelect
              dynamicOptions={[{ label: "Select City", value: "" }, ...searchCities]}
              name="CityId"
              lable="Select City"
              id="Select City"
              removeIsClearable={true}
              placeholderName={t("Select City")}
              value={searchData?.CityId}
              onChange={handleSearchChange}
            />
          </div>

          <div className="col-sm-12 col-md-2">
            <Input
              lable="Location"
              id="Location"
              placeholder=" "
              type="text"
              name="searchvalue"
              max={30}
              value={searchData.searchvalue}
              onChange={handleInputSearchChange}
            />
          </div>
          <div className="col-md-1">
            {searchLoad ? (
              <Loading />
            ) : (
              // <button
              //   type="Search"
              //   className="btn btn-block btn-info btn-sm"
              //   onClick={handleSearch}
              // >
              //   {t("Search")}
              // </button>
              <SearchButton
                text={"Search"}
                onClick={handleSearch}
              />
            )}
          </div>
        </div>
        <Tables>
          <thead className="cf text-center" style={{ zIndex: 99 }}>
            <tr>
              <th className="text-center">{t("#")}</th>
              <th className="text-center">{t("Edit")}</th>
              <th className="text-center">{t("Location Name")}</th>
              <th className="text-center">{t("Business Zone")}</th>
              <th className="text-center">{t("State")}</th>
              <th className="text-center">{t("City")}</th>
              <th className="text-center">{t("Pincode")}</th>
              <th className="text-center">{t("Status")}</th>
              <th className="text-center">{t("IsHomecollection")}</th>
              <th className="text-center">{t("Opening Time")}</th>
              <th className="text-center">{t("Closing Time")}</th>
              <th className="text-center">{t("Avg Time")}</th>
              <th className="text-center">{t("Time Slot")}</th>
            </tr>
          </thead>

          <tbody>
            {locationTable.map((ele, index) => (
              <>
                <tr key={ele?.ID}>
                  <td data-title="#" className="text-center">
                    {index + 1}
                  </td>
                  <td data-title="Edit" className="text-center">
                    <Link
                      type="button"
                      //   className="btn btn-primary btn-sm"
                      onClick={() => editLocation(ele)}
                    >
                      Edit
                    </Link>
                  </td>
                  <td data-title="Location Name" className="text-center">
                    {ele?.NAME}
                  </td>
                  <td data-title="Business Zone" className="text-center">
                    {ele?.BusinessZoneName}
                  </td>
                  <td data-title="State" className="text-center">
                    {ele?.state}
                  </td>
                  <td data-title="City" className="text-center">
                    {ele?.City}
                  </td>
                  <td data-title="Pincode" className="text-center">
                    {ele?.PinCode}
                  </td>
                  <td data-title="Status" className="text-center">
                    {ele?.active === 1 ? "Active" : "Inactive"}
                  </td>
                  <td data-title="IsHomecollection" className="text-center">
                    {ele?.isHomeCollection == "1" ? "Yes" : "No"}
                  </td>
                  <td data-title="Opening Time" className="text-center">
                    {ele?.StartTime}
                  </td>
                  <td data-title="Closing Time" className="text-center">
                    {ele?.EndTime}
                  </td>
                  <td data-title="Avg Time" className="text-center">
                    {ele?.AvgTime || 0} min
                  </td>
                  <td data-title="Time Slot" className="text-center">
                    {ele?.NoofSlotForApp || "No"} - slot
                  </td>
                </tr>
              </>
            ))}
          </tbody>
        </Tables>
      </Accordion>
    </>
  );
};

export default HomeCollectionLocationMaster;
