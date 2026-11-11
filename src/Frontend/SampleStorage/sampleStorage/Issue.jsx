import React, { useEffect, useState } from "react";
import DatePicker from "../../../components/formComponent/DatePicker";
import Input from "../../../components/formComponent/Input";
import { Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import Heading from "../../../components/UI/Heading";
import CustomTable from "../../../components/Table/CustomTable";
import { SearchBy } from "../../../utils/Constants";
import ReactSelect from "../../../components/formComponent/ReactSelect";
import { number } from "../../../utils/helpers";
import { useNavigate, useLocation } from "react-router-dom";
import Breadcrumb from "../../../components/Breadcrumb";
import { PlusIcon, ViewMenu } from "../../../components/SvgIcons";
import SeeMore from "../frameMenu/SeeMore";
import Discard from "./Discard";
import SampleStorage from "./SampleStorage";
import DeviceMaster from "../sampleStorageMaster/DeviceMaster";
import TrackMaster from "../sampleStorageMaster/TrackMaster";
import TrayMaster from "../sampleStorageMaster/TrayMaster";
import SampleStorageDashboard from "../sampleStorageDashboad/SampleStorageDashboard";
import Modal from "../../../components/ModalComponent/Modal";

import IssueModal from "./IssueModal";
import { axiosInstance } from "../../../utils/axiosInstance";
import { toast } from "react-toastify";
import SampleDiscardReport from "./SampleDiscardReport";
import moment from "moment";
import TableFilterDot from "../../Components/TableFilterDot";

const Issue = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const initialState = {
    RegFromDate: new Date(),
    RegToDate: new Date(),
    SelectTypes: "PatientCode",
    ItemValue: "",
    DateTypes: "",
  };
  const [showMore, setShowMore] = useState(false);
  const [payload, setPayload] = useState(initialState);
  const [masterTableData, setMasterTableData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [modalData, setModalData] = useState({});
  const [handleModelData, setHandleModelData] = useState({});
  const [filterTableData,setFilterTableData] = useState([])
  const [filterInputValue,setFilterInputValue] = useState('');
  const [openModal, setOpenModal] = useState(false)
  const dateSelect = (date, name) => {
    setPayload({
      ...payload,
      [name]: date,
    });
  };
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPayload((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? "1" : "0") : value,
    }));
  };
  const handleSelectChange = (name, value) => {
    setPayload((prev) => ({ ...prev, [name]: value?.value }));
  };
  const columns = [
    { header: "S.No.", field: "sno", width: "3%" },
    { header: "SIN No.", field: "sinNo" },
    { header: "Visit No.", field: "visitNo" },
    { header: "UHID", field: "uhid" },
    { header: "PName", field: "pname" },
    { header: "Age/Sex", field: "ageSex" },
    { header: "BookingCentre", field: "bookingCentre" },
    { header: "StorageCentre", field: "storageCentre" },
    { header: "SampleType", field: "sampleType" },
    { header: "DeviceName", field: "deviceName" },
    { header: "RackNumber", field: "rackNumber" },
    { header: "TrayNumber", field: "trayNumber" },
    { header: "SlotNumber", field: "slotNumber" },
    { header: "Issue", field: "issue" },
  ];

  const handleToggle=()=>{
    setOpenModal(false);
    setHandleModelData(null);
    handleSearch();
  }

  console.log("tableData1223", tableData);
  // const formattedData = tableData?.map((item, index) => ({
  //   ...item,
  //   srNo: index + 1,
  // }));
  const formattedData = filterTableData?.map((row, index) => ({
    sno: index + 1,
    sinNo: row?.SinNo || "",
    visitNo: row?.LedgerTransactionNo || "",
    uhid: row?.UniID || "",
    pname: row?.PName || "",
    ageSex: row?.PInfo || "",
    bookingCentre: row?.BookingCentre || "",
    storageCentre: row?.StorageCentre || "",
    sampleType: row?.SampleTypeName || "",
    deviceName: row?.DeviceName || "",
    rackNumber: row?.RackNumber ? `Rack ${row.RackNumber}` : "",
    trayNumber: row?.TrayCode || "",
    slotNumber: row?.SlotNumber || "",
    rowColor: row?.RowColor,
    issue: (
      <button
        className="btnAdd"
        onClick={() =>
          handleModel(
            "Issue Sample",
            "40vw",
            "Issue Sample",
            true,
            <IssueModal handleChangeModel={handleChangeModel} handleToggle={handleToggle} rowData={row} />
          )
        }
      >
        <PlusIcon />
      </button>
    ),
  }));

  const handleEdit = (row) => {
    console.log("Editing row:", row);
    setIsUpdate(true);
    setPayload({
      TypeName: row.TypeName,
      Active: row.Active === "Active" ? "1" : "0",
      CreatedBy: row.CreatedBy,
      CreatedOn: row.CreatedOn,
      status: row.status,
    });
  };

  const colorCodingData = [
    { color: "#fff", id: "1", labelKey: "Sample Stored" },
    // { color: "#FFC0CB", id: "2", labelKey: "Sample Discard	" },
    { color: "#90EE90", id: "3", labelKey: "Sample Issued" },
    { color: "#901190", id: "all", labelKey: "all" },
  ];

  const DateBy = [
    { value: "RegDate", label: t("Registration Date") },
    { value: "EntryDate", label: t("Storage Date") },
  ];
 
  const handleChangeSearch = (event) => {
    const { value } = event.target;
    const filtered = masterTableData.filter(
      (item) =>
        item.sinNo?.toLowerCase().includes(value.toLowerCase()) ||
        item.visitNo?.toLowerCase().includes(value.toLowerCase()) ||
        item.uhid?.toLowerCase().includes(value.toLowerCase()) ||
        item.pname?.toLowerCase().includes(value.toLowerCase()) ||
        item.ageSex?.toLowerCase().includes(value.toLowerCase()) ||
        item.bookingCentre?.toLowerCase().includes(value.toLowerCase()) ||
        item.storageCentre?.toLowerCase().includes(value.toLowerCase()) ||
        item.sampleType?.toLowerCase().includes(value.toLowerCase()) ||
        item.deviceName?.toLowerCase().includes(value.toLowerCase()) ||
        item.rackNumber?.toLowerCase().includes(value.toLowerCase()) ||
        item.trayNumber?.toLowerCase().includes(value.toLowerCase()) ||
        item.slotNumber?.toLowerCase().includes(value.toLowerCase()) ||
        item.issue?.toLowerCase().includes(value.toLowerCase())
    );
    // setTableData(filtered);
    setFilterTableData(filtered);
  };
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
      name: "Sample Storage Type Master",
      component: <TrackMaster setShowMore={setShowMore} />,
      url: "/SampleStorageTypeMaster",
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
      name: "Sample Discard",
      component: <Discard setShowMore={setShowMore} />,
      url: "/Samplediscard",
    },
    //  {
    //   name: "Sample Discard Report",
    //   component: <SampleDiscardReport setShowMore={setShowMore} />,
    //   url: "/SampleDiscardReport",
    // },
    {
      name: "Sample Storage Report",
      component: <SampleDiscardReport setShowMore={setShowMore} />,
      url: "/SampleStorageReport",
    },
    // {
    //   name: "Sample Issue Report",
    //   component: <SampleDiscardReport setShowMore={setShowMore} />,
    //   url: "/SampleIssueReport",
    // },
  ];
  const handleModel = (
    label,
    width,
    type,
    isOpen,
    Component,
    handleInsertAPI,
    extrabutton
  ) => {
    setHandleModelData({
      label: label,
      width: width,
      type: type,
      isOpen: isOpen,
      Component: Component,
      handleInsertAPI: handleInsertAPI,
      extrabutton: extrabutton ? extrabutton : <></>,
    });
    setOpenModal(true)
  };

  useEffect(() => {
    setHandleModelData((val) => ({ ...val, modalData: modalData }));
  }, [modalData]);

  const setIsOpen = () => {
    setHandleModelData((val) => ({ ...val, isOpen: false }));
  };
  
  const handleChangeModel = (data) => {
    setModalData(data);
  };

  const handleSearch = async () => {
    const reqBody = {
      SearchType: String(payload?.SelectTypes || ""),
      SearchValue: String(payload?.ItemValue || ""),
      fromDate: payload?.RegFromDate
        ? `${moment(payload.RegFromDate)?.format("yy-MM-DD")}T00:00:00`
        : "",
      toDate: payload?.RegToDate
        ? `${moment(payload.RegToDate)?.format("yy-MM-DD")}T23:59:59`
        : "",
      DateType: String(payload?.DateTypes || ""),
    };

    try {
      const res = await axiosInstance.post(
        "SampleStorage/searchIssue",
        reqBody
      );
      const { message, data, success } = res?.data || {};

      if (success && Array.isArray(message) && message.length > 0) {
        // 🔹 Clean and normalize rows before setting
        setTableData(message);
        setMasterTableData(message);
        setFilterTableData(message);
      } else {
        setTableData([]);
        setFilterTableData([]);
        toast.error(message || "No Data found.");
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Something went wrong!");
    }
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
    if(type==='all'){
      setFilterTableData(tableData)
      return
    }
    setFilterTableData(
      tableData?.filter((data) => {
        // Normalize status to lowercase for comparison
        return String(data?.STATUS)?.toLowerCase() === type.toLowerCase();
      })
    );
  };

  const statusCount = (statuType)=>{
    return tableData?.filter((item=> item?.STATUS == statuType))?.length
  }

  console.log('payload?.DateTypes::',payload?.DateTypes);

  return (
    <>
      {openModal && (
        <Modal
          visible={openModal}
          setVisible={setOpenModal}
          modalWidth={handleModelData?.width}
          Header={t(handleModelData?.label)}
          buttonType={"submit"}
          buttons={handleModelData?.extrabutton}
          modalData={handleModelData?.modalData}
          setModalData={setModalData}
        >
          {handleModelData?.Component}
        </Modal>
      )}
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
      <div className="card issue-main-heading">
        <Heading
          name={"Sample Issue"}
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
          <div className="col-xl-2 col-sm-4 col-md-6 co-12">
            <div className="d-flex" style={{ display: "flex" }}>
              <div style={{ width: "50%" }}>
                <ReactSelect
                  name="SelectTypes"
                  id="SelectTypes"
                  removeIsClearable={true}
                  dynamicOptions={SearchBy}
                  placeholderName="SelectTypes"
                  value={payload?.SelectTypes}
                  onChange={handleSelectChange}
                  respclass={"w-100"}
                />
              </div>
              <div style={{ width: "50%" }}>
                {payload?.SelectTypes === "Mobile" ? (
                  <div style={{ width: "100%" }}>
                    <Input
                      type="number"
                      name="ItemValue"
                      max={10}
                      // onKeyDown={handleKeyDown}
                      value={payload.ItemValue}
                      onChange={handleChange}
                      onInput={(e) => number(e, 10)}
                    />
                  </div>
                ) : (
                  <div style={{ width: "100%", marginLeft: "3px" }}>
                    <Input
                      type="text"
                      name="ItemValue"
                      max={20}
                      // onKeyDown={handleKeyDown}
                      value={payload.ItemValue}
                      onChange={handleChange}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          <ReactSelect
            name="DateTypes"
            id="DateTypes"
            removeIsClearable={true}
            dynamicOptions={DateBy}
            placeholderName="DateTypes"
            value={payload?.DateTypes}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <DatePicker
            name="RegFromDate"
            id="RegFromDate"
            value={payload?.RegFromDate}
            onChange={dateSelect}
            maxDate={new Date()}
            placeholder=""
            lable={t(`${payload?.DateTypes || 'Date'} From`)}
            className="custom-calendar"
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <DatePicker
            name="RegToDate"
            id="RegToDate"
            value={payload?.RegToDate}
            onChange={dateSelect}
            maxDate={new Date()}
            placeholder=""
            lable={t(`${payload?.DateTypes || 'Date'} To`)}
            className="custom-calendar"
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />

          <div className="col-sm-1">
            <Button className="rounded py-0" onClick={handleSearch}>
              Search
            </Button>
          </div>
        </div>
      </div>

      <div className="card mt-2">
        {/* Mobile: custom card with search + stats inside same heading card */}
        <div className="card card_background d-md-none mb-0">
          <div className="card-header mb-1">
            <div className="d-flex align-items-center justify-content-between">
              <Breadcrumb path={location?.pathname} name={t("Patient Detail")} />
              <div className="issue-heading-search">
                <input
                  className="search-menu-container"
                  type="text"
                  value={filterInputValue}
                  placeholder={t("Search Page")}
                  onChange={handleFilterInputChange}
                />
                <i className="fa fa-search"></i>
              </div>
            </div>
            <div className="d-flex align-items-center issue-stats-row mt-1">
              <span className="issue-stat-chip text-danger">
                Total Patient: {tableData?.length}
              </span>
              {colorCodingData?.map(({ color, labelKey, id }) => (
                <TableFilterDot
                  key={id}
                  onClick={() => filterOnClick(id)}
                  color={color}
                  title={`${t(labelKey)} (${statusCount(id)})`}
                  bgColor={"#ebebebbf"}
                />
              ))}
            </div>
          </div>
        </div>
        {/* Desktop: original Heading unchanged */}
        <div className="d-none d-md-block">
          <Heading
            name={t("Patient Detail")}
            isBreadcrumb={true}
            secondTitle={
              <>
                <label className="text-danger mt-1 px-2">
                  *Total Patient: {tableData?.length}
                </label>
                {colorCodingData?.map(({ color, labelKey, id }) => (
                  <TableFilterDot
                    key={id}
                    onClick={() => filterOnClick(id)}
                    color={color}
                    title={`${t(labelKey)} (${statusCount(id)})`}
                  />
                ))}
                <div className="search-container ml-2">
                  <input
                    className="search-menu-container"
                    type="text"
                    value={filterInputValue}
                    placeholder={t("Search Page")}
                    onChange={handleFilterInputChange}
                  />
                  <i className="fa fa-search"></i>
                </div>
              </>
            }
          />
        </div>
        <div className="row">
          <div className="col-sm-12">
            <CustomTable
              columns={columns}
              data={formattedData}
              onEdit={handleEdit}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Issue;
