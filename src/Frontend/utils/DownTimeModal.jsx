import { Dialog } from "primereact/dialog";
import React, { useEffect, useState } from "react";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { axiosInstance } from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { CKEditor } from "ckeditor4-react";
import { dateConfig } from "../../utils/helpers";

const DownTimeModal = ({
  show,
  handleShow,
  state,
  PageName,
  page,
  title,
  status,
  setShow,
}) => {
  const theme = useLocalStorage("theme", "get");
  const { t } = useTranslation();
  const [tableData, setTableData] = useState([]);
  console.log({ PageName });

  const editorConfig = {
    toolbar: [],
    extraPlugins: "autogrow",
    autoGrow_minHeight: 50,
    removePlugins: "elementspath,resize",
    readOnly: true,
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

  const Fetch = async () => {
    try {
      const response = await axiosInstance.post(
        "CommonController/GetDocument",
        {
          Page: "downtimemaster",
          Guid: PageName?.DownTimeIdHash,
          CompanyId: "",
        },
      );
      const documents = response?.data?.message || [];
      const tableData = await Promise.all(
        documents.map(async (data) => {
          const imgUrl = await getimgurl(data?.awsKey);
          return { ...data, imgUrl };
        }),
      );
      setTableData(tableData);
    } catch (err) {
      toast.error(
        err?.response?.data?.message
          ? err?.response?.data?.message
          : t("Something Went Wrong"),
      );
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

  useEffect(() => {
    Fetch();
  }, []);

  const isMobile = window.innerWidth <= 768;
  return (
    <>
      <Dialog
        header={title}
        visible={show}
        top={"25%"}
        className={theme}
        onHide={handleShow}
        style={{
          width: isMobile ? "80vw" : "70vw",
        }}
      >
        <div>
          {/* <textarea
            style={{ width: "60vh", height: "30vh" }}
            className="form-control-txtarea p-2"
            name="CustomReason"
            value={PageName?.Points}
            disabled
          ></textarea> */}
          <CKEditor
            initData={
              PageName?.Points !== ""
                ? PageName?.Points
                : "<p>*** NO DATA AVAILABLE ***</p>"
            }
            config={editorConfig}
          />
          <div className="uploaded-file-preview t-3 mt-3">
            <div className="d-flex justify-content-between px-3 ">
              <label className="mb-3">Uploaded Files</label>
            </div>
            <div className="upload-file-preview-cont simple-box-container">
              {tableData && tableData.length > 0 ? (
                tableData.map((ele, index) => {
                  return (
                    <div className="upload-file-preview" key={index}>
                      <div className="preview-file">
                        {["jpeg", "jpg", "png"].includes(
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
                      <div className="document-details">
                        <span>{ele?.DocumentName}</span>
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
                      </div>
                      <div>
                        <i
                          style={{ cursor: "pointer" }}
                          className="fa fa-download mt-3 mr-2"
                          onClick={() => getS3url(ele?.awsKey)}
                        ></i>
                      </div>
                    </div>
                  );
                })
              ) : (
                <span className="w-100 text-center">No files uploaded</span>
              )}
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default DownTimeModal;
