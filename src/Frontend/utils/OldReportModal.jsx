import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { CheckDevice, dateConfig, downloadPdf } from "../../utils/helpers";
import { axiosInstance, axiosReport } from "../../utils/axiosInstance";
import Loading from "../../components/loader/Loading";
import Tables from "../../components/UI/customTable";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import { Dialog } from "primereact/dialog";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { useTranslation } from "react-i18next";

let oldReportFetchKey = null;

function OldReportModal({ show, handleClose, value }) {
  const isMobile = window.innerWidth <= 768;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasResponse, setHasResponse] = useState(false);
  const [isPrint, setIsPrint] = useState({
    index: -1,
    isPrinting: false,
    loading: false,
  });
  const fetchGenRef = useRef(0);

  const [t] = useTranslation();

  const handleReport = async (TestIDHash, PHead, index) => {
    if (isPrint.index === -1) {
      setIsPrint({ index: index, loading: true });
      const requestOptions = {
        ...(CheckDevice() == 1 && { responseType: "blob" }),
      };
      await axiosReport
        .post(
          `commonReports/GetLabReport`,
          {
            TestIDHash: TestIDHash,
            PHead: PHead,
            PrintColour: "1",
            IsDownload: CheckDevice(),
          },
          requestOptions,
        )
        .then((res) => {
          if (CheckDevice() == 1) {
            downloadPdf(res.data);
          } else {
            if (res?.data?.success) {
              window.open(res?.data?.url, "_blank");
            } else {
              toast.error(res?.data?.message);
            }
          }
          setIsPrint({ index: -1, loading: false });
        })
        .catch((err) => {
          setIsPrint({ index: -1, loading: false });
          handleClose();
          toast.error(
            err?.response?.data?.message
              ? err?.response?.data?.message
              : err?.data?.message,
          );
        });
    } else {
      toast.warn("Please wait Generating Report");
      // setIsPrint({ index: -1, loading: false });
    }
  };

  const getData = (patientCode, gen) => {
    return axiosInstance
      .post("CommonController/OldPatientReports", {
        PatientCode: patientCode,
      })
      .then((response) => {
        if (gen !== fetchGenRef.current) return;
        const raw = response?.data?.message;
        const rows = Array.isArray(raw) ? raw : [];
        const groupedData = {};

        rows.forEach((item) => {
          const ledgerNo = item.LedgerTransactionNo;
          if (!groupedData[ledgerNo]) {
            groupedData[ledgerNo] = { ...item, keyToPrint: [item.TestIdHash] };
          } else {
            groupedData[ledgerNo].keyToPrint.push(item.TestIdHash);
          }
        });

        setData(Object.values(groupedData));
        setHasResponse(true);
        setLoading(false);
      })
      .catch((err) => {
        if (gen !== fetchGenRef.current) return;
        setData([]);
        setHasResponse(true);
        setLoading(false);
        const msg = err?.response?.data?.message;
        if (msg && typeof msg === "string") {
          toast.error(msg);
        }
      })
      .finally(() => {
        if (oldReportFetchKey === String(patientCode)) {
          oldReportFetchKey = null;
        }
      });
  };

  useEffect(() => {
    if (!show) {
      oldReportFetchKey = null;
      fetchGenRef.current += 1;
      setData([]);
      setHasResponse(false);
      setLoading(false);
      return undefined;
    }

    const patientCode = value != null ? String(value) : "";
    if (!patientCode) {
      setData([]);
      setHasResponse(true);
      setLoading(false);
      return undefined;
    }

    if (oldReportFetchKey === patientCode) {
      return undefined;
    }

    oldReportFetchKey = patientCode;
    const gen = fetchGenRef.current + 1;
    fetchGenRef.current = gen;
    setHasResponse(false);
    setLoading(true);
    setData([]);
    getData(patientCode, gen);
    return undefined;
  }, [show, value]);

  const theme = useLocalStorage("theme", "get");
  if (!show) return null;

  return (
    <Dialog
      visible
      header={t("Old Reports")}
      onHide={handleClose}
      className={theme}
      style={{
        width: isMobile ? "80vw" : "50vw",
      }}
    >
      {loading || !hasResponse ? (
        <Loading />
      ) : (
        <div>
          {data.length > 0 ? (
            <Tables>
              <thead>
                <tr>
                  <th>{t("#")}</th>
                  <th>{t("PatientId")}</th>
                  <th>{t("Patient Name")}</th>
                  <th>{t("Lab Ref No.")}</th>
                  <th>{t("Booking Date")}</th>

                  <th>{t("Approved Date")}</th>
                  <th>{t("Source")}</th>
                  <th className="text-centre">{t("View Report")}</th>
                </tr>
              </thead>
              <tbody>
                {data.map((ele, index) => (
                  <tr key={index}>
                    <td data-title={"S.No"}>{index + 1}</td>
                    <td data-title={"PatientId"}>{ele?.PatientCode}</td>
                    <td data-title={"Patient Name"}>{ele?.PName}</td>
                    <td data-title={"Lab Ref No."}>
                      {ele?.LedgerTransactionNo}
                    </td>
                    <td data-title={"Date"}>{dateConfig(ele?.date)}</td>
                    <td data-title={"Approved"}>
                      {dateConfig(ele?.ApprovedDate)}
                    </td>
                    <td data-title={"Centre"}>{ele?.CentreName}</td>

                    <td data-title={"View Report"} className="text-center">
                      {index === isPrint.index && isPrint.loading ? (
                        <Loading />
                      ) : (
                        <>
                          <i
                            className="fa fa-print iconStyle"
                            style={{
                              cursor: "pointer",
                              textAlign: "center",
                            }}
                            onClick={() =>
                              handleReport(ele?.keyToPrint, 0, index)
                            }
                            title="Print without header"
                          ></i>
                          &nbsp;&nbsp;&nbsp;
                          <i
                            className="fa fa-print iconStyle"
                            style={{
                              color: "red",
                              cursor: "pointer",
                              textAlign: "center",
                            }}
                            onClick={() =>
                              handleReport(ele?.keyToPrint, 1, index)
                            }
                            title="Print with header"
                          ></i>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Tables>
          ) : (
            <div className="text-center p-3">
              <NoRecordFound />
              <p className="mb-0 mt-2">{t("No Record Found")}</p>
            </div>
          )}
        </div>
      )}
      <div className="row m-2">
        <div className="col-sm-2">
          <button
            className="btn btn-danger btn-sm btn-block"
            onClick={handleClose}
          >
            {t("Close")}
          </button>
        </div>
      </div>
    </Dialog>
  );
}

export default OldReportModal;
