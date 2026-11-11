import React, { useEffect, useMemo, useState } from "react";
import DatePicker from "../../components/formComponent/DatePicker";
import { axiosInstance, axiosReport } from "../../utils/axiosInstance";
import Loading from "../../components/loader/Loading";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import moment from "moment";
import Accordion from "@app/components/UI/Accordion";
import Tables from "../../components/UI/customTable";
import Input from "../../components/formComponent/Input";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { apiUrls } from "../../utils/apiUrls";
import { SelectBox } from "../../components/formComponent/SelectBox";
import { notify } from "../../utils/utils";
import { ExportToExcel } from "../../utils/helpers";
import {
  downloadReportBlob,
  getReportDownloadName,
} from "../CombineCollectionReport/reportDownload";
import "./Invoice.css";
import Modal from "../../components/formComponent/Modal";
import TextAreaInput from "../../components/formComponent/TextAreaInput";
import MultiSelectComp from "../../components/formComponent/MultiSelectComp";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { CustomButton, SearchButton } from "../../components/UI/CustomButton";
import { getSearchController } from "../../utils/NetworkApi/commonApi";
import Pagination from "../../Pagination/Pagination";
import PageControlGear from "../../components/PageGearModel/PageControlGear";
import { Status } from "../../utils/Constants";
import EmailImage from "../../assets/image/gmail.png"

const InvoiceReprint = () => {
  const { t } = useTranslation();
  const { HideInvoiceReprintExcel } = useLocalStorage("userData", "get");
  // console.log("HideInvoiceReprintExcel",HideInvoiceReprintExcel);
  const userData = useLocalStorage("userData", "get");

  console.log("userData", userData);
  const [center, setCentre] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [load, setLoad] = useState(false);
  const [loads, setLoads] = useState({ name: "", loading: -1 });
  const [invoiceReprintData, setinvoiceReprintData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const PAGE_ID = "708";
  const [selectedRows, setSelectedRows] = useState([]);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailPayload, setEmailPayload] = useState({
    ledgerTransactionID: 0,
    ledgerTransactionNo: "",
    toEmail: "",
    serviceType: "Email",
    transactionType: "Invoice",
    remarkMessageTo: "",
    CCEmail: "",
    BCCEmail: "",
    SelectedReportMode: ""
  });

  // ── Dynamic Controller State ──────────────────────────────────────────────
  const [controllerDynamicList, setControllerDynamicList] = useState([]);
  const [FilterData, setFilterData] = useState([]);
  const [headWithApiFields, setHeadWithApiFields] = useState({
    "S.No": "srNo",
    "Business Unit": "BusinessUnit",
    "Invoice No": "InvoiceNo",
    "RateType Name": "RateType",
    "Invoice Date": "InvoiceDate",
    "Net Amount": "NetAmount",
    "Invoice Amount": "InvoiceAmount",
    "Created By": "InvoiceCreatedBy",
    "Created On": "InvoiceCreatedOn",
    "RateType Code": "RateTypeCode",
    "RateType ID": "RateTypeID",
    "Status": "Status",
  });

  const data = useLocalStorage("accessRight", "get");
  const has35 = data?.includes(35);
  console.log(data, "AccessRight");
  const dateTypeList = [
    { label: t("InvoiceDate"), value: "im.invoicedate" },
    { label: t("EntryDate"), value: "im.dtentry" },
  ];

  const statusList = [
    { label: t("Approved"), value: "1" },
    { label: t("Not Approved"), value: "0" },
  ];

  const dateTypeOptions = [
    { label: t("Cover Letter Only(Summary and PDF)"), value: 1 },
    { label: t("Cover Letter with Details (Both PDFs)"), value: 2 },
    { label: t("Cover Letter with Excel Detail (PDF + Excel)"), value: 3 },
  ];

  const [dropDownList, setDropdownList] = useState({
    centreList: [],
    invoiceBillingCycleList: [],
  });

  const [payload, setPayload] = useState({
    InvoiceNo: "",
    invoiceBillingCycle: "",
    DateTypeSearch: "im.dtentry",
    IsApproval: "0",
    InvoiceFromDate: new Date(),
    InvoiceFromTime: "00:00",
    InvoiceToDate: new Date(),
    InvoiceToTime: "23:59",
    businessUnitCode: [],
    rateType: [],


  });

  const currentTableData = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * pageSize;
    const lastPageIndex = firstPageIndex + pageSize;
    return filteredData.slice(firstPageIndex, lastPageIndex);
  }, [currentPage, pageSize, filteredData]);

  const totalSumReduce = (key) =>
    filteredData?.reduce((sum, row) => sum + (row[key] || 0), 0);

  const handleChangeSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchText(e.target.value);

    if (!value.trim()) {
      setFilteredData(invoiceReprintData);
      setCurrentPage(1);
      return;
    }

    const filtered = invoiceReprintData.filter((item) =>
      [
        "BusinessUnit",
        "InvoiceNo",
        "RateType",
        "InvoiceDate",
        "NetAmount",
        "InvoiceAmount",
        "InvoiceCreatedBy",
        "InvoiceCreatedOn",
        "RateTypeCode",
        "RateTypeID",
      ].some((key) =>
        String(item[key] || "")
          .toLowerCase()
          .includes(value),
      ),
    );

    setFilteredData(filtered);
    setCurrentPage(1);
  };

  const controllerDynamic = async () => {
    try {
      const { controllersData, controllerTabbingOrder } =
        await getSearchController(PAGE_ID);
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

  const getAccessCentres = (centreIDs = [], billingCycle = "") => {
    axiosInstance
      .post("Centre/BindRateTypeWorkOrderSearch", {
        centreID: centreIDs?.length ? centreIDs.toString() : 0,
        rateTypeID: 0,
        AllowEstimate: 0,
        CentreType: "",
        AllowHomeCollection: 0,
        AllowMembershipCard: 0,
        PageName: "YES",
        InvoiceBillingCycle: billingCycle || payload?.invoiceBillingCycle,
      })
      .then((res) => {
        let CentreDataValue = (res?.data?.message || []).map((ele) => ({
          value: ele.RateTypeID,
          label: ele.RateTypeName.replace(/\r?\n/g, " ").trim(),
        }));

        if (CentreDataValue.length === 1) {
          setPayload((prev) => ({
            ...prev,
            rateType: [CentreDataValue[0].value],
          }));
        } else {
          setPayload((prev) => ({
            ...prev,
            rateType: [],
          }));
        }

        setCentre(CentreDataValue);
      })
      .catch(() => {
        setCentre([]);
        setPayload((prev) => ({ ...prev, rateType: [] }));
      });
  };

  const getGlobalCentres = () => {
    axiosInstance
      .post("Centre/BindCentreWorkOrder", {
        centreID: 0,
        rateTypeID: 0,
      })
      .then((res) => {
        let centreList = res?.data?.message?.map((ele) => ({
          value: String(ele?.value),
          label: ele?.label,
        }));
        if (centreList?.length == 1) {
          setPayload((prev) => ({
            ...prev,
            businessUnitCode: [centreList[0]?.value],
          }));
        }
        setDropdownList((prev) => ({ ...prev, centreList }));
      })
      .catch(console.log);
  };

  const getInvoiceBillingCentre = () => {
    axiosInstance
      .post(apiUrls?.getGlobalData, { type: "InvoiceBillingCycle" })
      .then((res) => {
        let invoiceBillingCycleList = res?.data?.message?.map((ele) => ({
          ...ele,
          value: String(ele?.FieldDisplay),
          label: ele?.FieldDisplay,
        }));
        setDropdownList((prev) => ({ ...prev, invoiceBillingCycleList }));
      })
      .catch(console.log);
  };

  const getInvoiceReprintExcel = (invoiceId) => {
    axiosInstance
      .post("Accounts/InvoiceExcelData", {
        invoiceNo: invoiceId,
        documentType: 0,
      })
      .then((res) => ExportToExcel(res.data.message))
      .catch(console.log);
  };

  const handleSearch = () => {
    setLoad(true);
    axiosInstance
      .post("Accounts/InvoiceReprint1", {
        ...payload,
        centreID: payload?.businessUnitCode,
        rateType: payload?.rateType,
        InvoiceFromDate: moment(payload?.InvoiceFromDate).format("DD-MMM-YYYY"),
        InvoiceToDate: moment(payload?.InvoiceToDate).format("DD-MMM-YYYY"),
      })
      .then((res) => {
        setLoad(false);

        if (!Array.isArray(res?.data?.message)) {
          setinvoiceReprintData([]);
          setFilteredData([]);
          notify(res?.data?.message, "error");
          return;
        }

        setinvoiceReprintData(res?.data?.message);
        setFilteredData(res?.data?.message);
        setCurrentPage(1);
        setSearchText("");

        setSelectedRows([]);
      })
      .catch((err) => {
        setLoad(false);
        toast.error(err?.data?.message || "Something Went Wrong");
      });
  };
  const handleSelectAll = (checked) => {
    const pageIndexes = currentTableData.map((_, index) =>
      (currentPage - 1) * pageSize + index
    );

    if (checked) {
      setSelectedRows((prev) => [...new Set([...prev, ...pageIndexes])]);
    } else {
      setSelectedRows((prev) =>
        prev.filter((i) => !pageIndexes.includes(i))
      );
    }
  };
  const handleCheckboxChange = (index) => {
    setSelectedRows((prev) => {
      if (prev.includes(index)) {
        return prev.filter((i) => i !== index);
      } else {
        return [...prev, index];
      }
    });
  };

  const handleApprove = (flag) => {
    const approvalValue = flag === "Approve" ? "1" : "0";

    const approvedData = selectedRows.map((index) => ({
      isApproval: approvalValue,
      invoiceNo: String(filteredData[index]?.InvoiceNo),
    }));

    if (!approvedData.length) {
      toast.warning("Please select at least one record");
      return;
    }
    axiosInstance
      .post("Accounts/InvoiceApproval", approvedData)
      .then((res) => {
        toast.success(res?.data?.message);
        handleSearch();
      })

      .catch((err) => {
        console.error(err);
        toast.error("Something went wrong");
      });
  };

  const handleGetPdf = () => {

    const selectedInvoices = selectedRows.map(
      (index) => String(filteredData[index]?.InvoiceNo)
    );
    if (!selectedInvoices.length) {
      toast.warning("Please select at least one invoice");
      return;
    }
    setLoads({ name: "multiPdf", loading: true });
    axiosReport.post("commonReports/PrintMultipleInvoices", {
      InvoiceNos: selectedInvoices
    },
      {
        responseType: "blob"
      }
    )
      .then((res) => {
        const file = new Blob([res.data], { type: "application/pdf" });
        const fileURL = URL.createObjectURL(file);
        window.open(fileURL);
      })
      .catch((err) => {
        console.log(err);
        toast.error(err?.response?.data?.message || "Something Went Wrong");
      }).finally(() => {
        setLoads({ name: "", loading: -1 });
      });
  };
  const downloadInvoiceReprintExcel = (invoiceNos) => {
    return axiosReport
      .post(
        "commonReports/ExportInvoiceReprintExcel",
        {
          InvoiceNos: invoiceNos,
          FromDate: moment(payload?.InvoiceFromDate).format("DD-MMM-YYYY"),
          ToDate: moment(payload?.InvoiceToDate).format("DD-MMM-YYYY"),
        },
        { responseType: "blob" },
      )
      .then((res) => {
        const fallback = `InvoiceReprint_${moment().format("YYYYMMDD_HHmmss")}.xlsx`;
        const fileName = getReportDownloadName(res, fallback);
        downloadReportBlob(
          res.data,
          fileName.toLowerCase().endsWith(".xlsx") ? fileName : `${fileName}.xlsx`,
        );
      });
  };

  const handleGetReport = (id, index, name, invoiceType = "Both") => {
    setLoads({ loading: index, name });
    if (name === "Excel" || invoiceType === "Excel") {
      downloadInvoiceReprintExcel([id])
        .catch((err) => {
          toast.error(err?.response?.data?.message || "Something Went Wrong");
        })
        .finally(() => {
          setLoads({ loading: -1, name: "" });
        });
      return;
    }
    axiosReport
      .post(
        "commonReports/ExportFullInvoice",
        { InvoiceNo: id, documentType: 2, InvoiceType: invoiceType },
        { responseType: "blob" },
      )
      .then((res) => {
        if (res.data instanceof Blob) {
          const fileURL = window.URL.createObjectURL(res.data);
          window.open(fileURL, "_blank");
        }
        setLoads({ loading: -1, name: "" });
      })
      .catch((err) => {
        setLoads({ loading: -1, name: "" });
        toast.error(err?.response?.data?.message || "Something Went Wrong");
      });
  };

  const handleReactSelectChange = (name, e) => {
    setPayload((prev) => ({ ...prev, [name]: e?.value }));
    if (name === "invoiceBillingCycle")
      getAccessCentres(payload.businessUnitCode);
  };

  const handleEmailSelectChange = (name, e) => {
    setEmailPayload((prev) => ({ ...prev, [name]: e?.value }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPayload({ ...payload, [name]: value });
  };

  const dateSelect = (value, name) => {
    setPayload({ ...payload, [name]: value });
  };

  const handleEmailClick = (row) => {
    setEmailPayload({
      ...emailPayload,
      ledgerTransactionID: row?.Id,
      ledgerTransactionNo: row?.InvoiceNo,
      toEmail: row?.InvoiceEmail || "",
      remarkMessageTo: "",
      CCEmail: "",
      BCCEmail: "",
    });
    setShowEmailModal(true);
  };

  const handleEmailPayloadChange = (e) => {
    const { name, value } = e.target;
    setEmailPayload((prev) => ({ ...prev, [name]: value }));
  };

  const handleSendEmail = () => {
    if (!emailPayload.toEmail) {
      toast.warning("To Email is required");
      return;
    }

    if (!emailPayload.SelectedReportMode) {
      toast.warning("Please select report mode");
      return;
    };

  setLoad(true);
  axiosInstance
    .post("Accounts/AddSmsWhatsappEmailData", emailPayload)
    .then((res) => {
      toast.success(res?.data?.message || "Email Sent Successfully");
      setShowEmailModal(false);
    })
    .catch((err) => {
      toast.error(err?.response?.data?.message || "Error sending email");
    })
    .finally(() => {
      setLoad(false);
    });
};

const handleSelect_BoxChange = (event) => {
  const { name, value } = event.target;
  if (name === "invoiceBillingCycle")
    getAccessCentres(payload.businessUnitCode);
  setPayload((prev) => ({ ...prev, [name]: value }));
};

const handleSelectchangeCheck = (name, value) => {
  setPayload((prev) => ({ ...prev, [name]: value }));
};

const handleExcelExport = () => {
  const invoiceNos = (filteredData || [])
    .map((row) => row?.InvoiceNo)
    .filter(Boolean);
  if (!invoiceNos.length) {
    notify("No data found to export", "warn");
    return;
  }
  setLoad(true);
  downloadInvoiceReprintExcel(invoiceNos)
    .catch((err) => {
      toast.error(err?.response?.data?.message || "Something Went Wrong");
    })
    .finally(() => {
      setLoad(false);
    });
};

useEffect(() => {
  getAccessCentres();
  getGlobalCentres();
  getInvoiceBillingCentre();
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


return (
  <>
    <Accordion
      name={t("Invoice Reprint")}
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
                  options={dropDownList?.centreList}
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
                        ...dropDownList?.invoiceBillingCycleList,
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
                      ...dropDownList?.invoiceBillingCycleList,
                    ]}
                    name="invoiceBillingCycle"
                    lable={t("Invoice Billing Cycle")}
                    id="invoiceBillingCycle"
                    isShowBorder={true}
                    defaultValue={dateTypeList?.[0]}
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
                    defaultValue={dateTypeList?.[0]}
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
              item?.ControlDisplayID === "InvoiceFromDate" &&
              isHideController("InvoiceFromDate")
            ) {
              return (
                <div className="col-sm-2" key={index}>
                  <DatePicker
                    name="InvoiceFromDate"
                    value={payload?.InvoiceFromDate}
                    className="custom-calendar"
                    placeholder=" "
                    id="From Date"
                    lable="From Date"
                    onChange={dateSelect}
                    maxDate={new Date()}
                  />
                </div>
              );
            }

            if (
              item?.ControlDisplayID === "InvoiceToDate" &&
              isHideController("InvoiceToDate")
            ) {
              return (
                <div className="col-sm-2" key={index}>
                  <DatePicker
                    name="InvoiceToDate"
                    value={payload?.InvoiceToDate}
                    className="custom-calendar"
                    placeholder=" "
                    id="To Date"
                    lable="To Date"
                    onChange={dateSelect}
                    maxDate={new Date()}
                    minDate={new Date(payload?.InvoiceFromDate)}
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
                    value={payload?.InvoiceNo}
                    onChange={handleChange}
                    id="InvoiceNo"
                    name="InvoiceNo"
                    lable="Invoice Number"
                    placeholder=" "
                  />
                </div>
              );
            }

            if (
              item?.ControlDisplayID === "Status" &&
              isHideController("Status")
            ) {
              return (
                <div className="col-sm-2" key={index}>
                  <ReactSelect
                    dynamicOptions={statusList}
                    name="IsApproval"
                    lable={t("Status")}
                    id="IsApproval"
                    isShowBorder={true}
                    removeIsClearable={true}
                    placeholderName={t("Status")}
                    value={payload?.IsApproval}
                    onChange={handleReactSelectChange}
                    className="required-fields"
                  />
                </div>
              );
            }


            return null;
          })}

        {/* <div
            className="col-sm-1 d-flex"
            style={{ gap: "4px" }}
          > */}

        {/* <i
              className="pi pi-file-excel pointer-cursor"
              style={{ fontSize: "22px", color: "green", cursor: "pointer" }}
              title="Export to Excel"
              onClick={handleExcelExport}
            /> */}

        {/* <div className="mr-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                x="0px"
                y="0px"
                width="29"
                height="23"
                viewBox="0 0 48 48"
                onClick={handleExcelExport}
                style={{ fontSize: "22px", color: "green", cursor: "pointer" }}
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
                <path fill="#17472a" d="M14 24.005H29V33.055H14z"></path>
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
                  <path fill="#129652" d="M29 24.005H44V33.055H29z"></path>
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
            </div> */}
        {/* </div> */}
        {load ? (
          <Loading />
        ) : (
          <SearchButton text={"Search"} onClick={handleSearch} className="mx-2" />
        )}
        <CustomButton text="Export to Excel" onClick={handleExcelExport} icon="excel" />
      </div>
    </Accordion>

    <Accordion
      title={t("Search Detail")}
      className="invoice-search-detail"
      defaultValue={true}
      notOpen={true}
      linkTo="#"
      linkTitle={
        <>
          {/* Desktop only */}
          <div className="link-title-container mt-2 d-none d-md-flex" id="pr_id_11">
            <label>
              {t("Total Invoice Count")} :
              <span className="text-danger" style={{ marginLeft: "10px" }}>{filteredData?.length}</span>
            </label>
            |
            <label>
              {t("Total Net Amount")} :
              <span className="text-danger" style={{ marginLeft: "10px" }}>{totalSumReduce("NetAmount")}</span>
            </label>
            |
            <label>
              {t("Total Invoice Amount")} :
              <span className="text-danger" style={{ marginLeft: "10px" }}>{totalSumReduce("InvoiceAmount")}</span>
            </label>
            <Input
              type="text"
              placeholder="Search Invoice Reprint Details..."
              value={searchText}
              onClick={(e) => e.stopPropagation()}
              onChange={handleChangeSearch}
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
        /* Mobile: stats row 2 */
        <div
          className="d-flex d-md-none align-items-center"
          style={{ fontSize: "10px", gap: "0 3px", width: "100%", flexWrap: "nowrap" }}
          onClick={(e) => e.stopPropagation()}
        >
          <span style={{ whiteSpace: "nowrap" }}>Total Invoice Count : <span className="text-danger fw-bold">{filteredData?.length}</span></span>
          <span style={{ color: "#adb5bd", flexShrink: 0 }}>|</span>
          <span style={{ whiteSpace: "nowrap" }}>Net Amount : <span className="text-danger fw-bold">{totalSumReduce("NetAmount")}</span></span>
          <span style={{ color: "#adb5bd", flexShrink: 0 }}>|</span>
          <span style={{ whiteSpace: "nowrap" }}>Invoice Amount : <span className="text-danger fw-bold">{totalSumReduce("InvoiceAmount")}</span></span>
        </div>
      }
    >

      {load ? (
        <Loading />
      ) : filteredData?.length > 0 ? (
        <>
          <Tables>
            <thead className="text-center cf" style={{ zIndex: 99 }}>
              <tr>
                {FilterData?.filter(
                  (item) => item.IsShow == 1 && item.TypeId == 2,
                )?.map((header, idx) => {
                  if (header.ControlDisplayID === "S.No")
                    return <th key={idx}>{t("S.No")}</th>;
                  if (header.ControlDisplayID === "Business Unit")
                    return <th key={idx}>{t("Business Unit")}</th>;
                  if (header.ControlDisplayID === "Invoice No")
                    return <th key={idx}>{t("Invoice No")}</th>;
                  if (header.ControlDisplayID === "RateType Code")
                    return <th key={idx}>{t("RateType Code")}</th>;
                  if (header.ControlDisplayID === "RateType ID")
                    return <th key={idx}>{t("RateType ID")}</th>;
                  if (header.ControlDisplayID === "RateType Name")
                    return <th key={idx}>{t("RateType Name")}</th>;
                  if (header.ControlDisplayID === "Invoice Date")
                    return <th key={idx}>{t("Invoice Date")}</th>;
                  if (header.ControlDisplayID === "Net Amount")
                    return <th key={idx}>{t("Net Amount")}</th>;
                  if (header.ControlDisplayID === "Invoice Amount")
                    return <th key={idx}>{t("Invoice Amount")}</th>;
                  if (header.ControlDisplayID === "Created By")
                    return <th key={idx}>{t("Created By")}</th>;
                  if (header.ControlDisplayID === "Created On")
                    return <th key={idx}>{t("Created On")}</th>;
                  if (header.ControlDisplayID === "IsApproval")
                    return (
                      <th key={idx}>
                        <input
                          type="checkbox"
                          checked={
                            currentTableData.length > 0 &&
                            currentTableData.every((_, index) => {
                              const actualIndex = (currentPage - 1) * pageSize + index;
                              return selectedRows.includes(actualIndex);
                            })
                          }
                          onChange={(e) => handleSelectAll(e.target.checked)}
                        />
                      </th>
                    );
                  if (header.ControlDisplayID === "Invoice") {
                    if (userData?.CompanyID != 1004) {
                      return <th key={idx}>{t("Invoice")}</th>;
                    } else {
                      return null;
                    }
                  }

                  if (
                    header.ControlDisplayID === "Summary" ||
                    header.ControlDisplayID === "Summery"
                  ) {
                    if (userData?.CompanyID == 1004) {
                      return <th key={idx}>{t("Summary")}</th>;
                    } else {
                      return null;
                    }
                  }

                  if (header.ControlDisplayID === "Detail") {
                    if (userData?.CompanyID == 1004) {
                      return <th key={idx}>{t("Detail")}</th>;
                    } else {
                      return null;
                    }
                  }
                  if (header.ControlDisplayID === "Email")
                    return <th key={idx}>{t("Email")}</th>;
                  return (
                    <th key={idx}>
                      {t(header.ControlDisplayName || header.ControlDisplayID)}
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody>
              {currentTableData?.map((ele, index) => {
                const actualIndex = (currentPage - 1) * pageSize + index;
                return (
                  <tr key={index}
                    style={{
                      backgroundColor: ele?.EmailStatus == 1 ? "lightgreen" : ""
                    }}
                  >
                    {FilterData?.filter(
                      (item) => item.IsShow == 1 && item.TypeId == 2,
                    )?.map((column, colIndex) => {

                      if (column.ControlDisplayID === "S.No")
                        return <td key={colIndex} data-title="S.No">{actualIndex + 1}</td>;

                      if (column.ControlDisplayID === "Business Unit")
                        return (
                          <td key={colIndex} data-title="Business Unit">
                            {ele?.BusinessUnit}&nbsp;
                          </td>
                        );

                      if (column.ControlDisplayID === "Invoice No")
                        return <td key={colIndex} data-title="Invoice No">{ele?.InvoiceNo}&nbsp;</td>;
                      if (column.ControlDisplayID === "RateType Code")
                        return (
                          <td key={colIndex} data-title="RateType Code">
                            {ele?.RateTypeCode}&nbsp;
                          </td>
                        );
                      if (column.ControlDisplayID === "RateType ID")
                        return (
                          <td key={colIndex} data-title="RateType ID">
                            {ele?.RateTypeID}&nbsp;
                          </td>
                        );

                      if (column.ControlDisplayID === "RateType Name")
                        return <td key={colIndex} data-title="RateType Name">{ele?.RateType}&nbsp;</td>;

                      if (column.ControlDisplayID === "Invoice Date")
                        return (
                          <td key={colIndex} data-title="Invoice Date">
                            {ele?.InvoiceDate}&nbsp;
                          </td>
                        );

                      if (column.ControlDisplayID === "Net Amount")
                        return <td key={colIndex} data-title="Net Amount">{ele?.NetAmount}&nbsp;</td>;

                      if (column.ControlDisplayID === "Invoice Amount")
                        return (
                          <td key={colIndex} data-title="Invoice Amount">
                            {ele?.InvoiceAmount}&nbsp;
                          </td>
                        );

                      if (column.ControlDisplayID === "Created By")
                        return (
                          <td key={colIndex} data-title="Created By">
                            {ele?.InvoiceCreatedBy}&nbsp;
                          </td>
                        );

                      if (column.ControlDisplayID === "Created On")
                        return (
                          <td key={colIndex} data-title="Created On">
                            {ele?.InvoiceCreatedOn}&nbsp;
                          </td>
                        );

                      if (column.ControlDisplayID === "IsApproval")
                        return (
                          <td key={colIndex} data-title="IsApproval" className="text-center">
                            <input
                              type="checkbox"
                              checked={selectedRows.includes(actualIndex)}
                              onChange={() => handleCheckboxChange(actualIndex)}
                            />
                          </td>
                        );

                      if (column.ControlDisplayID === "Invoice") {
                        if (userData?.CompanyID != 1004) {
                          return (
                            <td key={colIndex} data-title="Invoice">
                              <div className="d-flex" style={{ gap: "5px" }}>
                                {loads?.name === "print" &&
                                  loads?.loading === actualIndex ? (
                                  <Loading />
                                ) : (
                                  <i>
                                    <span
                                      className="pi pi-file-pdf"
                                      style={{
                                        width: "15px",
                                        height: "15px",
                                        color: "red",
                                        cursor: "pointer",
                                      }}
                                      title={t("Print PDF")}
                                      onClick={() =>
                                        handleGetReport(
                                          ele?.InvoiceNo,
                                          actualIndex,
                                          "print",
                                          "Both"
                                        )
                                      }
                                    />
                                  </i>
                                )}
                                {Number(HideInvoiceReprintExcel) === 0 &&
                                  <i>
                                    <span
                                      className="pi pi-file-excel"
                                      style={{
                                        width: "15px",
                                        height: "15px",
                                        color: "green",
                                        cursor: "pointer",
                                      }}
                                      title={t("Download Excel")}
                                      onClick={() =>
                                        handleGetReport(
                                          ele?.InvoiceNo,
                                          actualIndex,
                                          "Excel",
                                          "Excel"
                                        )
                                      }
                                    />
                                  </i>
                                }
                              </div>
                            </td>
                          );
                        } else {
                          return null;
                        }
                      }

                      if (
                        column.ControlDisplayID === "Summary" ||
                        column.ControlDisplayID === "Summery"
                      ) {
                        if (userData?.CompanyID == 1004) {
                          return (
                            <td key={colIndex} data-title="Summary">
                              <div className="d-flex" style={{ gap: "5px" }}>
                                {loads?.name === "print" &&
                                  loads?.loading === actualIndex ? (
                                  <Loading />
                                ) : (
                                  <i>
                                    <span
                                      className="pi pi-file-pdf"
                                      style={{
                                        width: "15px",
                                        height: "15px",
                                        color: "red",
                                        cursor: "pointer",
                                      }}
                                      title={t("Summary PDF")}
                                      onClick={() =>
                                        handleGetReport(
                                          ele?.InvoiceNo,
                                          actualIndex,
                                          "print",
                                          "Summary"
                                        )
                                      }
                                    />
                                  </i>
                                )}
                              </div>
                            </td>
                          );
                        } else {
                          return null;
                        }
                      }

                      if (column.ControlDisplayID === "Detail") {
                        if (userData?.CompanyID == 1004) {
                          return (
                            <td key={colIndex} data-title="Detail">
                              <div className="d-flex" style={{ gap: "5px", }}>
                                {loads?.name === "print" &&
                                  loads?.loading === actualIndex ? (
                                  <Loading />
                                ) : (
                                  <i>
                                    <span
                                      className="pi pi-file-pdf"
                                      style={{
                                        width: "15px",
                                        height: "15px",
                                        color: "red",
                                        cursor: "pointer",
                                      }}
                                      title={t("Detail PDF")}
                                      onClick={() =>
                                        handleGetReport(
                                          ele?.InvoiceNo,
                                          actualIndex,
                                          "print",
                                          "Detail"
                                        )
                                      }
                                    />
                                  </i>
                                )}
                                {Number(HideInvoiceReprintExcel) === 0 &&
                                  <i>
                                    <span
                                      className="pi pi-file-excel"
                                      style={{
                                        width: "15px",
                                        height: "15px",
                                        color: "green",
                                        cursor: "pointer",
                                      }}
                                      title={t("Download Excel")}
                                      onClick={() =>
                                        handleGetReport(
                                          ele?.InvoiceNo,
                                          actualIndex,
                                          "Excel",
                                          "Excel"
                                        )
                                      }
                                    />
                                  </i>
                                }
                              </div>
                            </td>
                          );
                        } else {
                          return null;
                        }
                      }
                      if (column.ControlDisplayID === "Email")
                        return (
                          <td key={colIndex} data-title="Email" className="">
                            <img
                              src={EmailImage}
                              alt="Email"
                              style={{
                                width: "20px",
                                height: "20px",
                                cursor: "pointer",
                              }}
                              title={t("Send Email")}
                              onClick={() => handleEmailClick(ele)}
                            />
                          </td>
                        );

                      return <td key={colIndex}></td>;
                    })}
                  </tr>
                );
              })}
            </tbody>
          </Tables>
          {(has35 && currentTableData?.length > 0) && (
            <div className="pl-2 mt-2">
              {payload?.IsApproval == 0 && (
                <CustomButton
                  text={t("Approve")}
                  className="btn btn-primary mt-3 mr-2"
                  onClick={() => handleApprove("Approve")}
                />

              )}

              {payload?.IsApproval == 1 && (
                <CustomButton
                  text={t("Not Approved")}
                  // icon={""}
                  className="btn btn-primary mt-3 mr-2"
                  onClick={() => handleApprove("Not Approved")}
                />
              )}
              {loads?.name === "multiPdf" && loads?.loading === true ? (
                <Loading />
              ) : (
                <CustomButton
                  text={t("PDF")}
                  icon={"pdf"}
                  className="btn btn-primary mt-3"
                  onClick={handleGetPdf}
                />
              )}

            </div>
          )}




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
    </Accordion >

    {showEmailModal && (
      <Modal
        visible={showEmailModal}
        setVisible={setShowEmailModal}
        Header={t("Send Email")}
      >
        <div className="row p-2">
          <div className="col-sm-12">
            <Input
              lable={t("To Email")}
              name="toEmail"
              value={emailPayload.toEmail}
              onChange={handleEmailPayloadChange}
            />
          </div>
          <div className="col-sm-12">
            <Input
              lable={t("CC Email")}
              name="CCEmail"
              value={emailPayload.CCEmail}
              onChange={handleEmailPayloadChange}
            />
          </div>
          <div className="col-sm-12">
            <Input
              lable={t("BCC Email")}
              name="BCCEmail"
              value={emailPayload.BCCEmail}
              onChange={handleEmailPayloadChange}
            />
          </div>
          <div className="col-sm-12">
            <ReactSelect
              className="required-fields"
              dynamicOptions={dateTypeOptions}
              value={emailPayload.SelectedReportMode}   // 🆕 CHANGED - sahi state field
              name="SelectedReportMode"                 // 🆕 CHANGED - payload key se match
              onChange={handleEmailSelectChange}        // 🆕 CHANGED - emailPayload handler
              lable={t("Report Mode")}
              removeIsClearable={true}
              placeholderName={t("Search By")}
            />
          </div>
          <div className="col-sm-12">
            <TextAreaInput
              lable={t("Remark")}
              name="remarkMessageTo"
              value={emailPayload.remarkMessageTo}
              onChange={handleEmailPayloadChange}
              placeholder="Enter Remark"
            />
          </div>
          <div className="col-sm-12 text-center mt-2">
            <CustomButton
              text={t("Send Email")}
              onClick={handleSendEmail}
              loading={load}
            />
          </div>
        </div>
      </Modal>
    )}
  </>
);
};

export default InvoiceReprint;
