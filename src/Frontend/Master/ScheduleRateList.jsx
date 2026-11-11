import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { axiosInstance } from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import Accordion from "@app/components/UI/Accordion";
import { SelectBox } from "../../components/formComponent/SelectBox";
import ReactSelect from "../../components/formComponent/ReactSelect";
import Loading from "../../components/loader/Loading";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import Tables from "../../components/UI/customTable";
import { isChecked } from "../util/Commonservices";
import { dateConfig } from "../../utils/helpers";
import Input from "../../components/formComponent/Input";
import DatePicker from "../../components/formComponent/DatePicker";
import TransferRateType from "../utils/ScheduleTransferRateType";
import ScheduleRateListImportModal from "./ScheduleRateListImportModal";
import RateTypeController from "./RateTypeController";
import Modal from "../../components/formComponent/Modal";
import { DataType } from "../../utils/Constants";
import FilterInput from "../../components/Filter/FilterInput";
import { getSearchController } from "../../utils/NetworkApi/commonApi";

const ScheduleRateList = () => {
  const [Department, setDepartment] = useState([]);
  const [RateCentres, setRateCentres] = useState([]);
  const [Billing, setBilling] = useState([]);
  const [load, setLoad] = useState(false);

  const PAGE_ID = "42"; // PAGEID

  // ─── Dynamic Controller State ───────────────────────────────────────────────
  const [controllerDynamicList, setControllerDynamicList] = useState([]);
  const [filterData, setFilterData] = useState([]);
  const [tabbingOrder, setTabbingOrder] = useState([]);

  const [searchText, setSearchText] = useState("");
  const [payload, setPayload] = useState({
    BillingCategory: 0,
    CentreID: "",
    DepartmentID: 0,
    TestID: "",
    dataType: "",
    FromDate: new Date(),
    ToDate: new Date(),
  });
  const [tabledata, setTabledata] = useState([]);
  const [headerRate, setHeaderRate] = useState("");
  const [ItemList, setItemList] = useState([]);
  const { t } = useTranslation();
  const [show, setShow] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const [logData, setLogData] = useState([]);
  const [logLoading, setLogLoading] = useState(false);
  const [saveFromDate, setSaveFromDate] = useState(new Date());
  const [saveToDate, setSaveToDate] = useState(new Date());

  // ─── Column Meta ─────────────────────────────────────────────────────────────
  const COLUMN_META = {
    "S.No":            {},
    "Centre Name":     {},
    "Test Name":       {},
    "BaseRate":        {},
    "MaxRate":         {},
    "Rate":            { isRateCol: true },
    "Item Code":       {},
    "BillingCategory": {},
    "Create On":       {},
    "Created By":      {},
    "Select":          { hasSelectAll: true },
    "Log":             {},
  };


  const columnConfig = useMemo(() => {

    if (!controllerDynamicList?.length) {
      return Object.keys(COLUMN_META).map((header) => ({
        header,
        ...COLUMN_META[header],
      }));
    }
    return controllerDynamicList
      .filter((item) => item?.TypeId === 2 && item?.IsShow === 1)
      .sort((a, b) => {
        const orderA = (a.DisplayOrder !== "" && a.DisplayOrder !== null && a.DisplayOrder !== undefined) ? Number(a.DisplayOrder) : Number(a.ID) + 1000;
        const orderB = (b.DisplayOrder !== "" && b.DisplayOrder !== null && b.DisplayOrder !== undefined) ? Number(b.DisplayOrder) : Number(b.ID) + 1000;
        return orderA - orderB;
      })
      .map((item) => ({
        header: item.ControlDisplayName,
        ...(COLUMN_META[item.ControlDisplayName] ?? {}),
      }));
  }, [controllerDynamicList]);


  const isHideController = (cntrId = "") => {
    if (!controllerDynamicList?.length) return true;
    const found = controllerDynamicList.find(
      (x) => x?.ControlDisplayID === cntrId
    );
    if (found?.ControlDisplayID) {
      return !!found?.IsShow;
    }
    return true;
  };

  // ─── Helpers ─────────────────────────────────────────────────────────────────
  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  // ─── Handlers ────────────────────────────────────────────────────────────────
  const handleSubmit = (value) => {
    const isCentreEmpty =
      payload?.CentreID === "" || payload?.CentreID === 0;
    const isTestEmpty = value === "" || value === 0;

    if (isTestEmpty && isCentreEmpty) {
      toast?.error("Please select Test or Centre !");
      return;
    }

    setHeaderRate("");
    setLoad(true);
    axiosInstance
      .post("ScheduleRateList/RateListGet", {
        billingCategory: [Number(payload?.BillingCategory ?? 0)],
        centreID: String(payload?.CentreID ?? ""),
        departmentID: String(payload?.DepartmentID ?? 0),
        testID: String(value ?? ""),
        fromDate: formatDate(payload?.FromDate),
        toDate: formatDate(payload?.ToDate),
      })
      .then((res) => {
        const data = res?.data?.message;
        if (data?.length > 0) {
          setTabledata(
            data.map((ele) => ({ ...ele, isActive: "0", CheckedAll: "0" }))
          );
        } else {
          toast.error("No data Found");
          setTabledata([]);
        }
        setLoad(false);
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Error Occured"
        );
        setLoad(false);
        setHeaderRate("");
      });
  };

  const handleCollection = (e, data) => {
    const { name, checked } = e.target;
    const index = tabledata.findIndex((ele) => ele === data);
    if (index !== -1) {
      const datas = [...tabledata];
      datas[index] = { ...datas[index], [name]: checked ? "1" : "0" };
      setTabledata(datas);
    }
  };

  const getLog = (row) => {
    setLogLoading(true);
    axiosInstance
      .post("ScheduleRateList/RateListLog", {
        centreID: row?.CentreID,
        investigationID: row?.InvestigationID,
        fromDate: formatDate(payload?.FromDate),
        toDate: formatDate(payload?.ToDate),
      })
      .then((res) => {
        if (res.data.message) {
          setLogData(
            Array.isArray(res?.data?.message) ? res?.data?.message : []
          );
          setShowLog(true);
        } else {
          setLogData([]);
          toast.error(res?.data?.message || "No Record Found");
          setShowLog(false);
        }
        setLogLoading(false);
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Something Went Wrong"
        );
        setLogLoading(false);
      });
  };

  const onHandleShow = () => setShow(!show);

  const handleCheckbox = (e) => {
    const { checked } = e.target;
    setTabledata(
      tabledata.map((ele) => ({ ...ele, isActive: checked ? "1" : "0" }))
    );
  };

  const filteredData = useMemo(() => {
    if (!searchText) return tabledata;
    const search = searchText.toLowerCase();
    return tabledata
      .filter(
        (item) =>
          item?.TestName?.toLowerCase().includes(search) ||
          item?.isActive === "1"
      )
      .sort((a, b) => {
        if (a?.isActive === "1" && b?.isActive !== "1") return -1;
        if (a?.isActive !== "1" && b?.isActive === "1") return 1;
        return 0;
      });
  }, [tabledata, searchText]);

  const handleValue = (e, data) => {
    const { name, value } = e.target;
    const index = tabledata.findIndex((ele) => ele === data);
    if (index !== -1) {
      const datas = [...tabledata];
      datas[index] = { ...datas[index], [name]: value };
      setTabledata(datas);
    }
  };

  const handleHeaderRateChange = (e) => {
    const value = e.target.value;
    setHeaderRate(value);
    setTabledata((prev) =>
      prev.map((item) =>
        item.isActive === "1" ? { ...item, Rate: value } : item
      )
    );
  };

  const handleBaseRateAndMaxRate = (data) => {
    const invalidFields = [];
    for (let i = 0; i < data.length; i++) {
      const value = data[i]["Rate"];
      if (
        data[i].MaxRate < value ||
        data[i].BaseRate > value ||
        value === ""
      ) {
        invalidFields.push(data[i]);
      }
    }
    return invalidFields;
  };

  const handleSave = () => {
    const selectedFields = tabledata?.filter((ele) => ele.isActive == "1");
    const invalidFields = handleBaseRateAndMaxRate(selectedFields);

    const updatedTableData = tabledata?.map((item) => {
      if (item.isActive != "1") return item;
      const isInvalid = invalidFields.some(
        (ele) => ele.InvestigationID === item.InvestigationID
      );
      return { ...item, isInvalid };
    });
    setTabledata(updatedTableData);

    if (selectedFields?.length > 0) {
      if (invalidFields.length === 0) {
        setLoad(true);
        const savePayload = {
          data: selectedFields.map((ele) => ({
            rateTypeID: ele?.CentreID ?? 0,
            rateTypeCode: ele?.TestCode ?? "",
            rateTypeName: ele?.Centre ?? "",
            testID: ele?.InvestigationID ?? 0,
            testCode: ele?.TestCode ?? "",
            testName: ele?.TestName ?? "",
            rate: Number(ele?.Rate ?? 0),
            fromDate: formatDate(saveFromDate),
            toDate: formatDate(saveToDate),
          })),
        };
        axiosInstance
          .post("ScheduleRateList/SaveRateList", savePayload)
          .then((res) => {
            toast.success(res.data?.message);
            setLoad(false);
            handleSubmit(payload?.TestID);
          })
          .catch((err) => {
            setLoad(false);
            toast.error(
              err?.response?.data?.message
                ? err?.response?.data?.message
                : "Error Occured"
            );
          });
      } else {
        toast.error(
          "Rate Must be Valid According to Base Rate And Max Rate"
        );
      }
    } else {
      toast.error("Please Choose One Value");
    }
  };

  const getRateCenters = () => {
    axiosInstance
      .get("centre/getRateList", { params: { IsRateList: 1 } })
      .then((res) => {
        let data = res.data.message;
        data.sort((a, b) => (a.TestName || "").localeCompare(b.TestName || ""));
        let CentreDataValue = data.map((ele) => ({
          value: ele.CentreID,
          label: ele.Centre,
        }));
        CentreDataValue.unshift({ label: "All", value: 0 });
        setPayload((prev) => ({
          ...prev,
          CentreID: CentreDataValue[0]?.value,
        }));
        setRateCentres(CentreDataValue);
      })
      .catch((err) => console.log(err));
  };

  const getBillingCategory = () => {
    axiosInstance
      .get("Investigations/BindBillingCategory")
      .then((res) => {
        let data = res.data.message;
        let val = data.map((ele) => ({
          value: ele?.BillingCategoryId,
          label: ele?.BillingCategoryName,
        }));
        val.unshift({ label: "All", value: 0 });
        setBilling(val);
        setPayload((prev) => ({ ...prev, BillingCategory: val[0]?.value }));
      })
      .catch((err) => console.log(err));
  };

  const getDepartment = () => {
    axiosInstance
      .get(`Department/getDepartment`)
      .then((res) => {
        let data = res.data.message;
        let dept = data.map((ele) => ({
          value: ele.DepartmentID,
          label: ele.Department,
        }));
        dept.unshift({ label: "All Department", value: 0 });
        setDepartment(dept);
        setPayload((prev) => ({ ...prev, DepartmentID: dept[0]?.value }));
      })
      .catch((err) => console.log(err));
  };

  const getRateItemList = () => {
    axiosInstance
      .post("ScheduleRateList/getItemList", {
        DepartmentID: payload?.DepartmentID ?? 0,
        BillingCategory: payload?.BillingCategory ?? 0,
      })
      .then((res) => {
        let data = res.data.message;
        let val = data.map((ele) => ({
          value: ele?.InvestigationID,
          label: ele?.TestName,
        }));
        val.unshift({ label: "Item Name", value: "" });
        setItemList(val);
      })
      .catch((err) => console.log(err));
  };

  const getRateListWithType = (typeName = "", typeID = 0) => {
    axiosInstance
      .post("ScheduleRateList/GetRateListWithType", { typeName, typeID })
      .then((res) => {
        const data = res?.data?.message;
        if (Array.isArray(data) && data.length > 0) {
          setTabledata(
            data.map((ele) => ({ ...ele, isActive: "0", CheckedAll: "0" }))
          );
        } else {
          setTabledata([]);
        }
      })
      .catch((err) => console.log(err));
  };


  const dateSelect = (value, name) => {
    const d = new Date(value);
    const formattedDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    setPayload((prev) => ({ ...prev, [name]: value }));
    return formattedDate;
  };

  const handleReactSelect = (name, e) => {
    if (name === "BillingCategory") {
      setPayload((prev) => ({ ...prev, [name]: e?.value?.toString() }));
    } else {
      setPayload((prev) => ({ ...prev, [name]: e?.value }));
    }
  };

  // ─── Dynamic Controller API ───────────────────────────────────────────────────
  const controllerDynamic = async () => {
    try {
      const { controllersData, controllerTabbingOrder } =
        await getSearchController(PAGE_ID);
      setTabbingOrder(controllerTabbingOrder);
      setControllerDynamicList(controllersData);
      if (Array.isArray(controllersData)) {
        setFilterData(controllersData);
      }
    } catch (error) {
      console.error("error in controllerDynamic:", error);
    }
  };

  // ─── Render cell content per column header ────────────────────────────────────
  const renderCell = (col, data, index) => {
    switch (col.header) {
      case "S.No":
        return <>{index + 1}&nbsp;</>;

      case "Centre Name":
        return <>{data?.Centre}&nbsp;</>;

      case "Test Name":
        return <>{data?.TestName}&nbsp;</>;

      case "BaseRate":
        return <>{data?.BaseRate}&nbsp;</>;

      case "MaxRate":
        return <>{data?.MaxRate}&nbsp;</>;

      case "Rate":
        return data?.isActive === "1" ? (
          <Input
            value={parseInt(data?.Rate)}
            type="number"
            name="Rate"
            onChange={(e) => handleValue(e, data)}
            max={10}
            className={data?.isInvalid ? "required-fields" : ""}
          />
        ) : (
          <>{Number(data?.Rate).toFixed(2)}</>
        );

      case "Item Code":
        return <>{data?.TestCode}&nbsp;</>;

      case "BillingCategory":
        return <>{data?.BillingCategory}&nbsp;</>;

      case "Create On":
        return <>{dateConfig(data?.dtEntry)}&nbsp;</>;

      case "Created By":
        return <>{data?.CreatedByName ? data?.CreatedByName : "-"}&nbsp;</>;

      case "Select":
        return (
          <input
            type="checkbox"
            name="isActive"
            checked={data?.isActive === "1"}
            onChange={(e) => handleCollection(e, data)}
          />
        );

      case "Log":
        return (
          <i
            className="fa fa-search text-primary"
            style={{ cursor: "pointer" }}
            onClick={() => getLog(data)}
          />
        );

      default:
        return <>{data[col.header]}&nbsp;</>;
    }
  };

  // ─── Render TH content per column header ──────────────────────────────────────
  const renderHeader = (col) => {
    if (col.hasSelectAll) {
      return (
        <input
          type="checkbox"
          checked={
            tabledata.length > 0
              ? !isChecked("isActive", tabledata, "1").includes(false)
              : false
          }
          onChange={handleCheckbox}
        />
      );
    }

    if (col.isRateCol) {
      return (
        <>
          <div>{t("Rate")}</div>
          <Input
            type="number"
            value={headerRate}
            placeholder="0.00"
            onChange={handleHeaderRateChange}
            disabled={!tabledata?.some((item) => item?.isActive === "1")}
          />
        </>
      );
    }

    return t(col.header);
  };

  // ─── Effects ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    getDepartment();
    getRateItemList();
    getBillingCategory();
    getRateCenters();
    controllerDynamic();
  }, []);

  useEffect(() => {
    getRateItemList();
  }, [payload?.BillingCategory, payload?.DepartmentID]);

  // ─── JSX ─────────────────────────────────────────────────────────────────────
  return (
    <>
      {show && (
        <TransferRateType
          show={show}
          onHandleShow={onHandleShow}
          Centres={RateCentres}
          Department={Department}
          Billing={Billing}
        />
      )}


      <Accordion name={t("Schedule Rate List")} defaultValue={true} isBreadcrumb={true}>
        <div className="row pt-2 px-2 mb-2">

          {/* From Date */}
          <div className="col-sm-2 col-md-2">
            <DatePicker
              className="custom-calendar"
              name="FromDate"
              value={payload?.FromDate}
              onChange={dateSelect}
              placeholder=" "
              id="FromDate"
              lable="FromDate"
              maxDate={new Date()}
            />
          </div>

          {/* To Date */}
          <div className="col-sm-2 col-md-2">
            <DatePicker
              className="custom-calendar"
              name="ToDate"
              value={payload?.ToDate}
              onChange={dateSelect}
              placeholder=" "
              id="ToDate"
              lable="ToDate"
              minDate={new Date(payload?.FromDate)}
            />
          </div>

          {/* Department */}
          {isHideController("DepartmentID") && (
            <div className="col-sm-2 col-md-2">
              <ReactSelect
                dynamicOptions={Department}
                id="DepartmentID"
                placeholderName={t("Department")}
                name="DepartmentID"
                value={payload?.DepartmentID}
                onChange={handleReactSelect}
                searchable={true}
                removeIsClearable={true}
              />
            </div>
          )}

          {/* Billing Category */}
          {isHideController("BillingCategory") && (
            <div className="col-sm-2 col-md-2">
              <ReactSelect
                dynamicOptions={[...Billing]}
                id="Billing Category"
                placeholderName={t("Billing Category")}
                name="BillingCategory"
                value={payload?.BillingCategory}
                onChange={handleReactSelect}
                searchable={true}
                removeIsClearable={true}
              />
            </div>
          )}

          {/* Data Type */}
          {isHideController("dataType") && (
            <div className="col-sm-2 col-md-2">
              <ReactSelect
                dynamicOptions={DataType}
                id="dataType"
                placeholderName={t("Data Type")}
                name="dataType"
                value={payload?.dataType}
                onChange={handleReactSelect}
                searchable={true}
                removeIsClearable={true}
              />
            </div>
          )}

          {/* Rate Type (Centre) */}
          {isHideController("RateTypeID") && (
            <div className="col-sm-2 col-md-2">
              <ReactSelect
                dynamicOptions={[...RateCentres]}
                id="RateType"
                placeholderName="Rate Type"
                name="CentreID"
                value={payload?.CentreID}
                onChange={(_, e) => {
                  setPayload({ ...payload, CentreID: e?.value ?? "" });
                  if (e?.value) getRateListWithType(e?.label ?? "", e?.value ?? 0);
                }}
                searchable={true}
                removeIsClearable={true}
              />
            </div>
          )}

          {/* Select Test */}
          {isHideController("TestID") && (
            <div className="col-sm-3 col-md-3">
              <ReactSelect
                dynamicOptions={ItemList}
                name="TestID"
                placeholderName="Select Test"
                value={payload?.TestID}
                removeIsClearable={false}
                onChange={(_, e) => {
                  setPayload({ ...payload, TestID: e?.value ?? "" });
                  handleSubmit(e?.value ?? "");
                }}
              />
            </div>
          )}

          {/* Search Button */}
          <div className="col-sm-1 mx-0">
            <button
              style={{ gap: "2px" }}
              className="btn btn-info d-flex align-items-center btn-sm btn-block rounded"
              onClick={() => handleSubmit(payload?.TestID)}
            >
              <i className="bi bi-search mb-0"></i>
              {t("Search")}
            </button>
          </div>

          {/* Transfer Rate Type */}
          <div className="mx-2">
            <button
              className="btn btn-primary btn-sm btn-block rounded"
              onClick={onHandleShow}
            >
              {t("TransferRate Type")}
            </button>
          </div>

          <ScheduleRateListImportModal RateCentres={RateCentres} ItemList={ItemList} />
        </div>
      </Accordion>

      <Accordion
        title={t("Search Data")}
        defaultValue={true}
        notOpen={true}
        linkTo="#"
        linkTitle={
          <div className="d-flex" style={{ gap: "5px" }}>
            <div>
              <Input
                type="text"
                placeholder="Search Menu..."
                value={searchText}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => setSearchText(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>
        }
      >
        {load ? (
          <Loading />
        ) : tabledata.length > 0 ? (
          <div className="row p-2">
            <div className="col-12">
              <Tables style={{ maxHeight: "400px", overflowY: "auto" }}>
                {/* ── Dynamic THead ── */}
                <thead style={{ position: "sticky", top: 0, zIndex: 1 }}>
                  <tr>
                    {columnConfig.map((col, idx) => (
                      <th key={idx}>{renderHeader(col)}</th>
                    ))}
                  </tr>
                </thead>

                {/* ── Dynamic TBody ── */}
                <tbody>
                  {filteredData.map((data, rowIndex) => (
                    <tr key={rowIndex}>
                      {columnConfig.map((col, colIdx) => (
                        <td key={colIdx} data-title={t(col.header)}>
                          {renderCell(col, data, rowIndex)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </Tables>

              <div className="d-flex align-items-end mt-2" style={{ gap: "8px" }}>
                <div className="col-sm-2">
                  <DatePicker
                    className="custom-calendar"
                    name="saveFromDate"
                    value={saveFromDate}
                    onChange={(value) => setSaveFromDate(value)}
                    placeholder=" "
                    id="saveFromDate"
                    lable="From Date"
                  />
                </div>
                <div className="col-sm-2">
                  <DatePicker
                    className="custom-calendar"
                    name="saveToDate"
                    value={saveToDate}
                    onChange={(value) => setSaveToDate(value)}
                    placeholder=" "
                    id="saveToDate"
                    lable="To Date"
                    minDate={new Date(saveFromDate)}
                  />
                </div>
                <div>
                  <button
                    className="btn btn-success  btn-block mb-2"
                    onClick={handleSave}
                  >
                    {t("Save")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <NoRecordFound />
        )}
      </Accordion>

      {/* ── Log Modal ── */}
      {showLog && (
        <Modal
          visible={showLog}
          setVisible={setShowLog}
          Header={t("Rate List Log")}
          modalWidth="90vw"
        >
          <div className="row p-2">
            <div className="col-12">
              <Tables style={{ maxHeight: "400px", overflowY: "auto" }}>
                <thead>
                  <tr>
                    <th>{t("S.No")}</th>
                    <th>{t("Centre Name")}</th>
                    <th>{t("Test Name")}</th>
                    <th>{t("Old Rate")}</th>
                    <th>{t("New Rate")}</th>
                    <th>{t("Old Entry Date")}</th>
                    <th>{t("Old Entry By")}</th>
                    <th>{t("New Entry Date")}</th>
                    <th>{t("New Entry By")}</th>
                  </tr>
                </thead>
                <tbody>
                  {logData.length > 0 ? (
                    logData.map((log, index) => (
                      <tr key={index}>
                        <td data-title={t("S.No")}>{index + 1}&nbsp;</td>
                        <td data-title={t("Centre Name")}>{log?.CentreName}&nbsp;</td>
                        <td data-title={t("Test Name")}>{log?.InvestigationName}&nbsp;</td>
                        <td data-title={t("Old Rate")}>{Number(log?.OldRate).toFixed(2)}&nbsp;</td>
                        <td data-title={t("New Rate")}>{Number(log?.NewRate).toFixed(2)}&nbsp;</td>
                        <td data-title={t("Old Entry Date")}>{log?.OldEntryDate || "-"}&nbsp;</td>
                        <td data-title={t("Old Entry By")}>{log?.OldCreatedByName || "-"}&nbsp;</td>
                        <td data-title={t("New Entry Date")}>{log?.NewEntryDate || "-"}&nbsp;</td>
                        <td data-title={t("New Entry By")}>{log?.NewCreatedByName || "-"}&nbsp;</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="text-center">
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
    </>
  );
};

export default ScheduleRateList;
