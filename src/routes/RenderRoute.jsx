import React, { Fragment, Suspense, lazy, useEffect } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Loading from "@app/components/loader/Loading";
import ErrorBoundary from "../layouts/error-Boundary";
import Layout from "@app/layouts";
import Authenticated from "@app/Guard/Authenticated.jsx";
import Guest from "@app/Guard/Guest.jsx";
import B2BConnectAuthenticated from "@app/Guard/B2BConnectAuthenticated.jsx";
import { ToastContainer } from "react-toastify";
import AnimatedPage from "./AnimatedPage .jsx";
import { useLocalStorage } from "../utils/hooks/useLocalStorage";
import { loginFromToken } from "../store/reducers/authSlice/authSlice.js";
import { useDispatch } from "react-redux";
import HomeCollectionLiveTracking from "../modules/HomeCollectionLiveTracking.jsx";
import { cashFlowRoutes, FamilyMembershipCardRoutes, Logistic, TargetSheet, EQAS, RadiologyRoutes, SampleStorageRoutes, NewReports, ESG, UHIDNewPatientRegister, SRA, CombineResultEntry, LabWorksheet, SmartReport, ManagerSOP, LabWorksheetReport, FeedbackReport, CombineReports, CombineWorkSheetReports, HistoReport, CombineWorkSheetReports2, PolicyMaster, B2B, NepalReports, PatientInformationReport, UpdateInvoiceShare, LdplSmartPaymentGatewaythroughOtp, CombineCollectionReport, ESGReports, InterfaceCompanyMasterRoutes, FinanceRoutes, FormBuilderRoutes, NABLDocumentControl, EquipmentManagementRoutes } from "./RenderRouteEndPoints.js";
import { useIdleLogout } from "../utils/hooks/useIdleLogout";

const CompanyID = useLocalStorage("userData", "get")?.CompanyID;
const SuperAdmin = useLocalStorage("userData", "get")?.SuperAdmin;
function RenderRoute() {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const userData = useLocalStorage("userData", "get");
  const guest_Token = useLocalStorage("guest_token", "get");

  // Auto logout after a period of user inactivity, configured server-side (app-wide, single timer)
  useIdleLogout();


  const handleGenerate = async () => {
    dispatch(loginFromToken(""));
  };


  // useEffect(() => {
  //   if (
  //     ["/companymaster", "/page-control-master"].includes(
  //       location?.pathname?.toLowerCase(),
  //     ) &&
  //     SuperAdmin != 1
  //   ) {
  //     navigate("/Dashboard");
  //   }
  // }, [location]);

  useEffect(() => {
    if (guest_Token) {
      handleGenerate();
    } else {
      // window.history?.back();
    }
  }, [dispatch]);
  return (
    <>
      <ToastContainer
        autoClose={1000}
        draggable={false}
        position="top-right"
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnHover
      />
      <ErrorBoundary>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route
              path="/"
              element={
                userData ? (
                  <Navigate to="/dashboard" />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />



            {[...allRoutes["commonRoutes"], ...allRoutes["roleRoutes"]]?.map(
              (route, index) => {
                const Component = route?.component;
                const Layout = route?.layout || Fragment;
                const Guard = route?.Guard || Fragment;

                return (
                  <Route
                    path={route?.path}
                    exact={route?.exact}
                    key={index}
                    element={
                      <Guard>
                        <Layout>
                          <AnimatedPage>
                            <Component />
                          </AnimatedPage>
                        </Layout>
                      </Guard>
                    }
                  />
                );
              },
            )}
            <Route path="*" element={<Navigate to="/BlankPage" />} />
            {/* <Route path="/HomeCollectionLiveTracking" element={<HomeCollectionLiveTracking />} /> */}
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </>
  );
}

export default RenderRoute;

const allRoutes = {
  commonRoutes: [
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/dashboard",
      component: lazy(() =>
        CompanyID === 306
          ? import("@app/pages/MainDashboard.jsx")
          : import("@app/pages/MainDashboard.jsx"),
      ),
      exact: true,
    },
    {
      // Guard: Authenticated,
      layout: Layout,
      path: "/mainDashboard",
      component: lazy(() => import("@app/pages/MainDashboard.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/nextgen-preview",
      component: lazy(() => import("@app/Frontend/NextGen/ComponentPreview.jsx")),
      exact: true,
    },
    {
      Guard: Guest,
      path: "/login",
      component: lazy(() => import("../modules/login/Login")),
      exact: true,
    },
    // {
    //   path: "/ldpl-login",
    //   component: lazy(() => import("../modules/login/NewLogin/LoginPage.jsx")),
    //   exact: true,
    // },
    {
      path: "/CaptchaComponent",
      component: lazy(() => import("../modules/login/CaptchaComponent")),
      exact: true,
    },
    {
      path: "/PatientPortalLogin",
      component: lazy(() => import("../modules/login/PatientPortalLogin.jsx")),
      exact: true,
    },
    {
      path: "/B2BConnect/Login",
      component: lazy(() => import("../modules/login/B2BConnect/B2BConnectLogin.jsx")),
      exact: true,
    },
    {
      Guard: B2BConnectAuthenticated,
      path: "/B2BConnect/Dashboard",
      component: lazy(() => import("../Frontend/B2BConnect/B2BConnectDashboard.jsx")),
      exact: true,
    },
    {
      path: "/LabReport",
      component: lazy(() => import("../Frontend/Laboratory/LabReport.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/Welcome",
      component: lazy(() => import("../modules/login/Welcome")),
      exact: true,
    },
    {
      path: "/PrivacyPolicy",
      component: lazy(() => import("../modules/login/PrivacyPolicy")),
      exact: true,
    },
    {
      path: "/RefundPolicy",
      component: lazy(() => import("../modules/login/RefundPolicy")),
      exact: true,
    },
    {
      path: "/TermsAndCondition",
      component: lazy(() => import("../modules/login/TermsAndCondition")),
      exact: true,
    },

    {
      Guard: Guest,
      path: "/LabReport/GetLabReportFromQr/:id",
      component: lazy(() => import("../Frontend/Laboratory/LabReport.jsx")),
      exact: true,
    },
    {
      path: "/QRController/GetLabReportFromQr/:id",
      component: lazy(() => import("../Frontend/Laboratory/QRCodeReport.jsx")),
      exact: true,
    },
    {
      path: "/ForgetPassword",
      component: lazy(() => import("@app/modules/login/ForgetPassword.jsx")),
      exact: true,
    },
    {
      layout: Layout,
      path: "/BlankPage",
      component: lazy(() => import("../Frontend/BlankPage/BlankPage.jsx")),
      exact: true,
    },
    {
      path: "/SelfRegistration",
      component: lazy(() => import("../Frontend/Laboratory/SelfRegistration.jsx")),
      exact: true,
    },
    {
      path: "/QRStandee",
      component: lazy(() => import("../Frontend/Laboratory/QRStandee.jsx")),
      exact: true,
    },
  ],
  roleRoutes: [
    {
      Guard: Authenticated,
      layout: Layout,
      path: "*",
      component: lazy(() => import("../Frontend/BlankPage/BlankPage.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/patientregister",
      component: lazy(
        () => import("../Frontend/Laboratory/PatientRegistration.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/PatientRegistration",
      component: lazy(
        () => import("../Frontend/Laboratory/PatientRegistration.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/WorkOrder",
      component: lazy(
        () => import("../Frontend/Laboratory/PatientRegistration.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/workorder",
      component: lazy(
        () => import("../Frontend/Laboratory/PatientRegistration.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/TestWiseRecordUpdate",
      component: lazy(
        () => import("../Frontend/Laboratory/TestWiseRecordUpdate.jsx"),
      ),
      exact: true,
    },
    {
      // Guard: Authenticated,
      layout: Layout,
      path: "/TestWiseRecordUpdate",
      component: lazy(
        () => import("../Frontend/Laboratory/TestWiseRecordUpdate.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/DepartmentReceive",
      component: lazy(
        () => import("../Frontend/Laboratory/DepartmentReceive.jsx"),
      ),
      exact: true,
    },
    {
      // Guard: Authenticated,
      layout: Layout,
      path: "/DocumentScan",
      component: lazy(
        () => import("../Frontend/Laboratory/DocumentScan.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/TechnicianPending",
      component: lazy(
        () => import("../Frontend/Laboratory/DepartmentWisePendingList.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/SalesTree",
      component: lazy(() => import("../Frontend/Sales/SalesTree.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/payment-type",
      component: lazy(
        () => import("../Frontend/Laboratory/PaymentTypeSearch.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/ForceDepartmentReceive",
      component: lazy(
        () => import("../Frontend/Laboratory/ForceDepartmentReceive.jsx"),
      ),
      exact: true,
    },
    {
      // Guard: Authenticated,
      layout: Layout,
      path: "/TechnicianPending",
      component: lazy(
        () => import("../Frontend/Laboratory/DepartmentWisePendingList.jsx"),
      ),
      exact: true,
    },

    {
      Guard: Authenticated,
      layout: Layout,
      path: "/SalesTree",
      component: lazy(() => import("../Frontend/Sales/SalesTree.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/payment-type",
      component: lazy(
        () => import("../Frontend/Laboratory/PaymentTypeSearch.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/ForceDepartmentReceive",
      component: lazy(
        () => import("../Frontend/Laboratory/ForceDepartmentReceive.jsx"),
      ),
      exact: true,
    },
    {
      // Guard: Authenticated,
      layout: Layout,
      path: "/SMSData",
      component: lazy(() => import("../Frontend/Laboratory/SMSData.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/ResultEntry",
      component: lazy(() => import("../Frontend/Laboratory/ResultEntry.jsx")),
      exact: true,
    },
    {
      // Guard: Authenticated,
      layout: Layout,
      path: "/HomeCollectionLiveTracking",
      component: lazy(
        () => import("../modules/HomeCollectionLiveTracking.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/ResultEntry/:id",
      component: lazy(() => import("../Frontend/Laboratory/ResultEntry.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/DispatchReport",
      component: lazy(
        () => import("../Frontend/Laboratory/DispatchReport.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/DispatchLabSearch",
      component: lazy(
        () => import("../Frontend/Laboratory/DispatchLabSearch.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/ReceiptReprint",
      component: lazy(
        () => import("../Frontend/Laboratory/ReceiptReprint.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/EditPatientInfo",
      component: lazy(
        () => import("../Frontend/Laboratory/EditPatientInfo.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/EditPatientDetails",
      component: lazy(
        () => import("../Frontend/Laboratory/EditPatientDetails.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/SendSampleToLab",
      component: lazy(
        () => import("../Frontend/Laboratory/SendSampleToLab.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,

      path: "/dispatchsendsampledata",
      component: lazy(
        () => import("../Frontend/Laboratory/SendSampleData.jsx"),
      ),
      exact: true,
    },
    {
      // Guard: Authenticated,
      layout: Layout,
      path: "/DynamicLabSearch",
      component: lazy(
        () => import("../Frontend/Laboratory/DynamicLabSearch.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/DynamicReportSearch",
      component: lazy(
        () => import("../Frontend/Laboratory/DynamicReportSearch.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/BulkActivity",
      component: lazy(() => import("../Frontend/Laboratory/BulkActivity.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/BulkActivity2",
      component: lazy(() => import("../Frontend/Laboratory/BulkActivity2.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/CriticalCalloutRecord",
      component: lazy(
        () => import("../Frontend/Laboratory/CriticalCalloutRecord.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/ResultAllergy",
      component: lazy(
        () => import("../Frontend/Laboratory/ResultEntryAllergy.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/AllergyMaster",
      component: lazy(() => import("../Frontend/Master/AllergyMaster.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/CentrePanel",
      component: lazy(() => import("../Frontend/Master/CentrePanel.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/HistoTemplate",
      component: lazy(() => import("../Frontend/Master/HistoTemplate.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/HistoTemplateList",
      component: lazy(() => import("../Frontend/Master/HistoTemplateList.jsx")),
      exact: true,
    },
    {
      // Guard: Authenticated,
      layout: Layout,
      path: "/DepartmentMasterInterface",
      component: lazy(
        () => import("../Frontend/Master/DepartmentMasterInterface.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/SampleTypeMasterInterface",
      component: lazy(
        () => import("../Frontend/Master/SampleTypeMasterInterface.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/Departments",
      component: lazy(() => import("../Frontend/Master/Departments.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/LiveImageEditor",
      component: lazy(() => import("../Frontend/Master/LiveImageEditor.jsx")),
      exact: true,
    },
    {
      // Guard: Authenticated,
      layout: Layout,
      path: "/ChangePassword",
      component: lazy(() => import("../Frontend/Master/ChangePassword.jsx")),
      exact: true,
    },
    {
      // Guard: Authenticated,
      layout: Layout,
      path: "/B2BChangeOtherEmployeePassword",
      component: lazy(
        () => import("../Frontend/Master/B2BChangeOtherEmployeePassword.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/FieldBoyMaster",
      component: lazy(() => import("../Frontend/Master/FieldBoyMaster.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/FilterTableMaster",
      component: lazy(() => import("../Frontend/Master/FilterTableMaster.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/ResendSMS",
      component: lazy(() => import("../Frontend/Master/ResendSMS.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/CreateFieldBoyMaster",
      component: lazy(
        () => import("../Frontend/Master/CreateFieldBoyMaster.jsx"),
      ),
      exact: true,
    },
    {
      // Guard: Authenticated,
      layout: Layout,
      path: "/Designations",
      component: lazy(() => import("../Frontend/Master/Designations.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/SalesDesignation",
      component: lazy(() => import("../Frontend/Sales/SalesDesignation.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/SalesDesignationMaster",
      component: lazy(
        () => import("../Frontend/Sales/DesignationEmployeeMaster.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/DesignationsCreate",
      component: lazy(
        () => import("../Frontend/Master/DesignationsCreate.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/CentreMaster/:name",
      component: lazy(() => import("../Frontend/Master/CentreMaster.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/Settlement",
      component: lazy(() => import("../Frontend/Laboratory/Settlement.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/SingleBulkPanelChange",
      component: lazy(() => import("../Frontend/Laboratory/BulkPanel.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/BulkRegistration",
      component: lazy(
        () => import("../Frontend/Laboratory/BulkRegistration.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/GlobalTypeMaster",
      component: lazy(
        () => import("../Frontend/Laboratory/GlobalTypeMaster.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/ViewGlobalMaster",
      component: lazy(
        () => import("../Frontend/Laboratory/ViewGlobalMaster.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/getReport/:id",
      component: lazy(() => import("../Frontend/Reports/Report.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/CollectionReportUserwise",
      component: lazy(() => import("../Frontend/Reports/CollectionReportUserwise.jsx")),
      exact: true,
    },
    {
      // Guard: Authenticated,
      layout: Layout,
      path: "/PendingListReport",
      component: lazy(() => import("../Frontend/Reports/PendingListReport.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/ReportBuilder",
      component: lazy(() => import("../Frontend/Reports/ReportBuilder/ReportBuilder.jsx")),
      exact: true,
    },
    {
      // Guard: Authenticated,
      layout: Layout,
      path: "/ReportBuilderNew",
      component: lazy(() => import("../Frontend/ReportBuilderNew/ReportBuilderNew.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/ReportViewer",
      component: lazy(() => import("../Frontend/Reports/ReportViewer/ReportViewer.jsx")),
      exact: true,
    },

    {
      // Guard: Authenticated,
      layout: Layout,
      path: "/CentreMasterList/:name",
      component: lazy(() => import("../Frontend/Master/CentreMasterList.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/EmployeeMaster",
      component: lazy(() => import("../Frontend/Master/EmployeeMaster.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/CreateEmployeeMaster",
      component: lazy(
        () => import("../Frontend/Master/CreateEmployeeMaster.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/Investigations",
      component: lazy(() => import("../Frontend/Master/Investigations.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/DoctorOPDConsultationDoctorSetup",
      component: lazy(
        () => import("../Frontend/DoctorOPDConsultation/DoctorOPDConsultationDoctorSetup.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/DoctorOPDConsultationSearchDoctor",
      component: lazy(
        () => import("../Frontend/DoctorOPDConsultation/DoctorOPDConsultationSearchDoctor.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/DoctorOPDConsultationBooking",
      component: lazy(
        () => import("../Frontend/DoctorOPDConsultation/DoctorOPDConsultationBooking.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/DoctorOPDConsultationConfirmation",
      component: lazy(
        () => import("../Frontend/DoctorOPDConsultation/DoctorOPDConsultationConfirmation.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/DoctorOPDConsultationTokenDisplay",
      component: lazy(
        () => import("../Frontend/DoctorOPDConsultation/DoctorOPDConsultationTokenDisplay.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/DoctorOPDConsultationConsultationSearch",
      component: lazy(
        () => import("../Frontend/DoctorOPDConsultation/DoctorOPDConsultationConsultationSearch.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/DoctorOPDConsultationAppointmentSearch",
      component: lazy(
        () => import("../Frontend/DoctorOPDConsultation/DoctorOPDConsultationAppointmentSearch.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/InvestigationsList",
      component: lazy(
        () => import("../Frontend/Master/InvestigationsList.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/InvestigationRange",
      component: lazy(
        () => import("../Frontend/Master/InvestigationRange.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/InvestigationsInterpretion",
      component: lazy(
        () => import("../Frontend/Master/InvestigationsInterpretion.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/RequiredFields",
      component: lazy(
        () => import("../Frontend/Master/InvestigationsRequiredField.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/HelpMenu",
      component: lazy(
        () => import("../Frontend/Master/InvestigationsHelpMenu.jsx"),
      ),
      exact: true,
    },
    {
      // Guard: Authenticated,
      layout: Layout,
      path: "/InvestigationsComment",
      component: lazy(() => import("../Frontend/Master/InvestigationsComment")),
      exact: true,
    },
    {
      // Guard: Authenticated,
      layout: Layout,
      path: "/AllergyGroup",
      component: lazy(() => import("../Frontend/Master/AllergyGroupMapping")),
      exact: true,
    },
    {
      // Guard: Authenticated,
      layout: Layout,
      path: "/RateTypeMapping",
      component: lazy(() => import("../Frontend/Master/RateTypeMapping")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/OutSourceLabMaster",
      component: lazy(
        () => import("../Frontend/Master/OutSourceLabMaster.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/OutSourceTestMaster",
      component: lazy(
        () => import("../Frontend/Master/OutSourceTestMaster.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/OutSourceTestToOtherLab",
      component: lazy(
        () => import("../Frontend/Master/OutSourceTestToOtherLab.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/OutSourceTagging",
      component: lazy(() => import("../Frontend/Master/OutSourceTagging.jsx")),
      exact: true,
    },
    {
      // Guard: Authenticated,
      layout: Layout,
      path: "/MenuMaster",
      component: lazy(() => import("../Frontend/Master/MenuMaster.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/ImportExportInvestigations",
      component: lazy(
        () => import("../Frontend/Master/ImportExportInvestigations.jsx"),
      ),
      exact: true,
    },
    {
      // Guard: Authenticated,
      layout: Layout,
      path: "/PageMaster",
      component: lazy(() => import("../Frontend/Master/PageMaster.jsx")),
      exact: true,
    },
    {
      // Guard: Authenticated,
      layout: Layout,
      path: "/DynamicControl",
      component: lazy(
        () => import("../Frontend/Master/DynamicControl/DynamicControl.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/SubPageMaster",
      component: lazy(() => import("../Frontend/Master/SubPageMaster.jsx")),
      exact: true,
    },
    {
      // Guard: Authenticated,
      layout: Layout,
      path: "/PageControlMaster",
      component: lazy(() => import("../Frontend/Master/PageControlMaster.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/PrintBarCode",
      component: lazy(() => import("../Frontend/Laboratory/PrintBarCode.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/IDMaster",
      component: lazy(() => import("../Frontend/Master/IDMaster.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/InterfaceBookingData",
      component: lazy(
        () => import("../Frontend/Master/InterfaceBookingData.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/BulkSettlement",
      component: lazy(
        () => import("../Frontend/Laboratory/BulkSettlement.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/BulkSettlementPayment",
      component: lazy(
        () => import("../Frontend/Laboratory/BulkSettlementPayment.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/BulkSettlementPayment",
      component: lazy(
        () => import("../Frontend/Laboratory/BulkSettlementPayment.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/EmailTemplate",
      component: lazy(() => import("../Frontend/Laboratory/EmailTemplate.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/DownTimeMaster",
      component: lazy(
        () => import("../Frontend/Laboratory/DownTimeMaster.jsx"),
      ),
      exact: true,
    },
    {
      // Guard: Authenticated,
      layout: Layout,
      path: "/ResultCulture",
      component: lazy(() => import("../Frontend/Laboratory/ResultCulture.jsx")),
      exact: true,
    },

    {
      // Guard: Authenticated,
      layout: Layout,
      path: "/ticketing",
      component: lazy(() => import("../Frontend/TicketingModules/TicketingModule.jsx")),
      exact: true,
    },
    {
      // Guard: Authenticated,
      layout: Layout,
      path: "/CategoryMaster",
      component: lazy(() => import("../Frontend/TicketingModules/CategoryAndMISPage.jsx")),
      exact: true,
    },
    // {
    //   Guard: Authenticated,
    //   layout: Layout,
    //   path: "/petty-cash",
    //   component: lazy(() => import("../Frontend/PettyCash/PettyCashModule.jsx")),
    //   exact: true,
    // },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/petty-cash/expense-type",
      component: lazy(() => import("../Frontend/PettyCash/components/ExpenseTypeMaster.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/petty-cash/issue-transfer",
      component: lazy(() => import("../Frontend/PettyCash/components/IssueAcceptReject.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/petty-cash/expense-approval",
      component: lazy(() => import("../Frontend/PettyCash/components/ExpenseApproval.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/petty-cash/ledger",
      component: lazy(() => import("../Frontend/PettyCash/components/Ledger.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/petty-cash/rejected-records",
      component: lazy(() => import("../Frontend/PettyCash/components/RejectedRecords.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/ChangeDeliveryStatus",
      component: lazy(
        () => import("../Frontend/Laboratory/ChangeDeliveryStatus.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/MicroLabEntry",
      component: lazy(() => import("../Frontend/Laboratory/MicroLabEntry.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/LedgerStatus",
      component: lazy(() => import("../Frontend/Invoicing/LedgerStatus.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/LedgerStatusAsOnDate",
      component: lazy(
        () => import("../Frontend/Invoicing/LedgerStatusAsOnDate.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/LedgerTransaction",
      component: lazy(
        () => import("../Frontend/Invoicing/LedgerTransaction.jsx"),
      ),
      exact: true,
    },

    {
      // Guard: Authenticated,
      layout: Layout,
      path: "/LedgerTransaction/:id",
      component: lazy(
        () => import("../Frontend/Invoicing/LedgerTransaction.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/Credit-Ledger",
      component: lazy(
        () => import("../Frontend/Invoicing/LedgerTransaction.jsx"),
      ),
      exact: true,
    },
    {
      // Guard: Authenticated,
      layout: Layout,
      path: "/LedgerStatement",
      component: lazy(
        () => import("../Frontend/Invoicing/LedgerStatement.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/AdvancePayment",
      component: lazy(() => import("../Frontend/Invoicing/AdvancePayment.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/LedgerReport",
      component: lazy(() => import("../Frontend/Invoicing/LedgerReport.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/ledger-statement-report",
      component: lazy(
        () => import("../Frontend/Invoicing/LedgerStatementReport.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/monthly-invoice-report",
      component: lazy(
        () => import("../Frontend/Invoicing/MonthlyInvoiceReport.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/DailyOSReport",
      component: lazy(() => import("../Frontend/Invoicing/DailyOSReport.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/InvoiceCreation",
      component: lazy(
        () => import("../Frontend/Invoicing/InvoiceCreation.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/InvoiceCancel",
      component: lazy(() => import("../Frontend/Invoicing/InvoiceCancel.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/InvoiceReprint",
      component: lazy(() => import("../Frontend/Invoicing/InvoiceReprint.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/PrePrintedBarcode",
      component: lazy(() => import("../Frontend/Invoicing/PrePrintedBarcode.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/InvoiceVerification",
      component: lazy(() => import("../Frontend/Invoicing/InvoiceVerification.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/ValidatePayment",
      component: lazy(
        () => import("../Frontend/Invoicing/ValidatePayment.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/OnlinePaymentPage",
      component: lazy(
        () => import("../Frontend/CompanyMaster/OnlinePaymentPage.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/CompanyKey",
      component: lazy(() => import("../Frontend/CompanyMaster/CompanyKey.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/CompanyPaymentDetail",
      component: lazy(
        () => import("../Frontend/CompanyMaster/CompanyPaymentDetail.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/CompanyWiseUpdate",
      component: lazy(
        () => import("../Frontend/CompanyMaster/CompanyWiseUpdate.jsx"),
      ),
      exact: true,
    },
    {
      // Guard: Authenticated,
      layout: Layout,
      path: "/CompanyMaster",
      component: lazy(
        () => import("../Frontend/CompanyMaster/CompanyMaster.jsx"),
      ),
      exact: true,
    },
    {
      // Guard: Authenticated,
      layout: Layout,
      path: "/CompanyMasterList",
      component: lazy(
        () => import("../Frontend/CompanyMaster/CompanyMasterList.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/DiscountAfterBill",
      component: lazy(
        () => import("../Frontend/Administrator/DiscountAfterBill.jsx"),
      ),
      exact: true,
    },
    {
      // Guard: Authenticated,
      layout: Layout,
      path: "/CreditLedger",
      component: lazy(
        () => import("../Frontend/Administrator/CreditLedger.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/TermsAndConditions",
      component: lazy(
        () => import("../Frontend/Laboratory/TermsAndConditions.jsx"),
      ),
      exact: true,
    },
    // report repush
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/RepushReportMaster",
      component: lazy(
        () => import("../Frontend/Master/RepushReport/RepushReport.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/FTPMaster",
      component: lazy(() => import("../Frontend/Master/FTPmaster.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/RefundAfterBill",
      component: lazy(
        () => import("../Frontend/Administrator/RefundAfterBill.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/SettlementPatient",
      component: lazy(
        () => import("../Frontend/Administrator/SettlementPatient.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/DiscountMasterEmployeeWise",
      component: lazy(
        () =>
          import("../Frontend/Administrator/DiscountMasterEmployeeWise.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/ChangePaymentMode",
      component: lazy(
        () => import("../Frontend/Administrator/ChangePaymentMode.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/ChangeSampleStatus",
      component: lazy(
        () => import("../Frontend/Administrator/ChangeSampleStatus.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/ChangeBarCode",
      component: lazy(
        () => import("../Frontend/Administrator/ChangeBarCode.jsx"),
      ),
      exact: true,
    },
    {
      // Guard: Authenticated,
      layout: Layout,
      path: "/ChangeCentre",
      component: lazy(
        () => import("../Frontend/Administrator/ChangeCentre.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/DiscountApproval",
      component: lazy(
        () => import("../Frontend/Administrator/DiscountApproval.jsx"),
      ),
      exact: true,
    },

    {
      Guard: Authenticated,
      layout: Layout,
      path: "/RevertDiscountApprovalStatus",
      component: lazy(
        () =>
          import("../Frontend/Administrator/RevertDiscountApprovalStatus.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/ModalityMaster",
      component: lazy(() => import("../Frontend/Radiology/ModalityMaster.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/TokenGenerationMaster",
      component: lazy(
        () => import("../Frontend/Radiology/TokenGenerationMaster.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/ScRoomMaster",
      component: lazy(() => import("../Frontend/Radiology/ScRoomMaster.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/InvestigationTimeSlotMaster",
      component: lazy(
        () => import("../Frontend/Radiology/InvestigationTimeSlotMaster.jsx"),
      ),
      exact: true,
    },

    {
      Guard: Authenticated,
      layout: Layout,
      path: "/AgeWiseDiscount",
      component: lazy(() => import("../Frontend/Master/AgeWiseDiscount.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/AgeWiseDiscountList",
      component: lazy(
        () => import("../Frontend/Master/AgeWiseDiscountList.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/BreakpointPage",
      component: lazy(() => import("../Frontend/Master/BreakpointPage.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/ResultEntryDynamicValue",
      component: lazy(() => import("../Frontend/Master/ResultEntryMaster.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/CancelReceipt",
      component: lazy(() => import("../Frontend/Master/CancelReceipt.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/CenterAccess",
      component: lazy(() => import("../Frontend/Master/CenterAccess.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/CentreTypeMaster",
      component: lazy(() => import("../Frontend/Master/CentreTypeMaster.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/CreateDoctorReferal",
      component: lazy(
        () => import("../Frontend/Master/CreateDoctorMaster.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/TempDoctor",
      component: lazy(
        () => import("../Frontend/Master/TempDoctor.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/DoctorReferal",
      component: lazy(() => import("../Frontend/Master/DoctorMaster.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/DoctorMisReportPage",
      component: lazy(
        () => import("../Frontend/Master/DoctorMisReportPage.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/DoctorShareMaster",
      component: lazy(() => import("../Frontend/Master/DoctorShareMaster.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/DoctorTypeCopyShare",
      component: lazy(
        () => import("../Frontend/Master/DoctorTypeCopyShare.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/FormulaMaster",
      component: lazy(() => import("../Frontend/Master/FormulaMaster.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/ImportExportExcel",
      component: lazy(() => import("../Frontend/Master/ImportExportExcel.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/InvalidContactNumber",
      component: lazy(
        () => import("../Frontend/Master/InvalidContactNumber.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/InvestigationCommentMaster",
      component: lazy(
        () => import("../Frontend/Master/InvestigationCommentMaster.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/InvestigationCommentMasterList",
      component: lazy(
        () => import("../Frontend/Master/InvestigationCommentMasterList.jsx"),
      ),
      exact: true,
    },
    {
      // Guard: Authenticated,
      layout: Layout,
      path: "/GlobalInvestigations",
      component: lazy(
        () => import("../Frontend/Master/GlobalInvestigations.jsx"),
      ),
      exact: true,
    },
    {
      // Guard: Authenticated,
      layout: Layout,
      path: "/GlobalInvestigations",
      component: lazy(
        () => import("../Frontend/Master/GlobalInvestigations.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/LoadData",
      component: lazy(() => import("../Frontend/Master/LoadData.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/MacData",
      component: lazy(() => import("../Frontend/Master/MacData.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/MachineReferenceRangeMaster",
      component: lazy(
        () => import("../Frontend/Master/MachineReferenceRangeMaster.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/MacObservation",
      component: lazy(() => import("../Frontend/Master/MacObservation.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/ManageDeliveryDays",
      component: lazy(
        () => import("../Frontend/Master/ManageDeliveryDays.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/ManageFieldMaster",
      component: lazy(() => import("../Frontend/Master/ManageFieldMaster.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/VisitTypeCategory",
      component: lazy(() => import("../Frontend/Master/VisitTypeCategory.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/ManageHoliday",
      component: lazy(() => import("../Frontend/Master/ManageHoliday.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/ManageOrdering",
      component: lazy(() => import("../Frontend/Master/ManageOrdering.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/MergeDoctor",
      component: lazy(() => import("../Frontend/Master/MergeDoctor.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/MicroBiologyMaster",
      component: lazy(
        () => import("../Frontend/Master/MicroBiologyMaster.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/MicroBiologyMasterMapping",
      component: lazy(
        () => import("../Frontend/Master/MicroBiologyMasterMapping.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/RateList",
      component: lazy(() => import("../Frontend/Master/RateList.jsx")),
      exact: true,
    },
    {
      // Guard: Authenticated,
      layout: Layout,
      path: "/RateListPercentage",
      component: lazy(() => import("../Frontend/Master/RateListPercentage/RateListPercentage.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/ScheduleRateList",
      component: lazy(() => import("../Frontend/Master/ScheduleRateList.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/RateListReport",
      component: lazy(() => import("../Frontend/Master/RateListReport.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/RateTypeShareMaster",
      component: lazy(
        () => import("../Frontend/Master/RateTypeShareMaster.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/RateTypeCommissionMaster",
      component: lazy(
        () => import("../Frontend/Master/RateTypeCommissionMaster.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/RateTypeCommissionReport",
      component: lazy(
        () => import("../Frontend/Master/RateTypeCommissionReport.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/CentreShareMaster",
      component: lazy(
        () => import("../Frontend/Master/CentreShareMaster.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/CentreShareReport",
      component: lazy(
        () => import("../Frontend/Master/CentreShareReport.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/Rate/:id",
      component: lazy(() => import("../Frontend/Master/RateTypeCopyShare.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/SampleType",
      component: lazy(() => import("../Frontend/Master/SampleTypeCreate.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/setDoctor",
      component: lazy(() => import("../Frontend/Master/SetDoctorShare.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/DoctorShareMaster2",
      component: lazy(() => import("../Frontend/Master/DoctorShareMaster2.jsx")),
      exact: true,
    },
    ///////////rejectionProcess/////////
    {
      // Guard: Authenticated,
      layout: Layout,
      path: "/RejectionProcess",
      component: lazy(
        () => import("../Frontend/RejectionProcess/RejectionProcess.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/TestMappingCenter",
      component: lazy(() => import("../Frontend/Master/TestCentreMapping.jsx")),
      exact: true,
    },
    {
      // Guard: Authenticated,
      layout: Layout,
      path: "/CampApprovalRightMaster",
      component: lazy(
        () => import("../Frontend/Camp/CampApprovalRightMaster.jsx"),
      ),
      exact: true,
    },
    {
      // Guard: Authenticated,
      layout: Layout,
      path: "/CampConfigurationMaster",
      component: lazy(
        () => import("../Frontend/Camp/CampConfigurationMaster.jsx"),
      ),
      exact: true,
    },
    {
      // Guard: Authenticated,
      layout: Layout,
      path: "/CampConfigurationApproval",
      component: lazy(
        () => import("../Frontend/Camp/CampConfigurationApproval.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/CampCreationSearch",
      component: lazy(() => import("../Frontend/Camp/CampCreationSearch.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/CampRequestApproval",
      component: lazy(() => import("../Frontend/Camp/CampRequestApproval.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/CampCreationMaster",
      component: lazy(() => import("../Frontend/Camp/CampCreationMaster.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/CampDetailsReports",
      component: lazy(() => import("../Frontend/Camp/CampDetailsReports.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/CampReject",
      component: lazy(() => import("../Frontend/Camp/CampReject.jsx")),
      exact: true,
    },
    // -------------------HOME COLLECTION-----------------
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/HomeCollectionLocationMaster",
      component: lazy(
        () =>
          import("../Frontend/HomeCollection/HomeCollectionLocationMaster.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/HomeCollectionRoutes",
      component: lazy(
        () => import("../Frontend/HomeCollection/HomeCollectionRoutes.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/PhlebotomistMapping",
      component: lazy(
        () => import("../Frontend/HomeCollection/PhelebotomistMapping.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/CallCentre",
      component: lazy(
        () => import("../Frontend/HomeCollection/CallCentre.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/TemporaryPhlebotomist",
      component: lazy(
        () => import("../Frontend/HomeCollection/TemporaryPhlebotomist.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/HCPhleboLoginDetails",
      component: lazy(
        () => import("../Frontend/HomeCollection/HCPhelboLoginDetails.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/HCPhlebotomistHoliday",
      component: lazy(
        () => import("../Frontend/HomeCollection/PhlebotomistHoliday.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/HCPatientEdit",
      component: lazy(
        () => import("../Frontend/HomeCollection/HCPatientEdit.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/HCChangePhlebotomist",
      component: lazy(
        () => import("../Frontend/HomeCollection/HCChangePhlebotomist.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/HCChangeDropLocation",
      component: lazy(
        () => import("../Frontend/HomeCollection/HCChangeDropLocation.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/HCTemporaryPhleboApproval",
      component: lazy(
        () => import("../Frontend/HomeCollection/HCTemporaryPhelboAproval.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/PhlebotomistRegistration",
      component: lazy(
        () =>
          import("../Frontend/HomeCollection/PhelebotomistRegisteration.jsx"),
      ),
      exact: true,
    },

    {
      Guard: Authenticated,
      layout: Layout,
      path: "/PhlebotomistCallTransfer",
      component: lazy(
        () => import("../Frontend/HomeCollection/PhelbomistCallTransfer.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/PhelebotomistMapping",
      component: lazy(
        () => import("../Frontend/HomeCollection/PhelebotomistMapping.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/HCPhelboLoginDetails",
      component: lazy(
        () => import("../Frontend/HomeCollection/HCPhelboLoginDetails.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/HCTemporaryPhelboAproval",
      component: lazy(
        () => import("../Frontend/HomeCollection/HCTemporaryPhelboAproval.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/PhelebotomistRegisteration",
      component: lazy(
        () =>
          import("../Frontend/HomeCollection/PhelebotomistRegisteration.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/PhelbomistCallTransfer",
      component: lazy(
        () => import("../Frontend/HomeCollection/PhelbomistCallTransfer.jsx"),
      ),
      exact: true,
    },
    // -------------------HOME COLLECTION END -----------------
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/CampRequest",
      component: lazy(() => import("../Frontend/Camp/CampRequest.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/MembershipCardMaster",
      component: lazy(
        () => import("../Frontend/MembershipCard/MembershipCardMaster.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/MembershipCardSearch",
      component: lazy(
        () => import("../Frontend/MembershipCard/MembershipCardSearch.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/MemberShipCardEdit",
      component: lazy(
        () => import("../Frontend/MembershipCard/MemberShipCardEdit.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/MembershipCardItemMapping",
      component: lazy(
        () =>
          import("../Frontend/MembershipCard/MembershipCardItemMapping.jsx"),
      ),
      exact: true,
    },
    {
      // Guard: Authenticated,
      layout: Layout,
      path: "/MembershipCardIssue",
      component: lazy(
        () => import("../Frontend/MembershipCard/MembershipCardIssue.jsx"),
      ),
      exact: true,
    },

    {
      Guard: Authenticated,
      layout: Layout,
      path: "/HomeCollectionSearch",
      component: lazy(
        () => import("../Frontend/HomeCollection/HomeCollectionSearch.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/HomeCollectionCalender",
      component: lazy(
        () => import("../Frontend/HomeCollection/HomeCollectionCalender.jsx"),
      ),
      exact: true,
    },

    {
      // Guard: Authenticated,
      layout: Layout,
      path: "/LocationMaster",
      component: lazy(
        () => import("../Frontend/HomeCollection/LocationMaster.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/RoleMaster",
      component: lazy(() => import("../Frontend/Master/RoleMaster.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/RoleMaster",
      component: lazy(() => import("../Frontend/Master/RoleMaster.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/ItemMasterInterface",
      component: lazy(
        () => import("../Frontend/Master/ItemMasterInterface.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/HimsToLims",
      component: lazy(() => import("../Frontend/Master/HimsToLims.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/CentreMasterInterface",
      component: lazy(
        () => import("../Frontend/Master/CentreMasterInterface.jsx"),
      ),
      exact: true,
    },
    // {
    //   Guard: Authenticated,
    //   layout: Layout,
    //   path: "/InterfaceCompanyMaster",
    //   component: lazy(
    //     () => import("../Frontend/Master/InterfaceCompanyMaster.jsx"),
    //   ),
    //   exact: true,
    // },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/ManageNabl",
      component: lazy(() => import("../Frontend/Master/ManageNabl.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/ObservationNabl",
      component: lazy(() => import("../Frontend/Master/ObservationNabl.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/InvestigationRequiredMaster",
      component: lazy(
        () => import("../Frontend/Master/InvestigationRequiredMaster.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/MachineGroup",
      component: lazy(() => import("../Frontend/Machine/MachineGroup.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/MachineMaster",
      component: lazy(() => import("../Frontend/Machine/MachineMaster.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/MachineParams",
      component: lazy(() => import("../Frontend/Machine/MachineParams.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/TransferMachineRanges",
      component: lazy(
        () => import("../Frontend/Machine/TransferMachineRanges.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/MachineReading",
      component: lazy(() => import("../Frontend/Machine/MachineReading.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/DaySpecialTest",
      component: lazy(() => import("../Frontend/Extra/DaySpecialTest.jsx")),
      exact: true,
    },

    {
      Guard: Authenticated,
      layout: Layout,
      path: "/CouponMaster",
      component: lazy(
        () => import("../Frontend/CouponMaster/CouponMaster.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/CouponMasterApproval",
      component: lazy(
        () => import("../Frontend/CouponMaster/CouponMasterApproval.jsx"),
      ),
      exact: true,
    },
    {
      // Guard: Authenticated,
      layout: Layout,
      path: "/CouponManageApproval",
      component: lazy(
        () => import("../Frontend/CouponMaster/CouponManageApproval.jsx"),
      ),
      exact: true,
    },
    {
      // Guard: Authenticated,
      layout: Layout,
      path: "/equipmentmanager/equipment-maintanance",
      component: lazy(
        () =>
          import(
            "../Frontend/EquipementManagement/equipmentMaintenanace/EquipementMaintenance.jsx"
          ),
      ),
      exact: true,
    },

    {
      Guard: Authenticated,
      layout: Layout,
      path: "/equipmentmanager/virtual-department",
      component: lazy(
        () =>
          import(
            "../Frontend/EquipementManagement/virtualDepartment/VirtualDepartment.jsx"
          ),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/equipmentmanager/breakdown-summary",
      component: lazy(
        () =>
          import(
            "../Frontend/EquipementManagement/equipmentMaintenanace/BreakdownSummary.jsx"
          ),
      ),
      exact: true,
    },

    //---------------------------EQUIPMENT--------------------------
    {
      // Guard: Authenticated,
      layout: Layout,
      path: "/equipmentmanager/equipment-hub",
      component: lazy(
        () =>
          import(
            "../Frontend/EquipementManagement/EquipmentManagementHub.jsx"
          ),
      ),
      exact: true,
    },
    {
      // Guard: Authenticated,
      layout: Layout,
      path: "/equipmentmanager/equipment-master",
      component: lazy(
        () =>
          import(
            "../Frontend/EquipementManagement/equipmentMaster/EquipmentMaster.jsx"
          ),
      ),
      exact: true,
    },
    {
      // Guard: Authenticated,
      layout: Layout,
      path: "/equipmentmanager/equipment-transfer",
      component: lazy(
        () =>
          import(
            "../Frontend/EquipementManagement/equipmentTransfer/EquipmentTransfer.jsx"
          ),
      ),
      exact: true,
    },
    {
      // Guard: Authenticated,
      layout: Layout,
      path: "/equipmentmanager/equipment-dashboard",
      component: lazy(
        () =>
          import(
            "../Frontend/EquipementManagement/equipmentDashboard/EquipmentDashboard.jsx"
          ),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/equipmentmanager/equipment-maintanance",
      component: lazy(
        () =>
          import(
            "../Frontend/EquipementManagement/equipmentMaintenanace/EquipementMaintenance.jsx"
          ),
      ),
      exact: true,
    },

    {
      Guard: Authenticated,
      layout: Layout,
      path: "/equipmentmanager/virtual-department",
      component: lazy(
        () =>
          import(
            "../Frontend/EquipementManagement/virtualDepartment/VirtualDepartment.jsx"
          ),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/equipmentmanager/breakdown-summary",
      component: lazy(
        () =>
          import(
            "../Frontend/EquipementManagement/equipmentMaintenanace/BreakdownSummary.jsx"
          ),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/ExportInvInterpretation",
      component: lazy(
        () => import("../Frontend/Master/ExportInvInterpretation.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/ReportHeaderSetupMaster",
      component: lazy(
        () => import("../Frontend/Master/ReportHeaderSetupMaster.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/CompanyWiseTemplateMapping",
      component: lazy(
        () => import("../Frontend/Master/CompanyWiseTemplateMapping.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/ReportBill",
      component: lazy(() => import("../Frontend/Master/ReportBill.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/HistoCytoGrossingAndSliding",
      component: lazy(
        () => import("../Frontend/Laboratory/HistoCytoGrossingAndSliding.jsx"),
      ),
      exact: true,
    },
    // {
    //   Guard: Authenticated,
    //   layout: Layout,
    //   path: "/HistoCytoResultEntrySecondPage",
    //   component: lazy(
    //     () =>
    //       import("../Frontend/Laboratory/HistoCytoResultEntrySecondPage.jsx"),
    //   ),
    //   exact: true,
    // },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/MailStatus",
      component: lazy(() => import("../Frontend/Laboratory/MailStatus.jsx")),
      exact: true,
    },
    {
      // Guard: Authenticated,
      layout: Layout,
      path: "/EstimateRatenew",
      component: lazy(() => import("../Frontend/Master/EstimateRatenew.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/ConcentFormMaster",
      component: lazy(
        () => import("../Frontend/Laboratory/ConcentFormMaster.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/ConcentFormList",
      component: lazy(
        () => import("../Frontend/Laboratory/ConcentFormList.jsx"),
      ),
      exact: true,
    },
    ////////////machine Mapping Master///
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/MachineMappingMaster",
      component: lazy(
        () =>
          import("../Frontend/MachineMappingMaster/MachineMappingMaster.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/MachineMappingMaster",
      component: lazy(
        () =>
          import("../Frontend/MachineMappingMaster/MachineMappingMaster.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/CompanyWiseSmsCountAndWhatsAppCount",
      component: lazy(
        () => import("../Frontend/Master/CompanyWiseSmsWPCount.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/referlab-master",
      component: lazy(
        () => import("../Frontend/Master/ReferLabMaster/ReferLabMaster.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/advance-rolling-ledger",
      component: lazy(
        () =>
          import("../Frontend/AdvanceRollingLedger/AdvanceRollingLedger.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/CentreManager/:name",
      component: lazy(() => import("../Frontend/Master/CenterManager.jsx")),
      exact: true,
    },
    {
      // Guard: Authenticated,
      layout: Layout,
      path: "/CentreManagerList/:name",
      component: lazy(() => import("../Frontend/Master/CentreManagerList.jsx")),
      exact: true,
    },
    {
      // Guard: Authenticated,
      // layout: Layout,
      path: "/payment-gateway",
      component: lazy(
        () => import("../Frontend/PaymentGatewayLanding/LoginWithOtp.jsx"),
      ),
      exact: true,
    },
    {
      // Guard: Authenticated,
      // layout: Layout,
      path: "/payment-gateway/verifyGateway",
      component: lazy(
        () => import("../Frontend/PaymentGatewayLanding/VerifyPanelCode.jsx"),
      ),
      exact: true,
    },

    {
      Guard: Authenticated,
      layout: Layout,
      path: "/B2BChangePassword",
      component: lazy(
        () => import("../Frontend/B2BChangePassword/B2BChangePassword.jsx"),
      ),
      exact: true,
    },
    {
      // Guard: Authenticated,
      layout: Layout,
      path: "/tool/master",
      component: lazy(() => import("../Frontend/Tool/Master.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/signature-maping-master",
      component: lazy(() => import("../Frontend/Master/SignatureMaping.jsx")),
      exact: true,
    },
    {
      // Guard: Authenticated,
      layout: Layout,
      path: "/AutoApproveCentreInvestigation",
      component: lazy(
        () => import("../Frontend/Master/AutoApproveCentreInvestigation.jsx"),
      ),
      exact: true,
    },
    {
      // Guard: Authenticated,
      layout: Layout,
      path: "/InvestigationMaster",
      component: lazy(
        () => import("../Frontend/Master/InvestigationMaster.jsx"),
      ),
      exact: true,
    },
    {
      // Guard: Authenticated,
      layout: Layout,
      path: "/CentreAuditWork",
      component: lazy(
        () => import("../Frontend/Master/CentreAuditWork/CentreAuditWork.jsx"),
      ),
      exact: true,
    },

    {
      // Guard: Authenticated,
      layout: Layout,
      path: "/CentreAuditWork",
      component: lazy(
        () => import("../Frontend/Master/CentreAuditWork/CentreAuditWork.jsx"),
      ),
      exact: true,
    },
    {
      // Guard: Authenticated,
      layout: Layout,
      path: "/NepalDateEditor",
      component: lazy(() => import("../Frontend/Nepal/NepalDateEditor.jsx")),
      exact: true,
    },
    {
      // Guard: Authenticated,
      layout: Layout,
      path: "/EstimateRatenewList",
      component: lazy(
        () => import("../Frontend/Master/EstimateRatenewList.jsx"),
      ),
      exact: true,
    },

    {
      Guard: Authenticated,
      layout: Layout,
      path: "/control-master",
      component: lazy(
        () =>
          import(
            "../Frontend/QualityControl/IQC/controlMaster/ControlMaster.jsx"
          ),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/centre-control-mapping",
      component: lazy(
        () =>
          import(
            "../Frontend/QualityControl/IQC/centreControlMapping/CentreControlMapping.jsx"
          ),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/manage-approval-quality",
      component: lazy(
        () =>
          import(
            "../Frontend/QualityControl/IQC/manageApprovalQuality/ManageApprovalQuality.jsx"
          ),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/westgard-rule-master",
      component: lazy(
        () =>
          import(
            "../Frontend/QualityControl/IQC/westgardRuleMaster/WestgardRuleMaster.jsx"
          ),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/QC-remarks-master",
      component: lazy(
        () =>
          import(
            "../Frontend/QualityControl/IQC/qcRemarksMaster/QCRemarksMaster.jsx"
          ),
      ),
      exact: true,
    },

    {
      Guard: Authenticated,
      layout: Layout,
      path: "/QualityQuestionMaster",
      component: lazy(
        () =>
          import(
            "../Frontend/QualityControl/IQC/qualityQuestionMaster/QualityQuestionMaster.jsx"
          ),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/QCReport",
      component: lazy(
        () => import("../Frontend/QualityControl/IQC/qcReport/QCReport.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/QualityControl",
      component: lazy(
        () => import("../Frontend/QualityControl/IQC/qcReport/QCReport.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/qualitycontrol",
      component: lazy(
        () => import("../Frontend/QualityControl/IQC/qcReport/QCReport.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/Qcmisreport",
      component: lazy(
        () =>
          import("../Frontend/QualityControl/IQC/qcmisreport/Qcmisreport.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/Qcvalueentry",
      component: lazy(
        () =>
          import(
            "../Frontend/QualityControl/IQC/qcvalueentry/Qcvalueentry.jsx"
          ),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/control-transfer",
      component: lazy(
        () =>
          import(
            "../Frontend/QualityControl/IQC/controltransfer/ControlTransfer.jsx"
          ),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/excel-upload",
      component: lazy(
        () =>
          import("../Frontend/QualityControl/IQC/excelUpload/ExcelUpload.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/SyncQCtoOfflineServer",
      component: lazy(
        () =>
          import(
            "../Frontend/QualityControl/IQC/syncQCtoOfflineServer/SyncQCtoOfflineServer.jsx"
          ),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/b2b-discount",
      component: lazy(
        () => import("../Frontend/Invoicing/B2BDiscount/B2BDiscount.jsx"),
      ),
      exact: true,
    },
    {
      // Guard: Authenticated,
      layout: Layout,
      path: "/page-control-master",
      component: lazy(
        () =>
          import("../Frontend/Master/PageControlMaster/PageControlMaster.jsx"),
      ),
      exact: true,
    },
    {
      // Guard: Authenticated,
      layout: Layout,
      path: "/page-control-master",
      component: lazy(
        () =>
          import("../Frontend/Master/PageControlMaster/PageControlMaster.jsx"),
      ),
      exact: true,
    },
    //ticketing
    {
      // Guard: Authenticated,
      layout: Layout,
      path: "/ticketing/category-master",
      component: lazy(() => import("../Frontend/Ticketing/CategoryMaster.jsx")),
      exact: true,
    },
    {
      // Guard: Authenticated,
      layout: Layout,
      path: "/ticketing/ManageQuery",
      component: lazy(() => import("../Frontend/TicketingModules/components/TicketingManageQuery.jsx")),
      exact: true,
    },
    {
      // Guard: Authenticated,
      layout: Layout,
      path: "/ticketing/ManageResponse",
      component: lazy(() => import("../Frontend/TicketingModules/components/ManageResponse.jsx")),
      exact: true,
    },
    {
      // Guard: Authenticated,
      layout: Layout,
      path: "/ticketing/NewTicket",
      component: lazy(() => import("../Frontend/ManageQuery/NewSupportQuery.jsx")),
      exact: true,
    },
    {
      // Guard: Authenticated,
      layout: Layout,
      path: "/ticketing/DueTicket",
      component: lazy(() => import("../Frontend/ManageQuery/ViewIssue.jsx")),
      exact: true,
    },
    {
      // Guard: Authenticated,
      layout: Layout,
      path: "/ticketing/category-tagEmployee",
      component: lazy(() => import("../Frontend/Ticketing/TagEmployee.jsx")),
      exact: true,
    },
    // {
    //   // Guard: Authenticated,
    //   layout: Layout,
    //   path: "/SampleStorageTypeMaster",
    //   component: lazy(
    //     () =>
    //       import(
    //         "../Frontend/SampleStorage/sampleStorageMaster/TrackMaster.jsx"
    //       )
    //   ),
    //   exact: true,
    // },
    // {
    //   Guard: Authenticated,
    //   layout: Layout,
    //   path: "/SampleStorageTrayMaster",
    //   component: lazy(
    //     () =>
    //       import("../Frontend/SampleStorage/sampleStorageMaster/TrayMaster.jsx")
    //   ),
    //   exact: true,
    // },
    {
      // Guard: Authenticated,
      layout: Layout,
      path: "/LatLongDashboard",
      component: lazy(
        () => import("../Frontend/HomeCollection/LatLongDashboard.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/Vehicle-master",
      component: lazy(
        () => import("../Frontend/Ambulance/AmbulanceMaster/VehicleMaster.jsx"),
      ),
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/HistoCytoResultEntry",
      component: lazy(
        () => import("../Frontend/Laboratory/HistoCytoResultEntry.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/Reading-master",
      component: lazy(
        () => import("../Frontend/Ambulance/AmbulanceMaster/ReadingMaster.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/Driver-master",
      component: lazy(
        () => import("../Frontend/Ambulance/AmbulanceMaster/DriverMaster.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/Ambulance-master",
      component: lazy(
        () => import("../Frontend/Ambulance/AmbulanceMaster.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/Patient-request",
      component: lazy(
        () =>
          import(
            "../Frontend/Ambulance/PatientRequisition/PatientRequisition.jsx"
          ),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/Patient-request-status",
      component: lazy(
        () =>
          import(
            "../Frontend/Ambulance/PatientRequisition/PatientVehicleRequestStatus.jsx"
          ),
      ),
      exact: true,
    },
    {
      // Guard: Authenticated,
      layout: Layout,
      path: "/Rate-List",
      component: lazy(
        () => import("../Frontend/Master/RateListAllPage/RateListTabs.jsx"),
      ),
    },
    {
      // Guard: Authenticated,
      layout: Layout,
      path: "/dispatch-patient-report",
      component: lazy(
        () => import("../Frontend/Laboratory/DispatchPatientReport.jsx"),
      ),
    },
    {
      // Guard: Authenticated,
      layout: Layout,
      path: "/dispatch-log-report",
      component: lazy(
        () => import("../Frontend/Laboratory/DispatchLogReport.jsx"),
      ),
    },

    {
      // Guard: Authenticated,
      // layout: Layout,
      path: "/patientreport",
      component: lazy(() => import("../modules/patient/PatientReport.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/Ambulance-Dashboard",
      component: lazy(
        () => import("../Frontend/Ambulance/AmbulanceTracking/Dashboard.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/Dashboard-Content",
      component: lazy(
        () =>
          import(
            "../Frontend/Ambulance/AmbulanceTracking/DashboardContent.jsx"
          ),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/Driver",
      component: lazy(
        () => import("../Frontend/Ambulance/AmbulanceTracking/Driver.jsx"),
      ),
    },
    {
      // Guard: Authenticated, //not added
      layout: Layout,
      path: "/metropolisDashboard",
      component: lazy(
        () => import("../modules/metropolis/dashboard/Dashboard.jsx"),
      ),
      exact: true,
    },
    {
      // Guard: Authenticated, // not added
      layout: Layout,
      path: "/partneruser",
      component: lazy(
        () => import("../modules/metropolis/partneruser/PartnerStaff.jsx"),
      ),
      exact: true,
    },
    {
      // Guard: Authenticated, //not added
      layout: Layout,
      path: "/nps",
      component: lazy(
        () => import("../modules/metropolis/nps/npsFeedback.jsx"),
      ),
      exact: true,
    },
    {
      // Guard: Authenticated, //not added
      layout: Layout,
      path: "/partnercase",
      component: lazy(
        () => import("../modules/metropolis/complaints/partnerComplaint.jsx"),
      ),
      exact: true,
    },
    {
      // Guard: Authenticated, //not added
      layout: Layout,
      path: "/PhleboTravelledDistance",
      component: lazy(
        () => import("../Frontend/HomeCollection/PhleboTravelledDistance.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/ILCLabMaster",
      component: lazy(
        () =>
          import(
            "../Frontend/QualityControl/ILC/ILClabmaster/ILCLabMaster.jsx"
          ),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/ILCResultApproval",
      component: lazy(
        () =>
          import(
            "../Frontend/QualityControl/ILC/ILCResultApproval/ILCResultApproval.jsx"
          ),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/ILCSchedule",
      component: lazy(
        () =>
          import("../Frontend/QualityControl/ILC/ILCSchedule/ILCSchedule.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/ILCLabParameterMapping",
      component: lazy(
        () =>
          import(
            "../Frontend/QualityControl/ILC/ILCLabParameterMapping/ILCLabParameterMapping.jsx"
          ),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/ILCScheduleRequest",
      component: lazy(
        () =>
          import(
            "../Frontend/QualityControl/ILC/ILCScheduleRequest/ILCScheduleRequest.jsx"
          ),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/ILCReport",
      component: lazy(
        () => import("../Frontend/QualityControl/ILC/ILCReport/ILCReport.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/ILCMapNotRegistered",
      component: lazy(
        () =>
          import(
            "../Frontend/QualityControl/ILC/ILCMapNotRegistered/ILCMapNotRegistered.jsx"
          ),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/ILCResultEntry",
      component: lazy(
        () =>
          import(
            "../Frontend/QualityControl/ILC/ILCResultEntry/ILCResultEntry.jsx"
          ),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/ILCRegistration",
      component: lazy(
        () =>
          import(
            "../Frontend/QualityControl/ILC/ILCRegistration/ILCRegistration.jsx"
          ),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/ILCResultReject",
      component: lazy(
        () =>
          import(
            "../Frontend/QualityControl/ILC/ILCresultreject/ILCResultReject.jsx"
          ),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/ILCFrameMenu",
      component: lazy(
        () => import("../Frontend/QualityControl/ILC/ILCFrameMenu.jsx"),
      ),
      exact: true,
    },

    {
      // Guard: Authenticated,
      layout: Layout,
      path: "/HistoCytoResultEntry",
      component: lazy(
        () => import("../Frontend/Laboratory/HistoCytoResultEntry.jsx"),
      ),
      exact: true,
    },

    {
      // Guard: Authenticated,
      layout: Layout,
      path: "/HistoCytoResultEntrySecondPage",
      component: lazy(
        () =>
          import("../Frontend/Laboratory/HistoCytoResultEntrySecondPage.jsx"),
      ),
      exact: true,
    },

    //------LogisticPages--------
    //        {
    //    // Guard: Authenticated,
    //   layout: Layout,
    //   path: "/LogisticFieldBoyMaster",
    //   component: lazy(
    //     () =>
    //       import("../Frontend/LogisticsPages/LogisticFieldBoyMaster.jsx"),
    //   ),
    //   exact: true,
    // },
    {
      // Guard: Authenticated,
      layout: Layout,
      path: "/LogisticHubMaster",
      component: lazy(
        () => import("../Frontend/LogisticsPages/LogisticHubMaster.jsx"),
      ),
      exact: true,
    },
    {
      // Guard: Authenticated,
      layout: Layout,
      path: "/SalesManagerMis",
      component: lazy(() => import("../Frontend/Sales/SalesManagerMis.jsx")),
      exact: true,
    },
    {
      // Guard: Authenticated,
      // layout: Layout,
      path: "/hdfc-paymentStatus/:id",
      component: lazy(() => import("../Frontend/Payment/PaymentStatus.jsx")),
      exact: true,
    },
    {
      // Guard: Authenticated,
      layout: Layout,
      path: "/icici-paymentStatus/:id",
      component: lazy(() => import("../Frontend/Payment/ICICIPaymentStatus.jsx")),
      exact: true,
    },
    {
      // Guard: Authenticated,
      // layout: Layout,
      path: "/paymentStatus/:id",
      component: lazy(() => import("../Frontend/Payment/PaymentStatus.jsx")),
      exact: true,
    },
    {
      // Guard: Authenticated,
      layout: Layout,
      path: "/LanguageMaster",
      component: lazy(() => import("../Frontend/LanguageMaster.jsx")),
      exact: true,
    },
    {
      // Guard: Authenticated,
      layout: Layout,
      path: "/DictionaryMaster",
      component: lazy(() => import("../Frontend/DictionaryMaster.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/complete-mapping-report",
      component: lazy(
        () =>
          import(
            "../Frontend/Laboratory/CompleteMapping/CompleteMappingReport.jsx"
          ),
      ),
      exact: true,
    },
    {
      // Guard: Authenticated,
      layout: Layout,
      path: "/EmployeeMasterBulk",
      component: lazy(
        () => import("../Frontend/Master/EmployeeMasterBulk.jsx"),
      ),
      exact: true,
    },
    {
      // Guard: Authenticated,
      layout: Layout,
      path: "/BulkChangeRateType",
      component: lazy(
        () => import("../Frontend/Master/BulkChangeRateType.jsx"),
      ),
      exact: true,
    },
    //------SalesPages--------

    {
      Guard: Authenticated,
      layout: Layout,
      path: "/funnel-createfunnel",
      component: lazy(() => import("../Frontend/SalesFunnel/Funnel.jsx")),
      exact: true,
    },

    {
      Guard: Authenticated,
      layout: Layout,
      path: "/funnel-list",
      component: lazy(() => import("../Frontend/SalesFunnel/FunnelList.jsx")),
      exact: true,
    },

    {
      Guard: Authenticated,
      layout: Layout,
      path: "/SalesDesignationMaster",
      component: lazy(
        () => import("../Frontend/Sales/DesignationEmployeeMaster.jsx"),
      ),
      exact: true,
    },

    {
      Guard: Authenticated,
      layout: Layout,
      path: "/SalesDesignation",
      component: lazy(() => import("../Frontend/Sales/SalesDesignation.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/SalesTree",
      component: lazy(() => import("../Frontend/Sales/SalesTree.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/create-msl",
      component: lazy(
        () => import("../Frontend/Sales/MslMaster/CreateMsl.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/msl-approve",
      component: lazy(
        () => import("../Frontend/Sales/MslMaster/MslApprove.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/travelplan-schedular",
      component: lazy(
        () =>
          import(
            "../Frontend/Sales/TravelPlanSchedular/TravelPlanSchedular.jsx"
          ),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/dcr-approval",
      component: lazy(
        () => import("../Frontend/Sales/DcrApproval/DcrApproval.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/dcr-reports",
      component: lazy(
        () => import("../Frontend/Sales/DcrApproval/DcrReports.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/dailcallreports",
      component: lazy(
        () => import("../Frontend/Sales/DcrApproval/DailyCallReports.jsx"),
      ),
      exact: true,
    },

    /* sales ends here */

    /* Store Start */

    {
      Guard: Authenticated,
      layout: Layout,
      path: "/GRNfromPo",
      component: lazy(() => import("../Frontend/Store/GRN/GRNfromPo.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/GRNReprint",
      component: lazy(() => import("../Frontend/Store/GRN/GRNStatus.jsx")),
      exact: true,
    },

    {
      Guard: Authenticated,
      layout: Layout,
      path: "/DirectGRN",
      component: lazy(() => import("../Frontend/Store/GRN/DirectGRN.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/GRNInvoiceEdit",
      component: lazy(() => import("../Frontend/Store/GRN/GRNInvoiceEdit.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/StockExpiryChange",
      component: lazy(
        () => import("../Frontend/Store/GRN/StockExpiryChange.jsx")
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/StoreItemMaster",
      component: lazy(
        () =>
          import(
            "../Frontend/Store/storeMaster/storeItemMaster/StoreItemMaster.jsx"
          )
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/StoreLocationMaster",
      component: lazy(
        () =>
          import(
            "../Frontend/Store/storeMaster/storeLocationMaster/StoreLocationMaster.jsx"
          )
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/MapItemWithLocation",
      component: lazy(
        () =>
          import(
            "../Frontend/Store/storeMaster/mapItemWithLocation/MapItemWithLocation.jsx"
          )
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/ItemPccMapping",
      component: lazy(
        () =>
          import(
            "../Frontend/Store/storeMaster/itemPccMapping/ItemPccMapping.jsx"
          )
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/StoreAddressMaster",
      component: lazy(
        () =>
          import(
            "../Frontend/Store/storeMaster/storeAddressMaster/StoreAddressMaster.jsx"
          )
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/GrossingSlidingItemMapping",
      component: lazy(
        () =>
          import(
            "../Frontend/Store/storeMaster/grossingSlidingItemMapping/GrossingSlidingItemMapping.jsx"
          )
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/POEditAdmin",
      component: lazy(
        () =>
          import(
            "../Frontend/Store/storeMaster/PurchaseOrderEditAdmin/POEditAdmin.jsx"
          )
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/POAutoClose",
      component: lazy(
        () =>
          import(
            "../Frontend/Store/storeMaster/purchaseOrderAutoClose/PurchaseOrderAutoClose.jsx"
          )
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/VendorQuotation",
      component: lazy(
        () =>
          import(
            "../Frontend/Store/storeMaster/vendorQuotation/VendorQuotation.jsx"
          )
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/StoreItemGrouping",
      component: lazy(
        () =>
          import(
            "../Frontend/Store/storeMaster/storeitemgrouping/StoreItemGrouping.jsx"
          )
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/VendorQuotationComparison",
      component: lazy(
        () =>
          import(
            "../Frontend/Store/storeMaster/vendorQuotationComparison/VendorQuotationComparison.jsx"
          )
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/StoreTransferQuotationRate",
      component: lazy(
        () =>
          import(
            "../Frontend/Store/storeMaster/transferQuotationRate/TransferQuotationRate.jsx"
          )
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/VendorQuotationRemove",
      component: lazy(
        () =>
          import(
            "../Frontend/Store/storeMaster/vendorQuotationRemove/VendorQuotationRemove.jsx"
          )
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/ManageApproval",
      component: lazy(
        () =>
          import(
            "../Frontend/Store/storeMaster/manageApproval/ManageApproval.jsx"
          )
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/VendorMaster",
      component: lazy(
        () =>
          import("../Frontend/Store/storeMaster/vendorMaster/VendorMaster.jsx")
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/DirectIssue",
      component: lazy(
        () => import("../Frontend/Store/directSale/DirectIssue.jsx")
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/DirectStockTransfer",
      component: lazy(
        () => import("../Frontend/Store/directSale/DirectStockTransfer.jsx")
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/DirectStockSearch",
      component: lazy(
        () => import("../Frontend/Store/directSale/DirectStockSearch.jsx")
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/CreateIndent",
      component: lazy(
        () => import("../Frontend/Store/Indent/createIndent/CreatesIndent.jsx")
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/IndentStatusAndApproval",
      component: lazy(
        () =>
          import(
            "../Frontend/Store/Indent/indentStatusAndApproval/IndentStatusAndApproval.jsx"
          )
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/ConsumeItem",
      component: lazy(
        () => import("../Frontend/Store/Indent/consmeItem/ConsmeItem.jsx")
      ),
      exact: true,
    },
    {
      // Guard: Authenticated,
      layout: Layout,
      path: "/DoctorAccountingRefer",
      component: lazy(
        () => import("../Frontend/Master/DoctorAccountingRefer.jsx")
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/DispatchMaterial",
      component: lazy(
        () =>
          import(
            "../Frontend/Store/Indent/dispatchMaterial/DispatchMaterial.jsx"
          )
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/LogisticUpdate",
      component: lazy(
        () =>
          import("../Frontend/Store/Indent/logisticUpdate/LogisticUpdate.jsx")
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/SendIssueItemreceiveStatus",
      component: lazy(
        () =>
          import(
            "../Frontend/Store/Indent/materialDeliveryLocationStatus/MaterialDeliveryLocationStatus.jsx"
          )
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/IndentReceive",
      component: lazy(
        () => import("../Frontend/Store/Indent/indentReceive/IndentReceive.jsx")
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/IndentIssue",
      component: lazy(
        () => import("../Frontend/Store/Indent/indentIssue/IndentIssue.jsx")
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/AutoConsumemaster",
      component: lazy(
        () =>
          import(
            "../Frontend/Store/autoConsume/autoConsumemaster/AutoConsumemaster.jsx"
          )
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/AutoConusmeStoreData",
      component: lazy(
        () =>
          import(
            "../Frontend/Store/autoConsume/autoConusmeStoreData/AutoConusmeStoreData.jsx"
          )
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/StorePackageMaster",
      component: lazy(
        () =>
          import(
            "../Frontend/Store/master/storePackageMaster/StorePackageMaster.jsx"
          )
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/CentrewisePoEmailConfig",
      component: lazy(
        () =>
          import(
            "../Frontend/Store/master/centrewisePoEmailConfig/CentrewisePoEmailConfig.jsx"
          )
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/POSearch",
      component: lazy(
        () =>
          import("../Frontend/Store/Purchase/POSearch/PurchaseOrderSearch.jsx")
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/DirectPO",
      component: lazy(
        () =>
          import("../Frontend/Store/Purchase/DirectPO/DirectPurchaseOrder.jsx")
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/POAgainstPI",
      component: lazy(
        () =>
          import(
            "../Frontend/Store/Purchase/POAgainstPI/PurchaseOrderAgainstPI.jsx"
          )
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/vendorReturn",
      component: lazy(
        () =>
          import(
            "../Frontend/Store/SupplierReturn/vendorReturn/SupplierReturn.jsx"
          )
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/VendorRetrunSearch",
      component: lazy(
        () =>
          import(
            "../Frontend/Store/SupplierReturn/vendorReturnSearch/VendorReturnSearch.jsx"
          )
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/VendorItemReplacement",
      component: lazy(
        () =>
          import(
            "../Frontend/Store/SupplierReturn/vendorReplacement/VendorReplacement.jsx"
          )
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/VendorItemReplacementSearch",
      component: lazy(
        () =>
          import(
            "../Frontend/Store/SupplierReturn/vendorReplacementSearch/VendorReplacementSearch.jsx"
          )
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/ConsumeStoreItem",
      component: lazy(
        () =>
          import(
            "../Frontend/Store/Tools/ConsumeStoreItem.jsx"
          )
      ),
      exact: true,
    },
    /* Store ends here */



    /* machineBreakdown starts here*/
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/machinebreakdown",
      component: lazy(
        () => import("../Frontend/Laboratory/MachineBreakDown.jsx"),
      ),
      exact: true,
    },

    /* machineBreakdown ends here*/
    //-----DignosticMaster Start--------
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/DignosticMaster",
      component: lazy(
        () => import("../Frontend/DignosticMaster/DignosticMaster.jsx"),
      ),
      exact: true,
    },

    {
      // Guard: Authenticated,
      layout: Layout,
      path: "/OnlinePaymentSearch",
      component: lazy(
        () => import("../Frontend/Laboratory/OnlinePaymentSearch.jsx")
      ),
      exact: true,
    },
    //-
    //-----DignosticMaster End--------
    // //-----Antibiotic Start--------
    //        {
    //       Guard: Authenticated,
    //       layout: Layout,
    //       path: "/AntibioticReport",
    //       component: lazy(
    //         () => import("../Frontend/AntibioticReport/AntibioticReport.jsx")
    //       ),
    //       exact: true,
    //     },
    //     //-----Antibiotic End--------    //------IHC Pages Start------
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/ImmunoHistoChemistryMaster",
      component: lazy(
        () =>
          import("../Frontend/ImmunoHistoChemistry/ImmunoHistoMaster.jsx")
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/ImmunoHistoChemistryMasterMapping",
      component: lazy(
        () =>
          import("../Frontend/ImmunoHistoChemistry/ImmunoHistoMasterMapping.jsx")
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/ImmunoResultEntry",
      component: lazy(
        () =>
          import("../Frontend/ImmunoHistoChemistry/ImmunoResultEntry.jsx")
      ),
      exact: true,
    },
    //aftab
    {
      Guard: Authenticated,
      layout: Layout,
      path: "StoreReports/IndentReport",
      component: lazy(
        () =>
          import("../Frontend/Store/Indent/piReport/PIReport.jsx")
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "DoctorApproval",
      component: lazy(
        () =>
          import("../Frontend/DoctorApproval/DoctorApproval.jsx")
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/DoctorApproval",
      component: lazy(
        () =>
          import("../Frontend/DoctorApproval/DoctorApproval.jsx")
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/Approval",
      component: lazy(
        () =>
          import("../Frontend/DoctorApproval/DoctorApproval.jsx")
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/approval",
      component: lazy(
        () =>
          import("../Frontend/DoctorApproval/DoctorApproval.jsx")
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "StoreReports/LowStockReport",
      component: lazy(
        () =>
          import("../Frontend/Store/Indent/LowStockReport/LowStockReport.jsx")
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "StoreReports/ConsumeReport",
      component: lazy(
        () =>
          import("../Frontend/Store/Indent/ConsumeReport/ConsumeReport.jsx")
      ),
      exact: true,
    },

    {
      Guard: Authenticated,
      layout: Layout,
      path: "StoreReports/StockExpiryReport",
      component: lazy(
        () =>
          import("../Frontend/Store/Indent/StockExpiryReport/StockExpiryReport.jsx")
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "StoreReports/StockPhysicalVerificationReport",
      component: lazy(
        () =>
          import("../Frontend/Store/Indent/StockPhysicalVerificationReport/StockPhysicalVerificationReport.jsx")
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "StoreReports/IssueReport",
      component: lazy(
        () =>
          import("../Frontend/Store/Indent/IssueReport/IssueReport.jsx")
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "StoreReports/PurchaseOrderReport",
      component: lazy(
        () =>
          import("../Frontend/Store/Indent/PurchaseOrderReport/PurchaseOrderReport.jsx")
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "StoreReports/StockStatusReport",
      component: lazy(
        () =>
          import("../Frontend/Store/Indent/StockStatusReport/StockStatusReport.jsx")
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "StoreReports/StockLedgerReport",
      component: lazy(
        () =>
          import("../Frontend/Store/Indent/StockLedgerReport/StockLedgerReport.jsx")
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "SearchAppointment",
      component: lazy(
        () =>
          import("../Frontend/Store/Indent/SearchAppointment/SearchAppointment.jsx")
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "SalesManager",
      component: lazy(
        () =>
          import("../Frontend/Store/Tools/SalesManager/SalesManager.jsx")
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "CreateShareMaster",
      component: lazy(
        () =>
          import("../Frontend/Master/CreateShareMaster/CreateShareMaster.jsx")
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "BulkRegistrationNew",
      component: lazy(
        () =>
          import("../Frontend/Laboratory/BulkRegistrationNew.jsx")
      ),
      exact: true,
    },


    //aftab end

    {
      Guard: Authenticated,
      layout: Layout,
      path: "/StockPhysicalVerification",
      component: lazy(
        () =>
          import("../Frontend/Store/StockPhysicalVerification/StockPhysicalVerification.jsx")
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/ServicePurchaseOrderSearch",
      component: lazy(
        () =>
          import("../Frontend/Store/ServicePurchaseOrder/ServicePurchaseOrderSearch.jsx")
      ),
      exact: true,
    },


    //------IHC Pages End------

    {
      // Guard: Authenticated,
      layout: Layout,
      path: "/title-gender-mapping",
      component: lazy(() => import("../Frontend/Master/TitleGenderMapping.jsx")),
      exact: true,
    },
    {
      // Guard: Authenticated,
      // layout: Layout,
      path: "/feed-back-master",
      component: lazy(() => import("../Frontend/Master/FeedBAckMaster.jsx")),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/dashboard-apis",
      component: lazy(() => import("../Frontend/ApisDashboard.jsx")),
      exact: true,
    },

    /*patientwiseinvoicecreation starts */
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/PatinentWiseInvoiceCreation",
      component: lazy(
        () => import("../Frontend/Invoicing/PatinentWiseInvoiceCreation.jsx"),
      ),
      exact: true,
    },
    {
      // Guard: Authenticated,
      // layout: Layout,
      path: "/EmailDiscountApprove",
      component: lazy(
        () => import("../Frontend/DiscountMaster/EmailDiscountApprove.jsx"),
      ),
      exact: true,
    },
    {
      // Guard: Authenticated,
      // layout: Layout,
      path: "/EmailDiscountReject",
      component: lazy(
        () => import("../Frontend/DiscountMaster/EmailDiscountReject.jsx"),
      ),
      exact: true,
    },
    /*end*/
    {
      // Guard: Authenticated,
      layout: Layout,
      path: "/CombineLabReport",
      component: lazy(
        () => import("../Frontend/CombineReport/CombineLabReport.jsx"),
      ),
      exact: true,
    },
    /*CoPaymentMaster starts */
    {
      // Guard: Authenticated,
      layout: Layout,
      path: "/CombineLogReport",
      component: lazy(
        () => import("../Frontend/CombineLogReport/AllLogReport.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/CoPaymentMaster",
      component: lazy(
        () => import("../Frontend/Laboratory/CoPaymentMaster.jsx"),
      ),
      exact: true,
    },

    {
      Guard: Authenticated,
      layout: Layout,
      path: "/ChangeCopaymentPercentage",
      component: lazy(
        () => import("../Frontend/Laboratory/ChangeCopaymentPercentage.jsx"),
      ),
      exact: true,
    },
    /*end*/

    {
      Guard: Authenticated,
      layout: Layout,
      path: "/SampleReceiveBarcode",
      component: lazy(
        () => import("../Frontend/ReciveBarcode/ReciveBarcode.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/HistoCytoTemplateMaster",
      component: lazy(
        () => import("../Frontend/Master/TemplateMaster/TemplateMaster.jsx"),
      ),
      exact: true,
    },
    {
      // Guard: Authenticated,
      layout: Layout,
      path: "/BlockBuilding",
      component: lazy(
        () => import("../Frontend/Laboratory/BlockBuilding.jsx"),
      ),
      exact: true,
    },
    {
      // Guard: Authenticated,
      layout: Layout,
      path: "/DocumentMaster",
      component: lazy(
        () => import("../Frontend/DocumentMaster/DocumentMaster.jsx"),
      ),
      exact: true,
    },

    /* DocAccount Starts here */
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/inhouse-doctor-sharing",
      component: lazy(
        () => import("../Frontend/InHouseDoctor/InHouseDoctor.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/doctor-misreport",
      component: lazy(
        () => import("../Frontend/InHouseDoctor/DoctorMisReport.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/inhouse-doctor",
      component: lazy(
        () => import("../Frontend/InHouseDoctor/InHouseDrShareExport.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/referal-doctor-share-update",
      component: lazy(
        () => import("../Frontend/InHouseDoctor/ReferalDoctorShareUpdate.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/doctor-assign",
      component: lazy(
        () => import("../Frontend/InHouseDoctor/DoctorAssign.jsx"),
      ),
      exact: true,
    },

    {
      Guard: Authenticated,
      layout: Layout,
      path: "/doctor-share-update",
      component: lazy(
        () => import("../Frontend/InHouseDoctor/InhouseDoctorShareUpdate.jsx"),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/researchregister",
      component: lazy(
        () => import("../Frontend/Laboratory/ResearchRegistration.jsx"),
      ),
      exact: true,
    },

    {
      Guard: Authenticated,
      layout: Layout,
      path: "/advancesettlement",
      component: lazy(() => import("../Frontend/Invoicing/AdvanceSettlement.jsx")),
      exact: true,
    },

    {
      Guard: Authenticated,
      layout: Layout,
      path: "/InvoiceSettlement",
      component: lazy(() => import("../Frontend/Invoicing/AdvanceSettlement.jsx")),
      exact: true,
    },

    {
      Guard: Authenticated,
      layout: Layout,
      path: "/invoicesettlement",
      component: lazy(() => import("../Frontend/Invoicing/AdvanceSettlement.jsx")),
      exact: true,
    },

    {
      Guard: Authenticated,
      layout: Layout,
      path: "/OutsourceDispatchReport",
      component: lazy(
        () => import("../Frontend/Master/OutsourceDispatchReport.jsx"),
      ),
    },

    {
      Guard: Authenticated,
      layout: Layout,
      path: "/SecondDispatchReport",
      component: lazy(
        () => import("../Frontend/Laboratory/DispatchReportSecond.jsx"),
      ),
      exact: true,
    },

    {
      Guard: Authenticated,
      layout: Layout,
      path: "/MarketingPatientInfo",
      component: lazy(
        () => import("../Frontend/Laboratory/MarketingPatientInfo.jsx"),
      ),
      exact: true,
    },

    /* DocAccount ends here */

    /* Currencymaster Starts here */
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/CurrencyFactorMaster",
      component: lazy(
        () => import("../Frontend/CurrencyMaster/CurrencyFactorMater.jsx"),
      ),
      exact: true,
    },
    /* Currencymaster ends here */


    /* microqc starts here */
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/micro-control-master",
      component: lazy(
        () =>
          import(
            "../Frontend/QualityControl/Micro/MicroControlMaster/MicroControlMaster.jsx"
          ),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/micro-center-control-mapping",
      component: lazy(
        () =>
          import(
            "../Frontend/QualityControl/Micro/MicroCenterControlMapping/MicroCentreControlMapping.jsx"
          ),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/microqcvalueentry",
      component: lazy(
        () =>
          import(
            "../Frontend/QualityControl/Micro/MicroQcValueEntry/MicroQcValueEntry.jsx"
          ),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/microqcreport",
      component: lazy(
        () =>
          import(
            "../Frontend/QualityControl/Micro/MicroQcReport/MicroQcReport.jsx"
          ),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/QcRequestHistocyto",
      component: lazy(
        () =>
          import(
            "../Frontend/QualityControl/Histo/QcProcessHistocyto/QcProcessHistocyto.jsx"
          ),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/QcHistocyto",
      component: lazy(
        () =>
          import(
            "../Frontend/QualityControl/Histo/QcProcessHistocyto/QualityControlValue.jsx"
          ),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/InterLabTechnicalQc",
      component: lazy(
        () =>
          import(
            "../Frontend/QualityControl/Histo/QcProcessHistocyto/InterLabTechnicalQc.jsx"
          ),
      ),
      exact: true,
    },
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/MicroHistoReports",
      component: lazy(
        () =>
          import(
            "../Frontend/QualityControl/Histo/QcProcessHistocyto/MicroHistoReports.jsx"
          ),
      ),
      exact: true,
    },

    /* microqc ends here */

     /* KRA (Push To KRA) screen */
    {
      Guard: Authenticated,
      layout: Layout,
      path: "/KRA",
      component: lazy(() => import("../Frontend/KRA/KRA.jsx")),
      exact: true,
    },

    ...Logistic,
    ...TargetSheet,
    ...cashFlowRoutes,
    ...FamilyMembershipCardRoutes,
    ...EQAS,
    ...RadiologyRoutes,
    ...ESG,
    ...SampleStorageRoutes,
    ...UHIDNewPatientRegister,
    ...NewReports,
    ...SRA,
    ...CombineResultEntry,
    ...LabWorksheet,
    ...SmartReport,
    ...ManagerSOP,
    ...LabWorksheetReport,
    ...FeedbackReport,
    ...CombineReports,
    ...PolicyMaster,
    ...B2B,
    ...CombineWorkSheetReports,
    ...HistoReport,
    ...CombineWorkSheetReports2,
    ...NepalReports,
    ...PatientInformationReport,
    ...UpdateInvoiceShare,
    ...CombineCollectionReport,
    ...LdplSmartPaymentGatewaythroughOtp,
    ...ESGReports,
    ...InterfaceCompanyMasterRoutes,
    ...FinanceRoutes,
    ...FormBuilderRoutes,
    ...NABLDocumentControl,
    ...EquipmentManagementRoutes,

  ],
};
