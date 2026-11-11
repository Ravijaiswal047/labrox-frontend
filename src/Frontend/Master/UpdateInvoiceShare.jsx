import { useEffect,useState } from "react";
import moment from "moment";
import Accordion from "../../components/UI/Accordion";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { t } from "i18next";
import { useTranslation } from "react-i18next";
import DatePicker from "../../components/formComponent/DatePicker";
import { CustomButton } from "../../components/UI/CustomButton";
import { axiosInstance } from "../../utils/axiosInstance";
import Input from "../../components/formComponent/Input";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { toast } from "react-toastify";

const UpdateInvoiceShare = () => {
    const { t } = useTranslation();
    const [searchRateTypes, setSearchRateTypes] = useState([]);
    const [centre, setCentre] = useState([]);
    const theme = useLocalStorage("theme", "get");
    const isMobile = window.innerWidth <= 768;  
    const [payload, setPayload] = useState({
        LedgertansactionNo:"",
        CentreID: 0,
        RateTypeID: 0,
        FromDate: new Date(),
        ToDate: new Date(),
    })
    
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

    const fetchRateTypes = async (centreId, isSearch = true) => {
        try {
            const res = await axiosInstance.post("Centre/GetRateType", {
                CentreId: centreId,
            });
            const list = res?.data?.message.map((item) => ({
                label: item?.RateTypeName,
                value: item?.RateTypeID,
            }));
            if (isSearch) {
                setSearchRateTypes(list);
            } else {
                setSaveRateTypes(list);
            }
        } catch (err) {
            console.log(err);
        }
    };

    const handleSearchSelectChange = (name, value) => {
        if (name === "CentreID") {
            setPayload((prev) => ({
                ...prev,
                CentreID: value?.value,
                RateTypeID: 0
            }));
            if (value?.value) {
                fetchRateTypes([value?.value], true);
            } else {
                setSearchRateTypes([]);
            }
        } else if (name === "RateTypeID") {
            setPayload((prev) => ({
                ...prev,
                [name]: value?.value
            }));
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e?.target;
        
          setPayload((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
          }));
    
      };

    const dateSelect = (value, name) => {
        setPayload({
            ...payload,
            [name]: value,
        });
    };

    const updateBulkRateType = async () => {
        if (!payload?.CentreID || !payload?.RateTypeID) {
            toast.error(t("Please select both Business Unit and Rate Type"));
            return;
        }
        try {          
            const Payload = {
                LedgertansactionNo: String(payload.LedgertansactionNo) || "",
                newCentreId: payload.CentreID || 0,
                newRateTypeId: payload.RateTypeID || 0,
                fromDate: moment(payload.FromDate).format("YYYY-MM-DD"),
                toDate: moment(payload.ToDate).format("YYYY-MM-DD"),
            };

            const res = await axiosInstance.post("RateType/BulkUpdateRateType", Payload);

            if (res?.data?.success) {
                toast.success(res?.data?.message || "Successfully Updated !");
                console.log("updateres",res);
                
            } else {
                toast.error(res?.data?.message || t("Error while saving"));
            }
        } catch (error) {
            console.log("Error while saving Bulk Rate Type", error);
            toast.error(t("Error while saving Bulk Rate Type"));
        }
    };

    useEffect(() => {
        getAccessCentres();
    }, []);
    console.log("payload",payload);
    return (
        <>
            <Accordion
                name="Update Invoice Share"
                defaultValue={true}
                isBreadcrumb={true}
            >
                <div className="row px-2 mt-2 mb-1">
                    <div className="col-12 col-sm-6 col-md-2 my-1">
                        <Input
                            type="text"
                            placeholder=""
                            lable={t("Visit No")}
                            id="LedgertansactionNo"
                            name="LedgertansactionNo"
                            value={payload?.LedgertansactionNo}
                            onChange={handleChange}
                            maxLength={18}
                        />
                    </div>

                    <div className="col-12 col-sm-6 col-md-2 my-1">
                        <ReactSelect
                            dynamicOptions={[
                                { label: "All BusinessUnit", value: "" },
                                ...centre,
                            ]}
                            name="CentreID"
                            lable={t("BusinessUnit")}
                            id="CentreID"
                            removeIsClearable={true}
                            placeholderName={t("BusinessUnit")}
                            value={payload?.CentreID}
                            onChange={handleSearchSelectChange}
                        />
                    </div>

                    <div className="col-12 col-sm-6 col-md-2 my-1">
                        <ReactSelect
                            dynamicOptions={[
                                { label: "All RateType", value: "" },
                                ...searchRateTypes,
                            ]}
                            name="RateTypeID"
                            lable={t("RateType")}
                            id="RateType"
                            removeIsClearable={true}
                            placeholderName={t("RateType")}
                            value={payload?.RateTypeID}
                            onChange={handleSearchSelectChange}
                        />
                    </div>
                    <div className="col-12 col-sm-6 col-md-2 my-1">
                        <DatePicker
                            className="custom-calendar"
                            name="FromDate"
                            value={payload?.FromDate}
                            onChange={dateSelect}
                            placeholder={""}
                            id="FromDate"
                            lable="FromDate"
                            maxDate={new Date()}
                        />
                    </div>
                    <div className="col-12 col-sm-6 col-md-2 my-1">
                        <DatePicker
                            className="custom-calendar"
                            name="ToDate"
                            value={payload?.ToDate}
                            onChange={dateSelect}
                            placeholder=" "
                            id="ToDate"
                            lable="ToDate"
                            maxDate={new Date()}
                            minDate={new Date(payload?.FromDate)}
                        />
                    </div>
                    <div className="col-12 col-sm-6 col-md-2 my-1">
                        <CustomButton
                            label="Update"
                            text={"Update"}
                            icon={"save"}
                            onClick={updateBulkRateType}
                    />
                    </div>
                </div>
            </Accordion>

        </>
    )
}
export default UpdateInvoiceShare;