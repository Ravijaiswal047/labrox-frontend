import { useEffect, useState } from "react";
import ReactSelect from "../../components/formComponent/ReactSelect";
import Input from "../../components/formComponent/Input";
import { useTranslation } from "react-i18next";
import { CancelButton, CustomButton, SearchButton } from "../../components/UI/CustomButton";
import Tables from "../../components/UI/customTable";
import { axiosInstance, axiosReport } from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import TableFilterDot from "../../components/FilterTableDot/TableFilterDot";
import Modal from "../../components/formComponent/Modal";
import Loading from "../../components/loader/Loading";
import Accordion from "../../components/UI/Accordion";

const DispatchPatientModal = ({ show, onClose, data, onDispatchSuccess }) => {
  const [t] = useTranslation();

  const [formData, setFormData] = useState({
    labNo: data?.VisitNo ?? "",
    dispatchTo: null,
    courierName: "",
    otherName: "",
    docketNumber: "",
  });
  const [tableData, setTableData] = useState([]);
  const [showLogModal, setShowLogModal] = useState(false);
  const [selectedLogData, setSelectedLogData] = useState(null);
  const [isPrinting, setIsPrinting] = useState(false);

  const handleOpenLogModal = (dispatchLogList) => {
    setSelectedLogData(dispatchLogList);
    setShowLogModal(true);
  };

  const handleCloseLogModal = () => {
    setShowLogModal(false);
    setSelectedLogData(null);
  };

  const eligibleRows = tableData.filter(
    (item) => item?.Approved == 1 && item?.IsDispatch == 0
  );

  const selectAll =
    eligibleRows.length > 0 && eligibleRows.every((item) => item.IsSelected);
  const hasNonApproved = tableData.some(
    (item) => item?.IsDispatch == 1
  );

  const dispatchToOptions = [
    { label: "Self", value: "Self" },
    { label: "Other", value: "Other" },
    { label: "Courier", value: "Courier" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (name, value) => {
    setFormData({ ...formData, [name]: value?.value });
  };

  const handleSelectAll = (checked) => {
    const updatedData = tableData.map((item) => ({
      ...item,
      IsSelected: item?.Approved == 1 && item?.IsDispatch == 0 ? checked : item.IsSelected,
    }));

    setTableData(updatedData);
  };

  const handleCheckboxChange = (index, checked) => {
    const updatedData = [...tableData];
    updatedData[index].IsSelected = checked;

    setTableData(updatedData);
  };

  const fetchPatientData = async () => {
    try {
      const res = await axiosInstance.post("Dispatch/DispatchSearchByLabNo", {
        labNo: formData.labNo,
      });

      const response_data = res?.data;
      if (response_data?.success) {
        setTableData(response_data?.message);
      }
    } catch (error) {
      console.log("Error while fetching data", error);
      setTableData([]);
    }
  };

  useEffect(() => {
    if (show) {
      fetchPatientData();
    }
  }, [show]);

  const dispatchTests = async () => {
    // if (!selectAll) {
    //   toast.error("Please Select All Tests.");
    //   return;
    // }
    const selectedTestIDs = tableData
      .filter((item) => item.IsSelected)
      .map((item) => String(item.TestID));

    if (selectedTestIDs.length === 0) {
      toast.error("No tests selected for dispatch.");
      return;
    }

    if (!formData.dispatchTo) {
      toast.error("Dispatch to is required!");
      return;
    }

    const payloadData = {
      ledgerTransactionID: data?.LedgerTransactionID,
      visitNo: formData.labNo,
      barcodeNo: data?.SinNo,
      dispatchTo: formData?.dispatchTo,
      otherName: formData?.otherName,
      courierName: formData?.courierName,
      docketNumber: formData?.docketNumber,
      testID: selectedTestIDs,
    };

    try {
      const res = await axiosInstance.post("Dispatch/DispatchSaveLog", payloadData);

      const response_data = res?.data;
      if (response_data?.success) {
        toast.success("Dispatched successfully");
        fetchPatientData();
        if (onDispatchSuccess) {
          onDispatchSuccess();
        }
      }
    } catch (error) {
      console.log("Error while fetching data", error);
      setTableData([]);
    }
  };

  console.log({tableData})

const dispatchAndPrint = async () => {
  // --- Validations ---
  // if (!selectAll) {
  //   toast.error("Please Select All Tests.");
  //   return;
  // }

  const selectedTests = tableData.filter((item) => item.IsSelected);

  if (selectedTests.length === 0) {
    toast.error("No tests selected for dispatch.");
    return;
  }

  if (!formData.dispatchTo) {
    toast.error("Dispatch to is required!");
    return;
  }

  if (isPrinting) {
    toast.warn("Please wait, generating report...");
    return;
  }

  // --- Step 1: Dispatch API ---
  const payloadData = {
    ledgerTransactionID: data?.LedgerTransactionID,
    visitNo: formData.labNo,
    barcodeNo: data?.SinNo,
    dispatchTo: formData?.dispatchTo,
    otherName: formData?.otherName,
    courierName: formData?.courierName,
    docketNumber: formData?.docketNumber,
    testID: selectedTests.map((item) => String(item.TestID)),
  };

  try {
    const dispatchRes = await axiosInstance.post("Dispatch/DispatchSaveLog", payloadData);

    if (!dispatchRes?.data?.success) {
      toast.error("Dispatch failed.");
      return;
    }

    toast.success("Dispatched successfully");

    const testIDHashes = [
      ...new Set(
        selectedTests
          .map((item) => item?.TestIDHash)
          .filter(Boolean)
      ),
    ];

    if (testIDHashes.length === 0) {
      toast.error("No test hashes found for printing.");
      return;
    }

    // --- Step 3: Print API ---
    setIsPrinting(true);
    try {
      const printRes = await axiosReport.post(
        "commonReports/GetLabReport",
        {
          TestIDHash: testIDHashes,
          PHead: 1,
          PrintColour: "1",
          IsDownload: 1,
          WithoutnablLogo: 0,
        },
        { responseType: "blob" }
      );

      const blob = printRes.data;

      // Check if response is an error JSON
      const isJson =
        blob.type === "application/json" ||
        blob.type === "text/json" ||
        blob.type === "text/plain";

      if (isJson) {
        const text = await blob.text();
        try {
          const json = JSON.parse(text);
          toast.error(json?.message || "Print failed.");
        } catch {
          toast.error("Print failed.");
        }
        return;
      }

      // Open PDF
      const pdfUrl = window.URL.createObjectURL(blob);
      window.open(pdfUrl, "_blank");

    } catch (printErr) {
      toast.error(
        printErr?.response?.data?.message || "Failed to generate report."
      );
    } finally {
      setIsPrinting(false);
    }

    // if (onDispatchSuccess) {
    //   onDispatchSuccess();
    // }

  } catch (error) {
    console.log("Dispatch & Print error:", error);
    toast.error("Something went wrong.");
    setIsPrinting(false);
  }
};


  const sampleStatus = [
    {
      value: 1,
      label: t("Not Approved"),
      color: "#ffffff",
    },
    {
      value: 2,
      label: t("Approved"),
      color: "#9cd355ff",
    },
    {
      value: 3,
      label: t("Dispatched"),
      color: "#44a3aa",
    },
  ];

  return (
    <Modal
      visible={show}
      setVisible={onClose}
      Header={t("Dispatch Patient")}
      modalWidth={"90%"}
    >
      {/* Form Section */}
      <div className="row px-2 mt-2 p-1">
        {tableData[0]?.DueAmount !== 0 && (
          <div className="col-12">
            <marquee direction="left" className="text-danger" style={{fontWeight: "800"}}>
              Patient has a balance amount of {tableData[0]?.DueAmount}/-. You cannot dispatch the report until the balance is cleared.
            </marquee>
          </div>
        )}
        <div className="col-sm-2">
          <Input
            className="select-input-box form-control input-sm"
            type="text"
            name="labNo"
            id="labNo"
            lable={"Visit No."}
            value={formData?.labNo}
            onChange={handleChange}
          />
        </div>
        <div className="col-sm-2">
          <span onClick={fetchPatientData}>
            <SearchButton text={"Search"} />
          </span>
        </div>
          {tableData[0]?.DueAmount === 0 && (
        <div className="col-sm-2">
          <ReactSelect
            name="dispatchTo"
            id="dispatchTo"
            lable="Dispatch To"
            placeholderName={t("Dispatch To")}
            value={formData?.dispatchTo}
            dynamicOptions={dispatchToOptions}
            removeIsClearable={true}
            onChange={handleSelectChange}
          />
        </div>
        )}
        {formData.dispatchTo === "Other" && (
          <div className="col-sm-2">
            <Input
              className="select-input-box form-control input-sm"
              type="text"
              name="otherName"
              id="otherName"
              lable={"Other Name"}
              value={formData?.otherName}
              onChange={handleChange}
            />
          </div>
        )}
        {formData.dispatchTo === "Courier" && (
          <div className="col-sm-2">
            <Input
              className="select-input-box form-control input-sm"
              type="text"
              name="courierName"
              id="courierName"
              lable={"Courier Name"}
              value={formData?.courierName}
              onChange={handleChange}
            />
          </div>
        )}
        {formData.dispatchTo === "Courier" && (
          <div className="col-sm-2">
            <Input
              className="select-input-box form-control input-sm"
              type="text"
              name="docketNumber"
              id="docketNumber"
              lable={"Docket No."}
              value={formData?.docketNumber}
              onChange={handleChange}
            />
          </div>
        )}
        {tableData[0]?.DueAmount === 0 ?(
          <>
        <div className="col-sm-auto">
          <CustomButton
            text={t("Dispatch")}
            icon={"send"}
            onClick={dispatchTests}
            className="btn-primary"
          />
        </div>
        <div className="col-sm-auto">
          <CustomButton
            text={t("Dispatch & Print")}
            icon={"print"}
            onClick={dispatchAndPrint}
            disabled={isPrinting}
            className="btn-primary"
          />
        </div>
        </>
        ) : (
          <div className="col-sm-auto">
            Due Amount:{" "}
            <span className="text-danger" style={{fontWeight: "800"}}>{`${tableData[0]?.DueAmount}`}</span>
          </div>
        )}
      </div>

      {/* Patient Details Section */}
      <Accordion
        title={`${t("Patient Details")}`}
        defaultValue={true}
        notOpen={true}
      >
        <div className="row px-2 pb-2 bg-light rounded">
          <div className="col-sm-4 d-flex" style={{ gap: "8px" }}>
            <div style={{ fontWeight: "600" }}>Patient Name: </div>
            <div>{data?.PatientName}</div>
          </div>
          <div className="col-sm-4 d-flex" style={{ gap: "8px" }}>
            <div style={{ fontWeight: "600" }}>Visit No: </div>
            <div>{data?.VisitNo}</div>
          </div>
          <div className="col-sm-4 d-flex" style={{ gap: "8px" }}>
            <div style={{ fontWeight: "600" }}>Age: </div>
            <div>{data?.Age}</div>
          </div>
          <div className="col-sm-4 d-flex" style={{ gap: "8px" }}>
            <div style={{ fontWeight: "600" }}>Gender: </div>
            <div>{data?.Gender}</div>
          </div>
          <div className="col-sm-4 d-flex" style={{ gap: "8px" }}>
            <div style={{ fontWeight: "600" }}>Refer Doctor: </div>
            <div>{data?.DoctorName}</div>
          </div>
          <div className="col-sm-4 d-flex" style={{ gap: "8px" }}>
            <div style={{ fontWeight: "600" }}>Client Name: </div>
            <div>{data?.RateTypeName}</div>
          </div>
        </div>
      </Accordion>

      {/* Status Legend */}
      <Accordion
        title={`${t("Test Data")}`}
        defaultValue={true}
        notOpen={true}
        linkTo={"#"}
        linkTitle={
          <div
            style={{ gap: "6px" }}
            className="mt-2 mb-2 px-2 py-1 d-flex sampleStatusClass flex-wrap"
          >
            {sampleStatus?.map((sItem, idx) => (
              <TableFilterDot
                key={idx}
                color={`${sItem?.color}`}
                title={`${sItem?.label}`}
                bgColor={`#e9e2e1`}
              />
            ))}
          </div>
        }
      >
        {/* Test Data Table */}
        <div className="mt-1">
          <Tables
            style={{
              maxHeight: "400px",
              overflowY: "auto",
            }}
          >
            <thead className="cf">
              <tr>
                <th>{t("S.No")}</th>
                <th>{t("Department")}</th>
                <th>{t("Barcode")}</th>
                <th>{t("Investigations")}</th>
                <th>{t("Status")}</th>
                <th>{t("RateType")}</th>
                <th>{t("Dispatch By")}</th>
                <th>{t("Dispatch On")}</th>
                <th>
                  <input
                    type="checkbox"
                    className="me-2"
                    checked={selectAll}
                    disabled={hasNonApproved}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                  <span className="pl-2">{t("Select")}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((item, index) => {
                let dispatchStatusText = t("Non-Approved");
                if (item?.IsDispatch == 1) {
                  dispatchStatusText = t("Dispatched");
                } else if (item?.Approved == 1) {
                  dispatchStatusText = t("Approved");
                }
                return (
                  <tr
                    key={index}
                    style={{
                      backgroundColor:
                        item.IsDispatch == 1
                          ? "#44a3aa"
                          : item.Approved == 1
                            ? "#9cd355ff"
                            : "",
                    }}
                  >
                    <td data-title={t("S.No")}>{index + 1}</td>
                    <td data-title={t("Department")}>{item?.DepartmentName}</td>
                    <td data-title={t("Barcode")}>{item?.BarcodeNo}</td>
                    <td data-title={t("Investigations")}>{item?.ItemName}</td>
                    <td data-title={t("Status")}>{dispatchStatusText}</td>
                    <td data-title={t("RateType")}>
                      {item?.RateTypeName || "-"}
                    </td>
                    <td data-title={t("Dispatch By")}>
                      {item?.DispatchByName || "-"}
                    </td>
                    <td data-title={t("Dispatch On")}>
                      {item?.dtDispatch || "-"}
                    </td>
                    <td data-title={t("Select")}>
                      {item?.Approved == 1 && item?.IsDispatch == 0 ? (
                        <input
                          type="checkbox"
                          checked={item.IsSelected || false}
                          onChange={(e) => handleCheckboxChange(index, e.target.checked)}
                        />
                      ) : item?.IsDispatch == 1 ? (
                        // ✅ Show eye icon for dispatched rows
                        <button
                          type="button"
                          onClick={() => handleOpenLogModal(item?.DispatchLogList)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: 0,
                          }}
                          title={t("View Dispatch Log")}
                        >
                          <i
                            className="bi bi-eye-fill"
                            style={{ fontSize: "16px", pointerEvents: "none" }}
                          ></i>
                        </button>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Tables>
        </div>
      </Accordion>

      <div className="row p-2 px-4 d-flex justify-content-end">
        <CancelButton
          text={t("Close")}
          onClick={onClose}
          className="btn-secondary"
        />
      </div>

      {showLogModal && (
        <DispatchLogModal
          show={showLogModal}
          onClose={handleCloseLogModal}
          logs={selectedLogData}
        />
      )}
    </Modal>
  );
};

export default DispatchPatientModal;


export const DispatchLogModal = ({ show, onClose, logs }) => {
  const [t] = useTranslation();

  const parsedLogs = (() => {
    try {
      return typeof logs === "string" ? JSON.parse(logs) : logs || [];
    } catch {
      return [];
    }
  })();

  return (
    <Modal
      visible={show}
      setVisible={onClose}
      Header={t("Dispatch Log")}
      modalWidth={"60%"}
    >
      <div className="p-2">
        <Tables>
          <thead className="cf">
            <tr>
              <th>{t("S.No")}</th>
              <th>{t("Dispatch To")}</th>
              <th>{t("Courier Name")}</th>
              <th>{t("Docket Number")}</th>
              <th>{t("Other Name")}</th>
              <th>{t("Dispatched By")}</th>
              <th>{t("Dispatch Date")}</th>
            </tr>
          </thead>
          <tbody>
            {parsedLogs.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-3">
                  {t("No dispatch logs found.")}
                </td>
              </tr>
            ) : (
              parsedLogs.map((log, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{log?.DispatchTo || "-"}</td>
                  <td>{log?.CourierName || "-"}</td>
                  <td>{log?.DocketNumber || "-"}</td>
                  <td>{log?.OtherName || "-"}</td>
                  <td>{log?.CreatedByName || "-"}</td>
                  <td>{log?.dtEntry || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </Tables>
      </div>
      <div className="row p-2 px-4 d-flex justify-content-end">
        <CancelButton
          text={t("Close")}
          onClick={onClose}
          className="btn-secondary"
        />
      </div>
    </Modal>
  );
};