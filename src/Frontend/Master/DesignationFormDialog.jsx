import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Divider } from "primereact/divider";
import { validationForDesignations } from "../../utils/Schema";
import { toast } from "react-toastify";
import {
  getChangedFlagRecords,
  getTrimmedData,
  handleFlagToggle,
  normalizeFlagValues,
  number,
} from "../../utils/helpers";
import { axiosInstance } from "../../utils/axiosInstance";
import { useTranslation } from "react-i18next";
import Input from "../../components/formComponent/Input";
import Loading from "../../components/loader/Loading";
import CustomTable from "../../components/Table/CustomTable";
import DatePicker from "../../components/formComponent/DatePicker";
import UploadFile from "../utils/UploadFileModal/UploadFile";
import { guidNumber } from "../../utils/generateGuid";
import { CancelButton, CustomButton } from "../../components/UI/CustomButton";
import { useLocalStorage } from "@app/utils/hooks/useLocalStorage";
import ReactSelect from "../../components/formComponent/ReactSelect";

const buildFormData = (data) => ({
  Name: data?.DesignationName || "",
  SequenceNo: data?.SequenceNo || "",
  IsDirectApprove:
    data?.DirectApprove === "True" || data?.IsDirectApprove == 1 || data?.IsDirectApprove === "1"
      ? "1"
      : "0",
  IsNewTestApprove:
    data?.NewTestApproves === "True" || data?.IsNewTestApprove == 1 || data?.IsNewTestApprove === "1"
      ? "1"
      : "0",
  IsSales:
    data?.IsSalesStatus === "True" || data?.IsSales == 1 || data?.IsSales === "1" ? "1" : "0",
  IsShowSpecialRate:
    data?.ShowSpecialRate === "True" || data?.IsShowSpecialRate == 1 || data?.IsShowSpecialRate === "1"
      ? "1"
      : "0",
  isActive: data
    ? data?.ActiveStatus === "True" || data?.isActive == 1 || data?.isActive === "1"
      ? "1"
      : "0"
    : "1",
  DesignationID: data?.DesignationID || "",
  RecEdit: data?.RecEdit || 0,
  EditInfo: data?.EditInfo || 0,
  ImagePath: data?.ImagePath || "",
  IconName: data?.IconName || data?.iconName || data?.DesignationIcon || "",
});

const DesignationFormDialog = ({ visible, setVisible, editData, onSuccess }) => {
  const { t } = useTranslation();
  const theme = useLocalStorage("theme", "get");
  const isMobile = window.innerWidth > 768;

  const [err, setErr] = useState({});
  const [load, setLoad] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [designationList, setDesignationList] = useState([]);
  const [searchDesignationSuggestions, setSearchDesignationSuggestions] = useState([]);
  const [selectSearchDesignation, setSelectSearchDesignation] = useState(false);
  const [searchDesignationIndex, setSearchDesignationIndex] = useState(0);
  const [searchDesignationPayload, setSearchDesignationPayload] = useState({
    label: "",
    value: null,
    DefaultDesignationId: null,
  });
  const [showFileModal, setShowFileModal] = useState({ modal: false, data: "", index: -1 });
  const [formData, setFormData] = useState(buildFormData(null));

  useEffect(() => {
    if (visible) {
      const init = buildFormData(editData);
      setFormData(init);
      setErr({});
      setTableData([]);
      fetchFlagConfig(init.DesignationID);
      fetchDesignationList();
    }
  }, [visible, editData]);

  const fetchFlagConfig = (designationID) => {
    setLoad(true);
    axiosInstance
      .post("Designation/getDesignationDataConfig", { designationID: designationID || 0 })
      .then((res) => {
        if (Array.isArray(res?.data?.message) && res.data.message.length > 0) {
          setTableData(normalizeFlagValues(res.data.message));
        } else {
          setTableData([]);
        }
        setLoad(false);
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Error Occured");
        setLoad(false);
      });
  };

  const fetchDesignationList = () => {
    axiosInstance
      .post("Designation/getDesignation", { designationsId: 0, designationName: "" })
      .then((res) => {
        const data = res?.data?.message || [];
        const list = data.map((ele) => ({ value: ele.DesignationID, label: ele.DesignationName }));
        setDesignationList(list);
        setSearchDesignationSuggestions(list);
      })
      .catch(() => {});
  };

  const handleCaptureUploadedFile = (name, count, isUploaded) => {
    if (count > 0 || isUploaded) {
      setFormData((prev) => ({ ...prev, ImagePath: showFileModal.data }));
    }
  };

  const handleSearchDesignationChange = (e) => {
    const value = e.target.value;
    setSearchDesignationPayload({ label: value, value: null, DefaultDesignationId: null });
    if (!value.trim()) {
      setSelectSearchDesignation(false);
      setSearchDesignationSuggestions(designationList);
    } else {
      const filtered = designationList.filter((d) =>
        d.label.toLowerCase().includes(value.toLowerCase())
      );
      setSearchDesignationSuggestions(filtered);
      setSelectSearchDesignation(true);
      setSearchDesignationIndex(0);
    }
  };

  const handleSearchDesignationKeyDown = (e) => {
    if (!selectSearchDesignation || searchDesignationSuggestions.length === 0) return;
    if (e.key === "ArrowUp") {
      setSearchDesignationIndex((prev) =>
        prev > 0 ? prev - 1 : searchDesignationSuggestions.length - 1
      );
    } else if (e.key === "ArrowDown") {
      setSearchDesignationIndex((prev) =>
        prev === searchDesignationSuggestions.length - 1 ? 0 : prev + 1
      );
    } else if (e.key === "Enter") {
      handleSearchDesignationSelect(searchDesignationSuggestions[searchDesignationIndex]);
      setSearchDesignationIndex(0);
    }
  };

  const handleSearchDesignationSelect = (selected) => {
    if (!selected) return;
    setSearchDesignationPayload(selected);
    setSelectSearchDesignation(false);

    axiosInstance
      .post("Designation/GetDesignationSearch", { designationsId: selected?.value || "" })
      .then((res) => {
        if (res.data.success && res.data.data) {
          const designationDetails = res.data.data.designationDetails[0] || [];
          const flagDetails = res.data.data.flagDetails || [];

          setFormData((prev) => ({
            ...prev,
            Name: designationDetails.DesignationName || "",
            SequenceNo: Number(designationDetails.SequenceNo || 0),
            IsDirectApprove:
              designationDetails.DirectApprove === "True" || designationDetails.IsDirectApprove === 1
                ? "1"
                : "0",
            IsNewTestApprove:
              designationDetails.NewTestApproves === "True" || designationDetails.IsNewTestApprove === 1
                ? "1"
                : "0",
            IsSales:
              designationDetails.IsSalesStatus === "True" || designationDetails.IsSales === 1
                ? "1"
                : "0",
            IsShowSpecialRate:
              designationDetails.ShowSpecialRate === "True" || designationDetails.IsShowSpecialRate === 1
                ? "1"
                : "0",
            isActive:
              designationDetails.ActiveStatus === "True" || designationDetails.isActive === 1
                ? "1"
                : "0",
            DesignationID: Number(designationDetails.DesignationID),
            RecEdit: designationDetails.RecEdit || 0,
            EditInfo: designationDetails.EditInfo || 0,
            IconName:
              designationDetails.IconName ||
              designationDetails.iconName ||
              designationDetails.DesignationIcon ||
              "",
          }));

          if (Array.isArray(flagDetails) && flagDetails.length > 0) {
            setTableData(normalizeFlagValues(flagDetails));
          } else {
            setTableData([]);
            toast.info("No flag data found for this company");
          }
        } else {
          toast.info("No details found for this designation");
        }
      })
      .catch(() => {
        toast.error("Failed to fetch designation details");
      });
  };

  const columns = [
    { header: "Sr. No", field: "SrNo", width: "4%" },
    { header: "FlagName", field: "FlagName", width: "16%" },
    { header: "Value", field: "Value", width: "16%" },
    { header: "Last Updated By", field: "LastUpdatedBy", width: "16%" },
    { header: "Last Updated On", field: "LastUpdatedOn", width: "16%" },
  ];

  const handleOpenUploadModal = () => {
    const currentGuid = formData.ImagePath ? formData.ImagePath : guidNumber();
    setShowFileModal({ modal: true, data: currentGuid, index: -1 });
  };

  const postData = () => {
    const generatedError = validationForDesignations(formData);
    if (generatedError === "") {
      setLoad(true);
      const payload = {
        name: formData.Name,
        sequenceNo: String(formData.SequenceNo),
        isDirectApprove: formData.IsDirectApprove,
        isNewTestApprove: formData.IsNewTestApprove,
        isSales: formData.IsSales,
        isShowSpecialRate: formData.IsShowSpecialRate,
        isActive: formData.isActive.toString(),
        designationID: String(formData.DesignationID),
        reportopen: 0,
        flagRecords: getChangedFlagRecords(tableData),
        ImagePath: formData.ImagePath,
        iconName: formData.IconName,
      };
      const url = editData
        ? "Designation/UpdateDesignationData"
        : "Designation/InsertDesignationData";

      axiosInstance
        .post(url, getTrimmedData(payload))
        .then((res) => {
          if (res.data.message) {
            toast.success(res.data.message);
            setLoad(false);
            setVisible(false);
            onSuccess?.();
          } else {
            toast.error("Something went wrong");
            setLoad(false);
          }
        })
        .catch((err) => {
          toast.error(err?.response?.data?.message || "Error Occured");
          setLoad(false);
        });
    } else {
      setErr(generatedError);
    }
  };

  const renderControl = (row) => {
    switch (row.ControlType) {
      case "Checkbox": {
        const isChecked = row.FlagValue === "1" || row.FlagValue === 1;
        return (
          <label
            className="switch"
            style={{ display: "flex", alignItems: "center", marginBottom: "0" }}
          >
            <input
              type="checkbox"
              checked={isChecked}
              onChange={(e) => handleFlagToggle(setTableData, row, e)}
            />
            <span className="slider round2"></span>
          </label>
        );
      }
      case "TextBox":
        return (
          <Input
            onChange={(e) => {
              const value = e.target.value;
              setTableData((prev) =>
                prev.map((r) =>
                  r.FlagName === row.FlagName
                    ? { ...r, FlagValue: value, isChanged: value !== r.originalFlagValue }
                    : r
                )
              );
            }}
            value={row.FlagValue || ""}
            name="FlagValue"
            type="text"
            placeholder=""
            lable={t("Flag Value")}
            id="Visit No"
          />
        );
      case "Calendar":
        return (
          <DatePicker
            className="custom-calendar"
            name="Date"
            value={row.FlagValue || ""}
            onChange={(e) => {
              const value = e.target.value;
              setTableData((prev) =>
                prev.map((r) =>
                  r.FlagName === row.FlagName
                    ? { ...r, FlagValue: value, isChanged: value !== r.originalFlagValue }
                    : r
                )
              );
            }}
            placeholder=" "
            lable="Date"
            maxDate={new Date(row.FlagValue)}
          />
        );
      case "Dropdown":
        return (
          <ReactSelect
            dynamicOptions={row?.Options}
            name="Dropdown"
            lable={t("Select Flag")}
            removeIsClearable={true}
            placeholderName={t("Select Flag")}
            value={row.FlagValue || ""}
            onChange={(name, selectedOption) => {
              const value = selectedOption?.value || "";
              setTableData((prev) =>
                prev.map((r) =>
                  r.FlagName === row.FlagName
                    ? { ...r, FlagValue: value, isChanged: value !== r.originalFlagValue }
                    : r
                )
              );
            }}
          />
        );
      default:
        return row.FlagValue || "";
    }
  };

  const renderData = tableData.map((row) => ({ ...row, Value: renderControl(row) }));

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? (checked ? "1" : "0") : value });
  };

  const handleToggle = (e) => {
    const { checked } = e.target;
    setFormData((prev) => ({ ...prev, isActive: checked ? "1" : "0" }));
  };

  const dialogHeader = editData ? (
    <div className="d-flex align-items-center flex-wrap" style={{ gap: "10px" }}>
      <span style={{ fontWeight: 600 }}>{t("Edit Designation")}</span>
      <small className="" style={{ fontSize: "12px", fontWeight: "normal" }}>
        <strong>Name:</strong> {editData.DesignationName} &nbsp;|&nbsp;
        <strong>ID:</strong> {editData.DesignationID}
      </small>
    </div>
  ) : (
    <span style={{ fontWeight: 600 }}>{t("Create Designation")}</span>
  );

  return (
    <>
      <Dialog
        header={dialogHeader}
        visible={visible}
        style={{ width: isMobile ? "90vw" : "90vw" }}
        onHide={() => setVisible(false)}
        draggable={false}
        className={theme}
      >
        <Divider className={`custom-divider-header ${theme}`} />

        <div className="row pt-2 pl-2 pr-2 align-items-center">
          <div className="col-sm-3">
            <Input
              type="text"
              name="Name"
              lable="Designation Name"
              id="Name"
              placeholder=" "
              max={50}
              className="required-fields"
              onChange={handleChange}
              value={formData?.Name}
            />
            <span className="error-message">{err?.Name}</span>
          </div>

          <div className="col-sm-2">
            <Input
              type="number"
              name="SequenceNo"
              className="required-fields"
              lable="Sequence Number"
              id="SequenceNo"
              placeholder=" "
              max={11}
              onChange={handleChange}
              value={formData?.SequenceNo}
              onInput={(e) => number(e, 11)}
            />
            <span className="error-message">{err?.SequenceNo}</span>
          </div>

          <div className="col-sm-3 d-flex align-items-center">
            <Input
              type="text"
              name="IconName"
              lable="Icon Name (e.g:FaUser)"
              value={formData?.IconName || ""}
              onChange={handleChange}
            />
          </div>

          <div className="col-auto d-flex align-items-center p-2" style={{ gap: "5px" }}>
            <label className="switch">
              <input
                type="checkbox"
                name="isActive"
                checked={formData?.isActive === "1"}
                onChange={handleToggle}
              />
              <span className="slider"></span>
            </label>
            <strong className="mb-2">{t("IsActive")}</strong>
          </div>

          <div className="col-sm-1">
            <CustomButton
              text={formData.ImagePath ? t("File Linked") : t("Upload file")}
              onClick={handleOpenUploadModal}
            />
          </div>
        </div>

        <div className="row pt-2 pl-2 pr-2">
          {load ? (
            <Loading />
          ) : tableData && tableData.length > 0 ? (
            <CustomTable
              columns={columns}
              data={renderData}
              scrollView="scroll"
              tableHeight="table-responsive"
            />
          ) : null}
        </div>

        <div className="row pt-3 pl-2 pr-2 pb-2">
          <div className="col-12 d-flex align-items-center" style={{ gap: "8px" }}>
            {load ? (
              <Loading />
            ) : (
              <CustomButton
                text={editData ? t("Update") : t("Save")}
                icon={editData ? "edit" : "save"}
                onClick={postData}
              />
            )}
            <CancelButton
              text={t("Cancel")}
              onClick={() => setVisible(false)}
            />
          </div>
        </div>
      </Dialog>

      {showFileModal?.modal && (
        <UploadFile
          show={showFileModal?.modal}
          handleClose={() => setShowFileModal({ modal: false, data: "", index: -1 })}
          documentId={showFileModal?.data}
          pageName="DesignationsCreate"
          handleUploadCount={handleCaptureUploadedFile}
        />
      )}
    </>
  );
};

export default DesignationFormDialog;
