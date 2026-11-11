import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Checkbox } from "primereact/checkbox";
import moment from "moment";
import Input from "../../components/formComponent/Input";
import ReactSelect from "../../components/formComponent/ReactSelect";
import DatePicker from "../../components/formComponent/DatePicker";
import TimePicker from "../../components/formComponent/TimePicker";
import Heading from "../../components/UI/Heading";
import { notify } from "../../utils/ustil2";
import {
  FormBuilderGetFormPreviewByFormId,
  FormBuilderGetFormSubmissionByPatient,
  FormBuilderSaveFormSubmission,
  FormBuilderGetOptionValue,
  FormBuilderGetPatientDefaultValue,
  FormBuilderPrintForm,
  FormBuilderSaveFormSendToEmail,
} from "../../NetworkServices/Form-builder";
import TextAreaInput from "../../components/formComponent/TextAreaInput";
import Tables from "../../components/UI/customTable";
import { useLocation } from "react-router-dom";
import { RedirectURL } from "../../NetworkServices/PDFURL";
import store from "../../store/store";
import { Tooltip } from "primereact/tooltip";
import SendEmailDoctor from "../../components/modalComponent/Utils/SendEmailDoctor";
import Modal from "../../components/ModalComponent/Modal";

const FormRenderer = ({
  formId,
  formLayoutProp,
  initialValues = {},
  isPreview = false,
  data,
}) => {
  ;
  const patientID = data?.patientID || data?.PatientID;
  const transactionID = data?.transactionID || data?.TransactionID;

  const location = useLocation();
  const { form_data } = location.state || {};

  const [layout, setLayout] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState([]);

  // Custom Table State: { "table_field_name": [ { col1: val, col2: val } ] }
  const [customTableRows, setCustomTableRows] = useState({});

  // Edit Mode State
  const [isUpdate, setIsUpdate] = useState(false);
  const [fieldRecordIds, setFieldRecordIds] = useState({});
  const [submission_id, setSubmissionId] = useState(0);

  //email

  const [emailModal, setEmailModal] = useState({
    isShow: false,
    component: null,
    size: null,
    Header: null,
  });

  const [emailSend, setEmailSend] = useState({});

  const [emailError, setEmailError] = useState("");

  const validateEmail = (value) => {
    const emailRegex =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!emailRegex.test(value)) {
      setEmailError("Please enter a valid email address");
    } else {
      setEmailError("");
    }
  };

  const emailHandleChange = (e) => {
    const { name, value } = e.target;
    if (name === "toEmailID") {
      setEmailSend((prev) => ({
        ...prev,
        [name]: value,
      }));
      validateEmail(value);
    } else {
      setEmailSend((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSendEmail = async () => {
    try {
      ;
      const payload = {
        patientID: emailSend?.data?.patient_id,
        submission_id: emailSend?.data?.id,
        FormId: emailSend?.data?.form_id,
        ToEmailID: emailSend?.toEmailID,
        EmailSubject: emailSend?.emailSubject,
      };
      const res = await FormBuilderSaveFormSendToEmail(payload);
      if (res?.success) {
        notify(res?.message, "success");
      } else {
        notify(res?.message, "error");
      }
    } catch (error) {}
  };

  const handleOpenEmailModal = (ele) => {
    
    setEmailModal({
      isShow: true,
    });
    setEmailSend({
      toEmailID: data?.Email,
      emailSubject: `${layout?.formDetial?.form_display_name} - ${data?.DName}`,
      emailBody: `Dear ${data?.Pname}, \n\n Your ${layout?.formDetial?.form_display_name} is available at the link below: \n\n A copy may also be attached for your records.`,
      data: ele,
    });
  };

  const fetchForm = async () => {
    try {
      setLoading(true);
      const res = await FormBuilderGetFormPreviewByFormId(formId);
      if (res.success) {
        setLayout(res.data);
      } else {
        notify(res.message || "Failed to load form", "error");
      }
    } catch (error) {
      console.error(error);
      notify("Error fetching form data", "error");
    } finally {
      setLoading(false);
    }
  };

  const getTableData = async () => {
    // const patientID = data?.patientID || data?.PatientID;
    // const transactionID = data?.transactionID || data?.TransactionID;
    if (!patientID && !transactionID && !formId) return;
    try {
      const res = await FormBuilderGetFormSubmissionByPatient(
        formId,
        patientID,
        transactionID,
      );
      if (res.success) {
        setTableData(res.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // --- 1. FETCH DATA ---
  useEffect(() => {
    if (formLayoutProp || form_data) {
      setLayout(formLayoutProp ? formLayoutProp : form_data);
      return;
    }

    if (!isPreview) {
      fetchForm();
      getTableData();
    }
  }, [formId, formLayoutProp, form_data]);

  // --- 2. INITIALIZATION (Modified for Dynamic Defaults) ---
  useEffect(() => {
    if (layout?.formSections && !isUpdate) {
      const initializeForm = async () => {
        const initialData = { ...initialValues };
        const dynamicFieldsToFetch = [];

        // 1. Iterate fields to set Static Defaults OR Queue Dynamic Defaults
        layout.formSections.forEach((section) => {
          section.formFields.forEach((field) => {
            // Skip if already has value (passed from props)
            if (initialData[field.field_name] !== undefined) return;

            const defVal = field.field_default_value;

            // Check for Dynamic API Default Value
            if (field.isapidefaultvalue === 1 && field.table_linkage_id > 0) {
              dynamicFieldsToFetch.push({
                fieldName: field.field_name,
                linkageId: field.table_linkage_id,
                fieldType: field.field_type_id,
              });
            } else {
              // --- EXISTING STATIC DEFAULT LOGIC ---
              if (defVal === "CURRENT_DATE") {
                initialData[field.field_name] = new Date();
              } else if (defVal === "CURRENT_TIME") {
                initialData[field.field_name] = new Date();
              } else if (field.field_type_id === 5) {
                initialData[field.field_name] = defVal === "1";
              } else if (
                (field.field_type_id === 3 || field.field_type_id === 4) &&
                defVal
              ) {
                const match = field.options_json?.find(
                  (opt) => String(opt.value) === String(defVal),
                );
                initialData[field.field_name] = match
                  ? { label: match.label, value: match.value }
                  : null;
              } else {
                initialData[field.field_name] = defVal || "";
              }
            }
          });
        });

        // 2. Fetch Dynamic Defaults if any
        if (dynamicFieldsToFetch.length > 0 && patientID && transactionID) {
          const promises = dynamicFieldsToFetch.map((item) =>
            FormBuilderGetPatientDefaultValue(
              item.linkageId,
              patientID,
              transactionID,
            )
              .then((res) => ({ ...item, result: res }))
              .catch((err) => ({ ...item, result: null })),
          );

          const results = await Promise.all(promises);

          results.forEach((resItem) => {
            if (resItem.result?.success && resItem.result?.data?.length > 0) {
              const apiItem = resItem.result.data[0]; // Use first item
              const apiValue = apiItem.value;
              const apiLabel = apiItem.label;

              // Format value based on Field Type
              if (resItem.fieldType === 9) {
                // Date
                initialData[resItem.fieldName] = moment(apiValue).toDate();
              } else if (resItem.fieldType === 8) {
                // Time
                // Assuming API returns HH:mm or full ISO string
                initialData[resItem.fieldName] = moment(apiValue, [
                  "HH:mm",
                  moment.ISO_8601,
                ]).toDate();
              } else if (resItem.fieldType === 3 || resItem.fieldType === 4) {
                // Dropdown
                initialData[resItem.fieldName] = {
                  label: apiLabel,
                  value: apiValue,
                };
              } else if (resItem.fieldType === 5) {
                // Checkbox
                initialData[resItem.fieldName] =
                  apiValue === "1" || apiValue === true || apiValue === "true";
              } else {
                initialData[resItem.fieldName] = apiValue;
              }
            }
          });
        }

        setFormData(initialData);
      };

      initializeForm();
    }
  }, [layout, isUpdate, data]); // Added 'data' dependency for patientID

  // --- 3. DYNAMIC TABLE DATA GENERATION (Tabular View) ---
  const tabularViewData = useMemo(() => {
    if (!layout || !tableData || layout.formDetial?.isTabularView !== 1)
      return null;

    const columns = [
      { name: "S.No", width: "50px" },
      { name: "Date", width: "100px" },
    ];

    const fieldMapping = [];

    layout.formSections.forEach((section) => {
      section.formFields.forEach((field) => {
        if (
          field.field_type_id !== 13 &&
          field.field_type_id !== 12 &&
          field.field_type_id !== 11 &&
          field.field_type_id !== 15
        ) {
          columns.push({
            name: field.field_label,
            width: "150px",
          });
          fieldMapping.push({ id: field.field_id, label: field.field_label });
        }
      });
    });

    const rows = tableData.map((submission, index) => {
      const rowData = {
        "S.No": index + 1,
        Date: moment(submission.submitted_at).format("DD-MM-YYYY"),
      };

      fieldMapping.forEach((col) => {
        const matchedValue = submission.field_values.find(
          (v) => v.field_id === col.id,
        );
        rowData[col.label] = matchedValue
          ? matchedValue.field_text || matchedValue.field_value
          : "-";
      });

      return rowData;
    });

    return { columns, rows };
  }, [layout, tableData]);

  const handleEdit = (rowData) => {
    setIsUpdate(true);
    const newFormData = {};
    const newRecordIds = {};
    const newCustomTables = {};

    setSubmissionId(rowData.id);

    rowData.field_values.forEach((item) => {
      let fieldDef = null;
      layout.formSections.some((sec) => {
        const found = sec.formFields.find((f) => f.field_id === item.field_id);
        if (found) {
          fieldDef = found;
          return true;
        }
        return false;
      });

      if (fieldDef) {
        newRecordIds[fieldDef.field_id] = item.id;

        if (fieldDef.field_type_id === 11) {
          // Custom Table
          try {
            newCustomTables[fieldDef.field_name] = JSON.parse(
              item.field_value || "[]",
            );
          } catch (e) {
            newCustomTables[fieldDef.field_name] = [];
          }
        } else if (fieldDef.field_type_id === 9 && item.field_value) {
          newFormData[fieldDef.field_name] = moment(item.field_value).toDate();
        } else if (fieldDef.field_type_id === 8 && item.field_value) {
          newFormData[fieldDef.field_name] = moment(
            item.field_value,
            "HH:mm",
          ).toDate();
        } else if (fieldDef.field_type_id === 5) {
          newFormData[fieldDef.field_name] = item.field_value === "1";
        } else if (
          fieldDef.field_type_id === 3 ||
          fieldDef.field_type_id === 4
        ) {
          newFormData[fieldDef.field_name] = {
            label: item.field_text,
            value: item.field_value,
          };
        } else {
          newFormData[fieldDef.field_name] = item.field_value;
        }
      }
    });

    setFormData(newFormData);
    setCustomTableRows(newCustomTables);
    setFieldRecordIds(newRecordIds);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrint = async (item) => {
    try {
      const payload = {
        form_id: item?.form_id,
        SubmissionID: item?.id,
      };
      ;
      const res = await FormBuilderPrintForm(payload);
      if (res?.success) {
        RedirectURL(res?.data);
      } else {
        notify(res.message, "error");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, selectedOption) => {
    setFormData((prev) => ({ ...prev, [name]: selectedOption }));
  };

  const handleDateAndTimeChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name, checked) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  // --- CUSTOM TABLE: ADD ROW ---
  const handleAddTableRow = (targetTableName, inputFields) => {
    const newRow = {};
    let isValid = false;

    inputFields.forEach((field) => {
      const val = formData[field.field_name];

      if (val) {
        isValid = true;
        if (field.field_type_id === 3 || field.field_type_id === 4)
          newRow[field.field_name] = val.label;
        else if (field.field_type_id === 9)
          newRow[field.field_name] = moment(val).format("DD-MM-YYYY");
        else if (field.field_type_id === 8)
          newRow[field.field_name] = moment(val).format("HH:mm");
        else newRow[field.field_name] = val;
      } else {
        newRow[field.field_name] = "";
      }
    });

    if (!isValid) return notify("Please fill at least one field", "error");

    setCustomTableRows((prev) => ({
      ...prev,
      [targetTableName]: [...(prev[targetTableName] || []), newRow],
    }));

    const resetData = { ...formData };
    inputFields.forEach((field) => {
      resetData[field.field_name] = "";
    });
    setFormData(resetData);
  };

  const handleDeleteTableRow = (tableName, index) => {
    setCustomTableRows((prev) => ({
      ...prev,
      [tableName]: prev[tableName].filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    const patientID = data?.patientID || data?.PatientID;
    const transactionID = data?.transactionID || data?.TransactionID;
    if (!layout) return;

    const fieldValues = [];

    layout.formSections.forEach((section) => {
      section.formFields.forEach((field) => {
        if (
          field.field_type_id === 13 ||
          field.field_type_id === 12 ||
          field.field_type_id === 15
        )
          return;

        let fieldValue = "";
        let fieldText = "";

        if (field.field_type_id === 11) {
          const rows = customTableRows[field.field_name] || [];
          fieldValue = JSON.stringify(rows);
          fieldText = "Table Data";
        } else {
          const val = formData[field.field_name];
          if (field.field_type_id === 9 && val) {
            fieldValue = moment(val).format("YYYY-MM-DD");
            fieldText = fieldValue;
          } else if (field.field_type_id === 8 && val) {
            fieldValue = moment(val).format("HH:mm");
            fieldText = fieldValue;
          } else if (
            (field.field_type_id === 3 || field.field_type_id === 4) &&
            val
          ) {
            fieldValue = val.value;
            fieldText = val.label;
          } else if (field.field_type_id === 5) {
            fieldValue = val ? "1" : "0";
            fieldText = val ? "Yes" : "No";
          } else {
            fieldValue = val || "";
            fieldText = val || "";
          }
        }

        const valueObj = {
          field_id: field.field_id,
          field_value: String(fieldValue),
          field_text: String(fieldText),
        };

        if (isUpdate && fieldRecordIds[field.field_id]) {
          valueObj.id = fieldRecordIds[field.field_id];
        }

        fieldValues.push(valueObj);
      });
    });

    const payload = {
      form_id: layout.formDetial.form_id,
      patient_id: patientID,
      transaction_id: transactionID,
      field_values: fieldValues,
      submission_id: isUpdate ? submission_id : 0,
    };

    const response = await FormBuilderSaveFormSubmission(payload);
    if (response?.success) {
      fetchForm();
      getTableData();
      setIsUpdate(false);
      setFieldRecordIds({});
      setCustomTableRows({});
      notify(response?.message, "success");
    } else {
      notify(response?.message, "error");
    }
  };

  if (loading) return <div className="text-center p-4">Loading Form...</div>;
  if (!layout || !layout.formSections)
    return <div className="text-center p-4 text-muted">No Form Data Found</div>;

  return (
    <div className={"card"}>
      {emailModal.isShow && (
        <Modal
          visible={emailModal.isShow}
          Header={"Send report Via Email"}
          modalWidth={"50vw"}
          setVisible={() => setEmailModal(false)}
          handleAPI={handleSendEmail}
        >
          {/* {emailModal.component} */}
          <SendEmailDoctor
            emailHandleChange={emailHandleChange}
            emailSend={emailSend}
            setEmailSend={setEmailSend}
            error={emailError}
            Details={emailModal?.bodyData}
          />
        </Modal>
      )}
      {layout.formDetial?.form_display_name && (
        <Heading
          title={layout.formDetial.form_display_name}
          isBreadcrumb={false}
          secondTitle={
            !isPreview &&
            !form_data && (
              <>
               
                <div className="text-end">
                  <button className="btn btn-success" onClick={handleSubmit}>
                    {isUpdate ? "Update Form" : "Save Form"}
                  </button>
                </div>
              </>
            )
          }
        />
      )}

      <div className="row">
        {layout.formSections.map((section) => (
          <div
            key={section.section_id || Math.random()}
            className={`${section.section_css || "col-12"} mb-3`}
          >
            <div className="h-100 border-0">
              {section.section_title && (
                <Heading title={section.section_title} isBreadcrumb={false} />
              )}
              <div className="p-2">
                <div className="row">
                  {section.formFields?.map((field) => (
                    <div
                      key={field.field_id}
                      className={`${field.field_css || "col-12"} mb-2`}
                    >
                      <RenderSingleField
                        field={field}
                        formData={formData}
                        value={formData[field.field_name]}
                        handleInputChange={handleInputChange}
                        handleSelectChange={handleSelectChange}
                        handleDateAndTimeChange={handleDateAndTimeChange}
                        handleCheckboxChange={handleCheckboxChange}
                        allFields={section.formFields}
                        isPreview={isPreview}
                        allSectionFields={layout.formSections.flatMap(
                          (s) => s.formFields,
                        )}
                        customTableRows={customTableRows}
                        onAddRow={handleAddTableRow}
                        onDeleteRow={handleDeleteTableRow}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {tableData?.length > 0 && (
        <div className="p-2">
          <Heading title="Submission History" isBreadcrumb={false} />
          <Tables
            thead={[
              { name: "S.No", width: "1%" },
              { name: "Patient ID", width: "1%" },
              { name: "Submitted Date", width: "5%" },
              { name: "Submitted Time", width: "5%" },
              { name: "Transaction ID", width: "5%" },
              { name: "Action", width: "1%" },
              { name: "Print", width: "2%" },
            ]}
            tbody={tableData?.map((ele, index) => ({
              "S.No": index + 1,
              "Patient ID": ele?.patient_id,
              "Submitted Date": moment(ele?.submitted_at).format("DD-MM-YYYY"),
              "Submitted Time": moment(ele?.submitted_at).format("hh:mm A"),
              "Transaction ID": ele?.transaction_id,
              Action: (
                <i
                  className="fa fa-edit text-primary cursor-pointer"
                  style={{ cursor: "pointer" }}
                  onClick={() => handleEdit(ele)}
                  title="Edit Submission"
                ></i>
              ),
              print: (
                <div className="d-flex align-items-center">
                  <span
                    onClick={() => {
                      handleOpenEmailModal(ele);
                    }}
                    className="mr-2"
                  >
                    <i
                      className="pi pi-envelope text-icon-size"
                      data-pr-tooltip="Send Mail"
                      data-pr-position="top"
                      id="SendMail"
                      style={{ color: "#e43d12" }}
                    ></i>
                    <Tooltip target="#SendMail" />
                  </span>

                  <i
                    class="fa fa-print my-1"
                    aria-hidden="true"
                    style={{ cursor: "pointer" }}
                    title="Print"
                    onClick={() => {
                      handlePrint(ele);
                    }}
                  ></i>
                </div>
              ),
            }))}
          />
        </div>
      )}

      {tabularViewData && layout.formDetial?.isTabularView === 1 && (
        <div className="p-2 mt-4">
          <Heading title="Detailed Tabular View" isBreadcrumb={false} />
          <div style={{ overflowX: "auto" }}>
            <Tables
              thead={tabularViewData.columns}
              tbody={tabularViewData.rows}
              tableHeight={"scrollView"}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const RenderSingleField = ({
  field,
  formData,
  value,
  handleInputChange,
  handleSelectChange,
  handleDateAndTimeChange,
  handleCheckboxChange,
  allFields,
  isPreview,
  // Custom Table Props
  allSectionFields,
  customTableRows,
  onAddRow,
  onDeleteRow,
}) => {
  const [fetchedOptions, setFetchedOptions] = useState([]);

  useEffect(() => {
    if (field.table_linkage_id > 0 && !isPreview) {
      const fetchOptions = async () => {
        try {
          const res = await FormBuilderGetOptionValue(field.table_linkage_id);
          if (res?.data?.length > 0) {
            setFetchedOptions(res.data || []);
          }
        } catch (error) {
          console.error("Error fetching master options", error);
        }
      };
      fetchOptions();
    }
  }, [field.table_linkage_id]);

  const getOptions = useCallback(() => {
    let options =
      field.table_linkage_id > 0 ? fetchedOptions : field.options_json || [];

    if (!Array.isArray(options)) return [];

    if (field.is_child === 1 && field.parent_name) {
      const parentData = formData[field.parent_name];
      const parentValue =
        parentData?.value !== undefined ? parentData.value : parentData;

      if (!parentValue) return [];

      options = options.filter((opt) => {
        const filterVal =
          opt.filterById !== undefined ? opt.filterById : opt.FilterById;
        return String(filterVal) === String(parentValue);
      });
    }

    return options.map((opt) => ({
      label: opt.label || opt.name || opt.Option,
      value: opt.value || opt.id || opt.ID,
    }));
  }, [field, formData, fetchedOptions]);

  const commonProps = {
    lable: field.field_label,
    name: field.field_name,
    respclass: "w-100",
    placeholder: " ",
    value: value !== undefined ? value : "",
    disabled: field.is_field_disabled === 1,
    placeholderLabel: field?.secondary_label,
  };

  const typeId = parseInt(field.field_type_id);

  // --- CALCULATION LOGIC ---
  const totalScore = (allFields || [])
    .filter((f) => f.is_score === 1)
    .reduce((acc, f) => {
      const val = formData[f.field_name];
      let score = 0;
      if (val && typeof val === "object" && val.value) {
        score = parseFloat(val.value);
      } else if (val) {
        score = parseFloat(val);
      }
      return acc + (isNaN(score) ? 0 : score);
    }, 0);

  switch (typeId) {
    case 1:
      let htmlType = "text";
      if (field.input_sub_type_id === 4 || field.input_sub_type_id === 5)
        htmlType = "number";
      if (field.input_sub_type_id === 6) htmlType = "email";
      if (field.input_sub_type_id === 7) htmlType = "password";
      return (
        <Input
          type={htmlType}
          className="form-control"
          onChange={handleInputChange}
          {...commonProps}
        />
      );

    case 2:
      return (
        <div className="form-group w-100">
          <TextAreaInput
            lable={field.field_label}
            name={field.field_name}
            rows="1"
            value={value || ""}
            onChange={handleInputChange}
            disabled={commonProps.disabled}
          />
        </div>
      );

    case 3:
    case 4:
      return (
        <div className="d-flex align-items-center">
          <div className="flex-grow-1">
            <ReactSelect
              placeholderName={field.field_label}
              searchable={true}
              dynamicOptions={getOptions()}
              handleChange={handleSelectChange}
              value={value?.value}
              name={field.field_name}
              respclass="w-100"
              isDisabled={commonProps.disabled}
            />
          </div>
          {field?.is_score === 1 && value?.value && (
            <div
              className="mx-2"
              style={{ position: "relative", minWidth: "50px" }}
            >
              <label
                className="fw-bold small mb-0"
                style={{
                  position: "absolute",
                  top: "-4px",
                  left: "24px",
                  transform: "translateX(-50%)",
                  fontSize: "10px",
                }}
              >
                Score
              </label>
              <span
                className="text-white d-flex align-items-center justify-content-center"
                style={{
                  backgroundColor: "#87eb44",
                  width: "50px",
                  height: "30px",
                  borderRadius: "5px",
                  fontWeight: "bold",
                }}
              >
                {value?.value || 0}
              </span>
            </div>
          )}
        </div>
      );

    case 5:
      return (
        <div className="d-flex align-items-center">
          <Checkbox
            inputId={field.field_name}
            checked={!!value}
            onChange={(e) => handleCheckboxChange(field.field_name, e.checked)}
            disabled={commonProps.disabled}
          />
          <label
            htmlFor={field.field_name}
            className="ms-2"
            style={{ cursor: "pointer" }}
          >
            {field.field_label}
          </label>
        </div>
      );

    case 8:
      let timeVal = null;
      if (value instanceof Date) timeVal = value;
      else if (typeof value === "string" && value.length > 0) {
        timeVal = moment(value, "HH:mm").toDate();
      }
      return (
        <TimePicker
          {...commonProps}
          value={timeVal}
          handleChange={handleDateAndTimeChange}
          className="custom-calendar"
          id={field.field_name}
        />
      );

    case 9:
      let dateVal = null;
      if (value instanceof Date) dateVal = value;
      else if (typeof value === "string" && value.length > 0) {
        dateVal = moment(value).toDate();
      }
      return (
        <DatePicker
          {...commonProps}
          value={dateVal}
          handleChange={handleDateAndTimeChange}
          className="custom-calendar"
          id={field.field_name}
        />
      );

    // --- CUSTOM TABLE ---
    case 11:
      const tableInputFields =
        allSectionFields?.filter(
          (f) => f.iscustomtable === 1 && f.parent_name === field.field_name,
        ) || [];
      const rows = customTableRows[field.field_name] || [];

      return (
        <div className="custom-table-container mt-2">
          <Heading title={field.field_label} />
          <div className="table-responsive">
            <table className="table table-bordered table-striped table-sm text-center">
              <thead className="bg-light">
                <tr>
                  <th style={{ width: "3%" }}>S.No</th>
                  {tableInputFields.map((f) => (
                    <th key={f.field_id}>{f.field_label}</th>
                  ))}
                  <th style={{ width: "5%" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr>
                    <td
                      colSpan={tableInputFields.length + 2}
                      className="text-muted"
                    >
                      No records added.
                    </td>
                  </tr>
                )}
                {rows.map((row, idx) => (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    {tableInputFields.map((f) => (
                      <td key={f.field_id}>{row[f.field_name]}</td>
                    ))}
                    <td>
                      <i
                        className="fa fa-trash text-danger cursor-pointer"
                        onClick={() => onDeleteRow(field.field_name, idx)}
                        title="Delete Row"
                      ></i>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );

    case 12:
      return (
        <>
          {totalScore > 0 ? (
            <div style={{ position: "relative" }}>
              <label
                className="fw-bold small mb-1"
                style={{ position: "absolute", top: "-4px", left: "10px" }}
              >
                {field.field_label}
              </label>
              <div
                className="text-white d-flex align-items-center justify-content-center shadow-sm"
                style={{
                  backgroundColor: "#EF5350",
                  width: "80px",
                  height: "30px",
                  borderRadius: "6px",
                  fontSize: "18px",
                  fontWeight: "bold",
                }}
              >
                {totalScore}
              </div>
            </div>
          ) : (
            ""
          )}
        </>
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

    // --- ADD ROW BUTTON ---
    case 15:
      const targetTable = field.parent_name;
      const inputFieldsForButton =
        allSectionFields?.filter(
          (f) => f.iscustomtable === 1 && f.parent_name === targetTable,
        ) || [];

      return (
        <button
          className="btn btn-primary btn-sm  "
          onClick={() => onAddRow(targetTable, inputFieldsForButton)}
          disabled={commonProps.disabled}
        >
          {field.field_label}
        </button>
      );

    default:
      return <div className="text-danger small">Unknown Type ID: {typeId}</div>;
  }
};

export default FormRenderer;
