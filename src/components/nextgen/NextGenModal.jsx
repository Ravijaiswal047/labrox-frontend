import { Dialog } from "primereact/dialog";
import { NextGenSaveButton, NextGenCancelButton } from "./NextGenButton";
import { useNgModeClass } from "@app/utils/hooks/useNgModeClass";
import "./NextGenModal.css";

/**
 * Unified NextGen replacement for the two legacy Modal.jsx components
 * (components/formComponent/Modal.jsx and components/ModalComponent/Modal.jsx).
 * Unlike the legacy versions, `handleAPI`/`modalData` are actually wired to the
 * Save button, and `footer` reliably overrides the default footer.
 */
export default function NextGenModal({
  visible,
  setVisible,
  Header,
  children,
  footer,
  buttons,
  buttonName,
  CancelbuttonName,
  modalData,
  handleAPI,
  modalWidth = "600px",
  className = "",
}) {
  const isMobile = typeof window !== "undefined" && window.innerWidth <= 768;
  const ngModeClass = useNgModeClass();

  const defaultFooter = (
    <div className="ng-modal__footer">
      {buttons}
      {handleAPI && (
        <NextGenSaveButton
          text={buttonName || "Save"}
          onClick={() => handleAPI(modalData)}
        />
      )}
      <NextGenCancelButton
        text={CancelbuttonName || "Cancel"}
        onClick={() => setVisible(false)}
      />
    </div>
  );

  return (
    <Dialog
      visible={visible}
      onHide={() => setVisible(false)}
      header={Header}
      footer={footer !== undefined ? footer : defaultFooter}
      style={{ width: isMobile ? "95vw" : modalWidth }}
      className={`ng-modal ${ngModeClass} ${className}`}
      modal
      draggable={false}
    >
      <div className="ng-modal__body">{children}</div>
    </Dialog>
  );
}
