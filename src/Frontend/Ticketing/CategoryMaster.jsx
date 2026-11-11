import React, { useEffect, useState } from "react";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { SelectBoxWithCheckbox } from "../../components/formComponent/MultiSelectBox";
import CustomTable from "../../components/Table/CustomTable";
import Input from "../../components/formComponent/Input";
import Heading from "../../components/UI/Heading";
import { useTranslation } from "react-i18next";
import { Button, Form } from "react-bootstrap";
import "./CategoryMaster.css";
import { useSelector } from "react-redux";
import {
  setModalData,
  setTagEmployeeModalToggle,
  setTatModalOpen,
  setViewIssueModalData,
} from "../../store/reducers/TicketingModuleSlice/TicketingModuleSlice";
import { useDispatch } from "react-redux";
import Modal from "../../components/ModalComponent/Modal";
import EditTatModal from "./EditTatModal";
import { apiUrls } from "../../utils/apiUrls";
import { axiosInstance } from "../../utils/axiosInstance";
import axios from "axios";
import RadioInput from "../../components/formComponent/RadioInput";
import { notify } from "../../utils/utils";
import { CiEdit } from "react-icons/ci";
import { MdDeleteOutline } from "react-icons/md";
import { BsPersonPlus } from "react-icons/bs";
import { setLoading } from "../../store/reducers/loadingSlice/loadingSlice";
import { faL } from "@fortawesome/free-solid-svg-icons";
import { useLocation, useNavigate } from "react-router-dom";
import FilterInput from "../../components/Filter/FilterInput";
import ModalTagEmployee from "./ModalTagEmpoyee";
import { ViewMenu } from "../../components/SvgIcons";
import TicketMenuList from "./TicketMenuList";
import TableFilterDot from "../Components/TableFilterDot";

// import { Input } from "@profabric/react-components";

const CategoryMaster = () => {
  const { tatModalOpen, tagEmployeeModalToggle } = useSelector(
    (state) => state.ticketing
  );
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [filterInputValue, setFilterInputValue] = useState("");
  const [filterTableData, setFilterTableData] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [showMore, setShowMore] = useState(false);

  const [dropDownList, setDropdownlist] = useState({
    hideRoleList: [],
  });

  const showList = [
    { label: "Show Client", value: 1 },
    { label: "Show BarCode No.", value: 2 },
    { label: " Mandatory Client", value: 3 },
    { label: "Show BarCode No.", value: 4 },
    { label: "Mandatory BarCode No.", value: 5 },
    { label: "Show Visit No.", value: 6 },
    { label: "Mandatory Visit No.", value: 7 },
    { label: "Show Test", value: 8 },
    { label: "Mandatory Test", value: 9 },
  ];

  const roleList = [
    { label: "ACCOUNTS", value: 1 },
    { label: "ACCOUNTS 2", value: 254 },
    { label: "ADMINISTRATOR", value: 177 },
    { label: "B2B CLIENT", value: 243 },
    { label: "CC CLIENT", value: 241 },
    { label: "CENTRE ACCOUNTS", value: 3 },
    { label: "CENTRE ACCOUNTS 2", value: 253 },
    { label: "CENTRE ADMIN", value: 2 },
    { label: "CUSTOMER CARE", value: 212 },
    { label: "CYTOGENETICS", value: 245 },
    { label: "DOCACCOUNT", value: 53 },
    { label: "EDP", value: 6 },
    { label: "EQUIPMENT MANAGEMENT", value: 251 },
    { label: "FC CLIENT", value: 242 },
    { label: "FRONT OFFICE", value: 9 },
    { label: "FRONT OFFICE - HISTO", value: 255 },
    { label: "HISTOPATHOLOGY", value: 137 },
    { label: "HOME COLLECTION", value: 226 },
    { label: "LAB USERS", value: 211 },
    { label: "LABORATORY", value: 11 },
    { label: "LABORATORY MASTER", value: 172 },
    { label: "LOGISTIC FRONT OFFICE", value: 252 },
    { label: "MICRO MASTER", value: 258 },
    { label: "MOBILEAPP", value: 187 },
    { label: "PCC", value: 183 },
    { label: "PETTY CASH ADMIN", value: 239 },
    { label: "PETTY CASH CENTRE", value: 240 },
    { label: "PUP", value: 219 },
    { label: "QUALITY", value: 237 },
    { label: "QUALITY ADMIN", value: 181 },
    { label: "RADIO CASE ASSIGNMENTS", value: 257 },
    { label: "RADIOLOGY", value: 15 },
    { label: "REPORT", value: 222 },
    { label: "REPORTS DISPATCH", value: 214 },
    { label: "SALES", value: 220 },
    { label: "SALES ADMIN", value: 249 },
    { label: "SALESADMIN", value: 221 },
    { label: "SAMPLE COLLECTION", value: 141 },
    { label: "SATELLITE LABS", value: 248 },
    { label: "STORE", value: 188 },
    { label: "STORE INDENT", value: 246 },
    { label: "STORE-INDENT", value: 13 },
    { label: "TICKETING", value: 224 },
  ];
  const statusList = [
    { label: "Active", value: "1" },
    { label: "DeActive", value: "0" },
  ];

  const tableHeaders = [
    { header: "S.No", field: "SrNo", width: "3%" },
    { header: "Category Name", field: "CategoryName", width: "20%" },
    { header: "TAT (Min)", field: "tat", width: "10%" },
    { header: "Show Field", field: "showField", width: "10%" },
    { header: "Status", field: "IsActive", width: "10%" },
    { header: "Created By", field: "CreatedByName" },
    { header: "Created On", field: "dtEntry" },
    { header: "Last Updated By", field: "UpdatedByName" }, // assuming 'Lab No' refers to 'Visit No'
    { header: "Last Updated On", field: "dtUpdate" },
    // { header: "Status", field: "IsActive" },
    { header: "Action", field: "Edit" },
    { header: "TAG Employee", field: "tagEmployee", width: "5%" },
  ];

  const initialPayload = {
    categoryName: "",
    show: [],
    status: true,
    hideInRole: [],
    role: [],
    showClient: 0,
    mandatoryClient: 0,
    showBarcode: 0,
    mandatoryBarcode: 0,
    showVisit: 0,
    mandatoryVisit: 0,
    showTest: 0,
    mandatoryTest: 0,
    id: null,
    level1: "",
    level2: "",
    level3: "",
  };
  const [payload, setPayload] = useState(initialPayload);
  const [tableData, setTableData] = useState([]);
  const [isUpdate, setIsUpdate] = useState(false);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setPayload((prev) => ({ ...prev, [name]: value }));
  };

  const onRowEdit = (row) => {
    setPayload((prev) => ({
      ...prev,
      categoryName: row?.CategoryName,
      show: [2, 4],
      role: row?.Roles?.split(","),
      status: row?.IsActive?.toString() === "1" ? true : false,
      showClient: row?.ShowClient || 0,
      showTest: row?.ShowTestCode || 0,
      showVisit: row?.ShowLabNo || 0,
      showBarcode: row?.ShowBarcodeNo || 0,
      mandatoryClient: row?.MandatoryClient,
      mandatoryBarcode: row?.MandatoryBarcodeNo,
      mandatoryVisit: row?.MandatoryLabNo,
      mandatoryTest: row?.MandatoryTestCode,
      level1: row?.Level1Resolve,
      level2: row?.Level2Resolve,
      level3: row?.Level3Resolve,
      id: row?.ID,
    }));
    if (row?.ID) {
      setIsUpdate(true);
    }
  };

  const handleReactChange = (name, e) => {
    setPayload((prev) => ({ ...prev, [name]: e?.value }));
  };

  const handleSelectMultiChange = (select, name) => {
    const val = select.map((ele) => {
      return ele?.value;
    });
    setPayload((prev) => ({ ...prev, [name]: val }));
  };

  const handleRest = () => {
    setPayload(initialPayload);
    setIsUpdate(false);
  };

  const handleTatModalOpen = (val, rowData) => {
    dispatch(setTatModalOpen(val));
    dispatch(setViewIssueModalData(rowData));
  };

  const handleOpenModal = (val) => {
    dispatch(setTagEmployeeModalToggle(val));
  };

  const handleAtSelectLavel = (levelIndex) => {
    setSelectedLevel(levelIndex);
    dispatch(setModalData({ level: levelIndex }));
  };

  const getHideRole = async () => {
    await axiosInstance
      .get(apiUrls?.BindRole)
      .then((res) => {
        setDropdownlist((prev) => ({
          ...prev,
          hideRoleList: res?.data?.message?.map((roleList) => ({
            label: roleList?.rolename,
            value: String(roleList?.id),
          })),
        }));
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    const value = checked ? 1 : 0;

    setPayload((prevState) => {
      const updatedState = { ...prevState, [name]: value };

      // If a "showX" is unchecked, uncheck "mandatoryX" as well
      if (name.startsWith("show") && value === 0) {
        const mandatoryKey = "mandatory" + name.replace("show", "");
        updatedState[mandatoryKey] = 0;
      }

      return updatedState;
    });
  };

  const SubmitActionType = () => {
    // if (isUpdate) {
    //   handleUpdateCategoryMaster();
    //   return;
    // }
    saveCategoryMaster();
  };

  const saveCategoryMaster = async () => {
    if (!payload?.categoryName) {
      notify("Category name is required.", "warn");
      return;
    }
    // if (!payload?.status) {
    //   notify("Status is required.", "warn");
    //   return;
    // }
    if (!payload?.level1) {
      notify("TAT level1 is required.", "warn");
      return;
    }
    if (!payload?.level2) {
      notify("TAT level2 is required.", "warn");
      return;
    }
    if (!payload?.level3) {
      notify("TAT level3 is required.", "warn");
      return;
    }
    const apiPayload = {
      TransactionType: !isUpdate ? "Insert" : "Update",
      designations: "",
      categoryID: isUpdate ? payload?.id : 0,

      categoryName: payload.categoryName,
      isActive: payload.status ? 1 : 0,
      // Number(payload.status)
      showClient: payload.showClient,
      mandatoryClient: payload.mandatoryClient,
      showBarcodeNo: payload.showBarcode,
      mandatoryBarcodeNo: payload.mandatoryBarcode,
      showTestCode: payload.showTest,
      mandatoryTestCode: payload.mandatoryTest,
      showLabNo: payload.showVisit,
      mandatoryLabNo: payload.mandatoryVisit,
      showRole: 0,
      mandatoryRole: 0,
      showCentre: 0,
      mandatoryCentre: 0,
      roles: payload.role?.join(",") || "",

      level1Resolve: payload?.level1,
      level2Resolve: payload?.level2,
      level3Resolve: payload?.level3,
    };
    dispatch(setLoading(true));
    await axiosInstance
      .post(apiUrls.SaveDataCategoryMaster, apiPayload)
      .then((res) => {
        notify(res?.data?.message, "success");
        getCategoryMaster();
        setIsUpdate(false);
        handleRest()
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
        notify(err?.data?.message, "error");
      });
    dispatch(setLoading(false));
  };

  const handleUpdateCategoryMaster = async () => {
    const apiPayload = {
      id: Number(payload.id),
      categoryName: payload.categoryName,
      isActive: Number(payload.status),

      showClient: payload.showClient,
      mandatoryClient: payload.mandatoryClient,
      showBarcodeNo: payload.showBarcode,
      mandatoryBarcodeNo: payload.mandatoryBarcode,
      showTestCode: payload.showTest,
      mandatoryTestCode: payload.mandatoryTest,
      showLabNo: payload.showVisit,
      mandatoryLabNo: payload.mandatoryVisit,
      showRole: 0,
      mandatoryRole: 0,
      showCentre: 0,
      mandatoryCentre: 0,
      roles: payload.role?.join(","),

      transactionType: "Insert",
      categoryID: "",
      designations: "",

      level1Resolve: Number(payload?.level1),
      level2Resolve: Number(payload?.level2),
      level3Resolve: Number(payload?.level3),
    };

    dispatch(setLoading(true));
    await axiosInstance
      .post(apiUrls.UpdateDataCategoryMaster, apiPayload)
      .then((res) => {
        notify(res?.data?.message, "success");
        getCategoryMaster();
        setIsUpdate(false);
      })
      .catch((err) => {
        console.log(err);
        notify(err?.data?.message, "error");
      });
    dispatch(setLoading(false));
  };

  const getCategoryMaster = async () => {
    const apiPayload = {
      type: "CategoryTable",
      categoryId: 0,
      queryID: 0,
      responseID: 0,
      priorityID: 0,
      ticketID: 0,
    };
    dispatch(setLoading(true));
    await axiosInstance
      .post(apiUrls.GetDataMaster, apiPayload)
      .then((res) => {
        console.log("GetDataMaster::", res?.data?.message);
        // notify(res?.data?.message, "success");
        if (!Array.isArray(res?.data?.message)) {
          setTableData([]);
          setFilterTableData([]);
          notify(res?.data?.data, "error");
          return;
        }
        setTableData(res?.data?.message);
        setFilterTableData(res?.data?.message);
      })
      .catch((err) => {
        console.log(err);
        notify(err?.respose?.data?.message, "error");
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  };

  const redirectTagEmployeePage = (rowData) => {
    navigate("/ticketing/category-tagEmployee", {
      state: {
        data: rowData,
        from: location.pathname,
      },
    });
  };

  const handleFilterInputChange = (e) => {
    const value = e.target.value;
    setFilterInputValue(value);
    setFilterTableData(
      tableData?.filter((data) => {
        const searchTerm = value.toLowerCase();
        return (
          (data?.CategoryName || "").toLowerCase().includes(searchTerm)
        );
      })
    );
  };


  const seeMoreData = [
    { name: "Tray Master", url: "/SampleStorageTrayMaster" },
    { name: "Device Master", url: "/SampleStorageDeviceMaster" },
    { name: "Storage Type Master", url: "/StorageTypeMaster" },
    { name: "Category Master", url: "/ticketing/category-master" },
    // { name: "Tag Employee", url: "/ticketing/category-tagEmployee" },
    { name: "Manage Query", url: "/ticketing/manage-query" },
    { name: "Manage Response", url: "/ticketing/manage-response" },
    { name: "New Ticket", url: "/ticketing/new-ticket" },
    { name: "View Ticket", url: "/ticketing/view-ticket" },
  ];

  console.log("tableData", dropDownList.hideRoleList);

  const handleToggleChange = (e) => {
    console.log("xxxkjshdie", e.target.checked);
    setPayload((prev) => ({ ...prev, status: e.target.checked }));
  };

  console.log("payloadxxx", payload);

  const colorCodingData = [
    { color: "#c4f884", id: "1", labelKey: "Active" },
    { color: "#ffc4cc", id: "2", labelKey: "De-Active" },
    // { color: "#ADD8E6", id: "3", labelKey: "To be Installed" },
    // { color: "#fffc04", id: "4", labelKey: "Standby" },
    // { color: "#FFFFFF", id: "5", labelKey: "Delete" },
  ];

  const statusCount = (statuType)=>{
    return tableData?.filter((item=> item?.IsActive == statuType))?.length
  }

  const filterOnClick = (type) => {
    if(type==='all'){
      setFilterTableData(tableData)
      return
    }
    setFilterTableData(
      tableData?.filter((data) => {
        // Normalize status to lowercase for comparison
        return String(data?.IsActive)?.toLowerCase() === type.toLowerCase();
      })
    );
  };

  useEffect(() => {
    getHideRole();
    getCategoryMaster();
  }, []);

  return (
    <>
      <div className="mt-1 h-100">
        <Heading
          title={<div>Category Master</div>}
          secondTitle={
            <label onClick={() => setShowMore((prev) => !prev)}>
              <ViewMenu />
            </label>
          }
        />
        <div className="card py-2 px-2">
          <div className="flex-row flex-wrap row py-2">
            <div className="col-sm-3 col-md-2">
              <Input
                type="text"
                name="categoryName"
                lable={t("Category name")}
                id="categoryName"
                value={payload?.categoryName}
                placeholder=" "
                onChange={handleChange}

                //   onKeyDown={(e) => handleIndex(e, "TestName")}
                //   disabled={User}
              />
            </div>

            <div className="col-sm-3 col-md-2">
              <SelectBoxWithCheckbox
                name="role"
                className="required-fields"
                placeholder=" "
                lable="Hide in Role"
                id="role"
                onChange={handleSelectMultiChange}
                options={dropDownList.hideRoleList || []}
                value={payload?.role}
              />
            </div>
            {/* <div className="col-sm-3 col-md-2">
              <ReactSelect
                dynamicOptions={statusList}
                name="status"
                lable={t("Status")}
                id="status"
                removeIsClearable={false}
                placeholderName={t("Status")}
                value={payload?.status}
                onChange={handleReactChange}
                className="required-fields"
              />
            </div> */}
            <div className="col-sm-3 col-md-2">
              <Input
                type="number"
                name="level1"
                id={"level1"}
                lable={t("TAT Level-1 (Min)")}
                value={payload?.level1}
                onChange={handleChange}
              />
            </div>
            <div className="col-sm-3 col-md-2">
              <Input
                type="number"
                name="level2"
                id="level2"
                value={payload?.level2}
                lable={t("TAT Level-2 (Min)")}
                onChange={handleChange}
              />
            </div>
            <div className="col-sm-3 col-md-2">
              <Input
                type="number"
                name="level3"
                id="level3"
                value={payload?.level3}
                lable={t("TAT Level-3 (Min)")}
                onChange={handleChange}
              />
            </div>
            <div className="col-sm-3 col-md-2">
              <Form.Check
                className="toggle_btn"
                type="switch"
                id="custom-switch"
                label="Status"
                checked={payload?.status}
                onChange={handleToggleChange}
              />
            </div>
          </div>

          {/* Default Employee Section */}
          {/* <div
            className="row d-flex px-3 pt-1 my-2 align-items-center"
            style={{ gap: "8px" }}
          >
            <p className="mb-0">Set Default Employee:</p>
            {Array.from({ length: 3 }).map((_, i) => (
              <div className="col-sm-3 col-md-3">
                <div className="class_place">TAT Level {i + 1}</div>
                <div
                  onClick={() => {
                    handleOpenModal(true);
                    handleAtSelectLavel(i + 1);
                  }}
                  key={i}
                  className=" custome_input"
                >
                  <div>Chandan Kumar</div>
                  <div>Asif Khan</div>
                  <div>+ More</div>
                </div>
              </div>
            ))}
          </div> */}
          <div className="w-100 px-2">
            {/* Client */}
            <div className="row d-flex align-items-center">
              <RadioInput
                inputType="checkbox"
                id={"showClient"}
                name={"showClient"}
                label={"Show Client"}
                respclass={"col-md-3 col-5"}
                value={payload?.showClient}
                onChange={handleCheckboxChange}
                checked={payload.showClient === 1}
              />
              <RadioInput
                inputType="checkbox"
                id={"mandatoryClient"}
                name={"mandatoryClient"}
                label={"Mandatory Client"}
                respclass={"col-md-3 col-5"}
                value={payload?.mandatoryClient}
                onChange={handleCheckboxChange}
                checked={payload.mandatoryClient === 1}
                disabled={payload.showClient === 0}
              />
            </div>

            {/* Barcode */}
            <div className="row d-flex align-items-center">
              <RadioInput
                inputType="checkbox"
                id={"showBarcode"}
                name={"showBarcode"}
                label={"Show BarCode No."}
                respclass={"col-md-3 col-5"}
                value={payload.showBarcode}
                onChange={handleCheckboxChange}
                checked={payload.showBarcode === 1}
              />
              <RadioInput
                inputType="checkbox"
                id={"mandatoryBarcode"}
                name={"mandatoryBarcode"}
                label={"Mandatory BarCode No."}
                respclass={"col-md-3 col-5"}
                value={payload.mandatoryBarcode}
                onChange={handleCheckboxChange}
                checked={payload.mandatoryBarcode === 1}
                disabled={payload.showBarcode === 0}
              />
            </div>

            {/* Visit */}
            <div className="row d-flex align-items-center">
              <RadioInput
                inputType="checkbox"
                id={"showVisit"}
                name={"showVisit"}
                label={"Show Visit No."}
                respclass={"col-md-3 col-5"}
                value={payload.showVisit}
                onChange={handleCheckboxChange}
                checked={payload.showVisit === 1}
              />
              <RadioInput
                inputType="checkbox"
                id={"mandatoryVisit"}
                name={"mandatoryVisit"}
                label={"Mandatory Visit No."}
                respclass={"col-md-3 col-5"}
                value={payload.mandatoryVisit}
                onChange={handleCheckboxChange}
                checked={payload.mandatoryVisit === 1}
                disabled={payload.showVisit === 0}
              />
            </div>

            {/* Test */}
            <div className="row d-flex align-items-center">
              <RadioInput
                inputType="checkbox"
                id={"showTest"}
                name={"showTest"}
                label={"Show Test"}
                respclass={"col-md-3 col-5"}
                value={payload.showTest}
                onChange={handleCheckboxChange}
                checked={payload.showTest === 1}
              />
              <RadioInput
                inputType="checkbox"
                id={"mandatoryTest"}
                name={"mandatoryTest"}
                label={"Mandatory Test"}
                respclass={"col-md-3 col-5"}
                value={payload.mandatoryTest}
                onChange={handleCheckboxChange}
                checked={payload.mandatoryTest === 1}
                disabled={payload.showTest === 0}
              />
            </div>
          </div>

          <div
            style={{ gap: "8px" }}
            className=" d-flex flex-wrap align-items-center w-100 justify-content-center gap-2"
          >
            <Button onClick={SubmitActionType} className="px-4">
              {isUpdate ? "Update" : "Save"}
            </Button>
            <Button onClick={handleRest} className="px-4">
              Clear
            </Button>
          </div>
          <hr className="my-1" />
          <div className="mt-2 table_ticket">
            <div className="d-flex align-items-end w-100 justify-content-end mb-2">
              <div
                style={{ gap: "4px" }}
                className="d-flex align-items-center justify-content-start justify-content-sm-end flex-wrap px-2"
              >
                <TableFilterDot
                  onClick={() => filterOnClick('1')}
                  color={"#c4f884"}
                  title={`Active (${statusCount('1')})`}
                  bgColor={"#ebebebbf"}
                />
                <TableFilterDot
                  onClick={() => filterOnClick("0")}
                  color={"#ffc4cc"}
                  title={`In-Active (${statusCount('0')})`}
                  bgColor={"#ebebebbf"}
                />
                <TableFilterDot
                  onClick={() => filterOnClick("all")}
                  color={"#FFFFFF"}
                  title={`Show All (${tableData?.length})`}
                  bgColor={"#ebebebbf"}
                />
              </div>

              <FilterInput
                value={filterInputValue}
                onChange={handleFilterInputChange}
                placeholder="Filter Table"
              />
            </div>
            <CustomTable
              columns={tableHeaders}
              // data={categoryData}
              data={filterTableData?.map((tdata, idx) => ({
                ...tdata,
                SrNo: idx + 1,
                rowColor: tdata?.IsActive == "1" ? "#c4f884" : "#ffc4cc",
                UpdatedByName: tdata?.UpdatedByName || "",
                ShowClient: tdata?.ShowClient === 1 ? "Yes" : "No",
                ShowBarcodeNo: tdata?.ShowBarcodeNo === 1 ? "Yes" : "No",
                ShowLabNo: tdata?.ShowLabNo === 1 ? "Yes" : "No",
                ShowTestCode: tdata?.ShowTestCode === 1 ? "Yes" : "No",
                IsActive: tdata?.IsActive === 1 ? "Active" : "In-Active",
                Edit: (
                  <div className="d-flex align-items-center gap-1">
                    <CiEdit onClick={() => onRowEdit(tdata)} color="#4549af" size={17} style={{ cursor: "pointer" }} />
                    <MdDeleteOutline color="#dc3545" size={17} style={{ cursor: "pointer" }} />
                  </div>
                ),
                // tat: (
                //   <Button
                //     onClick={() => handleTatModalOpen(true, tdata)}
                //     className="rounded py-0"
                //   >
                //     TAT
                //   </Button>
                // ),
                tagEmployee: (
                  <BsPersonPlus
                    onClick={() => redirectTagEmployeePage(tdata)}
                    color="#4549af"
                    size={17}
                    style={{ cursor: "pointer" }}
                  />
                ),
                tat: (
                  <div>
                    <p className="m-0">L-1: {tdata?.Level1Resolve}</p>
                    <p className="m-0">L-2: {tdata?.Level2Resolve}</p>
                    <p className="m-0">L-3: {tdata?.Level3Resolve}</p>
                  </div>
                ),
                showField: (
                  <div>
                    <p className="m-0">
                      {tdata?.ShowClient === 1 && "Show Client"}{" "}
                      {tdata?.MandatoryClient === 1 && (
                        <span style={{ color: "#fb0b0b" }}>*</span>
                      )}{" "}
                    </p>
                    <p className="m-0">
                      {tdata?.ShowBarcodeNo === 1 && "Show BarCode No."}{" "}
                      {tdata?.MandatoryBarcodeNo === 1 && (
                        <span style={{ color: "#fb0b0b" }}>*</span>
                      )}{" "}
                    </p>
                    <p className="m-0">
                      {tdata?.ShowLabNo === 1 && "Show Visit No."}{" "}
                      {tdata?.MandatoryLabNo === 1 && (
                        <span style={{ color: "#fb0b0b" }}>*</span>
                      )}{" "}
                    </p>
                    <p className="m-0">
                      {tdata?.ShowTestCode === 1 && "Show Test"}{" "}
                      {tdata?.MandatoryTestCode === 1 && (
                        <span style={{ color: "#fb0b0b" }}>*</span>
                      )}{" "}
                    </p>
                  </div>
                ),
              }))}
              onEdit={onRowEdit}
            />
          </div>
        </div>
      </div>

      <Modal
        Header={"Add New Category TAT"}
        setVisible={(val) => handleTatModalOpen(val)}
        visible={tatModalOpen}
        children={<EditTatModal />}
        modalWidth={"60%"}
      />

      <Modal
        Header={<div>Tag Employee at : Level {selectedLevel}</div>}
        setVisible={(val) => handleOpenModal(val)}
        visible={tagEmployeeModalToggle}
        children={<ModalTagEmployee />}
        modalWidth={"60%"}
      />

      {showMore && <TicketMenuList />}
    </>
  );
};

export default CategoryMaster;
