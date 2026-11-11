import React, { useEffect, useState } from "react";
import Img from "../../assets/image/Flat-Journalist.png";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";

import { useTranslation } from "react-i18next";
const Welcome = () => {
  const [currentDate, setCurrentDate] = useState("");
  const [greeting, setGreeting] = useState("");

  const [t] = useTranslation();
  const localData = useLocalStorage("userData", "get");
  const formatDate = (date) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "Asia/Kolkata",
    };
    return date.toLocaleDateString("en-US", options);
  };

  const getCurrentTimeInIST = () => {
    const now = new Date();
    const utcOffset = now.getTimezoneOffset() * 60000;
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istTime = new Date(now.getTime() + utcOffset + istOffset);
    return istTime;
  };

  const updateDateAndGreeting = () => {
    const istTime = getCurrentTimeInIST();
    setCurrentDate(formatDate(istTime));

    const currentHour = istTime.getHours();
    if (currentHour < 12) {
      setGreeting("Good Morning");
    } else if (currentHour < 18) {
      setGreeting("Good Afternoon");
    } else if (currentHour < 21) {
      setGreeting("Good Evening");
    } else {
      setGreeting("Good Night");
    }
  };

  useEffect(() => {
    updateDateAndGreeting();

    const istTime = getCurrentTimeInIST();
    const millisTillMidnight =
      new Date(
        istTime.getFullYear(),
        istTime.getMonth(),
        istTime.getDate() + 1,
        0,
        0,
        0,
      ) - istTime;

    const timeoutId = setTimeout(() => {
      updateDateAndGreeting();

      setInterval(updateDateAndGreeting, 24 * 60 * 60 * 1000);
    }, millisTillMidnight);

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div>
      <div className="welcome_wrp" id="welcome_wrp">
        <div className="col-md-12 col-sm-12">
          <div className="d-flex justify-content-between align-items-center flex-wrap">
            <div>
              <h2>{t(greeting)} 👋</h2>
              <h3>{currentDate}</h3>
              <h1>
                {t("Welcome Back!")} {localData?.Username}
              </h1>
              <p></p>
            </div>

            <div>
              <img src={Img} alt={t("Welcome Image")} width={"137px"} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
