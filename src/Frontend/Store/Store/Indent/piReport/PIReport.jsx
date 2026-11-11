// import React, { useState, useEffect } from "react";
// import Heading from "../../../../components/UI/Heading";
// import ReactSelect from "../../../../components/formComponent/ReactSelect";
// import { useTranslation } from "react-i18next";
// import DatePicker from "../../../../components/formComponent/DatePicker";
// import {
//     getBindCentreType,
//     getBindLocation,
// } from "../../../../utils/NetworkApi/commonApi";
// import MultiSelectComp from "../../../../components/formComponent/MultiSelectComp";
// // ADD THIS IMPORT
// import { axiosInstance } from "../../../../utils/axiosInstance" // Adjust path as needed
// import * as XLSX from "xlsx";
// import { toast } from "react-toastify";

// const PIReport = () => {
//     const { t } = useTranslation();
//     const [Centres, SetCentres] = useState([]);
//     const [Locations, SetLocations] = useState([]);

//     const [dropDownApis, setDropDownApis] = useState({
//         IndentTypeBind: [
//             { label: "SI", value: "0" },
//             { label: "PI", value: "1" },
//         ],

//     });

//     const [payload, setPayload] = useState({
//         CentreType: [],
//         Location: [],
//         FromDate: new Date(),
//         ToDate: new Date(),
//         Report: "",
//         IndentType: "", // This will hold either "SI" or "PI"
//     });

//     //  const handleSelectChange = (name, selectedOption) => {
//     //     setPayload((prev) => ({
//     //         ...prev,
//     //         [name]: selectedOption ? selectedOption.value : "", // Saves "SI" or "PI"
//     //     }));
//     // };

//     const handleSelectChange = (name, e) => {
//         console.log("selectedOption", e, "name", name);
//         setPayload((prev) => ({ ...prev, [name]: e.value }));
//     };

//     const handleMultiSelectChange = (name, value) => {
//         setPayload((prev) => ({
//             ...prev,
//             [name]: value || []
//         }));
//     };

//     const dateSelect = (date, name) => {
//         setPayload((prev) => ({
//             ...prev,
//             [name]: date,
//         }));
//     };
//   const getApiPayload = () => {
//         return {
//             fromDate: payload.FromDate?.toISOString(),
//             toDate: payload.ToDate?.toISOString(),
//             type: payload.IndentType || "", // Access .value from the object
//             reportType: "Excel",
//             // CentreType and Location are already arrays from MultiSelectComp
//             ch: payload.CentreType||"",
//             locationId: payload.Location||"",
//             indentNo: payload.IndentType?.value || "",
//         };
//     };

//     const downloadExcel = async () => {
//         try {
//             const apiPayload = getApiPayload();
            
//             console.log("API Payload:", apiPayload); // Debug log

//             const res = await axiosInstance.post(
//                 "StoreReports/IndentReport",
//                 apiPayload,
//                 {
//                     responseType: "blob"
//                 }
//             );

//             const url = window.URL.createObjectURL(
//                 new Blob([res.data])
//             );

//             const link = document.createElement("a");
//             link.href = url;
//             link.setAttribute("download", "IndentReport.xlsx");
//             document.body.appendChild(link);
//             link.click();
            
//             // Cleanup
//             document.body.removeChild(link);
//             window.URL.revokeObjectURL(url);

//         } catch (err) {
//             console.error("Download Error:", err);
//             // Add user-friendly error message
//             toast.error("Failed to download report. Please try again.");
//         }
//     };

//     useEffect(() => {
//         // Fetch Centre Types
//         getBindCentreType(SetCentres);

//         // FIXED: Pass empty strings for the 5 parameters required before the state setter
//         getBindLocation("", "", "", "", "", SetLocations);
//         setDropDownApis((prev) => ({
//             ...prev,
//             IndentTypeBind: [
//                 { label: "SI", value: "SI" },
//                 { label: "PI", value: "PI" },
//             ],
//         }));

//     }, []);

//     return (
//         <>
//             <div>
//                 <div className="card">
//                     <Heading name={"PI Report"} isBreadcrumb={true} />
//                     <div className="row px-2 py-2">
//                         <div className="col-sm-2">
//                             <MultiSelectComp
//                                 label="Centre Type"
//                                 options={Centres?.map((item) => ({
//                                     label: item.type,
//                                     value: item.id,
//                                 })) || []}
//                                 value={payload?.CentreType}
//                                 name="CentreType"
//                                 id="CentreType"
//                                 onChange={handleMultiSelectChange}
//                                 lable={t("Centre Type")}
//                             />
//                         </div>
//                         <div className="col-sm-2">
//                             <MultiSelectComp
//                                 label="Location"
//                                 options={Locations?.map((item) => ({
//                                     label: item.Location,
//                                     value: item.LocationID,
//                                 })) || []}
//                                 value={payload?.Location}
//                                 name="Location"
//                                 id="Location"
//                                 onChange={handleMultiSelectChange}
//                                 lable={t("Location")}
//                             />
//                         </div>
//                     </div>
//                 </div>

//                 <div className="card mt-2">
//                     <Heading title={t("Date")} />
//                     <div className="row px-2 py-2">
//                         <DatePicker
//                             name="FromDate"
//                             id="FromDate"
//                             value={payload?.FromDate}
//                             onChange={dateSelect}
//                             maxDate={new Date()}
//                             lable={t("From Date")}
//                             respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
//                         />
//                         <DatePicker
//                             name="ToDate"
//                             id="ToDate"
//                             value={payload?.ToDate}
//                             onChange={dateSelect}
//                             maxDate={new Date()}
//                             lable={t("TO Date")}
//                             respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
//                         />

//                         <div className="col-xl-2 col-sm-4 col-md-6 co-12">
//                             <ReactSelect
//                                 name="IndentType"
//                                 id="IndentType"
//                                 removeIsClearable={true}
//                                 placeholderName="Indent Type"
//                                 value={payload?.IndentType}
//                                 dynamicOptions={dropDownApis.IndentTypeBind}
//                                 onChange={handleSelectChange}
//                             />
//                         </div>




//                         <div className="col-sm-2 d-flex">
//                             <button className="btn btn-sm btn-success ml-2"
//                                 onClick={downloadExcel}>
//                                 {t("Get Report Excel")}
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </>
//     );
// };

// export default PIReport;





import React, { useState, useEffect } from "react";
import Heading from "../../../../components/UI/Heading";
import moment from "moment";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import { useTranslation } from "react-i18next";
import DatePicker from "../../../../components/formComponent/DatePicker";
import {
    getBindCentreType,
    getBindLocation,
} from "../../../../utils/NetworkApi/commonApi";
import MultiSelectComp from "../../../../components/formComponent/MultiSelectComp";
// import { axiosInstance } from "../../../../utils/axiosInstance";
import { axiosReport } from "../../../../utils/axiosInstance";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";

const PIReport = () => {
    const { t } = useTranslation();
    const [Centres, SetCentres] = useState([]);
    const [Locations, SetLocations] = useState([]);

    const [dropDownApis, setDropDownApis] = useState({
        IndentTypeBind: [
            { label: "SI", value: "SI" },
            { label: "PI", value: "PI" },
        ],
    });

    const [payload, setPayload] = useState({
        CentreType: [],
        Location: [],
        FromDate: new Date(),
        ToDate: new Date(),
        IndentType: "SI",
    });

    const handleSelectChange = (name, e) => {
        console.log("selectedOption", e, "name", name);
        setPayload((prev) => ({ ...prev, [name]: e.value }));
    };

    const handleMultiSelectChange = (name, value) => {
        setPayload((prev) => ({
            ...prev,
            [name]: value || []
        }));
    };

    const dateSelect = (date, name) => {
        setPayload((prev) => ({
            ...prev,
            [name]: date,
        }));
    };

    const getApiPayload = () => {
        // Format dates to YYYY-MM-DD string format
        const formatDate = (date) => {
            return moment(date).format("YYYY-MM-DD");
        };

        return {
            fromDate: formatDate(payload.FromDate),
            toDate: formatDate(payload.ToDate),
            type: payload.IndentType || "SI",
            reportType: "Excel",
            // Convert arrays to comma-separated strings or just first value
            // ch: Array.isArray(payload.CentreType) 
            //     ? payload.CentreType.map(item => item.value || item).join(",")
            //     : payload.CentreType || "",
            ch:"", // Keeping empty as per your requirement
            locationId: Array.isArray(payload.Location)
                ? payload.Location.map(item => item.value || item).join(",")
                : payload.Location || "",
            indentNo: "", // Keep empty as per your requirement
        };
    };

    // const downloadExcel = async () => {
    //     try {
    //         // Validation
    //         if (!payload.FromDate || !payload.ToDate) {
    //             toast.error("Please select both From Date and To Date");
    //             return;
    //         }

    //         if (payload.CentreType.length === 0) {
    //             toast.error("Please select at least one Centre Type");
    //             return;
    //         }

    //         if (payload.Location.length === 0) {
    //             toast.error("Please select at least one Location");
    //             return;
    //         }

    //         const apiPayload = getApiPayload();
            
    //         console.log("API Payload:", apiPayload); // Debug log

    //         const res = await axiosInstance.post(
    //             "/StoreReports/IndentReport", // Added leading slash
    //             apiPayload,
    //             {
    //                 responseType: "blob",
    //                 headers: {
    //                     'Content-Type': 'application/json',
    //                 }
    //             }
    //         );

    //         // Check if response is actually an error in JSON format
    //         const contentType = res.headers['content-type'];
    //         if (contentType && contentType.includes('application/json')) {
    //             const text = await res.data.text();
    //             const error = JSON.parse(text);
    //             throw new Error(error.message || "Failed to download report");
    //         }

    //         // Create download link
    //         const url = window.URL.createObjectURL(new Blob([res.data]));
    //         const link = document.createElement("a");
    //         link.href = url;
            
    //         // Generate filename with date
    //         const today = new Date().toISOString().split('T')[0];
    //         link.setAttribute("download", `IndentReport_${today}.xlsx`);
            
    //         document.body.appendChild(link);
    //         link.click();
            
    //         // Cleanup
    //         document.body.removeChild(link);
    //         window.URL.revokeObjectURL(url);
            
    //         toast.success("Report downloaded successfully!");

    //     } catch (err) {
    //         console.error("Download Error:", err);
            
    //         // Handle specific error cases
    //         if (err.response?.status === 404) {
    //             toast.error("Report endpoint not found. Please check the API URL.");
    //         } else if (err.response?.status === 400) {
    //             toast.error("Invalid request. Please check your selections.");
    //         } else if (err.response?.status === 500) {
    //             toast.error("Server error. Please try again later.");
    //         } else {
    //             toast.error(err.message || "Failed to download report. Please try again.");
    //         }
    //     }
    // };

    
      const downloadExcel = async () => {
          try {
            //   if (payload.CentreType.length === 0) {
            //       toast.error("Please select at least one Centre Type");
            //       return;
            //   }
  
            //   if (payload.Location.length === 0) {
            //       toast.error("Please select at least one Location");
            //       return;
            //   }
  
              const apiPayload = getApiPayload();
  
              const res = await axiosReport.post(
                  "/StoreReports/IndentReport",
                  apiPayload,
                  {
                      responseType: "blob",
                  }
              );
  
              // file download logic
              const url = window.URL.createObjectURL(new Blob([res.data]));
              const link = document.createElement("a");
              link.href = url;
              link.setAttribute("download", "IndentReport.xlsx");
              document.body.appendChild(link);
              link.click();
              link.remove();
              toast.success(res?.data?.message || "Excel downloaded successfully");
  
          } catch (err) {
              console.error(err);
            //   toast.error("Failed to download Excel");
            toast.error(err?.response?.data?.message || "No Record Found");
          }
      };
    useEffect(() => {
        // Fetch Centre Types
        getBindCentreType(SetCentres);
        // Fetch Locations
        getBindLocation("", "", "", "", "", SetLocations);
    }, []);

    return (
        <>
            <div>
                <div className="card">
                    <Heading name={"Indent Report"} isBreadcrumb={true} />
                    <div className="row px-2 py-2">
                        <div className="col-sm-2">
                            <MultiSelectComp
                                label="Centre Type"
                                options={Centres?.map((item) => ({
                                    label: item.type,
                                    value: item.id,
                                })) || []}
                                value={payload?.CentreType}
                                name="CentreType"
                                id="CentreType"
                                onChange={handleMultiSelectChange}
                                lable={t("Centre Type")}
                            />
                        </div>
                        <div className="col-sm-2">
                            <MultiSelectComp
                                label="Location"
                                options={Locations?.map((item) => ({
                                    label: item.Location,
                                    value: item.LocationID,
                                })) || []}
                                value={payload?.Location}
                                name="Location"
                                id="Location"
                                onChange={handleMultiSelectChange}
                                lable={t("Location")}
                            />
                        </div>
                    </div>
                </div>

                <div className="card mt-2">
                    <Heading title={t("Date")} />
                    <div className="row px-2 py-2">
                        <DatePicker
                            name="FromDate"
                            id="FromDate"
                            value={payload?.FromDate}
                            onChange={dateSelect}
                            maxDate={new Date()}
                            lable={t("From Date")}
                            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
                        />
                        <DatePicker
                            name="ToDate"
                            id="ToDate"
                            value={payload?.ToDate}
                            onChange={dateSelect}
                            maxDate={new Date()}
                            lable={t("TO Date")}
                            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
                        />

                        <div className="col-xl-2 col-sm-4 col-md-6 co-12">
                            <ReactSelect
                                name="IndentType"
                                id="IndentType"
                                removeIsClearable={true}
                                placeholderName="Indent Type"
                                value={payload?.IndentType}
                                dynamicOptions={dropDownApis.IndentTypeBind}
                                onChange={handleSelectChange}
                            />
                        </div>

                        <div className="col-sm-2 d-flex align-items-end">
                            <button 
                                className="btn btn-sm btn-success"
                                onClick={downloadExcel}
                            >
                                {t("Get Report Excel")}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PIReport;