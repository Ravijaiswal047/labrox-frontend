import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Tables from "../../../../components/UI/customTable";
import Accordion from "../../../../components/UI/Accordion";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import MultiSelctItems from "../../../../components/formComponent/MultiSelctItems";
import Input from "../../../../components/formComponent/Input";
import LabeledInput from "../../../../components/formComponent/LabeledInput";

const POEditAdmin = () => {
  const { t } = useTranslation();
  const initialState = {
    PurchaseOrderNo: "",
  };
  const [payload, setPayload] = useState(initialState);
  const [tableData, setTableData] = useState([]);
  const handleSelectChange = (name, value) => {
    setPayload((prev) => ({ ...prev, [name]: value?.value }));
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPayload((prev) => ({ ...prev, [name]: value }));
  };
  return (
    <>
      <Accordion
        name={t("Purchase Order Edit")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row px-2 pt-2">
          <Input
            type="text"
            placeholder=" "
            lable="Purchase Order No"
            id="PurchaseOrderNo"
            name="PurchaseOrderNo"
            value={payload?.PurchaseOrderNo}
            onChange={handleChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <div className="col-sm-1">
            <button className="btn btn-sm btn-success">Search</button>
          </div>
        </div>
      </Accordion>
      <Accordion name={t("PO Detail")} defaultValue={true} isBreadcrumb={true}>
        <div className="row p-2">
          <div className="col-sm-2">
            <LabeledInput label="PO No" value={""} />
          </div>
          <ReactSelect
            name="Supplier"
            id="Supplier"
            removeIsClearable={true}
            // dynamicOptions={}
            placeholderName="Supplier Name"
            value={payload?.Supplier}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <ReactSelect
            name="State "
            id="State "
            removeIsClearable={true}
            // dynamicOptions={}
            placeholderName="State"
            value={payload?.State}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <div className="col-sm-2">
            <LabeledInput label="Location" value={""} />
          </div>
          <div className="col-sm-2">
            <LabeledInput label="Gross Total " value={""} />
          </div>
          <div className="col-sm-2">
            <LabeledInput label="Discount Amt" value={""} />
          </div>
          <div className="col-sm-2">
            <LabeledInput label="Tax Amt" value={""} />
          </div>
          <div className="col-sm-2">
            <LabeledInput label="Net Total" value={""} />
          </div>

          <ReactSelect
            name="DeliveryTerm "
            id="DeliveryTerm "
            removeIsClearable={true}
            // dynamicOptions={}
            placeholderName="Delivery Term"
            value={payload?.DeliveryTerm}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <Input
            type="text"
            placeholder=" "
            lable="Enter Delivery Term"
            id="EnterDeliveryTerm"
            name="EnterDeliveryTerm"
            value={payload?.EnterDeliveryTerm}
            onChange={handleChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <Input
            type="text"
            placeholder=" "
            lable="Terms & Conditions"
            id="TermsConditions"
            name="TermsConditions"
            value={payload?.TermsConditions}
            onChange={handleChange}
            respclass={"col-xl-4 col-sm-4 col-md-6 co-12"}
          />
        </div>
      </Accordion>
      <Accordion
        name={t("Search Details")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row">
          <div className="col-sm-12">
            <Tables>
              <thead>
                <tr>
                  <th>{t("S.No")}</th>
                  <th>{t("Item Name")}</th>
                  <th>{t("Approved Qty")}</th>
                  <th>{t("Rate")}</th>
                  <th>{t("Disc Per")}</th>
                  <th>{t("Disc Amt")}</th>
                  <th>{t("IGST Per")}</th>
                  <th>{t("CGST Per")}</th>
                  <th>{t("SGST Per")}</th>
                  <th>{t("Tax Amt")}</th>
                  <th>{t("Unit Price")}</th>
                  <th>{t("Net Amt")}</th>
                </tr>
              </thead>
              <tbody>
                {tableData?.map((row, index) => (
                  <tr key={index}>
                    <td data-title="S.No">{index + 1}</td>
                    <td data-title="Item Name">{row?.ItemName}</td>
                    <td data-title="Approved Qty">{row?.ApprovedQty}</td>
                    <td data-title="Rate">{row?.Rate}</td>
                    <td data-title="Disc Per">{row?.DiscPer}</td>
                    <td data-title="Disc Amt">{row?.DiscAmt}</td>
                    <td data-title="IGST Per">{row?.IGSTPer}</td>
                    <td data-title="CGST Per">{row?.CGSTPer}</td>
                    <td data-title="SGST Per">{row?.SGSTPer}</td>
                    <td data-title="Tax Amt">{row?.TaxAmt}</td>
                    <td data-title="Unit Price">{row?.UnitPrice}</td>
                    <td data-title="Net Amt">{row?.NetAmt}</td>
                  </tr>
                ))}
              </tbody>
            </Tables>
          </div>
        </div>
        <div className="row d-flex justify-content-end">
          <div className="col-sm-1 d-flex justify-content-end m-2">
            <button className="btn btn-sm btn-success p-2">Update</button>
          </div>
        </div>
      </Accordion>
    </>
  );
};

export default POEditAdmin;
