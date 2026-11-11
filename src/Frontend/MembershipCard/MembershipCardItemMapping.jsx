import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { axiosInstance } from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import Accordion from "@app/components/UI/Accordion";
import Loading from "../../components/loader/Loading";
import Tables from "../../components/UI/customTable";
import Input from "../../components/formComponent/Input";
import { number } from "../../utils/helpers";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { CancelButton, CustomButton, SaveButton } from "../../components/UI/CustomButton";
import { Dialog } from "primereact/dialog";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import MembershipCardImportExportModal from "../utils/MembershipCardImportExportModal";
import MembershipCardTransferModal from "../utils/MembershipCardTransferModal";
import DateTimeCell from "../../utils/DateTimeCell";

const MembershipCardItemMapping = () => {
  const theme = useLocalStorage("theme", "get");

  const [Memberships, setMemberships] = useState([]);
  const [Department, setDepartment] = useState([]);
  const [tabledata, setTableData] = useState([]);
  const [searchText, setSearchText] = useState("");

  const [openImportExport, setOpenImportExport] = useState(false);
  const [openTransfer, setOpenTransfer] = useState(false);

  // ── Log Dialog State ──
  const [showLogModal, setShowLogModal] = useState(false);
  const [logData, setLogData] = useState([]);
  const [logLoading, setLogLoading] = useState(false);
  const [selectedLogRow, setSelectedLogRow] = useState(null);

  const [payload, setPayload] = useState({
    MembershipId: "",
    DepartmentID: "",
  });

  const [details, setDetails] = useState({
    SELF: "",
    DEP: "",
    SelfFreeTest: "",
    DependentFreeTest: "",
  });

  const [load, setload] = useState({
    search: false,
    save: false,
  });

  const { t } = useTranslation();

  const getDepartment = () => {
    axiosInstance
      .get(`Department/getDepartment`)
      .then((res) => {
        const data = res.data.message;
        setDepartment(
          data.map((ele) => ({
            value: ele.DepartmentID,
            label: ele.Department,
          })),
        );
      })
      .catch((err) => console.log(err));
  };

  const fetchMemberships = () => {
    axiosInstance
      .get(`MembershipCardMaster/BindMembership`)
      .then((res) => {
        const data = res.data.message;
        setMemberships(data.map((ele) => ({ value: ele.Id, label: ele.Name })));
      })
      .catch((err) => console.log(err));
  };

  const filteredTableData = tabledata
    .map((item, index) => ({ ...item, originalIndex: index }))
    .filter((item) =>
      `${item.TestCODE} ${item.TESTNAME}`
        .toLowerCase()
        .includes(searchText.toLowerCase()),
    );

  const selectAll =
    filteredTableData.length > 0 && filteredTableData.every((item) => item.isSelected);

  const handleSelectAll = (e) => {
    const checked = e.target.checked;
    const updated = [...tabledata];
    filteredTableData.forEach((item) => {
      updated[item.originalIndex] = { ...updated[item.originalIndex], isSelected: checked };
    });
    setTableData(updated);
  };

  const handleRowSelect = (originalIndex) => {
    const updated = [...tabledata];
    updated[originalIndex] = {
      ...updated[originalIndex],
      isSelected: !updated[originalIndex].isSelected,
    };
    setTableData(updated);
  };



  const handleSubmit = (memID, depID) => {
    setload((prev) => ({ ...prev, search: true }));

    if (
      (payload?.DepartmentID !== "" && payload?.MembershipId !== "") ||
      memID ||
      depID
    ) {
      axiosInstance
        .post("MembershipCardMaster/GetTestData", {
          MemberShipId: memID ?? payload?.MembershipId,
          DepartmentId: depID ?? payload?.DepartmentID,
        })
        .then((res) => {
          const data = res?.data?.message.map((item) => ({
            TestCODE: item?.TestCode,
            TESTNAME: item?.TestName,
            TestId: item?.ItemId,
            SELF: item?.SelfDisc,
            DEP: item?.DependentDisc,
            SELFTESTCOUNT: item?.SelfFreeTestCount,
            DEPTESTCOUNT: item?.DependentFreeTestCount,
            DependentFreeTest: item?.DependentFreeTest,
            SelfFreeTest: item?.SelfFreeTest,
            SubcategoryID: item?.DepartmentId,
            isSelected: false,
          }));
          setDetails({
            SELF: "",
            DEP: "",
            SelfFreeTest: "",
            DependentFreeTest: "",
          });
          setload((prev) => ({ ...prev, search: false }));
          setTableData(data);
        })
        .catch((err) => {
          setload((prev) => ({ ...prev, search: false }));
          toast.error(err?.response?.data?.message);
        });
    } else {
      toast.error("Please select required field");
      setload((prev) => ({ ...prev, search: false }));
    }
  };

  function checkArray(array) {
    for (let obj of array) {
      if (Object.keys(obj).length !== 4) return false;
      for (let key in obj) {
        if (obj[key] !== "") return false;
      }
    }
    return true;
  }

  const handleSave = () => {
    const selectedData = tabledata.filter((item) => item.isSelected);

    if (selectedData.length === 0) {
      toast.error("Please select at least one row to save");
      return;
    }

    const checkedArray = selectedData.map((item) => ({
      SelfDisc: item?.SELF ? item?.SELF : "",
      DependentDisc: item?.DEP ? item?.DEP : "",
      SelfFreeTestCount: item?.SELFTESTCOUNT,
      DependentFreeTestCount: item?.DEPTESTCOUNT,
    }));
    const checktbdata = checkArray(checkedArray);

    const obj = {
      MappingDetail: selectedData.map((item) => ({
        SubcategoryId: item?.SubcategoryID,
        ItemId: item?.TestId,
        SelfDisc: item?.SELF ? String(item?.SELF) : "",
        DependentDisc: item?.DEP ? String(item?.DEP) : "",
        SelfFreeTestCount: 0,
        DependentFreeTestCount: 0,
        SelfFreeTest: item?.SelfFreeTest ? String(item?.SelfFreeTest) : "",
        DependentFreeTest: item?.DependentFreeTest
          ? String(item?.DependentFreeTest)
          : "",
      })),
      MembershipCardId: String(payload?.MembershipId),
    };

    setload((prev) => ({ ...prev, save: true }));

    if (!checktbdata) {
      axiosInstance
        .post("MembershipCardMaster/SaveMappingData", obj)
        .then((res) => {
          if(res?.data.success) {
            toast.success(res?.data?.message);
            setload((prev) => ({ ...prev, save: false }));
            setTableData([]);
            setDetails({
              SELF: "",
              DEP: "",
              SelfFreeTest: "",
              DependentFreeTest: "",
            });
            handleSubmit();
          } else {
            toast.error(res?.data?.message);
            setload((prev) => ({ ...prev, save: false }));
          }
        })
        .catch((err) => {
          setload((prev) => ({ ...prev, save: false }));
          toast.error(err?.response?.data?.message);
        });
    } else {
      setload((prev) => ({ ...prev, save: false }));
      toast.error("Give any discount to proceed");
    }
  };

  const handleSelectChange = (name, value) => {
    setTableData([]);
    setDetails({ SELF: "", DEP: "", SelfFreeTest: "", DependentFreeTest: "" });
    setPayload((prev) => ({ ...prev, [name]: value?.value?.toString() }));
    name === "DepartmentID" &&
      payload?.MembershipId !== "" &&
      handleSubmit(null, value?.value?.toString());
    name === "MembershipId" &&
      payload?.DepartmentID !== "" &&
      handleSubmit(value?.value?.toString(), null);
  };

  const handleChangeMain = (e, index) => {
    const { value, name } = e.target;

    if (index >= 0) {
      if (name === "SELF" || name === "DEP") {
        if (value <= 100) {
          const data = [...tabledata];
          data[index][name] = value;
          setTableData(data);
        }
      } else {
        const data = [...tabledata];
        data[index][name] = value;
        setTableData(data);
      }
    } else {
      if (name === "SELF" || name === "DEP") {
        if (value <= 100) {
          setDetails((prev) => ({ ...prev, [name]: value }));
          setTableData(tabledata.map((ele) => ({ ...ele, [name]: value })));
        }
      } else {
        setDetails((prev) => ({ ...prev, [name]: value }));
        setTableData(tabledata.map((ele) => ({ ...ele, [name]: value })));
      }
    }
  };

  // ── View Log ──
  const handleViewLog = (rowData) => {
    setSelectedLogRow(rowData);
    setLogLoading(true);
    setShowLogModal(true);

    axiosInstance
      .post("MembershipCardMaster/GetMembershipItemMappingLogs", {
        itemId: rowData?.TestId,
        membershipId: Number(payload?.MembershipId),
        subcategoryID: rowData?.SubcategoryID,
      })
      .then((res) => {
        if(res?.data.success) {
          setLogData(Array.isArray(res?.data?.message) ? res.data.message : []);
          setLogLoading(false);
        } else {
          setLogLoading(false);
        }
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Error fetching logs");
        setLogLoading(false);
      });
  };

  useEffect(() => {
    fetchMemberships();
    getDepartment();
  }, []);

  return (
    <>
      {/* ===================== FILTER ACCORDION ===================== */}
      <Accordion
        name={t("Membership Item Mapping")}
        defaultValue={true}
        isBreadcrumb={true}
        linkTo={"#"}
        linkTitle={
          <div className="link-title-container mt-2" id="pr_id_11" style={{ marginRight: "10px" }}>
            <div style={{
              fontWeight: "700"
            }}>
              ⚠️ Dependent discount should be less than or equal to self discount.
            </div>
          </div>
        }
      >
        <div className="row pt-2 pl-2 pr-2 mt-1">
          <div className="col-sm-2">
            <ReactSelect
              dynamicOptions={[
                { label: "Select Membership", value: "" },
                ...Memberships,
              ]}
              name="MembershipId"
              id="MembershipId"
              className="required-fields"
              removeIsClearable={true}
              placeholderName={t("Membership Card")}
              value={payload?.MembershipId}
              onChange={handleSelectChange}
              lable={t("Membership Card")}
            />
          </div>

          <div className="col-sm-2">
            <ReactSelect
              dynamicOptions={[{ label: "Select Departement", value: "" }, ...Department]}
              name="DepartmentID"
              lable={t("Department List")}
              id="Department"
              removeIsClearable={true}
              placeholderName={t("Department")}
              value={payload?.DepartmentID}
              onChange={handleSelectChange}
            />
          </div>

          <div className="col-sm-1">
            {!load.search ? (
              <CustomButton
                text={"Search"}
                icon={"search"}
                className="btn btn-primary btn-sm btn-block"
                onClick={() => handleSubmit(null, null)}
              />
            ) : (
              <Loading />
            )}
          </div>

          {/* ── Export / Import Button ── */}
          <div className="col-sm-auto">
            <CustomButton
              onClick={() => setOpenImportExport(true)}
              text={t("Export / Import")}
              icon={"excel"}
            />
          </div>

          {/* ── Transfer Button ── */}
          <div className="col-sm-auto">
            <CustomButton
              onClick={() => setOpenTransfer(true)}
              text={t("Transfer")}
              icon={"send"}
            />
          </div>
        </div>
      </Accordion>

      {/* ===================== TABLE ACCORDION ===================== */}
      <Accordion
        title={t("Search Data")}
        defaultValue={true}
        notOpen={true}
        linkTo="#"
        linkTitle={
          <div className="d-flex" style={{ gap: "5px" }}>
            <Input
              type="text"
              placeholder="Search Test..."
              value={searchText}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => setSearchText(e.target.value)}
              className="mt-2"
            />
          </div>
        }
      >
        {tabledata.length > 0 && (
          <div className="table-responsive">
            <Tables
              style={{
                      maxHeight: "400px",
                      overflowY: "auto",
                    }}
            >
              <thead>
                <tr>
                  <th>{t("S.No")}</th>
                  <th>{t("Test Code")}</th>
                  <th>{t("Test Name")}</th>
                  <th>
                    {t("Self Discount %")}
                    <br />
                    <Input
                      id="DaysInput"
                      type="number"
                      name="SELF"
                      onChange={(e) => handleChangeMain(e, -1)}
                      value={details?.SELF}
                      onInput={(e) => number(e, 3, 100)}
                      className="membership_card_input"
                    />
                  </th>
                  <th>
                    {t("Dependent Discount%")}
                    <br />
                    <Input
                      id="DaysInput"
                      type="number"
                      name="DEP"
                      onChange={(e) => handleChangeMain(e, -1)}
                      value={details?.DEP}
                      onInput={(e) => number(e, 3, Number(details?.SELF))}
                      style={{ maxWidth: "100px" }}
                      className="membership_card_input"
                    />
                  </th>
                  <th>
                    {t("Self Free Test Count")}
                    <br />
                    <Input
                      id="DaysInput"
                      type="number"
                      name="SelfFreeTest"
                      onChange={(e) => handleChangeMain(e, -1)}
                      value={details?.SelfFreeTest}
                      onInput={(e) => number(e, 2)}
                      style={{ maxWidth: "100px" }}
                      className="membership_card_input"
                    />
                  </th>
                  <th>
                    {t("Dependent Free Test Count")}
                    <br />
                    <Input
                      id="DaysInput"
                      type="number"
                      name="DependentFreeTest"
                      onChange={(e) => handleChangeMain(e, -1)}
                      value={details?.DependentFreeTest}
                      onInput={(e) =>
                        number(e, 2, Number(details?.SelfFreeTest))
                      }
                      className="membership_card_input_dependent"
                    />
                  </th>
                  <th className="p-2">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th>
                    Log
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTableData?.map((data, index) => (
                  <tr key={index}>
                    <td data-title={t("S.No")}>{index + 1}&nbsp;</td>
                    <td data-title={t("Test Code")}>{data?.TestCODE}&nbsp;</td>
                    <td data-title={t("Test Name")}>{data?.TESTNAME}&nbsp;</td>
                    <td data-title={t("Self Discount %")}>
                      <Input
                        type="number"
                        name="SELF"
                        value={data?.SELF}
                        min="0"
                        onChange={(e) =>
                          handleChangeMain(e, data.originalIndex)
                        }
                        onInput={(e) => number(e, 3, 100)}
                        className="membership_card_input"
                      />
                    </td>
                    <td data-title={t("Dependent Discount%")}>
                      <Input
                        type="number"
                        name="DEP"
                        value={data?.DEP}
                        min="0"
                        onInput={(e) => number(e, 3, Number(data?.SELF))}
                        onChange={(e) =>
                          handleChangeMain(e, data.originalIndex)
                        }
                        className="membership_card_input"
                      />
                    </td>
                    <td data-title={t("Self Free Test")}>
                      <Input
                        type="number"
                        name="SelfFreeTest"
                        value={data?.SelfFreeTest}
                        min="0"
                        onInput={(e) => number(e, 2)}
                        onChange={(e) =>
                          handleChangeMain(e, data.originalIndex)
                        }
                        className="membership_card_input"
                      />
                    </td>
                    <td data-title={t("Dependent Free Test")}>
                      <Input
                        type="number"
                        name="DependentFreeTest"
                        value={data?.DependentFreeTest}
                        min="0"
                        onInput={(e) =>
                          number(e, 2, Number(data?.SelfFreeTest))
                        }
                        onChange={(e) =>
                          handleChangeMain(e, data.originalIndex)
                        }
                        className="membership_card_input_dependent"
                      />
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        checked={data?.isSelected ?? false}
                        onChange={() => handleRowSelect(data.originalIndex)}
                      />
                    </td>
                    <td data-title={t("View Log")}>
                      <i
                        className="fa fa-search text-primary cursor-pointer"
                        style={{ fontSize: "15px" }}
                        title={t("View Log")}
                        onClick={() => handleViewLog(data)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Tables>
            <div className="col-sm-2 mt-2 mb-2">
              <div className="d-flex align-items-center">
                {!load.save ? (
                  <SaveButton
                    text={"Save"}
                    className="btn btn-success btn-sm"
                    onClick={handleSave}
                  />
                ) : (
                  <Loading />
                )}
              </div>
            </div>
          </div>
        )}
      </Accordion>

      {/* ===================== LOG DIALOG ===================== */}
      {showLogModal && (
        <Dialog
          header={
            <span>
              {t("Membership Item Mapping Logs")}
              {selectedLogRow && (
                <span className="ml-4" style={{ fontSize: "14px" }}>
                  {t("Test")} - {selectedLogRow?.TESTNAME} &nbsp;|&nbsp;
                  <span style={{ fontSize: "14px" }}>
                    {t("Code")} - {selectedLogRow?.TestCODE}
                  </span>
                </span>
              )}
            </span>
          }
          visible={showLogModal}
          onHide={() => {
            setShowLogModal(false);
            setLogData([]);
            setSelectedLogRow(null);
          }}
          style={{ width: "80vw" }}
          className={theme}
        >
          <div className="card">
            <div
              className="card-body p-0"
              style={{ maxHeight: "60vh", overflowY: "auto" }}
            >
              {logLoading ? (
                <Loading />
              ) : (
                <Tables>
                  <thead>
                    <tr>
                      <th>{t("S.No")}</th>
                      <th>{t("Self Disc")}</th>
                      <th>{t("Old Self Disc")}</th>
                      <th>{t("Dep. Disc")}</th>
                      <th>{t("Old Dep. Disc")}</th>
                      <th>{t("Self Free Test")}</th>
                      <th>{t("Old Self Free Test")}</th>
                      <th>{t("Dep. Free Test")}</th>
                      <th>{t("Old Dep. Free Test")}</th>
                      <th>{t("Created By")}</th>
                      <th>{t("Old Created By")}</th>
                      <th>{t("Created At")}</th>
                      <th>{t("Old Created At")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logData.length > 0 ? (
                      logData.map((log, index) => (
                        <tr key={index}>
                          <td data-title={t("S.No")}>{index + 1}</td>
                          <td data-title={t("Self Disc")}>{log?.SelfDisc ?? "-"}</td>
                          <td data-title={t("Old Self Disc")}>{log?.OldSelfDisc ?? "-"}</td>
                          <td data-title={t("Dep. Disc")}>{log?.DependentDisc ?? "-"}</td>
                          <td data-title={t("Old Dep. Disc")}>{log?.OldDependentDisc ?? "-"}</td>
                          <td data-title={t("Self Free Test")}>{log?.SelfFreeTest ?? "-"}</td>
                          <td data-title={t("Old Self Free Test")}>{log?.OldSelfFreeTest ?? "-"}</td>
                          <td data-title={t("Dep. Free Test")}>{log?.DependentFreeTest ?? "-"}</td>
                          <td data-title={t("Old Dep. Free Test")}>{log?.OldDependentFreeTest ?? "-"}</td>
                          <td data-title={t("Created By")}>{log?.CreatedByName || "-"}</td>
                          <td data-title={t("Old Created By")}>{log?.OldCreatedByName || "-"}</td>
                          <td data-title={t("Created At")}>
                            <DateTimeCell dateString={log?.dtEntry} />
                          </td>
                          <td data-title={t("Old Created At")}>
                            <DateTimeCell dateString={log?.OldDtEntry} />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="10" className="text-center">
                          {t("No Records Found")}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Tables>
              )}
            </div>
            <div className="modal-footer">
              <CancelButton
                text={"Close"}
                onClick={() => {
                  setShowLogModal(false);
                  setLogData([]);
                  setSelectedLogRow(null);
                }}
              />
            </div>
          </div>
        </Dialog>
      )}

      <MembershipCardImportExportModal
        open={openImportExport}
        onClose={() => setOpenImportExport(false)}
        membershipOptions={Memberships}
        membershipId={payload?.MembershipId}
      />

      <MembershipCardTransferModal
        show={openTransfer}
        handleClose={() => setOpenTransfer(false)}
        membershipOptions={Memberships}
        departmentOptions={Department}
        fromMembershipId={payload?.MembershipId}
      />
    </>
  );
};

export default MembershipCardItemMapping;
