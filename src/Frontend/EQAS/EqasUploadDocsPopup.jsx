import React, { useEffect, useRef, useState } from "react";
import "./Eqas.css";
import MultiSelectComp from "../../components/formComponent/MultiSelectComp";
import { CustomButton } from "../../components/UI/CustomButton";
import Heading from "../../components/UI/Heading";
import CustomTable from "../../components/Table/CustomTable";
import { axiosInstance } from "../../utils/axiosInstance";
import { apiUrls } from "../../utils/apiUrls";
import { toast } from "react-toastify";
import { setLoading } from "../../store/reducers/loadingSlice/loadingSlice";
import { useDispatch } from "react-redux";

const EqasUploadDocsPopup = ({investigations,centerid=0,programid=0,month=0,year=0}) => {

    console.log("investigations",investigations);

    const initialPayload = {
        investigationID: "",
        file: null,
    };
  
    const [payload, setPayload] = useState(initialPayload);
    const [tableData, setTableData] = useState([]);
    const dispatch = useDispatch();
    const fileInputRef = useRef(null);

    const columns = [
        { header: "Sr No", field: "SrNo" },
        { header: "File Name", field: "fileName" },
        { header: "Original File Name", field: "originalFileName" },
        { header: "Entry Date", field: "entryDate" },
        { header: "Entry By", field: "entryBy" },
        { header: "Test", field: "test" },
        // { header: "Actions", field: "actions" },
    ]

    const handleSelectMultiChange = (name, value) => {
        setPayload((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setPayload((prev) => ({ ...prev, file: e.target.files[0] }));
    };

    const handleFileClick = ({ fileName }) => {
        if (!fileName) {
            toast.error("File not found");
            return;
        }

        const apiPayload = {
            key: fileName,
        };

        axiosInstance
            .post(apiUrls.GetFileUrl, apiPayload)
            .then((res) => {
                // Create file URL
                if (res?.data?.success && res?.data?.message) {
                    // 🔥 message contains full S3 signed URL
                    window.open(res.data.message, "_blank");
                } else {
                    toast.error("Unable to open file");
                }
            })
            .catch(() => {
                toast.error("Unable to open file");
            })
            .finally(()=>{

            });
    };

    const bindUploadedDocuments = () => {

        const investigationIdString = investigations
            ?.map(item => item.investigationid || item.value)
            .filter(Boolean)
            .join(",");

        dispatch(setLoading(true));

        const apiPayload = {
            
            programId: programid || 0,
            centreId: centerid || 0,
            entryMonth: month || 0,
            entryYear: year || 0,
            investigationIDs: investigationIdString || "",

        };

        axiosInstance
            .post(apiUrls.GetEQASDocumentData, apiPayload)
            .then((res) => {
                if (res?.data?.success) {
                    const formattedData = res.data.data.map((item, index) => ({
                        // 🔑 keep ID for delete
                        id: item.Id,

                        SrNo: index + 1,
                        fileName: (
                            <span
                                style={{ color: "#1677ff", cursor: "pointer", textDecoration: "none" }}
                                onClick={() =>
                                    handleFileClick({
                                        fileName: item.File,
                                    })
                                }
                            >
                                {item.OFileName}
                            </span>
                        ),
                        originalFileName: item.OFileName,    // shown in table
                        entryDate: item.dtEntry,
                        entryBy: item.CreatedByName,
                        test: item.InvestigationName,

                        // actions: "actions", 
                    }));

                    setTableData(formattedData);
                }
            })
            .catch((err) => {
                toast.error(err?.data?.message || "Submission failed");
                
            })
            .finally(() => {
                dispatch(setLoading(false));
            });

    }

    const handleUpload = () => {
        if (!payload.file) {
            toast.error("Please select a file to upload");
            return;
        }
        const investigationIdString = payload.investigationID.join(",");

        const investigationNameString = payload.investigationID
            .map((id) => {
                const match = investigations.find(
                    (item) => item.investigationid === id
                );
                return match ? match.InvestigationName : "";
            })
            .filter(Boolean)
            .join(",");
        console.log("investigationIdString",investigationIdString,investigationNameString)
        const formData = new FormData();

        formData.append("InvestigationIDs", investigationIdString || "");
        formData.append("InvestigationNames", investigationNameString || "");
        formData.append("ProgramID", Number(programid) || 0);
        formData.append("CentreID", Number(centerid) || 0);
        formData.append("EntryMonth", Number(month) || 0);
        formData.append("EntryYear", Number(year) || 0);

        // ✅ File (binary)
        if (payload?.file instanceof File) {
            formData.append("Document", payload.file);
        }

        console.log("formData", [...formData.entries()]);

        axiosInstance
            .post(apiUrls.SaveEQASDocument, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            })
            .then((res) => {
                console.log("res",res);
                if (res?.data?.success) {
                    toast.success(res?.data?.message || "Submitted successfully");
                    setPayload(initialPayload);
                    bindUploadedDocuments(); 
                }
                else{
                    toast.error(res?.data?.message || "Failed to Upload");
                }
            })
            .catch(() => {
                toast.error("Submission failed");
            })
            .finally(() => {
            });
    }

    const handleReset = () => {
        setPayload(initialPayload);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }

    useEffect(()=>{
        if(centerid){
            bindUploadedDocuments();
        }     
    },[centerid]);

    console.log("Payload:", payload);
    console.log("investigations",investigations)

  return (

      <>
          <div className="row my-2 px-2">
              <div className="col-sm-4 col-12">
                  <MultiSelectComp
                      name="investigationID"
                      className="required-fields"
                      placeholder=" "
                      label="Investigation"
                      id="Investigation"
                      onChange={handleSelectMultiChange}
                      options={investigations}
                      value={payload?.investigationID}
                  />
              </div>
              <div className="col-sm-3 col-12">
                  {/* <label className="mr-4">Select File</label> */}
                  <input
                      type="file"
                      accept=".xlsx,.xls,.csv,.txt,.doc,.pdf"
                      onChange={handleFileChange}
                      ref={fileInputRef}
                  />
              </div>
              <CustomButton text="Upload" className="mx-2" icon="upload" onClick={handleUpload} />
              <CustomButton text="reset" className="mx-2" icon="refresh" onClick={handleReset} />
          </div>

          <Heading title="Uploaded Documents" />
          
              <CustomTable columns={columns} data={tableData} />
         

      </>
    
  );
};

export default EqasUploadDocsPopup;

