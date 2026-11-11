import React, { useState } from 'react';
import OtpInput from 'react-otp-input';
import './OTPInput.css';

export default function OTPInput({ numInputs = 6 }) {
  const [otp, setOtp] = useState('');
  console.log("OTP Input Rendered",otp);

  return (
    <OtpInput
      value={otp}
      onChange={setOtp}
      numInputs={numInputs}
      containerStyle="otp_container"
      inputStyle="otp_input"
      renderInput={(props) => <input {...props} />}
    />
  );
}