import React from "react";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useEffect } from "react";
import moment from "moment";
import {
  PhelboSaveHolidayValidationSchema,
  PhelboSearchHolidayValidationSchema,
} from "../../utils/Schema";
import { SelectBox } from "../../components/formComponent/SelectBox";
import DatePicker from "../../components/formComponent/DatePicker";
import { Link } from "react-router-dom";
import ExportFile from "../../components/formComponent/ExportFile";
import Accordion from "@app/components/UI/Accordion";
import Tables from "../../components/UI/customTable";
import Loading from "../../components/loader/Loading";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { CancelButton, CustomButton, SaveButton, SearchButton } from "../../components/UI/CustomButton";
const PhlebotomistHoliday = () => {
  const [loading, setLoading] = useState(false); // This state is used for setting loading screen
  const [errors, setErros] = useState({}); // This state is used for setting errors
  const [states, setStates] = useState([]); // This state is used for setting states
  const [cities, setCities] = useState([]); // This state is used for setting cities
  const [list, setlist] = useState([]); // setting phelbo based on cities
  const [phleboTable, setPhleboTable] = useState(null); // setting phelbo table after search
  const initialState = {
    StateId: "",
    CityId: "",
    Phlebotomist: "",
    FromDate: new Date(),
    ToDate: new Date(),
    status: "Active",
  }; // for phelbo holiday setting initial state not a state
  const [phleboHoliday, setphleboHoliday] = useState(initialState); // for phelbo holiday details
  const [searchData, setSearchData] = useState({
    NoOfRecord: 50,
    fromDate: new Date(),
    toDate: new Date(),
  }); // for handling search

  // for trnslation
  const { t } = useTranslation();

  // fetching state
  const fetchStates = () => {
    axios
      .post("api/v1/CommonHC/GetStateData", {
        BusinessZoneID: 0,
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
        console.log(data);
        setStates(value);
      })
      .catch((err) => {
        setLoading(false);
        setlist([]);
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Error Occured",
        );
      });
  };

  // fetching cities based on state
  const fetchCities = (id) => {
    const postdata = {
      StateId: [id],
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
        setCities(value);
      })
      .catch((err) => {
        setLoading(false);
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Error Occured",
        );
      });
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
        setlist(value);
      })
      .catch((err) => {
        setLoading(false);
        setlist([]);
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Error Occured",
        );
      });
  };

  //used for spliting cityid because cityid comes in diffrent formate
  const handleSplitData = (id) => {
    const data = id.split("#")[0];
    return data;
  };

  // fething states on first render
  useEffect(() => {
    fetchStates();
  }, []);

  // options for no of records to search
  const recordoptions = [
    { label: "50", value: "50" },
    { label: "100", value: "100" },
    { label: "200", value: "200" },
    { label: "500", value: "500" },
    { label: "1000", value: "1000" },
    { label: "2000", value: "2000" },
  ];

  // dynamically setting data value in state
  const dateSelect = (date, name, value) => {
    if (name === "FromDate") {
      const updateDate =
        new Date(phleboHoliday?.ToDate) - date < 0
          ? date
          : phleboHoliday.ToDate;
      setphleboHoliday((phleboHoliday) => ({
        ...phleboHoliday,
        [name]: date,
        ToDate: updateDate,
      }));
    } else if (name === "ToDate") {
      setphleboHoliday((phleboHoliday) => ({ ...phleboHoliday, [name]: date }));
    }
  };

  // changing formate of date and setting it in state
  const handleSearchChange = (date, name, event) => {
    if (name === "fromDate") {
      const updateDate =
        new Date(phleboHoliday?.ToDate) - date < 0
          ? date
          : phleboHoliday.ToDate;
      const newDate = moment(updateDate).format("DD-MMM-YYYY");
      setSearchData({ ...searchData, [name]: date, toDate: newDate });
    } else if (name === "toDate") {
      setSearchData({ ...searchData, [name]: date });
    } else {
      setSearchData({
        ...searchData,
        [name]: date,
      });
    }
  };

  // dynamically managing selected option in state
  const handleSelectChange = async (name, event) => {
    const { value} = event;

    if (name === "StateId") {
      if (value === "") {
        setCities([]);
        setlist([]);
        setphleboHoliday((searchData) => ({
          ...searchData,
          [name]: value,
          CityId: "",
          Phlebotomist: "",
        }));
      } else {
        setCities([]);
        setlist([]);
        fetchCities(value);
        setphleboHoliday((searchData) => ({
          ...searchData,
          [name]: value,
          CityId: "",
          Phlebotomist: "",
        }));
      }
    }
    if (name === "CityId") {
      if (value === "") {
        setlist([]);
        setphleboHoliday((searchData) => ({
          ...searchData,
          [name]: value,
          Phlebotomist: "",
        }));
      } else {
        setlist([]);
        setphleboHoliday((searchData) => ({
          ...searchData,
          [name]: value,
          Phlebotomist: "",
        }));
        fetchphelbo(value);
      }
    }
    if (name === "Phlebotomist") {
      setphleboHoliday((searchData) => ({ ...searchData, [name]: value?.toString() }));
    }
    if (name === "NoOfRecord") {
      setSearchData((searchData) => ({
        ...searchData,
        NoOfRecord: value,
      }));
    }
  };

  // calling api for canceling phelbo holiday with phelbo id
  const deleteHoliday = (value) => {
    setLoading(true);
    axios
      .post("api/v1/PhelebotomistMaster/CancelPhelboHoliday", {
        holiDayId: value.toString(),
      })
      .then((res) => {
        if (res.data.success) {
          setLoading(false);
          toast.success(res?.data?.message || "Cancelled successfully");
          searchHoliday();
        }
        else{
          toast.info(res?.data?.message || "Holiday Not Cancelled");
        }
      })
      .catch((err) => {
        setLoading(false);
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Error Occured",
        );
      })
      .finally(() => {
        setLoading(false);
      });    
  };

  // searching all phelbo having holiday within date
  const searchHoliday = async () => {
    const generatedError = PhelboSearchHolidayValidationSchema(searchData);
    setLoading(true);
    if (generatedError === "") {
      await axios
        .post("api/v1/PhelebotomistMaster/GetHolidayData", {
          FromDate: moment(searchData.fromDate).format("DD/MMM/YYYY"),
          ToDate: moment(searchData.toDate).format("DD/MMM/YYYY"),
          NoOfRecord: searchData.NoOfRecord,
        })
        .then((res) => {
          if (res.data.message) {
            setLoading(false);
            setPhleboTable(res.data.message);
            // toast.success("Found Details");
          }
        })
        .catch((err) => {
          setLoading(false);
          setPhleboTable(null);
          toast.error("No Details Found");
        })
        .finally(() => {
          setLoading(false);
        });
    }
    else{
        setLoading(false);
        setErros(generatedError);
    }
    
  };

  // saving holiday for phelbo
  const saveHoliday = () => {
    const generatedError = PhelboSaveHolidayValidationSchema(phleboHoliday);
    setLoading(true);
    if (generatedError === "") {
      axios
        .post("api/v1/PhelebotomistMaster/SaveHoliDay", {
          FromDate: moment(phleboHoliday.FromDate).format("DD/MMM/YYYY"),
          ToDate: moment(phleboHoliday.ToDate).format("DD/MMM/YYYY"),
          PhlebotomistId: phleboHoliday.Phlebotomist,
        })
        .then((res) => {
          if (res?.data?.success) {
            setLoading(false);
            toast.success(res?.data?.message || "Saved Successfully");
            //window.location.reload(true);
            setphleboHoliday(initialState);
            searchHoliday();
          }
          else{
            toast.info(res?.data?.message || "Holiday Not Saved");
          }
        })
        .catch((err) => {
          setLoading(false);
          toast.error(
            err?.response?.data?.message
              ? err?.response?.data?.message
              : "Error Occured",
          );
        })
        .finally(() => {
          setLoading(false);
        });
    }
    else{
        setLoading(false);
        setErros(generatedError);
    }
  };

  const handleClear = () => {
    setPhleboTable(null);
  };

  return (
    <>
      <Accordion
        name={t("Phelebotomist Holiday")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row pt-2 pl-2 pr-2 mb-1">
          <div className="col-sm-2">
            {/* <SelectBox
              lable="State"
              id="State"
              className="required-fields"
              name="StateId"
              onChange={handleSelectChange}
              selectedValue={phleboHoliday?.StateId}
              options={[{ label: "Select State", value: "" }, ...states]}
            /> */}
            <ReactSelect
                dynamicOptions={[{ label: "Select State", value: "" }, ...states]}
                lable="State"
              id="State"
              className="required-fields"
              name="StateId"
                removeIsClearable={true}
                placeholderName={t("State")}
                value={phleboHoliday?.StateId}
                onChange={handleSelectChange}
              />
            {phleboHoliday?.StateId === "" && (
              <span className="error-message">{errors?.StateId}</span>
            )}
          </div>

          <div className="col-sm-2">
            {/* <SelectBox
              name="CityId"
              lable="City"
              id="City"
              className="required-fields"
              onChange={handleSelectChange}
              selectedValue={phleboHoliday?.CityId}
              options={[{ label: "Select City", value: "" }, ...cities]}
            /> */}
            <ReactSelect
                dynamicOptions={[{ label: "Select City", value: "" }, ...cities]}
                name="CityId"
              lable="City"
              id="City"
              className="required-fields"
                removeIsClearable={true}
                placeholderName={t("City")}
                value={phleboHoliday?.CityId}
                 onChange={handleSelectChange}
              />
            {phleboHoliday?.CityId === "" && (
              <span className="error-message">{errors?.CityId}</span>
            )}
          </div>

          <div className="col-sm-2">
            {/* <SelectBox
              lable="Phlebotomist"
              id="Phlebotomist"
              className="required-fields"
              name="Phlebotomist"
              onChange={handleSelectChange}
              selectedValue={phleboHoliday?.Phlebotomist}
              options={[{ label: "Select ", value: "" }, ...list]}
            /> */}
             <ReactSelect
                dynamicOptions={[{ label: "Select ", value: "" }, ...list]}
                lable="Phlebotomist"
              id="Phlebotomist"
              className="required-fields"
              name="Phlebotomist"
                removeIsClearable={true}
                placeholderName={t("Phlebotomist")}
                value={phleboHoliday?.Phlebotomist}
                 onChange={handleSelectChange}
              />
            {phleboHoliday?.Phlebotomist === "" && (
              <span className="error-message">{errors?.Phlebotomist}</span>
            )}
          </div>

          <div className="col-sm-2">
            <DatePicker
              className="custom-calendar required-fields"
              id="FromDate"
              lable="FromDate"
              placeholder=" "
              name="FromDate"
              value={
                phleboHoliday?.FromDate
                  ? new Date(phleboHoliday?.FromDate)
                  : new Date()
              }
              onChange={dateSelect}
              minDate={new Date()}
            />
            {phleboHoliday?.FromDate === "" && (
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
                phleboHoliday?.ToDate
                  ? new Date(phleboHoliday?.ToDate)
                  : new Date()
              }
              minDate={phleboHoliday?.FromDate}
              onChange={dateSelect}
            />
            {phleboHoliday?.ToDate === "" && (
              <span className="error-message">{errors?.ToDate}</span>
            )}
          </div>
          <div className="col-sm-1 col-xs-12">
            <SaveButton
              text={"Save"}
              onClick={saveHoliday}
            />
          </div>
        </div>
      </Accordion>
      <Accordion title={t("Search Details")} defaultValue={true}>
        <div className="row mt-2">
          <div className="col-sm-2">
            {/* <SelectBox
              options={recordoptions}
              name="NoOfRecord"
              lable="NoOfRecord"
              id="NoOfRecord"
              selectedValue={searchData?.NoOfRecord}
              onChange={handleSelectChange}
            /> */}
            <ReactSelect
                dynamicOptions={recordoptions}
                name="NoOfRecord"
              lable="NoOfRecord"
              id="NoOfRecord"
                removeIsClearable={true}
                placeholderName={t("Phlebotomist")}
                value={searchData?.NoOfRecord}
                 onChange={handleSelectChange}
              />
          </div>

          <div className="col-sm-2">
            <DatePicker
              className="custom-calendar required-fields"
              id="FromDate"
              lable="FromDate"
              placeholder=" "
              name="fromDate"
              value={
                searchData?.fromDate
                  ? new Date(searchData?.fromDate)
                  : new Date()
              }
              onChange={handleSearchChange}
              //maxDate={searchData?.toDate}
            />
            {searchData?.fromDate === "" && (
              <span className="error-message">{errors?.fromDate}</span>
            )}
          </div>

          <div className="col-sm-2">
            <DatePicker
              className="custom-calendar required-fields"
              id="ToDate"
              lable="ToDate"
              placeholder=" "
              name="toDate"
              value={
                searchData?.toDate ? new Date(searchData?.toDate) : new Date()
              }
              minDate={searchData?.fromDate}
              onChange={handleSearchChange}
            />
            {searchData?.toDate === "" && (
              <span className="error-message">{errors?.toDate}</span>
            )}
          </div>

          <div className="col-sm-auto">
            <SearchButton
              text={"Search"}
              onClick={searchHoliday}
            />
          </div>

          <div className="col-sm-auto">
            {phleboTable ? (
              <ExportFile dataExcel={phleboTable} />
            ) : (
              // <button className="btn btn-block  btn-success btn-sm">
              //   Download Excel
              // </button>
              <CustomButton
                text={"Download Excel"}
              />
            )}
          </div>
        </div>
        {loading ? (
          <Loading />
        ) : (
          <>
            {phleboTable && phleboTable.length > 0 && (
              <div>
                <Tables
                  className="table table-bordered table-hover table-striped tbRecord"
                  cellPadding="{0}"
                  cellSpacing="{0}"
                >
                  <thead className="cf text-center" style={{ zIndex: 99 }}>
                    <tr>
                      <th className="text-center">{t("#")}</th>
                      <th className="text-center">{t("Cancel")}</th>
                      <th className="text-center">{t("Phlebotomist")}</th>
                      <th className="text-center">{t("From Date")}</th>
                      <th className="text-center">{t("To Date")}</th>
                      <th className="text-center">{t("Status")}</th>
                    </tr>
                  </thead>

                  <tbody>
                    {phleboTable &&
                      phleboTable.map((ele, index) => (
                        <>
                          <tr key={index}>
                            <td data-title="#" className="text-center">
                              {index + 1}
                            </td>
                            <td data-title="Cancel" className="text-center">
                              <CustomButton
                              icon={"edit"}
                                onClick={() => deleteHoliday(ele.ID)}
                              />
                            </td>
                            <td
                              data-title="Phlebotomist"
                              className="text-center"
                            >
                              {ele.Name}&nbsp;
                            </td>
                            <td data-title="FromDate" className="text-center">
                              {ele.FromDate}&nbsp;
                            </td>
                            <td data-title="ToDate" className="text-center">
                              {ele.ToDate}&nbsp;
                            </td>
                            <td data-title="status" className="text-center">
                              {ele.STATUS}&nbsp;
                            </td>
                          </tr>
                        </>
                      ))}
                  </tbody>
                </Tables>

                <div
                  className="row mt-2 mb-1"
                  style={{ display: "flex", justifyContent: "center" }}
                >
                  <div className="col-sm-1">
                    <CancelButton
                      text={"Clear"}
                       onClick={handleClear}
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </Accordion>
    </>
  );
};

export default PhlebotomistHoliday;
