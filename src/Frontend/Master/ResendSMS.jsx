import React, { useEffect, useState } from "react";
import moment from "moment";

import { axiosInstance } from "../../utils/axiosInstance";
import {
  AddBlankData,
  AllDataDropDownPayload,
  Time,
  number,
} from "../../utils/helpers";
import { MessageStatus, SearchBy } from "../../utils/Constants";
import Input from "../../components/formComponent/Input";
import { SelectBox } from "../../components/formComponent/SelectBox";
import DatePicker from "../../components/formComponent/DatePicker";
import CustomTimePicker from "../../components/formComponent/TimePicker";
import Loading from "../../components/loader/Loading";
import Accordion from "@app/components/UI/Accordion";
import { useTranslation } from "react-i18next";
import Tables from "../../components/UI/customTable";
import { isChecked } from "../util/Commonservices";
import { toast } from "react-toastify";
const ResendSMS = () => {
  const [RateTypes, setRateTypes] = useState([]);
  const [CentreData, setCentreData] = useState([]);

  const { t } = useTranslation();
  const [errors, setErrors] = useState({});
  const today = new Date();
  const [formData, setFormData] = useState({
    FromDate: new Date(),
    ToDate: new Date(),
    CentreID: "",
    ItemValue: "",
    RateTypeID: "",
    SelectTypes: "",
    FromTime: "00:00:00",
    ToTime: "23:59:59",
    // FromTime: new Date(today.setHours(0, 0, 0, 0)),
    // ToTime: new Date(today.setHours(23, 59, 59, 999)),
    MessageType: "Report",
    MessageStatus: "Pending",
  });

  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState([]);
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
        error = { ...error, ItemValue: t("This Field is Required") };
      } else if (formData.ItemValue.length !== 10) {
        error = { ...error, ItemValue: t("Invalid Mobile Number") };
      }
    }

    return error;
  };
  const handleSelectChange = (event) => {
    const { name, value } = event.target;
    if (name == "CentreID") {
      setFormData({ ...formData, [name]: value, RateTypeID: "" });
      setRateTypes([]);
      if (value == "") {
        fetchRateTypes(CentreData.map((ele) => ele.value));
      } else {
        fetchRateTypes([value]);
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };
  const dateSelect = (value, name) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  const handleTime = (time, name) => {
    setFormData({ ...formData, [name]: time });
  };
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
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  const handleCheckbox = (e) => {
    const { checked } = e.target;
    const data = tableData?.map((ele) => {
      return {
        ...ele,
        IsChecked: checked ? 1 : 0,
      };
    });

    setTableData(data);
  };

  useEffect(() => {
    getAccessCentres();
  }, []);
  const TableData = () => {
    const generatedError = validation();
    if (generatedError === "") {
      setLoading(true);
      const rateTypes = RateTypes.map((item) => {
        return item?.value;
      });
      axiosInstance
        .post("Lab/getReceiptReprint", {
          CentreID: AllDataDropDownPayload(
            formData.CentreID,
            CentreData,
            "value",
          ),
          SelectTypes: formData.SelectTypes,
          ItemValue: formData.ItemValue.trim(),
          RateTypeID:
            formData?.RateTypeID == null || formData?.RateTypeID == ""
              ? rateTypes
              : [formData?.RateTypeID],
          FromDate: moment(formData.FromDate).format("DD/MMM/YYYY"),
          ToDate: moment(formData.ToDate).format("DD/MMM/YYYY"),
          FromTime: formData.FromTime,
          ToTime: formData.ToTime,
          MessageType: formData?.MessageType,
          User: "",
          DoctorReferal: "",
          Status: "All",
          MessageStatus: formData?.MessageStatus,
        })
        .then((res) => {
          const data = res?.data?.message;
          const tabledata = data?.map((ele, index) => {
            return {
              ...ele,
              IsChecked: 0,
              IsError: false,
              Mobile: ele?.Mobile,
              index: index,
            };
          });
          setTableData(tabledata);
          setLoading(false);
        })
        .catch((err) => {
          setTableData([]);
          setLoading(false);
        });
      setErrors(generatedError);
    } else {
      setErrors(generatedError);
    }
  };
  const handleNumber = (e, index) => {
    const { name, value } = e.target;
    const datas = [...tableData];
    datas[index][name] = value;
    setTableData(datas);
  };
  const handleCollection = (e, index) => {
    const { name, checked } = e.target;
    const datas = [...tableData];
    datas[index][name] = checked ? 1 : 0;
    setTableData(datas);
  };
  const handleSave = () => {
    const filteredData = tableData.filter((ele) => ele?.IsChecked);
    if (filteredData.length > 0) {
      const anyError = filteredData.some((item2) =>
        tableData.some(
          (item1) => item1.index === item2.index && item1.Mobile.length < 10,
        ),
      );
      console.log(filteredData);
      setTableData((prevArray1) =>
        prevArray1.map((item1) => {
          const match = filteredData.find(
            (item2) => item2.index === item1.index,
          );
          return match
            ? { ...item1, IsError: item1.Mobile.length < 10 }
            : { ...item1, IsError: false };
        }),
      );
      if (anyError) {
        toast.error("Enter Valid Mobile Number In Selected Rows");
      } else {
        console.log(filteredData);
        toast.success("Success");
      }
    } else {
      const tabledata = tableData?.map((ele) => {
        return {
          ...ele,
          IsError: false,
        };
      });
      setTableData(tabledata);
      toast.error("Please Select Any Row");
    }
  };
  return (
    <>
      <Accordion
        name={"ResendSMS Master"}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row  px-2 mt-2 ">
          <div className="col-md-2">
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
                      onInput={(e) => number(e, 10)}
                    />
                    {errors?.ItemValue && (
                      <div className="error-message">{errors?.ItemValue}</div>
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
                      on
                    />
                    {errors?.ItemValue && (
                      <div className="error-message">{errors?.ItemValue}</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-md-2">
            <SelectBox
              options={AddBlankData(CentreData, "All Centre")}
              selectedValue={formData.CentreID}
              lable="Centre"
              id="Centre"
              name="CentreID"
              onChange={handleSelectChange}
            />
          </div>

          <div className="col-md-2">
            <SelectBox
              options={[{ label: "All RateType", value: "" }, ...RateTypes]}
              lable="RateType"
              id="RateType"
              name="RateTypeID"
              onChange={handleSelectChange}
              selectedValue={formData?.RateTypeID}
            />
          </div>
          <div className="col-md-2">
            <DatePicker
              className="custom-calendar"
              name="FromDate"
              value={formData?.FromDate}
              onChange={dateSelect}
              placeholder=" "
              id="FromDate"
              lable="From Date"
              maxDate={new Date(formData?.ToDate)}
            />
          </div>
          <div className="col-md-1">
            <CustomTimePicker
              name="FromTime"
              placeholder="FromTime"
              value={formData?.FromTime}
              id="FromTime"
              lable="From Time"
              onChange={handleTime}
            />
          </div>
          <div className="col-md-2">
            <DatePicker
              className="custom-calendar"
              name="ToDate"
              value={formData?.ToDate}
              onChange={dateSelect}
              placeholder=" "
              id="ToDate"
              lable="To Date"
              maxDate={new Date()}
              minDate={new Date(formData?.FromDate)}
            />
          </div>
          <div className="col-md-1">
            <CustomTimePicker
              name="ToTime"
              placeholder="ToTime"
              value={formData?.ToTime}
              id="ToTime"
              lable="To Time"
              onChange={handleTime}
            />
          </div>
        </div>
        <div className="row  px-2 mb-1">
          <div className="col-md-3">
            <div className="row">
              <div className="col-md-6 mt-1">
                <input
                  type="radio"
                  name="MessageType"
                  value="Report"
                  id="Report"
                  checked={formData?.MessageType == "Report"}
                  onChange={handleChange}
                />
                &nbsp;
                <label htmlFor="Report">Report Message</label>
              </div>

              <div className="col-md-6 mt-1">
                <input
                  type="radio"
                  name="MessageType"
                  value="Registration"
                  id="Registration"
                  checked={formData?.MessageType == "Registration"}
                  onChange={handleChange}
                />
                &nbsp;
                <label htmlFor="Registration">Registration Message</label>
              </div>
            </div>
          </div>
          <div className="col-md-1">
            <SelectBox
              options={MessageStatus}
              name="MessageStatus"
              lable={t("Message Status")}
              onChange={handleChange}
              selectedValue={formData?.MessageStatus}
            />
          </div>
          <div className="col-md-1">
            <button
              type="button"
              value={"Search"}
              id="btnSearch"
              className="btn btn-block btn-success btn-sm"
              onClick={() => TableData()}
            >
              Search
            </button>
          </div>
        </div>
      </Accordion>
      <Accordion title={t("Search Data")} defaultValue={true}>
        {loading ? (
          <Loading />
        ) : (
          <>
            {" "}
            <div
              style={{
                maxHeight: "380px",
                overflowY: "auto",
              }}
            >
              <div className="p-2">
                <Tables>
                  <thead className="cf">
                    <tr>
                      <th>{"Reg Date"}</th>
                      <th>{"UHID"}</th>
                      <th>{"Visit No"}</th>
                      <th>{"Patient Name"}</th>
                      <th>{"Age/Gender"}</th>
                      <th>{"Centre"}</th>

                      <th>{"RateType"}</th>
                      <th>{"Mobile No"}</th>
                      <th>
                        <input
                          type="checkbox"
                          checked={
                            tableData.length > 0
                              ? isChecked("IsChecked", tableData, "1").includes(
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
                        <td data-title={t("Reg Date")}>{data?.Date}&nbsp;</td>
                        <td data-title={t("UHID")}>
                          {data?.PatientCode}
                          &nbsp;
                        </td>
                        <td data-title={t("Visit No")}>
                          {data?.LedgerTransactionNo}&nbsp;
                        </td>
                        <td data-title={t("Patient Name")}>
                          {`${data?.FirstName} ${data?.MiddleName} ${data?.LastName}`}
                          &nbsp;
                        </td>
                        <td data-title={t("Age/Gender")}>
                          {" "}
                          {data?.Age} / {data?.Gender}&nbsp;
                        </td>
                        <td data-title={t("Centre")}>{data?.Centre}&nbsp;</td>
                        <td data-title={t("RateType")}>
                          {data?.RateType}&nbsp;
                        </td>{" "}
                        <td data-title={t("Mobile")}>
                          {" "}
                          <Input
                            value={data?.Mobile}
                            className={
                              data?.IsError ? "required-fields-active" : ""
                            }
                            type="number"
                            name="Mobile"
                            onChange={(e) => handleNumber(e, index)}
                            onInput={(e) => number(e, 10)}
                            max={10}
                          />
                        </td>
                        <td data-title={t("Status")}>
                          <input
                            type="checkbox"
                            name="IsChecked"
                            checked={data?.IsChecked == 1 ? true : false}
                            onChange={(e) => handleCollection(e, index)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Tables>
              </div>
            </div>
            <div className="row ml-1 mb-2 mt-2">
              <div className="col-sm-1">
                <button
                  className="btn btn-success btn-sm btn-block"
                  onClick={handleSave}
                >
                  {t("Send SMS")}
                </button>
              </div>
              <div className="col-sm-1">
                <button
                  className="btn btn-success btn-sm btn-block"
                  //   onClick={handleSave}
                >
                  {t("Send Whatsapp")}
                </button>
              </div>
            </div>
          </>
        )}
      </Accordion>
    </>
  );
};

export default ResendSMS;
