import { SAMPLE_DISCOUNT_ON_TOTAL, SAMPLE_LINE_ITEMS, SAMPLE_SETTLEMENTS } from "./sampleData";

export const computeSampleTotals = () => {
  const gross = SAMPLE_LINE_ITEMS.reduce((sum, row) => sum + row.rate * row.qty - row.disc, 0);
  const discTotal = SAMPLE_DISCOUNT_ON_TOTAL;
  const net = gross - discTotal;
  const paid = SAMPLE_SETTLEMENTS.reduce((sum, row) => sum + row.amount, 0);
  const due = net - paid;
  // MRP (list price) before any per-item discount — distinct from `gross`, which is
  // already net of item-level discounts. Only meaningful for report types whose Totals
  // catalog includes a "Total of MRP" row (e.g. Fully Paid Receipt's {TotalMRP}).
  const totalMRP = SAMPLE_LINE_ITEMS.reduce((sum, row) => sum + row.rate * row.qty, 0);
  return { gross, discTotal, net, paid, due, totalMRP };
};

export const formatMoney = (value) =>
  "₹ " + Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });
