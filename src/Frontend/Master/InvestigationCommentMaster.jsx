import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { axiosInstance } from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import { InvestigationCommentMasterValidation } from "../../utils/Schema";
import { getTrimmedData } from "../../utils/helpers";
import Accordion from "@app/components/UI/Accordion";
import ReactSelect from "../../components/formComponent/ReactSelect";
import Input from "../../components/formComponent/Input";
import FullTextEditor from "../../components/formComponent/TextEditor";
import Loading from "../../components/loader/Loading";

const InvestigationCommentMaster = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location;
  const [Investigation, setInvestigation] = useState([]);
  const [Editor, setEditor] = useState("");
  const [load, setLoad] = useState(false);
  const [err, setErr] = useState({});
  const [Editable, setEditable] = useState(true);
  const [payload, setPayload] = useState({
    InvestigationID: "",
    Template: "",
    TemplateText: "",
    isActive: "",
  });

  const ID = {
    CommentID: state?.other?.CommentID ? state?.other?.CommentID : "",
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPayload({
      ...payload,
      [name]: value,
    });
  };
  console.log(payload);
  const handleSelectChange = (event) => {
    const { name, value, type, checked } = event.target;
    if (name == "isActive") {
      setPayload({
        ...payload,
        [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
      });
    } else {
      setPayload({ ...payload, [name]: value });
    }
  };

  const Fetch = () => {
    axiosInstance
      .post(state?.url1, {
        CommentID: ID.CommentID,
      })
      .then((res) => {
        const data = res.data.message;
        setPayload(...data);
      })
      .catch((err) => console.log(err));
  };

  const getInvestigationList = () => {
    axiosInstance
      .get("Investigations/BindInvestigationList")
      .then((res) => {
        let data = res.data.message;
        let InvestigationData = data.map((ele) => {
          return {
            value: ele.InvestigationID,
            label: ele.TestName,
          };
        });
        InvestigationData.unshift({ label: "All Investigations", value: "" });
        setInvestigation(InvestigationData);
      })
      .catch((err) => console.log(err));
  };

  const postData = () => {
    let generatedError = InvestigationCommentMasterValidation(payload);
    if (generatedError === "") {
      setLoad(true);
      axiosInstance
        .post(
          state?.url
            ? state?.url
            : "InvestigationCommentMaster/InsertInvestigationComment",
          getTrimmedData({
            ...payload,
          }),
        )
        .then((res) => {
          if (res.data.success) {
            setLoad(false);
            navigate("/InvestigationCommentMasterList");
            toast.success(res.data.message);
          } else {
            toast.error(res?.data?.message);
            setLoad(false);
          }
        })
        .catch((err) => {
          toast.error(
            err?.response?.data?.message
              ? err?.response?.data?.message
              : "Error Occured",
          );
          setLoad(false);
        });
    } else {
      setErr(generatedError);
      setLoad(false);
    }
  };

  useEffect(() => {
    setPayload({ ...payload, TemplateText: Editor });
  }, [Editor]);

  useEffect(() => {
    Fetch();
    getInvestigationList();
  }, []);
  return (
    <>
      <Accordion
        name={t("Investigation Comment Master")}
        isBreadcrumb={true}
        defaultValue={true}
      >
        <div className="row pt-2 pl-2 pr-2 mt-1">
          <div className="col-sm-2">
            <ReactSelect
              className="required-fields"
              dynamicOptions={Investigation}
              isDisabled={state?.url1}
              placeholderName="Investigation"
              value={payload?.InvestigationID}
              onChange={(_, e) => {
                setPayload({
                  ...payload,
                  InvestigationID: e?.value,
                });
              }}
            />
            <div className="error-message">{err?.InvestigationID}</div>
          </div>
          <div className="col-sm-2">
            <Input
              className="required-fields"
              lable="Template"
              id="Template"
              placeholder=" "
              onChange={handleChange}
              name="Template"
              max={50}
              value={payload?.Template}
            />
          </div>
          <div className="col-sm-1 mt-1 d-flex">
            <div className="mt-1">
              <input
                type="checkbox"
                name="isActive"
                value={payload?.isActive}
                checked={payload?.isActive}
                onChange={handleSelectChange}
              />
            </div>
            <label className="ml-2">{t("IsActive")}</label>
          </div>
        </div>
        <div className="row pt-1 pl-2 pr-2">
          <div className="col-sm-12">
            <FullTextEditor
              value={payload?.TemplateText}
              setValue={setEditor}
              EditTable={Editable}
              setEditTable={setEditable}
            />
          </div>
        </div>
        <div className="row mt-4 ml-1 mb-1">
          <div className="col-sm-2 mb-2">
            {load ? (
              <Loading />
            ) : (
              <button
                type="button"
                className="btn btn-block btn-success btn-sm"
                id="btnSearch"
                title="Search"
                onClick={postData}
                disabled={payload?.Template.length > 0 ? false : true}
              >
                {state?.other?.button ? state?.other?.button : t("Save")}
              </button>
            )}
          </div>
          <div className="col-sm-2">
            <Link to="/InvestigationCommentMasterList">
              {t("Back to List")}
            </Link>
          </div>
        </div>
      </Accordion>
    </>
  );
};

export default InvestigationCommentMaster;
