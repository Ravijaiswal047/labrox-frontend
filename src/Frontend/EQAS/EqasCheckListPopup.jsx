// import React from "react";
// import TableFilterDot from "../Components/TableFilterDot";
// import Heading from "../../components/UI/Heading";
// import CustomTable from "../../components/Table/CustomTable";

// const EqasCheckListPopup = () => {

//     c

//   return (
//     <>
//       <div className="eqas_checkList_main">
//         <div className="d-flex align-items-center justify-content-between flex-wrap">
//           <h1>Last Saved on : 22-Aug-2025 By : ITDOSE</h1>
//           <div style={{ gap: "10px" }} className="d-flex align-items-center">
//             <TableFilterDot color={"#f7a8b4"} title={"New"} />
//             <TableFilterDot color={"#8eef8e"} title={"Saved"} />
//           </div>
//         </div>
//         <div>
//             <Heading title={'PT material'}/>
          
//         </div>
//       </div>
//     </>
//   );
// };

// export default EqasCheckListPopup;

import React, { useEffect, useState } from "react";
import TableFilterDot from "../Components/TableFilterDot";
import Heading from "../../components/UI/Heading";
import "./Eqas.css";
import { axiosInstance } from "../../utils/axiosInstance";
import { apiUrls } from "../../utils/apiUrls";
import { notify } from "../../utils/utils";

// const initialChecklistData = [
//   {
//     section: "PT Material",
//     questions: [
//       {
//         id: 1,
//         text: "Was proficiency testing material received in the laboratory within an appropriate time after shipment?",
//         status: null
//       },
//       {
//         id: 2,
//         text: "Were proficiency testing material received at the appropriate temperature?",
//         status: null
//       },
//       {
//         id: 3,
//         text: "Were stability within limits?",
//         status: null
//       },
//       {
//         id: 4,
//         text: "Were your results graded in the appropriate peer group based on the method reported on the result form?",
//         status: null
//       }
//     ]
//   },
//   {
//     section: "Specimen Handling",
//     questions: [
//       {
//         id: 5,
//         text: "Were Survey specimens reconstituted as indicated in the Kit Instructions?",
//         status: null
//       },
//       {
//         id: 6,
//         text: "Were Survey specimens stored as indicated in the Kit instructions?",
//         status: null
//       },
//       {
//         id: 7,
//         text: "Were any special instructions provided in the Kit Instructions performed as indicated?",
//         status: null
//       },
//       {
//         id: 8,
//         text: "Were the correct tests performed on the correct vial of proficiency testing material?",
//         status: null
//       }
//     ]
//   },
//   {
//     section: "Procedure",
//     questions: [
//       {
//         id: 9,
//         text: "Was the written procedure followed?",
//         status: null
//       },
//       {
//         id: 10,
//         text: "Were the reagents prepared according to procedure?",
//         status: null
//       },
//       {
//         id: 11,
//         text: "Were the reagents within their open stability acceptable range?",
//         status: null
//       },
//       {
//         id: 12,
//         text: "Were Quality Control results acceptable and without bias?",
//         status: null
//       }
//     ]
//   }
// ];

const EqasCheckListPopup = ({type, testid}) => {
  const [checklist, setChecklist] = useState([]);

  // const handleAnswerChange = (sectionIndex, questionIndex, value) => {
  //   const updated = [...checklist];
  //   updated[sectionIndex].questions[questionIndex].status = value;
  //   setChecklist(updated);
  // };

  const handleAnswerChange = (sectionIndex, questionIndex, value) => {
  const updated = [...checklist];
  updated[sectionIndex].questions[questionIndex].answer = value;
  setChecklist(updated);
};

  const handleSave = () => {
    alert("Checklist saved! Check console for data.");
  };

  const groupQuestionsByHead = (data = []) => {
    const grouped = {};

    data.forEach(item => {
      const head = item.QuestionHead || "Others";

      if (!grouped[head]) {
        grouped[head] = [];
      }

      grouped[head].push({
        questionId: item.questionid,
        question: item.question,
        answerType: item.answertype,
        options: item.AnswerOption
          ? item.AnswerOption.split(",")
          : [],
        answer: item.SavedAnswer || ""
      });
    });

    return Object.keys(grouped).map(head => ({
      section: head,
      questions: grouped[head]
    }));
  };

  const bindQuestionAll = async () => {
      // dispatch(setLoading(true));
  
      const apiPayload = {
        type: type || "",
        qcType: "EQAS",
        savedId: testid?.toString() || "",
      }
  
      await axiosInstance
        .post(apiUrls.GetQuestionAll, apiPayload)
        .then((res) => {
          console.log("resxx", res?.data);
          if (res?.data?.success) {
            const apiData = res?.data?.message || [];
            const structuredData = groupQuestionsByHead(apiData);

            setChecklist(structuredData);
          } 
          else {
  
          }
  
        })
        .catch((err) => {
          notify(err?.data?.message, "error");
        })
        .finally(() => {
          // dispatch(setLoading(false));
        });
    }

    useEffect(()=>{
      bindQuestionAll();
    },[]);

    console.log("checklist",checklist);

  return (
    <div className="eqas_checkList_main">
      {/* Header */}
      <div className="eqas_header align-items-center">
        <h1>Last Saved on : 22-Aug-2025 By : ITDOSE</h1>
        <div className="eqas_status">
          <TableFilterDot color={"#f7a8b4"} title={"New"} />
          <TableFilterDot color={"#8eef8e"} title={"Saved"} />
        </div>
      </div>

      {/* Sections */}
      {/* {checklist.map((section, sIndex) => (
        <div key={sIndex} className="eqas_section">
          <Heading title={section.section} />

          <div className="eqas_questions">
            {section.questions.map((q, qIndex) => (
              <div className="eqas_question_row" key={q.id}>
                <div className="eqas_question_text">
                  {q.id}. {q.text}
                </div>
                <div className="eqas_radio_group">
                  {["Yes", "No", "NA"].map((option) => (
                    <label key={option} className="eqas_radio mb-0">
                      <input
                        type="radio"
                        name={`q-${q.id}`}
                        value={option}
                        checked={q.status === option}
                        onChange={() =>
                          handleAnswerChange(sIndex, qIndex, option)
                        }
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))} */}

      {checklist.map((section, sIndex) => (
  <div key={sIndex} className="eqas_section">
    <Heading title={section.section} />

    <div className="eqas_questions">
      {section.questions.map((q, qIndex) => (
        <div className="eqas_question_row" key={q.questionId}>
          <div className="eqas_question_text">
            {qIndex + 1}. {q.question}
          </div>

          {/* RADIO */}
          {q.answerType === "radio" && (
            <div className="eqas_radio_group">
              {q.options.map(option => (
                <label key={option} className="eqas_radio mb-0">
                  <input
                    type="radio"
                    name={`q-${q.questionId}`}
                    value={option}
                    checked={q.answer === option}
                    onChange={() =>
                      handleAnswerChange(sIndex, qIndex, option)
                    }
                  />
                  {option}
                </label>
              ))}
            </div>
          )}

          {/* CHECKBOX */}
          {q.answerType === "checkbox" && (
            <div className="eqas_radio_group">
              {q.options.map(option => (
                <label key={option} className="eqas_radio mb-0">
                  <input
                    type="checkbox"
                    checked={q.answer?.includes(option)}
                    onChange={(e) => {
                      const current = q.answer
                        ? q.answer.split(",")
                        : [];
                      const updated = e.target.checked
                        ? [...current, option]
                        : current.filter(v => v !== option);

                      handleAnswerChange(
                        sIndex,
                        qIndex,
                        updated.join(",")
                      );
                    }}
                  />
                  {option}
                </label>
              ))}
            </div>
          )}

          {/* SHORT ANSWER */}
          {q.answerType === "short answer" && (
            <input
              type="text"
              className="form-control eqas_input"
              value={q.answer}
              onChange={(e) =>
                handleAnswerChange(sIndex, qIndex, e.target.value)
              }
            />
          )}
        </div>
      ))}
    </div>
  </div>
))}

      {/* Save button */}
      <div style={{gap:'6px'}} className="eqas_footer d-flex justify-content-center flex-wrap">
        <button className="save_btn py-2" onClick={handleSave}>
          Save Checklist
        </button>
        <button className="save_btn py-2" onClick={handleSave}>
          Remove All CheckList
        </button>
        <button className="save_btn py-2" onClick={handleSave}>
          PDF Report
        </button>
      </div>
    </div>
  );
};

export default EqasCheckListPopup;

