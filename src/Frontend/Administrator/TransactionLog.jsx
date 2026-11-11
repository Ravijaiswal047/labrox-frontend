import React, { useEffect, useState, useCallback } from "react";
import { CustomButton } from "../../components/UI/CustomButton";
import Accordion from "@app/components/UI/Accordion";
import { useTranslation } from "react-i18next";
import Tables from "../../components/UI/customTable";
import { axiosInstance } from "../../utils/axiosInstance";
const TransactionLog = ({ ledgerTransactionNo, patientData }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("Discount Details");
  const [transactionLogData, setTransactionLogData] = useState([]);

  const TransactionLogData = useCallback(async () => {
    try {
      const res = await axiosInstance.get("Lab/Transaction_Log", {
        params: {
          ledgerTransactionNo: ledgerTransactionNo,
        },
      });
      const data = res?.data?.data || [];
      const processed = Array.isArray(data)
        ? data.map((item) => {
            const safeParse = (str) => {
              try {
                return JSON.parse(str);
              } catch (e) {
                return [];
              }
            };
            return {
              ...item,
              DiscountDetails: safeParse(item.DiscountDetails),
              SettelmentList: safeParse(item.SettelmentList),
              ChangePaymentModeList: safeParse(item.ChangePaymentModeList),
              MedicalHistoryList: safeParse(item.MedicalHistoryList),
              TestCancelList: safeParse(item.TestCancelList),
            };
          })
        : [];
      setTransactionLogData(processed);
      console.log("transactionLogData", processed);
    } catch (err) {
      console.log(err);
    }
  }, [ledgerTransactionNo]);

  useEffect(() => {
    TransactionLogData();
  }, [TransactionLogData]);

  return (
    <>
      <Accordion
        name={t("Transaction Log")}
        isBreadcrumb={true}
        defaultValue={true}
        seconTitle={
          <div
            className="d-flex align-items-center"
            style={{ gap: "10px", fontSize: "14px", marginLeft: "20px" }}
          >
            <div
              className="d-flex"
              style={{ gap: "10px", fontWeight: "normal", color: "inherit" }}
            >
              <span>
                | <b>{t("Visit No")}:</b> {patientData?.LedgerTransactionNo}
              </span>
              <span>
                | <b>{t("Name")}:</b>{" "}
                {[
                  patientData?.Title,
                  patientData?.FirstName,
                  patientData?.MiddleName,
                  patientData?.LastName,
                ]
                  .filter(Boolean)
                  .join(" ")}
              </span>
              <span>
                | <b>{t("Age/Gender")}:</b> {patientData?.Age} / {patientData?.Gender}
              </span>
            </div>
          </div>
        }
      >
        <div className=" d-flex p-2 " style={{ gap: "10px" }}>
          <CustomButton
            text={"Discount Details"}
            onClick={() => { setActiveTab("Discount Details"); }}
            disabled={activeTab === "Discount Details"}
            
          />
          <CustomButton
            text={"Settelment List"}
            onClick={() => { setActiveTab("Settelment List"); }}
            disabled={activeTab === "Settelment List"}
          
          />
          <CustomButton
            text={"Change Payment Mode List"}
            onClick={() => { setActiveTab("Change Payment Mode List"); }}
            disabled={activeTab === "Change Payment Mode List"}
          />
          <CustomButton
            text={"Medical History List"}
            onClick={() => { setActiveTab("Medical History List"); }}
            disabled={activeTab === "Medical History List"}
          />
          <CustomButton
            text={"Test Cancel List"}
            onClick={() => { setActiveTab("Test Cancel List"); }}
            disabled={activeTab === "Test Cancel List"}
          />
        </div>
      </Accordion>
      {activeTab === "Discount Details" && (
        <Accordion
          name={t("Discount Details")}
          isBreadcrumb={true}
          defaultValue={true}
        >
          <Tables >
            <thead>
              <tr>
                <th>{t("Sr.No")}</th>
                 <th>{t("User Name")}</th>
                <th>{t("Amount")}</th>
                <th>{t("Reason")}</th>
                <th>{t("Approved By")}</th>
                <th>{t("Entry Date")}</th>
              </tr>
            </thead>
            <tbody>
              {transactionLogData.flatMap(item => item.DiscountDetails || []).map((detail, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{detail?.UserName}</td>
                  <td>{detail?.Amount}</td>
                  <td>{detail?.Reason}</td>
                  <td>{detail?.ApprovedBy}</td>
                  <td>{detail?.EntryDate}</td>
                </tr>
              ))}
            </tbody>
          </Tables>
        </Accordion>
      )}
      {activeTab === "Settelment List" && (
        <Accordion
          name={t("Settelment List")}
          isBreadcrumb={true}
          defaultValue={true}
        >
          <Tables>
            <thead>
              <tr>
                <th>{t("Sr.No")}</th>
                <th>{t("Reciept No")}</th>
                <th>{t("Amount")}</th>
                <th>{t("Payment Mode")}</th>
                <th>{t("User Name")}</th>
                <th>{t("Entry Date")}</th>
                <th>{t("Status")}</th>
                <th>{t("Remarks")}</th>
                <th>{t("Cancel Info")}</th>
              </tr>
            </thead>
            <tbody>
              {transactionLogData.flatMap(item => item.SettelmentList || []).map((detail, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{detail?.ReceiptNo}</td>
                  <td>{detail?.Amount}</td>
                  <td>{detail?.PaymentMode}</td>
                  <td>{detail?.UserName}</td>
                  <td>{detail?.EntryDate || detail?.dtEntry}</td>
                  <td>
                    {detail?.Status ||
                      (Number(detail?.IsCancel) === 1 ? "Cancel" : "Active")}
                  </td>
                  <td>{detail?.Remarks || detail?.UpdateRemarks}</td>
                  <td>
                    {detail?.CancelInfo ||
                      [detail?.CancelBy, detail?.CancelReason, detail?.dtCancel]
                        .filter(Boolean)
                        .join(" / ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </Tables>
        </Accordion>
      )}
      {activeTab === "Change Payment Mode List" && (
        <Accordion
          name={t("Change Payment Mode List")}
          isBreadcrumb={true}
          defaultValue={true}
        >
          <Tables>
            <thead>
              <tr>
                <th>{t("Sr.No")}</th>
                <th>{t("Reciept No")}</th>
                <th>{t("User Name")}</th>
                <th>{t("Amount")}</th>
                <th>{t("Payment Mode")}</th>
                <th>{t("Entry Date")}</th>
                <th>{t("Status")}</th>
                <th>{t("Cancel Info")}</th>
              </tr>
            </thead>
            <tbody>
              {transactionLogData.flatMap(item => item.ChangePaymentModeList || []).map((detail, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{detail?.ReceiptNo}</td>
                  <td>{detail?.UserName}</td>
                  <td>{detail?.Amount}</td>
                  <td>{detail?.PaymentMode}</td>
                  <td>{detail?.EntryDate}</td>
                  <td>{detail?.Status}</td>
                  <td>{detail?.CancelInfo}</td>
                </tr>
              ))}
            </tbody>
          </Tables>
        </Accordion>
      )}
      {activeTab === "Medical History List" && (
        <Accordion
          name={t("Medical History List")}
          isBreadcrumb={true}
          defaultValue={true}
        >
          <Tables>
            <thead>
              <tr>
                <th>{t("Sr.No")}</th>  
                <th>{t("Medical History")}</th>
                <th>{t("Created By")}</th>
                <th>{t("Created Date")}</th>
              </tr>
            </thead>
            <tbody>
              {transactionLogData.flatMap(item => item.MedicalHistoryList || []).map((detail, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                   <td>{detail?.MedicalHistory}</td>
                  <td>{detail?.CreatedBy}</td>
                  <td>{detail?.CreatedDate}</td>
                </tr>
              ))}
            </tbody>
          </Tables>
        </Accordion>
      )}
      {activeTab === "Test Cancel List" && (
        <Accordion
          name={t("Test Cancel List")}
          isBreadcrumb={true}
          defaultValue={true}
        >
          <Tables>
            <thead>
              <tr>
                <th>{t("Sr.No")}</th>
                <th>{t("Test Name")}</th>
                <th>{t("Test Code")}</th>
                <th>{t("Date")}</th>
                <th>{t("Created By Name")}</th>
              </tr>
            </thead>
            <tbody>
              {transactionLogData.flatMap(item => item.TestCancelList || []).map((detail, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{detail?.TestName}</td>
                  <td>{detail?.TestCode}</td>
                  <td>{detail?.dtEntry}</td>
                  <td>{detail?.CreatedByName}</td>
                </tr>
              ))}
            </tbody>
          </Tables>
        </Accordion>
      )}  
          </>
  );
};

export default TransactionLog;
