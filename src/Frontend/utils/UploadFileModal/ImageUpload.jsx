import React, { useEffect, useState } from "react";
import { FaTimes, FaPlusCircle } from "react-icons/fa"; // Importing FontAwesome icons

const ImageUpload = ({ payload, setPayload }) => {
  const [image, setImage] = useState(payload?.Image);
  const [isDragOver, setIsDragOver] = useState(false);

  // Handle file selection from file input
  //   console.log(image)
  useEffect(() => {
    setPayload({
      ...payload,
      Image: image,
    });
  }, [image]);
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle removing the uploaded image
  const handleRemoveImage = () => {
    setImage(null);
  };

  // Handle drag events
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      {!image ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            height: "144px",
            border: "2px dashed #cccccc",
            // backgroundColor: "#f0f0f0",
            // border: "1px solid #ccc",
            borderRadius: "5px",
            padding: "10px",
            cursor: "pointer",
            position: "relative",
            textAlign: "center",
            borderColor: isDragOver ? "#000" : "#ccc",
          }}
        >
          <input type="file" onChange={handleImageChange} accept={"image/*"} />
          <label>
            Drag and drop files here or click to upload <br />
            <span className="text-warning">
              ( {"jpg,jpeg,png and gif are allowed"})
            </span>
          </label>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "10px",
            position: "relative",
            height: "143px",
          }}
        >
          <img
            src={image}
            alt="Uploaded"
            style={{
              width: "200px",
              height: "140px",
              padding: "15px",
              borderRadius: "5px",
              position: "relative",
            }}
          />
          <button
            onClick={handleRemoveImage}
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              padding: "10px",
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              color: "#ff5c5c",
              border: "2px solid #ff5c5c",
              borderRadius: "50%",
              cursor: "pointer",
              fontSize: "18px",
              transition: "transform 0.2s, background-color 0.2s",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
            className="remove-icon"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ width: "20px", height: "20px" }}
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
