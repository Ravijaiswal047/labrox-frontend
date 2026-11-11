// import React from "react";
// import { useTranslation } from "react-i18next";
// import Accordion from "@app/components/UI/Accordion";
// import TestNameModal from "./TestNameModal";
// import ResultEntryTableCustom from "../Laboratory/ResultEntryTableCustom";

// const PackageSuggestion = ({
//   title,
//   data,
//   testData,
//   handleSuggestion,
//   handleViewTestDetails,
//   suggestionData,
//   setSuggestionData,
//   view,
// }) => {
//   const { t } = useTranslation();

//   const handleClose2 = () => {
//     setSuggestionData((ele) => ({
//       ...ele,
//       viewTestModal: false,
//     }));
//   };
//   return (
//     <>
//       {suggestionData?.viewTestModal && (
//         <TestNameModal
//           show={suggestionData?.viewTestModal}
//           onHandleShow={handleClose2}
//           id={suggestionData?.viewTestModalId}
//         />
//       )}
//       {data?.length > 0 && (
//         <Accordion title={t(title)} defaultValue={true}>
//           {view && (
//             <div
//               className="popup-body divResult boottable table-responsive"
//               style={{ padding: "4px", transition: "padding 0.3s ease" }}
//             >
//               <ResultEntryTableCustom>
//                 <thead>
//                   <tr>
//                     <th className="text-center" style={{ width: "38px" }}>
//                       {t("Select")}
//                     </th>
//                     <th className="text-center" style={{ width: "37px" }}>
//                       {t("View")}
//                     </th>
//                     <th className="text-center" style={{ width: "60px" }}>
//                       {t("Item Id")}
//                     </th>
//                     <th
//                       style={{
//                         wordWrap: "break-word",
//                         whiteSpace: "normal",
//                       }}
//                     >
//                       {t("Investigation Name")}
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {data.length > 0 &&
//                     data
//                       .filter(
//                         (item, index, self) =>
//                           index ===
//                           self.findIndex(
//                             (t) => t.InvestigationID === item.InvestigationID,
//                           ),
//                       )
//                       .map((ele) => {
//                         const check = testData.includes(ele.InvestigationID);
//                         return (
//                           <tr
//                             key={ele.id}
//                             style={{
//                               background: `${check ? "rgb(186, 202, 247)" : "inherit"}`,
//                               transition:
//                                 "background 0.3s ease, transform 0.3s ease",
//                             }}
//                             onMouseEnter={(e) => {
//                               e.currentTarget.style.transform = "scale(1.02)";
//                             }}
//                             onMouseLeave={(e) => {
//                               e.currentTarget.style.transform = "scale(1)";
//                             }}
//                           >
//                             <td data-title="Select" className="text-center">
//                               {ele?.PromotionalID &&
//                               ele?.PromotionalID != "0" &&
//                               ele?.Rate == null ? (
//                                 <i
//                                   className="fa fa-ban"
//                                   disabled={true}
//                                   style={{
//                                     cursor: "not-allowed",
//                                     opacity: 0.6,
//                                   }}
//                                 ></i>
//                               ) : (
//                                 <i
//                                   className="fa fa-plus-circle fa-sm"
//                                   onClick={() => handleSuggestion(ele, title)}
//                                 ></i>
//                               )}
//                             </td>
//                             <td data-title={t("View")} className="text-center">
//                               <i
//                                 className="fa fa-search"
//                                 onClick={() => {
//                                   handleViewTestDetails(ele?.InvestigationID);
//                                 }}
//                                 style={{
//                                   cursor: "pointer",
//                                   transition: "color 0.3s ease",
//                                 }}
//                                 onMouseEnter={(e) =>
//                                   (e.currentTarget.style.color = "#007bff")
//                                 }
//                                 onMouseLeave={(e) =>
//                                   (e.currentTarget.style.color = "black")
//                                 }
//                               />
//                             </td>
//                             <td
//                               data-title="InvestigationID"
//                               className="text-center"
//                             >
//                               {ele.InvestigationID}
//                             </td>
//                             <td
//                               data-title="TestName"
//                               style={{
//                                 wordWrap: "break-word",
//                                 whiteSpace: "normal",
//                               }}
//                             >
//                               {ele.TestName}
//                             </td>
//                           </tr>
//                         );
//                       })}
//                 </tbody>
//               </ResultEntryTableCustom>
//             </div>
//           )}
//           {/* </div> */}
//         </Accordion>
//       )}
//     </>
//   );
// };

// export default PackageSuggestion;


// import React from "react";
// import { useTranslation } from "react-i18next";
// import TestNameModal from "./TestNameModal";

// const PackageSuggestion = ({
//   title,
//   data,
//   testData,
//   handleSuggestion,
//   handleViewTestDetails,
//   suggestionData,
//   setSuggestionData,
//   view,
// }) => {
//   const { t } = useTranslation();

//   const handleClose2 = () => {
//     setSuggestionData((ele) => ({
//       ...ele,
//       viewTestModal: false,
//     }));
//   };

//   if (!view || !data?.length) return null;

//   return (
//     <>
//       {suggestionData?.viewTestModal && (
//         <TestNameModal
//           show={suggestionData?.viewTestModal}
//           onHandleShow={handleClose2}
//           id={suggestionData?.viewTestModalId}
//         />
//       )}

//       <div
//         style={{
//           margin: "0px 4px",
//           fontSize: "15px",
//           fontWeight: 600,
//           color: "#1f2937",
//         }}
//       >
//         {t(title)}
//       </div>

//       <div
//         style={{
//           background: "#f1f5f9",
//           borderRadius: "14px",
//           padding: "0px 0px 4px 0px",
//           display: "flex",
//           flexDirection: "column",
//           gap: "4px",
//         }}
//       >
//         {data
//           .filter(
//             (item, index, self) =>
//               index ===
//               self.findIndex(
//                 (t) => t.InvestigationID === item.InvestigationID
//               )
//           )
//           .map((ele) => {
//             const isSelected = testData.includes(
//               ele.InvestigationID
//             );

//             const isDisabled =
//               ele?.PromotionalID &&
//               ele?.PromotionalID !== "0" &&
//               ele?.Rate == null;

//             return (
//               <div
//                 key={ele.InvestigationID}
//                 style={{
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "space-between",
//                   padding: "8px 8px",
//                   borderRadius: "8px",
//                   background: isSelected
//                     ? "linear-gradient(135deg, #e0e7ff, #eef2ff)"
//                     : "#ffffff",
//                   border: isSelected
//                     ? "1px solid #c7d2fe"
//                     : "1px solid #e5e7eb",
//                   boxShadow:
//                     "0 8px 20px rgba(0,0,0,0.08)",
//                   transition: "all 0.25s ease",
//                 }}
//                 onMouseEnter={(e) => {
//                   e.currentTarget.style.transform =
//                     "translateY(-3px)";
//                 }}
//                 onMouseLeave={(e) => {
//                   e.currentTarget.style.transform =
//                     "translateY(0)";
//                 }}
//               >

//                 <div style={{ maxWidth: "60%" }}>
//                   <div
//                     style={{
//                       fontSize: "15px",
//                       fontWeight: 600,
//                       color: "#111827",
//                       lineHeight: 1,
//                     }}
//                   >
//                     {ele.TestName}
//                   </div>
//                   <div
//                     style={{
//                       fontSize: "12px",
//                       color: "#6b7280",
//                       marginTop: "4px",
//                     }}
//                   >
//                     Investigation ID: {ele.InvestigationID}
//                   </div>
//                 </div>

//                 <div
//                   style={{
//                     display: "flex",
//                     gap: "10px",
//                     alignItems: "center",
//                   }}
//                 >

//                   <button
//                     onClick={() =>
//                       handleViewTestDetails(
//                         ele?.InvestigationID
//                       )
//                     }
//                     style={{
//                       padding: "4px 14px",
//                       borderRadius: "4px",
//                       border: "1px solid #cbd5e1",
//                       background: "#ffffff",
//                       color: "#334155",
//                       fontSize: "13px",
//                       fontWeight: 500,
//                       cursor: "pointer",
//                       transition: "all 0.2s ease",
//                     }}
//                     onMouseEnter={(e) => {
//                       e.currentTarget.style.background =
//                         "#f1f5f9";
//                     }}
//                     onMouseLeave={(e) => {
//                       e.currentTarget.style.background =
//                         "#ffffff";
//                     }}
//                   >
//                     {t("View")}
//                   </button>

//                   <button
//                     disabled={isDisabled}
//                     onClick={() =>
//                       handleSuggestion(ele, title)
//                     }
//                     style={{
//                       padding: "6px 16px",
//                       borderRadius: "999px",
//                       border: "none",
//                       background: isDisabled
//                         ? "#e5e7eb"
//                         : isSelected
//                         ? "#16a34a"
//                         : "",
//                       color: "#ffffff",
//                       fontSize: "13px",
//                       fontWeight: 600,
//                       cursor: isDisabled
//                         ? "not-allowed"
//                         : "pointer",
//                       opacity: isDisabled ? 0.6 : 1,
//                       transition: "all 0.2s ease",
//                     }}
//                   >
//                     {isSelected
//                       ? t("Selected")
//                       : t("Select")}
//                   </button>
//                 </div>
//               </div>
//             );
//           })}
//       </div>
//     </>
//   );
// };

// export default PackageSuggestion;


import React from "react";
import { useTranslation } from "react-i18next";
import TestNameModal from "./TestNameModal";

const PackageSuggestion = ({
  title,
  data,
  testData,
  handleSuggestion,
  handleViewTestDetails,
  suggestionData,
  setSuggestionData,
  view,
}) => {
  const { t } = useTranslation();

  const handleClose2 = () => {
    setSuggestionData((prev) => ({
      ...prev,
      viewTestModal: false,
    }));
  };

  if (!view || !data?.length) return null;

  const uniqueData = data.filter(
    (item, index, self) =>
      index ===
      self.findIndex(
        (t) => t.InvestigationID === item.InvestigationID
      )
  );

  return (
    <>
      {suggestionData?.viewTestModal && (
        <TestNameModal
          show={suggestionData?.viewTestModal}
          onHandleShow={handleClose2}
          id={suggestionData?.viewTestModalId}
          dataType={title === "Suggestive Packages" ? "Package" : ""}
        />
      )}

      {/* Title */}
      <div
        style={{
          margin: "6px 4px",
          fontSize: "15px",
          fontWeight: 600,
          color: "#1f2937",
          borderBottom: title ? '1px solid #555555' : ""
        }}
      >
        {t(title)}
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "separate",
            borderSpacing: "0",
            background: "#ffffff",
            borderRadius: "10px",
            overflow: "hidden",
            border: "1px solid #e5e7eb",
          }}
        >
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              <th style={thStyle}>Test Code</th>
              <th style={thStyle}>Test Name</th>
              <th style={thStyle}>MRP</th>
              <th style={thStyle}>Rate</th>
              <th style={thStyle}>View</th>
              <th style={thStyle}>Action</th>
              {/* <th style={thStyle}></th> */}
            </tr>
          </thead>
          <tbody>
            {uniqueData.map((ele) => {
              const isSelected = testData.includes(
                ele.InvestigationID
              );

              const isDisabled =
                ele?.PromotionalID &&
                ele?.PromotionalID !== "0" &&
                ele?.Rate == null;

              return (
                <tr
                  key={ele.InvestigationID}
                  style={{
                    background: isSelected
                      ? "#ecfdf5"
                      : "#ffffff",
                    transition: "background 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected)
                      e.currentTarget.style.background =
                        "#f9fafb";
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected)
                      e.currentTarget.style.background =
                        "#ffffff";
                  }}
                >
                  <td className="px-3 pt-1" style={tdStyle}>
                    {ele?.TestCode}
                  </td>

                  <td style={{ ...tdStyle, fontWeight: 600 }}>
                    {ele.TestName}
                  </td>
                  <td className="px-2" style={{ ...tdStyle }}>
                    {ele?.mrp || "N/A"}
                  </td>
                  <td style={{ ...tdStyle }}>
                    {ele?.Rate?.toFixed(2) || ele?.rate || "N/A"}
                  </td>

                  <td className="py-1" style={tdStyle}>
                    <button
                      onClick={() =>
                        handleViewTestDetails(
                          ele?.InvestigationID
                        )
                      }
                      style={viewBtnStyle}
                    >
                      {t("View")}
                    </button>
                  </td>

                  <td className="py-1" style={tdStyle}>
                    <button
                      disabled={isDisabled}
                      onClick={() =>
                        handleSuggestion(ele, title)
                      }
                      style={{
                        ...selectBtnStyle,
                        background: isDisabled
                          ? "#e5e7eb"
                          : isSelected
                          ? "#16a34a"
                          : "",
                        cursor: isDisabled
                          ? "not-allowed"
                          : "pointer",
                        opacity: isDisabled ? 0.6 : 1,
                      }}
                    >
                      {isSelected
                        ? t("Selected")
                        : t("Select")}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default PackageSuggestion;

/* ---------------- styles ---------------- */

const thStyle = {
  padding: "8px 8px",
  fontSize: "13px",
  fontWeight: 600,
  color: "#374151",
  textAlign: "left",
  borderBottom: "1px solid #e5e7eb",
};

const tdStyle = {
  padding: "4px 8px",
  fontSize: "12px",
  color: "#111827",
  borderBottom: "1px solid #e5e7eb",
};

const viewBtnStyle = {
  padding: "2px 14px",
  fontSize: "13px",
  borderRadius: "6px",
  border: "1px solid #cbd5e1",
  background: "#ffffff",
  cursor: "pointer",
};

const selectBtnStyle = {
  padding: "3px 18px",
  fontSize: "13px",
  fontWeight: 500,
  borderRadius: "999px",
  border: "none",
  color: "#ffffff",
};
