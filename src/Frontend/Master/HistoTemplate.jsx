import React, { useEffect, useState } from "react";
import Accordion from "@app/components/UI/Accordion";
import ReactSelect from "../../components/formComponent/ReactSelect";
import Input from "../../components/formComponent/Input";
import FullTextEditor from "../../components/formComponent/TextEditor";
import Loading from "../../components/loader/Loading";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { getAccessCentres } from "../../utils/NetworkApi/commonApi";
import { Temptype } from "../../utils/Constants";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { axiosInstance } from "../../utils/axiosInstance";
import { CustomButton } from "../../components/UI/CustomButton";
const HistoTemplate = () => {
  const { t } = useTranslation();
  const [load, setLoad] = useState(false);
  const [Editable, setEditable] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location;

  const [Editor, setEditor] = useState(
    state?.data?.[state?.data?.fieldtype] ?? "",
  );
  const [payload, setPayload] = useState({
    TemplateType: state?.data?.fieldtype ?? "",
    Template: state?.data?.Template_Name ?? "",
    TemplateText: state?.data?.[state?.data?.fieldtype] ?? "",
    IsActive: state?.data?.IsActive ?? 1,
    TemplateID: state?.data?.Template_ID ?? "",
  });
  console.log(payload);
  useEffect(() => {
    setPayload({ ...payload, TemplateText: Editor });
  }, [Editor]);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPayload({
      ...payload,
      [name]: value,
    });
  };
  const handleSearchSelectChange = (label, value) => {
    if (value?.value) {
      setPayload({
        ...payload,
        [label]: value?.value,
      });
    } else {
      setPayload({
        ...payload,
        [label]: "",
      });
    }
  };

  const handleSelectChange = (event) => {
    const { name, value, type, checked } = event.target;
    if (name == "IsActive") {
      setPayload({
        ...payload,
        [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
      });
    } else {
      setPayload({ ...payload, [name]: value });
    }
  };

  const handleSave = () => {
    if (payload?.Template == "") {
      toast.error("Enter Any Template Text");
    } else if (payload?.TemplateType == "") {
      toast.error("Select Any Template Type");
    } else if (payload?.TemplateText == "") {
      toast.error("Template Text Cannot Be Blank");
    } else {
      setLoad(true);
      const payloadData = {
        HeaderText: payload?.TemplateText,
        TemplateName: payload?.Template,
        TempType: payload?.TemplateType,
        IsActive: payload?.IsActive,
        TemplateID: payload?.TemplateID,
      };
      axiosInstance
        .post(state?.url ? state?.url : "HistoTemplateMaster/SaveHistoTemplate", payloadData)
        .then((res) => {
          setLoad(false);
          if (res?.data?.success) {
            navigate("/HistoTemplateList");
            setEditor("");
            setEditable(false);
            toast?.success(res?.data?.message);
          } else {
            toast?.success(res?.data?.message);
          }
        })
        .catch((err) => {
          setLoad(false);
          toast.error(err?.response?.data?.message ?? "Something Went Wrong");
        });
      console.log(payloadData);
    }
  };

  return (
    <div>
      <Accordion
        name={t("Histo Template")}
        isBreadcrumb={true}
        defaultValue={true}
      >
        {" "}
        <div className="row pt-2 pl-2 pr-2 mt-1">
          <div className="col-sm-2">
            <Input
              className="required-fields"
              lable="Template Text"
              id="Template"
              placeholder=" "
              onChange={handleChange}
              name="Template"
              max={50}
              value={payload?.Template}
            />
          </div>
          <div className="col-sm-2">
            <ReactSelect
              className="required-fields"
              removeIsClearable={true}
              dynamicOptions={Temptype}
              name="TemplateType"
              lable="TemplateType"
              id="TemplateType"
              placeholderName="TemplateType"
              value={payload?.TemplateType}
              onChange={handleSearchSelectChange}
            />
          </div>
          <div className="col-sm-1 mt-1 d-flex">
            <div className="mt-1">
              <input
                type="checkbox"
                name="IsActive"
                value={payload?.IsActive}
                checked={payload?.IsActive}
                onChange={handleSelectChange}
              />
            </div>
            <label className="ml-2">{t("IsActive")}</label>
          </div>
        </div>
        <div className="row pt-1 pl-2 pr-2">
          <div className="col-sm-12" id="HistoTemplate">
            <FullTextEditor
              value={payload?.TemplateText}
              setValue={setEditor}
              editable={Editable}
              setEditTable={setEditable}
            />
          </div>
        </div>
        <div className="row mt-2 mx-1">
          <div className="col-auto mb-2">
            {load ? (
              <Loading />
            ) : (
              <CustomButton
              text={state?.data ? t("Update") : t("Save")}
              icon={state?.data ? "edit" : "save"}
              onClick={handleSave}
            />
            )}
            
          </div>
          <div className="col-sm-2 mb-2">
            <Link to="/HistoTemplateList" style={{ fontSize: "13px" }}>
              {t("Back to List")}
            </Link>
          </div>
        </div>{" "}
      </Accordion>{" "}
      {/* <Accordion title={t("Histo Template Data")} defaultValue={true}>
        <div className="row p-2">
          {" "}
          <div className="col-12">
            <Tables>
              <thead className="text-center cf" style={{ zIndex: 99 }}>
                <tr>
                  <th>{t("ID")}</th>
                  <th>{t("Template Name")}</th>
                  <th>{t("Active")}</th>
                  <th>{t("Edit")}</th>
                </tr>
              </thead>
              {tableData?.map((ele, index) => (
                <tr key={index}>
                  <td data-title={"ID"}>{index + 1}</td>
                  <td data-title={t("Template Name")}>{ele?.Template_Name}</td>
                  <td data-title={"Active"}>
                    {ele?.IsActive === 1 ? t("Active") : t("DeActive")}
                  </td>
                  <td data-title={"Edit"}>
                    <Link
                      className="text-primary"
                      style={{
                        cursor: "pointer",
                        textDecoration: "underline",
                      }}
                      onClick={() => EditGetData(ele?.Template_ID)}
                    >
                      {t("Edit")}
                    </Link>
                  </td>
                </tr>
              ))}
            </Tables>
          </div>
        </div>
      </Accordion> */}
    </div>
  );
};

export default HistoTemplate;
