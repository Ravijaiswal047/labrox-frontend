import React, { useEffect, useState } from "react";
import { Button, Form } from "react-bootstrap";
import CustomTable from "../../../../components/Table/CustomTable";
import { useDispatch } from "react-redux";

import { setLoading } from "../../../../store/reducers/loadingSlice/loadingSlice";
import { notify } from "../../../../utils/utils";
import { axiosInstance } from "../../../../utils/axiosInstance";
import { apiUrls } from "../../../../utils/apiUrls";
import Input from "../../../../components/formComponent/Input";
import { CustomButton } from "../../../../components/UI/CustomButton";

const AddQuestionHead = () => {
  const dispatch = useDispatch();

  const [questionHead, setQuestionHead] = useState("");
  const [tableData, setTableData] = useState([]);
  const [isUpdate, setIsUpdate] = useState(false);
  const [questionHeadId, setQuestionHeadId] = useState(null);

  const columns = [
    { header: "Sr No", field: "srNo", width: "10%" },
    { header: "Question Head", field: "QuestionHead" },
    { header: "Entry Date", field: "EntryDate", width: "15%" },
    { header: "Entry Name", field: "CreatedByName", width: "15%" },
    { header: "Edit", field: "edit", width: "10%" },
  ];

  const handleEdit = (row) => {
    setQuestionHead(row.QuestionHead); // populate textfield
    setQuestionHeadId(row.Id); // store ID for update API
    setIsUpdate(true); // toggle Save → Update
  };

  // 🔹 Fetch QuestionHeadAll
  const getQuestionHeadAll = async () => {
    dispatch(setLoading(true));
    await axiosInstance
      .get(apiUrls.BindQuestionHeadAll)
      .then((res) => {
        const formatted =
          res?.data?.data?.map((item, index) => ({
            srNo: index + 1,
            Id: item.Id,
            QuestionHead: item.QuestionHead,
            EntryDate: item.EntryDate,
            CreatedByName: item.CreatedByName,
            edit: (
              <i
                className="fa fa-edit"
                style={{ cursor: "pointer", color: "#21218b" }}
              />
            ),
          })) || [];
        setTableData(formatted);
      })
      .catch((err) => {
        notify(err?.data?.message || "Error fetching Question Heads", "error");
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  };

  // 🔹 Save Question Head
  const handleSave = async () => {
    if (!questionHead?.trim()) {
      notify("Please enter a Question Head", "error");
      return;
    }

    const payload = { questionHeads: questionHead.trim() };
    dispatch(setLoading(true));

    await axiosInstance
      .post(apiUrls.SaveQuestionHead, payload)
      .then((res) => {
        notify(res?.data?.message || "Question Head saved successfully", "success");
        setQuestionHead(""); // reset input
        getQuestionHeadAll();
        //   refreshQuestionHeads && refreshQuestionHeads(); // reload parent data
      })
      .catch((err) => {
        notify(err?.data?.message || "Failed to save", "error");
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  };

  const handleUpdate = async () => {
    if (!questionHead?.trim()) {
      notify("Please enter a Question Head", "error");
      return;
    }

    const payload = {
      questionHeads: questionHead.trim(),
      questionHeadId: questionHeadId.toString(),
    };

    dispatch(setLoading(true));

    await axiosInstance
      .post(apiUrls.UpdateQuestionHead, payload)
      .then((res) => {
        console.log("Update res..",res);
        if(res?.data?.success){
          notify(res?.data?.message, "success");
          setQuestionHead("");
          setQuestionHeadId(null);
          setIsUpdate(false);
          getQuestionHeadAll();
        }       
        
        //   refreshQuestionHeads && refreshQuestionHeads(); // reload table
      })
      .catch((err) => {
        notify(err?.data?.message || "Failed to update", "error");
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  };

  useEffect(() => {
    getQuestionHeadAll();
  }, []);

  return (
    <div className="container-fluid">
      {/* Row for input + save */}
      <div className="row mb-3">
        <div className="col-md-6">
          <Input
            type="text"
            placeholder=""
            lable="Question Head"
            id="QuestionHead"
            name="QuestionHead"
            value={questionHead}
            onChange={(e) => setQuestionHead(e.target.value)}
            respclass="w-100"
            className="required-fields"
          />
        </div>
        <div className="col-md-2">
          <CustomButton text={isUpdate ? "Update" : "Save"} onClick={isUpdate ? handleUpdate : handleSave} icon="save" className="mx-2"/>
                    
        </div>
      </div>

      {/* Row for table */}
      <div className="row">
        <div className="col-sm-12">
          <CustomTable columns={columns} data={tableData} onEdit={handleEdit} />
        </div>
      </div>
    </div>
  );
};

export default AddQuestionHead;
