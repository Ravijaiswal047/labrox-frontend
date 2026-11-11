import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { Dialog } from "primereact/dialog";
import { Form } from "react-bootstrap";
import { SelectBox } from "../../components/formComponent/SelectBox";
import { CancelButton, SaveButton, CustomButton } from "../../components/UI/CustomButton";
import { axiosInstance, axiosReport } from "../../utils/axiosInstance";
import FullTextEditor from "../../components/formComponent/TextEditor";
import Input from "../../components/formComponent/Input";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import Reason from "../utils/Reason";
import PdfViewer from "../Components/PdfViewer";

const isMobileDevice = () =>
  window.innerWidth <= 768 ||
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

const ResultEntryRadiologyDetail = ({ data, rows = [], onBack, onNavigate, onStatusUpdated }) => {
  const { t } = useTranslation();
  const theme = useLocalStorage("theme", "get");
  const { HideResultEntryPreview } = useLocalStorage("userData", "get") || {};
  const [reportValue, setReportValue] = useState("");
  const [templateOptions, setTemplateOptions] = useState([{ label: "Select Template", value: "" }]);
  const [templateList, setTemplateList] = useState([]);
  const [templateId, setTemplateId] = useState("");
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateText, setNewTemplateText] = useState("");
  const [newTemplateIsDefault, setNewTemplateIsDefault] = useState(0);
  const [newTemplateEditable, setNewTemplateEditable] = useState(true);
  const [creatingTemplate, setCreatingTemplate] = useState(false);
  const [investigationID, setInvestigationID] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [editTable, setEditTable] = useState(true);
  const [reportStatus, setReportStatus] = useState("");
  const [doctorOptions, setDoctorOptions] = useState([]);
  const [approvedBy, setApprovedBy] = useState("0");
  // Previously also required doctorTouched (an explicit click on the Doctor
  // dropdown) before Approve unlocked, even when a real doctor was already
  // correctly selected/defaulted - in practice that just blocked Approve on
  // valid reports (a real, non-"0" approvedBy) with no way to tell why short
  // of re-picking the same value. Dropped that extra gate; a genuine doctor
  // value (isDoctorSelected) is enough on its own now. Kept the state/setter
  // around since handleDoctorChange still uses it harmlessly.
  const [doctorTouched, setDoctorTouched] = useState(false);
  const [actionLoading, setActionLoading] = useState({
    Save: false,
    Approve: false,
    Hold: false,
    Unhold: false,
    UnApprove: false,
  });
  const isActionInProgress = Object.values(actionLoading).some(Boolean);
  // reportStatus reflects the backend's persisted status, not "have this
  // session's current edits been saved" - a report can already sit in
  // "Save" status from before this screen was even opened, which let Approve
  // go through on freshly-typed/templated content that was never actually
  // saved. isDirty tracks that second thing separately: true the moment the
  // editor content or template selection changes, false again right after a
  // successful Save (see handleSave) or a fresh fetch.
  const [isDirty, setIsDirty] = useState(false);
  // Must Save the report before it can be Approved, and a report that was
  // Unapproved (after being Approved) must be re-approvable too - it went
  // straight from Approved to Unapproved without passing through Save again.
  // Can't Hold something already Held/Approved; can't Unapprove before it's
  // Approved. Approving also requires the user to have actually picked a
  // doctor themself - a pre-filled default doesn't count (see doctorTouched).
  const isDoctorSelected = !!approvedBy && approvedBy !== "0";
  const isApproved = reportStatus === "Approved";
  const isHold = reportStatus === "Hold";
  // Same visibility as Result Entry: Save/Approve only while the report is
  // not yet Approved; Not Approved only after it is. Hold/Unhold swap.
  const canSave = !isApproved;
  const showApprove = !isApproved;
  const canApprove =
    (reportStatus === "Save" || reportStatus === "Unapproved") &&
    isDoctorSelected &&
    !isDirty;
  const canHold = !isHold && !isApproved;
  const canUnhold = isHold;
  const canUnapprove = isApproved;
  const canPreview = reportStatus === "Save" || reportStatus === "Approved";
  const [agePart, genderPart] = String(data?.Age_Gender || "").split("/");
  const genderLabel = data?.Gender || genderPart || "";
  const genderKey = String(genderLabel).trim().toLowerCase();
  const isMale = genderKey === "male" || genderKey === "m";
  const isFemale = genderKey === "female" || genderKey === "f";
  const genderIcon = isMale
    ? "fa fa-male"
    : isFemale
      ? "fa fa-female"
      : "fa fa-user";
  const genderIconColor = isMale ? "#90caf9" : isFemale ? "#f48fb1" : "#fff";
  const [previewLoading, setPreviewLoading] = useState(false);
  const [reportPreview, setReportPreview] = useState({ show: false, url: "" });
  const [reason, setReason] = useState({ HoldShow: false, Hdata: {}, type: "" });

  const totalRows = rows?.length || 0;
  // Prefer the row's live position in `rows` (by TestID) over the
  // possibly-stale currentIndex baked in when it was opened from the list —
  // see goToNext/goToPrevious below for why that can drift.
  const liveRowIndex = rows?.findIndex((r) => String(r?.TestID) === String(data?.TestID));
  const position = (liveRowIndex != null && liveRowIndex !== -1 ? liveRowIndex : (data?.currentIndex ?? 0)) + 1;

  // syncStatus=false skips overwriting reportStatus from this response — used
  // right after a save, where reportStatus was already set optimistically
  // from the save's own outcome (see handleSave). Without this, a GET that
  // lands before the backend has actually committed the new status (or just
  // returns a stale value) silently reverts it — e.g. Approve → Unapprove
  // flips back to "Approved" and the Approve button stays wrongly disabled.
  const fetchReport = (payload, applySelections, syncStatus = true) => {
    setFetching(true);
    axiosInstance
      .post("RediologyResultEntry/GetRadiologyReport", payload)
      .then((res) => {
        const report = res?.data?.data || {};
        setReportValue(report?.ReportText || "");
        setInvestigationID(report?.InvestigationID ?? null);
        if (syncStatus) setReportStatus(report?.ResultStatus || "");
        if (applySelections) {
          setTemplateId(report?.TemplateID ?? "");
        }
        // Content shown now matches what's actually persisted server-side.
        setIsDirty(false);
        setFetching(false);
      })
      .catch(() => {
        if (applySelections) {
          setReportValue("");
          setTemplateId("");
          setInvestigationID(null);
          setReportStatus("");
        }
        setFetching(false);
      });
  };

  useEffect(() => {
    if (!data?.TestID) return;
    fetchReport({ testID: data?.TestID }, true);
    // A new report needs its own explicit doctor pick - don't let a touch
    // recorded on a previous report carry over.
    setDoctorTouched(false);
  }, [data?.TestID]);

  useEffect(() => {
    axiosInstance
      .get("CommonController/BindApprovalDoctor")
      .then((res) => {
        const list = Array.isArray(res?.data?.message) ? res.data.message : [];
        const options = list.map((ele) => ({
          value: ele?.employeeid,
          label: ele?.name,
          IsDefault: ele?.IsDefault,
        }));
        setDoctorOptions(options);
        setApprovedBy(
          options?.length === 1
            ? options[0]?.value?.toString()
            : options?.find((ele) => ele?.IsDefault === 1)?.value?.toString() || "0",
        );
      })
      .catch(() => setDoctorOptions([]));
  }, []);

  const handleDoctorChange = (e) => {
    setApprovedBy(e.target.value);
    setDoctorTouched(true);
  };

  const fetchTemplates = (investigationIDs) => {
    axiosInstance
      .post("InvestigationCommentMaster/getInvestigationCommentData", {
        InvestigationID: investigationIDs || [],
        Template: "",
        TemplateText: "",
      })
      .then((res) => {
        const list = Array.isArray(res?.data?.message) ? res.data.message : [];
        setTemplateList(list);
        setTemplateOptions([
          { label: "Select Template", value: "" },
          ...list.map((item) => ({ label: item?.Template, value: item?.CommentID })),
        ]);
      })
      .catch(() => {
        setTemplateList([]);
        setTemplateOptions([{ label: "Select", value: "" }]);
      });
  };

  useEffect(() => {
    if (!data?.TestID) return;
    const siblingTestIDs = Array.from(
      new Set(
        (rows || [])
          .filter((row) => row?.LedgerTransactionNo === data?.LedgerTransactionNo)
          .map((row) => Number(row?.TestID))
          .filter(Boolean),
      ),
    );
    const testIDs = siblingTestIDs.length ? siblingTestIDs : [Number(data?.TestID)];

    Promise.all(
      testIDs.map((testID) =>
        axiosInstance
          .post("RediologyResultEntry/GetRadiologyReport", { testID })
          .then((res) => res?.data?.data?.InvestigationID)
          .catch(() => null),
      ),
    ).then((investigationIDs) => {
      const uniqueIDs = Array.from(new Set(investigationIDs.filter(Boolean)));
      fetchTemplates(uniqueIDs.length ? uniqueIDs : [Number(data?.TestID)]);
    });
  }, [data?.TestID, data?.LedgerTransactionNo, rows]);

  const handleTemplateChange = (e) => {
    const value = e.target.value;
    setTemplateId(value);
    if (!value) {
      fetchReport({ testID: data?.TestID }, false);
      return;
    }
    const selectedTemplate = templateList.find(
      (item) => String(item?.CommentID) === String(value),
    );
    setReportValue(selectedTemplate?.TemplateText || "");
    setIsDirty(true);
  };

  const resetCreateTemplateForm = () => {
    setNewTemplateName("");
    setNewTemplateText("");
    setNewTemplateIsDefault(0);
  };

  // Creates a new investigation template right from Result Entry (same
  // Template Name / Is Default / editor fields as InvestigationsComment's
  // "Create New"), then applies it to the report being worked on - so a
  // template can be created without leaving Result Entry for
  // /InvestigationsComment.
  const handleCreateTemplate = () => {
    const name = newTemplateName.trim();
    if (!name) {
      toast.error(t("Please enter template name"));
      return;
    }
    if (!newTemplateText?.trim()) {
      toast.error(t("Template text cannot be empty"));
      return;
    }
    if (!investigationID) {
      toast.error(t("Investigation not found for this report"));
      return;
    }

    setCreatingTemplate(true);
    axiosInstance
      .post("InvestigationCommentMaster/InsertInvestigationComment", {
        isActive: 1,
        isDefault: newTemplateIsDefault,
        InvestigationID: investigationID,
        Template: name,
        TemplateText: newTemplateText,
        TestName: data?.Test || "",
      })
      .then((res) => {
        if (!res?.data?.success) {
          toast.error(res?.data?.message || t("Failed to create template"));
          return;
        }
        toast.success(res.data.message || t("Template created"));
        setShowCreateTemplate(false);

        axiosInstance
          .post("InvestigationCommentMaster/getInvestigationCommentData", {
            InvestigationID: [investigationID],
            Template: "",
            TemplateText: "",
          })
          .then((res2) => {
            const list = Array.isArray(res2?.data?.message) ? res2.data.message : [];
            setTemplateList(list);
            setTemplateOptions([
              { label: "Select Template", value: "" },
              ...list.map((item) => ({ label: item?.Template, value: item?.CommentID })),
            ]);
            const created = list.find((item) => item?.Template === name);
            if (created) {
              setTemplateId(created.CommentID);
              setReportValue(newTemplateText);
              setIsDirty(true);
            }
            resetCreateTemplateForm();
          });
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || t("Error creating template"));
      })
      .finally(() => setCreatingTemplate(false));
  };

  // data.currentIndex is only ever set once, at the moment a row is opened
  // from the list (see openVisit() in ResultEntryRadiology.jsx) — if the
  // list's rows shift at all after that (search filter narrows/reorders it,
  // or a status patch happens to move this row out of the current filter),
  // that index goes stale and rows[currentIndex + 1] can land on a
  // completely different test than the one actually adjacent on screen.
  // Look the current row up by TestID in the live rows array instead, so
  // Next/Previous (including the Approve auto-next path) always steps from
  // where this test actually sits right now, not where it sat when opened.
  const getCurrentRowIndex = () => {
    const liveIndex = rows?.findIndex((r) => String(r?.TestID) === String(data?.TestID));
    return liveIndex != null && liveIndex !== -1 ? liveIndex : (data?.currentIndex ?? 0);
  };

  const goToNext = () => {
    const nextIndex = getCurrentRowIndex() + 1;
    if (onNavigate && rows?.[nextIndex]) {
      onNavigate({ ...rows[nextIndex], currentIndex: nextIndex });
    }
  };

  const goToPrevious = () => {
    const prevIndex = getCurrentRowIndex() - 1;
    if (onNavigate && prevIndex >= 0 && rows?.[prevIndex]) {
      onNavigate({ ...rows[prevIndex], currentIndex: prevIndex });
    }
  };

  const handlePreview = () => {
    if (!data?.TestIdHash || previewLoading) return;
    setPreviewLoading(true);
    axiosReport
      .post(
        "RediologyResultEntry/PrintRadiologyReport",
        { testIdHash: data.TestIdHash },
        { responseType: "blob" },
      )
      .then(async (res) => {
        const blob = res.data;
        const isJson =
          blob.type === "application/json" ||
          blob.type === "text/json" ||
          blob.type === "text/plain";

        if (isJson) {
          const text = await blob.text();
          try {
            const json = JSON.parse(text);
            toast.error(json?.message || t("Something Went Wrong"));
          } catch {
            toast.error(t("Something Went Wrong"));
          }
          return;
        }

        // Force the PDF mime type on the blob so it renders correctly, and
        // show it in the in-app Report Preview modal (like /resultentry)
        // instead of opening a new browser tab.
        const pdfBlob = new Blob([blob], { type: "application/pdf" });
        const pdfUrl = window.URL.createObjectURL(pdfBlob);
        setReportPreview({ show: true, url: pdfUrl });
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || t("Preview failed"));
      })
      .finally(() => setPreviewLoading(false));
  };

  const resultStatusApiMap = {
    Save: "Save",
    Hold: "Hold",
    Unhold: "Save",
    Approve: "Approved",
    UnApprove: "Unapproved",
  };

  const handleSave = (resultStatus = "Save", remark = "") => {
    // Belt-and-suspenders: the Approve button is already disabled without a
    // real doctor value, but guard here too in case this is ever reached
    // another way.
    if (
      resultStatus === "Approve" &&
      (!approvedBy || approvedBy === "0")
    ) {
      toast.error(t("Please select a doctor before approving"));
      return;
    }

    setActionLoading((prev) => ({ ...prev, [resultStatus]: true }));
    axiosInstance
      .post("RediologyResultEntry/SaveRadiologyReport", {
        testId: data?.TestID,
        ledgerTransactionNo: data?.LedgerTransactionNo,
        patientCode: data?.PatientCode,
        investigationID: investigationID,
        templateID: templateId ? Number(templateId) : null,
        reportText: reportValue,
        resultStatus: resultStatusApiMap[resultStatus] || resultStatus,
        approvedBy,
        remark,
      })
      .then((res) => {
        setActionLoading((prev) => ({ ...prev, [resultStatus]: false }));
        toast.success(res?.data?.message || "Saved");

        // Reflect the new status locally right away instead of waiting on
        // fetchReport()'s async response (which - same issue as the
        // Laboratory ResultEntry.jsx tab colors - can lag behind the save
        // and leave canHold/canApprove/canUnapprove evaluating the stale
        // status, e.g. Hold staying visible right after Approve).
        setReportStatus(resultStatusApiMap[resultStatus] || resultStatus);
        // Whatever was in the editor/template just got sent and saved.
        setIsDirty(false);

        // Patch the parent list's row status in place — mirrors ResultEntry.jsx
        // (Laboratory) — so the badge color is already correct on "Back to List"
        // instead of only updating after the next search.
        onStatusUpdated?.({
          testID: data?.TestID,
          resultStatus: resultStatusApiMap[resultStatus] || resultStatus,
        });

        // Approve used to auto-advance to the next test in the list when
        // AllowAutoNextApproveResultEntry was on, but that's confusing when
        // you don't realize the setting is on — every action (Save, Hold,
        // Approve, Unapprove) now consistently refreshes the same test in
        // place instead of ever navigating away on its own. Use the
        // Next/Previous arrows to move between tests explicitly.
        // syncStatus=false — reportStatus was already set correctly above
        // from this save's own result; don't let this refresh (which only
        // needs ReportText/TemplateID) risk reverting it with a stale read.
        fetchReport({ testID: data?.TestID }, true, false);
      })
      .catch((err) => {
        setActionLoading((prev) => ({ ...prev, [resultStatus]: false }));
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Something Went Wrong",
        );
      });
  };

  const handleNotApproveRemark = (e, hdata) => {
    const { name, value } = e.target;
    setReason((prev) => ({ ...prev, Hdata: { ...prev.Hdata, [name]: value } }));
  };

  const handleResultSubmit = (type) => {
    if (type === "Hold") {
      handleSave("Hold", reason?.Hdata?.HoldReason);
    } else {
      handleSave("UnApprove", reason?.Hdata?.NotApproveRemark);
    }
  };

  return (
    <div className={`card shadow-sm border-0 ${theme || ""}`}>
      <div
        className="p-2 bg-color-container"
        style={{
          color: "#fff",
          borderRadius: "4px 4px 0 0",
        }}
      >
        <div className="custom-row gap-2 align-items-center">
          <div className="col-auto" title={t("Visit No")}>
            <i className="fa fa-folder" title={t("Visit No")} />
            <span className="custom-text">{data?.LedgerTransactionNo}</span>
          </div>
          <div className="col-auto" title={t("Patient Name")}>
            <i className="fa fa-user" title={t("Patient Name")} />
            <span className="custom-text">{data?.PName}</span>
          </div>
          <div className="col-auto" title={t("UHID")}>
            <i className="fa fa-id-card" title={t("UHID")} />
            <span className="custom-text">{data?.PatientCode}</span>
          </div>
          <div className="col-auto" title={t("Age")}>
            <i className="fa fa-calendar" title={t("Age")} />
            <span className="custom-text">{agePart || data?.Age_Gender}</span>
          </div>
          <div className="col-auto" title={genderLabel || t("Gender")}>
            <i
              className={genderIcon}
              title={genderLabel || t("Gender")}
              style={{ color: genderIconColor }}
            />
          </div>
          <div className="col-auto" title={t("Centre")}>
            <i className="fa fa-hospital-o" title={t("Centre")} />
            <span className="custom-text">{data?.Centre}</span>
          </div>
          <div className="col-auto" title={t("Barcode No")}>
            <i className="fa fa-plus-square" title={t("Barcode No")} />
            <span className="custom-text">{data?.BarcodeNo}</span>
          </div>
          <div className="col-auto" title={t("Reg Date")}>
            <i className="fa fa-calendar" title={t("Reg Date")} />
            <span className="custom-text">{data?.DATE}</span>
          </div>
          <div className="col-auto">
          <i className="fa fa-boxes" title={t("Test")} />
            <strong className="custom-text"> {data?.Test}</strong>
          </div>
          <div className="d-flex align-items-center gap-2">
            <div style={{ minWidth: "220px" }}>
              <SelectBox
                options={templateOptions}
                selectedValue={templateId}
                name="templateId"
                id="templateId"
                onChange={handleTemplateChange}
                isDisabled={isApproved}
              />
            </div>
            <CustomButton
              text={t("Create Template")}
              variant="secondary"
              icon={"add"}
              onClick={() => setShowCreateTemplate(true)}
              disabled={isApproved}
            />
          </div>
        </div>
      </div>

      {showCreateTemplate && (
        <Dialog
          header={t("Create New Template")}
          visible={showCreateTemplate}
          style={{ width: isMobileDevice() ? "95vw" : "60vw" }}
          onHide={() => {
            setShowCreateTemplate(false);
            resetCreateTemplateForm();
          }}
          className={theme}
        >
          <div className="row mb-2 align-items-center">
            <div className="col-sm-6">
              <Input
                placeholder=" "
                lable={t("Template Name")}
                id="newTemplateName"
                name="newTemplateName"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
              />
            </div>
            <div className="col-sm-2 d-flex align-items-center">
              <Form.Check
                type="switch"
                id="newTemplateIsDefault"
                name="newTemplateIsDefault"
                label={t("Is Default")}
                className="m-0"
                checked={!!newTemplateIsDefault}
                onChange={(e) => setNewTemplateIsDefault(e.target.checked ? 1 : 0)}
              />
            </div>
          </div>

          <FullTextEditor
            key="newTemplate"
            value={newTemplateText}
            setValue={setNewTemplateText}
            EditTable={newTemplateEditable}
            setEditTable={setNewTemplateEditable}
          />

          <div className="mt-3">
            <CustomButton
              onClick={handleCreateTemplate}
              disabled={
                creatingTemplate ||
                !newTemplateText?.trim() ||
                !newTemplateName.trim()
              }
              loading={creatingTemplate}
              text={t("Save")}
              variant="success"
            />
            <CustomButton
              text={t("Cancel")}
              variant="danger"
              className="ml-2"
              onClick={() => {
                setShowCreateTemplate(false);
                resetCreateTemplateForm();
              }}
            />
          </div>
        </Dialog>
      )}

      <div
        className="px-3 py-2 d-flex align-items-center justify-content-between bg-color-container"
        style={{ color: "#fff" }}
      >
        {Number(data?.IsRepeatPatient) === 1 && (
          <span
            className="badge"
            style={{ backgroundColor: "#8e44ec", color: "#fff" }}
          >
            {t("Repeat Patient")}
          </span>
        )}
      </div>

      <div className="px-3 pt-3">
        {/* <div className="mt-2">
          <small className="text-muted">
            {t("Note:- Font type : Verdana and Font size : 14")}
          </small>
        </div> */}

        <div className="mt-2 border rounded" style={{ position: "relative", minHeight: 280 }}>
          {fetching ? (
            <div
              className="d-flex align-items-center justify-content-center text-muted"
              style={{ height: 280 }}
            >
              {t("Loading report...")}
            </div>
          ) : (
            <FullTextEditor
              value={reportValue}
              setValue={(v) => { setReportValue(v); setIsDirty(true); }}
              EditTable={editTable}
              setEditTable={setEditTable}
              editorHeight={280}
            />
          )}
        </div>

        <div className="d-flex justify-content-between align-items-center gap-2 my-3 pt-3 border-top">
          <div className="d-flex gap-2 align-items-center">
            <CustomButton text={t("Back to List")} icon={"back"} onClick={onBack} />
            <i
              className="fa fa-chevron-left mx-2"
              style={{
                color: position <= 1 ? "gray" : "darkred",
                cursor: position <= 1 ? "not-allowed" : "pointer",
                fontSize: "18px",
              }}
              title={position <= 1 ? t("No previous record") : t("Previous")}
              onClick={() => position > 1 && goToPrevious()}
            />
            <span className="mx-1">
              {position} / {totalRows}
            </span>
            <i
              className="fa fa-chevron-right mx-2"
              style={{
                color: position >= totalRows ? "gray" : "darkred",
                cursor: position >= totalRows ? "not-allowed" : "pointer",
                fontSize: "18px",
              }}
              title={position >= totalRows ? t("No next record") : t("Next")}
              onClick={() => position < totalRows && goToNext()}
            />
          </div>
          <div className="d-flex gap-2 align-items-center">
            {HideResultEntryPreview == 0 && (
              <CustomButton
                text={previewLoading ? t("Loading...") : t("Preview")}
                variant="secondary"
                onClick={handlePreview}
                loading={previewLoading}
                disabled={!canPreview}
                {...(!canPreview && { title: t("Save the report before previewing") })}
                className="mr-4"
              />
            )}
            <div style={{ minWidth: "180px", marginRight: "8px" }}>
              <SelectBox
                options={[{ label: "Select Doctor", value: "0" }, ...doctorOptions]}
                selectedValue={approvedBy}
                name="ApprovedBy"
                id="ApprovedBy"
                lable={t("Doctor")}
                onChange={handleDoctorChange}
                isDisabled={isApproved}
              />
            </div>
            {canSave && (
              <SaveButton
                text={t("Save")}
                onClick={() => handleSave("Save")}
                loading={actionLoading.Save}
                disabled={isActionInProgress}
                className="mr-4"
              />
            )}
            {showApprove && (
              <CustomButton
                text={t("Approve")}
                variant="success"
                onClick={() => handleSave("Approve")}
                loading={actionLoading.Approve}
                disabled={isActionInProgress || !canApprove}
                {...(!canApprove && {
                  title:
                    reportStatus === "Hold"
                      ? t("Unhold the report before approving")
                      : (reportStatus === "Save" || reportStatus === "Unapproved") &&
                          !isDoctorSelected
                        ? t("Select a doctor before approving")
                        : t("Save the report before approving"),
                })}
                className="mr-4"
              />
            )}
            {canHold && (
              <CustomButton
                text={t("Hold")}
                variant="warning"
                onClick={() =>
                  setReason({
                    HoldShow: true,
                    type: "Hold",
                    Hdata: { PackageName: data?.Test, HoldReason: "" },
                  })
                }
                loading={actionLoading.Hold}
                disabled={isActionInProgress}
                className="mr-4"
              />
            )}
            {canUnhold && (
              <CustomButton
                text={t("Unhold")}
                variant="success"
                onClick={() => handleSave("Unhold")}
                loading={actionLoading.Unhold}
                disabled={isActionInProgress}
                className="mr-4"
              />
            )}
            {canUnapprove && (
              <CustomButton
                text={t("Not Approved")}
                variant="secondary"
                onClick={() =>
                  setReason({
                    HoldShow: true,
                    type: "Not Approved",
                    Hdata: { PackageName: data?.Test, NotApproveRemark: "" },
                  })
                }
                loading={actionLoading.UnApprove}
                disabled={isActionInProgress}
              />
            )}
          </div>
        </div>
      </div>

      {reason?.HoldShow && (
        <Reason
          show={reason?.HoldShow}
          reason={reason}
          setReason={setReason}
          handleNotApproveRemark={handleNotApproveRemark}
          handleResultSubmit={handleResultSubmit}
        />
      )}

      {reportPreview.show && (
        <Dialog
          header={t("Report Preview")}
          visible={reportPreview.show}
          style={{ height: "100vh", width: isMobileDevice() ? "95vw" : "60vw" }}
          contentStyle={{ padding: 0, overflow: "hidden" }}
          onHide={() => {
            if (reportPreview.url) window.URL.revokeObjectURL(reportPreview.url);
            setReportPreview({ show: false, url: "" });
          }}
          className={theme}
        >
          <div style={{ width: "100%", height: "85vh" }}>
            {isMobileDevice() ? (
              <PdfViewer pdfUrl={reportPreview.url} />
            ) : (
              <iframe
                src={`${reportPreview.url}#toolbar=0`}
                title="Report Preview"
                style={{ width: "100%", height: "100%", border: "none" }}
              ></iframe>
            )}
          </div>
        </Dialog>
      )}
    </div>
  );
};

export default ResultEntryRadiologyDetail;
