import React from "react";
import { Dialog } from "primereact/dialog";
import { Divider } from "primereact/divider";
import CancelButton from "../UI/CancelButton";
import { useLocalStorage } from "@app/utils/hooks/useLocalStorage";

const Modal = ({ setVisible, visible, children, Header, buttons, modalWidth, setModalData, modalData ,handleAPI,buttonName,footer,CancelbuttonName}) => {
  const isMobile = window.innerWidth <= 768;
  const theme = useLocalStorage("theme", 'get')


  const handleSubmit = () => {
    handleAPI(modalData)
  }

  const footerContent = (
    <div>
       <div className="ftr_btn">
          {buttons}
          {/* <SaveButton btnName={buttonName?buttonName:"Save"} onClick={handleSubmit} c/> */}
          <CancelButton
            cancleBtnName={CancelbuttonName?CancelbuttonName:"Cancel"}
            onClick={() => setVisible(false)}
          />
        </div>
    </div>
  );
  return (
    <>
      <Dialog
        header={Header}
        visible={visible}
        style={{ width: isMobile ? "900vw" : modalWidth,  }}
        onHide={() => {
          setVisible(false);
        }}
        draggable={false}
        className={theme}
        // footer={footer ? footer : footerContent}
      >
        <Divider className={`custom-divider-header ${theme}`} />

        <p className={`m-0 ${theme}`}>{children}</p>
      </Dialog>
    </>
  );
};

export default Modal;
