import React, { Suspense } from "react";
import PersonalDetailsOfPatient from "../FrameMenu/PersonalDetailsOfPatient";
import BillCloseUI from "./BillCloseUI";
// import Test from '../../pages/pharmacy/PatientIssue/index.jsx'

const importComponentWithFormID = (FormId) => {
  // debugger
  return React.lazy(() =>
    import(`../../pages/FormBuilder/FormRenderer.jsx`)
      .then((module) => ({ default: module.default }))
      .catch(() => ({
        default: () => <div>Component not found: {FormId}</div>,
      })),
  );
};

const importComponent = (path, IsMainMenu) => {
  const componentMap = {
    ANCPatientHistoryI: () =>
      import("../../components/FrameMenu/IVF/ANCPatientHistoryI.jsx"),

    EditAdmissionBilling: () =>
      import("../../pages/Billing/IPD/IPDAdmissionNew.jsx"),
    IVFCounselling: () => import("../FrameMenu/IVFCounselling.jsx"),
    IVFVisitStartandCloseStatus: "../FrameMenu/IVFVisitStartandCloseStatus.jsx",
  };

  if (IsMainMenu) {
    const loader = componentMap[path];
    if (!loader) {
      return React.lazy(() =>
        Promise.resolve({
          default: () => <div>Component not found: {path}</div>,
        }),
      );
    }
    return React.lazy(() =>
      loader()
        .then((module) => ({ default: module.default }))
        .catch(() => ({
          default: () => <div>Component not found: {path}</div>,
        })),
    );
  } else {
    return React.lazy(() =>
      import(`../FrameMenu/${path}.jsx`)
        .then((module) => ({ default: module.default }))
        .catch(() => ({
          default: () => <div>Component not found: {path}</div>,
        })),
    );
  }
};

export default function CounsellingSeeMoreList(BindFrameMenuByRoleIDS, data) {
  //  debugger;
  let seeMore = [];
  for (let i = 0; i < BindFrameMenuByRoleIDS?.length; i++) {
    const { URL, FileName, IsMainMenu, FormId } = BindFrameMenuByRoleIDS[i];
    // const Component = importComponent(URL, IsMainMenu);
    const Component =
      FormId == 0
        ? importComponent(URL, IsMainMenu)
        : importComponentWithFormID(FormId);

    const Obj = {
      name: FileName,
      component: (
        <div key={i}>
          <Suspense fallback={<div>Loading...</div>}>
            <PersonalDetailsOfPatient data={data} />
            {/* {
            FileName==="IPD Bill Print"  <Component data={data} />
           } */}

            {data?.isBilledClosed === "1" && FileName !== "IPD Bill Print" ? (
              <BillCloseUI />
            ) : FormId == 0 ? (
              <Component
                data={{ ...data, pathname: URL, FileName: FileName }}
                formId={FormId}
              />
            ) : (
              <Component data={data} formId={FormId} />
            )}
            {/* {data?.isBilledClosed === "1" ?
              <BillCloseUI/>:
              <Component data={data} />} */}
          </Suspense>
        </div>
      ),
    };

    seeMore.push(Obj);
  }

  return seeMore;
}
