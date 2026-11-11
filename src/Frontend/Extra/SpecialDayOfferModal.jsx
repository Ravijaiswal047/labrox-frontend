import React, { useState, useEffect } from "react";

const SpecialDayOfferModal = ({ title }) => {
  const [showModal, setShowModal] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowModal(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const closeModal = () => {
    setShowModal(false);
  };

  const modalStyle = {
    position: "fixed",
    zIndex: 1000,
    left: 0,
    top: 0,
    width: "100%",
    height: "100%",
    overflow: "auto",
    backgroundColor: "rgba(0,0,0,0.4)",
    display: showModal ? "block" : "none",
    animation: `${showModal ? "slideInUp" : "slideOutDown"} 0.5s ease`, // Dynamic animation
  };

  const modalContentStyle = {
    background:
      "linear-gradient(to right bottom, rgb(194, 233, 249), rgb(85 130 153))",
    margin: "15% auto",
    padding: "20px",
    border: "1px solid #888",
    width: "80%",
    borderRadius: "8px",
    boxShadow: "0 0 20px rgba(0,0,0,0.4)",
    textAlign: "center",
    position: "relative",
  };

  const closeButtonStyle = {
    color: "#aaa",
    position: "absolute",
    top: "10px",
    right: "10px",
    fontSize: "28px",
    fontWeight: "bold",
    cursor: "pointer",
  };

  const buttonStyle = {
    padding: "10px 20px",
    background: "#FFD700",
    border: "none",
    borderRadius: "5px",
    marginTop: "20px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
    color: "#333",
    transition: "background 0.3s ease",
    outline: "none",
    boxShadow: "0 0 10px rgba(0,0,0,0.3)",
  };

  return (
    <div className="modal" style={modalStyle}>
      <div className="modal-content" style={modalContentStyle}>
        <span style={closeButtonStyle} onClick={closeModal}>
          &times;
        </span>
        <h2 style={{ marginBottom: "20px", color: "#333" }}>
          Special Offer for {title}!
        </h2>
        <p style={{ fontSize: "18px", lineHeight: "1.6", color: "#555" }}>
          Get discounts today on various tests.
        </p>

        <button style={buttonStyle} onClick={closeModal}>
          Click For Booking
        </button>
      </div>
    </div>
  );
};

export default SpecialDayOfferModal;
