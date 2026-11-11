import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { axiosInstance } from "../../utils/axiosInstance";
import { useTranslation } from "react-i18next";
import Accordion from "@app/components/UI/Accordion";
import Input from "../../components/formComponent/Input";
import Loading from "../../components/loader/Loading";
import { GetAccessRightApproval } from "../../utils/NetworkApi/commonApi";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { apiUrls } from "../../utils/apiUrls";
import { SaveButton } from "../../components/UI/CustomButton";

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/;

const B2BChangeOtherEmployeePassword = () => {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    employeeID: "",
    NewPassword: "",
    ConfirmPassword: "",
    UserName: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  useEffect(() => {
    const getAccessRightApproval = async () => {
      try {
        const { data } = await axiosInstance.post(
          "Employee/getApprovalRightMaster",
        );
        if (data?.message) {
          const options = data.message.map((emp) => ({
            label: emp.NAME,
            value: emp.EmployeeID,
            userName: emp.UserName,
          }));
          setEmployees(options);
        }
      } catch (err) {
        console.error("Error fetching employees:", err);
      }
    };

    getAccessRightApproval();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, option) => {
    setForm((prev) => ({ ...prev, [name]: option?.value || "" }));

    if (name === "employeeID") {
      const selectedEmp = employees?.find(
        (item) => item?.value == option?.value,
      );
      setForm((prev) => ({
        ...prev,
        UserName: selectedEmp?.userName,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.employeeID) newErrors.employeeID = "Employee is required.";
    if (!form.NewPassword) newErrors.NewPassword = "New password is required.";
    else if (!passwordRegex.test(form.NewPassword))
      newErrors.NewPassword =
        "Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and one special case Character";
    if (form.ConfirmPassword !== form.NewPassword)
      newErrors.ConfirmPassword = "Passwords do not match.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.employeeID) {
      toast.error("Employee ID is required");
      return;
    }
    if (!form.NewPassword) {
      toast.error("Password is required");
      return;
    }
    if (!passwordRegex.test(form.NewPassword)) {
      toast.error(
        "Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and one special case Character"
      );
      return;
    }
    if (!form.ConfirmPassword) {
      toast.error("Confirm Password is required");
      return;
    }
    if (form.NewPassword !== form.ConfirmPassword) {
      toast.error("Password and Confirm Password must be same");
      return;
    }

    setLoading(true);
    try {
      const { data } = await axiosInstance.post(
        apiUrls?.changeUserPasswordEmployee,
        {
          employeeID: form.employeeID,
          NewPassword: form.NewPassword,
          ConfirmPassword: form.ConfirmPassword,
        },
      );

      if (data?.success) {
        toast.success(data.message || "Password changed successfully");
        setForm({ employeeID: "", NewPassword: "", ConfirmPassword: "" });
      } else {
        toast.error(data?.message || "Failed to change password");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error Occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Accordion
      name={t("Change Other Employee Password")}
      defaultValue={true}
      isBreadcrumb={true}
    >
      <form autoComplete="off" onSubmit={handleSubmit}>
        <div className="row pt-2 pl-2 pr-2 pb-2">
          <div className="col-sm-3">
            <ReactSelect
              dynamicOptions={employees}
              value={form.employeeID}
              onChange={handleSelectChange}
              name="employeeID"
              id="employeeID"
              placeholderName="Employee Name"
            />
            {errors.employeeID && (
              <div className="error-message">{errors.employeeID}</div>
            )}
          </div>
          <div className="col-sm-2 ">
            <Input
              type="text"
              id="UserName"
              className="required-fields"
              name="UserName"
              value={form.UserName}
              placeholder=""
              // onChange={handleChange}
              lable="UserName"
              disabled
            />
          </div>
          <div className="col-sm-3">
            <div className="position-relative">
              <Input
                lable="New Password"
                id="NewPassword"
                type={showPass ? "text" : "password"}
                name="NewPassword"
                value={form.NewPassword}
                onChange={handleChange}
                maxLength={30}
                className="required-fields"
                autocomplete="new-password"
              />{" "}
              <span
                onClick={() => setShowPass(!showPass)}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "60%",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                  zIndex: 10,
                }}
              >
                {showPass ? (
                  <i className="bi bi-eye-slash"></i>
                ) : (
                  <i className="bi bi-eye-fill"></i>
                )}
              </span>
            </div>
            {form.NewPassword && !passwordRegex.test(form.NewPassword) && (
              <span className="error-message">
                {t(
                  "Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and one special case Character"
                )}
              </span>
            )}
            {errors.NewPassword && (
              <div className="error-message">{errors.NewPassword}</div>
            )}
          </div>
          <div className="col-sm-3">
            <div className="position-relative">
              <Input
                lable="Confirm Password"
                id="ConfirmPassword"
                type={showConfirmPass ? "text" : "password"}
                name="ConfirmPassword"
                value={form.ConfirmPassword}
                onChange={handleChange}
                maxLength={30}
                className="required-fields"
                autocomplete="new-password"
              />{" "}
              <span
                onClick={() => setShowConfirmPass(!showConfirmPass)}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "60%",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                  zIndex: 10,
                }}
              >
                {showConfirmPass ? (
                  <i className="bi bi-eye-slash"></i>
                ) : (
                  <i className="bi bi-eye-fill"></i>
                )}
              </span>
            </div>
            {form.ConfirmPassword && !passwordRegex.test(form.ConfirmPassword) && (
              <span className="error-message">
                {t(
                  "Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and one special case Character"
                )}
              </span>
            )}
            {form.ConfirmPassword && passwordRegex.test(form.ConfirmPassword) && form.ConfirmPassword !== form.NewPassword && (
              <span className="error-message">
                {t("Passwords do not match.")}
              </span>
            )}
            {errors.ConfirmPassword && (
              <div className="error-message">{errors.ConfirmPassword}</div>
            )}
          </div>
          <div className="col-sm-2 d-flex align-items-center">
            {loading ? (
              <Loading />
            ) : (
              <SaveButton
                type="submit"
                text={"Save"}
              />
            )}
          </div>
        </div>
      </form>
    </Accordion>
  );
};

export default B2BChangeOtherEmployeePassword;
