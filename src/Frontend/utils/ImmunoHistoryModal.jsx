import React, { useState } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { Dialog } from "primereact/dialog";
import { getTrimmedData } from "../../utils/helpers";
import { axiosInstance } from "../../utils/axiosInstance";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import Tables from "../../components/UI/customTable";
import ReactSelect from "../../components/formComponent/ReactSelect";
import ExportFile from "../../components/formComponent/ExportFile";
const ImmunoHistoryModal = ({ show, handleClose }) => {
  const isMobile = window.innerWidth <= 768;
  const [payload, setPayload] = useState({
    ImmunoType: "",
  });
  const [tableData, setTableData] = useState([]);
  const theme = useLocalStorage("theme", "get");
  const handleSelectChange = (label, value) => {
    if (value?.value) {
      setPayload({
        ImmunoType: value?.value,
      });
    }
  };
  const handleMake = () => {};
  return (
    <Dialog
      header="Immuno History"
      visible={show}
      className={theme}
      onHide={handleClose}
      style={{
        width: isMobile ? "80vw" : "50vw",
      }}
    >
      <div className="row">
        <div className="col-sm-6">
          <ReactSelect
            dynamicOptions={[]}
            name="ImmunoType"
            lable="Select Immuno Type"
            placeholderName="ImmunoType"
            className="required-fields"
            value={payload?.CentreID}
            onChange={handleSelectChange}
          />
        </div>
        <div className="col-sm-2">
          <button
            className="btn btn-block btn-success btn-sm"
            onClick={handleMake}
          >
            Make
          </button>
        </div>
        <div className="col-md-3">
          <ExportFile dataExcel={tableData} />
        </div>
      </div>
      <Tables>
        <thead className="text-center cf" style={{ zIndex: 99 }}>
          <tr>
            <th>S.No</th>
            <th>IHC Antibody</th>
            <th>Clone</th>
            <th>Type</th>
            <th>Staining Result</th>
            <th>Intensity</th>
            <th>Pattern</th>
            <th>Percentage</th>
          </tr>
        </thead>
        <tbody></tbody>
      </Tables>
      <div className="mt-2 mb-1">
        <div className="d-flex justify-content-center gap-2">
          <button className="btn btn-success btn-sm" onClick={handleMake}>
            Save
          </button>
          <button className="btn btn-success btn-sm mx-2" onClick={handleClose}>
            Close
          </button>
        </div>
      </div>
    </Dialog>
  );
};

export default ImmunoHistoryModal;
