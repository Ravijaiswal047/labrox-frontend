import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import FinanceModal from "../ModalComponent/FinanceModal";


export default function CustomModalAlert({
  handleActionItem,
  width = "20vw",
  Header = "Are You Sure ?",
  component = "Do You Want To Delete ?",
  setIsOpen,
  isOpen,
}) {
  // debugger
  const [modalData, setModalData] = React.useState({});
  const [t] = useTranslation();
  const handleSave = async () => {
    const resData = await handleActionItem();
    if (resData) {
      setModalData({ visible: false });
      setIsOpen(false);
    }
  };
  useEffect(() => {
    setModalData({
      visible: isOpen,
      width: width,
      Header: t(Header),
      buttonName: t("Yes"),
      CallAPI: handleSave,
      Component: (
        <p
          className="d-flex justify-content-center"
          style={{ fontWeight: "bold" }}
        >
          {component}
        </p>
      ),
    });
  }, [isOpen]);
  return (
    <>
      {modalData?.visible && (
        <FinanceModal
          visible={modalData?.visible}
          setVisible={() => {
            setModalData({ visible: false });
            setIsOpen(false);
          }}
          modalWidth={modalData?.width}
          Header={modalData?.Header}
          buttonType="button"
          buttonName={modalData?.buttonName}
          handleAPI={modalData?.CallAPI}
        >
          {modalData?.Component}
        </FinanceModal>
      )}
    </>
  );
}
