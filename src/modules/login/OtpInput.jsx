import React, { useRef } from "react";
import "./OTPInput.css"; // Import your custom CSS here

const OtpInput = ({ length, onChange }) => {
  const inputsRef = useRef([]);

  const handleChange = (e, index) => {
    const { value } = e.target;

    if (!/^\d$/.test(value)) return;

    if (isNaN(value)) return; // Allow only numbers

    if (value.length === 1 && index < length - 1) {
      inputsRef.current[index + 1].focus(); // Move to the next input if current input is filled
    }

    const otp = inputsRef.current.map((input) => input.value).join("");
    onChange(otp); // Callback function to handle OTP change
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !inputsRef.current[index].value && index > 0) {
      inputsRef.current[index - 1].focus(); // Move to the previous input on backspace
    }
  };

  return (
    <div className="otp-container">
      {Array.from({ length }).map((_, index) => (
        <>
          <input
            key={index}
            type="text"
            maxLength="1"
            ref={(el) => (inputsRef.current[index] = el)}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className="otp-input"
          />
          {index < length - 1 && <span className="fw-bold">&#8212;</span>}
        </>
      ))}
    </div>
  );
};

export default OtpInput;
