import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Accordion from "../../components/UI/Accordion";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { SaveButton } from "../../components/UI/CustomButton";
import Loading from "../../components/loader/Loading";
import Tables from "../../components/UI/customTable";
import {
  bindCentresForRadiology,
  getDepartments,
  getCentreDepartmentMapping,
  saveCentreDepartmentMapping,
} from "./api";

const CentreDepartmentMaster = () => {
  const [centres, setCentres] = useState([]);
  const [allDepartments, setAllDepartments] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedCentreId, setSelectedCentreId] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadInitial(); }, []);

  const loadInitial = async () => {
    try {
      const [cRes, dRes] = await Promise.all([
        bindCentresForRadiology(),
        getDepartments(),
      ]);
      setCentres(
        (cRes?.data?.message || []).map((c) => ({
          value: c.CentreId ?? c.CentreID,
          label: c.Centre ?? c.CentreName,
        }))
      );
      setAllDepartments(
        (dRes?.data?.message || []).map((d) => ({
          DepartmentId:   d.DepartmentID,
          DepartmentName: d.Department,
        }))
      );
    } catch {
      toast.error("Failed to load data.");
    }
  };

  const loadDepartmentMapping = async (centreId) => {
    setLoading(true);
    try {
      const res = await getCentreDepartmentMapping(centreId);
      const mapped = res?.data?.message || [];
      setDepartments(
        allDepartments.map((d) => {
          const match = mapped.find(
            (m) => String(m.DepartmentId) === String(d.DepartmentId)
          );
          const isChecked = !!match?.IsActive;
          return {
            ...d,
            checked:         isChecked,
            originalChecked: isChecked,
          };
        })
      );
    } catch {
      toast.error("Failed to load department mapping.");
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCentreChange = async (name, option) => {
    const centreId = option?.value || "";
    setSelectedCentreId(centreId);
    if (!centreId) { setDepartments([]); return; }
    await loadDepartmentMapping(centreId);
  };

  const handleToggleDepartment = (deptId) => {
    setDepartments((prev) =>
      prev.map((d) =>
        d.DepartmentId === deptId ? { ...d, checked: !d.checked } : d
      )
    );
  };

  const changedDepartments = departments.filter(
    (d) => d.checked !== d.originalChecked
  );

  const handleSave = async () => {
    if (changedDepartments.length === 0) {
      toast.warn("No changes to save.");
      return;
    }
    setSaving(true);
    try {
      const results = await Promise.all(
        changedDepartments.map((d) =>
          saveCentreDepartmentMapping({
            centreId:       selectedCentreId,
            departmentId:   d.DepartmentId,
            departmentName: d.DepartmentName,
            action:         d.checked ? "add" : "Remove",
          })
        )
      );
      const failed = results.some((res) => !res?.data?.success);
      if (failed) {
        toast.error("Some departments could not be saved.");
      } else {
        toast.success("Department mapping saved successfully.");
      }
      await loadDepartmentMapping(selectedCentreId);
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Accordion name="Centre Department Mapping" defaultValue={true} isBreadcrumb={true}>
        <div className="row pt-2 pl-2 pr-2">
          <div className="col-sm-3">
            <ReactSelect
              id="CDM_Centre"
              name="CentreId"
              placeholderName="Select Centre"
              dynamicOptions={centres}
              value={selectedCentreId}
              onChange={handleCentreChange}
            />
          </div>
        </div>
      </Accordion>

      {selectedCentreId && (
        <Accordion
          name="Departments"
          defaultValue={true}
          isBreadcrumb={true}
          notOpen={true}
          linkTo="#"
          linkTitle={
            <span style={{ fontSize: "12px" }}>
              {departments.filter((d) => d.checked).length} of {departments.length} department(s) mapped
            </span>
          }
        >
          {loading ? (
            <Loading />
          ) : (
            <>
              <Tables>
                <thead className="cf">
                  <tr>
                    <th style={{ width: "60px" }}>S.No</th>
                    <th style={{ width: "80px" }}>Map</th>
                    <th>Department</th>
                  </tr>
                </thead>
                <tbody>
                  {departments.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center text-muted py-3">
                        No departments found.
                      </td>
                    </tr>
                  ) : (
                    departments.map((dept, idx) => (
                      <tr key={dept.DepartmentId}>
                        <td>{idx + 1}</td>
                        <td>
                          <input
                            type="checkbox"
                            checked={dept.checked}
                            onChange={() => handleToggleDepartment(dept.DepartmentId)}
                          />
                        </td>
                        <td>{dept.DepartmentName}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Tables>

              <div className="row pt-2 pl-2 pr-2">
                <SaveButton
                  text="Save"
                  onClick={handleSave}
                  disabled={saving || changedDepartments.length === 0}
                  loading={saving}
                />
              </div>
            </>
          )}
        </Accordion>
      )}
    </>
  );
};

export default CentreDepartmentMaster;
