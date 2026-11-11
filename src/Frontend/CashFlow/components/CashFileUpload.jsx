import React, { useRef, useState } from "react";

const CashFileUpload = ({ placeholder = "Upload File", allowedTypes = [], onFileSelect }) => {
  const inputRef = useRef();
  const [fileName, setFileName] = useState("");

  const handleChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) {
      setFileName("");
      onFileSelect && onFileSelect(null);
      return;
    }
    setFileName(files.map((f) => f.name).join(", "));
    onFileSelect && onFileSelect(files.length === 1 ? files[0] : files);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setFileName("");
    inputRef.current.value = "";
    onFileSelect && onFileSelect(null);
  };

  return (
    <div className="d-flex align-items-center gap-1">
      <input
        ref={inputRef}
        type="file"
        accept={allowedTypes.join(",")}
        onChange={handleChange}
        style={{ display: "none" }}
        multiple
      />
      <button
        type="button"
        className="btn btn-sm rounded px-3 py-1"
        style={{
          maxWidth: "180px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          backgroundColor: "#8B1A1A",
          color: "#fff",
          border: "none",
        }}
        onClick={() => inputRef.current.click()}
        title={fileName || placeholder}
      >
        <i className="bi bi-paperclip me-1" />
        {fileName ? fileName : placeholder}
      </button>
      {fileName && (
        <button
          type="button"
          className="btn btn-sm p-0 text-danger"
          onClick={handleClear}
          title="Remove"
          style={{ lineHeight: 1 }}
        >
          <i className="bi bi-x-circle-fill" />
        </button>
      )}
    </div>
  );
};

export default CashFileUpload;
