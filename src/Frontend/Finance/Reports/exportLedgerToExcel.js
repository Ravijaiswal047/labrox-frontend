import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const exportLedgerToExcel = (groupedData) => {
  const wsData = [];

  // =========================
  // HEADER ROW
  // =========================
  wsData.push([
    "S.No.",
    "Centre",
    "Branch Centre",
    "Vch.Date",
    "Vch.Type",
    "Vch.No.",
    "Bill No.",
    "Bill Date",
    "Department",
    "Narration",
    "Ref No.",
    "Ref Date",
    "Currency",
    "C.F.",
    "Debit",
    "Credit",
    "Running Bal.",
    "Type",
  ]);

  let sno = 1;

  // =========================
  // DATA ROWS
  // =========================
  Object.values(groupedData).forEach((cog) => {
    // COG row
    wsData.push([`COG ${cog.COGName}`]);

    Object.values(cog.coas).forEach((coa) => {
      // COA row
      wsData.push([`COA ${coa.COAName}`]);

      let totalDebit = 0;
      let totalCredit = 0;

      coa.rows.forEach((r) => {
        totalDebit += Number(r.Debit || 0);
        totalCredit += Number(r.Credit || 0);

        wsData.push([
          sno++,
          r.CentreName,
          r.BranchCentre,
          r.VoucherDate,
          r.VoucherName,
          r.VoucherNo,
          r.BillNo,
          r.BillDate,
          r.DepartmentName,
          r.Narations,
          r.RefNo,
          r.RefDate,
          r.CurrencyCode,
          r.CurrencyFactor,
          r.Debit,
          r.Credit,
          r.RunningBal,
          r.RunningBal?.includes("Dr") ? "Dr" : "Cr",
        ]);
      });

      // TOTAL ROW
      wsData.push([
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "Total :",
        totalDebit,
        totalCredit,
        "",
        "",
      ]);
    });
  });

  // =========================
  // CREATE WORKSHEET
  // =========================
  const worksheet = XLSX.utils.aoa_to_sheet(wsData);

  // =========================
  // BORDER STYLE
  // =========================
  const borderStyle = {
    top: { style: "thin" },
    bottom: { style: "thin" },
    left: { style: "thin" },
    right: { style: "thin" },
  };

  // =========================
  // APPLY BORDER + ALIGNMENT
  // =========================
  const range = XLSX.utils.decode_range(worksheet["!ref"]);

  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
      const cell = worksheet[cellAddress];
      if (!cell) continue;

      cell.s = {
        border: borderStyle,
        alignment: {
          vertical: "center",
          horizontal: C >= 14 ? "right" : "center",
        },
      };
    }
  }

  // =========================
  // HEADER STYLE
  // =========================
  for (let C = 0; C <= 17; C++) {
    const cell = worksheet[XLSX.utils.encode_cell({ r: 0, c: C })];
    if (cell) {
      cell.s = {
        ...cell.s,
        font: { bold: true },
        fill: { fgColor: { rgb: "EAEAEA" } },
      };
    }
  }

  // =========================
  // MERGE COG / COA ROWS
  // =========================
  worksheet["!merges"] = wsData
    .map((row, i) => {
      if (typeof row[0] === "string" && row[0].startsWith("COG")) {
        return { s: { r: i, c: 0 }, e: { r: i, c: 17 } };
      }
      if (typeof row[0] === "string" && row[0].startsWith("COA")) {
        return { s: { r: i, c: 0 }, e: { r: i, c: 17 } };
      }
      return null;
    })
    .filter(Boolean);

  // =========================
  // COLUMN WIDTHS
  // =========================
  worksheet["!cols"] = [
    { wch: 6 },
    { wch: 18 },
    { wch: 18 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 18 },
    { wch: 30 },
    { wch: 12 },
    { wch: 12 },
    { wch: 10 },
    { wch: 8 },
    { wch: 14 },
    { wch: 14 },
    { wch: 16 },
    { wch: 8 },
  ];

  // =========================
  // WORKBOOK
  // =========================
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, worksheet, "Ledger");

  const excelBuffer = XLSX.write(wb, {
    bookType: "xlsx",
    type: "array",
    cellStyles: true, // 🔥 REQUIRED
  });

  saveAs(new Blob([excelBuffer]), "LedgerReport.xlsx");
};

export default exportLedgerToExcel;
