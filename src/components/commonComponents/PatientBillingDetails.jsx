import React, { useEffect, useMemo } from 'react'
import Heading from '../UI/Heading'
import LabeledInput from '../formComponent/LabeledInput';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../../utils/ustil2';
import { useLocalStorage } from '../../utils/hooks/useLocalStorage';
export default function PatientBillingDetails({ BillDetails, heading }) {
  const { t } = useTranslation()
  const localdata = useLocalStorage("userData", "get");
  
  const handleDataInDetailView = useMemo(() => {
    if (Object.keys(BillDetails)?.length > 0) {
      const data = [
        {
          label: "Gross Amount",
          value: BillDetails?.GrossBillAmount || "0.00",
        },
        {
          label: "Item Discount",
          value: BillDetails?.ItemWiseDiscount || "0.00",
        },
        {
          label: "Discount On Bill",
          value: BillDetails?.DiscountOnBill || "0.00",
        },
        {
          label: "Total Discount",
          value: BillDetails?.TotalDiscount || "0.00",
        },
        {
          label: "Round Off",
          value: BillDetails?.RoundOff || "0.00",
        },
        {
          label: "Net Amount",
          value: BillDetails?.NetAmount || "0.00",
        },
        {
          label: "Patient Payable",
          value: BillDetails?.PatientPaybleAmt || "0.00",
        },
        {
          label: "Panel Payable",
          value: BillDetails?.PanelPaybleAmt || "0.00",
        },
        {
          label: "Patient Paid",
          value: BillDetails?.PatientPaidAmt || "0.00",
        },
        {
          label: "Panel Paid",
          value: BillDetails?.PanelPaidAmt || "0.00",
        },
        {
          label: "Total Paid",
          value: BillDetails?.TotalPaidAmount || "0.00",
        },
        {
          label: "Deduction",
          value: BillDetails?.TotalDeductions || "0.00",
        },
        {
          label: "TDS",
          value: BillDetails?.TotalTDS || "0.00",
        },
        {
          label: "Write Off",
          value: BillDetails?.TotalWriteOff || "0.00",
        },
        {
          label: "Balance Amt",
          value: BillDetails?.RemainingAmt || "0.00",
        },
        {
          label: "Patient Balance",
          value: BillDetails?.PatientRemaining || "0.00",
        },
        {
          label: "Panel Balance",
          value: BillDetails?.PanelRemaining || "0.00",
        },
      ];

      return data;
    } else {
      return [];
    }
  }, [BillDetails]);

  return (
    <>
      <div className="card">
        <Heading title={<>{heading}</>} />
        <div className="row m-2">
         
          {handleDataInDetailView?.map((data, index) => (

            <>
              <div
                className="col-9inrow"
                key={index}
                style={{
                  display: "grid",
                  alignItems: "center",
                }}
              >
                <div className="d-flex align-items-center">
                  {data?.icons}
                  <LabeledInput
                    label={t(data?.label)}
                    value={formatCurrency(
                      data?.value ? data?.value : "0",
                      data?.Currency ? data?.Currency : localdata?.centreCurrency
                    )}
                    className={"w-100"}
                    style={{ textAlign: "right", color: "red" }}
                  />
                </div>
              </div>
            </>
          ))}
         
        </div>
      </div>


    </>
  )
}
