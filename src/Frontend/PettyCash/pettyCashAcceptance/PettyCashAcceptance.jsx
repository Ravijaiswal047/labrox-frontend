import React, { useEffect, useState } from 'react'
import Accordion from '../../../components/UI/Accordion'
import ReactSelect from '../../../components/formComponent/ReactSelect'
import DatePicker from '../../../components/formComponent/DatePicker'
import Tooltip from '../../../components/formComponent/Tooltip'
import { ExportToExcel } from '../../../utils/helpers'
import FilterInput from '../../../components/Filter/FilterInput'
import CustomTable from '../../../components/Table/CustomTable'
import { useTranslation } from 'react-i18next'
import excelicon from '../../Images/excelicon.png'
import Heading from '../../../components/UI/Heading'
// import ColorCodingSearch from '../../../components/ModalComponent/ColorCodingSearch'
import { axiosInstance } from '../../../utils/axiosInstance'
import { apiUrls } from '../../../utils/apiEndpoints'
import { notify } from '../../../utils/utils'
import PettyCashDashboard from '../pettyCashDashboard/PettyCashDashboard'
import PettyCashTransfer from '../pettyCashTransfer/PettyCashTransfer'
import PettyCashLedgerReport from '../pettyCashLedger/PettyCashLedgerReport'
import ExpenseTypeMaster from '../expenseTypeMaster/ExpenseTypeMaster'
import CenterExpensesEntry from '../centerExpensesEntry/CenterExpensesEntry'
import { ViewMenu } from '../../../components/SvgIcons'
import { useNavigate } from 'react-router-dom'
import SeeMore from '../../SampleStorage/frameMenu/SeeMore'
import accept from '../../Images/accept.png'
import reject from '../../Images/reject.png'
import TableFilterDot from '../../Components/TableFilterDot'
import fileIcon from "../../../assets/image/fileIcon.png";
import { useDispatch } from 'react-redux'
import { setLoading } from '../../../store/reducers/loadingSlice/loadingSlice'

const PettyCashAcceptance = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [filterInputValue, setFilterInputValue] = useState("");
  const [filterTableData, setFilterTableData] = useState([]);
  const [centredata, setcentredata] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [showMore, setShowMore] = useState(false);
  const fetchAllCenter = () => {
    axiosInstance.get("Centre/getAccessCentres")
      .then(res => {
        const data = res?.data?.message || [];
        const val = data.map(ele => ({
          value: ele.CentreID,
          label: ele.Centre,
          CentreCode: ele?.CentreCode
        }));
        setcentredata([{label:'All', value:''},...val]);

      })
      .catch(err => {
        console.error(err);
      });
  };
  useEffect(() => {
    fetchAllCenter();
    handlesearch();

  }, []);
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
console.log('eeeee',value, '==', filtered);

    setFilterTableData(filtered);
  };

  // useEffect(() => {
  //   setFilterTableData(tableData);
  // }, [tableData]);

  const [searchData, setsearchData] = useState({
    centreID: '',
    fromDate: new Date(),
    toDate: new Date(),
    status: '-1',
    transactionType: "IssueSearch",
    dateType: "TransactionDate",
    DateType: 'dtEntry'
  })
  const handlesearch = async (e) => {

    const fromDateStr = searchData?.fromDate?.toISOString?.();
    const toDateStr = searchData?.toDate?.toISOString?.();
    e?.preventDefault();
    let requestdata = {
      centreIDs: String(searchData?.centreID),
      fromDate: `${fromDateStr?.split('T')[0]}T00:00:00`,
      toDate: `${toDateStr?.split('T')[0]}T23:59:59`,
      status: searchData?.status,
      transactionType: "IssueSearch",
      dateType: "TransactionDate",
      DateType: searchData?.DateType
    }
    console.log(requestdata);
    dispatch(setLoading(true))
    await axiosInstance
      .post(apiUrls.SearchPettyCash, requestdata)
      .then((res) => {
        console.log(res);
        if (Array.isArray(res?.data?.message)) {
          setTableData(res?.data?.message)
          setFilterTableData(res?.data?.message)
        } else {
          notify(res?.data?.message, "error");
          setTableData([]);
          setFilterTableData([]);
        }
      })
      .catch((err) => {
        console.log(err);
        notify(err?.data?.message, "error");
        setTableData([]);
      }).finally(()=>{
        dispatch(setLoading(false))
      })

  }
  const [updatestatus, setupdarestatus] = useState({
    transactionType: '',
    id: '',
    remarks: ''

  })
  const handleupdate = async (type, id) => {

    const requestdata = {
      transactionType: type,
      id: id,
      remarks: updatestatus.remarks || ''
    };
    console.log("Payload being sent:", requestdata);
    await axiosInstance
      .post(apiUrls.updatepettycash, requestdata)
      .then((res) => {
        console.log(res);
        if (Array.isArray(res?.data?.message)) {
          setupdarestatus(res?.data?.message)
          // setFilterTableData(res?.data?.message)
        }
        if(res?.data?.success){
          notify(res?.data?.message, "success");
        }
        if(!res?.data?.success){
          notify(res?.data?.message, "error");
        }
        handlesearch();

      })
      .catch((err) => {
        console.log(err);
        notify(err?.data?.message, "error");
        // setTableData([]);
      });

  }
  const handleselectsearchChange = (name, e) => {
    setsearchData((prev) => ({ ...prev, [name]: e?.value }));
    // if (name === 'centreID') {
    //   handlebalacedata(e?.value);
    // }
  };
  const datesearchSelect = (value, name) => {
    setsearchData({ ...searchData, [name]: value });
  };

  const tableHeaders = [
    { header: "S.No.", field: "sNo", width: "5%" },
    { header: "Centre Name", field: "centreName" },
    { header: "Centre Code", field: "centreCode" },
    { header: "Amount", field: "amount" },
    { header: "Date", field: "date" },
    { header: "CreatedByName", field: "createdByName" },
    { header: "Payment Mode", field: "paymentMode" },
    { header: "Card No", field: "cardNo" },
    { header: "Remark", field: "remark" },
    { header: "Action", field: "action" },
    { header: "Attachment", field: "attachment" },

  ];

  const statusdata = [
    { value: "0", label: "Pending" },
    { value: "1", label: "Approved" },
    { value: "2", label: "Rejected" },
    { value: "-1", label: "All" }
  ]
  const dateTypeList = [
    { value: "dtEntry", label: "Entry Date" },
    { value: "TransactionDate", label: "Transaction Date" },
    { value: "dtApproved", label: "Accept Date" },
    { value: "dtCancel", label: "Reject Date" },
  ]
  const seeMoreData = [
    {
      name: "Petty Cash Dashboard",
      component: <PettyCashDashboard setShowMore={setShowMore} />,
      url: "/dashboard#pettycash",
    },
    {
      name: "Petty Cash Transfer",
      component: <PettyCashTransfer setShowMore={setShowMore} />,
      url: "/pettycash/petty-cash-transfer",
    },
    {
      name: "Petty Cash Acceptance",
      component: <PettyCashAcceptance setShowMore={setShowMore} />,
      url: "/pettycashacceptance",
    },
    {
      name: "Petty Cash Ledger Report",
      component: <PettyCashLedgerReport setShowMore={setShowMore} />,
      url: "/pettycashledger/petty-cash-ledger-report",
    },
    {
      name: "Expense Type Master",
      component: <ExpenseTypeMaster setShowMore={setShowMore} />,
      url: "/pettycashledger/expense-type-master",
    },
    {
      name: " Centre Expense",
      component: <CenterExpensesEntry setShowMore={setShowMore} />,
      url: "/centerexpenseentry/center-expense-entry",
    },
  ];
  const statusCount = (sType) => {
    return tableData?.filter(items => items?.StatusText === sType)?.length
  }
  const truncateText = (text, maxLength = 30) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };
  return (
    <>
      {showMore && (
        <SeeMore
          seeMore={seeMoreData}
          handleChangeComponent={(item) => {
            setShowMore(false);
            navigate(item?.url);
          }}
          setShowMore={setShowMore}
        />
      )}
      <div className="card">

        <Heading
          name="Petty Cash Search"
          isBreadcrumb={true}
          secondTitle={
            <>
              <label onClick={() => setShowMore((prev) => !prev)}>
                <ViewMenu />
              </label>

            </>

          }
        />
        <form onSubmit={handlesearch}>
          <div className="row p-2 d-flex align-items-center">
            <ReactSelect
              name="centreID"
              id="centreID"
              removeIsClearable={true}
              dynamicOptions={centredata}
              isShowBorder={true}
              placeholderName="Centre"
              value={searchData?.centreID}
              onChange={handleselectsearchChange}
              respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
            />
            <ReactSelect
              name="DateType"
              id="dateType"
              removeIsClearable={true}
              dynamicOptions={dateTypeList}
              isShowBorder={true}
              placeholderName="DateType"
              value={searchData?.DateType}
              onChange={handleselectsearchChange}
              respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
            />
            <DatePicker
              className="custom-calendar"
              name="fromDate"
              value={searchData?.fromDate}
              onChange={datesearchSelect}
              placeholder=" "
              id="fromDate"
              lable="FromDate"
              respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}

            />
            <DatePicker
              className="custom-calendar"
              name="toDate"
              placeholder=" "
              id="toDate"
              lable="ToDate"
              respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
              value={searchData?.toDate}
              onChange={datesearchSelect}
            />
            <ReactSelect
              name="status"
              id="status"
              removeIsClearable={true}
              dynamicOptions={statusdata}
              isShowBorder={true}
              placeholderName="Status"
              value={searchData?.status}
              onChange={handleselectsearchChange}
              respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
            />

            <div className="col-sm-2 d-flex align-items-center gap-5">
              <div className='w-100'>
                <button
                  type='submit'
                  className="btn btn-sm btn block btn-success px-5"

                >
                  Search
                </button>
              </div>
            </div>
          </div>
        </form>
        <div
          style={{ gap: "4px" }}
          className="d-flex align-items-end  flex-grow-1 justify-content-end my-2 px-2"
        >
          <div style={{ gap: "4px" }} className="excel_exp d-flex">

            <div>
              <Tooltip position="top" target=".excel-icon" />
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
        <Heading
          title={t("Expanses Details")}
          secondTitle={
            <>

              <div
                style={{ gap: "4px" }}
                className="d-flex justify-content-end pt-1 px-2"
              >
                <TableFilterDot
                  onClick={() => handleFilterInputChange("Pending")}
                  color={"#FFFFFF"}
                  title={`Pending ${statusCount('Pending')}`}
                  bgColor={"#ebebebbf"}
                />
                <TableFilterDot
                  onClick={() => handleFilterInputChange("Approved")}
                  color={"#90EE90"}
                  title={`Approved ${statusCount('Approved')}`}
                  bgColor={"#ebebebbf"}
                />
                <TableFilterDot
                  onClick={() => handleFilterInputChange("Rejected")}
                  color={"#FFB6C1"}
                  title={`Rejected ${statusCount('Rejected')}`}
                  bgColor={"#ebebebbf"}
                />
              </div>
            </>

          }

        />
        <div className="mt-1 table_ticket">
          <CustomTable
            columns={tableHeaders}
            data={filterTableData.map((item, index) => (
              {
                rowColor: item.ColorCode,
                sNo: index + 1,
                centreName: item?.Centre,
                centreCode: item?.CentreCode,
                amount: item?.Amount,
                date: item?.TransactionDate,
                createdByName: item?.CreatedByname,
                paymentMode: item?.PaymentMode,
                cardNo: item?.CardNo != null ? item.CardNo : '-',
                remark: (
                  <span title={item?.Remarks || ""} style={{ cursor: 'default' }}>
                    {truncateText(item?.Remarks, 30)}
                  </span>
                ),
                attachment: (
                  <div className="d-flex align-items-center">
                    <img width={16} height={16} src={fileIcon} alt="fileIcon" />
                    <span className="mx-1">({item?.FileCount || 0})</span>
                  </div>
                ),
                action: item?.StatusText === "Pending" ? (
                  <>
                    <div className='d-flex gap-3 align-items-center'>
                      <div onClick={() => handleupdate('accept', item?.id)}>
                        <img src={accept} className='' style={{ height: "25px" }} />
                      </div>
                      <div onClick={() => handleupdate('reject', item?.id)}>
                        <img src={reject} style={{ height: "30px" }} />
                      </div>
                    </div>

                  </>
                ) : item?.StatusText === "Approved" ? (
                  <p>
                    Accepted By: {item?.AcceptBy},<br />
                    Accepted Date: {item?.AcceptDate}
                  </p>
                ) : item?.StatusText === "Rejected" ? (
                  <p>
                    Rejected By: {item?.RejectBy},<br />
                    Rejected Date: {item?.RejectDate}
                  </p>
                ) : null


              }
            ))}

          />
        </div>


      </div >
    </>
  )
}

export default PettyCashAcceptance
