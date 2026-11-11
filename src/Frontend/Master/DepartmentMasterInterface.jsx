import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { axiosInstance } from "../../utils/axiosInstance";
import {
  AllowCharactersNumbersAndSpecialChars,
  getTrimmedData,
} from "../../utils/helpers";
import { validationHMIS } from "../../utils/Schema";
import { toast } from "react-toastify";
import Accordion from "@app/components/UI/Accordion";
import Input from "../../components/formComponent/Input";
import Loading from "../../components/loader/Loading";
import Tables from "../../components/UI/customTable";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import ReactSelect from "../../components/formComponent/ReactSelect";

const DepartmentMasterInterface = () => {
  const [loading, setLoading] = useState(false);

  const [tableData, setTableData] = useState([]);
  const [DepartmentData, setDepartmentData] = useState([]);
  const [err, setErr] = useState({});
  const [formData, setFormData] = useState({
    HmisDepartmentCode: "",
    HmisDepartment: "",
    DepartmentID: 0,
    isActive: 1,
    ID: 0,
    InterfaceCompany: "",
  });
  const [companyInterface, setCompanyInterface] = useState([]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData({
        ...formData,
        [name]: type === "checkbox" ? checked : value,
      });
    } else {
      setFormData({
        ...formData,
        [name]: AllowCharactersNumbersAndSpecialChars(value)
          ? value
          : formData[name],
      });
    }
  };

  const handleSearchSelectChange = (label, value) => {
    setFormData({ ...formData, [label]: value?.value });
  };

  const getDepartment = (Centre) => {
    axiosInstance
      .get("Department/getDepartment")
      .then((res) => {
        let data = res.data.message;
        let DeptDataValue = data.map((ele) => {
          return {
            value: ele.DepartmentID,
            label: ele.Department,
          };
        });
        setDepartmentData(DeptDataValue);
      })
      .catch((err) => {});
  };

  useEffect(() => {
    getDepartment();
  }, []);

  const { t } = useTranslation();
  const postData = () => {
    let generatedError = validationHMIS(formData);
    if (generatedError === "") {
      setLoading(true);
      axiosInstance
        .post(
          "ItemMasterInterface/SaveHMISDepartmentData",
          getTrimmedData({
            ...formData,
            isActive: formData?.isActive ? 1 : 0,
            DepartmentID: formData?.DepartmentID,
          }),
        )
        .then((res) => {
          if (res?.data?.message) {
            if (res?.data?.success) {
              setFormData({
                HmisDepartment: "",
                HmisDepartmentCode: "",
                isActive: 1,
                DepartmentID: 0,
                ID: 0,
                InterfaceCompany: "",
              });
              setLoading(false);
              getTableData();
              setErr({});
              toast.success(res?.data?.message);
            } else {
              toast.error(res?.data?.message);
              setLoading(false);
            }
          } else {
            toast.error("Something went wrong");
            setLoading(false);
          }
        })
        .catch((err) => {
          toast.error(
            err?.response?.data?.message
              ? err?.response?.data?.message
              : "Error Occured",
          );
          setLoading(false);
        });
    } else {
      setErr(generatedError);
      setLoading(false);
    }
  };

  const EditData = (data) => {
    console.log(data);
    setFormData({
      HmisDepartment: data?.HmisDepartment,
      HmisDepartmentCode: data?.HmisDepartmentCode,
      isActive: data?.Status == "Active" ? 1 : 0,
      DepartmentID: data?.DepartmentID,
      ID: data?.ID,
      InterfaceCompany: data?.InterfaceCompany,
    });
  };

  const getTableData = () => {
    axiosInstance
      .get("ItemMasterInterface/GetHMISDepartmentData")
      .then((res) => {
        setTableData(res.data.message);
        setLoading(false);
      })
      .catch((err) => console.log(err));
  };

  const getInterfaceCompany = () => {
    axiosInstance
      .get("ItemMasterInterface/BindInterfaceCompany")
      .then((res) => {
        const data = res?.data?.message;
        const val = data.map((ele) => {
          return {
            value: ele?.CompanyName,
            label: ele?.CompanyName,
          };
        });
        setCompanyInterface(val);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    getInterfaceCompany();
    getTableData();
  }, []);

  console.log({ formData });
  return (
    <>
      <Accordion
        name={t("Department Master Interface")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row pt-2 pl-2 pr-2">
          <>
            <div className="col-sm-2">
              <ReactSelect
                className="required-fields"
                dynamicOptions={companyInterface}
                removeIsClearable={true}
                name="InterfaceCompany"
                lable="Interface Company"
                id="InterfaceCompany"
                placeholderName="Interface Company"
                value={formData?.InterfaceCompany}
                onChange={handleSearchSelectChange}
              />
              {formData?.InterfaceCompany === "" && (
                <span className="error-message">{err?.InterfaceCompany}</span>
              )}
            </div>
            <div className="col-sm-2  ">
              <ReactSelect
                dynamicOptions={DepartmentData}
                className="required-fields"
                name="DepartmentID"
                lable={t("Department")}
                id="Department"
                removeIsClearable={true}
                placeholderName={t("Select Department")}
                value={formData?.DepartmentID}
                onChange={handleSearchSelectChange}
              />
              {formData?.DepartmentID === 0 && (
                <span className="error-message">{err?.DepartmentID}</span>
              )}
            </div>
            <div className="col-sm-2">
              <Input
                className="required-fields"
                name="HmisDepartmentCode"
                lable="HMIS Department Code"
                id="HMIS Department Code"
                placeholder=" "
                value={formData?.HmisDepartmentCode}
                onChange={handleChange}
              />
              {formData?.HmisDepartmentCode.trim() === "" && (
                <span className="error-message">{err?.HmisDepartmentCode}</span>
              )}
            </div>
            <div className="col-sm-2">
              <Input
                className="required-fields"
                name="HmisDepartment"
                lable="HMIS Department Name"
                id="HMIS Department Name"
                placeholder=" "
                value={formData?.HmisDepartment}
                onChange={handleChange}
              />
              {formData?.HmisDepartment.trim() === "" && (
                <span className="error-message">{err?.HmisDepartment}</span>
              )}
              {formData?.HmisDepartment.trim().length > 0 &&
                formData?.HmisDepartment.trim().length < 2 && (
                  <span className="error-message">{err?.HmisDepartments}</span>
                )}
            </div>
          </>

          <div className="col-sm-1 mt-1 d-flex">
            <div className="mt-1">
              <input
                name="isActive"
                type="checkbox"
                checked={formData?.isActive}
                onChange={handleChange}
              />
            </div>
            <label className="col-sm-10">{t("Active")}</label>
          </div>
          <div className="col-sm-1">
            {loading ? (
              <Loading />
            ) : (
              <>
                {}
                <button
                  type="button"
                  className={`btn btn-info btn-block btn-sm`}
                  id="btnSave"
                  onClick={postData}
                >
                  {/* {t("Save")} */}
                  {formData?.ID !== 0 ? t("Update") : t("Save")}
                </button>
              </>
            )}
          </div>
        </div>
      </Accordion>
      <Accordion title={t("Search Data")} defaultValue={true}>
        <div className="row px-2 mt-2 mb-2">
          <div className="col-12">
            <Tables data={tableData ?? []}>
              <>
                <thead className="cf">
                  <tr>
                    <th>{t("S.No")}</th>
                    <th>{t("InterfaceCompany")}</th>
                    <th>{t("DepartmentID")}</th>
                    <th>{t("DepartmentName")}</th>
                    <th>{t("HMIS Code")}</th>
                    <th>{t("HMIS Department")}</th>
                    <th>{t("Active")}</th>
                    <th>{t("Action")}</th>
                  </tr>
                </thead>
                <tbody>
                  {(tableData ?? []).map((data, index) => (
                    <tr key={index}>
                      <td data-title={"S.No"}>{index + 1}&nbsp;</td>
                      <td data-title={"InterfaceCompany"}>
                        {data?.InterfaceCompany}&nbsp;
                      </td>
                      <td data-title={"DepartmentID"}>
                        {data?.DepartmentID}&nbsp;
                      </td>

                      <td data-title={"DepartmentName"}>
                        {data?.DepartmentName}&nbsp;
                      </td>
                      <td data-title={"Code"}>
                        {data?.HmisDepartmentCode}&nbsp;
                      </td>
                      <td data-title={"Department"}>
                        {data?.HmisDepartment}&nbsp;
                      </td>
                      <td data-title={"Active"}>
                        {data?.isActive ? "Active" : "In-Active"}&nbsp;
                      </td>
                      <td data-title={"Action"}>
                        <button
                          type="button"
                          className="btn btn-primary btn-lg"
                          id="btnSave"
                          title="Edit"
                          onClick={() => EditData(data)}
                        >
                          {t("Edit")}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </>
            </Tables>
          </div>
        </div>
      </Accordion>
    </>
  );
};

export default DepartmentMasterInterface;
