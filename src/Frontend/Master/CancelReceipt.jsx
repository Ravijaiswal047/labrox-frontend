import moment from "moment";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import {
  AddBlankData,
  AllDataDropDownPayload,
  number,
  Time,
} from "../../utils/helpers";
import {
  getAccessCentres,
  getAccessRateType,
} from "../../utils/NetworkApi/commonApi";
import { axiosInstance } from "../../utils/axiosInstance";
import Accordion from "@app/components/UI/Accordion";
import { SelectBox } from "../../components/formComponent/SelectBox";
import Input from "../../components/formComponent/Input";
import DatePicker from "../../components/formComponent/DatePicker";
import TimePicker from "../../components/formComponent/TimePicker";
import { SearchBy } from "../../utils/Constants";
import Loading from "../../components/loader/Loading";
import Tables from "../../components/UI/customTable";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { Dialog } from "primereact/dialog";
import { Button, Form } from "react-bootstrap";
import "./Master.css";
import { notify } from "../../utils/utils";
import { SaveButton, SearchButton } from "../../components/UI/CustomButton";
import ColorCodingSearch from "../../components/ModalComponent/ColorCodingSearch";
const CancelReceipt = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [RateData, setRateData] = useState([]);
  const [receiptData, setReceiptData] = useState([]);
  const theme = useLocalStorage("theme", "get");
  const [CentreData, setCentreData] = useState([]);
  const isMobile = window.innerWidth <= 768;
  const [cancelReasonModal, setCancelResonModal] = useState({
    reason: "",
    reasonModalOpen: false,
  });
  const [searchText, setSearchText] = useState("");
  const [activeColorFilter, setActiveColorFilter] = useState(null);
  const colorCodingData = [
    { color: "#ffffff", id: "1", labelKey: "Not Cancelled", value: 0 },
    { color: "#f5c6cb", id: "2", labelKey: "Cancelled", value: 1 },
  ];
  const handleColorFilterClick = (value) => {
    setActiveColorFilter((prev) => (prev === value ? null : value));
  };
  const today = new Date();
  const [formData, setFormData] = useState({
    FromDate: new Date(),
    ToDate: new Date(),
    CentreID: "",
    ItemValue: "",
    RateID: "",
    SelectTypes: "",
    FromTime: "00:00:00",
    ToTime: "23:59:59",
    // FromTime: new Date(today.setHours(0, 0, 0, 0)),
    // ToTime: new Date(today.setHours(23, 59, 59, 999)),
    DoctorReferal: "",
    DoctorName: "",
    User: "",
    Status: "",
  });
  const handleSelectChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const TableData = (Status) => {
    setLoading(true);
    axiosInstance
      .post("Lab/getCancelReceiptData", {
        CentreID: formData.CentreID ? [formData.CentreID] : [],
        // AllDataDropDownPayload(
        //   formData.CentreID,
        //   CentreData,
        //   "value"
        // ),
        SelectTypes: formData.SelectTypes,
        ItemValue: formData.ItemValue.trim(),
        RateTypeID: formData.RateID ? [formData.RateID] : [],
        // RateTypeID: Array.isArray(formData.RateID) ? formData.RateID : [],
        DoctorReferal: formData.DoctorReferal,
        FromDate: moment(formData.FromDate).format("DD/MMM/YYYY"),
        ToDate: moment(formData.ToDate).format("DD/MMM/YYYY"),

        FromTime: formData.FromTime,
        ToTime: formData.ToTime,
        User: formData?.User,
        Status: Status,
      })
      .then((res) => {
        if (res?.data?.success) {
          setReceiptData(res?.data?.message);
        } else {
          setReceiptData([]);
          toast.error(res?.data?.message);
        }
        setLoading(false);
      })
      .catch((err) => {
        setReceiptData([]);
        setLoading(false);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleChangeNew = (e, index) => {
    const { name, checked } = e.target;
    if (index >= 0) {
      const data = [...receiptData];
      data[index][name] = checked;
      setReceiptData(data);
    } else {
      const data = receiptData?.map((ele) => {
        return {
          ...ele,
          isChecked: checked,
        };
      });
      setReceiptData(data);
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
  useEffect(() => {
    getAccessCentres(setCentreData);
    getAccessRateType(setRateData);
  }, []);

  const filteredData = useMemo(() => {
    let data = receiptData;

    if (activeColorFilter !== null) {
      data = data.filter(
        (item) => Number(item?.IsCancel ? 1 : 0) === activeColorFilter,
      );
    }

    if (searchText) {
      const search = searchText.toLowerCase();
      data = data.filter(
        (item) =>
          item?.PName?.toLowerCase().includes(search) ||
          item?.VisitNo?.toString().toLowerCase().includes(search) ||
          item?.Mobile?.toString().toLowerCase().includes(search) ||
          item?.RateTypeName?.toLowerCase().includes(search) ||
          item?.CentreName?.toLowerCase().includes(search) ||
          item?.CreatedByName?.toLowerCase().includes(search) ||
          item?.ReceiptType?.toLowerCase().includes(search) ||
          item?.CancelReason?.toLowerCase().includes(search),
      );
    }

    return data;
  }, [receiptData, searchText, activeColorFilter]);

  const handleSave = () => {
    handleReasonModal(true);
    return;
  };

  const handleReasonModal = (visible) => {
    setCancelResonModal((prev) => ({ ...prev, reasonModalOpen: visible }));
  };

  const handleSubmitFinal = () => {
    if (!cancelReasonModal?.reason) {
      notify("Reason is  required.", "error");
      return;
    }
    setLoading(true);
    const UpdateData = receiptData?.filter((ele) => ele?.isChecked === true);
    if (UpdateData.length === 0) {
      toast.error("Please select at least one checkbox");
      setLoading(false);
      return;
    }

    const SaveData = UpdateData?.map((ele) => {
      return {
        ledgerTransactionNo: String(ele?.VisitNo),
        amount: Number(ele?.GrossAmount),
        receiptNo: String(ele?.ReceiptNo),
        receiptType: String(ele?.ReceiptType),
        cancelReason: cancelReasonModal?.reason,
        LedgertransactionIDHash: ele?.LedgertransactionIDHash,
      };
    });
    axiosInstance
      .post("Lab/UpdateReceiptData", { SaveData: SaveData })
      .then((res) => {
        toast.success(res?.data?.message);
        setLoading(false);
        TableData();
        handleReasonModal(false);
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Something Went Wrong",
        );
        setLoading(false);
      });
  };

  return (
    <>
      <Accordion
        name={t("Cancel Receipt")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row pt-2 pl-2 pr-2 mt-1">
          <div className="col-sm-2">
            <div className="d-flex" style={{ display: "flex" }}>
              <div style={{ width: "40%" }}>
                <SelectBox
                  options={SearchBy}
                  id="SelectTypes"
                  lable="SelectTypes"
                  selectedValue={formData.SelectTypes}
                  name="SelectTypes"
                  onChange={handleSelectChange}
                />
              </div>
              <div style={{ width: "60%" }}>
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
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="col-sm-2">
            <SelectBox
              options={AddBlankData(CentreData, "All Centre")}
              id="Centre"
              lable="Centre"
              selectedValue={formData.CentreID}
              name="CentreID"
              onChange={handleSelectChange}
            />
          </div>
          <div className="col-sm-2">
            <SelectBox
              options={[{ label: "All Rate Type", value: "" }, ...RateData]}
              id="Rate"
              lable={t("Rate Type")}
              selectedValue={formData.RateID}
              name="RateID"
              onChange={handleSelectChange}
            />
          </div>
          <div className="col-sm-2">
            <div>
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
          </div>
          <div className="col-sm-1">
            <TimePicker
              name="FromTime"
              placeholder="FromTime"
              value={formData?.FromTime}
              id="FromTime"
              lable="FromTime"
              onChange={handleTime}
            />
          </div>
          <div className="col-sm-2">
            <div>
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
          </div>
          <div className="col-sm-1">
            <TimePicker
              name="ToTime"
              placeholder="ToTime"
              value={formData?.ToTime}
              id="ToTime"
              lable="ToTime"
              onChange={handleTime}
            />
          </div>
        </div>
        <div className="row pt-1 pl-2 pr-2">
          <div className="col-sm-1 pb-2">
            <SearchButton
              text={"Search"}
              value={t("Search")}
              id="btnSearch"
              className="btn btn-block btn-info btn-sm input-sm"
              onClick={() => TableData("All")}
            />
          </div>
        </div>
      </Accordion>
      <Accordion
        title={t("Search Data")}
        defaultValue={true}
        notOpen={true}
        className="mm-search-accordion"
        seconTitle={
          <div className="d-flex align-items-center" style={{ gap: "5px" }}>
            <div className="d-none d-md-flex" style={{ gap: "5px" }}>
              {colorCodingData.map(({ color, labelKey, id, value }) => (
                <div
                  key={id}
                  style={{
                    cursor: "pointer",
                    opacity:
                      activeColorFilter === null || activeColorFilter === value
                        ? 1
                        : 0.4,
                  }}
                  onClick={(e) => {
                    // e.stopPropagation();
                    handleColorFilterClick(value);
                  }}
                  title={
                    activeColorFilter === value
                      ? `Remove ${t(labelKey)} filter`
                      : `Show only ${t(labelKey)}`
                  }
                >
                  <ColorCodingSearch color={color} label={t(labelKey)} />
                </div>
              ))}
            </div>
            <div onClick={(e) => e.stopPropagation()}>
              <Input
                type="text"
                placeholder="Search..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>
        }
      >
      {loading ? (
        <Loading />
      ) : (
        <>
          {filteredData?.length > 0 ? (
            <>
              <Tables>
                <thead>
                  <tr>
                    <th>{t("S.No")}</th>
                    <th>{t("Reg Date")}</th>
                    <th>{t("RateType")}</th>
                    <th>{t("BarcodeNo")}</th>
                    <th>{t("Visit No")}</th>
                    <th>{t("Patient Name")}</th>
                    {/* <th>{t("Age/Gender")}</th>
                    <th>{t("Mobile No")}</th> */}
                    <th>{t("Gross | Dist | Net Amt")}</th>
                    {/* <th>{t("Dis Amt")}</th>
                    <th>{t("Net Amt")}</th> */}
                    <th>{t("Due Amt")}</th>
                    <th>{t("Paid Amt")}</th>
                    <th>{t("Centre")}</th>
                    <th>{t("User")}</th>
                    <th>{t("Receipt Type")}</th>
                    <th>{t("CancelBy CancelDate")}</th>
                    <th>{t("CancelReason")}</th>
                    <th>{t("Cancel")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData?.map((ele, index) => (
                    <tr
                      key={index}
                      style={{
                        backgroundColor: ele?.IsCancel ? "#f7abb3" : "#ffffff",
                      }}
                    >
                      <td data-title={t("S.No")}>{index + 1}&nbsp;</td>
                      <td data-title={t("Reg Date")}>
                        {ele?.EntryDateTime}&nbsp;
                      </td>
                      <td data-title={t("RateType")}>
                        <p title={ele?.RateTypeName}>
                          {ele?.RateTypeName?.length > 30
                            ? ele?.RateTypeName?.slice(0, 30) + "..."
                            : ele?.RateTypeName}
                        </p>
                        &nbsp;
                      </td>
                      <td data-title={t("BarcodeNos")}>{ele?.BarcodeNos}&nbsp;</td>
                      <td data-title={t("Visit No")}>{ele?.VisitNo}&nbsp;</td>
                      <td data-title={t("Patient Name")}>
                        <p className="mb-0">Name: {`${ele?.PName || ""}`}</p>
                        <p className="mb-0">
                          Age: {ele?.Age} / {ele?.Gender}&nbsp;
                        </p>
                        <p className="mb-0">Mobile: {ele?.Mobile || "-"}</p>
                        &nbsp;
                      </td>
                      {/* <td data-title={t("Age/Gender")}>
                        {" "}
                        {ele?.Age} / {ele?.Gender}&nbsp;
                      </td> */}
                      {/* <td data-title={t("Mobile No")}>{ele?.Mobile}&nbsp;</td> */}
                      <td data-title={t("Gross Amt")}>
                        <p className="mb-0">Gross Amt: {ele?.GrossAmount}</p>
                        <p className="mb-0">
                          Dist. Amt: {ele?.DiscountOnTotal?.toFixed(2)}
                        </p>
                        <p className="mb-0">
                          Net. Amt: {ele?.NetAmount?.toFixed(2)}
                        </p>
                      </td>
                      {/* <td data-title={t("Dis Amt")}>
                        {ele?.DiscountOnTotal?.toFixed(2)}&nbsp;
                      </td>
                      <td data-title={t("Net Amt")}>{ele?.NetAmount}&nbsp;</td> */}
                      <td data-title={t("Due Amt")}>{ele?.DueAmount}&nbsp;</td>
                      <td data-title={t("Paid Amt")}>
                        {ele?.PaidAmount}&nbsp;
                      </td>
                      <td data-title={t("Centre")}>{ele?.CentreName}&nbsp;</td>
                      <td data-title={t("User")}>{ele?.CreatedByName}&nbsp;</td>
                      <td data-title={t("ReceiptType")}>
                        {ele?.ReceiptType}&nbsp;
                      </td>
                      <td data-title={t("CancelBy")}>
                        <div>
                          <p className="mb-0">
                            CancelBy: {ele?.CancelUserName || "N/A"}
                          </p>
                          <p className="mb-0">
                            CancelTime: {ele?.CancelDateTime || "N/A"}
                          </p>
                        </div>{" "}
                        &nbsp;
                      </td>
                      <td data-title={t("CancelReason")}>
                        <p title={ele?.CancelReason}>
                          {ele?.CancelReason?.length > 30
                            ? ele?.CancelReason?.slice(0, 30) + "..."
                            : ele?.CancelReason}
                        </p>
                        &nbsp;
                      </td>
                      <td data-title={t("Action")}>
                        <input
                          type="checkbox"
                          checked={ele?.isChecked}
                          name="isChecked"
                          disabled={!!ele?.IsCancel}
                          onChange={(e) =>
                            handleChangeNew(e, receiptData.indexOf(ele))
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Tables>
              <div
                className="row"
                style={{
                  position: "sticky",
                  bottom: -2,
                  marginTop: "3px",
                }}
              >
                <div
                  className="col-sm-2"
                  //   style={{ marginBottom: "6px", marginTop: "6px" }}
                >
                  <SaveButton
                    text={"Save"}
                     onClick={handleSave}
                  />
                </div>
              </div>
            </>
          ) : (
            <NoRecordFound />
          )}
        </>
      )}
      </Accordion>
      <Dialog
        header="Enter Cancel Reason"
        onHide={() => handleReasonModal(false)}
        top={"100px"}
        visible={cancelReasonModal?.reasonModalOpen}
        className={theme}
        style={{ width: isMobile ? "80vw" : "50vw" }}
      >
        <div className="d-flex flex-column align-items-center">
          <Form className="w-100">
            <Form.Group
              className="mb-3"
              controlId="exampleForm.ControlTextarea1"
            >
              <Form.Label>Enter Reason: </Form.Label>
              <Form.Control
                value={cancelReasonModal?.reason}
                onChange={(e) =>
                  setCancelResonModal((prev) => ({
                    ...prev,
                    reason: e?.target?.value,
                  }))
                }
                className="teaxtArea"
                as="textarea"
                rows={3}
              />
            </Form.Group>
          </Form>
          <SaveButton
            text={"Submit"}
            onClick={handleSubmitFinal}
             className="px-3"
          />
        </div>
      </Dialog>
    </>
  );
};

export default CancelReceipt;
