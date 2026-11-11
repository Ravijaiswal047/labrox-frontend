import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { axiosInstance } from "../../utils/axiosInstance";
import { InestigationRange, RoundOff } from "../../utils/Constants";
import Accordion from "@app/components/UI/Accordion";
import { SelectBox } from "../../components/formComponent/SelectBox";
import Input from "../../components/formComponent/Input";
import Tables from "../../components/UI/customTable";
import Loading from "../../components/loader/Loading";
import { convertAgeToDays, number } from "../../utils/helpers";
import { CustomButton, DeleteButton, SaveButton } from "../../components/UI/CustomButton";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { FaTrash } from "react-icons/fa";

const InvestigationRange = () => {
  const location = useLocation();
  const { state } = location;
  const {MainCentreID} = useLocalStorage('userData', 'get')
  const navigate = useNavigate();
  const [CentreData, setCentreData] = useState([]);
  const [Machine, setMachine] = useState([]);
  const [Gender, setGender] = useState([]);
  const [RangeType, setRangeType] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [load, setLoad] = useState(false);
  const [valid, setValid] = useState({});
  const [errors, setErrors] = useState([]);

  const [payload, setPayload] = useState({
    CentreID: "",
    Gender: "Male",
    MacID: "",
    RangeType: "",
    InvestigationID: state?.InvestigationID,
    MethodName: "",
    LabObservationID: state?.InvestigationID,
    SaveToBothGender: 0,
    RoundOff: "",
    AbNormal: 0,
    ForAllCentre: 0,
    DisplayReading: "",
    AmrAccess: 0,
  });
  const { t } = useTranslation();
  useEffect(() => {
    if (CentreData.length > 0) {
      const defaultCentre = CentreData?.find(item=>item?.value == MainCentreID)
      setPayload({
        ...payload,
        CentreID: CentreData[0]?.value ? defaultCentre?.value || CentreData[0]?.value : "",
        MacID: Machine[0]?.value ? Machine[0]?.value : "",
        RangeType: RangeType[0]?.value ? RangeType[0]?.value : "",
      });
    }
  }, [CentreData, Gender, Machine, RangeType]);

  const handleDelete = (ind) => {
    // console.log("ind delete",ind);
    const data = tableData?.filter((ele, index) => index !== ind);
    setTableData(data);
    toast.success("Removed Successfully");
  };

  const fetch = () => {
    axiosInstance
      .post("Investigations/GetRangeData", {
        ...payload,
        Gender: payload?.Gender === "TransGender" ? "Male" : payload?.Gender,
      })
      .then((res) => {
        if (res?.data?.message.length === 0) {
          setPayload({
            ...payload,
            AmrAccess: res?.data?.amrAccess,
          });
        } else {
          setPayload({
            ...payload,
            MethodName: res?.data?.message[0]?.MethodName,
            RoundOff: res?.data?.message[0]?.RoundOff,
            LabObservationID: res?.data?.message[0]?.LabObservationID,
            AmrAccess: res?.data?.amrAccess,
          });
        }

        const data = res?.data?.message;
        let val = data.map((ele) => {
          return {
            ...ele,
            ReflexMin: ele?.reflexmin,
            ReflexMax: ele?.reflexmax,
          };
        });

        setTableData(
          res?.data?.message.length > 0
            ? val
            : [
              {
                ...InestigationRange,
                InvestigationID: payload?.InvestigationID,
                LabObservationID: payload?.InvestigationID,
                Gender: payload?.Gender,
                MacID: payload?.MacID,
                RangeType: payload?.RangeType,
                CentreID: payload?.CentreID,
                FromAge: "0",
              },
            ],
        );
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Error Occured",
        );
      });
  };

  useEffect(() => {
    if (
      payload?.CentreID !== "" &&
      payload?.Gender !== "" &&
      payload?.MacID !== "" &&
      payload?.RangeType !== ""
    ) {
      fetch();
    }
  }, [payload?.CentreID, payload?.Gender, payload?.MacID, payload?.RangeType]);

  const getAccessCentres = () => {
    axiosInstance
      .get("Centre/getAccessCentres")
      .then((res) => {
        let data = res.data.message;
        let CentreDataValue = data.map((ele) => {
          return {
            value: ele.CentreID,
            label: ele.Centre,
          };
        });
        setCentreData(CentreDataValue);
      })
      .catch((err) => console.log(err));
  };
  const getMachine = () => {
    axiosInstance
      .get("RE/BindMachineGroup")
      .then((res) => {
        let data = res.data.message;
        let Machine = data.map((ele) => {
          return {
            value: ele.MachineId,
            label: ele.MachineName,
          };
        });
        setMachine(Machine);
      })
      .catch((err) => console.log(err));
  };
  const getRangeType = () => {
    axiosInstance
      .post("Global/getGlobalData", {
        Type: "RangeType",
      })
      .then((res) => {
        let data = res.data.message;
        let RangeType = data.map((ele) => {
          return {
            value: ele.FieldDisplay,
            label: ele.FieldDisplay,
          };
        });
        setRangeType(RangeType);
      })
      .catch((err) => console.log(err));
  };
  const getDropDownData = (name) => {
    axiosInstance
      .post("Global/getGlobalData", { Type: name })
      .then((res) => {
        let data = res.data.message;
        let value = data.map((ele) => {
          return {
            value: ele.FieldDisplay,
            label: ele.FieldDisplay,
          };
        });
        switch (name) {
          case "Gender":
            setGender(value);
            break;
        }
      })
      .catch((err) => console.log(err));
  };

  const handleSelectChange = (event) => {
    const { name, value } = event.target;
    if (name == "RoundOff") {
      setPayload({ ...payload, [name]: value });
      const data = tableData.map((item) => {
        return { ...item, RoundOff: value };
      });
      setTableData(data);
    } else {
      setPayload({ ...payload, [name]: value });
    }
  };

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setPayload({
      ...payload,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    });
  };

  const Match = () => {
    let match = false;
    let FieldError = {
      index: "",
      minValue: "",
      maxValue: "",
    };

    for (var i = 0; i < tableData.length; i++) {
      if (
        parseFloat(tableData[i].ToAge) <= parseFloat(tableData[i].FromAge) ||
        tableData[i].ToAge === ""
      ) {
        match = true;
        FieldError = { index: i, minValue: "ToAge", maxValue: "" };
        break;
      } else if (
        parseFloat(
          tableData[i].MaxReading === "" ? 1000000 : tableData[i].MaxReading,
        ) <
        parseFloat(
          tableData[i].MinReading === "" ? -1000000 : tableData[i].MinReading,
        )
      ) {
        match = true;
        FieldError = {
          index: i,
          minValue: "MinReading",
          maxValue: "MaxReading",
        };
        break;
      } else if (
        parseFloat(
          [""].includes(tableData[i].MaxCritical)
            ? 1000000
            : tableData[i].MaxCritical,
        ) <
        parseFloat(
          [""].includes(tableData[i].MinCritical)
            ? -1000000
            : tableData[i].MinCritical,
        )
      ) {
        match = true;
        FieldError = {
          index: i,
          minValue: "MinCritical",
          maxValue: "MaxCritical",
        };
        break;
      } else if (
        parseFloat(
          [""].includes(tableData[i].AMRMax) ? 1000000 : tableData[i].AMRMax,
        ) <
        parseFloat(
          [""].includes(tableData[i].AMRMin) ? -1000000 : tableData[i].AMRMin,
        )
      ) {
        match = true;
        FieldError = {
          index: i,
          minValue: "MinCritical",
          maxValue: "MaxCritical",
        };
        break;
      } else if (
        parseFloat(
          [""].includes(tableData[i].AutoApprovedMax)
            ? 1000000
            : tableData[i].AutoApprovedMax,
        ) <
        parseFloat(
          [""].includes(tableData[i].AutoApprovedMin)
            ? -1000000
            : tableData[i].AutoApprovedMin,
        )
      ) {
        match = true;
        FieldError = {
          index: i,
          minValue: "AutoApprovedMin",
          maxValue: "AutoApprovedMax",
        };
        break;
      }
    }
    setValid(FieldError);
    return match;
  };

  // const Empty = () => {
  //   for (let i of tableData) {
  //     if (
  //       i.MinReading == "" ||
  //       i.MaxReading == "" ||
  //       i.MinReading == "-" ||
  //       i.MaxReading == "-"
  //     ) {
  //       return false;
  //     }
  //   }

  //   return true;
  // };

  function validateRanges() {
    for (let i = 0; i < tableData.length; i++) {
      const item = tableData[i];

      if (
        (item.MinCritical === "" && item.MaxCritical !== "") ||
        (item.MinCritical !== "" && item.MaxCritical === "")
      ) {
        return false;
      }
      if (
        (item.AMRMax === "" && item.AMRMin !== "") ||
        (item.AMRMax !== "" && item.AMRMin === "")
      ) {
        return false;
      }
      if (item?.AMRMax == "-" || item?.AMRMin == "-") {
        return false;
      }

      if (
        (item.AutoApprovedMin === "" && item.AutoApprovedMax !== "") ||
        (item.AutoApprovedMin !== "" && item.AutoApprovedMax === "")
      ) {
        return false;
      }
      if (item?.MinCritical == "-" || item?.MaxCritical == "-") {
        return false;
      }
      if (item?.AutoApprovedMax == "-" || item?.AutoApprovedMin == "-") {
        return false;
      }
    }
    return true;
  }

  const handleAddRow = (data) => {
    const match = Match();
    const range = validateRanges();
    // const check = Empty();

    const fromAgeDisplay = data?.FromAge_Display || 0;
    const toAgeDisplay = data?.ToAge_Display || 0;


    if (toAgeDisplay <= fromAgeDisplay) {
      toast.error(`ToAge (${toAgeDisplay}) must be greater than FromAge (${fromAgeDisplay})`);
      return;
    }

    if (!match && range) {
      const unit = data?.ToAge_DisplayType || data?.FromAge_DisplayType || "Days";
      const prevToAgeDisplay = Number(data?.ToAge_Display) || 0;

      const newRow = {
        ...InestigationRange,
        InvestigationID: payload?.InvestigationID,
        LabObservationID: payload?.InvestigationID,
        Gender: payload?.Gender,
        MacID: payload?.MacID,
        RangeType: payload?.RangeType,
        CentreID: payload?.CentreID,
        FromAge_Display: prevToAgeDisplay + 1,
        FromAge_DisplayType: unit,
        FromAge: convertAgeToDays(prevToAgeDisplay + 1, unit, "FromAge"),
        ToAge_Display: 0,
        ToAge_DisplayType: unit,
        ToAge: 0,
      };

      setTableData([
        ...tableData,
        {
          ...InestigationRange,
          InvestigationID: payload?.InvestigationID,
          LabObservationID: payload?.InvestigationID,
          Gender: payload?.Gender,
          MacID: payload?.MacID,
          RangeType: payload?.RangeType,
          CentreID: payload?.CentreID,
          FromAge: Number(data?.ToAge) + 1,
        },
      ]);

      setTableData([...tableData, newRow]);
    } else {
      toast.error("please Enter Valid Values");
    }
  };

  const handleChangeTableData = (e, index) => {
    const { name, value } = e.target;
    const data = [...tableData];

    if (
      [
        "AutoApprovedMin",
        "AutoApprovedMax",
        "MinReading",
        "MaxReading",
        "MinCritical",
        "MaxCritical",
        "AMRMin",
        "AMRMax",
      ].includes(name)
    ) {
      if (value === "-") {
        data[index][name] = value;
      } else {
        const isValidInput =
          /^-?\d*\.?\d{0,4}$/.test(value) &&
          (value.indexOf("-") === 0 ? value.lastIndexOf("-") === 0 : true) &&
          (value.indexOf(".") === value.lastIndexOf(".") ||
            value.lastIndexOf(".") === -1) &&
          parseFloat(value) >= -1000000 &&
          parseFloat(value) <= 1000000;

        data[index][name] =
          isValidInput || value === "" ? value : data[index][name];
      }
    }
    else if (name === "FromAge") {
      data[index]["FromAge_Display"] = Number(value);
      const type = data[index]["FromAge_DisplayType"] || "Days";
      data[index]["FromAge"] = convertAgeToDays(value, type, "FromAge");
    }
    else if (name === "FromAge_DisplayType") {
      data[index]["FromAge_DisplayType"] = value;
      const displayValue = data[index]["FromAge_Display"] || data[index]["FromAge"];
      data[index]["FromAge"] = convertAgeToDays(displayValue, value, "FromAge");
    }
    else if (name === "ToAge") {
      if (value === "" || value === null || value === undefined) {
        data[index]["ToAge_Display"] = "";
        data[index]["ToAge"] = 0;
      } else {
        const numValue = Number(value);
        const fromAgeDisplay = data[index]["FromAge_Display"] || 0;
        const currentType = data[index]["ToAge_DisplayType"] || "Days";

        if (currentType === "Months" && numValue > 12) {
          toast.error("ToAge in Months cannot be more than 12");
          return;
        }

        data[index]["ToAge_Display"] = numValue;
        const type = data[index]["ToAge_DisplayType"] || "Days";
        data[index]["ToAge"] = convertAgeToDays(numValue, type, "ToAge");
      }
    }
    else if (name === "ToAge_DisplayType") {
      const oldType = data[index]["ToAge_DisplayType"];
      data[index]["ToAge_DisplayType"] = value;
      const displayValue = data[index]["ToAge_Display"] || data[index]["ToAge"];
      data[index]["ToAge"] = convertAgeToDays(displayValue, value, "ToAge");

      // If changing first row's ToAge type, update all rows' types + days
      if (index === 0) {
        const firstFromDisplay = data[0]["FromAge_Display"] ?? 0;
        data[0]["FromAge_DisplayType"] = value;
        data[0]["FromAge"] = convertAgeToDays(firstFromDisplay, value, "FromAge");

        for (let i = 1; i < data.length; i++) {
          data[i]["FromAge_DisplayType"] = value;
          data[i]["ToAge_DisplayType"] = value;

          const fromDisplayValue = data[i]["FromAge_Display"] || 0;
          data[i]["FromAge"] = convertAgeToDays(fromDisplayValue, value, "FromAge");

          const toDisplayValue = data[i]["ToAge_Display"] || 0;
          data[i]["ToAge"] = convertAgeToDays(toDisplayValue, value, "ToAge");
        }
      }
    } else {
      data[index][name] = value;
    }

    if (name === "ToAge" || name === "ToAge_DisplayType") {

      const unit = data[0]?.ToAge_DisplayType || data[0]?.FromAge_DisplayType || "Days";

      // Row 0: always starts from 0
      data[0].FromAge_DisplayType = unit;
      data[0].FromAge_Display = 0;
      data[0].FromAge = 0; // 0 days for starting row

      // Sync all subsequent rows
      for (let i = 1; i < data.length; i++) {
        const prevRow = data[i - 1];

        // Current row's FromAge = Previous row's ToAge
        const prevToDisplay = (Number(prevRow?.ToAge_Display) ?? 0) + 1;
        const prevToDays = Number(prevRow?.ToAge) ?? 0;

        data[i].FromAge_DisplayType = unit;
        data[i].FromAge_Display = prevToDisplay;
        data[i].FromAge = convertAgeToDays(prevToDisplay, unit, "FromAge");; // Use the exact days from previous ToAge

        // If ToAge_DisplayType not set, set it to match unit
        if (!data[i].ToAge_DisplayType) {
          data[i].ToAge_DisplayType = unit;
        }
      }
    }

    console.log("hello Final tableData:", data);
    setTableData(data);
  };

  const stringtonum = (tableData) => {
    const keysToConvert = [
      "AutoApprovedMin",
      "AutoApprovedMax",
      "MinReading",
      "MaxReading",
      "MinCritical",
      "MaxCritical",
    ];

    tableData.forEach((item) => {
      keysToConvert.forEach((key) => {
        if (item[key] !== undefined && item[key] !== "" && typeof item[key] === "string") {
          item[key] = parseFloat(item[key]);
        }
      });
    });
    return tableData;
  };

  const getErrors = (tableData) => {
    let err = [];

    for (let i = 0; i < tableData?.length; i++) {
      err.push({});
      // if (tableData[i].MinReading === "" || tableData[i].MinReading === "-") {
      //   err[i] = { ...err[i], MinReading: true };
      // }
      // if (tableData[i].MaxReading === "" || tableData[i].MaxReading === "-") {
      //   err[i] = { ...err[i], MaxReading: true };
      // }
      if (
        parseFloat(tableData[i].ToAge) <= parseFloat(tableData[i].FromAge) ||
        tableData[i].ToAge === ""
      ) {
        err[i] = { ...err[i], ToAge: true };
      }
      if (
        parseFloat(
          tableData[i].MaxReading === "" ? 1000000 : tableData[i].MaxReading,
        ) <
        parseFloat(
          tableData[i].MinReading === "" ? -1000000 : tableData[i].MinReading,
        )
      ) {
        err[i] = {
          ...err[i],
          MinReading: true,
          MaxReading: true,
        };
      }
      if (
        parseFloat(tableData[i].AMRMax === "" ? 1000000 : tableData[i].AMRMax) <
        parseFloat(tableData[i].AMRMin === "" ? -1000000 : tableData[i].AMRMin)
      ) {
        err[i] = {
          ...err[i],
          AMRMax: true,
          AMRMin: true,
        };
      }
      if (
        parseFloat(
          [""].includes(tableData[i].MaxCritical)
            ? 1000000
            : tableData[i].MaxCritical,
        ) <
        parseFloat(
          [""].includes(tableData[i].MinCritical)
            ? -1000000
            : tableData[i].MinCritical,
        )
      ) {
        err[i] = { ...err[i], MaxCritical: true, MinCritical: true };
      }
      if (
        parseFloat(
          [""].includes(tableData[i].AutoApprovedMax)
            ? 1000000
            : tableData[i].AutoApprovedMax,
        ) <
        parseFloat(
          [""].includes(tableData[i].AutoApprovedMin)
            ? -1000000
            : tableData[i].AutoApprovedMin,
        )
      ) {
        err[i] = { ...err[i], AutoApprovedMax: true, AutoApprovedMin: true };
      }

      if (
        (tableData[i].MinCritical === "" && tableData[i].MaxCritical !== "") ||
        (tableData[i].MinCritical !== "" && tableData[i].MaxCritical === "")
      ) {
        if (tableData[i].MinCritical == "") {
          err[i] = { ...err[i], MinCritical: true };
        }
        if (tableData[i].MaxCritical === "") {
          err[i] = { ...err[i], MaxCritical: true };
        }
      }
      if (
        (tableData[i].AMRMin === "" && tableData[i].AMRMax !== "") ||
        (tableData[i].AMRMin !== "" && tableData[i].AMRMax === "")
      ) {
        if (tableData[i].AMRMin == "") {
          err[i] = { ...err[i], AMRMin: true };
        }
        if (tableData[i].AMRMax === "") {
          err[i] = { ...err[i], AMRMax: true };
        }
      }

      if (
        (tableData[i].AutoApprovedMin === "" &&
          tableData[i].AutoApprovedMax !== "") ||
        (tableData[i].AutoApprovedMin !== "" &&
          tableData[i].AutoApprovedMax === "")
      ) {
        if (tableData[i].AutoApprovedMin == "") {
          err[i] = { ...err[i], AutoApprovedMin: true };
        }
        if (tableData[i].AutoApprovedMax === "") {
          err[i] = { ...err[i], AutoApprovedMax: true };
        }
      }
      if (
        tableData[i]?.MinCritical == "-" ||
        tableData[i]?.MaxCritical == "-"
      ) {
        if (tableData[i].MinCritical == "-") {
          err[i] = { ...err[i], MinCritical: true };
        }
        if (tableData[i].MaxCritical === "-") {
          err[i] = { ...err[i], MaxCritical: true };
        }
      }
      if (tableData[i]?.AMRMax == "-" || tableData[i]?.AMRMin == "-") {
        if (tableData[i].AMRMin == "-") {
          err[i] = { ...err[i], AMRMin: true };
        }
        if (tableData[i].AMRMax === "-") {
          err[i] = { ...err[i], AMRMax: true };
        }
      }
      if (
        tableData[i]?.AutoApprovedMax == "-" ||
        tableData[i]?.AutoApprovedMin == "-"
      ) {
        if (tableData[i].AutoApprovedMax == "-") {
          err[i] = { ...err[i], AutoApprovedMax: true };
        }
        if (tableData[i].AutoApprovedMin === "-") {
          err[i] = { ...err[i], AutoApprovedMin: true };
        }
      }
    }

    return err;
  };

  const handleSubmit = () => {
    setLoad(true);

    const valid = Match();
    // const emp = Empty();
    const check = validateRanges();
    const Error = getErrors(tableData);
    setErrors(Error);
    // if (emp) {
    if (!valid) {
      if (check) {
        const labobservation_rangeVM = tableData.map((item) => ({
          ...item,
          FromAge_Display: item?.FromAge_Display || 0,
          FromAge_DisplayType: item?.FromAge_DisplayType || "Days",
          ToAge_Display: item?.ToAge_Display || 0,
          ToAge_DisplayType: item?.ToAge_DisplayType || "Days",
          isActive: 1,
          IsActive: 1,
        }));
        console.log("labobservation_rangeVM", labobservation_rangeVM)
        // return;
        axiosInstance
          .post("Investigations/SaveRanges", {
            CentreID: payload?.CentreID,
            Gender:
              payload?.Gender === "TransGender" ? "Male" : payload.Gender,
            AbNormal: payload?.AbNormal,
            ForAllCentre: payload?.ForAllCentre,
            InvestigationID: payload?.InvestigationID,
            MacID: payload?.MacID,
            MethodName: payload?.MethodName ?? "",
            SaveToBothGender: payload?.SaveToBothGender,
            labobservation_rangeVM: stringtonum(labobservation_rangeVM),
          })
          .then((res) => {
            toast.success(res?.data?.message);
            setLoad(false);
            fetch();
          })
          .catch((err) => {
            toast.error(
              err?.response?.data?.message
                ? err?.response?.data?.message
                : "Error Occured",
            );
            setLoad(false);
          });
      } else {
        toast.error("Enter Valid Values");
        setLoad(false);
      }
    } else {
      toast.error("Please Enter Valid Values");
      setLoad(false);
    }
    // } else {
    //   toast.error("Enter Min and Max Reading");
    //   setLoad(false);
    // }
  };

  useEffect(() => {
    getAccessCentres();
    getMachine();
    getRangeType();
    getDropDownData("Gender");
  }, []);

  return (
    <>
      <Accordion
        name={`Test Name : ${state?.data}`}
        defaultValue={true}
        isBreadcrumb={true}
        backButton={true}
      >
        <div className="row pt-2 pl-2 pr-2">
          <div className="col-12 col-sm-6 col-md-2 my-1">
            <SelectBox
              options={CentreData}
              onChange={handleSelectChange}
              name="CentreID"
              id="Centre Name"
              lable="Centre Name"
              selectedValue={payload?.CentreID}
            />
          </div>
          <div className="col-12 col-sm-6 col-md-2 my-1">
            <SelectBox
              options={Machine}
              onChange={handleSelectChange}
              name="MacID"
              id="Machine"
              lable="Machine Group"
              selectedValue={payload?.MacID}
            />
          </div>
          <div className="col-12 col-sm-6 col-md-2 my-1">
            <SelectBox
              options={Gender.filter((ele) => ele.value !== "Both")}
              onChange={handleSelectChange}
              name="Gender"
              id="Gender"
              lable="Gender"
              selectedValue={payload?.Gender}
            />
          </div>
          <div className="col-12 col-sm-6 col-md-2 my-1">
            <SelectBox
              options={RangeType}
              onChange={handleSelectChange}
              id="RangeType"
              lable="RangeType"
              name="RangeType"
              selectedValue={payload?.RangeType}
            />
          </div>
          <div className="col-12 col-sm-6 col-md-2 my-1">
            <Input
              placeholder=" "
              lable="MethodName"
              id="MethodName"
              name="MethodName"
              value={payload?.MethodName}
              type="text"
              onChange={handleChange}
            />
          </div>
          <div className="col-12 col-sm-6 col-md-2 my-1 d-none">
            <SelectBox
              id="RoundOff"
              lable="RoundOff"
              options={RoundOff}
              name="RoundOff"
              onChange={handleSelectChange}
              selectedValue={payload?.RoundOff}
            />
          </div>
        </div>
        <div className="row pt-2 pl-2 pr-2">
          <div className="col-sm-2 mt-1 d-flex">
            <div className="mt-1">
              <input
                name="SaveToBothGender"
                type="checkbox"
                checked={payload?.SaveToBothGender ? 1 : 0}
                onChange={handleChange}
              />
            </div>
            <label className="ml-2">{t("SaveToBothGender")}</label>
          </div>
          <div className="col-sm-2 mt-1 d-flex">
            <div className="mt-1">
              <input
                name="AbNormal"
                type="checkbox"
                checked={payload?.AbNormal ? 1 : 0}
                onChange={handleChange}
              />
            </div>
            <label className="ml-2">{t("AbNormal")}</label>
          </div>
          <div className="col-sm-2 mt-1 d-flex">
            <div className="mt-1">
              <input
                name="ForAllCentre"
                type="checkbox"
                checked={payload?.ForAllCentre ? 1 : 0}
                onChange={handleChange}
              />
            </div>
            <label className="ml-2"> {t("For All Centre")}</label>
          </div>
        </div>
        <>
          <div className="row p-2 ">
            <div className="col-12">
              <Tables>
                <thead className="cf" style={{minWidth: "120vw"}}>
                  <tr>
                    <th style={{ minWidth: '50px' }}>{t("S.No")}</th>
                    <th style={{ minWidth: '50px' }}>{t("Delete")}</th>
                    <th className="text-center" style={{ minWidth: '200px' }}>{t("FromAge")}</th>
                    <th className="text-center" style={{ minWidth: '200px' }}>{t("ToAge")}</th>
                    <th style={{ minWidth: '80px' }}>{t("MinReading")}</th>
                    <th style={{ minWidth: '80px' }}>{t("MaxReading")}</th>
                    <th style={{ minWidth: '80px' }}>{t("MinCritical")}</th>
                    <th style={{ minWidth: '80px' }}>{t("Maxcritical")}</th>
                    <th style={{ minWidth: '80px' }}>{t("AMRMin")}</th>
                    <th style={{ minWidth: '80px' }}>{t("AMRMax")}</th>
                    <th style={{ minWidth: '80px' }}>{t("AutoAppMin")}</th>
                    <th style={{ minWidth: '80px' }}>{t("AutoAppMax")}</th>
                    <th style={{ minWidth: '80px' }}>{t("Unit")}</th>
                    <th style={{ minWidth: '80px' }}>{t("DisplayReading")}</th>
                    <th style={{ minWidth: '80px' }}>{t("DefaultReading")}</th>
                    <th style={{ minWidth: '80px' }}>{t("AbnormalReading")}</th>
                    <th style={{ minWidth: '80px' }}>{t("AddRow")}</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData?.map((data, index) => (
                    <tr key={index}>
                      <td data-title={t("S.No")}>{index + 1}&nbsp;</td>
                      <td data-title={t("Delete")}>
                        {index + 1 === tableData?.length && index !== 0 && (
                          // <DeleteButton
                          //   name="disableData"
                          //   onClick={() => handleDelete(index)}
                          // />
                          <FaTrash name="disableData" onClick={() => handleDelete(index)} color="red"/>
                        )}
                        &nbsp;
                      </td>
                      <td data-title={t("FromAge")}>
                        <div style={{
                          display: 'flex',
                          gap: '8px',
                          alignItems: 'flex-start',
                          flexWrap: 'nowrap'
                        }}>
                          <Input
                            type="number"
                            className="form-control ui-autocomplete-input input-sm"
                            value={data?.FromAge_Display || ""}
                            readOnly={true}
                            name="FromAge"
                            placeholder={"0"}
                            onInput={(e) => number(e, 5)}
                            onChange={(e) => handleChangeTableData(e, index)}
                          />
                          <select
                            className="form-control input-sm"
                            name="FromAge_DisplayType"
                            value={data?.FromAge_DisplayType || "Days"}
                            onChange={(e) => handleChangeTableData(e, index)}
                            disabled={true}
                          >
                            <option value="Days">Days</option>
                            <option value="Months">Months</option>
                            <option value="Years">Years</option>
                          </select>
                        </div>
                      </td>
                      <td data-title={t("ToAge(days)")}>
                        <div style={{
                          display: 'flex',
                          gap: '8px',
                          alignItems: 'flex-start',
                          flexWrap: 'nowrap'
                        }}>
                          <Input
                            type="number"
                          className={`form-control ui-autocomplete-input input-sm  ${
                            errors[index]?.ToAge ? "wrange" : ""
                              }`}
                            readOnly={index + 1 === tableData?.length ? false : true}
                            value={data?.ToAge_Display || ""}
                            onInput={(e) => number(e, 5)}
                            name="ToAge"
                            max={data?.ToAge_DisplayType === "Months" ? "12" : undefined}
                            onChange={(e) => handleChangeTableData(e, index)}
                          />
                          <select
                            className="form-control input-sm"
                            name="ToAge_DisplayType"
                            value={data?.ToAge_DisplayType || "Days"}
                            onChange={(e) => handleChangeTableData(e, index)}
                            disabled={index !== 0 || tableData.length > 1}
                          >
                            <option value="Days">Days</option>
                            <option value="Months">Months</option>
                            <option value="Years">Years</option>
                          </select>
                        </div>
                      </td>
                      <td data-title={t("MinReading")}>
                        <Input
                          type="text"
                          className={`form-control ui-autocomplete-input input-sm  ${
                            errors[index]?.MinReading ? "wrange" : ""
                            }`}
                          value={data?.MinReading}
                          name="MinReading"
                          onChange={(e) => handleChangeTableData(e, index)}
                        />
                      </td>
                      <td data-title={t("MaxReading")}>
                        <Input
                          type="text"
                          className={`form-control ui-autocomplete-input input-sm ${
                            errors[index]?.MaxReading ? "wrange" : ""
                            }`}
                          value={data?.MaxReading}
                          name="MaxReading"
                          onChange={(e) => handleChangeTableData(e, index)}
                        />
                      </td>
                      <td data-title={t("MinCritical")}>
                        <Input
                          type="text"
                          className={`form-control ui-autocomplete-input input-sm  ${
                            errors[index]?.MinCritical ? "wrange" : ""
                            }`}
                          value={data?.MinCritical}
                          name="MinCritical"
                          onChange={(e) => handleChangeTableData(e, index)}
                        />
                      </td>
                      <td data-title={t("MaxCritical")}>
                        <Input
                          type="text"
                          className={`form-control ui-autocomplete-input input-sm ${
                            errors[index]?.MaxCritical ? "wrange" : ""
                            } `}
                          value={data?.MaxCritical}
                          name="MaxCritical"
                          onChange={(e) => handleChangeTableData(e, index)}
                        />
                      </td>
                      <td data-title={t("AMR-min")}>
                        <Input
                          type="text"
                          className={`form-control ui-autocomplete-input input-sm ${
                            errors[index]?.AMRMin ? "wrange" : ""
                            } `}
                          value={data?.AMRMin}
                          disabled={payload?.AmrAccess == 1 ? false : true}
                          name="AMRMin"
                          onChange={(e) => handleChangeTableData(e, index)}
                        />
                      </td>
                      <td data-title={t("AMR-max")}>
                        <Input
                          type="text"
                          className={`form-control ui-autocomplete-input input-sm ${
                            errors[index]?.AMRMax ? "wrange" : ""
                            } `}
                          value={data?.AMRMax}
                          disabled={payload?.AmrAccess == 1 ? false : true}
                          name="AMRMax"
                          onChange={(e) => handleChangeTableData(e, index)}
                        />
                      </td>

                      <td data-title={t("AutoAppMin")}>
                        <Input
                          type="text"
                          className={`form-control ui-autocomplete-input input-sm   ${
                            errors[index]?.AutoApprovedMin ? "wrange" : ""
                            }`}
                          value={data?.AutoApprovedMin}
                          name="AutoApprovedMin"
                          onChange={(e) => handleChangeTableData(e, index)}
                        />
                      </td>
                      <td data-title={t("AutoAppMax")}>
                        <Input
                          type="text"
                          className={`form-control ui-autocomplete-input input-sm ${
                            errors[index]?.AutoApprovedMax ? "wrange" : ""
                            }`}
                          value={data?.AutoApprovedMax}
                          name="AutoApprovedMax"
                          onChange={(e) => handleChangeTableData(e, index)}
                        />
                      </td>
                      <td data-title={t("Unit")}>
                        <Input
                          type="text"
                          className="form-control ui-autocomplete-input input-sm"
                          value={data?.ReadingFormat}
                          name="ReadingFormat"
                          onChange={(e) => handleChangeTableData(e, index)}
                        />
                      </td>
                      <td data-title={t("DisplayReading")}>
                        <textarea
                          type="text"
                          max={2}
                          // className="form-control ui-autocomplete-input input-sm"
                          value={data?.DisplayReading}
                          name="DisplayReading"
                          onChange={(e) => handleChangeTableData(e, index)}
                        />
                      </td>
                      <td data-title={t("DefaultReading")}>
                        <Input
                          type="text"
                          className="form-control ui-autocomplete-input input-sm "
                          value={data?.DefaultReading}
                          name="DefaultReading"
                          onChange={(e) => handleChangeTableData(e, index)}
                        />
                      </td>
                      <td data-title={t("AbnormalReading")}>
                        <Input
                          type="number"
                          className="form-control ui-autocomplete-input input-sm"
                          value={data?.AbnormalValue}
                          name="AbnormalValue"
                          onChange={(e) => handleChangeTableData(e, index)}
                        />
                      </td>
                      <td data-title={t("AddRow")}>
                        {index + 1 === tableData?.length && (
                          <button
                            className="btn btn-info btn-block btn-sm"
                            onClick={() => handleAddRow(data)}
                          >
                            {t("Select")}
                          </button>
                        )}
                        &nbsp;
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Tables>
            </div>
          </div>
          <div className="row pt-2 pl-2 pr-2 pb-2">
            {load ? (
              <Loading />
            ) : (
              <div className="col-sm-1">
                <SaveButton
                  text={"Save"}
                  type="submit"
                  className="btn-block"
                  onClick={handleSubmit}
                />
              </div>
            )}
            <div className="col-sm-1">
              {state?.flag ? (
                <Link
                  to="/Investigations"
                  state={{
                    other: {
                      button: "Update",
                      pageName: "Edit",
                      showButton: true,
                    },
                    url1: state?.url1,
                    url: "Investigations/UpdateInvestigation",
                  }}
                >
                  <CustomButton
                    text={"Back"}
                    icon={"back"}
                  />
                </Link>
              ) : (
                <button
                  className="btn btn-block btn-primary btn-sm"
                  onClick={() => navigate(-1)}
                >
                  {t("Back")}
                </button>
              )}
            </div>
          </div>
        </>
      </Accordion>
    </>
  );
};

export default InvestigationRange;
