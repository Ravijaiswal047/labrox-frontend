import React, { useEffect, useState } from "react";
import Input from "../../components/formComponent/Input";
import Heading from "../../components/UI/Heading";
import DatePicker from "../../components/formComponent/DatePicker";
import TimePicker from "../../components/formComponent/TimePicker";
import CustomTable from "../../components/Table/CustomTable";
import { Button } from "react-bootstrap";
// import Modal from "../../components/ModalComponent/Modal";
import {
  setViewIssueModal,
  setViewIssueModalData,
} from "../../store/reducers/TicketingModuleSlice/TicketingModuleSlice";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import ViewIssueModal from "./ViewIssueModal";
import { ViewMenu } from "../../components/SvgIcons";
import TicketMenuList from "../Ticketing/TicketMenuList";
import { ExportToExcel } from "../../utils/helpers";
import { TbFileTypeXls } from "react-icons/tb";
import FilterInput from "../../components/Filter/FilterInput";
import TableFilterDot from "../Components/TableFilterDot";
import { Tooltip } from "primereact/tooltip";
import greenExcelIcon from "../../assets/image/xlsLogo.png";
import fileIcon from "../../assets/image/fileIcon.png";
import { setLoading } from "../../store/reducers/loadingSlice/loadingSlice";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { useTranslation } from "react-i18next";
import { notify } from "../../utils/utils";
import { axiosInstance } from "../../utils/axiosInstance";
import { apiUrls } from "../../utils/apiEndpoints";

import "./ManageQuery.css";
import moment from "moment";
import Modal from "../../components/ModalComponent/Modal";

const issues = [
  {
    issueNo: "210611",
    createdBy: "ROHIT (SRA)",
    updatedBy: "ROHIT (SRA)",
    updatedOn: "12-03-2025",
    subject: "No Billing No TRF",
    barcodeNo: "a6112651",
    mobileNo: "9990001111",
    visitNo: "V1001",
    client: "Apollo",
    test: "Blood Sugar",
    submitDate: "01 Aug 2025 03:18 PM",
    status: "New",
    rowColor: "#C2F4C2",
    createdOn: "08-08-2025",
    attachment: 4,
  },
  {
    issueNo: "210610",
    updatedBy: "ROHIT (SRA)",
    updatedOn: "12-03-2025",
    createdBy: "KANIKA YADAV",
    subject: "Required Volume",
    barcodeNo: "11691004",
    mobileNo: "8880002222",
    visitNo: "V1002",
    client: "Max Healthcare",
    test: "CBC",
    submitDate: "01 Aug 2025 03:16 PM",
    status: "New",
    rowColor: "#C2F4C2",
    createdOn: "08-08-2025",
    attachment: 2,
  },
  {
    issueNo: "210609",
    updatedBy: "ROHIT (SRA)",
    updatedOn: "12-03-2025",
    createdBy: "ROHIT (SRA)",
    subject: "Extra Citrate sample received",
    barcodeNo: "a6570490",
    mobileNo: "7770003333",
    visitNo: "V1003",
    client: "Fortis",
    test: "PT-INR",
    submitDate: "01 Aug 2025 03:10 PM",
    status: "New",
    rowColor: "#C2F4C2",
    createdOn: "08-08-2025",
    attachment: 1,
  },
  {
    issueNo: "210608",
    createdBy: "ASHISH SHARMA (LAB TECH-NRR)",
    subject: "Required sample",
    barcodeNo: "a5881904",
    mobileNo: "6660004444",
    visitNo: "V1004",
    createdOn: "08-08-2025",
    updatedBy: "ROHIT (SRA)",
    updatedOn: "12-03-2025",
    client: "Medanta",
    test: "D-Dimer",
    submitDate: "01 Aug 2025 03:06 PM",
    status: "New",
    rowColor: "#C2F4C2",
    attachment: 2,
  },
  {
    issueNo: "210606",
    updatedBy: "ROHIT (SRA)",
    updatedOn: "12-03-2025",
    createdBy: "KANIKA YADAV",
    subject: "Confirm age",
    barcodeNo: "A6574507",
    mobileNo: "5550005555",
    visitNo: "V1005",
    client: "AIIMS",
    test: "Thyroid",
    submitDate: "01 Aug 2025 02:01 PM",
    status: "Department Reply",
    rowColor: "#F4C2C2",
    createdOn: "08-08-2025",
    attachment: 0,
  },
  {
    issueNo: "210605",
    createdBy: "PRACHI SINGH (MICRO)",
    subject: "Nikshay ID Required",
    barcodeNo: "A6614969",
    updatedBy: "ROHIT (SRA)",
    updatedOn: "12-03-2025",
    mobileNo: "4440006666",
    visitNo: "V1006",
    client: "Columbia Asia",
    test: "Sputum AFB",
    submitDate: "01 Aug 2025 01:57 PM",
    status: "Department Reply",
    rowColor: "#F4C2C2",
    createdOn: "08-08-2025",
    attachment: 3,
  },
  {
    issueNo: "210604",
    createdBy: "PRACHI SINGH (MICRO)",
    subject: "Nikshay ID Required",
    barcodeNo: "A6546470",
    mobileNo: "3330007777",
    updatedBy: "ROHIT (SRA)",
    updatedOn: "12-03-2025",
    visitNo: "V1007",
    client: "Narayana Health",
    test: "GeneXpert",
    submitDate: "01 Aug 2025 01:52 PM",
    status: "Department Reply",
    rowColor: "#F4C2C2",
    createdOn: "08-08-2025",
    attachment: 4,
  },
  // Dummy Entries
  {
    issueNo: "210612",
    createdBy: "NEHA GUPTA (ADMIN)",
    subject: "Missing Sample Label",
    barcodeNo: "A6123001",
    mobileNo: "9876543210",
    visitNo: "V123456",
    updatedBy: "ROHIT (SRA)",
    updatedOn: "12-03-2025",
    client: "Apollo Clinic",
    test: "CBC",
    submitDate: "01 Aug 2025 03:20 PM",
    status: "New",
    rowColor: "#C2F4C2",
    createdOn: "08-08-2025",
    attachment: 4,
  },
  {
    issueNo: "210613",
    createdBy: "ARUN SHARMA (TECH)",
    createdOn: "08-08-2025",
    subject: "Label Mismatch",
    barcodeNo: "A6134002",
    mobileNo: "9123456780",
    visitNo: "V123457",
    updatedBy: "ROHIT (SRA)",
    updatedOn: "12-03-2025",
    client: "Fortis",
    test: "LFT",
    submitDate: "01 Aug 2025 03:25 PM",
    status: "Department Reply",
    rowColor: "#F4C2C2",
    attachment: 4,
  },
  {
    issueNo: "210614",
    createdOn: "08-08-2025",
    createdBy: "RITA MEHRA (QA)",
    subject: "Specimen Leaked",
    barcodeNo: "A6145003",
    mobileNo: "9988776655",
    updatedBy: "ROHIT (SRA)",
    updatedOn: "12-03-2025",
    visitNo: "V123458",
    client: "Max Healthcare",
    test: "Urine R/M",
    submitDate: "01 Aug 2025 03:28 PM",
    status: "New",
    rowColor: "#C2F4C2",
    attachment: 4,
  },
];

const ViewIssue = () => {
  const [t] = useTranslation();
  const today = new Date();
  const dispatch = useDispatch();
  const { viewIssueModal } = useSelector((data) => data.ticketing);
  const [showMore, setShowMore] = useState(false);
  const [filterTableData, setFilterTableData] = useState([]);
  const [filterInputValue, setFilterInputValue] = useState("");
  const [tableData, setTableData] = useState([]);

  const [dropdownList, setDropdownList] = useState({
    centreList: [],
    statusList: [],
  });
  const [payload, setPayload] = useState({
    issueNo: "",
    barcodeNo: "",
    status: "",
    labNo: "",
    client: "",
    toDate: new Date(),
    fromDate: new Date(),
    FromTime: new Date(today.setHours(0, 0, 0, 0)),
    ToTime: new Date(today.setHours(23, 59, 59, 999)),
  });

  const filterOptions = [
    { key: "New", count: 12, color: "#90CAF9" },
    { key: "Assign", count: 12, color: "#A5D6A7" },
    { key: "Resolved", count: 12, color: "#9575CD" },
    { key: "Reply", count: 12, color: "#CE93D8" },
    { key: "Closed", count: 12, color: "#EF9A9A" },
  ];

  console.log("payload?.FromTime", payload?.toDate);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPayload((prev) => ({ ...prev, [name]: value }));
  };

  const handleTimeChange = (value, name) => {
    setPayload((prev) => ({ ...prev, [name]: value }));
  };

  const dateSelect = (value, name) => {
    setPayload((prev) => ({ ...prev, [name]: value }));
  };

  const tableHeaders = [
    { header: "Issue No.", field: "IssueCode" },
    { header: "Status", field: "STATUS" },
    { header: "Subject", field: "Subject" },
    { header: "Barcode | Mob.| Visit No.", field: "barcodeNo" },
    { header: "Client", field: "CentreName" },
    { header: "Test", field: "TestName" },
    // { header: "Submit Date", field: "lastSubmittedDate" },
    { header: "Created By | Date", field: "createdBy" },
    { header: "Updated By | Date", field: "updatedBy" },
    { header: "Attachment", field: "attachment", width: "5%" },
  ];

  const handleModalToggle = (val, data) => {
    dispatch(setViewIssueModal(val));
    dispatch(setViewIssueModalData(data));
  };

  const handleFilterInputChange = (e) => {
    const value = e.target.value.toLowerCase();
    setFilterInputValue(value);

    // Filter rows based on search term matching any field
    const filtered = tableData.filter((row) =>
      Object.keys(row).some((key) =>
        String(row[key]).toLowerCase().includes(value)
      )
    );

    setFilterTableData(filtered);
  };

  const filterOnClick = (type) => {
    setFilterTableData(
      tableData?.filter((data) => {
        // Normalize status to lowercase for comparison
        return data?.status?.toLowerCase() === type.toLowerCase();
      })
    );
  };

  const fetchDropdownData = async () => {
    try {
      dispatch(setLoading(true));

      const [centreRes, statusRes] = await Promise.all([
        axiosInstance.get(apiUrls.BindCentre),
        axiosInstance.post(apiUrls.Fetchprocedure, {
          typeName: "ticketing_Status",
          params: [],
        }),
      ]);

      // --- centre list ---
      const centreList = Array.isArray(centreRes?.data?.message)
        ? centreRes.data.message.map((item) => ({
            label: item?.centre ?? "",
            value: String(item?.centreid ?? ""),
          }))
        : [];

      if (!Array.isArray(centreRes?.data?.message)) {
        notify(centreRes?.data?.message || "Invalid centre response", "info");
      }

      const statusList = Array.isArray(statusRes?.data?.data)
        ? statusRes.data.data.map((item) => ({
            label: item?.status ?? "",
            value: String(item?.id ?? ""),
          }))
        : [];

      if (!Array.isArray(centreRes?.data?.message)) {
        notify(centreRes?.data?.message || "Invalid centre response", "info");
      }

      setDropdownList((prev) => ({
        ...prev,
        centreList,
        statusList,
      }));
    } catch (err) {
      console.error(err);
      notify(
        err?.response?.data?.message || err?.message || "Something went wrong",
        "error"
      );
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleReactChange = (name, e) => {
    setPayload((prev) => ({ ...prev, [name]: e?.value }));
  };

  const getSearchTicket = async () => {
    const selectedStatus = dropdownList?.statusList?.find(
      (item) => item.value === payload.status
    );

    dispatch(setLoading(true));
    const searchPayload = {
      transactionType: "ViewTicketDetail",
      centreID: 0,
      employeeID: 0,
      toDate: `${moment(payload?.toDate).format("YYYY-MM-DD")}T23:59:59.000Z`,
      fromDate: `${moment(payload?.fromDate).format("YYYY-MM-DD")}T00:00:00.000Z`,
      vialId: "",
      issueCode: payload?.issueNo || "",
      regNo: "",
      pccCode: "",
      statusID: Number(selectedStatus?.value || 0),
      status: String(selectedStatus?.label || ""),
      timeFrm: "00:00:00",
      timeTo: "23:59:59",
      categoryID: Number(payload?.searchCategory || 0),
      isRead: 0,
      visitNo: payload?.labNo,
      barcode: payload?.barcodeNo,
    };

    await axiosInstance
      .post(apiUrls?.SearchDetail, searchPayload)
      .then((res) => {
        if (!Array.isArray(res?.data?.message)) {
          notify(res?.data?.message, "success");
          return;
        }
        setTableData(res?.data?.message);
        setFilterTableData(res?.data?.message);
        // handleReset();
      })
      .catch((err) => {
        console.log(err);
        notify(err?.data?.message, "error");
      });
    dispatch(setLoading(false));
  };

  const statusCount = (sType) => {
    return tableData?.filter((item) => item?.STATUS === sType)?.length;
  };

  useEffect(() => {
    getSearchTicket();
    fetchDropdownData();
  }, []);

  console.log("filterTableData", filterTableData);

  return (
    <>
      <div className="ViewIssue_main card">
        {showMore && <TicketMenuList />}
        <Heading
          title={"View Issues"}
          secondTitle={
            <label onClick={() => setShowMore((prev) => !prev)}>
              <ViewMenu />
            </label>
          }
        />
        <div className="row p-3">
          <div className="col-sm-4 col-md-2 col-8">
            <DatePicker
              className="custom-calendar"
              name="fromDate"
              id={"fromDate"}
              type="date"
              lable={"From Date"}
              value={payload?.fromDate}
              onChange={dateSelect}
              //   maxDate={new Date()}
            />
          </div>
          <div className="col-sm-2 col-md-1 col-4">
            <TimePicker
              name="FromTime"
              placeholder="FromTime"
              value={payload?.FromTime}
              id="FromTime"
              lable="FromTime"
              onChange={handleTimeChange}
            />
          </div>
          <div className="col-sm-4 col-8 col-md-2">
            <DatePicker
              className="custom-calendar"
              name="toDate"
              id={"toDate"}
              type="date"
              lable={"To Date"}
              value={payload?.toDate}
              onChange={dateSelect}
              //   maxDate={new Date()}
            />
          </div>
          <div className="col-sm-2 col-md-1 col-4">
            <TimePicker
              name="ToTime"
              placeholder="ToTime"
              value={payload?.ToTime}
              id="ToTime"
              lable="ToTime"
              onChange={handleTimeChange}
            />
          </div>
          <div className="col-sm-4 col-md-2">
            <Input
              type="text"
              name="issueNo"
              lable="Enter Issue no."
              id="issueNo"
              value={payload.issueNo}
              placeholder=" "
              onChange={handleChange}
            />
          </div>
          <div className="col-sm-4 col-md-2">
            <Input
              type="text"
              name="barcodeNo"
              lable="Enter barcode no."
              id="barcodeNo"
              value={payload.barcodeNo}
              placeholder=" "
              onChange={handleChange}
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
          <div className="col-sm-4 col-md-2">
            <Input
              type="text"
              name="labNo"
              lable="Lab No."
              id="labNo"
              value={payload.labNo}
              placeholder=" "
              onChange={handleChange}
            />
          </div>
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
          <div
            style={{ gap: "6px" }}
            className="d-flex justify-content-between align-items-center flex-wrap flex-grow-1"
          >
            <div
              style={{ gap: "4px" }}
              className="d-flex align-items-center justify-content-center flex-wrap"
            >
              {/* <Button className="px-4" onClick={() => handleModalToggle(true)}> */}
              <Button className="px-4" onClick={() => getSearchTicket()}>
                Search
              </Button>
              <Button className="px-4">Detail Report</Button>
              <Button className="px-4">Detailed Report with Remarks</Button>
            </div>
            <div
              style={{ gap: "4px" }}
              className="d-flex align-items-end  justify-content-end"
            >
              <div style={{ gap: "4px" }} className="excel_exp d-flex">
                <div className="mx-2">
                  <Tooltip position="top" target=".excel-icon" />
                  <img
                    onClick={() => ExportToExcel(issues)}
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
        </div>
        <div className="view_issue_table">
          {/* <div
            style={{ gap: "4px" }}
            className="d-flex justify-content-end px-2"
          >
            <TableFilterDot
              onClick={() => filhandleFilterInputChangeterOnClick("new")}
              color={"#c2f4c2"}
              title={`New (10)`}
              bgColor={"#ebebebbf"}
            />
            <TableFilterDot
              onClick={() => handleFilterInputChange("department reply")}
              color={"#f4c2c2"}
              title={"Department Reply (12)"}
              bgColor={"#ebebebbf"}
            />
          </div> */}

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
            data={filterTableData?.map((data, idx) => ({
              ...data,
              // IssueCode: <Button className="rounded">{String(data?.IssueCode)}</Button>,
              TestName: data?.TestName || '-',
              CentreName: data?.CentreName || '-',
              barcodeNo: (
                <div>
                  <p>B: {data?.BarcodeNo || "NA"}</p>
                  <p>M: {data?.Mobile || "N/A"}</p>
                  <p>V: {data?.RegNo || "NA"}</p>
                </div>
              ),
              updatedBy: (
                <div>
                  <p>{data?.UpdatedByName || "N/A"}</p>
                  <p>{data?.dtUpdate || "N/A"}</p>
                </div>
              ),
              createdBy: (
                <div>
                  <p>{data?.EmpName || "N/A"}</p>
                  <p>{data?.dtAdd || "N/A"}</p>
                </div>
              ),
              IssueCode: (
                <Button
                  className="rounded"
                  onClick={() => handleModalToggle(true, data)}
                >
                  {data?.IssueCode}
                </Button>
              ),
              attachment: (
                <div className="d-flex align-items-center">
                  <img width={16} height={16} src={fileIcon} alt="fileIcon" />
                  <span className="mx-1">({data?.Filename || 0})</span>
                </div>
              ),
            }))}
            //   onEdit={onRowEdit}
          />
        </div>
      </div>
      <div className="modal_wrapper">
        <Modal
          Header={"View Support Ticket # PIM210618"}
          setVisible={(val) => handleModalToggle(val, "x")}
          visible={viewIssueModal}
          children={<ViewIssueModal />}
          modalWidth={"70%"}
        />
      </div>
    </>
  );
};

export default ViewIssue;
