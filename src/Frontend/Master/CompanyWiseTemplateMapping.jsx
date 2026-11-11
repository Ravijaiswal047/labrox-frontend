import React, { useEffect, useState } from "react";
import Accordion from "@app/components/UI/Accordion";
import { useTranslation } from "react-i18next";
import Loading from "../../components/loader/Loading";
import { axiosInstance } from "../../utils/axiosInstance";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { toast } from "react-toastify";
import { ReportType } from "../../utils/Constants";

const CompanyWiseTemplateMapping = () => {
  const [payload, setPayload] = useState({
    CompanyId: "",
    ReportTypeId: "",
    TemplateId: "",
  });

  const [template, setTemplate] = useState([]);
  const [company, setCompany] = useState([]);
  const handleSearchSelectChange = (label, value) => {
    if (label == "ReportTypeId") {
      setPayload({
        ...payload,
        [label]: value?.value,
        TemplateId: "",
      });
      switch (value?.value) {
        case "Lab Report":
          getTemplateType("2");
          break;
        case "Bill":
          getTemplateType("1");
          break;
        case "TRF":
          getTemplateType("3");
          break;
        case "Department Slip":
          getTemplateType("4");
          break;
        default:
          break;
      }
    } else
      setPayload({
        ...payload,
        [label]: value?.value,
      });
  };
  const handleSubmit = () => {
    if (!payload?.CompanyId) {
      toast.error("Please Select Any Company");
      return;
    } else if (!payload?.ReportTypeId) {
      toast.error("Please Select Any eportType");
      return;
    } else if (!payload?.TemplateId) {
      toast.error("Please Select Any Template");
      return;
    } else {
      setLoading(true);
      axiosInstance
        .post("ReportMaster/CopyreportSetup", {
          CompanyId: Number(payload?.CompanyId),
          TemplateID: Number(payload?.TemplateId),
          ReportTypeId: Number(payload?.ReportTypeId),
        })
        .then((res) => {
          if (res?.data?.success) {
            toast.success(res?.data?.message);
            setPayload({
              CompanyId: "",
              ReportTypeId: "",
              TemplateId: "",
            });
          } else {
            toast.error(res?.data?.message);
          }

          setLoading(false);
        })
        .catch((err) => {
          setLoading(false);
          toast.error(err?.res?.data ? err?.res?.data : "Something Went Wrong");
        });
    }
  };
  const getTemplateType = (reportTypeId) => {
    axiosInstance
      .post("ReportMaster/BindTemplate", {
        ReportTypeId: reportTypeId?.toString(),
      })
      .then((res) => {
        if (res?.data?.success) {
          let data = res?.data?.message;
          let templates = data?.map((ele) => {
            return {
              value: ele?.TemplateID,
              label: ele?.TemplateName,
            };
          });
          setTemplate(templates);
        } else {
          setTemplate([]);
        }
      })
      .catch((err) =>
        toast.error(err?.res?.data ? err?.res?.data : "Something Went Wrong"),
      );
  };
  const getCompanyName = () => {
    axiosInstance
      .get("CompanyMaster/getCompanyName")
      .then((res) => {
        let data = res?.data?.message;
        let Company = data?.map((ele) => {
          return {
            value: ele?.CompanyId,
            label: ele?.CompanyName,
          };
        });

        setCompany(Company);
      })
      .catch((err) =>
        console.log(err?.res?.data ? err?.res?.data : "Something Went Wrong"),
      );
  };
  useEffect(() => {
    getCompanyName();
  }, []);

  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  return (
    <div>
      {" "}
      <Accordion
        name={t("Company Wise Template Mapping")}
        isBreadcrumb={true}
        defaultValue={true}
      >
        <div className="row pt-2 pl-2 pr-2 mt-1">
          <div className="col-sm-2">
            <ReactSelect
              className="required-fields"
              dynamicOptions={company}
              removeIsClearable={true}
              name="CompanyId"
              lable="CompanyId"
              id="CompanyId"
              placeholderName="Company"
              value={payload?.CompanyId}
              onChange={handleSearchSelectChange}
            />{" "}
          </div>
          <div className="col-sm-2">
            <ReactSelect
              className="required-fields"
              dynamicOptions={ReportType}
              removeIsClearable={true}
              name="ReportTypeId"
              lable="ReportTypeId"
              id="ReportTypeId"
              placeholderName="ReportType"
              value={payload?.ReportTypeId}
              onChange={handleSearchSelectChange}
            />
          </div>

          <div className="col-sm-2">
            <ReactSelect
              className="required-fields"
              dynamicOptions={template}
              removeIsClearable={true}
              name="TemplateId"
              lable="TemplateId"
              id="TemplateId"
              placeholderName="Template"
              value={payload?.TemplateId}
              onChange={handleSearchSelectChange}
            />{" "}
          </div>

          <div className="col-md-1">
            {loading ? (
              <Loading />
            ) : (
              <button
                type="button"
                className={`btn btn-block btn-success`}
                onClick={handleSubmit}
              >
                {"Save"}
              </button>
            )}
          </div>
          <div className="col-md-1">
            <button
              className="btn btn-block btn-sm btn-success"
              onClick={() => {
                setPayload({
                  CompanyId: "",
                  ReportTypeId: "",
                  TemplateId: "",
                });
              }}
            >
              {t("Reset")}
            </button>
          </div>
        </div>
      </Accordion>
    </div>
  );
};

export default CompanyWiseTemplateMapping;
