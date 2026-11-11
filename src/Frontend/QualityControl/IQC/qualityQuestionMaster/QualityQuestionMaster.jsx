import React, { useEffect, useState } from "react";
import Accordion from "../../../../components/UI/Accordion";
import { useTranslation } from "react-i18next";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import Input from "../../../../components/formComponent/Input";
import { Button, Table } from "react-bootstrap";
import RadioInput from "../../../../components/formComponent/RadioInput";
import { PlusIcon, ViewMenu } from "../../../../components/SvgIcons";
import { FaTimes } from "react-icons/fa";
import CustomTable from "../../../../components/Table/CustomTable";
import Heading from "../../../../components/UI/Heading";
import QCFrameMenu from "../QCFrameMenu";
import { axiosInstance } from "../../../../utils/axiosInstance";
import { apiUrls } from "../../../../utils/apiUrls";
import { useDispatch } from "react-redux";
import { setLoading } from "../../../../store/reducers/loadingSlice/loadingSlice";
import Modal from "../../../../components/ModalComponent/Modal";
import AddQuestionHead from "./AddQuestionHead";
import { notify } from "../../../../utils/utils";
import {CustomButton} from "../../../../components/UI/CustomButton";
import { validateRequiredFields } from "../../../../utils/helpers";

const QualityQuestionMaster = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const initialState = {
    // QCType: "",
    // Type: "",
    QuestionHead: "",
    QuestionHeadId: "",
    Question: "",
    AnswerType: "0",
    rca: 0,                     
    correctiveAction: 0,        
    preventiveAction: 0,        
    ilc: 0,                     
    eqas: 0,                    
    qc: 0,                      
    cap: 0,
    questionID: "",
    answerOption: "",
  };

  const [payload, setPayload] = useState(initialState);
  const [showMore, setShowMore] = useState(false);
  const [handleModelData, setHandleModelData] = useState({});
  const [tableData, setTableData] = useState([]);
  const [modalData, setModalData] = useState({});
  const [questionHeadAllList, setQuestionHeadAllList] = useState([]);
  const [isUpdate, setIsUpdate] = useState(false);
  const [errors, setErrors] = useState({});
  const [dropdownlist, setDropdownlist] = useState({
    questionHead: [],
  });
  
  const handleSelectChange = (name, value) => {
    if (name === "AnswerType") {
      setPayload((prev) => ({
        ...prev,
        [name]: value?.value,
        answerOption: "",
      }));
    } else {
      setPayload((prev) => ({
        ...prev,
        [name]: value?.label,
        QuestionHeadId: value?.value,
      }));
    }
  };
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPayload((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? "1" : "0") : value,
    }));
  };

  const handleModel = (label, width, type, isOpen, Component, extrabutton) => {
    setHandleModelData({
      label,
      width,
      type,
      isOpen,
      Component,
      extrabutton: extrabutton ? extrabutton : <></>,
    });
  };

  const setIsOpen = () => {
    setHandleModelData((val) => ({ ...val, isOpen: false }));
    getQuestionHead();
    getQuestionAll();
  };

  const handleReset = () => {
    setPayload(initialState);
    setIsUpdate(false);
  };

  const handleChangeModel = (data) => {
    setModalData(data);
  };

  const AnswerTypeOptions = [
    { value: "0", label: "Select Answer Type" },
    { value: "radio", label: "Radio Button" },
    { value: "checkbox", label: "Check Box" },
    { value: "text", label: "Short Answer" },
  ];

  const [rows, setRows] = useState([{ IsActive: "0", Order: "" }]);

  const handleChanges = (index, e) => {
    const { name, value, type, checked } = e.target;
    const newRows = [...rows];
    newRows[index][name] =
      type === "radio" || type === "checkbox" ? (checked ? "1" : "0") : value;

    setRows(newRows);

    const updatedOptions = newRows
      .map((r) => r.Order)
      .filter(Boolean)
      .join(",");
    setPayload((prev) => ({ ...prev, answerOption: updatedOptions }));
  };

  const handleAdd = () => {
    setRows([...rows, { IsActive: "0", Order: "" }]);
  };

  const handleClose = (index) => {
    const newRows = rows.filter((_, i) => i !== index);

    setRows(newRows.length > 0 ? newRows : [{ IsActive: "0", Order: "" }]);

    const updatedOptions = newRows
      .map((r) => r.Order)
      .filter(Boolean)
      .join(",");
    setPayload((prev) => ({ ...prev, answerOption: updatedOptions }));
  };

  const columns = [
    { header: "S.No.", field: "sno", width: "5%" },
    { header: "QC Type", field: "qcType", width: "10%" },
    { header: "Type", field: "type", width: "15%" },
    { header: "Question", field: "question", width: "30%" },
    { header: "Answer", field: "answer", width: "10%" },
    { header: "Entry Date", field: "entryDate", width: "10%" },
    { header: "Entry By", field: "entryBy", width: "10%" },
    { header: "Action", field: "editAction", width: "5%" },
    { header: "Delete", field: "delete", width: "5%" },
  ];

  const formatQuestionMasterData = (apiData) => {
    const formatted = [];
    let currentHead = null;
    const typeMapping = {
        "Rca": "RCA",
        "CorrectiveAction": "Corrective Action",
        "PreventiveAction": "Preventive Action"
    };
    console.log("api data",apiData);
    apiData.forEach((item) => {
      // Determine Type
      const typeKeys = ["Rca", "CorrectiveAction", "PreventiveAction"].filter(
            (key) => item[key] === 1
        );
      console.log("typeKey",typeKeys);
      const typeValue = typeKeys.length > 0 
            ? typeKeys.map(key => typeMapping[key]).join(", ") 
            : "N/A";

      // Determine QC Type(s)
      const qcKeys = ["Ilc", "Eqas", "Qc", "Cap"].filter(
        (key) => item[key] === 1,
      );
      const qcValue = qcKeys.join(", ") || "N/A";

      // Insert QuestionHead row (highlighted)
      if (item.QuestionHead !== currentHead) {
        formatted.push({
          isHeadRow: true,
          question: item.QuestionHead,
          type: "",
          qcType: "",
          answer: "",
          entryDate: "",
          entryBy: "",
        });
        currentHead = item.QuestionHead;
      }

      // Insert Question row
      formatted.push({
        sno: formatted.length + 1,
        question: item.Question,
        type: typeValue,
        qcType: qcValue,
        answerType: item.AnswerType,
        answerOptions: item.AnswerOption ? item.AnswerOption.split(",") : [],
        entryDate: item.EntryDate,
        entryBy: item.CreatedByName,

        // Add these so edit works properly
        QuestionHead: item.QuestionHead,
        QuestionHeadId: item.QuestionHeadID,
        raw: item, // keep raw item in case you need all fields later
      });
    });

    return formatted;
  };

  const renderAnswerCell = (item) => {
    if (!item.answerType) return null;

    if (item.answerType === "radio") {
      return item.answerOptions.map((opt, i) => (
        <label key={i} className="mr-2">
          <input type="radio" disabled /> {opt}
        </label>
      ));
    }

    if (item.answerType === "checkbox") {
      return item.answerOptions.map((opt, i) => (
        <label key={i} className="mr-2">
          <input type="checkbox" disabled /> {opt}
        </label>
      ));
    }

    if (item.answerType === "text") {
      return <span>{item.answerOptions || ""}</span>;
    }

    return null;
  };

  const handleEdit = (row) => {
    console.log("Editing row:", row);
    setIsUpdate(true);

    const raw = row.raw || {};

    // Find matching dropdown options for select components
    const selectedQuestionHead =
      dropdownlist?.questionHead?.find(
        (opt) => opt.label === row.QuestionHead,
      ) || null;

    // Build new payload synced with selected row
    const updatedPayload = {
      QCType: row.qcType || "",
      Type: row.type || "",
      QuestionHead: row.QuestionHead || "",
      QuestionHeadId: raw.QuestionHeadId || "",
      Question: row.question || "",
      AnswerType: row.answerType || "",
      answerOption: row.answerOptions?.length
        ? row.answerOptions.join(",")
        : "",
      questionID: raw.QuestionId || "",

      // Sync all flags from the raw record
      rca: raw.Rca?.toString() || "0",
      correctiveAction: raw.CorrectiveAction?.toString() || "0",
      preventiveAction: raw.PreventiveAction?.toString() || "0",
      ilc: raw.Ilc?.toString() || "0",
      eqas: raw.Eqas?.toString() || "0",
      qc: raw.Qc?.toString() || "0",
      cap: raw.Cap?.toString() || "0",
    };

    setPayload(updatedPayload);

    // Sync answer options table rows
    if (row.answerType === "radio" || row.answerType === "checkbox") {
      setRows(
        row.answerOptions?.map((opt) => ({
          IsActive: "0",
          Order: opt,
        })) || [{ IsActive: "0", Order: "" }],
      );
    } else if (row.answerType === "text") {
      // for short answer, no rows table — just payload?.answerOption
      setRows([]);
    } else {
      setRows([{ IsActive: "0", Order: "" }]);
    }
  };

  const handleDelete = async (row) => {
    console.log("Delete row", row);
    if (!row.raw?.QuestionId) return;

    const payload = {
      questionId: row.raw.QuestionId,
    };

    try {
      dispatch(setLoading(true));
      const response = await axiosInstance.post(apiUrls.DeleteQuestion, payload);
      console.log("Delete response:", response.data);
      if(response?.data?.success){
        getQuestionAll();
        handleReset();
        notify(response?.data?.message || "Delete Successfully","success",);
      }     
    } catch (error) {
      console.error(error);
      notify(
        error?.response?.data?.message || "Error deleting question",
        "error",
      );
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleUpdate = async () => {
    const apiPayload = [
      {
        questionID: payload?.questionID || "",
        questionHeadID: payload?.QuestionHeadId?.toString() || "",
        question: payload?.Question || "",
        answerType: payload?.AnswerType || "",
        answerOption:
          payload?.answerOption ||
          rows
            .map((r) => r.Order)
            .filter(Boolean)
            .join(","),
        rca: payload?.rca?.toString() || "0",
        correctiveAction: payload?.correctiveAction?.toString() || "0",
        preventiveAction: payload?.preventiveAction?.toString() || "0",
        ilc: payload?.ilc?.toString() || "0",
        eqas: payload?.eqas?.toString() || "0",
        qc: payload?.qc?.toString() || "0",
        cap: payload?.cap?.toString() || "0",
      },
    ];

    try {
      dispatch(setLoading(true));
      const response = await axiosInstance.post(apiUrls.UpdateQuestion, apiPayload);
      console.log("Update response:", response.data);
      if(response?.data?.success){
        getQuestionAll();
        handleReset();
      }     
    } catch (error) {
      console.error(error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleSave = async () => {
    
    const apiPayload = [
      {
        questionHeadID: payload?.QuestionHeadId || 0,
        question: payload?.Question || "",
        answerType: payload?.AnswerType || "",
        answerOption:
          payload?.answerOption ||
          rows
            .map((r) => r.Order)
            .filter(Boolean)
            .join(","), // combine answer options
        rca: payload?.rca?.toString() || "0",
        correctiveAction: payload?.correctiveAction?.toString() || "0",
        preventiveAction: payload?.preventiveAction?.toString() || "0",
        ilc: payload?.ilc?.toString() || "0",
        eqas: payload?.eqas?.toString() || "0",
        qc: payload?.qc?.toString() || "0",
        cap: payload?.cap?.toString() || "0",
      },
    ];

    try {
      dispatch(setLoading(true));
      const response = await axiosInstance.post(apiUrls.SaveQuestion, apiPayload);
      if (response?.data?.success === true) {
        notify(response?.data?.message, "success");
        getQuestionAll(); 
        handleReset();

      } else {
        notify("Error Saving the Question", "error");
        console.error("SaveQuestion failed:", response);
      }
    } catch (error) {
      console.error(error);
      // handle error notification
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Called APIS

  const getQuestionHead = async () => {
    dispatch(setLoading(true));

    await axiosInstance
      .get(apiUrls.BindQuestionHead)
      .then((res) => {
        console.log("res...Questionhead", res);
        const questionHeadList = res?.data?.data?.map((item) => ({
          value: item.Id,
          label: item.QuestionHead,
        }));

        setDropdownlist((prev) => ({
          ...prev,
          questionHead: questionHeadList,
        }));
        // setPayload((prev) => ({ ...prev, QuestionHead: questionHeadList?.[0]?.label, QuestionHeadId: questionHeadList?.[0]?.value }));
      })
      .catch((err) => {
        notify(err?.data?.message, "error");
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  };

  const getQuestionAll = async () => {
    dispatch(setLoading(true));

    await axiosInstance
      .post(apiUrls.BindQuestionAll)
      .then((res) => {
        console.log("res...QuestionAll", res);
        if (res?.data?.data) {
          // 1️⃣ Format the API data for table display
          const tableData = formatQuestionMasterData(res.data.data);

          // 2️⃣ Map it to include the rendered answer and row color
          let questionCounter = 0;

          const formattedData = tableData.map((item) => {
            if (!item.isHeadRow) questionCounter += 1;

            return {
              ...item,
              sno: item.isHeadRow ? "" : questionCounter,
              rowColor: item.isHeadRow ? "#e0f7fa" : "", // ← highlight color for Question Head
              answer: renderAnswerCell(item),
              editAction: item.isHeadRow ? (
                ""
              ) : (
                <span
                  style={{ cursor: "pointer", marginRight: "8px" }}
                  onClick={() => handleEdit(item)}
                >
                  <i
                    className="fa fa-edit"
                    style={{ cursor: "pointer", color: "#21218b" }}
                  />
                </span>
              ),
              // "Edit",
              delete: item.isHeadRow ? (
                ""
              ) : (
                <span
                  style={{ cursor: "pointer", color: "red" }}
                  onClick={() => handleDelete(item)}
                >
                  ❌
                </span>
              ),
            };
          });

          // 3️⃣ Set the formatted data into state
          setTableData(formattedData);
        }
      })
      .catch((err) => {
        notify(err?.data?.message, "error");
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  };

  useEffect(() => {
    getQuestionHead();
    getQuestionAll();
  }, []);

  useEffect(() => {
    if (!isUpdate) {
      if (payload?.AnswerType === "text") {
        setRows([]);
      } else if (
        payload?.AnswerType === "radio" ||
        payload?.AnswerType === "checkbox"
      ) {
        setRows([{ IsActive: "0", Order: "" }]);
      } else {
        setRows([]);
      }
      setPayload((prev) => ({ ...prev, answerOption: "" }));
    }
  }, [payload?.AnswerType, isUpdate]);
  console.log("payload?...", payload);
  console.log("tableData", tableData);
  console.log("errors",errors);

  return (
    <>
      {showMore && <QCFrameMenu />}
      <Heading
        name={"Quality Question Master"}
        isBreadcrumb={"true"}
        secondTitle={
          <>
            <label onClick={() => setShowMore((prev) => !prev)}>
              <ViewMenu />
            </label>
          </>
        }
      />
        <div className="row px-4 py-2 white-background">
          <label>QC Type:</label>
          <div className="col d-flex flex-wrap gap-3">
            {[
              { name: "qc", label: "QC" },
              { name: "eqas", label: "EQAS" },
              // { name: "ilc", label: "ILC" },
              // { name: "cap", label: "CAP" },
            ].map((item) => (
              <RadioInput
                key={item?.name}
                type="checkbox"
                label={item?.label}
                name={item?.name}
                checked={payload[item?.name] === 1 || payload[item?.name] === "1"}
                onChange={(e) => {
                  const isChecked = e.target.checked ? 1 : 0;
                  setPayload((prev) => ({ ...prev, [item?.name]: isChecked }));
                }}
              />
            ))}
          </div>
        </div>
        <div className="row px-4 py-2 white-background">
          <label>Type:</label>
          <div className="col d-flex flex-wrap gap-3">
            {[
              { name: "rca", label: "RCA" },
              { name: "correctiveAction", label: "Corrective Action" },
              { name: "preventiveAction", label: "Preventive Action" },
            ].map((item) => (
              <RadioInput
                key={item.name}
                type="checkbox"
                label={item.label}
                name={item.name}
                checked={payload[item.name] === 1 || payload[item.name] === "1"}
                onChange={(e) => {
                  const isChecked = e.target.checked ? 1 : 0;
                  setPayload((prev) => ({ ...prev, [item.name]: isChecked }));
                }}
              />
            ))}
          </div>
        </div>
        <div className="row p-2 white-background">
          <div className="col-xl-2 col-sm-4 col-md-6 co-12">
          <ReactSelect
            name="QuestionHead"
            id="QuestionHead"
            removeIsClearable={true}
            dynamicOptions={dropdownlist.questionHead}
            placeholderName="Question Head"
            label="Question Head"
            value={payload?.QuestionHead}
            onChange={handleSelectChange}
            // respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
            isShowBorder={true}
          />
          {payload?.QuestionHead === "" && (
                    <span className="error-message ">{errors?.QuestionHead}</span>
                  )}
          </div>
          <button
            className="d-flex align-items-center justify-content-center ml-2 rounded text-white border-0 p-1"
            style={{ height: "24px", width: "24px" }}
            onClick={() =>
              handleModel(
                "Add Question Head",
                "60vw",
                "AddQuestionHead",
                true,
                <AddQuestionHead tableData={questionHeadAllList} />,
              )
            }
          >
            <PlusIcon />
          </button>
            <div className="col-xl-2 col-sm-4 col-md-6 co-12">
          <Input
            type="text"
            placeholder=" "
            lable="Question"
            id="Question"
            name="Question"
            value={payload?.Question}
            onChange={handleChange}
            // respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />
           {payload?.Question === "" && (
                    <span className="error-message ">{errors?.Question}</span>
                  )}
          </div>
          <div className="col-xl-2 col-sm-4 col-md-6 co-12">
          <ReactSelect
            name="AnswerType"
            id="AnswerType"
            removeIsClearable={true}
            dynamicOptions={AnswerTypeOptions}
            placeholderName="Answer Type"
            value={payload?.AnswerType}
            onChange={handleSelectChange}
            // respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
            isShowBorder={true}
          />
          {payload?.AnswerType === "0" && (
                    <span className="error-message ">{errors?.AnswerType}</span>
                  )}
          </div>
          <div className="col-xl-2 col-sm-4 col-md-6 co-12">
            <Table className="table table-bordered">
              <tbody>
                {rows.map((row, index) => (
                  <tr key={index}>
                    {/* Show radio or checkbox based on selected AnswerType */}
                    {payload?.AnswerType !== "text" && (
                      <td style={{ width: "3%" }}>
                        {payload?.AnswerType === "radio" ? (
                          <input
                            type="radio"
                            
                            checked={row.IsActive === "1"}
                            
                          />
                        ) : (
                          <input
                            type="checkbox"
                            checked={row.IsActive === "1"}
                            
                          />
                        )}
                      </td>
                    )}

                    {/* Text input for answer text */}
                    <td>
                      <input
                        type="text"
                        placeholder="Answer Option"
                        name="Order"
                        value={row.Order}
                        onChange={(e) => handleChanges(index, e)}
                        className="form-control"
                      />
                    </td>

                    {/* Add button: show only for radio/checkbox */}
                    {payload?.AnswerType !== "text" && (
                      <td style={{ width: "5%", textAlign: "center" }}>
                        <button
                          className="d-flex align-items-center justify-content-center ml-2 rounded text-white border-0 p-1"
                          style={{ height: "24px", width: "24px" }}
                          type="button"
                          onClick={handleAdd}
                        >
                          <PlusIcon className="h-5 w-5" />
                        </button>
                      </td>
                    )}

                    {/* Close button */}
                    <td style={{ width: "5%", textAlign: "center" }}>
                      <button
                        className="d-flex align-items-center justify-content-center ml-2 rounded text-white border-0 p-1"
                          style={{ height: "24px", width: "24px" }}
                        type="button"
                        onClick={() => handleClose(index)}
                      >
                        <FaTimes />
                      </button>
                    </td>
                  </tr>
                ))}

                {/* Short Answer: only show text input without radio/checkbox column */}
                {payload?.AnswerType === "text" && rows.length === 0 && (
                  <tr>
                    <td colSpan={4}>
                      <input
                        type="text"
                        placeholder="Enter answer"
                        value={payload?.answerOption || ""}
                        onChange={(e) =>
                          setPayload((prev) => ({
                            ...prev,
                            answerOption: e.target.value,
                          }))
                        }
                        className="form-control"
                      />
                    </td>
                  </tr>
                )}
              </tbody>
              
            </Table>
            {payload?.AnswerType !== "0" && payload?.answerOption === "" && (
                    <span className="error-message ">{errors?.answerOption}</span>
                  )}
          </div>
        </div>
        <div className="row mb-2 white-background">
          <div className="col-sm-12 d-flex justify-content-end">
            {/* <Button
              className="rounded py-0 ml-2 mt-2"
              onClick={isUpdate ? handleUpdate : handleSave}
            >
              {isUpdate ? t("Update") : t("Save")}
            </Button> */}
            <CustomButton text={isUpdate ? t("Update") : t("Save")} icon="save" 
             onClick={isUpdate ? handleUpdate : handleSave} className="mx-2"
            />
            {/* <Button
              className="rounded py-0 ml-2 mt-2 bg-danger"
              onClick={handleReset}
            >
              Reset
            </Button> */}
            <CustomButton text={t("Reset")} icon="refresh" 
            className="mx-2"
             onClick={handleReset}
            />
          </div>
        </div>
      {/* </Accordion> */}
      <div className="card mt-2">
        <Heading
          title={t("Quality Question Master Detail")}
          // isBreadcrumb={true}
        />
        <div className="row">
          <div className="col-sm-12">
            <CustomTable
              columns={columns}
              data={tableData}
              onEdit={handleEdit}
            />
          </div>
        </div>
      </div>
      {handleModelData?.isOpen && (
        <Modal
          visible={handleModelData?.isOpen}
          setVisible={setIsOpen}
          modalWidth={handleModelData?.width}
          Header={t(handleModelData?.label)}
          buttons={handleModelData?.extrabutton}
          modalData={handleModelData?.modalData}
          setModalData={setModalData}
        >
          {handleModelData?.Component}
        </Modal>
      )}
    </>
  );
};

export default QualityQuestionMaster;
