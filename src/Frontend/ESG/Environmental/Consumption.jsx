import { useEffect, useState } from "react"
import ReactSelect from "../../../components/formComponent/ReactSelect"
import { useTranslation } from "react-i18next"
import DatePicker from "../../../components/formComponent/DatePicker"
import Input from "../../../components/formComponent/Input"
import { CustomButton, SaveButton } from "../../../components/UI/CustomButton"
import { toast } from "react-toastify"
import { axiosInstance } from "../../../utils/axiosInstance"
import moment from "moment"

const Consumption = ({ editData, setEditData }) => {
    const [t] = useTranslation()
    const [centre, setCentre] = useState([])
    const [loading, setLoading] = useState(false)

    const [payload, setPayload] = useState({
        CentreId: "",
        ConsumptionType: "ELECTRICITY",
        ConsumptionMonth: "",
        Units: "",
        UnitType: "",
        OtherUnit: "",
        IsActive: 1,
    })

    const consumptionTypeOptions = [
        { label: "Electricity", value: "ELECTRICITY" },
        { label: "Water", value: "WATER" }
    ]

    const unitOptions =
        payload.ConsumptionType === "WATER"
            ? [
                { label: "Liters", value: "LITERS" },
                { label: "Tons", value: "TONS" },
                { label: "Other", value: "OTHER" },
            ]
            : [
                { label: "KWH", value: "KWH" },
                { label: "Ampere", value: "AMPERE" },
                { label: "Units", value: "UNITS" },
                { label: "Other", value: "OTHER" },
            ];

    const getAccessCentres = async () => {
        try {
            const res = await axiosInstance.get("Centre/getAccessCentres");
            const data = res.data.message;
            const CentreDataValue = data.map((ele) => {
                return {
                    value: ele.CentreID,
                    label: ele.Centre,
                };
            });
            let allValues = CentreDataValue.map((ele) => ele.value);
            setCentre(CentreDataValue);
        } catch (error) {
            console.log("Error while fetching centres");
        }
    };

    useEffect(() => {
        getAccessCentres()
    }, [])

    useEffect(() => {
        if (editData) {
            setPayload({
                Id: editData.Id,
                CentreId: editData.CentreId,
                ConsumptionType: editData.ConsumptionType,
                ConsumptionMonth: new Date(editData.ConsumptionMonth),
                Units: editData.Units,
                IsActive: editData.IsActive,
                UnitType: editData.UnitType || "",
                OtherUnit: editData.OtherUnitType || "",
            });
        }
    }, [editData]);

    console.log("Payload data", payload)

    // const handleReactSelectChange = (name, value) => {
    //     setPayload((prev) => ({
    //         ...prev,
    //         [name]: value?.value
    //     }))
    // }
    const handleReactSelectChange = (name, value) => {
        setPayload((prev) => {
            if (name === "ConsumptionType") {
                return {
                    ...prev,
                    ConsumptionType: value?.value,
                    UnitType: "",
                    OtherUnit: "",
                };
            }

            if (name === "UnitType") {
                return {
                    ...prev,
                    UnitType: value?.value,
                    OtherUnit: value?.value === "OTHER" ? prev.OtherUnit : "",
                };
            }

            return {
                ...prev,
                [name]: value?.value,
            };
        });
    };
    const handleDateChange = (value, name) => {
        setPayload((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleToggle = (field) => {
        setPayload((prev) => ({
            ...prev,
            [field]: prev[field] === 1 ? 0 : 1,
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPayload({ ...payload, [name]: value });
    };

    
    const handleSave = async () => {
       const { CentreId, ConsumptionMonth, Units, ConsumptionType } = payload;
        
        if (!ConsumptionType) {
            toast.error(t("Please select a Consumption Type"));
            return 
        }
        if (!CentreId) {
            toast.error(t("Please select a Centre"));
            return
        }
        if (!ConsumptionMonth) {
            toast.error(t("Please select a Month and Year"));
            return
        }
        if (!Units || Units <= 0) {
            toast.error(t("Please enter valid Units (greater than 0)"));
            return
        }
        if (!payload.UnitType) {
            toast.error(t("Please select a Unit Type"));
            return;
        }
        if (
            payload.UnitType === "OTHER" &&
            !payload.OtherUnit?.trim()
        ) {
            toast.error(t("Please enter Other Unit"));
            return;
        }

        setLoading(true);
        const finalPayload = {
            id: payload.Id || 0,
            centreId: payload.CentreId,
            consumptionType: payload.ConsumptionType, 
            consumptionMonth: payload.ConsumptionMonth,
            units: payload.Units,
            isActive: payload.IsActive,
            unitType: payload.UnitType,
            otherUnitType: payload.UnitType === "OTHER" ? payload.OtherUnit : "",
        }

        try {
            const res = await axiosInstance.post("ESG/AddOrUpdateUtilityConsumption_esg", finalPayload);
            const data = res?.data;
            if (data?.success) {
                toast.success(`${payload.ConsumptionType === "ELECTRICITY" ? "Electricity" : "Water"} data ${editData ? "updated" : "added"}.`)
                setEditData(null);

                setPayload({
                    CentreId: "",
                    ConsumptionType: "ELECTRICITY",
                    ConsumptionMonth: "",
                    Units: "",
                    IsActive: 1,
                    UnitType: "",
                    OtherUnit: "",
                })
            } else {
                toast.error(data?.message || "Error while adding data")
            }
        } catch (error) {
            console.log("Error while adding data", error)

        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <div className="row px-2 py-2">
                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <ReactSelect
                        dynamicOptions={consumptionTypeOptions}
                        name="ConsumptionType"
                        lable={t("Consumption Type")}
                        id="ConsumptionType"
                        removeIsClearable={true}
                        placeholderName={t("Consumption Type")}
                        value={payload.ConsumptionType}
                        onChange={handleReactSelectChange}
                    />
                </div>
                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <ReactSelect
                        dynamicOptions={centre}
                        name="CentreId"
                        lable={t("Centre")}
                        id="CentreId"
                        removeIsClearable={true}
                        placeholderName={t("Select Centre")}
                        value={payload.CentreId}
                        onChange={handleReactSelectChange}
                    />
                </div>
                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <DatePicker
                        name="ConsumptionMonth"
                        id="ConsumptionMonth"
                        lable={t("Select Month & Year")}
                        value={payload.ConsumptionMonth}
                        className="custom-calendar"
                        onChange={handleDateChange}
                        view="month"
                        dateFormat="M/yy"
                        placeholder="MM/YYYY"
                    />
                </div>
                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <Input
                        className="select-input-box form-control input-sm"
                        type="number"
                        name="Units"
                        id="Units"
                        lable={"Consumption"}
                        value={payload.Units}
                        onChange={handleChange}
                    />
                </div>
                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <ReactSelect
                        dynamicOptions={unitOptions}
                        name="UnitType"
                        lable={t("Unit Type")}
                        id="UnitType"
                        removeIsClearable={true}
                        placeholderName={t("Select Unit")}
                        value={payload.UnitType}
                        onChange={handleReactSelectChange}
                    />
                </div>
                {payload.UnitType === "OTHER" && (
                    <div className="col-12 col-sm-6 col-md-2 my-1">
                        <Input
                            className="select-input-box form-control input-sm"
                            type="text"
                            name="OtherUnit"
                            id="OtherUnit"
                            lable={"Other Unit"}
                            value={payload.OtherUnit}
                            onChange={handleChange}
                        />
                    </div>
                )}
                <div className="col-auto d-flex align-items-center justify-content-center p-2" style={{
                    gap: "5px"
                }}>
                    <label class="switch mb-0">
                        <input
                            type="checkbox"
                            checked={payload.IsActive === 1}
                            onChange={() => handleToggle("IsActive")}
                        />
                        <span class="slider"></span>
                    </label>
                    <strong>
                        <span>{t("IsActive")}</span>
                    </strong>
                </div>
                <div className="col-12 col-sm-6 col-md-2 my-1">
                    <CustomButton
                       text={editData ? t("Update") : t("Save")}
                       icon={editData ? t("edit") : t("save")}
                        onClick={handleSave}
                        disabled={loading}
                    />
                </div>
            </div>
        </>
    )
}

export default Consumption