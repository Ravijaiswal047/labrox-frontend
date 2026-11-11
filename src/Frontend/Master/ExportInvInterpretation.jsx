import { axiosInstance } from "../../utils/axiosInstance";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { SelectBox } from "../../components/formComponent/SelectBox";
import { useTranslation } from "react-i18next";
import { CKEditor } from "ckeditor4-react";
import Loading from "../../components/loader/Loading";
import * as XLSX from "xlsx";
import { InvType } from "../../utils/Constants";
import Tables from "../../components/UI/customTable";
import Accordion from "@app/components/UI/Accordion";
const ExportInvInterpretation = () => {
  const { t } = useTranslation();
  const [payload, setPayload] = useState("");
  const [center, setCenter] = useState([]);
  const [data, setData] = useState([]);
  const [type, setType] = useState("");
  const [loading, setLoading] = useState(false);
  const [ExportExcel, setExportExcel] = useState([]);
  const [load, setLoad] = useState(false);
  const getAccessCenter = () => {
    axiosInstance
      .get("Centre/getAccessCentres")
      .then((res) => {
        let data = res.data.message;
        let CentreDataValue = data.map((ele) => {
          return {
            value: ele.CentreID,
            label: ele.Centre,
          };
        });
        CentreDataValue.unshift({ value: "", label: "Select Centre" });
        setCenter(CentreDataValue);
      })
      .catch((err) => {
        toast.error("Something went wrong");
      });
  };

  useEffect(() => {
    getAccessCenter();
  }, []);

  const getType = (value) => {
    if (value == "") {
      setExportExcel([]);
    } else {
      setLoad(true);
      const url =
        value == "Investigation"
          ? "Investigations/BindTestdata"
          : value == "InvestigationObservation"
            ? "Investigations/GetObservationData"
            : value == "InvestigationRange"
              ? "Investigations/GetInvestigationRangeData"
              : value == "InvestigationProfile"
                ? "Investigations/ProfileReport"
                : value == "InvestigationPackage"
                  ? "Investigations/PackageReport"
                  : "";
      axiosInstance
        .get(url)
        .then((res) => {
          if (res?.data?.success) {
            let data = res?.data?.message;
            setExportExcel(data);
            toast.success("Data Found");
          } else toast.error("Data Not Found");
          setLoad(false);
        })
        .catch((err) => {
          setLoad(false);
          console.log(
            err?.response?.data?.message
              ? err?.response?.data?.message
              : "Something Went Wrong",
          );
        });
    }
  };

  const getInterPretation = (value) => {
    setLoading(true);
    axiosInstance
      .post("Investigations/GetInterpretationByCentre", {
        CentreID: value,
      })
      .then((res) => {
        let data = res.data.message;
        let updateData = data.map((ele) => {
          return {
            data: ele?.Interpretation,
            label: ele?.TestName,
            value: ele?.InvestigationID,
          };
        });
        setData(updateData);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        toast.error("Something went wrong");
      });
  };

  const getComment = (value) => {
    setPayload("");
    setLoading(true);
    axiosInstance
      .get("Investigations/GetCommentMasterData")
      .then((res) => {
        let data = res.data.message;
        let updateData = data.map((ele) => {
          return {
            data: ele?.TemplateText,
            label: ele?.TestName,
            value: ele?.InvestigationID,
            template: ele?.Template,
          };
        });
        setData(updateData);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        toast.error("Something went wrong");
      });
  };

  const ExportToExcels = async (dataExcel) => {
    if (type) {
      if (dataExcel?.length > 0 || !dataExcel) {
        const worksheet = XLSX.utils.json_to_sheet(dataExcel);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
        XLSX.writeFile(workbook, "data.xlsx");
      } else {
        toast?.error("No Record Found");
      }
    } else {
      toast.error("Please Select Any Type First !!...");
    }
  };

  const printPage = () => {
    window.print();
  };

  return (
    <>
      <Accordion
        name={t("Download Investigations Interpretation/Range/Observation")}
        isBreadcrumb={true}
        defaultValue={true}
      >
        <div className="row px-2 mt-2 mb-1">
          <div className="col-sm-2">
            <SelectBox
              id={"type"}
              lable="Select Type"
              options={[{ label: "Select Type", value: "" }, ...InvType]}
              onChange={(e) => {
                setData([]);
                setExportExcel([]);
                setType(e.target.value);
                e.target.value === "InvestigationInterpretation" &&
                payload !== ""
                  ? getInterPretation(payload)
                  : e.target.value === "InvestigationComment"
                    ? getComment()
                    : getType(e.target.value);
              }}
            />
          </div>
          {type === "" && (
            <label className="col-sm-4 requiredlabel">
              {t("** Select type from option to continue")}
            </label>
          )}

          {type === "InvestigationInterpretation" && (
            <>
              <div className="col-sm-2">
                <SelectBox
                  options={center}
                  lable="Center"
                  id="Center"
                  onChange={(e) => {
                    setPayload(e.target.value);
                    e.target.value !== ""
                      ? getInterPretation(e.target.value)
                      : setData([]);
                  }}
                  name="centerId"
                  selectedValue={payload}
                />
              </div>
            </>
          )}
          {[
            "Investigation",
            "InvestigationObservation",
            "InvestigationRange",
            "InvestigationPackage",
            "InvestigationProfile",
          ].includes(type) ? (
            <div className="col-sm-2">
              {load ? (
                <Loading />
              ) : (
                <button
                  className="btn btn-block btn-primary btn-sm"
                  onClick={() => ExportToExcels(ExportExcel)}
                >
                  {t("Download Excel")}
                </button>
              )}
            </div>
          ) : (
            type !== "" &&
            data.length !== 0 && (
              <div className="col-sm-1">
                <button
                  className="btn btn-block btn-primary btn-sm"
                  onClick={() => printPage()}
                >
                  {t("Print")}
                </button>
              </div>
            )
          )}
        </div>
        {loading ? (
          <Loading />
        ) : data.length > 0 ? (
          <>
            <div>
              {data.map((ele, ind) => {
                const checkTable = ele.data.includes("table");
                const editorConfig = {
                  toolbar: checkTable
                    ? [{ name: "insert", items: ["Table"] }]
                    : [],
                  extraPlugins: "autogrow",
                  autoGrow_minHeight: 50,
                  removePlugins: "elementspath,resize",
                  readOnly: true,
                };
                return (
                  <React.Fragment key={ind}>
                    <div className="row p-2">
                      <label className="col-sm-1">{t("Test")}:</label>
                      <label className="col-sm-2">{ele?.label}</label>
                      <label className="col-sm-2">&nbsp;</label>
                      <label className="col-sm-1">{t("Code")}:</label>
                      <label className="col-sm-2">{ele?.value}</label>
                    </div>

                    <CKEditor
                      initData={
                        ele.data !== ""
                          ? ele.data
                          : "<p>*** NO DATA AVAILABLE FOR THIS TEST ***</p>"
                      }
                      config={editorConfig}
                    />
                    <br />
                  </React.Fragment>
                );
              })}
            </div>
          </>
        ) : (
          <div className="card"></div>
        )}{" "}
      </Accordion>
    </>
  );
};

export default ExportInvInterpretation;
