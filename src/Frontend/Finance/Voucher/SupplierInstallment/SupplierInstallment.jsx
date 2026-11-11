import moment from "moment/moment";
import { useEffect, useState } from "react"
import {
    BindVoucherBillingScreenControls,
    FinanceGetPendingsettleInvoiceSupplierInstallment,
    FinanceUpdateInstallmentSupplierInstallment,
    LoadCentreChartOfAccountAPI,
} from "../../../../NetworkServices/finance.js";
// import { filterByTypes } from "../../../../utils/utils";
import { AutoComplete } from "primereact/autocomplete";
import Input from "../../../../components/formComponent/Input";
import Heading from "../../../../components/UI/Heading";
import Tables from "../../../../components/UI/customTable";
import { notify } from "../../../../utils/ustil2";
// import Modal from "../../../../components/ModalComponent/Modal";
import TextAreaInput from "../../../../components/formComponent/TextAreaInput";
import { useTranslation } from "react-i18next";
import DatePicker from "../../../../components/formComponent/DatePickerHis";
import SupplierInstallmentModal from "./SupplierInstallmentModal.jsx"
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import { filterByTypes } from "../../../utils/Utils.jsx";
import FinanceModal from "../../../../components/ModalComponent/FinanceModal.jsx";
import HisTable from "../../../../components/UI/customTable/HisTable.jsx";

const SupplierInstallment = () => {
    const [t] = useTranslation();
    const { VITE_DATE_FORMAT } = import.meta.env;
    const initialValues = {
        fromDate: new Date(),
        toDate: new Date(),
        VoucherType: "",
        AccountName: "",
        selectedNumber: { label: 'Voucher Number', value: 'V' },
        currency: "",
        voucherGrnData: "",
    }
    const [tableData, setTableData] = useState([]);
    const [values, setValues] = useState({ ...initialValues })
    console.log("values", values)

    const [list, setList] = useState([])
    const [items, setItems] = useState([])
    const [modalData, setModalData] = useState({ visible: false });
    const THEAD = [
        { name: t("S.No.") },
        { name: t("Voucher Number") },
        { name: t("Invoice Number") },
        { name: t("Invoice Date") },
        { name: t("Amount Base") },
        { name: t("Current C.F.") },
        { name: t("Amount") },
        { name: t("Pending(Base)") },
        { name: t("Pending Amount") },
        { name: t("Select") },
    ]

    const handleChange = (e) => {
        setValues({ ...values, [e.target.name]: e.target.value })
    }

    const handleReactChange = (name, e, key) => {
        // if (name === "VoucherType") {
        //     setValues((val) => ({
        //         ...val,
        //         AccountName: "",
        //     }))
        // }
        setValues((val) => ({ ...val, [name]: e }));
    };

    const handleSearch = async () => {
        const payload = {

        }
        const response = await API(payload);
        if (response?.success) {
            setTableData(response?.data);
        } else {
            notify(response?.message, "error");
            setTableData([]);
        }

    }

    const bindListData = async () => {
        let apiResp = await BindVoucherBillingScreenControls(1);
        if (apiResp?.success) {
            const country = filterByTypes(
                apiResp?.data,
                [4],
                ["TypeID"],
                "TextField",
                "ValueField",
                "TypeCode"
            );
            if (country?.length > 0) {
                debugger
                setValues((val) => ({
                    ...val,
                    Currency: {
                        value: country[0]["TypeCode"],
                        isDisabled:
                            country[0]["TypeCode"] === country[0]["ValueField"]
                                ? true
                                : false,
                    },
                }));
            }
            setList(apiResp?.data);
        } else {
            setList([]);
        }
    };


    const search = async (event, name, isTaxDetail = 0, VoucherType) => {
        if (event?.query?.length > 0 || isTaxDetail) {
            const payload = {
                groupCode: "0",
                accountTypeID: 0,
                currencyCode: String(values?.Currency?.value),
                accountName: String(event?.query || ""),
                voucherType: String(values?.VoucherType?.value || VoucherType),
                isTaxDetail: isTaxDetail,
            };
            let results = await LoadCentreChartOfAccountAPI(payload);
            if (results?.success) {
                if (isTaxDetail) {
                    results?.data?.map((val) => {
                        validateInvestigation({ value: val });
                    });
                }
                // console.log("values?.VoucherType?.extraColomn", values?.VoucherType?.extraColomn?.split("#"))
                let filterData = [];
                let type = values?.VoucherType?.extraColomn?.split("#")[0];
                if (name === "AccountType") {
                    filterData = results?.data?.filter(
                        (val) =>
                            val?.balanceType === type &&
                            val?.CurrencyCode === values?.Currency?.value
                    );
                } else {
                    filterData = results?.data?.filter(
                        (val) => val?.balanceType !== type
                    );
                }
                setItems(filterData);
            } else {
                setItems([]);
            }
        } else {
            setItems([]);
        }
    };

    const validateInvestigation = async (e, name) => {
        setValues((val) => ({ ...val, [name]: e?.value }));
    };
    const getPendingInstallment = async () => {

        const fromDate = values?.fromDate ? moment(values?.fromDate).format(VITE_DATE_FORMAT) : moment(new Date()).format(VITE_DATE_FORMAT);
        const toDate = values?.toDate ? moment(values?.toDate).format(VITE_DATE_FORMAT) : moment(new Date()).format(VITE_DATE_FORMAT);
        if (!fromDate && !toDate) {
            notify("Please select from and to date", "error");
            return;
        }
        if (!values?.VoucherType?.value) {
            notify("Please select voucher type", "error");
            return;
        }
        if (!values?.Currency?.value) {
            notify("Please select currency", "error");
            return;
        }
        if (!values?.AccountName?.ValueField) {
            notify("Please select account name", "error");
            return;
        }
        const payload = {
            "vouchertype": values?.VoucherType?.value,
            "fromdate": fromDate,
            "todate": toDate,
            "coa": values?.AccountName?.ValueField,
            "searchType": values?.selectedNumber?.value,
            "searchvalue": values?.voucherGrnData,
            "currencyCode": values?.Currency?.value
        }
        const response = await FinanceGetPendingsettleInvoiceSupplierInstallment(payload);
        if (response?.success) {
            setTableData(response?.data);
        } else {
            notify(response?.message, "error");
            setTableData([]);
        }
    }

    const itemTemplate = (item) => {
        return (
            <div className="p-clearfix">
                <div style={{ float: "left", fontSize: "12px", width: "100%" }}>
                    {item?.TextField}
                </div>
            </div>
        );
    };

    const handleSaveInstallment = async (data) => {

    }
    const apiResp = async (item) => {
        const response = await FinanceUpdateInstallmentSupplierInstallment(item?.EntryDetailID)
        if (response?.success) {
            return response?.data;
        } else {
            notify(response?.message, "error")
            return [];
        }
    }

    const handleModalState = async (item, index) => {

        const data = await apiResp(item);
        debugger

        if (data?.length === 0) {
            return;
        }
        setModalData({
            visible: true,
            width: "50vw",
            label: t("Set Payment Installment"),
            buttonName: t("Save"),
            CallAPI: handleSaveInstallment,
            modalData: item,
            // footer: (<></>),
            Component: (
                <SupplierInstallmentModal item={item} data={data} />
            ),
        });
    }
    useEffect(() => {
        bindListData();
    }, []);
    return (
        <div className="card mt-2">
            <Heading title={t("Supplier Installment")} isBreadcrumb={true} />
            <div className="row p-2">
                <DatePicker
                    className="custom-calendar"
                    required={true}
                    placeholder={VITE_DATE_FORMAT}
                    lable={t("From Date")}
                    respclass={"col-xl-2 col-md-4 col-sm-6 col-12"}
                    name="fromDate"
                    id="fromDate"
                    maxDate={new Date()}
                    value={values?.fromDate ? moment(values.fromDate).toDate() : new Date}
                    showTime
                    hourFormat="12"
                    onChange={(date) => handleChange(date, "fromDate")}
                />
                <DatePicker
                    className="custom-calendar"
                    placeholder={VITE_DATE_FORMAT}
                    lable={t("To Date")}
                    respclass={"col-xl-2 col-md-4 col-sm-6 col-12"}
                    name="toDate"
                    id="toDate"
                    maxDate={new Date()}
                    value={values?.toDate ? moment(values.toDate).toDate() : new Date}
                    showTime
                    hourFormat="12"
                    onChange={(date) => handleChange(date, "toDate")}
                />
                <ReactSelect
                    placeholderName={t("Voucher Type")}
                    id="VoucherType"
                    name="VoucherType"
                    value={values?.VoucherType?.value}
                    onChange ={(name, e) => handleReactChange(name, e)}
                    dynamicOptions={filterByTypes(
                        list,
                        [1],
                        ["TypeID"],
                        "TextField",
                        "ValueField",
                        "BalanceType"
                    )}
                    requiredClassName={"required-fields"}
                    searchable={true}
                    respclass="col-xl-2 col-md-4 col-sm-6 col-12"
                />
                <div className="col-xl-4 col-md-8 col-sm-6 col-12">
                    <AutoComplete
                        value={
                            values?.AccountName?.TextField
                                ? values?.AccountName?.TextField
                                : values?.AccountName
                        }
                        suggestions={items}
                        completeMethod={(e) => {
                            search(e, "AccountName");
                        }}
                        disabled={modalData?.disableAccountName}
                        onChange={(e) => setValues({ ...values, AccountName: e.value })}
                        className="w-100"
                        onSelect={(e) => validateInvestigation(e, "AccountName")}
                        id="AccountName"
                        itemTemplate={itemTemplate}
                    />
                    <label
                        className="label lable truncate ml-3 p-1"
                        style={{ fontSize: "5px !important" }}
                    >
                        {t("Account Name")}
                    </label>
                </div>
                <ReactSelect
                    placeholderName={t("")}
                    id="selectedNumber"
                    name="selectedNumber"
                    value={values?.selectedNumber?.value}
                    onChange ={(name, e) => handleReactChange(name, e)}
                    dynamicOptions={[
                        { label: "Voucher Number", value: "V" },
                        { label: "Invoice Number", value: "I" }
                    ]}
                    searchable={true}
                    respclass="col-xl-2 col-md-4 col-sm-6 col-12"
                />
                <ReactSelect
                    placeholderName={t("Currency")}
                    id="Currency"
                    name="Currency"
                    value={values?.Currency?.value}
                    onChange ={(name, e) => handleReactChange(name, e)}
                    dynamicOptions={filterByTypes(
                        list,
                        [4],
                        ["TypeID"],
                        "TextField",
                        "ValueField",
                        "TypeCode"
                    )}
                    searchable={true}
                    respclass="col-xl-2 col-md-4 col-sm-6 col-12"
                    requiredClassName={"required-fields"}
                />
                <Input
                    type="text"
                    className="form-control "
                    id="voucherGrnData"
                    name="voucherGrnData"
                    value={values?.voucherGrnData}
                    onChange={handleChange}
                    lable={t(values?.selectedNumber?.label)}
                    placeholder=" "
                    respclass="col-xl-2 col-md-4 col-sm-6 col-12"
                />
                <button className="btn btn-success" onClick={() => getPendingInstallment()}>{t("Search")}</button>
            </div>

            {
                tableData?.length > 0 && <div>
                    <HisTable thead={THEAD} tbody={tableData?.map((val, index) => ({
                        "S.No.": index + 1,
                        "VoucherNo.": val?.VoucherNo,
                        "InvoiceNo.": val?.BillNo,
                        "InvoiceDate": val?.BillDate,
                        "AmountBase": String(val?.BaseAmount),
                        "CurrentCF": String(val?.currentcon),
                        "Amount": val?.SpecificAmount ? String(val?.SpecificAmount) : "0",
                        "PendingBase": String(val?.PendingAmtBase),
                        "PendingAmount": val?.PendingSpecificAmount ? String(val?.PendingSpecificAmount) : "0",
                        "Select": (
                            <span className="fa fa-check" onClick={() => handleModalState(val, index)} />
                        )
                    }))} />
                </div>
            }
            {modalData?.visible && (
                <FinanceModal
                    visible={modalData?.visible}
                    setVisible={() => {
                        setModalData({ visible: false });
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
                </FinanceModal>
            )}
        </div>
    )
}

export default SupplierInstallment