import { Dialog } from "primereact/dialog";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { useTranslation } from "react-i18next";

const PaymentValidateModal = ({ title, show, handleClose, handleAccept }) => {
  const { t } = useTranslation();
  const theme = useLocalStorage("theme", "get");
  const isMobile = window.innerWidth <= 768;

  console.log(show?.data);
  return (
    <>
      <Dialog
        header={title}
        visible={show?.modal}
        top={"25%"}
        className={theme}
        onHide={handleClose}
        style={{
          width: isMobile ? "55vw" : "24vw",
        }}
      >
        <div className="modal-card">
          <div className="col-12 mb-4">
            <div className="col-sm-12 text-lg" style={{ fontWeight: "bold" }}>
              {t(
                `Are you want to Validate payment ${show?.data?.ReceivedAmt} for ${show?.data?.centre} ?`,
              )}
            </div>
          </div>
          <div className="row">
            <div className="col-sm-6">
              <button
                type="button"
                className="btn btn-block btn-danger btn-sm"
                onClick={() => handleAccept(show?.data)}
              >
                {t("Yes")}
              </button>
            </div>
            <div className="col-sm-6">
              <button
                type="button"
                className="btn btn-block btn-danger btn-sm"
                onClick={handleClose}
              >
                {t("Cancel")}
              </button>
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default PaymentValidateModal;
