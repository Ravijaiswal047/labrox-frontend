import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { axiosInstance } from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import Accordion from "@app/components/UI/Accordion";
import Input from "../../components/formComponent/Input";
import { SelectBoxWithCheckbox } from "../../components/formComponent/MultiSelectBox";
import Loading from "../../components/loader/Loading";
import Tables from "../../components/UI/customTable";
import Pagination from "../../Pagination/Pagination";
import MultiSelectComp from "../../components/formComponent/MultiSelectComp";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
let PageSize = 5;
const AuthorityType = [
  {
    label: "Coupon",
    value: "Coupon",
  },
];

const CouponManageApproval = () => {
  const [formData, setFromData] = useState({
    EmployeeID: "",
    AppRightFor: "Coupon",
    Active: "1",

    Maker: 0,
    Checker: 0,
    Approval: 0,
    Reject: 0,
    StatusChange: 0,
    Edit: 0,
    NotApproval: 0,
    TypeData: [],
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [employeeSuggestion, setEmployeeSuggestion] = useState([]);
  const [dropFalse, setDropFalse] = useState(false);
  const [load, setLoad] = useState(false);
  const [indexMatch, setIndexMatch] = useState(0);
  const [employee, setEmployee] = useState({ name: "" });
  const [searchList, setListsearch] = useState([]);

  const handleIndex = (e) => {
    switch (e.which) {
      case 38:
        if (indexMatch !== 0) {
          setIndexMatch(indexMatch - 1);
        } else {
          setIndexMatch(employeeSuggestion.length - 1);
        }
        break;
      case 40:
        if (employeeSuggestion.length - 1 === indexMatch) {
          setIndexMatch(0);
        } else {
          setIndexMatch(indexMatch + 1);
        }
        break;
      case 13:
        if (employeeSuggestion.length > 0) {
          handleListSearch(employeeSuggestion[indexMatch]);
        }
        setIndexMatch(0);
        break;
      default:
        break;
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFromData({
      ...formData,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    });
  };
  const currentTableData = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * PageSize;
    const lastPageIndex = firstPageIndex + PageSize;
    return searchList.slice(firstPageIndex, lastPageIndex);
  }, [currentPage, searchList]);

  const handleSave = () => {
    if (!formData?.EmployeeID) {
      toast.error("Please Select Any Employee");
    } else if (formData?.TypeData.length == 0) {
      toast.error("Please Select Atleast One Approval Type");
    } else {
      setLoad(true);
      axiosInstance
        .post("ManageApproval/SaveApprovalRight", formData)
        .then((res) => {
          setLoad(false);
          toast.success("Rights Added Successfully");
          handleSearch();
          setFromData({ ...formData, EmployeeID: "", TypeData: [] });
          setEmployee({ ...employee, name: "" });
        })
        .catch((err) => {
          setLoad(false);
          toast.error(
            err?.response?.data?.message
              ? err?.response?.data?.message
              : "Error Occured",
          );
        });
    }
  };


  const handleReport = () => {
    setLoad(true);
    axiosInstance
      .get("ManageApproval/exportToExcel")
      .then((res) => {
        const data = res?.data?.message;

        if (!data || data.length === 0) {
          toast.error("No data found");
          return;
        }
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Approval Report");
        const excelBuffer = XLSX.write(workbook, {
          bookType: "xlsx",
          type: "array",
        });
        const blob = new Blob([excelBuffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
        });
        saveAs(blob, "Approval_Report.xlsx");
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Error Occurred"
        );
      })
      .finally(() => {
        setLoad(false);   // ✅ Always runs (success ya error dono me)
      });
  };
  const handleListSearch = (data) => {
    console.log(data);
    setFromData({ ...formData, EmployeeID: data.value });
    setEmployee({ ...employee, name: data.label });
    setIndexMatch(0);
    setEmployeeSuggestion([]);
    setDropFalse(false);
  };
  console.log(searchList);

  const getEmployeeSuggestion = () => {
    axiosInstance
      .post("ManageApproval/SearchEmployee", {
        Name: employee.name,
      })
      .then((res) => {
        console.log(res?.data?.message);
        if (res?.data?.message?.length > 0) {
          const sugestion = res?.data?.message.map((ele) => {
            return {
              value: ele?.VALUE,
              label: ele?.label,
            };
          });
          console.log(sugestion);
          setEmployeeSuggestion(sugestion);
        } else {
          setTimeout(() => {
            setEmployeeSuggestion([]);
          }, 100);
        }
      })
      .catch((err) => console.log(err));
  };
  useEffect(() => {
    getEmployeeSuggestion();
  }, [employee.name]);

  const handleRemove = (ApprightID) => {
    console.log(ApprightID);
    axiosInstance
      .post("ManageApproval/removeManageApproval", {
        AppRightID: ApprightID,
      })
      .then((res) => {
        toast.success("Right Removed Successfully");
        handleSearch();
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Error Occured",
        );
      });
  };
  console.log(searchList);
  const handleSearch = () => {
    axiosInstance
      .get("ManageApproval/bindManageApproval")
      .then((res) => {
        setListsearch(res?.data?.message);
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Error Occured",
        );
      });
  };
  useEffect(() => {
    handleSearch();
  }, []);
  const handleSelectMultiChange = (name, value) => {
    if (name === "TypeData") {
      setFromData({ ...formData, [name]: value });
    }
  };

  const { t } = useTranslation();
  const VerificationData = [
    { label: "Maker", value: "0#Maker" },
    { label: "Checker", value: "1#Checker" },
    { label: "Approval", value: "2#Approval" },
    { label: "Reject", value: "3#Reject" },
    { label: "StatusChange", value: "4#StatusChange" },
    { label: "Edit", value: "5#Edit" },
    {
      label: "NotApproval",
      value: "6#NotApproval",
    },
  ];

  return (
    <>
      <Accordion
        name={t("Coupon Manage Approval")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row pt-2 pl-2 pr-2">
          <div className="col-sm-2">
            <Input
              autoComplete="off"
              className="required-fields"
              type="text"
              onKeyDown={handleIndex}
              placeholder=""
              name="name"
              lable="Employee Name"
              value={employee?.name}
              onChange={(e) => {
                console.log(e?.target?.value);
                if (e.target.value == "") {
                  setEmployee({ ...employee, name: "" });
                  setDropFalse(false);
                } else {
                  setEmployee({ ...employee, name: e?.target.value });
                  setFromData({ ...formData, EmployeeID: "" });
                  setDropFalse(true);
                }
              }}
            />
            {dropFalse && employeeSuggestion?.length > 0 && (
              <ul className="suggestion-data">
                {employeeSuggestion.map((data, index) => (
                  <li
                    onClick={() => handleListSearch(data)}
                    className={`${index === indexMatch && "matchIndex"}`}
                    key={index}
                  >
                    {data?.label}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="col-sm-2">
            <MultiSelectComp
              className="required-fields"
              options={[...VerificationData]}
              onChange={handleSelectMultiChange}
              name="TypeData"
              label="Verification Type"
              value={formData?.TypeData}
            />
          </div>
          <div className="col-md-1 col-sm-6 col-xs-12">
            {load ? (
              <Loading />
            ) : (
              <button
                type="button"
                className="btn btn-block btn-success btn-sm"
                onClick={handleSave}
              >
                {t("Add")}
              </button>
            )}
          </div>
          <div className="col-md-1 col-sm-6 col-xs-12">
            {load ? (
              <Loading />
            ) : (
              <button
                type="button"
                className="btn btn-block btn-primary btn-sm"
                onClick={handleReport}
              >
                {t("Report")}
              </button>
            )}
          </div>
        </div>
      </Accordion>
      <Accordion title={t("Search Data")} defaultValue={true}>
        {searchList.length > 0 && (
          <Tables>
            <thead className="cf text-center" style={{ zIndex: 99 }}>
              <tr>
                <th className="text-center">{t("Employee Name")}</th>
                <th className="text-center">{t("Authority Type")}</th>
                <th className="text-center">{t("Approval")}</th>
                <th className="text-center">{t("Created By")}</th>
                <th className="text-center">{t("Created Date")}</th>
                <th className="text-center">{t("Remove")}</th>
              </tr>
            </thead>
            <tbody>
              {searchList.map((item, index) => (
                <tr key={index}>
                  <td data-title="Employee Name" className="text-center">
                    {item?.EmployeeName}&nbsp;
                  </td>
                  <td data-title="Authority Type" className="text-center">
                    {item?.AppRightFor}&nbsp;
                  </td>
                  <td data-title="Approval" className="text-center">
                    {item?.TypeName} &nbsp;
                  </td>
                  <td data-title="Created By" className="text-center">
                    {item?.CreatedBy} &nbsp;
                  </td>
                  <td data-title="Created Date" className="text-center">
                    {item?.CreatedDate} &nbsp;
                  </td>
                  <td data-title="Remove" className="text-center">
                    &nbsp;
                    <span
                      style={{
                        fontSize: "13px",
                        color: "#8B0000",
                        fontWeight: "bold",
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        handleRemove(item?.ApprightID);
                      }}
                    >
                      X
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </Tables>
        )}
        {/* {
          <Pagination
            className="pagination-bar"
            currentPage={currentPage}
            totalCount={searchList.length}
            pageSize={PageSize}
            onPageChange={(page) => setCurrentPage(page)}
          />
        } */}
      </Accordion>
    </>
  );
};

export default CouponManageApproval;
