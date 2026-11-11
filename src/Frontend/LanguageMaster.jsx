import React, { useEffect, useRef, useState } from "react";
import Input from "../components/formComponent/Input";
import { CustomButton, SaveButton } from "../components/UI/CustomButton";
import UploadFile from "./utils/UploadFileModal/UploadFile";
import { useTranslation } from "react-i18next";
import { guidNumber } from "../utils/generateGuid";
import { toast } from "react-toastify";
import Accordion from "../components/UI/Accordion";
import { axiosInstance } from "../utils/axiosInstance";
import Tables from "../components/UI/customTable";
import Heading from "../components/UI/Heading";
import ColorCodingSearch from "../components/ModalComponent/ColorCodingSearch";
import FilterInput from "../components/Filter/FilterInput";
import { Dialog } from "primereact/dialog";
import { useLocalStorage } from "../utils/hooks/useLocalStorage";

export default function LanguageMaster() {
  const [t] = useTranslation();
  const fileInputRef = useRef(null);
  const theme = useLocalStorage("theme", "get");
  const isMobile = window.innerWidth > 768;

  // const [excelLoading, setExcelLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [payload, setPayload] = useState({
    Language: "",
    FilePath: "",
    isActive: 1,
  });

  console.log("p", payload);

  const [languageList, setLanguageList] = useState([]);
  const [masterTableData, setMasterTableData] = useState([]);
  const [guid, setGuid] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [selectedFlag, setSelectedFlag] = useState("");

  const [showFileModal, setShowFileModal] = useState({
    modal: false,
    data: "",
    index: -1,
  });

  const handleToggle = (field) => {
    setPayload((prev) => ({
      ...prev,
      [field]: prev[field] === 1 ? 0 : 1,
    }));
  };

  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPayload((prev) => ({ ...prev, [name]: value }));
  };

  const handleChangeSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(e.target.value);

    if (!value) {
      setLanguageList(masterTableData);
      return;
    }

    const searchableKeys = [
      "LanguageName",
      "FlagKey",
      "UpdatedByName",
      "CreatedByName",
      "RequestedDate",
      "dtUpdate",
    ];

    const filtered = masterTableData?.filter((row) =>
      searchableKeys.some((key) =>
        String(row[key] || "")
          .toLowerCase()
          .includes(value),
      ),
    );

    setLanguageList(filtered);
  };

  const handleOpenUploadModal = () => {
    const generateGuid = payload.FilePath || guidNumber();
    setGuid(generateGuid);

    setShowFileModal({
      modal: true,
      data: generateGuid,
      index: -1,
    });
  };

  const handleCaptureUploadedFile = (name, count) => {
    if (count > 0) {
      setPayload((prev) => ({ ...prev, FilePath: guid }));
      toast.success(`${count} file(s) linked successfully`);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPayload({ ...payload, FilePath: file.name });
    }
  };

  const handleSubmit = async () => {
    if (!payload.Language.trim()) {
      toast.error("Language is required");
      return;
    }

    if (!selectedFile) {
      toast.error("Please select a flag image");
      return;
    }

    // Initialize FormData
    const formData = new FormData();
    formData.append("LanguageName", payload.Language);
    formData.append("FlagBase64", selectedFile);
    formData.append("IsActive", payload.isActive);

    try {
      const res = await axiosInstance.post(
        "LanguageMaster/SaveCompanyLanguageMaster",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (res?.data?.success) {
        toast.success(res.data.message);
        setPayload({ Language: "", FilePath: "", isActive: 1 });
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        getLanguage();
      } else {
        toast.error(res?.data?.message || "Save failed");
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  console.log("Payload", payload);

  const handleEditClick = (item) => {
    setPayload((prev) => ({
      ...prev,
      id: item.Id,
      Language: item.LanguageName,
      FilePath: item.FlagBase64,
      isActive: item.IsActive,
    }));

    setGuid(item.FlagBase64);
    setEditId(item.Id);
    setIsEdit(true);
  };

  const handleUpdate = async () => {
    if (!payload.Language.trim()) {
      toast.error("Language is required");
      return;
    }

    const formData = new FormData();
    formData.append("Id", payload.id.toString());
    formData.append("LanguageName", payload.Language);

    if (selectedFile) {
      formData.append("FlagBase64", selectedFile);
    } else {
      formData.append("FlagKey", payload.FilePath);
    }

    formData.append("IsActive", payload.isActive);

    try {
      const res = await axiosInstance.post(
        "LanguageMaster/SaveCompanyLanguageMaster",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (res?.data?.success) {
        toast.success(res.data.message || "Updated successfully");

        setPayload({ Language: "", FilePath: "", isActive: 1 });
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        setGuid(null);
        setEditId(null);
        setIsEdit(false);
        getLanguage();
      } else {
        toast.error(res?.data?.message || "Update failed");
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const getLanguage = async () => {
    try {
      const res = await axiosInstance.post(
        "LanguageMaster/GetCompanyLanguageMaster",
      );
      if (res?.data?.success && Array.isArray(res?.data?.message)) {
        setLanguageList(res.data.message);
        setMasterTableData(res.data.message);
      } else {
        setLanguageList([]);
        setMasterTableData([]);
      }
    } catch (error) {
      console.log("Error", error);
    }
  };

  useEffect(() => {
    getLanguage();
  }, []);

  const handleViewFlag = (flagBase64) => {
    setSelectedFlag(flagBase64);
    setShowFlagModal(true);
  };

  const activeCount =
    languageList?.filter((item) => item.IsActive === 1).length || 0;
  const inactiveCount =
    languageList?.filter((item) => item.IsActive === 0).length || 0;

  const colorsCodingData = [
    { color: "#FFFFFF", id: "8", labelKey: "Active", count: activeCount },
    { color: "#ffaeae", id: "7", labelKey: "InActive", count: inactiveCount },
  ];

  const getRowColor = (isActive) => {
    if (isActive === 0) {
      return "#ffaeae";
    } else if (isActive === 1) {
      return "#FFFFFF";
    }
    return "transparent";
  };

  return (
    <>
      <Accordion name={t("Language Master")} defaultValue isBreadcrumb>
        <div className="row justify-content-between align-items-center">
          <div className="row px-2 mt-2 mb-2 flex-nowrap">
            <div className="col-sm-5 ml-2">
              <Input
                value={payload.Language}
                onChange={handleChange}
                name="Language"
                lable="Language"
                required
              />
            </div>

            <div className="col-auto mb-2">
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                accept="image/*"
                onChange={handleFileChange}
              />
              <CustomButton
                text={payload.FilePath ? "Flag Selected" : "Upload Flag"}
                onClick={() => fileInputRef.current.click()}
              />
            </div>

            <div className="col-auto d-flex align-items-center justify-content-center p-2">
              <label class="switch mb-0">
                <input
                  type="checkbox"
                  checked={payload.isActive === 1}
                  onChange={() => handleToggle("isActive")}
                />
                <span class="slider"></span>
              </label>
              <strong>
                <span>{t("IsActive")}</span>
              </strong>
            </div>

            <div className="col-auto d-flex gap-2">
              {!isEdit ? (
                <SaveButton text="Save" onClick={handleSubmit} />
              ) : (
                <div className="d-flex" style={{ gap: "5px" }}>
                  <SaveButton text="Update" onClick={handleUpdate} />
                  <CustomButton
                    text="Cancel"
                    onClick={() => {
                      setPayload({ Language: "", FilePath: "", isActive: 1 });
                      setSelectedFile(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                      setGuid(null);
                      setIsEdit(false);
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {showFileModal.modal && (
          <UploadFile
            show={showFileModal.modal}
            handleClose={() =>
              setShowFileModal({ modal: false, data: "", index: -1 })
            }
            documentId={showFileModal.data}
            pageName="LanguageMaster"
            handleUploadCount={handleCaptureUploadedFile}
          />
        )}
      </Accordion>

      <div>
        <Heading
          title={t("Language Master")}
          defaultValue={true}
          secondTitle={
            <>
              {colorsCodingData.map(({ color, labelKey, id, count }) => (
                <ColorCodingSearch
                  key={id}
                  color={color}
                  label={`${t(labelKey)} (${count})`}
                />
              ))}
              <FilterInput
                value={searchTerm}
                onChange={handleChangeSearch}
                placeholder="Filter Table"
                className="ml-2"
              />
            </>
          }
        />
        <div>
  <Tables className="table table-bordered table-hover"
        style={{
                  maxHeight: "350px",
                  height: "350px",
                  overflowY: "auto",
                  
                }}
        >
          <thead>
            <tr>
              <th>S.No</th>
              <th>Language</th>
              <th>Flag</th>
              <th>Created By</th>
              <th>Created Date</th>
              <th>Last Updated By</th>
              <th>Last Updated Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {languageList?.map((item, index) => (
              <tr
                key={index}
                style={{ backgroundColor: getRowColor(item.IsActive) }}
              >
                <td>{index + 1}</td>
                <td>{item.LanguageName}</td>

                <td>
                  {item.FlagBase64 && (
                    <i
                      className="bi bi-eye-fill mb-0"
                      style={{ cursor: "pointer", color: "#080b0e" }}
                      onClick={() => handleViewFlag(item.FlagBase64)}
                    ></i>
                  )}
                </td>

                <td>{item?.CreatedByName}</td>
                <td>{item?.RequestedDate}</td>
                <td>{item?.UpdatedByName}</td>
                <td>{item?.dtUpdate}</td>

                <td>
                  <i
                    className="fa fa-edit"
                    icon="edit"
                    onClick={() => handleEditClick(item)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </Tables>
        </div>
      
      </div>

      <Dialog
        header="Flag Image"
        visible={showFlagModal}
        className={theme}
        style={{ width: isMobile ? "50vw" : "90vw" }}
        onHide={() => setShowFlagModal(false)}
        modal
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {selectedFlag && (
            <img
              src={
                selectedFlag.startsWith("data:")
                  ? selectedFlag
                  : `data:image/png;base64,${selectedFlag}`
              }
              alt="flag"
              style={{
                maxWidth: "100%",
                maxHeight: "400px",
                objectFit: "contain",
              }}
            />
          )}
        </div>
      </Dialog>
    </>
  );
}
