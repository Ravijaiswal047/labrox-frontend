export const getYears = (range = 8) => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: range }, (_, i) => {
    const year = currentYear + i;
    return { label: year.toString(), value: year };
  });
};

export const getMonths = () => {
  return Array.from({ length: 12 }, (_, i) => ({
    label: new Date(0, i).toLocaleString("default", { month: "long" }),
    value: i + 1, // month index (1–12)
  }));
};

export const getDaysInMonth = (year, month) => {
  const totalDays = new Date(year, month, 0).getDate();
  return Array.from({ length: totalDays }, (_, i) => {
    const dateObj = new Date(year, month - 1, i + 1);
    return {
      dateLabel: dateObj.toLocaleString("default", {
        month: "long",
        day: "numeric",
      }),
      day: dateObj.toLocaleString("default", { weekday: "short" }),
      fullDate: dateObj,
    };
  });
};

export const getCallHeaders = (count = 50) =>
  Array.from({ length: count }, (_, i) => `Call-${i + 1}`);
