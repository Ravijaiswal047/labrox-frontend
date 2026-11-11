import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useFormik } from "formik";
import { toast } from "react-toastify";
import { number } from "../../utils/helpers";
import { axiosInstance } from "../../utils/axiosInstance";
import Input from "../../components/formComponent/Input";
import { Dialog } from "primereact/dialog";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { setRefDoctorModalData } from "../../store/reducers/loadingSlice/loadingSlice";
import { useDispatch } from "react-redux";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { getSearchController } from "../../utils/NetworkApi/commonApi";
import { usePageControls } from "../../utils/hooks/usePageControls";
import { useLocation } from "react-router-dom";


const initialValues = {
  Name: "",
  Mobile: "",
  Department: "",
  Specialization: "",
  Remarks: "",
  DepartmentID: 0,
  SpecializationID: 0,
  Notification: "",
  ProEmployee: "",
  ProEmployeeNumber: "",
};

const PatientRegisterModal = ({ show, handleClose, Type, onSuccess }) => {
  const dispatch = useDispatch()
  const { values, errors, handleChange, touched, handleSubmit, setFieldValue } = useFormik({
    initialValues: initialValues,
    onSubmit: (values, { resetForm }) => {
      const DepartmentNames = DoctorDepartment.find(d => d.value === values.Department)?.label;
      const SpecializationNames = Specialization.find(s => s.value === values.Specialization)?.label;
      const Url =
        // Type == "Secondary"
        //   ? "DoctorReferal/InsertSecondDoctorReferal"
        //   : 
        "DoctorReferal/InsertDoctorReferal";
      axiosInstance
        .post(Url, {
          Name: values?.Name,
          Mobile: values?.Mobile == "" ? 0 : values?.Mobile,
          Remarks: values?.Remarks,
          Department: DepartmentNames,
          DepartmentID: values?.Department || 0,
          Specialization: SpecializationNames,
          SpecializationID: values?.Specialization || 0,
          Notification: values?.Notification,
          ProEmployeeID: values?.ProEmployee || 0,
        })
        .then((res) => {
          if (res?.data?.success === true || res?.data?.success === "true") {
            toast.success(res?.data?.message || "Data saved successfully.");
            const selectedDept = DoctorDepartment.find(d => String(d.value) === String(values.Department))?.label;
            const selectedSpec = Specialization.find(s => String(s.value) === String(values.Specialization))?.label;

            const selectedProEmployee = ProEmployeeOptions.find(
              (p) => String(p.value) === String(values.ProEmployee)
            )?.label;

            const resultData = {
              ...(res?.data?.data || {}),
              Name: values.Name,
              Mobile: values.Mobile,
              Department: selectedDept,
              Specialization: selectedSpec,
              ProEmployee: selectedProEmployee,
              ProEmployeeID: values.ProEmployee || 0,
              ProEmployeeNumber: values.ProEmployeeNumber,
              Type: Type,
            };

            dispatch(setRefDoctorModalData(resultData));

            if (onSuccess) {
              onSuccess();
            }
            handleClose();
            resetForm();
          } else {
            toast.error(res?.data?.message || "Something went wrong.");
          }
        })
        .catch((err) => console.log(err));
    },
  });
  const pathname = useLocation()?.pathname;
  const { isActive } = usePageControls(pathname);
  const [moreErrors, setMoreErrors] = useState({});
  const [tabbingOrder, setTabbingOrder] = useState([]);
  const [controllerDynamicList, setControllerDynamicList] = useState([]);
  const isMobile = window.innerWidth <= 768;

  const isHideController = (cntrId = "") => {
    if (!controllerDynamicList?.length) return true;
    const isPresent = controllerDynamicList?.find(
      (x) => x?.ControlDisplayID === cntrId
    );
    if (isPresent?.ControlDisplayID) {
      return !!controllerDynamicList?.find(
        (x) => x?.ControlDisplayID === cntrId
      )?.IsShow;
    }
    return true;
  };

  const controllerDynamic = async () => {
    let pageID = 962;
    const { controllersData, controllerTabbingOrder } =
      await getSearchController(pageID);
    setTabbingOrder(controllerTabbingOrder);
    setControllerDynamicList(controllersData);
  };

  useEffect(() => {
    controllerDynamic()
  }, [])


  const handleReactSelectChange = (name, e) => {
    setFieldValue(name, e ? e.value : "");
  };

  const getMappingGlobalData = (state, name) => {
    axiosInstance
      .post("Global/GetGlobalData", {
        Type: name,
      })
      .then((res) => {
        let data = res.data.message;
        let SampleContainer = data.map((ele) => {
          return {
            value: ele.FieldID,
            label: ele.FieldDisplay,
          };
        });
        return state(SampleContainer);
      })
      .catch((err) => console.log(err));
  };
  const { t } = useTranslation();
  const theme = useLocalStorage("theme", "get");
  const [DoctorDepartment, setDoctorDepartment] = useState([]);
  const [Specialization, setSpecialization] = useState([]);
  const [ProEmployeeOptions, setProEmployeeOptions] = useState([]);
  useEffect(() => {
    getMappingGlobalData(setDoctorDepartment, "DoctorDepartment")
    getMappingGlobalData(setSpecialization, "Specialization")
    getProEmployee();
  }, [])

  const getProEmployee = () => {
    axiosInstance
      .get("Employee/ProEmployee")
      .then((res) => {
        const data = res?.data?.message || [];
        const mapped = data.map((ele) => ({
          value: ele?.EmployeeID,
          label: ele?.EmployeeName,
          mobile: ele?.Mobile || "",
        }));
        setProEmployeeOptions(mapped);
      })
      .catch((err) => console.log(err));
  };

  const handleProEmployeeChange = (name, e) => {
    setFieldValue(name, e ? e.value : "");
    setFieldValue("ProEmployeeNumber", e ? e.mobile || "" : "");
  };
  return (
    <>
      <Dialog
        visible={show}
        header={t(`${Type} Doctor`)}
        onHide={handleClose}
        top={"25%"}
        style={{
          width: isMobile ? "80vw" : "40vw",
        }}
        className={theme}
      >
        <div className="modal-card">
          <form onSubmit={handleSubmit} className="w-100">
            <div className="row">
              {controllerDynamicList
                ?.sort((a, b) => a.DisplayOrder - b.DisplayOrder)
                .map((item) => {
                  if (
                    item?.ControlDisplayID === "Doctor"
                    &&
                    isHideController("Doctor")
                    // && isActive("SelectTypes")
                  ) {
                    return (
                      <div className="col-sm-6" key={item.ControlDisplayID}>
                        <Input
                          lable={t("Doctor Name")}
                          placeholder=" "
                          type="text"
                          id="Doctor"
                          name="Name"
                          value={values.Name}
                          onChange={(e) => handleChange(e)}
                        />
                        {/* {errors?.Name && touched?.Name && (
                          <span className="error-message">{errors?.Name}</span>
                        )} */}
                      </div>
                    )
                  }
                  if (
                    item?.ControlDisplayID === "Mobile"
                    &&
                    isHideController("Mobile")
                    // && isActive("SelectTypes")
                  ) {
                    return (
                      <div className="col-sm-6" key={item.ControlDisplayID}>
                        <Input
                          id="MobileDoctor"
                          placeholder=" "
                          lable={t("Mobile No")}
                          type="number"
                          name="Mobile"
                          onInput={(e) => number(e, 10)}
                          value={values.Mobile}
                          onChange={handleChange}
                        // required
                        />
                        {/* {errors?.Mobile && touched?.Mobile && (
                          <span className="error-message">{errors?.Mobile}</span>
                        )} */}
                      </div>
                    )
                  }
                  if (
                    item?.ControlDisplayID === "Department"
                    &&
                    isHideController("Department")
                    // && isActive("SelectTypes")
                  ) {
                    return (
                      <div className="col-sm-6" key={item.ControlDisplayID}>
                        <ReactSelect
                          dynamicOptions={DoctorDepartment}
                          id="department"
                          placeholderName={t("Department")}
                          name="Department"
                          value={values.Department}
                          onChange={handleReactSelectChange}
                        />
                        {/* {errors?.Department && touched?.Department && (
                          <span className="error-message">{errors?.Department}</span>
                        )} */}
                      </div>
                    )
                  }
                  if (
                    item?.ControlDisplayID === "Specialization"
                    &&
                    isHideController("Specialization")
                    && isActive("Specialization")
                  ) {
                    return (
                      <div className="col-sm-6" key={item.ControlDisplayID}>
                        <ReactSelect
                          dynamicOptions={Specialization}
                          id="specialization"
                          placeholderName={t("Specialization")}
                          name="Specialization"
                          value={values.Specialization}
                          onChange={handleReactSelectChange}
                        />
                        {/* {errors?.Specialization && touched?.Specialization && (
                          <span className="error-message">{errors?.Specialization}</span>
                        )} */}
                      </div>
                    )
                  }
                  if (
                    item?.ControlDisplayID === "Remarks"
                    &&
                    isHideController("Remarks")
                    // && isActive("SelectTypes")
                  ) {
                    return (
                      <div className="col-sm-12" key={item.ControlDisplayID}>
                        <Input
                  lable={t("Remarks")}
                  placeholder=" "
                  type="text"
                  id="Notification"
                  name="Notification"
                  value={values.Notification}
                  onChange={handleChange}
                />
                        {/* {errors?.Name && touched?.Name && (
                          <span className="error-message">{errors?.Name}</span>
                        )} */}
                      </div>
                    )
                  }
                })}
              <div className="col-sm-6">
                <ReactSelect
                  dynamicOptions={ProEmployeeOptions}
                  id="proEmployee"
                  placeholderName={t("ProEmployee")}
                  name="ProEmployee"
                  value={values.ProEmployee}
                  onChange={handleProEmployeeChange}
                />
              </div>
              <div className="col-sm-6">
                <Input
                  lable={t("ProEmployee Number")}
                  placeholder=" "
                  type="text"
                  id="ProEmployeeNumber"
                  name="ProEmployeeNumber"
                  value={values.ProEmployeeNumber}
                  onChange={handleChange}
                  disabled
                />
              </div>
              <div className="col-sm-12">

              </div>
            </div>
          </form>
          <div className="row w-100">
            <div className="col-sm-6">
              <button
                type="submit"
                className="btn btn-success btn-block btn-sm"
                onClick={handleSubmit}
              >
                {t("Save")}
              </button>
            </div>
            <div className="col-sm-6">
              <button
                className="btn btn-danger btn-block btn-sm"
                onClick={handleClose}
              >
                {t("Close")}
              </button>
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default PatientRegisterModal;
//pageId:962