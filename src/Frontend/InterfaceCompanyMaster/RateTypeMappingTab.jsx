import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import Tables from "@components/UI/customTable";
import ReactSelect from "@components/formComponent/ReactSelect";
import Heading from "@components/UI/Heading";
import { CustomButton, SaveButton, SearchButton } from "@components/UI/CustomButton";
import { axiosInstance } from "@app/utils/axiosInstance";
import CentreMappingImportExportModal from "./CentreMappingImportExportModal";

const RateTypeMappingTab = ({ companyList }) => {
  const { t } = useTranslation();

  const interfaceOptions = companyList.map((i) => ({ label: i.CompanyName, value: i.ID }));

  const [centreOptions, setCentreOptions] = useState([]);
  const [filter, setFilter] = useState({ InterfaceCompanyID: "", CentreID: "" });
  const [tableData, setTableData] = useState([]);
  const [selectedRows, setSelectedRows] = useState({});
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [bulkInterfaceId, setBulkInterfaceId] = useState("");
  const [bulkInterfaceName, setBulkInterfaceName] = useState("");
  const [showImportExport, setShowImportExport] = useState(false);

  useEffect(() => {
    fetchCentres();
  }, []);

  const fetchCentres = () => {
    axiosInstance
      .get("Centre/getAccessCentres")
      .then((res) =>
        setCentreOptions(
          (res?.data?.message ?? []).map((ele) => ({
            value: ele.CentreID,
            label: ele.Centre,
          }))
        )
      )
      .catch((err) => toast.error(err?.response?.data?.message));
  };

  const handleSearch = () => {
    if (!filter.InterfaceCompanyID) {
      toast.warning(t("Please select an Interface Company"));
      return;
    }
    setIsSearching(true);
    axiosInstance
      .post("ItemMasterInterface/GetCentreMapping", {
        interfaceCompanyID: filter.InterfaceCompanyID || 0,
        centreId: filter.CentreID || 0,
      })
      .then((res) => {
        setTableData(Array.isArray(res?.data?.message) ? res.data.message : []);
        setSelectedRows({});
        setBulkInterfaceId("");
        setBulkInterfaceName("");
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
    setIsSaving(true);
    axiosInstance
      .post("ItemMasterInterface/ImportCentreMasterInterface", {
        interfaceCompanyID: Number(filter.InterfaceCompanyID) || 0,
        interfaceCompanyName: interfaceOptions.find((o) => o.value == filter.InterfaceCompanyID)?.label || "",
        centreID: Number(filter.CentreID) || 0,
        centreData: checkedRows.map((r) => ({
          centreIDInterface: Number(r.CentreID_interface) || 0,
          centreID: Number(r.CentreID) || 0,
          interfaceCentreName: r.Interface_CentreName ?? "",
        })),
      })
      .then((res) => {
        if(res?.data?.success) {
          toast.success(res?.data?.message);
          handleSearch();
        } else {
          toast.error(res?.data?.message);
        }
      })
      .catch((err) => toast.error(err?.response?.data?.message))
      .finally(() => setIsSaving(false));
  };

  const handleInlineChange = (idx, field, value) => {
    setTableData((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, [field]: value } : r))
    );
  };

  const handleBulkInterfaceIdChange = (e) => {
    const val = e.target.value;
    setBulkInterfaceId(val);
    setTableData((prev) =>
      prev.map((r, i) => (selectedRows[i] ? { ...r, CentreID_interface: val } : r))
    );
  };

  const handleBulkInterfaceNameChange = (e) => {
    const val = e.target.value;
    setBulkInterfaceName(val);
    setTableData((prev) =>
      prev.map((r, i) => (selectedRows[i] ? { ...r, Interface_CentreName: val } : r))
    );
  };

  const isAllSelected = tableData.length > 0 && tableData.every((_, idx) => selectedRows[idx]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const all = {};
      tableData.forEach((_, idx) => { all[idx] = true; });
      setSelectedRows(all);
    } else {
      setSelectedRows({});
    }
  };

  return (
    <div className="p-2">
      <Heading title="Centre Mapping" />
      <div className="row mb-2 mt-2">
        <ReactSelect
          id="cmInterfaceCompany"
          name="InterfaceCompany"
          placeholderName="Interface Company"
          dynamicOptions={interfaceOptions}
          value={filter.InterfaceCompanyID}
          onChange={(name, option) =>
            setFilter((prev) => ({ ...prev, InterfaceCompanyID: option?.value ?? "" }))
          }
          respclass="col-md-2 col-6"
        />
        <ReactSelect
          id="cmCentre"
          name="CentreID"
          placeholderName="Centre"
          dynamicOptions={centreOptions}
          value={filter.CentreID}
          onChange={(name, option) =>
            setFilter((prev) => ({ ...prev, CentreID: option?.value ?? "" }))
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

      <Heading title="Search Data" />
      <Tables>
        <thead>
          <tr>
            <th>{t("S.No")}</th>
            <th>{t("Centre")}</th>
            <th>{t("Centre Code")}</th>
            <th>
              {t("Interface Centre ID")}
              <input
                type="text"
                className="form-control form-control-sm mt-1"
                placeholder={t("Fill all")}
                value={bulkInterfaceId}
                onChange={handleBulkInterfaceIdChange}
                style={{ minWidth: 90 }}
              />
            </th>
            <th>
              {t("Interface Centre Name")}
              <input
                type="text"
                className="form-control form-control-sm mt-1"
                placeholder={t("Fill all")}
                value={bulkInterfaceName}
                onChange={handleBulkInterfaceNameChange}
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
          </tr>
        </thead>
        <tbody>
          {tableData.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center py-3 text-muted">{t("No Record Found")}</td>
            </tr>
          ) : (
            tableData.map((row, idx) => {
              const checked = !!selectedRows[idx];
              return (
                <tr key={idx}>
                  <td>{idx + 1}</td>
                  <td>{row.Centre ?? ""}</td>
                  <td>{row.CentreCode ?? ""}</td>
                  <td>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={row.CentreID_interface ?? ""}
                      disabled={!checked}
                      placeholder={checked ? t("Enter ID") : "—"}
                      onChange={(e) => handleInlineChange(idx, "CentreID_interface", e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={row.Interface_CentreName ?? ""}
                      disabled={!checked}
                      placeholder={checked ? t("Enter name") : "—"}
                      onChange={(e) => handleInlineChange(idx, "Interface_CentreName", e.target.value)}
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
                </tr>
              );
            })
          )}
        </tbody>
      </Tables>

      {tableData.length > 0 && (
        <div className="mt-3">
          <SaveButton text="Save" onClick={handleSaveMapping} disabled={isSaving} />
        </div>
      )}

      <CentreMappingImportExportModal
        visible={showImportExport}
        onClose={() => setShowImportExport(false)}
        interfaceOptions={interfaceOptions}
        centreOptions={centreOptions}
      />
    </div>
  );
};

export default RateTypeMappingTab;
