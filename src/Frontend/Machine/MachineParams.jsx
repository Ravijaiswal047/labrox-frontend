import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { axiosInstance } from "../../utils/axiosInstance";
import Input from "../../components/formComponent/Input";
import Tables from "../../components/UI/customTable";
import Loading from "../../components/loader/Loading";
import ReactSelect from "../../components/formComponent/ReactSelect";
import Accordion from "@app/components/UI/Accordion";
import MachineParamModal from "../utils/MachineParamModal";
import { CustomButton, EditButton, SaveButton } from "../../components/UI/CustomButton";

const MachineParams = () => {
  const [Machine, setMachine] = useState([]);
  const [machineIdLoad, setmachineIdLoad] = useState(false);
  const [loadTableData, setLoadTableData] = useState(-1);
  const [loadFieldValue, setLoadFieldValue] = useState(-1);
  const [selectedRow, setSelectedRow] = useState({});
  const [loadDelete, setLoadDelete] = useState(-1);
  const [show, setShow] = useState({
    modal: false,
    type: "Add",
  });
  const [FieldValue, setFieldValue] = useState({
    Machine_ParamID: "",
    LabObservation_ID: "",
  });
  const [active, setActive] = useState({});
  const [getTestBind, setGetTestBind] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [LabTableData, setLabTableData] = useState([]);
  const { t, i18n } = useTranslation();
  const getMachine = () => {
    setmachineIdLoad(true);
    axiosInstance
      .get("MachineGroup/getMachineName")
      .then((res) => {
        let data = res.data.message;
        let Machine = data.map((ele) => {
          return {
            value: ele.MachineID,
            label: ele.Machinename,
          };
        });
        setmachineIdLoad(false);
        setMachine(Machine);
      })
      .catch((err) => {
        setmachineIdLoad(false);
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Error Occured",
        );
      });
  };

  const getTestData = () => {
    axiosInstance
      .get("MachineGroup/getMachineinfo")
      .then((res) => {
        let data = res?.data?.message;
        let Test = data?.map((ele) => {
          return {
            value: ele?.LabObservation_ID,
            label: ele?.Name,
          };
        });
        setGetTestBind(Test);
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Error Occured",
        );
      });
  };

  const handleClick = (e) => {
    const { value } = e.target;
    setFieldValue({ ...FieldValue, LabObservation_ID: value });
  };
  console.log(tableData, active);
  const onclickmachinedata = (id, setBlank) => {
    setActive({ ...id, isId: true });
    console.log(id);
    setLoadTableData(id?.value);
    axiosInstance
      .post("MachineGroup/onclickmachinedata", {
        MachineId: id?.value,
      })
      // .then((res) => {
      //   const data = res?.data?.message;

      //   setTableData(data);

      //   if (data && data.length > 0) {
      //     setFieldValue((prev) => ({
      //       ...prev,
      //       Machine_ParamID: data[0]?.Machine_ParamID || "",
      //       LabObservation_ID: "",
      //     }));
      //   }

      //   setLoadTableData(-1);
      // })
      .then((res) => {
        setTableData(res?.data?.message);
        if (!setBlank) {
          setFieldValue({
            Machine_ParamID: "",
            LabObservation_ID: "",
          });
        }
        setLoadTableData(-1);
      })
      .catch((err) => {
        setTableData([]);
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Error Occured",
        );
        setLoadTableData(-1);
      });
  };

  const bindlabobservationdata = (id, ele) => {
    console.log(ele);
    setSelectedRow(ele);
    setFieldValue({
      ...FieldValue,
      Machine_ParamID: id,
      RoundUpTo: ele?.RoundUpTo,
      Decimalcalc: ele?.Decimalcalc,
      IsRound: ele?.IsRound,
      IsOrderable: ele?.IsOrderable,
    });
    setLoadFieldValue(id);
    axiosInstance
      .post("MachineGroup/bindlabobservationdata", {
        Machine_ParamID: id,
      })
      .then((res) => {
        setLabTableData(res?.data?.message);
        console.log(res?.data?.message);
        setLoadFieldValue(-1);
      })
      .catch((err) => {
        setLabTableData([]);
        setLoadFieldValue(-1);
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Error Occured",
        );
      });
  };

  const SaveObservationData = () => {
    axiosInstance
      .post("MachineGroup/SaveObservationData", FieldValue)
      .then((res) => {
        toast.success(res?.data?.message);
        bindlabobservationdata(FieldValue?.Machine_ParamID);
        setFieldValue({ ...FieldValue, LabObservation_ID: "" });
        onclickmachinedata(active, true);
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Error Occured",
        );
      });
  };

  const DeleteLabobservationData = (id) => {
    setLoadDelete(id?.LabObservation_ID);
    axiosInstance
      .post("MachineGroup/DeleteLabobservationData", {
        LabObservation_ID: id?.LabObservation_ID,
        Machine_ParamID: FieldValue?.Machine_ParamID,
      })
      .then((res) => {
        toast.success(res?.data?.message);
        setLoadDelete(-1);
        bindlabobservationdata(FieldValue?.Machine_ParamID);
        onclickmachinedata(active, true);
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Error Occured",
        );
        setLoadDelete(-1);
      });
  };
  useEffect(() => {
    getMachine();
    getTestData();
  }, []);
  return (
    <>
      {show?.modal && (
        // <MachineParamModal
        //   show={show?.modal}
        //   data={selectedRow}
        //   // data={{
        //   //   Machineparam: active?.value,
        //   //   Machine_ParamID:
        //   //     show?.type === "Add" ? "" : FieldValue?.Machine_ParamID,
        //   //   ID: active?.value,
        //   //   Decimalcalc: FieldValue?.Decimalcalc,
        //   //   RoundUpTo: FieldValue?.RoundUpTo,
        //   //   isEnable: show?.type == "Add" ? false : true,
        //   //   isId: active?.isId,
        //   //   IsRound: FieldValue?.IsRound,
        //   //   IsOrderable: FieldValue?.IsOrderable,
        //   //   CommaRemoveSeprate: FieldValue?.CommaRemoveSeprate,
        //   // }}
        //   // data={{
        //   //   Machineparam: active?.value,
        //   //   Machine_ParamID: FieldValue?.Machine_ParamID,
        //   //   Decimalcalc: FieldValue?.Decimalcalc,
        //   //   RoundUpTo: FieldValue?.RoundUpTo,
        //   //   IsRound: FieldValue?.IsRound,
        //   //   IsOrderable: FieldValue?.IsOrderable,
        //   // }}
        //   active={active}
        //   onclickmachinedata={onclickmachinedata}
        //   bindlabobservationdata={bindlabobservationdata}
        //   handleClose={() =>
        //     setShow({
        //       modal: false,
        //       type: "",
        //     })
        //   }
        // />
        <MachineParamModal
          show={show?.modal}
          data={show?.type === "Add" ? {} : selectedRow}
          active={active}
          onclickmachinedata={onclickmachinedata}
          bindlabobservationdata={bindlabobservationdata}
          handleClose={() =>
            setShow({
              modal: false,
              type: "",
            })
          }
        />
      )}
      <Accordion
        name={t("Machine Param")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div>
          <div className="row">
            {machineIdLoad ? (
              <Loading />
            ) : (
              <div className="col-sm-3">
                <Tables>
                  <thead className="cf">
                    <tr className="bg-primary">
                      <th>{t("Machine")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Machine.map((ele, index) => (
                      <tr
                        key={index}
                        className={`${active?.value === ele?.value && "bg-success"
                          }`}
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          onclickmachinedata(ele);
                        }}
                      >
                        <td data-title={t("Machine ID")}>
                          {loadTableData === ele?.value ? (
                            <Loading />
                          ) : (
                            ele?.label
                          )}
                        </td>
                      </tr>
                    ))}
                    <tr></tr>
                  </tbody>
                </Tables>
              </div>
            )}

            <div className="col-sm-9">
              <div>
                <div className="row">
                  {tableData?.length > 0 && (
                    <Tables>
                      <thead className="cf">
                        <tr>
                          {[
                            t("Machine_ParamID"),
                            t("MACHINEID"),
                            t("Machine_Param"),
                            t("AssayNo"),
                            t("RoundUpTo"),
                            t("IsOrderable"),
                            t("Decimalcalc"),
                            t("Test"),
                          ].map((ele, index) => (
                            <th key={index}>{ele}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {tableData?.map((ele, index) => (
                          <tr key={index}>
                            <td
                              data-title={t("Machine_ParamID")}
                              className="text-info"
                              style={{
                                cursor: "pointer",
                                textDecoration: "underline",
                              }}
                              onClick={() => {
                                bindlabobservationdata(
                                  ele?.Machine_ParamID,
                                  ele,
                                );
                              }}
                            >
                              {loadFieldValue === ele?.Machine_ParamID ? (
                                <Loading />
                              ) : (
                                ele?.Machine_ParamID
                              )}
                            </td>
                            <td data-title={t("MACHINEID")}>
                              {ele?.MACHINEID}&nbsp;
                            </td>
                            <td data-title={t("Machine_Param")}>
                              {ele?.MachineParam}&nbsp;
                            </td>
                            <td data-title={t("AssayNo")}>
                              {ele?.AssayNo}&nbsp;
                            </td>
                            <td data-title={t("RoundUpTo")}>
                              {ele?.RoundUpTo}&nbsp;
                            </td>
                            <td data-title={t("IsOrderable")}>
                              {ele?.IsOrderable}&nbsp;
                            </td>
                            <td data-title={t("Decimalcalc")}>
                              {ele?.Decimalcalc}&nbsp;
                            </td>
                            <td data-title={t("Test")}>
                              {ele?.Test ? ele?.Test : "-"}&nbsp;
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Tables>
                  )}
                  <div className="col-sm-2 mt-2 mb-1">
                    <EditButton
                      text={"Modify Param"}
                      disabled={!selectedRow?.Machine_ParamID}
                      onClick={() => {
                        // if (!selectedRow?.Machine_ParamID) {
                        //   toast.warn("Please select row first");
                        //   return;
                        // }
                        setShow({
                          modal: true,
                          type: "Modify",
                        });
                      }}
                    />
                  </div>
                  <div className="col-sm-2 mt-2">
                    <SaveButton
                      text={"Add Param"}
                      onClick={() => {
                        setSelectedRow({});
                        setShow({
                          modal: true,
                          type: "Add",
                        });
                      }}
                    />
                  </div>
                </div>
              </div>

              {FieldValue?.Machine_ParamID && (
                <>
                  <div className="row mt-2 mb-2">
                    <div className="col-sm-2 col-md-2">
                      <Input
                        type="text"
                        className="form-control input-sm"
                        value={FieldValue?.Machine_ParamID}
                      />
                    </div>

                    <div className="col-sm-4 col-md-4">
                      <ReactSelect
                        dynamicOptions={getTestBind}
                        value={FieldValue?.LabObservation_ID}
                        onChange={(_, selectedOption) => {
                          setFieldValue({
                            ...FieldValue,
                            LabObservation_ID: selectedOption?.value,
                          });
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <Tables>
                      <thead className="cf">
                        <tr>
                          {[t("LabObservation_ID"), t("Test Name")].map(
                            (ele, index) => (
                              <th key={index}>{ele}</th>
                            ),
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {LabTableData?.map((ele, index) => (
                          <tr key={index}>
                            <td
                              data-title={t("LabObservation_ID")}
                              className="text-info"
                              style={{
                                cursor: "pointer",
                                textDecoration: "underline",
                              }}
                              onClick={() => {
                                if (
                                  window.confirm(
                                    "Are you sure you wish to delete this item?",
                                  )
                                )
                                  DeleteLabobservationData(ele);
                              }}
                            >
                              {loadDelete === ele?.LabObservation_ID ? (
                                <Loading />
                              ) : (
                                ele?.LabObservation_ID
                              )}
                            </td>
                            <td data-title={t("Test Name")}>
                              <span
                                style={{
                                  wordWrap: "break-word",
                                  whiteSpace: "normal",
                                }}
                              >
                                {" "}
                                {ele?.NAME}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Tables>
                  </div>
                  <div>
                    <div className="row mt-2 mb-2">
                      <div className="col-sm-1">
                        <CustomButton
                          text={"Add"}
                          icon={"add"}
                          onClick={SaveObservationData}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </Accordion>
    </>
  );
};

export default MachineParams;
