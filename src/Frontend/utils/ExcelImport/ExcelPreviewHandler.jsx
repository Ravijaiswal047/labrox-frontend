import React, { useRef, useState } from "react";
import * as XLSX from "xlsx";
import { notify } from "../../../utils/utils";
import ExcelPreviewModal from "./ExcelPreviewModal";
import { useTranslation } from "react-i18next";
import { Button } from "react-bootstrap";
import { CiImport } from "react-icons/ci";
import { useDispatch } from "react-redux";
import { setImportExcelData } from "../../../store/reducers/loadingSlice/loadingSlice";

const ExcelPreviewHandler = ({ buttonText = "Import File" }) => {
  const [t] = useTranslation();
  const dispatch = useDispatch();
  const uploadRef = useRef(null);
  const [previewData, setPreviewData] = useState([]);
  const [campPayload, setCampPayload] = useState({ uploadFile: {} });

  const handleUploadButtonClick = () => {
    uploadRef?.current?.click();
  };

  const processFile = (file) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = e.target.result;
      const workbook = XLSX.read(new Uint8Array(data), { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];

      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: "",
      });

      const [headers, ...rows] = jsonData;

      // Filter out rows that are completely empty
      const filteredRows = rows.filter((row) =>
        row.some((cell) => cell !== "" && cell !== null && cell !== undefined)
      );

      // Step 2: Convert to JSON array
      const jsonArrayNew = filteredRows.map((row) => {
        return headers.reduce((obj, header, index) => {
          if (header) {
            obj[header] = row[index] !== undefined ? row[index] : "";
          }
          return obj;
        }, {});
      });

      setPreviewData([headers, ...filteredRows]);
      dispatch(setImportExcelData(jsonArrayNew));
    };

    reader.readAsArrayBuffer(file);
  };

  const handleUploadFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setCampPayload((prev) => ({ ...prev, uploadFile: file }));
    processFile(file);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];

    if (
      file &&
      (file.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.type === "application/vnd.ms-excel")
    ) {
      setCampPayload((prev) => ({ ...prev, uploadFile: file }));
      processFile(file);
    } else {
      notify(t("Only Excel files are allowed."), "error");
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleRemoveFile = () => {
    setCampPayload((prev) => ({ ...prev, uploadFile: {} }));
  };

  return (
    <div
      className="generate_excel"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleUploadButtonClick}
    >
      {!campPayload?.uploadFile?.name ? (
        <span
          style={{ gap: "6px" }}
          className="w-100 d-flex align-content-center ml-2"
        >
          <Button style={{ gap: "3px" }} className="rounded">
            <CiImport />
            {t(`${buttonText}`)}
          </Button>
          <input
            ref={uploadRef}
            onChange={handleUploadFile}
            type="file"
            accept=".xlsx, .xls"
            className="d-none"
          />
        </span>
      ) : (
        <Button className="d-flex rounded justify-content-between w-100 align-items-center pl-2">
          {campPayload?.uploadFile?.name?.length > 15
            ? campPayload?.uploadFile?.name?.slice(0, 15) + "..."
            : campPayload?.uploadFile?.name}
          <div className="d-flex align-items-center gap-2">
            <i
              onClick={handleRemoveFile}
              className="bi bi-trash3 p-0 mb-0 my-1 mx-1 text-danger"
            ></i>
            <ExcelPreviewModal
              excelJsonData={previewData}
              fileName={campPayload?.uploadFile?.name}
            />
          </div>
        </Button>
      )}
    </div>
  );
};

export default ExcelPreviewHandler;
