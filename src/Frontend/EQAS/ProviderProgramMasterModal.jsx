import React, { useEffect, useState } from "react";
import Heading from "../../components/UI/Heading";
import Input from "../../components/formComponent/Input";
import DatePicker from "../../components/formComponent/DatePicker";
import FileUpload from "../ManageQuery/FileUpload";
import RadioInput from "../../components/formComponent/RadioInput";
import { Button } from "react-bootstrap";
import CustomTable from "../../components/Table/CustomTable";
import { CiCircleRemove, CiEdit } from "react-icons/ci";
import "./EQASProviderMaster.css";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { useTranslation } from "react-i18next";
import FilterInput from "../../components/Filter/FilterInput";
import { Tooltip } from "primereact/tooltip";
import greenExcelIcon from "../../assets/image/xlsLogo.png";
import { ExportToExcel, validateRequiredFields } from "../../utils/helpers";
import { CustomButton } from "../../components/UI/CustomButton";
import './EqasGlobal.css';
import CancelButton from "../../components/UI/CancelButton";
import ExportFile from "../../components/formComponent/ExportFile";
import { notify } from "../../utils/utils";
import { FaTrash } from "react-icons/fa";
import { axiosInstance } from "../../utils/axiosInstance";
import { apiUrls } from "../../utils/apiUrls";
import { toast } from "react-toastify";
import MultiSelectComp from "../../components/formComponent/MultiSelectComp";

const tableHeaders = [
  { header: "Sr. No", field: "id", width: "5%" },
  { header: "Program Name", field: "programName", width: "20%" },
  { header: "Rate", field: "rate", width: "5%" },
  { header: "Test", field: "testName", width: "20%" },
  { header: "Created Date", field: "createdOn", width: "10%" },
  { header: "Created By", field: "createdBy", width: "10%" },
  { header: "Edit", field: "action", width: "7%" },
  { header: "Remove", field: "remove", width: "8%" },
];

const ProviderProgramMasterModal = ({ selectedID }) => {
  console.log("selectedID", selectedID);
  const [t] = useTranslation();
  const [filterTableData, setFilterTableData] = useState([]);
  const [filterInputValue, setFilterInputValue] = useState("");
  const [eqasProviderData, setEqasProviderData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [isRateEnabled, setIsRateEnabled] = useState(true);
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
  const [programID, setProgramID] = useState(0);
  const [errors, setErrors] = useState({});
  const [departmentList, setDepartmentList] = useState([]);
  const [isEditing, setIsEditing] = useState(false); 
  const [editRowId, setEditRowId] = useState("");
  const [deletedIds, setDeletedIds] = useState([]);
  const [dropdownlist, setDropdownlist] = useState({
    testList: []
  })
  const [payload, setPayload] = useState({
    programName: "",
    rate: "",
    age: "",
    gender: "",
    daysInResult: "",
    department: "",
    departmentName: "",
    test: [],
    frequency: "",
  });

  const tableAddHeaders = [
    { header: "Sr. No.", field: "srNo", width: "6%" },
    { header: "Program Name", field: "programName" },
    { header: "Rate", field: "rate" },
    { header: "Department", field: "department" },
    { header: "Test ID", field: "testID" },
    { header: "Test Name", field: "testName" },
    { header: "Delete", field: "action" },
  ];

  // handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "programName" && value === "") {
      setIsRateEnabled(true);
    }
    setPayload((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectMultiChange = (name, value) => {
    setPayload(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleReactChange = (name, e) => {

    if (name === "department") {
      getTest(e?.value);
      setPayload((prev) => ({ ...prev, [name]: e?.value, departmentName : e?.label }));
    }
    else{
      setPayload((prev) => ({ ...prev, [name]: e?.value }));
    }
    
  };

  const handleFileResponse = (file) => {
    setPayload((prev) => ({
      ...prev,
      documents: file || {},
    }));
  };

  const handleReset = () => {
    setPayload({
      programName: "",
      rate: "",
      age: "",
      gender: "",
      daysInResult: "",
      department: "",
      departmentName: "",
      test: [],
      frequency: "",
    });
    setFilterInputValue("");
    setFilterTableData([]);
    setTableData([]);
    setErrors({});
    setIsRateEnabled(true);
    setIsEditing(false);
    setDeletedIds([]);
    setDropdownlist(prev => ({
            ...prev,
            testList: []
          }));
  };

  const handleAdd = () => {
    const requiredFields = [
      "programName",
      "rate",
      "department",
      "age",
      "gender",
      "daysInResult",
      "frequency",
    ];
    const errors = validateRequiredFields(payload, requiredFields);
    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      return;
    }
    if (!payload?.test || payload.test.length === 0) {
      toast?.info("Please select test !");
      return;
    }

    console.log("tableDataxx",tableData);

    const existingTestIds = new Set(
      tableData?.map(row => (row?.testLabID || (`${row?.testID}#${row?.testID}`))
    ));

    console.log("existingTestIds",existingTestIds);

    const filteredTests = payload?.test?.filter(
      testId => !existingTestIds.has(testId)
    );

    if (filteredTests?.length === 0) {
      toast.info("Selected test already added");
      return;
    }

    const startIndex = tableData?.length + 1;

    const newRows = filteredTests?.map((testId, index) => {

      const testObj = dropdownlist?.testList?.find(
        t => t?.value === testId
      );

      return {
        id: `${payload?.programName}-${testId}`,
        srNo: startIndex + index,
        programName: payload?.programName,
        rate: payload?.rate,
        testLabID: testObj?.value,
        departmentID : payload?.department?.toString(),
        department: payload?.departmentName,
        testID: testObj?.value?.split("#")[0].trim() || "",
        labObservationID: testObj?.value?.split("#")[1].trim() || "",
        testName: testObj?.label || testId,
        isNew : "1",
      };

    });

    setTableData(prev => [...prev, ...newRows]);

    console.log("newRows", newRows);
  };

  const handleSave = () => {

    const requiredFields = [
      "programName",
      "rate",
      "department",
      "age",
      "gender",
      "daysInResult",
      "frequency",
    ];
    const errors = validateRequiredFields(payload, requiredFields);
    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      return;
    }

    const savePayload = tableData?.map(row => ({
      eqasProviderID: selectedID || 0,                
      programID: 0,                     
      programName: row?.programName,
      rate: Number(row?.rate),
      departmentID: payload?.department?.toString() || "",
      departmentName: payload?.departmentName || "",
      investigationID: row?.testID || "",
      investigationName: row?.testName || "",
      labObservationID: row?.labObservationID ||  "",              
      frequency: Number(payload?.frequency) || 0,
      age: Number(payload?.age) || 0,
      gender: payload?.gender || "",
      resultWithin: payload?.daysInResult || "",
    }));

    console.log("savePayload",savePayload);
      axiosInstance
        .post(apiUrls.SaveEQASProgram, savePayload)
        .then((res) => {
          console.log("saveeqasres", res);
          if (res?.data?.success) {
            toast.success(res?.data?.message);
            getEqasProviderData();
            handleReset();
          }
        })
        .catch((err) => {
          toast.error(
            err?.response?.data?.message
              ? err?.response?.data?.message
              : "Error Occured",
          );
        })
        .finally(() => {
  
        });
    };

    const handleUpdate = () => {

      if (!tableData || tableData?.length === 0) {
        toast.info("No rows to update");
        return;
      }

      const programDataUpdates = tableData?.map(row => ({
        eqasProviderID: selectedID || 0,
        programID: Number(row?.programID) || programID || 0, 
        programName: payload?.programName || "",
        rate: Number(payload?.rate) || 0,
        departmentID: (row?.departmentID ? row?.departmentID?.toString() : payload?.department?.toString()) || "" ,
        departmentName: (row?.department ? row?.department : payload?.departmentName) || "",
        investigationID: row?.testID?.toString() || "",
        investigationName: row?.testName || "",
        labObservationID: row?.labObservationID || "", 
        frequency: Number(payload?.frequency) || 0,
        age: Number(payload?.age) || 0,
        gender: payload?.gender || "",
        resultWithin: payload?.daysInResult?.toString() || "",
        isNew: row?.isNew || "0",
      }));

      const savePayload = {
        programDataUpdates,
         delItemId: deletedIds.join(","),
      };

      console.log("save payload",savePayload);

      axiosInstance
        .post(apiUrls.UpdateDataEQASProgram, savePayload)
        .then((res) => {
          console.log("updateres", res);
          if (res?.data?.success) {
            toast.success(res?.data?.message);
            getEqasProviderData();
            handleReset();
            setIsEditing(false);
          }
        })
        .catch((err) => {
          toast.error(
            err?.response?.data?.message
              ? err?.response?.data?.message
              : "Error Occured",
          );
        })
        .finally(() => {
  
        });
    };

  const onRowEdit = (row) => {
    console.log("row",row);
    getEqasProgram(row?.ProgramID?.toString());
    setProgramID(row?.ProgramID);
    setDropdownlist(prev => ({
            ...prev,
            testList: []
          }));
    
  };

  const handleDelete = (row) =>{
    axiosInstance
        .post(apiUrls.DeleteEQASProgram, {
          programId : row?.ProgramID?.toString() || ""
        })
        .then((res) => {
          console.log("deleteres", res);
          if (res?.data?.success) {
            toast.success(res?.data?.message);
            getEqasProviderData();
            handleReset();       
          }
        })
        .catch((err) => {
          toast.error(
            err?.response?.data?.message
              ? err?.response?.data?.message
              : "Error Occured",
          );
        })
        .finally(() => {
  
        });
  }

  // search/filter function
  const handleFilterInputChange = (e) => {
    const value = e.target.value.toLowerCase();
    setFilterInputValue(value);

    const filtered = programData?.filter((row) =>
      Object.keys(row).some((key) =>
        String(row[key]).toLowerCase().includes(value)
      )
    );
    setFilterTableData(filtered);
  };

  const genderList = [
    { label: "Male", value: "Male" },
    { label: "Female", value: "Female" },
  ];

  console.log("Payload:", payload);

  const getEqasProviderData = () => {

    axiosInstance
      .post(apiUrls?.SearchRecords, {
        eqasProviderID: selectedID?.toString(),
      }
      )
      .then((res) => {
        console.log("searcheqasres", res);
        if (res?.data?.success) {
          setEqasProviderData(res?.data?.data || []);
        } else {
          toast.error(res?.data?.message || "Error fetching data");
        }
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Error Occured",
        );
      })
      .finally(() => {

      });
  };


  const getEqasProgram = (id = "") => {

    axiosInstance
      .post(apiUrls?.SearchRecordsProgram, {
        programId: id,
      })
      .then((res) => {
        console.log("searcheqasprogram", res);
        if (res?.data?.success) {
          const data = res?.data?.data;

          const tableRows = data?.map((row, index) => ({
            id: row?.EqasProviderID,        
            srNo: index + 1,               
            programName: row?.ProgramName,
            programID: row?.ProgramID,
            labObservationID: row?.LabObservationID,
            rate: row?.Rate,
            department: row?.DepartmentName,
            departmentID: row?.DepartmentID, 
            testID: row?.InvestigationID,
            testName: row?.InvestigationName,
            frequency: row?.Frequency,
            age: row?.Age,
            gender: row?.Gender,
            resultWithin: row?.ResultWithin,
            delID: row?.Id,
          }));

          setTableData(tableRows); 
          setIsEditing(true);

          if (data && data.length > 0) {
            const firstRow = data[0];
            setPayload({
              programName: firstRow?.ProgramName,
              rate: firstRow?.Rate,
              age: firstRow?.Age,
              gender: firstRow?.Gender,
              daysInResult: firstRow?.ResultWithin,
              department: "",
              departmentName: "",
              // test: data.map(d => d.investigationID),
              test: [],
              frequency: firstRow?.Frequency,
            });
          }
          
        } else {
          toast.error(res?.data?.message || "Error fetching data");
        }
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Error Occured",
        );
      })
      .finally(() => {

      });
  };

  const getDepartment = async () => {
    axiosInstance
      .get("Department/getDepartment")
      .then((res) => {
        console.log("depatres", res);
        
          const mappedDept = res?.data?.message?.map(item => ({
            label: item.Department?.trim(),
            value: item.DepartmentID,
          }));

          setDepartmentList(mappedDept);
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Error Occured",
        );
      })
      .finally(() => {

      });
  };

  const getTest = (id = "") => {
    axiosInstance
      .post(apiUrls?.GetTestsAgencyMaster, {
        department: id?.toString(),
      }
      )
      .then((res) => {
        console.log("testres", res);
        if (res?.data?.success) {
          const mappedTests = res?.data?.data?.map(item => ({
            label: item.TypeName?.trim(),
            value: item.Type_Id
          }));

          setDropdownlist(prev => ({
            ...prev,
            testList: mappedTests
          }));

          setPayload(prev => ({
            ...prev,
            test: []
          }));
        }
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Error Occured",
        );
      })
      .finally(() => {

      });
  };

  const handleRateFocus = async (e) => {
    if (isRateEnabled) {
      await checkDuplicateProgram();
    }
  };

  const handleDeleteRow = (row) => {
  // 🔹 If row already exists in DB, track delID
  if (row?.delID) {
    setDeletedIds((prev) => [...prev, row.delID]);
  }

  // 🔹 Remove from UI
  setTableData((prev) =>
    prev.filter((r) => r.delID !== row.delID)
  );
};

  const checkDuplicateProgram = async () => {

    if (!payload.programName?.trim()) {
      toast.info("Please enter Program Name first");
      return;
    }
    setIsCheckingDuplicate(true);
    axiosInstance
      .post(apiUrls?.CheckDuplicateProgramName, {
        programId: "",
        programName: payload?.programName || "",
        labId: selectedID?.toString() || "",
      }
      )
      .then((res) => {
        console.log("duplicateres", res);
        if (!res?.data?.success) {
          setIsRateEnabled(true);
       
        } else {
          setIsRateEnabled(false);
          toast.info("Duplicate Program Name");
        }
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Error Occured",
        );
      })
      .finally(() => {
        setIsCheckingDuplicate(false);
      });
  };

  useEffect(() => {
    getEqasProviderData();
  }, [selectedID]);

  useEffect(()=>{
    getDepartment();
  },[]);

  console.log("payload", payload);
  console.log("tableData",tableData);
  console.log("eqasProviderData",eqasProviderData);

  return (
    <>
      <div className="card px-2 py-2">
        <div className="row">
          <div className="col-sm-3 col-md-2 mb-1">
            <Input
              type="text"
              name="programName"
              lable="Program Name"
              id="programName"
              value={payload?.programName}
              placeholder=" "
              onChange={handleChange}
            />
            {payload?.programName === "" && (
              <span className="error-message">{errors?.programName}</span>
            )}
          </div>
          <div className="col-sm-3 col-md-1 mb-1">
            <Input
              type="text"
              name="rate"
              lable="Rate"
              id="rate"
              value={payload.rate}
              placeholder=" "
              onChange={handleChange}
              onFocus={handleRateFocus}
              disabled={!isRateEnabled}
            />
            {payload?.rate === "" && (
              <span className="error-message">{errors?.rate}</span>
            )}
          </div>
          <div className="col-sm-3 col-md-1 mb-1">
            <Input
              type="text"
              name="age"
              lable="Age in year"
              id="age"
              value={payload.age}
              placeholder=" "
              onChange={handleChange}
            />
            {payload?.age === "" && (
              <span className="error-message">{errors?.age}</span>
            )}
          </div>
          <div className="col-sm-3 col-md-2 mb-1">
            <ReactSelect
              dynamicOptions={genderList}
              name="gender"
              lable={t("Gender")}
              id="gender"
              placeholderName={"Gender"}
              removeIsClearable={false}
              value={payload.gender || null}
              onChange={handleReactChange}
              className="required-fields"
            />
            {payload?.gender === "" && (
              <span className="error-message">{errors?.gender}</span>
            )}
          </div>
          <div className="col-sm-3 col-md-2 mb-1">
            <Input
              type="text"
              name="daysInResult"
              lable="No. of days in result"
              id="daysInResult"
              value={payload.daysInResult}
              placeholder=""
              onChange={handleChange}
            />
            {payload?.daysInResult === "" && (
              <span className="error-message">{errors?.daysInResult}</span>
            )}
          </div>
          <div className="col-sm-3 col-md-2 mb-1">
            <Input
              type="text"
              name="frequency"
              lable="Frequency in month"
              id="frequency"
              value={payload.frequency}
              placeholder=""
              onChange={handleChange}
            />
            {payload?.frequency === "" && (
              <span className="error-message">{errors?.frequency}</span>
            )}
          </div>
          <div className="col-sm-3 col-md-2 mb-1">
            <ReactSelect
              dynamicOptions={departmentList}
              name="department"
              lable={t("Department")}
              isShowBorder={true}
              id="department"
              placeholderName={"Department"}
              removeIsClearable={false}
              value={payload?.department}
              onChange={handleReactChange}
              className="required-fields"
            />
            {payload?.department === "" && (
              <span className="error-message">{errors?.department}</span>
            )}
          </div>
          <div className="col-sm-3 col-md-3 mb-1">
            <MultiSelectComp
              name="test"
              className="required-fields"
              placeholder=" "
              label={t("Test")}
              onChange={handleSelectMultiChange}
              options={dropdownlist.testList}
              value={payload.test}
            />
          </div>
          <div
            style={{ gap: "6px" }}
            className="d-flex px-2 justify-content-center mb-3"
          >
            <CustomButton text="Add" icon="add" className="border-radius-15" onClick={handleAdd} />
            <CustomButton text="Reset" icon="refresh" className="border-radius-15" onClick={handleReset} />
          </div>
        </div>

        {tableData &&
          <CustomTable
            columns={tableAddHeaders}
            data={tableData?.map((row,index) => ({
              ...row,
              srNo: index + 1,
              action: (
                <FaTrash
                  // onClick={() =>{
                  //   setTableData(prev => prev?.filter(r => r?.delID !== row?.delID))
                  // }
                  // }
                  onClick={() => handleDeleteRow(row)}
                  color="red"
                  // size={20}
                  style={{ cursor: "pointer" }}
                />
              ),
            }))}
          />
        }

         {tableData && tableData.length > 0 && (!isEditing) && 
          <div className="row d-flex justify-content-center mt-1">
            <CustomButton 
            text="Save"
            icon="save" 
            className="border-radius-15" 
            onClick={handleSave} />
          </div>
        }
          {isEditing && 
          <div className="row d-flex justify-content-center mt-1">
            <CustomButton 
            text="Update"
            icon="save" 
            className="border-radius-15" 
            onClick={handleUpdate} />
          </div>
          }
        {/* } */}        
      </div>
      <Heading title={"Provider Programs"} />
      <div className="main_annoyingtable">
          <CustomTable
            columns={tableHeaders}
            data={eqasProviderData?.map((row,index) => ({
              ...row,
              id: index + 1,
              programName: row?.ProgramName,
              rate: row?.Rate,
              testName: row?.InvestigationName,
              createdOn: row?.dtEntry,
              createdBy: row?.CreatedByName,
              action: (
                <CiEdit
                  onClick={() => onRowEdit(row)}
                  color="#4549af"
                  style={{ cursor: "pointer" }}
                />
              ),
              remove: (
                <FaTrash
                  color="red"
                  style={{ cursor: "pointer" }}
                  onClick={() => handleDelete(row)}
                />
              ),
            }))}
          />
        </div>
    </>
  );
};

export default ProviderProgramMasterModal;
