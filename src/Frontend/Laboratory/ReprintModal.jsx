import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog } from "primereact/dialog";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { axiosInstance, axiosReport } from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import TextAreaInput from "../../components/formComponent/TextAreaInput";

function ReprintModal({ show, onHandleShow, id, onSuccess }) {
    const { t } = useTranslation();
    const theme = useLocalStorage("theme", "get");
    const isMobile = window.innerWidth < 768;

    const [loading, setLoading] = useState(false);

    const [payload, setPayload] = useState({
        ReprintRemark: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPayload((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async () => {

        if (!payload.ReprintRemark.trim()) {
            toast.error("Please enter remark");
            return;
        }

        try {
            setLoading(true);

            const res = await
                axiosReport.post("getreprintwithcomment", {
                    ledgerTransactionIDHash: id?.hash,
                    comment: payload.ReprintRemark
                });

            console.log(res?.data, "hrevrhedh    ")
            if (res?.data?.success === true) {


                toast.success("Saved Successfully");
                if (onSuccess) {
                    onSuccess(res.data);
                }
                //   onHandleShow()
                setPayload({ ReprintRemark: "" });
            } else {
                toast.error(res?.data?.message || "Something went wrong");
            }
        } catch (error) {
            toast.error("Server Error");
            console.log(error,"vdshfadsgvfhoibdsafihasdf");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog
            header={t("Reprint Remarks")}
            visible={show}
            onHide={onHandleShow}
            style={{
                width: isMobile ? "90vw" : "25vw",
            }}
            className={theme}
        >
            <div className="p-2">
                <TextAreaInput
                    placeholder=" "
                    type="text"
                    id="ReprintRemark"
                    lable="ReprintRemark"
                    name="ReprintRemark"
                    max={100}
                    value={payload.ReprintRemark}
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
                            onClick={onHandleShow}
                        >
                            {t("Close")}
                        </button>
                    </div>
                </div>
            </div>
        </Dialog>
    );
}

export default ReprintModal;