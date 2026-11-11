import React, { useEffect, useState, useMemo } from "react";
import { toast } from "react-toastify";
import moment from "moment";
import DatePicker from "../../components/formComponent/DatePicker";
import { SelectBox } from "../../components/formComponent/SelectBox";
import { ExportToExcel } from "../../utils/helpers";
import Tables from "../../components/UI/customTable";
import Accordion from "@app/components/UI/Accordion";
import Loading from "../../components/loader/Loading";
import { axiosInstance, axiosReport } from "../../utils/axiosInstance";
import { isChecked } from "../util/Commonservices";
import InvoiceCreationModal from "./InvoiceCreationModal";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import { useTranslation } from "react-i18next";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { apiUrls } from "../../utils/apiUrls";
import "./Invoice.css";
import { formatIndianNumber } from "../../utils/utils";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { SaveButton, SearchButton } from "../../components/UI/CustomButton";
import Input from "../../components/formComponent/Input";
import { getSearchController } from "../../utils/NetworkApi/commonApi";
import Pagination from "../../Pagination/Pagination";
import PageControlGear from "../../components/PageGearModel/PageControlGear";
import { parseTypedDate } from "../../utils/validations/validationHelpers";

const InvoiceCreation = () => {
  const [tableData, setTableData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const { HideInvoiceBillingCycle } = useLocalStorage("userData", "get");
  const { t } = useTranslation();
  const [show, setShow] = useState({ modal: false, id: "" });
  const [load, setLoad] = useState({ name: "", loading: false });
  const [CentreData, setCentreData] = useState([]);
  const [dropDownList, setDropdownList] = useState({
    centreList: [],
    invoiceBillingCycleList: [],
  });
  const [controllerDynamicList, setControllerDynamicList] = useState([]);
  const [tabbingOrder, setTabbingOrder] = useState([]);
  const [FilterData, setFilterData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(500);
  const [excelLoad, setExcelLoad] = useState({ index: -1, load: false });
  const PAGE_ID = "706";
  const [rateTypeLoading, setRateTypeLoading] = useState(false);

  const [payload, setPayload] = useState({
    FromDate: new Date(),
    ToDate: new Date(),
    invoiceBillingCycle: "",
    BusinessUnitID: "",
    InvoiceDate: new Date(),
  });

  const [headWithApiFields, setHeadWithApiFields] = useState({
    "Sr.No.": "srNo",
    "Business Unit ID": "BusinessUnitID",
    Centre: "Centre",
    "Client ID": "ClientID",
    "Client Code": "ClientCode",
    "RateType Name": "ClientName",
    "Net Amount": "Amount",
    "Invoice Amount": "ShareAmt",
    "Invoice Date": "InvoiceDate",
  });

  // ── Memoized current page data ────────────────────────────────────────────
  const currentTableData = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * pageSize;
    const lastPageIndex = firstPageIndex + pageSize;
    return filteredData.slice(firstPageIndex, lastPageIndex);
  }, [currentPage, pageSize, filteredData]);

  // ── Search handler ────────────────────────────────────────────────────────
  const handleChangeSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchText(e.target.value);

    if (!value.trim()) {
      setFilteredData(tableData);
      setCurrentPage(1);
      return;
    }

    const filtered = tableData.filter((row) =>
      [
        "Centre",
        "ClientCode",
        "ClientName",
        "Amount",
        "ShareAmt",
        "InvoiceDate",
        "BusinessUnitID",
        "ClientID",
      ].some((key) =>
        String(row[key] || "")
          .toLowerCase()
          .includes(value),
      ),
    );

    setFilteredData(filtered);
    setCurrentPage(1);
  };

  // ── API: Get Business Units ───────────────────────────────────────────────
  const getPatientType = () => {
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
        setDropdownList((prev) => ({ ...prev, centreList }));
      })
      .catch(console.log);
  };

  // ── API: Get Invoice Billing Cycle ────────────────────────────────────────
  const getInvoiceBillingCentre = () => {
    axiosInstance
      .post(apiUrls?.getGlobalData, { type: "InvoiceBillingCycle" })
      .then((res) => {
        const order = ["Monthly", "15 Days", "Weekly"];
        const sortedData = (res?.data?.message || []).sort((a, b) => {
          const indexA = order.indexOf(a.FieldDisplay);
          const indexB = order.indexOf(b.FieldDisplay);
          if (indexA === -1 && indexB === -1) return 0;
          if (indexA === -1) return 1;
          if (indexB === -1) return -1;
          return indexA - indexB;
        });

        const invoiceBillingCycleList = sortedData?.map((ele) => ({
          ...ele,
          value: String(ele?.FieldDisplay),
          label: ele?.FieldDisplay,
        }));
        setDropdownList((prev) => ({ ...prev, invoiceBillingCycleList }));
      })
      .catch(console.log);
  };

  // ── API: Get Access Centres ───────────────────────────────────────────────
  const getAccessCentres = (value, invoiceCycle, showLoader = false) => {
    if (showLoader) {
      setRateTypeLoading(true);
    }
    axiosInstance
      .post("Centre/BindRateTypeWorkOrderSearch", {
        centreID: value?.toString() || 0,
        rateTypeID: 0,
        AllowEstimate: 0,
        CentreType: "",
        AllowHomeCollection: 0,
        AllowMembershipCard: 0,
        PageName: "YES",
        InvoiceBillingCycle: invoiceCycle || payload?.invoiceBillingCycle,
      })
      .then((res) => {
        const data = Array.isArray(res.data.message)
          ? res.data.message
          : [];

        const formatted = data.map((ele) => ({
          value: ele.RateTypeID,
          label: ele.RateTypeName
            ?.replace(/\r?\n/g, " ")
            .trim(),
        }));

        setCentreData(formatted);
      })
      .catch((err) => {
        setCentreData([]);
        if (showLoader) setRateTypeLoading(false);
        console.log(err);
      })
      .finally(() => {
        if (showLoader) setRateTypeLoading(false);
      });
  };

  const controllerDynamic = async () => {
    try {
      const { controllersData, controllerTabbingOrder } =
        await getSearchController(PAGE_ID);
      setTabbingOrder(controllerTabbingOrder);
      setControllerDynamicList(controllersData);

      if (Array.isArray(controllersData)) {
        setFilterData(controllersData);
        const dynamicMappings = { ...headWithApiFields };
        controllersData.forEach((column) => {
          if (!dynamicMappings[column.ControlDisplayID]) {
            dynamicMappings[column.ControlDisplayID] =
              column.ApiFieldName || column.ControlDisplayID;
          }
        });
        setHeadWithApiFields(dynamicMappings);
      }
    } catch (error) {
      console.error("error in controllerDynamic:", error);
    }
  };

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

  const handleCheck = (e, index) => {
    const { checked, name } = e.target;
    if (index >= 0) {
      const data = [...tableData];
      data[index][name] = checked;
      setTableData(data);
      const fData = [...filteredData];
      const fIndex = fData.findIndex(
        (row) =>
          row.ClientID === data[index].ClientID &&
          row.BusinessUnitID === data[index].BusinessUnitID,
      );
      if (fIndex >= 0) {
        fData[fIndex][name] = checked;
        setFilteredData(fData);
      }
    } else {
       const currentPageKeys = new Set(
      currentTableData.map((row) => `${row.ClientID}_${row.BusinessUnitID}`)
    );

    const updatedTableData = tableData.map((ele) =>
      currentPageKeys.has(`${ele.ClientID}_${ele.BusinessUnitID}`)
        ? { ...ele, [name]: checked }
        : ele
    );

    const updatedFilteredData = filteredData.map((ele) =>
      currentPageKeys.has(`${ele.ClientID}_${ele.BusinessUnitID}`)
        ? { ...ele, [name]: checked }
        : ele
    );

       setTableData(updatedTableData);
    setFilteredData(updatedFilteredData);
    }
  };

  const saveInvoice = () => {
    const filteredChecked = tableData.filter((ele) => ele.IsChecked === true);
    if (filteredChecked.length > 0) {
      setLoad({ name: "SaveLoading", loading: true });
      const fromDateVal =
        parseTypedDate(document.getElementById("FromDate")?.value) ||
        payload?.FromDate;
      const toDateVal =
        parseTypedDate(document.getElementById("ToDate")?.value) ||
        payload?.ToDate;
      const invoiceDateVal =
        parseTypedDate(document.getElementById("InvoiceDate")?.value) ||
        payload?.InvoiceDate;
      const val = filteredChecked.map(
        (ele) => `${ele?.ClientID}#${ele?.BusinessUnitID}#${ele?.ClientName}`,
      );
      axiosInstance
        .post("Accounts/InvoiceCreation", {
          FromDate: moment(fromDateVal).format("YYYY-MM-DD"),
          ToDate: moment(toDateVal).format("YYYY-MM-DD"),
          InvoiceDate: moment(invoiceDateVal).format("YYYY-MM-DD"),
          InvoiceTo: val,
          CentreName: dropDownList?.centreList.find(
            (item) => item?.value == payload?.BusinessUnitID,
          )?.label,
        })
        .then((res) => {
          setLoad({ name: "", loading: false });
          InvoiceCreationSearch();
          toast.success(res?.data?.message);
        })
        .catch(() => setLoad({ name: "", loading: false }));
    } else {
      toast.error("Please select atleast one.");
    }
  };

  const handleSearchSelectChange = (label, value) => {
    const updatedValue = String(value?.value);

    setPayload((prev) => {
      const newPayload = { ...prev, [label]: updatedValue };

      if (label === "BusinessUnitID") {
        getAccessCentres(updatedValue, newPayload.invoiceBillingCycle,true);
      }

      if (label === "invoiceBillingCycle") {
        getAccessCentres(newPayload.BusinessUnitID, updatedValue);
      }

      return newPayload;
    });
  };
  const handleSelectChange = (event) => {
    const { name, value } = event.target;

    setPayload((prev) => {
      const newPayload = { ...prev, [name]: value };

      if (name === "BusinessUnitID") {
        getAccessCentres(value, newPayload.invoiceBillingCycle,true);
      }

      if (name === "invoiceBillingCycle") {
        getAccessCentres(newPayload.BusinessUnitID, value);
      }

      return newPayload;
    });
  };

  const dateSelect = (value, name) => {
    setPayload({ ...payload, [name]: value });
    setTableData([]);
    setFilteredData([]);
  };

  // ── Search API ────────────────────────────────────────────────────────────
  const InvoiceCreationSearch = () => {
    setLoad({ name: "searchLoading", loading: true });
    const fromDateVal =
      parseTypedDate(document.getElementById("FromDate")?.value) ||
      payload?.FromDate;
    const toDateVal =
      parseTypedDate(document.getElementById("ToDate")?.value) ||
      payload?.ToDate;
    const invoiceDateVal =
      parseTypedDate(document.getElementById("InvoiceDate")?.value) ||
      payload?.InvoiceDate;

    axiosInstance
      .post("Accounts/InvoiceCreationSearch", {
        ...payload,
        FromDate: moment(fromDateVal).format("DD-MMM-YYYY"),
        ToDate: moment(toDateVal).format("DD-MMM-YYYY"),
        InvoiceDate: moment(invoiceDateVal).format("DD-MMM-YYYY"),
        SearchType: "Summary",
        BusinessUnitID: Number(payload?.BusinessUnitID || 0),
      })
      .then((res) => {
        setLoad({ name: "", loading: false });
        if (res?.data.success && res?.data?.message.length > 0) {
          setTableData(res?.data?.message);
          setFilteredData(res?.data?.message);
          setCurrentPage(1);
          setSearchText("");
        } else {
          toast.error("No Record Found");
          setTableData([]);
          setFilteredData([]);
        }
      })
      .catch(() => {
        setLoad({ name: "", loading: false });
        setTableData([]);
        setFilteredData([]);
        toast.error("Something went wrong");
      });
  };

  // ── Download Excel (dynamic columns) ─────────────────────────────────────
  const downloadExcel = (ele, index) => {
    setExcelLoad({ index, load: true });
    axiosReport
      .post(
        "commonReports/InvoiceCreationRateTypeDetail",
        {
          FromDate: moment(payload?.FromDate).format("DD-MMM-YYYY"),
          ToDate: moment(payload?.ToDate).format("DD-MMM-YYYY"),
          rateTypeID: ele?.ClientID,
          reportFormat: "Excel",
        },
        { responseType: "blob" },
      )
      .then(async (res) => {
       
         const contentType = res.headers?.["content-type"] || "";
            if (contentType.includes("application/json")) {
            const text = await res.data.text();
            const json = JSON.parse(text);
            toast.warning(json?.message || "No records found.");
            return;
            }

            if (!res.data || res.data.size === 0) {
              toast.warning("No data available to export.");
              return;
              }
  
              const url = window.URL.createObjectURL(
              new Blob([res.data], {
                  type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              })
              );
              const link = document.createElement("a");
              link.href = url;
              link.setAttribute("download", "InvoiceCreationReport.xlsx");
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              window.URL.revokeObjectURL(url);
              toast.success("Excel File Downloaded");
               setExcelLoad({ index, load: false });
      })
      .catch((err) => {
        setExcelLoad({ index, load: false });
        console.log(err);
      });
  };

  const handleModalState = (ele) => {
    setShow({
      modal: true,
      id: {
        ...payload,
        FromDate: moment(payload?.FromDate).format("DD-MMM-YYYY"),
        ToDate: moment(payload?.ToDate).format("DD-MMM-YYYY"),
        SearchType: "Details",
        BusinessUnitID: Number(ele?.BusinessUnitID || 0),
        ClientID: Number(ele?.ClientID),
      },
    });
  };

  const handleModalClose = () => setShow({ modal: false, id: "" });

  const totalNetAmout = tableData?.reduce(
    (sum, row) => sum + (row?.Amount || 0),
    0,
  );
  const totalSharedAmount = tableData?.reduce(
    (sum, row) => sum + (row?.ShareAmt || 0),
    0,
  );
  const CheckedBox = () =>
    tableData?.filter((ele) => ele?.IsChecked === true).length > 0;

  useEffect(() => {
    getPatientType();
    getAccessCentres(payload.BusinessUnitID, payload.invoiceBillingCycle,true);
    getInvoiceBillingCentre();
    controllerDynamic();
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <Accordion
        name={t("Invoice Creation")}
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
                item?.ControlDisplayID === "BusinessUnitID" &&
                isHideController("BusinessUnitID")
              ) {
                return (
                  <div className="col-sm-2" key={index}>
                    {/* <SelectBox
                      options={[
                        { label: "Select", value: "" },
                        ...dropDownList?.centreList,
                      ]}
                      name="BusinessUnitID"
                      lable="Business Unit"
                      id="BusinessUnitID"
                      selectedValue={payload?.BusinessUnitID}
                      onChange={handleSelectChange}
                    /> */}
                    <ReactSelect
                      dynamicOptions={[
                        { label: "Select", value: "" },
                        ...dropDownList?.centreList,
                      ]}
                      name="BusinessUnitID"
                      lable={t("Business Unit")}
                      id="BusinessUnitID"
                      removeIsClearable={true}
                      placeholderName={t("Business Unit")}
                      value={payload?.BusinessUnitID}
                      onChange={handleSearchSelectChange}
                      className="required-fields"
                    />
                  </div>
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
                          ...dropDownList?.invoiceBillingCycleList,
                        ]}
                        name="invoiceBillingCycle"
                        lable="Invoice Billing Cycle"
                        id="invoiceBillingCycle"
                        selectedValue={payload?.invoiceBillingCycle}
                        onChange={handleSelectChange}
                      /> */}
                    <ReactSelect
                      dynamicOptions={[
                        { label: "Select", value: "" },
                        ...dropDownList?.invoiceBillingCycleList,
                      ]}
                      name="invoiceBillingCycle"
                      lable={t("Invoice Billing Cycle")}
                      id="invoiceBillingCycle"
                      removeIsClearable={true}
                      placeholderName={t("Invoice Billing Cycle")}
                      value={payload?.invoiceBillingCycle}
                      onChange={handleSearchSelectChange}
                      className="required-fields"
                    />
                  </div>
                );
              }
              if (
                item?.ControlDisplayID === "InvoiceTo" &&
                isHideController("InvoiceTo")
              ) {
                return (
                  <div className="col-sm-2" key={index}>
                    <ReactSelect
                      dynamicOptions={[{ label: "Select", value: "" }, ...CentreData]}
                      name="InvoiceTo"
                      lable={t("Rate Type")}
                      id="InvoiceTo"
                      removeIsClearable={true}
                      placeholderName={t("Rate Type")}
                      value={payload?.InvoiceTo}
                      onChange={handleSearchSelectChange}
                      className="required-fields"
                      isLoading={rateTypeLoading}
                    />
                  </div>
                );
              }
              if (
                item?.ControlDisplayID === "FromDate" &&
                isHideController("FromDate")
              ) {
                return (
                  <div className="col-sm-2" key={index}>
                    <DatePicker
                      className="custom-calendar"
                      placeholder=" "
                      id="FromDate"
                      lable="FromDate"
                      name="FromDate"
                      value={payload?.FromDate}
                      onChange={dateSelect}
                      maxDate={new Date()}
                    />
                  </div>
                );
              }
              if (
                item?.ControlDisplayID === "ToDate" &&
                isHideController("ToDate")
              ) {
                return (
                  <div className="col-sm-2" key={index}>
                    <DatePicker
                      className="custom-calendar"
                      placeholder=" "
                      id="ToDate"
                      lable="ToDate"
                      name="ToDate"
                      value={payload?.ToDate}
                      onChange={dateSelect}
                      minDate={new Date(payload.FromDate)}
                    />
                  </div>
                );
              }
              if (
                item?.ControlDisplayID === "InvoiceDate" &&
                isHideController("InvoiceDate")
              ) {
                return (
                  <div className="col-sm-2" key={index}>
                    <DatePicker
                      className="custom-calendar"
                      placeholder=" "
                      id="InvoiceDate"
                      lable="InvoiceDate"
                      name="InvoiceDate"
                      value={payload?.InvoiceDate}
                      onChange={dateSelect}
                      maxDate={new Date()}
                    />
                  </div>
                );
              }
            })}
          <div className="d-flex align-items-center justify-content-center mb-2">
            <SearchButton
              text={"Search"}
              onClick={InvoiceCreationSearch}
                style={{ gap: "3px" }}
              className="mx-2"
              loading={load?.name === "searchLoading" && load?.loading}
              disabled={load?.name === "searchLoading" && load?.loading}
            />
            {CheckedBox() && (
              <div className="px-1">
                {load?.name === "SaveLoading" && load?.loading ? (
                  <Loading />
                ) : (
                  <div className="d-flex align-items-center justify-content-end">
                    <SaveButton
                      text={"Save"}
                      style={{ width: "fit-content" }}
                      onClick={saveInvoice}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Accordion>

      <Accordion
        title={t("Search Detail")}
        className="invoice-search-detail"
        linkTo="#"
        linkTitle={
          <>
            {/* Desktop only */}
            <div className="link-title-container mt-2 d-none d-md-flex" id="pr_id_11">
              <label>
                {t("Total Invoice Count")} :
                <span className="text-danger" style={{ marginLeft: "10px" }}>
                  {filteredData.length}
                </span>
              </label>
              |
              <label>
                {t("Total NetAmount")} :
                <span className="text-danger" style={{ marginLeft: "10px" }}>
                  {formatIndianNumber(totalNetAmout)}
                </span>
              </label>
              |
              <label>
                {t("Total Invoice Amount")} :
                <span className="text-danger" style={{ marginLeft: "10px" }}>
                  {formatIndianNumber(totalSharedAmount)}
                </span>
              </label>
              <Input
                type="text"
                placeholder="Search Invoice Creation Details..."
                value={searchText}
                onClick={(e) => e.stopPropagation()}
                onChange={handleChangeSearch}
                className=""
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
        seconTitle={
          /* Mobile: stats full-width on row 2 */
          <div
            className="d-flex d-md-none align-items-center"
            style={{ fontSize: "10px", gap: "0 3px", width: "100%", flexWrap: "nowrap" }}
            onClick={(e) => e.stopPropagation()}
          >
            <span style={{ whiteSpace: "nowrap" }}>Total Invoice Count : <span className="text-danger fw-bold">{filteredData.length}</span></span>
            <span style={{ color: "#adb5bd", flexShrink: 0 }}>|</span>
            <span style={{ whiteSpace: "nowrap" }}>Net Amount : <span className="text-danger fw-bold">{formatIndianNumber(totalNetAmout)}</span></span>
            <span style={{ color: "#adb5bd", flexShrink: 0 }}>|</span>
            <span style={{ whiteSpace: "nowrap" }}>Invoice Amount : <span className="text-danger fw-bold">{formatIndianNumber(totalSharedAmount)}</span></span>
          </div>
        }
        defaultValue={true}
      >
        {load?.name === "searchLoading" && load?.loading ? (
          <Loading />
        ) : filteredData?.length > 0 ? (
          <>
            <Tables>
              <thead className="text-center cf" style={{ zIndex: 99 }}>
                <tr>
                  {/* <th>{t("View")}</th> */}
                  {FilterData?.filter(
                    (item) => item.IsShow == 1 && item.TypeId == 2,
                  )?.map((header, idx) => {
                    if (header.ControlDisplayID === "Sr.No.")
                      return <th key={idx}>{t("Sr.No.")}</th>;
                    if (header.ControlDisplayID === "Business Unit ID")
                      return <th key={idx}>{t("Business Unit ID")}</th>;
                    if (header.ControlDisplayID === "Centre")
                      return <th key={idx}>{t("Centre")}</th>;
                    if (header.ControlDisplayID === "Client ID")
                      return <th key={idx}>{t("Client ID")}</th>;
                    if (header.ControlDisplayID === "Client Code")
                      return <th key={idx}>{t("RateType Code")}</th>;
                    if (header.ControlDisplayID === "RateType Name")
                      return <th key={idx}>{t("RateType Name")}</th>;
                    if (header.ControlDisplayID === "Net Amount")
                      return <th key={idx}>{t("Net Amount")}</th>;
                    if (header.ControlDisplayID === "Invoice Amount")
                      return <th key={idx}>{t("Invoice Amount")}</th>;
                    if (header.ControlDisplayID === "Invoice Date")
                      return <th key={idx}>{t("Invoice Date")}</th>;
                    return (
                      <th key={idx}>
                        {t(
                          header.ControlDisplayName || header.ControlDisplayID,
                        )}
                      </th>
                    );
                  })}

                  <th>
                    <input
                      type="checkbox"
                      name="IsChecked"
                      onChange={(e) => handleCheck(e)}
                      checked={
                        currentTableData.length > 0
                        ? currentTableData.every((row) => row?.IsChecked === true)
                        : false
                      }
                    />
                  </th>
                </tr>
              </thead>

              <tbody className="jsh">
                {currentTableData?.map((ele, index) => {
                  const actualIndex = (currentPage - 1) * pageSize + index;
                  const originalIndex = tableData.findIndex(
                    (row) =>
                      row.ClientID === ele.ClientID &&
                      row.BusinessUnitID === ele.BusinessUnitID,
                  );
                  return (
                    <tr key={index}>
                      {/* <td data-title="View">
                        <div
                          className="px-2"
                          style={{
                            width: "fit-content",
                            display: "flex",
                            justifyContent: "space-start",
                          }}
                        >
                          <i
                            className="fa fa-search mt-2"
                            onClick={() => handleModalState(ele)}
                          />
                          {excelLoad.load && excelLoad.index == index ? (
                            <Loading />
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              x="0px"
                              y="0px"
                              width="29"
                              height="23"
                              viewBox="0 0 48 48"
                              onClick={() => downloadExcel(ele, index)}
                            >
                              <path
                                fill="#169154"
                                d="M29,6H15.744C14.781,6,14,6.781,14,7.744v7.259h15V6z"
                              ></path>
                              <path
                                fill="#18482a"
                                d="M14,33.054v7.202C14,41.219,14.781,42,15.743,42H29v-8.946H14z"
                              ></path>
                              <path
                                fill="#0c8045"
                                d="M14 15.003H29V24.005000000000003H14z"
                              ></path>
                              <path
                                fill="#17472a"
                                d="M14 24.005H29V33.055H14z"
                              ></path>
                              <g>
                                <path
                                  fill="#29c27f"
                                  d="M42.256,6H29v9.003h15V7.744C44,6.781,43.219,6,42.256,6z"
                                ></path>
                                <path
                                  fill="#27663f"
                                  d="M29,33.054V42h13.257C43.219,42,44,41.219,44,40.257v-7.202H29z"
                                ></path>
                                <path
                                  fill="#19ac65"
                                  d="M29 15.003H44V24.005000000000003H29z"
                                ></path>
                                <path
                                  fill="#129652"
                                  d="M29 24.005H44V33.055H29z"
                                ></path>
                              </g>
                              <path
                                fill="#0c7238"
                                d="M22.319,34H5.681C4.753,34,4,33.247,4,32.319V15.681C4,14.753,4.753,14,5.681,14h16.638 C23.247,14,24,14.753,24,15.681v16.638C24,33.247,23.247,34,22.319,34z"
                              ></path>
                              <path
                                fill="#fff"
                                d="M9.807 19L12.193 19 14.129 22.754 16.175 19 18.404 19 15.333 24 18.474 29 16.123 29 14.013 25.07 11.912 29 9.526 29 12.719 23.982z"
                              ></path>
                            </svg>
                          )}
                        </div>
                      </td> */}

                      {/* Dynamic cells */}
                      {FilterData?.filter(
                        (item) => item.IsShow == 1 && item.TypeId == 2,
                      )?.map((column, colIndex) => {
                        if (column.ControlDisplayID === "Sr.No.")
                          // return <td key={colIndex}>{actualIndex + 1}</td>;
                          return (
                            <td key={colIndex} data-title="View">
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                }}
                              >
                                <span>{actualIndex + 1}</span>

                                <i
                                  className="fa fa-search"
                                  style={{ cursor: "pointer" }}
                                  onClick={() => handleModalState(ele)}
                                />

                                {excelLoad.load && excelLoad.index == index ? (
                                  <Loading />
                                ) : (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="22"
                                    height="20"
                                    viewBox="0 0 48 48"
                                    style={{ cursor: "pointer" }}
                                    onClick={() => downloadExcel(ele, index)}
                                  >
                                    <path
                                      fill="#169154"
                                      d="M29,6H15.744C14.781,6,14,6.781,14,7.744v7.259h15V6z"
                                    ></path>
                                    <path
                                      fill="#18482a"
                                      d="M14,33.054v7.202C14,41.219,14.781,42,15.743,42H29v-8.946H14z"
                                    ></path>
                                    <path
                                      fill="#0c8045"
                                      d="M14 15.003H29V24.005000000000003H14z"
                                    ></path>
                                    <path
                                      fill="#17472a"
                                      d="M14 24.005H29V33.055H14z"
                                    ></path>
                                    <g>
                                      <path
                                        fill="#29c27f"
                                        d="M42.256,6H29v9.003h15V7.744C44,6.781,43.219,6,42.256,6z"
                                      ></path>
                                      <path
                                        fill="#27663f"
                                        d="M29,33.054V42h13.257C43.219,42,44,41.219,44,40.257v-7.202H29z"
                                      ></path>
                                      <path
                                        fill="#19ac65"
                                        d="M29 15.003H44V24.005000000000003H29z"
                                      ></path>
                                      <path
                                        fill="#129652"
                                        d="M29 24.005H44V33.055H29z"
                                      ></path>
                                    </g>
                                    <path
                                      fill="#0c7238"
                                      d="M22.319,34H5.681C4.753,34,4,33.247,4,32.319V15.681C4,14.753,4.753,14,5.681,14h16.638C23.247,14,24,14.753,24,15.681v16.638C24,33.247,23.247,34,22.319,34z"
                                    ></path>
                                    <path
                                      fill="#fff"
                                      d="M9.807 19L12.193 19 14.129 22.754 16.175 19 18.404 19 15.333 24 18.474 29 16.123 29 14.013 25.07 11.912 29 9.526 29 12.719 23.982z"
                                    ></path>
                                  </svg>
                                )}
                              </div>
                            </td>
                          );

                        if (column.ControlDisplayID === "Business Unit ID")
                          return <td key={colIndex} data-title="Business Unit ID">{ele.BusinessUnitID}</td>;

                        if (column.ControlDisplayID === "Centre")
                          return <td key={colIndex} data-title="Centre">{ele.Centre}</td>;

                        if (column.ControlDisplayID === "Client ID")
                          return <td key={colIndex} data-title="Client ID">{ele.ClientID}</td>;

                        if (column.ControlDisplayID === "Client Code")
                          return <td key={colIndex} data-title="Client Code">{ele.ClientCode || "-"}</td>;

                        if (column.ControlDisplayID === "RateType Name")
                          return <td key={colIndex} data-title="RateType Name">{ele.ClientName || "-"}</td>;

                        if (column.ControlDisplayID === "Net Amount")
                          return (
                            <td key={colIndex} data-title="Net Amount" className="amount">
                              {formatIndianNumber(ele.Amount)}
                            </td>
                          );

                        if (column.ControlDisplayID === "Invoice Amount")
                          return (
                            <td key={colIndex} data-title="Invoice Amount" className="amount">
                              {formatIndianNumber(ele.ShareAmt)}
                            </td>
                          );

                        if (column.ControlDisplayID === "Invoice Date")
                          return <td key={colIndex} data-title="Invoice Date">{ele.InvoiceDate}</td>;

                        return <td key={colIndex} data-title="Unknown"></td>;
                      })}

                      <td data-title="Action">
                        <input
                          type="checkbox"
                          name="IsChecked"
                          onChange={(e) => handleCheck(e, originalIndex)}
                          checked={ele?.IsChecked || false}
                        />
                      </td>
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
                      { label: "100", value: 100 },
                      { label: "250", value: 250 },
                      { label: "500", value: 500 },
                      { label: "1000", value: 1000 },
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
          <div className="card">
            <NoRecordFound />
          </div>
        )}
      </Accordion>

      {show?.modal && (
        <InvoiceCreationModal
          show={show?.modal}
          data={show?.id}
          onClose={handleModalClose}
        />
      )}
    </>
  );
};

export default InvoiceCreation;
