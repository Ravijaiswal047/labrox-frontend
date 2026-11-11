import React, { Suspense, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import SeeMoreSlideScreen from "../UI/SeeMoreSlideScreen";
import PatientReceivedConfirmationModal from "../modalComponent/Utils/PatientReceivedConfirmationModal";
import Button from "../formComponent/Button";
import Modal from "../modalComponent/Modal";
import { IsReceivedPatient } from "../../networkServices/BillingsApi";
import { notify } from "../../utils/utils";
import { getListBindMenu } from "../../networkServices/DoctorApi";
import OPDPersonalDetailsOfPatient from "../FrameMenu/OPDPersonalDetailsOfPatient";

function IvfSeeMoreList({
  ModalComponent,
  setSeeMore,
  data,
  handleSubmit,
  keyName,
  pageName,
  isShowPatient,
}) {
  const [BindFrameMenuByRoleIDS, setBindFrameMenuByRoleIDS] = useState([]);

  const handleBindFrameMenu = async (data) => {
    let apiResp = await getListBindMenu(data?.TransactionID);
    if (apiResp?.success) {
      if (pageName === "AppontmentDetail") {
        setBindFrameMenuByRoleIDS(
          apiResp?.data?.filter((val) => {
            return val?.menuName !== "Prescription Advice";
          }),
        );
      } else {
        setBindFrameMenuByRoleIDS(apiResp?.data);
      }
    } else {
      return [];
    }
  };

  const [modalHandlerState, setModalHandlerState] = useState({
    header: null,
    show: false,
    size: null,
    component: null,
    footer: null,
  });

  const componentMap = {
    ANCRecord: () => import("../../components/FrameMenu/IVF/AncRecord.jsx"),
    ANCPatientHistoryI: () =>
      import("../../components/FrameMenu/IVF/ANCPatientHistoryI.jsx"),
    ANCPatientHistoryII: () =>
      import("../../components/FrameMenu/IVF/ANCPatientHistoryII.jsx"),
    ANCMaritalDetails: () =>
      import("../../components/FrameMenu/IVF/ANCMaritalDetails.jsx"),
    PreviousInfertility: () =>
      import("../../components/FrameMenu/IVF/PreviousInfertility.jsx"),
    HistorySheet: () => import("../../components/FrameMenu/HistorySheet.jsx"),
    PhysicalAndSystemicExamination: () =>
      import(
        "../../components/FrameMenu/IVF/PhysicalAndSystemicExamination.jsx"
      ),
    QuarantineConsent: () =>
      import("../../components/FrameMenu/IVF/QuarantineConsent.jsx"),
    IVFOvumPickup: () =>
      import("../../components/FrameMenu/IVF/IVFOvumPickup.jsx"),
    IVFEmbryoTransferConsent: () =>
      import("../../components/FrameMenu/IVF/IVFEmbryoTransferConsent.jsx"),
    IVFOPUForm: () => import("../../components/FrameMenu/IVF/IVFOPUForm.jsx"),
    IVFOvulationInduction: () =>
      import("../../components/FrameMenu/IVF/IVFOPUForm.jsx"),
    IUISheet: () => import("../../components/FrameMenu/IVF/IVFOPUForm.jsx"),
    EmbryoTransferSheet: () =>
      import("../../components/FrameMenu/IVF/EmbryoTransferSheet.jsx"),
    DonorHindiConsent: () =>
      import("../../components/FrameMenu/IVF/DonorHindiConsent.jsx"),
    AncGeneralExamination: () =>
      import("../../components/FrameMenu/IVF/AncGeneralExamination.jsx"),
    UploadDocument: () =>
      import("../../components/FrameMenu/IVF/UploadDocument.jsx"),
    IVFTreatmentSheet: () =>
      import("../../components/FrameMenu/IVF/IVFTreatmentSheet.jsx"),
    VitalSign: () => import("../../pages/doctor/OPD/VitalSign.jsx"),
    // UploadPatientDocuments: () => import("../../pages/doctor/OPD/UploadPatientDocuments.jsx"),
  };

  // Handle patient received logic

  const handleisPatientReceived = async () => {
    const response = await IsReceivedPatient({
      tid: data?.transactionID,
      isReceived: 1,
    });
    if (response.success) {
      setModalHandlerState({ ...modalHandlerState, show: false });
      handleSubmit();
      notify(response?.message, "success");
    } else {
      console.log("Error: ", response.errorMessage);
    }
  };

  const handleModalState = (item) => {
    setModalHandlerState({
      show: true,
      header: "Alert!!!",
      size: "20vw",
      component: <PatientReceivedConfirmationModal />,
      footer: (
        <div>
          <div className="d-flex align-items-center justify-content-between">
            <Button
              name={"Yes"}
              className={"btn btn-sm btn-primary mx-1"}
              handleClick={handleisPatientReceived}
            />
          </div>
        </div>
      ),
    });
  };

  // const importComponent = (path) => {
  //   debugger;
  //   return React.lazy(() =>
  //     import(`../../pages/doctor/OPD/${path}.jsx`)
  //       .then((module) => ({ default: module.default }))
  //       .catch(() => ({
  //         default: () => <div>Component not found: {path}</div>,
  //       }))
  //   );
  // };

  const importComponentWithFormID = (FormId) => {
    return React.lazy(() =>
      import(`../../pages/FormBuilder/FormRenderer.jsx`)
        .then((module) => ({ default: module.default }))
        .catch(() => ({
          default: () => <div>Component not found: {FormId}</div>,
        })),
    );
  };

  // const importComponent = (path, header) => {
  //   debugger
  //   if (header) {
  //     const loader = componentMap[path];
  //     // debugger
  //     if (!loader) {
  //       return React.lazy(() =>
  //         Promise.resolve({
  //           default: () => <div>Component not found2: {path}</div>,
  //         })
  //       );
  //     }
  //     return React.lazy(() =>
  //       loader()
  //         .then((module) => ({ default: module.default }))
  //         .catch(() => ({
  //           default: () => <div>Component not found3: {path}</div>,
  //         }))
  //     );
  //   } else {
  //     return React.lazy(() =>
  //       import(`../FrameMenu/IVF/${path}.jsx`)
  //         .then((module) => ({ default: module.default }))
  //         .catch(() => ({
  //           default: () => <div>Component not found4: {path}</div>,
  //         }))
  //     );
  //   }
  // };

  const importComponent = (path, header) => {
    if (header) {
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
    }

    const importPath =
      path === "VitalSign"
        ? import("../../pages/doctor/OPD/VitalSign.jsx")
        : import(`../FrameMenu/IVF/${path}.jsx`);

    return React.lazy(() =>
      importPath
        .then((module) => ({ default: module.default }))
        .catch(() => ({
          default: () => <div>Component not found: {path}</div>,
        })),
    );
  };

  function BillingSeeMoreList(BindFrameMenuByRoleIDS, data) {
    let patientDetail = {
      ...data,
      currentPatient: {
        TransactionID: data.TransactionID,
        PatientID: data?.PatientID,
        App_ID: data?.App_ID,
      },
    };
    debugger;
    let propData = {
      patientID: data?.PatientID,
      pName: data?.Pname,
      roomName: data?.PatientID,
      dName: data?.DName,
      ageSex: data?.Age,
      admitDate: data?.AppointmentDate,
      company_Name: data?.Company_Name,
      ipdno: data?.PatientID,
      mobile: data?.ContactNo,
      dischargeDate: "",
      PatientType:data?.PatientType
      // dischargeDate:data?.AppointmentDate
    };

    let seeMore = [];
    for (let i = 0; i < BindFrameMenuByRoleIDS?.length; i++) {
      const { url, menuName, header, formId } = BindFrameMenuByRoleIDS[i];
      const Component =
        formId == 0
          ? importComponent(url, header)
          : importComponentWithFormID(formId);
      const Obj = {
        name: menuName,
        component: (
          <div key={i}>
            <Suspense fallback={<div>Loading...</div>}>
              {isShowPatient && <OPDPersonalDetailsOfPatient data={propData} />}
              {formId == 0 ? (
                <Component
                  patientDetail={patientDetail}
                  setActionType={() => {}}
                  menuItemData={{ id: "1" }}
                  toggleAction={() => {}}
                />
              ) : (
                <Component data={data} formId={formId} />
              )}
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
    const forsetSeeMore = BillingSeeMoreList(BindFrameMenuByRoleIDS, data);
    setSeeMore(forsetSeeMore);
  };

  const handleBindFrameMenuByRoleIDS = useCallback(
    (dataBind) => {
      return dataBind?.map((items, _) => {
        return {
          ...items,
          name: items?.[keyName],
        };
      });
    },
    [BindFrameMenuByRoleIDS],
  );

  return (
    <>
      <div style={{ position: "relative", overflow: "hidden" }}>
        {Number(data?.isPatientReceived) === 0 ? (
          <div
            onClick={handleModalState}
            className="header p-1"
            style={{ cursor: "pointer" }}
          >
            <svg
              width={17}
              height={17}
              viewBox="0 0 64 64"
              fill={"black"}
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="12"
                y="8"
                width="40"
                height="48"
                rx="4"
                ry="4"
                fill="#fff"
                stroke="#000"
                strokeWidth="2"
              />
              <rect
                x="24"
                y="4"
                width="16"
                height="8"
                rx="2"
                ry="2"
                fill="#f2c744"
                stroke="#000"
                strokeWidth="2"
              />
              <circle cx="18" cy="22" r="3" fill="#ff5f5f" />
              <rect x="26" y="20" width="20" height="2" rx="1" fill="#000" />
              <circle cx="18" cy="32" r="3" fill="#ff995f" />
              <rect x="26" y="30" width="20" height="2" rx="1" fill="#000" />
              <circle cx="18" cy="42" r="3" fill="#ffcf5f" />
              <rect x="26" y="40" width="20" height="2" rx="1" fill="#000" />
            </svg>
          </div>
        ) : (
          <SeeMoreSlideScreen
            seeMore={handleBindFrameMenuByRoleIDS(BindFrameMenuByRoleIDS)}
            handleChangeComponent={(item) => handleComponentRender(data, item)}
            data={data}
            handleBindFrameMenu={handleBindFrameMenu}
          />
        )}

        {modalHandlerState?.show && (
          <Modal
            visible={modalHandlerState?.show}
            setVisible={() =>
              setModalHandlerState({
                show: false,
                component: null,
                size: null,
              })
            }
            modalWidth={modalHandlerState?.size}
            Header={modalHandlerState?.header}
            footer={modalHandlerState?.footer}
          >
            {modalHandlerState?.component}
          </Modal>
        )}
      </div>
    </>
  );
}

export default IvfSeeMoreList;
