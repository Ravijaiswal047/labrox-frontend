import React, { useEffect, useState } from "react";
import Heading from "../../components/UI/Heading";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { useTranslation } from "react-i18next";
import EqasMenuList from "./EqasMenuList";
import CustomTable from "../../components/Table/CustomTable";
import Input from "../../components/formComponent/Input";
import { ViewMenu } from "../../components/SvgIcons";
import './Eqas.css'
import Modal from "../../components/ModalComponent/Modal";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { setCheckListData, setOpenCheckListModal, setTypeModalData, setTypeModalOpen } from "../../store/reducers/eqasSlice/eqasSlice";
import { setLoading } from "../../store/reducers/loadingSlice/loadingSlice.js";
import { axiosInstance } from "../../utils/axiosInstance.jsx";
import { apiUrls } from "../../utils/apiUrls.js";
import { notify } from "../../utils/utils.js";
import { getEqasPrograms } from "../../utils/NetworkApi/commonApi.js";
import { months, years } from "../../utils/Constants.jsx";
import { CustomButton } from "../../components/UI/CustomButton.jsx";
import EqasUploadDocsPopup from "./EqasUploadDocsPopup.jsx";
import ColorCodingSearch from "../../components/ModalComponent/ColorCodingSearch.jsx";
import { toast } from "react-toastify";
import { FaPlus } from "react-icons/fa";
import AddChecklist from "../QualityControl/IQC/qcReport/AddChecklist.jsx";
import AddRemark from "../QualityControl/IQC/qcReport/AddRemark.jsx";
import ActionModal from "../QualityControl/IQC/qcReport/ActionModel.jsx";
import FilterInput from "../../components/Filter/FilterInput.jsx";


const EqasResultEntry = () => {
  const [t] = useTranslation();
  const dispatch = useDispatch();
  const date = new Date();
  const [showMenu, setShowMenu] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [programHeader, setProgramHeader] = useState(null);

  const { openCheckListModal } = useSelector(data => data.eqasSlice);

  // Upload Docs popup states
  const [uploadDocsModalOpen, setUploadDocsModalOpen] = useState(false);
  const [investigations, setInvestigations] = useState([]);

  // Eqas Corrective Remarks 
  const [eqasRemarks, setEqasRemarks] = useState({});
  // Eqas Preventive Remarks
  const [preventiveRemark, setPreventiveRemark] = useState(false);
  const [preventiveRemarkText, setPreventiveRemarkText] = useState({});
  const [existingPreventiveRemark, setExistingPreventiveRemark] = useState("");

  // remarks 
  const [actionType, setActionType] = useState(null); // set Type = Identify RCA/Corrective/PReventive
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [selectedOption, setSelectedOption] = useState("");
  const [secondModal, setSecondModal] = useState("");
  const [nextStep, setNextStep] = useState(false);

  const [btnStatus, setBtnStatus] = useState({
    ResultNotSaved: "",
    ResultSave: "",
    Approved: "",
  })
  const colorCodingResultEntry = [
    // ✅ New Statuses
    { color: "lightgoldenrodyellow", id: "9", labelKey: "Result Not Saved" },
    { color: "bisque", id: "10", labelKey: "Result Saved" },
    { color: "lightgreen", id: "11", labelKey: "Result Approved" },
  ];
  // const searchableKeys = [
  //   "providerName",
  //   "address",
  //   "contactNo",
  //   "contactPersonName", 
  //   "email",
  // ];
  // const {
  //   searchTerm,
  //   setSearchTerm,
  //   filteredData
  // } = useGlobalSearch(tableData, searchableKeys);
  const [dropdownlist, setDropdownlist] = useState({
    centreList: [],
    eqasPrograms: [],
  });
  const statusOptions = [
    { label: "Acceptable", value: "Acceptable" },
    { label: "Unacceptable", value: "Unacceptable" },
    { label: "Warning", value: "Warning" },
    { label: "N/A", value: "N/A" },
  ];

  const tableHeaders = [
    { header: "S.No", field: "id", width: "3%" },
    { header: "Reg Date", field: "regDate", width: "8%" },
    { header: "Department", field: "department", width: "12%" },
    { header: "Barcode No", field: "barcodeNo", width: "10%" },
    { header: "Test Name", field: "testName", width: "15%" },
    { header: "Result", field: "ResultValue", width: "8%" },
    { header: "Expected Result", field: "expectedResult", width: "12%" },
    { header: "EQAS Result", field: "EQASVALUE", width: "10%" },
    { header: "EQAS Status", field: "eqasStatus", width: "10%" },
    { header: "Z-Score/SDI", field: "zScore", width: "10%" },
    { header: "Percentage", field: "PercentValue", width: "8%" },
    { header: "RCA CheckList", field: "rcaCheckList", width: "12%" },
    { header: "RCA Conclusion", field: "Outliers", width: "15%" },
    { header: "Corrective Action", field: "correctiveAction", width: "12%" },
    { header: "Preventive Action", field: "preventiveAction", width: "12%" },
  ];

  const [payload, setPayload] = useState({
    centre: "",
    program: "",
    month: date.getMonth() + 1,
    year: date.getFullYear().toString(),

  });
  // Update handler for inputs
  const handleInputChange = (index, field, value) => {
    const updated = [...tableData];
    updated[index][field] = value;
    setTableData(updated);
  };

  // Update handler for ReactSelect in table
  const handleReactChange = (index, name, value) => {
    const updated = [...tableData];
    updated[index][name] = value;
    setTableData(updated);
  };

  // Update handler for search filters
  const handleSearchChange = (name, e) => {
    let value = e?.value;
    setPayload((prev) => ({ ...prev, [name]: value }));
    if (name === 'centre') {
      getEqasPrograms(e?.value, (data) => {
        setDropdownlist((prev) => ({
          ...prev,
          eqasPrograms: data,
        }));
      });
      setPayload((prev) => ({ ...prev, program: "" }));
    }
  };

  const shouldShowRemarkBtn = (row, typeKey) => {
    if (row.custatus === "Approved") {
      return Boolean(row[typeKey]); // show only if value exists
    }
    return true; // non-approved → always show
  };

  const handleOpenModal = (visible, rowData, type) => {
    dispatch(setOpenCheckListModal(visible))
    dispatch(setCheckListData(rowData))
    setActionType(type || "");
    setSelectedItemId(rowData?.test_id || "");
    // False other
    dispatch(setTypeModalOpen(false));
  }

  const handleUploadDocsModal = (visible, row = "") => {
    setUploadDocsModalOpen(visible);
    // setSelectedRowId(row?.EqasProviderID);
  };

  const handleSearch = async () => {
    dispatch(setLoading(true));
    const regisYearAndMonth = `${payload?.month}#${payload?.year}`;

    const apiPayload = {
      programId: payload?.program || 0,
      regisYearAndMonth: regisYearAndMonth,
      labId: payload?.centre?.toString() || 0,
    }

    await axiosInstance
      .post(apiUrls.EqasBindResults, apiPayload)
      .then((res) => {
        console.log("res", res?.data);
        if (res?.data?.success) {
          const apiData = res?.data?.data || [];
          if (apiData.length === 0) return;
          const firstRow = apiData[0];

          const formattedData = apiData.map((item, index) => ({
            ...item,
            id: index + 1,
            regDate: item.regdate || "",
            department: item.departmant || "",
            barcodeNo: item.barcodeno || "",

            // REQUIRED FIELD MAPPING
            testName: item.InvestigationName || "",
            ResultValue: item.ResultValue || "",
            expectedResult: item.ExpectedResultDate || "",
            EQASVALUE: item.EQASVALUE || "",
            eqasStatus: item.EQASStatus || "",
            zScore: item.Z_Score || "",
            PercentValue: item.PercentValue || "",

            // RCA / ACTIONS
            rcaCheckList: item.RCA || "",
            Outliers: item.Outliers || "",
            correctiveAction: item.CorrectiveAction || "",
            preventiveAction: item.PreventiveAction || "",
            // Row color support
            rowColor: item.rowcolor || "",
          }));

          const headerInfo = {
            ProviderName: firstRow.ProvideName || "",
            ProgramId: firstRow.programid || 0,
            ProgramName: firstRow.programname || "",
            ExpectedResultDate: firstRow.ExpectedResultDate || "",
          };

          const resList = apiData.map((item) => ({
            ...item,
            label: item?.InvestigationName,
            value: item?.investigationid,
          }));
          setBtnStatus((prev) => ({
            ...prev,
            ResultNotSaved: firstRow.custatus === "New" ? true : false,
            ResultSave: firstRow.custatus === "ResultDone" ? true : false,
            Approved: firstRow.custatus === "Approved" ? true : false,
          }))
          setInvestigations(resList);

          setTableData(formattedData);
          setProgramHeader(headerInfo);

        }
        else {
          notify(res?.data?.message || "No data found", "success");
          setTableData([]);
          setProgramHeader({});
          setInvestigations([]);
          setBtnStatus({
            ResultNotSaved: "",
            ResultSave: "",
            Approved: "",
          })

        }

      })
      .catch((err) => {
        notify(err?.data?.message, "error");
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  }

  const getAllCentre = async () => {
    dispatch(setLoading(true));
    await axiosInstance
      .get(apiUrls.GetAccessProcessingLab)
      .then((res) => {
        console.log("res", res?.data);
        if (res?.data?.success) {
          const resList = res?.data?.message?.map((item) => ({
            ...item,
            label: item?.centre,
            value: item?.centreid,
          }));
          setDropdownlist((prev) => ({ ...prev, centreList: resList }));
          setPayload((prev) => ({ ...prev, centre: resList?.[0]?.value, centreName: resList?.[0]?.label }));
          getEqasPrograms(resList?.[0]?.value, (data) => {
            setDropdownlist((prev) => ({
              ...prev,
              eqasPrograms: data,
            }));
          });
        }
      })
      .catch((err) => {
        notify(err?.data?.message, "error");
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  };

  const submitEqasResult = (flagValue) => {
    if (!tableData || tableData.length === 0) {
      toast.error("No data to submit");
      return;
    }

    const hasEmptyResult = tableData?.some(
      (row) => row?.ResultValue === null || row?.ResultValue === undefined || row?.ResultValue === ""
    );

    if (hasEmptyResult) {
      toast.warning("Please enter Result Value for all tests before saving");
      return; // ⛔ STOP API CALL
    }

    const eqasResultData = tableData?.map((row) => ({
      programID: row.programid || 0,             // 9
      test_Id: row.test_id || 0,                  // 32451
      value: row.ResultValue || "",          // Result value
      eqasValue: row.EQASVALUE || "",
      eqasStatus: row.eqasStatus || "",
      rca: row.RCA?.toString() || "",
      correctiveAction: eqasRemarks[row.test_id]        // ✅ only if added for this row
        || row.correctiveAction
        || row.CorrectiveAction
        || "",
      preventiveAction: preventiveRemarkText[row.test_id]        // ✅ only if added for this row
        || row.preventiveAction
        || row.preventiveAction
        || "",
      zScore: row.zScore || "",
      percentage: row.PercentValue || "",
      outliers: row.Outliers || "",
      remark: "",
    }));

    const apiPayload = {
      eqasResultData,
      flag: String(flagValue), // "0" or "1"
    };

    axiosInstance
      .post(apiUrls.saveEqasResult, apiPayload)
      .then((res) => {
        if (res?.data?.success) {
          console.log("saveres", res);
          toast.success(
            flagValue == 0 ? "Saved successfully" : "Approved successfully"
          );
          handleSearch();
        } else {
          toast.error(res?.data?.message || "Operation failed");
        }
      })
      .catch(() => {
        toast.error("Submission failed");
      });
  };

  const handleEqasRemark = (itemId, remark) => {
    setEqasRemarks(prev => ({
      ...prev,
      [itemId]: remark,
    }));
    setNextStep(false);
  };

  const handlePreventiveRemark = (itemId, remark) => {
    setPreventiveRemarkText(prev => ({
      ...prev,
      [itemId]: remark,
    }));
    setPreventiveRemark(false);
  };

  const handleReset = () => {
    setTableData([]);
    setProgramHeader(null);
    setInvestigations([]);
    setEqasRemarks({});
    setPreventiveRemark(false);
    setPreventiveRemarkText({});
    setExistingPreventiveRemark("");
    setSelectedItemId(null);
    setSelectedOption("");
    setNextStep(false);
    setBtnStatus({
      ResultNotSaved: "",
      ResultSave: "",
      Approved: "",
    })
    setPayload({
      centre: "",
      program: "",
      month: date.getMonth() + 1,
      year: date.getFullYear().toString(),

    });
    setActionType(null);
    setShowActionModal(false);
    setSecondModal("");
  }

  const openAddRemark = ({ type, item }) => {
    setActionType(type || "");
    setSelectedItemId(item?.test_id || "");
    const remark =
      type === "RCA"
        ? item.RCA
        : type === "CorrectiveAction"
          ? item.CorrectiveAction ?? item.correctiveAction
          : item.PreventiveAction ?? item.preventiveAction;

    setExistingPreventiveRemark(remark ?? "");
    setPreventiveRemark(true);
  };

  const handleAdd = (type, item) => {

    console.log("itemxxx", item.test_id);
    setActionType(type);
    setSelectedItemId(item.test_id);

    // Determine the value of the type field for this row
    const fieldValue =
      type === "RCA"
        ? item.RCAType
        : type === "CorrectiveAction"
          ? item.CAType
          : item.PAType;

    setSecondModal(fieldValue);

    let modalComponent = null;

    if (fieldValue === "CheckList") {
      // Open AddChecklist modal
      console.log("Opening AddChecklist", fieldValue);
      modalComponent = (
        <AddChecklist
          type={type}
          itemId={item.test_id}
          onClose={() => {
            setNextStep(false);
            // handleShowReading(); 
            handleSearch();
            // ✅ refresh table
          }}
        />
      );
    } else if (fieldValue === "Comment") {
      // Open AddRemark modal with existing remark
      console.log("Opening AddRemark", fieldValue);
      const existingRow = tableData?.find(
        (row) => Number(row.test_id) === Number(item.test_id)
      );

      console.log("existing", existingRow);

      const existingRemark =
        type === "RCA"
          ? existingRow?.RCA
          : type === "CorrectiveAction"
            ? existingRow?.CorrectiveAction ?? existingRow?.correctiveAction
            : existingRow?.PreventiveAction ?? existingRow?.preventiveAction;

      console.log("existing", existingRemark);

      modalComponent = (
        <AddRemark
          type={type}
          itemId={item.test_id}
          existingRemark={existingRemark}
          onEqasAdd={handleEqasRemark}
          onClose={() => setNextStep(null)}
        />
      );
    } else if (fieldValue === "" && fieldValue === "") {
      // No existing action — open ActionModal for new remark
      console.log("Opening ActionModal for new remark");
      setShowActionModal(true);
      return;
    }

    // Open the modal if determined
    if (modalComponent) {
      console.log("modalComponent", modalComponent);
      setNextStep(modalComponent);
    }
  };

  useEffect(() => {
    getAllCentre();
  }, []);

  console.log("dropdownlist", dropdownlist);
  console.log("payload", payload);
  console.log("tableData", tableData);
  console.log("btnStatus", btnStatus);
  console.log("eqasRemark", eqasRemarks);

  return (
    <>
      {showMenu && <EqasMenuList />}

      <Heading
        title={"EQAS Result Entry"}
        secondTitle={
          <label onClick={() => setShowMenu((prev) => !prev)}>
            <ViewMenu />
          </label>
        }
      />

      <div className="main_resurlt_entry card py-2 px-2">
        {/* Search Filters */}
        <div className="row mb-3">
          <div className="col-sm-3 col-md-2 col-12">
            <ReactSelect
              dynamicOptions={dropdownlist?.centreList}
              name="centre"
              id="centre"
              removeIsClearable={false}
              placeholderName={t("Centre")}
              value={payload?.centre}
              onChange={handleSearchChange}
              className="required-fields"
            />
          </div>
          <div className="col-sm-3 col-md-2 col-12">
            <ReactSelect
              dynamicOptions={dropdownlist?.eqasPrograms}
              name="program"
              id="program"
              removeIsClearable={false}
              placeholderName={t("EQAS Program")}
              value={payload?.program}
              onChange={handleSearchChange}
              className="required-fields"
            />
          </div>
          <div className="col-sm-2 col-md-1 col-6">
            <ReactSelect
              dynamicOptions={months}
              name="month"
              id="month"
              removeIsClearable={false}
              placeholderName={t("Current Month")}
              value={payload?.month}
              onChange={handleSearchChange}
              className="required-fields"
            />
          </div>
          <div className="col-sm-2 col-md-1 col-6">
            <ReactSelect
              dynamicOptions={years}
              name="year"
              id="year"
              removeIsClearable={false}
              placeholderName={t("Current year")}
              value={payload?.year}
              onChange={handleSearchChange}
              className="required-fields"
            />
          </div>
          <div>
            <CustomButton text="Search" icon="search" className="mx-2" onClick={handleSearch} />
            {tableData?.length > 0 &&
              <CustomButton text="Upload Docs" icon="upload" className="mx-2" onClick={() => handleUploadDocsModal(true)} />
            }
            <CustomButton text="Reset" onClick={handleReset} icon="refresh" className="mx-2" />

          </div>
        </div>

        <Heading title="Result Entry Data"
          secondTitle={
            <>
              {/* <div className="col-sm-12 d-flex justify-content-end gap-custom p-0"> */}
              {colorCodingResultEntry?.map(({ color, labelKey, id }) => (
                <ColorCodingSearch
                  key={id}
                  color={color}
                  label={t(labelKey)}
                  // onClick={() => handleStatusFilter(id)}
                  cursor="pointer"
                />
              ))}
              {/* <FilterInput
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Filter Table"
                        inputClass="transparent-background"
                      /> */}
              {/* </div> */}
            </>
          }
        />
        <div className="mt-2 w-100">
          {programHeader && (
            <div
              style={{
                background: "#e9f2ff",
                padding: "5px 15px",
                borderRadius: "6px",
                marginBottom: "10px",
                fontWeight: "500",
              }}
            >
              <div>
                <strong>Provider Name:&nbsp;&nbsp;</strong> {programHeader.ProviderName || ""} &nbsp;&nbsp;
                <strong>Program ID:&nbsp;&nbsp;</strong> {programHeader.ProgramId || 0} &nbsp;&nbsp;
                <strong>Program Name:&nbsp;&nbsp;</strong> {programHeader.ProgramName || ""} &nbsp;&nbsp;
                <strong>Expected Result Date:&nbsp;&nbsp;</strong> {programHeader.ExpectedResultDate || ""}
              </div>
            </div>
          )}
        </div>
        {/*Editable Table */}
        <div>
          <CustomTable
            columns={tableHeaders}
            data={tableData?.map((row, index) => ({
              ...row,
              ResultValue: (
                <Input
                  type="text"
                  value={row?.ResultValue || ""}
                  onChange={(e) =>
                    handleInputChange(index, "ResultValue", e.target.value)
                  }
                />
              ),
              EQASVALUE: (
                <Input
                  type="text"
                  value={row.EQASVALUE}
                  onChange={(e) =>
                    handleInputChange(index, "EQASVALUE", e.target.value)
                  }
                />
              ),
              eqasStatus: (
                <ReactSelect
                  name="eqasStatus"
                  dynamicOptions={statusOptions}
                  value={row.eqasStatus || "N/A"}
                  onChange={(fieldName, option) =>
                    handleReactChange(index, fieldName, option?.value)
                  }
                  removeIsClearable={false}
                />
              ),
              zScore: (
                <Input
                  type="text"
                  value={row.zScore}
                  onChange={(e) =>
                    handleInputChange(index, "zScore", e.target.value)
                  }
                />
              ),
              PercentValue: (
                <Input
                  type="text"
                  value={row.PercentValue}
                  onChange={(e) =>
                    handleInputChange(index, "PercentValue", e.target.value)
                  }
                />
              ),
              rcaCheckList: shouldShowRemarkBtn(row, "RCAType") ? (<div
                className="remark-btn"
                style={{
                  backgroundColor: row.RCAType ? "green" : "darkred",
                  color: "white",
                }}
                onClick={() => handleOpenModal(true, row, 'RCA')}><FaPlus color="white" size={8} /></div>) : null,
              Outliers: (
                <Input
                  type="text"
                  value={row?.Outliers || ""}
                  onChange={(e) =>
                    handleInputChange(index, "Outliers", e.target.value)
                  }
                />
              ),
              correctiveAction: shouldShowRemarkBtn(row, "CAType") ? (
                <div className="remark-btn" onClick={() => handleAdd("CorrectiveAction", row)}
                  style={{
                    backgroundColor: row.CAType ? "green" : "darkred",
                    color: "white",
                  }}
                >
                  <FaPlus color="white" size={8} />
                </div>
              ) : null,
              preventiveAction: shouldShowRemarkBtn(row, "PAType") ? (
                <div className="remark-btn"
                  onClick={() =>
                    openAddRemark({
                      type: "PreventiveAction",
                      item: row,
                    })
                  }
                  style={{
                    backgroundColor: row.PAType ? "green" : "darkred",
                    color: "white",
                  }}
                >
                  <FaPlus color="white" size={8} />
                </div>
              ) : null,
            }))}
          />
        </div>
        {(btnStatus?.ResultNotSaved || btnStatus?.ResultSave) &&
          <>
            <div className="mt-3 d-flex align-items-center w-100 justify-content-end">
              {(btnStatus?.ResultNotSaved || btnStatus?.ResultSave) &&
                <CustomButton text="save" icon="save" onClick={() => submitEqasResult(0)} className="mx-2" />
              }
              {(btnStatus?.ResultSave) &&
                <CustomButton text="Approve" icon="save" onClick={() => submitEqasResult(1)} />
              }
            </div>
          </>
        }
      </div>
      <Modal
        Header={'RCA Check List of EQAS'}
        setVisible={(val) => handleOpenModal(val)}
        visible={openCheckListModal}
        children={<AddChecklist
          type={actionType}
          itemId={selectedItemId}
          qcType="EQAS"
          onClose={() => {
            handleSearch();
            dispatch(setOpenCheckListModal(false))

          }}
        />}
        modalWidth={"65%"}
      />

      <Modal
        Header={'Preventive Action Remarks'}
        setVisible={() => {
          setPreventiveRemark(false)
          setActionType("");
          setSelectedItemId('');
        }
        }
        visible={preventiveRemark}
        children={<AddRemark
          type={actionType}
          qcType="EQAS"
          itemId={selectedItemId}
          existingRemark={existingPreventiveRemark}
          onEqasAdd={handlePreventiveRemark}
          onClose={() => {
            setPreventiveRemark(false)
            handleSearch();
          }
          }
        />}
        modalWidth={"65%"}
      />
      <Modal
        Header={'Upload Docs'}
        setVisible={(val) => handleUploadDocsModal(val)}
        visible={uploadDocsModalOpen}
        children={<EqasUploadDocsPopup
          investigations={investigations}
          centerid={payload?.centre}
          programid={programHeader?.ProgramId}
          month={payload?.month}
          year={payload?.year}
        />}
        modalWidth={"65%"}
      />
      {showActionModal && (
        <ActionModal
          type={actionType}
          onClose={() => setShowActionModal(false)}
          onContinue={(selectedOption) => {
            setShowActionModal(false);
            setNextStep(true); // opens second popup
            setSelectedOption(selectedOption);
          }}
        />
      )}
      {nextStep && (
        <Modal
          visible={true}
          setVisible={() => setNextStep(false)}
          modalWidth="50vw"
          Header={`${actionType} - Details`}
        >
          {selectedOption === "comment" || secondModal === "Comment" ? (
            <AddRemark
              type={actionType}
              itemId={selectedItemId}
              qcType="EQAS"
              existingRemark={
                tableData.find((row) => row.test_id === selectedItemId)?.[
                actionType === "RCA"
                  ? "RCA"
                  : actionType === "CorrectiveAction"
                    ? "CorrectiveAction"
                    : "PreventiveAction"
                ]
              }
              onClose={() => {
                // handleShowReading();
                handleSearch();
                setNextStep(false);
              }}
              onEqasAdd={handleEqasRemark}
            />
          ) : (
            <AddChecklist
              type={actionType}
              itemId={selectedItemId}
              qcType="EQAS"
              onClose={() => {
                handleSearch();
                setNextStep(false);
              }}
            />
          )}
        </Modal>
      )}
    </>
  );
};

export default EqasResultEntry;


