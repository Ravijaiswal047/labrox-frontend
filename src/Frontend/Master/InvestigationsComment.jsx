import { useTranslation } from "react-i18next";
import ReactSelect from "../../components/formComponent/ReactSelect";
import Accordion from "../../components/UI/Accordion";
import { axiosInstance } from "../../utils/axiosInstance";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Input from "../../components/formComponent/Input";
import { toast } from "react-toastify";
import Tables from "../../components/UI/customTable";
import parse from "html-react-parser";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import { ImCross } from "react-icons/im";
import { CiEdit } from "react-icons/ci";
import FullTextEditor from "../../components/formComponent/TextEditor";
import { MdDelete } from "react-icons/md";
import { Button, Form } from "react-bootstrap";
import { CustomButton } from "../../components/UI/CustomButton";

const InvestigationsComment = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { state } = location;
  const navigate = useNavigate();

  const [Editable, setEditable] = useState(true);

  const [payload, setPayload] = useState({
    CentreID: "",
    MacID: "",
    Interpretation: "",
    InvestigationID: state?.InvestigationID ? state?.InvestigationID : "",
    PrintInterPackage: "",
    UpdateExisting: 0,
    TemplateText: "",
    Template: "",
    CommentID: "",
    dtEntry: "",
    isActive: 1,
    isDefault: 0,
  });

  const [showEditor, setShowEditor] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);

  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [investigationTemplates, setInvestigationTemplates] = useState([]);

 
  const getInvestigationTemplate = () => {
    axiosInstance
      .post("InvestigationCommentMaster/getInvestigationTemplate", {
        InvestigationID: [payload?.InvestigationID],
      })
      .then((res) => {
        if (res?.data?.success) {
          setInvestigationTemplates(res.data.message || []);
          console.log("Templates Saved:", res.data.message);
        } else {
          setInvestigationTemplates([]);
          console.log("No templates found");
        }
      })
      .catch((err) => {
        console.error("Error fetching template:", err);
        toast.error("Error fetching templates");
      });
  };

  useEffect(() => {
    getInvestigationTemplate();
  }, []);

  // Reset form to initial state
  const resetForm = () => {
    setPayload({
      CentreID: "",
      MacID: "",
      Interpretation: "",
      InvestigationID: state?.InvestigationID ? state?.InvestigationID : "",
      PrintInterPackage: "",
      UpdateExisting: 0,
      TemplateText: "",
      Template: "",
      CommentID: "",
      dtEntry: "",
      isActive: 1,
      isDefault: 0,
    });
    setSelectedTemplate(null);
    setEditable(true);
  };

  const handleCreateNew = () => {
    resetForm();
    setIsCreateMode(true);
    setShowEditor(true);
  };

  const handleEdit = (data) => {
    setShowEditor(false);
    resetForm();
    setIsCreateMode(false); 
    setSelectedTemplate(data);
    
    // Set the payload with the data to be edited
    setPayload((prev) => ({
      ...prev,
      CommentID: data?.CommentID || "",
      Template: data?.Template || data?.template || "",
      TemplateText: data?.TemplateText || data?.templateText || "",
      dtEntry: data?.dtEntry || "",
      isActive: data?.isActive ?? 1,
      isDefault: data?.isDefault ?? 0,
    }));
    setTimeout(() => {
      setShowEditor(true);
    }, 100);

    // Only fetch additional data if CommentID exists
    if (data?.CommentID) {
      getInvestigationCommentDataByID(data.CommentID);
    }
  };

  
  const getInvestigationCommentDataByID = (commentID) => {
    axiosInstance
      .post("InvestigationCommentMaster/getInvestigationCommentDataByID", {
        CommentID: commentID,
      })
      .then((res) => {
        const message = res?.data?.message;
        if (message) {
          const commentData = Array.isArray(message) ? message[0] : message;
          
          if (commentData) {
            setSelectedTemplate(commentData);

            setPayload((prev) => ({
              ...prev,
              TemplateText: commentData?.TemplateText || commentData?.templateText || "",
              Template: commentData?.Template || commentData?.template || "",
              dtEntry: commentData?.dtEntry || "",
              isActive: commentData?.isActive ?? 1,
              isDefault: commentData?.IsDefault ?? 0,
              CommentID: commentData?.CommentID || prev.CommentID,
              InvestigationID: commentData?.InvestigationID || prev.InvestigationID,
            }));

            console.log("Loaded commentData:", commentData);
            setShowEditor(true);
          } else {
            toast.info("No comment data found");
          }
        } else {
          toast.info("No comment data found");
        }
      })
      .catch((err) => {
        console.error("Error fetching comment data:", err);
        toast.error("Error fetching comment data");
      });
  };

  const updateInvestigation = () => {
    if (!payload?.TemplateText || payload.TemplateText.trim().length === 0) {
      toast.error("Template text cannot be empty");
      return;
    }

    axiosInstance
      .post("InvestigationCommentMaster/UpdateInvestigationComment", {
        CommentID: payload?.CommentID || "",
        InvestigationID: payload?.InvestigationID || "",
        Template: payload?.Template || selectedTemplate?.Template || "",
        TemplateText: payload?.TemplateText || "",
        TestName: state?.data || "",
        dtEntry: payload?.dtEntry || "",
        isActive: payload?.isActive ?? 1,
        isDefault: payload?.isDefault ?? 0,
      })
      .then((res) => {
        if (res.data.success) {
          toast.success(res.data.message || "Updated Successfully");
          getInvestigationTemplate();
          setShowEditor(false);
          setIsCreateMode(false);
          resetForm();
        } else {
          toast.error(res.data.message || "Update failed");
        }
      })
      .catch((err) => {
        console.error("Update API error:", err);
        toast.error(err?.response?.data?.message || "Error Occurred while updating");
      });
  };

  const insertInvestigation = () => {
    if (!payload?.TemplateText || payload.TemplateText.trim().length === 0) {
      toast.error("Template text cannot be empty");
      return;
    }
    if (!payload?.Template || payload.Template.trim().length === 0) {
      toast.error("Please enter template name");
      return;
    }

    const InsertPayload = {
      isActive: payload?.isActive ?? 1,
      isDefault: payload?.isDefault ?? 0,
      InvestigationID: payload?.InvestigationID || "",
      Template: payload?.Template || "",
      TemplateText: payload?.TemplateText || "",
      TestName: state?.data || "",
    };

    axiosInstance
      .post("InvestigationCommentMaster/InsertInvestigationComment", InsertPayload)
      .then((res) => {
        if (res?.data?.success) {
          toast.success(res.data.message || "Saved Successfully");
          getInvestigationTemplate();
          setShowEditor(false);
          setIsCreateMode(false);
          resetForm();
        } else {
          toast.error(res?.data?.message || "Save failed");
        }
      })
      .catch((err) => {
        console.error("Insert API error:", err);
        toast.error(err?.response?.data?.message || "Error Occurred while saving");
      });
  };

  const handleCancel = () => {
    setShowEditor(false);
    setIsCreateMode(false);
    resetForm();
  };

const deleteInvestigationComment = (data) => {
  if (!data?.CommentID) {
    toast.error("Invalid Comment ID");
    return;
  }

  const deletePayload = {
    commentID: data.CommentID,
  };

  axiosInstance
    .post("InvestigationCommentMaster/DeleteInvestigationComment", deletePayload)
    .then((res) => {
      if (res?.data?.success) {
        toast.success(res.data.message || "Deleted Successfully");
        getInvestigationTemplate();

      } else {
        toast.error(res?.data?.message || "Delete failed");
      }
    })
    .catch((err) => {
      console.error("Delete API error:", err);
      toast.error("Error while deleting");
    });
};


  return (
    <div>
      <Accordion name={t("Investigations Comment")} defaultValue={true} isBreadcrumb={true} backButton={true}>
        <div className="row pt-2 pl-2 pr-2 mb-4">
          <div className="col-sm-4">
            <Input
              placeholder=" "
              lable="TestName"
              id="TestName"
              disabled={true}
              value={state?.data}
              name="TestName"
            />
          </div>

          <div className="col-sm-1">
            <button className="btn btn-block btn-primary" onClick={handleCreateNew}>
              {t("Create New")}
            </button>
          </div>

          <div className="col-sm-1 ml-2">
            {state?.flag ? (
              <Link
                to="/Investigations"
                state={{
                  other: {
                    button: "Update",
                    pageName: "Edit",
                    showButton: true,
                  },
                  url1: state?.url1,
                  url: "Investigations/UpdateInvestigation",
                }}
              >
                <span className="btn btn-block btn-primary btn-sm"> {t("Back")}</span>
              </Link>
            ) : (
              <button
                className="btn btn-block btn-primary btn-sm"
                onClick={() => navigate(-1)}
              >
                {t("Back")}
              </button>
            )}
          </div>
        </div>

        <Tables />
      </Accordion>

      {investigationTemplates.length > 0 ? (
        <Accordion title={t("Search Data")} defaultValue={true}>
          <div className="row pl-2">
            <div className="col-12">
              <div
                className="table-responsive mt-3 mb-4"
                style={{ maxHeight: "280px", overflowY: "auto" }}
              >
                <Tables>
                  <thead>
                    <tr>
                      <th>{t("S.No")}</th>
                      <th>{t("Template")}</th>
                      <th>{t("Is Default")}</th>
                      <th>{t("Created by/Date")}</th>
                      <th>{t("Updated by/Date")}</th>
                      <th>{t("Edit")}</th>
                      <th>{t("Reject")}</th>
                    </tr>
                  </thead>
                  <tbody className="cf">
                    {investigationTemplates.map((data, i) => (
                      <tr key={i}>
                        <td data-title={t("S.No")}>{i + 1}&nbsp;</td>
                        <td data-title={t("Template")}>{data?.Template}&nbsp;</td>
                        <td data-title={t("Is Default")}>{data?.IsDefault ? "Yes" : "No"}&nbsp;</td>
                        <td data-title={t("CreateBy/Date")}>
                          {data?.CreatedByName && data?.dtEntry ? `${data?.CreatedByName}/${data?.dtEntry}` : "--"}&nbsp;
                        </td>
                        <td data-title={t("Updated/Date")}>
                          {data?.UpdatedByName && data?.dtUpdate ? `${data.UpdatedByName} / ${data.dtUpdate}` : "--"}
                        </td>

                        <td>
                            <button
                                className="btn btn-primary btn-class px-2 py-3"
                                onClick={() => handleEdit(data)}
                            >
                                <i className="fa fa-edit"></i>
                            </button>
                        </td>
                        <td data-title={t("Reject")}>
                            <Button className="btn btn-primary btn-class px-2 py-3" onClick={()=>deleteInvestigationComment(data)}>  
                              <i className="bi bi-trash mb-0"></i>
                            </Button>
                        
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Tables>
              </div>
            </div>
          </div>
        </Accordion>
      ) : (
       ""
      )}

      {showEditor && (
        <div className="col-sm-12 mt-4">
          <h3>
            <strong>
              {isCreateMode ? "Create New Template" : `Template : ${payload?.Template || selectedTemplate?.Template || ""}`}
            </strong>
          </h3>

         
          <div className="row mb-2 align-items-center">
            <div className="col-sm-6">
              <Input
                placeholder=" "
                lable="Template Name"
                id="Template"
                value={payload?.Template || ""}
                name="Template"
                onChange={(e) => setPayload((prev) => ({ ...prev, Template: e.target.value }))}
              />
            </div>
            <div className="col-sm-2 d-flex align-items-center">
              <Form.Check
                type="switch"
                id="isDefault"
                name="isDefault"
                label={t("Is Default")}
                className="m-0"
                checked={!!payload?.isDefault}
                onChange={(e) => setPayload((prev) => ({ ...prev, isDefault: e.target.checked ? 1 : 0 }))}
              />
            </div>
          </div>

          <FullTextEditor
            key={payload?.CommentID || "new"}
            value={payload?.TemplateText}
            setValue={(val) => setPayload((prev) => ({ ...prev, TemplateText: val }))}
            EditTable={Editable}
            setEditTable={setEditable}
          />

          <div className="mt-3">
            {isCreateMode ? (
              <CustomButton
                onClick={insertInvestigation}
                disabled={!payload?.TemplateText || payload.TemplateText.trim().length === 0 || !payload?.Template || payload.Template.trim().length === 0}
                text="Save"
                variant="success"
              />
            ) : (
              <CustomButton
                onClick={updateInvestigation}
                disabled={!payload?.TemplateText || payload.TemplateText.trim().length === 0}
                text="Update"
                variant="success"
              />
            )}

            <CustomButton
              text="Cancel"
              variant="danger"
              className=" ml-2"
              onClick={handleCancel}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestigationsComment;