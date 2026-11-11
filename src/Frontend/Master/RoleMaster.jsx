import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { SelectBox } from "../../components/formComponent/SelectBox";
import Input from "../../components/formComponent/Input";
import { toast } from "react-toastify";
import Loading from "../../components/loader/Loading";
import Tables from "../../components/UI/customTable";
import { axiosInstance } from "../../utils/axiosInstance";
import { getDesignationData } from "../../utils/NetworkApi/commonApi";
import { number } from "../../utils/helpers";

import Accordion from "@app/components/UI/Accordion";
const RoleMaster = () => {
  const { t } = useTranslation();
  const [Designation, setDesigation] = useState([]);
  const [roleData, setRoleData] = useState([]);
  const [RoleId, setRoleId] = useState("");
  const [loading, setLoading] = useState(false);

  const getRoleData = (id) => {
    setLoading(true);
    axiosInstance
      .post("Designation/getAccessUserwithtime", { RoleId: id })
      .then((res) => {
        if (res?.data?.success) setRoleData(res.data.message);
        else {
          setRoleData([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        toast.error("No Record Found");
        setLoading(false);
      });
  };

  function saveRoleData() {
    setLoading(true);
    axios
      .post("Designation/AccessUserwithtime", {
        ...roleData[0],
        RoleId: RoleId,
      })
      .then((res) => {
        toast.success(res.data.message);
        setRoleId("");
        setRoleData([]);
        setLoading(false);
      })
      .catch((err) => {
        toast.error(err.responce.data.message);
        setLoading(false);
      });
  }

  useEffect(() => {
    getDesignationData(setDesigation, true);
  }, []);
  const handleValueChange = (e) => {
    const { value, name, checked, type } = e.target;
    const valueToUpdate = [...roleData];
    valueToUpdate[0][name] = type === "checkbox" ? (checked ? 1 : 0) : value;
    console.log(valueToUpdate);
    setRoleData(valueToUpdate);
  };
  return (
    <>
      <Accordion name="Role Master" defaultValue={true} isBreadcrumb={true}>
        <div className="row pt-2 pl-2 pr-2">
          <div className="col-sm-2 col-md-2">
            <SelectBox
              options={[{ value: "", label: "Select Role" }].concat(
                Designation,
              )}
              name="Role"
              id="Role"
              lable="Role"
              selectedValue={RoleId}
              onChange={(e) => {
                setRoleId(e.target.value);
                if (e.target.value !== "") getRoleData(e.target.value);
              }}
            />
          </div>
          <div className="col-sm-1">
            <button
              className="btn btn-info btn-sm btn-block"
              onClick={() => {
                RoleId !== "" ? getRoleData(RoleId) : toast.warn("Select Role");
              }}
            >
              {t("Search")}
            </button>
          </div>
          <span className="col-sm-2 requiredlabel">
            * All value should be in minutes
          </span>
        </div>
      </Accordion>
      {loading ? (
        <Loading />
      ) : (
        <>
          {RoleId !== "" && roleData.length > 0 && (
            <>
              <Tables>
                <thead className="cf">
                  <tr>
                    <th>{t("S.No")}</th>
                    <th>{t("Print Due Report")}</th>
                    <th>{t("Role Name")}</th>
                    <th>{t("Edit Info")}</th>
                    <th>{t("Settlement")}</th>
                    <th>{t("Disc. Affter Bill")}</th>
                    <th>{t("Change Panel")}</th>
                    <th>{t("Change PayMode")}</th>
                    <th>{t("Recipt Cancel")}</th>
                    <th>{t("Lab refund")}</th>
                  </tr>
                </thead>
                <tbody>
                  {roleData.map((data, index) => {
                    return (
                      <tr>
                        <td data-title={t("S.No")}>{index + 1}</td>
                        <td data-title={t("Print Due Report")}>
                          <input
                            name="PrintdueReport"
                            type={"checkbox"}
                            checked={data?.PrintdueReport === 0 ? false : true}
                            onChange={handleValueChange}
                          />
                        </td>
                        <td data-title={t("Role Name")}>{data?.RoleName}</td>
                        <td data-title={t("Edit Info")}>
                          <Input
                            name="Editinfo"
                            value={data?.Editinfo}
                            onChange={handleValueChange}
                            type="number"
                            onInput={(e) => number(e, 4, 9999)}
                          />
                        </td>
                        <td data-title={t("Settlement")}>
                          <Input
                            name="Settlement"
                            value={data?.Settlement}
                            onChange={handleValueChange}
                            type="number"
                            onInput={(e) => number(e, 4, 9999)}
                          />
                        </td>
                        <td data-title={t("Disc. Affter Bill")}>
                          <Input
                            name="Discountafterbill"
                            value={data?.Discountafterbill}
                            onChange={handleValueChange}
                            type="number"
                            onInput={(e) => number(e, 4, 9999)}
                          />
                        </td>
                        <td data-title={t("Change Panel")}>
                          <Input
                            name="ChangePanel"
                            value={data?.ChangePanel}
                            onChange={handleValueChange}
                            type="number"
                            onInput={(e) => number(e, 4, 9999)}
                          />
                        </td>
                        <td data-title={t("Change PayMode")}>
                          <Input
                            name="ChangePaymode"
                            value={data?.ChangePaymode}
                            onChange={handleValueChange}
                            type="number"
                            onInput={(e) => number(e, 4, 9999)}
                          />
                        </td>
                        <td data-title={t("Recipt Cancel")}>
                          <Input
                            name="RecieptCancel"
                            value={data?.RecieptCancel}
                            onChange={handleValueChange}
                            type="number"
                            onInput={(e) => number(e, 4, 9999)}
                          />
                        </td>
                        <td data-title={t("Lab Refund")}>
                          <Input
                            name="LabRefund"
                            value={data?.LabRefund}
                            onChange={handleValueChange}
                            type="number"
                            onInput={(e) => number(e, 4, 9999)}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Tables>

              <div className="row mt-2 mb-1">
                <div className="col-sm-1">
                  <button
                    className="btn btn-info btn-sm btn-block"
                    onClick={() => {
                      saveRoleData();
                    }}
                  >
                    {t("Update")}
                  </button>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </>
  );
};

export default RoleMaster;
