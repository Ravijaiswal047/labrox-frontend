import React, { useEffect, useState } from "react";
import Heading from "../../../../components/UI/Heading";
import { ViewMenu } from "../../../../components/SvgIcons";
import ILCFrameMenu from "../ILCFrameMenu";
import { useTranslation } from "react-i18next";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import { toast } from "react-toastify";
import { axiosInstance } from "../../../../utils/axiosInstance";
import { SearchButton } from "../../../../components/UI/CustomButton";
import DatePicker from "../../../../components/formComponent/DatePicker";
import { apiUrls } from "../../../../utils/apiUrls";
import { months, years } from "../../../../utils/Constants";

const ILCResultApproval = () => {
    const { t } = useTranslation();
    const date = new Date();

    const [showMore, setShowMore] = useState(false);
    const [centreData, setCentreData] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [labOptions, setLabOptions] = useState([]);

    const [formData, setFormData] = useState({
        CentreId: "",
        LabType: "",
        month: date.getMonth() + 1,
        year: date.getFullYear().toString(),
        // IsActive: "1",
    });

    const getILCLab = async (CentreId) => {
            console.log("Centre", CentreId);
            axiosInstance
                .get(apiUrls?.BindILCRegisteration,
                    {
                        params: {
                            ProcessingCentre: CentreId?.toString() || "", // or string value
                        },
                    }
                )
                .then((res) => {
                    console.log("Bind ILC", res);
                    if (res?.data?.success) {
                        const val = res?.data?.message?.map((c) => ({
                            value: c.labid,
                            label: c.labname,
                        }))
                        setLabOptions(val);
                    }
                    else {
                        setLabOptions([]);
                    }
                })
                .catch((err) => {
                    toast.error(
                        err?.data?.message
                            ? err?.data?.message
                            : "Error Occured",
                    );
                })
                .finally(() => {
    
                });
        }
    

    
    const getAccessCentres = async () => {
        try {
            const res = await axiosInstance.get("CommonController/GetAccessProcessingLab");
            if (res?.data?.success && Array.isArray(res?.data?.message)) {
                setCentreData(
                    res?.data?.message?.map((c) => ({
                        value: c.centreid,
                        label: c.centre,
                    }))
                );
                console.log("res?.data?.message[0]?.centerid", res?.data?.message[0]?.centerid);
                getILCLab(res?.data?.message[0]?.centreid);
            }
        } catch (error) {
            toast.error("Failed to load centres");
        }
    };

  
    const fetchILCResults = async () => {
        if (!formData.CentreId || !formData.LabType) {
            toast.warn("Please select Centre and Lab Type");
            return;
        }

        const payload = {
            CentreId: formData.CentreId.value,
            LabType: formData.LabType.value,
            IsActive: formData.IsActive,
        };

        try {
            setLoading(true);
            const res = await axiosInstance.post(
                "ILC/GetILCResultApproval",
                payload
            );
            setTableData(res.data.message || []);
        } catch (error) {
            toast.error("Failed to fetch ILC results");
        } finally {
            setLoading(false);
        }
    };
  
    const handleSelectChange = (name, value) => {
        setFormData((prev) => ({
            ...prev,
            [name]: value?.value,
        }));
        if (name === "CentreId") {
            getILCLab(value?.value);
            setFormData((prev) => ({
                ...prev,
                LabType: "",
            }));
        }
    };

    const handleDateChange = (value, name) => {
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    

    useEffect(() => {
        getAccessCentres();
    }, []);

    return (
        <>
            {showMore && <ILCFrameMenu />}

            <div className="card">
                <Heading
                    name="ILC Result Approval"
                    isBreadcrumb={true}
                    secondTitle={
                        <label
                            className="cursor-pointer"
                            onClick={() => setShowMore((prev) => !prev)}
                        >
                            <ViewMenu />
                        </label>
                    }
                />

              
                <div className="row p-2">
                    <ReactSelect
                        respclass="col-xl-2 col-sm-4 col-md-6 col-12"
                        dynamicOptions={centreData}
                        name="CentreId"
                        id="CentreId"
                        value={formData.CentreId}
                        placeholderName="All Center"
                        removeIsClearable={true}
                        onChange={handleSelectChange}
                    />

                    <ReactSelect
                        respclass="col-xl-2 col-sm-4 col-md-6 col-12"
                        dynamicOptions={labOptions}
                        name="LabType"
                        id="LabType"
                        value={formData.LabType}
                        placeholderName="Select ILC Lab "
                        removeIsClearable
                        onChange={handleSelectChange}
                    />

                    <div className="col-sm-2 col-md-1 col-6">
                        <ReactSelect
                            dynamicOptions={months}
                            name="month"
                            id="month"
                            removeIsClearable={false}
                            placeholderName={t("Current Month")}
                            value={formData?.month}
                            onChange={handleSelectChange}
                            className="required-fields"
                        />
                    </div>
                    <div className="col-sm-2 col-md-1 col-6">
                        <ReactSelect
                            dynamicOptions={years}
                            name="year"
                            id="year"
                            removeIsClearable={false}
                            placeholderName={t("Current year")}
                            value={formData?.year}
                            onChange={handleSelectChange}
                            className="required-fields"
                        />
                    </div>
                    <SearchButton text="Search" className=" mb-2"/>                  
                </div>            
            </div>
        </>
    );
};

export default ILCResultApproval;
