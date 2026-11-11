import React, { useEffect, useState } from "react";
import "./ManageQuery.css";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { useTranslation } from "react-i18next";
import Heading from "../../components/UI/Heading";
import Input from "../../components/formComponent/Input";
import TextAreaInput from "../../components/formComponent/TextAreaInput";
import { Button } from "react-bootstrap";
import CustomTable from "../../components/Table/CustomTable";
import Modal from "../../components/ModalComponent/Modal";
import { setQueryRemoveModalOpen } from "../../store/reducers/TicketingModuleSlice/TicketingModuleSlice";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { ViewMenu } from "../../components/SvgIcons";
import TicketMenuList from "../Ticketing/TicketMenuList";
import { CiEdit } from "react-icons/ci";
import { MdDeleteOutline } from "react-icons/md";
import { ExportToExcel } from "../../utils/helpers";
import { TbFileTypeXls } from "react-icons/tb";
import FilterInput from "../../components/Filter/FilterInput";
import greenExcelIcon from "../../assets/image/xlsLogo.png";
import redExcelIcon from "../../assets/image/redExcel.png";
import { Tooltip } from "primereact/tooltip";
import { apiUrls } from "../../utils/apiEndpoints";
import { axiosInstance } from "../../utils/axiosInstance";
import { setLoading } from "../../store/reducers/loadingSlice/loadingSlice";
import { notify } from "../../utils/utils";

const categoryList = [
  { label: "Select", value: "0" },
  { label: "ESIC CHGS ECHS Department", value: "1" },
  { label: "ESIC CHGS ECHS Department", value: "2" },
  { label: "IT Support", value: "3" },
  { label: "IT Support - Software", value: "4" },
  { label: "Laboratory Accession department", value: "5" },
  { label: "Laboratory Biochemistry department", value: "6" },
  { label: "Laboratory Clinical Pathology department", value: "7" },
  { label: "Laboratory customer care", value: "8" },
  { label: "Laboratory Cytogenetic department", value: "9" },
  { label: "Laboratory Hematology department", value: "10" },
  { label: "Laboratory Histopathology", value: "11" },
  { label: "Laboratory Hormones department", value: "12" },
  { label: "Laboratory IT", value: "13" },
  { label: "Laboratory Jammu", value: "14" },
  { label: "Laboratory Micro department", value: "15" },
  { label: "Laboratory Molecular department", value: "16" },
  { label: "Laboratory New Born Screening", value: "17" },
  { label: "Laboratory Outsource department", value: "18" },
  { label: "Laboratory Serology department", value: "19" },
  { label: "Laboratory Srinagar", value: "20" },
  { label: "Nikshay ID Required", value: "21" },
];

const ManageResponse = () => {
  const { queryRemoveModalOpen } = useSelector((data) => data.ticketing);
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [showMore, setShowMore] = useState(false);
  const [filterInputValue, setFilterInputValue] = useState("");
  const [filterTableData, setFilterTableData] = useState([]);
  const [tableData, setTableData] = useState([]);
  // setTableData([]);
  //           setFilterTableData([]);
  const [isUpdate, setIsUpdate] = useState(false);
  const initialState = {
    category: "",
    query: "",
    detail: "",
  };
  const [payload, setPayload] = useState(initialState);
  const [selectedRow, setSelectedRow] = useState({});

  const handleReactChange = (name, e) => {
    setPayload((prev) => ({ ...prev, [name]: e.value }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPayload((prev) => ({ ...prev, [name]: value }));
  };

  const tableHeaders = [
    { header: "S.No", field: "sNo", width: "3%" },
    { header: "Response", field: "SUBJECT" },
    { header: "Create By", field: "CreatedByName" },
    { header: "Create On", field: "dtEntry" },
    { header: "Last UpdatedBy", field: "UpdatedByName" },
    { header: "Last UpdatedOn", field: "dtUpdate" },
    { header: "Action", field: "action", width: "10%" },
  ];

  const tableDataxx = [
    {
      sNo: 1,
      response:
        "Category used for Call centre issues, Reporting issues, bill edits/cancel",
      createBy: "James Thomas",
      createOn: "2025-08-06",
      LastUpdatedBy: "Charlotte Lee",
      LastUpdatedOn: "2025-08-10",
    },
    {
      sNo: 2,
      response:
        "Category used for general queries such as email ID & LIS ID creation etc.",
      createBy: "James Thomas",
      createOn: "2025-08-06",
      LastUpdatedBy: "Charlotte Lee",
      LastUpdatedOn: "2025-08-10",
    },
    {
      sNo: 3,
      response:
        "Category used for Hardware not working, PC Slow, new hardware requirements (subject to approval)",
      createBy: "James Thomas",
      createOn: "2025-08-06",
      LastUpdatedBy: "Charlotte Lee",
      LastUpdatedOn: "2025-08-10",
    },
    {
      sNo: 4,
      response: "Category used for all modifications related to LIS",
      createBy: "James Thomas",
      createOn: "2025-08-06",
      LastUpdatedBy: "Charlotte Lee",
      LastUpdatedOn: "2025-08-10",
    },
    {
      sNo: 5,
      response: "Category used for networking related problems.",
      createBy: "James Thomas",
      createOn: "2025-08-06",
      LastUpdatedBy: "Charlotte Lee",
      LastUpdatedOn: "2025-08-10",
    },
    {
      sNo: 6,
      response: "Testing Purpose",
      createBy: "James Thomas",
      createOn: "2025-08-06",
      LastUpdatedBy: "Charlotte Lee",
      LastUpdatedOn: "2025-08-10",
    },
  ];

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

  const saveQuery = async (type, idforDelete = null) => {
    if (!payload?.query && type != "Delete") {
      notify("Detail id is required", "error");
      return;
    }

    const saveQueryPayload = {
      transactionType: type, // 1. Intert , 2. Update
      type: "Response", // Enter Type 1. Query for Save, 2. Response type for response
      id: idforDelete || (isUpdate ? payload?.id : 0), // 1. 0 in-case of insert , 2. id send in-case of update
      categoryID: Number(payload?.category),
      subject: payload?.query,
      detail: payload?.detail,
      mainHead: "",
    };
    dispatch(setLoading(true));
    await axiosInstance
      .post(apiUrls?.SaveQuery, saveQueryPayload)
      .then((res) => {
        notify(res?.data?.message, "success");
        handleReset();
        getQueryResponse();
      })
      .catch((err) => {
        console.log(err);
        notify(err?.data?.message, "error");
      });
    dispatch(setLoading(false));
  };

  const getQueryResponse = async () => {
    const apiPayload = {
      type: "ResponseList",
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

  const handleReset = () => {
    setPayload(initialState);
    setIsUpdate(false);
  };

  const onRowEdit = (rowData) => {
    console.log("rowData", rowData);
    setPayload((prev) => ({
      ...prev,
      category: String(rowData?.CategoryID),
      query: rowData?.SUBJECT,
      detail: rowData?.Detail,
      id: rowData?.Id,
    }));
    setIsUpdate(true);
  };

  const handleTatModalOpen = (val, data) => {
    setSelectedRow(data);
    dispatch(setQueryRemoveModalOpen(val));
  };

  const onRowDelete = (rowData, type) => {
    saveQuery("Delete", rowData?.Id);
  };

  useEffect(() => {
    // setFilterTableData(tableData);
    getQueryResponse();
  }, []);

  // const TooltipCustom = ({ id, children, title }) => (
  //   <OverlayTrigger
  //     placement="top"
  //     overlay={<Tooltip id={id}>{title}</Tooltip>}
  //   >
  //     <span style={{ display: "inline-block", cursor: "pointer" }}>
  //       {children}
  //     </span>
  //   </OverlayTrigger>
  // );

  const RemoveQuery = () => {
    return (
      <>
        <div className="remove_query_main">
          <h1>Confirmation !</h1>
          <h2>Do you want to remove?</h2>
          <p>
            <strong>Response : </strong>
            <span>{selectedRow?.response}</span>
          </p>
        </div>
        <div style={{ gap: "6px" }} className="d-flex justify-content-end">
          <Button className="rounded">Yes</Button>
          <Button
            className="rounded"
            onClick={() => handleTatModalOpen(false, {})}
          >
            No
          </Button>
        </div>
      </>
    );
  };

  return (
    <>
      {showMore && <TicketMenuList />}

      <Heading
        title={"Manage Response"}
        secondTitle={
          <label onClick={() => setShowMore((prev) => !prev)}>
            <ViewMenu />
          </label>
        }
      />
      <div className="card px-2 py-2">
        <div className="row query_main">
          <div className="col-sm-3 col-md-3">
            <Input
              type="text"
              name="query"
              lable="Enter Response"
              id="query"
              value={payload.query}
              placeholder=" "
              onChange={handleChange}
            />
          </div>
          <div style={{ gap: "4px" }} className="d-flex flex-wrap">
            <Button
              onClick={() => saveQuery(!isUpdate ? "Insert" : "Updated")}
              className="px-5 py-1 fs-4"
            >
              {!isUpdate ? "Save" : "Updated"}
            </Button>
            <Button onClick={handleReset} className="px-5 py-1 fs-4">
              Clear
            </Button>
          </div>
        </div>
        <div className="mt-2 table_ticket">
          <div
            style={{ gap: "4px" }}
            className="d-flex align-items-end w-100 justify-content-end mb-2"
          >
            <div style={{ gap: "4px" }} className="excel_exp d-flex">
              {/* <h1>Export </h1> */}
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
              <div>
                <Tooltip position="top" target=".excel-icons" />
                <img
                  onClick={() => ExportToExcel(tableData)}
                  src={redExcelIcon}
                  alt="Export to Excel"
                  className="excel-icons"
                  data-pr-tooltip="Export Inactive Data"
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
          <CustomTable
            columns={tableHeaders}
            data={filterTableData?.map((trow, idx) => ({
              ...trow,
              sNo: idx + 1,
              action: (
                <div
                  style={{ gap: "10px" }}
                  className="d-flex class_table gap-2 align-items-center justify-content-center"
                >
                  <span>
                    <CiEdit onClick={() => onRowEdit(trow)} color="#4549af" />
                  </span>
                  <MdDeleteOutline
                    onClick={() => onRowDelete(trow, "Delete")}
                    color="#d82121"
                    fontSize={"20px"}
                  />
                </div>
              ),
            }))}
            //   onEdit={onRowEdit}
          />
        </div>
      </div>
      <Modal
        Header={"Warning!"}
        setVisible={(val) => handleTatModalOpen(val, "x")}
        visible={queryRemoveModalOpen}
        children={<RemoveQuery />}
        modalWidth={"30%"}
      />
    </>
  );
};

export default ManageResponse;
