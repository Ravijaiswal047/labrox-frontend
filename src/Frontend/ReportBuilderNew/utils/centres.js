import { axiosInstance } from "@app/utils/axiosInstance";

// Confirmed existing endpoint, already used elsewhere in the app (e.g.
// src/utils/NetworkApi/commonApi.js's getDashboardAccessCentres). Its envelope is the
// OLDER {message: [...]} shape (lowercase "message", array directly) — do not confuse
// this with the ReportBuilderNew module's {Message, success} envelope in
// NetworkServices/ReportBuilderNew.js, they're different conventions from different
// parts of the backend.
export const fetchAccessCentres = async () => {
  try {
    const res = await axiosInstance.get("Centre/getAccessCentres");
    const rows = res?.data?.message;
    if (!Array.isArray(rows)) return [];
    return rows.map((row) => ({
      id: row.CentreID,
      name: row.Centre,
    }));
  } catch {
    return [];
  }
};
