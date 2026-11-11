import React, { useEffect, useState } from "react";
import ReactSelect from "../../components/formComponent/ReactSelect";
import Input from "../../components/formComponent/Input";
import { Button } from "react-bootstrap";
import Heading from "../../components/UI/Heading";
import CustomTable from "../../components/Table/CustomTable";
import { useTranslation } from "react-i18next";
import { ViewMenu } from "../../components/SvgIcons";
import EqasMenuList from "./EqasMenuList";
import { axiosInstance } from "../../utils/axiosInstance";
import { useDispatch } from "react-redux";
import { setLoading } from "../../store/reducers/loadingSlice/loadingSlice";
import { apiUrls } from "../../utils/apiUrls";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { notify } from "../../utils/utils";
import { colorCodingDataNew, colorCodingRegistered, months, years } from "../../utils/Constants";
import ColorCodingSearch from "../../components/ModalComponent/ColorCodingSearch";
import { CustomButton } from "../../components/UI/CustomButton";
import { validateRequiredFields } from "../../utils/helpers";
import FilterInput from "../../components/Filter/FilterInput";
import useGlobalSearch from "../../utils/CustomHooks/useGlobalSearch";

const EQASRegistration = () => {
  const [t] = useTranslation();
  const [showMenu, setShowMenu] = useState(false);
  const dispatch = useDispatch();
  const [errors, setErrors] = useState({});
  const date = new Date();
  const { ShowDefaultLoginCentre } = useLocalStorage("userData", "get");
  const DefaultCentre = useLocalStorage("DefaultCentre", "get");
  const [programHeader, setProgramHeader] = useState(null);
  const [programTableData, setProgramTableData] = useState([]);
  const [hasSavedRecord, setHasSavedRecord] = useState(false);

  const [dropdownlist, setDropdownlist] = useState({
    centreList: [],
    eqasPrograms: [],
  });

  const [payload, setPayload] = useState({
    processingLab: "",
    processingLabName: "",
    eqasProgram: "",
    programName: "",
    programNo: "",
    cycleNo: "",
    roundNo: "",
    age: "",
    gender: "",
    month: date.getMonth() + 1,
    year: date.getFullYear().toString(),
  });

  const handleReactChange = (name, selectedOption) => {
    console.log("name, selectedOption", name, selectedOption);
    setPayload((prev) => ({ ...prev, [name]: selectedOption?.value }));

    if (name === "processingLab") {
      setPayload((prev) => ({ ...prev, processingLabName: selectedOption?.label }));
      getEqasPrograms(selectedOption?.value);
    }
    else if (name === "eqasProgram") {
      getEqasProgramsTest(selectedOption?.value)
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPayload((prev) => ({ ...prev, [name]: value }));
  };

  const tableHeaders = [
    { header: "Sr No.", field: "srNo", width: "5%" },
    { header: "Department", field: "department", width: "10%" },
    { header: "Test", field: "test", width: "10%" },
    { header: "Reg Date", field: "regDate", width: "10%" },
    { header: "Sin No.", field: "sinNo", width: "10%" },
    { header: "Program No", field: "programNo", width: "10%" },
    { header: "Cycle No", field: "cycleNo", width: "10%" },
    { header: "Round No", field: "roundNo", width: "10%" },
  ];

  const searchableKeys = [
    "department",
    "test",
    "sinNo",
  ];


  const handleReset = () => {
    setPayload({
      processingLab: dropdownlist?.centreList?.[0]?.value || "",
      processingLabName: dropdownlist?.centreList?.[0]?.label || "",
      eqasProgram: "",
      programName: "",
      programNo: "",
      cycleNo: "",
      roundNo: "",
      age: "",
      gender: "",
      month: date.getMonth() + 1,
      year: date.getFullYear().toString(),
    });

    setProgramHeader({});
    setProgramTableData([]);
    setErrors({});

    getEqasPrograms(DefaultCentre || dropdownlist?.centreList?.[0]?.value || "")

  }

  const getAllCentre = async () => {
    dispatch(setLoading(true));
    await axiosInstance
      .get(apiUrls.GetAccessProcessingLab)
      .then((res) => {
        console.log("res", res?.data);
        const resList = res?.data?.message?.map((item) => ({
          ...item,
          label: item?.centre,
          value: item?.centreid,
        }));
        setDropdownlist((prev) => ({ ...prev, centreList: resList }));
        // if (ShowDefaultLoginCentre === "1") {
        //   setPayload((prev) => ({ ...prev, processingLab: DefaultCentre ?? resList?.[0]?.value }));
        //   getEqasPrograms(DefaultCentre ?? resList?.[0]?.value)
        // }
        // else {
        setPayload((prev) => ({ ...prev, processingLab: resList?.[0]?.value, processingLabName: resList?.[0]?.label }));
        getEqasPrograms(resList?.[0]?.value || "")
        // }

      })
      .catch((err) => {
        notify(err?.data?.message, "error");
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  };

  const getEqasPrograms = async (centerid) => {
    dispatch(setLoading(true));
    const apiPayload = {
      processingLabId: centerid?.toString() || payload?.processingLab?.toString() || "",
    }
    await axiosInstance
      .post(apiUrls.BindProgramRegistration, apiPayload)
      .then((res) => {
        console.log("res", res?.data);
        if (res?.data?.success) {
          const resList = res?.data?.data?.map((item) => ({
            ...item,
            label: item?.ProgramName,
            value: item?.ProgramId,
          }));
          setDropdownlist((prev) => ({ ...prev, eqasPrograms: resList }));
        }
        else {
          setDropdownlist((prev) => ({ ...prev, eqasPrograms: [] }));
        }

      })
      .catch((err) => {
        notify(err?.data?.message, "error");
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  };

  const getEqasProgramsTest = async (programId = payload?.eqasProgram) => {
    if (!programId) return;
    dispatch(setLoading(true));
    const regisYearAndMonth = `${payload?.month}#${payload?.year}`;

    const apiPayload = {
      programId: programId || payload?.eqasProgram || 0,
      regisYearAndMonth: regisYearAndMonth,
      labId: payload?.processingLab || 0,
    }

    await axiosInstance
      .post(apiUrls.BindProgramDataRegistration, apiPayload)
      .then((res) => {
        console.log("res", res?.data);
        if (res?.data?.success) {
          const apiData = res?.data?.data || [];
          if (apiData.length === 0) return;

          const firstRow = apiData[0];

          const hasUnsavedRecord = apiData?.some(
            (item) => Number(item?.SavedId) === 0
          );


          setHasSavedRecord(hasUnsavedRecord);

          // ✅ 1. Populate Payload Fields
          setPayload((prev) => ({
            ...prev,
            programName: firstRow?.ProgramName || "",
            // programNo: firstRow?.ProgramNo || "",
            // cycleNo: firstRow?.CycleNo || "",
            // roundNo: firstRow?.RoundNo || "",
            age: firstRow?.Age || "",
            gender: firstRow?.Gender || "",
          }));

          const headerInfo = {
            ProgramId: apiData[0]?.ProgramId || 0,
            ProgramName: apiData[0]?.ProgramName || "",
            Rate: apiData[0]?.rate || 0,
            ResultWithin: apiData[0]?.ResultWithin || 0,
            Frequency: apiData[0]?.Frequency || 0,
          };

          // Map table rows
          const tableRows = apiData?.map((item, index) => ({
            srNo: index + 1,
            department: item?.department || "",
            departmentId: item?.DepartmentID || "",
            test: item?.investigationname || "",
            testId: item?.InvestigationId || 0,
            regDate: item?.RegDate || "",
            sinNo: item?.BarcodeNo || "",
            programNo: item?.ProgramNo || "",
            cycleNo: item?.CycleNo || "",
            roundNo: item?.RoundNo || "",
            LedgerTransactionNo: item?.LedgerTransactionNo || "",
            rate: item?.rate || 0,
            ReportType: item?.ReportType || 0,
            SavedId: item?.SavedId || 0,
            rowColor: item?.SavedId === 0 ? '#ffe58f' : '#b6d7a8',
          }));

          setProgramHeader(headerInfo);
          setProgramTableData(tableRows);
        }
        else {

        }

      })
      .catch((err) => {
        notify(err?.data?.message, "error");
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  };

  const {
    searchTerm,
    setSearchTerm,
    filteredData
  } = useGlobalSearch(programTableData, searchableKeys);

  const saveEqasRegistration = async () => {
    const requiredFields = [
      "processingLab",
      "eqasProgram",
      "programName",
      "programNo",
      "cycleNo",
      "roundNo",
      "age",
      "gender",
    ];
    const errors = validateRequiredFields(payload, requiredFields);
    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      return;
    }
    try {
      dispatch(setLoading(true));
      const regisYearAndMonth = `${payload.month}#${payload.year}`;
      // Convert Age to days (for PLO)
      const ageInDays = Number(payload.age || 0) * 365;

      // 🔹 LTData
      const ltData = {
        centreID: payload?.processingLab?.toString() || "",
        otherLabRefNo: "",
        typeOfTnx: "OPD-LAB",
        discountOnTotal: 0,
        netAmount: 0,
        grossAmount: 0,
        isCredit: 0,

        ledgerTransactionNo: "",

        pName: payload?.programName || "",
        patientCode: "",

        age: `${payload?.age || 0} Y 0 M 0 D`,
        gender: payload?.gender || "",

        vip: 0,

        patientIDProof: "",
        patientIDProofNo: "",

        patientSource: "WalkIn",
        patientType: "Walk-In",

        doctor_ID: "1",
        doctorName: "SELF",

        referLab: 0,

        cardNo: "",
        adjustment: 0,

        visitType: "Center Visit",

        hlmPatientType: "",
        hlmopdipdNo: "",

        reVisit: 0,

        discountApprovedByID: 0,
        discountApprovedByName: "",

        discountID: 0,

        ledgerTransactionNo_Interface: "",
        workOrderID_Create: 0,
        interface_companyName: "",

        couponCode: "",
        couponID: "",

        preBookingID: 0,

        trfNo: "",

        centreName: payload.processingLabName || "",

        isDocumentUploaded: 0,

        usernameWeb: "",
        passwordWeb: "",

        rateTypeId: 0,
        rateTypeName: "",

        mobile: "",
        email: "",

        collectionBoyName: "",
        collectionBoyId: 0,

        proEmployee: "",
        category: "",

        remarks: "EQAS Registration",

        ipAddress: "",

        workOrderIDSuffix: ""
      };

      // 🔹 PLO Array (from programData)
      const plo = programTableData?.filter((item) => Number(item?.SavedId) === 0)?.map((item) => ({
        itemId: item?.testId.toString() || "",
        itemName: item?.test || "",

        investigation_ID: item?.testId.toString() || "",
        ledgerTransactionNo: item?.LedgerTransactionNo || "",
        ledgertransactionID: 0,

        isPackage: 0,

        departmentId: item?.departmentId.toString() || "",

        rate: item?.rate || 0,
        amount: 0,
        discountAmt: 0,
        quantity: 0,
        discountByLab: 0,

        isRefund: 0,
        isReporting: 1,

        ageInDays: ageInDays,
        gender: payload?.gender || "",

        reportType: item.ReportType || 0,

        centreID: payload?.processingLab || 0,
        testCentreID: 0,

        isSampleCollected: "S",
        sampleBySelf: 1,
        isUrgent: 0,

        deliveryDate: date,
        ipAddress: "",

        sampleDate: date,
        sampleCollectionDate: date,
        sampleCollectionBy: 0,

        sampleTypeID: 0,
        sampleTypeName: "",

        testCode: item?.testId.toString() || "",
        investigationName: item?.test || "",

        packageName: programHeader?.ProgramName || "",
        packageCode: programHeader?.ProgramId?.toString() || "",

        rateTypeId: "",
        pccGrossAmt: 0,
        pccDiscAmt: 0,
        pccNetAmt: 0,
        pccSpecialFlag: 0,
        pccInvoiceAmt: 0,
        pccPercentage: 0,

        itemID_Interface: "",
        interface_companyName: "",

        mrp: 0,

        vDate: date,
        billNo: "",
        itemCode: item?.testId?.toString() || "",

        isNormalResult: 0,
        isCriticalResult: 0,
        printSeparate: 0,
        resultFlag: 0,

        departmentName: item?.department || "",
        labRemarkCount: 0
      }));

      // 🔹 Final API Payload
      const apiPayload = {
        LTData: ltData,
        PLO: plo,
        regisyearandmonth: regisYearAndMonth || "",
        programname: payload?.programName || "",
        programno: payload?.programNo || "",
        cycleno: payload?.cycleNo || "",
        // CentreID: payload.processingLab,
        // Programid: programHeader?.ProgramId,
        roundno: payload.roundNo,
      };

      console.log("SAVE PAYLOAD", apiPayload);

      const res = await axiosInstance.post(
        apiUrls.SaveEqasRegistration,
        apiPayload
      );

      if (res?.data?.success) {
        getEqasProgramsTest()
        notify(res?.data?.message || "Registration saved successfully", "success");
      } else {
        notify(res?.data?.message || "Save failed", "error");
      }

    } catch (error) {
      notify(error?.response?.data?.message || "Something went wrong", "error");
    } finally {
      dispatch(setLoading(false));
    }
  };


  useEffect(() => {
    getAllCentre();
  }, []);

  console.log("payload", payload);
  console.log("programTableData", programTableData);
  console.log("programHeader", programHeader);
  console.log("hasSavedRecord", hasSavedRecord);
  console.log("errors", errors);
  console.log("filteredData", filteredData);

  // const dynamicOptions = options?.length > 0 ? options?.map((item) => ({

  return (
    <>
      {showMenu && <EqasMenuList />}
      <Heading
        title={"EQAS Registration"}
        secondTitle={
          <label onClick={() => setShowMenu((prev) => !prev)}>
            <ViewMenu />
          </label>
        }
      />

      <div className="program_main card px-2 py-2">
        <div className="row">
          <div className="col-md-2 col-sm-4">
            <ReactSelect
              dynamicOptions={dropdownlist?.centreList}
              name="processingLab"
              lable="Processing Lab"
              id="processingLab"
              removeIsClearable={false}
              placeholderName={t("Select Lab")}
              value={payload?.processingLab}
              onChange={handleReactChange}
              className="required-fields"
            />
          </div>

          <div className="col-md-2 col-sm-4">
            <ReactSelect
              dynamicOptions={dropdownlist?.eqasPrograms}
              name="eqasProgram"
              lable={t("EQAS Program")}
              id="eqasProgram"
              removeIsClearable={false}
              placeholderName={t("Select EQAS Program")}
              value={payload?.eqasProgram}
              onChange={handleReactChange}
              className="required-fields"
            />
          </div>

          <div style={{ gap: "2px" }} className="col-md-2 col-sm-4 d-flex">
            <ReactSelect
              dynamicOptions={months}
              name="month"
              lable={t("Current Month")}
              placeholderName={t("Current Month")}
              id="month"
              removeIsClearable={false}
              value={payload?.month}
              onChange={handleReactChange}
              respclass={"flex-grow-1"}
            />
            <ReactSelect
              dynamicOptions={years}
              name="year"
              lable={t("Year")}
              placeholderName={t("Year")}
              id="year"
              removeIsClearable={false}
              value={payload?.year}
              onChange={handleReactChange}
              respclass={"flex-grow-1"}
            />
          </div>
          <div className="col-md-2 col-sm-4">
            <Input
              type="text"
              name="programName"
              lable={"Program Name"}
              id="programName"
              value={payload.programName}
              onChange={handleChange}
            />
            {payload?.programName === "" && (
              <span className="error-message">{errors?.programName}</span>
            )}
          </div>
          <div className="col-md-2 col-sm-4">
            <Input
              type="text"
              name="programNo"
              lable={t("Program No.")}
              id="programNo"
              value={payload.programNo}
              onChange={handleChange}
            />
            {payload?.programNo === "" && (
              <span className="error-message">{errors?.programNo}</span>
            )}
          </div>
          <div className="col-md-2 col-sm-4">
            <Input
              type="text"
              name="cycleNo"
              lable={t("Cycle No.")}
              id="cycleNo"
              value={payload.cycleNo}
              onChange={handleChange}
            />
            {payload?.cycleNo === "" && (
              <span className="error-message">{errors?.cycleNo}</span>
            )}
          </div>
          <div className="col-md-2 col-sm-4">
            <Input
              type="text"
              name="roundNo"
              lable={t("Round No.")}
              id="roundNo"
              value={payload.roundNo}
              onChange={handleChange}
            />
            {payload?.roundNo === "" && (
              <span className="error-message">{errors?.roundNo}</span>
            )}
          </div>
          <div className="col-md-1 col-sm-2 col-4">
            <Input
              type="text"
              name="age"
              lable={t("Age")}
              id="age"
              value={payload.age}
              onChange={handleChange}
            />
            {payload?.age === "" && (
              <span className="error-message">{errors?.age}</span>
            )}
          </div>
          <div className="col-md-2 col-sm-4 col-4">
            <Input
              type="text"
              name="gender"
              lable={t("Gender")}
              id="gender"
              value={payload.gender}
              onChange={handleChange}
            />
            {payload?.gender === "" && (
              <span className="error-message">{errors?.gender}</span>
            )}
          </div>
          {hasSavedRecord && (programTableData?.length > 0) &&
            <CustomButton text="Save" icon="save" className="mx-2" onClick={saveEqasRegistration} />
          }
          <CustomButton text="Reset" icon="refresh" className="mx-2" onClick={handleReset} />
        </div>

        <Heading
          title={"Test Details"}
          secondTitle={
            <>

              {colorCodingRegistered?.map(({ color, labelKey, id }) => (
                <ColorCodingSearch
                  key={id}
                  color={color}
                  label={t(labelKey)}
                  // onClick={() => handleStatusFilter(id)}
                  cursor="pointer"
                />
              ))}
              <FilterInput
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filter Table"
                inputClass="transparent-background"
                className="ml-2"
              />
            </>



          }

        />

        <div className="mt-2 w-100">
          {(programTableData?.length > 0) && (
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
                <strong>ProgramID:</strong> {programHeader.ProgramId || 0} &nbsp;&nbsp;
                <strong>ProgramName:</strong> {programHeader.ProgramName || ""} &nbsp;&nbsp;
                <strong>Rate:</strong> {programHeader.Rate || 0}&nbsp;&nbsp;
                <strong>ResultWithin:</strong> {programHeader.ResultWithin || 0} &nbsp;&nbsp;
                <strong>Frequency:</strong> {programHeader.Frequency || 0} &nbsp;&nbsp;
              </div>
            </div>
          )}
          <CustomTable columns={tableHeaders} data={
            filteredData?.map((row, idx) => ({
              ...row,
              srNo: idx + 1
            }))
          } />
        </div>
      </div>
    </>
  );
};

export default EQASRegistration;
