import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify';
import MultiSelectComp from '../../components/formComponent/MultiSelectComp';
import CustomTimePicker from "../../components/formComponent/TimePicker";
import DatePicker from '../../components/formComponent/DatePicker';
import ReactSelect from '../../components/formComponent/ReactSelect';
import { useTranslation } from 'react-i18next';
import { CustomButton, SaveButton } from '../../components/UI/CustomButton';
import { axiosInstance } from '../../utils/axiosInstance';
import Accordion from '../../components/UI/Accordion';
import moment from 'moment';
import Heading from '../../components/UI/Heading';
import Tables from '../../components/UI/customTable';
import NoRecordFound from '../../components/formComponent/NoRecordFound';
import Loading from '../../components/loader/Loading';
import Input from '../../components/formComponent/Input';
import MachineBreakDownReason from './MachineBreakDownReason';
import Tooltip from "../../components/formComponent/Tooltip";

const MachineBreakDown = () => {
    const [t] = useTranslation();
    const [payload, setPayload] = useState({
        MachineId: [],
        FromDate: new Date(),
        ToDate: new Date(),
        CentreID: "",
        FromTime: "00:00:00",
        ToTime: "23:59:59",
        Reason: [],
        Reasonlabel: "",
        Parameter: "",
    });

    console.log({ payload })
    const [toggleRefLabModal, setToggleRefLabModal] = useState(false);
    const [CentreData, setCentreData] = useState([]);
    const [machines, setmachines] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [load, setLoad] = useState(false);
    const [remarks, setRemarks] = useState({});
    const [reasonData, setReasonData] = useState([]);

    const handleTime = (time, name) => {
        setPayload({ ...payload, [name]: time });
    };

    const handleSearchSelectChange = (name, option) => {
        if (name === "CentreID") {
            const centreId = option?.value || "";
            setPayload((prev) => ({
                ...prev,
                CentreID: centreId,
                MachineId: [],
                Reason: "",
            }));
            setmachines([]);
            GetMachineDataCentreWise(centreId);
        } else if (name === "Reason") {
            const reasonId = option ? option.value : "";
            const reasonLabel = option ? option.label : "";
            setPayload((prev) => ({
                ...prev,
                Reason: reasonId,
                Reasonlabel: reasonLabel,
            }));
        }
    };


    const handleRemarkChange = (id, value) => {
        setRemarks(prev => ({
            ...prev,
            [id]: value
        }));
    };
    const handleMultiSelectChange = (name, value) => {
        setPayload((prev) => ({
            ...prev,
            [name]: value
        }))
    }

    const dateSelect = (date, name) => {
        setPayload({
            ...payload,
            [name]: date,
        });
    };


    const getAccessCentres = (state) => {
        axiosInstance
            .get("Centre/getAccessCentres")
            .then((res) => {
                let data = res.data.message;
                let CentreDataValue = data.map((ele) => {
                    return {
                        value: ele.CentreID,
                        label: ele.Centre,
                    };
                });
                // CentreDataValue.unshift({ label: t("Select"), value: "" });
                state(CentreDataValue);
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const GetMachineDataCentreWise = (id) => {
        setmachines([]);
        setPayload((prev) => ({
            ...prev,
            MachineId: [],
        }));

        axiosInstance
            .post("MachineGroup/GetMachineDataCentreWise", {
                CentreId: id ? String(id) : "",
            })
            .then((res) => {
                let data = res.data.message;
                let CentreDataValue = data.map((ele) => {
                    return {
                        value: ele.MachineID,
                        label: ele.MachineName,
                    };
                });
                setmachines(CentreDataValue);
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const GetReasonData = async () => {
        try {
            const res = await axiosInstance.get("MachineGroup/GetBreakdownReason");
            const reasonDataValue = res.data.data.map((ele) => ({
                ...ele,
                value: ele.Id,
                label: ele.Reason,
            }));

            setReasonData(reasonDataValue);
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        if (!toggleRefLabModal) {
            GetReasonData();
        }
    }, [toggleRefLabModal]);

    const handleSearch = () => {
        setLoad(true);
        axiosInstance
            .post("MachineGroup/SearchMachineBreakdown", {
                MachineId: payload.MachineId.filter(Boolean),
                // FromDate: moment(payload.FromDate).format("YYYY-MM-DD"),
                // ToDate: moment(payload.ToDate).format("YYYY-MM-DD"),
                // FromTime: payload.FromTime,
                // ToTime: payload.ToTime,
                CentreID: payload?.CentreID?.toString(),
            })
            .then((res) => {
                if (res.data.data) {
                    setTableData(res.data.data);
                    setLoad(false);
                } else {
                    setTableData([]);
                    setLoad(false);
                }

            })
            .catch((err) => {
                setTableData([]);
                setLoad(false);
                console.log(err);
            });
    };

    const handleSave = () => {
        if (!payload.CentreID) {
            toast.error("Please Select Centre");
            return;
        }
        if (payload.MachineId.length === 0) {
            toast.error("Please Select Machine");
            return;
        }

        setLoad(true);
        axiosInstance
            .post("MachineGroup/SaveMachineBreakDown", {
                MachineId: payload.MachineId.filter(Boolean),
                FromDate: moment(payload.FromDate).format("YYYY-MM-DD"),
                //ToDate: moment(payload.ToDate).format("YYYY-MM-DD"),
                FromTime: payload.FromTime,
                //ToTime: payload.ToTime,
                CentreID: payload?.CentreID?.toString(),
                Reason: payload?.Reasonlabel?.toString(),
                Parameter: payload?.Parameter || "",
            })
            .then((res) => {
                if (res.data.message) {
                    toast.success(res.data.message);
                    setLoad(false);
                    handleSearch()
                    setPayload({ ...payload, Reason: "" });
                }
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const handleRemove = (item) => {
        const remark = remarks[item.ID];

        if (!remark) {
            toast.error("Remarks is required");
            return;
        }

        setLoad(true);
        axiosInstance
            .post("MachineGroup/DeactiveMachineBreakDown", {
                Id: [item.ID],
                Remarks: remark
            })
            .then((res) => {
                if (res.data.message) {
                    toast.success(res.data.message);
                    setLoad(false);
                    handleSearch();
                }
            })
            .catch((err) => {
                setLoad(false);
                console.log(err);
            });
    };

    useEffect(() => {
        getAccessCentres(setCentreData);
        GetMachineDataCentreWise()
    }, []);

    useEffect(() => { handleSearch() }, [payload.MachineId])


    const handleToggleRefLabModal = () => {
        setToggleRefLabModal(false);
    };

    return (
        <>
            <MachineBreakDownReason
                show={toggleRefLabModal}
                onHide={handleToggleRefLabModal}
            />
            <Accordion
                name={t("Machine Breakdown")}
                defaultValue={true}
                isBreadcrumb={true}
            >
                <div className="row pt-2 pl-2 pr-2 mb-2">
                    <div className="col-12 col-sm-6 col-md-2 my-1">
                        <ReactSelect
                            dynamicOptions={CentreData}
                            name="CentreID"
                            lable={t("Centre")}
                            id="CentreID"
                            removeIsClearable={true}
                            placeholderName={t("Centre")}
                            value={payload?.CentreID}
                            onChange={handleSearchSelectChange}
                            className="required-fields"
                        />
                    </div>

                    <div className="col-12 col-sm-6 col-md-2 my-1">
                        <MultiSelectComp
                            options={machines}
                            value={payload?.MachineId}
                            onChange={handleMultiSelectChange}
                            name="MachineId"
                            label={t("Machine")}
                        />
                    </div>

                    <div className="col-12 col-sm-6 col-md-2 my-1">
                        <DatePicker
                            className="custom-calendar"
                            name="FromDate"
                            value={payload?.FromDate}
                            onChange={dateSelect}
                            placeholder=" "
                            id="FromDate"
                            lable="FromDate"
                            maxDate={new Date(payload?.ToDate)}
                        />
                    </div>

                    <div className="col-12 col-sm-6 col-md-2 my-1">
                        <CustomTimePicker
                            name="FromTime"
                            placeholder="FromTime"
                            value={payload?.FromTime}
                            id="FromTime"
                            lable="FromTime"
                            onChange={handleTime}
                        />
                    </div>
                     <div className="col-sm-2">
                        <Input
                            type="text"
                            name="Parameter"
                            lable={t("Parameter")}
                            id="Parameter"
                            placeholder=" "
                            value={payload?.Parameter}
                            onChange={(e) => setPayload((prev) => ({ ...prev, Parameter: e.target.value }))}
                        />
                    </div>

                    {/* <div className="col-md-2 col-xl-2 col-lg-1">
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
                    </div> */}

                    <div className="col-12 col-sm-6 col-md-2 my-1 d-flex align-items-start" style={{ gap: "4px" }}>
                        <div style={{ flex: "0 0 90%" }}>
                            <ReactSelect
                                dynamicOptions={reasonData}
                                name="Reason"
                                lable={t("Reason")}
                                id="Reason"
                                placeholderName={t("Machine Breakdown Reason")}
                                value={payload?.Reason}
                                onChange={handleSearchSelectChange}
                                className="required-fields"
                            />
                        </div>
                        <Tooltip label={t("Add New Reason")}>
                            <button
                                type="button"
                                className="btn btn-sm btn-primary"
                                onClick={() => setToggleRefLabModal(true)}
                            >
                                <i className="fa fa-plus-circle fa-sm new_record_pluse"></i>
                            </button>
                        </Tooltip>
                    </div>

                    {/* <div className="col-md-2 col-lg-1">
                        <CustomTimePicker
                            name="ToTime"
                            placeholder="ToTime"
                            value={payload?.ToTime}
                            id="ToTime"
                            lable="ToTime"
                            onChange={handleTime}
                        />
                    </div> */}

                    <div className="col-auto my-1">
                        <SaveButton
                            text={t("Save")}
                            onClick={handleSave}
                        //className="rounded-15 mx-2"
                        />
                    </div>

                </div>
                <Heading title={t("Search Result")} />
                <div>
                    {load ? (
                        <Loading />
                    ) : Array.isArray(tableData) && tableData.length > 0 ? (
                        <Tables>
                            <thead style={{ position: "sticky", top: "0", zIndex: 1 }}>
                                <tr>
                                    <th style={{ width: "4%" }}>{t("Sr. No")}</th>
                                    <th>{t("MachineId")}</th>
                                    <th>{t("Centre")}</th>
                                    <th>{t("Machine Breakdown Reason")}</th>
                                    <th>{t("FromDate")}</th>
                                    <th>{t("ToDate")}</th>
                                    <th>{t("Remark")}</th>
                                    <th style={{ width: "4%" }}>{t("Change Status")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tableData.map((item, index) => (
                                    <tr key={index}>
                                        <td data-title={"Sr.No"}>{index + 1}</td>
                                        <td dat-title={"Machine Id"}>{item.MACHINEID}</td>
                                        <td dat-title={"Centre"}>{item.Centre}</td>
                                        <td dat-title={"Machine Breakdown Reason"}>{item.Reason}</td>
                                        <td dat-title={"FromDate"}>{item.FromDate}</td>
                                        <td dat-title={"ToDate"}>{item.ToDate}</td>
                                        <td>
                                            <Input
                                                type="text"
                                                disabled={item.IsActive === 1}
                                                className="required-fields"
                                                value={remarks[item.ID] || item.Remarks || ""}
                                                onChange={(e) => handleRemarkChange(item.ID, e.target.value)}
                                                placeholder={t("Remarks")}
                                            />
                                        </td>
                                        {item.IsActive === 0 && (
                                            <td className='text-center'>
                                                <CustomButton
                                                    text={t("Up")}
                                                    icon="upArrow"
                                                    onClick={() => handleRemove(item)}
                                                    title='Update machine'
                                                />
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </Tables>
                    ) : (
                        <NoRecordFound />
                    )}
                </div>

            </Accordion>
        </>
    )
}

export default MachineBreakDown