import React, { useEffect, useState } from "react";

import { toast } from "react-toastify";
import { axiosInstance } from "../../utils/axiosInstance";
import { useTranslation } from "react-i18next";
import Input from "../../components/formComponent/Input";
import Tables from "../../components/UI/customTable";
import Loading from "../../components/loader/Loading";
import {
  checkEmploypeeWiseDiscount,
  getBindDiscApproval,
  getBindDiscReason,
} from "../../utils/NetworkApi/commonApi";
import { SelectBox } from "../../components/formComponent/SelectBox";
import DiscountBearBy from "../../components/formComponent/DiscountBearBy";
import {
  emptyDiscountBearBy,
  syncDiscountBearBy,
  toDiscountBearByPayload,
  validateDiscountBearBy,
} from "../../utils/discountBearBy";

import Accordion from "@app/components/UI/Accordion";
import { useSelector } from "react-redux";
import {
  CustomButton,
  SaveButton,
  SearchButton,
} from "../../components/UI/CustomButton";
const DiscountAfterBill = () => {
  const [load, setLoad] = useState({
    saveLoad: false,
    searchLoad: false,
  });
  const [LabNo, setLabNo] = useState("");
  const reprintLabNo = useSelector((state) => state.loadingSlice.reprintLabNo);
  const [BindDiscApproval, setBindDiscApproval] = useState([]);
  const [BindDiscReason, setBindDiscReason] = useState([]);
  const [dropdownData, setDropDownData] = useState({
    DiscountApprovedBy: "",
    DiscountReason: "",
  });
  const [discountBearBy, setDiscountBearBy] = useState(emptyDiscountBearBy());
  const [tableData, setTableData] = useState([]);

  const fetch = (labNo = "", showLoading = true) => {
    if (showLoading) {
      setLoad((prev) => ({ ...prev, searchLoad: true }));
    }
    const searchNo =
      (typeof labNo === "string" && labNo.trim()) ||
      (typeof LabNo === "string" && LabNo.trim()) ||
      "";
    if (!searchNo) {
      if (showLoading) {
        setLoad((prev) => ({ ...prev, searchLoad: false }));
      }
      return;
    }
    axiosInstance
      .post("DiscountAfterBill/GetItemsToGetDiscount", {
        LedgerTransactionNo: searchNo,
      })
      .then((res) => {
        if (res?.data?.success) {
          let data = res?.data?.message;
          let val = data.map((ele) => {
            return {
              ...ele,
              DiscountAmt: 0,
              isActive: ele?.InvoiceNo === "" ? 1 : 0,
            };
          });
          setTableData(val);
        } else {
          if (showLoading) {
            setTableData([]);
            toast.error(
              res?.data?.message?.trim() ? res?.data?.message : "No Record Found",
            );
          }
        }

        if (showLoading) {
          setLoad((prev) => ({ ...prev, searchLoad: false }));
        }
      })
      .catch((err) => {
        if (showLoading) {
          setLoad((prev) => ({ ...prev, searchLoad: false }));
        }
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Something Went Wrong",
        );
      });
  };

  const handleSelectChange = (event) => {
    const { name, value } = event.target;
    if (name === "DiscountApprovedBy") {
      if (value) {
        const { GrossAmount, DiscAmt } = DiscountValidation();
        checkEmploypeeWiseDiscount(
          {
            GrossAmount: GrossAmount,
            CentreID: tableData[0]?.CentreId ?? "",
            DiscountOnTotal: DiscAmt,
          },
          value,
        )
          .then((res) => {
            setDropDownData({ ...dropdownData, [name]: value });
          })
          .catch((err) => {
            toast.error(err);
            setDropDownData({ ...dropdownData, [name]: "" });
          });
      } else {
        setDropDownData({ ...dropdownData, [name]: "" });
      }
    }
    setDropDownData({ ...dropdownData, [name]: value });
  };

  const handleSaveShowButton = () => {
    let show = false;
    for (let i = 0; tableData?.length > i; i++) {
      if (
        document?.getElementById(`DiscountAmt-${i}`)?.value !== "" &&
        document?.getElementById(`DiscountAmt-${i}`)?.value != 0
      ) {
        show = true;
        break;
      }
    }
    return show;
  };
  const handleKeyDown = (e) => {
    if (e?.key === "Enter") {
      fetch(LabNo);
    }
  };
  const getAppliedDiscount = (rows = tableData) =>
    rows
      .filter((ele) => ele?.isActive == 1 && ele?.InvoiceNo == "")
      .reduce((sum, ele) => sum + Number(ele?.DiscountAmt || 0), 0);

  const handleSave = () => {
    if (dropdownData?.DiscountApprovedBy && dropdownData?.DiscountReason) {
      const appliedDiscount = getAppliedDiscount();
      const bearCheck = validateDiscountBearBy(discountBearBy, appliedDiscount);
      if (!bearCheck.ok) {
        toast.error(bearCheck.message);
        return;
      }
      setLoad({ ...load, saveLoad: true });
      const data = tableData
        .filter((ele) => {
          console.log(
            "object",
            ele?.isActive == "1",
            ele?.Approved == 0,
            ele?.InvoiceNo == "",
          );
          // return ele?.isActive == "1" && ele?.Approved == 0 && ele?.InvoiceNo == "" // approved removed by prashant Sir
          return ele?.isActive == "1" && ele?.InvoiceNo == "";
        })
        .map((ele) => {
          return {
            ItemId: ele?.ItemId,
            LedgerTransactionID: ele?.LedgerTransactionID,
            DiscountAmt: ele?.DiscountAmt,
            DiscountApprovedBy: dropdownData?.DiscountApprovedBy,
            DiscountReason: dropdownData?.DiscountReason,
            IsCancel: 0,
          };
        });
      console.log("data:::::", data);
      axiosInstance
        .post("DiscountAfterBill/SaveDiscountAfterBill", {
          PLONew: data,
          ...toDiscountBearByPayload(discountBearBy),
        })
        .then((res) => {
          for (let i = 0; i < tableData?.length; i++) {
            const el = document.getElementById(`DiscountAmt-${i}`);
            if (el) el.value = "";
          }
          const discByPercentage = document.getElementById("DiscountByPercentage");
          if (discByPercentage) discByPercentage.value = "";
          const discByRS = document.getElementById("DiscountByRS");
          if (discByRS) discByRS.value = "";

          toast.success(res?.data?.message);
          setLoad((prev) => ({ ...prev, saveLoad: false }));
          setDropDownData({
            DiscountApprovedBy: "",
            DiscountReason: "",
          });
          setDiscountBearBy(emptyDiscountBearBy());

          const currentLabNo =
            (typeof LabNo === "string" && LabNo.trim()) ||
            tableData[0]?.LedgerTransactionNo ||
            "";

          const updatedTableData = tableData.map((ele) => {
            const appliedDisc = Number(ele?.DiscountAmt || 0);
            const newDiscAmt = Number(ele?.DiscAmt || 0) + appliedDisc;
            const gross = Number(ele?.Rate || 0);
            const newAmount = Math.max(0, gross - newDiscAmt);
            return {
              ...ele,
              DiscAmt: newDiscAmt,
              Amount: newAmount,
              DiscountAmt: 0,
            };
          });

          setTableData(updatedTableData);

          if (currentLabNo) {
            fetch(currentLabNo, false);
          }
        })
        .catch((err) => {
          toast.error(
            err?.response?.data?.message
              ? err?.response?.data?.message
              : "Something went wrong",
          );
          setLoad((prev) => ({ ...prev, saveLoad: false }));
        });
    } else {
      toast.error("Please Choose Discount Approval and Reason");
    }
  };

  const DiscountValidation = (id) => {
    let GrossAmount = 0;
    let DiscAmt = 0;
    for (let i = 0; tableData.length > i; i++) {
      GrossAmount = GrossAmount + Number(tableData[i]?.Rate);
      DiscAmt =
        DiscAmt + Number(document.getElementById(`DiscountAmt-${i}`).value);
    }
    return {
      GrossAmount,
      DiscAmt,
    };
  };

  const total = () => {
    const totalvalue = tableData
      .filter((ele) => ele?.isActive == 1)
      .reduce((prev, current, index) => prev + current.Amount, 0);
    return totalvalue;
  };

  const getSummary = () => {
    const billAmount = tableData.reduce(
      (sum, ele) => sum + Number(ele?.Rate || 0) * Number(ele?.Quantity || 1),
      0,
    );
    const totalDiscount = tableData.reduce(
      (sum, ele) => sum + Number(ele?.DiscAmt || 0),
      0,
    );
    const netBillAmount = tableData.reduce(
      (sum, ele) => sum + Number(ele?.Amount || 0),
      0,
    );
    return { billAmount, totalDiscount, netBillAmount };
  };

  const handleSumOfTest = (id, value) => {
    if (id === "DiscountByRS") {
      const totalvalue = total();
      document.getElementById("DiscountByPercentage").value = "";
      return {
        totalvalue: totalvalue >= value ? true : false,
        message: "Your value is Greater then total value",
      };
    } else {
      document.getElementById("DiscountByRS").value = "";
      return {
        totalvalue: value <= 100 ? true : false,
        message: "Discount Percentage is greater than 100%",
      };
    }
  };

  const findPercentageAmount = (value) => {
    const findPercentageDiscount = ((value / total()) * 100).toFixed(2);
    return findPercentageDiscount;
  };

  const sumTotal = [];

  const separateAmountByDiscount = (
    value,
    percentage,
    lastindex,
    condition,
    inputValue,
  ) => {
    if (condition) {
      if (!lastindex) {
        const data = (value * percentage) / 100;
        const finalData = data.toFixed(2);
        sumTotal.push(finalData);
        return finalData;
      } else {
        const finalData = sumTotal.reduce(
          (acc, current) => acc + parseFloat(current),
          0,
        );

        const finalResult = parseFloat((inputValue - finalData).toFixed(2));
        return finalResult;
      }
    } else {
      const data = (value * percentage) / 100;
      const finalData = data.toFixed(2);
      return finalData;
    }
  };

  const handleChangeMain = (e) => {
    const { name, value, id } = e.target;
    if (id !== "DiscountByRS" && value.length > 3) {
      e.preventDefault();
      return;
    }
    const { totalvalue, message } = handleSumOfTest(id, value);
    if (totalvalue) {
      const lastActiveIndex = tableData.reduce(
        (last, ele, index) => (ele?.isActive == 1 ? index : last),
        -1,
      );

      const data = tableData.map((ele, index) => {
        if (ele?.isActive == 1) {
          const inputValue = separateAmountByDiscount(
            ele?.Amount,
            id === "DiscountByRS" ? findPercentageAmount(value) : value,
            index === lastActiveIndex,
            id === "DiscountByRS",
            value,
          );
          document.getElementById(`DiscountAmt-${index}`).value = inputValue;

          return {
            ...ele,
            [name]: inputValue,
          };
        } else {
          return ele;
        }
      });
      setTableData(data);
    } else {
      toast.error(message);
    }
  };
  useEffect(() => {
    getBindDiscApproval(setBindDiscApproval);
    getBindDiscReason(setBindDiscReason);
    if (reprintLabNo) {
      setLabNo(reprintLabNo);
      fetch(reprintLabNo);
    }
  }, []);

  useEffect(() => {
    setDiscountBearBy((prev) =>
      syncDiscountBearBy(prev, getAppliedDiscount(), false),
    );
  }, [tableData]);

  const { t } = useTranslation();
  const handleRemoveDiscount = async () => {
    const userConfirmed = window.confirm("Are you sure you want to remove the discount?");

    if (!userConfirmed) return;

    if (tableData.length === 0) {
      toast.error("No data found");
      return;
    }

    setLoad({ ...load, saveLoad: true });

    try {
      const ledgerTransactionIDHash = tableData[0]?.LedgerTransactionIDHash;

      if (!ledgerTransactionIDHash) {
        toast.error("Ledger Transaction ID Hash not found");
        setLoad({ ...load, saveLoad: false });
        return;
      }

      const res = await axiosInstance.post(
        "DiscountAfterBill/RemoveDiscount",
        {
          ledgerTransactionIDHash: String(ledgerTransactionIDHash),
        }
      );

      if (res?.data?.success) {
        for (let i = 0; i < tableData?.length; i++) {
          const elem = document.getElementById(`DiscountAmt-${i}`);
          if (elem) elem.value = "";
        }
        const discByPercentage = document.getElementById("DiscountByPercentage");
        if (discByPercentage) discByPercentage.value = "";
        const discByRS = document.getElementById("DiscountByRS");
        if (discByRS) discByRS.value = "";

        toast.success(res?.data?.message || "Discount removed successfully");
        setDropDownData({
          DiscountApprovedBy: "",
          DiscountReason: "",
        });
        setDiscountBearBy(emptyDiscountBearBy());

        const currentLabNo =
          (typeof LabNo === "string" && LabNo.trim()) ||
          tableData[0]?.LedgerTransactionNo ||
          "";

        const updatedTableData = tableData.map((ele) => {
          const gross = Number(ele?.Rate || 0);
          return {
            ...ele,
            DiscAmt: 0,
            Amount: gross,
            DiscountAmt: 0,
          };
        });
        setTableData(updatedTableData);

        if (currentLabNo) {
          fetch(currentLabNo, false);
        }
      } else {
        toast.error(res?.data?.message || "Failed to remove discount");
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Something went wrong"
      );
    } finally {
      setLoad((prev) => ({ ...prev, saveLoad: false }));
    }
  };

  const handleCancelAll = (flag, data) => {
    const userConfirmed = window.confirm("Are you sure you want to cancel?");

    if (!userConfirmed) return;
    setLoad({ ...load, saveLoad: true });
    const finalData = flag ? tableData : [data];
    const datas = finalData
      .filter((ele) => ele?.DiscAmt != 0)
      .map((ele) => {
        return {
          ItemId: ele?.ItemId,
          LedgerTransactionID: ele?.LedgerTransactionID,
          DiscountAmt: ele?.DiscAmt,
          DiscountApprovedBy: 0,
          DiscountReason: "",
          IsCancel: 1,
        };
      });
    axiosInstance
      .post("DiscountAfterBill/SaveDiscountAfterBill", {
        PLONew: datas,
      })
      .then((res) => {
        if (res?.data?.success) {
          for (let i = 0; i < tableData?.length; i++) {
            const el = document.getElementById(`DiscountAmt-${i}`);
            if (el) el.value = "";
          }
          const discByPercentage = document.getElementById("DiscountByPercentage");
          if (discByPercentage) discByPercentage.value = "";
          const discByRS = document.getElementById("DiscountByRS");
          if (discByRS) discByRS.value = "";

          toast.success(res?.data?.message);
          setLoad((prev) => ({ ...prev, saveLoad: false }));
          setDropDownData({
            DiscountApprovedBy: "",
            DiscountReason: "",
          });
          setDiscountBearBy(emptyDiscountBearBy());

          const currentLabNo =
            (typeof LabNo === "string" && LabNo.trim()) ||
            tableData[0]?.LedgerTransactionNo ||
            "";

          if (currentLabNo) {
            fetch(currentLabNo, false);
          } else {
            setTableData([]);
          }
        } else {
          setLoad((prev) => ({ ...prev, saveLoad: false }));
          toast.error(res?.data?.message);
        }
      })
      .catch((err) => {
        setLoad((prev) => ({ ...prev, saveLoad: false }));
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
        name={t("Discount After Bill")}
        isBreadcrumb={true}
        defaultValue={true}
      >
        <div className="row  px-2 mt-2 mb-1">
          <div className="col-sm-2">
            <Input
              type="text"
              id="LabNo"
              lable="Lab Number"
              placeholder=" "
              value={LabNo}
              onKeyDown={handleKeyDown}
              onChange={(e) => {
                setLabNo(e?.target?.value);
              }}
            />
          </div>

          <div className="col-sm-1">
            <SearchButton
              text={"Search"}
              onClick={() => fetch("")}
              disabled={LabNo.length == 0}
            />
          </div>
        </div>
      </Accordion>

      {!load?.searchLoad ? (
        tableData.length > 0 ? (
          <>
            {(() => {
              const { billAmount, totalDiscount, netBillAmount } =
                getSummary();
              const anyActive = tableData?.some((item) => item.isActive == 1);
              return (
                <>
                  <Accordion title={t("Patient Details")} defaultValue={true}>
                    <div className="row px-2 py-1">
                      <div className="col-sm-4 mb-1">
                        <strong>{t("Visit No.")}</strong> :{" "}
                        {tableData[0]?.LedgerTransactionNo}
                      </div>
                      <div className="col-sm-4 mb-1">
                        <strong>{t("Lab ID")}</strong> :{" "}
                        {tableData[0]?.BarcodeNo}
                      </div>
                      <div className="col-sm-4 mb-1">
                        <strong>{t("MR No.")}</strong> :{" "}
                        {tableData[0]?.PatientCode}
                      </div>
                      <div className="col-sm-4 mb-1">
                        <strong>{t("Patient Name")}</strong> :{" "}
                        {tableData[0]?.PName}
                      </div>
                      <div className="col-sm-4 mb-1">
                        <strong>{t("Work Order Date")}</strong> :{" "}
                        {tableData[0]?.RegDate}
                      </div>
                      <div className="col-sm-4 mb-1"></div>
                      <div className="col-sm-4 mb-1">
                        <strong>{t("Bill Amount")}</strong> :{" "}
                        {billAmount.toFixed(2)}
                      </div>
                      <div className="col-sm-4 mb-1">
                        <strong>{t("Total Discount")}</strong> :{" "}
                        {totalDiscount.toFixed(2)}
                      </div>
                      <div className="col-sm-4 mb-1">
                        <CustomButton
                          text={"Remove Discount"}
                          onClick={handleRemoveDiscount}
                          disabled={totalDiscount === 0}
                        />
                      </div>
                      <div className="col-sm-4 mb-1">
                        <strong>{t("Net Bill Amount")}</strong> :{" "}
                        {netBillAmount.toFixed(2)}
                      </div>
                      <div className="col-sm-4 mb-1">
                        <strong>{t("Due Amount")}</strong> :{" "}
                        {tableData[0]?.DueAmount}
                      </div>
                    </div>
                  </Accordion>

                  <Accordion title={t("Discount")} defaultValue={true}>
                    <div className="row px-2 py-1">
                      <div className="col-sm-3">
                        <Input
                          lable={t("Discount Amt.")}
                          name="DiscountAmt"
                          id="DiscountByRS"
                          value={
                            document.getElementById("DiscountByRS")?.value
                          }
                          disabled={!anyActive || totalDiscount !== 0}
                          onChange={handleChangeMain}
                          type="number"
                        />
                      </div>
                      <div className="col-sm-3">
                        <Input
                          lable={t("Discount Per.")}
                          type="number"
                          name="DiscountAmt"
                          id="DiscountByPercentage"
                          disabled={!anyActive || totalDiscount !== 0}
                          value={
                            document.getElementById("DiscountByPercentage")
                              ?.value
                          }
                          onChange={handleChangeMain}
                        />
                      </div>
                      <div className="col-sm-3">
                        <SelectBox
                          options={BindDiscApproval}
                          onChange={handleSelectChange}
                          name="DiscountApprovedBy"
                          id="DiscountApprovedBy"
                          lable={t("Discount By")}
                          selectedValue={dropdownData?.DiscountApprovedBy}
                        />
                      </div>
                      <div className="col-sm-3">
                        <SelectBox
                          options={BindDiscReason}
                          lable={t("Discount Reason")}
                          id="DiscountReason"
                          onChange={handleSelectChange}
                          selectedValue={dropdownData?.DiscountReason}
                          name="DiscountReason"
                        />
                      </div>
                    </div>
                    <DiscountBearBy
                      totalDiscount={getAppliedDiscount()}
                      value={discountBearBy}
                      onChange={setDiscountBearBy}
                      locked={false}
                    />
                  </Accordion>

                  <Accordion
                    title={t("Prescribed Investigation")}
                    defaultValue={true}
                  >
                    <Tables>
                      <thead className="cf">
                        <tr>
                          <th>{t("#")}</th>
                          <th>{t("Test Name")}</th>
                          <th>{t("Quantity")}</th>
                          <th>{t("Rate")}</th>
                          <th>{t("Discount")}</th>
                          <th>{t("Amount")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tableData.map((data, index) => (
                          <tr key={index}>
                            <td data-title={t("#")}>{index + 1}</td>
                            <td data-title={t("Test Name")}>
                              {data?.ItemName}
                              {data?.InvoiceNo != "" && (
                                <div className="text-danger small">
                                  {t(
                                    "Discount Not Possible : Invoice Already Generated",
                                  )}
                                </div>
                              )}
                            </td>
                            <td data-title={t("Quantity")}>
                              {data?.Quantity}
                            </td>
                            <td data-title={t("Rate")}>{data?.Rate}</td>
                            <td data-title={t("Discount")}>
                              <Input
                                type="number"
                                name="DiscountAmt"
                                disabled
                                id={`DiscountAmt-${index}`}
                                value={
                                  document.getElementById(
                                    `DiscountAmt-${index}`,
                                  )?.value
                                }
                              ></Input>
                            </td>
                            <td data-title={t("Amount")}>{data?.Amount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Tables>

                    {handleSaveShowButton() && (
                      <div className="row mt-4 px-2">
                        <div className="col-sm-1">
                          {load?.saveLoad ? (
                            <Loading />
                          ) : (
                            <SaveButton
                              text={"Save"}
                              onClick={handleSave}
                              disabled={
                                dropdownData?.DiscountReason <= 0 ||
                                tableData[0]?.paymentmode == "Credit"
                                  ? true
                                  : false
                              }
                            />
                          )}
                        </div>
                      </div>
                    )}
                  </Accordion>
                </>
              );
            })()}
          </>
        ) : (
          ""
        )
      ) : (
        <Loading />
      )}
    </>
  );
};

export default DiscountAfterBill;
