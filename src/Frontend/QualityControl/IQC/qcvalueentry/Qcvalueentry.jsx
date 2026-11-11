import React, { useEffect, useState } from "react";
import Heading from "../../../../components/UI/Heading";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import { useTranslation } from "react-i18next";
import { axiosInstance } from "../../../../utils/axiosInstance";
import { Button } from "react-bootstrap";
import CustomTable from "../../../../components/Table/CustomTable";
import QCFrameMenu from "../QCFrameMenu";
import { ViewMenu } from "../../../../components/SvgIcons";
import { apiUrls } from "../../../../utils/apiUrls";
import { setLoading } from "../../../../store/reducers/loadingSlice/loadingSlice";
import { useDispatch } from "react-redux";
import DatePicker from "../../../../components/formComponent/DatePicker";
import { notify } from "../../../../utils/utils";
import { formatStandardDate } from "../../../../utils/helpers";
import { useLocalStorage } from "../../../../utils/hooks/useLocalStorage";
import '../QcCommonCss.css' ;
import { CustomButton } from "../../../../components/UI/CustomButton";

const Qcvalueentry = () => {
  const { t } = useTranslation();
  const initialState = {
    Centre: "",
    Control: "",
    ControlName: "",
    Machine: "",
    EntryDate: new Date(),
    Level1: "",
    Level2: "",
    Level3: "",
  };
  const [payload, setPayload] = useState(initialState);
  const [showMore, setShowMore] = useState(false);
  const {ShowDefaultLoginCentre} = useLocalStorage("userData", "get");
  const DefaultCentre = useLocalStorage("DefaultCentre", "get");
  const [dropdownlist, setDropdownlist] = useState({
    centreList: [],
    machineList: [],
    controlList: [],
  });
  const dispatch = useDispatch();
  const [tableData, setTableData] = useState([]);

  const columns = [
    { header: "Sr. No", field: "srNo", width: "3%" },
    { header: "Select", field: "hash" },
    { header: "LabObservation ID", field: "labObservationId" },
    { header: "LabObservation Name", field: "labObservationName" },
    { header: "Level 1 Min", field: "level1Min" },
    { header: "Level 1 Max", field: "level1Max" },
    { header: "Level 1", field: "level1" },
    { header: "Level 2 Min", field: "level2Min" },
    { header: "Level 2 Max", field: "level2Max" },
    { header: "Level 2", field: "level2" },
    { header: "Level 3 Min", field: "level3Min" },
    { header: "Level 3 Max", field: "level3Max" },
    { header: "Level 3", field: "level3" },
  ];

  const formattedData = tableData.map((row, index) => {
    return {
      ...row,
      labObservationName: (
        <span title={row.labObservationName}>{row.labObservationName}</span>
      ),
      hash: (
        <input
          type="checkbox"
          checked={row.isEnabled}
          onChange={() => handleCheckboxToggle(index)}
        />
      ),
      level1: (
        <input
          type="text"
          className="form-control"
          value={row.level1}
          disabled={!row.isEnabled}
          onChange={(e) => {
            const value = e.target.value;
            if (
              value !== "" &&
              !/^\d*\.?\d*$/.test(value)
            ) {
              return; 
            }
            setTableData((prev) =>
              prev.map((r, i) => (i === index ? { ...r, level1: value } : r)),
            );
          }}
        />
      ),
      level2: (
        <input
          type="text"
          className="form-control"
          value={row.level2}
          disabled={!row.isEnabled}
          onChange={(e) => {
            const value = e.target.value;
            if (
              value !== "" &&
              !/^\d*\.?\d*$/.test(value)
            ) {
              return; 
            }
            setTableData((prev) =>
              prev.map((r, i) => (i === index ? { ...r, level2: value } : r)),
            );
          }}
        />
      ),
      level3: (
        <input
          type="text"
          className="form-control"
          value={row.level3}
          disabled={!row.isEnabled}
          onChange={(e) => {
            const value = e.target.value;
            if (
              value !== "" &&
              !/^\d*\.?\d*$/.test(value)
            ) {
              return; 
            }
            setTableData((prev) =>
              prev.map((r, i) => (i === index ? { ...r, level3: value } : r)),
            );
          }}
        />
      ),
    };
  });

  // ✅ Toggle checkbox → enable/disable text inputs
  const handleCheckboxToggle = (rowIndex) => {
    setTableData((prev) =>
      prev.map((row, i) =>
        i === rowIndex ? { ...row, isEnabled: !row.isEnabled } : row,
      ),
    );
  };

  const getMachineList = async (centreId) => {
    dispatch(setLoading(true));
    await axiosInstance
      .post(apiUrls.bindMachine, { centre: centreId })
      .then((res) => {
        const resList = res?.data?.message?.map((item) => ({
          ...item,
          label: item?.MACHINEID,
          value: item?.MACHINEID,
        }));
        setDropdownlist((prev) => ({ ...prev, machineList: resList }));
        // setPayload((prev) => ({ ...prev, Machine: resList?.[0]?.label }));
      })
      .catch((err) => {
        notify(err?.data?.message, "error");
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  };

  const getControlList = async (centreId) => {
    dispatch(setLoading(true));
    await axiosInstance
      .post(apiUrls.bindControl, { centre: centreId })
      .then((res) => {
        const resList = res?.data?.message?.map((item) => ({
          ...item,
          label: item?.ControlName,
          value: item?.controlid,
        }));
        setDropdownlist((prev) => ({ ...prev, controlList: resList }));
        // setPayload((prev) => ({ ...prev, Control: resList?.[0]?.label }));
      })
      .catch((err) => {
        notify(err?.data?.message, "error");
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  };

  const getAllCenter = () => {
    dispatch(setLoading(true));
    axiosInstance
      .get(apiUrls.GetCentreById)
      .then((res) => {
        const resList = res?.data?.message?.map((item) => ({
          ...item,
          label: item?.centre,
          value: item?.centreid,
        }));
        setDropdownlist((prev) => ({ ...prev, centreList: resList }));
        if (ShowDefaultLoginCentre === "1") {
          setPayload((prev) => ({ ...prev, Centre: DefaultCentre ?? resList?.[0]?.value}));
          getMachineList(DefaultCentre?.toString() || resList?.[0]?.value || "");
          getControlList(DefaultCentre?.toString() || resList?.[0]?.value || "");
        }
        else{
          setPayload((prev) => ({ ...prev, Centre: resList?.[0]?.value }));
          getMachineList(resList?.[0]?.value?.toString());
          getControlList(resList?.[0]?.value?.toString());
        }
        // setPayload((prev) => ({ ...prev, Centre: resList?.[0]?.value }));
      })
      .catch((err) => {
        notify(err?.data?.message, "error");
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  };

  const getQcParameterData = async () => {
    dispatch(setLoading(true));
    const searchPayload = {
      machineId: payload?.Machine || "",
      centreId: payload?.Centre?.toString() || "",
      controlId: payload?.Control || "",
      fromDate: formatStandardDate(payload.EntryDate),
    };
    await axiosInstance
      .post(apiUrls.showReading, searchPayload)
      .then((res) => {
        if (Array?.isArray(res?.data?.message) && res?.data?.success) {
          const mappedData = res?.data?.message?.map((item, index) => {
            const minValues = item.MinValue?.split(",") || [];
            const maxValues = item.MaxValue?.split(",") || [];

            return {
              srNo: index + 1,
              isEnabled: true,
              labObservationId: item.LabObservation_ID,
              labObservationName: item.LabObservation_Name,
              level1Min: minValues[0] || "0",
              level1Max: maxValues[0] || "0",
              level1: "",
              level2Min: minValues[1] || "0",
              level2Max: maxValues[1] || "0",
              level2: "",
              level3Min: minValues[2] || "0",
              level3Max: maxValues[2] || "0",
              level3: "",
            };
          });
          setTableData(mappedData);
          
        } else {
          notify(res?.data?.message, "warn");
          setTableData([]);
          
        }
      })
      .catch((err) => {
        notify(err?.data?.message, "error");
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  };

  const dateSelect = (date, name) => { 
    setPayload((prev) => ({
      ...prev,
      [name]: date,     
    }));
  };

  const handleSelectChange = (name, e) => {
    if (name === "Centre") {
      getMachineList(e?.value.toString());
      getControlList(e?.value.toString());
      setPayload((prev) => ({ ...prev, [name]: e?.value }));
      return;
    } else if (name === "Control") {
      setPayload((prev) => ({
        ...prev,
        [name]: e?.value,
        ControlName: e?.label,
      }));
      return;
    }
    setPayload((prev) => ({ ...prev, [name]: e?.value }));
  };

  const handleReset = () => {
    // setPayload(initialState);
    setPayload((prev) => ({...initialState, Centre : prev.Centre}))
    setTableData([]);
  };

  const handleSave = async () => {
    try {
      if (!tableData.length) {
        notify("No data to save", "warning");
        return;
      }

      dispatch(setLoading(true));

      // Extract control name and lot number from selected control
      const [controlName, lotNumber] = payload?.ControlName?.split("#").map(
        (s) => s.trim(),
      ) || ["", ""];

      // Construct final save payload
      const savePayload = [];

      tableData.forEach((row) => {
        // We know levels are 1–3
        const levels = [
          { id: "1", value: row.level1 },
          { id: "2", value: row.level2 },
          { id: "3", value: row.level3 },
        ];

        levels.forEach((lvl) => {
          if (
            lvl.value !== "" &&
            lvl.value !== null &&
            lvl.value !== undefined
          ) {
            savePayload.push({
              labObservation_ID: row.labObservationId,
              controlID: payload?.Control,
              centreId: payload?.Centre?.toString() || "",
              controlName: controlName || "",
              lotNumber: lotNumber || "",
              labObservation_Name: row.labObservationName,
              levelID: lvl.id,
              level: `Level${lvl.id}`,
              machineID: payload?.Machine || "",
              reading: lvl.value,
              dtEntry: formatStandardDate(payload.EntryDate),
            });
          }
        });
      });

      if (!savePayload.length) {
        notify("Please enter at least one level value.", "warning");
        return;
      }

      // ✅ Call save API
      const response = await axiosInstance.post(apiUrls.saveData, savePayload);

      if (response?.data?.success) {
        notify(response?.data?.message || "QC Values saved successfully!", "success");
        handleReset();
      } else {
        notify(response?.data?.message || "Failed to save QC Values", "error");
      }
    } catch (err) {
      notify("Error while saving QC Values", "error");
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    getAllCenter();
  }, []);

  console.log("tableData", tableData);
  console.log("payload", payload);

  return (
    <>
      {showMore && <QCFrameMenu />}
      <div className="card">
        <Heading
          name={"QC Parameter Value Entry"}
          isBreadcrumb={"true"}
          secondTitle={
            <>
              <label onClick={() => setShowMore((prev) => !prev)}>
                <ViewMenu />
              </label>
            </>
          }
        />

        <div className="row p-2 d-flex justify-content-left">
          <ReactSelect
            name="Centre"
            id="Centre"
            removeIsClearable={true}
            dynamicOptions={dropdownlist.centreList}
            placeholderName="Centre"
            value={payload?.Centre}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-3 col-md-3 col-lg-2 co-12"}
            isShowBorder={true}
          />
          <ReactSelect
            name="Control"
            id="Control"
            removeIsClearable={true}
            dynamicOptions={dropdownlist.controlList}
            placeholderName="Control/Lot Number"
            value={payload?.Control}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-3 col-md-3 col-lg-2 co-12"}
            isShowBorder={true}
          />
          <ReactSelect
            name="Machine"
            id="Machine"
            removeIsClearable={true}
            dynamicOptions={dropdownlist.machineList}
            placeholderName="Machine"
            value={payload?.Machine}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-3 col-md-3 col-lg-2 co-12"}
            isShowBorder={true}
          />

          <DatePicker
            name="EntryDate"
            id="EntryDate"
            value={payload?.EntryDate}
            onChange={dateSelect}
            maxDate={new Date()}
            placeholder=""
            lable={t("Entry Date")}
            className="custom-calendar"
            respclass="col-xl-2 col-sm-3 col-md-3 col-lg-2 co-12"
          />
            {tableData.length > 0 ? (
              <CustomButton text="save" onClick={handleSave} icon="save" className="mx-2"/>
            ) : (
              <CustomButton text="Show Parameter" onClick={getQcParameterData} icon="eye" className="mx-2"/>
            )}
            <CustomButton text="Reset" onClick={handleReset} icon="refresh" className="mx-2"/>
        </div>
        <Heading
          title={"Enter Values"}
        />
        <div className="row">
          <div className="col-sm-12">
            <CustomTable columns={columns} data={formattedData} />
          </div>
        </div>
      </div>
    </>
  );
};

export default Qcvalueentry;
