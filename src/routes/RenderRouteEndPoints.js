import Layout from "@app/layouts";
import Authenticated from "@app/Guard/Authenticated.jsx";
import { lazy } from "react";

export const FormBuilderRoutes = [
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/FormBuilder",
    component: lazy(() => import("../pages/FormBuilder/FormBuilder.jsx")),
    exact: true,
  },
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/FormPreview",
    component: lazy(() => import("../pages/FormBuilder/FormRenderer.jsx")),
    exact: true,
  },
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/ManageForms",
    component: lazy(() => import("../pages/FormBuilder/ManageForms.jsx")),
    exact: true,
  },
];

export const Logistic = [
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/logisticFieldBoyMapping",
    component: lazy(
      () => import("../Frontend/LogisticsPages/LogisticFieldBoyMapping.jsx")
    ),
    exact: true,
  },
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/LogisticRouteMaster",
    component: lazy(
      () => import("../Frontend/LogisticsPages/LogisticRouteMaster.jsx")
    ),
    exact: true,
  },
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/LogisticReceive",
    component: lazy(
      () => import("../Frontend/LogisticsPages/LogisticReceive.jsx")
    ),
    exact: true,
  },
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/FieldBoyTracking",
    component: lazy(
      () => import("../Frontend/LogisticsPages/FieldBoyTracking.jsx")
    ),
    exact: true,
  },
];

export const TargetSheet = [
  {
    // Guard: Authenticated,
    layout: Layout,
    path: "/sales/target-sheet",
    component: lazy(() => import("../Frontend/TargetSheet/TargetSheet.jsx")),
    exact: true,
  },
];

export const EQAS = [
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/eqas/provider-master",
    component: lazy(() => import("../Frontend/EQAS/EQASProviderMaster.jsx")),
    exact: true,
  },
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/eqas/program-lab-mapping",
    component: lazy(() => import("../Frontend/EQAS/ProgramLabMapping.jsx")),
    exact: true,
  },
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/eqas/registration",
    component: lazy(() => import("../Frontend/EQAS/EQASRegistration.jsx")),
    exact: true,
  },
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/eqas/result-entry",
    component: lazy(() => import("../Frontend/EQAS/EqasResultEntry.jsx")),
    exact: true,
  },
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/eqas/result-reject",
    component: lazy(() => import("../Frontend/EQAS/EQASResultReject.jsx")),
    exact: true,
  },
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/eqas/result-report",
    component: lazy(() => import("../Frontend/EQAS/EQASReport.jsx")),
    exact: true,
  },
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/eqas/result-comp-report",
    component: lazy(() => import("../Frontend/EQAS/EQASComparisonReport.jsx")),
    exact: true,
  },
];

export const cashFlowRoutes = [
  {
    // Guard: Authenticated,
    layout: Layout,
    path: "/CashTransfer",
    component: lazy(
      () => import("../Frontend/CashFlow/cashTransfer/CashTransfer.jsx")
    ),
    exact: true,
  },
  {
    // Guard: Authenticated,
    layout: Layout,
    path: "/CashReceive",
    component: lazy(
      () => import("../Frontend/CashFlow/cashReceive/CashReceive.jsx")
    ),
    exact: true,
  },
  {
    // Guard: Authenticated,
    layout: Layout,
    path: "/CashTransferMaster",
    component: lazy(
      () =>
        import("../Frontend/CashFlow/cashTransferMaster/CashTransferMaster.jsx")
    ),
    exact: true,
  },
  {
    // Guard: Authenticated,
    layout: Layout,
    path: "/CashFlowTransfer",
    component: lazy(
      () => import("../Frontend/CashFlowModule/CashTransfer/CashTransfer.jsx")
    ),
    exact: true,
  },
  {
    // Guard: Authenticated,
    layout: Layout,
    path: "/CashFlowReceive",
    component: lazy(
      () => import("../Frontend/CashFlowModule/CashReceive/CashReceive.jsx")
    ),
    exact: true,
  },
  {
    // Guard: Authenticated,
    layout: Layout,
    path: "/CashFlowTransferMaster",
    component: lazy(
      () =>
        import("../Frontend/CashFlowModule/CashTransferMaster/CashTransferMaster.jsx")
    ),
    exact: true,
  },
  {
    // Guard: Authenticated,
    layout: Layout,
    path: "/CashBalanceReportDateWise",
    component: lazy(
      () =>
        import(
          "../Frontend/CashFlow/cashBalanceReportDateWise/CashBalanceReportDateWise.jsx"
        )
    ),
    exact: true,
  },
  {
    // Guard: Authenticated,
    layout: Layout,
    path: "/Cashflowdashboard",
    component: lazy(
      () =>
        import("../Frontend/CashFlow/cashFlowDashboard/CashFlowDashboard.jsx")
    ),
    exact: true,
  },
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/RouteMaster",
    component: lazy(() => import("../Frontend/HomeCollection/RouteMaster.jsx")),
    exact: true,
  },
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/LogisticPickupSummary",
    component: lazy(
      () => import("../Frontend/LogisticsPages/LogisticPickupSummary.jsx")
    ),
    exact: true,
  },
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/LogisticTatReport",
    component: lazy(
      () => import("../Frontend/LogisticsPages/LogisticTatReport.jsx")
    ),
    exact: true,
  },
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/LogisticInactiveCentreDetails",
    component: lazy(
      () =>
        import("../Frontend/LogisticsPages/LogisticInactiveCentreDetails.jsx")
    ),
    exact: true,
  },
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/FieldBoyTravelledDistance",
    component: lazy(
      () => import("../Frontend/LogisticsPages/FieldBoyTravelledDistance.jsx")
    ),
    exact: true,
  },
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/LogisticPanelDataSearch",
    component: lazy(
      () => import("../Frontend/LogisticsPages/LogisticPanelDataSearch.jsx")
    ),
    exact: true,
  },
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/ViewFeSelfieImage",
    component: lazy(
      () => import("../Frontend/LogisticsPages/ViewFeSelfieImage.jsx")
    ),
    exact: true,
  },
];
export const FamilyMembershipCardRoutes = [
  {
    // Guard: Authenticated,
    layout: Layout,
    path: "/FamilyMemberPolicyDiscountMapping",
    component: lazy(
      () =>
        import(
          "../Frontend/FamilyMemberPolicyDiscountMapping/FamilyMemberPolicyDiscountMapping.jsx"
        )
    ),
    exact: true,
  },

  {
    // Guard: Authenticated,
    layout: Layout,
    path: "/FamilyMembershipMapping",
    component: lazy(
      () => import("../Frontend/FamilyMemberMapping/FamilyMemberMapping.jsx")
    ),
    exact: true,
  },
  {
    // Guard: Authenticated,
    layout: Layout,
    path: "/AddFamilyMember",
    component: lazy(
      () => import("../Frontend/FamilyMemberMapping/AddFamilyMember.jsx")
    ),
    exact: true,
  },
];

export const RadiologyRoutes = [
  {
    // Guard: Authenticated,
    layout: Layout,
    path: "/radiology-patient-preparation",
    component: lazy(
      () => import("../Frontend/Radiology/PatientPreparation.jsx")
    ),
  },
  {
    // Guard: Authenticated,
    layout: Layout,
    path: "/radiology-patient-transfer",
    component: lazy(
      () => import("../Frontend/Radiology/RadiologyPatientTransfer.jsx")
    ),
  },
  {
    // Guard: Authenticated,
    layout: Layout,
    path: "/radiology-case-assignment",
    component: lazy(() => import("../Frontend/Radiology/CaseAssignment.jsx")),
  },
  // ── Radiology Appointment module ──────────────────────────────────────────
  {
    // Guard: Authenticated,
    layout: Layout,
    path: "/radiology-appointment",
    component: lazy(
      () =>
        import("../Frontend/RadiologyAppointment/RadiologyAppointment.jsx")
    ),
  },
  {
    // Guard: Authenticated,
    layout: Layout,
    path: "/radiology-block-slot-master",
    component: lazy(
      () => import("../Frontend/RadiologyAppointment/BlockSlotMaster.jsx")
    ),
  },
  {
    // Guard: Authenticated,
    layout: Layout,
    path: "/radiology-block-slot-report",
    component: lazy(
      () => import("../Frontend/RadiologyAppointment/BlockSlotReport.jsx")
    ),
  },
  {
    // Guard: Authenticated,
    layout: Layout,
    path: "/radiology-slot-bifurcation",
    component: lazy(
      () => import("../Frontend/RadiologyAppointment/SlotBifurcation.jsx")
    ),
  },
  {
    // Guard: Authenticated,
    layout: Layout,
    path: "/radiology-centre-department-master",
    component: lazy(
      () =>
        import("../Frontend/RadiologyAppointment/CentreDepartmentMaster.jsx")
    ),
  },
  {
    // Guard: Authenticated,
    layout: Layout,
    path: "/mac-machine-slot-master",
    component: lazy(
      () => import("../Frontend/RadiologyAppointment/MachineSlotMaster.jsx")
    ),
  },
  {
    // Guard: Authenticated,
    layout: Layout,
    path: "/combine-radiology-master",
    component: lazy(
      () => import("../Frontend/RadiologyAppointment/CombineRadiologyMaster.jsx")
    ),
  },
  {
    // Guard: Authenticated,
    layout: Layout,
    path: "/radiology-master",
    component: lazy(
      () => import("../Frontend/RadiologyAppointment/RadiologyMaster.jsx")
    ),
  },
  {
    // Guard: Authenticated,
    layout: Layout,
    path: "/modality-master-mis",
    component: lazy(
      () => import("../Frontend/RadiologyAppointment/ModalityMasterMIS.jsx")
    ),
  },
  {
    // Guard: Authenticated,
    layout: Layout,
    path: "/radiology-appointment-report",
    component: lazy(
      () => import("../Frontend/RadiologyAppointment/RadiologyAppointmentReport.jsx")
    ),
  },
  {
    // Guard: Authenticated,
    layout: Layout,
    path: "/ResultEntryRadiology",
    component: lazy(
      () => import("../Frontend/Radiology/ResultEntryRadiology.jsx")
    ),
  },
];

export const SampleStorageRoutes = [
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/SampleStorageTypeMaster",
    component: lazy(
      () =>
        import("../Frontend/SampleStorage/sampleStorageMaster/TrackMaster.jsx")
    ),
    exact: true,
  },
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/SampleStorageTrayMaster",
    component: lazy(
      () =>
        import("../Frontend/SampleStorage/sampleStorageMaster/TrayMaster.jsx")
    ),
    exact: true,
  },
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/SampleStorageDeviceMaster",
    component: lazy(
      () =>
        import("../Frontend/SampleStorage/sampleStorageMaster/DeviceMaster.jsx")
    ),
    exact: true,
  },
  {
    // Guard: Authenticated,
    layout: Layout,
    path: "/SampleStorage",
    component: lazy(
      () => import("../Frontend/SampleStorage/sampleStorage/Storage.jsx")
    ),
    exact: true,
  },
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/SampleIssue",
    component: lazy(
      () => import("../Frontend/SampleStorage/sampleStorage/Issue.jsx")
    ),
    exact: true,
  },
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/Samplediscard",
    component: lazy(
      () => import("../Frontend/SampleStorage/sampleStorage/Discard.jsx")
    ),
    exact: true,
  },
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/SampleStorageReport",
    component: lazy(
      () =>
        import(
          "../Frontend/SampleStorage/sampleStorage/SampleStorageReport.jsx"
        )
    ),
    exact: true,
  },
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/SampleTransfer",
    component: lazy(
      () =>
        import("../Frontend/SampleStorage/SampleTransfer/SampleTransfer.jsx")
    ),
    exact: true,
  },
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/SampleStorageNew",
    component: lazy(
      () => import("../Frontend/SampleStorageNew/index.jsx")
    ),
    exact: true,
  },
];

export const UHIDNewPatientRegister = [
  {
    // Guard: Authenticated,
    layout: Layout,
    path: "/newPatientRegister",
    component: lazy(
      () => import("../Frontend/Laboratory/NewPatientRegistration.jsx")
    ),
    exact: true,
  },
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/radiology-patient-preparation",
    component: lazy(
      () => import("../Frontend/Radiology/PatientPreparation.jsx")
    ),
  },
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/radiology-patient-transfer",
    component: lazy(
      () => import("../Frontend/Radiology/RadiologyPatientTransfer.jsx")
    ),
  },
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/radiology-case-assignment",
    component: lazy(() => import("../Frontend/Radiology/CaseAssignment.jsx")),
  },
];

export const NewReports = [
  {
    //   Guard: Authenticated,
    layout: Layout,
    path: "/dynamic-reports",
    component: lazy(
      () => import("../Frontend/Reports/Master/ReportFilters.jsx")
    ),
    exact: true,
  },
];

export const ESG = [
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/environmental-data-management",
    component: lazy(
      () =>
        import("../Frontend/ESG/Environmental/EnvironmentalDataManagement.jsx")
    ),
  },
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/social-data-management",
    component: lazy(
      () => import("../Frontend/ESG/Social/SocialDataManagement.jsx")
    ),
  },
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/governance-data-management",
    component: lazy(
      () => import("../Frontend/ESG/Governance/GovernanceDataManagement.jsx")
    ),
  },
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/risk-register",
    component: lazy(
      () => import("../Frontend/ESG/RiskRegister/RiskRegister.jsx")
    ),
  },
];

export const ESGReports = [
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/esg-reports",
    component: lazy(
      () =>
        import("../Frontend/ESG/ESGReports/ESGReports.jsx")
    ),
  },
  
];

export const SRA = [
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/SampleCollection",
    component: lazy(
      () => import("../Frontend/Laboratory/SampleCollection.jsx")
    ),
    exact: true,
  },
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/SRA",
    component: lazy(() => import("../Frontend/Laboratory/SRA.jsx")),
    exact: true,
  },
  {
    // Guard: Authenticated,
    layout: Layout,
    path: "/SRASampleTransfer",
    component: lazy(() => import("../Frontend/Laboratory/SampleTransfer.jsx")),
    exact: true,
  },
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/LogisticSampleReceive",
    component: lazy(
      () => import("../Frontend/Laboratory/LogisticSampleReceive.jsx")
    ),
    exact: true,
  },
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/SDRTransfer",
    component: lazy(() => import("../Frontend/Laboratory/SDRTransfer.jsx")),
    exact: true,
  },
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/SampleReceiveDepartment",
    component: lazy(
      () => import("../Frontend/Laboratory/SampleReceiveDepartment.jsx")
    ),
    exact: true,
  },
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/SampleTransferReport",
    component: lazy(
      () => import("../Frontend/Laboratory/SampleTransferReport.jsx")
    ),
    exact: true,
  },
];

export const CombineResultEntry = [
  {
    //   Guard: Authenticated,
    layout: Layout,
    path: "/combine-result-entry",
    component: lazy(
      () => import("../Frontend/Laboratory/CombineResultEntry.jsx")
    ),
    exact: true,
  },
];

export const LabWorksheet = [
  {
    //   Guard: Authenticated,
    layout: Layout,
    path: "/lab-worksheet",
    component: lazy(
      () => import("../Frontend/Reports/LabWorksheet.jsx")
    ),
    exact: true,
  },
];

export const CombineCollectionReport = [
  {
      Guard: Authenticated,
    layout: Layout,
    path: "/combine-collection-report",
    component: lazy(
      () => import("../Frontend/CombineCollectionReport/CombineCollectionReport.jsx")
    ),
    exact: true,
  },
];

export const InterfaceCompanyMasterRoutes = [
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/InterfaceCompanyMaster",
    component: lazy(() => import("../Frontend/InterfaceCompanyMaster/InterfaceCompanyMaster.jsx")),
    exact: true,
  },
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/CRMBookingData",
    component: lazy(() => import("../Frontend/InterfaceCompanyMaster/CRMBookingData.jsx")),
    exact: true,
  },
];

export const SmartReport = [
  {
      Guard: Authenticated,
    layout: Layout,
    path: "/SmartReportParameterMaster",
    component: lazy(
      () => import("../Frontend/SmartReport/SmartReportParameterMaster.jsx")
    ),
    exact: true,
  },
  {
      Guard: Authenticated,
    layout: Layout,
    path: "/SmartReportParameterMapping",
    component: lazy(
      () => import("../Frontend/SmartReport/ParameterMapping.jsx")
    ),
    exact: true,
  },
];

export const ManagerSOP = [
  {
      Guard: Authenticated,
    layout: Layout,
    path: "/Manage-SOP",
    component: lazy(
      () => import("../Frontend/Laboratory/ManageSOP.jsx")
    ),
    exact: true,
  },
  {
      // Guard: Authenticated,
    layout: Layout,
    path: "/View-SOP",
    component: lazy(
      () => import("../Frontend/Laboratory/ViewSOP.jsx")
    ),
    exact: true,
  },
 
];

export const LabWorksheetReport = [
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/LabWorksheet-report",
    component: lazy(
      () => import("../Frontend/Laboratory/LabWorksheetReport.jsx")
    ),
    exact: true,
  },
]

export const HistoReport = [
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/Histo-report",
    component: lazy(
      () => import("../Frontend/Laboratory/HistoWorkSheet.jsx")
    ),
    exact: true,
  },
]

export const FeedbackReport = [
  {
      // Guard: Authenticated,
    layout: Layout,
    path: "/feedback-report",
    component: lazy(
      () => import("../Frontend/Laboratory/FeedbackReport.jsx")
    ),
    exact: true,
  },
]


export const CombineReports = [
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/combine-report-master",
    component: lazy(
      () => import("../Frontend/CombineReport/CombineReportMaster.jsx")
	   ),
    exact: true,
  },
   {
      // Guard: Authenticated,
    layout: Layout,
	    path: "/sub-report-master",
    component: lazy(
      () => import("../Frontend/CombineReport/SubReportMaster.jsx")
    ),
    exact: true,
  },
];

export const PolicyMaster = [
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/policy-master",
    component: lazy(
      () => import("../Frontend/Laboratory/PolicyMaster/PolicyMaster.jsx")
    ),
    exact: true,
  },
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/family-discount-master",
    component: lazy(
      () => import("../Frontend/Laboratory/PolicyMaster/FamilyDiscountMaster.jsx")
    ),
    exact: true,
  },
];
export const B2B = [
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/dispatchLabReport-b2b",
    component: lazy(
      () => import("../Frontend/Laboratory/B2BDispatchReport.jsx")
    ),
    exact: true,
  },
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/receiptReprint-b2b",
    component: lazy(
      () => import("../Frontend/Laboratory/B2BReceiptReprint.jsx")
    ),
    exact: true,
  },
  {
    // Guard: Authenticated,
    layout: Layout,
    path: "/clientwisebusinessreport-b2b",
    component: lazy(
      () => import("../Frontend/Reports/B2BClientwiseBusinessReport.jsx")
    ),
    exact: true,
  }
];
export const CombineWorkSheetReports = [
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/combine-worksheet-report",
    component: lazy(
      () => import("../Frontend/Laboratory/CombineLabWorksheet.jsx")
	   ),
    exact: true,
  },
  
];

export const CombineWorkSheetReports2 = [
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/combine-worksheet-report2",
    component: lazy(
      () => import("../Frontend/Laboratory/CombineWorksheet.jsx")
	   ),
    exact: true,
  },
  
];

export const NepalReports = [
   {
    Guard: Authenticated,
    layout: Layout,
    path: "/CombineNepalReport",
    component: lazy(
      () => import("../Frontend/Laboratory/CombineNepalReport.jsx")
	   ),
    exact: true,
  },
]

export const PatientInformationReport = [
   {
    // Guard: Authenticated,
    layout: Layout,
    path: "/combine-business-report",
    component: lazy(
      () => import("../Frontend/Laboratory/CombineBusinessReport.jsx")
	   ),
    exact: true,
  },
]

export const UpdateInvoiceShare = [
   {
    // Guard: Authenticated,
    layout: Layout,
    path: "/UpdateInvoiceShare",
    component: lazy(
      () => import("../Frontend/Master/UpdateInvoiceShare.jsx")
	   ),
    exact: true,
  },
]



export const LdplSmartPaymentGatewaythroughOtp = [
   {
    // Guard: Authenticated,
    // layout: Layout,
    path: "/LdplSmartPaymentGatewaythroughOtp",
    component: lazy(
      () => import("../pages/LdplSmartPaymentGatewaythroughOtp.jsx")
	   ),
    exact: true,
  },
]
// -----------Finance-----------

 export const FinanceRoutes = [
  // ---------- Voucher ----------
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/voucher-booking",
    component: lazy(() => import("../Frontend/Finance/Voucher/VoucherBooking.jsx")),
    // D:\LiveInnopath\src\Frontend\Finance\Voucher\VoucherBooking.jsx
    exact: true,
  },
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/session-master",
    component: lazy(() => import("../Frontend/Finance/Voucher/SessionMaster")),
    exact: true,
  },
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/cheque-deposit",
    component: lazy(() => import("../Frontend/Finance/Voucher/ChequeDeposit.jsx")),
    exact: true,
  },
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/cheque-bounce",
    component: lazy(() => import("../Frontend/Finance/Voucher/ChequeBounce.jsx")),
    exact: true,
  },
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/mapadvance-purchase",
    component: lazy(() =>
      import("../Frontend/Finance/Voucher/SupplierAdvanceMapping/SupplierAdvance.jsx"),
    ),
    exact: true,
  },
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/finance-supplier-installment",
    component: lazy(() =>
      import("../Frontend/Finance/Voucher/SupplierInstallment/SupplierInstallment.jsx"),
    ),
    exact: true,
  },

  // // ---------- Approval ----------
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/bank-reconciliation-verify",
    component: lazy(() => import("../Frontend/Finance/Approval/BankReconsilationVerify.jsx")),
    exact: true,
  },
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/vouchermapping-master",
    component: lazy(() =>
      import("../Frontend/Finance/Approval/UserWiseVoucher/VoucherLimit.jsx"),
    ),
    exact: true,
  },
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/cost-center-access",
    component: lazy(() => import("../Frontend/Finance/Approval/CostCenterAccess.jsx")),
    exact: true,
  },
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/sic-authorization",
    component: lazy(() =>
      import("../Frontend/Finance/Approval/SICReportTypeAuthorization.jsx"),
    ),
    exact: true,
  },
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/voucherposting-batch",
    component: lazy(() =>
      import("../Frontend/Finance/Approval/VoucherPostingBatch/VoucherBatch.jsx"),
    ),
    exact: true,
  },
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/voucher-audit",
    component: lazy(() => import("../Frontend/Finance/Approval/Audit/Audit.jsx")),
    exact: true,
  },

  // // ---------- Account / Financial Year ----------
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/financialyear-periodclosing",
    component: lazy(() =>
      import("../Frontend/Finance/Account/PeriodClosing/PeriodClosing.jsx"),
    ),
    exact: true,
  },
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/financialyear-bookclosing",
    component: lazy(() =>
      import("../Frontend/Finance/Account/FinancialYearBook/FinancialYearBook.jsx"),
    ),
    exact: true,
  },
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/financialyear-closing",
    component: lazy(() =>
      import("../Frontend/Finance/FinancialYearClosing/FinancialYearClosing.jsx"),
    ),
    exact: true,
  },

  // // ---------- Master ----------
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/consumeaccount-mapping",
    component: lazy(() => import("../Frontend/Finance/Master/Consumption/Consumption.jsx")),
    exact: true,
  },
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/chart-of-group",
    component: lazy(() => import("../Frontend/Finance/Master/ChartOfGroup/index.jsx")),
    exact: true,
  },
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/chart-of-account",
    component: lazy(() => import("../Frontend/Finance/Master/ChartOfAccount")),
    exact: true,
  },
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/entity-master",
    component: lazy(() => import("../Frontend/Finance/Master/EntityMaster/EntityMaster.jsx")),
    exact: true,
  },
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/currency-master",
    component: lazy(() =>
      import("../Frontend/Finance/Master/CurrencyMaster/CurrencyMaster.jsx"),
    ),
    exact: true,
  },
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/cost-centre-mapping",
    component: lazy(() =>
      import("../Frontend/Finance/Master/CostCentreMapping/CostCentreMapping.jsx"),
    ),
    exact: true,
  },
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/centrewise-coa-mapping",
    component: lazy(() =>
      import("../Frontend/Finance/Master/CenterWiseCOA/CenterWiseCOA.jsx"),
    ),
    exact: true,
  },
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/vouchertype-master",
    component: lazy(() =>
      import("../Frontend/Finance/Master/VoucherTypeMaster/Vouchermaster.jsx"),
    ),
    exact: true,
  },
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/finance-master-configuration",
    component: lazy(() =>
      import(
        "../Frontend/Finance/Master/financeMasterConfiguration/FinanceMasterConfiguration.jsx"
      ),
    ),
    exact: true,
  },
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/finance-collection-configuration",
    component: lazy(() =>
      import(
        "../Frontend/Finance/Master/financeMasterConfiguration/FinanceCollectionConfigurationMaster.jsx"
      ),
    ),
    exact: true,
  },
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/asset-finance-mapping",
    component: lazy(() => import("../Frontend/Finance/Master/AssetFinanceMapping.jsx")),
    exact: true,
  },
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/currency-conversion",
    component: lazy(() =>
      import("../Frontend/Finance/Master/ConversionCurrency/ConversionCurrency.jsx"),
    ),
    exact: true,
  },
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/finance-consumption-mapping",
    component: lazy(() =>
      import("../Frontend/Finance/Master/ConsumptionMapping/ConsumptionMapping.jsx"),
    ),
    exact: true,
  },
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/adjustment-process-mapping",
    component: lazy(() =>
      import(
        "../Frontend/Finance/Master/AdjustmentProcessMapping/AdjustmentProcessMapping.jsx"
      ),
    ),
    exact: true,
  },
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/cost-of-sale-mapping",
    component: lazy(() =>
      import("../Frontend/Finance/Master/CostOfSaleMapping/CostOfSaleMapping.jsx"),
    ),
    exact: true,
  },
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/fin-vs-hims-mapping",
    component: lazy(() =>
      import("../Frontend/Finance/Master/FinVsHimsMapping/FinVsHimsMapping.jsx"),
    ),
    exact: true,
  },
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/fin-vs-hims-subcat-mapping",
    component: lazy(() =>
      import(
        "../Frontend/Finance/Master/FinVsHimsSubCategoryMapping/FinVsHimsSubCategoryMapping.jsx"
      ),
    ),
    exact: true,
  },
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/fin-vs-hims-dept-item-mapping",
    component: lazy(() =>
      import(
        "../Frontend/Finance/Master/FinVsHimsDeptItemMapping/FinVsHimsDeptItemMapping.jsx"
      ),
    ),
    exact: true,
  },

  // // ---------- Tools ----------
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/bank-reconcile",
    component: lazy(() =>
      import("../Frontend/Finance/Tools/BankReconciliation/BankReconciliation.jsx"),
    ),
    exact: true,
  },
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/bank-charges-upload",
    component: lazy(() =>
      import("../Frontend/Finance/Tools/BankCharges/BankChargesUpload.jsx"),
    ),
    exact: true,
  },
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/opening-balance-upload",
    component: lazy(() =>
      import("../Frontend/Finance/Tools/OpeningBalance/UploadOpeningBalance.jsx"),
    ),
    exact: true,
  },
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/openingbalance-upload-invoicewise",
    component: lazy(() =>
      import(
        "../Frontend/Finance/Tools/UploadOpeningBalanceInvoice/UploadBalanceInvoice.jsx"
      ),
    ),
    exact: true,
  },
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/balancetransfer",
    component: lazy(() =>
      import("../Frontend/Finance/Tools/BalanceTransfer/BalanceTransfer.jsx"),
    ),
    exact: true,
  },

  // // ---------- Books ----------
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/Account-books",
    component: lazy(() => import("../Frontend/Finance/Books/AccountBooks.jsx")),
    exact: true,
  },

  // // ---------- Petty Cash ----------
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/preetycash-accessmaster",
    component: lazy(() => import("../Frontend/Finance/PettyCash/PettyCashAccessMaster.jsx")),
    exact: true,
  },
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/pettycash-deptrequest",
    component: lazy(() => import("../Frontend/Finance/PettyCash/PettyCashDeptRequest.jsx")),
    exact: true,
  },
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/pettycash-deptapproval",
    component: lazy(() => import("../Frontend/Finance/PettyCash/PettyCashDeptApproval.jsx")),
    exact: true,
  },
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/pettycashdept-approvalverification",
    component: lazy(() =>
      import("../Frontend/Finance/PettyCash/PettyCashDeptApprovalVerification.jsx"),
    ),
    exact: true,
  },
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/pettycashdept-confirmation",
    component: lazy(() =>
      import("../Frontend/Finance/PettyCash/PettyCashDeptConfirmation.jsx"),
    ),
    exact: true,
  },
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/pettycash-posting",
    component: lazy(() => import("../Frontend/Finance/PettyCash/PettyCashPosting.jsx")),
    exact: true,
  },
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/pettycash-entry",
    component: lazy(() => import("../Frontend/Finance/PettyCash/PettyCashEntry.jsx")),
    exact: true,
  },

  // // ---------- Reports ----------
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/finance-reports",
    component: lazy(() => import("../Frontend/Finance/Reports/Index.jsx")),
    exact: true,
  },
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/trial-balance-report",
    component: lazy(() => import("../Frontend/Finance/Reports/TrialBalanceReport.jsx")),
    exact: true,
  },
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/receivable-statement-report",
    component: lazy(() => import("../Frontend/Finance/Reports/ReceivableStatement.jsx")),
    exact: true,
  },
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/chartofgroup-new",
    component: lazy(() => import("../Frontend/Finance/Reports/ChartOfGroupReport.jsx")),
    exact: true,
  },
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/general-ledger-report",
    component: lazy(() => import("../Frontend/Finance/Reports/GeneralLedger.jsx")),
    exact: true,
  },
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/purchase-bill-due-report",
    component: lazy(() => import("../Frontend/Finance/Reports/PurchaseBillDueReport.jsx")),
    exact: true,
  },
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/payable-statement-report",
    component: lazy(() => import("../Frontend/Finance/Reports/PayableStatementReport.jsx")),
    exact: true,
  },
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/bankreconciliation-report",
    component: lazy(() => import("../Frontend/Finance/Reports/BankReconciliationReport.jsx")),
    exact: true,
  },
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/payable-aging-summary",
    component: lazy(() => import("../Frontend/Finance/Reports/PayableAgingSummary.jsx")),
    exact: true,
  },
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/account-receible-agingsummary",
    component: lazy(() => import("../Frontend/Finance/Reports/ReceivableAgeing.jsx")),
    exact: true,
  },
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/payable-bankwise-report",
    component: lazy(() => import("../Frontend/Finance/Reports/PayableBankWise.jsx")),
    exact: true,
  },
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/finance-sic-report",
    component: lazy(() => import("../Frontend/Finance/Reports/SicReport.jsx")),
    exact: true,
  },

  // // ---------- Reprint ----------
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/voucher-reprint",
    component: lazy(() => import("../Frontend/Finance/Reprint/VoucherPrinting.jsx")),
    exact: true,
  },

  {
      Guard: Authenticated,
      layout: Layout,
      path: "/map-main-centre-to-branch",
      component: lazy(
        () =>
          import(
            "../Frontend/Finance/Master/MapMainCentreToBranch/MapMainCentreToBranch.jsx"
          ),
      ),
      exact: true,
    },
]

export const NABLDocumentControl = [
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/nabl-document-control",
    component: lazy(
      () => import("../Frontend/NABLDocumentControl/NABLDocumentControl.jsx")
    ),
    exact: true,
  },
];


export const EquipmentManagementRoutes = [
  {
    Guard: Authenticated,
    layout: Layout,
    path: "/equipment-management",
    component: lazy(
      () => import("../Frontend/EquipmentManagement/EquipmentManagement.jsx"),
    ),
    exact: true,
  },
  {
    // Public — no Guard, no Layout. Opens when a QR code is scanned.
    // No session parameter: the hash alone identifies the equipment.
    path: "/eq/:hash",
    component: lazy(
      () => import("../Frontend/EquipmentManagement/EquipmentScanPage.jsx"),
    ),
    exact: true,
  },
];
