import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import LabeledInput from "../../../../components/formComponent/LabeledInput";
import Input from "../../../../components/formComponent/Input";
import Tables from "../../../../components/UI/customTable";
import DatePicker from "../../../../components/formComponent/DatePickerHis";
import { FinanceUpdateInstallmentSupplierInstallment } from "../../../../NetworkServices/finance.js";
import { notify } from "../../../../utils/ustil2";

const SupplierInstallmentModal = ({ item, data }) => {
    console.log("items", item)
    const [t] = useTranslation();
    const [values, setValues] = useState({});
    const [tableData, setTableData] = useState(data);

    const THEAD = [
        { name: t("S.No."), width: "1%" },
        { name: t("Installment Date"), width: "2%" },
        { name: t("Installment Amount"), width: "1%" },
    ]

    const handleChange = (e) => {
        setValues({ ...values, [e.target.name]: e.target.value })
    }


    return (
        <div>
            <div className="row">
                <LabeledInput label={t("Voucher No.")} value={item?.voucherNo} className={"col-sm-2 col-md-2 col-xl-3 col-12"} />
                <LabeledInput label={t("Invoice No.")} value={item?.invoiceNo} className={"col-sm-2 col-md-2 col-xl-3 col-12"} />
                <LabeledInput label={t("Invoice Date")} value={item?.invoiceDate} className={"col-sm-2 col-md-2 col-xl-3 col-12"} />
                <LabeledInput label={t("Pending Amount")} value={item?.pendingAmount} className={"col-sm-2 col-md-2 col-xl-3 col-12"} />
                <LabeledInput label={t("Note")} value={item?.note} className={"col-sm-2 col-md-2 col-xl-3 col-12"} />
                <Input
                    type="text"
                    className="form-control"
                    id="noOfInstallments"
                    name="noOfInstallments"
                    value={values?.noOfInstallments}
                    onChange={handleChange}
                    placeholder=" "
                    respclass="col-xl-3 col-md-4 col-sm-6 col-12"
                />
                <button className="btn btn-success ml-2">
                    {t("Add")}
                </button>
            </div>
            <div>
                <Tables thead={THEAD} tbody={Array.isArray(tableData) ? tableData?.map((val, index) => ({
                    "s.NO.": index + 1,
                    "Installment Date": (
                        <DatePicker
                            className="table-calender-height w-100"
                            removeFormGroupClass={true}
                            showIcon={false}
                            name="installmentDate"
                            value={values?.installmentDate}
                            onChange={handleChange}
                            placeholder="Installment Date"
                        />
                    ),
                    "Installment Amount": (
                        <Input
                            type="text"
                            className="form-control table-input mt-1"
                            id="installmentAmount"
                            name="installmentAmount"
                            value={values?.installmentAmount}
                            onChange={handleChange}
                            placeholder=" "
                        />
                    )
                })) : []} />
                <div className="row pt-2 d-flex justify-content-end">
                    <LabeledInput label={t("Total")} value={item?.voucherNo} className={"col-sm-2 col-md-2 col-xl-3 col-12"} />
                    <LabeledInput label={t("Pending Amount")} value={item?.voucherNo} className={"col-sm-2 col-md-2 col-xl-3 col-12"} />
                </div>
            </div>
        </div>
    )
}
export default SupplierInstallmentModal;