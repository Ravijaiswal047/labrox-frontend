import React, { useState } from 'react'
import Input from '../../../components/formComponent/Input'
import { useTranslation } from 'react-i18next';
import ReactSelect from '../../../components/formComponent/ReactSelect';
import CustomTable from '../../../components/Table/CustomTable';
import DatePicker from '../../../components/formComponent/DatePicker';

const MarkReceivedPopup = () => {
    const { t } = useTranslation();
    const [formdata, setformdata] = useState({
        remarks: '',
        receiveDate: new Date()
    });
    const handleChange = (e) => {
        const { name, value } = e.target;

        setformdata((prev) => ({
            ...prev,
            [name]: value
        }));
    };
    const dateSelect = (value, name) => {
        setformdata({ ...formdata, [name]: value });
    };


    const tableHeaders = [
        { header: "Sr No", field: "SrNo" },
        { header: "Remarks", field: "remarks" },
        { header: "Received Date", field: "receiveddate" },
        { header: "CreatedBy", field: "createdby" },
        { header: "CreatedOn", field: "createdOn" },
        { header: "UpatedBy", field: "updatedby" },
        { header: "UpatedOn", field: "updatedOn" },
    ]
    const tableData = [
        {
            SrNo: "1",
            remarks: "Tube",
            receiveddate: "04/04/2025",
            createdby: "John",
            createdOn: "04/04/2025",
            updatedby: "John",
            updatedOn: "04/04/2025"
        }
    ]

    return (
        <>
            <div className="card">
                <div className="row p-2 d-flex align-items-center">
                    <Input
                        type="text"
                        placeholder=" "
                        lable={t("Name")}
                        id="remarks"
                        name="remarks"
                        value={formdata?.remarks}
                        onChange={handleChange}
                        respclass={"col-md-4 col-12"}
                    />
                    <DatePicker
                        className="custom-calendar"
                        name="receiveDate"
                        placeholder=" "
                        id="receiveDate"
                        lable="receiveDate"
                        respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
                        value={formdata?.receiveDate}
                        onChange={dateSelect}
                    />
                    <div className="col-md-4 col-12">
                        <button
                            className="btn btn-sm btn block btn-success  px-5"
                        // onClick={handleSave}
                        >
                            Save
                        </button>
                    </div>

                </div>
                <div className="mt-1 table_ticket">
                    <CustomTable
                        columns={tableHeaders}
                        data={tableData}
                    // rowColor={bgcolor}
                    //   onEdit={onRowEdit}
                    />
                </div>
            </div>
        </>
    )
}

export default MarkReceivedPopup
