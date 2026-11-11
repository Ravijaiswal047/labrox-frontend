// import React, { useEffect, useState } from "react";
// import {
//   setModalData,
//   setTagEmployeeModalToggle,
// } from "../../store/reducers/TicketingModuleSlice/TicketingModuleSlice";
// import { useLocation, useNavigate } from "react-router-dom";
// import CustomTable from "../../components/Table/CustomTable";
// import Modal from "../../components/ModalComponent/Modal";
// import { ViewMenu } from "../../components/SvgIcons";
// import { IoIosArrowRoundBack } from "react-icons/io";
// import Heading from "../../components/UI/Heading";
// import ModalTagEmployee from "./ModalTagEmpoyee";
// import { useDispatch } from "react-redux";
// import { useSelector } from "react-redux";
// import TicketMenuList from "./TicketMenuList";
// import "./CategoryMaster.css";
// import { setLoading } from "../../store/reducers/loadingSlice/loadingSlice";
// import { axiosInstance } from "../../utils/axiosInstance";
// import { apiUrls } from "../../utils/apiEndpoints";
// import { notify } from "../../utils/utils";

// const TagEmployee = () => {
//   const location = useLocation();
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const [showMore, setShowMore] = useState(false);
//   const tagEmployeeModalToggle = useSelector(
//     (state) => state.ticketing.tagEmployeeModalToggle
//   );
//   const { modalData } = useSelector((data) => data?.ticketing);
//   const [employeTableList, setEmployeTableList] = useState([]);
//   const [selectedLevel, setSelectedLevel] = useState(null);
//   const [payload, setPayload] = useState({
//     level1: "",
//     level2: "",
//     level3: "",
//   });

//   console.log("location", location?.state?.data);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setPayload((prev) => ({ ...prev, [name]: value }));
//   };

//   const dummyData = [
//     {
//       sNo: 1,
//       centreName: "Aarvy Hospital",
//       level1:
//         "Miss Monika Rani (F/O), Ms. Donia (Call Centre), Mrs. Donia Danuwal (CCG), SEC-441, Mr. Ravindran (CCT), Mr. Mohit Kumar Srivastava (CCG), Mr. Mohit (NRP Lab), Mr. Donja Noni (NRP Lab), Mr. Vichal Yadav (NRP), Mr. Satyesh Gautam (Micro), Dr. Dushyant Rajput, Dr. Ritesh Rajput (Microbiology), Mr. Rakesh Kumar Thakur (Micro-Lab), Mr. Ajay Singh (Microbiology), Mr. Rahul (Micro), Mr. Sunil Yadav (Micro), Miss Vandana Thakur (Micro)",
//       level2: "Mr. Gagan Arora, Mr. Itdose Team Admin",
//       level3:
//         "Mr. Itdose Team Admin, Mr. Gagan Arora, Mr. Atul Kumar (IT), Mrs. Sangeeta Yadav (F/O), Mrs. Deana Rani (Micro-CCT), Miss Suman Yadav (Record)",
//     },
//     {
//       sNo: 2,
//       centreName: "Aarvy Hospital",
//       level1:
//         "Mrs. Manorama (Micro), Mr. Dinesh Kumar (NRP), Mr. Brijesh Kumar (IT), Mr. Nitesh Kumar (NRP Lab), Mr. Dinesh Yadav (NRP ER), Mr. Sunil Yadav (Micro), Mr. Rohit (NRP F/O)",
//       level2:
//         "Mr. Rishabh Singh (Kanal Lab), Miss Varshita (NRP RECD), Mr. Vikas Verma (IT), Mr. Yashdeep (CCG), Mrs. Preeti (CCG), Mr. Sachin (CCG), Ms. Anam Mishra (NRP TRAINING), Miss Jonu Dateh (Lab), Mr. Akash Yadav (NRP), Miss Sana (CCG, Bareilly), Mr. Rohit Kumar, Madhya (CCG), Mr. Sahil Kumar (CCG), Miss Bharti (Rec Hist), Miss Manorama, Kuntal (SEC-441), Miss Amvika Rathore (F/O)",
//       level3: "Mr. Dinesh Kumar (NRP)",
//     },
//   ];

//   const tableHeaders = [
//     { header: "S.No", field: "sNo", width: "3%" },
//     { header: "Centre Name", field: "centreName", width: "23%" },
//     { header: "Level 1", field: "level1", width: "15%" },
//     { header: "Level 2", field: "level2", width: "15%" },
//     { header: "Level 3", field: "level3", width: "15%" },
//   ];

//   const RenderLevelData = ({levelString}) => {
//     if (!levelString) return null;
//     console.log('levelString:xx:',levelString);
//     // Normalize into array
//     const items = Array.isArray(levelString)
//       ? levelString
//       : typeof levelString === "string"
//         ? levelString.split(",")
//         : [];

//         console.log('empName:::', items);

//     return items.map((item, index) => (
//       <div key={index} className="mb-1 present_sign">
//         {item?.empName ?? item?.empName}
//       </div>
//     ));
//   };

//   const handleOpenModal = (val, idx) => {
//     dispatch(setTagEmployeeModalToggle(val));
//     // dispatch(setModalData({ level: idx, hideCentre: true }));
//     dispatch(setModalData({ level: idx, ...employeTableList?.[0], hideCentre: false }));
//   };

//   const handleRowClick = (row, idx) => {
//     dispatch(setTagEmployeeModalToggle(true));
//     dispatch(setModalData({ level: idx, ...row, hideCentre: false }));
//   };

//   const handleLevelCellClick = (row, idx, level) => {
//     dispatch(setTagEmployeeModalToggle(true));
//     dispatch(
//       setModalData({ level: level, ...row, index: idx + 1, hideCentre: true })
//     );
//   };

//   console.log("tagEmployeeModalToggle", tagEmployeeModalToggle);

//   const getTagEmployee = async () => {
//     // CategoryEmployee
//     const apiPayload = {
//       Type: "CategoryEmployee",
//       categoryId: location?.state?.data?.ID,
//       queryID: 0,
//       responseID: 0,
//       priorityID: 0,
//       ticketID: 0,
//     };
//     dispatch(setLoading(true));
//     await axiosInstance
//       .post(apiUrls.GetDataMaster, apiPayload)
//       .then((res) => {
//         if (!Array.isArray(res?.data?.message)) {
//           notify(res?.data?.message, "success");
//           return;
//         }
//         setEmployeTableList(res?.data?.message);
//         console.log(res);
//       })
//       .catch((err) => {
//         console.log(err);
//         notify(err?.data?.message, "error");
//       });
//     dispatch(setLoading(false));
//   };

//   console.log("employeTableList", employeTableList?.[0]);

//   useEffect(() => {
//     if(!tagEmployeeModalToggle){
//       getTagEmployee();
//     }
//   }, [tagEmployeeModalToggle]);

//   return (
//     <>
//       <Heading
//         title={
//           <div className="title_icon">
//             <IoIosArrowRoundBack onClick={() => navigate(-1)} fontSize={20} />
//             <span>Customer Care Employee</span>
//           </div>
//         }
//         secondTitle={
//           <label onClick={() => setShowMore((prev) => !prev)}>
//             <ViewMenu />
//           </label>
//         }
//       />
//       <div className="card px-1 py-2">
//         {/* Category Title */}
//         <div className="d-flex align-items-center justify-content-center mb-2">
//           <span className="fs-6">Category Name:</span>
//           <h1 className="title_tit fw-bold my-1 mx-2">IT Support</h1>
//         </div>

//         {/* Default Employee Section */}
//         <div
//           className="row d-flex px-3 mb-3 align-items-center"
//           style={{ gap: "8px" }}
//         >
//           <p className="mb-0">Set Default Employee:</p>
//           {Array.from({ length: 3 }).map((_, i) => (
//             <div
//               onClick={() => {
//                 setSelectedLevel(i + 1);
//                 handleOpenModal(true, i + 1);
//               }}
//               key={i}
//               className="col-sm-3 col-md-3 custome_input"
//             >
//               {employeTableList?.[0]?.centreID === 0 &&
//                 employeTableList?.[0]?.[`level${i + 1}`]?.map((eL1, idx) => {
//                   if (idx <= 2) {
//                     return (
//                       <div key={idx} className="text-capitalize">
//                         {eL1?.empName?.toLowerCase()}
//                       </div>
//                     );
//                   }
//                 })}
//               {employeTableList?.[0]?.[`level${i + 1}`]?.length > 3 && (
//                 <div>
//                   {employeTableList?.[0]?.[`level${i + 1}`]?.length - 3}+ More
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>

//         {/* Employee Table */}
//         <div className="editModal_main">
//           <CustomTable
//             // onRowClick={handleRowClick}
//             columns={tableHeaders}
//             // onCellClick={handleLevelCellClick}
//             data={employeTableList?.slice(1).map((row, idx) => ({
//               sNo: idx+1,
//               centreName: row.centerName,
//               level1: (
//                 <div
//                   onClick={() => handleLevelCellClick(row, idx, 1)}
//                   style={{minWidth:'100%', minHeight:'10px', gap: "4px" }}
//                   className="d-flex gap-2 flex-wrap"
//                 >
//                   <RenderLevelData levelString={row.level1}/>
//                 </div>
//               ),
//               level2: (
//                 <div
//                   onClick={() => handleLevelCellClick(row, idx, 2)}
//                   style={{ gap: "4px" }}
//                   className="d-flex gap-2 flex-wrap"
//                 >
//                   {/* {renderLevelData(row.level2)} */}
//                   <RenderLevelData levelString={row.level2}/>
//                 </div>
//               ),
//               level3: (
//                 <div
//                   onClick={() => handleLevelCellClick(row, idx, 3)}
//                   style={{ gap: "4px" }}
//                   className="d-flex gap-2 flex-wrap"
//                 >
//                   {/* {renderLevelData(row.level3)} */}
//                   <RenderLevelData levelString={row.level3}/>
//                 </div>
//               ),
//             }))}
//           />
//         </div>
//       </div>
//       <Modal
//         Header={<div>Tag Employee at : Level {modalData?.level}</div>}
//         setVisible={(val) => handleOpenModal(val)}
//         visible={tagEmployeeModalToggle}
//         children={<ModalTagEmployee />}
//         modalWidth={"60%"}
//       />
//       {showMore && <TicketMenuList />}
//     </>
//   );
// };

// export default TagEmployee;

import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  setModalData,
  setTagEmployeeModalToggle,
} from "../../store/reducers/TicketingModuleSlice/TicketingModuleSlice";
import { useLocation, useNavigate } from "react-router-dom";
import CustomTable from "../../components/Table/CustomTable";
import Modal from "../../components/ModalComponent/Modal";
import { ViewMenu } from "../../components/SvgIcons";
import { IoIosArrowRoundBack } from "react-icons/io";
import Heading from "../../components/UI/Heading";
import ModalTagEmployee from "./ModalTagEmpoyee";
import { useDispatch, useSelector } from "react-redux";
import TicketMenuList from "./TicketMenuList";
import "./CategoryMaster.css";
import { setLoading } from "../../store/reducers/loadingSlice/loadingSlice";
import { axiosInstance } from "../../utils/axiosInstance";
import { apiUrls } from "../../utils/apiUrls";
import { notify } from "../../utils/utils";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { useTranslation } from "react-i18next";

const TagEmployee = () => {
  const [t] = useTranslation();
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const categoryData = location?.state;
  const [tagEmployeeData, setTagEmployeeData] = useState({});
  const [categoryMasterList, setCategoryMasterList] = useState([]);
  const [showMore, setShowMore] = useState(false);
  const [payload, setPayload] = useState({
    category: "",
  });
  const tagEmployeeModalToggle = useSelector(
    (state) => state.ticketing.tagEmployeeModalToggle
  );
  const { modalData } = useSelector((data) => data?.ticketing);
  const [employeTableList, setEmployeTableList] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState(null);

  console.log("modalDataxxx", tagEmployeeData, "--", categoryData?.from);

  // ---- Helpers ----
  const renderLevelData = useCallback((levelString) => {
    if (!levelString) return null;

    const items = Array.isArray(levelString)
      ? levelString
      : typeof levelString === "string"
        ? levelString.split(",")
        : [];

    return items.map((item, index) => (
      <div
        style={{ gap: "4px" }}
        key={index}
        className="mb-1 d-flex flex-wrap present_sign"
      >
        {item?.empName ?? item}
      </div>
    ));
  }, []);

  const getCategoryMaster = async () => {
    const apiPayload = {
      type: "CategoryTable",
      categoryId: 0,
      queryID: 0,
      responseID: 0,
      priorityID: 0,
      ticketID: 0,
    };
    await axiosInstance
      .post(apiUrls.GetDataMaster, apiPayload)
      .then((res) => {
        // notify(res?.data?.message, "success");
        if (!Array.isArray(res?.data?.message)) {
          notify(res?.data?.data, "error");
          return;
        }
        console.log("res?.data?.message", res?.data?.message);
        let resList = res?.data?.message?.map((item, idx) => ({
          ...item,
          label: item?.CategoryName,
          value: String(item?.ID),
        }));
        setCategoryMasterList(resList);
        if (!categoryData?.from?.includes("category-master")) {
          setTagEmployeeData((prev) => ({
            ...prev,
            CategoryName: resList[0]?.label,
          }));
          setPayload((prev) => ({ ...prev, category: resList[0]?.value }));
        }
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  };

  // const handleOpenModal = useCallback(
  //   (val, idx, centerType='') => {
  //     dispatch(setTagEmployeeModalToggle(val));
  //     let customObj = { ...employeTableList?.[0]}
  //     // if(centerType==='default'){
  //     //   delete customObj[centreID];
  //     //   customObj.centreID = 0
  //     // }
  //     dispatch(
  //       setModalData({
  //         level: idx,
  //         // ...employeTableList?.[0],
  //         customObj,
  //         hideCentre: false,
  //         centerType: centerType
  //       })
  //     );
  //   },
  //   [dispatch, employeTableList]
  // );

  const handleOpenModal = useCallback(
  (val, idx, centerType = '') => {
    dispatch(setTagEmployeeModalToggle(val));

    let customObj = { ...employeTableList?.[0] };

    if (centerType === 'default') {
      delete customObj.centreID;  // correctly delete the key
      customObj.centreID = 0;     // assign 0 as new value
    }

    dispatch(
      setModalData({
        level: idx,
        ...customObj,
        hideCentre: false,
        centerType: centerType,
        catID: payload?.category
      })
    );
  },
  [dispatch, employeTableList]
);

  const handleRowClick = useCallback(
    (row, idx) => {
      dispatch(setTagEmployeeModalToggle(true));
      dispatch(setModalData({ level: idx, ...row, hideCentre: false }));
    },
    [dispatch]
  );

  const handleLevelCellClick = useCallback(
    (row, idx, level) => {
      dispatch(setTagEmployeeModalToggle(true));
      dispatch(
        setModalData({ level, ...row, index: idx + 1, hideCentre: true, catID: payload?.category })
      );
    },
    [dispatch]
  );

  useEffect(() => {
    getCategoryMaster();
  }, []);

  // ---- API ----
  const getTagEmployee = useCallback(
    async (id = "") => {
      const apiPayload = {
        Type: "CategoryEmployee",
        categoryId: Number(id) || location?.state?.data?.ID,
        queryID: 0,
        responseID: 0,
        priorityID: 0,
        ticketID: 0,
      };

      dispatch(setLoading(true));
      try {
        const res = await axiosInstance.post(apiUrls.GetDataMaster, apiPayload);
        if (!Array.isArray(res?.data?.message)) {
          notify(res?.data?.message, "success");
          return;
        }
        setEmployeTableList(res?.data?.message);
      } catch (err) {
        console.error(err);
        notify(err?.data?.message, "error");
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch, location?.state?.data?.ID]
  );

  useEffect(() => {
    if (!tagEmployeeModalToggle) {
      getTagEmployee(location?.state?.data?.ID);
      setTagEmployeeData(location?.state?.data);
    }
  }, [tagEmployeeModalToggle]);

  // ---- Table Config ----
  const tableHeaders = useMemo(
    () => [
      { header: "S.No", field: "sNo", width: "3%" },
      { header: "Centre Name", field: "centreName", width: "23%" },
      { header: "Level 1", field: "level1", width: "15%" },
      { header: "Level 2", field: "level2", width: "15%" },
      { header: "Level 3", field: "level3", width: "15%" },
    ],
    []
  );

  const handleReactChange = (name, e) => {
    setPayload((prev) => ({ ...prev, [name]: e?.value }));
    getTagEmployee(e?.value);
    setTagEmployeeData((prev) => ({
      ...prev,
      CategoryName: e?.label,
    }));
  };

  const tableData = useMemo(
    () =>
      employeTableList
        ?.filter((item) => item.centreID != 0)
        .map((row, idx) => ({
          // employeTableList?.slice(1).map((row, idx) => ({
          sNo: idx + 1,
          centreName: row.centerName,
          level1: (
            <div
              style={{
                minHeight: "20px",
                minWidth: "100%",
                gap: "4px",
                border: "1px solid #f1eded96",
                borderRadius: "2px",
              }}
              onClick={() => handleLevelCellClick(row, idx, 1)}
              className="d-flex gap-2 flex-wrap"
            >
              {renderLevelData(row.level1)}
            </div>
          ),
          level2: (
            <div
              style={{
                minHeight: "20px",
                minWidth: "100%",
                gap: "4px",
                border: "1px solid #f1eded96",
                borderRadius: "2px",
              }}
              onClick={() => handleLevelCellClick(row, idx, 2)}
              className="d-flex gap-2 flex-wrap"
            >
              {renderLevelData(row.level2)}
            </div>
          ),
          level3: (
            <div
              style={{
                minHeight: "20px",
                minWidth: "100%",
                gap: "4px",
                border: "1px solid #f1eded96",
                borderRadius: "2px",
              }}
              onClick={() => handleLevelCellClick(row, idx, 3)}
              className="d-flex gap-2 flex-wrap"
            >
              {renderLevelData(row.level3)}
            </div>
          ),
        })),
    [employeTableList, handleLevelCellClick, renderLevelData]
  );

  return (
    <>
      <Heading
        title={
          <div className="title_icon">
            <IoIosArrowRoundBack onClick={() => navigate(-1)} fontSize={20} />
            <span>Category Tag Employee</span>
          </div>
        }
        secondTitle={
          <label onClick={() => setShowMore((prev) => !prev)}>
            <ViewMenu />
          </label>
        }
      />

      <div className="card px-1 py-2">
        <div className="d-flex align-items-center justify-content-center mb-2">
          <span className="fs-6">Category Name:</span>
          <h1 className="title_tit my-1 mx-2">
            {tagEmployeeData?.CategoryName}
          </h1>
        </div>

        {/* Default Employee Section */}
        <div
          className="row d-flex px-3 mb-3 align-items-center"
          style={{ gap: "8px" }}
        >
          {/* Category Title */}
          {!categoryData?.from?.includes("category-master") && (
            <div className="col-md-2 col-sm-3 col-12">
              <ReactSelect
                dynamicOptions={categoryMasterList}
                isShowBorder={true}
                name="category"
                lable={t("Category")}
                placeholderName={t("Category")}
                value={payload.category}
                onChange={handleReactChange}
              />
            </div>
          )}
          <p className="mb-0">Set Default Employee:</p>
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              onClick={() => {
                setSelectedLevel(i + 1);
                handleOpenModal(true, i + 1, 'default');
              }}
              key={i}
              className="col-sm-3 col-md-2 custome_input"
            >
              {employeTableList?.filter((item) => item.centreID === 0) &&
                employeTableList
                  ?.find((item) => item.centreID === 0)
                  ?.[`level${i + 1}`]?.slice(0, 3)
                  .map((eL1, idx) => (
                    <div key={idx} className="text-capitalize">
                      {eL1?.empName?.toLowerCase()}
                    </div>
                  ))}
              {employeTableList?.[0]?.[`level${i + 1}`]?.length > 3 && (
                <div>
                  {employeTableList?.[0]?.[`level${i + 1}`]?.length - 3}+ More
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Employee Table */}
        <div className="editModal_main">
          <CustomTable columns={tableHeaders} data={tableData} />
        </div>
      </div>

      <Modal
        Header={<div>Tag Employee at : Level {modalData?.level}</div>}
        setVisible={(val) => handleOpenModal(val)}
        visible={tagEmployeeModalToggle}
        children={<ModalTagEmployee />}
        modalWidth={"60%"}
      />

      {showMore && <TicketMenuList />}
    </>
  );
};

export default TagEmployee;
