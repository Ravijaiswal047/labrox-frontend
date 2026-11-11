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
import { number } from "../../../utils/helpers";

const StorageReport = () => {
  const { t } = useTranslation();
  const initialState = {
    FromDate: new Date(),
    ToDate: new Date(),
    Device: "",
    SampleType: "",
    SINNo: "",
  };
  const [payload, setPayload] = useState(initialState);
  const [masterTableData, setMasterTableData] = useState([]);
  const [tableData, setTableData] = useState([]);
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

  const formattedData = tableData.map((item, index) => ({
    ...item,
    srNo: index + 1,
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
    { value: "1", label: t("Registration Date") },
    { value: "2", label: t("Storage Date") },
  ];
  useEffect(() => {
    const initialData = [
      {
        sno: 1,
        sinNo: "SIN12345",
        visitNo: "V12345",
        uhid: "UHID12345",
        pname: "John Doe",
        ageSex: "30/M",
        bookingCentre: "Centre A",
        storageCentre: "Centre B",
        sampleType: "Blood",
        deviceName: "Device X",
        rackNumber: "Rack 1",
        trayNumber: "Tray A",
        slotNumber: "Slot 1",
        issue: "Issue 1",
      },
      {
        sno: 2,
        sinNo: "SIN67890",
        visitNo: "V67890",
        uhid: "UHID67890",
        pname: "Jane Smith",
        ageSex: "25/F",
        bookingCentre: "Centre C",
        storageCentre: "Centre D",
        sampleType: "Urine",
        deviceName: "Device Y",
        rackNumber: "Rack 2",
        trayNumber: "Tray B",
        slotNumber: "Slot 2",
        issue: "Issue 2",
      },
    ];
    setMasterTableData(initialData);
    setTableData(initialData);
  }, []);

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
  return (
    <>
      <div className="card">
        <div className="row p-2">
          <DatePicker
            name="FromDate"
            id="FromDate"
            value={payload?.FromDate}
            onChange={dateSelect}
            maxDate={new Date()}
            placeholder=""
            lable={t("From Date")}
            className="custom-calendar"
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <DatePicker
            name="ToDate"
            id="ToDate"
            value={payload?.ToDate}
            onChange={dateSelect}
            maxDate={new Date()}
            placeholder=""
            lable={t("To Date")}
            className="custom-calendar"
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <ReactSelect
            name="Device"
            id="Device"
            removeIsClearable={true}
            dynamicOptions={DateBy}
            placeholderName="Device"
            value={payload?.Device}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <ReactSelect
            name="SampleType"
            id="SampleType"
            removeIsClearable={true}
            dynamicOptions={DateBy}
            placeholderName="Sample Type"
            value={payload?.SampleType}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <Input
            type="text"
            placeholder=" "
            lable={t("SIN No")}
            id="SINNo"
            name="SINNo"
            value={payload?.SINNo}
            onChange={handleChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <div className="col-sm-1">
            <Button className="rounded py-0 ">Search</Button>
          </div>
        </div>
      </div>

      <div className="card mt-2">
        <Heading
          name={t("Patient Detail")}
          secondTitle={
            <>
              {" "}
              <label className="text-danger mt-1 px-2">*Total Patient:2 </label>
              <div className="search-container">
                <input
                  className="search-menu-container"
                  type="text"
                  placeholder={t("Search Page")}
                  onChange={handleChangeSearch}
                />
                <i className="fa fa-search"></i>
              </div>
              {/* {colorCodingData.map(({ color, labelKey, id }) => (
                <ColorCodingSearch
                  key={id}
                  color={color}
                  label={t(labelKey)}
                  //   onClick={() => handleCallViewMedReq(id)}
                />
              ))} */}
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

export default StorageReport;
