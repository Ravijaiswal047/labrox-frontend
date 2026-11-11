import React from "react";
import { Dialog } from "primereact/dialog";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { useTranslation } from "react-i18next";
import Tables from "../../components/UI/customTable";
const ValidatePaymentReceiptDetail = ({ receiptData, setShowReceiptData }) => {
  const theme = useLocalStorage("theme", "get");
  const isMobile = window.innerWidth <= 768;
  const { t } = useTranslation();
  return (
    <>
      {receiptData?.data?.length > 0 && (
        <Dialog
          style={{
            width: isMobile ? "80vw" : "50vw",
          }}
          onHide={() =>
            setShowReceiptData({
              data: "",
              receiptModal: false,
            })
          }
          title=""
          visible={receiptData?.receiptModal}
          className={theme}
        >
          <Tables>
            <thead className="cf text-center" style={{ zIndex: 99 }}>
              <tr>
                <th className="text-center">{t("Invoice No.")}</th>
                <th className="text-center">{t("Invoice Amount")}</th>
                <th className="text-center">{t("Payment Mode")}</th>
                <th className="text-center">{t("Amount")}</th>
              </tr>
            </thead>
            <tbody>
              {receiptData?.data?.map((ele, index) => (
                <>
                  <tr key={index}>
                    <td data-title="Invoice No." className="text-center">
                      {ele?.InvoiceNo}
                    </td>
                    <td data-title="Invoice Amount" className="amount">
                      {ele?.InvoiceAmount}
                    </td>
                    <td data-title="Payment Mode" className="text-center">
                      {ele?.PaymentMode}
                    </td>
                    <td data-title="Amount" className="amount">
                      {ele?.ReceivedAmt}
                    </td>
                  </tr>
                </>
              ))}
            </tbody>
          </Tables>
        </Dialog>
      )}
    </>
  );
};

export default ValidatePaymentReceiptDetail;
