import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

export const exportToExcel = async (
  data,
  columnStyles,
  header1,
  header2,
  condition = false,
  fileName,
) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Sheet1");

  // Create lookup map for styles by column display name
  const columnStyleMap = {};
  (columnStyles || []).forEach((col) => {
    if (col.ColumnDisplayName) {
      columnStyleMap[col.ColumnDisplayName] = col;
    }
  });

  const numColumns = Object.keys(data[0] || {}).length;
  let rowNumber = 1;

  // Header 1
  if (header1) {
    const titleRow = worksheet.addRow([header1]);
    titleRow.font = {
      bold: true,
      size: 16,
      color: { argb: condition ? "FFFF0000" : "FF000000" },
    };
    titleRow.alignment = {
      horizontal: "center",
      vertical: "middle",
      wrapText: true,
    };

    titleRow.height = 25;
    worksheet.mergeCells(rowNumber, 1, rowNumber, numColumns);
    rowNumber++;
  }

  // Header 2
  if (header2) {
    const subtitleRow = worksheet.addRow([header2]);
    subtitleRow.font = { bold: true, size: 14 };
    subtitleRow.alignment = {
      horizontal: "center",
      vertical: "middle",
      wrapText: true,
    };
    subtitleRow.height = 25;

    if (header2.includes("Summary")) {
      subtitleRow.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFFFF00" }, // Yellow fill
        };
      });
    }

    worksheet.mergeCells(rowNumber, 1, rowNumber, numColumns);
    rowNumber++;
  }

  // Column headers
  const columnHeaders = Object.keys(data[0]);
  const headerRow = worksheet.addRow(columnHeaders);
  headerRow.height = 25;

  headerRow.eachCell((cell, colNumber) => {
    const displayName = cell.value;
    const style = columnStyleMap[displayName];

    // Utility to convert #RRGGBB to AARRGGBB (ExcelJS format)
    const convertColor = (color) => {
      if (!color) return undefined;
      const c = color.replace("#", "");
      return c.length === 6 ? "FF" + c.toUpperCase() : c.toUpperCase();
    };

    cell.font = {
      bold: true,
      size: style?.HeaderFontSize || 12,
      color: {
        argb: convertColor(style?.HeaderFontColor) || "FFFFFFFF",
      },
      name: style?.FontFamily || undefined,
    };

    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: {
        argb: convertColor(style?.HeaderColor) || "FF4F81BD",
      },
    };

    cell.alignment = {
      horizontal: style?.Alignment || "center",
      vertical: "middle",
      wrapText: false  // Disable wrap for headers to keep them on one line
    };

    cell.border = {
      top: { style: "thin" },
      bottom: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" },
    };
  });

  worksheet.autoFilter = {
    from: { row: rowNumber, column: 1 },
    to: { row: rowNumber, column: numColumns },
  };

  // Data rows
  data.forEach((rowData) => {
    const processedRow = Object.values(rowData).map((val) => {
      if (val !== null && val !== "" && !isNaN(val)) {
        return parseFloat(Number(val).toFixed(2));
      }
      return val;
    });

    const row = worksheet.addRow(processedRow);
    row.height = 15;

    row.eachCell((cell, colNumber) => {
      const displayName = columnHeaders[colNumber - 1];
      const style = columnStyleMap[displayName];

      const convertColor = (color) => {
        if (!color) return undefined;
        const c = color.replace("#", "");
        return c.length === 6 ? "FF" + c.toUpperCase() : c.toUpperCase();
      };

      if (typeof cell.value === "number") {
        cell.numFmt = "0.00";
        cell.alignment = { horizontal: "right", vertical: "middle", wrapText: true };
      } else {
        cell.alignment = {
          horizontal: style?.Alignment || "left",
          vertical: "middle",
          wrapText: true,
        };
      }

      cell.font = {
        color: { argb: convertColor(style?.FontColor) || "FF000000" },
        size: style?.FontSize || 12,
        bold: style?.FontWeight?.toLowerCase() === "bold",
        name: style?.FontFamily || "Arial",
      };

      cell.border = {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      };
    });
  });

  // Auto-size columns based on content with priority to headers
  worksheet.columns.forEach((column, colIndex) => {
    // Check if this column has a custom width specified
    const displayName = columnHeaders[colIndex];
    const style = columnStyleMap[displayName];
    
    if (style?.ColumnWidth) {
      // Keep the custom width if specified
      column.width = style.ColumnWidth / 5;
      return;
    }

    // Calculate the maximum content width for this column
    let maxLength = 0;

    column.eachCell({ includeEmpty: false }, (cell) => {
      const cellValue = cell.value ? cell.value.toString() : '';
      let cellLength = cellValue.length;
      
      // Give extra weight to header cells (bold text takes more space)
      // Headers are typically in the first few rows
      if (cell.font && cell.font.bold) {
        cellLength = cellLength * 1.2; // Bold text appears wider
      }
      
      if (cellLength > maxLength) {
        maxLength = cellLength;
      }
    });

    // Ensure header text length is considered
    const headerText = columnHeaders[colIndex] || '';
    const headerLength = headerText.length * 1.2; // Account for bold font
    
    if (headerLength > maxLength) {
      maxLength = headerLength;
    }

    // Set width with some padding
    // Minimum width of 12, maximum width of 60 for readability
    const calculatedWidth = maxLength < 12 ? 12 : Math.min(maxLength * 1.1, 60);
    column.width = calculatedWidth;
  });

  // Export to file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  saveAs(blob, `${fileName ? fileName : header1}.xlsx`);
};







// import ExcelJS from "exceljs";
// import { saveAs } from "file-saver";

// export const exportToExcel = async (
//   data,
//   columnStyles,
//   header1,
//   header2,
//   condition = false,
//   fileName
// ) => {
//   const workbook = new ExcelJS.Workbook();
//   const worksheet = workbook.addWorksheet("Sheet1");

//   // Create lookup map for styles by column display name
//   const columnStyleMap = {};
//   (columnStyles || []).forEach(col => {
//     if (col.ColumnDisplayName) {
//       columnStyleMap[col.ColumnDisplayName] = col;
//     }
//   });

//   const numColumns = Object.keys(data[0] || {}).length;
//   let rowNumber = 1;

//   // Header 1
//   if (header1) {
//     const titleRow = worksheet.addRow([header1]);
//     titleRow.font = {
//       bold: true,
//       size: 16,
//       color: { argb: condition ? "FFFF0000" : "FF000000" }
//     };
//     titleRow.alignment = { horizontal: "center", vertical: "middle" };
//     titleRow.height = 25;
//     worksheet.mergeCells(rowNumber, 1, rowNumber, numColumns);
//     rowNumber++;
//   }

//   // Header 2
//   if (header2) {
//     const subtitleRow = worksheet.addRow([header2]);
//     subtitleRow.font = { bold: true, size: 14 };
//     subtitleRow.alignment = { horizontal: "center", vertical: "middle" };
//     subtitleRow.height = 25;

//     if (header2.includes("Summary")) {
//       subtitleRow.eachCell(cell => {
//         cell.fill = {
//           type: "pattern",
//           pattern: "solid",
//           fgColor: { argb: "FFFFFF00" } // Yellow fill
//         };
//       });
//     }

//     worksheet.mergeCells(rowNumber, 1, rowNumber, numColumns);
//     rowNumber++;
//   }

//   // Column headers
//   const columnHeaders = Object.keys(data[0]);
//   const headerRow = worksheet.addRow(columnHeaders);
//   headerRow.height = 25;

//   headerRow.eachCell((cell, colNumber) => {
//     const displayName = cell.value;
//     const style = columnStyleMap[displayName];

//     // Utility to convert #RRGGBB to AARRGGBB (ExcelJS format)
//     const convertColor = (color) => {
//       if (!color) return undefined;
//       const c = color.replace("#", "");
//       return c.length === 6 ? "FF" + c.toUpperCase() : c.toUpperCase();
//     };

//     cell.font = {
//       bold: true,
//       size: style?.HeaderFontSize || 12,
//       color: {
//         argb: convertColor(style?.HeaderFontColor) || "FFFFFFFF"
//       },
//       name: style?.FontFamily || undefined,
//       // weight handled by bold property, no direct fontWeight in ExcelJS
//     };

//     cell.fill = {
//       type: "pattern",
//       pattern: "solid",
//       fgColor: {
//         argb: convertColor(style?.HeaderColor) || "FF4F81BD"
//       }
//     };

//     cell.alignment = {
//       horizontal: style?.Alignment || "center",
//       vertical: "middle"
//     };

//     cell.border = {
//       top: { style: "thin" },
//       bottom: { style: "thin" },
//       left: { style: "thin" },
//       right: { style: "thin" }
//     };

//     if (style?.ColumnWidth) {
//       worksheet.getColumn(colNumber).width = style.ColumnWidth / 7;
//     }
//   });

//   worksheet.autoFilter = {
//     from: { row: rowNumber, column: 1 },
//     to: { row: rowNumber, column: numColumns }
//   };

//   // Data rows
//   data.forEach(rowData => {
//     const processedRow = Object.values(rowData).map(val => {
//       if (val !== null && val !== "" && !isNaN(val)) {
//         return parseFloat(Number(val).toFixed(2));
//       }
//       return val;
//     });

//     const row = worksheet.addRow(processedRow);
//     row.height = 15;

//     row.eachCell((cell, colNumber) => {
//       const displayName = columnHeaders[colNumber - 1];
//       const style = columnStyleMap[displayName];

//       const convertColor = (color) => {
//         if (!color) return undefined;
//         const c = color.replace("#", "");
//         return c.length === 6 ? "FF" + c.toUpperCase() : c.toUpperCase();
//       };

//       if (typeof cell.value === "number") {
//         cell.numFmt = "0.00";
//         cell.alignment = { horizontal: "right", vertical: "middle" };
//       } else {
//         cell.alignment = {
//           horizontal: style?.Alignment || "left",
//           vertical: "middle"
//         };
//       }

//       cell.font = {
//         color: { argb: convertColor(style?.FontColor) || "FF000000" },
//         size: style?.FontSize || 12,
//        bold: style?.FontWeight?.toLowerCase() === "bold",
//         name: style?.FontFamily || "Arial"
//       };

//       cell.border = {
//         top: { style: "thin" },
//         bottom: { style: "thin" },
//         left: { style: "thin" },
//         right: { style: "thin" }
//       };
//     });
//   });

//   // Default column width if not set
//   worksheet.columns.forEach(col => {
//     if (!col.width) col.width = 20;
//   });

//   // Export to file
//   const buffer = await workbook.xlsx.writeBuffer();
//   const blob = new Blob([buffer], {
//     type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//   });

//   saveAs(blob, `${fileName ? fileName : header1}.xlsx`);
// };
