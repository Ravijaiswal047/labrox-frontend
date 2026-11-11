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

const ILCReport = () => {
    const { t } = useTranslation();
    // ilcReport
    const [showMore, setShowMore] = useState(false);
    const [centreData, setCentreData] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [loading, setLoading] = useState(false);

    
    const LabOptions = [
        { value: "ILC", label: "ILC Lab" },
        { value: "EQAS", label: "EQAS Lab" },
        { value: "INTERNAL", label: "Internal Lab" },
    ];

    const [formData, setFormData] = useState({
        CentreId: null,
        LabType: null,
        IsActive: "1",
    });

    
    const getAccessCentres = async () => {
        try {
            const res = await axiosInstance.get("Centre/getAccessCentres");
            const data = res.data.message || [];

            const formatted = data.map((c) => ({
                value: c.CentreID,
                label: c.Centre,
            }));

            setCentreData(formatted);
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
    };

    const handleDateChange = (value, name) => {
        setFormData((prev) => ({
            ...prev,
            [name]: value?.value
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
                    name="ILC Report"
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

              
                <div className="row p-2 align-items-end">
                    <ReactSelect
                        respclass="col-xl-2 col-sm-4 col-md-6 col-12"
                        dynamicOptions={LabOptions}
                        name="LabType"
                        id="LabType"
                        value={formData.LabType}
                        placeholderName="Select Proccessing Lab "
                        removeIsClearable
                        onChange={handleSelectChange}
                    />
                    <div className="col-sm-2">
                    <DatePicker
                        name="ConsumptionMonth"
                        id="ConsumptionMonth"
                        lable={t("Select Month & Year")}
                        //value={payload.ConsumptionMonth}
                        onChange={handleDateChange}
                        view="month"
                        dateFormat="mm/yy"
                        placeholder="MM/YYYY"
                    />
                </div>

                    <SearchButton text="Search" className=" mb-2"/>


                    
                </div>

              
                
            </div>
        </>
    );
};

export default ILCReport;
