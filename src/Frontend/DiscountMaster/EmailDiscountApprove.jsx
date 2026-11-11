import { useSearchParams } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { axiosInstance } from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { dateConfig } from "../../utils/helpers";
import Loading from "../../components/loader/Loading";

const EmailDiscountApprove = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      const encodedToken = encodeURIComponent(token);
      setLoading(true);
      axiosInstance
        .get(`DiscountApprovalByEmployee/EmailDiscountApprove?token=${encodedToken}`)
        .then((resApprove) => {
          if (resApprove?.data?.success) {
            return axiosInstance.get(
              `DiscountApprovalByEmployee/SearchDiscountData?token=${encodedToken}`
            );
          } else {
            toast.error(
              resApprove?.data?.message || t("Failed to approve discount")
            );
            setTableData([]);
          }
        })
        .then((resSearch) => {
          if (resSearch?.data?.success) {
            if (Array.isArray(resSearch.data.message)) {
              setTableData(resSearch?.data?.message || []);
            } else {
              toast.error(
                resSearch?.data?.message || t("Failed to fetch approval details")
              );
              setTableData([]);
            }
          } else if (resSearch) {
            toast.error(
              resSearch?.data?.message || t("Failed to fetch approval details")
            );
            setTableData([]);
          }
        })
        .catch((err) => {
          toast.error(err?.response?.data?.message || t("Error fetching approval details"));
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [token, t]);

  return (
    <>
      {loading && <Loading />}
      <style>
        {`
          .landing-wrapper {
            background-color: #f8fafc;
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
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            margin-bottom: 32px;
            border: 1px solid #e2e8f0;
          }
          .icon-box {
            width: 80px;
            height: 80px;
            background-color: #f0fdf4;
            color: #16a34a;
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
            color: #16a34a;
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
            border: 1px solid #e2e8f0;
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
            color: #16a34a;
          }
          .responsive-table {
            width: 100%;
            overflow-x: auto;
            border-radius: 12px;
            border: 1px solid #f1f5f9;
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
          .modern-table tbody tr:hover {
            background-color: #fdfdfd;
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
          {/* Main Success Section */}
          <div className="confirmation-card">
            <div className="icon-box">
              <i className="bi bi-check2-circle"></i>
            </div>
            <h1 className="confirm-title">{t("Approved Successfully")}</h1>
            <p className="confirm-desc">{t("Your discount request has been reviewed and approved.")}</p>
          </div>

          {/* Details Section */}
          <div className="table-box">
            <h2 className="table-title">
              <i className="bi bi-file-text"></i>
              {t("Approval Record Details")}
            </h2>
            <div className="responsive-table">
              {tableData.length > 0 ? (
                <table className="modern-table">
                  <thead>
                    <tr>
                      {[
                        t("S.No"),
                        t("Visit No"),
                        t("P.Name"),
                        t("Discount"),
                        t("Net"),
                        t("Status"),
                        t("Approved By"),
                        t("Date"),
                      ].map((h, i) => (
                        <th key={i}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((row, idx) => (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td>{row?.LedgertransactionNo}</td>
                        <td>{row?.PName}</td>
                        <td>{row?.DiscountOnTotal}</td>
                        <td>{row?.NetAmount}</td>
                        <td>{row?.DiscountStatus}</td>
                        <td>{row?.DiscountApprovedByName}</td>
                        <td>{row?.DATE}</td>
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
          </div>
        </div>
      </div>
    </>
  );
};

export default EmailDiscountApprove;