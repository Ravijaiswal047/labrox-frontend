import React, { useState } from "react";
import Input from "../../../components/formComponent/Input";
import { useTranslation } from "react-i18next";
import { Button } from "react-bootstrap";
import Heading from "../../../components/UI/Heading";
import CustomTable from "../../../components/Table/CustomTable";
import ColorCodingSearch from "../../../components/ModalComponent/ColorCodingSearch";

const SampleSearch = () => {
  const { t } = useTranslation();
  const initialState = {
    SINNo: "",
    VisitNo: "",
  };
  const [payload, setPayload] = useState(initialState);
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPayload((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? "1" : "0") : value,
    }));
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
    { header: "Status", field: "status" },
    { header: "#", field: "actions", width: "5%" },
  ];

  const [tableData, setTableData] = useState([
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
      status: "Active",
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
      status: "Inactive",
    },
    {
      sno: 3,
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
      status: "Inactive",
    },
  ]);
  const formattedData = tableData.map((item, index) => ({
    ...item,
    srNo: index + 1,
  }));
  const colorCodingData = [
    { color: "#f4f74f", id: "15", labelKey: "Sample Stored" },
    { color: "#FFC0CB", id: "7", labelKey: "Sample Discard	" },
    { color: "#90EE90", id: "8", labelKey: "Sample Issued" },
  ];
  return (
    <>
      <div className="card">
        <Heading name={t("Sample Search")} isBreadcrumb={true} />
        <div className="row p-2">
          <Input
            type="text"
            placeholder=" "
            lable={t("SIN No / Visit ID")}
            id="SINNo"
            name="SINNo"
            value={payload?.SINNo}
            onChange={handleChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <div className="col-sm-2 d-flex">
            <Button className="rounded py-0 ">Search</Button>
            <Button className="rounded py-0 ml-2 bg-danger">Clear</Button>
          </div>
        </div>
      </div>
      <div className="card mt-2">
        <Heading
          name={t("Patient Detail")}
          secondTitle={
            <>
              <label className="text-danger px-4 mt-2"> Total Patient:3</label>
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
              //   onEdit={handleEdit}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default SampleSearch;
