import React, { useEffect, useMemo, useState } from "react";
import {
  getAccessRateTypeNew,
  getBillingCategory,
} from "../util/Commonservices";
import { toast } from "react-toastify";
import { axiosInstance } from "../../utils/axiosInstance";
import { useTranslation } from "react-i18next";
import Accordion from "@app/components/UI/Accordion";
import DoctorShareTransferModal from "../utils/DoctorShareTransferModal";
import { SelectBox } from "../../components/formComponent/SelectBox";
import Loading from "../../components/loader/Loading";
import Tables from "../../components/UI/customTable";
import Input from "../../components/formComponent/Input";
import { IndexHandle, number } from "../../utils/helpers";
import { Record } from "../../utils/Constants";
import Pagination from "../../Pagination/Pagination";
import ReactSelect from "../../components/formComponent/ReactSelect";
import ImportExcelToUpload from "../utils/ExcelImport/ImportExcelToUpload";
import { CustomButton, SearchButton } from "../../components/UI/CustomButton";
import CustomTabs from "../../components/UI/CustomTabs";
import DeptShareImportExportModal from "./DeptShareImportExportModal";
import Heading from "../../components/UI/Heading";
import Modal from "@app/components/formComponent/Modal";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";

const SetDoctorShare = () => {
  const userdata = useLocalStorage("userData", "get");
  const DefaultCurrencyName = userdata?.DefaultCurrencyName;
  const [loading, setLoading] = useState(false);
  const [secondLoading, setSecondLoading] = useState(false);
  const [formTable, setFormTable] = useState([]);
  const [formTableNew, setFormTableNew] = useState([]); // full dataset
  const [saveItem, setSaveItem] = useState([]);
  const [RateData, setRateData] = useState([]);
  const [DoctorData, setDoctorData] = useState([]);
  const [Category, setCategory] = useState([]);
  const [DepartmentData, setDepartmentData] = useState([]);

  const [items, setItems] = useState([]);

  // Frontend pagination state
  const [PageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);

  const [state, setState] = useState({
    ToggleData: "Department",
    searchType: "1",
    RateTypeID: "",
    DoctorID: "",
  });

  const { t } = useTranslation();
  const [payload, setPayload] = useState({
    DoctorID: "0",
    RateTypeID: "",
    DepartmentID: "",
    BillingCategoryID: "",
    ItemID: "",
  });

  const [show, setShow] = useState(false);
  const [isInclude, setIsInclude] = useState(true);
  const [showDeptImportExport, setShowDeptImportExport] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [logData, setLogData] = useState([]);
  const [logLoading, setLogLoading] = useState(false);

  // Slice formTableNew for current page display
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PageSize;
    return formTableNew.slice(start, start + PageSize);
  }, [formTableNew, currentPage, PageSize]);

  const handleChange = (name, value) => {
    if (name === "ToggleData") {
      setIsInclude(true);
      if (value === "Department") {
        setFormTableNew([]);
        setPayload({
          DoctorID: "0",
          RateTypeID: "",
          DepartmentID: "",
          BillingCategoryID: "",
        });
        setState({ ...state, [name]: value });
      }
      if (value === "Item") {
        setState({ ...state, [name]: value, RateTypeID: "", DoctorID: "" });
        setFormTable([]);
      }
    } else {
      setState({ ...state, [name]: value });
    }
  };

  const handleSearchSelectChange = (label, value) => {
    setState({ ...state, [label]: String(value?.value) });
  };

  const handleArrayChange = (e, index) => {
    const { name, value } = e.target;
    const data = [...formTable];
    data[index][name] = value > 100 ? "" : value;
    if (name === "DocSharePer") {
      data[index].isDocSharePerEdited = true;
    }
    setFormTable(data);
  };

  const handleSelectChangeDoctor = (event) => {
    const { name, value } = event.target;
    setPayload({ ...payload, [name]: value });
  };

  const handleSearchSelectChangeDoctor = (label, value) => {
    setPayload({ ...payload, [label]: String(value?.value) });
    if (label === "DoctorID" && value?.value === "") {
      setFormTableNew([]);
    }
  };

  // RateTypeID is a single value now ("0" = All RateType)
  const getSelectedDepartmentRateTypeID = () => state?.RateTypeID || "0";

  const getSelectedRateTypeID = () => payload?.RateTypeID || "0";

  const isAllDepartmentRateTypesSelected = state?.RateTypeID === "0";

  const isAllItemRateTypesSelected = payload?.RateTypeID === "0";

  const validation = () => {
    const data = formTableNew.filter(
      (ele) =>
        ["", 0].includes(ele?.DocShareAmt) && ["", 0].includes(ele?.DocSharePer)
    );
    return data.length > 0 ? true : false;
  };

  const isChecked = (name, state, value, id) => {
    if (id) {
      return state?.map((ele) =>
        ele?.TestID === id ? ele[name] === value : ele
      );
    } else {
      return state?.map((ele) => ele[name] === value);
    }
  };

  // Header-level bulk change — operates on FULL formTableNew array
  const handleChangeNew = (e) => {
    const { name, value, checked, type } = e.target;
    if (type === "checkbox") {
      setFormTableNew((prev) =>
        prev.map((ele) => ({ ...ele, [name]: checked }))
      );
    } else {
      if (name === "DocSharePer") {
        setFormTableNew((prev) =>
          prev.map((ele) => ({
            ...ele,
            DocSharePer: value > 100 ? "" : value,
            DocShareAmt: "",
            isDocSharePerEdited: true,
            isChecked: ["", 0].includes(value) ? false : ele.isChecked,
          }))
        );
        document.getElementById("DocShareAmt").value = "";
        if (parseInt(value) > 100) {
          document.getElementById("DocSharePer").value = "";
        }
      } else if (name === "DocShareAmt") {
        setFormTableNew((prev) =>
          prev.map((ele) => ({
            ...ele,
            DocShareAmt: value,
            DocSharePer: "",
            isChecked: ["", 0].includes(value) ? false : ele.isChecked,
          }))
        );
        document.getElementById("DocSharePer").value = "";
      }
    }
  };

  // Row-level change — find the actual row in full array by its real index
  const handleChangeNewOne = (e, pageIndex) => {
    const { name, value, checked, type } = e.target;
    // Convert page-local index to global index in formTableNew
    const globalIndex = (currentPage - 1) * PageSize + pageIndex;

    setFormTableNew((prev) => {
      const val = [...prev];
      if (type === "checkbox") {
        val[globalIndex][name] = checked;
      } else {
        val[globalIndex][name] = value;
        if (name === "DocShareAmt") {
          val[globalIndex].DocSharePer = "";
          val[globalIndex].isChecked = ["", 0].includes(value) ? false : val[globalIndex].isChecked;
        } else if (name === "DocSharePer") {
          val[globalIndex].DocShareAmt = "";
          val[globalIndex][name] = value > 100 ? "" : value;
          val[globalIndex].isDocSharePerEdited = true;
          val[globalIndex].isChecked = ["", 0].includes(value) ? false : val[globalIndex].isChecked;
        }
      }
      return val;
    });
  };

  const handleChangeDepShare = (e) => {
    const { name, value } = e.target;
    setFormTable((prev) =>
      prev.map((ele) => ({ ...ele, [name]: value > 100 ? "" : value, isDocSharePerEdited: true }))
    );
    if (parseInt(document.getElementById("DocSharePer").value) > 100) {
      document.getElementById("DocSharePer").value = "";
    }
  };

  const getDepartment = () => {
    axiosInstance
      .get("Department/getDepartmentData")
      .then((res) => {
        const DeptDataValue = res.data.message.map((ele) => ({
          value: ele.DepartmentID,
          label: ele.Department,
        }));
        setDepartmentData(DeptDataValue);
      })
      .catch((err) => console.log(err));
  };

  const getTableData = (data) => {
    setLoading(true);
    axiosInstance
      .post("DocShareMaster/getDepartmentDocData", data)
      .then((res) => {
        const data = res?.data?.message || [];

        setFormTable(data);

        setIsInclude(!data.some((item) => item.IsInclude === 0));
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        toast.error(err?.response?.data?.message || "Error Occured");
      });
  };

  const getDepartmentDocData = () => {
    setSecondLoading(true);
    axiosInstance
      .post("DocShareMaster/getDepartmentDocDataByItem", {
        DoctorID: payload?.DoctorID || "0",
        RateTypeID: getSelectedRateTypeID(),
        DepartmentID: payload?.DepartmentID || "0",
        BillingCategoryID: payload?.BillingCategoryID || "0",
        ItemID: payload?.ItemID || "0",
        // PageNo: 0,
        // PageSize: 0,
        searchType: state?.searchType,
      })
      .then((res) => {
        const data = res?.data?.message;
        if (data?.length > 0) {
          setFormTableNew(data.map((ele) => ({
            ...ele,
            DocShareAmt: ele?.DocShareAmt,
            DocSharePer: ele?.DocSharePer,
            isChecked: false,
          })));
          const hasExcludedRow = data?.some(
            (item) => item.IsInclude === 0
          );

          setIsInclude(!hasExcludedRow);
          setCurrentPage(1); // reset to page 1 on fresh fetch
        } else {
          toast.error("no data found");
          setFormTableNew([]);
        }
        setSecondLoading(false);
      })
      .catch((err) => {
        toast.error(err?.data?.message || "SomeThing Went Wrong");
        setSecondLoading(false);
      });
  };

  const BindDoctorData = () => {
    axiosInstance
      .post("DoctorReferal/getDoctorDataBind")
      .then((res) => {
        const val = res?.data?.message?.map((ele) => ({
          label: ele?.DoctorName,
          value: ele?.DoctorID,
        }));
        val.unshift({ label: "Select Doctor", value: "" });
        setDoctorData(val);
      })
      .catch((err) =>
        toast.error(err?.data?.message || "SomeThing Went Wrong")
      );
  };

  const getTestByTest = async () => {
    if (!payload?.DepartmentID) return;
    axiosInstance
      .post("CommonController/Fetchprocedure", {
        typeName: "inHouse_Doctorsanddepartment",
        params: ["DepartmentItem", String(payload.DepartmentID || "")],
      })
      .then((res) => {
        setItems(
          res?.data?.data?.map((item) => ({
            ...item,
            label: item?.TestName,
            value: String(item?.InvestigationID),
          })) || []
        );
      });
  };

  const submit = () => {
    setLoading(true);
    const sanitizedData = formTable?.map((ele) => ({
      ...ele,
      DocSharePer:
        ele?.DocSharePer === "" || ele?.DocSharePer === null || ele?.DocSharePer === undefined
          ? 0
          : Number(ele.DocSharePer),
    }));
    axiosInstance
      .post("DocShareMaster/DefaulDepartmentShareCreate", {
        RateTypeID: getSelectedDepartmentRateTypeID(),
        DoctorID: state?.DoctorID ? String(state.DoctorID) : "0",
        IsInclude: isInclude ? 1 : 0,
        Data: sanitizedData,
      })
      .then((res) => {
        toast.success(res?.data?.message || "Record Saved Successfully");
        getTableData({
          searchType: state?.searchType,
          DoctorID: state?.DoctorID,
          RateTypeID: getSelectedDepartmentRateTypeID(),
        });
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Something went wrong");
        setLoading(false);
      });
  };

  const handleSubmit = () => {
    const finalData = formTableNew?.filter((ele) => ele?.isChecked);
    const payloadApi = finalData?.map((ele) => ({
      ...ele,
      DocShareAmt: ele?.DocShareAmt ?? "0",
      DocSharePer: ele?.DocSharePer ?? "0",
    }));
    setSecondLoading(true);
    axiosInstance
      .post("DocShareMaster/SaveDocItemShare", {
        RateTypeID: getSelectedRateTypeID(),
        DoctorID: payload?.DoctorID,
        DepartmentID: payload?.DepartmentID,
        IsInclude: isInclude ? 1 : 0,
        Data: payloadApi,
      })
      .then((res) => {
        toast.success(res?.data?.message);
        getDepartmentDocData();
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Something went wrong");
        setSecondLoading(false);
      });
  };

  const handleOpenLog = () => {
    if (!state?.RateTypeID?.length) { toast.warning(t("Please select Rate Type")); return; }
    setLogLoading(true);
    axiosInstance
      .post("DocShareMaster/GetDefaultDeptShareLog", {
        RateTypeID: getSelectedDepartmentRateTypeID(),
        DoctorID: state?.DoctorID || "0",
      })
      .then((res) => {
        if (res?.data?.success) {
          setLogData(res?.data?.message ?? []);
          setShowLogModal(true);
          setLogLoading(false);
        } else {
          toast.error(res?.data?.message || "No log data found");
          setLogData([]);
          setShowLogModal(false);
          setLogLoading(false);
        }
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Something went wrong");
        setLogLoading(false);
      });
  };

  const handleDepartmentSearch = () => {
    if (!state?.RateTypeID?.length) { toast.warning(t("Please select Rate Type")); return; }
    getTableData({
      searchType: state?.searchType,
      DoctorID: state?.DoctorID || "0",
      RateTypeID: getSelectedDepartmentRateTypeID(),
    });
  };

  const handleItemSearch = () => {
    if (!payload?.RateTypeID?.length) { toast.warning(t("Please select Rate Type")); return; }
    getDepartmentDocData();
  };


  useEffect(() => {
    getAccessRateTypeNew(setRateData);
    getDepartment();
    BindDoctorData();
    getBillingCategory(setCategory);
  }, []);

  useEffect(() => {
    if (payload?.DepartmentID) getTestByTest();
    setPayload((prev) => ({ ...prev, ItemID: "" }));
  }, [payload?.DepartmentID]);

  useEffect(() => {
    if (state?.ToggleData === "Department" && !state?.RateTypeID?.length) {
      setFormTable([]);
    }
  }, [state?.RateTypeID, state?.ToggleData]);

  const departmentContent = (
    <div className="pt-2">
      <Heading title="Department" />
      <div className="row pl-2 pr-2 mt-2">
        <div className="col-sm-2">
          <ReactSelect
            dynamicOptions={[{ label: "SelectRateType", value: "" }, { label: "All RateType", value: "0" }, ...RateData]}
            name="RateTypeID"
            lable={t("Rate Type")}
            id="RateTypeID"
            removeIsClearable={true}
            placeholderName={t("Rate Type")}
            value={state?.RateTypeID}
            onChange={handleSearchSelectChange}
          />
        </div>
        <div className="col-sm-2">
          <ReactSelect
            dynamicOptions={DoctorData}
            name="DoctorID"
            lable={t("Doctor")}
            id="DoctorID"
            removeIsClearable={true}
            placeholderName={t("Doctor")}
            value={state?.DoctorID}
            onChange={handleSearchSelectChange}
            isDisabled={!state?.RateTypeID?.length}
          />
        </div>
        <div className="col-auto d-flex align-items-start pb-1 gap-2" style={{ gap: "5px" }}>
          <SearchButton text={t("Search")} onClick={handleDepartmentSearch} disabled={loading} />
          <CustomButton
            icon="excel"
            text={t("Import / Export")}
            onClick={() => setShowDeptImportExport(true)}
          />
          <CustomButton
            icon="history"
            text={t("Log")}
            onClick={handleOpenLog}
            disabled={logLoading}
          />
        </div>

        {DefaultCurrencyName === "KES" && (
          <div className="col-auto d-flex align-items-center pb-1">
            <label className="d-flex align-items-center mb-0" style={{ gap: "5px" }}>
              <input
                type="checkbox"
                name="IsInclude"
                checked={isInclude}
                onChange={(e) => setIsInclude(e.target.checked)}
              />
              {t("Include")}
            </label>
          </div>
        )}
      </div>

      {loading ? (
        <Loading />
      ) : (
        formTable.length > 0 && (
          <>
            <div className="row p-2">
              <div className="col-12">
                <Tables style={{ maxHeight: "400px", overflowY: "auto" }}>
                  <thead style={{ position: "sticky", top: 0, zIndex: 2 }}>
                    <tr>
                      <th>{t("S.No")}</th>
                      <th>{t("Department")}</th>
                      <th>
                        <div className="d-flex align-items-center gap-2">
                          <span style={{ paddingRight: "10px" }}>{t("Percentage %")}</span>
                          <Input
                            type="number"
                            id="DocSharePer"
                            name="DocSharePer"
                            placeholder={t("Enter Percent(%)")}
                            onChange={handleChangeDepShare}
                            style={{ width: "150px" }}
                          />
                        </div>
                      </th>
                    </tr>
                  </thead>
                  {formTable.map((ele, index) => (
                    <tbody key={index}>
                      <tr>
                        <td data-title={t("S.No")}>{index + 1}&nbsp;</td>
                        <td data-title={t("Department")}>{ele?.Department}&nbsp;</td>
                        <td data-title={t("Enter Percent%")}>
                          <Input
                            type="number"
                            name="DocSharePer"
                            id="DocSharePer"
                            placeholder=""
                            value={
                              // isAllDepartmentRateTypesSelected && !ele?.isDocSharePerEdited
                              //   ? ""
                              //   : 
                              ele?.DocSharePer
                            }
                            onChange={(e) => handleArrayChange(e, index)}
                          />
                        </td>
                      </tr>
                    </tbody>
                  ))}
                </Tables>
              </div>
            </div>
            <div className="row">
              <div className="col-sm-1 mb-2 ml-2">
                <button type="button" className="btn btn-block btn-success btn-sm" onClick={submit}>
                  {t("Save")}
                </button>
              </div>
            </div>
          </>
        )
      )}
    </div>
  );

  const itemContent = (
    <div className="pt-2">
      <Heading title="Item" />
      <div className="row pl-2 mt-2">
        <div className="col-sm-2">
          <ReactSelect
            dynamicOptions={[
              { label: "SelectRateType", value: "" },
              ...(DefaultCurrencyName === "KES"
                ? [{ label: "All RateType", value: "0" }]
                : []),
              ...RateData,
            ]}
            name="RateTypeID"
            lable={t("Rate Type")}
            id="RateTypeID"
            removeIsClearable={true}
            placeholderName={t("Rate Type")}
            value={payload?.RateTypeID}
            onChange={handleSearchSelectChangeDoctor}
          />
        </div>
        <div className="col-sm-2">
          <ReactSelect
            dynamicOptions={[{ label: "Select Department", value: "" }, ...DepartmentData]}
            name="DepartmentID"
            lable={t("Department")}
            id="DepartmentID"
            removeIsClearable={true}
            placeholderName={t("Department")}
            value={payload?.DepartmentID}
            onChange={handleSearchSelectChangeDoctor}
          />
        </div>
        <div className="col-sm-2">
          <ReactSelect
            dynamicOptions={[{ label: "Select Item", value: "" }, ...items]}
            name="ItemID"
            lable={t("Item")}
            id="ItemID"
            removeIsClearable={true}
            placeholderName={t("Item")}
            value={payload?.ItemID}
            onChange={handleSearchSelectChangeDoctor}
          />
        </div>
        <div className="col-sm-2">
          <SelectBox
            options={[{ label: "Select Category", value: "" }, ...Category]}
            name={"BillingCategoryID"}
            id="BillingCategoryID"
            placeholder=""
            lable={t("Category")}
            selectedValue={payload?.BillingCategoryID}
            onChange={handleSelectChangeDoctor}
          />
        </div>
        <div className="col-sm-2">
          <ReactSelect
            dynamicOptions={DoctorData}
            name="DoctorID"
            lable={t("Doctor")}
            id="DoctorID"
            removeIsClearable={true}
            placeholderName={t("Doctor")}
            value={payload?.DoctorID}
            onChange={handleSearchSelectChangeDoctor}
          />
        </div>
        <div className="col-sm-auto d-flex align-items-start pb-1">
          <SearchButton text={t("Search")} onClick={handleItemSearch} disabled={secondLoading} />
        </div>

      </div>
      <div className="row mb-2 mt-2 mx-2">
        <ImportExcelToUpload doctorShare={true} DoctorData={DoctorData} RateData={RateData} />
      </div>
      {DefaultCurrencyName === "KES" && (
        <div className="row pl-2 mb-2 mx-2">
          <div className="col-auto d-flex align-items-center">
            <label className="d-flex align-items-center mb-0" style={{ gap: "5px" }}>
              <input
                type="checkbox"
                name="IsInclude"
                checked={isInclude}
                onChange={(e) => setIsInclude(e.target.checked)}
              />
              {t("Include")}
            </label>
          </div>
        </div>
      )}
      {secondLoading ? (
        <Loading />
      ) : (
        <>
          {formTableNew.length > 0 && (
            <div className="row p-2">
              <div className="col-12">
                <Tables style={{ maxHeight: "400px", overflowY: "auto" }}>
                  <thead style={{ position: "sticky", top: 0, zIndex: 2 }}>
                    <tr>
                      <th>{t("S.No")}</th>
                      <th>{t("Test Code")}</th>
                      <th>{t("Investigation Name")}</th>
                      <th>
                        {t("DocShare Amt")}
                        <Input
                          className="form-control ui-autocomplete-input input-sm"
                          type="number"
                          name="DocShareAmt"
                          id="DocShareAmt"
                          placeholder={t("Enter Amount")}
                          onChange={handleChangeNew}
                        />
                      </th>
                      <th>
                        {t("DocShare Per (%)")}
                        <Input
                          className="form-control ui-autocomplete-input input-sm"
                          type="number"
                          name="DocSharePer"
                          id="DocSharePer"
                          placeholder={t("Enter Percent(%)")}
                          onChange={handleChangeNew}
                        />
                      </th>
                      <th>
                        <input
                          type="checkbox"
                          name="isChecked"
                          onChange={handleChangeNew}
                          disabled={validation()}
                          checked={
                            formTableNew?.length > 0
                              ? !isChecked("isChecked", formTableNew, true).includes(false)
                              : false
                          }
                        />
                      </th>
                    </tr>
                  </thead>
                  {paginatedData.map((ele, pageIndex) => (
                    <tbody key={pageIndex}>
                      <tr>
                        <td data-title={t("S.No")}>
                          {(currentPage - 1) * PageSize + pageIndex + 1}&nbsp;
                        </td>
                        <td data-title={t("Test Code")}>{ele?.TestCode}&nbsp;</td>
                        <td data-title={t("Investigation Name")}>{ele?.InvestigationName}&nbsp;</td>
                        <td data-title={t("DocShare Amt")}>
                          <Input
                            type="number"
                            name="DocShareAmt"
                            id="DocShareAmt"
                            onInput={(e) => number(e, 6)}
                            value={ele?.DocShareAmt}
                            onChange={(e) => handleChangeNewOne(e, pageIndex)}
                          />
                        </td>
                        <td data-title={t("DocSharePer")}>
                          <Input
                            type="number"
                            name="DocSharePer"
                            id="DocSharePer"
                            onInput={(e) => number(e, 3)}
                            value={
                              // isAllItemRateTypesSelected && !ele?.isDocSharePerEdited
                              //   ? ""
                              // :
                              ele?.DocSharePer
                            }
                            onChange={(e) => handleChangeNewOne(e, pageIndex)}
                          />
                        </td>
                        <td data-title={t("Status")}>
                          <input
                            type="checkbox"
                            name="isChecked"
                            checked={ele?.isChecked}
                            disabled={!(ele?.DocSharePer || ele?.DocShareAmt)}
                            onChange={(e) => handleChangeNewOne(e, pageIndex)}
                          />
                        </td>
                      </tr>
                    </tbody>
                  ))}
                </Tables>

                {formTableNew?.length > 0 &&
                  isChecked("isChecked", formTableNew, true).includes(true) && (
                    <div className="box-footer">
                      <div className="col-sm-1 mt-3">
                        <button
                          type="button"
                          className="btn btn-block btn-success btn-sm"
                          onClick={handleSubmit}
                        >
                          {t("Save")}
                        </button>
                      </div>
                    </div>
                  )}
              </div>
            </div>
          )}

          {formTableNew?.length > 0 && (
            <div className="d-flex flex-wrap justify-content-end align-items-center">
              <label className="mt-4 mx-2">{t("No Of Record/Page")}</label>
              <SelectBox
                className="mt-3 p-1 RecordSize mr-2"
                selectedValue={PageSize}
                options={Record}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
              />
              <Pagination
                className="pagination-bar"
                currentPage={currentPage}
                totalCount={formTableNew.length}
                pageSize={PageSize}
                onPageChange={(page) => setCurrentPage(page)}
              />
            </div>
          )}
        </>
      )}
    </div>
  );

  const tabs = [
    { id: "Department", label: t("Department"), content: departmentContent },
    { id: "Item", label: t("Item"), content: itemContent },
  ];

  return (
    <>
      {show && (
        <DoctorShareTransferModal show={show} handleClose={() => setShow(false)} />
      )}

      <Modal
        visible={showLogModal}
        setVisible={setShowLogModal}
        Header={t("Department Share Log")}
        modalWidth="1100px"
      >
        <Tables>
          <thead>
            <tr>
              <th>{t("S.No")}</th>
              <th>{t("Rate Type")}</th>
              <th>{t("Doctor")}</th>
              <th>{t("Department")}</th>
              <th>{t("Old Share %")}</th>
              <th>{t("New Share %")}</th>
              <th>{t("Old Entry Date")}</th>
              <th>{t("New Entry Date")}</th>
              <th>{t("Old Created By")}</th>
              <th>{t("New Created By")}</th>
            </tr>
          </thead>
          <tbody>
            {logData.length > 0 ? (
              logData.map((item, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{item.RateTypeName}</td>
                  <td>{item.DoctorName}</td>
                  <td>{item.DepartmentName}</td>
                  <td>{item.OldDocSharePer}</td>
                  <td>{item.NewDocSharePer}</td>
                  <td>{item.OlddtEntry}</td>
                  <td>{item.NewdtEntry}</td>
                  <td>{item.OldCreatedByName}</td>
                  <td>{item.NewCreatedByName}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={10} className="text-center">{t("No Record Found")}</td>
              </tr>
            )}
          </tbody>
        </Tables>
      </Modal>

      <DeptShareImportExportModal
        visible={showDeptImportExport}
        onClose={() => setShowDeptImportExport(false)}
        RateData={RateData}
        DoctorData={DoctorData}
      />
      <Accordion
        name={t("Set Doctor Share")}
        defaultValue={true}
        isBreadcrumb={true}
        notOpen={true}
        seconTitle={
          <CustomButton
            icon="share"
            text={t("Transfer Doctor Share")}
            onClick={() => setShow(true)}
          />
        }
      >
        <div className="card-body pt-0">
          <CustomTabs
            tabs={tabs}
            activeTab={state.ToggleData}
            onSelect={(k) => handleChange("ToggleData", k)}
          />
        </div>
      </Accordion>
    </>
  );
};

export default SetDoctorShare;