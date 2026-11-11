import { useEffect, useState } from "react";
import ReactSelect from "../../components/formComponent/ReactSelect";
import Accordion from "../../components/UI/Accordion";
import Input from "../../components/formComponent/Input";
import { useTranslation } from "react-i18next";
import { CustomButton, SearchButton } from "../../components/UI/CustomButton";
import { useLocation } from "react-router-dom";
import Tables from "../../components/UI/customTable";
import { axiosInstance } from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import TableFilterDot from "../../components/FilterTableDot/TableFilterDot";

const DispatchPatientReport = () => {
  const [t] = useTranslation();
  const location = useLocation();
  const locationStateData = location?.state;
  console.log(locationStateData, "test")

  const [formData, setFormData] = useState({
    labNo: locationStateData?.VisitNo ?? "",
    dispatchTo: null,
    courierName: "",
    otherName: "",
    docketNumber: "",
  });
  const [tableData, setTableData] = useState([]);
  const selectAll = tableData.length > 0 && tableData.every((item) => item.IsSelected);
  const hasNonApproved = tableData.some(
    (item) => item?.IsDispatch !== 1 && item?.Approved !== 1
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
      IsSelected: checked,
    }));

    setTableData(updatedData);
  };
  const handleCheckboxChange = (index, checked) => {
    const updatedData = [...tableData];
    updatedData[index].IsSelected = checked;

    setTableData(updatedData);
    const allSelected = updatedData.every(item => item.IsSelected);
  };

  const fetchPatientData = async () => {
    try {
      const res = await axiosInstance.post("Dispatch/DispatchSearchByLabNo", {
        labNo: formData.labNo,
      });

      const data = res?.data;
      if (data?.success) {
        setTableData(data?.message);
      }
    } catch (error) {
      console.log("Error while fetching data", error);
      setTableData([]);
    }
  };

  useEffect(() => {
    fetchPatientData();
  }, []);
  const handleFeedback = async () => {
    const patientData = tableData?.[0];

    if (!patientData) {
      toast.error("Patient data not found");
      return;
    }

    const payloadData = {
      LedgerTransactionIDHash: patientData?.LedgerTransactionIDHash,
      LedgerTransactionID: patientData?.LedgerTransactionID,
      VisitNo: patientData?.VisitNo,
      PName: patientData?.PatientName,
      Age: patientData?.Age,
      Gender: patientData?.Gender,
      MobileNo: patientData?.Mobile,
    };

    console.log("Feedback Payload", payloadData);

    try {
      const res = await axiosInstance.post(
        "Dispatch/SaveFeedbackSMS",
        payloadData
      );

      const data = res?.data;

      if (data?.success) {
        toast.success(data?.message || "Feedback SMS sent successfully");
      } else {
        toast.error(data?.message || "Feedback SMS not sent");
      }
    } catch (error) {
      console.log("Error while sending feedback SMS", error);
      toast.error(error?.response?.data?.message || "Error Occurred");
    }
  };
  const dispatchTests = async () => {
    if (!selectAll) {
      toast.error("Please Select All Tests.");
      return
    }
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
      ledgerTransactionID: locationStateData?.LedgerTransactionID,
      LedgerTransactionIDHash: locationStateData?.LedgertransactionIDHash,
      PatientName: locationStateData?.PatientName,
      Mobile: locationStateData?.Mobile,
      Gender: locationStateData?.Gender,
      Age: locationStateData?.Age,
      visitNo: formData.labNo,
      barcodeNo: locationStateData?.SinNo,
      dispatchTo: formData?.dispatchTo,
      otherName: formData?.otherName,
      courierName: formData?.courierName,
      docketNumber: formData?.docketNumber,
      testID: selectedTestIDs,
    }

    try {
      const res = await axiosInstance.post("Dispatch/DispatchSaveLog", payloadData);

      const data = res?.data;
      if (data?.success) {
        toast.success("Dispatched successfully")

        // setTableData((prevData) =>
        //   prevData.map((item) => {
        //     if (selectedTestIDs.includes(String(item.TestID))) {
        //       return { ...item, IsSelected: false };
        //     }
        //     return item;
        //   })
        // );
        fetchPatientData();

      }
    } catch (error) {
      console.log("Error while fetching data", error);
      setTableData([]);
    }
  };

  const sampleStatus = [
    {
      value: 1,
      label: t("Not Approved"),
      color: "#ffffff", // Green
    },
    {
      value: 2,
      label: t("Approved"),
      color: "#9cd355ff", // Green
    },
    {
      value: 3,
      label: t("Dispatched"),
      color: "#44a3aa", // Green
    },
  ]

  return (
    <>
      <Accordion
        name={`${t("Dispatch Patient Report")}`}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row px-2 mt-2 p-1">
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
          <div className="col-sm-1">
            <span onClick={fetchPatientData}>
              <SearchButton text={"Search"} />
            </span>
          </div>

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
          <div className="col-sm-3 d-flex" style={{ gap: "5px" }}>
            <span onClick={dispatchTests}>
              <CustomButton text={"Dispatch"} icon={"share"} />
            </span>

            {tableData?.some((item) => Number(item?.Status) === 15) && (
              <CustomButton
                text={"Feedback"}
                icon={"edit"}
                variant="warning"
                onClick={handleFeedback}
              />
            )}
          </div>
          {/* <div className="col-sm-3 d-flex" style={{ gap: "5px" }}>


            {tableData?.some((item) => Number(item?.Status) === 15) && (
              <CustomButton
                text={"Feedback"}
                icon={"edit"}
                variant="warning"
                onClick={handleFeedback}
              />
            )}
          </div> */}
        </div>
      </Accordion>
      <Accordion name={`${t("Patient Detail")}`} defaultValue={true}>
        <div className="row px-2 mt-2 p-1">
          <div className="col-sm-4 d-flex" style={{ gap: "8px" }}>
            <div style={{ fontWeight: "600" }}>Patient Name: </div>
            <div>{locationStateData?.PatientName}</div>
          </div>
          <div className="col-sm-4 d-flex" style={{ gap: "8px" }}>
            <div style={{ fontWeight: "600" }}>Visit No: </div>
            <div>{locationStateData?.VisitNo}</div>
          </div>
          <div className="col-sm-4 d-flex" style={{ gap: "8px" }}>
            <div style={{ fontWeight: "600" }}>Age: </div>
            <div>{locationStateData?.Age}</div>
          </div>
          <div className="col-sm-4 d-flex" style={{ gap: "8px" }}>
            <div style={{ fontWeight: "600" }}>Gender: </div>
            <div>{locationStateData?.Gender}</div>
          </div>
          <div className="col-sm-4 d-flex" style={{ gap: "8px" }}>
            <div style={{ fontWeight: "600" }}>Refer Doctor: </div>
            <div>{locationStateData?.DoctorName}</div>
          </div>
          <div className="col-sm-4 d-flex" style={{ gap: "8px" }}>
            <div style={{ fontWeight: "600" }}>Client Name: </div>
            <div>{locationStateData?.RateTypeName}</div>
          </div>
        </div>
      </Accordion>
      <Accordion
        name={`${t("Test Data")}`}
        defaultValue={true}
        notOpen={true}
        linkTo={"#"}
        linkTitle={
          <div
            style={{ gap: "6px" }}
            className="mt-1 mb-1 px-2 py-1 d-flex sampleStatusClass"
          >
            {sampleStatus?.map((sItem, idx) => (
              <TableFilterDot
                key={idx}
                color={`${sItem?.color}`}
                title={`${sItem?.label}`}
                // onClick={() => filterStatusWise(sItem?.value)}
                bgColor={`#e9e2e1`}
              />
            ))}
          </div>
        }
      >
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
              // const statusLabel = getStatusLabel(
              //   item?.Status,
              //   t,
              //   statusOptions
              // );

              // 2. Derived Dispatch/Approval Status Logic
              let dispatchStatusText = t("Non-Approved");
              if (item?.IsDispatch == 1) {
                dispatchStatusText = t("Dispatched");
              } else if (item?.Approved == 1) {
                dispatchStatusText = t("Approved");
              }
              return (
                <tr key={index}
                  style={{
                    backgroundColor: item.IsDispatch == 1 ? "#44a3aa" : item.Approved == 1 ? "#9cd355ff" : ""
                  }}
                >
                  <td data-title={t("S.No")}>{index + 1}</td>

                  <td data-title={t("Department")}>{item?.DepartmentName}</td>
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
                    {(item?.Approved == 1 && item?.IsDispatch == 0) ? (
                      <input
                        type="checkbox"
                        checked={item.IsSelected || false}
                        disabled={hasNonApproved}
                        onChange={(e) =>
                          handleCheckboxChange(index, e.target.checked)
                        }
                      />
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Tables>
      </Accordion>
    </>
  );
};

export default DispatchPatientReport;
