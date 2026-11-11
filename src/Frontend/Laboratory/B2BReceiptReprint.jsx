import React, { useEffect, useMemo, useState } from "react";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { Tooltip } from "primereact/tooltip";
import { axiosInstance } from "../../utils/axiosInstance";
import {
  AddBlankData,
  AllDataDropDownPayload,
  Time,
  autocompleteOnBlur,
  getMaxToDate,
  number,
  shouldIncludeAIIMSID,
} from "../../utils/helpers";
import {
  BindEmployeeReports,
  getCollectionBoy,
  getDoctorSuggestion,
  getPaymentModes,
  getSearchController,
} from "../../utils/NetworkApi/commonApi";
import { defaultSearchTypes, Record, SearchBy } from "../../utils/Constants";
import Input from "../../components/formComponent/Input";
import { SelectBox } from "../../components/formComponent/SelectBox";
import DatePicker from "../../components/formComponent/DatePicker";
import CustomTimePicker from "../../components/formComponent/TimePicker";
import Loading from "../../components/loader/Loading";
import Heading from "../../components/UI/Heading";
import Accordion from "@app/components/UI/Accordion";
import MedicialModal from "../utils/MedicialModal";
import UploadFile from "../utils/UploadFileModal/UploadFile";
import { useTranslation } from "react-i18next";
import ReceiptReprintTable from "../Table/ReceiptReprintTable";
import Pagination from "../../Pagination/Pagination";
import ReceiptReprintFilter from "./ReceiptReprintFilter";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { SearchButton } from "../../components/UI/CustomButton";
import { Form } from "react-bootstrap";
import { current } from "@reduxjs/toolkit";
import ReprintModal from "./ReprintModal";

const B2BReceiptReprint = () => {
  const [columnConfig, setColumnConfig] = useState([]);
  const [RateTypes, setRateTypes] = useState([]);
  const [CentreData, setCentreData] = useState([]);
  const [user, SetUser] = useState([]);
  const [receiptData, setReceiptData] = useState([]);
  const [receiptAmout, setRecieptAmout] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const {
    EmployeeID,
    ShowRePrintTotal,
    HideRePrintColorCode,
    ShowAllCheckBarcodeOption,
    ShowDefaultLoginCentre,
    ShowUserFilterAtReprint,
    MaxDateRangeatResultEntry
  } = useLocalStorage("userData", "get");
  const maxRange = Number(MaxDateRangeatResultEntry) || 15;
  const DefaultCentre = useLocalStorage("DefaultCentre", "get");
  const hideRate = useLocalStorage("userData", "get")?.HideRate;
  const { RateTypeID, DoctorId } = useLocalStorage("userData", "get");
  const [doctorSuggestion, setDoctorSuggestion] = useState([]);
  const [indexMatch, setIndexMatch] = useState(0);
  const [t] = useTranslation();
  const [Identity, setIdentity] = useState([]);
  const [dropFalse, setDropFalse] = useState(true);
  const [proEmployee, setProEmployee] = useState([]);
  const [collectionBoy, setCollectionBoy] = useState();
  const [collectionBoyList, setCollectionBoyList] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  let isTrueCheckBarcodeOption =
    ShowAllCheckBarcodeOption == 1 && defaultSearchTypes == "BarcodeNo";
  const [checkBarcodeOption, setCheckBarcodeOption] = useState(
    isTrueCheckBarcodeOption,
  );
  const [currentStatus, setCurrentStatus] = useState("All");
  const [state, setState] = useState({
    ProEmployee: "",
  });

  // ── Dynamic Controller State ──────────────────────────────────────────────
  const [controllerDynamicList, setControllerDynamicList] = useState([]);
  const [tabbingOrder, setTabbingOrder] = useState([]);

  // ✅ FIX: FilterData sirf columns config ke liye (TypeId 1 & 2) — rows ke liye nahi!
  const [FilterData, setFilterData] = useState([]);

  // ✅ NEW: Search rows ke liye alag state
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredReceiptData, setFilteredReceiptData] = useState([]);

  const [show4, setShow4] = useState({
    modal: false,
    data: "",
    index: -1,
  });
  const [show5, setShow5] = useState({
    modal: false,
    data: "",
    index: -1,
  });
  const [show6, setShow6] = useState({
    modal: false,
    data: "",
    index: -1,
  });
  const navigate = useNavigate();
  const today = new Date();
  const [formData, setFormData] = useState({
    FromDate: new Date(),
    ToDate: new Date(),
    CentreID: "",
    ItemValue: "",
    RateTypeID: "",
    SelectTypes: defaultSearchTypes || "",
    FromTime: "00:00:00",
    ToTime: "23:59:59",
    DoctorReferal: "",
    DoctorName: "",
    User: "",
    Status: "",
  });
  const [pageSize, setPageSize] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [reprintResponse, setReprintResponse] = useState(null);

  console.log(reprintResponse, "reprintResponse");

  const paginationShow = useMemo(() => {
    return totalCount > 0 ? true : false;
  }, [receiptData]);

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

  const handleListSearch = (data, name) => {
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
      default:
        break;
    }
  };

  const handleKeyDown = (e) => {
    if (e?.key === "Enter") {
      setCurrentPage(1);
      setCurrentStatus("All");
      TableData("All", 1);
    }
  };

  const handleToggleChange = (e) => {
    const { checked } = e.target;
    setCheckBarcodeOption(checked);
  };

  const handleSearchSelectChange = (label, value) => {
    if (label === "CentreID") {
      setFormData({ ...formData, [label]: value?.value, RateTypeID: "" });
      setRateTypes([]);
      if (value?.value == "") {
        fetchRateTypes(CentreData.map((ele) => ele.value));
      } else {
        fetchRateTypes([value?.value]);
      }
    } else if (label === "User") {
      setFormData({ ...formData, ["User"]: String(value?.value) });
    } else {
      setFormData({ ...formData, [label]: value?.value });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === "DoctorName") {
      setDropFalse(true);
    }
    if (name == "SelectTypes" && value !== "BarcodeNo") {
      setCheckBarcodeOption(false);
    }
    if (
      name == "SelectTypes" &&
      value === "BarcodeNo" &&
      ShowAllCheckBarcodeOption == 1
    ) {
      setCheckBarcodeOption(true);
    }
  };

  const dateSelect = (value, name) => {
    if (name === "FromDate") {
      const newFrom = new Date(value);

      const maxAllowedTo = new Date(newFrom);
      maxAllowedTo.setDate(maxAllowedTo.getDate() + maxRange);

      const today = new Date();
      const finalMaxTo = maxAllowedTo > today ? today : maxAllowedTo;

      let updatedToDate = formData.ToDate;

      // Case 1: ToDate < FromDate
      if (new Date(updatedToDate) < newFrom) {
        updatedToDate = finalMaxTo;
      }

      // Case 2: ToDate > allowed range
      if (new Date(updatedToDate) > finalMaxTo) {
        updatedToDate = finalMaxTo;
      }

      setFormData((prev) => ({
        ...prev,
        FromDate: value,
        ToDate: updatedToDate
      }));

      return;
    }
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const TableData = (Status = currentStatus, page = currentPage) => {
    setLoading(true);
    const rateTypes = RateTypes.map((item) => {
      return item?.value;
    });
    axiosInstance
      .post("AdvanceB2B/getReceiptReprint", {
        ShowAllCheckBarcodeOption: checkBarcodeOption ? 1 : 0,
        CentreID: formData.CentreID ? [Number(formData.CentreID)] : [],
        CollectionBoyID: Number(collectionBoy || 0),
        SelectTypes: formData.SelectTypes,
        ItemValue: formData.ItemValue.trim(),
        RateTypeID: formData?.RateTypeID ? [Number(formData?.RateTypeID)] : [],
        DoctorReferal: formData.DoctorReferal,
        FromDate: moment(formData.FromDate).format("DD/MMM/YYYY"),
        ToDate: moment(formData.ToDate).format("DD/MMM/YYYY"),
        FromTime: formData.FromTime,
        ToTime: formData.ToTime,
        User: formData?.User,
        Status: Status,
        ProEmployeeID: Number(state?.ProEmployee || 0),
        pageNumber: page || 1,
        pageSize: pageSize,
      })
      .then((res) => {
        const data = res?.data?.message;
        setReceiptData(data);
        setRecieptAmout(res?.data?.data);
        setFilteredReceiptData(data);
        setSearchTerm("");
        setTotalCount(res?.data?.data?.totalRecords || 0);
        setLoading(false);
      })
      .catch((err) => {
        setReceiptData([]);
        setFilteredReceiptData([]);
        setLoading(false);
      });
  };

  const handleReactSelectChange = (name, option) => {
    setCollectionBoy(option?.value);
  };

  const handleIndex = (e) => {
    switch (e.which) {
      case 38:
        if (doctorSuggestion.length > 0) {
          if (indexMatch !== 0) {
            setIndexMatch(indexMatch - 1);
          } else {
            setIndexMatch(doctorSuggestion.length - 1);
          }
          setTimeout(() => {
            const el = document.querySelector(".matchIndex");
            if (el) el.scrollIntoView({ block: "nearest" });
          }, 0);
        }
        break;
      case 40:
        if (doctorSuggestion.length > 0) {
          if (doctorSuggestion.length - 1 === indexMatch) {
            setIndexMatch(0);
          } else {
            setIndexMatch(indexMatch + 1);
          }
          setTimeout(() => {
            const el = document.querySelector(".matchIndex");
            if (el) el.scrollIntoView({ block: "nearest" });
          }, 0);
        }
        break;
      case 13:
        if (doctorSuggestion.length > 0 && doctorSuggestion[indexMatch]) {
          handleListSearch(doctorSuggestion[indexMatch], "DoctorName");
        }
        setIndexMatch(0);
        break;
      default:
        break;
    }
  };

  const handleUploadCount = (name, value, secondName) => {
    let data = [...receiptData];
    if (name === "UploadDocumentCount") {
      data[show5?.index][name] = value;
      data[show5?.index][secondName] = value === 0 ? 0 : 1;
      setReceiptData(data);
    } else {
      data[show4?.index][name] = value;
      data[show4?.index][secondName] = value === 0 ? 0 : 1;
      setReceiptData(data);
    }
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
      if (list?.length === 1) {
        setFormData((prev) => ({ ...prev, RateTypeID: list?.[0]?.value }));
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleProEmployeeChange = (name, e) => {
    setState((prev) => ({ ...prev, [name]: e?.value }));
  };

  const getProEmployee = () => {
    axiosInstance
      .get("Employee/ProEmployee")
      .then((res) => {
        let data = res?.data?.message;
        let proData = data?.map((ele) => {
          return {
            value: ele?.EmployeeID,
            label: ele?.EmployeeName,
          };
        });
        setProEmployee(proData);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // ── isHideController ──────────────────────────────────────────────────────
  const isHideController = (cntrId = "") => {
    if (!controllerDynamicList?.length) return true;
    const isPresent = controllerDynamicList?.find(
      (x) => x?.ControlDisplayID === cntrId,
    );
    if (isPresent?.ControlDisplayID) {
      return !!controllerDynamicList?.find(
        (x) => x?.ControlDisplayID === cntrId,
      )?.IsShow;
    }
    return true;
  };

  // ── Dynamic Controller Fetch ──────────────────────────────────────────────
  const controllerDynamic = async () => {
    try {
      let pageID = 1019;
      const { controllersData, controllerTabbingOrder } =
        await getSearchController(pageID);

      setTabbingOrder(controllerTabbingOrder);
      setControllerDynamicList(controllersData);

      if (Array.isArray(controllersData)) {
        setFilterData(controllersData);
      }
    } catch (error) {
      console.error("error in controllerDynamic:", error);
    }
  };

  useEffect(() => {
    getProEmployee();
    controllerDynamic();
    getCollectionBoy(setCollectionBoyList, true);
  }, []);

  const handleChangeSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(e.target.value);

    if (!value.trim()) {
      setFilteredReceiptData(receiptData);
      return;
    }

    const searchableKeys = [
      "Date",
      "LedgerTransactionNo",
      "PatientCode",
      "FirstName",
      "LastName",
      "Age",
      "RateType",
      "RateTypeCode",
      "RefferLabName",
      "DoctorName",
      "CreatedByName",
    ];

    const filtered = receiptData?.filter((row) =>
      searchableKeys.some((key) =>
        String(row[key] || "")
          .toLowerCase()
          .includes(value),
      ),
    );

    setFilteredReceiptData(filtered);
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
        if (ShowDefaultLoginCentre === "1") {
          setFormData((prev) => ({ ...prev, CentreID: DefaultCentre }));
          fetchRateTypes([DefaultCentre]);
        } else {
          fetchRateTypes(allValues);
        }
        if (CentreDataValue?.length == 1) {
          setFormData((prev) => ({
            ...prev,
            CentreID: CentreDataValue?.[0]?.value,
          }));
        }
      })
      .catch((err) => console.log(err));
  };

  const getFilterResultOption = () => {
    axiosInstance
      .post("Lab/getFilterTableReprintData", {
        PageName: "Reprint",
        EmployeeId: EmployeeID?.toString(),
      })
      .then((res) => {
        let data = res?.data?.message;
        setColumnConfig(data);
      })
      .catch((err) => setColumnConfig([]));
  };

  useEffect(() => {
    getAccessCentres();
    BindEmployeeReports(SetUser);
    getFilterResultOption();
    getPaymentModes("RequiredAttachment", setIdentity);
    controllerDynamic();
  }, []);

  useEffect(() => {
    getDoctorSuggestion(formData, setDoctorSuggestion, setFormData);
  }, [formData?.DoctorName]);

  console.log("receiptData", receiptData);
  console.log("formData", formData);

  const [selectedReceipt, setSelectedReceipt] = useState(null);
  console.log("selectedReceipt", selectedReceipt);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [showSchedule, setShowSchedule] = useState(false);

  // const handleOpenSchedule = (data, index) => {
  //   setSelectedReceipt(data);
  //   setSelectedIndex(index);
  //   setShowSchedule(true);
  // };

  // const getReceipt = (id, index) => {

  //   if (printLoading.index === -1) {
  //     setPrintLoading({
  //       loading: true,
  //       index: index,
  //     });
  //     axiosReport
  //       .post(
  //         "getReceipt",
  //         { LedgerTransactionIDHash: id },
  //         { responseType: "blob" },
  //       )
  //       .then((res) => {
  //         const blob = new Blob([res.data], { type: "application/pdf" });
  //         const url = window.URL.createObjectURL(blob);
  //         window.open(url, "_blank");
  //         setPrintLoading({
  //           loading: false,
  //           index: -1,
  //         });
  //       })
  //       .catch((err) => {
  //         setPrintLoading({
  //           loading: false,
  //           index: -1,
  //         });
  //         toast.error(
  //           err?.data?.response?.message
  //             ? err?.data?.response?.message
  //             : t("Error Occured"),
  //         );
  //       });
  //   } else {
  //     toast.warn("Please wait Generating Receipt");
  //   }
  // };

  const handleOpenSchedule = (data, index, type) => {
    setSelectedReceipt({
      hash: data?.LedgertransactionIDHash,
      index: index,
      receiptType: type,
    });
    setShowSchedule(true);
  };
  const handleCloseSchedule = () => {
    setShowSchedule(false);
  };

  return (
    <>
      {selectedReceipt && (
        <ReprintModal
          show={showSchedule}
          onHandleShow={handleCloseSchedule}
          id={selectedReceipt}
          onSuccess={(response) => {
            if (response?.success && selectedReceipt) {
              setReprintResponse({
                success: true,
                LedgertransactionIDHash: selectedReceipt.hash,
                index: selectedReceipt.index,
                type: selectedReceipt.receiptType,
              });
            }

            setShowSchedule(false);
          }}
        />
      )}
      {show4?.modal && (
        <MedicialModal
          show={show4.modal}
          handleClose={() => {
            setShow4({
              modal: false,
              data: "",
              index: -1,
            });
          }}
          ID={show4.ID}
          MedicalId={show4?.data}
          handleUploadCount={handleUploadCount}
        />
      )}

      {show5?.modal && (
        <UploadFile
          show={show5?.modal}
          handleClose={() => {
            setShow5({ modal: false, data: "", index: -1 });
          }}
          options={Identity}
          documentId={show5?.data}
          pageName="Patient Registration"
          handleUploadCount={handleUploadCount}
        />
      )}

      <Accordion
        name={t("Receipt Reprint")}
        defaultValue={true}
        isBreadcrumb={true}
        linkTo="/receiptreprint"
        linkTitle={
          <div
            className="link-title-container mt-2 d-none  d-md-flex"
            id="pr_id_11"
          >
            {/* <label>
              {t("Total Patient")} :
             
              <span className="text-danger" style={{ marginLeft: "10px" }}>
                {totalCount}
              </span>
            </label> */}
            {/* {ShowRePrintTotal == 0 && <>
              |
              <label>
                {t("Gross Amount")} :
                <span className="text-danger" style={{ marginLeft: "10px" }}>
                  {hideRate == 0
                    ? receiptData
                      ?.reduce(
                        (accumulator, currentValue) =>
                          accumulator + currentValue?.GrossAmount,
                        0,
                      )
                      .toFixed(2)
                    : "0.00"}
                </span>
              </label>
              |
              <label>
                {t("Discount Amount")} :
                <span className="text-danger" style={{ marginLeft: "10px" }}>
                  {receiptData
                    ?.reduce(
                      (accumulator, currentValue) =>
                        accumulator + currentValue?.DiscountOnTotal,
                      0,
                    )
                    .toFixed(2)}
                </span>
              </label>
              |
              <label>
                {t("Net Amount")} :
                <span className="text-danger" style={{ marginLeft: "10px" }}>
                  {hideRate == 0
                    ? receiptData
                      ?.reduce(
                        (accumulator, currentValue) =>
                          accumulator + currentValue?.NetAmount,
                        0,
                      )
                      .toFixed(2)
                    : "0.00"}
                </span>
              </label>
              |
              <label>
                {t("Due Amount")} :
                <span className="text-danger" style={{ marginLeft: "10px" }}>
                  {hideRate == 0
                    ? receiptData
                      ?.reduce(
                        (accumulator, currentValue) =>
                          accumulator + currentValue?.DueAmount,
                        0,
                      )
                      .toFixed(2)
                    : "0.00"}
                </span>
              </label>
              |
              <label>
                {t("Paid Amount")} :
                <span className="text-danger" style={{ marginLeft: "10px" }}>
                  {receiptData
                    ?.reduce(
                      (accumulator, currentValue) =>
                        accumulator + currentValue?.Adjustment,
                      0,
                    )
                    .toFixed(2)}
                </span>
              </label>
              |
              <label>
                {t("Cash Amount")} :
                <span className="text-danger" style={{ marginLeft: "10px" }}>
                  {hideRate == 0
                    ? receiptData
                      ?.reduce(
                        (accumulator, currentValue) =>
                          accumulator + currentValue?.CashCollection,
                        0,
                      )
                      .toFixed(2)
                    : "0.00"}
                </span>
              </label>
              |
              <label>
                {t("Other Amount")} :
                <span className="text-danger" style={{ marginLeft: "10px" }}>
                  {hideRate == 0
                    ? receiptData
                      ?.reduce(
                        (accumulator, currentValue) =>
                          accumulator + currentValue?.CPAmt,
                        0,
                      )
                      .toFixed(2)
                    : "0.00"}
                </span>
              </label>

            </>} */}
          </div>
        }
      >
        {console.log("controllerDynamicList", controllerDynamicList)}
        <Accordion defaultValue={true} title={t("Receipt Reprint Details")} />
        <div className="row  px-2 mt-2 mb-1">
          {/* ── Dynamic Controller rendered form fields (TypeId === 1) ── */}
          {controllerDynamicList
            ?.filter((item) => item?.TypeId === 1 && item?.IsShow === 1)
            ?.map((item, index) => {
              if (
                item?.ControlDisplayID === "SelectTypes" &&
                isHideController("SelectTypes")
              ) {
                return (
                  <div className="col-md-2" key={index}>
                    <div className="d-flex" style={{ display: "flex" }}>
                      <div style={{ width: "40%" }}>
                        <SelectBox
                          options={[
                            ...SearchBy,
                            ...(shouldIncludeAIIMSID()
                              ? [{ label: "AIIMSID", value: "AIIMSID" }]
                              : []),
                          ]}
                          id="SelectTypes"
                          lable="SelectTypes"
                          selectedValue={formData.SelectTypes}
                          name="SelectTypes"
                          onChange={handleChange}
                        />
                      </div>
                      {ShowAllCheckBarcodeOption == 1 &&
                        formData?.SelectTypes == "BarcodeNo" && (
                          <>
                            <Tooltip
                              target="#ShowAllCheckBarcodeOption"
                              content={t("ShowAllCheckBarcodeOption")}
                              position="top"
                            />
                            <Form.Check
                              type="checkbox"
                              label=""
                              id="ShowAllCheckBarcodeOption"
                              checked={!!checkBarcodeOption}
                              onChange={handleToggleChange}
                              className="cursor-pointer"
                            />
                          </>
                        )}
                      <div style={{ width: "50%" }}>
                        {formData?.SelectTypes === "Mobile" ? (
                          <div style={{ width: "100%" }}>
                            <Input
                              type="number"
                              name="ItemValue"
                              max={10}
                              onKeyDown={handleKeyDown}
                              value={formData.ItemValue}
                              onChange={handleChange}
                              onInput={(e) => number(e, 10)}
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
                              onKeyDown={handleKeyDown}
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
                );
              }

              if (
                item?.ControlDisplayID === "CentreID" &&
                isHideController("CentreID")
              ) {
                return (
                  <div className="col-md-2" key={index}>
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
                );
              }

              if (
                item?.ControlDisplayID === "RateTypeID" &&
                isHideController("RateTypeID")
              ) {
                return (
                  <div className="col-md-2" key={index}>
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
                );
              }

              if (
                item?.ControlDisplayID === "DoctorName" &&
                isHideController("DoctorName")
              ) {
                return (
                  (RateTypeID > 0 || DoctorId > 0) && (
                    <div className="col-md-2" key={index}>
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
                              (ele) => ele?.Name === e.target.value,
                            );
                            if (data.length === 0) {
                              setFormData({ ...formData, DoctorName: "" });
                            }
                          }, 500);
                        }}
                        onKeyDown={handleIndex}
                        autoComplete="off"
                      />
                      {dropFalse &&
                        doctorSuggestion.length > 0 &&
                        formData.DoctorName && (
                          <ul className="suggestion-data">
                            {doctorSuggestion.map((data, index) => (
                              <li
                                onClick={() =>
                                  handleListSearch(data, "DoctorName")
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
                  )
                );
              }

              if (
                item?.ControlDisplayID === "User" &&
                isHideController("User")
              ) {
                return Number(ShowUserFilterAtReprint) ? (
                  <div className="col-md-2" key={index}>
                    <ReactSelect
                      dynamicOptions={[
                        { label: "Select Employee", value: "" },
                        ...user,
                      ]}
                      name="User"
                      lable={t("Employee")}
                      id="Employee"
                      removeIsClearable={true}
                      placeholderName={t("Employee")}
                      value={formData?.User}
                      onChange={handleSearchSelectChange}
                    />
                  </div>
                ) : null;
              }

              if (
                item?.ControlDisplayID === "ProEmployee" &&
                isHideController("ProEmployee")
              ) {
                return (
                  (RateTypeID > 0 || DoctorId > 0) && (
                    <div className="col-sm-2 col-6" key={index}>
                      <ReactSelect
                        dynamicOptions={[
                          { label: "Select", value: "" },
                          ...proEmployee,
                        ]}
                        name={"ProEmployee"}
                        id={"ProEmployee"}
                        label="ProEmployee"
                        value={state?.ProEmployee}
                        onChange={handleProEmployeeChange}
                        placeholderName={"ProEmployee"}
                        respclass={""}
                      />
                    </div>
                  )
                );
              }

              if (
                item?.ControlDisplayID === "CollectionBoy" &&
                isHideController("CollectionBoy")
              ) {
                return (
                  // (RateTypeID > 0 || DoctorId > 0) &&
                  <div className="col-sm-2" key={index}>
                    <ReactSelect
                      name="collectionBoy"
                      dynamicOptions={[
                        { label: t("Select Collection Boy"), value: "" },
                        ...collectionBoyList,
                      ]}
                      placeholderName={t("Collection Boy")}
                      value={collectionBoy}
                      onChange={handleReactSelectChange}
                    />
                  </div>
                );
              }

              if (
                item?.ControlDisplayID === "FromDate" &&
                isHideController("FromDate")
              ) {
                return (
                  <div className="col-md-2" key={index}>
                    <DatePicker
                      className="custom-calendar"
                      name="FromDate"
                      value={formData?.FromDate}
                      onChange={dateSelect}
                      placeholder=" "
                      id="FromDate"
                      lable="FromDate"
                      maxDate={new Date()}
                    />
                  </div>
                );
              }

              if (
                item?.ControlDisplayID === "FromTime" &&
                isHideController("FromTime")
              ) {
                return (
                  <div className="col-md-1" key={index}>
                    <CustomTimePicker
                      name="FromTime"
                      placeholder="FromTime"
                      value={formData?.FromTime}
                      id="FromTime"
                      lable="FromTime"
                      onChange={handleTime}
                    />
                  </div>
                );
              }

              if (
                item?.ControlDisplayID === "ToDate" &&
                isHideController("ToDate")
              ) {
                return (
                  <div className="col-md-2" key={index}>
                    <DatePicker
                      className="custom-calendar"
                      name="ToDate"
                      value={formData?.ToDate}
                      onChange={dateSelect}
                      placeholder=" "
                      id="ToDate"
                      lable="ToDate"
                      maxDate={getMaxToDate(formData?.FromDate, maxRange)}
                      minDate={new Date(formData?.FromDate)}
                    />
                  </div>
                );
              }

              if (
                item?.ControlDisplayID === "ToTime" &&
                isHideController("ToTime")
              ) {
                return (
                  <div className="col-md-1" key={index}>
                    <CustomTimePicker
                      name="ToTime"
                      placeholder="ToTime"
                      value={formData?.ToTime}
                      id="ToTime"
                      lable="ToTime"
                      onChange={handleTime}
                    />
                  </div>
                );
              }

              if (
                item?.ControlDisplayID === "Search" &&
                isHideController("Search")
              ) {
                return (
                  <div className="col-md-1" key={index}>
                    <SearchButton
                      text="Search"
                      value={"Search"}
                      id="btnSearch"
                      onClick={() => {
                        setCurrentStatus("All");
                        setCurrentPage(1);
                        TableData("All", 1);
                      }}
                    />
                  </div>
                );
              }

              return null;
            })}

          {/* Fallback: render all original fields if no controller data available */}
          {!controllerDynamicList?.length && (
            <>
              <div className="col-md-2">
                <div className="d-flex" style={{ display: "flex" }}>
                  <div style={{ width: "40%" }}>
                    <SelectBox
                      options={[
                        ...SearchBy,
                        ...(shouldIncludeAIIMSID()
                          ? [{ label: "AIIMSID", value: "AIIMSID" }]
                          : []),
                      ]}
                      id="SelectTypes"
                      lable="SelectTypes"
                      selectedValue={formData.SelectTypes}
                      name="SelectTypes"
                      onChange={handleChange}
                    />
                  </div>
                  {ShowAllCheckBarcodeOption == 1 &&
                    formData?.SelectTypes == "BarcodeNo" && (
                      <>
                        <Tooltip
                          target="#ShowAllCheckBarcodeOption"
                          content={t("ShowAllCheckBarcodeOption")}
                          position="top"
                        />
                        <Form.Check
                          type="checkbox"
                          label=""
                          id="ShowAllCheckBarcodeOption"
                          checked={!!checkBarcodeOption}
                          onChange={handleToggleChange}
                          className="cursor-pointer"
                        />
                      </>
                    )}
                  <div style={{ width: "50%" }}>
                    {formData?.SelectTypes === "Mobile" ? (
                      <div style={{ width: "100%" }}>
                        <Input
                          type="number"
                          name="ItemValue"
                          max={10}
                          onKeyDown={handleKeyDown}
                          value={formData.ItemValue}
                          onChange={handleChange}
                          onInput={(e) => number(e, 10)}
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
                          onKeyDown={handleKeyDown}
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

              <div className="col-md-2">
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

              <div className="col-md-2">
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

              {RateTypeID > 0 ||
                (DoctorId > 0 && (
                  <div className="col-md-2">
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
                            (ele) => ele?.Name === e.target.value,
                          );
                          if (data.length === 0) {
                            setFormData({ ...formData, DoctorName: "" });
                          }
                        }, 500);
                      }}
                      onKeyDown={handleIndex}
                      autoComplete="off"
                    />
                    {dropFalse &&
                      doctorSuggestion.length > 0 &&
                      formData.DoctorName && (
                        <ul className="suggestion-data">
                          {doctorSuggestion.map((data, index) => (
                            <li
                              onClick={() =>
                                handleListSearch(data, "DoctorName")
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
                ))}
              {Number(ShowUserFilterAtReprint) && (
                <div className="col-md-2">
                  <ReactSelect
                    dynamicOptions={[
                      { label: "Select Employee", value: "" },
                      ...user,
                    ]}
                    name="User"
                    lable={t("Employee")}
                    id="Employee"
                    removeIsClearable={true}
                    placeholderName={t("Employee")}
                    value={formData?.User}
                    onChange={handleSearchSelectChange}
                  />
                </div>
              )}
              {RateTypeID > 0 ||
                (DoctorId > 0 && (
                  <div className="col-sm-2 col-6">
                    <ReactSelect
                      dynamicOptions={[
                        { label: "Select", value: "" },
                        ...proEmployee,
                      ]}
                      name={"ProEmployee"}
                      id={"ProEmployee"}
                      label="ProEmployee"
                      value={state?.ProEmployee}
                      onChange={handleProEmployeeChange}
                      placeholderName={"ProEmployee"}
                      respclass={""}
                    />
                  </div>
                ))}
              {RateTypeID > 0 ||
                (DoctorId > 0 && (
                  <div className="col-sm-2">
                    <ReactSelect
                      name="collectionBoy"
                      dynamicOptions={[
                        { label: t("Select Collection Boy"), value: "" },
                        ...collectionBoyList,
                      ]}
                      placeholderName={t("Collection Boy")}
                      value={collectionBoy}
                      onChange={handleReactSelectChange}
                    />
                  </div>
                ))}
              <div className="col-md-2">
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
              <div className="col-md-1">
                <CustomTimePicker
                  name="FromTime"
                  placeholder="FromTime"
                  value={formData?.FromTime}
                  id="FromTime"
                  lable="FromTime"
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
                  lable="ToDate"
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
                  lable="ToTime"
                  onChange={handleTime}
                />
              </div>
              <div className="col-md-1">
                <SearchButton
                  text="Search"
                  value={"Search"}
                  id="btnSearch"
                  onClick={() => {
                    setCurrentStatus("All");
                    setCurrentPage(1);
                    TableData("All", 1);
                  }}
                />
              </div>
            </>
          )}

          {/* {HideRePrintColorCode != 1 && (
           <>
              <div
                onClick={() => {
                  setCurrentStatus("fullpaid");
                  setCurrentPage(1);
                  TableData("fullpaid", 1);
                }}
                className="col-md-1 d-flex"
              >
                <button
                  className="statusConfirmed"
                  style={{ backgroundColor: "#00FA9A" }}
                ></button>
                <label className="reprintLable" style={{ cursor: "pointer" }}>
                  {t("Full Paid")}
                </label>
              </div>
              <div
                onClick={() => {
                  setCurrentStatus("partialpaid");
                  setCurrentPage(1);
                  TableData("partialpaid", 1);
                }}
                className="col-md-1 d-flex"
              >
                <button
                  className="statusConfirmed"
                  style={{ backgroundColor: "#F6A9D1" }}
                ></button>
                <label className="reprintLable" style={{ cursor: "pointer" }}>
                  {t("Partial Paid")}
                </label>
              </div>
              <div
                onClick={() => {
                  setCurrentStatus("fullyunpaid");
                  setCurrentPage(1);
                  TableData("fullyunpaid", 1);
                }}
                className="col-md-1 d-flex"
              >
                <button
                  className="statusConfirmed"
                  style={{ backgroundColor: "#FF457C" }}
                ></button>
                <label className="reprintLable" style={{ cursor: "pointer" }}>
                  {t("Fully Unpaid")}
                </label>
              </div>
              <div
                onClick={() => {
                  setCurrentStatus("fullrefund");
                  setCurrentPage(1);
                  TableData("fullrefund", 1);
                }}
                className="col-md-1 d-flex"
              >
                <button
                  className="statusConfirmed"
                  style={{ backgroundColor: "#CEE1FF" }}
                ></button>
                <label className="reprintLable" style={{ cursor: "pointer" }}>
                  {t("Full Refund")}
                </label>
              </div>
              <div
                onClick={() => {
                  setCurrentStatus("credit");
                  setCurrentPage(1);
                  TableData("credit", 1);
                }}
                className="col-md-1 d-flex"
              >
                <button
                  className="statusConfirmed"
                  style={{ backgroundColor: "#b3cdb3" }}
                ></button>
                <label className="reprintLable" style={{ cursor: "pointer" }}>
                  {t("Credit")}
                </label>
              </div>
            </>
          )} */}
          {HideRePrintColorCode != 1 && (
            <div
              className="d-flex flex-wrap align-items-center"
              style={{ gap: "6px 12px", padding: "4px 8px" }}
            >
              <div
                onClick={() => {
                  setCurrentStatus("fullpaid");
                  setCurrentPage(1);
                  TableData("fullpaid", 1);
                }}
                className="d-flex align-items-center"
                style={{
                  cursor: "pointer",
                  flexShrink: 0,
                  whiteSpace: "nowrap",
                }}
              >
                <button
                  className="statusConfirmed"
                  style={{ backgroundColor: "#00FA9A", flexShrink: 0 }}
                ></button>
                <label
                  className="reprintLable"
                  style={{
                    cursor: "pointer",
                    marginBottom: 0,
                    whiteSpace: "nowrap",
                  }}
                >
                  {t("Full Paid")}
                </label>
              </div>

              <div
                onClick={() => {
                  setCurrentStatus("partialpaid");
                  setCurrentPage(1);
                  TableData("partialpaid", 1);
                }}
                className="d-flex align-items-center"
                style={{
                  cursor: "pointer",
                  flexShrink: 0,
                  whiteSpace: "nowrap",
                }}
              >
                <button
                  className="statusConfirmed"
                  style={{ backgroundColor: "#F6A9D1", flexShrink: 0 }}
                ></button>
                <label
                  className="reprintLable"
                  style={{
                    cursor: "pointer",
                    marginBottom: 0,
                    whiteSpace: "nowrap",
                  }}
                >
                  {t("Partial Paid")}
                </label>
              </div>

              <div
                onClick={() => {
                  setCurrentStatus("fullyunpaid");
                  setCurrentPage(1);
                  TableData("fullyunpaid", 1);
                }}
                className="d-flex align-items-center"
                style={{
                  cursor: "pointer",
                  flexShrink: 0,
                  whiteSpace: "nowrap",
                }}
              >
                <button
                  className="statusConfirmed"
                  style={{ backgroundColor: "#FF457C", flexShrink: 0 }}
                ></button>
                <label
                  className="reprintLable"
                  style={{
                    cursor: "pointer",
                    marginBottom: 0,
                    whiteSpace: "nowrap",
                  }}
                >
                  {t("Fully Unpaid")}
                </label>
              </div>

              <div
                onClick={() => {
                  setCurrentStatus("fullrefund");
                  setCurrentPage(1);
                  TableData("fullrefund", 1);
                }}
                className="d-flex align-items-center"
                style={{
                  cursor: "pointer",
                  flexShrink: 0,
                  whiteSpace: "nowrap",
                }}
              >
                <button
                  className="statusConfirmed"
                  style={{ backgroundColor: "#CEE1FF", flexShrink: 0 }}
                ></button>
                <label
                  className="reprintLable"
                  style={{
                    cursor: "pointer",
                    marginBottom: 0,
                    whiteSpace: "nowrap",
                  }}
                >
                  {t("Full Refund")}
                </label>
              </div>

              <div
                onClick={() => {
                  setCurrentStatus("credit");
                  setCurrentPage(1);
                  TableData("credit", 1);
                }}
                className="d-flex align-items-center"
                style={{
                  cursor: "pointer",
                  flexShrink: 0,
                  whiteSpace: "nowrap",
                }}
              >
                <button
                  className="statusConfirmed"
                  style={{ backgroundColor: "#b3cdb3", flexShrink: 0 }}
                ></button>
                <label
                  className="reprintLable"
                  style={{
                    cursor: "pointer",
                    marginBottom: 0,
                    whiteSpace: "nowrap",
                  }}
                >
                  {t("Credit")}
                </label>
              </div>
            </div>
          )}
        </div>
        <div
          className={`px-2 mt-1 mb-1 ${RateTypeID > 0 || DoctorId > 0 ? "flex-grow-1" : "row"}`}
        ></div>
      </Accordion>

      <Accordion
        title={
          <>
            {receiptData?.length == 0 ? (
              t("Search Result")
            ) : (
              <div className="d-flex align-items-center w-100">
                <span className="mt-1">
                  {t("Click Icon To Filter Results")}
                </span>
                <span className="header ml-1" style={{ cursor: "pointer" }}>
                  <ReceiptReprintFilter
                    columnConfig={columnConfig}
                    setColumnConfig={setColumnConfig}
                    PageName="Reprint"
                  />
                </span>
              </div>
            )}
          </>
        }
        notOpen={true}
        defaultValue={true}
        linkTo="#"
        linkTitle={
          <div
            className="link-title-container mt-2 d-none d-md-flex align-items-center"
            id="pr_id_11"
            style={{ flexWrap: "nowrap", overflow: "hidden", fontSize: "12px" }}
          >
            <label
              style={{
                whiteSpace: "nowrap",
                marginBottom: 0,
              }}
            >
              {t("Total Patient")} :
              <span className="text-danger" style={{ marginLeft: "6px" }}>
                {totalCount}
              </span>
            </label>
            {ShowRePrintTotal == 1 && receiptData?.length > 0 && (
              <>
                <span style={{ whiteSpace: "nowrap", marginRight: "6px" }}>
                  |
                </span>
                <label
                  style={{
                    whiteSpace: "nowrap",
                    marginBottom: 0,
                  }}
                >
                  {t("Gross Amount")} :
                  <span className="text-danger" style={{ marginLeft: "6px" }}>
                    {hideRate == 0 ? receiptAmout?.grossAmount : "0.00"}
                  </span>
                </label>
                <span style={{ whiteSpace: "nowrap", marginRight: "6px" }}>
                  |
                </span>
                <label
                  style={{
                    whiteSpace: "nowrap",
                    marginBottom: 0,
                  }}
                >
                  {t("Discount Amount")} :
                  <span className="text-danger" style={{ marginLeft: "6px" }}>
                    {receiptAmout?.discountOnTotal || 0}
                  </span>
                </label>
                <span style={{ whiteSpace: "nowrap", marginRight: "6px" }}>
                  |
                </span>
                <label
                  style={{
                    whiteSpace: "nowrap",
                    marginBottom: 0,
                  }}
                >
                  {t("Net Amount")} :
                  <span className="text-danger" style={{ marginLeft: "6px" }}>
                    {hideRate == 0 ? receiptAmout?.netAmount : "0.00"}
                  </span>
                </label>
                <span style={{ whiteSpace: "nowrap", marginRight: "6px" }}>
                  |
                </span>
                <label
                  style={{
                    whiteSpace: "nowrap",
                    marginBottom: 0,
                  }}
                >
                  {t("Due Amount")} :
                  <span className="text-danger" style={{ marginLeft: "6px" }}>
                    {hideRate == 0 ? receiptAmout?.dueAmount : "0.00"}
                  </span>
                </label>
                <span style={{ whiteSpace: "nowrap", marginRight: "6px" }}>
                  |
                </span>
                <label
                  style={{
                    whiteSpace: "nowrap",
                    marginBottom: 0,
                  }}
                >
                  {t("Paid Amount")} :
                  <span className="text-danger" style={{ marginLeft: "6px" }}>
                    {receiptAmout?.adjustment || 0}
                  </span>
                </label>
                <span style={{ whiteSpace: "nowrap", marginRight: "6px" }}>
                  |
                </span>
                <label
                  style={{
                    whiteSpace: "nowrap",
                    marginBottom: 0,
                  }}
                >
                  {t("Cash")} :
                  <span className="text-danger" style={{ marginLeft: "6px" }}>
                    {hideRate == 0 ? receiptAmout?.cashAmt : "0.00"}
                  </span>
                </label>
                <span style={{ whiteSpace: "nowrap", marginRight: "6px" }}>
                  |
                </span>
                <label
                  style={{
                    whiteSpace: "nowrap",
                    marginBottom: 0,
                  }}
                >
                  {t("Other Payment")} :
                  <span className="text-danger" style={{ marginLeft: "6px" }}>
                    {receiptAmout?.cpAmt || 0}
                  </span>
                </label>
              </>
            )}
            <div className="ml-auto d-flex align-items-center px-2">
              <Input
                type="text"
                name="search"
                id="search"
                placeholder="Search..."
                value={searchTerm}
                onChange={handleChangeSearch}
              />
            </div>
          </div>
        }
      >
        <div className="">
          {loading ? (
            <Loading />
          ) : (
            <>
              <ReceiptReprintTable
                Status={formData?.Status}
                handleOpenSchedule={handleOpenSchedule}
                TableData={TableData}
                show={setShow4}
                show2={setShow5}
                setReceiptData={setReceiptData}
                setRecieptAmout={setRecieptAmout}
                receiptAmout={receiptAmout}
                receiptData={searchTerm ? filteredReceiptData : receiptData}
                currentPage={currentPage}
                pageSize={pageSize}
                columnConfig={columnConfig}
                reprintResponse={reprintResponse}
                filterData={FilterData}
              />
              {paginationShow && receiptData?.length > 0 && (
                <div className="d-flex flex-wrap justify-content-end">
                  <Pagination
                    className="pagination-bar mb-2"
                    currentPage={currentPage}
                    totalCount={totalCount}
                    pageSize={pageSize}
                    onPageChange={(page) => {
                      setCurrentPage(page);
                      TableData(currentStatus, page);
                    }}
                  />{" "}
                </div>
              )}
            </>
          )}
        </div>{" "}
      </Accordion>
    </>
  );
};

export default B2BReceiptReprint;
