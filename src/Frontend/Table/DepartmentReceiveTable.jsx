import React, { useEffect, useState } from "react";
import parse from "html-react-parser";
import { toast } from "react-toastify";
import { dateConfig, IndexHandle, isChecked, parseAwsKeys } from "../../utils/helpers";
import CustomModal from "../utils/CustomModal";
import RejectModal from "../utils/RejectModal";
import { axiosInstance } from "../../utils/axiosInstance";
import Tables from "../../components/UI/customTable";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import Loading from "../../components/loader/Loading";
import HoldReason from "../utils/HoldReason";
import Medical from ".././Images/Medical.png";
import file from ".././Images/file.png";
import SampleHisto from "./SampleHisto";
import { SelectBox } from "../../components/formComponent/SelectBox";

import { useTranslation } from "react-i18next";
import Urgent from ".././Images/urgent.gif";
import { HistoSeries } from "../../utils/Constants";
import Tooltip from "../../components/formComponent/Tooltip";
import { FaPlus, FaFemale, FaUser } from "react-icons/fa";
import AddRemark from "../utils/AddRemark";
import { Tooltip as ReactTooltip } from "react-tooltip";
import { RemarkTooltip } from "../utils/RemarkTooltip";
import PdfPreviewModal from "../utils/PdfPreviewModal";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import DateTimeCell from "../../utils/DateTimeCell";
function DepartmentReceiveTable({
  drdata,
  show,
  show2,
  TableData,
  setDrData,
  pageType,
  organ,
  doctorAdmin,
  formData,
  searchstatus,
   currentPage,
   pageSize,
   rejectPayload,
   handleRejectPayload,
 }) {
   const {
      HideOutSourceColor, DefaultCurrencyName, RateCentreType  
    } = useLocalStorage("userData", "get");
  // console.log("HideOutSourceColor",HideOutSourceColor);
  const [modal, setModal] = useState(false);
  const [visitID, setVisitID] = useState();
  const [show1, setShow1] = useState({
    modal: false,
    data: {},
  });
  const [load, setLoad] = useState({
    index: -1,
    load: false,
  });
  const [showHold, setShowHold] = useState({
    show: false,
    data: "",
    index: -1,
  });

  const [previewConfig, setPreviewConfig] = useState({
      visible: false,
      url: null,
    });

  const [t] = useTranslation();
  const [showAddRemark, setShowAddRemark] = useState({
    modal: false,
    rowData: null,
  });

  const handleShow = (data, type) => {
    setShow1({
      modal: type,
      data: data,
    });
  };
  const handleCheckbox = (e) => {
    const { checked } = e.target;
    const data = drdata?.map((ele) => {
      return {
        ...ele,
        IsChecked: checked ? 1 : 0,
      };
    });

    setDrData(data);
  };
  const [FilterData, setFilterData] = useState([]);

  useEffect(() => {}, drdata);

  const handleTestID = (e, index) => {
    const { name, checked } = e.target;
    const datas = [...drdata];
    datas[index][name] = checked ? 1 : 0;
    setDrData(datas);
  };
  const handleChange = (e, index) => {
    const { name, value } = e.target;
    const data = [...drdata];

    data[index][name] = value;
    setDrData(data);
  };

  const [medicalHistoryTooltipData, setMedicalHistoryTooltipData] = useState({
    data: [],
    loadingIndex: -1,
  });

  const fetchMedicalHistoryTooltipData = (medicalHistoryList, index) => {
    try {
      if (medicalHistoryList) {
        const medicalHistory =
          typeof medicalHistoryList === "string"
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

  const handleHold = (data, index) => {
    if (load?.load) {
      toast.warn("Please Wait Other Test Are Holding");
    } else {
      setLoad({
        load: true,
        index: index,
      });
      axiosInstance
        .post(`${data?.Status == "16" ? "SC/UnHoldSample" : "SC/HoldSample"}`, {
          data: [
            {
              LedgerTransactionID: data?.LedgerTransactionID,
              VisitNo: data?.VisitNo,
              TestID: data?.TestID,
              Test: data?.Test,
              CentreID: data?.CentreID,
              SINNo: data?.SinNo,
              HoldReason: data?.HoldReason?.trim(),
            },
          ],
        })
        .then((res) => {
          setLoad({
            load: false,
            index: -1,
          });
          setShowHold({ data: "", show: false, index: -1 });
          toast.success(res?.data?.message);
          TableData(2);
        })
        .catch((err) => {
          setLoad({
            load: false,
            index: -1,
          });
          setShowHold({ data: "", show: false, index: -1 });
          toast.error(
            err?.response?.data?.message
              ? err?.response?.data?.message
              : "Something Went Wrong",
          );
        });
    }
  };



  const getAccurateAge = (age = "") => {
    let [year, ysmbol, month, Msymbol, day, Dsymbol] = age.split(" ");
    let newAge = "";
    year = parseInt(year);
    month = parseInt(month);
    day = parseInt(day);

    if (year >= 1) {
      newAge += `${year} ${ysmbol} `;
    }
    if (month >= 1) {
      newAge += `${month} ${Msymbol} `;
    }
    if (day >= 1) {
      newAge += `${day} ${Dsymbol} `;
    }
    return newAge.trim() || "0 D";
  };

  const getSearchController = async () => {
    try {
      const res = await axiosInstance.post(`CompanyMaster/GetPageDataDetails`, {
        pageID: 4,
      });
      if (res?.data.success && Array.isArray(res?.data?.message)) {
        setFilterData(res.data.message);

        const dynamicMappings = { ...headWithApiFields };
        res.data.message.forEach((column) => {
          if (!dynamicMappings[column.ControlDisplayID]) {
            dynamicMappings[column.ControlDisplayID] =
              column.ApiFieldName || column.ControlDisplayID;
          }
        });
        setHeadWithApiFields(dynamicMappings);
      }
    } catch (error) {
      console.log("error", error);
      return { controllersData: [], controllerTabbingOrder: [] };
    }
  };

  const [headWithApiFields, setHeadWithApiFields] = useState({
    "S.No": "Remarks",
    "Reg Date": "Date",
    Visit: "VisitNo",
    "Patient Info": "PName",
    Remarks: "",
    SampleType: "SampleName",
    Department: "Department",
    "Package Name": "PackageName",
    "Barcode No": "SinNo",
    "Collected Time": "PreSampleCollectionDate",
    Reject: "",
    Hold: "",
    "U.D": "U.D",
    "M.H": "MedicalHistoryCount",
    RateTypeCode: "RateTypeCode",
    RateTypeName: "RateTypeName",
    RateTypeNameWithCode: "RateTypeNameWithCode",
  });

  const getFilterHeaderForMerge = (headerName = "") => {
    console.log("FilterData", FilterData);
    const controller = FilterData?.find((item) => {
      const splitID = item?.ControlDisplayID?.split("/") || [];

      return splitID[0]?.toLowerCase() === headerName.toLowerCase();
    });

    return controller?.ControlDisplayID?.split("/") || [];
  };

  const isHeaderKeyPresentInResObj = (headerName, tableRow) => {
    return Object.keys(tableRow)?.some(
      (item) =>
        item?.toLowerCase() == headerName?.split("/")?.[0]?.toLowerCase(),
    );
  };

   const getBarcodeData = (arr, VisitNo, SINNo) => {
    let testIDList = [];
    if (Array?.isArray(arr)) {
      testIDList = arr;
    } else {
      testIDList = [arr];
    }

    axiosInstance
      .post("SC/getBarcode", {
        LedgerTransactionNo: VisitNo,
        BarcodeNo: SINNo,
        TestID: testIDList,
        barcodeNoDepartmentID: 0,
      })
      .then((res) => {
        if (res?.data?.success && res?.data?.message && res?.data?.message.startsWith("http")) {
          window.open(res.data.message, "_blank");
        } else {
          toast.success(res?.data?.message || t("Barcode printed successfully"));
        }
      })
      .catch((err) => {
        toast.info(err?.response?.data?.message || t("Barcode print command sent to printer"));
      });
  };

  const handleOpenPreview = (keys) => {
    const parsedKeys = parseAwsKeys(keys);

    if (!parsedKeys) return;

    setPreviewConfig({
      visible: true,
      url: parsedKeys,
    });
  };

  const handleClosePreview = () => {
    setPreviewConfig({ visible: false, url: null });
  };

  useEffect(() => {
    getSearchController();
  }, []);
  console.log("drdata", drdata);
  console.log("FilterData", FilterData);

  return (
    <>
      {show1?.modal && (
        <RejectModal
          show={show1?.modal}
          handleShow={() => handleShow(null, false)}
          data={show1?.data}
          TableData={TableData}
        />
      )}

      {showHold?.show && (
        <HoldReason
          showHold={showHold}
          setShowHold={setShowHold}
          handleHold={handleHold}
        />
      )}
      {showAddRemark?.modal && (
        <AddRemark
          show={showAddRemark.modal}
          handleShow={() => {
            setShowAddRemark({ modal: false, rowData: null });
            TableData(searchstatus);
          }}
          rowData={showAddRemark.rowData}
          bindTestFromRow={false}
          defaultTestFromRow={true}
          filterTestID={showAddRemark.rowData?.TestID}
          visitKey="VisitNo"
          testIDsKey="TestID"
          testNamesKey="Test"
          ledgerTransactionIDKey="LedgerTransactionID"
          patientNameKey={["FirstName", "MiddleName", "LastName"]}
          ageGenderKey={["Age", "Gender"]}
        />
      )}
      <PdfPreviewModal
        visible={previewConfig.visible}
        url={previewConfig.url}
        onClose={handleClosePreview}
      />
      {drdata.length > 0 ? (
        <div className="row px-2 mt-1 mb-2">
          <div className="col-12 px-0">
            <Tables paginate={"true"} data={drdata}>
              <thead style={{ position: "sticky", top: 0, zIndex: 1 }}>
                <tr>
                  {FilterData?.filter((item) => {
                    if (item?.IsShow == 1 && item?.TypeId == 2) return item;
                  })?.map((theader, idx) => {
                    if (theader?.ControlDisplayID === "S.No") {
                      return (
                        <th className="px-2">
                          <span className="px-2">{t("S.No")}</span>
                        </th>
                      );
                    }
                    if (theader?.ControlDisplayID === "Reg Date") {
                      return <th className="px-2">{t("Reg Date")}</th>;
                    }
                    if (theader?.ControlDisplayID === "Visit") {
                      return <th className="px-2">{t("Visit")}</th>;
                    }
                    if (theader?.ControlDisplayID === "Patient Info") {
                      return <th className="px-2">{t("Patient Info")}</th>;
                    }
                    if (theader?.ControlDisplayID === "Remarks") {
                      return <th className="px-2">{t("Remarks")}</th>;
                    }
                    if (theader?.ControlDisplayID === "SampleType") {
                      return <th className="px-2">{"Sample Type"}</th>;
                    }
                    if (theader?.ControlDisplayID === "Department") {
                      return <th className="px-2">{t("Department")}</th>;
                    }
                    if (theader?.ControlDisplayID === "Package Name") {
                      return <th className="px-2">{t("Package Name")}</th>;
                    }
                    if (theader?.ControlDisplayID == "Test") {
                      return <th className="px-2">{"Test"}</th>;
                    }
                    if (theader?.ControlDisplayID === "Barcode No") {
                      return <th className="px-2">{t("Barcode No")}</th>;
                    }
                    if (theader?.ControlDisplayID === "Collected Time") {
                      return <th className="px-2">{t("Collected Time")}</th>;
                    }

                    if (theader?.ControlDisplayID === "Hold") {
                      return <th className="px-2">{t("Hold")}</th>;
                    }
                    if (theader?.ControlDisplayID === "U.D") {
                      return (
                        <th
                          data-toggle="tooltip"
                          data-placement="top"
                          title={t("Uploaded Document")}
                          className="px-2"
                        >
                          {t("U.D")}
                        </th>
                      );
                    }
                    if (theader?.ControlDisplayID === "M.H") {
                      return (
                        <th
                          data-toggle="tooltip"
                          data-placement="top"
                          title={t("Medical History")}
                        >
                          {t("M.H")}
                        </th>
                      );
                    }
                    if (theader?.ControlDisplayID === "RateTypeName") {
                      return <th className="px-2">{t("RateTypeName")}</th>;
                    }

                    if (theader?.ControlDisplayID === "RateTypeCode") {
                      return <th className="px-2">{t("RateTypeCode")}</th>;
                    }
                     if (theader?.ControlDisplayID === "RateTypeNameWithCode") {
                       return (
                         <th className="px-2">{t("RateTypeNameWithCode")}</th>
                       );
                     }
                     if (theader?.ControlDisplayID === "Reject") {
                       const isAllSelected =
                         drdata.length > 0 &&
                         drdata
                           .filter(
                             (ele) =>
                               ele.Approved === 0 &&
                               ele.Status !== 4 &&
                               ele.Status !== 5,
                           )
                           .every((ele) => ele.isReject);
                       return (
                         <th className="px-2">
                           <div className="d-flex align-items-center">
                             <label
                               className="switch mb-0"
                               style={{
                                 position: "relative",
                                 display: "inline-block",
                                 width: "24px",
                                 height: "12px",
                               }}
                             >
                               <input
                                 type="checkbox"
                                 onChange={(e) => handleRejectPayload(e)}
                                 checked={isAllSelected}
                                 style={{
                                   opacity: 0,
                                   width: 0,
                                   height: 0,
                                   position: "absolute",
                                 }}
                               />
                               <span
                                 style={{
                                   position: "absolute",
                                   cursor: "pointer",
                                   top: 0,
                                   left: 0,
                                   right: 0,
                                   bottom: 0,
                                   backgroundColor: isAllSelected
                                     ? "#28a745"
                                     : "#ccc",
                                   borderRadius: "12px",
                                   transition: "background-color 0.2s",
                                 }}
                               >
                                 <span
                                   style={{
                                     position: "absolute",
                                     content: "",
                                     height: "8px",
                                     width: "8px",
                                     left: isAllSelected ? "14px" : "2px",
                                     bottom: "2px",
                                     backgroundColor: "white",
                                     borderRadius: "50%",
                                     transition: "left 0.2s",
                                   }}
                                 />
                               </span>
                             </label>
                             <span className="ml-2">{t("Reject")}</span>
                           </div>
                         </th>
                       );
                     }
                    if (theader?.ControlDisplayID === "CheckBox") {
                      return (
                        <>
                          {pageType == 2 && (
                            <th className="text-center">
                              <input
                                type="checkbox"
                                className="mt-2"
                                checked={
                                  drdata?.length > 0
                                    ? isChecked(
                                        "IsChecked",
                                        drdata,
                                        1,
                                      ).includes(false)
                                      ? false
                                      : true
                                    : false
                                }
                                onChange={handleCheckbox}
                              />
                            </th>
                          )}
                        </>
                      );
                    }
                    if (theader?.ControlDisplayID === "Barcode") {
                      return (
                        <th key={idx} className="text-center">
                          <i title={t("Barcode")} className="fa fa-barcode"></i>
                        </th>
                      );
                    }
                    // For New Header
                    return (
                      <th className="px-2">
                        <span className="px-2">
                          {t(theader.ControlDisplayName)}
                        </span>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {drdata.map((data, index) => (
                  <tr
                    key={index + 1}
                    style={{
                      backgroundColor: HideOutSourceColor != 1 ? data?.isOutSource == 1 ? "pink" : "" : "",
                    }}
                  >
                    {FilterData?.filter((item) => {
                      if (item?.IsShow == 1 && item?.TypeId == 2) return item;
                    })?.map((column, colIndex) => {
                      
                      if (column?.ControlDisplayID == "S.No") {
                        return (
                          <td
                            data-title="SNo"
                            className={`color-Status-${data.Status}`}
                          >
                            <div
                              style={{
                                display: "flex",
                                // justifyContent: "space-between",
                                // alignItems: "center",
                                gap: "2px",
                              }}
                            >
                              <div>
                                <span style={{ marginLeft: "3px" }}>
                                  {index +
                                    1 +
                                    IndexHandle(currentPage, pageSize)}
                                </span>
                              </div>
                              {data.StatSample == 1 && (
                                <div>
                                  <span
                                    className="fa fa-cog fa-spin"
                                    data-toggle="tooltip"
                                    data-placement="top"
                                    title="STATSample"
                                  ></span>
                                </div>
                              ) 
                              // : (
                              //   <> &nbsp;</>
                              // )}{" "
                              }
                              &nbsp;
                              <div>
                               {!(DefaultCurrencyName === "KES" && RateCentreType === "B2B") &&(
                                <i
                                  className="fa fa-search"
                                  onClick={() => {
                                    setModal(true);
                                    setVisitID(data?.VisitNo);
                                  }}
                                />
                              )}
                              </div>{" "}
                              {/* &nbsp; &nbsp; */}
                              
                              {data?.IsPatientDocAvail > 0 && (
                                <div>
                                  <i
                                    className="fa bi-file-earmark-pdf text-primary cursor-pointer"
                                    // className="bi bi-paperclip cursor-pointer"
                                    style={{ fontSize: "18px"}}
                                    onClick={() => handleOpenPreview(data?.awsKeys)}
                                    title="View Attachments"
                                  />
                                </div>
                              )}
                              {data?.IsVip === 1 && (
                                <div>
                                  <i
                                    className="bi bi-shield-fill-check mr-1 vip-font-size"
                                    style={{ color: "#ff0f07", display: "inline", width: "5%" }}
                                    title="VIP Patient"
                                  />
                                </div>

                              )}
                              {data?.isUrgent == 1 && (
                                <div>
                                  <img src={Urgent} className="sizeicon" title="Urgent"></img>
                                </div>
                              )}
                              
                            </div>
                          </td>
                        );
                      }
                      if (column?.ControlDisplayID == "Reg Date") {
                        return (
                          <td className="px-2" data-title={"Date"}>
                            <div key={colIndex}>
                              {getFilterHeaderForMerge("Reg Date")?.map(
                                (item, idx) => (
                                  // <p className="mb-0">
                                  //   {`${data?.[headWithApiFields[item]]?.split(" ")?.[0]} 
                                  //  ${data?.[headWithApiFields[item]]?.split(" ")?.[1]}`}
                                  // </p>
                                  <DateTimeCell dateString={data?.[headWithApiFields[item]]} />
                                ),
                              )}
                            </div>
                          </td>
                        );
                      }
                      if (column?.ControlDisplayID == "Visit") {
                        return (
                          <td className="px-2" data-title={"Visit"}>
                            <div key={colIndex}>
                              {getFilterHeaderForMerge("Visit")?.map(
                                (item, idx) => (
                                  <p className="mb-0">
                                    {data?.[headWithApiFields[item]]}
                                  </p>
                                ),
                              )}
                            </div>
                          </td>
                        );
                      }
                      if (column?.ControlDisplayID == "Patient Info") {
                        return (
                          <td className="px-2" data-title={"Patient Info"}>
                            {getFilterHeaderForMerge("Patient Info")?.map(
                              (item, idx) => (
                                <div
                                  className="mb-0"
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "4px",
                                    flexWrap: "wrap",
                                  }}
                                >
                                  {data?.Gender === "Female" ? (
                                    <FaFemale />
                                  ) : (
                                    <FaUser />
                                  )}
                                  <span>{data?.[headWithApiFields[item]]}</span>
                                </div>
                              ),
                            )}

                            <p className="mb-0">
                              <div>
                                {getAccurateAge(data?.Age)} / {data?.Gender}
                              </div>
                            </p>
                          </td>
                        );
                      }
                      if (column?.ControlDisplayID == "PName") {
                        return (
                          <td className="px-2" data-title={"PName"}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                flexWrap: "wrap",
                              }}
                            >
                              {data?.Gender === "Female" ? (
                                <FaFemale />
                              ) : (
                                <FaUser />
                              )}
                              <span>{data?.PName}</span>
                            </div>
                          </td>
                        );
                      }
                      if (column?.ControlDisplayID == "Age") {
                        return (
                          <td className="px-2" data-title={"Age"}>
                            <p className="mb-0">{getAccurateAge(data?.Age)}</p>
                          </td>
                        );
                      }
                      if (column?.ControlDisplayID == "Gender") {
                        return (
                          <td className="px-2" data-title={"Gender"}>
                            <p className="mb-0">{data?.Gender}</p>
                          </td>
                        );
                      }
                      if (column?.ControlDisplayID == "Remarks") {
                        return (
                          <td className="px-2" data-title={"Remarks"}>
                            <div key={colIndex}>
                              {getFilterHeaderForMerge("Remarks")?.map(
                                (item, idx) => (
                                  <p className="mb-0">
                                    {
                                      // theader.ControlDisplayID === "Remarks" &&
                                      data?.[headWithApiFields[item]]
                                    }
                                  </p>
                                ),
                              )}
                            </div>
                            <div
                              style={{ gap: "4px" }}
                              className="d-flex align-items-center justify-content-center"
                            >
                              {
                                <div
                                  data-tooltip-id={`remark-tooltip-${index + 1}`}
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
                                </div>
                              }
                              {!!data?.RemarksList &&
                                Array.isArray(JSON?.parse(data?.RemarksList)) &&
                                data?.RemarksList.length > 0 && (
                                  <ReactTooltip
                                    id={`remark-tooltip-${index + 1}`}
                                    place="top"
                                    style={{ zIndex: 9999 }}
                                    clickable
                                    content={
                                      <RemarkTooltip
                                        remarks={JSON.parse(
                                          data?.RemarksList || "",
                                        )}
                                      />
                                    }
                                  />
                                )}
                            </div>
                          </td>
                        );
                      }
                      if (column?.ControlDisplayID == "SampleType") {
                        return (
                          <td data-title={"SampleType"}>
                            {getFilterHeaderForMerge("SampleType")?.map(
                              (item, idx) => (
                                <p className="mb-0">
                                  {data?.[headWithApiFields[item]]}
                                </p>
                              ),
                            )}
                            {data?.IsHisto == 1 && (
                              <div className="organInput">
                                {" "}
                                <SampleHisto
                                  lable="No. Of Container"
                                  name="Container"
                                  handleChange={(e) => handleChange(e, index)}
                                  value={data?.Container}
                                />
                                <SampleHisto
                                  lable="No. Of Slide"
                                  name="Slide"
                                  handleChange={(e) => handleChange(e, index)}
                                  value={data?.Slide}
                                />
                                <SampleHisto
                                  lable="No. Of Block"
                                  name="Block"
                                  handleChange={(e) => handleChange(e, index)}
                                  value={data?.Block}
                                />
                                <div title="Doctor">
                                  <SelectBox
                                    className="HistoColor mt-2"
                                    options={doctorAdmin}
                                    lable="Doctor"
                                    name="Doctor"
                                    onChange={(e) => handleChange(e, index)}
                                    selectedValue={data?.Doctor}
                                  />
                                </div>
                                
                              </div>
                            )}
                          </td>
                        );
                      }
                      if (column?.ControlDisplayID == "Department") {
                        return (
                          <td data-title={"Department"}>
                            {getFilterHeaderForMerge("Department")?.map(
                              (item, idx) => (
                                <p className="mb-0">
                                  {data?.[headWithApiFields[item]]}
                                </p>
                              ),
                            )}
                          </td>
                        );
                      }
                      if (column?.ControlDisplayID == "PatientCode") {
                        return (
                          <td data-title={"PatientCode"}>
                            {getFilterHeaderForMerge("PatientCode")?.map(
                              (item, idx) => (
                                <p className="mb-0">
                                  {data?.[headWithApiFields[item]]}
                                </p>
                              ),
                            )}
                          </td>
                        );
                      }

                      if (column?.ControlDisplayID === "Package Name") {
                        return (
                          <td data-title={"Package Name"}>
                            {getFilterHeaderForMerge("Package Name")?.map(
                              (item, idx) => (
                                <p
                                  key={idx}
                                  title={parse(data?.PackageName || "")}
                                  className="my-1"
                                  style={{
                                    width: "200px",
                                    whiteSpace: "normal",
                                    wordWrap: "break-word",
                                    overflowWrap: "break-word",
                                  }}
                                >
                                  {data?.[headWithApiFields[item]] || ""}
                                </p>
                              ),
                            )}
                          </td>
                        );
                      }

                      if (column?.ControlDisplayID === "Test") {
                        return (
                          <td data-title={"ItemName"}>
                            <p
                              title={parse(data?.Test || "")}
                              className="my-1"
                              style={{
                                width: "200px",
                                whiteSpace: "normal",
                                wordWrap: "break-word",
                                overflowWrap: "break-word",
                              }}
                            >
                              {parse(data?.TestName || "")}
                            </p>
                          </td>
                        );
                      }
                      if (column?.ControlDisplayID === "Barcode No") {
                        return (
                          <td className="px-2" data-title={"Barcode No"}>
                            {getFilterHeaderForMerge("Barcode No")?.map(
                              (item, idx) => {
                                return (
                                  <p className="mb-1">
                                    {data[headWithApiFields[item]]}
                                  </p>
                                );
                              },
                            )}
                          </td>
                        );
                      }

                      if (column?.ControlDisplayID === "Collected Time") {
                        return (
                          <td
                            className="px-2"
                            title={"SampleCollectionDate"}
                            data-title={"SampleCollectionDate"}
                          >
                            {getFilterHeaderForMerge("Collected Time")?.map(
                              (item, idx) => {
                                return (
                                  // <p className="mb-1">
                                  //   {data[headWithApiFields[item]]}
                                  // </p>
                                  <DateTimeCell dateString={data?.[headWithApiFields[item]]} />
                                );
                              },
                            )}
                          </td>
                        );
                      }

                      if (column?.ControlDisplayID === "Hold") {
                        return (
                          <>
                            {data?.Status === 4 || data?.Status === 5 ? (
                              <td></td>
                            ) : (
                              <td
                                data-title={`${data?.Status == "16" ? "UnHold" : "Hold"}`}
                              >
                                {load?.load && load?.index == index ? (
                                  <Loading />
                                ) : (
                                  <div
                                    onClick={() => {
                                      if (data?.Status == "16") {
                                        handleHold(data, index);
                                      } else
                                        setShowHold({
                                          data: { ...data },
                                          show: true,
                                          index: index,
                                        });
                                    }}
                                  >
                                    {data?.Status == "16" ? (
                                      <Tooltip label={`UnHold`}>
                                        <i
                                          className="bi bi-play-circle m-0 text-icon-size-comment ml-2"
                                          style={{
                                            color: "green",
                                          }}
                                          type="button"
                                        ></i>
                                      </Tooltip>
                                    ) : (
                                      <Tooltip label="Hold">
                                        <i
                                          className="bi bi-stop-circle m-0 text-icon-size-comment ml-2"
                                          style={{
                                            color: "#d9070e",
                                          }}
                                          type="button"
                                        ></i>{" "}
                                      </Tooltip>
                                    )}
                                  </div>
                                )}
                              </td>
                            )}
                            <td data-title={"File Count"}>
                              <div
                                className="text-primary "
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
                              >
                                <img src={file} className="sizeicon" />
                                &nbsp;&nbsp;{data?.UploadDocumentCount}
                              </div>
                            </td>
                          </>
                        );
                      }
                      if (column?.ControlDisplayID === "M.H") {
                        return (
                          <>
                            <td data-title={"Medical History"}>
                              <div
                                className="text-primary d-flex align-items-center"
                                style={{
                                  cursor: "pointer",
                                }}
                                onClick={() => {
                                  show({
                                    modal: true,
                                    data: data?.PatientGuid,
                                    index: index,
                                    ID: data?.LedgerTransactionID,
                                  });
                                }}
                                onMouseEnter={() => {
                                  if (data?.MedicalHistoryCount > 0) {
                                    fetchMedicalHistoryTooltipData(
                                      data?.MedicalHistoryList,
                                      index,
                                    );
                                  }
                                }}
                                data-tooltip-id={`medical-history-tooltip-${index}`}
                              >
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
                                />
                                <span style={{ marginLeft: "5px" }}>
                                  {data?.MedicalHistoryCount > 0 &&
                                    `(${data?.MedicalHistoryCount})`}
                                </span>
                              </div>

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
                                    medicalHistoryTooltipData.data.length >
                                      0 ? (
                                      <div
                                        style={{
                                          maxHeight: "300px",
                                          overflowY: "auto",
                                          width: "400px",
                                          position: "relative",
                                          background:
                                            "rgba(143, 142, 142, 0.9)",
                                        }}
                                      >
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
                                            {medicalHistoryTooltipData.data.map(
                                              (item, idx) => (
                                                <tr key={idx}>
                                                  <td>{idx + 1}</td>
                                                  <td>{item.MedicalHistory}</td>
                                                  <td>
                                                    {dateConfig(
                                                      item.CreatedDate,
                                                    )}
                                                  </td>
                                                  <td>{item.CreatedBy}</td>
                                                </tr>
                                              ),
                                            )}
                                          </tbody>
                                        </table>
                                      </div>
                                    ) : (
                                      "No medical history found"
                                    )
                                  }
                                />
                              )}
                            </td>
                          </>
                        );
                      }

                      {
                        column.header === "Medical History" && (
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
                                  ID: data?.LedgerTransactionID,
                                });
                              }}
                              onMouseEnter={() => {
                                if (data?.MedicalHistoryCount > 0) {
                                  fetchMedicalHistoryTooltipData(
                                    data?.MedicalHistoryList,
                                    index,
                                  );
                                }
                              }}
                              data-tooltip-id={`medical-history-tooltip-${index}`}
                            />
                            <span>
                              {" "}
                              {data?.MedicalHistoryCount > 0 &&
                                `(${data?.MedicalHistoryCount > 0 && data?.MedicalHistoryCount})`}{" "}
                            </span>

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
                                    <div
                                      style={{
                                        maxHeight: "300px",
                                        overflowY: "auto",
                                        width: "400px",
                                        position: "relative",
                                        background: "rgba(143, 142, 142, 0.9)",
                                      }}
                                    >
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
                                          {medicalHistoryTooltipData.data.map(
                                            (item, idx) => (
                                              <tr key={idx}>
                                                <td>{idx + 1}</td>
                                                <td>{item.MedicalHistory}</td>
                                                <td>
                                                  {dateConfig(item.CreatedDate)}
                                                </td>
                                                <td>{item.CreatedBy}</td>
                                              </tr>
                                            ),
                                          )}
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
                        );
                      }

                      if (column?.ControlDisplayID === "CheckBox") {
                        return (
                          <>
                            {pageType == 2 && (
                              <td data-title={"Select"} className="text-center">
                                {data?.Status == 2 && (
                                  <input
                                    type="checkbox"
                                    name="IsChecked"
                                    checked={data?.IsChecked}
                                    onChange={(e) => handleTestID(e, index)}
                                  />
                                )}
                              </td>
                            )}
                          </>
                        );
                      }

                      if (column?.ControlDisplayID === "RateTypeName") {
                        return (
                          <td className="px-2" data-title={"RateTypeName"}>
                            {getFilterHeaderForMerge("RateTypeName")?.map(
                              (item, idx) => {
                                return (
                                  <p className="mb-0">
                                    {data[headWithApiFields[item]]}
                                  </p>
                                );
                              },
                            )}
                          </td>
                        );
                      }

                      if (column?.ControlDisplayID === "RateTypeCode") {
                        return (
                          <td className="px-2" data-title={"RateTypeCode"}>
                            {getFilterHeaderForMerge("RateTypeCode")?.map(
                              (item, idx) => {
                                return (
                                  <p className="mb-0">
                                    {data[headWithApiFields[item]]}
                                  </p>
                                );
                              },
                            )}
                          </td>
                        );
                      }

                      if (column?.ControlDisplayID === "RateTypeNameWithCode") {
                        return (
                          <td
                            className="px-2"
                            data-title={"RateTypeNameWithCode"}
                          >
                            {getFilterHeaderForMerge(
                              "RateTypeNameWithCode",
                            )?.map((item, idx) => {
                              return (
                                <p className="mb-0">
                                  {data[headWithApiFields[item]]}
                                </p>
                              );
                            })}
                          </td>
                        );
                      }

                      if (column?.ControlDisplayID === "Reject") {
                        return (
                          <>
                            {data?.Status === 4 || data?.Status === 5 ? (
                              <td data-title={"Reject"} className="text-center">
                                <span className="badge badge-danger">Rejected</span>
                              </td>
                            ) : (
                              <td data-title={"Reject"} className="text-center">
                                <div className="d-flex align-items-center justify-content-center">
                                  <input
                                    type="checkbox"
                                    style={{ transform: "scale(1.2)", cursor: "pointer" }}
                                    checked={Boolean(data?.isReject)}
                                    onChange={(e) =>
                                      handleRejectPayload(e, index, data)
                                    }
                                  />
                                </div>
                              </td>
                            )}
                          </>
                        );
                      }

                      if (column?.ControlDisplayID == "Barcode") {
                        return (
                          <td
                            data-title={t("Barcode Print")}
                            className="text-center"
                          >
                            <span
                              // className="text"
                              style={{ cursor: "pointer" }}
                            >
                              {(data?.Status == 2 || data?.Status == 3) &&
                              !(data?.BarcodeLogicID == 3) ? (
                                <i
                                  className="fa fa-print"
                                  onClick={() => {
                                    getBarcodeData(
                                      // data?.TestID,
                                      [], //sending testID Blank Array instead of single one
                                      data?.VisitNo,
                                      [data?.SinNo],
                                    );
                                  }}
                                ></i>
                              ) : null}
                            </span>
                            &nbsp;
                          </td>
                        );
                      }

                      const handledColumns = [
                        "S.No",
                        "Reg Date",
                        "Visit",
                        "Patient Info",
                        "Remarks",
                        "SampleType",
                        "Department",
                        "Package Name",
                        "Test",
                        "Barcode No",
                        "Collected Time",
                        "Reject",
                        "Hold",
                        "U.D",
                        "M.H",
                        "CheckBox",
                        "RateTypeCode",
                        "RateTypeName",
                        "RateTypeNameWithCode",
                        "Barcode",
                        "PatientCode",
                        "PName",
                        "Age",
                        "Gender"
                      ];
                      if (
                        !handledColumns.includes(
                          column?.ControlDisplayID?.split("/")?.[0],
                        ) &&
                        column?.TypeId === 2 &&
                        column?.IsShow === 1 &&
                        isHeaderKeyPresentInResObj(
                          column?.ControlDisplayID?.split("/")?.[0],
                          data,
                        )
                      ) {
                        return (
                          <td
                            key={colIndex}
                            className="px-2"
                            data-title={column?.ControlDisplayID}
                          >
                            <div>
                              {getFilterHeaderForMerge(
                                column?.ControlDisplayID?.split("/")?.[0],
                              )?.map((item, idx) => (
                                <p key={idx} className="mb-0">
                                  {data[headWithApiFields[item]] || data[item]}
                                </p>
                              ))}
                            </div>
                          </td>
                        );
                      }
                    })}

                    {/* <td className="px-2" data-title={"Date"}> */}
                    {/* <div>{dateConfig(data.Date)}</div> */}
                    {/* <p className="mb-0">{data?.Date?.split(' ')?.[0]}</p>
                      <p className="mb-0">{data?.Date?.split(' ')?.[1]}</p>
                    </td> */}

                    {/* <td className="px-2" data-title={"PatientCode"}>
                      {data?.PatientCode}
                    </td> */}

                    {/* <td className="px-2" data-title={"Mobile"}>
                      {data?.Mobile}
                    </td> */}

                    {/* <td data-title={"Gender"}>
                      <div>
                        {data?.Age}/{data?.Gender}
                      </div>
                    </td> */}

                    {/* <td data-title={"Organ"}>
                      &nbsp;
                      {data?.IsHisto == 1 && (
                        <SelectBox
                          className="organInput HistoColor"
                          options={organ}
                          // lable="Organ"
                          name="Organ"
                          onChange={(e) => handleChange(e, index)}
                          selectedValue={data?.Organ}
                        />
                      )}
                    </td> */}
                    {/* <td data-title={"Vial Qty"}>&nbsp;{data?.VialQty}</td> */}
                    {/* <td className="px-2" data-title={"DoctorName"}>
                      <span title={data?.DoctorName}>
                        {data?.DoctorName?.length > 20
                          ? data?.DoctorName?.slice(0, 20) + "..."
                          : data?.DoctorName}
                      </span>
                    </td> */}
                    {/* <td className="px-2" data-title={"RateTypeName"}>
                      <p title={data?.RateTypeName}>
                        {data?.RateTypeName?.length > 20
                          ? data?.RateTypeName?.slice(0, 20) + "..."
                          : data?.RateTypeName}
                      </p>
                    </td> */}
                  </tr>
                ))}
              </tbody>
            </Tables>
          </div>
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
    </>
  );
}

export default DepartmentReceiveTable;
