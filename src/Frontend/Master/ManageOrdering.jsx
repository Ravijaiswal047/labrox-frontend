import React, { useRef, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { axiosInstance } from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import { getDepartment } from "../../utils/NetworkApi/commonApi";
import Accordion from "@app/components/UI/Accordion";
import Loading from "../../components/loader/Loading";
import Tables from "../../components/UI/customTable";
import ReactSelect from "../../components/formComponent/ReactSelect";
import Input from "../../components/formComponent/Input";
import FilterInput from "../../components/Filter/FilterInput";
import NoRecordFound from "../../components/formComponent/NoRecordFound";

const ManageOrdering = () => {
  const { t } = useTranslation();
  const [Department, setDepartment] = useState([]);
  const [Investigation, setInvestigation] = useState([]);
  const [loading, setLoading] = useState(false);
  const [invSequence, setSequence] = useState([]);
  const [dep, setDep] = useState("");
  const [depName, setDepName] = useState("");
  const [investigationName, setInvestigationName] = useState("");
  const [departmentName, setDepartmentName] = useState("");
  const dragItem = useRef();
  const dragOverItem = useRef();
  const tableRef = useRef(); // Reference for the scrollable table container
  const [searchTest, setSearchTest] = useState("Department");
  const [filteredInvestigation, setFilteredInvestigation] = useState([]);
  const [filteredDepartment, setFilteredDepartment] = useState([]);

  const dragStart = (_, position) => {
    console.log("positiondragOverItem:::", position)
    dragItem.current = position;
    
  };

  const dragEnter = (_, position) => {
    dragOverItem.current = position;
  };

  const autoScroll = (e) => {
    const container = tableRef.current;
    if (container) {
      const { clientY } = e;
      const { top, bottom } = container.getBoundingClientRect();

      const scrollStep = 5;
      if (clientY < top + 50) {
        container.scrollTop -= scrollStep; // Scroll up
      } else if (clientY > bottom - 50) {
        container.scrollTop += scrollStep; // Scroll down
      }
    }
  };

  const handleChange = (e) => {
      const { name, value, type, checked } = e.target;
        setInvestigationName(value);  
    };

  // const dropDep = (_) => {
  //   const copyListItems = [...Department];
  //   const dragItemContent = copyListItems[dragItem.current];
  //   copyListItems.splice(dragItem.current, 1);
  //   copyListItems.splice(dragOverItem.current, 0, dragItemContent);
  //   dragItem.current = null;
  //   dragOverItem.current = null;
  //   setDepartment(copyListItems);
  // };

  const dropDep = (_) => {
    const copyListItems = [...filteredDepartment];
    const dragItemContent = copyListItems[dragItem.current];

    // Reorder the array
    copyListItems.splice(dragItem.current, 1);
    copyListItems.splice(dragOverItem.current, 0, dragItemContent);

    // Re-index print order
    const updatedList = copyListItems.map((item, index) => ({
      ...item,
      printOrder: index + 1, // reset order numbers
    }));

    dragItem.current = null;
    dragOverItem.current = null;
    setFilteredDepartment(updatedList);
  };


  // const dropInv = (_) => {
  //   const copyListItems = [...Investigation];
  //   const dragItemContent = copyListItems[dragItem.current];
  //   copyListItems.splice(dragItem.current, 1);
  //   copyListItems.splice(dragOverItem.current, 0, dragItemContent);
  //   dragItem.current = null;
  //   dragOverItem.current = null;
  //   setInvestigation(copyListItems);
  // };

  const dropInv = (_) => {
    const copyListItems = [...filteredInvestigation];
    const dragItemContent = copyListItems[dragItem.current];

    copyListItems.splice(dragItem.current, 1);
    copyListItems.splice(dragOverItem.current, 0, dragItemContent);

    // Re-index print sequence
    const updatedList = copyListItems.map((item, index) => ({
      ...item,
      printsequence: index + 1,
    }));

    dragItem.current = null;
    dragOverItem.current = null;
    setFilteredInvestigation(updatedList);
  };


  const updateHandler = () => {
    const data =
      searchTest === "Department"
        ? filteredDepartment.map((ele, index) => ({
            PrintOrder: index + 1,
            DepartmentID: ele?.value,
            DepartmentName: ele?.label,
          }))
        : filteredInvestigation.map((ele, index) => ({
            DepartmentId: dep,
            printsequence: dep === "" ? index + 1 : invSequence[index],
            InvestigationID: ele?.InvestigationID,
            TestName: ele?.TestName,
          }));

    if (data?.length > 0) {
      const url =
        searchTest === "Department"
          ? "Department/UpdateDepartmentDataWithOrdering"
          : "Investigations/UpdateprintsequenceForTest";
      setLoading(true);
      axiosInstance
        .post(url, { Data: data })
        .then((res) => {
          toast.success(res?.data?.message);
          getDepartment(setDepartment, "getDepartmentEmployeeMaster", true);
          // DepartmentWiseItemList("");
          setLoading(false);
          setDep("");
          setSequence([]);
        })
        .catch((err) => {
          toast.error(err?.response?.data?.message || "Something Went Wrong");
          setLoading(false);
        });
    } else {
      toast.error("Data Can't Be Blank");
    }
  };

  console.log('dep:::',dep)

  const DepartmentWiseItemList = (id) => {
    axiosInstance
      .post("CommonController/DepartmentWiseItemList", {
        DepartmentID: id?.toString() || "",
        TestName: "",
      })
      .then((res) => {
        const data = res?.data?.message;
        // const val = data.map((ele) => ({
        //   TestName: ele?.TestName,
        //   InvestigationID: ele?.InvestigationID,
        //   printsequence: ele?.printordering,
        // }));
        const val = data.map((ele) => {
          const department = Department.find(dept => dept.value === ele?.DepartmentID);
          return {
            TestName: ele?.TestName,
            InvestigationID: ele?.InvestigationID,
            printsequence: ele?.printordering,
            departmentLabel: department ? department.label : "", // Set department label or default to "Unknown"
          };
        });
        const values = data.map((ele) => ele?.printordering);
        setSequence(values);
        setInvestigation(val);
        setFilteredInvestigation(val);
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Error Occurred");
      });
  };

  const handleChangeSearch = (e) => {
      const value = e.target.value;
      setInvestigationName(e.target.value);

      const filteredData = Investigation.filter((ele) =>
        ele.TestName.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredInvestigation(filteredData);
    };

    const filterDepartmentSearch = (e) => {
      const value = e.target.value;
      setDepartmentName(e.target.value);

      const filteredData = Department.filter((ele) =>
        ele.label.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredDepartment(filteredData);
    };

    useEffect(() => {
      getDepartment(setDepartment, "getDepartmentEmployeeMaster", true);
      // DepartmentWiseItemList("");
    }, []);

    useEffect(() => {
      if (Department.length > 0) {
        setFilteredDepartment(Department);
      }
    }, [Department]); 

  // useEffect(() => {
  //   if (investigationName) {
  //     const filteredData = Investigation.filter((ele) =>
  //       ele.TestName.toLowerCase().includes(investigationName.toLowerCase())
  //     );
  //     setFilteredInvestigation(filteredData);
  //   } else {
  //     setFilteredInvestigation(Investigation); 
  //   }
  // }, [investigationName]);
  console.log("Department",Department);
  console.log("filteredDepartment",filteredInvestigation);

  return (
    <>
      <Accordion
        name={t("Manage Ordering")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row pt-2 pl-2 pr-2">
          <div className="col-sm-1">
            <input
              type="radio"
              id="Department"
              name="type"
              value="Department"
              checked={searchTest === "Department"}
              onChange={(e) => {
                setSearchTest(e.target.value);
                getDepartment(
                  setDepartment,
                  "getDepartmentEmployeeMaster",
                  true,
                );
                setFilteredInvestigation([]);
                setDep("");
                // setDepName("");
              }}
            />
            <label htmlFor="Department">{t("Department")}</label>
          </div>
          <div className="col-sm-1">
            <input
              type="radio"
              name="type"
              value="Investigation"
              id="Investigation"
              checked={searchTest === "Investigation"}
              onChange={(e) => {
                setSearchTest(e.target.value);
                // DepartmentWiseItemList("");
                getDepartment(
                  setDepartment,
                  "getDepartmentEmployeeMaster",
                  true,
                );
                
                setDep("");
                // setDepName("");
              }}
            />
            <label htmlFor="Investigation">{t("Investigation")}</label>
          </div>
        </div>
      </Accordion>
      <Accordion title={t("Search Data")} defaultValue={true}>
        {loading ? (
          <Loading />
        ) : searchTest === "Department" ? (
          <> 
          
          <div className="row pt-2">
              <div className="col-sm-12 d-flex justify-content-end">
                <FilterInput
                  value={departmentName}
                  onChange={filterDepartmentSearch}
                  placeholder="Filter Table"
                />
              </div>
            </div>

             {filteredDepartment?.length > 0 ? (
             <div
            className="p-2 mb-2"
            style={{ maxHeight: "370px", overflowY: "auto" }}
            ref={tableRef}
            onDragOver={autoScroll}
          >
            <Tables>
              <thead>
                <tr>
                  <th>{t("Sequence")}</th>
                  <th>{t("Department ID")}</th>
                  <th>{t("Department Name")}</th>
                </tr>
              </thead>
              <tbody>
                {filteredDepartment?.map((ele, index) => (
                  <tr
                    key={index}
                    draggable
                    onDragStart={(e) => dragStart(e, index)}
                    onDragEnter={(e) => dragEnter(e, index)}
                    onDragEnd={dropDep}
                    style={{ cursor: "move" }}
                  >
                    <td>{ele?.printOrder}</td>
                    <td>{ele?.value}</td>
                    <td>{ele?.label}</td>
                  </tr>
                ))}
              </tbody>
            </Tables>
          </div> ) :
          (
            <div className="">
                      <NoRecordFound />
                    </div>
          )}
          {filteredDepartment?.length > 0 ? (
        <button
          className="btn btn-success btn-sm mb-2 ml-3 mt-1"
          onClick={updateHandler}
        >
          {t("Save Ordering")}
        </button>
        ) : null}
          </>
          
        ) : (
          <div>
            <div className="row px-2">
              <div className="col-sm-3 mt-2">
                <ReactSelect
                  placeholderName="Select Department"
                  lable="Select Department"
                  dynamicOptions={[
                    { label: "Select...", value: "" },
                    ...Department,
                  ]}
                  removeIsClearable={true}
                  value={dep}
                  onChange={(_, e) => {
                    setDep(e?.value);
                    // setDepName(e?.label);
                  }}
                />
              </div>
              <div className="col-sm-1 mt-2">
                  <button
                    className="btn btn-success btn-sm btn-block"
                    onClick={() => {
                      if (dep !== "") {
                        DepartmentWiseItemList(dep);
                      } else {
                        toast.info("Please Select Department");
                      }
                    }}
                  >
                    {t("Search")}
                  </button>
              </div>
            </div>
            {Investigation?.length > 0 ? (
            <div className="row pt-2">
              <div className="col-sm-12 d-flex justify-content-end">
                <FilterInput
                  value={investigationName}
                  onChange={handleChangeSearch}
                  placeholder="Filter Table"
                />
              </div>
            </div>) : null}
            
            {filteredInvestigation?.length > 0 ? (                   
            <div
              className="p-2 mb-2"
              ref={tableRef}
              onDragOver={autoScroll}
              style={{ maxHeight: "370px", overflowY: "auto" }}
            >
              <Tables>
                <thead>
                  <tr>
                    <th>{t("Sequence")}</th>
                    <th>{t("Department")}</th>
                    <th>{t("Investigation ID")}</th>
                    <th>{t("Investigation Name")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvestigation.map((ele, index) => (
                    <tr
                      key={index}
                      draggable
                      onDragStart={(e) => dragStart(e, index)}
                      onDragEnter={(e) => dragEnter(e, index)}
                      onDragEnd={dropInv}
                      style={{ cursor: "move" }}
                    >
                      <td>{ele?.printsequence}</td>
                      <td>{ele?.departmentLabel}</td>
                      <td>{ele?.InvestigationID}</td>
                      <td>{ele?.TestName}</td>
                    </tr>
                  ))}
                </tbody>
              </Tables>
            </div>
                      
            
            ) : (
                    <div className="">
                      <NoRecordFound />
                    </div>
                  )}
            {(filteredInvestigation?.length > 0) ? (
        <button
          className="btn btn-success btn-sm mb-2 ml-3 mt-1"
          onClick={updateHandler}
        >
          {t("Save Ordering")}
        </button>
        ) : null}
          </div>

        )}
        
      </Accordion>
    </>
  );
};

export default ManageOrdering;
