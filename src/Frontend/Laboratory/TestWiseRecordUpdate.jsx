import React, { useEffect, useState } from "react";
import Accordion from "../../components/UI/Accordion";
import { useTranslation } from "react-i18next";
import Input from "../../components/formComponent/Input";
import { toast } from "react-toastify";
import { axiosInstance } from "../../utils/axiosInstance";
import ResultEntryTableCustom from "./ResultEntryTableCustom";
import Loading from "../../components/loader/Loading";
import DatePicker from "../../components/formComponent/DatePicker";
import { SelectBox } from "../../components/formComponent/SelectBox";
import { AddBlankData } from "../../utils/helpers";
import { ReportTypeNew, SampleStatus } from "../../utils/Constants";
import { getVisitType } from "../../utils/NetworkApi/commonApi";
import moment from "moment";
const TestWiseRecordUpdate = () => {
  const [labNo, setLabNo] = useState("");
  const [tableData, setTableData] = useState([]);
  const [ploData, setPloData] = useState([]);
  const [LTData, setLTData] = useState([]);
  const [PatientMaster, setPatientMaster] = useState([]);
  const [load, setLoad] = useState(false);
  const [Gender, setGender] = useState([]);
  const [RateTypes, setRateTypes] = useState([]);
  const [doctorAdmin, setDoctorAdmin] = useState([]);
  const [SampleType, setSampleType] = useState([]);
  const [user, SetUser] = useState([]);
  const [CentreData, setCentreData] = useState([]);
  const [DepartmentData, setDepartmentData] = useState([]);
  const [OutSourceLabData, setOutSourceLabData] = useState([]);
  const [Title, setTitle] = useState([]);
  const [DoctorName, setDoctorName] = useState([]);
  const [VisitType, setVisitType] = useState([]);
  const [key, setKey] = useState({
    PLO: true,
    PatientMaster: false,
    LTData: false,
  });
  const handleKeyDown = (e) => {
    if (e?.key === "Enter") {
      fetch(e);
    }
  };
  const fetchRateTypesInPlo = async (id, field, index) => {
    try {
      const res = await axiosInstance.post("Centre/GetRateType", {
        CentreId: [id],
      });
      const list = res?.data?.message.map((item) => ({
        label: item?.RateTypeName,
        value: item?.RateTypeID,
      }));
      const updatedData = [...ploData];
      updatedData[index][field] = id;
      updatedData[index]["RateTypeId"] = list[0]?.value ?? "0";
      setPloData(updatedData);
      setRateTypes(list);
    } catch (err) {
      console.log(err);
    }
  };
  const fetchRateTypes = async (id) => {
    try {
      const res = await axiosInstance.post("Centre/GetRateType", {
        CentreId: [id],
      });
      const list = res?.data?.message.map((item) => ({
        label: item?.RateTypeName,
        value: item?.RateTypeID,
      }));

      setRateTypes(list);
    } catch (err) {
      console.log(err);
    }
  };
  const fetchRateTypesInLT = async (id, field, index, labelname) => {
    try {
      const res = await axiosInstance.post("Centre/GetRateType", {
        CentreId: [id],
      });
      const list = res?.data?.message.map((item) => ({
        label: item?.RateTypeName,
        value: item?.RateTypeID,
      }));
      const updatedData = [...LTData];
      updatedData[index][field] = id;
      updatedData[index]["CentreName"] = labelname;
      updatedData[index]["RateTypeId"] = list[0]?.value ?? "0";
      setLTData(updatedData);
      setRateTypes(list);
    } catch (err) {
      console.log(err);
    }
  };
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
        CentreDataValue.unshift({ label: "", value: "0" });
        setCentreData(CentreDataValue);
      })
      .catch((err) => console.log(err));
  };
  const getOutSourceLabData = () => {
    axiosInstance
      .get("OutSourceLabMaster/getOutSourceLabData")
      .then((res) => {
        let data = res.data.message;
        let OutSourceLabData = data.map((ele) => {
          return {
            value: ele.OutSourceLabID,
            label: ele.LabName,
          };
        });
        OutSourceLabData.unshift({ label: "", value: "0" });
        setOutSourceLabData(OutSourceLabData);
      })
      .catch((err) => console.log(err));
  };

  const getSampleType = () => {
    axiosInstance
      .get("SampleType/getSampleTypeByInvestigation")
      .then((res) => {
        let data = res.data.message;

        let SampleType = data.map((ele) => {
          return {
            value: ele.id,
            label: ele.SampleName,
          };
        });
        SampleType?.unshift({ label: "", value: "0" });
        return setSampleType(SampleType);
      })
      .catch((err) => console.log(err));
  };
  const BindApprovalDoctor = () => {
    axiosInstance
      .get("CommonController/BindApprovalDoctor")
      .then((res) => {
        let data = res.data.message;
        let doctorData = data.map((ele) => {
          return {
            value: ele?.employeeid,
            label: ele?.name,
          };
        });
        doctorData?.unshift({ label: "", value: "0" });
        setDoctorAdmin(doctorData);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const fetch = (e) => {
    setLoad(true);
    axiosInstance
      .post("CommonController/GetTestByLabNo", {
        LabNo: labNo.trim(),
      })
      .then((res) => {
        if (res?.data?.success) {
          let data = res?.data?.message;
          setPloData([]);
          setLTData([]);
          setPatientMaster([]);
          setTableData(data);
        } else {
          setPloData([]);
          setLTData([]);
          setPatientMaster([]);
          setTableData([]);
          toast.error("No Record Found");
        }

        setLoad(false);
      })
      .catch((err) => {
        setLoad(false);
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Something Went Wrong",
        );
      });
  };
  const getPloData = (id, pid, LTId) => {
    setLoad(true);
    axiosInstance
      .post("CommonController/GetAllPLOData", {
        TestID: id,
        PatientID: pid,
        LedgerTransactionID: LTId,
      })
      .then((res) => {
        if (res?.data?.success) {
          let data = res?.data?.message;
          fetchRateTypes(data?.plodata[0]?.CentreID);
          setPloData(data?.plodata);
          setLTData(data?.ltData);
          setPatientMaster(data?.patientData);
        } else {
          setPloData([]);
          toast.error("No Record Found");
        }

        setLoad(false);
      })
      .catch((err) => {
        setLoad(false);
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Something Went Wrong",
        );
      });
  };
  const getDepartment = () => {
    axiosInstance
      .get("Department/getDepartment")
      .then((res) => {
        let data = res.data.message;
        let DeptDataValue = data.map((ele) => {
          return {
            value: ele.DepartmentID,
            label: ele.Department,
          };
        });
        DeptDataValue.unshift({ label: "", value: "0" });
        setDepartmentData(DeptDataValue);
      })
      .catch((err) => console.log(err));
  };
  const getDropDownData = (name) => {
    const match = ["Title", "Gender", "BankName", "HLMPatientType", "Source"];
    axiosInstance
      .post("Global/getGlobalData", { Type: name })
      .then((res) => {
        let data = res.data.message;
        let value = data.map((ele) => {
          return {
            value: match.includes(name) ? ele.FieldDisplay : ele.FieldID,
            label: ele.FieldDisplay,
          };
        });
        !["Title", "PaymentMode", "Gender"].includes(name) &&
          value.unshift({ label: `Select ${name} `, value: "" });

        switch (name) {
          case "Gender":
            const extractedGenders = value
              ?.filter((option) => option?.value != "Both")
              .map((option) => {
                return {
                  value: option?.value,
                  label: option?.label,
                };
              });

            setGender(extractedGenders);
            break;
          case "Title":
            setTitle(value);
          default:
            break;
        }
      })
      .catch((err) => console.log(err));
  };
  const BindEmployeeReports = (state) => {
    axiosInstance
      .get("Camp/GetEmployees")
      .then((res) => {
        let data = res.data.message;
        let EmployeeData = data.map((ele) => {
          return {
            value: ele?.EmployeeID,
            label: ele?.NAME,
          };
        });
        EmployeeData.unshift({ label: "", value: "0" });

        state(EmployeeData);
      })
      .catch((err) => console.log(err));
  };
  const BindApprovalDoctorReports = (state) => {
    axiosInstance
      .get("CommonController/GetReferalDoctorData")
      .then((res) => {
        let data = res.data.message;
        let doctorData = data.map((ele) => {
          return {
            value: ele?.DoctorReferalId,
            label: ele?.Name,
          };
        });
        doctorData.unshift({ label: "", value: "0" });
        doctorData.unshift({ label: "Self", value: "1" });
        state(doctorData);
      })
      .catch((err) => console.log(err));
  };
  useEffect(() => {
    getDepartment();
    getDropDownData("Gender");
    getAccessCentres();
    BindEmployeeReports(SetUser);
    getSampleType();
    getOutSourceLabData();
    BindApprovalDoctor();
    getDropDownData("Title");
    BindApprovalDoctorReports(setDoctorName);
    getVisitType(setVisitType);
  }, []);
  const handleInputChange = (e, field, index) => {
    if (field == "CentreID") {
      fetchRateTypesInPlo(e.target.value, field, index);
    } else {
      const updatedData = [...ploData];
      updatedData[index][field] = e.target.value === "" ? "0" : e.target.value;
      setPloData(updatedData);
    }
  };
  const handleInputChangePatientMaster = (e, field, index) => {
    const updatedData = [...PatientMaster];
    updatedData[index][field] = e.target.value === "" ? "0" : e.target.value;
    setPatientMaster(updatedData);
  };
  const handleInputChangeLT = (e, field, index) => {
    const updatedData = [...LTData];
    updatedData[index][field] = e.target.value === "" ? "0" : e.target.value;
    setLTData(updatedData);
  };
  const handleInputChangeWithLabel = (e, field, index, labelname) => {
    const { value, selectedIndex } = e?.target;
    const label = e?.target?.children[selectedIndex]?.text;
    const updatedData = [...ploData];
    updatedData[index][field] = value === "" ? "0" : value;
    updatedData[index][labelname] = label;
    setPloData(updatedData);
  };
  const dateSelect = (value, name, index) => {
    const updatedData = [...ploData];
    updatedData[index][name] = moment(value).format("YYYY-MM-DD HH:mm:ss");
    setPloData(updatedData);
  };
  const dateSelectPatientMaster = (value, name, index) => {
    const updatedData = [...PatientMaster];
    updatedData[index][name] = moment(value).format("YYYY-MM-DD HH:mm:ss");
    setPatientMaster(updatedData);
  };
  const dateSelectLT = (value, name, index) => {
    const updatedData = [...LTData];
    updatedData[index][name] = moment(value).format("YYYY-MM-DD HH:mm:ss");
    setLTData(updatedData);
  };
  const handleInputChangeWithLabelLT = (e, field, index, labelname) => {
    if (field == "CentreID") {
      const { value, selectedIndex } = e?.target;
      const label = e?.target?.children[selectedIndex]?.text;
      fetchRateTypesInLT(value, field, index, label);
    } else {
      const { value, selectedIndex } = e?.target;
      const label = e?.target?.children[selectedIndex]?.text;
      const updatedData = [...LTData];
      updatedData[index][field] = value === "" ? "0" : value;
      updatedData[index][labelname] = label;
      setLTData(updatedData);
    }
  };
  const getUpdateScreenFromKey = () => {
    if (key.PLO) return 1;
    if (key.LTData) return 2;
    if (key.PatientMaster) return 3;
    return 0;
  };
  const replaceTopLevelNulls = (obj) => {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [
        key,
        value === null ? "" : value,
      ]),
    );
  };

  const handleUpdate = () => {
    setLoad(true);
    const payload = {
      fLedgerTransaction: replaceTopLevelNulls(LTData[0]),
      patientLabInvestigationOpd: replaceTopLevelNulls(ploData[0]),
      patientMaster: replaceTopLevelNulls(PatientMaster[0]),
    };

    const url = `CommonController/UpdateAllPLOLtPatientData?UpadateScreen=${getUpdateScreenFromKey()}`;

    axiosInstance
      .post(url, payload)
      .then((res) => {
        if (res?.data?.success) {
          toast.success(res?.data?.message);
          setLTData([]);
          setPatientMaster([]);
          setPloData([]);
        } else {
          setKey({
            PLO: false,
            PatientMaster: false,
            LTData: false,
          });
          toast.error(res?.data?.message);
        }

        setLoad(false);
      })
      .catch((err) => {
        setLoad(false);
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Something Went Wrong",
        );
      });
  };
  const item = ploData[0];

  const item2 = PatientMaster[0];
  const item3 = LTData[0];
  const changeSetup = (flag1, flag2, flag3) => {
    setKey({
      PLO: flag1,
      PatientMaster: flag2,
      LTData: flag3,
    });
  };
  const { t } = useTranslation();
  return (
    <div>
      <Accordion
        name={t("Test Wise Record Update")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row pt-2 pl-2 pr-2">
          {" "}
          <div className="col-sm-2">
            <Input
              type="text"
              id="labNo"
              lable="Visit Number"
              placeholder=" "
              onKeyDown={handleKeyDown}
              value={labNo}
              onChange={(e) => {
                setLabNo(e?.target?.value);
              }}
            />
          </div>
          <div className="col-sm-1">
            <button
              onClick={fetch}
              className="btn btn-primary btn-sm w-100"
              disabled={labNo.length == 0}
            >
              {load ? <Loading /> : t("Search")}
            </button>
          </div>
          <button
            className="col-sm-2 btn btn-info h-100 ml-2 mr-2"
            disabled={key?.PLO}
            onClick={() => changeSetup(true, false, false)}
          >
            {t("PLO")}
          </button>
          <button
            className="col-sm-2 btn btn-info h-100 ml-2 mr-2"
            disabled={key?.PatientMaster}
            onClick={() => changeSetup(false, true, false)}
          >
            {t("PatientMaster")}
          </button>
          <button
            className="col-sm-2 btn btn-info h-100 ml-2 mr-2"
            disabled={key?.LTData}
            onClick={() => changeSetup(false, false, true)}
          >
            {t("LTData")}
          </button>
        </div>
      </Accordion>
      <Accordion title={t("Search Detail")} defaultValue={true}>
        {" "}
        <div className="row p-1">
          <div className="col-sm-12">
            {" "}
            <ResultEntryTableCustom>
              <thead>
                <tr>
                  {[t("S.No."), t("Test Name"), t("Test Id"), t("Item Id")].map(
                    (ele, index) => (
                      <th key={index}>{ele}</th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {tableData.map((data, index) => (
                  <tr
                    key={index}
                    onClick={() =>
                      getPloData(
                        data?.TestID,
                        data?.PatientID,
                        data?.LedgerTransactionID,
                      )
                    }
                  >
                    <td data-title={t("S.No")}>{index + 1}</td>
                    <td data-title={t("Test Name")}>{data?.ItemName}</td>
                    <td data-title={t("Test Id")}>{data?.TestID}</td>
                    <td data-title={t("Item Id")}>{data?.Itemid}</td>
                  </tr>
                ))}
              </tbody>
            </ResultEntryTableCustom>
          </div>
        </div>
        {ploData?.length > 0 && (
          <>
            {" "}
            {key?.PLO && (
              <>
                <div className="row p-2">
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="IsItem"
                      disabled={true}
                      value={item.IsItem}
                      lable="IsItem"
                      placeholder=""
                      onChange={(e) => handleInputChange(e, "IsItem", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      disabled={true}
                      id="LedgerTransactionID"
                      value={item.LedgerTransactionID}
                      lable="LedgerTransactionID"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChange(e, "LedgerTransactionID", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      disabled={true}
                      id="LedgerTransactionNo"
                      value={item.LedgerTransactionNo}
                      lable="LedgerTransactionNo"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChange(e, "LedgerTransactionNo", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="BarcodeNo"
                      value={item.BarcodeNo}
                      lable="BarcodeNo"
                      placeholder=""
                      onChange={(e) => handleInputChange(e, "BarcodeNo", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      disabled={true}
                      id="ItemId"
                      value={item.ItemId}
                      lable="ItemId"
                      placeholder=""
                      onChange={(e) => handleInputChange(e, "ItemId", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="ItemName"
                      disabled={true}
                      value={item.ItemName}
                      lable="ItemName"
                      placeholder=""
                      onChange={(e) => handleInputChange(e, "ItemName", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="InvestigationID"
                      disabled={true}
                      value={item.InvestigationID}
                      lable="InvestigationID"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChange(e, "InvestigationID", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="IsPackage"
                      value={item.IsPackage}
                      lable="IsPackage"
                      placeholder=""
                      onChange={(e) => handleInputChange(e, "IsPackage", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <DatePicker
                      className="custom-calendar"
                      id="DATE"
                      value={item.DATE ? new Date(item.DATE) : ""}
                      lable="DATE"
                      placeholder=""
                      onChange={(e) => dateSelect(e, "DATE", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <SelectBox
                      id="DepartmentID"
                      selectedValue={item.DepartmentID}
                      lable="DepartmentID"
                      options={AddBlankData(DepartmentData, "All Department")}
                      placeholder=""
                      onChange={(e) => handleInputChange(e, "DepartmentID", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="Rate"
                      value={item.Rate}
                      lable="Rate"
                      placeholder=""
                      onChange={(e) => handleInputChange(e, "Rate", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="Amount"
                      value={item.Amount}
                      lable="Amount"
                      placeholder=""
                      onChange={(e) => handleInputChange(e, "Amount", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="DiscountAmt"
                      value={item.DiscountAmt}
                      lable="DiscountAmt"
                      placeholder=""
                      onChange={(e) => handleInputChange(e, "DiscountAmt", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="Quantity"
                      value={item.Quantity}
                      lable="Quantity"
                      placeholder=""
                      onChange={(e) => handleInputChange(e, "Quantity", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="DiscountByLab"
                      value={item.DiscountByLab}
                      lable="DiscountByLab"
                      placeholder=""
                      onChange={(e) => handleInputChange(e, "DiscountByLab", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="IsRefund"
                      value={item.IsRefund}
                      lable="IsRefund"
                      placeholder=""
                      onChange={(e) => handleInputChange(e, "IsRefund", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="IsReporting"
                      value={item.IsReporting}
                      lable="IsReporting"
                      placeholder=""
                      onChange={(e) => handleInputChange(e, "IsReporting", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="PatientID"
                      disabled={true}
                      value={item.PatientID}
                      lable="PatientID"
                      placeholder=""
                      onChange={(e) => handleInputChange(e, "PatientID", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="PatientCode"
                      disabled={true}
                      value={item.PatientCode}
                      lable="PatientCode"
                      placeholder=""
                      onChange={(e) => handleInputChange(e, "PatientCode", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="AgeInDays"
                      value={item.AgeInDays}
                      lable="AgeInDays"
                      placeholder=""
                      onChange={(e) => handleInputChange(e, "AgeInDays", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <SelectBox
                      id="Gender"
                      selectedValue={item.Gender}
                      lable="Gender"
                      options={Gender}
                      placeholder=""
                      onChange={(e) => handleInputChange(e, "Gender", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <SelectBox
                      options={ReportTypeNew}
                      id="ReportType"
                      selectedValue={item.ReportType}
                      lable="ReportType"
                      placeholder=""
                      isDisabled={item?.IsPackage == "1" ? true : false}
                      onChange={(e) => handleInputChange(e, "ReportType", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <SelectBox
                      options={CentreData}
                      id="CentreID"
                      selectedValue={item.CentreID}
                      lable="CentreID"
                      placeholder=""
                      onChange={(e) => handleInputChange(e, "CentreID", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <SelectBox
                      options={RateTypes}
                      id="RateTypeId"
                      selectedValue={item.RateTypeId}
                      lable="RateTypeId"
                      placeholder=""
                      onChange={(e) => handleInputChange(e, "RateTypeId", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <SelectBox
                      options={CentreData}
                      id="CentreIDSession"
                      selectedValue={item.CentreIDSession}
                      lable="CentreIDSession"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChange(e, "CentreIDSession", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <SelectBox
                      options={CentreData}
                      id="TestCentreID"
                      selectedValue={item.TestCentreID}
                      lable="TestCentreID"
                      placeholder=""
                      onChange={(e) => handleInputChange(e, "TestCentreID", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="IsNormalResult"
                      value={item.IsNormalResult}
                      lable="IsNormalResult"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChange(e, "IsNormalResult", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="IsCriticalResult"
                      value={item.IsCriticalResult}
                      lable="IsCriticalResult"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChange(e, "IsCriticalResult", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="PrintSeparate"
                      value={item.PrintSeparate}
                      lable="PrintSeparate"
                      placeholder=""
                      onChange={(e) => handleInputChange(e, "PrintSeparate", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="isPartialResult"
                      value={item.isPartialResult}
                      lable="isPartialResult"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChange(e, "isPartialResult", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="ResultFlag"
                      value={item.ResultFlag}
                      lable="ResultFlag"
                      placeholder=""
                      onChange={(e) => handleInputChange(e, "ResultFlag", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <SelectBox
                      options={user}
                      id="ResultEnteredBy"
                      selectedValue={item.ResultEnteredBy}
                      lable="ResultEnteredBy"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangeWithLabel(
                          e,
                          "ResultEnteredBy",
                          0,
                          "ResultEnteredName",
                        )
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <DatePicker
                      className="custom-calendar"
                      value={
                        item.ResultEnteredDate
                          ? new Date(item.ResultEnteredDate)
                          : ""
                      }
                      id="ResultEnteredDate"
                      lable="ResultEnteredDate"
                      placeholder=""
                      onChange={(e) => dateSelect(e, "ResultEnteredDate", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="ResultEnteredName"
                      value={item.ResultEnteredName}
                      lable="ResultEnteredName"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChange(e, "ResultEnteredName", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="Approved"
                      value={item.Approved}
                      lable="Approved"
                      placeholder=""
                      onChange={(e) => handleInputChange(e, "Approved", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="AutoApproved"
                      value={item.AutoApproved}
                      lable="AutoApproved"
                      placeholder=""
                      onChange={(e) => handleInputChange(e, "AutoApproved", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <DatePicker
                      className="custom-calendar"
                      id="ApprovedDate"
                      value={
                        item.ApprovedDate ? new Date(item.ApprovedDate) : ""
                      }
                      lable="ApprovedDate"
                      placeholder=""
                      onChange={(e) => dateSelect(e, "ApprovedDate", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="ApprovedName"
                      value={item.ApprovedName}
                      lable="ApprovedName"
                      placeholder=""
                      onChange={(e) => handleInputChange(e, "ApprovedName", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <SelectBox
                      options={user}
                      id="ApprovedDoneBy"
                      selectedValue={item.ApprovedDoneBy}
                      lable="ApprovedDoneBy"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChange(e, "ApprovedDoneBy", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <SelectBox
                      options={user}
                      id="ApprovedDoneByDoctor"
                      selectedValue={item.ApprovedDoneByDoctor}
                      lable="ApprovedDoneByDoctor"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChange(e, "ApprovedDoneByDoctor", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="IsSampleCollected"
                      value={item.IsSampleCollected}
                      lable="IsSampleCollected"
                      placeholder=""
                      onChange={(e) => dateSelect(e, "IsSampleCollected", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <DatePicker
                      className="custom-calendar"
                      value={item.SampleDate ? new Date(item.SampleDate) : ""}
                      id="SampleDate"
                      lable="SampleDate"
                      placeholder=""
                      onChange={(e) => dateSelect(e, "SampleDate", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <DatePicker
                      className="custom-calendar"
                      value={
                        item.SampleReceiveDate
                          ? new Date(item.SampleReceiveDate)
                          : ""
                      }
                      id="SampleReceiveDate"
                      lable="SampleReceiveDate"
                      placeholder=""
                      onChange={(e) => dateSelect(e, "SampleReceiveDate", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <SelectBox
                      options={user}
                      id="SampleReceivedById"
                      selectedValue={item.SampleReceivedById}
                      lable="SampleReceivedById"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChange(e, "SampleReceivedById", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="SampleReceiver"
                      value={item.SampleReceiver}
                      lable="SampleReceiver"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChange(e, "SampleReceiver", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="SampleBySelf"
                      value={item.SampleBySelf}
                      lable="SampleBySelf"
                      placeholder=""
                      onChange={(e) => handleInputChange(e, "SampleBySelf", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <SelectBox
                      options={user}
                      id="SampleCollectionBy"
                      selectedValue={item.SampleCollectionBy}
                      lable="SampleCollectionBy"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChange(e, "SampleCollectionBy", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="isForward"
                      value={item.isForward}
                      lable="isForward"
                      placeholder=""
                      onChange={(e) => handleInputChange(e, "isForward", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="ForwardToCentre"
                      value={item.ForwardToCentre}
                      lable="ForwardToCentre"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChange(e, "ForwardToCentre", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="ForwardToDoctor"
                      value={item.ForwardToDoctor}
                      lable="ForwardToDoctor"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChange(e, "ForwardToDoctor", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <SelectBox
                      options={user}
                      id="ForwardBy"
                      value={item.ForwardBy}
                      lable="ForwardBy"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangeWithLabel(
                          e,
                          "ForwardBy",
                          0,
                          "ForwardByName",
                        )
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="ForwardByName"
                      value={item.ForwardByName}
                      lable="ForwardByName"
                      placeholder=""
                      onChange={(e) => handleInputChange(e, "ForwardByName", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <DatePicker
                      className="custom-calendar"
                      id="ForwardDate"
                      value={item.ForwardDate ? new Date(item.ForwardDate) : ""}
                      lable="ForwardDate"
                      placeholder=""
                      onChange={(e) => dateSelect(e, "ForwardDate", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="isPrint"
                      value={item.isPrint}
                      lable="isPrint"
                      placeholder=""
                      onChange={(e) => handleInputChange(e, "isPrint", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="isUrgent"
                      value={item.isUrgent}
                      lable="isUrgent"
                      placeholder=""
                      onChange={(e) => handleInputChange(e, "isUrgent", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <DatePicker
                      className="custom-calendar"
                      value={
                        item.DeliveryDate ? new Date(item.DeliveryDate) : ""
                      }
                      id="DeliveryDate"
                      lable="DeliveryDate"
                      placeholder=""
                      onChange={(e) => dateSelect(e, "DeliveryDate", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <DatePicker
                      className="custom-calendar"
                      id="DeliveryDateProcessing"
                      value={
                        item.DeliveryDateProcessing
                          ? new Date(item.DeliveryDateProcessing)
                          : ""
                      }
                      lable="DeliveryDateProcessing"
                      placeholder=""
                      onChange={(e) =>
                        dateSelect(e, "DeliveryDateProcessing", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="SlideNumber"
                      value={item.SlideNumber}
                      lable="SlideNumber"
                      placeholder=""
                      onChange={(e) => handleInputChange(e, "SlideNumber", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <SelectBox
                      options={SampleType}
                      id="SampleTypeID"
                      selectedValue={item.SampleTypeID}
                      lable="SampleTypeID"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangeWithLabel(
                          e,
                          "SampleTypeID",
                          0,
                          "SampleTypeName",
                        )
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="SampleTypeName"
                      value={item.SampleTypeName}
                      lable="SampleTypeName"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChange(e, "SampleTypeName", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="SampleQty"
                      value={item.SampleQty}
                      lable="SampleQty"
                      placeholder=""
                      onChange={(e) => handleInputChange(e, "SampleQty", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <SelectBox
                      options={OutSourceLabData}
                      id="LabOutsrcID"
                      value={item.LabOutsrcID}
                      lable="LabOutsrcID"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangeWithLabel(
                          e,
                          "LabOutsrcID",
                          0,
                          "LabOutsrcName",
                        )
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="LabOutsrcName"
                      value={item.LabOutsrcName}
                      lable="LabOutsrcName"
                      placeholder=""
                      onChange={(e) => handleInputChange(e, "LabOutsrcName", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <SelectBox
                      options={user}
                      id="LabOutSrcUserID"
                      value={item.LabOutSrcUserID}
                      lable="LabOutSrcUserID"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangeWithLabel(
                          e,
                          "LabOutSrcUserID",
                          0,
                          "LabOutSrcBy",
                        )
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="LabOutSrcBy"
                      value={item.LabOutSrcBy}
                      lable="LabOutSrcBy"
                      placeholder=""
                      onChange={(e) => handleInputChange(e, "LabOutSrcBy", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <DatePicker
                      className="custom-calendar"
                      id="LabOutSrcDate"
                      value={
                        item.LabOutSrcDate ? new Date(item.LabOutSrcDate) : ""
                      }
                      lable="LabOutSrcDate"
                      placeholder=""
                      onChange={(e) => dateSelect(e, "LabOutSrcDate", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="LabOutSrcRate"
                      value={item.LabOutSrcRate}
                      lable="LabOutSrcRate"
                      placeholder=""
                      onChange={(e) => handleInputChange(e, "LabOutSrcRate", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="isHistoryReq"
                      value={item.isHistoryReq}
                      lable="isHistoryReq"
                      placeholder=""
                      onChange={(e) => handleInputChange(e, "isHistoryReq", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="Temprature"
                      value={item.Temprature}
                      lable="Temprature"
                      placeholder=""
                      onChange={(e) => handleInputChange(e, "Temprature", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="isEmail"
                      value={item.isEmail}
                      lable="isEmail"
                      placeholder=""
                      onChange={(e) => handleInputChange(e, "isEmail", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="isrerun"
                      value={item.isrerun}
                      lable="isrerun"
                      placeholder=""
                      onChange={(e) => handleInputChange(e, "isrerun", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="ipaddress"
                      value={item.ipaddress}
                      lable="ipaddress"
                      placeholder=""
                      onChange={(e) => handleInputChange(e, "ipaddress", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="BarcodeGroup"
                      value={item.BarcodeGroup}
                      lable="BarcodeGroup"
                      placeholder=""
                      onChange={(e) => handleInputChange(e, "BarcodeGroup", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="IsLabOutSource"
                      value={item.IsLabOutSource}
                      lable="IsLabOutSource"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChange(e, "IsLabOutSource", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="reportnumber"
                      value={item.reportnumber}
                      lable="reportnumber"
                      placeholder=""
                      onChange={(e) => handleInputChange(e, "reportnumber", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="TestCode"
                      disabled={true}
                      value={item.TestCode}
                      lable="TestCode"
                      placeholder=""
                      onChange={(e) => handleInputChange(e, "TestCode", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      disabled={true}
                      id="InvestigationName"
                      value={item.InvestigationName}
                      lable="InvestigationName"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChange(e, "InvestigationName", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="PackageName"
                      value={item.PackageName}
                      lable="PackageName"
                      placeholder=""
                      onChange={(e) => handleInputChange(e, "PackageName", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="PackageCode"
                      value={item.PackageCode}
                      lable="PackageCode"
                      placeholder=""
                      onChange={(e) => handleInputChange(e, "PackageCode", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="ItemIDInterface"
                      value={item.ItemIDInterface}
                      lable="ItemIDInterface"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChange(e, "ItemIDInterface", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="InterfacecompanyName"
                      value={item.InterfacecompanyName}
                      lable="InterfacecompanyName"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChange(e, "InterfacecompanyName", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="LedgerTransactionNoInterface"
                      value={item.LedgerTransactionNoInterface}
                      lable="LedgerTransactionNoInterface"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChange(e, "LedgerTransactionNoInterface", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <SelectBox
                      options={SampleStatus}
                      id="Status"
                      selectedValue={item.Status}
                      lable="Status"
                      placeholder=""
                      onChange={(e) => handleInputChange(e, "Status", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="SampleInTransit"
                      value={item.SampleInTransit}
                      lable="SampleInTransit"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChange(e, "SampleInTransit", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="IsChangeable"
                      value={item.IsChangeable}
                      lable="IsChangeable"
                      placeholder=""
                      onChange={(e) => handleInputChange(e, "IsChangeable", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <DatePicker
                      className="custom-calendar"
                      id="UrgentDateTime"
                      value={
                        item.UrgentDateTime ? new Date(item.UrgentDateTime) : ""
                      }
                      lable="UrgentDateTime"
                      placeholder=""
                      onChange={(e) => dateSelect(e, "UrgentDateTime", 0)}
                    />
                  </div>

                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="IsRejected"
                      value={item.IsRejected}
                      lable="IsRejected"
                      placeholder=""
                      onChange={(e) => handleInputChange(e, "IsRejected", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <SelectBox
                      options={user}
                      id="DiscountApprovedBy"
                      selectedValue={item.DiscountApprovedBy}
                      lable="DiscountApprovedBy"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChange(e, "DiscountApprovedBy", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="DiscountReason"
                      value={item.DiscountReason}
                      lable="DiscountReason"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChange(e, "DiscountReason", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="RefundReason"
                      value={item.RefundReason}
                      lable="RefundReason"
                      placeholder=""
                      onChange={(e) => handleInputChange(e, "RefundReason", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="BillNo"
                      disabled={true}
                      value={item.BillNo}
                      lable="BillNo"
                      placeholder=""
                      onChange={(e) => handleInputChange(e, "BillNo", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      disabled={true}
                      id="CompanyID"
                      value={item.CompanyID}
                      lable="CompanyID"
                      placeholder=""
                      onChange={(e) => handleInputChange(e, "CompanyID", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="isActive"
                      value={item.isActive}
                      lable="isActive"
                      placeholder=""
                      onChange={(e) => handleInputChange(e, "isActive", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <DatePicker
                      className="custom-calendar"
                      id="dtEntry"
                      value={item.dtEntry ? new Date(item.dtEntry) : ""}
                      lable="dtEntry"
                      placeholder=""
                      onChange={(e) => dateSelect(e, "dtEntry", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <SelectBox
                      options={user}
                      id="CreatedBy"
                      selectedValue={item.CreatedBy}
                      lable="CreatedBy"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangeWithLabel(
                          e,
                          "CreatedBy",
                          "CreatedByName",
                        )
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="CreatedByName"
                      value={item.CreatedByName}
                      lable="CreatedByName"
                      placeholder=""
                      onChange={(e) => handleInputChange(e, "CreatedByName", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <DatePicker
                      className="custom-calendar"
                      id="dtUpdate"
                      value={item.dtUpdate ? new Date(item.dtUpdate) : ""}
                      lable="dtUpdate"
                      placeholder=""
                      onChange={(e) => dateSelect(e, "dtUpdate", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <SelectBox
                      options={user}
                      id="UpdatedBy"
                      selectedValue={item.UpdatedBy}
                      lable="UpdatedBy"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangeWithLabel(
                          e,
                          "UpdatedBy",
                          0,
                          "UpdatedByName",
                        )
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="UpdatedByName"
                      value={item.UpdatedByName}
                      lable="UpdatedByName"
                      placeholder=""
                      onChange={(e) => handleInputChange(e, "UpdatedByName", 0)}
                    />
                  </div>
                  <div className="col-sm-4 mb-1">
                    <Input
                      type="text"
                      disabled={true}
                      id="TestIDHash"
                      value={item.TestIDHash}
                      lable="TestIDHash"
                      placeholder=""
                      onChange={(e) => handleInputChange(e, "TestIDHash", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="isHold"
                      value={item.isHold}
                      lable="isHold"
                      placeholder=""
                      onChange={(e) => handleInputChange(e, "isHold", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <SelectBox
                      options={user}
                      id="HoldBy"
                      value={item.HoldBy}
                      lable="HoldBy"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangeWithLabel(e, "HoldBy", 0, "HoldByName")
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="HoldByName"
                      value={item.HoldByName}
                      lable="HoldByName"
                      placeholder=""
                      onChange={(e) => handleInputChange(e, "HoldByName", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="Hold_Reason"
                      value={item.Hold_Reason}
                      lable="Hold_Reason"
                      placeholder=""
                      onChange={(e) => handleInputChange(e, "Hold_Reason", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <SelectBox
                      options={user}
                      id="UnHoldBy"
                      selectedValue={item.UnHoldBy}
                      lable="UnHoldBy"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangeWithLabel(
                          e,
                          "UnHoldBy",
                          0,
                          "UnHoldByName",
                        )
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="UnHoldByName"
                      value={item.UnHoldByName}
                      lable="UnHoldByName"
                      placeholder=""
                      onChange={(e) => handleInputChange(e, "UnHoldByName", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="UpdatveRemarks"
                      value={item.UpdatveRemarks}
                      lable="UpdatveRemarks"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChange(e, "UpdatveRemarks", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="PCCGrossAmt"
                      value={item.PCCGrossAmt}
                      lable="PCCGrossAmt"
                      placeholder=""
                      onChange={(e) => handleInputChange(e, "PCCGrossAmt", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="PCCDiscAmt"
                      value={item.PCCDiscAmt}
                      lable="PCCDiscAmt"
                      placeholder=""
                      onChange={(e) => handleInputChange(e, "PCCDiscAmt", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="PCCNetAmt"
                      value={item.PCCNetAmt}
                      lable="PCCNetAmt"
                      placeholder=""
                      onChange={(e) => handleInputChange(e, "PCCNetAmt", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="PCCSpecialFlag"
                      value={item.PCCSpecialFlag}
                      lable="PCCSpecialFlag"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChange(e, "PCCSpecialFlag", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="PCCInvoiceAmt"
                      value={item.PCCInvoiceAmt}
                      lable="PCCInvoiceAmt"
                      placeholder=""
                      onChange={(e) => handleInputChange(e, "PCCInvoiceAmt", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="PCCPercentage"
                      value={item.PCCPercentage}
                      lable="PCCPercentage"
                      placeholder=""
                      onChange={(e) => handleInputChange(e, "PCCPercentage", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="InvoiceNo"
                      value={item.InvoiceNo}
                      lable="InvoiceNo"
                      placeholder=""
                      onChange={(e) => handleInputChange(e, "InvoiceNo", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="InvoiceAmt"
                      value={item.InvoiceAmt}
                      lable="InvoiceAmt"
                      placeholder=""
                      onChange={(e) => handleInputChange(e, "InvoiceAmt", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <SelectBox
                      options={user}
                      id="InvoiceCreatedByID"
                      selectedValue={item.InvoiceCreatedByID}
                      lable="InvoiceCreatedByID"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangeWithLabel(
                          e,
                          "InvoiceCreatedByID",
                          0,
                          "InvoiceCreatedBy",
                        )
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="InvoiceCreatedBy"
                      value={item.InvoiceCreatedBy}
                      lable="InvoiceCreatedBy"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChange(e, "InvoiceCreatedBy", 0)
                      }
                    />
                  </div>

                  <div className="col-sm-2 mb-1">
                    <DatePicker
                      className="custom-calendar"
                      id="InvoiceCreatedDate"
                      value={
                        item.InvoiceCreatedDate
                          ? new Date(item.InvoiceCreatedDate)
                          : ""
                      }
                      lable="InvoiceCreatedDate"
                      placeholder=""
                      onChange={(e) => dateSelect(e, "InvoiceCreatedDate", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <DatePicker
                      className="custom-calendar"
                      id="InvoiceDate"
                      value={item.InvoiceDate ? new Date(item.InvoiceDate) : ""}
                      lable="InvoiceDate"
                      placeholder=""
                      onChange={(e) => dateSelect(e, "InvoiceDate", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="IsDispatch"
                      value={item.IsDispatch}
                      lable="IsDispatch"
                      placeholder=""
                      onChange={(e) => handleInputChange(e, "IsDispatch", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="MacStatus"
                      value={item.MacStatus}
                      lable="MacStatus"
                      placeholder=""
                      onChange={(e) => handleInputChange(e, "MacStatus", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <SelectBox
                      options={doctorAdmin}
                      id="ApprovedBy"
                      selectedValue={item.ApprovedBy}
                      lable="ApprovedBy"
                      placeholder=""
                      onChange={(e) => handleInputChange(e, "ApprovedBy", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="IsInvoiceCreated"
                      value={item.IsInvoiceCreated}
                      lable="IsInvoiceCreated"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChange(e, "IsInvoiceCreated", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="InterpretationId"
                      value={item.InterpretationId}
                      lable="InterpretationId"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChange(e, "InterpretationId", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="NotApprovedReason"
                      value={item.NotApprovedReason}
                      lable="NotApprovedReason"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChange(e, "NotApprovedReason", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="ReRunReason"
                      value={item.ReRunReason}
                      lable="ReRunReason"
                      placeholder=""
                      onChange={(e) => handleInputChange(e, "ReRunReason", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <DatePicker
                      className="custom-calendar"
                      id="ReRunDate"
                      value={item.ReRunDate ? new Date(item.ReRunDate) : ""}
                      lable="ReRunDate"
                      placeholder=""
                      onChange={(e) => dateSelect(e, "ReRunDate", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <SelectBox
                      options={user}
                      id="ReRunByID"
                      selectedValue={item.ReRunByID}
                      lable="ReRunByID"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangeWithLabel(
                          e,
                          "ReRunByID",
                          0,
                          "ReRunByName",
                        )
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="ReRunByName"
                      value={item.ReRunByName}
                      lable="ReRunByName"
                      placeholder=""
                      onChange={(e) => handleInputChange(e, "ReRunByName", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="TrfTokkenCount"
                      value={item.TrfTokkenCount}
                      lable="TrfTokkenCount"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChange(e, "TrfTokkenCount", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <DatePicker
                      className="custom-calendar"
                      id="incubationdatetime"
                      value={
                        item.incubationdatetime
                          ? new Date(item.incubationdatetime)
                          : ""
                      }
                      lable="incubationdatetime"
                      placeholder=""
                      onChange={(e) => dateSelect(e, "incubationdatetime", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="CombinationSample"
                      value={item.CombinationSample}
                      lable="CombinationSample"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChange(e, "CombinationSample", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="IsProvisional"
                      value={item.IsProvisional}
                      lable="IsProvisional"
                      placeholder=""
                      onChange={(e) => handleInputChange(e, "IsProvisional", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="isPartial_Result"
                      value={item.isPartial_Result}
                      lable="isPartial_Result"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChange(e, "isPartial_Result", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="CultureStatus"
                      value={item.CultureStatus}
                      lable="CultureStatus"
                      placeholder=""
                      onChange={(e) => handleInputChange(e, "CultureStatus", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <DatePicker
                      className="custom-calendar"
                      id="SampleCollectionDate"
                      value={
                        item.SampleCollectionDate
                          ? new Date(item.SampleCollectionDate)
                          : ""
                      }
                      lable="SampleCollectionDate"
                      placeholder=""
                      onChange={(e) => dateSelect(e, "SampleCollectionDate", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <DatePicker
                      className="custom-calendar"
                      id="CultureStatusDate"
                      value={
                        item.CultureStatusDate
                          ? new Date(item.CultureStatusDate)
                          : ""
                      }
                      lable="CultureStatusDate"
                      placeholder=""
                      onChange={(e) => dateSelect(e, "CultureStatusDate", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <SelectBox
                      options={user}
                      id="ProvisionalBy"
                      selectedValue={item.ProvisionalBy}
                      lable="ProvisionalBy"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangeWithLabel(
                          e,
                          "ProvisionalBy",
                          0,
                          "ProvisionalDoneBy",
                        )
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="ProvisionalDoneBy"
                      value={item.ProvisionalDoneBy}
                      lable="ProvisionalDoneBy"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChange(e, "ProvisionalDoneBy", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <DatePicker
                      className="custom-calendar"
                      id="ProvisionalDateTime"
                      value={
                        item.ProvisionalDateTime
                          ? new Date(item.ProvisionalDateTime)
                          : ""
                      }
                      lable="ProvisionalDateTime"
                      placeholder=""
                      onChange={(e) => dateSelect(e, "ProvisionalDateTime", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <DatePicker
                      className="custom-calendar"
                      id="unholddate"
                      value={item.unholddate ? new Date(item.unholddate) : ""}
                      lable="unholddate"
                      placeholder=""
                      onChange={(e) => dateSelect(e, "unholddate", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="NoOfPricks"
                      value={item.NoOfPricks}
                      lable="NoOfPricks"
                      placeholder=""
                      onChange={(e) => handleInputChange(e, "NoOfPricks", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="Hno"
                      value={item.Hno}
                      lable="Hno"
                      placeholder=""
                      onChange={(e) => handleInputChange(e, "Hno", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="OrganName"
                      value={item.OrganName}
                      lable="OrganName"
                      placeholder=""
                      onChange={(e) => handleInputChange(e, "OrganName", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="HistoCytoStatus"
                      value={item.HistoCytoStatus}
                      lable="HistoCytoStatus"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChange(e, "HistoCytoStatus", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="HistoCytoSampleDetail"
                      value={item.HistoCytoSampleDetail}
                      lable="HistoCytoSampleDetail"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChange(e, "HistoCytoSampleDetail", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="PricksRemarks"
                      value={item.PricksRemarks}
                      lable="PricksRemarks"
                      placeholder=""
                      onChange={(e) => handleInputChange(e, "PricksRemarks", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="IsRadiology"
                      value={item.IsRadiology}
                      lable="IsRadiology"
                      placeholder=""
                      onChange={(e) => handleInputChange(e, "IsRadiology", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="StartEndTimeSlot"
                      value={item.StartEndTimeSlot}
                      lable="StartEndTimeSlot"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChange(e, "StartEndTimeSlot", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <DatePicker
                      className="custom-calendar"
                      id="RadioBookingDate"
                      value={
                        item.RadioBookingDate
                          ? new Date(item.RadioBookingDate)
                          : ""
                      }
                      lable="RadioBookingDate"
                      placeholder=""
                      onChange={(e) => dateSelect(e, "RadioBookingDate", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="RadioTokenNo"
                      value={item.RadioTokenNo}
                      lable="RadioTokenNo"
                      placeholder=""
                      onChange={(e) => handleInputChange(e, "RadioTokenNo", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="RadioRoomNo"
                      value={item.RadioRoomNo}
                      lable="RadioRoomNo"
                      placeholder=""
                      onChange={(e) => handleInputChange(e, "RadioRoomNo", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="ModalityID"
                      value={item.ModalityID}
                      lable="ModalityID"
                      placeholder=""
                      onChange={(e) => handleInputChange(e, "ModalityID", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="Printwithhead"
                      value={item.Printwithhead}
                      lable="Printwithhead"
                      placeholder=""
                      onChange={(e) => handleInputChange(e, "Printwithhead", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="OutSourceTestCode"
                      value={item.OutSourceTestCode}
                      lable="OutSourceTestCode"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChange(e, "OutSourceTestCode", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="OutSourceRate"
                      value={item.OutSourceRate}
                      lable="OutSourceRate"
                      placeholder=""
                      onChange={(e) => handleInputChange(e, "OutSourceRate", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="HistoCytoPerformingDoctor"
                      value={item.HistoCytoPerformingDoctor}
                      lable="HistoCytoPerformingDoctor"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChange(e, "HistoCytoPerformingDoctor", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="DualAuthenticatedcount"
                      value={item.DualAuthenticatedcount}
                      lable="DualAuthenticatedcount"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChange(e, "DualAuthenticatedcount", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <SelectBox
                      options={user}
                      id="Authorizeby"
                      selectedValue={item.Authorizeby}
                      lable="Authorizeby"
                      placeholder=""
                      onChange={(e) => handleInputChange(e, "Authorizeby", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <DatePicker
                      className="custom-calendar"
                      id="AuthorizeDate"
                      value={
                        item.AuthorizeDate ? new Date(item.AuthorizeDate) : ""
                      }
                      lable="AuthorizeDate"
                      placeholder=""
                      onChange={(e) => dateSelect(e, "AuthorizeDate", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="TestSuffix"
                      value={item.TestSuffix}
                      lable="TestSuffix"
                      placeholder=""
                      onChange={(e) => handleInputChange(e, "TestSuffix", 0)}
                    />
                  </div>
                </div>
              </>
            )}
            {key?.PatientMaster && (
              <>
                {" "}
                <div className="row p-2">
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="PatientID"
                      value={item2.PatientID}
                      disabled={true}
                      lable="PatientID"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangePatientMaster(e, "PatientID", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="PatientCode"
                      disabled={true}
                      value={item2.PatientCode}
                      lable="PatientCode"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangePatientMaster(e, "PatientCode", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <SelectBox
                      options={Title}
                      id="Title"
                      selectedValue={item2.Title}
                      lable="Title"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangePatientMaster(e, "Title", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="FirstName"
                      value={item2.FirstName}
                      lable="FirstName"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangePatientMaster(e, "FirstName", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="MiddleName"
                      value={item2.MiddleName}
                      lable="MiddleName"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangePatientMaster(e, "MiddleName", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="LastName"
                      value={item2.LastName}
                      lable="LastName"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangePatientMaster(e, "LastName", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="HouseNo"
                      value={item2.HouseNo}
                      lable="HouseNo"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangePatientMaster(e, "HouseNo", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="StreetName"
                      value={item2.StreetName}
                      lable="StreetName"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangePatientMaster(e, "StreetName", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="Locality"
                      value={item2.Locality}
                      lable="Locality"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangePatientMaster(e, "Locality", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="City"
                      value={item2.City}
                      lable="City"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangePatientMaster(e, "City", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="Pincode"
                      value={item2.Pincode}
                      lable="Pincode"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangePatientMaster(e, "Pincode", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="State"
                      value={item2.State}
                      lable="State"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangePatientMaster(e, "State", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="Country"
                      value={item2.Country}
                      lable="Country"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangePatientMaster(e, "Country", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="Phone"
                      value={item2.Phone}
                      lable="Phone"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangePatientMaster(e, "Phone", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="Mobile"
                      value={item2.Mobile}
                      lable="Mobile"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangePatientMaster(e, "Mobile", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="Email"
                      value={item2.Email}
                      lable="Email"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangePatientMaster(e, "Email", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <DatePicker
                      className="custom-calendar"
                      id="DOB"
                      value={item2.DOB ? new Date(item2.DOB) : ""}
                      lable="DOB"
                      placeholder=""
                      onChange={(e) => dateSelectPatientMaster(e, "DOB", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="Age"
                      value={item2.Age}
                      lable="Age"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangePatientMaster(e, "Age", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="AgeYear"
                      value={item2.AgeYear}
                      lable="AgeYear"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangePatientMaster(e, "AgeYear", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="AgeMonth"
                      value={item2.AgeMonth}
                      lable="AgeMonth"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangePatientMaster(e, "AgeMonth", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="AgeDays"
                      value={item2.AgeDays}
                      lable="AgeDays"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangePatientMaster(e, "AgeDays", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="TotalAgeInDays"
                      value={item2.TotalAgeInDays}
                      lable="TotalAgeInDays"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangePatientMaster(e, "TotalAgeInDays", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <SelectBox
                      options={Gender}
                      id="Gender"
                      selectedValue={item2.Gender}
                      lable="Gender"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangePatientMaster(e, "Gender", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <SelectBox
                      options={CentreData}
                      id="CentreID"
                      selectedValue={item2.CentreID}
                      lable="CentreID"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangePatientMaster(e, "CentreID", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="IPAddress"
                      value={item2.IPAddress}
                      lable="IPAddress"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangePatientMaster(e, "IPAddress", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="PatientIDInterface"
                      value={item2.PatientIDInterface}
                      lable="PatientIDInterface"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangePatientMaster(
                          e,
                          "PatientIDInterface",
                          0,
                        )
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="IsOnlineFilterData"
                      value={item2.IsOnlineFilterData}
                      lable="IsOnlineFilterData"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangePatientMaster(
                          e,
                          "IsOnlineFilterData",
                          0,
                        )
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="IsVIP"
                      value={item2.IsVIP}
                      lable="IsVIP"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangePatientMaster(e, "IsVIP", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="IsMask"
                      value={item2.IsMask}
                      lable="IsMask"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangePatientMaster(e, "IsMask", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="PatientGroupId"
                      value={item2.PatientGroupId}
                      lable="PatientGroupId"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangePatientMaster(e, "PatientGroupId", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="IsMobileVerified"
                      value={item2.IsMobileVerified}
                      lable="IsMobileVerified"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangePatientMaster(e, "IsMobileVerified", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="IsEmailVerified"
                      value={item2.IsEmailVerified}
                      lable="IsEmailVerified"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangePatientMaster(e, "IsEmailVerified", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      disabled={true}
                      id="CompanyID"
                      value={item2.CompanyID}
                      lable="CompanyID"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangePatientMaster(e, "CompanyID", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="isActive"
                      value={item2.isActive}
                      lable="isActive"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangePatientMaster(e, "isActive", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <DatePicker
                      className="custom-calendar"
                      id="dtEntry"
                      value={item2.dtEntry ? new Date(item2.dtEntry) : ""}
                      lable="dtEntry"
                      placeholder=""
                      onChange={(e) => dateSelectPatientMaster(e, "dtEntry", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <SelectBox
                      options={user}
                      id="CreatedBy"
                      selectedValue={item2.CreatedBy}
                      lable="CreatedBy"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangePatientMaster(e, "CreatedBy", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="CreatedByName"
                      value={item2.CreatedByName}
                      lable="CreatedByName"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangePatientMaster(e, "CreatedByName", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <DatePicker
                      className="custom-calendar"
                      id="dtUpdate"
                      value={item2.dtUpdate ? new Date(item2.dtUpdate) : ""}
                      lable="dtUpdate"
                      placeholder=""
                      onChange={(e) =>
                        dateSelectPatientMaster(e, "dtUpdate", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <SelectBox
                      options={user}
                      id="UpdatedBy"
                      selectedValue={item2.UpdatedBy}
                      lable="UpdatedBy"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangePatientMaster(e, "UpdatedBy", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="UpdatedByName"
                      value={item2.UpdatedByName}
                      lable="UpdatedByName"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangePatientMaster(e, "UpdatedByName", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="UpdateRemarks"
                      value={item2.UpdateRemarks}
                      lable="UpdateRemarks"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangePatientMaster(e, "UpdateRemarks", 0)
                      }
                    />
                  </div>

                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="Landmark"
                      value={item2.Landmark}
                      lable="Landmark"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangePatientMaster(e, "Landmark", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      disabled={true}
                      id="MembershipCardID"
                      value={item2.MembershipCardID}
                      lable="MembershipCardID"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangePatientMaster(e, "MembershipCardID", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="MembershipCardNo"
                      value={item2.MembershipCardNo}
                      lable="MembershipCardNo"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangePatientMaster(e, "MembershipCardNo", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="MembershipCardValidFrom"
                      value={item2.MembershipCardValidFrom}
                      lable="MembershipCardValidFrom"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangePatientMaster(
                          e,
                          "MembershipCardValidFrom",
                          0,
                        )
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="MembershipCardValidTo"
                      value={item2.MembershipCardValidTo}
                      lable="MembershipCardValidTo"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangePatientMaster(
                          e,
                          "MembershipCardValidTo",
                          0,
                        )
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="FamilyMemberIsPrimary"
                      value={item2.FamilyMemberIsPrimary}
                      lable="FamilyMemberIsPrimary"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangePatientMaster(
                          e,
                          "FamilyMemberIsPrimary",
                          0,
                        )
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      disabled={true}
                      type="text"
                      id="FamilyMemberGroupID"
                      value={item2.FamilyMemberGroupID}
                      lable="FamilyMemberGroupID"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangePatientMaster(
                          e,
                          "FamilyMemberGroupID",
                          0,
                        )
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="FamilyMemberRelation"
                      value={item2.FamilyMemberRelation}
                      lable="FamilyMemberRelation"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangePatientMaster(
                          e,
                          "FamilyMemberRelation",
                          0,
                        )
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      disabled={true}
                      id="MembershipImageId"
                      value={item2.MembershipImageId}
                      lable="MembershipImageId"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangePatientMaster(
                          e,
                          "MembershipImageId",
                          0,
                        )
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="MobileVip"
                      value={item2.MobileVip}
                      lable="MobileVip"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangePatientMaster(e, "MobileVip", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="FirstNameVip"
                      value={item2.FirstNameVip}
                      lable="FirstNameVip"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangePatientMaster(e, "FirstNameVip", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="MiddleNameVip"
                      value={item2.MiddleNameVip}
                      lable="MiddleNameVip"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangePatientMaster(e, "MiddleNameVip", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="LastNameVip"
                      value={item2.LastNameVip}
                      lable="LastNameVip"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangePatientMaster(e, "LastNameVip", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="PNameVip"
                      value={item2.PNameVip}
                      lable="PNameVip"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangePatientMaster(e, "PNameVip", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="MedicalHistorycount"
                      value={item2.MedicalHistorycount}
                      lable="MedicalHistorycount"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangePatientMaster(
                          e,
                          "MedicalHistorycount",
                          0,
                        )
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="DocumentUplodedCount"
                      value={item2.DocumentUplodedCount}
                      lable="DocumentUplodedCount"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangePatientMaster(
                          e,
                          "DocumentUplodedCount",
                          0,
                        )
                      }
                    />
                  </div>
                  <div className="col-sm-3 mb-1">
                    <Input
                      type="text"
                      disabled={true}
                      id="PatientGuid"
                      value={item2.PatientGuid}
                      lable="PatientGuid"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangePatientMaster(e, "PatientGuid", 0)
                      }
                    />
                  </div>
                </div>{" "}
              </>
            )}{" "}
            {key?.LTData && (
              <>
                <div className="row p-2">
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="LedgerTransactionID"
                      disabled={true}
                      value={item3.LedgerTransactionID}
                      lable="LedgerTransactionID"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangeLT(e, "LedgerTransactionID", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      disabled={true}
                      id="LedgerTransactionNo"
                      value={item3.LedgerTransactionNo}
                      lable="LedgerTransactionNo"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangeLT(e, "LedgerTransactionNo", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="IsInvoiceCreated"
                      value={item3.IsInvoiceCreated}
                      lable="IsInvoiceCreated"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangeLT(e, "IsInvoiceCreated", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="InvoiceNo"
                      disabled={true}
                      value={item3.InvoiceNo}
                      lable="InvoiceNo"
                      placeholder=""
                      onChange={(e) => handleInputChangeLT(e, "InvoiceNo", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="TypeOfTnx"
                      value={item3.TypeOfTnx}
                      lable="TypeOfTnx"
                      placeholder=""
                      onChange={(e) => handleInputChangeLT(e, "TypeOfTnx", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <DatePicker
                      className="custom-calendar"
                      id="DATE"
                      value={item3.DATE ? new Date(item3.DATE) : ""}
                      lable="DATE"
                      placeholder=""
                      onChange={(e) => dateSelectLT(e, "DATE", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="GrossAmount"
                      value={item3.GrossAmount}
                      lable="GrossAmount"
                      placeholder=""
                      onChange={(e) => handleInputChangeLT(e, "GrossAmount", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="DiscountOnTotal"
                      value={item3.DiscountOnTotal}
                      lable="DiscountOnTotal"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangeLT(e, "DiscountOnTotal", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="NetAmount"
                      value={item3.NetAmount}
                      lable="NetAmount"
                      placeholder=""
                      onChange={(e) => handleInputChangeLT(e, "NetAmount", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="IsCredit"
                      value={item3.IsCredit}
                      lable="IsCredit"
                      placeholder=""
                      onChange={(e) => handleInputChangeLT(e, "IsCredit", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="CancelReason"
                      value={item3.CancelReason}
                      lable="CancelReason"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangeLT(e, "CancelReason", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <DatePicker
                      className="custom-calendar"
                      id="CancelDate"
                      value={item3.CancelDate ? new Date(item3.CancelDate) : ""}
                      lable="CancelDate"
                      placeholder=""
                      onChange={(e) => dateSelectLT(e, "CancelDate", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="CancelUserID"
                      value={item3.CancelUserID}
                      lable="CancelUserID"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangeLT(e, "CancelUserID", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="IsCancel"
                      value={item3.IsCancel}
                      lable="IsCancel"
                      placeholder=""
                      onChange={(e) => handleInputChangeLT(e, "IsCancel", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="PatientID"
                      disabled={true}
                      value={item3.PatientID}
                      lable="PatientID"
                      placeholder=""
                      onChange={(e) => handleInputChangeLT(e, "PatientID", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="PName"
                      value={item3.PName}
                      lable="PName"
                      placeholder=""
                      onChange={(e) => handleInputChangeLT(e, "PName", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="PatientCode"
                      disabled={true}
                      value={item3.PatientCode}
                      lable="PatientCode"
                      placeholder=""
                      onChange={(e) => handleInputChangeLT(e, "PatientCode", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="Age"
                      value={item3.Age}
                      lable="Age"
                      placeholder=""
                      onChange={(e) => handleInputChangeLT(e, "Age", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <SelectBox
                      id="Gender"
                      options={Gender}
                      selectedValue={item3.Gender}
                      lable="Gender"
                      placeholder=""
                      onChange={(e) => handleInputChangeLT(e, "Gender", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="VIP"
                      value={item3.VIP}
                      lable="VIP"
                      placeholder=""
                      onChange={(e) => handleInputChangeLT(e, "VIP", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="ReferRate"
                      value={item3.ReferRate}
                      lable="ReferRate"
                      placeholder=""
                      onChange={(e) => handleInputChangeLT(e, "ReferRate", 0)}
                    />
                  </div>{" "}
                  <div className="col-sm-2 mb-1">
                    <SelectBox
                      options={CentreData}
                      id="CentreID"
                      selectedValue={item3.CentreID}
                      lable="CentreID"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangeWithLabelLT(
                          e,
                          "CentreID",
                          0,
                          "CentreName",
                        )
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="CentreName"
                      value={item3.CentreName}
                      lable="CentreName"
                      placeholder=""
                      onChange={(e) => handleInputChangeLT(e, "CentreName", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <SelectBox
                      options={RateTypes}
                      id="RateTypeId"
                      selectedValue={item3.RateTypeId}
                      lable="RateTypeId"
                      placeholder=""
                      onChange={(e) => handleInputChangeLT(e, "RateTypeId", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <SelectBox
                      options={DoctorName}
                      id="DoctorID"
                      selectedValue={item3.DoctorID}
                      lable="DoctorID"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangeWithLabelLT(
                          e,
                          "DoctorID",
                          0,
                          "DoctorName",
                        )
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="DoctorName"
                      value={item3.DoctorName}
                      lable="DoctorName"
                      placeholder=""
                      onChange={(e) => handleInputChangeLT(e, "DoctorName", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="ReferLab"
                      value={item3.ReferLab}
                      lable="ReferLab"
                      placeholder=""
                      onChange={(e) => handleInputChangeLT(e, "ReferLab", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="OtherReferLab"
                      value={item3.OtherReferLab}
                      lable="OtherReferLab"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangeLT(e, "OtherReferLab", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="CardNo"
                      disabled={true}
                      value={item3.CardNo}
                      lable="CardNo"
                      placeholder=""
                      onChange={(e) => handleInputChangeLT(e, "CardNo", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="Adjustment"
                      value={item3.Adjustment}
                      lable="Adjustment"
                      placeholder=""
                      onChange={(e) => handleInputChangeLT(e, "Adjustment", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="AdjustmentDate"
                      value={item3.AdjustmentDate}
                      lable="AdjustmentDate"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangeLT(e, "AdjustmentDate", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="UpdateRemarks"
                      value={item3.UpdateRemarks}
                      lable="UpdateRemarks"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangeLT(e, "UpdateRemarks", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="IsDocumentUploaded"
                      value={item3.IsDocumentUploaded}
                      lable="IsDocumentUploaded"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangeLT(e, "IsDocumentUploaded", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="IPAddress"
                      value={item3.IPAddress}
                      lable="IPAddress"
                      placeholder=""
                      onChange={(e) => handleInputChangeLT(e, "IPAddress", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="PatientIDProof"
                      value={item3.PatientIDProof}
                      lable="PatientIDProof"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangeLT(e, "PatientIDProof", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="PatientIDProofNo"
                      value={item3.PatientIDProofNo}
                      lable="PatientIDProofNo"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangeLT(e, "PatientIDProofNo", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="PatientSource"
                      value={item3.PatientSource}
                      lable="PatientSource"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangeLT(e, "PatientSource", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="PatientType"
                      value={item3.PatientType}
                      lable="PatientType"
                      placeholder=""
                      onChange={(e) => handleInputChangeLT(e, "PatientType", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <SelectBox
                      options={VisitType}
                      id="VisitType"
                      value={item3.VisitType}
                      lable="VisitType"
                      placeholder=""
                      onChange={(e) => handleInputChangeLT(e, "VisitType", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="HLMPatientType"
                      value={item3.HLMPatientType}
                      lable="HLMPatientType"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangeLT(e, "HLMPatientType", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="HLMOPDIPDNo"
                      value={item3.HLMOPDIPDNo}
                      lable="HLMOPDIPDNo"
                      placeholder=""
                      onChange={(e) => handleInputChangeLT(e, "HLMOPDIPDNo", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      disabled={true}
                      id="UsernameWeb"
                      value={item3.UsernameWeb}
                      lable="UsernameWeb"
                      placeholder=""
                      onChange={(e) => handleInputChangeLT(e, "UsernameWeb", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="PasswordWeb"
                      disabled={true}
                      value={item3.PasswordWeb}
                      lable="PasswordWeb"
                      placeholder=""
                      onChange={(e) => handleInputChangeLT(e, "PasswordWeb", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="ReVisit"
                      value={item3.ReVisit}
                      lable="ReVisit"
                      placeholder=""
                      onChange={(e) => handleInputChangeLT(e, "ReVisit", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="LedgerTransactionNoInterface"
                      value={item3.LedgerTransactionNoInterface}
                      lable="LedgerTransactionNoInterface"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangeLT(
                          e,
                          "LedgerTransactionNoInterface",
                          0,
                        )
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="InterfacecompanyName"
                      value={item3.InterfacecompanyName}
                      lable="InterfacecompanyName"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangeLT(e, "InterfacecompanyName", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="HLMUHID"
                      value={item3.HLMUHID}
                      lable="HLMUHID"
                      placeholder=""
                      onChange={(e) => handleInputChangeLT(e, "HLMUHID", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="BedNo"
                      value={item3.BedNo}
                      lable="BedNo"
                      placeholder=""
                      onChange={(e) => handleInputChangeLT(e, "BedNo", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="IsAllowPrint"
                      value={item3.IsAllowPrint}
                      lable="IsAllowPrint"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangeLT(e, "IsAllowPrint", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="RoundOff"
                      value={item3.RoundOff}
                      lable="RoundOff"
                      placeholder=""
                      onChange={(e) => handleInputChangeLT(e, "RoundOff", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="CollectionBoyId"
                      value={item3.CollectionBoyId}
                      lable="CollectionBoyId"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangeLT(e, "CollectionBoyId", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="MedicalHistory"
                      value={item3.MedicalHistory}
                      lable="MedicalHistory"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangeLT(e, "MedicalHistory", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="IsMedicalHistory"
                      value={item3.IsMedicalHistory}
                      lable="IsMedicalHistory"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangeLT(e, "IsMedicalHistory", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="Source"
                      value={item3.Source}
                      lable="Source"
                      placeholder=""
                      onChange={(e) => handleInputChangeLT(e, "Source", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="ReferLabId"
                      value={item3.ReferLabId}
                      lable="ReferLabId"
                      placeholder=""
                      onChange={(e) => handleInputChangeLT(e, "ReferLabId", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="ReferLabName"
                      value={item3.ReferLabName}
                      lable="ReferLabName"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangeLT(e, "ReferLabName", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="MedicalHistoryCount"
                      value={item3.MedicalHistoryCount}
                      lable="MedicalHistoryCount"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangeLT(e, "MedicalHistoryCount", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="UploadDocumentCount"
                      value={item3.UploadDocumentCount}
                      lable="UploadDocumentCount"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangeLT(e, "UploadDocumentCount", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="ReportDeliveryMethodId"
                      value={item3.ReportDeliveryMethodId}
                      lable="ReportDeliveryMethodId"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangeLT(e, "ReportDeliveryMethodId", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="ReportDeliveryMethodDetail"
                      value={item3.ReportDeliveryMethodDetail}
                      lable="ReportDeliveryMethodDetail"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangeLT(e, "ReportDeliveryMethodDetail", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="IsConcentForm"
                      value={item3.IsConcentForm}
                      lable="IsConcentForm"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangeLT(e, "IsConcentForm", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="CompanyID"
                      disabled={true}
                      value={item3.CompanyID}
                      lable="CompanyID"
                      placeholder=""
                      onChange={(e) => handleInputChangeLT(e, "CompanyID", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="isActive"
                      value={item3.isActive}
                      lable="isActive"
                      placeholder=""
                      onChange={(e) => handleInputChangeLT(e, "isActive", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <DatePicker
                      className="custom-calendar"
                      id="dtEntry"
                      value={item3.dtEntry ? new Date(item3.DATE) : ""}
                      lable="dtEntry"
                      placeholder=""
                      onChange={(e) => dateSelectLT(e, "dtEntry", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <SelectBox
                      options={user}
                      id="CreatedBy"
                      selectedValue={item3.CreatedBy}
                      lable="CreatedBy"
                      placeholder=""
                      onChange={(e) => handleInputChangeLT(e, "CreatedBy", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="CreatedByName"
                      value={item3.CreatedByName}
                      lable="CreatedByName"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangeLT(e, "CreatedByName", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <DatePicker
                      className="custom-calendar"
                      id="dtUpdate"
                      value={item3.dtUpdate ? new Date(item3.dtUpdate) : ""}
                      lable="dtUpdate"
                      placeholder=""
                      onChange={(e) => dateSelectLT(e, "dtUpdate", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <SelectBox
                      options={user}
                      id="UpdatedBy"
                      selectedValue={item3.UpdatedBy}
                      lable="UpdatedBy"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangeWithLabelLT(
                          e,
                          "UpdatedBy",
                          0,
                          "UpdatedByName",
                        )
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="UpdatedByName"
                      value={item3.UpdatedByName}
                      lable="UpdatedByName"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangeLT(e, "UpdatedByName", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="IsDiscountApproved"
                      value={item3.IsDiscountApproved}
                      lable="IsDiscountApproved"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangeLT(e, "IsDiscountApproved", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <SelectBox
                      options={user}
                      id="DiscountApprovedByID"
                      selectedValue={item3.DiscountApprovedByID}
                      lable="DiscountApprovedByID"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangeWithLabelLT(
                          e,
                          "DiscountApprovedByID",
                          0,
                          "DiscountApprovedByName",
                        )
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="DiscountApprovedByName"
                      value={item3.DiscountApprovedByName}
                      lable="DiscountApprovedByName"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangeLT(e, "DiscountApprovedByName", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <DatePicker
                      className="custom-calendar"
                      value={
                        item3.DiscountApprovedDate
                          ? new Date(item3.DiscountApprovedDate)
                          : ""
                      }
                      id="DiscountApprovedDate"
                      lable="DiscountApprovedDate"
                      placeholder=""
                      onChange={(e) =>
                        dateSelectLT(e, "DiscountApprovedDate", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="DiscountID"
                      value={item3.DiscountID}
                      lable="DiscountID"
                      placeholder=""
                      onChange={(e) => handleInputChangeLT(e, "DiscountID", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="CouponId"
                      value={item3.CouponId}
                      lable="CouponId"
                      placeholder=""
                      onChange={(e) => handleInputChangeLT(e, "CouponId", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="CouponCode"
                      value={item3.CouponCode}
                      lable="CouponCode"
                      placeholder=""
                      onChange={(e) => handleInputChangeLT(e, "CouponCode", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="IsCoupon"
                      value={item3.IsCoupon}
                      lable="IsCoupon"
                      placeholder=""
                      onChange={(e) => handleInputChangeLT(e, "IsCoupon", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="Remarks"
                      value={item3.Remarks}
                      lable="Remarks"
                      placeholder=""
                      onChange={(e) => handleInputChangeLT(e, "Remarks", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="SrfId"
                      value={item3.SrfId}
                      lable="SrfId"
                      placeholder=""
                      onChange={(e) => handleInputChangeLT(e, "SrfId", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="IcmrId"
                      value={item3.IcmrId}
                      lable="IcmrId"
                      placeholder=""
                      onChange={(e) => handleInputChangeLT(e, "IcmrId", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="SecondReferDoctor"
                      value={item3.SecondReferDoctor}
                      lable="SecondReferDoctor"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangeLT(e, "SecondReferDoctor", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="DocketNo"
                      value={item3.DocketNo}
                      lable="DocketNo"
                      placeholder=""
                      onChange={(e) => handleInputChangeLT(e, "DocketNo", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="IsCourier"
                      value={item3.IsCourier}
                      lable="IsCourier"
                      placeholder=""
                      onChange={(e) => handleInputChangeLT(e, "IsCourier", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="PNameVip"
                      value={item3.PNameVip}
                      lable="PNameVip"
                      placeholder=""
                      onChange={(e) => handleInputChangeLT(e, "PNameVip", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="IsConcern"
                      value={item3.IsConcern}
                      lable="IsConcern"
                      placeholder=""
                      onChange={(e) => handleInputChangeLT(e, "IsConcern", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="OrderID"
                      disabled={true}
                      value={item3.OrderID}
                      lable="OrderID"
                      placeholder=""
                      onChange={(e) => handleInputChangeLT(e, "OrderID", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="WhatsappnotRequired"
                      value={item3.WhatsappnotRequired}
                      lable="WhatsappnotRequired"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangeLT(e, "WhatsappnotRequired", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="NoOfChildren"
                      value={item3.NoOfChildren}
                      lable="NoOfChildren"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangeLT(e, "NoOfChildren", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="NoOfSon"
                      value={item3.NoOfSon}
                      lable="NoOfSon"
                      placeholder=""
                      onChange={(e) => handleInputChangeLT(e, "NoOfSon", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="NoOfDaughter"
                      value={item3.NoOfDaughter}
                      lable="NoOfDaughter"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangeLT(e, "NoOfDaughter", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="AgeOfSon"
                      value={item3.AgeOfSon}
                      lable="AgeOfSon"
                      placeholder=""
                      onChange={(e) => handleInputChangeLT(e, "AgeOfSon", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="AgeOfDaughter"
                      value={item3.AgeOfDaughter}
                      lable="AgeOfDaughter"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangeLT(e, "AgeOfDaughter", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="IsPndt"
                      value={item3.IsPndt}
                      lable="IsPndt"
                      placeholder=""
                      onChange={(e) => handleInputChangeLT(e, "IsPndt", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="PNDTDoctor"
                      value={item3.PNDTDoctor}
                      lable="PNDTDoctor"
                      placeholder=""
                      onChange={(e) => handleInputChangeLT(e, "PNDTDoctor", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="Husband"
                      value={item3.Husband}
                      lable="Husband"
                      placeholder=""
                      onChange={(e) => handleInputChangeLT(e, "Husband", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <DatePicker
                      className="custom-calendar"
                      id="DateOfPregnancy"
                      value={
                        item3.DateOfPregnancy
                          ? new Date(item3.DateOfPregnancy)
                          : ""
                      }
                      lable="DateOfPregnancy"
                      placeholder=""
                      onChange={(e) => dateSelectLT(e, "DateOfPregnancy", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="ProEmployee"
                      value={item3.ProEmployee}
                      lable="ProEmployee"
                      placeholder=""
                      onChange={(e) => handleInputChangeLT(e, "ProEmployee", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="ID_Passport"
                      value={item3.ID_Passport}
                      lable="ID_Passport"
                      placeholder=""
                      onChange={(e) => handleInputChangeLT(e, "ID_Passport", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="Nationality"
                      value={item3.Nationality}
                      lable="Nationality"
                      placeholder=""
                      onChange={(e) => handleInputChangeLT(e, "Nationality", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="Category"
                      value={item3.Category}
                      lable="Category"
                      placeholder=""
                      onChange={(e) => handleInputChangeLT(e, "Category", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="HisBillNo"
                      value={item3.HisBillNo}
                      lable="HisBillNo"
                      placeholder=""
                      onChange={(e) => handleInputChangeLT(e, "HisBillNo", 0)}
                    />
                  </div>
                  <div className="col-sm-2 mb-1">
                    <Input
                      type="text"
                      id="ReportftpSend"
                      value={item3.ReportftpSend}
                      lable="ReportftpSend"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangeLT(e, "ReportftpSend", 0)
                      }
                    />
                  </div>
                  <div className="col-sm-3 mb-1">
                    <Input
                      type="text"
                      id="LedgertransactionIDHash"
                      disabled={true}
                      value={item3.LedgertransactionIDHash}
                      lable="LedgertransactionIDHash"
                      placeholder=""
                      onChange={(e) =>
                        handleInputChangeLT(e, "LedgertransactionIDHash", 0)
                      }
                    />
                  </div>
                </div>{" "}
              </>
            )}
            <div className="row ml-2 mb-2">
              <div className="col-sm-1">
                {load ? (
                  <Loading />
                ) : (
                  <button
                    className="btn btn-success btn-block btn-sm"
                    onClick={handleUpdate}
                    disabled={ploData?.length == 0}
                  >
                    {t("Update")}
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </Accordion>
    </div>
  );
};

export default TestWiseRecordUpdate;
