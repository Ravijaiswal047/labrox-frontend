import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { axiosInstance } from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import Accordion from "@app/components/UI/Accordion";
import { SelectBox } from "../../components/formComponent/SelectBox";
import Tables from "../../components/UI/customTable";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import Loading from "../../components/loader/Loading";
import { FaFileExcel } from "react-icons/fa";
import { ExportToExcel, PreventCharacter } from "../../utils/helpers";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { CustomButton } from "../../components/UI/CustomButton";
import OutSourceRateImportModal from "./OutSourceRateImportModal";
import OutSourceTransferModal from "./OutSourceTransferModal";
import Modal from "../../components/formComponent/Modal";


const OutSourceTestMaster = () => {
  const [load, setLoad] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [TestSuggestion, setTestSuggestion] = useState([]);
  const [CentreData, setCentreData] = useState([]);
  const [OutSourceLabData, setOutSourceLabData] = useState([]);
  const [Department, setDepartment] = useState([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [templateType, setTemplateType] = useState("");
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const [logData, setLogData] = useState([]);
  const tatTypeLabel = {
    0: "Hours",
    1: "Days"
  };
  
  const [payload, setPayload] = useState({
    OutSourceLabID: "",
    OutSourceLabName: "",
    BookingCentreID: "",
    BookingCentreName: "",
    DepartmentID: "",
    InvestigationID: 0,
  });

  const { t } = useTranslation();

  const validationFields = (key) => {
    let error = "";
    if (!payload?.BookingCentreID) {
      error = "Please Select From Centre  ";
    } 
    else if (!payload?.OutSourceLabID) {
      error = "Please Select OutSourceLab ";
    }
    else if (!payload?.DepartmentID && !payload?.InvestigationID) {
      error = "Please Select Department/Investigations ";
    } 
    
    return key ? error : "";
  };

  // const handleSelectChange = (event) => {
  //   const { name, value, selectedIndex } = event?.target;
  //   const label = event?.target?.children[selectedIndex].text;
  //   if (name === "OutSourceLabID") {
  //     setPayload({
  //       ...payload,
  //       [name]: value,
  //       OutSourceLabName: label,
  //     });
  //     handleSearch(
  //       value,
  //       label,
  //       payload.BookingCentreID,
  //       payload.BookingCentreName,
  //       payload.DepartmentID,
  //       payload.InvestigationID,
  //       false,
  //     );
  //   } else if (name === "BookingCentreID") {
  //     setPayload({
  //       ...payload,
  //       [name]: value,
  //       BookingCentreName: label,
  //     });
  //     handleSearch(
  //       payload.OutSourceLabID,
  //       payload.OutSourceLabName,
  //       value,
  //       label,
  //       payload.DepartmentID,
  //       payload.InvestigationID,
  //       false,
  //     );
  //   } else if (name === "DepartmentID") {
  //     setPayload({
  //       ...payload,
  //       [name]: value,
  //     });
  //     handleSearch(
  //       payload.OutSourceLabID,
  //       payload.OutSourceLabName,
  //       payload.BookingCentreID,
  //       payload.BookingCentreName,
  //       value,
  //       payload.InvestigationID,
  //       false,
  //     );
  //     BindTestData(value);
  //   } else {
  //     setPayload({
  //       ...payload,
  //       [name]: value,
  //     });
  //     handleSearch(
  //       payload.OutSourceLabID,
  //       payload.OutSourceLabName,
  //       payload.BookingCentreID,
  //       payload.BookingCentreName,
  //       payload.DepartmentID,
  //       value,
  //       false,
  //     );
  //   }
  // };

  const handleSelectChange = (name, value) => {
    
    if (name === "OutSourceLabID") {
      setPayload({
        ...payload,
        [name]: value?.value.toString(),
        OutSourceLabName: value?.label,
      });
      // handleSearch(
      //   value?.value.toString(),
      //   value?.label,
      //   payload.BookingCentreID,
      //   payload.BookingCentreName,
      //   payload.DepartmentID,
      //   payload.InvestigationID,
      //   false,
      // );
    } else if (name === "BookingCentreID") {
      setPayload({
        ...payload,
        [name]: value?.value.toString(),
        BookingCentreName: value?.label,
      });
      // handleSearch(
      //   payload.OutSourceLabID,
      //   payload.OutSourceLabName,
      //   value?.value?.toString(),
      //   value?.label,
      //   payload.DepartmentID,
      //   payload.InvestigationID,
      //   false,
      // );
    } else if (name === "DepartmentID") {
      setPayload({
        ...payload,
        [name]: value?.value?.toString(),
      });
      handleSearch(
        payload?.OutSourceLabID,
        payload?.OutSourceLabName,
        payload?.BookingCentreID,
        payload?.BookingCentreName,
        value?.value?.toString(),
        payload?.InvestigationID || "0",
        false,
      );
      BindTestData(value?.value);
    } else {
      setPayload({
        ...payload,
        [name]: value?.value?.toString(),
      });
      handleSearch(
        payload?.OutSourceLabID,
        payload?.OutSourceLabName,
        payload?.BookingCentreID,
        payload?.BookingCentreName,
        payload?.DepartmentID || "0",
        value?.value?.toString(),
        false,
      );
    }
  };

  const getDepartment = () => {
    axiosInstance
      .get("Department/getDepartment")
      .then((res) => {
        let data = res.data.message;
        let Department = data.map((ele) => {
          return {
            value: ele.DepartmentID,
            label: ele.Department,
          };
        });
        Department.unshift({ label: "Select", value: "" });
        setDepartment(Department);
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
        OutSourceLabData.unshift({ label: "Select", value: "" });
        setOutSourceLabData(OutSourceLabData);
      })
      .catch((err) => console.log(err));
  };

  const handleSearch = (
    OutSourceLabID,
    OutSourceLabName,
    BookingCentreID,
    BookingCentreName,
    DepartmentID,
    InvestigationID,
    key,
  ) => {
    const generatedError = validationFields(key);
    if (generatedError === "") {
      setLoad(true);
      axiosInstance
        .post("OutSourceLabRateListMaster/BindItemRateListTable", {
          OutSourceLabID: OutSourceLabID,
          OutSourceLabName: OutSourceLabName,
          BookingCentreID: BookingCentreID,
          BookingCentreName: BookingCentreName,
          DepartmentID: DepartmentID,
          InvestigationID: InvestigationID,
        })
        .then((res) => {
          if (res?.data?.success) {
            const data = res?.data?.message;
            const val = data?.map((ele) => {
              return {
                ...ele,
                isSelect: "0",
              };
            });
            setTableData(val);
          } else {
            setTableData([]);
          }
          setLoad(false);
        })
        .catch((err) => {
          setTableData([]);
          toast.error(
            err?.response?.data?.message
              ? err?.response?.data?.message
              : "Error Occured",
          );
          setLoad(false);
        });
    } else {
      setTableData([]);
      toast.error(generatedError);
    }
  };

  const handleSave = () => {
    setLoad(true);
    const data = tableData.filter((ele) => ele?.isSelect == "1");
    const newPayload = data.map((ele) => {
      return {
        ...ele,
        OutSourceLabID: ele?.LabID,
        BookingCentreID: ele?.CentreID,
        isDefault: ele?.isDefault || "0",
      };
    });
    if (data?.length > 0) {
      const checkrate = newPayload?.filter(
        (ele) => ele?.OutSourceRate == 0 || ele?.OutSourceRate == null,
      );
      if (checkrate?.length == 0) {
        axiosInstance
          .post("OutSourceLabRateListMaster/SaveRateList", {
            OutSourceData: newPayload,
          })
          .then((res) => {
            toast.success(res?.data?.message);
            setLoad(false);
            handleSearch(
              payload?.OutSourceLabID,
              payload?.OutSourceLabName,
              payload?.BookingCentreID,
              payload?.BookingCentreName,
              payload?.DepartmentID || "0",
              payload?.InvestigationID || "0",
              true,
            );
          })
          .catch((err) => {
            toast.error(
              err?.data?.message ? err?.data?.message : "Something Went Wrong",
            );
            setLoad(false);
          });
      } else {
        setLoad(false);
        toast.error("Selected Test Rate Cannot Be Null Or Zero");
      }
    } else {
      setLoad(false);
      toast.error("Please Choose One Test");
    }
  };

  const handleRemove = () => {
    setLoad(true);
    const data = tableData.filter((ele) => ele?.isSelect == "1");
    const newPayload = data.map((ele) => {
      return {
        ...ele,
        OutSourceLabID: ele?.LabID,
        BookingCentreID: ele?.CentreID,
      };
    });
    axiosInstance
      .post("OutSourceLabRateListMaster/UpdateRateList", {
        OutSourceData: newPayload,
      })
      .then((res) => {
        toast.success(res?.data?.message);
        setLoad(false);
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Something Went Wrong",
        );
        setLoad(false);
      });
  };

  const BindTestData = (value) => {
    axiosInstance
      .post("OutSourceTestToOtherLab/GetInvestigationsWithDepartment", {
        DepartmentID: value?.toString() || "",
      })
      .then((res) => {
        const data = res?.data?.message;
        const val = data.map((ele) => {
          return {
            label: ele?.TestName,
            value: ele?.InvestigationID,
          };
        });
        val.unshift({ label: "Select", value: "0" });
        setTestSuggestion(val);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  // console.log(tableData, payload);
  const handleChangeNew = (e, index) => {
    const { name, value, type, checked } = e.target;
    if (index >= 0) {
      let data = [...tableData];
      data[index][name] = type === "checkbox" ? (checked ? "1" : "0") : value;
      setTableData(data);
    } else {
      let data = tableData.map((ele) => {
        return {
          ...ele,
          [name]: type === "checkbox" ? (checked ? "1" : "0") : value,
        };
      });
      setTableData(data);
    }
  };

  const handleRateChange = (e, index) => {
    const { name, value } = e.target;
    const datas = [...tableData];
    if(name === "TAT"){
      if(datas[index]['TATType'] === 0 && value>24){
        return;
      }
      else if(datas[index]['TATType'] === 1 && value>365){
        return;
      }
    } 
    datas[index][name] = value;
    setTableData(datas);
  };

  const handleTATTypeChange = (name, option,index) => {
    console.log("name, value",name,option, index);
    const datas = [...tableData];
    datas[index][name] = option?.value;
    datas[index]['TAT'] = "";
    setTableData(datas);
  }

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
        CentreDataValue.unshift({ label: "Select", value: "" });
        setCentreData(CentreDataValue);
      })
      .catch((err) => console.log(err));
  };

  const ShowBtn = () => {
    const val = tableData.filter((ele) => ele?.isSelect == "1");
    return val.length > 0 ? true : false;
  };

  const handleInputChange = (e,index) => {
    const newValue = e.target.value;
    if (PreventCharacter(newValue)) {
      handleRateChange(e, index); 
    } else {    
      console.log("Invalid input: Only digits are allowed");
    }
  };

  const getLog = (row={}) => {
    console.log("Row Data", row);
     axiosInstance
       .post("OutSourceLabRateListMaster/GetImportRateListLog", {
         outSourceLabID: Number(row?.LabID) || 0,
         bookingCentreID: Number(row?.CentreID) || 0,
         investigationId: Number(row?.InvestigationId) || 0,
       })
       .then((res) => {
        console.log("Log Data", res?.data);
         if (res.data.success && Array.isArray(res?.data?.message)) {
          setLogData(res?.data?.message);
          setShowLog(true);
         } else {
           toast.error(res?.data?.message || "No Record Found");
           setLogData([]);
           setShowLog(false);
         }

       })
       .catch((err) => {
         toast.error(
           err?.response?.data?.message
             ? err?.response?.data?.message
             : "Something Went Wrong"
         );

       });
  };

  const handleExcel = () => {
      console.log("Exporting to Excel");
      const filteredExcelData = tableData.map((item, i) => ({
        "Sr No": i + 1,
        "Centre": item.CentreName,
        "Lab Name": item.LabName,
        "Investigation": item.Investigation,
        "MRP": item.MRP,
        "Out Source Rate": item.OutSourceRate,
        "Out Source Test Name": item.Investigation,  // Assuming you want the investigation as the name
        "Out Source Test Code": item.OutSourceTestCode,
      }));
  
      ExportToExcel(filteredExcelData); 
    };
  

  useEffect(() => {
    getAccessCentres();
    getDepartment();
    BindTestData("");
    getOutSourceLabData();
  }, []);

  console.log("TableData",tableData);
  return (
    <>
      {/* <OutSourceRateImportModal
        open={showImportModal}
        onClose={() => setShowImportModal(false)}
        outSourceLabOptions={OutSourceLabData.filter((o) => o.value !== "")}
        centreOptions={CentreData.filter((o) => o.value !== "")}
      /> */}
      <OutSourceRateImportModal
        open={showImportModal}
        onClose={() => {
          setShowImportModal(false);
          setTemplateType("");
        }}
        templateType={templateType}
        outSourceLabOptions={OutSourceLabData.filter((o) => o.value !== "")}
        centreOptions={CentreData.filter((o) => o.value !== "")}
      />
      <OutSourceTransferModal
        visible={showTransferModal}
        setVisible={setShowTransferModal}
        outSourceLabOptions={OutSourceLabData.filter((o) => o.value !== "")}
        centreOptions={CentreData.filter((o) => o.value !== "")}
      />
      {showLog && (
              <Modal
                visible={showLog}
                setVisible={setShowLog}
                Header={`${t("OutSource Lab")} : ${logData?.[0]?.OutSourceLabName || ""}   |   ${t("Centre Name")} : ${logData?.[0]?.CentreName || ""}`}                modalWidth="90vw"
              >
                <div className="row p-2">
                  <div className="col-12">
                    <Tables style={{ maxHeight: "400px", overflowY: "auto" }}>
                <thead>
                  <tr>
                    <th>{t("S.No")}</th>
                    {/* <th>{t("Lab Name")}</th> */}
                    <th>{t("Outsource Test Name")}</th>
                    <th>{t("Outsource Test Code")}</th>
                    <th>{t("Old Rate")}</th>
                    <th>{t("New Rate")}</th>
                    <th>{t("Created On")}</th>
                    <th>{t("Created By")}</th>
                    <th>{t("Updated On")}</th>
                    <th>{t("Updated By")}</th>
                  </tr>
                </thead>
                      <tbody>
  {logData.length > 0 ? (
    logData.map((log, index) => (
      <tr key={index}>
        <td>{index + 1}</td>

        {/* <td>{log?.OutSourceLabName || "-"}</td> */}

        <td>{log?.NewOutSourceTestName || ""}</td>

        <td>{log?.NewOutSourceTestCode || ""}</td>

        <td>{log?.OldOutSourceRate || ""}</td>

        <td>{log?.NewOutSourceRate || ""}</td>

        <td>
          {log?.OlddtEntry?.value
            ? log?.OlddtEntry?.value.replace("T", " ")
            : ""}
        </td>

        <td>{log?.OldCreatedByName || ""}</td>

        <td>{log?.ImportedOn || ""}</td>

        <td>{log?.ImportedBy || ""}</td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="10" className="text-center">
        {t("No Log Found")}
      </td>
    </tr>
  )}
</tbody>
                    </Tables>
                  </div>
                </div>
              </Modal>
            )}
      <Accordion
        name={t("Out Source Test Master")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row pt-2 pl-2 pr-2">
          <div className="col-sm-2">
            <ReactSelect
              name="BookingCentreID"
              className="required-fields"
              dynamicOptions={CentreData}
              placeholderName={t("From Centre")}
              onChange={handleSelectChange}
              value={payload?.BookingCentreID}
              lable={t("From Centre")}
            />
          </div>
          <div className="col-sm-2">
            <ReactSelect
              name="OutSourceLabID"
              dynamicOptions={OutSourceLabData}
              className="required-fields"
              placeholderName={t("OutSource Lab")}
              value={payload?.OutSourceLabID}
              onChange={handleSelectChange}
              lable={t("OutSource Lab")}
            />
          </div>
          <div className="col-sm-2">
            <ReactSelect
              name="DepartmentID"
              dynamicOptions={Department}
              className="required-fields"
              placeholderName={t("Department")}
              value={payload?.DepartmentID}
              onChange={handleSelectChange}
              lable={t("Department")}
            />
          </div>
          <div className="col-sm-2">
            <ReactSelect
              name="InvestigationID"
              dynamicOptions={TestSuggestion}
              placeholderName={t("Investigation")}
              value={payload?.InvestigationID}
              onChange={handleSelectChange}
              lable={t("Investigation")}
            />
          </div>
          {/* <div className="col-sm-1"> */}
            {/* <button
              className="btn btn-block btn-primary btn-sm"
              onClick={() =>
                handleSearch(
                  payload?.OutSourceLabID,
                  payload?.OutSourceLabName,
                  payload?.BookingCentreID,
                  payload?.BookingCentreName,
                  payload?.DepartmentID,
                  payload?.InvestigationID,
                  true,
                )
              }
            >
              {t("Search")}
            </button> */}
            <CustomButton text="Search" icon="search" onClick={() =>
                handleSearch(
                  payload?.OutSourceLabID,
                  payload?.OutSourceLabName,
                  payload?.BookingCentreID,
                  payload?.BookingCentreName,
                  payload?.DepartmentID,
                  payload?.InvestigationID,
                  true,
                )
              } className="mx-2"/>
          {/* </div> */}
          {/* <div className="col-sm-1"> */}
            {/* <button
              type="submit"
              className="btn btn-block btn-success btn-sm"
              onClick={handleExcel}
            >
              <FaFileExcel style={{ marginRight: "5px", fontSize: "16px" }} />
              {t("Export")}
            </button> */}
            {/* <CustomButton text="Export" onClick={handleExcel} icon="excel" className="mx-2"/> */}
          <CustomButton
            text="Import / Export 1"
            icon="excel"
            onClick={() => {
              setTemplateType("template1");
              setShowImportModal(true);
            }}
            className="mx-2 mb-2"
          />

          <CustomButton
            text="Import / Export 2"
            icon="excel"
            onClick={() => {
              setTemplateType("template2");
              setShowImportModal(true);
            }}
            className="mx-2 mb-2"
          />

           <CustomButton
            text="Import / Export 3"
            icon="excel"
            onClick={() => {
              setTemplateType("template3");
              setShowImportModal(true);
            }}
            className="mx-2 mb-2"
          /> 
          <CustomButton
            text="Transfer"
            icon="forword"
            onClick={() => setShowTransferModal(true)}
            className="mx-2 mb-2"
          />
         {/* </div>  */}
        </div>
      </Accordion>
      <Accordion title={t("Search Data")} defaultValue={true}>
        <div className="row p-2 ">
          <div className="col-12">
            {tableData?.length > 0 ? (
              <>
                <Tables>
                  <thead className="cf">
                    <tr>
                      {[
                        t("S.No"),
                        t("Centre"),
                        t("Lab Name"),
                        t("Investigation"),
                        t("MRP"),
                        t("Out Source Rate"),
                        t("Out Source Test Name"),
                        t("Out Source Test Code"),   
                        t("TAT"),
                        t("TAT Type"),
                        t("Select"),
                        t("Is Default"),
                        t("Log"),
                      ].map((ele, index) => (
                        <th key={index}>{ele}</th>
                      ))}
                       
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((item, index) => (
                      <tr key={index}>
                        <td data-title={t("S.No")}>{index + 1}</td>
                        <td data-title={t("Centre")}>{item?.CentreName}</td>
                        <td data-title={t("Lab Name")}>{item?.LabName}</td>
                        <td data-title={t("Investigation")}>
                          {item?.Investigation}&nbsp;
                        </td>
                        <td data-title={t("MRP")} style={{ textAlign: "center" }}>
                          {item?.isSelect == 1 ? (
                            <input
                              max={6}
                              name="MRP"
                              value={item?.MRP}
                              onChange={(e) => handleInputChange(e, index)}
                              style={{ width: "100px" }}
                            />
                          ) : (
                            item?.MRP
                          )}
                          &nbsp;
                        </td>
                        <td
                          data-title={t("Out Source Rate")}
                          style={{ textAlign: "center" }}
                        >
                          {item?.isSelect == 1 ? (
                            <input
                              max={6}
                              name="OutSourceRate"
                              value={item?.OutSourceRate}
                              onChange={(e) => handleInputChange(e, index)}
                            />
                          ) : (
                            item?.OutSourceRate
                          )}
                          &nbsp;
                        </td>
                        <td
                          data-title={t("Out Source Test Name")}
                          style={{ textAlign: "center" }}
                        >
                          {item?.isSelect == 1 ? (
                            <input
                              max={6}
                              name="OutSourceTestName"
                              value={item?.OutSourceTestName}
                              onChange={(e) => handleRateChange(e, index)}
                            />
                          ) : (
                            item?.OutSourceTestName
                          )}
                          &nbsp;
                        </td>
                        <td
                          data-title={t("Out Source Test Code")}
                          style={{ textAlign: "center" }}
                        >
                          {item?.isSelect == 1 ? (
                            <input
                              max={20}
                              name="OutSourceTestCode"
                              value={item?.OutSourceTestCode}
                              onChange={(e) => handleRateChange(e, index)}
                            />
                          ) : (
                            item?.OutSourceTestCode
                          )}
                        </td>
                        <td
                          data-title={t("TAT")}
                          style={{ textAlign: "center" }}
                        >
                          {item?.isSelect == 1 ? (
                            <input
                              max={20}
                              name="TAT"
                              value={item?.TAT}
                              onChange={(e) => handleRateChange(e, index)}
                            />
                          ) : (
                            item?.TAT
                          )}
                        </td>
                        <td
                          data-title={t("TAT Type")}
                          style={{ textAlign: "center" }}
                        >
                          {item?.isSelect == 1 ? (
                            <ReactSelect
                              name="TATType"
                              dynamicOptions={[
                                {label: "Hours", value: 0},
                                {label: "Days", value: 1},
                              ]}
                              onChange={(name, option) => handleTATTypeChange(name, option,index)}
                              value={item?.TATType || 0}
                              removeIsClearable={true}
                            />
                          ) : (
                            tatTypeLabel[item?.TATType] || ""
                          )}
                        </td>
                        <td data-title={t("Select")}>
                          <div>
                            <input
                              type="checkbox"
                              name="isSelect"
                              checked={item?.isSelect == "1"}
                              onChange={(e) => handleChangeNew(e, index)}
                            />
                          </div>
                        </td>
                        <td data-title={t("Is Default")}>
                          <div>
                            <input
                              type="checkbox"
                              name="isDefault"
                              checked={item?.isDefault == "1"}
                              onChange={(e) => handleChangeNew(e, index)}
                            />
                          </div>
                        </td>
                        <td data-title={t("Log")}>
                          <i
                            className="fa fa-search text-primary"
                            style={{ cursor: "pointer" }}
                            onClick={() => getLog(item)}
                          ></i>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Tables>
                {load ? (
                  <Loading />
                ) : (
                  ShowBtn() && (
                    <>
                      <div className="box-footer">
                        <div className="row pt-2 pl-2 pr-2">
                          
                            <CustomButton onClick={handleSave} text="Save" icon="save" className="mx-2"/>                   
                            <CustomButton onClick={handleRemove} text="Remove" icon="delete"/>
                        </div>
                      </div>
                    </>
                  )
                )}
              </>
            ) : (
              <NoRecordFound />
            )}
          </div>
        </div>
      </Accordion>
    </>
  );
};

export default OutSourceTestMaster;
