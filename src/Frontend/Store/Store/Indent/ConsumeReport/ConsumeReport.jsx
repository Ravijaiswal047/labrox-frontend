
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
} from "../../../../utils/NetworkApi/commonApi";
import MultiSelectComp from "../../../../components/formComponent/MultiSelectComp";

import { toast } from "react-toastify";
import DatePicker from "../../../../components/formComponent/DatePicker";
import { axiosReport } from "../../../../utils/axiosInstance";
import { CustomButton } from "../../../../components/UI/CustomButton";
const ConsumeReport = () => {
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
        ReportType: [
            { label: "Detail", value: 0 },
            { label: "Item Summary", value: 1 },
            { label: "Amt Summary", value: 2 },
        ],
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
        ReportType: "0",
        CategoryType: [],
        SubCategoryType: [],
        ItemCategory: [],
        Machine: [],
        Items: [],
        FromDate: new Date(),
        ToDate: new Date(),
    });



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
            // setPayload((prev) => ({ ...prev, [name]: selectedValue }));
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

        // if (name === "StateId") {
        //     const stateIdString = getCommaSeparatedIds(select);

        //     setPayload((prev) => ({
        //         ...prev,
        //         StateId: select,
        //         CityId: [],
        //         CentreId: [],
        //     }));

        //     if (select.length > 0) {
        //         getBindCity(
        //             select?.map((val) => val)?.join(","),
        //             stateIdString,
        //             (data) => {
        //                 setDropDownApis((prev) => ({
        //                     ...prev,
        //                     citybind: data,
        //                 }));
        //             }
        //         );
        //     } else {
        //         setDropDownApis((prev) => ({
        //             ...prev,
        //             citybind: [],
        //         }));
        //     }
        // }

        // if (name === "CityId") {
        //     const cityIds = getCommaSeparatedIds(select);
        //     const centreTypeIds = getCommaSeparatedIds(payload?.CentreType) || "";

        //     setPayload((prev) => ({
        //         ...prev,
        //         CityId: select,
        //         CentreId: [],
        //     }));

        //     if (cityIds || centreTypeIds) {
        //         const cityArray = cityIds ? cityIds.split(",") : [];
        //         const centreArray = centreTypeIds ? centreTypeIds.split(",") : [2, 1];

        //         getBindCentreNew(cityArray, centreArray, "0", (data) => {
        //             setDropDownApis((prev) => ({ ...prev, centrebind: data }));
        //         });
        //     }
        // }
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
                        console.log("City data received:", data); // verify karo
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
    }, []);

    const getApiPayload = () => {
        return {
            locationIds: payload.Location?.length
                ? payload.Location.map((i) => Number(i?.value ?? i))
                : [],

            itemIds: payload.Items?.length
                ? payload.Items.map((i) => Number(i?.value ?? i))
                : [],

            machineIds: payload.Machine?.length
                ? payload.Machine.map((i) => Number(i?.value ?? i))
                : [],

            categoryTypeIds: payload.CategoryType?.length
                ? payload.CategoryType.map((i) => Number(i?.value ?? i))
                : [],

            subCategoryTypeIds: payload.SubCategoryType?.length
                ? payload.SubCategoryType.map((i) => Number(i?.value ?? i))
                : [],

            subCategoryIds: payload.ItemCategory?.length
                ? payload.ItemCategory.map((i) => Number(i?.value ?? i))
                : [],

            fromDate: payload.FromDate
                ? moment(payload.FromDate).format("YYYY-MM-DD")
                : "",

            toDate: payload.ToDate
                ? moment(payload.ToDate).format("YYYY-MM-DD")
                : "",

            type: Number(payload.ReportType?.value) || 0,
        };
    };
    const downloadExcel = async () => {
        try {
            //   if (payload.CentreType.length === 0) {
            //     toast.error("Please select at least one Centre Type");
            //     return;
            // }

            // if (payload.Location.length === 0) {
            //     toast.error("Please select at least one Location");
            //     return;
            // }

            const apiPayload = getApiPayload();

            const res = await axiosReport.post(
                "StoreReports/StockConsumeReportExcel",
                apiPayload,
                {
                    responseType: "blob"
                }
            );

            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement("a");
            link.href = url;

            const today = new Date().toISOString().split("T")[0];
            link.setAttribute("download", `ConsumeReport_${today}.xlsx`);

            document.body.appendChild(link);
            link.click();

            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success(res?.data?.message || "Excel downloaded successfully");
        }
        catch (err) {
            console.error(err);
            toast.error(err?.response?.data?.message || "No Record Found");
        }
    };


    return (
        <>
            <div>
                <div className="card">
                    <Heading name={t("Consume Report")} isBreadcrumb={true} />
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
                                name="ReportType"
                                id="ReportType"
                                removeIsClearable={true}
                                placeholderName="Report Type"
                                value={payload?.ReportType.value ?? "0"}
                                dynamicOptions={dropDownApis.ReportType}
                                onChange={handleSelectChange}
                            />
                        </div>

                        <div className="col-sm-2 d-flex align-items-end">
                            <CustomButton
                                className="btn btn-sm btn-success"
                                text={t("Get Report Excel")}
                                icon="excel"
                                onClick={downloadExcel}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ConsumeReport