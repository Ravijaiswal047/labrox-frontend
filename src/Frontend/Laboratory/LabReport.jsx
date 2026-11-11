// import { useLocation } from "react-router-dom";

// const LabReport = () => {
//   const location = useLocation();
//   const queryParams = new URLSearchParams(location.search);
//   const testIDHashes = queryParams.get("TestIDHash");
//   const PHead = queryParams.get("PHead");
//   const testIDsArray = testIDHashes ? testIDHashes.split(",") : [];
//   console.log(testIDsArray);
//   console.log(PHead);
//   return <div></div>;
// };
// export default LabReport;

import { useEffect, useState } from "react";
import Loading from "../../components/loader/Loading";

const LabReport = () => {
  const [load, setLoad] = useState(true);

  useEffect(() => {
    const handleMessage = (event) => {
      const { TestIDHash, PHead } = event?.data;
      setLoad(false);
      console.log(TestIDHash, PHead);
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  return <div>{load && <Loading />}</div>;
};

export default LabReport;
