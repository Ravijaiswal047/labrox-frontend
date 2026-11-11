import React, { useEffect, useState } from 'react'
import Heading from '../../../components/UI/Heading'
import { useTranslation } from 'react-i18next'
import ReactSelect from '../../../components/formComponent/ReactSelect'
import { axiosInstance } from '../../../utils/axiosInstance'
import Input from '../../../components/formComponent/Input'
import DatePicker from '../../../components/formComponent/DatePicker'
import { getDesignationData } from '../../../utils/NetworkApi/commonApi'
import { CustomButton, SaveButton } from '../../../components/UI/CustomButton'
import AutoComplete from '../../../components/formComponent/AutoComplete'
import { autocompleteOnBlur } from '../../../utils/helpers'
import { toast } from 'react-toastify'
import { useNavigate, useLocation } from 'react-router-dom'

const HubMaster = () => {
    const [t] = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const [centre, setCentre] = useState([]);
    const [businessZoneOptions, setBusinessZoneOptions] = useState([]);
    const [stateOptions, setStateOptions] = useState([]);
    const [cityOptions, setCityOptions] = useState([]);
    const [designationOptions, setDesignationOptions] = useState([]);
    const [allSearchCenters, setAllSearchCenters] = useState([]);
    const [searchCenterPayload, setSearchCenterPayload] = useState({
        label: "",
        value: null,
        DefaultCentreId: null,
    });
      const [moreErrors, setMoreErrors] = useState({});
    const [searchCenterSuggestions, setSearchCenterSuggestions] = useState([]);
    const [selectSearchCenter, setSelectSearchCenter] = useState(false);
    const [searchCenterIndex, setSearchCenterIndex] = useState(null);
      const [centreAndRateDetails, setCentreAndRateDetails] = useState({})

    const initialPayload = {
        dataType: "HUB",
        centreId: 0,
        centreName: "",
        centreCode: "",
        latitude: "",
        longitude: "",
        isActive: 1,
        address: "",
        businessZoneId: 0,
        businessZone: "",
        stateId: 0,
        state: "",
        cityId: 0,
        city: "",
        pincode: "",
        landlineNo: "",
        mobile: "",
        email: "",
        agreementFromDate: new Date().toISOString(),
        agreementToDate: new Date().toISOString(),
        contactName: "",
        contactMobile: "",
        contactEmail: "",
        contactDesignation: "",
    }
    const [payload, setPayload] = useState(initialPayload);

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
            setCentre(CentreDataValue);
        } catch (error) {
            console.log("Error while fetching centres");
        }
    };

    const GetBusinessZone = () => {
        return axiosInstance
            .get("CommonController/GetBusinessZone")
            .then((res) => {
                const data = res?.data?.data || [];
                const options = data.map((item) => ({
                    value: item.BusinessZoneID,
                    label: item.BusinessZoneName,
                }));
                setBusinessZoneOptions(options);
                return options;
            })
            .catch((err) => {
                console.error("API Error:", err);
                return [];
            });
    };

    const GetStateWiseData = (businessZoneId) => {
        return axiosInstance
            .post(`CommonController/GetStateWiseData?BusinessZoneID=${businessZoneId}`)
            .then((res) => {
                const data = res?.data?.data || [];
                const options = data.map((item) => ({
                    value: item.ID,
                    label: item.State
                }));
                setStateOptions(options);
                return options;
            })
            .catch((err) => {
                console.error("API Error:", err);
                return [];
            });
    };

    const GetCityData = (stateId) => {
        return axiosInstance
            .post(`CommonController/GetStateWiseCityData?StateID=${stateId}`)
            .then((res) => {
                const data = res?.data?.data || [];
                const options = data.map((item) => ({
                    value: item.ID,
                    label: item.City
                }));
                setCityOptions(options);
                return options;
            })
            .catch((err) => {
                console.log("City API Error:", err);
                return [];
            });
    };

    useEffect(() => {
        getAccessCentres();
        GetBusinessZone();
        getDesignationData(setDesignationOptions, true);
    }, [])

    const handleReactSelectChange = (name, value) => {
        setPayload((prev) => ({
            ...prev,
            [name]: value?.value
        }))
        if (name === "businessZoneId") {
            GetStateWiseData(value?.value);
        } else if (name === "stateId") {
            GetCityData(value?.value);
        }
    }
    const handleChange = (e) => {
        const { name, value } = e.target;
        setPayload((prev) => ({ ...prev, [name]: value }));
    };

    const handleToggle = (field) => {
        setPayload((prev) => ({
            ...prev,
            [field]: prev[field] === 1 ? 0 : 1,
        }));
    };
    const handleDateChange = (value, name) => {
        setPayload((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const getCentersWithParams = (params) => {
        axiosInstance
            .get("Global/getGlobalBusinessUnit", { params }) 
            .then((res) => {
                let data = res.data.message;
                console.log("res.data.message", data);
                let centers = data.map((ele) => {
                    const fullName = `${ele?.Centre?.trim() ? ele.Centre : ""}`
                        + `${ele?.CentreId ? `${ele?.Centre?.trim() ? ", " : ""}CentreId :${ele.CentreId}` : ""}`
                        + `${ele?.CentreCode?.trim() ? `, CentreCode :${ele.CentreCode}` : ""}`
                    const cleanedFullName = fullName.trim() ? fullName : `CentreId :${ele.CentreId}`;
                    return {
                        value: ele?.CentreId,
                        label: ele?.Centre?.trim() || "",
                        active: ele?.IsActive,
                        fullName: cleanedFullName,
                    };
                });
                setAllSearchCenters(centers);
                setSearchCenterSuggestions(centers);
            })
            .catch((err) => console.log(err));
    };

    const handleSearchCenterChange = (e) => {
        const value = e.target.value;
        setSearchCenterPayload({
            label: value,
            value: null,
            DefaultCentreId: null,
        });

        if (!value.trim()) {

            setSelectSearchCenter(false);
            setSearchCenterSuggestions(allSearchCenters); // reset to full list
        } else {

            const lowerValue = value.toLowerCase();
            const filtered = allSearchCenters.filter((c) =>
                (c.label?.toLowerCase().includes(lowerValue)) ||
                (c.fullName?.toLowerCase().includes(lowerValue)) ||
                (c.value?.toString().includes(lowerValue))
            );
            setSearchCenterSuggestions(filtered);
            setSelectSearchCenter(true);
            setSearchCenterIndex(0);
        }
    };

      const handleSearchCenterKeyDown = (e) => {

        if (!selectSearchCenter || searchCenterSuggestions.length === 0) return;

        if (e.key === "ArrowUp") {
        setSearchCenterIndex((prev) =>
            prev > 0 ? prev - 1 : searchCenterSuggestions.length - 1,
        );
        } else if (e.key === "ArrowDown") {
        setSearchCenterIndex((prev) =>
            prev === searchCenterSuggestions.length - 1 ? 0 : prev + 1,
        );
        } else if (e.key === "Enter") {
        handleSearchCenterSelect(searchCenterSuggestions[searchCenterIndex]);
        setSearchCenterIndex(0);
        }
    };

    const handleSearchCenterSelect = async (selected, businessZones) => {
        if (!selected) return;
    
        setSearchCenterPayload(selected);
        setSelectSearchCenter(false);
        setMoreErrors({});

        try {
            const res = await axiosInstance.post("Centre/GetHUBData", {
                centreType: "",
                centreName: "",
                centreCode: "",
                dataType: "HUB",
                centreId: selected?.value.toString() || "",
            });
            
            if (res.data.success && res.data.message?.length > 0) {
                const data = res.data.message[0];
                setCentreAndRateDetails(data);
                
                // Map basic fields
                const newPayload = {
                    ...initialPayload,
                    dataType: "HUB",
                    centreId: data.CentreID,
                    centreName: data.Centre,
                    centreCode: data.CentreCode,
                    latitude: data.Latitude || "",
                    longitude: data.Longitude || "", 
                    isActive: data.isActive,
                    address: `${data.Address1 || ""}${data.Address2 ? " " + data.Address2 : ""}`.trim(),
                    pincode: data.Pincode,
                    landlineNo: data.LandLineNo,
                    mobile: data.Phone, 
                    email: data.Email,
                    agreementFromDate: data.ContractFromDate && new Date(data.ContractFromDate),
                    agreementToDate: data.ContractToDate && new Date(data.ContractToDate),
                    contactName: data.ContactPerson || "",
                    contactMobile: data.ContactPersonMobile || "",
                    contactEmail: data.ContactPersonEmail || "",
                    contactDesignation: data.DesignationId || "", 
                };

                // Handle Business Zone
                const bZones = businessZones || businessZoneOptions;
                const bZone = bZones.find(opt => opt.label === data.BusinessZone);
                if (bZone) {
                    newPayload.businessZoneId = bZone.value;
                    newPayload.businessZone = bZone.label;

                    // Fetch States
                    const stateOpts = await GetStateWiseData(bZone.value);
                    const stateObj = stateOpts.find(opt => opt.label === data.State);
                    
                    if (stateObj) {
                        newPayload.stateId = stateObj.value;
                        newPayload.state = stateObj.label;

                        // Fetch Cities
                        const cityOpts = await GetCityData(stateObj.value);
                        const cityObj = cityOpts.find(opt => opt.label === data.City);
                        
                        if (cityObj) {
                            newPayload.cityId = cityObj.value;
                            newPayload.city = cityObj.label;
                        }
                    }
                }
                
                setPayload(newPayload);
            } else {
                toast.info("No Data found");
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch center details");
        }
    };

    useEffect(() => {
        getCentersWithParams({
            Datatype: "HUB",
            InvoiceBillingCycle: "",
            PaymentMode: "",
            IsActive: 0
        });
    }, []);

    useEffect(() => {
        if (location.state?.data) {
            const { CentreID, Centre } = location.state.data;
            if (CentreID) {
                GetBusinessZone().then((bZones) => {
                    handleSearchCenterSelect({ value: CentreID, label: Centre }, bZones);
                });
            }
        }
    }, [location.state]);

    const handleSubmit = async () => {
        const businessZoneName = businessZoneOptions.find(item => item.value === payload.businessZoneId)?.label;
        const cityName = cityOptions.find(item => item.value === payload.cityId)?.label;
        const stateName = stateOptions.find(item => item.value === payload.stateId)?.label;
        const finalPayload = {
            ...payload,
            contactDesignation: String(payload.contactDesignation),
            city: cityName,
            state: stateName,
            businessZone: businessZoneName,
        }
        try {
            const res = await axiosInstance.post("Centre/SaveOrUpdateHubAsync", finalPayload);
            if(res?.data?.success) {
                toast.success(res?.data?.message);
                setPayload(initialPayload);
                setSearchCenterPayload({
                    label: "",
                    value: null,
                    DefaultCentreId: null,
                })
            }
            else {
                toast.error(res?.data?.message);
            }
        } catch (error) {
            console.log(error);
        }
    }

    const handleReset = () => {
        setPayload(initialPayload);
        setSearchCenterPayload({
            label: "",
            value: null,
            DefaultCentreId: null,
        })
    }

    return (
        <>
            <Heading
                title={t("Hub Master")}
            />
            <div className="bg-white">
                <div className="col-12">
                    <>
                        <div className="col-sm-5">
                            <Input
                                type="text"
                                name="SearchCenter"
                                lable="Search Any Centre For Update"
                                value={searchCenterPayload.label || ""}
                                placeholder=" "
                                onChange={handleSearchCenterChange}
                                onKeyDown={handleSearchCenterKeyDown}
                                onBlur={(e) => {
                                    autocompleteOnBlur(setSearchCenterSuggestions);
                                    setTimeout(() => {
                                        const data = searchCenterSuggestions?.filter(
                                            (ele) => ele?.label === e.target.value,
                                        );
                                        if (data.length === 0) {
                                            setSearchCenterPayload({
                                                label: "",
                                                value: null,
                                                DefaultCentreId: null,
                                            });
                                        }
                                    }, 500);
                                }}
                            />

                            {selectSearchCenter && searchCenterSuggestions.length > 0 && (
                                <AutoComplete
                                    selects={selectSearchCenter}
                                    test={searchCenterSuggestions.map((item) => ({
                                        TestName: item.fullName,
                                        active: item.active,
                                    }))}
                                    handleListSearch={(selected) =>
                                        handleSearchCenterSelect(
                                            searchCenterSuggestions.find(
                                                (item) => item.fullName === selected.TestName,
                                            ),
                                        )
                                    }
                                    indexMatch={searchCenterIndex}
                                />
                            )}
                        </div>
                    </>
                    <div className="row px-2 py-2 d-flex align-items-center">
                        <div className="col-sm-2">
                            <Input
                                className="select-input-box form-control input-sm"
                                type="text"
                                name="centreName"
                                id="centreName"
                                lable={t("Centre Name")}
                                value={payload.centreName}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="col-sm-2">
                            <Input
                                className="select-input-box form-control input-sm"
                                type="text"
                                name="centreCode"
                                id="centreCode"
                                lable={t("Centre Code")}
                                value={payload.centreCode}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="col-sm-2">
                            <Input
                                className="select-input-box form-control input-sm"
                                type="text"
                                name="latitude"
                                id="latitude"
                                lable={t("Latitude")}
                                value={payload.latitude}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="col-sm-2">
                            <Input
                                className="select-input-box form-control input-sm"
                                type="text"
                                name="longitude"
                                id="longitude"
                                lable={t("Longitude")}
                                value={payload.longitude}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="col-auto d-flex align-items-center justify-content-center p-2" style={{
                            gap: "5px"
                        }}>
                            <label class="switch mb-0">
                                <input
                                    type="checkbox"
                                    checked={payload.isActive == 1}
                                    onChange={() => handleToggle("isActive")}
                                />
                                <span class="slider"></span>
                            </label>
                            <strong>
                                <span>{t("IsActive")}</span>
                            </strong>
                        </div>
                    </div>
                </div>
            </div>
            <Heading
                title={t("Address Details")}
            />
            <div className="bg-white">
                <div className="col-12">
                    <div className="row px-2 py-2">
                        <div className="col-sm-2">
                            <ReactSelect
                                dynamicOptions={businessZoneOptions}
                                name="businessZoneId"
                                lable={t("Business Zone")}
                                id="businessZoneId"
                                removeIsClearable={true}
                                placeholderName={t("Select Business Zone")}
                                value={payload.businessZoneId}
                                onChange={handleReactSelectChange}
                            />
                        </div>
                        <div className="col-sm-2">
                            <ReactSelect
                                dynamicOptions={stateOptions}
                                name="stateId"
                                lable={t("State")}
                                id="stateId"
                                removeIsClearable={true}
                                placeholderName={t("Select State")}
                                value={payload.stateId}
                                onChange={handleReactSelectChange}
                            />
                        </div>
                        <div className="col-sm-2">
                            <ReactSelect
                                dynamicOptions={cityOptions}
                                name="cityId"
                                lable={t("City")}
                                id="cityId"
                                removeIsClearable={true}
                                placeholderName={t("Select City")}
                                value={payload.cityId}
                                onChange={handleReactSelectChange}
                            />
                        </div>
                        <div className="col-sm-2">
                            <Input
                                className="select-input-box form-control input-sm"
                                type="text"
                                name="address"
                                id="address"
                                lable={t("Address")}
                                value={payload.address}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="col-sm-2">
                            <Input
                                className="select-input-box form-control input-sm"
                                type="text"
                                name="pincode"
                                id="pincode"
                                lable={t("Pincode")}
                                value={payload.pincode}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="col-sm-2">
                            <Input
                                className="select-input-box form-control input-sm"
                                type="text"
                                name="landlineNo"
                                id="landlineNo"
                                lable={t("Landline No")}
                                value={payload.landlineNo}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="col-sm-2">
                            <Input
                                className="select-input-box form-control input-sm"
                                type="text"
                                name="mobile"
                                id="mobile"
                                lable={t("Mobile")}
                                value={payload.mobile}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="col-sm-2">
                            <Input
                                className="select-input-box form-control input-sm"
                                type="text"
                                name="email"
                                id="email"
                                lable={t("Email")}
                                value={payload.email}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="col-sm-2">
                            <DatePicker
                                name="agreementFromDate"
                                id="agreementFromDate"
                                lable={t("Agreement From Date")}
                                value={payload.agreementFromDate}
                                onChange={handleDateChange}
                            />
                        </div>
                        <div className="col-sm-2">
                            <DatePicker
                                name="agreementToDate"
                                id="agreementToDate"
                                lable={t("Agreement To Date")}
                                value={payload.agreementToDate}
                                onChange={handleDateChange}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <Heading
                title={t("Contact Person Details")}
            />
            <div className="bg-white">
                <div className="col-12">
                    <div className="row px-2 py-2">
                        <div className="col-sm-2">
                            <Input
                                className="select-input-box form-control input-sm"
                                type="text"
                                name="contactName"
                                id="contactName"
                                lable={t("Contact Name")}
                                value={payload.contactName}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="col-sm-2">
                            <Input
                                className="select-input-box form-control input-sm"
                                type="text"
                                name="contactMobile"
                                id="contactMobile"
                                lable={t("Contact Mobile")}
                                value={payload.contactMobile}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="col-sm-2">
                            <Input
                                className="select-input-box form-control input-sm"
                                type="text"
                                name="contactEmail"
                                id="contactEmail"
                                lable={t("Contact Email")}
                                value={payload.contactEmail}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="col-sm-2">
                            <ReactSelect
                                dynamicOptions={designationOptions}
                                name="contactDesignation"
                                lable={t("Contact Designation")}
                                id="contactDesignation"
                                removeIsClearable={true}
                                placeholderName={t("Select Contact Designation")}
                                value={payload.contactDesignation}
                                onChange={handleReactSelectChange}
                            />
                        </div>
                    </div>
                    <div className="d-flex justify-content-center align-items-center px-2 py-2"
                        style={{ gap: "10px" }}
                    >
                        <CustomButton
                            icon={"back"}
                            text={t("Main List")}
                            onClick={() => navigate("/HubMasterList")}
                        />
                        <CustomButton
                            icon={"refresh"}
                            text={t("Reset")}
                            onClick={handleReset}
                        />
                        <SaveButton
                            text={payload.centreId ? t("Update") : t("Save")}
                            onClick={handleSubmit}
                        />
                    </div>
                </div>
            </div>
        </>
    )
}

export default HubMaster