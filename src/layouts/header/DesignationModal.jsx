// import React, { useEffect, useState, useRef } from "react";
// import { Dialog } from "primereact/dialog";
// import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
// import { useTranslation } from "react-i18next";
// import { getDesignationData } from "../../utils/NetworkApi/commonApi";
// import "./designationModal.css";
// import { AccessReport, Accounts, Administrator, B2B, Clientmaster, Fieldboy, Frontoffice, Manager, ReferredByDoctor, Sales, Technician, UAT } from "../../assets";
// import { axiosInstance } from "../../utils/axiosInstance";


// const DesignationModal = ({ show, setShow, designation, onSelectDesignation }) => {
//   const [t] = useTranslation();
//   const currentDesignationId = useLocalStorage("CurrentDesignation", "get");
//   const userData = useLocalStorage("userData", "get");
//   // const localData = useLocalStorage("userData", "get");
//   const isMobile = window.innerWidth > 768;
//   const theme = useLocalStorage("theme", "get");
//   // const [designation, setDesignation] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [activeIndex, setActiveIndex] = useState(0);
//   const [filteredDesignations, setFilteredDesignations] = useState([]);
//   const searchInputRef = useRef(null);

//   // const getDesignationData = () => {
//   //   axiosInstance
//   //     .get("Designation/getDesignationDataByEmployeeId")
//   //     .then((res) => {
//   //       if(res.data.success && Array.isArray(res?.data?.message)) {
//   //         let data = res.data.message;
//   //         setDesignation(data);
//   //       }
//   //     })
//   //     .catch((err) => console.log(err));
//   // };

//   useEffect(() => {
//     if (show) {
//       // getDesignationData();

//       setSearchTerm("");
//       setActiveIndex(0);
//     }
//   }, [show]);

//   useEffect(() => {
//     if (designation.length > 0) {
//       const filtered = designation.filter((item) => {
//         const matchesSearch = item?.DesignationName?.toLowerCase().includes(searchTerm.toLowerCase());
//         const isNotCurrent = String(item.DesignationID) != String(currentDesignationId)

//         return matchesSearch && isNotCurrent;
//       });
//       setFilteredDesignations(filtered);
//       setActiveIndex(0);
//     }
//   }, [searchTerm, designation, currentDesignationId]);

//   const handleSelectDesignation = (designationValue) => {
//     onSelectDesignation(designationValue);
//     setShow();
//   };

//   useEffect(() => {
//     setActiveIndex(0);
//   }, [searchTerm]);

//   const handleKeyDown = (e) => {
//     if (e.key === "ArrowRight") {
//       setActiveIndex((prev) => (prev + 1 < filteredDesignations.length ? prev + 1 : prev));
//     } else if (e.key === "ArrowLeft") {
//       setActiveIndex((prev) => (prev > 0 ? prev - 1 : prev));
//     } else if (e.key === "ArrowDown") {
//       setActiveIndex((prev) => (prev + 4 < filteredDesignations.length ? prev + 4 : prev));
//     } else if (e.key === "ArrowUp") {
//       setActiveIndex((prev) => (prev - 4 >= 0 ? prev - 4 : prev));
//     } else if (e.key === "Enter" && filteredDesignations.length > 0) {
//       handleSelectDesignation(filteredDesignations[activeIndex].DesignationID);
//     }
//   };

//   return (
//     <Dialog
//       // header={t(`Designation :: ${localData?.DesignationName}`)}
//       header={
//         <span>
//           <span style={{ color: '#ffffff', fontSize: 14 }}>Designation</span>
//           <span style={{ margin: '0 8px', color: '#ddd', fontSize: 15 }}>::</span>
//           <span style={{ fontWeight: 600 }}>{userData?.DesignationName ?? '—'}</span>
//         </span>
//       }
//       visible={show}
//       onHide={setShow}
//       draggable={false}
//       className={`${theme}`}
//       style={{ width: isMobile ? "60vw" : "100vw" }}
//       onShow={() => {
//         setTimeout(() => {
//           searchInputRef.current?.focus();
//         }, 100);
//       }}
//     >
//       <div className="designation-modal-content">
//         <div className="search-wrapper mb-2">
//           <input
//             ref={searchInputRef}
//             type="text"
//             className="search-input"
//             placeholder={t("Search designation...")}
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             onKeyDown={handleKeyDown}
//           />
//           <i className="pi pi-search search-icon"></i>
//         </div>

//         <div className="designation-grid">
//           {filteredDesignations.length > 0 ? (
//             filteredDesignations.map((item, index) => (
//               <div
//                 key={item?.DesignationID || index}
//                 className={`designation-card welcome_wrp ${activeIndex === index ? "active-focus" : ""
//                   }`}
//                 onClick={() => handleSelectDesignation(item.DesignationID)}
//                 onMouseEnter={() => setActiveIndex(index)}
//               >
//                 {item?.DesignationImagePath && (
//                   <div className="designation-icon">
//                     <img
//                       src={item?.DesignationImagePath}
//                       alt=""
//                       style={{ width: '30px', objectFit: 'contain' }}
//                     />
//                   </div>
//                 )}
//                 <div className="designation-label">{item?.DesignationName}</div>
//               </div>
//             ))
//           ) : (
//             <div className="no-results">
//               <i className="pi pi-search" style={{ fontSize: "3rem" }}></i>
//               <p className="mt-3">{t("No roles found")}</p>
//             </div>
//           )}
//         </div>

//         {searchTerm && filteredDesignations.length > 0 && (
//           <div className="hint-text mt-3">
//             <i className="pi pi-info-circle"></i> {t("Press Enter to select")}{" "}
//             <strong>{filteredDesignations[0]?.DesignationName}</strong>
//           </div>
//         )}
//       </div>
//     </Dialog>
//   );
// };

// export default DesignationModal;
import React, { useEffect, useState, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { useTranslation } from "react-i18next";
import "./designationModal.css";
import { axiosInstance } from "../../utils/axiosInstance";
import { DynamicIcon } from "../../utils/DynamicIcon";


const DESIGNATION_ICON_PALETTE = [
  "#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#a855f7",
  "#ec4899", "#06b6d4", "#f97316", "#84cc16", "#6366f1",
];

const getDesignationColor = (key) => {
  const str = String(key || "");
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return DESIGNATION_ICON_PALETTE[Math.abs(hash) % DESIGNATION_ICON_PALETTE.length];
};

const DesignationModal = ({ show, setShow, designation, onSelectDesignation }) => {
  const [t] = useTranslation();
  const currentDesignationId = useLocalStorage("CurrentDesignation", "get");
  const userData = useLocalStorage("userData", "get");
  const isMobile = window.innerWidth > 768;
  const theme = useLocalStorage("theme", "get");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [filteredDesignations, setFilteredDesignations] = useState([]);
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (show) {
      setSearchTerm("");
      setActiveIndex(0);
    }
  }, [show]);

  useEffect(() => {
    if (designation.length > 0) {
      const filtered = designation.filter((item) => {
        const matchesSearch = item?.DesignationName?.toLowerCase().includes(
          searchTerm.toLowerCase()
        );
        const isNotCurrent =
          String(item.DesignationID) != String(currentDesignationId);
        return matchesSearch && isNotCurrent;
      });
      setFilteredDesignations(filtered);
      setActiveIndex(0);
    }
  }, [searchTerm, designation, currentDesignationId]);

  const handleSelectDesignation = (designationValue) => {
    onSelectDesignation(designationValue);
    setShow();
  };

  useEffect(() => {
    setActiveIndex(0);
  }, [searchTerm]);

  const handleKeyDown = (e) => {
    if (e.key === "ArrowRight") {
      setActiveIndex((prev) =>
        prev + 1 < filteredDesignations.length ? prev + 1 : prev
      );
    } else if (e.key === "ArrowLeft") {
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === "ArrowDown") {
      setActiveIndex((prev) =>
        prev + 4 < filteredDesignations.length ? prev + 4 : prev
      );
    } else if (e.key === "ArrowUp") {
      setActiveIndex((prev) => (prev - 4 >= 0 ? prev - 4 : prev));
    } else if (e.key === "Enter" && filteredDesignations.length > 0) {
      handleSelectDesignation(filteredDesignations[activeIndex].DesignationID);
    }
  };

  return (
    <Dialog
      header={
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* ✅ Current user ka icon header mein */}
          {userData?.IconName && (
            <span
              style={{
                background: "rgba(255,255,255,0.15)",
                borderRadius: 6,
                padding: "3px 6px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <DynamicIcon
                name={userData.IconName}
                size={14}
                color="#ffffff"
              />
            </span>
          )}
          <span style={{ color: "#ffffff", fontSize: 14 }}>Designation</span>
          <span style={{ margin: "0 4px", color: "#aaa", fontSize: 15 }}>
            ::
          </span>
          <span style={{ fontWeight: 600 }}>
            {userData?.DesignationName ?? "—"}
          </span>
        </span>
      }
      visible={show}
      onHide={setShow}
      draggable={false}
      className={`${theme}`}
      style={{ width: isMobile ? "60vw" : "100vw" }}
      onShow={() => {
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 100);
      }}
    >
      <div className="designation-modal-content">
        <div className="search-wrapper mb-2">
          <input
            ref={searchInputRef}
            type="text"
            className="search-input"
            placeholder={t("Search designation...")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <i className="pi pi-search search-icon"></i>
        </div>

        <div className="designation-grid">
          {filteredDesignations.length > 0 ? (
            filteredDesignations.map((item, index) => (
              <div
                key={item?.DesignationID || index}
                className={`designation-card welcome_wrp ${activeIndex === index ? "active-focus" : ""
                  }`}
                onClick={() => handleSelectDesignation(item.DesignationID)}
                onMouseEnter={() => setActiveIndex(index)}
              >

                {item?.DesignationImagePath ? (
                  <div className="designation-icon">
                    <img
                      src={item?.DesignationImagePath}
                      alt=""
                      style={{ width: "30px", objectFit: "contain" }}
                    />
                  </div>
                ) : (
                  <div
                    className="designation-icon"
                    style={{
                      "--designation-icon-color": getDesignationColor(
                        item.DesignationID ?? item.DesignationName
                      ),
                    }}
                  >
                    <DynamicIcon
                      name={item.IconName}
                      size={20}
                      color={getDesignationColor(item.DesignationID ?? item.DesignationName)}
                    />
                  </div>
                )}

                <div className="designation-label">{item?.DesignationName}</div>
              </div>
            ))
          ) : (
            <div className="no-results">
              <i className="pi pi-search" style={{ fontSize: "3rem" }}></i>
              <p className="mt-3">{t("No roles found")}</p>
            </div>
          )}
        </div>

        {searchTerm && filteredDesignations.length > 0 && (
          <div className="hint-text mt-3">
            <i className="pi pi-info-circle"></i> {t("Press Enter to select")}{" "}
            <strong>{filteredDesignations[0]?.DesignationName}</strong>
          </div>
        )}
      </div>
    </Dialog>
  );
};

export default DesignationModal;