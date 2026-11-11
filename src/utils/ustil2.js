import { toast } from "react-toastify";
import { number, ROUNDOFF_VALUE } from "./constant";
import moment from "moment";
import { useLocalStorage } from "./hooks/useLocalStorage";

import { handleCalculatePatientIssue, payloadSettlerForPaymentGateWay } from "../Frontend/utils/Utils";
const isMobile = window.innerWidth <= 768;
const ip = useLocalStorage("ip", "get");
const userData = useLocalStorage("userData", "get");
const { pathname } = location;
const macAddress = "00-14-22-01-23-45";
export const speakMessage = (message) => {
  const utterance = new SpeechSynthesisUtterance(message);
  const setFemaleVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    // Try to find a female voice based on common name patterns
    let femaleVoice = voices.find(
      (voice) =>
        voice.name.toLowerCase().includes("female") ||
        voice.name.toLowerCase().includes("susan") ||
        voice.name.toLowerCase().includes("samantha") ||
        voice.name.toLowerCase().includes("zira") || // Windows
        (voice.gender && voice.gender.toLowerCase() === "female"),
    );
    // Fallback to an English voice if no clear female voice is found
    if (!femaleVoice) {
      femaleVoice = voices.find((voice) =>
        voice.lang.toLowerCase().includes("en"),
      );
    }
    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }
    window.speechSynthesis.speak(utterance);
  };
  // If voices are not yet loaded, wait for them
  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.onvoiceschanged = setFemaleVoice;
  } else {
    setFemaleVoice();
  }
};
export const notify = (message, type = "success") => {
  if (type === "success") {
    // toast.success(message,{duration: 70000});
    toast.success(message, { autoClose: 3000 });
  } else if (type === "warn") {
    toast.warn(message, { autoClose: 3000 });
  } else if (type === "error") {
    toast.error(message, { autoClose: 3000 });
  }
};

export const CashPanel = {
  PanelName: "CASH",
  PanelID: 1,
  isDefaultPanel: 1,
  PanelGroup: "CASH",
  PanelGroupID: 1,
  ParentPanelID: 0,
  ParentPanel: "",
  PanelCroporateID: 0,
  CorporareName: "",
  PolicyNo: "",
  PolicyCardNo: "",
  PanelCardName: "",
  PolicyExpiry: "",
  PolciyCardHolderRelation: "",
  ApprovalAmount: "",
  ApprovalRemarks: "",
  panelCurrencyFactor: 1,
  panelCurrencyCountryID: 14,
  ReferenceCode: "1",
  ReferenceCodeOPD: "1",
  label: "CASH",
  value: 1,
};

const handleSumPaidAmt = (paymentMethod) => {
  let amount = 0;
  paymentMethod.map((val) => {
    if (val?.PaymentModeID === 8) {
      amount += val?.Amount;
    }
  });
  return amount;
};

const CalculateTaxAmt = (qty, mrp, taxPer, disPer) => {
  let discAmt = mrp * disPer * 0.01;
  let taxableAmt = ((mrp - discAmt) * 100 * qty) / (100 + taxPer);
  return taxableAmt * taxPer * (0.01).toFixed(4);
};

export const SavePharmecyAPIPayload = (
  pDetails,
  itemList,
  values,
  BindResource,
  paymentDetails,
  paymentMethod,
  packageData,
  indentData,
  chosenPatientType, // ✅ "OPD" | "IPD" — from modal choice, or PatientType for non-IPD
) => {
  debugger;
  let PaymentModeID = true;
  if (paymentMethod?.length > 0 && paymentMethod[0]?.PaymentModeID === 4) {
    // checking payment method credit mode as per shiv sir  chnage by anand
    PaymentModeID = false;
  }

  let isCommonDis = itemList?.reduce(
    (ac, current) => ac + Number(current?.DisPer ? current?.DisPer : "0"),
    0,
  );
  if (isCommonDis === 0 || Number(paymentDetails?.discountPercentage) > 0) {
    let updatedList = itemList?.map((val) => {
      val.DisPer = paymentDetails?.discountPercentage;
      let calculatedData = handleCalculatePatientIssue(val, "DisPer");
      return calculatedData;
    });
    itemList = [...updatedList];
  }
  const { ContactNo, type, Panel, Doctor, patientBarcode } = values;

  const { PatientID, PatientType, TransactionID } = pDetails;
  if (
    paymentMethod?.length > 0 &&
    paymentMethod[0]?.PaymentModeID !== 4 &&
    PatientType === "IPD"
  ) {
    chosenPatientType = "OPD";
  }
  debugger;
  const resolvedBillingType = String(
    chosenPatientType ? chosenPatientType : PatientType ? PatientType : "OPD",
  );

  const {
    panelPayable,
    minimumPayableAmount,
    paidAmount,
    netAmount,
    billAmount,
    discountReason,
    discountApproveBy,
    discountAmount,
    roundOff,
    DepositedBy,
    DiscountReasons1,
  } = paymentDetails;
  debugger;
  const pmh = {
    patientID: String(PatientID ? PatientID : ""),
    mobileNo: String(ContactNo ? ContactNo : pDetails?.ContactNo),
    doctorID: String(Doctor?.value ? Doctor?.value : 1),
    doctorName: Doctor?.label ? Doctor?.label : "DR. SELF",
    referedByName: type?.value == 1 ? "" : Doctor,
    patient_type: String(
      patientBarcode?.patientType ? patientBarcode?.patientType : "",
    ),
    purpose: "",
    panelID: Number(Panel?.PanelID ? Panel?.PanelID : 1),
    parentID:
      Number(Panel?.ParentPanelID) === 0
        ? Number(Panel?.PanelID ? Panel?.PanelID : "0")
        : Number(Panel?.ParentPanelID ? Panel?.ParentPanelID : "0"),
    referedBy: Number(0),
    scheduleChargeID: Number(
      PatientType === "IPD"
        ? Panel?.ScheduleChargeIDIPD || 0
        : Panel?.ScheduleChargeIDOPD || 0,
    ),
    patientTypeID: Number(
      patientBarcode?.PatientTypeID ? patientBarcode?.PatientTypeID : 0,
    ),
    panelPaybleAmt: Number(panelPayable),
    patientPaybleAmt: Number(minimumPayableAmount),
    panelPaidAmt: 0,
    patientPaidAmt: Number(paidAmount),
    kinRelation: String(
      patientBarcode?.Relation ? patientBarcode?.Relation : "",
    ),
    kinName: String(
      patientBarcode?.RelationName ? patientBarcode?.RelationName : "",
    ),
    kinPhone: String(
      patientBarcode?.RelationPhoneNo ? patientBarcode?.RelationPhoneNo : "",
    ),
    cardNo: String(Panel?.PolicyCardNo),
    policyNo: String(Panel?.PolicyNo),
    expiryDate: !Panel?.PolicyExpiry
      ? "0001-01-01"
      : String(Panel?.PolicyExpiry),
    cardHolderName: String(Panel?.PanelCardName),
    relationWith_holder: String(Panel?.PolciyCardHolderRelation),
    panelIgnoreReason: "",
    proId: Number(0),
    isVisitClose: 1,
    typeOfReference: "",
    patient_Income: "0",
    triagingCode: 0,
    referralTypeID: 0,
    mlc: 0,
    netAmount: Number(netAmount),
    grossAmount: Number(billAmount),
    discountType: String(discountReason ? discountReason : ""),
    discountReason: String(DiscountReasons1 ? DiscountReasons1 : ""),
    discountApproveBy: String(
      discountApproveBy?.label ? discountApproveBy?.label : "",
    ),
    discountOnTotal: Number(discountAmount),
    roundOff: Number(roundOff),
    ipAddress: ip,
    macAddress: macAddress,
    fieldBoyID: 0,
    DepositedBy: DepositedBy,

    // --- newly added fields from the second object remain unchanged ---
    MLC_Type: patientBarcode?.MLC_Type ? patientBarcode?.MLC_Type : "",
    CurrentAge: patientBarcode?.Age,
    referEmpID: "",
    echsDoctorID: 0,
    echsPolyClinicID: 0,
    totalDiscount: Number(discountAmount ? discountAmount : 0),
    totalPaidAmount: Number(paidAmount ? paidAmount : 0),
    baseCurrency: userData?.centreCurrency,
    billCurrency: Panel?.panelCurrency
      ? Panel?.panelCurrency
      : userData?.centreCurrency,
    panelName: Panel?.PanelName,
    panelGroupID: Panel?.PanelGroupID,
    panelGroupName: Panel?.PanelGroup,
    parentPanelName: Panel?.ParentPanel ? Panel?.ParentPanel : "",
    proName: "",
    pageURL: pathname,
  };

  let ltd = [];
  let patientMedicineData = [];
  let draftMedicineData = [];
  let clinicalTrial = [];
  let paymentDetail = payloadSettlerForPaymentGateWay(
    paymentMethod,
    paymentDetails?.Remark,
  );

  itemList?.map((val) => {
    debugger
    let ltdObj = {
      itemName: String(val?.ItemName ?? ""),
      stockID: String(val?.stockid ?? "0"),
      medExpiryDate: String(val?.MedExpiryDate),
      batchNumber: String(val?.BatchNumber ? val?.BatchNumber : ""),
      isDischargeMedicine: Number(
        values?.DisMed?.value ? values?.DisMed?.value : 0,
      ),
      MACAddress: macAddress,
      StoreTypeName: val?.StoreType ? val?.StoreType : "",
      StoreTypeID: Number(val?.StoreTypeID ? val?.StoreTypeID : 0),
      BaseCurrency: userData?.centreCurrency,
      type: "",
      type_ID: "",
      DoctorName: Doctor?.label ? Doctor?.label : "",
      doctorID: Number(Doctor?.value ?? "0"),
      subCategoryID: Number(val?.SubCategoryID ?? "0"),
      amount: Number(val?.Amount ?? 0),
      mrp: Number(val?.MRP ?? 0),
      rate: Number(val?.UnitPrice ?? 0),
      UnitPrice: Number(val?.UnitPrice ?? 0),
      ConfigID: Number(val?.ConfigID ?? 0),
      quantity: Number(val?.Quantity ?? 0),
      discountPercentage: Number(val?.DisPer ?? 0),
      discAmt: Number(val?.discountAmount ?? 0),
      salesID: String(0),
      itemID: String(val?.ItemID ?? 0),
      isPackage: 0,
      packageID: "0",
      discountReason: Number(val?.discountAmount) > 0 ? discountReason : "",
      tnxTypeID: 0,
      rateListID: 0,
      roundOff: 0,
      coPayPercent: Number(
        PatientType === "IPD"
          ? val?.discountCoPay?.IPDCoPayPercent
          : val?.discountCoPay?.OPDCoPayPercent,
      ),
      isPayable: Number(val?.discountCoPay?.IsPayble ?? 0),
      isPanelWiseDisc: Number(
        PatientType === "IPD"
          ? val?.discountCoPay?.IPDPanelDiscPercent
          : val?.discountCoPay?.OPDPanelDiscPercent ?? 0,
      ),
      panelCurrencyCountryID: Number(Panel?.panelID ?? 0),
      panelCurrencyFactor: 1,
      rateItemCode: "",
      sampleType: "",
      categoryID: String(val?.CategoryID ?? ""),
      bookingDate: "",
      bookingTime: "",
      bookinginModality: 0,
      appointmentNo: 0,
      isOutSource: 0,
      typeOfApp: "Stock",
      isMobileBooking: 0,
      appointmentID: 0,
      isSlotWiseToken: 0,
      appointmentDateTime: "",
      isAdvance: 0,
      packageType: 0,
      investigation_ID: "0",
      PurchaseTaxGroupName: String(val?.PurTaxTypeName ?? ""),
      PurchaseTaxPercent: Number(val?.PurTaxPer ?? 0),
      PurchaseTaxAmount:
        ((Number(val?.Amount ? val?.Amount : 0) * 100) /
          (100 + val?.PurTaxPer)) *
        val?.PurTaxPer *
        0.01,
      SalesTaxGroupName: String(val?.SaleTaxTypeName ?? ""),
      SalesTaxPercent: Number(val?.SaleTaxPer ?? 0),
      SalesTaxAmount:
        ((Number(val?.Amount ?? 0) * 100) /
          (100 + Number(val?.SaleTaxPer ?? 0))) *
        Number(val?.SaleTaxPer ?? 0) *
        0.01,
      CategoryName: String(val?.CategoryName ?? ""),
      SubCategoryName: String(val?.SubcategoryName ?? ""),
      // SubCategoryDisplayName: String(val?.SubcategoryName ?? ""),
      SubCategoryDisplayName: String(val?.DisplayName ?? ""),
      HSNCode:val?.HSNCode,
      isSubtitute: val?.isSubtitute ? val?.isSubtitute : 0,
      indentNo: String(val?.IndentNo),
      subtituteItemName: val?.subtituteItemName ? val?.subtituteItemName : "",
      subtituteItemId: val?.subtituteItemId ? val?.subtituteItemId : 0,
    };
    ltd.push(ltdObj);

    let patMedObj = {
      patientMedicine_ID: Number(
        val?.patientMedicine ? val?.patientMedicine : 0,
      ),
    };
    patientMedicineData.push(patMedObj);

    // draftMedicineData
    let DraftMedDataObj = {
      draftDetailID: Number(val?.draftID ? val?.draftID : ""),
      receiveQty: Number(val?.Quantity ? val?.Quantity : "0"),
    };
    draftMedicineData.push(DraftMedDataObj);

    // clinicalTrial
    if (val?.isClinicalTrial) {
      let clinicalTrialObj = {
        itemID: String(val?.ItemID),
        remarks: String(val?.ClinicalRemark ? val?.ClinicalRemark : ""),
      };
      clinicalTrial.push(clinicalTrialObj);
    }
  });

  let finalobj = {
    PrescriptionFileBytes: values?.prescription ? values?.prescription : "",
    pmh: pmh,
    ltd: ltd,
    patientType: String(type?.value),
    /* PatientBillingType: String(PatientType ? PatientType : "OPD"), */
    PatientBillingType: String(
      chosenPatientType ? chosenPatientType : PatientType ? PatientType : "OPD",
    ),
    TransactionID: String(TransactionID ? TransactionID : "0"),

    isOtPatient: 0,
    isIPDInCash: PaymentModeID,
    isDischargeMedicine: Number(
      values?.DisMed?.value ? values?.DisMed?.value : 0,
    ),
    pageURL: pathname,
    ipAddress: ip,

    pkgd: {
      ledgerTransactionNo: packageData?.[0]?.LedgerTransactionNo || "",
      packageId: packageData?.[0]?.PackageID || "",
      transactionId: packageData?.[0]?.TransactionID || "",
      doctorID: packageData?.[0]?.doctorID || "",
      ledgerTnxId: packageData?.[0]?.LedgerTnxId || "",
      packageAmt: packageData?.[0]?.NetAmount || 0,
      // ✅ Rules:
      // - OPD or blank packageType → send "" (nothing to do)
      // - IPD patient saving as OPD → send "OPD"
      // - IPD patient saving as IPD → send "IPD" (or keep original TYPE)
      packageType:
        resolvedBillingType === "OPD" ? "" : packageData?.[0]?.TYPE || "",
    },

    // lt: lt,

    // salesDetails: salesDetails,
    paymentDetail: paymentDetail,
    patientMedicineData: patientMedicineData,
    draftMedicineData: draftMedicineData,
    clinicalTrial: clinicalTrial,
    GeneralPatient: {
      Title:
        type?.value == 2
          ? values?.title?.value
          : type?.value === 1
            ? patientBarcode?.Title
              ? pDetails?.Title
              : ""
            : "",
      PName:
        type?.value == 2
          ? values?.title?.value + " " + values?.Name
          : type?.value === 1
            ? patientBarcode?.Title
              ? patientBarcode?.Title + " " + patientBarcode?.PName
              : pDetails?.PName
            : "",
      Age:
        type?.value == 2
          ? values?.Age
          : type?.value === 1
            ? patientBarcode?.Age || pDetails?.AgeGender?.split(" ")[0]
            : "",
      Address:
        type?.value == 2
          ? values?.Address
          : type?.value === 1
            ? patientBarcode?.FullAddress || pDetails?.Address
            : "",
      Gender:
        type?.value == 2
          ? values?.Gender?.value
          : type?.value === 1
            ? patientBarcode?.Gender || pDetails?.AgeGender?.split("/")[0]
            : "",
      ContactNo:
        type?.value == 2
          ? values?.ContactNo
          : type?.value === 1
            ? patientBarcode?.Mobile || pDetails?.ContactNo
            : "",
      DoctorID:
        type?.value == 2
          ? Number(values?.Doctor?.value ? values?.Doctor?.value : values?.Doctor ? values?.Doctor : pDetails?.DoctorID || 0)
          : "0",
      DoctorName:
        type?.value == 2 ? values?.Doctor : type?.value === 1 ? "" : "",
    },
  };
  return finalobj;
};

export const SaveCreditIssueAPIPayload = (
  pDetails,
  itemList,
  values,
  BindResource,
  paymentDetails,
  paymentMethod,
  packageData,
  indentData,
) => {
  let PaymentModeID = true;
  if (paymentMethod?.length > 0 && paymentMethod[0]?.PaymentModeID === 4) {
    // checking payment method credit mode as per shiv sir  chnage by anand
    PaymentModeID = false;
  }
  let isCommonDis = itemList?.reduce(
    (ac, current) => ac + Number(current?.DisPer ? current?.DisPer : "0"),
    0,
  );
  if (isCommonDis === 0 || Number(paymentDetails?.discountPercentage) > 0) {
    let updatedList = itemList?.map((val) => {
      val.DisPer = paymentDetails?.discountPercentage;
      let calculatedData = handleCalculatePatientIssue(val, "DisPer");
      return calculatedData;
    });
    itemList = [...updatedList];
  }
  const { ContactNo, type, Panel, Doctor, patientBarcode } = values;

  const { PatientID, PatientType, TransactionID } = pDetails;
  const {
    panelPayable,
    minimumPayableAmount,
    paidAmount,
    netAmount,
    billAmount,
    discountReason,
    discountApproveBy,
    discountAmount,
    roundOff,
    DepositedBy,
    DiscountReasons1,
  } = paymentDetails;
  const pmh = {
    patientID: String(PatientID ? PatientID : ""),
    mobileNo: String(ContactNo ? ContactNo : pDetails?.ContactNo),
    doctorID: String(Doctor?.value ? Doctor?.value : "0"),
    patient_type: String(
      patientBarcode?.patientType ? patientBarcode?.patientType : "",
    ),
    purpose: "",
    panelID: Number(Panel?.PanelID ? Panel?.PanelID : 1),
    parentID:
      Number(Panel?.ParentPanelID) === 0
        ? Number(Panel?.PanelID ? Panel?.PanelID : "0")
        : Number(Panel?.ParentPanelID ? Panel?.ParentPanelID : "0"),
    referedBy: Number(0),
    scheduleChargeID: Number(
      PatientType === "IPD"
        ? Panel?.ScheduleChargeIDIPD || 0
        : Panel?.ScheduleChargeIDOPD || 0,
    ),
    patientTypeID: Number(
      patientBarcode?.PatientTypeID ? patientBarcode?.PatientTypeID : 0,
    ),
    panelPaybleAmt: Number(panelPayable),
    patientPaybleAmt: Number(minimumPayableAmount),
    panelPaidAmt: 0,
    patientPaidAmt: Number(paidAmount),
    kinRelation: String(
      patientBarcode?.Relation ? patientBarcode?.Relation : "",
    ),
    kinName: String(
      patientBarcode?.RelationName ? patientBarcode?.RelationName : "",
    ),
    kinPhone: String(
      patientBarcode?.RelationPhoneNo ? patientBarcode?.RelationPhoneNo : "",
    ),
    cardNo: String(Panel?.PolicyCardNo),
    policyNo: String(Panel?.PolicyNo),
    expiryDate: !Panel?.PolicyExpiry
      ? "0001-01-01"
      : String(Panel?.PolicyExpiry),
    cardHolderName: String(Panel?.PanelCardName),
    relationWith_holder: String(Panel?.PolciyCardHolderRelation),
    panelIgnoreReason: "",
    proId: Number(0),
    isVisitClose: 1,
    typeOfReference: "",
    patient_Income: "0",
    triagingCode: 0,
    referralTypeID: 0,
    mlc: 0,
    netAmount: Number(netAmount),
    grossAmount: Number(billAmount),
    discountType: String(discountReason ? discountReason : ""),
    discountReason: String(DiscountReasons1 ? DiscountReasons1 : ""),
    discountApproveBy: String(
      discountApproveBy?.label ? discountApproveBy?.label : "",
    ),
    discountOnTotal: Number(discountAmount),
    roundOff: Number(roundOff),
    ipAddress: ip,
    macAddress: macAddress,
    fieldBoyID: 0,
    DepositedBy: DepositedBy,

    // --- newly added fields from the second object remain unchanged ---
    MLC_Type: patientBarcode?.MLC_Type ? patientBarcode?.MLC_Type : "",
    CurrentAge: patientBarcode?.Age,
    referEmpID: "",
    echsDoctorID: 0,
    echsPolyClinicID: 0,
    totalDiscount: Number(discountAmount ? discountAmount : 0),
    totalPaidAmount: Number(paidAmount ? paidAmount : 0),
    baseCurrency: userData?.centreCurrency,
    billCurrency: Panel?.panelCurrency
      ? Panel?.panelCurrency
      : userData?.centreCurrency,
    referedByName: "",
    doctorName: Doctor?.label ? Doctor?.label : "",
    panelName: Panel?.PanelName,
    panelGroupID: Panel?.PanelGroupID,
    panelGroupName: Panel?.PanelGroup,
    parentPanelName: Panel?.ParentPanel ? Panel?.ParentPanel : "",
    proName: "",
    pageURL: pathname,
  };

  let ltd = [];
  let patientMedicineData = [];
  let draftMedicineData = [];
  let clinicalTrial = [];
  let paymentDetail = payloadSettlerForPaymentGateWay(
    paymentMethod,
    paymentDetails?.Remark,
  );

  itemList?.map((val) => {
    let ltdObj = {
      itemName: String(val?.ItemName ?? ""),
      stockID: String(val?.stockid ?? "0"),
      medExpiryDate: String(val?.MedExpiryDate),
      EntryDate: val?.EntryDate,
      batchNumber: String(val?.BatchNumber ? val?.BatchNumber : ""),
      isDischargeMedicine: Number(
        values?.DisMed?.value ? values?.DisMed?.value : 0,
      ),
      MACAddress: macAddress,
      StoreTypeName: val?.StoreType ? val?.StoreType : "",
      StoreTypeID: Number(val?.StoreTypeID ? val?.StoreTypeID : 0),
      BaseCurrency: userData?.centreCurrency,
      type: "",
      type_ID: "",
      DoctorName: Doctor?.label ? Doctor?.label : "",
      doctorID: Number(Doctor?.value ?? "0"),
      subCategoryID: Number(val?.SubCategoryID ?? "0"),
      amount: Number(val?.Amount ?? 0),
      mrp: Number(val?.MRP ?? 0),
      rate: Number(val?.UnitPrice ?? 0),
      UnitPrice: Number(val?.UnitPrice ?? 0),
      ConfigID: Number(val?.ConfigID ?? 0),
      quantity: Number(val?.Quantity ?? 0),
      discountPercentage: Number(val?.DisPer ?? 0),
      discAmt: Number(val?.discountAmount ?? 0),
      salesID: String(0),
      itemID: String(val?.ItemID ?? 0),
      isPackage: 0,
      packageID: "0",
      discountReason: Number(val?.discountAmount) > 0 ? discountReason : "",
      tnxTypeID: 0,
      rateListID: 0,
      roundOff: 0,
      coPayPercent: Number(
        PatientType === "IPD"
          ? val?.discountCoPay?.IPDCoPayPercent
          : val?.discountCoPay?.OPDCoPayPercent,
      ),
      isPayable: Number(val?.discountCoPay?.IsPayble ?? 0),
      isPanelWiseDisc: Number(
        PatientType === "IPD"
          ? val?.discountCoPay?.IPDPanelDiscPercent
          : val?.discountCoPay?.OPDPanelDiscPercent ?? 0,
      ),
      panelCurrencyCountryID: Number(Panel?.panelID ?? 0),
      panelCurrencyFactor: 1,
      rateItemCode: "",
      sampleType: "",
      categoryID: String(val?.CategoryID ?? ""),
      bookingDate: "",
      bookingTime: "",
      bookinginModality: 0,
      appointmentNo: 0,
      isOutSource: 0,
      typeOfApp: "Stock",
      isMobileBooking: 0,
      appointmentID: 0,
      isSlotWiseToken: 0,
      appointmentDateTime: "",
      isAdvance: 0,
      packageType: 0,
      investigation_ID: "0",
      PurchaseTaxGroupName: String(val?.PurTaxTypeName ?? ""),
      PurchaseTaxPercent: Number(val?.PurTaxPer ?? 0),
      PurchaseTaxAmount:
        ((Number(val?.Amount ? val?.Amount : 0) * 100) /
          (100 + val?.PurTaxPer)) *
        val?.PurTaxPer *
        0.01,
      SalesTaxGroupName: String(val?.SaleTaxTypeName ?? ""),
      SalesTaxPercent: Number(val?.SaleTaxPer ?? 0),
      SalesTaxAmount:
        ((Number(val?.Amount ?? 0) * 100) /
          (100 + Number(val?.SaleTaxPer ?? 0))) *
        Number(val?.SaleTaxPer ?? 0) *
        0.01,
      CategoryName: String(val?.CategoryName ?? ""),
      SubCategoryName: String(val?.SubcategoryName ?? ""),
      // SubCategoryDisplayName: String(val?.SubcategoryName ?? ""),
      SubCategoryDisplayName: String(val?.DisplayName ?? ""),

      isSubtitute: val?.isSubtitute ? val?.isSubtitute : 0,
      indentNo: String(val?.IndentNo),
      subtituteItemName: val?.subtituteItemName ? val?.subtituteItemName : "",
      subtituteItemId: val?.subtituteItemId ? val?.subtituteItemId : "",
    };
    ltd.push(ltdObj);

    let patMedObj = {
      patientMedicine_ID: Number(
        val?.patientMedicine ? val?.patientMedicine : 0,
      ),
    };
    patientMedicineData.push(patMedObj);

    // draftMedicineData
    let DraftMedDataObj = {
      draftDetailID: Number(val?.draftID ? val?.draftID : ""),
      receiveQty: Number(val?.Quantity ? val?.Quantity : "0"),
    };
    draftMedicineData.push(DraftMedDataObj);

    // clinicalTrial
    if (val?.isClinicalTrial) {
      let clinicalTrialObj = {
        itemID: String(val?.ItemID),
        remarks: String(val?.ClinicalRemark ? val?.ClinicalRemark : ""),
      };
      clinicalTrial.push(clinicalTrialObj);
    }
  });

  let finalobj = {
    PrescriptionFileBytes: values?.prescription ? values?.prescription : "",
    pmh: pmh,
    ltd: ltd,
    patientType: String(type?.value),
    PatientBillingType: String(PatientType ? PatientType : "OPD"),
    TransactionID: String(TransactionID ? TransactionID : "0"),

    isOtPatient: 0,
    isIPDInCash: PaymentModeID,
    isDischargeMedicine: Number(
      values?.DisMed?.value ? values?.DisMed?.value : 0,
    ),
    pageURL: pathname,
    ipAddress: ip,

    pkgd: {
      ledgerTransactionNo: packageData?.[0]?.LedgerTransactionNo || "",
      packageId: packageData?.[0]?.PackageID || "",
      transactionId: packageData?.[0]?.TransactionID || "",
      doctorID: packageData?.[0]?.doctorID || "",
      ledgerTnxId: packageData?.[0]?.LedgerTnxId || "",
      packageAmt: packageData?.[0]?.NetAmount || 0,
      packageType: packageData?.[0]?.TYPE || "",
    },

    // lt: lt,

    // salesDetails: salesDetails,
    paymentDetail: paymentDetail,
    patientMedicineData: patientMedicineData,
    draftMedicineData: draftMedicineData,
    clinicalTrial: clinicalTrial,
    GeneralPatient: {
      Title:
        type?.value == 2
          ? values?.title?.value
          : type?.value === 1
            ? patientBarcode?.Title
              ? pDetails?.Title
              : ""
            : "",
      PName:
        type?.value == 2
          ? values?.title?.value + " " + values?.Name
          : type?.value === 1
            ? patientBarcode?.Title
              ? patientBarcode?.Title + " " + patientBarcode?.PName
              : pDetails?.PName
            : "",
      Age:
        type?.value == 2
          ? values?.Age
          : type?.value === 1
            ? patientBarcode?.Age || pDetails?.AgeGender?.split(" ")[0]
            : "",
      Address:
        type?.value == 2
          ? values?.Address
          : type?.value === 1
            ? patientBarcode?.FullAddress || pDetails?.Address
            : "",
      Gender:
        type?.value == 2
          ? values?.Gender?.value
          : type?.value === 1
            ? patientBarcode?.Gender || pDetails?.AgeGender?.split("/")[0]
            : "",
      ContactNo:
        type?.value == 2
          ? values?.ContactNo
          : type?.value === 1
            ? patientBarcode?.Mobile || pDetails?.ContactNo
            : "",
      DoctorID:
        type?.value == 2
          ? Number(values?.Doctor?.value || pDetails?.DoctorID || 0)
          : "0",
    },
  };
  return finalobj;
};
export const DraftPharmecyAPIPayload = (
  pDetails,
  itemList,
  values,
  BindResource,
) => {
  console.log("pDetails", pDetails);
  console.log("itemList", itemList);
  console.log("values", values);

  const { type, Panel, Doctor } = values;
  let draftDetails = {
    // "id": 0,
    patientID: String(
      type?.value == 2
        ? "CASH002"
        : pDetails?.PatientID
          ? pDetails?.PatientID
          : "",
    ),
    pFirstName: String(
      type?.value == 2
        ? `${values?.title?.value} ${values?.Name}`
        : pDetails?.PName,
    ),
    pLastName: String(
      type?.value == 2
        ? `${values?.title?.value} ${values?.Name}`
        : pDetails?.PName,
    ),
    pName: String(
      type?.value == 2
        ? `${values?.title?.value} ${values?.Name}`
        : pDetails?.PName,
    ),
    panelID: String(Panel?.PanelID ? Panel?.PanelID : 1),
    title: String(
      type?.value == 2 ? `${values?.title?.value}` : pDetails?.Title,
    ),
    age: String(
      type?.value == 2
        ? `${values?.Age} ${values?.AgeType?.value}`
        : pDetails?.AgeGender?.split("/")[0],
    ),
    mobile: String(
      type?.value == 2
        ? values?.ContactNo
          ? values?.ContactNo
          : ""
        : pDetails?.ContactNo,
    ),
    email: "",
    doctorID: String(
      type?.value == 2
        ? BindResource?.DoctorID_Self
        : pDetails?.DoctorID
          ? pDetails?.DoctorID
          : "0",
    ),
    address: String(
      type?.value == 2
        ? values?.Address
          ? values?.Address
          : ""
        : pDetails?.Address,
    ),
    centreID: userData?.centreID,
  };

  let draftItemDetails = [];
  itemList?.map((val, index) => {
    let obj = {
      // "id": Number(val?.ItemID),
      draftID: Number(val?.draftID ? val?.draftID : 0),
      itemID: String(val?.ItemID),
      discountpercent: Number(val?.DisPer ? val?.DisPer : 0),
      stockID: String(val?.stockid ? val?.stockid : "0"),
      quantity: Number(val?.Quantity ? val?.Quantity : "0"),
    };
    draftItemDetails.push(obj);
  });

  return { draftDetails: draftDetails, draftItemDetails: draftItemDetails };
};

export const ReturnPayload = (
  itemList,
  paymentMethod,
  paymentDetails,
  values,
  patientDetail,
) => {
  const {
    Address,
    PName,
    Age,
    ContactNo,
    DoctorID,
    PatientID,
    Patient_Type,
    PanelID,
    ParentID,
    ReferedBy,
    ScheduleChargeID,
    PatientTypeID,
    KinRelation,
    KinPhone,
    KinName,
    DoctorName,
    PanelName,
    PanelGroupID,
    PanelGroupName,
    ParentPanelName,
    PolicyCardNo,
    PolicyNo,
    PolicyExpiry,
    PanelCardName,
    PolciyCardHolderRelation,
    MLC_Type,
    panelCurrency,
    patienttype,
    TransactionID,
    StoreTypeID,
    StoreType,
  } = patientDetail;
  const {
    panelPayable,
    minimumPayableAmount,
    paidAmount,
    netAmount,
    billAmount,
    discountReason,
    discountApproveBy,
    discountAmount,
    roundOff,
    DepositedBy,
    DiscountReasons1,
  } = paymentDetails;
  debugger;
  const GeneralPatient = {
    Title: "",
    PName: PName || "",
    Age: Age?.split(" ")[0] || "",
    Address: Address,
    Gender: Age?.split("/")[1] || "",
    ContactNo: ContactNo || "",
    DoctorID: Number(DoctorID || 0),
  };
  const pmh = {
    patientID: String(PatientID ? PatientID : ""),
    mobileNo: String(ContactNo ? ContactNo : patientDetail?.ContactNo),
    doctorID: String(DoctorID ? DoctorID : "0"),
    patient_type: String(Patient_Type || ""),
    purpose: "",
    panelID: Number(PanelID || 1),
    parentID: Number(ParentID),
    referedBy: Number(ReferedBy),
    scheduleChargeID: Number(ScheduleChargeID),
    patientTypeID: Number(PatientTypeID),
    panelPaybleAmt: Number(panelPayable),
    patientPaybleAmt: Number(minimumPayableAmount),
    panelPaidAmt: 0,
    patientPaidAmt: Number(paidAmount),
    kinRelation: String(KinRelation),
    kinName: String(KinName),
    kinPhone: String(KinPhone),
    cardNo: String(PolicyCardNo), //not found
    policyNo: String(PolicyNo), //not found
    expiryDate: !PolicyExpiry ? "0001-01-01" : String(PolicyExpiry), //not found
    cardHolderName: String(PanelCardName), //not found
    relationWith_holder: String(PolciyCardHolderRelation), //not found
    panelIgnoreReason: "",
    proId: Number(0),
    isVisitClose: 1,
    typeOfReference: "",
    patient_Income: "0",
    triagingCode: 0,
    referralTypeID: 0,
    mlc: 0,
    netAmount: Number(netAmount),
    grossAmount: Number(billAmount),
    discountType: String(discountReason ? discountReason : ""),
    discountReason: String(DiscountReasons1 ? DiscountReasons1 : ""),
    discountApproveBy: String(discountApproveBy?.label || ""),
    discountOnTotal: Number(discountAmount),
    roundOff: Number(roundOff),
    ipAddress: ip,
    macAddress: macAddress,
    fieldBoyID: 0,
    DepositedBy: DepositedBy,
    MLC_Type: MLC_Type || "", // not found
    CurrentAge: Age?.split(" ")[0] || "",
    referEmpID: "",
    echsDoctorID: 0,
    echsPolyClinicID: 0,
    totalDiscount: Number(discountAmount ? discountAmount : 0),
    totalPaidAmount: Number(paidAmount ? paidAmount : 0),
    baseCurrency: userData?.centreCurrency,
    billCurrency: panelCurrency ? panelCurrency : userData?.centreCurrency, //Not Found
    referedByName: "",
    doctorName: DoctorName || "",
    panelName: PanelName,
    panelGroupID: PanelGroupID,
    panelGroupName: PanelGroupName,
    parentPanelName: ParentPanelName,
    proName: "",
    pageURL: pathname,
  };
  let ltd = [];
  //
  itemList?.map((val) => {
    //
    let ltdObj = {
      itemName: String(val?.ItemName ?? ""),
      stockID: String(val?.StockID ?? "0"),
      medExpiryDate: String(val?.MedExpiryDate),
      batchNumber: String(val?.BatchNumber ? val?.BatchNumber : ""),
      isDischargeMedicine: 0,
      MACAddress: macAddress,
      StoreTypeName: val?.StoreType ? val?.StoreType : "",
      StoreTypeID: Number(val?.StoreTypeID ? val?.StoreTypeID : 0),
      BaseCurrency: userData?.centreCurrency,
      type: "",
      type_ID: "",
      DoctorName: DoctorName || "",
      doctorID: Number(DoctorID || 0),
      subCategoryID: Number(val?.SubCategoryID ?? "0"),
      amount: Number(val?.Amount ?? 0),
      mrp: Number(val?.MRP ?? 0),
      rate: Number(val?.unitPrice ?? 0),
      UnitPrice: Number(val?.unitPrice ?? 0),
      ConfigID: Number(val?.ConfigID ?? 0),
      quantity: Number(val?.returnQty ?? 0),
      discountPercentage: Number(val?.DiscountPercentage ?? 0),
      discAmt: Number(val?.DiscountOnTotal ?? 0),
      salesID: String(0),
      itemID: String(val?.ItemID ?? 0),
      isPackage: 0,
      packageID: "0",
      discountReason: Number(val?.discountAmount) > 0 ? discountReason : "",
      tnxTypeID: 0,
      rateListID: 0,
      roundOff: 0,
      coPayPercent: Number(val?.CoPayPercent || 0),
      isPayable: Number(val?.IsPayable || 0),
      isPanelWiseDisc: Number(val?.isPanelWiseDisc),
      panelCurrencyCountryID: Number(PanelID ?? 0),
      panelCurrencyFactor: 1,
      rateItemCode: "",
      sampleType: "",
      categoryID: String(val?.CategoryID ?? ""),
      bookingDate: "",
      bookingTime: "",
      bookinginModality: 0,
      appointmentNo: 0,
      isOutSource: 0,
      typeOfApp: "Stock",
      isMobileBooking: 0,
      appointmentID: 0,
      isSlotWiseToken: 0,
      appointmentDateTime: "",
      isAdvance: 0,
      packageType: 0,
      investigation_ID: "0",
      PurchaseTaxGroupName: String(val?.PurchaseTaxGroupName ?? ""),
      PurchaseTaxPercent: Number(val?.PurchaseTaxPercent ?? 0),
      PurchaseTaxAmount:
        ((Number(val?.Amount ? val?.Amount : 0) * 100) /
          (100 + val?.PurchaseTaxPercent)) *
        val?.PurchaseTaxPercent *
        0.01,
      SalesTaxGroupName: String(val?.SalesTaxGroupName ?? ""),
      SalesTaxPercent: Number(val?.SalesTaxPercent ?? 0),
      SalesTaxAmount:
        ((Number(val?.Amount ?? 0) * 100) /
          (100 + Number(val?.SalesTaxPercent ?? 0))) *
        Number(val?.SalesTaxPercent ?? 0) *
        0.01,
      CategoryName: String(val?.CategoryName ?? ""),
      SubCategoryName: String(val?.SubCategoryName ?? ""),
      SubCategoryDisplayName: String(val?.SubCategoryDisplayName ?? ""),

      isSubtitute: 0,
      indentNo: String(val?.IndentNo), // from Pending Indent S modal samefor all
      subtituteItemName: "",
      subtituteItemId: "0",
      RefundAgainstTransactionID: val?.TransactionID || 0,
      RefundAgainstBillNo: val?.BillNo || "",
      RefundAgainstSalesID: val?.SalesID || 0,
    };
    ltd.push(ltdObj);
  });

  let paymentDetail = payloadSettlerForPaymentGateWay(paymentMethod);

  const paylaod = {
    PatientType: patienttype || "",
    PageURL: pathname,
    IPAddress: ip,
    TransactionID: TransactionID || "0",
    StoreTypeID: StoreTypeID || "",
    StoreTypeName: StoreType || "",
    LTD: ltd, // Array of ObjectLTD
    PMH: pmh, // ObjectPMH
    GeneralPatient: GeneralPatient, // GeneralPatient object
    PaymentDetail: paymentDetail, // Array of ObjectPaymentDetail
  };
  return paylaod;
};

export const ReturnIPDPayload = (
  itemList,
  paymentMethod,
  paymentDetails,
  values,
) => {
  let returnItem = [];

  console.log("itemList", itemList);
  console.log("paymentMethod", paymentMethod);
  console.log("paymentDetails", paymentDetails);
  console.log("values", values);

  itemList
    ?.filter((val) => Number(val?.returnQty) > 0)
    ?.map((val) => {
      // if (Number(val?.returnQty) > 0) {
      const {
        ID,
        ItemID,
        SubCategoryID,
        StockID,
        ItemName,
        IsPackage,
        PackageID,
        Type_ID,
        ToBeBilled,
        ServiceItemID,
        IsVerified,
        IsExpirable,
        MedExpiryDate,
        BatchNumber,
        returnQty,
        RejectQty,
        LedgerNumber,
        Amount,
        MRP,
        SaleTaxPercent,
        UnitPrice,
        PurTaxPer,
        IGSTPercent,
        CGSTPercent,
        SGSTPercent,
        HSNCode,
        GSTType,
      } = { ...val };
      let obj = {
        id: String(ID),
        itemID: String(ItemID ? ItemID : 0),
        subCategoryID: String(SubCategoryID ? SubCategoryID : "0"),
        stockID: String(StockID ? StockID : ""),
        itemName: String(ItemName ? ItemName : ""),
        isPackage: String(IsPackage ? IsPackage : ""),
        packageID: String(PackageID ? PackageID : ""),
        type_ID: String(Type_ID ? Type_ID : ""),
        toBeBilled: String(ToBeBilled ? ToBeBilled : ""),
        serviceItemID: String(ServiceItemID ? ServiceItemID : ""),
        isVerified: String(IsVerified ? IsVerified : ""),
        isExpirable: String(IsExpirable ? IsExpirable : ""),
        medExpiryDate: String(MedExpiryDate),
        batchNumber: String(BatchNumber),
        retQty: String(returnQty ? returnQty : "0"),
        rejectQty: String(RejectQty ? RejectQty : "0"),
        billNo: "", //ise nhi bhejna hai
        ledgerNumber: String(LedgerNumber),
        amount: Number(Amount),
        mrp: Number(MRP),
        taxPercent: Number(SaleTaxPercent),
        unitPrice: String(UnitPrice),
        purTaxPer: String(PurTaxPer),
        igstPercent: String(IGSTPercent ? IGSTPercent : "0"),
        cgstPercent: String(CGSTPercent ? CGSTPercent : "0"),
        sgstPercent: String(SGSTPercent ? SGSTPercent : "0"),
        hsnCode: String(HSNCode ? HSNCode : ""),
        gstType: String(GSTType ? GSTType : ""),
      };
      returnItem.push(obj);
      // }
    });

  const {
    Title,
    PName,
    Age,
    Address,
    Gender,
    contactNo,
    PatientID,
    TransactionID,
    patient_type,
    PanelID,
    IPDCaseTypeID,
    RoomID,
  } = { ...itemList[0] };

  let payload = {
    pName: PName.split(Title)[1],
    age: Age,
    address: String(Address ? Address : ""),
    gender: String(Gender ? Gender : ""),
    contactNo: String(contactNo ? contactNo : ""),
    transactionNo: TransactionID,
    patientID: PatientID,
    indentNumber: "",
    indent_Dpt: "",
    patient_Type: patient_type,
    panelID: String(PanelID ? PanelID : 1),
    roomID: Number(RoomID ? RoomID : "0"),
    caseTypeID: Number(IPDCaseTypeID ? IPDCaseTypeID : ""),
    ipAddress: ip,
    pageUrl: pathname,
    returnItem: returnItem,
  };
  return payload;
};

export const PharmacyFinalSettlementPayload = (
  itemList,
  paymentMethod,
  paymentControl,
  values,
  hashCode,
) => {
  let paymentDetail = payloadSettlerForPaymentGateWay(paymentMethod);
  console.log("itemList", itemList);
  console.log("paymentControl", paymentControl);
  console.log("values", values);

  let dataOPDDiscount = [];
  itemList?.map((val) => {
    let obj = {
      netAmount: Number(val?.PendingAmt),
      discountReason: "",
      discountApproveBy: "",
      discountOnTotal: 0,
      roundOff: Number(paymentControl?.roundOff),
      adjustment: Number(paymentControl?.paidAmount),
      discAmt: 0,
      discountPercentage: 0,
    };
    dataOPDDiscount.push(obj);
  });
  let {
    IsNewPatient,
    FeesPaid,
    TypeOfTnx,
    PanelID,
    TransactionID,
    PatientID,
    LedgerTransactionNo,
    PendingAmt,
  } = itemList[0];
  let payload = {
    dataPaymentDetail: paymentDetail,
    dataOPDDiscount: dataOPDDiscount,
    hashCode: hashCode,
    amountPaid: String(paymentControl?.paidAmount),
    patientID: String(PatientID),
    transactionID: String(TransactionID),
    ledgerTranNo: String(LedgerTransactionNo),
    naration: String(paymentControl?.Remark ? paymentControl?.Remark : ""),
    panelID: Number(PanelID ? PanelID : ""),
    isRefund: PendingAmt >= 0 ? "0" : "1",
    netAmount: String(PendingAmt),
    advanceAmt: Number(0),
    typeOfTnx: String(TypeOfTnx ? TypeOfTnx : ""),
    feePaid: String(FeesPaid ? FeesPaid : ""),
    isNewPatient: Number(IsNewPatient ? IsNewPatient : "0"),
    centreId: Number(userData?.defaultCentre),
    ipAddress: ip,
  };

  return payload;
};

export function buildHierarchyTree(data, keys) {
  // console.log('aaa',data)
  let map = new Map(); // Store all nodes
  let rootNodes = []; // Store root nodes

  // Create a map of all nodes
  data.forEach((item) => {
    let node = {
      id: item?.GroupCodeDisplay,
      groupName: item.GroupName,
      // ParentID: item.ParentID,
      children: [],
    };
    if (keys?.length > 0) {
      keys?.map((val) => {
        node[val] = item[val];
      });
    }
    map.set(item.GroupCodeDisplay, node);
  });

  // Organize hierarchy
  data.forEach((item) => {
    let parentId =
      item?.GroupCodeDisplay?.length > 3
        ? item?.GroupCodeDisplay?.slice(0, -3)
        : null;
    if (parentId && map.has(parentId)) {
      map?.get(parentId).children.push(map?.get(item?.GroupCodeDisplay));
    } else {
      rootNodes.push(map?.get(item?.GroupCodeDisplay));
    }
  });

  return rootNodes;
}

export function buildHierarchyTreeForPNLFinaceReport(data, keys) {
  const nodeStore = {}; // object as lookup
  const rootNodes = [];

  const getId = (item) =>
    `${item?.GroupCodeDisplay}_${item?.GroupName?.data?.DepartmentCode ?? ""}`;

  // 1️⃣ Create lookup object
  data.forEach((item) => {
    const id = getId(item);

    const node = {
      id: item?.GroupCodeDisplay,
      groupName: item.GroupName,
      children: [],
    };

    if (keys?.length) {
      keys.forEach((key) => {
        node[key] = item[key];
      });
    }

    nodeStore[
      `${item?.GroupCodeDisplay}_${item?.GroupName?.data?.DepartmentCode ?? ""}`
    ] = node;
  });
  // 2️⃣ Build hierarchy
  data.forEach((item) => {
    const parentCode =
      item?.GroupCodeDisplay?.length > 3
        ? `${item?.GroupCodeDisplay?.slice(0, -3)}_${item?.GroupName?.data?.DepartmentCode ?? ""}`
        : null;

    if (parentCode && nodeStore[parentCode]) {
      let newData =
        nodeStore[
        `${item?.GroupCodeDisplay}_${item?.GroupName?.data?.DepartmentCode || ""}`
        ];
      newData.id = `${item?.GroupCodeDisplay}_${item?.GroupName?.data?.DepartmentCode || ""}`;
      //
      nodeStore[parentCode].children.push(newData);
    } else {
      let newData =
        nodeStore[
        `${item?.GroupCodeDisplay}_${item?.GroupName?.data?.DepartmentCode || ""}`
        ];
      newData.id = `${item?.GroupCodeDisplay}_${item?.GroupName?.data?.DepartmentCode || ""}`;
      //
      rootNodes.push(newData);
    }
  });

  return rootNodes;
}

export const FinanceSaveVoucherPayload = (bodyData, amounts, values) => {
  console.log("bodyData", bodyData);
  console.log("amounts", amounts);
  console.log("values", values);
  const finEntryDetail = [];
  const finEntryCCDetail = [];
  const finMPALists = [];



  bodyData.map((val, index) => {
    console.log("Ssssss", val);

    let fDetail = {
      coaid: Number(val?.ValueField||val?.COAID),
      accountName: val?.AccountName ? val?.AccountName : 0,
      amountBase:
        values?.ConversionFactor * val?.Amount > 0
          ? values?.ConversionFactor * val?.Amount
          : 0,
      amountSpecific: Number(val?.Amount),
      balType: String(val?.balanceType?.value),
      documentDate: String(
        val?.InvoiceDate
          ? moment(val?.InvoiceDate).format("YYYY-MM-DD")
          : moment(new Date()).format("YYYY-MM-DD"),
      ),
      documentNo: String(val?.InvoiceNumber ? val?.InvoiceNumber : ""),
      remarks: String(val?.Remark ? val?.Remark : "Bank Charges"),
      adjustmentBaseAmount: 0, //done
      adjustmentSpecificAmount: 0, //done
      vatAmt: Number(val?.TaxAmount ? val?.TaxAmount : 0),
      isPDC: Number(
        val?.RefDate ? (new Date(val?.RefDate) > new Date() ? 1 : 0) : 0,
      ),
      refNo: String(val?.Refnumber ? val?.Refnumber : ""),
      refDate: val?.RefDate
        ? moment(val?.RefDate).format("YYYY-MM-DD")
        : moment(new Date()).format("YYYY-MM-DD"),
      paymentModeID: Number(
        val?.PaymentMode?.value ? val?.PaymentMode?.value : 4,
      ),
      paymentMode: String(
        val?.PaymentMode?.label ? val?.PaymentMode?.label : "Credit",
      ),
      bankCode: "", //pending
      branchCode: "", //pending
      receiptMode: ["BP", "CP", "BR", "CR", "CV", "BT"].includes(
        values?.VoucherType?.value,
      )
        ? "I"
        : "",
      billNo: String(val?.InvoiceNumber ? val?.InvoiceNumber : ""),
      billDate: String(
        val?.InvoiceDate
          ? moment(val?.InvoiceDate).format("YYYY-MM-DD")
          : moment(new Date()).format("YYYY-MM-DD"),
      ),
      pdcDate: val?.RefDate
        ? new Date(val?.RefDate) > new Date()
          ? moment(val?.RefDate).format("YYYY-MM-DD")
          : moment(new Date()).format("YYYY-MM-DD")
        : moment(new Date()).format("YYYY-MM-DD"),
      entryDetailID: val?.isPendingInvoice ? val?.EntryDetailID : 0, //Done
      isBankCharges: 0, //DOne
      pendingVatAmt: 0, //DOne
      adjustTaxAmount: 0, //DOne
      branchCentreID: Number(
        val?.branchCentre?.value ? val?.branchCentre?.value : 0,
      ), //"Number 	Branch Centre table value",
      departmentCode: String(
        val?.Department?.value ? val?.Department?.value : "",
      ), // "string  	department table value",
      isCheckBounce: 0,
      oldVoucherNo: "",
      currencyCode: String(
        values?.Currency.value ? values?.Currency.value : "",
      ),
      transCurrFactor: Number(values?.ConversionFactor),
      actualCurrFactor: Number(values?.Actual),
      pcEntryID: 0,
      pcEntryNo: "",
      pcEntryDate: "0001-01-01",
      pettyCashCOAID: 0,
      expenseTypeCode: "",
      requestAmount: 0,
    };
    finEntryDetail.push(fDetail);

    let fDRDeatils = JSON.parse(JSON.stringify(fDetail));
    fDRDeatils.accountName= (values?.BankChargesAccount?.label) 
    fDRDeatils.coaid=Number(values?.BankChargesAccount?.value||"")
    fDRDeatils.balType="Dr"
    
    finEntryDetail.push(fDRDeatils);


    if (val?.ccList?.length > 0) {
      val.ccList?.map((ccDetail, ind) => {
        let fCDetail = {
          mainSNo: Number(index + 1),
          departmentCode: String(
            val?.Department?.value ? val?.Department?.value : "",
          ),
          reqAreaCode: String(ccDetail?.RequirementArea?.value),
          costCentreCode: String(ccDetail?.CostCentre?.value),
          departmentName: String(ccDetail?.Department?.label),
          reqAreaName: String(ccDetail?.RequirementArea?.label),
          costCentreName: String(ccDetail?.CostCentre?.label),
          amount: Number(ccDetail?.ccAmount),
          autoSRNo: Number(ind + 1),
        };
        finEntryCCDetail.push(fCDetail);
      });
    }
    if (val?.mapList?.length > 0) {
      val.mapList?.map((mapDetail, ind) => {
        const details = mapDetail?.VoucherNo?.value?.split("#");
        let fMDetail = {
          mainSNo: Number(index + 1),
          entryDetailsID: String(details[0]),
          coaid: String(details[3]),
          voucherNo: String(details[2]),
          amount: Number(mapDetail?.advAmount),
          autoSRNo: Number(ind + 1),
        };
        finMPALists.push(fMDetail);
      });
    }
  });

  return {
    voucherType: String(
      values?.VoucherType.value ? values.VoucherType.value : "",
    ),
    currencyCode: String(values?.Currency.value ? values?.Currency.value : ""),
    conversionFactorTrans: Number(values?.ConversionFactor),
    conversionFactorActual: Number(values?.Actual),
    voucherDate: String(
      values?.VoucherDate
        ? moment(values?.VoucherDate).format("YYYY-MM-DD")
        : "",
    ),
    departmentCode: "",
    projectCode: String(
      values?.ProjectName?.value ? values?.ProjectName.value : "",
    ),
    entryType: 0,
    isUpdate: values?.isEdit ? 1 : 0,
    voucherNo: values?.VoucherNumber ? values?.VoucherNumber : "",
    ipAddress: String(ip),
    macAddress: macAddress,
    pageURL: pathname,
    documentBase64: values?.documentBase64 ? values?.documentBase64 : "",
    finEntryDetail: finEntryDetail,
    finEntryCCDetail: finEntryCCDetail,
    finMPALists: finMPALists,
  };
};
export function formatAmount(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function SaveUpdateCentrePayload(values, data) {
  const {
    CentreName,
    CentreCode,
    Website,
    ContactNo,
    LandlineNo,
    EmailAddress,
    DiscountType,
    Address,
    Latitude,
    Longitude,
    Active,
    FollowIPDNo,
    printBarcode,
    Prefix,
    organization,
    Currency,
    country,
    state,
    district,
    city,
    headerLogo,
    Footerlogo,
    IsCAPISO,
    IsNablCenter,
    IsCap,
    IsNabl,
    IsPriprited
  } = values;
  return {
    centerID: values?.CentreID ? values?.CentreID : 0,
    centreName: CentreName ? CentreName : "",
    centreCode: CentreCode ? CentreCode : "",
    website: Website ? Website : "",
    mobileNo: ContactNo ? ContactNo : "",
    landlineNo: LandlineNo ? LandlineNo : "",
    emailID: EmailAddress ? EmailAddress : "",
    discountType: DiscountType?.value ? DiscountType?.value : "0",
    address: Address ? Address : "",
    latitude: Latitude ? Latitude : "",
    longitude: Longitude ? Longitude : "",
    labBarcodeAbbre: "",
    isActive: Active?.value ? Number(Active?.value) : 0,
    isDefault: 0,
    followedcenter: Number(FollowIPDNo?.value) === 1 ? 0 : Number(values?.Centre?.value),
    self: Number(FollowIPDNo?.value),
    initialCharr: Prefix ? Prefix : "",
    printBarcode: IsPriprited?.value === "1" ? 1 : 0,
    textPrintBarcode: printBarcode ? printBarcode : "",
    isNablCenter: Number(IsNabl?.value || 0),
    isCap: Number(IsCap?.value || 0),
    OrganizationID: Number(organization?.value || 0),
    OrganizationName: organization?.label || "",
    BaseCurrency: Currency?.value || "",
    CountryID: Number(country?.value || 0),
    Country: country?.label || "",
    StateID: Number(state?.value || 0),
    State: state?.label || "",
    DistrictID: Number(district?.value || 0),
    District: district?.label || "",
    CityID: Number(city?.value || 0),
    City: city?.label || "",
    ReportHeaderURL: headerLogo || "",
    ReportFooterURL: Footerlogo || "",
    NablLogoURL: IsNablCenter || "",
    CapLogoURL: IsCAPISO || ""

  };
}
export const handleSaveCentrePayload = (bodyData, CentreID) => {
  let mappedItems = [];
  bodyData?.forEach((item) => {
    if (item?.ValueField && item?.isChecked) {
      const { ValueField, IsPatientIndent, IsDepartmentIndent } = item;
      mappedItems.push({
        centreID: Number(CentreID),
        valueField: String(ValueField ? ValueField : ""),
        createdBy: "",
        email: "",
        contactPerson: "",
        isPatientIndent: String(IsPatientIndent ? IsPatientIndent : "0"),
        isDepartmentIndent: String(
          IsDepartmentIndent ? IsDepartmentIndent : "0",
        ),
      });
    }
  });
  return {
    centreID: Number(CentreID),
    mappedItems: mappedItems,
  };
};

export const CentreWiseItemPayload = (value) => {
  let { center, Category, SubCategory, ItemName, ItemCreationFrom, ItemType } =
    value;

  return {
    centerID: Number(center?.value ? center?.value : 0),
    departMentLedgerNo: "0",
    categoryID: Number(Category?.value),
    subCategoryID: Number(SubCategory?.value),
    itemName: String(ItemName ? ItemName : ""),
    manufactureID: [],
    date: "",
    centreName: center?.label,
    itemType: ItemType?.value,
    groupId: 0,
  };
};
export const CentreWiseItemSavePayload = (value, bodyData) => {
  let mappedItems = [];
  bodyData?.map((val) => {
    const {
      ItemID,
      departMentLedgerNo,
      MaxLevel,
      MinLevel,
      ReorderLevel,
      ReorderQty,
      MaxReorderQty,
      MinReorderQty,
      MajorUnit,
      Discount,
      ConversionFactor,
      MinorUnit,
      SubCategoryID,
      IsActive,
      Rack,
      centerID,
      CentreName,
      Shelf,
      LoyalityCategoryID,
    } = val;
    let obj = {
      id: 0,
      itemid: ItemID,
      deptledgerno: String(departMentLedgerNo),
      maxlevel: Number(MaxLevel),
      minlevel: Number(MinLevel),
      reorderlevel: Number(ReorderLevel),
      reorderqty: Number(ReorderQty),
      maxreorderqty: Number(MaxReorderQty),
      minreorderqty: Number(MinReorderQty),
      majorunit: MajorUnit,
      minorunit: MinorUnit,
      conversionfactor: Number(ConversionFactor),
      discount: Number(Discount),
      subcategoryid: SubCategoryID,
      isactive: IsActive,
      ipaddress: ip,
      rack: Rack,
      loyalityCategoryID: Number(LoyalityCategoryID ? LoyalityCategoryID : 0),
      shelf: Shelf,
      centreid: centerID,
      centreName: CentreName,
    };
    mappedItems.push(obj);
  });

  return mappedItems;
};

export const SaveEDPSetRatePayload = (value, bodyData) => {
  let gridEditIPD = [];
  let gridEditOPD = [];
  if (value?.type?.value === "OPD") {
    gridEditIPD = [
      {
        selectOne: false,
        plus2: "",
        cnameIPD: "",
        configID: 0,
        ipdRate: 0,
      },
    ];
  } else {
    gridEditOPD = [
      {
        selectOne: false,
        plus: "",
        cname: "",
        opdRate: 0,
      },
    ];
  }

  if (value?.type?.value === "OPD") {
    gridEditOPD = [];
    bodyData
      ?.filter((item) => item?.isChecked)
      ?.map((val) => {
        let obj = {
          selectOne: true,
          plus: val?.ipdType?.value,
          cname: val?.DisplayName,
          opdRate: 0,
        };
        gridEditOPD.push(obj);
      });
  } else {
    gridEditIPD = [];
    bodyData
      ?.filter((item) => item?.isChecked)
      ?.map((val) => {
        let obj = {
          selectOne: true,
          plus: val?.ipdType?.value,
          cname: val?.DisplayName,
          opdRate: 0,
        };
        gridEditIPD.push(obj);
      });
  }
  return {
    editOPD: value?.type?.value === "OPD" ? true : false,
    editIPD: value?.type?.value === "IPD" ? true : false,
    copyTo: String(value?.CopyTo?.value ? value?.CopyTo?.value : ""),
    copyToCentre: Number(value?.CopyTo?.value ? value?.CopyTo?.value : 0),
    copyFrom: Number(value?.CopyFrom?.value ? value?.CopyFrom?.value : 0),
    gridEditOPD: gridEditOPD,
    gridEditIPD: gridEditIPD,
  };
};

export const EDPSetItemRatePayload = (values, bodyData) => {

  let setItemRateOPD = [];
  let setItemRateIPD = [];

  bodyData?.map((val) => {
    let obj = {
      ID: Number(val?.ID || 0),
      ItemID: val?.ItemID ? val?.ItemID : 0,
      RateCurrency: val?.Currency ? val?.Currency : 0,
      Rate: parseFloat(val?.Rate ? val?.Rate : 0.0),
      ERate: parseFloat(val?.EmgRate ? val?.EmgRate : 0.0),
      Epercentage: parseFloat(val?.EmgPer ? val?.EmgPer : 0.0),
      ItemDisplayName: val?.ItemDisplayName ? val?.ItemDisplayName : "",
      ItemCode: val?.ItemCode ? val?.ItemCode : "",
      PanelID: val?.PanelID ? val?.PanelID : 0,
      ScheduleChargeID: val?.ScheduleChargeID ? val?.ScheduleChargeID : 0,
      CentreID: val?.CentreID ? val?.CentreID : 0,
      IpAddress: ip
    }
    if (values?.department?.value === "0") {
      obj.ApplyIPD = val?.applyIPD ? 1 : 0
      setItemRateOPD.push(obj);
    } else {
      obj.IPDCaseTypeID = val?.IPDCaseTypeID ? val?.IPDCaseTypeID : 0
      setItemRateIPD.push(obj);
    }
    // debugger
    // {
    //   ID: 0,
    //   ItemID: 0,
    //   RateCurrency: 0,
    //   Rate: 0.0,
    //   ERate: 0.0,
    //   Epercentage: 0.0,
    //   ItemDisplayName: "",
    //   ItemCode: "",
    //   ApplyIPD: 0,//
    //   PanelID: 0,
    //   ScheduleChargeID: 0,
    //   CentreID: 0,
    //   IpAddress: ""
    // }
    // ipd
    //  {
    //   ID: 0,
    //   ItemID: 0,
    //   RateCurrency: 0,
    //   Rate: 0.0,
    //   ERate: 0.0,
    //   Epercentage: 0.0,
    //   ItemDisplayName: "",
    //   ItemCode: "",
    //   IPDCaseTypeID: 0,//
    //   PanelID: 0,
    //   ScheduleChargeID: 0,
    //   CentreID: 0,
    //   IpAddress: ""
    // }
    // let obj = {
    //   itemID: val?.ItemID,
    //   rateCurrency: val?.Currency,
    //   rate: Number(val?.Rate ? val?.Rate : "0"),
    //   itemDisplay: val?.ItemDisplayName,
    //   epercentage: Number(val?.EmgPer ? val?.EmgPer : "0"),
    //   eRate: Number(val?.EmgRate ? val?.EmgRate : "0"),
    //   itemCode: val?.ItemCode ? val?.ItemCode : "",
    //   active: 1,
    // };
    // if (values?.department?.value === "0") {
    //   obj.itemNameOPD = val?.ItemName ? val?.ItemName : "";
    //   obj.ApplyIPD = val?.applyIPD;
    //   obj.allPanel = val?.allPanel;
    //   setItemRateOPD.push(obj);
    // } else {
    //   obj.caseTypeID = val?.IPDCaseTypeID ?? 0;
    //   obj.itemNameIPD = val?.ItemName ? val?.ItemName : "";
    //   setItemRateIPD.push(obj);
    // }
  });

  // return {
  //   panelID: values?.panel?.value ?? 0,
  //   scheduleChargeID: values?.scheduleCharges?.value ?? 0,
  //   centreID: values?.centre?.value,
  //   dept: values?.department?.value ?? 0,
  //   ipAddress: ip,
  //   allRoom: true,
  //   caseType: values?.department?.value === "0" ? 0 : values?.roomType?.map((item) => {
  //     return item.code;
  //   }).join(","),
  //   setItemRateOPD: setItemRateOPD,
  //   setItemRateIPD: setItemRateIPD,
  // };
  debugger
  return {
    setItemRateOPD: setItemRateOPD,

    setItemRateIPD: setItemRateIPD,

    CopyCentres: values?.CopiedCentre?.map((val) => val?.code)?.join(",") || ""
  }
};

export const updateRoleEDPPayload = (value, tableData) => {
  console.log("Asd", value, tableData);
  const {
    roleID,
    RoleName,
    DeptLedgerNo,
    IsDepartment,
    IsUniversalFormat,
    Medical,
    General,
  } = value;

  let roleDetail = tableData?.map((val) => {
    return {
      roleID: Number(roleID),
      roleName: RoleName,
      departmentLedgerNumber: DeptLedgerNo,
      isDepartment: Number(IsDepartment?.value),
      isUniversal: Number(
        IsUniversalFormat?.value ? IsUniversalFormat?.value : "0",
      ),
      isUniversalType: Number(val?.Is_Universal ? 1 : 0),
      menuFor: "string", // ASK
      isStore: 0, // ASK
      isGeneral: Number(General?.value),
      isMedical: Number(Medical?.value),
      typeName: "string",
      formatID: 0, // ASK
      initialCharacter: "string", // ASK
      finYear: "string", // ASK
      chkFinancialYear: 0,
      separator1: "string",
      separator2: "string",
      length: "string",
      formatPreview: "string",
      menuForText: "string",
      textLength: "string",
    };
  });

  return {
    roleDetail: roleDetail,
    formatDetail: [],
  };
};

export const handlePanelSavePayload = (value) => {
  const localStore = useLocalStorage("userData", "get");
  const {
    panelName,
    Addressone,
    Addresstwo,
    contactPerson,
    panelID,
    rateType,
    emailId,
    contactNo,
    phoneNo,
    faxNo,
    creditlimits,
    validto,
    validfrom,
    paymentMode,
    groupType,
    hideRate,
    showPrintout,
    CoPaymentOn,
    copayments,
    billCurrency,
    rateCurrency,
    CurrencyConv,
    coverNote,
    isctbApplicable,
    fallowrateipd,
    fallowrateopd,
    parentPanel,
    referrateopd,
    referrateipd,
    panelType,
    creditlimitpercent,
    masterType,
    selfBilling,
  } = value;
  debugger;
  return {
    companyName: panelName ? panelName : "",
    add1: Addressone ? Addressone : "",
    add2: Addresstwo ? Addresstwo : "",
    parentID: masterType?.value === "2" ? parentPanel?.value : 0,
    // "hospitalID": panelName ? panelName : "",
    panelCode: groupType ? groupType?.value : "",
    referenceCode: 0,
    masterType: masterType?.value ? masterType?.value : 0, //
    selfBilling: masterType?.value === "1" ? selfBilling?.value : "0", //
    isTPA: panelName ? panelName : "",
    emailID: emailId ? emailId : "",
    phone: phoneNo ? phoneNo : "",
    mobile: contactNo ? contactNo : "",
    contactPerson: contactPerson ? contactPerson : "",
    faxNo: faxNo ? faxNo : "",
    referenceCodeOPD: 0,
    agreement: "",
    // "isServiceTax": true,
    dateFrom: validfrom,
    dateTo: validto,
    // dateFrom: moment(validfrom).format("DD-MM-YYYY"),
    // dateTo: moment(validto).format("DD-MM-YYYY"),
    creditLimit: creditlimits ? creditlimits : "",

    paymentMode: paymentMode?.map((item) => item?.code).join(","),
    panelGroup: groupType?.label ? groupType?.label : "",
    panelGroupID: groupType?.value ? Number(groupType?.value) : 0,
    // "createdBy": panelName ? panelName : "",
    ipAddress: ip,
    hideRate: hideRate?.value === "1" ? 1 : 0,
    showPrintOut: showPrintout?.value === "1" ? 1 : 0,
    coPaymentOn: CoPaymentOn?.value === "1" ? 1 : 0,
    coPaymentPercent: copayments ? Number(copayments) : 0,
    rateCurrencyCountryID: rateCurrency?.value ? rateCurrency?.value : 0,
    billCurrencyCountryID: billCurrency?.value ? billCurrency?.value : 0,
    billCurrencyCountryName: billCurrency ? billCurrency?.label : "",
    billCurrencyConversion: CurrencyConv ? Number(CurrencyConv) : 0,
    // "isCash": true,
    coverNote: coverNote?.value === "1" ? true : false,
    isCtb: isctbApplicable?.value === "1" ? 1 : 0,
    creditPanelLimitInPer: creditlimits ? Number(creditlimits) : 0,
    // "item":"",
    // "subcatagoryID": "",
    // "self": true,
    selfIPD: rateType?.find((val) => val.name === "SELF (IPD)") ? true : false,
    panelfollowOPD: fallowrateopd?.value ? fallowrateopd?.value : "",
    panelfollowIPD: fallowrateipd?.value ? fallowrateipd?.value : "",
    CreatedBy: localStore?.employeeID,

    // new data
    referrateopd: referrateopd?.value ? referrateopd?.value : "",
    referrateipd: referrateipd?.value ? referrateipd?.value : "",
    Self: rateType?.find((val) => val.name === "SELF (OPD)") ? true : false,
    panelType: panelType?.value ? panelType?.value : "",
    creditlimitpercent: creditlimitpercent ? creditlimitpercent : "",
  };
};

export const handleOrganisationPayload = (values, type) => {
  const {
    Name,
    Address,
    City,
    State,
    Pincode,
    PhoneNo,
    MobileNo,
    FaxNo,
    Email,
    id,
    Active,
  } = values;
  return {
    id: type === "update" ? id : 0,
    organisation: Name ?? "",
    address: Address ?? "",
    city: City ?? "",
    state: State?.label ? State?.label : "",
    pincode: Pincode ? Pincode : "",
    phoneNo: PhoneNo ?? "",
    mobileNo: MobileNo ?? "",
    faxNo: FaxNo ?? "",
    emailID: Email ?? "",
    isActive: Active ? Number(Active?.value) : 0,
  };
};
export const OPDVisitConfigSavePayload = (values, bodyData) => {
  console.log("values", values);
  console.log("bodyData", bodyData);
  const details = [];
  const doctorList = [];
  bodyData?.map((item) => {
    details.push({
      subCategoryID: String(item?.SubCategoryID ? item?.SubCategoryID : ""),
      minValidityDays: String(
        item?.MinValidityDays ? item?.MinValidityDays : "",
      ),
      maxValidityDays: String(
        item?.MaxValidityDays ? item?.MaxValidityDays : "",
      ),
      maximumCount: String(item?.MaximumCount ? item?.MaximumCount : ""),
      doctorID: values?.doctor?.DoctorID
        ? String(values?.doctor?.DoctorID)
        : "",
      centreID: values?.Centre?.CentreID
        ? String(values?.Centre?.CentreID)
        : "",
    });
    doctorList.push({
      doctorId: values?.doctor?.DoctorID
        ? String(values?.doctor?.DoctorID)
        : "",
      itemName: "string",
      visitDateTime: "string",
    });
  });

  return {
    saveType: "save",
    details: details,
    doctorList: doctorList,
  };
};

export const SavepreopinstructionPayload = (values, data, tabItemTableData) => {
  console.log("v=data", data);
  console.log("values", values);
  const asaClass = values?.asaClass?.options
    ?.filter((val) => val?.value)
    ?.map((val) => val?.label)
    .join(",");
  const neckMovements = values?.neckMovements?.options
    ?.filter((val) => val?.value)
    ?.map((val) => val?.label)
    .join(",");
  const tmDistance = values?.tmDistance?.options
    ?.filter((val) => val?.value)
    ?.map((val) => val?.label)
    .join(",");
  const dentures = values?.dentures?.options
    ?.filter((val) => val?.value)
    ?.map((val) => val?.label)
    .join(",");
  const teeth = values?.teeth?.options
    ?.filter((val) => val?.value)
    ?.map((val) => val?.label)
    .join(",");
  const mouthOpening = values?.mouthOpening?.options
    ?.filter((val) => val?.value)
    ?.map((val) => val?.label)
    .join(",");
  //
  return {
    pre_op_instruction: {
      preid: 0,
      patientID: data?.PatientID ? String(data?.PatientID) : "",
      transactionID: data?.TransactionID ? String(data?.TransactionID) : "",
      appointment_ID: 0,
      otBookingID: data?.OTBookingID,
      malampattI_SCORE: String(
        values?.malampattiScore?.options?.find((val) => val?.value)?.label
          ? values?.malampattiScore?.options?.find((val) => val?.value)?.label
          : "",
      ),
      moutH_OPENING_ADEQATE: mouthOpening ? mouthOpening : "",
      teeth: teeth ? teeth : "",
      dentures: dentures ? dentures : "",
      t_M_DISTANCE: tmDistance ? tmDistance : "",
      nceK_MOVEMENTS: neckMovements ? neckMovements : "",
      asA_CLASS: asaClass ? asaClass : "",
      iS_NPO_FROM: values?.NPOFROM ? "1" : "0",
      presenT_MEDICATIONS: "string",
      npO_time: values?.NPOFROM
        ? moment(values?.NPOFromTime).format("HH:mm:ss")
        : "00:00:00",
      npO_date: values?.NPOFROM
        ? moment(values?.NPOOnDate).format("YYYY-MM-DD")
        : "0001-01-01",
      iS_APPLY_EMLA: values?.iS_APPLY_EMLA ? "1" : "0",
      iS_REMOVE_ALL: values?.REMOVE_ALL ? "1" : "0",
      iS_SHIFT_OT: values?.SHIFT_TO_OT ? "1" : "0",
      iS_NEBULISATION: values?.NEBULISATION_WITH ? "1" : "0",
      nebulisation: values?.NEBULISATION_WITH ? values?.NEBULISATION_ON : "",
      nebulisatioN_time: values?.NEBULISATION_WITH
        ? moment(values?.nebulisatioN_time).format("HH:mm:ss")
        : "00:00:00",
      nebulisatioN_date: values?.NEBULISATION_WITH
        ? moment(values?.nebulisatioN_date).format("YYYY-MM-DD")
        : "0001-01-01",
      iS_patient_can: values?.isPatientCan ? "1" : "0",
      iS_STOP_ORAL: values?.isStopOral ? "1" : "0",
      stoP_ORAL_from_date: values?.isStopOral
        ? moment(values?.STOP_ORALFromDate).format("YYYY-MM-DD")
        : "0001-01-01",
      stoP_ORAL_time: values?.isStopOral
        ? moment(values?.stoP_ORAL_time).format("HH:mm:ss")
        : "00:00:00",
      stoP_ORAL_from_on: values?.isStopOral
        ? moment(values?.stoP_ORAL_from_on).format("YYYY-MM-DD")
        : "0001-01-01",
      other: values?.IsOther ? values?.otherDeatails : "",
      entry_by: "",
      entry_date: "0001-01-01",
      is_active: "",
      update_date: "0001-01-01",
      update_by: "",
      allergies: values?.Allergies ? values?.Allergies : "",
    },
    labItems:
      tabItemTableData?.map((item) => ({
        itemID: item?.ItemID,
        tabname: item?.ItemName,
        tabdose: item?.mg,
        time: moment(item?.tab_AT).format("hh:mm A"),
        date: moment(item?.tabOnDate).format("YYYY-MM-DD"),
      })) || [],
  };
};

const handlePACPaloadData = (data, type) => {
  return data
    ?.find((item) => item?.name === type)
    ?.options?.filter((val) => val?.value)
    ?.map((val) =>
      val?.name
        ? `${val?.label}#${val?.inputValue ? val?.inputValue : ""}`
        : val?.label,
    )
    .join(",");
};
export const SavePACPaload = (list, values, data) => {
  const { PatientID, TransactionID, OTBookingID } = data;
  const antiicipateD_AIRWAY = handlePACPaloadData(list, "ANTIICIPATED_AIRWAY");
  const respiratory = handlePACPaloadData(list, "RESPIRATORY");
  const CARDIOVASCULAR = handlePACPaloadData(list, "CARDIOVASCULAR");
  const RENAL_ENDOCRINE = handlePACPaloadData(list, "RENAL_ENDOCRINE");
  const HEPATO_GASTROINTESTINAL = handlePACPaloadData(
    list,
    "HEPATO_GASTROINTESTINAL",
  );
  const NEURO_MUSCULOSKELETAL = handlePACPaloadData(
    list,
    "NEURO_MUSCULOSKELETAL",
  );
  const OTHERS = handlePACPaloadData(list, "OTHERS");
  const PRESENT_MEDICATIONS = handlePACPaloadData(list, "PRESENT_MEDICATIONS");

  return {
    pacid: values?.pacid ? values?.pacid : 0,
    patientID: PatientID,
    transactionID: TransactionID ? TransactionID : "",
    appointment_ID: 0,
    otBookingID: OTBookingID,
    surgicaL_ANESTHETIC: values?.SURGICAL_ANESTHETIC
      ? values?.SURGICAL_ANESTHETIC
      : "",
    antiicipateD_AIRWAY: antiicipateD_AIRWAY ? antiicipateD_AIRWAY : "",
    respiratory: respiratory ? respiratory : "",
    cardiovascular: CARDIOVASCULAR ? CARDIOVASCULAR : "",
    renaL_ENDOCRINE: RENAL_ENDOCRINE ? RENAL_ENDOCRINE : "",
    hepatO_GASTROINTESTINAL: HEPATO_GASTROINTESTINAL
      ? HEPATO_GASTROINTESTINAL
      : "",
    neurO_MUSCULOSKELETAL: NEURO_MUSCULOSKELETAL ? NEURO_MUSCULOSKELETAL : "",
    others: OTHERS ? OTHERS : "",
    presenT_MEDICATIONS: PRESENT_MEDICATIONS ? PRESENT_MEDICATIONS : "",
    entry_by: "",
    entry_date: "0001-01-01",
    is_active: "",
    update_date: "0001-01-01",
    update_by: "",
  };
};
export const UpdatePACPaload = (list, values, data) => {
  const { PatientID, TransactionID, OTBookingID } = data;
  const antiicipateD_AIRWAY = handlePACPaloadData(list, "ANTIICIPATED_AIRWAY");
  const respiratory = handlePACPaloadData(list, "RESPIRATORY");
  const CARDIOVASCULAR = handlePACPaloadData(list, "CARDIOVASCULAR");
  const RENAL_ENDOCRINE = handlePACPaloadData(list, "RENAL_ENDOCRINE");
  const HEPATO_GASTROINTESTINAL = handlePACPaloadData(
    list,
    "HEPATO_GASTROINTESTINAL",
  );
  const NEURO_MUSCULOSKELETAL = handlePACPaloadData(
    list,
    "NEURO_MUSCULOSKELETAL",
  );
  const OTHERS = handlePACPaloadData(list, "OTHERS");
  const PRESENT_MEDICATIONS = handlePACPaloadData(list, "PRESENT_MEDICATIONS");

  return {
    pacid: values?.pacid ? values?.pacid : 0,
    patientID: PatientID,
    transactionID: TransactionID ? TransactionID : "",
    appointment_ID: 0,
    otBookingID: OTBookingID,
    surgicaL_ANESTHETIC: values?.SURGICAL_ANESTHETIC
      ? values?.SURGICAL_ANESTHETIC
      : "",
    antiicipateD_AIRWAY: antiicipateD_AIRWAY ? antiicipateD_AIRWAY : "",
    respiratory: respiratory ? respiratory : "",
    cardiovascular: CARDIOVASCULAR ? CARDIOVASCULAR : "",
    renaL_ENDOCRINE: RENAL_ENDOCRINE ? RENAL_ENDOCRINE : "",
    hepatO_GASTROINTESTINAL: HEPATO_GASTROINTESTINAL
      ? HEPATO_GASTROINTESTINAL
      : "",
    neurO_MUSCULOSKELETAL: NEURO_MUSCULOSKELETAL ? NEURO_MUSCULOSKELETAL : "",
    others: OTHERS ? OTHERS : "",
    presenT_MEDICATIONS: PRESENT_MEDICATIONS ? PRESENT_MEDICATIONS : "",
    entry_by: "",
    entry_date: "0001-01-01",
    is_active: "",
    update_date: "0001-01-01",
    update_by: "",
  };
};

export function formatIndianCurrency(amount) {
  const [integerPartRaw, decimalRaw = "00"] = Number(amount)
    .toFixed(2)
    .split(".");

  const lastThree = integerPartRaw.slice(-3);
  const otherNumbers = integerPartRaw.slice(0, -3);

  let formattedInteger = lastThree;
  if (otherNumbers) {
    formattedInteger =
      otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + lastThree;
  }

  return `${formattedInteger}.${decimalRaw}`;
}

export const formatCurrency = (value, currency, stat) => {
  if (!currency) return value;

  try {
    // const formattedValue = new Intl.NumberFormat("en-US", {
    //   style: "currency",
    //   currency: currency,
    // }).format(value);
    // console.log("formatted" , formattedValue)
    const formattedValue = new Intl.NumberFormat(
      "en-US",
      stat.isShowCurrency === 1 ? { style: "currency", currency } : {},
    ).format(value);

    // Replace the currency symbol and add space after it
    return formattedValue.replace(/([^\d])(\d)/, "$1 $2");
  } catch (error) {
    // If an error occurs (invalid currency), return the value as is
    console.error("Error formatting currency:", error);
    return value;
  }
};

export const NursingFormEntryPayload = (
  data,
  payload,
  values,
  medicationTableData,
  glasgowComaScale,
) => {
  let arr = values[payload?.Type?.value];
  // if (payload?.Type?.value === "C") {
  //     arr = values[payload?.Type?.value]
  // }
  const { patientID, transactionID, ipdno } = data;

  console.log("asdasd", arr);

  let newPayloadData = [];
  //
  const { PhoneNo, NameOfRelative, Relationship, Sign, location, isUpdate } =
    payload;
  arr?.map((val) => {
    const { HeaderName, Id, LabelName } = val;

    let shouldRender = true;
    if (payload?.Type?.value === "H") {
      const ageFromVal = val?.ConditionOnAge;
      const operator = ageFromVal?.[0];
      const ageInVal = parseInt(ageFromVal?.slice(1));
      const userAge = parseInt(data?.age?.split(" ")[0]);

      if (operator === ">" && !(userAge > ageInVal)) shouldRender = false;
      if (operator === "<" && !(userAge < ageInVal)) shouldRender = false;
      if (operator === "=" && !(userAge === ageInVal)) shouldRender = false;
    }
    if (shouldRender) {
      //
      let obj = {
        patientID: patientID,
        transactionID: Number(transactionID),
        ipdNo: ipdno,
        fieldID: Number(Id), //Id
        formHederName: HeaderName, //HeaderName
        fieldName: LabelName, // LabelName
        remark: payload[`${val?.LabelName} Remark`]
          ? payload[`${val?.LabelName} Remark`]
          : "", //remark from text otherwise ""

        size: "", //for only "H" case
        location: location ? location : "", //for only "H" case
        relativeName: NameOfRelative ? NameOfRelative : "", // //for only "H"  and "G" case
        sign: Sign ? Sign : "", // //for only "H"  and "G" case
        relation: Relationship ? Relationship : "", // //for only "H"  and "G" case
        phoneNo: PhoneNo ? PhoneNo : "", // //for only "H"  and "G" case of relative

        response: payload[val?.LabelName]?.["value"]
          ? payload[val?.LabelName]["value"]
          : "", // value
        responseText: payload[val?.LabelName]?.["label"]
          ? payload[val?.LabelName]["label"]
          : "", //text
        pageURL: pathname,
        entryBy: "EMP001",
        // "isUpdate": isUpdate?1:0,
        isUpdate: payload[val?.LabelName]?.["isUpdate"] ? 1 : 0,
        formEntryID: payload[val?.LabelName]?.["FormEntryID"]
          ? payload[val?.LabelName]["FormEntryID"]
          : 0,
      };
      newPayloadData.push(obj);
    }
  });

  return newPayloadData;
};

export const NursingPreviousMedicineEntryPayload = (
  data,
  tableData,
  DelFormEntryID,
) => {
  const { patientID, transactionID } = data;
  const payloadData = [];
  tableData
    ?.filter((va) => va?.Medicine)
    ?.map((val) => {
      const {
        DateOfLastDose,
        Frequency,
        Dosage,
        Medicine,
        TimeOfLastDose,
        FormEntryID,
      } = val;
      let obj = {
        transactionID: Number(transactionID ? transactionID : 0),
        patientID: patientID,
        entryBy: "EMP001",
        isActive: DelFormEntryID === FormEntryID ? 0 : 1,
        medication: Medicine ? Medicine : "",
        dose: Dosage ? Dosage : "",
        frequency: Frequency ? Frequency : "",
        dateTimeofLastDose:
          moment(DateOfLastDose).format("YYYY-MM-DD") +
          " " +
          moment(TimeOfLastDose).format("HH:mm:ss"),
        isUpdate: val?.FormEntryID ? val?.FormEntryID : 0,
        formEntryID: val?.FormEntryID ? val?.FormEntryID : 0,
      };
      payloadData.push(obj);
    });

  return payloadData;
};

export const groupByKey = (array, key) => {
  return array.reduce((result, obj) => {
    const groupKey = obj[key];
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(obj);
    return result;
  }, {});
};

const isRefundFunIPD = (PaymentType, isRefund) => {
  //
  if ("IPD-Settlement" === PaymentType) {
    return isRefund;
  } else if ("ipd-advance" === PaymentType) {
    return 0;
  } else if ("IPD-Refund" === PaymentType) {
    return 1;
  } else {
    return 0;
  }
};

export const SaveIPDAdvancePayload = (
  paymentMethod,
  payload,
  dataFromChild,
  paymentControlModeState,
  CTBSelectedList,
  singlePatientData,
) => {
  const paymentDetail = paymentMethod?.map((item) => {
    return {
      paymentModeID: Number(item?.PaymentModeID),
      paymentMode: String(item?.PaymentMode),
      amount: parseInt(item?.Amount),
      refNo: String(item?.RefNo),
      bankName: String(item?.BankName),
      c_Factor: String(item?.C_Factor),
      SpecificAmount: Number(item?.S_Amount),
      SpecificCurrency: String(item?.S_Currency),
      currencyRoundOff: Number(item?.currencyRoundOff || 0),
      swipeMachine: String(item?.swipeMachine || ""),
      Naration: String(paymentControlModeState?.Remark || ""),
      BaseCurrency: String(item?.BaseCurrency || "INR"),
      isCMRFundAdvance: 0,
      goNumber: "",
      goDate: "2025-10-24",
      igrsNumber: "",
      estimateNo: "",
    };
  });
  const CTBReqNo =
    CTBSelectedList?.length > 0
      ? CTBSelectedList?.map((ele) => {
        return {
          ctbNo: ele?.RequestNo ? String(ele?.RequestNo) : "",
        };
      })
      : [{ ctbNo: "" }];

  const {
    PaymentType,
    TransactionID,
    PatientPaidAmt,
    PatientID,
    DoctorName,
    PanelGroupName,
    PanelGroupID,
  } = singlePatientData?.dtAdjust;

  return {
    paymentDetail: paymentDetail,
    dataCTB: CTBReqNo,
    amount: String(paymentControlModeState?.paidAmount || 0),
    hashCode: "",
    isRefund: isRefundFunIPD(
      payload?.BillAccount,
      singlePatientData?.dtAdjust?.isRefund,
    ),
    transactionID: String(TransactionID || 0),
    isAdmitted: true,
    totalPaidAmount: Number(paymentControlModeState?.paidAmount || 0),
    hospLedger: String(payload?.BillAccount || ""),
    patientID: PatientID,
    roomNo: dataFromChild?.roomno ? String(dataFromChild?.roomno) : "",
    doctorName: String(DoctorName || ""),
    patientName: dataFromChild?.pname ? String(dataFromChild?.pname) : "",
    panelName: dataFromChild?.company_name
      ? String(dataFromChild?.company_name)
      : "",
    paymentRemarks: String(paymentControlModeState?.Remark || ""),
    paymentReceivedFrom: "",
    panelID: dataFromChild?.PanelID ? String(dataFromChild?.PanelID) : "",
    isCTB: dataFromChild?.IsCTB ? String(dataFromChild?.IsCTB) : "",
    ipAddress: ip,
    PanelGroupID: String(PanelGroupID || ""),
    PanelGroupName: String(PanelGroupName || ""),
    PageURL: pathname,
    DepositedBy: "",
    MacAddress: macAddress,
    paymentType: payload?.BillAccount ? String(payload?.BillAccount) : "",
  };
};

export function getMinutesDifference(date1Str, date2Str) {
  function parseCustomDate(str) {
    // Example: "29-Oct-25 05:49 PM"
    const [datePart, timePart, meridian] = str.split(" "); // ["29-Oct-25", "05:49", "PM"]
    const [day, monthStr, year] = datePart.split("-"); // ["29", "Oct", "25"]
    const [hoursStr, minutesStr] = timePart.split(":"); // ["05", "49"]

    const months = {
      Jan: 0,
      Feb: 1,
      Mar: 2,
      Apr: 3,
      May: 4,
      Jun: 5,
      Jul: 6,
      Aug: 7,
      Sep: 8,
      Oct: 9,
      Nov: 10,
      Dec: 11,
    };

    let hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);

    // Convert to 24-hour format
    if (meridian === "PM" && hours !== 12) hours += 12;
    if (meridian === "AM" && hours === 12) hours = 0;

    const fullYear = 2000 + parseInt(year, 10); // handle "25" → 2025

    return new Date(
      fullYear,
      months[monthStr],
      parseInt(day, 10),
      hours,
      minutes,
    );
  }
  const d1 = parseCustomDate(date1Str);
  const d2 = parseCustomDate(date2Str);

  // Check for invalid dates
  if (isNaN(d1) || isNaN(d2)) {
    throw new Error(
      "Invalid date format. Expected format: '29-Oct-25 05:49 PM'",
    );
  }

  const diffMs = Math.abs(d2 - d1);
  return Math.floor(diffMs / 1000 / 60); // total minutes
}

export const PatientBillingRejectPayload = (Remark, data, tblData) => {
  let objDRCrList = [];
  //
  tblData?.map((item) => {
    objDRCrList.push({
      ledTnxID: Number(item?.ID),
      typeofTnx: item?.Quantity >= 0 ? "CR" : "DR",
      drCrType: item?.Quantity >= 0 ? "CQ" : "DQ",
      quantity: Number(item?.Quantity) * -1,
      rate: Number(item?.Rate),
      amount: Number(item?.Amount) * -1,
      discountPercentage: Number(item?.DiscPer),
      discAmt: Number(item?.DiscAmt) * -1,
      itemName: String(item?.ItemName),
    });
  });
  return {
    IPAddress: ip,
    transactionID: String(data?.transactionID || data?.TransactionID),
    Remark: String(Remark),
    macAddress: macAddress,
    pageUrl: pathname,
    objDRCrList: objDRCrList,
  };
};

export const RadiologyAcceptanceRejectPayload = (Remark, tblData) => {
  let objDRCrList = [];
  //
  tblData?.map((item) => {
    objDRCrList.push({
      ledTnxID: Number(item?.ID),
      typeofTnx: 0,
      drCrType: 0,
      quantity: 0,
      rate: 0,
      amount: 0,
      discountPercentage: 0,
      discAmt: 0,
      itemName: "",
    });
  });
  return {
    IPAddress: ip,
    transactionID: tblData?.map((item) => item?.ID),
    Remark: String(Remark),
    macAddress: macAddress,
    pageUrl: pathname,
    objDRCrList: objDRCrList,
  };
};

export const SaveGRNPayload = (values, commanData) => {
  const {
    totalAmount,
    TotalGRNAmount,
    validItems,
    selectedCurrencyName,
    state,
    TotalTaxAmount,
  } = commanData;
  const pathName = window.location.pathname;
  const ip = useLocalStorage("ip", "get");

  const dataInvoice = [
    {
      TotalTaxAmount: TotalTaxAmount,
      invoiceNo: values?.InvoiceNo ? values?.InvoiceNo : null,
      chalanNo: values?.DeliveryNo, //deliveryNo.
      invoiceDate: moment(values?.InvoiceDate).format("YYYY-MM-DD"),
      chalanDate:
        values?.DeliveryDate !== "Invalid Date"
          ? moment(values?.DeliveryDate).format("YYYY-MM-DD")
          : new Date(), //DeliveryDate
      vendorID: values?.LedgerNumber?.value, //Supplier
      vendorName: values?.LedgerNumber?.label, //Supplier
      wayBillDate: moment(new Date()).format("YYYY-MM-DD"), // current Date
      invoiceAmount: values?.items?.reduce(
        (sum, obj) => sum + obj.netAmount,
        0,
      ), //net Amount
      grossBillAmount: totalAmount,
      netAmount: values?.items?.reduce((sum, obj) => sum + obj.netAmount, 0), // net Amount
      roundOff: values?.roundOff, //round Off
      discAmount: commanData?.validItems?.reduce(
        (sum, obj) => sum + Number(obj.discountAmt || 0),
        0,
      ), // total Disc. Amt
      paymentModeID: values?.paymentType, // Payment Mode ID
      // poNumber: "", //from modal
      // poDate: "2025-11-07", // from modal
      // otherCharges: values?.otherCharges || 0, // ADD FIELD
      currencyCountryID: values?.Currency, // currency ID
      currency: selectedCurrencyName || "",
      CurrencyFactor: values?.ConversionFactor || 1,
      freightCharge: Number(values?.freightCharge) || 0, // fREIEGHT cHARGES
      transport: "", //
      vehicleNo: "", //
      fileRemark: "", //
      pageURL: String(pathName), //DirectGrn
      isGRNUploaded: 0, // -----------------------PENDING-------------------
      isDonated: values?.isDonated ? Number(values?.isDonated) : 0,
    },
  ];

  // return
  const dataItemDetails = [];
  validItems?.map((item) => {
    dataItemDetails.push({
      storeTypeID: values?.StoreType?.value,
      storeType: values?.StoreType?.label,
      stockID: item.StockID || 0, // empty on new grn only
      itemID: item.ItemID || 0,
      manufacturerId:
        item.manufacturer?.value !== undefined &&
          item.manufacturer?.value !== null
          ? item.manufacturer.value
          : item.manufacturer
            ? item.manufacturer
            : 0,
      itemName: item.itemName || "",
      batchNumber: item.batch || "",
      unitPrice: item?.unitPrice || 0,
      mrp: item.MajorMRP || 0,
      quantity: item.qty || 0,
      billQuantity: item.qty || 0,
      // isReturn: 0,
      medExpiryDate: item.expDate ? item?.expDate : "12/50",
      naration: values?.narration || "",
      isFree: item.IsFree || 0,
      configID: item?.configID,
      categoryID: item?.CategoryID || 0,
      categoryName: item?.CategoryName || "",
      subcategoryID: item.SubCategoryID || 0,
      subcategoryName: item?.SubCategoryName || "",
      rate: item.rate || 0,
      discPer: item.discountPer || 0,
      discAmt: item.discountAmt || 0,
      purTaxPer: item.PurchaseTaxPercentage || 0,
      purTaxAmt: item?.GSTAmount,
      saleTaxPer: item?.SaleTaxPercentage, // FROM ITEM API
      majorUnit: item.MajorUnit || "",
      minorUnit: item.MinorUnit || "",
      conversionFactor: item.ConversionFactor || 0,
      PurTaxTypeName: item?.PurchaseTaxGroupName,
      majorMRP: item.MajorMRP || 0,
      taxCalculateOn: "RateAD",
      ipAddress: String(ip),
      isExpirable: item.IsExpirable || 0,
      isDeal: item.isDeal || "0",
      hsnCode: item.hsnCode || "",
      specialDiscPer: 0,
      specialDiscAmt: 0,
      itemNetAmount: item.netAmount || 0,
      isUpdateCF: item?.IsUpdateConversionFactor,
      isUpdateHSNCode: item?.IsUpdateHSNCode,
      isUpdateExpirable: item?.IsUpdateExpirable,
      podid: item.PurchaseOrderDetailID || 0, //purchase order ID from model
      poDate: item?.RaisedDate || "0001-01-01",
      poNumber: item?.PurchaseOrderNo || "",
      // podid: "", //purchase order ID from model
      markUpPercent: 0,
      otherCharges: item?.otherCharges || 0,
      fileRemark: "",
      // purchaseOrderDetailID: 0,
      id: item?.ID,
      manufactureDate: item.ManufactureDate || new Date(),
      manufactureName: item.manufacturer?.label || item.ManufacturerName,
      SaleTaxTypeName: item?.SalesTaxGroupName,
      IsUpdatePurchaseTaxPercent: item?.IsUpdatePurchaseTaxPercent,
      IsUpdateSaleTaxPercent: item?.IsUpdateSaleTaxPercent,
    });
  });
  return {
    dataInvoice: dataInvoice,
    dataItemDetails: dataItemDetails,
    isConsignment: pathName === "/ConsignmentReceive" ? 1 : 0,
    documentBase64: "",
  };
};

export const IssueToPatientPayload = (
  values,
  tableData,
  SearchPatient,
  totalCost,
) => {
  const data = SearchPatient?.patientDetail;
  const pageUrl = window?.location.pathname;
  const ipAddress = useLocalStorage("ip", "get");
  const medicineData = tableData.map((item) => ({
    ConsignmentID: item?.ID,
    quantity: item?.qty,
    supplierID: item?.VendorID,
    pageURL: pageUrl,
    IpAddress: ipAddress,
  }));

  const patientIssueData = [
    {
      patientid: data?.PatientID,
      transactionid: data?.TransactionID,
      panelid: data?.PanelID,
      patienttype: data?.PatientType,
      totalamount: totalCost,
      ipdCaseTypeID: SearchPatient?.BindConsignment?.IPDCaseTypeID,
      roomID: SearchPatient?.BindConsignment?.RoomID,
      doctorid: Number(data?.DoctorID),
      doctorName: data?.DoctorName,
      patientName: data?.PatientName,
      contactNo: data?.ContactNo,
      age: data?.AgeGender?.split("/")[0],
      gender: data?.AgeGender?.split("/")[1],
      address: data?.Address,
    },
  ];

  return {
    medicines: medicineData,
    patientIssue: patientIssueData,
  };
};

export const SaveAssetMappingPayload = (list, values) => {
  let payload = list?.map((val) => ({
    CentreID: Number(values?.Centre?.value || 0),
    SubcategoryID: Number(values?.Subcategory?.value || 0),
    ItemID: Number(val?.ItemID || 0),
    ItemName: val?.ItemName || "",
    Dept: val?.FinDeptCode || "",
    PurchaseCOAID: Number(val?.PurchaseCOAID || 0),
    OpeningDr: Number(val?.OpeningCOAIDDr || 0),
    OpeningCr: Number(val?.OpeningCOAIDCr || 0),
    AccDepDr: Number(val?.AccDepreCOAIDDr || 0),
    AccDepCr: Number(val?.AccDepreCOAIDCr || 0),
    MonthlyDepDr: Number(val?.MonthlyDepreCOAIDDr || 0),
    MonthlyDepCr: Number(val?.MonthlyDepreCOAIDCr || 0),
    SaleAssetDr: Number(val?.SaleAssetDr || 0),
    SaleAssetCr: Number(val?.SaleAssetCr || 0),
    SaleDepDr: Number(val?.SaleDepreDr || 0),
    SaleDepCr: Number(val?.SaleDepreCr || 0),
    SaleSaleCr: Number(val?.SaleSaleCr || 0),
    WriteOffAssetDr: Number(val?.WriteOffAssetDr || 0),
    WriteOffAssetCr: Number(val?.WriteOffAssetCr || 0),
    WriteOffDepDr: Number(val?.WriteOffDepreDr || 0),
    WriteOffDepCr: Number(val?.WriteOffDepreCr || 0),
  }));

  return { Items: payload };
};

export const handleTotalTable = (data, key) => {
  return data?.reduce((acc, curr) => acc + Number(curr[key]), 0);
};

export const SavescreenbuilderPayload = (
  fields,
  formDetails,
  tableColumnList,
) => {
  let controlList = fields?.map((field, index) => {
    let tableHeader = "";
    if (field?.type === "grid") {
      tableHeader = JSON.stringify(tableColumnList);
    } else if (field?.type === "select" || field?.type === "multiselect") {
      const extra =
        field?.dependantControl?.length > 0
          ? { ...field.dependantControl[0] }
          : {};
      Object.keys(field).forEach((key) => {
        if (key.includes("^")) {
          extra[key] = field[key];
        }
      });
      if (Object.keys(extra).length > 0) {
        tableHeader = JSON.stringify(extra);
      }
    }
    debugger;
    return {
      apiurlid: field?.apiName?.ID,
      // "accordionName": field?.type === "button" ? field?.isTypeAPI : field?.isAddEnable ? JSON.stringify(field?.addEnabledController) : "",
      accordionName:
        field?.type === "button"
          ? field?.isTypeAPI
          : field?.isAddEnable
            ? JSON.stringify(field?.addEnabledController)
            : "",
      controlName: field?.KeyName?.split("$")[0],
      displayName: field?.lable,
      commonControlName: field?.KeyName,
      type: field?.type,
      isMandatory: field?.IsMandatory ? 1 : 0,
      isReadOnly: 0,
      isDisabled: field?.isDisabled ? 1 : 0,
      isAddEnable: field?.isAddEnable ? 1 : 0,
      sequenceNo: index + 1,
      className: field?.respclass,
      defaultValue: field?.value,
      OptionLabelKey: field?.setLabelKey,
      OptionValueKey: field?.setValueKey,
      respClass: field?.id,
      commonAPITypeID: field?.getValueKey?.TypeID || 0,
      isShowCount: field?.isshowcount ? 1 : 0,
      isCapital: field?.iscapital ? 1 : 0,
      isNumberOnly: field?.isInputTypeNumber ? 1 : 0,
      // "ExtraParameter": field?.AddInMultigridControl ? `AddInMultigridControl_${field?.AddInMultigridControl}` : field?.isFilterEnable ? field?.isFilterEnable : "",
      ExtraParameter: JSON.stringify({
        AddInMultigridControl: field?.AddInMultigridControl,
        isFilterEnable: field?.isFilterEnable,
        isAllOption: field?.isAllOption,
        maxLength: field?.maxLength,
      }),
      IsExcel: field?.IsExcel ? 1 : 0,
      IsPdf: field?.IsPdf ? 1 : 0,
      IsSerialNumber: field?.IsSerialNumber ? 1 : 0,
      isSearchable: field?.IsSearchable ? 1 : 0,
      isTotalRow: field?.IsTotalRow ? 1 : 0,
      isColorCoding: field?.IsColorCoding ? 1 : 0,
      tableHeader: tableHeader,
    };
  });
  return {
    "urlName": `${formDetails?.formName?.split(" ").join("_")}`,
    "vUrlID": formDetails?.vUrlID || 0,
    "displayName": formDetails?.formName || "",
    "menuID": formDetails?.menuList?.value || 0,
    "isDynamicScreen": 1,
    "roleIdList": formDetails?.roleList?.map((role) => ({ roleID: role })),
    "controlList": controlList
  }
}


export const sanitizeFieldId = (id) => {
  if (!id) return 'field_unknown';
  return id
    .toString()
    .replace(/[^a-zA-Z0-9-_]/g, '_')
    .replace(/^[^a-zA-Z]/, 'field_')
    .replace(/_+/g, '_');
};

const parseExtraParameter = (extraParam) => {
  try {
    return JSON.parse(extraParam || "{}");
  } catch (error) {
    return {};
  }
};

export const transformApiDataToFields = async (apiData, apiDataCache = {}, getFormBuilderAPIList) => {
  const fields = [];

  // First pass: collect all unique API calls needed
  const uniqueApis = new Map();

  apiData.forEach((item) => {
    if (item.url && item.Type !== "button" && !apiDataCache[item.url?.replace("/", "")]) {
      uniqueApis.set(item.url, {
        url: item.url,
        method: item.method,
        defaultPayload: item.DefaultPayload,
        payload: item.payload,
      });
    }
  });

  // Make all API calls in parallel
  const apiResults = {};
  if (uniqueApis.size > 0) {
    const apiPromises = Array.from(uniqueApis.entries()).map(async ([url, apiInfo]) => {
      try {
        let data = {};
        if (apiInfo.method?.toLowerCase() === "get") {
          data = await getFormBuilderAPIList(
            `${apiInfo.url}${apiInfo.defaultPayload ? `?${apiInfo.defaultPayload}` : ""}`
          );
        } else if (apiInfo.method?.toLowerCase() === "post") {
          data = await getFormBuilderAPIList(
            apiInfo.url,
            apiInfo.method,
            apiInfo.defaultPayload ? JSON.parse(apiInfo.defaultPayload) : {}
          );
        }
        apiResults[url.replace("/", "")] = data?.success ? data.data : [];
      } catch (error) {
        console.error(`Error fetching API ${url}:`, error);
        apiResults[url.replace("/", "")] = [];
      }
    });

    await Promise.all(apiPromises);
  }

  // Merge with cached data
  const allApiData = { ...apiDataCache, ...apiResults };

  // Second pass: transform each item to field format
  for (const item of apiData) {
    const extraParams = parseExtraParameter(item.ExtraParameter);

    const field = {
      id: sanitizeFieldId(item.respClass),
      originalId: item.respClass,
      type: item.Type || "input",
      lable: item.DisplayName || "",
      name: item.ControlName || "name",
      className: "form-control",
      placeholder: " ",
      respclass: item.className || "col-xl-2 col-md-4 col-sm-6 col-12",
      value: item.defaultValue || "",
      dynamicOptions: [],
      apiName: "",
      isTypeAPI: "",
    };

    // Add KeyName if CommonControlName exists
    if (item.CommonControlName) {
      field.KeyName = item.CommonControlName;
    }

    // Add mandatory flag
    if (item.IsMandatory === 1) {
      field.IsMandatory = true;
    }

    // Add disabled flag
    if (item.IsDisabled === 1) {
      field.isDisabled = true;
    }

    // Add readonly flag
    if (item.IsReadOnly === 1) {
      field.isReadOnly = true;
    }

    // Add AddInMultigridControl from ExtraParameter
    if (extraParams.AddInMultigridControl) {
      field.AddInMultigridControl = true;
    }

    // Type-specific handling
    switch (item.Type) {
      case "input":
        if (item.IsNumberOnly === 1) {
          field.isInputTypeNumber = true;
        }
        if (item.MaxLength > 0) {
          field.maxLength = item.MaxLength.toString();
          field.isMaxLength = true;
        } else if (extraParams.maxLength) {
          field.maxLength = extraParams.maxLength.toString();
          field.isMaxLength = true;
        }
        if (item.IsCapital === 1) {
          field.iscapital = true;
        }
        if (item.IsShowCount === 1) {
          field.isshowcount = true;
        }
        break;

      case "select":
      case "multiselect":
        // Set API details
        if (item.APIURLID) {
          field.apiName = {
            ID: item.APIURLID,
            APIName: item.DisplayName || "",
            url: item.url || "",
            method: item.method || "GET",
            payload: item.payload || "",
            IsTypeID: item.IsTypeID || 0,
            DefaultPayload: item.DefaultPayload || "",
            IsSaveAPI: item.IsSaveAPI || 0,
            label: item.DisplayName || "",
            value: item.url || "",
          };

          // Set label and value keys
          field.setLabelKey = item.OptionLabelKey || "";
          field.setValueKey = item.OptionValueKey || "";

          // Set type API flag
          if (item.IsTypeID === 1) {
            field.isTypeAPI = "Y";
            field.typeIDName = "TypeID";
            field.commonAPITypeID = item.CommonAPITypeID || 0;

            // BIND getValueKey from CommonAPITypeID for "Get Section" in RightPanel
            if (item.CommonAPITypeID) {
              field.getValueKey = {
                label: item.CommonAPITypeID,
                value: item.CommonAPITypeID,
                TypeID: item.CommonAPITypeID,
              };
            }
          }

          // Get dynamic options from API data
          const apiKey = item.url?.replace("/", "");
          if (allApiData[apiKey]) {
            field.dynamicOptions = transformApiResponseToOptions(
              allApiData[apiKey],
              item.IsTypeID,
              item.CommonAPITypeID,
              item.OptionLabelKey,
              item.OptionValueKey
            );
          }
        }

        // Extra parameters
        if (extraParams.isFilterEnable) {
          field.isFilterEnable = true;
        }
        if (extraParams.isAllOption) {
          field.isAllOption = true;
        }
        if (item.IsSearchable === 1) {
          field.isSearchable = true;
        }

        // Handle AddEnable functionality
        if (item.IsAddEnable === 1) {
          field.isAddEnable = true;

          let controllerConfig = null;

          if (item.AccordionName) {
            try {
              controllerConfig = JSON.parse(item.AccordionName);
            } catch (error) {
              console.warn('Failed to parse AccordionName for addEnabledController:', error);
            }
          }

          if (!controllerConfig && extraParams.addEnabledController) {
            controllerConfig = extraParams.addEnabledController;
          }

          if (controllerConfig) {
            field.addEnabledController = {
              controllerName: controllerConfig.controllerName || [{}],
              addEnableControllerApi: controllerConfig.addEnableControllerApi || "",
              APIName: controllerConfig.APIName || "",
              method: controllerConfig.method || "POST",
              payload: controllerConfig.payload || ""
            };
          } else {
            field.addEnabledController = {
              controllerName: [{}],
              addEnableControllerApi: "",
              APIName: "",
              method: "POST",
              payload: ""
            };
          }
        }

        // BIND hide controls from TableHeader
        // Format: {"OptionLabel^FieldDisplayName": ["key1$$type$1", null, "key2$$type$1"]}
        // e.g.  : {"No^Login Required": ["Password$$text$1", "UserName$$text$1"]}
        if (item.TableHeader) {
          try {
            const tableHeaderData = JSON.parse(item.TableHeader);

            // Each key becomes a property on the field object
            // e.g. field["No^Login Required"] = [{ name: "Password", code: "Password$$text$1" }, ...]
            Object.entries(tableHeaderData).forEach(([key, hiddenFields]) => {
              if (Array.isArray(hiddenFields)) {
                field[key] = hiddenFields
                  .filter(Boolean) // remove nulls
                  .map((val) => ({
                    name: val?.split("$")[0],  // "Password"
                    code: val,                 // "Password$$text$1"
                  }));
              }
            });

            // Set fieldConfigType to the first key's option label
            // so RightPanel dropdown shows the correct selected option
            const firstKey = Object.keys(tableHeaderData)[0];
            if (firstKey) {
              const optionLabel = firstKey.split("^")[0]; // "No"

              // Find the matching option from dynamicOptions instead of building a minimal object
              const matchingOption = field.dynamicOptions?.find(
                (opt) => opt.label === optionLabel || opt.TextField === optionLabel
              );

              field.fieldConfigType = matchingOption || {
                label: optionLabel,
                value: optionLabel,
              };
            }

          } catch (error) {
            console.warn("Failed to parse TableHeader for hide controls:", error);
          }
        }

        break;

      case "grid":
      case "table":
        if (item.url) {
          field.apiName = {
            ID: item.APIURLID,
            APIName: item.DisplayName || "",
            url: item.url || "",
            method: item.method || "GET",
            payload: item.payload || "",
            IsTypeID: item.IsTypeID || 0,
            DefaultPayload: item.DefaultPayload || "",
            IsSaveAPI: item.IsSaveAPI || 0,
            label: item.DisplayName || "",
            value: item.url || "",
          };

          const apiKey = item.url?.replace("/", "");
          if (allApiData[apiKey]) {
            field.gridDatalist = allApiData[apiKey];
          } else {
            field.gridDatalist = [];
          }
        }

        if (item.TableHeader) {
          try {
            field.tableHeaders = JSON.parse(item.TableHeader);
          } catch (error) {
            field.tableHeaders = [];
          }
        }

        if (item.IsPdf === 1) field.isPdfExport = true;
        if (item.IsExcel === 1) field.isExcelExport = true;
        if (item.IsTotalRow === 1) field.showTotalRow = true;
        if (item.IsSerialNumber === 1) field.showSerialNumber = true;
        if (item.IsColorCoding === 1) field.isColorCoding = true;
        break;

      case "button":
        if (item.APIURLID) {
          field.apiName = {
            ID: item.APIURLID,
            APIName: item.DisplayName || "",
            url: item.url || "",
            method: item.method || "POST",
            payload: item.payload || "",
            IsTypeID: item.IsTypeID || 0,
            DefaultPayload: item.DefaultPayload || "",
            IsSaveAPI: item.IsSaveAPI || 1,
            label: item.DisplayName || "",
            value: item.APIURLID || 0,
          };
          field.isTypeAPI = "Save";
        }
        if (item.AccordionName) {
          field.buttonLabel = item.AccordionName;
        }
        break;

      case "heading":
        break;

      case "accordion":
        if (item.AccordionName) {
          field.accordionName = item.AccordionName;
        }
        break;

      case "textarea":
        if (item.MaxLength > 0) {
          field.maxLength = item.MaxLength.toString();
          field.isMaxLength = true;
        } else if (extraParams.maxLength) {
          field.maxLength = extraParams.maxLength.toString();
          field.isMaxLength = true;
        }
        break;

      case "checkbox":
        break;

      case "datepicker":
      case "timepicker":
        break;

      default:
        break;
    }

    fields.push(field);
  }

  return { fields, apiDataCache: allApiData };
};


const transformApiResponseToOptions = (
  apiData,
  isTypeID,
  commonAPITypeID,
  labelKey,
  valueKey
) => {
  if (!apiData || !Array.isArray(apiData)) {
    return [];
  }

  let filteredData = apiData;

  if (isTypeID === 1 && commonAPITypeID) {
    filteredData = apiData.filter(item => item.TypeID === commonAPITypeID);
  }

  return filteredData.map(item => ({
    ...item,
    label: item[labelKey] || "",
    value: item[valueKey] ?? "",
  }));
};

export const extractSaveApiDetails = (apiData) => {
  const saveButton = apiData.find(item => item.Type === "button" && item.IsSaveAPI === 1);

  if (saveButton) {
    return {
      ID: saveButton.APIURLID || 0,
      APIName: saveButton.DisplayName || "",
      url: saveButton.url || "",
      method: saveButton.method || "POST",
      payload: saveButton.payload || "",
      IsTypeID: saveButton.IsTypeID || 0,
      DefaultPayload: saveButton.DefaultPayload || "",
      IsSaveAPI: saveButton.IsSaveAPI || 1,
      label: saveButton.DisplayName || "",
      value: saveButton.APIURLID || 0,
    };
  }

  return null;
};

export const extractFormMetadata = (formData) => {
  if (!formData) return {};

  return {
    menuList: { value: formData.FilterField1 },
    roleList: formData.PrintOrder ? formData.PrintOrder.split(",").map(v => Number(v)) : [],
    formName: formData.label || formData.TextField || "",
    vUrlID: formData.value || formData.ValueField || 0,
    urlName: `${formDetails?.formName?.split(" ").join("_")}`,
    vUrlID: 0,
    displayName: formDetails?.formName || "",
    menuID: formDetails?.menuList?.value || 0,
    isDynamicScreen: 1,
    roleIdList: formDetails?.roleList?.map((role) => ({ roleID: role })),
    controlList: controlList,
  };
};

export const getCurrentPath = () => {
 return window.location.pathname;
};

