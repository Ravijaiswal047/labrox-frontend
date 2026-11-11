import React, { useState, useEffect } from "react";
import Heading from "../../../components/UI/Heading";
import ReactSelect from "../../../components/formComponent/ReactSelect";
import { axiosInstance } from "../../../utils/axiosInstance";
import { apiUrls } from "../../../utils/apiEndpoints";
import { Button } from "react-bootstrap";
import CustomTable from "../../../components/Table/CustomTable";
import { toast } from "react-toastify";
import MultiSelectComp from "../../../components/formComponent/MultiSelectComp";

const CashTransferMaster = () => {

  const [lists, setLists] = useState({
    receiverList: [],   // BindSearchType searchType=1 (Users)
    fieldBoyList: [],   // BindSearchType searchType=2 (FieldBoys)
    tableData: [],
  });

  const initialState = {
    typeName: "FieldBoy",
    typeID: 2,
    employee_ID_To: "",
    employeeName_To: "",
    fieldBoy: [],
  };
  const [payload, setPayload] = useState(initialState);

  // ─── API: POST /CashTransfer/BindSearchType ───────────────────────────────
  const fetchBySearchType = async (searchType, listKey) => {
    try {
      const res = await axiosInstance.post(apiUrls?.BindSearchType, {
        searchType: Number(searchType),
      });
      const list = Array.isArray(res?.data?.message)
        ? res.data.message.map((u) => ({ label: u?.Name, value: u?.ID }))
        : [];
      setLists((prev) => ({ ...prev, [listKey]: list }));
    } catch (err) {
      console.error(`Error fetching searchType=${searchType}:`, err);
    }
  };

  // ─── API: GET /CashTransferMaster/SearchData ──────────────────────────────
  const fetchTableData = async () => {
    try {
      const res = await axiosInstance.get(apiUrls?.CTMSearchData);
      const list = Array.isArray(res?.data?.message) ? res.data.message : [];
      setLists((prev) => ({ ...prev, tableData: list }));
    } catch (err) {
      console.error("Error fetching table data:", err);
    }
  };

  const handleRadioChange = (typeName, typeID) => {
    setPayload((prev) => ({ ...prev, typeName, typeID, fieldBoy: [] }));
    if (typeID === 2) fetchBySearchType(2, "fieldBoyList");
  };

  // ─── API: POST /CashTransferMaster/SaveCashTransfer ──────────────────────
  const handleSave = async () => {
    if (!payload.employee_ID_To) {
      toast.error("Receiver User is required");
      return;
    }
    if (payload.typeID === 2 && payload.fieldBoy.length === 0) {
      toast.error("Field Boy is required");
      return;
    }

    const reqBody = {
      employee_ID_To: Number(payload.employee_ID_To),
      employeeName_To: payload.employeeName_To,
      typeName: payload.typeName,
      typeID: payload.typeID,
      employeeBy:
        payload.typeID === 2
          ? payload.fieldBoy.map((fbId) => {
              const fb = lists.fieldBoyList.find((f) => f.value === fbId);
              return {
                employee_ID_By: Number(fbId),
                employeeName_By: fb?.label || "",
              };
            })
          : [],
    };

    try {
      const res = await axiosInstance.post(apiUrls?.CTMSaveCashTransfer, reqBody);
      if (res?.data?.message === "RECORD_EXIST") {
        toast.warning("Record already exists");
      } else {
        toast.success(res?.data?.message || "Saved successfully");
      }
      fetchTableData();
      resetForm();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    }
  };

  // ─── API: POST /CashTransferMaster/Deactivate ─────────────────────────────
  const handleDeactivate = async (row) => {
    try {
      const res = await axiosInstance.post(apiUrls?.CTMDeactivate, {
        id: Number(row?.Id),
      });
      toast.success(res?.data?.message || "Deactivated successfully");
      fetchTableData();
    } catch (err) {
      console.error("Error deactivating:", err);
    }
  };

  const resetForm = () => {
    setPayload(initialState);
  };

  useEffect(() => {
    fetchBySearchType(1, "receiverList");  // Users for Receiver dropdown
    fetchBySearchType(2, "fieldBoyList"); // FieldBoys for FieldBoy multiselect
    fetchTableData();
  }, []);

  // ─── Table ────────────────────────────────────────────────────────────────

  const columns = [
    { header: "S.NO.", field: "srNo", width: "3%" },
    { header: "Type", field: "Type" },
    { header: "Receiver", field: "Receiver" },
    { header: "Sender", field: "Sender" },
    { header: "Created By", field: "CreatedBy" },
    { header: "Created Date", field: "CreatedDate" },
    { header: "Remove", field: "Remove", width: "3%" },
  ];

  const formattedData = lists.tableData.map((row, index) => ({
    srNo: index + 1,
    Type: row?.TypeName,
    Receiver: row?.EmployeeName_To,
    Sender: row?.EmployeeName_By,
    CreatedBy: row?.CreatedBy,
    CreatedDate: row?.CreatedOn,
    Remove: (
      <button onClick={() => handleDeactivate(row)} className="btn btn-sm p-0">
        <i className="bi bi-x-circle-fill text-danger fs-5"></i>
      </button>
    ),
  }));

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      <div className="card">
        <Heading name={"Cash Transfer Master"} isBreadcrumb={true} />

        <div className="row p-2 align-items-end">
          {/* Receiver User — from BindSearchType searchType=1 */}
          <ReactSelect
            name="employee_ID_To"
            id="CTMReceiverUser"
            removeIsClearable={true}
            dynamicOptions={lists.receiverList}
            placeholderName="Receiver User"
            value={payload.employee_ID_To}
            className="required-fields"
            onChange={(_name, option) =>
              setPayload((prev) => ({
                ...prev,
                employee_ID_To: option?.value ?? "",
                employeeName_To: option?.label ?? "",
              }))
            }
            respclass={"col-xl-2 col-sm-4 col-md-4"}
          />

          {/* Receive Cash From — radio buttons */}
          <div className="col-xl-3 col-sm-5 col-md-6 d-flex align-items-center gap-2 mb-2">
            <span className="fw-semibold small text-nowrap">Receive Cash From :</span>
            <div className="form-check form-check-inline mb-0">
              <input
                className="form-check-input"
                type="radio"
                name="ctmType"
                id="ctmFieldBoy"
                checked={payload.typeID === 2}
                onChange={() => handleRadioChange("FieldBoy", 2)}
              />
              <label className="form-check-label" htmlFor="ctmFieldBoy">Field Boy</label>
            </div>
            <div className="form-check form-check-inline mb-0">
              <input
                className="form-check-input"
                type="radio"
                name="ctmType"
                id="ctmBank"
                checked={payload.typeID === 3}
                onChange={() => handleRadioChange("Bank", 3)}
              />
              <label className="form-check-label" htmlFor="ctmBank">Bank</label>
            </div>
          </div>

          {/* Field Boy multiselect — from BindSearchType searchType=2, only for FieldBoy type */}
          {payload.typeID === 2 && (
            <div className="col-xl-2 col-sm-4 col-md-4">
              <MultiSelectComp
                name="fieldBoy"
                id="CTMFieldBoy"
                placeholder="Field Boy"
                value={payload.fieldBoy}
                options={lists.fieldBoyList}
                onChange={(_name, selectedArr) =>
                  setPayload((prev) => ({ ...prev, fieldBoy: selectedArr || [] }))
                }
              />
            </div>
          )}

          <div className="col-auto">
            <Button className="rounded py-0" onClick={handleSave}>Save</Button>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="card mt-2">
        <div className="row">
          <div className="col-sm-12">
            <CustomTable columns={columns} data={formattedData} />
          </div>
        </div>
      </div>
    </>
  );
};

export default CashTransferMaster;
