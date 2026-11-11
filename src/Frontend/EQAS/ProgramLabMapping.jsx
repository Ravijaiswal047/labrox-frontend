import React, { useEffect, useState } from "react";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { useTranslation } from "react-i18next";
import Input from "../../components/formComponent/Input";
import CustomTable from "../../components/Table/CustomTable";
import { Button } from "react-bootstrap";
import FilterInput from "../../components/Filter/FilterInput";
import { SelectBoxWithCheckbox } from "../../components/formComponent/MultiSelectBox";
import Heading from "../../components/UI/Heading";
import EqasMenuList from "./EqasMenuList";
import { ViewMenu } from "../../components/SvgIcons";
import { CustomButton } from "../../components/UI/CustomButton";
import Accordion from "@app/components/UI/Accordion";
import './EqasGlobal.css';
import { FaTimes } from "react-icons/fa";
import { axiosInstance } from "../../utils/axiosInstance";
import { apiUrls } from "../../utils/apiUrls";
import { setLoading } from "../../store/reducers/loadingSlice/loadingSlice";
import { useDispatch } from "react-redux";
import Tables from "../../components/UI/customTable";
import { toast } from "react-toastify";
import { validateRequiredFields } from "../../utils/helpers";
import * as XLSX from "xlsx";
import useGlobalSearch from "../../utils/CustomHooks/useGlobalSearch";

const ProgramLabMapping = () => {
  const [t] = useTranslation();
  const [filterInputValue, setFilterInputValue] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [filterTableData, setFilterTableData] = useState([]);
  const [selectedPrograms, setSelectedPrograms] = useState([]);
  const [eqasProgramTest, setEqasProgramsTest] = useState([]);
  const [errors, setErrors] = useState({});
  const [testList, setTestList] = useState([]);
  const dispatch = useDispatch();

  const [dropdownlist, setDropdownlist] = useState({
    centreList: [],
    providers: [],
    programs: [],
  });

  const [payload, setPayload] = useState({
    processingLab: [],
    eqasProvider: "",
    eqasProgram: [],
    testList: [],
  });

  const typeList = [
    { label: "Type", value: "0" },
    { label: "Business Unit", value: "1" },
  ];

  const tableHeaders = [
    { header: "Sr No.", field: "srNo", width: "5%" },
    // { header: "Id", field: "hash", width: "5%" },
    { header: "Processing Lab", field: "processingLab", width: "10%" },
    { header: "EQAS Provider", field: "eqasProvider", width: "10%" },
    { header: "EQAS Program", field: "eqasProgram", width: "10%" },
    { header: "Tests", field: "tests", width: "25%" },
    { header: "Entry Date", field: "entryDate", width: "10%" },
    { header: "Entry By", field: "entryBy", width: "10%" },
    { header: "Remove", field: "remove", width: "10%" },
  ];

  const testTableHeaders = [
    { header: "Sr No", field: "srNo", width: "2%" },
    { header: "Department", field: "dept", width: "30%" },
    { header: "Test Name", field: "test", width: "60%" },
  ];

  const searchableKeys = [
    "processingLab",
    "eqasProvider",
    "eqasProgram",
    "tests", 
  ];

  const {
    searchTerm,
    setSearchTerm,
    filteredData
  } = useGlobalSearch(filterTableData, searchableKeys);

  const getAllCentre = async () => {
    dispatch(setLoading(true));
    await axiosInstance
      .get(apiUrls.GetCentreById)
      .then((res) => {
        console.log("res", res?.data);
        const resList = res?.data?.message?.map((item) => ({
          ...item,
          label: item?.centre,
          value: item?.centreid,
        }));
        setDropdownlist((prev) => ({ ...prev, centreList: resList }));
        // setPayload((prev) => ({...prev, processingLab : [resList[0].value]}));
      })
      .catch((err) => {
        notify(err?.data?.message, "error");
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  };

  const getEqasProviders = async () => {
    dispatch(setLoading(true));
    await axiosInstance
      .get(apiUrls.GetEQASProviderMapping)
      .then((res) => {
        console.log("eqas res", res?.data);
        const resList = res?.data?.data?.map((item) => ({
          ...item,
          label: item?.EqasProviderName,
          value: item?.EQASProviderID,
        }));
        setDropdownlist((prev) => ({ ...prev, providers: resList }));
      })
      .catch((err) => {
        notify(err?.data?.message, "error");
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  };

  const buildMappingsPayload = (testList, payload) => ({
    mappings: payload?.processingLab?.flatMap(labId =>
      testList?.map(program => ({
        processingLabID: labId,
        eqasProviderID: payload.eqasProvider,
        programID: program.ProgramId
      }))
    )
  });

  const getEqasPrograms = async (providerId) => {
    dispatch(setLoading(true));
    await axiosInstance
      .post(apiUrls.BindProgram, {
        eqasProviderId: providerId
      })
      .then((res) => {
        console.log("eqas res", res?.data);
        const resList = res?.data?.data?.map((item) => ({
          ...item,
          label: item?.ProgramName,
          value: item?.ProgramId,
        }));
        setDropdownlist((prev) => ({ ...prev, programs: resList }));
      })
      .catch((err) => {
        notify(err?.data?.message, "error");
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  };

  const handleSave = async () => {
    setErrors({});
    const requiredFields = [
          "eqasProvider",
          "processingLab",
          "eqasProgram",
        ];
        const errors = validateRequiredFields(payload, requiredFields);
        if (Object.keys(errors).length > 0) {
          setErrors(errors);
          return;
        }

        // if (payload?.processingLab?.length === 0) {
        //       toast?.info("Please select Processing Lab to save !");
        //       return;
        // }
        //  if (payload?.eqasProgram?.length === 0) {
        //       toast?.info("Please select Program to save !");
        //       return;
        // }
    dispatch(setLoading(true));
    const finalPayload = buildMappingsPayload(testList, payload);
    // console.log("finalPayload",finalPayload);
    await axiosInstance
      .post(apiUrls.SaveProgramMapping, finalPayload)
      .then((res) => {
        console.log("save res", res?.data);
        toast.success(res?.data?.message);
        if (res?.data?.success) {
          handleReset();
        }
      })
      .catch((err) => {
        toast.error(err?.data?.message);
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  };

  const getProgramList = async (processingLabId) => {
    dispatch(setLoading(true));
    const apiPayload = {
      processingLabId: processingLabId?.join(",") || "",
    }
    await axiosInstance
      .post(apiUrls.getprogramlist, apiPayload)
      .then((res) => {
        console.log("get res", res?.data);
        if (res?.data?.success) {
          const mapApiResponseToTable = () => {
            return res?.data?.data?.map((item, index) => ({
              srNo: index + 1,
              hash: item.id,
              processingLab: item.Centre,
              eqasProvider: item.EqasProviderName,
              eqasProgram: item.ProgramName,
              tests: item.TestName,
              entryDate: item.dtEntry,
              entryBy: item.CreatedByName,
              remove: null,
            }));
          };
          setFilterTableData(mapApiResponseToTable);
        }
      })
      .catch((err) => {
        notify(err?.data?.message, "error");
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  };

  const getEqasProgramData = async (programIds) => {
    console.log("values", programIds);
    const programIdsPayload = programIds?.map(x => x.toString());
    dispatch(setLoading(true));
    await axiosInstance
      .post(apiUrls.BindProgramData, {
        programIds: programIdsPayload
      })
      .then((res) => {
        console.log("bind res", res?.data);
        setEqasProgramsTest(res?.data?.data);
        const groupedData = groupByProgram(res?.data?.data);
        setTestList(groupedData);
      })
      .catch((err) => {
        notify(err?.data?.message, "error");
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  };

  const handleReactChange = (name, selectedOption) => {
    getEqasPrograms(selectedOption?.value?.toString());
    setPayload((prev) => ({ ...prev, [name]: selectedOption?.value }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPayload((prev) => ({ ...prev, [name]: value }));
  };

  const groupByProgram = (data) => {
    return Object.values(
      data.reduce((acc, item) => {
        if (!acc[item?.ProgramId]) {
          acc[item?.ProgramId] = {
            ProgramId: item?.ProgramId,
            ProgramName: item?.ProgramName,
            Rate: item?.Rate,
            ResultWithin: item?.ResultWithin,
            Frequency: item?.Frequency,
            tests: []
          };
        }

        acc[item?.ProgramId].tests.push({
          InvestigationId: item?.InvestigationId,
          InvestigationName: item?.InvestigationName,
          DepartmentName: item?.DepartmentName
        });

        return acc;
      }, {})
    );
  };

  const handleEqasProgramChange = (selected, name) => {
    const values = selected?.map((s) => s.value);
    setPayload((prev) => ({ ...prev, [name]: values }));
    getEqasProgramData(values);
  };

  const handleSelectMultiChange = (select, name) => {
    console.log("select", select, name);
    const val = select?.map((ele) => {
      return ele?.value;
    });
    setPayload((prev) => ({ ...prev, [name]: val }));
    getProgramList(val);
  };

  const handleDelete = async (deleteId) => {
    console.log("deleteId", deleteId);
    dispatch(setLoading(true));

    await axiosInstance
      .post(apiUrls.DeleteProgramLabMapping,
        {
          id: deleteId
        }
      )
      .then((res) => {
        console.log("del res", res?.data);
        toast.success(res?.data?.message);
        if (res?.data?.success) {
          handleReset();
        }
      })
      .catch((err) => {
        toast.error(err?.data?.message);
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  };

  const downloadExcel = () => {
    // Prepare data based on headers
    const excelData = filterTableData?.map(row => {
      const obj = {};
      tableHeaders.forEach(col => {
        obj[col.header] = row[col.field];
      });
      return obj;
    });

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "EQAS Data");

    // Download file
    XLSX.writeFile(workbook, "EQAS_Table_Data.xlsx");
  };

  const handleReset = () => {
    getProgramList(payload?.processingLab);
    setPayload({
      processingLab: [],
      eqasProvider: "",
      eqasProgram: [],
      testList: [],
    });
    setTestList([]);
    setErrors({});
  };

  useEffect(() => {
    getAllCentre();
    getEqasProviders();
  }, []);
  console.log("payload", payload);
  console.log("eqasProgramTest", eqasProgramTest);
  console.log("testList", testList);
  console.log("filterTableData", filterTableData);
  console.log("error",errors);

  return (
    <>
      {showMenu && <EqasMenuList />}

      <Accordion
        name={"EQAS Program Processing Lab Mapping"}
        isBreadcrumb={true}
        seconTitle={
          <label className="mt-2" onClick={() => setShowMenu((prev) => !prev)}>
            <ViewMenu />
          </label>
        }
      />
      <div className="program_main card px-2 py-2">
        <div className="row mb-2">
          <div className="col-sm-3 col-md-2 mb-1">
            <SelectBoxWithCheckbox
              name="processingLab"
              onChange={handleSelectMultiChange}
              options={dropdownlist.centreList}
              placeholder=" "
              lable={t("Processing Lab")}
              className="required-fields"
              id="processingLab"
              value={payload?.processingLab}
            />
             {payload?.processingLab?.length === 0 && (
              <span className="error-message">{errors?.processingLab}</span>
            )}
          </div>
          <div className="col-sm-3 col-md-2">
            <ReactSelect
              dynamicOptions={dropdownlist?.providers}
              name="eqasProvider"
              lable={t("EQAS Provider")}
              id="eqasProvider"
              removeIsClearable={false}
              placeholderName={t("EQAS Provider")}
              value={payload?.eqasProvider}
              onChange={handleReactChange}
              className="required-fields"
            />
            {payload?.eqasProvider === "" && (
              <span className="error-message">{errors?.eqasProvider}</span>
            )}
          </div>
          <div className="col-sm-3 col-md-2">
            <SelectBoxWithCheckbox
              className="required-fields"
              placeholder=" "
              name="eqasProgram"
              lable={t("EQAS Program")}
              id="eqasProgram"
              onChange={handleEqasProgramChange}
              options={dropdownlist?.programs}
              value={payload?.eqasProgram}
            />
            {payload?.eqasProgram?.length === 0 && (
              <span className="error-message">{errors?.eqasProvider}</span>
            )}
          </div>
          <CustomButton onClick={handleSave} text="Save" icon="save" className="border-radius-15 mx-2 mb-1" />
          <CustomButton onClick={handleReset} text="Reset" icon="refresh" className="border-radius-15 mx-2 mb-1" />
          <CustomButton text="Download" icon="excel" className="border-radius-15 mx-2" onClick={downloadExcel}/>
        </div>

        <div className="row">
          <div className="col-sm-3 col-md-2 mb-1">

            <label htmlFor="Test List">
              {t("Test List")}:
            </label>

          </div>
          <div className="col-sm-6 col-md-7 mt-1">
            {
              testList?.length > 0 ? (
                <Tables>
                  <thead>
                    <tr>
                      <th style={{ width: "30px" }}>Sr. No</th>
                      <th >Department</th>
                      <th>Test</th>
                    </tr>
                  </thead>

                  <tbody>
                    {testList?.map((program) => (
                      <React.Fragment key={program.ProgramId}>

                        {/* 🔹 PROGRAM ROW */}
                        <tr className="table-secondary fw-bold">
                          <td colSpan={4}>
                            ProgramID: {program.ProgramId} &nbsp;
                            ProgramName: {program.ProgramName} &nbsp;
                            Rate: {program.Rate} &nbsp;
                            ResultWithin: {program.ResultWithin} &nbsp;
                            Frequency: {program.Frequency}
                          </td>
                        </tr>

                        {/* 🔹 TEST ROWS */}
                        {program?.tests.map((test, index) => (
                          <tr key={`${program?.ProgramId}-${test.InvestigationId}`}>
                            <td style={{ width: "30px" }}>{index + 1}</td>
                            <td>{test.DepartmentName}</td>
                            <td>
                              {test.InvestigationId} {test.InvestigationName}
                            </td>
                          </tr>
                        ))}

                      </React.Fragment>
                    ))}
                  </tbody>
                </Tables>
              ) : (
                <div className="text-muted">
                  No Test Selected
                </div>
              )}

          </div>
        </div>

        {/* {selectedPrograms.length > 0 && (
          <CustomTable
            columns={testTableHeaders}
            data={buildGroupedTableData(selectedPrograms)}
            style={{ maxHeight: "300px" }}
            rowClassName={(row) =>
              row.isGroupHeader ? "font-weight-bold" : ""
            }
          />
        )} */}
      </div>

      <Heading 
      title={t("Search Details")} 
      defaultValue={true}
      secondTitle={
                            <FilterInput
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              placeholder="Filter Table"
                              inputClass="transparent-background"
                            />
                      }
      />

        <div>

          <CustomTable
            columns={tableHeaders}
            data={filteredData?.map(
              (row, index) => ({
                ...row,
                srNo: index + 1,
                remove: (
                  <FaTimes
                    color="red"
                    size={18}
                    style={{ cursor: "pointer" }}
                    onClick={() => handleDelete(row.hash)}
                  />
                ),
              })
            )}
          />
        </div>

      


    </>
  );
};

export default ProgramLabMapping;
