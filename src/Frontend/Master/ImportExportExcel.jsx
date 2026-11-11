import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { axiosInstance } from "../../utils/axiosInstance";
import * as XLSX from "xlsx";
import Accordion from "@app/components/UI/Accordion";
import { SelectBox } from "../../components/formComponent/SelectBox";
import Input from "../../components/formComponent/Input";
import ExportFile from "../../components/formComponent/ExportFile";
import Loading from "../../components/loader/Loading";
import Tables from "../../components/UI/customTable";
import { CustomButton, SaveButton } from "../../components/UI/CustomButton";

const ImportExportExcel = () => {
  const [CentreId, setCentreId] = useState([]);
  const [ExportExcel, setExportExcel] = useState([]);
  const [show, setShow] = useState(false);
  const [ExcelPreview, setExcelPreview] = useState({
    header: [],
    body: [],
    exportJSON: [],
  });
  const [load, setLoad] = useState(false);

  const [payload, setPayload] = useState({
    CentreId: "",
    ImportExportData: "",
  });
  const { t } = useTranslation();
  const options = [
    {
      label: "RateList",
      value: "RateList",
    },
    {
      label: "DoctorReferal",
      value: "DoctorReferal",
    },
    {
      label: "Ratetypeshare",
      value: "Ratetypeshare",
    },
  ];

  const uploadFile = (event) => {
    if (payload?.CentreId && payload?.ImportExportData) {
      let fileObj = event.target.files[0];

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

        console.log("dataExcel:::", exportJSON);
        setExcelPreview({
          ...ExcelPreview,
          header: sheet_data[0],
          body: sheet_data.slice(1, sheet_data.length),
          exportJSON: exportJSON,
        });
      };
    } else {
      toast.error("Please Select Centre And Import Method");
      document.getElementById("file").value = "";
    }
  };

  const handleSaveToDatabase = (url) => {
    setLoad(true);
    axiosInstance
      .post(url, ExcelPreview?.exportJSON)
      .then((res) => {
        if (res?.data?.success) {
          toast.success(res?.data?.message);
          setPayload({
            CentreId: "",
            ImportExportData: "",
          });
          document.getElementById("file").value = "";
          setExportExcel([]);
          setExcelPreview({ header: [], body: [], exportJSON: [] });
        } else {
          toast.error(res?.data?.message);
        }
        setLoad(false);
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPayload({ ...payload, [name]: value, ItemValue: "" });
    document.getElementById("file").value = "";
  };

  useEffect(() => {
    if (payload?.CentreId && payload?.ImportExportData) fetch();
  }, [payload]);

  const fetch = () => {
    setLoad(true);
    axiosInstance
      .post("CommonController/DownloadRateList", payload)
      .then((res) => {
        setLoad(false);
        setExportExcel(res?.data?.message);
      })
      .catch((err) => {
        setLoad(false);
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Something Went Wrong",
        );
      });
  };

  const APiURL = (type) => {
    console.log(type);
    switch (type) {
      case "RateList":
        return "/CommonController/SaveReferalListExcelToDataBase";
        break;
      case "DoctorReferal":
        return "/CommonController/SaveDoctorReferalExcelToDataBase";
        break;
      case "Ratetypeshare":
        return "/CommonController/SaveRateTypeShare";
        break;
      default:
        break;
    }
  };

  const getRateCenters = (state) => {
    axiosInstance
      .get("/centre/getRateList")
      .then((res) => {
        let data = res.data.message;

        let CentreDataValue = data.map((ele) => {
          return {
            value: ele.CentreID,
            label: ele.Centre,
          };
        });

        state(CentreDataValue);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    getRateCenters(setCentreId);
  }, []);
  return (
    <>
      <Accordion
        name={t("Import Export Excel")}
        isBreadcrumb={true}
        defaultValue={true}
      >
        <div className="row pt-2 pl-2 pr-2 mt-1">
          <div className="col-sm-2">
            <SelectBox
              className="required-fields"
              options={[{ label: "Select", value: "" }, ...options]}
              id="SelectType"
              lable="Select Type"
              name="ImportExportData"
              value={payload?.ImportExportData}
              onChange={handleChange}
            />
          </div>
          <div className="col-sm-2">
            <SelectBox
              className="required-fields"
              options={[{ label: "Select Centre", value: "" }, ...CentreId]}
              name="CentreId"
              id="CentreID"
              lable="Centre"
              value={payload?.CentreId}
              onChange={handleChange}
            />
          </div>
          <div className="col-sm-3">
            <input
              type="file"
              // className="form-control-file required-fields"
              onChange={uploadFile}
              id="file"
            />
          </div>
        </div>
        <div className="row pt-1 pl-2 pr-2 pb-2">
          <div className="col-sm-2">
            <ExportFile dataExcel={ExportExcel} />
          </div>
          <div className="col-sm-2">
            <CustomButton
              text={"Upload"}
              icon={"upload"}
               className="btn-block"
              onClick={() => {
                setShow(true);
              }}
              disabled={
                document.getElementById("file")?.value === "" ? true : false
              }
            />
          </div>
          <div className="col-sm-2">
            {load ? (
              <Loading />
            ) : (
              <SaveButton
                  text={"Save To Database"}
                  className="btn-block"
                  onClick={() =>
                    handleSaveToDatabase(APiURL(payload?.ImportExportData))
                  }
                disabled={ExcelPreview?.exportJSON?.length === 0 ? true : false}
              />
            )}
          </div>
        </div>
      </Accordion>
      {show && (
        <div className="row px-2 ">
          <div className="col-12">
            <Tables>
              <thead>
                <tr>
                  {ExcelPreview?.header?.map((ele, index) => (
                    <th key={index}>{ele}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ExcelPreview?.body?.map((ele, index) => (
                  <tr key={index}>
                    {ele?.map((data, ind) => (
                      <td data-title={ele} key={ind}>
                        {data} &nbsp;
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </Tables>
          </div>
        </div>
      )}
    </>
  );
};

export default ImportExportExcel;
