import { Dialog } from "primereact/dialog";

import Input from "../../components/formComponent/Input";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { useTranslation } from "react-i18next";
import { EditButton } from "../../components/UI/CustomButton";
function AdvancePaymentCancelModal({
  show,
  handleChange,
  onhide,
  handleCancel,
}) {
  const theme = useLocalStorage("theme", "get");
  const [t] = useTranslation();
  return (
    <Dialog
      style={{ width: "300px" }}
      onHide={onhide}
      size="md"
      header={t("Cancel Remark")}
      className={theme}
      visible={show}
    >
      <div className="row">
        <div className="col-sm-12">
          <Input
            className="form-control"
            placeholder=" "
            id="Enter Comment"
            lable="Enter Comment to Cancel"
            value={show?.cancelReason}
            name="cancelReason"
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="row">
        <div className="col-sm-4">
          <EditButton
            text={"Update"}
            onClick={handleCancel}
          />
        </div>
      </div>
    </Dialog>
  );
}

export default AdvancePaymentCancelModal;
