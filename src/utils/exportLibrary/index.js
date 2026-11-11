import * as XLSX from "xlsx";
// html2pdf.js is CJS — imported dynamically at usage point below
import store from "../../store/store";
import { setLoading } from "../../store/reducers/loadingSlice/loadingSlice";
import html2pdf from "html2pdf.js";
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";

// Function to export data to Excel
export const exportToExcel = (data, fileName) => {
  const ws = XLSX.utils.json_to_sheet(data);

  // Calculate maximum column widths
  const maxWidths = data.reduce((colWidths, row) => {
    Object.keys(row).forEach((key, index) => {
      const value = row[key]?.toString() || "";
      colWidths[index] = Math.max(colWidths[index] || 0, value.length);
    });
    return colWidths;
  }, []);

  // Set column widths in the worksheet
  ws["!cols"] = maxWidths.map((width) => ({ wch: width + 2 }));

  // Add filters to the first row
  ws["!autofilter"] = {
    ref: XLSX.utils.encode_range({
      s: { c: 0, r: 0 }, // Start column and row
      e: { c: maxWidths.length - 1, r: data.length }, // End column and row
    }),
  };

  // Create and append worksheet to a new workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

  // Save the workbook
  XLSX.writeFile(wb, `${fileName}.xlsx`);
};

// Function to export HTML content to PDF


// export const generatePDF = (data) => {
//   const doc = new jsPDF();

//   // Or use javascript directly:
//   autoTable(doc, {
//     head: [["Name", "Email", "Country"]],
//     body: [
//       ["David", "david@example.com", "Sweden"],
//       ["Castille", "castille@example.com", "Spain"],
//       // ...
//     ],
//   });

//   doc.save("table.pdf");
// };


export const exportHtmlToExcel = (parentDivId, reportName) => {
  const table = document.getElementById(parentDivId)?.querySelector("table");

  if (!table) return;

  /* =========================
     1️⃣ TABLE → WORKSHEET
  ========================= */
  const worksheet = XLSX.utils.table_to_sheet(table, {
    origin: "A3",
  });

  /* =========================
     2️⃣ REPORT HEADING
  ========================= */
  worksheet["A1"] = {
    v: reportName,
    t: "s",
    s: {
      font: { bold: true, sz: 16, color: { rgb: "FFFFFF" } },
      alignment: {
        horizontal: "center",
        vertical: "center",
        wrapText: false, // 🔥 IMPORTANT
      },
      fill: { fgColor: { rgb: "305496" } },
    },
  };

  const range = XLSX.utils.decode_range(worksheet["!ref"]);

  worksheet["!merges"] = [
    {
      s: { r: 0, c: 0 },
      e: { r: 0, c: range.e.c },
    },
  ];

  const applyRowspanAndColspan = (table, worksheet, startRow) => {
  const merges = worksheet["!merges"] || [];
  const rows = table.rows;

  for (let r = 0; r < rows.length; r++) {
    let excelCol = 0;

    for (let c = 0; c < rows[r].cells.length; c++) {
      const cell = rows[r].cells[c];

      while (
        merges.some(
          (m) =>
            m.s.r <= r + startRow &&
            m.e.r >= r + startRow &&
            m.s.c <= excelCol &&
            m.e.c >= excelCol,
        )
      ) {
        excelCol++;
      }

      const rowspan = cell.rowSpan || 1;
      const colspan = cell.colSpan || 1;

      if (rowspan > 1 || colspan > 1) {
        const start = { r: r + startRow, c: excelCol };
        const end = {
          r: r + startRow + rowspan - 1,
          c: excelCol + colspan - 1,
        };

        merges.push({ s: start, e: end });

        // 🔥 alignment MUST be applied to top-left cell only
        const ref = XLSX.utils.encode_cell(start);
        worksheet[ref].s = {
          ...(worksheet[ref]?.s || {}),
          alignment: {
            horizontal: "center",
            vertical: "center",
            wrapText: true,
          },
        };
      }

      excelCol += colspan;
    }
  }

  worksheet["!merges"] = merges;
};

const applyStylesFromHTML = (table, worksheet, startRow) => {
  const rows = table.rows;

  for (let r = 0; r < rows.length; r++) {
    let excelCol = 0;

    for (let c = 0; c < rows[r].cells.length; c++) {
      const cell = rows[r].cells[c];

      const excelRowIndex = r + startRow;

      // 🔥 ABSOLUTE BLOCK: REPORT HEADER ROW KO TOUCH MAT KARO
      if (excelRowIndex === 0) {
        excelCol += cell.colSpan || 1;
        continue;
      }

      const ref = XLSX.utils.encode_cell({
        r: excelRowIndex,
        c: excelCol,
      });

      if (!worksheet[ref]) {
        excelCol += cell.colSpan || 1;
        continue;
      }

      const isHeader = cell.tagName === "TH";

      worksheet[ref].s = {
        ...(worksheet[ref].s || {}),
        font: {
          bold: isHeader,
          color: { rgb: "000000" },
        },
        fill: isHeader
          ? {
              patternType: "solid",
              fgColor: { rgb: "D9D9D9" },
            }
          : undefined,
        alignment: {
          horizontal: "center",
          vertical: "center",
          wrapText: false,
        },
        border: {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } },
        },
      };

      excelCol += cell.colSpan || 1;
    }
  }
};

  /* =========================
     3️⃣ ROWSPAN / COLSPAN
  ========================= */
  applyRowspanAndColspan(table, worksheet, 2);

  /* =========================
     4️⃣ COLORS + BORDERS
  ========================= */
  applyStylesFromHTML(table, worksheet, 2);

  /* =========================
     5️⃣ COLUMN WIDTH
  ========================= */
  worksheet["!cols"] = Array(range.e.c + 1).fill({ wch: 22 });

  /* =========================
     6️⃣ EXPORT
  ========================= */
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Report");

  const buffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  saveAs(
    new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    `${reportName}.xlsx`,
  );
};
export const exportHtmlToPDFNoPrintFinance = (
  elementId,
  fileName = "report",
) => {
  const element = document.getElementById(elementId);

  if (!element) {
    console.error("PDF Export: Element not found");
    return;
  }

  // 🔥 Force desktop width
  const originalWidth = element.style.width;
  element.style.width = "1200px";

  const options = {
    margin: [10, 10, 10, 10],
    filename: `${fileName}.pdf`,
    image: { type: "jpeg", quality: 0.98 },

    html2canvas: {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      windowWidth: 1200,

      // 🚫 IGNORE ELEMENTS WITH .no-print
      ignoreElements: (el) => {
        return el.classList?.contains("no-print");
      },
    },

    jsPDF: {
      unit: "mm",
      format: "a4",
      orientation: "landscape",
    },

    pagebreak: {
      mode: ["avoid-all", "css", "legacy"],
    },
  };

  return html2pdf()
    .set(options)
    .from(element)
    .save()
    .finally(() => {
      element.style.width = originalWidth;
    });
};

export const exportHtmlToPDF = async (elementId, fileName) => {
  store.dispatch(setLoading(true));
  const hiddenTemplate = window.document.getElementById(elementId).innerHTML;

  // Temporarily show the element
  // hiddenTemplate.style.display = "block";

  const options = {
    margin: 0.5,
    filename: `${fileName}.pdf`,
    image: { type: "jpeg", quality: 0.98 }, // Adjust quality if needed
    html2canvas: { scale: 2 }, // Adjust settings for performance
    jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    pagebreak: { after: "section", mode: ["avoid-all", "css", "legacy"] }, // Handling page breaks
  };

  try {
    // Convert the temporary container to PDF and save
    // Adding a footer with page numbers
    await html2pdf()
      .from(hiddenTemplate)
      .set(options)
      .toContainer()
      .toCanvas()
      .toPdf()
      .get("pdf")
      .then((pdf) => {
        const totalPages = pdf.internal.getNumberOfPages();
        console.log("getHeight:" + pdf.internal.pageSize.getHeight());
        console.log("getWidth:" + pdf.internal.pageSize.getWidth());
        // const headerContent = document.querySelector('.main-template-Container').outerHTML;

        for (let i = 1; i <= totalPages; i++) {
          pdf.setPage(i);

          pdf.setFontSize(8);
          pdf.setTextColor(64, 64, 64);
          pdf.text(
            "Page " + i + " of " + totalPages,
            pdf.internal.pageSize.getWidth() / 2,
            pdf.internal.pageSize.getHeight() - 0.2,
          );
        }
      })
      .save();
  } catch (error) {
    console.error("Error generating PDF:", error);
  } finally {
    store.dispatch(setLoading(false));
  }
};
export const exportHtmlToPDFNoPrint = async (
  elementId,
  fileName,
  width = "200px",
  orientation = "portrait",
) => {
  store.dispatch(setLoading(true));
  const hiddenTemplate = window.document.getElementById(elementId);

  // Clone the actual element
  const clonedElement = hiddenTemplate.cloneNode(true);

  // clonedElement.querySelectorAll(".no-print").forEach(el => el.remove());

  // Remove .no-print elements and their empty parents
  clonedElement.querySelectorAll(".no-print").forEach((el) => {
    const parent = el.parentNode;
    el.remove();
    if (parent && parent.childElementCount === 0) parent.remove();
  });

  const options = {
    margin: [0.2, 0.2, 0.4, 0],
    filename: `${fileName}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, windowWidth: width },
    jsPDF: { unit: "in", format: "a4", orientation: orientation },
    pagebreak: { after: "section", mode: ["avoid-all", "css", "legacy"] }, // Fix page break issues
  };

  try {
    await html2pdf()
      .from(clonedElement)
      .set(options)
      .toContainer()
      .toCanvas()
      .toPdf()
      .get("pdf")
      .then((pdf) => {
        const totalPages = pdf.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
          pdf.setPage(i);
          pdf.setFontSize(8);
          pdf.setTextColor(64, 64, 64);
          pdf.text(
            `Page ${i} of ${totalPages}`,
            pdf.internal.pageSize.getWidth() / 2,
            pdf.internal.pageSize.getHeight() - 0.2,
          );
        }
      })
      .save();
  } catch (error) {
    console.error("Error generating PDF:", error);
  } finally {
    store.dispatch(setLoading(false));
  }
};