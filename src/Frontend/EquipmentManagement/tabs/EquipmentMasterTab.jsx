import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaPencilAlt, FaQrcode, FaSearch } from "react-icons/fa";
import Heading from "@app/components/UI/Heading";
import ReactSelect from "@app/components/formComponent/ReactSelect";
import FilterInput from "@app/components/Filter/FilterInput";
import CustomTable from "@app/components/Table/CustomTable";
import { CustomButton } from "@app/components/UI/CustomButton";
import { axiosInstance } from "@app/utils/axiosInstance";
import { apiUrls } from "@app/utils/apiUrls";
import { getCentreDetails } from "@app/utils/NetworkApi/commonApi";
import { useLocalStorage } from "@app/utils/hooks/useLocalStorage";
import { notify } from "@app/utils/utils";
import AddEquipmentModal from "./AddEquipmentModal";
import ViewEquipmentModal from "./ViewEquipmentModal";
import EquipmentQrModal from "./EquipmentQrModal";
import {
  ALL_VALUE,
  STATUS_OPTIONS,
  isAllValue,
  buildNextEquipmentCode,
  criticalityClass,
  formatApiDate,
  statusBadgeClass,
  toDateOrNull,
} from "../equipmentConstants";

const EquipmentMasterTab = () => {
  const { t } = useTranslation();
  const userData = useLocalStorage("userData", "get") || "";

  const [tableData, setTableData] = useState([]);
  const [centreList, setCentreList] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [vendorList, setVendorList] = useState([]);

  const [filters, setFilters] = useState({
    search: "",
    CentreID: ALL_VALUE,
    DepartmentID: ALL_VALUE,
    CategoryID: ALL_VALUE,
    Status: ALL_VALUE,
  });

  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrItem, setQrItem] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [editRow, setEditRow] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // ─── Dropdowns ────────────────────────────────────────────────────────────
  useEffect(() => {
    getCentreDetails(setCentreList);
    fetchDepartments();
    fetchCategories();
    fetchVendors();
  }, []);

  const fetchDepartments = () => {
    axiosInstance
      .get("TestCentreMappingController/BindDepartment")
      .then((res) => {
        const data = res?.data?.message || [];
        const options = data
          .map((ele) => ({
            label: ele?.department || ele?.DepartmentName || ele?.Department || "",
            value: ele?.departmentid || ele?.DepartmentID || ele?.id || "",
          }))
          .filter((item) => item.label && item.value);
        setDepartmentList(options);
      })
      .catch((err) => console.error(err));
  };

  // Categories come from global_type_master under the "EquipmentCategory" type.
  // FieldDisplay is used as both value and label (the house pattern for this
  // endpoint), which also keeps it comparable to the name the grid stores.
  const fetchCategories = () => {
    axiosInstance
      .post(apiUrls.getGlobalData, { Type: "EquipmentCategory" })
      .then((res) => {
        const data = res?.data?.message;
        if (!res?.data?.success || !Array.isArray(data)) {
          setCategoryList([]);
          return;
        }
        setCategoryList(
          data
            .filter((ele) => ele?.FieldDisplay)
            .map((ele) => ({
              value: ele.FieldDisplay,
              label: ele.FieldDisplay,
            })),
        );
      })
      .catch((err) => console.error(err));
  };

  const fetchVendors = () => {
    axiosInstance
      .get(apiUrls.GetVendorList || "VendorMaster/GetVendorList")
      .then((res) => {
        const data = res?.data?.message || [];
        const options = (Array.isArray(data) ? data : [])
          .map((ele) => ({
            label: ele?.SupplierName || ele?.label || "",
            value: String(ele?.SupplierID || ele?.value || ""),
            code: ele?.SupplierCode || "",
            SupplierID: ele?.SupplierID || ele?.value,
            SupplierName: ele?.SupplierName || ele?.label,
          }))
          .filter((item) => item.label);
        setVendorList(options);
      })
      .catch((err) => {
        console.error("Failed to load vendors:", err);
      });
  };

  // ─── Grid ─────────────────────────────────────────────────────────────────
  // The API accepts CentreID / DepartmentID / CategoryName / Status / SearchText,
  // but we fetch unfiltered and filter in the browser: the row count is small
  // and it keeps the search instant. Move filters into this body if the table
  // grows enough for that to matter.
  const fetchEquipment = () => {
    axiosInstance
      .post(apiUrls.GetEquipmentMaster, {})
      .then((res) => {
        const list = res?.data?.message;
        setTableData(Array.isArray(list) ? list : []);
      })
      .catch((err) => {
        setTableData([]);
        notify(err?.response?.data?.message || t("Failed to load equipment"), "error");
      });
  };

  useEffect(() => {
    fetchEquipment();
  }, [userData?.CompanyID]);

  // Resolve a dropdown value back to its label for the *Name columns.
  const labelOf = (options, value) =>
    options.find((o) => String(o.value) === String(value))?.label || "";

  // ─── Row view model ───────────────────────────────────────────────────────
  // Resolve every displayed value once, so the grid, the filters and the
  // search all read from exactly the same text.
  const viewRows = useMemo(() => {
    const centreLabelById = (id) =>
      centreList.find((opt) => String(opt.value) === String(id))?.label || "";

    return tableData.map((row) => {
      const centreId = row?.CentreID ?? "";
      return {
        row,
        centreId,
        departmentId: row?.DepartmentID ?? "",
        // The API stores the category as a name, matching the dropdown's value.
        categoryId: row?.CategoryName ?? "",
        code: row?.EquipmentCode || "",
        name: row?.EquipmentName || "",
        machine: [row?.Make, row?.ModelNo].filter(Boolean).join(" "),
        serial: row?.SerialNumber || "",
        category: row?.CategoryName || "",
        department: row?.DepartmentName || "",
        // Prefer the live centre list so a renamed centre shows its new name.
        centre: centreLabelById(centreId) || row?.CentreName || "",
        criticality: row?.Criticality || "Medium",
        status: row?.Status || "Active",
      };
    });
  }, [tableData, centreList]);

  // ─── Filtering ────────────────────────────────────────────────────────────
  // A row may store either the id (live API) or the display name (older rows),
  // so match on both. Comparison is case-insensitive throughout.
  const matchesOption = (selectedValue, options, rowId, rowText) => {
    if (isAllValue(selectedValue)) return true;
    if (String(rowId ?? "") === String(selectedValue)) return true;
    const label = options.find(
      (opt) => String(opt.value) === String(selectedValue),
    )?.label;
    if (!label || !rowText) return false;
    return String(rowText).trim().toLowerCase() === label.trim().toLowerCase();
  };

  // Filter dropdowns get an "All …" entry on top, carrying the ALL_VALUE
  // sentinel. The modal keeps the plain lists — "All …" is not a choice there.
  const withAllOption = (options, label) => [
    { label: t(label), value: ALL_VALUE },
    ...options,
  ];

  const centreFilterOptions = useMemo(
    () => withAllOption(centreList, "All Centres"),
    [centreList, t],
  );
  const departmentFilterOptions = useMemo(
    () => withAllOption(departmentList, "All Departments"),
    [departmentList, t],
  );
  const categoryFilterOptions = useMemo(
    () => withAllOption(categoryList, "All Categories"),
    [categoryList, t],
  );

  const filteredRows = useMemo(() => {
    const term = filters.search.trim().toLowerCase();

    return viewRows.filter((item) => {
      if (!matchesOption(filters.CentreID, centreList, item.centreId, item.centre)) {
        return false;
      }
      if (
        !matchesOption(
          filters.DepartmentID,
          departmentList,
          item.departmentId,
          item.department,
        )
      ) {
        return false;
      }
      if (
        !matchesOption(filters.CategoryID, categoryList, item.categoryId, item.category)
      ) {
        return false;
      }
      if (
        !isAllValue(filters.Status) &&
        item.status.toLowerCase() !== filters.Status.toLowerCase()
      ) {
        return false;
      }
      if (!term) return true;

      return [
        item.code,
        item.name,
        item.machine,
        item.serial,
        item.category,
        item.department,
        item.centre,
        item.criticality,
        item.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [viewRows, filters, centreList, departmentList, categoryList]);

  // Clearing with the x falls back to "All …" rather than a blank control.
  const handleFilterSelect = (name, selectedOption) => {
    setFilters((prev) => ({ ...prev, [name]: selectedOption?.value ?? ALL_VALUE }));
  };

  // ─── Save ─────────────────────────────────────────────────────────────────
  // One endpoint for both: the API inserts when EquipmentID is absent and
  // updates otherwise. CompanyID / CreatedBy come from the JWT server-side, so
  // they are deliberately not sent.
  const handleSave = (form) => {
    setIsSaving(true);

    const payload = {
      EquipmentID: editRow?.EquipmentID ?? 0,
      // Left blank on insert so the server generates the next EQ-#### code.
      EquipmentCode: editRow ? form?.EquipmentCode : "",
      EquipmentName: form?.EquipmentName?.trim() || "",
      CategoryName: form?.CategoryID || "",
      Make: form?.Make?.trim() || "",
      ModelNo: form?.ModelNo?.trim() || "",
      SerialNumber: form?.SerialNo?.trim() || "",
      SupplierID: form?.SupplierID ? Number(form.SupplierID) : null,
      SupplierVendor: form?.SupplierVendor?.trim() || "",

      PurchaseDate: formatApiDate(form?.PurchaseDate) || null,
      InstallationDate: formatApiDate(form?.InstallationDate) || null,
      WarrantyExpiry: formatApiDate(form?.WarrantyExpiry) || null,
      Cost: form?.Cost === "" || form?.Cost == null ? null : Number(form.Cost),

      DepartmentID: form?.DepartmentID ? Number(form.DepartmentID) : null,
      // Names are stored alongside the ids so a row still reads correctly if a
      // centre or department is later renamed or removed.
      DepartmentName: labelOf(departmentList, form?.DepartmentID),
      CentreID: form?.CentreID ? Number(form.CentreID) : null,
      CentreName: labelOf(centreList, form?.CentreID),

      Criticality: form?.Criticality || "Medium",
      Status: form?.Status || "Active",
    };

    axiosInstance
      .post(apiUrls.SaveEquipmentMaster, payload)
      .then((res) => {
        if (res?.data?.success) {
          notify(res?.data?.message || t("Equipment saved successfully."), "success");
          setShowModal(false);
          setEditRow(null);
          fetchEquipment();
        } else {
          notify(res?.data?.message || t("Save Failed"), "error");
        }
      })
      .catch((err) => {
        notify(err?.response?.data?.message || t("Failed To Save"), "error");
      })
      .finally(() => setIsSaving(false));
  };

  const handleAdd = () => {
    setEditRow(null);
    setShowModal(true);
  };

  const handleEdit = (row) => {
    setEditRow(row);
    setShowModal(true);
  };

  // View takes the whole view-model entry, not the raw row, so the popup shows
  // the same resolved centre / status text the grid does.
  const handleView = (item) => {
    setViewItem(item);
    setShowViewModal(true);
  };

  // Map a grid row back onto the modal's field names
  const editFormData = useMemo(() => {
    if (!editRow) return null;
    return {
      EquipmentCode: editRow?.EquipmentCode || "",
      EquipmentName: editRow?.EquipmentName || "",
      // the Category options are keyed by name, so this holds the name
      CategoryID: editRow?.CategoryName || "",
      Make: editRow?.Make || "",
      ModelNo: editRow?.ModelNo || "",
      SerialNo: editRow?.SerialNumber || "",
      SupplierID: editRow?.SupplierID ?? "",
      SupplierVendor: editRow?.SupplierVendor || "",
      PurchaseDate: toDateOrNull(editRow?.PurchaseDate),
      InstallationDate: toDateOrNull(editRow?.InstallationDate),
      WarrantyExpiry: toDateOrNull(editRow?.WarrantyExpiry),
      Cost: editRow?.Cost ?? "",
      DepartmentID: editRow?.DepartmentID ?? "",
      CentreID: editRow?.CentreID ?? "",
      Criticality: editRow?.Criticality || "Medium",
      Status: editRow?.Status || "Active",
    };
  }, [editRow]);

  // ─── Columns ──────────────────────────────────────────────────────────────
  const columns = [
    { header: t("Code"), field: "code", minWidth: "90px" },
    { header: t("Equipment"), field: "equipment", minWidth: "220px" },
    { header: t("Category"), field: "category", minWidth: "120px" },
    { header: t("Department"), field: "department", minWidth: "130px" },
    { header: t("Centre"), field: "centre", minWidth: "160px" },
    { header: t("Criticality"), field: "criticality", minWidth: "100px" },
    { header: t("Status"), field: "status", minWidth: "130px" },
    { header: t("Actions"), field: "actions", minWidth: "150px" },
  ];

  const rows = filteredRows.map((item) => ({
    code: item.code,
    equipment: (
      <div>
        <div className="em-eq-name">{item.name || "-"}</div>
        <div className="em-eq-sub">
          {[item.machine, item.serial ? `SN ${item.serial}` : ""]
            .filter(Boolean)
            .join(" · ")}
        </div>
      </div>
    ),
    category: item.category || "-",
    department: item.department || "-",
    centre: item.centre || "-",
    criticality: (
      <span className={criticalityClass(item.criticality)}>{item.criticality}</span>
    ),
    status: <span className={statusBadgeClass(item.status)}>{t(item.status)}</span>,
    actions: (
      <div className="em-actions">
        <button
          type="button"
          title={t("View")}
          className="em-icon-btn em-icon-view"
          onClick={() => handleView(item)}
        >
          <FaSearch />
        </button>
        <button
          type="button"
          title={t("Edit")}
          className="em-icon-btn em-icon-edit"
          onClick={() => handleEdit(item.row)}
        >
          <FaPencilAlt />
        </button>
        <button
          type="button"
          title={t("QR")}
          className="em-icon-btn em-icon-qr"
          onClick={() => { setQrItem(item); setShowQrModal(true); }}
        >
          <FaQrcode />
        </button>
      </div>
    ),
  }));

  return (
    <div className="em-master">
      <Heading
        title={t("Equipment Master")}
        secondTitle={
          <div className="em-filter-bar">
            <div className="em-filter-search">
              <FilterInput
                value={filters.search}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, search: e.target.value }))
                }
                placeholder={t("Search code / name / serial")}
                width="100%"
              />
            </div>
            <div className="em-filter-field">
              <ReactSelect
                id="filterCentreId"
                name="CentreID"
                placeholderName="Centre"
                value={filters.CentreID}
                dynamicOptions={centreFilterOptions}
                onChange={handleFilterSelect}
                respclass=""
              />
            </div>
            <div className="em-filter-field">
              <ReactSelect
                id="filterDepartmentId"
                name="DepartmentID"
                placeholderName="Department"
                value={filters.DepartmentID}
                dynamicOptions={departmentFilterOptions}
                onChange={handleFilterSelect}
                respclass=""
              />
            </div>
            <div className="em-filter-field">
              <ReactSelect
                id="filterCategoryId"
                name="CategoryID"
                placeholderName="Category"
                value={filters.CategoryID}
                dynamicOptions={categoryFilterOptions}
                onChange={handleFilterSelect}
                respclass=""
              />
            </div>
            <div className="em-filter-field">
              <ReactSelect
                id="filterStatus"
                name="Status"
                placeholderName="Status"
                value={filters.Status}
                dynamicOptions={STATUS_OPTIONS}
                onChange={handleFilterSelect}
                respclass=""
              />
            </div>
            <CustomButton
              icon="add"
              variant="success"
              onClick={handleAdd}
              title={t("Add Equipment")}
              aria-label={t("Add Equipment")}
            />
          </div>
        }
      />

      <div className="mt-1 table_ticket">
        <CustomTable columns={columns} data={rows} disableTooltip={true} />
      </div>

      <AddEquipmentModal
        visible={showModal}
        setVisible={(open) => {
          setShowModal(open);
          if (!open) setEditRow(null);
        }}
        onSave={handleSave}
        initialData={editFormData}
        nextCode={buildNextEquipmentCode(tableData)}
        isEdit={Boolean(editRow)}
        centreList={centreList}
        departmentList={departmentList}
        categoryList={categoryList}
        vendorList={vendorList}
        isSaving={isSaving}
      />

      <ViewEquipmentModal
        visible={showViewModal}
        setVisible={(open) => {
          setShowViewModal(open);
          if (!open) setViewItem(null);
        }}
        item={viewItem}
      />

      <EquipmentQrModal
        visible={showQrModal}
        setVisible={(open) => {
          setShowQrModal(open);
          if (!open) setQrItem(null);
        }}
        item={qrItem}
      />
    </div>
  );
};

export default EquipmentMasterTab;
