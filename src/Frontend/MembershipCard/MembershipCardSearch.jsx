import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { axiosInstance, axiosReport } from "../../utils/axiosInstance";
import moment from "moment";
import { toast } from "react-toastify";
import { autocompleteOnBlur, getTrimmedData, number } from "../../utils/helpers";
import AutoComplete from "../../components/formComponent/AutoComplete";
import Accordion from "@app/components/UI/Accordion";
import DatePicker from "../../components/formComponent/DatePicker";
import Input from "../../components/formComponent/Input";
import { SelectBox } from "../../components/formComponent/SelectBox";
import Loading from "../../components/loader/Loading";
import Tables from "../../components/UI/customTable";
import DependentMemberDetailModal from "../utils/DependentMemberDetailModal";
import TestDetailViewModal from "../utils/TestDetailViewModal";
import DeptModal from "../utils/DeptModal";
import Form from "react-bootstrap/Form";
import ReactSelect from "../../components/formComponent/ReactSelect";
import {
  BindEmployeeReports,
  getAccessCentres,
  getAccessDataRate,
} from "../../utils/NetworkApi/commonApi";
import { MdOutlineAutorenew } from "react-icons/md";
import { Color } from "../../utils/Constants";
import Modal from "../../components/ModalComponent/Modal";
import FilterInput from "../../components/Filter/FilterInput";
import Heading from "../../components/UI/Heading";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import {
  CustomButton,
  SaveButton,
  SearchButton,
} from "../../components/UI/CustomButton";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";

const MembershipCardSearch = () => {
  const { t } = useTranslation();
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cardloading, setCardLoading] = useState({ loading: false, id: "" });
  const [details, setDetails] = useState({ no: "", id: "" });
  const [user, Setuser] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [masterTable, setMasterTable] = useState([]);
  const handleClosedep = () => setShowdep(false);
  const [showdep, setShowdep] = useState(false);
  const userData = useLocalStorage("userData", "get");
  const DefaultCurrencyName = userData?.DefaultCurrencyName;
  const DefaultCentre = useLocalStorage("DefaultCentre", "get");
  const [Cards, setCards] = useState([]);
  const [MemberDetailsModal, setMemberDetailsModal] = useState(false);
  const [MemberShipCardData, setMemberShipCardData] = useState(false);
  const [TestViewModal, setTestViewModal] = useState(false);
  const [payload, setPayload] = useState({
    FromDate: new Date(),
    ToDate: new Date(),
    Cardtype: "",
    Value: "",
    SearchType: "Cardno",
    CentreID: userData?.DefaultCentre,
    User: 0,
    OnlyExpired: "0",
  });
  const [rateOptions, setRateOptions] = useState([]);
  const [errors, setErrors] = useState({});
  const [centreOptions, setCentreOptions] = useState([]);
  const [selectedCentre, setSelectedCentre] = useState(null);
  const [selectedRate, setSelectedRate] = useState(null);
  const [renewalModal, setRenewalModal] = useState(false);
  const [renewalData, setRenewalData] = useState({});
  const [cardOptions, setCardOptions] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [paymentOptions, setPaymentOptions] = useState([]);
  const [selectedPaymentMode, setSelectedPaymentMode] = useState("Cash");
  const [paymentDetails, setPaymentDetails] = useState({
    currency: userData?.DefaultCurrencyName,
    rcdata: [
      {
        PaymentMode: "Cash",
        Amount: "",
        S_Currency: userData?.DefaultCurrency,
        Currency_RoundOff: "",
        CardNo: "",
        CardDate: new Date(),
        BankName: "",
      },
    ],
    cardAmt: 0,
    paidAmount: 0,
    balanceAmount: 0,
  });

  // NEW: Export loading state for PDF and Excel
  const [exportLoading, setExportLoading] = useState({
    pdf: false,
    excel: false,
  });

  const [MembershipID, setMembershipID] = useState("");
  const Navigate = useNavigate();

  const [employeeLabel, setEmployeeLabel] = useState("");
  const [employeeSuggestions, setEmployeeSuggestions] = useState([]);
  const [employeeIndex, setEmployeeIndex] = useState(0);
  const [selectEmployee, setSelectEmployee] = useState(false);

  const [renewLoading, setRenewLoading] = useState(false);

  const handleShowdep = () => setShowdep(true);

  const handleChange = (e) => {
    const { value, name } = e.target;
    setPayload({ ...payload, [name]: value });
  };

  const dateSelect = (date, name) => {
    setPayload({ ...payload, [name]: date });
  };

  const getPaymentOptions = () => {
    axiosInstance
      .post("Global/getGlobalData", { Type: "PaymentMode" })
      .then((res) => {
        let data = res.data.message;
        let value = data.map((ele) => {
          return {
            value: ele.FieldID,
            label: ele.FieldDisplay,
          };
        });
        setPaymentOptions(value);
        const cashOpt = value.find((opt) => opt.label === "Cash");
        if (cashOpt) {
          setSelectedPaymentMode(cashOpt.value);
          setPaymentDetails((prev) => ({
            ...prev,
            rcdata: prev.rcdata.map((row, i) =>
              i === 0 ? { ...row, PaymentMode: cashOpt.label } : row
            ),
          }));
        }
      });
  };
  const handleChangeSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(e.target.value);

    if (!value) {
      setTableData(masterTable);
      return;
    }

    const searchableKeys = ["cardno", "validfrom", "mobile", "name", "ValidTo"];
    const filtered = masterTable?.filter((row) =>
      searchableKeys.some((key) =>
        String(row[key] || "")
          .toLowerCase()
          .includes(value),
      ),
    );

    setTableData(filtered);
  };

  const getCardType = () => {
    axiosInstance
      .get(`MembershipCardMaster/BindMembership`)
      .then((res) => {
        let data = res.data.message;
        let cardData = data.map((ele) => ({ value: ele.Id, label: ele.Name }));
        cardData.unshift({ label: "Select", value: "" });
        setCards(cardData);
      })
      .catch((err) => console.log(err));
  };

  // NEW: Common payload builder — accepts optional ReportFormat
  const getSearchPayload = (reportFormat = "") =>
    getTrimmedData({
      ...payload,
      FromDate: moment(payload?.FromDate).format("YYYY-MM-DD"),
      ToDate: moment(payload?.ToDate).format("YYYY-MM-DD"),
      Cardtype: payload?.Cardtype,
      Value: payload?.Value,
      SearchType: payload?.SearchType,
      CentreID: payload?.CentreID,
      OnlyExpired: payload?.OnlyExpired,
      ReportFormat: reportFormat,
    });

  // Search — fetches JSON data for table
  const getSearchCard = () => {
    setLoading(true);
    console.log("getsearchpayload", payload?.SearchType)
    axiosInstance
      .post("MembershipCardMaster/SearchCardData", getSearchPayload())
      .then((res) => {
        if (res.data?.success && res.data?.message?.length > 0) {
          setTableData(res.data.message);
          setMasterTable(res.data.message);
          toast.success(res?.data?.message);
        } else {
          toast.error(res?.data?.message || "No Records found");
          setTableData([]);
          setMasterTable([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        setTableData([]);
        setMasterTable([]);
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "No Records found",
        );
        setLoading(false);
      });
  };

  const downloadReport = async (format) => {
    if (tableData.length === 0) {
      toast.error("Record Not Found to download");
      return;
    }

    const key = format === "Pdf" ? "pdf" : "excel";
    setExportLoading((prev) => ({ ...prev, [key]: true }));

    try {
      const mimeType =
        format === "Pdf"
          ? "application/pdf"
          : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      const extension = format === "Pdf" ? "pdf" : "xlsx";

      const res = await axiosInstance.post(
        "MembershipCardMaster/SearchCardData",
        getSearchPayload(format),
        { responseType: "blob" },
      );

      if (res?.status === 200) {
        const url = window.URL.createObjectURL(
          new Blob([res.data], { type: mimeType }),
        );
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          `MembershipCard_${moment().format("DDMMYYYY_HHmmss")}.${extension}`,
        );
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        toast.success(`${format} downloaded successfully`);
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message || `Error downloading ${format}`,
      );
    } finally {
      setExportLoading((prev) => ({ ...prev, [key]: false }));
    }
  };

  const getCardList = async () => {
    try {
      const res = await axiosInstance.get("MembershipCardIssue/GetCard");
      if (res?.data?.message) {
        const options = res.data.message.map((card) => ({
          value: card.id,
          label: card.cardname,
          Amount: card.Amount,
          validity: card.validity || "1 Year",
          subCategoryID: card.subCategoryID || "",
          ...card,
        }));
        setCardOptions(options);
      }
    } catch (error) {
      console.error("Error fetching card list:", error);
    }
  };

  const handleCardChange = (name, e) => {
    setSelectedCard(e.value);
    const selectedCardAmount =
      cardOptions.find((item) => item.value === e.value)?.RenewalAmount || 0;
    setPaymentDetails((prev) => ({
      ...prev,
      cardAmt: selectedCardAmount,
      balanceAmount: selectedCardAmount,
      rcdata: prev.rcdata.map((item) => ({
        ...item,
        Amount: selectedCardAmount > 0 ? selectedCardAmount.toString() : "",
      })),
    }));
  };

  useEffect(() => {
    getCardList();
    BindEmployeeReports(Setuser);
    getPaymentOptions()
  }, []);

 const getMemberCard = (id, index) => {
  setCardLoading({ loading: true, id: index });

  axiosReport
    .post(
      "commonReports/generateMemberShipCard",
      { CardNo: id },
      { responseType: "blob" }
    )
    .then((res) => {
      const pdfBlob = new Blob([res.data], {
        type: "application/pdf",
      });
      const pdfUrl = window.URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, "_blank");
      setCardLoading({ loading: false, id: "" });
    })
    .catch((err) => {
      toast.error(
        err?.response?.data?.message || "Failed to generate PDF"
      );
      setCardLoading({ loading: false, id: "" });
    });
};

  const parseBlobError = async (blob) => {
    try {
      const text = await blob.text();
      const json = JSON.parse(text);
      return json?.message || "Error Occurred";
    } catch {
      return "Error Occurred";
    }
  };

  const [loadingReceipt, setLoadingReceipt] = useState("");
  const getReceipt = async (id) => {
    try {
      setLoadingReceipt(id);
      const res = await axiosReport.post(
        "getReceipt",
        { LedgertransactionIDHash: id },
        { responseType: "blob" },
      );
      if (res?.status === 200) {
        const contentType = res.headers["content-type"] || "";
        if (!contentType.includes("application/pdf")) {
          const msg = await parseBlobError(res.data);
          toast.error(msg);
          return;
        }
        const url = window.URL.createObjectURL(
          new Blob([res.data], { type: "application/pdf" }),
        );
        window.open(url, "_blank");
      }
    } catch (err) {
      if (err?.response?.data instanceof Blob) {
        const msg = await parseBlobError(err.response.data);
        toast.error(msg);
        return;
      }
      toast.error(err?.response?.data?.message || "Error Occurred");
    } finally {
      setLoadingReceipt("");
    }
  };

  const [letterHeadLoading, setLetterHeadLoading] = useState(null);
  const getLetterHead = async (id) => {
    try {
      setLetterHeadLoading(id);
      const res = await axiosReport.post(
        "MemberShipCardDetail",
        { CardNo: id },
        { responseType: "blob" },
      );
      if (res?.status === 200) {
        const contentType = res.headers["content-type"] || "";
        if (!contentType.includes("application/pdf")) {
          const msg = await parseBlobError(res.data);
          toast.error(msg);
          return;
        }
        const url = window.URL.createObjectURL(
          new Blob([res.data], { type: "application/pdf" }),
        );
        window.open(url, "_blank");
      }
    } catch (err) {
      if (err?.response?.data instanceof Blob) {
        const msg = await parseBlobError(err.response.data);
        toast.error(msg);
        return;
      }
      toast.error(err?.response?.data?.message || "Error Occurred");
    } finally {
      setLetterHeadLoading(null);
    }
  };

  const handleEmployeeChange = (e) => {
    const value = e.target.value;
    setEmployeeLabel(value);
    if (value.trim() === "") {
      setSelectEmployee(false);
      setEmployeeSuggestions([]);
      setPayload((prev) => ({ ...prev, User: 0 }));
    } else {
      const filtered = user.filter((item) =>
        item.label.toLowerCase().includes(value.toLowerCase())
      );
      setEmployeeSuggestions(filtered);
      setSelectEmployee(true);
    }
  };

  const handleEmployeeKeyDown = (e) => {
    if (employeeSuggestions.length === 0) return;
    if (e.which === 38) {
      setEmployeeIndex((prev) =>
        prev > 0 ? prev - 1 : employeeSuggestions.length - 1
      );
    } else if (e.which === 40) {
      setEmployeeIndex((prev) =>
        prev === employeeSuggestions.length - 1 ? 0 : prev + 1
      );
    } else if (e.which === 13) {
      handleEmployeeSelect(employeeSuggestions[employeeIndex]);
      setEmployeeIndex(0);
    }
  };

  const handleEmployeeSelect = (data) => {
    setEmployeeLabel(data?.label || "");
    setPayload((prev) => ({ ...prev, User: data?.value || 0 }));
    setSelectEmployee(false);
    setEmployeeSuggestions([]);
  };

  const handleSelectChange = (name, value) => {
    setPayload((prev) => ({ ...prev, [name]: value?.value }));
  };
  const handleSelectType = (e) => {
    const { name, value } = e.target;
    setPayload((prev) => ({ ...prev, [name]: value }));
  };

  const User = localStorage.getItem("User") ? true : false;

  const handleCentreChange = (name, e) => {
    setSelectedCentre(e);
    setPayload((prev) => ({ ...prev, CentreID: e.value }));
    setSelectedRate(null);

    if (name === "CentreID") {
      getAccessDataRate(setRateOptions, e.value).then((res) => {
        if (res?.length > 0) setSelectedRate(res[0]);
      });
    } else {
      setRateOptions([]);
    }
  };

  const handleCashTable = (e, ele, ind) => {
    const { name, value } = e.target;
    const updatedItems = [...paymentDetails.rcdata];
    updatedItems[ind] = { ...updatedItems[ind], [name]: value };
    setPaymentDetails((prev) => ({ ...prev, rcdata: updatedItems }));
  };

  const getAmount = (type) => {
    const paidAmount = paymentDetails.rcdata.reduce(
      (sum, item) => sum + (Number(item.Amount) || 0),
      0,
    );
    if (type === "paid") return paidAmount;
    if (type === "balance") return paymentDetails.cardAmt - paidAmount;
    return 0;
  };

  const renewMembershipCard = () => {
    const selectedCardObj = cardOptions.find(
      (item) => item.value === selectedCard,
    );
    const renewalPayload = {
      cardNo: renewalData?.cardno || "",
      ltData: {
        discountOnTotal: renewalData?.DiscountOnTotal || 0,
        netAmount: paymentDetails.cardAmt,
        grossAmount: paymentDetails.cardAmt,
        isCredit: renewalData?.IsCredit || 0,
        doctor_ID: renewalData?.DoctorID?.toString() || "0",
        doctorName: renewalData?.DoctorName || "",
        patientType: "",
        adjustment: paymentDetails.cardAmt,
      },
      ploData: {
        barcodeNo: renewalData?.BarcodeNo || "",
        itemId: selectedCard?.toString() || "",
        itemName: selectedCardObj?.label || "",
        investigation_ID: renewalData?.InvestigationID?.toString() || "0",
        subCategoryID: selectedCardObj?.subCategoryID?.toString() || "",
        rate: paymentDetails.cardAmt,
        amount: paymentDetails.cardAmt,
        discountAmt: 0,
        quantity: 1,
        gender: renewalData?.gender || "",
        sampleTypeID: renewalData?.sampleTypeID?.toString() || "0",
        sampleTypeName: renewalData?.sampleTypeName || "",
        testCode: renewalData?.testCode || "",
        pccGrossAmt: renewalData?.pccGrossAmt || 0,
        pccDiscAmt: renewalData?.pccDiscAmt || 0,
        pccNetAmt: renewalData?.pccNetAmt || 0,
        pccInvoiceAmt: renewalData?.pccInvoiceAmt || 0,
        itemID_Interface: renewalData?.itemIDInterface || "",
        interface_companyName: renewalData?.interfacecompanyName || "",
        mrp: renewalData?.mrp || 0,
      },
      rcData: paymentDetails.rcdata.map((payment) => ({
        payBy: "Patient",
        paymentMode: payment.PaymentMode,
        paymentModeID: "",
        amount: Number(payment.Amount) || 0,
        bankName: payment.BankName || "",
        cardNo: payment.CardNo || "",
        cardDate: payment.CardDate
          ? moment(payment.CardDate).format("YYYY-MM-DD")
          : "",
        naration: "Membership Card Renewal",
        apolloOneWalletBalance: 0,
        apolloOneBalanceValue: 0,
        tidNumber: "",
        appointment_ID: 0,
        s_Amount: payment.Amount.toString(),
        s_CountryID: "1",
        s_Currency: payment.S_Currency || userData?.DefaultCurrencyName,
        s_Notation: "₹",
        c_Factor: "1",
        currency_RoundOff: payment.Currency_RoundOff || "",
        payTmMobile: "",
        payTmOtp: "",
        centreID: payload.CentreID || "0",
        panel_ID: "",
        currencyRoundDigit: "2",
        converson_ID: "1",
      })),
      cardId: selectedCard?.toString() || "",
      cardValidity: selectedCardObj?.validity || "1 Year",
      cardDependent: 0,
      cardType: selectedCard?.toString() || "",
      expiryDate: moment().add(1, "year").format("YYYY-MM-DD"),
      familymemberGroupId: renewalData?.FamilyMemberGroupID || "",
      membershipcardId: renewalData?.MembershipCardID || "",
      amount: paymentDetails.cardAmt,
      paid: getAmount("paid"),
    };
    setRenewLoading(true);
    axiosInstance
      .post("MembershipCardIssue/RenewMembershipCard", renewalPayload)
      .then((res) => {
        if (res.data.success) {
          toast.success(res?.data?.message || "Card renewed successfully");
          setRenewalModal(false);
          getSearchCard();
          setRenewLoading(false);
        } else {
          toast.error(res.data.message || "Error renewing card");
          setRenewLoading(false);
        }
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Error renewing card");
        console.error("Renewal error:", err);
        setRenewLoading(false);
      });
  };

  useEffect(() => {
    if (selectedCard) {
      const selectedCardAmount =
        cardOptions.find((item) => item.value === selectedCard)?.RenewalAmount || 0;
      setPaymentDetails((prev) => ({
        ...prev,
        cardAmt: selectedCardAmount,
        balanceAmount: selectedCardAmount,
      }));
    }
  }, [selectedCard, cardOptions]);

  const handleSaveRenewal = () => renewMembershipCard();

  const selectedCardAmount = [...cardOptions]?.find(
    (item) => item?.value == selectedCard,
  )?.RenewalAmount;

  useEffect(() => {
    getAccessCentres(setCentreOptions);
    getCardType();
  }, []);

  useEffect(() => {
    if (centreOptions.length === 0) return;
    const defaultCentre =
      centreOptions.find((c) => c.value == DefaultCentre) ||
      centreOptions[0];
    if (defaultCentre) {
      setSelectedCentre(defaultCentre);
      setPayload((prev) => ({ ...prev, CentreID: defaultCentre.value }));
      getAccessDataRate(setRateOptions, defaultCentre.value);
    }
  }, [centreOptions]);

  const allPrePrinted = tableData.length > 0 && tableData.every(r => r.CardGeneration === "Pre Printed");

  return (
    <>
      {MemberDetailsModal && (
        <DependentMemberDetailModal
          show={MemberDetailsModal}
          data={MemberShipCardData}
          onHide={() => setMemberDetailsModal(false)}
        />
      )}
      {TestViewModal && (
        <TestDetailViewModal
          show={TestViewModal}
          data={MemberShipCardData}
          onHide={() => setTestViewModal(false)}
        />
      )}
      {showdep && (
        <DeptModal
          show={showdep}
          handleClose={handleClosedep}
          DiscountData={{ CardNo: details?.no, CardID: details?.id }}
          url={"abc"}
          title={"membership"}
        />
      )}

      <Accordion
        name={t("Membership Card Search")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row pt-2 pl-2 pr-2 mt-1">
          <div className="col-sm-2">
            <div className="d-flex" style={{ display: "flex" }}>
              <div style={{ width: "50%" }}>
                <SelectBox
                  options={[
                    { label: "Cardno", value: "Cardno" },
                    { label: "UHID", value: "UHIDNo" },
                    { label: "Patient Name", value: "PName" },
                    { label: "Mobile", value: "Mobileno" },
                  ]}
                  id="SearchType"
                  lable="SearchType"
                  selectedValue={payload?.SearchType}
                  name="SearchType"
                  onChange={handleSelectType}
                  isDisabled={User}
                />
              </div>
              <div style={{ width: "50%" }}>
                {payload?.SearchType === "CardNo" ? (
                  <div style={{ width: "100%" }}>
                    <Input
                      type="number"
                      name="Value"
                      max={12}
                      value={payload?.Value}
                      onChange={handleChange}
                      onInput={(e) => number(e, 12)}
                      disabled={User}
                    />
                    {errors?.SearchValue && (
                      <div className="error-message">{errors?.SearchValue}</div>
                    )}
                  </div>
                ) : payload?.SearchType === "Mobile" ? (
                  <div style={{ width: "100%" }}>
                    <Input
                      type="number"
                      name="Value"
                      max={10}
                      value={payload.Value}
                      onChange={handleChange}
                      onInput={(e) => number(e, 10)}
                      disabled={User}
                    />
                    {errors?.SearchValue && (
                      <div className="error-message">{errors?.SearchValue}</div>
                    )}
                  </div>
                ) : (
                  <div style={{ width: "100%" }}>
                    <Input
                      type="text"
                      name="Value"
                      max={30}
                      value={payload.Value}
                      onChange={handleChange}
                      disabled={User}
                    />
                    {errors?.SearchValue && (
                      <div className="error-message">{errors?.SearchValue}</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-sm-2">
            <ReactSelect
              dynamicOptions={centreOptions}
              name="CentreID"
              lable={t("Centre")}
              id="Centre"
              removeIsClearable={true}
              placeholderName={t("Centre")}
              value={selectedCentre?.value || "0"}
              onChange={handleCentreChange}
            />
          </div>

          <div className="col-sm-2">
            <Input
              type="text"
              name="Employee"
              lable={t("Employee")}
              id="Employee"
              value={employeeLabel}
              placeholder=" "
              disabled={User}
              onChange={handleEmployeeChange}
              onKeyDown={handleEmployeeKeyDown}
              onBlur={(e) => {
                const snapshot = [...employeeSuggestions];
                autocompleteOnBlur(setEmployeeSuggestions);
                setTimeout(() => {
                  const typed = (e.target.value || "").trim();
                  if (!typed) {
                    setEmployeeLabel("");
                    setPayload((prev) => ({ ...prev, User: 0 }));
                    return;
                  }
                  const match =
                    snapshot.find(
                      (ele) => ele.label.toLowerCase() === typed.toLowerCase()
                    ) ||
                    user.find(
                      (ele) => ele.label.toLowerCase() === typed.toLowerCase()
                    );
                  if (match) {
                    setEmployeeLabel(match.label);
                    setPayload((prev) => ({ ...prev, User: match.value }));
                  } else {
                    setPayload((prev) => ({ ...prev, User: 0 }));
                  }
                }, 200);
              }}
            />
            {selectEmployee && employeeSuggestions.length > 0 && (
              <AutoComplete
                selects={selectEmployee}
                test={employeeSuggestions.map((item) => ({
                  TestName: item.label,
                }))}
                handleListSearch={(selected) =>
                  handleEmployeeSelect(
                    employeeSuggestions.find(
                      (item) => item.label === selected.TestName
                    )
                  )
                }
                indexMatch={employeeIndex}
              />
            )}
          </div>

          <div className="col-sm-1 d-flex align-items-center">
            <Form.Check
              type="switch"
              name="OnlyExpired"
              id="switch"
              checked={payload?.OnlyExpired === "1"}
              onChange={(e) =>
                setPayload((prev) => ({
                  ...prev,
                  OnlyExpired: e.target.checked ? "1" : "0",
                }))
              }
            />
            <label className="col-sm-12">{t("Only Expire")}</label>
          </div>

          <div className="col-sm-2">
            <DatePicker
              className="custom-calendar"
              name="FromDate"
              id="FromDate"
              value={payload?.FromDate}
              onChange={dateSelect}
              maxDate={payload?.ToDate}
              lable="Issue Date From"
            />
          </div>

          <div className="col-sm-2">
            <DatePicker
              className="custom-calendar"
              name="ToDate"
              id="ToDate"
              onChange={dateSelect}
              value={payload?.ToDate}
              minDate={payload?.FromDate}
              lable="Issue Date To"
            />
          </div>

          <div className="col-sm-2 mb-2">
            <SelectBox
              options={Cards}
              id="CardType"
              name="Cardtype"
              selectedValue={payload?.Cardtype}
              onChange={handleSelectType}
              lable="Card Type"
            />
          </div>

          <div className="row ml-2 px-2">
            <SearchButton
              className="col-sm-auto mr-2"
              onClick={getSearchCard}
              text={t("Search")}
            />

            <CustomButton
              className="col-sm-auto mr-2"
              onClick={() => downloadReport("Pdf")}
              text={exportLoading.pdf ? t("...") : t("Pdf")}
              icon={"pdf"}
              disabled={exportLoading.pdf}
            />

            <CustomButton
              className="col-sm-auto mr-2"
              onClick={() => downloadReport("Excel")}
              text={exportLoading.excel ? t("...") : t("Excel")}
              icon={"excel"}
              disabled={exportLoading.excel}
            />
          </div>
        </div>
      </Accordion>

      <Heading
        title={t("Search Data")}
        secondTitle={
          <>
            <div className="link-title-container" id="pr_id_11" style={{ marginRight: "10px" }}>
              <div
                style={{
                  fontWeight: "700"
                }}>
                Total Records : {tableData?.length}
              </div>
              |
              <div
                style={{
                  fontWeight: "700"
                }}>
                Total Amount : {tableData?.reduce((acc, item) => acc + item?.amount, 0).toLocaleString("en-IN")}
              </div>
            </div>
            <FilterInput
              value={searchTerm}
              onChange={handleChangeSearch}
              placeholder="Filter Table"
              inputClass="transparent-background"
            />
          </>
        }
      />

      {loading ? (
        <Loading />
      ) : (
        <div className="row px-2">
          <div className="col-12">
            {tableData.length > 0 && (
              <Tables>
                <thead>
                  <tr>
                    <th>{t("S.N.")}</th>
                    <th>{t("Card Name")}</th>
                    <th>{t("Card No.")}</th>
                    <th>{t("Issue Date")}</th>
                    <th>{t("Mobile No.")}</th>
                    <th>{t("Member Name")}</th>
                    <th>{t("Age")}</th>
                    <th>{t("Gender")}</th>
                    <th>{t("Expiry Date")}</th>
                    <th>{t("Card Price")}</th>
                    <th>{t("Issue By")}</th>
                    <th>{t("View")}</th>
                    <th>{t("Edit")}</th>
                    <th>{t("Receipt")}</th>
                    {DefaultCurrencyName !== "KES" &&
                      <th>{t("Letter Head")}</th>}
                    {!allPrePrinted && <th>{t("Card")}</th>}
                    <th>{t("Renewal")}</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData?.map((ele, index) => (
                    <tr key={index}>
                      <td
                        data-title="S.N."
                        onClick={() => {
                          setMemberDetailsModal(true);
                          setMemberShipCardData(ele);
                        }}
                      >
                        {index + 1}
                        <CustomButton icon={"add"} className="ml-2" />
                      </td>
                      <td data-title="Card Name">{ele?.cardName}&nbsp;</td>
                      <td data-title="Card No.">{ele?.cardno}&nbsp;</td>
                      <td data-title="Issue Date">
                        {new Date(ele?.entrydate).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td data-title="Mobile No.">{ele?.mobile}&nbsp;</td>
                      <td data-title="Member Name">{ele?.name}&nbsp;</td>
                      <td data-title="Age">{ele?.age}&nbsp;</td>
                      <td data-title="Gender">{ele?.gender}&nbsp;</td>
                      <td data-title="Expiry Date">{ele?.ValidTo}&nbsp;</td>
                      <td data-title="Card Price">
                        {Number(ele?.amount).toFixed(2)}&nbsp;
                      </td>
                      <td data-title="Issue By">{ele?.issueby}&nbsp;</td>
                      <td
                        data-title="View"
                        style={{ cursor: "pointer", textAlign: "center" }}
                        onClick={() => {
                          setTestViewModal(true);
                          setMemberShipCardData(ele);
                        }}
                      >
                        <Link>
                          <i className="fa fa-search" />
                        </Link>
                        &nbsp;
                      </td>
                      <td
                        data-title="Edit"
                        style={{ cursor: "pointer", textAlign: "center" }}
                      >
                        <i
                          className="fa fa-edit"
                          onClick={() =>
                            Navigate("/MemberShipCardEdit", {
                              state: { data: ele },
                            })
                          }
                        />
                        &nbsp;
                      </td>
                      <td data-title="Receipt">
                        <span
                          onClick={() =>
                            getReceipt(ele?.LedgertransactionIDHash)
                          }
                        >
                          {loadingReceipt === ele?.LedgertransactionIDHash ? (
                            <i
                              style={{ cursor: "pointer", textAlign: "center" }}
                              className="fa fa-spinner fa-spin"
                              aria-hidden="true"
                            />
                          ) : (
                            <i
                              style={{ cursor: "pointer", textAlign: "center" }}
                              className="pi pi-file-excel"
                              aria-hidden="true"
                            />
                          )}
                        </span>
                      </td>
                      {DefaultCurrencyName !== "KES" && <td data-title="Letter Head">
                        <span onClick={() => getLetterHead(ele?.cardno)}>
                          {letterHeadLoading === ele?.cardno ? (
                            <i
                              style={{ cursor: "pointer", textAlign: "center" }}
                              className="fa fa-spinner fa-spin"
                              aria-hidden="true"
                            />
                          ) : (
                            <i
                              style={{ cursor: "pointer", textAlign: "center" }}
                              className="pi pi-file-excel"
                              aria-hidden="true"
                            />
                          )}
                        </span>
                      </td>}
                      {!allPrePrinted && (
                        <td>
                          {ele?.CardGeneration === "Pre Printed" && (
                            cardloading.loading && cardloading.id === index ? (
                              <Loading />
                            ) : (
                              <span
                                style={{ cursor: "pointer", textAlign: "center" }}
                                onClick={() => getMemberCard(ele?.cardno, index)}
                              >
                                <i className="pi pi-id-card" />
                              </span>
                            )
                          )}
                        </td>
                      )}
                      <td>
                        {new Date(ele?.ValidTo) < new Date() && (
                          <MdOutlineAutorenew
                            style={{ cursor: "pointer" }}
                            onClick={() => {
                              setRenewalData(ele);
                              setRenewalModal(true);
                              setSelectedCard(ele?.MembershipCardID);
                              getCardList();
                              const cashOpt = paymentOptions.find((o) => o.label === "Cash");
                              setPaymentDetails({
                                currency: userData?.DefaultCurrencyName,
                                rcdata: [
                                  {
                                    PaymentMode: cashOpt?.label || "Cash",
                                    Amount: "",
                                    S_Currency: userData?.DefaultCurrencyName,
                                    Currency_RoundOff: "",
                                    CardNo: "",
                                    CardDate: new Date(),
                                    BankName: "",
                                  },
                                ],
                                cardAmt: 0,
                                paidAmount: 0,
                                balanceAmount: 0,
                              });
                              setSelectedPaymentMode(cashOpt?.value ?? "Cash");
                            }}
                          />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Tables>
            )}
            {tableData.length === 0 && <NoRecordFound />}
          </div>
        </div>
      )}

      <Modal
        Header="Renew Membership"
        visible={renewalModal}
        setVisible={setRenewalModal}
        modalWidth="80vw"
        modalData={renewalData}
        setModalData={setRenewalData}
        handleAPI={handleSaveRenewal}
        buttonName="Renew"
        CancelbuttonName="Close"
      >
        <div className="row pt-2 pl-2 pr-2 mt-1">
          <div className="col-sm-2">
            <Input
              className="required-fields"
              type="text"
              name="CardName"
              id="CardName"
              placeholder=""
              max={30}
              value={renewalData?.cardno || ""}
              onChange={handleChange}
              lable="Membership Card No"
              disabled
            />
          </div>
          <div className="col-sm-2">
            <DatePicker
              className="custom-calendar"
              name="FromDate"
              id="FromDate"
              value={new Date()}
              onChange={dateSelect}
              lable="Renewal Date"
            />
          </div>
          <div className="col-sm-2">
            <ReactSelect
              dynamicOptions={cardOptions}
              name="cardid"
              lable="Select Card"
              id="cardid"
              removeIsClearable={true}
              placeholderName="Select Card"
              value={selectedCard}
              onChange={handleCardChange}
              isDisabled={true}
            />
          </div>
          <div className="col-sm-2 d-flex align-items-start">
            <label htmlFor="CardAmount" className="col-form-label pt-0">
              Renewal Amount: <span>{selectedCardAmount ?? "N/A"}</span>
            </label>
          </div>
        </div>

        <Accordion title={t("Payment")} defaultValue={true}>
          <div className="row pt-2 pl-2 pr-2 mt-1">
            <div className="col-sm-7">
              <div className="row mb-2">
                <label htmlFor="Currency" className="col-sm-2 col-form-label">
                  {t("Currency")}:
                </label>
                <div className="col-sm-3">
                  <SelectBox
                    name="currency"
                    options={[
                      {
                        value: userData?.DefaultCurrencyName,
                        label: userData?.DefaultCurrencyName,
                      },
                    ]}
                    selectedValue={{
                      value: userData?.DefaultCurrencyName,
                      label: userData?.DefaultCurrencyName,
                    }}
                    onChange={() => { }}
                  />
                </div>
                <span className="col-sm-3">
                  {Number(getAmount("balance")).toFixed(2)}
                </span>
              </div>

              <div className="row mb-2">
                <label
                  htmlFor="Payment Mode"
                  className="col-sm-2 col-form-label"
                >
                  {t("Payment Mode")}:
                </label>
                <div className="col-sm-3">
                  <SelectBox
                    id="paymentModeSelect"
                    name="PaymentMode"
                    options={paymentOptions}
                    placeholderName="Choose a payment method..."
                    selectedValue={selectedPaymentMode}
                    onChange={(e) => {
                      const val = e?.value ?? e?.target?.value;
                      const label = paymentOptions.find((o) => o.value == val)?.label || val;
                      const newRow = {
                        PaymentMode: label,
                        Amount: "",
                        S_Currency: userData?.DefaultCurrencyName,
                        Currency_RoundOff: "",
                        CardNo: "",
                        CardDate: new Date(),
                        BankName: "",
                        id: Date.now() + Math.random(),
                      };
                      setPaymentDetails((prev) => ({
                        ...prev,
                        rcdata: [...prev.rcdata, newRow],
                      }));
                      setSelectedPaymentMode(val);
                    }}
                  />
                </div>
              </div>

              <Tables>
                <thead
                  className="table-primary text-center"
                  style={{ zIndex: 99 }}
                >
                  <tr>
                    <th>Payment Mode</th>
                    <th>Payment Amt.</th>
                    <th>Currency</th>
                    <th>Base</th>
                    <th>Cheque/Card No.</th>
                    <th>Cheque/Card Date</th>
                    <th>Bank Name</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentDetails.rcdata?.map((ele, ind) => (
                    <tr key={ele.id || ind} className="text-center">
                      <td className="fw-bold">{ele?.PaymentMode}</td>
                      <td>
                        <Input
                          className="form-control input-sm"
                          name="Amount"
                          type="number"
                          onChange={(e) => {
                            const { name, value } = e.target;
                            const newAmount = Number(value) || 0;
                            const updatedRcdata = paymentDetails.rcdata.map(
                              (item, index) =>
                                index === ind
                                  ? { ...item, [name]: newAmount }
                                  : item,
                            );
                            const total = updatedRcdata.reduce(
                              (acc, item) => acc + (Number(item.Amount) || 0),
                              0,
                            );
                            if (total <= paymentDetails.cardAmt) {
                              setPaymentDetails((prev) => ({
                                ...prev,
                                rcdata: updatedRcdata,
                              }));
                            }
                          }}
                          value={ele?.Amount}
                          max={
                            paymentDetails.balanceAmount +
                            (Number(ele.Amount) || 0)
                          }
                        />
                      </td>
                      <td>{ele?.S_Currency}</td>
                      <td>{ele?.Currency_RoundOff || "—"}</td>
                      {ele?.PaymentMode !== "Cash" ? (
                        <>
                          <td>
                            <Input
                              className="form-control input-sm"
                              name="CardNo"
                              type="text"
                              onChange={(e) => {
                                const { name, value } = e.target;
                                setPaymentDetails((prev) => ({
                                  ...prev,
                                  rcdata: prev.rcdata.map((item, index) =>
                                    index === ind
                                      ? { ...item, [name]: value }
                                      : item,
                                  ),
                                }));
                              }}
                              value={ele?.CardNo}
                            />
                          </td>
                          <td>
                            <DatePicker
                              name="CardDate"
                              value={ele?.CardDate}
                              maxDate={new Date()}
                              date={
                                ele?.CardDate ? new Date(ele?.CardDate) : ""
                              }
                              onChange={(date) => {
                                setPaymentDetails((prev) => ({
                                  ...prev,
                                  rcdata: prev.rcdata.map((item, index) =>
                                    index === ind
                                      ? { ...item, CardDate: date }
                                      : item,
                                  ),
                                }));
                              }}
                            />
                          </td>
                          <td>
                            <Input
                              name="BankName"
                              type="text"
                              onChange={(e) => {
                                const { name, value } = e.target;
                                setPaymentDetails((prev) => ({
                                  ...prev,
                                  rcdata: prev.rcdata.map((item, index) =>
                                    index === ind
                                      ? { ...item, [name]: value }
                                      : item,
                                  ),
                                }));
                              }}
                              value={ele?.BankName}
                            />
                          </td>
                        </>
                      ) : (
                        <td colSpan="3" className="text-muted">
                          —
                        </td>
                      )}
                      <td>
                        {paymentDetails.rcdata.length > 1 && (
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => {
                              setPaymentDetails((prev) => ({
                                ...prev,
                                rcdata: prev.rcdata.filter(
                                  (_, index) => index !== ind,
                                ),
                              }));
                            }}
                          >
                            <i className="fa fa-times" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Tables>
            </div>

            <div className="col-sm-5">
              <div className="row mb-2">
                <label className="col-sm-3 col-form-label">
                  {t("Gross Amount")}:
                </label>
                <div className="col-sm-3">
                  {Number(paymentDetails.cardAmt).toFixed(2)}
                </div>
                <label className="col-sm-3 col-form-label">
                  {t("Net Amount")}:
                </label>
                <div className="col-sm-3">
                  {Number(paymentDetails.cardAmt).toFixed(2)}
                </div>
              </div>
              <div className="row mb-2">
                <label className="col-sm-3 col-form-label">
                  {t("Paid Amount")}:
                </label>
                <div className="col-sm-3">
                  {Number(getAmount("paid")).toFixed(2)}
                </div>
                <label className="col-sm-3 col-form-label">
                  {t("Balance Amount")}:
                </label>
                <div className="col-sm-3">
                  {Number(getAmount("balance")).toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-center my-2">
            <SaveButton
              text={t("Renewal Card")}
              onClick={renewMembershipCard}
              loading={renewLoading}
              disabled={renewLoading}
            />
          </div>
        </Accordion>
      </Modal>
    </>
  );
};

export default MembershipCardSearch;
