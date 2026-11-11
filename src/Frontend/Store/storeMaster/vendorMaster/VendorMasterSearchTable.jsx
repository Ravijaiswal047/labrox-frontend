import React, { useState } from "react";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import { useTranslation } from "react-i18next";
import Input from "../../../../components/formComponent/Input";
import Tables from "../../../../components/UI/customTable";
import { useEffect } from "react";
import { axiosInstance } from "../../../../utils/axiosInstance";
import { toast } from "react-toastify";
import { CustomButton, SearchButton } from "../../../../components/UI/CustomButton";
import { RiFileExcel2Fill } from "react-icons/ri";
import NoRecordFound from "../../../../components/formComponent/NoRecordFound";
const VendorMasterSearchTable = ({
  supplierSearch,
  supplierOrganizationTypesearch,
  tableDataEditRow,
  parentsPayload,
}) => {
  const { t } = useTranslation();
  const initialState = {
    SupplierCategory: "",
    OrganizationType: "",
    SearchBy: "",
    Name: "",
    Status: "",
    NoofRecord: "10"
  };
  const [payload, setPayload] = useState(initialState);
  const [tableData, setTableData] = useState([]);
  const [buttonStates, setButtonStates] = useState({});
  const handleSelectChange = (name, value) => {
    setPayload((prev) => ({ ...prev, [name]: value?.value }));
  };
  // const GetApprovalRightsAPI = () => {
  //   const requstBody = {
  //     employeeid: String("1133"),
  //   };
  //   axiosInstance
  //     .post("VendorMaster/GetApprovalRights", {
  //       ...requstBody,
  //     })
  //     .then((res) => {
  //       let data = res?.data?.message;
  //       data?.isMaker === true
  //         ? setApprovalRightsAPI(false)
  //         : setApprovalRightsAPI(true);
  //       console.log("GetApprovalRights", data);
  //       // setTableData(data);
  //     })
  //     .catch((err) => toast.error("No Data Found"));
  // };
  const GetKeyData = () => {
    const requstBody = {
      searchType: String(payload?.SearchBy || ""),
      searchValue: String(payload?.Name || ""),
      supplierCategory: String(payload?.SupplierCategory || ""),
      organizationType: String(payload?.OrganizationType || ""),
      status: String(payload?.Status || ""),
      noOfRecord: String(payload?.NoofRecord),
    };
    axiosInstance
      .post("VendorMaster/SearchData", {
        ...requstBody,
      })
      .then((res) => {
        let data = res?.data?.message;
        setTableData(data);
        setPayload((prev) => ({
          ...prev,
          SupplierCategory: "",
          OrganizationType: "",
          SearchBy: "",
          Name: "",
          Status: "",
          NoofRecord: "10"
        }));
        // GetApprovalRightsAPI();
      })
      .catch((err) => {
        setTableData([]);
        // setPayload((prev) => ({
        //   ...prev,
        //   SupplierCategory: "",
        //   OrganizationType: "",
        //   SearchBy: "",
        //   Name: "",
        //   Status: "",
        // }));
        toast.error("No Data Found")
      });
  };
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPayload((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked === true ? "1" : "0") : value,
    }));
  };
  // const GetSetVendorStatussAPI = () => {
  //   const requstBody = {
  //     itemId: 0,
  //     status: 0,
  //   };
  //   axiosInstance
  //     .post("VendorMaster//SetVendorStatus", {
  //       ...requstBody,
  //     })
  //     .then((res) => {
  //       let data = res?.data?.message;
  //       data?.isMaker === true
  //         ? setApprovalRightsAPI(false)
  //         : setApprovalRightsAPI(true);
  //       console.log("GetApprovalRights", data);
  //       // setTableData(data);
  //     })
  //     .catch((err) => toast.error("No Data Found"));
  // };

  const handleSelect = (row) => {
    tableDataEditRow(row);
  };

  // const handleCheckButton = () => {
  //      setShowButtonCheck(false);
  //      const requstBody = {
  //     itemId: String("113"),
  //     status: String("1"),
  //   };
  //   axiosInstance
  //     .post("VendorMaster//SetVendorStatus", {
  //       ...requstBody,
  //     })
  //     .then((res) => {
  //       let data = res?.data?.message;
  //       let success=res?.data?.success
  //       if(!success){
  //        setShowButtonApprove(false)
  //        toast.success(res?.data?.message);
  //       }
  //     })
  //     .catch((err) => toast.error("No Data Found"));
  //    };
  // const handleApproveButton = () => {
  //  const requstBody = {
  //     employeeid: String("113"),
  //   };
  //   axiosInstance
  //     .post("VendorMaster/GetApprovalRights", {
  //       ...requstBody,
  //     })
  //     .then((res) => {
  //       let data = res?.data?.message;
  //       let status = res?.data?.status
  //       if(status){
  //       toast.success(res?.data?.message);
  //       setShowButtonApprove(true)
  //       }
  //      ;
  //     })
  //     .catch((err) => toast.error("No Data Found"));
  // };

  // useEffect(() => {
  //   GetSetVendorStatussAPI();
  // }, [checkedItems]);

  const handleCheckButton = (row, Status) => {
    // setButtonStates((prev) => ({
    //   ...prev,
    //   [row.SupplierID]: {
    //     ...prev[row.SupplierID],
    //     approve: false,
    //   },
    // }));
    const requestBody = {
      itemId: String(row.SupplierID),
      status: Status,
    };

    axiosInstance
      .post("VendorMaster/SetVendorStatus", requestBody)
      .then((res) => {
        const success = res?.data?.success;
        const message = res?.data?.message;
        if (success) {
          // setButtonStates((prev) => ({
          //   ...prev,
          //   [row.SupplierID]: {
          //     ...prev[row.SupplierID],
          //     check: false,
          //     approve: true,
          //   },
          // }));
          toast.success(message);
          GetKeyData();
        } else {
          toast.error(res?.data?.message ? res?.data?.message : "Something went wrong")
        }
      })
      .catch(() => toast.error("No Data Found"));
  };

  const handleApproveButton = (row) => {
    const requestBody = {
      employeeid: String(row.SupplierID),
    };

    axiosInstance
      .post("VendorMaster/GetApprovalRights", requestBody)
      .then((res) => {
        const status = res?.data?.status;
        const message = res?.data?.message;
        if (status) {
          toast.success(message);
          // setButtonStates((prev) => ({
          //   ...prev,
          //   [row.SupplierID]: {
          //     ...prev[row.SupplierID],
          //     approve: false,
          //   },
          // }));
        }
      })
      .catch(() => toast.error("No Data Found"));
  };
  useEffect(() => {
    GetKeyData;
  }, [payload]);
  return (
    <>
      <div className="row p-2">
        <ReactSelect
          name="NoofRecord"
          id="NoofRecord"
          removeIsClearable={true}
          dynamicOptions={[
            { label: "5", value: "5" },
            { label: "10", value: "10" },
            { label: "20", value: "20" },
            { label: "50", value: "50" },
            { label: "100", value: "100" },
          ]}
          placeholderName="No of Record"
          value={payload?.NoofRecord}
          onChange={handleSelectChange}
          respclass={"col-xl-1 col-sm-4 col-md-6 co-12"}
        />
        <ReactSelect
          name="SupplierCategory"
          id="SupplierCategory"
          removeIsClearable={true}
          dynamicOptions={supplierSearch?.map((ele) => ({
            label: ele?.name,
            value: ele.id,
          }))}
          placeholderName="Supplier Category"
          value={payload?.SupplierCategory}
          onChange={handleSelectChange}
          respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
        />
        <ReactSelect
          name="OrganizationType"
          id="OrganizationType"
          removeIsClearable={true}
          dynamicOptions={supplierOrganizationTypesearch?.map((ele) => ({
            label: ele?.name,
            value: ele?.id,
          }))}
          placeholderName="Organization Type"
          value={payload?.OrganizationType}
          onChange={handleSelectChange}
          respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
        />
        <ReactSelect
          name="SearchBy"
          id="SearchBy"
          removeIsClearable={true}
          dynamicOptions={[
            { label: "Supplier Name", value: "vm.SupplierName" },
            { label: "Supplier Code", value: "vm.SupplierCode" },
          ]}
          placeholderName="Search By"
          value={payload?.SearchBy}
          onChange={handleSelectChange}
          respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          autoSelectFirst={true}
        />

        <Input
          type="text"
          placeholder=" "
          lable="Name"
          id="Name"
          name="Name"
          value={payload?.Name}
          onChange={handleChange}
          respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
        />
        <ReactSelect
          name="Status"
          id="Status"
          removeIsClearable={true}
          dynamicOptions={[
            { label: "Created", value: "0" },
            { label: "Checked", value: "1" },
            { label: "Approved", value: "2" },
          ]}
          placeholderName="Status"
          value={payload?.Status}
          onChange={handleSelectChange}
          respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
        />
        <div className="col-sm-1 d-flex">
          {/* <button className="btn btn-sm btn-success" onClick={GetKeyData}>
            Search
          </button> */}
          <SearchButton text="Search" onClick={GetKeyData} />
          {/* <button className="btn btn-sm btn-success ml-2">Excel</button> */}
          {/* <CustomButton
            icon={"excel"}
            // text={"Update"}
            onClick={"UpdateData"}

          /> */}
          <RiFileExcel2Fill
            size={24}
            className="text-success d-none"
            style={{ cursor: "pointer" }}
            title="Excel"
            onClick={() => alert("Excel  feature coming soon!")}
          />
        </div>
      </div>
      <div className="row">
        <div className="col-sm-12">
          {/* <Tables>
            <thead>
              <tr>
                <th>{t("#")}</th>
                <th>{t("Select")}</th>
                <th>{t("Check")}</th>
                <th>{t("Approve")}</th>
                <th>{t("Supplier Category")}</th>
                <th>{t("Supplier Name")}</th>
                <th>{t("Supplier Code")}</th>
                <th>{t("Supplier Type")}</th>
                <th>{t("Address")}</th>
                <th>{t("Primary Contact")}</th>
                <th>{t("Contact No")}</th>
                <th>{t("Email")}</th>
              </tr>
            </thead>
            <tbody>
              {tableData?.map((row, index) => (
                <tr key={index}>
                  <td data-title="#">{index + 1}</td>
                  <td data-title="Select">
                    <button onClick={() => handleSelect(row)}>Select</button>
                  </td>
                  <td data-title="Check">
                   {showButtonCheck?(<div><button  className="btn-Check-color" onClick={handleCheckButton}>Check</button></div>):(null)}
                  </td>
                  <td data-title="Approve">
                    {showButtonApprove ? (
                      null
                    ):(
                      <div>
                        <button
                          className="btn-Approve-color"
                          onClick={() => handleApproveButton(row)}
                        >
                          Approve
                        </button>
                      </div>
                    )}
                  </td>
                  <td data-title="Supplier Category">
                    {row?.SupplierCategoryName}
                  </td>
                  <td data-title="Supplier Name">{row?.SupplierName}</td>
                  <td data-title="Supplier Code">{row?.SupplierCode}</td>
                  <td data-title="Supplier Type">{row?.SupplierType}</td>
                  <td data-title="Address">{row?.Street}</td>
                  <td data-title="Primary Contact">
                    {row?.PrimaryContactPerson}
                  </td>
                  <td data-title="Contact No">
                    {row?.PrimaryContactPersonMobileNo}
                  </td>
                  <td data-title="Email">{row?.EmailId}</td>
                </tr>
              ))}
            </tbody>
          </Tables> */}

          <Tables>
            <thead>
              <tr>
                <th>{t("#")}</th>
                <th>{t("Select")}</th>
                <th>{t("Check")}</th>
                <th>{t("Approve")}</th>
                <th>{t("Supplier Category")}</th>
                <th>{t("Supplier Name")}</th>
                <th>{t("Supplier Code")}</th>
                <th>{t("Supplier Type")}</th>
                <th>{t("Address")}</th>
                <th>{t("Primary Contact")}</th>
                <th>{t("Contact No")}</th>
                <th>{t("Email")}</th>
              </tr>
            </thead>
            <tbody>
              {tableData?.length > 0 ? (
                tableData.map((row, index) => {
                  // const rowState = buttonStates[row.SupplierID] || {};
                  return (
                    <tr
                      key={row.SupplierID}
                      style={{ backgroundColor: row.rowcolor }}
                    >
                      <td>{index + 1}</td>

                      <td>
                        <button onClick={() => handleSelect(row)}>Edit </button>
                      </td>

                      <td>
                        {row?.ApprovalStatus == 0 && (
                          <button
                            className="btn-Check-color"
                            onClick={() => handleCheckButton(row, "1")}
                          >
                            Check
                          </button>
                        )}
                      </td>

                      <td>
                        {row?.ApprovalStatus == 1 && (
                          <button
                            className="btn-Approve-color"
                            onClick={() => handleCheckButton(row, "2")}
                          >
                            Approve
                          </button>
                        )}
                      </td>

                      <td>{row.SupplierCategoryName}</td>
                      <td>{row.SupplierName}</td>
                      <td>{row.SupplierCode}</td>
                      <td>{row.SupplierType}</td>
                      <td>{row.Street}</td>
                      <td>{row.PrimaryContactPerson}</td>
                      <td>{row.PrimaryContactPersonMobileNo}</td>
                      <td>{row.EmailId}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="20" className="text-center text-muted">
                    <NoRecordFound />
                  </td>
                </tr>
              )}
            </tbody>
          </Tables>
        </div>
      </div>
    </>
  );
};

export default VendorMasterSearchTable;
