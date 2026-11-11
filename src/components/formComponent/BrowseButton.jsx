import React from "react";
import { useTranslation } from "react-i18next";
import { UploadFileIcon, UploadSuccessIcon } from "../SvgIcons";

export default function BrowseButton({
  ref,
  handleImageChange,
  accept,
  label,
  className,
  value,
  name,
}) {
  const [t] = useTranslation();
  return (
    <>
      <input
        type="file"
        id={name ? name : "fileInput"}
        onChange={handleImageChange}
        name={name}
        style={{ display: "none" }}
        accept={accept}
        ref={ref}
      />
      <button className={`btn btn-sm ${className}`}>
        <label
          htmlFor={name ? name : "fileInput"}
          className="text-white file-type-browse pointer-cursor"
        >
          {label ? label : t("Browse")}{" "}
          {value ? <UploadSuccessIcon /> : <UploadFileIcon />}
        </label>
      </button>
      {/* {name && (
        <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg shadow-md">
          <span className="text-gray-700 font-medium">📄 {name}</span>
        </div>
      )} */}
    </>
  );
}
