import { useTranslation } from "react-i18next";
import ReactSelect from "../../components/formComponent/ReactSelect";
import Accordion from "../../components/UI/Accordion";
import React, { useEffect, useState } from "react";
import { axiosInstance } from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import Tables from "../../components/UI/customTable";

const FamilyMemberPolicyDiscountMapping = () => {
  const { t } = useTranslation();

  const [policyOptions, setPolicyOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]); 


  const fetchPolicyOptions = () => {
    axiosInstance
      .get("/EmployeeMember/GetPolicyDataAndDropdown", {
        params: { transactionType: "Dropdown" },
      })
      .then((res) => {
        const options =
          res?.data?.data?.map((item) => ({
            value: item.PolicyID,
            label: item.PolicyName,
          })) || [];
        setPolicyOptions(options);
      })
      .catch(() => {
        toast.error("Failed to fetch policy data");
      });
  };

 
  const fetchDepartmentOptions = () => {
    axiosInstance
      .get("/Department/getDepartment")
      .then((res) => {
        const options =
          res?.data?.message?.map((item) => ({
            value: item.DepartmentID,
            label: item.Department,
          })) || [];
        setDepartmentOptions(options);
      })
      .catch(() => {
        toast.error("Failed to fetch department data");
      });
  };

  useEffect(() => {
    fetchPolicyOptions();
    fetchDepartmentOptions();
  }, []);


  const handleSelectChange = (name, option) => {
    if (!option) return;
    if (name === "PolicyName") {
      setSelectedPolicy(option);
    } else if (name === "Department") {
      setSelectedDepartment(option);
    }
  };

 
  const handleSearch = () => {
    if (!selectedPolicy || !selectedDepartment) {
      toast.error("Please select both Policy and Department");
      return;
    }

    axiosInstance
      .get("/EmployeeMember/GetPolicyData", {
        params: {
          policyId: selectedPolicy.value,
          deptID: selectedDepartment.value,
        },
      })
      .then((res) => {
        setSearchResults(res?.data?.data || []);
        setSelectedRows([]); // clear previous selections
        toast.success("Data fetched successfully");
      })
      .catch(() => {
        toast.error("Failed to fetch policy data");
      });
  };

  const handleCheckboxChange = (row) => {
    const exists = selectedRows.find((r) => r.investigationid === row.investigationid);
    if (exists) {
      setSelectedRows(selectedRows.filter((r) => r.investigationid !== row.investigationid));
    } else {
      setSelectedRows([...selectedRows, row]);
    }
  };

  const handleSave = async () => {
    if (!selectedPolicy || !selectedDepartment) {
      toast.error("Please select both Policy and Department");
      return;
    }

    if (selectedRows.length === 0) {
      toast.error("Please select at least one row to save");
      return;
    }

    try {
      for (const row of selectedRows) {
        const payload = {
          departmentID: Number(selectedDepartment.value),
          policyID: Number(selectedPolicy.value),
          investigationID: Number(row.investigationid),
          testName: row.testname || "",
          percentage: Number(row.SharePercentage || 0),
          selfDiscL1: Number(row.SelfDiscL1 || 0),
          selfDiscL2: Number(row.SelfDiscL2 || 0),
          relativeDiscL1: Number(row.RelativeDiscL1 || 0),
          relativeDiscL2: Number(row.RelativeDiscL2 || 0),
          familyDiscL1: Number(row.FamilyDiscL1 || 0),
          familyDiscL2: Number(row.FamilyDiscL2 || 0),
        };

        await axiosInstance.post("/EmployeeMember/SavePolicyData", payload);
      }

      toast.success("Selected data saved successfully");
    setSearchResults([]);    
    setSelectedRows([]); 
    } catch (err) {
      console.error("Save error:", err.response?.data);
      toast.error(err.response?.data?.message || "Failed to save");
    }
  };

  return (
    <div>
      {/* 🔹Search Filters */}
      <Accordion
        name={t("Search Member Detail")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row pt-2 pl-2 pr-2 mt-1">
          <div className="col-sm-2">
            <ReactSelect
              dynamicOptions={policyOptions}
              name="PolicyName"
              lable="Policy Name"
              id="PolicyName"
              removeIsClearable={true}
              placeholderName="Policy Name"
              value={selectedPolicy}
              onChange={(value, option) =>
                handleSelectChange("PolicyName", option || value)
              }
            />
          </div>

          <div className="col-sm-2">
            <ReactSelect
              dynamicOptions={departmentOptions}
              name="Department"
              lable="Department"
              id="Department"
              removeIsClearable={true}
              placeholderName="Department"
              value={selectedDepartment}
              onChange={(value, option) =>
                handleSelectChange("Department", option || value)
              }
            />
          </div>

          <div className="col-sm-1">
            <button
              className="btn btn-block btn-sm btn-primary"
              onClick={handleSearch}
            >
              {t("Search")}
            </button>
          </div>
        </div>
      </Accordion>

      {/* 🔹Result Table */}
      {searchResults.length > 0 && (
        <Accordion name={t("Policy Discount Mapping")} defaultValue={true}>
          <div className="mt-4">
            <Tables>
              <thead>
                <tr>
                  
                  <th>{t("Sr. No.")}</th>
                   <th>{t("Test Name")}</th>
                  <th>{t("Policy Name")}</th>
                  <th>{t("Primary (L1 / L2)")}</th>
                  <th>{t("Family Member (L1 / L2)")}</th>
                  <th>{t("Relative (L1 / L2)")}</th>
                 
                  <th>{t("Select")}</th>
                </tr>
              </thead>
              <tbody>
                {searchResults.map((item, index) => (
                  <tr key={item.investigationid}>
                 
                    <td>{index + 1}</td>
                         <td>
                      {item.testname}
                    </td>
                    <td>{selectedPolicy?.label || "-"}</td>
                    <td>
                      {item.SelfDiscL1} / {item.SelfDiscL2}
                    </td>
                    <td>
                      {item.FamilyDiscL1} / {item.FamilyDiscL2}
                    </td>
                    <td>
                      {item.RelativeDiscL1} / {item.RelativeDiscL2}
                    </td>
                
                       <td>
                      <input
                        type="checkbox"
                        checked={selectedRows.some((r) => r.investigationid === item.investigationid)}
                        onChange={() => handleCheckboxChange(item)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Tables>

             <div className="col-sm-1">
                        <button
                            type="button"
                            id="btnSave"
                            className="btn btn-success btn-sm btn-block"
                            onClick={handleSave}
                        >
                            { t("Save")}
                        </button>
                    </div>
          </div>
        </Accordion>
      )}
    </div>
  );
};

export default FamilyMemberPolicyDiscountMapping;
