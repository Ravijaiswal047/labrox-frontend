import { axiosInstance } from "../../utils/axiosInstance";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Input from "../../components/formComponent/Input";
import ReactSelect from "../../components/formComponent/ReactSelect";
import Loading from "../../components/loader/Loading";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import { useTranslation } from "react-i18next";

import Accordion from "@app/components/UI/Accordion";
import Tables from "../../components/UI/customTable";
import { useSelector } from "react-redux";
import { SaveButton, SearchButton } from "../../components/UI/CustomButton";
import Modal from "../../components/ModalComponent/Modal";
import SettlementPatient from "../Laboratory/Settlement";
import { SelectBox } from "../../components/formComponent/SelectBox";
import { StatusCheck } from "../../utils/Constants";

const RefundAfterBill = () => {
  const reprintLabNo = useSelector((state) => state.loadingSlice.reprintLabNo);
  const [tableData, setTableData] = useState([]);
  const [BindRefundReason, setBindRefundReason] = useState([]);
  const [dropdownData, setDropDownData] = useState({
    RefundReason: "",
    RefundId: 0,
    OtherRefundReason: "",
  });
  const [LabNo, setLabNo] = useState("");
  const [showSettlement, setShowSettlement] = useState(false);
  const [settlementLabNo, setSettlementLabNo] = useState("");

  const [load, setLoad] = useState({
    saveLoad: false,
  });

  const fetch = (lab_No = "") => {
    setLoad(prev => ({ ...prev, saveLoad: true }));

    axiosInstance
      .post("RefundAfterBill/GetItemsToRefund", {
        LedgerTransactionNo: String(lab_No)?.trim() || LabNo.trim(),
      })
      .then((res) => {
        const { success, message } = res?.data || {};

        if (success && Array.isArray(message) && message.length > 0) {
          setTableData(message);
        } else {
          setTableData([]);
          toast.error(message || "No record found");
        }
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message || "Something went wrong."
        );
      })
      .finally(() => {
        setLoad(prev => ({ ...prev, saveLoad: false }));
      });
  };
  const updatedOptions = [
    { label: "Select", value: "" },
    ...BindRefundReason
  ];
  const getDropDownData = (name) => {
    axiosInstance.post("Global/getGlobalData", { Type: name }).then((res) => {
      let data = res.data.message;
      console.log(data);
      let value = data.map((ele) => {
        return {
          value: ele.FieldID,
          label: ele.FieldDisplay,
        };
      });
      setDropDownData({ RefundId: value[0]?.value, RefundReason: value[0]?.label, OtherRefundReason: "" });
      setBindRefundReason(value);
    });
  };

  const handleCheckbox = (e, index) => {
    const { name, checked } = e.target;
    const data = [...tableData];
    data[index][name] = checked === true ? 1 : 0;
    setTableData(data);
  };

  const handleSelectChange = (name, selectedOption) => {
    const refundReasonLabel = selectedOption?.label ?? "";
    setDropDownData((prev) => ({
      ...prev,
      RefundId: selectedOption?.value ?? "",
      RefundReason: refundReasonLabel,
      OtherRefundReason:
        refundReasonLabel.toLowerCase() === "other"
          ? prev.OtherRefundReason
          : "",
    }));
  };

  const handleDropdownInputChange = (e) => {
    const { name, value } = e.target;
    setDropDownData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  const handleSave = () => {
    setLoad({ ...load, saveLoad: true });
    const data = tableData.filter((ele) => ele?.IsRefund === 1);

    if (
      dropdownData?.RefundReason?.toLowerCase() === "other" &&
      !dropdownData?.OtherRefundReason?.trim()
    ) {
      toast.error("Please enter other refund reason");
      setLoad((prev) => ({ ...prev, saveLoad: false }));
      return;
    }

    const val = data?.map((ele) => {
      return {
        LedgerTransactionID: ele?.LedgerTransactionID,
        ItemId: ele?.ItemId,
        BillNo: ele?.BillNo,
        DiscountAmt: ele?.DiscountAmt,
        Amount: ele?.Amount,
        RefundReason: dropdownData?.RefundReason,
        RefundReasonId: Number(dropdownData?.RefundId),
        OtherRefundReason:
          dropdownData?.RefundReason?.toLowerCase() === "other"
            ? dropdownData?.OtherRefundReason
            : "",
      };
    });
    axiosInstance
      .post("RefundAfterBill/SaveRefundAfterBill", {
        PLO: val,
      })
      .then((res) => {
        if(res.data?.success){
          toast.success(res?.data?.message);
          setLoad({ ...load, saveLoad: false });
          setSettlementLabNo(LabNo);
          setShowSettlement(true);
          setLabNo("");
          setTableData([]);
        } else {
          toast.error(res?.data?.message);
          setLoad({ ...load, saveLoad: false });
        }
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Something went wrong.",
        );
        setLoad({ ...load, saveLoad: false });
      });
  };

  useEffect(() => {
    getDropDownData("RefundReason");
  }, []);

  const handleShowSubmit = () => {
    let show = false;
    for (let i = 0; i < tableData.length; i++) {
      if (tableData[i]["IsRefund"] === 1) {
        show = true;
        break;
      }
    }
    return show;
  };
  const handleKeyDown = (e) => {
    if (e?.key === "Enter") {
      fetch(e);
    }
  };
  const { t } = useTranslation();

  useEffect(() => {
    if (reprintLabNo) {
      setLabNo(reprintLabNo);
      fetch(reprintLabNo);
    }
  }, []);

  console.log("dropdownData", dropdownData);

  return (
    <>
      <Accordion
        name={t("Refund After Bill")}
        isBreadcrumb={true}
        defaultValue={true}
        linkTo={"#"}
        linkTitle={
          <div className="link-title-container mt-2" id="pr_id_11" style={{ marginRight: "10px" }}>
            {tableData.length > 0 && (
              <>
              {tableData[0]?.LedgerTransactionNo && (
                <div> <span style={{fontWeight: "700"}}>Visit No:</span>{` ${tableData[0]?.LedgerTransactionNo}`} |</div>
              )}
              {tableData[0]?.PName && (
                <div> <span style={{fontWeight: "700"}}>Patient Name:</span>{` ${tableData[0]?.PName}`} |</div>
              )}
              {tableData[0]?.Age && tableData[0]?.Gender && (
                <div> <span style={{fontWeight: "700"}}>Age/Gender:</span>{` ${tableData[0]?.Age} / ${tableData[0]?.Gender}`} |</div>
              )}
              {tableData[0]?.PatientCode && (
                <div> <span style={{fontWeight: "700"}}>UHID:</span>{` ${tableData[0]?.PatientCode}`}</div>
              )}
            </>
            )}
          </div>
        }
      >
        <div className="row px-2 mt-2 mb-1">
          <div className="col-sm-2">
            <Input
              type="text"
              id="LabNo"
              lable="Lab Number"
              placeholder=" "
              onKeyDown={handleKeyDown}
              value={LabNo}
              onChange={(e) => {
                setLabNo(e?.target?.value);
              }}
              disabled={true}
            />
          </div>

          <div className="col-sm-1">
            <SearchButton
              text={"Search"}
              onClick={() => fetch("")}
              disabled={LabNo.length == 0}
            />
          </div>
          <div className="col-12 col-sm-9 mt-2 mt-sm-0">
            <p className="text-danger d-flex align-items-center"
               style={{
              gap: "5px",
              fontWeight: 900
            }}>
              <i class="bi bi-info-circle-fill mb-0"></i>
                Only Non-Reported tests are listed. Sample Not Collected and Rejected tests can be refunded.
            </p>
          </div>
        </div>{" "}
      </Accordion>

      {tableData.length > 0 ? (
        <Accordion title={t("Search Detail")} defaultValue={true}>
          {load?.saveLoad ? (
            <Loading />
          ) : (
            <Tables>
              <thead>
                <tr>
                  <th style={{ width: "50px" }}>{t("S.No.")}</th>
                  <th style={{ width: "100px" }}>{t("Department")}</th>
                  <th style={{ width: "100px" }}>{t("Barcode No")}</th>
                  <th style={{ width: "350px", whiteSpace: "normal" }}>{t("Test Name")}</th>
                  <th style={{ width: "100px" }}>{t("Rate")}</th>
                  <th style={{ width: "80px" }}>{t("Quantity")}</th>
                  <th style={{ width: "100px" }}>{t("Amount")}</th>
                  <th style={{ width: "80px" }}>{t("Status")}</th>
                  <th style={{ width: "120px" }}>{t("Select")}</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((data, index) => (
                  <tr key={index}>
                    <td data-title={t("S.No.")} style={{ width: "50px", minWidth: "50px" }}>{index + 1}&nbsp;</td>
                    <td data-title={t("Department")} style={{ width: "100px", minWidth: "150px" }}>
                      {data?.DepartmentName || "-"}&nbsp;
                    </td>
                    <td data-title={t("Barcode No")} style={{ width: "100px", minWidth: "150px" }}>
                      {data?.BarcodeNo}&nbsp;
                    </td>
                    <td data-title={t("Test Name")} style={{ width: "350px", minWidth: "350px", whiteSpace: "normal" }}>{data?.ItemName}&nbsp;</td>
                    <td data-title={t("Rate")} style={{ width: "100px", minWidth: "100px" }}>
                      {Number(data?.Rate).toFixed(2)}&nbsp;
                    </td>
                    <td data-title={t("Quantity")} style={{ width: "80px", minWidth: "80px" }}>
                      {data?.Quantity}&nbsp;
                    </td>
                    <td data-title={t("Amount")} style={{ width: "100px", minWidth: "100px" }}>
                      {Number(data?.Amount).toFixed(2)}&nbsp;
                    </td>
                    <td className={`Status-${data.Status}`} style={{ width: "80px" }}>
                      {StatusCheck[data?.Status] || ""}
                    </td>
                    <td data-title={t("Select")} style={{ width: "120px", minWidth: "120px" }}>
                       {/* {data?.InvoiceNo == "" ? ( */}
                        <input
                          type="checkbox"
                          checked={data?.IsRefund}
                          disabled={
                            Number(data?.Rate) === 0 ||
                            !(
                              ["N", "R"].includes(
                                String(data?.IsSampleCollected || "").toUpperCase()
                              ) ||
                              Number(data?.Status) === 1 ||
                              Number(data?.Status) === 4
                            )
                          }
                          title={
                            Number(data?.Rate) === 0
                              ? t("Rate is 0")
                              : ["N", "R"].includes(
                                    String(data?.IsSampleCollected || "").toUpperCase()
                                  ) ||
                                  Number(data?.Status) === 1 ||
                                  Number(data?.Status) === 4
                                ? t("Select to refund")
                                : t("Refund allowed only when sample is Not Collected or Rejected")
                          }
                          name="IsRefund"
                          onChange={(e) => handleCheckbox(e, index)}
                        />
                      {/* ) : ( */}
                         {/* <span className="text-danger"> */}
                           {/* Refund Not Possible : Invoice Already Generated */}
                         {/* </span> */}
                       {/* )} */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Tables>
          )}

          {handleShowSubmit() && (
            <>
              <div className="row mt-4 px-2">
                <div className="col-sm-2">
                  <ReactSelect
                    name="RefundReason"
                    dynamicOptions={updatedOptions}
                    onChange={handleSelectChange}
                    id="RefundReason"
                    placeholderName="RefundReason"
                    value={dropdownData?.RefundId}
                    removeIsClearable={true}
                  /> 
                  {/* <SelectBox
                    name="RefundReason"
                    placeholder={t("RefundReason")}
                    lable={"RefundReason"}
                    value={dropdownData?.RefundId}
                    onChange={handleSelectChange}
                    options={updatedOptions}
                  /> */}
                </div>

                {dropdownData?.RefundReason?.toLowerCase() === "other" && (
                  <div className="col-sm-2">
                    <Input
                      type="text"
                      id="OtherRefundReason"
                      name="OtherRefundReason"
                      lable="OtherRefundReason"
                      placeholder=" "
                      value={dropdownData?.OtherRefundReason}
                      onChange={handleDropdownInputChange}
                    />
                  </div>
                )}

                <div className="col-sm-1">
                  {load?.saveLoad ? (
                    <Loading />
                  ) : (
                    <SaveButton
                      text={"Save"}
                      onClick={handleSave}
                    />
                  )}
                </div>
              </div>
            </>
          )}
        </Accordion>
      ) : (
        <></>
      )}

      {showSettlement && (
        <Modal
          visible={showSettlement}
          setVisible={setShowSettlement}
          Header={t("Settlement")}
          modalWidth="90vw"
        >
          <SettlementPatient
            visitNo={settlementLabNo}
            onSuccess={() => setShowSettlement(false)}
          />
        </Modal>
      )}
    </>
  );
};

export default RefundAfterBill;
