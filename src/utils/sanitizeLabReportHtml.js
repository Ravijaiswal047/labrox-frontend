const ALLOWED_TAGS = new Set([
  "P", "BR", "B", "STRONG", "I", "EM", "U", "UL", "OL", "LI", "TABLE", "THEAD",
  "TBODY", "TFOOT", "TR", "TD", "TH", "SPAN", "DIV", "H1", "H2", "H3", "H4",
  "H5", "H6", "SUB", "SUP", "HR", "BLOCKQUOTE", "PRE", "CODE", "SMALL", "CENTER",
  "FONT", "IMG",
]);

const SKIP_TAGS = new Set([
  "SCRIPT", "STYLE", "IFRAME", "OBJECT", "EMBED", "LINK", "META", "BASE", "FORM",
  "NOSCRIPT", "SVG", "MATH", "APPLET", "FRAME", "FRAMESET", "HTML", "HEAD", "BODY",
]);

const ALLOWED_ATTRS = new Set(["colspan", "rowspan", "src", "alt", "href"]);

const isSafeUrl = (value) => {
  const url = String(value || "").trim();
  if (!url) return false;
  if (url.startsWith("#") || url.startsWith("/") || url.startsWith("./") || url.startsWith("../")) {
    return true;
  }
  try {
    const parsed = new URL(url, window.location.origin);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

const sanitizeNode = (node, doc) => {
  if (node.nodeType === Node.TEXT_NODE) {
    return doc.createTextNode(node.textContent || "");
  }
  if (node.nodeType !== Node.ELEMENT_NODE) {
    return null;
  }

  const tag = node.tagName;
  if (SKIP_TAGS.has(tag)) {
    return null;
  }

  if (!ALLOWED_TAGS.has(tag)) {
    const fragment = doc.createDocumentFragment();
    Array.from(node.childNodes).forEach((child) => {
      const cleaned = sanitizeNode(child, doc);
      if (cleaned) fragment.appendChild(cleaned);
    });
    return fragment;
  }

  const clean = doc.createElement(tag.toLowerCase());
  Array.from(node.attributes || []).forEach((attr) => {
    const name = attr.name.toLowerCase();
    if (name.startsWith("on") || !ALLOWED_ATTRS.has(name)) return;
    if ((name === "href" || name === "src") && !isSafeUrl(attr.value)) return;
    if (name === "src" && tag !== "IMG") return;
    clean.setAttribute(name, attr.value);
  });

  Array.from(node.childNodes).forEach((child) => {
    const cleaned = sanitizeNode(child, doc);
    if (cleaned) clean.appendChild(cleaned);
  });
  return clean;
};

export const sanitizeLabReportHtml = (html) => {
  if (!html || typeof html !== "string") return "";
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div id="lr-root">${html}</div>`, "text/html");
  const root = doc.getElementById("lr-root");
  if (!root) return "";

  const out = document.createElement("div");
  Array.from(root.childNodes).forEach((child) => {
    const cleaned = sanitizeNode(child, document);
    if (cleaned) out.appendChild(cleaned);
  });
  return out.innerHTML;
};
