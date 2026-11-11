import React, { useEffect, useState } from "react";
import "./CategoryMaster.css";
import CustomTable from "../../components/Table/CustomTable";
import Input from "../../components/formComponent/Input";
import { Button } from "react-bootstrap";
import { setTatModalOpen } from "../../store/reducers/TicketingModuleSlice/TicketingModuleSlice";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { axiosInstance } from "../../utils/axiosInstance";
import { notify } from "../../utils/utils";
import { apiUrls } from "../../utils/apiUrls";
import { setLoading } from "../../store/reducers/loadingSlice/loadingSlice";

const EditTatModal = () => {
  const dispatch = useDispatch();
  const { viewIssueModalData } = useSelector((data) => data?.ticketing);
  console.log("viewIssueModalData::", viewIssueModalData);
  const [tatData, setTatData] = useState({
    categoryName: "ESIC CHGS ECHS Department",
    level1: viewIssueModalData?.Level1Resolve || 0,
    level2: viewIssueModalData?.Level2Resolve || 0,
    level3: viewIssueModalData?.Level3Resolve || 0,
  });

  const tableHeaders = [
    { header: "Name", field: "Name", width: "30%" },
    { header: "Level-1 (Min)", field: "level1", width: "20%" },
    { header: "Level-2 (Min)", field: "level2" },
    { header: "Level-3 (Min)", field: "level3" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTatData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    console.log("Updated TAT Data:", tatData);
  };

  const handleTatModalOpen = () => {
    dispatch(setTatModalOpen(false));
  };

  const editData = [
    {
      Name: "Resolve TAT",
      level1: (
        <Input
          type="number"
          name="level1"
          value={tatData.level1}
          placeholder="Enter Min"
          onChange={handleChange}
        />
      ),
      level2: (
        <Input
          type="number"
          name="level2"
          value={tatData.level2}
          placeholder="Enter Min"
          onChange={handleChange}
        />
      ),
      level3: (
        <Input
          type="number"
          name="level3"
          value={tatData.level3}
          placeholder="Enter Min"
          onChange={handleChange}
        />
      ),
    },
  ];

  const updateTATLevel = async () => {
    const tatpayload = {
      id: viewIssueModalData?.ID,
      level1Resolve: viewIssueModalData?.Level1Resolve?.toString(),
      level2Resolve: viewIssueModalData?.Level2Resolve?.toString(),
      level3Resolve: viewIssueModalData?.Level3Resolve?.toString(),
      level1Resp: viewIssueModalData?.Level1Resp?.toString(),
      level2Resp: viewIssueModalData?.Level2Resp?.toString(),
      level3Resp: viewIssueModalData?.Level3Resp?.toString(),
    };
    dispatch(setLoading(true))
    await axiosInstance
      .post(apiUrls.UpdateCategoryTAT, tatpayload)
      .then((res) => {
        notify(res?.data?.message, "success");
      })
      .catch((err) => {
        console.log(err);
        notify(err?.data?.message, "error");
      });
    dispatch(setLoading(false))
  };

  useEffect(()=>{
    setTatData({
    categoryName: "ESIC CHGS ECHS Department",
    level1: viewIssueModalData?.Level1Resolve || 0,
    level2: viewIssueModalData?.Level2Resolve || 0,
    level3: viewIssueModalData?.Level3Resolve || 0,
  })
  },[viewIssueModalData])

  return (
    <div className="editModal_main">
      <h1 className="fw-bold mt-1">Category Name: {tatData.categoryName}</h1>
      <CustomTable columns={tableHeaders} data={editData} />
      <div
        style={{ gap: "10px" }}
        className="mt-3 d-flex justify-content-center gap-2"
      >
        <Button className={"px-4"} variant="primary" onClick={updateTATLevel}>
          Save
        </Button>
        {/* <Button
          className={"px-4"}
          variant="secondary"
          onClick={() => handleTatModalOpen()}
        >
          Cancel
        </Button> */}
      </div>
    </div>
  );
};

export default EditTatModal;
