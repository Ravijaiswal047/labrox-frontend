import React, { useState } from "react";
import { Dialog } from "primereact/dialog";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { axiosInstance } from "../../utils/axiosInstance";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import Loading from "../../components/loader/Loading";
import "./Slots.css";

const RescheduleModal = ({
    show,
    onHide,
    slotGroups = [],
    appointmentRow,
    secondTitle,
}) => {
    const { t } = useTranslation();


    const theme = useLocalStorage("theme", "get");
    const isMobile = window.innerWidth <= 768;

    const [loading, setLoading] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);

    /* ---------------- SAVE API CALL ---------------- */
    const handleSave = async () => {
        if (!selectedSlot) {
            toast.error("Please select a slot");
            return;
        }

        const { date, slot, nextSlot } = selectedSlot;

        const payload = {
            doctorID: appointmentRow.DoctorID,
            AppointmentDate: date,
            AppointmentId: String(appointmentRow.App_ID),
            SlotTiming: `${date}#${slot.label}-${nextSlot.label}`,
            CentreID: String(appointmentRow.CentreID),
        };

        try {
            setLoading(true);
            const res = await axiosInstance.post(
                "OPDConsultant/Appointment/Reschedule",
                payload
            );

            if (res?.data?.success) {
                toast.success(res.data.message);
                onHide(false);
            }
        } catch (error) {
            toast.error("Reschedule failed");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        onHide(false);
        setSelectedSlot(null);
    };

    return (
        <Dialog
            header="Appointment Reschedule"
            visible={show}
            onHide={handleClose}
            className={theme}
            style={{ width: isMobile ? "95vw" : "90vw" }}
            modal
        >
            {/* optional title */}
            {secondTitle && <div className="row p-2">{secondTitle}</div>}

            {/* SCROLLABLE SLOT AREA */}
            <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                {slotGroups.map((dateGroup) => (
                    <div key={dateGroup.appointmentDate} className="p-2">
                        <h5 className="ot-name">{dateGroup.appointmentDate}</h5>

                        {dateGroup.shifts?.length === 0 ? (
                            <p className="text-danger fw-bold blink-red">
                                {dateGroup.message || "No slots available"}
                            </p>
                        ) : (
                            dateGroup.shifts.map((shift) => (
                                <div key={shift.groupId} className="mb-3">
                                    <h6>{shift.groupLabel}</h6>

                                    <div
                                        className="d-flex flex-wrap"
                                        style={{ gap: 5, marginBottom: 9 }}
                                    >
                                        {shift.slots.map((slot, idx) => {
                                            const nextSlot = shift.slots[idx + 1];
                                            if (!nextSlot) return null;
                                            const clickable =
                                                !slot.isPast &&
                                                !slot.isBlocked &&
                                                !slot.isBooked


                                            const isSelected =
                                                selectedSlot?.date === dateGroup.appointmentDate &&
                                                selectedSlot?.slot?.index === slot.index &&
                                                selectedSlot?.nextSlot?.index === nextSlot.index;


                                            const resolveSlotClass = (s) => {
                                                if (s.isPast) return "slot-expired";
                                                if (s.isBlocked) return "slot-confirmed";
                                                if (s.isBooked) return "slot-booked";
                                                return "slot-available";
                                            };
                                            const slotClass = resolveSlotClass(slot);

                                            console.log({
                                                time: slot.label,
                                                isBooked: slot.isBooked,
                                                isBlocked: slot.isBlocked,
                                                isPast: slot.isPast,
                                                appliedClass: resolveSlotClass(slot),
                                            });

                                            return (
                                                <div
                                                    key={slot.index}
                                                    className={`slot-box  ${slotClass} ${isSelected ? "slot-selected" : ""}
      `}
                                                    style={{
                                                        cursor: clickable ? "pointer" : "not-allowed",
                                                        opacity: clickable ? 1 : 0.6,
                                                    }}
                                                    onClick={
                                                        clickable
                                                            ? () =>
                                                                setSelectedSlot({
                                                                    date: dateGroup.appointmentDate,
                                                                    slot,
                                                                    nextSlot,
                                                                })
                                                            : undefined
                                                    }
                                                >
                                                    {slot.label} – {nextSlot.label}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                ))}
            </div>

            {/* FOOTER BUTTONS */}
            <div className="row px-2 mt-3">
                <div className="col-sm-2 mb-2">
                    {loading ? (
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

                <div className="col-sm-2 mb-2">
                    <button
                        className="btn btn-secondary btn-sm btn-block"
                        onClick={handleClose}
                    >
                        {t("Cancel")}
                    </button>
                </div>
            </div>
        </Dialog>
    );
};

export default RescheduleModal;
