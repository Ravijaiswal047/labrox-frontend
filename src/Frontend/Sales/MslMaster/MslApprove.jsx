import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import FunnelDetailsModal from "../../SalesFunnel/FunnelModal/FunnelDetailsModal";
import { axiosInstance } from "../../../utils/axiosInstance";
import Accordion from "../../../components/UI/Accordion";
import { Button } from "react-bootstrap";
import ReactSelect from "../../../components/formComponent/ReactSelect";
import Tables from "../../../components/UI/customTable";
import Heading from "../../../components/UI/Heading";
import NoRecordFound from "../../../components/formComponent/NoRecordFound";
import Loading from "../../../components/loader/Loading";
import { toast } from "react-toastify";
import RadioInput from "../../../components/formComponent/DocShareRadioInput";

const MslApprove = () => {
  const { t } = useTranslation();
  const [load, setLoad] = useState(false);
  const [BindFor, setBindFor] = useState([]);
  const currentYear = new Date().getFullYear();
  const [quarter, setQuarter] = useState([]);

  const [FormData, setFormData] = useState({
    employeeId: "",
    year: currentYear,
    quarter: "",
  });

  const [TableData, setTableData] = useState([]);
  const [show, setShow] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);

  const [toggle, setToggle] = useState({
    mode: "approve",
  });

  const yearOptions = [
    { label: "2024", value: "2024" },
    { label: "2025", value: "2025" },
    { label: "2026", value: "2026" },
    { label: "2027", value: "2027" },
    { label: "2028", value: "2028" },
    { label: "2029", value: "2029" },
    { label: "2030", value: "2030" },
  ];

  // const quarterOptions = [
  //   { label: "Q1 (Apr, May, Jun)", value: "1" },
  //   { label: "Q2 (Jul, Aug, Sep)", value: "2" },
  //   { label: "Q3 (Oct, Nov, Dec)", value: "3" },
  //   { label: "Q4 (Jan, Feb, Mar)", value: "4" },
  // ];

  const selectFields = [
    {
      name: "employeeId",
      label: "Sales Team",
      options: BindFor,
      autoSelectFirst: true,
    },
    {
      name: "year",
      label: "Financial Year",
      options: yearOptions,
      autoSelectFirst: true,
    },
    {
      name: "quarter",
      label: "quarter",
      options: quarter,
      autoSelectFirst: true,
    },
  ];

  const handleReactChange = (name, e) => {
    setFormData((prev) => ({ ...prev, [name]: e?.value }));
  };

  const getBindCreatedForDropDown = () => {
    axiosInstance.get("SalesFunnel/BindCreatedFor", {
      params: {
        bindfor: "mslapprove",
      },
    })
      .then((res) => {
        const data = res?.data?.message;
        const States = data?.map((ele) => {
          return {
            value: ele?.CreatedFor,
            label: ele?.CreatedForName,
          };
        });
        setBindFor(States);
      })
      .catch((err) => {
        toast.error(err?.res?.data ? err?.res?.data : "Something Went Wrong");
      });
  };

  const handleViewRow = async (id) => {
    try {
      setLoad(true);
      const res = await axiosInstance.post("SalesFunnel/Detail", {
        funnelId: String(id),
      });
      const resList = res?.data?.message;
      setSelectedRow(resList);
      setShow(true);
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log(error);
    }
  };
  const qurterMapping = () => {
    axiosInstance.get("SalesFunnel/QuaterDetail")
      .then((res) => {
        const data = res?.data?.message;
        const States = data?.map((ele) => {
          return {
            value: ele?.ID,
            label: `${ele?.QuarterName} ${ele?.QuaterMonthName}`
          };
        });
        setQuarter(States);
      })
      .catch((err) => {
        toast.error(err?.res?.data ? err?.res?.data : "Something Went Wrong");
      });
  };
  useEffect(() => {
    qurterMapping();
  }, []);

  const handleRowCheck = (row) => {
    const key = row?.MSLId;

    setSelectedRows((prev) =>
      prev.includes(key) ? prev.filter((id) => id !== key) : [...prev, key]
    );
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      const allIds = TableData.map((row) => row.MSLId);
      setSelectedRows(allIds);
    } else {
      setSelectedRows([]);
    }
  };

  const buildApprovePayload = () => {
    return {
      mslIds: selectedRows.flatMap((id) => String(id).split(",")).map(Number),
      Approved: toggle.mode === "approve" ? "1" : "0",
    };
  };

  const handleSearch = async () => {
    try {
      setLoad(true);
      const apiUrl = "SalesFunnel/MslList";
      const payload = {
        employeeId: Number(FormData.employeeId),
        quarter: String(FormData.quarter) || "-1",
        type: "2",
        year: String(FormData.year) || "-1",
        Approved: toggle.mode === "approve" ? "1" : "0",
      };

      const res = await axiosInstance.post(apiUrl, payload);
      // setTableData(res?.data?.success ? res.data.message : []);
      const list = res?.data?.success ? res.data.message : [];

      setTableData(list);

      // auto select all
      setSelectedRows(list.map((row) => row.MSLId));
      setLoad(false);
    } catch (err) {
      console.log(err);
      setTableData([]);
      setLoad(false);
    }
  };

  const handleSave = async () => {
    if (selectedRows.length === 0) {
      toast.error("Please select at least one record");
      return;
    }

    try {
      setLoad(true);
      const apiUrl = "SalesFunnel/ApproveMsl";
      const payload = buildApprovePayload();
      const res = await axiosInstance.post(apiUrl, payload);

      if (res?.data?.success) {
        toast.success(res?.data?.message);
        setSelectedRows([]);
        handleSearch();
      }
      setLoad(false);
    } catch (err) {
      console.log(err);
      toast.error("Something went wrong");
      setLoad(false);
    }
  };

  useEffect(() => {
    getBindCreatedForDropDown();
  }, []);

  useEffect(() => {
    setTableData([]);
  }, [toggle]);

  return (
    <>
      {show && (
        <FunnelDetailsModal
          show={show}
          onHide={() => setShow(false)}
          data={selectedRow}
        />
      )}
      <Accordion
        name={t("MslApprove/UnApprove")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row pt-2 pl-2 pr-3">
          <div className="d-flex align-items-center mb-2 pl-2">
            <RadioInput
              inputType="radio"
              className="mb-0"
              label="Approve MSL"
              id="approve"
              name="mode"
              value="approve"
              checked={toggle.mode === "approve"}
              onChange={(e) =>
                setToggle((prev) => ({ ...prev, mode: e.target.value }))
              }
            />
            <RadioInput
              inputType="radio"
              className="mb-0"
              label="UnApprove MSL"
              id="unApprove"
              name="mode"
              value="unApprove"
              checked={toggle.mode === "unApprove"}
              onChange={(e) =>
                setToggle((prev) => ({ ...prev, mode: e.target.value }))
              }
            />
          </div>
        </div>
        <div className="row pt-2 pl-2 pr-2">
          {selectFields.map((field) => (
            <div className="col-sm-3 col-md-2 mb-2" key={field.name}>
              <ReactSelect
                className="required-field"
                dynamicOptions={field.options}
                autoSelectFirst={field.autoSelectFirst}
                isShowBorder
                name={field.name}
                id={field.name}
                lable={t(field.label)}
                placeholderName={t(field.label)}
                value={FormData?.[field.name]}
                onChange={handleReactChange}
              />
            </div>
          ))}
          <div
            style={{ gap: "6px" }}
            className="d-flex px-2  d-flex justify-content-start"
          >
            <Button className="rounded" onClick={handleSearch}>
              Search
            </Button>
          </div>
        </div>
        <Heading
          title={t(
            toggle.mode === "approve"
              ? "UnApproved MSL-List"
              : "Approved MSL-List"
          )}
        />
        <div className="mb-4 inhouseTable">
          <Tables style={{
            maxHeight: "400px",
            overflowY: "auto",
          }}>
            <tr>
              <thead style={{ position: "sticky", top: 0, }}>
                <tr>
                  <th style={{ width: "2%" }}>{t("Sr.No.")}</th>
                  <th>{t("Employee Name")}</th>
                  <th>{t("State")}</th>
                  <th>{t("Lab Name")}</th>
                  <th>{t("Org.Name")}</th>
                  <th>{t("Cont.Person")}</th>
                  <th>{t("Dr. Name")}</th>
                  <th>{t("Client Contact")}</th>
                  <th>{t("Client Email")}</th>
                  <th>{t("Available Days")}</th>
                  <th>{t("Availability")}</th>
                  <th>{t("Prescriber/Non Prescriber")}</th>
                  <th>{t("Expected Business")}</th>
                  <th>{t("No of Calls")}</th>
                  <th>{t("Details")}</th>
                  {false && (
                    <th>
                      <input
                        type="checkbox"
                        checked={
                          TableData.length > 0 &&
                          selectedRows.length === TableData.length
                        }
                        onChange={(e) => handleSelectAll(e.target.checked)}
                      />
                    </th>)}
                </tr>
              </thead>
              {TableData.length > 0 ? (
                TableData.map((ele, index) => (
                  <tbody key={index}>
                    <tr>
                      <td data-title={t("S.No")}>{index + 1}&nbsp;</td>
                      <td data-title={t("Employee Name")}>
                        {ele?.EmployeeName}
                      </td>
                      <td data-title={t("State")}>{ele?.StateName}</td>
                      <td data-title={t("Lab Name")}>{ele?.CentreName}</td>
                      <td data-title={t("Org.Name")}>
                        {ele?.OrganizationName}
                      </td>
                      <td data-title={t("Cont.Person")}>
                        {ele?.ContactPersonName}
                      </td>
                      <td data-title={t("Dr. Name")}>{ele?.OPDDoctor}</td>
                      <td data-title={t("Client Contact")}>
                        {ele?.MobileNumber}
                      </td>
                      <td data-title={t("Client Email")}>{ele?.EmailId}</td>
                      <td data-title={t("Available Days")}>
                        {ele?.MeetingDays}
                      </td>
                      <td data-title={t("Availability")}>
                        {ele?.MeetingTime || ""}
                      </td>
                      <td data-title={t("Prescriber/Non Prescriber")}>
                        {ele?.ProspectTypeName}
                      </td>
                      <td data-title={t("Expected Business")}>
                        {ele?.ExpectedBusinessForecast}
                      </td>
                      <td data-title={t("No of Calls")}>
                        {ele?.NoOfExpectedCalls}
                      </td>
                      <td data-title={t("Details")}>
                        <button
                          className="btn btn-sm btn-info"
                          onClick={() => handleViewRow(ele?.FunnelId)}
                        >
                          {t("View")}
                        </button>
                      </td>
                      {false && (
                        <td data-title={t("Action")}>
                          <input
                            type="checkbox"
                            checked={selectedRows.includes(ele.MSLId)}
                            onChange={() => handleRowCheck(ele)}
                          />
                        </td>)}
                    </tr>
                  </tbody>
                ))
              ) : (
                <tbody>
                  <tr>
                    <td colSpan={17} className="text-center">
                      <NoRecordFound />
                    </td>
                  </tr>
                </tbody>
              )}
            </tr>
          </Tables>

          <div className="col-sm-1 mt-2 mb-2">
            {load ? (
              <Loading />
            ) : (
              <button
                className="btn btn-block btn-success btn-sm"
                onClick={handleSave}
              >
                {toggle.mode === "approve" ? t("Approve") : t("UnApprove")}
              </button>
            )}
          </div>
        </div>
      </Accordion>
    </>
  );
};

export default MslApprove;
