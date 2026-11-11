import { Dialog } from 'primereact/dialog'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next';
import Loading from '../../components/loader/Loading';
import { useLocalStorage } from '../../utils/hooks/useLocalStorage';
import Input from '../../components/formComponent/Input';
import { toast } from 'react-toastify';
import { axiosInstance } from '../../utils/axiosInstance';

const ReasonModal = ({ show, onHide, data = [] }) => {
    const { t } = useTranslation();
    const isMobile = window.innerWidth <= 768;
    const [load, setLoad] = useState(false);
    const [remark, setRemark] = useState({});
    const theme = useLocalStorage("theme", "get");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setRemark({ [name]: value });
    };

    const handleModalClose = () => {
        onHide(false);
        setRemark({})
    };

    const handleSave = async () => {
        const payload = {
            appointmentID: String(data.App_ID),
            status: "cancel",
            remark: remark.reason,
            PatientID: data.PatientID,
            PName: data.NAME,
            DoctorName: data.DoctorName,
            ContactNo: data.ContactNo,
            AppDate: data.AppDate,
        }
        console.log(payload)
        try {
            setLoad(true);
            const res = await axiosInstance.post(
                "OPDConsultant/Appointment/UpdateStatus",
                payload,
            );

            if (res?.data?.success) {
                toast.success(res?.data?.message);
                handleModalClose();
                setLoad(false);
            }
            setLoad(false);
        } catch (error) {
            console.log(error);
            setLoad(false);
        }


    }



    return (
        <Dialog
            header={"Cancel Reason"}
            visible={show}
            onHide={handleModalClose}
            className={theme}
            style={{ width: isMobile ? "95vw" : "30vw" }}
            modal
        >
            <div className="row p-2">
                <div className="col-sm-8">
                    <Input
                        type="text"
                        name="reason"
                        id="reason"
                        lable={t("Enter Your Reason")}
                        placeholder=""
                        onChange={handleChange}
                        value={remark.reason || ""}
                    />
                </div>
                <div className="col-sm-8">
                    <Input
                        type="text"
                        name="reason"
                        id="reason"
                        lable={t("Enter Your Reason")}
                        placeholder=""
                        onChange={handleChange}
                        value={remark.reason || ""}
                    />
                </div>

            </div>

            <div className="row px-2 mt-2 mb-1">
                <div className="col-sm-3 mb-2">
                    {load ? (
                        <Loading />
                    ) : (
                        <button
                            className="btn btn-success btn-sm btn-block"
                            onClick={handleSave}
                        >
                            {t("Save")}
                        </button>
                    )}
                </div>
                <div className="col-sm-3  mb-2">
                    <div>
                        <button
                            className="btn btn-success btn-sm btn-block"
                            onClick={handleModalClose}
                        >
                            {t("Cancel")}
                        </button>
                    </div>
                </div></div>


        </Dialog>
    )
}

export default ReasonModal


