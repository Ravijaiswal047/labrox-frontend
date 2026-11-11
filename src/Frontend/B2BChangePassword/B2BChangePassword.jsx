import { useTranslation } from "react-i18next";
import ReactSelect from "../../components/formComponent/ReactSelect";
import Accordion from "../../components/UI/Accordion";
import { useEffect, useState } from "react";
import { axiosInstance } from "../../utils/axiosInstance";
import { AddBlankData } from "../../utils/helpers";
import { toast } from "react-toastify";
import Input from "../../components/formComponent/Input";
import { EditButton } from "../../components/UI/CustomButton";

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/;

const B2BChangePassword = () => {
  const { t } = useTranslation();
  const [RateTypes, setRateTypes] = useState([]);
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [formData, setFormData] = useState({
    RateTypeID: "",
    UserName: "",
    Password: "",
    ConfirmPassword: "",
    isActive: 0,
    isLogin: 0,
    PasswordFor: "",
  });
  const [userDetail, setUserDetail] = useState([]);
  const [isRateTypeSelected, setIsRateTypeSelected] = useState(false);

  const fetchRateTypes = (centreIds = []) => {
    axiosInstance
      .post("/Centre/GetRateType", {
        centreId: centreIds,
      })
      .then((res) => {
        const list =
          res?.data?.message?.map((item) => ({
            label: item.RateTypeName,
            value: item.RateTypeID,
          })) || [];
        setRateTypes(list);
      })
      .catch((err) => console.error("Failed to fetch rate types", err));
  };

  useEffect(() => {
    fetchRateTypes([]);
  }, []);

  const getUserDetail = (rateTypeId) => {
    axiosInstance
      .get("changePassword/getUserDetailRateType", {
        params: {
          RateTypeID: rateTypeId,
        },
      })
      .then((res) => {
        const responseData = res?.data?.message;

        if (Array.isArray(responseData) && responseData.length > 0) {
          const user = responseData[0];

          setFormData((prev) => ({
            ...prev,
            UserName: user.username || "",
            isActive: user.isactive ?? 0,
            isLogin: user.islogin ?? 0,
          }));

          setUserDetail(responseData);
        } else {
          setFormData((prev) => ({
            ...prev,
            UserName: "",
            isActive: 0,
            isLogin: 0,
          }));
        }
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Something Went Wrong");

        setFormData((prev) => ({
          ...prev,
          UserName: "",
          isActive: 0,
          isLogin: 0,
        }));
      });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePasswordForChange = (name, selectedOption) => {
    const value = selectedOption?.value || "";
    setFormData({ ...formData, [name]: value });
  };

  const handleSearchSelectChange = (label, value) => {
    if (label === "RateTypeID") {
      const isSelected = !!value?.value;

      setIsRateTypeSelected(isSelected);

      if (isSelected) {
        setFormData((prev) => ({
          ...prev,
          RateTypeID: value.value,
          UserName: "",
          Password: "",
          ConfirmPassword: "",
        }));
        getUserDetail(value.value);
      } else {
        setFormData({
          RateTypeID: "",
          UserName: "",
          Password: "",
          ConfirmPassword: "",
          isActive: 0,
          isLogin: 0,
        });
        setUserDetail([]);
      }
    }
  };

  const handleToggle = (field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field] === 1 ? 0 : 1,
    }));
  };

  const handleUpdate = () => {
    const payload = {
      ratetypeID: String(formData.RateTypeID),
      isActive: String(formData.isActive),
      isLogin: String(formData.isLogin),
      newPassword: String(formData.Password),
      confirmPassword: String(formData.ConfirmPassword),
    };
    if (!formData?.Password) {
      toast.error("Password is required");
      return;
    }
    if (!passwordRegex.test(formData?.Password)) {
      toast.error(
        "Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and one special case Character"
      );
      return;
    }
    if (!formData?.ConfirmPassword) {
      toast.error("Confirm Password is required");
      return;
    }
    if (formData.Password !== formData.ConfirmPassword) {
      toast.error("Password and Confirm Password must be same");
      return;
    }
    axiosInstance
      .post("changePassword/changeUserPasswordRateType", payload)
      .then((res) => {
        toast.success(res?.data?.message || "Password updated successfully");
        setFormData((prev) => ({ ...prev, Password: "", ConfirmPassword: "" }));
        setIsRateTypeSelected(false);
        setFormData({
          RateTypeID: "",
        });
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message || "Failed to update password",
        );
      });
  };

  return (
    <div>
      <Accordion
        name={t("B2BChangePassword")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row pt-2 pl-2 pr-2">
          <div className="col-sm-2">
            <ReactSelect
              dynamicOptions={[
                { label: "Doctor", value: "Doctor" },
                { label: "RateType", value: "RateType" },
              ]}
              name="PasswordFor"
              lable={t("Password for")}
              id="RateType"
              removeIsClearable={true}
              placeholderName={t("Password for")}
              value={formData?.PasswordFor}
              onChange={handlePasswordForChange}
            />
          </div>

          <div className="col-sm-2">
            <ReactSelect
              dynamicOptions={AddBlankData(RateTypes, "All RateType")}
              name="RateTypeID"
              lable={t("RateType")}
              id="RateType"
              removeIsClearable={true}
              placeholderName={t("RateType")}
              value={formData.RateTypeID}
              onChange={handleSearchSelectChange}
            />
          </div>

          {isRateTypeSelected && (
            <>
              <div className="col-sm-2 ">
                <Input
                  type="text"
                  id="UserName"
                  className="required-fields"
                  name="UserName"
                  value={formData.UserName}
                  placeholder=""
                  onChange={handleChange}
                  lable="UserName"
                  disabled
                />
              </div>

              {/* Toggle */}
              <div className="col-auto d-flex p-2 align-items-center">
                <strong>
                  <span>{t("Is Active")}</span>
                </strong>
                <label className="switch ml-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive === 1}
                    onChange={() => handleToggle("isActive")}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              {/* Toggle - IsLogin */}
              <div className="col-auto d-flex p-2 align-items-center">
                <strong>
                  <span>{t("Is Login")}</span>
                </strong>
                <label className="switch ml-2">
                  <input
                    type="checkbox"
                    checked={formData.isLogin === 1}
                    onChange={() => handleToggle("isLogin")}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="col-sm-2">
                <div className="position-relative">
                  <form autoComplete="off">
                    <Input
                      type={showPass ? "text" : "password"}
                      id="Password"
                      className="required-fields"
                      name="Password"
                      value={formData?.Password}
                      placeholder=""
                      onChange={handleChange}
                      lable="New Password"
                      autoComplete="new-password"
                      required
                    />
                  </form>
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
                {formData?.Password && !passwordRegex.test(formData?.Password) && (
                  <span className="error-message">
                    {t(
                      "Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and one special case Character"
                    )}
                  </span>
                )}
              </div>

              <div className="col-sm-2">
                <div className="position-relative">
                  <form autoComplete="off">
                    <Input
                      type={showConfirmPass ? "text" : "password"}
                      id="ConfirmPassword"
                      className="required-fields"
                      name="ConfirmPassword"
                      value={formData?.ConfirmPassword}
                      placeholder=""
                      onChange={handleChange}
                      lable="Confirm Password"
                      autoComplete="confirm-password"
                    />
                  </form>
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
                {formData?.ConfirmPassword && !passwordRegex.test(formData?.ConfirmPassword) && (
                  <span className="error-message">
                    {t(
                      "Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and one special case Character"
                    )}
                  </span>
                )}
                {formData?.ConfirmPassword && passwordRegex.test(formData?.ConfirmPassword) && formData?.ConfirmPassword !== formData?.Password && (
                  <span className="error-message">
                    {t("Passwords do not match.")}
                  </span>
                )}
              </div>

              <div className="col-sm-1">
                <EditButton
                  text={"Update"}
                  onClick={handleUpdate}
                  disabled={!formData.UserName}
                />
              </div>
            </>
          )}
        </div>
      </Accordion>
    </div>
  );
};

export default B2BChangePassword;
