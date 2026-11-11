import React, { useEffect, useRef, useMemo, useState } from "react";
import Heading from "../../../components/UI/Heading";
import Input from "../../../components/formComponent/Input";
import RadioInput from "../../../components/formComponent/RadioInput";
import CustomTable from "../../../components/Table/CustomTable";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { axiosInstance } from "../../../utils/axiosInstance";
import { ViewMenu } from "../../../components/SvgIcons";
import SeeMore from "../frameMenu/SeeMore";
import { useNavigate } from "react-router-dom";
import SampleStorageDashboard from "../sampleStorageDashboad/SampleStorageDashboard";
import TrayMaster from "./TrayMaster";
import DeviceMaster from "./DeviceMaster";
import SampleStorage from "../sampleStorage/SampleStorage";
import Issue from "../sampleStorage/Issue";
import Discard from "../sampleStorage/Discard";
import { Form } from "react-bootstrap";
import TableFilterDot from "../../Components/TableFilterDot";
import SampleDiscardReport from "../sampleStorage/SampleDiscardReport";
import { SaveButton, CancelButton } from "../../../components/UI/CustomButton";

const TrackMaster = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const typeNameRef = useRef(null);
  const [showMore, setShowMore] = useState(false);
  const initialState = {
    TypeName: "",
    Active: "1",
    id: null,
  };
  const [payload, setPayload] = useState(initialState);
  const [masterTableData, setMasterTableData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [isUpdate, setIsUpdate] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filterInputValue, setFilterInputValue] = useState("");
  const handleChange = ({ target: { name, value, type, checked } }) => {
    setPayload((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? "true" : "false") : value,
    }));
  };

  const buildRequestBody = () => ({
    TransactionType: isUpdate ? "Update" : "Insert",
    sampletype: String(payload.TypeName),
    isActive: payload.Active === "1" ? true : false,
    id: Number(payload?.id),
    ...(isUpdate && { id: payload.id || 0 }),
  });

  console.log("payload::", payload);
  console.log("tableData::", tableData);

  const handleSave = async () => {
    if (!payload?.TypeName) {
      toast.error("Type Name is Required");
      typeNameRef.current?.focus(); // Focus input if empty
      return;
    }

    const url = isUpdate
      ? "SampleStorage/SaveSampleTypeIU"
      : "SampleStorage/SaveSampleTypeIU";

    try {
      const response = await axiosInstance.post(url, buildRequestBody());
      const { success, message } = response.data || {};

      if (success) {
        toast.success(message || "Saved Successfully.");
        fetchSampleTypes();
        setPayload(initialState);
        setIsUpdate(false);
        handleReset();
      } else {
        toast.error(message || "No data found.");
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Something went wrong!");
    }
  };

  const tableHeaders = [
    { header: "Sr. No.", field: "srNo", width: "3%" },
    { header: "Type Name", field: "TypeName" },
    { header: "Created By", field: "CreatedBy" },
    { header: "Created On", field: "CreatedOn" },
    { header: "Last Updated By", field: "LastUpdatedBy" },
    { header: "Last Updated Date", field: "LastUpdatedDate" },
    { header: "Edit", field: "edits" },
  ];

  const formattedData = tableData.map((item, index) => ({
    ...item,
    srNo: index + 1,
    TypeName: item.StorageType,
    Active: item.IsActive,
    CreatedBy: item.CreatedBy,
    CreatedOn: item.dtEntry,
    status: item.IsActive ? "Active" : "Inactive",
    LastUpdatedBy: item.UpdatedBy,
    LastUpdatedDate: item.dtUpdate,

    edit: "edit",
  }));

  // const handleEdit = (row) => {
  //   console.log("handleEdit", row);

  //   setIsUpdate(true);
  //   setPayload((prev) => ({
  //     ...prev,
  //     TypeName: row.TypeName,
  //     Active: row.IsActive === 1 ? "1" : "0",
  //     id: row.ID,
  //   }));
  // };

  const handleEdit = (rowData) => {
    console.log("rowData", rowData);
    const row = tableData.find((item) => item?.ID === rowData?.ID);
    console.log("handleEdit>>", row);
    // return
    if (row) {
      setPayload((prev) => ({
        ...prev,
        TypeName: row?.StorageType,
        Active: row?.IsActive === 1 ? "1" : "0",
        id: row?.ID,
      }));
    }
    setIsUpdate(true);
  };

  const handleSwitchChange = (e) => {
    setPayload((prev) => ({
      ...prev,
      Active: e.target.checked, // true or false
    }));
  };

  const handleChangeSearch = ({ target: { value } }) => {
    const filtered = masterTableData.filter((item) =>
      [item.NAME, item.CreatedBy, item.STATUS, item.CreatedOn].some((field) =>
        field?.toLowerCase().includes(value.toLowerCase()),
      ),
    );
    setTableData(filtered);
  };


const fetchSampleTypes = async () => {
  try {
    const [activeRes, inactiveRes] = await Promise.all([
      axiosInstance.post("SampleStorage/GetsampleStorageTypeMaster", { IsActive: 1 }),
      axiosInstance.post("SampleStorage/GetsampleStorageTypeMaster", { IsActive: 0 }),
    ]);

    const activeData = activeRes.data?.success ? activeRes.data.message : [];
    const inactiveData = inactiveRes.data?.success ? inactiveRes.data.message : [];

    const allData = [...activeData, ...inactiveData];

    setTableData(allData);
    setMasterTableData(allData);
  } catch (err) {
    console.error(err);
  }
};  

const statusCount = (sType) => {
    return masterTableData?.filter((items) => items?.IsActive === sType)?.length;
  };

  const handleFilterInputChange = (e) => {
    console.log("handleFilterInputChange", e);

    // Save filter value
    setFilterInputValue(e);

    // If e is empty/null, reset to full data
    if (e === "" || e === null || e === undefined) {
      setTableData(masterTableData); // keep an original copy of data
      return;
    }

    // Filter rows by IsActive (number or string)
    const filtered = masterTableData.filter(
      (row) => String(row.IsActive) === String(e),
    );

    setTableData(filtered);
  };

  const handleReset = () => {
    setPayload(initialState);
    setIsUpdate(false);
  };

  useEffect(() => {
    fetchSampleTypes();
  }, []);

  const seeMoreData = [
    {
      name: "Sample Storage Dashboard",
      component: <SampleStorageDashboard setShowMore={setShowMore} />,
      url: "/Dashboard#samplestoragedashboard",
    },
    {
      name: "Sample Storage Tray Master",
      component: <TrayMaster setShowMore={setShowMore} />,
      url: "/SampleStorageTrayMaster",
    },
    {
      name: "Sample Storage Device Master",
      component: <DeviceMaster setShowMore={setShowMore} />,
      url: "/SampleStorageDeviceMaster",
    },
    {
      name: "Sample Storage",
      component: <SampleStorage setShowMore={setShowMore} />,
      url: "/SampleStorage",
    },
    {
      name: "Sample Issue",
      component: <Issue setShowMore={setShowMore} />,
      url: "/SampleIssue",
    },
    {
      name: "Sample Discard",
      component: <Discard setShowMore={setShowMore} />,
      url: "/Samplediscard",
    },
    {
      name: "Sample Storage Report",
      component: <SampleDiscardReport setShowMore={setShowMore} />,
      url: "/SampleStorageReport",
    },
  ];
  
  const filteredData = useMemo(() => {
  let data = tableData;

  if (!searchText) return data;

  const search = searchText.toLowerCase();

  return data.filter(
    (item) =>
      item?.StorageType?.toLowerCase().includes(search) ||
      item?.CreatedByName?.toLowerCase().includes(search) ||
      item?.UpdatedByName?.toLowerCase().includes(search) ||
      item?.dtEntry?.toLowerCase().includes(search) ||
      item?.dtUpdate?.toLowerCase().includes(search)
  );
}, [tableData, searchText]);

  return (
    <>
      {showMore && (
        <SeeMore
          seeMore={seeMoreData}
          handleChangeComponent={(item) => {
            setShowMore(false);
            navigate(item?.url);
          }}
          setShowMore={setShowMore}
        />
      )}
      <div className="card track-master-heading">
        <Heading
          name={"Sample Storage Type Master"}
          isBreadcrumb={true}
          secondTitle={
            <>
              <label onClick={() => setShowMore((prev) => !prev)}>
                <ViewMenu />
              </label>
            </>
          }
        />
        <div className="row p-2">
          <Input
            type="text"
            placeholder=" "
            lable={t("Storage Type Name")}
            id="TypeName"
            name="TypeName"
            value={payload.TypeName}
            onChange={handleChange}
            className="required-fields"
            inputRef={typeNameRef}
            respclass="col-xl-2 col-sm-4 col-md-6 co-12"
          />
          <div className="col-xl-1 col-sm-4 col-md-6 col-12 d-flex align-items-center" style={{gap: "8px"}}>
            {/* <RadioInput
              inputType="checkbox"
              label="Active"
              id="Active"
              name="Active"
              value={payload.Active === "1"}
              onChange={handleChange}
            /> */}
            <Form.Check
              type="switch"
              id="custom-switch"
              label="Status"
              checked={payload?.Active === "1"} // string -> boolean
              onChange={(e) =>
                setPayload((prev) => ({
                  ...prev,
                  Active: e.target.checked ? "1" : "0", // boolean -> string
                }))
              }
            />
            <SaveButton
              onClick={handleSave}
              text={isUpdate ? t("Update") : t("Save")}
            />
            <CancelButton
              onClick={handleReset}
              text={t("clear")}
              />
          </div>
        </div>
      </div>

      <div className="card mt-2 track-expanses-detail">
        {/* <Heading
          name={t("Device  List")}
          isBreadcrumb={true}
          secondTitle={
            <div className="search-container">
              <input
                className="search-menu-container"
                type="text"
                placeholder={t("Search Page")}
                onChange={handleChangeSearch}
              />
              <i className="fa fa-search"></i>
            </div>
          }
        /> */}
        {/* <div className="row">
          <div className="col-sm-12">
            <CustomTable
              columns={columns}
              data={formattedData}
              onEdit={handleEdit}
            />
          </div>
        </div> */}
        <Heading
          title={t("Expanses Details")}
          secondTitle={
            <>
              <span className="d-none d-md-inline-flex" style={{ gap: "4px" }}>
                <TableFilterDot
                  onClick={() => handleFilterInputChange(1)}
                  color={"#90EE90"}
                  title={`Active ${statusCount(1)}`}
                />
                <TableFilterDot
                  onClick={() => handleFilterInputChange(0)}
                  color={"#FFB6C1"}
                  title={`Inactive ${statusCount(0)}`}
                />
              </span>
              <div
                style={{ gap: "4px", flexShrink: 0 }}
                className="d-flex align-items-center justify-content-end track-search-wrap"
              >
                <Input
                  type="text"
                  placeholder="Search Type Master"
                  value={searchText}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="mt-2"
                />
              </div>
            </>
          }
        />

        <div className="mt-1 table_ticket">
          <CustomTable
            columns={tableHeaders}
            data={filteredData.map((item, index) => ({
              ...item,
              rowColor: item.IsActive === 1 ? "#90ee90" : "#ffb6c1",
              srNo: index + 1,
              TypeName: item?.StorageType,
              Active: item?.IsActive,
              CreatedBy: item?.CreatedByName,
              CreatedOn: item?.dtEntry,
              LastUpdatedBy: item?.UpdatedByName || "-",
              LastUpdatedDate: item?.dtUpdate || "-",
              edits: (
                <div onClick={() => handleEdit(item)}>
                  <i
                    className="fa fa-edit"
                    style={{ cursor: "pointer", color: "rgb(33, 33, 139)" }}
                    aria-hidden="true"
                  ></i>
                </div>
              ),
            }))}
          />
        </div>
      </div>
    </>
  );
};

export default TrackMaster;
