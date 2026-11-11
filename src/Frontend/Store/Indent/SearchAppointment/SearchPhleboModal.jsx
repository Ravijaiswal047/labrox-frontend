import React, { use, useEffect, useState } from 'react'
import Heading from '../../../../components/UI/Heading';
import { Dialog } from "primereact/dialog";
import Tables from '../../../../components/UI/customTable';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useLocalStorage } from '../../../../utils/hooks/useLocalStorage';
import ReactSelect from '../../../../components/formComponent/ReactSelect';
import DatePicker from '../../../../components/formComponent/DatePicker';
import Input from '../../../../components/formComponent/Input';
import { axiosInstance } from '../../../../utils/axiosInstance';
import { CustomButton } from '../../../../components/UI/CustomButton';
import CustomTimePicker from "../../../../components/formComponent/TimePicker";
import { Time } from '../../../../utils/helpers';

function SearchPhleboModal({ show, handleClose, phleboData, getPro, handleSubmit }) {
    const { t } = useTranslation();
    const theme = useLocalStorage("theme", "get");
    const isMobile = window.innerWidth <= 768;
    // const [filteredTable, setFilteredTable] = useState([]);
    const [time, setTime] = useState([]);

    const [Payload, setPayload] = useState({
        Pro: "",
        FromDate: new Date(),
        Time: "",
        // FromTime: "00:00:00",
        // ToTime: "23:59:59",
    });

    const dateSelect = (date, name) => {
        setPayload({
            ...Payload,
            [name]: date,
        });
    };

    const handleTime = (time, name) => {
        setPayload({ ...Payload, [name]: time });
    };

    const handleReactSelectChange = (name, value) => {
        setPayload((prev) => ({
            ...prev,
            [name]: value?.value
        }))
    }
    console.log(getPro, "phelboData");
    // console.log(setSelectedRow, "setSelectedRow");
    const onSubmit = () => {
        const data = {
            appId: getPro?.id,
            proId: (Payload?.Pro).toString(),
            assignDate: Payload?.FromDate,
            timeSlot: Payload?.Time
        };

        handleSubmit(data);
    };

    const getTime = () => {
        axiosInstance
            .get("HomeCollectionSearch/GetTimeSlot")
            .then((res) => {
                const data = res?.data?.data;
                setTime(data);
                if (data?.length > 0) {
                    setPayload((prev) => ({
                        ...prev,
                        Time: data[0].TimeSlot
                    }));
                }
            });
    };
    useEffect(() => {
        getTime();
    }, [])


    console.log(getPro, "phelboData");
    return (
        <>
            <Dialog
                header={t("Item Details")}
                visible={show}
                className={theme}
                onHide={handleClose}
                style={{ width: isMobile ? "30vw" : "50vw" }}>
                <div className="p-4">

                    <div className="d-flex">
                        <span className="text-danger" style={{ fontWeight: "bold" }}>
                            App DateTime : - &nbsp; &nbsp; &nbsp;&nbsp;
                        </span>

                        <span className="text-success" style={{ fontWeight: "bold" }}>
                            {getPro?.AppDate}
                        </span>

                    </div>
                    <div className="row">
                        <div className="col-sm-4">
                            <ReactSelect
                                dynamicOptions={phleboData?.map((item) => ({
                                    label: item?.NAME,
                                    value: item?.PhlebotomistID,
                                }))}
                                name="Pro"
                                label="Pro"
                                removeIsClearable={true}
                                placeholderName={t("Select Phlebo Name")}
                                value={Payload?.Pro}
                                isDisabled={[4, 5].includes(Number(getPro?.STATUS))}
                                onChange={handleReactSelectChange}
                            />
                        </div>
                        <div className="col-sm-4">
                            <DatePicker
                                name="FromDate"
                                id="FromDate"
                                value={Payload?.FromDate}
                                onChange={dateSelect}
                                // maxDate={new Date()}
                                placeholder=""
                                lable={t("Date")}
                                 disabled={[4, 5].includes(Number(getPro?.STATUS))}
                                className="custom-calendar"
                            />
                        </div>
                        <div className="col-sm-4">
                            <ReactSelect
                                dynamicOptions={time?.map((item) => ({
                                    label: item?.TimeSlot,
                                    value: item?.TimeSlot,
                                }))}
                                name="Time"
                                label="Time"
                                removeIsClearable={true}
                                placeholderName={t("Time")}
                                isDisabled={[4, 5].includes(Number(getPro?.STATUS))}
                                value={time?.find(item => item.TimeSlot === Payload?.Time)?.TimeSlot}
                                onChange={handleReactSelectChange}
                            />
                        </div>
                        <div className="col-sm-1">
                            <CustomButton
                                text={t("Save")}
                                // icon={"save"}
                                 disabled={[4, 5].includes(Number(getPro?.STATUS))}
                                onClick={onSubmit}
                            />
                        </div>
                        <div className="col-sm-1">
                            <CustomButton
                                text={t("Close")}
                                icon={"close"}
                                onClick={handleClose}
                            />
                        </div>
                    </div>
                </div>


            </Dialog>
        </>
    )
}

export default SearchPhleboModal;
