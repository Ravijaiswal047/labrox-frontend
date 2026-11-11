import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { axiosInstance } from "../../utils/axiosInstance";
import Heading from "../../components/UI/Heading";
import Accordion from "@app/components/UI/Accordion";
import Input from "../../components/formComponent/Input";
import Loading from "../../components/loader/Loading";
import Tables from "../../components/UI/customTable";
import DatePicker from "../../components/formComponent/DatePicker";
import moment from "moment";
import { toast } from "react-toastify";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import { SearchButton } from "../../components/UI/CustomButton";

const ChangeDeliveryStatus = () => {
  const [LabNo, setLabNo] = useState("");
  const [loading, setLoading] = useState(false);
  const [formTable, setFormTable] = useState([]);

  const handleChange = (e, index) => {
    const { name, value, type, checked } = e.target;
    const data = [...formTable];
    data[index][name] = type === "checkbox" ? checked : value;
    setFormTable(data);
  };

  const { t, i18n } = useTranslation();

  const dateSelect = (date, name, index) => {
    const data = [...formTable];
    data[index][name] = date;
    setFormTable(data);
  };

  const handleTime = (time, secondName, index) => {
    const updatedData = [...formTable];
    const timeStamp = `${time?.Hour}:${time?.Minute}:${time?.second}`;
    updatedData[index][secondName] = timeStamp;
    setFormTable(updatedData);
  };
  console.log(formTable);
  const SearchApi = (event) => {
    console.log(event, "callint the e in search api");
    event.preventDefault();
    setLoading(true);
    axiosInstance
      .post("changeDeliveryStatus/GetChangeDeliveryStatusData", {
        LabNo: LabNo,
      })
      .then((res) => {
        const data = res?.data?.message;
        const val = data?.map((ele) => {
          return {
            ...ele,
            isChecked: false,
            SampleDate:
              ele?.SampleDate.trim() === "0000-00-00"
                ? ""
                : new Date(ele?.SampleDate),
            ApprovedDate:
              ele?.ApprovedDate.trim() === "0000-00-00"
                ? ""
                : new Date(ele?.ApprovedDate),
          };
        });
        setFormTable(val);
        setLoading(false);
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : err?.data?.message,
        );
        setLoading(false);
      });
  };

  // update Api
  const handleSubmit = () => {
    const data = formTable?.filter((ele) => ele?.isChecked === true);
    if (data.length > 0) {
      const val = data?.map((ele) => {
        return {
          SampleDate:
            ele?.SampleDate === ""
              ? ele?.SampleDate
              : moment(ele?.SampleDate).format("DD-MMM-YYYY"),
          ApprovedDate:
            ele?.ApprovedDate === ""
              ? ""
              : moment(ele?.ApprovedDate).format("DD-MMM-YYYY"),
          LabNo: ele?.LedgerTransactionNo,
          TestId: ele?.TestID,
          SampleTime: ele?.SampleTime,
          ApproveTime: ele?.ApprovedDate === "" ? "" : ele?.ApprovedTime,
        };
      });
      setLoading(true);
      axiosInstance
        .post("changeDeliveryStatus/UpdateDeliveryStatusData", val)
        .then((res) => {
          toast.success(res?.data?.message);
          SearchApi();
          setLoading(false);
          // setLabNo("");
        })
        .catch((err) => {
          toast.error(
            err?.response?.data?.message
              ? err?.response?.data?.message
              : err?.data?.message,
          );
          setLoading(false);
          // setLabNo("");
        });
    } else {
      toast.error("please choose one test");
    }
    setLoading(false);
  };

  const hideButton = () => {
    const val = formTable?.filter((ele) => ele?.isChecked === true);
    return val.length > 0 ? true : false;
  };

  // end

  const handleClose = () => {
    setFormTable("");
    setLabNo("");
  };
  return (
    <>
      <Accordion
        name={t("Change Delivery Status")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        {" "}
        <form action="" onSubmit={SearchApi}>
          <div className="row px-2 mt-2 mb-1 mt-1">
            <div className="col-sm-2">
              <Input
                type="text"
                lable="Lab No"
                name="Lab No"
                className="required-fields"
                id="Lab No"
                placeholder=""
                value={LabNo}
                onChange={(e) => setLabNo(e.target.value)}
                required
              />
            </div>
            <div className="col-sm-1">
              <SearchButton
                text={"Search"}
                id="btnSave"
                disabled={LabNo.length > 3 ? false : true}
                onClick={SearchApi}
              />
            </div>
          </div>{" "}
        </form>
      </Accordion>{" "}
      <Accordion title={t("Search Data")} defaultValue={true}>
        {loading ? (
          <Loading />
        ) : (
          <>
            {formTable.length > 0 ? (
              <div className="row p-2">
                <div className="col-12">
                  <div
                    style={{
                      maxHeight: "500px",
                      overflowY: "auto",
                    }}
                  >
                    <Tables>
                      <thead
                        className="cf"
                        style={{
                          position: "sticky",
                          top: 0,
                        }}
                      >
                        <tr>
                          <th>{t("S.No")}</th>
                          <th>{t("Lab No")}</th>
                          <th>{t("Patient Name")}</th>
                          <th>{t("Investigations")}</th>
                          <th>{t("Sample Collection Date")}</th>
                          {/* <th>Time</th> */}
                          <th>{t("Approved Date")}</th>
                          {/* <th>Time</th> */}
                          <th>{t("#")}</th>
                        </tr>
                      </thead>
                      {formTable.map((ele, index) => (
                        <tbody>
                          <tr key={index}>
                            <td data-title={t("S.No")}>{index + 1}&nbsp;</td>
                            <td data-title={t("Lab No")}>
                              {ele?.LedgerTransactionNo}&nbsp;
                            </td>
                            <td data-title={t("Patient")}>
                              {ele?.PName}&nbsp;
                            </td>
                            <td data-title={t("Investigations")}>
                              {ele?.Investigation}&nbsp;
                            </td>
                            <td data-title={t("Sample Collection Date")}>
                              <DatePicker
                                name="SampleDate"
                                id="SampleDate"
                                value={ele?.SampleDate}
                                onChange={(value) =>
                                  dateSelect(value, "SampleDate", index)
                                }
                                maxDate={new Date()}
                                disabled={ele?.isChecked ? false : true}
                              />
                            </td>
                            <td data-title={t("Approved Date")}>
                              <DatePicker
                                name="ApprovedDate"
                                id="ApprovedDate"
                                value={ele?.ApprovedDate}
                                onChange={(value) =>
                                  dateSelect(value, "ApprovedDate", index)
                                }
                                maxDate={new Date()}
                                minDate={new Date(ele?.SampleDate)}
                                disabled={ele?.isChecked ? false : true}
                              />
                            </td>
                            <td data-title={t("#")}>
                              <input
                                type="checkbox"
                                checked={ele?.isChecked}
                                name="isChecked"
                                onChange={(e) => handleChange(e, index)}
                              />
                            </td>
                          </tr>
                        </tbody>
                      ))}
                    </Tables>
                  </div>
                  {loading ? (
                    <Loading />
                  ) : (
                    <>
                      {hideButton() && (
                        <div className="row mt-2">
                          <div className="col-sm-2">
                            <button
                              type="button"
                              className="btn btn-block btn-success btn-sm"
                              id="btnUpdate"
                              onClick={handleSubmit}
                            >
                              {t("Update")}
                            </button>
                          </div>
                          <div className="col-sm-2">
                            <button
                              type="button"
                              className="btn btn-block btn-danger btn-sm"
                              id="btnCancle"
                              onClick={handleClose}
                            >
                              {t("Cancel")}
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ) : (
              <NoRecordFound />
            )}
          </>
        )}{" "}
      </Accordion>
    </>
  );
};

export default ChangeDeliveryStatus;
