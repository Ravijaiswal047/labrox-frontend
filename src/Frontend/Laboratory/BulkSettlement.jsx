import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import { getPaymentModes } from "../../utils/NetworkApi/commonApi";
import Heading from "../../components/UI/Heading";
import Accordion from "@app/components/UI/Accordion";
import { PayBy } from "../../utils/Constants";
import { dateConfig, number, Time } from "../../utils/helpers";
import DatePicker from "../../components/formComponent/DatePicker";
import CustomTimePicker from "../../components/formComponent/TimePicker";
import { SelectBox } from "../../components/formComponent/SelectBox";
import Loading from "../../components/loader/Loading";
import { toast } from "react-toastify";
import moment from "moment";
import { axiosInstance } from "../../utils/axiosInstance";
import { useTranslation } from "react-i18next";
import Tables from "../../components/UI/customTable";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { apiUrls } from "../../utils/apiUrls";
import { SaveButton, SearchButton } from "../../components/UI/CustomButton";
const BulkSettlement = () => {
  const { t } = useTranslation();
  const [paymentMode, setPaymentMode] = useState([]);
  const [BankName, setBankName] = useState([]);
  const [load, setLoad] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingSecond, setLoadingSecond] = useState(false);
  const [CentreData, setCentreData] = useState([]);
  const [formTable, setFormTable] = useState([]);
  const [rateTypeList, setRateTypeList] = useState([]);
  const today = new Date();
  const [rateTypeLoading, setRateTypeLoading] = useState(false);

  const [payload, setPayload] = useState({
    FromDate: new Date(),
    ToDate: new Date(),
    // FromTime: new Date(today.setHours(0, 0, 0, 0)),
    // ToTime: new Date(today.setHours(23, 59, 59, 999)),
    FromTime: "00:00:00",
    ToTime: "23:59:59",
    DueAmount: "0",
    CentreID: "",
    rateType: "",
  });

  const getAccessCentres = () => {
    axiosInstance
      .post("Centre/BindCentreWorkOrder", {
        centreID: 0,
        rateTypeID: 0,
      })
      .then((res) => {
        let data = res.data.message;
        let CentreDataValue = data.map((ele) => {
          return {
            value: ele.value,
            label: ele.label,
          };
        });
        CentreDataValue.unshift({ label: "All Centre", value: "" });
        setCentreData(CentreDataValue);
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    getAccessCentres();
  }, []);

  const dateSelect = (value, name) => {
    setPayload({
      ...payload,
      [name]: value,
    });
  };

  const handleSelectChange = (event) => {
    const { name, value } = event.target;
    if (name === "CentreID") {
      getRateTypes(value,true);
      setPayload((prev) => ({
        ...prev,
        CentreID: value,
        rateType: "",
      }));
      return;
    }
    if (name === "PaymentModeID") {
      const data = paymentMode?.find((ele) => value === value);
      setPayload({
        ...payload,
        [name]: data?.value,
        PaymentMode: data?.label,
        CardNo: "",
      });
    } else {
      setPayload({ ...payload, [name]: value });
    }
  };

  const handleTime = (time, name) => {
    setPayload({ ...payload, [name]: time });
  };
  const handleChanges = (e) => {
    const { name, value, checked, type } = e.target;
    setPayload({
      ...payload,
      [name]: type === "checkbox" ? (checked ? "1" : "0") : value,
    });
  };

  const handleChangeIndex = (e, index) => {
    console.log("checked::::");
    const { name, value, type, checked } = e.target;
    const data = [...formTable];
    if (type === "checkbox") {
      if (checked) {
        const { disable, message } = validate(
          data[index]["PaymentMode"],
          index,
        );
        if (!disable) {
          data[index][name] = checked;
        } else {
          toast.error(message);
        }
      } else {
        data[index][name] = checked;
      }
    } else {
      data[index][name] = value;
    }
    setFormTable(data);
  };

  const submit = () => {
    setLoadingSecond(true);
    const data = formTable.filter((ele) => ele?.isChecked === true);
    axiosInstance
      .post("Settlement/SaveBulkSettlementData", {
        SettlementData: data,
      })
      .then((res) => {
        toast.success(res?.data?.message);
        fetch();
        setLoadingSecond(false);
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : err?.data?.message,
        );

        setLoadingSecond(false);
      });
  };

  const fetch = () => {
    setLoading(true);
    axiosInstance
      .post("Settlement/GetBulkDataToSettlement", {
        ...payload,
        FromDate: moment(payload?.FromDate).format("DD/MMM/YYYY"),
        ToDate: moment(payload?.ToDate).format("DD/MMM/YYYY"),

        FromTime: payload?.FromTime,
        ToTime: payload?.ToTime,
      })
      .then((res) => {
        let data = res?.data?.message;
        let val = data.map((ele) => {
          return {
            ...ele,
            isChecked: false,
            PayBy: "0",
            PaymentMode: "",
            TransactionNo: "",
            BankName: "",
            CardNo: "",
            UpdateRemarks: "",
            NewAmount: ele?.DueAmount,
            S_Currency: "1",
            S_Notation: "INR",
            C_Factor: "",
            S_CountryID: "",
            S_Amount: "",
          };
        });
        setFormTable(val);
        setLoading(false);
        setLoad(true);
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

  const handleChangeMap = (e, i) => {
    const data = [...formTable];
    const { name, value } = e.target;
    console.log(e.target);

    if (name === "NewAmount") {
      if (value > data[i]["DueAmount"]) {
        toast.error("please Enter Value Amount");
      } else {
        data[i][name] = value;
        setFormTable(data);
      }
    } else {
      if (name === "PaymentModeID") {
        const findOne = paymentMode.find((ele) => ele.value == value);
        data[i]["PaymentMode"] = findOne?.label;
        data[i]["BankName"] = findOne?.label;
        data[i]["CardNo"] = "";
        data[i]["UpdateRemarks"] = "";
        data[i]["TransactionNo"] = "";
      }

      data[i][name] = value;
      setFormTable(data);
    }
  };

  const HideSave = () => {
    let show = false;
    for (let i = 0; i < formTable.length; i++) {
      if (formTable[i]["isChecked"] === true) {
        show = true;
        break;
      }
    }
    return show;
  };

  const validate = (condition, index) => {
    let disable = false;
    let message = "";
    if (condition === "") {
      disable = true;
      message = "Please Choose Payment Mode";
    } else if (["Paytm", "Online Payment"].includes(condition)) {
      if (formTable[index]["TransactionNo"].length < 10) {
        disable = true;
        message = "Please Fill Correct Transaction Number";
      }
    } else if (["Debit Card", "Credit Card", "Cheque"].includes(condition)) {
      if (formTable[index]["BankName"] === "") {
        disable = true;
        message = "Please Choose BankName";
      } else if (formTable[index]["CardNo"].length < 16) {
        disable = true;
        message = `Please Enter Valid ${condition} Number`;
      }
    }

    return {
      disable: disable,
      message: message,
    };
  };

  const handleReactSelectChange = (name, option) => {
    setPayload((prev) => ({ ...prev, [name]: option?.value }));
  };

  const getRateTypes = async (id, showLoader = false) => {
    if (showLoader) setRateTypeLoading(true);
    try {
      const res = await axiosInstance.post("Centre/BindRateTypeWorkOrderSearch", {
        centreID: id || 0,
        rateTypeID: 0,
        AllowEstimate: 0,
        CentreType: "",
        AllowHomeCollection: 0,
        AllowMembershipCard: 0,
        PageName: "YES",
      });
      const list = res?.data?.message.map((item) => ({
        label: item?.RateTypeName.replace(/\r?\n/g, " ").trim(),
        value: item?.RateTypeID,
      }));
      setRateTypeList(list);
    } catch (err) {
      console.log(err);
      if (showLoader) setRateTypeLoading(false);
    } finally {
      if (showLoader) setRateTypeLoading(false);
    }
  };

  useEffect(() => {
    getPaymentModes("PaymentMode", setPaymentMode);
    getPaymentModes("BankName", setBankName);
    getRateTypes()
  }, []);

  return (
    <>
      <Accordion
        name={t("Bulk Settlement")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row  px-2 mt-2 mb-1 mt-1">
          <div className="col-sm-2">
            <SelectBox
              options={CentreData}
              id="CentreID"
              lable="Centre"
              selectedValue={payload?.CentreID}
              name="CentreID"
              onChange={handleSelectChange}
            />
          </div>
          <div className="col-sm-2">
            <ReactSelect
              dynamicOptions={rateTypeList}
              value={payload?.rateType}
              onChange={handleReactSelectChange}
              placeholderName={t("Rate Type")}
              name={"rateType"}
              id={"rateType"}
              removeIsClearable={true}
              isLoading={rateTypeLoading}
            />
          </div>
          <div className="col-sm-2">
            <DatePicker
              name="FromDate"
              id="FromDate"
              lable="FromDate"
              value={payload?.FromDate}
              onChange={dateSelect}
              maxDate={new Date(payload?.ToDate)}
            />
          </div>
          <div className="col-sm-1">
            <CustomTimePicker
              name="FromTime"
              placeholder="FromTime"
              value={payload?.FromTime}
              id="FromTime"
              lable="FromTime"
              onChange={handleTime}
            />
          </div>

          <div className="col-sm-2 ">
            <div>
              <DatePicker
                className="custom-calendar"
                name="ToDate"
                value={payload?.ToDate}
                onChange={dateSelect}
                placeholder=" "
                id="ToDate"
                lable="ToDate"
                maxDate={new Date()}
                minDate={new Date(payload?.FromDate)}
              />
            </div>
          </div>
          <div className="col-sm-1">
            <CustomTimePicker
              name="ToTime"
              placeholder="ToTime"
              value={payload?.ToTime}
              id="ToTime"
              lable="ToTime"
              onChange={handleTime}
            />
          </div>

          <div className="col-sm-1 mt-2">
            <input
              name="DueAmount"
              type="checkbox"
              checked={payload?.DueAmount == "1" ? true : false}
              onChange={handleChanges}
            />
            <label className="control-label ml-2" htmlFor="DueAmount">
              {t("Due Patient")}
            </label>
          </div>

          <div className="col-sm-1">
            <SearchButton
              text={"Search"}
              onClick={fetch}
            />
          </div>
        </div>
      </Accordion>
      <Accordion title={t("Search Data")} defaultValue={true}>
        {loading ? (
          <Loading />
        ) : (
          load && (
            <div className="p-2">
              <div
                style={{
                  maxHeight: "400px",
                  overflowY: "auto",
                }}
              >
                <Tables>
                  <thead className="cf text-center">
                    <tr>
                      <th>{t("S.No")}</th>
                      <th>{t("RegDate")}</th>
                      <th>{t("Lab Number")}</th>
                      <th>{t("Patient Name")}</th>
                      <th>{t("Centre")}</th>
                      <th>{t("RateType")}</th>
                      <th>{t("Gross Amount")}</th>
                      <th>{t("Discount Amount")}</th>
                      <th>{t("Net Amount")}</th>
                      <th>{t("Paid Amount")}</th>
                      <th>{t("Due Amount")}</th>
                      <th>{t("#")}</th>
                    </tr>
                  </thead>
                  {formTable.length > 0 && (
                    <tbody>
                      {formTable.map((ele, index) => (
                        <>
                          <tr key={index}>
                            <td data-title={t("S.No")}>{index + 1}&nbsp;</td>
                            <td data-title={t("RegDate")}>
                              {dateConfig(ele?.RegDate)}&nbsp;
                            </td>
                            <td data-title={t("Lab Number")}>
                              {ele.LedgerTransactionNo}&nbsp;
                            </td>
                            <td data-title={t("Patient Name")}>
                              {ele?.PName}&nbsp;
                            </td>
                            <td data-title={t("Centre")}>{ele.Centre}&nbsp;</td>
                            <td data-title={t("RateType")}>
                              {ele.RateType}&nbsp;
                            </td>
                            <td data-title={t("Gross Amount")}>
                              {ele.Rate}&nbsp;
                            </td>
                            <td data-title={t("Discount Amount")}>
                              {ele.DiscAmt}&nbsp;
                            </td>
                            <td data-title={t("Net Amount")}>
                              {ele.Amount}&nbsp;
                            </td>
                            <td data-title={t("Paid Amount")}>
                              {ele.PaidAmount}&nbsp;
                            </td>
                            <td data-title={t("Due Amount")}>
                              {ele.DueAmount}&nbsp;
                            </td>
                            <td data-title={t("#")}>
                              <input
                                type="checkbox"
                                name="isChecked"
                                checked={ele?.isChecked}
                                onChange={(e, _) => handleChangeIndex(e, index)}
                              ></input>
                            </td>
                          </tr>
                          <tr>
                            <td colSpan={12}>
                              <div className="row">
                                <div className="col-sm-2">
                                  <div>
                                    <SelectBox
                                      className="form-control input-sm required"
                                      name="PayBy"
                                      options={[
                                        { label: "Pay By", value: "" },
                                        ...PayBy,
                                      ]}
                                      selectedValue={ele?.PayBy}
                                      onChange={(e) => {
                                        handleChangeMap(e, index);
                                      }}
                                    ></SelectBox>
                                  </div>
                                </div>

                                <div className="col-sm-2">
                                  <div>
                                    <input
                                      name="NewAmount"
                                      type="number"
                                      placeholder={t("DueAmount")}
                                      onInput={(e) => {
                                        number(
                                          e,
                                          String(ele?.DueAmount).length,
                                        );
                                      }}
                                      value={ele?.NewAmount}
                                      onChange={(e) => {
                                        handleChangeMap(e, index);
                                      }}
                                    />
                                  </div>
                                </div>

                                <div className="col-sm-2">
                                  <div>
                                    <SelectBox
                                      className="form-control input-sm required"
                                      name="PaymentModeID"
                                      options={[
                                        { label: "Payment Mode", value: "" },
                                        ...paymentMode,
                                      ]}
                                      selectedValue={ele?.PaymentModeID}
                                      onChange={(e) => {
                                        handleChangeMap(e, index);
                                      }}
                                    ></SelectBox>
                                  </div>
                                </div>

                                {[
                                  "Cheque",
                                  "Credit Card",
                                  "Debit Card",
                                ].includes(ele?.PaymentMode) && (
                                    <div className="col-sm-2">
                                      <div>
                                        <SelectBox
                                          className="form-control input-sm"
                                          name="BankName"
                                          options={[
                                            { label: "BankName", value: "" },
                                            ...BankName,
                                          ]}
                                          selectedValue={ele?.BankName}
                                          onChange={(e) => {
                                            handleChangeMap(e, index);
                                          }}
                                        ></SelectBox>
                                      </div>
                                    </div>
                                  )}

                                {["Cheque"].includes(ele?.PaymentMode) && (
                                  <div className="col-sm-2">
                                    <div>
                                      <input
                                        name="CardNo"
                                        type="text"
                                        placeholder={t("Cheque No")}
                                        value={ele?.CardNo}
                                        onChange={(e) => {
                                          handleChangeMap(e, index);
                                        }}
                                        max={16}
                                      />
                                    </div>
                                  </div>
                                )}

                                {["Credit Card", "Debit Card"].includes(
                                  ele?.PaymentMode,
                                ) && (
                                    <div className="col-sm-2">
                                      <div>
                                        <input
                                          name="CardNo"
                                          placeholder={t("Card No")}
                                          type="text"
                                          value={ele?.CardNo}
                                          max={16}
                                          onChange={(e) => {
                                            handleChangeMap(e, index);
                                          }}
                                        />
                                      </div>
                                    </div>
                                  )}

                                {["Online Payment", "Paytm"].includes(
                                  ele?.PaymentMode,
                                ) && (
                                    <div className="col-sm-2">
                                      <div>
                                        <input
                                          name="TransactionNo"
                                          type="text"
                                          placeholder={t("Transaction No")}
                                          value={ele?.TransactionNo}
                                          onChange={(e) => {
                                            handleChangeMap(e, index);
                                          }}
                                          max={16}
                                        />
                                      </div>
                                    </div>
                                  )}

                                <div className="col-sm-2">
                                  <div>
                                    <input
                                      name="UpdateRemarks"
                                      placeholder={t("Remark")}
                                      type="text"
                                      value={ele?.UpdateRemarks}
                                      onChange={(e) => {
                                        handleChangeMap(e, index);
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        </>
                      ))}
                    </tbody>
                  )}
                </Tables>
              </div>
              {HideSave() &&
                (loadingSecond ? (
                  <Loading />
                ) : (
                  <div className="col-sm-2 mt-2">
                    <SaveButton
                      text={"Save"}
                      onClick={submit}
                    />
                  </div>
                ))}
            </div>
          )
        )}{" "}
      </Accordion>
    </>
  );
};

export default BulkSettlement;
