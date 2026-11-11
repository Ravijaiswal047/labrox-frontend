import React from "react";

const FlexContainer = ({ children }) => {
  // Function to count the number of child nodes inside a <p> element
  const getChildrenCount = (element) => {
    return React.Children.count(element.props.children);
  };

  // Conditionally apply styles based on the number of children inside each <p>
  const applyStyles = (child) => {
    const childrenInsideP = getChildrenCount(child);

    const paragraphStyle = {
      display: "flex",
      flexDirection: childrenInsideP > 1 ? "row-reverse" : "row", // row-reverse if multiple children inside <p>
      justifyContent: "space-between",
      alignItems: "center",
      gap: "10px",
    };

    return React.cloneElement(child, { style: paragraphStyle });
  };

  return (
    <div>{React.Children.map(children, (child) => applyStyles(child))}</div>
  );
};

export default FlexContainer;
