import React, { useEffect, useState } from 'react';
import Heading from '../../../components/UI/Heading';
import ReactSelect from '../../../components/formComponent/ReactSelect';
import DatePicker from '../../../components/formComponent/DatePicker';
import Accordion from '../../../components/UI/Accordion';
import { useTranslation } from 'react-i18next';
import CustomTable from '../../../components/Table/CustomTable';
import Input from '../../../components/formComponent/Input';
import Form from 'react-bootstrap/Form';
import { axiosInstance } from '../../../utils/axiosInstance';
import { notify } from '../../../utils/utils';
import { apiUrls } from '../../../utils/apiUrls';
import moment from 'moment';

const RoutineMaintenance = () => {
    const { t } = useTranslation();
    const [centredata, setcentredata] = useState([]);
    const [equipmentdata, setequipmentdata] = useState([]);
    const [tableData, setTableData] = useState([])
    const [payload, setpayload] = useState({
        Center: "",
        Frequency: "",
        EquipmentID: "",
        ScheduleDate: new Date()
    })
    const fetchAllCenter = () => {
        axiosInstance.get("Employee/GetAllCentres")
            .then(res => {
                const data = res?.data?.message || [];
                const val = data.map(ele => ({
                    value: ele.CentreID,
                    label: ele.Centre,
                    CentreCode: ele?.CentreCode
                }));
                setcentredata(val);

            })
            .catch(err => {
                console.error(err);
            });
    };
    const fetchequipmentdata = () => {
        axiosInstance.get("Equipment/GetAllMaster", {
            params: {
                p_type: "Equipment",
                p_id: 0
            }
        })
            .then((resp) => {
                console.log(resp);
                const rawData = resp?.data?.message || [];
                const options = rawData.map(item => ({
                    ...item,
                    value: item.EquipmentID,
                    label: item.EquipmentName
                }));
                setequipmentdata(options);
            })
            .catch((error) => {
                console.error(error);
            });
    };
    useEffect(() => {
        fetchAllCenter();
        fetchequipmentdata();
    }, [])
    const handlereactchange = (name, e) => {
        console.log("selectedOption", e, "name", name);
        setpayload((prev) => ({ ...prev, [name]: e.value }));

    };
    const dateselect = (value, name) => {
        setpayload({ ...payload, [name]: value });
    };
    const handlesubmit = async (e) => {
        e.preventDefault();
        let requestdata = {
            Center: payload?.Center || 0,
            Frequency: payload?.Frequency || 0,
            EquipmentID: payload?.EquipmentID || 0,
            ScheduleDate: payload?.ScheduleDate ? moment(payload.ScheduleDate).format('YYYY-MM-DD') : null
        };
        try {
            const resp = await axiosInstance.post(apiUrls?.Equipmentmaintenanacelogging, requestdata); // <-- assign to 'resp'
            console.log(resp.data.data);

            if (resp?.data?.success === true) {
                notify(resp?.data?.message, "success");
                setTableData(resp?.data?.message)
                setpayload({
                    Center: "",
                    Frequency: "",
                    EquipmentID: "",
                    ScheduleDate: ""
                });
                // fetchequipmentdata();
            } else {

                notify(resp?.data?.message || "Insert failed", "error");
                setTableData([]);
            }

        } catch (error) {
            console.log('errorxx', error);
            notify(error?.response?.data?.message || "Insert failed", "error");
        }
    };


    // Table headers
    const tableHeaders = [
        { header: 'Centre', field: 'centre' },
        { header: 'Equipment Name', field: 'equipmentName' },
        { header: 'Category', field: 'category' },
        { header: 'Sub Category', field: 'subcategory' },
        { header: 'Status', field: 'status' },
        { header: 'Remarks', field: 'remarks' },
        { header: 'Maintenance Date', field: 'maintenanaceDate' },
        { header: "Created Date", field: "createdDate" },
        { header: "Created By", field: "createdBy" },
        { header: "LastUpdated Date", field: "lastUpdatedDate" },
        { header: "LastUpdated By", field: "lastUpdatedBy" },

    ];
    const frequencyList = [
        { value: '', label: '---Select---' },
        { value: '0', label: 'Daily' },
        { value: '1', label: 'Weekly' },
        { value: '2', label: 'Monthly' },
        { value: '3', label: 'Yearly' },
    ]
    return (
        <div className="card">
            <Heading name="Equipment Maintenance" isBreadcrumb={true} />
            <form onSubmit={handlesubmit}>
                <div className="row p-2 d-flex align-items-center">
                    <ReactSelect
                        name="Center"
                        id="Center"
                        dynamicOptions={centredata}
                        removeIsClearable={true}
                        isShowBorder={true}
                        value={payload?.Center}
                        onChange={handlereactchange}
                        placeholderName="Centre"
                        respclass="col-xl-2 col-sm-4 col-md-6 col-12"
                    />
                    <ReactSelect
                        name="Frequency"
                        id="Frequency"
                        dynamicOptions={frequencyList}
                        removeIsClearable={true}
                        isShowBorder={true}
                        value={payload?.Frequency}
                        onChange={handlereactchange}
                        placeholderName="Frequency"
                        respclass="col-xl-2 col-sm-4 col-md-6 col-12"
                    />
                    <ReactSelect
                        name="EquipmentID"
                        id="EquipmentID"
                        dynamicOptions={equipmentdata}
                        removeIsClearable={true}
                        isShowBorder={true}
                        value={payload?.EquipmentID}
                        onChange={handlereactchange}
                        placeholderName="Equipment"
                        respclass="col-xl-2 col-sm-4 col-md-6 col-12"
                    />
                    <DatePicker
                        className="custom-calendar"
                        name="ScheduleDate"
                        placeholder=" "
                        value={payload?.ScheduleDate}
                        onChange={dateselect}
                        id="ScheduleDate"
                        lable="Date Of Maintenance"
                        respclass="col-xl-2 col-sm-4 col-md-6 col-12"
                    />
                    <button type='submit' className="btn btn-sm btn block btn-success ">
                        Search
                    </button>
                </div>
            </form>



            {/* Accordion Title */}
            <Accordion
                defaultValue={true}
                title={t('Log Tasks for Daily Maintenance')}
            />

            {/* Table */}
            <CustomTable
                columns={tableHeaders}
                data={tableData.map((itm, index) => ({
                    ...itm,
                    centre: itm?.CentreName,
                    equipmentName: itm?.EquipmentName,
                    category: itm?.CategoryName,
                    subcategory: itm?.SubcategoryName,
                    status: (
                        <Form>
                            <Form.Check // prettier-ignore
                                type="switch"
                                id="custom-switch"
                            // label="Status"
                            />

                        </Form>
                    ),
                    remarks: (
                        <Input
                            type="text"
                        // value={row.perc}
                        // onChange={(e) => handlePercChange(index, e.target.value)}
                        // disabled={!row.checked}
                        />
                    ),
                    maintenanaceDate: itm?.MaintenanaceDate,
                    createdDate: itm?.DtEntry,
                    createdBy: itm?.CreatedByName,
                    lastUpdatedDate: itm?.DtUpdate,
                    lastUpdatedBy: itm?.UpdatedByName
                }))}
            />
        </div>
    );
};

export default RoutineMaintenance;
