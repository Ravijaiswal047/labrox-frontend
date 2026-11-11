import { useLocalStorage } from "@app/utils/hooks/useLocalStorage";
import { toLayoutJson } from "./layoutJson";

// Phase-1 stand-in for the backend (see plan: "Mock/localStorage now, real API later").
// `useLocalStorage` here is a plain callable (AES-encrypted JSON get/set), not a React
// hook — safe to call outside components, same as the rest of the app already does.

const STORE_KEY = "ReceiptTemplate_Store_v1";

const readStore = () => useLocalStorage(STORE_KEY, "get") || {};
const writeStore = (store) => useLocalStorage(STORE_KEY, "set", store);

export const listTemplates = () => {
  const store = readStore();
  return Object.values(store)
    .map((doc) => ({
      templateId: doc.templateId,
      code: doc.template?.code,
      name: doc.template?.name,
      status: doc.template?.status,
      version: doc.template?.version,
      pageSize: doc.template?.pageSize,
      orientation: doc.template?.orientation,
    }))
    .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
};

export const getTemplate = (templateId) => {
  const store = readStore();
  return store[templateId] || null;
};

export const saveTemplate = (state) => {
  const store = readStore();
  const doc = toLayoutJson(state);
  const templateId = doc.templateId || crypto.randomUUID();
  const existing = store[templateId];
  const version = existing ? (existing.template?.version || 1) : 1;
  const finalDoc = { ...doc, templateId, template: { ...doc.template, version } };
  store[templateId] = finalDoc;
  writeStore(store);
  return finalDoc;
};

export const publishTemplate = (templateId) => {
  const store = readStore();
  const existing = store[templateId];
  if (!existing) return null;
  const updated = {
    ...existing,
    template: {
      ...existing.template,
      status: "Published",
      version: (existing.template?.version || 1) + 1,
    },
  };
  store[templateId] = updated;
  writeStore(store);
  return updated;
};

export const removeTemplate = (templateId) => {
  const store = readStore();
  delete store[templateId];
  writeStore(store);
};
