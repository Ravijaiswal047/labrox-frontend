import { useTranslation } from "react-i18next";
import Tables from "../../../components/UI/customTable";
import { useEffect, useState } from "react";
import Input from "../../../components/formComponent/Input";
import {notify } from "../../../utils/utils";
import CustomSelect from "../../../components/formComponent/CustomSelect";
import DatePicker from "../../../components/formComponent/DatePickerHis";
import WrapTranslate from "../../../components/WrapTranslate";
import moment from "moment";
import { ROUNDOFF_VALUE } from "../../../utils/constant";
import CostCentreModal from "./CostCentreModal";
import AdvanaceMapModal from "./AdvanaceMapModal";
import Heading from "../../../components/UI/Heading";
import { filterByTypes } from "../../utils/Utils";
import HisTable from "../../../components/UI/customTable/HisTable";
// import Modal from "../../../components/ModalComponent/Modal";

export default function VoucherBookingTable({
  tbody,
  values,
  list,
  setOldBodyData,
}) {
  console.log("first", tbody);
  const [t] = useTranslation();
  const { VITE_DATE_FORMAT } = import.meta.env;
  const [modalData, setModalData] = useState({ visible: false });

  const [bodyData, setBodyData] = useState([]);

  const handleAllChange = (e) => {
    let data = tbody?.map((item, index) => ({
      ...item,
      isChecked: e.target.checked,
    }));
    setBodyData(data);
  };
  const handleCheckboxChange = (e, index) => {
    let updatedData = [...tbody];
    updatedData[index]["isChecked"] = e?.target?.checked;
    if(!e?.target?.checked){
      updatedData[index]["Amount"]="0"
    }
    // updatedData[index]["isChecked"] = e?.target?.checked;
    setOldBodyData(updatedData);
    setBodyData(updatedData);
  };
  const thead = [
    {
      name: "S.No.",
      width: "1%",
    },
    { name: "Chart Of Group", width: "9%" },
    { name: "A/C Name", width: "15%" },
    { name: "Branch Centre", width: "15%" },
    "Department",
    { name: "Currency", width: "1%" },
    { name: "Amount", width: "5%" },
    { name: "Base Amt.", width: "5%" },
    "Bal. Type",
    { name: "Invoice No.", width: "8%" },
    { name: "Invoice Date", width: "7%" },
    { name: "Remarks", width: "10%" },
    { name: "CC", width: "1%" },
    { name: "Action", width: "1%" },
  ];

  const voucherType = values?.VoucherType?.value;

  const modifications = {
    PB: [
      { index: 8, items: ["Tax Amt"] },
      // { index: 14, items: ["Map Adv."] },
    ],
    PAYMENT_TYPES: [
      {
        index: 9,
        deleteCount: 2,
        items: [
          "Payment Mode",
          { name: "Ref No.", width: "8%" },
          { name: "Ref Date", width: "7%" },
        ],
      },
      { index: 13, deleteCount: 1 },
    ],
  };

  // Apply modifications based on Voucher Type
  if (modifications[voucherType]) {
    modifications[voucherType].forEach(
      ({ index, deleteCount = 0, items = [] }) => {
        thead.splice(index, deleteCount, ...items);
      },
    );
  }

  if (["BP", "CP", "BR", "CR", "CV", "BT"].includes(voucherType)) {
    modifications.PAYMENT_TYPES.forEach(
      ({ index, deleteCount = 0, items = [] }) => {
        thead.splice(index, deleteCount, ...items);
      },
    );
  }

  const handleAdjustMentDetail = (data, detail) => {
    let calAmount = { Cr: 0, Dr: 0 };
    if (detail?.isAccountType) {
      data?.map((val, ind) => {
        if (!val?.isAccountType) {
          calAmount[val?.balanceType?.value] += val?.Amount
            ? Number(val?.Amount)
            : 0;
        }
      });
    }
    if (detail?.balanceType?.value === "Cr") {
      if (calAmount?.Dr - calAmount?.Cr >= 0) {
        data[0]["Amount"] = calAmount?.Dr - calAmount?.Cr;
      } else {
        data[0]["Amount"] = 0;
      }
    } else if (detail?.balanceType?.value === "Dr") {
      if (calAmount?.Cr - calAmount?.Dr >= 0) {
        data[0]["Amount"] = calAmount?.Cr - calAmount?.Dr;
      } else {
        data[0]["Amount"] = 0;
      }
    }
    setOldBodyData(data);
  };

  const handleCustomInput = (
    index,
    name,
    value,
    type,
    max = 9999999999999,
    tblData = tbody,
  ) => {
    if (type === "number") {
      if (!isNaN(value) && Number(value) <= max) {
        const data = JSON.parse(JSON.stringify(tblData));
        if (index === 0 && name !== "Amount") {
          data?.map((val, ind) => {
            data[ind][name] = value;
            let detail = data[0];
            if (detail?.isAccountType) {
              handleAdjustMentDetail(data, detail);
            } else {
              setOldBodyData(data);
            }
          });
        } else {
          data[index][name] = value;
          let detail = data[0];
          if (detail?.isAccountType) {
            handleAdjustMentDetail(data, detail);
          } else {
            setOldBodyData(data);
          }
        }
      }
    } else if (value?.length <= max || typeof value === "object") {
      const data = JSON.parse(JSON.stringify(tblData));
      //  if (data[index]?.IsOnlySingleAccount === 1) {
      if (index === 0) {
        data?.map((val, ind) => {
          data[ind][name] = value;
          let detail = data[0];
          if (detail?.isAccountType) {
            handleAdjustMentDetail(data, detail);
          } else {
            setOldBodyData(data);
          }
        });
      } else {
        let detail = data[0];
        data[index][name] = value;
        debugger;
        if (detail?.isAccountType && name === "balanceType") {
          handleAdjustMentDetail(data, detail);
        } else {
          setOldBodyData(data);
        }
      }
    }
  };

  const handleCloseModal = (ele, data) => {
    // debugger
    if (data?.RemAmt === 0 || Number(data?.Amount) === Number(data?.RemAmt)) {
      setModalData((val) => ({ ...val, visible: false }));
    } else {
      notify(
        "Cost Centre Bifurcation Total should be equal to Cost Centre Amount",
        "error",
      );
    }
  };
  const handleOpenCostCentre = (data, index) => {
    if (!data?.Department?.value) {
      notify("Please Select Department", "error");
      return 0;
    } else if (!data?.Amount) {
      notify("Amount Field Is Required", "error");
      return 0;
    }
    setModalData({
      visible: true,
      width: "60vw",
      label: t("Cost Centre"),
      handleCloseModal: handleCloseModal,
      buttonName: "Save",
      CallAPI: () => {},
      modalData: {},
      footer: <></>,
      Component: (
        <CostCentreModal
          setModalData={setModalData}
          inputs={{ ...data, index: index }}
          setOldBodyData={setOldBodyData}
          tbody={tbody}
          list={list}
        />
      ),
    });
  };
  const handleOpenAdvance = (data, index) => {
    if (!data?.Department?.value) {
      notify("Please Select Department", "error");
      return 0;
    }
    setModalData({
      visible: true,
      width: "60vw",
      label: t("Map Advance"),
      handleCloseModal: handleCloseModal,
      buttonName: "Save",
      CallAPI: () => {},
      modalData: {},
      footer: <></>,
      Component: (
        <AdvanaceMapModal
          setModalData={setModalData}
          inputs={{ ...data, index: index }}
          setOldBodyData={setOldBodyData}
          tbody={tbody}
          list={list}
        />
      ),
    });
  };

  const handleDelete = (ele, index) => {
    let newData = JSON.parse(JSON.stringify(tbody));
    newData.splice(index, 1);
    setOldBodyData(newData);
    // Update The Calculation after Delete element from row
    const indexof = newData?.findIndex((val) => !val?.isAccountType);
    const updatedData = newData[indexof];
    handleCustomInput(
      indexof,
      "Amount",
      updatedData?.Amount,
      "number",
      1000000000,
      newData,
    );
  };
  console.log("asd", values);
  useEffect(() => {
    let data = [];
    let sumAmount = 0;
    let PendingInvoiceSum = tbody
      ?.filter((val) => val?.isPendingInvoice)
      ?.reduce((acc, cur) => acc + cur?.Amount, 0);
    tbody?.map((ele, index) => {
      if (values?.isEdit || values?.isReplicate) {
        ele.Amount = ele?.Amount;
      } else if (
        values?.VoucherType?.value === "BP" ||
        values?.VoucherType?.value === "CP"
      ) {
        // debugger
        if (!values?.isPendingInvoice) {
          const Amount = tbody[0]?.Amount;
          if (index !== 0) {
            //  ele.Amount = Amount * ele?.Taxper * 0.01;
            //   sumAmount = sumAmount + Number(ele?.Amount||0);
            if (ele?.isChecked) {
              ele.Amount = Amount * ele?.Taxper * 0.01;
              sumAmount = sumAmount + Number(ele?.Amount || 0);
            }
          }
          if (ele?.isAccountType) {
            ele.Amount = Amount - sumAmount;
          }
        } else {
          if (values?.isPendingInvoice && !ele?.isPendingInvoice) {
            ele.Amount = PendingInvoiceSum * ele?.Taxper * 0.01;
            sumAmount = sumAmount + ele?.Amount;
          }
          if (ele?.isAccountType) {
            ele.Amount = PendingInvoiceSum - sumAmount;
          }
        }
      } else if (
        values?.VoucherType?.value === "SV" ||
        values?.VoucherType?.value === "PB" ||
        values?.VoucherType?.value === "CR" ||
        values?.VoucherType?.value === "BR"
      ) {
        // ele.Amount = ele?.Amount

        if (ele?.isAccountType) {
          ele.Amount = sumAmount;
        } else {
          sumAmount = sumAmount + Number(ele?.Amount || 0);
        }
      }
      data.push(ele);
    });
    setBodyData(data);
  }, [tbody, values?.ConversionFactor]);

  return (
    <>
      {bodyData?.length > 0 && (
        <>
          <Heading
            title={t("Voucher Booking")}
            secondTitle={
              <span className="bg-danger px-2 rounded">
                {" "}
                {values?.isEdit ? values?.VoucherNumber : ""}{" "}
              </span>
            }
          />
          <HisTable
            thead={thead}
            removeShorting={true}
            tbody={bodyData?.map((ele, index) => {
              let obj = {};
              obj.colorcode = ele?.IsChecked === 1 ? "lightgreen" : "";
              obj.SrNo = (
                <>
                  {index + 1}{" "}
                  {ele?.IsChecked === 1 && (
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        handleCheckboxChange(e, index);
                      }}
                      checked={ele?.isChecked}
                      className="table-checkbox"
                    />
                  )}{" "}
                </>
              );
              obj.ChartOfGroup = (
                <div style={{ whiteSpace: "normal" }}>{ele?.GroupName}</div>
              );
              obj.AccountName = (
                <div style={{ whiteSpace: "normal" }}>{ele?.AccountName}</div>
              );
              obj.branchCentre = (
                <div style={{ whiteSpace: "normal", width: "100%" }}>
                  <CustomSelect
                    placeHolder={t("BRANCH CENTRE")}
                    name="branchCentre"
                    // isDisable={ele?.IsOnlySingleAccount !== 1}
                    isDisable={
                      !ele?.isAccountName &&
                      !values?.isEdit &&
                      !values?.isReplicate
                    }
                    onChange={(name, e) => {
                      handleCustomInput(index, "branchCentre", e);
                    }}
                    isRemoveSearchable={true}
                    value={ele?.branchCentre?.value}
                    option={filterByTypes(
                      list,
                      [14],
                      ["TypeID"],
                      "TextField",
                      "ValueField",
                    )}
                  />
                </div>
              );
              obj.Department = (
                <div style={{ whiteSpace: "normal", width: "100%" }}>
                  {" "}
                  <CustomSelect
                    placeHolder={t("Department")}
                    requiredClassName={"required-fields"}
                    // isDisable={ele?.IsOnlySingleAccount !== 1}
                    isDisable={
                      !ele?.isAccountName &&
                      !values?.isEdit &&
                      !values?.isReplicate
                    }
                    name="Department"
                    onChange={(name, e) => {
                      handleCustomInput(index, "Department", e);
                    }}
                    isRemoveSearchable={true}
                    value={ele?.Department?.value}
                    option={filterByTypes(
                      list,
                      [2],
                      ["TypeID"],
                      "TextField",
                      "ValueField",
                    )}
                  />
                </div>
              );
              obj.Currency = ele?.CurrencyCode;
              obj.Amount = !ele?.isAccountType ? (
                <Input
                  type="text"
                  className="table-input required-fields"
                  respclass={"w-100"}
                  removeFormGroupClass={true}
                  display={"right"}
                  disabled={((!ele?.isAccountName || ele?.isPendingInvoice) && !values?.isEdit && !values?.isReplicate && ele?.isChecked)   ? true
                      : false
                  }
                  name={"Amount"}
                  value={ele?.Amount ? ele?.Amount : ""}
                  onChange={(e) => {
                    handleCustomInput(
                      index,
                      "Amount",
                      e.target.value,
                      "number",
                      1000000000,
                    );
                  }}
                />
              ) : (
                <span className="text-right mt-2">
                  {ele?.Amount ? Number(ele?.Amount)?.toFixed(2) : "0.00"}
                </span>
              );
              obj.locals =
                values?.ConversionFactor * ele?.Amount > 0
                  ? (values?.ConversionFactor * ele?.Amount).toFixed(
                      ROUNDOFF_VALUE,
                    )
                  : "0.00";
              if (values?.VoucherType?.value === "PB") {
                obj.TaxAmount = (
                  <Input
                    type="number"
                    className="table-input"
                    respclass={"w-100"}
                    // disabled={ele?.IsOnlySingleAccount !== 1 ? true : false}
                    disabled={
                      !ele?.isAccountName &&
                      !values?.isEdit &&
                      !values?.isReplicate
                    }
                    removeFormGroupClass={true}
                    display={"right"}
                    name={"TaxAmount"}
                    value={ele?.TaxAmount ? ele?.TaxAmount : ""}
                    onChange={(e) => {
                      handleCustomInput(
                        index,
                        "TaxAmount",
                        e.target.value,
                        "number",
                        1000000000,
                      );
                    }}
                  />
                );
              }
              obj.balanceType = !ele?.isAccountType ? (
                <>
                  {console.log("ele", ele)}
                  <CustomSelect
                    placeHolder={t("Bal. Type")}
                    name="balanceType"
                    isDisable={
                      (ele?.IsBalTypeDisabled ||
                        !ele?.isAccountName ||
                        ele?.isPendingInvoice) &&
                      !values?.isEdit &&
                      !values?.isReplicate
                        ? true
                        : false
                    }
                    onChange={(name, e) => {
                      handleCustomInput(index, "balanceType", e);
                    }}
                    isRemoveSearchable={true}
                    value={ele?.balanceType?.value}
                    option={[
                      { label: "Cr", value: "Cr" },
                      { label: "Dr", value: "Dr" },
                    ]}
                  />
                </>
              ) : (
                <span>{ele?.balanceType?.value}</span>
              );

              if (
                ["BP", "CP", "BR", "CR", "CV", "BT"].includes(
                  values?.VoucherType?.value,
                )
              ) {
                obj.PaymentMode = (
                  <CustomSelect
                    placeHolder={t("Payment Mode")}
                    requiredClassName={"required-fields"}
                    name="PaymentMode"
                    onChange={(name, e) => {
                      handleCustomInput(index, "PaymentMode", e);
                    }}
                    isDisable={
                      !ele?.isAccountName &&
                      !values?.isEdit &&
                      !values?.isReplicate
                    }
                    isRemoveSearchable={true}
                    value={ele?.PaymentMode?.value}
                    option={filterByTypes(
                      list,
                      [10],
                      ["TypeID"],
                      "TextField",
                      "ValueField",
                    )}
                  />
                );
                obj.Refnumber = (
                  <Input
                    type="text"
                    className="table-input required-fields"
                    removeFormGroupClass={true}
                    // display={"right"}
                    disabled={
                      !ele?.isAccountName &&
                      !values?.isEdit &&
                      !values?.isReplicate
                        ? true
                        : false
                    }
                    respclass="w-100"
                    name={"Refnumber"}
                    value={ele?.Refnumber ? ele?.Refnumber : ""}
                    onChange={(e) => {
                      handleCustomInput(
                        index,
                        "Refnumber",
                        e.target.value,
                        "text",
                        100,
                      );
                    }}
                  />
                );
                obj.RefDate = (
                  <DatePicker
                    className="custom-calendar-table"
                    id="RefDate"
                    respclass="w-100"
                    showIcon={false}
                    name="RefDate"
                    inputClassName={"required-fields"}
                    disable={
                      !ele?.isAccountName &&
                      !values?.isEdit &&
                      !values?.isReplicate
                        ? true
                        : false
                    }
                    value={
                      ele?.RefDate ? moment(ele?.RefDate).toDate() : new Date()
                    }
                    maxDate={new Date()}
                    handleChange={(e) =>
                      handleCustomInput(index, "RefDate", e.target.value)
                    }
                    placeholder={VITE_DATE_FORMAT}
                  />
                );
              } else {
                obj.InvoiceNumber = (
                  <Input
                    type="text"
                    className="table-input required-fields"
                    removeFormGroupClass={true}
                    disabled={
                      !ele?.isAccountName &&
                      !values?.isEdit &&
                      !values?.isReplicate
                        ? true
                        : false
                    }
                    // display={"right"}
                    respclass="w-100"
                    name={"InvoiceNumber"}
                    value={ele?.InvoiceNumber ? ele?.InvoiceNumber : ""}
                    onChange={(e) => {
                      handleCustomInput(
                        index,
                        "InvoiceNumber",
                        e.target.value,
                        "text",
                        100,
                      );
                    }}
                  />
                );
                obj.InvoiceDate = (
                  <DatePicker
                    className="custom-calendar-table"
                    inputClassName={"required-fields"}
                    id="InvoiceDate"
                    respclass="w-100"
                    disable={
                      !ele?.isAccountName &&
                      !values?.isEdit &&
                      !values?.isReplicate
                        ? true
                        : false
                    }
                    name="InvoiceDate"
                    showIcon={false}
                    value={
                      ele?.InvoiceDate
                        ? moment(ele?.InvoiceDate).toDate()
                        : new Date()
                    }
                    maxDate={new Date()}
                    handleChange={(e) =>
                      handleCustomInput(index, "InvoiceDate", e.target.value)
                    }
                    placeholder={VITE_DATE_FORMAT}
                  />
                );
              }

              obj.Remark = (
                <Input
                  type="text"
                  className="table-input required-fields"
                  removeFormGroupClass={true}
                  respclass="w-100"
                  disabled={
                    !ele?.isAccountName &&
                    !values?.isEdit &&
                    !values?.isReplicate
                      ? true
                      : false
                  }
                  name={"Remark"}
                  value={ele?.Remark ? ele?.Remark : ""}
                  onChange={(e) => {
                    handleCustomInput(index, "Remark", e.target.value);
                  }}
                />
              );
              if (
                !["BP", "CP", "BR", "CR", "CV", "BT"].includes(
                  values?.VoucherType?.value,
                )
              ) {
                obj.CostCentre =
                  !ele?.isAccountType &&
                  ele?.GroupCodeDisplay?.length > 0 &&
                  (ele?.GroupCodeDisplay[0] === "4" ||
                    ele?.GroupCodeDisplay[0] === "1") ? (
                    <button
                      className="btn btn-sm btn-primary px-2 table-btn w-100"
                      onClick={() => {
                        handleOpenCostCentre(ele, index);
                      }}
                    >
                      {t("cc")}
                    </button>
                  ) : (
                    ""
                  );
              }
              obj.Action = !ele?.isAccountType && (
                <i
                  className="fa fa-trash text-danger"
                  onClick={() => {
                    handleDelete(ele, index);
                  }}
                ></i>
              );
              return obj;
            })}
          />
        </>
      )}
      {modalData?.visible && (
        <Modal
          visible={modalData?.visible}
          setVisible={(ele, data) => {
            modalData?.handleCloseModal(ele, data);
          }}
          modalData={modalData?.modalData}
          modalWidth={modalData?.width}
          Header={modalData?.label}
          buttonType="button"
          buttonName={modalData?.buttonName}
          footer={modalData?.footer}
          handleAPI={modalData?.CallAPI}
        >
          {modalData?.Component}
        </Modal>
      )}
    </>
  );
}
