import { useState } from "react";
import NextGenHeading from "./NextGenHeading";
import "./NextGenAccordion.css";

/**
 * NextGen replacement for components/UI/Accordion.jsx.
 */
export default function NextGenAccordion({
  title,
  children,
  defaultValue,
  isBreadcrumb,
  name,
  linkTo,
  linkTitle,
  onLinkClick,
  state,
  notOpen = false,
  className = "",
  seconTitle,
  backButton = false,
}) {
  const [isOpen, setIsOpen] = useState(defaultValue);

  const toggleAccordion = () => {
    if (!notOpen) setIsOpen((prev) => !prev);
  };

  return (
    <div className={`ng-accordion ${className}`}>
      <NextGenHeading
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
      <div className={`ng-accordion__body ${isOpen ? "is-open" : ""}`}>
        <div className="ng-accordion__inner">{children}</div>
      </div>
    </div>
  );
}
