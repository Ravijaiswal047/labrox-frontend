import React, { useRef, useEffect, useState } from "react";
import { notify } from "../../utils/utils";
import Modal from "../../components/ModalComponent/Modal";
import { FaUpload, FaTimes, FaFileAlt } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { setFiles, addFile, removeFile } from "../../store/reducers/fileUploadSlice/fileUploadSlice";
import "./FileUpload.css";

const FileUpload = ({
  allowedTypes = "*",
  uploadSize = "single",
  onFileSelect,
  directFileUpload = null,
  buttonLabel = "Upload Files",
  className=" ",
}) => {
  const inputRef = useRef(null);
  const dispatch = useDispatch();
  const { files: selectedFiles } = useSelector((state) => state.fileUploadSlice);

  const [isVisible, setVisible] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const validateFile = (file) => {
    if (allowedTypes !== "*" && Array.isArray(allowedTypes)) {
      const isValid = allowedTypes.some((type) =>
        file?.name?.toLowerCase()?.endsWith(type.toLowerCase())
      );
      if (!isValid) {
        notify(`Invalid file type. Allowed: ${allowedTypes.join(", ")}`, "error");
        return false;
      }
    }
    return true;
  };


  const handleFiles = (files) => {
    console.log("files",files);
    let validFiles = Array.from(files).filter((file) => validateFile(file));
    if (validFiles.length === 0) return;

    if (uploadSize === "single") {
      dispatch(setFiles([validFiles[0]]));
      onFileSelect && onFileSelect(validFiles[0]);
    } else {
      const updated = [...selectedFiles, ...validFiles];
      dispatch(setFiles(updated));
      onFileSelect && onFileSelect(updated);
    }
  };

  const handleChange = (e) => {
    handleFiles(e.target.files);
  };

  useEffect(() => {
    if (directFileUpload?.name) {
      handleFiles([directFileUpload]);
    }
  }, [directFileUpload]);

  const handleRemoveFile = (index) => {
    dispatch(removeFile(index));
    const updated = selectedFiles.filter((_, i) => i !== index);
    onFileSelect && onFileSelect(updated);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => setDragActive(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className={className}>
      {/* Upload button opens modal */}
      <button
        type="button"
        className="btn btn-primary d-flex align-items-center gap-2"
        onClick={() => setVisible(true)}
      >
        <FaUpload className="mx-2" /> {buttonLabel}({selectedFiles?.length})
      </button>

      {/* Modal */}
      <Modal
        Header={"File Manager"}
        visible={isVisible}
        setVisible={setVisible}
        modalWidth={"50%"}
      >
        <div className="p-3">
          {/* Custom styled drag-drop input */}
          <div
            className={`upload-box ${dragActive ? "drag-active" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => inputRef.current.click()}
          >
            {/* <input
              type="file"
              multiple={uploadSize === "multiple"}
              ref={inputRef}
              onChange={handleChange}
              className="hidden-input"
            />
             */}

            <input
              type="file"
              multiple={uploadSize === "multiple"}
              ref={inputRef}
              onChange={handleChange}
              className="hidden-input"
              accept={allowedTypes.join(",")}   
            />

            <FaUpload size={28} className="me-2 text-primary" />
            <span>
              <strong>Click to upload</strong> or drag & drop files here
            </span>
          </div>

          {/* Uploaded file list */}
          {selectedFiles.length === 0 ? (
            <p className="text-muted text-center mt-3">
              No files uploaded yet.
            </p>
          ) : (
            <div className="uploaded-file-list mt-3">
              {selectedFiles.map((file, index) => {
                const isImage = file.type.startsWith("image/");
                const fileSize = (file.size / 1024).toFixed(1); // in KB
                return (
                  <div
                    key={index}
                    className="file-item d-flex justify-content-between align-items-center"
                  >
                    <div className="d-flex align-items-center gap-2" style={{ gap: "4px" }}>
                      {isImage ? (
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="file-preview"
                        />
                      ) : (
                        <FaFileAlt className="text-secondary" size={22} />
                      )}
                      <div className="d-flex align-items-center" style={{ gap: "6px" }}>
                        <span className="file-name">{file.name}</span>
                        <small className="text-muted ms-2">{fileSize} KB</small>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-sm btn-light text-danger border-0"
                      onClick={() => handleRemoveFile(index)}
                    >
                      <FaTimes />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default FileUpload;
