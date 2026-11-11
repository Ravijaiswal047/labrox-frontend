import React, { useEffect, useState } from "react";
import Accordion from "../../../../components/UI/Accordion";
import { useTranslation } from "react-i18next";
import Input from "../../../../components/formComponent/Input";
import DatePicker from "../../../../components/formComponent/DatePicker";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import { PlusIcon, ViewMenu } from "../../../../components/SvgIcons";
import Heading from "../../../../components/UI/Heading";
import { Button } from "react-bootstrap";
import QCFrameMenu from "../QCFrameMenu";
import { apiUrls } from "../../../../utils/apiUrls";
import { axiosInstance } from "../../../../utils/axiosInstance";
import { notify } from "../../../../utils/utils";
import { useDispatch } from "react-redux";
import { setLoading } from "../../../../store/reducers/loadingSlice/loadingSlice";
import { formatStandardDate, validateRequiredFields } from "../../../../utils/helpers";
import { useLocalStorage } from "../../../../utils/hooks/useLocalStorage";
import { CustomButton } from "../../../../components/UI/CustomButton";

const ControlTransfer = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [errors, setErrors] = useState({});
  const initialPayload = {
    ControlProvider: "",
    ControlName: "",
    LotNumber: "",
    StartDate: new Date(),
    LotExpiry: new Date(),
    Department: "",
    Machine: "",
    MachineName2: "",
    DepartmentID: "",
    Centre: "",
    Control: "",
    Machine2: "",
    Centre2: "",
    // StartDateFormatted: "",
    // LotExpiryFormatted: "",
  };

  const [payload, setPayload] = useState(initialPayload);
  const {ShowDefaultLoginCentre} = useLocalStorage("userData", "get");
  const DefaultCentre = useLocalStorage("DefaultCentre", "get");

  const [selectAll, setSelectAll] = useState(false);
  
  const [showMore, setShowMore] = useState(false);

  const [dropdownlist, setDropdownlist] = useState({
    centreList: [],
    machineList: [],
    controlList: [],
    departmentList: [],
  });

  const dateSelect = (date, name) => {
        setPayload((prev) => ({
            ...prev,
            [name]: date,
        }));
    };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPayload((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? "1" : "0") : value,
    }));
  };

  const handleSaveTransferData = async () => {
    console.log("SaveTransferData..............");
    const requiredFields = [
          "Centre",
          "Machine",
          "Control",
          "Centre2",
          "Machine2",
          "ControlProvider",
          "ControlName",
          "LotNumber",
          "StartDate",
          "LotExpiry",
          "Department"
        ];    
    const errors = validateRequiredFields(payload, requiredFields);
    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      return; 
    }   
    const savePayload = {
      fromMachine: payload.Machine || "",
      fromCentre: payload.Centre.toString() || "",
      toCentre: payload.Centre2.toString() || "",
      toMachineID: payload.Machine2 || "",
      toMachineName: payload.MachineName2 || "",
      oldControlID: payload.Control.toString() || "",
      controlProvider: payload.ControlProvider || "",
      controlName: payload.ControlName || "",
      lotNumber: payload.LotNumber || "",
      dateStart: formatStandardDate(payload?.StartDate),
      lotExpiry: formatStandardDate(payload?.LotExpiry),
      subcategoryId: payload.DepartmentID.toString() || "",
      subcategoryName: payload.Department || "",
    };
    dispatch(setLoading(true));
    await axiosInstance
      .post(apiUrls.TransferData, savePayload)
      .then((res) => {
        console.log("Save.......", res);
        if(res?.data?.success){
          notify(res?.data?.message, "success");
        }
        else{
          notify(res?.data?.message, "warn");
        }
        handleReset();
        
      })
      .catch((err) => {
        notify(err?.data?.message, "error");
      });
    dispatch(setLoading(false));
  };

  const handleReset = () => {
    setPayload((prev) => ({...initialPayload, Centre: prev.Centre }));
    setErrors({});
  };

  const getControlList = async (machineId) => {
    console.log("parameter..............", machineId);
    dispatch(setLoading(true));
    await axiosInstance
      .post(apiUrls.BindTransferControl, {
        machineId: machineId.toString(),
      })
      .then((res) => {
        const resList = res?.data?.message?.map((item) => ({
          ...item,
          label: item?.ControlName,
          value: item?.controlid,
        }));
        setDropdownlist((prev) => ({ ...prev, controlList: resList }));
        setPayload((prev) => ({ ...prev, Control: resList?.[0]?.value }));
      })
      .catch((err) => {
        notify(err?.data?.message, "error");
      });
    dispatch(setLoading(false));
  };

  const handleReactChange = (name, e) => {
    const value = e?.value;

    if (name === "Centre") {
      getMachineList(value); 
      setPayload((prev) => ({ ...prev, [name]: value }));
    } else if (name === "Centre2") {
      getMachineList(value); // call machine API for second center
      setPayload((prev) => ({ ...prev, [name]: value }));
    } else if (name === "Machine") {
      getControlList(value);
      setPayload((prev) => ({ ...prev, [name]: value }));
    } else if (name === "Machine2") {
      // If you need a control list for Machine2, call getControlList(value) here
      setPayload((prev) => ({
        ...prev,
        [name]: value,
        MachineName2: e?.label,
      }));
    }
    if (name === "Department") {
      setPayload((prev) => ({
        ...prev,
        Department: e?.Department, // store name
        DepartmentID: e?.DepartmentID, // store id
      }));
    } else {
      setPayload((prev) => ({ ...prev, [name]: value }));
    }
  };

  const getDepartmentList = async () => {
    // console.log("centerid..............",centreId);
    dispatch(setLoading(true));
    await axiosInstance
      .get(apiUrls.GetDepartments)
      .then((res) => {
        const departmentList = res?.data?.message?.map((item) => ({
          ...item,
          label: item?.Department,
          value: item?.DepartmentID,
        }));
        setDropdownlist((prev) => ({
          ...prev,
          departmentList: departmentList,
        }));
        // setPayload((prev) => ({
        //   ...prev,
        //   Department: departmentList?.[0]?.label,
        //   DepartmentID: departmentList?.[0]?.value,
        // }));
      })
      .catch((err) => {
        notify(err?.data?.message, "error");
      });
    dispatch(setLoading(false));
  };

  const getMachineList = async (centreId) => {
    // console.log("centerid..............",centreId);
    dispatch(setLoading(true));
    await axiosInstance
      .post(apiUrls.BindTransferMachine, {
        centreId: centreId.toString(),
      })
      .then((res) => {
        console.log("res..........", res);
        const resList = res?.data?.message?.map((item) => ({
          ...item,
          label: item?.MachineName,
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
        if (ShowDefaultLoginCentre === "1") {
          setPayload((prev) => ({ ...prev, Centre: DefaultCentre ?? resList?.[0]?.value }));
          getMachineList(DefaultCentre || resList?.[0]?.value || "");
        }
        else{
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
  useEffect(() => {
    getAllCentre();
    getDepartmentList();
  }, []);
  console.log("Payload", payload);
  console.log("errors",errors);
  return (
    <>
      {showMore && <QCFrameMenu />}
      <Heading
                            name={"Control Transfer"}
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
          <div className="col-xl-2 col-sm-4 col-md-3 col-lg-2 col-12">
            <ReactSelect
            name="Centre"
            id="centre"
            removeIsClearable={true}
            dynamicOptions={dropdownlist?.centreList}
            placeholderName={t("From Processing Lab")}
            value={payload?.Centre}
            onChange={handleReactChange}
            
          />
          {payload?.Centre === "" && (
                    <span className="error-message">{errors?.Centre}</span>
                  )}
          </div>
          
          <div className="col-xl-2 col-sm-4 col-md-3 col-lg-2 col-12">
          <ReactSelect
            name="Machine"
            id="Machine"
            removeIsClearable={true}
            dynamicOptions={dropdownlist?.machineList}
            placeholderName={t("From Machine")}
            value={payload?.Machine}
            onChange={handleReactChange}
            
          />
          {payload?.Machine === "" && (
                    <span className="error-message">{errors?.Machine}</span>
                  )}
          </div>
          <div className="col-xl-2 col-sm-4 col-md-3 col-lg-2 col-12">
          <ReactSelect
            name="Control"
            id="Control"
            removeIsClearable={true}
            dynamicOptions={dropdownlist?.controlList}
            placeholderName={t("From Control")}
            value={payload?.Control}
            onChange={handleReactChange}
            
          />
          {payload?.Control === "" && (
                    <span className="error-message">{errors?.Control}</span>
                  )}
          </div>
        </div>

        <Heading title={t("New Control Details")}
        //  isBreadcrumb={true} 
         />

        <div className="row p-2 row p-2 white-background">
          <div className="col-xl-2 col-sm-4 col-md-3 col-lg-2 col-12">
          <ReactSelect
            name="Centre2"
            id="centre2"
            removeIsClearable={true}
            dynamicOptions={dropdownlist?.centreList}
            placeholderName={t("Centre")}
            value={payload?.Centre2}
            onChange={handleReactChange}
            
          />
          {payload?.Centre2 === "" && (
                    <span className="error-message">{errors?.Centre2}</span>
                  )}
          </div>
          <div className="col-xl-2 col-sm-4 col-md-3 col-lg-2 col-12">
          <ReactSelect
            name="Machine2"
            id="Machine2"
            removeIsClearable={true}
            dynamicOptions={dropdownlist?.machineList}
            placeholderName={t("Machine")}
            value={payload?.Machine2}
            onChange={handleReactChange}
            
          />
          {payload?.Machine2 === "" && (
                    <span className="error-message">{errors?.Machine2}</span>
                  )}
          </div>
          <div className="col-xl-2 col-sm-4 col-md-3 col-lg-2 col-12">
          <Input
            type="text"
            placeholder=" "
            lable={t("Control Provider")}
            id="ControlProvider"
            name="ControlProvider"
            value={payload?.ControlProvider}
            onChange={handleChange}
            
            // className="required-fields"
          />
          {payload?.ControlProvider === "" && (
                    <span className="error-message">{errors?.ControlProvider}</span>
                  )}
          </div>
          <div className="col-xl-2 col-sm-4 col-md-3 col-lg-2 col-12">
          <Input
            type="text"
            placeholder=" "
            lable={t("Control Name")}
            id="ControlName"
            name="ControlName"
            value={payload?.ControlName}
            onChange={handleChange}
            
            // className="required-fields"
          />
          {payload?.ControlName === "" && (
                    <span className="error-message">{errors?.ControlName}</span>
                  )}
          </div>
          <div className="col-xl-2 col-sm-4 col-md-3 col-lg-2 col-12">
          <Input
            type="text"
            placeholder=" "
            lable={t("Lot Number")}
            id="LotNumber"
            name="LotNumber"
            value={payload?.LotNumber}
            onChange={handleChange}
            
            // className="required-fields"
          />
          {payload?.LotNumber === "" && (
                    <span className="error-message">{errors?.LotNumber}</span>
                  )}
          </div>
          <div className="col-xl-2 col-sm-4 col-md-3 col-lg-2 col-12">
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
          <div className="col-xl-2 col-sm-4 col-md-3 col-lg-2 col-12">
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
          <div className="col-xl-2 col-sm-4 col-md-3 col-lg-2 co-12">
            <div className="d-flex">
              <ReactSelect
                name="Department"
                id="Department"
                removeIsClearable={true}
                dynamicOptions={dropdownlist?.departmentList}
                placeholderName={t("Department")}
                value={payload?.DepartmentID}
                onChange={handleReactChange}
                respclass="w-100"
              />
            </div>
            {payload?.Department === "" && (
                    <span className="error-message">{errors?.Department}</span>
                  )}
          </div>
        </div>
      {/* </Accordion> */}

      
        <div className="d-flex justify-content-end white-background ">
          <CustomButton text="Save" onClick={handleSaveTransferData} icon="save" className="mr-2 mb-2"/>
          <CustomButton text="Reset" onClick={handleReset} icon="refresh" className="mb-2"/>
        </div>
      
    </>
  );
};

export default ControlTransfer;
