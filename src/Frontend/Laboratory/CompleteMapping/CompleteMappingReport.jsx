import { useEffect, useState } from "react";
import MultiSelectComp from "../../../components/formComponent/MultiSelectComp";
import Accordion from "../../../components/UI/Accordion";
import {
  getAccessCentresReports,
  getDepartment,
} from "../../../utils/NetworkApi/commonApi";
import { useTranslation } from "react-i18next";
import { axiosInstance, axiosReport } from "../../../utils/axiosInstance";
import { CustomButton } from "../../../components/UI/CustomButton";
import ReactSelect from "../../../components/formComponent/ReactSelect";

const CompleteMappingReport = () => {
  const [t] = useTranslation();
  const [CentreData, setCentreData] = useState([]);
  const [Department, setDepartment] = useState([]);
  const [machineGroup, setMachineGroup] = useState([]);
  const [formData, setFormData] = useState({
    CentreId: [],
    DepartmentId: [],
    MachineId: [],
    DataType: "Interpretation",
    isCenterPrint: 0,
    Gender: "",
  });
  const [loading, setLoading] = useState(false);

  const DataTypeOptions = [
    { label: "Interpretation", value: "Interpretation" },
    { label: "Comment", value: "Comment" },
    { label: "Range", value: "Range" },
  ];
  const GenderOptions = [
    { label: "Select Gender", value: "" },
    { label: "Male", value: "Male" },
    { label: "Female", value: "Female" },
  ];

  console.log("Form data", formData);

  const getDepartmentReports = (state) => {
    axiosInstance
      .get("Department/getDepartment")
      .then((res) => {
        const data = res.data.message;
        const DeptDataValue = data.map((ele) => {
          return {
            value: ele?.DepartmentID,
            label: ele?.Department,
          };
        });
        state(DeptDataValue);
      })
      .catch((err) => console.log(err));
  };

  const getMachineGroup = (state) => {
    axiosInstance
      .get("MachineGroup/BindMachineName")
      .then((res) => {
        const data = res.data.message;
        const MachineDataValue = data.map((ele) => {
          return {
            label: ele?.MachineName,
            value: ele?.MachineId,
          };
        });
        state(MachineDataValue);
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    getAccessCentresReports(setCentreData);
    getDepartmentReports(setDepartment);
  }, []);

  useEffect(() => {
    if (formData.DataType === "Range") {
      getMachineGroup(setMachineGroup);
    }
  }, [formData.DataType]);

  const handleSelectChange = (name, value) => {
    setFormData({ ...formData, [name]: value?.value });
  };

  const handleSelectMultiChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleDownloadReport = async () => {
    setLoading(true);
    try {
      const res = await axiosReport.post(
        `${
          formData.DataType === "Interpretation"
            ? "CompleteMappingReport_Interpretation/GetCompleteMappingReport_Interpretation"
            : formData.DataType === "Comment"
              ? "CompleteMappingReport_Interpretation/GetCompleteMappingReport_Comment"
              : "CompleteMappingReport_Interpretation/GetCompleteMappingReport_Range"
        }`,
        formData,
        { responseType: "blob" }
      );

      if (res?.status === 200) {
        const file = new Blob([res.data], { type: "application/pdf" });
        const fileURL = URL.createObjectURL(file);
        window.open(fileURL, "_blank");
      }
    } catch (error) {
      console.log("Error while downloading pdf", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Accordion
      name={`${t("Complete Mapping Report")}`}
      defaultValue={true}
      isBreadcrumb={true}
    >
      <div className="row px-2 mt-2 p-1">
        <div className="col-sm-2">
          <ReactSelect
            name="DataType"
            id="DataType"
            lable="DataType"
            placeholderName={t("DataType")}
            value={formData?.DataType}
            dynamicOptions={DataTypeOptions}
            removeIsClearable={true}
            onChange={handleSelectChange}
          />
        </div>
        {formData.DataType === "Interpretation" && (
          <div className="col-sm-2">
            <MultiSelectComp
              label="All Centre"
              options={CentreData}
              value={formData?.CentreId}
              name="CentreId"
              id="CentreId"
              onChange={handleSelectMultiChange}
              lable={t("Select Centre")}
            />
          </div>
        )}
        {formData.DataType != "Range" && (
        <div className="col-sm-2">
          <MultiSelectComp
            label="All Department"
            options={Department}
            value={formData?.DepartmentId }
            name="DepartmentId"
            id="DepartmentId"
            onChange={handleSelectMultiChange}
            lable={t("Select Department")}
          />
        </div>
        )}
        {formData.DataType === "Range" && (
          <div className="col-sm-2">
            <MultiSelectComp
              label="Machine Group"
              options={machineGroup}
              value={formData?.MachineId}
              name="MachineId"
              onChange={handleSelectMultiChange}
              lable={t("Select Machines")}
            />
          </div>
        )}
        {formData.DataType === "Range" && (
          <div className="col-sm-2">
            <ReactSelect
              name="Gender"
              id="Gender"
              lable="Gender"
              placeholderName={t("Gender")}
              value={formData?.Gender}
              dynamicOptions={GenderOptions}
              removeIsClearable={true}
              onChange={handleSelectChange}
            />
          </div>
        )}
        {formData.DataType === "Interpretation" && (
          <div className="col-sm-2 d-flex justify-content-start justify-content-sm-center align-items-start">
            <input
              type="checkbox"
              name="isCenterPrint"
              id="isCenterPrint"
              value="isCenterPrint"
              checked={formData.isCenterPrint === 1}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  isCenterPrint: e.target?.checked ? 1 : 0,
                });
              }}
            ></input>
            <label className="control-label ml-2 m-0" htmlFor="isCenterPrint">
              {t("isCenterPrint")}
            </label>
          </div>
        )}
      </div>
      <div className="row px-2 p-1">
        <div className="col-sm-2">
          {loading ? (
            <button type={"text"} className={`rounded px-3`} disabled={loading}>
              <i className="fa fa-spinner fa-spin me-2 mr-2" />
              {t("Downloading...")}
            </button>
          ) : (
            <CustomButton
              text={"PDF Download"}
              icon={"pdf"}
              onClick={handleDownloadReport}
              disabled={loading}
            />
          )}
        </div>
      </div>
    </Accordion>
  );
};

export default CompleteMappingReport;
