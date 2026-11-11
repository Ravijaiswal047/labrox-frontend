// import { Dialog } from "primereact/dialog";
// import React, { useState } from "react";
// import { useTranslation } from "react-i18next";
// import { useLocalStorage } from "../../../utils/hooks/useLocalStorage";
// import Loading from "../../../components/loader/Loading";
// import { axiosInstance } from "../../../utils/axiosInstance";
// import { toast } from "react-toastify";
// import RadioInput from "../../../components/formComponent/DocShareRadioInput";
// import moment from "moment";

// const ViewProduct = ({ show, onHide }) => {
//   console.log(Data);
//   const theme = useLocalStorage("theme", "get");
//   const { t } = useTranslation();
//   const isMobile = window.innerWidth <= 768;
//   const [load, setLoad] = useState(false);
//   const handleModalClose = () => {
//     onHide(false);
//   };

//   const [toggle, setToggle] = useState({
//     mode: "client",
//   });

//   const handleSubmit = async () => {
//     const payload = {
//       travelPlanId: String(Data.TravelPlanId),
//       funnelId: String(Data.FunnelId),
//       isMeeting: String(Data.IsMeeting),
//       mom: String(Data.MOM),
//       remarks: String(Data.Remarks),
//       nextFollowup: String(Data.NextFollowUp),
//       travelDate: moment(Data.TravelDate).format("YYYY-MM-DD"),
//       dcrType: String(Data.DCRType),
//       dcrId: String(Data.DCRId),
//       competitor: String(Data.Competitor),
//       latLong: toggle.mode === "client" ? "1" : "0",
//     };
//     console.log(payload);
//     try {
//       setLoad(true);
//       await axiosInstance
//         .post("SalesFunnel/TravelDcrSubmit", payload)
//         .then((res) => {
//           if (res?.data?.success) {
//             toast.success(res?.data?.message);
//             setLoad(false);
//           } else {
//             toast.error(res?.data?.message);
//             setLoad(false);
//           }
//         });
//       handleModalClose();
//     } catch (error) {
//       console.log(error);
//     } finally {
//       setLoad(false);
//     }
//   };

//   return (
//     <>
//       <Dialog
//         header={t("Promoted Product")}
//         visible={show}
//         onHide={handleModalClose}
//         className={theme}
//         style={{ width: isMobile ? "95vw" : "40vw" }}
//         modal
//       >
//         <h2>Confirm your current location</h2>
//         <div className="row pt-2 pl-2 pr-3">
//           <div className="d-flex align-items-center mb-2 pl-2">
//             <RadioInput
//               inputType="radio"
//               className="mb-0"
//               label="Client Location"
//               id="client"
//               name="mode"
//               value="client"
//               checked={toggle.mode === "client"}
//               onChange={(e) =>
//                 setToggle((prev) => ({ ...prev, mode: e.target.value }))
//               }
//             />
//             <RadioInput
//               inputType="radio"
//               className="mb-0"
//               label="Other Location"
//               id="others"
//               name="mode"
//               value="others"
//               checked={toggle.mode === "others"}
//               onChange={(e) =>
//                 setToggle((prev) => ({ ...prev, mode: e.target.value }))
//               }
//             />
//           </div>
//         </div>
//         <p>Are you sure, you want to submit?</p>
//         <div className="d-flex col-sm-4 mt-2 mb-2">
//           {load ? (
//             <Loading />
//           ) : (
//             <button
//               onClick={handleSubmit}
//               className="btn btn-block btn-success btn-sm"
//             >
//               Save
//             </button>
//           )}
//           <button
//             onClick={handleModalClose}
//             className="btn btn-block btn-success btn-sm ml-2"
//           >
//             Cancel
//           </button>
//         </div>
//       </Dialog>
//     </>
//   );
// };

// export default ViewProduct;
