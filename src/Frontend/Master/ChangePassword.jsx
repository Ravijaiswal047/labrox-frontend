import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { axiosInstance } from "../../utils/axiosInstance";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Heading from "../../components/UI/Heading";
import Accordion from "@app/components/UI/Accordion";
import Input from "../../components/formComponent/Input";
import Loading from "../../components/loader/Loading";
import { SaveButton } from "../../components/UI/CustomButton";
import { useLocation } from "react-router-dom";
import { FaLock, FaUserShield, FaKey, FaCheckCircle } from "react-icons/fa";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";

const ChangePassword = () => {
  const [state, setState] = useState({
    UserType: "",
    UserName: "",
    OldPassword: "",
    NewPassword: "",
    ConfirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [load, setLoad] = useState(false);

  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ FIX - URL param se bhi firstLogin detect karo
  const searchParams = new URLSearchParams(location.search);
  const isFirstLogin =
    location.state?.isFirstLogin ||
    searchParams.get("firstLogin") === "true";

  const hideMenu = location.state?.hideMenu || isFirstLogin;

  const userData = useLocalStorage("userData", "get");

  const handleLogout = () => {
    axiosInstance
      .post("Users/logout", { Username: userData.Username })
      .then(() => {
        const hiddenCols = window.localStorage.getItem("ResultEntryTable_HiddenCols");
        const hiddenColsCulture = window.localStorage.getItem("ResultCultureTable_HiddenCols");
        const hiddenColsAllergy = window.localStorage.getItem("ResultAllergyTable_HiddenCols");
        const hiddenColsHistoCyto = window.localStorage.getItem("HistoCytoTable_HiddenCols");
        const hiddenColsReceiptReprint = window.localStorage.getItem("ReceiptReprintTable_HiddenCols");
        const hiddenColsDispatch = window.localStorage.getItem("DispatchReportTable_HiddenCols");
        window.localStorage.clear();
        if (hiddenCols) {
          window.localStorage.setItem("ResultEntryTable_HiddenCols", hiddenCols);
        }
        if (hiddenColsCulture) {
          window.localStorage.setItem("ResultCultureTable_HiddenCols", hiddenColsCulture);
        }
        if (hiddenColsAllergy) {
          window.localStorage.setItem("ResultAllergyTable_HiddenCols", hiddenColsAllergy);
        }
        if (hiddenColsHistoCyto) {
          window.localStorage.setItem("HistoCytoTable_HiddenCols", hiddenColsHistoCyto);
        }
        if (hiddenColsReceiptReprint) {
          window.localStorage.setItem("ReceiptReprintTable_HiddenCols", hiddenColsReceiptReprint);
        }
        if (hiddenColsDispatch) {
          window.localStorage.setItem("DispatchReportTable_HiddenCols", hiddenColsDispatch);
        }
        navigate("/login");
        toast.success("Password changed! Please login with new password.");
      })
      .catch((err) => {
        // Logout fail hone pe bhi login page pe bhejo
        const hiddenCols = window.localStorage.getItem("ResultEntryTable_HiddenCols");
        const hiddenColsCulture = window.localStorage.getItem("ResultCultureTable_HiddenCols");
        const hiddenColsAllergy = window.localStorage.getItem("ResultAllergyTable_HiddenCols");
        const hiddenColsHistoCyto = window.localStorage.getItem("HistoCytoTable_HiddenCols");
        const hiddenColsReceiptReprint = window.localStorage.getItem("ReceiptReprintTable_HiddenCols");
        const hiddenColsDispatch = window.localStorage.getItem("DispatchReportTable_HiddenCols");
        window.localStorage.clear();
        if (hiddenCols) {
          window.localStorage.setItem("ResultEntryTable_HiddenCols", hiddenCols);
        }
        if (hiddenColsCulture) {
          window.localStorage.setItem("ResultCultureTable_HiddenCols", hiddenColsCulture);
        }
        if (hiddenColsAllergy) {
          window.localStorage.setItem("ResultAllergyTable_HiddenCols", hiddenColsAllergy);
        }
        if (hiddenColsHistoCyto) {
          window.localStorage.setItem("HistoCytoTable_HiddenCols", hiddenColsHistoCyto);
        }
        if (hiddenColsReceiptReprint) {
          window.localStorage.setItem("ReceiptReprintTable_HiddenCols", hiddenColsReceiptReprint);
        }
        if (hiddenColsDispatch) {
          window.localStorage.setItem("DispatchReportTable_HiddenCols", hiddenColsDispatch);
        }
        navigate("/login");
      });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!state.OldPassword) {
      newErrors.OldPassword = "Old password is required.";
    }

    if (!state.NewPassword) {
      newErrors.NewPassword = "New password is required.";
    } else if (state.NewPassword.length < 6) {
      newErrors.NewPassword = "New password must be at least 6 characters long.";
    }

    if (state.ConfirmPassword !== state.NewPassword) {
      newErrors.ConfirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoad(true);
    axiosInstance
      .post("changePassword/changeUserPassword", {
        UserType: state.UserType,
        UserName: state.UserName,
        OldPassword: state.OldPassword,
        NewPassword: state.NewPassword,
        ConfirmPassword: state.ConfirmPassword,
      })
      .then((res) => {
        if (res?.data?.success) {
          toast.success(res?.data?.message);
          handleLogout();
        } else {
          toast.error(res?.data?.message);
        }
        setLoad(false);
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Error Occurred");
        setLoad(false);
      });
  };

  const fetchDetail = () => {
    axiosInstance
      .get("changePassword/getUserDetail")
      .then((res) => {
        const data = res?.data?.message[0];
        setState((prev) => ({
          ...prev,
          UserType: data?.UserTypeName,
          UserName: data?.Username,
        }));
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Error Occurred");
      });
  };

  useEffect(() => {
    fetchDetail();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Grid layout for first login
  const renderGridLayout = () => {
    return (
      <div className="change-password-grid-container">
        <div className="change-password-header">
          <FaUserShield className="header-icon" />
          <h2>{t("Change Your Password")}</h2>
          <p>{t("Please update your password to continue")}</p>
        </div>

        <form onSubmit={handleSubmit} className="grid-form">
          <div className="grid-row">
            <div className="grid-card">
              <div className="card-icon">
                <FaUserShield />
              </div>
              <Input
                name="UserType"
                id="UserType"
                lable="User Type"
                placeholder=""
                disabled={true}
                max={30}
                value={state?.UserType}
              />
            </div>

            <div className="grid-card">
              <div className="card-icon">
                <FaUserShield />
              </div>
              <Input
                name="UserName"
                id="UserName"
                lable="User Name"
                placeholder=""
                disabled={true}
                max={30}
                value={state?.UserName}
              />
            </div>
          </div>

          <div className="grid-row">
            <div className="grid-card">
              <div className="card-icon">
                <FaLock />
              </div>
              <Input
                lable="Old Password"
                id="OldPassword"
                placeholder=""
                type="password"
                max={30}
                name="OldPassword"
                className="required-fields"
                onChange={handleChange}
                value={state?.OldPassword}
              />
              {errors?.OldPassword && (
                <div className="error-message">{errors?.OldPassword}</div>
              )}
            </div>

            <div className="grid-card">
              <div className="card-icon">
                <FaKey />
              </div>
              <Input
                lable="New Password"
                id="NewPassword"
                placeholder=""
                className="required-fields"
                type="password"
                max={30}
                onChange={handleChange}
                name="NewPassword"
                value={state?.NewPassword}
              />
              {errors?.NewPassword && (
                <div className="error-message">{errors?.NewPassword}</div>
              )}
            </div>

            <div className="grid-card">
              <div className="card-icon">
                <FaCheckCircle />
              </div>
              <Input
                lable="Confirm Password"
                id="ConfirmPassword"
                placeholder=""
                className="required-fields"
                type="password"
                max={30}
                onChange={handleChange}
                name="ConfirmPassword"
                value={state?.ConfirmPassword}
              />
              {errors?.ConfirmPassword && (
                <div className="error-message">{errors?.ConfirmPassword}</div>
              )}
            </div>
          </div>

          <div className="grid-submit">
            {load ? (
              <Loading />
            ) : (
              <SaveButton text={"Change Password"} type="submit" />
            )}
          </div>
        </form>

        <style jsx>{`
          .change-password-grid-container {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: #374151;
            padding: 2rem;
          }
          .change-password-header {
            text-align: center;
            color: white;
            margin-bottom: 3rem;
          }
          .header-icon {
            font-size: 4rem;
            margin-bottom: 1rem;
            animation: pulse 2s infinite;
          }
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
          .change-password-header h2 {
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
            font-weight: 600;
          }
          .change-password-header p {
            font-size: 1.1rem;
            opacity: 0.9;
          }
          .grid-form {
            background: white;
            border-radius: 20px;
            padding: 3rem;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            max-width: 1000px;
            width: 100%;
          }
          .grid-row {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 2rem;
            margin-bottom: 2rem;
          }
          .grid-card {
            background: #f8f9fa;
            border-radius: 15px;
            padding: 2rem;
            text-align: center;
            transition: all 0.3s ease;
            border: 2px solid transparent;
          }
          .grid-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            border-color: #667eea;
          }
          .card-icon {
            font-size: 3rem;
            color: #667eea;
            margin-bottom: 1rem;
          }
          .grid-submit {
            text-align: center;
            margin-top: 2rem;
          }
          .grid-submit button {
            padding: 1rem 3rem;
            font-size: 1.1rem;
            border-radius: 50px;
          }
          .error-message {
            color: #dc3545;
            font-size: 0.875rem;
            margin-top: 0.5rem;
            text-align: left;
          }
          @media (max-width: 768px) {
            .grid-form { padding: 2rem 1.5rem; }
            .change-password-header h2 { font-size: 2rem; }
            .grid-row { grid-template-columns: 1fr; }
          }
        `}</style>
      </div>
    );
  };

  // Normal accordion layout
  const renderNormalLayout = () => {
    return (
      <Accordion
        name={t("Change Password")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <form onSubmit={handleSubmit}>
          <div className="row pt-2 pl-2 pr-2 pb-2">
            <div className="col-sm-2 mb-1 mb-sm-0">
              <Input
                name="UserType"
                id="UserType"
                lable="User Type"
                placeholder=""
                disabled={true}
                max={30}
                value={state?.UserType}
              />
            </div>
            <div className="col-sm-2 mb-1 mb-sm-0">
              <Input
                name="UserName"
                id="UserName"
                lable="User Name"
                placeholder=""
                disabled={true}
                max={30}
                value={state?.UserName}
              />
            </div>
            <div className="col-sm-2 mb-1 mb-sm-0">
              <Input
                lable="Old Password"
                id="OldPassword"
                placeholder=""
                type="password"
                max={30}
                name="OldPassword"
                className="required-fields"
                onChange={handleChange}
                value={state?.OldPassword}
              />
              {errors?.OldPassword && (
                <div className="error-message">{errors?.OldPassword}</div>
              )}
            </div>
            <div className="col-sm-2 mb-1 mb-sm-0">
              <Input
                lable="New Password"
                id="NewPassword"
                placeholder=""
                className="required-fields"
                type="password"
                max={30}
                onChange={handleChange}
                name="NewPassword"
                value={state?.NewPassword}
              />
              {errors?.NewPassword && (
                <div className="error-message">{errors?.NewPassword}</div>
              )}
            </div>
            <div className="col-sm-2 mb-1 mb-sm-0">
              <Input
                lable="Confirm Password"
                id="ConfirmPassword"
                placeholder=""
                className="required-fields"
                type="password"
                max={30}
                onChange={handleChange}
                name="ConfirmPassword"
                value={state?.ConfirmPassword}
              />
              {errors?.ConfirmPassword && (
                <div className="error-message">{errors?.ConfirmPassword}</div>
              )}
            </div>
            <div className="col-sm-1">
              {load ? <Loading /> : <SaveButton text={"Save"} type="submit" />}
            </div>
          </div>
        </form>
      </Accordion>
    );
  };

  return (
    <div>
      {hideMenu || isFirstLogin ? renderGridLayout() : renderNormalLayout()}
    </div>
  );
};

export default ChangePassword;