import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { axiosInstance } from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import moment from "moment";
import Accordion from "@app/components/UI/Accordion";
import ReactSelect from "../../components/formComponent/ReactSelect";
import Tables from "../../components/UI/customTable";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import Loading from "../../components/loader/Loading";
import DatePicker from "../../components/formComponent/DatePicker";
import Input from "../../components/formComponent/Input";
import { number } from "../../utils/helpers";

const CompanyWiseSmsCountAndWhatsAppCount = () => {
  const { t } = useTranslation();
  const [Company, setCompany] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [SMSCountModal, setSMSCountModal] = useState(false);
  const [smsStatus, setSMSStatus] = useState([]);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [payload, setPayload] = useState({
    CompanyId: "",
    status: "save",
  });
  const Dates = [
    "01-31",
    "02-28",
    "02-29",
    "03-31",
    "04-30",
    "05-31",
    "06-30",
    "07-31",
    "08-31",
    "09-30",
    "10-31",
    "11-30",
    "12-31",
  ];
  const handleSelectchange = (e) => {
    const { name, value, selectedIndex } = e.target;
    const label = e?.target?.children[selectedIndex].text;
    if (value) {
      // setPayload({ ...payload, [name]: value });
      getTable(value, label);
    } else {
      setTableData([]);
    }
  };
  const hasNonEmptyToDate = (Error) => {
    return Error.some((obj) => Object.keys(obj).length > 0);
  };
  const handleChange = (e, index) => {
    const { name, value, type, checked } = e.target;
    const newData = [...tableData];
    newData[index][name] = type === "checkbox" ? (checked ? 1 : 0) : value;
    setTableData(newData);
  };

  const handleSearchSelectChange = (label, value) => {
    const selectedValue = value?.value;
    setPayload({
      ...payload,
      [label]: selectedValue,
    });
    if (value) {
      getTable(value, label);
    } else {
      setTableData([]);
    }
  };

  const dateSelect = (date, name, index) => {
    const data = [...tableData];
    if (name === "Fromdate") {
      const toDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      data[index][name] = date;
      if (new Date(data[index]["Todate"]) < toDate)
        data[index]["Todate"] = toDate;
      setTableData(data);
    } else {
      data[index][name] = date;
      setTableData(data);
    }
  };

  const getCompanyId = () => {
    axiosInstance
      .get("CompanyMaster/getCompanyName")
      .then((res) => {
        const data = res?.data?.message;
        const newData = data?.map((ele) => {
          return {
            label: ele?.CompanyName,
            value: ele?.CompanyId,
          };
        });
        setCompany(newData);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  console.log(tableData);

  const getTable = (CompanyId, CompanyName) => {
    axiosInstance
      .post("CompanyMaster/gettabledata", {
        CompanyId: CompanyId.value.toString(),
      })
      .then((res) => {
        const data = res?.data?.message;
        if (data?.length === 0) {
          const newData = [];
          const fromDate = new Date();
          const toDate = new Date(
            fromDate.getFullYear(),
            fromDate.getMonth() + 1,
            0,
          );
          newData.push({
            CompanyId: CompanyId,
            CompanyName: CompanyName,
            Fromdate: fromDate,
            Todate: toDate,
            Whatsappcount: 0,
            SmsCount: 0,
            UsedWhatsAppCount: 0,
            UsedSmsCount: 0,
            RemainingSmsCount: 0,
            IsActive: 0,
          });
          setTableData(newData);
          setPayload({
            CompanyId: CompanyId,
            status: "save",
          });
        } else {
          setPayload({
            CompanyId: CompanyId,
            status: "Update",
          });
          setTableData(data);
        }
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Error Occured",
        );
      });
  };

  const handleAddRow = () => {
    const check = Empty();
    const Error = getErrors();
    setErrors(Error);
    if (check && !hasNonEmptyToDate(Error)) {
      const newData = [...tableData];
      const lastRow = newData[newData.length - 1];
      const fromDate = new Date(lastRow.Todate);
      fromDate.setDate(fromDate.getDate() + 1);
      const toDate = new Date(
        fromDate.getFullYear(),
        fromDate.getMonth() + 1,
        0,
      );
      newData.push({
        ...lastRow,
        CompanyId: tableData[0]?.CompanyId,
        CompanyName: tableData[0]?.CompanyName,
        Fromdate: fromDate,
        Todate: toDate,
        Whatsappcount: 0,
        UsedWhatsAppCount: 0,
        SmsCount: 0,
        UsedSmsCount: 0,
        RemainingSmsCount: 0,
        IsActive: 0,
      });
      setTableData(newData);
    }
  };

  const handleDeleteRow = (index) => {
    const updatedRows = [...tableData];
    updatedRows.splice(index, 1);
    setTableData(updatedRows);
  };

  const Empty = () => {
    for (let i of tableData) {
      if (
        i.SmsCount == "" ||
        i.Whatsappcount == "" ||
        i.SmsCount == "-" ||
        i.Whatsappcount == "-"
      ) {
        return false;
      }
    }
    return true;
  };

  const handleSave = () => {
    const emp = Empty();
    const Error = getErrors();
    setErrors(Error);
    if (emp && !hasNonEmptyToDate(Error)) {
      const data = tableData.map((ele) => {
        return {
          Fromdate: moment(ele?.Fromdate).format("YYYY-MM-DD"),
          Todate: moment(ele?.Todate).format("YYYY-MM-DD"),
          Whatsappcount: ele?.Whatsappcount,
          SmsCount: ele?.SmsCount,
          CompanyId: ele?.CompanyId.value.toString(),
          IsActive: ele?.IsActive,
        };
      });
      axiosInstance
        .post("CompanyMaster/SaveCount", data)
        .then((res) => {
          setPayload({
            ...payload,
            status: "Update",
          });

          toast.success(res?.data?.message);
        })
        .catch((err) => {
          toast.error(
            err?.response?.data?.message
              ? err?.response?.data?.message
              : "Something Wents Wrong",
          );
        });
    }
  };

  const getErrors = () => {
    let err = [];
    const data = tableData.map((ele) => {
      return {
        Fromdate: moment(ele?.Fromdate).format("MM-DD"),
        Todate: moment(ele?.Todate).format("MM-DD"),
        Whatsappcount: ele?.Whatsappcount,
        SmsCount: ele?.SmsCount,
        CompanyId: ele?.CompanyId,
        IsActive: ele?.IsActive,
      };
    });
    for (let i = 0; i < data?.length; i++) {
      err.push({});
      if (
        data[i].SmsCount === "" ||
        data[i].SmsCount === 0 ||
        data[i].SmsCount === "-"
      ) {
        err[i] = { ...err[i], SmsCount: "Count Must be greater than 0" };
      }
      if (
        data[i].Whatsappcount === "" ||
        data[i].Whatsappcount === 0 ||
        data[i].Whatsappcount === "-"
      ) {
        err[i] = { ...err[i], Whatsappcount: "Count Must be greater than 0" };
      }
      if (!Dates.includes(data[i].Todate)) {
        err[i] = { ...err[i], ToDate: "Set date to the last day of the month" };
      }
    }

    return err;
  };

  useEffect(() => {
    getCompanyId();
  }, []);
  return (
    <>
      <Accordion
        name={t("Company Wise Sms Count And WhatsApp Count")}
        isBreadcrumb={true}
        defaultValue={true}
      >
        <div className="row pt-2 pl-2 pr-2 mt-1">
          <div className="col-sm-2">
            <ReactSelect
              name="CompanyId"
              id="CompanyId"
              lable="CompanyId"
              placeholderName={t("Company")}
              value={payload?.CompanyId}
              dynamicOptions={Company}
              removeIsClearable={true}
              onChange={handleSearchSelectChange}
            />
          </div>
        </div>
      </Accordion>
      <Accordion title={t("Search Data")} defaultValue={true}>
        <div className="row p-2">
          <div className="col-sm-12">
            {loading ? (
              <Loading />
            ) : tableData?.length > 0 ? (
              <>
                <Tables>
                  <thead>
                    <tr>
                      {/* <th>Sr No.</th>
                      <th>Delete</th> */}
                      <th>Company Name</th>
                      <th>From Date</th>
                      <th>To Date</th>
                      <th>Add WhatsApp Count</th>
                      <th>WhatsApp Count</th>
                      <th>WhatsApp Used Count</th>
                      <th>WhatsAppRemainingCount</th>
                      <th>SMS Count</th>
                      <th>Used SMS Count</th>
                      <th>Remaining SMS Count</th>
                      <th>IsActive</th>
                      {/* <th>Add Row</th> */}
                    </tr>
                  </thead>
                  <tbody>
                    {tableData?.map((ele, index) => (
                      <tr key={index}>
                        <td>{ele?.CompanyId.label}</td>
                        <td>
                          <DatePicker
                            className="custom-calendar"
                            name="Fromdate"
                            id="Fromdate"
                            value={new Date(ele?.Fromdate)}
                            minDate={
                              tableData[index - 1]?.Todate
                                ? new Date(
                                    new Date(
                                      tableData[index - 1]?.Todate,
                                    ).getTime() +
                                      24 * 60 * 60 * 1000,
                                  )
                                : new Date(ele?.Fromdate) > new Date()
                                  ? new Date()
                                  : new Date(ele?.Fromdate)
                            }
                            onChange={(date) =>
                              dateSelect(date, "Fromdate", index)
                            }
                            maxDate={
                              tableData[index + 1]?.Fromdate &&
                              new Date(tableData[index + 1]?.Fromdate)
                            }
                          />
                        </td>
                        <td>
                          <DatePicker
                            className="custom-calendar"
                            name="Todate"
                            id="Todate"
                            value={new Date(ele?.Todate)}
                            onChange={(date) =>
                              dateSelect(date, "Todate", index)
                            }
                            minDate={new Date(ele?.Fromdate)}
                            maxDate={new Date()}
                          />
                          <span className="error-message">
                            {errors[index]?.ToDate}
                          </span>
                          &nbsp;
                        </td>
                        <td>
                          <Input
                            className="form-control"
                            name="Whatsappcount"
                            id="Whatsappcount"
                            placeholder="Add WhatsApp Count	"
                            type="number"
                            onInput={(e) => number(e, 10)}
                            value={ele?.Whatsappcount}
                            onChange={(e) => handleChange(e, index)}
                          />
                          <span className="golbal-Error">
                            {errors[index]?.Whatsappcount}
                          </span>
                        </td>
                        <td>{ele?.Whatsappcount}</td>
                        <td>{ele?.UsedWhatsAppCount}</td>
                        <td>{ele?.Whatsappcount - ele?.UsedWhatsAppCount}</td>
                        <td>
                          <Input
                            className="form-control"
                            name="SmsCount"
                            id="SmsCount"
                            type="number"
                            placeholder="SMS Count"
                            onInput={(e) => number(e, 10)}
                            value={ele?.SmsCount}
                            onChange={(e) => handleChange(e, index)}
                          />
                          <span className="golbal-Error">
                            {errors[index]?.SmsCount}
                          </span>
                        </td>
                        <td>{ele?.UsedSmsCount}</td>
                        <td>{ele?.SmsCount - ele?.UsedSmsCount}</td>
                        <td>
                          <input
                            type="checkbox"
                            name="IsActive"
                            checked={ele?.IsActive}
                            onChange={(e) => handleChange(e, index)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Tables>
              </>
            ) : (
              <>
                <NoRecordFound />
              </>
            )}
          </div>
        </div>
        <div className="row pl-2 pr-2 pb-2">
          <div className="col-sm-1">
            <button
              className="btn btn-sm btn-block btn-success"
              onClick={handleSave}
            >
              {payload?.status == "save" ? "Save" : "Update"}
            </button>
          </div>
        </div>
      </Accordion>
    </>
  );
};

export default CompanyWiseSmsCountAndWhatsAppCount;
