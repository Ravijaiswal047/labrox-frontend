import React, { useEffect, useState } from "react";
import Heading from "../../../components/UI/Heading";
import { useTranslation } from "react-i18next";
import ReactSelect from "../../../components/formComponent/ReactSelect";
import Input from "../../../components/formComponent/Input";
import LabeledInput from "../../../components/formComponent/LabeledInput";
import DatePicker from "../../../components/formComponent/DatePickerHis";
import moment from "moment";
import Tables from "../../../components/UI/customTable";
import {
  BindVoucherBillingScreenControls,
  FinancePrintSearchVoucher,
  FinanceSaveVoucher,
  FinanceSearchVoucher,
  FinanceVoucherPrint,
  GetCurrencyConversionFactorAPI,
  GetPeriodClosed,
  LoadCentreChartOfAccountAPI,
  SearchVoucher,
  UpdateVoucherStatusAPI,
  PrintDownloadVoucher,
} from "../../../NetworkServices/finance.js";
import {
  // filterByTypes,
  // inputBoxValidation,
  notify,
} from "../../../utils/utils";
import VoucherBookingTable from "./VoucherBookingTable";
import { AutoComplete } from "primereact/autocomplete";
import { useLocalStorage } from "../../../utils/hooks/useLocalStorage";
import {
  AMOUNT_REGX,
  downloadBase64File,
  ROUNDOFF_VALUE,
} from "../../../utils/constant";
import { FinanceSaveVoucherPayload } from "../../../utils/ustil2";
import BrowseButton from "../../../components/formComponent/BrowseButton";
import WrapTranslate from "../../../components/WrapTranslate";
import { Tooltip } from "primereact/tooltip";
import { RedirectURL } from "../../../NetworkServices/PDFURL";
import CustomDateRangePicker from "../../../components/commonComponents/DateRangePicker";
import PendingInvoiceModal from "./PendingInvoiceModal";
import CustomTooltipHis from "../../../components/formComponent/CustomTooltipHis";
import TextAreaInput from "../../../components/formComponent/TextAreaInput";
import AlignTableText from "../../../components/commonComponents/AlignTableText";
import { filterByTypes, inputBoxValidation } from "../../utils/Utils";
import FinanceModal from "../../../components/ModalComponent/FinanceModal";
import HisTable from "../../../components/UI/customTable/HisTable";

function VoucherBooking() {
  const { VITE_DATE_FORMAT } = import.meta.env;
  const [t] = useTranslation();
  const userData = useLocalStorage("userData", "get");
  const newSession = useLocalStorage("newSession", "get");
  const [items, setItems] = useState([]);
  const [amounts, setAmounts] = useState({});
  const [downloadVoucher, setDownloadVOucher] = useState([]);
  let initialValues = {
    VoucherDate: newSession ? newSession : new Date(),
    ChartOfGroup: { value: "0" },
    voucherType: {},
    fromDate: new Date(),
    toDate: "",
    ProjectList: [],
  };
  const [values, setValues] = useState(initialValues);
  const [list, setList] = useState([]);
  const [bodyData, setBodyData] = useState([]);
  const [voucherList, setVoucherList] = useState([]);
  const [modalData, setModalData] = useState({ visible: false });

  const voucherHead = [
    { name: "S/No.", width: "1%" },
    { name: "Voucher Type" },
    { name: "Voucher No" },
    { name: "Voucher Date" },
    { name: "DR A/C" },
    { name: "CR A/C" },
    { name: "Base Amt" },
    { name: "Entry Date" },
    { name: "Entry By" },
    // { name: "View" },
    { name: "Status" },
    { name: "Review", width: "1%" },
    { name: "Action", width: "1%" },
    // { name: "Print" },
    // { name: "Attach" },
  ];

  const handleReactSelect = async (label, value) => {
    if (label === "Currency") {
      GetCurrencyConversionFactor(
        value?.value,
        moment(values?.VoucherDate).format("DD-MMM-YYYY"),
      );
      value.isDisabled = value?.TypeCode === value?.ValueField ? true : false;
      // isAccountType
      setBodyData(bodyData?.filter((item) => !item?.isAccountType));
      setValues((val) => ({ ...val, [label]: value, AccountTypeValue: "" }));
    } else if (label === "VoucherType") {
      // debugger;
      if (value?.IsPreferredForPayment === 1) {
        search("", "", 1, value?.value);
      }
      setValues((val) => ({ ...val, [label]: value }));
    } else {
      setValues((val) => ({ ...val, [label]: value }));
    }
  };

  const handleChange = async (e) => {
    if (e?.target?.name === "VoucherDate") {
      GetCurrencyConversionFactor(
        values?.Currency?.value,
        moment(e?.target?.value).format("DD-MMM-YYYY"),
      );
    }
    const { value, name } = e?.target;
    setValues((val) => ({ ...val, [name]: value }));
  };
  const handleDateRangeChange = (e) => {
    const { startDate, endDate } = e.target.value;
    setValues((val) => ({ ...val, fromDate: startDate, toDate: endDate }));
  };
  const handleSelectDate = (e) => {
    GetCurrencyConversionFactor(
      values?.Currency?.value,
      moment(e?.value).format("DD-MMM-YYYY"),
    );
  };

  const bindListData = async () => {
    let apiResp = await BindVoucherBillingScreenControls(1);
    if (apiResp?.success) {
      const country = filterByTypes(
        apiResp?.data,
        [4],
        ["TypeID"],
        "TextField",
        "ValueField",
        "TypeCode",
      );
      const project = filterByTypes(
        apiResp?.data,
        [3],
        ["TypeID"],
        "TextField",
        "ValueField",
        "TypeCode",
      );
      // if (project?.length > 0) {
      //   setValues((val) => ({
      //     ...val,
      //     ProjectName: { value: project[0]["value"] },
      //     ProjectList: project,
      //   }));
      // }
      if (project?.length === 1) {
        setValues((val) => ({
          ...val,
          ProjectList: project,
          ProjectName: {
            value: project[0].value,
            label: project[0].label || project[0].TextField,
          },
        }));
      } else {
        setValues((val) => ({
          ...val,
          ProjectList: project,
          ProjectName: null,
        }));
      }

      if (country?.length > 0) {
        setValues((val) => ({
          ...val,
          Currency: {
            value: country[0]["TypeCode"],
            isDisabled:
              country[0]["TypeCode"] === country[0]["ValueField"]
                ? true
                : false,
          },
        }));
        await GetCurrencyConversionFactor(
          country[0]["extraColomn"],
          moment(values?.VoucherDate ? values?.VoucherDate : new Date()).format(
            "DD-MMM-YYYY",
          ),
        );
      }
      setList(apiResp?.data);
    } else {
      setList([]);
    }
  };
  useEffect(() => {
    bindListData();
  }, []);

  useEffect(() => {
    let data = bodyData.reduce(
      (accumulator, currentType) => {
        if (currentType.balanceType?.value === "Dr") {
          accumulator["Dr Amount"] += currentType?.Amount
            ? Number(currentType?.Amount)
            : 0;
          accumulator["Dr Local Amount"] +=
            values?.ConversionFactor * currentType?.Amount > 0
              ? Number(values?.ConversionFactor * currentType?.Amount)
              : 0;
        } else if (currentType.balanceType?.value === "Cr") {
          accumulator["Cr Amount"] += currentType?.Amount
            ? Number(currentType?.Amount)
            : 0;
          accumulator["Cr Local Amount"] +=
            values?.ConversionFactor * currentType?.Amount > 0
              ? Number(values?.ConversionFactor * currentType?.Amount)
              : 0;
        }
        return accumulator;
      },
      {
        "Cr Amount": 0,
        "Dr Amount": 0,
        "Cr Local Amount": 0,
        "Dr Local Amount": 0,
      },
    );

    data["Diff Amount"] = data["Cr Amount"] - data["Dr Amount"];
    data["Diff Local Amount"] =
      data["Cr Local Amount"] - data["Dr Local Amount"];
    setAmounts({
      "Amount (Dr)": data["Dr Amount"],
      "Amount (Cr)": data["Cr Amount"],
      "Diff Amount": Math.abs(data["Cr Amount"] - data["Dr Amount"]),
      "Base Amount (Cr)": data["Cr Local Amount"],
      "Base Amount (Dr)": data["Dr Local Amount"],
      "Diff Base Amount": Math.abs(data["Diff Local Amount"]),
    });
  }, [bodyData, values?.ConversionFactor]);

  const search = async (event, name, isTaxDetail = 0, VoucherType) => {
    if (event?.query?.length > 0 || isTaxDetail) {
      const payload = {
        groupCode: String("0"),
        accountTypeID: 0,
        currencyCode: String(values?.Currency?.value),
        accountName: String(event?.query || ""),
        voucherType: String(VoucherType || values?.VoucherType?.value),
        isTaxDetail: isTaxDetail,
      };
      let results = await LoadCentreChartOfAccountAPI(payload);
      if (results?.success) {
        if (isTaxDetail) {
          results?.data?.map((val) => {
            validateInvestigation({ value: val, isTaxDetail: true });
          });
        }
        // console.log("values?.VoucherType?.extraColomn", values?.VoucherType?.extraColomn?.split("#"))
        let filterData = [];
        let type = values?.VoucherType?.extraColomn?.split("#")[0];
        if (name === "AccountType") {
          filterData = results?.data?.filter(
            (val) =>
              val?.balanceType === type &&
              val?.CurrencyCode === values?.Currency?.value,
          );
        } else {
          filterData = results?.data?.filter(
            (val) => val?.balanceType !== type,
          );
        }
        setItems(filterData);
      } else {
        setItems([]);
      }
    } else {
      setItems([]);
    }
  };
  const validateInvestigation = async (e, name) => {
    if (!values?.VoucherType?.value && name === "AccountName") {
      notify("Please Select Voucher Type", "error");
      return 0;
    }
    const { value } = e;
    // debugger
    value.branchCentre = { value: userData?.defaultCentre };
    value.balanceType = { value: value?.balanceType };
    value.IsOnlySingleAccount = 0;
    value.isAccountName = false;
    value.ccList = [];
    value.mapList = [];
debugger
    if (name === "AccountType") {
      value.isAccountType = true;
      if (bodyData?.length > 0) {
        const findFirstData = bodyData[0];
        value.Department = findFirstData?.Department;
        value.branchCentre = findFirstData?.branchCentre;
        value.PaymentMode = findFirstData?.PaymentMode;
        value.Remark = findFirstData?.Remark;
        value.Refnumber = findFirstData?.Refnumber;
        value.RefDate = findFirstData?.RefDate;
      }
      setValues((val) => ({ ...val, ["AccountTypeValue"]: value }));
    } else {
      setValues((val) => ({ ...val, [name]: "" }));
    }
    
    if (
      values?.VoucherType?.IsOnlySingleAccount === 1 &&
      name === "AccountName"
    ) {
      value.IsOnlySingleAccount = 1;
      value.isAccountName = true;
      let updatedData = [];
      if (value?.isPendingInvoice) {
        console.log("...val,", value?.AdjustmentAmount);
        value.Amount = value?.AdjustmentAmount;
        setBodyData((val) => [value, ...val]);
        setValues((val) => ({ ...val, ["isPendingInvoice"]: true }));
      } else {
        updatedData = [
          ...bodyData?.filter((val) => val?.IsOnlySingleAccount !== 1),
        ];
        updatedData.splice(0, 0, value);
        setBodyData(updatedData);
        setValues((val) => ({ ...val, ["isPendingInvoice"]: false }));
      }
    } else if (name === "AccountType") {
      let updatedData = [...bodyData?.filter((val) => !val?.isAccountType)];
      updatedData.splice(updatedData?.length, 0, value);
      setBodyData(updatedData);
    } else if (name === "AccountName") {
      value.isAccountName = true;
      setBodyData((val) => [value, ...val]);
    } else {
      setBodyData((val) => [...val, { ...value, isChecked: value?.IsChecked }]);
    }
  };
  const itemTemplate = (item) => {
    return (
      <div className="p-clearfix">
        <div style={{ float: "left", fontSize: "12px", width: "100%" }}>
          {item?.TextField}
        </div>
      </div>
    );
  };

  const GetCurrencyConversionFactor = async (currencyCode, voucherDate) => {
    let periodClose = await GetPeriodClosed(
      moment(voucherDate).format("DD-MMM-YYYY"),
    );
    if (periodClose?.data === "Period Open") {
      let apiResp = await GetCurrencyConversionFactorAPI(
        currencyCode,
        voucherDate,
      );
      if (apiResp?.success) {
        setValues((val) => ({
          ...val,
          ConversionFactor: apiResp?.data,
          Actual: apiResp?.data,
        }));
      }
    } else {
      notify("Period Closed For Selected Month", "error");
      setValues((val) => ({
        ...val,
        voucherDate: newSession,
      }));
    }
  };

  const handleValidation = () => {
    let error = {};
    bodyData.map((val, index) => {
      console.log("vv", val);
      if (!val?.Department?.value) {
        error[`Department${index}`] =
          `Please Select Department In Row ${index + 1}`;
      } else if (!val?.isAccountType && !val?.Amount) {
        error[`Amount${index}`] = `Please Enter Amount In Row ${index + 1}`;
      } else if (
        ["BP", "CP", "BR", "CR", "CV", "BT"].includes(
          values?.VoucherType?.value,
        )
      ) {
        if (!val?.PaymentMode?.value) {
          error[`PaymentMode${index}`] =
            `Please Select Payment Mode In Row ${index + 1}`;
        } else if (!val?.Refnumber) {
          error[`Refnumber${index}`] =
            `Please Enter Reference number In Row ${index + 1}`;
        }
      } else if (
        !["BP", "CP", "BR", "CR", "CV", "BT"].includes(
          values?.VoucherType?.value,
        ) &&
        !val?.InvoiceNumber
      ) {
        error[`InvoiceNumber${index}`] =
          `Please Enter Invoice Number In Row ${index + 1}`;
      } else if (!val?.Remark) {
        error[`Remark${index}`] = `Please Enter Remark In Row ${index + 1}`;
      }
    });

    return error;
  };

  const handleSave = async () => {
    let errors = handleValidation();
    if (Object.keys(errors).length > 0) {
      notify(Object.values(errors)[0], "error");
      return 0;
    }

    if (amounts["Amount (Cr)"] - amounts["Amount (Dr)"] !== 0) {
      notify("Dr and Cr Amount should be equal", "error");
      return 0;
    } else if (
      amounts["Base Amount (Cr)"] - amounts["Base Amount (Dr)"] !==
      0
    ) {
      notify("Dr and Cr Base Amount should be equal", "error");
      return 0;
    } else if (values?.ConversionFactor <= 0) {
      notify("Conversion Factor should be greater than 0", "error");
      return 0;
    }

    const payload = FinanceSaveVoucherPayload(bodyData, amounts, values);
    // return;
    let apiResp = await FinanceSaveVoucher(payload);
    if (apiResp?.success) {
      notify(apiResp?.message, "success");
      setBodyData([]);
      setValues((val) => ({
        ...initialValues,
        Currency: values?.Currency,
        ConversionFactor: values?.ConversionFactor,
        Actual: values?.Actual,
        voucherNumber: apiResp?.data,
        VoucherDate: newSession,
      }));
      setModalData({
        visible: true,
        width: "25vw",
        label: t("Voucher Number"),
        CallAPI: () => { },
        footer: <></>,
        Component: (
          <h1 className="text-center  PatientUHID">
            {" "}
            <span className="text-red PatientUHID"> {apiResp?.data} </span>{" "}
          </h1>
        ),
      });
    } else {
      notify(apiResp?.message, "error");
    }
  };

  const handleImageChange = (e) => {
    const file = e?.target?.files[0];

    if (file) {
      // Check if file size exceeds 5MB (5 * 1024 * 1024 bytes)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        alert("File size exceeds 5MB. Please choose a smaller file.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader?.result.split(",")[1];
        const fileExtension = file?.name.split(".").pop();
        setValues((val) => ({ ...val, documentBase64: base64String }));
      };
      reader.readAsDataURL(file); // Convert file to base64
    }
  };
  console.log("firstssss", values);
  const handleSelectVoucher = async (
    value,
    isEdit = false,
    isReplicate = false,
  ) => {
    let payalod = {
      filterType: 2,
      voucherNo: value?.VoucherNo ? value?.VoucherNo : "",
      fromDate: moment(values?.fromDate).format("DD-MMM-YYYY"),
      toDate: moment(values?.toDate).format("DD-MMM-YYYY"),
    };
    let apiResp = await SearchVoucher(payalod);
    payalod.filterType = 3;
    let ccResp = await SearchVoucher(payalod);

    if (isReplicate) {
      let CurrencyConversionFactorResp = await GetCurrencyConversionFactorAPI(
        value?.CurrencyCode,
        value?.VoucherDate,
      );
      if (CurrencyConversionFactorResp?.success) {
        value.ConversionFactor = CurrencyConversionFactorResp?.data;
        value.Actual = CurrencyConversionFactorResp?.data;
      }
    }
    setValues((item) => ({
      ...item,
      VoucherType: { value: value?.TransacionType },
      isEdit: isEdit,
      isReplicate: isReplicate,
      VoucherNumber: isEdit ? value?.VoucherNo : "",
      VoucherDate: isEdit ? new Date(value?.VoucherDate) : newSession,
      Currency: {
        value: value?.CurrencyCode,
        isDisabled: value?.TypeCode === value?.CurrencyCode ? true : false,
      },
      ConversionFactor: isReplicate
        ? value.ConversionFactor
        : value?.TransCurrFactor,
      Actual: isReplicate ? value.Actual : value?.ActualCurrFactor,
      ProjectName: { value: value?.ProjectCode, label: value?.ProjectName },
    }));

    if (apiResp?.success) {
      setModalData({ visible: false });

      let data = apiResp?.data?.map((val, index) => {
        // if (index === 0) {

        // }
        let ccList = [];
        if (ccResp?.success) {
          ccList = ccResp?.data?.map((item) => {
            return {
              SerialNo: item?.SerialNo,
              RequirementArea: item?.ReqAreaName,
              CostCentre: item?.CostCentreName,
              ccAmount: item?.Amount,
            };
          });
        } else {
          ccList = [];
        }

        let conditionalData = {};
        if (["BP", "CP", "BR", "CR", "CV", "BT"].includes(val?.VoucherType)) {
          conditionalData = {
            PaymentMode: {
              value: String(val?.PaymentModeID),
              label: val?.PaymentMode,
            },
            Refnumber: val?.RefNo ? val?.RefNo : "",
            RefDate: val?.RefDate ? new Date(val?.RefDate) : new Date(),
          };
        } else {
          conditionalData = {
            InvoiceNumber: val?.DocumentNo ? val?.DocumentNo : "",
            InvoiceDate: val?.DocumentDate
              ? new Date(val?.DocumentDate)
              : new Date(),
          };
        }

        let ccListDetail = ccList?.filter(
          (item) => item?.SerialNo === index + 1,
        );
        return {
          GroupName: val?.ChartOfGroup,
          AccountName: val?.AccountName,
          ValueField: val?.COAID,
          branchCentre: { value: String(val?.BranchCentreID) },
          Department: {
            value: val?.DepartmentCode,
            label: val?.DepartmentName,
          },

          isAccountType: false,
          Amount: val?.AmountSpecific,
          TaxAmount: val?.VatAmt,
          balanceType: { value: val?.BalType },

          ...conditionalData,

          PaymentMode: {
            value: String(val?.PaymentModeID),
            label: val?.PaymentMode,
          },
          Refnumber: val?.RefNo ? val?.RefNo : "",
          RefDate: val?.RefDate ? new Date(val?.RefDate) : new Date(),

          // InvoiceNumber: val?.DocumentNo ? val?.DocumentNo : "",
          // InvoiceDate: val?.DocumentDate ? new Date(val?.DocumentDate) : new Date(),

          Remark: val?.Remarks,
          CurrencyCode: values?.Currency?.value ? values?.Currency?.value : "",
          TextField: val?.AccountName,
          ccList: ccListDetail ? ccListDetail : [],

          // mapList:mapList
        };
      });
      setBodyData(data);
    } else {
      notify(apiResp?.message, "error");
      setVoucherList([]);
    }
  };

  const handleSearchVoucherList = async (e) => {
    let payalod = {
      filterType: 1,
      voucherNo: values?.VoucherNo ? values?.VoucherNo : "",
      fromDate: moment(values?.fromDate).format("DD-MMM-YYYY"),
      toDate: values?.toDate ? moment(values?.toDate).format("DD-MMM-YYYY") : moment(values?.fromDate).format("DD-MMM-YYYY"),
    };

    let apiResp = await SearchVoucher(payalod);
    if (apiResp?.success) {
      setVoucherList(apiResp?.data);
    } else {
      notify(apiResp?.message, "error");
      setVoucherList([]);
    }
  };

  const HandleView = (value, index) => {
    return (
      <>
        {" "}
        <Tooltip
          target={`#icon-${index}`}
          content={`Verify By :${value?.VerifiedBy}\nVerify Date :${value?.VerifyDate}\nVerify Remark :${value?.VerifyRemark}\nAuth By :${value?.AuthBy}\nAuth Date :${value?.AuthDate}\nAuth Remark :${value?.AuthRemark}\nReview By :${value?.ReviewBy}\nReview Date :${value?.ReviewDate}\nReview Remark :${value?.ReviewRemarks}\nReview Resolved By :${value?.ReviewResolvedBy}\nReview Resolved Date :${value?.ReviewResolvedDate}\nReview Resolved Remark :${value?.ReviewResolvedRemarks}`}
          event="hover"
          position="top"
        />{" "}
        <strong id={`icon-${index}`} className="cursor-pointer text-danger">
          {" "}
          {t("View")}
        </strong>
      </>
    );
  };
  const handleEdit = async (ele) => {
    handleSelectVoucher(ele, true);
  };
  // const handleAttach = async (EntryDetailID) => {
  //   try {
  //     if (!EntryDetailID) {
  //       notify("EntryDetailID is required", "error");
  //       return;
  //     }
  //     const response = await PrintDownloadVoucher(EntryDetailID);
  //     if (response?.success) {
  //       if (response.data && Array.isArray(response.data)) {
  //         setDownloadVOucher(response.data);
  //       } else if (response.data?.rows) {
  //         setDownloadVOucher(response.data.rows);
  //       } else {
  //         setDownloadVOucher([]);
  //       }
  //     } else {
  //       notify(response?.message || "Failed to Download Voucher", "error");
  //     }
  //   } catch (error) {
  //     notify(error?.message || "Network error", "error");
  //   }
  // };

  const handleAttach = async (VoucherNo) => {
    try {
      if (!VoucherNo) {
        notify("Voucher No is required", "error");
        return;
      }

      const response = await PrintDownloadVoucher(VoucherNo);

      if (response?.success) {
        downloadBase64File(response?.data?.base64, response?.data?.fileName);
        notify("Files downloaded successfully", "success");
      } else {
        notify(response?.message || "Failed to Download Voucher", "error");
      }
    } catch (error) {
      notify(error?.message || "Network error", "error");
    }
  };

  const handlePrint = async (value, index) => {
    const payload = {
      filterType: 1,
      voucherNo: value?.VoucherNo,
    };

    const response = await FinanceVoucherPrint(payload);
    if (response?.success) {
      RedirectURL(response?.data?.pdfUrl);
    } else {
      notify(response?.message, "error");
    }
  };
  const handleReset = () => {
    setBodyData([]);
    setValues((val) => ({
      ...initialValues,
      Currency: values?.Currency,
      ConversionFactor: values?.ConversionFactor,
      Actual: values?.Actual,
      ProjectList: values?.ProjectList,
      ProjectName: {
        value:
          values?.ProjectList?.length === 1
            ? values?.ProjectList[0]?.value
            : "",
      },
    }));
    setModalData({ visible: false });
  };
  const handleOpenPendingInvoice = () => {
    setModalData({
      visible: true,
      width: "100vw",
      label: t("Pending Invoices"),
      // buttonName: buttonName,
      CallAPI: () => { },
      footer: <></>,
      Component: (
        <PendingInvoiceModal
          list={list}
          PageValue={values}
          bodyData={bodyData}
          setOldBodyData={setBodyData}
          setModalData={setModalData}
          validateInvestigationAdd={validateInvestigation}
        />
      ),
    });
  };

  const ReplicateVoucher = (val) => {
    handleSelectVoucher(val, false, true);
  };

  const ResolvedUnResolvedSave = async (data) => {
    if (!data?.Remarks) {
      notify("Please Enter Remarks", "error");
      return;
    }
    const payalod = {
      entryType: 7,
      entryStatus: data?.IsReviewResolved,
      voucherNo: data?.VoucherNo,
      remark: data?.Remarks,
    };
    // debugger
    let apiResp = await UpdateVoucherStatusAPI(payalod);
    if (apiResp?.success) {
      notify(apiResp?.message, "success");
      handleSearchVoucherList();
      setModalData({ visible: false });
    } else {
      notify(apiResp?.message, "error");
    }
  };
  const handleChangeModal = (e) => {
    setModalData((val) => ({
      ...val,
      modalData: { ...val?.modalData, [e.target.name]: e.target.value },
    }));
  };
  const hanldeResolvedUnResolved = (item, buttonName) => {
    setModalData({
      visible: true,
      width: "40vw",
      label: t("Resolve Unresolved Voucher"),
      buttonName: buttonName,
      modalData: item,
      CallAPI: ResolvedUnResolvedSave,
      // footer: <></>,
      Component: (
        <>
          <TextAreaInput
            lable={t("Remarks")}
            placeholder=""
            className="w-100 required-fields"
            id="Remarks"
            name="Remarks"
            value={values?.Remark}
            // rows={2}
            maxLength={200}
            onChange={handleChangeModal}
          />
        </>
      ),
    });
  };
  return (
    <>
      <div className="mt-2 spatient_registration_card">
        <div className="patient_registration card">
          <Heading isBreadcrumb={true}
            name={t("Voucher Booking")}
           />
          <div className="row p-2">
            <ReactSelect
              placeholderName={t("Voucher Type")}
              id="VoucherType"
              name="VoucherType"
              value={values?.VoucherType?.value}
              onChange={(name, e) => handleReactSelect(name, e)}
              isDisabled={bodyData?.length > 0 ? true : false}
              dynamicOptions={filterByTypes(
                list,
                [1],
                ["TypeID"],
                "TextField",
                "ValueField",
                "BalanceType",
              )}
              searchable={true}
              respclass="col-xl-2 col-md-4 col-sm-6 col-12"
            />
            <DatePicker
              className="custom-calendar"
              respclass="col-xl-2 col-md-4 col-sm-6 col-12"
              id="VoucherDate"
              name="VoucherDate"
              value={
                values?.VoucherDate
                  ? moment(values?.VoucherDate).toDate()
                  : new Date()
              }
              maxDate={new Date()}
              handleChange={handleChange}
              lable={t("Voucher Date")}
              placeholder={VITE_DATE_FORMAT}
            />
            <ReactSelect
              placeholderName={t("Currency")}
              id="Currency"
              name="Currency"
              value={values?.Currency?.value}
              removeIsClearable={true}
              onChange={(name, e) => handleReactSelect(name, e)}
              dynamicOptions={filterByTypes(
                list,
                [4],
                ["TypeID"],
                "TextField",
                "ValueField",
                "STD_CODE",
              )}
              searchable={true}
              respclass="col-xl-2 col-md-4 col-sm-6 col-12"
            />

            {/* <div className="col-xl-2 col-md-4 col-sm-6 col-12 d-flex"> */}
            <Input
              type="text"
              className="form-control "
              id="ConversionFactor"
              name="ConversionFactor"
              disabled={values?.Currency?.isDisabled}
              value={values?.ConversionFactor ? values?.ConversionFactor : ""}
              // onChange={handleChange}
              onChange={(e) => {
                inputBoxValidation(AMOUNT_REGX(8), e, handleChange);
              }}
              lable={t("Conversion Factor")}
              placeholder=" "
              respclass="col-xl-2 col-md-4 col-sm-6 col-12"
            />
            {/* </div> */}
            <div className="col-xl-2 col-md-4 col-sm-6 col-12">
              <LabeledInput
                label={t("Actual Conversion Factor")}
                value={values?.Actual ? values?.Actual : ""}
              />
            </div>

            <ReactSelect
              placeholderName={t("Project Name")}
              id="ProjectName"
              name="ProjectName"
              value={values?.ProjectName?.value}
              onChange={(name, e) => handleReactSelect(name, e)}
              dynamicOptions={values?.ProjectList}
              searchable={true}
              respclass="col-xl-2 col-md-4 col-sm-6 col-12"
            />

            {["PB", "BP", "BR", "CR", "CP", "SV"]?.includes(
              values?.VoucherType?.value,
            ) &&
              values?.VoucherType?.extraColomn !== "All" && (
                <>
                  <div className="col-xl-4 col-md-8 col-sm-6 col-12 ">
                    <AutoComplete
                      value={
                        values?.AccountType?.TextField
                          ? values?.AccountType?.TextField
                          : values?.AccountType
                      }
                      suggestions={items}
                      completeMethod={(e) => {
                        search(e, "AccountType");
                      }}
                      onChange={(e) =>
                        setValues({ ...values, AccountType: e.value })
                      }
                      className="w-100 required-fields"
                      onSelect={(e) => validateInvestigation(e, "AccountType")}
                      id="AccountType"
                      itemTemplate={itemTemplate}
                      onBlur={() => {
                        setValues((prev) => ({
                          ...prev,
                          AccountType: "",
                          AccountName: "",
                        }));
                      }}
                    />

                    <label
                      className="label lable truncate ml-3 p-1"
                    // style={{ fontSize: "5px !important" }}
                    >
                      {t(values?.VoucherType?.extraColomn?.split("#")[1])}
                    </label>
                  </div>
                  {console.log("values",values?.AccountType)}
                  {/* {values?.AccountTypeValue?.AccountName && (
                    <div className="col-xl-2 col-md-4 col-sm-6 col-12">
                      <LabeledInput
                        label={
                          t(values?.VoucherType?.extraColomn?.split("#")[1]) +
                          " " +
                          t("Value")
                        }
                        value={values?.AccountTypeValue?.AccountName}
                      />
                    </div>
                  )} */}
                </>
              )}
            <ReactSelect
              placeholderName={t("Chart Of Group")}
              id="ChartOfGroup"
              name="ChartOfGroup"
              value={values?.ChartOfGroup?.value}
              removeIsClearable={true}
              onChange={(name, e) => handleReactSelect(name, e)}
              dynamicOptions={[
                { label: "ALL", value: "0" },
                ...filterByTypes(
                  list,
                  [15],
                  ["TypeID"],
                  "TextField",
                  "ValueField",
                ),
              ]}
              searchable={true}
              respclass="col-xl-2 col-md-4 col-sm-6 col-12"
            />
            <div className="col-xl-4 col-md-8 col-sm-6 col-12">
              <AutoComplete
                value={
                  values?.AccountName?.TextField
                    ? values?.AccountName?.TextField
                    : values?.AccountName
                }
                suggestions={items}
                completeMethod={(e) => {
                  search(e, "AccountName");
                }}
                disabled={modalData?.disableAccountName}
                onChange={(e) => setValues({ ...values, AccountName: e.value })}
                className="w-100"
                onSelect={(e) => validateInvestigation(e, "AccountName")}
                id="AccountName"
                itemTemplate={itemTemplate}
                onBlur={() => {
                  setValues((prev) => ({
                    ...prev,
                    AccountType: "",
                    AccountName: "",
                  }));
                }}
              />
              <label
                className="label lable truncate ml-3 p-1"
                style={{ fontSize: "5px !important" }}
              >
                {t("Account Name")}
              </label>
            </div>

            {values?.VoucherType?.CurrencyCode?.length > 0 && (
              <button
                className="btn btn-sm btn-success ml-2"
                onClick={handleOpenPendingInvoice}
              >
                {t("Pending Invoice")}
              </button>
            )}
            <button
              className="btn btn-sm btn-success ml-2 bg-danger"
              onClick={handleReset}
            >
              {t("Reset")}
            </button>
          </div>
        </div>
      </div>
      <div className="mt-2 ">
        <div className="card">
          {list?.length > 0 && (
            <VoucherBookingTable
              tbody={bodyData}
              setOldBodyData={setBodyData}
              list={list}
              values={values}
            />
          )}
        </div>
      </div>
      {bodyData?.length > 0 && (
        <div className="mt-2 ">
          <div className=" card">
            <div className="row px-2 pt-2">
              <div className="col-9">
                <div className="row">
                  {Object.keys(amounts)?.map((val) => {
                    return (
                      <div className="col-xl-2 col-md-4 col-sm-6 col-12 mb-2">
                        <LabeledInput label={t(val)} value={amounts[val]} />
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="col-3">
                <div className="row">
                  <div className="col-xl-4 col-md-4  col-12 mb-2 ">
                    <BrowseButton
                      label={t("Browse")}
                      handleImageChange={handleImageChange}
                      className={`btn-primary  w-100 px-xl-3`}
                      value={values?.documentBase64}
                    />
                  </div>
                  <div className="col-xl-4 col-md-4  col-12  mb-2">
                    <button
                      className="btn btn-sm btn-primary  w-100 px-xl-2 "
                      type="button"
                      onClick={handleSave}
                    >
                      {t(values?.isEdit ? "Update" : "Save")}
                    </button>
                  </div>
                  {/* <div className="col-xl-4 col-md-4  col-12  mb-2 ">
                  <button className="btn btn-sm btn-primary w-100 px-xl-3" type="button" style={{ backgroundColor: "#61368b" }} onClick={ReplicateModalOpen}>
                    {t("Replicate")}
                  </button>
                </div> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="mt-1 spatient_registration_card">
        <div className="card">
          <Heading
            isBreadcrumb={false}
            title={t("Voucher List")}
          // secondTitle={
          //   <button
          //     className="btn btn-sm btn-primary "
          //     type="button"
          //     style={{ backgroundColor: "#61368b" }}
          //     onClick={ReplicateModalOpen}
          //   >
          //     {t("Replicate")}
          //   </button>
          // }
          />
          <div className="row px-2 pt-2">
            <Input
              type="text"
              className="form-control "
              id="VoucherNo"
              name="VoucherNo"
              value={values?.VoucherNo ? values?.VoucherNo : ""}
              onChange={handleChange}
              lable={t("Voucher No.")}
              placeholder=" "
              respclass="col-xl-2 col-md-4 col-sm-6 col-12"
            />
            <CustomDateRangePicker
              name="dateRange"
              id="dateRange"
              labelKey="dateRange"
              label={t("Select Date Range")}
              startDate={values?.fromDate || null}
              endDate={values?.toDate || null}
              onChange={handleDateRangeChange}
              respClass="col-xl-2 col-md-4 col-sm-4 col-12"
            />
            <div className="col-xl-1 col-md-1 col-sm-2 col-3 2">
              <button
                className="btn btn-sm btn-primary  w-100   "
                type="button"
                onClick={handleSearchVoucherList}
              >
                {t("Search")}
              </button>
            </div>
          </div>
          <HisTable
            thead={WrapTranslate(voucherHead, "name")}
            tbody={voucherList?.map((val, index) => ({
              Sno: index + 1,
              VoucherType: val?.VoucherName,
              VoucherNo: val?.VoucherNo,
              VoucherDate: val?.VoucherDate,
              DR: (
                <CustomTooltipHis
                  id={`DR${index}`}
                  content={val?.DR}
                  icon={
                    <i id={`DR${index}`}>
                      {" "}
                      {val?.DR?.length > 30
                        ? val?.DR?.substring(0, 30) + "..."
                        : val?.DR}{" "}
                    </i>
                  }
                />
              ),
              CR: (
                <CustomTooltipHis
                  id={`CR${index}`}
                  content={val?.CR}
                  icon={
                    <i id={`CR${index}`}>
                      {" "}
                      {val?.CR?.length > 30
                        ? val?.CR?.substring(0, 30) + "..."
                        : val?.CR}{" "}
                    </i>
                  }
                />
              ),
              VoucherAmount: (
                <AlignTableText value={val?.VoucherAmount} isAmount={true} />
              ),
              EntryDate: val?.EntryDate,
              EntryBy: val?.EntryBy,
              Status: val?.Status,
              review:
                val?.IsReviewResolvedEdit === 1 ? (
                  val?.IsReviewResolved === "No" ? (
                    <button
                      className="btn btn-sm btn-primary table-btn"
                      onClick={() => {
                        hanldeResolvedUnResolved(val, "Resolved");
                      }}
                    >
                      {"Resolved"}
                    </button>
                  ) : (
                    <button
                      className="btn btn-sm btn-primary table-btn"
                      onClick={() => {
                        hanldeResolvedUnResolved(val, "Un-Resolved");
                      }}
                    >
                      {"Un-Resolved"}
                    </button>
                  )
                ) : (
                  ""
                ),
              Action: (
                <>
                  {val?.IsEdit === 1 ? (
                    <CustomTooltipHis
                      id={`edit${index}`}
                      content={"Edit"}
                      icon={
                        <i
                          className="fa fa-edit px-2"
                          aria-hidden="true"
                          id={`edit${index}`}
                          onClick={() => {
                            handleEdit(val, index);
                          }}
                        ></i>
                      }
                    />
                  ) : (
                    <i
                      className="fa fa-edit px-2"
                      aria-hidden="true"
                      id={`edit${index}`}
                      style={{ color: "lightgrey" }}
                    ></i>
                  )}
                  <CustomTooltipHis
                    id={`Print${index}`}
                    content="Print"
                    icon={
                      <i
                        className="fa fa-print px-2"
                        id={`Print${index}`}
                        aria-hidden="true"
                        onClick={() => {
                          handlePrint(val, index);
                        }}
                      ></i>
                    }
                  />
                  <CustomTooltipHis
                    id={`paperclip${index}`}
                    content="Download Attachment"
                    icon={
                      <i
                        className={`fa fa-paperclip px-2 ${!val?.FileNamePath && "text-muted"} `}
                        id={`paperclip${index}`}
                        aria-hidden="true"
                        onClick={() => {
                          val?.FileNamePath && handleAttach(val?.VoucherNo);
                        }}
                      ></i>
                    }
                  />

                  <CustomTooltipHis
                    id={`replicate${index}`}
                    content="Replicate"
                    icon={
                      <i
                        className="fa fa-copy px-2"
                        id={`replicate${index}`}
                        aria-hidden="true"
                        onClick={() => {
                          ReplicateVoucher(val, index);
                        }}
                      ></i>
                    }
                  />

                  {/* <i
                  className="fa fa-paperclip"
                  aria-hidden="true"
                  onClick={() => {
                    handleAttach(val, index);
                  }}
                ></i> */}
                </>
              ),
            }))}
          // style={{maxHeight:"45vh"}}
          />
        </div>
      </div>

      <FinanceModal
        visible={modalData?.visible}
        setVisible={() => {
          setModalData((val) => ({ ...val, visible: false }));
        }}
        modalData={modalData?.modalData}
        modalWidth={modalData?.width}
        Header={modalData?.label}
        buttonType="button"
        buttonName={modalData?.buttonName}
        footer={modalData?.footer}
        handleAPI={modalData?.CallAPI}
      >
        {modalData?.Component}
      </FinanceModal>
    </>
  );
}

export default VoucherBooking;
