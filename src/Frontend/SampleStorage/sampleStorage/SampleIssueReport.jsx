import React, { useEffect, useState } from "react";
import DatePicker from "../../../components/formComponent/DatePicker";
import Input from "../../../components/formComponent/Input";
import { Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import Heading from "../../../components/UI/Heading";
import CustomTable from "../../../components/Table/CustomTable";
import ColorCodingSearch from "../../../components/ModalComponent/ColorCodingSearch";
import { SearchBy } from "../../../utils/Constants";
import ReactSelect from "../../../components/formComponent/ReactSelect";
import { ExportToExcel, number } from "../../../utils/helpers";
import { useNavigate } from "react-router-dom";
import { PlusIcon, ViewMenu } from "../../../components/SvgIcons";
import SeeMore from "../frameMenu/SeeMore";
import Discard from "./Discard";
import SampleStorage from "./SampleStorage";
import DeviceMaster from "../sampleStorageMaster/DeviceMaster";
import TrackMaster from "../sampleStorageMaster/TrackMaster";
import TrayMaster from "../sampleStorageMaster/TrayMaster";
import SampleStorageDashboard from "../sampleStorageDashboad/SampleStorageDashboard";
import Modal from "../../../components/ModalComponent/Modal";
// import SubCategoryTypeMasterModel from "../../Store/storeMaster/storeItemMaster/SubCategoryTypeMasterModel";
import IssueModal from "./IssueModal";
import { axiosInstance } from "../../../utils/axiosInstance";
import { toast } from "react-toastify";
import SampleDiscardReport from "./SampleDiscardReport";

const SampleIssueReport = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const initialState = {
    IssueDateFrom: new Date(),
    IssueDateTo: new Date(),
    Centre: "PatientCode",
    ItemValue: "",
    DateTypes: "2",
  };
  const [showMore, setShowMore] = useState(false);
  const [payload, setPayload] = useState(initialState);
  const [masterTableData, setMasterTableData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [modalData, setModalData] = useState({});
  const [handleModelData, setHandleModelData] = useState({});
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

  const formattedData = tableData?.map((row, index) => ({
    sno: index + 1,
    sinNo: row?.SinNo || "",
    visitNo: row?.VisitNo || "",
    uhid: row?.UHID || "",
    pname: row?.PName || "",
    ageSex: row?.PInfo || "",
    bookingCentre: row?.BookingCentre || "",
    storageCentre: row?.StorageCentre || "",
    sampleType: row?.SampleTypeName || "",
    deviceName: row?.DeviceName || "",
    rackNumber: row?.RackNumber ? `Rack ${row.RackNumber}` : "",
    trayNumber: row?.TrayCode || "",
    slotNumber: row?.SlotNumber || "",
    issue: (
      <button
        className="btnAdd"
        onClick={() =>
          handleModel(
            "Issue Sample",
            "40vw",
            "Issue Sample",
            true,
            <IssueModal handleChangeModel={handleChangeModel} rowData={row} />
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
    { color: "#f4f74f", id: "15", labelKey: "Sample Stored" },
    { color: "#FFC0CB", id: "7", labelKey: "Sample Discard	" },
    { color: "#90EE90", id: "8", labelKey: "Sample Issued" },
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
    setTableData(filtered);
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
    {
      name: "Sample Discard Report",
      component: <SampleDiscardReport setShowMore={setShowMore} />,
      url: "/SampleDiscardReport",
    },
    {
      name: "Sample Storage Report",
      component: <SampleDiscardReport setShowMore={setShowMore} />,
      url: "/SampleStorageReport",
    },
    {
      name: "Sample Issue Report",
      component: <SampleDiscardReport setShowMore={setShowMore} />,
      url: "/SampleIssueReport",
    },
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
      transactionType: String(payload?.ReportType),
      dateFrom: payload?.IssueDateFrom
        ? new Date(payload.IssueDateFrom).toISOString().slice(0, 10)
        : "",
      dateTo: payload?.IssueDateTo
        ? new Date(payload.IssueDateTo).toISOString().slice(0, 10)
        : "",
      companyID: String(""),
      sinNo: String(""),
      sampleTypeID: Number(""),
      deviceID: Number(""),
    };

    try {
      const res = await axiosInstance.post("SampleStorage/get", reqBody);
      const { message, data, success } = res?.data || {};

      if (success && Array.isArray(data) && data.length > 0) {
        setTableData(data);
        setMasterTableData(data);
      } else {
        setTableData([]);
        toast.error("No Data found." || message);
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Something went wrong!");
    }
  };

  console.log("payload", payload);
  return (
    <>
      {handleModelData?.isOpen && (
        <Modal
          visible={handleModelData?.isOpen}
          setVisible={setIsOpen}
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
      <div className="card">
        <Heading
          name={"Sample Issue Report"}
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
          {/* <div className="col-xl-2 col-sm-4 col-md-6 co-12">
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
          </div> */}
          {/* <ReactSelect
            name="Centre"
            id="Centre"
            removeIsClearable={true}
            dynamicOptions={DateBy}
            placeholderName="DateTypes"
            value={payload?.Centre}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          /> */}
          <ReactSelect
            name="ReportType"
            id="ReportType"
            removeIsClearable={true}
            dynamicOptions={[
              { label: "Select", value: "0" },
              { label: "SampleDiscardReport", value: "SampleDiscardReport" },
              { label: "SampleIssueReport", value: "SampleIssueReport" },
              { label: "SampleStorage", value: "SampleStorage" },
            ]}
            placeholderName="ReportType"
            value={payload?.ReportType}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <DatePicker
            name="IssueDateFrom"
            id="IssueDateFrom"
            value={payload?.IssueDateFrom}
            onChange={dateSelect}
            maxDate={new Date()}
            placeholder=""
            lable={t("Issue Date From")}
            className="custom-calendar"
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <DatePicker
            name="IssueDateTo"
            id="IssueDateTo"
            value={payload?.IssueDateTo}
            onChange={dateSelect}
            maxDate={new Date()}
            placeholder=""
            lable={t("Issue Date To")}
            className="custom-calendar"
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />

          <div className="col-sm-1">
            <Button className="rounded py-0" onClick={handleSearch}>
              Search
            </Button>
          </div>
          <div className="col-sm-2">
            <button
              className="btn btn-block btn-success btn-sm col-4"
              // type="submit"
              onClick={() => ExportToExcel(formattedData)}
              disabled={formattedData?.length === 0}
            >
              {t("Excel")}
            </button>
          </div>
        </div>
      </div>

      <div className="card mt-2">
        <Heading
          name={t("Patient Detail")}
          secondTitle={
            <>
              <div className="search-container">
                <input
                  className="search-menu-container"
                  type="text"
                  placeholder={t("Search Page")}
                  onChange={handleChangeSearch}
                />
                <i className="fa fa-search"></i>
              </div>
              <label className="text-danger mt-1 px-2">*Total Patient:2 </label>
              {colorCodingData.map(({ color, labelKey, id }) => (
                <ColorCodingSearch
                  key={id}
                  color={color}
                  label={t(labelKey)}
                  //   onClick={() => handleCallViewMedReq(id)}
                />
              ))}
            </>
          }
          isBreadcrumb={true}
        />
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

export default SampleIssueReport;
