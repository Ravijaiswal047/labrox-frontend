import React, { useState, useEffect, useRef } from "react";
import { Tooltip } from "primereact/tooltip";
import { useTranslation } from "react-i18next";
import { notify } from "../../../utils/utils";
import { axiosInstance } from "../../../utils/axiosInstance";
import { apiUrls } from "../../../utils/apiUrls";
import { useLocalStorage } from "../../../utils/hooks/useLocalStorage";
import { useLanguage } from "../../../ContextApi/ContextApi";

const HandleFontSize = () => {
  const [isOpen, setIsOpen] = useState(false);
  const useData = useLocalStorage("userData", "get");
  const [FontSize, setFontSize] = useState(
    Number(useData?.applicationFont || 13),
  );
  const [t] = useTranslation();
  const dropdownRef = useRef(null);
  const isInitialMount = useRef(true);
  const activeClassName = (fs) => {
    if (fs === FontSize)
      return "small text-muted pointer-cursor activeFont bg-color-container text-white";
    else return "small text-muted cursor-pointer";
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRangeChange = (e) => {
    const newSize = parseInt(e?.target?.value, 10);
    setFontSize(newSize);
  };
  // Pehle wala useEffect - sirf CSS set karo (API call nahi)
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--app-font-size",
      `${FontSize}px`,
    );
    const height = Math.max(28, FontSize * 2);
    document.documentElement.style.setProperty(
      "--control-height",
      height + "px",
    );
  }, []); // Sirf mount pe chalega - initial CSS apply karega

  // Doosra useEffect - sirf user change pe API call
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // CSS update
    document.documentElement.style.setProperty(
      "--app-font-size",
      `${FontSize}px`,
    );
    const height = Math.max(28, FontSize * 2);
    document.documentElement.style.setProperty(
      "--control-height",
      height + "px",
    );

    // API call
    const handleResize = async () => {
      try {
        const userData = useLocalStorage("userData", "get");
        const currentTheme = useLocalStorage("theme", "get");
        const payload = {
          type: "FontSize",
          fontSize: FontSize,
          theme: currentTheme || userData?.Theme || "",
          menuDirection: userData?.MenuDirection || "",
        };
        const apiResp = await axiosInstance.post(
          apiUrls?.ChangeFontSize,
          payload,
        );
        if (apiResp?.data?.success) {
          notify(apiResp?.data?.message, "success");
          useLocalStorage("userData", "set", {
            ...userData,
            applicationFont: String(FontSize),
          });
        } else {
          notify(
            apiResp?.data?.message || "Failed to update font size",
            "error",
          );
        }
      } catch (error) {
        notify(
          error?.response?.data?.message || "Error updating font size",
          "error",
        );
      }
    };

    handleResize();
  }, [FontSize]);

  //   useEffect(() => {
  //   if (isInitialMount.current) {
  //     isInitialMount.current = false;
  //     return;
  //   }

  //   document.documentElement.style.setProperty(
  //     "--app-font-size",
  //     `${FontSize}px`
  //   );

  //   const height = Math.max(28, FontSize * 2);
  //   document.documentElement.style.setProperty(
  //     "--control-height",
  //     height + "px"
  //   );

  //   const handleResize = async () => {
  //     try {
  //       const userData = useLocalStorage("userData", "get");
  //       const currentTheme = useLocalStorage("theme", "get");

  //       const payload = {
  //         type: "FontSize",
  //         fontSize: FontSize,
  //         theme: currentTheme || userData?.Theme || "",
  //         menuDirection: userData?.MenuDirection || "",
  //       };

  //       const apiResp = await axiosInstance.post(
  //         apiUrls?.ChangeFontSize,
  //         payload
  //       );

  //       if (apiResp?.data?.success) {
  //         notify(apiResp?.data?.message, "success");
  //         useLocalStorage("userData", "set", {
  //           ...userData,
  //           applicationFont: String(FontSize),
  //         });
  //       } else {
  //         notify(apiResp?.data?.message || "Failed to update font size", "error");
  //       }
  //     } catch (error) {
  //       notify(
  //         error?.response?.data?.message || "Error updating font size",
  //         "error"
  //       );
  //     }
  //   };

  //   handleResize();
  // }, [FontSize]);

  return (
    <>
      <div className="font-size-picker" ref={dropdownRef}>
        <li className="nav-item d-md-flex px-1">
          <div type="button">
            <Tooltip target=".fa-home" />
            <i
              className="fa fa-search-plus text-white"
              aria-hidden="true"
              data-pr-tooltip={t("Select Font Size")}
              data-pr-position="bottom"
              onClick={() => setIsOpen(!isOpen)}
              style={{
                cursor: "pointer",
                padding: "0",
              }}
            ></i>
          </div>
        </li>
        {isOpen && (
          <div className="font-size-dropdown">
            <div className="dropdown-header bg-color-container">
              <strong className="text-white">Font Size</strong>
              <strong className="text-white px-3">{FontSize}px</strong>
            </div>
            <div className="range-container">
              <div className="range-labels">
                <span
                  className={`${activeClassName(9)}`}
                  onClick={() => {
                    setFontSize(9);
                  }}
                >
                  9px
                </span>
                <span
                  className={`${activeClassName(10)}`}
                  onClick={() => {
                    setFontSize(10);
                  }}
                >
                  10px
                </span>
                <span
                  className={`${activeClassName(11)}`}
                  onClick={() => {
                    setFontSize(11);
                  }}
                >
                  11px
                </span>
                <span
                  className={`${activeClassName(12)}`}
                  onClick={() => {
                    setFontSize(12);
                  }}
                >
                  12px
                </span>
                <span
                  className={`${activeClassName(13)}`}
                  onClick={() => {
                    setFontSize(13);
                  }}
                >
                  13px
                </span>
                <span
                  className={`${activeClassName(14)}`}
                  onClick={() => {
                    setFontSize(14);
                  }}
                >
                  14px
                </span>
                <span
                  className={`${activeClassName(15)}`}
                  onClick={() => {
                    setFontSize(15);
                  }}
                >
                  15px
                </span>
                <span
                  className={`${activeClassName(16)}`}
                  onClick={() => {
                    setFontSize(16);
                  }}
                >
                  16px
                </span>
                <span
                  className={`${activeClassName(17)}`}
                  onClick={() => {
                    setFontSize(17);
                  }}
                >
                  17px
                </span>
              </div>
              <input
                type="range"
                className="my-2"
                min="9"
                max="17"
                disabled={true}
                value={FontSize}
                onChange={handleRangeChange}
              />
              <div
                className="preview-text"
                style={{ fontSize: `${FontSize}px` }}
              >
                Sample Text
              </div>
            </div>
          </div>
        )}
        <style jsx>{`
          .font-size-picker {
            position: relative;
            display: inline-block;
            font-size: 12px !important;
          }

          .font-size-trigger {
            display: flex;
            align-items: center;
            padding: 0.5rem 1rem;
            border-radius: 0.375rem;
            transition: all 0.2s ease;
          }

          .font-size-trigger:hover {
            background-color: #f8f9fa;
            border-color: #6c757d;
          }

          .font-size-dropdown {
            position: absolute;
            top: calc(100% + 0.65rem);
            left: -120px;
            background: white;
            border: 1px solid #dee2e6;
            border-radius: 0.5rem;
            box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
            padding: 2px 5px 0px 4px;
            border-radius: 4px;
            min-width: 380px;
            z-index: 1000;
            animation: slideDown 0.2s ease;
          }

          .activeFont {
            font-weight: 900;
            border-radius: 4px;
            padding: 0px 3px 0px 2px;
          }

          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .dropdown-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
            padding-bottom: 0.75rem;
            border-bottom: 1px solid #e9ecef;
            border-radius: 0.375rem 0.375rem 0 0;
          }

          .range-container {
            padding: 0.5rem 0.5rem;
          }

          .range-labels {
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.5rem;
            cursor: pointer;
          }

          .custom-range {
            width: 100%;
            margin-bottom: 1rem;
          }
          .custom-range:focus {
            outline: none;
            box-shadow: none;
          }

          .preview-text {
            text-align: center;
            padding: 0.75rem;
            background: #f8f9fa;
            border-radius: 0.375rem;
            color: #212529;
            font-weight: 500;
            transition: font-size 0.15s ease;
          }
        `}</style>
      </div>
    </>
  );
};

export default HandleFontSize;
