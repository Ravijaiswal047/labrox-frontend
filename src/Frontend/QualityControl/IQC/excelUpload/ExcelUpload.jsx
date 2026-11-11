import { useRef, useState } from "react";
import Accordion from "../../../../components/UI/Accordion";
import { useTranslation } from "react-i18next";
import { ViewMenu } from "../../../../components/SvgIcons";
import Heading from "../../../../components/UI/Heading";
import QCFrameMenu from "../QCFrameMenu";
import { apiUrls } from "../../../../utils/apiUrls";
import { axiosInstance } from "../../../../utils/axiosInstance";
import { notify } from "../../../../utils/utils";
import { useDispatch } from "react-redux";
import { setLoading } from "../../../../store/reducers/loadingSlice/loadingSlice";
import { ExportToExcel } from "../../../../utils/helpers";
import { CustomButton } from "../../../../components/UI/CustomButton";
import * as XLSX from "xlsx";
import CustomTable from "../../../../components/Table/CustomTable";
import '../QcCommonCss.css';

const ExcelUpload = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [excelData, setExcelData] = useState([]);
  const [uploadedData, setUploadedData] = useState([]);
  const [showMore, setShowMore] = useState(false);
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  const columns = [
    { header: "Sr No", field: "SrNo" },
    { header: "Centre ID", field: "CentreId" },
    { header: "Control ID", field: "ControlID" },
    { header: "Control Name", field: "ControlName" },
    { header: "Parameter ID", field: "ParameterID" },
    { header: "Parameter Name", field: "ParameterName" },
    { header: "Level ID", field: "LevelID" },
    { header: "Reading", field: "Reading" },
    { header: "Entry Date Time", field: "EntryDateTime" },
    { header: "Machine Name", field: "MachineId" },
  ];

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  //handleUpload
  const handleUpload = () => {
    if (!file) {
      notify("Please select a file first", "warning");
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);

      const workbook = XLSX.read(data, { type: "array" });

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        defval: "",
      });

      const formattedData = jsonData.map((row, index) => ({
        SrNo: index + 1,
        ...row,
      }));

      setUploadedData(formattedData);

      notify("File uploaded successfully", "success");
    };

    reader.readAsArrayBuffer(file);   // ✅ Modern & correct
  };
  // handle Save
  const handleSave = async () => {
    if (!uploadedData || uploadedData.length === 0) {
      notify("No data available to save", "warning");
      return;
    }

    try {
      dispatch(setLoading(true));

      // ✅ Convert table data to API payload format
      const payload = uploadedData?.map((item) => ({
        controlID: item.ControlID || "",
        controlName: item.ControlName || "",
        labObservation_ID: item.ParameterID.toString() || "",
        labObservation_Name: item.ParameterName || "",
        levelID: item.LevelID.toString() || "",
        level: item.Level || "",   // make sure this column exists in Excel
        reading: item.Reading || "",
        dtEntry: item.EntryDateTime
          ? new Date(item.EntryDateTime).toISOString()
          : new Date().toISOString(),  // fallback
        machineID: item.MachineId || "",
      }));

      const res = await axiosInstance.post(
        apiUrls.SaveQcData,
        payload
      );

      if (res?.data?.success) {
        notify("QC Data saved successfully", "success");
        handleReset();  // Clear data after successful save
      } else {
        notify(res?.data?.message || "Failed to save data", "error");
      }
    } catch (error) {
      console.error("Save Error:", error);
      notify("Error saving QC data", "error");
    } finally {
      dispatch(setLoading(false));
    }
  };
  // handle Download
  const handleDownload = async () => {
    try {
      dispatch(setLoading(true));
      const res = await axiosInstance.get(apiUrls.DownloadFile);
      if (res?.data?.success && Array.isArray(res?.data?.message)) {
        const excelData = res?.data?.message.map((item, index) => ({
          SrNo: index + 1,
          CentreId: item.centreid,
          ControlID: item.ControlID,
          ControlName: item.ControlName,
          ParameterID: item.LabObservation_ID,
          ParameterName: item.LabObservation_Name,
          LevelID: item.LevelID,
          Reading: item.Reading,
          EntryDateTime: item.dtEntry || "", // flatten datetime
          MachineId: item.Machine_Id,
        }));

        setExcelData(excelData);
        ExportToExcel(
          excelData,
          `Report_${new Date().toISOString().split("T")[0]}.xlsx`
        );
        notify("Download successful", "success");
      } else {
        notify("Failed to fetch Excel data", "error");
      }
    } catch (err) {
      // console.error("Download error:", err);
      notify("Error downloading Excel", "error");
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleReset = () => {
    setFile(null);
    setExcelData([]);
    setUploadedData([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";  
    }
  };

  console.log("file", file);
  console.log("excelData", excelData);

  return (
    <> 
    {showMore && <QCFrameMenu />}
      <Heading
        name={t("Excel Upload")}
        defaultValue={true}
        isBreadcrumb={true}
        secondTitle={
          <>
            <label onClick={() => setShowMore((prev) => !prev)}>
              <ViewMenu />
            </label>
          </>
        }
      />
        <div className="row p-2 white-background">
          <div className="col-12">
            <CustomButton text="Download QC Entry File" icon="download" onClick={handleDownload} className="mr-2"/>
            <CustomButton text="Reset" icon="refresh" onClick={handleReset} className="mr-2"/>
          </div>
        </div>

        <Heading title={t("Upload File")}
        />
        <div className="row p-2 white-background">
          {/* File Input */}
          <div className="col-xl-3 col-sm-6 col-md-5 col-lg-4 col-12 ">
            <label className="mr-2">Select File</label>
            <input
              type="file"
              accept=".xlsx,.xls,.csv,.txt"
              onChange={handleFileChange}
              ref={fileInputRef}
            />
          </div>
          <CustomButton text="Upload" onClick={handleUpload} icon="upload" className="mx-2" />
          <CustomButton text="Save to Database" onClick={handleSave} icon="save" className="mx-2" />

        </div>
        {/* <div className="d-flex justify-content-end mb-3">
          
        </div> */}
        {uploadedData?.length > 0 && (
          <>
            <Heading title={t("Uploaded File Data")}

            />
            <div className="mb-2">
              <CustomTable
                columns={columns}
                data={uploadedData}
                tableHeight="table-height"
              />
            </div>
          </>

        )}
      {/* </Accordion> */}
    </>
  );
};

export default ExcelUpload;
