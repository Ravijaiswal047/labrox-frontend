import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { v4 as uuidv4 } from "uuid";
import { Checkbox } from "primereact/checkbox";
import Input from "../../components/formComponent/Input";
import ReactSelect from "../../components/formComponent/ReactSelect";
import Heading from "../../components/UI/Heading";
import Modal from "../../components/ModalComponent/Modal";
import FormRenderer from "./FormRenderer";
import { notify } from "../../utils/ustil2";
import {
  FormBuilderGetFieldTypeMaster,
  FormBuilderGetFormTypeMaster,
  FormBuilderCreateAndUpdateFormLayout,
  FormBuilderGetOtherTableLinkage,
} from "../../NetworkServices/Form-builder";
import { useLocation, useNavigate } from "react-router-dom";

const StrictModeDroppable = ({ children, ...props }) => {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true));
    return () => {
      cancelAnimationFrame(animation);
      setEnabled(false);
    };
  }, []);
  if (!enabled) return null;
  return <Droppable {...props}>{children}</Droppable>;
};

const generateCssClass = (sizeObj) => {
  if (!sizeObj) return "col-xl-12 col-md-12 col-sm-12 col-12";
  return `col-xl-${sizeObj.xl || 12} col-lg-${sizeObj.lg || 12} col-md-${sizeObj.md || 12} col-sm-${sizeObj.sm || 12} col-${sizeObj.xs || 12}`;
};

const parseCssClass = (cssString) => {
  const defaults = { xl: 12, lg: 12, md: 12, sm: 12, xs: 12 };
  if (!cssString) return defaults;

  const parts = cssString.split(" ");
  parts.forEach((part) => {
    if (part.startsWith("col-xl-"))
      defaults.xl = parseInt(part.replace("col-xl-", "")) || 12;
    else if (part.startsWith("col-lg-"))
      defaults.lg = parseInt(part.replace("col-lg-", "")) || 12;
    else if (part.startsWith("col-md-"))
      defaults.md = parseInt(part.replace("col-md-", "")) || 12;
    else if (part.startsWith("col-sm-"))
      defaults.sm = parseInt(part.replace("col-sm-", "")) || 12;
    else if (part.startsWith("col-"))
      defaults.xs = parseInt(part.replace("col-", "")) || 12;
  });
  return defaults;
};

const generateName = (label) => {
  if (!label) return "";
  return label
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^\w-]+/g, "");
};

const ensureUniqueName = (baseName, sections, currentFieldId = null) => {
  let newName = baseName;
  let counter = 1;
  const allFields = sections.flatMap((sec) => sec.formFields);
  const exists = (nameToCheck) => {
    return allFields.some(
      (f) => f.field_name === nameToCheck && f.temp_id !== currentFieldId,
    );
  };
  while (exists(newName)) {
    newName = `${baseName}_${counter}`;
    counter++;
  }
  return newName;
};

const FormBuilder = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { form_data } = location.state || {};

  const [fieldTypes, setFieldTypes] = useState([]);
  const [formTypes, setFormTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [masterDropDownList, setMasterDropDownList] = useState([]);
  const [generalDropDownList, setGeneralDropDownList] = useState([]);

  const [formDetail, setFormDetail] = useState({
    form_id: 0,
    form_code: "",
    form_name: "",
    form_display_name: "",
    description: "",
    form_type_id: 0,
    is_active: 1,
    form_css: "card p-3 shadow-sm",
    isTabularView: 0,
    isPrintRequired: 0, 
    printView: "",
  });

  const [sections, setSections] = useState([]);
  const [selection, setSelection] = useState(null);

  useEffect(() => {
    const initData = async () => {
      try {
        const [typesRes, formsRes, masterRes, generalRes] = await Promise.all([
          FormBuilderGetFieldTypeMaster(),
          FormBuilderGetFormTypeMaster(),
          FormBuilderGetOtherTableLinkage(0),
          FormBuilderGetOtherTableLinkage(1), 
        ]);

        setFieldTypes(typesRes?.data || []);
        setFormTypes(formsRes?.data || []);
        setMasterDropDownList(masterRes?.data || []);
        setGeneralDropDownList(generalRes?.data || []);

        if (form_data) {
          setFormDetail(form_data.formDetial);

          const mappedSections = form_data.formSections.map((sec) => ({
            ...sec,
            temp_id: uuidv4(),
            gridSettings: parseCssClass(sec.section_css),
            formFields: sec.formFields.map((field) => ({
              ...field,
              temp_id: uuidv4(),
              gridSettings: parseCssClass(field.field_css),
              options_json: Array.isArray(field.options_json)
                ? field.options_json
                : [],
              is_required: parseInt(field.is_required || 0),
              is_field_disabled: parseInt(field.is_field_disabled || 0),
              is_score: parseInt(field.is_score || 0),
              iscustomtable: parseInt(field.iscustomtable || 0),
              isapidefaultvalue: parseInt(field.isapidefaultvalue || 0),
              table_linkage_id: parseInt(field.table_linkage_id || 0),
              score_formula: field.score_formula || "",
            })),
          }));

          setSections(mappedSections);
        } else if (formsRes?.data?.length > 0) {
          setFormDetail((prev) => ({
            ...prev,
            form_type_id: formsRes.data[0].form_type_id,
          }));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, []);

  const handleFormDisplayNameChange = (e) => {
    const val = e.target.value;
    setFormDetail((prev) => ({
      ...prev,
      form_display_name: val,
      form_name: generateName(val),
      form_code: generateName(val),
    }));
  };

  const addSection = () => {
    const newSec = {
      temp_id: uuidv4(),
      section_id: 0,
      section_title: "New Section",
      width_id: 0,
      display_order: sections.length + 1,
      is_active: 1,
      gridSettings: { xl: 12, md: 12, sm: 12, xs: 12 },
      section_css: "col-xl-12 col-md-12 col-sm-12 col-12",
      has_header: true,
      formFields: [],
    };
    setSections([...sections, newSec]);
  };

  const deleteSection = (tempId) => {
    setSections((prev) => prev.filter((s) => s.temp_id !== tempId));
    if (selection?.id === tempId) setSelection(null);
  };

  const addFieldToSection = (sectionId, typeObj) => {
    setSections((prevSections) => {
      const label = `New ${typeObj.display_name}`;
      const baseName = generateName(label);
      const uniqueName = ensureUniqueName(baseName, prevSections);

      let defaultValue = "";
      if (typeObj.field_type_id === 8) defaultValue = "CURRENT_TIME";
      if (typeObj.field_type_id === 9) defaultValue = "CURRENT_DATE";
      if (typeObj.field_type_id === 12) defaultValue = "0";

      const newField = {
        temp_id: uuidv4(),
        field_id: 0,
        field_label: label,
        field_name: uniqueName,
        field_type_id: typeObj.field_type_id,
        input_sub_type_id: typeObj.field_type_id === 1 ? 1 : 0,
        is_required: 0,
        field_default_value: defaultValue,
        is_field_disabled: 0,
        secondary_label: "",
        table_linkage_id: 0,
        is_score: 0,
        iscustomtable: 0,
        isapidefaultvalue: 0, 
        score_formula: "",
        options_json: [],
        is_child: 0,
        parent_name: "",
        parentId: 0,
        gridSettings: { xl: 3, md: 4, sm: 6, xs: 12 },
        field_css: "col-xl-3 col-md-4 col-sm-6 col-12",
        typeRef: typeObj,
      };

      return prevSections.map((sec) =>
        sec.temp_id === sectionId
          ? { ...sec, formFields: [...sec.formFields, newField] }
          : sec,
      );
    });
  };

  const deleteField = (sectionId, fieldId) => {
    setSections((prev) =>
      prev.map((sec) =>
        sec.temp_id === sectionId
          ? {
              ...sec,
              formFields: sec.formFields.filter((f) => f.temp_id !== fieldId),
            }
          : sec,
      ),
    );
    if (selection?.id === fieldId) setSelection(null);
  };

  const updateSection = (id, key, value) => {
    setSections((prev) =>
      prev.map((sec) => (sec.temp_id === id ? { ...sec, [key]: value } : sec)),
    );
  };

  const updateField = (sectionId, fieldId, key, value) => {
    setSections((prev) => {
      return prev.map((sec) => {
        if (sec.temp_id === sectionId) {
          return {
            ...sec,
            formFields: sec.formFields.map((f) => {
              if (f.temp_id === fieldId) {
                if (key === "field_label") {
                  const baseName = generateName(value);
                  const uniqueName = ensureUniqueName(baseName, prev, fieldId);
                  return {
                    ...f,
                    [key]: value,
                    field_name: uniqueName,
                  };
                }
                return { ...f, [key]: value };
              }
              return f;
            }),
          };
        }
        return sec;
      });
    });
  };

  const getAllDropdowns = () => {
    let dropdowns = [];
    sections.forEach((sec) => {
      const matches = sec.formFields.filter(
        (f) => f.field_type_id === 3 || f.field_type_id === 4,
      );
      dropdowns = [...dropdowns, ...matches];
    });
    return dropdowns;
  };

  const getAllTables = () => {
    let tables = [];
    sections.forEach((sec) => {
      const matches = sec.formFields.filter((f) => f.field_type_id === 11);
      tables = [...tables, ...matches];
    });
    return tables;
  };

  const onDragEnd = (result) => {
    const { source, destination, draggableId, type } = result;
    if (!destination) return;

    if (source.droppableId === "TOOLBOX") {
      const fieldType = fieldTypes.find(
        (t) => t.field_type_id.toString() === draggableId,
      );
      if (fieldType) addFieldToSection(destination.droppableId, fieldType);
      return;
    }

    if (type === "SECTION") {
      const newSections = Array.from(sections);
      const [movedSec] = newSections.splice(source.index, 1);
      newSections.splice(destination.index, 0, movedSec);
      setSections(newSections);
      return;
    }

    if (type === "FIELD") {
      const sourceSecIndex = sections.findIndex(
        (s) => s.temp_id === source.droppableId,
      );
      const destSecIndex = sections.findIndex(
        (s) => s.temp_id === destination.droppableId,
      );

      if (sourceSecIndex === -1 || destSecIndex === -1) return;

      const sourceFields = Array.from(sections[sourceSecIndex].formFields);
      const [movedField] = sourceFields.splice(source.index, 1);

      if (source.droppableId === destination.droppableId) {
        sourceFields.splice(destination.index, 0, movedField);
        const newSections = [...sections];
        newSections[sourceSecIndex].formFields = sourceFields;
        setSections(newSections);
      } else {
        const destFields = Array.from(sections[destSecIndex].formFields);
        destFields.splice(destination.index, 0, movedField);
        const newSections = [...sections];
        newSections[sourceSecIndex].formFields = sourceFields;
        newSections[destSecIndex].formFields = destFields;
        setSections(newSections);
      }
    }
  };

  const getFinalPayload = () => {
    return {
      formDetial: {
        ...formDetail,
      },
      formSections: sections.map((sec, idx) => ({
        section_id: sec.section_id,
        form_id: formDetail.form_id,
        section_title: sec.has_header ? sec.section_title : "",
        width_id: 0,
        display_order: idx + 1,
        is_active: sec.is_active,
        section_css: generateCssClass(sec.gridSettings),
        formFields: sec.formFields.map((field, fIdx) => ({
          field_id: field.field_id,
          form_id: formDetail.form_id,
          section_id: sec.section_id,
          field_label: field.field_label,
          field_name: field.field_name,
          field_type_id: field.field_type_id,
          input_sub_type_id: field.input_sub_type_id,
          width_id: 0,
          is_required: field.is_required,
          field_default_value: field.field_default_value,
          is_field_disabled: field.is_field_disabled,
          secondary_label: field.secondary_label || "",
          table_linkage_id: field.table_linkage_id || 0,
          is_score: field.is_score || 0,
          iscustomtable: field.iscustomtable || 0,
          isapidefaultvalue: field.isapidefaultvalue || 0,
          score_formula: field.score_formula || "",
          field_order: fIdx + 1,
          options_json: field.options_json,
          is_child: field.is_child,
          parent_name: field.parent_name,
          parentId: field.parentId,
          field_css: generateCssClass(field.gridSettings),
        })),
      })),
    };
  };

  const resetForm = () => {
    setFormDetail({
      form_id: 0,
      form_code: "",
      form_name: "",
      form_display_name: "",
      description: "",
      form_type_id: formTypes.length > 0 ? formTypes[0].form_type_id : 0,
      is_active: 1,
      form_css: "card p-3 shadow-sm",
      isTabularView: 0,
      isPrintRequired: 0,
      printView: "",
    });
    setSections([]);
    setSelection(null);
  };

  const handleSave = async () => {
    const payload = getFinalPayload();
    const isNew = formDetail.form_id === 0;
    try {
      const res = await FormBuilderCreateAndUpdateFormLayout(payload);
      if (res.success) {
        notify(`${res.message} (Form Number: ${res.data})`, "success");
        if (isNew) {
          resetForm();
          navigate("/FormBuilder", { replace: true, state: null });
        } else {
          resetForm();
          navigate("/FormBuilder", { replace: true, state: null });
        }
      } else {
        notify(res.message || "Error Saving", "error");
      }
    } catch (e) {
      console.error(e);
      notify("Server Error", "error");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="container-fluid vh-100 d-flex flex-column overflow-hidden">
        <div
          className="d-flex align-items-center bg-white border-bottom flex-wrap"
          style={{ minHeight: "60px", paddingTop: "10px", paddingBottom: "10px", paddingLeft: "16px", paddingRight: "16px", gap: "20px" }}
        >
          <div style={{ width: "120px", flexShrink: 0 }}>
            <ReactSelect
              placeholderName="Form Type"
              dynamicOptions={formTypes.map((t) => ({
                label: t.display_name,
                value: t.form_type_id,
              }))}
              value={formDetail?.form_type_id}
              onChange={(_, obj) =>
                setFormDetail({ ...formDetail, form_type_id: obj?.value })
              }
              removeIsClearable={true}
            />
          </div>

          <div style={{ width: "180px", flexShrink: 0 }}>
            <Input
              lable="Display Name"
              className="form-control"
              value={formDetail.form_display_name}
              onChange={handleFormDisplayNameChange}
            />
          </div>

          <div style={{ width: "180px", flexShrink: 0 }}>
            <Input
              lable="Form Name (DB)"
              className="form-control bg-light"
              value={formDetail.form_name}
              disabled={true}
            />
          </div>

          <div className="d-flex align-items-center flex-wrap gap-2 ms-auto">
            <button
              className="btn btn-primary"
              onClick={addSection}
              disabled={formDetail.form_display_name?.length === 0}
            >
              + Section
            </button>

            <div className="d-flex align-items-center gap-2" style={{ cursor: "pointer" }}>
              <Checkbox
                checked={formDetail.isTabularView === 1 ? true : false}
                onChange={(e) => {
                  const val = e.checked;
                  setFormDetail((prev) => ({
                    ...prev,
                    isTabularView: val ? 1 : 0,
                  }));
                }}
                inputId="isTabularView"
              />
              <label htmlFor="isTabularView" className="text-dark mb-0 small" style={{ cursor: "pointer", whiteSpace: "nowrap" }}>
                Is Detailed Table Required
              </label>
            </div>

            <div className="d-flex align-items-center gap-2" style={{ cursor: "pointer" }}>
              <Checkbox
                checked={formDetail.isPrintRequired === 1 ? true : false}
                onChange={(e) => {
                  const val = e.checked;
                  setFormDetail((prev) => ({
                    ...prev,
                    isPrintRequired: val ? 1 : 0,
                  }));
                }}
                inputId="isPrintRequired"
              />
              <label htmlFor="isPrintRequired" className="text-dark mb-0 small" style={{ cursor: "pointer", whiteSpace: "nowrap" }}>
                Is Print Required
              </label>
            </div>

            {formDetail.isPrintRequired === 1 && (
              <input
                type="text"
                className="form-control form-control-sm"
                style={{ width: "110px" }}
                placeholder="Print View"
                value={formDetail.printView}
                onChange={(e) => setFormDetail({ ...formDetail, printView: e.target.value })}
              />
            )}

            <button
              className="btn btn-info text-white"
              onClick={() => setShowPreview(true)}
            >
              <i className="pi pi-eye me-1"></i> Preview
            </button>
            <button className="btn btn-success" onClick={handleSave}>
              {formDetail.form_id > 0 ? "Update Form" : "Create Form"}
            </button>
          </div>
        </div>

        <div className="row flex-grow-1 overflow-hidden">
          <div className="col-md-2 bg-light border-end p-0 d-flex flex-column h-100">
            <div className="p-3 bg-white border-bottom">
              <h6 className="m-0">Toolbox</h6>
            </div>
            <div
              className="flex-grow-1 overflow-auto p-2"
              style={{ minHeight: 0 }}
            >
              <StrictModeDroppable
                droppableId="TOOLBOX"
                type="FIELD"
                isDropDisabled={true}
              >
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}>
                    {fieldTypes.map((type, index) => (
                      <Draggable
                        key={type.field_type_id}
                        draggableId={type.field_type_id.toString()}
                        index={index}
                      >
                        {(provided, snapshot) => {
                          const el = (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="card mb-2 p-2 shadow-sm text-center"
                              style={{
                                ...provided.draggableProps.style,
                                border: snapshot.isDragging
                                  ? "1px solid #0d6efd"
                                  : "1px solid #dee2e6",
                              }}
                            >
                              <i className="pi pi-box mb-1"></i>
                              <div className="small fw-bold">
                                {type.display_name}
                              </div>
                            </div>
                          );
                          return snapshot.isDragging
                            ? createPortal(el, document.body)
                            : el;
                        }}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </StrictModeDroppable>
            </div>
          </div>

          <div
            className="col-md-7 bg-light p-4"
            style={{ overflowY: "auto", maxHeight: "100%" }}
          >
            <div className={formDetail.form_css}>
              <h4 className="border-bottom pb-2 mb-3">
                {formDetail.form_display_name || "Form Preview"}
              </h4>

              <StrictModeDroppable droppableId="ROOT_CANVAS" type="SECTION">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="row"
                  >
                    {sections.map((sec, sIdx) => {
                      const secCss = generateCssClass(sec.gridSettings);
                      const isSelected =
                        selection?.type === "section" &&
                        selection?.id === sec.temp_id;

                      return (
                        <Draggable
                          key={sec.temp_id}
                          draggableId={sec.temp_id}
                          index={sIdx}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`${secCss} mb-3`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelection({
                                  type: "section",
                                  id: sec.temp_id,
                                });
                              }}
                            >
                              <div
                                className="card h-100 position-relative"
                                style={{
                                  border: isSelected
                                    ? "2px solid #0d6efd"
                                    : "1px solid #dee2e6",
                                }}
                              >
                                <div
                                  {...provided.dragHandleProps}
                                  className="position-absolute start-0 top-0 m-1 text-muted"
                                  style={{ cursor: "move", zIndex: 10 }}
                                >
                                  <i className="pi pi-bars"></i>
                                </div>
                                <button
                                  className="btn btn-sm btn-danger position-absolute end-0 top-0 m-1"
                                  style={{
                                    zIndex: 10,
                                    right: "0px",
                                    top: "0px",
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteSection(sec.temp_id);
                                  }}
                                >
                                  <i className="pi pi-trash"></i>
                                </button>

                                <div className="card-body p-2 pt-4">
                                  {sec.has_header && (
                                    <div className="mb-2">
                                      <Heading
                                        title={sec.section_title}
                                        isBreadcrumb={false}
                                      />
                                    </div>
                                  )}

                                  <StrictModeDroppable
                                    droppableId={sec.temp_id}
                                    type="FIELD"
                                  >
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className="row"
                                        style={{
                                          minHeight: "50px",
                                          backgroundColor:
                                            snapshot.isDraggingOver
                                              ? "#f0f8ff"
                                              : "transparent",
                                        }}
                                      >
                                        {sec.formFields.length === 0 && (
                                          <div className="text-center text-muted small w-100 py-3">
                                            Drop Fields Here
                                          </div>
                                        )}
                                        {sec.formFields.map((field, fIdx) => {
                                          const fieldCss = generateCssClass(
                                            field.gridSettings,
                                          );
                                          const isFieldSelected =
                                            selection?.type === "field" &&
                                            selection?.id === field.temp_id;
                                          return (
                                            <Draggable
                                              key={field.temp_id}
                                              draggableId={field.temp_id}
                                              index={fIdx}
                                            >
                                              {(provided) => (
                                                <div
                                                  ref={provided.innerRef}
                                                  {...provided.draggableProps}
                                                  {...provided.dragHandleProps}
                                                  className={fieldCss}
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelection({
                                                      type: "field",
                                                      id: field.temp_id,
                                                      sectionId: sec.temp_id,
                                                    });
                                                  }}
                                                >
                                                  <div
                                                    className={`position-relative p-1 ${isFieldSelected ? "bg-primary bg-opacity-10 rounded" : ""}`}
                                                  >
                                                    {isFieldSelected && (
                                                      <button
                                                        className="btn btn-xs btn-danger position-absolute top-0 end-0"
                                                        style={{
                                                          zIndex: 10,
                                                          padding: "0px 4px",
                                                        }}
                                                        onClick={(e) => {
                                                          e.stopPropagation();
                                                          deleteField(
                                                            sec.temp_id,
                                                            field.temp_id,
                                                          );
                                                        }}
                                                      >
                                                        <i
                                                          className="pi pi-times"
                                                          style={{
                                                            fontSize: "10px",
                                                          }}
                                                        ></i>
                                                      </button>
                                                    )}
                                                    <LiveFieldRenderer
                                                      field={field}
                                                    />
                                                  </div>
                                                </div>
                                              )}
                                            </Draggable>
                                          );
                                        })}
                                        {provided.placeholder}
                                      </div>
                                    )}
                                  </StrictModeDroppable>
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </StrictModeDroppable>
            </div>
          </div>

          <div className="col-md-3 bg-white border-start p-0 d-flex flex-column h-100">
            <div className="p-3 bg-white border-bottom">
              <h6 className="m-0">Properties</h6>
            </div>
            <div
              className="flex-grow-1 overflow-auto p-3"
              style={{ minHeight: 0 }}
            >
              <PropertiesPanel
                selection={selection}
                sections={sections}
                updateSection={updateSection}
                updateField={updateField}
                fieldTypes={fieldTypes}
                allDropdowns={getAllDropdowns()}
                masterDropDownList={masterDropDownList}
                allTables={getAllTables()}
                generalDropDownList={generalDropDownList}
              />
            </div>
          </div>
        </div>

        {showPreview && (
          <Modal
            Header="Form Preview"
            visible={showPreview}
            setVisible={setShowPreview}
            modalWidth="85%"
            buttons={<></>}
            footer={<></>}
          >
            <FormRenderer formLayoutProp={getFinalPayload()} isPreview={true} />
          </Modal>
        )}
      </div>
    </DragDropContext>
  );
};

const LiveFieldRenderer = ({ field }) => {
  const getOptions = () =>
    field.options_json?.map((opt) => ({
      label: opt.label,
      value: opt.value,
    })) || [];

  switch (field.field_type_id) {
    case 1:
    case 2:
      return field.field_type_id === 2 ? (
        <div className="form-group">
          <label className="small fw-bold text-dark">{field.field_label}</label>
          <textarea className="form-control" disabled></textarea>
        </div>
      ) : (
        <Input
          lable={field.field_label}
          className="form-control"
          placeholder={field.field_name}
          disabled
        />
      );
    case 3:
    case 4:
    case 10:
      return (
        <ReactSelect
          placeholderName={field.field_label}
          dynamicOptions={getOptions()}
          respclass="w-100"
        />
      );
    case 5:
      return (
        <div className="mt-4">
          <Checkbox checked={false} />
          <label className="ms-2 text-dark">{field.field_label}</label>
        </div>
      );
    case 11: 
      return (
        <div className="p-3 border bg-white text-center">
          <h6 className="fw-bold mb-0">{field.field_label} (Table)</h6>
          <small className="text-muted">Columns defined in DB</small>
        </div>
      );
    case 12:
      return (
        <div style={{ position: "relative" }}>
          <label
            className="fw-bold small mb-1"
            style={{ position: "absolute", top: "-4px", left: "10px" }}
          >
            {field.field_label}
          </label>
          <div
            className="text-white d-flex align-items-center justify-content-center"
            style={{
              backgroundColor: "#EF5350",
              width: "80px",
              height: "30px",
              borderRadius: "5px",
              fontWeight: "bold",
            }}
          >
            {field.field_default_value || "0"}
          </div>
        </div>
      );
    case 13:
      return (
        <h5
          className="fw-bold mt-2 mb-2 border-bottom pb-1"
          style={{ fontWeight: "700" }}
        >
          {field.field_label}
        </h5>
      );
    case 15: 
      return (
        <button className="btn btn-secondary w-100 mt-4">
          {field.field_label}
        </button>
      );
    default:
      return (
        <div className="alert alert-warning p-1 small">{field.field_label}</div>
      );
  }
};

const PropertiesPanel = ({
  selection,
  sections,
  updateSection,
  updateField,
  fieldTypes,
  allDropdowns,
  masterDropDownList,
  allTables,
  generalDropDownList
}) => {
  if (!selection)
    return <div className="text-muted text-center mt-5">Select an element</div>;

  if (selection.type === "section") {
    const sec = sections.find((s) => s.temp_id === selection.id);
    if (!sec) return null;
    return (
      <div className="d-flex flex-column gap-3">
        <h6 className="fw-bold text-primary">Section Settings</h6>
        <div className="d-flex align-items-center mb-2">
          <Checkbox
            checked={sec.has_header}
            onChange={(e) =>
              updateSection(sec.temp_id, "has_header", e.checked)
            }
          />
          <label className="ms-2 small">Show Header</label>
        </div>
        {sec.has_header && (
          <Input
            lable="Section Title"
            className="form-control"
            value={sec.section_title}
            onChange={(e) =>
              updateSection(sec.temp_id, "section_title", e.target.value)
            }
          />
        )}
        <GridControl
          data={sec.gridSettings}
          onChange={(newGrid) =>
            updateSection(sec.temp_id, "gridSettings", newGrid)
          }
          label="Section Width"
        />
      </div>
    );
  }
  if (selection.type === "field") {
    const sec = sections.find((s) => s.temp_id === selection.sectionId);
    const field = sec?.formFields.find((f) => f.temp_id === selection.id);
    const masterType = fieldTypes.find(
      (t) => t.field_type_id === field?.field_type_id,
    );
    if (!field) return null;
    const isSubHeading = field.field_type_id === 13;
    const isTable = field.field_type_id === 11;
    const isButton = field.field_type_id === 15;

    return (
      <div className="d-flex flex-column gap-3">
        <h6 className="fw-bold text-primary">Field Settings</h6>

        <Input
          lable="Label"
          className="form-control"
          value={field.field_label}
          onChange={(e) =>
            updateField(
              sec.temp_id,
              field.temp_id,
              "field_label",
              e.target.value,
            )
          }
        />

        {field.field_type_id === 1 && (
          <Input
            lable="Secondary Label"
            className="form-control"
            value={field.secondary_label}
            onChange={(e) =>
              updateField(
                sec.temp_id,
                field.temp_id,
                "secondary_label",
                e.target.value,
              )
            }
          />
        )}

        <Input
          lable="DB Name"
          className="form-control bg-light"
          value={field.field_name}
          disabled={true}
        />

        {masterType?.supports_input_subtype === 1 && (
          <div>
            <label className="small">Input Type</label>
            <select
              className="form-select form-select-sm"
              value={field.input_sub_type_id}
              onChange={(e) =>
                updateField(
                  sec.temp_id,
                  field.temp_id,
                  "input_sub_type_id",
                  parseInt(e.target.value),
                )
              }
            >
              <option value="0">Select Subtype</option>
              {masterType.input_sub_types?.map((sub) => (
                <option
                  key={sub.input_sub_type_id}
                  value={sub.input_sub_type_id}
                >
                  {sub.input_sub_type_code}
                </option>
              ))}
            </select>
          </div>
        )}

        {!isSubHeading && !isTable && !isButton && (
          <>
            <div className="d-flex align-items-center">
              <Checkbox
                checked={field.is_required === 1}
                onChange={(e) =>
                  updateField(
                    sec.temp_id,
                    field.temp_id,
                    "is_required",
                    e.checked ? 1 : 0,
                  )
                }
              />
              <label className="ms-2 small">Is Required</label>
            </div>

            <div className="d-flex align-items-center">
              <Checkbox
                checked={field.is_field_disabled === 1}
                onChange={(e) =>
                  updateField(
                    sec.temp_id,
                    field.temp_id,
                    "is_field_disabled",
                    e.checked ? 1 : 0,
                  )
                }
              />
              <label className="ms-2 small">Is Disabled?</label>
            </div>
          </>
        )}

        <GridControl
          data={field.gridSettings}
          onChange={(newGrid) =>
            updateField(sec.temp_id, field.temp_id, "gridSettings", newGrid)
          }
          label="Field Width"
        />

        {!isSubHeading && !isTable && !isButton && (
          <DefaultValueControl
            field={field}
            updateField={(k, v) =>
              updateField(sec.temp_id, field.temp_id, k, v)
            }
            generalDropDownList={generalDropDownList}
          />
        )}

        {!isTable && !isButton && (
          <div className="border p-2 rounded bg-light mt-2">
            <div className="d-flex align-items-center mb-2">
              <Checkbox
                checked={field.iscustomtable === 1}
                onChange={(e) =>
                  updateField(
                    sec.temp_id,
                    field.temp_id,
                    "iscustomtable",
                    e.checked ? 1 : 0,
                  )
                }
              />
              <label className="ms-2 small">Is Custom Table Field?</label>
            </div>

            {field.iscustomtable === 1 && (
              <select
                className="form-select form-select-sm"
                value={field.parent_name || ""}
                onChange={(e) =>
                  updateField(
                    sec.temp_id,
                    field.temp_id,
                    "parent_name",
                    e.target.value,
                  )
                }
              >
                <option value="">Select Table</option>
                {allTables.map((tbl) => (
                  <option key={tbl.field_name} value={tbl.field_name}>
                    {tbl.field_label}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {isButton && (
          <div className="border p-2 rounded bg-light mt-2">
            <label className="small fw-bold">Target Table</label>
            <select
              className="form-select form-select-sm mt-1"
              value={field.parent_name || ""}
              onChange={(e) =>
                updateField(
                  sec.temp_id,
                  field.temp_id,
                  "parent_name",
                  e.target.value,
                )
              }
            >
              <option value="">Select Table to Add Row</option>
              {allTables.map((tbl) => (
                <option key={tbl.field_name} value={tbl.field_name}>
                  {tbl.field_label}
                </option>
              ))}
            </select>
          </div>
        )}

        {(field.field_type_id === 3 ||
          field.field_type_id === 4 ||
          field.field_type_id === 10) && (
          <>
            <div className="border p-2 rounded bg-light mt-2">
              <label className="small fw-bold">Master Data Source</label>
              <select
                className="form-select form-select-sm mt-1"
                value={field.table_linkage_id || 0}
                onChange={(e) =>
                  updateField(
                    sec.temp_id,
                    field.temp_id,
                    "table_linkage_id",
                    parseInt(e.target.value),
                  )
                }
              >
                <option value="0">Manual Options</option>
                {masterDropDownList.map((m) => (
                  <option key={m.Id} value={m.Id}>
                    {m.table_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="d-flex align-items-center mt-2 border p-2 rounded bg-light">
              <Checkbox
                checked={field.is_score === 1}
                onChange={(e) =>
                  updateField(
                    sec.temp_id,
                    field.temp_id,
                    "is_score",
                    e.checked ? 1 : 0,
                  )
                }
              />
              <label className="ms-2 small">Is Score?</label>
            </div>

            <OptionManager
              field={field}
              allDropdowns={allDropdowns}
              onUpdate={(key, val) =>
                updateField(sec.temp_id, field.temp_id, key, val)
              }
              isLinked={field.table_linkage_id > 0}
            />
          </>
        )}
      </div>
    );
  }
};

const DefaultValueControl = ({ field, updateField, generalDropDownList }) => {
  const typeId = field.field_type_id;

  const dynamicDefaultValueControl = (
    <div className="d-flex align-items-center border p-2 rounded bg-light mt-2">
       <Checkbox 
         checked={field.isapidefaultvalue === 1} 
         onChange={(e) => updateField('isapidefaultvalue', e.checked ? 1 : 0)} 
         inputId="isapidefaultvalue"
       />
       <label htmlFor="isapidefaultvalue" className="ms-2 small">Dynamic Default Value</label>
       
       {field.isapidefaultvalue === 1 && (
           <select 
             className="form-select form-select-sm mt-2"
             value={field.table_linkage_id || 0}
             onChange={(e) => updateField('table_linkage_id', parseInt(e.target.value))}
           >
              <option value="0">Select Source</option>
              {generalDropDownList.map(item => (
                  <option key={item.Id} value={item.Id}>{item.table_name}</option>
              ))}
           </select>
       )}
    </div>
  );

  // If using dynamic default, only show that control
  if (field.isapidefaultvalue === 1) {
    return dynamicDefaultValueControl;
  }

  // Otherwise, show standard controls + the checkbox to switch
  let standardControl = null;

  if (typeId === 5) {
    standardControl = (
      <div className="d-flex align-items-center border p-2 rounded bg-light">
        <Checkbox
          checked={field.field_default_value === "1"}
          onChange={(e) =>
            updateField("field_default_value", e.checked ? "1" : "0")
          }
        />
        <label className="ms-2 small">Selected by Default</label>
      </div>
    );
  } else if (typeId === 9 || typeId === 8) {
    const isTime = typeId === 8;
    const currentLabel = isTime ? "Current Time" : "Current Date";
    const constantVal = isTime ? "CURRENT_TIME" : "CURRENT_DATE";

    standardControl = (
      <div className="d-flex align-items-center border p-2 rounded bg-light">
        <Checkbox
          checked={field.field_default_value === constantVal}
          onChange={(e) =>
            updateField("field_default_value", e.checked ? constantVal : "")
          }
        />
        <label className="ms-2 small">Default to {currentLabel}</label>
      </div>
    );
  } else if (typeId === 3 || typeId === 4 || typeId === 10) {
    if (field.table_linkage_id > 0) standardControl = null;
    else {
      standardControl = (
        <div>
          <label className="small">Default Selected Option</label>
          <select
            className="form-select form-select-sm"
            value={field.field_default_value || ""}
            onChange={(e) => updateField("field_default_value", e.target.value)}
          >
            <option value="">-- None --</option>
            {field.options_json?.map((opt, i) => (
              <option key={i} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      );
    }
  } else {
    standardControl = (
      <Input
        lable="Default Text"
        className="form-control"
        value={field.field_default_value}
        onChange={(e) => updateField("field_default_value", e.target.value)}
      />
    );
  }

  return (
    <>
      {standardControl}
      {dynamicDefaultValueControl}
    </>
  );
};

const GridControl = ({ data, onChange, label }) => {
  const handleChange = (key, val) => {
    onChange({ ...data, [key]: parseInt(val) });
  };
  return (
    <div className="border p-2 rounded bg-light">
      <label className="small fw-bold mb-2">{label}</label>
      <div className="row g-2">
        {[
          { k: "xl", l: "XL" },
          { k: "md", l: "MD" },
          { k: "sm", l: "SM" },
          { k: "xs", l: "XS" },
        ].map((bp) => (
          <div className="col-6" key={bp.k}>
            <label className="small text-muted" style={{ fontSize: "10px" }}>
              {bp.l}
            </label>
            <select
              className="form-select form-select-sm"
              value={data[bp.k] || 12}
              onChange={(e) => handleChange(bp.k, e.target.value)}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
};

const OptionManager = ({ field, allDropdowns, onUpdate, isLinked }) => {
  const [viewJson, setViewJson] = useState(false);
  const [newOpt, setNewOpt] = useState({
    value: "",
    label: "",
    FilterById: "",
  });
  const parentCandidates = allDropdowns.filter(
    (f) => f.temp_id !== field.temp_id,
  );
  const selectedParent = parentCandidates.find(
    (f) => f.field_name === field.parent_name,
  );

  const handleAddOption = () => {
    if (!newOpt.value || !newOpt.label)
      return notify("Value and Label Required", "error");
    const updated = [...(field.options_json || []), newOpt];
    onUpdate("options_json", updated);
    setNewOpt({ ...newOpt, value: "", label: "" });
  };

  const handleDelete = (idx) => {
    const updated = field.options_json.filter((_, i) => i !== idx);
    onUpdate("options_json", updated);
  };

  return (
    <div className="border-top pt-2 mt-2">
      <h6 className="small fw-bold">Options</h6>
      <div className="mb-2">
        <div className="d-flex align-items-center mb-1">
          <Checkbox
            checked={field.is_child === 1}
            onChange={(e) => onUpdate("is_child", e.checked ? 1 : 0)}
          />
          <label className="ms-2 small">Is Child?</label>
        </div>
        {field.is_child === 1 && (
          <div className="bg-warning bg-opacity-10 p-2 rounded mb-2">
            <label className="small">Parent Field</label>
            <select
              className="form-select form-select-sm mb-2"
              value={field.parent_name}
              onChange={(e) => onUpdate("parent_name", e.target.value)}
            >
              <option value="">Select Parent</option>
              {parentCandidates.map((p) => (
                <option key={p.field_name} value={p.field_name}>
                  {p.field_label}
                </option>
              ))}
            </select>
            {selectedParent && (
              <div className="small text-muted">
                Filter Value:
                <select
                  className="form-select form-select-sm mt-1"
                  value={newOpt.FilterById}
                  onChange={(e) =>
                    setNewOpt({ ...newOpt, FilterById: e.target.value })
                  }
                >
                  <option value="">-- All --</option>
                  {selectedParent.options_json?.map((po) => (
                    <option key={po.value} value={po.value}>
                      {po.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}
      </div>
      {isLinked ? (
        <div className="alert alert-info small mt-2 p-2">
          Options are managed by Master Data Source
        </div>
      ) : (
        <>
          <div className="d-flex justify-content-between mb-2">
            <span className="small">Mode: {viewJson ? "JSON" : "UI"}</span>
            <Checkbox
              checked={viewJson}
              onChange={(e) => setViewJson(e.checked)}
            />
          </div>
          {viewJson ? (
            <textarea
              style={{ minHeight: "150px", minWidth: "300px" }}
              className=" form-control-sm font-monospace"
              rows="3"
              value={JSON.stringify(field.options_json, null, 2)}
              onChange={(e) => {
                try {
                  onUpdate("options_json", JSON.parse(e.target.value));
                } catch (err) {}
              }}
            ></textarea>
          ) : (
            <div>
              <div className="input-group input-group-sm mb-2">
                <input
                  className="form-control"
                  placeholder="Label"
                  value={newOpt.label}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNewOpt({ ...newOpt, label: val, value: val });
                  }}
                />
                <input
                  className="form-control bg-light"
                  placeholder="Value"
                  value={newOpt.value}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNewOpt({ ...newOpt, value: val });
                  }}
                />
                <button
                  className="btn btn-outline-primary"
                  onClick={handleAddOption}
                >
                  Add
                </button>
              </div>
              <div
                style={{ maxHeight: "150px", overflowY: "auto" }}
                className="border rounded"
              >
                <table className="table table-sm table-striped mb-0 small">
                  <thead>
                    <tr>
                      <th>Lbl</th>
                      <th>Val</th>
                      <th>Filt</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {field.options_json?.map((opt, idx) => (
                      <tr key={idx}>
                        <td>{opt.label}</td>
                        <td>{opt.value}</td>
                        <td>{opt.FilterById}</td>
                        <td>
                          <i
                            className="pi pi-trash text-danger pointer"
                            onClick={() => handleDelete(idx)}
                          ></i>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FormBuilder;