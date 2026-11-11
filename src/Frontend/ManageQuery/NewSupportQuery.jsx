import React, { useEffect, useRef, useState } from "react";
import Heading from "../../components/UI/Heading";
import ReactSelect from "../../components/formComponent/ReactSelect";
import Input from "../../components/formComponent/Input";
import TextAreaInput from "../../components/formComponent/TextAreaInput";
import { Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import DatePicker from "../../components/formComponent/DatePicker";
import CustomTable from "../../components/Table/CustomTable";
import { ViewMenu } from "../../components/SvgIcons";
import TicketMenuList from "../Ticketing/TicketMenuList";
import { TbFileTypeXls } from "react-icons/tb";
import { ExportToExcel } from "../../utils/helpers";
import FilterInput from "../../components/Filter/FilterInput";
import UploadFile from "../utils/UploadFileModal/UploadFile";
import greenExcelIcon from "../../assets/image/xlsLogo.png";
import TableFilterDot from "../Components/TableFilterDot";
import fileIcon from "../../assets/image/fileIcon.png";
import { setLoading } from "../../store/reducers/loadingSlice/loadingSlice";
import { removeFile, clearFiles } from "../../store/reducers/fileUploadSlice/fileUploadSlice";
import { axiosInstance } from "../../utils/axiosInstance";
import { apiUrls } from "../../utils/apiEndpoints";
import { useLocation } from "react-router-dom";
import { Tooltip } from "primereact/tooltip";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { notify } from "../../utils/utils";
import FileUpload from "./FileUpload";
import moment from "moment";
import "./ManageQuery.css";

const tableDataWithColors = [
  {
    sNo: 1,
    issueNo: "ISSUE-1001",
    categoryName: "IT Support",
    subject: "Printer not working",
    emailId: "john.doe@example.com",
    raisedDate: "2025-07-28",
    raisedBy: "John Doe",
    status: "New",
    isRead: "No",
    rowColor: "",
    attachment: 2,
  },
  {
    sNo: 2,
    issueNo: "ISSUE-1002",
    categoryName: "Software",
    subject: "Unable to login to system",
    emailId: "jane.smith@example.com",
    raisedDate: "2025-07-27",
    raisedBy: "Jane Smith",
    status: "Initial Reply",
    isRead: "Yes",
    attachment: 2,
  },
  {
    sNo: 3,
    issueNo: "ISSUE-1003",
    categoryName: "Networking",
    subject: "Internet is down",
    emailId: "amit.kumar@example.com",
    raisedDate: "2025-07-26",
    raisedBy: "Amit Kumar",
    status: "Assign",
    isRead: "No",
    attachment: 2,
  },
  {
    sNo: 4,
    issueNo: "ISSUE-1004",
    categoryName: "Hardware",
    subject: "System overheating",
    emailId: "sara.lee@example.com",
    raisedDate: "2025-07-25",
    raisedBy: "Sara Lee",
    status: "Resolved",
    isRead: "Yes",
    attachment: 2,
  },
  {
    sNo: 5,
    issueNo: "ISSUE-1005",
    categoryName: "Lab Equipment",
    subject: "Microscope calibration needed",
    emailId: "david.rao@example.com",
    raisedDate: "2025-07-24",
    raisedBy: "David Rao",
    status: "Reply",
    isRead: "No",
    attachment: 2,
  },
  {
    sNo: 5,
    issueNo: "ISSUE-1005",
    categoryName: "Lab Equipment",
    subject: "Microscope calibration needed",
    emailId: "david.rao@example.com",
    raisedDate: "2025-07-24",
    raisedBy: "David Rao",
    status: "Closed",
    isRead: "No",
    attachment: 2,
  },
];

const statusColors = {
  New: "#90CAF9",
  "Initial Reply": "#rgb(215 205 119)",
  Assign: "#A5D6A7",
  Resolved: "#9575CD",
  Reply: "#CE93D8",
  Closed: "#EF9A9A",
};

const tableData = tableDataWithColors.map((item) => ({
  ...item,
  rowColor: statusColors[item.status] || "",
}));

console.log(tableDataWithColors);

const NewSupportQuery = () => {
  const fileRef = useRef();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { files } = useSelector((state) => state.fileUploadSlice);
  const { modalData } = useSelector((data) => data.ticketing);
  console.log('uploadedFiles::',files);
  const [show, setShow] = useState(false);
  const [tableData, setTable] = useState([]);
  const [showMore, setShowMore] = useState(false);
  const [filterInputValue, setFilterInputValue] = useState("");
  const [filterTableData, setFilterTableData] = useState([]);
  const initialPayload = {
    category: "",
    query: "",
    subject: "",
    email: "",
    mobileNo: "",
    detail: "",
    client: "",
    barcode: "",
    visitNo: "",
    test: "",
    ToDate: new Date(),
    FromDate: new Date(),
    status: "",
    isRead: "",
    AddAttachment: {},
    priority: "",
    searchCategory: "",
    searchStatus: "",
  };
  const [payload, setPayload] = useState(initialPayload);
  const [dropdownList, setDropdownList] = useState({
    categoryList: [],
    priorityList: [],
    centreList: [],
    queryList: [],
    investigationList: [],
    searchList: [],
    statusList: [],
  });

  const tableHeaders = [
    { header: t("S.No."), field: "sNo", width: "5%" },
    { header: t("Issue No."), field: "IssueCode" },
    { header: t("Category Name"), field: "CategoryName" },
    { header: t("Subject"), field: "Subject" },
    { header: t("EmailID"), field: "Email" },
    { header: t("Raised Date"), field: "dtAdd" },
    { header: t("Raised By"), field: "CreatedByName" },
    { header: t("Status"), field: "Status" },
    { header: t("IsRead"), field: "IsRead" },
    { header: t("Attachment"), field: "attachment", width: "5%" },
  ];

  const filterOptions = [
    { key: "New", count: 12, color: "#90CAF9" },
    { key: "Assign", count: 12, color: "#A5D6A7" },
    { key: "Resolved", count: 12, color: "#9575CD" },
    { key: "Reply", count: 12, color: "#CE93D8" },
    { key: "Closed", count: 12, color: "#EF9A9A" },
  ];

  // console.log("location", modalData);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPayload((prev) => ({ ...prev, [name]: value }));
  };

  const handleReactChange = (name, e) => {
    setPayload((prev) => ({ ...prev, [name]: e?.value }));
  };

  const fetchAllDropdownData = async () => {
    try {
      dispatch(setLoading(true));

      const [
        categoryRes,
        priorityRes,
        queryRes,
        centreRes,
        investigationTestRes,
        statusRes,
      ] = await Promise.all([
        axiosInstance.post(apiUrls.GetDataMaster, {
          Type: "Category",
          categoryId: 0,
          queryID: 0,
          responseID: 0,
          priorityID: 0,
          ticketID: 0,
        }),
        axiosInstance.post(apiUrls.Fetchprocedure, {
          typeName: "ticketing_priority",
          params: ["0"],
        }),
        axiosInstance.post(apiUrls.GetDataMaster, {
          Type: "QueryListTable",
          categoryId: 0,
          queryID: 0,
          responseID: 0,
          priorityID: 0,
          ticketID: 0,
        }),
        axiosInstance.get(apiUrls.BindCentre),
        axiosInstance.get(apiUrls.BindInvestigationList),
        axiosInstance.post(apiUrls.Fetchprocedure, {
          typeName: "ticketing_Status",
          params: [],
        }),
      ]);

      // --- category ---
      const categoryList = Array.isArray(categoryRes?.data?.message)
        ? categoryRes.data.message.map((item) => ({
            ...item,
            label: item?.CategoryName ?? "",
            value: String(item?.ID ?? ""),
          }))
        : [];

      // --- priority ---
      const priorityList = Array.isArray(priorityRes?.data?.data)
        ? priorityRes.data.data.map((item) => ({
            label: item?.Priority ?? "",
            value: String(item?.ID ?? ""),
          }))
        : [];

      // --- query list ---
      const queryList = Array.isArray(queryRes?.data?.message)
        ? queryRes.data.message.map((item) => ({
            ...item,
            label: item?.SUBJECT ?? "",
            value: String(item?.Id ?? ""),
          }))
        : [];

      if (!Array.isArray(queryRes?.data?.message)) {
        notify(queryRes?.data?.message || "Invalid query response", "info");
      }

      // --- centre list ---
      const centreList = Array.isArray(centreRes?.data?.message)
        ? centreRes.data.message.map((item) => ({
            label: item?.centre ?? "",
            value: String(item?.centreid ?? ""),
          }))
        : [];

      // --- status list ---
      const statusList = Array.isArray(statusRes?.data?.data)
        ? statusRes.data.data.map((item) => ({
            label: item?.status ?? "",
            value: String(item?.id ?? ""),
          }))
        : [];

      if (!Array.isArray(centreRes?.data?.message)) {
        notify(centreRes?.data?.message || "Invalid centre response", "info");
      }

      // --- investigation list ---
      const investigationList = Array.isArray(
        investigationTestRes?.data?.message
      )
        ? investigationTestRes.data.message.map((item) => ({
            ...item,
            label: item?.TestName ?? "",
            value: String(item?.InvestigationID ?? ""),
          }))
        : [];

      if (!Array.isArray(investigationTestRes?.data?.message)) {
        notify(
          investigationTestRes?.data?.message ||
            "Invalid investigation response",
          "info"
        );
      }

      // --- update all dropdowns at once ---
      setDropdownList((prev) => ({
        ...prev,
        categoryList,
        priorityList,
        queryList,
        centreList,
        investigationList,
        statusList,
      }));
    } catch (err) {
      console.error(err);
      notify(err?.response?.data?.message || err?.message || "Something went wrong", "error");
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    setFilterTableData(tableData);
    fetchAllDropdownData();
  }, []);

  const handleReset = () => {
    setPayload(initialPayload);
    dispatch(clearFiles());
  };

  const validatePayload = (payload, dropdownList) => {
    const errors = [];
    if (!payload?.category) {
      errors.push("Category is required");
      return errors;
    } else {
      const categoryLabel = dropdownList?.categoryList.find(
        (data) => data.value == payload.category
      );
      if (!categoryLabel) {
        errors.push("Invalid category selected");
        return errors;
      }
    }
    if (!payload?.query) {
      errors.push("Query is required");
      return errors;
    }

    if (!payload?.subject || payload?.subject.trim() === "") {
      errors.push("Subject is required");
      return errors;
    }

    if (!payload?.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload?.email)) {
      errors.push("Valid email is required");
      return errors;
    }

    if (!payload?.mobileNo || !/^\d{10}$/.test(payload?.mobileNo)) {
      errors.push("Valid 10-digit mobile number is required");
      return errors;
    }
    if (!payload?.client && selectedCategory?.MandatoryClient) {
      errors.push("Centre is required");
      return errors;
    }
    if (!payload?.barcode && selectedCategory?.MandatoryBarcodeNo) {
      errors.push("Barcode is required");
      return errors;
    }
    if (!payload?.visitNo && selectedCategory?.MandatoryLabNo) {
      errors.push("Test is required");
      return errors;
    }
    if (!payload?.test && selectedCategory?.MandatoryTestCode) {
      errors.push("Test is required");
      return errors;
    }
    if (!payload?.priority) {
      errors.push("Priority is required");
      return errors;
    }
    if (!payload?.detail || payload?.detail.trim() === "") {
      errors.push("Description is required");
      return errors;
    }
    if (!(payload?.AddAttachment?.length > 0)) {
      errors.push("Some attachments are missing file data");
      return errors;
    }
    return errors;
  };

  const handleSubmit = async () => {
    const errors = validatePayload(payload, dropdownList);
    if (errors.length > 0) {
      errors.forEach((err) => notify(err, "error"));
      return; // stop execution
    }

    const categoryLabel = dropdownList?.categoryList.find(
      (data) => data.value == payload.category
    );
    const selectedCentre = dropdownList?.centreList?.find(
      (item) => item.value === payload?.client
    );
    const selectedTest = dropdownList?.investigationList?.find(
      (item) => item.value === payload?.test
    );
    const selectedPriority = dropdownList?.priorityList?.find(
      (item) => item.value === payload?.priority
    );
    const selectedQuery = dropdownList?.queryList?.find(
      (item) => item.value === payload?.query
    );

    const selectedStatus = dropdownList?.statusList?.find(
      (item) => item.value === payload.status
    );

    const apiPayload = {
      categoryID: Number(payload?.category),
      category: categoryLabel?.label,
      queryID: Number(selectedQuery?.value),
      query: selectedQuery?.label || "",
      subject: payload?.subject,
      email: payload?.email,
      mobile: payload?.mobileNo,
      rateTypeID: Number(selectedCentre?.value),
      rateType: selectedCentre?.label,
      centreID: 0,
      centre: "",
      roleID: 0,
      role: "",
      barcodeNo: payload?.barcode,
      ledgerTransactionNo: payload.visitNo || "",
      itemID: Number(selectedTest?.value || 0),
      itemName: selectedTest?.label || "",
      priorityID: Number(selectedPriority?.value || 0),
      priority: selectedPriority?.label || "",
      statusID: Number(selectedStatus?.value),
      status: selectedStatus?.label || "",
      description: payload?.detail || "",
      documentData: payload?.AddAttachment || [],
    };
    dispatch(setLoading(true));
    await axiosInstance
      .post(apiUrls?.SaveTicket, apiPayload)
      .then((res) => {
        notify(res?.data?.message, "success");
        getSearchTicket();
        handleReset();
      })
      .catch((err) => {
        console.log(err);
        notify(err?.data?.message, "error");
      });
    dispatch(setLoading(false));
  };

  const dateSelect = (value, name) => {
    console.log("value, name", value, name);
    setPayload({ ...payload, [name]: value });
  };

  const selectedCategory = dropdownList?.categoryList?.find(
    (item) => item?.ID === Number(payload?.category)
  );

  const handleFilterInputChange = (e) => {
    let value = null;
    if (typeof e === "string") {
      value = e?.toLowerCase();
    } else {
      value = e.target.value.toLowerCase();
    }
    setFilterInputValue(value);
    // Filter rows based on search term matching any field
    const filtered = tableData.filter((row) =>
      Object.keys(row).some((key) =>
        String(row[key]).toLowerCase().includes(value)
      )
    );

    setFilterTableData(filtered);
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]); // strip "data:*/*;base64,"
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileResponse = async (files) => {
    console.log('handleFileResponse',files);
    if (!files || files.length === 0) {
      console.log("File cleared");
      return;
    }

    const fileArray = Array.isArray(files) ? files : [files];
    const documentData = await Promise.all(
      fileArray.map(async (file) => ({
        fileName: file.name,
        fileBase64: await fileToBase64(file),
      }))
    );
    setPayload((prev) => ({ ...prev, AddAttachment: documentData }));
  };

  const getSearchTicket = async () => {
    const selectedStatus = dropdownList?.statusList?.find(
      (item) => item.value === payload.searchStatus
    );

    // return
    dispatch(setLoading(true));
    const searchPayload = {
      transactionType: "Ticketdetail",
      centreID: 0,
      employeeID: 0,
      toDate: `${moment(payload?.ToDate).format("YYYY-MM-DD")}T23:59:59.000Z`,
      fromDate: `${moment(payload?.FromDate).format("YYYY-MM-DD")}T00:00:00.000Z`,
      vialId: "",
      issueCode: "",
      regNo: "",
      pccCode: "",
      statusID: Number(selectedStatus?.value || 0),
      status: String(selectedStatus?.label || 0),
      timeFrm: "00:00",
      timeTo: "23:59",
      categoryID: Number(payload?.searchCategory || 0),
      isRead: Number(payload?.isRead),
    };

    console.log("searchPayload", searchPayload);

    await axiosInstance
      .post(apiUrls?.SearchDetail, searchPayload)
      .then((res) => {
        if (!Array.isArray(res?.data?.message)) {
          notify(res?.data?.message, "success");
          return;
        }
        setTable(res?.data?.message);
        setFilterTableData(res?.data?.message);
        // handleReset();
      })
      .catch((err) => {
        console.log(err);
        notify(err?.data?.message, "error");
      });
    dispatch(setLoading(false));
  };

  console.log("modalData::", modalData);

  const statusCount = (sType)=>{
    return tableData?.filter(item=>item?.Status === sType)?.length
  }

  useEffect(() => {
    getSearchTicket()
  }, []);

  return (
    <>
      <div className="card pb-2">
        {showMore && <TicketMenuList />}

        <Heading
          title={t("Submit New Issue")}
          secondTitle={
            <label onClick={() => setShowMore((prev) => !prev)}>
              <ViewMenu />
            </label>
          }
        />
        <div className="newTicket_main p-3 mb-2">
          <div className="row gy-2">
            <div className="col-md-2 col-sm-3 col-12">
              <ReactSelect
                dynamicOptions={dropdownList.categoryList}
                isShowBorder={true}
                name="category"
                lable={t("Category")}
                placeholderName={t("Category")}
                value={payload.category}
                onChange={handleReactChange}
              />
            </div>

            <div className="col-md-2 col-sm-3 col-12">
              <ReactSelect
                dynamicOptions={dropdownList?.queryList}
                isShowBorder={true}
                name="query"
                lable={t("Query")}
                placeholderName={t("Query")}
                value={payload.query}
                onChange={handleReactChange}
              />
            </div>

            <div className="col-md-2 col-sm-3 col-12">
              <Input
                name="subject"
                lable={t("Subject")}
                value={payload.subject}
                onChange={handleChange}
                required={true}
              />
            </div>

            <div className="col-md-2 col-sm-3 col-12">
              <Input
                name="email"
                lable={t("Email")}
                value={payload.email}
                onChange={handleChange}
                required={true}
              />
            </div>

            <div className="col-md-2 col-sm-3 col-12">
              <Input
                name="mobileNo"
                lable={t("MobileNo")}
                value={payload.mobileNo}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-2 col-sm-3 col-12">
              <TextAreaInput
                name="detail"
                lable={t("Detail")}
                placeholder={t("detail")}
                value={payload.detail}
                onChange={handleChange}
                rows={2}
              />
            </div>

            {selectedCategory?.ShowClient === 1 && (
              <div className="col-md-2 col-sm-3 col-12">
                <ReactSelect
                  dynamicOptions={dropdownList?.centreList}
                  isShowBorder={true}
                  name="client"
                  lable={t("Client")}
                  placeholderName={t("Client")}
                  value={payload.client}
                  onChange={handleReactChange}
                />
              </div>
            )}

            {selectedCategory?.ShowBarcodeNo === 1 && (
              <div className="col-md-2 col-sm-3 col-12">
                <Input
                  name="barcode"
                  lable={t("Barcode")}
                  value={payload.barcode}
                  onChange={handleChange}
                  required={true}
                />
              </div>
            )}

            {selectedCategory?.ShowLabNo === 1 && (
              <div className="col-md-2 col-sm-3 col-12">
                <Input
                  name="visitNo"
                  lable={t("VisitNo")}
                  value={payload.visitNo}
                  onChange={handleChange}
                />
              </div>
            )}

            {selectedCategory?.ShowTestCode === 1 && (
              <div className="col-md-2 col-sm-3 col-12">
                <ReactSelect
                  dynamicOptions={dropdownList?.investigationList}
                  name="test"
                  lable={t("Test")}
                  isShowBorder={true}
                  placeholderName={t("Test")}
                  value={payload.test}
                  onChange={handleReactChange}
                />
              </div>
            )}

            <div className="col-md-2 col-sm-3 col-12">
              <ReactSelect
                dynamicOptions={dropdownList?.priorityList}
                name="priority"
                isShowBorder={true}
                placeholderName={t("Priority")}
                value={payload.priority}
                onChange={handleReactChange}
              />
            </div>
            <div className="col-md-2 col-sm-4">
              <ReactSelect
                dynamicOptions={dropdownList?.statusList}
                name="status"
                lable={t("Status")}
                placeholderName={t("Status")}
                value={payload.status}
                onChange={handleReactChange}
              />
            </div>
            <div className="c">
              <FileUpload
                allowedTypes={[""]} // or "*" for all
                uploadSize="multiple" // "single" | "multiple"
                onFileSelect={handleFileResponse}
                directFileUpload={modalData}
              />
            </div>
            <div style={{ gap: "4px" }} className="d-flex gap-2 px-2">
              <Button onClick={handleSubmit}>{t("Submit")}</Button>
            </div>
          </div>
        </div>
        <Heading title={t("Search Your Old Issue")} />
        <div className="row py-2 mt-1 px-3">
          <div className="col-sm-4 col-md-2">
            <DatePicker
              name="FromDate"
              value={payload?.FromDate}
              onChange={dateSelect}
              className="custom-calendar"
              placeholder=" "
              id="FromDate"
              lable="From Date"
              //   maxDate={new Date()}
              //   minDate={new Date(payload.FromDate)}
            />
          </div>
          <div className="col-sm-4 col-md-2">
            <DatePicker
              name="ToDate"
              value={payload?.ToDate}
              onChange={dateSelect}
              className="custom-calendar"
              placeholder=" "
              id="ToDate"
              lable="To Date"
              maxDate={new Date()}
              minDate={new Date(payload.FromDate)}
            />
          </div>
          <div className="col-md-2 col-sm-4">
            <ReactSelect
              dynamicOptions={dropdownList?.categoryList}
              name="searchCategory"
              lable={t("Category")}
              placeholderName={t("Category")}
              value={payload.searchCategory}
              onChange={handleReactChange}
            />
          </div>
          <div className="col-md-2 col-sm-4">
            <ReactSelect
              dynamicOptions={dropdownList?.statusList}
              name="searchStatus"
              id={"searchStatus"}
              isShowBorder={true}
              lable={t("Status")}
              placeholderName={t("Status")}
              value={payload.searchStatus}
              onChange={handleReactChange}
            />
          </div>
          <div className="col-md-2 col-sm-4">
            <ReactSelect
              dynamicOptions={[
                { label: "No", value: "0" },
                { label: "Yes", value: "1" },
              ]}
              name="isRead"
              lable={t("isRead")}
              placeholderName={t("isRead")}
              value={payload?.isRead}
              onChange={handleReactChange}
            />
          </div>
          <div className="d-flex gap-2">
            <Button className="px-4" onClick={getSearchTicket}>
              {t("Search")}
            </Button>
          </div>
          <div
            style={{ gap: "4px" }}
            className="d-flex align-items-end  flex-grow-1 justify-content-end mb-2 px-2"
          >
            <div style={{ gap: "4px" }} className="excel_exp d-flex">
              {/* <h1>Export </h1> */}
              {/* <div>
                <TbFileTypeXls
                  onClick={() => ExportToExcel(tableData)}
                  color="rgb(26 98 13)"
                />
              </div> */}
              <div>
                <Tooltip position="top" target=".excel-icon" />
                <img
                  onClick={() => ExportToExcel(tableData)}
                  src={greenExcelIcon}
                  alt="Export to Excel"
                  className="excel-icon"
                  data-pr-tooltip="Export Active Data"
                  style={{ width: "22px", height: "22px", cursor: "pointer" }}
                />
              </div>
            </div>
            <FilterInput
              value={filterInputValue}
              onChange={handleFilterInputChange}
              placeholder="Filter Table"
            />
          </div>
        </div>
        <div className="mt-1 table_ticketx">
          <div
            style={{ gap: "4px" }}
            className="d-flex align-items-center justify-content-start justify-content-sm-end flex-wrap px-2"
          >
            {filterOptions.map(({ key, count, color }) => (
              <TableFilterDot
                key={key}
                onClick={() => handleFilterInputChange(key)}
                color={color}
                title={`${key} (${statusCount(key)})`}
                bgColor="#ebebebbf"
              />
            ))}
          </div>

          <CustomTable
            columns={tableHeaders}
            data={filterTableData?.map((tRow, idx) => ({
              ...tRow,
              sNo: idx + 1,
              rowColor: tRow?.statusColors,
              attachment: (
                <div className="d-flex align-items-center">
                  <img width={16} height={16} src={fileIcon} alt="fileIcon" />
                  <span className="mx-1">({tRow?.attachment || 0})</span>
                </div>
              ),
            }))}
            //   onEdit={onRowEdit}
          />
        </div>
      </div>
    </>
  );
};

export default NewSupportQuery;
