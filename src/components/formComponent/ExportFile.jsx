import React from "react";

import { useTranslation } from "react-i18next";
import { CustomButton } from "../UI/CustomButton";
function ExportFile({ dataExcel }) {
  const ExportToExcel = async (data, fileName = "data.xlsx") => {
    const XLSX = await import("xlsx");
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(workbook, fileName);
  };
  const { t } = useTranslation();
  return (
    <>
      <>
        <CustomButton 
          icon={"download"}
          text={"Download"}
           onClick={() => ExportToExcel(dataExcel)}
          disabled={dataExcel.length == 0}
        />
      </>
    </>
  );
}

export default ExportFile;
