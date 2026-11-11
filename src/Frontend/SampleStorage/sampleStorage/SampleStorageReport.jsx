import React, { useEffect, useState, useMemo } from "react";
import DatePicker from "../../../components/formComponent/DatePicker";
import { SelectBoxWithCheckbox } from "../../../components/formComponent/MultiSelectBox";
import SampleStorageDashboard from "../sampleStorageDashboad/SampleStorageDashboard";
import Input from "../../../components/formComponent/Input";
import { Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import Heading from "../../../components/UI/Heading";
import CustomTable from "../../../components/Table/CustomTable";
// import ColorCodingSearch from "../../../components/ModalComponent/ColorCodingSearch";
// import { SearchBy } from "../../../utils/Constants";
import ReactSelect from "../../../components/formComponent/ReactSelect";
// import { number } from "../../../utils/helpers";
import { useNavigate } from "react-router-dom";
import { PlusIcon, ViewMenu } from "../../../components/SvgIcons";
import DeviceMaster from "../sampleStorageMaster/DeviceMaster";
import TrackMaster from "../sampleStorageMaster/TrackMaster";
import TrayMaster from "../sampleStorageMaster/TrayMaster";
import Modal from "../../../components/ModalComponent/Modal";
// import SubCategoryTypeMasterModel from "../../Store/storeMaster/storeItemMaster/SubCategoryTypeMasterModel";
// import IssueModal from "./IssueModal";
// import MultiSelctItems from "../../../components/formComponent/MultiSelctItems";
import { axiosInstance } from "../../../utils/axiosInstance";
import TableFilterDot from "../../Components/TableFilterDot";
import SampleDiscardReport from "./SampleDiscardReport";
import { ExportToExcel } from "../../../utils/helpers";
import { apiUrls } from "../../../utils/apiEndpoints";
import SampleStorage from "./SampleStorage";
import SeeMore from "../frameMenu/SeeMore";
import { toast } from "react-toastify";
import Discard from "./Discard";
import { CustomButton, SearchButton } from "../../../components/UI/CustomButton";
import "./SampleStorageReport.css";

const reportTypeList = [
  { label: "Select", value: "0" },
  { label: "SampleDiscardReport", value: "SampleDiscardReport" },
  { label: "SampleIssueReport", value: "SampleIssueReport" },
  { label: "SampleStorage", value: "SampleStorage" },
];

const SampleStorageReport = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const initialState = {
    FromDate: new Date(),
    ToDate: new Date(),
    Centre: [],
    ItemValue: "",
    DateTypes: "2",
    SampleType: "",
    // Device: "",
    sampleType: [],
    device: [],
    ReportType: "SampleStorage",
  };
  const [showMore, setShowMore] = useState(false);
  const [payload, setPayload] = useState(initialState);
  const [masterTableData, setMasterTableData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [modalData, setModalData] = useState({});
  const [handleModelData, setHandleModelData] = useState({});
  const [DropDownList, setDropDownList] = useState({
    centrelist: [],
    departmentlist: [],
    samplestoragelist: [],
    sampleList: [],
    devideList: [],
  });
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
    // { header: "S.No.", field: "sno", width: "3%" },
    { header: "S.No.", field: "sno" },
    // { header: "Visit No.", field: "visitNo" },
    { header: "Visit No./UHID", field: "uhid" },
    { header: "Name/Age", field: "pname" },
    // { header: "Age/Sex", field: "ageSex" },
    { header: "BookingCentre", field: "bookingCentre" },
    { header: "StorageCentre", field: "storageCentre" },
    { header: "SampleType", field: "sampleType" },
    { header: "DeviceName", field: "deviceName" },
    { header: "RackNumber", field: "rackNumber" },
    { header: "TrayNumber", field: "trayNumber" },
    { header: "SlotNumber", field: "slotNumber" },
    // { header: "Edit", field: "edit" },
  ];

  const filteredDisplayData = useMemo(() => {
    if (!searchText) return tableData;
    const s = searchText.toLowerCase();
    return masterTableData.filter((row) =>
      Object.values(row).some((v) => String(v ?? "").toLowerCase().includes(s))
    );
  }, [tableData, masterTableData, searchText]);

  const formattedData = filteredDisplayData?.map((row, index) => ({
    // sno: index + 1,
    sno: index + 1 || "",
    // visitNo: row?.SINNo || "",
    uhid: <div>
        <p className="mb-1">V. No.: {row?.VisitNo || ""}</p>
        <p className="mb-0">UHID: {row?.Uhid}</p>
    </div>,
    // pname: row?.pname || "",
    pname: <div>
        <p className="mb-1">{row?.PName || ""}</p>
        <p className="mb-0">{row?.Age}/{row?.Gender === 'Male' ? 'M' : 'F'}</p>
    </div>,
    // ageSex: `${row?.age}/${row?.gender === 'Male' ? 'M' : 'F'}` || "",
    bookingCentre: row?.bookingcentre || "",
    storageCentre: row?.StorageCentre || "-",
    sampleType: row?.SampleTypeName || "",
    deviceName: row?.DeviceName || "",
    rackNumber: row?.RackNumber ? `Rack ${row.RackNumber}` : "",
    trayNumber: row?.TrayCode || "",
    slotNumber: row?.SlotNumber || "",
    // rowColor: 
  }));

  const handleEdit = (row) => {
    console.log("Editing row:", row);
    // setIsUpdate(true);
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
      name: "Sample Storage Report",
      component: <SampleDiscardReport setShowMore={setShowMore} />,
      url: "/SampleStorageReport",
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

  const fetchBindSample = () => {
    axiosInstance
      .get("SampleStorage/BindSample")
      .then((res) => {
        const data = res?.data?.message;
        const val = data?.map((ele) => {
          return {
            value: String(ele?.id),
            label: ele?.samplename,
          };
        });
        setDropDownList((prev) => ({
          ...prev,
          sampleList: [...val],
        }));
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // const fetchDevice = async (type) => {
  //   debugger;
  //   await axiosInstance
  //     .post(apiUrls?.Fetchprocedure, {
  //       typeName: "GetStorageDeviceMaster",
  //       params: [],
  //     })
  //     .then((res) => {
  //       const resData = res?.data?.data;
  //       console.log("device", resData);
  //       const val = resData.map((ele) => ({
  //         ...ele,
  //         value: String(ele.ID),
  //         label: ele.DeviceName,
  //       }));

  //       setDropDownList((prev) => ({ ...prev, devideList: [...val] }));
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //     });
  // };

// fetchDevice ko clean karo
const fetchDevice = async () => {
  try {
    const res = await axiosInstance.post(apiUrls?.Fetchprocedure, {
      typeName: "GetStorageDeviceMaster",
      params: [],
    });

    const resData = res?.data?.data;

    if (!Array.isArray(resData)) {
      console.error("Device API response galat hai:", res?.data);
      return;
    }

    const val = resData.map((ele) => ({
      ...ele,
      value: String(ele.ID),
      label: ele.DeviceName,
    }));

    setDropDownList((prev) => ({ ...prev, devideList: val }));
  } catch (err) {
    console.error("fetchDevice error:", err?.response?.data || err.message);
  }
};

// useEffect alag karo
useEffect(() => {
  fetchBindSample();
  fetchDevice();      // sirf mount pe ek baar
  fetchAllCenter();
}, []); // ← empty dependency

useEffect(() => {
  setHandleModelData((val) => ({ ...val, modalData: modalData }));
}, [modalData]); // ← sirf modal ke liye

  const fetchAllCenter = () => {
    axiosInstance
      .get("Employee/GetAllCentres")
      .then((res) => {
        const data = res?.data?.message || [];
        const val = data.map((ele) => ({
          value: ele.CentreID,
          label: ele.Centre,
        }));
        setDropDownList((prev) => ({ ...prev, centrelist: val }));
      })
      .catch((err) => {
        console.error(err);
      });
  };

  useEffect(() => {
    setHandleModelData((val) => ({ ...val, modalData: modalData }));
    fetchBindSample();
    fetchDevice();
  }, [modalData]);

  const setIsOpen = () => {
    setHandleModelData((val) => ({ ...val, isOpen: false }));
  };
  const handleChangeModel = (data) => {
    setModalData(data);
  };
  const handleSearch = async () => {
    if(payload?.ReportType === "0"){
      toast.error("Please select report type");
      return;
    }
    const reqBody = {
      transactionType: payload?.ReportType,
      dateFrom: payload?.FromDate
        ? new Date(payload.FromDate).toISOString().slice(0, 10)
        : "",
      dateTo: payload?.ToDate
        ? new Date(payload.ToDate).toISOString().slice(0, 10)
        : "",
      sinNo: "",
      sampleTypeID:
        payload?.ReportType === "SampleStorage" ? payload?.sampleType?.join(',') : '',
      deviceID:
        payload?.ReportType === "SampleStorage" ? payload?.device?.join(',') : '',
        centreID: payload?.Centre?.join(',')
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
  const statusCount = (sType) => {
    return tableData?.filter((items) => items?.IsActive === sType)?.length;
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

    setTableData(filtered);
  };

  const handleSelectMultiChange = (select, name) => {
    const val = select.map((ele) => {
      return ele?.value;
    });
    console.log('object', val);
    setPayload((prev) => ({ ...prev, [name]: val }));
  };

  useEffect(() => {
    fetchAllCenter();
  }, []);

  console.log("formattedData",formattedData,tableData);
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
      <div className="card ssr-main-heading">
        <Heading
          name={"Sample Storage Report"}
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
          <ReactSelect
            name="ReportType"
            id="ReportType"
            removeIsClearable={true}
            dynamicOptions={reportTypeList}
            placeholderName="ReportType"
            value={payload?.ReportType}
            onChange={handleSelectChange}
            respclass={"col-12 col-sm-6 col-md-2 my-1"}
          />

          <div className="col-12 col-sm-6 col-md-2 my-1">
            <SelectBoxWithCheckbox
              name="sampleType"
              className="required-fields"
              placeholder=" "
              lable="Sample Type"
              id="sampleType"
              onChange={handleSelectMultiChange}
              options={DropDownList?.sampleList || []}
              value={payload?.sampleType}
            />
          </div>
          <div className="col-12 col-sm-6 col-md-2 my-1">
            <SelectBoxWithCheckbox
              name="device"
              className="required-fields"
              placeholder=" "
              lable="Device Type"
              id="device"
              onChange={handleSelectMultiChange}
              options={DropDownList?.devideList || []}
              value={payload?.device}
            />
          </div>

          <div className="col-12 col-sm-6 col-md-2 my-1">
            <SelectBoxWithCheckbox
              name="Centre"
              className="required-fields"
              placeholder=" "
              lable="Centre"
              id="Centre"
              onChange={handleSelectMultiChange}
              options={DropDownList?.centrelist || []}
              value={payload?.Centre}
            />
          </div>
          <DatePicker
            name="FromDate"
            id="FromDate"
            value={payload?.FromDate}
            onChange={dateSelect}
            maxDate={new Date()}
            placeholder=""
            lable={t("From Date")}
            className="custom-calendar"
            respclass={"col-12 col-sm-6 col-md-2 my-1"}
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
            respclass={"col-12 col-sm-6 col-md-2 my-1"}
          />
          {/* <div className="w-100 d-flex align-items-center justify-content-center my-2"> */}
            <div className="col-xl-2 col-sm-4 col-md-6 col-12">
              <SearchButton className="rounded py-0 mr-2" onClick={handleSearch}
                 text={t("Search")}
              />
            {/* </div>   */}
            {/* <div className="col-sm-2"> */}
            <CustomButton
              icon={"excel"}
              text={"Excel"}
              onClick={() =>
                ExportToExcel(
                  tableData?.map((item, index) => ({
                    "Sr.No": index + 1,
                    ...item,
                  }))
                )
              }
              disabled={tableData?.length === 0}
            />
            </div>
          {/* </div> */}
        </div>
      </div>

      <div className="card mt-2 ssr-patient-heading">
        <Heading
          title={t("Patient Detail")}
          secondTitle={
            <div style={{ gap: "6px" }} className="d-flex align-items-center">
              <div className="d-none d-md-flex align-items-center" style={{ gap: "4px" }}>
                <TableFilterDot
                  onClick={() => handleFilterInputChange("Pending")}
                  color={"#FFFFFF"}
                  title={`Pending ${statusCount("Pending")}`}
                  bgColor={"#ebebebbf"}
                />
                <TableFilterDot
                  onClick={() => handleFilterInputChange(1)}
                  color={"#90EE90"}
                  title={`Active ${statusCount(1)}`}
                  bgColor={"#ebebebbf"}
                />
                <TableFilterDot
                  onClick={() => handleFilterInputChange(0)}
                  color={"#FFB6C1"}
                  title={`Inactive ${statusCount(0)}`}
                  bgColor={"#ebebebbf"}
                />
              </div>
              <Input
                type="text"
                placeholder="Search..."
                value={searchText}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
          }
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

export default SampleStorageReport;
