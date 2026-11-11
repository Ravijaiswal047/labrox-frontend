import React, { useEffect, useState } from "react";

const AnimatedPage = ({ children }) => {
  const [animationClass, setAnimationClass] = useState("fade-slide-in");

  useEffect(() => {
    // Set class for entrance animation
    setAnimationClass("fade-slide-in");

    // Clean-up function to trigger exit animation
    return () => setAnimationClass("fade-slide-out");
  }, []);

  return <div className={animationClass}>{children}</div>;
};
export default AnimatedPage;
