import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Accordion from "@app/components/UI/Accordion";
import { toast } from "react-toastify";
import Loading from "../../components/loader/Loading";
import { axiosInstance } from "../../utils/axiosInstance";
import Heading from "../../components/UI/Heading";
import CustomTable from "../../components/Table/CustomTable";
import { Form } from "react-bootstrap";
import ReactSelect from "../../components/formComponent/ReactSelect";
import Input from "../../components/formComponent/Input";
import { SaveButton, SearchButton } from "../../components/UI/CustomButton";

const AutoApproveCentreInvestigation = () => {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [MapTest, setMapTest] = useState([]);
  const [dropDownList, setDropdownList] = useState({
    centreList: [],
    DepartmentList: [],
    DoctorList: [],
  });
  const [payload, setPayload] = useState({});

  const [tableData, setTableData] = useState([]);
  const [searchText, setSearchText] = useState("");

  const filteredTableData = useMemo(() => {
    if (!searchText) return tableData;

    const search = searchText.toLowerCase();

    return tableData.filter(
      (item) =>
        item?.TestName?.toLowerCase().includes(search),
    );
  }, [tableData, searchText]);

  const allApproved =
    tableData.length > 0 && tableData.every((r) => r.ApprovalType === 2);
  const allSaved =
    tableData.length > 0 && tableData.every((r) => r.ApprovalType === 1);
  const allUnapproved =
    tableData.length > 0 && tableData.every((r) => r.ApprovalType === 3);

  const someApproved = tableData.some((r) => r.ApprovalType === 2);
  const someSaved = tableData.some((r) => r.ApprovalType === 1);
  const someUnapproved = tableData.some((r) => r.ApprovalType === 3);
  const approvedRef = useRef(null);
  const savedRef = useRef(null);
  const unapprovedRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 100;
  const totalPages = Math.ceil(filteredTableData?.length / rowsPerPage);
  const currentData = filteredTableData?.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText]);
  const handleSearch = async () => {
    try {
      setLoading(true);
      if (!payload?.TestCentre) {
        toast.warn("Please Select Centre");
        return;
      } else if (!payload?.DepartmentName) {
        toast.warn("Please Select Department Name");
        return;
      }
      const reqPayload = {
        departmentID: Number(payload?.DepartmentName || 0),
        centreID: Number(payload?.TestCentre || 0),
      };

      const res = await axiosInstance.post(
        "AutoApproval/BindAutoApproveTest",
        reqPayload,
      );

      const message = res?.data?.message;

      if (!Array.isArray(message) || message.length === 0) {
        toast.error("No Data Found");
        setTableData([]);
      } else {
        setTableData(message);
      }
    } catch (err) {
      console.error("Error in handleSearch:", err);
      toast.error(err?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  const handleSave = async () => {
    try {
      setLoading(true);

      if (!payload?.TestCentre) {
        toast.warn("Please Select Centre");
        return;
      } else if (!payload?.DepartmentName) {
        toast.warn("Please Select Department Name");
        return;
      }

      const reqPayload = tableData.map((item) => ({
        centreID: Number(payload?.TestCentre),
        investigationID: Number(item?.investigationid || 0),
        approvalType: Number(item?.ApprovalType || 0),
      }));

      const res = await axiosInstance.post(
        "AutoApproval/SaveAutoApproveCentre",
        reqPayload,
      );

      const { message, success } = res?.data;

      if (success) {
        toast.success("Data Saved Successfully");

        await handleSearch();
      } else {
        toast.error(message || "Failed to save data");
      }
    } catch (err) {
      console.error("Error in handleSave:", err);
      toast.error(err?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleChange = (index, type) => {
    // Keyed by investigationid rather than page-relative position -- once
    // search can filter the row set, a row's position in currentData no
    // longer lines up with its position in the full tableData array.
    const targetID = currentData[index]?.investigationid;

    setTableData((prev) => {
      const next = prev.map((r) => {
        if (r.investigationid !== targetID) return r;
        const current = r.ApprovalType;
        let newType = 0;
        if (type === "approved") newType = current === 2 ? 0 : 2;
        if (type === "saved") newType = current === 1 ? 0 : 1;
        if (type === "unapproved") newType = current === 3 ? 0 : 3;
        return { ...r, ApprovalType: newType };
      });
      return next;
    });
  };

  const handleHeaderSwitch = (type, checked) => {
    const newApprovalType = checked
      ? type === "approved"
        ? 2
        : type === "saved"
          ? 1
          : 3
      : 0;

    setTableData((prev) =>
      prev.map((r) => ({
        ...r,
        ApprovalType: newApprovalType,
      })),
    );
  };
  const handleSearchSelectChange = (label, value) => {
    setPayload({ ...payload, [label]: value?.value });
  };

  const getAllCentres = async () => {
    await axiosInstance
      .get("Employee/GetAllCentres")
      .then((res) => {
        let centreList = res?.data?.message?.map((ele) => {
          return {
            value: String(ele?.CentreID),
            label: ele?.Centre,
          };
        });
        setMapTest(centreList);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const getDepartment = async () => {
    await axiosInstance
      .get("Department/getDepartment")
      .then((res) => {
        let DepartmentList = res?.data?.message?.map((ele) => {
          return {
            value: String(ele?.DepartmentID),
            label: ele?.Department,
          };
        });
        setDropdownList((prev) => ({
          ...prev,
          DepartmentList: DepartmentList,
        }));
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const tableHeaders = [
    { header: "Sr No.", field: "srNo" },
    { header: "Department", field: "Department" },
    { header: "Test", field: "Test" },

    {
      header: (
        <div className="d-flex align-items-center" style={{ gap: "160px" }}>
          <Form.Check
            type="switch"
            id="switch-approved"
            label="All Approved"
            checked={allApproved}
            onChange={(e) => handleHeaderSwitch("approved", e.target.checked)}
            inputRef={(el) => (approvedRef.current = el)}
          />
          <Form.Check
            type="switch"
            id="switch-saved"
            label="All Saved"
            checked={allSaved}
            onChange={(e) => handleHeaderSwitch("saved", e.target.checked)}
            inputRef={(el) => (savedRef.current = el)}
          />
          <Form.Check
            type="switch"
            id="switch-unapproved"
            label="All Unapproved"
            checked={allUnapproved}
            onChange={(e) => handleHeaderSwitch("unapproved", e.target.checked)}
            inputRef={(el) => (unapprovedRef.current = el)}
          />
        </div>
      ),
      field: "AutoApprovedSave",
    },
  ];
  const formattedData = currentData?.map((row, index) => ({
    srNo: (currentPage - 1) * rowsPerPage + index + 1,
    Department: row?.Department,
    Test: row.TestName || "-",
    CreatedBy: row?.CreatedByName,
    UpdatedBy: row?.CreatedByName,
    CreatedDate: row?.dtEntry,
    UpdatedDate: row?.dtEntry,
    AutoApprovedSave: (
      <div
        className="d-flex align-items-center justify-content-between flex-wrap"
        style={{ gap: "8px" }}
      >
        <Form.Check
          type="switch"
          id={`approved-${index}`}
          label="Approved"
          checked={row.ApprovalType === 2}
          onChange={() => handleToggleChange(index, "approved")}
        />
        <Form.Check
          type="switch"
          id={`saved-${index}`}
          label="Saved"
          checked={row.ApprovalType === 1}
          onChange={() => handleToggleChange(index, "saved")}
        />
        <Form.Check
          type="switch"
          id={`unapproved-${index}`}
          label="Unapproved"
          checked={row.ApprovalType === 3}
          onChange={() => handleToggleChange(index, "unapproved")}
        />
      </div>
    ),
  }));

  useEffect(() => {
    if (approvedRef.current)
      approvedRef.current.indeterminate = someApproved && !allApproved;
    if (savedRef.current)
      savedRef.current.indeterminate = someSaved && !allSaved;
    if (unapprovedRef.current)
      unapprovedRef.current.indeterminate = someUnapproved && !allUnapproved;
  }, [
    someApproved,
    allApproved,
    someSaved,
    allSaved,
    someUnapproved,
    allUnapproved,
  ]);

  useEffect(() => {
    getAllCentres();
    getDepartment();
  }, []);

  return (
    <>
      <Accordion
        name={t("Auto Approve Centre Investigation")}
        isBreadcrumb={true}
        defaultValue={true}
      >
        <div className="row px-2 mt-2 mb-1">
          <div className="col-md-2">
            <ReactSelect
              dynamicOptions={[
                { label: "Seclect Test Centre", value: "" },
                ...MapTest,
              ]}
              name="TestCentre"
              lable={t("Test Centre")}
              id="TestCentre"
              removeIsClearable={true}
              placeholderName={t("Test Centre")}
              value={payload?.TestCentre}
              onChange={handleSearchSelectChange}
            />
          </div>
          <div className="col-md-2">
            <ReactSelect
              dynamicOptions={[
                { label: "Seclect Department", value: "" },
                ...dropDownList?.DepartmentList,
              ]}
              name="DepartmentName"
              lable={t("Department Name")}
              id="DepartmentName"
              removeIsClearable={true}
              placeholderName={t("Department Name")}
              value={payload?.DepartmentName}
              onChange={handleSearchSelectChange}
            />
          </div>
          <div className="col-md-2">
            {loading ? (
              <Loading />
            ) : (
              <>  
                <SearchButton
                    text={"Search"}
                    onClick={handleSearch}
                />

                {tableData?.length > 0 && (
                  <SaveButton
                    text={"Save Data"}
                    onClick={handleSave}
                    className="ml-2"
                  
                  />
                )}
              </>
            )}
          </div>
        </div>
        {tableData.length > 0 ? (
          <div className="card mt-2">
            
              <Heading title={t("Saved data")}
              isBreadcrumb={false}
              linkTo={"#"}
              linkTitle={
                <>
                <div className="d-flex align-items-center justify-content-between flex-wrap px-2">
              <Input
                type="text"
                placeholder="Search Test Name"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="mt-2"
              />
            </div>
                </>
              }
               />
              
            <div className="row">
              <div className="col-sm-12">
                <CustomTable
                  columns={tableHeaders}
                  data={formattedData}
                  rowStyle={(rowData) => ({
                    backgroundColor: rowData.rowColor,
                    color: "#000000",
                  })}
                />
              </div>
              <div className="col-sm-12">
                <div className="d-flex flex-wrap justify-content-sm-end justify-content-center align-items-center mt-2 ms-2">
                  <button
                    className="btn btn-info btn-sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>

                  <span className="mx-2 text-muted">
                    Page <strong>{currentPage}</strong> of{" "}
                    <strong>{totalPages}</strong>
                  </span>

                  <button
                    className="btn btn-info btn-sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          ""
        )}
      </Accordion>
    </>
  );
};

export default AutoApproveCentreInvestigation;
