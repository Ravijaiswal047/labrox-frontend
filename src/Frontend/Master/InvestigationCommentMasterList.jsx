import React, { useEffect, useState } from "react";
import { InvestigationCommentValidation } from "../../utils/Schema";
import { toast } from "react-toastify";
import { axiosInstance } from "../../utils/axiosInstance";
import { useTranslation } from "react-i18next";
import { useFormik } from "formik";
import Accordion from "@app/components/UI/Accordion";
import { SelectBoxWithCheckbox } from "../../components/formComponent/MultiSelectBox";
import { SelectBox } from "../../components/formComponent/SelectBox";
import Input from "../../components/formComponent/Input";
import Loading from "../../components/loader/Loading";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import Tables from "../../components/UI/customTable";
import { Link } from "react-router-dom";
import parse from "html-react-parser";
import InvestigationCommentMasterModal from "../utils/InvestigationCommentMasterModal";

const InvestigationCommentMasterList = () => {
  const [Investigation, setInvestigation] = useState([]);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState({
    data: "",
    modalShow: false,
  });
  const [TemplateData, setTemplateData] = useState([]);
  const [InvestigationCommentMasterData, setInvestigationCommentMasterData] =
    useState([]);
  const [payload, setPayload] = useState({
    InvestigationID: "",
    Template: "",
    TemplateText: "",
  });
  const { t } = useTranslation();

  const { errors, touched, handleSubmit } = useFormik({
    initialValues: { ...payload },
    enableReinitialize: true,
    validationSchema: InvestigationCommentValidation,
    onSubmit: () => {
      setLoading(true);
      axiosInstance
        .post("InvestigationCommentMaster/getInvestigationCommentData", payload)
        .then((res) => {
          if (res.status === 200) {
            setInvestigationCommentMasterData(res?.data?.message);
            setLoading(false);
          }
          if (res?.data?.message.length === 0) {
            toast.success("No Data Found");
            setLoading(false);
          }
          setLoading(false);
        })
        .catch((err) =>
          toast.error(
            err?.response?.data?.message
              ? err?.response?.data?.message
              : "Somthing Wents Wrong",
          ),
        );
    },
  });

  const handleMultiSelect = (select, name) => {
    const data = select?.map((ele) => ele?.value);
    getTemplate(data);
    setPayload({ ...payload, [name]: data, SampleTypeID: select[0]?.value });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPayload({
      ...payload,
      [name]: value,
    });
  };

  const getInvestigationList = () => {
    axiosInstance
      .get("Investigations/BindInvestigationList")
      .then((res) => {
        let data = res?.data?.message;
        let InvestigationData = data?.map((ele) => {
          return {
            value: ele.InvestigationID,
            label: ele.TestName,
          };
        });
        setInvestigation(InvestigationData);
      })
      .catch((err) => console.log(err));
  };

  const getTemplate = (id) => {
    axiosInstance
      .post("InvestigationCommentMaster/getInvestigationTemplate", {
        InvestigationID: id,
      })
      .then((res) => {
        let data = res?.data?.message;
        let Template = data.map((ele) => {
          return {
            value: ele.CommentID,
            label: ele.Template,
          };
        });

        setTemplateData(Template);
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Something Went Wrong",
        );
      });
  };

  const handleShow = () => {
    setShow({
      modalShow: false,
      data: "",
    });
  };

  useEffect(() => {
    getInvestigationList(setInvestigationCommentMasterData);
  }, []);
  return (
    <>
      <Accordion
        name={t("Investigation Comment Master List")}
        isBreadcrumb={true}
        defaultValue={true}
        linkTo="/InvestigationCommentMaster"
        linkTitle={t("Create New")}
        state={{
          url: "InvestigationCommentMaster/InsertInvestigationComment",
        }}
      >
        <form action="" onSubmit={handleSubmit}>
          <div className="row pt-2 pl-2 pr-2 mt-1">
            <div className="col-sm-2">
              <SelectBoxWithCheckbox
                name="InvestigationID"
                className="required-fields"
                placeholder=" "
                lable="Investigation"
                id="InvestigationID"
                options={Investigation}
                onChange={handleMultiSelect}
                selectedValue={payload?.InvestigationID}
              />
              {errors?.InvestigationID && touched?.InvestigationID && (
                <span className="error-message">{errors?.InvestigationID}</span>
              )}
            </div>
            <div className="col-sm-2 ">
              <SelectBox
                options={[{ label: "Template", value: "" }, ...TemplateData]}
                onChange={handleChange}
                name="Template"
                lable="Template"
                id="Template"
                selectedValue={payload?.Template}
              />
            </div>
            <div className="col-sm-2 ">
              <Input
                name="TemplateText"
                placeholder=" "
                lable="Template Text"
                id="TemplateText"
                onChange={handleChange}
                value={payload?.TemplateText}
              />
            </div>
            <div className="col-sm-1">
              <button
                type="button"
                className="btn btn-block btn-info btn-sm"
                id="btnSearch"
                title="Search"
                onClick={handleSubmit}
              >
                {t("Search")}
              </button>
            </div>
          </div>
        </form>
      </Accordion>
      {loading ? (
        <Loading />
      ) : (
        <>
          {InvestigationCommentMasterData.length > 0 ? (
            <Accordion title={t("Search Data")} defaultValue={true}>
              <div className="row p-2 ">
                <div className="col-12">
                  <Tables>
                    <thead>
                      <tr>
                        <th>{t("S.No")}</th>
                        <th>{t("Investigation")}</th>
                        <th>{t("Template")}</th>
                        <th>{t("Template Text")}</th>
                        <th>{t("Active/InActive")}</th>
                        <th>{t("Edit")}</th>
                      </tr>
                    </thead>
                    <tbody className="cf">
                      {InvestigationCommentMasterData.map((data, i) => (
                        <tr key={i}>
                          <td data-title={t("S.No")}>{i + 1}&nbsp;</td>
                          <td
                            data-title={t("Investigation")}
                            className="tableSpace"
                          >
                            {data?.TestName}&nbsp;
                          </td>
                          <td data-title={t("Template")} className="tableSpace">
                            {data?.Template}&nbsp;
                          </td>
                          <td data-title={t("Template Text")}>
                            <button
                              className="btn btn-sm btn-primary w-5"
                              onClick={() => {
                                setShow({
                                  modalShow: true,
                                  data: parse(data?.TemplateText),
                                });
                              }}
                            >
                              {t("View")}
                            </button>
                          </td>
                          <td data-title={t("Active/InActive")}>
                            {data?.isActive == 1 ? "Active" : "InActive"}
                          </td>
                          <td data-title={t("Action")} className="tableSpace">
                            <Link
                              to="/InvestigationCommentMaster"
                              state={{
                                other: {
                                  button: "Update",
                                  CommentID: data?.CommentID,
                                },
                                url1: `InvestigationCommentMaster/getInvestigationCommentDataByID`,
                                url: "InvestigationCommentMaster/UpdateInvestigationComment",
                              }}
                            >
                              {t("Edit")}
                            </Link>
                            &nbsp;
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Tables>
                </div>
              </div>
            </Accordion>
          ) : (
            <NoRecordFound />
          )}
        </>
      )}
      {show?.modalShow && (
        <InvestigationCommentMasterModal show={show} handleShow={handleShow} />
      )}
    </>
  );
};

export default InvestigationCommentMasterList;
