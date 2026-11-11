import { useTranslation } from "react-i18next";
import Modal from "../ModalComponent/Modal";
import { CustomButton } from "../UI/CustomButton";

const SendSampleDataModal = ({ visible, row, onClose, onConfirm }) => {
  const { t } = useTranslation();

  if (!visible) {
    return null;
  }

  return (
    <Modal visible={visible} setVisible={onClose} Header="" modalWidth="40vw">
      <div className="card mt-2">
        <div className="row p-3">
          <div className="col-sm-12">
            <h6 className="mb-3">
              {t("Do you want to cancel this dispatch sample?")}
            </h6>
            <div className="d-flex" style={{ gap: "10px" }}>
              <CustomButton
                text="Yes"
                icon="check"
                onClick={() => onConfirm(row)}
              />
              <CustomButton
                text="No"
                icon="cancel"
                variant="secondary"
                onClick={onClose}
              />
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default SendSampleDataModal;
