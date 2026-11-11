import React, { useRef, useState } from "react";
import * as XLSX from "xlsx";
import ExcelPreviewModal from "./ExcelPreviewModal"; // ensure path is correct
import { toast } from "react-toastify";
import "./Indent.css";
const ExcelUploadComponent = ({
  templateData = [],
  fileAccept = ".xlsx, .xls",
  onFileParsed = () => {},
  uploadLabel = "Select File To Upload",
  downloadLabel = "Download Template",
  t = (label) => label,
  // excelData,
  // AddEcelList,
}) => {
  const uploadRef = useRef();
  const [previewData, setPreviewData] = useState([]);
  const [uploadedFile, setUploadedFile] = useState(null);

  const handleUploadButtonClick = () => {
    uploadRef?.current?.click();
  };

  const handleUploadFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadedFile(file);
    processFile(file);
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

      const keys = jsonData[0];
      const formattedData = jsonData.slice(1).map((row) =>
        keys.reduce((acc, key, index) => {
          acc[key] = row[index] || "";
          return acc;
        }, {})
      );

      setPreviewData(jsonData);
      onFileParsed(formattedData);
    };

    reader.readAsArrayBuffer(file);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && fileAccept.includes(file.name.split(".").pop())) {
      setUploadedFile(file);
      processFile(file);
    } else {
      toast.error("Only valid Excel files are allowed.");
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setPreviewData([]);
  };

  // const downloadTemplate = () => {
  //   if (!templateData?.length)
  //     return toast.warning("No template data provided");

  //   const worksheet = XLSX.utils.json_to_sheet(templateData, {
  //     header: Object.keys(templateData[0]),
  //   });

  //   XLSX.utils.sheet_add_aoa(worksheet, newExcel, {
  //     origin: "A1",
  //   });

  //   const workbook = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  //   XLSX.writeFile(workbook, "Template.xlsx");
  // };
  const downloadTemplate = () => {
    // if (!templateData?.length)
    //   return toast.warning("Current Location and Category is Required");
    // return toast.warning("No template data provided");

    const worksheet = XLSX.utils.json_to_sheet(templateData, {
      header: Object.keys(templateData[0]),
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(workbook, "Template.xlsx");
  };

  return (
    <div className="d-flex">
      {/* Download Template */}
      <div
        onClick={downloadTemplate}
        className="col-xl-2 col-sm-4 col-md-6 col-12"
      >
        <div className="generate_excel justify-content-between px-2">
          {t(downloadLabel)}
          <i className="bi bi-arrow-bar-down mb-0"></i>
        </div>
      </div>

      {/* Upload Section */}
      <div
        className="col-xl-2 col-sm-6 col-md-6 col-12"
        onClick={handleUploadButtonClick}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="generate_excel justify-content-start pl-2">
          {!uploadedFile ? (
            <span
              className="w-100 d-flex align-content-center"
              style={{ gap: "6px" }}
            >
              {t(uploadLabel)}
              <input
                ref={uploadRef}
                onChange={handleUploadFile}
                type="file"
                accept={fileAccept}
                className="d-none"
              />
            </span>
          ) : (
            <span className="d-flex justify-content-between w-100 align-items-center">
              {uploadedFile?.name?.length > 15
                ? uploadedFile.name.slice(0, 15) + "..."
                : uploadedFile.name}
              <div className="d-flex align-items-center gap-2">
                <i
                  onClick={handleRemoveFile}
                  className="bi bi-trash3 mb-0 my-1 mx-2"
                ></i>
                <ExcelPreviewModal
                  excelJsonData={previewData}
                  fileName={uploadedFile.name}
                />
              </div>
            </span>
          )}
        </div>
      </div>

      {/* Upload Button */}
      <div className="col-sm-2">
        <button className="btn btn-sm btn-success" disabled={!uploadedFile}>
          Upload Excel
        </button>
      </div>
    </div>
  );
};

export default ExcelUploadComponent;
