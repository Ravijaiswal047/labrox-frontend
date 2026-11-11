import React, { useEffect, useState } from "react";
import { DateTypeSearch, SampleStatus, SearchBy } from "../../utils/Constants";
import { SelectBox } from "../../components/formComponent/SelectBox";
import Input from "../../components/formComponent/Input";
import {
  AddBlankData,
  AllDataDropDownPayload,
  Time,
  autocompleteOnBlur,
  getTrimmedData,
  number,
} from "../../utils/helpers";
import AutoComplete from "../../components/formComponent/AutoComplete";
import moment from "moment";
import DatePicker from "../../components/formComponent/DatePicker";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import CustomTimePicker from "../../components/formComponent/TimePicker";
import Accordion from "@app/components/UI/Accordion";
import Loading from "../../components/loader/Loading";
import { axiosInstance } from "../../utils/axiosInstance";
import {
  DepartmentWiseItemList,
  getDoctorSuggestion,
} from "../../utils/NetworkApi/commonApi";
// import HistoCytoResultEntrySecondPage from "./HistoCytoResultEntrySecondPage";

import { useTranslation } from "react-i18next";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import ReceiptReprintFilter from "../Laboratory/ReceiptReprintFilter";
import ImmunoRETable from "./ImmunoRETable";
import ImmunoResultEntrySecondPage from "./ImmunoResultEntrySecondPage";
// import HistoCytoTable from "../Table/HistoCytoTable";
import ReactSelect from "../../components/formComponent/ReactSelect";

function ImmunoResultEntry() {
  const { t } = useTranslation();
  const [CentreData, setCentreData] = useState([]);
  const [RateTypes, setRateTypes] = useState([]);
  const [DepartmentData, setDepartmentData] = useState([]);
  const [indexMatch, setIndexMatch] = useState(0);
  const [doctorSuggestion, setDoctorSuggestion] = useState([]);
  const [dropFalse, setDropFalse] = useState(true);
  const [TestSuggestion, setTestSuggestion] = useState([]);
  const [loading, setLoading] = useState(false);
  const [redata, SetReData] = useState([]);
  const [load, setLoad] = useState(false);
  const [errors, setErrors] = useState({});
  const [statusValue, setStatusValue] = useState("");
  const [innerData, setinnerData] = useState({});
  const [show4, setShow4] = useState({
    modal: false,
    data: "",
    index: -1,
  });
  const [show6, setShow6] = useState({
    modal: false,
    data: "",
    index: -1,
  });
  const today = new Date();
  const [formData, setFormData] = useState({
    FromDate: new Date(),
    ToDate: new Date(),
    CentreID: "",
    ItemValue: "",
    RateTypeID: "",
    SelectTypes: "",
    RefundFilter: null,
    FromTime: new Date(today.setHours(0, 0, 0, 0)),
    ToTime: new Date(today.setHours(23, 59, 59, 999)),
    DoctorReferal: "",
    DepartmentID: "",
    DoctorName: "",
    TestName: "",
    SampleStatus: "3",
    DateTypeSearch: "Date",
    IsUrgent: "",
    MachineID: 0,
    IsTat: 0,
    Order: "DESC",
    Flag: "",
    moreFilter: 0,
    parameterId: [],
    valueCheck: "=",
    valueToSearch: "",
    valueRangeFrom: "",
    valueRangeTo: "",
  });

  // console.log({ redata })
  // console.log({ innerData })
  const [selects, setSelects] = useState(false);
  const [columnConfig, setColumnConfig] = useState([]);
  const EmployeeID = useLocalStorage("userData", "get")?.EmployeeID;
  const DefaultCurrencyName = useLocalStorage("userData", "get")?.DefaultCurrencyName

  const fetchRateTypes = async (id) => {
    try {
      const res = await axiosInstance.post("Centre/GetRateType", {
        CentreId: id,
      });
      const list = res?.data?.message.map((item) => ({
        label: item?.RateTypeName,
        value: item?.RateTypeID,
      }));
      setRateTypes(list);
    } catch (err) {
      console.log(err);
    }
  };
  const handleSelectChange = (event) => {
    const { name, value, checked, type } = event?.target;
    if (name == "IsUrgent") {
      setFormData({
        ...formData,
        [name]: type === "checkbox" ? checked : value,
      });
    }
    else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSearchSelectChange = (label, value) => {
    if (label === "CentreID") {
      setFormData({ ...formData, [label]: value?.value, RateTypeID: "" });
      if (value?.value == "") {
        fetchRateTypes(CentreData.map((ele) => ele?.value));
      } else {
        fetchRateTypes([value?.value]);
      }
    } else {
      setFormData({ ...formData, [label]: value?.value });
    }
  }


  const getFilterResultOption = () => {
    axiosInstance
      .post("Lab/getFilterTableReprintData", {
        PageName: "ResultEntry",
        EmployeeId: EmployeeID?.toString(),
      })
      .then((res) => {
        let data = res?.data?.message;

        setColumnConfig(data);
      })
      .catch((err) => setColumnConfig([]));
  };

  const handleListSearchNew = (data, name) => {
    switch (name) {
      case "DoctorName":
        setFormData({
          ...formData,
          [name]: data.Name,
          DoctorReferal: data.Name ? data.DoctorReferalID : "",
        });
        setIndexMatch(0);
        setDoctorSuggestion([]);
        setDropFalse(false);
        break;

      case "TestName":
        setFormData({
          ...formData,
          [name]: data.TestName,
        });
        setSelects(false);
        setIndexMatch(0);
        setTestSuggestion([]);
        break;
      default:
        break;
    }
  };

  const GetResultEntry = (_, index) => {
    setinnerData(redata[index]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name == "TestName") {
      if (value == "") {
        setSelects(false);
        setTestSuggestion([]);
      } else {
        setSelects(true);
        setTestSuggestion((prev) =>
          prev.filter((ele) => {
            return ele.TestName?.toLowerCase().includes(value.toLowerCase());
          })
        );
      }
      setFormData({ ...formData, [name]: value });
    } else if (name == "DoctorName") {
      if (value == "") {
        setDoctorSuggestion([]);
      } else {
        setDoctorSuggestion((prev) =>
          prev.filter((ele) =>
            ele.Name?.toLowerCase().includes(value.toLowerCase())
          )
        );
      }
      setFormData({ ...formData, [name]: value });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleIndexNew = (e, name) => {
    switch (name) {
      case "DoctorName":
        switch (e.which) {
          case 38:
            if (indexMatch !== 0) {
              setIndexMatch(indexMatch - 1);
            } else {
              setIndexMatch(doctorSuggestion.length - 1);
            }
            break;
          case 40:
            if (doctorSuggestion.length - 1 === indexMatch) {
              setIndexMatch(0);
            } else {
              setIndexMatch(indexMatch + 1);
            }
            break;
          case 13:
            handleListSearchNew(doctorSuggestion[indexMatch], name);
            setIndexMatch(0);
            break;
          default:
            break;
        }
        break;
      case "TestName":
        switch (e.which) {
          case 38:
            if (indexMatch !== 0) {
              setIndexMatch(indexMatch - 1);
            } else {
              setIndexMatch(TestSuggestion.length - 1);
            }
            break;
          case 40:
            if (TestSuggestion.length - 1 === indexMatch) {
              setIndexMatch(0);
            } else {
              setIndexMatch(indexMatch + 1);
            }
            break;
          case 13:
            handleListSearchNew(TestSuggestion[indexMatch], name);
            setIndexMatch(0);
            break;
          default:
            break;
        }
        break;
      default:
        break;
    }
  };

  const getAccessCentres = () => {
    axiosInstance
      .get("Centre/getAccessCentres")
      .then((res) => {
        let data = res.data.message;
        let CentreDataValue = data.map((ele) => {
          return {
            value: ele.CentreID,
            label: ele.Centre,
          };
        });
        let allValues = CentreDataValue.map((ele) => ele.value);
        setCentreData(CentreDataValue);
        fetchRateTypes(allValues);
      })
      .catch((err) => console.log(err));
  };

  const getDepartment = () => {
    axiosInstance
      .get("IHC/IHCGetData")
      .then((res) => {
        let data = res.data.data;
        let DeptDataValue = data.map((ele) => {
          return {
            value: ele.DepartmentID,
            label: ele.Department,
          };
        });

        setDepartmentData(DeptDataValue);
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    getDoctorSuggestion(formData, setDoctorSuggestion, setFormData);
    if (formData?.DoctorName === "") {
      setDropFalse(true);
    }
  }, [formData?.DoctorName]);

  const ImmunoDepartmentWiseItemList = (id, name, state, autocomplete) => {
    axiosInstance
      .post("IHC/IHCDepartmentWiseItemList", {
        DepartmentID: id,
        SearchText: name,
      })
      .then((res) => {
        const data = res?.data?.data;
        const val = data?.map((ele) => {
          return {
            label: ele?.TestName,
            value: ele?.TestName,
          };
        });
        state(autocomplete ? val : data);
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Error Occured"
        );
      });
  };

  useEffect(() => {
    if (formData?.TestName.length > 2) { 
      ImmunoDepartmentWiseItemList(
        formData.DepartmentID,
        formData?.TestName,
        setTestSuggestion
      );
    }
  }, [formData?.TestName]);


  const handleSelectChange1 = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
    value != -1 && TableData(value);
  };

  const dateSelect = (date, name) => {
    setFormData({
      ...formData,
      [name]: date,
    });
  };

  const handleTime = (time, name) => {
    setFormData({ ...formData, [name]: time });
  };
  const validation = () => {
    let error = "";
    if (
      formData?.SelectTypes.trim() !== "" &&
      formData?.ItemValue.trim() === ""
    ) {
      error = { ...error, ItemValue: "Please Choose Value" };
    }
    if (formData.SelectTypes === "Mobile") {
      if (formData?.SelectTypes !== "" && formData?.ItemValue === "") {
        error = { ...error, ItemValue: "This Field is Required" };
      } else if (formData.ItemValue.length !== 10) {
        error = { ...error, ItemValue: "Invalid Mobile Number" };
      }
    }

    return error;
  };

  const TableData = (status) => {

    const generatedError = validation();
    if (generatedError === "") {
      setLoading(true);
      const rateTypes = RateTypes.map((item) => {
        return item?.value;
      });
      axiosInstance
        .post(
          "IHCResultentry/GetImmunoResultEntry",
          getTrimmedData({
            // CentreID: AllDataDropDownPayload(
            //   formData.CentreID,
            //   CentreData,
            //   "value"
            // ),
            CentreID: formData?.CentreID== null || formData?.CentreID== ""
              ? []
              : [formData?.CentreID],
            MachineID: "0",
            SearchType: formData.SelectTypes,
            ItemValue: formData.ItemValue,
            RateTypeId:
              formData?.RateTypeID == null || formData?.RateTypeID == ""
                ? []
                : [formData?.RateTypeID],
            DoctorReferal: formData.DoctorReferal,
            FromDate: moment(formData.FromDate).format("DD/MMM/YYYY"),
            ToDate: moment(formData.ToDate).format("DD/MMM/YYYY"),
            FromTime: Time(formData.FromTime),
            ToTime: Time(formData.ToTime),
            // DepartmentId: AllDataDropDownPayload(
            //   formData.DepartmentID,
            //   DepartmentData,
            //   "value"
            // ),
            DepartmentId: formData?.DepartmentID== null || formData?.DepartmentID== ""
              ? []
              : [formData?.DepartmentID],
            SampleStatus: status,
            TestName: formData?.TestName,
            DateTypeSearch: formData?.DateTypeSearch,
            IsUrgent: formData?.IsUrgent ? "1" : "0",
            PatientType: "",
            SearchValue: "",

          })
        )

        .then((res) => {

          SetReData(res?.data?.message);
          setStatusValue(status === "" ? status : parseInt(status));
          setLoad(true);
          setLoading(false);
        })
        .catch((err) => setLoading(false));
      setErrors(generatedError);
    } else {
      setErrors(generatedError);
    }
  };

  useEffect(() => {
    getAccessCentres();
    getDepartment();
    getFilterResultOption();
  }, []);
  const innerDataUpdate = (data) => {
    setinnerData(data)
  }
  return (
    <>
      {Object.keys(innerData)?.length === 0 ? (
        <>
          <Accordion title="IHC Result Entry Details" defaultValue={true}>
            <div>
              <div className="box-body">
                <div className="row  px-2 mt-2 mb-1">
                  <div className="col-sm-2">
                    <div className="d-flex" style={{ display: "flex" }}>
                      <div style={{ width: "50%" }}>
                        <SelectBox
                          options={SearchBy}
                          id="SelectTypes"
                          lable="SelectTypes"
                          selectedValue={formData.SelectTypes}
                          name="SelectTypes"
                          onChange={handleSelectChange}
                        />
                      </div>
                      <div style={{ width: "50%" }}>
                        {formData?.SelectTypes === "Mobile" ? (
                          <div style={{ width: "100%" }}>
                            <Input
                              type="number"
                              name="ItemValue"
                              max={10}
                              value={formData.ItemValue}
                              onChange={handleChange}
                              onInput={(e) => number(e,DefaultCurrencyName == "KES" ? 14 : 10)}
                            />
                            {errors?.ItemValue && (
                              <div className="error-message">
                                {errors?.ItemValue}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div style={{ width: "100%" }}>
                            <Input
                              type="text"
                              name="ItemValue"
                              max={20}
                              value={formData.ItemValue}
                              onChange={handleChange}
                            />
                            {errors?.ItemValue && (
                              <div className="error-message">
                                {errors?.ItemValue}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="col-sm-2  ">
                    <ReactSelect
                      dynamicOptions={AddBlankData(CentreData, "All Centre")}
                      name="CentreID"
                      lable={t("Centre")}
                      id="Centre"
                      removeIsClearable={true}
                      placeholderName={t("Centre")}
                      value={formData?.CentreID}
                      onChange={handleSearchSelectChange}
                    />
                  </div>

                  <div className="col-sm-2 ">
                    <ReactSelect
                      dynamicOptions={[
                        { label: "All RateType", value: "" },
                        ...RateTypes,
                      ]}
                      name="RateTypeID"
                      lable={t("RateType")}
                      id="RateType"
                      removeIsClearable={true}
                      placeholderName={t("RateType")}
                      value={formData?.RateTypeID}
                      onChange={handleSearchSelectChange}
                    />
                  </div>

                  <div className="col-sm-2  ">
                    <ReactSelect
                      dynamicOptions={AddBlankData(
                        DepartmentData,
                        "All Department"
                      )}
                      name="DepartmentID"
                      lable={t("Department")}
                      id="Department"
                      removeIsClearable={true}
                      placeholderName={t("Department")}
                      value={formData?.DepartmentID}
                      onChange={handleSearchSelectChange}
                    />
                  </div>

                  <div className="col-sm-2  ">
                    <Input
                      type="text"
                      lable="Refer Doctor"
                      id="DoctorName"
                      name="DoctorName"
                      value={formData.DoctorName}
                      onChange={handleChange}
                      placeholder=" "
                      onBlur={(e) => {
                        autocompleteOnBlur(setDoctorSuggestion);
                        setTimeout(() => {
                          const data = doctorSuggestion.filter(
                            (ele) => ele?.Name === e.target.value
                          );
                          if (data.length === 0) {
                            setFormData({ ...formData, DoctorName: "" });
                          }
                        }, 500);
                      }}
                      autoComplete="off"
                    />
                    {dropFalse && doctorSuggestion.length > 0 && (
                      <ul className="suggestion-data">
                        {doctorSuggestion.map((data, index) => (
                          <li
                            onClick={() =>
                              handleListSearchNew(data, "DoctorName")
                            }
                            className={`${index === indexMatch && "matchIndex"}`}
                            key={index}
                          >
                            {data?.Name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="col-sm-2  ">
                    <Input
                      type="text"
                      name="TestName"
                      lable="Search By Test Name"
                      id="TestName"
                      value={formData.TestName}
                      placeholder=" "
                      onChange={handleChange}
                      onKeyDown={(e) => handleIndexNew(e, "TestName")}
                    />
                    {TestSuggestion.length > 0 && (
                      <AutoComplete
                        selects={selects}
                        test={TestSuggestion}
                        handleListSearch={handleListSearchNew}
                        indexMatch={indexMatch}
                      />
                    )}
                  </div>
                </div>
                <div className="row  px-2 mt-1 ">
                  <div className="col-sm-2">
                    <SelectBox
                      lable="DateTypeSearch"
                      options={[
                        { label: "Registration Date", value: "Date" },
                        ...DateTypeSearch,
                      ]}
                      selectedValue={formData?.DateTypeSearch}
                      name="DateTypeSearch"
                      onChange={handleSelectChange}
                    />
                  </div>
                  <div className="col-sm-2">
                    <DatePicker
                      className="custom-calendar"
                      name="FromDate"
                      value={formData?.FromDate}
                      onChange={dateSelect}
                      placeholder=" "
                      id="FromDate"
                      lable="FromDate"
                      maxDate={new Date(formData?.ToDate)}
                    />
                  </div>
                  <div className="col-sm-1">
                    <CustomTimePicker
                      name="FromTime"
                      placeholder="FromTime"
                      value={formData?.FromTime}
                      id="FromTime"
                      lable="FromTime"
                      onChange={handleTime}
                    />
                  </div>
                  <div className="col-sm-2">
                    <DatePicker
                      className="custom-calendar"
                      name="ToDate"
                      value={formData?.ToDate}
                      onChange={dateSelect}
                      placeholder=" "
                      id="ToDate"
                      lable="ToDate"
                      maxDate={new Date()}
                      minDate={new Date(formData?.FromDate)}
                    />
                  </div>
                  <div className="col-sm-1">
                    <CustomTimePicker
                      name="ToTime"
                      placeholder="ToTime"
                      value={formData?.ToTime}
                      id="ToTime"
                      lable="ToTime"
                      onChange={handleTime}
                    />
                  </div>
                  <div className="col-sm-2">
                    <SelectBox
                      options={[...SampleStatus]}
                      onChange={handleSelectChange1}
                      name="SampleStatus"
                      lable="SampleStatus"
                      id="SampleStatus"
                      selectedValue={formData.SampleStatus}
                    />
                  </div>
                  <div className="col-sm-2   ">
                    <SelectBox
                      options={[
                        { label: "TAT Report - All", value: 0 },
                        { label: "In TAT", value: 1 },
                        { label: "Out TAT", value: 2 },
                      ]}
                      selectedValue={formData?.IsTat}
                      lable="IsTat"
                      id="IsTat"
                      name="IsTat"
                      onChange={handleSelectChange}
                    />
                  </div>
                </div>
                <div className="row px-2 mb-1">
                  <div className="col-sm-1 mt-1">
                    <input
                      id="IsUrgent"
                      type="checkbox"
                      name="IsUrgent"
                      checked={formData?.IsUrgent}
                      onChange={handleSelectChange}
                    />
                    <label htmlFor="IsUrgent">&nbsp;&nbsp;IsUrgent</label>
                  </div>
                  <div className="col-sm-1 ">
                    <button
                      onClick={() =>
                        TableData(document.getElementById("SampleStatus").value)
                      }
                      className="btn btn-primary btn-sm w-100"
                    >
                      Search
                    </button>
                  </div>{" "}
                </div>
              </div>
            </div>
          </Accordion>
          <Accordion
            title={
              <>
                {redata?.length == 0 ? (
                  "Search Result"
                ) : (
                  <div className="d-flex">
                    <span className="mt-1">
                      {" "}
                      {t("Click Icon To Filter Results")}{" "}
                    </span>
                    <span className="header ml-1" style={{ cursor: "pointer" }}>
                      <ReceiptReprintFilter
                        columnConfig={columnConfig}
                        setColumnConfig={setColumnConfig}
                        PageName="ResultEntry"
                      />
                    </span>
                  </div>
                )}
              </>
            }
            notOpen={true}
            defaultValue={true}
          >
            {loading ? (
              <Loading />
            ) : load ? (
              <div className="">
                <>
                  <ImmunoRETable
                    dispatchData={redata}
                    innerDataUpdate={innerDataUpdate}
                  // show2={setShow}
                  />
                </>
              </div>
            ) : (
              <div className="">
                <NoRecordFound />
              </div>
            )}
          </Accordion>
        </>
      ) : (
        <>
          <Accordion title={t("IHC Patient Result Entry ")} defaultValue={true}>
            <ImmunoResultEntrySecondPage
              innerData={innerData}
              setinnerData={setinnerData}
              statusValue={statusValue}
              setStatusValue={setStatusValue}
            />

          </Accordion>
        </>

      )}
    </>
  );
}

export default ImmunoResultEntry;
