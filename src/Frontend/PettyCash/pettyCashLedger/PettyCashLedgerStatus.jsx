import React from 'react'
import Accordion from '../../../components/UI/Accordion'
import { useTranslation } from 'react-i18next';
import DatePicker from '../../../components/formComponent/DatePicker';
import CustomTable from '../../../components/Table/CustomTable';

const PettyCashLedgerStatus = () => {
    const { t } = useTranslation();
    const tableHeaders = [
        { header: "S.No.", field: "sNo", width: "5%" },
        { header: "Center Name", field: "centerName" },
        { header: "Center Code", field: "categoryCode" },
        { header: "Total Issued Amount", field: "totalissuedamount" },
        { header: "Total Expenses", field: "totalexpenses" },
        { header: "Available Amount", field: "availableamount" },
        { header: "Pending For Approval Amount", field: "approvalamount" },
        { header: "Actual Balance", field: "actualbalance" },

    ];
    const tableData = [
        {
            sNo: 1,
            centerName: "Haldwani Nainital Road",
            categoryCode: "CHLD",
            totalissuedamount: "13356897",
            totalexpenses: "242561",
            availableamount: "0",
            approvalamount : "0",
            actualbalance:"0"
        },


    ];
    return (
        <>
            <div className="card">
                <Accordion
                    name={t("Petty Cash Ledger Status")}
                    defaultValue={true}
                    isBreadcrumb={true}
                >
                    {/* <Accordion defaultValue={true} title={t("Petty Cash Ledger Status")} /> */}
                    <div className='row p-2 d-flex align-items-center'>
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
                    <Accordion defaultValue={true} title={t("Petty Cash Ledger Status Details")} />
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

export default PettyCashLedgerStatus
