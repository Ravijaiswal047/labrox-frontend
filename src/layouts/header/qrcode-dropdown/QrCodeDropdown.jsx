import { Tooltip } from "primereact/tooltip";
import { useRef } from "react";

import { useTranslation } from "react-i18next";
const QrCodeDropdown = ({
  dropdownOpen,
  setDropdownOpen,
  showQRIcon,
  isMobile,
  DesignationName,
}) => {
  const [t] = useTranslation();

  const dropdownRef = useRef(null);
  const qrImage = showQRIcon?.Image || showQRIcon?.awsKeySubpcc || "";
  return (
    <div>
      {!isMobile &&
      showQRIcon &&
      qrImage != "" &&
      ((DesignationName == "B2B" && showQRIcon?.B2B == "1") ||
        (DesignationName == "SUB PCC" && showQRIcon?.SUBPCC == "1")) ? (
        <div
          style={{
            width: "30px",
            height: "24px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: "6px",
            cursor: "pointer",
            marginLeft: "25px",
          }}
          onClick={(e) => {
            e.stopPropagation();
            setDropdownOpen(!dropdownOpen);
          }}
        >
          <Tooltip target=".bi-qr-code-scan" />
          <i
            className="bi bi-qr-code-scan sizeqr"
            data-pr-position="top"
            data-pr-tooltip={t("Click to Open QR Code")}
            aria-hidden="true"
          ></i>
        </div>
      ) : (
        ""
      )}
      {dropdownOpen ? (
        <div
          className="manage_usermodel bg-color-container"
          style={{
            position: "absolute",
            right: "20px",
            zIndex: 100,
            height: "275px",
            borderRadius: "10px",
          }}
          ref={dropdownRef}
        >
          {/* <div style={{ textAlign: "center" }}>
            <label className="QRlabel mt-1">Scan QR Code</label>
          </div> */}

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <img
              src={`https://elabassets.s3.ap-south-1.amazonaws.com/${showQRIcon?.Image}`}
              alt="QR Code"
              style={{
                backgroundColor: "white",
                width: "215px",
                height: "235px",
                marginTop: "18px",
                boxShadow: "0px 4px 6px rgba(10, 10, 10, 0.87)",
              }}
            />
          </div>
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

export default QrCodeDropdown;
