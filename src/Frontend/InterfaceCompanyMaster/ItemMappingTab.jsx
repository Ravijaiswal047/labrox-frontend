import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import moment from "moment";
import Tables from "@components/UI/customTable";
import ReactSelect from "@components/formComponent/ReactSelect";
import Input from "@components/formComponent/Input";
import DatePicker from "@components/formComponent/DatePicker";
import Modal from "@components/formComponent/Modal";
import Heading from "@components/UI/Heading";
import { CustomButton, SaveButton, SearchButton, CancelButton } from "@components/UI/CustomButton";
import { axiosInstance } from "@app/utils/axiosInstance";
import ImportExportModal from "./ImportExportModal";

const ItemMappingTab = ({ companyList, departmentOptions }) => {
  const { t } = useTranslation();

  // only companies with TestCode = OWN (IsLISTestCode === 0)
  const interfaceOptions = companyList
    .filter((i) => i.IsLISTestCode === 0)
    .map((i) => ({ label: i.CompanyName, value: i.ID }));

  // ── Filter & table ────────────────────────────────────────────────────────
  const [filter, setFilter] = useState({
    InterfaceCompanyID: "",
    Interface_companyName: "",
    DepartmentId: "",
  });
  const [tableData, setTableData] = useState([]);
  const [selectedRows, setSelectedRows] = useState({});
  const [isSearching, setIsSearching] = useState(false);
  const [bulkCode, setBulkCode] = useState("");
  const [bulkName, setBulkName] = useState("");

  // ── Log modal ─────────────────────────────────────────────────────────────
  const [logModal, setLogModal] = useState({ visible: false, row: null });
  const [logFilter, setLogFilter] = useState({ testCode: "", itemID: 0, fromDate: null, toDate: null });
  const [logData, setLogData] = useState([]);
  const [logLoading, setLogLoading] = useState(false);

  // ── Import/Export modal ───────────────────────────────────────────────────
  const [showImportExport, setShowImportExport] = useState(false);

  // ── API ───────────────────────────────────────────────────────────────────
  const handleSearch = () => {
    setIsSearching(true);
    axiosInstance
      .post("ItemMasterInterface/GetAllItemMappingInterface", {
        interfaceCompanyID: filter.InterfaceCompanyID || 0,
        interface_companyName: filter.Interface_companyName || "",
        departmentId: filter.DepartmentId || 0,
      })
      .then((res) => {
        setTableData(Array.isArray(res?.data?.message) ? res.data.message : []);
        setSelectedRows({});
        setBulkCode("");
        setBulkName("");
      })
      .catch((err) => toast.error(err?.response?.data?.message))
      .finally(() => setIsSearching(false));
  };

  const handleSaveMapping = () => {
    const checkedRows = tableData.filter((_, idx) => selectedRows[idx]);
    if (!checkedRows.length) {
      toast.warning(t("Please select at least one row"));
      return;
    }
    axiosInstance
      .post("ItemMasterInterface/SaveItemMasterInterface", {
        items: checkedRows.map((r) => ({
          id: r.ID ?? 0,
          itemID: r.ItemID ?? 0,
          testCode: r.TestCode ?? "",
          itemID_interface: r.ItemID_interface ?? "",
          itemName_interface: r.ItemName_interface ?? "",
          interface_companyName: r.Interface_companyName || filter.Interface_companyName || "",
          interface_companyID: r.Interface_companyID || filter.InterfaceCompanyID || 0,
          isActive: 1,
          isUpdate: r.ID ? 1 : 0,
        })),
      })
      .then((res) => {
        toast.success(res?.data?.message);
        handleSearch();
      })
      .catch((err) => toast.error(err?.response?.data?.message));
  };

  // ── Log ───────────────────────────────────────────────────────────────────
  const openLogModal = (row) => {
    const preset = { testCode: row.TestCode ?? "", itemID: row.ItemID ?? 0, fromDate: null, toDate: null };
    setLogFilter(preset);
    setLogData([]);
    setLogModal({ visible: true, row });
    fetchLog(preset);
  };

  const fetchLog = (f = logFilter) => {
    setLogLoading(true);
    axiosInstance
      .post("ItemMasterInterface/SearchItemMasterInterfaceLog", {
        logID: 0,
        testCode: f.testCode ?? "",
        itemID: Number(f.itemID) || 0,
        fromDate: f.fromDate ? moment(f.fromDate).format("YYYY-MM-DD") : "",
        toDate:   f.toDate   ? moment(f.toDate).format("YYYY-MM-DD")   : "",
      })
      .then((res) => setLogData(res?.data?.message ?? []))
      .catch((err) => toast.error(err?.response?.data?.message))
      .finally(() => setLogLoading(false));
  };

  const closeLogModal = () => {
    setLogModal({ visible: false, row: null });
    setLogData([]);
  };

  // ── Table helpers ─────────────────────────────────────────────────────────
  const isAllSelected =
    tableData.length > 0 && tableData.every((_, idx) => selectedRows[idx]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const all = {};
      tableData.forEach((_, idx) => { all[idx] = true; });
      setSelectedRows(all);
    } else {
      setSelectedRows({});
    }
  };

  const handleInlineChange = (idx, field, value) => {
    setTableData((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, [field]: value } : r))
    );
  };

  const handleBulkCodeChange = (e) => {
    const val = e.target.value;
    setBulkCode(val);
    setTableData((prev) =>
      prev.map((r, i) => (selectedRows[i] ? { ...r, ItemID_interface: val } : r))
    );
  };

  const handleBulkNameChange = (e) => {
    const val = e.target.value;
    setBulkName(val);
    setTableData((prev) =>
      prev.map((r, i) => (selectedRows[i] ? { ...r, ItemName_interface: val } : r))
    );
  };

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div className="p-2">
      {/* ── Filter ── */}
      <Heading title="Interface Item Mapping" />
      <div className="row mb-2 mt-2">
        <ReactSelect
          id="mappingInterface"
          name="InterfaceCompany"
          placeholderName="Interface Company"
          dynamicOptions={interfaceOptions}
          value={filter.InterfaceCompanyID}
          onChange={(name, option) =>
            setFilter((prev) => ({
              ...prev,
              InterfaceCompanyID: option?.value ?? "",
              Interface_companyName: option?.label ?? "",
            }))
          }
          respclass="col-md-2 col-6"
        />
        <ReactSelect
          id="mappingDepartment"
          name="DepartmentId"
          placeholderName="Department"
          dynamicOptions={departmentOptions}
          value={filter.DepartmentId}
          onChange={(name, option) =>
            setFilter((prev) => ({ ...prev, DepartmentId: option?.value ?? "" }))
          }
          respclass="col-md-2 col-6"
        />
        <div className="col-md-4 col-12 d-flex flex-wrap align-items-start" style={{ gap: "5px" }}>
          <SearchButton text="Search" onClick={handleSearch} disabled={isSearching} />
          <CustomButton
            text="Import / Export"
            icon="excel"
            onClick={() => setShowImportExport(true)}
          />
        </div>
      </div>

      {/* ── Mapping table ── */}
      <Heading title="Search Data" />
      <Tables>
        <thead>
          <tr>
            <th>{t("S.No")}</th>
            <th>{t("Department")}</th>
            <th>{t("Test Code")}</th>
            <th>{t("Test Name")}</th>
            <th>
              {t("Interface Test Code")}
              <input
                type="text"
                className="form-control form-control-sm mt-1"
                placeholder={t("Fill all")}
                value={bulkCode}
                onChange={handleBulkCodeChange}
                style={{ minWidth: 90 }}
              />
            </th>
            <th>
              {t("Interface Test Name")}
              <input
                type="text"
                className="form-control form-control-sm mt-1"
                placeholder={t("Fill all")}
                value={bulkName}
                onChange={handleBulkNameChange}
                style={{ minWidth: 90 }}
              />
            </th>
            <th style={{ textAlign: "center" }}>
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={handleSelectAll}
                title="Select All"
                style={{ cursor: "pointer", width: 14, height: 14 }}
                />
            </th>
            <th>{t("Log")}</th>
          </tr>
        </thead>
        <tbody>
          {tableData.length === 0 ? (
            <tr>
              <td colSpan={8} className="text-center py-3 text-muted">{t("No Record Found")}</td>
            </tr>
          ) : (
            tableData.map((row, idx) => {
              const checked = !!selectedRows[idx];
              return (
                <tr key={idx}>
                  <td>{idx + 1}</td>
                  <td>{row.Department ?? ""}</td>
                  <td>{row.TestCode ?? ""}</td>
                  <td>{row.TestName ?? ""}</td>
                  <td>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={row.ItemID_interface ?? ""}
                      disabled={!checked}
                      placeholder={checked ? t("Enter code") : "—"}
                      onChange={(e) => handleInlineChange(idx, "ItemID_interface", e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={row.ItemName_interface ?? ""}
                      disabled={!checked}
                      placeholder={checked ? t("Enter name") : "—"}
                      onChange={(e) => handleInlineChange(idx, "ItemName_interface", e.target.value)}
                    />
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) =>
                        setSelectedRows((prev) => ({ ...prev, [idx]: e.target.checked }))
                      }
                      style={{ cursor: "pointer", width: 14, height: 14 }}
                    />
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <i
                      className="fa fa-search"
                      title={t("View Log")}
                      style={{ cursor: "pointer", color: "#007bff", fontSize: 14 }}
                      onClick={() => openLogModal(row)}
                    />
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </Tables>
      <div className="mt-3">
        <SaveButton text="Save" onClick={handleSaveMapping} />
      </div>

      {/* ── Log Modal ── */}
      <Modal
        visible={logModal.visible}
        setVisible={closeLogModal}
        Header={t("Interface Log")}
        modalWidth="80vw"
        buttons={<CancelButton text="Close" onClick={closeLogModal} />}
      >
        <div className="p-2">
          <Tables>
            <thead>
              <tr>
                <th>{t("S.No")}</th>
                <th>{t("Test Code")}</th>
                <th>{t("Old ItemName Interface")}</th>
                <th>{t("New ItemName Interface")}</th>
                <th>{t("Old Interface CompanyName")}</th>
                <th>{t("New Interface CompanyName")}</th>
                <th>{t("Created At")}</th>
                <th>{t("New Created At")}</th>
                <th>{t("Old Created By")}</th>
                <th>{t("Created By")}</th>
              </tr>
            </thead>
            <tbody>
              {logLoading ? (
                <tr><td colSpan={7} className="text-center py-3 text-muted">{t("Loading...")}</td></tr>
              ) : logData.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-3 text-muted">{t("No Record Found")}</td></tr>
              ) : (
                logData.map((row, idx) => (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    <td>{row.TestCode ?? ""}</td>
                    <td>{row.OldItemName_interface ?? ""}</td>
                    <td>{row.NewItemName_interface ?? ""}</td>
                    <td>{row.OldInterface_companyName ?? ""}</td>
                    <td>{row.NewInterface_companyName ?? ""}</td>
                    <td>{row.OlddtEntry ?? ""}</td>
                    <td>{row.NewdtEntry ?? ""}</td>
                    <td>{row.OldCreatedBy ?? ""}</td>
                    <td>{row.NewCreatedBy ?? ""}</td>
                  </tr>
                ))
              )}
            </tbody>
          </Tables>
        </div>
      </Modal>

      {/* ── Import/Export Modal ── */}
      <ImportExportModal
        visible={showImportExport}
        onClose={() => setShowImportExport(false)}
        interfaceOptions={interfaceOptions}
        departmentOptions={departmentOptions}
      />
    </div>
  );
};

export default ItemMappingTab;
