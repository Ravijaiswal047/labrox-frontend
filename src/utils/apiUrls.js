const environment = import.meta.env.VITE_APP_ENVIRONMENT;
// export const baseUrl = import.meta.env.VITE_APP_BASE_URL;

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
// console.log("envUrlenvironment", environment, allEnvApiUrls);

const envUrl = `${allEnvApiUrls[environment]?.baseUrl}/api/v1`;
// console.log("envUrl", envUrl);

export const apiUrls = {
  InsertReferalLab: "ReferalLab/InsertReferalLab",
  GetReferalLab: `ReferalLab/GetReferalLab`,
  GetReferalLabDropdwon: `ReferalLab/GetReferalLabDropdwon`,
  Fetchprocedure: `CommonController/Fetchprocedure`,
  getDeviceMaster: `SampleStorage/GetSampleStorageDeviceMaster`,
  getGlobalData: `Global/getGlobalData`,
  getRateList: `centre/getRateList`,
  getGlobalBusinessUnit: `Global/getGlobalBusinessUnit`,
  getRateTypeWithCentre: `CentreManager/getRateTypeWithCentre`,
  UpdateCentre: `CentreManager/UpdateCentre`,
  BindRole: `CommonController/BindRole`,
  InsertCentre: `CentreManager/InsertCentre`,
  GetInvoiceDataToCancel: `Accounts/GetInvoiceDataToCancel`,
  CheckOutstanding: `Accounts/CheckOutstanding`,
  LoginFromToken: `Login/LoginFromToken`,
  GenerateLoginToken: `Login/GenerateLoginToken`,
  GetRateListWithType: `RateList/GetRateListWithType`,
  GetInvestigations: `Investigations/GetInvestigations`,
  changeUserPasswordEmployee: `changePassword/changeUserPasswordEmployee`,
  BindInvestigationList: `Investigations/BindInvestigationList`,
  GetRateType: `Centre/GetRateType`,
  SaveRateList: `RateList/SaveRateList`,
  EmployeeMenuDirection: `CommonController/EmployeeMenuDirection`,
  getAllsalesManager: `Accounts/getAllsalesManager`,
  getGlobalCentres: `centre/getGlobalCentres`,
  LedgerStatementReport: `Accounts/LedgerStatementReport`,
  DailyOSReport: `Accounts/DailyOSReport`,
  MonthlyInvoiceReport: "Accounts/MonthlyInvoiceReport",
  GetSMSWhatsappEmailQueueList: `Dispatch/GetSMSWhatsappEmailQueueList`,
  GetSMSWhatsappEmailCredentials: `Dispatch/GetSMSWhatsappEmailCredentials`,
  InsertDataSMSWhatsappEMail: `/Dispatch/InsertDataSMSWhatsappEMail`,

  //QC module - control master
  GetDepartmentAndMachine: `QC/GetDepartmentAndMachine`,
  BindParameters: `QC/BindParameters`, // Lab Observation Parameters
  SaveControlData: `QC/SaveControlData`, // Save Control Data
  GetData: `QC/GetData`, // Get Data
  GetControlParameterDetail: `QC/GetControlParameterDetail`,
  UpdateControlData: `QC/UpdateControlData`,
  DeleteControlData: `QC/DeleteControl`,
  DeleteParameter: `QC/DeleteParameter`,
  GetMachineGroup: `CommonController/GetMachineGroup`,
  GetDepartment: `Department/getDepartment`,

  //QC module - Remark master
  SaveRemark: `QCRemarksMaster/SaveRemark`,
  GetAllRemarks: `QCRemarksMaster/GetAllRemarks`,
  UpdateRemark: `QCRemarksMaster/UpdateRemark`,

  // QC module - West gard
  GetWestgardRules: `IQCWestgardRuleMaster/GetWestgardRules`,
  GetProcessingLabs: `IQCWestgardRuleMaster/GetProcessingLabs`,
  GetMachinesByLab: `IQCWestgardRuleMaster/GetMachinesByLab`,
  GetParametersByMachine: `IQCWestgardRuleMaster/GetParametersByMachine`,
  SaveRuleData: `IQCWestgardRuleMaster/SaveRuleData`,
  GetRuleData: `IQCWestgardRuleMaster/GetRuleData`,

  //QC Value Entry
  bindCentre: `QCValueEntry/bind-Centre`,
  bindControl: `QCValueEntry/bind-control`,
  showReading: `QCValueEntry/show-reading`,
  bindMachine: `QCValueEntry/bind-machine`,
  saveData: `QCValueEntry/save-data`,

  //QC Control Transfer
  BindTransferControl: `QCTransferControlDetails/BindControl`,
  BindTransferMachine: `QCTransferControlDetails/BindMachine`,
  GetDepartments: `QCTransferControlDetails/GetDepartments`,
  TransferData: `QCTransferControlDetails/TransferData`,
  GetAccessProcessingLab: `CommonController/GetAccessProcessingLab`,

  // Excel Upload
  DownloadFile: `QcUpload/DownloadFile`,
  SaveQcData: `QcUpload/SaveQcData`,

  //QCApprovalRight

  Search: `QCApprovalRight/Search`,
  BindManageApproval: `QCApprovalRight/BindManageApproval`,
  BindAction: `QCApprovalRight/BindAction`,
  SaveApprovalRight: `QCApprovalRight/SaveApprovalRight`,
  RemoveManageApproval: `QCApprovalRight/RemoveManageApproval`,

  //QC Control center mapping
  GetCentreById: `IQCControlCentreMapping/GetCentreById`,
  BindControlcenterMachine: `IQCControlCentreMapping/BindMachine`,
  BindControlcenterControl: `IQCControlCentreMapping/BindControl`,
  BindControlcenterParameter: `IQCControlCentreMapping/BindParameter`,
  SaveControlCentreMapping: `IQCControlCentreMapping/SaveControlCentreMapping`,

  //QC Quality Question Master
  BindQuestionHead: `IQCQualityQuestionMaster/BindQuestionHead`,
  BindQuestionHeadAll: `IQCQualityQuestionMaster/BindQuestionHeadAll`,
  SaveQuestionHead: `IQCQualityQuestionMaster/SaveQuestionHead`,
  UpdateQuestionHead: `IQCQualityQuestionMaster/UpdateQuestionHead`,
  BindQuestionAll: `IQCQualityQuestionMaster/BindQuestionAll`,
  SaveQuestion: `IQCQualityQuestionMaster/SaveQuestion`,
  UpdateQuestion: `IQCQualityQuestionMaster/UpdateQuestion`,
  DeleteQuestion: `IQCQualityQuestionMaster/DeleteQuestion`,

  //QC MIS Report
  bindMisCentre: `QCMISReport/bind-Centre`,
  BindQCMISMachine: `QCMISReport/BindMachine`,
  BindQCMIScontrol: `QCMISReport/bindcontrol`,
  BindQCMISParameter: `QCMISReport/BindParameter`,
  monthlyreport: `QCMISReport/monthly-report`,
  GetMonthlyReportMonthWise: `QCMISReport/GetMonthlyReportMonthWise`,
  GetMonthlyReportDayWise: `QCMISReport/GetMonthlyReportDayWise`,
  GetMonthlyReportDayWiseAll: `QCMISReport/GetMonthlyReportDayWiseAll`,

  //QC Report
  BindReportcontrol: `QCReport/bindcontrol`,
  BindReportMachine: `QCReport/BindMachine`,
  BindLevel: `QCReport/BindLevel`,
  ShowReading: `QCReport/ShowReading`,
  ShowReadingExcel: `QCReport/ShowReadingExcel`,
  QcRights: `QCReport/qc-rights`,
  SaveReading: `/QCReport/SaveReading`,
  RemoveFromQc: `QCReport/RemoveFromQc`,
  SaveApprovable: `QCReport/SaveApprovable`,
  ApproveReading: `QCReport/ApproveReading`,
  DeleteByCentreWise: `QCReport/DeleteByCentreWise`,
  GetRemarks: `QCReport/GetRemarks`,
  SaveRcaAndCapa: `QCReport/SaveRcaAndCapa`,
  RemoveRcaAndCapa: `QCReport/RemoveRcaAndCapa`,
  GetRemarkDetail: `QCReport/GetRemarkDetail`,
  GenerateReport: `commonReports/GenerateReport`,
  QCReportBindParameter: "QCReport/BindParameter", // added new

  // Quality Question Answer
  GetQuestionAll: `IQCQualityQuestionAnswer/BindQuestionAll`,
  SaveQuestionAnswer: `IQCQualityQuestionAnswer/SaveQuestionAnswer`,
  RemoveQuestionAnswer: `IQCQualityQuestionAnswer/RemoveQuestionAnswer`,

  GetCenterHideData: `Centre/GETCenterHideData`,
  InsertCentreHideData: `Centre/InsertCentreHideData`,
  UpdateCentreHideData: `Centre/UpdateCentreHideData`,
  GetRateTypes: `Centre/GetRateTypes`,

  GetB2bDiscountLedgertransactionno: `Accounts/GetB2bDiscountLedgertransactionno`,
  UpdateB2bDiscountLedgertransactionno: `Accounts/UpdateB2bDiscountLedgertransactionno`,
  GetPageControlData: `CompanyMaster/GetPageControlData`,
  MainMenuPageData: `Menu/MainMenuPageData`,

  //equipments
  saveequipmenttype: `Equipment/SaveUpdateEquipmentType`,
  EquipmentTransfer: `Equipment/EquipmentTransfer`,
  VirtualDepartment: `Equipment/SaveUpdateVirtualDepartment`,
  categorysave: `Equipment/SaveUpdateMaintenanceCategory`,
  subcategorysave: `Equipment/SaveUpdateMaintenanceSubcategory`,
  savebreakdown: `Equipment/SaveUpdateBreakdown`,
  Equipmentmaintenanacelogging: `Equipment/SearchMaintenanceRoutineLog`,
  Equipmentlog: `Equipment/SaveUpdateEquipmentActivityLog`,

  //equipment management module (eqm_ tables)
  SaveEquipmentMaster: `EquipmentManagement/SaveEquipment`,
  GetEquipmentMaster: `EquipmentManagement/GetEquipment`,
  GetEquipmentMasterById: `EquipmentManagement/GetEquipmentById`,
  DeleteEquipmentMaster: `EquipmentManagement/DeleteEquipment`,
  GetEquipmentByHash: `EquipmentManagement/GetEquipmentByHash`,
  GetEquipmentDetailView: `EquipmentManagement/GetEquipmentDetailView`,
  GetVendorList: `VendorMaster/GetVendorList`,
  BindPupData_UnBilledDetail: `Accounts/BindPupData_UnBilledDetail`,

  GetHideRolesData: `Ticketing/GetHideRolesData`,
  SaveDataCategoryMaster: `Ticketing/SaveDataCategoryMaster`,
  SaveTicket: `Ticketing/SaveTicket`,
  GetDataCategoryMaster: `Ticketing/GetDataCategoryMaster`,
  UpdateDataCategoryMaster: `Ticketing/UpdateDataCategoryMaster`,
  UpdateCategoryTAT: `Ticketing/UpdateCategoryTAT`,
  CategoryEmoloyeeDefaultSave: `Ticketing/CategoryEmoloyeeDefaultSave`,
  GetDataMaster: `Ticketing/GetDataMaster`,

  saveDiscard: `SampleStorage/saveDiscard`,
  GetAllCentres: `Employee/GetAllCentres`,
  GetMaster: `SampleStorage/GetMaster`,

  // getRateTypeWithCentreWorkOrder: `Centre/getRateTypeWithCentreWorkOrder`,
  // getRateTypeDetailWithCentreWorkOrder: `Centre/getRateTypeDetailWithCentreWorkOrder`,
  BindCentreWorkOrder: "Centre/BindCentreWorkOrder",
  BindRateTypeWorkOrder: "Centre/BindRateTypeWorkOrder",
  BindRateTypeDropdown: "Centre/BindRateTypeDropdown",
  InvestigationRateTypeMapper: "Investigations/InvestigationRateTypeMapper",
  GetInvestigationRateTypeMapper:
    "Investigations/GetInvestigationRateTypeMapper",
  SearchInvestigationAllergy: "Investigations/SearchInvestigationAllergy",
  SaveInvestigationAllergyGroups:
    "Investigations/SaveInvestigationAllergyGroups",

  // Ambulance master
  SaveVehicleAmbulance: "AmbulanceMaster/SaveVehicleAmbulance",
  SearchVehicleAmbulance: "AmbulanceMaster/SearchVehicleAmbulance",
  UpdateVehicleAmbulance: "AmbulanceMaster/UpdateVehicleAmbulance",
  SaveAmbulanceDriver: "AmbulanceMaster/SaveAmbulanceDriver",
  GetAmbulanceDrivers: "AmbulanceMaster/GetAmbulanceDrivers",
  UpdateDriver: "AmbulanceMaster/UpdateDriver",
  SaveAmbulanceReading: "AmbulanceMaster/SaveAmbulanceReading",
  SearchAmbulanceReading: "AmbulanceMaster/SearchAmbulanceReading",
  UpdateAmbulanceReading: "AmbulanceMaster/UpdateAmbulanceReading",
  SearchAmbulanceVehicle: "AmbulanceMaster/SearchAmbulanceVehicle",

  //EQAS API
  SaveDataAgencyMaster: "EQAS/SaveDataAgencyMaster",
  SearchDataAgencyMaster: "EQAS/SearchDataAgencyMaster",
  UpdateDataAgencyMaster: "EQAS/UpdateDataAgencyMaster",
  SearchRecords: "EQAS/SearchRecords",
  GetTestsAgencyMaster: "EQAS/GetTestsAgencyMaster",
  CheckDuplicateProgramName: "EQAS/CheckDuplicateProgramName",
  SaveEQASProgram: "EQAS/SaveEQASProgram",
  SearchRecordsProgram: "EQAS/SearchRecordsProgram",
  UpdateDataEQASProgram: "EQAS/UpdateDataEQASProgram",
  DeleteEQASProgram: "EQAS/DeleteEQASProgram",
  GetEQASProviderMapping: "EQAS/GetEQASProviderMapping",
  BindProgram: "EQAS/BindProgram",
  BindProgramData: "EQAS/BindProgramData",
  getprogramlist: "EQAS/getprogramlist",
  SaveProgramMapping: "EQAS/SaveProgramMapping",
  getprogramlist: "EQAS/getprogramlist",
  DeleteProgramLabMapping: "EQAS/DeleteProgramLabMapping",
  BindProgramRegistration: "EQAS/BindProgramRegistration",
  BindProgramDataRegistration: "EQAS/BindProgramDataRegistration",
  SaveEqasRegistration: `EQAS/SaveEqasRegistration`,
  EqasBindResults: `EQAS/BindResults`,
  SaveEQASDocument: `EQAS/SaveEQASDocument`,
  GetEQASDocumentData: `EQAS/GetDocumentData`,
  SaveEQASDocument: `EQAS/SaveEQASDocument`,
  GetFileUrl: `CommonController/GetFileUrl`,
  saveEqasResult: `EQAS/save-eqas-result`,
  getEQASResult: `EQAS/getEQASResult`,
  RejectNow: `EQAS/RejectNow`,
  BindProgramParam: `EQAS/BindProgramParam`,
  GetEQASData: `EQAS/GetEQASData`,
  EQASRemoveRcaAndCaPa: `EQAS/RemoveRcaAndCaPa`,
  ExportToExcelresult: `EQAS/ExportToExcelresult`,
  GetEQASExcelData: `EQAS/GetEQASExcelData`,

  // Bookmark Menu
  SaveAllfavouritePage: `Menu/SaveAllfavouritePage`,
  //ILC API
  ILCSaveData: "ILC/SaveData",
  ILCUpdateData: `ILC/UpdateData`,
  ILCBindData: `ILC/BindData`,

  BindILC: `ILC/BindILCLabParameter`,
  BindTest: `ILC/BindTest`,
  BindILCLabParameter: `ILC/BindILCLabParameter`,
  BindParameter: `ILC/BindParameter`,
  GetAllData: `ILC/GetAllData`,
  ILCSaveLabParameterMapping: `ILC/SaveLabParameterMapping`,
  ILCDeleteData: `ILC/DeleteData`,

  BindILCRegisteration: `ILC/BindILC`,
  ILCGetPatientData: `ILC/GetPatientData`,
  ILCGetParameterList: `ILC/GetParameterList`,
  ILCBindTestParameter: `ILC/BindTestParameter`,
  ILCRegistration:`ILC/SaveRegister`,
  GetAllDataILCMap: `ILC/GetAllDataILCMap`,
  SaveDataILCMap: `ILC/SaveDataILCMap`,
  DeleteDILCMap: `ILC/DeleteDILCMap`,
  ExportToExcelILCMap: `ILC/ExportToExcelILCMap`,
  GetILCResultEntry: `ILC/GetILCResultEntry`,
  ILCSaveResult: `ILC/SaveResult`,
  
  //Dev Mishra 

  //Dev Mishra

  ChangeFontSize: "CommonController/CombineMenuField",

  // <----------------------------------Data Report------------------------------------------>

  BindMasterBindCategory: "Master/BindCategory",
  BindMasterBindDoc: "Master/BindDocDepartment",
  BindMasterBindPanel: "Master/BindPanel",
  BindMasterBindReportName: "Master/BindReportName",
  BindMasterBindSubCategory: "Master/BindSubCategory",
  BindMasterData: "Master/MasterData",
  BindMasterMasterData: "Master/LoadItems",
  BindAllReportData: "AllReport/AllReport",
  BindPaymentMode: "Master/BindPaymentMode",
  BindGetTransactionTypes: "Master/BindTransactionType",
  BindEmployeeUser: "Master/BindEmployee",
  BindReportData: "Master/ReportName",
  BindSubReportData: "Master/SubReportName",
  BindReportField: "Master/ReportField",
  BindMasterGetReportColumnList: "Master/GetReportColumnList",
  BindMasterGetDateType: "Master/GetDateType",
  MasterBindUserGroupBy: "Master/BindUserGroupBy",
  BindMRDBindPatientType: "MRD/BindPatientType",
  DRAccountBindPanelGroup: "CreditControl/BindInsurance",
  BindAllPanel: "CommonAPI/GetAllPanel",
  BindDoctorCentrewise: "PatientControl/BindDoctorCentrewise",
  BindBindCategory: "Master/BindCategory",
  BindMasterBindSubCategory: "Master/BindSubCategory",
  BindMasterBindDocDepartment: "Master/BindDocDepartment",
  BindRequisitionGetStore: "Requisition/GetStore",
  BindMasterCategory: "Master/BindCategoryForStockReport",
  BindMasterSubCategory: "Master/BindSubCategory",
  BindMasterItem: "Master/BindItemBySubCategory",
  BindIpdCaseType: "Master/BindIpdCaseType",
  BindSchedulerCharge: "Master/BindSchedulerCharge",
  BindMasterBindDischargeSteps: "Master/BindDischargeSteps",
  BindMasterBindIPDReport: "Master/BindIPDReport",
  BindMasterBindDischargeTypes: "Master/BindDischargeTypes",
  BindMasterBindDrugMaster: "Master/BindDrugMaster",
  BindMasterBindRoleName: "Master/BindRoleName",
  BindMasterBindVisitType: "Master/BindVisitType",
  BindMasterBindClinicName: "Master/BindClinicName",
  BindBindPrintTypeOption: "Master/BindPrintTypeOption",
  BindDoctorDept: "CommonAPI/bindDoctorDept",
  BindDepartment: "CommonAPI/bindDepartment",

  // <--------------------------------Report Builder Setup---------------------------->

  BindMasterBindCategory: "Master/BindCategory",
  BindMasterBindPanel: "Master/BindPanel",
  BindMasterData: "Master/MasterData",
  BindMasterMasterData: "Master/LoadItems",
  BindMasterSubReportList: "Master/SubReportList",
  BindPaymentMode: "Master/BindPaymentMode",
  BindGetTransactionTypes: "Master/BindTransactionType",
  BindEmployeeUser: "Master/BindEmployee",
  BindReportDataBuilder: "Master/ReportNameReportBuilder",
  BindSubReportDataBuilder: "Master/SubReportNameReportBuilder",
  BindMasterReportColumnField: "Master/BindReportColumnDetails",
  BindMasterGetReportColumnList: "Master/GetReportColumnList",
  BindMasterUserControls: "Master/BindUserControls",
  MasterBindUserGroupBy: "Master/BindUserGroupBy",
  MasterSaveReportMasterListUserWise: "Master/SaveReportMasterListUserWise",
  BindCommonAPIGetRoles: "CommonAPI/GetRoles",
  BindSubReportUserDepartment: "Master/BindReportAssignedDetails",
  BindMasterBindAddMoreColumns: "Master/BindAddMoreColumns",

  // <-------------------------------Report Group Master------------------------->

  BindSubReportData: "Master/SubReportName",
  BindSaveReportGroupMaster: "Master/SaveReportGroupMaster",
  BindReportGroupMaster: "Master/BindReportGroupMaster",

  // <----------------------------Report Master------------------------------>

  BindReportDataBuilder: "Master/ReportNameReportBuilder",
  BindSaveReport: "Master/SaveReportMaster",
  BindSubReportNameMaster: "Master/SubReportNameMaster",
  BindSaveSubReport: "Master/SaveSubReportMaster",
  BindColumnMaster: "Master/BindColumnMaster",
  BindSaveColumnMaster: "Master/SaveColumnMaster",
  BindReportMasterSavedData: "Master/BindReportMasterSavedData",
  BindReportCopyData: "Master/BindReportCopyData",
  BindSaveColumnSetupMaster: "Master/SaveColumnSetupMaster",
  BindFieldMaster: "Master/BindFieldMaster",
  BindFieldMappingData: "Master/BindFieldMappingData",
  BindSaveFieldMaster: "Master/SaveFieldMaster",
  ChangeFontSize: `CommonController/CombineMenuField`,

  // Manage SOP
  SaveSOPManager: `ManagerSOP/SaveSOPManager`,
  GetSOPData: `ManagerSOP/getSOPData`,
  UpdateSOPManager: `ManagerSOP/UpdateSOPManager`,
  GetSOPViewData: `ManagerSOP/getSOPViewData`,
  GetS3FileAsBase64: `ManagerSOP/GetS3FileAsBase64`,

  // Lab Worksheet Report
  GetLabWorkSheet: `RE/GetLabWorkSheet`,
  SearchPatientFeedback: `FeedBack/SearchPatientFeedback`,

  //Rate Type master export api
  GetCleintMasterData: `Centre/GetClientMasterData`,

  //Nepal Report 
  PanelReport  : `NepaliReports/PanelSaleReport`,
  SalesReport : `NepaliReports/AnnualSalesReport`,
  SummaryReport: `NepaliReports/UserCollectionReport`,
  GetAnualPanelReport: `NepaliReports/GetAnualPanelReport`,

  //Sample Storage
  GetDeviceData: `SampleStorage/GetDeviceData`,
  BindOldTray: `SampleStorage/BindOldTray`,
  BindTray: `SampleStorage/BindTray`
};
