import React, { useEffect, useState } from "react";
import CustomTable from "../../../../components/Table/CustomTable";
import { useTranslation } from "react-i18next";
import { Button } from "react-bootstrap";
import FilterInput from "../../../../components/Filter/FilterInput";
import { CustomButton } from "../../../../components/UI/CustomButton";

const MicroQualityControlModal = ({
  labData,
  handleCloseModal,
  handleAddParameters,
}) => {
  const { t } = useTranslation();
  const [tableData, setTableData] = useState([]);
  const [masterTableData, setMasterTableData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLabs, setSelectedLabs] = useState([]);

  const columns = [
    { header: "Sr.No", field: "srNo", width: "10%"},
    { header: t("Select"), field: "select", width: "10%"},
    { header: t("Parameter ID"), field: "labObservationId", width: "20%" },
    { header: t("Parameter Name"), field: "labObservationName" },
  ];

  const formattedData = tableData.map((item, index) => ({
    ...item,
    srNo: index + 1,
  }));

  useEffect(() => {
    if (labData && labData.length > 0) {
      const mappedData = labData.map((item) => ({
        labObservationId: item.value || item.DepartmentID,
        labObservationName: item.label || item.ParameterName,
        select: (
          <input
            type="checkbox"
            checked={selectedLabs.includes(item.value || item.DepartmentID)}
            onChange={() =>
              handleCheckboxChange(item.value || item.DepartmentID)
            }
          />
        ),
      }));

      setMasterTableData(mappedData);
      setTableData(mappedData);
    }
  }, [labData, selectedLabs]);

  const handleCheckboxChange = (labId) => {
    setSelectedLabs((prev) =>
      prev.includes(labId)
        ? prev.filter((id) => id !== labId)
        : [...prev, labId],
    );
  };

  const handleAddClick = () => {
    // Pass the selected lab IDs to the parent
    handleAddParameters(selectedLabs);
    handleCloseModal();
  };

  const handleChangeSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(e.target.value);

    const filtered = masterTableData.filter((row) =>
      Object.keys(row).some((key) =>
        String(row[key]).toLowerCase().includes(value),
      ),
    );

    setTableData(filtered);
  };
  console.log("selectedLabs", selectedLabs);

  return (
    <>
      <div className="row p-2">
        <div className="col-sm-12 d-flex justify-content-end">
          <FilterInput
            value={searchTerm}
            onChange={handleChangeSearch}
            placeholder="Filter Table"
          />
        </div>
      </div>

      <div className="row">
        <div className="col-sm-12">
          <CustomTable columns={columns} data={formattedData} />
        </div>
      </div>
      <div className="row">
        <div className="col-sm-12 d-flex justify-content-end">
          {/* <Button className="rounded py-0 ml-2 mt-2" onClick={handleAddClick}>
            Add Parameter
          </Button>
          <Button
            onClick={handleCloseModal}
            className="rounded py-0 ml-2 mt-2 bg-danger"
          >
            Close
          </Button> */}
          <CustomButton text="Add Parameter" onClick={handleAddClick} icon="add" className="mx-2"/>
          <CustomButton text="Close" onClick={handleCloseModal} icon="cancel" className="mx-2"/>
        </div>
      </div>
    </>
  );
};

export default MicroQualityControlModal;
