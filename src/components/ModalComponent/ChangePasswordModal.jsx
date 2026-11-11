import React, { useState, useEffect } from "react";

import { toast } from "react-toastify";
import Modal from "./Modal";
import Loading from "../../components/loader/Loading";

import { axiosInstance } from "../../utils/axiosInstance";
import Input from "../formComponent/Input";
import { SaveButton } from "../UI/CustomButton";

const ChangePasswordModal = ({ visible, setVisible }) => {
  const [state, setState] = useState({
    OldPassword: "",
    NewPassword: "",
    ConfirmPassword: "",
    UserType: "",
    UserName: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (visible) {
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
          console.error("Error fetching user details", err);
        });
    }
  }, [visible]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setState((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    let err = {};
    if (!state.OldPassword) err.OldPassword = "Old Password is required";
    if (!state.NewPassword) err.NewPassword = "New Password is required";
    else if (state.NewPassword.length < 6)
      err.NewPassword = "Minimum 6 characters required";
    if (state.ConfirmPassword !== state.NewPassword)
      err.ConfirmPassword = "Passwords do not match";

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    axiosInstance
      .post("changePassword/changeUserPassword", {
        UserType: state.UserType,
        UserName: state.UserName,
        OldPassword: state.OldPassword,
        NewPassword: state.NewPassword,
        ConfirmPassword: state.ConfirmPassword,
      })
      .then((res) => {
        if (res.data?.success) {
          toast.success(res.data?.message || "Password changed successfully");
          setVisible(false);
          // Optional: Logout or redirect
          setTimeout(() => {
             window.localStorage.clear();
             window.location.href = "/login";
          }, 1000);
        } else {
          toast.error(res.data?.message || "Failed to change password");
        }
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Error occurred");
      })
      .finally(() => setLoading(false));
  };

  return (
    <Modal
      visible={visible}
      setVisible={setVisible}
      Header="Change Password Required"
      modalWidth="400px"
    >
      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-12 mb-3">
            <Input
              lable="Old Password"
              id="OldPassword"
              name="OldPassword"
              type="password"
              value={state.OldPassword}
              onChange={handleChange}
              className="required-fields"
            />
            {errors.OldPassword && (
              <small className="text-danger">{errors.OldPassword}</small>
            )}
          </div>
          <div className="col-12 mb-3">
            <Input
              lable="New Password"
              id="NewPassword"
              name="NewPassword"
              type="password"
              value={state.NewPassword}
              onChange={handleChange}
              className="required-fields"
            />
            {errors.NewPassword && (
              <small className="text-danger">{errors.NewPassword}</small>
            )}
          </div>
          <div className="col-12 mb-3">
            <Input
              lable="Confirm Password"
              id="ConfirmPassword"
              name="ConfirmPassword"
              type="password"
              value={state.ConfirmPassword}
              onChange={handleChange}
              className="required-fields"
            />
            {errors.ConfirmPassword && (
              <small className="text-danger">{errors.ConfirmPassword}</small>
            )}
          </div>
          <div className="col-12 text-center mt-2">
            {loading ? (
              <Loading />
            ) : (
              <SaveButton text="Update Password" type="submit" />
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default ChangePasswordModal;
