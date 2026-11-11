import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { axiosInstance } from "../utils/axiosInstance";

const NotificationContent = ({ setNotification }) => {
  const [message, setMessage] = useState("");
  const getRazorPayDetails = () => {
    axiosInstance
      .get("RazorPay/payment")
      .then((res) => {
        if (res?.data?.success && res?.data?.message?.amount > 0) {
          SetMessage(res?.data?.message?.dueDate);
        } else {
          setMessage("");
          setNotification(false);
        }
      })
      .catch((err) =>
        toast.error(
          err?.data?.response?.message
            ? err?.data?.response?.message
            : "Error Occur",
        ),
      );
  };
  const SetMessage = (dueDate) => {
    if (dueDate == "") {
      setMessage("");
      setNotification(false);
    }
    const current = new Date();
    const due = new Date(dueDate);
    const timeDifference = due - current;
    const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
    if (daysDifference > 7 && daysDifference <= 15) {
      setNotification(true);
      setMessage("Your account will be locked on " + dueDate);
    }
    if (daysDifference <= 7 && daysDifference > 1) {
      setNotification(true);
      setMessage("Your account will be locked on " + dueDate);
    }
    if (daysDifference <= 1 && daysDifference > 0) {
      const interval = setInterval(() => {
        const now = new Date();
        const remainingTime = due - now;
        if (remainingTime <= 0) {
          clearInterval(interval);
          setMessage("Your account has been locked");
        } else {
          const hours = Math.floor((remainingTime / (1000 * 60 * 60)) % 24);
          const minutes = Math.floor((remainingTime / 1000 / 60) % 60);
          const seconds = Math.floor((remainingTime / 1000) % 60);
          setMessage(
            `Your account will be locked in ${hours}H: ${minutes}M: ${seconds}S`,
          );
        }
      }, 1000);
      setNotification(true);
    }
    if (daysDifference <= 0) {
      setMessage(
        "Your account is locked. Please clear your payment to proceed",
      );
      setNotification(true);
    }
    if (daysDifference > 15) {
      setMessage("");
      setNotification(false);
    }
  };
  useEffect(() => {
    getRazorPayDetails();
  }, []);

  return <div style={{ color: "red" }}>{message}</div>;
};

export default NotificationContent;
