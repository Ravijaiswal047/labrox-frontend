import React, { useState } from "react";

const LiveImageEditor = () => {
  const [image, setImage] = useState(null);
  const [labels, setLabels] = useState([]);

  // Initialize 5 default labels
  const initializeLabels = () => {
    const newLabels = [];
    for (let i = 0; i < 5; i++) {
      newLabels.push({
        text: `Label ${i + 1}`,
        fontSize: 16,
        fontFamily: "Arial",
        left: 50,
        top: 50 + i * 40, // Stagger positions for visibility
        bold: false,
      });
    }
    setLabels(newLabels);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        setImage(img);
      };
    }
  };

  const updateLabel = (index, field, value) => {
    const updatedLabels = labels.map((label, i) =>
      i === index ? { ...label, [field]: value } : label,
    );
    setLabels(updatedLabels);
  };

  // Function to download the image with the labels
  const handleDownload = () => {
    if (!image || labels.length === 0) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // Set canvas size to match the image size (without margins)
    canvas.width = image.naturalWidth;

    // Calculate the maximum bottom position of the labels
    let maxLabelBottom = 0;
    labels.forEach((label) => {
      maxLabelBottom = Math.max(maxLabelBottom, label.top + label.fontSize);
    });

    // Set canvas height to match the image height plus the maximum label bottom position
    canvas.height = Math.max(image.naturalHeight, maxLabelBottom);

    // Draw the image on the canvas with no margins
    ctx.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight);

    // Draw labels on the canvas with exact positions
    labels.forEach((label) => {
      ctx.font = `${label.bold ? "bold" : ""} ${label.fontSize}px ${label.fontFamily}`;
      ctx.fillText(label.text, label.left, label.top);
    });

    // Convert canvas to data URL and create a download link
    const dataURL = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = "image-with-labels.png";
    link.click();
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Live Image Editor</h2>
      <input type="file" onChange={handleImageUpload} accept="image/*" />
      <button onClick={initializeLabels} style={{ margin: "10px 0" }}>
        Add 5 Labels
      </button>
      <div
        style={{
          position: "relative",
          //   width: "100%", // Take full width of the container
          //   height: "auto", // Keep the height auto-adjusted based on the image aspect ratio
          margin: "auto",
          //   overflow: "hidden",
          border: "1px solid #ccc",
        }}
      >
        {image && (
          <img
            src={image.src}
            alt="Uploaded"
            style={{
              width: `${image.naturalWidth}px`, // Keep the original width
              height: `${image.naturalHeight}px`, // Keep the original height
            }}
          />
        )}
        {labels.map((label, index) => (
          <div
            key={index}
            ref={(el) => {
              if (el) {
                el.style.setProperty(
                  "font-size",
                  `${label.fontSize}px`,
                  "important",
                );
              }
            }}
            style={{
              position: "absolute",
              left: `${label.left}px`,
              top: `${label.top}px`,
              fontFamily: label.fontFamily,
              fontWeight: label.bold ? "bold" : "normal",
              whiteSpace: "nowrap",
            }}
          >
            {label.text}
          </div>
        ))}
      </div>

      <button onClick={handleDownload} style={{ marginTop: "20px" }}>
        Download Image with Labels
      </button>

      {labels.length > 0 && (
        <table style={{ width: "100%", marginTop: "20px" }} border="1">
          <thead>
            <tr>
              <th>Label</th>
              <th>Font Size</th>
              <th>Font Family</th>
              <th>Left</th>
              <th>Top</th>
              <th>Bold</th>
            </tr>
          </thead>
          <tbody>
            {labels.map((label, index) => (
              <tr key={index}>
                <td>
                  <input
                    type="text"
                    value={label.text}
                    onChange={(e) => updateLabel(index, "text", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={label.fontSize}
                    onChange={(e) =>
                      updateLabel(index, "fontSize", parseInt(e.target.value))
                    }
                  />
                </td>
                <td>
                  <select
                    value={label.fontFamily}
                    onChange={(e) =>
                      updateLabel(index, "fontFamily", e.target.value)
                    }
                  >
                    <option value="Arial">Arial</option>
                    <option value="Courier New">Courier New</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Verdana">Verdana</option>
                  </select>
                </td>
                <td>
                  <input
                    type="number"
                    value={label.left}
                    onChange={(e) =>
                      updateLabel(index, "left", parseInt(e.target.value))
                    }
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={label.top}
                    onChange={(e) =>
                      updateLabel(index, "top", parseInt(e.target.value))
                    }
                  />
                </td>
                <td>
                  <input
                    type="checkbox"
                    checked={label.bold}
                    onChange={(e) =>
                      updateLabel(index, "bold", e.target.checked)
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default LiveImageEditor;
