// Dummy records and helpers for the Equipment Transfer tab.

export const TRANSFER_STATUS = {
  PENDING: "Pending",
  APPROVED: "Approved",
  RECEIVED: "Received",
  REJECTED: "Rejected",
};

export const transferBadgeClass = (status) =>
  ({
    Pending: "em-badge em-badge-maintenance",
    Approved: "em-badge em-badge-supplier",
    Received: "em-badge em-badge-active",
    Rejected: "em-badge em-badge-outofservice",
  })[status] || "em-badge em-badge-inactive";

// ─── DUMMY DATA — replace with the transfer API when it exists ──────────────
export const DUMMY_TRANSFERS = [
  {
    TransferID: "TRF-2026-012",
    EquipmentCode: "EQ-0006",
    FromCentre: "Gurugram — Sector 44",
    ToCentre: "Noida — Sector 62",
    RequestedBy: "Centre Manager — Gurugram",
    TransferDate: "2026-09-10",
    Status: "Pending",
    Reason: "Micro workload shifted to Noida",
  },
  {
    TransferID: "TRF-2026-011",
    EquipmentCode: "EQ-0005",
    FromCentre: "Delhi — Rajouri Garden",
    ToCentre: "Ghaziabad — RDC",
    RequestedBy: "Biomedical HOD",
    TransferDate: "2026-08-18",
    Status: "Approved",
    Reason: "Backup centrifuge for RDC",
  },
  {
    TransferID: "TRF-2026-010",
    EquipmentCode: "EQ-0011",
    FromCentre: "Noida — Sector 62",
    ToCentre: "Delhi — Rajouri Garden",
    RequestedBy: "Ops Head",
    TransferDate: "2026-07-30",
    Status: "Received",
    Reason: "Histopath consolidation at Delhi",
  },
  {
    TransferID: "TRF-2026-009",
    EquipmentCode: "EQ-0010",
    FromCentre: "Ghaziabad — RDC",
    ToCentre: "Gurugram — Sector 44",
    RequestedBy: "Centre Manager — Ghaziabad",
    TransferDate: "2026-07-02",
    Status: "Rejected",
    Reason: "Unit due for condemnation",
  },
];
