import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  getAccessCentres,
  getDepartment,
} from "../../utils/NetworkApi/commonApi";
import { isChecked } from "../util/Commonservices";
import { axiosInstance } from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import Accordion from "@app/components/UI/Accordion";
import { SelectBox } from "../../components/formComponent/SelectBox";
import {
  BookingCutoffOptions,
  DayType,
  EmergencyDayType,
  IPDDayType,
  ManageDeliveryDaysType,
  OPDDayType,
  ReportingCutoffOptions,
} from "../../utils/Constants";
import Input from "../../components/formComponent/Input";
import Loading from "../../components/loader/Loading";
import Tables from "../../components/UI/customTable";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { SaveButton, SearchButton } from "../../components/UI/CustomButton";

const ManageDeliveryDays = () => {
  const [CentreID, setCentreID] = useState([]);
  const [Department, setDepartment] = useState([]);
  const [load, setLoad] = useState({
    searchLoad: false,
    saveLoad: false,
  });
  const [tableData, setTableData] = useState([]);
  const [state, setState] = useState({
    searchText: "",
    centreId: "",
    departmentId: "",
    allCentres: false,
    TestCode: "",
  });
  const { t } = useTranslation();

  const handleSelectChange = (event) => {
    const { name, value, checked, type } = event.target;
    if (name == "allCentres")
      setState({ ...state, [name]: type === "checkbox" ? checked : value });
    else if (name == "type") {
      setState({
        ...state,
        [name]: type === "checkbox" ? checked : value,
        searchText: "",
        TestCode: "",
      });
      setTableData([]);
    } else {
      setState({ ...state, [name]: type === "checkbox" ? checked : value });
      setTableData([]);
    }
  };

  const handleChangeMain = (e, index) => {
    const { value, name, checked, type } = e.target;
    console.log({ value, name });
    if (name == "Hours" && value > 24) {
      return;
    }
    if (index >= 0) {
      const data = [...tableData];
      data[index][name] = type === "checkbox" ? checked : value;
      setTableData(data);
    } else {
      const updatedTableData = tableData.map((ele) => {
        return {
          ...ele,
          [name]: type === "checkbox" ? checked : value,
        };
      });
      setTableData(updatedTableData);
    }
  };

  const handleDayType = (e, index) => {
    const { name, value, checked } = e.target;
    if (index >= 0) {
      const data = [...tableData];
      data[index][name] = value;
      setTableData(data);
    } else {
      const val = tableData.map((ele) => {
        return {
          ...ele,
          [name]: value ? value : checked ? 1 : 0,
        };
      });
      setTableData(val);
    }
  };

  const handleWeekDays = (name, value, index) => {
    const data = [...tableData];
    data[index][name] = value == "0" ? "1" : "0";
    setTableData(data);
  };

  const fetch = (type) => {
    setLoad({ ...load, searchLoad: true });
    const payload = {
      TestName: state?.searchText.trim(),
      DepartmentId: state?.departmentId,
      CentreId: state?.centreId,
      MasterStatus: type,
      TestCode: state?.TestCode,
    };
    if (payload.CentreId == "") {
      setTableData([]);
      toast.error("Select Centre");
      setLoad({ ...load, searchLoad: false });
    } else {
      axiosInstance
        .post("ManageDeliveryDays/getDeliveryDays", payload)
        .then((res) => {
          setLoad({ ...load, searchLoad: false });
          const data = res.data.message;
          const val = data.map((ele) => {
            return {
              ...ele,
              isChecked: false,
              IPDsameasopd: ele?.IPDsameasopd === "1" ? true : false,
              Emergencysameasopd:
                ele?.Emergencysameasopd === "1" ? true : false,
              centreId: "",
            };
          });
          setTableData(val);
        })
        .catch((err) => {
          toast.error(err.response.data.message);
          setLoad({ ...load, searchLoad: false });
          setTableData([]);
        });
    }
  };

  const handleSubmit = () => {
    const find = tableData.filter((ele) => ele?.isChecked === true);
    const data = find.map((ele) => {
      if (!state?.allCentres) {
        return { ...ele, centreId: state?.centreId, allCentres: "" };
      } else {
        return {
          ...ele,
          centreId: "0",
          allCentres: "1",
        };
      }
    });
    const payload = data.map((item) => {
      console.log({ item });

      return {
        Investigation_ID: item.Investigationid.toString(),
        SubcategoryID: item.DepartmentID.toString(),
        Sun: item.Sun.toString(),
        Mon: item.Mon.toString(),
        Tue: item.Tue.toString(),
        Wed: item.Wed.toString(),
        Thu: item.Thu.toString(),
        Fri: item.Fri.toString(),
        Sat: item.Sat.toString(),
        DayType: item?.DayType,
        bookingcutoff: item.bookingcutoff,
        reportingcutoff: item?.reportingcutoff,
        testprocessingday: item?.testprocessingday,
        IPDDayType: item?.IPDDayType,
        IPDDay: item?.IPDDay,
        OPDDayType: item?.OPDDayType,
        OPDDay: item?.OPDDay,
        STATDay: item?.STATDay,
        STATDayType: item?.STATDayType,
        CentreID: item.centreId.toString(),
        IPDsameasopd: item?.IPDsameasopd ? "1" : "0",
        Emergencysameasopd: item?.Emergencysameasopd ? "1" : "0",
      };
    });

    const check = payload.some(
      (item) =>
        item.Sun == "0" &&
        item.Mon == "0" &&
        item.Tue == "0" &&
        item.Wed == "0" &&
        item.Thu == "0" &&
        item.Fri == "0" &&
        item.Sat == "0",
    );

    if (data?.length > 0) {
      if (!check) {
        setLoad({ ...load, saveLoad: true });

        axiosInstance
          .post("ManageDeliveryDays/SaveInvDeliveryDays", payload)
          .then((res) => {
            toast.success(res.data.message);
            setLoad({ ...load, saveLoad: false });
            fetch();
            setTableData([]);
            setState({
              ...state,
              allCentres: false,
            });
            document.getElementById("DaysInput").value = "";
          })
          .catch((err) => {
            setLoad({ ...load, saveLoad: false });
            console.log(err);
          });
      } else {
        toast.error("Please Tick Any Week Day In Selected Rows");
      }
    } else {
      toast.error("Please Select Any One Row");
    }
  };
  const addRow = (data, index) => {
    const allData = [...tableData];
    allData.splice(index + 1, 0, {
      ...data,
      IsDelete: true,
      ExcludeHoliday: 0,
      isChecked: 0,
      Sun: "0",
      Mon: "0",
      Tue: "0",
      Wed: "0",
      Thu: "0",
      Fri: "0",
      Sat: "0",
      Hours: "",
      CutOffTime: "14:00:00",
    });
    setTableData(allData);
  };
  const handleRemove = (index) => {
    const updatedData = [...tableData];
    updatedData.splice(index, 1);
    setTableData(updatedData);
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (state?.searchText !== "") {
        fetch();
      }
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [state?.searchText]);

  console.log(tableData);
  const toggleWeekDayForAll = (day) => {
    const updatedData = tableData.map((data) => {
      data[day] = data[day] == "1" ? "0" : "1";
      return data;
    });
    setTableData(updatedData);
  };

  const checkDay = (day) => {
    const check = tableData?.filter((ele) => ele[day] == "0");
    if (check?.length == 0 && tableData?.length > 0) return true;
    else return false;
  };

  const getCentreProcessingLab = () => {
    axiosInstance
      .get("Centre/getGlobalCentres")
      .then((res) => {
        let data = res.data.message;
        let CentreLab = data.map((ele) => {
          return {
            value: ele.CentreID,
            label: ele.Centre,
          };
        });
        setCentreID(CentreLab);
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    getCentreProcessingLab();
    getDepartment(setDepartment);
  }, []);

  const handleSearchSelectChange = (label, value) => {
    setState({ ...state, [label]: value?.value.toString() });
  };
  console.log({ tableData });
  return (
    <>
      <Accordion
        name={t("Manage Delivery Days")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row pt-2 pl-2 pr-2 pb-2">
          <div className="col-sm-2">
            <ReactSelect
              dynamicOptions={[
                { label: "Select Centre", value: "" },
                ...(CentreID ?? []),
              ]}
              name="centreId"
              lable={t("Select Centre")}
              id="centreId"
              removeIsClearable={true}
              placeholderName={t("Select Centre")}
              value={state?.centreId}
              className="required-fields"
              onChange={handleSearchSelectChange}
            />
          </div>
          <div className="col-sm-2 ">
            <SelectBox
              options={[
                { label: "Select Department", value: "" },
                ...Department,
              ]}
              name="departmentId"
              id="departmentId"
              onChange={handleSelectChange}
              selectedValue={state?.departmentId}
              placeholder=""
              lable={t("Department")}
            />
          </div>
          <div className="col-sm-2">
            <Input
              type="text"
              name="searchText"
              id="searchText"
              value={state?.searchText}
              onChange={handleSelectChange}
              placeholder=""
              lable={t("Search Test")}
            />
          </div>
          <div className="col-sm-1">
            <Input
              type="text"
              name="TestCode"
              id="TestCode"
              value={state?.TestCode}
              onChange={handleSelectChange}
              placeholder=""
              lable={t("TestCode")}
            />
          </div>
          <div className="col-sm-1">
            {load.searchLoad ? (
              <Loading />
            ) : (
              // <button
              //   className="btn btn-block btn-primary btn-sm"
              //   onClick={() => fetch("")}
              // >
              //   {t("Search")}
              // </button>

              <SearchButton
                onClick={() => fetch("")}
                text={"Search"}
              />
            )}
          </div>
        </div>
        {tableData.length > 0 && (
          <div
            style={{
              maxHeight: "410px",
              overflowY: "auto",
            }}
          >
            {load?.searchLoad ? (
              <Loading />
            ) : (
              <>
                <Tables>
                  <thead
                    className="cf text-center"
                    style={{
                      position: "sticky",
                    }}
                  >
                    <tr>
                      <th className="text-center">{t("S.No")}</th>
                      <th className="text-center">{t("Test Code")}</th>
                      <th className="text-center" style={{ width: "15%" }}>
                        {t("Test Name")}
                      </th>
                      <th className="text-center">
                        {t("Booking Cutoff")}
                        <br></br>
                        <select
                          className="inputFont input-form-control"
                          name="bookingcutoff"
                          onChange={handleChangeMain}
                        >
                          {BookingCutoffOptions.map((item, ind) => (
                            <option value={item.value} key={ind}>
                              {item.label}
                            </option>
                          ))}
                        </select>
                      </th>
                      <th>
                        {t("Day Type")}
                        <br></br>
                        <select
                          className="inputFont input-form-control"
                          name="DayType"
                          onChange={handleChangeMain}
                        >
                          {DayType.map((item, ind) => (
                            <option value={item.value} key={ind}>
                              {item.label}
                            </option>
                          ))}
                        </select>
                      </th>
                      <th className="text-center">
                        {t("Processing days/Hours(OPD)")}
                        <br></br>
                        <Input
                          id="testprocessingday"
                          type="number"
                          name="testprocessingday"
                          max={2}
                          onChange={(e) => {
                            handleChangeMain(e);
                          }}
                          className="form-control ui-autocomplete-input input-sm"
                          disabled={tableData.length == 0}
                        />
                      </th>
                      <th className="text-center" style={{ width: "20%" }}>
                        {t("Delivery")}
                        <br />
                        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                          (day) => (
                            <>
                              <button
                                className={checkDay(day) && "checkedWeekday"}
                                type="checkbox"
                                style={{
                                  color: "white",
                                  border: "none",
                                  width: "auto",
                                  height: "auto",
                                }}
                                key={day}
                                onClick={() => toggleWeekDayForAll(day)}
                              >
                                <span>{t(day)}</span>
                              </button>
                              &nbsp;
                            </>
                          ),
                        )}
                      </th>

                      <th className="text-center">
                        {t("ReportingCutoff")}
                        <br></br>
                        <select
                          className="inputFont input-form-control"
                          name="reportingcutoff"
                          onChange={handleChangeMain}
                          style={{ height: "100px" }}
                        >
                          {ReportingCutoffOptions.map((item, ind) => (
                            <option value={item.value} key={ind}>
                              {item.label}
                            </option>
                          ))}
                        </select>
                      </th>
                      <th
                        style={{ width: "12%" }}
                        className="text-center d-none"
                      >
                        {t("OPD")}
                        <br></br>
                        <div className="d-flex">
                          <select
                            className="inputFont input-form-control mr-1"
                            name="OPDDayType"
                            onChange={handleChangeMain}
                          >
                            {OPDDayType.map((item, ind) => (
                              <option value={item.value} key={ind}>
                                {item.label}
                              </option>
                            ))}
                          </select>
                          <Input
                            id="OPDDay"
                            type="number"
                            name="OPDDay"
                            max={2}
                            onChange={(e) => {
                              handleChangeMain(e);
                            }}
                            className="form-control ui-autocomplete-input input-sm"
                            disabled={tableData.length == 0}
                          />
                        </div>
                      </th>
                      <th style={{ width: "12%" }} className="text-center d-none">
                        {t("IPD")}
                        <br></br>
                        <div className="d-flex">
                          <select
                            className="inputFont input-form-control mr-1"
                            name="IPDDayType"
                            onChange={handleChangeMain}
                          >
                            {IPDDayType.map((item, ind) => (
                              <option value={item.value} key={ind}>
                                {item.label}
                              </option>
                            ))}
                          </select>
                          <Input
                            id="IPDDay"
                            type="number"
                            name="IPDDay"
                            max={2}
                            onChange={(e) => {
                              handleChangeMain(e);
                            }}
                            className="form-control ui-autocomplete-input input-sm"
                            disabled={tableData.length == 0}
                          />
                        </div>
                      </th>
                      <th
                        className="text-center d-none"
                        style={{ textAlign: "center" }}
                      >
                        {t("Same as OPD")}
                        <br></br>
                        <input
                          type="checkbox"
                          className="mt-1 ml-1"
                          checked={
                            tableData?.length > 0
                              ? isChecked(
                                  "IPDsameasopd",
                                  tableData,
                                  true,
                                ).includes(false)
                                ? false
                                : true
                              : false
                          }
                          name="IPDsameasopd"
                          onChange={(e) => handleChangeMain(e)}
                        />
                      </th>
                      <th style={{ width: "12%" }} className="text-center d-none">
                        {t("Emergency")}
                        <br></br>
                        <div className="d-flex">
                          <select
                            className="inputFont input-form-control mr-1"
                            name="STATDayType"
                            onChange={handleChangeMain}
                          >
                            {EmergencyDayType.map((item, ind) => (
                              <option value={item.value} key={ind}>
                                {item.label}
                              </option>
                            ))}
                          </select>
                          <Input
                            id="STATDay"
                            type="number"
                            name="STATDay"
                            max={2}
                            onChange={(e) => {
                              handleChangeMain(e);
                            }}
                            className="form-control ui-autocomplete-input input-sm"
                            disabled={tableData.length == 0}
                          />
                        </div>
                      </th>
                      <th
                        className="text-center d-none"
                        style={{ textAlign: "center" }}
                      >
                        {t("Same as OPD")}
                        <br></br>
                        <input
                          type="checkbox"
                          className="mt-1 ml-1"
                          checked={
                            tableData?.length > 0
                              ? isChecked(
                                  "Emergencysameasopd",
                                  tableData,
                                  true,
                                ).includes(false)
                                ? false
                                : true
                              : false
                          }
                          name="Emergencysameasopd"
                          onChange={(e) => handleChangeMain(e)}
                        />
                      </th>
                      <th
                        className="text-center"
                        style={{ textAlign: "center" }}
                      >
                        <input
                          type="checkbox"
                          checked={
                            tableData?.length > 0
                              ? isChecked(
                                  "isChecked",
                                  tableData,
                                  true,
                                ).includes(false)
                                ? false
                                : true
                              : false
                          }
                          name="isChecked"
                          onChange={(e) => handleChangeMain(e)}
                        />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((data, index) => (
                      <tr
                        key={index}
                        style={{
                          background:
                            data.rowColor === "orange" ? "orange" : "white",
                        }}
                      >
                        <td className="text-center" data-title={t("S.No")}>
                          {index + 1}&nbsp;
                        </td>
                            <td className="text-center" data-title={t("Test Code")}>
                              {data?.testcode}&nbsp;
                            </td>
                        <td
                          style={{
                            wordWrap: "break-word",
                            whiteSpace: "normal",
                          }}
                          data-title={t("Test Name")}
                        >
                          {data?.InvName}&nbsp;
                        </td>
                        <td
                          className="text-center"
                          data-title={t("Booking Cutoff")}
                        >
                          <select
                            className="inputFont input-form-control"
                            name="bookingcutoff"
                            onChange={(e) => handleChangeMain(e, index)}
                            value={data?.bookingcutoff}
                          >
                            {BookingCutoffOptions.map((item, ind) => (
                              <option value={item.value} key={ind}>
                                {item.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td data-title={t("Day Type")} className="">
                          <select
                            className="inputFont input-form-control"
                            name="DayType"
                            onChange={(e) => handleChangeMain(e, index)}
                            value={data?.DayType}
                          >
                            {DayType.map((item, ind) => (
                              <option value={item.value} key={ind}>
                                {item.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td
                          className="text-center"
                          data-title="Processing days/Hours(OPD)"
                        >
                          <Input
                            type="number"
                            name="testprocessingday"
                            value={data?.testprocessingday}
                            onChange={(e) => handleChangeMain(e, index)}
                          />
                        </td>
                        <td className="text-center" data-title={t("Delivery")}>
                          <div
                            className="weekDays-selector"
                            data-title="Delivery"
                          >
                            <button
                              type="button"
                              name="Mon"
                              className={data?.Mon == "1" && "checkedWeekday"}
                              onClick={() =>
                                handleWeekDays("Mon", data?.Mon, index)
                              }
                              style={{ color: "white" }}
                            >
                              <span>{t("Mon")}</span>
                            </button>
                            &nbsp;
                            <button
                              type="button"
                              name="Tue"
                              className={data?.Tue == "1" && "checkedWeekday"}
                              onClick={() =>
                                handleWeekDays("Tue", data?.Tue, index)
                              }
                              style={{ color: "white" }}
                            >
                              <span>{t("Tue")}</span>
                            </button>
                            &nbsp;
                            <button
                              type="button"
                              name="Wed"
                              className={data?.Wed == "1" && "checkedWeekday"}
                              onClick={() =>
                                handleWeekDays("Wed", data?.Wed, index)
                              }
                              style={{ color: "white" }}
                            >
                              <span>{t("Wed")}</span>
                            </button>
                            &nbsp;
                            <button
                              type="checkbox"
                              name="Thu"
                              className={data?.Thu == "1" && "checkedWeekday"}
                              onClick={() =>
                                handleWeekDays("Thu", data?.Thu, index)
                              }
                              style={{ color: "white" }}
                            >
                              <span>{t("Thu")}</span>
                            </button>
                            &nbsp;
                            <button
                              type="button"
                              name="Fri"
                              className={data?.Fri == "1" && "checkedWeekday"}
                              onClick={() =>
                                handleWeekDays("Fri", data?.Fri, index)
                              }
                              style={{ color: "white" }}
                            >
                              <span>{t("Fri")}</span>
                            </button>
                            &nbsp;
                            <button
                              type="button"
                              name="Sat"
                              className={data?.Sat == "1" && "checkedWeekday"}
                              onClick={() =>
                                handleWeekDays("Sat", data?.Sat, index)
                              }
                              style={{ color: "white" }}
                            >
                              <span>{t("Sat")}</span>
                            </button>
                            &nbsp;
                            <button
                              type="button"
                              name="Sun"
                              id="weekday-sun"
                              checked="checked"
                              className={data?.Sun == "1" && "checkedWeekday"}
                              onClick={() =>
                                handleWeekDays("Sun", data?.Sun, index)
                              }
                              style={{ color: "white" }}
                            >
                              <span>{t("Sun")}</span>
                            </button>
                          </div>
                        </td>
                        <td
                          className="text-center"
                          data-title={t("Reporting Cutoff")}
                        >
                          <select
                            className="inputFont input-form-control"
                            name="reportingcutoff"
                            onChange={(e) => handleChangeMain(e, index)}
                            value={data?.reportingcutoff}
                          >
                            {ReportingCutoffOptions.map((item, ind) => (
                              <option value={item.value} key={ind}>
                                {item.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td
                          className="text-center d-none"
                          data-title={t("OPD")}
                        >
                          <div className="d-flex">
                            <select
                              className="inputFont input-form-control mr-1"
                              name="OPDDayType"
                              onChange={(e) => handleChangeMain(e, index)}
                              value={data?.OPDDayType}
                            >
                              {OPDDayType.map((item, ind) => (
                                <option value={item.value} key={ind}>
                                  {item.label}
                                </option>
                              ))}
                            </select>
                            <Input
                              type="number"
                              name="OPDDay"
                              value={data?.OPDDay}
                              onChange={(e) => handleChangeMain(e, index)}
                            />
                          </div>
                        </td>
                        <td data-title={t("IPD")} className="d-none">
                          <div className="d-none">
                            <select
                              className="inputFont input-form-control mr-1"
                              name="IPDDayType"
                              onChange={(e) => handleChangeMain(e, index)}
                              value={data?.IPDDayType}
                            >
                              {IPDDayType.map((item, ind) => (
                                <option value={item.value} key={ind}>
                                  {item.label}
                                </option>
                              ))}
                            </select>
                            <Input
                              type="number"
                              name="IPDDay"
                              value={data?.IPDDay}
                              onChange={(e) => handleChangeMain(e, index)}
                            />
                          </div>
                        </td>
                        <td
                          className="text-center d-none"
                          data-title={t("IPDsameasopd")}
                          style={{ textAlign: "center" }}
                        >
                          <input
                            type="checkbox"
                            checked={data?.IPDsameasopd}
                            name="IPDsameasopd"
                            onChange={(e) => handleChangeMain(e, index)}
                          />
                        </td>
                        <td className="text-center d-none" data-title={t("Emergency")}>
                          <div className="d-flex">
                            <select
                              className="inputFont input-form-control mr-1"
                              name="STATDayType"
                              onChange={(e) => handleChangeMain(e, index)}
                              value={data?.STATDayType}
                            >
                              {EmergencyDayType.map((item, ind) => (
                                <option value={item.value} key={ind}>
                                  {item.label}
                                </option>
                              ))}
                            </select>
                            <Input
                              type="number"
                              name="STATDay"
                              value={data?.STATDay}
                              onChange={(e) => handleChangeMain(e, index)}
                            />
                          </div>
                        </td>
                        <td
                          className="text-center d-none"
                          data-title={t("Emergencysameasopd")}
                          style={{ textAlign: "center" }}
                        >
                          <input
                            type="checkbox"
                            checked={data?.Emergencysameasopd}
                            name="Emergencysameasopd"
                            onChange={(e) => handleChangeMain(e, index)}
                          />
                        </td>
                        {/* <td className="text-center" data-title={t("Remove")}>
                          {data?.IsDelete ? (
                            <button
                              type="button"
                              className="btn btn-sm btn-danger"
                              onClick={() => handleRemove(index)}
                              style={{
                                backgroundColor: "red",
                                color: "white",
                                border: "none",
                                padding: "2px 7px",
                                fontSize: "12px",
                                cursor: "pointer",
                                borderRadius: "4px",
                              }}
                            >
                              X
                            </button>
                          ) : (
                            <>&nbsp;</>
                          )}
                        </td>{" "} */}
                        <td
                          className="text-center"
                          data-title={t("isChecked")}
                          style={{ textAlign: "center" }}
                        >
                          <input
                            type="checkbox"
                            checked={data?.isChecked}
                            name="isChecked"
                            onChange={(e) => handleChangeMain(e, index)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Tables>
              </>
            )}
          </div>
        )}
        {tableData?.length > 0 && (
          <div className="row p-2">
            <div className="col-sm-1">
              {load?.saveLoad ? (
                <Loading />
              ) : (
                // <button
                //   className="btn btn-block btn-success btn-sm"
                //   onClick={handleSubmit}
                // >
                //   {t("Save")}
                // </button>
                <SaveButton 
                  onClick={handleSubmit}
                  text={"Save"}
                />
              )}
            </div>
          </div>
        )}
      </Accordion>
    </>
  );
};

export default ManageDeliveryDays;
