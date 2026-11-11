import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import moment from "moment";
import { toast } from "react-toastify";
import { isChecked } from "../util/Commonservices";
import Tables from "../../components/UI/customTable";
import { axiosInstance } from "../../utils/axiosInstance";
import DatePicker from "../../components/formComponent/DatePicker";
import Loading from "../../components/loader/Loading";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import CustomTimePicker from "../../components/formComponent/TimePicker";
import { Dialog } from "primereact/dialog";
import { Time } from "../../utils/helpers";
function CustomDateModal({ show, data, onHide, SearchFunction, Status }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState({
    search: false,
    update: false,
  });

  const isMobile = window.innerWidth <= 768;
  const theme = useLocalStorage("theme", "get");
  const [errors, setErrors] = useState([]);
  const [tableData, setTableData] = useState([]);

  const fetch = () => {
    setTableData([]);

    const payload = {
      TestId: data?.split(","),
    };

    axiosInstance
      .post("RE/CustomizedDate", payload)
      .then((res) => {
        setLoading({ ...loading, search: false });
        if (typeof res.data.message === "string") {
          toast.error("No record found");
          setTableData([]);
        } else {
          const val = res?.data?.message.map((item, _) => {
            const isValidDate = (dateString) => {
              const dateRegex = /^\d{2}-\w{3}-\d{4} \d{2}:\d{2}:\d{2}$/;
              return dateRegex.test(dateString);
            };

            return {
              VisitNo: item?.VisitNo,
              RegDate: isValidDate(item?.RegistrationDate)
                ? new Date(item?.RegistrationDate)
                : null,
              SampleDate: isValidDate(item?.SampleCollectionDate)
                ? new Date(item?.SampleCollectionDate)
                : null,
              ReDate: isValidDate(item?.ResultEnteredDate)
                ? new Date(item?.ResultEnteredDate)
                : null,
              ApprovalDate: isValidDate(item?.ApprovedDate)
                ? new Date(item?.ApprovedDate)
                : null,
              TestId: item?.Testid,
              ItemName: item?.TestName,
              isActive: false,
              status: item?.status,
              SampleTime:
                item?.SampleCollectionDate == ""
                  ? null
                  : new Date(item?.SampleCollectionDate),

              RegTime:
                item?.RegistrationDate == ""
                  ? null
                  : new Date(item?.RegistrationDate),

              ApprovedTime:
                item?.ApprovedDate == "" ? null : new Date(item?.ApprovedDate),
            };
          });
          const errors = res?.data?.message.map((item) => {
            return {
              sample: false,
              re: false,
              approval: false,
              sampleerror: "",
              reerror: "",
              regerror: "",
            };
          });
          setErrors(errors);
          setTableData(val);
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  };

  const handleDateChange = (index, fieldName, date) => {
    const updatedTableData = [...tableData];
    updatedTableData[index][fieldName] = date;
    setTableData(updatedTableData);
  };

  const handleTime = (index, fieldName, time) => {
    const updatedTableData = [...tableData];
    updatedTableData[index][fieldName] = time;
    setTableData(updatedTableData);
  };

  const validateDates = (table) => {
    const newErrors = [...errors];
    console.log(newErrors);
    console.log(table, tableData);
    table.forEach((item, index) => {
      const regDate = item?.DATE;
      const sampleDate = item?.SampleDate;
      // const resultEnteredDate = item?.ResultEnteredDate;
      const approvedDate = item?.ApprovedDate;

      if (item.isActive == false) {
        newErrors[index] = {
          reg: false,
          sample: false,
          approval: false,
          sampleerror: "",
          // reerror:'',
          regerror: "",
        };
      } else {
        if (regDate && approvedDate) {
          console.log(regDate, approvedDate);
          if (!moment(regDate).isBefore(approvedDate)) {
            newErrors[index].sample = false;
            newErrors[index].re = false;
            newErrors[index].reg = true;
            newErrors[index].regerror =
              "Regsiteration Date must be before approval date";
          } else {
            newErrors[index].sample = false;
            newErrors[index].re = false;
            newErrors[index].sampleerror = "";
            newErrors[index].reg = false;
            newErrors[index].regerror = "";
          }
        }

        if (sampleDate && approvedDate) {
          if (!moment(sampleDate).isBefore(approvedDate)) {
            // newErrors[index].re = true;
            newErrors[index].sample = true;
            newErrors[index].reerror =
              "Sample Collection date must be before approval date";
          } else {
            newErrors[index].approval = false;
            newErrors[index].sample = false;
            newErrors[index].reerror = "";
          }
        }
      }
    });

    setErrors(newErrors);
    console.log(newErrors);
    for (let i of newErrors) {
      for (const key in i) {
        if (i[key] == true) {
          return false;
        }
      }
    }
    return true;
  };
  const getIndexesWithTrueValue = (arr) => {
    const indexes = [];
    arr.forEach((obj, index) => {
      for (const key in obj) {
        if (obj[key] === true) {
          indexes.push(index);
          break;
        }
      }
    });
    return indexes;
  };

  const handleUpdateTime = () => {
    setErrors([]);
    const payload = tableData.map((item) => {
      return {
        DATE:
          item?.RegDate == null
            ? null
            : `${moment(item?.RegDate).format("YYYY-MM-DD")} ${Time(item?.RegTime) ?? "00:00:00"}`,

        SampleDate:
          item?.SampleDate == null
            ? null
            : `${moment(item?.SampleDate).format("YYYY-MM-DD")} ${Time(item?.SampleTime) ?? "00:00:00"}`,

        ApprovedDate:
          item?.ApprovalDate == null
            ? null
            : `${moment(item?.ApprovalDate).format("YYYY-MM-DD")} ${Time(item?.ApprovedTime) ?? "00:00:00"}`,

        // ResultEnteredDate: item?.ReDate == null ? null : moment(item?.ReDate).format('YYYY-MM-DD HH:mm:ss'),
        LedgerTransactionNo: item?.VisitNo,
        TestId: item?.TestId,
        isActive: item?.isActive,
      };
    });

    const validate = true;
    console.log(payload);
    if (validate === true) {
      setLoading({ ...loading, update: true });
      const table = payload.filter((item) => {
        return item.isActive == true;
      });
      axiosInstance
        .post("RE/UpdateCustomizedDate", { data: table })
        .then((res) => {
          toast.success("Date updated succesfully");
          SearchFunction(Status);
          setLoading({ ...loading, update: false });
          fetch();
          onHide();
        })
        .catch((err) => {
          setLoading({ ...loading, update: false });
        });
    } else {
      const indexes = getIndexesWithTrueValue(errors);
      const sampleError = errors[indexes[0]]?.sampleerror;
      const reError = errors[indexes[0]]?.reerror;
      const regError = errors[indexes[0]]?.regerror;

      if (sampleError && sampleError.length > 0) {
        toast.error(sampleError);
      } else if (regError && regError.length > 0) {
        toast.error(regError);
      } else {
        toast.error(reError);
      }
    }
  };

  const handleCheckbox = (e) => {
    const { checked } = e.target;
    const data = tableData?.map((ele) => {
      if (![4, 11].includes(ele?.status)) {
        return {
          ...ele,
          isActive: checked ? "1" : "0",
        };
      } else {
        return {
          ...ele,
          isActive: "0",
        };
      }
    });

    setTableData(data);
  };
  const handleCollection = (e, index, data) => {
    const { name, checked } = e.target;
    const datas = [...tableData];
    datas[index][name] = checked ? "1" : "0";
    setTableData(datas);
  };

  const handleClose = () => {
    onHide();
  };
  useEffect(() => {
    fetch();
  }, []);

  return (
    <>
      <Dialog
        header={t("Customize Date")}
        onHide={handleClose}
        visible={show}
        className={theme}
        style={{
          width: isMobile ? "80vw" : "80vw",
        }}
      >
        {tableData.length > 0 && (
          <>
            <>
              <>
                <Tables>
                  <thead>
                    <tr>
                      <th>{t("S.No")}</th>
                      <th>{t("Visit No.")}</th>
                      <th
                        style={{
                          wordWrap: "break-word",
                          whiteSpace: "normal",
                        }}
                      >
                        {t("Test Name")}
                      </th>
                      <th>{t("Registration Date and Time")}&nbsp;</th>
                      <th>{t("Sample Collection Date and Time")}&nbsp;</th>
                      <th>{t("Approval Date and Time")}</th>
                      <th>
                        {t("Update")}
                        &nbsp;
                        <input
                          type="checkbox"
                          checked={
                            tableData.length > 0
                              ? isChecked("isActive", tableData, "1").includes(
                                  false,
                                )
                                ? false
                                : true
                              : false
                          }
                          onChange={handleCheckbox}
                        />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((data, index) => (
                      <tr key={index}>
                        <td
                          data-title={t("S.No")}
                          style={{
                            wordWrap: "break-word",
                            whiteSpace: "normal",
                            width: "100px",
                          }}
                        >
                          {index + 1}&nbsp;
                        </td>
                        <td
                          data-title={t("Visit No")}
                          style={{
                            wordWrap: "break-word",
                            whiteSpace: "normal",
                            width: "100px",
                          }}
                        >
                          {data.VisitNo}
                        </td>
                        <td
                          data-title={t("Test Name")}
                          style={{
                            wordWrap: "break-word",
                            whiteSpace: "normal",
                            width: "100px",
                          }}
                        >
                          {data.ItemName}
                        </td>
                        <td data-title={t("Registeration Date")}>
                          <div
                            className={`${errors[index]?.reg ? "wdate" : ""} d-flex `}
                          >
                            {data.RegDate !== null ? (
                              <>
                                <DatePicker
                                  key={`RegDate_${index}`}
                                  name="RegDate"
                                  secondName="RegDate"
                                  value={
                                    data.RegDate ? new Date(data.RegDate) : null
                                  }
                                  onChange={(date) =>
                                    handleDateChange(index, "RegDate", date)
                                  }
                                  disabled={data?.isActive == false}
                                />{" "}
                                <CustomTimePicker
                                  name="RegTime"
                                  value={data?.RegTime}
                                  disabled={data?.isActive == false}
                                  onChange={(date) =>
                                    handleTime(index, "RegTime", date)
                                  }
                                />
                              </>
                            ) : (
                              <span>{t("No Date Available")}</span>
                            )}
                          </div>
                        </td>
                        <td data-title={t("Sample Collection Date")}>
                          <div
                            className={`${errors[index]?.sample ? "wdate" : ""} d-flex`}
                          >
                            {data.SampleDate !== null ? (
                              <>
                                <DatePicker
                                  name={`SampleDate_${index}`}
                                  secondName="SampleDate"
                                  value={
                                    data.SampleDate
                                      ? new Date(data.SampleDate)
                                      : null
                                  }
                                  onChange={(date) =>
                                    handleDateChange(index, "SampleDate", date)
                                  }
                                  disabled={data?.isActive == false}
                                />
                                <CustomTimePicker
                                  name="SampleTime"
                                  value={data?.SampleTime}
                                  disabled={data?.isActive == false}
                                  onChange={(date) =>
                                    handleTime(index, "SampleTime", date)
                                  }
                                />
                              </>
                            ) : (
                              <span style={{ fontSize: "14px", color: "red" }}>
                                {t("Sample Not Collected")}
                              </span>
                            )}
                          </div>
                        </td>

                        <td data-title={t("Approval Date")}>
                          <div
                            className={`${
                              errors[index]?.approval ? "wdate" : ""
                            } d-flex`}
                          >
                            {data.ApprovalDate !== null ? (
                              <>
                                <DatePicker
                                  name={`ApprovalDate_${index}`}
                                  secondName={`ApprovalTime_${index}`}
                                  value={
                                    data.ApprovalDate
                                      ? new Date(data.ApprovalDate)
                                      : null
                                  }
                                  onChange={(date) =>
                                    handleDateChange(
                                      index,
                                      "ApprovalDate",
                                      date,
                                    )
                                  }
                                  disabled={data?.isActive == false}
                                />
                                <CustomTimePicker
                                  name="ApprovedTime"
                                  value={data?.ApprovedTime}
                                  disabled={data?.isActive == false}
                                  onChange={(date) =>
                                    handleTime(index, "ApprovedTime", date)
                                  }
                                />
                              </>
                            ) : (
                              <span style={{ fontSize: "14px", color: "red" }}>
                                {t("Result Entry Not Approved")}
                              </span>
                            )}
                          </div>
                        </td>

                        <td
                          data-title={t("Status")}
                          className="text-center"
                          style={{
                            wordWrap: "break-word",
                            whiteSpace: "normal",
                            width: "100px",
                          }}
                        >
                          <input
                            type="checkbox"
                            name="isActive"
                            checked={data?.isActive == "1" ? true : false}
                            disabled={
                              [4, 11].includes(data?.status) ? true : false
                            }
                            onChange={(e) => handleCollection(e, index, data)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Tables>
                {loading.update && <Loading />}
                {!loading.update &&
                  tableData.some((item) => item.isActive == "1") && (
                    <div className="col-sm-1" style={{ marginTop: "9px" }}>
                      <button
                        className="btn btn-success btn-sm btn-block"
                        onClick={handleUpdateTime}
                      >
                        {t("Update")}
                      </button>
                    </div>
                  )}
              </>
            </>
          </>
        )}
      </Dialog>
    </>
  );
}

export default CustomDateModal;
