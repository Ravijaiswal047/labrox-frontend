import React, { useEffect, useState } from "react";
import Accordion from "@app/components/UI/Accordion";
import { useTranslation } from "react-i18next";
import DatePicker from "../../components/formComponent/DatePicker";
import ReactSelect from "../../components/formComponent/ReactSelect";
import Input from "../../components/formComponent/Input";
import { CustomButton } from "../../components/UI/CustomButton";
import Heading from "../../components/UI/Heading";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import Tables from "../../components/UI/customTable";
import { axiosInstance } from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import moment from "moment/moment";
import Loading from "../../components/loader/Loading";
import "../SalesFunnel/index.css";

const CurrencyFactorMater = () => {
    const { t } = useTranslation();
    const [payload, setPayload] = useState({
        // Currency Factor Details
        fromDate: new Date(),
        baseCurrency: "",
        specifiedCurrency: "",
        // Conversion Factor Details
        sellingBaseValue: "",
        sellingInSpecified: "",
        Round: "",
        buyBaseValue: "",
        buyInSpecified: "",
        minCurrency: "",
    });
    const [loading, setLoading] = useState(false);
    const [tabledata, setTabledata] = useState([])
    const [currencyOptions, setCurrencyOptions] = useState([]);
    const [errors, setErrors] = useState({});
    const [editId, setEditId] = useState(0);
    const dateSelect = (value, name) => {
        setPayload({ ...payload, [name]: value });
    };


    const handleReactSelectChange = (name, options) => {
        setPayload({ ...payload, [name]: options.value });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPayload((prev) => {
            const updatedPayload = {
                ...prev,
                [name]: value,
            };

            if (name === "sellingBaseValue") {
                const saleBase = Number(value);

                updatedPayload.buyBaseValue = saleBase;

                let saleSpecific = 1 / saleBase;
                let buySpecific = 1 / saleBase;

                saleSpecific =
                    Math.round(saleSpecific * 10000) / 10000;

                const CFactor = Number(saleSpecific);

                const round =
                    Math.round(
                        (1 -
                            Math.round(
                                CFactor * saleBase * 10000
                            ) /
                            10000) *
                        10000
                    ) / 10000;

                updatedPayload.Round = round;
                updatedPayload.sellingInSpecified = CFactor;
                updatedPayload.buyInSpecified = CFactor;
            }

            return updatedPayload;
        });
    };

    const getCurrencies = async () => {
        try {
            const res = await axiosInstance.get("CurrencyMaster/GetAllCurrencies");
            const data = res?.data?.message || [];
            const options = data.map((item) => ({
                value: item.id,
                label: item.currencyName,
                symbol: item.currencySymbol,
                isBaseCurrency: item.isBaseCurrency,
            }));

            setCurrencyOptions(options);

            const defaultBaseCurrency = options.find(
                (item) => item.isBaseCurrency === 1
            );

            if (defaultBaseCurrency) {
                setPayload((prev) => ({
                    ...prev,
                    baseCurrency: defaultBaseCurrency.value,
                }));
            }
        } catch (error) {
            console.error(error);
        }
    };
    const getData = async () => {
        try {
            const res = await axiosInstance.get(
                "CurrencyMaster/GetCurrencyDetails",
                {
                    params: {
                        specificCurrency: currencyOptions?.find(
                            (item) => item.value === payload?.specifiedCurrency
                        )?.label,
                    },
                }
            );
            const data = res?.data?.data
            if (res?.data?.success) {

                setTabledata(data);
            } else { toast.error(res?.data?.data); setTabledata([]); }
        } catch (error) {
            console.error(error);
        }
    };

    const handleSave = async () => {
        if (!payload?.specifiedCurrency) {
            toast.error("Please select Specified Currency");
            return
        }
        if (!payload?.sellingBaseValue) {
            toast.error("Selling BaseValue is required.");
            return
        }
        if (!payload?.sellingInSpecified) {
            toast.error("Selling Specified is required.");
            return
        }
        if (!payload?.buyBaseValue) {
            toast.error("BuyBase Value is required.");
            return
        }
        if (!payload?.buyInSpecified) {
            toast.error("Buy Specified Value is required.");
            return
        }

        try {
            setLoading(true);
            const savePayload = {
                Id: editId,
                ConversionDate: moment(payload?.fromDate).format("YYYY-MM-DD"),
                BaseCurrencyId: currencyOptions?.find(
                    (item) => item.value === payload?.baseCurrency
                )?.value,
                SpecificCurrencyId: currencyOptions?.find(
                    (item) => item.value === payload?.specifiedCurrency
                )?.value,
                SellingBase: Number(payload?.sellingBaseValue || 0),
                SellingSpecific: Number(payload?.sellingInSpecified || 0),
                BuyingBase: Number(payload?.buyBaseValue || 0),
                BuyingSpecific: Number(payload?.buyInSpecified || 0),
                Round: Number(payload?.Round || 0),
                MinCurrency: Number(payload?.minCurrency || 0),
                IsActive: 1,
                SCurrency: currencyOptions?.find(
                    (item) => item.value === payload?.specifiedCurrency
                )?.label,
                SNotation: currencyOptions?.find(
                    (item) => item.value === payload?.specifiedCurrency
                )?.symbol,
                BCurrency: currencyOptions?.find(
                    (item) => item.value === payload?.baseCurrency
                )?.label,
                BNotation: currencyOptions?.find(
                    (item) => item.value === payload?.baseCurrency
                )?.symbol,
            };

            console.log(savePayload, "savePayload");
            const apiUrl =
                editId > 0
                    ? "CurrencyMaster/UpdateCurrencyConversion"
                    : "CurrencyMaster/SaveCurrencyConversion";

            const res = await axiosInstance.post(
                apiUrl,
                savePayload
            );

            if (res?.data?.success) {
                toast.success(res?.data?.message);
                setPayload((prev) => ({
                    fromDate: prev.fromDate,
                    baseCurrency: prev.baseCurrency,
                    specifiedCurrency: "",
                    sellingBaseValue: "",
                    sellingInSpecified: "",
                    Round: "",
                    buyBaseValue: "",
                    buyInSpecified: "",
                    minCurrency: "",
                }));
                setLoading(false);
                setEditId(0);
                getData();
            } else {
                toast.error(res?.data?.message);
                setLoading(false);
            }
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            setLoading(true);
            const res = await axiosInstance.get(
                "CurrencyMaster/DeleteCurrencyConversion",
                {
                    params: {
                        id: id,
                    },
                }

            );

            if (res?.data?.success) {
                toast.success(res?.data?.message);
                getData();
                setLoading(false);
            } else {
                toast.error(res?.data?.message);
                setLoading(false);
            }
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (row) => {
        setEditId(row?.Id);

        setPayload((prev) => ({
            ...prev,
            specifiedCurrency:
                currencyOptions?.find(
                    (item) => item.label === row?.SCurrency
                )?.value || "",

            sellingBaseValue: row?.SellingBase,
            sellingInSpecified: row?.SellingSpecific,
            buyBaseValue: row?.BuyingBase,
            buyInSpecified: row?.BuyingSpecific,
            Round: row?.Round,
            minCurrency: row?.MinCurrency,
        }));
    };

    useEffect(() => {
        getCurrencies();
    }, []);

    useEffect(() => {
        if (payload?.specifiedCurrency) {
            getData();
        }
    }, [payload?.specifiedCurrency]);




    return (
        <>
            {loading && <Loading />}
            <Accordion
                name={t("Currency Factor Details")}
                defaultValue={true}
                isBreadcrumb={true}
            >
                <div className="row  pt-2 pl-2 pr-2">
                    <div className="col-sm-2">
                        <DatePicker
                            className="required-fields"
                            name="fromDate"
                            value={payload?.fromDate}
                            onChange={dateSelect}
                            className="custom-calendar"
                            placeholder=" "
                            id="fromDate"
                            lable="From Date"
                            maxDate={new Date()}
                        />
                    </div>

                    <div className="col-sm-2">
                        <ReactSelect
                            className="required-fields"
                            dynamicOptions={currencyOptions}
                            name="baseCurrency"
                            placeholderName="Base Currency"
                            removeIsClearable={true}
                            id="baseCurrency"
                            label="Base Currency"
                            value={payload?.baseCurrency}
                            onChange={handleReactSelectChange}
                            isDisabled={
                                currencyOptions.some((item) => item.isBaseCurrency === 1)
                            }
                        />
                    </div>

                    <div className="col-sm-2">
                        <ReactSelect
                            dynamicOptions={currencyOptions.filter(
                                (item) => item.value !== payload?.baseCurrency
                            )} name="specifiedCurrency"
                            placeholderName={"Specific Currency"}
                            removeIsClearable={true}
                            id="specifiedCurrency"
                            label="Specified Currency"
                            value={payload?.specifiedCurrency}
                            className="required-fields"
                            onChange={handleReactSelectChange}
                        />
                    </div>

                </div>
            </Accordion>
            <Accordion
                name={t("Conversion Factor Details")}
                defaultValue={true}
                isBreadcrumb={true}
            >
                <div className="row p-2" style={{ display: "flex", gap: "10px", justifyContent: "space-between" }}>

                    <div className="row col-sm-6">
                        <div className="col-sm-12 mb-1">
                            <em>{t("Selling Price")}</em>
                        </div>

                        <div className="col-sm-4">
                            <Input
                                type="number"
                                name="sellingBaseValue"
                                value={payload?.sellingBaseValue}
                                onChange={handleChange}
                                lable="In Base"
                                className="required-fields"

                            />
                        </div>

                        <div className="col-sm-4">
                            <Input
                                type="number"
                                name="sellingInSpecified"
                                value={payload?.sellingInSpecified}
                                onChange={handleChange}
                                lable="In Specifice" className="required-fields"

                            />
                        </div>

                        <div className="col-sm-4">
                            <Input
                                type="number"
                                name="Round"
                                value={payload?.Round}
                                onChange={handleChange}
                                lable="Round" className="required-fields"

                            />
                        </div>
                    </div>

                    <div className="row col-sm-6">
                        <div className="col-sm-12 mb-1">
                            <em>{t("Buying Price")}</em>
                        </div>

                        <div className="col-sm-4">
                            <Input
                                type="number"
                                name="buyBaseValue"
                                value={payload?.buyBaseValue}
                                onChange={handleChange}
                                lable="In Base" className="required-fields"

                            />
                        </div>

                        <div className="col-sm-4">
                            <Input
                                type="number"
                                name="buyInSpecified"
                                value={payload?.buyInSpecified}
                                onChange={handleChange}
                                lable="In Specifice" className="required-fields"

                            />
                        </div>

                        <div className="col-sm-4">
                            <Input
                                type="number"
                                name="minCurrency"
                                value={payload?.minCurrency}
                                onChange={handleChange}
                                lable="Min Currency" className="required-fields"

                            />
                        </div>
                    </div>

                    <CustomButton
                        icon={"save"}
                        text={editId > 0 ? "Update" : "Save"}
                        onClick={handleSave}
                        className="ml-2"
                    />
                </div>
            </Accordion>

            <Heading title={t("Search details")} />
            {tabledata?.length > 0 ? (
                <div className="row px-1">
                    <div className="col-12">
                        <Tables>
                            <thead className="cf">
                                <tr>
                                    <th style={{ width: "3%" }}>{t("S.No")}</th>
                                    <th>{t("Currency")}</th>
                                    <th>{t("Notation")}</th>
                                    <th>{t("Selling Base")}</th>
                                    <th>{t("Selling Specific")}</th>
                                    <th>{t("Buying Base")}</th>
                                    <th>{t("Buying Specific")}</th>
                                    <th>{t("Round")}</th>
                                    <th>{t("MinCurrency")}</th>
                                    <th>{t("Date")}</th>
                                    <th style={{ width: "6%" }}>{t("Action")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tabledata?.map((data, index) => (
                                    <tr key={data?.Id}>
                                        <td data-title="S.No">{index + 1}</td>
                                        <td data-title="Currency">{data?.SCurrency}</td>
                                        <td data-title="Notation">{data?.SNotation}</td>
                                        <td data-title="Selling Base">{data?.SellingBase}</td>
                                        <td data-title="Selling Specific">{data?.SellingSpecific}</td>
                                        <td data-title="Buying Base">{data?.BuyingBase}</td>
                                        <td data-title="Buying Specific">{data?.BuyingSpecific}</td>
                                        <td data-title="Round">{data?.Round}</td>
                                        <td data-title="MinCurrency">{data?.MinCurrency}</td>
                                        <td data-title="Date">{data?.ConversionDate}</td>
                                        <td data-title="Action">
                                            <div className="d-flex">
                                                <CustomButton
                                                    icon="edit"
                                                    className="btn btn-sm btn-info mr-1"
                                                    onClick={() => handleEdit(data)}
                                                /> &nbsp;&nbsp;
                                                <CustomButton
                                                    icon="delete"
                                                    className="btn btn-sm btn-danger"
                                                    onClick={() => handleDelete(data?.Id)}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Tables>
                    </div>
                </div>
            ) : (
                <NoRecordFound />
            )}
        </>
    );
};

export default CurrencyFactorMater;
