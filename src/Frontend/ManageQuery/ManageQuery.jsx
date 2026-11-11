import React, { useEffect, useState } from "react";
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
import FilterInput from "../../components/Filter/FilterInput";
import { MdDelete, MdDeleteOutline } from "react-icons/md";
import { TbFileTypeXls } from "react-icons/tb";

import { CiEdit } from "react-icons/ci";
import { ExportToExcel } from "../../utils/helpers";
import { ViewMenu } from "../../components/SvgIcons";
import TicketMenuList from "../Ticketing/TicketMenuList";
import "./ManageQuery.css";
import { Tooltip } from "primereact/tooltip";
import greenExcelIcon from "../../assets/image/xlsLogo.png";
import redExcelIcon from "../../assets/image/redExcel.png";
import { setLoading } from "../../store/reducers/loadingSlice/loadingSlice";
import { notify } from "../../utils/utils";
import { axiosInstance } from "../../utils/axiosInstance";
import { apiUrls } from "../../utils/apiEndpoints";

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

const ManageQuery = () => {
  const { queryRemoveModalOpen } = useSelector((data) => data.ticketing);
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [filterInputValue, setFilterInputValue] = useState("");
  const [showMore, setShowMore] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [filterTableData, setFilterTableData] = useState([]);

  const initialState = {
    category: "",
    query: "",
    detail: "",
    id: null,
  };
  const [dropDownList, setDropdownList] = useState({
    categoryList: [],
  });
  const [payload, setPayload] = useState(initialState);
  const [isUpdate, setIsUpdate] = useState(false);
  const [selectedRow, setSelectedRow] = useState({});

  const handleReactChange = (name, e) => {
    setPayload((prev) => ({ ...prev, [name]: e.value || "" }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPayload((prev) => ({ ...prev, [name]: value }));
  };

  const tableHeaders = [
    { header: "S.No", field: "sNo", width: "3%" },
    { header: "Category", field: "CategoryName", width: "10%" },
    { header: "Query", field: "SUBJECT", width: "10%" },
    { header: "Details", field: "Detail", maxWidth: "10%" },
    { header: "Create By", field: "CreatedByName" },
    { header: "Create On", field: "dtEntry" },
    { header: "Last UpdatedBy", field: "UpdatedByName" },
    { header: "Last UpdatedOn", field: "dtUpdate" },
    { header: "Action", field: "action", width: "10%" },
  ];

  const RemoveQuery = () => {
    return (
      <>
        <div className="remove_query_main">
          <h1>Confirmation !</h1>
          <h2>Do you want to remove?</h2>
          <p>
            <strong>Category : </strong>
            <span>{selectedRow?.category}</span>
          </p>
          <div>
            <strong>Query : </strong>
            <span>{selectedRow?.query}</span>
          </div>
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

  const fetchAllDropdownData = async () => {
    try {
      dispatch(setLoading(true));
      const [categoryRes] = await Promise.all([
        axiosInstance.post(apiUrls.GetDataMaster, {
          Type: "Category",
          categoryId: 0,
          queryID: 0,
          responseID: 0,
          priorityID: 0,
          ticketID: 0,
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

      // --- update all dropdowns at once ---
      setDropdownList((prev) => ({
        ...prev,
        categoryList,
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

  const handleTatModalOpen = (val, data) => {
    setSelectedRow(data);
    dispatch(setQueryRemoveModalOpen(val));
  };

  const handleEditQuery = (rowData) => {
    const getCategoryId = categoryList?.filter(
      (data) => data?.label === rowData?.category
    )?.[0];
    setPayload((prev) => ({
      ...prev,
      category: getCategoryId?.value,
      query: rowData?.query,
      detail: rowData?.detail,
    }));
  };

  const handleReset = () => {
    setPayload(initialState);
    setIsUpdate(false);
  };

  const saveQuery = async (type, idforDelete=null) => {
    if (!payload?.category && type != 'Delete') {
      notify("Category id is required", "error");
      return;
    }
    if (!payload?.query && type != 'Delete') {
      notify("Query id is required", "error");
      return;
    }
    if (!payload?.detail && type != 'Delete') {
      notify("Detail id is required", "error");
      return;
    }

    let id = 0;
    if (type === "Update") {
      id = 1;
    }

    const saveQueryPayload = {
      transactionType: type, // 1. Intert , 2. Update
      type: "Query", // Enter Type 1. Query for Save, 2. Response type for response
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
      type: "QueryList",
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

  const onRowEdit = (rowData) => {
    console.log("rowData", rowData);
    setPayload((prev) => ({
      ...prev,
      category: String(rowData?.CategoryID),
      query: rowData?.SUBJECT,
      detail: rowData?.Detail,
      id: rowData?.Id,
    }));
    setIsUpdate(true); // update flag true
  };

  const onRowDelete=(rowData, type)=>{
    saveQuery('Delete', rowData?.Id)
  }

  const hadleExcelDownload = (expTableData) => {};

  useEffect(() => {
    setFilterTableData(tableData);
    fetchAllDropdownData();
    getQueryResponse();
  }, []);

  return (
    <>
      {showMore && <TicketMenuList />}
      <Heading
        title={"Manage Query"}
        secondTitle={
          <label onClick={() => setShowMore((prev) => !prev)}>
            <ViewMenu />
          </label>
        }
      />
      {/* <Heading */}
      <div className="card px-2 py-2">
        <div className="row query_main">
          <div className="col-sm-3 col-md-2">
            <ReactSelect
              dynamicOptions={dropDownList.categoryList}
              name="category"
              lable={t("Category")}
              id="category"
              removeIsClearable={true}
              placeholderName={t("category")}
              value={payload?.category}
              onChange={handleReactChange}
              className="required-fields"
              isDisabled={isUpdate}
            />
          </div>
          <div className="col-sm-3 col-md-2">
            <Input
              type="text"
              name="query"
              lable="Enter query"
              id="query"
              value={payload.query}
              placeholder=" "
              onChange={handleChange}
            />
          </div>
          <div className="col-sm-3 col-md-2">
            <TextAreaInput
              type="text"
              name="detail"
              lable="Enter detail"
              id="detail"
              value={payload.detail}
              placeholder=" "
              rows={2}
              onChange={handleChange}
            />
          </div>
          <div style={{gap:'4px'}} className="d-flex align-items-start flex-wrap">
            <Button
              onClick={() => saveQuery(isUpdate ? 'Update' : 'Save')}
              className="px-5 py-1 fs-4"
            >
              {isUpdate ? 'Update' : 'Save'}
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
            <div style={{ gap: "6px" }} className="excel_exp d-flex mx-2">
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
              Detail:trow?.Detail?.slice(0,80),
              action: (
                <div
                  style={{ gap: "10px" }}
                  className="d-flex class_table gap-2 align-items-center justify-content-center"
                >
                  <span className="pointer-cursor">
                    <CiEdit
                      onClick={() => onRowEdit(trow)}
                      color="#4549af"
                    />
                  </span>
                  <MdDeleteOutline
                    className="pointer-cursor"
                    onClick={() => onRowDelete(trow, 'Delete')}
                    color="#d82121"
                    fontSize={"20px"}
                  />
                </div>
              ),
            }))}
            // onRowClick={onRowEdit}
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

export default ManageQuery;
