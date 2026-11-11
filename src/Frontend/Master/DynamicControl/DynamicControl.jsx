import React, { useState } from "react";
import Heading from "../../../components/UI/Heading";
import { Form, Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import FilterInput from "../../../components/Filter/FilterInput";
import "./DynamicControl.css";

const DynamicControl = () => {
  const [t] = useTranslation();
  const [payload, setPayload] = useState({
    controllerName: "",
    isActive: false,
  });
  const [controllerList, setControllerList] = useState([]);
  const [filter, setFilter] = useState("");
  const [filteredList, setFilteredList] = useState([]);

  const handleChangeInput = (e) => {
    const { name, value, type, checked } = e.target;
    setPayload((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleInsert = () => {
    if (!payload.controllerName.trim()) {
      alert("Please enter a controller name");
      return;
    }
    const newList = [
      ...controllerList,
      {
        id: Date.now(),
        controllerName: payload.controllerName,
        isActive: payload.isActive,
      },
    ];
    setControllerList(newList);
    setFilteredList(newList);
    setPayload({ controllerName: "", isActive: false });
  };

  const handleToggle = (id) => {
    const updated = controllerList.map((ctrl) =>
      ctrl.id === id ? { ...ctrl, isActive: !ctrl.isActive } : ctrl
    );
    setControllerList(updated);
    setFilteredList(updated);
  };

  const handleFilterChange = (e) => {
    const value = e?.target?.value || "";
    setFilter(value);
    if (!value.trim()) {
      setFilteredList(controllerList);
      return;
    }
    const filtered = controllerList.filter((item) =>
      item.controllerName.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredList(filtered);
  };

   const tableHeaders = [
    { header: "S.No", field: "SrNo", width: "3%" },
    { header: "CtrollerName", field: "VisitNo", width: "10%" },
    { header: "Date", field: "TransactionDate", width: "10%" },
    { header: "Patient Info", field: "PatientInfo", width: "20%" },
    { header: "Test", field: "Investigation", width: "20%" },
    { header: "Description", field: "Description", width: "20%" },
    { header: "Opening Balance", field: "OpeningBalance", width: "20%" },
    { header: "Test Charge", field: "Charges", width: "20%" },
    { header: "Received Amount.", field: "Deposite", width: "20%" },
    { header: "Net Balance", field: "netBalance", width: "20%" },
  ];

  const formattedTableData = filteredList?.map((tRow, idx)=>(
    {
        ...tRow,

    }
  ))

  return (
    <>
      <div className="card">
        <Heading title={"Dynamic Control"} />
        <div className="px-3 py-3">
          <div style={{ gap: "8px" }} className="row d-flex align-items-center">
            <Form.Group
              className="mb-3 col-sm-6 col-md-4 col-10"
              controlId="controllerName"
            >
              <Form.Control
                type="text"
                placeholder="Enter Controller Name"
                name="controllerName"
                value={payload.controllerName}
                onChange={handleChangeInput}
              />
            </Form.Group>
            <Form.Group className="mb-3 " controlId="isActive">
              <Form.Check
                type="switch"
                id="isActive"
                name="isActive"
                label={t("IsActive")}
                checked={payload.isActive}
                onChange={handleChangeInput}
                className="m-0"
              />
            </Form.Group>
            <div className=" mx-3">
              <Button
                variant="primary"
                onClick={handleInsert}
                style={{ width: "100%" }}
                className="rounded"
              >
                {t("Add")}
              </Button>
            </div>
          </div>
        </div>
        <Heading title={"Controller Collection"} />
        <div className="px-3 d-flex justify-content-end mt-2">
          <FilterInput value={filter} onChange={handleFilterChange} />
        </div>
        <div className="mb-3 mt-2 px-3 pb-3">
          {(filteredList.length === 0 ? controllerList : filteredList).length ===
          0 ? (
            <p className="text-muted">No controllers added yet.</p>
          ) : (<CustomTable columns={tableHeaders} data={formattedTableData} />
          )}
        </div>
      </div>
    </>
  );
};

export default DynamicControl;
