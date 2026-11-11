
import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from "react";

import { toast } from "react-toastify";
import moment from "moment";

import { useTranslation } from "react-i18next";
import { axiosInstance, axiosReport } from "../../utils/axiosInstance";
import { dateConfig, ExportToExcel, formatCurrency, number } from "../../utils/helpers";
import { AdvancePaymentValidationSchema } from "../../utils/Schema";
import { getPaymentModes } from "../../utils/NetworkApi/commonApi";
import AdvancePaymentCancelModal from "./AdvancePaymentCancelModal";
import AdvancePaymentCreditModal from "./AdvancePaymentCreditModal";
import DatePicker from "../../components/formComponent/DatePicker";
import { AgainstInvoice, RADIOADVANCEINPUT } from "../../utils/Constants";
import { SelectBox } from "../../components/formComponent/SelectBox";
import Tables from "../../components/UI/customTable";

import Accordion from "@app/components/UI/Accordion";
import { AutoComplete } from "primereact/autocomplete";

import Loading from "../../components/loader/Loading";
import Input from "../../components/formComponent/Input";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import RazorPay from "../Payment/RazorPay";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import ReactSelect from "../../components/formComponent/ReactSelect";
import MultiSelectComp from "../../components/formComponent/MultiSelectComp";
import ExcelActiveIcon from "../../assets/image/excelIcon.png";
import redExcel from "../../assets/image/redExcel.png";
import LabeledInput from "../../components/formComponent/LabeledInput";
import MpesaModal from "../../components/MpesaModal/MpesaModal";
import "./AdvancePayment.css";
import Pagination from "../../Pagination/Pagination";
import { CustomButton } from "../../components/UI/CustomButton";
import { guidNumber } from "../../utils/generateGuid";

function AdvancePayment() {
  const [pageSize, setPageSize] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [CentreData, setCentreData] = useState([]);
  const [PaymentMode, setPaymentMode] = useState([]);
  const [loadingSecond, setLoadingSecond] = useState(false);
  const [OldInvoiceDropDown, setOldInvoiceDropDown] = useState([]);
  const [creditdebit, setCreditDebit] = useState([]);
  const [BankName, setBankName] = useState([]);
  const [CreditModalShow, setCreditModalShow] = useState(false);
  const [selectRateType, setSelectRateType] = useState({});
  const [AdvancePaymentDetail, setAdvancePaymentDetail] = useState([]);
  const [AgainstInvoice, setAgainstInvoice] = useState("");
  const [CenterType, setCentreType] = useState([]);
  const [creditNoteReceiptNoList, setCreditNoteReceiptNoList] = useState([]);
  // const userData = useLocalStorage("userData", "get");
  // const DefaultCurrencyName = userData?.DefaultCurrencyName;
  const accessRightStr = useLocalStorage("accessRight", "get") || "";
  console.log("accessRightStrdndjn", accessRightStr)
  const accessRights = accessRightStr.split(",");
  const hasAccess36 = accessRights.includes("36");
  console.log("hasAccess36", hasAccess36);
  const [filteredAdvancePaymentDetail, setFilteredAdvancePaymentDetail] =
    useState([]);
  const [dropdownList, setDropdownList] = useState({
    depositeList: [],
  });
  const [depositeColors, setDepositeColors] = useState([]);
  const [paymentModeFilter, setPaymentModeFilter] = useState(null);
  const [show, setShow] = useState({
    id: "",
    receiptNo: "",
    modalShow: false,
    cancelReason: "",
  });
  const [paymenyId, setPaymentId] = useState({
    receipt: "",
    key_id: "",
    key_secret: "",
  });
  const [err, setErr] = useState("");
  const [TypeRate, setType] = useState([]);
  const [outstanding, setOutstanding] = useState({
    OutstandingAmount: 0,
    ReceivedAmount: 0,
    CreditLimit: 0,
    BillingAmount: 0,
  });
  const [formData, setFormData] = useState({
    paymentModeID: "",
    TransactionId: "",
    InvoiceNo: "",
    InvoiceAmount: "",
    ReceivedAmt: "0",
    PaymentMode: "",
    BankName: "",
    CreditCardNo: "",
    DraftNo: "",
    ChequeNo: "",
    ChequeDate: new Date(),
    ReceiveDate: new Date(),
    RateTypeID: "",
    AdvanceAmtDate: new Date(),
    tdsFromDate: new Date(),
    tdsToDate: new Date(),
    AllowTDSDateRangeCalender: "0",
    CreditNote: "1",
    Remarks: "",
    Type: "",
    CreditDebit: "",
    CreditNoteReceiptNo: ""
  });
  console.log("formData", formData)
  const [isRazorPayOpen, setIsRazorPayOpen] = useState(false);
  const [showMpesa, setShowMpesa] = useState(false);
  const [mpesaId, setMpesaId] = useState("");
  const [loadingPrintId, setLoadingPrintId] = useState(null);
  const [PendingandOutstandingAmt, setPendingandOutstandingAmt] = useState({
    pending: 0,
    outstanding: 0,
  });

  // Debounce timer ref
  const debounceTimer = useRef(null);

  // Ref to track the currently selected RateTypeID to avoid duplicate calls
  const selectedRateTypeIDRef = useRef("");
  const userdata = useLocalStorage("userData", "get");
  const DefaultCurrencyName = userdata?.DefaultCurrencyName;
  const pathcareValidation = DefaultCurrencyName === "KES"


  const IsOnlinePayment = () => {
    axiosInstance
      .get("RazorPay/Otherpayment")
      .then((res) => {
        if (res?.data?.message?.payment_capture == 1) {
          setIsRazorPayOpen(true);
          setPaymentId({
            receipt: res?.data?.message?.receipt,
            key_id: res?.data?.message?.key_id,
            key_secret: res?.data?.message?.key_secret,
          });
        } else {
          saveData();
        }
      })
      .catch((err) =>
        toast.error(
          err?.data?.response?.message
            ? err?.data?.response?.message
            : "Error Occur",
        ),
      );
  };

  const { t } = useTranslation();
  const close = () => {
    handleCreditDebit();
  };
  const CompanyID = useLocalStorage("userData", "get")?.CompanyID;
  const AccessRight = useLocalStorage("accessRight", "get") || "";

  const hasAccessRight31 = AccessRight.split(",").includes("31");
  console.log("hasAccessRight31", hasAccessRight31, AccessRight)
  const hasAccessRight32 = AccessRight.split(",").includes("32");
  const canCancelAdvance = hasAccessRight31 || (hasAccessRight32 && pathcareValidation);
  const userData = useLocalStorage("userData", "get");
  console.log("userData", userData);
  const HideNonDeposit = Number(userData?.HideNonDeposit) || 0;
  const HideNonCash = Number(userData?.HideNonCash) || 0;
  const defaultCenter = Number(userData?.DefaultCentre) || 0;
  const CenterName = userData?.CenterName;


  const getOutstandingAmount = (id) => {
    axiosInstance
      .post("Accounts/CheckAgainstInvoiceAmt", {
        RateTypeID: id?.toString(),
        CompanyID: CompanyID,
      })
      .then((res) => {
        if (res?.data?.success) {
          const data = res?.data?.message?.split("#");
          setOutstanding({
            OutstandingAmount: Number(data[2]) + Number(data[1]) - data[0],
            ReceivedAmount: data[1],
            CreditLimit: data[2],
            BillingAmount: data[0],
          });
        } else
          setOutstanding({
            OutstandingAmount: 0,
            ReceivedAmount: 0,
            CreditLimit: 0,
            BillingAmount: 0,
          });
      })
      .catch((err) => {
        setOutstanding({
          OutstandingAmount: 0,
          ReceivedAmount: 0,
          CreditLimit: 0,
          BillingAmount: 0,
        });
        console.log(err);
      });
  };
  // Debounced API call function
  const debouncedGetOutstandingAmount = useCallback((id) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      getOutstandingAmount(id);
    }, 500);
  }, []);

  const debouncedHandleOldReceipt = useCallback((id) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      handleOldReceipt(id);
    }, 500);
  }, []);

  const handleAutoCompleteChange = (e) => {
    const val = e.target?.value;
    setSelectRateType(val);

    if (!val || !val?.value) {
      setFormData((prev) => ({ ...prev, RateTypeID: "" }));
      selectedRateTypeIDRef.current = "";
      setAdvancePaymentDetail([]);
      setFilteredAdvancePaymentDetail([]);
      setOutstanding({
        OutstandingAmount: 0,
        ReceivedAmount: 0,
        CreditLimit: 0,
        BillingAmount: 0,
      });
    }
  };

  const handleAutoCompleteSelect = (e) => {
    const selected = e.value;
    if (!selected?.value) return;

    if (selectedRateTypeIDRef.current === String(selected.value)) return;
    selectedRateTypeIDRef.current = String(selected.value);

    setSelectRateType(selected);
    setFormData((prev) => ({ ...prev, RateTypeID: String(selected.value) }));
    setAgainstInvoice(selected.AgainstInvoice);
    setCentreType(selected.CentreType);


    handleOldReceipt(selected.value);
    getOutstandingAmount(selected.value);
    fetchAdvancePaymentDetail("display", "0", null, String(selected.value));
  };

  const handleSearchSelectChange = (label, value) => {
    if (label === "RateTypeID") {
      setFormData((prev) => ({ ...prev, [label]: value?.value?.toString() }));
      debouncedHandleOldReceipt(value?.value);
      debouncedGetOutstandingAmount(value?.value);
      return;
    }
  };

  const handleSelectChange = (event) => {
    const { name, value, selectedIndex } = event.target;
    const label = event.target.children[selectedIndex].text;
    // Every setFormData here uses the functional form. The "Type" and
    // "InvoiceNo" branches do not return, so they fall through to the trailing
    // else and write twice; with a { ...formData } spread the second write
    // replayed a stale snapshot and wiped whatever the user had just typed.
    if (name == "Type") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
      setCentreData([]);
      getRateType(value);
    }
    if (name === "InvoiceNo") {
      setFormData((prev) => ({ ...prev, [name]: value }));
      handlePendingAmount(value, formData?.RateTypeID);
    }

    if (name === "paymentModeID") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        PaymentMode: label,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const isValidDate = (dateStr) => {
    if (!dateStr || dateStr === "-" || dateStr === "0000-00-00") return false;

    const date = new Date(dateStr);

    if (isNaN(date.getTime())) return false;

    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const month = parts[1];
      const day = parts[2];
      if (month === "00" || day === "00") return false;
    }

    return true;
  };

  const handlePendingAmount = (id, id2) => {
    if (id) {
      axiosInstance
        .post("Accounts/PendingandOutstandingAmt", {
          InvoiceNo: id,
          RateTypeID: String(id2),
        })
        .then((res) => {
          const data = res?.data?.message;
          setPendingandOutstandingAmt({
            pending: data?.pendingAmt ?? 0,
            outstanding: data?.outstanding ?? 0,
          });
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  const handleCreditDebit = () => {
    axiosInstance
      .get("Accounts/GetCreditDebitNote")
      .then((res) => {
        const data = res?.data?.message;
        const val = data.map((ele) => {
          return {
            value: ele?.Id,
            label: ele?.CreditDebit,
          };
        });
        setCreditDebit(val);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleOldReceipt = (id) => {
    axiosInstance
      .post("Accounts/SelectOldInvoiceNo", { RateTypeID: id })
      .then((res) => {
        const data = res?.data?.message?.map((ele) => {
          return {
            value: ele?.InvoiceNo,
            label: ele?.InvoiceNo,
            shareamt: ele?.shareamt,
          };
        });
        setOldInvoiceDropDown([
          { label: "select", value: "", shareamt: 0 },
          ...data,
        ]);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleRadioSelect = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = (condition1, condition, InvoiceAmt) => {
    let disable = false;
    let message = "";
    if (
      condition === "" &&
      !["2", "3"]?.includes(formData?.CreditNote) &&
      isPaymentModeRequired?.PaymentModeRequired == 1 &&
      formData?.AllowTDSDateRangeCalender !== "1"
    ) {
      disable = true;
      message = "Please Choose Payment Mode";
    } else if (["Paytm", "Online Payment"].includes(condition)) {
    } else if (["Debit Card", "Credit Card"].includes(condition)) {
      if (formData["BankName"] === "") {
        disable = true;
        message = "Please Choose BankName";
      } else if (!pathcareValidation && formData["CreditCardNo"].length < 15) {
        disable = true;
        message = `Please Enter Valid ${condition} Number`;
      }
    } else if (["Cheque"].includes(condition)) {
      if (formData["BankName"] === "") {
        disable = true;
        message = "Please Choose BankName";
      } else if (!pathcareValidation && formData["ChequeNo"].length < 15) {
        disable = true;
        message = `Please Enter Valid ${condition} Number`;
      }
    }

    if (condition) {
      if (InvoiceAmt === "" || InvoiceAmt == 0) {
        disable = true;
        message = "Please Enter InvoiceAmt";
      }
      if (condition1 === "") {
        disable = true;
        message = "Please Enter Remarks";
      }

      if (condition != "Cash" && condition != "Online Payment") {
        if (formData["TransactionId"].length < (pathcareValidation ? 5 : 10)) {
          disable = true;
          message = "Please Fill Correct Transaction Number";
        }
      }
    }
    return {
      disable: disable,
      message: message,
    };
  };

  const getType = () => {
    axiosInstance
      .get("centre/getCentreType")
      .then((res) => {
        const data = res?.data?.message;

        const Type = data?.map((ele) => {
          return {
            value: ele?.id,
            label: ele?.Centretype,
          };
        });
        setType(Type);
      })
      .catch((err) => {
        toast.error(err?.res?.data ? err?.res?.data : "Something Went Wrong");
      });
  };

  const getCreditNoteReceiptNo = () => {
    axiosInstance
      .post(`Accounts/GetInvoiceNoList?ClientID=${formData?.RateTypeID}`)
      .then((res) => {
        const data = res?.data?.data?.map((ele) => ({
          value: ele?.receiptNo,
          label: ele?.receiptNo,
        }));
        setCreditNoteReceiptNoList(data || []);
      })
      .catch((err) => {
        console.log(err);
        toast.error(err?.res?.data ? err?.res?.data : "Something Went Wrong");
      });
  };


  const fetchAdvancePaymentDetail = (name, type, save, rateTypeIDOverride) => {
    const clientID = rateTypeIDOverride ?? formData?.RateTypeID;
    if (!clientID) return;

    axiosInstance
      .post("Accounts/AdvancePaymentDetail", {
        ClientID: clientID,
        CreditNote: formData?.CreditNote,
        isCancel: type,
      })
      .then((res) => {
        if (save == "Save") {
          // Functional form: this runs in a .then(), so the closure's formData
          // is a snapshot from before the request and would undo anything the
          // user changed while it was in flight.
          setFormData((prev) => ({
            ...prev,
            paymentModeID: "",
            TransactionId: "",
            InvoiceNo: "",
            InvoiceAmount: "",
            ReceivedAmt: "0",
            PaymentMode: "",
            BankName: "",
            CreditCardNo: "",
            DraftNo: "",
            ChequeNo: "",
            ChequeDate: new Date(),
            ReceiveDate: new Date(),
            AdvanceAmtDate: new Date(),
            tdsFromDate: new Date(),
            tdsToDate: new Date(),
            Remarks: "",
            CreditDebit: "",
          }));
        }
        if (name === "display") {
          const data = res?.data?.data || res?.data?.message || [];
          setAdvancePaymentDetail(data);
          setFilteredAdvancePaymentDetail(data);
          setCurrentPage(1);

          const uniqueDeposites = {};
          data?.forEach((item) => {
            if (item.Type) {
              uniqueDeposites[item.Type] = getColorForType(item.Type);
            }
          });

          setDepositeColors(
            Object.entries(uniqueDeposites).map(([label, color]) => ({
              label,
              color,
            })),
          );
        } else {
          ExportToExcel(res?.data?.data);
        }
      })
      .catch();
  };

  const AdvancePaymentDetail1 = (name, type, save) => {
    fetchAdvancePaymentDetail(name, type, save);
  };

  const getColorForType = (type) => {
    const typeColors = {
      Deposite: "#00FA9A",
      CN: "#FFA500",
      DN: "#1E90FF",
      TDS: "#FF69B4",
      Others: "#FFD700",
    };
    return typeColors[type] || "#00FA9A";
  };

  const getDepositeTypeColor = (type) => {
    const t = normalize(type);
    const colors = {
      deposit: { bg: "#00FA9A", text: "#065f46" },
      cn: { bg: "#FFA500", text: "#7c2d12" },
      dn: { bg: "#1E90FF", text: "#1e3a5f" },
      tds: { bg: "#FF69B4", text: "#6b1040" },
      others: { bg: "#FFD700", text: "#713f12" },
    };
    return colors[t] || null;
  };

  const getPaymentModeColor = (paymentMode) => {
    const pm = normalize(paymentMode);
    if (pm === "cash") return { bg: "#9370DB", text: "#fff" };
    if (pm !== "") return { bg: "#20B2AA", text: "#fff" };
    return null;
  };

  const dateSelect = (value, name) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const getlabel = () => {
    const ele = creditdebit?.filter((item) => {
      return item?.value == formData?.CreditDebit;
    });

    if (ele.length > 0) {
      return ele[0].label;
    }
  };

  const handleSave = () => {
    const { disable, message } = validate(
      formData["Remarks"],
      formData["PaymentMode"],
      formData.InvoiceAmount,
    );

    const generatedError = AdvancePaymentValidationSchema(formData);
    if (generatedError === "") {
      if (!disable) {
        if (formData?.PaymentMode == "Online Payment") {
          IsOnlinePayment();
        } else {
          saveData();
        }
      } else {
        toast.error(message);
      }
    } else {
      setErr(generatedError);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Functional update, not { ...formData }: spreading the closure's formData
    // reverts any field written by another handler in the same batch. That is
    // how a typed TransactionId reached the payload as "" - a select change
    // firing in the same tick replayed the pre-typing snapshot over it.
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (formData?.RateTypeID) {
      getCreditNoteReceiptNo(formData?.RateTypeID);
    }
    getType();
    getPaymentModes("PaymentMode", setPaymentMode);
    getPaymentModes("BankName", setBankName);
  }, [formData?.RateTypeID]);

  useEffect(() => {
    if (formData?.RateTypeID) {
      AdvancePaymentDetail1("display", "0");
    } else {
      setAdvancePaymentDetail([]);
      setFilteredAdvancePaymentDetail([]);
    }
  }, [formData?.CreditNote, formData?.Type]);

  // ✅ FIX 2: handlePDF me rowId (data?.ID) se track karo — sirf us row ka spinner ghume
  const handlePDF = (e, receiptNo, rowId) => {
    setLoadingPrintId(rowId);
    axiosReport
      .post(
        "commonReports/GetSingleReceiptData",
        { ReceiptNo: receiptNo, receiptId: rowId },
        { responseType: "arraybuffer" },
      )
      .then((res) => {
        const file = new Blob([res.data], { type: "application/pdf" });
        const fileURL = URL.createObjectURL(file);
        window.open(fileURL, "_blank");
      })
      .catch((err) => {
        toast.error(
          err?.data?.message ? err?.data?.message : "Something Went Wrong",
        );
      })
      .finally(() => {
        setLoadingPrintId(null);
      });
  };

  const handleFindAll = (id) => {
    const data = OldInvoiceDropDown.find((ele) => ele?.value === id);
    return data?.shareamt;
  };
  const handleValidateRow = (row) => {
    const payload = {
      AdvanceAmountId: String(row?.ID || ""),
    };

    console.log("Validate payload", payload);

    axiosInstance
      .post("Accounts/AdvanceValidation", payload)
      .then((res) => {
        if (res?.data?.success) {
          toast.success(res?.data?.message || "Validated Successfully");
           AdvancePaymentDetail1("display");
        } else {
          toast.error(res?.data?.message || "Validation failed");
        }
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Error while validating");
      });
  };
  const handleCancel = () => {
    if (show?.cancelReason) {
      axiosInstance
        .post("Accounts/AdvanceAmountCancel", {
          AdvanceAmountId: show?.id,
          ReceiptNo: show?.receiptNo,
          CancelReason: show?.cancelReason,
        })
        .then((res) => {
          // The API answers HTTP 200 for refusals and SQL errors too, carrying
          // success:false, so .catch never sees them. Without this check a
          // failed cancel was announced as a green success toast and the grid
          // refreshed, leaving the advance uncancelled with no visible error.
          // Same shape as handleValidateRow above.
          if (res?.data?.success) {
            toast.success(res?.data?.message || "Cancelled Successfully");
            AdvancePaymentDetail1("display", "0");
            handleHide();
          } else {
            toast.error(res?.data?.message || "Something Went Wrong");
          }
        })
        .catch((err) => {
          toast.error(
            err?.response?.data?.message
              ? err?.response?.data?.message
              : "Something Went Wrong",
          );
        });
    } else {
      toast.error("Please Enter Remark");
    }
  };

  const handlePaymentModeFilter = (mode) => {
    setPaymentModeFilter(mode);
  };

  useEffect(() => {
    setPaymentModeFilter(null);
  }, [AdvancePaymentDetail]);

  const normalize = (v) =>
    String(v || "")
      .trim()
      .toLowerCase();

  useEffect(() => {
    if (paymentModeFilter === null) {
      setFilteredAdvancePaymentDetail(AdvancePaymentDetail || []);
      setCurrentPage(1);
      return;
    }

    const newFilteredData = (AdvancePaymentDetail || []).filter((row) => {
      const paymentMode = normalize(row.PaymentMode);
      const paymentType = normalize(row.Type);
      const filter = normalize(paymentModeFilter);

      if (filter === "cash") return paymentMode === "cash";
      if (filter === "non-cash")
        return paymentMode !== "cash" && paymentMode !== "";

      return paymentType === filter;
    });

    setFilteredAdvancePaymentDetail(newFilteredData);
    setCurrentPage(1);
  }, [paymentModeFilter, AdvancePaymentDetail]);

  const handleChangeNew = (e) => {
    const { name, value } = e.target;
    setShow({ ...show, [name]: value });
  };

  const handleHide = () => {
    setShow({
      id: "",
      receiptNo: "",
      modalShow: false,
      cancelReason: "",
    });
  };

  useEffect(() => {
    handleCreditDebit();
  }, []);

  const saveData = (data) => {
    if (data) {
      setIsRazorPayOpen(false);
      setLoadingSecond(false);
      setPendingandOutstandingAmt({
        pending: 0,
        outstanding: 0,
      });
      setPaymentId({
        receipt: "",
        key_id: "",
        key_secret: "",
      });
      setErr("");
      setFormData({
        paymentModeID: "",
        TransactionId: "",
        InvoiceNo: "",
        InvoiceAmount: "",
        ReceivedAmt: "0",
        PaymentMode: "",
        BankName: "",
        CreditCardNo: "",
        DraftNo: "",
        ChequeNo: "",
        ChequeDate: new Date(),
        ReceiveDate: new Date(),
        RateTypeID: "",
        AdvanceAmtDate: new Date(),
        tdsFromDate: new Date(),
        tdsToDate: new Date(),
        CreditNote: "1",
        Remarks: "",
        Type: "",
        CreditDebit: "",
      });

      AdvancePaymentDetail1("display");
    } else {
      setLoadingSecond(true);
      axiosInstance
        .post("Accounts/InsertAdvancePayment", {
          ...formData,
          CreditDebitNoteType: getlabel(),
          ChequeDate: moment(formData?.ChequeDate).format("DD-MMM-YYYY"),
          ReceiveDate: moment(formData?.AdvanceAmtDate).format("DD-MMM-YYYY"),
          tdsFromDate:
            formData?.AllowTDSDateRangeCalender === "1"
              ? moment(formData?.tdsFromDate).format("YYYY-MM-DD")
              : null,

          tdsToDate:
            formData?.AllowTDSDateRangeCalender === "1"
              ? moment(formData?.tdsToDate).format("YYYY-MM-DD")
              : null,
          paymentModeID: String(formData?.paymentModeID),
        })
        .then((res) => {
          if (res?.data?.success) {
            setIsRazorPayOpen(false);
            toast.success(res?.data?.message);
            getOutstandingAmount(formData?.RateTypeID);
            handleOldReceipt(formData?.RateTypeID);
            setPendingandOutstandingAmt({
              pending: 0,
              outstanding: 0,
            });
            setPaymentId({
              receipt: "",
              key_id: "",
              key_secret: "",
            });
            setErr("");
            AdvancePaymentDetail1("display", "", "Save");
          } else {
            toast.error(res?.data?.message);
          }
          setLoadingSecond(false);
        })
        .catch((err) => {
          setIsRazorPayOpen(false);
          toast.error(
            err?.data?.message ? err?.data?.message : "Something Went Wrong",
          );
          setLoadingSecond(false);
        });
    }
  };

  const getTotalInvoiceAmount = () => {
    const returnAmount = OldInvoiceDropDown?.reduce(
      (acc, current) => acc + current.shareamt || 0,
      0,
    );
    return OldInvoiceDropDown?.length > 1 ? returnAmount : 0;
  };

  const dueAmount =
    (outstanding?.BillingAmount ?? 0) - (outstanding?.ReceivedAmount ?? 0);

  const openingBalance = Number(dueAmount) || 0;

  const closingBalance =
    Number(openingBalance) +
    Number(outstanding?.BillingAmount ?? 0) -
    Number(outstanding?.ReceivedAmount ?? 0);

  const invoiceNetAmount = formData?.InvoiceNo
    ? Number(handleFindAll(formData?.InvoiceNo)) || 0
    : 0;

  const invoicePaidAmount = formData?.InvoiceNo
    ? Number(PendingandOutstandingAmt?.pending) || 0
    : 0;

  const invoiceBalance = Number(invoiceNetAmount) - Number(invoicePaidAmount);

  const totalTransactions = filteredAdvancePaymentDetail?.length || 0;
  const totalAmount = (filteredAdvancePaymentDetail || []).reduce(
    (sum, item) => sum + (parseFloat(item.ReceivedAmt) || 0),
    0,
  );

  const getRateType = (value) => {
    axiosInstance
      .post("Centre/BindRateTypeWorkOrderSearch", {
        // TypeId: value?.toString(),
        centreID: 0
      })
      .then((res) => {
        let data = res.data.message;
        let CentreDataValue = data.map((ele) => {
          return {
            value: String(ele.RateTypeID),
            label: ele.RateTypeName,
            name: ele.RateTypeName,
            AgainstInvoice: ele.AgainstInvoice,
            CentreType: ele.CentreType
          };
        });

        setCentreData(CentreDataValue);
      })
      .catch((err) => {
        setCentreData([]);
        console.log(err);
      });
  };

  const handleSelectchangeCheck = (name, value) => {
    console.log(value, "teting");
    const selectedDeposit = dropdownList?.depositeList?.find(
      (item) => item.value === value?.value,
    );

    setFormData((prev) => ({
      ...prev,
      [name]: value?.value,
      AllowTDSDateRangeCalender:
        selectedDeposit?.AllowTDSDateRangeCalender === 1 ? "1" : "0",
    }));
  };

  const getDepositeTypes = async () => {
    await axiosInstance
      .get("Accounts/BindDepositeType")
      .then((res) => {
        const formattedDeposites = res?.data?.message?.map((item) => ({
          ...item,
          label: item.DepositeTypeName,
          value: String(item.DepositeTypeID),
        }));

        setDropdownList((prev) => ({
          ...prev,
          depositeList: formattedDeposites,
        }));
      })
      .catch((err) => console.log(err));
  };

  const [value, setValue] = useState("");
  const [items, setItems] = useState([]);
  const [labelSlide, setLabelSlide] = useState(false);

  const isPaymentModeRequired = dropdownList?.depositeList?.find((items) => {
    return items?.value == formData?.CreditNote;
  });

  // Filter payment mode list based on HideNonCash flag & user (M-Pesa only for SessionRateTypeID)
  const isMpesaOnly =
    userData?.SessionRateTypeID !== 0 &&
    userData?.RateCentreType === "Franchise";

  // Filter deposite list based on HideNonDeposit flag (only "deposit" when M-Pesa only)
  const filteredDepositeList = (HideNonDeposit === 1 || isMpesaOnly)
    ? dropdownList?.depositeList?.filter(
      (item) => item?.DepositeTypeName?.toLowerCase() === "deposit" || item?.label?.toLowerCase() === "deposite" || item?.DepositeTypeName?.toLowerCase() === "deposit" || item?.label?.toLowerCase() === "deposit"
    )
    : dropdownList?.depositeList;

  const filteredPaymentMode = isMpesaOnly
    ? PaymentMode?.filter(
      (item) => item?.label?.toLowerCase() === "m-pesa"
    )
    : HideNonCash === 1
      ? PaymentMode?.filter(
        (item) => item?.label?.toLowerCase() === "cash"
      )
      : PaymentMode;

  console.log(userData, "userData")

  useEffect(() => {
    if (HideNonCash === 1 && filteredPaymentMode?.length === 1) {
      setFormData(prev => {
        if (prev.paymentModeID !== filteredPaymentMode[0].value) {
          return {
            ...prev,
            paymentModeID: filteredPaymentMode[0].value,
            PaymentMode: filteredPaymentMode[0].label
          };
        }
        return prev;
      });
    }
  }, [filteredPaymentMode, HideNonCash]);

  useEffect(() => {
    if ((HideNonDeposit === 1 || isMpesaOnly) && filteredDepositeList?.length === 1) {
      setFormData(prev => {
        if (prev.CreditNote !== filteredDepositeList[0].value) {
          return {
            ...prev,
            CreditNote: filteredDepositeList[0].value
          };
        }
        return prev;
      });
    }
  }, [filteredDepositeList, HideNonDeposit, isMpesaOnly]);

  const search = (event) => {
    const query = event.query?.toLowerCase() || "";
    const filtered = CentreData?.filter((item) =>
      item.label?.toLowerCase().includes(query),
    );
    setItems(filtered || []);
  };

  useEffect(() => {
    getDepositeTypes();
    getRateType("");
  }, []);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  // Indian number format function
  const formatIndianNumber = (num) => {
    const number = Number(num);
    if (isNaN(number)) return "0.00";
    return number.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Frontend pagination logic
  const currentTableData = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * pageSize;
    const lastPageIndex = firstPageIndex + pageSize;
    return filteredAdvancePaymentDetail.slice(firstPageIndex, lastPageIndex);
  }, [currentPage, pageSize, filteredAdvancePaymentDetail]);

  return (
    <>
      {show?.modalShow && (
        <AdvancePaymentCancelModal
          show={show}
          handleChange={handleChangeNew}
          onhide={handleHide}
          handleCancel={handleCancel}
        />
      )}

      {CreditModalShow && (
        <AdvancePaymentCreditModal
          onhandleClose={close}
          CreditModalShow={CreditModalShow}
          setCreditModalShow={setCreditModalShow}
        />
      )}
      {isRazorPayOpen && (
        <RazorPay
          AnotherPageCommonFunction={saveData}
          IsOpen={isRazorPayOpen}
          payload={{
            ...formData,
            amount: formData?.InvoiceAmount,
            currency: "INR",
            tnx_type: "Client",
            receipt: paymenyId?.receipt,
            key_id: paymenyId?.key_id,
            key_secret: paymenyId?.key_secret,
          }}
          setIsRazorPayOpen={setIsRazorPayOpen}
        />
      )}
      {showMpesa && (
        <MpesaModal
          show={showMpesa}
          onHide={() => setShowMpesa(false)}
          amount={formData?.InvoiceAmount}
          Id={mpesaId}
          centerId={defaultCenter}
          centername={CenterName}
          mobile={""}
          countryMobLength={DefaultCurrencyName}
          Name={selectRateType?.label}
          onPaymentSuccess={(receiptNo) => {
            setFormData((prev) => ({
              ...prev,
              TransactionId: receiptNo,
            }));
            setShowMpesa(false);
          }}
        />
      )}
      <div className="border background_clr">
        <Accordion
          className={"bg_remove"}
          name={t("Advance Payment")}
          isBreadcrumb={true}
          defaultValue={true}
          linkTo="/AdvancePayment"
          seconTitle={
            <div
              className="d-flex flex-wrap align-items-center justify-content-end"
              style={{ gap: "1rem", fontSize: "0.875rem" }}
            >
              <div>
                <strong>{t("Opening Balance")}:&nbsp;</strong>
                <span style={{ fontWeight: "600" }}>
                  {formatCurrency(formatIndianNumber(openingBalance))}
                </span>
              </div>
              |
              <div>
                <strong>{t("Billing")}:&nbsp;</strong>
                <span style={{ fontWeight: "600" }}>
                  {formatCurrency(formatIndianNumber(outstanding?.BillingAmount ?? 0))}
                </span>
              </div>
              |
              <div>
                <strong>{t("Received")}:&nbsp;</strong>
                <span className="text-success" style={{ fontWeight: "600" }}>
                  {formatCurrency(formatIndianNumber(outstanding?.ReceivedAmount ?? 0))}
                </span>
              </div>
              |
              <div>
                <strong>{t("Closing Balance")}:&nbsp;</strong>
                <span className="text-danger" style={{ fontWeight: "600" }}>
                  {formatCurrency(formatIndianNumber(closingBalance))}
                </span>
              </div>
              |
              {(!formData?.InvoiceNo || OldInvoiceDropDown.length <= 1) && (
                <div>
                  <strong>{t("Total Outstanding")}:&nbsp;</strong>
                  <span className="text-danger" style={{ fontWeight: "600" }}>
                    {formatCurrency(formatIndianNumber(outstanding?.OutstandingAmount ?? 0))}
                  </span>
                </div>
              )}
            </div>
          }
        >
          <div className="row px-2 mt-2 mb-1">
            <div className="col-sm-2">
              <span className="p-float-label custom-float-label">
                <AutoComplete
                  id="rateType"
                  value={selectRateType}
                  suggestions={items}
                  completeMethod={search}
                  field="label"
                  onChange={handleAutoCompleteChange}
                  onSelect={handleAutoCompleteSelect}
                  placeholder=""
                  forceSelection
                  className="w-100 p-inputtext-sm"
                  onFocus={() => setLabelSlide(true)}
                  onBlur={() => setLabelSlide(false)}
                />
                <label
                  className={`rateTypeFloatlabel ${!selectRateType?.value && !labelSlide ? "floatEmpty" : ""
                    }`}
                  htmlFor="rateType"
                >
                  {t("Rate Type")}
                </label>
              </span>

              {formData?.RateTypeID === "" && (
                <span className="error-message">{err?.RateTypeID}</span>
              )}
            </div>

            <div className="col-sm-2">
              <DatePicker
                className="custom-calendar"
                placeholder=" "
                id="ReceivedDate"
                lable={t("Received Date")}
                name="AdvanceAmtDate"
                value={formData?.AdvanceAmtDate}
                onChange={dateSelect}
                maxDate={new Date()}
              />
            </div>
            <div className="col-sm-2  ">
              <ReactSelect
                dynamicOptions={filteredDepositeList}
                name="CreditNote"
                id="CreditNote"
                placeholderName={t("Deposit Type")}
                value={formData?.CreditNote}
                onChange={handleSelectchangeCheck}
                lable={t("Deposit Type")}
                removeIsClearable={true}
              />
            </div>
            {OldInvoiceDropDown.length > 1 &&
              (
                DefaultCurrencyName !== "KES" ||
                formData?.CreditNote === "2" ||
                formData?.CreditNote === "5"
              ) && (
                <div className="col-sm-2">
                  <SelectBox
                    options={OldInvoiceDropDown}
                    name="InvoiceNo"
                    lable="Invoice Number"
                    id="Invoice Number"
                    selectedValue={formData?.InvoiceNo}
                    onChange={handleSelectChange}
                    className={"input-sm"}
                  />
                </div>
              )}
            {/* {AgainstInvoice === 2 && formData?.CreditNote === "2" && (
              <div className="col-sm-2  ">
                <ReactSelect
                  dynamicOptions={creditNoteReceiptNoList}
                  name="CreditNoteReceiptNo"
                  id="CreditNoteReceiptNo"
                  placeholderName={t("Credit Note Receipt No")}
                  value={formData?.CreditNoteReceiptNo}
                  onChange={handleSelectchangeCheck}
                  lable={t("Credit Note Receipt No")}
                />
              </div>
            )} */}
          </div>

          <div style={{ gap: "4px" }} className="d-flex align-items-center">
            <hr className="flex-grow-1" />
            <span>Payment Detail</span>
            <hr className="flex-grow-1" />
          </div>

          {/* Show Invoice Details when Invoice is selected */}
          {formData?.InvoiceNo && OldInvoiceDropDown.length > 1 && (
            <div className="row px-2 mb-2">
              <LabeledInput
                className="col-sm-2"
                label={t("Net Amount")}
                value={formatIndianNumber(invoiceNetAmount)}
              />
              <LabeledInput
                className="col-sm-2"
                label={t("Paid")}
                value={formatIndianNumber(invoicePaidAmount)}
              />
              <LabeledInput
                className="col-sm-2"
                label={t("Balance")}
                value={formatIndianNumber(invoiceBalance)}
              />
            </div>
          )}

          <div className="row  px-2 mt-2 mb-1">
            {formData?.AllowTDSDateRangeCalender === "1" && (
              <>
                <div className="col-sm-2">
                  <DatePicker
                    className="custom-calendar"
                    placeholder=" "
                    id="tdsFromDate"
                    lable={t("TDS From Date")}
                    name="tdsFromDate"
                    value={formData?.tdsFromDate}
                    onChange={dateSelect}
                    maxDate={new Date()}
                  />
                </div>
                <div className="col-sm-2">
                  <DatePicker
                    className="custom-calendar"
                    placeholder=" "
                    id="tdsToDate"
                    lable={t("TDS To Date")}
                    name="tdsToDate"
                    value={formData?.tdsToDate}
                    onChange={dateSelect}
                    maxDate={new Date()}
                  />
                </div>
              </>
            )}
            {isPaymentModeRequired?.PaymentModeRequired == 1 && (
              <div
                className={`col-sm-2 ${["2", "3"]?.includes(formData?.CreditNote) ? "d-none" : "d-block"}`}
              >
                <SelectBox
                  // options={HideNonCash === 1 ? filteredPaymentMode : [{ label: "Select Payment Mode" }, ...filteredPaymentMode]}
                  options={[...(HideNonCash === 1 ? filteredPaymentMode : [{ label: "Select Payment Mode" }, ...filteredPaymentMode]),].filter((item) => item?.label?.toLowerCase() !== "credit")}
                  onChange={handleSelectChange}
                  name="paymentModeID"
                  lable="Payment Mode"
                  id="Payment Mode"
                  className="required-fields"
                  selectedValue={formData?.paymentModeID}
                />
              </div>
            )}
            <div className="col-md-2 col-6">
              <Input
                className="required w-100"
                type="text"
                name="InvoiceAmount"
                onInput={(e) => number(e, 7)}
                value={formData?.InvoiceAmount}
                onChange={handleChange}
                lable={"Amount"}
              />
            </div>

            {formData?.PaymentMode != "Online Payment" && (
              <>
                {formData?.CreditNote == 1 &&
                  !["Online Payment", "Cash"]?.includes(
                    formData?.PaymentMode,
                  ) && (
                    <div
                      className={`col-sm-2 ${["2", "3"]?.includes(formData?.CreditNote) && "d-none"}`}
                    >
                      <Input
                        name="TransactionId"
                        id="TransactionID"
                        lable="TransactionID"
                        placeholder=" "
                        type="text"
                        className="required-fields"
                        disabled={(isMpesaOnly && pathcareValidation) ||
                          formData?.PaymentMode == "Online Payment" ||
                          formData?.PaymentMode == "Cash"
                          ? true
                          : false
                        }
                        value={formData?.TransactionId}
                        onChange={handleChange}
                      />
                    </div>
                  )}
              </>
            )}



            <div className={`col-sm-2`}>
              <Input
                type="text"
                id="Remarks"
                lable="Remarks"
                placeholder=" "
                name="Remarks"
                value={formData?.Remarks}
                onChange={handleChange}
              />
            </div>
            {isMpesaOnly
              //  && !formData?.TransactionId
              && (

                <CustomButton
                  disabled={!formData?.InvoiceAmount || formData?.InvoiceAmount == 0}
                  onClick={() => {
                    setMpesaId(guidNumber());
                    setShowMpesa(true);
                  }}
                  icon={""}
                  text={t("Make Payment")}
                />

              )}
          </div>

          <div className="row g-3 align-items-center px-2">
            {["Cheque"].includes(formData?.PaymentMode) && (
              <div className="col-md-3 col-6">
                <Input
                  className="required w-100"
                  lable={t("Cheque No.")}
                  type="number"
                  onInput={(e) => number(e, 16)}
                  name="ChequeNo"
                  value={formData?.ChequeNo}
                  onChange={handleChange}
                />
              </div>
            )}

            {["Credit Card", "Debit Card"].includes(formData?.PaymentMode) && (
              <div className="col-md-2 col-6">
                <Input
                  className="required w-100"
                  type="number"
                  onInput={(e) => number(e, 16)}
                  name="CreditCardNo"
                  value={formData?.CreditCardNo}
                  onChange={handleChange}
                  lable={t("Cheque/Card No.")}
                />
              </div>
            )}

            {["Cheque", "Credit Card", "Debit Card"].includes(
              formData?.PaymentMode,
            ) && (
                <>
                  <div className="col-md-2 col-6">
                    <DatePicker
                      name="ChequeDate"
                      value={formData?.ChequeDate}
                      onChange={dateSelect}
                      maxDate={new Date()}
                      placeholder={""}
                      lable={t("Cheque/Card Date")}
                      className={"w-100"}
                    />
                  </div>

                  <div className="col-md-2 col-6">
                    <SelectBox
                      name="BankName"
                      options={[{ value: "", label: "Select Bank", }, ...BankName,]}
                      selectedValue={formData?.BankName}
                      onChange={handleChange}
                      lable={t("Bank Name")}
                    />
                  </div>
                </>
              )}
          </div>

          <div>
            {loadingSecond ? (
              <Loading />
            ) : (
              <>
                <div className="row mt-2 mb-1 px-1">
                  <div className="col-sm-1">
                    <button
                      className="btn btn-block btn-success btn-sm rounded"
                      onClick={() => handleSave()}
                    >
                      {t("Save")}
                    </button>
                  </div>

                  <div style={{ gap: "8px" }} className="d-flex">
                    <img
                      className="pointer-cursor"
                      title="Excel (Cancel Entry)"
                      width={26}
                      height={24}
                      onClick={() => AdvancePaymentDetail1("download", "1")}
                      src={redExcel}
                      alt=""
                    />
                    <img
                      className="pointer-cursor"
                      title="Excel (Active Entry)"
                      width={24}
                      height={24}
                      onClick={() => AdvancePaymentDetail1("download", "0")}
                      src={ExcelActiveIcon}
                      alt=""
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </Accordion>
      </div>
      {(AdvancePaymentDetail || []).length > 0 && (
        <Accordion
          title={
            <div
              style={{
                display: "flex",
                width: "100%",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                padding: "0rem 0.5rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <span style={{ fontWeight: "bold", marginRight: "1rem" }}>
                  {t("Previous Advance Amount")}
                </span>

                <div style={{ display: "flex", flexWrap: "wrap" }}>
                  {[
                    ...depositeColors,
                    { color: "#FFA500", label: t("CN") },
                    { color: "#1E90FF", label: t("DN") },
                    { color: "#FF69B4", label: t("TDS") },
                    { color: "#FFD700", label: t("Others") },
                    { color: "#9370DB", label: t("Cash") },
                    { color: "#20B2AA", label: t("Non-Cash") },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginRight: "1rem",
                        marginBottom: "0.25rem",
                      }}
                    >
                      <button
                        className="statusConfirmed"
                        style={{
                          backgroundColor: item.color,
                          width: "14px",
                          height: "14px",
                          cursor: "pointer",
                          border: "none",
                          borderRadius: "2px",
                        }}
                        onClick={() => handlePaymentModeFilter(item.label)}
                      />
                      <label
                        style={{
                          marginLeft: "0.25rem",
                          cursor: "pointer",
                          marginBottom: 0,
                        }}
                        onClick={() => handlePaymentModeFilter(item.label)}
                      >
                        {item.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          }
          defaultValue={true}
          linkTo="/AdvancePayment"
          linkTitle={
            <div className="d-flex justify-content-end py-2 pr-2" id="pr_id_11">
              <div className="mr-4">
                <strong>{t("Total Transaction")}:&nbsp; </strong>{" "}
                <span className="text-danger" style={{ fontWeight: "bold" }}>
                  {totalTransactions.toLocaleString("en-IN")}
                </span>
              </div>
              <div>
                <strong>{t("Total Amount")}:&nbsp; </strong>{" "}
                <span className="text-danger" style={{ fontWeight: "bold" }}>
                  {formatCurrency(formatIndianNumber(totalAmount))}
                </span>
              </div>
            </div>
          }
        >
          <>
            {(filteredAdvancePaymentDetail || []).length > 0 ? (
              <Tables>
                <thead className="cf">
                  <tr>
                    <th style={{ paddingLeft: "6px" }} rowSpan="2">
                      {t("S.No")}
                    </th>
                    <th rowSpan="2">{t("Rate Type Code")}</th>
                    <th rowSpan="2">{t("Rate Type")}</th>
                    <th rowSpan="2">{t("Deposite Type")}</th>
                    <th rowSpan="2">{t("ReceivedAmt")}</th>
                    <th rowSpan="2">{t("PaymentMode")}</th>
                    <th rowSpan="2">{t("Invoice No")}</th>
                    <th rowSpan="2">{t("Received Date")}</th>
                    <th rowSpan="2">{t("Entry Details")}</th>
                    <th rowSpan="2">{t("Remarks / TDS Dates")}</th>
                    {pathcareValidation && (
                      <th rowSpan="2">{t("Validate")}</th>
                    )}
                    {canCancelAdvance && <th rowSpan="2">{t("Cancel")}</th>}
                    <th rowSpan="2">{t("Print")}</th>
                  </tr>
                </thead>
                <tbody>
                  {currentTableData?.map((data, index) => {
                    const serialNumber =
                      (currentPage - 1) * pageSize + index + 1;

                    // ✅ FIX 1: Column-specific colors compute karo
                    const depositeTypeColor = getDepositeTypeColor(data?.Type);
                    const paymentModeColor = getPaymentModeColor(
                      data?.PaymentMode,
                    );

                    return (
                      // ✅ FIX 1: Row ka background color HATAYA — plain white/default row
                      <tr key={index}>
                        <td className="px-2" data-title={t("S.No")}>
                          <div>{serialNumber}</div>
                        </td>
                        <td data-title={t("Rate Type Code")}>
                          {data?.ClientCode}&nbsp;
                        </td>
                        <td data-title={t("Rate Type")}>
                          {data?.ClientName}&nbsp;
                        </td>

                        <td data-title={t("Deposite Type")}>
                          {depositeTypeColor ? (
                            <span
                              style={{
                                backgroundColor: depositeTypeColor.bg,
                                color: depositeTypeColor.text,
                                padding: "2px 10px",
                                borderRadius: "12px",
                                fontWeight: "600",
                                fontSize: "0.8rem",
                                display: "inline-block",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {data?.Type}
                            </span>
                          ) : (
                            <span>{data?.Type || "\u00a0"}</span>
                          )}
                        </td>

                        <td data-title={t("ReceivedAmt")}>
                          {formatCurrency(formatIndianNumber(data?.ReceivedAmt))}&nbsp;
                        </td>

                        <td data-title={t("PaymentMode")}>
                          {paymentModeColor ? (
                            <span
                              style={{
                                backgroundColor: paymentModeColor.bg,
                                color: paymentModeColor.text,
                                padding: "2px 10px",
                                borderRadius: "12px",
                                fontWeight: "600",
                                fontSize: "0.8rem",
                                display: "inline-block",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {data?.PaymentMode}
                            </span>
                          ) : (
                            <span>{data?.PaymentMode || "\u00a0"}</span>
                          )}
                        </td>

                        <td data-title={t("Invoice No")}>
                          {data?.ReceiptNo}&nbsp;
                        </td>
                        <td data-title={t("Received Date")}>
                          {dateConfig(data.AdvanceAmtDate, 0)}
                        </td>
                        <td data-title={t("Entry Details")}>
                          <div>
                            <strong>Entry By:</strong> {data.ValidateBy || data.CreatedBy || "-"}
                          </div>
                          <div>
                            <strong>Entry Date:</strong>{" "}
                            {data.ValidateBy
                              ? dateConfig(data.ValidateDate, 0) || "-"
                              : dateConfig(data.CreatedDate, 0) || "-"}
                          </div>
                        </td>
                        <td
                          data-title={t("Remarks / TDS Dates")}
                          style={{ whiteSpace: "normal", wordBreak: "break-word", maxWidth: "360px" }}
                        >
                          <div
                            style={{
                              whiteSpace: "normal",
                              wordBreak: "break-word",
                              overflowWrap: "break-word",
                              lineHeight: 1.4,
                            }}
                          >
                            <span
                              style={{
                                cursor: data?.Remarks ? "pointer" : "default",
                                display: "inline-block",
                                whiteSpace: "pre-wrap",
                                wordBreak: "break-word",
                                overflowWrap: "break-word",
                                maxWidth: "100%",
                              }}
                            // onClick={() => {
                            //   if (data?.Remarks) {
                            //     navigator.clipboard?.writeText(data?.Remarks);
                            //     toast.success("Remarks copied");
                            //   }
                            // }}
                            >
                              {data?.Remarks || "-"}
                            </span>
                          </div>

                          {isValidDate(data?.TDSFromDate) &&
                            isValidDate(data?.TDSToDate) && (
                              <>
                                <br />
                                <div>
                                  <strong>TDS From:</strong>{" "}
                                  {dateConfig(data.TDSFromDate, 0)}
                                </div>

                                <div>
                                  <strong>TDS To:</strong>{" "}
                                  {dateConfig(data.TDSToDate, 0)}
                                </div>
                              </>
                            )}
                        </td>
                        {hasAccess36 && pathcareValidation && (
                          <td data-title={t("Validate")} className="p-2">
                            {Number(data?.ValidateStatus) !== 1 ? (
                              <button
                                type="button"
                                className="btn btn-block btn-success btn-sm rounded"
                                onClick={() => {
                                  handleValidateRow(data);
                                }}
                                title={t("Validate")}
                              >
                                {t("Validate")}
                              </button>
                            ) : (
                              <span
                                style={{
                                  color: "green",
                                  fontWeight: "600",
                                  fontSize: "0.8rem",
                                }}
                              >
                                {t("")}
                              </span>
                            )}
                          </td>
                        )}
                        {canCancelAdvance && (
                          <td data-title={t("Cancel")}>
                            {pathcareValidation ? (
                              Number(data?.ValidateStatus) !== 1 ? (
                                <i
                                  onClick={() => {
                                    setShow({
                                      id: data?.ID,
                                      receiptNo: data?.ReceiptNo,
                                      validateStatus: data?.ValidateStatus,
                                      modalShow: true,
                                      cancelReason: "",
                                    });
                                  }}
                                  className="bi bi-x-circle-fill mb-0 c_red text-red m-2"
                                  style={{ cursor: "pointer" }}
                                ></i>
                              ) : (
                                <span>{"\u00a0"}</span>
                              )
                            ) : (
                              <i
                                onClick={() => {
                                  setShow({
                                    id: data?.ID,
                                    receiptNo: data?.ReceiptNo,
                                    validateStatus: data?.ValidateStatus,
                                    modalShow: true,
                                    cancelReason: "",
                                  });
                                }}
                                className="bi bi-x-circle-fill mb-0 c_red text-red m-2"
                                style={{ cursor: "pointer" }}
                              ></i>
                            )}
                          </td>
                        )}
                        <td data-title={t("Print")}>
                          {data?.ReceiptNo ? (
                            <span
                              onClick={(e) =>
                                loadingPrintId !== data?.ID &&
                                handlePDF(e, data?.ReceiptNo, data?.ID)
                              }
                              style={{
                                cursor:
                                  loadingPrintId === data?.ID
                                    ? "not-allowed"
                                    : "pointer",
                              }}
                            >
                              {loadingPrintId === data?.ID ? (
                                <span
                                  className="spinner-border spinner-border-sm text-secondary"
                                  role="status"
                                  style={{ width: "14px", height: "14px" }}
                                />
                              ) : (
                                <i
                                  className="fa fa-print iconStyle px-2 fontSizeIcon ahddh_black"
                                  style={{
                                    cursor: "pointer",
                                    textAlign: "center",
                                  }}
                                  title="Print"
                                />
                              )}
                            </span>
                          ) : (
                            <span>Not Ready</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Tables>
            ) : (
              <NoRecordFound />
            )}
            {filteredAdvancePaymentDetail.length > 0 && (
              <div className="d-flex flex-wrap justify-content-end align-items-end gap-2">
                <div style={{ minWidth: "150px" }}>
                  <ReactSelect
                    value={pageSize}
                    dynamicOptions={[
                      { label: "25", value: 25 },
                      { label: "50", value: 50 },
                      { label: "100", value: 100 },
                      { label: "150", value: 150 },
                    ]}
                    name={"pageSize"}
                    label={t("pageSize")}
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
                  totalCount={filteredAdvancePaymentDetail.length}
                  pageSize={pageSize}
                  onPageChange={(page) => {
                    setCurrentPage(page);
                  }}
                />
              </div>
            )}
          </>
        </Accordion>
      )}
    </>
  );
}

export default AdvancePayment;
