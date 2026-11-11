import React, { useEffect, useState } from "react";
import Accordion from "../../../../components/UI/Accordion";
import { useTranslation } from "react-i18next";
import RadioInput from "../../../../components/formComponent/RadioInput";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import { Button } from "react-bootstrap";
import "./WestgardRuleMaster.css";
import { ViewMenu } from "../../../../components/SvgIcons";
import QCFrameMenu from "../QCFrameMenu";
import { apiUrls } from "../../../../utils/apiUrls";
import { axiosInstance } from "../../../../utils/axiosInstance";
import { notify } from "../../../../utils/utils";
import { useDispatch } from "react-redux";
import { setLoading } from "../../../../store/reducers/loadingSlice/loadingSlice";
import { useLocalStorage } from "../../../../utils/hooks/useLocalStorage";
import Heading from "../../../../components/UI/Heading";
import {CustomButton} from "../../../../components/UI/CustomButton";

const WestgardRuleMaster = () => {
  const { t } = useTranslation();

  const [payload, setPayload] = useState({
    ApplyType: "1",
    Centre: "0",
    Machine: "",
    Parameter: "",
  });

  const [rules, setRules] = useState([]);
  const [showMore, setShowMore] = useState(false);
  const [apiRules, setApiRules] = useState([]);
  const [dropdownlist, setDropdownlist] = useState({
    centreList: [],
    machineList: [],
    parameterList: [],
  });
  const [selectedRule, setSelectedRule] = useState(null);
  const {ShowDefaultLoginCentre} = useLocalStorage("userData", "get");
  const DefaultCentre = useLocalStorage("DefaultCentre", "get");
  const dispatch = useDispatch();

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
          setPayload((prev) => ({ ...prev, Centre: DefaultCentre }));
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

  const getMachineList = async (centreId) => {
    // console.log("centerid..............",centreId);
    dispatch(setLoading(true));
    await axiosInstance
      .post(apiUrls.GetMachinesByLab, {
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

  const getParameterList = async (machineId) => {
    console.log("parameter..............", machineId);
    dispatch(setLoading(true));
    await axiosInstance
      .post(apiUrls.GetParametersByMachine, {
        machineId: machineId.toString(),
      })
      .then((res) => {
        const resList = res?.data?.message?.map((item) => ({
          ...item,
          label: item?.ParameterName,
          value: item?.InvestigationID,
        }));
        setDropdownlist((prev) => ({ ...prev, parameterList: resList }));
        // setPayload((prev) => ({ ...prev, Parameter: resList?.[0]?.label }));
      })
      .catch((err) => {
        notify(err?.data?.message, "error");
      });
    dispatch(setLoading(false));
  };

  const getRuleData = async (customPayload = payload) => {
    console.log("inside API");
    const defaultPayload = {
      isDefault: customPayload?.ApplyType || "",
      machineId: customPayload?.Machine || "",
      parameterId: customPayload?.Parameter.toString() || "",
      centreId: customPayload?.Centre.toString() || "",
    };
    dispatch(setLoading(true));
    await axiosInstance
      .post(apiUrls.GetWestgardRules, defaultPayload)
      .then((res) => {
        console.log("res", res);
        if (
          res.data?.success &&
          Array.isArray(res?.data?.message) &&
          res.data.message.length > 0
        ) {
          setRules(res?.data?.message); 
          setApiRules(res?.data?.message);
        }
        else {
          // No rules configured yet for this selection — keep showing the
          // previously loaded rules so the user can adjust and save them
          // against the newly selected machine/parameter instead of seeing a blank table.
          notify(res?.data?.message || "No Data Found", "warn");
        }

      })
      .catch((err) => {
        notify(err?.data?.message, "error");
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  };

  const handleReset = () => {
    setPayload((prev) => ({...prev, ApplyType: "1",Machine: "null", Parameter: "null"}))
    getRuleData({
      ApplyType: "1",
      Centre: "0",
      Machine: "null",
      Parameter: "null",
    });
  };
  // console.log("rules",rules);

  const handleReactChange = (name, e) => {
    if (name === "Centre") {
      getMachineList(e?.value);
      setPayload((prev) => ({ ...prev, [name]: e?.value }));
      return;
    } else if (name === "Machine") {
      getParameterList(e?.value);
      setPayload((prev) => ({ ...prev, [name]: e?.value }));
      return;
    } else if (name === "Parameter") {
      setPayload((prev) => {
        const updatedPayload = { ...prev, [name]: e?.value };
        // 🚀 Call API when parameter changes
        getRuleData(updatedPayload);
        return updatedPayload;
      });
      return;
    }
    setPayload((prev) => ({ ...prev, [name]: e?.value }));
  };

  const handleApplyTypeChange = (value) => {
    setPayload((prev) => ({ ...prev, ApplyType: value }));
    if (value === "0") {
      // Specific → all Off
      setRules((prev) => prev.map((r) => ({ ...r, RuleAction: "Off" })));
    } else {
      handleReset();
      // setRules(apiRules);
    }
  };
  const handleSyncRule = async (rulename) => {
    console.log("rulename", rulename);
    const payload = { ruleName: rulename };

    dispatch(setLoading(true));
    try {
      // console.log("Sync response", res);
      const res = await axiosInstance.post(apiUrls.GetRuleData, payload); // <-- replace with your API endpoint
      setSelectedRule(res?.data?.message || []);
      notify(res?.data?.success, "success");
    } catch (err) {
      notify(err?.response?.data?.message || "Failed to sync rule", "error");
    } finally {
      dispatch(setLoading(false));
    }
  };
  console.log("selected rule", selectedRule);
  const handleSaveRuleData = async () => {
    // Transform rules + payload into required API structure
    console.log("save.......");
    const savePayload = rules?.map((rule) => ({
      ruleName: rule.RuleName,
      ruleAction: rule.RuleAction,
      isDefault: payload?.ApplyType,
      machineID: payload?.Machine,
      labObservation_ID: payload?.Parameter.toString(), // assuming Parameter is this
      checkLevel: rule.CheckLevel ? 1 : 0,
      centreId: payload?.Centre.toString(),
    }));

    console.log("savePayload", savePayload);

    dispatch(setLoading(true));
    try {
      const res = await axiosInstance.post(apiUrls.SaveRuleData, savePayload);
      if(res?.data?.success){
        notify(res?.data?.message, "success");
        handleReset();
      }
      console.log("Save response", res);
      
    } catch (err) {
      notify(err?.response?.data?.message || "Failed to save rules", "error");
    } finally {
      dispatch(setLoading(false));
    }
  };
  useEffect(() => {
    getRuleData();
    getAllCentre();
  }, []);
  console.log("payloadxxx", payload);
  console.log("rules", rules);
  return (
    <>
      {showMore && <QCFrameMenu />}
      <Heading
        name={"Westgrad Rule Master"}
        isBreadcrumb={"true"}
        secondTitle={
          <>
            <label onClick={() => setShowMore((prev) => !prev)}>
              <ViewMenu />
            </label>
          </>
        }
      />
        <div className="row p-2 mx-2 mb-1 white-background">
          <RadioInput
            type="radio"
            label="Default"
            // id="ApplyType"
            name="mode"
            checked={payload.ApplyType === "1"}
            onChange={() => handleApplyTypeChange("1")}
            respclass={"col-xl-1 col-md-3 col-sm-4 co-12 "
            
            }
          />
          <RadioInput
            type="radio"
            label="Specific"
            // id="Specific"
            name="mode"
            checked={payload.ApplyType === "0"}
            onChange={() => handleApplyTypeChange("0")}
            respclass={"col-xl-1 col-md-3 col-sm-4 co-12"}
          />
          
          {payload.ApplyType === "0" && (
            <>
              <ReactSelect
                dynamicOptions={dropdownlist?.centreList}
                name="Centre"
                isShowBorder={true}
                lable={t("Centre")}
                id="centre"
                removeIsClearable={false}
                placeholderName={t("Centre")}
                value={payload?.Centre}
                onChange={handleReactChange}
                respclass={"col-xl-2 col-sm-4 col-md-3 col-lg-2 co-12 mt-1"}
              />

              <ReactSelect
                dynamicOptions={dropdownlist?.machineList}
                name="Machine"
                isShowBorder={true}
                lable={t("Machine")}
                id="Machine"
                removeIsClearable={true}
                placeholderName="Machine"
                value={payload?.Machine}
                onChange={handleReactChange}
                respclass={"col-xl-2 col-sm-4 col-md-3 col-lg-2 co-12 mt-1"}
              />

              <ReactSelect
                dynamicOptions={dropdownlist?.parameterList}
                name="Parameter"
                isShowBorder={true}
                lable={t("Parameter")}
                id="Parameter"
                removeIsClearable={true}
                placeholderName="Parameter"
                value={payload?.Parameter}
                onChange={handleReactChange}
                respclass={"col-xl-2 col-sm-4 col-md-3 col-lg-2 co-12 mt-1"}
              />
              
                
                {/* <Button
                  className="rounded py-0 ml-2  bg-danger"
                  onClick={handleReset}
                >
                  Reset
                </Button> */}
                
              
              
            </>
          )}

        {rules?.length > 0 &&
          <CustomButton className="py-0 ml-2 " text="Save" icon="save" onClick={handleSaveRuleData} />
        }
        <CustomButton className="py-0 ml-2 " text="Reset" icon="refresh" onClick={handleReset} />
        </div>
      {/* </Accordion> */}
      {/* Rule Detail Section */}
      <Accordion
        title={t("Rule Detail")}
        defaultValue={true}
        // isBreadcrumb={true}
      >
         {rules?.length > 0 && (
        <div className="row p-2">
          <div className="col-sm-12 col-12 col-md-5">
           
              <div className="warning-container">
                {rules?.map((rule, index) => (
                  <div className="warning-row" key={index}>
                    <button
                      style={{minWidth:"50px"}}
                      className="row-btn text-white rounded"
                      onClick={() => handleSyncRule(rule.RuleName)}
                    >
                      {rule.RuleName}
                    </button>
                    <div className="d-flex">
                      <RadioInput
                        type="radio"
                        label="Fail"
                        // id={rule.RuleName}   // unique id
                        name={rule.RuleName} // group radios by rule
                        checked={rule.RuleAction === "Fail"} // controlled checked
                        onChange={() =>
                          setRules((prev) =>
                            prev.map((r) =>
                              r.RuleName === rule.RuleName
                                ? { ...r, RuleAction: "Fail" }
                                : r,
                            ),
                          )
                        }
                        respclass={"mr-3"} // optional styling
                      />
                      <RadioInput
                        type="radio"
                        label="Warn" // visible text
                        // id={rule.RuleName}   // unique id
                        name={rule.RuleName} // group radios by rule
                        checked={rule.RuleAction === "Warn"} // controlled checked
                        onChange={() =>
                          setRules((prev) =>
                            prev.map((r) =>
                              r.RuleName === rule.RuleName
                                ? { ...r, RuleAction: "Warn" }
                                : r,
                            ),
                          )
                        }
                        respclass={"mr-3"} // optional styling
                      />
                      <RadioInput
                        // key={`${rule.RuleName}-${action}`}

                        type="radio"
                        label="Off" // visible text
                        name={rule.RuleName} // group radios by rule
                        checked={rule.RuleAction === "Off"} // controlled checked
                        onChange={() =>
                          setRules((prev) =>
                            prev.map((r) =>
                              r.RuleName === rule.RuleName
                                ? { ...r, RuleAction: "Off" }
                                : r,
                            ),
                          )
                        }
                        respclass={"mr-3"} // optional styling
                      />
                    </div>
                    <label className="checkbox-row">
                      <input
                        type="checkbox"
                        checked={rule.CheckLevel}
                        onChange={() =>
                          setRules((prev) =>
                            prev.map((r) =>
                              r.RuleName === rule.RuleName
                                ? { ...r, CheckLevel: !rule.CheckLevel }
                                : r,
                            ),
                          )
                        }
                      />
                      <span>
                        <b>Warn if Level2 Available</b>
                      </span>
                    </label>
                  </div>
                ))}
              </div>
           
          </div>
          <div className="col-md-6">
            {selectedRule && (
              <div className="rule-detail-preview p-3 d-flex flex-column flex-md-row">
                <h5>{selectedRule[0].ruleinfo}</h5>
                <img
                  src={selectedRule[0].ruleimage}
                  alt="Rule diagram"
                  style={{
                    width: "300px",
                    height: "auto",
                    border: "1px solid #ccc",
                  }}
                />
              </div>
            )}
          </div>
        </div>
         )}
      </Accordion>
      {/* <div className="row py-2">
        <div className="col-sm-12 d-flex justify-content-end">
          
        </div>
      </div> */}
    </>
  );
};

export default WestgardRuleMaster;
