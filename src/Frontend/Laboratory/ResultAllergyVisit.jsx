import React, { useState } from 'react';
import Accordion from '../../components/UI/Accordion';
import { dateConfig, getRangeClass } from '../../utils/helpers';
import UploadFile from '../utils/UploadFileModal/UploadFile';
import TemplateMasterModal from '../utils/TemplateMasterModal';
import ResultEntryEditModal from '../utils/ResultEntryEditModal';
import PatientDetailModal from '../utils/PatientDetailModal';
import ResultEntryTableCustom from './ResultEntryTableCustom';
import Tooltip from '../../components/formComponent/Tooltip';
import Tables from '../../components/UI/customTable';
import ReactSelect from '../../components/formComponent/ReactSelect';
import Loading from '../../components/loader/Loading';
import Input from '../../components/formComponent/Input';
import { SelectBox } from '../../components/formComponent/SelectBox';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { CustomButton } from '../../components/UI/CustomButton';

const ResultAllergyVisit = ({ResultData, ResultTestData, setShow2, setShow3, show2, show3, setShow, show, setShowPH, showPH,
    handleNotApproveRemark, handleResultSubmit, handleCheckboxRA , handleKeyUpRA, entryShow, mandatoryIDs,bindAllergyType,getEntryData, GetResultEntryCulture,
    buttonsData,setResultTestData,
        setEntryShow,
        setEntry,
        setInvestigationID,
        setEntryPayload,
        PrintReportLoading,
        setResultData,
        setMandatoryIDs,
        handleReport,
        printHeader,
        statusValue,
        loading,
        reData,
        checkDualAuthentication,
        doctorAdmin,
        entryPayload,
        handleDoctorNameRA,
        myRefs,
        entry,
        handleSave,
        onArrowNavigate,
        removeArrayAtIndex,
        handleSensitivity
}) => {
    const [show5, setShow5] = useState({
        modal: false,
        data: "",
      });
      const { t } = useTranslation();
    return (
        <>
            {show5?.modal && (
                <UploadFile
                    show={show5?.modal}
                    handleClose={(data) => {
                        setShow5({
                            modal: false,
                            data: "",
                            pageName: "",
                            blockUpload: "",
                        });
                        printHeader(data, show5.data);
                    }}
                    documentId={show5.data}
                    pageName={show5?.pageName}
                    formData={payload}
                    isPrintHeader={show5?.Printwithhead}
                    blockUpload={show5.blockUpload}
                    LedgerTransactionIDHash={
                        ResultTestData[0]?.LedgertransactionIDHash
                    }
                />
            )}
            {show2.moadal && (
                <TemplateMasterModal
                    show={show2}
                    handleClose={() => {
                        setShow2({ moadal: false, data: {} });
                    }}
                    handleSave={handleSave}
                />
            )}
            {show3?.modal && (
                <TemplateMasterModal
                    show={show3}
                    handleClose={() => {
                        setShow3({ modal: false, data: {} });
                    }}
                    handleSave={handleSave}
                />
            )}
            {show.moadal && (
                <ResultEntryEditModal
                    show={show}
                    handleClose={() => {
                        setShow({ moadal: false, data: {} });
                    }}
                    handleSave={handleSave}
                />
            )}
            {showPH && (
                <PatientDetailModal
                    showPH={showPH}
                    setShowPH={(data) => {
                        setShowPH(false);
                        // console.log("object");
                    }}
                    ResultData={ResultData}
                />
            )}
            <>
                <>
                    <Accordion
                        name={t("Patient Allergy Entry")}
                        defaultValue={true}
                        isBreadcrumb={true}
                    >
                        <div
                            className={`p-dialog-header custom-box-body mb-1 mt-1`}
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignContent: "flex-start",
                                justifyContent: "flex-start",
                            }}
                        >
                            <div className="custom-row">
                                <div className="custom-col custom-col-visit">
                                    <span className="fa fa-folder custom-text">
                                        &nbsp;
                                    </span>
                                    <span>{ResultData[0]?.LedgerTransactionNo}</span>
                                </div>
                                <div className="custom-col custom-col-visit">
                                    <span className="fa fa-user-md custom-text">
                                        &nbsp;
                                    </span>
                                    <span>{ResultData[0]?.PName}</span>
                                </div>
                                <div className="custom-col custom-col-visit">
                                    <span className="fa fa-book custom-text">
                                        &nbsp;
                                    </span>
                                    <span>{ResultData[0]?.PatientCode}</span>
                                </div>
                                <div className="custom-col custom-col-visit">
                                    <span className="fa fa-calendar custom-text">
                                        &nbsp;
                                    </span>
                                    <span> {ResultData[0]?.Age}</span>
                                </div>
                                <div className="custom-col custom-col-visit">
                                    <span className="fa fa-book custom-text">
                                        &nbsp;
                                    </span>
                                    <span> {ResultData[0]?.Gender}</span>
                                </div>
                                <div className="custom-col custom-col-visit">
                                    <span className="fa fa-h-square custom-text">
                                        &nbsp;
                                    </span>
                                    <span>{ResultData[0]?.Centre}</span>
                                </div>
                                <div className="custom-col custom-col-visit">
                                    <span className="fa fa-user-md custom-text">
                                        &nbsp;
                                    </span>
                                    <span>{ResultData[0]?.ReferDoctor}</span>
                                </div>
                                <div
                                    className="custom-col custom-col-visit"
                                // style={{ width: "300px" }}
                                >
                                    <span
                                        className="fa fa-calendar custom-text"
                                    // style={{ width: "150px" }}
                                    >
                                        &nbsp;
                                    </span>
                                    <span>{dateConfig(ResultData[0]?.RegDate)}</span>
                                </div>
                                <div className="custom-col custom-col-visit">
                                    <span className="fa fa-plus-square custom-text">
                                        &nbsp;
                                    </span>
                                    <span>{ResultData[0]?.RateType}</span>
                                </div>
                            </div>
                            <div className="custom-row">
                                <div
                                    className="d-flex my"
                                    style={{ margin: 0, padding: 0 }}
                                >
                                    {ResultTestData?.map((data, index) => (
                                        <div
                                            key={index}
                                            className={`round font-weight-bold mx-2 my-2 px-3 py-2 Status-${data.Status}`}
                                        >
                                            <span> {data?.PackageName}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="row mb-2">
                                          <div className="col-md-5 col-12 mt-4">
                                            <div className="p-2">
                                              <ResultEntryTableCustom>
                                                <thead className="cf">
                                                  <tr>
                                                    <th>{t("Test Name")}</th>
                                                    <th>{t("Value")}</th>
                                                    <th style={{ width: "60px" }}>{t("Unit")}</th>
                                                    <th style={{width: "100px"}}>{t("Reference Range")} </th>
                                                    <th >{t("Comment")}</th>
                                                    <th>{t("Method Name")}</th>
                                                  </tr>
                                                </thead>
                                                <tbody>
                                                  {ResultTestData?.map((Hdata, Hindex) => (
                                                    <>
                                                      <tr
                                                        key={Hindex}
                                                        style={{ backgroundColor: "lightgrey" }}
                                                      >
                                                        <td data-title={t("Test Name")} colSpan={2}>
                                                          <span
                                                            className="invName"
                                                            style={{
                                                              wordWrap: "break-word",
                                                              whiteSpace: "normal",
                                                              fontWeight: "bold",
                                                            }}
                                                          >
                                                            {Hdata?.PackageName}
                                                          </span>
                                                        </td>
                                                        <td 
                                                        colSpan={2} 
                                                        >
                                                          <span
                                                            className="invName"
                                                          >
                                                            {/* {Hdata?.PackageName || ""}  */}
                                                            <span className="fa fa-barcode">&nbsp;</span>
                                                            <b>{Hdata?.SINNO}</b>
                                                            {/* {Hdata?.SINNO || ""} */}
                                                          </span>
                                                        </td>
                                                        {/* {(Hdata?.Status === 3 ||
                                                          Hdata?.Status === 10 ||
                                                          Hdata?.Status === 14) && (
                                                          <td>
                                                            <div className="d-flex justify-content-end">
                        
                                                              <div
                                                                className="m-0 p-0"
                                                                onClick={() => {
                                                                  setShow5({
                                                                    modal: true,
                                                                    data: Hdata?.TestIDHash,
                                                                    pageName: "Add Report",
                                                                    Printwithhead: Hdata?.Printwithhead,
                                                                    blockUpload:
                                                                      Hdata?.Status === 5 ||
                                                                      Hdata?.Status === 6
                                                                        ? true
                                                                        : false,
                                                                  });
                                                                }}
                                                              >
                                                                <Tooltip label="Add Report">
                                                                  <i
                                                                    className="bi bi-file-earmark-pdf m-0 text-icon-size ml-1 mr-1"
                                                                    style={{ color: "red" }}
                                                                    disabled={!Hdata?.isChecked}
                                                                  ></i>
                                                                </Tooltip>
                                                              </div>
                        
                        
                                                              <div
                                                                className="m-0 p-0"
                                                                onClick={() => {
                                                                  setShow5({
                                                                    modal: true,
                                                                    data: Hdata?.TestIDHash,
                                                                    pageName: "Add Attachment",
                                                                    blockUpload:
                                                                      Hdata?.Status === 5 ||
                                                                      Hdata?.Status === 6
                                                                        ? true
                                                                        : false,
                                                                  });
                                                                }}
                                                              >
                                                                <Tooltip label="Add Attachment">
                                                                  <i
                                                                    className="bi bi-file-earmark-image m-0 text-icon-size ml-1 mr-1"
                                                                    style={{ color: "#07b023" }}
                                                                    disabled={!Hdata?.isChecked}
                                                                  ></i>
                                                                </Tooltip>
                                                              </div>
                                                            </div>
                                                          </td>
                                                        )} */}
                                                        {(Hdata?.Status === 5 || Hdata?.Status === 6) ?
                                                        (
                                                          buttonsData?.map(
                                                            (ele, index) =>
                                                              ele?.AccessBy === "Not Approved" && (
                                                                <>
                                                                  <td colSpan={2}>
                                                                    <div className=" d-flex">
                                                                      {/* <div
                                                                        className="m-0 p-0"
                                                                        onClick={() => {
                                                                          setShow5({
                                                                            modal: true,
                                                                            data: Hdata?.TestIDHash,
                                                                            pageName: "Add Report",
                                                                            Printwithhead:
                                                                              Hdata?.Printwithhead,
                                                                            blockUpload:
                                                                              Hdata?.Status == 5 ||
                                                                              Hdata?.Status == 6
                                                                                ? true
                                                                                : false,
                                                                          });
                                                                        }}
                                                                      >
                                                                        <Tooltip
                                                                          label={
                                                                            Hdata?.Status == 5 ||
                                                                            Hdata?.Status == 6
                                                                              ? t("Show Report")
                                                                              : t("Add Report")
                                                                          }
                                                                        >
                                                                          <i
                                                                            className="bi bi-file-earmark-pdf m-0 text-icon-size"
                                                                            style={{ color: "red" }}
                                                                            disabled={!Hdata?.isChecked}
                                                                          ></i>{" "}
                                                                        </Tooltip>
                                                                      </div>
                                                                      <div
                                                                        className=" m-0 p-0"
                                                                        onClick={() => {
                                                                          setShow5({
                                                                            modal: true,
                                                                            data: Hdata?.TestIDHash,
                                                                            pageName: "Add Attachment",
                                                                            blockUpload:
                                                                              Hdata?.Status == 5 ||
                                                                              Hdata?.Status == 6
                                                                                ? true
                                                                                : false,
                                                                          });
                                                                        }}
                                                                      >
                                                                        {" "}
                                                                        <Tooltip
                                                                          label={
                                                                            Hdata?.Status == 5 ||
                                                                            Hdata?.Status == 6
                                                                              ? t("Show Attachment")
                                                                              : t("Add Attachment")
                                                                          }
                                                                        >
                                                                          <i
                                                                            className="bi bi-file-earmark-image m-0 text-icon-size"
                                                                            style={{ color: "#07b023" }}
                                                                            disabled={!Hdata?.isChecked}
                                                                          ></i>{" "}
                                                                        </Tooltip>
                                                                      </div> */}
                        
                                                                      <div>
                                                                        <Input
                                                                          className="required form-control input-sm mr-3"
                                                                          placeholder={
                                                                            "Not Approved Remark"
                                                                          }
                                                                          value={
                                                                            Hdata?.NotApproveRemark ??
                                                                            ""
                                                                          }
                                                                          name="NotApproveRemark"
                                                                          id="NotApproveRemark"
                                                                          onChange={(e) =>
                                                                            handleNotApproveRemark(
                                                                              e,
                                                                              Hdata
                                                                            )
                                                                          }
                                                                        />{" "}
                                                                      </div>
                                                                      <div
                                                                        onClick={() => {
                                                                          if (Hdata?.NotApproveRemark) {
                                                                            handleResultSubmit(
                                                                              ele?.AccessBy,
                                                                              Hdata
                                                                            );
                                                                          } else {
                                                                            toast.error(
                                                                              "Not Approve Remark is Required"
                                                                            );
                                                                          }
                                                                        }}
                                                                      >
                                                                        {" "}
                                                                        <Tooltip label={ele?.AccessBy}>
                                                                          <i
                                                                            className="bi bi-x-octagon text-icon-size m-0 ml-2"
                                                                            style={{ color: "#b06605" }}
                                                                            key={index}
                                                                          ></i>
                                                                        </Tooltip>
                                                                      </div>
                                                                    </div>
                                                                  </td>
                                                                </>
                                                              )
                                                        )) :
                                                        (
                                                          <td colSpan={2}>&nbsp;</td>
                                                        ) }
                                                      </tr>
                                                      {ResultData?.map((datanew, index) => (
                                                        <>
                                                          {Hdata.TestID === datanew.TestID && (
                                                            <tr key={index}>
                                                              <td
                                                                data-title={t("Test Name")}
                                                                //   className={`Status-${datanew?.Status}`}
                                                                style={{
                                                                  wordWrap: "break-word",
                                                                  whiteSpace: "normal",
                                                                }}
                                                              >
                                                                <span
                                                                  style={{
                                                                    cursor: "pointer",
                                                                    // //   color:
                                                                    //     datanew?.Status != 5
                                                                    //       ? "black"
                                                                    //       : "white",
                                                                  }}
                                                                  data-toggle="tooltip"
                                                                  data-placement="top"
                                                                >
                                                                  {datanew?.TestName}
                                                                </span>&nbsp;
                                                              </td>
                                                              {datanew?.Header === 0 &&
                                                              datanew?.TestName?.toLowerCase() !==
                                                                "drugs" &&
                                                              datanew?.TestName != "Comments" ? (
                                                                <>
                                                                  {["2", "3"].includes(
                                                                    datanew?.ReportType
                                                                  ) ? 
                                                                  (
                                                                    <>
                                                            
                                                                    <td
                                                                      style={{
                                                                        fontSize: "15px",
                                                                        cursor: "pointer",
                                                                      }}
                                                                      onClick={() =>
                                                                        setShow3({
                                                                          modal: true,
                                                                          data: datanew,
                                                                        })
                                                                      }
                                                                      data-title={t("Action")}
                                                                    >
                                                                      <i
                                                                        className="fa fa-plus-circle"
                                                                        aria-hidden="true"
                                                                        style={{ color: "#605ca8" }}
                                                                      ></i>
                                                                    </td>
                                                                    </>
                                                                  ) : datanew?.dlcCheck === 1 ? 
                                                                  (
                                                                    datanew?.IsHelpMenu === 0 ? (
                                                                      <> 
                                                                     
                                                                      <td data-title={t("Value")}>
                                                                        <input
                                                                          type="text"
                                                                          // className="form-control input-sm "
                                                                          className={`form-control input-sm resultInput ${
                                                                                    getRangeClass(
                                                                                      datanew?.Value,
                                                                                      parseFloat(datanew?.MinValue),
                                                                                      parseFloat(datanew?.MaxValue)
                                                                                    )
                                                                                    }`}
                                                                          name="Value"
                                                                          autoComplete="off"
                                                                          value={datanew?.Value}
                                                                          onChange={(e) =>
                                                                            handleCheckboxRA(
                                                                              e,
                                                                              index,
                                                                              datanew?.TestID
                                                                            )
                                                                          }
                                                                          onKeyUp={(e) =>
                                                                            handleKeyUpRA(
                                                                              e,
                        
                                                                              myRefs.current[
                                                                                index ===
                                                                                ResultData.length - 1
                                                                                  ? 0
                                                                                  : index + 1
                                                                              ],
                                                                              index
                                                                            )
                                                                          }
                                                                          ref={(el) =>
                                                                            (myRefs.current[index] = el)
                                                                          }
                                                                        />
                                                                      </td>
                                                                      
                                                                      </>
                                                                      
                                                                      
                                                                    ) : (
                                                                      <> 
                        
                                                                        <td data-title={t("Value")}>
                                                                        <input
                                                                          type="text"
                                                                          // className="form-control input-sm "
                                                                          className={`form-control input-sm resultInput ${(datanew?.MaxValue != "0" ||
                                                                            datanew?.MinValue != "0") &&
                                                                            parseFloat(datanew?.Value) >
                                                                            parseFloat(datanew?.MaxValue)
                                                                            ? "high"
                                                                            : parseFloat(datanew?.Value) <
                                                                              parseFloat(datanew?.MinValue)
                                                                              ? "low"
                                                                              : ""
                                                                            } `}
                                                                          name="Value"
                                                                          value={datanew?.Value}
                                                                          onChange={(e) =>
                                                                            handleCheckboxRA(
                                                                              e,
                                                                              index,
                                                                              datanew?.TestID
                                                                            )
                                                                          }
                                                                          onKeyUp={(e) =>
                                                                            handleKeyUpRA(
                                                                              e,
                                                                              myRefs.current[
                                                                                index ===
                                                                                ResultData.length - 1
                                                                                  ? 0
                                                                                  : index + 1
                                                                              ],
                                                                              index
                                                                            )
                                                                          }
                                                                          autoComplete="off"
                                                                          ref={(el) =>
                                                                            (myRefs.current[index] = el)
                                                                          }
                                                                        />
                                                                      </td>
                                                                    
                                                                      
                                                                      </>
                                                                      
                                                                    )
                                                                  ) : datanew?.IsHelpMenu === 0 ? 
                                                                  (
                                                                    <>
                                                                        <td data-title={t("Value")}>
                                                                      <input
                                                                        type="text"
                                                                        // className="form-control input-sm "
                                                                        className={`form-control input-sm resultInput ${(datanew?.MaxValue != "0" ||
                                                                    datanew?.MinValue != "0") &&
                                                                    parseFloat(datanew?.Value) >
                                                                    parseFloat(datanew?.MaxValue)
                                                                    ? "high"
                                                                    : parseFloat(datanew?.Value) <
                                                                      parseFloat(datanew?.MinValue)
                                                                      ? "low"
                                                                      : ""
                                                                    } `}
                                                                        name="Value"
                                                                        value={datanew?.Value}
                                                                        onChange={(e) =>
                                                                          handleCheckboxRA(
                                                                            e,
                                                                            index,
                                                                            datanew?.TestID
                                                                          )
                                                                        }
                                                                        onKeyUp={(e) =>
                                                                          handleKeyUpRA(
                                                                            e,
                                                                            myRefs.current[
                                                                              index ===
                                                                              ResultData.length - 1
                                                                                ? 0
                                                                                : index + 1
                                                                            ],
                                                                            index
                                                                          )
                                                                        }
                                                                        autoComplete="off"
                                                                        ref={(el) =>
                                                                          (myRefs.current[index] = el)
                                                                        }
                                                                      />
                                                                    </td>
                                                                                                            
                                                                     </>
                                                                    
                                                                  ) : 
                                                                  (
                        
                                                                    <>
                                                                        <td data-title={t("Value")}>
                                                                      {/* <div
                                                                        style={{
                                                                          position: "relative",
                                                                        }}
                                                                      >
                                                                        <input
                                                                          type="text"
                                                                          className="form-control input-sm "
                                                                          name="Value"
                                                                          autoComplete="off"
                                                                          value={datanew?.Value}
                                                                          onChange={(e) =>
                                                                            handleCheckboxRA(
                                                                              e,
                                                                              index,
                                                                              datanew?.TestID
                                                                            )
                                                                          }
                                                                        //   onKeyDown={(e) => {
                                                                        //     getHelpMenuData(
                                                                        //       e,
                                                                        //       datanew?.labObservationID
                                                                        //     );
                                                                        //     handleIndex(e, index);
                                                                        //   }}
                                                                          onKeyUp={(e) =>
                                                                            handleKeyUpRA(
                                                                              e,
                                                                              myRefs.current[
                                                                                index ===
                                                                                ResultData.length - 1
                                                                                  ? 0
                                                                                  : index + 1
                                                                              ],
                                                                              index
                                                                            )
                                                                          }
                                                                          ref={(el) =>
                                                                            (myRefs.current[index] = el)
                                                                          }
                                                                        //   onBlur={() =>
                                                                        //     setTimeout(() => {
                                                                        //       setHiddenDropDownHelpMenu(
                                                                        //         false
                                                                        //       );
                                                                        //     }, [1000])
                                                                        //   }
                                                                        />
                        
                                                                        {helpmenu.length > 0 &&
                                                                          helpmenu[0]?.Value ==
                                                                            datanew?.labObservationID &&
                                                                          HiddenDropDownHelpMenu && (
                                                                            <ul
                                                                              className="suggestion-data"
                                                                              style={{
                                                                                width: "100%",
                                                                                right: "0px",
                                                                                border:
                                                                                  "1px solid #dddfeb",
                                                                              }}
                                                                            >
                                                                              {helpmenu.map(
                                                                                (
                                                                                  data,
                                                                                  helpmenuindex
                                                                                ) => (
                                                                                  <li
                                                                                    onClick={() =>
                                                                                      handleListSearch(
                                                                                        data,
                                                                                        "Value",
                                                                                        index
                                                                                      )
                                                                                    }
                                                                                    key={helpmenuindex}
                                                                                    className={`${
                                                                                      helpmenuindex ===
                                                                                        indexMatch &&
                                                                                      "matchIndex"
                                                                                    }`}
                                                                                  >
                                                                                    {data?.label}
                                                                                  </li>
                                                                                )
                                                                              )}
                                                                            </ul>
                                                                          )}
                                                                      </div> */}
                                                                    </td>
                                                                     </>
                                                                    
                                                                  )}
                                                                  <td data-title={t("Unit")}>
                                                                    <div
                                                                      style={{
                                                                        wordWrap: "break-word",
                                                                        whiteSpace: "normal",
                                                                      }}
                                                                    >
                                                                      {datanew?.ReadingFormat}
                                                                      {/* {datanew?.Unit} */}
                                                                    </div>{" "}
                                                                    {/* <input
                                                                      type="text"
                                                                      className="form-control input-sm "
                                                                      name="ReadingFormat"
                                                                      autoComplete="off"
                                                                      value={datanew?.ReadingFormat}
                                                                      onChange={(e) =>
                                                                        handleCheckboxRA(
                                                                          e,
                                                                          index,
                                                                          datanew?.TestID
                                                                        )
                                                                      }
                                                                    /> */}
                                                                  </td>
                                                                    {["2", "3"].includes(datanew?.ReportType) ? (
                                                                      <td data-title=""> &nbsp;</td>
                                                                    ) : (
                                                                      <td data-title="Reference Range" 
                                                                      // style={{width: "100px"}}
                                                                      >
                                                                        <div
                                                                          style={{
                                                                            display: "flex",
                                                                            justifyContent: "space-between",
                                                                          }}
                                                                        >
                                                                          <div
                                                                            style={{
                                                                              wordWrap: "break-word",
                                                                              whiteSpace: "normal",
                                                                            }}
                                                                          >
                                                                            {datanew?.DisplayReading}
                                                                          </div>{" "}
                                                                          <div>
                                                                            {" "}
                                                                            {["2", "3"].includes(
                                                                              datanew?.ReportType
                                                                            ) ? (
                                                                              <div data-title=""> &nbsp;</div>
                                                                            ) : (
                                                                              <>
                                                                                {/* {accessRight?.includes("17") && ( */}
                                                                                <div
                                                                                  onClick={() =>
                                                                                    setShow({
                                                                                      moadal: true,
                                                                                      data: datanew,
                                                                                    })
                                                                                  }
                                                                                >
                                                                                  <Tooltip label={"Edit"}>
                                                                                    <i
                                                                                      className="bi bi-pencil-square m-0 mr-3 text-icon-size-edit"
                                                                                      style={{
                                                                                        color: "#274C77",
                                                                                      }}
                                                                                    ></i>{" "}
                                                                                  </Tooltip>
                                                                                </div>
                                                                                {/* )} */}
                                                                              </>
                                                                            )}
                                                                          </div>
                                                                        </div>{" "}
                                                                        &nbsp;
                                                                      </td>
                                                                    )}
                                                                  {["2", "3"].includes(
                                                                    datanew?.ReportType
                                                                  ) ? (
                                                                    <td>&nbsp;</td>
                                                                  ) : (
                                                                    <td
                                                                      style={{
                                                                        position: "relative",
                                                                      }}
                                                                      data-title={t("Action")}
                                                                    >
                                                                      <div className="d-flex align-items-center">
                                                                        <div
                                                                          className="mx-2"
                                                                          style={{
                                                                            cursor: "pointer",
                                                                            fontSize: "15px",
                                                                          }}
                                                                          onClick={() =>
                                                                            setShow2({
                                                                              moadal: true,
                                                                              data: {
                                                                                ...datanew,
                                                                                pageName: "Single",
                                                                              },
                                                                            })
                                                                          }
                                                                        >
                                                                          <i
                                                                            className="fa fa-plus-circle"
                                                                            aria-hidden="true"
                                                                            style={{
                                                                              color: "#605ca8",
                                                                            }}
                                                                          ></i>
                                                                        </div>
                                                                      </div>
                                                                    </td>
                                                                  )}
                        
                        
                                                                  <td data-title={t("MethodName")}>
                                                                    <div
                                                                      style={{
                                                                        wordWrap: "break-word",
                                                                        whiteSpace: "normal",
                                                                      }}
                                                                    >
                                                                      {datanew?.MethodName}
                                                                    </div>{" "}
                                                                    &nbsp;
                                                                  </td>
                                                                </>
                                                              ) : (['allergen', 'basic allergen', 'drugs']?.includes(datanew?.TestName?.toLowerCase())) ? (  
                                                                <>
                                                                  <td data-title="Drugs">
                                                                    <Link
                                                                        to="#"
                                                                        onClick={(e) => {
                                                                          e.preventDefault();
                                                                          window.scroll(0, 0);
                                                                          // getAllergyData();
                                                                          // setEntryShow(true);
                                                                        }}
                                                                    >
                                                                      {/* <i
                                                                        className="mx-2 fa fa-edit"
                                                                        style={{
                                                                          color: "#605ca8",
                                                                          cursor: "pointer",
                                                                          fontSize: "17px",
                                                                        }}
                                                                        title="Click to add drugs"
                                                                        onClick={() =>
                                                                        {
                                                                          getAllergyData();
                                                                          setEntryShow(true)
                                                                        }
                                                                        }
                                                                      ></i> */}
                                                                    </Link>
                                                                  </td>
                                                                  <td>&nbsp;</td>
                                                                  
                                                                  <td>&nbsp;</td>
                                                                  <td>
                                                                    <div className="d-flex align-items-center">
                                                                      <div
                                                                        className="mx-2"
                                                                        style={{
                                                                          cursor: "pointer",
                                                                          fontSize: "15px",
                                                                        }}
                                                                        onClick={() =>
                                                                          setShow2({
                                                                            moadal: true,
                                                                            data: {
                                                                              ...datanew,
                                                                              pageName: "Single",
                                                                            },
                                                                          })
                                                                        }
                                                                      >
                                                                        <i
                                                                          className="fa fa-plus-circle"
                                                                          aria-hidden="true"
                                                                          style={{
                                                                            color: "#605ca8",
                                                                          }}
                                                                        ></i>
                                                                      </div>
                                                                    </div>
                                                                  </td>
                                                                </>
                                                              ) : datanew?.TestName == "Comments" ? (
                                                                <tr>
                                                                  {console.log("Hello there")}
                                                                  
                                                                  <td data-title={t("Comments")}></td>
                                                                  
                                                                  <td colSpan="1">
                                                                    <div
                                                                      className="mx-2"
                                                                      style={{
                                                                        cursor: "pointer",
                                                                        fontSize: "15px",
                                                                      }}
                                                                      onClick={() =>
                                                                        setShow2({
                                                                          moadal: true,
                                                                          data: {
                                                                            ...datanew,
                                                                            pageName: "Single",
                                                                          },
                                                                        })
                                                                      }
                                                                    >
                                                                      <i
                                                                        className="fa fa-plus-circle"
                                                                        aria-hidden="true"
                                                                        style={{
                                                                          color: "#605ca8",
                                                                        }}
                                                                      ></i>
                                                                    </div>
                                                                    {/* <button
                                                                      className="btn btn-primary btn-sm"
                                                                      onClick={() =>
                                                                        setShow2({
                                                                          moadal: true,
                                                                          data: {
                                                                            ...datanew,
                                                                            pageName: "Single",
                                                                          },
                                                                        })
                                                                      }
                                                                    >
                                                                      {t("Add Comment")}
                                                                    </button> */}
                                                                  </td>
                                                                </tr>
                                                              ) : (
                                                                <tr></tr>
                                                              )}
                                                            </tr>
                                                          )}
                                                        </>
                                                      ))}
                                                    </>
                                                  ))}
                                                </tbody>
                                              </ResultEntryTableCustom>
                                            </div>
                                          </div>
                                          {}
                        
                                          {entryShow && (
                                            <div className="col-md-7 col-12">
                                              {
                                                <div className="p-2">
                                                  <div className="box-header with-border d-flex">
                                                    <div className="col-sm-8">
                                                      <label className="box-title">
                                                        {t("Drug Entry")}
                                                      </label>
                                                    </div>
                                                  </div>
                        
                                                  <>
                                                    <div
                                                      style={{
                                                        maxHeight: "400px",
                                                        overflowY: "auto",
                                                      }}
                                                    >
                                                      <Tables>
                                                        <thead
                                                          className="cf"
                                                          style={{
                                                            position: "sticky",
                                                            zIndex: 99,
                                                            top: 0,
                                                          }}
                                                        >
                                                          <tr>
                                                            {["#", "AllergyDrugs", "Result"].map(
                                                              (ele, index) => (
                                                                <th key={index}>{t(ele)}</th>
                                                              )
                                                            )}
                                                          </tr>
                                                        </thead>
                        
                                                        <tbody>
                                                          {
                                                            <>
                                                              {entry.map((subArray, outerIndex) => 
                                                              {
                                                                const isMandatory = mandatoryIDs?.includes(
                                                                  Number(subArray[0]?.obid)
                                                                );
                                                                
                        
                                                                return (
                                                                  <>
                                                                    <tr
                                                                      style={{
                                                                        background: "#fafa99",
                                                                      }}
                                                                    >
                                                                      <td colSpan={4}>
                                                                        <div className="row">
                                                                          <label className="col-sm-3">
                                                                            {t("Allergy Type Name")} :
                                                                          </label>
                                                                          <div className="col-sm-6">
                                                                            <Input
                                                                              className="select-input-box form-input input-sm"
                                                                              type="text"
                                                                              value={subArray[0]?.obname}
                                                                            />
                                                                          </div>
                                                                          <div className="col-sm-2">
                                                                            {!isMandatory && (
                                                                            <button
                                                                              className="btn btn-danger btn-sm"
                                                                              onClick={() =>
                                                                                removeArrayAtIndex(
                                                                                  outerIndex
                                                                                )
                                                                              }
                                                                              disabled={
                                                                                ResultData[0]?.Status ==
                                                                                5 ||
                                                                                ResultData[0]?.Status == 6
                                                                              }
                                                                            >
                                                                              {t("Remove")}
                                                                            </button>
                                                                            )}
                                                                          </div>
                                                                        </div>
                                                                        <div className="row">
                                                                          <div className="col-sm-3 d-flex">
                                                                            <label className="mr-2">
                                                                              {t("Min Value")} :
                                                                            </label>
                                                                            <div
                                                                              style={{
                                                                                wordWrap: "break-word",
                                                                                whiteSpace: "normal",
                                                                              }}
                                                                            >
                                                                              {
                                                                                entry[outerIndex][0]
                                                                                  ?.Minimum
                                                                              }
                                                                            </div>{" "}
                                                                            {/* <Input
                                                                            className="select-input-box form-control input-sm"
                                                                            value={
                                                                              entry[outerIndex][0]
                                                                                ?.Minimum
                                                                            }
                                                                            onChange={(e) =>
                                                                              setValuesForOuterIndex(
                                                                                outerIndex,
                                                                                "MinValue",
                                                                                e?.target?.value
                                                                              )
                                                                            }
                                                                            type="text"
                                                                            placeholder="Min Value"
                                                                          /> */}
                                                                          </div>
                                                                          <div className="col-sm-3 d-flex">
                                                                            <label className="mr-2">
                                                                              {t("Max Value")} :
                                                                            </label>
                                                                            <div
                                                                              style={{
                                                                                wordWrap: "break-word",
                                                                                whiteSpace: "normal",
                                                                              }}
                                                                            >
                                                                              {
                                                                                entry[outerIndex][0]
                                                                                  ?.Maximum
                                                                              }
                                                                            </div>{" "}
                                                                            {/* <Input
                                                                            className="select-input-box form-control input-sm"
                                                                            onChange={(e) =>
                                                                              setValuesForOuterIndex(
                                                                                outerIndex,
                                                                                "MaxValue",
                                                                                e?.target?.value
                                                                              )
                                                                            }
                                                                            value={
                                                                              entry[outerIndex][0]
                                                                                ?.Maximum
                                                                            }
                                                                            type="text"
                                                                            placeholder="MaxValue"
                                                                          /> */}
                                                                          </div>
                                                                          <div className="col-sm-3 d-flex">
                                                                            <label className="mr-2">
                                                                              {t("Unit")} :
                                                                            </label>
                                                                            <div
                                                                              style={{
                                                                                wordWrap: "break-word",
                                                                                whiteSpace: "normal",
                                                                              }}
                                                                            >
                                                                              {entry[outerIndex][0]?.Unit}
                                                                            </div>{" "}
                                                                            {/* <Input
                                                                            className="select-input-box form-control input-sm"
                                                                            onChange={(e) =>
                                                                              setValuesForOuterIndex(
                                                                                outerIndex,
                                                                                "Unit",
                                                                                e?.target?.value
                                                                              )
                                                                            }
                                                                            value={
                                                                              entry[outerIndex][0]?.Unit
                                                                            }
                                                                            type="text"
                                                                            placeholder="Unit"
                                                                          /> */}
                                                                          </div>
                                                                          <div className="col-sm-3 d-flex">
                                                                            <label className="mr-2">
                                                                              {t("DisplayReading")} :
                                                                            </label>
                                                                            <div
                                                                              style={{
                                                                                wordWrap: "break-word",
                                                                                whiteSpace: "normal",
                                                                              }}
                                                                            >
                                                                              {
                                                                                entry[outerIndex][0]
                                                                                  ?.DisplayReading
                                                                              }
                                                                            </div>{" "}
                                                                            {/* <Input
                                                                            className="select-input-box form-control input-sm"
                                                                            onChange={(e) =>
                                                                              setValuesForOuterIndex(
                                                                                outerIndex,
                                                                                "DisplayReading",
                                                                                e?.target?.value
                                                                              )
                                                                            }
                                                                            value={
                                                                              entry[outerIndex][0]
                                                                                ?.DisplayReading
                                                                            }
                                                                            type="text"
                                                                            placeholder="DisplayReading"
                                                                          /> */}
                                                                          </div>
                                                                        </div>
                                                                      </td>
                                                                    </tr>
                                                                    {subArray.map((item, innerIndex) => (
                                                                      <>
                                                                        <tr>
                                                                          <td
                                                                            className="text-center"
                                                                            style={{ width: "30px" }}
                                                                            data-title={t("S.NO")}
                                                                          >
                                                                            {innerIndex + 1}
                                                                          </td>
                                                                          <td
                                                                            style={{
                                                                              // maxWidth:"400px",
                                                                              width: "400px",
                                                                              minWidth: "150px",
                                                                            }}
                                                                            data-title={t("AllergyDrugs")}
                                                                          >
                                                                            {item?.isInput ? (
                                                                              <Input
                                                                                className="select-input-box form-control input-sm"
                                                                                value={item?.name}
                                                                                onChange={(e) =>
                                                                                  handleSensitivity(
                                                                                    e?.target?.value,
                                                                                    outerIndex,
                                                                                    innerIndex,
                                                                                    "name"
                                                                                  )
                                                                                }
                                                                              />
                                                                            ) : (
                                                                              `${item?.name} - ${item?.Name_Hindi}`
                                                                            )}
                                                                          </td>
                        
                                                                          <td
                                                                            colSpan={2}
                                                                            data-title={t("Result")}
                                                                          >
                                                                            <div className="row">
                                                                              {/* <div className="col-sm-10">
                                                                              <div
                                                                                className="btn-group btn-group-toggle p-1"
                                                                                data-toggle="buttons"
                                                                              >
                                                                                {Sensitivity.map(
                                                                                  (option, index) => (
                                                                                    <>
                                                                                      <input
                                                                                        type="checkbox"
                                                                                        name={`sensitivity-${outerIndex}-${innerIndex}`}
                                                                                        value={
                                                                                          option.value
                                                                                        }
                                                                                        checked={
                                                                                          entry[
                                                                                            outerIndex
                                                                                          ][innerIndex][
                                                                                            "AntiBioticInterpreatation"
                                                                                          ] ===
                                                                                          option.value
                                                                                        }
                                                                                        onChange={(
                                                                                          e
                                                                                        ) => {
                                                                                          handleSensitivity(
                                                                                            e?.target
                                                                                              ?.checked
                                                                                              ? e.target
                                                                                                  ?.value
                                                                                              : "",
                                                                                            outerIndex,
                                                                                            innerIndex,
                                                                                            "AntiBioticInterpreatation"
                                                                                          );
                                                                                        }}
                                                                                        style={{
                                                                                          appearance:
                                                                                            "none",
                                                                                          WebkitAppearance:
                                                                                            "none",
                                                                                          MozAppearance:
                                                                                            "none",
                                                                                          outline:
                                                                                            "none",
                                                                                          border:
                                                                                            "1px solid #ccc",
                                                                                          backgroundColor:
                                                                                            entry[
                                                                                              outerIndex
                                                                                            ][
                                                                                              innerIndex
                                                                                        <FaEye    ][
                                                                                              "AntiBioticInterpreatation"
                                                                                            ] ===
                                                                                            option.value
                                                                                              ? "#007bff"
                                                                                              : "#fff",
                                                                                          color:
                                                                                            entry[
                                                                                              outerIndex
                                                                                            ][
                                                                                              innerIndex
                                                                                            ][
                                                                                              "AntiBioticInterpreatation"
                                                                                            ] ===
                                                                                            option.value
                                                                                              ? "#fff"
                                                                                              : "#000",
                                                                                          padding:
                                                                                            "6px 12px",
                                                                                          cursor:
                                                                                            "pointer",
                                                                                          borderRadius:
                                                                                            "5px",
                                                                                          marginRight:
                                                                                            "5px",
                                                                                        }}
                                                                                      />
                                                                                      <span
                                                                                        style={{
                                                                                          textAlign:
                                                                                            "center",
                                                                                          marginRight:
                                                                                            "3px",
                                                                                        }}
                                                                                      >
                                                                                        {" "}
                                                                                        {
                                                                                          option.label
                                                                                        }{" "}
                                                                                      </span>
                                                                                    </>
                                                                                  )
                                                                                )}
                                                                              </div>
                                                                            </div> */}
                                                                              <div className="col-lg-5 col-md-7 col-sm-10 col-6">
                                                                                <input
                                                                                  onChange={(e) =>
                                                                                    handleSensitivity(
                                                                                      e?.target?.value,
                                                                                      outerIndex,
                                                                                      innerIndex,
                                                                                      "AntibioticInterpreatation"
                                                                                    )
                                                                                  }
                                                                                  value={
                                                                                    item?.AntibioticInterpreatation
                                                                                  }
                                                                                  className={`select-input-box allergy-input input-sm
                                                                                    ${
                                                                                    getRangeClass(
                                                                                      item?.AntibioticInterpreatation,
                                                                                      parseFloat(entry?.[outerIndex]?.[0]?.Minimum),
                                                                                      parseFloat(entry?.[outerIndex]?.[0]?.Maximum)
                                                                                    )
                                                                                    }
                        
                                                                                    `}
                                                                                />
                                                                              </div>
                                                                              <div
                                                                                className="col-sm-1"
                                                                                style={{
                                                                                  display: "flex",
                                                                                  justifyContent:
                                                                                    "center",
                                                                                  alignItems: "center",
                                                                                }}
                                                                              >
                                                                                {item?.DrugImage && (
                                                                                  <img
                                                                                    src={`https://elabassets.s3.ap-south-1.amazonaws.com/${item?.DrugImage}`}
                                                                                    alt="Drug"
                                                                                    style={{
                                                                                      width: "35px",
                                                                                      height: "25px",
                                                                                    }}
                                                                                  />
                                                                                )}
                                                                              </div>
                                                                            </div>
                                                                          </td>
                                                                        </tr>
                                                                      </>
                                                                    ))}
                                                                  </>
                                                                )
                                                              }
                        
                                                              )}
                                                              </>
                                                          }
                                                        </tbody>
                                                      </Tables>
                                                    </div>
                                                    <div
                                                      className="row mt-2"
                                                      style={{
                                                        background: "lightblue",
                                                        border: "1px solid lightblue",
                                                      }}
                                                    >
                                                      <h5
                                                        style={{ fontWeight: "bold" }}
                                                        className="col-sm-4"
                                                      >
                                                        {t("Select Type")} :
                                                      </h5>
                                                      <div
                                                        className="col-sm-8"
                                                        style={{
                                                          marginTop: "0px",
                                                          backgroundColor: "white",
                                                        }}
                                                      >
                                                        <ReactSelect
                                                          dynamicOptions={bindAllergyType}
                                                          value={null}
                                                          placeholderName="Select Type"
                                                          menuPosition={"fixed"}
                                                          maxMenuHeight={250}
                                                          onChange={(_, e) =>
                                                            getEntryData(
                                                              e.value,
                                                              e.label,
                                                              "",
                                                              "",
                                                              "",
                                                              true
                                                            )
                                                          }
                                                        />
                                                      </div>
                                                    </div>
                                                  </>
                                                </div>
                                              }
                                            </div>
                                          )}
                                        </div>
                                        {loading ? (
                                          <Loading />
                                        ) : (
                                          <div className="row  px-2 mt-1 mb-1">
                                            <div className="col-sm-1">
                                              <button
                                                className={`next roundarrow  mx-2 my-1 ${
                                                  ResultData[0]?.currentIndex === 0
                                                    ? "btn-secondary"
                                                    : "btn-success"
                                                }`}
                                                // onClick={() => {
                                                //   ResultData?.length > 0 &&
                                                //     GetResultEntryCulture(
                                                //       {
                                                //         LedgerTransactionID:
                                                //           reData[ResultData[0]?.currentIndex - 1]
                                                //             ?.LedgertransactionId,
                                                //         TestID:
                                                //           reData[ResultData[0]?.currentIndex - 1]
                                                //             ?.TestID,
                        
                                                //         DepartmentID:
                                                //           reData[ResultData[0]?.currentIndex - 1]
                                                //             ?.DepartmentId,
                                                //         VisitNo:
                                                //           reData[ResultData[0]?.currentIndex - 1]
                                                //             ?.LedgerTransactionNo,
                                                //         BarcodeNo:
                                                //           reData[ResultData[0]?.currentIndex - 1]
                                                //             ?.BarcodeNo,
                                                //       },
                        
                                                //       ResultData[0]?.currentIndex - 1,
                                                //       false
                                                //     );
                                                // }}
                                                onClick={() => onArrowNavigate("prev")}
                                                disabled={
                                                  ResultData[0]?.currentIndex === 0 ? true : false
                                                }
                                              >
                                                {t("<")}
                                              </button>
                        
                                              <button
                                                className={`next roundarrow  mx-2 my-1 ${
                                                  ResultData[0]?.currentIndex === reData?.length - 1
                                                    ? "btn-secondary"
                                                    : "btn-success"
                                                }`}
                                                // onClick={() => {
                                                //   ResultData?.length > 0 &&
                                                //     GetResultEntryCulture(
                                                //       {
                                                //         LedgerTransactionID:
                                                //           reData[ResultData[0]?.currentIndex + 1]
                                                //             ?.LedgertransactionId,
                                                //         TestID:
                                                //           reData[ResultData[0]?.currentIndex + 1]
                                                //             ?.TestID,
                        
                                                //         DepartmentID:
                                                //           reData[ResultData[0]?.currentIndex + 1]
                                                //             ?.DepartmentId,
                                                //         VisitNo:
                                                //           reData[ResultData[0]?.currentIndex + 1]
                                                //             ?.LedgerTransactionNo,
                                                //         BarcodeNo:
                                                //           reData[ResultData[0]?.currentIndex + 1]
                                                //             ?.BarcodeNo,
                                                //       },
                        
                                                //       ResultData[0]?.currentIndex + 1,
                                                //       false
                                                //     );
                                                // }}
                                                onClick={() => onArrowNavigate("next")}
                                                disabled={
                                                  ResultData[0]?.currentIndex === reData?.length - 1
                                                    ? true
                                                    : false
                                                }
                                              >
                                                {t(">")}
                                              </button>
                                            </div>
                                            {["", 3, 10, 11, 13, 14, 15, 20, 5, 6, 18].includes(
                                              statusValue
                                            ) && (
                                              <div className="col-sm-1 ">
                                                <button
                                                  className="btn btn-primary  btn-block btn-sm"
                                                  onClick={() => handleResultSubmit("Save")}
                                                  disabled={
                                                    ResultData[0]?.Status == 5 ||
                                                    ResultData[0]?.Status == 6
                                                  }
                                                >
                                                  {t("Save")}
                                                </button>
                                              </div>
                                            )}
                                            {buttonsData?.some(
                                              (ele) => ele?.AccessBy === "Dual Authentication"
                                            ) &&
                                              checkDualAuthentication && (
                                                <div className="col-sm-1 mr-3">
                                                  {buttonsData
                                                    ?.filter(
                                                      (ele) => ele?.AccessBy === "Dual Authentication"
                                                    )
                                                    .map((ele, index) => (
                                                      <button
                                                        key={index}
                                                        style={{
                                                          color: "white",
                                                        }}
                                                        className="btn btn-sm"
                                                        onClick={() =>
                                                          handleResultSubmit(ele?.AccessBy)
                                                        }
                                                      >
                                                        {t("Dual Authentication")}
                                                      </button>
                                                    ))}
                                                </div>
                                              )}
                                            <div className="col-sm-1 ">
                                              <button
                                                className="btn btn-primary btn-sm  btn-block"
                                                onClick={() => {
                                                  setResultData([]);
                                                  setMandatoryIDs([]);
                                                  setResultTestData([]);
                                                  setEntryShow(false);
                                                  setEntry([]);
                                                  setInvestigationID(0);
                                                  setEntryPayload({
                                                    ...entryPayload,
                                                    organism: "",
                                                    ApprovedBy: "",
                                                    ApprovalName: "",
                                                  });
                                                }}
                                              >
                                                {t("Main List")}
                                              </button>{" "}
                                            </div>{" "}
                                            <div className="col-sm-2">
                                              <SelectBox
                                                options={[
                                                  { label: "Select Doctor", value: "" },
                                                  ...doctorAdmin,
                                                ]}
                                                id="ApprovedBy"
                                                name="ApprovedBy"
                                                selectedValue={entryPayload?.ApprovedBy}
                                                onChange={handleDoctorNameRA}
                                              ></SelectBox>
                                            </div>
                                            {PrintReportLoading ? (
                                              <Loading />
                                            ) : (
                                              <div className="col-sm-1 ">
                                                <button
                                                  className="btn btn-success btn-sm  btn-block"
                                                  type="button"
                                                  id="btnMainList"
                                                  onClick={() => handleReport("no", "")}
                                                >
                                                  {t("Preview")}
                                                </button>{" "}
                                              </div>
                                            )}
                                            {buttonsData?.map(
                                              (ele, index) =>
                                                ele?.AccessBy !== "Not Approved" &&
                                                ele?.AccessBy !== "Unhold" &&
                                                ele?.AccessBy !== "Discount Approval" &&
                                                ele?.AccessBy !== "Hold" &&
                                                ele?.AccessBy !== "Allow Customize Date" &&
                                                ele?.AccessBy !== "Dual Authentication" && (
                                                  <div className="col-sm-1 ">
                                                    <button
                                                      className="btn btn-success btn-sm  btn-block"
                                                      type="button"
                                                      id="btnMainList"
                                                      key={index}
                                                      onClick={() => handleResultSubmit(ele?.AccessBy)}
                                                      disabled={
                                                        ResultData[0]?.Status == 5 ||
                                                        ResultData[0]?.Status == 6
                                                      }
                                                    >
                                                      {ele?.AccessBy === "Approved"
                                                        ? t("Approve")
                                                        : ele?.AccessBy}
                                                    </button>{" "}
                                                  </div>
                                                )
                                            )}
                                            <CustomButton
                                              className="col-sm-1"
                                              text={"Patient Details"}
                                              onClick={() => {
                                                setShowPH(true);
                                              }}
                                            />
                                          </div>
                                        )}
                        
                    </Accordion>
                </>
            </>
        </>
    );
};

export default ResultAllergyVisit;