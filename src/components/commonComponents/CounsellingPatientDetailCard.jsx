import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import CounsellingSeeMoreList from "./CounsellingSeeMoreList";
import SeeMoreSlideScreen from "../UI/SeeMoreSlideScreen";
import PatientReceivedConfirmationModal from "../modalComponent/Utils/PatientReceivedConfirmationModal";
import Button from "../formComponent/Button";
import Modal from "../modalComponent/Modal";
import { IsReceivedPatient } from "../../networkServices/BillingsApi";
import { notify } from "../../utils/utils";
import { SeeMore } from "../SvgIcons";

function CounsellingPatientDetailCard({
  ModalComponent,
  setSeeMore,
  data,
  handleSubmit,
}) {
  const [t] = useTranslation();
// debugger
  const { BindFrameMenuByRoleIDS } = useSelector((state) => state?.CommonSlice);
  const [modalHandlerState, setModalHandlerState] = useState({
    header: null,
    show: false,
    size: null,
    component: null,
    footer: null,
  });

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

  const handleModalState = () => {
    setModalHandlerState({
      show: true,
      header: t("Alert!!!"),
      size: "20vw",
      component: <PatientReceivedConfirmationModal />,
      // footer: <></>
      // footer: (
      //   <div>
      //     <div className="d-flex align-items-center justify-content-between">
      //       <Button
      //         name={t("Yes")}
      //         className={"btn btn-sm btn-primary mx-1"}
      //         handleClick={handleisPatientReceived}
      //       />
      //     </div>
      //   </div>
      // ),
    });
  };

  const handleComponentRender = async (data, items) => {
    // debugger
    const componentData = CounsellingSeeMoreList([items], data);
    ModalComponent(componentData[0]?.name, componentData[0]?.component);
    const forsetSeeMore = CounsellingSeeMoreList(BindFrameMenuByRoleIDS, data);
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
    [BindFrameMenuByRoleIDS],
  );

  return (
    <>
      <div style={{ position: "relative" }}>
        {BindFrameMenuByRoleIDS?.length > 0 &&
          (Number(data?.isPatientReceived) === 0 ? (
            <div
              onClick={handleModalState}
              className="header p-1"
              style={{ cursor: "pointer" }}
            >
              <SeeMore />
            </div>
          ) : (
            <SeeMoreSlideScreen
              seeMore={handleBindFrameMenuByRoleIDS(BindFrameMenuByRoleIDS)}
              handleChangeComponent={(item) =>
                handleComponentRender(data, item)
              }
            />
          ))}

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
            CancelbuttonName={t("No")}
            buttonName={t("Yes")}
            handleAPI={handleisPatientReceived}
          >
            {modalHandlerState?.component}
          </Modal>
        )}
      </div>
    </>
  );
}

export default CounsellingPatientDetailCard;
