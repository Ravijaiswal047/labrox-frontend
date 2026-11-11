import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { axiosInstance } from "../../../utils/axiosInstance";
import ReactSelect from "../../../components/formComponent/ReactSelect";
import Accordion from "../../../components/UI/Accordion";
import { Button } from "react-bootstrap";
import {
  getCallHeaders,
  getDaysInMonth,
  getMonths,
  getYears,
} from "./utility/utilities";
import Heading from "../../../components/UI/Heading";
import Tables from "../../../components/UI/customTable";
import TravelScheduleModal from "./TravelScheduleModal";
import Loading from "../../../components/loader/Loading";
import { toast } from "react-toastify";
import { useLocalStorage } from "../../../utils/hooks/useLocalStorage";

const TravelPlanSchedular = () => {
  const localData = useLocalStorage("userData", "get");
  const userId = localData?.EmployeeID;
  console.log(userId, "fsvfhads fjvjhf")
  const { t } = useTranslation();
  const [load, setLoad] = useState(false);
  const [BindFor, setBindFor] = useState([]);

  const [schdule, setSchedule] = useState({});

  const [dragData, setDragData] = useState(null);
  const [travelSummary, setTravelSummary] = useState([]);

  const [show, setShow] = useState(false);

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const [FormData, setFormData] = useState({
    employeeId: "",
    year: currentYear,
    month: currentMonth,
  });

  const [TableData, setTableData] = useState([]);

  const [ModalTableData, setModalTableData] = useState([]);
  const [calendarRows, setCalendarRows] = useState([]);

  const [isSubmitted, setIsSubmitted] = useState(0);
  const [isApproved, setIsApproved] = useState(0);
  // const [isSubmitted, setIsSubmitted] = useState(false);

  const handleReactChange = (name, e) => {
    setFormData((prev) => ({ ...prev, [name]: e?.value }));
    // if (name === "year" || name === "month") {
    //   setIsSubmitted(false);
    // }
  };

  const getBindCreatedForDropDown = () => {
    axiosInstance.get("SalesFunnel/BindCreatedFor", {
      params: {
        bindfor: "mslmaster",
      },
    })
      .then((res) => {
        const data = res?.data?.message;
        const States = data?.map((ele) => {
          return {
            value: ele?.CreatedFor,
            label: ele?.CreatedForName,
          };
        });
        setBindFor(States);
      })
      .catch((err) => {
        toast.error(err?.res?.data ? err?.res?.data : "Something Went Wrong");
      });
  };

  const handleSearch = async () => {
    try {
      setLoad(true);
      const payload = {
        employeeId: (FormData?.employeeId).toString(),
        year: (FormData?.year).toString(),
        month: (FormData?.month).toString(),
      };
      const res = await axiosInstance.post(
        "SalesFunnel/TravelBindSchedule",
        payload
      );
      const apiData = res?.data?.success ? res.data.message : [];
      setTableData(apiData);
      const summaryData = res?.data?.success ? res.data.data : [];
      setTravelSummary(summaryData);

      // store exact backend value (0 or 1)
      setIsSubmitted(apiData?.length > 0 ? apiData[0]?.IsSubmitted : 0);
      setIsApproved(apiData?.length > 0 ? apiData[0]?.IsApproved : 0);

      setLoad(false);
    } catch (error) {
      console.log(error);
      setLoad(false);
    }
  };

  const handleDateDayClick = async (row) => {
    try {
      setLoad(true);
      const payload = {
        EmployeeId: String(FormData.employeeId),
        Month: String(FormData.month),
        Year: String(FormData.year),
        Day: row.day,
        selectedDate: row.fullDate
          .toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
          .replace(/ /g, "-"),
      };

      setSchedule({
        Month: payload.Month,
        Year: payload.Year,
        Day: payload.Day,
        selectedDate: payload.selectedDate,
      });

      const res = await axiosInstance.post(
        "SalesFunnel/TravelChooseDate",
        payload
      );
      setModalTableData(res?.data?.success ? res.data.message : []);
      setLoad(false);
      console.log(res.data);
    } catch (error) {
      console.log(error);
      setLoad(false);
    }
  };

  useEffect(() => {
    getBindCreatedForDropDown();
    handleSearch();
  }, []);

  useEffect(() => {
    if (FormData.year && FormData.month) {
      const days = getDaysInMonth(FormData.year, FormData.month);
      setCalendarRows(days);
    }
  }, [FormData.year, FormData.month]);

  useEffect(() => {
    handleSearch();
  }, [show]);

  useEffect(() => {
    setTableData([]);
  }, [FormData.year, FormData.month]);

  // draging work starts
  const groupByTravelDate = (data = []) => {
    return data.reduce((acc, item) => {
      if (!acc[item.TravelDate]) {
        acc[item.TravelDate] = [];
      }
      acc[item.TravelDate].push(item);
      return acc;
    }, {});
  };

  const travelDateMap = groupByTravelDate(TableData);

  const handleDragStart = (e, callData, row) => {
    if (!callData || isSubmitted || load) {
      e.preventDefault();
      return;
    }
    setDragData({
      MSLId: callData.MSLId,
      EmployeeId: callData.EmployeeId,
      SelectedDay: row.day,
      SelectedDate: row.fullDate
        .toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
        .replace(/ /g, "-"),
    });
  };

  const handleDrop = async (e, targetRow) => {
    e.preventDefault();
    if (!dragData) return;
    const payload = {
      SelectedDay: targetRow.day,
      SelectedDate: targetRow.fullDate
        .toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
        .replace(/ /g, "-"),
      EmployeeId: String(dragData.EmployeeId),
      MSLId: String(dragData.MSLId),
    };

    try {
      setLoad(true);

      await axiosInstance
        .post("SalesFunnel/TravelCopyCall", payload)
        .then((res) => {
          if (res?.data?.success) {
            toast.success(res?.data?.message);
            handleSearch();
            setLoad(false);
          } else {
            toast.error(res?.data?.message);
            setLoad(false);
          }
        });

      await handleSearch();
    } catch (err) {
      console.log(err);
    } finally {
      setLoad(false);
      setDragData(null);
    }
  };

  const handleRemoveCall = async (callData) => {
    const payload = {
      TravelDate: callData.TravelDate,
      EmployeeId: String(callData.EmployeeId),
      MSLId: String(callData.MSLId),
    };

    try {
      setLoad(true);

      await axiosInstance
        .post("SalesFunnel/TravelRemoveCall", payload)
        .then((res) => {
          if (res?.data?.success) {
            toast.success(res?.data?.message);
            handleSearch();
            setLoad(false);
          } else {
            toast.error(res?.data?.message);
            setLoad(false);
          }
        });
    } catch (error) {
      console.log(error);
    } finally {
      setLoad(false);
    }
  };

  // draging work ends

  const getMonthName = (monthNumber) =>
    new Date(0, monthNumber - 1).toLocaleString("default", {
      month: "short",
    });

  const handleSubmitSchedule = async () => {
    const payload = {
      EmployeeId: String(FormData.employeeId),
      Year: String(FormData.year),
      Month: String(FormData.month),
      EmployeeName: BindFor.find((x) => x.value === FormData.employeeId)?.label,
      MonthName: getMonthName(FormData.month),
    };

    if (travelSummary?.length !== 0 || TableData >= 0) {
      toast.error("Minimum 1 schedule is required before submission");
      return;
    }


    try {
      setLoad(true);
      await axiosInstance
        .post("SalesFunnel/TravelSubmitSchedule", payload)
        .then((res) => {
          if (res?.data?.success) {
            toast.success(res?.data?.message);
            handleSearch();
          } else {
            toast.error(res?.data?.message);
          }
        });
    } catch (error) {
      console.log(error);
    } finally {
      setLoad(false);
    }
  };

  const handleUnsubmitSchedule = async () => {
    const payload = {
      EmployeeId: String(FormData.employeeId),
      Year: String(FormData.year),
      Month: String(FormData.month),
    };

    try {
      setLoad(true);
      await axiosInstance
        .post("SalesFunnel/TravelUnsubmitSchedule", payload)
        .then((res) => {
          if (res?.data?.success) {
            toast.success(res?.data?.message);
            // setIsSubmitted(false);
            handleSearch();
            setLoad(false);
          } else {
            toast.error(res?.data?.message);
            setLoad(false);
          }
        });
    } catch (error) {
      console.log(error);
    } finally {
      setLoad(false);
    }
  };


  const handleApproveSchedule = async () => {
    const payload = {
      EmployeeId: String(FormData.employeeId),
      Year: String(FormData.year),
      Month: String(FormData.month),
      EmployeeName: BindFor.find((x) => x.value === FormData.employeeId)?.label,

    };

    try {
      setLoad(true);
      await axiosInstance
        .post("SalesFunnel/TravelApproveSchedule", payload)
        .then((res) => {
          if (res?.data?.success) {
            toast.success(res?.data?.message);
            handleSearch();
          } else {
            toast.error(res?.data?.message);
          }
        });
    } catch (error) {
      console.log(error);
    } finally {
      setLoad(false);
    }
  }

  const handleUnApproveSchedule = async () => {
    const payload = {
      EmployeeId: String(FormData.employeeId),
      Year: String(FormData.year),
      Month: String(FormData.month),
      // EmployeeName: BindFor.find((x) => x.value === FormData.employeeId)?.label,
    };

    try {
      setLoad(true);
      await axiosInstance
        .post("SalesFunnel/TravelUnapproveSchedule", payload)
        .then((res) => {
          if (res?.data?.success) {
            toast.success(res?.data?.message);
            handleSearch();
          } else {
            toast.error(res?.data?.message);
          }
        });
    } catch (error) {
      console.log(error);
    } finally {
      setLoad(false);
    }
  }

  useEffect(() => {
    handleSearch();
  }, []);

  useEffect(() => {
    handleSearch();
  }, [FormData.year, FormData.month, FormData.employeeId]);

  return (
    <>
      {show && (
        <TravelScheduleModal
          show={show}
          onHide={() => setShow(false)}
          data={ModalTableData}
          schdule={schdule}
        />
      )}
      <Accordion
        name={t("TravelPlan Schedular")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row pt-2 pl-2 pr-3">
          <div className="col-sm-3 col-md-2 mb-2">
            <ReactSelect
              autoSelectFirst={true}
              dynamicOptions={BindFor}
              name="employeeId"
              lable={t("Sales Team")}
              id="employeeId"
              placeholderName={t("Sales Team")}
              value={FormData?.employeeId}
              onChange={handleReactChange}
            />
          </div>
          <div className="col-sm-3 col-md-2 mb-2">
            <ReactSelect
              autoSelectFirst={true}
              dynamicOptions={getYears()}
              name="year"
              lable={t("Year")}
              id="year"
              placeholderName={t("Year")}
              value={FormData?.year}
              onChange={handleReactChange}
            />
          </div>
          <div className="col-sm-3 col-md-2 mb-2">
            <ReactSelect
              autoSelectFirst={true}
              dynamicOptions={getMonths()}
              name="month"
              lable={t("Month")}
              id="month"
              placeholderName={t("Month")}
              value={FormData?.month}
              onChange={handleReactChange}
            />
          </div>

          <div
            style={{ gap: "6px" }}
            className="d-flex px-2  d-flex justify-content-start"
          >
            <Button className="rounded" onClick={handleSearch}>
              Search
            </Button>
          </div>
        </div>
        <div className="row d-flex p-2">
          <div className="col-md-2 d-flex">
            <span
              className="statusConfirmed"
              style={{ backgroundColor: "lightpink" }}
            ></span>
            <label className="reprintLable" style={{ cursor: "pointer" }}>
              {t("Not Collected")}
            </label>
          </div>
          <div className="col-md-2 d-flex">
            <span
              className="statusConfirmed"
              style={{ backgroundColor: "yellow" }}
            ></span>
            <label className="reprintLable" style={{ cursor: "pointer" }}>
              {t("Limit Remaining")}
            </label>
          </div>
          <div className="col-md-2 d-flex">
            <span
              className="statusConfirmed"
              style={{ backgroundColor: "greenyellow" }}
            ></span>
            <label className="reprintLable" style={{ cursor: "pointer" }}>
              {t("Limit Completed")}
            </label>
          </div>
          <div className="col-md-2 d-flex">
            <span
              className="statusConfirmed"
              style={{ backgroundColor: "crimson" }}
            ></span>
            <label className="reprintLable" style={{ cursor: "pointer" }}>
              {t("Limit Exceeded")}
            </label>
          </div>
        </div>

        <Heading title={t("TravelPlan Schedule's List")} />
        <div className="mb-4 inhouseTable">
          <Tables style={{
            maxHeight: "400px",
            overflowY: "auto",
          }}>
            <tr>
              <thead style={{ position: "sticky", top: 0, }}>
                <tr>
                  <th>{t("Date")}</th>
                  <th>{t("Day")}</th>
                  {getCallHeaders(20).map((call) => (
                    <th key={call}>{t(call)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {calendarRows.map((row, index) => (
                  <tr key={index}>
                    <td
                      className="text-center"
                      onClick={
                        isSubmitted === 0
                          ? () => {
                            handleDateDayClick(row);
                            setShow(true);
                          }
                          : undefined
                      }
                      data-title={t(row.dateLabel)}
                    >
                      {row.dateLabel}
                    </td>

                    <td
                      onClick={
                        isSubmitted === 0
                          ? () => {
                            handleDateDayClick(row);
                            setShow(true);
                          }
                          : undefined
                      }
                      data-title={t(row.day)}
                    >
                      {row.day}
                    </td>

                    {getCallHeaders(20).map((_, i) => {
                      const apiDate = row.fullDate
                        .toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                        .replace(/ /g, "-");

                      const dayCalls = travelDateMap[apiDate] || [];
                      const callData = dayCalls[i];

                      return (
                        <td
                          key={i}
                          className="text-center"
                          style={{
                            backgroundColor:
                              callData?.RowColor || "transparent",
                            cursor: callData ? "grab" : "pointer",
                          }}
                          draggable={
                            Boolean(callData) && !load && isSubmitted === 0
                          }
                          onDragStart={(e) => handleDragStart(e, callData, row)}
                          onDrop={
                            !load && isSubmitted === 0
                              ? (e) => handleDrop(e, row)
                              : undefined
                          }
                          onDragOver={(e) => e.preventDefault()}
                        >
                          {callData && (
                            <>
                              <div className="text-bold">
                                {callData.OPDDoctor}
                              </div>
                              <div>{callData.MeetingStartTime}</div>
                              <div>{callData.OrganizationName}</div>
                              <div>{callData.CityName}</div>
                              <div>{callData.Locality || "locality"}</div>
                              {isSubmitted === 0 &&
                                callData?.IsApproved !== 1 && (
                                  <span
                                    title="Remove"
                                    style={{ cursor: "pointer" }}
                                    onClick={
                                      !load
                                        ? () => handleRemoveCall(callData)
                                        : undefined
                                    }
                                  >
                                    ❌
                                  </span>
                                )}
                            </>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </tr>
          </Tables>
          <div className="col-sm-2 mt-2 mb-2 d-flex align-items-center" style={{ gap: "5px" }}>
            {load ? (
              <Loading />
            ) : isSubmitted === 1 && isApproved === 0 && FormData?.employeeId == userId ? (
              <button
                onClick={handleUnsubmitSchedule}
                className="btn btn-block btn-success btn-sm"
              >
                Unsubmit
              </button>
            ) : null}

            {load ? (
              <Loading />
            ) : isSubmitted === 1 && isApproved === 0 && FormData?.employeeId !== userId ? (
              <button
                onClick={handleApproveSchedule}
                className="btn btn-success btn-sm"
              >
                Approve
              </button>
            ) : null}

            {load ? (
              <Loading />
            ) : isSubmitted === 0 && FormData?.employeeId == userId ? (
              <button
                onClick={handleSubmitSchedule}
                className="btn btn-block btn-success btn-sm"
              >
                Submit
              </button>
            ) : null}

            {load ? (
              <Loading />
            ) : isSubmitted === 1 && isApproved === 1 && FormData?.employeeId !== userId ? (
              <button
                onClick={handleUnApproveSchedule}
                className="btn btn-block btn-success btn-sm"
              >
                UnApprove
              </button>
            ) : null}


          </div>
        </div>
      </Accordion>
    </>
  );
};

export default TravelPlanSchedular;
