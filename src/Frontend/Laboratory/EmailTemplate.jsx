import React, { useEffect, useState } from "react";
import Accordion from "@app/components/UI/Accordion";
import { useTranslation } from "react-i18next";
import Loading from "../../components/loader/Loading";
import { axiosInstance } from "../../utils/axiosInstance";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { toast } from "react-toastify";
import TextAreaInput from "../../components/formComponent/TextAreaInput";

const EmailTemplate = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [payload, setPayload] = useState({
    EmailType: "",
    IsActive: 1,
    EmailTypeName: "",
    Content: "",
    IsUpdate: 0,
    Id: 0,
  });
  const [emailTemplate, setEmailTemplate] = useState([]);
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setPayload({
      ...payload,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    });
  };
  const handleSearchSelectChange = (label, value) => {
    getContent(label, value?.value);
  };
  const getEmailType = () => {
    axiosInstance
      .post("Global/getGlobalData", { Type: "EmailType" })
      .then((res) => {
        let data = res.data.message;
        let value = data.map((ele) => {
          return {
            value: ele.FieldID,
            label: ele.FieldDisplay,
          };
        });
        setEmailTemplate(value);
      })
      .catch((err) => console.log(err));
  };
  useEffect(() => {
    getEmailType();
  }, []);
  console.log(payload);
  const getContent = (label, id) => {
    setLoading(true);
    axiosInstance
      .post("Emailtemplates/GetEmailTemplates", {
        TemplateKey: id,
      })
      .then((res) => {
        setLoading(false);
        if (res?.data?.success) {
          setPayload({
            Id: res?.data?.message[0]?.Id,
            EmailType: res?.data?.message[0]?.TemplateKey,
            IsActive: 1,
            Content: res?.data?.message[0]?.Body,
            EmailTypeName: res?.data?.message[0]?.Subject,
            IsUpdate: 1,
          });
        } else {
          setPayload({
            IsActive: 1,
            Id: 0,
            IsUpdate: 0,
            Content: "",
            [label]: id,
            EmailTypeName: emailTemplate?.filter((ele) => ele?.value == id)?.[0]
              ?.label,
          });
        }
      })
      .catch((err) => {
        setLoading(false);
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Error Occured",
        );
      });
  };

  const handleSubmit = () => {
    const items = {
      Id: payload?.Id,
      TemplateKey: payload?.EmailType,
      Subject: payload?.EmailTypeName,
      Body: payload?.Content,
      IsActive: payload?.IsActive,
      IsUpdate: payload?.IsUpdate,
    };
    setLoading(true);
    axiosInstance
      .post("Emailtemplates/SaveEmailtemplates", items)
      .then((res) => {
        if (res?.data?.success) {
          toast.success(res?.data?.message);
          setPayload({
            EmailType: "",
            IsActive: 0,
            EmailTypeName: "",
            Content: "",
            Id: 0,
            IsUpdate: 0,
          });
        } else {
          toast.error(res?.data?.message);
        }
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        toast.error(err?.response?.data?.message);
      });
  };
  return (
    <Accordion
      name={t("EmailTemplate")}
      isBreadcrumb={true}
      defaultValue={true}
    >
      {" "}
      <div className="row pt-2 pl-2 pr-2 mt-1">
        <div className="col-sm-2">
          <label htmlFor="isActive" className="control-label ml-2">
            {t("Select Email Type To Update")}
          </label>
        </div>
        <div className="col-sm-2">
          <ReactSelect
            className="required-fields"
            dynamicOptions={emailTemplate}
            removeIsClearable={true}
            name="EmailType"
            lable="EmailType"
            id="EmailType"
            placeholderName="Email Type"
            value={payload?.EmailType}
            onChange={handleSearchSelectChange}
          />
        </div>
        <div className="col-sm-1 mt-1 d-flex">
          <div className="mt-1">
            <input
              name="IsActive"
              type="checkbox"
              id="IsActive"
              onChange={handleChange}
              checked={payload?.IsActive}
            />
          </div>
          <label htmlFor="IsActive" className="control-label ml-2">
            {t("Is Active")}
          </label>
        </div>
      </div>{" "}
      <div className="pt-1 pl-2 pr-2 mt-1">
        <TextAreaInput
          style={{ height: "250px", padding: "6px" }}
          id="Type Content"
          lable="Type Content"
          onChange={handleChange}
          value={payload?.Content}
          name="Content"
        />
      </div>
      {loading ? (
        <Loading />
      ) : (
        <div className="row mb-2 ml-1">
          <div className="col-md-1">
            <button
              className="btn btn-block btn-sm btn-success"
              onClick={handleSubmit}
              disabled={!payload?.EmailType}
            >
              {t("Submit")}
            </button>
          </div>
        </div>
      )}
    </Accordion>
  );
};

export default EmailTemplate;
