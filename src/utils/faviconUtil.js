import Clients from "../Config/Clients";

const getMimeType = (href) => {
  if (href.includes(".ico")) return "image/x-icon";
  if (href.includes(".png")) return "image/png";
  if (href.includes(".svg")) return "image/svg+xml";
  if (href.includes(".jpg") || href.includes(".jpeg")) return "image/jpeg";
  return "";
};

const upsertLink = (rel, href, attrs = {}) => {
  let el = document.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.href = href;
  Object.entries(attrs).forEach(([key, value]) => {
    if (value) el.setAttribute(key, value);
    else el.removeAttribute(key);
  });
};

export const applyFaviconMeta = () => {
  const hostWithPort = window.location.host;

  let client;
  if (hostWithPort.includes("localhost")) {
    const envUrl = import.meta.env.VITE_APP_REACT_APP_BASE_URL?.split("//")?.[1]?.split("/")?.[0];
    client = Clients[envUrl] || Clients["uat-v9.itdoseinfo.com:8088"];
  } else {
    client = Clients[hostWithPort] || Clients["uat-v9.itdoseinfo.com:8088"];
  }

  if (!client) return;

  document.title = client.title;

  const effectiveFavicon = client.favicon || null;

  if (!effectiveFavicon) {
    upsertLink("icon", "data:,");
    return;
  }

  const href = `${effectiveFavicon}?v=${Date.now()}`;
  const type = getMimeType(effectiveFavicon);

  upsertLink("icon", href, { type, sizes: "32x32 48x48 64x64" });
  upsertLink("shortcut icon", href, { type });
  upsertLink("apple-touch-icon", href, { sizes: "180x180" });
};
