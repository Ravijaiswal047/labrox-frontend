import React, { useEffect, useState } from "react";
import Accordion from "@app/components/UI/Accordion";
import Input from "../../components/formComponent/Input";
import { SelectBox } from "../../components/formComponent/SelectBox";
import ExportFile from "../../components/formComponent/ExportFile";
import * as XLSX from "xlsx";
import moment from "moment";
import { toast } from "react-toastify";
import { axiosInstance } from "../../utils/axiosInstance";

import { useTranslation } from "react-i18next";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { getAccessCentresBulk, getAccessDataRate, getDoctorSuggestion } from "../../utils/NetworkApi/commonApi";
import { autocompleteOnBlur } from "../../utils/helpers";

const options = [
  {
    label: "Bulk Registration",
    value: "1",
  },
];

const BulkRegistration = () => {
  const [RateType, setRateType] = useState([]);
  const [CentreData, setCentreData] = useState([]);
  const [doctorSuggestion, setDoctorSuggestion] = useState([]);
  const [indexMatch, setIndexMatch] = useState(0);
  const [dropFalse, setDropFalse] = useState(true);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [excelFile, setExcelFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const PATIENT_HEADER = [
    {
      Title: "",
      PatientName: "",
      Centre: "",
      CentreID: "",
      RateTypeID: "",
      RateTypeName: "",
      DOB: "",
      Gender: "",
      AgeYear: "",
      DoctorID: "",
      DoctorName: "",
      TestId: "",
      IsPackage: "",
      Mobile: "",
      SampleCollectionDate: "",
      SampleCollectionTime: "",
    },
  ];

  const [formData, setFormData] = useState({
    CentreID: "",
    CentreName: "",
    RateID: 0,
    DoctorName: "",
    DoctorID: 0,
  });

  const { t } = useTranslation();
  const [tableData, setTableData] = useState(PATIENT_HEADER);
  const [dropValue, setDropValue] = useState("1");
  const [ExcelPreview, setExcelPreview] = useState({
    header: [],
    body: [],
    exportJSON: [],
  });

  const uploadFile = (event) => {
    let fileObj = event.target.files[0];
    setExcelFile(fileObj);

    var reader = new FileReader();

    reader.readAsArrayBuffer(fileObj);

    reader.onload = () => {
      // Make a fileInfo Object
      var data = new Uint8Array(reader.result);
      var work_book = XLSX.read(data, { type: "array" });
      var sheet_name = work_book.SheetNames;
      var exportJSON = XLSX.utils.sheet_to_json(
        work_book.Sheets[sheet_name[0]]
      );
      var sheet_data = XLSX.utils.sheet_to_json(
        work_book.Sheets[sheet_name[0]],
        {
          header: 1,
        }
      );
      console.log(exportJSON);
      setExcelPreview({
        ...ExcelPreview,
        header: sheet_data[0],
        body: sheet_data.slice(1, sheet_data.length),
        exportJSON: exportJSON,
      });
    };
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

  const handleSPlit = (data, sepa) => {
    const finalData = data?.toString();
    return finalData ? finalData.split(sepa) : [];
  };
  const calculateDOB = (dob) => {
    console.log(dob, "test");
    if (dob != "") {
      const currentDate = new Date();
      const currentYear = currentDate?.getFullYear();
      const birthYear = currentYear - dob;
      return birthYear;
    } else return 0;
  };

  const handlePayloadAndURL = () => {
    if (dropValue === "1") {
      console.log(ExcelPreview?.exportJSON);
      const data = ExcelPreview?.exportJSON?.map((ele) => {
        return {
          PatientData: {
            DOB:
              ele?.DOB === "" || !ele?.DOB
                ? String(calculateDOB(ele?.Age))
                : String(ele?.DOB || 0),
            Age: Number(ele?.Age || 0),
            AgeYear: Number(ele?.Age || 0),
            Title: ele?.Title,
            FirstName: ele?.PatientName,
            CentreID: ele?.CentreID,
            Gender: ele?.Gender,
            Mobile: String(ele?.Mobile || ""),
          },
          LTData: {
            PName: ele?.Title + " " + ele?.PatientName,
            Age: String(ele?.Age || ""),
            Gender: ele?.Gender,
            CentreName: ele?.Centre,
            DoctorID: ele?.DoctorID,
            DoctorName: ele?.DoctorName,
            CentreID: ele?.CentreID,
            RateTypeName: ele?.RateTypeName,
            RateTypeID: ele?.RateTypeID,
            LedgerTransactionIDHash: guidNumber(),
          },
          PLO: handleSPlit(ele?.TestCode, ",").map((datas) => {
            return {
              // ItemId: datas,
              // InvestigationID: datas,
              ItemId: String(ele?.TestCode || ele?.TestId || ""),
              InvestigationID: String(ele?.TestCode || ele?.TestId || ""),
              Gender: ele?.Gender,
              CentreID: ele?.CentreID,
              IsPackage: 0,
              SampleCollectionDateTime:
                ele?.SampleCollectionDate + " " + ele?.SampleCollectionTime,
              Status:
                !ele?.SampleCollectionDate || ele?.SampleCollectionDate === ""
                  ? "1"
                  : "2",
            };
          }),
        };
      });
      return {
        URL: "Camp/BulkSaveData",
        payload: data,
      };
    } else if (dropValue === "2") {
      return {
        URL: "SC/BulkSampleCollecitonReceive",
        payload: ExcelPreview?.exportJSON,
      };
    } else if (dropValue === "3") {
      return {
        URL: "SC/BulkDepatmentReceive",
        payload: ExcelPreview?.exportJSON,
      };
    }
  };

  const handleSaveToDatabase = () => {
    const { URL, payload } = handlePayloadAndURL();

    if (dropValue === "1") {
      const fd = new FormData();
      fd.append("file", excelFile);
      setSaving(true);
      axiosInstance
        .post(URL, fd)
        .then((res) => {
          document.getElementById("file").value = "";
          setExcelFile(null);
          const batchId = res?.data?.batchId;
          if (!batchId) {
            toast.success(res?.data?.message || "Saved successfully.");
            setSaving(false);
            return;
          }
          toast.info("File uploaded. Processing in background...");
          const poll = setInterval(() => {
            axiosInstance
              .get(`Camp/BulkSaveStatus/${batchId}`)
              .then((statusRes) => {
                const status = statusRes?.data?.status;
                if (status === "Completed") {
                  clearInterval(poll);
                  setSaving(false);
                  toast.success(statusRes?.data?.message || "Bulk save completed.");
                } else if (status === "Failed") {
                  clearInterval(poll);
                  setSaving(false);
                  toast.error(statusRes?.data?.message || "Bulk save failed.");
                }
              })
              .catch(() => {
                clearInterval(poll);
                setSaving(false);
                toast.error("Error checking save status.");
              });
          }, 3000);
        })
        .catch((err) => {
          setSaving(false);
          toast.error(err?.response?.data?.message || "Upload failed.");
        });
    } else {
      axiosInstance
        .post(URL, { Data: payload })
        .then((res) => {
          document.getElementById("file").value = "";
          toast.success(res?.data?.message);
        })
        .catch((err) => {
          toast.error(err?.response?.data?.message);
        });
    }
  };

  const SearchURL = (value) => {
    return value === "2"
      ? "SearchBulkSampleColleciton"
      : "SearchBulkDepatmentReceive";
  };

  const handleSelect = (e) => {
    const { value } = e.target;
    setDropValue(value);
    if (["1", "2"].includes(value)) {
      axios
        .post(`SC/${SearchURL(value)}`)
        .then((res) => {
          setTableData(res?.data?.message);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };
  const handleListSearchNew = (data, name) => {
    switch (name) {
      case "DoctorName":
        setFormData({
          ...formData,
          [name]: data.Name,
          DoctorID: data?.DoctorReferalID,
        });
        setIndexMatch(0);
        setDoctorSuggestion([]);
        setDropFalse(false);
        break;

      case "TestName":
        setFormData({
          ...formData,
          [name]: data.TestName,
        });

        setSelects(false);
        setIndexMatch(0);
        setTestSuggestion([]);
        break;
      default:
        break;
    }
  };
  const handleIndex = (e, index) => {
    const { name } = e.target;
    switch (name) {
      case "DoctorName":
        switch (e.which) {
          case 38:
            if (doctorSuggestion.length > 0) {
              if (indexMatch !== 0) {
                setIndexMatch(indexMatch - 1);
              } else {
                setIndexMatch(doctorSuggestion.length - 1);
              }
              setTimeout(() => {
                const el = document.querySelector(".matchIndex");
                if (el) el.scrollIntoView({ block: "nearest" });
              }, 0);
            }
            break;
          case 40: // Down
            if (doctorSuggestion.length > 0) {
              if (doctorSuggestion.length - 1 === indexMatch) {
                setIndexMatch(0);
              } else {
                setIndexMatch(indexMatch + 1);
              }
              setTimeout(() => {
                const el = document.querySelector(".matchIndex");
                if (el) el.scrollIntoView({ block: "nearest" });
              }, 0);
            }
            break;
          case 13:
            if (doctorSuggestion.length > 0 && doctorSuggestion[indexMatch]) {
              handleListSearchNew(doctorSuggestion[indexMatch], name);
            }
            setIndexMatch(0);
            break;
          default:
            break;
        }
        break;

      default:
        break;
    }
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name == "DoctorName") {
      if (value == "") {
        setDoctorSuggestion([]);
      } else {
        setDoctorSuggestion((prev) =>
          prev.filter((ele) =>
            ele.Name?.toLowerCase().includes(value.toLowerCase()),
          ),
        );
      }
      setFormData({ ...formData, [name]: value, });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };
  const handleRateType = (value) => {
    if (value) {
      getAccessDataRate(setRateType, value)
    }
  };

  const handleSearchSelectChange = (label, value) => {
    if (label === "CentreID") {
      setFormData({
        ...formData,
        ["CentreID"]: value?.value,
        CentreName: value?.label,
      });
      handleRateType(value?.value);
    }
    if (label === "RateID") {
      setFormData({
        ...formData,
        ["RateID"]: value?.value,
      })
    }
  }

  useEffect(() => {
    getAccessCentresBulk(
      setCentreData,
      formData,
      setFormData,
      handleRateType,
    )
  }, [])

  useEffect(() => {
    getDoctorSuggestion(formData, setDoctorSuggestion, setFormData);
    if (formData?.DoctorName === "") {
      setDropFalse(true);
    }
  }, [formData?.DoctorName]);

  const getExcelData = () => {
    if (!formData?.CentreID) {
      toast.error("Please select Centre")
      return;
    }
    if (!formData?.RateID || formData?.RateID === 0) {
      toast.error("Please select Rate Type")
      return;
    }
    if (!formData?.DoctorName) {
      toast.error("Please select Refer Doctor")
      return;
    }
    axiosInstance
      .post("/Camp/DownloadBulkInsertedExcel", {
        CentreId: formData?.CentreID,
        RateTypeId: formData?.RateID,
        doctorId: formData?.DoctorID,
        DocumentType: 1,
      }, { responseType: "blob" })
      .then((res) => {
        setLoadingSearch(false);
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `${"BulkRegistration"}.xlsx`);
        document.body.appendChild(link);
        link.click();
      })
      .catch((err) => {
        setLoadingSearch(false);
        console.log(err)
      });
  };
  return (
    <>
      <Accordion
        name={t("Bulk Registration")}
        isBreadcrumb={true}
        defaultValue={true}
      >
        <div className="row  px-2 mt-2">
          <div className="col-sm-2">
            <SelectBox
              options={options}
              onChange={handleSelect}
              value={dropValue}
              name="BulkRegistration"
              id="BulkRegistration"
              lable="Bulk Registration"
            />
          </div>
          <div className="col-sm-2 col-6">
            <ReactSelect
              dynamicOptions={CentreData}
              name="CentreID"
              lable={t("Centre")}
              id="Centre"
              removeIsClearable={true}
              placeholderName={t("Centre")}
              value={formData?.CentreID}
              onChange={handleSearchSelectChange}
            />
          </div>
          <div className="col-sm-2 col-6">
            <ReactSelect
              dynamicOptions={RateType}
              name="RateID"
              lable={t("RateType")}
              id="RateType"
              removeIsClearable={true}
              placeholderName={t("RateType")}
              value={formData?.RateID}
              onChange={handleSearchSelectChange}
            />
          </div>
          <div className="col-sm-2  ">
            <Input
              type="text"
              lable="Refer Doctor"
              id="DoctorName"
              name="DoctorName"
              value={formData.DoctorName}
              onChange={handleChange}
              placeholder=" "
              onKeyDown={(e) => handleIndex(e, "DoctorName")}
              onBlur={(e) => {
                autocompleteOnBlur(setDoctorSuggestion);
                setTimeout(() => {
                  const data = doctorSuggestion.filter(
                    (ele) => ele?.Name === e.target.value,
                  );
                  if (data.length === 0) {
                    setFormData({ ...formData, DoctorName: "" });
                  }
                }, 500);
              }}
              autoComplete="off"
            />
            {dropFalse &&
              doctorSuggestion.length > 0 &&
              formData.DoctorName && (
                <ul className="suggestion-data">
                  {doctorSuggestion.map((data, index) => (
                    <li
                      onClick={() => handleListSearchNew(data, "DoctorName")}
                      className={`${index === indexMatch && "matchIndex"}`}
                      key={index}
                    >
                      {data?.Name}
                    </li>
                  ))}
                </ul>
              )}
          </div>
          <div className="col-sm-2">
            {/* <ExportFile dataExcel={tableData} /> */}
            {loadingSearch ? (
              <Loading />
            ) : (
              <button
                className="btn-block btn btn-success btn-sm "
                onClick={getExcelData}
              >
                {t("Download")}
              </button>
            )}
          </div>
          <div className="col-sm-2">
            <input
              type="file"
              className="form-control-file"
              onChange={uploadFile}
              id="file"
            />
          </div>
          <div className="col-sm-2">
            <button
              className="btn btn-block btn-primary btn-sm"
              onClick={() => handleSaveToDatabase()}
              disabled={ExcelPreview?.exportJSON?.length === 0 || saving}
            >
              {saving ? t("Processing...") : t("Save To Database")}
            </button>
          </div>
        </div>
      </Accordion>
    </>
  );
};

export default BulkRegistration;
