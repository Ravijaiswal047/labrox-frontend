import React from "react";
import * as XLSX from "xlsx";
import { useEffect } from "react";
import { useState } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { axiosInstance } from "../../utils/axiosInstance";
import { getDepartment } from "../../utils/NetworkApi/commonApi";
import Tables from "../../components/UI/customTable";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import Accordion from "../../components/UI/Accordion";
import { SelectBox } from "../../components/formComponent/SelectBox";
import Loading from "../../components/loader/Loading";

const ImportExportInvestigations = () => {
  const { t } = useTranslation();
  const [ExportExcel, setExportExcel] = useState([]);
  const [ExcelPreview, setExcelPreview] = useState({
    header: [],
    body: [],
    exportJSON: [],
  });
  const [show, setShow] = useState(false);
  const [load, setLoad] = useState(false);
  const [department, setDepartment] = useState([]);
  const [history, setHistory] = useState([]);
  const [payload, setPayload] = useState({
    DepartmentID: "",
    selectedFile: "",
    SearchDateDepartmentID: "",
  });

  const [documentId, setDocumentID] = useState("");
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
    setDocumentID(guidNumber);
  };
  const S4 = () => {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };

  const getHistory = (value) => {
    axiosInstance
      .post("Investigations/DownloadPreviousInvestigations", {
        DepartmentId: value,
      })
      .then((res) => {
        if (res?.data?.success) {
          let data = res?.data?.message;
          let historys = data?.map((ele) => {
            return {
              value: ele?.awskey,
              label: "Updated at " + ele?.dtentry,
            };
          });
          setHistory(historys);
        } else {
          setHistory([]);
        }
      })
      .catch((err) =>
        console.log(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Something Went Wrong",
        ),
      );
  };
  useEffect(() => {
    guidNumber();
    getHistory("");
  }, []);
  console.log(payload, ExcelPreview);
  const getData = () => {
    axiosInstance
      .post("CommonController/GetFileUrl", {
        Key: payload?.selectedFile,
      })
      .then((res) => {
        const url = res?.data?.message;
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", ""); //or any other extension
        document.body.appendChild(link);
        link.click();
      })
      .catch((err) =>
        toast.error(err?.res?.data ? err?.res?.data : "Something Went Wrong"),
      );
  };

  const uploadFile = (event) => {
    let fileObj = event?.target?.files[0];

    var reader = new FileReader();

    reader.readAsArrayBuffer(fileObj);

    reader.onload = () => {
      // Make a fileInfo Object
      var data = new Uint8Array(reader.result);
      var work_book = XLSX.read(data, { type: "array" });
      var sheet_name = work_book.SheetNames;
      var exportJSON = XLSX.utils.sheet_to_json(
        work_book.Sheets[sheet_name[0]],
      );
      var sheet_data = XLSX.utils.sheet_to_json(
        work_book.Sheets[sheet_name[0]],
        {
          header: 1,
        },
      );
      setExcelPreview({
        ...ExcelPreview,
        header: sheet_data[0],
        body: sheet_data.slice(1, sheet_data.length),
        exportJSON: exportJSON,
      });
    };
  };
  useEffect(() => {
    getDepartment(setDepartment, "getDepartmentEmployeeMaster");
  }, []);

  console.log(document.getElementById("file")?.files[0]);
  const ExportToExcels = async (dataExcel) => {
    if (payload?.DepartmentID) {
      if (dataExcel?.length > 0 || !dataExcel) {
        const worksheet = XLSX.utils.json_to_sheet(dataExcel);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
        XLSX.writeFile(workbook, "data.xlsx");
      } else {
        toast?.error("No Record Found");
      }
    } else {
      toast.error("Please Select Department first !!...");
    }
  };

  const handleSaveToDatabase = () => {
    setLoad(true);
    axiosInstance
      .post("Investigations/BulkUpdateInvestigation", {
        InvestigationData: ExcelPreview?.exportJSON,
      })
      .then((res) => {
        toast.success(res?.data?.message);
        handleUpload();
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Error Found",
        );
        setLoad(false);
      });
  };
  const handleUpload = async () => {
    let formData = new FormData();
    formData.append("file", document.getElementById("file").files[0]);
    formData.append("Page", "ImportExportInvestigations");
    formData.append("DepartmentId", ExcelPreview?.exportJSON[0]?.DepartmentId);
    formData.append("Guid", documentId);
    await axiosInstance
      .post("CommonController/UploadDocument", formData)
      .then((res) => {
        toast.success(res?.data?.message);
        document.getElementById("file").value = "";
        setExportExcel([]);
        setExcelPreview({ header: [], body: [], exportJSON: [] });
        setPayload({
          ...payload,
          DepartmentID: "",
        });
        setLoad(false);
        setShow(false);
        setDocumentID("");
        guidNumber();
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
  console.log(ExportExcel);
  const getInvestigations = (value) => {
    axiosInstance
      .post("Investigations/GetInvestigation", {
        DepartmentID: value,
      })
      .then((res) => {
        setExportExcel(res?.data?.message);
      })
      .catch((err) => {
        setExportExcel([]);
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Something Went Wrong",
        );
      });
  };
  const handleSelect = (e) => {
    const { name, value } = e.target;
    if (name === "DepartmentID") {
      setPayload({ ...payload, [name]: value });
      getInvestigations(value);
    } else if (name === "SearchDateDepartmentID") {
      setHistory([]);

      setPayload({ ...payload, [name]: value, selectedFile: "" });
      getHistory(value);
    } else {
      setPayload({ ...payload, [name]: value });
    }
  };

  return (
    <>
      <Accordion
        name={t("Import Export Investigations")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row pt-2 pl-2 pr-2 pb-2">
          <div className="col-sm-6">
            <div className="row">
              <div className="col-sm-4">
                <SelectBox
                  name="DepartmentID"
                  options={[
                    { label: "Select Department", value: "" },
                    ...department,
                  ]}
                  lable="Department"
                  id="Department"
                  selectedValue={payload?.DepartmentID}
                  onChange={handleSelect}
                />
              </div>

              <div className="col-sm-4">
                <button
                  className="btn btn-block btn-primary btn-sm"
                  onClick={() => ExportToExcels(ExportExcel)}
                >
                  {t("Download Investigations")}
                </button>
              </div>
              <div className="col-sm-4" style={{ cursor: "pointer" }}>
                <input
                  type="file"
                  className="form-control-file"
                  onChange={uploadFile}
                  id="file"
                />
              </div>
            </div>{" "}
            <div className="row">
              <div className="col-sm-4">
                <button
                  className="btn btn-block btn-primary btn-sm"
                  onClick={() => {
                    setShow(true);
                  }}
                  disabled={
                    document.getElementById("file")?.value === "" ||
                    !document.getElementById("file")?.value
                      ? true
                      : false
                  }
                >
                  {t("Upload Investigations")}
                </button>
              </div>
              <div className="col-sm-4">
                {load ? (
                  <Loading />
                ) : (
                  <button
                    className="btn btn-block btn-success btn-sm"
                    onClick={() => handleSaveToDatabase()}
                    disabled={
                      ExcelPreview?.exportJSON?.length === 0 ? true : false
                    }
                  >
                    {t("Save To Database")}
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="col-sm-6">
            <Accordion
              title={t(
                "Select to download previous files ( Filter by department )",
              )}
              defaultValue={true}
            >
              <div className="row pt-2 pl-2 pr-2 pb-2">
                <div className="col-sm-4">
                  <SelectBox
                    name="SearchDateDepartmentID"
                    options={[
                      { label: "Select Department", value: "" },
                      ...department,
                    ]}
                    lable="Select Department"
                    id="Select Department"
                    selectedValue={payload?.SearchDateDepartmentID}
                    onChange={handleSelect}
                  />
                </div>
                <div className="col-sm-4">
                  <SelectBox
                    style={{ textAlign: "end" }}
                    options={[
                      {
                        label: "Select Updated Date&Time",
                        value: "",
                      },
                      ...history,
                    ]}
                    lable="Select Updated Date&Time"
                    id="Select Updated DateAndTime"
                    name="selectedFile"
                    selectedValue={payload?.selectedFile}
                    onChange={handleSelect}
                  />
                </div>
                <div className="col-sm-4">
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => getData()}
                    disabled={payload?.selectedFile === "" ? true : false}
                  >
                    {t("Download")}
                  </button>
                </div>
              </div>
            </Accordion>
          </div>
        </div>

        {show && (
          <>
            {ExportExcel ? (
              <div
                className="p-2"
                style={{
                  maxHeight: "410px",
                  overflow: "auto",
                }}
              >
                <Tables>
                  <thead>
                    <tr>
                      {ExcelPreview?.header?.slice(0, -1)?.map((ele, index) => (
                        <th key={index}>{ele}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ExcelPreview?.body?.map((ele, index) => (
                      <tr key={index}>
                        {ele?.slice(0, -1)?.map((data, ind) => (
                          <td data-title={ele} key={ind}>
                            {data} &nbsp;
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </Tables>
              </div>
            ) : (
              <NoRecordFound />
            )}
          </>
        )}
      </Accordion>
    </>
  );
};

export default ImportExportInvestigations;
