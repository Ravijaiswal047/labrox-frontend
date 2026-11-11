import { Dialog } from "primereact/dialog";
import { useTranslation } from "react-i18next";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";

function TestAlreadyHaveModal({ show, onHide, onContinue }) {
    const { t } = useTranslation();
    const isMobile = window.innerWidth <= 768;
    const theme = useLocalStorage("theme", "get");

    return (
        <Dialog
            header={``}
            visible={show}
            onHide={onHide}
            top="100px"
            className={theme}
            style={{
                width: isMobile ? "80vw" : "50vw",
            }}
        >
            <div className="p-3">
                <p style={{ fontSize: "16px", fontWeight: "bold" }}>
                    This Test is already booked with this patient . Do you want to continue?
                </p>

                <div
                    className="d-flex justify-content-start mt-4"
                    style={{ gap: "10px" }}
                >
                    <button className="btn btn-secondary" onClick={onHide}>
                        Cancel
                    </button>

                    <button className="btn btn-primary" onClick={onContinue}>
                        Continue
                    </button>
                </div>
            </div>
        </Dialog>
    );
}

export default TestAlreadyHaveModal;