import React, { useEffect, useState } from "react";
import { Button, Form } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { axiosInstance } from "../../../../utils/axiosInstance";
import { apiUrls } from "../../../../utils/apiUrls";
import { notify } from "../../../../utils/utils";
import { setLoading } from "../../../../store/reducers/loadingSlice/loadingSlice";
import CustomTable from "../../../../components/Table/CustomTable";
import { CustomButton } from "../../../../components/UI/CustomButton";

const AddChecklist = ({ type, itemId, onClose, qcType="QC" }) => {
  const dispatch = useDispatch();
  //   const [checklistItems, setChecklistItems] = useState([]);
  const [answers, setAnswers] = useState({});
  const [rawChecklist, setRawChecklist] = useState([]);

  const columns = [
    { header: "Sr.No", field: "sno", width: "5%" },
    { header: "Question", field: "question", width: "55%" },
    { header: "Answer", field: "answer", width: "40%" },
  ];

  const formatChecklistData = (apiData) => {
    const formatted = [];
    let currentHead = null;
    let sno = 0;

    apiData.forEach((item) => {
      if (item.QuestionHead !== currentHead) {
        formatted.push({
          isHead: true,
          QuestionHead: item.QuestionHead,
          sno: "",
          question: (
            <div
              style={{
                fontWeight: "bold",
                background: "#f1f8ff",
                padding: "6px",
              }}
            >
              {item.QuestionHead}
            </div>
          ),
          answer: "",
          rowColor: "#f1f8ff",
        });
        currentHead = item.QuestionHead;
        sno = 0;
      }

      sno++;
      formatted.push({
        id: item.questionid, // ✅ lowercase
        sno,
        question: item.question, // ✅ lowercase
        answer: renderAnswerCell(item), // ✅ based on answertype
      });
    });

    return formatted;
  };

  const removeChecklist = async () => {
    const payload = {
      type: type, // RCA / CorrectiveAction / PreventiveAction
      qcType: qcType || "QC", // always QC
      savedId: itemId.toString(),
    };

    dispatch(setLoading(true));
    try {
      const res = await axiosInstance.post(apiUrls.RemoveQuestionAnswer, payload);

      if (res?.data?.success) {
        notify("Checklist removed successfully!", "success");
        onClose && onClose();
      } else {
        notify(res?.data?.message || "Failed to remove checklist", "error");
      }
    } catch (err) {
      console.error(err);
      notify("Error removing checklist", "error");
    } finally {
      dispatch(setLoading(false));
    }
  };

  // ✅ Render input field based on type
  const renderAnswerCell = (item) => {
    if (!item.answertype) return null;

    if (item.answertype === "radio") {
      return (
        <div>
          {item.AnswerOption?.split(",").map((opt, i) => (
            <label key={i} className="mr-3">
              <input
                type="radio"
                name={`q_${item.questionid}`}
                value={opt}
                checked={answers[item.questionid] === opt}
                onChange={() =>
                  handleAnswerChange(item.questionid, opt, "radio")
                }
              />{" "}
              {opt}
            </label>
          ))}
        </div>
      );
    }

    if (item.answertype === "checkbox") {
      const selected = answers[item.questionid]
        ? answers[item.questionid].split(",")
        : [];
      return (
        <div>
          {item.AnswerOption?.split(",").map((opt, i) => (
            <label key={i} className="mr-3">
              <input
                type="checkbox"
                value={opt}
                checked={selected.includes(opt)}
                onChange={() =>
                  handleAnswerChange(item.questionid, opt, "checkbox")
                }
              />{" "}
              {opt}
            </label>
          ))}
        </div>
      );
    }

    if (item.answertype === "text") {
      return (
        <input
          type="text"
          className="form-control"
          value={answers[item.questionid] || ""}
          onChange={(e) =>
            handleAnswerChange(item.questionid, e.target.value, "text")
          }
        />
      );
    }

    return null;
  };

  // Fetch checklist items on mount
  const getChecklist = async () => {
    //   const payloadType = type.replace(/\s+/g, "");
    const searchPayload = {
      type: type,
      qcType: qcType || "QC",
      savedId: itemId.toString(),
    };
    dispatch(setLoading(true));
    try {
      const res = await axiosInstance.post(apiUrls.GetQuestionAll, searchPayload);
      console.log("Res...", res);
      if (res?.data?.success) {
        const apidata = res?.data?.message || [];
        setRawChecklist(apidata);

        // prefill answers
        const prefill = {};
        apidata.forEach((q) => {
          prefill[q.questionid] = q.SavedAnswer || "";
        });
        setAnswers(prefill);
      } else {
        notify("Failed to fetch checklist", "error");
      }
    } catch (err) {
      console.error(err);
      notify("Error fetching checklist", "error");
    } finally {
      dispatch(setLoading(false));
    }
  };

  const checklistItems = rawChecklist.reduce((acc, item, idx) => {
    if (idx === 0 || rawChecklist[idx - 1].QuestionHead !== item.QuestionHead) {
      acc.push({
        isHead: true,
        sno: "",
        question: (
          <div
            style={{
              fontWeight: "bold",
              background: "#f1f8ff",
              padding: "6px",
            }}
          >
            {item.QuestionHead}
          </div>
        ),
        answer: "",
        rowColor: "#f1f8ff",
      });
    }

    acc.push({
      id: item.questionid,
      sno: idx + 1,
      question: item.question,
      answer: renderAnswerCell(item), // ✅ now re-evaluates each render
    });

    return acc;
  }, []);

  const handleAnswerChange = (id, value, type) => {
    setAnswers((prev) => {
      if (type === "checkbox") {
        const current = prev[id] ? prev[id].split(",") : [];
        const updated = current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value];
        return { ...prev, [id]: updated.join(",") };
      }
      return { ...prev, [id]: value };
    });
  };

  console.log("items", checklistItems);
  console.log("answers", answers);

  useEffect(() => {
    getChecklist();
  }, []);

  const saveChecklist = async () => {
    // build payload
    const payload = rawChecklist
      .filter((item) => answers[item.questionid]) // only save answered ones
      .map((item) => ({
        questionID: item.questionid,
        question: item.question,
        answerType: item.answertype,
        answer: answers[item.questionid],
        type: type, // coming from props
        qcType: qcType || "QC", // constant
        savedID: itemId.toString(),
      }));

    if (payload.length === 0) {
      notify("No answers selected to save", "warning");
      return;
    }

    dispatch(setLoading(true));
    try {
      const res = await axiosInstance.post(apiUrls.SaveQuestionAnswer, payload);
      if (res?.data?.success) {
        notify("Checklist saved successfully!", "success");
        onClose && onClose();
      } else {
        notify(res?.data?.message || "Failed to save checklist", "error");
      }
    } catch (err) {
      console.error(err);
      notify("Error saving checklist", "error");
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="container-fluid">
      <h5>{`Checklist for ${type}`}</h5>
      <CustomTable
        columns={columns}
        data={checklistItems}
        scrollView="scrollY"
        tableHeight="tableHeight300"
      />
      <div className="d-flex justify-content-center mt-3">
        {/* <Button className="rounded py-0 mx-2 " onClick={saveChecklist}>
          Save
        </Button>
        <Button className="rounded py-0 mx-2" onClick={removeChecklist}>
          Remove CheckList
        </Button> */}
        <CustomButton text="Save" icon="save"className="mx-2 mb-1" onClick={saveChecklist} />
        <CustomButton text="Remove CheckList" icon="delete"className="mx-2 mb-1" onClick={removeChecklist} />
        {/* <Button className="rounded py-0 mx-2">Pdf Report</Button> */}
      </div>
    </div>
  );
};

export default AddChecklist;
