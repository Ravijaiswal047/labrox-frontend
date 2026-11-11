import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { useTranslation } from "react-i18next";
import { axiosInstance } from "../../../utils/axiosInstance";
import { dateConfig } from "../../../utils/helpers";
import { toast } from "react-toastify";
import { SelectBox } from "../../../components/formComponent/SelectBox";
import { Divider } from "primereact/divider";
import { useLocalStorage } from "../../../utils/hooks/useLocalStorage";
import Loading from "../../../components/loader/Loading";
import pdfIcon from "../../../assets/image/pdf.png";
import PlaceholderImage from "../PlaceholderImage.jpg";
import UploadCameraModal from "../UploadCameraModal";
import { CustomButton } from "../../../components/UI/CustomButton";
import { Form } from "react-bootstrap";




const UploadFile = ({
  options,
  show,
  handleClose,
  documentId,
  pageName,
  handleUploadCount,
  getDocumentType,
  formData,
  isPrintHeader = 0,
  showHeader = true,
  ChangeApi = false,
  CompanyId,
  blockUpload = false,
  LedgerTransactionIDHash = "",
  CentreID,
  ResultTestData,
  toView = false

}) => {
  console.log('ResultTestData', ResultTestData);
  const { t } = useTranslation();
  const [state, setState] = useState({
    DocumentName: options ? options[0]?.value : "",
    DocumentID: (pageName === "SamartReportFirstCoverPage" || pageName === "SamartReportLastCoverPage") ? "" : (documentId ?? ""),
    file: null,
    previewUrl: null,
    isNabl: 0,
    ShowInPatientReport: 1,
  });
  console.log('documentId::', state, options);

   const userData = useLocalStorage("userData", "get");
  console.log("userData", userData);
  const DefaultCurrencyName = userData?.DefaultCurrencyName;

  const [selectedFiles, setSelectedFiles] = useState([]);

  const [load, setLoad] = useState(false);
  const [err, setErr] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [printHeader, setPrintHeader] = useState(isPrintHeader);
  const [controllerDynamicList, setControllerDynamicList] = useState([]);
  const [PatientGuid, SetPatientGuid] = useState("");
  const [file, setFile] = useState(null);
  const [uploadpatientImg, setUploadpatientImg] = useState({
    img: PlaceholderImage,
    show: false,
  });


  const processFile = (file) => {
    if (file) {
      const fileType = file.type || "";
      const extension = file.name.split(".").pop().toLowerCase();
      const isCompanyLogo = pageName === "CompanyLogo";
      const logoExtensions = ["jpeg", "jpg", "png", "webp"];
      const logoMimes = ["image/jpeg", "image/png", "image/webp"];

      if (isCompanyLogo) {
        if (["svg", "svgz", "html", "htm", "js", "exe", "gif"].includes(extension)) {
          toast.error(t("Only JPG, JPEG, PNG and WEBP files are allowed."));
          return;
        }
        if (!logoExtensions.includes(extension)) {
          toast.error(t("Only JPG, JPEG, PNG and WEBP files are allowed."));
          return;
        }
        if (fileType && !logoMimes.includes(fileType) && !fileType.startsWith("image/")) {
          toast.error(t("Only JPG, JPEG, PNG and WEBP files are allowed."));
          return;
        }
        if (file.size > 1024 * 1024) {
          toast.error(t("Logo size must not exceed 1 MB."));
          return;
        }

        const previewUrl = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
          if (img.width < 32 || img.height < 32) {
            URL.revokeObjectURL(previewUrl);
            toast.error(t("Image is too small. Minimum size is 32×32 pixels."));
            return;
          }
          if (img.width > 1024 || img.height > 1024) {
            URL.revokeObjectURL(previewUrl);
            toast.error(t("Image is too large. Maximum size is 1024×1024 pixels."));
            return;
          }
          setState((prev) => ({
            ...prev,
            file,
            previewUrl,
          }));
        };
        img.onerror = () => {
          URL.revokeObjectURL(previewUrl);
          toast.error(t("Invalid or corrupted image file."));
        };
        img.src = previewUrl;
        return;
      }

      const isImage = fileType.startsWith("image/") || ["jpeg", "jpg", "png", "gif", "webp"].includes(extension);
      const isPdf = fileType === "application/pdf" || extension === "pdf";
      const isDocOrExcel = ["doc", "docx", "xls", "xlsx"].includes(extension) || 
                           [
                             "application/msword",
                             "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                             "application/vnd.ms-excel",
                             "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                           ].includes(fileType);

      if (isImage) {
        const previewUrl = URL.createObjectURL(file);
        setState((prev) => ({
          ...prev,
          file,
          previewUrl,
        }));
      } else if (isPdf) {
        const previewUrl = URL.createObjectURL(file);
        setState((prev) => ({
          ...prev,
          file,
          previewUrl,
        }));
      } else if (isDocOrExcel && pageName === "downtimemaster") {
        setState((prev) => ({
          ...prev,
          file,
          previewUrl: pdfIcon,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          file: null,
          previewUrl: null,
        }));
        toast.error(t("Only image or PDF files are allowed for preview"));
      }
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const newFile = event.dataTransfer.files[0];
    processFile(newFile);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const selectedName = (id) => {
    let name = options?.find((item) => item?.value == id)?.label;
    return name;
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    processFile(file);
    event.target.value = "";
  };

  const handleCheckboxChange = (checked, awsKey) => {
    if (checked) {
      setSelectedFiles(prev => [...prev, awsKey]);
    } else {
      setSelectedFiles(prev => prev.filter(item => item !== awsKey));
    }
  };

  console.log('state::::', state)

  const handleFileRemove = () => {
    setState({
      ...state,
      file: null,
      previewUrl: null,
    });
    document.getElementById("file-upload").value = ""; // Reset the file input
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const data = options.find((ele) => ele.value === value);

    setState({
      ...state,
      [name]: data?.value,
      DocumentName: data?.label,
    });
  };

  const getDocumentFiletype = (data) => {
    let TypeDocument = [];
    data.map((ele) => {
      return TypeDocument.push(ele?.DocumentName);
    });
    getDocumentType(TypeDocument);
  };

  const Fetch = async () => {

    const payload =
      pageName === "centreMasterNabl"
        ? { centreID: CentreID }
        : pageName === "SamartReportFirstCoverPage"
          ? {
            DocumentID: "",
            LedgerTransactionIDHash: "",
            Page: "SamartReportFirstCoverPage",
            DocumentName: "SamartReportFirstCoverPage",
            Guid: documentId,
            FileName: "SamartReportFirstCoverPage",
            centreID: "",
            Isnabl: "0"
          }
          : pageName === "SamartReportLastCoverPage"
            ? {
              DocumentID: "",
              LedgerTransactionIDHash: "",
              Page: "SamartReportLastCoverPage",
              DocumentName: "SamartReportLastCoverPage",
              Guid: documentId,
              FileName: "SamartReportLastCoverPage",
              centreID: "",
              Isnabl: "0"
            }
            : {
              Page: pageName,
              Guid: documentId,
              CompanyId: CompanyId?.toString() || "",
            };
    try {
      const response = await axiosInstance.post(
        ChangeApi
          ? "CommonController/GetCompanyLogo"
          : pageName === "centreMasterNabl"
            ? "CommonController/GetCentreNablData"
            : "CommonController/GetDocument",
        payload,
      );
      const documents = response?.data?.message || [];

      const tableData = await Promise.all(
        documents.map(async (data) => {
          const imgUrl = data?.fileUrl || (await getimgurl(data?.awsKey));
          return { ...data, imgUrl };
        }),
      );
      setTableData(tableData);

      // for togging the check
      const preSelected = tableData
        .filter(doc => doc.IsReport == 1)
        .map(doc => doc.awsKey);
      setSelectedFiles(preSelected);

      if (["Patient Registration", "DesignationsCreate", "LanguageMaster"].includes(pageName)) {
        handleUploadCount(
          "UploadDocumentCount",
          documents.length,
          "IsDocumentUploaded",
        );
        if (
          ["/EditPatientDetails", "/patientregister"].includes(
            window.location.pathname,
          )
        ) {
          getDocumentFiletype(documents);
        }
      } else if (handleUploadCount) {
        handleUploadCount("UploadDocumentCount", documents.length, "IsDocumentUploaded");
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message
          ? err?.response?.data?.message
          : t("Something Went Wrong"),
      );
    }
  };

  const DeleteImage = (id) => {
    setLoad(true);
    axiosInstance
      .post(
        ChangeApi
          ? "CommonController/InActiveCompanyDocument"
          : "CommonController/InActiveDocument",

        {
          Hash_Id: id,
          CompanyId: CompanyId ? CompanyId?.toString() : "",
          // ledgerTransactionIDHash: ResultTestData?.LedgertransactionIDHash || "",
        },
      )
      .then((res) => {
        setLoad(false);
        toast.success(res?.data?.message);
        Fetch();
      })
      .catch((err) => {
        setLoad(false);
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : t("Something Went Wrong"),
        );
      });
  };

  const UploadDocumentModalValidation = (state) => {
    let err = "";
    // Skip DocumentID validation for special cover pages
    if (pageName !== "SamartReportFirstCoverPage" && pageName !== "SamartReportLastCoverPage") {
      if (state?.DocumentID === "") {
        err = { ...err, DocumentID: "This Field is Required" };
      }
    }
    return err;
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    const generatedError = UploadDocumentModalValidation(state);
    if (generatedError === "") {
      if (!state.file) {
        toast.error("Please attach a file first.");
      } else {
        if (pageName === "CompanyLogo" && state.file.size > 1024 * 1024) {
          toast.error(t("Logo size must not exceed 1 MB."));
          return;
        }
        if (state.file.size > 1024 * 5120) {
          toast.error("File size must not exceed 5MB.");
          return;
        }
        const names = [
          "EmployeMaster",
          "CentreMaster",
          "CentreMasterFirst",
          "CentreMasterSecond",
          "RateTypeMaster",
          "MembershipCardLogo",
          "MembershipCardIssue",
          "attachmentHeader",
          "attachmentfooter",
          "CompanyLogo",
          "AlleryMaster",
        ];
        if (names.includes(pageName) && tableData?.length > 0) {
          toast.error(t("Please Remove Image to Upload New Image"));
        } else {
          setLoad(true);

          let formData = new FormData();
          if (pageName === "SamartReportFirstCoverPage") {
            formData.append("DocumentID", "");
            formData.append("LedgerTransactionIDHash", LedgerTransactionIDHash);
            formData.append("Page", "SamartReportFirstCoverPage");
            formData.append("DocumentName", "SamartReportFirstCoverPage");
            formData.append("Guid", documentId);
            formData.append("file", state.file);
            formData.append("FileName", "SamartReportFirstCoverPage");
            formData.append("centreID", "");
            formData.append("Isnabl", "0");
          } else if (pageName === "SamartReportLastCoverPage") {
            formData.append("DocumentID", "");
            formData.append("LedgerTransactionIDHash", "");
            formData.append("Page", "SamartReportLastCoverPage");
            formData.append("DocumentName", "SamartReportLastCoverPage");
            formData.append("Guid", documentId);
            formData.append("file", state.file);
            formData.append("FileName", "SamartReportLastCoverPage");
            formData.append("centreID", "");
            formData.append("Isnabl", "0");
          } else {
            formData.append("file", state.file);
            formData.append("DocumentID", state.DocumentID);
            formData.append("Page", pageName);
            formData.append(
              "DocumentName",
              pageName === "centreMasterNabl" ? "Nabl Logo" : state.DocumentName,
            );
            formData.append("Guid", documentId);
            formData.append("LedgerTransactionIDHash", LedgerTransactionIDHash);
            formData.append("FileName", "");
            formData.append("CompanyId", CompanyId ? CompanyId : "");
            formData.append("ShowInPatientReport", DefaultCurrencyName === "NPR" ? 0 : (state.ShowInPatientReport ?? 1));
            if (!ChangeApi) {
              formData.append("TestIDHAsh", ResultTestData?.TestIDHash)
            }
            if (pageName === "centreMasterNabl") {
              formData.append("isNabl", state.isNabl);
              formData.append("centreID", CentreID);
            }
          }
          for (let [key, value] of formData.entries()) {
            console.log(`${key}:`, value, typeof value);
          }
          await axiosInstance
            .post(
              ChangeApi
                ? "CommonController/UploadCompanylogo"
                : "CommonController/UploadDocument",
              formData,
            )
            .then((res) => {
              if (res.data.success) {
                toast.success(res?.data?.message);
                // handleUploadCount("UploadDocumentCount", 1, true);
                Fetch();
                setLoad(false);
                setState({ ...state, file: null, previewUrl: null });
                if (pageName === "CompanyLogo") {
                  window.dispatchEvent(new Event("company-logo-updated"));
                }
              } else {
                toast.error(res?.data?.message);
                setLoad(false);
              }
            })
            .catch((err) => {
              console.log('errxxx::', err);
              setLoad(false);
              toast.error(
                err?.response?.data?.message
                  ? err?.response?.data?.message
                  : t("Something Went Wrong"),
              );
            });
        }
      }
    } else {
      setErr(generatedError);
    }
  };

  const getS3url = (id) => {
    axiosInstance
      .post("CommonController/GetFileUrl", {
        Key: id,
      })
      .then((res) => {
        const url = res?.data?.message;
        if (
          ["jpeg", "jpg", "png"].includes(id.split(".").pop().toLowerCase())
        ) {
          const a = document.createElement("a");
          a.href = url;
          a.download = "downloaded-image.jpeg";
          a.target = "_blank";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        } else window.open(url, "_blank");
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : t("Something went Wrong"),
        );
      });
  };

  const getimgurl = async (id) => {
    try {
      const response = await axiosInstance.post("CommonController/GetFileUrl", {
        Key: id,
      });
      return response?.data?.message;
    } catch (err) {
      toast.error(
        err?.response?.data?.message
          ? err?.response?.data?.message
          : t("Something went Wrong"),
      );
      return null; // Return null or a placeholder URL if there's an error
    }
  };

  // const handleSubmitReport = () => {

  //   // if (selectedFiles.length === 0) {
  //   //   toast.error("Please select at least one file");
  //   //   return;
  //   // }
  //   const payload = {
  //     isReport: 1,
  //     awsKey: selectedFiles,
  //   };

  //   axiosInstance.post("CommonController/UpdatetFileStatus", payload)
  //     .then(res => {
  //       toast.success("Updated successfully");
  //       setSelectedFiles([]);
  //       handleClose();
  //     })
  //     .catch(err => {

  //       console.log(err)
  //     });
  // };


  const handleSubmitReport = () => {

    const payload = {
      files: tableData.map((file) => ({
        awsKey: file.awsKey,
        isReport: selectedFiles.includes(file.awsKey) ? 1 : 0
      }))
    };

    axiosInstance.post("CommonController/UpdatetFileStatus", payload)
      .then(res => {
        toast.success("Updated successfully");
        setSelectedFiles([]);
        handleClose();
      })
      .catch(err => {
        console.log(err);
      });
  };
  
  useEffect(() => {
    const loadInitialData = async () => {
      await Fetch();
      if (pageName === "CompanyIsoLogo" && documentId) {
        const url = await getimgurl(documentId);

        const isoLogoRecord = {
          awsKey: documentId,
          imgUrl: url,
          DocumentName: "isologo",
          FileName: "Current ISO Logo",
          dtEntry: new Date(),
          CreatedByName: "System",
          ID_Hash: documentId
        };
        setTableData(prev => {
          const exists = prev.some(item => item.awsKey === documentId);
          return exists ? prev : [isoLogoRecord, ...prev];
        });
      }
    }
    loadInitialData();
  }, [documentId, pageName]);

  const theme = useLocalStorage("theme", "get");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [confirmDelete, setConfirmDelete] = useState({
    show: false,
    id: null,
  });

  console.log("ResultTestData",ResultTestData);

  return (
    <>
      {uploadpatientImg.show && (
        <UploadCameraModal
          visible={uploadpatientImg.show}
          guid={documentId}
          pageName={"patientImage"}
          defaultImage={uploadpatientImg.img}
          hideSaveButton={true}
          // hideUploadButton={false}
          isNested={true}
          handleClose={async (guidNo, newUrl, fileSrc) => {
            setUploadpatientImg(prev => ({
              ...prev,
              show: false,
              img: newUrl || prev.img
            }));
            if (!newUrl || newUrl === PlaceholderImage) {
              return;
            }
            setState(prev => ({
              ...prev,
              previewUrl: newUrl,
              file: fileSrc
            }));
          }}
        />
      )}
      {/* {console.log(fileSrc, "fileSrc")} */}
      <Dialog
        header={toView ? t("IsShow On Reports") : t("Upload File")}
        visible={show}
        style={toView ? { width: "30vw" } : null}
        onHide={() => handleClose(printHeader)}
        className={theme}
      >
        <Divider className={`custom-divider-header ${theme}`} />
        <div className="main-upload-container">
          {!toView && <div className="upload-file-cont mt-3">
            {/* {pageName==="centreMasterNabl" && (
          <div className="col-sm-1 mt-1 d-flex">
            <div className="mt-1">
              <input
                name="isNabl"
                type="checkbox"
                checked={state?.isNabl}
                onChange={(e) =>
                  setState({
                    ...state,
                    isNabl: e.target.checked ? 1 : 0,
                  })
                }
              />
            </div>
            <label htmlFor="isNabl" className="ml-2">
              {t("isNabl")}
            </label>
          </div>
          )} */}
            <div className="d-flex justify-content-between px-3  mb-2">
              <label>{t("Upload File")}</label>
              {options && (
                <div style={{ width: "50%" }}>
                  <SelectBox
                    options={options}
                    name="DocumentID"
                    label="DocumentType"
                    selectedValue={state?.DocumentID}
                    onChange={handleChange}
                  />
                  {state?.DocumentID === "" && (
                    <div className="error-message">{err?.DocumentID}</div>
                  )}
                </div>
              )}
            </div>
            <label
              htmlFor="file-upload"
              className="file-upload-container"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", cursor: "pointer" }}
            >
              <input
                type="file"
                disabled={blockUpload}
                name="file"
                id="file-upload"
                className="file-upload-input"
                onChange={handleFileChange}
                accept={
                  ((pageName === "CompanyMaster" ||
                    pageName === "CompanyLogo" ||
                    pageName === "AlleryMaster" || pageName === "HistoImage") &&
                    "image/png, image/jpeg, image/jpg, image/webp") ||
                  ((pageName === "Add Report" || pageName === "Add Attachment") &&
                    ".pdf") ||
                  (pageName === "downtimemaster" &&
                    ".pdf, .doc, .docx, .xls, .xlsx")
                }
              />
              <div className="file-upload-message">
                {t("Drag and drop files here or click to upload")}
                <br />
                {["Add Report", "Add Attachment"].includes(pageName) ? (
                  <>
                    <span className="text-warning">
                      ( {t("Only Pdf is allowed")})
                    </span>
                    <div className="text-danger">
                      ({t("Upto 5MB Size are Allowed")})
                    </div>
                  </>
                ) : ["downtimemaster"].includes(pageName) ? (
                  <>
                    <span className="text-warning">
                      ({t("Only word, excel and pdf are allowed")})
                    </span>
                    <div className="text-danger">
                      ( {t("Upto 5MB Size are Allowed")})
                    </div>
                  </>
                ) : ["CompanyLogo"].includes(pageName) ? (
                  <>
                    <span className="text-warning">
                      ({t("Only jpeg, jpg, png and webp are allowed")})
                    </span>
                    <div className="text-danger">
                      ({t("Max 1024×1024 px, upto 1MB")})
                    </div>
                  </>
                ) : ["AlleryMaster", "HistoImage"].includes(pageName) ? (
                  <>
                    <span className="text-warning">
                      ({t("Only jpeg, jpg and png are allowed")})
                    </span>
                    <div className="text-danger">
                      ( {t("Upto 5MB Size are Allowed")})
                    </div>
                  </>
                ) : (
                  <>
                    <span className="text-warning">
                      ( {t("Only jpg, jpeg, png, gif and pdf are allowed")})
                    </span>
                    <div className="text-danger">
                      ( {t("Upto 5MB Size are Allowed")})
                    </div>
                  </>
                )}
              </div>
            </label>
            {(state?.file || state?.previewUrl) && (
              <>
                <label className="py-3 px-3">{t("Preview")}</label>
                <div className="px-3" style={{ width: "100%" }}>
                  <div
                    className="file-upload-preview"
                    style={{
                      // border: "1px solid #dee2e6",
                      // padding: "4px",
                      flexDirection: "column",
                      alignItems: "flex-start",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%" }}>
                      <div className="preview-filex" style={{ flexShrink: 0 }}>
                        {["jpeg", "jpg", "png", "webp"].includes(
                          state.previewUrl
                            ?.split("?")[0]
                            ?.split(".")
                            .pop()
                            .toLowerCase()
                        ) || state.file?.type?.startsWith("image/") ? (
                          <img src={state.previewUrl || ""} alt={"imgUrl"} />
                        ) : (
                          <img style={{ width: "24px", height: "20px" }} src={pdfIcon} alt={"imgUrl"} />
                        )}
                      </div>
                      <span
                        style={{
                          flex: 1,
                          wordBreak: "break-word",
                          whiteSpace: "normal",
                          overflowWrap: "break-word",
                        }}
                      >
                        {state?.file?.name}
                      </span>
                      <i
                        className="fa fa-trash"
                        style={{ cursor: "pointer", flexShrink: 0 }}
                        onClick={handleFileRemove}
                      ></i>
                    </div>
                    {DefaultCurrencyName !== "KES" && (
                    <div style={{ marginTop: "6px" }}>
                      <Form.Check
                        type="switch"
                        id="ShowInPatientReport"
                        name="ShowInPatientReport"
                        checked={DefaultCurrencyName === "NPR" ? false : state.ShowInPatientReport === 1}
                        onChange={(e) => setState(prev => ({ ...prev, ShowInPatientReport: e.target.checked ? 1 : 0 }))}
                        label={t("Show In Patient Report")}
                        className="fw-bold"
                        disabled={DefaultCurrencyName === "NPR"}
                      />
                    </div>
                    )}
                    {load ? (
                      <Loading />
                    ) : (
                      <button
                        type="button"
                        className="btn btn-success btn-block btn-sm mt-2"
                        id="btnSave"
                        onClick={handleUpload}
                        disabled={blockUpload}
                      >
                        {t("Upload File")}
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>}

          <div className="uploaded-file-preview mt-3">
            {!toView && <div className="d-flex justify-content-between px-3 ">
              <label className="mb-3">{t("Uploaded Files")}</label>
              <div className="mt-0">
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() =>
                    setUploadpatientImg({
                      ...uploadpatientImg,
                      show: true,
                    })
                  }
                >
                  <i className="fa fa-camera mr-2"></i>
                  {t("Open Camera")}
                </button>
              </div>
              {pageName === "Add Report" && showHeader && (
                <label>
                  <input
                    className="px-2"
                    type="checkbox"
                    onChange={(e) => setPrintHeader(e.target.checked ? 1 : 0)}
                    checked={printHeader === 1 ? true : false}
                  />
                  <span>{t("Print with Header/Footer")}</span>
                </label>
              )}
              {pageName === "centreMasterNabl" && (
                <label>
                  <input
                    name="isNabl"
                    type="checkbox"
                    checked={state?.isNabl}
                    onChange={(e) =>
                      setState({
                        ...state,
                        isNabl: e.target.checked ? 1 : 0,
                      })
                    }
                  />
                  <span>{t("isNabl")}</span>
                </label>
              )}
            </div>}
            <div 
              className="upload-file-preview-cont"
              style={{ border: "1px solid #dee2e6", borderRadius: "6px" }}  
            >
              {tableData && tableData.length > 0 ? (
                tableData.map((ele, index) => {
                  return (
                    <div className="upload-file-preview simple-box-container" key={index} >
                      <div className="preview-file">
                        {["jpeg", "jpg", "png", "webp"].includes(
                          ele?.awsKey.split(".").pop().toLowerCase(),
                        ) ? (
                          <img src={ele?.imgUrl} alt={"imgUrl"} />
                        ) : (
                          <span>
                            <i
                              style={{ cursor: "pointer" }}
                              className="fa fa-download mt-1 mr-2 reportPreview"
                              onClick={() => getS3url(ele?.awsKey)}
                            ></i>
                          </span>
                        )}
                      </div>
                      {pageName === "centreMasterNabl" ? (
                        <div className="document-details">
                          {/* <span>{ele?.DocumentName}</span> */}
                          <span>FromDate : {dateConfig(ele?.fromdate)}</span>
                          <span>IsNABL: {ele?.isNabl}</span>
                          <span>{ele?.CreatedByName}</span>
                          {/* <span
                          style={{
                            wordWrap: "break-word",
                            whiteSpace: "normal",
                            overflowWrap: "break-word",
                            display: "block",
                            maxWidth: "100%",
                          }}
                        >
                          {ele?.FileName}
                        </span> */}
                          {/* <span>{ele?.CreatedByName}</span> */}
                        </div>
                      ) : (
                        <div className="document-details">
                          <span>{selectedName(ele?.DocumentName)}</span>
                          <span>{dateConfig(ele?.dtEntry)}</span>
                          <span
                            style={{
                              wordWrap: "break-word",
                              whiteSpace: "normal",
                              overflowWrap: "break-word",
                              display: "block",
                              maxWidth: "100%",
                            }}
                          >
                            {ele?.FileName}
                          </span>
                          <span>{ele?.CreatedByName}</span>
                          <span style={{ fontSize: "15px", fontWeight: "700" }}>
                            {t("Show in report")}:{" "}
                            <strong style={{fontWeight: "900", fontSize: "18px"}}> {ele?.ShowInPatientReport === 1 ? t("Yes") : t("No")}</strong>
                          </span>
                        </div>
                      )}
                      <div>
                        <i
                          style={{ cursor: "pointer" }}
                          className="fa fa-eye mt-1 mr-2 mb-2"
                          onClick={() => getS3url(ele?.awsKey)}
                        ></i>
                        <br />
                        {pageName !== "centreMasterNabl" &&
                          pageName !== "ObservationNabl" &&
                          !toView && (
                            <i
                              style={{ cursor: "pointer" }}
                              className="fa fa-trash mt-2 mr-2"
                              onClick={() =>
                                blockUpload
                                  ? null
                                  : setConfirmDelete({ show: true, id: ele?.ID_Hash })
                              }
                              disabled={false}
                            ></i>
                          )}
                        
                        
                        {toView &&
                          <input
                            type="checkbox"
                            onChange={(e) =>
                              handleCheckboxChange(e.target.checked, ele?.awsKey)
                            }
                            checked={selectedFiles.includes(ele?.awsKey)}
                          />}

                      </div>
                    </div>
                  );
                })
              ) : (
                <span className="w-100 text-center">
                  {t("No files uploaded")}
                </span>
              )}

            </div>
            {toView  && (
              <div className="d-flex text-center  mt-3 px-3">
                <button
                  className="btn btn-success btn-sm"
                  onClick={handleSubmitReport}
                >
                  Submit
                </button>
              </div>
            )}
          </div>
        </div>
      </Dialog>

      <Dialog
        header={t("Confirm Delete")}
        visible={confirmDelete.show}
        style={{ width: isMobile ? "90vw" : "20vw" }}
        className={theme}
        onHide={() => setConfirmDelete({ show: false, id: null })}
        modal
      >
        <div className="p-3 text-center">
          <p style={{
            fontSize: "20px",
            fontWeight: "600",
          }}>{t("Do you want to delete?")}</p>
          <div className="d-flex justify-content-around gap-3 mt-4">
            <CustomButton
              style={{
                background: "#5d5d5dff",
              }}
              icon={"cancel"}
              text="Cancel"
              isLoading={false}
              onClick={() => setConfirmDelete({ show: false, id: null })}
            />
            <CustomButton
              style={{
                background: "#ff4545ff",
              }}
              text="Confirm"
              icon={"check"}
              isLoading={false}
              onClick={() => {
                DeleteImage(confirmDelete.id);
                setConfirmDelete({ show: false, id: null });
              }}
            />
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default UploadFile;
