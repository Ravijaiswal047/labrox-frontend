import React from "react";
import OtpInput from "./OtpInput";

import "./Login.css";
const OtpModal = ({ credentials, setCredentials }) => {
  const handleOtpChange = (e) => {
    setCredentials({
      ...credentials,
      OTPLogin: e,
    });
  };

  return (
    <div>
      <div
        style={{
          background: "#fff",
          padding: "1px",
          borderRadius: "8px",
          width: "100%",
          maxWidth: "400px",
        }}
      >
        <div style={{ marginBottom: "15px" }}>
          <OtpInput
            length={4}
            value={credentials.OTPLogin}
            onChange={handleOtpChange}
            numInputs={4}
            separator={<span>-</span>}
            inputStyle={{
              width: "3rem",
              height: "3rem",
              margin: "0 0.5rem",
              fontSize: "1.5rem",
              textAlign: "center",
              borderRadius: "0.5rem",
              border: "2px solid #ccc",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default OtpModal;
