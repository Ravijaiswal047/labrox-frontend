import React, { useState } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { axiosInstance } from "../../utils/axiosInstance";
import Input from "../../components/formComponent/Input";
import Tables from "../../components/UI/customTable";
import Loading from "../../components/loader/Loading";
import Accordion from "@app/components/UI/Accordion";
import { CustomButton, SearchButton } from "../../components/UI/CustomButton";

const CreditLedger = () => {
  const { t } = useTranslation();
  const [visitNo, setVisitNo] = useState("");
  const [searchLoad, setSearchLoad] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [changingIndex, setChangingIndex] = useState(-1);

  const fetch = () => {
    if (!visitNo.trim()) return;
    setSearchLoad(true);
    axiosInstance
      .post("Settlement/GetDataOnVisitNo", {
        ledgerTransactionNo: visitNo.trim(),
      })
      .then((res) => {
        if (res?.data?.success) {
          setTableData(res?.data?.message ?? []);
        } else {
          setTableData([]);
          toast.error(res?.data?.message || "No Record Found");
        }
        setSearchLoad(false);
      })
      .catch((err) => {
        setSearchLoad(false);
        setTableData([]);
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Something Went Wrong",
        );
      });
  };

  const handleKeyDown = (e) => {
    if (e?.key === "Enter") {
      fetch();
    }
  };

  const handleChangeLedgerType = (data, index) => {
    const ledgerTransactionNo = data?.LedgerTransactionNo;

    if (!ledgerTransactionNo) {
      toast.error("Ledger Transaction No. not found");
      return;
    }

    setChangingIndex(index);
    axiosInstance
      .post("Settlement/ChangeLedgerType", {
        ledgerTransactionNo,
      })
      .then((res) => {
        setChangingIndex(-1);
        if (res?.data?.success) {
          toast.success(res?.data?.message);
          setTableData((prev) =>
            prev.map((ele, i) =>
              i === index
                ? { ...ele, IsCredit: ele?.IsCredit == 1 ? 0 : 1 }
                : ele,
            ),
          );
        } else {
          toast.error(res?.data?.message || "Something Went Wrong");
        }
      })
      .catch((err) => {
        setChangingIndex(-1);
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Something Went Wrong",
        );
      });
  };

  return (
    <>
      <Accordion
        name={t("Credit Ledger")}
        isBreadcrumb={true}
        defaultValue={true}
      >
        <div className="row px-2 mt-2 mb-1">
          <div className="col-sm-2">
            <Input
              type="text"
              id="VisitNo"
              lable="Visit No."
              placeholder=" "
              value={visitNo}
              onKeyDown={handleKeyDown}
              onChange={(e) => setVisitNo(e?.target?.value)}
            />
          </div>

          <div className="col-sm-1">
            <SearchButton
              text={"Search"}
              onClick={fetch}
              disabled={visitNo.trim().length === 0}
            />
          </div>
        </div>
      </Accordion>

      {searchLoad ? (
        <Loading />
      ) : (
        tableData.length > 0 && (
        <Accordion title={t("Credit Ledger Details")} defaultValue={true}>
          <Tables>
            <thead className="cf">
              <tr>
                <th>{t("#")}</th>
                <th>{t("Visit No.")}</th>
                <th>{t("Patient Name")}</th>
                <th>{t("Patient Code")}</th>
                <th>{t("Age")}</th>
                <th>{t("Gender")}</th>
                <th>{t("Doctor Name")}</th>
                <th>{t("Gross Amount")}</th>
                <th>{t("Discount")}</th>
                <th>{t("Net Amount")}</th>
                <th>{t("Adjustment")}</th>
                <th>{t("Balance")}</th>
                <th>{t("Is Credit")}</th>
                <th>{t("Action")}</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((data, index) => (
                <tr key={index}>
                  <td data-title={t("#")}>{index + 1}</td>
                  <td data-title={t("Visit No.")}>
                    {data?.LedgerTransactionNo}
                  </td>
                  <td data-title={t("Patient Name")}>{data?.PName}</td>
                  <td data-title={t("Patient Code")}>{data?.PatientCode}</td>
                  <td data-title={t("Age")}>{data?.Age}</td>
                  <td data-title={t("Gender")}>{data?.Gender}</td>
                  <td data-title={t("Doctor Name")}>{data?.DoctorName}</td>
                  <td data-title={t("Gross Amount")}>{data?.GrossAmount}</td>
                  <td data-title={t("Discount")}>{data?.DiscountOnTotal}</td>
                  <td data-title={t("Net Amount")}>{data?.NetAmount}</td>
                  <td data-title={t("Adjustment")}>{data?.Adjustment}</td>
                  <td data-title={t("Balance")}>{data?.Balance}</td>
                  <td data-title={t("Is Credit")}>
                    {data?.IsCredit == 1 ? t("Yes") : t("No")}
                  </td>
                  <td data-title={t("Action")}>
                    {changingIndex === index ? (
                      <Loading />
                    ) : (
                      <CustomButton
                        text={data?.IsCredit == 1 ? t("Change to Cash") : t("Change to Credit")}
                        onClick={() => handleChangeLedgerType(data, index)}
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Tables>
        </Accordion>
        )
      )}
    </>
  );
};

export default CreditLedger;
