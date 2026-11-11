import React from "react";
import { Dialog } from "primereact/dialog";
import { Divider } from "primereact/divider";
// import SaveButton from "@components/UI/SaveButton";
// import CancelButton from "./CloseButton";
import { useLocalStorage } from "@app/utils/hooks/useLocalStorage";
import { CancelButton } from "../UI/CustomButton";

const Modal = ({
  setVisible,
  visible,
  children,
  Header,
  buttons,
  modalWidth,
  setModalData,
  modalData,
  handleAPI,
  buttonName,
  footer,
  CancelbuttonName,
}) => {
  const isMobile = window.innerWidth <= 768;
  const theme = useLocalStorage("theme", "get");

  const handleSubmit = () => {
    handleAPI(modalData);
  };

  const footerContent = (
    <div>
      <div className="ftr_btn">
        {buttons || (
          <CancelButton
            text={CancelbuttonName ? CancelbuttonName : "Cancel"}
            onClick={() => setVisible(false)}
          />
        )}
      </div>
    </div>
  );
  return (
    <>
      <Dialog
        header={Header}
        visible={visible}
        style={{ width: isMobile ? "900vw" : modalWidth }}
        onHide={() => {
          setVisible(false);
        }}
        draggable={false}
        className={theme}
        footer={footer ? footer : footerContent}
        maskStyle={{ backdropFilter: "blur(4px)", background: "rgba(0,0,0,0.45)" }}
        blockScroll={true}
      >
        <Divider className={`custom-divider-header ${theme}`} />

        <p className={`m-0 ${theme}`}>{children}</p>
      </Dialog>
    </>
  );
};

export default Modal;
