import React, { useState } from "react";
import "./Accordion.css"; // Import your CSS file for styling
import Heading from "./Heading";

const Accordion = ({
  title,
  children,
  defaultValue,
  isBreadcrumb,
  name,
  linkTo,
  linkTitle,
  onLinkClick,
  state,
  notOpen,
  className = "",
  seconTitle,
  backButton=false
}) => {
  const [isOpen, setIsOpen] = useState(defaultValue);

  const toggleAccordion = () => {
    if (!notOpen) setIsOpen(!isOpen);
  };

  return (
    <div
      className={`${className} card  patient_registration_card ${isOpen ? "open" : ""}`}
    >
      <Heading
        title={title}
        secondTitle={seconTitle}
        onClick={toggleAccordion}
        isBreadcrumb={isBreadcrumb}
        name={name}
        linkTo={linkTo}
        linkTitle={linkTitle}
        onLinkClick={onLinkClick}
        state={state}
        backButton={backButton}
      />
      <div className={`collapse ${isOpen ? "show" : ""}`}>{children} </div>
    </div>
  );
};

export default Accordion;
