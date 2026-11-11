import React, { useState } from "react";
import Heading from "../../../../components/UI/Heading";
import { ViewMenu } from "../../../../components/SvgIcons";
import ILCFrameMenu from "../ILCFrameMenu";
import { useTranslation } from "react-i18next";
import RadioInput from "../../../../components/formComponent/RadioInput";
import { Button } from "react-bootstrap";
import CustomTable from "../../../../components/Table/CustomTable";
import { SelectBox } from "../../../../components/formComponent/SelectBox";
import Input from "../../../../components/formComponent/Input";
import { CustomButton, SaveButton } from "../../../../components/UI/CustomButton";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import Accordion from "../../../../components/UI/Accordion";
import ColorCodingSearch from "../../../../components/ModalComponent/ColorCodingSearch";

const ILCScheduleRequest = () => {
    const { t } = useTranslation();
    const [showMore, setShowMore] = useState(false);

    /* ---------- FORM STATE ---------- */
    const [formData, setFormData] = useState({
        ProcessingLabType: "",
        ProcessingLab: "",
        FromDay: "",
        ToDay: "",
        ScheduleType: "",
    });

    /* ---------- HANDLERS ---------- */
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleRadioChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            ScheduleType: e.target.value,
        }));
    };

    const handleSelectChange = (name, value) => {
        setFormData((prev) => ({
            ...prev,
            [name]: value?.value,
        }));
    };

    const colorCodingData = [
        { color: "#FFFACD", id: "1", labelKey: "Request Send" },
        { color: "#ffe58f", id: "2", labelKey: "Request Check" },
        { color: "#FFFACD", id: "3", labelKey: "Request Approved" },

    ];

    const dayOptions = Array.from({ length: 31 }, (_, i) => ({
        label: i + 1,
        value: i + 1,
    }));


    const tableData = [
        // {

        //     labCode: "PHQ",
        //     processingLab: "Pathcare Labs-HQ",
        //     scheduleType: "ILC Registration",
        //     fromDay: 1,
        //     toDay: 17,
        //     entryDate: "03-Feb-2022",
        //     entryBy: "ITDOSE",
        // },
        // {
        //     labCode: "ALN",
        //     processingLab: "AP-Andhra Labs-Guntur",
        //     scheduleType: "EQAS Registration",
        //     fromDay: 1,
        //     toDay: 28,
        //     entryDate: "18-Aug-2025",
        //     entryBy: "ITDOSE",
        // },
    ];

    const columns = [
        { header: "Sr No.", field: "srNo", width: "5%" },
        { header: "Lab Code", field: "labCode" },
        { header: "Processing Lab", field: "processingLab" },
        { header: "Schedule Type", field: "scheduleType" },
        { header: "From Date (Every Month)", field: "fromDay" },
        { header: "To Date (Every Month)", field: "toDay" },
        { header: "Entry Date", field: "entryDate" },
        { header: "Entry By", field: "entryBy" },
    ];

    return (
        <>
            {showMore && <ILCFrameMenu />}
            <div className="card">
                <Heading
                    name={"ILC Schedule Request"}
                    isBreadcrumb={true}
                    secondTitle={
                        <label onClick={() => setShowMore((prev) => !prev)}>
                            <ViewMenu />
                        </label>
                    }
                />
                <div className="row p-2 align-items-center">
                    <div className="col-xl-2 col-sm-4 col-md-6">
                        <SelectBox
                            options={[

                                { label: "AIIMSID", value: "AIIMSID" },
                                { label: "CrNo", value: "CrNo" },
                            ]

                            }
                            id="SelectTypes"
                            lable="Select Proccesing Lab"
                            // selectedValue={formData.SelectTypes}
                            name="SelectTypes"
                            onChange={handleSelectChange}
                        //isDisabled={User}
                        // className={`${CompanyID == 369 ? "required-fields" : ""}`}
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


                    <div className="col-xl-12">
                        <div className="d-flex align-items-center gap-6 flex-wrap">

                            <label className="fw-bold mb-0 mr-2">Schedule Type :</label>

                            <input
                                type="radio"
                                label="ILC Registration"
                                name="ScheduleType"
                                value="ILC_REG"
                                checked={formData.ScheduleType === "ILC_REG"}
                                onChange={handleRadioChange}
                                className="ml-1"
                            />
                            <label className="mt-2 ml-1">ILC Registration</label>

                            <input
                                type="radio"
                                label="ILC Result Entry and Approval"
                                name="ScheduleType"
                                value="ILC_RES"
                                checked={formData.ScheduleType === "ILC_RES"}
                                onChange={handleRadioChange}
                                className="ml-1"
                            />
                            <label className="mt-2 ml-1">ILC Result Entry and Approval</label>

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
                                label="EQAS Result Entry and Approval"
                                name="ScheduleType"
                                value="EQAS_RES"
                                checked={formData.ScheduleType === "EQAS_RES"}
                                onChange={handleRadioChange}
                                className="ml-1"
                            />
                            <label className="mt-2 ml-1">EQAS Result Entry and Approval</label>

                            <SaveButton text="Save" className="ml-2" />

                            <CustomButton icon="refresh" text="Reset" className="ml-2" />
                        </div>
                        {/* <div className="row ml-2">
                            <RadioInput
                                inputType="checkbox"
                                label="Request Send"
                                name="Request Send"
                                value="Request send"
                                checked={formData.ScheduleType === "Request Send"}
                                onChange={handleRadioChange}
                            />
                            <RadioInput
                                inputType="checkbox"
                                label="Request Check"
                                name="Request Check"
                                value="Request Check"
                                checked={formData.ScheduleType === "Request Check"}
                                onChange={handleRadioChange}
                            />
                            <RadioInput
                                inputType="checkbox"
                                label="Request Approved"
                                name="Request Approved"
                                value="Request Approved"
                                checked={formData.ScheduleType === "Request Approved"}
                                onChange={handleRadioChange}
                            />
                        </div> */}
                    </div>

                </div>
            </div>


            <Heading
                name={t("Data List")}
                isBreadcrumb
                secondTitle={
                    <div className=" d-flex">
                        {colorCodingData.map(({ color, labelKey, id }) => (
                            <ColorCodingSearch
                                key={id}
                                color={color}
                                label={t(labelKey)}
                            />
                        ))}
                        <div>

                            <input
                                type="text"
                                placeholder="Search Data"
                                onClick={(e) => e.stopPropagation()}
                            />

                        </div>
                    </div>
                }
            />
            <CustomTable
                columns={columns}
                data={tableData.map((item, index) => ({
                    srNo: index + 1,
                    ...item,
                }))}
            />

        </>
    );
};

export default ILCScheduleRequest;
