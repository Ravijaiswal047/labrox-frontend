import React, { useEffect, useState, useMemo } from "react";
import Heading from "../../../components/UI/Heading";
import Input from "../../../components/formComponent/Input";
import { useTranslation } from "react-i18next";
import ReactSelect from "../../../components/formComponent/ReactSelect";
import MultiSelctItems from "../../../components/formComponent/MultiSelctItems";
import RadioInput from "../../../components/formComponent/RadioInput";
import CustomTable from "../../../components/Table/CustomTable";
import { getDepartment } from "../../../utils/NetworkApi/commonApi";
import { axiosInstance } from "../../../utils/axiosInstance";
import { toast } from "react-toastify";
import { ViewMenu } from "../../../components/SvgIcons";
import { useNavigate } from "react-router-dom";
import SeeMore from "../frameMenu/SeeMore";
import SampleStorageDashboard from "../sampleStorageDashboad/SampleStorageDashboard";
import TrayMaster from "./TrayMaster";
import TrackMaster from "./TrackMaster";
import SampleStorage from "../sampleStorage/SampleStorage";
import Issue from "../sampleStorage/Issue";
import Discard from "../sampleStorage/Discard";
import { Button, Form } from "react-bootstrap";
import TableFilterDot from "../../Components/TableFilterDot";
import SampleDiscardReport from "../sampleStorage/SampleDiscardReport";
import MultiSelectComp from "../../../components/formComponent/MultiSelectComp";
import { SaveButton } from "../../../components/UI/CustomButton";
import "./DeviceMaster.css";

const DeviceMaster = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const initialState = {
    Centre: "",
    StorageType: "",
    Department: [],
    DeviceName: "",
    ManufactureName: "",
    ModelNumber: "",
    NoofRack: "",
    SerialNumber: "",
    Active: "1",
  };
  const [payload, setPayload] = useState(initialState);
  const [masterTableData, setMasterTableData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [errors, setErrors] = useState({});
  const [isUpdate, setIsUpdate] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [DropDownList, setDropDownList] = useState({
    centrelist: [],
    departmentlist: [],
    samplestoragelist: [],
  });
  const [filterInputValue, setFilterInputValue] = useState("");
  const [searchText, setSearchText] = useState("");
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

  const fetchAllCenter = () => {
    axiosInstance
      .get("Employee/GetAllCentres")
      .then((res) => {
        const data = res?.data?.message;
        const val = data.map((ele) => {
          return {
            value: ele?.CentreID,
            label: ele?.Centre,
          };
        });
        setDropDownList((prev) => ({ ...prev, centrelist: val }));
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const fetchStorageType = () => {
    axiosInstance
      .post("SampleStorage/BindStorageType")
      .then((res) => {
        const data = res?.data?.message;
        const val = data.map((ele) => {
          return {
            value: ele?.id,
            label: ele?.StorageType,
          };
        });
        setDropDownList((prev) => ({ ...prev, samplestoragelist: val }));
      })
      .catch((err) => {
        console.log(err);
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

  const handleSelectMultiChange = (name, value) => {
    setPayload((prev) => ({ ...prev, [name]: value }));
  };
  const ExpiryByOption = [
    { value: "Days", label: "Days" },
    { value: "Months", label: "Months" },
    { value: "Years", label: "Years" },
  ];

  const columns = [
    { header: "Sr. No.", field: "srNo", width: "3%" },
    { header: "Centre", field: "Centre" },
    { header: "Storage Type", field: "Storage Type" },
    { header: "Department", field: "department" },
    { header: "Device Name", field: "Device Name" },
    { header: "Manufacture Name", field: "StorageDeviceMaster" },
    { header: "Model No", field: "Model No" },
    { header: "No of Rack", field: "No of Rack" },
    { header: "Serial Number", field: "SerialNumber" },
    { header: "Created By", field: "Created By" },
    { header: "Updated By", field: "UpdatedByNameBy" },
    { header: "Edit", field: "edit" },
  ];

  console.log("tableData::::", tableData);
  const filteredData = useMemo(() => {
    let data = tableData;
    if (!searchText) return data;
    const search = searchText.toLowerCase();
    return data.filter(
      (item) =>
        String(item?.DeviceName ?? "").toLowerCase().includes(search) ||
        String(item?.StorageType ?? "").toLowerCase().includes(search) ||
        String(item?.ManufactureName ?? "").toLowerCase().includes(search) ||
        String(item?.ModelNumber ?? "").toLowerCase().includes(search) ||
        String(item?.SerialNumber ?? "").toLowerCase().includes(search) ||
        String(item?.CreatedByName ?? "").toLowerCase().includes(search) ||
        String(item?.depanme ?? "").toLowerCase().includes(search)
    );
  }, [tableData, searchText]);


  const formattedData = filteredData?.map((item, index) => {
    const fullDepartment = item.DepartmentName || "";
    const departmentShort =
      fullDepartment?.length > 20
        ? fullDepartment.slice(0, 20) + "..."
        : fullDepartment;
    return {
      ...item,
      srNo: index + 1,
      rowColor: item.IsActive === true ? "#90ee90" : "#ffb6c1",
      Centre: item.CentreName,
      "Storage Type": item?.StorageType,
      department: (
        <Button variant="outline-primary" size="sm" title={fullDepartment}>
          {departmentShort || "-"}
        </Button>
      ),
      "Device Name": item?.DeviceName,
      StorageDeviceMaster: item?.ManufactureName,
      "No of Rack": item?.NumberOfRack,
      "Model No": item?.ModelNumber,
      SerialNumber: item?.SerialNumber,
      "Created By": (
        <div>
          <p className="mb-1">{item?.CreatedByName || "-"}</p>
          <p className="mb-1">{item?.dtEntry || "-"}</p>
        </div>
      ),
      UpdatedByNameBy: (
        <div>
          <p className="mb-1">{item?.UpdatedByName || "-"}</p>
          <p className="mb-1">{item?.dtUpdate || "-"}</p>
        </div>
      ),
      edit: "edit",
    };
  });

  const handleEdit = (row) => {
    const selectedDepartment = DropDownList?.departmentlist
      ?.filter((item) => row?.DepartmentID?.includes(String(item?.value)))
      ?.map((item) => item?.value);
    setIsUpdate(true);
    setPayload({
      Centre: row.CentreID,
      StorageType: row.StorageTypeID,
      Department: selectedDepartment,
      DeviceName: row.DeviceName,
      ManufactureName: row.ManufactureName,
      ModelNumber: row.ModelNumber,
      NoofRack: row.NumberOfRack,
      SerialNumber: row.SerialNumber,
      Active: row.IsActive ? "1" : "0",
      id: row?.ID,
    });
  };
  const handleChangeSearch = (event) => {
    const { value } = event.target;
    const filtered = masterTableData.filter(
      (item) =>
        item.Centre?.toLowerCase().includes(value.toLowerCase()) ||
        item.StorageType?.toLowerCase().includes(value.toLowerCase()) ||
        item.DeviceName?.toLowerCase().includes(value.toLowerCase()) ||
        item.CreatedBy?.toLowerCase().includes(value.toLowerCase()) ||
        item.status?.toLowerCase().includes(value.toLowerCase()) ||
        item.ManufactureName?.toLowerCase().includes(value.toLowerCase()) ||
        item.SerialNumber?.toLowerCase().includes(value.toLowerCase()) ||
        item.ModelNumber?.toLowerCase().includes(value.toLowerCase()),
    );
    setTableData(filtered);
  };
  const handlePayloadMultiSelectNumbers = (data) => {
    if (!Array.isArray(data)) return [];
    return data.map((item) => Number(item));
  };
  const buildRequestBody = () => {
    const base = {
      centreID: String(payload?.Centre) || "",
      departmentID: handlePayloadMultiSelectNumbers(payload?.Department) || [],
      storageTypeID: String(payload?.StorageType) || "",
      deviceName: String(payload?.DeviceName) || "",
      manufactureName: String(payload?.ManufactureName) || "",
      modelNumber: String(payload?.ModelNumber) || "",
      serialNumber: String(payload?.SerialNumber) || "",
      numberOfRack: Number(payload?.NoofRack) || 0,
      isActive: Number(payload?.Active),
      TransactionType: isUpdate ? "Update" : "Insert",
    };

    return isUpdate ? { ...base, id: payload?.id || 0 } : base;
  };

  const handleSave = async () => {
    let tempErrors = {};
    if (!payload?.Centre) tempErrors.Centre = "This Field Required";
    if (!payload?.StorageType) tempErrors.StorageType = "This Field Required";
    if (!payload?.DeviceName) tempErrors.DeviceName = "This Field Required";
    if (!payload?.ManufactureName)
      tempErrors.ManufactureName = "This Field Required";
    if (!payload?.NoofRack) tempErrors.NoofRack = "This Field Required";
    if (!payload?.SerialNumber) tempErrors.SerialNumber = "This Field Required";
    if (!payload?.Active === "1")
      tempErrors.SerialNumber = "This Field Required";

    setErrors(tempErrors);

    if (Object.keys(tempErrors).length > 0) return;
    const url = isUpdate
      ? "SampleStorage/SaveStorageDevice"
      : "SampleStorage/SaveStorageDevice";

    try {
      const reqBody = buildRequestBody();
      const response = await axiosInstance.post(url, reqBody);
      const { success, message } = response?.data || {};
      if (success) {
        toast.success(message || "Saved Successfully.");
        fetchBindStorage();
        setPayload(initialState);
        setIsUpdate(false);
      } else {
        toast.error(message || "No data found.");
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Something went wrong!");
    }
  };

  const fetchBindStorage = async () => {
    try {
      const [activeRes, inactiveRes] = await Promise.all([
        axiosInstance.post("SampleStorage/GetSampleStorageDeviceMaster", { IsActive: 1 }),
        axiosInstance.post("SampleStorage/GetSampleStorageDeviceMaster", { IsActive: 0 }),
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
    return tableData?.filter((items) => items?.IsActive === sType)?.length;
  };
  const handleFilterInputChange = (e) => {
    console.log("handleFilterInputChange", e);

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
  useEffect(() => {
    getDepartment(
      (data) => {
        setDropDownList((prev) => ({ ...prev, departmentlist: data }));
      },
      "getDepartmentEmployeeMaster",
      false,
      null,
    );
    fetchAllCenter();
    fetchStorageType();
    fetchBindStorage();
  }, []);

  console.log("dropdownlist", DropDownList);

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
      <div className="card dm-device-heading">
        <Heading
          name={"Sample Storage Device Master"}
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
          <div className="col-12 col-sm-6 col-md-2 my-1">
            <ReactSelect
              name="Centre"
              id="Centre"
              removeIsClearable={true}
              dynamicOptions={DropDownList?.centrelist}
              placeholderName="Centre"
              value={payload?.Centre}
              onChange={handleSelectChange}
              respclass={""}
            />
            {errors?.Centre && (
              <div className="text-danger" style={{ fontSize: "12px" }}>
                {errors?.Centre}
              </div>
            )}
          </div>
          <div className="col-12 col-sm-6 col-md-2 my-1">
            <ReactSelect
              name="StorageType"
              id="StorageType"
              removeIsClearable={true}
              dynamicOptions={DropDownList?.samplestoragelist}
              placeholderName="Storage Type"
              value={payload?.StorageType}
              onChange={handleSelectChange}
              respclass={""}
            />
            {errors?.StorageType && (
              <div className="text-danger" style={{ fontSize: "12px" }}>
                {errors?.StorageType}
              </div>
            )}
          </div>
          {/* <MultiSelectComp
            placeholderName="Department"
            name="Department"
            values={payload}
            setValues={setPayload}
            onChange={handleSelectMultiChange}
            options={DropDownList?.departmentlist}
            labelKey="label"
            valueKey="value"
          /> */}
          <MultiSelectComp
            className="col-12 col-sm-6 col-md-2 my-1"
            placeholder=" "
            label="Department"
            name="Department"
            id="Department"
            value={payload?.Department}
            onChange={handleSelectMultiChange}
            options={DropDownList?.departmentlist}
          />
          <div className="col-12 col-sm-6 col-md-2 my-1">
            <Input
              type="text"
              placeholder=" "
              lable={t("Device Name")}
              id="DeviceName"
              name="DeviceName"
              value={payload?.DeviceName}
              onChange={handleChange}
              respclass={""}
            />
            {errors?.DeviceName && (
              <div className="text-danger" style={{ fontSize: "12px" }}>
                {errors?.DeviceName}
              </div>
            )}
          </div>
          <div className="col-12 col-sm-6 col-md-2 my-1">
            <Input
              type="text"
              placeholder=" "
              lable={t("Manufacture Name")}
              id="ManufactureName"
              name="ManufactureName"
              value={payload?.ManufactureName}
              onChange={handleChange}
              respclass={""}
            />
            {errors?.ManufactureName && (
              <div className="text-danger" style={{ fontSize: "12px" }}>
                {errors?.ManufactureName}
              </div>
            )}
          </div>

          <div className="col-12 col-sm-6 col-md-2 my-1">
            <Input
              type="text"
              placeholder=" "
              lable={t("Model Number")}
              id="ModelNumber"
              name="ModelNumber"
              value={payload?.ModelNumber}
              onChange={handleChange}
            />
          </div>

          <div className="col-xl-2 col-sm-4 col-md-6 co-12">
            <Input
              type="number"
              placeholder=" "
              lable={t("No of Rack")}
              id="NoofRack"
              name="NoofRack"
              value={payload?.NoofRack}
              onChange={handleChange}
              respclass={""}
            />
            {errors?.NoofRack && (
              <div className="text-danger" style={{ fontSize: "12px" }}>
                {errors?.NoofRack}
              </div>
            )}
          </div>
          <div className="col-12 col-sm-6 col-md-2 my-1">
            <Input
              type="text"
              placeholder=" "
              lable={t("Serial Number")}
              id="SerialNumber"
              name="SerialNumber"
              value={payload?.SerialNumber}
              onChange={handleChange}
              respclass={""}
            />
            {errors?.SerialNumber && (
              <div className="text-danger" style={{ fontSize: "12px" }}>
                {errors?.SerialNumber}
              </div>
            )}
          </div>
          <div className="col-auto my-1">
            {/* <RadioInput
              inputType="checkbox"
              label="Active"
              id="Active"
              name="Active"
              value={payload?.Active === "1"}
              onChange={handleChange}
              respclass={""}
              color="text-danger"
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
            {errors?.SerialNumber && (
              <div className="text-danger" style={{ fontSize: "12px" }}>
                {errors?.SerialNumber}
              </div>
            )}
          </div>
          <div className="col-auto">
            <SaveButton
              onClick={handleSave}
              text={isUpdate ? t("Update") : t("Save")}
            />
          </div>
        </div>
      </div>
      <div className="card mt-2 dm-search-heading">
        {/* <Heading
          name={t("Device  List")}
          isBreadcrumb={true}
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
            </>
          }
        /> */}
        <Heading
          title={t("Device List")}
          secondTitle={
            <>
              <div
                style={{ gap: "8px" }}
                className="d-flex align-items-center justify-content-end px-2"
              >
                <div className="d-none d-md-flex align-items-center" style={{ gap: "4px" }}>
                  <TableFilterDot
                    onClick={() => handleFilterInputChange(true)}
                    color={"#90EE90"}
                    title={`Active ${statusCount(true)}`}
                  />
                  <TableFilterDot
                    onClick={() => handleFilterInputChange(false)}
                    color={"#FFB6C1"}
                    title={`Inactive ${statusCount(false)}`}
                  />
                </div>
                <Input
                  type="text"
                  placeholder="Search Storage Device"
                  value={searchText}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => setSearchText(e.target.value)}
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

export default DeviceMaster;
