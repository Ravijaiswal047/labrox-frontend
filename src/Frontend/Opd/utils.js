export const adaptSlotsToUI = (apiDates = []) => {
  return apiDates.map((dateObj, dateIndex) => {
    return {
      appointmentDate: dateObj.appointmentDate,
      status: dateObj.status,
      message: dateObj.message,
      defaultAvailableSlot: dateObj.defaultAvailableSlot,

      shifts: (dateObj.shifts || []).map((shift, shiftIndex) => ({
        groupId: shiftIndex + 1,
        groupLabel: shift.shiftName,

        slots: (shift.slots || []).map((slot, slotIndex) => {
          let status = "Available";

          if (slot.isPast) status = "Past";
          else if (slot.isBlocked) status = "Blocked";
          else if (slot.isBooked) status = "Booked";

          return {
            index: slotIndex,
            label: slot.time,
            status, // 👈 keep for backward compatibility

            // ✅ ADD THESE (THIS IS THE FIX)
            isPast: !!slot.isPast,
            isBlocked: !!slot.isBlocked,
            isBooked: !!slot.isBooked,
          };
        }),
      })),
    };
  });
};

export const resolveSlotStatus = (slot) => {
  if (slot.isBooked) return "Booked";
  if (slot.isBlocked) return "Blocked";
  if (slot.isPast) return "Past";
  return "Available";
};
