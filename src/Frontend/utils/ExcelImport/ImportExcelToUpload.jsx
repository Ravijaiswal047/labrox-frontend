import React, { useState } from "react";
import { Button } from "react-bootstrap";
import { useLocalStorage } from "../../../utils/hooks/useLocalStorage";
import { Dialog } from "primereact/dialog";
import ExcelUploadModal from "./ExcelUploadModal";
import ExcelImportForDoctorShare from "./ExcelImportForDoctorShare";
import { CustomButton } from "../../../components/UI/CustomButton";

const ImportExcelToUpload = ({ doctorShare = false, RateData = [], DoctorData = [] }) => {
  const theme = useLocalStorage("theme", "get");

  const [openExcelUploadModal, setOpenExcelUploadModal] = useState(false);

  const handleOpenImportModal = (visible) => {
    setOpenExcelUploadModal(visible);
  };

  const onHideModal = () => {
    setOpenExcelUploadModal(false);
  };

  return (
    <>
      <div className="d-flex justify-content-end">
        {/* <Button
          onClick={() => handleOpenImportModal(true)}
          className="mx-2 rounded px-4"
        >
          <i class="bi bi-file-earmark-excel-fill mb-0 mr-2" color="white"></i>
          Import File
        </Button> */}
        <CustomButton
          onClick={() => handleOpenImportModal(true)}
          text={"Import File"}
          icon={"excel"}
        />
      </div>
      <Dialog
        header={`Import Excel to Upload`}
        visible={openExcelUploadModal}
        onHide={onHideModal}
        className={`${theme}`}
        style={{ width: "60vw" }}
        breakpoints={{ "98%": "59vw" }}
      >
        {doctorShare == true ? <ExcelImportForDoctorShare onClose={handleOpenImportModal} DoctorData={DoctorData} RateData={RateData} /> : <ExcelUploadModal onClose={handleOpenImportModal} />}
      </Dialog>
    </>
  );
};

export default ImportExcelToUpload;
