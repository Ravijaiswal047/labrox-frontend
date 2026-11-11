import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { TimeSlotValidation } from "../../utils/Schema";
import moment from "moment";
import { axiosInstance } from "../../utils/axiosInstance";
import { bindDepartment } from "../../utils/NetworkApi/commonApi";
import { SelectBox } from "../../components/formComponent/SelectBox";
import { NoofRecord } from "../../utils/Constants";
import Loading from "../../components/loader/Loading";
import Tables from "../../components/UI/customTable";
import Accordion from "@app/components/UI/Accordion";
const InvestigationTimeSlotMaster = () => {
  const [load, setLoad] = useState(false);
  const [department, setDepartment] = useState([]);
  const [payloadDep, setPayloadDep] = useState({
    DepartmentId: "",
    Department: "",
  });
  const [payload, setPayload] = useState({
    ModalityId: "",
    Mon: 0,
    Tue: 0,
    Wed: 0,
    Thu: 0,
    Fri: 0,
    Sat: 0,
    Sun: 0,
    ShiftId: "",
    ShiftName: "",
    CentreId: "",
    DurationforPatient: "",
    StartTime: "00:00",
    EndTime: "12:00",
    CentreName: "",
    ModalityName: "",
  });
  const [modality, setModality] = useState([]);
  const [shift, setShift] = useState([]);
  const [centre, setCentre] = useState([]);
  const [addData, setAddData] = useState([]);
  const [err, setErr] = useState("");
  const { t } = useTranslation();

  const handleDepartmentChange = (e) => {
    const { name, value, selectedIndex } = e?.target;
    const label = e?.target?.children?.[selectedIndex]?.text;

    setPayloadDep({
      [name]: value,
      Department: label,
    });
    setPayload({
      ModalityId: "",
      Mon: 0,
      Tue: 0,
      Wed: 0,
      Thu: 0,
      Fri: 0,
      Sat: 0,
      Sun: 0,
      ShiftName: "",
      ShiftId: "",
      CentreId: "",
      DurationforPatient: "",
      StartTime: "00:00",
      EndTime: "12:00",
      CentreName: "",
      ModalityName: "",
    });
    setAddData([]);
    handleSearch(value, "");
    BindModality(value);
  };
  const handleChange = (e) => {
    const { name, value, checked, type, selectedIndex } = e?.target;
    const label = e?.target?.children?.[selectedIndex]?.text;
    if (name === "EndTime") {
      if (value > payload?.StartTime) {
        setPayload({ ...payload, [name]: value });
      }
    } else if (name === "StartTime") {
      if (value < payload?.EndTime) {
        setPayload({ ...payload, [name]: value });
      }
    } else if (name === "ShiftId") {
      setPayload({
        ...payload,
        [name]: value,
        ShiftName: label,
      });
    } else if (name === "CentreId") {
      setPayload({
        ...payload,
        [name]: value,
        CentreName: label,
      });
    } else if (name === "ModalityId") {
      setPayload({
        ...payload,
        [name]: value,
        ModalityName: label,
      });
      setAddData([]);
      handleSearch(payloadDep?.DepartmentId, value);
    } else {
      setPayload({
        ...payload,
        [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
      });
    }
  };
  function convertTo12HourFormat(time) {
    const [hours, minutes] = time.split(":").map(Number);
    const period = hours < 12 ? "AM" : "PM";
    let hours12 = hours % 12;
    hours12 = hours12 === 0 ? 12 : hours12;
    const formattedTime = `${hours12}:${minutes
      .toString()
      .padStart(2, "0")} ${period}`;
    return formattedTime;
  }
  console.log(payload, addData);
  const handleAdd = (key) => {
    const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const invalidDays = daysOfWeek.filter((day) => payload[day] === 1);
    console.log(invalidDays);

    const generatedError = TimeSlotValidation(payload);
    if (generatedError == "" || (key === "Save" && addData?.length > 0)) {
      if (invalidDays?.length > 0 || (key === "Save" && addData?.length > 0)) {
        const daysWithData = [];

        for (const [key, value] of Object.entries(payload)) {
          if (
            ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].includes(key) &&
            value === 1
          ) {
            const newObj = { ...payload, Day: key };
            daysWithData.push(newObj);
          }
        }
        console.log(daysWithData);
        const TimeFormatedData = daysWithData?.map((ele) => {
          return {
            ...ele,
            Start: convertTo12HourFormat(ele?.StartTime),
            End: convertTo12HourFormat(ele?.EndTime),
            StartTime:
              moment(new Date()).format("DD/MMM/YYYY") + " " + ele?.StartTime,
            EndTime:
              moment(new Date()).format("DD/MMM/YYYY") + " " + ele?.EndTime,
            DepartmentId: payloadDep?.DepartmentId,
            Department: payloadDep?.Department,
            AvgTime: ele?.DurationforPatient.toString(),
          };
        });
        console.log(TimeFormatedData);
        setAddData([...addData, ...TimeFormatedData]);
        if (key === "Add") {
          setPayload({
            ModalityId: "",
            Mon: 0,
            Tue: 0,
            Wed: 0,
            Thu: 0,
            Fri: 0,
            Sat: 0,
            Sun: 0,
            ShiftName: "",
            ShiftId: "",
            CentreId: "",
            DurationforPatient: "",
            StartTime: "00:00",
            EndTime: "12:00",
            CentreName: "",
            ModalityName: "",
          });
          setErr("");
        } else {
          setLoad(true);
          axiosInstance
            .post("ModalityMaster/SaveRadiologySchedule", {
              SaveData: addData?.length > 0 ? addData : TimeFormatedData,
            })
            .then((res) => {
              setLoad(false);
              toast.success(res?.data?.message);
              setAddData([]);
              setPayload({
                ModalityId: "",
                Mon: 0,
                Tue: 0,
                Wed: 0,
                Thu: 0,
                Fri: 0,
                Sat: 0,
                Sun: 0,
                ShiftName: "",
                ShiftId: "",
                CentreId: "",
                DurationforPatient: "",
                StartTime: "00:00",
                EndTime: "12:00",
                CentreName: "",
                ModalityName: "",
              });
              handleSearch(payloadDep?.DepartmentId, "");
              setErr("");
            })
            .catch((err) => {
              setLoad(false);
              toast.error(
                err?.response?.data?.message ?? "Something Went Wrong",
              );
            });
        }
      } else {
        toast.error("Check Atleast One Day");
      }
    } else {
      setErr(generatedError);
    }
  };
  const handleRemove = (index) => {
    const SlicedData = [...addData];
    SlicedData.splice(index, 1);
    setAddData(SlicedData);
  };
  const handleSearch = (DeptId, ModalityId) => {
    axiosInstance
      .post("ModalityMaster/SearchInvestigationSlotSchedule", {
        DepartmentId: DeptId,
        ModalityId: ModalityId,
      })
      .then((res) => {
        const data = res?.data?.message?.map((ele) => {
          return {
            ...ele,
            ModalityId: ele?.ModalityID,
            ShiftId: ele?.Shift,
            DepartmentId: ele?.SubCategory_ID,
            CentreName: ele?.Centre,
            Start: convertTo12HourFormat(ele?.StartTime),
            End: convertTo12HourFormat(ele?.EndTime),
            Day: ele?.DAY,
            CentreId: ele?.CentreID,
            AvgTime: ele?.DurationforPatient.toString(),
            StartTime:
              moment(new Date()).format("DD/MMM/YYYY") + " " + ele?.StartTime,
            EndTime:
              moment(new Date()).format("DD/MMM/YYYY") + " " + ele?.EndTime,
            Department: ele?.SubCategoryName,
            DurationforPatient: ele?.DurationforPatient.toString(),
          };
        });
        ModalityId != ""
          ? setAddData([...data])
          : setAddData([...addData, ...data]);
      })
      .catch((err) => {
        console.log(err?.response?.data?.message);
      });
  };
  useEffect(() => {
    bindDepartment(setDepartment);
    BindCentre();
    BindModality("");
    BindShift();
    handleSearch("", "");
  }, []);
  const BindModality = (value) => {
    axiosInstance
      .post("ModalityMaster/BindModality", {
        DepartmentId: value,
      })
      .then((res) => {
        let data = res.data.message;
        let responce = data.map((ele) => {
          return {
            value: ele.Id,
            label: ele.NAME,
          };
        });
        setModality(responce);
      })
      .catch((err) => {
        setModality([]);
        console.log(err?.res?.data ? err?.res?.data : "Something Went Wrong");
      });
  };
  const BindShift = () => {
    axiosInstance
      .get("ModalityMaster/BindShift")
      .then((res) => {
        let data = res.data.message;
        let responce = data.map((ele) => {
          return {
            value: ele.Id,
            label: ele.ShiftName,
          };
        });
        setShift(responce);
      })
      .catch((err) =>
        console.log(err?.res?.data ? err?.res?.data : "Something Went Wrong"),
      );
  };
  const BindCentre = () => {
    axiosInstance
      .get("ModalityMaster/BindCentre")
      .then((res) => {
        let data = res.data.message;
        let responce = data.map((ele) => {
          return {
            value: ele?.CentreID,
            label: ele?.Centre,
          };
        });
        setCentre(responce);
      })
      .catch((err) =>
        console.log(err?.res?.data ? err?.res?.data : "Something Went Wrong"),
      );
  };

  return (
    <>
      <Accordion
        name={t("Investigation Time Slot Master")}
        isBreadcrumb={true}
        defaultValue={true}
      >
        <div className="row px-2 mt-2 mb-1">
          <div className="col-sm-12 col-md-2">
            <SelectBox
              options={[
                { label: "Select Department", value: "" },
                ...department,
              ]}
              className="required-fields"
              lable="Department"
              id="Department"
              selectedValue={payloadDep?.DepartmentId}
              name="DepartmentId"
              onChange={handleDepartmentChange}
            />
          </div>
          <div className="col-md-1">
            <button
              type="button"
              className="btn btn-block btn-danger btn-sm"
              onClick={() => {
                setPayloadDep({
                  DepartmentId: "",
                  Department: "",
                });
                setPayload({
                  ModalityId: "",
                  Mon: 0,
                  Tue: 0,
                  Wed: 0,
                  Thu: 0,
                  Fri: 0,
                  Sat: 0,
                  Sun: 0,
                  ShiftId: "",
                  ShiftName: "",
                  CentreId: "",
                  DurationforPatient: "",
                  StartTime: "00:00",
                  EndTime: "12:00",
                  CentreName: "",
                  ModalityName: "",
                });
                setAddData([]);
              }}
            >
              {t("Reset")}
            </button>
          </div>
        </div>
      </Accordion>

      {payloadDep?.DepartmentId !== "" && (
        <Accordion title={t("Department Schedule Details")} defaultValue={true}>
          <>
            <div className="row  px-2 mt-3 mb-1">
              <div className="col-md-2 control-label">
                <SelectBox
                  options={[{ label: "Select", value: "" }, ...modality]}
                  lable="Modality Name"
                  id="Modality Name"
                  name="ModalityId"
                  className="required-fields"
                  selectedValue={payload?.ModalityId}
                  onChange={handleChange}
                />
                {payload?.ModalityId === "" && (
                  <span className="error-message">{err?.ModalityId}</span>
                )}
              </div>

              <div className="col-md-4">
                <span className="col-md-1">
                  <input
                    name="Mon"
                    type="checkbox"
                    id="Mon"
                    checked={payload?.Mon}
                    onChange={handleChange}
                  />

                  <label htmlFor="Mon" className="control-label">
                    &nbsp; {t("Mon")}
                  </label>
                </span>
                <span className="col-md-1">
                  <input
                    name="Tue"
                    id="Tue"
                    type="checkbox"
                    checked={payload?.Tue}
                    onChange={handleChange}
                  />
                  <label htmlFor="Tue" className="control-label">
                    &nbsp; {t("Tue")}
                  </label>
                </span>
                <span className="col-md-1">
                  <input
                    name="Wed"
                    id="Wed"
                    type="checkbox"
                    checked={payload?.Wed}
                    onChange={handleChange}
                  />
                  <label htmlFor="Wed" className="control-label">
                    &nbsp; {t("Wed")}
                  </label>
                </span>
                <span className="col-md-1">
                  <input
                    name="Thu"
                    type="checkbox"
                    id="Thu"
                    checked={payload?.Thu}
                    onChange={handleChange}
                  />
                  <label htmlFor="Thu" className="control-label">
                    &nbsp; {t("Thu")}
                  </label>
                </span>
                <span className="col-md-1">
                  <input
                    name="Fri"
                    type="checkbox"
                    id="Fri"
                    checked={payload?.Fri}
                    onChange={handleChange}
                  />
                  <label htmlFor="Fri" className="control-label">
                    &nbsp; {t("Fri")}
                  </label>
                </span>
                <span className="col-md-1">
                  <input
                    name="Sat"
                    id="Sat"
                    type="checkbox"
                    checked={payload?.Sat}
                    onChange={handleChange}
                  />
                  <label htmlFor="IsActive" className="control-label">
                    &nbsp; {t("Sat")}
                  </label>
                </span>
                <span className="col-md-1">
                  <input
                    name="Sun"
                    type="checkbox"
                    id="Sun"
                    checked={payload?.Sun}
                    onChange={handleChange}
                  />
                  <label htmlFor="Sun" className="control-label">
                    &nbsp; {t("Sun")}
                  </label>
                </span>
              </div>
              <div className="col-md-2 control-label">
                <SelectBox
                  lable="Shift"
                  id="Shift"
                  options={[{ label: "Select", value: "" }, ...shift]}
                  className="required-fields"
                  name="ShiftId"
                  selectedValue={payload?.ShiftId}
                  onChange={handleChange}
                />
                {payload?.ShiftId === "" && (
                  <span className="error-message">{err?.ShiftId}</span>
                )}
              </div>

              <div className="col-md-2 control-label">
                <SelectBox
                  lable="Centre"
                  id="Centre"
                  options={[{ label: "Select", value: "" }, ...centre]}
                  name="CentreId"
                  className="required-fields"
                  selectedValue={payload?.CentreId}
                  onChange={handleChange}
                />
                {payload?.CentreId === "" && (
                  <span className="error-message">{err?.CentreId}</span>
                )}
              </div>
              <div className="col-md-2">
                <SelectBox
                  lable="Duration for Patient"
                  id="Duration for Patient"
                  options={[{ label: "Select", value: "" }, ...NoofRecord]}
                  name="DurationforPatient"
                  selectedValue={payload?.DurationforPatient}
                  onChange={handleChange}
                  className="required-fields"
                />
                {payload?.DurationforPatient === "" && (
                  <span className="error-message">
                    {err?.DurationforPatient}
                  </span>
                )}
              </div>
            </div>
            <div className="row  px-2 mt-1 mb-1">
              <label className="col-md-1 requiredlabel" htmlFor="Modality">
                {t("Pick Start Time")} :
              </label>
              <div className="col-md-2">
                <input
                  type="time"
                  className="form-control ui-autocomplete-input input-sm"
                  name="StartTime"
                  value={payload?.StartTime}
                  onChange={handleChange}
                />
              </div>
              <label
                className="col-md-1 requiredlabel"
                htmlFor="Modality"
                style={{ textAlign: "end" }}
              >
                {t("Pick End Time")} :
              </label>
              <div className="col-md-2">
                <input
                  type="time"
                  name="EndTime"
                  className="form-control ui-autocomplete-input input-sm"
                  value={payload?.EndTime}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div
              className="row px-2 mt-2 mb-1"
              style={{ display: "flex", justifyContent: "center" }}
            >
              <div className="col-md-1">
                <button
                  type="button"
                  className={"btn btn-block btn-primary btn-sm"}
                  onClick={() => handleAdd("Add")}
                >
                  {t("Add Timings")}
                </button>
              </div>
            </div>
            {addData?.length > 0 && (
              <div>
                <div
                  style={{
                    maxHeight: "300px",
                    overflowY: "auto",
                  }}
                >
                  <Tables
                    className="table table-bordered table-hover table-striped tbRecord"
                    cellPadding="{0}"
                    cellSpacing="{0}"
                  >
                    <thead
                      className="cf text-center"
                      style={{
                        position: "sticky",
                        zIndex: 99,
                        top: 0,
                      }}
                    >
                      <tr>
                        <th className="text-center">{t("#")}</th>
                        <th className="text-center">{t("Modality Name")}</th>
                        <th className="text-center">{t("Centre")}</th>
                        <th className="text-center">{t("Days")}</th>
                        <th className="text-center">{t("Start Time")}</th>{" "}
                        <th className="text-center">{t("End Time")}</th>
                        <th className="text-center">
                          {t("Duration For Patient")}
                        </th>{" "}
                        <th className="text-center">{t("Shift")}</th>
                        <th className="text-center">{t("Type")}</th>
                        <th className="text-center">{t("Remove")}</th>
                      </tr>
                    </thead>

                    <tbody>
                      {addData?.map((ele, index) => (
                        <>
                          <tr>
                            <td data-title="#" className="text-center">
                              {index + 1}
                            </td>
                            <td
                              data-title="Modality Name"
                              className="text-center"
                            >
                              {ele?.ModalityName}
                            </td>
                            <td data-title="Centre" className="text-center">
                              {ele?.CentreName}
                            </td>
                            <td data-title="Days" className="text-center">
                              {ele?.Day}
                            </td>
                            <td data-title="Start Time" className="text-center">
                              {ele?.Start}
                            </td>
                            <td data-title="End Time" className="text-center">
                              {ele?.End}
                            </td>

                            <td
                              data-title="Duration For Patient"
                              className="text-center"
                            >
                              {ele?.DurationforPatient}
                            </td>
                            <td data-title="Shift" className="text-center">
                              {ele?.ShiftName}
                            </td>
                            <td data-title="Shift" className="text-center">
                              {ele?.ID
                                ? "Already Saved Data"
                                : "Newly Added Data"}
                            </td>
                            <td data-title="Remove" className="text-center">
                              <button
                                className="btn btn-danger btn-sm w-5"
                                onClick={() => handleRemove(index)}
                              >
                                X
                              </button>
                            </td>
                          </tr>
                        </>
                      ))}
                    </tbody>
                  </Tables>
                </div>
              </div>
            )}

            <div
              className="row mt-2 mb-1 px-1"
              style={{ display: "flex", justifyContent: "center" }}
            >
              <div className="col-md-2">
                {" "}
                {load ? (
                  <Loading />
                ) : (
                  <button
                    type="button"
                    className={"btn btn-block btn-success btn-sm"}
                    onClick={() => handleAdd("Save")}
                  >
                    {t("Save Radio Schedule")}
                  </button>
                )}
              </div>
            </div>
          </>
        </Accordion>
      )}
    </>
  );
};

export default InvestigationTimeSlotMaster;
