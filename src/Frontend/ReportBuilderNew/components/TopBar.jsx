import React from "react";
import Input from "@components/formComponent/Input";
import ReactSelect from "@components/formComponent/ReactSelect";
import { CustomButton, SaveButton, DeleteButton } from "@components/UI/CustomButton";

export default function TopBar({
  meta,
  templateId,
  templateList,
  defaultTemplateId,
  onSelectTemplate,
  onMetaChange,
  onSave,
  onPublish,
  onDelete,
  onViewJson,
  saving,
  publishing,
  deleting,
}) {
  const templateOptions = [
    { label: "+ New template", value: "" },
    ...(templateList || []).map((t) => ({
      label: `${t.name} — v${t.version} (${t.status})${!t.isDefault ? " · Default" : ""}`,
      value: String(t.templateId),
    })),
  ];

  // Save/Publish always write into whichever template is currently flagged default —
  // when you've loaded a different one to look at/tweak, make that explicit so a save
  // doesn't surprise you by landing somewhere else.
  const defaultTemplateName = (templateList || []).find((t) => t.isDefault)?.name;
  const editingNonDefault = templateId && defaultTemplateId && String(templateId) !== String(defaultTemplateId);

  return (
    <div className="rbn-topbar">
      <div className="rbn-topbar-title">
        <span className="rbn-topbar-brand">Receipt Format Designer</span>
        <span className="rbn-topbar-sub">Patient receipt template</span>
      </div>

      <div className="rbn-topbar-name">
        <Input
          id="rbn-template-name"
          name="name"
          placeholder=" "
          value={meta.name}
          onChange={(e) => onMetaChange({ name: e.target.value })}
        />
      </div>

      <span className={`rbn-status-badge ${meta.status === "Published" ? "published" : "draft"}`}>
        v{meta.version} · {meta.status}
      </span>
      {editingNonDefault && (
        <span className="rbn-status-badge rbn-info-badge" title={`Save/Publish will update "${defaultTemplateName}", not this one`}>
          Saves to default: {defaultTemplateName}
        </span>
      )}

      <div className="rbn-topbar-load">
        <ReactSelect
          id="rbn-template-picker"
          name="templatePicker"
          placeholderName="Load template"
          dynamicOptions={templateOptions}
          value={templateId ? String(templateId) : ""}
          onChange={(_, opt) => onSelectTemplate(opt?.value || "")}
        />
      </div>

      <div className="rbn-topbar-actions">
        <CustomButton text="View JSON" icon="table" variant="secondary" onClick={onViewJson} />
        {templateId && <DeleteButton text="Delete" onClick={onDelete} loading={deleting} disabled={saving || publishing} />}
        <SaveButton text="Save" onClick={onSave} loading={saving} disabled={publishing} />
        <CustomButton text="Publish" icon="check" variant="primary" onClick={onPublish} loading={publishing} disabled={saving} />
      </div>
    </div>
  );
}
