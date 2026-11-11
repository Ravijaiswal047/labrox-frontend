import React, { useEffect, useState } from "react";
import Accordion from "../../components/UI/Accordion";
import { toast } from "react-toastify";
import Tables from "../../components/UI/customTable";
import { axiosInstance } from "../../utils/axiosInstance";
import Loading from "../../components/loader/Loading";

import { useTranslation } from "react-i18next";
import { CancelButton, SaveButton } from "../../components/UI/CustomButton";
const TermsAndConditions = () => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [load, setLoad] = useState(false);
  const [id, setId] = useState("");
  const handleFileChange = (event) => {
    if (!file) {
      const selectedFile = event.target.files[0];
      setFile(selectedFile);
      setFileName(selectedFile.name);
      event.target.value = "";
    } else {
      toast.error("Please Remove File to Upload New File");
    }
  };

  const { t } = useTranslation();
  console.log(file, id);
  const handleRemoveFile = () => {
    setLoad(true);
    axiosInstance
      .post("CommonController/InActiveDocument", {
        Hash_Id: id,
      })
      .then((res) => {
        setLoad(false);
        toast.success(res?.data?.message);
        getS3url();
        setFileName(null);
        setTableData([]);
        setFile(null);
        setId(guidNumber());
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
      return null;
    }
  };
  const S4 = () => {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };
  const guidNumber = () => {
    const guidNumber =
      S4() +
      S4() +
      "-" +
      S4() +
      "-" +
      S4() +
      "-" +
      S4() +
      "-" +
      S4() +
      "-" +
      S4() +
      S4();
    return guidNumber;
  };
  const getS3url = () => {
    setLoad(true);
    axiosInstance
      .post("CommonController/GetTermsCondition", {
        page: "TermConditions",
      })
      .then((res) => {
        setLoad(false);
        if (res?.data?.message?.length > 0) {
          const url = res?.data?.message[0]?.ID_Hash;
          Fetch(url);
          setTableData(res?.data?.message);
          setFileName(res?.data?.message[0]?.FileName);
          setId(url);
        } else {
          setId(guidNumber());
        }

        // setUrl(url);
      })
      .catch((err) => {
        setFile(null);
        setFileName(null);
        setTableData([]);
        setId(guidNumber());
        setLoad(false);
        console.log(err);
      });
  };
  const handleSave = async (e) => {
    e.preventDefault();

    if (!file) {
      toast.error("Please attach a file first.");
    } else {
      if (tableData?.length > 0) {
        toast.error("Please Remove File to Upload New File");
      } else {
        setLoad(true);
        let formData = new FormData();
        formData.append("file", file);
        formData.append("DocumentID", "");
        formData.append("Page", "TermConditions");
        formData.append("DocumentName", "");
        formData.append("Guid", id);
        formData.append("FileName", "");
        formData.append("CompanyId", "");
        await axiosInstance
          .post("CommonController/UploadDocument", formData)
          .then((res) => {
            setLoad(false);
            toast.success(res?.data?.message);
            getS3url();
            setFile(null);
          })
          .catch((err) => {
            setLoad(false);
            toast.error(
              err?.response?.data?.message
                ? err?.response?.data?.message
                : t("Something Went Wrong"),
            );
          });
      }
    }
  };

  const Fetch = async (id) => {
    try {
      const response = await axiosInstance.post(
        "CommonController/GetDocument",
        {
          Page: "TermConditions",
          Guid: id,
        },
      );
      const documents = response?.data?.message || [];
      const datas = await Promise.all(
        documents.map(async (data) => {
          const imgUrl = await getimgurl(data?.awsKey);
          return { ...data, imgUrl };
        }),
      );
      setFile(datas);
      console.log(datas);
    } catch (err) {
      toast.error(
        err?.response?.data?.message
          ? err?.response?.data?.message
          : t("Something Went Wrong"),
      );
    }
  };
  useEffect(() => {
    getS3url();
  }, []);

  return (
    <div>
      <Accordion
        name={t("Terms And Conditions")}
        isBreadcrumb={true}
        defaultValue={true}
      >
        <Tables>
          <thead>
            <tr>
              <th>{t("Upload Terms And Conditions")}</th>
              <th>{t("Action")}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td data-title="Upload TermsAndConditions">
                <div className="d-flex">
                  <div className="me-3 ml-2 p-2">
                    <input
                      type="file"
                      onChange={handleFileChange}
                      id="file"
                      disabled={tableData?.length > 0}
                      accept=".pdf"
                    />
                  </div>
                  {file && (
                    <div className="me-3 d-flex align-items-center">
                      <p className="text-info me-2 mb-0">
                        {"Selected file"}: {fileName}
                      </p>
                      <CancelButton
                          text={"Remove"}
                          onClick={handleRemoveFile}
                          className="ml-3 mr-4"
                      />
                    </div>
                  )}
                </div>
              </td>

              <td data-title="Action">
                {load ? (
                  <Loading />
                ) : (
                  <div>
                    <SaveButton
                        text={"Submit"}
                        className="ml-3 mt-1"
                      onClick={handleSave}
                    />
                  </div>
                )}
              </td>
            </tr>
          </tbody>
        </Tables>
      </Accordion>
    </div>
  );
};

export default TermsAndConditions;
