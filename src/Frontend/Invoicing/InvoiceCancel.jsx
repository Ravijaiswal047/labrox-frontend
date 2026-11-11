import React, { useMemo } from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import moment from "moment";
import { useEffect } from "react";
import { toast } from "react-toastify";
import Accordion from "@app/components/UI/Accordion";
import Tables from "../../components/UI/customTable";
import { axiosInstance } from "../../utils/axiosInstance";
import { SelectBox } from "../../components/formComponent/SelectBox";
import DatePicker from "../../components/formComponent/DatePicker";
import Input from "../../components/formComponent/Input";
import Loading from "../../components/loader/Loading";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { apiUrls } from "../../utils/apiUrls";
import { Button, Form } from "react-bootstrap";
import { Dialog } from "primereact/dialog";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import "./Invoice.css";
import { parseTypedDate } from "../../utils/validations/validationHelpers";
import { notify } from "../../utils/utils";
import { useDispatch } from "react-redux";
import { setLoading } from "../../store/reducers/loadingSlice/loadingSlice";
import MultiSelectComp from "../../components/formComponent/MultiSelectComp";
import { CancelButton, SearchButton } from "../../components/UI/CustomButton";
import { getSearchController } from "../../utils/NetworkApi/commonApi";
import Pagination from "../../Pagination/Pagination";
import PageControlGear from "../../components/PageGearModel/PageControlGear";

const InvoiceCancel = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const theme = useLocalStorage("theme", "get");
  const PAGE_ID = "707";
  const { HideInvoiceBillingCycle } = useLocalStorage("userData", "get");

  // ── Search Form State ─────────────────────────────────────────────────────
  const [searchData, setSearchData] = useState({
    InvoiceNo: "",
    InvoiceDateFrom: new Date(),
    InvoiceDateTo: new Date(),
  });

  const [payload, setPayload] = useState({
    businessUnitCode: [], // UI label: Business Unit  (sent as centreId to backend)
    invoiceBillingCycle: "",
    rateType: [],
    DateTypeSearch: "im.dtentry",
  });

  // ── Dropdown Data ─────────────────────────────────────────────────────────
  const [center, setCentre] = useState([]);
  const [dropdownList, setDropdownList] = useState({
    centreList: [],
    invoiceBillingCycleList: [],
  });

  // ── Dynamic Controller ────────────────────────────────────────────────────
  const [controllerDynamicList, setControllerDynamicList] = useState([]);
  const [FilterData, setFilterData] = useState([]);
  const [headWithApiFields, setHeadWithApiFields] = useState({
    "S.No": "srNo",
    BusinessUnit: "BusinessUnit",
    "Invoice No.": "InvoiceNo",
    RateTypeCode: "RateTypeCode",
    RateTypeName: "RateType",
    "Invoice Date": "InvoiceCreatedOn",
    "Net Amount": "NetAmount",
    "Invoice Amount": "InvoiceAmount",
    "Cancelled By": "InvoiceCancelBy",
    "Cancelled On": "InvoiceCancelledOn",
    Action: "Action",
  });

  // ── Table / UI State ──────────────────────────────────────────────────────
  const [searchLoad, setSearchLoad] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [selectedRowForCancel, setSelectedRowForCancel] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  // ── Active filter: null = all, 0 = active, 1 = cancelled ─────────────────
  const [activeFilter, setActiveFilter] = useState(null);

  // ── Date Type List ────────────────────────────────────────────────────────
  const dateTypeList = [
    { label: t("Invoice Date"), value: "im.InvoiceDate" },
    { label: t("Entry Date"), value: "im.dtentry" },
    { label: t("Cancel Date"), value: "im.canceldate" },
  ];

  // ── Pagination ────────────────────────────────────────────────────────────
  const currentTableData = useMemo(() => {
    const first = (currentPage - 1) * pageSize;
    return filteredData.slice(first, first + pageSize);
  }, [currentPage, pageSize, filteredData]);

  // ── Status counts (always from full tableData) ────────────────────────────
  const statusCount = (key) =>
    tableData?.filter((item) => item?.iscancel == key)?.length;

  // ── Filter dot click ──────────────────────────────────────────────────────
  const filterStatusWise = (key) => {
    if (activeFilter === key) {
      // toggle off → show all
      setActiveFilter(null);
      applySearchFilter(searchText, tableData);
    } else {
      setActiveFilter(key);
      const base = tableData.filter((item) => item?.iscancel == key);
      applySearchFilter(searchText, base);
    }
    setCurrentPage(1);
  };

  // ── Text search filter helper ─────────────────────────────────────────────
  const applySearchFilter = (text, source) => {
    if (!text.trim()) {
      setFilteredData(source);
      return;
    }
    const val = text.toLowerCase();
    setFilteredData(
      source.filter((item) =>
        [
          "BusinessUnit",
          "InvoiceNo",
          "RateTypeCode",
          "RateType",
          "InvoiceCreatedOn",
          "NetAmount",
          "InvoiceAmount",
          "InvoiceCancelBy",
          "InvoiceCancelledOn",
          "CancelReason",
        ].some((k) =>
          String(item[k] || "")
            .toLowerCase()
            .includes(val),
        ),
      ),
    );
  };

  const handleChangeSearch = (e) => {
    const val = e.target.value;
    setSearchText(val);
    const base =
      activeFilter !== null
        ? tableData.filter((item) => item?.iscancel == activeFilter)
        : tableData;
    applySearchFilter(val, base);
    setCurrentPage(1);
  };

  // ── Dynamic Controller ────────────────────────────────────────────────────
  const controllerDynamic = async () => {
    try {
      const { controllersData } = await getSearchController(PAGE_ID);
      setControllerDynamicList(controllersData);
      if (Array.isArray(controllersData)) {
        setFilterData(controllersData);
        const dynamicMappings = { ...headWithApiFields };
        controllersData.forEach((col) => {
          if (!dynamicMappings[col.ControlDisplayID]) {
            dynamicMappings[col.ControlDisplayID] =
              col.ApiFieldName || col.ControlDisplayID;
          }
        });
        setHeadWithApiFields(dynamicMappings);
      }
    } catch (err) {
      console.error("controllerDynamic error:", err);
    }
  };

  const isHideController = (cntrId = "") => {
    if (!controllerDynamicList?.length) return true;
    const found = controllerDynamicList?.find(
      (x) => x?.ControlDisplayID === cntrId,
    );
    if (found?.ControlDisplayID) return !!found?.IsShow;
    return true;
  };

  const getAccessCentres = (centreIDs = []) => {
    axiosInstance
      .post("Centre/BindRateTypeWorkOrderSearch", {
        centreID: centreIDs.toString() || 0,
        rateTypeID: 0,
        AllowEstimate: 0,
        CentreType: "",
        AllowHomeCollection: 0,
        AllowMembershipCard: 0,
        PageName: "YES",
      })
      .then((res) => {
        const data = res?.data?.message || [];

        const formatted = data.map((ele) => ({
          value: ele.RateTypeID,
          label: ele.RateTypeName?.replace(/\r?\n/g, " ").trim(),
        }));

        setCentre(formatted);

        if (formatted.length === 1) {
          setPayload((prev) => ({
            ...prev,
            rateType: [formatted[0].value],
          }));
        } else {
          setPayload((prev) => ({
            ...prev,
            rateType: [],
          }));
        }
      })
      .catch(() => setCentre([]));
  };

  const getGlobalCentres = () => {
    axiosInstance
      .post("Centre/BindCentreWorkOrder", {
        centreID: 0,
        rateTypeID: 0,
      })
      .then((res) => {
        const centreList = res?.data?.message?.map((ele) => ({
          value: String(ele?.value),
          label: ele?.label,
        }));
        if (centreList?.length === 1)
          setPayload((prev) => ({
            ...prev,
            businessUnitCode: [centreList[0]?.value],
          }));
        setDropdownList((prev) => ({ ...prev, centreList }));
      })
      .catch(console.log);
  };

  const getInvoiceBillingCentre = () => {
    axiosInstance
      .post(apiUrls?.getGlobalData, { type: "InvoiceBillingCycle" })
      .then((res) => {
        const invoiceBillingCycleList = res?.data?.message?.map((ele) => ({
          ...ele,
          value: String(ele?.FieldDisplay),
          label: ele?.FieldDisplay,
        }));
        setDropdownList((prev) => ({ ...prev, invoiceBillingCycleList }));
      })
      .catch(console.log);
  };

  useEffect(() => {
    getGlobalCentres();
    getInvoiceBillingCentre();
    getAccessCentres();
    controllerDynamic();
  }, []);

  useEffect(() => {
    if (payload?.businessUnitCode?.length > 0) {
      getAccessCentres(payload.businessUnitCode);
    } else {
      setCentre([]);
      setPayload((prev) => ({
        ...prev,
        rateType: [],
      }));
    }
  }, [payload?.businessUnitCode]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const dateSelect = (value, name) => {
    if (name === "InvoiceDateFrom") {
      const updateDate =
        new Date(searchData?.InvoiceDateTo) - value < 0
          ? value
          : searchData.InvoiceDateTo;
      setSearchData((prev) => ({
        ...prev,
        [name]: value,
        InvoiceDateTo: updateDate,
      }));
    } else {
      setSearchData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelect_BoxChange = (e) => {
    const { name, value } = e.target;
    setPayload((prev) => ({ ...prev, [name]: value }));
  };

  const handleReactSelectChange = (name, e) => {
    setPayload((prev) => ({ ...prev, [name]: e?.value }));
  };

  const handleSelectchangeCheck = (name, value) => {
    setPayload((prev) => ({ ...prev, [name]: value }));
  };

  // ── Search ────────────────────────────────────────────────────────────────
  const handleSearch = () => {
    setSearchLoad(true);
    setActiveFilter(null);
    setSearchText("");

    const fromDateVal =
      parseTypedDate(document.getElementById("From Date")?.value) ||
      searchData?.InvoiceDateFrom;
    const toDateVal =
      parseTypedDate(document.getElementById("To Date")?.value) ||
      searchData?.InvoiceDateTo;

    const invoiceCancelPayload = {
      invoiceNo: searchData?.InvoiceNo,
      centreId: Array.isArray(payload?.businessUnitCode) // UI: businessUnitCode → backend: centreId
        ? payload.businessUnitCode
        : [],
      invoiceDateFrom: fromDateVal
        ? moment(fromDateVal).format("YYYY-MM-DD")
        : undefined,
      invoiceDateTo: toDateVal
        ? moment(toDateVal).format("YYYY-MM-DD")
        : undefined,
      dateTypeSearch: payload?.DateTypeSearch,
      rateType: payload?.rateType || [],
      invoiceBillingCycle: payload?.invoiceBillingCycle,
      isCancel: 2,
    };

    axiosInstance
      .post(apiUrls?.GetInvoiceDataToCancel, invoiceCancelPayload)
      .then((res) => {
        if (!Array.isArray(res?.data?.message)) {
          toast.error("No Record found");
          setTableData([]);
          setFilteredData([]);
          return;
        }
        setTableData(res?.data?.message || []);
        setFilteredData(res?.data?.message || []);
        setCurrentPage(1);
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Something went wrong");
        setTableData([]);
        setFilteredData([]);
      })
      .finally(() => setSearchLoad(false));
  };

  // ── Cancel Invoice ────────────────────────────────────────────────────────
  const handleInvoiceCancel = () => {
    if (!selectedRowForCancel?.length) {
      notify("Select Invoice for Cancel", "warn");
      return;
    }
    setShowModal(true);
  };

  const onHideModal = () => setShowModal(false);

  const cancelSelectedInvoice = () => {
    if (!cancelReason) {
      notify("Kindly Enter Cancel Reason.", "warn");
      return;
    }
    if (!selectedRowForCancel?.length) {
      notify("Kindly select invoice to cancel.", "warn");
      return;
    }
    const cancelPayload = selectedRowForCancel.map((id) => ({
      InvoiceNo: id,
      CancelReason: cancelReason,
    }));

    dispatch(setLoading(true));
    axiosInstance
      .post("Accounts/CancelInvoice", { CancelInvoice: cancelPayload })
      .then((res) => {
        if (res?.data?.success) {
          toast.success(res?.data?.message);
          setCancelReason("");
          setShowModal(false);
          setSelectedRowForCancel([]);
          handleSearch();
        } else {
          toast.error(res?.data?.message);
        }
      })
      .catch((err) => toast.error(err?.response?.data?.message))
      .finally(() => dispatch(setLoading(false)));
  };

  // ── Select All / Single row ───────────────────────────────────────────────
  const handleGlobalSelectAll = (e) => {
    if (e.target.checked) {
      const activeOnly = tableData
        .filter((item) => item?.iscancel == 0)
        .map((item) => item?.InvoiceNo);
      setSelectedRowForCancel(activeOnly);
    } else {
      setSelectedRowForCancel([]);
    }
  };

  const selectRowForCancel = (row) => {
    if (!selectedRowForCancel?.includes(row?.InvoiceNo)) {
      setSelectedRowForCancel((prev) => [...prev, row?.InvoiceNo]);
    } else {
      setSelectedRowForCancel((prev) =>
        prev.filter((id) => id !== row?.InvoiceNo),
      );
    }
  };

  const isAllCancelled = tableData?.every((item) => item?.iscancel == 1);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Search Filters Accordion ── */}
      <Accordion
        name={t("Invoice Cancel")}
        isBreadcrumb={true}
        defaultValue={true}
        seconTitle={
          <div style={{ marginLeft: "auto" }}>
            <PageControlGear pageId={PAGE_ID} />
          </div>
        }
      >
        <div className="row px-2 mt-2 mb-1">
          {controllerDynamicList
            ?.filter((item) => item?.TypeId === 1 && item?.IsShow === 1)
            ?.map((item, index) => {
              if (
                item?.ControlDisplayID === "businessUnitCode" &&
                isHideController("businessUnitCode")
              ) {
                return (
                  <MultiSelectComp
                    key={index}
                    options={dropdownList?.centreList}
                    name="businessUnitCode"
                    id="businessUnitCode"
                    label={t("Business Unit")}
                    value={payload?.businessUnitCode}
                    className={"col-sm-2 mb-1"}
                    onChange={handleSelectchangeCheck}
                  />
                );
              }

              if (
                item?.ControlDisplayID === "invoiceBillingCycle" &&
                isHideController("invoiceBillingCycle")
              ) {
                return (
                  <div className="col-sm-2" key={index}>
                    {/* <SelectBox
                      options={[
                        { label: "Select", value: "" },
                        ...dropdownList?.invoiceBillingCycleList,
                      ]}
                      name="invoiceBillingCycle"
                      className="required-fields"
                      lable="Invoice Billing Cycle"
                      id="invoiceBillingCycle"
                      selectedValue={payload?.invoiceBillingCycle}
                      onChange={handleSelect_BoxChange}
                    /> */}
                    <ReactSelect
                      dynamicOptions={[
                        { label: "Select", value: "" },
                        ...dropdownList?.invoiceBillingCycleList,
                      ]}
                      name="invoiceBillingCycle"
                      lable={t("Invoice Billing Cycle")}
                      id="invoiceBillingCycle"
                      isShowBorder={true}
                      removeIsClearable={true}
                      placeholderName={t("Invoice Billing Cycle")}
                      value={payload?.invoiceBillingCycle}
                      onChange={handleReactSelectChange}
                      className="required-fields"
                    />
                  </div>
                );
              }

              if (
                item?.ControlDisplayID === "rateType" &&
                isHideController("rateType")
              ) {
                return (
                  <div className="col-sm-2 mb-1" key={index}>
                    <MultiSelectComp
                      options={center}
                      name="rateType"
                      label={t("Rate Type")}
                      id="rateType"
                      value={payload?.rateType}
                      onChange={handleSelectchangeCheck}
                    />
                  </div>
                );
              }

              if (
                item?.ControlDisplayID === "DateTypeSearch" &&
                isHideController("DateTypeSearch")
              ) {
                return (
                  <div className="col-sm-2" key={index}>
                    <ReactSelect
                      dynamicOptions={dateTypeList}
                      name="DateTypeSearch"
                      lable={t("Date Type")}
                      id="DateTypeSearch"
                      isShowBorder={true}
                      removeIsClearable={true}
                      placeholderName={t("Date Type")}
                      value={payload?.DateTypeSearch}
                      onChange={handleReactSelectChange}
                      className="required-fields"
                    />
                  </div>
                );
              }

              if (
                item?.ControlDisplayID === "InvoiceDateFrom" &&
                isHideController("InvoiceDateFrom")
              ) {
                return (
                  <div className="col-sm-2" key={index}>
                    <DatePicker
                      className="custom-calendar"
                      placeholder=" "
                      id="From Date"
                      lable="From Date"
                      name="InvoiceDateFrom"
                      value={
                        searchData?.InvoiceDateFrom
                          ? new Date(searchData?.InvoiceDateFrom)
                          : new Date()
                      }
                      onChange={dateSelect}
                    />
                  </div>
                );
              }

              if (
                item?.ControlDisplayID === "InvoiceDateTo" &&
                isHideController("InvoiceDateTo")
              ) {
                return (
                  <div className="col-sm-2" key={index}>
                    <DatePicker
                      className="custom-calendar"
                      placeholder=" "
                      id="To Date"
                      lable="To Date"
                      name="InvoiceDateTo"
                      value={
                        searchData?.InvoiceDateTo
                          ? new Date(searchData?.InvoiceDateTo)
                          : new Date()
                      }
                      minDate={searchData?.InvoiceDateFrom}
                      onChange={dateSelect}
                    />
                  </div>
                );
              }

              if (
                item?.ControlDisplayID === "InvoiceNo" &&
                isHideController("InvoiceNo")
              ) {
                return (
                  <div className="col-sm-2" key={index}>
                    <Input
                      id="Invoice Number"
                      lable="Invoice Number"
                      placeholder=" "
                      type="text"
                      name="InvoiceNo"
                      value={searchData?.InvoiceNo}
                      onChange={handleSearchChange}
                    />
                  </div>
                );
              }

              return null;
            })}

          {/* Buttons */}
          <div
            className="col-sm-2 d-flex align-items-center"
            style={{ gap: "8px" }}
          >
            <SearchButton
              text={searchLoad ? "Loading" : t("Search")}
              onClick={handleSearch}
              disabled={searchLoad}
              loading={searchLoad}
            />
            <CancelButton
              text={"Invoice Cancel"}
              onClick={handleInvoiceCancel}
            />
          </div>
        </div>
      </Accordion>

      {/* ── Search Detail Accordion ── */}
      <Accordion
        title={t("Search Detail")}
        className="invoice-search-detail"
        defaultValue={true}
        notOpen={true}
        linkTo="#"
        linkTitle={
          <>
            {/* Desktop only */}
            <div
              className="link-title-container d-none d-md-flex align-items-center flex-wrap"
              style={{ gap: "8px" }}
            >
              <span
                onClick={(e) => { e.stopPropagation(); filterStatusWise(0); }}
                style={{ display: "inline-flex", alignItems: "center", gap: "4px", cursor: "pointer", padding: "2px 8px", borderRadius: "4px", backgroundColor: activeFilter === 0 ? "#7bcf7b" : "", fontSize: "12px" }}
              >
                <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#7bcf7b", display: "inline-block" }} />
                {t("Active Invoice")} ({statusCount(0)})
              </span>
              <span
                onClick={(e) => { e.stopPropagation(); filterStatusWise(1); }}
                style={{ display: "inline-flex", alignItems: "center", gap: "4px", cursor: "pointer", padding: "2px 8px", borderRadius: "4px", backgroundColor: activeFilter === 1 ? "#f5c6cb" : "", fontSize: "12px" }}
              >
                <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#f5c6cb", display: "inline-block" }} />
                {t("InActive Invoice")} ({statusCount(1)})
              </span>

              <Input
                type="text"
                placeholder="Search Invoice Cancel Details..."
                value={searchText}
                onClick={(e) => e.stopPropagation()}
                onChange={handleChangeSearch}
                className="mt-2"
              />
            </div>
            {/* Mobile: small search bar, right side */}
            <div
              className="d-flex d-md-none mt-2 mr-2"
              onClick={(e) => e.stopPropagation()}
            >
              <Input
                type="text"
                placeholder="Search..."
                value={searchText}
                onClick={(e) => e.stopPropagation()}
                onChange={handleChangeSearch}
                style={{ width: "130px" }}
              />
            </div>
          </>
        }
      >
        {filteredData?.length > 0 ? (
          <>
            <Tables>
              <thead className="cf text-center" style={{ zIndex: 99 }}>
                <tr>
                  {FilterData?.filter(
                    (item) => item.IsShow == 1 && item.TypeId == 2,
                  )?.map((header, idx) => {
                    if (header.ControlDisplayID === "S.No")
                      return <th key={idx}>{t("S.No")}</th>;
                    if (header.ControlDisplayID === "BusinessUnit")
                      return <th key={idx}>{t("BusinessUnit")}</th>;
                    if (header.ControlDisplayID === "Invoice No.")
                      return <th key={idx}>{t("Invoice No.")}</th>;
                    if (header.ControlDisplayID === "RateTypeCode")
                      return <th key={idx}>{t("RateTypeCode")}</th>;
                    if (header.ControlDisplayID === "RateTypeName")
                      return <th key={idx}>{t("RateTypeName")}</th>;
                    if (header.ControlDisplayID === "Invoice Date")
                      return <th key={idx}>{t("Invoice Date")}</th>;
                    if (header.ControlDisplayID === "Net Amount")
                      return <th key={idx}>{t("Net Amount")}</th>;
                    if (header.ControlDisplayID === "Invoice Amount")
                      return <th key={idx}>{t("Invoice Amount")}</th>;
                    if (header.ControlDisplayID === "Cancelled By")
                      return <th key={idx}>{t("Cancelled By")}</th>;
                    if (header.ControlDisplayID === "Cancelled On")
                      return <th key={idx}>{t("Cancelled On")}</th>;
                    if (header.ControlDisplayID === "Action")
                      return (
                        <th key={idx}>
                          {isAllCancelled ? (
                            t("Cancel Reason")
                          ) : (
                            <Form.Check
                              className="mx-2"
                              checked={
                                selectedRowForCancel?.length > 0 &&
                                selectedRowForCancel?.length ===
                                tableData?.filter((x) => x?.iscancel == 0)
                                  ?.length
                              }
                              onChange={handleGlobalSelectAll}
                            />
                          )}
                        </th>
                      );
                    return (
                      <th key={idx}>
                        {t(
                          header.ControlDisplayName || header.ControlDisplayID,
                        )}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {currentTableData?.map((ele, index) => {
                  const actualIndex = (currentPage - 1) * pageSize + index;
                  return (
                    <tr
                      key={actualIndex}
                      style={{
                        backgroundColor:
                          ele?.iscancel == 0 ? "#7bcf7b" : "#f5c6cb",
                      }}
                    >
                      {FilterData?.filter(
                        (item) => item.IsShow == 1 && item.TypeId == 2,
                      )?.map((col, colIndex) => {
                        if (col.ControlDisplayID === "S.No")
                          return (
                            <td key={colIndex} data-title="S.No" className="px-2 py-2">
                              &nbsp;{actualIndex + 1}
                            </td>
                          );
                        if (col.ControlDisplayID === "BusinessUnit")
                          return (
                            <td key={colIndex} data-title="Business Unit" className="px-2 py-2">
                              &nbsp;{ele?.BusinessUnit}
                            </td>
                          );
                        if (col.ControlDisplayID === "Invoice No.")
                          return (
                            <td key={colIndex} data-title="Invoice No." className="px-2 py-2">
                              &nbsp;{ele?.InvoiceNo}
                            </td>
                          );
                        if (col.ControlDisplayID === "RateTypeCode")
                          return (
                            <td key={colIndex} data-title="Rate Type Code" className="px-2 py-2">
                              &nbsp;{ele?.RateTypeCode}
                            </td>
                          );
                        if (col.ControlDisplayID === "RateTypeName")
                          return (
                            <td key={colIndex} data-title="Rate Type Name" className="px-2 py-2">
                              &nbsp;{ele?.RateType}
                            </td>
                          );
                        if (col.ControlDisplayID === "Invoice Date")
                          return (
                            <td key={colIndex} data-title="Invoice Date" className="px-2 py-2">
                              &nbsp;{ele?.InvoiceCreatedOn}
                            </td>
                          );
                        if (col.ControlDisplayID === "Net Amount")
                          return (
                            <td key={colIndex} data-title="Net Amount" className="px-2 py-2">
                              &nbsp;{ele?.NetAmount}
                            </td>
                          );
                        if (col.ControlDisplayID === "Invoice Amount")
                          return (
                            <td key={colIndex} data-title="Invoice Amount" className="px-2 py-2">
                              &nbsp;{ele?.InvoiceAmount}
                            </td>
                          );
                        if (col.ControlDisplayID === "Cancelled By")
                          return (
                            <td key={colIndex} data-title="Cancelled By" className="px-2 py-2">
                              &nbsp;{ele?.InvoiceCancelBy || ""}
                            </td>
                          );
                        if (col.ControlDisplayID === "Cancelled On")
                          return (
                            <td key={colIndex} data-title="Cancelled On" className="px-2 py-2">
                              &nbsp;{ele?.InvoiceCancelledOn || "-"}
                            </td>
                          );
                        if (col.ControlDisplayID === "Action")
                          return (
                            <td key={colIndex} data-title="Action" className="px-2 py-2">
                              {ele?.iscancel == 0 ? (
                                <Form.Check
                                  checked={selectedRowForCancel?.includes(
                                    ele?.InvoiceNo,
                                  )}
                                  onChange={() => selectRowForCancel(ele)}
                                />
                              ) : (
                                <div>
                                  <p className="mb-0">
                                    CancelBy: {ele?.InvoiceCancelBy}
                                  </p>
                                  <p className="mb-0">
                                    CancelOn: {ele?.InvoiceCancelledOn}
                                  </p>
                                  <p className="mb-0">
                                    Reason: {ele?.CancelReason}
                                  </p>
                                </div>
                              )}
                            </td>
                          );
                        return <td key={colIndex}></td>;
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </Tables>

            {/* ── Pagination ── */}
            {filteredData.length > 0 && (
              <div className="d-flex flex-wrap justify-content-end align-items-end gap-2 mt-3">
                <div style={{ minWidth: "150px" }}>
                  <ReactSelect
                    value={pageSize}
                    dynamicOptions={[
                      { label: "25", value: 25 },
                      { label: "50", value: 50 },
                      { label: "75", value: 75 },
                      { label: "100", value: 100 },
                    ]}
                    name={"pageSize"}
                    removeIsClearable={true}
                    onChange={(name, value) => {
                      setPageSize(value?.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
                <Pagination
                  className="pagination-bar"
                  currentPage={currentPage}
                  totalCount={filteredData.length}
                  pageSize={pageSize}
                  onPageChange={(page) => setCurrentPage(page)}
                />
              </div>
            )}
          </>
        ) : (
          <NoRecordFound />
        )}
      </Accordion>

      {/* ── Cancel Modal ── */}
      <Dialog
        header="Cancel Selected Invoice"
        visible={showModal}
        onHide={onHideModal}
        className={`${theme}`}
        style={{ width: "40vw" }}
        breakpoints={{ "98%": "59vw" }}
        footer={
          <div
            style={{ gap: "4px" }}
            className="d-flex justify-content-between p-2 border-t bg-white sticky bottom-0"
          >
            <Button
              variant="secondary rounded"
              className="px-4"
              onClick={cancelSelectedInvoice}
            >
              Cancel Invoice
            </Button>
            <Button
              variant="secondary rounded"
              className="px-4"
              onClick={onHideModal}
            >
              Close
            </Button>
          </div>
        }
      >
        <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
          <Form.Label style={{ fontWeight: 600 }} className="mb-1 fw-normal">
            Enter Cancel Reason:
          </Form.Label>
          <Form.Control
            value={cancelReason}
            onChange={(e) => setCancelReason(e?.target?.value)}
            className="text-area"
            as="textarea"
            rows={2}
          />
        </Form.Group>
      </Dialog>
    </>
  );
};

export default InvoiceCancel;
