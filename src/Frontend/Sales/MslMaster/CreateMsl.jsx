import { use, useEffect, useState } from "react";
import Accordion from "../../../components/UI/Accordion";
import { useTranslation } from "react-i18next";
import Loading from "../../../components/loader/Loading";
import ReactSelect from "../../../components/formComponent/ReactSelect";
import { axiosInstance } from "../../../utils/axiosInstance";
import { toast } from "react-toastify";
import Tables from "../../../components/UI/customTable";
import NoRecordFound from "../../../components/formComponent/NoRecordFound";
import { Button } from "react-bootstrap";
import FunnelDetailsModal from "../../SalesFunnel/FunnelModal/FunnelDetailsModal";
import RadioInput from "../../../components/formComponent/DocShareRadioInput";
import Heading from "../../../components/UI/Heading";
import CopyMslModal from "./MslModal/CopyMslModal";
import ColorCodingSearch from "../../../components/ModalComponent/ColorCodingSearch";


const CreateMsl = () => {
  const { t } = useTranslation();
  const [load, setLoad] = useState(false);
  const currentYear = new Date().getFullYear();
  const [FormData, setFormData] = useState({
    employeeId: "",
    taggedWith: "",
    businessProfession: "",
    expectedCategory: "",
    interestLevel: "",
    year: currentYear,
    quarter: "",
    funnelType: "",
    start: "",
    limit: "",
  });

  const [toggle, setToggle] = useState({
    mode: "funnelData",
  });

  const [TaggedWith, setTaggedWith] = useState([]);
  const [BusinessProfession, setBusinessProfession] = useState([]);
  const [ExpectedCalls, setExpectedCalls] = useState([]);
  const [InterestLevel, setInterestLevel] = useState([]);
  const [BindFor, setBindFor] = useState([]);
  const [TableData, setTableData] = useState([]);
  const [show, setShow] = useState(false);
  const [show1, setShow1] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [quarter, setQuarter] = useState([]);

  const yearOptions = [
    { label: "2024", value: "2024" },
    { label: "2025", value: "2025" },
    { label: "2026", value: "2026" },
    { label: "2027", value: "2027" },
    { label: "2028", value: "2028" },
    { label: "2029", value: "2029" },
    { label: "2030", value: "2030" },
  ];

  const handleReactChange = (name, e) => {
    setFormData((prev) => ({ ...prev, [name]: e?.value }));
  };

  // const quarterOptions = [
  //   { label: "Q1 (Apr, May, Jun)", value: "1" },
  //   { label: "Q2 (Jul, Aug, Sep)", value: "2" },
  //   { label: "Q3 (Oct, Nov, Dec)", value: "3" },
  //   { label: "Q4 (Jan, Feb, Mar)", value: "4" },
  // ];

  const funnelTypeOptions = [
    { label: "Select", value: "-1" },
    { label: "New", value: "0" },
    { label: "Removed", value: "1" },
  ];

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
    {
      name: "taggedWith",
      label: "Tagged With",
      options: [
        { label: "Select", value: "" },
        ...TaggedWith
      ],
    },
    {
      name: "businessProfession",
      label: "Business Profession",
      options: [
        { label: "Select", value: "" },
        ...BusinessProfession
      ],
    },
    {
      name: "expectedCategory",
      label: "Expected Category",
      options: [
        { label: "Select", value: "" },
        ...ExpectedCalls
      ],
    },
    {
      name: "interestLevel",
      label: "Interest Level",
      options: [
        { label: "Select", value: "" },
        ...InterestLevel
      ],
    },

    {
      name: "funnelType",
      label: "Funnel Type",
      options: funnelTypeOptions,
    },
  ];

  const colorCodingData = [
    { color: "#26f30b", id: "1", labelKey: "Approved" },
    { color: "orange", id: "2", labelKey: "Saved" },

  ];

  const getCentreType1 = async () => {
    try {
      setLoad(true);
      const res = await axiosInstance.get("SalesFunnel/CentreType1");
      const resList =
        res?.data?.message?.map((item) => ({
          label: item?.type,
          value: item?.Id,
        })) || [];
      setTaggedWith(resList || []);
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log(error);
    }
  };

  const getBusinessProfession = async () => {
    try {
      setLoad(true);
      const res = await axiosInstance.get("SalesFunnel/BusinessProfession");
      const resList =
        res?.data?.message?.map((item) => ({
          label: item?.BusinessProfessionName,
          value: item?.BusinessProfessionId,
        })) || [];
      setBusinessProfession(resList || []);
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log(error);
    }
  };

  const getExpectedCategoryDropDown = () => {
    axiosInstance
      .get("SalesFunnel/ExpectedCategory")
      .then((res) => {
        const data = res?.data?.message;
        const States = data?.map((ele) => {
          return {
            value: ele?.ExpectedCategoryId,
            label: ele?.ExpectedCategoryName,
          };
        });
        setExpectedCalls(States);
      })
      .catch((err) => {
        toast.error(err?.res?.data ? err?.res?.data : "Something Went Wrong");
      });
  };

  const getInterestLevelDropDown = () => {
    axiosInstance
      .get("SalesFunnel/InterestLevel")
      .then((res) => {
        const data = res?.data?.message;
        const States = data?.map((ele) => {
          return {
            value: ele?.InterestLevelId,
            label: ele?.InterestLevelName,
          };
        });
        setInterestLevel(States);
      })
      .catch((err) => {
        toast.error(err?.res?.data ? err?.res?.data : "Something Went Wrong");
      });
  };

  const getBindCreatedForDropDown = () => {
    axiosInstance.get("SalesFunnel/BindCreatedFor", {
      params: {
        bindfor: "mslmaster",
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

  const handleSearch = async (isMslList = false) => {
    try {
      setLoad(true);

      const apiUrl = isMslList
        ? "SalesFunnel/MslList"
        : "SalesFunnel/MslFunnels";

      const payload = isMslList
        ? {
          employeeId: Number(FormData.employeeId),
          quarter: String(FormData.quarter) || "-1",
          type: String(FormData.funnelType) || "2",
          year: String(FormData.year) || "-1",
          taggedWith: String(FormData.taggedWith) || "-1",
          businessProfession: String(FormData.businessProfession) || "-1",
          expectedCategory: String(FormData.expectedCategory) || "-1",
          interestLevel: String(FormData.interestLevel) || "-1",
        }
        : {
          employeeId: Number(FormData.employeeId),
          quarter: String(FormData.quarter) || "-1",
          funnelType: String(FormData.funnelType) || "-1",
          year: String(FormData.year) || "-1",
          taggedWith: String(FormData.taggedWith) || "-1",
          businessProfession: String(FormData.businessProfession) || "-1",
          expectedCategory: String(FormData.expectedCategory) || "-1",
          interestLevel: String(FormData.interestLevel) || "-1",
        };

      const res = await axiosInstance.post(apiUrl, payload);
      setTableData(res?.data?.success ? res.data.message : []);
      setLoad(false);
    } catch (err) {
      console.log(err);
      setTableData([]);
      setLoad(false);
    }
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

  const getRowKey = (row) =>
    toggle.mode === "mslList" ? row?.MSLId : row?.FunnelId;

  const handleRowCheck = (row) => {
    const key = getRowKey(row);

    setSelectedRows((prev) =>
      prev.includes(key) ? prev.filter((id) => id !== key) : [...prev, key]
    );
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      const selectableRows = TableData.filter(
        (row) => row.IsAdded !== 1
      );
      const allKeys = selectableRows.map((row) => getRowKey(row));
      setSelectedRows(allKeys);
    } else {
      setSelectedRows([]);
    }
  };
  const selectableRows = TableData.filter(
    (row) => row.IsAdded !== 1
  );
  const buildAddPayload = () => {
    return {
      items: TableData.filter((row) => selectedRows.includes(row.FunnelId)).map(
        (row) => ({
          funnelId: row.FunnelId,
          employeeId: Number(FormData.employeeId),
          year: String(FormData.year),
          type: "2",
          quarter: String(FormData.quarter),
          employeeName: row.EmployeeName,
        })
      ),
    };
  };

  const buildDeletePayload = () => {
    return {
      mslIds: selectedRows.flatMap((id) => String(id).split(",")).map(Number),
    };
  };

  const handleSave = async () => {
    debugger;
    if (selectedRows.length === 0) {
      toast.error("Please select at least one record");
      return;
    }

    try {
      setLoad(true);

      const apiUrl =
        toggle.mode === "mslList"
          ? "SalesFunnel/MslDelete"
          : "SalesFunnel/MslAdd";

      const payload =
        toggle.mode === "mslList" ? buildDeletePayload() : buildAddPayload();

      const res = await axiosInstance.post(apiUrl, payload);

      if (res?.data?.success) {
        toast.success("Operation Successful");
        setSelectedRows([]);
        handleSearch(toggle.mode === "mslList");
      } else {
        toast.error("Operation Failed");
      }

      setLoad(false);
    } catch (err) {
      console.log(err);
      toast.error("Something went wrong");
      setLoad(false);
    }
  };

  useEffect(() => {
    getCentreType1();
    getBusinessProfession();
    getExpectedCategoryDropDown();
    getInterestLevelDropDown();
    getBindCreatedForDropDown();
  }, []);

  useEffect(() => {
    setTableData([]);
  }, [toggle]);


  const hasAnyApproved =
    TableData.length > 0 &&
    TableData.some(row => row.IsApproved === 1);

  useEffect(() => {
    if (!hasAnyApproved) return;

    toast.success(
      `Some Records are Approved in Year : ${FormData.year}, Quarter : ${FormData.quarter}`
    );
  }, [hasAnyApproved]);


  return (
    <>

      {show && (
        <FunnelDetailsModal
          show={show}
          onHide={() => setShow(false)}
          data={selectedRow}
        />
      )}

      {show1 && (
        <CopyMslModal
          show={show1}
          onHide={() => setShow1(false)}
          EmpId={FormData.employeeId}
        />
      )}

      <Accordion name={t("Create MSL")} defaultValue={true} isBreadcrumb={true}>
        <div className="row pt-2 pl-2 pr-3">
          <div className="d-flex align-items-center mb-2 pl-2">
            <RadioInput
              inputType="radio"
              className="mb-0"
              label="Funnel Data"
              id="funnelData"
              name="mode"
              value="funnelData"
              checked={toggle.mode === "funnelData"}
              onChange={(e) =>
                setToggle((prev) => ({ ...prev, mode: e.target.value }))
              }
            />
            <RadioInput
              inputType="radio"
              className="mb-0"
              label="Added MSL List"
              id="mslList"
              name="mode"
              value="mslList"
              checked={toggle.mode === "mslList"}
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
                dynamicOptions={field.options}
                autoSelectFirst={field.autoSelectFirst}
                isShowBorder
                name={field.name}
                id={field.name}
                lable={t(field.label)}
                placeholderName={t(field.label)}
                value={FormData?.[field.name]}
                onChange={handleReactChange}
                removeIsClearable={true}
              />

            </div>
          ))}
          <div
            style={{ gap: "6px" }}
            className="d-flex px-2  d-flex justify-content-start"
          >
            <Button
              className="rounded"
              onClick={() => handleSearch(toggle.mode === "mslList")}
            >
              Search
            </Button>
          </div>
          <div
            style={{ gap: "6px" }}
            className="d-flex px-2  d-flex justify-content-start"
          >
            <Button className="rounded" onClick={() => setShow1(true)}>
              Copy MSL
            </Button>
          </div>
        </div>
        {hasAnyApproved &&
          <div className="row pt-2 justify-content-center">
            <div
              className="col-auto text-center px-4 py-2"
              style={{
                backgroundColor: "#fdecea",
                border: "1px solid #f5c6cb",
                borderRadius: "8px",
                color: "#b02a37",
                fontFamily: "poppins, sans-serif",
                fontWeight: "600",
                fontSize: "18px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
              }}
            >

              Some Records are Approved in Year : {FormData.year}, Quarter : {FormData.quarter}
            </div>
          </div>}
        <Heading
          title={t(
            toggle.mode === "mslList" ? "Added MSL-List" : "Funnel Data"
          )}
          secondTitle={
            <>
              {colorCodingData?.map(({ color, labelKey, id }) => (
                <ColorCodingSearch
                  key={id}
                  color={color}
                  label={t(labelKey)}
                //   onClick={() => handleCallViewMedReq(id)}
                />
              ))}
            </>
          }

        />
        <div className="mb-4 inhouseTable">
          <Tables style={{
            maxHeight: "400px",
            overflowY: "auto",
          }}>
            <table className="table">
              <thead style={{ position: "sticky", top: 0 }}>
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

                  {(
                    <th>
                      <input
                        type="checkbox"
                        checked={
                          selectableRows.length > 0 &&
                          selectedRows.length === selectableRows.length
                        }
                        onChange={(e) => handleSelectAll(e.target.checked)}
                      />
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {TableData.length > 0 ? (
                  TableData.map((ele, index) => {
                    const isApproved = ele?.IsApproved === 1;
                    const isAdded = ele?.IsAdded === 1;
                    const isDisabled = isApproved || isAdded;

                    return (
                      <tr
                        key={index}
                        style={{
                          backgroundColor: isApproved
                            ? "#26f30b"
                            : isAdded
                              ? "orange"
                              : "",
                        }}
                      >
                        <td data-title={t("S.No")}>{index + 1}</td>
                        <td data-title={t("Employee Name")}>{ele?.EmployeeName}</td>
                        <td data-title={t("State")}>{ele?.StateName}</td>
                        <td data-title={t("Lab Name")}>{ele?.CentreName}</td>
                        <td data-title={t("Org.Name")}>{ele?.OrganizationName}</td>
                        <td data-title={t("Cont.Person")}>{ele?.ContactPersonName}</td>
                        <td data-title={t("Dr. Name")}>{ele?.OPDDoctor}</td>
                        <td data-title={t("Client Contact")}>{ele?.MobileNumber}</td>
                        <td data-title={t("Client Email")}>{ele?.EmailId}</td>
                        <td data-title={t("Available Days")}>{ele?.MeetingDays}</td>
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

                        {/* View Button */}
                        <td>
                          <button
                            className="btn btn-sm btn-info"
                            onClick={() => handleViewRow(ele?.FunnelId)}
                          >
                            {t("View")}
                          </button>
                        </td>

                        {/* Checkbox */}
                       
                          <td>
                            <input
                              type="checkbox"
                              disabled={isApproved || isAdded}
                              checked={selectedRows.includes(getRowKey(ele))}
                              onChange={() => handleRowCheck(ele)}
                            />
                          </td>
                      
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={17} className="text-center">
                      <NoRecordFound />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Tables>

          <div className="col-sm-1 mt-2 mb-2">
            {load && <Loading />}

            {!load && (
              <button
                className="btn btn-block btn-success btn-sm"
                onClick={handleSave}
              >
                {toggle.mode === "mslList" ? t("Remove") : t("Save")}
              </button>
            )}
          </div>
        </div>
      </Accordion >
    </>
  );
};

export default CreateMsl;
