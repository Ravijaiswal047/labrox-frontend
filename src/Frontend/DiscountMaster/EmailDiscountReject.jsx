import { useSearchParams } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { axiosInstance } from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { dateConfig } from "../../utils/helpers";
import Loading from "../../components/loader/Loading";
import { Dialog } from "primereact/dialog";
import { SaveButton } from "../../components/UI/CustomButton";

const EmailDiscountReject = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(true);
  const [remark, setRemark] = useState("");

  const handleSubmit = async () => {
    if (remark.trim() === "") {
      toast.error(t("Please enter rejection reason"));
      return;
    }

    const encodedToken = encodeURIComponent(token);

    setLoading(true);
    try {
      const rejectRes = await axiosInstance.post(
        "DiscountApprovalByEmployee/EmailDiscountReject",
        {
          token: encodedToken,
          remark: remark,
        }
      );

      if (rejectRes?.data?.success) {
        toast.success(t("Discount request rejected successfully"));
        setVisible(false);

        // After rejection, search for updated data
        const searchRes = await axiosInstance.get(
          `DiscountApprovalByEmployee/SearchDiscountData?token=${encodedToken}`
        );

        if (searchRes?.data?.success && Array.isArray(searchRes.data.message)) {
          setTableData(searchRes.data.message);
        } else {
          toast.error(
            searchRes?.data?.message || t("Failed to fetch rejection details")
          );
        }
      } else {
        toast.error(
          rejectRes?.data?.message || t("Failed to reject discount request")
        );
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message || t("Error rejecting discount request")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog
        header={t("Reject Discount Request")}
        visible={visible}
        style={{ width: "400px" }}
        onHide={() => setVisible(false)}
        closable={false}
      >
        <div className="p-fluid">
          <div className="p-field">
            <label htmlFor="remark" style={{ fontWeight: "bold" }}>
              {t("Reject Reason")} <span style={{ color: "red" }}>*</span>
            </label>
            <textarea
              id="remark"
              className=""
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              rows={4}
              placeholder={t("Enter rejection reason...")}
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ced4da",
                marginTop: "5px",
              }}
            />
          </div>
          <div
            style={{
              marginTop: "20px",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <SaveButton
              text={t("Submit Rejection")}
              onClick={handleSubmit}
              loading={loading}
            />
          </div>
        </div>
      </Dialog>

      {loading && <Loading />}
      <style>
        {`
          .landing-wrapper {
            background-color: #fffafa;
            min-height: 100vh;
            padding: 50px 15px;
            font-family: 'Inter', -apple-system, sans-serif;
            color: #1e293b;
          }
          .landing-container {
            max-width: 950px;
            margin: 0 auto;
          }
          .confirmation-card {
            background: #ffffff;
            border-radius: 16px;
            padding: 48px 32px;
            text-align: center;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            margin-bottom: 32px;
            border: 1px solid #fee2e2;
          }
          .icon-box {
            width: 80px;
            height: 80px;
            background-color: #fee2e2;
            color: #b91c1c;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 24px;
          }
          .icon-box i {
            font-size: 42px;
          }
          .confirm-title {
            font-size: 32px;
            font-weight: 800;
            color: #b91c1c;
            margin-bottom: 12px;
          }
          .confirm-desc {
            font-size: 18px;
            color: #64748b;
            margin-bottom: 0;
          }
          .table-box {
            background: #ffffff;
            border-radius: 16px;
            padding: 32px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            border: 1px solid #f1f5f9;
          }
          .table-title {
            font-size: 20px;
            font-weight: 700;
            margin-bottom: 24px;
            display: flex;
            align-items: center;
            color: #2d3748;
          }
          .table-title i {
            margin-right: 12px;
            color: #b91c1c;
          }
          .responsive-table {
            width: 100%;
            overflow-x: auto;
            border-radius: 12px;
            border: 1px solid #f1f5f9;
            margin-bottom: 24px;
          }
          .modern-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 15px;
          }
          .modern-table th {
            background-color: #f8fafc;
            padding: 16px 20px;
            text-align: left;
            font-weight: 600;
            color: #475569;
            border-bottom: 2px solid #f1f5f9;
            white-space: nowrap;
          }
          .modern-table td {
            padding: 16px 20px;
            border-bottom: 1px solid #f1f5f9;
            color: #334155;
          }
          .remarks-area {
            background-color: #f8fafc;
            border-radius: 12px;
            padding: 24px;
            border-left: 5px solid #b91c1c;
          }
          .remarks-label {
            font-size: 14px;
            font-weight: 700;
            color: #64748b;
            text-transform: uppercase;
            margin-bottom: 8px;
            display: block;
          }
          .remarks-text {
            font-size: 16px;
            color: #334155;
            line-height: 1.6;
          }
          @media (max-width: 640px) {
            .landing-wrapper { padding: 30px 10px; }
            .confirmation-card { padding: 32px 16px; }
            .confirm-title { font-size: 26px; }
            .table-box { padding: 20px; }
          }
        `}
      </style>

      <div className="landing-wrapper">
        <div className="landing-container">
          <div className="confirmation-card">
            <div className="icon-box">
              <i className="bi bi-x-octagon"></i>
            </div>
            <h1 className="confirm-title">{t("Request Rejected")}</h1>
            <p className="confirm-desc">{t("Your discount request was not approved based on current guidelines.")}</p>
          </div>

          <div className="table-box">
            <h2 className="table-title">
              <i className="bi bi-journal-x"></i>
              {t("Rejection Record Details")}
            </h2>
            <div className="responsive-table">
              {tableData.length > 0 ? (
                <table className="modern-table">
                  <thead>
                    <tr>
                      {[
                        t("S.No"),
                        t("Reason"),
                        t("Visit No"),
                        t("P.Name"),
                        t("Age"),
                        t("Gender"),
                        t("Gross"),
                        t("Discount"),
                        t("Net"),
                        t("Received"),
                        t("Balance"),
                        t("Rejected By"),
                        t("Date Time"),
                      ].map((h, i) => (
                        <th key={i}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((row, idx) => (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td style={{ color: "#b91c1c", fontWeight: "700" }}>
                          {row?.Reason}
                        </td>
                        <td>{row?.VisitNo}</td>
                        <td>{row?.PName}</td>
                        <td>{row?.Age}</td>
                        <td>{row?.Gender}</td>
                        <td>{row?.Gross}</td>
                        <td>{row?.Discount}</td>
                        <td>{row?.Net}</td>
                        <td>{row?.Received}</td>
                        <td>{row?.Balance}</td>
                        <td>{row?.RejectedBy}</td>
                        <td>{dateConfig(row?.RejectedDateTime)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    padding: "20px",
                    fontWeight: "bold",
                  }}
                >
                  {t("No Record Found")}
                </div>
              )}
            </div>

            <div className="remarks-area">
              <span className="remarks-label">{t("Official Rejection Remarks")}</span>
              <p className="remarks-text">{tableData[0]?.OtherReason || t("No additional details provided.")}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EmailDiscountReject;