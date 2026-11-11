import React, { useEffect, useState } from "react";
import { Image } from "react-bootstrap";
import { Dialog } from "primereact/dialog";
import Tables from "../../components/UI/customTable";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { useTranslation } from "react-i18next";
import { axiosInstance, axiosReport } from "../../utils/axiosInstance";
import { CustomButton } from "../../components/UI/CustomButton";
import { toast } from "react-toastify";
import { openPdfBlob } from "../../utils/helpers";

const PatientTestDetailModal = ({
    patientData,
    patientProfile,
    handlePatientDetailClose,
}) => {
    const theme = useLocalStorage("theme", "get");
    const { t } = useTranslation();
    const isMobile = window.innerWidth <= 768;
    const [showData,setShowData] = useState([]);
    const [selectedTestIds, setSelectedTestIds] = useState([]);
    const [reportLoadingKey, setReportLoadingKey] = useState(null);
    const [headerInfo, setHeaderInfo] = useState({
      patientName: "",
      visitNo: "",
      sinNo: "",
    });
    console.log("patientData", patientData);

    const getPatientDetail = (labno) => {
        //   setLoading(true);

        if (labno.length <= 4) {
            toast.error("Please enter valid Visit No/Barcode No.");
            setLoading(false);
            return;
        }
        console.log("before");
        axiosInstance
            .post(
                "Dispatch/DynamicLabSearch",
                {
                    LabNo: patientData?.BarcodeNo || "",
                },
            )
            .then((res) => {
                if (
                    Array.isArray(res?.data?.message) &&
                    res?.data?.message.length > 0
                ) {
                    const response = res?.data?.message;
                    const approvedTestIds = response
                        .filter((ele) => ele.Approved === 1) 
                        .map((ele) => ele.TestIDHash);
                    setSelectedTestIds(approvedTestIds);
                    setShowData(response);

                  const firstRow = response[0];
                  setHeaderInfo({
                    patientName: firstRow.PatientName,
                    visitNo: firstRow.VisitNo,
                    sinNo: firstRow.SinNo,
                  });
                } else {
                    toast.error(res?.data?.message);

                    setShowData([]);
                }
                //   setLoading(false);
            })
            .catch((err) => {
                toast.error(
                    err?.response?.data?.message
                        ? err?.response?.data?.message
                        : err?.data?.message,
                );
                //   setLoading(false);
                //   setDispatchData([]);
            });
    };

    const handleReport = async (PHead, download = false) => {
    if(selectedTestIds === ""){
      toast.error("Report is not ready !!");
      return;
    }
    const loadingKey = `${PHead}-${download}`;
    setReportLoadingKey(loadingKey);
        await axiosReport
          .post(
            `commonReports/GetLabReport`,
            {
              TestIDHash: selectedTestIds || [""],
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
              } catch {}

              if (!json?.success) {
                toast.error(json?.message || "Something went wrong");
              }

              // setPrintLoading({ [loader]: false, index: -1 });
              return;
            }

            const pdfUrl = window.URL.createObjectURL(blob);

            if (download) {
              const fileName = (headerInfo?.patientName || "Report").trim().replace(/[^a-zA-Z0-9]+/g, "_");
              const link = document.createElement("a");
              link.href = pdfUrl;
              link.download = `${fileName}.pdf`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              window.URL.revokeObjectURL(pdfUrl);
              return;
            }

            // Otherwise, open PDF in a new (popup) window
            openPdfBlob(blob, true);

            // For mobile download
            if (window.innerWidth <= 765) {
               downloadPdf(res.data);
            }

            // setPrintLoading({ [loader]: false, index: -1 });
          })
          .catch((err) => {
            toast.error(
              err?.response?.data?.message ||
                err?.data?.message ||
                "Something went wrong"
            );

            // setPrintLoading({ [loader]: false, index: -1 });
          })
          .finally(() => {
            setReportLoadingKey(null);
          });
    };

    useEffect(() => {
        if (patientData?.BarcodeNo !== "") {
            getPatientDetail(patientData?.BarcodeNo);
        }
    }, []);

    return (
        <Dialog
            visible={patientProfile}
            // header={t("Patient Reports")} 
        header={
          <div>
            {/* <div className="fw-bold">{t("Patient Reports")}</div> */}
            <div className="text-sm mt-1">
              <span className="me-3 mr-4">
                <strong className="text-danger">Patient Name:</strong> {headerInfo?.patientName}
              </span>
              <span className="me-3 mr-4">
                <strong className="text-danger">Visit No:</strong> {headerInfo?.visitNo}
              </span>
              <span className="me-3 mr-4">
                <strong className="text-danger">Barcode No:</strong> {headerInfo?.sinNo}
              </span>
            </div>
          </div>
        }
            
            className={theme}
            style={{
                width: isMobile ? "80vw" : "40vw",
            }}
            onHide={handlePatientDetailClose}
        >
            <Tables>
  <thead>
    <tr>
      <th className="text-center">Sr. No</th>
      {/* <th className="text-center">{t("Patient Name")}</th> */}
      {/* <th className="text-center">{t("Visit No/Lab No")}</th> */}
      <th className="text-center">{t("Test Name")}</th>     
      {/* <th className="text-center">{t("Barcode No")}</th> */}
      <th className="text-center">{t("Select")}</th>
    </tr>
  </thead>
  <tbody>
    {showData?.map((ele, index) => (
      <tr key={index} className={`Status-${ele.Status}`}>
        <td className="text-center">{index + 1}</td>
        {/* <td className="text-center">{ele.PatientName}</td> */}
        {/* <td className="text-center">{ele.VisitNo}</td> */}
        <td className="text-center">{ele.TestName}</td>
        
        {/* <td className="text-center">{ele.SinNo}</td> */}

        <td className="text-center">
          <input
            type="checkbox"
            checked={selectedTestIds.includes(ele.TestIDHash)}
            disabled={ele.Approved !== 1}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedTestIds((prev) => [...prev, ele.TestIDHash]);
              } else {
                setSelectedTestIds((prev) =>
                  prev.filter((id) => id !== ele.TestIDHash)
                );
              }
            }}
          />
        </td>
      </tr>
    ))}
  </tbody>
</Tables>

<div className="d-flex justify-content-center mt-2">
  <CustomButton
    text="Print"
    icon="print"
    onClick={() => handleReport(1)}
    className="mr-2"
    loading={reportLoadingKey === "1-false"}
    disabled={reportLoadingKey === "1-false"}
  />
  <CustomButton
    text="Print Without Header"
    icon="print"
    onClick={() => handleReport(0)}
    className="mr-2"
    loading={reportLoadingKey === "0-false"}
    disabled={reportLoadingKey === "0-false"}
  />
  <CustomButton
    text="Download Report"
    icon="download"
    onClick={() => handleReport(0, true)}
    className=""
    loading={reportLoadingKey === "0-true"}
    disabled={reportLoadingKey === "0-true"}
  />
  <CustomButton
    text="Download Report with Header"
    icon="download"
    onClick={() => handleReport(1, true)}
    className="ml-2"
    loading={reportLoadingKey === "1-true"}
    disabled={reportLoadingKey === "1-true"}
  />
</div>
        </Dialog>
    );
};

export default PatientTestDetailModal;