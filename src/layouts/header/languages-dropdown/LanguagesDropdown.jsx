import { StyledDropdown } from "@app/styles/common";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import { setMenuSettingLanguageToggle } from "../../../store/reducers/loadingSlice/loadingSlice";
import { useLocalStorage } from "../../../utils/hooks/useLocalStorage";
import { axiosInstance } from "../../../utils/axiosInstance";
import { useLanguageFetcher } from "../../../utils/hooks/useLanguageFetcher";
import { useLanguage } from "../../../ContextApi/ContextApi";

const LanguagesDropdown = () => {
  const dispatch = useDispatch();
  const { i18n } = useTranslation();
  const { fetchLanguage } = useLanguageFetcher();
  const { languageList, currentLanguage, updateLanguage } = useLanguage();
  const { menuSettingLanguage } = useSelector((state) => state.loadingSlice);

  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    setDropdownOpen(menuSettingLanguage);
  }, [menuSettingLanguage]);

  const handleLanguageSelect = async (language) => {
    try {
      const userData = useLocalStorage("userData", "get");
      if (!userData?.EmployeeID) {
        toast.error("User data not found");
        return;
      }

      updateLanguage(language.key);

      await fetchLanguage({ key: language.key, label: language.label });
      await i18n.changeLanguage(language.key);

      await axiosInstance.post("LanguageMaster/UpdateLangauge", {
        EmpLanguageCode: language.id?.toString(),
        EmpLanguage: language.label,
        EmployeeID: userData?.EmployeeID?.toString(),
      });

      toast.success("Language updated");
      dispatch(setMenuSettingLanguageToggle(false));
    } catch (error) {
      console.error("Error updating language:", error);
      toast.error("Failed to change language");
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <StyledDropdown isOpen={dropdownOpen} hideArrow>
        {/* HEADER - Display the selected language flag */}
        <div
          className="nav-link"
          slot="head"
          style={{ cursor: "pointer" }}
          onClick={() => dispatch(setMenuSettingLanguageToggle(!dropdownOpen))}
        >
          {currentLanguage?.icon ? (
            <img
              src={currentLanguage.icon}
              width={20}
              height={15}
              alt={currentLanguage.label}
              style={{ borderRadius: "2px" }}
            />
          ) : (
            <i className="flag-icon fi fi-us" />
          )}
        </div>

        {/* DROPDOWN BODY */}
        <div
          slot="body"
          style={{
            position: "absolute",
            top: "-15px",
            left: "120px",
            zIndex: 9999,
            background: "#fff",
            borderRadius: "3px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            minWidth: "140px",
            padding: "1px",
            display: dropdownOpen ? "block" : "none",
          }}
        >
          <div
            style={{
              maxHeight: "260px",
              overflowY: "auto",
              padding: "4px 0",
            }}
          >
            {languageList.map((language) => {
              const isActive = currentLanguage?.key === language.key;

              return (
                <div
                  key={language.id}
                  onClick={() => handleLanguageSelect(language)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "4px 8px",
                    cursor: "pointer",
                    fontSize: "14px",
                    backgroundColor: isActive ? "#007bff" : "transparent",
                    color: isActive ? "#fff" : "#212529",
                    fontWeight: isActive ? "600" : "400",
                  }}
                >
                  <img
                    src={language.icon}
                    width={20}
                    height={15}
                    alt={language.label}
                    style={{
                      flexShrink: 0,
                      objectFit: "contain",
                      borderRadius: "2px",
                    }}
                  />
                  <span>{language.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </StyledDropdown>
    </div>
  );
};

export default LanguagesDropdown;
