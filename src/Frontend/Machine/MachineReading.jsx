import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { axiosInstance } from "../../utils/axiosInstance";
import moment from "moment";
import Accordion from "@app/components/UI/Accordion";
import DatePicker from "../../components/formComponent/DatePicker";
import { SelectBox } from "../../components/formComponent/SelectBox";
import Input from "../../components/formComponent/Input";
import { NoOfRecord, Record, Showonly } from "../../utils/Constants";
import Loading from "../../components/loader/Loading";
import Tables from "../../components/UI/customTable";
import Pagination from "../../Pagination/Pagination";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { CustomButton, SearchButton } from "../../components/UI/CustomButton";
import Heading from "../../components/UI/Heading";
import ColorCodingSearch from "../../components/ModalComponent/ColorCodingSearch";
import FilterInput from "../../components/Filter/FilterInput";
import NoRecordFound from "../../components/formComponent/NoRecordFound"

const MachineReading = () => {
  const [machineId, setMachineId] = useState([]);
  const [errors, setErrors] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [masterTable, setMasterTable] = useState([]);
  const [currentTableData, setCurrentTableData] = useState([]);
  const [pageSize, setPageSize] = useState(50);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const colorCodingData = [
    { color: "#ffe58f", id: "7", labelKey: "Not Sync" },
    { color: "#75f975", id: "8", labelKey: "Sync" },
    // { color: "#d9d9d9", id: "all", labelKey: "All" },
  ];


  //State For Components Start
  const [state, setState] = useState({
    FromDate: new Date(),
    FromTime: "00:00:00",
    ToDate: new Date(),
    ToTime: "23:59:59",
    RegistredPatients: "",
    Type: "",
    MachineID: "",
    SampleID: "",
    // PageSize: "50",
  });
  //State For Components end

  //onChange Start
  const dateSelect = (date, name) => {
    setState({
      ...state,
      [name]: date,
    });
  };

  const paginationShow = useMemo(() => {
      // const data = columnConfig?.filter((ele) => ele?.visible);
      return tableData?.length > 0 ? true : false;
    }, [tableData]);
  //onChange End

  //For Checkbox Start For Future

  const handleSelectChange = (event) => {
    const { name, value } = event.target;
    setState({ ...state, [name]: value });
  };

  const handleReactSelect=(name, e)=>{
    setState(prev=>({...prev, [name]: e?.value}));
  }
  const { t, i18n } = useTranslation();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setState({
      ...state,
      [name]: type === "checkbox" ? (checked ? "1" : "0") : value,
    });
  };

  const BindMachineName = () => {
    axiosInstance
      // .get("Investigations/BindMachineList")
      .post("MachineGroup/LoadMachineMasterData")
      .then((res) => {
        let data = res?.data?.message;
        console.log(data);
        let val = data?.map((ele) => {
          return {
            value: ele?.MachineID,
            label: ele?.MachineName,
          };
        });

        val.unshift({ label: "Machine Id", value: "" });
        setMachineId(val);
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Error Occur",
        );
      });
  };

  const handleChangeSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(e.target.value);

    if (!value) {
      setTableData(masterTable);
      return;
    }

    const searchableKeys = [
      "LabNo",
      "Machine_ParamID",
      "MACHINE_ID",
      "machine_param",
      "dtEntry",
    ];

    const filtered = masterTable?.filter((row) =>
      searchableKeys.some((key) =>
        String(row[key] || "")
          .toLowerCase()
          .includes(value),
      ),
    );

    setTableData(filtered);
  };

  useEffect(() => {
    BindMachineName();
  }, []);

  // const currentTableData = useMemo(() => {
  //   if (typeof state?.PageSize === "number") {
  //     const firstPageIndex = (currentPage - 1) * state?.PageSize;
  //     const lastPageIndex = firstPageIndex + state?.PageSize;
  //     return tableData.slice(firstPageIndex, lastPageIndex);
  //   } else {
  //     return tableData;
  //   }
  // }, [currentPage, tableData]);

  //For Checkbox For Future end

  function handleTableButton(page) {
    setLoading(true);
    axiosInstance
      .post("MachineGroup/getMachineReading", {
        ...state,
        FromDate: moment(state?.FromDate).format("YYYY-MM-DD"),
        ToDate: moment(state?.ToDate).format("YYYY-MM-DD"),
        pageNumber: page || 1,
        pageSize: pageSize,
      })
      .then((res) => {
        if (res?.data?.data?.length > 0) {
          setTableData(res?.data?.data);
          setMasterTable(res?.data?.data);
        }
        else {
          setTableData([]);
          setMasterTable([]);
          toast.error("No Record Found");
        }
        setTotalCount(res?.data?.message?.totalRecords || 0);
        // setCurrentPage(1);
        setLoading(false);
      })
      .catch((err) => {
        setTableData([]);
        setMasterTable([]);
        toast.error(
          err?.response?.data?.data
            ? err?.response?.data?.data
            : "Error Occured",
        );
        setLoading(false);
      });
  }

  const exportExcel = () => {
    if (tableData?.length > 0) {
      const excelData = tableData.map((ele) => {
        return {
          ...ele,
          Period:
            "Period From : " +
            moment(state?.FromDate).format("YYYY-MMM-DD") +
            "To " +
            moment(state?.ToDate).format("YYYY-MMM-DD"),
        };
      });
      ExportToExcel(excelData);
    } else {
      toast.error("Not print Empty Data");
    }
  };
  // useEffect(() => {
    
  // }, [state?.PageSize]);
  console.log("tableData",tableData);

  return (
    <>
      <Accordion
        name={t("Machine Reading")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row  pt-2 pl-2 pr-2">
          <div className="col-sm-2">
            <DatePicker
              name="FromDate"
              id="FromDate"
              placeholder=""
              value={state?.FromDate}
              onChange={dateSelect}
              maxDate={new Date()}
              lable={t("FromDate")}
            />
            {errors?.FromDate && (
              <span className="error-message">{errors?.FromDate}</span>
            )}
          </div>
          <div className="col-sm-2">
            <DatePicker
              respclass={'w-100'}
              className={'w-100'}
              name="ToDate"
              id="ToDate"
              placeholder=""
              value={state?.ToDate}
              onChange={dateSelect}
              maxDate={new Date()}
              minDate={new Date(state.FromDate)}
              lable="ToDate"
            />
            {errors?.ToDate && (
              <span className="error-message">{errors?.ToDate}</span>
            )}
          </div>
          <div className="col-sm-2">
            <ReactSelect
                dynamicOptions={machineId}
                name="MachineID"
                id="MachineID"
                lable={t("Machine Name")}
                removeIsClearable={true}
                placeholderName={t("Machine Name")}
                value={state.MachineID}
                onChange={handleReactSelect}
                className={'w-100'}
            />
        
          </div>
          <div className="col-sm-2">
            <Input
              type="text"
              placeholder=""
              className="form-control input-sm"
              name="SampleID"
              id="SampleID"
              value={state?.SampleID}
              max={50}
              onChange={handleChange}
              lable={t("Barcode No")}
            />
          </div>
          <div className="col-sm-2">
            <SelectBox
              options={[{ label: "Select", value: "" }, ...Showonly]}
              onChange={handleSelectChange}
              name="Type"
              id="Type"
              placeholder=""
              selectedValue={state?.Type}
              lable={t("ShowOnly")}
            />
          </div>
          
           <div className="col-sm-1">
            <SearchButton
                text={"Search"}
                onClick={() => { handleTableButton(1)}}
            />
          </div>
          <div className="col-sm-1">
            <CustomButton
              text={"Report"}
              icon={"excel"}
              onClick={() => exportExcel()}
            />
          </div>
          <div className="col-sm-2">
            {/* <SelectBox
              options={NoOfRecord}
              onChange={handleSelectChange}
              name="PageSize"
              id="PageSize"
              placeholder=""
              selectedValue={state?.PageSize}
              lable={t("Page Size")}
            /> */}
          </div>
        </div>
        <div className="row  pt-1 pl-2 pr-2 mb-2">
          {/* <div className="col-sm-2 d-flex align-items-center">
            <input
              name="RegistredPatients"
              id="RegistredPatients"
              type="checkbox"
              checked={state?.RegistredPatients == 1 ? true : false}
              onChange={handleChange}
            />
            <label className="col-sm-10">
              {t("Not Registred Patients Only")}
            </label>
          </div> */}
         
        </div>
        <Heading
        title={t("Search Details")}
        secondTitle={
          <>
            <div className="col-sm-12 d-flex justify-content-end gap-custom p-0">
              {colorCodingData?.map(({ color, labelKey, id }) => (
                <ColorCodingSearch
                  key={id}
                  color={color}
                  label={t(labelKey)}
                  // onClick={() => handleStatusFilter(id)}
                  cursor="pointer"
                />
              ))}
              <FilterInput
                value={searchTerm}
                onChange={handleChangeSearch}
                placeholder="Filter Table"
                inputClass="transparent-background"
              />
            </div>
          </>
        }
      />
        {loading ? (
          <Loading />
        ) : (
          tableData.length > 0 ? (
            <>
              <Tables>
                <thead className="cf">
                  <tr>
                    <th>{t("S.No")}</th>
                    <th>{t("Barcode No")}</th>
                    <th>{t("Machine Name")}</th>
                    <th>{t("Machine_ParamID")}</th>
                    <th>{t("Alias")}</th>
                    <th>{t("Reading")}</th>
                    <th>{t("DtEntry")}</th>
                    {/* <th>{t("isSync")}</th> */}
                    
                  </tr>
                </thead>
                <tbody>
                  {tableData?.map((data, index) => {
                    const rowColor = data?.isSync === 1 ? '#75f975' : '#ffe58f';
                  return (
                    <tr key={index}
                    style={{ backgroundColor: rowColor, backgroundImage: 'none', color: 'black' }}
                    >
                      <td data-title={t("S.No")}>
                        {/* {index + 1 + IndexHandle(currentPage, state?.PageSize)} */}
                        {index + 1 }
                        &nbsp;
                      </td>
                      <td data-title={t("Barcode No")}>{data?.LabNo}&nbsp;</td>
                      <td data-title={t("Machine Name")}>
                        {data?.MACHINE_ID}&nbsp;
                      </td>
                      <td data-title={t("Machine_ParamID")}>
                        {data?.Machine_ParamID}&nbsp;
                      </td>
                      <td data-title={t("Alias")}>
                        {data?.machine_param ? data?.machine_param : "-"}&nbsp;
                      </td>
                      <td data-title={t("Reading")}>{data?.Reading}&nbsp;</td>
                      <td data-title={t("DtEntry")}>{data?.dtEntry}&nbsp;</td>
                      {/* <td data-title={t("isSync")}>{data?.isSync}&nbsp;</td> */}
                      
                    </tr>
                  )})}
                </tbody>
              </Tables>


              {paginationShow && tableData?.length > 0 && (
                <div className="d-flex flex-wrap justify-content-end">
                  
                  
                  {/* <label className="mt-4 mx-2">{t("No Of Record/Page")}</label>
                  
                
                  <SelectBox
                    className="mt-3 p-1 RecordSize mr-2"
                    selectedValue={pageSize}
                    options={[
                      { label: "All", value: totalCount }, 
                      ...Record,                           
                    ]}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);                  
                    }}
                  /> */}
                  
                  {/* ✅ Replaced Prev/Next + page number span with custom Pagination */}
                  <Pagination
                    className="pagination-bar mb-2"
                    currentPage={currentPage}
                    totalCount={totalCount}
                    pageSize={pageSize}
                    onPageChange={(page) => {
                      setCurrentPage(page)
                      handleTableButton(page)
                    }}
                  />
                  
                </div>
              )}
              {/* <div style={{ marginTop: "10px" }}>
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Prev
                </button>
                <span style={{ margin: "0 10px" }}>
                  Page {currentPage} of {Math.ceil(totalCount / pageSize)}
                </span>
                <button
                  disabled={currentPage === Math.ceil(totalCount / pageSize)}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                </button>
              </div>

              <div style={{ marginTop: "10px" }}>
                <label>Rows per page: </label>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1); // Reset to page 1
                  }}
                >
                  {[10, 20, 50, 100].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div> */}
              {/* {typeof state?.PageSize === "number" && (
                <Pagination
                  className="pagination-bar"
                  currentPage={currentPage}
                  totalCount={tableData.length}
                  pageSize={state?.PageSize}
                  onPageChange={(page) => setCurrentPage(page)}
                />
              )} */}
            </>
          ) : (
            <NoRecordFound />
          )
        )}
      </Accordion>
    </>
  );
};

export default MachineReading;
