// ── Static filter lists (not from API) ──────────────────────
export const TICKET_STATUSES   = ["Open", "In Progress", "Hold", "Escalated", "Resolved", "Closed"];
export const TICKET_PRIORITIES = ["Critical", "High", "Medium", "Low"];

// ── SLA helper — uses server-computed ElapsedMinutes & TAT_Minutes ──
export const getSlaStatus = (elapsed, tat) => {
  const pct = tat > 0 ? (elapsed / tat) * 100 : 0;
  if (pct >= 100) return { label: "Breached",    cls: "tk-sla-danger",  barColor: "#ef4444" };
  if (pct >= 80)  return { label: "At Risk",     cls: "tk-sla-warning", barColor: "#f59e0b" };
  return              { label: "Within SLA", cls: "tk-sla-ok",      barColor: "#22c55e" };
};

// ── Badge className maps ─────────────────────────────────────
export const STATUS_BADGE_MAP = {
  Open:          "tk-badge tk-status-open",
  "In Progress": "tk-badge tk-status-progress",
  Hold:          "tk-badge tk-status-hold",
  Escalated:     "tk-badge tk-status-escalated",
  Resolved:      "tk-badge tk-status-resolved",
  Closed:        "tk-badge tk-status-closed",
};

export const PRIORITY_BADGE_MAP = {
  Critical: "tk-badge tk-pri-critical",
  High:     "tk-badge tk-pri-high",
  Medium:   "tk-badge tk-pri-medium",
  Low:      "tk-badge tk-pri-low",
};

// ── Fallback colour palette for category cards in dashboard ──
// (Dashboard summary does not return hex colours — use index-based palette)
export const CAT_COLOR_PALETTE = [
  { color: "#1d4ed8", bgColor: "#dbeafe", icon: "bi bi-receipt"         },
  { color: "#991b1b", bgColor: "#fee2e2", icon: "bi bi-flask"            },
  { color: "#92400e", bgColor: "#fef3c7", icon: "bi bi-clock-fill"       },
  { color: "#065f46", bgColor: "#d1fae5", icon: "bi bi-x-circle-fill"    },
  { color: "#1d4ed8", bgColor: "#dbeafe", icon: "bi bi-tag-fill"         },
  { color: "#6d28d9", bgColor: "#ede9fe", icon: "bi bi-grid-fill"        },
];

// Maps backend Tabler icon class → Bootstrap icon class (API sends ti ti-* from DB)
export const resolveIconClass = (tiClass) => {
  const map = {
    "ti ti-receipt":           "bi bi-receipt",
    "ti ti-flask-off":         "bi bi-flask",
    "ti ti-clock-exclamation": "bi bi-clock-fill",
    "ti ti-x-circle":          "bi bi-x-circle-fill",
    "ti ti-tag":               "bi bi-tag-fill",
    "ti ti-category":          "bi bi-grid-fill",
    "ti ti-ticket":            "bi bi-ticket-perforated-fill",
    "ti ti-alert-triangle":    "bi bi-exclamation-triangle-fill",
    "ti ti-circle-check":      "bi bi-check-circle-fill",
    "ti ti-clock-off":         "bi bi-clock-history",
    "ti ti-loader":            "bi bi-arrow-repeat",
    "ti ti-folder-open":       "bi bi-folder2-open",
    "ti ti-users":             "bi bi-people-fill",
    "ti ti-flag":              "bi bi-flag-fill",
    "ti ti-list":              "bi bi-list-ul",
    "ti ti-adjustments":       "bi bi-sliders",
  };
  return map[tiClass] || "bi bi-tag-fill";
};
