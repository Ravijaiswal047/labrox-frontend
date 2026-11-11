import React, { useEffect, useState } from "react";
import labroxLogo from "../../assets/image/labrox_logo.png";
import logoldpl from "../../assets/image/ldpl_logo.png";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
const Loading = () => {

  const [logo, setLogo] = useState(labroxLogo);
  const userData = useLocalStorage("userData", "get");

  useEffect(() => {
    if (userData?.ShowITDOSEFlashLogo === "0") {
      setLogo(logoldpl);
    }
  }, [userData]);
  // if (!loading) return null;
  // console.log(Changeclass);
  return (
    <div className="loading-overlay">
      {/* <img src={logo} alt="LabRox Logo" className="itdose-logo" /> */}
      <div className="loadingio-spinner-spinner-nq4q5u6dq7r">
        <div className="ldio-x2uulkbinbj">
          {[...Array(21)].map((_, index) => (
            <div key={index}></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Loading;
