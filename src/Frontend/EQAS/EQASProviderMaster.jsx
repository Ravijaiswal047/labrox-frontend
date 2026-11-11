import React, { useEffect, useState } from "react";
import Heading from "../../components/UI/Heading";
import Input from "../../components/formComponent/Input";
import TextAreaInput from "../../components/formComponent/TextAreaInput";
import DatePicker from "../../components/formComponent/DatePicker";
import FileUpload from "../ManageQuery/FileUpload";
import CustomTable from "../../components/Table/CustomTable";
import "./EQASProviderMaster.css";
import Modal from "../../components/ModalComponent/Modal";
import ProviderProgramMasterModal from "./ProviderProgramMasterModal";
import { useDispatch } from "react-redux";
import EqasMenuList from "./EqasMenuList";
import { ViewMenu } from "../../components/SvgIcons";
import { useTranslation } from "react-i18next";
import { Form } from "react-bootstrap";
import { CustomButton } from "../../components/UI/CustomButton";
import { FaEdit, FaSearch } from "react-icons/fa";
import { formatStandardDate, number, validateRequiredFields } from "../../utils/helpers";
import { notify } from "../../utils/utils";
import { axiosInstance } from "../../utils/axiosInstance";
import { apiUrls } from "../../utils/apiUrls";
import { toast } from "react-toastify";
import { colorCodingDataNew } from "../../utils/Constants";
import ColorCodingSearch from "../../components/ModalComponent/ColorCodingSearch";
import FilterInput from "../../components/Filter/FilterInput";
import useGlobalSearch from "../../utils/CustomHooks/useGlobalSearch";
import { setFiles } from "../../store/reducers/fileUploadSlice/fileUploadSlice";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";

const tableHeaders = [
  { header: "S.No", field: "id", width: "3%" },
  { header: "Provider Name", field: "providerName", width: "10%" },
  { header: "Address", field: "address", width: "15%" },
  { header: "Contact No", field: "contactNo", width: "10%" },
  { header: "Contact Person", field: "contactPersonName", width: "10%" },
  { header: "Email", field: "email", width: "15%" },
  { header: "Renew Date", field: "renewDate", width: "10%" },
  { header: "Created By", field: "entryBy", width: "10%" },
  { header: "Created On", field: "entryDate", width: "10%" },
  { header: "Last Updated By", field: "updateBy", width: "12%" },
  { header: "Last Updated On", field: "updateDate", width: "12%" },
  { header: "Edit", field: "action", width: "8%" },
  { header: "Program", field: "program", width: "10%" },
];

const EQASProviderMaster = () => {
  const dispatch = useDispatch();
  const [showMenu, setShowMenu] = useState(false);
  const [eqasProviders, setEqasProviders] = useState([]);
  const [selectedRowId, setSelectedRowId] = useState("");
  const [providerModalOpen, setProviderModalOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const DefaultCurrencyName = useLocalStorage("userData", "get")?.DefaultCurrencyName

  const searchableKeys = [
    "providerName",
    "address",
    "contactNo",
    "contactPersonName", 
    "email",
  ];

  const {
    searchTerm,
    setSearchTerm,
    filteredData
  } = useGlobalSearch(eqasProviders, searchableKeys);
  const [errors, setErrors] = useState({});
  const { t } = useTranslation();
  const [payload, setPayload] = useState({
    provider: "",
    address: "",
    contactNo: "",
    contactPersonName: "",
    email: "",
    renewDate: new Date(),
    documents: {},
    isActive: 1,
    existingDocument: "",
    existingDocumentName: "",
    eqasID: "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "contactNo") {
      const numericValue = value.replace(/\D/g, "");

      setPayload((prev) => ({
        ...prev,
        [name]: numericValue,
      }));
      return;
    }
    setPayload((prev) =>
    ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value
    }));
  };

  const dateSelect = (value, name) => {
    setPayload((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileResponse = (file) => {
    if (file) {
      setPayload((prev) => ({ ...prev, documents: file, existingDocument: "", existingDocumentName: "" }));
    } else {
      setPayload((prev) => ({ ...prev, documents: {}, existingDocument: "", existingDocumentName: "" }));
    }
  };

  const handleReset = () => {
    setPayload({
      provider: "",
      address: "",
      contactNo: "",
      contactPersonName: "",
      email: "",
      renewDate: new Date(),
      documents: {},
      isActive: true,
      existingDocument: "",
      existingDocumentName: "",
      eqasID: "",
    });
    dispatch(setFiles([]));
    setErrors({});
    setEditRow(false);
  };

  const handleSave = () => {
    const requiredFields = [
      "provider",
    ];
    const errors = validateRequiredFields(payload, requiredFields);
    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      return;
    }
    const formData = new FormData();

    formData.append("LabName", payload?.provider || "");
    formData.append("LabAddress", payload?.address || "");
    formData.append("ContactNo", payload?.contactNo || "");
    formData.append("ContactPersonName", payload?.contactPersonName || "");
    formData.append("RenewDate", payload?.renewDate ? formatStandardDate(payload?.renewDate, "YYYY-MM-DD") :  "");
    formData.append("IsActive", payload?.isActive ? "1" : "0");
    formData.append("EmailAddress", payload?.email || "");

    // 🔥 File name
    formData.append("DocumentName", payload?.documents?.name || "");

    // 🔥 Actual file (binary)
    if (payload?.documents instanceof File) {
      formData.append("document", payload.documents);
    }

    console.log("formData entries:", [...formData.entries()]);

    axiosInstance
      .post(apiUrls?.SaveDataAgencyMaster, formData)
      .then((res) => {
        console.log("saveres", res);
        if (res?.data?.success) {
          toast.success(res?.data?.message);
          getEqasProviderData();
          handleReset();
        }
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Error Occured",
        );
      })
      .finally(() => {

      });
  };

  const getEqasProviderData = () => {

    axiosInstance
      .get(apiUrls?.SearchDataAgencyMaster)
      .then((res) => {
        if (res?.data?.success) {
          const apiData = res?.data?.data;
          const mappedData = apiData?.map((item, index) => ({
            id: index + 1, // S.No
            providerName: item?.EqasProviderName || "",
            address: item.EqasProviderAddress || "",
            contactNo: item.ContactNo || "",
            contactPersonName: item.ContactPersonname || "",
            email: item.EmailAddress || "",
            renewDate: item.RenewDate || "",
            status: item.IsActive || "",
            entryBy: item.CreatedByName || "",
            entryDate: item.EntryDate || "",
            updateBy: item.UpdateByName || "",
            updateDate: item.UpdateDate || "",
            originalRow: item, // keep full row for edit
            existingDocument: item?.Document || "",  // 👈 actual path
            existingDocumentName: item?.DocumentName || "", // 👈 display name
            rowColor: item.IsActive === "Active" ? "#75f975" : "#ffe58f", 
          }));

          setEqasProviders(mappedData);
          toast.success(res?.data?.data?.message);
        }
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Error Occured",
        );
      })
      .finally(() => {

      });
  };

  const handleUpdate = () => {
    const requiredFields = [
      "provider",
    ];
    const errors = validateRequiredFields(payload, requiredFields);
    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      return;
    }
    const formData = new FormData();
    formData.append("LabId", payload?.eqasID || "");
    formData.append("LabName", payload?.provider || "");
    formData.append("LabAddress", payload?.address || "");
    formData.append("ContactNo", payload?.contactNo || "");
    formData.append("ContactPersonName", payload?.contactPersonName || "");
    formData.append("RenewDate", payload?.renewDate ? formatStandardDate(payload?.renewDate, "YYYY-MM-DD") :  "");
    formData.append("IsActive", payload?.isActive ? "1" : "0");
    formData.append("EmailAddress", payload?.email || "");

    // 👇 If new file selected
    if (payload?.documents instanceof File) {
      formData.append("document", payload.documents);
      formData.append("DocumentName", payload.documents.name);
    } else {
      // 👇 If user did NOT change file
      formData.append("document", payload?.existingDocument || "");
      formData.append("DocumentName", payload?.existingDocumentName || "");
    }

    axiosInstance
      .post(apiUrls.UpdateDataAgencyMaster, formData)
      .then((res) => {
        console.log("update res", res);
        if (res?.data?.success) {
          toast.success(res?.data?.message || "Updated successfully");
          getEqasProviderData();
          handleReset();
        }

      })
      .catch(() => {
        toast.error("Update failed");
      });
  };

  const onRowEdit = (row) => {
    setEditRow(row);
    console.log(row);
    setPayload({
      provider: row?.EqasProviderName || "",
      address: row?.EqasProviderAddress || "",
      contactNo: row?.ContactNo || "",
      contactPersonName: row?.ContactPersonname || "",
      email: row?.EmailAddress || "",
      renewDate: row?.RenewDate
        ? new Date(row?.RenewDate)
        : new Date(),
      documents: {},
      existingDocument: row?.Document || "",  // 👈 actual path
      existingDocumentName: row?.DocumentName || "", // 👈 display name
      isActive: row?.IsActive === "Active" ? 1 : 0,
      eqasID: row?.EqasProviderID || "",
    });

    if (row?.DocumentName) {
      dispatch(
        setFiles([
          {
            name: row.DocumentName,
            size: 0,
            type: "existing-file",
            isExisting: true, 
          },
        ])
      );
    }
  };

  const handleModalToggle = (visible,row="") => {
    setProviderModalOpen(visible);
    setSelectedRowId(row?.EqasProviderID);
  };

  useEffect(() => {
    getEqasProviderData();
  }, []);

  console.log("payload", payload);
  console.log("eqas", eqasProviders);
  console.log("filtered", filteredData);

  return (
    <>
      {showMenu && <EqasMenuList />}
      <Heading
        name={"EQAS Provider Master"}
        isBreadcrumb={true}
        secondTitle={
          <label onClick={() => setShowMenu((prev) => !prev)}>
            <ViewMenu />
          </label>
        }
      />
      <div className="card px-2 py-2">
        <div className="row ">
          <div className="col-sm-3 col-md-2 mb-1">
            <Input
              type="text"
              name="provider"
              lable={t("EQAS Provider")}
              id="provider"
              value={payload.provider}
              placeholder=" "
              onChange={handleChange}
            />
            {payload?.provider === "" && (
              <span className="error-message">{errors?.provider}</span>
            )}
          </div>
          <div className="col-sm-3 col-md-2 mb-1">
            <TextAreaInput
              name="address"
              lable={t("Address")}
              id="address"
              value={payload.address}
              placeholder=" "
              rows={1}
              onChange={handleChange}
            />
          </div>
          <div className="col-sm-3 col-md-2 mb-1">
            <Input
              type="text"
              name="contactNo"
              lable={t("Contact No.")}
              onInput={(e) => number(e, DefaultCurrencyName == "KES" ? 14 : 10)}
              id="contactNo"
              value={payload.contactNo}
              placeholder=" "
              onChange={handleChange}
            />
          </div>
          <div className="col-sm-3 col-md-2 mb-1">
            <Input
              type="text"
              name="contactPersonName"
              lable={t("Contact Person Name")}
              id="contactPersonName"
              value={payload.contactPersonName}
              placeholder=" "
              onChange={handleChange}
            />
          </div>
          <div className="col-sm-3 col-md-2 mb-1">
            <Input
              type="email"
              name="email"
              lable={t("Email Address")}
              id="email"
              value={payload.email}
              placeholder=" "
              onChange={handleChange}
            />
          </div>
          <div className="col-sm-3 col-md-2 mb-1">
            <DatePicker
              name="renewDate"
              value={payload.renewDate}
              onChange={dateSelect}
              className="custom-calendar"
              placeholder=" "
              id="renewDate"
              lable={t("Re-new Date")}
            />
          </div>
          {/* <div className="col-md-2 col-lg-2 col-sm-3 mb-1 d-flex justify-content-between align-items-center"> */}
          <FileUpload
            placeholder="Upload Attachment"
            // allowedTypes={["image/png", "application/pdf"]}
            allowedTypes={[".pdf", ".png"]}
            onFileSelect={handleFileResponse}
            className="mr-4 ml-2 mb-1"
          />
          {/* </div> */}
          <Form.Check
            type="switch"
            id="isActive"
            name="isActive"
            label={t("Active")}
            onChange={handleChange}
            checked={payload.isActive}
            className="mr-4 ml-2 d-flex align-items-center mb-1"
          />
          {editRow ? (
            <CustomButton
              text="Update"
              icon="save"
              className="border-radius-15 margin mb-1"
              onClick={handleUpdate}
            />
          ) : (
            <CustomButton
              text="Save"
              icon="save"
              className="border-radius-15 margin mb-1"
              onClick={handleSave}
            />
          )}
          {/* <CustomButton text="Save" icon="save" className="border-radius-15 margin mb-1" onClick={handleSave} /> */}
          <CustomButton text="Reset" icon="refresh" className="border-radius-15 margin mb-1" onClick={handleReset} />
        </div>

      </div>
      <Heading
        title={"EQAS Provider Details"}
        secondTitle={
          <>
            {/* <div className="col-sm-12 d-flex justify-content-end gap-custom p-0"> */}
            {colorCodingDataNew?.map(({ color, labelKey, id }) => (
              <ColorCodingSearch
                key={id}
                color={color}
                label={t(labelKey)}
                // onClick={() => handleStatusFilter(id)}
                cursor="pointer"
              />
            ))}
            <FilterInput
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter Table"
              inputClass="transparent-background"
            />
            {/* </div> */}
          </>
        }
      />
      <div className="main_annoyingtable">
        <CustomTable
          columns={tableHeaders}
          data={filteredData?.map((row, idx) => ({
            ...row,
            id: idx + 1,
            action: <FaEdit onClick={() => onRowEdit(row?.originalRow)} color="#007bff" style={{ cursor: "pointer" }} />,
            program: <FaSearch onClick={() => handleModalToggle(true, row.originalRow)} color="#007bff" style={{ cursor: "pointer" }} />
          }))}
        />
      </div>
      <Modal
        Header={"EQAS Provider Program Master"}
        setVisible={(val) => handleModalToggle(val)}
        visible={providerModalOpen}
        children={<ProviderProgramMasterModal selectedID={selectedRowId}/>}
        modalWidth={"75%"}
      />
    </>
  );
};

export default EQASProviderMaster;
