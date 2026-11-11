// import { Dialog } from "primereact/dialog";
// import React, { useEffect, useState } from "react";
// import Button from "react-bootstrap/Button";
// import Form from "react-bootstrap/Form";
// import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
// import { useTranslation } from "react-i18next";
// import { axiosInstance } from "../../utils/axiosInstance";
// import { useDispatch } from "react-redux";
// import { notify } from "../../utils/utils";
// import { setLoading } from "../../store/reducers/loadingSlice/loadingSlice";
// import RadioInput from "../../components/formComponent/RadioInput";

// const PaymentGatwayKitModal = () => {
//   const [t] = useTranslation();
//   const dispatch = useDispatch();
//   const isMobile = window.innerWidth > 768;
//   const theme = useLocalStorage("theme", "get");

//   const [show, setShow] = useState(false);
//   const [paymentConfigurationData, setPaymentConfigurationData] = useState([]);
//   const [isActive, setIsActive] = useState({});
//   const [selectedVendorIndex, setSelectedVendorIndex] = useState(null);

//   const GetCompanyPaymentConfigurations = async () => {
//     try {
//       const res = await axiosInstance.get(
//         "CompanyMaster/GetCompanyPaymentConfigurations"
//       );
//       setPaymentConfigurationData(res?.data?.message || []);
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   const handleActiveRadioCheck = (e) => {
//     const { name, value } = e?.target;
//     setIsActive((prev) => ({ ...prev, [name]: value }));
//   };

//   useEffect(() => {
//     GetCompanyPaymentConfigurations();
//   }, []);

//   const handleFieldChange = (fieldIndex, value) => {
//     const updated = [...paymentConfigurationData];
//     updated[selectedVendorIndex].fields[fieldIndex].value = value;
//     setPaymentConfigurationData(updated);
//   };

//   const selectedVendor = paymentConfigurationData[selectedVendorIndex];

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     dispatch(setLoading(true));

//     const payload = {};
//     const hdfcConfig = {};
//     selectedVendor.fields.forEach((f) => {
//       payload[f.name] = f.value;
//       if (selectedVendor?.vendor == "HDFC") {
//         hdfcConfig[f.name] = f.value;
//       }
//     });
//     payload["ID"] = selectedVendor?.id;
//     payload["Vendor"] = selectedVendor?.vendor;
//     payload["Vendor"] = selectedVendor?.vendor;
//     payload["KeyId"] = selectedVendor?.key_id;
//     payload["KeyId"] = selectedVendor?.key_id || "";
//     payload["KeySecret"] = selectedVendor?.key_secret || "";
//     payload["ConfigJson"] =
//       selectedVendor?.vendor == "HDFC" ? JSON.stringify(hdfcConfig) : "";

//     await axiosInstance
//       .post("CompanyMaster/UpdateCompanyPaymentConfigurations", payload)
//       .then((res) => {
//         if (!res?.data?.success) {
//           notify(res?.data?.message, "error");
//           return;
//         }
//         notify(res?.data?.message, "success");
//         GetCompanyPaymentConfigurations();
//       })
//       .catch((err) => {
//         console.log(err);
//       })
//       .finally(() => {
//         dispatch(setLoading(false));
//       });
//   };

//   console.log(isActive);

//   return (
//     <>
//       <Button onClick={() => setShow(true)} className="rounded">
//         Add Payment Gateway Kit
//       </Button>

//       <Dialog
//         header={t("Payment Gateway Kit")}
//         visible={show}
//         style={{ width: isMobile ? "50vw" : "90vw" }}
//         onHide={() => setShow(false)}
//         draggable={false}
//         className={theme}
//       >
//         {/* VENDOR SELECTION */}
//         <div className="mb-3">
//           <h1 className="fw-bold">Select Payment Vendor</h1>

//           <div className="d-flex align-items-start justify-content-between">
//             <div
//               style={{ gap: "8px" }}
//               className="d-flex align-items-center justify-content-start"
//             >
//               {paymentConfigurationData?.map((item, index) => (
//                 <div
//                   key={item.id}
//                   style={{ gap: "4px" }}
//                   className="d-flex align-items-center mb-2"
//                 >
//                   <input
//                     type="radio"
//                     id={`${item.vendor}-${index}`}
//                     name="vendorRadio"
//                     checked={selectedVendorIndex === index}
//                     onChange={() => setSelectedVendorIndex(index)}
//                     style={{ cursor: "pointer" }}
//                   />
//                   <label
//                     htmlFor={`${item.vendor}-${index}`}
//                     className="ms-2 mb-0"
//                     style={{ cursor: "pointer" }}
//                   >
//                     {item.vendor}
//                   </label>
//                 </div>
//               ))}
//             </div>
//             {selectedVendor?.vendor?.toLowerCase() == "hdfc" && (
//               <RadioInput
//                 type="checkbox"
//                 label={`IsActive`}
//                 id={`hdfc`}
//                 name={`hdfc`}
//                 value={isActive?.hdfc}
//                 onChange={handleActiveRadioCheck}
//               />
//             )}
//             {selectedVendor?.vendor?.toLowerCase() == "razorpay" && (
//               <RadioInput
//                 type="checkbox"
//                 label={`razorpay`}
//                 id={`razorpay`}
//                 name={`razorpay`}
//                 value={isActive?.razorpay}
//                 onChange={handleActiveRadioCheck}
//               />
//             )}
//           </div>
//         </div>

//         <hr />

//         {/* SHOW ONLY SELECTED VENDOR FIELDS */}
//         {selectedVendorIndex !== null && (
//           <Form className="px-2" onSubmit={handleSubmit}>
//             <h5 className="text-primary fw-bold mb-1">
//               {paymentConfigurationData[selectedVendorIndex].vendor}{" "}
//               Configuration
//             </h5>

//             {paymentConfigurationData[selectedVendorIndex].fields.map(
//               (field, fieldIndex) => (
//                 <Form.Group key={fieldIndex} className="mb-2">
//                   <Form.Label className="fw-semibold mb-0">
//                     {field.name}
//                   </Form.Label>
//                   <Form.Control
//                     type="text"
//                     value={field.value}
//                     onChange={(e) =>
//                       handleFieldChange(fieldIndex, e.target.value)
//                     }
//                     placeholder={`Enter ${field.name}`}
//                   />
//                 </Form.Group>
//               )
//             )}

//             <Button
//               type="submit"
//               variant="primary"
//               className="rounded mt-2 px-4"
//             >
//               Save Configuration
//             </Button>
//           </Form>
//         )}
//       </Dialog>
//     </>
//   );
// };

// export default PaymentGatwayKitModal;


import { Dialog } from "primereact/dialog";
import React, { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { useTranslation } from "react-i18next";
import { axiosInstance } from "../../utils/axiosInstance";
import { useDispatch } from "react-redux";
import { notify } from "../../utils/utils";
import { setLoading } from "../../store/reducers/loadingSlice/loadingSlice";
import RadioInput from "../../components/formComponent/RadioInput";

const PaymentGatwayKitModal = () => {
  const [t] = useTranslation();
  const dispatch = useDispatch();
  const isMobile = window.innerWidth > 768;
  const theme = useLocalStorage("theme", "get");

  const [show, setShow] = useState(false);
  const [paymentConfigurationData, setPaymentConfigurationData] = useState([]);
  const [selectedVendorIndex, setSelectedVendorIndex] = useState(null);

  const [isActive, setIsActive] = useState({}); // dynamic { hdfc: 1, razorpay: 0 }

  // Fetch vendor list
  const GetCompanyPaymentConfigurations = async () => {
    try {
      const res = await axiosInstance.get(
        "CompanyMaster/GetCompanyPaymentConfigurations"
      );
      if(res?.data?.success && Array.isArray(res?.data?.message)) {
        setPaymentConfigurationData(res?.data?.message || []);
      } 
    } catch (err) {
      console.log(err);
    }
  };

  // Build dynamic isActive object
  useEffect(() => {
    if (paymentConfigurationData.length > 0) {
      const activeObj = {};
      paymentConfigurationData.forEach((vendor) => {
        activeObj[vendor.vendor.toLowerCase()] =
          vendor?.active == 1 ? 1 : 0;
      });

      setIsActive(activeObj);
    }
  }, [paymentConfigurationData]);

  useEffect(() => {
    GetCompanyPaymentConfigurations();
  }, []);

  // Update field values
  const handleFieldChange = (fieldIndex, value) => {
    const updated = [...paymentConfigurationData];
    updated[selectedVendorIndex].fields[fieldIndex].value = value;
    setPaymentConfigurationData(updated);
  };

  // When checkbox is changed → convert to 0/1
  const handleActiveRadioCheck = (e) => {
    const { name, checked } = e.target;
    setIsActive((prev) => ({
      ...prev,
      [name]: checked ? 1 : 0,
    }));
  };

  const selectedVendor = paymentConfigurationData[selectedVendorIndex];

  // Submit final payload
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedVendor) return;

    dispatch(setLoading(true));

    const payload = {};
    const configJson = {};

    // Convert fields array → key:value
    selectedVendor.fields.forEach((f) => {
      payload[f.name] = f.value;
      configJson[f.name] = f.value;
    });

    // dynamic vendor key
    const vendorKey = selectedVendor.vendor.toLowerCase();

    // Common fields
    payload["ID"] = selectedVendor.id;
    payload["Vendor"] = selectedVendor.vendor;
    payload["IsActive"] = isActive[vendorKey] ?? 0;

    // Razorpay special fields
    payload["KeyId"] = selectedVendor.key_id || "";
    payload["KeySecret"] = selectedVendor.key_secret || "";

    // For HDFC → send ConfigJson
    payload["ConfigJson"] =
      selectedVendor.vendor.toLowerCase() === "hdfc"
        ? JSON.stringify(configJson)
        : "";

    await axiosInstance
      .post("CompanyMaster/UpdateCompanyPaymentConfigurations", payload)
      .then((res) => {
        if (!res?.data?.success) {
          notify(res?.data?.message, "error");
          return;
        }
        notify(res?.data?.message, "success");
        GetCompanyPaymentConfigurations();
      })
      .catch((err) => console.log(err))
      .finally(() => dispatch(setLoading(false)));
  };

  return (
    <>
      <Button onClick={() => setShow(true)} className="rounded">
        Add Payment Gateway Kit
      </Button>

      <Dialog
        header={t("Payment Gateway Kit")}
        visible={show}
        style={{ width: isMobile ? "50vw" : "90vw" }}
        onHide={() => setShow(false)}
        draggable={false}
        className={theme}
      >
        {/* Vendor selection */}
        <div className="mb-3">
          <h4 className="fw-bold mb-3">Select Payment Vendor</h4>

          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex" style={{ gap: "12px" }}>
              {paymentConfigurationData?.map((item, index) => (
                <div style={{gap:'4px'}} key={item.id} className="d-flex align-items-center">
                  <input
                    type="radio"
                    id={`${item.vendor}-${index}`}
                    name="vendorRadio"
                    checked={selectedVendorIndex === index}
                    onChange={() => setSelectedVendorIndex(index)}
                    style={{ cursor: "pointer" }}
                  />
                  <label
                    htmlFor={`${item.vendor}-${index}`}
                    className="ms-2 mb-0"
                    style={{ cursor: "pointer" }}
                  >
                    {item.vendor}
                  </label>
                </div>
              ))}
            </div>

            {/* Dynamic Checkbox */}
            {selectedVendor && (
              <RadioInput
                type="checkbox"
                label="Is Active"
                id={selectedVendor.vendor.toLowerCase()}
                name={selectedVendor.vendor.toLowerCase()}
                checked={
                  isActive[selectedVendor.vendor.toLowerCase()] === 1
                }
                onChange={handleActiveRadioCheck}
              />
            )}
          </div>
        </div>

        <hr />

        {/* Fields for selected vendor */}
        {selectedVendorIndex !== null && (
          <Form className="px-2" onSubmit={handleSubmit}>
            <h5 className="text-primary fw-bold mb-3">
              {selectedVendor.vendor} Configuration
            </h5>

            {selectedVendor.fields.map((field, fieldIndex) => (
              <Form.Group key={fieldIndex} className="mb-3">
                <Form.Label className="fw-semibold mb-1">
                  {field.name}
                </Form.Label>
                <Form.Control
                  type="text"
                  value={field.value}
                  onChange={(e) =>
                    handleFieldChange(fieldIndex, e.target.value)
                  }
                  placeholder={`Enter ${field.name}`}
                />
              </Form.Group>
            ))}

            <Button type="submit" variant="primary" className="rounded mt-3">
              Save Configuration
            </Button>
          </Form>
        )}
      </Dialog>
    </>
  );
};

export default PaymentGatwayKitModal;
