import React, { useState, useRef, useEffect } from "react";
import ReactSelect from "../../../components/formComponent/ReactSelect";
import { ClockSVG, ViewMenu } from "../../../components/SvgIcons";
import Heading from "../../../components/UI/Heading";
import CashFlowFrameMenu from "../CashFlowFrameMenu";
import { AutoComplete } from "primereact/autocomplete";
import { axiosInstance } from "../../../utils/axiosInstance";
import MultiSelctItems from "../../../components/formComponent/MultiSelctItems";
import { Button } from "react-bootstrap";
import CustomTable from "../../../components/Table/CustomTable";
import { apiUrls } from "../../../utils/apiEndpoints";
import { notify } from "../../../utils/utils";
import { toast } from "react-toastify";
import MultiSelectComp from "../../../components/formComponent/MultiSelectComp";
import { SaveButton } from "../../../components/UI/CustomButton";
import { t } from "i18next";

const CashTransferMaster = () => {
  const [showMore, setShowMore] = useState(false);
  const [stockSuggestions, setStockSuggestions] = useState([]);
  const [autoCompleteVal, setAutoCompleteVal] = useState(null);
  const itemRef = useRef();

  const [dropDownList, setDropdownlist] = useState({
    transfertoList: [],
    businesslist: [],
    fieldboylist: [],
    tabledatalist: [],
  });

  // IMPORTANT: keep multi-select values as arrays for the UI
  const initialState = {
    ReceiveCashFrom: "2",
    ReceiveCashFromName: "Field Boy",
    UserID: "",
    UserName: "",
    BusinessZone: [],
    FieldBoy: [],
    Type: "",
  };
  const [payload, setPayload] = useState(initialState);

  // ReactSelect change
  const handleSelectChange = (name, option) => {
    //   if (name === "BusinessZone") {
    //   setPayload((prev) => ({ ...prev, BusinessZone: option || [] }));
    //   const zoneCsv = toIdCsv(option || []);
    //   GetBindBusinessZoneWiseFieldBoy(zoneCsv);
    // }
    if (name === "BusinessZone") {
      setPayload((prev) => ({
        ...prev,
        BusinessZone: option?.value, // single object
      }));

      const zoneId = option?.value ? String(option.value) : "";
      GetBindBusinessZoneWiseFieldBoy(zoneId);
      return;
    }

    if (name === "FieldBoy") {
      const zoneCsv = option?.value ? String(option.value) : "";
      setPayload((prev) => ({ ...prev, FieldBoy: option?.value, }));
    }

    if (name === "ReceiveCashFrom") {
      const nextVal = option?.value ?? "";
      setPayload((prev) => ({
        ...prev,
        [name]: nextVal,
        ReceiveCashFromName: option?.label ?? "",
      }));
      GetCashtransferToList(nextVal);
    } else {
      setPayload((prev) => ({ ...prev, [name]: option?.value ?? "" }));
    }
  };

  // Dropdown options
  const ReceiveCashFromOption = [
    { label: "RECEIVE", value: "1" },
    { label: "CASHTRANSFER", value: "2" },
    { label: "DEPOSIT", value: "3" },
  ];

  const GetCashtransferToList = async (type) => {
    try {
      const res = await axiosInstance.post(apiUrls?.GetUserByType, {
        transactionType: Number(type || payload.ReceiveCashFrom) || 2,
      });

      const list = Array.isArray(res?.data?.message)
        ? res.data.message.map((u) => ({
          label: u?.Name,
          value: u?.ID,
        }))
        : [];

      setDropdownlist((prev) => ({ ...prev, transfertoList: list }));
    } catch (err) {
      console.error("Error fetching user list:", err);
    }
  };

  const GetBindBusinessZone = async () => {
    try {
      const res = await axiosInstance.get(apiUrls?.BindBusinessZone);
      const list = Array.isArray(res?.data?.message) ? res.data.message : [];
      setDropdownlist((prev) => ({
        ...prev,
        businesslist: list.map((item) => ({
          label: item.BusinessZoneName,
          value: item.BusinessZoneID,
        })),
      }));
    } catch (err) {
      console.error("Error fetching business zone:", err);
    }
  };

  console.log("business zone hello", dropDownList.businesslist)

  const GetBindBusinessZoneWiseFieldBoy = async (zoneIDsCsv) => {
    const requestPayload = { zoneID: zoneIDsCsv || "" };
    try {
      const res = await axiosInstance.post(
        apiUrls?.BindBusinessZoneWiseFieldBoy,
        requestPayload
      );
      const list = Array.isArray(res?.data?.message) ? res.data.message : [];
      setDropdownlist((prev) => ({
        ...prev,
        fieldboylist: list?.map((item) => ({
          label: item?.Name,
          value: item?.ID,
        })),
      }));
    } catch (err) {
      console.error("Error fetching fieldboy list:", err);
    }
  };
  const GetBindMasterManage = async (type) => {
    const requestPayload = {
      transactionType: type ? type : "SEARCH",
      id: 0,
      employeeIDTo: 0,
      employeeNameTo: "",
      typeID: 0,
      typeName: "",
      employeeBy: [
        {
          employeeIDBy: 0,
          employeeNameBy: "",
        },
      ],
      // employeeIDTo: Number(payload?.ReceiveCashFrom) || 0,
      // employeeNameTo: String(payload?.ReceiveCashFromName),
      // typeID: Number(payload?.UserID) || 0,
      // typeName: String(payload?.UserName || ""),
      // employeeBy: payload?.BusinessZone?.map((ele) => ({
      //   employeeIDBy: Number(ele?.code) || 0,
      //   employeeNameBy: String(ele?.name || ""),
      // })),
    };
    try {
      const res = await axiosInstance.post(
        apiUrls?.MasterManage,
        requestPayload
      );
      const list = Array.isArray(res?.data?.message) ? res.data.message : [];
      setDropdownlist((prev) => ({
        ...prev,
        tabledatalist: list,
      }));
    } catch (err) {
      console.error("Error fetching fieldboy list:", err);
    }
  };

  const handleSave = async () => {
    if (!payload?.ReceiveCashFrom) {
      toast.error("This Field is Required");
      return;
    }
    if (!payload?.UserID) {
      toast.error("User is Required");
      return;
    }
    if (payload?.ReceiveCashFrom !== "3" && payload?.FieldBoy?.length === 0) {
      toast.error("Field Boy is Required");
      return;
    }

    const requestPayload = {
      transactionType: "INSERT",
      id: 0,

      employeeIDTo: Number(payload?.UserID) || 0,
      employeeNameTo: String(payload?.UserName),
      typeID: Number(payload?.ReceiveCashFrom) || 0,
      typeName: String(payload?.ReceiveCashFromName || ""),
      // employeeBy: payload?.FieldBoy?.map((ele) => ({
      //   employeeIDBy: ele?.code ? Number(ele?.code) : 0,
      //   employeeNameBy: ele?.name ? String(ele?.name) : "",
      // })),
      employeeBy:
        payload?.ReceiveCashFrom === "3" || payload?.ReceiveCashFrom === "1"
          ? [
            {
              employeeIDBy: 0,
              employeeNameBy: "",
            },
          ]
          : payload?.FieldBoy?.map((ele) => ({
            employeeIDBy: ele?.code ? Number(ele?.code) : 0,
            employeeNameBy: ele?.name ? String(ele?.name) : "",
          })),
      // employeeBy: payload?.FieldBoy?.map((ele) => ({
      //   employeeIDBy: ele?.code ? Number(ele?.code) : 0,
      //   employeeNameBy: ele?.name ? String(ele?.name) : "",
      // })),
      // employeeBy: payload?.FieldBoy?.map((ele) => ({
      //   employeeIDBy: payload?.ReceiveCashFrom === "3" ? Number(ele?.code) : 0,
      //   employeeNameBy:
      //     payload?.ReceiveCashFrom === "3" ? String(ele?.name) : "",
      // })),
    };

    try {
      const res = await axiosInstance.post(
        apiUrls?.MasterManage,
        requestPayload
      );
      toast.success(res?.data?.message);
      GetBindMasterManage("SEARCH");
      setPayload(initialState);
      setAutoCompleteVal(null);
      setStockSuggestions([]);
    } catch (err) {
      toast.error(
        err?.response?.data?.message
          ? err?.response?.data?.message
          : "Something Wents Wrong!"
      );
    }
  };

  useEffect(() => {
    GetBindBusinessZone();
    GetCashtransferToList(2);
    GetBindMasterManage();
  }, []);

  const handleDelete = async (ele) => {
    const requestPayload = {
      transactionType: "DELETE",
      id: Number(ele?.ID),
      employeeIDTo: Number(payload?.ReceiveCashFrom) || 0,
      employeeNameTo: String(payload?.ReceiveCashFromName),
      typeID: Number(payload?.UserID) || 0,
      typeName: String(payload?.UserName || ""),
      employeeBy: payload?.FieldBoy?.map((ele) => ({
        employeeIDBy: Number(ele?.code) || 0,
        employeeNameBy: String(ele?.name || ""),
      })),
    };
    try {
      const res = await axiosInstance.post(
        apiUrls?.MasterManage,
        requestPayload
      );
      const list = Array.isArray(res?.data?.message) ? res.data.message : [];
      toast?.success(res?.data?.message);
      GetBindMasterManage("SEARCH");
    } catch (err) {
      console.error("Error fetching fieldboy list:", err);
    }
  };
  const columns = [
    { header: "Sr. No.", field: "srNo", width: "3%" },
    { header: "Type", field: "Type" },
    { header: "User", field: "User" },
    // { header: "IsTransfer", field: "IsTransfer" },
    // { header: "IsReceive", field: "IsReceive" },
    // { header: "Sender", field: "Sender" },
    { header: "Created By", field: "CreatedBy" },
    { header: "Created Date", field: "CreatedDate" },
    { header: "Remove", field: "Remove", width: "3%" },
  ];
  const formattedData = dropDownList?.tabledatalist?.map((ele, index) => ({
    srNo: index + 1,
    Type: ele?.TypeName,
    User: ele?.EmployeeNameTo,
    // IsTransfer: ele?.IsTransfer,
    // IsReceive: ele?.IsReceive,
    // Sender: ele?.Sender,
    CreatedBy: ele?.CreatedByName,
    CreatedDate: ele?.dtEntry,
    Remove: (
      <button
        onClick={() => handleDelete(ele)}
        className="btn btn-sm text-danger"
      >
        <i className="bi bi-trash-fill text-white mb-0"></i>
      </button>
    ),
  }));
  const handlePayloadMultiSelectNumbers = (data) => {
    if (!Array.isArray(data)) return "";
    const result = data.map((item) => String(item?.code));
    return result.join(",");
  };
  const toIdCsv = (arr) =>
    Array.isArray(arr)
      ? arr
        .map((o) => o?.code)
        .filter(Boolean)
        .join(",")
      : "";
  const handleSelectMultiChange = (name, selectedArray) => {
    if (name === "BusinessZone") {
      setPayload((prev) => ({ ...prev, BusinessZone: selectedArray || [] }));
      const zoneCsv = toIdCsv(selectedArray || []);
      GetBindBusinessZoneWiseFieldBoy(zoneCsv);
    } else if (name === "FieldBoy") {
      const zoneCsv = toIdCsv(selectedArray || []);
      setPayload((prev) => ({ ...prev, FieldBoy: selectedArray || [] }));
    }
  };

  return (
    <>
      {showMore && <CashFlowFrameMenu />}
      <div className="card">
        <Heading
          name={"Cash Transfer Master"}
          isBreadcrumb={true}
          secondTitle={
            <label onClick={() => setShowMore((prev) => !prev)}>
              <ViewMenu />
            </label>
          }
        />
        <div className="row p-2">
          <ReactSelect
            name="ReceiveCashFrom"
            id="ReceiveCashFrom"
            removeIsClearable={true}
            dynamicOptions={ReceiveCashFromOption}
            placeholderName="Receive Type"
            className={"required-fields"}
            value={payload?.ReceiveCashFrom}
            onChange={handleSelectChange}
            respclass={"col-12 col-sm-6 col-md-2 my-1"}
          />

          <div
            className="col-12 col-sm-6 col-md-2 my-1"
            tabIndex={-1}
            ref={itemRef}
          >
            <AutoComplete
              style={{ width: "100%" }}
              field="label"
              value={autoCompleteVal}
              className="required-fields"
              suggestions={stockSuggestions}
              completeMethod={(e) => {
                if (dropDownList?.transfertoList?.length > 0) {
                  const filtered = dropDownList.transfertoList.filter((item) =>
                    (item.label || "")
                      .toLowerCase()
                      .includes((e.query || "").toLowerCase())
                  );
                  setStockSuggestions(filtered);
                } else {
                  setStockSuggestions([]);
                }
              }}
              onChange={(e) => {
                setAutoCompleteVal(e.value);

                setPayload((prev) => ({
                  ...prev,
                  UserID: e.value?.value ?? "", // Correct value (id)
                  UserName: e.value?.label ?? "", // Correct label (name)
                }));
              }}
              // dropdown
              id="User"
            />

            <label htmlFor="User" className="lable searchtest">
              User
            </label>
          </div>
          {/* {payload?.ReceiveCashFrom === "3" && (
            <ReactSelect
              name="Type"
              id="Type"
              removeIsClearable={true}
              dynamicOptions={[
                { label: "Receive", value: "1" },
                { label: "Transfer", value: "2" },
              ]}
              placeholderName="Type"
              className={"required-fields"}
              value={payload?.Type}
              onChange={handleSelectChange}
              respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
            />
          )} */}

          {payload?.ReceiveCashFrom === "2" && (
            <>
              <div className="col-12 col-sm-6 col-md-2 my-1">
                {/* <MultiSelectComp
                placeholderName="Business Zone"
                name="BusinessZone"
                label="Business Zone"
                value={payload.BusinessZone}
                options={dropDownList?.businesslist}
                // respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
                onChange={handleSelectMultiChange}
              /> */}
                <ReactSelect
                  name="BusinessZone"
                  id="BusinessZone"
                  removeIsClearable={true}
                  dynamicOptions={dropDownList?.businesslist}
                  placeholderName="Receive Cash From"
                  className={"required-fields"}
                  value={payload.BusinessZone}
                  onChange={handleSelectChange}
                // respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
                />
              </div>
              <div className="col-12 col-sm-6 col-md-2 my-1">
                <MultiSelectComp
                  placeholderName="Field Boy"
                  name="FieldBoy"
                  value={payload?.FieldBoy} // expects values.FieldBoy to be an ARRAY
                  label="FieldBoy"
                  // setValues={setPayload}
                  // labelKey="label"
                  // valueKey="value"
                  options={dropDownList?.fieldboylist}
                  // respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
                  onChange={handleSelectMultiChange}
                // requiredClassName={"required-fields"}
                />
                {/* <ReactSelect
            name="BusinessZone"
            id="FieldBoy"
            removeIsClearable={true}
            dynamicOptions={dropDownList?.fieldboylist}
            placeholderName="Receive Cash From"
            className={"required-fields"}
            value={payload?.FieldBoy}
            onChange={handleSelectChange}
            // respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          /> */}
              </div>
            </>
          )}

          <div className="col-auto my-1">
            <SaveButton text={t("Save")} onClick={handleSave} />
          </div>
        </div>
      </div>

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
