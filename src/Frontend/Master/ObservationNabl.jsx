import React, { useState } from "react";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { SelectAccredition } from "../../utils/Constants";
import { getAccessCentres } from "../../utils/NetworkApi/commonApi";
import Loading from "../../components/loader/Loading";
import Accordion from "@app/components/UI/Accordion";
import Tables from "../../components/UI/customTable";
import { axiosInstance } from "../../utils/axiosInstance";
import { SelectBox } from "../../components/formComponent/SelectBox";
import { AddBlankData, isChecked } from "../../utils/helpers";
import ReactSelect from "../../components/formComponent/ReactSelect";
import Input from "../../components/formComponent/Input";
import UploadFile from "../utils/UploadFileModal/UploadFile";
import { guidNumber } from "../util/Commonservices";
import FilterInput from "../../components/Filter/FilterInput";
const ObservationNabl = () => {
  const { t } = useTranslation();
  const [CentreData, setCentreData] = useState([]);
  const [load, setLoad] = useState({
    saveLoad: false,
    searchLoad: false,
  });
  const [DepartmentData, setDepartmentData] = useState([]);
  const [mapTest, setMapTest] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [masterTable, setMasterTable] = useState([]);
  const [checkAll, setCheckAll] = useState(0);
  const [show1, setShow1] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [payload, setPayload] = useState({
    CentreID: "",
    DepartmentID: 0,
    InvestigationID: "",
    TestName: "",
  });

  console.log({ checkAll });

  const handleChangeDropDown = (e, index, rowData) => {
    const { name, value } = e.target;
    const isNablValue = value === "2" ? "Yes" : "NO";
    console.log({ isNablValue });
    const visibleIds = new Set(
      tableData.map((item) => item.InvestigationID)
    );
    const data = [...tableData];
    const dropLabel = SelectAccredition.find((ele) => ele?.value === value);

    const updatedMaster = masterTable?.map((item) => {
      if (index >= 0) {
        return item.InvestigationID === rowData.InvestigationID
          ? {
            ...item,
            [name]: value,
            IsNABL: isNablValue,
            AccreditionName: dropLabel?.label,
          }
          : item;
      }

      return visibleIds.has(item.InvestigationID)
        ? {
          ...item,
          [name]: value,
          IsNABL: isNablValue,
          AccreditionName: dropLabel?.label,
        }
        : item;

      // All rows case
      // return {
      //   ...item,
      //   [name]: value,
      //   AccreditionName: dropLabel?.label,
      // };
    });
    setMasterTable(updatedMaster);
    console.log("dropLabel", dropLabel);
    if (index >= 0) {
      data[index][name] = value;
    data[index]["IsNABL"] = isNablValue;
      data[index]["AccreditionName"] = dropLabel?.label;
      setTableData(data);
    } else {
      const val = data.map((ele) => {
        return {
          ...ele,
          [name]: value,
          IsNABL: isNablValue,
          AccreditionName: dropLabel?.label,
        };
      });
      setTableData(val);
    }
  };

  const handleChangeSearch = (e) => {
    console.log("handlesearch", e.target.value);
    const value = e.target.value.toLowerCase();
    setSearchTerm(e.target.value);

    if (!value) {
      setTableData(masterTable);
      return;
    }

    const searchableKeys = [
      "Department",
      "ObservationName",
    ];

    const filtered = masterTable?.filter((row) =>
      searchableKeys.some((key) =>
        String(row[key] || "")
          .toLowerCase()
          .includes(value),
      ),
    );

    setTableData(filtered);
  };


  console.log(tableData);
  const getDepartment = () => {
    axiosInstance
      .get("Department/getDepartmentData")
      .then((res) => {
        let data = res.data.message;
        let DeptDataValue = data.map((ele) => {
          return {
            value: ele.DepartmentID,
            label: ele.Department,
          };
        });
        setDepartmentData(DeptDataValue);
        DeptDataValue.unshift({ label: "All Department", value: 0 });
      })
      .catch((err) => console.log(err));
  };

  console.log({ DepartmentData });
  const getInvestigationList = () => {
    axiosInstance
      .get("Investigations/BindInvestigationList")
      .then((res) => {
        let data = res.data.message;

        let MapTest = data.map((ele) => {
          return {
            value: ele.InvestigationID,
            label: ele.TestName,
          };
        });

        setMapTest(MapTest);
        MapTest.unshift({ label: "All Test", value: "" });
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    if (payload?.DepartmentID == 0) {
      getInvestigationList();
    }
  }, []);
  console.log({ payload });
  const getDepartmentWiseTest = (id) => {
    axiosInstance
      .post("CommonController/DepartmentWiseItemList", {
        DepartmentID: id,
        TestName: "",
      })
      .then((res) => {
        let data = res.data.message;
        let TestData = data.map((ele) => {
          return {
            value: ele.InvestigationID,
            label: ele.TestName,
          };
        });
        setMapTest(TestData);
        TestData.unshift({ label: "All Test", value: "" });
      })
      .catch((err) => console.log(err));
  };

   const getCentreProcessingLab = () => {
        axiosInstance
          .get("ManageIsNablController/CentreProcessingLabNABL")
          .then((res) => {
            let data = res.data.message;
            let CentreLab = data.map((ele) => {
              return {
                value: ele.centreID,
                label: ele.ProcessingLab,
              };
            });
            setCentreData(CentreLab);
          })
          .catch((err) => console.log(err));
      };
  

  console.log({ mapTest });

  useEffect(() => {
       if(payload?.CentreID) bindDropDown();
    }, [payload?.CentreID, payload?.DepartmentID, payload?.InvestigationID]);

  const handleSearchSelectChange = (label, value) => {
    console.log({ label, value });
    if (label === "DepartmentID") {
      setPayload({
        ...payload,
        [label]: value?.value,
        InvestigationID: "",
      });
      if (value?.value) {
        getDepartmentWiseTest(value?.value);
      } else {
        getInvestigationList();
      }
    } else if (label === "InvestigationID") {
      setPayload({ ...payload, [label]: String(value?.value) });
    } else {
      setPayload({ ...payload, [label]: value?.value });
    }
  };

  const bindDropDown = () => {
    if (
      payload?.CentreID !== ""
    ) {
        setLoad({...load, searchLoad: true})
      axiosInstance
        .post("ManageIsNablController/getObservationNablDetail", {
          ...payload,
          CentreID: payload?.CentreID,
          TestName: payload?.TestName?.trim(),
        })
        .then((res) => {
          const data = res?.data?.message;
          if (data?.length > 0) {
            const updateData = res?.data?.message.map((data) => ({
              ...data,
              AccreditionId: data?.IsNABL === "Yes" ? "2" : "1",
              AccreditionName: data?.IsNABL === "Yes" ? "NABL" : "NA",
              isActive: 0,
              centreIDHash : data?.centreIDHash ? data?.centreIDHash : guidNumber()
            }));
            setTableData(updateData);
            setMasterTable(updateData);
            setLoad({ ...load, searchLoad: false });
          } else {
            setTableData([]);
            setMasterTable([]);
            setLoad({ ...load, searchLoad: false });
            toast?.error("No Record Found");
          }
        })
        .catch((err) => {
          setTableData([]);
          setMasterTable([]);
          toast.error(
            err?.response?.data?.message
              ? err?.response?.data?.message
              : "error occured"
          );
          setLoad({ ...load, searchLoad: false });
        });
    } else {
      setTableData([]);
      setMasterTable([]);
      toast.error("Centre Id is required");
    }
  };

console.log({load})
console.log("tableData", tableData);

useEffect(() => {
  const delayDebounce = setTimeout(() => {
    if (payload?.TestName.length > 2) {
      bindDropDown();
    }
  }, 500);
  return () => clearTimeout(delayDebounce); 
}, [payload?.TestName]);

  const handleSave = () => {
    const updatedPayload = tableData.filter(
      (payload) => payload.isActive == 1 && payload.AccreditionId != ""
    ) .map((item) => ({
      labObservationID: item.labObservationID.toString(),
      IsNABL: item.AccreditionId === "2" ? 2 : 0,
      CentreID: payload?.CentreID,
      SubcategoryID : item?.departmentid.toString(),
    }));
    if (updatedPayload.length !== 0) {
      setLoad({ ...load, saveLoad: true });
      axiosInstance
        .post("ManageIsNablController/SaveObservationNABL", updatedPayload)
        .then((res) => {
          if (res?.data?.success) {
            toast.success(res?.data?.message);
            setLoad({ ...load, saveLoad: false });
            bindDropDown();
            setCheckAll(0);
          } else {
            toast?.error(res?.data?.message);
            setLoad({ ...load, saveLoad: false });
          }
        })
        .catch((err) => {
          console.log(
            err?.response?.data?.message
              ? err?.response?.data?.message
              : "Error Occured",
          );
          setLoad({ ...load, saveLoad: false });
        });
    } else {
      toast.error("please select any Accredentials to update");
    }
  };

  useEffect(() => {
    getDepartment();
    getCentreProcessingLab();
  }, []);

  const handleCheckbox = (e, ind, data) => {
    // console.log("data",data);
    const { name, value, checked, type } = e.target;
    const newValue = type === "checkbox" ? (checked ? 1 : 0) : e.target.value;
    if (name === "SingleCheck") {
      const updatedMaster = masterTable?.map((item) =>
        item.InvestigationID === data.InvestigationID
          ? { ...item, isActive: newValue }
          : item
      );

      setMasterTable(updatedMaster);
      const updateData = tableData.map((data, index) => ({
        ...data,
        isActive:
          ind === index && type === "checkbox"
            ? checked
              ? 1
              : 0
            : data?.isActive,
      }));
      setTableData(updateData);
    } else if (name === "AllCheck") {
      setLoad({ ...load, searchLoad: false });

      setCheckAll(type === "checkbox" ? (checked ? 1 : 0) : value);
      const visibleIds = new Set(
        tableData.map((item) => item.InvestigationID)
      );

      // update ONLY visible rows in master table
      const updatedMaster = masterTable.map((item) =>
        visibleIds.has(item.InvestigationID)
          ? { ...item, isActive: newValue }
          : item
      );

      setMasterTable(updatedMaster);
      const updateData = tableData.map((data) => ({
        ...data,
        isActive: type === "checkbox" ? (checked ? 1 : 0) : value,
      }));
      setTableData(updateData);
    }
  };
  // const fetchRateTypes = async (id) => {
  //   try {
  //     const res = await axiosInstance.post("Centre/GetRateType", {
  //       CentreId: [id],
  //     });
  //     const list = res?.data?.message.map((item) => ({
  //       label: item?.RateTypeName,
  //       value: item?.RateTypeID,
  //     }));
  //     setRateTypes(list);
  //   } catch (err) {
  //     console.log(err);
  //   }
  // };

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log({ name, value });
    setPayload({
      ...payload,
      [name]: value,
    });
  };
  return (
    <>
      <>
        {show1 && (
          <UploadFile
            show={show1}
            handleClose={() => setShow1(false)}
            documentId={tableData[0]?.centreIDHash}
            pageName={"ObservationNabl"}
            CentreID={payload?.CentreID}
          />
        )}
        <Accordion
          name={t("Manage Observation wise NABL")}
          isBreadcrumb={true}
          defaultValue={true}
        >
          <div className="row pt-2 pl-2 pr-2 mt-1">
            <div className="col-sm-2">
              <ReactSelect
                dynamicOptions={[
                  { label: "Select Centre", value: "" },
                  ...(CentreData ?? []),
                ]}
                name="CentreID"
                lable={t("Select Centre")}
                id="CentreID"
                removeIsClearable={true}
                placeholderName={t("Select Centre")}
                value={payload?.CentreID}
                className="required-fields"
                onChange={handleSearchSelectChange}
              />
            </div>

            <div className="col-sm-2 col-4">
              <ReactSelect
                //   dynamicOptions={AddBlankData(DepartmentData, "All Department")}
                dynamicOptions={DepartmentData}
                name="DepartmentID"
                lable={t("Department")}
                id="Department"
                removeIsClearable={true}
                placeholderName={t("All Department")}
                value={payload?.DepartmentID}
                onChange={handleSearchSelectChange}
              />
            </div>
            <div className="col-sm-2">
              <ReactSelect
                dynamicOptions={mapTest}
                removeIsClearable={true}
                name="InvestigationID"
                lable="Test"
                id="InvestigationID"
                placeholderName="All Test"
                value={payload?.InvestigationID}
                onChange={handleSearchSelectChange}
              />{" "}
            </div>
            <div className="col-sm-2 col-md-2">
              <Input
                lable={("ObservationName")}
                id="TestName"
                placeholder=" "
                type="text"
                onChange={handleChange}
                value={payload?.TestName}
                name="TestName"
              />
            </div>
            {/* <div className="col-sm-2">
              <button
                className="btn btn-info btn-sm btn-block"
                id="btnUpload"
                onClick={() => {
                  if (payload?.CentreID) {
                    setShow1(true);
                  } else {
                    toast?.error("Centre is Required");
                    setShow1(false);
                  }
                }}
              >
                {t("Upload isNabl")}
              </button>
            </div> */}
            <div className="col-sm-1">
              <button
                type="submit"
                className="btn btn-block btn-info btn-sm"
                onClick={bindDropDown}
              >
                {t("Search")}
              </button>
            </div>
          </div>
        </Accordion>
        {/* {tableData?.length > 0 && ( */}
          <Accordion title={"Search Data"} defaultValue={true}
          seconTitle={
            <>
              <div className="col-sm-12 d-flex justify-content-end gap-custom p-0">
                <FilterInput
                  value={searchTerm}
                  onChange={handleChangeSearch}
                  placeholder="Filter Table"
                // inputClass="transparent-background"
                />
              </div>
            </>
          }
          />
            {!load?.searchLoad ? (
              <>
              {tableData?.length > 0 &&
              <>
                <div
                  style={{
                    maxHeight: "410px",
                    overflowY: "auto",
                  }}
                >
                  <Tables>
                    <thead>
                      <tr>
                        <th>{t("S No.")}</th>
                        <th>{t("Department")}</th>
                        <th>{t("ObservationName")}</th>

                        <th>
                          <select
                            disabled={checkAll === 0 ? true : false}
                            className="form-control ui-autocomplete-input input-sm mb-1"
                            onChange={handleChangeDropDown}
                            name="AccreditionId"
                          >
                            {SelectAccredition.map((data, index) => (
                              <option value={data?.value} key={index}>
                                {data?.label}
                              </option>
                            ))}
                          </select>
                        </th>
                        <th>
                          <input
                            type="checkbox"
                            name="AllCheck"
                            checked={
                              tableData.length > 0
                                ? isChecked(
                                    "isActive",
                                    tableData,
                                    "1"
                                  ).includes(false)
                                  ? false
                                  : true
                                : false
                            }
                            onChange={handleCheckbox}
                          />
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableData.map((data, index) => (
                        <tr key={index}>
                          <td data-title={t("S No.")}>{index + 1}&nbsp;</td>
                          <td data-title={t("Department")}>
                            {data?.Department}&nbsp;
                          </td>
                          <td data-title={t("ObservationName")}>
                            {data?.ObservationName}&nbsp;
                          </td>
                          <td data-title={t("AccreditionId")}>
                            <select
                              disabled={data.isActive === 0 ? true : false}
                              className="form-control ui-autocomplete-input input-sm"
                              value={data?.AccreditionId}
                              name="AccreditionId"
                              onChange={(e) => handleChangeDropDown(e, index, data)}
                            >
                              {SelectAccredition.map((data, index) => (
                                <option value={data?.value} key={index}>
                                  {data?.label}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <input
                              type="checkbox"
                              name="SingleCheck"
                              checked={data?.isActive === 0 ? false : true}
                              onChange={(e) => handleCheckbox(e, index, data)}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Tables>
                </div>
                <div className="row mt-2 ml-1 mb-1">
                  {load?.saveLoad ? (
                    <Loading />
                  ) : (
                    <div className="col-sm-1">
                      <button
                        type="button"
                        className="btn btn-success btn-block btn-sm"
                        onClick={handleSave}
                      >
                        {t("Save")}
                      </button>
                    </div>
                  )}
                </div>
              </>
            }
            </>
            ) : (
              <Loading />
            )}
          
        {/* )} */}
      </>
    </>
  );
};

export default ObservationNabl;
