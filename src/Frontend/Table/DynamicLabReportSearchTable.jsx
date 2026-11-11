import React, { useState } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { axiosReport } from "../../utils/axiosInstance";
import Tables from "../../components/UI/customTable";
import Medical from ".././Images/Medical.png";
import file from ".././Images/file.png";
import parse from "html-react-parser";
import { dateConfig } from "../../utils/helpers";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import CustomModal from "../utils/CustomModal";
import SpinnerLoad from "../../components/loader/SpinnerLoad";
function DynamicLabReportSearchTable({ dispatchData, show, show2 }) {
  const [modal, setModal] = useState(false);
  const [visitID, setVisitID] = useState();
  const [printLoading, setPrintLoading] = useState({
    With: false,
    Without: false,
    index: -1,
  });

  const APiReport = (TestIDHash, loader, index, PHead) => {
    if (printLoading.index === -1) {
      setPrintLoading({
        [loader]: true,
        index: index,
      });
      axiosReport
        .post(`commonReports/GetLabReportBackup`, {
          TestIDHash: TestIDHash,
          PHead: PHead,
          PrintColour: "1",
        })
        .then((res) => {
          if (res?.data?.success) {
            window.open(res?.data?.url, "_blank");
          } else {
            toast.error(res?.data?.message);
          }
          setPrintLoading({
            [loader]: false,
            index: -1,
          });
        })
        .catch((err) => {
          toast.error(
            err?.response?.data?.message
              ? err?.response?.data?.message
              : err?.data?.message,
          );
          setPrintLoading({
            [loader]: false,
            index: -1,
          });
        });
    } else {
      toast.warn("Please wait Generating Report");
    }
  };
  const handleAllAprovedChecked = (e, data) => {
    const { checked } = e.target;
    let documentlength = document.getElementsByClassName(
      data?.LedgerTransactionID,
    );
    for (let i = 0; documentlength.length > i; i++) {
      if (documentlength[i].id == data?.LedgerTransactionID) {
        documentlength[i].checked = checked;
      }
    }
  };
  const handleReport = (data, loader, index, PHead) => {
    let TestIDHash = [];
    let documentlength = document.getElementsByClassName(
      data?.LedgerTransactionID,
    );
    let isChecked = false;
    for (let i = 0; documentlength.length > i; i++) {
      if (
        documentlength[i].checked &&
        documentlength[i].id == data?.LedgerTransactionID
      ) {
        TestIDHash.push(
          document.getElementsByClassName(data?.LedgerTransactionID)[i].value,
        );
      }
    }
    if (TestIDHash.length > 0) {
      APiReport(TestIDHash, loader, index, PHead);
    } else {
      toast.error("Please Select Test");
    }
  };

  const { t } = useTranslation();

  const handleCheck = (data) => {
    let check = true;
    const datas = parse(data?.Test);
    if (datas.length > 0) {
      const val = datas?.map((ele) => {
        return ele?.props?.className;
      });
      if (val.includes("round Status-5") || val.includes("round Status-6")) {
        return (check = true);
      } else {
        return (check = false);
      }
    } else {
      return (check =
        datas?.props?.className.includes("round Status-5") ||
        datas?.props?.className.includes("round Status-6"));
    }
  };

  return (
    <div>
      {" "}
      {dispatchData?.length > 0 ? (
        <div className="row">
          <div className="col-12">
            <Tables>
              <thead class="cf">
                <tr>
                  <th>{t("S.No")}</th>
                  <th>{t("Reg Date")}</th>
                  <th>{t("Visit No")}</th>
                  <th>{t("Barcode No")}</th>
                  <th>{t("UHID")}</th>
                  <th>{t("Name")}</th>
                  <th>{t("Age/Gender")}</th>
                  <th>
                    {t("Test")}
                    <input
                      type="checkbox"
                      className="ml-2 mt-1"
                      onClick={(e) =>
                        handleAllAprovedChecked(e, dispatchData[0])
                      }
                    />
                  </th>
                  <th>{t("Print")}</th>
                  <th>{t("Doctor")}</th>
                  <th>{t("Centre")}</th>
                  <th>{t("View")}</th>
                  <th>{t("Audit Trial")}</th>
                  <th>{t("Document")}</th>
                  <th>{t("M.H")}</th>
                </tr>
              </thead>
              <tbody>
                {dispatchData.map((data, index) => (
                  <tr key={index}>
                    <td data-title={t("S.No")}>{index + 1}</td>
                    <td data-title={t("Reg Date")}>
                      <div>{dateConfig(data.Date)}&nbsp;</div>
                    </td>
                    <td data-title={t("VisitNo")}>{data?.VisitNo}&nbsp;</td>
                    <td data-title={t("Barcode No")}>{data?.SinNo}&nbsp;</td>
                    <td data-title={t("UHID")}>
                      {data?.PatientCode === "" ? "" : data?.PatientCode}
                      &nbsp;
                    </td>
                    <td data-title={t("Name")}>
                      {data?.PatientName}
                      &nbsp;
                    </td>
                    <td data-title={t("Age/Gender")}>
                      <div>
                        {data?.Age}/{data?.Gender}&nbsp;
                      </div>
                    </td>
                    <td className="result-entry-test" data-title={t("Test")}>
                      {parse(data?.Test)}
                    </td>
                    <td data-title={t("Print")}>
                      {handleCheck(data) && (
                        <>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "row",
                              justifyContent: "center",
                              alignItems: "center",
                              cursor: "pointer",
                              marginTop: "2px",
                            }}
                          >
                            {printLoading.Without &&
                            printLoading.index === index ? (
                              <SpinnerLoad />
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
                              <SpinnerLoad />
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
                        </>
                      )}
                      &nbsp;
                    </td>
                    <td data-title={t("Doctor")}>{data?.DoctorName}&nbsp;</td>
                    <td data-title={t("Centre")}>{data?.Centre}&nbsp;</td>

                    <td
                      data-title={t("S.No")}
                      onClick={() => {
                        setModal(true);
                        setVisitID(data?.VisitNo);
                      }}
                    >
                      <div>
                        <i className="fa fa-search" />
                      </div>
                    </td>
                    <td>{}&nbsp;</td>
                    <td data-title={t("Upload")}>
                      <div
                        className="text-info"
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          show2({
                            modal: true,
                            data: data?.PatientGuid,
                            index: index,
                          });
                        }}
                      >
                        {" "}
                        <img src={file} className="sizeicon"></img>
                        &nbsp; (&nbsp;{data?.UploadDocumentCount}) &nbsp;
                      </div>
                    </td>
                    <td data-title={t("Medical History")}>
                      <div
                        className="text-info"
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          show({
                            modal: true,
                            data: data?.PatientGuid,
                            index: index,
                          });
                        }}
                      >
                        {" "}
                        <img src={Medical} className="sizeicon"></img>
                        &nbsp; (&nbsp;{data?.MedicalHistoryCount}) &nbsp;
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Tables>
          </div>
        </div>
      ) : (
        <NoRecordFound />
      )}
      {modal && (
        <CustomModal
          show={modal}
          visitID={visitID}
          onHide={() => setModal(false)}
        />
      )}
    </div>
  );
}

export default DynamicLabReportSearchTable;
