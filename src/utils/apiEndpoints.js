const environment = import.meta.env.VITE_APP_ENVIRONMENT;

const allEnvApiUrls = {
  production: {
    baseUrl: import.meta.env.VITE_APP_REACT_APP_BASE_URL,
  },
  stagging: {
    baseUrl: import.meta.env.VITE_APP_REACT_APP_PROD_URL,
  },
  development: {
    baseUrl: import.meta.env.VITE_APP_REACT_APP_DEV_URL,
  },
};
console.log("envUrlenvironment", environment, allEnvApiUrls);

const envUrl = `${allEnvApiUrls[environment]?.baseUrl}/api/v1`;
console.log("envUrl", envUrl);

export const apiUrls = {
  FinanceBindCentre: "Finance/BindCentre",
  BindMappingDetails: "Finance/BindMappingDetails",
  RemoveMapping: "Finance/RemoveMapping",
  GetBindAllCenter: "/CommonAPI/BindAllCenter",
  bindVoucerListURL: "Finance/BindVoucherBillingScreenControls",
   GetBankChargesUploadExcel: "Finance/GetBankChargesUploadExcel",
   SearchAccountBookReport: "Finance/SearchAccountBookReport",
   SearchAccountBookReport: "Finance/SearchAccountBookReport",
   GetBalanceToTransafer: "Finance/GetBalanceToTransafer",
    GetBalanceToTransafer: "Finance/GetBalanceToTransafer",
  UploadBalanceTransfer: "Finance/UploadBalanceTransfer",
    GetBankReconciliationExcel: "Finance/GetBankReconciliationExcel",
  SaveOpeningBalance: "Finance/SaveOpeningBalance",
  GetOpeningBalanceToUpload: "Finance/GetOpeningBalanceToUpload",
  GetOpeningBalanceExcell: "Finance/GetOpeningBalanceExcell",
  BinduploadOpeningBalanceControls: "Finance/BinduploadOpeningBalanceControls",
  BalanceTransaferControls: "Finance/BalanceTransaferControls",
  UpdateReconciliation: "Finance/UpdateReconciliation",
  GetBankReconciliationExcel: "Finance/GetBankReconciliationExcel",
  GetStore: "Requisition/GetStore",
  GetHideRolesData: `Ticketing/GetHideRolesData`,
  SaveDataCategoryMaster: `Ticketing/SaveDataCategoryMaster`,
  SaveTicket: `Ticketing/SaveTicket`,
  GetDataCategoryMaster: `Ticketing/GetDataCategoryMaster`,
  UpdateDataCategoryMaster: `Ticketing/UpdateDataCategoryMaster`,
  UpdateCategoryTAT: `Ticketing/UpdateCategoryTAT`, 
  CategoryEmoloyeeDefaultSave: `Ticketing/CategoryEmoloyeeDefaultSave`,
  BindCentre: `CommonController/BindCentre`,
  GetDataMaster: `Ticketing/GetDataMaster`,
  BindRole: `CommonController/BindRole`,

  // CashFlow — CashTransferMaster (new module)
  CTMSaveCashTransfer: `CashFlow/CashTransferMaster/SaveCashTransfer`,
  CTMSearchData: `CashFlow/CashTransferMaster/SearchData`,
  CTMDeactivate: `CashFlow/CashTransferMaster/Deactivate`,

  // CashFlow
  BindSearchType: `CashFlow/CashTransfer/BindSearchType`,
  CashTransferSearchData: `CashFlow/CashTransfer/SearchData`,
  SaveCashDeposit: `CashFlow/CashTransfer/SaveCashDeposit`,
  ExportCashDeposit: `CashFlow/CashTransfer/ExportCashDeposit`,
  CashReceiveSearchData: `CashFlow/CashReceive/SearchData`,
  SaveCashReceive: `CashFlow/CashReceive/SaveCashReceive`,
  RejectCashReceive: `CashFlow/CashReceive/RejectCashReceive`,
  ExportCashReceive: `CashFlow/CashReceive/ExportCashReceive`,
  GetDocumentDetail: `CashFlow/CashReceive/GetDocumentDetail`,
  GetSummary: `CashFlow/GetSummary`,
  GetUserByType: `CashFlow/GetUserByType`,
  CashDeposit: `CashFlow/CashDeposit`,
  CashReports: `CashFlow/Reports`,
  BindBusinessZone: `CashFlow/BindBusinessZone`,
  BindBusinessZoneWiseFieldBoy: `CashFlow/BindBusinessZoneWiseFieldBoy`,
  MasterManage: `CashFlow/MasterManage`,
  CancelReceive: `CashFlow/CancelReceive`,
  CashReceive: `CashFlow/CashReceive`,
  ReceivePending: `CashFlow/ReceivePending`,
  CashFlowDashboard: `CashFlow/CashFlowDashboard`,

// pettycash
  SavePettyCashTransfer: `Pettycash/SavePettyCashTransfer`,
  SearchPettyCash: `Pettycash/SearchPettyCash`,
  getbalance:`Pettycash/GetPettyCashBalance`,
  BindUser: `Ticketing/BindUser`,
  updatepettycash:`Pettycash/UpdatedPettyCash`,
  GetUserByType: `CashFlow/GetUserByType`,
  Fetchprocedure:`CommonController/Fetchprocedure`,
  BindInvestigationList: `Investigations/BindInvestigationList`,
  SearchDetail: `Ticketing/SearchDetail`,
  CentreExpenseEntry : `Pettycash/InsertExpense`,
  ledgerReport : `Pettycash/PettyCashLedgerReport`,
  expensetypemaster : `Pettycash/ManageExpenseType`,
  SaveQuery: `Ticketing/SaveQuery`,
  SaveTicketReply: `Ticketing/SaveTicketReply`,
  TicketDashboard: `Ticketing/TicketDashboard`,

  
  // InHouse
  BindInHouserDoctorData:`InHouseDoctor/BindInHouserDoctorData`,
  SaveEmployeeDocShare: `InHouseDoctor/SaveEmployeeDocShares`,
  //equipment 
  saveequipmenttype:`Equipment/SaveUpdateEquipmentType`,
  EquipmentTransfer:`Equipment/EquipmentTransfer`,
  VirtualDepartment:`Equipment/SaveUpdateVirtualDepartment`,
  categorysave:`Equipment/SaveUpdateMaintenanceCategory`,
  subcategorysave:`Equipment/SaveUpdateMaintenanceSubcategory`,
  savebreakdown :`Equipment/SaveUpdateBreakdown`,
  Equipmentmaintenanacelogging:`Equipment/SearchMaintenanceRoutineLog`,
  Equipmentlog:`Equipment/SaveUpdateEquipmentActivityLog`,
  UpdateMaintenanceRoutineLog:`Equipment/UpdateMaintenanceRoutineLog`,
  saveDiscard: `SampleStorage/saveDiscard`,
  GetAllCentres: `Employee/GetAllCentres`,
  GetMaster: `SampleStorage/GetMaster`,

  // TargetSheet
  MachineRevenueTarget: `TargetSheet/MachineRevenueTarget`, // Save Machine Data 
  GetMachinesByCenter: `MachineGroup/GetMachinesByCenter`,
  GetTargetRevenue: `TargetSheet/GetTargetRevenue`, // Search Machine Data
  AddCentreHomeCollectionSaveBind: `TargetSheet/AddCentreHomeCollectionSaveBind`, // Search Home Collection Data
  AddCentreHomeCollectionSave: `TargetSheet/AddCentreHomeCollectionSave`, // Save Home Collection Data
  TargetCampSaleSave: `TargetSheet/TargetCampSaleSave`, // Save Camp Sale Data
  GetCentreCampTarget: `TargetSheet/GetCentreCampTarget`, // Search Camp Sale Data

  //QC module - control master
  GetDepartmentAndMachine: `QC/GetDepartmentAndMachine`, // Get Department
  BindParameters: `QC/BindParameters`, // Lab Observation Parameters
  SaveControlData: `QC/SaveControlData`, // Save Control Data
  GetData: `QC/GetData`, // Get Data
  GetControlParameterDetail: `QC/GetControlParameterDetail`,

  //QC module - Remark master
  SaveRemark: `QCRemarksMaster/SaveRemark`, // save API
  GetAllRemarks: `QCRemarksMaster/GetAllRemarks`, // get Remarks
  UpdateRemark: `QCRemarksMaster/UpdateRemark`, // UpdateRemark

  // QC module - West gard
  GetWestgardRules: `WestgardRuleMaster/GetWestgardRules`,
  GetProcessingLabs: `WestgardRuleMaster/GetProcessingLabs`,
  GetMachinesByLab: `WestgardRuleMaster/GetMachinesByLab`,
  GetParametersByMachine: `WestgardRuleMaster/GetParametersByMachine`,
  SaveRuleData: `WestgardRuleMaster/SaveRuleData`,
  GetRuleData: `WestgardRuleMaster/GetRuleData`,

  //QC Value Entry
  bindCentre: `QCValueEntry/bind-Centre`,
  bindControl: `QCValueEntry/bind-control`,
  showReading: `QCValueEntry/show-reading`,
  bindMachine: `QCValueEntry/bind-machine`,
  saveData: `QCValueEntry/save-data`,

  //QC Control Transfer
  BindControl: `QCTransferControlDetails/BindControl`,
  BindMachine: `QCTransferControlDetails/BindMachine`,
  GetDepartments: `QCTransferControlDetails/GetDepartments`,
  TransferData: `QCTransferControlDetails/TransferData`,

  // Excel Upload
  DownloadFile: `QcUpload/DownloadFile`,

  //QCApprovalRight

  Search: `QCApprovalRight/Search`,
  BindManageApproval: `QCApprovalRight/BindManageApproval`,
  BindAction: `QCApprovalRight/BindAction`,
  SaveApprovalRight: `QCApprovalRight/SaveApprovalRight`,
  RemoveManageApproval: `QCApprovalRight/RemoveManageApproval`,

  //QC Control center mapping
  GetCentreById: `ControlCentreMapping/GetCentreById`,
  BindMachine: `ControlCentreMapping/BindMachine`,
  BindControl: `ControlCentreMapping/BindControl`,
  BindParameter: `ControlCentreMapping/BindParameter`,
  SaveControlCentreMapping: `ControlCentreMapping/SaveControlCentreMapping`,


  // All API endpoint URLs used in the Finance controller

  BindCentreWorkOrder: "Centre/BindCentreWorkOrder",
  // GetAllCentres: "Employee/GetAllCentres",
    // Finance API start here
  BindMainCenter: "Finance/BindMainCentre",
  SavePCDeptRequest: "Finance/SavePCDeptRequest",
  BindBackendData: "/Finance/BindBackendData",
  AccessMasterSaveMapping: "Finance/AccessMasterSaveMapping",
  getSessionDate: "Finance/getSessionDate",
  getCurrencyConversionFactor: "Finance/getCurrencyConversionFactor",
  bindVoucherBillingScreenControls: "Finance/BindVoucherBillingScreenControls",
  GetCOACurrentClosingBalance: "Finance/GetCOACurrentClosingBalance",
  SearchPettyCashRequest: "Finance/SearchPettyCashRequest",
  UpdateRequestStatus: "Finance/UpdateRequestStatus",
  SearchPendingPettyCashRequest: "Finance/SearchPendingPettyCashRequest",
  SavePCRequestApproval: "Finance/SavePCRequestApproval",
  searchPendingPettyCashApproval: "Finance/searchPendingPettyCashApproval",
  updatePettyCashApprovalStatus: "Finance/updatePettyCashApprovalStatus",
  SavePCEntry: "Finance/SavePCEntry",
  searchPettyCashEntry: "/Finance/searchPettyCashEntry",
  updatePettyCashEntryStatus: "/Finance/updatePettyCashEntryStatus",
  BindMappingData: "/Finance/BindMappingData",
  SaveMapping: "/Finance/SaveMapping",
  ActionChartOfAccount: "Finance/ActionChartOfAccount",
  SaveNewAccountType: "Finance/SaveNewAccountType",
  SaveChartOfAccount: "Finance/SaveChartOfAccount",
  Bindglobalresources: "Finance/Bindglobalresources",

  // ---------- Finance End ----------
  // Master Start
  FinanceConsumptionBindBranchCentre: "Finance/ConsumptionBindBranchCentre",
  BindHisDerpatment: "Finance/BindHisDerpatment",
  BindTransactionType: "Finance/BindTransactionType",
  BindScreenControls: "Finance/BindScreenControls",
  ConsumptionSaveMapping: "Finance/ConsumptionSaveMapping",
  ChangeStatus: "Finance/ChangeStatus",
  CopyMapping: "Finance/CopyMapping",
  FinanceLoadType: "Finance/LoadType",
  SaveMasterCreation: "Finance/SaveMasterCreation",
  FinanceBindMasterCreation: "Finance/BindMasterCreation",
  SaveVoucherTypeMaster: "Finance/SaveVoucherTypeMaster",
  BindVoucherTypeMaster: "Finance/BindVoucherTypeMaster",
  BindUsertypeApprovalMasterURL: "Finance/BindUsertypeApprovalMaster",
  GetCountry: "Finance/GetCountry",
  BindCurrencyMaster: "Finance/BindCurrencyMaster",
  SaveMappingData: "Finance/SaveMappingData",
  CentreWise_Coa_Mapping: "Finance/CentreWise_Coa_Mapping",
  CostBindMapping: "Finance/CostBindMapping",
  CostSaveMapping: "Finance/CostSaveMapping",
  DeActiveVoucherTypeMaster: "Finance/DeActiveVoucherTypeMaster",
  SaveCurrencyMaster: "Finance/SaveCurrencyMaster",
  BindHREmployeeDepartment: "Finance/BindHREmployeeDepartment",
  BindDoctorDepartment: "Finance/BindDoctorDepartment",
  CostLoadGroupRecords: "Finance/CostLoadGroupRecords",
  FinanceAccount: "Finance/FinanceAccount",
  CostChangeStatus: "Finance/CostChangeStatus",
  // Master End

    VoucherLimitBindMapping: "Finance/VoucherLimitBindMapping",
  BindReconciliationBank: "Finance/BindReconciliationBank",
  VoucherLimitSaveMapping: "Finance/VoucherLimitSaveMapping",
  BindReconciliationVerifyDetails: "Finance/BindReconciliationVerifyDetails",
  LoadAccountDetailsURL: "Finance/LoadAccountDetails",
  SearchReconcileDetails: "Finance/SearchReconcileDetails",
  UpdateVoucherPostingReview: "Finance/UpdateVoucherPostingReview",
  FinanceUpdateStatusBulk: "Finance/UpdateStatusBulk",
  FinanceBindAuditBackendData: "Finance/BindAuditBackendData",
  FinanceSaveVoucherAudit: "Finance/SaveVoucherAudit",
  SaveMapAdvanceWithPurchase: "Finance/SaveMapAdvanceWithPurchase",
  // finance approval end

  // finance voucher start
  GetPendingCheque: "Finance/GetPendingCheque",
  SaveChequeDeposit: "Finance/SaveChequeDeposit",
  GetDepositCheque: "Finance/GetDepositCheque",
  SaveChequeBounce: "Finance/SaveChequeBounce",
  UpdateReconciliationVerifyURL: "Finance/UpdateReconciliationVerify",
  DownloadVoucher: "Finance/DownlaodVoucherAttachment",
  // finance voucher end


  // Finance Voucher Audit Api Start

  BindAuditBackendData: "Finance/BindAuditBackendData",
  BindReportControlsURL: "Finance/BindReportControls",

  FinanceSaveVoucher: "Finance/SaveVoucher",
  ReplicateVoucherHistoryURL: "Finance/SearchReplicateVoucher",
  // finance voucher end
  helpMenu: "MachineResultEntry/BindMapping",

  // finance Report start
  GetTrialBalanceReport: "Finance/GetTrialBalanceReport",
  GetGLReport: "Finance/GetGLReport",
  PurchaseBillDueReport: "Finance/PurchaseBillDueReport",
  SaleBillDueReport: "Finance/SaleBillDueReport",
  VoucherSummaryReport: "Finance/VoucherSummaryReport",
  GetWithHoldingTaxReport: "Finance/GetWithHoldingTaxReport",
  GetPayableBankWiseReportURL: "Finance/GetPayableBankWiseReport",
  BindPayableGroup: "Finance/BindPayableGroup",
  PaybleAgingSummary: "Finance/PaybleAgingSummary",
  GetStatementReport: "Finance/GetStatementReport",
  BindSettlementDetailsURL: "Finance/BindSettlementDetails",
  // finance Report end
  // finance report Start
  FinanceBindBranchCentre: "Finance/BindBranchCentre",
  FinanceReceibleAgingSummary: "Finance/ReceibleAgingSummary",
  SearchForBoucherPostingBatch: "Finance/SearchForBoucherPostingBatch",
  FinanceSearchVoucher: "Finance/FinanceSearchVoucher",
  GetBSReportURL: "Finance/GetBSReport",
  GetBSDetailReportURL: "Finance/GetBSDetailReport",
  GetISReportURL: "Finance/GetISReport",

  // finance report End


// finance

 FinancePrintSearchVoucher: "Finance/PrintSearchVoucher",
  GetConfigurationURL: "Finance/GetConfiguration",
  UpdateConfigurationURL: "Finance/UpdateConfiguration",
  BindCollectionConfigurationDataURL: "Finance/BindCollectionConfigurationData",
  BindAssetMappingScreenDataURL: "Finance/BindAssetMappingScreenData",
  SaveConfigurationURL: "Finance/SaveConfiguration",
  SearchAssetMappingURL: "Finance/SearchAssetMapping",
  PrintAssetMappingURL: "Finance/PrintAssetMapping",
  SaveAssetMappingURL: "Finance/SaveAssetMapping",


   HISConsumeDeptMappingBindHISConsumeDeptMappingScreenData:
    "Finance/BindHISConsumeDeptMappingScreenData",
  HISConsumeDeptMappingBindHISConsumeDeptMappedUnMappedData:
    "Finance/BindHISConsumeDeptMappedUnMappedData",
  FinanceSaveSelectedItemRightHISConsumeDeptMapping:
    "Finance/SaveSelectedItemRightHISConsumeDeptMapping",
  FinanceSaveSelectedItemLeftHISConsumeDeptMapping:
    "Finance/SaveSelectedItemLeftHISConsumeDeptMapping",
  FinanceExportToExcelHISConsumeDeptMapping:
    "Finance/ExportToExcelHISConsumeDeptMapping",
  FinanceExporttoExcelNotMappedDataHISConsumeDeptMapping:
    "Finance/ExporttoExcelNotMappedDataHISConsumeDeptMapping",
  FinanceCopyCentreListHISConsumeDeptMapping:
    "Finance/CopyMappingHISConsumeDeptMapping",

  FinanceBindStockAdjProcessScreenControls:
    "Finance/BindStockAdjProcessScreenControls",
  FinanceSaveStockAdjProcessMapping: "Finance/SaveStockAdjProcessMapping",
  FinanceBindStockAdjProcessMappingData:
    "Finance/BindStockAdjProcessMappingData",
  FinanceChangeStockAdjProcessStatus: "Finance/ChangeStockAdjProcessStatus",
  FinanceCopyStockAdjProcessMapping: "Finance/CopyStockAdjProcessMapping",
  ViewPurchaseOrderBindCOADeptPdf: "ViewPurchaseOrder/BindCOADeptPdf",

  FinanceBindCostOfSaleMappingScreenData:
    "Finance/BindCostOfSaleMappingScreenData",
  FinanceBindCostOfSaleMappedUnMappedData:
    "Finance/BindCostOfSaleMappedUnMappedData",
  FinanceExporttoExcelNotMappedDataBindCostOfSale:
    "Finance/ExporttoExcelNotMappedDataBindCostOfSale",
  FinanceExportToExcelBindCostOfSale: "Finance/ExportToExcelBindCostOfSale",
  FinanceSaveSelectedItemRightBindCostOfSale:
    "Finance/SaveSelectedItemRightBindCostOfSale",
  FinanceSaveSelectedItemLeftBindCostOfSale:
    "Finance/SaveSelectedItemLeftBindCostOfSale",
  FinanceCopyMappingBindCostOfSale: "Finance/CopyMappingBindCostOfSale",

  FinanceFinVHimsMappingScreenData: "Finance/FinVHimsMappingScreenData",
  FinanceFinVHimsMappedUnMappedData: "Finance/FinVHimsMappedUnMappedData",
  FinanceExporttoExcelNotMappedDataFinVHims:
    "Finance/ExporttoExcelNotMappedDataFinVHims",
  FinanceExportToExcelFinVHims: "Finance/ExportToExcelFinVHims",
  FinanceSaveSelectedItemRightFinVHims: "Finance/SaveSelectedItemRightFinVHims",
  FinanceSaveSelectedItemLeftFinVHims: "Finance/SaveSelectedItemLeftFinVHims",
  FinanceCopyMappingItem: "Finance/CopyMappingItem",
  VoucherLimitCopyMappingURL: "Finance/VoucherLimitCopyMapping",

  //prince-item
  FinanceFinVHimsDeptMappingScreenData: "Finance/FinVHimsDeptMappingScreenData",
  FinanceFinVHimsDeptMappedUnMappedData:
    "Finance/FinVHimsDeptMappedUnMappedData",
  FinanceExporttoExcelNotMappedDataFinVHimsDept:
    "Finance/ExporttoExcelNotMappedDataFinVHimsDept",
  FinanceExportToExcelFinVHimsDept: "Finance/ExportToExcelFinVHimsDept",
  FinanceSaveSelectedItemRightFinVHimsDept:
    "Finance/SaveSelectedItemRightFinVHimsDept",
  FinanceSaveSelectedItemLeftFinVHimsDept:
    "Finance/SaveSelectedItemLeftFinVHimsDept",
  FinanceCopyMappingItemDept: "Finance/CopyMappingItemDept",
  FinanceVoucherPrint: "FinanceReports/VoucherPrint",
  FinanceSearchPostingPettyCashEntry: "Finance/SearchPostingPettyCashEntry",
  FinanceSavePettyCashPosting: "Finance/SavePettyCashPosting",
  FinanceSearchPettyCashVoucher: "Finance/SearchPettyCashVoucher",
  FinanceUpdatePettyCashVoucherStatus: "Finance/UpdatePettyCashVoucherStatus",
  bindFinancialYearURL: "Finance/bindFinancialYear",
  CloseBookURL: "Finance/CloseBook",
  bindFinancialURL: "Finance/bindFinancial",
  GrdFinancialYearURL: "Finance/GrdFinancialYear",
  SaveFinancialURL: "Finance/SaveFinancial",
  CloseFinancialYearURL: "Finance/CloseFinancialYear",
  BindFinanceEmployeeURL: "Finance/BindFinanceEmployee",
  BindSICTypeMasterURL: "Finance/BindSICTypeMaster",
  SaveSICAuthorizationURL: "Finance/SaveSICReportTypeAuthorization",
  FinanceSearchForVoucherPrinting: "Finance/SearchForVoucherPrinting",
  FinancePaymentRemittanceAdvicePrint: "Finance/PaymentRemittanceAdvicePrint",
  FinanceChequePrint: "Finance/ChequePrint",
  FinanceBindSICEmployeeAuthorization: "Finance/BindSICEmployeeAuthorization",
  FinanceMonthlyClosureCheck: "Finance/MonthlyClosureCheck",
  FinanceGetSICReports: "Finance/GetSICReports",
  FinanceRunProcSICReport: "Finance/RunProcSICReport",
  FinanceSaveSICApproved: "Finance/SaveSICApproved",
  FinanceApproveSICAllSubHead: "Finance/ApproveSICAllSubHead",

  FinanceSubCategoryMappingMasterScreenData:
    "Finance/SubCategoryMappingMasterScreenData",
  FinanceSubCategoryMappingMasterMappedUnMappedData:
    "Finance/SubCategoryMappingMasterMappedUnMappedData",
  FinanceExporttoExcelNotMappedDataFinVHims:
    "Finance/ExporttoExcelNotMappedDataFinVHims",
  FinanceExportToExcelSubCategoryMappingMaster:
    "Finance/ExportToExcelSubCategoryMappingMaster",
  FinanceSaveSelectedItemRightSubCategoryMappingMaster:
    "Finance/SaveSelectedItemRightSubCategoryMappingMaster",
  FinanceSaveSelectedItemLeftSubCategoryMappingMaster:
    "Finance/SaveSelectedItemLeftSubCategoryMappingMaster",
  FinanceCopyMappingSubCategoryMappingMaster:
    "Finance/CopyMappingSubCategoryMappingMaster",

  FinancePushMaster: "Finance/PushSICMaster",
  FinanceShowApprovalDetails: "Finance/ShowSICApprovalDetails",
  FinanceShowReport: "Finance/ShowSICReport",
  FinanceSaveApproved: "Finance/SaveApproved",
  CommonAPIGetDateTimeNow: "CommonAPI/GetDateTimeNow",

  HISConsumeDeptMappingBindHISConsumeDeptMappingScreenData:
    "Finance/BindHISConsumeDeptMappingScreenData",
  HISConsumeDeptMappingBindHISConsumeDeptMappedUnMappedData:
    "Finance/BindHISConsumeDeptMappedUnMappedData",
  FinanceSaveSelectedItemRightHISConsumeDeptMapping:
    "Finance/SaveSelectedItemRightHISConsumeDeptMapping",
  FinanceSaveSelectedItemLeftHISConsumeDeptMapping:
    "Finance/SaveSelectedItemLeftHISConsumeDeptMapping",
  FinanceExportToExcelHISConsumeDeptMapping:
    "Finance/ExportToExcelHISConsumeDeptMapping",
  FinanceExporttoExcelNotMappedDataHISConsumeDeptMapping:
    "Finance/ExporttoExcelNotMappedDataHISConsumeDeptMapping",
  FinanceCopyCentreListHISConsumeDeptMapping:
    "Finance/CopyMappingHISConsumeDeptMapping",

  FinanceBindStockAdjProcessScreenControls:
    "Finance/BindStockAdjProcessScreenControls",
  FinanceSaveStockAdjProcessMapping: "Finance/SaveStockAdjProcessMapping",
  FinanceBindStockAdjProcessMappingData:
    "Finance/BindStockAdjProcessMappingData",
  FinanceChangeStockAdjProcessStatus: "Finance/ChangeStockAdjProcessStatus",
  FinanceCopyStockAdjProcessMapping: "Finance/CopyStockAdjProcessMapping",
  ViewPurchaseOrderBindCOADeptPdf: "ViewPurchaseOrder/BindCOADeptPdf",

  FinanceBindCostOfSaleMappingScreenData:
    "Finance/BindCostOfSaleMappingScreenData",
  FinanceBindCostOfSaleMappedUnMappedData:
    "Finance/BindCostOfSaleMappedUnMappedData",
  FinanceExporttoExcelNotMappedDataBindCostOfSale:
    "Finance/ExporttoExcelNotMappedDataBindCostOfSale",
  FinanceExportToExcelBindCostOfSale: "Finance/ExportToExcelBindCostOfSale",
  FinanceSaveSelectedItemRightBindCostOfSale:
    "Finance/SaveSelectedItemRightBindCostOfSale",
  FinanceSaveSelectedItemLeftBindCostOfSale:
    "Finance/SaveSelectedItemLeftBindCostOfSale",
  FinanceCopyMappingBindCostOfSale: "Finance/CopyMappingBindCostOfSale",

  FinanceFinVHimsMappingScreenData: "Finance/FinVHimsMappingScreenData",
  FinanceFinVHimsMappedUnMappedData: "Finance/FinVHimsMappedUnMappedData",
  FinanceExporttoExcelNotMappedDataFinVHims:
    "Finance/ExporttoExcelNotMappedDataFinVHims",
  FinanceExportToExcelFinVHims: "Finance/ExportToExcelFinVHims",
  FinanceSaveSelectedItemRightFinVHims: "Finance/SaveSelectedItemRightFinVHims",
  FinanceSaveSelectedItemLeftFinVHims: "Finance/SaveSelectedItemLeftFinVHims",
  FinanceCopyMappingItem: "Finance/CopyMappingItem",
  VoucherLimitCopyMappingURL: "Finance/VoucherLimitCopyMapping",

  //prince-item
  FinanceFinVHimsDeptMappingScreenData: "Finance/FinVHimsDeptMappingScreenData",
  FinanceFinVHimsDeptMappedUnMappedData:
    "Finance/FinVHimsDeptMappedUnMappedData",
  FinanceExporttoExcelNotMappedDataFinVHimsDept:
    "Finance/ExporttoExcelNotMappedDataFinVHimsDept",
  FinanceExportToExcelFinVHimsDept: "Finance/ExportToExcelFinVHimsDept",
  FinanceSaveSelectedItemRightFinVHimsDept:
    "Finance/SaveSelectedItemRightFinVHimsDept",
  FinanceSaveSelectedItemLeftFinVHimsDept:
    "Finance/SaveSelectedItemLeftFinVHimsDept",
  FinanceCopyMappingItemDept: "Finance/CopyMappingItemDept",
  FinanceSearchPostingPettyCashEntry: "Finance/SearchPostingPettyCashEntry",
  FinanceSavePettyCashPosting: "Finance/SavePettyCashPosting",
  FinanceSearchPettyCashVoucher: "Finance/SearchPettyCashVoucher",
  FinanceUpdatePettyCashVoucherStatus: "Finance/UpdatePettyCashVoucherStatus",
  bindFinancialYearURL: "Finance/bindFinancialYear",
  CloseBookURL: "Finance/CloseBook",
  bindFinancialURL: "Finance/bindFinancial",
  GrdFinancialYearURL: "Finance/GrdFinancialYear",
  SaveFinancialURL: "Finance/SaveFinancial",
  CloseFinancialYearURL: "Finance/CloseFinancialYear",
  BindFinanceEmployeeURL: "Finance/BindFinanceEmployee",
  BindSICTypeMasterURL: "Finance/BindSICTypeMaster",
  SaveSICAuthorizationURL: "Finance/SaveSICReportTypeAuthorization",
  FinanceSearchForVoucherPrinting: "Finance/SearchForVoucherPrinting",
  FinancePaymentRemittanceAdvicePrint: "FinanceReports/PaymentRemittanceAdvicePrint",
  FinanceChequePrint: "Finance/VoucherPrint",
  FinanceBindSICEmployeeAuthorization: "Finance/BindSICEmployeeAuthorization",
  FinanceMonthlyClosureCheck: "Finance/MonthlyClosureCheck",
  FinanceGetSICReports: "Finance/GetSICReports",
  FinancePushMaster: "Finance/PushMaster",
  FinanceSaveApproved: "Finance/SaveApproved",

  HISConsumeDeptMappingBindHISConsumeDeptMappingScreenData:
    "Finance/BindHISConsumeDeptMappingScreenData",
  HISConsumeDeptMappingBindHISConsumeDeptMappedUnMappedData:
    "Finance/BindHISConsumeDeptMappedUnMappedData",
  FinanceSaveSelectedItemRightHISConsumeDeptMapping:
    "Finance/SaveSelectedItemRightHISConsumeDeptMapping",
  FinanceSaveSelectedItemLeftHISConsumeDeptMapping:
    "Finance/SaveSelectedItemLeftHISConsumeDeptMapping",
  FinanceExportToExcelHISConsumeDeptMapping:
    "Finance/ExportToExcelHISConsumeDeptMapping",
  FinanceExporttoExcelNotMappedDataHISConsumeDeptMapping:
    "Finance/ExporttoExcelNotMappedDataHISConsumeDeptMapping",
  FinanceCopyCentreListHISConsumeDeptMapping:
    "Finance/CopyMappingHISConsumeDeptMapping",
  FinanceBindStockAdjProcessScreenControls:
    "Finance/BindStockAdjProcessScreenControls",
  FinanceSaveStockAdjProcessMapping: "Finance/SaveStockAdjProcessMapping",
  FinanceBindStockAdjProcessMappingData:
    "Finance/BindStockAdjProcessMappingData",
  FinanceChangeStockAdjProcessStatus: "Finance/ChangeStockAdjProcessStatus",
  FinanceCopyStockAdjProcessMapping: "Finance/CopyStockAdjProcessMapping",
  ViewPurchaseOrderBindCOADeptPdf: "ViewPurchaseOrder/BindCOADeptPdf",
  FinanceBindCostOfSaleMappingScreenData:
    "Finance/BindCostOfSaleMappingScreenData",
  FinanceBindCostOfSaleMappedUnMappedData:
    "Finance/BindCostOfSaleMappedUnMappedData",
  FinanceExporttoExcelNotMappedDataBindCostOfSale:
    "Finance/ExporttoExcelNotMappedDataBindCostOfSale",
  FinanceExportToExcelBindCostOfSale: "Finance/ExportToExcelBindCostOfSale",
  FinanceSaveSelectedItemRightBindCostOfSale:
    "Finance/SaveSelectedItemRightBindCostOfSale",
  FinanceSaveSelectedItemLeftBindCostOfSale:
    "Finance/SaveSelectedItemLeftBindCostOfSale",

  FinanceFinVHimsMappingScreenData: "Finance/FinVHimsMappingScreenData",
  FinanceFinVHimsMappedUnMappedData: "Finance/FinVHimsMappedUnMappedData",
  FinanceExporttoExcelNotMappedDataFinVHims:
    "Finance/ExporttoExcelNotMappedDataFinVHims",
  FinanceExportToExcelFinVHims: "Finance/ExportToExcelFinVHims",
  FinanceSaveSelectedItemRightFinVHims: "Finance/SaveSelectedItemRightFinVHims",
  FinanceSaveSelectedItemLeftFinVHims: "Finance/SaveSelectedItemLeftFinVHims",
  FinanceCopyMappingBindCostOfSale: "Finance/CopyMappingBindCostOfSale",
  FinanceBindglobalresources: "Finance/Bindglobalresources",
  FinanceCopyMappingItem: "Finance/CopyMappingItem",

  FinanceLoadCentreChartOfAccount: "Finance/LoadCentreChartOfAccount",
  FinanceGetPendingsettleInvoiceSupplierInstallment:
    "Finance/GetPendingsettleInvoiceSupplierInstallment",
  FinanceUpdateInstallmentSupplierInstallment:
    "Finance/UpdateInstallmentSupplierInstallment",

    FinanceSubCategoryMappingMasterScreenData:
    "Finance/SubCategoryMappingMasterScreenData",
  FinanceSubCategoryMappingMasterMappedUnMappedData:
    "Finance/SubCategoryMappingMasterMappedUnMappedData",
  FinanceExporttoExcelNotMappedDataFinVHims:
    "Finance/ExporttoExcelNotMappedDataFinVHims",
  FinanceExportToExcelSubCategoryMappingMaster:
    "Finance/ExportToExcelSubCategoryMappingMaster",
  FinanceSaveSelectedItemRightSubCategoryMappingMaster:
    "Finance/SaveSelectedItemRightSubCategoryMappingMaster",
  FinanceSaveSelectedItemLeftSubCategoryMappingMaster:
    "Finance/SaveSelectedItemLeftSubCategoryMappingMaster",
  FinanceCopyMappingSubCategoryMappingMaster:
    "Finance/CopyMappingSubCategoryMappingMaster",

    BankReconciliationURL: "Finance/BindReconciliationBank",









     bindVoucerListURL: "Finance/BindVoucherBillingScreenControls",
  bindCOGGroupsBackendData: "Finance/BindCOGGroupsBackendData",
  BindGroupTableURL: "Finance/BindGroupTable",
  BindChartOfAccountURL: "Finance/BindChartOfAccount",
  LoadGroupRecordsURL: "Finance/LoadGroupRecords",
  SaveNewGroupAPI: "Finance/SaveNewGroup",
  GetParentsData: "Finance/GetParentsData",
  SearchGroupTableURL: "Finance/SearchGroupTable",
  ChartOfGroupUpdateStatusURL: "Finance/UpdateStatus",
  UpdateGroupCodeDisplayURL: "Finance/UpdateGroupCodeDisplay",
  UpdateGroupNameURL: "Finance/UpdateGroupName",
  LoadCentreChartOfAccountURL: "Finance/LoadCentreChartOfAccount",
  GetCurrencyConversionFactorURL: "Finance/GetCurrencyConversionFactor",
  GetPeriodClosedURL: "Finance/GetPeriodClosed",
  BinduploadOpeningBalanceControls: "Finance/BinduploadOpeningBalanceControls",
  BindReconciliationDetails: "Finance/BindReconciliationDetails",
  BankReconciliationURL: "Finance/BindReconciliationBank",
  SearchVoucher: "Finance/SearchVoucher",
  UpdateVoucherStatusURL: "Finance/UpdateVoucherStatus",
  GetPendingsettleInvoiceURL: "Finance/GetPendingsettleInvoice",
  UpdateReconciliation: "Finance/UpdateReconciliation",
  GetBankChargesUploadExcel: "Finance/GetBankChargesUploadExcel",
  BalanceTransaferControls: "Finance/BalanceTransaferControls",
  GetBalanceToTransafer: "Finance/GetBalanceToTransafer",
  UploadBalanceTransfer: "Finance/UploadBalanceTransfer",
  GetBankReconciliationExcel: "Finance/GetBankReconciliationExcel",
  GetOpeningBalanceToUpload: "Finance/GetOpeningBalanceToUpload",
  GetOpeningBalanceExcell: "Finance/GetOpeningBalanceExcell",
  SaveOpeningBalance: "Finance/SaveOpeningBalance",
  SearchAccountBookReport: "Finance/SearchAccountBookReport",
  SaveCurrencyConverter: "CommonAPI/SaveCurrencyConversionFactor",
  CurrencyConversionDetails: "CommonAPI/GetCurrencyConversionDetails",
  SupplierBindBackendData: "Finance/SupplierAdvanceMappingBindBackendData",
  GetBankReconciliationReport: "Finance/GetBankReconciliationReport",
 






  // ---------- Currency Conversion (CommonAPI) ----------
  SaveCurrencyConverterFactor: "CommonAPI/SaveCurrencyConversionFactor",
  GetCurrencyConversionDetails: "CommonAPI/GetCurrencyConversionDetails",








  


  
};
   