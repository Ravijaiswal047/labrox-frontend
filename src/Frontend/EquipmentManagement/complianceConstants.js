export const COMPLIANCE_STANDARD_OPTIONS = [
  { label: "All Standards", value: "__ALL__" },
  { label: "ISO 15189", value: "ISO 15189" },
  { label: "NABL 112A", value: "NABL 112A" },
  { label: "NABH", value: "NABH" },
];

export const NC_SOURCE_OPTIONS = [
  { label: "Internal Audit", value: "Internal Audit" },
  { label: "NABL Assessment", value: "NABL Assessment" },
  { label: "NABH Audit", value: "NABH Audit" },
  { label: "Management Review", value: "Management Review" },
];

export const SESSION_OPTIONS = [
  { label: "Morning", value: "Morning" },
  { label: "Evening", value: "Evening" },
];

export const reqStatusBadgeClass = (status) => {
  switch (String(status).toLowerCase()) {
    case "compliant":
      return "em-badge em-badge-active";
    case "partial":
      return "em-badge em-badge-maintenance";
    case "gap":
      return "em-badge em-badge-outofservice";
    default:
      return "em-badge em-badge-inactive";
  }
};

export const ncStatusBadgeClass = (status) => {
  switch (String(status).toLowerCase()) {
    case "open":
      return "em-badge em-badge-outofservice";
    case "in progress":
      return "em-badge em-badge-maintenance";
    case "closed":
      return "em-badge em-badge-active";
    default:
      return "em-badge em-badge-inactive";
  }
};

export const standardBadgeClass = (std) => {
  switch (String(std).toUpperCase()) {
    case "ISO 15189":
      return "badge b-primary";
    case "NABL 112A":
      return "badge b-info";
    case "NABH":
      return "badge b-grey";
    default:
      return "badge b-grey";
  }
};
