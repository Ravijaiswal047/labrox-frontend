import React, { useState, useEffect } from "react";
import moment from "moment";
import Heading from "../../../../components/UI/Heading";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import { useTranslation } from "react-i18next";

import {
    GetBindcattype,
    GetBinditem,
    GetBindSubcattype,
    GetItemCategory,
    GetMachine,
    getManufacture,
} from "../../../../utils/NetworkApi/commonApi";
import MultiSelectComp from "../../../../components/formComponent/MultiSelectComp";

import { toast } from "react-toastify";
import DatePicker from "../../../../components/formComponent/DatePicker";
import { axiosInstance, axiosReport } from "../../../../utils/axiosInstance";
const StockLedgerReport = () => {
    const { t } = useTranslation();
    const dateSelect = (date, name) => {
        setPayload({
            ...payload,
            [name]: date,
        });
    };
    const [dropDownApis, setDropDownApis] = useState({

        categorylist: [],
        subcategorylist: [],
        itemcategorylist: [],
        machinelist: [],
        items: [],

        Manufacture: [],


    });
    const [payload, setPayload] = useState({

        StoreNotCreated: "0",

        CategoryType: [],
        SubCategoryType: [],
        ItemCategory: [],
        Machine: [],
        Items: [],
        Manufacture: "",
        FromDate: new Date(),
        ToDate: new Date(),
    });
    const handlePayloadMultiSelectNumbers = (data) => {
        if (!Array.isArray(data)) return [];
        return data.map((item) => Number(item?.value ?? item?.code ?? item));
    };

    const handleSelectChange = (name, value) => {
        const selectedValue = value?.value || "";

        if (name === "CentreType") {
            setPayload((prev) => ({
                ...prev,
                CentreType: value,
                CentreId: [],
            }));




        } else {
            //setPayload((prev) => ({ ...prev, [name]: selectedValue }));
            // ✅ IMPORTANT CHANGE
            setPayload((prev) => ({ ...prev, [name]: value }));
        }
    };
    const handleSelectMultiChange = (name, select) => {
        if (name === "Location") {
            setPayload((prev) => ({
                ...prev,
                Location: select,
            }));
        }

        if (name === "CentreType") {
            setPayload((prev) => ({
                ...prev,
                CentreType: select,
                CentreId: [],
            }));
        }
        // ─── Item Details Dropdowns ───────────────────────────────────────────

        if (name === "CategoryType") {
            // select = plain number array e.g. [9, 15]
            const categoryIds = select.join(","); // ✅ "9,15"

            setPayload((prev) => ({
                ...prev,
                CategoryType: select,
                SubCategoryType: [],
                ItemCategory: [],
                Machine: [],
                Items: [],
            }));

            setDropDownApis((prev) => ({
                ...prev,
                subcategorylist: [],
                itemcategorylist: [],
                items: [],
            }));

            if (select.length > 0) {
                GetBindSubcattype(categoryIds, (data) => {
                    setDropDownApis((prev) => ({
                        ...prev,
                        subcategorylist: data || [],
                    }));
                });
            }
        } else if (name === "SubCategoryType") {
            setPayload((prev) => ({
                ...prev,
                SubCategoryType: select,
                ItemCategory: [],
                Machine: [],
                Items: [],
            }));

            setDropDownApis((prev) => ({
                ...prev,
                itemcategorylist: [],
                items: [],
            }));

            if (select.length > 0) {
                GetItemCategory(handlePayloadMultiSelectNumbers(select), (data) => {
                    setDropDownApis((prev) => ({ ...prev, itemcategorylist: data }));
                });
            }
        } else if (name === "ItemCategory") {
            setPayload((prev) => ({
                ...prev,
                ItemCategory: select,
                Machine: [],
                Items: [],
            }));

            setDropDownApis((prev) => ({
                ...prev,
                items: [],
            }));

            if (select.length > 0) {
                GetBinditem(
                    handlePayloadMultiSelectNumbers(payload?.CategoryType),
                    handlePayloadMultiSelectNumbers(payload?.SubCategoryType),
                    handlePayloadMultiSelectNumbers(select),
                    (data) => {
                        setDropDownApis((prev) => ({ ...prev, items: data }));
                    }
                );
            }
        } else if (
            name !== "CentreType" &&
            name !== "BusinessZoneId" &&
            name !== "StateId" &&
            name !== "CityId" &&
            name !== "Location" &&
            name !== "CentreId"
        ) {
            setPayload((prev) => ({ ...prev, [name]: select }));
        }
    }

    useEffect(() => {

        GetBindcattype((data) => {
            setDropDownApis((prev) => ({ ...prev, categorylist: data }));
        });
        GetMachine((data) => {
            setDropDownApis((prev) => ({ ...prev, machinelist: data }));
        });
       
        getManufacture((data) => {
            setDropDownApis((prev) => ({ ...prev, Manufacture: data }));
        });
    }, []);

    const getApiPayload = () => {
    return {
        fromDate: moment(payload.FromDate).format("YYYY-MM-DD"),
        toDate: moment(payload.ToDate).format("YYYY-MM-DD"),

        locationIds: payload.Location?.length
            ? payload.Location.map((i) => Number(i?.value ?? i))
            : [],

        itemIds: payload.Items?.length
            ? payload.Items.map((i) => Number(i?.value ?? i))
            : [],

        itemTypeIds: payload.ItemCategory?.length
            ? payload.ItemCategory.map((i) => Number(i?.value ?? i))
            : [],

        categoryTypeIds: payload.CategoryType?.length
            ? payload.CategoryType.map((i) => Number(i?.value ?? i))
            : [],

        subCategoryTypeIds: payload.SubCategoryType?.length
            ? payload.SubCategoryType.map((i) => Number(i?.value ?? i))
            : [],

        // 👇 IMPORTANT (string expected)
        manufactureId: payload.Manufacture
            ? String(payload.Manufacture?.value ?? payload.Manufacture)
            : "",

        machineId: payload.Machine?.length
            ? payload.Machine.map((i) => i?.value ?? i).join(",") // "1,2,3"
            : "",
    };
};
    
        const downloadExcel = async () => {
            try {
    
    
                const apiPayload = getApiPayload();
    
                const res = await axiosReport.post(
                    "/StoreReports/StockLedgerReportExcel",
                    apiPayload,
                    {
                        responseType: "blob",
                    }
                );
    
                // file download logic
                const url = window.URL.createObjectURL(new Blob([res.data]));
                const link = document.createElement("a");
                link.href = url;
                link.setAttribute("download", "StockLedgerReport.xlsx");
                document.body.appendChild(link);
                link.click();
                link.remove();
                toast.success(res?.data?.message || "Excel downloaded successfully");
    
            } catch (err) {
                console.error(err);
                toast.error(err?.response?.data?.message || "No Record Found");
            }
        };
    return (
        <>
            <div>
                <div className="card">
                    <Heading name={"Stock Ledger Report(Stock Movement On Date)"} isBreadcrumb={true} />
                    <div className="row px-2 py-2">


                        <DatePicker
                            name="FromDate"
                            id="FromDate"
                            value={payload?.FromDate}
                            onChange={dateSelect}
                            maxDate={new Date()}
                            placeholder=""
                            lable={t("From Date")}
                            className="custom-calendar"
                            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
                        />
                        <DatePicker
                            name="ToDate"
                            id="ToDate"
                            value={payload?.ToDate}
                            onChange={dateSelect}
                            maxDate={new Date()}
                            placeholder=""
                            lable={t("TO Date")}
                            className="custom-calendar"
                            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
                        />
                    </div>
                </div>

                <div className="card mt-2">
                    <Heading title={t("Item Details")} />
                    <div className="row px-2 py-2">
                        <div className="col-sm-2">
                            <MultiSelectComp
                                label={t("Category Type")}
                                options={dropDownApis.categorylist.map((i) => ({
                                    label: i.categoryTypeName,
                                    value: i.categoryTypeID,
                                }))}
                                value={payload.CategoryType}
                                name="CategoryType"
                                id="CategoryType"
                                onChange={handleSelectMultiChange}
                            />
                        </div>

                        <div className="col-sm-2">
                            <MultiSelectComp
                                label={t("SubCategory Type")}
                                options={dropDownApis.subcategorylist.map((i) => ({
                                    label: i.subCategoryTypeName,
                                    value: i.subCategoryTypeID,
                                }))}
                                value={payload.SubCategoryType}
                                name="SubCategoryType"
                                id="SubCategoryType"
                                onChange={handleSelectMultiChange}
                            />
                        </div>

                        <div className="col-sm-2">
                            <MultiSelectComp
                                label={t("Item Category")}
                                options={dropDownApis.itemcategorylist.map((i) => ({
                                    label: i.name,
                                    value: i.subCategoryID,
                                }))}
                                value={payload.ItemCategory}
                                name="ItemCategory"
                                id="ItemCategory"
                                onChange={handleSelectMultiChange}
                            />
                        </div>



                        <div className="col-sm-2">
                            <MultiSelectComp
                                label={t("Items")}
                                options={dropDownApis.items.map((i) => ({
                                    label: i.itemName,
                                    value: i.itemId,
                                }))}
                                value={payload.Items}
                                name="Items"
                                id="Items"
                                onChange={handleSelectMultiChange}
                            />
                        </div>


                    </div>

                </div>

                <div className="card mt-2">
                    <Heading title={t("Other Details")} />
                    <div className="row px-2 py-2">

                        <div className="col-xl-2 col-sm-4 col-md-6 co-12">
                            <ReactSelect
                                name="Manufacture"
                                id="Manufacture"
                                removeIsClearable={true}
                                placeholderName="Manufacture"
                                value={payload?.Manufacture.value}
                                dynamicOptions={[
                                    { label: "Select", value: "" },
                                    ...dropDownApis?.Manufacture?.map((item) => ({
                                        label: item?.name,
                                        value: item?.id,
                                    })),
                                ]}
                                onChange={handleSelectChange}
                            />
                        </div>

                        <div className="col-sm-2">
                            <MultiSelectComp
                                label={t("Machine")}
                                options={dropDownApis.machinelist.map((i) => ({
                                    label: i.name,
                                    value: i.id,
                                }))}
                                value={payload.Machine}
                                name="Machine"
                                id="Machine"
                                onChange={handleSelectMultiChange}
                            />
                        </div>



                        <div className="col-sm-2 d-flex align-items-end pb-2">

                            <button
                                className="btn btn-sm btn-success ml-2"
                            // onClick={() => console.log(payload)}
                            onClick={downloadExcel}
                            >
                                {t("Get Report Excel")}
                            </button>
                        </div>


                    </div>

                </div>
            </div>
        </>
    )
}

export default StockLedgerReport