import React, { useEffect, useState } from "react";
import Accordion from "../../../components/UI/Accordion";
import { useTranslation } from "react-i18next";
import Input from "../../../components/formComponent/Input";
import { SelectBoxWithCheckbox } from "../../../components/formComponent/MultiSelectBox";
import CustomTable from "../../../components/Table/CustomTable";
import Heading from "../../../components/UI/Heading";
import { TbFileTypeXls } from "react-icons/tb";
import "../PettyCash.css";
import FilterInput from "../../../components/Filter/FilterInput";
import PettyCashDashboard from "../pettyCashDashboard/PettyCashDashboard";
import PettyCashTransfer from "../pettyCashTransfer/PettyCashTransfer";
import PettyCashLedgerReport from "../pettyCashLedger/PettyCashLedgerReport";
import CenterExpensesEntry from "../centerExpensesEntry/CenterExpensesEntry";
import { useNavigate } from "react-router-dom";
import SeeMore from "../../SampleStorage/frameMenu/SeeMore";
import { ViewMenu } from "../../../components/SvgIcons";
import Form from "react-bootstrap/Form";
import { axiosInstance } from "../../../utils/axiosInstance";
import { apiUrls } from "../../../utils/apiEndpoints";
import { notify } from "../../../utils/utils";
import TableFilterDot from "../../Components/TableFilterDot";
import { toast } from "react-toastify";

const ExpenseTypeMaster = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [showMore, setShowMore] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [editId, seteditId] = useState(false);
  const [filterInputValue, setFilterInputValue] = useState("");
  const [filterTableData, setFilterTableData] = useState([]);

  const seeMoreData = [
    {
      name: "Petty Cash Dashboard",
      component: <PettyCashDashboard setShowMore={setShowMore} />,
      url: "/dashboard#pettycash",
    },
    {
      name: "Petty Cash Transfer",
      component: <PettyCashTransfer setShowMore={setShowMore} />,
      url: "/pettycash/petty-cash-transfer",
    },
    {
      name: "Petty Cash Ledger Report",
      component: <PettyCashLedgerReport setShowMore={setShowMore} />,
      url: "/pettycashledger/petty-cash-ledger-report",
    },
    {
      name: "Expense Type Master",
      component: <ExpenseTypeMaster setShowMore={setShowMore} />,
      url: "/pettycashledger/expense-type-master",
    },
    {
      name: " Centre Expense",
      component: <CenterExpensesEntry setShowMore={setShowMore} />,
      url: "/centerexpenseentry/center-expense-entry",
    },
  ];
  const [formData, setformData] = useState({
    typeName: "",
    accCode: "",
    isActive: true,
  });
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setformData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  const handleSubmit = async (e) => {
    if (!formData?.typeName) {
      toast.error("Please Enter Expense Type Name.");
      return;
    }
    // if (!formData?.accCode) {
    //   toast.error("Please Enter Lab No.");
    //   return;
    // }
    e.preventDefault();
    let requestdata = {
      transactionType: editId ? "UPDATE" : "INSERT",
      id: editId || 0,
      typeName: formData?.typeName,
      accCode: formData?.accCode,
      sapId: "",
      isActive: formData?.isActive ? 1 : 0,
    };
    await axiosInstance
      .post(apiUrls.expensetypemaster, requestdata)
      .then((res) => {
        if (res?.data?.message) {
          notify(res?.data?.message, "success");
          setformData({
            typeName: "",
            accCode: "",
            isActive: true,
          });
          fetchLedgerReportData();
          seteditId(false);
        } else {
          notify(res?.data?.message, "error");
        }
      })
      .catch((err) => {
        console.log(err);
        notify(err?.data?.message, "error");
      });
    // fetchLedgerReportData();
  };
  const handleEdit = (id) => {
    const found = tableData.find((item) => item.Id === id);
    if (found) {
      setformData({
        typeName: found.TypeName || "",
        accCode: found.acc_code || "",
        isActive: found.IsActive || false,
      });
      seteditId(id);
    }
  };
  const fetchLedgerReportData = async () => {
    try {
      const res = await axiosInstance.post(apiUrls.expensetypemaster, {
        ExpenseID: 0,
        transactionType: "SELECT",
        id: 0,
        typeName: formData?.typeName || "",
        accCode: formData?.accCode,
        sapId: "",
        isActive: 1,
      });

      const data = res?.data?.message;
      setTableData(data);
      setFilterTableData(data);
      setformData({
        typeName: "",
        accCode: "",
        isActive: true,
      });
    } catch (err) {
      console.error("Fetch Error:", err);
      notify(err?.response?.data?.message || "Failed to load data", "error");
    }
  };
  useEffect(() => {
    fetchLedgerReportData();
  }, []);

  // const handleFilterInputChange = (e) => {
  //   let value = "";
  //   if (typeof e === "string") {
  //     value = e.toLowerCase();
  //   } else if (typeof e === "boolean") {
  //     value = e;
  //   } else {
  //     value = e.target.value.toLowerCase();
  //   }
  //   setFilterInputValue(value);

  //   // Filter rows based on search term matching any field
  //   const filtered = tableData.filter((row) =>
  //     Object.keys(row).some((key) =>
  //       String(row[key]).toLowerCase().includes(value)
  //     )
  //   );

  //   setTableData(filtered);
  // };
  // useEffect(() => {
  //   setFilterTableData(tableData);
  // }, []);

  const handleFilterInputChange = (e) => {
    const value = e.target.value;
    setFilterInputValue(value);
    setFilterTableData(
      tableData?.filter((data) => {
        const searchTerm = value.toLowerCase();
        // console.log('filterTableData::', data?.CategoryName,'--', searchTerm);
        return (
          // (data?.UpdatedByName || "").toLowerCase().includes(searchTerm) ||
          // (data?.CreatedByName || "").toLowerCase().includes(searchTerm) ||
          (data?.TypeName || data?.acc_code || "")
            .toLowerCase()
            .includes(searchTerm)
        );
      })
    );
  };
  const filterOnClick = (type) => {
    if (type === "all") {
      setFilterTableData(tableData);
      return;
    }
    setFilterTableData(
      tableData?.filter((data) => {
        // Normalize status to lowercase for comparison
        return String(data?.IsActive)?.toLowerCase() === type.toLowerCase();
      })
    );
  };
  const tableHeaders = [
    { header: "S.No.", field: "sNo", width: "5%" },
    { header: "Expense Type", field: "expensetype" },
    { header: "Ledger No", field: "ledgerNo" },
    { header: "Created By", field: "createdBy" },
    { header: "Created Date", field: "createdDate" },
    { header: "Last Updated By", field: "lastUpdatedBy" },
    { header: "last Updated Date", field: "lastUpdatedDate" },
    { header: "Active", field: "active" },
    { header: "Edit", field: "edits" },
  ];
  const statusCount = (sType) => {
    return tableData?.filter((itm) => String(itm?.IsActive) === sType)?.length;
  };
  const handleClear = () => {
    setformData({
      typeName: "",
      accCode: "",
      isActive: true,
    });
  };
  return (
    <>
      {showMore && (
        <SeeMore
          seeMore={seeMoreData}
          handleChangeComponent={(item) => {
            setShowMore(false);
            navigate(item?.url);
          }}
          setShowMore={setShowMore}
        />
      )}
      <div className="card">
        <Heading
          name={"Expense Type Master"}
          isBreadcrumb={true}
          secondTitle={
            <>
              <label onClick={() => setShowMore((prev) => !prev)}>
                <ViewMenu />
              </label>
            </>
          }
        />
        {/* <Accordion defaultValue={true} title={t("Expense Type Master")} /> */}

        <div className="row p-2 d-flex align-items-center">
          <Input
            type="text"
            placeholder=" "
            lable={t("Expense Type Name")}
            id="typeName"
            name="typeName"
            value={formData?.typeName}
            onChange={handleChange}
            // className={"required-fields"}
            // inputRef={trayNameRef}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <Input
            type="text"
            placeholder=" "
            lable={t("Ledger No")}
            id="accCode"
            name="accCode"
            value={formData?.accCode}
            onChange={handleChange}
            // className={"required-fields"}
            // inputRef={trayNameRef}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />

          <div className="col-sm-1 align-items-center">
            <Form>
              <Form.Check
                type="switch"
                id="custom-switch"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                label="Status"
              />
            </Form>
          </div>

          <div className="col-sm-1">
            <button
              type="submit"
              className="btn btn-sm btn block btn-success w-100"
              onClick={handleSubmit}
            >
              {editId ? "Update" : "Save"}
            </button>
          </div>
          <div className="col-sm-1">
            <button
              className="btn btn-sm btn block btn-success w-100"
              onClick={handleClear}
            >
              Clear
            </button>
          </div>
        </div>

        <div className="d-flex align-items-end w-100 justify-content-end mb-2">
          <div
            style={{ gap: "4px" }}
            className="d-flex align-items-center justify-content-start justify-content-sm-end flex-wrap px-2"
          >
            <TableFilterDot
              onClick={() => filterOnClick("true")}
              color={"lightgreen"}
              title={`Active (${statusCount("true")})`}
              bgColor={"#ebebebbf"}
            />
            <TableFilterDot
              onClick={() => filterOnClick("false")}
              color={"#ffc4cc"}
              title={`In-Active (${statusCount("false")})`}
              bgColor={"#ebebebbf"}
            />
            <TableFilterDot
              onClick={() => filterOnClick("all")}
              // color={"#FFFFFF"}
              title={`Show All (${tableData?.length})`}
              bgColor={"#ebebebbf"}
            />
          </div>

          <FilterInput
            value={filterInputValue}
            onChange={handleFilterInputChange}
            placeholder="Filter Table"
          />
        </div>

        <Heading
          title={t("Expense Type Detail")}
        />
        <div className="mt-1 table_ticket ">
          <CustomTable
            columns={tableHeaders}
            data={filterTableData?.map((itm, index) => ({
              ...itm,
              rowColor: itm?.ColorCode || '#ffc4cc',
              sNo: index + 1,
              expensetype: itm?.TypeName || "-",
              ledgerNo: itm?.acc_code || "-",
              createdBy: itm?.CreatedByName || "-",
              createdDate: itm?.dtEntry || "-",
              lastUpdatedBy: itm?.UpdatedByName || "-",
              lastUpdatedDate: itm?.dtUpdate || "-",
              active: itm?.IsActive === true ? "Yes" : "No",
              edits: (
                <div onClick={() => handleEdit(itm.Id)}>
                  <i
                    className="fa fa-edit"
                    style={{ cursor: "pointer", color: "rgb(33, 33, 139)" }}
                    aria-hidden="true"
                  ></i>
                </div>
              ),
            }))}
          />
        </div>
      </div>
    </>
  );
};

export default ExpenseTypeMaster;
