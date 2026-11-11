import React, { useEffect, useState } from "react";
import Accordion from "../../../../components/UI/Accordion";
import { useTranslation } from "react-i18next";
import Input from "../../../../components/formComponent/Input";
import DatePicker from "../../../../components/formComponent/DatePicker";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import { PlusIcon, ViewMenu } from "../../../../components/SvgIcons";
import Heading from "../../../../components/UI/Heading";
import CustomTable from "../../../../components/Table/CustomTable";
import { Button } from "react-bootstrap";
import ControlMasterSearchTable from "./ControlMasterSearchTable";
import QualityControlModel from "./QualityControlModel";
import Modal from "../../../../components/ModalComponent/Modal";
import QCFrameMenu from "../QCFrameMenu";
import { apiUrls } from "../../../../utils/apiUrls";
import { axiosInstance } from "../../../../utils/axiosInstance";
import { notify } from "../../../../utils/utils";
import { useDispatch } from "react-redux";
import { setLoading } from "../../../../store/reducers/loadingSlice/loadingSlice";
import ColorCodingSearch from "../../../../components/ModalComponent/ColorCodingSearch";
import { formatStandardDate, validateRequiredFields } from "../../../../utils/helpers";
import { toast } from "react-toastify";
import { CustomButton } from "../../../../components/UI/CustomButton";
import {Form } from "react-bootstrap";
import { Tooltip as ReactTooltip } from "react-tooltip";
import "./ControlMaster.css";

const ControlMaster = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const [labData, setLabData] = useState([]);

  const [payload, setPayload] = useState({
    ControlProvider: "",
    ControlName: "",
    LotNumber: "",
    StartDate: new Date(),
    LotExpiry: new Date(),
    Department: "",
    Machine: "",
    MachineID: "",
    DepartmentID: "",
    LabObservation: "",
  });

  const [selectAll, setSelectAll] = useState(false);
  const [childFunction, setChildFunction] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [masterTableData, setMasterTableData] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [editingControlId, setEditingControlId] = useState(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  // const [masterTableData, setMasterTableData] = useState([]);
  const [handleModelData, setHandleModelData] = useState({});
  const [modalData, setModalData] = useState({});
  const [showMore, setShowMore] = useState(false);
  const [errors, setErrors] = useState({});
  const [MinValue, setMinValue] = useState("");
    const [MaxValue, setMaxValue] = useState("");
    const [Unit, setUnit] = useState("");
    const [Temperature, setTemperature] = useState("");
    const [Method, setMethod] = useState("");

  const [dropdownlist, setDropdownlist] = useState({
    departmentList: [],
    machineList: [],
  });

  // const selectMachine = dropdownlist?.machineList?.find(item=>item?.value == payload?.Machine)

  const editableFields = [
    "minValue",
    "maxValue",
    "baseMeanValue",
    "baseSdValue",
    "baseCv",
    "labMeanValue",
    "labSdValue",
    "labCv",
    "unit",
    "temperature",
    "method",
  ];

  const numericFields = [
    "minValue",
    "maxValue",
    "labMeanValue",
    "labSdValue",
    "labCv",
  ];

  const handleRefresh = () => {
    setRefresh(prev => !prev);
    console.log("refreshed");
  };

  const deleteParameter = (clickedId, grouped) => {
    // if(formattedData?.length === 3){
    //   notify("Atleast One Lab Data is required to update !!");
    //   return;
    // }

    let observationKey = null;

    // STEP 1: find which LabObservation_Id contains the clicked id
    for (let key in grouped) {
      const found = grouped[key].find(item => item.id === clickedId);
      if (found) {
        observationKey = key;  // this is LabObservation_Id
        break;
      }
    }

    if (!observationKey) {
      console.log("LabObservation_Id not found for clicked ID");
      return;
    }

    console.log("Found LabObservation_Id:", observationKey);

    // STEP 2: extract all ids belonging to this LabObservation_Id
    const allIds = grouped[observationKey].map(item => item.id);

    // STEP 3: convert to comma-separated string
    const idString = allIds.join(",");

    console.log("Final IDs to delete:", idString);
    handleDeleteParameter(idString, observationKey);
  }

  const handleDeleteParameter = async (deleteId, labID) => {
    console.log("lab id", labID);

    try {
      dispatch(setLoading(true));
      const payload = { id: deleteId };

      const res = await axiosInstance.post(apiUrls.DeleteParameter, payload);
      if (res?.data?.success) {
        setTableData(prev =>
          prev.filter(row => row?.labObservationId !== labID.toString())
        );
        notify(res?.data?.message, "success");
      }
      // handleReset();
    } catch (err) {
      notify(
        err?.response?.data?.message || "Failed to delete Parameter",
        "error",
      );
    } finally {
      dispatch(setLoading(false));
    }
  };

  const populateTableFromAPI = async (controlId) => {
    if (!controlId) return;
    // console.log(controlId, "controlId.........");
    setTableData([]);
    setIsEditMode(true);
    setEditingControlId(controlId);

    dispatch(setLoading(true));

    axiosInstance
      .post(apiUrls.GetControlParameterDetail, { controlId })
      .then((res) => {
        const data = res?.data?.message || [];

        if (!data.length) {
          setTableData([]);
          notify("Data not found", "warning"); // ✅ notify if no data
          return;
        }
        if (res?.data?.message) {
          console.log("Res", res);
          // setPayload((prev) => ({
          //   ...prev,
          //   LabObservation: data[0].LabObservation_Name, 
          // }));
          const newTableData = [];

          // Group data by LabObservation_Id, so we can create rows per level
          const grouped = data.reduce((acc, item) => {
            if (!acc[item.LabObservation_Id]) acc[item.LabObservation_Id] = [];
            acc[item.LabObservation_Id].push(item);
            return acc;
          }, {});

          console.log("grouped", grouped);

          Object.values(grouped).forEach((levels) => {
            levels.forEach((lvl, idx) => {
              newTableData.push({
                id: lvl.id,
                srNo: newTableData.length + 1,
                labObservationId: lvl.LabObservation_Id,
                labObservationName: lvl.LabObservation_Name,
                level: lvl.Level,
                enabled: true,
                rowId: lvl.LevelID.toString(),
                rowColor: "#ffe58f",
                minValue: lvl.MinValue,
                maxValue: lvl.MaxValue,
                baseMeanValue: lvl.BaseMeanvalue,
                baseSdValue: lvl.BaseSDvalue,
                baseCv: lvl.BaseCVPercentage,
                labMeanValue: lvl.LabMeanvalue,
                labSdValue: lvl.LabSDvalue,
                labCv: lvl.LabCVPercentage,
                unit: lvl.Unit,
                temperature: lvl.Temperature,
                method: lvl.Method,
                hash1: (
                  <input
                    type="checkbox"
                    checked={true}
                    onChange={() =>
                      handleRowCheckboxChange(newTableData.length)
                    }
                  />
                ),
                hash2:
                  idx === 0 ? (
                    <span
                      style={{ cursor: "pointer", color: "red" }}
                      onClick={() => deleteParameter(lvl.id, grouped)}
                    >
                      ❌
                    </span>
                  ) : (
                    ""
                  ),
              });
            });
          });
          // setMasterTableData(newTableData);
          setTableData(newTableData);
          console.log("newTableData", newTableData);
        }

        console.log("data", data);
      })
      .catch((err) => {
        notify(err?.data?.message, "error");
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  };

  const buildApiPayload = (payload, tableData, controlID = null) => {
    return {
      controlID: controlID || "",
      controlProvider: payload.ControlProvider || "",
      controlName: payload.ControlName || "",
      lotNumber: payload.LotNumber || "",
      dateStart: formatStandardDate(payload.StartDate),
      lotExpiry: formatStandardDate(payload.LotExpiry),
      controlData: tableData
        ?.filter(row => row.enabled === true)
        ?.map((row) => ({
          machineName: payload.MachineID || "",
          machineID: String(payload.Machine) || "",
          subcategoryName: String(payload.DepartmentID || ""),
          subcategoryid: String(payload.Department) || "",
          labObservation_ID: row?.labObservationId.toString() || "",
          labObservation_Name: row.labObservationName || "",
          levelID: row.rowId || "",
          level: row.level || "",
          minValue: row.minValue || "",
          maxValue: row.maxValue || "",
          baseMeanValue: row.baseMeanValue || "",
          baseSDValue: row.baseSdValue || "",
          baseCVPercent: row.baseCv || "",
          labMeanValue: row.labMeanValue || "",
          labSDValue: row.labSdValue || "",
          labCVPercent: row.labCv || "",
          unit: row.unit || "",
          temperature: row.temperature || "",
          method: row.method || "",
          controlID: controlID || "", // include only for Update
        })),
    };
  };

  const handleAddParameters = (selectedLabIds) => {
    selectedLabIds.forEach((labId) => {
      const lab = labData?.labList?.find((item) => item.value === labId);
      if (lab) {
        addLabObservationRows(lab.label);
      }
    });
  };

  const handleEdit = (rowData) => {
    console.log(rowData, "edit data....");
    setPayload((prev) => ({
      ...prev,
      ControlProvider: rowData.ControlProvider || "",
      ControlName: rowData.controlname || "",
      LotNumber: rowData.lotnumber || "",
      StartDate: rowData.startdate ? new Date(rowData.startdate) : null,
      LotExpiry: rowData.LotExpiry ? new Date(rowData.LotExpiry) : null,
      Department: Number(rowData.SubCategoryID || 0),
      DepartmentID: rowData.SubCategoryName || "",
      Machine: Number(rowData.Machineid || 0),
      MachineID: rowData.machinename || "", // ✅ from API
    }));
    getAllLabIds(rowData.Machineid);
    populateTableFromAPI(rowData.controlid);
  };

  // Add Lab rows
  const addLabObservationRows = (labName) => {

    const selectedLab = labData?.labList?.find(
      (lab) => lab.label === labName || lab.ParameterName === labName,
    );

    if (!selectedLab) {
      notify("No matching lab found", "warn");
      // console.warn("No matching lab found for:", labName);
      return;
    }

    const labId = selectedLab.value;
    console.log("labID", labId);
    console.log("tableData", tableData);
    const labLabel = selectedLab.label;
    //   const alreadyExists = tableData.some(
    //   (row) => row?.labObservationId == labId
    // );

    const existingRows = tableData.filter((row) => row?.labObservationId == labId);

    // if (alreadyExists) {
    //   notify("This lab observation is already added!", "warn");
    //   return;
    // }
    const levels = ["Level 1", "Level 2", "Level 3"];

    if (existingRows.length === 0) {
      console.log("new rows");
      const newRows = levels.map((level, idx) => ({
        srNo: tableData.length + idx + 1,
        labObservationId: labId,
        labObservationName: labLabel,
        level,
        enabled: false,
        rowId: (idx + 1).toString(),
        rowColor: "#b9a7e8",
        hash1: (
          <input
            type="checkbox"
            checked={level.enabled}
            onChange={(e) =>
              setTableData((prev) =>
                prev.map((row) =>
                  row.rowId === rowId ? { ...row, enabled: !row.enabled } : row,
                ),
              )
            }
          />
        ),
        minValue: "",
        maxValue: "",
        baseMeanValue: "",
        baseSdValue: "",
        baseCv: "",
        labMeanValue: "",
        labSdValue: "",
        labCv: "",
        unit: "",
        temperature: "",
        method: "",
        hash2:
          idx === 0 ? (
            <span
              style={{ cursor: "pointer", color: "red" }}
              onClick={() => removeLabRows(labId)}
            >
              ❌
            </span>
          ) : (
            ""
          ),

      }));

      setTableData((prev) => [...prev, ...newRows]);     // ⭐ NEW
      return;                                            // ⭐ IMPORTANT
    }
    const existingLevels = existingRows.map((row) => row?.level);
    const missingLevels = levels.filter(                // ⭐ NEW
      (lvl) => !existingLevels.includes(lvl)
    );
    if (missingLevels.length === 0) {
      console.log("no missing levels");                     // ⭐ NEW
      notify("All 3 levels already exist for this Lab!", "warn");
      return;
    }
    console.log("missing levels");
    const newRows = missingLevels.map((level, idx) => ({    // ⭐ NEW
      srNo: tableData.length + idx + 1,
      labObservationId: labId,
      labObservationName: labLabel,
      level,
      enabled: false,
      rowId: (levels.indexOf(level) + 1).toString(),    // ⭐ IMPORTANT (correct rowId)
      rowColor: "#b9a7e8",
      minValue: "",
      maxValue: "",
      baseMeanValue: "",
      baseSdValue: "",
      baseCv: "",
      labMeanValue: "",
      labSdValue: "",
      labCv: "",
      unit: "",
      temperature: "",
      method: "",
      hash1: <input type="checkbox" />,
      hash2: "",
    }));

    setTableData((prev) => [...prev, ...newRows]);
  };
  console.log("tableData", tableData);
  console.log("labData", labData);

  const removeLabRows = (labId) => {
    setTableData((prev) =>
      prev.filter((row) => row.labObservationId !== labId),
    );
    // console.log("id")
  };

  const handleReset = () => {
    setPayload({
      ControlProvider: "",
      ControlName: "",
      LotNumber: "",
      StartDate: new Date(),
      LotExpiry: new Date(),
      Department: "",
      Machine: "",
      MachineID: "",
      DepartmentID: "",
      LabObservation: "",
    });
    setTableData([]);
    setIsEditMode(false);
    setEditingControlId(null);
    setErrors({});
    setLabData([]);
    setRefresh(false);
    setMinValue("");
    setMaxValue("");
    setUnit("");
    setTemperature("");
    setMethod("");
    setSelectAll(false);
    // console.log("refresh",refresh);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPayload((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? "1" : "0") : value,
    }));
  };

  const dateSelect = (date, name) => {
    setPayload((prev) => ({
      ...prev,
      [name]: date,
    }));
  };

  const handleSelectChange = (name, option) => {
    console.log("Machine:::", option);
    if (!option) return;

    if (name === "Department") {
      setPayload((prev) => ({
        ...prev,
        Department: option.value, // store name
        DepartmentID: option.label, // store id
      }));
    }
    if (name === "Machine") {
      setPayload((prev) => ({
        ...prev,
        Machine: option.value, // store name
        MachineID: option.label, // store id
      }));

      getAllLabIds(option.value);
    }
  };

  const getResponsiveModalWidth = () => {
    const width = window.innerWidth;

    if (width <= 992) {
      // Mobile + Tablet
      return "80vw";
    }

    // Desktop
    return "60vw";
  };

  const handleSaveControlData = async () => {
    const requiredFields = [
      "ControlProvider",
      "ControlName",
      "LotNumber",
      "StartDate",
      "LotExpiry",
      "Machine",
      "Department"
    ];
    const errors = validateRequiredFields(payload, requiredFields);
    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      return;
    }
    const isValidLevel = tableData.some((row) => row.minValue && row.maxValue);
    if (!isValidLevel) {
      notify("At least one level must have both minValue and maxValue filled.", "warn");
      return;
    }
    // console.log("Data saved");
    const finalPayload = buildApiPayload(payload, tableData);
    console.log("finalPayload", finalPayload);
    dispatch(setLoading(true));
    handleRefresh();
    // console.log("refreshed before");
    await axiosInstance
      .post(apiUrls.SaveControlData, finalPayload)
      .then((res) => {
        console.log("res", res);
        if (res?.data?.success) {
          notify("Control saved successfully", "success");
        }
        else {
          notify(res?.data?.message, "warn");
        }
      })
      .catch((err) => {
        notify(err?.data?.message, "error");
      })
      .finally(() => {
        // console.log("refreshed after");
        handleRefresh();
        handleReset();
        dispatch(setLoading(false));
      });
  };

  const handleUpdateControlData = async () => {
    if (!editingControlId) return;

    const requiredFields = [
      "ControlProvider",
      "ControlName",
      "LotNumber",
      "StartDate",
      "LotExpiry",
      "Department",
    ];
    const errors = validateRequiredFields(payload, requiredFields);
    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      return;
    }

    if (tableData.length === 0) {
      notify("Please add at least one parameter before updating.", "warn");
      return;
    }

    const isValidLevel = tableData.some((row) => row.minValue && row.maxValue);

    if (!isValidLevel) {
      // Show a warning that at least one level needs minValue and maxValue filled
      notify("At least one level must have both minValue and maxValue filled.", "warn");
      return; // Prevent updating if validation fails
    }

    const finalPayload = buildApiPayload(payload, tableData, editingControlId);

    dispatch(setLoading(true));
    handleRefresh();
    try {
      await axiosInstance.post(apiUrls.UpdateControlData, finalPayload);
      notify("Control updated successfully", "success");
    } catch (err) {
      notify(err?.data?.message, "error");
    } finally {
      handleRefresh();
      handleReset();
      dispatch(setLoading(false));
    }
  };

  const handleSelectAll = (e) => {
    const checked = e.target.checked;
    setSelectAll(checked);

    setTableData((prev) => prev.map((row) => ({ ...row, enabled: checked })));
  };
  console.log("selectAll", selectAll);
  const colorCodingData = [
    { color: "#b9a7e8", id: "7", labelKey: "New Data" },
    { color: "#ffe58f", id: "15", labelKey: "Saved Data" },
  ];

  const handleHeaderChange = (field, value) => {
  if (field === "minValue"){
    setMinValue(value);
  } else if (field === "maxValue"){
    setMaxValue(value);
  }
    else if (field === "unit"){
      setUnit(value);
    }
    else if (field === "temperature"){
      setTemperature(value);

    } else if (field === "method"){
      setMethod(value);
    }

  setTableData((prevData) =>
    prevData.map((row) => {
      // 🚫 Skip disabled rows
      if (!row.enabled) return row;

      const updatedRow = { ...row, [field]: value };

      // If minValue or maxValue → recalculate
      if (field === "minValue" || field === "maxValue") {
        const minValue =
          field === "minValue"
            ? parseFloat(value)
            : parseFloat(row.minValue);

        const maxValue =
          field === "maxValue"
            ? parseFloat(value)
            : parseFloat(row.maxValue);

        if (!isNaN(minValue) && !isNaN(maxValue)) {
          const baseMean = (minValue + maxValue) / 2;
          const baseSd = Math.abs(maxValue - minValue) / 4;
          const baseCv = (baseSd / baseMean) * 100;

          updatedRow.baseMeanValue = baseMean.toFixed(2);
          updatedRow.baseSdValue = baseSd.toFixed(2);
          updatedRow.baseCv = baseCv.toFixed(2);
        }
      }

      return updatedRow;
    })
  );
};

  const columns = [
    { header: "Sr.No", field: "srNo" },
    { header: "Parameter ID", field: "labObservationId" },
    { header: "Parameter Name", field: "labObservationName" },
    {
      header: (
        <Form.Check
          type="switch"
          id="selectAll"
          name="selectAll"
          checked={selectAll}
          onChange={handleSelectAll}
          className="m-0"
        />
        // <input type="checkbox" checked={selectAll} onChange={handleSelectAll} />
      ),
      field: "hash1",
      mobileLabel: "Select"
    },
    { header: "Level", field: "level" },
    {
          header: (
            <div className="d-flex flex-column align-items-center" style={{width: "50px",  minHeight: "30px"}}>
              <span>MinValue</span>
              <Input
                type="number"
                value={MinValue}
                placeholder=""
                // onChange={(e) => handleHeaderRateChange(e)}
                onChange={(e) => handleHeaderChange("minValue", e.target.value)}
                disabled={!tableData?.some(row => row.enabled)}
              />
              
            </div>
          ),
          field: "minValue",
          mobileLabel: "MinValue"
        },
        {
          header: (
            <div className="d-flex flex-column align-items-center" style={{width: "50px",  minHeight: "30px"}}>
              <span>MaxValue</span>
              <Input
                type="number"
                value={MaxValue}
                placeholder=""
                onChange={(e) => handleHeaderChange("maxValue", e.target.value)}
                disabled={!tableData?.some(row => row.enabled)}
              />
              
            </div>
          ),
          field: "maxValue",
          mobileLabel: "MaxValue"
        },
    // ...editableFields.map((field) => ({
    //   header: field.replace(/([A-Z])/g, " $1"),
    //   field,
    //   // width : "10px"
    // })),
    { header: "BaseMean", field: "baseMeanValue"},
    { header: "BaseSD", field: "baseSdValue" },
    { header: "BaseCV", field: "baseCv" },
    { header: "LabMean", field: "labMeanValue"},
    { header: "LabSD", field: "labSdValue"},
    { header: "LabCV", field: "labCv"},
     {
          header: (
            <div className="d-flex flex-column align-items-center" style={{width: "50px",  minHeight: "30px"}}>
              <span>Unit</span>
              <Input
                type="text"
                value={Unit}
                placeholder=""
                onChange={(e) => handleHeaderChange("unit", e.target.value)}
                disabled={!tableData?.some(row => row.enabled)}
              />
            </div>
          ),
          field: "unit",
          mobileLabel: "Unit"
        },
        {
          header: (
            <div className="d-flex flex-column align-items-center" style={{width: "50px",  minHeight: "30px"}}>
               <span>Temperature</span>
               <Input
                type="text"
                value={Temperature}
                placeholder=""
                onChange={(e) => handleHeaderChange("temperature", e.target.value)}
                disabled={!tableData?.some(row => row.enabled)}
                className="header-input"
              />
              
            </div>
          ),
          field: "temperature",
          mobileLabel: "Temp"
          // width: "8%"
        },
        {
          header: (
            <div className="d-flex flex-column align-items-center" style={{width: "50px",  minHeight: "30px"}}>
               <span>Method</span>
               <Input
                type="text"
                value={Method}
                placeholder=""
                onChange={(e) => handleHeaderChange("method", e.target.value)}
                disabled={!tableData?.some(row => row.enabled)}
                className="header-input"
              />
              
            </div>
          ),
          field: "method",
          mobileLabel: "Method"
          // width: "8%"
        },
    { header: "Remove", field: "hash2"},
  ];

  const formattedData = tableData.map((item, index) => {
    const rowWithInputs = { ...item, srNo: index + 1 };

    rowWithInputs.labObservationName = (
      <>
          {/* <ReactTooltip
                        id={`my-tooltip-${index}`}
                        place="top"
                        content={
                          <span>{item.labObservationName}</span>
                        }
                        style={{ zIndex: 9999 }}
                      /> */}
        <span title={item.labObservationName}>{item.labObservationName}</span>
      </>   
      
    );

    // Checkbox column
    rowWithInputs.hash1 = (
      <input
        type="checkbox"
        checked={item.enabled}
        onChange={() => {
          setTableData((prev) =>
            prev.map((row, i) =>
              i === index ? { ...row, enabled: !row.enabled } : row,
            ),
          );
        }}
      />
    );
    // Editable text inputs for each field
    editableFields.forEach((field) => {
      rowWithInputs[field] = (
        <input
          type="text"
          className="form-control"
          value={item[field]}
          disabled={!item.enabled || ['baseMeanValue', 'baseSdValue', 'baseCv', 'labMeanValue', 'labSdValue',
          'labCv'].includes(field)}
          onChange={(e) => {
            const value = e.target.value;

            if (
              numericFields.includes(field) &&
              value !== "" &&
              !/^\d*\.?\d*$/.test(value)
            ) {
              return;
            }

            if (field === "minValue" || field === "maxValue") {
              // Update the specific field (min or max value)
              const updatedTableData = [...tableData];
              updatedTableData[index][field] = value;

              // Perform calculation only if both minValue and maxValue are filled
              const minValue = parseFloat(updatedTableData[index].minValue);
              const maxValue = parseFloat(updatedTableData[index].maxValue);

              // Check if both Min and Max values are numbers
              if (!isNaN(minValue) && !isNaN(maxValue)) {
                // Calculate Base Mean, Base SD, and Base CV
                const baseMean = (minValue + maxValue) / 2;
                const baseSd = Math.abs(maxValue - minValue) / 4;
                const baseCv = (baseSd / baseMean) * 100;

                // Update the row with new calculations
                updatedTableData[index].baseMeanValue = baseMean.toFixed(2);
                updatedTableData[index].baseSdValue = baseSd.toFixed(2);
                updatedTableData[index].baseCv = baseCv.toFixed(2);
              }

              // Update the state with new table data
              setTableData(updatedTableData);
            } else {
              setTableData((prev) =>
                prev.map((row, i) =>
                  i === index ? { ...row, [field]: value } : row,
                ),
              );
            }
          }}
        />
      );
    });

    return rowWithInputs;
  });
  console.log("formattedData", formattedData);

  const handleRowCheckboxChange = (index) => {
    console.log("working");
    const updated = [...tableData];
    updated[index].enabled = !updated[index].enabled;
    setTableData(updated);
    setSelectAll(updated.every((row) => row.enabled)); // update header checkbox
  };

  const handleModel = (
    label,
    width,
    type,
    isOpen,
    Component,
    handleInsertAPI,
    extrabutton,
  ) => {
    setHandleModelData({
      label,
      width,
      type,
      isOpen,
      Component,
      handleInsertAPI,
      extrabutton: extrabutton ? extrabutton : <></>,
    });
  };

  const setIsOpen = () => {
    setHandleModelData((val) => ({ ...val, isOpen: false }));
  };

  const handleChangeModel = (data) => {
    setModalData(data);
  };

  const getAllDepartmentAndMachine = async () => {
    dispatch(setLoading(true));
    await axiosInstance
      .get(apiUrls.GetMachineGroup)
      .then((res) => {
        const machineList = res?.data?.message?.machines.map((item) => ({
          ...item,
          label: item?.MachineName,
          value: item?.MachineID,
        }));
        setDropdownlist((prev) => ({ ...prev, machineList }));
      })
      .catch((err) => {
        notify(err?.data?.message, "error");
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  };

  const getAllDepartments = async () => {
    // const searchPayload = { employeeId: "001" };
    dispatch(setLoading(true));

    await axiosInstance
      .get(apiUrls.GetDepartment)
      .then((res) => {
        const departmentList = res?.data?.message?.map((item) => ({
          ...item,
          label: item?.Department,
          value: item?.DepartmentID,
        }));
        setDropdownlist((prev) => ({ ...prev, departmentList }));
      })
      .catch((err) => {
        notify(err?.data?.message, "error");
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  };

  const getAllLabIds = async (machineId) => {
    setLabData({ labList: [] });
    const searchPayload = {
      parameterName: "",
      machineId: machineId.toString(),
    };
    console.log(typeof machineId);
    dispatch(setLoading(true));

    await axiosInstance
      .post(apiUrls.BindParameters, searchPayload)
      .then((res) => {
        console.log("lab-res", res);
        if (Array.isArray(res?.data?.message)) {
          const labList = res?.data?.message.map((item) => ({
            ...item,
            label: item?.ParameterName,
            value: item?.DepartmentID,
          }));
          setLabData((prev) => ({ ...prev, labList }));
        }

        // setPayload((prev) => ({ ...prev, LabObservation: labList }));
      })
      .catch((err) => {
        notify(err?.data?.message, "error");
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  };

  const handleCloseModal = () => {
    setHandleModelData((val) => ({ ...val, isOpen: false }));
  };

  useEffect(() => {
    getAllDepartmentAndMachine();
    getAllDepartments();
    setHandleModelData((val) => ({ ...val, modalData }));
  }, [modalData]);

  useEffect(() => {
    setMasterTableData(tableData);
  }, [tableData]);

  const handleSearch = (query) => {
    if (!query) {
      setResults([]);
      return;
    }

    const filteredResults = labData?.labList?.filter((lab) =>
      lab.label.toLowerCase().includes(query.toLowerCase())
    );

    setResults(filteredResults);
    setShowDropdown(filteredResults.length > 0);
  };

  useEffect(() => {
    // handleSearch(query); 
    if (query?.length > 0 && labData?.labList?.length > 0) {
      handleSearch(query);
    } else {
      // toast.info("No Records found");
      setResults([]);
      setShowDropdown(false);
    }
  }, [query, labData?.labList]);

  useEffect(()=>{
      setHighlightedIndex(0);
    },[query]);

  const handleKeyDown = (e) => {
    if (!showDropdown || results.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : 0
        );
        setTimeout(() => {
                const el = document.querySelector(".matchIndex");
                if (el) el.scrollIntoView({ block: "nearest" });
              }, 0);
        break;

      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : results.length - 1
        );
        setTimeout(() => {
                const el = document.querySelector(".matchIndex");
                if (el) el.scrollIntoView({ block: "nearest" });
              }, 0);
        break;

      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && results[highlightedIndex]) {
          const selected = results[highlightedIndex];
          handleSelect(selected);
        }
        break;

      case "Escape":
        setShowDropdown(false);
        break;

      default:
        break;
    }
  };

  const handleSelect = (lab) => {
    setQuery("");
    setPayload((prev) => ({
      ...prev,
      LabObservation: lab.label,
      LabId: lab.value,
    }));
    setResults([]);
    setShowDropdown(false);
    console.log("data", lab?.label, payload?.LabObservation);
    if (lab?.label?.trim()) {
      addLabObservationRows(lab?.label);
    }
  };

  console.log("payload", payload);
  console.log("tableData", tableData);
  // console.log("masterTableData", masterTableData);
  // console.log("dropdownlist", dropdownlist);
  console.log("labData", labData);
  console.log("errors", errors);
  console.log("formattedData", formattedData?.length);

  return (
    <>
      {showMore && <QCFrameMenu />}
      {/* <Accordion
        name={t("Control Master")}
        defaultValue={true}
        isBreadcrumb={true}
        seconTitle={
          <>
            <label onClick={() => setShowMore((prev) => !prev)}>
              <ViewMenu />
            </label>
          </>
        }
      > */}
      <Heading
        name={"Control Master"}
        isBreadcrumb={"true"}
        secondTitle={
          <>
            <label onClick={() => setShowMore((prev) => !prev)}>
              <ViewMenu />
            </label>
          </>
        }
      />
      <div className="row p-2 white-background">
        <div className="col-xl-2 col-sm-4 col-md-6 col-12">
          <Input
            type="text"
            placeholder=" "
            lable="Control Provider"
            id="ControlProvider"
            name="ControlProvider"
            value={payload?.ControlProvider}
            onChange={handleChange}
            // respclass="col-xl-2 col-sm-4 col-md-6 col-12"
            className="required-fields"
          />
          {payload?.ControlProvider === "" && (
            <span className="error-message">{errors?.ControlProvider}</span>
          )}
        </div>
        <div className="col-xl-2 col-sm-4 col-md-6 col-12">
          <Input
            type="text"
            placeholder=" "
            lable="Control Name"
            id="ControlName"
            name="ControlName"
            value={payload?.ControlName}
            onChange={handleChange}
            className="required-fields"
          />
          {payload?.ControlName === "" && (
            <span className="error-message">{errors?.ControlName}</span>
          )}
        </div>
        <div className="col-xl-2 col-sm-4 col-md-6 col-12">
          <Input
            type="text"
            placeholder=" "
            lable="Lot Number"
            id="LotNumber"
            name="LotNumber"
            value={payload?.LotNumber}
            onChange={handleChange}
            disabled={isEditMode}
            className="required-fields"
          />
          {payload?.LotNumber === "" && (
            <span className="error-message">{errors?.LotNumber}</span>
          )}
        </div>
        <div className="col-xl-2 col-sm-4 col-md-6 col-12">
          <DatePicker
            name="StartDate"
            id="StartDate"
            value={payload?.StartDate}
            onChange={dateSelect}
            maxDate={new Date()}
            placeholder=""
            lable={t("Start Date")}
            className="custom-calendar"

          />
          {payload?.StartDate === "" && (
            <span className="error-message">{errors?.StartDate}</span>
          )}
        </div>

        <div className="col-xl-2 col-sm-4 col-md-6 col-12">
          <DatePicker
            name="LotExpiry"
            id="LotExpiry"
            value={payload?.LotExpiry}
            onChange={dateSelect}
            minDate={payload?.StartDate}
            // maxDate={new Date()}
            placeholder=""
            lable={t("Lot Expiry")}
            className="custom-calendar"

          />
          {payload?.LotExpiry === "" && (
            <span className="error-message">{errors?.LotExpiry}</span>
          )}
        </div>

        <div className="col-xl-2 col-sm-4 col-md-6 co-12">
          <div className="d-flex">
            <ReactSelect
              name="Department"
              id="Department"
              removeIsClearable={true}
              dynamicOptions={dropdownlist?.departmentList}
              placeholderName="Department"
              value={payload?.Department}
              onChange={handleSelectChange}
              respclass="w-100"
            />

          </div>
          {payload?.DepartmentID === "" && (
            <span className="error-message">{errors?.Department}</span>
          )}
        </div>
        <div className="col-xl-2 col-sm-4 col-md-6 col-12">
          <ReactSelect
            name="Machine"
            id="Machine"
            removeIsClearable={true}
            dynamicOptions={dropdownlist?.machineList}
            placeholderName="Machine Group"
            value={payload?.Machine}
            onChange={handleSelectChange}
            isDisabled={isEditMode}
          />
          {payload?.MachineID === "" && (
            <span className="error-message ">{errors?.Machine}</span>
          )}
        </div>
        <div className="col-xl-2 col-sm-4 col-md-6 col-12">
          <Input
            type="text"
            placeholder=" "
            lable="Parameter Name"
            id="LabObservation"
            name="LabObservation"
            value={query}
            onKeyDown={handleKeyDown}
            onChange={(e) => setQuery(e.target.value)}
            autocomplete="off"
            // className="autocomplete-input"       
          />
          {showDropdown &&
            results.length > 0 && (
              <ul className="suggestion-data">
                {results.map((data, index) => (
                  <li
                    onClick={() => handleSelect(data)}
                    className={`${index === highlightedIndex && "matchIndex"}`}
                    key={index}
                  >
                    {data.label}
                  </li>
                ))}
              </ul>
            )}
        </div>

        <button
          className="d-flex align-items-center justify-content-center ml-2 rounded text-white border-0 p-1"
          style={{ height: "24px", width: "24px" }}
          onClick={() => {
            if (labData?.labList?.length > 0) {
              handleModel(
                "Parameters",
                getResponsiveModalWidth(),
                "Lab Observations",
                true,
                <QualityControlModel
                  handleCloseModal={handleCloseModal}
                  handleChangeModel={handleChangeModel}
                  labData={labData.labList}
                  handleAddParameters={handleAddParameters}
                />,
              )
            }
            else {
              notify("Please Select Machine", "warn");
            }
          }}
        >
          <PlusIcon />
        </button>
      </div>

      <Heading
        title={t("Search Details")}
        // isBreadcrumb={true}
        secondTitle={
          <>
            {colorCodingData.map(({ color, labelKey, id }) => (
              <ColorCodingSearch key={id} color={color} label={t(labelKey)} />
            ))}
          </>
        }
      />

      <div className="row" >
        <div className="col-sm-12">
          {formattedData.length > 0 ? (
            <CustomTable columns={columns}
              data={formattedData}
            />
          ) : (
            <CustomTable columns={columns} 
            data={formattedData} 
            />
          )}
        </div>
      </div>
      {/* </Accordion> */}

      <div className="row">
        <div className="col-sm-12 d-flex justify-content-end">
          {tableData.length > 0 && (
            <CustomButton
              className="rounded py-0 ml-2 mt-2"
              onClick={isEditMode ? handleUpdateControlData : handleSaveControlData}
              text={isEditMode ? "Update" : "Save"}
              icon="save"
            />
          )}
          <CustomButton
            className="rounded py-0 ml-2 mt-2"
            onClick={handleReset}
            text="Reset"
            icon="refresh"
          />

        </div>
      </div>

      <ControlMasterSearchTable onEdit={(row) => handleEdit(row)}
        refresh={refresh}
      />

      {handleModelData?.isOpen && (
        <Modal
          visible={handleModelData?.isOpen}
          setVisible={setIsOpen}
          modalWidth={handleModelData?.width}
          Header={t(handleModelData?.label)}
          buttonType="submit"
          buttons={handleModelData?.extrabutton}
          modalData={handleModelData?.modalData}
          setModalData={setModalData}
        >
          {handleModelData?.Component}
        </Modal>
      )}
    </>
  );
};

export default ControlMaster;
