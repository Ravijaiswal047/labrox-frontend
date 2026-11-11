import React, { useState, useEffect } from "react";
import { notify } from "../../../src/utils/utils";
import ColorCodingSearch from "../ModalComponent/ColorCodingSearch";
import { useTranslation } from "react-i18next";
import "./Slots.css";

const DEFAULT_SLOT_CLASS = {
    Available: "slot-available",
    Booked: "slot-booked",
    Blocked: "slot-not-available",
    Past: "slot-not-available",
    Selected: "slot-selected",
};

const CommonSlotSelector = ({
    slotGroups = [],
    onChange = () => { },
    slotClassMap = {},
    isSingleGroup = false,
}) => {
    const { t } = useTranslation();
    const [groups, setGroups] = useState([]);

    useEffect(() => {
        setGroups(JSON.parse(JSON.stringify(slotGroups)));
    }, [slotGroups]);

    const getSlotClass = (status) =>
        slotClassMap[status] || DEFAULT_SLOT_CLASS[status] || "";

    const onSelectSlot = (slot, group) => {
        const updatedGroups = JSON.parse(JSON.stringify(groups));
        const groupIndex = updatedGroups.findIndex(
            (g) => g.groupId === group.groupId
        );

        if (groupIndex === -1) return;

        // Single group restriction
        if (isSingleGroup) {
            const alreadySelected = updatedGroups.find(
                (g) => g.slots.some((s) => s.status === "Selected")
            );

            if (alreadySelected && alreadySelected.groupId !== group.groupId) {
                notify("Invalid Slot Selection!", "error");
                return;
            }
        }

        const slotIndex = slot.index;
        const currentSlot = updatedGroups[groupIndex].slots[slotIndex];

        if (currentSlot.status === "Selected") {
            updatedGroups[groupIndex].slots[slotIndex].status = "Available";
        } else {
            if (currentSlot.status !== "Available") return;
            updatedGroups[groupIndex].slots[slotIndex].status = "Selected";
        }

        setGroups(updatedGroups);
        onChange(updatedGroups);
    };

    return (
        <div className="slot-container">

            <div className="d-flex flex-wrap mb-2">
                {Object.keys(DEFAULT_SLOT_CLASS).map((key) => (
                    <div key={key} className="d-flex align-items-center mx-2">
                        <ColorCodingSearch label={t(key)} />
                    </div>
                ))}
            </div>


            {groups.map((group) => (
                <div key={group.groupId} className="slot-group">
                    <h6 className="slot-group-title">{group.groupLabel}</h6>

                    <div className="d-flex flex-wrap gap-2">
                        {group.slots.length > 0 ? (
                            group.slots.map((slot) => {
                                const isClickable =
                                    slot.status === "Available" || slot.status === "Selected";

                                return (
                                    <div
                                        key={slot.index}
                                        className={`slot-box ${getSlotClass(slot.status)}`}
                                        onClick={
                                            isClickable
                                                ? () => onSelectSlot(slot, group)
                                                : undefined
                                        }
                                        title={slot.label}
                                        style={{
                                            cursor: isClickable ? "pointer" : "not-allowed",
                                            opacity: isClickable ? 1 : 0.6,
                                        }}
                                    >
                                        {slot.label}
                                    </div>
                                );
                            })
                        ) : (
                            <span className="text-danger">{t("No Slots Available")}</span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default CommonSlotSelector;
