import { useTranslation } from "react-i18next";
import { useLocalStorage } from "../../../utils/hooks/useLocalStorage";
import { Dialog } from "primereact/dialog";
import { CustomButton } from "../../../components/UI/CustomButton";

const BarcodeModal = ({ show, onHandleShow, onMapClick, BarcodeNO }) => {
    const { t } = useTranslation();
    const theme = useLocalStorage("theme", "get");
    const isMobile = window.innerWidth <= 768;

    const onClick = () => {
        onHandleShow();
        onMapClick();
    };

    return (
        <Dialog
            header={t("Barcode Message")}
            visible={show}
            className={theme}
            onHide={onHandleShow}
            style={{ width: isMobile ? "30vw" : "35vw" }}
        >
            <div style={{ backgroundColor: "#FFE4C4", fontWeight: "bold" }}>
                <div className="p-4">
                    Barcode No :- {BarcodeNO} Not Mapped With Any Item.
                    Do You Want To Map?
                </div>
            </div>

            <div className="d-flex">
                <CustomButton
                    text="Yes"
                    className="btn btn-sm btn-success mr-2"
                    onClick={onClick}
                />
                
                <CustomButton
                    text="No"
                    className="btn btn-sm btn-danger"
                    onClick={onHandleShow}
                />
            </div>
        </Dialog>
    );
};

export default BarcodeModal;