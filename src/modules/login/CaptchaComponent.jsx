import React, { useState, useEffect } from "react";
import {
  loadCaptchaEnginge,
  LoadCanvasTemplate,
  validateCaptcha,
  LoadCanvasTemplateNoReload,
} from "react-simple-captcha";

const CaptchaComponent = () => {
  const [captchaInput, setCaptchaInput] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    loadCaptchaEnginge(6); // Load a 6-character captcha
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateCaptcha(captchaInput)) {
      alert("Captcha matched!");
      setErrorMessage(""); // Clear error on success
      setCaptchaInput(""); // Clear input
    } else {
      setErrorMessage("Captcha incorrect! Try again.");
    }
  };

  const handleRefreshCaptcha = () => {
    loadCaptchaEnginge(6); // Reload Captcha
    setCaptchaInput("");
    setErrorMessage("");
  };

  return (
    <div style={styles.container}>
      <div style={styles.captchaContainer}>
        <LoadCanvasTemplateNoReload />
        <div onClick={handleRefreshCaptcha} style={styles.refreshBtn}>
          <i className="bi bi-arrow-repeat m-0 text-icon-size"></i>
        </div>
      </div>
      <input
        type="text"
        placeholder="Enter Captcha"
        value={captchaInput}
        onChange={(e) => setCaptchaInput(e.target.value)}
        style={styles.input}
      />
      {errorMessage && <p style={styles.error}>{errorMessage}</p>}
      <button onClick={handleSubmit} style={styles.submitBtn}>
        Submit
      </button>
    </div>
  );
};

// Inline styles for better design
const styles = {
  container: {
    width: "300px",
    margin: "auto",
    padding: "20px",
    textAlign: "center",
    border: "1px solid #ddd",
    borderRadius: "8px",
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
  },
  title: {
    marginBottom: "10px",
    fontSize: "18px",
  },
  captchaContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
  },
  refreshBtn: {
    background: "none",
    border: "none",
    fontSize: "20px",
    cursor: "pointer",
  },
  input: {
    width: "100%",
    padding: "8px",
    marginTop: "10px",
    borderRadius: "4px",
    border: "1px solid #ccc",
  },
  submitBtn: {
    marginTop: "10px",
    padding: "8px 15px",
    border: "none",
    backgroundColor: "#007BFF",
    color: "white",
    borderRadius: "4px",
    cursor: "pointer",
  },
  error: {
    color: "red",
    fontSize: "12px",
    marginTop: "5px",
  },
};

export default CaptchaComponent;
