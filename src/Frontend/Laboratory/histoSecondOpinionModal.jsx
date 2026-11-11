import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog } from "primereact/dialog";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { axiosInstance, axiosReport } from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import TextAreaInput from "../../components/formComponent/TextAreaInput";

function HistoSecondOpinionModal({ show, handleClose, data }) {
    const { t } = useTranslation();
    const theme = useLocalStorage("theme", "get");
    const isMobile = window.innerWidth < 768;

    const [loading, setLoading] = useState(false);

    const [payload, setPayload] = useState({
        Remark: "",
    });
    console.log(data, "TestID");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPayload((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = () => {
        setLoading(true);
        axiosInstance
            .post("HistoCyto/SecondOpinionHisto", {
                TestID: String(data),
                HistoRemarks: String(payload.Remark),
            })
            .then((res) => {
                setLoading(false);
                toast.success(res?.data?.message);
                setPayload({ Remark: "" });
                handleClose();
            })
            .catch((err) => {
                setLoading(false);
                console.log(err);
            });
    };

    return (
        <Dialog
            header={t("Save Second Opinion Remarks")}
            visible={show}
            onHide={handleClose}
            style={{
                width: isMobile ? "90vw" : "25vw",
            }}
            className={theme}
        >
            <div className="p-2">
                <TextAreaInput
                    placeholder=" "
                    type="text"
                    id="Remark"
                    lable="Remark"
                    name="Remark"
                    max={100}
                    value={payload.Remark}
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
                            onClick={handleClose}
                        >
                            {t("Close")}
                        </button>
                    </div>
                </div>
            </div>
        </Dialog>
    );
}

export default HistoSecondOpinionModal;