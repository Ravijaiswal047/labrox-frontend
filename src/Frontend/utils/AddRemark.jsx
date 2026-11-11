import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { toast } from "react-toastify";
import { axiosInstance } from "../../utils/axiosInstance";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { useTranslation } from "react-i18next";
import Input from "../../components/formComponent/Input";
import { SelectBox } from "../../components/formComponent/SelectBox";
import { getPaymentModes } from "../../utils/NetworkApi/commonApi";
import CustomTable from "../../components/Table/CustomTable";
import Loading from "../../components/loader/Loading";
import { CancelButton, SaveButton } from "../../components/UI/CustomButton";
import './AddRemark.css';

const AddRemark = ({
  show,
  handleShow,
  rowData,
  visitKey = "LedgerTransactionNo",
  testIDsKey = "TestIDDetail",
  testNamesKey = "TestName",
  ledgerTransactionIDKey = "LedgerTransactionID",
  patientNameKey = ["FirstName", "MiddleName", "LastName"],
  ageGenderKey = ["Age", "Gender"],
  shouldHideRemarkBtn= false,
  defaultTestFromRow = false,
  filterTestID = null,
}) => {
  const { t } = useTranslation();
  console.log("shouldHideRemarkBtn",shouldHideRemarkBtn);
  const {SessionRateTypeID, SessionInvoiceTo, SessionDoctorId, SessionShowOnlineRemark} = useLocalStorage("userData", "get");
  let shouldHideOpt = ((SessionRateTypeID > 0 || SessionInvoiceTo > 0 || SessionDoctorId > 0))
  const [remark, setRemark] = useState([]);
  const isMobile = window.innerWidth <= 768;
  const theme = useLocalStorage("theme", "get");
  const {EmployeeID} = useLocalStorage('userData', 'get');
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [Identity, setIdentity] = useState([]);
  const [allRemarkReplyData, setAlRemarkReplyData] = useState([])
  const [checkboxes, setCheckboxes] = useState({
    showOnline: shouldHideOpt ? 1 : 0,
    clientReply: 0,
    attachmentRequired: 0,
  });
  const [payload, setPayload] = useState({
    Remark: "",
    RemarkId: 0,
    TestID: "",
    DocumentID: "",
    DocumentName: "",
    TestName: "",
  });

  const accessRightStr = useLocalStorage("accessRight", "get") || "";
  const accessRight = accessRightStr? accessRightStr?.split(",").filter(Boolean): [];

 const hasAccess18 = accessRight?.includes("18");

const tableColumns = [
  { header: "Sr. No", field: "srNo", width: "60px" },
  { header: "Created By", field: "createdBy" },
  { header: "Created Date", field: "createdDate" },
  // { header: "Test Name", field: "test" },
  { header: "Remark", field: "remark", wrapText: true, minWidth: "120px", maxWidth: "150px" },
  { header: "Show Online", field: "showOnline" },
  { header: "Client Reply", field: "clientReply" },
  { header: "Attachment", field: "attachment" },
  { header: "Delete", field: "delete", width: "60px" },
];

// Remove the "Delete" column if accessRight includes '18'
const filteredColumns = !hasAccess18
  ? tableColumns.filter((col) => col.field !== "delete")
  : tableColumns;


  const handleChange = (e) => {
    const { name, value } = e.target;
    const data = Identity.find((ele) => ele.value === Number(value));
    setPayload((prev) => ({
      ...prev,
      [name]: data?.value,
      DocumentName: data?.label,
    }));
  };

  const handleSearchSelectChange = (label, value) => {
    console.log("value",value);
    if (value?.value === "others") {
      setShowInput(true);
      setPayload((prev) => ({ ...prev, Remark: "" , RemarkId : "others" }));
    } else {
      setShowInput(false);
      setPayload((prev) => ({ ...prev, Remark: value?.label || "" , RemarkId : value?.value}));
    }
  };

  const handleTestChange = (label, value) => {
    setPayload((prev) => ({
      ...prev,
      TestID: value?.value,
      TestName: value?.label,
    }));
    bindRemarks(value?.value);
  };

  const getRemarks = async () => {
    axiosInstance
      .post("Global/getGlobalData", {
        type: "LabRemarks",
      })
      .then((res) => {
        const message = res?.data?.message || [];

        if (!Array.isArray(message)) {
          setRemark([])
          return;
        }

        const formattedRemarks = message.map((item) => ({
          label: item.FieldDisplay,
          value: item.FieldID,
        }));
        setRemark([{ label: "Others", value: "others" },...formattedRemarks]);
      })
      .catch((err) => console.log(err));
  };

  const getTest = async () => {
    axiosInstance
      .post("CommonController/TestNameById", {
        ledgerTransactionID: rowData?.[ledgerTransactionIDKey],
      })
      .then((res) => {
        const message = res?.data?.message || [];

        if (Array.isArray(message) && (message?.length > 0)) {
          const allTest = message.map((item) => ({
            label: item.TestName,
            value: item.TestID,
          }));
          setOptions([{label: "Select", value: ""}, ...allTest]);
          //N
          let defaultTest;

          if (defaultTestFromRow) {
            defaultTest = allTest?.find(
              (t) => String(t.value) === String(rowData?.TestID)
            );
          }

          const finalTest = defaultTest || allTest[0];
          setPayload((prev) => ({
            ...prev,
            TestID: finalTest?.value,
            TestName: finalTest?.label,
          }));
        }
        else{
          setOptions([]);
        }      
      })
      .catch((err) => console.log(err));
  };

console.log('allRemarkReplyData', allRemarkReplyData);
  const bindRemarks = async (testID) => {
    setLoading(true);
    const effectiveTestID = testID !== undefined ? testID : payload.TestID;
    let testIDsValue = filterTestID
      ? String(filterTestID).replace(/,+$/, "")
      : effectiveTestID?.toString() || "";
   axiosInstance
    .post("Department/GetRemarks/GetRemarks", {
      testID: testIDsValue,
    })
    .then((res) => {
    if (Array.isArray(res?.data?.data)) {
      const filteredRemarks = shouldHideRemarkBtn
          ? res?.data?.data.filter(item => item?.ShowOnline === "Yes")
          : res?.data?.data;

      setAlRemarkReplyData(filteredRemarks);
      // setAlRemarkReplyData(res.data.data);
      // Create formatted table data
      const formattedData = filteredRemarks?.map((item, index) => ({
        srNo: index + 1,
        createdBy: item.CreatedByName || "",
        createdDate: item.DATE || "",
        // test: item.TestName || "",
        remark: item.Remarks || "",
        showOnline: item.ShowOnline || "",
        clientReply: item.IsClientReplyReq ? "Yes" : "No",
        attachment: item.IsAttReq
          ? `Yes (${item.DocumentTypeName || ""})`
          : "No",

        // Delete column cell
        delete: accessRight?.includes("18") ? (
          <span
            onClick={() => deleteRemarks(item)}
            style={{ color: "red", cursor: "pointer", fontWeight: "bold" }}
            title="Delete Remark"
          >
            X
          </span>
        ) : null,

        id: item.ID,
      }));

      setTableData(formattedData);
    } else {
      setTableData([]);
      setAlRemarkReplyData([]);
      toast.error(res?.data?.message);
    }
  })
  .catch((err) => {
    console.log("Bind remark err", err);
    setLoading(false);
    toast.error("An error occurred while fetching the remarks");
  })
  .finally(() => {
    setLoading(false);
  });

  };

  const deleteRemarks = async (row) => {
    axiosInstance
      .post("Department/DeleteRemarks/DeleteRemarks", {
        id: row?.ID?.toString(),
      })
      .then((res) => {
        bindRemarks();
      })
      .catch((err) => {
        console.log(err);
        toast.error("An error occurred while deleting the remarks");
      });
  };

  const handleSave = async () => {
    if (!payload?.Remark || payload?.Remark.trim() === "") {
      toast.error("Please select a remark!");
      return; 
    }
    const apiPayload = {
      testID: payload?.TestID?.toString() || "",
      remarks: payload?.Remark || "",
      ledgerTransactionID: rowData?.[ledgerTransactionIDKey]?.toString() || "",
      visitNo: rowData?.[visitKey] || "",
      showOnline: checkboxes?.showOnline.toString(),
      documentTypeName: payload?.DocumentName || "",
      isClientReplyReq: checkboxes?.clientReply,
      isAttReq: checkboxes?.attachmentRequired,
      documentTypeID: payload?.DocumentID || 0,
      testName: payload?.TestName || "",
      RemarkID: payload?.RemarkId === "others" ? 0 : Number(payload?.RemarkId) || 0,
    };

    try {
      const res = await axiosInstance.post(
        "Department/SavePatientRemarks/SavePatientRemarks",
        apiPayload,
      );
      console.log("save res",res);
      if (res?.data?.success) {
        bindRemarks();
        setShowInput(false);
        setPayload({
          Remark: "",
          TestName: "",
          TestID: "",
          DocumentID: "",
          DocumentName: "",
          RemarkId: 0,
        });
        // setPayload((prev) => ({ ...prev, Remark: "", DocumentID: "", }))
        setCheckboxes({
          showOnline: 0,
          clientReply: 0,
          attachmentRequired: 0,
        });

        toast.success(res.data.message || "Remark saved successfully");
      } else {
        toast.error(res?.response?.data?.message);
      }
    } catch (error) {
      console.error("Error saving remark:", error);
      toast.error(error?.response?.data?.message);
    }
  };

  const normalizedRowData = React.useMemo(() => {
    if (!rowData) return {};

    // 🩺 Visit number
    const visitNo = rowData?.[visitKey] || "";

    // 🧍 Patient Name
    let patientName = "";
    if (Array.isArray(patientNameKey)) {
      patientName = patientNameKey
        .map((key) => rowData?.[key])
        .filter(Boolean)
        .join(" ")
        .trim();
    } else {
      patientName = rowData?.[patientNameKey] || "";
    }

    // 🎂 Age / Gender
    let ageGender = "";
    if (Array.isArray(ageGenderKey)) {
      ageGender = ageGenderKey
        .map((key) => rowData?.[key])
        .filter(Boolean)
        .join(" / ")
        .trim();
    } else {
      ageGender = rowData?.[ageGenderKey] || "";
    }

    return {
      visitNo,
      patientName,
      ageGender,
    };
  }, [rowData, visitKey, patientNameKey, ageGenderKey]);

  // useEffect(() => {
  //   if (!rowData) return;

  //   if (rowData?.testOptions?.length > 0) {
  //     const options = rowData.testOptions.map((item) => ({
  //       value: item.TestID,
  //       label: item.TestName,
  //     }));
  //     setOptions(options);

  //     setPayload((prev) => ({
  //       ...prev,
  //       TestID: options[0]?.value || "",
  //       TestName: options[0]?.label || "",
  //     }));
  //   } else if (bindTestFromRow) {
  //     // 1. Get test IDs from rowData
  //     const testIDs = (rowData[testIDsKey] || "")
  //       .split(",")
  //       .map((id) => id.trim());
  //     let testNames = [];
  //     try {
  //       testNames = JSON.parse(rowData[testNamesKey] || "[]");
  //     } catch (error) {
  //       console.error("Failed to parse test names", error);
  //     }

  //     const options = testIDs.map((id, index) => ({
  //       value: id,
  //       label: testNames[index]?.Test || id,
  //     }));

  //     setOptions(options);
  //     setPayload((prev) => ({
  //       ...prev,
  //       TestID: testIDs[0],
  //       TestName: testNames[0]?.Test,
  //     }));
  //   } else if (/<p.*?>.*?<\/p>/i.test(rowData[testNamesKey])) {
  //     const ids = rowData[testIDsKey]?.toString();
  //     const namesHTML = rowData[testNamesKey]?.toString();

  //     if (!ids || !namesHTML) return;

  //     const idArray = ids.split(",").map((id) => id.trim());

  //     const tempDiv = document.createElement("div");
  //     tempDiv.innerHTML = namesHTML;
  //     const nameArray = Array.from(tempDiv.querySelectorAll("p")).map((p) =>
  //       p.textContent.trim(),
  //     );

  //     while (nameArray.length < idArray.length) {
  //       nameArray.push("Unknown Test");
  //     }

  //     const options = idArray.map((id, index) => ({
  //       value: id,
  //       label: nameArray[index],
  //     }));

  //     setOptions(options);
  //     setPayload((prev) => ({
  //       ...prev,
  //       TestID: idArray[0],
  //       TestName: nameArray[0],
  //     }));
  //     return;
  //   } else {
  //     // For department-wise or other parents: use selectOption API
  //     const ids = rowData[testIDsKey]?.toString();
  //     const names = rowData[testNamesKey]?.toString();
  //     if (!ids || !names) return;

  //     const idArray = ids.split(",").map((id) => id.trim());
  //     const nameArray = names.split(",").map((name) => name.trim());

  //     const options = idArray.map((id, index) => ({
  //       value: id,
  //       label: nameArray[index] || id,
  //     }));
  //     setOptions(options);

  //     setPayload((prev) => ({
  //       ...prev,
  //       TestID: idArray[0],
  //       TestName: nameArray[0],
  //     }));
  //   }
  // }, [rowData, bindTestFromRow, testIDsKey, testNamesKey]);

  useEffect(() => {   
    getRemarks();
    getPaymentModes("Identity", setIdentity);
  }, []);

  useEffect(()=>{
    getTest();
  },[ledgerTransactionIDKey])

  useEffect(() => {
    if (options?.length === 0) return;
    const firstReal = options.find((o) => o.value !== "");
    bindRemarks(firstReal?.value);
  }, [options]);

  useEffect(() => {
    if (checkboxes.attachmentRequired === 1 && Identity.length > 0) {
      setPayload((prev) => ({
        ...prev,
        DocumentID: prev.DocumentID || Identity[0].value,
        DocumentName: prev.DocumentName || Identity[0].label,
      }));
    }
  }, [checkboxes.attachmentRequired, Identity]);
  console.log("options",options);
  console.log("payload",payload);
  console.log("allRemarkReplyData?.[0]?.ShowOnline != 0 || shouldHideOpt",allRemarkReplyData?.[0]?.ShowOnline != 0, shouldHideOpt);

  return (
    <Dialog
      header={
        <div className="row px-2 mt-2">
          <div className="link-title-container" style={{ color: "white" }}>
            <div className="link-title-item">
              {t("Visit No.") + " : " + (normalizedRowData?.visitNo || "")}
            </div>
            <div className="link-title-item">
              {t("Patient Name") +
                " : " +
                (normalizedRowData?.patientName || "")}
            </div>
            <div className="link-title-item">
              {t("Age/Gender") + " : " + (normalizedRowData?.ageGender || "")}
            </div>
          </div>
        </div>
      }
      visible={show}
      top="25%"
      className={theme}
      onHide={handleShow}
      style={{ width: isMobile ? "95vw" : "70vw" }}
    >  
      {/* {defaultTestFromRow && payload?.TestName && (
        <div className="row px-2 mt-2">
          <div className="col-12">
            <h6 style={{ fontWeight: "600", color: "#2c3e50" }}>
              Selected Test: {payload.TestName}
            </h6>
          </div>
        </div>
      )} */}
      <div className="row px-2 mt-2">
        <div className="col-md-6">
          <ReactSelect
            dynamicOptions={[...options]}
            name="TestID"
            lable={t("Test")}
            id="Test"
            removeIsClearable={true}
            placeholderName={t("Test")}
            value={payload.TestID}
            onChange={handleTestChange}
          />
        </div>
        <div className="col-md-6">
          <ReactSelect
            dynamicOptions={[...remark]}
            name="RemarkId"
            lable={t("Select Remark")}
            id="remarkDropdown"
            removeIsClearable={true}
            placeholderName={t("Select Remark")}
            value={payload.RemarkId}
            onChange={handleSearchSelectChange}
            // respclass="required-fields-active"
          />
        </div>
      </div>
      {showInput && (
        <div className="row px-2 mt-2">
          <div className="col-sm-12">
            {/* NEW INPUT FIELD instead of textarea */}
            <Input
              name="CustomReason"
              label={t("Enter Remark")}
              value={payload.Remark}
              onChange={(e) =>
                setPayload((prev) => ({ ...prev, Remark: e.target.value }))
              }
            />
          </div>
        </div>
      )}
      
      <div className="row px-2 mt-2">
        <div className=" col-md-5 col-lg-4 mb-1 d-flex align-items-center">
          <label
            className="switch switch-lg"
            style={{ display: "flex", alignItems: "center", marginBottom: "0" }}
          >
            <input
              type="checkbox"
              checked={checkboxes.showOnline === 1}
              onChange={(e) =>
                setCheckboxes((prev) => ({
                  ...prev,
                  showOnline: e.target.checked ? 1 : 0,
                }))
              }
              disabled={shouldHideOpt}
            />
            <span className="slider round2"></span>
          </label>
          <label className="ml-2 mb-0" style={{ fontSize: "1.15rem", fontWeight: 500 }}>{t("Show Online")}</label>
        </div>
        {!shouldHideOpt && <div className="col-md-5 col-lg-4 mb-1 d-flex align-items-center">
          <label
            className="switch switch-lg"
            style={{ display: "flex", alignItems: "center", marginBottom: "0" }}
          >
            <input
              type="checkbox"
              checked={checkboxes.clientReply === 1}
              onChange={(e) =>
                setCheckboxes((prev) => ({
                  ...prev,
                  clientReply: e.target.checked ? 1 : 0,
                }))
              }
            />
            <span className="slider round2"></span>
          </label>
          <label className="ml-2 mb-0" style={{ fontSize: "1.15rem", fontWeight: 500 }}>{t("Client Reply Required")}</label>
        </div>}
      </div>
      <div className="row px-2 mb-3">
      {!shouldHideOpt && <div className="col-md-5 col-lg-4 mb-1 d-flex align-items-center">
          <label
            className="switch switch-lg"
            style={{ display: "flex", alignItems: "center", marginBottom: "0" }}
          >
            <input
              type="checkbox"
              checked={checkboxes.attachmentRequired === 1}
              onChange={(e) =>
                setCheckboxes((prev) => ({
                  ...prev,
                  attachmentRequired: e.target.checked ? 1 : 0,
                }))
              }
            />
            <span className="slider round2"></span>
          </label>
          <label className="ml-2 mb-0" style={{ fontSize: "1.15rem", fontWeight: 500 }}>{t("Attachment Required")}</label>
          </div>}
          <div className="col-sm-4 col-md-5 col-lg-4 mb-1">
          {checkboxes.attachmentRequired === 1 && (
            <SelectBox
              options={Identity}
              name="DocumentID"
              label="DocumentType"
              selectedValue={payload?.DocumentID}
              onChange={handleChange}
            />
          )}
          </div>
      </div>
      
      <div className="mt-3">
        {loading ? (
          <Loading /> 
        ) : tableData.length > 0 ? (
          <CustomTable
            columns={filteredColumns}
            data={tableData}
            tableHeight="table-height"
            scrollView="scrollable"
            // onCellClick={(row, cellValue) => {
            //   // Only trigger delete if the clicked cell is the red "X"
            //   if (cellValue?.props?.children === "X") {
            //     deleteRemarks(row);
            //   }
            // }}
          />
        ) : null}
      </div>

      <div className="d-flex justify-content-end mt-2">
        {(allRemarkReplyData?.[0]?.ShowOnline != 0 || shouldHideOpt) && (
          <SaveButton text="Submit" onClick={handleSave} className="mr-2" />
        )}
        <CancelButton text="Cancel" onClick={handleShow} />
      </div>
    </Dialog>
  );
};

AddRemark.defaultProps = {
  patientNameKey: ["FirstName", "MiddleName", "LastName"],
  ageGenderKey: ["Age", "Gender"],
};

export default AddRemark;
