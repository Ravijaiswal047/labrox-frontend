import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowDownIconSVG,
  ArrowRightIconSVG,
  ExcelIconSVG,
  PDFIconSVG,
} from "../../../components/SvgIcons";
import Heading from "../../../components/UI/Heading";
import { exportHtmlToPDFNoPrintFinance } from "../../../utils/exportLibrary";
import { useTranslation } from "react-i18next";
 import * as XLSX from "xlsx-js-style";
import { formatAmount } from "../../../utils/ustil2";
export default function HierarchyDivTable({
  data = [],
  fetchLazyChildren,
  values,
}) {
  /* ================= CONSTANTS ================= */
  const [t] = useTranslation();
  const IGNORE_KEYS = [
    "GroupCode",
    "GroupCodeDisplay",
    "Nodes",
    "DepartmentCode",
    "GroupName",
    "IsLast",
    "isRemoveArrow",
  ];

  const exportToExcel = () => {
    const rows = [];

    const TITLE = values?.reportType?.label || "REPORT";

    // 🔥 Title row (will be merged later)
    rows.push([TITLE]);

    // 🔥 Empty row for spacing
    // rows.push([]);

    // 🔥 Column Header
    rows.push(["Group Code", "Particulars", ...columnKeys]);

    const walk = (row, level = 0) => {
      const children = getChildren(row);
      const lazy = lazyChildren[getUniqueId(row)] || [];

      // Normal row
      rows.push([
        row.GroupCode,
        " ".repeat(level * 4) + row.GroupName,
        ...columnKeys.map((k) => (row.IsLast === 1 ? row[k] ?? "" : "")),
      ]);

      // Children
      [...children, ...lazy].forEach((c) => walk(c, level + 1));

      // Total row (ONLY static parents)
      if (hasChildren(row) && !row?.isRemoveArrow) {
        rows.push([
          "",
          " ".repeat(level * 4) + `Total ${row.GroupName}`,
          ...columnKeys.map((k) => sumChildren(row, k)),
        ]);
      }
    };

    roots.forEach((r) => walk(r));

    const worksheet = XLSX.utils.aoa_to_sheet(rows);

    /* ================= STYLING ================= */

    const range = XLSX.utils.decode_range(worksheet["!ref"]);

    // 🔥 Merge TITLE row across all columns
    worksheet["!merges"] = [
      {
        s: { r: 0, c: 0 },
        e: { r: 0, c: columnKeys.length + 1 },
      },
    ];

    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const ref = XLSX.utils.encode_cell({ r: R, c: C });
        if (!worksheet[ref]) continue;

        const isTitle = R === 0;
        const isHeader = R === 1;

        worksheet[ref].s = {
          font: {
            bold: isTitle || isHeader,
            sz: isTitle ? 14 : 11,
            color: {
              rgb: isTitle ? "FFFFFF" : "000000", // white title text
            },
          },
          alignment: {
            horizontal: isTitle ? "center" : C >= 2 ? "right" : "left",
            vertical: "center",
            wrapText: true,
          },
          fill: isTitle
            ? { fgColor: { rgb: "305496" } } // 🔵 Dark blue (Title)
            : isHeader
              ? { fgColor: { rgb: "D9E1F2" } } // 🔹 Light blue/gray (Header)
              : { fgColor: { rgb: "FFFFFF" } }, // ⚪ White (Body)
          border: {
            top: { style: "thin", color: { rgb: "000000" } },
            bottom: { style: "thin", color: { rgb: "000000" } },
            left: { style: "thin", color: { rgb: "000000" } },
            right: { style: "thin", color: { rgb: "000000" } },
          },
        };
      }
    }

    // 🔥 Column widths (clean look)
    worksheet["!cols"] = [
      { wch: 15 }, // Group Code
      { wch: 40 }, // Particulars
      ...columnKeys.map(() => ({ wch: 18 })),
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");

    XLSX.writeFile(workbook, `${TITLE}.xlsx`);
  };

  /* ================= UTILS ================= */

  const getUniqueId = (row) =>
    row.DepartmentCode
      ? `${row.GroupCode}_${row.DepartmentCode}`
      : row.GroupCode;

  // columns from ALL rows (except ignored)
  const columnKeys = useMemo(() => {
    const set = new Set();
    data.forEach((row) => {
      Object.keys(row).forEach((k) => {
        if (!IGNORE_KEYS.includes(k)) set.add(k);
      });
    });
    return Array.from(set);
  }, [data]);

  const hasChildren = (row) =>
    data.some(
      (r) =>
        r.GroupCode !== row.GroupCode &&
        r.GroupCode.startsWith(row.GroupCode) &&
        r.Nodes > row.Nodes
    );

  const getChildren = (row) =>
    data.filter(
      (r) =>
        r.GroupCode !== row.GroupCode &&
        r.GroupCode.startsWith(row.GroupCode) &&
        r.Nodes === row.Nodes + 1
    );

  /* ================= STATE ================= */

  const [expanded, setExpanded] = useState({});
  const [lazyChildren, setLazyChildren] = useState({});

  /* ================= DEFAULT EXPAND ================= */

  useEffect(() => {
    const map = {};
    data.forEach((r) => {
      if (hasChildren(r)) {
        map[getUniqueId(r)] = true;
      }
    });
    setExpanded(map);
  }, [data]);

  /* ================= TOTAL CALC ================= */

  const sumChildren = (row, key) => {
    let sum = 0;

    const walk = (parent) => {
      const children = getChildren(parent);
      const lazy = lazyChildren[getUniqueId(parent)] || [];

      [...children, ...lazy].forEach((child) => {
        if (child.IsLast === 1 || !hasChildren(child)) {
          sum += Number(child[key] || 0);
        } else {
          walk(child);
        }
      });
    };

    walk(row);
    return sum;
  };

  /* ================= HANDLERS ================= */

  const toggleRow = async (row) => {
    const id = getUniqueId(row);

    if (
      row.DepartmentCode &&
      !expanded[id] &&
      !lazyChildren[id] &&
      fetchLazyChildren
    ) {
      const res = await fetchLazyChildren(row);
      setLazyChildren((p) => ({ ...p, [id]: res || [] }));
    }

    setExpanded((p) => ({ ...p, [id]: !p[id] }));
  };

  /* ================= RENDER ROW ================= */

  const renderRow = (row, level = 0, index) => {
    const id = getUniqueId(row);
    const children = getChildren(row);
    const lazy = lazyChildren[id] || [];

    const showArrow =
      (children.length > 0 || lazy.length > 0 || !!row.DepartmentCode) &&
      !row?.isRemoveArrow;

    return (
      <React.Fragment key={id}>
        {/* ROW */}
        <div className={`rowtbl level-${level}`}>
          {/* GroupCode column */}
          <div className={`cell level-${level}`}>{row.GroupCode}</div>

          {/* Name column */}
          <div className="cell name" style={{ paddingLeft: level * 20 }}>
            {showArrow && (
              <span className="arrow" onClick={() => toggleRow(row)}>
                {expanded[id] ? <ArrowDownIconSVG /> : <ArrowRightIconSVG />}
              </span>
            )}
            {row.GroupName}
          </div>

          {/* Amount columns */}
          {columnKeys.map((k) => (
            <div key={k} className="cell amount">
              {row.IsLast === 1 ? formatAmount(row[k]) ?? "" : ""}
            </div>
          ))}
        </div>

        {/* CHILDREN */}
        {expanded[id] && children.map((c) => renderRow(c, level + 1))}
        {expanded[id] && lazy.map((c) => renderRow(c, level + 1))}

        {/* TOTAL — only STATIC parents, never lazy */}
        {hasChildren(row) && !row?.isRemoveArrow && (
          <div className={`rowtbl total level-${level}`}>
            <div className="cell"></div>

            <div className="cell name d-flex justify-content-end">
              Total {row.GroupName} :
            </div>

            {columnKeys.map((k) => (
              <div key={k} className="cell amount">
                {formatAmount(sumChildren(row, k))}
              </div>
            ))}
          </div>
        )}

        {roots?.length > 0 && (roots?.length - 1 === index) && (
          <React.Fragment>
            <div className={`rowtbl total level-${level}`}>
              <div className="cell"></div>

              <div className="cell name d-flex justify-content-end text-success">
                {t("Total Net Profit/Loss")}:
              </div>

              {columnKeys.map((k) => (
                <div key={k} className="cell amount">
                  {data?.reduce((acc, row) => acc + Number(row[k] || 0), 0) > 0 ? <span style={{ color: "green" }}>{formatAmount(data?.reduce((acc, row) => acc + Number(row[k] || 0), 0))}</span> : <span style={{ color: "red" }}>{formatAmount(data?.reduce((acc, row) => acc + Number(row[k] || 0), 0))}</span>}
                </div>
              ))}
            </div>
            <div className={`rowtbl total level-${level}`}>
              <div className="cell"></div>

              <div className="cell name d-flex justify-content-end text-success">
                {t("Surplus/Deficit")}:
              </div>

              {columnKeys.map((k) => (
                <div key={k} className="cell amount">
                  {data?.reduce((acc, row) => acc + Number(row[k] || 0), 0) > 0 ? <span style={{ color: "green" }}>{t("Surplus")}</span> : <span style={{ color: "red" }}>{t("Deficit")}</span>}
                </div>
              ))}
            </div>
          </React.Fragment>
        )}
      </React.Fragment>
    );
  };

  const roots = data.filter((r) => r.Nodes === 0);
  const handleExportPDF = () => {
    exportHtmlToPDFNoPrintFinance(
      "printSectionpdf",
      values?.reportType?.label,
      "landscape"
    );
  };

  /* ================= RENDER ================= */

  return (
    <>
    <Heading
        isBreadcrumb={false}
        title={t("Statement of Income and Expenditure")}
        secondTitle={
          <>
            <span onClick={handleExportPDF} className="no-print">
              <PDFIconSVG />
            </span>

            <span className="no-print" onClick={exportToExcel}>
              <ExcelIconSVG />{" "}
            </span>
          </>
        }
      />
    <div className="wrapper">
      
      <style>{`
        .wrapper {
          border: 1px solid #ccc;
          max-height: 500px;
          overflow: scroll;
          font-family: Arial, sans-serif;
          background: #fff;
        }

        // .header,
        // .rowtbl {
        //   display: grid;
        //   grid-template-columns: 1fr 2fr repeat(${columnKeys.length}, 1fr);
        //   border-bottom: 1px solid #e0e0e0;
        //   background: #fff;
        // }

        .header,
.rowtbl {
  display: grid;
  grid-template-columns:150px        /* Group Code – fixed, small */
    651px        /* Particulars – fixed, main column */
    repeat(${columnKeys.length}, 18%); 
    border-bottom: 1px solid #e0e0e0;
}


        .header {
          position: sticky;
          top: 0;
          background: #fafafa;
          font-weight: bold;
          z-index: 5;
        }

        .cell {
          padding: 0px 6px;
          background: #fff;
          border-bottom: 1px solid lightgray;
          // border-left: 1px solid lightgray;
          border-right: 1px solid lightgray;
        }

        .cell.code {
          color: #000000ff;
          font-weight: 600;
        }

        .amount {
          text-align: right;
        }

        .arrow {
          cursor: pointer;
          margin-right: 6px;
          user-select: none;
        }

        .total {
          // font-weight: bold;
          // border-top: 1px solid #ccc;
        }

        /* LEVEL COLORS */
          .level-0 { color: rgb(186 84 142);}
        .level-1 { color: #0b35ff;}
        .level-2 { color: #0a8f22;}
        .level-3 { color: rgb(118, 68, 171);}

 
  .header,
.rowtbl {
  // min-width: 1200px; 
}
  .header div{
  border:1px, solid,#ccc
  }
      `}</style>

      {/* HEADER */}
      <div className="header">
        <div className="cell code card-header">Group Code</div>
        <div className="cell name card-header">Particulars</div>
        {columnKeys.map((k) => (
          <div key={k} className="cell amount card-header">
            {k}
          </div>
        ))}
      </div>

      {/* BODY */}
      {roots.map((r, index) => renderRow(r, 0, index))}
    </div>
    </>
  );
}
