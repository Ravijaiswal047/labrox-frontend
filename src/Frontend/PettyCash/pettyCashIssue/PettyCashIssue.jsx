import React, { useState, useEffect } from 'react'
import Accordion from "@app/components/UI/Accordion";
import { useTranslation } from 'react-i18next';
import ReactSelect from '../../../components/formComponent/ReactSelect';
import DatePicker from '../../../components/formComponent/DatePicker';
import ColorCodingSearch from '../../../components/ModalComponent/ColorCodingSearch';
import CustomTable from '../../../components/Table/CustomTable';
import { axiosInstance } from '@app/utils/axiosInstance';


const PettyCashIssue = () => {
    const { t } = useTranslation();
    const [centreOptions, setCentreOptions] = useState([]);

    useEffect(() => {
        axiosInstance
            .get('Centre/getAccessCentres')
            .then((res) => {
                const list = (res?.data?.message || []).map((c) => ({
                    label: c.Centre,
                    value: String(c.CentreID),
                }));
                setCentreOptions([{ label: 'All Centres', value: '' }, ...list]);
            })
            .catch(() => { });
    }, []);
    const colorCodingData = [

        { color: "#FF6347", id: "1", labelKey: "New" }, // Light Blue
        { color: "#90EE90", id: "2", labelKey: "Accept" }, // Light Green
        { color: "#ADD8E6", id: "3", labelKey: "Reject" }, // Orange

    ];
    const tableHeaders = [
        { header: "S.No.", field: "sNo", width: "5%" },
        { header: "Center Name", field: "centerName" },
        { header: "Center Mode", field: "categoryMode" },
        { header: "Amount", field: "amount" },
        { header: "Date", field: "date" },
        { header: "CreatedByName", field: "createdByName" },
        { header: "Type", field: "type" },
        { header: "Payment Mode", field: "paymentMode" },
        { header: "Card No", field: "cardNo" },
        { header: "Bank", field: "bank" },
        { header: "ApprovedBy", field: "approvedBy" },
        { header: "ApprovedDate", field: "approvedDate" },
        { header: "Reject Remark", field: "rejectRemark" },
        { header: "Remark", field: "remark" },
        { header: "Action", field: "action" },
    ];
    const tableData = [
        {
            sNo: 1,
            centerName: "AYODHYA",
            categoryMode: "CHFD",
           
            amount: "85000",
             date: "21-JULY-2025",
            createdByName: "VIBHOR GUPTA",
            type: "ISSUE",
            cardNo: "70341",
            paymentMode: "NEFT",
            bank: "HDFC BANK",
            approvedBy: "ARUN KUMAR",
            approvedDate: "21-JULY-202",
            rejectRemark: "",
            remark: "CHCL-2870-ARUN KUMAR",
            action: "",
        },


    ];
    return (
        <>
            <div className='card'>
                <Accordion
                    name={t("Petty Cash Issue New/Accept/Reject")}
                    defaultValue={true}
                    isBreadcrumb={true}
                >
                    <Accordion defaultValue={true} title={t("Petty Cash Issue")} />
                    <div className="row p-2 d-flex align-items-center">
                        <ReactSelect
                            name="Center"
                            id="Center"
                            removeIsClearable={true}
                            dynamicOptions={centreOptions}
                            placeholderName="Center"
                            // value={formData?.center}
                            // onChange={handleChange}
                            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
                        />
                        <DatePicker
                            className="custom-calendar"
                            name="FromDate"
                            // value={formData?.FromDate}
                            placeholder=" "
                            id="FromDate"
                            lable="FromDate"
                            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
                        // onChange={dateSelect}
                        // maxDate={new Date(formData.ToDate)}
                        />
                        <DatePicker
                            className="custom-calendar"
                            name="ToDate"
                            // value={formData?.ToDate}
                            placeholder=" "
                            id="ToDate"
                            lable="ToDate"
                            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
                        // onChange={dateSelect}
                        // maxDate={new Date(formData.ToDate)}
                        />
                        {colorCodingData?.map(({ color, labelKey, id }) => (
                            <ColorCodingSearch
                                key={id}
                                color={color}
                                label={t(labelKey)}
                                respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
                            //   onClick={() => handleCallViewMedReq(id)}
                            />
                        ))}
                        <div className="col-sm-2 d-flex align-items-center gap-5">
                            <div className='w-100'>
                                <button
                                    className="btn btn-sm btn block btn-success w-100"
                                // onClick={handleSave}
                                >
                                    Search
                                </button>
                            </div>
                            <div className='w-100 ml-3'>
                                <button
                                    className="btn btn-sm btn block btn-success w-100"
                                // onClick={handleSave}
                                >
                                    Export To Excel
                                </button>
                            </div>


                        </div>
                    </div>
                    <Accordion defaultValue={true} title={t("Expanses Details")} />
                    <div className="mt-1 table_ticket px-3">
                        <CustomTable
                            columns={tableHeaders}
                            data={tableData}
                        //   onEdit={onRowEdit}
                        />
                    </div>
                    
                </Accordion>

            </div>
        </>
    )
}

export default PettyCashIssue
