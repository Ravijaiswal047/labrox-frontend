import React, { useEffect, useState } from "react";
import {
  setInHouseModal,
  setModalData,
  setModalOpen,
} from "../../store/reducers/TicketingModuleSlice/TicketingModuleSlice";
import { setLoading } from "../../store/reducers/loadingSlice/loadingSlice";
import ReactSelect from "../../components/formComponent/ReactSelect";
import ImportInHouseDoctorModal from "./ImportInHouseDoctorModal";
import RadioInput from "../../components/formComponent/RadioInput";
import CustomTable from "../../components/Table/CustomTable";
import { axiosInstance } from "../../utils/axiosInstance";
import Input from "../../components/formComponent/Input";
import Modal from "../../components/ModalComponent/Modal";
import { useDispatch, useSelector } from "react-redux";
// import { ViewMenu } from "../../components/SvgIcons";
import { apiUrls } from "../../utils/apiEndpoints";
import Heading from "../../components/UI/Heading";
import InHouseMenuList from "./InHouseMenuList";
import { useTranslation } from "react-i18next";
import DoctorLogModal from "./DoctorLogModal";
import { notify } from "../../utils/utils";
import { Button } from "react-bootstrap";
import { FaEye } from "react-icons/fa";
import "./InHouseDoctor.css";

const DoctorShareItemWise = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [showMore, setShowMore] = useState(false);
  const [doctorShareData, setDoctorShareData] = useState([]);
  const { modalOpen, InHouseModal } = useSelector((data) => data.ticketing);

  const [dropdownlist, setDropdownList] = useState({
    doctorList: [],
    departmentList: [],
    shareTypeList: [
      { label: "Department-Wise", value: "1" },
      { label: "Item-Wise", value: "2" },
    ],
    testList: [],
  });

  const [payload, setPayload] = useState({
    doctor: "",
    department: "",
    shareType: "",
    item: "",
    isActive: "",
    mode: "doctor",
  });

  const [selectAll, setSelectAll] = useState(false);

  // ---- handlers ----
  const handleReactChange = (name, e) => {
    setPayload((prev) => ({ ...prev, [name]: e?.value }));
  };

  const handleCheckboxChange = (index) => {
    const updated = [...doctorShareData];
    updated[index].checked = !updated[index].checked;
    setDoctorShareData(updated);
    setSelectAll(updated.every((row) => row.checked));
  };

  const handleSelectAll = () => {
    const newValue = !selectAll;
    const updated = doctorShareData.map((row) => ({
      ...row,
      checked: newValue,
    }));
    setDoctorShareData(updated);
    setSelectAll(newValue);
  };

  // when user selects ShareType from dropdown
  const handleShareTypeChange = (index, selected) => {
    console.log("index, selected:::", index, selected);
    const updated = [...doctorShareData];
    updated[index].ShareType = selected ? selected.value : "";
    if (!selected) updated[index].ShareValue = 0;
    setDoctorShareData(updated);
  };
  const handleCalculationType = (index, selected) => {
    console.log("index, selected:::", index, selected);
    const updated = [...doctorShareData];
    updated[index].CalculationBasis = selected ? selected.value : "";
    if (!selected) updated[index].CalculationBasis = 0;
    setDoctorShareData(updated);
  };

  // when user edits ShareValue input
  const handleShareValueChange = (index, val) => {
    const updated = [...doctorShareData];
    if (val === "" || Number(val) >= 0) {
      updated[index].ShareValue = val;
    }
    setDoctorShareData(updated);
  };

  // ---- table headers ----
  const tableHeaders = [
    { header: "S.No", field: "SrNo", width: "4%" },
    { header: "Department", field: "Department", width: "12%" },
    { header: "Item Name", field: "TestName", width: "18%" },
    { header: "Share Type", field: "ShareType", width: "12%" },
    { header: "Share Value", field: "ShareValue", width: "12%" },
    { header: "Calculation", field: "calculationType", width: "8%" },
    { header: "Last Updated By", field: "CreatedByName", width: "10%" },
    { header: "Last Updated On", field: "dtEntry", width: "10%" },
    {
      header: (
        <input type="checkbox" checked={selectAll} onChange={handleSelectAll} />
      ),
      field: "checkbox",
      width: "5%",
    },
    { header: "Log", field: "log", width: "5%" },
  ];

  // ---- modal handlers ----
  const handleSetModalVisible = (visible) => {
    console.log(visible);
    dispatch(setModalOpen(visible));
    if (!visible) {
      dispatch(setModalData(null));
    }
  };

  const handleImportModal = (visible) => {
    dispatch(setInHouseModal(visible));
  };

  const handleOpenView = (row) => {
    console.log({row});
    dispatch(setModalOpen(true));
    dispatch(setModalData(row));
  };

  // ---- api call ----
  const getDepartmentById = async () => {
    try {
      dispatch(setLoading(true));

      const [doctorRes, departmentRes, testRes] = await Promise.all([
        axiosInstance.post(apiUrls?.Fetchprocedure, {
          typeName: "inHouse_Doctorsanddepartment",
          params: ["Doctor"],
        }),
        axiosInstance.post(apiUrls?.Fetchprocedure, {
          typeName: "inHouse_Doctorsanddepartment",
          params: ["Department"],
        }),
        await axiosInstance.get(apiUrls.BindInvestigationList),
      ]);

      const doctorListRes =
        doctorRes?.data?.data?.map((item) => ({
          label: item?.EmployeeName,
          value: item?.EmployeeID,
        })) || [];

      const departmentListRes =
        departmentRes?.data?.data?.map((item) => ({
          label: item?.Department,
          value: item?.DepartmentID,
        })) || [];

      const TesttListRes =
        testRes?.data?.message?.map((item) => ({
          ...item,
          label: item?.TestName,
          value: String(item?.InvestigationID),
        })) || [];

      setDropdownList((prev) => ({
        ...prev,
        doctorList: doctorListRes,
        departmentList: departmentListRes,
        testList: TesttListRes,
      }));
    } catch (error) {
      console.error("Error fetching doctors/departments:", error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const getDoctorShare = async () => {
    try {
      dispatch(setLoading(true));
      const getPayload = {
        type: "MainTable",
        departmentID: Number(payload?.department) || 0,
        employeeID: Number(payload?.doctor) || 0,
        itemID: 0,
      };
      const res = await axiosInstance.post(
        apiUrls.BindInHouserDoctorData,
        getPayload
      );
      if (!Array.isArray(res?.data?.data)) {
        notify(res?.data?.message, "success");
        return;
      }
      const rows =
        res?.data?.data?.map((r) => ({ ...r, checked: false })) || [];
      setDoctorShareData(rows);
    } catch (err) {
      console.log(err);
      notify(err?.response?.data?.message, "error");
    } finally {
      dispatch(setLoading(false));
    }
  };

  const saveDocShare = async () => {
    try {
      dispatch(setLoading(true));
      const savePayload = doctorShareData.filter((r) => r.checked); // only selected
       if (!payload?.shareType) {
          notify("Kindly select Type", 'warn');
          return;
        }
      if(!payload?.doctor){
        notify("Kindly select Doctor", "warn");
        return;
      }
      if(!payload?.department){
        notify("Kindly select Department", "warn");
        return;
      }
      if(payload?.shareType ==='2' && !payload?.item){
        notify("Kindly select Item", "warn");
        return;
      }

       if (!savePayload?.length) {
        notify("No row updated in table.", "warn");
        return;
      }

      let modifiedPyaloadList = savePayload?.map((item, _) => {
        
        return {
          employeeID: Number(payload?.doctor),
          departmentID: Number(payload?.department),
          itemID:
            payload?.shareType === "2"
              ? Number(payload?.item)
              : 0,
          shareType: item?.ShareType,
          shareValue: Number(item?.ShareValue),
          calculationBasis: item?.CalculationBasis,
        };
      });
      console.log("savePayload::", modifiedPyaloadList);
      // return
      const res = await axiosInstance.post(apiUrls.SaveEmployeeDocShare, {
        data: modifiedPyaloadList,
      });
      console.log("SaveEmployeeDocShare::", res?.data?.message);
      notify(res?.data?.message, "success");
      getDoctorShare()
    } catch (err) {
      console.log(err);
      notify(err?.response?.data?.message, "error");
    } finally {
      dispatch(setLoading(false));
    }
  };

  console.log("doctorShareData>>::", doctorShareData);

  useEffect(() => {
    getDepartmentById();
    // getDoctorShare();
  }, []);

  console.log("payload:::", payload);

  return (
    <>
      {showMore && <InHouseMenuList />}
      <Heading
        title={"InHouse Doctor Sharing"}
        secondTitle={
          <label onClick={() => setShowMore((prev) => !prev)}>
            {/* <ViewMenu /> */}
          </label>
        }
      />
      <div className="InHouseDoctor_main card p-2">
        <div className="d-flex align-items-center mb-2">
          <RadioInput
            inputType="radio"
            className="mb-0"
            label="Doctor wise"
            id="doctor"
            name="mode"
            value="doctor"
            checked={payload.mode === "doctor"}
            onChange={(e) =>
              setPayload((prev) => ({ ...prev, mode: e.target.value }))
            }
          />
          <RadioInput
            inputType="radio"
            className="mb-0"
            label="Item wise"
            id="item"
            name="mode"
            value="item"
            checked={payload.mode === "item"}
            onChange={(e) =>
              setPayload((prev) => ({ ...prev, mode: e.target.value }))
            }
          />
        </div>

        <div className="row mb-3">
          <div className="col-sm-3 col-md-2">
            <ReactSelect
              dynamicOptions={dropdownlist?.shareTypeList}
              name="shareType"
              isShowBorder={true}
              lable={t("Type")}
              id="shareType"
              removeIsClearable={false}
              placeholderName={t("Type")}
              value={payload?.shareType}
              onChange={handleReactChange}
              className="required-fields"
            />
          </div>
          <div className="col-sm-3 col-md-2">
            <ReactSelect
              dynamicOptions={dropdownlist?.doctorList}
              name="doctor"
              isShowBorder={true}
              lable={t("Doctor")}
              id="doctor"
              removeIsClearable={false}
              placeholderName={t("Doctor")}
              value={payload?.doctor}
              onChange={handleReactChange}
              className="required-fields"
            />
          </div>
          <div className="col-sm-3 col-md-2">
            <ReactSelect
              dynamicOptions={dropdownlist?.departmentList}
              isShowBorder={true}
              name="department"
              lable={t("Department")}
              id="department"
              removeIsClearable={false}
              placeholderName={t("Department")}
              value={payload?.department}
              onChange={handleReactChange}
              className="required-fields"
            />
          </div>
          {payload?.shareType === "2" && (
            <div className="col-sm-3 col-md-2">
              <ReactSelect
                dynamicOptions={dropdownlist?.testList}
                isShowBorder={true}
                name="item"
                lable={t("Item")}
                id="item"
                removeIsClearable={false}
                placeholderName={t("Item")}
                value={payload?.item}
                onChange={handleReactChange}
                className="required-fields"
              />
            </div>
          )}
          <Button className="px-3 rounded" onClick={getDoctorShare}>
            Search
          </Button>
          <Button
            className="px-1 mx-2 rounded mb-2 col-md-1 col-2"
            onClick={saveDocShare}
          >
            Save
          </Button>
          <div className="col-sm-2 col-md-1 d-flex justify-content-end">
            <Button
              onClick={() => handleImportModal(true)}
              className="mx-2 rounded mb-2 col-md-12 col-2 px-4"
            >
              Import File
            </Button>
          </div>
        </div>

        <Heading title={"InHouse Doctor Share Table"} />
        <div className="mb-4 inhouseTable">
          <CustomTable
            columns={tableHeaders}
            data={doctorShareData.map((row, index) => ({
              ...row,
              SrNo: index + 1,
              CreatedByName: row?.CreatedByName || '-',

              checkbox: (
                <input
                  type="checkbox"
                  checked={row.checked}
                  onChange={() => handleCheckboxChange(index)}
                /> ||
                ""
              ),
              ShareType: (
                <ReactSelect
                  dynamicOptions={[
                    { label: "Percentage", value: "Percentage" },
                    { label: "Rupees", value: "Amount" },
                  ]}
                  value={
                    row.ShareType
                      ? [
                          { label: "Percentage", value: "Percentage" },
                          { label: "Rupees", value: "Amount" },
                        ].find((opt) => opt.value === row.ShareType)?.value
                      : null
                  }
                  onChange={(_, selected) =>
                    handleShareTypeChange(index, selected)
                  }
                  isDisabled={!row.checked}
                /> 
              ),
              ShareValue: (
                <Input
                  type="number"
                  value={row.ShareValue}
                  onChange={(e) =>
                    handleShareValueChange(index, e.target.value)
                  }
                  disabled={!row.checked || !row.ShareType}
                  placeholder={row.ShareType === "Percentage" ? "%" : "₹"}
                />
                // ""
              ),
              calculationType: (
                <ReactSelect
                  dynamicOptions={[
                    { label: "Gross", value: "Gross" },
                    { label: "Net", value: "Net" },
                  ]}
                  value={
                    row.CalculationBasis
                      ? [
                          { label: "Gross", value: "Gross" },
                          { label: "Net", value: "Net" },
                        ].find((opt) => opt.value === row.CalculationBasis)
                          ?.value
                      : null
                  }
                  onChange={(_, selected) =>
                    handleCalculationType(index, selected)
                  }
                  isDisabled={!row.checked}
                />
                // ""
              ),
              log: (
                <FaEye
                  onClick={() => handleOpenView(row)}
                  className="view_class pointer-cursor"
                />
              ),
            }))}
          />
        </div>
      </div>

      <Modal
        Header={"Log"}
        setVisible={handleSetModalVisible}
        visible={modalOpen}
        children={<DoctorLogModal />}
        modalWidth={"60%"}
      />
      <Modal
        Header={"Import Doctor Sharing"}
        setVisible={handleImportModal}
        visible={InHouseModal}
        children={<ImportInHouseDoctorModal />}
        modalWidth={"60%"}
      />
    </>
  );
};

export default DoctorShareItemWise;
