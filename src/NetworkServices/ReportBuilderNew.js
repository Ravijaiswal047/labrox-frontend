import { axiosInstance } from "../utils/axiosInstance";

const BASE = "ReportBuilderNew";

// The backend is inconsistent about the casing of the payload key — some responses
// (per the backend team's own reference doc) use "Message", but the live API has also
// been observed returning lowercase "message" for the same envelope shape. Accept both
// rather than silently returning an empty payload when the casing doesn't match.
const payloadOf = (body) => (body?.Message !== undefined ? body.Message : body?.message);

const request = async (method, url, config = {}) => {
  try {
    const res = await axiosInstance.request({ method, url, ...config });
    const body = res.data;
    if (body && typeof body === "object" && body.success) {
      return { success: true, message: null, data: payloadOf(body) };
    }
    const payload = payloadOf(body);
    const message = typeof payload === "string" ? payload : "Something went wrong";
    return { success: false, message, data: null };
  } catch (err) {
    if (!err?.response) {
      return { success: false, message: "Network error — check your connection", data: null, networkError: true };
    }
    const status = err.response.status;
    const body = err.response.data;
    if (status === 404) {
      const message = typeof body === "string" ? body : payloadOf(body) || "Not found";
      return { success: false, message, data: null, notFound: true };
    }
    const bodyPayload = typeof body === "object" ? payloadOf(body) : null;
    const message = (typeof bodyPayload === "string" && bodyPayload) || err.message || "Something went wrong";
    return { success: false, message, data: null };
  }
};

export const getFieldTokens = (reportType = "Receipt") =>
  request("get", `${BASE}/GetFieldTokens`, { params: { ReportType: reportType } });

export const getColumnCatalog = (reportType = "Receipt") =>
  request("get", `${BASE}/GetColumnCatalog`, { params: { ReportType: reportType } });

export const getTemplateList = ({ reportType = "Receipt", search = "", status = "" } = {}) =>
  request("get", `${BASE}/GetTemplateList`, { params: { ReportType: reportType, Search: search, Status: status } });

export const getTemplateById = (templateId) =>
  request("get", `${BASE}/GetTemplateById`, { params: { TemplateId: templateId } });

export const saveTemplate = (doc) => request("post", `${BASE}/SaveTemplate`, { data: doc });

export const publishTemplate = (templateId) =>
  request("post", `${BASE}/PublishTemplate`, { data: { templateId } });

export const deleteTemplate = (templateId) =>
  request("post", `${BASE}/DeleteTemplate`, { data: { templateId } });
