import React, { useState } from "react";
import Accordion from "../../../components/UI/Accordion";
import { useTranslation } from "react-i18next";
import ReactSelect from "../../../components/formComponent/ReactSelect";
import { AutoComplete } from "primereact/autocomplete";
import Tables from "../../../components/UI/customTable";
import Heading from "../../../components/UI/Heading";
import { useEffect } from "react";
import { axiosInstance } from "../../../utils/axiosInstance";
import { toast } from "react-toastify";
import { isChecked } from "../../util/Commonservices";
import { CustomButton, SaveButton } from "../../../components/UI/CustomButton";
import { useLocalStorage } from "../../../utils/hooks/useLocalStorage";
import Input from "../../../components/formComponent/Input";
const ConsumeStoreItem = () => {
    const { t } = useTranslation();
    const initialState = {
        LocationId: "",
        SearchOption: "",
        Items: "",
        barcodeno: "",
        ItemID: "",
        SecondReferDoctor: "",
        SecondReferDoctorName: "",

    };

    const [payload, setPayload] = useState(initialState);
    console.log(payload, "payload")
    const [tableData, setTableData] = useState([]);
    const handleSelectChange = (name, value) => {
        setPayload((prev) => ({ ...prev, [name]: value?.value }));
    };
    console.log({ tableData })

    const handleAutoCompleteSelect = (e) => {
        const selected = e.value;
        setPayload((prev) => ({
            ...prev,
            ItemName: selected?.ItemNameGroup || selected,
            ItemID: selected?.ItemID || selected,
        }));
    };
    const handleAutoCompleteChange = (e) => {
        const val = typeof e.value === "object" ? e.value.ItemNameGroup : e.value;
        setAutoCompleteVal(val);
        searchItems(val);
        setPayload((prev) => ({ ...prev, ItemName: val, ManufactureID: "", MachineID: "", PackSize: "" }));
    };
    const itemTemplate = (item) => (
        <div className="p-clearfix">
            <div style={{ float: "left", fontSize: "12px", width: "100%" }}>
                {item?.ItemNameGroup}
            </div>
        </div>
    );
    const SearchOptionList = [
        { label: "By First Name", value: "0" },
        { label: "In Between", value: "1" },
        { label: "By Item Code", value: "2" },
    ];

    const user = useLocalStorage("userData", "get");
    const DefaultCurrencyName = user?.DefaultCurrencyName;
    const isKESCurrency = DefaultCurrencyName === "KES";
    console.log("user", user)
    const [Locationsearch, setLocationsearch] = useState([]);
    const [autoCompleteVal, setAutoCompleteVal] = useState("");
    const [stockSuggestions, setStockSuggestions] = useState([]);
    const [secondDoctorSuggestions, setSecondDoctorSuggestions] = useState([]);

    const GetLocations = () => {
        axiosInstance
            .post("ConsumeStoreItem/bindindentfromlocation", {})
            .then((res) => {
                const response = res?.data?.data;
                setLocationsearch(Array.isArray(response) ? response : []);
            })
            .catch((err) => {
                toast.error(err?.response?.data?.message || "Error Occurred");
            });
    };
    const searchItems = async (query) => {
        const requestBody = {
            itemName: query || "",
            locationidfrom: String(payload?.DeliveryLocation?.[0]?.code || ""),
            searchOption: String(payload?.SearchOption || ""),
            itemtype: String(""),
            barcodeno: String(payload?.barcodeno || ""),
        };
        await axiosInstance
            .post("VendorQuotation/SearchItemWthItemId", {
                ...requestBody,
            })
            .then((res) => {
                const response = res?.data?.message;
                setStockSuggestions(Array.isArray(response) ? response : []);
            })
            .catch((err) => {
                console.log(err?.response?.data?.message || "Error Occurred");
            });
    };
    const searchSecondDoctors = async (query) => {
        if (!query?.trim()) {
            setSecondDoctorSuggestions([]);
            return;
        }

        try {
            const res = await axiosInstance.post("DoctorReferal/getDoctorData", {
                DoctorName: query,
            });
            const response = res?.data?.message;
            setSecondDoctorSuggestions(Array.isArray(response) ? response : []);
        } catch (err) {
            setSecondDoctorSuggestions([]);
            console.log(err?.response?.data?.message || "Error Occurred");
        }
    };

    const getDoctorDisplayName = (doctor) =>
        [
            doctor?.Name,
            doctor?.Mobile,
            doctor?.Department ||
            doctor?.DeptName ||
            doctor?.DepartmentName ||
            doctor?.Dept ||
            doctor?.DoctorDepartment,
            doctor?.Specialization ||
            doctor?.Speciality ||
            doctor?.Speclization ||
            doctor?.Spec ||
            doctor?.SpecializationName,
        ]
            .filter(
                (value) =>
                    value &&
                    String(value).trim() !== "" &&
                    value !== 0 &&
                    value !== "0",
            )
            .join("~");

    const secondDoctorTemplate = (doctor) => (
        <div style={{ fontSize: "12px" }}>{getDoctorDisplayName(doctor)}</div>
    );
    const handlePayloadSecondDoctorChange = (value) => {
        const doctorName = typeof value === "object" ? getDoctorDisplayName(value) : value;
        setPayload((prev) => ({
            ...prev,
            SecondReferDoctor: "",
            SecondReferDoctorName: doctorName,
        }));
        setTableData((prev) =>
            prev.map((row) => ({
                ...row,
                SecondReferDoctor: "",
                SecondReferDoctorName: doctorName,
            })),
        );
    };
    const handlePayloadSecondDoctorSelect = (doctor) => {
        const doctorId = doctor?.DoctorReferalID || "";
        const doctorName = getDoctorDisplayName(doctor);

        setPayload((prev) => ({
            ...prev,
            SecondReferDoctor: doctorId,
            SecondReferDoctorName: doctorName,
        }));

        setTableData((prev) =>
            prev.map((row) => ({
                ...row,
                SecondReferDoctor: doctorId,
                SecondReferDoctorName: doctorName,
            })),
        );
        setSecondDoctorSuggestions([]);
    };


    const handleSecondDoctorChange = (index, value) => {
        const doctorName =
            typeof value === "object" ? getDoctorDisplayName(value) : value;
        const updatedTableData = [...tableData];
        updatedTableData[index] = {
            ...updatedTableData[index],
            SecondReferDoctor: "",
            SecondReferDoctorName: doctorName,
        };
        setTableData(updatedTableData);
    };

    const handleSecondDoctorSelect = (index, doctor) => {
        const updatedTableData = [...tableData];
        updatedTableData[index] = {
            ...updatedTableData[index],
            SecondReferDoctor: doctor?.DoctorReferalID || "",
            SecondReferDoctorName: getDoctorDisplayName(doctor),
        };
        setTableData(updatedTableData);
        setSecondDoctorSuggestions([]);
    };

    const handleAllInputChange = (fieldName, value) => {
        const updatedTableData = tableData.map((row) => ({
            ...row,
            [fieldName]: value,
        }));
        setTableData(updatedTableData);
    };


    console.log("tableData", tableData)
    const handleInputChange = (index, fieldName, value, currentStock) => {
        const updatedTableData = [...tableData];
        if (fieldName === "ConsumeQty") {
            if (Number(currentStock) < Number(value)) {
                toast?.error("Consume Qty Can't Greater Then Current Stock Qty")
                updatedTableData[index] = {
                    ...updatedTableData[index],
                    [fieldName]: currentStock
                }
            } else {
                updatedTableData[index] = {
                    ...updatedTableData[index],
                    [fieldName]: value,
                };
            }
        }
        else {
            updatedTableData[index] = {
                ...updatedTableData[index],
                [fieldName]: value,
            };
        }
        setTableData(updatedTableData);
    };

    const SearchBtnApi = async (id) => {
        if (payload?.LocationId === "") {
            toast.warn("Please Select Location..!")
            return;
        }
        const requstBody = {
            // packageId: "",
            locationId: payload?.LocationId,
            barcodeno: payload?.barcodeno || "",
            itemid: String(payload?.ItemID),
            // itemname: payload?.ItemsName,
            // locationidfrom: payload?.LocationId ,
            // tolocation: ""
        };
        await axiosInstance
            .post("ConsumeStoreItem/SearchData", {
                ...requstBody,
            })
            .then((res) => {
                let data = res?.data?.data;
                let success = res?.data?.success;
                if (success) {
                    setTableData(
                        (data || []).map((row) => ({
                            ...row,
                            SecondReferDoctor: payload.SecondReferDoctor || "",
                            SecondReferDoctorName: payload.SecondReferDoctorName || "",
                        })),
                    );

                    setTableData(data || []);
                    toast.success(res.data.message);
                } else {
                    toast.error(data);
                    setTableData([]);
                    setPayload((prev) => ({
                        ...prev,
                        ItemID: "",

                    }));
                    setAutoCompleteVal("");
                    setStockSuggestions([]);

                }
            })
            .catch((err) => {
                toast.error(err?.response?.data?.message || "Error Occurred");
                setTableData([]);
            });
    };

    const handleChange = (e) => {
        setPayload((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }))
    };
    const SaveBtnApi = async () => {
        if (payload?.LocationId === "") {
            toast.warn("Please Select Location..!");
            return;
        }

        const filteredData = tableData.filter((ele) => ele.Print === 1);
        if (filteredData.length === 0) {
            toast.warn("Please Select Atleast One Item");
            return;
        }
        const hasInvalidQty = filteredData.some(
            (ele) => !ele.ConsumeQty || Number(ele.ConsumeQty) <= 0
        );
        if (hasInvalidQty) {
            toast.warn("Please Enter Consume Qty");
            return;
        }

        const requstBody = filteredData.map((row) => ({
            fromLocationID: String(row.locationid),
            stockID: String(row.stockid),
            quantity: Number(row.ConsumeQty) || 0,
            itemID: String(row.itemid),
            naration: row.ConsumeRemark || "",
            checkExpiry: String(row.IsExpirable) || 0,
            expiryDate: row.ExpiryDate,
            DoctorId: isKESCurrency
                ? Number(row.SecondReferDoctor) || 0
                : 0,
        }));

        await axiosInstance
            .post("ConsumeStoreItem/SaveConsume", requstBody)
            .then((res) => {
                let data = res?.data?.data;
                let success = res?.data?.success;
                if (success) {
                    toast.success(data || "Saved Successfully");
                    const remainingData = tableData.filter((row) => row.Print !== 1);
                    setTableData(remainingData);
                    if (remainingData.length === 0) {
                        setPayload(initialState);
                        setAutoCompleteVal("");
                        setStockSuggestions([]);
                    }
                } else {
                    toast.error(data || "Failed to save");
                }
            })
            .catch((err) => {
                toast.error(err?.response?.data?.message || "Error Occurred");
            });
        SearchBtnApi()
    };

    const ResetBtnApi = () => {
        setPayload(initialState);
        setTableData([]);
        setAutoCompleteVal("");
        setStockSuggestions([]);
        setSecondDoctorSuggestions([]);
    };

    const handleCheckbox = (e) => {
        const { name, checked } = e.target;
        const data = tableData?.map((ele) => {
            let updated = {
                ...ele,
                [name]: checked ? 1 : 0,
            };
            return updated;
        });
        setTableData(data);
    };

    const handleCheckboxSingle = (e, index) => {
        const { name, checked } = e.target;
        const datas = [...tableData];
        datas[index][name] = checked ? 1 : 0;
        setTableData(datas);
    };
    useEffect(() => {
        GetLocations();
    }, []);

    useEffect(() => {
        setPayload((prev) => ({
            ...prev,
            ItemID: "",

        }));
        setAutoCompleteVal("");
        setStockSuggestions([]);
    }, [payload.LocationId, payload.SearchOption]);

    return (
        <>
            <Accordion
                name={t("Location Detail")}
                defaultValue={true}
                isBreadcrumb={true}
            >
                <div className="row px-2 pt-2">
                    <ReactSelect
                        name="LocationId"
                        id="LocationId"
                        removeIsClearable={true}
                        dynamicOptions={Locationsearch.map((ele) => ({
                            label: ele?.location,
                            value: ele.locationid,
                        }))}
                        placeholderName="Location"
                        value={payload?.LocationId}
                        onChange={handleSelectChange}
                        respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
                    />
                    <ReactSelect
                        name="SearchOption"
                        id="SearchOption"
                        removeIsClearable={true}
                        dynamicOptions={SearchOptionList}
                        placeholderName="Search Option"
                        value={payload?.SearchOption}
                        onChange={handleSelectChange}
                        respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
                    />
                    <div className="col-xl-2 col-md-6 col-sm-4 col-12 pb-2">
                        <AutoComplete
                            style={{ width: "100%" }}
                            value={autoCompleteVal}
                            suggestions={stockSuggestions}
                            completeMethod={() => searchItems(autoCompleteVal)}
                            onSelect={handleAutoCompleteSelect}
                            id="ItemsName"
                            name="ItemsName"
                            onChange={handleAutoCompleteChange}
                            itemTemplate={itemTemplate}
                        />
                        <label htmlFor="ItemsName" className="lable searchtest">
                            Items
                        </label>
                    </div>
                    <div className="col-sm-2">
                        <Input
                            lable="Barcode No"
                            name="barcodeno"
                            value={payload.barcodeno}
                            onChange={handleChange}
                        />

                    </div>
                    <div className="col-sm-2">
                        <CustomButton
                            icon={"search"}
                            text={"Search Item"}
                            onClick={SearchBtnApi}
                        />

                        <CustomButton
                            text={"Reset"}
                            icon={"refresh"}
                            className=" ml-2"
                            onClick={ResetBtnApi}
                        />
                    </div>
                </div>
                {tableData?.length > 0 && (
                    <div className="row pt-1 pb-2 pr-2">
                        <div className="col-12 text-right">
                            <SaveButton
                                text={"Save"}
                                icon={"save"}
                                className="ml-2"
                                onClick={SaveBtnApi}
                            />
                        </div>
                    </div>
                )}
            </Accordion>
            <Heading title={t("Item Detail")} />
            {tableData?.length > 0 && (
                <div className="row">
                    <div className="col-sm-12">
                        <Tables>
                            <thead>
                                <tr>
                                    <th>{t("Sr No.")}</th>
                                    <th>{t("Item Id")}</th>
                                    {/* <th>{t("Item Code")}</th> */}
                                    <th>{t("Item Name")}</th>
                                    <th>{t("Issue Date")}</th>
                                    <th>{t("Batch Number")}</th>
                                    <th>{t("Expiry Date")}</th>
                                    <th>{t("Barcode No")}</th>
                                    <th>{t("Current Stock Qty")}</th>
                                    <th>{t("Consume Qty")}</th>
                                    {isKESCurrency && (
                                        <th>
                                            <AutoComplete
                                                style={{ width: "100%" }}
                                                inputStyle={{ width: "100%" }}
                                                value={payload.SecondReferDoctorName || ""}
                                                suggestions={secondDoctorSuggestions}
                                                completeMethod={(e) =>
                                                    searchSecondDoctors(e.query)
                                                }
                                                onChange={(e) =>
                                                    handlePayloadSecondDoctorChange(e.value)
                                                }
                                                onSelect={(e) =>
                                                    handlePayloadSecondDoctorSelect(e.value)
                                                }
                                                itemTemplate={secondDoctorTemplate}
                                                placeholder={t("Refer Doctor")}
                                            />
                                        </th>
                                    )}
                                    <th>
                                        <input
                                            placeholder="Consume Remark"
                                            type="text"
                                            className="form-control"
                                            onChange={(e) =>
                                                handleAllInputChange(
                                                    "ConsumeRemark",
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </th>
                                    <th>
                                        <input
                                            type="checkbox"
                                            name="Print"
                                            checked={
                                                tableData.length > 0 &&
                                                tableData.every((item) => item.Print === 1)
                                            }
                                            onChange={handleCheckbox}
                                        />
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {tableData?.map((row, index) => (
                                    <tr
                                        key={index}
                                        style={{ backgroundColor: row?.rowcolor }}
                                    >
                                        <td data-title="Sr No.">{index + 1}</td>
                                        <td data-title="Item Id">{row?.itemid}</td>
                                        {/* <td data-title="Item Code">{row?.itemIDGroup}</td> */}
                                        <td data-title="Item Name">{row?.itemname}</td>
                                        <td data-title="Issue Date">{row?.stockdate}</td>
                                        <td data-title="Batch Number">
                                            {row?.batchnumber}
                                        </td>
                                        <td data-title="Expiry Date">
                                            {row?.ExpiryDate}
                                        </td>
                                        <td data-title="Barcode No">{row?.barcodeno}</td>
                                        <td data-title="Current Stock Qty">
                                            {/* {row?.InHandQty}
                                             */}
                                            {row?.InHandQty}
                                        </td>


                                        <td data-title="Consume Qty">
                                            <input
                                                placeholder="Consume Qty"
                                                type="number"
                                                className="form-control"
                                                value={row?.ConsumeQty || ""}
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        index,
                                                        "ConsumeQty",
                                                        e.target.value,
                                                        row?.InHandQty,
                                                    )
                                                }
                                            />
                                        </td>
                                        {isKESCurrency && (
                                            <td data-title="Refer Doctor">
                                                <AutoComplete
                                                    style={{ width: "100%" }}
                                                    inputStyle={{ width: "100%" }}
                                                    value={row?.SecondReferDoctorName || ""}
                                                    suggestions={secondDoctorSuggestions}
                                                    completeMethod={(e) =>
                                                        searchSecondDoctors(e.query)
                                                    }
                                                    onChange={(e) =>
                                                        handleSecondDoctorChange(index, e.value)
                                                    }
                                                    onSelect={(e) =>
                                                        handleSecondDoctorSelect(index, e.value)
                                                    }
                                                    itemTemplate={secondDoctorTemplate}
                                                    placeholder={t("Refer Doctor")}
                                                />
                                            </td>
                                        )}
                                        <td data-title="Consume Remark">
                                            <input
                                                placeholder="Consume Remark"
                                                type="text"
                                                className="form-control"
                                                value={row?.ConsumeRemark || ""}
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        index,
                                                        "ConsumeRemark",
                                                        e.target.value,
                                                        "",
                                                    )
                                                }
                                            />
                                        </td>
                                        <td data-title="Action">
                                            <input
                                                type="checkbox"
                                                checked={row?.Print === 1}
                                                name="Print"
                                                onChange={(e) =>
                                                    handleCheckboxSingle(e, index)
                                                }
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Tables>
                    </div>
                </div>
            )}
        </>
    );
};

export default ConsumeStoreItem;
