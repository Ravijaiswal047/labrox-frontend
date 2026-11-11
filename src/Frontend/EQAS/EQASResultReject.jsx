import React, { useEffect, useState } from "react";
import Heading from "../../components/UI/Heading";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { useTranslation } from "react-i18next";
import EqasMenuList from "./EqasMenuList";
import CustomTable from "../../components/Table/CustomTable";
import Input from "../../components/formComponent/Input";
import { ViewMenu } from "../../components/SvgIcons";
import './Eqas.css'
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import ColorCodingSearch from "../../components/ModalComponent/ColorCodingSearch.jsx";
import { setLoading } from "../../store/reducers/loadingSlice/loadingSlice.js";
import { axiosInstance } from "../../utils/axiosInstance.jsx";
import { apiUrls } from "../../utils/apiUrls.js";
import { months, years } from "../../utils/Constants.jsx";
import { notify } from "../../utils/utils.js";
import { CustomButton } from "../../components/UI/CustomButton.jsx";
import { Tooltip as ReactTooltip } from "react-tooltip";

const EqasResultReject = () => {
  const [t] = useTranslation();
  const dispatch = useDispatch();
  const date = new Date();
  const [showMenu, setShowMenu] = useState(false);

  const colorCodingData = [
    { color: "#e595d8ef", id: "7", labelKey: "Rejected Data" },
    { color: "#75f975", id: "15", labelKey: "Approved Data" },
    { color: "#ffe58f", id: "16", labelKey: "Result Saved" },
    { color: "#5ae7d0ef", id: "17", labelKey: "Result Not Save" },
  ];
  const [payload, setPayload] = useState({
    centre: "",
    centreName: "",
    department: "",
    month: date.getMonth() + 1,
    year: date.getFullYear().toString(),
    RejectReason: "",
  });

  const [dropdownlist, setDropdownlist] = useState({
    centreList: [],
  });

  const [tableData, setTableData] = useState([]);

  // Update handler for search filters
  const handleSearchChange = (name, e) => {
    let value = e?.value;
    setPayload((prev) => ({ ...prev, [name]: value }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPayload((prev) =>
    ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const tableHeaders = [
    { header: "Sr No", field: "srNo", width: "60px" },
    { header: "Select", field: "select" },
    { header: "Processing Lab", field: "centre" },
    { header: "EQAS Provider", field: "EQASProvideName" },
    { header: "Visit No", field: "LedgerTransactionNO" },
    { header: "Barcode No", field: "barcodeno" },
    { header: "Test Name", field: "TestName" },
    { header: "Program Name", field: "ProgramName" },
    { header: "Program No", field: "ProgramNo" },
    { header: "Cycle No", field: "CycleNo" },
  ];

  const handleRowSelect = (e, row) => {
    const checked = e.target.checked;
    const selectedProgramName = row.ProgramName;

    setTableData(prev =>
      prev.map(item =>
        item.ProgramName === selectedProgramName
          ? { ...item, isChecked: checked }
          : item
      )
    );
  };

  const handleSearch = async () => {
    dispatch(setLoading(true));
    const regisYearAndMonth = `${payload?.month}#${payload?.year}`;

    const apiPayload = {
      processingCentre: payload?.centre?.toString() || "",
      regisYearAndMonth: regisYearAndMonth || "",
      deptID: payload?.department?.toString() || "",
    }

    await axiosInstance
      .post(apiUrls.getEQASResult, apiPayload)
      .then((res) => {
        console.log("res", res?.data);
        if (res?.data?.success) {
          const formattedData = res?.data?.data?.map((item, index) => ({
            ...item,

            // Sr No column
            srNo: index + 1,
            // Optional row color
            rowColor:
              item?.custatus === "Approved"
                ? "#75f975"
                : (item?.custatus === "ResultDone" && item.isReject === 0)
                  ? "#ffe58f"
                  : (item?.custatus === "ResultDone" && item.isReject === 1) ? "#e595d8ef" : (item?.custatus === "New" && item.isReject === 0) ? '#5ae7d0ef' : (item?.custatus === "New" && item.isReject === 1) ? "#e595d8ef" : "",
            isChecked: false,
          }));

          setTableData(formattedData);
        }
        else {
          notify(res?.data?.message, "success");
          setTableData([]);
        }

      })
      .catch((err) => {
        notify(err?.data?.message, "error");
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  }

  const handleReject = async () => {

    const checkedRows = tableData?.filter((row) => row.isChecked);

    if (checkedRows.length === 0) {
      notify("Please select at least one row", "error");
      return;
    }
    else if (payload?.RejectReason === "") {
      notify("Please Add Reject Reason", "error");
      return;
    }
    dispatch(setLoading(true));

    const apiPayload = {
      ILCResultData: checkedRows.map(
        (row) => `${row.id}#${row.test_id}`
      ) || [],
      rejectReason: payload?.RejectReason || "",
    };


    await axiosInstance
      .post(apiUrls.RejectNow, apiPayload)
      .then((res) => {
        console.log("res", res?.data);
        if (res?.data?.success) {
          notify(res?.data?.message || "Rejected successfully", "success");
          handleSearch();
        }
        else {
          notify(res?.data?.message || "Rejected successfully", "success");
        }

      })
      .catch((err) => {
        notify(err?.data?.message, "error");
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  }

  const getAllDepartments = async () => {
    // const searchPayload = { employeeId: "001" };
    dispatch(setLoading(true));

    await axiosInstance
      .get(apiUrls.GetDepartment)
      .then((res) => {
        const departmentList = res?.data?.message?.map((item) => ({
          ...item,
          label: item?.Department,
          value: item?.DepartmentID,
        }));
        setDropdownlist((prev) => ({ ...prev, departmentList }));
        // setPayload((prev) => ({ ...prev, department: departmentList?.[0]?.value}));
      })
      .catch((err) => {
        notify(err?.data?.message, "error");
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  };

  const getAllCentre = async () => {
    dispatch(setLoading(true));
    await axiosInstance
      .get(apiUrls.GetAccessProcessingLab)
      .then((res) => {
        console.log("res", res?.data);
        if (res?.data?.success) {
          const resList = res?.data?.message?.map((item) => ({
            ...item,
            label: item?.centre,
            value: item?.centreid,
          }));
          setDropdownlist((prev) => ({ ...prev, centreList: resList }));
          setPayload((prev) => ({ ...prev, centre: resList?.[0]?.value, centreName: resList?.[0]?.label }));

        }
      })
      .catch((err) => {
        notify(err?.data?.message, "error");
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  };

  const handleReset = () => {
    setPayload({
      centre: "",
      centreName: "",
      department: "",
      month: date.getMonth() + 1,
      year: date.getFullYear().toString(),
      RejectReason: "",
    })

    setTableData([]);
  }

  useEffect(() => {
    getAllCentre();
    getAllDepartments();
  }, []);

  console.log("payload", payload);
  console.log("tableData", tableData);

  return (
    <>
      {showMenu && <EqasMenuList />}

      <Heading
        title={"EQAS Result Reject"}
        secondTitle={
          <label onClick={() => setShowMenu((prev) => !prev)}>
            <ViewMenu />
          </label>
        }
      />

      <div className="main_resurlt_entry card py-2 px-2">
        {/* Search Filters */}
        <div className="row mb-3">
          <div className="col-sm-3 col-md-2 col-12">
            <ReactSelect
              dynamicOptions={dropdownlist?.centreList}
              name="centre"
              id="centre"
              removeIsClearable={false}
              placeholderName={t("Processing Lab")}
              value={payload?.centre}
              onChange={handleSearchChange}
              className="required-fields"
            />
          </div>
          <div className="col-sm-3 col-md-2 col-12">
            <ReactSelect
              dynamicOptions={dropdownlist?.departmentList}
              name="department"
              id="department"
              removeIsClearable={false}
              placeholderName={t("Department")}
              value={payload?.department}
              onChange={handleSearchChange}
              className="required-fields"
            />
          </div>
          <div className="col-sm-2 col-md-1 col-6">
            <ReactSelect
              dynamicOptions={months}
              name="month"
              id="month"
              removeIsClearable={false}
              placeholderName={t("Current Month")}
              value={payload?.month}
              onChange={handleSearchChange}
              className="required-fields"
            />
          </div>
          <div className="col-sm-2 col-md-1 col-6">
            <ReactSelect
              dynamicOptions={years}
              name="year"
              id="year"
              removeIsClearable={false}
              placeholderName={t("Current year")}
              value={payload?.year}
              onChange={handleSearchChange}
              className="required-fields"
            />
          </div>
          <div className="">
            {/* <Button className="px-4 mr-2" onClick={handleSearch}>Search</Button> */}
            <CustomButton text="Search" icon="search" onClick={handleSearch} className="mx-2" />
            <CustomButton text="Reset" icon="refresh" onClick={handleReset} className="mx-2" />
          </div>
        </div>

      </div>
      <Heading
        title={"EQAS Result Reject Data"}
        secondTitle={
          <>
            {colorCodingData.map(({ color, labelKey, id }) => (
              <ColorCodingSearch key={id} color={color} label={t(labelKey)} />
            ))}
          </>
        }
      />
      {/*Editable Table */}
      <div className="row d-flex mt-2 justify-content-end px-2">
        <div className="col-sm-2">
          <Input
            type="text"
            name="RejectReason"
            lable={t("Reject Reason")}
            id="rejectreason"
            value={payload.RejectReason}
            placeholder=" "
            onChange={handleChange}
          />
        </div>
        {/* <Button className="px-4 mr-2">Reject</Button> */}
        <CustomButton text="Reject" className="mr-2" onClick={handleReject} />
      </div>
      <div className="">
        <CustomTable
          columns={tableHeaders}
          // data={tableData}
          data={tableData?.map((row, index) => ({
            ...row,

            select:
              row?.custatus !== "Approved" ? (
                row?.isReject === 0 ? (
                  <input
                    type="checkbox"
                    checked={row.isChecked}
                    onChange={(e) => handleRowSelect(e, row)}
                  />
                ) : (
                  // <i
                  //   className="fa fa-search"
                  //   style={{ cursor: "pointer", color: "#0d6efd" }}
                  //   title="View"
                  // />
                  <>
                    <i
                      className="fa fa-search"
                      style={{ cursor: "pointer", color: "#0d6efd" }}
                      data-tooltip-id={`reject-tooltip-${row.id}`}
                    />
                    <ReactTooltip id={`reject-tooltip-${row.id}`} place="right"
                      style={{
                        zIndex: 99999,
                        padding: "4px",

                      }}
                      content={
                        row ? (
                          <div className="mb-2 p-2 text-white">
                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns: "max-content 1fr",
                                columnGap: "12px",
                                rowGap: "6px",
                                alignItems: "start",
                              }}
                            >
                              <strong>Reject By:</strong>
                              <div style={{ wordBreak: "break-word" }}>
                                {row.RejectByName || "N/A"}
                              </div>

                              <strong>Date:</strong>
                              <div style={{ wordBreak: "break-word" }}>
                                {row.RejectDateTime || "N/A"}
                              </div>

                              <strong>Reason:</strong>
                              <div style={{ wordBreak: "break-word", whiteSpace: "normal" }}>
                                {row.RejectReason || "N/A"}
                              </div>
                            </div>
                          </div>
                        ) : null
                      }
                    />
                  </>
                )
              ) : null,
          }))}
        />
      </div>

    </>
  );
};

export default EqasResultReject;


