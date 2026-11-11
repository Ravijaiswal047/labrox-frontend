import React, { Suspense, useCallback } from "react";
import SeeMoreSlideScreen from "../UI/SeeMoreSlideScreen";
import EMGPersonalDetailsOfPatient from "../FrameMenu/Emergency/EMGPersonalDetailsOfPatient";
function EmergencySeeMoreList({ ModalComponent, setSeeMore, data, isShowPatient, handleBindFrameMenu,setVisible,refreshAndReopen }) {

  // const importComponent = (path) => {
  //   // let fullPath = ""
  //   // if (path === "VitalSignChart") {
  //   //   fullPath = `../FrameMenu/${path}.jsx`
  //   // } else {
  //   //   fullPath = `../FrameMenu/Emergency/${path}.jsx`
  //   // }
  //   return React.lazy(() =>
  //     import(`../FrameMenu/Emergency/${path}.jsx`)
  //       .then((module) => ({ default: module.default }))
  //       .catch(() => ({ default: () => <div>Component not found: {path}</div> }))
  //   );
  // };

  const componentMap={
    BillingDetails:()=> import("../FrameMenu/Emergency/BillingDetails.jsx"),
    EMGMedicineRequisition:()=> import("../FrameMenu/MedicineRequisition.jsx"),
    MedicationAdministrationRecord:()=> import("../FrameMenu/MedicationAdministrationRecord.jsx"),
    MedicationAdministrationRecordCalendar:()=> import("../FrameMenu/MedicationAdministrationRecordCalendar.jsx"),
    VitalSignChart:()=> import("../FrameMenu/Emergency/VitalSignChart.jsx"),
    InvestigationView:()=> import("../FrameMenu/InvestigationView.jsx"),
    FinalDiagnosis:()=> import("../FrameMenu/FinalDiagnosis.jsx"),
    Discharge:()=> import("../FrameMenu/Emergency/Discharge.jsx"),
    UploadPatientDocuments:()=> import("../FrameMenu/UploadPatientDocuments.jsx"),
    AntibioticChart:()=>import("../FrameMenu/AntibioticChart.jsx"),
    DamaConsentForm:()=>import("../FrameMenu/DamaConsentForm.jsx"),
    BloodTransfusionMonitoring:()=>import("../FrameMenu/BloodTransfusionMonitoring.jsx"),
    IPDAdmissionOrder:()=>import("../FrameMenu/Emergency/IPDAdmissionOrder.jsx"),
    InTakeOutPutChart:()=>import("../FrameMenu/Emergency/InTakeOutPutChart.jsx"),
    PainManagementTool:()=>import("../FrameMenu/PainManagementTool.jsx"),
    FallsRiskAssessment:()=>import("../FrameMenu/FallsRiskAssessment.jsx"),
    PhysicalExamination:()=>import("../FrameMenu/PhysicalExamination.jsx"),
    'A&ETriageRecord':()=>import("../FrameMenu/Emergency/A&ETriageRecord.jsx"),
    BloodTransfusionReaction:()=>import("../FrameMenu/BloodTransfusionReaction.jsx"),
    FetalDisposalForm:()=>import("../FrameMenu/FetalDisposalForm.jsx"),
    PatientPropertyForm:()=>import("../FrameMenu/PatientPropertyForm.jsx"),
    MedicalCareCheckList:()=>import("../FrameMenu/MedicalCareCheckList.jsx"),
    NutritionAssessment:()=>import("../FrameMenu/NutritionAssessment.jsx"),
    LeaveAgainstMedicalAdvice:()=>import("../FrameMenu/LeaveAgainstMedicalAdvice.jsx"),
    HandHygieneAudit:()=>import("../FrameMenu/Emergency/HandHygieneAudit.jsx"),
    PressureSoreAssessment:()=>import("../FrameMenu/PressureSoreAssessment.jsx"),
    RefferalLetter:()=>import("../FrameMenu/Emergency/RefferalLetter.jsx"),
    NoteCreater:()=>import("../FrameMenu/Emergency/NoteCreater.jsx"),
    NoteFinder:()=>import("../FrameMenu/Emergency/NoteFinder.jsx"),
    PatientAllergy:()=>import ("../FrameMenu/PatientAllergy.jsx")
     
  }
  const importComponent = (path, header) => {
    if (header) {
      const loader = componentMap[path];
      if (!loader) {
        return React.lazy(() =>
          Promise.resolve({
            default: () => <div>Component not found: {path}</div>,
          })
        );
      }
      return React.lazy(() =>
        loader()
          .then((module) => ({ default: module.default }))
          .catch(() => ({
            default: () => <div>Component not found: {path}</div>,
          }))
      );
    }
    // else {
    //   return React.lazy(() =>
    //     import(`./FrameMenu/${path}.jsx`)
    //       .then((module) => ({ default: module.default }))
    //       .catch(() => ({ default: () => <div>Component not found: {path}</div> }))
    //   );
    // }
  };

  function BillingSeeMoreList(handleBindFrameMenu, data) {
    let patientDetail = {
      ...data,
      transactionID: data.TID, patientID: data?.PatientID,
    }

    let seeMore = [];
    for (let i = 0; i < handleBindFrameMenu?.length; i++) {
      const { URL, FileName } = handleBindFrameMenu[i];
      const Component = importComponent(URL,true);
      const Obj = {
        name: FileName,
        component: (
          <div key={i}>
            <Suspense fallback={<div>Loading...</div>}>
              {isShowPatient && <EMGPersonalDetailsOfPatient data={data} />}
              <Component data={patientDetail} setActionType={() => { }} menuItemData={{ id: "1" }} toggleAction={() => { }} setVisible={setVisible}
               refreshAndReopen={refreshAndReopen} 
                handleBindFrameMenu={handleBindFrameMenu}
                handleComponentRender={handleComponentRender}
                />
            </Suspense>
          </div>
        ),
      };
      seeMore.push(Obj);
    }
    return seeMore;
  }
  const handleComponentRender = async (data, items) => {

    const componentData = BillingSeeMoreList([items], data);
    ModalComponent(componentData[0]?.name, componentData[0]?.component);
    const forsetSeeMore = BillingSeeMoreList(handleBindFrameMenu, data);
    setSeeMore(forsetSeeMore);
  };

  const handleBindFrameMenuByRoleIDS = useCallback(
    (dataBind) => {
      return dataBind?.map((items, _) => {
        return {
          ...items,
          name: items?.FileName,
        };
      });
    },
    [handleBindFrameMenu]
  );

  return (
    <>
      <div style={{ position: "relative" }}>
        <SeeMoreSlideScreen
          seeMore={handleBindFrameMenuByRoleIDS(handleBindFrameMenu)}
          handleChangeComponent={(item) => handleComponentRender(data, item)}
          data={data}
        />
      </div>
    </>
  );
}

export default EmergencySeeMoreList;
