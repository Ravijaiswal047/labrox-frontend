import React, { useEffect, useState } from 'react'
import Heading from '../../../components/UI/Heading'
import ReactSelect from '../../../components/formComponent/ReactSelect'
import DatePicker from '../../../components/formComponent/DatePicker'
import Input from '../../../components/formComponent/Input'
import FileUpload from '../../ManageQuery/FileUpload'
import { axiosInstance } from '../../../utils/axiosInstance'
import { notify } from '../../../utils/utils'
import { apiUrls } from '../../../utils/apiUrls'
import CustomTable from '../../../components/Table/CustomTable'
import FilterInput from '../../../components/Filter/FilterInput'
import excelicon from '../../Images/excelicon.png'
import { ExportToExcel } from '../../../utils/helpers'
import { clearFiles } from '../../../store/reducers/fileUploadSlice/fileUploadSlice'
import { useDispatch } from 'react-redux'

const PmOtherActivities = () => {
    const dispatch = useDispatch()
    const [tableData, setTableData] = useState([]);
    const [equipmentdata, setequipmentdata] = useState([]);
    const [filterInputValue, setFilterInputValue] = useState("");
    const [filterTableData, setFilterTableData] = useState([]);
    const [payload, setPayload] = useState({
        ActivityType: "",
        EquipmentID: "",
        ActivityDate: new Date(),
        NextDueDate: new Date(),
        VendorName: "",
        PerformedBy: "",
        Remarks: "",
        Attachment: ""
    })
    const handleFilterInputChange = (e) => {
        let value = '';
        if (typeof e === 'string') {
            value = e.toLowerCase();
        } else {
            value = e.target.value.toLowerCase();
        }
        setFilterInputValue(value);

        // Filter rows based on search term matching any field
        const filtered = tableData.filter((row) =>
            Object.keys(row).some((key) =>
                String(row[key]).toLowerCase().includes(value)
            )
        );

        setTableData(filtered);
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
    const fetchdata = () => {
        axiosInstance.get("Equipment/GetAllMaster", {
            params: {
                p_type: "ActivitiesLog",
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
                setTableData(rawData);
            })
            .catch((error) => {
                console.error(error);
            });
    };
    useEffect(() => {
        fetchdata();
        fetchequipmentdata();
    }, [])
    const handleChange = (e) => {
        const { name, value } = e.target
        setPayload((prev) =>
            ({ ...prev, [name]: value })
        )
    }
    const handleReactChange = (name, e) => {
        console.log("selectedOption", e, "name", name);
        setPayload((prev) => ({ ...prev, [name]: e.value }));
    };


    const dateSelect = (value, name) => {
        setPayload({ ...payload, [name]: value });
    };
    const handleFileResponse = (file) => {
        if (file) {
            console.log("Uploaded File:", file);
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result;
                setPayload((prev) => ({
                    ...prev,
                    Attachment: base64String,
                }));
            };
            reader.readAsDataURL(file); // this reads it as base64
        } else {
            console.log("File cleared");
            setPayload((prev) => ({
                ...prev,
                Attachment: "",
            }));
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        const selectedEquipment = equipmentdata.find(itm => itm.value === payload.EquipmentID);

        let requestdata = {
            transactionType: "Insert",
            ActivityLogID: 0,
            ActivityType: payload?.ActivityType,
            EquipmentID: payload?.EquipmentID,
            EquipmentName: selectedEquipment?.label || "",
            ActivityDate: payload?.ActivityDate,
            NextDueDate: payload?.NextDueDate,
            VendorName: payload?.VendorName,
            PerformedBy: payload?.PerformedBy,
            Remarks: payload?.Remarks,
            Attachment: payload?.Attachment,
        };

        try {
            const resp = await axiosInstance.post(apiUrls?.Equipmentlog, requestdata); // <-- assign to 'resp'
            console.log(resp.data.data);

            if (resp?.data?.success === true) {
                notify(resp?.data?.message, "success");
                setPayload({
                    ActivityType: "",
                    EquipmentID: "",
                    ActivityDate: "",
                    NextDueDate: "",
                    VendorName: "",
                    PerformedBy: "",
                    Remarks: "",
                    Attachment: ""
                });
                dispatch(clearFiles())
                // fetchequipmentdata();
            } else {

                notify(resp?.data?.message || "Insert failed", "error");
            }

        } catch (error) {
            console.log('errorxx', error);
            notify(error?.response?.data?.message || "Insert failed", "error");
        }
    };
    const tableHeaders = [
        { header: "S.No.", field: "sNo", width: "5%" },
        { header: "Activity Type", field: "ActivityType" },
        { header: "Activity Date", field: "ActivityDate" },
        { header: "Equipment Name", field: "EquipmentName" },
        { header: "NextDue Date", field: "NextDueDate" },
        { header: "Vendor Name", field: "VendorName" },
        { header: "Performed By", field: "PerformedBy" },
        { header: "Remarks", field: "Remarks" },
        { header: "Created Date", field: "createdDate" },
        { header: "Created By", field: "createdBy" },
        { header: "LastUpdated Date", field: "lastUpdatedDate" },
        { header: "LastUpdated By", field: "lastUpdatedBy" },

    ];
    const activitytypelist = [
        { value: "PM", label: "PM" },
        { value: "Calibration", label: "Calibration" },
        { value: "AMC", label: "AMC" },
        { value: "CMC", label: "CMC" },

    ];
    return (
        <>
            <div className="card">
                <Heading
                    name={"Log PM , Calibration , AMC , or , CMC"}
                    isBreadcrumb={true}
                />
                <form onSubmit={handleSubmit}>
                    <div className="row p-2 d-flex align-items-center">
                        <ReactSelect
                            name="ActivityType"
                            id="ActivityType"
                            removeIsClearable={true}
                            isShowBorder={true}
                            dynamicOptions={activitytypelist}
                            value={payload.ActivityType}
                            onChange={handleReactChange}
                            placeholderName="ActivityType"
                            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
                        />
                        <ReactSelect
                            name="EquipmentID"
                            id="EquipmentID"
                            removeIsClearable={true}
                            isShowBorder={true}
                            dynamicOptions={equipmentdata}
                            value={payload.EquipmentID}
                            onChange={handleReactChange}
                            placeholderName="Equipment"
                            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
                        />
                        <DatePicker
                            className="custom-calendar"
                            name="ActivityDate"
                            placeholder=" "
                            id="ActivityDate"
                            lable="ActivityDate"
                            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
                            value={payload?.ActivityDate}
                            onChange={dateSelect}

                        />
                        <DatePicker
                            className="custom-calendar"
                            name="NextDueDate"
                            placeholder=" "
                            id="NextDueDate"
                            lable="NextDueDate"
                            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
                            value={payload?.NextDueDate}
                            onChange={dateSelect}

                        />
                        <Input
                            type="text"
                            placeholder=" "
                            lable="Vendor Name"
                            id="VendorName"
                            name="VendorName"
                            value={payload?.VendorName}
                            onChange={handleChange}
                            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
                        />
                        <Input
                            type="text"
                            placeholder=" "
                            lable="Performed By"
                            id="PerformedBy"
                            name="PerformedBy"
                            value={payload?.PerformedBy}
                            onChange={handleChange}
                            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
                        />
                        <Input
                            type="text"
                            placeholder=" "
                            lable="Remarks"
                            id="Remarks"
                            name="Remarks"
                            value={payload?.Remarks}
                            onChange={handleChange}
                            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
                        />
                        <div className="col-xl-2 col-sm-4 col-md-6 col-12  d-flex align-items-center gap-1">
                            <FileUpload
                                placeholder="Upload Attachment"
                                allowedTypes={[".pdf"]}
                                respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
                                onFileSelect={handleFileResponse}
                            />

                        </div>
                        <button
                            className="btn btn-sm btn block btn-success  px-5"
                            type='submit'
                        >
                            Save
                        </button>

                    </div>
                </form>

                <div
                    style={{ gap: "4px" }}
                    className="d-flex align-items-end  flex-grow-1 justify-content-end my-2 px-2"
                >
                    <div style={{ gap: "4px" }} className="excel_exp d-flex">

                        <div>
                            {/* <Tooltip position="top" target=".excel-icon" /> */}
                            <img
                                onClick={() => ExportToExcel(tableData)}
                                src={excelicon}
                                alt="Export to Excel"
                                className="excel-icon"
                                data-pr-tooltip="Export Active Data"
                                style={{ width: "26px", height: "26px", cursor: "pointer" }}
                            />
                        </div>
                    </div>
                    <FilterInput
                        value={filterInputValue}
                        onChange={handleFilterInputChange}
                        placeholder="Filter Table"
                    />
                </div>
                <div className="mt-1 table_ticket">
                    <CustomTable
                        columns={tableHeaders}
                        data={tableData.map((item, index) => (
                            {
                                ...item,
                                sNo: index + 1,
                                ActivityType: item?.ActivityType,
                                ActivityDate: item?.ActivityDate,
                                EquipmentName: item?.EquipmentName,
                                NextDueDate: item?.NextDueDate,
                                VendorName: item?.VendorName,
                                PerformedBy: item?.PerformedBy,
                                Remarks: item?.Remarks,
                                createdDate: item?.DtEntry,
                                createdBy: item?.CreatedByName,
                                lastUpdatedDate: item?.UpdatedOn,
                                lastUpdatedBy: item?.UpdatedByName


                            }
                        ))}


                    />
                </div>
            </div>
        </>
    )
}

export default PmOtherActivities
