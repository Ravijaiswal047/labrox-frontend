import React, { useEffect, useState } from "react";
import Heading from "../../../../components/UI/Heading";
import { ViewMenu } from "../../../../components/SvgIcons";
import ILCFrameMenu from "../ILCFrameMenu";
import { useTranslation } from "react-i18next";
import CustomTable from "../../../../components/Table/CustomTable";
import { CustomButton, SaveButton } from "../../../../components/UI/CustomButton";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import Accordion from "../../../../components/UI/Accordion";
import { SelectBoxWithCheckbox } from "../../../../components/formComponent/MultiSelectBox";
import { toast } from "react-toastify";
import { axiosInstance } from "../../../../utils/axiosInstance";

const ILCSchedule = () => {
    const { t } = useTranslation();
    const [showMore, setShowMore] = useState(false);
    const [centreData, setCentreData] = useState([]);
    const [formData, setFormData] = useState({
        SelectTypes: "",
        CentreId: "",
        FromDay: "",
        ToDay: "",
        ScheduleType: "ILC_REG",
    });

    const handleSelectChange = (name, value) => {
        setFormData((prev) => ({
            ...prev,
            [name]: value?.value,
        }));
    };

    const handleRadioChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };


    const handleReset = () => {
        setFormData({
            SelectTypes: "",
            CentreId: "",
            FromDay: null,
            ToDay: null,
            ScheduleType: "ILC_REG",
        });
    };

    const dayOptions = Array.from({ length: 31 }, (_, i) => ({
        label: (i + 1).toString(),
        value: (i + 1).toString(),
    }));

    const tableData = [
        {
            labCode: "PHQ",
            processingLab: "Pathcare Labs-HQ",
            scheduleType: "ILC Registration",
            fromDay: 1,
            toDay: 17,
            entryDate: "03-Feb-2022",
            entryBy: "ITDOSE",
        },
        {
            labCode: "ALN",
            processingLab: "AP-Andhra Labs-Guntur",
            scheduleType: "EQAS Registration",
            fromDay: 1,
            toDay: 28,
            entryDate: "18-Aug-2025",
            entryBy: "ITDOSE",
        },
    ];

    const columns = [
        { header: "Sr No.", field: "srNo", width: "5%" },
        { header: "Lab Code", field: "labCode" },
        { header: "Processing Lab", field: "processingLab" },
        { header: "Schedule Type", field: "scheduleType" },
        { header: "From Date", field: "fromDay" },
        { header: "To Date", field: "toDay" },
        { header: "Entry Date", field: "entryDate" },
        { header: "Entry By", field: "entryBy" },
    ];

    const handleSelectMultiChange = (select, name) => {
        const val = select?.map((ele) => ele?.value) || [];
        const labels = select?.map((ele) => ele?.label) || [];

        setFormData({ ...formData, [name]: val });
    };

    const getAccessCentres = async () => {
            try {
                const res = await axiosInstance.get("CommonController/GetAccessProcessingLab");
                if (res?.data?.success && Array.isArray(res?.data?.message)) {
                    setCentreData(
                        res?.data?.message?.map((c) => ({
                            value: c.centreid,
                            label: c.centre,
                        }))
                    )
                }
                else {
                    setCentreData([]);
                    toast.error("Failed to load centres");
                }
    
            } catch {
                toast.error("Failed to load centres");
            }
        };

    useEffect(()=> {
        getAccessCentres();
    },[]);

    console.log("formData",formData);

    return (
        <>
            {showMore && <ILCFrameMenu />}

            <div className="card">
                <Heading
                    name={"ILC Schedule"}
                    isBreadcrumb={true}
                    secondTitle={
                        <label onClick={() => setShowMore((prev) => !prev)}>
                            <ViewMenu />
                        </label>
                    }
                />

                <div className="row p-2">
                    {/* Processing Lab */}
                    <div className="col-sm-2">
                        <SelectBoxWithCheckbox
                            name="CentreId"
                            id="CentreId"
                            className="required-fields"
                            label={t("Select Processing Lab")}
                            onChange={handleSelectMultiChange}
                            options={centreData}
                            value={formData.CentreId}
                            // isDisabled={isHeaderLocked}
                        />
                    </div>
                    <ReactSelect
                        respclass="col-xl-2"
                        label="From Day(Month)"
                        name="FromDay"
                        dynamicOptions={dayOptions}
                        removeIsClearable={true}
                        value={formData.FromDay}
                        placeholderName="Select From Day"
                        onChange={handleSelectChange}
                    />

                    <ReactSelect
                        respclass="col-xl-2"
                        label="To Day(Month)"
                        name="ToDay"
                        dynamicOptions={dayOptions}
                        removeIsClearable={true}
                        value={formData.ToDay}
                        placeholderName="Select To Day"
                        onChange={handleSelectChange}
                    />

                    {/* <div className="col-xl-12 mt-3"> */}
                    <div className="d-flex align-items-center gap-3 flex-wrap ml-2">
                        <label className="fw-bold mb-0">Schedule Type :</label>

                        <input
                            type="radio"
                            //  label="ILC Registration"
                            name="ScheduleType"
                            value="ILC_REG"
                            checked={formData.ScheduleType === "ILC_REG"}
                            onChange={handleRadioChange}
                            className="ml-1"
                        />
                        <label className="mt-2 ml-1">ILC Registration</label>

                        <input
                            type="radio"
                            label="ILC Result"
                            name="ScheduleType"
                            value="ILC_RES"
                            checked={formData.ScheduleType === "ILC_RES"}
                            onChange={handleRadioChange}
                            className="ml-1"
                        />
                        <label className="mt-2 ml-1">ILC Result</label>

                        <input
                            type="radio"
                            label="EQAS Registration"
                            name="ScheduleType"
                            value="EQAS_REG"
                            checked={formData.ScheduleType === "EQAS_REG"}
                            onChange={handleRadioChange}
                            className="ml-1"
                        />
                        <label className="mt-2 ml-1">EQAS Registration</label>

                        <input
                            type="radio"
                            label="EQAS Result"
                            name="ScheduleType"
                            value="EQAS_RES"
                            checked={formData.ScheduleType === "EQAS_RES"}
                            onChange={handleRadioChange}
                            className="ml-1"
                        />
                        <label className="mt-2 ml-1">EQAS Result</label>

                        <div className="ml-4">
                            <SaveButton text="Save" onClick={() => console.log(formData)} />
                            <CustomButton icon="refresh" text="Reset" className="ml-2" onClick={handleReset} />
                        </div>
                    </div>

                    {/* </div> */}
                </div>
            </div>

            <Accordion title={"Search Data"} defaultValue={"true"}
                // seconTitle={<div>
                //     <input
                //         type="text"
                //         placeholder="Search Data"
                //         onClick={(e) => e.stopPropagation()}
                //     />
                // </div>}
            >
                <CustomTable
                    columns={columns}
                    data={tableData.map((item, index) => ({
                        ...item,
                        srNo: index + 1,
                    }))}
                />
            </Accordion>
        </>
    );
};

export default ILCSchedule;