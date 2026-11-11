import React, { useEffect, useState } from "react";
import ReactSelect from "../../../components/formComponent/ReactSelect";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import CustomDateRangePicker from "../../../components/commonComponents/DateRangePicker";
import Tables from "../../../components/UI/customTable";
import Heading from "../../../components/UI/Heading";
import ColorCodingSearch from "../../../components/commonComponents/ColorCodingSearch";
import SicReportTable from "./SicReportTable";
import SicSubReportModal from "./SicSubReportModal";
import GroupTable from "../../../components/UI/customTable/GroupTable/GroupTable";
import { exportToExcel } from "../../../utils/exportLibrary";
import {
  BindCentreWorkOrder,
  FinanceApproveSICAllSubHead,
  FinanceBindSICEmployeeAuthorization,
  FinanceGetSICReports,
  FinanceMonthlyClosureCheck,
  FinancePushMaster,
  FinanceRunProcSICReport,
  FinanceShowApprovalDetails,
  FinanceShowReport,
} from "../../../NetworkServices/finance.js";
import moment from "moment";
import { notify } from "../../../utils/ustil2";
import { Tooltip } from "primereact/tooltip";
import FinanceModal from "../../../components/ModalComponent/FinanceModal";
import { useLocalStorage } from "../../../utils/hooks/useLocalStorage.js";
import { bindVoucherBillingScreenControls } from "../../../NetworkServices/Pettycash.js";
import { filterByTypes } from "../../utils/Utils.jsx";

const SicReport = () => {
  const [t] = useTranslation();
  const [Centres, setCentres] = useState([]);
const UserData = useLocalStorage("userData", "get");
  const [values, setValues] = useState({
    toDate: new Date(),
    type: { label: "All", value: "0" },
    fromDate: new Date(),
    Centre: {value: UserData?.MainCentreID},
  });
 const getCentreAPI = async () => {
  
       let apiResp= await bindVoucherBillingScreenControls(1)
      //  debugger
       if(apiResp?.success){
         setCentres(filterByTypes(
            apiResp?.data,
            [14],
            ["TypeID"],
            "TextField",
            "ValueField"
          ));
       }
      
    }
  useEffect(() => {
    getCentreAPI();
  }, []);
  // const { GetEmployeeWiseCenter } = useSelector((state) => state.CommonSlice);

  const handleDateRangeChange = (e) => {
    const { startDate, endDate } = e.target.value;
    setValues((val) => ({ ...val, fromDate: startDate, toDate: endDate }));
  };

  const [tableData, setTableData] = useState([]);
  console.log("tableData", tableData);
  const [modalState, setModalState] = useState({
    show: false,
    name: null,
    component: null,
    size: null,
    buttonName: null,
  });
  const [searchTableData, setSearchTableData] = useState([""]);

  const THEAD = [
    {
      name: t("S.No."),
      width: "1%",
    },
    {
      name: t("Type"),
      width: "10%",
    },
    {
      name: t("HIS Value"),
      width: "10%",
    },
    {
      name: t("Staging Value"),
      width: "10%",
    },
    {
      name: t("Difference"),
      width: "10%",
    },
    {
      name: t("Approved Value"),
      width: "10%",
    },
    {
      name: t("Finance Value"),
      width: "10%",
    },
    {
      name: t("Difference"),
      width: "10%",
    },
    {
      name: t("Action"),
      width: "10%",
    },
  ];

  const GROUP_THEAD = [
    { name: "", colSpan: 2 },
    { name: "HIS Data", colSpan: 3 },
    { name: "Finance Data", colSpan: 4 },
  ];

  const [dropDownState, setDropDownState] = useState({
    BindType: [],
  });

  const SecondThead = [
    {
      name: (
        <>
          <input type="checkbox" className="table-checkbox" />
        </>
      ),
      width: "1%",
    },
    { name: "S.No.", width: "1%" },
    { name: "Head" },
    { name: "Sub Head" },
    { name: "HIS Value" },
    { name: "Staging Value" },
    { name: "Approval" },
    { name: "Difference Value" },
    { name: "Approved Value" },
    { name: "Finance Value" },
    { name: "Difference" },
  ];

  // const handleDepartmentTable = (tableData) => {
  //   return (
  //     Array.isArray(tableData) &&
  //     tableData?.map((item, index) => {
  //       const [_, configID] = item?.Category.split("#");
  //       return {
  //         Action: item?.subRow?.isopen ? (
  //           <div
  //             onClick={() => {
  //               handleMini(index);
  //             }}
  //             className="text-center"
  //           >
  //             <i className="fa fa-minus py-1 " aria-hidden="true"></i>
  //           </div>
  //         ) : (
  //           <div
  //             //   onClick={() => handleBillingShowItemDetails(item, index)}
  //             className="text-center"
  //           >
  //             <i className="fa fa-plus py-1 " aria-hidden="true"></i>
  //           </div>
  //         ),
  //         sno: index + 1,
  //         Department: item?.DisplayName,
  //         Quantity: <div className="text-right">{item?.Qty}</div>,
  //         Amount: (
  //           <div className="text-right">
  //             {/* {Number(item?.NetAmt).toFixed(ROUNDOFF_VALUE)} */}
  //           </div>
  //         ),

  //         Edit:
  //           String(configID) === "14" ? (
  //             <div className="text-center">
  //               <i
  //                 className="fa fa-edit text-primary"
  //                 aria-hidden="true"
  //                 onClick={() => {
  //                   handleModalState(
  //                     true,
  //                     "Edit Package",
  //                     <EditPackage
  //                       item={item}
  //                       pateintDetails={pateintDetails}
  //                       handleModalState={handleModalState}
  //                       GetBindBillDepartment={GetBindBillDepartment}
  //                     />,
  //                     "40vw",
  //                     <></>
  //                   );
  //                 }}
  //               ></i>
  //             </div>
  //           ) : (
  //             ""
  //           ),
  //         ViewLog: (
  //           <div className="text-center">
  //             <i className="fas fa-search" aria-hidden="true"></i>
  //           </div>
  //         ),
  //         subRow: handleDepartmentSubRow(item?.subRow, index),
  //       };
  //     })
  //   );
  // };

  const handleMini = (index) => {
    const responseData = JSON.parse(JSON.stringify(tableData));
    responseData[index]["subRow"]["isopen"] = false;
    setTableData(responseData);
  };

  const typeDataAPI = async () => {
    const response = await FinanceBindSICEmployeeAuthorization();
    if (response?.success) {
      setDropDownState((val) => ({
        ...val,
        BindType: response?.data?.map((val) => ({
          value: val?.TypeID,
          label: val?.TypeName,
        })),
      }));
    }
  };

  const handleSicRportShowItemDetails = async (val, ind) => {
    const response = await handleSearch(1, val?.TransType);

    const mapAllClose = tableData?.map((val, index) => {
      if (index === ind) {
        return {
          ...val,
          subRow: {
            subRowList: response?.data,
            isopen: true,
          },
        };
      } else {
        return {
          ...val,
          subRow: {
            subRowList: [],
            isopen: false,
          },
        };
      }
    });

    const tableDataMain = [...mapAllClose];

    // const responseData = JSON.parse(JSON.stringify(response?.data));
    // tableDataMain[ind]["subRow"] = {
    //   subRowList: responseData,
    //   isopen: true,
    // };

    setTableData(tableDataMain);
  };

  const ClourseCheckData = async () => {
    const payload = {
      fromDate: moment(values?.fromDate).format("DD-MM-YYYY"),
      toDate: values?.toDate ? moment(values?.toDate).format("DD-MM-YYYY") : moment(values?.fromDate).format("DD-MM-YYYY"),
    };

    const response = await FinanceMonthlyClosureCheck(payload);
    if (response?.success) {
      return response;
    } else {
      return response;
    }
  };

  const handleSubRowChange = (e, outerIndex, innerIndex) => {
    const { name, checked } = e.target;
    const data = JSON.parse(JSON.stringify(tableData));
    data[outerIndex]["subRow"]["subRowList"][innerIndex][name] = checked;
    setTableData(data);
  };

  const handleMainCheck = (e, index, data) => {
    const { checked } = e.target;
    const val = JSON.parse(JSON.stringify(tableData));
    val[index]["subRow"]["subRowList"] = data.map((item, _) => {
      return {
        ...item,
        isChecked: checked,
      };
    });

    setTableData(val);
  };

  const handleModalState = async (row) => {
    debugger;
    const payload = {};
    payload.branchCentreID = Number(values?.Centre?.value);
    payload.fromDate = moment(values.fromDate).format("DD-MMM-YYYY");
    payload.toDate = moment(values.toDate).format("DD-MMM-YYYY");
    payload.type = row.TypeID;
    payload.subHeadID = row.SubHeadID;
    payload.subTypeName = row.SubTypeName;
    const response = await FinanceShowApprovalDetails(payload);
    if (!response?.success) {
      notify(response?.message, "error");
      return;
    }
    setModalState({
      show: true,
      name: t(
        `Detail's : ${row?.SubTypeName} => ${row?.Head} => ${row?.SubHead}`
      ),
      component: (
        <SicSubReportModal val={row} data={values} handleClose={handleClose} />
      ),
      size: "90vw",
      footer: <></>,
    });
  };
  const printExcel = async (val, index) => {
    const payload = {
      typeID: val.TypeID,
      diffType: val?.Difference,
      fromDate: moment(values?.fromDate).format("DD-MMM-YYYY"),
      toDate: moment(values?.toDate).format("DD-MMM-YYYY"),
      branchCentreID: Number(values?.Centre?.value),
      subHeadID: val?.SubHeadID,
      subTypeName: val?.SubTypeName,
    };

    const response = await FinanceShowReport(payload);

    if (response?.success) {
      exportToExcel(response?.data, "SIC Report Details");
      handleSearch();
    } else {
      notify(response?.message, "error");
    }
  };

  const handleClose = () => {
    setModalState((prev) => ({ ...prev, show: false }));
  };

  const handleDepartmentSubRow = (subRow, inx) => {
    const tableResponse =
      subRow?.subRowList?.length > 0 &&
      subRow?.subRowList?.map((row, index) => {
        let colorCode = "";
        debugger;
        if (
          row.HisStagingAmt != 0 &&
          row.HisStagingAmt == row.StagingApprovalAmount
        ) {
          colorCode = "rgba(117, 234, 176, 0.76)";
        }
        if (
          row.HisStagingAmt != row.StagingApprovalAmount &&
          row.StagingApprovalAmount > 0
        ) {
          colorCode = "rgba(255, 165, 0, 0.76)";
        }
        return {
          colorcode: colorCode,
          input: (
            <div className="text-center">
              <input
                type="checkbox"
                checked={row?.isChecked}
                className="table-checkbox"
                name="isChecked"
                onChange={(e) => handleSubRowChange(e, inx, index)}
              />
            </div>
          ),
          Head: row?.Head ? row?.Head : "",
          SubHead: row?.SubHead ? row?.SubHead : "",
          HisValue: String(row?.HIMSAmount),
          StagingVal: String(row?.HisStagingAmt),
          DiffVal: String(row?.Difference),
          AppVal: String(row?.StagingApprovalAmount),
          FinVal: String(row?.FinanceAmount),
          Diff: String(row?.DifferenceFinance),
          Approval: (
            <div>
              <Tooltip
                target={`#approval${index}`}
                position="top"
                content={"Click To Approve"}
                event="hover"
                className="ToolTipCustom"
              />
              <span
                id={`approval${index}`}
                className="fa fa-check"
                onClick={() => handleModalState(row)}
              // onClick={() =>
              //   handleModalState(
              //     true,
              //     t(`Detail's : ${row?.SubHead}`),
              //     <SicSubReportModal
              //       val={row}
              //       data={values}
              //       handleClose={handleClose}
              //     />,
              //     "90vw",
              //     <></>
              //   )
              // }
              />
              <Tooltip
                target={`#subRowExcel${index}`}
                position="top"
                content={"Download Excel"}
                event="hover"
                className="ToolTipCustom"
              />
              <span
                // style={
                //   !values?.clousureCheck
                //     ? {}
                //     : { cursor: "not-allowed", color: "grey" }
                // }
                onClick={() => printExcel(row, index)}
                id={`subRowExcel${index}`}
                className="fa fa-file-excel ml-3"
              ></span>
            </div>
          ),
        };
      });

    return {
      subRowList: tableResponse,
      isopen: subRow?.isopen,
      secondThead: [
        {
          name: (
            <input
              type="checkbox"
              className="table-checkbox"
              onChange={(e) => handleMainCheck(e, inx, subRow?.subRowList)}
              checked={
                subRow?.subRowList?.length > 0 &&
                subRow?.subRowList.every((row) => row?.isChecked === true)
              }
            />
          ),
          type: "",
          width: "1%",
        },
        t("Head"),
        t("Sub-Head"),
        t("HIS Value"),
        t("Staging Value"),
        t("Difference Value"),
        t("Approved Value"),
        t("Finance Value"),
        t("Difference"),
        t("Approval"),
        // t("Package"),
        // t("User"),
        // t("Disc. Given By"),
        // t("Non Payable"),
        // { width: "3%", name: t("Edit") },
        // { width: "3%", name: t("Reject") },
      ],
    };
  };
  useEffect(() => {
    typeDataAPI();
  }, []);

  const handleSearch = async (isDetails = 0, subTypeName = "") => {
    const clouserResponse = await ClourseCheckData();
    const payload = {
      branchCentreID: Number(values?.Centre?.value),
      fromDate: moment(values?.fromDate).format("DD-MMM-YYYY"),
      toDate: moment(values?.toDate).format("DD-MMM-YYYY"),
      type: values?.type?.value,
      isDetails: isDetails,
      subTypeName: subTypeName,
    };

    const response = await FinanceGetSICReports(payload);
    if (response?.success) {
      setValues((val) => ({
        ...val,
        clousureCheck: clouserResponse?.success,
      }));
      setTableData(response?.data);
    } else {
      setTableData([]);
      notify(response?.message, "error");
    }
    return response;
  };

  const handlePushMaster = async () => {
    const response = await FinancePushMaster();
    if (response?.success) {
      notify(response?.message, "success");
    } else {
      notify(response?.message, "error");
    }
  };

  // useEffect(() => {
  //   setValues((val) => ({
  //     ...val,
  //     Centre: Centres?.map((ele) => ({
  //       value: ele?.CentreID,
  //       label: ele?.CentreName,
  //     }))[0],
  //     type: dropDownState?.BindType[0],
  //   }));
  // }, [dropDownState?.BindType]);

  const handlePushToFinance = async (val, index) => {
    const filteredData = tableData[index]?.subRow?.subRowList?.filter(
      (val) => val?.isChecked === true
    );
    console.log("filteredData", filteredData);
    if (filteredData?.length === 0) {
      notify("Please Select Atleast One Sub Head", "warn");
      return;
    }
    const payload = {
      typeID: val?.TypeID,
      fromDate: moment(values?.fromDate).format("DD-MM-YYYY"),
      toDate: moment(values?.toDate).format("DD-MM-YYYY"),
      isFinancePush: 1,
      subType: val?.SubTypeName,
      subHeadIDs: filteredData?.map((val) => ({
        subHeadID: val?.SubHeadID,
      })),
    };

    const response = await FinanceRunProcSICReport(payload);

    if (response?.data?.Success) {
      notify(response?.data?.Message, "success");
      handleSearch();
    } else {
      notify(response?.data?.Message, "error");
    }
  };

  const fetchHospitalData = async (val, index) => {
    const filteredData = tableData[index]?.subRow?.subRowList?.filter(
      (val) => val?.isChecked === true
    );
    if (filteredData?.length === 0) {
      notify("Please Select Atleast One Sub Head", "warn");
      return;
    }
    const payload = {
      typeID: val?.TypeID,
      fromDate: moment(values?.fromDate).format("DD-MM-YYYY"),
      toDate: moment(values?.toDate).format("DD-MM-YYYY"),
      isFinancePush: 0,
      subType: val?.SubTypeName,
      subHeadIDs: filteredData?.map((val) => ({
        subHeadID: val?.SubHeadID,
      })),
    };
    debugger;
    const response = await FinanceRunProcSICReport(payload);
    if (response?.success) {
      notify(response?.message, "success");
      handleSearch();
    } else {
      notify(response?.message, "error");
    }
  };

  useEffect(() => {
    let someHaveSubRowList = false;
    if (tableData?.some((val) => val?.subRow?.isopen === true)) {
      someHaveSubRowList = true;
    } else {
      someHaveSubRowList = false;
    }
    setValues((val) => ({
      ...val,
      someHaveSubRowList: someHaveSubRowList,
    }));
  }, [tableData]);

  const handleApproveAll = async () => {
    const openSubRowIndexes = tableData
      .map((row, index) => (row.subRow?.isopen === true ? index : null))
      .filter((index) => index !== null);

    const filteredData = tableData[openSubRowIndexes];
    const finalData = filteredData?.subRow?.subRowList?.filter(
      (val) => val?.isChecked
    );

    const payload = {
      SubHeadData: finalData?.map((val) => ({
        SubHeadID: val?.SubHeadID,
        TypeID: val?.TypeID,
        FromDate: moment(values?.fromDate).format("DD-MM-YYYY"),
        ToDate: moment(values?.toDate).format("DD-MM-YYYY"),
        BranchCentreID: Number(values?.Centre?.value),
        StoreType: val?.SubTypeName,
      })),
    };

    const response = await FinanceApproveSICAllSubHead(payload);

    if (response?.success) {
      notify(response?.message, "success");
      handleSearch();
    } else {
      notify(response?.message, "error");
    }
  };

  return (
    <div className="card mt-2">
      <Heading name={"SIC Report"} isBreadcrumb={true} />
      <div className="row p-2">
        <ReactSelect
          placeholderName={t("Centre")}
          id="Centre"
          name="Centre"
          className={`required-fields`}
          value={values?.Centre?.value}
          removeIsClearable={true}
          onChange={(name, value) =>
            setValues((val) => ({ ...val, [name]: value }))
          }
          dynamicOptions={Centres}
          searchable={true}
          respclass="col-xl-2 col-md-3 col-sm-6 col-12"
        />
        <ReactSelect
          placeholderName={t("Type")}
          id="type"
          name="type"
          className={`required-fields`}
          value={values?.type?.value}
          removeIsClearable={true}
          onChange={(name, value) =>
            setValues((val) => ({ ...val, [name]: value }))
          }
          dynamicOptions={[
            { label: "All", value: "0" },
            ...dropDownState?.BindType,
          ]}
          searchable={true}
          respclass="col-xl-2 col-md-3 col-sm-6 col-12"
        />
        <CustomDateRangePicker
          name="dateRange"
          id="dateRange"
          labelKey="dateRange"
          label={t("Select Date Range")}
          startDate={values?.fromDate || null}
          endDate={values?.toDate || null}
          onChange={handleDateRangeChange}
          respClass="col-xl-2 col-md-4 col-sm-4 col-12"
        />
        <button className="btn btn-sm btn-primary" onClick={() => handleSearch(0, "")}>
          {t("Search")}
        </button>
        <button className="btn btn-sm btn-primary ml-2" onClick={handlePushMaster}>
          {t("Push Master")}
        </button>
      </div>
      {tableData?.length > 0 && (
        <div>
          <Heading
            title={"Search Result"}
            secondTitle={
              <>
                <ColorCodingSearch
                  color="#91ed91"
                  label={t("Full Amount Approved")}
                />
                <ColorCodingSearch
                  color="#ffa600"
                  label={t("Partial Amount Approved")}
                />
              </>
            }
            isBreadcrumb={false}
          />
          <GroupTable
            thead={THEAD}
            groupThead={GROUP_THEAD}
            tbody={tableData?.map((val, index) => ({
              sno: index + 1,
              type: val?.TransType,
              hisVal: val?.HIMSAmount,
              stagingVal: val?.HisStagingAmt,
              Diff: val?.Difference,
              Approved: val?.StagingApprovalAmount,
              FinVla: val?.FinanceAmount,
              FinDiff: val?.DifferenceFinance,
              Action: (
                <>
                  {val?.subRow?.isopen ? (
                    <>
                      <Tooltip
                        target={`#show${index}`}
                        position="top"
                        content={"Click to Show Details"}
                        event="hover"
                        className="ToolTipCustom"
                      />
                      <span
                        id={`show${index}`}
                        onClick={() => {
                          handleMini(index);
                        }}
                        className="text-center"
                      >
                        <i className="fa fa-minus py-1 " aria-hidden="true"></i>
                      </span>
                    </>
                  ) : (
                    <>
                      <Tooltip
                        target={`#hide${index}`}
                        position="top"
                        content={"Click to Show Details"}
                        event="hover"
                        className="ToolTipCustom"
                      />
                      <span
                        id={`hide${index}`}
                        onClick={() =>
                          handleSicRportShowItemDetails(val, index)
                        }
                        className="text-center"
                      >
                        <i className="fa fa-plus py-1" aria-hidden="true"></i>
                      </span>
                    </>
                  )}

                  <Tooltip
                    target={`#get${index}`}
                    position="top"
                    // style={
                    //   !values?.clousureCheck
                    //     ? {}
                    //     : { cursor: "not-allowed", color: "grey" }
                    // }
                    content={"Fetch Hospital Data"}
                    event="hover"
                    className="ToolTipCustom"
                  />
                  <span
                    onClick={() => fetchHospitalData(val, index)}
                    id={`get${index}`}
                    className="fa fa-download ml-3"
                  ></span>
                  <Tooltip
                    target={`#push${index}`}
                    position="top"
                    content={"Push to Finanace"}
                    event="hover"
                    className="ToolTipCustom"
                  />
                  <span
                    onClick={() => handlePushToFinance(val, index)}
                    id={`push${index}`}
                    className="fa fa-upload ml-3"
                  ></span>

                  {val?.subRow?.isopen ? (
                    <>
                      <Tooltip
                        target={`#excel${index}`}
                        position="top"
                        content={"Download Excel"}
                        event="hover"
                        className="ToolTipCustom"
                      />
                      <span
                        id={`excel${index}`}
                        onClick={() => {
                          exportToExcel(val?.subRow?.subRowList, "Report");
                        }}
                        className="text-center"
                      >
                        <i
                          className="fa fa-file-excel py-1 ml-3"
                          aria-hidden="true"
                        ></i>
                      </span>
                    </>
                  ) : (
                    <>
                      <Tooltip
                        target={`#excelDisable${index}`}
                        position="top"
                        content={"Please View Details First"}
                        event="hover"
                        className="ToolTipCustom"
                      />
                      <span
                        id={`excelDisable${index}`}
                        // onClick={() =>

                        // }
                        style={{ cursor: "not-allowed ", color: "grey" }}
                        className="text-center"
                      >
                        <i
                          className="fa fa-file-excel py-1 ml-3"
                          aria-hidden="true"
                        ></i>
                      </span>
                    </>
                  )}
                </>
              ),
              _subRow: handleDepartmentSubRow(val?.subRow, index),
            }))}
            isSubTable={true}
          // isDoubleClick={true}
          // handleSubDoubleClick={printExcel}
          />
          {console.log(
            "first",
            tableData?.some((val) => val?.subRow?.subRowList?.length > 0)
          )}
          {values?.someHaveSubRowList && (
            <div className="p-2 w-100 d-flex justify-content-end">
              <button className="btn btn-success" onClick={handleApproveAll}>
                Approve All
              </button>
            </div>
          )}
        </div>
      )}
      <FinanceModal
        Header={modalState?.name}
        modalWidth={modalState?.size}
        visible={modalState?.show}
        setVisible={() =>
          setModalState({
            show: false,
          })
        }
        footer={modalState?.footer}
        buttonName={modalState?.buttonName}
      >
        {modalState?.component}
      </FinanceModal>
    </div>
  );
};

export default SicReport;
