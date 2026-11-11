import React, { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { axiosInstance } from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import { GetAccessRightApproval, GetAccessRightMaster, getDepartment, getDesignationData } from "../../utils/NetworkApi/commonApi";
import Accordion from "@app/components/UI/Accordion";
import Loading from "../../components/loader/Loading";
import Input from "../../components/formComponent/Input";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import Tables from "../../components/UI/customTable";
import { Link } from "react-router-dom";
import { ExportToExcel, number, PreventNumber } from "../../utils/helpers";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { languages, searchType, Theme } from "../../utils/Constants";
import { SelectBoxWithCheckbox } from "../../components/formComponent/MultiSelectBox";
import { CustomButton } from "../../components/UI/CustomButton";
import { SelectBox } from "../../components/formComponent/SelectBox";
import Pagination from "../../Pagination/Pagination";
import ColorCodingSearch from "../../components/ModalComponent/ColorCodingSearch";

const EmployeeMaster = () => {
  const [Designation, setDesignation] = useState([]);
  const [load, setLoad] = useState(false);
  const [centre, setCentre] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [Department, setDepartment] = useState([])
  const [accessDashboards, setAccessDashboards] = useState([]);
  const [ApprovalRight, setApprovalRight] = useState([]);
  const [AccessRight, setAccessRight] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState(null);

  const [payload, setPayload] = useState({
    designationID: "",
    name: "",
    employeeID: 0,
    centreID: "0",
    approvalRightID: "",
    accessRightID: "",
    departmentID: "",
    SearchType: "employeeCode",
    ItemValue: "",
    phoneNumber: "",
    email: "",
    employeeCode: "",
    employeeName: "",
    employeeId: "",
    userName: "",
    houseNo: 0,
  });
  const [tableData, setTableData] = useState([]);

  const { t } = useTranslation();

  const colorCodingData = [
    { color: "#FFFFFF", id: "1", labelKey: "Active" },
    { color: "#f5c6cb", id: "2", labelKey: "Inactive" },
    { color: "#bbfa0d", id: "3", labelKey: "Resigned" },
    { color: "#f1384a", id: "4", labelKey: "Left" },
  ];

  // Helper to get background color based on RowStatus value
  const getRowColor = (status) => {
    const mapping = {
      Active: "#FFFFFF",
      "In Active": "#f5c6cb",
      Inactive: "#f5c6cb",
      Resign: "#bbfa0d",
      Resigned: "#bbfa0d",
      Left: "#f1384a",
    };
    return mapping[status] || "#FFFFFF";
  };

  const handleReactSelectChange = (name, value) => {
    setPayload((prev) => ({
      ...prev,
      [name]: value?.value,
    }));
  };
// phoneNumber: "",
//     email: "",
//     employeeCode: "",
//     userName: "",
//     houseNo: 0,
  const handleSelectBoxChange = (event) => {
    const { name, value, checked, type } = event?.target;
    if (name === "SearchType") {
      setPayload((prev) => ({
        ...prev,
        [name]: value,
        ItemValue: "",
        phoneNumber: "",
        email: "",
        employeeCode: "",
        employeeName: "",
        employeeId: "",
        userName: "",
        houseNo: 0,
        
      }));
    }
    else if (name === "ItemValue") {
      if (payload.SearchType === "mobileNumber") {
        setPayload((prev) => ({ ...prev, phoneNumber: value, [name] : value }));
      }
      else if (payload.SearchType === "email") {
        setPayload((prev) => ({ ...prev, email: value, [name] : value }));
      }
      else if (payload.SearchType === "employeeCode") {
        setPayload((prev) => ({ ...prev, employeeCode: value, [name] : value }));
      }
      else if (payload.SearchType === "employeeId") {
        setPayload((prev) => ({ ...prev, employeeId: value, [name] : value }));
      }
       else if (payload.SearchType === "employeeName") {
        setPayload((prev) => ({ ...prev, employeeName: value, [name] : value }));
      }
      else if (payload.SearchType === "userName") {
        setPayload((prev) => ({ ...prev, userName: value, [name] : value }));
      }
      else if (payload.SearchType === "houseNo") {
        setPayload((prev) => ({ ...prev, houseNo: value, [name] : value }));
      }
  }
  }


  console.log("Payload", payload);

  const handleChanges = (select, name) => {
    const val = select?.map((ele) => ele?.value);
    console.log("Value", val)
    setPayload({ ...payload, [name]: val });
  };


  const handleSearch = () => {
    setLoad(true);
    const finalPayload = {
      designationID:String( payload.designationID || "").replace(/^,/, ""),
      name: payload.name || "",
      EmployeeID: payload.employeeId || 0,
      centreID: String(payload.centreID) || "",
      approvalRightID: String(payload.approvalRightID || "").replace(/^,/, ""),
      accessRightID:String(payload.accessRightID || "").replace(/^,/, ""),
      departmentID: String(payload.departmentID || "").replace(/^,/, ""),
      phoneNumber: payload?.phoneNumber || "",
      email: payload?.email || "",
      employeeCode: payload?.employeeCode || "",
      Name: payload?.employeeName || "",
      userName: payload?.userName || "",
      houseNo: payload?.houseNo || "",
    };

    axiosInstance
      .post("Employee/GetEmployeeDetailsSearch", finalPayload)
      .then((res) => {
        setTableData(res.data?.message);
        setLoad(false);
        if (res.data.message.length === 0) {
          toast.error("No Data Found");
        }
      })
      .catch(() => {
        setTableData([]);
        toast.error("No Data Found");
        setLoad(false);
      });
  };

  // const GetActiveDashboard = async () => {
  //   await axiosInstance
  //     .post("ESG/GetDashboards", {
  //       dashboardName: "",
  //       isActive: 0,
  //       moduleID: 0
  //     })
  //     .then((res) => {
  //       const desList = res.data?.message?.map((ele) => ({
  //         label: ele.DashboardName,
  //         value: ele.DashboardID,
  //       }));
  //       setAccessDashboards(desList);
  //     })
  //     .catch((err) => { })
  //     .finally(() => { });
  // };
  const getAccessCentres = async (all) => {
    try {
      const res = await axiosInstance.get("Centre/getAccessCentres");
      const data = res.data.message;

      const allCentreIDs = data.map((ele) => ele.CentreID).join(",");

      const CentreDataValue = data.map((ele) => {
        return {
          value: ele.CentreID,
          label: ele.Centre,
        };
      });

      setCentre([{ label: "All", value: allCentreIDs }, ...CentreDataValue]);

      if (!payload.centreID) {
        const allCentreIDs = data.map((ele) => ele.CentreID).join(",");
        setPayload((prev) => ({
          ...prev,
          centreID: allCentreIDs,
        }));
      }
    } catch (error) {
      console.log("Error while fetching centres", error);
    }
  };


  const filteredTableData = useMemo(() => {
    let filtered = tableData;

    // Filter by status if selected
    if (selectedStatus) {
      filtered = filtered.filter((item) => {
        const itemStatus = item?.RowStatus;
        if (selectedStatus === "Active") {
          return itemStatus === "Active";
        } else if (selectedStatus === "Inactive") {
          return itemStatus === "In Active" || itemStatus === "Inactive";
        } else if (selectedStatus === "Resigned") {
          return itemStatus === "Resign" || itemStatus === "Resigned";
        } else if (selectedStatus === "Left") {
          return itemStatus === "Left";
        }
        return true;
      });
    }

    if (!searchText.trim()) {
      return filtered;
    }

    const searchLower = searchText.toLowerCase().trim();

    return filtered.filter((item) => {

      return (
        item?.Name?.toLowerCase().includes(searchLower) ||
        item?.HouseNo?.toLowerCase().includes(searchLower) ||
        item?.StreetName?.toLowerCase().includes(searchLower) ||
        item?.Locality?.toLowerCase().includes(searchLower) ||
        item?.City?.toLowerCase().includes(searchLower) ||
        item?.Pincode?.toLowerCase().includes(searchLower) ||
        item?.PHouseNo?.toLowerCase().includes(searchLower) ||
        item?.PStreetName?.toLowerCase().includes(searchLower) ||
        item?.PLocality?.toLowerCase().includes(searchLower) ||
        item?.PCity?.toLowerCase().includes(searchLower) ||
        item?.PPincode?.toLowerCase().includes(searchLower) ||
        item?.Mobile?.toLowerCase().includes(searchLower) ||
        item?.Email?.toLowerCase().includes(searchLower)
      );
    });
  }, [tableData, searchText, selectedStatus]);
    const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 50;
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const paginatedTableData = filteredTableData.slice(indexOfFirstRow, indexOfLastRow);

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredTableData]);

  useEffect(() => {
    getDesignationData(setDesignation);
    getAccessCentres();
    getDepartment(setDepartment, "getDepartmentEmployeeMaster");
    GetAccessRightApproval(setApprovalRight);
    GetAccessRightMaster(setAccessRight);

  }, []);

  useEffect(() => {
    if (Designation.length > 0) {
      setPayload((prev) => ({
        ...prev,
        DesignationID: Designation[0]?.value,
      }));
    }
  }, [Designation]);


  useEffect(() => {
    if (centre.length > 0 && payload.centreID !="0") {
      handleSearch();
    }
  }, [centre]);

  console.log("payload",payload);

  return (
    <>
      <Accordion
        name={t("EmployeeMaster")}
        defaultValue={true}
        isBreadcrumb={true}
        linkTo="/CreateEmployeeMaster"
        linkTitle={t("Create New")}
      >
        <div className="row pt-2 pl-2 pr-2 ">
          <div className="col-12 col-sm-6 col-md-3 my-1">
            <div className="d-flex" style={{ display: "flex", gap: "4px" }}>
              <div style={{ width: "40%" }}>
                <SelectBox
                  options={searchType}
                  id="SearchType"
                  lable="SearchType"
                  selectedValue={payload.SearchType}
                  name="SearchType"
                  onChange={handleSelectBoxChange}
                />
              </div>
              <div className="flex-grow-1"
              style={{ width: "50%" }}
              >
                {payload?.SearchType === "mobileNumber" ? (
                  <Input
                    type="number"
                    name="ItemValue"
                    max={10}
                    // onKeyDown={handleKeyDown}
                    value={payload.ItemValue}
                    onChange={handleSelectBoxChange}
                    onInput={(e) => number(e,10)}
                    lable=" "
                    placeholder=" "
                  />
                ) : (
                  <Input
                    type="text"
                    name="ItemValue"
                    // onKeyDown={handleKeyDown}
                    max={20}
                    value={payload.ItemValue}
                    onChange={handleSelectBoxChange}
                    lable=" "
                    placeholder=" "
                  />
                )}
              </div>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-md-2 my-1">
            <ReactSelect
              dynamicOptions={centre}
              name="centreID"
              lable={t("Centre")}
              id="centreID"
              removeIsClearable={true}
              placeholderName={t("Select Centre")}
              value={payload.centreID}
              onChange={handleReactSelectChange}
            />
          </div>
          {/* <div className="col-sm-2">
            <SelectBox
              name="DesignationID"
              lable="Designation"
              options={Designation}
              value={payload?.DesignationID}
              onChange={handleSelectChange}
              id="Designation"
            />
          </div> */}



          <div className="col-12 col-sm-6 col-md-2 my-1">
            <SelectBoxWithCheckbox
              lable="Department"
              className="required-fields"
              id="departmentID"
              placeholder=" "
              name="departmentID"
              options={Department}
              value={payload?.departmentID}
              onChange={handleChanges}
            />
            {/* {(!EmployeeMaster?.Department ||
                          EmployeeMaster?.Department?.length == 0) && (
                            <span className="error-message">{error?.Department}</span>
                          )} */}
          </div>


          <div className="col-12 col-sm-6 col-md-2 my-1">
            <SelectBoxWithCheckbox
              lable="AccessDesignation"
              className="required-fields"
              id="designationID"
              placeholder=" "
              name="designationID"
              options={Designation}
              value={payload?.designationID}
              onChange={handleChanges}
            />
            {/* {(!EmployeeMaster?.AccessDesignation ||
                          EmployeeMaster?.AccessDesignation?.length == 0) && (
                            <span className="error-message">{error?.AccessDesignation}</span>
                          )} */}
          </div>
          {/* <div className="col-sm-2">
            <SelectBoxWithCheckbox
              lable="AccessDashboard"
              className="required-fields"
              id="AccessDashboard"
              placeholder=" "
              name="AccessDashboard"
              options={accessDashboards}
              value={payload?.AccessDashboard}
              onChange={handleChanges}
            />
           
          </div> */}
          <div className="col-12 col-sm-6 col-md-2 my-1">
            <SelectBoxWithCheckbox
              // className="required-fields"
              lable="ApprovalRight"
              id="approvalRightID"
              placeholder=" "
              name="approvalRightID"
              options={ApprovalRight}
              value={payload?.approvalRightID}
              onChange={handleChanges}
            />
            {/* {(!EmployeeMaster?.ApprovalRight ||
                            EmployeeMaster?.ApprovalRight?.length == 0) && (
                            <span className="error-message">{error?.ApprovalRight}</span>
                          )} */}
          </div>
          <div className="col-12 col-sm-6 col-md-2 my-1">
            <SelectBoxWithCheckbox
              lable="AccessRight"
              className="required-fields"
              id="accessRightID"
              placeholder=" "
              name="accessRightID"
              options={AccessRight}
              value={payload?.accessRightID}
              onChange={handleChanges}
            />
            {/* <div
                          className=""
                          style={{
                            width: 'fit-content',
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            paddingBottom: "6px",
                          }}
                          onClick={() => setShowAccessHead(true)}
                        >
                          <i className="fa fa-eye"></i>
                        </div> */}

          </div>


          <div className="col-12 col-sm-6 col-md-2 my-1">
            <Input
              name="name"
              value={payload?.name}
              id="name"
              lable="Name"
              placeholder=" "
              type="text"
              max={50}
              onChange={(e) => {
                const validateValue = PreventNumber(e.target.value);
                if (validateValue !== false) {
                  setPayload({ ...payload, name: e.target.value });
                }
              }}
            />
          </div>


          <div className="col-12 col-md-auto d-flex align-items-center mb-2" style={{ gap: "8px" }}>
            {load ? (
              <Loading />
            ) : (
              <CustomButton
                text={"Search"}
                icon={"search"}
                className="btn btn-info btn-sm flex-grow-1"
                onClick={handleSearch}
              />
            )}
            <CustomButton
              icon={"download"}
              className="btn btn-success btn-sm flex-grow-1"
              text="Excel Export"
              onClick={() => ExportToExcel(tableData, "EmployeeMaster.xlsx")}
            />
          </div>
        </div>
      </Accordion>

      <Accordion
        title={t("Search Data")}
        defaultValue={true}
        notOpen={true}
        seconTitle={
          <div className="d-flex align-items-center flex-wrap" style={{ gap: "10px" }}>
            {colorCodingData.map(({ color, labelKey, id }) => (
              <div
                key={id}
                onClick={() => {
                  if (selectedStatus === labelKey) {
                    setSelectedStatus(null);
                  } else {
                    setSelectedStatus(labelKey);
                  }
                }}
              >
                <ColorCodingSearch
                  color={color}
                  label={t(labelKey)}
                  isSelected={selectedStatus === labelKey}
                />
              </div>
            ))}
            <div style={{ minWidth: "200px" }}>
              <Input
                type="text"
                placeholder="Search in table..."
                value={searchText}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => setSearchText(e.target.value)}
                removeFormGroupClass={true}
              />
            </div>
          </div>
        }
       >
        {filteredTableData.length > 0 ? (
          <>
            {/* <div className="mb-2 text-muted">
              <small>
                Showing {filteredTableData.length} of {tableData.length} records
                {searchText && ` (filtered by "${searchText}")`}
              </small>
            </div> */}
            <Tables>
              <thead className="cf">
                <tr>
                  <th>{t("S.No")}</th>
                  <th className="text-center">{t("Edit")}</th>
                  <th>{t("Name")}</th>
                  <th>{t("HouseNo")}</th>
                  <th>{t("StreetName")}</th>
                  <th>{t("Locality")}</th>
                  <th>{t("City")}</th>
                  <th>{t("Pincode")}</th>
                  <th>{t("PHouseNo")}</th>
                  <th>{t("PStreetName")}</th>
                  <th>{t("PLocality")}</th>
                  <th>{t("PCity")}</th>
                  <th>{t("PPincode")}</th>
                  <th>{t("Mobile")}</th>
                  <th>{t("Email")}</th>
                  
                </tr>
              </thead>
              <tbody>
                {paginatedTableData?.map((data, index) => (
                  <tr
                    key={index}
                    style={{
                      backgroundColor: getRowColor(data?.RowStatus),
                    }}
                  >
                    {/* <td data-title={t("S.No")}>{index + 1}&nbsp;</td>
                     */}
                     <td data-title={t("S.No")}>{indexOfFirstRow + index + 1}&nbsp;</td>
                    <td data-title={t("Action")} className="text-center">
                      <Link
                        to="/CreateEmployeeMaster"
                        state={{
                          button: "Update",
                          url1: "Employee/getEmployeeDetailsByID",
                          url2: "Employee/UpdateEmployee",
                          id: data?.EmployeeID,
                        }}
                      >
                        <i
                          className="fa fa-edit"
                          style={{ color: "#605ca8", cursor: "pointer" }}
                        ></i>
                      </Link>
                    </td>
                    <td data-title={t("Name")}>{data?.Name}&nbsp;</td>
                    <td data-title={t("HouseNo")}>{data?.HouseNo}&nbsp;</td>
                    <td data-title={t("StreetName")}>
                      {data?.StreetName}&nbsp;
                    </td>
                    <td data-title={t("Locality")}>{data?.Locality}&nbsp;</td>
                    <td data-title={t("City")}>{data?.City}&nbsp;</td>
                    <td data-title={t("Pincode")}>{data?.Pincode}&nbsp;</td>
                    <td data-title={t("PHouseNo")}>{data?.PHouseNo}&nbsp;</td>
                    <td data-title={t("PStreetName")}>
                      {data?.PStreetName}&nbsp;
                    </td>
                    <td data-title={t("PLocality")}>
                      {data?.PLocality}&nbsp;
                    </td>
                    <td data-title={t("PCity")}>{data?.PCity}&nbsp;</td>
                    <td data-title={t("PPincode")}>{data?.PPincode}&nbsp;</td>
                    <td data-title={t("Mobile")}>{data?.Mobile}&nbsp;</td>
                    <td data-title={t("Email")}>{data?.Email}&nbsp;</td>
                    
                  </tr>
                ))}
              </tbody>
            </Tables>
             {/* PAGINATION */}
                                              <div className="d-flex justify-content-end align-items-center mt-2">
                                               <Pagination
                                                  className="pagination-bar"
                                                  currentPage={currentPage}
                                                  totalCount={filteredTableData.length}
                                                  pageSize={rowsPerPage}
                                                  onPageChange={(page) => setCurrentPage(page)}
                                                />
                                              </div>
          </>
        ) : (
          <NoRecordFound />
        )}
      </Accordion>
    </>
  );
};

export default EmployeeMaster;