import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./WelcomePage.css";
import welcomeImage from "../../assets/image/welcomimg.png";
import Loading from "../../components/loader/Loading";
import { formatDate } from "../../utils/helpers";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import RazorPay from "../../Frontend/Payment/RazorPay";
import QrCodeDropdown from "../../layouts/header/qrcode-dropdown/QrCodeDropdown";
import { axiosInstance } from "../../utils/axiosInstance";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import MachineBreakDownModal from "./MachineBreakDownModal/MachineBreakDownModal";
import ClientExpiryModal from "./ClientExpiryModal";
import ForceChangePasswordModal from "./ForceChangePasswordModal";
import { toast } from "react-toastify";
import { getAccessDataRate } from "../../utils/NetworkApi/commonApi";
import { logOut } from "../../utils/axiosInstance";

const Welcome = () => {
  const { t } = useTranslation();
  const userData = useLocalStorage("userData", "get");
  const FirstName = userData?.FirstName;
  const AllowTRFUploadAndScan = userData?.AllowTRFUploadAndScan;
  const navigate = useNavigate();
  const location = useLocation();
  const [showForceChangePassword, setShowForceChangePassword] = useState(
    new URLSearchParams(location.search).get("forceChangePassword") === "true"
  );
  const [details, setDetails] = useState({});
  const [CentreData, setCentreData] = useState([]);
  const [RateTypeData, setRateTypeData] = useState([]);
  const [SelectedCentre, setSelectedCentre] = useState(
    useLocalStorage("DefaultCentre", "get")
  );
  const [SelectedRateType, setSelectedRateType] = useState("");
  const [themeColor, setThemeColor] = useState("white");
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [machineMsg, setMachineMsg] = useState("");
  const [showMachineModal, setShowMachineModal] = useState(false);
  const [showExpiryModal, setShowExpiryModal] = useState(false);
  const [expiryData,      setExpiryData]      = useState([]);
  const [expiryMessage,   setExpiryMessage]   = useState('');

  const getColor = () => {
    const theme = localStorage.getItem("Theme");
    const colors = {
      Default: "lightblue",
      "light Green": "lightgreen",
      Peach: "#ffdab9",
      "Pale Pink": "pink",
      Red: "#FFCCCB",
      "Sky Blue": "#7CB9E8",
      Grey: "lightgrey",
    };
    return colors[theme] || "white";
  };

  const getEmployeeDetails = async () => {
    try {
      const response = await axios.get("api/v1/Employee/WelcomeDetails");
      setDetails(response?.data?.message[0] || {});
    } catch (error) {
      console.error("Error fetching employee details:", error);
    } finally {
      setLoading(false);
    }
  };


  const getAccessCentres = () => {
    setLoading(true);

    axiosInstance
      .get("Centre/getAccessCentres")
      .then((res) => {
        setLoading(true);
        let data = res.data.message;
        let CentreDataValue = data.map((ele) => {
          return {
            value: ele.CentreID,
            label: ele.Centre,
            B2B: ele.BTB,
            Image: ele.awsKey || ele.awsKeySubpcc || "",
            SUBPCC: ele.SUBPCC,
          };
        });
        setCentreData(CentreDataValue);
        setLoading(false);
      })
      .catch((err) => {
        console.log({ err });
        setLoading(false);
      });
  };
  const DesignationName = useLocalStorage("userData", "get")?.DesignationName;
  useEffect(() => {
    setThemeColor(getColor());
    getEmployeeDetails();
    getAccessCentres();
  }, []);

  useEffect(() => {
    if (SelectedCentre) {
      getAccessDataRate(setRateTypeData, SelectedCentre).then((res) => {
        if (res.length > 0) {
          setSelectedRateType(res[0].value);
        }
      });
    }
  }, [SelectedCentre]);

  useEffect(() => {
    axiosInstance
      .get("MachineGroup/SearchMachineBreakdownMarque")
      .then((res) => {
        const messages =
          res?.data?.data?.map((item) => item.WarningMessage) || [];

        setMachineMsg(messages);

        if (messages.length > 0) {
          setShowMachineModal(true);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  console.log({ userData });

  useEffect(() => {
    if (userData?.ShowClientNearToExpiry == 1) {
      axiosInstance.get('CommonController/GetClientContractDays')
        .then((res) => {
          const list = res?.data?.data;
          if (res?.data?.success && Array.isArray(list) && list.length > 0) {
            setExpiryData(list);
            setExpiryMessage(res.data.message || '');
            setShowExpiryModal(true);
          }
        })
        .catch(() => {});
    }
  }, []);

  const centreId = useLocalStorage("DefaultCentre", "get");
  const showQRIcon = CentreData?.find((ele) => ele?.value === centreId);

  // Shared by both the gallery-picker input and the camera-capture input —
  // same upload/save flow either way, just a different source for the files.
  const handleTrfFiles = async (fileList) => {
    const files = Array.from(fileList || []);
    if (files.length === 0) return;
    if (!SelectedCentre || !SelectedRateType) {
      toast.warn(t("Please select Centre and Rate Type"));
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append("CentreID", SelectedCentre || 0);
    formData.append("RateTypeID", SelectedRateType || 0);
    files.forEach((file) => {
      formData.append("KeyFiles", file);
    });

    try {
      const response = await axiosInstance.post(
        "PreRegistration/SaveTrfWithFiles",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      if (response.data.success) {
        const readers = files.map((file) => {
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(file);
          });
        });

        const base64Images = await Promise.all(readers);
        sessionStorage.setItem(
          "pendingTRFs",
          JSON.stringify(base64Images),
        );

        toast.success(t("TRF Uploaded Successfully"));
      } else {
        toast.error(t(response?.data?.message));
      }
    } catch (err) {
      console.error(err);
      toast.error(t("Upload failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  // In-browser camera capture (getUserMedia) — works on desktop too, unlike
  // the file input's capture="environment" hint, which only OS-integrates
  // with an actual camera app on mobile and just opens the plain file
  // picker on desktop (nothing else to hand off to there).
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStarting, setCameraStarting] = useState(false);
  const videoRef = useRef(null);
  const cameraStreamRef = useRef(null);

  const stopCameraStream = () => {
    cameraStreamRef.current?.getTracks()?.forEach((track) => track.stop());
    cameraStreamRef.current = null;
  };

  const openCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error(t("Camera is not supported on this browser."));
      return;
    }
    setCameraStarting(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      cameraStreamRef.current = stream;
      setShowCamera(true);
    } catch (err) {
      console.error(err);
      toast.error(t("Unable to access camera. Please check camera permissions."));
    } finally {
      setCameraStarting(false);
    }
  };

  const closeCamera = () => {
    stopCameraStream();
    setShowCamera(false);
  };

  // Attach the stream once the <video> element is actually mounted (it
  // isn't yet at the moment getUserMedia resolves, since setShowCamera
  // hasn't re-rendered the component onto the DOM at that point).
  useEffect(() => {
    if (showCamera && videoRef.current && cameraStreamRef.current) {
      videoRef.current.srcObject = cameraStreamRef.current;
    }
  }, [showCamera]);

  // Stop the camera if the component unmounts while it's still open.
  useEffect(() => stopCameraStream, []);

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        closeCamera();
        if (blob) {
          const file = new File([blob], `trf-capture-${Date.now()}.jpg`, {
            type: "image/jpeg",
          });
          handleTrfFiles([file]);
        }
      },
      "image/jpeg",
      0.92,
    );
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <ForceChangePasswordModal
        show={showForceChangePassword}
        onSuccess={() => {
          setShowForceChangePassword(false);
          logOut();
        }}
        onCancel={() => {
          setShowForceChangePassword(false);
          navigate("/Welcome", { replace: true });
        }}
      />
      {
      <MachineBreakDownModal
        show={showMachineModal}
        onHide={setShowMachineModal}
        Data={machineMsg}
      />
    }
      {showExpiryModal && userData?.DesignationName === "Accounts" && (
        <ClientExpiryModal
          data={expiryData}
          message={expiryMessage}
          onClose={() => setShowExpiryModal(false)}
        />
      )}
      {showCamera && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 2000,
            background: "rgba(0,0,0,0.85)",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: "16px",
          }}
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{ maxWidth: "90vw", maxHeight: "70vh", borderRadius: "8px", background: "#000" }}
          />
          <div style={{ display: "flex", gap: "12px" }}>
            <button className="btn trf-upload-btn" onClick={capturePhoto}>
              <i className="fa fa-camera mr-2"></i>
              {t("Capture")}
            </button>
            <button className="btn btn-secondary" onClick={closeCamera}>
              <i className="fa fa-times mr-2"></i>
              {t("Cancel")}
            </button>
          </div>
        </div>
      )}
      <RazorPay />
      <div onClick={() => setDropdownOpen(false)} className="welcomemain-div">
        <div
          className="welcome-maincontainercls"
          style={{ backgroundColor: themeColor }}
        >

          <div className="welcome-content">

            <h1 className="welcome-heading welcomePage">
              {t("Welcome")} {FirstName || "User"}
            </h1>
            <div className="ml-1 row">
              <p className="welcome-subheading welcomePage">
                {t("Employee Details")}
              </p>
              <div className="mt-2 ml-4">
                <QrCodeDropdown
                  setDropdownOpen={setDropdownOpen}
                  dropdownOpen={dropdownOpen}
                  showQRIcon={showQRIcon}
                  className="mt"
                  DesignationName={DesignationName}
                />
              </div>
            </div>
            {/* <p className="welcome-textHeading ">
              {t("Designation")}&nbsp;:{" "}
              <span className="welcome-textdisplay welcomePage">
                {details.Designation || "Not Available"}
              </span>
            </p> */}

            <p className="welcome-textHeading">
              {t("Current Login Time")}&nbsp;:{" "}
              <span className="welcome-textdisplay welcomePage">
                {details.LoginTime ? details.LoginTime : "Not Available"}
              </span>
            </p>

            <p className="welcome-textHeading">
              {t("Last Logout Time")}&nbsp;:{" "}
              <span className="welcome-textdisplay welcomePage">
                {details.LogoutTime ? details.LogoutTime : "Not Available"}
              </span>
            </p>

            {AllowTRFUploadAndScan==1&&<div className="trf-upload-container-integrated">
              <div className="trf-upload-header">
                <i className="fa fa-cloud-upload"></i>
                <span>{t("Quick TRF Upload")}</span>
              </div>
              
              <div className="row trf-upload-row">
                <div className="col-12 col-sm-6">
                  <label className="trf-label">{t("Centre")}</label>
                  <select
                    className="form-control trf-select"
                    value={SelectedCentre}
                    onChange={(e) => setSelectedCentre(e.target.value)}
                  >
                    <option value="">{t("Select Centre")}</option>
                    {CentreData.map((ele) => (
                      <option key={ele.value} value={ele.value}>
                        {ele.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-12 col-sm-6 mt-2 mt-sm-0">
                  <label className="trf-label">{t("Rate Type")}</label>
                  <select
                    className="form-control trf-select"
                    value={SelectedRateType}
                    onChange={(e) => setSelectedRateType(e.target.value)}
                  >
                    <option value="">{t("Select Rate Type")}</option>
                    {RateTypeData.map((ele) => (
                      <option key={ele.value} value={ele.value}>
                        {ele.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <input
                type="file"
                id="trf-upload"
                multiple
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => handleTrfFiles(e.target.files)}
              />
              <div style={{ display: "flex", justifyContent: "center", marginTop: "10px" }}>
              <button
                className="btn trf-upload-btn"
                onClick={() => document.getElementById("trf-upload").click()}
              >
                <i className="fa fa-image mr-2"></i>
                {t("Upload TRF Images")}
              </button>
              <button
                className="btn trf-upload-btn ml-2"
                onClick={openCamera}
                disabled={cameraStarting}
              >
                <i className="fa fa-camera mr-2"></i>
                {cameraStarting ? t("Starting Camera...") : t("Take Photo")}
              </button>
              </div>
            </div>}
          </div>
          <div className="welcome-img">
            <img src={welcomeImage} alt="Welcome" />
          </div>
        </div>
      </div>
    </>
  );
};

export default Welcome;
