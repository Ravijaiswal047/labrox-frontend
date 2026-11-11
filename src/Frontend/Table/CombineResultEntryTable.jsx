import React, { useState, useRef, useEffect } from "react";
import parse from "html-react-parser";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import moment from "moment";
import { CheckDevice, dateConfig, downloadPdf, IndexHandle, parseRemarks } from "../../utils/helpers";
import Loading from "../../components/loader/Loading";
import CustomModal from "../utils/CustomModal";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import Medical from ".././Images/Medical.png";
import file from ".././Images/file.png";
import Tables from "../../components/UI/customTable";
import { axiosReport } from "../../utils/axiosInstance";
import CustomDateModal from "../utils/CustomDateModal";
import CryptoJS from "crypto-js";
import Urgent from ".././Images/urgent.gif";
import SpinnerLoad from "../../components/loader/SpinnerLoad";
import Tooltip from "../../components/formComponent/Tooltip";
import UpdateRemark from "../utils/UpdateRemark";
import { Link } from "react-router-dom";
import { FaEye } from "react-icons/fa";
import PatientDetailModal from "../utils/PatientDetailModal";
import { FaPlus } from "react-icons/fa"; // added
import AddRemark from "../utils/AddRemark"; // added
import { getAccurateAge } from "../../utils/Constants";
import { RemarkTooltip } from "../utils/RemarkTooltip";
import { Tooltip as ReactTooltip } from "react-tooltip";
import { notify } from "../../utils/utils";
import PdfPreviewModal from "../utils/PdfPreviewModal";
import './ResultEntryTable.css';

function RETable({
  redata,
  GetResultEntry,
  show,
  show2,
  columnConfig,
  TableData,
  Status,
  selectedRowIndex,
  setSelectedRowIndex,
  doctorAdmin,
  machine,
  currentPage,
  // CreateCheckbox,
  setReturnFromResultTableWithStatus,
  pageSize,
  GetResultEntryCulture,
  getAllergyData,
  setReportType,
  GetResultEntryCulture2
}) {
  const [modal, setModal] = useState(false);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [selectedTests, setSelectedTests] = useState({});
  const [selectedLedgerTransactionNo, setSelectedLedgerTransactionNo] =
    useState(null);
  const [selectedTestID, setSelectedTestID] = useState(null);
  const [datemodal, showDatemodal] = useState(false);
  const [visitID, setVisitID] = useState();
  const [TestID, setTestID] = useState();
  const [loading, setLoading] = useState(false);
  const [Index, setIndex] = useState(-1);
  const [prevPageSize, setPreviousPageSize] = useState();
  const [printLoading, setPrintLoading] = useState({
    With: false,
    Without: false,
    index: -1,
  });
  // added
  const [showAddRemark, setShowAddRemark] = useState({
    modal: false,
    rowData: null,
  });

  console.log("Show add remark hello", showAddRemark)
  const [showUpdateRemark, setShowUpdateRemark] = useState({
    modal: false,
    data: "",
    index: -1,
  });
  const [previewConfig, setPreviewConfig] = useState({
    visible: false,
    url: null,
  });

  const handleOpenPreview = (guid) => {
    if (guid) {
      setPreviewConfig({ visible: true, url: guid });
    } else {
      toast.error("No attachment found for this record");
    }
  };

  const handleClosePreview = () => {
    setPreviewConfig({ visible: false, url: null });
  };

  // console.log(redata)
  const tdRefs = useRef([]);
  console.log("re table", redata);
  useEffect(() => {
    if (tdRefs?.current[selectedRowIndex]) {
      tdRefs?.current[selectedRowIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest",
      });
    }
  }, [selectedRowIndex]);

  const { t } = useTranslation();
  console.log(selectedRowIndex);

  const [medicalHistoryTooltipData, setMedicalHistoryTooltipData] = useState({
    data: [],
    loadingIndex: -1,
  });

  const fetchMedicalHistoryTooltipData = (medicalHistoryList, index) => {
    try {
      if (medicalHistoryList) {
        const medicalHistory = typeof medicalHistoryList === 'string'
          ? JSON.parse(medicalHistoryList)
          : medicalHistoryList;
        setMedicalHistoryTooltipData({
          data: medicalHistory,
          loadingIndex: -1,
        });
      }
    } catch (error) {
      console.error("Error parsing medical history:", error);
      setMedicalHistoryTooltipData({
        data: [],
        loadingIndex: -1,
      });
    }
  };
  // const handleCheck = (data)
  //  => {
  //   console.log("Data",data);
  //   let check = true;
  //   const datas = parse(data?.TestName);
  //   console.log("datas",datas);
  //   if (datas.length > 0) {
  //     const val = datas?.map((ele) => {
  //       return ele?.props?.className;
  //     });

  //     if (val.includes("round Status-5") || val.includes("round Status-6")) {
  //       return (check = true);
  //     } else {
  //       return (check = false);
  //     }
  //   } else {
  //     return (check =
  //       datas?.props?.className.includes("round Status-5") ||
  //       datas?.props?.className.includes("round Status-6"));
  //   }
  // };

  function CreateCheckbox({ item, ledgerId }) {
    console.log("item", item);
    if (item.Status == 5 || item.Status == 6) {

      return <input type="checkbox"
        onClick={(e) => e.stopPropagation()}
        onChange={() => handleCheck(item, ledgerId)}
        checked={
          selectedTests[ledgerId]?.includes(item.TestIdhash) || false
        }
        value={item.TestIdhash}
        id={item.LedgerTransactionID}
        className={`${item.LedgerTransactionID}`} />;
    }

    else {
      return "";
    }
  }

  const handleCheck = (item, ledgerId) => {
    setSelectedTests((prev) => {
      const prevList = prev[ledgerId] || [];

      const updatedList = prevList.includes(item.TestIdhash)
        ? prevList.filter((id) => id !== item.TestIdhash)
        : [...prevList, item.TestIdhash];

      return {
        ...prev,
        [ledgerId]: updatedList,
      };
    });
  };

  console.log("selectedTests", selectedTests);

  // const handleReport = (data, loader, index, PHead) => {
  //   console.log("printttt",data);
  //   if (printLoading.index === -1) {
  //     setPrintLoading({ ...printLoading, index: index });
  //     let TestIDHash = [];
  //     let documentlength = document.getElementsByClassName(
  //       data?.LedgerTransactionID,
  //     );

  //     const extractedValues = extractValuesFromHtml(data?.TestName);

  //     for (let i = 0; documentlength.length > i; i++) {
  //       const checkboxValue = documentlength[i].value;
  //       if (
  //         documentlength[i].checked &&
  //         extractedValues.includes(checkboxValue)
  //       ) {
  //         TestIDHash.push(
  //           document.getElementsByClassName(data?.LedgerTransactionID)[i].value,
  //         );
  //       }
  //     }
  //     setPrintLoading({
  //       [loader]: true,
  //       index: index,
  //     });

  //     if (TestIDHash?.length === 0) {
  //       TestIDHash.push(...extractedValues);
  //     }
  //     const requestOptions = {
  //       ...(CheckDevice() == 1 && { responseType: "blob" }),
  //     };
  //     axiosReport
  //       .post(
  //         `commonReports/GetLabReport`,
  //         {
  //           TestIDHash: [...new Set(TestIDHash)],
  //           PHead: PHead,
  //           PrintColour: "1",
  //           IsDownload: 1,

  //         },

  //         { responseType: "blob" },
  //       )
  //       .then((res) => {
  //           const blob = new Blob([res.data], { type: "application/pdf" });
  //           const url = window.URL.createObjectURL(blob);
  //           window.open(url, "_blank");
  //           if (window.innerWidth <= 765) {
  //             downloadPdf(res.data);
  //           }
  //         setPrintLoading({
  //           [loader]: false,
  //           index: -1,
  //         });
  //       })
  //       .catch((err) => {
  //         toast.error(
  //           err?.response?.data?.message
  //             ? err?.response?.data?.message
  //             : err?.data?.message,
  //         );
  //         setPrintLoading({
  //           [loader]: false,
  //           index: -1,
  //         });
  //       });
  //   } else {
  //     toast.warn("Please wait Generating Report");
  //   }
  // };

  const getPrintableTestHashes = (data) => {
    return data.TestDetails
      .filter((t) => t.Status === 5 || t.Status === 6)
      .map((t) => t.TestIdhash);
  };

  const hasPrintableTests = (data) => {
    return data?.TestDetails?.some(
      (item) => item.Status == 5 || item.Status == 6
    );
  };

  const handleReport = (data, loader, index, PHead) => {
    if (printLoading.index !== -1) {
      toast.warn("Please wait Generating Report");
      return;
    }

    const ledgerId = data.LedgerTransactionID;

    // Checked tests
    let TestIDHash = selectedTests[ledgerId] || [];
    // unchecked tests
    if (TestIDHash.length === 0) {

      TestIDHash = data.TestDetails
        .filter((test) => test.Status == 5 || test.Status == 6)
        .map((test) => test.TestIdhash);
    }

    if (TestIDHash.length === 0) {
      toast.warn("No printable report found");
      return;
    }

    setPrintLoading({ [loader]: true, index });

    axiosReport
      .post(
        "commonReports/GetLabReport",
        {
          TestIDHash: [...new Set(TestIDHash)],
          PHead,
          PrintColour: "1",
          IsDownload: 1,
        },
        { responseType: "blob" }
      )
      .then(async (res) => {
        const blob = res.data;

        // Try to detect if the response is a JSON error message
        const isJson =
          blob.type === "application/json" ||
          blob.type === "text/json" ||
          blob.type === "text/plain";

        if (isJson) {
          // Convert blob to JSON
          const text = await blob.text();
          let json = {};
          try {
            json = JSON.parse(text);
            if (!json.success) {
              notify(json?.message, 'error');
              setPrintLoading({ [loader]: false, index: -1 });
              return
            }
            notify(json?.message || "Something went wrong", "error");
          } catch { }
          setPrintLoading({ [loader]: false, index: -1 });
          return;
        }

        // Otherwise, PDF is received
        const pdfUrl = window.URL.createObjectURL(blob);
        window.open(pdfUrl, "_blank");
        // For mobile download
        if (window.innerWidth <= 765) {
          downloadPdf(res.data);
        }
        setPrintLoading({ [loader]: false, index: -1 });
        setSelectedTests({});
        setSelectedTestID(null);
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message || "Print failed"
        );
        setPrintLoading({ [loader]: false, index: -1 });
        setSelectedTestID(null);
      });
  };

  const copyToClipboard = (phone) => {
    console.log(phone);
    navigator.clipboard.writeText(phone);
    // toast.success("Copied T");
  };

  useEffect(() => {
    if (currentPage > 1) {
      setPreviousPageSize(Number(window?.sessionStorage.getItem(`REprevPZ-${currentPage - 1}`)))
    } else {
      setPreviousPageSize(0)
    }
    // setSelectedTestID(null);
  }, [redata])

  const handleClickResultEntry = (data, index) => {
    setReturnFromResultTableWithStatus(data?.Status)
    setIndex(index);
    // console.log(doctorAdmin)
    setReturnFromResultTableWithStatus(data?.Status)
    setSelectedRowIndex(index);
    setReportType(data?.ReportType);
    GetResultEntry(
      {
        TestID: data?.TestID,
        LedgerTransactionID: "",
        DepartmentID: "",
        symbol: "",
        Mobile: data?.Mobile,
        VisitNo: data?.VisitNo,
        PEmail: data?.PEmail,
        MacID: machine[0]?.value ?? "",
        LedgertransactionIDHash: data?.LedgertransactionIDHash,
        isOutSource: data?.isOutSource,
        index: index,
        ApprovedBy:
          doctorAdmin?.length == 1 ? doctorAdmin[0]?.value?.toString() : "0",
      },

      index,
      setLoading,
    );
    // }
  };

  // RE Allergy Visit Data screen function 

    const getdata = (data, index) => {
        console.log("data", data);
        setReportType(data?.ReportType);
        GetResultEntryCulture(
            {
                LedgerTransactionId: data?.LedgertransactionId,
                TestID: data?.TestID,
                DepartmentId: data?.DepartmentId,
                VisitNo: data?.LedgerTransactionNo,
                BarcodeNo: data?.BarcodeNo,
                ReportNumber: "1",
            },

            index,
            setLoading,
            "1",
        );
        getAllergyData();
        setIndex(index);
    };

  
// RCulture data
  const getCulturedata = (data, index) => {
    console.log(data);
    setReportType(data?.ReportType);
    GetResultEntryCulture2(
      {
        LedgerTransactionID: data?.LedgerTransactionID,
        TestID: Number(data?.TestID),
        DepartmentID: data?.DepartmentID,
        VisitNo: data?.VisitNo,
        BarcodeNo: data?.SinNo,
      },

      index,
      setLoading,
      "Preliminary 1",
    );
    setIndex(index);
  };

  const encryptData = (data, index) => {
    const secretKey = "resultentry";
    const filteredData = {
      TestID: data?.TestID,
      Mobile: data?.Mobile,
      VisitNo: data?.VisitNo,
      PEmail: data?.PEmail,
      LedgertransactionIDHash: data?.LedgertransactionIDHash,
      isOutSource: data?.isOutSource,
      index: index,
      ApprovedBy:
        doctorAdmin?.length == 1 ? doctorAdmin[0]?.value?.toString() : "0",
      MacID: machine[0]?.value ?? "",
    };
    const encrypted = CryptoJS.AES.encrypt(
      JSON.stringify(filteredData),
      secretKey,
    ).toString();
    return encodeURIComponent(encrypted);
  };
  const extractValuesFromHtml = (htmlString) => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlString;

    const inputElements = tempDiv.querySelectorAll('input[type="checkbox"]');
    const extractedValues = Array.from(inputElements).map(
      (input) => input.value,
    );

    return extractedValues;
  };

  const handleAllAprovedChecked = (e, data) => {
    const { checked } = e.target;

    let documentlength = document.getElementsByClassName(
      data?.LedgerTransactionID,
    );
    const extractedValues = extractValuesFromHtml(data?.Test);

    for (let i = 0; i < documentlength.length; i++) {
      const checkboxValue = documentlength[i].value;

      if (extractedValues.includes(checkboxValue)) {
        documentlength[i].checked = checked;
      }
    }
  };

  const handleTestClick = (testID, data, index) => {
    setIndex(index);
    setSelectedRowIndex(index);

    GetResultEntry(
      {
        TestID: testID?.toString(),
        LedgerTransactionID: "",
        DepartmentID: "",
        symbol: "",
        Mobile: data?.Mobile,
        VisitNo: data?.VisitNo,
        PEmail: data?.PEmail,
        MacID: machine[0]?.value ?? "",
        LedgertransactionIDHash: data?.LedgertransactionIDHash,
        isOutSource: data?.isOutSource,
        index: index,
        ApprovedBy:
          doctorAdmin?.length == 1 ? doctorAdmin[0]?.value?.toString() : "0",
      },
      index,
      setLoading
    );
  };

  // const columns = [
  //   { header: "S.No", visible: true },
  //   { header: "Reg Date", visible: true },
  //   { header: "Visit No", visible: true },
  //   { header: "Barcode No", visible: true },
  //   { header: "UHID", visible: true },
  //   { header: "Name", visible: true },
  //   { header: "Mobile", visible: true },
  //   { header: "Age/Gender", visible: true },
  //   { header: "Test", visible: true },
  //   { header: "Print", visible: true },
  //   { header: "Doctor", visible: true },
  //   { header: "Centre", visible: true },
  //   { header: "RateType", visible: true },
  //   { header: "Dep. Receive Time", visible: true },
  //   { header: "Remarks", visible: true },
  //   {
  //     header: "Uploaded Document",
  //     visible: true,
  //     icon: "fa-file",
  //     tooltip: "Uploaded Document",
  //     style: { margin: "2px 8px" },
  //   },
  //   {
  //     header: "Medical History",
  //     visible: true,
  //     icon: "fa-h-square",
  //     tooltip: "Medical History",
  //     style: { margin: "2px 8px" },
  //   },
  //   {
  //     header: "Customize Date",
  //     visible: true,
  //     icon: "fa fa-edit",
  //     tooltip: "Medical History",
  //   },
  // ];
  console.log("redata", redata);
  console.log("select", selectedTestID);
  return (
    <>
      {/* added */}
      {showAddRemark?.modal && (
        <AddRemark
          show={showAddRemark.modal}
          handleShow={() => {
            setShowAddRemark({ modal: false, rowData: null });
            TableData(Status);
          }}
          rowData={showAddRemark.rowData}
          bindTestFromRow={false}
          visitKey="VisitNo"
          testIDsKey="TestID"
          testNamesKey="TestName"
          ledgerTransactionIDKey="LedgerTransactionID"
          patientNameKey="PatientName"
          ageGenderKey={["Age", "Gender"]}
        />
      )}
      {redata.length > 0 ? (
        <div className="p-2 ">
          <Tables
            style={{
              maxHeight: "400px",
              overflowY: "auto",
            }}
          >
            <div>
              <thead
                className=""
                style={{
                  position: "sticky",
                  top: 0,
                }}
              >
                <tr>
                  {columnConfig.map(
                    (col, index) =>
                      col.visible && (
                        <th key={index}>
                          {col?.icon ? (
                            <>
                              <i
                                className={`fa ${col?.icon}`}
                                data-toggle="tooltip"
                                title={col?.tooltip || col?.header}
                                style={col?.style}
                              />
                            </>
                          ) : (
                            t(col?.header)
                          )}
                        </th>
                      ),
                  )}
                </tr>
              </thead>
              <tbody
                style={{
                  backgroundColor:
                    printLoading?.With || printLoading?.Without
                      ? "rgba(181, 209, 218, 0.5)"
                      : "",
                }}
              >
                {redata.map((data, index) => {
                  return (
                    <tr
                      key={index}
                      style={{
                        backgroundColor: data?.isOutSource == 1 ? "pink" : "",
                      }}
                      ref={(el) => (tdRefs.current[index] = el)}
                    >
                      {columnConfig.map(
                        (col, colIndex) =>
                          col.visible && (
                            <td
                              key={colIndex}
                              style={{
                                backgroundColor:
                                  data?.isOutSource == 1
                                    ? "pink"
                                    : selectedRowIndex === index
                                      ? "#FCFACA"
                                      : "",
                              }}
                              data-title={t(col.header)}
                              onClick={() => {
                                col.header === "Visit No" && data?.VisitNo;
                              }}
                            >
                              {col.header === "S.No" && (
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-around",
                                  }}
                                >
                                  <div>{prevPageSize + index + 1}</div>
                                  {/* <div>{index + 1 + IndexHandle(currentPage, redata.length-1)}</div> */}
                                  &nbsp;
                                  {data.StatSample == 1 ? (
                                    <div>
                                      <span
                                        className="fa fa-cog fa-spin"
                                        data-toggle="tooltip"
                                        data-placement="top"
                                        title="STATSample"
                                      ></span>
                                    </div>
                                  ) : (
                                    <></>
                                  )}
                                  &nbsp;
                                  {data?.UploadDocumentCount > 0 && (
                                    <div>
                                      <i
                                        className="fa bi-file-earmark-pdf text-primary cursor-pointer"
                                        style={{ fontSize: '18px' }}
                                        onClick={() => handleOpenPreview(data?.TestIdhash)}
                                      ></i>
                                    </div>
                                  )}
                                  <div>
                                    <i
                                      className="fa fa-search"
                                      onClick={() => {
                                        setModal(true);
                                        setVisitID(data?.VisitNo);
                                      }}
                                      style={{ cursor: "pointer" }}
                                    />

                                  </div>

                                  &nbsp; &nbsp;
                                  {data?.isUrgent == 1 && (
                                    <div>
                                      <img
                                        src={Urgent}
                                        className="sizeicon"
                                      ></img>
                                    </div>
                                  )}
                                </div>
                              )}
                              {col.header === "S.CollectionDate" &&
                                <div>
                                  <p className="mb-0">{data?.PreSampleCollectionDate?.split(' ')?.[0]}</p>
                                  <p className="mb-0">{data?.PreSampleCollectionDate?.split(' ')?.slice(1)}</p>
                                </div>}
                              {col.header === "Reg Date" &&
                                dateConfig(data?.Date)}
                              {col.header === "Dep. Receive Time" &&
                                data?.SampleReceiveDate &&
                                moment(data?.SampleReceiveDate).format(
                                  "DD/MMM/YYYY hh:mm:ss A"
                                )}
                              {col.header === "Visit No" && (
                                <div
                                  style={{
                                    cursor: "pointer",
                                    display: "flex",
                                    justifyContent: "space-around",
                                  }}
                                > 
                                  
                                  <div
                                    className="text-primary"
                                    // onClick={() => {
                                    //   handleClickResultEntry(data, index);
                                    // }}
                                    onClick={() =>
                                        data?.ReportType === "1" || data?.ReportType === "2"
                                            ? handleClickResultEntry(data, index)
                                            : data?.ReportType === "22" ? getdata(data, index) : getCulturedata(data,index)
                                    }
                                  >
                                    {loading && index === Index ? (
                                      <Loading />
                                    ) : (
                                      data?.VisitNo
                                    )}
                                  </div>
                                  <Link
                                    to={{
                                      pathname: "/ResultEntry",
                                      search: `?id=${encryptData(data, index)}`,
                                    }}
                                    target="_blank"
                                  >
                                    <i
                                      className="ml-2 mr-2 mb-1 bi bi-box-arrow-in-up-right text-icon-size-arrow"
                                      style={{ color: "#1FA4E3" }}
                                    ></i>{" "}
                                  </Link>
                                </div>
                              )}
                              {col.header === "Ward No" && data?.BedNo}
                              {col.header === "hmis_patCrNo" &&
                                data?.hmis_patCrNo}
                              {col.header === "Barcode No" && data?.SinNo}
                              {col.header === "UHID" && data?.PatientCode}
                              {col.header === "Name" && 
                                (
                                  <>
                                    {data?.IsVip === 1 && (
                                      <i
                                        className="bi bi-shield-fill-check mr-1 vip-font-size"
                                        style={{ color: "#FFC107", display: "inline" }}
                                        title="VIP Patient"
                                      />
                                    )}
                                    {data?.PatientName}
                                  </>
                                )

                              }
                              {col.header === "Mobile" && data?.Mobile}
                              {col.header === "Age/Gender" &&
                                `${getAccurateAge(data?.Age)}/${data?.Gender == "Female" ? "F" : "M"}`}
                              {/* {col.header === "Test" && (
                              <div className="printTest">
                                {parse(data?.TestName)}
                              </div>
                            )} */}

                              {col.header === "Test" && (
                                <div className="printTest">
                                  {data?.TestDetails.map((test, testIndex) => (
                                    <div key={testIndex} className="">
                                      <div
                                        className={`round Status-${test.Status}`}
                                        onClick={() => handleTestClick(test.TestID, data, testIndex)}
                                      >
                                        {test.TestName.split("<br>")[0] && (
                                          <p className="mb-0">
                                            <span className="mr-1">
                                              <CreateCheckbox item={test} ledgerId={data.LedgerTransactionID} />

                                            </span>
                                            {test.TestName.split("<br>")[0]}
                                          </p>
                                        )}

                                        {test.TestName.split("<br>").slice(1).map((line, lineIndex) => (
                                          <p key={lineIndex} className="mb-0">
                                            {line}
                                          </p>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {col.header === "Print" && hasPrintableTests(data) && (
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    cursor: "pointer",
                                  }}
                                >
                                  {printLoading.Without &&
                                    printLoading.index === index ? (
                                    <div>
                                      <SpinnerLoad />
                                    </div>
                                  ) : (
                                    <i
                                      className="fa fa-print iconStyle"
                                      style={{
                                        cursor: "pointer",
                                        textAlign: "center",
                                      }}
                                      onClick={() =>
                                        handleReport(data, "Without", index, 0)
                                      }
                                      title="Print without header"
                                    ></i>
                                  )}
                                  &nbsp;&nbsp;&nbsp;&nbsp;
                                  {printLoading.With &&
                                    printLoading.index === index ? (
                                    <div>
                                      <SpinnerLoad />
                                    </div>
                                  ) : (
                                    <i
                                      className="fa fa-print iconStyle"
                                      style={{
                                        color: "red",
                                        cursor: "pointer",
                                        textAlign: "center",
                                      }}
                                      onClick={() =>
                                        handleReport(data, "With", index, 1)
                                      }
                                      title="Print with header"
                                    ></i>
                                  )}
                                </div>
                              )}
                              {col.header === "Doctor" && data?.DoctorName}
                              {col?.header === "Dept.Category" && data?.Category}
                              {col?.header === "VisitType" && data?.VisitType}
                              {col.header === "Centre" && data?.Centre}
                              {col.header === "RateType" && data?.RateTypeName}
                              {col.header === "RateTypeCode" && data?.RateTypeCode}

                              {/* Added */}
                              {col.header === "Remarks" && (
                                <div
                                  style={{ gap: "4px" }}
                                  className="d-flex align-items-center justify-content-center"
                                >
                                  {<div
                                    data-tooltip-id={`remark-tooltip-${index}`}
                                    onClick={() => {
                                      setShowAddRemark({
                                        modal: true,
                                        rowData: {
                                          ...data,
                                        },
                                      });
                                    }}
                                    style={{
                                      cursor: "pointer",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "3px", // smaller gap
                                    }}
                                  >
                                    <div
                                      style={{
                                        backgroundColor: "green",
                                        borderRadius: "50%",
                                        width: "18px", // smaller width
                                        height: "18px", // smaller height
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
                                      }}
                                    >
                                      <FaPlus color="white" size={8} />{" "}
                                      {/* smaller plus icon */}
                                    </div>
                                    {data.LabRemarkCount > 0 && (
                                      <span
                                        style={{
                                          fontSize: "12px",
                                          fontWeight: "bold",
                                        }}
                                      >
                                        ({data.LabRemarkCount})
                                      </span>
                                    )}
                                  </div>}
                                  {(Array.isArray(data?.RemarksList)) && data?.RemarksList?.length > 0 && (
                                    <ReactTooltip
                                      id={`remark-tooltip-${index}`}
                                      place="top"
                                      style={{ zIndex: 9999 }}
                                      clickable
                                      content={<RemarkTooltip remarks={data.RemarksList} />}
                                    />)}
                                  <FaEye
                                    style={{
                                      marginLeft: "10px",
                                      fontSize: "18px",
                                      cursor: "pointer",
                                      color: "#007bff",
                                    }}
                                    onClick={() => {
                                      setShowPatientModal(true);
                                      setSelectedLedgerTransactionNo(
                                        data?.VisitNo,
                                      );
                                      setSelectedTestID(data?.TestID || 0);
                                    }}
                                  />
                                </div>
                              )}
                              {col.header === "Uploaded Document" && (
                                <img
                                  src={file}
                                  className="sizeicon"
                                  style={{
                                    cursor: "pointer",
                                    color:
                                      data?.UploadDocumentCount > 0
                                        ? "#4ea30c"
                                        : "",
                                  }}
                                  onClick={() => {
                                    show2({
                                      modal: true,
                                      data: data?.PatientGuid,
                                      index: index,
                                    });
                                  }}
                                />
                              )}
                              {col.header === "Medical History" && (
                                <>
                                  <img
                                    src={Medical}
                                    className="sizeicon"
                                    style={{
                                      cursor: "pointer",
                                      color:
                                        data?.MedicalHistoryCount > 0
                                          ? "#4ea30c"
                                          : "",
                                    }}
                                    onClick={() => {
                                      show({
                                        modal: true,
                                        data: data?.PatientGuid,
                                        index: index,
                                        ID: data?.LedgerTransactionID
                                      });
                                    }}
                                    onMouseEnter={() => {
                                      if (data?.MedicalHistoryCount > 0) {
                                        fetchMedicalHistoryTooltipData(data?.MedicalHistoryList, index);
                                      }
                                    }}
                                    data-tooltip-id={`medical-history-tooltip-${index}`}
                                  />
                                  <span> {(data?.MedicalHistoryCount > 0) && `(${data?.MedicalHistoryCount > 0 && data?.MedicalHistoryCount})`} </span>

                                  {data?.MedicalHistoryCount > 0 && (
                                    <ReactTooltip
                                      id={`medical-history-tooltip-${index}`}
                                      place="top"
                                      style={{
                                        zIndex: 99999,
                                        backgroundColor: "#fff",
                                        color: "#000",
                                        padding: "8px",

                                      }}
                                      clickable
                                      content={
                                        medicalHistoryTooltipData?.data &&
                                          medicalHistoryTooltipData.data.length > 0 ? (
                                          <div style={{ maxHeight: "300px", overflowY: "auto", width: "400px", position: "relative", background: "rgba(143, 142, 142, 0.9)" }}>
                                            <table className="table table-sm table-bordered mb-0">
                                              <thead>
                                                <tr>
                                                  <th>S.No</th>
                                                  <th>Medical History</th>
                                                  <th>Created Date</th>
                                                  <th>Created By</th>
                                                </tr>
                                              </thead>
                                              <tbody>
                                                {medicalHistoryTooltipData.data.map((item, idx) => (
                                                  <tr key={idx}>
                                                    <td>{idx + 1}</td>
                                                    <td>{item.MedicalHistory}</td>
                                                    <td>{dateConfig(item.CreatedDate)}</td>
                                                    <td>{item.CreatedBy}</td>
                                                  </tr>
                                                ))}
                                              </tbody>
                                            </table>
                                          </div>
                                        ) : (
                                          "No medical history found"
                                        )
                                      }
                                    />
                                  )}
                                </>
                              )}
                              {col.header === "Customize Date" && (
                                <i
                                  className="fa fa-edit"
                                  style={{ cursor: "poinrter" }}
                                  onClick={() => {
                                    setTestID(data.TestID);
                                    showDatemodal(true);
                                  }}
                                />
                              )}
                            </td>
                          ),
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </div>
          </Tables>
        </div>
      ) : (
        <div className="">
          <NoRecordFound />
        </div>
      )}
      {modal && (
        <CustomModal
          show={modal}
          visitID={visitID}
          onHide={() => setModal(false)}
        />
      )}
      {datemodal && (
        <CustomDateModal
          Status={Status}
          SearchFunction={TableData}
          show={datemodal}
          data={TestID}
          onHide={() => showDatemodal(false)}
        />
      )}
      <PdfPreviewModal
        visible={previewConfig.visible}
        url={previewConfig.url}
        onClose={handleClosePreview}
      />
      <PatientDetailModal
        showPH={showPatientModal}
        setShowPH={setShowPatientModal}
        ResultData={[
          {
            LedgerTransactionNo: selectedLedgerTransactionNo,
            TestID: selectedTestID,
          },
        ]}
        Index={0}
      />
    </>
  );
}

export default RETable;
