// Bundled sample/dummy data used ONLY by the Preview & Print tab (Phase 1 has no real
// patient/bill lookup). Keys match the tokens returned by GetFieldTokens.

export const SAMPLE_FIELD_VALUES = {
  RateTypeID: "3", RateTypeCode: "GEN", RateTypeName: "General", RateTypeMobile: "-", RateTypeAddress: "-",
  DoctorName: "Dr. R. Iyer, MD", PatientTitle: "Mrs.", PatientName: "Asha Verma", Age: "46 Y",
  DOB: "12-Mar-1980", Gender: "Female", Mobile: "+91 98xxx xxx21", Address: "B-402, Shipra Srishti, Indirapuram",
  PatientCode: "PAT-004871", VisitNo: "V-2026-18452", BillNo: "BILL-2026-09314", ReceiptNo: "RCP-2026-07731",
  RegDate: "18-Jul-2026", RegTime: "08:42 AM", DueAmount: "400.00", Country: "India", PassportNo: "-",
  SecondReferralDoctor: "Dr. Neha Kapoor", ReferLab: "-", ReceiptPrintType: "Original",
  ReportDeliveryMode: "WhatsApp + Email", BillingRemark: "Senior citizen discount applied",
  BarcodeNo: "LAB-2026-04871", TRFNo: "TRF-2214", Height: "158 cm", Weight: "62 kg",
  EmailID: "asha.verma@example.com", PRO_Billing: "Sunita Devi", PRO_Doctor: "Rakesh (PRO)",
  PRO_RateType: "-", PhleboName: "Kiran B.",
  CreatedBy: "Ravi Sharma", CreatedOn: "18-Jul-2026 08:44", PrintedBy: "Ravi Sharma",
  UserName: "PAT004871", Password: "••••••••", OnlinelabLink: "reports.example.in/r/LAB-2026-04871",
};

export const SAMPLE_LINE_ITEMS = [
  { sr: 1, dept: "Hematology", code: "CBC01", item: "Complete Blood Count", incl: [], rate: 350, qty: 1, disc: 0, token: "T-12", delivery: "18-Jul 06 PM", scan: "-", barcode: "LAB-2026-04871A" },
  { sr: 2, dept: "Package", code: "PKG07", item: "Aarogya Basic Health Package", incl: ["CBC", "Liver Function Test", "Kidney Function Test", "Lipid Profile"], rate: 1800, qty: 1, disc: 200, token: "T-12", delivery: "19-Jul 01 PM", scan: "-", barcode: "LAB-2026-04871B" },
  { sr: 3, dept: "Immunoassay", code: "TSH01", item: "TSH (Ultrasensitive)", incl: [], rate: 450, qty: 1, disc: 0, token: "T-12", delivery: "18-Jul 06 PM", scan: "-", barcode: "LAB-2026-04871C" },
  { sr: 4, dept: "Immunoassay", code: "VTD01", item: "Vitamin D (25-OH)", incl: [], rate: 1200, qty: 1, disc: 100, token: "T-12", delivery: "19-Jul 01 PM", scan: "-", barcode: "LAB-2026-04871D" },
];

export const SAMPLE_SETTLEMENTS = [
  { sr: 1, rtype: "Advance", rdate: "18-Jul-2026 08:44", mode: "Cash", amount: 2000, txn: "-", user: "Ravi Sharma", userid: "12" },
  { sr: 2, rtype: "Settlement", rdate: "18-Jul-2026 09:10", mode: "UPI", amount: 1000, txn: "UPI829441027365", user: "Ravi Sharma", userid: "12" },
];

export const SAMPLE_DISCOUNT_ON_TOTAL = 100;

export const resolveToken = (token, centre) => {
  const key = String(token || "").replace(/[{}]/g, "");
  if (key === "now") {
    return new Date().toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  }
  if (key === "Centre") return centre?.name ?? `{${key}}`;
  if (key === "CentreCode") return centre?.code ?? `{${key}}`;
  if (key === "CentreAddress") return centre?.addr ?? `{${key}}`;
  if (key === "CentreMobile") return centre?.mob ?? `{${key}}`;
  if (key === "CentreID") return String(centre?.id ?? `{${key}}`);
  if (key === "PrintedOn") {
    return new Date().toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  }
  return SAMPLE_FIELD_VALUES[key] ?? `{${key}}`;
};
