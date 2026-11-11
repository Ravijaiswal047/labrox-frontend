import React, { useEffect, useRef, useMemo, useState } from "react";
import Heading from "../../../components/UI/Heading";
import Input from "../../../components/formComponent/Input";
import { useTranslation } from "react-i18next";
import ReactSelect from "../../../components/formComponent/ReactSelect";
import CustomTable from "../../../components/Table/CustomTable";
import { toast } from "react-toastify";
import { axiosInstance } from "../../../utils/axiosInstance";
import { ViewMenu } from "../../../components/SvgIcons";
import SeeMore from "../frameMenu/SeeMore";
import { useNavigate } from "react-router-dom";
import SampleStorageDashboard from "../sampleStorageDashboad/SampleStorageDashboard";
import TrackMaster from "./TrackMaster";
import DeviceMaster from "./DeviceMaster";
import Issue from "../sampleStorage/Issue";
import Discard from "../sampleStorage/Discard";
import Storage from "../sampleStorage/Storage";
import { Button, Form } from "react-bootstrap";
import TableFilterDot from "../../Components/TableFilterDot";
import SampleDiscardReport from "../sampleStorage/SampleDiscardReport";
import MultiSelectComp from "../../../components/formComponent/MultiSelectComp";
import { SaveButton , CancelButton } from "../../../components/UI/CustomButton";
const TrayMaster = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showMore, setShowMore] = useState(false);
  const trayNameRef = useRef(null);
  const StorageCapacityRef = useRef(null);
  const CapMultiplyRef = useRef(null);
  const ExpirydurationRef = useRef(null);

  const initialState = {
    TrayName: "",
    StorageCapacity: "",
    CapMultiply: "",
    Expiryduration: "",
    ExpiryBy: "Days",
    Active: "1",
    SampleType: [],
  };

  const [payload, setPayload] = useState(initialState);
  const [isUpdate, setIsUpdate] = useState(false);
  const [masterTableData, setMasterTableData] = useState([]);
  const [sapmleType, setSampleType] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [filterInputValue, setFilterInputValue] = useState("");
  const [sampleTypeOptions, setSampleTypeOptions] = useState([]);
  const [searchText, setSearchText] = useState("");

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

  const ExpiryByOption = [
    { value: "Days", label: "Days" },
    { value: "Months", label: "Months" },
    { value: "Years", label: "Years" },
  ];


  const buildRequestBody = () => {
    const base = {
      TransactionType: isUpdate ? "Update" : "Insert",
      trayName: String(payload?.TrayName) || "",
      sampleTypeID: Array.isArray(payload?.SampleType)
        ? payload.SampleType.join(",") // ab sirf IDs hain
        : "",
      sampleTypeName: Array.isArray(payload?.SampleType)
        ? sampleTypeOptions
            .filter((opt) => payload.SampleType.includes(opt.value))
            .map((opt) => opt.label)
            .join(",")
        : "",
      capacity1: String(payload?.StorageCapacity) || "",
      capacity2: String(payload?.CapMultiply) || "",
      expiryUnit: String(payload?.Expiryduration) || "",
      expiryType: String(payload?.ExpiryBy) || "",
      isActive: Number(payload?.Active),
    };
    return isUpdate ? { ...base, id: payload?.id || 0 } : base;
  };

  const handleSave = async () => {
    if (!payload?.TrayName) {
      toast.error("Tray Name is Required");
      trayNameRef.current?.focus();
      return;
    }
    if (!payload?.StorageCapacity) {
      toast.error("Storage Capacity is Required");
      StorageCapacityRef.current?.focus();
      return;
    }
    if (!payload?.CapMultiply) {
      toast.error("Cap Multiply is Required");
      CapMultiplyRef.current?.focus();
      return;
    }
    if (!payload?.Expiryduration) {
      toast.error("Expiry duration is Required");
      ExpirydurationRef.current?.focus();
      return;
    }
    if (!payload?.SampleType?.length) {
      return toast.error("Sample Type is Required");
    }

    try {
      const reqBody = buildRequestBody();
      const response = await axiosInstance.post(
        "SampleStorage/SaveSampleTray",
        reqBody,
      );
      const { success, message } = response?.data || {};
      if (success) {
        toast.success(message || "Saved Successfully.");
        getBindSampleTray();
        setPayload(initialState);
        setIsUpdate(false);
        setFilterInputValue("");
        setTableData(masterTableData);
      } else {
        toast.error(message || "No data found.");
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Something went wrong!");
    }
  };

  const columns = [
    { header: "Sr. No.", field: "srNo", width: "3%" },
    { header: "Name", field: "Name" },
    { header: "Sample Type", field: "Sample Type" },
    { header: "Storage Capacity", field: "Storage Capacity" },
    { header: "Expiry Duration", field: "Expiry Duration" },
    { header: "Created By", field: "Created By" },
    { header: "Created On", field: "Created On" },
    { header: "Last Updated By", field: "Last Updated By" },
    { header: "Last Updated On", field: "Last Updated On" },
    { header: "Edit", field: "edit" },
  ];

  // const formattedData = filteredData.map((item, index) => {
  //   const sampleTypeFull = item.SampleTypeName || "";
  //   const sampleTypeShort =
  //     sampleTypeFull.length > 40
  //       ? sampleTypeFull.slice(0, 40) + "..."
  //       : sampleTypeFull;

  //   return {
  //     ...item,
  //     rowColor: item.IsActive === 1 ? "#90ee90" : "#ffb6c1",
  //     srNo: index + 1,
  //     Name: item?.TrayName,
  //     "Sample Type": (
  //       <Button variant="outline-primary" size="sm" title={sampleTypeFull}>
  //         {sampleTypeShort}
  //       </Button>
  //     ),
  //     "Storage Capacity": `${item.Capacity1} X ${item.Capacity2}`,
  //     "Expiry Duration": `${item.ExpiryUnit} ${item.ExpiryType}`,
  //     "Created By": item?.CreatedBy,
  //     "Created On": item?.dtEntry,
  //     "Last Updated By": item?.CreatedBy,
  //     "Last Updated On": item?.dtUpdate,
  //     edit: "edit",
  //   };
  // });
  const filteredData = useMemo(() => {
  let data = tableData;
  if (!searchText) return data;
  const search = searchText.toLowerCase();
  return data.filter(
    (item) =>
      String(item?.TrayName ?? "").toLowerCase().includes(search) ||
      String(item?.SampleTypeName ?? "").toLowerCase().includes(search) ||
      String(item?.CreatedBy ?? "").toLowerCase().includes(search) ||
      String(item?.dtEntry ?? "").toLowerCase().includes(search) ||
      String(item?.dtUpdate ?? "").toLowerCase().includes(search)
  );
}, [tableData, searchText]);

  const formattedData = filteredData.map((item, index) => {
  const sampleTypeFull = item.SampleTypeName || "";
  const sampleTypeShort =
    sampleTypeFull.length > 20
      ? sampleTypeFull.slice(0, 20) + "..."
      : sampleTypeFull;

  return {
    ...item,
    rowColor: item.IsActive === 1 ? "#90ee90" : "#ffb6c1",
    srNo: index + 1,
    Name: item?.TrayName,
    "Sample Type": (
      <Button variant="outline-primary" size="sm" title={sampleTypeFull}>
        {sampleTypeShort}
      </Button>
    ),
    "Storage Capacity": `${item.Capacity1} X ${item.Capacity2}`,
    "Expiry Duration": `${item.ExpiryUnit} ${item.ExpiryType}`,
    "Created By": item?.CreatedByName,
    "Created On": item?.dtEntry,
    "Last Updated By": item?.UpdatedByName,
    "Last Updated On": item?.dtUpdate,
    edit: "edit",
  };
});
  
  const handleEdit = (row) => {
    const selectedIds = row?.SampleTypeID?.split(",").map(Number) || [];

    setIsUpdate(true);
    setPayload({
      TrayName: String(row?.TrayName) || "",
      SampleType: selectedIds,
      StorageCapacity: String(row?.Capacity1) || "",
      CapMultiply: String(row?.Capacity2) || "",
      Expiryduration: String(row?.ExpiryUnit) || "",
      ExpiryBy: String(row?.ExpiryType) || "",
      Active: String(row?.IsActive),
      id: row?.ID,
    });
  };

  const getBindSample = async () => {
    axiosInstance
      .get("SampleStorage/BindSample")
      .then((res) => {
        const { success, message } = res?.data || {};
        if (success && Array.isArray(message)) {
          setSampleType(message);
          setSampleTypeOptions(
            message.map((item) => ({
              label: item.samplename,
              value: item.id,
            })),
          );
        } else {
          setSampleType([]);
          toast.error(message || "No Sample Type found.");
        }
      })
      .catch((err) => {
        console.error(err);
        setSampleType([]);
        toast.error(err?.response?.data?.message || "Something Went Wrong!");
      });
  };

  const getBindSampleTray = async () => {
    const reqBody = {
      type: "StorageTrayMaster",
      centreID: 0,
      departmentID: "",
      storageTypeID: 0,
      sampleType: "",
      trayID: "",
      deviceID: 0,
      rackID: "",
      barcodeNo: "",
      sampleTypeID: 0,
    };
    axiosInstance
      .post("SampleStorage/GetMaster", reqBody)
      .then((res) => {
        const { success, message } = res?.data || {};
        if (success && Array.isArray(message)) {
          setTableData(message);
          setMasterTableData(message);
        } else {
          setTableData([]);
          setMasterTableData([]);
          toast.error(message || "No Data found.");
        }
      })
      .catch((err) => {
        console.error(err);
        setTableData([]);
        setMasterTableData([]);
        toast.error(err?.response?.data?.message || "Something Went Wrong!");
      });
  };

  useEffect(() => {
    getBindSample();
    getBindSampleTray();
  }, []);

  const handleFilterInputChange = (e) => {
    setFilterInputValue(e);
    if (e === "" || e === null || e === undefined) {
      setTableData(masterTableData);
      return;
    }
    const filtered = masterTableData.filter(
      (row) => String(row.IsActive) === String(e),
    );
    setTableData(filtered);
  };


  const handleSelectMultiChange = (name, value) => {
    setPayload((prev) => ({ ...prev, [name]: value }));
  };

  const statusCount = (sType) => {
    return masterTableData?.filter((items) => items?.IsActive === sType)
      ?.length;
  };

  const handleClear = () => {
    setPayload(initialState);
    setIsUpdate(false);
    setFilterInputValue("");
    setTableData(masterTableData);
  };

  const seeMoreData = [
    {
      name: "Sample Storage Dashboard",
      component: <SampleStorageDashboard setShowMore={setShowMore} />,
      url: "/Dashboard#samplestoragedashboard",
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
      component: <Storage setShowMore={setShowMore} />,
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
      <div className="card tray-master-heading">
        <Heading
          name={"Tray Master"}
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
            lable={t("Tray Name")}
            id="TrayName"
            name="TrayName"
            value={payload?.TrayName}
            onChange={handleChange}
            className={"required-fields"}
            inputRef={trayNameRef}
            respclass={"col-12 col-sm-6 col-md-2 my-1"}
          />
          <div className="col-12 col-sm-6 col-md-2 my-1 d-flex align-items-start">
            <Input
              type="number"
              placeholder=" "
              lable={t("Storage Capacity")}
              id="StorageCapacity"
              name="StorageCapacity"
              value={payload?.StorageCapacity}
              onChange={handleChange}
              className={"required-fields"}
              inputRef={StorageCapacityRef}
              respclass={"w-100 mr-1"}
            />
            <i className="fas fa-times mt-2"></i>
            <Input
              type="number"
              placeholder=" "
              lable={t("Cap Multiply")}
              id="CapMultiply"
              name="CapMultiply"
              value={payload?.CapMultiply}
              onChange={handleChange}
              respclass={"w-30 ml-1"}
              inputRef={CapMultiplyRef}
              className={"required-fields"}
            />
          </div>
          <div className="col-12 col-sm-6 col-md-2 my-1">
            <Input
              type="number"
              placeholder=" "
              lable={t("Expiry duration")}
              id="Expiryduration"
              name="Expiryduration"
              value={payload?.Expiryduration}
              onChange={handleChange}
              // respclass={"w-50 mr-1"}
              inputRef={ExpirydurationRef}
              className={`required-fields`}
            />
            </div>
            <div  className="col-12 col-sm-6 col-md-2 my-1">
            <ReactSelect
              name="ExpiryBy"
              id="ExpiryBy"
              removeIsClearable={true}
              dynamicOptions={ExpiryByOption}
              placeholderName="ExpiryBy"
              value={payload?.ExpiryBy}
              onChange={handleSelectChange}
              // respclass={"w-50"}
            />
            </div>
          <MultiSelectComp
            className="col-12 col-sm-6 col-md-2 my-1"
            name="SampleType"
            id="SampleType"
            label="Sample Type"
            options={sampleTypeOptions}
            value={payload?.SampleType}
            onChange={(name, val) =>
              setPayload((prev) => ({ ...prev, [name]: val }))
            }
            requiredClassName="required-fields"
          />

          <Form.Check
            type="switch"
            id="custom-switch"
            label="Status"
            className="ml-2 col-auto d-flex align-items-start mt-1"
            checked={payload?.Active === "1"}
            onChange={(e) =>
              setPayload((prev) => ({
                ...prev,
                Active: e.target.checked ? "1" : "0",
              }))
            }
          />

          <div className="col-auto d-flex align-items-start mt-1" style={{gap: "4px"}}>
            <SaveButton
              onClick={handleSave}
              text={isUpdate ? t("Update") : t("Save")}
            />
            <CancelButton
              onClick={handleClear}
              text={t("Clear")}
            />
          </div>
        </div>
      </div>

      <div className="card mt-2 tray-detail-heading">
        <Heading
          title={t("Tray Master Details")}
          secondTitle={
            <>
              <span className="d-none d-md-inline-flex" style={{ gap: "4px" }}>
                <TableFilterDot
                  onClick={() =>
                    filterInputValue === 1
                      ? handleFilterInputChange("")
                      : handleFilterInputChange(1)
                  }
                  color={"#90EE90"}
                  title={`Active ${statusCount(1)}`}
                />
                <TableFilterDot
                  onClick={() =>
                    filterInputValue === 0
                      ? handleFilterInputChange("")
                      : handleFilterInputChange(0)
                  }
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
                  placeholder="Search Tray Master"
                  value={searchText}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="mt-2"
                />
              </div>
            </>
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

export default TrayMaster;
