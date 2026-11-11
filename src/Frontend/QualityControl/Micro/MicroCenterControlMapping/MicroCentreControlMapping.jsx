import React, { useEffect, useState } from "react";
import Accordion from "../../../../components/UI/Accordion";
import { useTranslation } from "react-i18next";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import { Button } from "react-bootstrap";
import CustomTable from "../../../../components/Table/CustomTable";
import { PlusIcon, ViewMenu } from "../../../../components/SvgIcons";
import ColorCodingSearch from "../../../../components/ModalComponent/ColorCodingSearch";
import LabeledInput from "../../../../components/formComponent/LabeledInput";
import RadioInput from "../../../../components/formComponent/RadioInput";
import Input from "../../../../components/formComponent/Input";
import QCFrameMenu from "../../IQC/QCFrameMenu";
import { useDispatch } from "react-redux";
import { setLoading } from "../../../../store/reducers/loadingSlice/loadingSlice";
import { axiosInstance } from "../../../../utils/axiosInstance";
import { apiUrls } from "../../../../utils/apiUrls";
import { notify } from "../../../../utils/utils";
import { FaPlus, FaTimes } from "react-icons/fa";
import { useLocalStorage } from "../../../../utils/hooks/useLocalStorage";
import Heading from "../../../../components/UI/Heading";
import { CustomButton } from "../../../../components/UI/CustomButton";
// import "../../IQC/CentreControlMapping.css";

const MicroCentreControlMapping = () => {
  const { t } = useTranslation();
  const initialState = {
    Centre: "",
    Machine: "",
    Control: "",
    SelectAll: "",
    SinNoLevel1: "",
    SinNoLevel2: "",
    SinNoLevel3: "",
    MachineName: "",
  };
  const isMobile = window.innerWidth <= 768;
  const responsiveSin = window.innerWidth <= 992;
  const [payload, setPayload] = useState(initialState);
  const [showMore, setShowMore] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [labelInputData, setLabelInputData] = useState([]);
  const { ShowDefaultLoginCentre, DefaultCentre } = useLocalStorage("userData", "get");
  const dispatch = useDispatch();
  const [dropdownlist, setDropdownlist] = useState({
    centreList: [],
    machineList: [],
    controlList: [],
  });

  const editableFields = [
    "minValue",
    "maxValue",
    "baseMeanValue",
    "baseSD",
    "baseCV",
    "lowValue",
    "highValue",
    "labMeanValue",
    "labSD",
    "labCV",
    "assayNo",
    "sinNo",
  ];
  const numericFields = [
    "minValue",
    "maxValue",
    "baseMeanValue",
    "baseSD",
    "baseCV",
    "lowValue",
    "highValue",
    "labMeanValue",
    "labSD",
    "labCV",
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPayload((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? "1" : "0") : value,
    }));
  };
  const handleSinNoChange = (level, value) => {
    // Update payload
    setPayload((prev) => ({
      ...prev,
      [`SinNoLevel${level}`]: value,
    }));

    // Update table rows of this level
    setTableData((prev) =>
      prev.map((row) =>
        row.level === `Level ${level}` ? { ...row, sinNo: value } : row,
      ),
    );
  };

  const handleReset = () => {
    setPayload((prev) => ({
      ...initialState,
      Centre: prev.Centre,
    }));
    setTableData([]); // Clear table rows
    setLabelInputData([]); // Clear any label inputs (optional)
  };

  const handleSelectChange = (name, e) => {
    if (name === "Centre") {
      getMachineList(e?.value);
      setPayload((prev) => ({ ...prev, [name]: e?.value }));
      return;
    } else if (name === "Machine") {
      getControlList(e?.value);
      setPayload((prev) => ({ ...prev, [name]: e?.value, MachineName: e?.label }));
      return;
    }
    setPayload((prev) => ({ ...prev, [name]: e?.value }));
  };

  const buildSavePayload = () => {

    const controlName =
      labelInputData.find((item) => item?.label === "Control Name")?.value || "";
    const lotNumber =
      labelInputData.find((item) => item?.label === "Lot Number")?.value || "";

    return tableData?.filter?.((row) => row.enabled === true)?.map((row) => ({
      controlID: payload?.Control || "",
      controlName: controlName || "",
      lotNumber: lotNumber || "",
      machineID: payload?.MachineName?.split("#")[0].trim() || "",
      machineGroupId: "",
      labObservation_ID: row?.labObservationID.toString() || "",
      labObservation_Name: row?.labObservationName || "",
      assayNo: row?.assayNo || "",
      lockMachine: row?.lock ? "1" : "0",
      levelID: row?.levelid?.toString() || "",
      level: row?.level || "",
      barcodeNo: row?.sinNo || "",
      expectedValue: row?.expectedValue || "",
      minValue: row?.minValue || "",
      maxValue: row?.maxValue || "",
      baseMeanValue: row?.baseMeanValue || "",
      baseSDValue: row?.baseSD || "",
      baseCVPercent: row?.baseCV || "",
      labMeanValue: row?.labMeanValue || "",
      labSDValue: row?.labSD || "",
      labCVPercent: row?.labCV || "",
      lowValue: row?.lowValue || "",
      highValue: row?.highValue || "",
      savedId: row?.savedid || "",
      centreID: payload?.Centre || 0,
    }));
  };

  const formattedData = tableData?.map((item, index) => {
    const firstRowMap = {};
    tableData.forEach((row, i) => {
      if (!firstRowMap[row.labObservationID]) {
        firstRowMap[row.labObservationID] = i;
      }
    });
    const rowWithInputs = { ...item, srNo: index + 1 };

    rowWithInputs.labObservationName = (
      <>
        <span title={item.labObservationName}>{item.labObservationName}</span>
      </>

    );

    // Add checkbox for row selection
    rowWithInputs.Add = (
      <div className="d-flex align-items-center gap-2">
        {/* Checkbox */}
        <input
          type="checkbox"
          checked={item.enabled || false}
          onChange={() => {
            setTableData((prev) =>
              prev.map((row, i) =>
                i === index ? { ...row, enabled: !row.enabled } : row,
              ),
            );
          }}
        />

        {/* Button logic */}
        {item.groupType === "duplicate" && item.level.endsWith("1") ? (
          <div
            className="remark-btn ml-1"
            onClick={() => {
              // Remove all 3 rows of this duplicate group
              const labId = item.labObservationID;
              const startLevel = parseInt(item.level.replace("Level ", ""), 10);

              setTableData((prev) =>
                prev.filter(
                  (row, i) =>
                    !(
                      row.groupType === "duplicate" &&
                      row.labObservationID === labId &&
                      i >= index &&
                      i < index + 3
                    ),
                ),
              );
            }}
            style={{ backgroundColor: "darkred" }}
          >
            <FaTimes color="white" size={8} />{" "}
          </div>
        ) : item.groupType === "original" && item.level.endsWith("1") ? (
          // First row of original set → Add button
          <div
            className="remark-btn ml-1"
            onClick={() => {
              const labId = item.labObservationID;

              // 1️⃣ Get original 3 rows (Level 1,2,3)
              const originalRows = tableData?.filter(
                (row) =>
                  row.labObservationID === labId &&
                  row.groupType === "original"
              );

              // 2️⃣ Create duplicates with same data
              const duplicates = originalRows.map((row, idx) => ({
                ...row,
                srNo: tableData.length + idx + 1,
                groupType: "duplicate",
                // assayNo: "",   
                // sinNo: "",     
                enabled: true,
              }));

              // 3️⃣ Insert below the original 3 rows
              setTableData((prev) => {
                const insertIndex =
                  prev.findIndex(
                    (r) =>
                      r.labObservationID === labId &&
                      r.groupType === "original" &&
                      r.level.endsWith("3")
                  ) + 1;

                return [
                  ...prev.slice(0, insertIndex),
                  ...duplicates,
                  ...prev.slice(insertIndex),
                ];
              });
            }}

            style={{ backgroundColor: "darkred" }}
          >
            <FaPlus color="white" size={8} />{" "}
            {/* smaller plus icon */}
          </div>
        ) : null}
      </div>
    );

    rowWithInputs.lock = (
      <input
        type="checkbox"
        checked={item.lock || false}
        onChange={() => {
          setTableData((prev) =>
            prev.map((row, i) =>
              i === index ? { ...row, lock: !row.lock } : row,
            ),
          );
        }}
      />
    );

    // Expected Value (read-only, populated from API)
    rowWithInputs.expectedValue = (
      <input
        type="text"
        className="form-control"
        value={item.expectedValue || ""}
        disabled
        readOnly
      />
    );

    // Editable text inputs for each field
    editableFields.forEach((field) => {
      rowWithInputs[field] = (
        <input
          type="text"
          className="form-control"
          value={item[field]}
          disabled={!item.enabled}
          onChange={(e) => {
            const value = e.target.value;
            if (
              numericFields.includes(field) &&
              value !== "" &&
              !/^\d*\.?\d*$/.test(value)
            ) {
              return;
            }

            setTableData((prev) =>
              prev.map((row, i) =>
                i === index ? { ...row, [field]: value } : row,
              ),
            );
          }}
        />
      );
    });

    // Add sinNo field
    rowWithInputs.sinNo = (
      <input
        type="text"
        className="form-control"
        value={item.sinNo}
        style={{ width: `${responsiveSin}` ? "100%" : "80px" }}
        disabled={!item.enabled}
        onChange={(e) => {
          const value = e.target.value;
          setTableData((prev) =>
            prev.map((row, i) =>
              i === index ? { ...row, sinNo: value } : row,
            ),
          );
          setPayload((prev) => ({
            ...prev,
            [`SinNoLevel${item.level.replace("Level ", "")}`]: value,
          }));
        }}
      />
    );

    return rowWithInputs;
  });

  const columns = [
    { header: "Sr.No", field: "srNo" },
    { header: "Add", field: "Add" },
    { header: "ParameterID", field: "labObservationID" },
    { header: "ParameterName", field: "labObservationName" },
    { header: "Level", field: "level" },
    { header: "Expected Value", field: "expectedValue" },
    { header: "AssayNo", field: "assayNo" },
    { header: "SinNo", field: "sinNo" },

  ];

  const colorCodingData = [
    { color: "#f5d2d8ff", id: "7", labelKey: "Mapped Data" },
    { color: "#d9fdafff", id: "15", labelKey: "UnMapped Data" },
  ];

  const handleSave = async () => {
    const finalPayload = buildSavePayload();
    console.log("finalPayload", finalPayload);

    const hasEmptyBarcode = finalPayload?.some(
      (item) => !item?.barcodeNo || item?.barcodeNo?.trim() === ""
    );

    if (hasEmptyBarcode) {
      notify("Barcode No is mandatory for all rows", "warn");
      return;
    }
    dispatch(setLoading(true));

    try {
      const response = await axiosInstance.post(
        "QCControlCentreMicroMapping/SaveControlCentreMapping",
        finalPayload,
      );
      if (response?.data?.success) {
        notify(response?.data?.message, "success");
      }
      else {
        notify(response?.data?.message, "warn");
      }
      console.log("Saved successfully:", response.data);
      handleReset();

    } catch (error) {
      notify(error?.data?.message || "Something went wrong!", "error");
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleSearch = async () => {

    const searchPayload = {
      controlId: payload?.Control || "",
      // machineId: payload.Machine,
      machineId: payload?.MachineName?.split("#")[0].trim() || "",
      centreId: payload?.Centre.toString() || "",
    };

    dispatch(setLoading(true));

    await axiosInstance
      .post("QCControlCentreMicroMapping/BindParameter", searchPayload)
      .then((res) => {
        if (Array.isArray(res?.data?.message) && res?.data?.message?.length > 0) {
          console.log("res", res?.data);
          const apiData = res?.data?.message;

          setPayload((prev) => ({ ...prev, SinNoLevel1: "", SinNoLevel2: "", SinNoLevel3: "" }))

          setLabelInputData([
            { label: "Control Name", value: apiData[0]?.controlname },
            { label: "Lot Number", value: apiData[0]?.lotnumber },
            { label: "Control Provider", value: apiData[0]?.ControlProvider },
            { label: "Start Date", value: apiData[0]?.startdate },
            { label: "Lot Expiry", value: apiData[0]?.LotExpiry },
          ]);

          const rows = apiData?.map((row, idx) => ({
            srNo: idx + 1,
            labObservationID: row?.LabObservation_ID,
            labObservationName: row?.LabObservation_Name,
            level: `Level ${row?.levelid}`,
            levelid: row?.levelid || "",
            expectedValue: row?.ExpectedValue || "",
            minValue: row?.Minvalue || "",
            maxValue: row?.Maxvalue || "",
            baseMeanValue: row?.BaseMeanvalue || "",
            baseSD: row?.BaseSDvalue || "",
            baseCV: row?.BaseCVPercentage || "",
            lowValue: row?.LowValue || "",
            highValue: row?.HighValue || "",
            labMeanValue: row?.LabMeanvalue || "",
            labSD: row?.LabSDvalue || "",
            labCV: row?.LabCVPercentage || "",
            assayNo: row?.assayno || "",
            sinNo: row?.barcodeno || "",
            lock: row?.LockMachine === 1,
            enabled: true,
            groupType: "original", // 🔹 mark as original set
            savedid: row?.savedid || "",
          }));

          setTableData(rows);
        }
        else {
          notify(res?.data?.message, "warn");
          setTableData([]);
          setLabelInputData([]);
        }
      })
      .catch((err) => {
        notify(err?.data?.message, "error");
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  };

  const getAllCentre = async () => {
    dispatch(setLoading(true));
    await axiosInstance
      .get("QCControlCentreMicroMapping/GetCentreById")
      .then((res) => {
        console.log("res", res?.data);
        const resList = res?.data?.message?.map((item) => ({
          ...item,
          label: item?.centre,
          value: item?.centreid,
        }));
        setDropdownlist((prev) => ({ ...prev, centreList: resList }));
        if (ShowDefaultLoginCentre === "1") {
          setPayload((prev) => ({ ...prev, Centre: DefaultCentre ?? resList?.[0]?.value }))
          getMachineList(DefaultCentre || resList?.[0]?.value || "");
        }
        else {
          setPayload((prev) => ({ ...prev, Centre: resList?.[0]?.value }));
          getMachineList(resList?.[0]?.value);
        }

      })
      .catch((err) => {
        notify(err?.data?.message, "error");
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  };

  const getMachineList = async (centreId) => {
    dispatch(setLoading(true));
    await axiosInstance
      .post("QCControlCentreMicroMapping/BindMachine", {
        centreId: centreId.toString(),
      })
      .then((res) => {
        console.log("res..........", res);
        const resList = res?.data?.message?.map((item) => ({
          ...item,
          label: item?.machinename,
          value: item?.MacID,
        }));
        setDropdownlist((prev) => ({ ...prev, machineList: resList }));
        // setPayload((prev) => ({ ...prev, Machine: resList?.[0]?.label }));
      })
      .catch((err) => {
        notify(err?.data?.message, "error");
      });
    dispatch(setLoading(false));
  };

  const getControlList = async (machineId) => {
    console.log("parameter..............", machineId);
    const searchPayload = {
      macId: machineId,
      centreId: payload.Centre.toString(),
    };
    dispatch(setLoading(true));
    await axiosInstance
      .post("QCControlCentreMicroMapping/BindControl", searchPayload)
      .then((res) => {
        const resList = res?.data?.message?.map((item) => ({
          ...item,
          label: item?.controlname,
          value: item?.controlid,
        }));
        setDropdownlist((prev) => ({ ...prev, controlList: resList }));
        // setPayload((prev) => ({ ...prev, Control: resList?.[0]?.label }));
      })
      .catch((err) => {
        notify(err?.data?.message, "error");
      });
    dispatch(setLoading(false));
  };

  useEffect(() => {
    getAllCentre();
  }, []);

  console.log("payload", payload);
  console.log("formattedData", formattedData);
  console.log("tableData", tableData);

  return (
    <>
      {showMore && <QCFrameMenu />}
      <Heading
        name={"Micro Centre Control Mapping"}
        isBreadcrumb={"true"}
        secondTitle={
          <>
            <label onClick={() => setShowMore((prev) => !prev)}>
              <ViewMenu />
            </label>
          </>
        }
      />
      <div className="row p-1 white-background">
        <ReactSelect
          dynamicOptions={dropdownlist?.centreList}
          name="Centre"
          id="Centre"
          removeIsClearable={true}
          placeholderName="Centre"
          value={payload?.Centre}
          onChange={handleSelectChange}
          respclass={"col-xl-2 col-sm-2 col-md-3 co-12"}
        />
        <ReactSelect
          name="Machine"
          id="Machine"
          removeIsClearable={true}
          dynamicOptions={dropdownlist?.machineList}
          placeholderName="Machine"
          value={payload?.Machine}
          onChange={handleSelectChange}
          respclass={"col-xl-2 col-sm-2 col-md-3 co-12"}
        />
        <ReactSelect
          name="Control"
          id="Control"
          removeIsClearable={true}
          dynamicOptions={dropdownlist?.controlList}
          placeholderName="Control"
          value={payload?.Control}
          onChange={handleSelectChange}
          respclass={"col-xl-2 col-sm-2 col-md-3 co-12"}
        />
        <CustomButton text="Search" onClick={handleSearch} icon="search" className="mx-2 mb-1" />
        <CustomButton text="Reset" onClick={handleReset} icon="refresh" className="mx-2 mb-1" />

      </div>
      <Accordion
        title={t("Centre Control List")}
        defaultValue={true}
      // isBreadcrumb={true}
      >
        <div className="row pt-1 px-1">
          {

            labelInputData?.map((ele, i) => (
              <div key={i} className="col-xl-2 col-sm-3 col-md-2 col-12">
                <LabeledInput label={ele.label} value={ele.value} className={isMobile ? "" : "mb-2"} />
              </div>
            ))
          }

        </div>

        {/* {formattedData?.length > 0 &&
          <>
            <div className="row px-2 align-items-center">
              <div className="col-xl-2 col-sm-3 col-12">
                <label>Enter Sin No. For All Parameter</label>
              </div>
              <Input
                type="text"
                placeholder=" "
                lable="Sin No Level 1"
                id="SinNoLevel1"
                name="SinNoLevel1"
                value={payload.SinNoLevel1}
                onChange={(e) => handleSinNoChange(1, e.target.value)}
                respclass="col-xl-2 col-sm-3 col-12"
              />

              <Input
                type="text"
                placeholder=" "
                lable="Sin No Level 2"
                id="SinNoLevel2"
                name="SinNoLevel2"
                value={payload.SinNoLevel2}
                onChange={(e) => handleSinNoChange(2, e.target.value)}
                respclass="col-xl-2 col-sm-3 col-12"
              />

              <Input
                type="text"
                placeholder=" "
                lable="Sin No Level 3"
                id="SinNoLevel3"
                name="SinNoLevel3"
                value={payload.SinNoLevel3}
                onChange={(e) => handleSinNoChange(3, e.target.value)}
                respclass="col-xl-2 col-sm-3 col-12"
              />
            </div>
          </>} */}
        <CustomTable columns={columns} data={formattedData} />
        {formattedData?.length > 0 &&
          <div className="d-flex justify-content-end my-2">
            <CustomButton text="Save" onClick={handleSave} icon="save" className="mx-2" />
          </div>
        }
      </Accordion>
    </>
  );
};

export default MicroCentreControlMapping;
