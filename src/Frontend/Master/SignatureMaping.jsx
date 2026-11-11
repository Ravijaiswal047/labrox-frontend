import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Accordion from "@app/components/UI/Accordion";
import { toast } from "react-toastify";
import Loading from "../../components/loader/Loading";
import { axiosInstance } from "../../utils/axiosInstance";
import Heading from "../../components/UI/Heading";
import CustomTable from "../../components/Table/CustomTable";
import { FaEye, FaTrash } from "react-icons/fa";
import SignatureMapingModal from "./SignatureMapingModal";
import ReactSelect from "../../components/formComponent/ReactSelect";
import Input from "../../components/formComponent/Input";
import CustomTimePicker from "../../components/formComponent/TimePicker";

const SignatureMaping = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [MapTest, setMapTest] = useState([]);
  const [showOP, setShowOP] = useState(false);
  const [selectedData, setSelectedData] = useState([]);
  const [dropDownList, setDropdownList] = useState({
    centreList: [],
    DepartmentList: [],
    DoctorList: [],
  });
  const User = localStorage.getItem("User") ? true : false;

  const handleSearchSelectChange = (label, value) => {
    setPayload({ ...payload, [label]: value?.value });
  };
  const initialPayload = {
    DepartmentName: "",
    DoctorName: "",
    TestCentre: "",
    ApprovalType: "",
    FromDate: new Date(),
    FromTime: "00:00:00",
    ToTime: "23:59:59",
    ToDate: new Date(),
  };
  const [payload, setPayload] = useState(initialPayload);
  const [tableData, setTableData] = useState([]);
  const handleSave = async () => {
    try {
      setLoading(true);
      if (!payload?.TestCentre) {
        toast.warn("Please Select Centre");
        return;
      }
      const selectDoctorOption = dropDownList?.DoctorList?.find(
        (item) => item?.value == payload.DoctorName
      );
      const reqPayload = {
        departmentid: String(payload?.DepartmentName || ""),
        doctorId: Number(payload?.DoctorName || 0),
        centreId: String(payload?.TestCentre || ""),
        ApprovalType: payload?.ApprovalType,
        FromTime: payload?.FromTime,
        ToTime: payload?.ToTime,
        doctorName: selectDoctorOption?.label,
      };
      const res = await axiosInstance.post(
        "AutoApproval/SaveAutoAupprovalMasterSig",
        reqPayload
      );
      const { message, success } = res?.data;
      if (success) {
        setPayload({ ...initialPayload });
        setPayload["FromTime"] = "00:00:00";
        setPayload["ToTime"] = "23:59:59";

        toast.success(message, "Data Saved Successfully");
        getAutoApprovalMasterSig();
      } else {
        toast.error(message);
      }
    } catch (err) {
      console.error("Error in handleSave:", err);
      toast.error(err?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (row) => {
    console.log("handleDelete111", row);
    try {
      setLoading(true);
      // if (!payload?.TestCentre) {
      //   toast.warn("Please Select Centre");
      //   return;
      // }
      const reqPayload = {
        id: Number(row?.id || 0),
      };
      const res = await axiosInstance.post(
        "/AutoApproval/DeleteAutoApprovalMasterSig",
        reqPayload
      );
      const { message, success } = res?.data;
      if (success) {
        toast.success(message, "Data Delete Successfully");
        getAutoApprovalMasterSig();
      } else {
        toast.error(message, "No Data Found");
      }
    } catch (err) {
      console.error("Error in handleSave:", err);
      toast.error(err?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleTime = (time, name) => {
    setPayload({ ...payload, [name]: time });
  };

  const tableHeaders = [
    { header: "Sr No.", field: "srNo" },
    { header: "Centre", field: "Centre" },
    { header: "Department", field: "Department" },
    { header: "Doctor", field: "Doctor" },
    { header: "CreatedBy", field: "EnterdBy" },
    { header: "ApprovalType", field: "ApprovalType" },
    { header: "FromTime", field: "FromTime" },
    { header: "ToTime", field: "ToTime" },
    { header: "CreatedDate", field: "EntryDate" },

    { header: "View", field: "View" },
    { header: "Remove", field: "Remove" },
  ];
  const formattedData = tableData.map((row, index) => ({
    srNo: index + 1,
    Centre: row?.centre,
    Department: row.Department,
    Doctor: row.ApproveByName,
    EnterdBy: row.EnterdBy,
    ApprovalType: row.ApprovalType,
    FromTime: row.FromTime,
    ToTime: row.ToTime,
    EntryDate: row.EntryDate,

    View: (
      <FaEye
        onClick={() => {
          setShowOP(true), setSelectedData(row);
        }}
        style={{ cursor: "pointer", color: "#0d6efd", fontSize: "18px" }}
        title="View"
      />
    ),
    Remove: (
      <FaTrash
        onClick={() => handleDelete(row)}
        style={{ cursor: "pointer", color: "#dc3545", fontSize: "18px" }}
        title="Delete"
      />
    ),
  }));

  const getAllCentres = async () => {
    await axiosInstance
      .get("Employee/GetAllCentres")
      .then((res) => {
        let centreList = res?.data?.message?.map((ele) => {
          return {
            value: String(ele?.CentreID),
            label: ele?.Centre,
          };
        });
        setMapTest(centreList);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const getDepartment = async () => {
    await axiosInstance
      .get("Department/getDepartment")
      .then((res) => {
        let DepartmentList = res?.data?.message?.map((ele) => {
          return {
            value: String(ele?.DepartmentID),
            label: ele?.Department,
          };
        });
        setDropdownList((prev) => ({
          ...prev,
          DepartmentList: DepartmentList,
        }));
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const getBindDoctor = async () => {
    const reqPayload = {
      doctorName: "",
    };
    await axiosInstance
      .post("AutoApproval/getBindDoctor", reqPayload)
      .then((res) => {
        let DoctorList = res?.data?.message?.map((ele) => {
          return {
            value: String(ele?.employeeid),
            label: ele?.name,
          };
        });
        setDropdownList((prev) => ({
          ...prev,
          DoctorList: DoctorList,
        }));
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const getAutoApprovalMasterSig = async () => {
    try {
      const res = await axiosInstance.post(
        "AutoApproval/getAutoApprovalMasterSig"
      );

      const response = res?.data?.message;
      console.log("response111", response);
      if (Array.isArray(response)) {
        setTableData(response);
      } else {
        setTableData([]);
        toast.error("No data found");
      }
    } catch (err) {
      console.error("Error fetching Auto Approval data:", err);
      toast.error(err?.response?.data?.message || "Failed to fetch data");
    }
  };

  useEffect(() => {
    getAllCentres();
    getDepartment();
    getBindDoctor();
    getAutoApprovalMasterSig();
  }, []);

  return (
    <>
      {showOP && (
        <SignatureMapingModal
          show={showOP}
          setShow={setShowOP}
          selectedData={selectedData}
        />
      )}
      <Accordion
        name={t("Signature Mapping")}
        isBreadcrumb={true}
        defaultValue={true}
      >
        <div className="row px-2 mt-2 mb-1">
          <div className="col-md-2">
            <ReactSelect
              dynamicOptions={[
                { label: "Seclect Test Centre", value: "" },
                ...MapTest,
              ]}
              name="TestCentre"
              lable={t("Test Centre")}
              id="TestCentre"
              removeIsClearable={true}
              placeholderName={t("Test Centre")}
              value={payload?.TestCentre}
              onChange={handleSearchSelectChange}
            />
          </div>
          <div className="col-md-2">
            <ReactSelect
              dynamicOptions={[
                { label: "Seclect Doctor", value: "" },
                ...dropDownList?.DoctorList,
              ]}
              name="DoctorName"
              lable={t("Doctor Name")}
              id="DoctorName"
              removeIsClearable={true}
              placeholderName={t("DoctorName")}
              value={payload?.DoctorName}
              onChange={handleSearchSelectChange}
            />
          </div>
          <div className="col-md-2">
            <ReactSelect
              dynamicOptions={[
                { label: "Seclect Department", value: "" },
                ...dropDownList?.DepartmentList,
              ]}
              name="DepartmentName"
              id="DepartmentName"
              lable={t("Department Name")}
              removeIsClearable={true}
              placeholderName={t("Department Name")}
              value={payload?.DepartmentName}
              onChange={handleSearchSelectChange}
            />
          </div>
          <div className="col-md-2">
            <ReactSelect
              dynamicOptions={[
                { label: "Auto", value: "Auto" },
                { label: "Manual", value: "Manual" },
              ]}
              name="ApprovalType"
              id="ApprovalType"
              lable={t(" ApprovalType")}
              removeIsClearable={true}
              placeholderName={t("ApprovalType")}
              value={payload?.ApprovalType}
              onChange={handleSearchSelectChange}
            />
          </div>
          <div className="col-sm-1">
            <CustomTimePicker
              name="FromTime"
              placeholder="FromTime"
              value={payload?.FromTime}
              id="FromTime"
              lable="FromTime"
              onChange={handleTime}
              disabled={User}
            />
          </div>
          <div className="col-sm-1">
            <CustomTimePicker
              name="ToTime"
              placeholder="ToTime"
              value={payload?.ToTime}
              id="ToTime"
              lable="ToTime"
              onChange={handleTime}
              disabled={User}
            />
          </div>
          <div className="col-sm-1 col-12">
            {loading ? (
              <Loading />
            ) : (
              <button
                className="btn btn-info btn-block btn-sm"
                onClick={handleSave}
              >
                {t("Save")}
              </button>
            )}
          </div>
        </div>
      </Accordion>
      <div className="card mt-2">
        <Heading title={t("Saved data")} />

        <div className="row">
          <div className="col-sm-12">
            <CustomTable columns={tableHeaders} data={formattedData} />
          </div>
        </div>
      </div>
    </>
  );
};

export default SignatureMaping;
