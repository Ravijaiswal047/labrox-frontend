import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { axiosInstance } from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import Accordion from "@app/components/UI/Accordion";
import Input from "../../components/formComponent/Input";
import FullTextEditor from "../../components/formComponent/TextEditor";
import Loading from "../../components/loader/Loading";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import ReactSelect from "../../components/formComponent/ReactSelect";
import DatePicker from "../../components/formComponent/DatePicker";
import { CustomButton } from "../../components/UI/CustomButton";
import Tables from "../../components/UI/customTable";
import Pagination from "../../Pagination/Pagination";

const AUDIT_PAGE_SIZE = 20;
const INITIAL_AUDIT_FILTERS = {
  FromDate: null,
  ToDate: null,
  CentreID: "",
  MacID: "",
  UserName: "",
  ActionType: "",
};

const InvestigationsInterpretion = () => {
  const location = useLocation();
  const { state } = location;
  const navigate = useNavigate();
  const [CentreData, setCentreData] = useState([]);
  const [load, setLoad] = useState(false);
  const [Machine, setMachine] = useState([]);
  const [Editable, setEditable] = useState(false);
  const [Editor, setEditor] = useState("");
  const [isUpdateExist, setIsUpdateExist] = useState(false);
  const [auditFilters, setAuditFilters] = useState(INITIAL_AUDIT_FILTERS);
  const [auditRows, setAuditRows] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditTotalCount, setAuditTotalCount] = useState(0);
  const [auditPage, setAuditPage] = useState(1);
  const { ShowDefaultLoginCentre, DefaultCentre } = useLocalStorage("userData", "get");
  const [payload, setPayload] = useState({
    CentreID: "",
    MacID: "",
    Interpretation: "",
    InvestigationID: state?.InvestigationID ? state?.InvestigationID : "",
    PrintInterPackage: 0,
    UpdateExisting: 0,
  });

  const { t } = useTranslation();
  const fetch = (centre, mac) => {
    axiosInstance
      .post(state?.url, {
        CentreID: centre?.toString(),
        InvestigationID: payload?.InvestigationID,
        MacID: mac?.toString(),
      })
      .then((res) => {
        if (res?.data?.message.length === 0) {
          toast.success("No Data Found");
          setPayload((previous) => ({
            ...previous,
            CentreID: centre,
            MacID: mac,
            Interpretation: "",
            PrintInterPackage: 0,
            UpdateExisting: 0,
          }));
          setEditor("");
          setEditable(true);
          setIsUpdateExist(true);
        } else {
          const data = res?.data?.message[0];
          setPayload((previous) => ({
            ...previous,
            CentreID: data?.CentreID,
            MacID: data?.MacID,
            Interpretation: data?.Interpretation,
            InvestigationID: data?.InvestigationID,
            PrintInterPackage: 0,
          }));
          setEditor(data?.Interpretation);
          setEditable(true);
          setIsUpdateExist(false);
        }
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Error Occured",
        );
        setIsUpdateExist(true);
        setPayload((previous) => ({
          ...previous,
          UpdateExisting: 0,
        }));
      });
  };

  const formatRequestDate = (value) => {
    if (!(value instanceof Date)) return null;
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const loadAudit = useCallback(
    async (page = 1, filters = auditFilters) => {
      setAuditLoading(true);
      try {
        const response = await axiosInstance.post(
          "Investigations/GetInterpretationAudit",
          {
            FromDate: formatRequestDate(filters.FromDate),
            ToDate: formatRequestDate(filters.ToDate),
            CentreID: filters.CentreID || null,
            MacID: filters.MacID || null,
            UserName: filters.UserName?.trim() || null,
            ActionType: filters.ActionType || null,
            InvestigationID: payload.InvestigationID || null,
            PageNumber: page,
            PageSize: AUDIT_PAGE_SIZE,
          },
        );
        setAuditRows(response?.data?.data || []);
        setAuditTotalCount(response?.data?.totalCount || 0);
        setAuditPage(page);
      } catch (error) {
        setAuditRows([]);
        setAuditTotalCount(0);
        toast.error(
          error?.response?.data?.message || "Unable to load interpretation audit.",
        );
      } finally {
        setAuditLoading(false);
      }
    },
    [auditFilters, payload.InvestigationID],
  );

  const SaveInterpretion = () => {
    if (payload?.CentreID && payload?.MacID) {
      setLoad(true);
      axiosInstance
        .post("Investigations/SaveInterpretation", {
          ...payload,
          PrintInterPackage: payload?.PrintInterPackage?.toString(),
          UpdateExisting: payload?.UpdateExisting,
          CentreID: payload?.CentreID,
          MacID: payload?.MacID,
        })
        .then((res) => {
          setLoad(false);
          if (res.data.success) {
            toast.success(res.data.message);
            loadAudit(1);
          } else {
            toast.error(res.data.message || "Something went wrong");
          }
        })
        .catch((err) => {
          toast.error(err.response.data.message);
          setLoad(false);
          if (err?.response?.status === 504) {
            toast.error("Something went wrong");
          }
        });
    } else {
      toast.error("Please Choose Centre and Machine");
    }
  };

  const getMachine = (centreID = "") => {
    axiosInstance
      .get("Investigations/BindMachineList")
      .then((res) => {
        let data = res.data.message;
        let Machine = data.map((ele) => {
          return {
            value: ele.MachineId,
            label: ele.MachineName,
          };
        });
        setMachine(Machine);
        setPayload((prev) => ({ ...prev, MacID: 14 }));
        fetch(centreID, 14);
      })
      .catch((err) => console.log(err));
  };

  const getAccessCentres = () => {
    axiosInstance
      .get("Centre/getAccessCentres")
      .then((res) => {
        let data = res.data.message;
        let CentreDataValue = data.map((ele) => {
          return {
            value: ele.CentreID,
            label: ele.Centre,
          };
        });
        setCentreData(CentreDataValue);
        if (ShowDefaultLoginCentre === "1") {
          setPayload((prev) => ({ ...prev, CentreID: DefaultCentre }))
          getMachine(DefaultCentre);
        }
        else{
          getMachine("");
        }
        
        
      })
      .catch((err) => console.log(err));
  };

  const handleSelectChange = (name, e) => {
    // const { name, value } = event.target;

    name === "CentreID"
      ? fetch(e?.value, payload?.MacID)
      : fetch(payload?.CentreID, e?.value);
  };

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setPayload({
      ...payload,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    });
  };

  useEffect(() => {
    setPayload((previous) => ({ ...previous, Interpretation: Editor }));
  }, [Editor]);

  useEffect(() => {
    getAccessCentres();
    loadAudit(1, INITIAL_AUDIT_FILTERS);
  }, []);

  const updateAuditSelect = (name, option) => {
    setAuditFilters((previous) => ({
      ...previous,
      [name]: option?.value ?? "",
    }));
  };

  const clearAuditFilters = () => {
    setAuditFilters(INITIAL_AUDIT_FILTERS);
    loadAudit(1, INITIAL_AUDIT_FILTERS);
  };

  const formatAuditDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
  };

  const plainText = (value) => {
    if (!value) return "-";
    return String(value)
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/\s+/g, " ")
      .trim() || "-";
  };

  const read = (row, key) =>
    row?.[key] ?? row?.[`${key[0].toLowerCase()}${key.slice(1)}`];

  return (
    <>
      <Accordion
        name={"Investigations Interpretion"}
        defaultValue={true}
        isBreadcrumb={true}
        backButton={true}
      >
        <div className="row pt-2 pl-2 pr-2">
          <div className="col-sm-2">
            <Input
              placeholder=" "
              lable="TestName"
              id="TestName"
              disabled={true}
              value={state?.data}
              name="TestName"
            />
          </div>
          <div className="col-sm-2">

            {/* <SelectBox
              options={[{ label: "Select Centre", value: "" }, ...CentreData]}
              onChange={handleSelectChange}
              name="CentreID"
              id="Centre Name"
              lable="Centre Name"
              selectedValue={payload?.CentreID}
            /> */}
            <ReactSelect
              name="CentreID"
              id="Centre Name"
              // lable="Centre Name"
              removeIsClearable={true}
              dynamicOptions={[{ label: "Select Centre", value: "" }, ...CentreData]}
              placeholderName={t("Centre Name")}
              value={payload?.CentreID}
              onChange={handleSelectChange}

            />
          </div>
          <div className="col-sm-2">
            {/* <SelectBox
              options={[{ label: "Select Machine", value: "" }, ...Machine]}
              id="Machine"
              lable="Machine"
              onChange={handleSelectChange}
              name="MacID"
              selectedValue={payload?.MacID}
            /> */}
            <ReactSelect
              name="MacID"
              id="Machine"
              // lable="Centre Name"
              removeIsClearable={true}
              dynamicOptions={[{ label: "Select Machine", value: "" }, ...Machine]}
              placeholderName={t("Machine")}
              value={payload?.MacID}
              onChange={handleSelectChange}

            />
          </div>
          <div className="col-sm-1 mt-1 d-flex">
            <div className="mt-1">
              <input
                name="PrintInterPackage"
                type="checkbox"
                checked={payload?.PrintInterPackage === 1}
                onChange={handleChange}
              />
            </div>
            <label className="control-label ml-2">{t("For All Centre")}</label>
          </div>

          <div className="col-sm-2 mt-1 d-flex">
            <div className="mt-1">
              <input
                name="UpdateExisting"
                type="checkbox"
                checked={payload?.UpdateExisting === 1}
                onChange={handleChange}
                id="UpdateExisting"
                disabled={isUpdateExist}
              />
            </div>
            <label className="control-label ml-2" htmlFor="UpdateExisting">
              {t("Update Existing")}
            </label>
          </div>
        </div>
        <div className="row pt-2 pl-2 pr-2">
          <div className="col-sm-12">
            <FullTextEditor
              value={payload?.Interpretation}
              setValue={setEditor}
              EditTable={Editable}
              setEditTable={setEditable}
            />
          </div>
        </div>
        <div className="row pt-2 pl-2 pr-2 pb-2">
          <div className="col-sm-1">
            {load ? (
              <Loading />
            ) : (
              <button
                className="btn btn-block btn-success btn-sm "
                onClick={SaveInterpretion}
              >
                {t("Save")}
              </button>
            )}
          </div>
          <div className="col-sm-1">
            {state?.flag ? (
              <Link
                to="/Investigations"
                state={{
                  other: {
                    button: "Update",
                    pageName: "Edit",
                    showButton: true,
                  },
                  url1: state?.url1,
                  url: "Investigations/UpdateInvestigation",
                }}
              >
                <span className="btn btn-block btn-primary btn-sm">
                  {" "}
                  {t("Back")}
                </span>
              </Link>
            ) : (
              <button
                className="btn btn-block btn-primary btn-sm"
                onClick={() => navigate(-1)}
              >
                {" "}
                {t("Back")}
              </button>
            )}
          </div>
        </div>
      </Accordion>
      <Accordion
        name={"Interpretation Audit Log"}
        defaultValue={true}
      >
        <div className="row pt-2 px-2">
          <div className="col-xl-2 col-md-4">
            <DatePicker
              id="InterpretationAuditFromDate"
              name="FromDate"
              lable="From Date"
              value={auditFilters.FromDate}
              maxDate={auditFilters.ToDate || undefined}
              onChange={(value, name) =>
                setAuditFilters((previous) => ({ ...previous, [name]: value }))
              }
            />
          </div>
          <div className="col-xl-2 col-md-4">
            <DatePicker
              id="InterpretationAuditToDate"
              name="ToDate"
              lable="To Date"
              value={auditFilters.ToDate}
              minDate={auditFilters.FromDate || undefined}
              onChange={(value, name) =>
                setAuditFilters((previous) => ({ ...previous, [name]: value }))
              }
            />
          </div>
          <div className="col-xl-2 col-md-4">
            <ReactSelect
              id="InterpretationAuditCentre"
              name="CentreID"
              dynamicOptions={[
                { label: "All Centres", value: "" },
                ...CentreData,
              ]}
              placeholderName={t("Centre")}
              value={auditFilters.CentreID}
              onChange={updateAuditSelect}
            />
          </div>
          <div className="col-xl-2 col-md-4">
            <ReactSelect
              id="InterpretationAuditMachine"
              name="MacID"
              dynamicOptions={[
                { label: "All Machine Groups", value: "" },
                ...Machine,
              ]}
              placeholderName={t("Machine Group")}
              value={auditFilters.MacID}
              onChange={updateAuditSelect}
            />
          </div>
          <div className="col-xl-2 col-md-4">
            <Input
              type="text"
              id="InterpretationAuditUser"
              name="UserName"
              lable="User ID / Name"
              value={auditFilters.UserName}
              onChange={(event) =>
                setAuditFilters((previous) => ({
                  ...previous,
                  UserName: event.target.value,
                }))
              }
            />
          </div>
          <div className="col-xl-2 col-md-4">
            <ReactSelect
              id="InterpretationAuditAction"
              name="ActionType"
              dynamicOptions={[
                { label: "All Actions", value: "" },
                { label: "Insert", value: "Insert" },
                { label: "Update", value: "Update" },
                { label: "Delete", value: "Delete" },
              ]}
              placeholderName={t("Action Type")}
              value={auditFilters.ActionType}
              onChange={updateAuditSelect}
            />
          </div>
        </div>
        <div className="d-flex gap-2 px-2 pb-2">
          <CustomButton
            text="Search"
            icon="search"
            loading={auditLoading}
            onClick={() => loadAudit(1)}
          />
          <CustomButton
            text="Clear"
            icon="cancel"
            variant="secondary"
            disabled={auditLoading}
            onClick={clearAuditFilters}
          />
        </div>

        {auditLoading ? (
          <Loading />
        ) : (
          <>
            <div className="table-wrapper px-2">
              <Tables style={{ maxHeight: "460px" }}>
                <thead>
                  <tr>
                    <th>{t("Date & Time")}</th>
                    <th>{t("Action")}</th>
                    <th>{t("Investigation")}</th>
                    <th>{t("Centre")}</th>
                    <th>{t("Machine Group")}</th>
                    <th>{t("Previous Interpretation")}</th>
                    <th>{t("New Interpretation")}</th>
                    <th>{t("User ID / Name")}</th>
                  </tr>
                </thead>
                <tbody>
                  {auditRows.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-3">
                        {t("No interpretation audit records found.")}
                      </td>
                    </tr>
                  ) : (
                    auditRows.map((row) => (
                      <tr key={read(row, "ID")}>
                        <td>{formatAuditDate(read(row, "DtEntry"))}</td>
                        <td>{read(row, "ActionType")}</td>
                        <td>
                          {read(row, "InvestigationName") || "-"} (
                          {read(row, "InvestigationID")})
                        </td>
                        <td>
                          {read(row, "CentreName") || read(row, "CentreID")}
                        </td>
                        <td>
                          {read(row, "MachineGroupName") || read(row, "MacID")}
                        </td>
                        <td title={plainText(read(row, "PreviousInterpretation"))}>
                          {plainText(read(row, "PreviousInterpretation"))}
                        </td>
                        <td title={plainText(read(row, "NewInterpretation"))}>
                          {plainText(read(row, "NewInterpretation"))}
                        </td>
                        <td>
                          {read(row, "CreatedBy")} /{" "}
                          {read(row, "CreatedByName") || "-"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Tables>
            </div>
            <div className="d-flex justify-content-between align-items-center px-2 pb-2">
              <span>
                {t("Total Records")}: {auditTotalCount}
              </span>
              <Pagination
                className="pagination-bar"
                currentPage={auditPage}
                totalCount={auditTotalCount}
                pageSize={AUDIT_PAGE_SIZE}
                onPageChange={(page) => loadAudit(page)}
              />
            </div>
          </>
        )}
      </Accordion>
    </>
  );
};

export default InvestigationsInterpretion;
