import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import {
  LayoutGrid,
  ClipboardList,
  FileText,
  Wallet,
  Percent,
  Users,
  Star,
  Download,
  LogOut,
  Menu as MenuIcon,
  X as CloseIcon,
} from "lucide-react";

import "./B2BConnectLayout.css";

// Full nav map for the portal (section 6 of the design proposal). Only
// Dashboard is wired to a real screen so far — the rest render as
// "Soon" so the shell honestly reflects build progress instead of 404-ing.
const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: LayoutGrid, path: "/B2BConnect/Dashboard", ready: true },
  { key: "registrations", label: "My Registrations", icon: ClipboardList, path: "/B2BConnect/MyRegistrations", ready: false },
  { key: "reports", label: "My Reports", icon: FileText, path: "/B2BConnect/MyReports", ready: false },
  { key: "money", label: "My Money", icon: Wallet, path: "/B2BConnect/MyMoney", ready: false },
  { key: "rates", label: "My Rates", icon: Percent, path: "/B2BConnect/MyRates", ready: false },
  { key: "clients", label: "My Clients", icon: Users, path: "/B2BConnect/MyClients", ready: false },
  { key: "feedback", label: "Feedback", icon: Star, path: "/B2BConnect/Feedback", ready: false },
  { key: "downloads", label: "Downloads", icon: Download, path: "/B2BConnect/Downloads", ready: false },
];

const getB2BUserData = () => {
  try {
    return JSON.parse(sessionStorage.getItem("b2b_userData") || "{}");
  } catch {
    return {};
  }
};

// Shared shell for every /B2BConnect/* screen — left nav + top bar. Screens
// pass their content as children and a short title; this is the one place
// logout, client identity and nav state live, so later screens (My
// Registrations, My Reports, ...) only need to render their own body.
const B2BConnectLayout = ({ children, title }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [navOpen, setNavOpen] = useState(false);
  const userData = getB2BUserData();

  const handleNavClick = (item) => {
    if (!item.ready) {
      toast.info(`${item.label} is coming soon`);
      return;
    }
    setNavOpen(false);
    navigate(item.path);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("b2b_token");
    sessionStorage.removeItem("b2b_userData");
    sessionStorage.removeItem("PortalType");
    toast.success("Logged out");
    navigate("/B2BConnect/Login", { replace: true });
  };

  return (
    <div className="b2bc-shell">
      {navOpen && <div className="b2bc-nav-scrim" onClick={() => setNavOpen(false)} />}

      <aside className={`b2bc-sidebar ${navOpen ? "b2bc-sidebar-open" : ""}`}>
        <div className="b2bc-sidebar-brand">
          <span>B2B Connect</span>
          <button className="b2bc-sidebar-close" onClick={() => setNavOpen(false)} aria-label="Close menu">
            <CloseIcon size={18} />
          </button>
        </div>
        <nav className="b2bc-sidebar-nav">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = location.pathname.toLowerCase() === item.path.toLowerCase();
            return (
              <button
                key={item.key}
                type="button"
                className={[
                  "b2bc-nav-item",
                  active ? "b2bc-nav-item-active" : "",
                  !item.ready ? "b2bc-nav-item-soon" : "",
                ].join(" ").trim()}
                onClick={() => handleNavClick(item)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {!item.ready && <em className="b2bc-nav-badge">Soon</em>}
              </button>
            );
          })}
        </nav>
      </aside>

      <div className="b2bc-main">
        <header className="b2bc-topbar">
          <button className="b2bc-hamburger" onClick={() => setNavOpen((v) => !v)} aria-label="Toggle menu">
            <MenuIcon size={20} />
          </button>
          <h1 className="b2bc-topbar-title">{title}</h1>
          <div className="b2bc-topbar-right">
            <div className="b2bc-topbar-client">
              <strong>{userData?.EmployeeName || userData?.Username || "Client"}</strong>
              <span>{userData?.RateTypeName || userData?.BusinessUnit || ""}</span>
            </div>
            <button className="b2bc-logout" onClick={handleLogout}>
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </header>
        <main className="b2bc-content">{children}</main>
      </div>
    </div>
  );
};

export default B2BConnectLayout;
