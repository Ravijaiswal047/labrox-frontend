import React, { useState, useEffect } from "react";
import moment from "moment";
import Heading from "../../../../components/UI/Heading";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import { useTranslation } from "react-i18next";
import {
    getBindCentreType,
    getBindLocation,
    getBindCentreNew,
    getBindCity,
    getBindCountry,
    getBindstate,
    GetZoneData,
} from "../../../../utils/NetworkApi/commonApi";
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

const PurchaseOrderReport = () => {
    const { t } = useTranslation();
    const dateSelect = (date, name) => {
        setPayload({
            ...payload,
            [name]: date,
        });
    };
    const [Centres, SetCentres] = useState([]);
    const [Locations, SetLocations] = useState([]);

    const [dropDownApis, setDropDownApis] = useState({

        countrybind: [],
        BusinessZoneId: [],
        statebind: [],
        citybind: [],
        centrebind: [],
        categorylist: [],
        subcategorylist: [],
        itemcategorylist: [],
        machinelist: [],
        items: [],
        SupplierName: [],
        Manufacture: [],
        POType: [
            { label: "DirectPO", value: "1" },
            { label: "PoFromPI", value: "0" },
        ],
        ReportTypeinExcel: [
            { label: "Summary", value: "1" },
            { label: "Detail", value: "2" },

        ],
    });
    const [payload, setPayload] = useState({
        CentreType: [],
        Location: [],
        BusinessZoneId: [],
        CountryId: "",
        StateId: [],
        CityId: [],
        CentreId: [],
        StoreNotCreated: "0",
        ExpiredDays: "",
        CategoryType: [],
        SubCategoryType: [],
        ItemCategory: [],
        Machine: [],
        Items: [],
        FromDate: new Date(),
        ToDate: new Date(),
        SupplierName: "",
        Manufacture: "",
        POType: "",
        ReportTypeinExcel: { label: "Summary", value: "1" },
        isActive: 0,

    });
    const handleToggle = (field) => {
        setPayload((prev) => ({
            ...prev,
            [field]: prev[field] === 1 ? 0 : 1,
        }));
    };




    // Helper to get comma separated IDs from MultiSelect (objects or plain values)
    const getCommaSeparatedIds = (data) => {
        if (!Array.isArray(data)) return "";
        return data
            .map((item) => item?.value ?? item?.code ?? item)
            .filter((v) => v !== undefined && v !== null && v !== "")
            .join(",");
    };

    // Helper to get array of numbers from MultiSelect (objects or plain numbers)
    const handlePayloadMultiSelectNumbers = (data) => {
        if (!Array.isArray(data)) return [];
        return data.map((item) => Number(item?.value ?? item?.code ?? item));
    };

    const handleSelectChange = (name, value) => {
        const selectedValue = value?.value || "";

        if (name === "CountryId") {
            setPayload((prev) => ({
                ...prev,
                CountryId: selectedValue,
                BusinessZoneId: [],
                StateId: [],
                CityId: [],
                CentreId: [],
            }));

            setDropDownApis((prev) => ({
                ...prev,
                BusinessZoneId: [],
                statebind: [],
                citybind: [],
                centrebind: [],
            }));

            if (selectedValue) {
                GetZoneData(selectedValue, (data) => {
                    setDropDownApis((prev) => ({ ...prev, BusinessZoneId: data }));
                });
            }
        } else {
            //setPayload((prev) => ({ ...prev, [name]: selectedValue }));
            // ✅ IMPORTANT CHANGE
            setPayload((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSelectMultiChange = (name, select) => {
        if (name === "CentreType") {
            setPayload((prev) => ({
                ...prev,
                CentreType: select,
                CentreId: [],
            }));

            // Convert CityId to integer array (even if empty)
            const cityArray = Array.isArray(payload?.CityId)
                ? payload.CityId.map(id => Number(id)).filter(id => !isNaN(id))
                : [];

            // Convert CentreType select to integer array
            const centreTypeArray = Array.isArray(select)
                ? select.map(id => Number(id)).filter(id => !isNaN(id))
                : [];

            console.log("CentreType handler - cityArray:", cityArray, "centreTypeArray:", centreTypeArray);

            getBindCentreNew(
                cityArray,
                centreTypeArray,
                payload?.StoreNotCreated || "0",
                (data) => {
                    console.log("Centre data received:", data);
                    setDropDownApis((prev) => ({ ...prev, centrebind: data }));
                }
            );
        }

        if (name === "BusinessZoneId") {
            setPayload((prev) => {
                const updatedPayload = {
                    ...prev,
                    BusinessZoneId: select,
                    StateId: [],
                    CityId: [],
                    CentreId: [],
                };

                getBindstate(updatedPayload.CountryId, updatedPayload.BusinessZoneId, (data) => {
                    setDropDownApis((prev) => ({
                        ...prev,
                        statebind: data,
                    }));
                });

                return updatedPayload;
            });
        }

        if (name === "StateId") {
            // select = plain numbers [5, 12]
            const stateIdString = select.join(","); // ✅ directly join, no getCommaSeparatedIds

            setPayload((prev) => ({
                ...prev,
                StateId: select,
                CityId: [],
                CentreId: [],
            }));

            if (select.length > 0) {
                console.log("Calling getBindCity with stateIdString:", stateIdString);
                getBindCity(
                    stateIdString, // ✅ "5,12"
                    (data) => {
                        console.log("City data received:", data);
                        setDropDownApis((prev) => ({
                            ...prev,
                            citybind: data || [], // {id, city} format — mapping sahi hai
                        }));
                    }
                );
            } else {
                setDropDownApis((prev) => ({
                    ...prev,
                    citybind: [],
                }));
            }
        }
        if (name === "CityId") {
            setPayload((prev) => ({
                ...prev,
                CityId: select,
                CentreId: [],
            }));

            if (select.length > 0) {
                // Convert select array to integers with validation
                const cityArray = Array.isArray(select)
                    ? select.map(id => Number(id)).filter(id => !isNaN(id))
                    : [];

                const centreTypeArray = Array.isArray(payload?.CentreType)
                    ? payload.CentreType.map(id => Number(id)).filter(id => !isNaN(id))
                    : [];

                console.log("CityId handler - cityArray:", cityArray, "centreTypeArray:", centreTypeArray);

                getBindCentreNew(
                    cityArray,
                    centreTypeArray,
                    payload?.StoreNotCreated || "0",
                    (data) => {
                        console.log("Centre data received:", data);
                        setDropDownApis((prev) => ({ ...prev, centrebind: data }));
                    }
                );
            } else {
                setDropDownApis((prev) => ({ ...prev, centrebind: [] }));
            }
        }

        if (name === "Location") {
            setPayload((prev) => ({
                ...prev,
                Location: select,
            }));
        }

        if (name === "CentreId") {
            setPayload((prev) => ({
                ...prev,
                CentreId: select,
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
    };
    const getSupplier = () => {
        axiosInstance
            .get("VendorQuotation/bindsupplier")
            .then((res) => {
                if (res?.data?.message?.length > 0) {
                    const response = res?.data?.message;
                    console.log(response, "response")
                    setDropDownApis((prev) => ({ ...prev, SupplierName: Array.isArray(response) ? response : [] }));
                }
                else {
                    toast?.error("Data not Found")
                }
            })

            .catch((err) => {
                console.error(err?.response?.data?.message || "Error Occurred");
            });
    };

    useEffect(() => {
        getBindCentreType((data) => SetCentres(data));
        getBindLocation("", "", "", "", "", (data) => SetLocations(data));
        getBindCountry((data) =>
            setDropDownApis((prev) => ({ ...prev, countrybind: data }))
        );
        GetBindcattype((data) => {
            setDropDownApis((prev) => ({ ...prev, categorylist: data }));
        });
        GetMachine((data) => {
            setDropDownApis((prev) => ({ ...prev, machinelist: data }));
        });
        getSupplier();
        getManufacture((data) => {
            setDropDownApis((prev) => ({ ...prev, Manufacture: data }));
        });
    }, []);

    // const getApiPayload = () => {
    //   return {
    //     fromDate: moment(payload.FromDate).format("YYYY-MM-DD"),
    //     toDate: moment(payload.ToDate).format("YYYY-MM-DD"),

    //     locationIds: payload.Location?.length
    //       ? payload.Location.map((i) => Number(i?.value ?? i))
    //       : [],

    //     itemIds: payload.Items?.length
    //       ? payload.Items.map((i) => Number(i?.value ?? i))
    //       : [],

    //     machineIds: payload.Machine?.length
    //       ? payload.Machine.map((i) => Number(i?.value ?? i))
    //       : [],

    //     categoryTypeIds: payload.CategoryType?.length
    //       ? payload.CategoryType.map((i) => Number(i?.value ?? i))
    //       : [],

    //     subCategoryTypeIds: payload.SubCategoryType?.length
    //       ? payload.SubCategoryType.map((i) => Number(i?.value ?? i))
    //       : [],

    //     // ✅ IMPORTANT FIELDS
    //     issueType: payload?.IssueType?.value || "",

    //     indentNo: payload?.IndentNo || "",

    //     // API wants NUMBER (0/1/2), not string
    //     dateOption: payload?.DateOption?.value
    //       ? Number(payload.DateOption.value)
    //       : 0,
    //   };
    // };
    const getApiPayload = () => {
        const getCommaString = (data) => {
            if (!Array.isArray(data)) return "";
            return data
                .map((i) => i?.value ?? i)
                .filter((v) => v !== undefined && v !== null && v !== "")
                .join(",");
        };

        return {
            fromDate: moment(payload.FromDate).format("YYYY-MM-DD"),
            toDate: moment(payload.ToDate).format("YYYY-MM-DD"),

            //  array → comma string
            locationId: getCommaString(payload.Location),
            itemId: getCommaString(payload.Items),

            //  single select
            supplierId: payload?.SupplierName?.value
                ? String(payload.SupplierName.value)
                : "",

            manufactureId: payload?.Manufacture?.value
                ? String(payload.Manufacture.value)
                : "",

            // extra fields (API ke hisaab se map karo)
            type: payload?.POType?.value || "",
            type1: payload?.ReportTypeinExcel?.value || "",

            //  toggle
            isCancelPO: payload?.isActive === 1 ? "1" : "0",
        };
    };
    const downloadExcel = async () => {
        try {


            const apiPayload = getApiPayload();

            const res = await axiosReport.post(
                "/StoreReports/PurchaseOrderReportExcel",
                apiPayload,
                {
                    responseType: "blob",
                }
            );

            // file download logic
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "POReport.xlsx");
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
                    <Heading name={t("Purchase Order Report")} isBreadcrumb={true} />
                    <div className="row px-2 py-2">
                        <div className="col-sm-2">
                            <MultiSelectComp
                                label={t("Centre Type")}
                                options={Centres?.map((i) => ({ label: i.type, value: i.id }))}
                                value={payload.CentreType}
                                name="CentreType"
                                onChange={handleSelectMultiChange}
                            />
                        </div>

                        <div className="col-sm-2">
                            <ReactSelect
                                name="CountryId"
                                placeholderName={t("Country")}
                                dynamicOptions={dropDownApis.countrybind.map((i) => ({
                                    value: i.CountryID,
                                    label: i.CountryName,
                                }))}
                                value={payload.CountryId}
                                onChange={handleSelectChange}
                            />
                        </div>

                        <div className="col-sm-2">
                            <MultiSelectComp
                                label={t("Zone")}
                                options={dropDownApis.BusinessZoneId.map((i) => ({
                                    label: i.BusinessZoneName,
                                    value: i.BusinessZoneID,
                                }))}
                                value={payload.BusinessZoneId}
                                name="BusinessZoneId"
                                onChange={handleSelectMultiChange}
                            />
                        </div>

                        <div className="col-sm-2">
                            <MultiSelectComp
                                label={t("State")}
                                options={dropDownApis.statebind.map((i) => ({
                                    label: i.stateName,
                                    value: i.id,
                                }))}
                                value={payload.StateId}
                                name="StateId"
                                onChange={handleSelectMultiChange}
                            />
                        </div>

                        <div className="col-sm-2">
                            <MultiSelectComp
                                label={t("City")}
                                options={
                                    dropDownApis?.citybind?.map((ele) => ({
                                        label: ele?.city,
                                        code: ele?.id,
                                        value: ele?.id,
                                    })) || []
                                }
                                value={payload?.CityId}
                                name="CityId"
                                id="CityId"
                                onChange={handleSelectMultiChange}
                            />
                        </div>

                        <div className="col-sm-2">
                            <MultiSelectComp
                                label={t("Centre")}
                                options={dropDownApis.centrebind.map((i) => ({
                                    label: i.centre,
                                    value: i.centreID,
                                }))}
                                value={payload.CentreId}
                                name="CentreId"
                                onChange={handleSelectMultiChange}
                            />
                        </div>
                    </div>

                    <div className="row px-2 pb-2">
                        <div className="col-sm-2">
                            <MultiSelectComp
                                label={t("Location")}
                                options={Locations.map((i) => ({
                                    label: i.Location,
                                    value: i.LocationID,
                                }))}
                                value={payload.Location}
                                name="Location"
                                onChange={handleSelectMultiChange}
                            />
                        </div>
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

                        {/* <div className="col-xl-2 col-sm-4 col-md-6 co-12">
               <ReactSelect
                 name="DateOption"
                 id="DateOption"
                 removeIsClearable={true}
                 placeholderName="Date Option"
                 value={payload?.DateOption.value }
                 dynamicOptions={dropDownApis?.DateOption}
                 onChange={handleSelectChange}
               />
             </div> */}


                        {/* <div className="col-xl-2 col-sm-4 col-md-6 co-12">
               <ReactSelect
                 name="IssueType"
                 id="IssueType"
                 removeIsClearable={true}
                 placeholderName="Issue Type"
                 value={payload?.IssueType.value }
                 dynamicOptions={dropDownApis.IssueType}
                 onChange={handleSelectChange}
               />
             </div> */}





                    </div>

                </div>
                <div className="card mt-3">
                    {/* <Heading title={t("Item Details")} /> */}
                    <div className="row px-2 py-2">
                        <div className="col-sm-2">
                            <ReactSelect
                                name="SupplierName"
                                id="SupplierName"
                                removeIsClearable={true}
                                placeholderName="Supplier Name"
                                value={payload?.SupplierName.value}
                                dynamicOptions={dropDownApis?.SupplierName.map((ele) => ({
                                    label: ele?.name,
                                    value: ele?.id,
                                }))}
                                onChange={handleSelectChange}
                            />
                        </div>

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




                        {/* <div className="col-xl-2 col-sm-4 col-md-6 co-12">
               <ReactSelect
                 name="DateOption"
                 id="DateOption"
                 removeIsClearable={true}
                 placeholderName="Date Option"
                 value={payload?.DateOption.value }
                 dynamicOptions={dropDownApis?.DateOption}
                 onChange={handleSelectChange}
               />
             </div> */}
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
                        <div className="col-xl-2 col-sm-4 col-md-6 co-12">
                            <ReactSelect
                                name="POType"
                                id="POType"
                                removeIsClearable={true}
                                placeholderName="PO Type"
                                value={payload?.POType.value}
                                dynamicOptions={dropDownApis.POType}
                                onChange={handleSelectChange}
                            />
                        </div>
                        <div className="col-xl-2 col-sm-4 col-md-6 co-12">
                            <ReactSelect
                                name="ReportTypeinExcel"
                                id="ReportTypeinExcel"
                                removeIsClearable={true}
                                placeholderName="Report Type in Excel"
                                value={payload?.ReportTypeinExcel.value}
                                dynamicOptions={dropDownApis.ReportTypeinExcel}
                                onChange={handleSelectChange}
                            />
                        </div>
                        <div className="col-auto d-flex align-items-center justify-content-center p-2">
                            <label class="switch mb-0">
                                <input
                                    type="checkbox"
                                    checked={payload.isActive === 1}
                                    onChange={() => handleToggle("isActive")}
                                />
                                <span class="slider"></span>
                            </label>
                            <strong>
                                <span>{t("Show Cancel PO")}</span>
                            </strong>
                        </div>



                        <div className="col-sm-2 d-flex align-items-end pb-2">
                            <button
                                className="btn btn-sm btn-success"
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

export default PurchaseOrderReport