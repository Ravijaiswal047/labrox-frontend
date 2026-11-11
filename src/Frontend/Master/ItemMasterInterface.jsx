import React, { useEffect, useMemo, useState } from "react";
import Accordion from "@app/components/UI/Accordion";
import { useTranslation } from "react-i18next";
import Input from "../../components/formComponent/Input";
import Tables from "../../components/UI/customTable";
import Loading from "../../components/loader/Loading";
import { axiosInstance } from "../../utils/axiosInstance";
import { Link, useLocation } from "react-router-dom";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { toast } from "react-toastify";
import { ItemMasterInterfaceValidationSchema } from "../../utils/Schema";
import { SelectBox } from "../../components/formComponent/SelectBox";
import Pagination from "../../Pagination/Pagination";
import { Record } from "../../utils/Constants";

const ItemMasterInterface = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [companyInterface, setCompanyInterface] = useState([]);
  const [department, setDepartment] = useState([]);
  const [test, setTest] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [errors, setErrors] = useState({});
  const [payload, setPayload] = useState({
    InterfaceCompany: "",
    Department: "",
    Test: "",
    TestCode: "",
    InterfaceTestCode: "",
    InterfaceTestName: "",
    IsActive: 1,
    IsUpdate: 0,
    ID: "0",
  });
  const [PageSize, setPageSize] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentData, setCurrentData] = useState([]);

  useEffect(() => {
    const firstPageIndex = (currentPage - 1) * PageSize;
    const lastPageIndex = firstPageIndex + PageSize;
    const paginatedData = tableData.slice(firstPageIndex, lastPageIndex);
    setCurrentData(paginatedData);
  }, [currentPage, PageSize, tableData]);

  const handleSearchSelectChange = (label, value) => {
    if (label == "Department") {
      setPayload({
        ...payload,
        [label]: value?.value,
        Test: "",
      });
      getDepartmentWiseItemList(value?.value);
    } else if (label == "Test") {
      setPayload({
        ...payload,
        [label]: value?.value,
        TestCode: getFilteredName(value?.value, test, "TestCode"),
      });
    } else {
      setPayload({
        ...payload,
        [label]: value?.value,
      });
    }
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPayload({
      ...payload,
      [name]: value,
    });
  };
  const handleUpdate = (ele) => {
    getDepartmentWiseItemList(ele?.Departmentid);
    setPayload({
      Test: ele?.ItemID,
      TestCode: ele?.TestCode,
      InterfaceTestCode: ele?.ItemID_interface,
      InterfaceTestName: ele?.ItemName_interface,
      InterfaceCompany: ele?.Interface_companyName,
      IsActive: ele?.isActive,
      IsUpdate: 1,
      Department: ele?.Departmentid,
      ID: ele?.ID?.toString(),
    });
  };
  const handleStatusUpdate = (ele) => {
    const items = [
      {
        ItemID: ele?.ItemID?.toString(),
        TestCode: ele?.TestCode,
        ItemID_interface: ele?.ItemID_interface,
        ItemName_interface: ele?.ItemName_interface,
        Interface_companyName: ele?.Interface_companyName,
        IsActive: ele?.isActive == 1 ? 0 : 1,
        IsUpdate: 1,
        ID: ele?.ID?.toString(),
      },
    ];
    setLoading(true);
    axiosInstance
      .post("ItemMasterInterface/SaveItemMasterInterface", { items: items })
      .then((res) => {
        if (res?.data?.success) {
          toast.success(res?.data?.message);
          setPayload({
            InterfaceCompany: "",
            Department: "",
            Test: "",
            TestCode: "",
            InterfaceTestCode: "",
            InterfaceTestName: "",
            IsActive: 1,
            IsUpdate: 0,
            ID: "0",
          });

          getItems();
        } else {
          toast.error(res?.data?.message);
        }
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        toast.error("Error Occured");
      });
  };
  const handleSubmit = () => {
    const generatedError = ItemMasterInterfaceValidationSchema(payload);
    if (generatedError === "") {
      setLoading(true);
      setErrors({});
      const items = [
        {
          ItemID: payload?.Test.toString(),
          TestCode: payload?.TestCode,
          ItemID_interface: payload?.InterfaceTestCode,
          ItemName_interface: payload?.InterfaceTestName,
          Interface_companyName: payload?.InterfaceCompany,
          IsActive: 1,
          IsUpdate: payload?.IsUpdate,
          ID: payload?.ID,
        },
      ];
      axiosInstance
        .post("ItemMasterInterface/SaveItemMasterInterface", { items: items })
        .then((res) => {
          if (res?.data?.success) {
            toast.success(res?.data?.message);
            setPayload({
              InterfaceCompany: "",
              Department: "",
              Test: "",
              TestCode: "",
              InterfaceTestCode: "",
              InterfaceTestName: "",
              IsActive: 1,
              IsUpdate: 0,
              ID: "0",
            });

            getItems();
          } else {
            toast.error(res?.data?.message);
          }
          setLoading(false);
        })
        .catch((err) => {
          setLoading(false);
          toast.error(err?.response?.data?.message);
        });
    } else {
      setErrors(generatedError);
      setLoading(false);
    }
  };
  const getDepartments = () => {
    axiosInstance
      .get("Department/getDepartmentEmployeeMaster")
      .then((res) => {
        const data = res?.data?.message;
        const val = data.map((ele) => {
          return {
            value: ele?.DepartmentID,
            label: ele?.Department,
          };
        });
        setDepartment(val);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  console.log(payload);
  const getDepartmentWiseItemList = (id) => {
    axiosInstance
      .post("CommonController/DepartmentWiseItemList", {
        DepartmentID: id,
        TestName: "",
      })
      .then((res) => {
        if (res?.data?.success) {
          const data = res?.data?.message;
          const val = data.map((ele) => {
            return {
              label: ele?.TestName,
              value: ele?.InvestigationID,
              TestCode: ele?.TestCode,
            };
          });
          setTest(val);
        } else {
          setTest([]);
        }
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Error Occured",
        );
      });
  };
  const getFilteredName = (id, state, name) => {
    const data = state?.filter((ele) => ele?.value == id);

    return data[0][name];
  };
  const getInterfaceCompany = () => {
    axiosInstance
      .get("ItemMasterInterface/BindInterfaceCompany")
      .then((res) => {
        const data = res?.data?.message;
        const val = data.map((ele) => {
          return {
            value: ele?.CompanyName,
            label: ele?.CompanyName,
          };
        });
        setCompanyInterface(val);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const getItems = () => {
    axiosInstance
      .get("ItemMasterInterface/GetItemMasterInterface")
      .then((res) => {
        const data = res?.data?.message;
        setTableData(data);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  useEffect(() => {
    getInterfaceCompany();
    getDepartments();
    getItems();
  }, []);
  return (
    <>
      <Accordion
        name={t("Item Master Interface")}
        isBreadcrumb={true}
        defaultValue={true}
      >
        <div className="row pt-2 pl-2 pr-2 mt-1">
          <div className="col-sm-2">
            <ReactSelect
              className="required-fields"
              dynamicOptions={companyInterface}
              removeIsClearable={true}
              name="InterfaceCompany"
              lable="Interface Company"
              id="InterfaceCompany"
              placeholderName="Interface Company"
              value={payload?.InterfaceCompany}
              onChange={handleSearchSelectChange}
            />
            {payload?.InterfaceCompany === "" && (
              <span className="error-message">{errors?.InterfaceCompany}</span>
            )}
          </div>
          <div className="col-sm-2">
            <ReactSelect
              className="required-fields"
              dynamicOptions={department}
              removeIsClearable={true}
              name="Department"
              lable="Department"
              id="Department"
              placeholderName="Department"
              value={payload?.Department}
              onChange={handleSearchSelectChange}
            />{" "}
            {payload?.Department === "" && (
              <span className="error-message">{errors?.Department}</span>
            )}
          </div>
          <div className="col-sm-2">
            <ReactSelect
              className="required-fields"
              dynamicOptions={test}
              removeIsClearable={true}
              name="Test"
              lable="Test"
              id="Test"
              placeholderName="Test"
              value={payload?.Test}
              onChange={handleSearchSelectChange}
            />{" "}
            {payload?.Test === "" && (
              <span className="error-message">{errors?.Test}</span>
            )}
          </div>
          <div className="col-sm-2">
            <Input
              className="required-fields"
              lable="Interface TestCode"
              id="InterfaceTestCode"
              placeholder=" "
              onChange={handleChange}
              name="InterfaceTestCode"
              max={50}
              value={payload?.InterfaceTestCode}
            />{" "}
            {payload?.InterfaceTestCode === "" && (
              <span className="error-message">{errors?.InterfaceTestCode}</span>
            )}
          </div>
          <div className="col-sm-2 d-none">
            <Input
              className="required-fields"
              lable="Interface TestName"
              id="InterfaceTestName"
              placeholder=" "
              onChange={handleChange}
              name="InterfaceTestName"
              max={50}
              value={payload?.InterfaceTestName}
            />{" "}
            {payload?.InterfaceTestName === "" && (
              <span className="error-message">{errors?.InterfaceTestName}</span>
            )}
          </div>
          <div className="col-md-1">
            {loading ? (
              <Loading />
            ) : (
              <button
                type="button"
                className={`btn btn-block ${
                  payload?.IsUpdate ? "btn-success" : "btn-success"
                } btn-sm`}
                onClick={handleSubmit}
              >
                {payload?.IsUpdate ? t("Update") : t("Save")}
              </button>
            )}
          </div>
          <div className="col-md-1">
            <button
              className="btn btn-block btn-sm btn-success"
              onClick={() => {
                setErrors({});
                setPayload({
                  InterfaceCompany: "",
                  Department: "",
                  Test: "",
                  InterfaceTestCode: "",
                  InterfaceTestName: "",
                  IsActive: 1,
                  IsUpdate: 0,
                  ID: "0",
                });
              }}
            >
              {t("Reset")}
            </button>
          </div>
        </div>
      </Accordion>
      <Accordion title={"Search Data"} defaultValue={true}>
        {loading ? (
          <Loading />
        ) : (
          <div className="row p-2 ">
            <div className="col-12">
              <Tables>
                <thead>
                  <tr>
                    <th>{t("S No.")}</th>
                    <th>{t("Item ID")}</th>
                    <th>{t("Test Code")}</th>
                    <th>{t("Test Name")}</th>
                    <th>{t("Department")}</th>
                    <th>{t("Interface ItemID")}</th>

                    {/* <th>{t("Interface ItemName")}</th> */}
                    <th>{t("Interface Company")}</th>
                    <th>{t("Created By")}</th>
                    <th>{t("Creation Date")}</th>

                    <th>{t("ChangeStatus")}</th>
                    <th>{t("Update")}</th>
                  </tr>
                </thead>
                {currentData.map((ele, index) => (
                  <tbody>
                    <tr key={index}>
                      <td>{index + 1 + (currentPage - 1) * PageSize}</td>
                      <td>{ele?.ItemID}</td>
                      <td>{ele?.TestCode}</td>
                      <td>{ele?.TestName}</td>
                      <td>{ele?.Department}</td>
                      <td>{ele?.ItemID_interface}</td>
                      {/* <td>{ele?.ItemName_interface}</td> */}
                      <td>{ele?.Interface_companyName}</td>

                      <td>{ele?.CreatedBy}</td>
                      <td>{ele?.dtEntry}</td>

                      <td>
                        {" "}
                        <Link
                          type="button"
                          onClick={() => {
                            window.scroll(0, 0);
                            handleStatusUpdate(ele);
                          }}
                        >
                          {ele?.isActive == 1 ? "Active" : "InActive"}
                        </Link>
                      </td>
                      <td>
                        <Link
                          type="button"
                          onClick={() => {
                            window.scroll(0, 0);
                            handleUpdate(ele);
                          }}
                        >
                          {t("Edit")}
                        </Link>
                      </td>
                    </tr>
                  </tbody>
                ))}
              </Tables>
            </div>
          </div>
        )}
        {currentData.length > 0 && (
          <div className="d-flex justify-content-end">
            <label className="mt-4 mx-2">No Of Record/Page</label>
            <SelectBox
              className="mt-3 p-1 RecordSize mr-2"
              options={[{ label: "All", value: tableData?.length }, ...Record]}
              selectedValue={PageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
            />{" "}
            <Pagination
              className="pagination-bar mb-2"
              currentPage={currentPage}
              totalCount={tableData?.length}
              pageSize={PageSize}
              onPageChange={(page) => setCurrentPage(page)}
            />{" "}
          </div>
        )}
      </Accordion>
    </>
  );
};

export default ItemMasterInterface;
