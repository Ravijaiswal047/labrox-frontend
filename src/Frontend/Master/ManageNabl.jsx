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
import { isChecked } from "../../utils/helpers";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { SaveButton, SearchButton } from "../../components/UI/CustomButton";
import FilterInput from "../../components/Filter/FilterInput";
const ManageNabl = () => {
  const { t } = useTranslation();
  const [CentreData, setCentreData] = useState([]);
  const [load, setLoad] = useState({
    saveLoad: false,
    searchLoad: false,
  });
  const [DepartmentData, setDepartmentData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [tableData, setTableData] = useState([]);
  const [masterTable, setMasterTable] = useState([]);
  const [checkAll, setCheckAll] = useState(0);
  const [payload, setPayload] = useState({
    CentreID: "",
    DepartmentID: "",
    InvestigationID: "",
  });

  const handleChangeDropDown = (e, index, rowData) => {
    const { name, value } = e.target;
    console.log("value", value, name);
    const data = [...tableData];

    const visibleIds = new Set(
      tableData.map((item) => item.InvestigationID)
    );

    const dropLabel = SelectAccredition.find((ele) => ele?.value === value);

    const updatedMaster = masterTable?.map((item) => {
      if (index >= 0) {
        return item.InvestigationID === rowData.InvestigationID
          ? {
            ...item,
            [name]: value,
            AccreditionName: dropLabel?.label,
          }
          : item;
      }

      return visibleIds.has(item.InvestigationID)
        ? {
          ...item,
          [name]: value,
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
      data[index]["AccreditionName"] = dropLabel?.label;
      setTableData(data);
    } else {
      const val = data.map((ele) => {
        return {
          ...ele,
          [name]: value,
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
      "TestName",
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

  const handleSearchSelectChange = (label, value) => {
    if (label === "DepartmentID") {
      setPayload({
        ...payload,
        [label]: value?.value.toString(),
        InvestigationID: "",
      });
    } else setPayload({ ...payload, [label]: value?.value.toString() });
  };

  const bindDropDown = () => {
    if (payload?.CentreID !== "" && payload?.DepartmentID !== "") {
      setLoad({ ...load, searchLoad: true });

      axiosInstance
        .post("ManageIsNablController/BindManageIsNablData", {
          ...payload,
          CentreID: payload?.CentreID,
        })
        .then((res) => {
          const data = res?.data?.message;
          if (Array.isArray(data)) {
            const updateData = res?.data?.message.map((data) => ({
              ...data,
              isActive: 0,
            }));
            setTableData(updateData);
            setMasterTable(updateData);
            setLoad({ ...load, searchLoad: false });
          } else {
            setTableData([]);
            setMasterTable([]);
            setLoad({ ...load, searchLoad: false });

            toast?.error(data ? data : "No Data Found");
          }
        })
        .catch((err) => {
          setTableData([]);
          setMasterTable([]);
          toast.error(
            err?.response?.data?.message
              ? err?.response?.data?.message
              : "error occured",
          );
          setLoad({ ...load, searchLoad: false });
        });
    } else {
      setTableData([]);
      setMasterTable([])
      toast.error("Centre Id and Department Id are required");
    }
  };

  const handleSave = () => {
    const updatedPayload = tableData.filter(
      (payload) => payload.isActive == 1 && payload.AccreditionId != "",
    );
    console.log(updatedPayload);
    if (updatedPayload.length !== 0) {
      setLoad({ ...load, saveLoad: true });
      axiosInstance
        .post("ManageIsNablController/SaveManageIsNabl", updatedPayload)
        .then((res) => {
          toast.success(res?.data?.message);
          setLoad({ ...load, saveLoad: false });
          bindDropDown();
          setCheckAll(0);
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
    // getAccessCentres(setCentreData);
    getCentreProcessingLab();
  }, []);

  const handleCheckbox = (e, ind, data) => {
    console.log("data", data);
    const { name, value, checked, type } = e.target;
    const newValue = type === "checkbox" ? (checked ? 1 : 0) : e.target.value;
    if (name === "SingleCheck") {
      const updatedMaster = masterTable?.map((item) =>
        item.InvestigationID === data.InvestigationID
          ? { ...item, isActive: newValue }
          : item
      );

      setMasterTable(updatedMaster);
      const updateData = tableData?.map((data, index) => ({
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

  console.log("masterTable", masterTable);
  console.log("tableData", tableData);

  return (
    <>
      <>
        <Accordion
          name={t("Manage NABL")}
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
            <div className="col-sm-2">
              <ReactSelect
                dynamicOptions={[
                  { label: "Select Department", value: "" },
                  ...(DepartmentData ?? []),
                ]}
                name="DepartmentID"
                lable={t("Department")}
                id="Department"
                removeIsClearable={true}
                placeholderName={t("Select Department")}
                className="required-fields"
                value={payload?.DepartmentID}
                onChange={handleSearchSelectChange}
              />
            </div>
            <div className="col-sm-1">
              <SearchButton
                text={"Search"}
                type="submit"
                className="btn-block"
                onClick={bindDropDown}
              />
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
                        <th>{t("Investigation")}</th>

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
                                  "1",
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
                      {tableData?.map((data, index) => (
                        <tr key={index}>
                          <td data-title={t("S No.")}>{index + 1}&nbsp;</td>
                          <td data-title={t("Department")}>
                            {data?.Department}&nbsp;
                          </td>
                          <td data-title={t("Investigation")}>
                            {data?.TestName}&nbsp;
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
                      <SaveButton
                        text={"Save"}
                        onClick={handleSave}
                      />
                    </div>
                  )}
                </div>
              </>

            }
          </>
        ) : (
          <Loading />
        )}
        {/* </Accordion> */}
        {/* )} */}
      </>
    </>
  );
};

export default ManageNabl;
