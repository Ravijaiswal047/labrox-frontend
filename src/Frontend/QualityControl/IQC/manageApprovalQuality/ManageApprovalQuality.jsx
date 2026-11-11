import React, { useEffect, useState } from "react";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import Accordion from "../../../../components/UI/Accordion";
import { useTranslation } from "react-i18next";
import Input from "../../../../components/formComponent/Input";
import { Button } from "react-bootstrap";
import CustomTable from "../../../../components/Table/CustomTable";
import { FaTimes } from "react-icons/fa";
import RadioInput from "../../../../components/formComponent/RadioInput";
import QCFrameMenu from "../QCFrameMenu";
import { ViewMenu } from "../../../../components/SvgIcons";
import { axiosInstance } from "../../../../utils/axiosInstance";
import { apiUrls } from "../../../../utils/apiUrls";
import { useDispatch } from "react-redux";
import { setLoading } from "../../../../store/reducers/loadingSlice/loadingSlice";
import { notify } from "../../../../utils/utils";
import { autocompleteOnBlur, validateRequiredFields } from "../../../../utils/helpers";
import Heading from "../../../../components/UI/Heading";
import { CustomButton } from "../../../../components/UI/CustomButton";

const ManageApprovalQuality = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const initialState = {
    EmployeeName: "",
    EmployeeId: 0,
    AuthorityType: "",
    Department: "",
    SelectAll: "",
    EditSIN: "",
    EditLabMin: "",
    Approved: "",
    typeData: [],
  };
  const [bindActions, setBindActions] = useState([]);
  const [payload, setPayload] = useState(initialState);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [errors, setErrors] = useState({});

  const handleSelectChange = (name, e) => {
    setPayload((prev) => ({ ...prev, [name]: e?.value }));
    setBindActions([]);
    setTableData([]);
    bindAction(e?.value);
    bindManageApproval(e?.value);
  };

  console.log('payloadxxx', payload)
  
  const handleClose = async (item) => {
    console.log("item",item);
    dispatch(setLoading(true));

    await axiosInstance
      .post(apiUrls.RemoveManageApproval, {
        appRightID: item.ApprightID.toString(),
      })
      .then((res) => {
        if(res?.data?.success){
          console.log("bind Action Res.....", res);
          notify(res?.data?.message, "success");
          bindManageApproval(item?.AppRightFor || "");
        } 
       handleReset();       
      })
      .catch((err) => {
        notify(err?.data?.message, "error");
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  };

  const handleSelectAll = () => {
  // if all selected → unselect all
  if (payload.typeData.length === bindActions.length) {
    setPayload(prev => ({ ...prev, typeData: [] }));
    return;
  }

  // else select all
  const allValues = bindActions.map(
    (a) => `${a.TypeIDApprove}#${a.TypeName}`
  );

  setPayload(prev => ({ ...prev, typeData: allValues }));
};
  const handleCheckbox = (action) => {
    const value = `${action.TypeIDApprove}#${action.TypeName}`;

    // setPayload((prev) => ({
    //   ...prev,
    //   typeData: prev.typeData === typeData ? "" : typeData, 
    // }));
    setPayload((prev) => {
    // If already selected → remove
    if (prev.typeData.includes(value)) {
      return {
        ...prev,
        typeData: prev.typeData.filter((item) => item !== value),
      };
    }

    // If not selected → add
    return {
      ...prev,
      typeData: [...prev.typeData, value],
    };
  });
  };
  const handleAdd = async () => {
    const requiredFields = [
          "EmployeeName",
          "AuthorityType",
        ];    
        const errors = validateRequiredFields(payload, requiredFields);
        if (Object.keys(errors).length > 0) {
          setErrors(errors);
          return; 
        }

    const addPayload = {
      employeeID: payload?.EmployeeId.toString() || "",
      typeData: payload?.typeData || [],
      appRightFor: payload?.AuthorityType || "",
    };

    if(payload?.typeData?.length === 0){
      notify("Approvals list not selected", "warn");
      return;
    }
    dispatch(setLoading(true));
    await axiosInstance
      .post(apiUrls.SaveApprovalRight, addPayload)
      .then((res) => {
        console.log("bind Action Res.....", res);
        if(res?.data?.success){
          notify(res?.data?.message, "success");
          bindManageApproval(payload.AuthorityType);
        }
        else{
          notify(res?.data?.message, "warn");
        }
        handleReset();
      })
      .catch((err) => {
        notify(err?.data?.message, "error");
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  };
  const handleReset = () => {
    setPayload(initialState);
    setBindActions([]);
    setQuery("");
    setErrors({});
  };
  const columns = [
    { header: "Sr.No", field: "srNo", width: "5%" },
    { header: "Employee Name", field: "employeeName" },
    { header: "Authority Type", field: "authorityType" },
    { header: "Approval", field: "approval" },
    { header: "Created By", field: "createdBy" },
    { header: "Created Date", field: "createdDate" },
    { header: "Remove", field: "remove" },
  ];

  const bindAction = async (type) => {
    await axiosInstance
      .post(apiUrls.BindAction, {
        typeToBind: type,
      })
      .then((res) => {
        console.log("bind Action Res.....", res);
        if (Array.isArray(res?.data?.message)) {
          setBindActions(res?.data?.message); // store array of actions
        } else {
          setBindActions([]);
        }
      })
      .catch((err) => {
        notify(err?.data?.message, "error");
      })
      .finally(() => {});
  };

  const bindManageApproval = async (appRight) => {
    console.log("appright", appRight);
    const searchPayload = {
      appRightFor: appRight,
      con: 0,
    };
    await axiosInstance
      .post(apiUrls.BindManageApproval, searchPayload)
      .then((res) => {
        console.log("bind Manage Approval Res.....", res);
        if (Array.isArray(res?.data?.message) && res?.data?.success) {
          const mappedData = res?.data?.message.map((item, index) => {
            return {
              srNo: index + 1,
              employeeName: item?.EmployeeName || "",
              authorityType: item?.AppRightFor || "",
              approval: item?.TypeName || "",
              createdBy: item?.CreatedByName || "",
              createdDate: item?.CreatedDate || "",
              remove: (
                <FaTimes
                  style={{ color: "red", cursor: "pointer" }}
                  onClick={() => handleClose(item)}
                />
              ),
            };
          });
          setTableData(mappedData);
        }
        else{
          setTableData([]);
        }
      })
      .catch((err) => {
        notify(err?.data?.message, "error");
      })
      .finally(() => {
        // dispatch(setLoading(false));
      });
  };

  const fetchEmployees = async (searchText) => {
    try {
      const payload = { query: searchText };
      const res = await axiosInstance.post(apiUrls.Search, payload);
      console.log("res", res);
      if (res?.data?.success && Array.isArray(res.data.message)) {
        const employees = Array.isArray(res.data.message)
          ? res.data.message
          : [res.data.message];

        setResults(employees);
        setShowDropdown(true);
      } else {
        setResults([]);
        setShowDropdown(false);
      }
    } catch (err) {
      notify(err?.data?.message || "Search failed", "error");
    }
  };

  const handleSelect = (emp) => {
    console.log("name",emp);
    setIsSelecting(true);
    setQuery(emp?.label);
    setPayload((prev) => ({ ...prev, EmployeeName: emp?.label, EmployeeId : emp?.value }));
    setShowDropdown(false);
  };

  const handleKeyDown = (e) => {
  if (!showDropdown || results.length === 0) return;

  switch (e.key) {
    case "ArrowDown":
      // e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < results.length - 1 ? prev + 1 : 0
      );
      setTimeout(() => {
                const el = document.querySelector(".matchIndex");
                if (el) el.scrollIntoView({ block: "nearest" });
              }, 0);
      break;

    case "ArrowUp":
      // e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : results.length - 1
      );
      setTimeout(() => {
                const el = document.querySelector(".matchIndex");
                if (el) el.scrollIntoView({ block: "nearest" });
              }, 0);
      break;

    case "Enter":
      // e.preventDefault();
      if (highlightedIndex >= 0 && results[highlightedIndex]) {
        const selected = results[highlightedIndex];
        handleSelect(selected);
      }
      break;

    case "Escape":
      setShowDropdown(false);
      break;

    default:
      break;
  }
};

 useEffect(()=>{
    setHighlightedIndex(0);
  },[query]);
  
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (isSelecting) {
      setIsSelecting(false);
      return; // skip fetch
    }
      if (query.length > 0) {
        fetchEmployees(query);
      } else {
        setResults([]);
        setShowDropdown(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const AuthorityTypeOptions = [
    { value: "QC", label: "QC" },
    { value: "EQAS", label: "EQAS" },
    { value: "ILCSE", label: "ILCSE" },
    { value: "Department", label: "Department" },
  ];
  console.log("payload?.AuthorityType", payload?.AuthorityType);
  console.log("tabledata", tableData);
  console.log("bindActions", bindActions);
  console.log("errors",errors);
  return (
    <>
      {showMore && <QCFrameMenu />}
      {/* <Accordion
        name={t("Manage Approval Quality")}
        defaultValue={true}
        isBreadcrumb={true}
        secondTitle={
          <>
            <label onClick={() => setShowMore((prev) => !prev)}>
              <ViewMenu />
            </label>
          </>
        }
      > */}
      <Heading
                name={"Manage Approval Quality"}
                isBreadcrumb={"true"}
                secondTitle={
                  <>
                    <label onClick={() => setShowMore((prev) => !prev)}>
                      <ViewMenu />
                    </label>
                  </>
                }
              />
        <div className="row p-2 position-relative white-background">
        <div className="col-xl-2 col-sm-4 col-md-6 col-12">
          <Input
            autocomplete="off"
            type="text"
            placeholder=""
            lable="Employee Name"
            id="EmployeeName"
            name="EmployeeName"
            value={query}
            onKeyDown={handleKeyDown}
            onChange={(e) => setQuery(e.target.value)}
            onBlur={(e) => {
              autocompleteOnBlur(setResults);
            }}

          />
          {/* Dropdown */}
          {/* {showDropdown && results.length > 0 && (
            <ul className="dropdown-menu show " style={{
              position: "absolute",
              top: "70%",
              left: "13px",
              zIndex: 1050, 
              maxHeight: "250px",
              overflowY: "auto",
            }}>
              {results?.map((emp, idx) => (
                <li
                  key={idx}
                  className={`dropdown-item ${highlightedIndex === idx ? "active" : ""}`}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  onClick={() => {
                    setHighlightedIndex(idx);
                    handleSelect(emp)}}
                >
                  {emp.label || emp}
                </li>
              ))}
            </ul>
          )} */}
          {showDropdown &&
                      results.length > 0 && (
                        <ul className="suggestion-data">
                          {results.map((data, index) => (
                            <li
                              onClick={() => {
                                setHighlightedIndex(index);
                                handleSelect(data)
                              }}
                              className={`${ index === highlightedIndex && "matchIndex" }`}
                              key={index}
                            >
                              {data.label || data}
                            </li>
                          ))}
                        </ul>
                      )}
          {payload?.EmployeeName === "" && (
                    <span className="error-message ml-2">{errors?.EmployeeName}</span>
                  )}
          </div>
          
          {/* </div> */}
          <div className="col-xl-2 col-sm-4 col-md-6 col-12">
          <ReactSelect
            name="AuthorityType"
            id="AuthorityType"
            removeIsClearable={true}
            dynamicOptions={AuthorityTypeOptions}
            placeholderName="Authority Type"
            value={payload?.AuthorityType}
            onChange={handleSelectChange}
            className="required-fields"
            // respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          {payload?.AuthorityType === "" && (
                    <span className="error-message ml-2">{errors?.AuthorityType}</span>
                  )}
          </div>
          
          {/* {payload?.AuthorityType === "Department" && (
            <>
              <MultiSelctItems
                placeholderName="Department"
                name="Department"
                values={payload}
                setValues={setPayload}
                // dynamicOptions={dropDownApis?.citybind}
                labelKey="Department"
                valueKey="id"
                respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
              />
            </>
          )} */}
          {bindActions.length > 0 && (
           <RadioInput
            type="checkbox"
            label="Select All"
            name="selectAll"
            checked={payload.typeData.length === bindActions.length}
            onChange={handleSelectAll}
            respclass="col-xl-2 col-md-3 col-sm-4 co-12"
            className="ml-3"
          />
          )}
          {bindActions.length > 0 &&
            bindActions.map((action, idx) => {
              const typeData = `${action.TypeIDApprove}#${action.TypeName}`;
              return (
                <RadioInput
                key={idx}
                type="checkbox" // visually checkbox
                label={action.TypeName}
                name={action.TypeName.replace(/\s/g, "")}
                // checked={payload.typeData === typeData} 
                checked={payload.typeData.includes(typeData)}
                onChange={() => handleCheckbox(action)}
                respclass="col-xl-2 col-md-3 col-sm-4 co-12"
                className="ml-3"
              />
              );
            })}
          <div className="col-sm-2 d-flex justify-content-left">
            {/* <Button className="rounded py-0 ml-2" onClick={handleAdd}>
              Add
            </Button>
            <Button
              className="rounded py-0 ml-2 bg-danger"
              onClick={handleReset}
            >
              Reset
            </Button> */}
            <CustomButton text="Search" onClick={handleAdd} icon="search" className="mx-2 mb-1"/>
            <CustomButton text="Reset" onClick={handleReset} icon="refresh" className="mx-2 mb-1"/>
          </div>
          {payload?.AuthorityType === "QC" && (
            <div className="col-sm-12">
              <p
                className="text-danger text-center"
                style={{ fontStyle: "italic" }}
              >
                ILCSE - ILC Schedule Extend EQAS - EQAS Result Entry and
                Approval CAP - CAP Result Entry and Approval
              </p>
            </div>
          )}
        </div>
      {/* </Accordion> */}
      <Accordion
        title={t("All Selected Approval")}
        defaultValue={true}
        // isBreadcrumb={true}
      >
        <div className="row">
          <div className="col-sm-12">
            <CustomTable columns={columns} data={tableData} />
          </div>
        </div>
      </Accordion>
    </>
  );
};

export default ManageApprovalQuality;
