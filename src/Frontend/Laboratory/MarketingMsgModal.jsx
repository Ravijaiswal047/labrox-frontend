import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog } from "primereact/dialog";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { axiosInstance, axiosReport } from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import TextAreaInput from "../../components/formComponent/TextAreaInput";

function MarketingMsgModal({ show, onSuccess,onhide,onMessageChange }) {
    const { t } = useTranslation();
    const theme = useLocalStorage("theme", "get");
    const isMobile = window.innerWidth < 768;

    const [loading, setLoading] = useState(false);

    const [payload, setPayload] = useState({
        typeMessage: "",
    });

  const handleChange = (e) => {
  const { name, value } = e.target;

  setPayload((prev) => ({
    ...prev,
    [name]: value,
  }));

  if (name === "typeMessage") {
    onMessageChange?.(value);
  }
};

const handleSubmit = () => {
  if (!payload.typeMessage.trim()) {
    toast.error("Please enter message");
    return;
  }
  onSuccess?.(payload.typeMessage);
  onhide();
};

     


    return (
        <Dialog
            header={t("Marketing Send Message")}
            visible={show}
            onHide={onhide}
            style={{
                width: isMobile ? "90vw" : "25vw",
            }}
            className={theme}
        >
            <div className="p-2">
                <TextAreaInput
                    placeholder=" "
                    type="text"
                    id="typeMessage"
                    lable="Type Message"
                    name="typeMessage"
                    max={100}
                    value={payload.typeMessage}
                    onChange={handleChange}
                />

                <div className="d-flex justify-content-between mt-3">
                    <div className="col sm-6">
                        <button
                            type="button"
                            className="btn btn-block btn-danger btn-sm"
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? "Saving..." : t("Save")}
                        </button>
                    </div>
                    <div className="col sm-6">
                        <button
                            type="button"
                            className="btn btn-block btn-danger btn-sm"
                            onClick={onhide}
                        >
                            {t("Close")}
                        </button>
                    </div>
                </div>
            </div>
        </Dialog>
    );
}

export default MarketingMsgModal;